import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/logger';

export interface AirtableOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  baseId: string;
  tableId: string;
  data?: any;
  recordId?: string;
  priority: number;
  timestamp: number;
}

export interface BatchResult {
  batchId: string;
  operations: AirtableOperation[];
  estimatedWaitTime: number;
  queuePosition: number;
}

export interface BatchConfig {
  maxBatchSize: number;
  maxWaitTime: number; // milliseconds
  flushInterval: number; // milliseconds
}

export class AirtableBatcher {
  private redis: Redis;
  private prisma: PrismaClient;
  private config: BatchConfig = {
    maxBatchSize: 10,
    maxWaitTime: 5000, // 5 seconds
    flushInterval: 1000 // 1 second
  };

  private flushTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(redis: Redis, prisma: PrismaClient, config?: Partial<BatchConfig>) {
    this.redis = redis;
    this.prisma = prisma;
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Add an operation to the batching queue
   */
  async addToQueue(operation: AirtableOperation): Promise<BatchResult> {
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
    } catch (error) {
      logger.error('Error adding operation to batch queue:', { 
        operation, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Flush a batch for a specific base, table, and operation type
   */
  async flushBatch(baseId: string, tableId: string, operationType: string): Promise<void> {
    const batchKey = this.getBatchKey(baseId, tableId, operationType);
    
    try {
      // Clear the flush timer
      const timer = this.flushTimers.get(batchKey);
      if (timer) {
        clearTimeout(timer);
        this.flushTimers.delete(batchKey);
      }

      // Get all operations in the batch
      const operations: AirtableOperation[] = [];
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
        logger.error('Invalid batch detected:', { baseId, tableId, operationType, operations });
        // Return operations to queue or handle error
        return;
      }

      // Process the batch
      await this.processBatch(operations);
      
      logger.info('Batch flushed successfully:', { 
        baseId, 
        tableId, 
        operationType, 
        count: operations.length 
      });
    } catch (error) {
      logger.error('Error flushing batch:', { 
        baseId, 
        tableId, 
        operationType, 
        error: (error as Error).message 
      });
      
      // On error, return operations to queue for retry
      // await this.returnOperationsToQueue(batchKey, operations);
    }
  }

  /**
   * Get current batch status
   */
  async getBatchStatus(baseId: string, tableId: string, operationType: string): Promise<{
    size: number;
    oldestOperation: number;
    estimatedWaitTime: number;
  }> {
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
    } catch (error) {
      logger.error('Error getting batch status:', { 
        baseId, 
        tableId, 
        operationType, 
        error: (error as Error).message 
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
  private validateBatch(operations: AirtableOperation[]): boolean {
    if (operations.length === 0) {
      return false;
    }

    const firstOp = operations[0];
    if (!firstOp) {
      return false;
    }
    
    // Check that all operations are for the same base, table, and type
    return operations.every(op => 
      op.baseId === firstOp.baseId &&
      op.tableId === firstOp.tableId &&
      op.type === firstOp.type
    );
  }

  /**
   * Process a batch of operations
   */
  private async processBatch(operations: AirtableOperation[]): Promise<void> {
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

      logger.info('Batch job created:', { 
        baseId: firstOp.baseId, 
        tableId: firstOp.tableId, 
        operationType: firstOp.type,
        count: operations.length 
      });
    } catch (error) {
      logger.error('Error creating batch job:', { 
        baseId: firstOp.baseId, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Schedule a flush timer for a batch
   */
  private scheduleFlush(batchKey: string): void {
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
  private calculateWaitTime(batchSize: number): number {
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
  private getBatchKey(baseId: string, tableId: string, operationType: string): string {
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
  destroy(): void {
    for (const timer of this.flushTimers.values()) {
      clearTimeout(timer);
    }
    this.flushTimers.clear();
  }
}
