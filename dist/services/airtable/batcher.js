"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirtableBatcher = void 0;
const logger_1 = require("../../utils/logger");
class AirtableBatcher {
    constructor(redis, prisma, config) {
        this.config = {
            maxBatchSize: 10,
            maxWaitTime: 5000, // 5 seconds
            flushInterval: 1000 // 1 second
        };
        this.flushTimers = new Map();
        this.redis = redis;
        this.prisma = prisma;
        if (config) {
            this.config = { ...this.config, ...config };
        }
    }
    /**
     * Add an operation to the batching queue
     */
    async addToQueue(operation) {
        const batchKey = this.getBatchKey(operation.baseId, operation.tableId, operation.type);
        try {
            // Add operation to batch queue
            await this.redis.lpush(batchKey, JSON.stringify(operation));
            // Set expiry for the batch
            await this.redis.expire(batchKey, 300); // 5 minutes
            // Get current batch size
            const batchSize = await this.redis.llen(batchKey);
            // Schedule flush if not already scheduled
            if (!this.flushTimers.has(batchKey)) {
                this.scheduleFlush(batchKey);
            }
            // Force flush if batch is full
            if (batchSize >= this.config.maxBatchSize) {
                await this.flushBatch(operation.baseId, operation.tableId, operation.type);
            }
            const estimatedWaitTime = this.calculateWaitTime(batchSize);
            const queuePosition = batchSize;
            return {
                batchId: batchKey,
                operations: [operation],
                estimatedWaitTime,
                queuePosition
            };
        }
        catch (error) {
            logger_1.logger.error('Error adding operation to batch queue:', {
                operation,
                error: error.message
            });
            throw error;
        }
    }
    /**
     * Flush a batch for a specific base, table, and operation type
     */
    async flushBatch(baseId, tableId, operationType) {
        const batchKey = this.getBatchKey(baseId, tableId, operationType);
        try {
            // Clear the flush timer
            const timer = this.flushTimers.get(batchKey);
            if (timer) {
                clearTimeout(timer);
                this.flushTimers.delete(batchKey);
            }
            // Get all operations in the batch
            const operations = [];
            let operation;
            while (operations.length < this.config.maxBatchSize &&
                (operation = await this.redis.rpop(batchKey))) {
                operations.push(JSON.parse(operation));
            }
            if (operations.length === 0) {
                return;
            }
            // Validate batch
            if (!this.validateBatch(operations)) {
                logger_1.logger.error('Invalid batch detected:', { baseId, tableId, operationType, operations });
                // Return operations to queue or handle error
                return;
            }
            // Process the batch
            await this.processBatch(operations);
            logger_1.logger.info('Batch flushed successfully:', {
                baseId,
                tableId,
                operationType,
                count: operations.length
            });
        }
        catch (error) {
            logger_1.logger.error('Error flushing batch:', {
                baseId,
                tableId,
                operationType,
                error: error.message
            });
            // On error, return operations to queue for retry
            // await this.returnOperationsToQueue(batchKey, operations);
        }
    }
    /**
     * Get current batch status
     */
    async getBatchStatus(baseId, tableId, operationType) {
        const batchKey = this.getBatchKey(baseId, tableId, operationType);
        try {
            const size = await this.redis.llen(batchKey);
            const oldestOperation = await this.redis.lindex(batchKey, -1);
            const oldestTimestamp = oldestOperation
                ? JSON.parse(oldestOperation).timestamp
                : Date.now();
            const estimatedWaitTime = this.calculateWaitTime(size);
            return {
                size,
                oldestOperation: oldestTimestamp,
                estimatedWaitTime
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting batch status:', {
                baseId,
                tableId,
                operationType,
                error: error.message
            });
            return {
                size: 0,
                oldestOperation: Date.now(),
                estimatedWaitTime: 0
            };
        }
    }
    /**
     * Validate that all operations in a batch are compatible
     */
    validateBatch(operations) {
        if (operations.length === 0) {
            return false;
        }
        const firstOp = operations[0];
        if (!firstOp) {
            return false;
        }
        // Check that all operations are for the same base, table, and type
        return operations.every(op => op.baseId === firstOp.baseId &&
            op.tableId === firstOp.tableId &&
            op.type === firstOp.type);
    }
    /**
     * Process a batch of operations
     */
    async processBatch(operations) {
        const firstOp = operations[0];
        if (!firstOp) {
            throw new Error('No operations to process');
        }
        try {
            // Create a queue job for batch processing
            await this.prisma.queueJob.create({
                data: {
                    baseId: firstOp.baseId,
                    jobType: `batch_${firstOp.type}`,
                    status: 'pending',
                    priority: Math.max(...operations.map(op => op.priority)),
                    data: JSON.stringify({
                        operations,
                        batchSize: operations.length,
                        tableId: firstOp.tableId
                    }),
                    scheduledAt: new Date()
                }
            });
            logger_1.logger.info('Batch job created:', {
                baseId: firstOp.baseId,
                tableId: firstOp.tableId,
                operationType: firstOp.type,
                count: operations.length
            });
        }
        catch (error) {
            logger_1.logger.error('Error creating batch job:', {
                baseId: firstOp.baseId,
                error: error.message
            });
            throw error;
        }
    }
    /**
     * Schedule a flush timer for a batch
     */
    scheduleFlush(batchKey) {
        const timer = setTimeout(async () => {
            const [baseId, tableId, operationType] = batchKey.split(':').slice(1);
            if (baseId && tableId && operationType) {
                await this.flushBatch(baseId, tableId, operationType);
            }
        }, this.config.flushInterval);
        this.flushTimers.set(batchKey, timer);
    }
    /**
     * Calculate estimated wait time based on batch size
     */
    calculateWaitTime(batchSize) {
        if (batchSize >= this.config.maxBatchSize) {
            return 0; // Will be processed immediately
        }
        // Estimate based on current batch size and flush interval
        const batchesAhead = Math.ceil(batchSize / this.config.maxBatchSize);
        return batchesAhead * this.config.flushInterval;
    }
    /**
     * Generate batch key for Redis
     */
    getBatchKey(baseId, tableId, operationType) {
        return `batch:${baseId}:${tableId}:${operationType}`;
    }
    /**
     * Return operations to queue on error
     */
    // private async returnOperationsToQueue(batchKey: string, operations: AirtableOperation[]): Promise<void> {
    //   try {
    //     for (const operation of operations.reverse()) {
    //       await this.redis.lpush(batchKey, JSON.stringify(operation));
    //     }
    //     logger.info('Operations returned to queue after error:', { 
    //       batchKey, 
    //       count: operations.length 
    //     });
    //   } catch (error) {
    //     logger.error('Error returning operations to queue:', { 
    //       batchKey, 
    //       error: (error as Error).message 
    //     });
    //   }
    // }
    /**
     * Clean up all flush timers
     */
    destroy() {
        for (const timer of this.flushTimers.values()) {
            clearTimeout(timer);
        }
        this.flushTimers.clear();
    }
}
exports.AirtableBatcher = AirtableBatcher;
//# sourceMappingURL=batcher.js.map