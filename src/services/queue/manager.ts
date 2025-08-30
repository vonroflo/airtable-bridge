import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/logger';

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

export class QueueManager {
  private redis: Redis;
  private prisma: PrismaClient;
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private schedulers: Map<string, any> = new Map();
  private concurrency: number;

  constructor(redis: Redis, prisma: PrismaClient, concurrency: number = 5) {
    this.redis = redis;
    this.prisma = prisma;
    this.concurrency = concurrency;
  }

  /**
   * Add a job to the queue
   */
  async addJob(jobType: string, data: JobData, options: JobOptions = {}): Promise<Job> {
    const queue = await this.getQueue(jobType);
    
    const jobOptions = {
      priority: options.priority || data.priority || 0,
      delay: options.delay || 0,
      attempts: options.attempts || 3,
      backoff: options.backoff || {
        type: 'exponential' as const,
        delay: 2000
      },
      removeOnComplete: options.removeOnComplete || 100,
      removeOnFail: options.removeOnFail || 50
    };

    const job = await queue.add(jobType, data, jobOptions);
    
    // Log job creation
    await this.logJobEvent(job, 'created');
    
    logger.info('Job added to queue:', {
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
  async processJobs(): Promise<void> {
    const jobTypes = ['airtable_operation', 'batch_operation', 'sync_operation', 'webhook_processing'];
    
    for (const jobType of jobTypes) {
      await this.createWorker(jobType);
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<QueueStats> {
    const stats: QueueStats = {
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
  private async getQueue(jobType: string): Promise<Queue> {
    if (this.queues.has(jobType)) {
      return this.queues.get(jobType)!;
    }

    const queue = new Queue(jobType, {
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
  private async createWorker(jobType: string): Promise<void> {
    if (this.workers.has(jobType)) {
      return;
    }

    const worker = new Worker(
      jobType,
      async (job: Job) => {
        return await this.processJob(job);
      },
      {
        connection: this.redis,
        concurrency: this.concurrency,
        autorun: true
      }
    );

    // Handle job events
    worker.on('completed', async (job: Job) => {
      await this.handleJobCompleted(job);
    });

    worker.on('failed', async (job: Job | undefined, err: Error) => {
      if (job) {
        await this.handleJobFailed(job, err);
      }
    });

    worker.on('error', (err: Error) => {
      logger.error('Worker error:', { jobType, error: err.message });
    });

    this.workers.set(jobType, worker);
  }

  /**
   * Process a single job
   */
  private async processJob(job: Job): Promise<any> {
    const { baseId, tableId, operation } = job.data as JobData;
    
    try {
      await this.logJobEvent(job, 'started');
      
      logger.info('Processing job:', {
        jobId: job.id,
        jobType: job.name,
        baseId,
        tableId,
        operation
      });

      // Update job status in database
      await this.updateJobStatus(job.id as string, 'processing', {
        startedAt: new Date()
      });

      let result;
      
      switch (job.name) {
        case 'airtable_operation':
          result = await this.processAirtableOperation(job.data as JobData);
          break;
        case 'batch_operation':
          result = await this.processBatchOperation(job.data as JobData);
          break;
        case 'sync_operation':
          result = await this.processSyncOperation(job.data as JobData);
          break;
        case 'webhook_processing':
          result = await this.processWebhook(job.data as JobData);
          break;
        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }

      await this.logJobEvent(job, 'completed');
      
      return result;
    } catch (error) {
      await this.logJobEvent(job, 'failed', error as Error);
      throw error;
    }
  }

  /**
   * Process Airtable operation job
   */
  private async processAirtableOperation(data: JobData): Promise<any> {
    // This would integrate with the AirtableClient
    logger.info('Processing Airtable operation:', data);
    
    // Placeholder implementation
    return { success: true, operation: data.operation };
  }

  /**
   * Process batch operation job
   */
  private async processBatchOperation(data: JobData): Promise<any> {
    logger.info('Processing batch operation:', data);
    
    // Placeholder implementation
    return { success: true, batchSize: data.data?.operations?.length || 0 };
  }

  /**
   * Process sync operation job
   */
  private async processSyncOperation(data: JobData): Promise<any> {
    logger.info('Processing sync operation:', data);
    
    // Placeholder implementation
    return { success: true, syncType: data.operation };
  }

  /**
   * Process webhook job
   */
  private async processWebhook(data: JobData): Promise<any> {
    logger.info('Processing webhook:', data);
    
    // Placeholder implementation
    return { success: true, webhookProcessed: true };
  }

  /**
   * Handle job completion
   */
  private async handleJobCompleted(job: Job): Promise<void> {
    try {
      await this.updateJobStatus(job.id as string, 'completed', {
        completedAt: new Date(),
        result: job.returnvalue
      });

      logger.info('Job completed successfully:', {
        jobId: job.id,
        jobType: job.name,
        duration: job.processedOn! - job.timestamp
      });
    } catch (error) {
      logger.error('Error handling job completion:', { jobId: job.id, error: (error as Error).message });
    }
  }

  /**
   * Handle job failure
   */
  private async handleJobFailed(job: Job, error: Error): Promise<void> {
    try {
      await this.updateJobStatus(job.id as string, 'failed', {
        completedAt: new Date(),
        errorMessage: error.message,
        attempts: job.attemptsMade
      });

      logger.error('Job failed:', {
        jobId: job.id,
        jobType: job.name,
        error: error.message,
        attempts: job.attemptsMade
      });
    } catch (updateError) {
      logger.error('Error handling job failure:', { 
        jobId: job.id, 
        error: (updateError as Error).message 
      });
    }
  }

  /**
   * Update job status in database
   */
  private async updateJobStatus(jobId: string, status: string, data: any = {}): Promise<void> {
    try {
      await this.prisma.queueJob.update({
        where: { id: jobId },
        data: {
          status,
          ...data,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Error updating job status:', { jobId, status, error: (error as Error).message });
    }
  }

  /**
   * Log job events for monitoring
   */
  private async logJobEvent(job: Job, event: string, error?: Error): Promise<void> {
    try {
      const jobData = job.data as JobData;
      
      logger.info('Job event:', {
        jobId: job.id,
        jobType: job.name,
        event,
        baseId: jobData.baseId,
        error: error?.message
      });
    } catch (logError) {
      logger.error('Error logging job event:', { 
        jobId: job.id, 
        event, 
        error: (logError as Error).message 
      });
    }
  }

  /**
   * Pause all queues
   */
  async pauseAll(): Promise<void> {
    for (const [jobType, queue] of this.queues) {
      await queue.pause();
      logger.info('Queue paused:', { jobType });
    }
  }

  /**
   * Resume all queues
   */
  async resumeAll(): Promise<void> {
    for (const [jobType, queue] of this.queues) {
      await queue.resume();
      logger.info('Queue resumed:', { jobType });
    }
  }

  /**
   * Clean up resources
   */
  async close(): Promise<void> {
    // Close all workers
    for (const [, worker] of this.workers) {
      await worker.close();
    }

    // Close all queues
    for (const [, queue] of this.queues) {
      await queue.close();
    }

    // Close all schedulers
    for (const [, ] of this.schedulers) {
      // await scheduler.close();
    }

    this.workers.clear();
    this.queues.clear();
    this.schedulers.clear();

    logger.info('Queue manager closed');
  }
}
