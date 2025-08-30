import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';
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
    maxWaitTime: number;
    flushInterval: number;
}
export declare class AirtableBatcher {
    private redis;
    private prisma;
    private config;
    private flushTimers;
    constructor(redis: Redis, prisma: PrismaClient, config?: Partial<BatchConfig>);
    /**
     * Add an operation to the batching queue
     */
    addToQueue(operation: AirtableOperation): Promise<BatchResult>;
    /**
     * Flush a batch for a specific base, table, and operation type
     */
    flushBatch(baseId: string, tableId: string, operationType: string): Promise<void>;
    /**
     * Get current batch status
     */
    getBatchStatus(baseId: string, tableId: string, operationType: string): Promise<{
        size: number;
        oldestOperation: number;
        estimatedWaitTime: number;
    }>;
    /**
     * Validate that all operations in a batch are compatible
     */
    private validateBatch;
    /**
     * Process a batch of operations
     */
    private processBatch;
    /**
     * Schedule a flush timer for a batch
     */
    private scheduleFlush;
    /**
     * Calculate estimated wait time based on batch size
     */
    private calculateWaitTime;
    /**
     * Generate batch key for Redis
     */
    private getBatchKey;
    /**
     * Return operations to queue on error
     */
    /**
     * Clean up all flush timers
     */
    destroy(): void;
}
//# sourceMappingURL=batcher.d.ts.map