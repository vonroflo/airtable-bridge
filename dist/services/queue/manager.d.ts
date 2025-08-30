import { Job } from 'bullmq';
import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';
export interface JobOptions {
    priority?: number;
    delay?: number;
    attempts?: number;
    backoff?: {
        type: 'exponential' | 'fixed';
        delay: number;
    };
    removeOnComplete?: number;
    removeOnFail?: number;
}
export interface QueueStats {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
}
export interface JobData {
    baseId: string;
    tableId?: string;
    operation: string;
    data: any;
    priority?: number;
    retryCount?: number;
}
export declare class QueueManager {
    private redis;
    private prisma;
    private queues;
    private workers;
    private schedulers;
    private concurrency;
    constructor(redis: Redis, prisma: PrismaClient, concurrency?: number);
    /**
     * Add a job to the queue
     */
    addJob(jobType: string, data: JobData, options?: JobOptions): Promise<Job>;
    /**
     * Process jobs with the specified concurrency
     */
    processJobs(): Promise<void>;
    /**
     * Get queue statistics
     */
    getQueueStats(): Promise<QueueStats>;
    /**
     * Get or create a queue for a job type
     */
    private getQueue;
    /**
     * Create a worker for processing jobs
     */
    private createWorker;
    /**
     * Process a single job
     */
    private processJob;
    /**
     * Process Airtable operation job
     */
    private processAirtableOperation;
    /**
     * Process batch operation job
     */
    private processBatchOperation;
    /**
     * Process sync operation job
     */
    private processSyncOperation;
    /**
     * Process webhook job
     */
    private processWebhook;
    /**
     * Handle job completion
     */
    private handleJobCompleted;
    /**
     * Handle job failure
     */
    private handleJobFailed;
    /**
     * Update job status in database
     */
    private updateJobStatus;
    /**
     * Log job events for monitoring
     */
    private logJobEvent;
    /**
     * Pause all queues
     */
    pauseAll(): Promise<void>;
    /**
     * Resume all queues
     */
    resumeAll(): Promise<void>;
    /**
     * Clean up resources
     */
    close(): Promise<void>;
}
//# sourceMappingURL=manager.d.ts.map