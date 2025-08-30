import { Router } from 'express';
import { z } from 'zod';
import { getPrismaClient } from '../../config/database';
import { getRedisClient } from '../../config/redis';
import { AirtableRateLimiter } from '../../services/airtable/rateLimiter';
import { AirtableBatcher } from '../../services/airtable/batcher';
import { AirtableClient } from '../../services/airtable/client';


const router = Router();
const prisma = getPrismaClient();
const redis = getRedisClient();

// Initialize services
const rateLimiter = new AirtableRateLimiter(redis, prisma);
const batcher = new AirtableBatcher(redis, prisma);
const airtableClient = new AirtableClient(prisma);

// Validation schemas
const createRecordSchema = z.object({
  fields: z.record(z.any())
});

const updateRecordSchema = z.object({
  id: z.string(),
  fields: z.record(z.any())
});

const batchCreateSchema = z.object({
  records: z.array(createRecordSchema).min(1).max(10)
});

const batchUpdateSchema = z.object({
  records: z.array(updateRecordSchema).min(1).max(10)
});

const batchDeleteSchema = z.object({
  recordIds: z.array(z.string()).min(1).max(10)
});

const querySchema = z.object({
  filterByFormula: z.string().optional(),
  sort: z.array(z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc']).optional()
  })).optional(),
  fields: z.array(z.string()).optional(),
  maxRecords: z.number().int().positive().max(100).optional(),
  pageSize: z.number().int().positive().max(100).optional(),
  offset: z.string().optional(),
  view: z.string().optional()
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
      type: 'create' as const,
      baseId,
      tableId,
      data: record.fields,
      priority: 1,
      timestamp: Date.now()
    }));

    const batchResults = await Promise.all(
      operations.map(op => batcher.addToQueue(op))
    );

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
  } catch (error) {
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
      type: 'update' as const,
      baseId,
      tableId,
      data: record.fields,
      recordId: record.id,
      priority: 2, // Higher priority for updates
      timestamp: Date.now()
    }));

    const batchResults = await Promise.all(
      operations.map(op => batcher.addToQueue(op))
    );

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
  } catch (error) {
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
      type: 'delete' as const,
      baseId,
      tableId,
      recordId,
      priority: 3, // Highest priority for deletes
      timestamp: Date.now()
    }));

    const batchResults = await Promise.all(
      operations.map(op => batcher.addToQueue(op))
    );

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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    return next(error);
  }
});

export default router;
