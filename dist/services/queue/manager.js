"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueManager = void 0;
const bullmq_1 = require("bullmq");
const logger_1 = require("../../utils/logger");
class QueueManager {
    constructor(redis, prisma, concurrency = 5) {
        this.queues = new Map();
        this.workers = new Map();
        this.schedulers = new Map();
        this.redis = redis;
        this.prisma = prisma;
        this.concurrency = concurrency;
    }
    /**
     * Add a job to the queue
     */
    async addJob(jobType, data, options = {}) {
        const queue = await this.getQueue(jobType);
        const jobOptions = {
            priority: options.priority || data.priority || 0,
            delay: options.delay || 0,
            attempts: options.attempts || 3,
            backoff: options.backoff || {
                type: 'exponential',
                delay: 2000
            },
            removeOnComplete: options.removeOnComplete || 100,
            removeOnFail: options.removeOnFail || 50
        };
        const job = await queue.add(jobType, data, jobOptions);
        // Log job creation
        await this.logJobEvent(job, 'created');
        logger_1.logger.info('Job added to queue:', {
            jobId: job.id,
            jobType,
            baseId: data.baseId,
            priority: jobOptions.priority
        });
        return job;
    }
    /**
     * Process jobs with the specified concurrency
     */
    async processJobs() {
        const jobTypes = ['airtable_operation', 'batch_operation', 'sync_operation', 'webhook_processing'];
        for (const jobType of jobTypes) {
            await this.createWorker(jobType);
        }
    }
    /**
     * Get queue statistics
     */
    async getQueueStats() {
        const stats = {
            waiting: 0,
            active: 0,
            completed: 0,
            failed: 0,
            delayed: 0,
            paused: 0
        };
        for (const [, queue] of this.queues) {
            const queueStats = await queue.getJobCounts();
            stats.waiting += queueStats['waiting'] || 0;
            stats.active += queueStats['active'] || 0;
            stats.completed += queueStats['completed'] || 0;
            stats.failed += queueStats['failed'] || 0;
            stats.delayed += queueStats['delayed'] || 0;
            stats.paused += queueStats['paused'] || 0;
        }
        return stats;
    }
    /**
     * Get or create a queue for a job type
     */
    async getQueue(jobType) {
        if (this.queues.has(jobType)) {
            return this.queues.get(jobType);
        }
        const queue = new bullmq_1.Queue(jobType, {
            connection: this.redis,
            defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 50
            }
        });
        // Create scheduler for delayed jobs (commented out for now)
        // const scheduler = new QueueScheduler(jobType, {
        //   connection: this.redis
        // });
        this.queues.set(jobType, queue);
        // this.schedulers.set(jobType, scheduler);
        return queue;
    }
    /**
     * Create a worker for processing jobs
     */
    async createWorker(jobType) {
        if (this.workers.has(jobType)) {
            return;
        }
        const worker = new bullmq_1.Worker(jobType, async (job) => {
            return await this.processJob(job);
        }, {
            connection: this.redis,
            concurrency: this.concurrency,
            autorun: true
        });
        // Handle job events
        worker.on('completed', async (job) => {
            await this.handleJobCompleted(job);
        });
        worker.on('failed', async (job, err) => {
            if (job) {
                await this.handleJobFailed(job, err);
            }
        });
        worker.on('error', (err) => {
            logger_1.logger.error('Worker error:', { jobType, error: err.message });
        });
        this.workers.set(jobType, worker);
    }
    /**
     * Process a single job
     */
    async processJob(job) {
        const { baseId, tableId, operation } = job.data;
        try {
            await this.logJobEvent(job, 'started');
            logger_1.logger.info('Processing job:', {
                jobId: job.id,
                jobType: job.name,
                baseId,
                tableId,
                operation
            });
            // Update job status in database
            await this.updateJobStatus(job.id, 'processing', {
                startedAt: new Date()
            });
            let result;
            switch (job.name) {
                case 'airtable_operation':
                    result = await this.processAirtableOperation(job.data);
                    break;
                case 'batch_operation':
                    result = await this.processBatchOperation(job.data);
                    break;
                case 'sync_operation':
                    result = await this.processSyncOperation(job.data);
                    break;
                case 'webhook_processing':
                    result = await this.processWebhook(job.data);
                    break;
                default:
                    throw new Error(`Unknown job type: ${job.name}`);
            }
            await this.logJobEvent(job, 'completed');
            return result;
        }
        catch (error) {
            await this.logJobEvent(job, 'failed', error);
            throw error;
        }
    }
    /**
     * Process Airtable operation job
     */
    async processAirtableOperation(data) {
        // This would integrate with the AirtableClient
        logger_1.logger.info('Processing Airtable operation:', data);
        // Placeholder implementation
        return { success: true, operation: data.operation };
    }
    /**
     * Process batch operation job
     */
    async processBatchOperation(data) {
        logger_1.logger.info('Processing batch operation:', data);
        // Placeholder implementation
        return { success: true, batchSize: data.data?.operations?.length || 0 };
    }
    /**
     * Process sync operation job
     */
    async processSyncOperation(data) {
        logger_1.logger.info('Processing sync operation:', data);
        // Placeholder implementation
        return { success: true, syncType: data.operation };
    }
    /**
     * Process webhook job
     */
    async processWebhook(data) {
        logger_1.logger.info('Processing webhook:', data);
        // Placeholder implementation
        return { success: true, webhookProcessed: true };
    }
    /**
     * Handle job completion
     */
    async handleJobCompleted(job) {
        try {
            await this.updateJobStatus(job.id, 'completed', {
                completedAt: new Date(),
                result: job.returnvalue
            });
            logger_1.logger.info('Job completed successfully:', {
                jobId: job.id,
                jobType: job.name,
                duration: job.processedOn - job.timestamp
            });
        }
        catch (error) {
            logger_1.logger.error('Error handling job completion:', { jobId: job.id, error: error.message });
        }
    }
    /**
     * Handle job failure
     */
    async handleJobFailed(job, error) {
        try {
            await this.updateJobStatus(job.id, 'failed', {
                completedAt: new Date(),
                errorMessage: error.message,
                attempts: job.attemptsMade
            });
            logger_1.logger.error('Job failed:', {
                jobId: job.id,
                jobType: job.name,
                error: error.message,
                attempts: job.attemptsMade
            });
        }
        catch (updateError) {
            logger_1.logger.error('Error handling job failure:', {
                jobId: job.id,
                error: updateError.message
            });
        }
    }
    /**
     * Update job status in database
     */
    async updateJobStatus(jobId, status, data = {}) {
        try {
            await this.prisma.queueJob.update({
                where: { id: jobId },
                data: {
                    status,
                    ...data,
                    updatedAt: new Date()
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error updating job status:', { jobId, status, error: error.message });
        }
    }
    /**
     * Log job events for monitoring
     */
    async logJobEvent(job, event, error) {
        try {
            const jobData = job.data;
            logger_1.logger.info('Job event:', {
                jobId: job.id,
                jobType: job.name,
                event,
                baseId: jobData.baseId,
                error: error?.message
            });
        }
        catch (logError) {
            logger_1.logger.error('Error logging job event:', {
                jobId: job.id,
                event,
                error: logError.message
            });
        }
    }
    /**
     * Pause all queues
     */
    async pauseAll() {
        for (const [jobType, queue] of this.queues) {
            await queue.pause();
            logger_1.logger.info('Queue paused:', { jobType });
        }
    }
    /**
     * Resume all queues
     */
    async resumeAll() {
        for (const [jobType, queue] of this.queues) {
            await queue.resume();
            logger_1.logger.info('Queue resumed:', { jobType });
        }
    }
    /**
     * Clean up resources
     */
    async close() {
        // Close all workers
        for (const [, worker] of this.workers) {
            await worker.close();
        }
        // Close all queues
        for (const [, queue] of this.queues) {
            await queue.close();
        }
        // Close all schedulers
        for (const [,] of this.schedulers) {
            // await scheduler.close();
        }
        this.workers.clear();
        this.queues.clear();
        this.schedulers.clear();
        logger_1.logger.info('Queue manager closed');
    }
}
exports.QueueManager = QueueManager;
//# sourceMappingURL=manager.js.map