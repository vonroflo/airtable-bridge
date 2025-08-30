export interface SystemHealth {
    status: 'healthy' | 'warning' | 'error';
    timestamp: string;
    uptime: number;
    environment: string;
}
export interface AirtableBase {
    id: string;
    baseId: string;
    name: string;
    rateLimitRpm: number;
    recordLimit?: number;
    storageLimit?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        tables: number;
        syncJobs: number;
        queueJobs: number;
    };
}
export interface BaseMetrics {
    baseId: string;
    period: string;
    metrics: {
        api: {
            totalRequests: number;
            successfulRequests: number;
            errorRate: number;
            averageResponseTime: number;
            requestsByEndpoint: Record<string, number>;
        };
        sync: {
            total: number;
            active: number;
            completed: number;
            failed: number;
        };
        queue: {
            total: number;
            pending: number;
            processing: number;
            completed: number;
        };
    };
}
export interface RateLimitStatus {
    baseId: string;
    rateLimit: {
        requestsPerMinute: number;
        limit: number;
        remaining: number;
        resetTime: string;
    };
    queue: {
        depth: number;
        averageResponseTime: number;
        errorRate: number;
    };
}
export interface QueueStats {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
}
export interface SyncJob {
    id: string;
    baseId: string;
    jobType: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    totalRecords?: number;
    processedRecords: number;
    errorMessage?: string;
    startedAt?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface ApiMetric {
    id: string;
    baseId: string;
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
    timestamp: string;
    userId?: string;
    ipAddress?: string;
}
//# sourceMappingURL=index.d.ts.map