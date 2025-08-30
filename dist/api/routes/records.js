"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const database_1 = require("../../config/database");
const redis_1 = require("../../config/redis");
const rateLimiter_1 = require("../../services/airtable/rateLimiter");
const batcher_1 = require("../../services/airtable/batcher");
const client_1 = require("../../services/airtable/client");
const router = (0, express_1.Router)();
const prisma = (0, database_1.getPrismaClient)();
const redis = (0, redis_1.getRedisClient)();
// Initialize services
const rateLimiter = new rateLimiter_1.AirtableRateLimiter(redis, prisma);
const batcher = new batcher_1.AirtableBatcher(redis, prisma);
const airtableClient = new client_1.AirtableClient(prisma);
// Validation schemas
const createRecordSchema = zod_1.z.object({
    fields: zod_1.z.record(zod_1.z.any())
});
const updateRecordSchema = zod_1.z.object({
    id: zod_1.z.string(),
    fields: zod_1.z.record(zod_1.z.any())
});
const batchCreateSchema = zod_1.z.object({
    records: zod_1.z.array(createRecordSchema).min(1).max(10)
});
const batchUpdateSchema = zod_1.z.object({
    records: zod_1.z.array(updateRecordSchema).min(1).max(10)
});
const batchDeleteSchema = zod_1.z.object({
    recordIds: zod_1.z.array(zod_1.z.string()).min(1).max(10)
});
const querySchema = zod_1.z.object({
    filterByFormula: zod_1.z.string().optional(),
    sort: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string(),
        direction: zod_1.z.enum(['asc', 'desc']).optional()
    })).optional(),
    fields: zod_1.z.array(zod_1.z.string()).optional(),
    maxRecords: zod_1.z.number().int().positive().max(100).optional(),
    pageSize: zod_1.z.number().int().positive().max(100).optional(),
    offset: zod_1.z.string().optional(),
    view: zod_1.z.string().optional()
});
// Batch create records
router.post('/:baseId/tables/:tableId/records', async (req, res, next) => {
    try {
        const { baseId, tableId } = req.params;
        const validatedData = batchCreateSchema.parse(req.body);
        // Check if base exists and is active
        const base = await prisma.airtableBase.findUnique({
            where: { baseId, isActive: true }
        });
        if (!base) {
            return res.status(404).json({
                error: 'Base not found or inactive',
                baseId
            });
        }
        // Check rate limit
        const hasToken = await rateLimiter.acquireToken(baseId);
        if (!hasToken) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                baseId,
                retryAfter: 60 // seconds
            });
        }
        // Add operations to batch queue
        const operations = validatedData.records.map((record, index) => ({
            id: `${Date.now()}-${index}`,
            type: 'create',
            baseId,
            tableId,
            data: record.fields,
            priority: 1,
            timestamp: Date.now()
        }));
        const batchResults = await Promise.all(operations.map(op => batcher.addToQueue(op)));
        // If batch is full, process immediately
        const totalInBatch = batchResults.reduce((sum, result) => sum + result.queuePosition, 0);
        if (totalInBatch >= 10) {
            await batcher.flushBatch(baseId, tableId, 'create');
        }
        return res.status(202).json({
            message: 'Records queued for creation',
            batchId: batchResults[0]?.batchId,
            operations: operations.length,
            estimatedWaitTime: Math.max(...batchResults.map(r => r.estimatedWaitTime)),
            queuePosition: totalInBatch
        });
    }
    catch (error) {
        return next(error);
    }
});
// Batch update records
router.put('/:baseId/tables/:tableId/records', async (req, res, next) => {
    try {
        const { baseId, tableId } = req.params;
        const validatedData = batchUpdateSchema.parse(req.body);
        // Check if base exists and is active
        const base = await prisma.airtableBase.findUnique({
            where: { baseId, isActive: true }
        });
        if (!base) {
            return res.status(404).json({
                error: 'Base not found or inactive',
                baseId
            });
        }
        // Check rate limit
        const hasToken = await rateLimiter.acquireToken(baseId);
        if (!hasToken) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                baseId,
                retryAfter: 60
            });
        }
        // Add operations to batch queue
        const operations = validatedData.records.map((record, index) => ({
            id: `${Date.now()}-${index}`,
            type: 'update',
            baseId,
            tableId,
            data: record.fields,
            recordId: record.id,
            priority: 2, // Higher priority for updates
            timestamp: Date.now()
        }));
        const batchResults = await Promise.all(operations.map(op => batcher.addToQueue(op)));
        // If batch is full, process immediately
        const totalInBatch = batchResults.reduce((sum, result) => sum + result.queuePosition, 0);
        if (totalInBatch >= 10) {
            await batcher.flushBatch(baseId, tableId, 'update');
        }
        return res.status(202).json({
            message: 'Records queued for update',
            batchId: batchResults[0]?.batchId,
            operations: operations.length,
            estimatedWaitTime: Math.max(...batchResults.map(r => r.estimatedWaitTime)),
            queuePosition: totalInBatch
        });
    }
    catch (error) {
        return next(error);
    }
});
// Batch delete records
router.delete('/:baseId/tables/:tableId/records', async (req, res, next) => {
    try {
        const { baseId, tableId } = req.params;
        const validatedData = batchDeleteSchema.parse(req.body);
        // Check if base exists and is active
        const base = await prisma.airtableBase.findUnique({
            where: { baseId, isActive: true }
        });
        if (!base) {
            return res.status(404).json({
                error: 'Base not found or inactive',
                baseId
            });
        }
        // Check rate limit
        const hasToken = await rateLimiter.acquireToken(baseId);
        if (!hasToken) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                baseId,
                retryAfter: 60
            });
        }
        // Add operations to batch queue
        const operations = validatedData.recordIds.map((recordId, index) => ({
            id: `${Date.now()}-${index}`,
            type: 'delete',
            baseId,
            tableId,
            recordId,
            priority: 3, // Highest priority for deletes
            timestamp: Date.now()
        }));
        const batchResults = await Promise.all(operations.map(op => batcher.addToQueue(op)));
        // If batch is full, process immediately
        const totalInBatch = batchResults.reduce((sum, result) => sum + result.queuePosition, 0);
        if (totalInBatch >= 10) {
            await batcher.flushBatch(baseId, tableId, 'delete');
        }
        return res.status(202).json({
            message: 'Records queued for deletion',
            batchId: batchResults[0]?.batchId,
            operations: operations.length,
            estimatedWaitTime: Math.max(...batchResults.map(r => r.estimatedWaitTime)),
            queuePosition: totalInBatch
        });
    }
    catch (error) {
        return next(error);
    }
});
// Query records (with caching)
router.get('/:baseId/tables/:tableId/records', async (req, res, next) => {
    try {
        const { baseId, tableId } = req.params;
        const validatedData = querySchema.parse(req.query);
        // Check if base exists and is active
        const base = await prisma.airtableBase.findUnique({
            where: { baseId, isActive: true }
        });
        if (!base) {
            return res.status(404).json({
                error: 'Base not found or inactive',
                baseId
            });
        }
        // Check rate limit
        const hasToken = await rateLimiter.acquireToken(baseId);
        if (!hasToken) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                baseId,
                retryAfter: 60
            });
        }
        // Generate cache key
        const queryHash = JSON.stringify({ tableId, ...validatedData });
        const cacheKey = `query:${baseId}:${tableId}:${Buffer.from(queryHash).toString('base64')}`;
        // Check cache first
        const cachedResult = await redis.get(cacheKey);
        if (cachedResult) {
            const parsed = JSON.parse(cachedResult);
            return res.json({
                ...parsed,
                cached: true,
                cacheTimestamp: new Date().toISOString()
            });
        }
        // Query Airtable
        const result = await airtableClient.queryRecords(baseId, tableId, {
            ...(validatedData.filterByFormula && { filterByFormula: validatedData.filterByFormula }),
            ...(validatedData.sort && {
                sort: validatedData.sort.map(s => ({
                    field: s.field,
                    direction: s.direction || 'asc'
                }))
            }),
            ...(validatedData.fields && { fields: validatedData.fields }),
            ...(validatedData.maxRecords && { maxRecords: validatedData.maxRecords }),
            ...(validatedData.pageSize && { pageSize: validatedData.pageSize }),
            ...(validatedData.view && { view: validatedData.view })
        });
        // Cache the result
        const cacheData = {
            ...result,
            cached: false,
            timestamp: new Date().toISOString()
        };
        await redis.setex(cacheKey, 300, JSON.stringify(cacheData)); // Cache for 5 minutes
        return res.json(cacheData);
    }
    catch (error) {
        return next(error);
    }
});
// Get single record
router.get('/:baseId/tables/:tableId/records/:recordId', async (req, res, next) => {
    try {
        const { baseId, tableId, recordId } = req.params;
        // Check if base exists and is active
        const base = await prisma.airtableBase.findUnique({
            where: { baseId, isActive: true }
        });
        if (!base) {
            return res.status(404).json({
                error: 'Base not found or inactive',
                baseId
            });
        }
        // Check rate limit
        const hasToken = await rateLimiter.acquireToken(baseId);
        if (!hasToken) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                baseId,
                retryAfter: 60
            });
        }
        // Get record from Airtable
        const record = await airtableClient.getRecord(baseId, tableId, recordId);
        return res.json({
            record,
            cached: false,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        return next(error);
    }
});
// Get batch status
router.get('/:baseId/tables/:tableId/batch/:operationType/status', async (req, res, next) => {
    try {
        const { baseId, tableId, operationType } = req.params;
        // Check if base exists and is active
        const base = await prisma.airtableBase.findUnique({
            where: { baseId, isActive: true }
        });
        if (!base) {
            return res.status(404).json({
                error: 'Base not found or inactive',
                baseId
            });
        }
        // Get batch status
        const status = await batcher.getBatchStatus(baseId, tableId, operationType);
        return res.json({
            baseId,
            tableId,
            operationType,
            status
        });
    }
    catch (error) {
        return next(error);
    }
});
// Get rate limit status
router.get('/:baseId/rate-limit/status', async (req, res, next) => {
    try {
        const { baseId } = req.params;
        // Check if base exists
        const base = await prisma.airtableBase.findUnique({
            where: { baseId }
        });
        if (!base) {
            return res.status(404).json({
                error: 'Base not found',
                baseId
            });
        }
        // Get rate limit metrics
        const metrics = await rateLimiter.getMetrics(baseId);
        const queueDepth = await rateLimiter.getQueueDepth(baseId);
        return res.json({
            baseId,
            rateLimit: {
                requestsPerMinute: metrics.requestsPerMinute,
                limit: base.rateLimitRpm,
                remaining: Math.max(0, base.rateLimitRpm - metrics.requestsPerMinute),
                resetTime: metrics.lastResetTime
            },
            queue: {
                depth: queueDepth,
                averageResponseTime: metrics.averageResponseTime,
                errorRate: metrics.errorRate
            }
        });
    }
    catch (error) {
        return next(error);
    }
});
exports.default = router;
//# sourceMappingURL=records.js.map