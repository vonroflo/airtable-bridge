import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';
export interface RateLimitMetrics {
    requestsPerMinute: number;
    queueDepth: number;
    averageResponseTime: number;
    errorRate: number;
    lastResetTime: Date;
}
export interface TokenBucketConfig {
    capacity: number;
    refillRate: number;
    refillTime: number;
}
export declare class AirtableRateLimiter {
    private redis;
    private prisma;
    private defaultConfig;
    constructor(redis: Redis, prisma: PrismaClient);
    /**
     * Acquire a token for making an Airtable API request
     * Returns true if token is available, false if rate limited
     */
    acquireToken(baseId: string): Promise<boolean>;
    /**
     * Get current queue depth for a base
     */
    getQueueDepth(baseId: string): Promise<number>;
    /**
     * Get comprehensive metrics for a base
     */
    getMetrics(baseId: string): Promise<RateLimitMetrics>;
    /**
     * Add request to queue when rate limited
     */
    addToQueue(baseId: string, request: any): Promise<void>;
    /**
     * Process queued requests when tokens become available
     */
    processQueue(baseId: string): Promise<void>;
    /**
     * Log rate limit events for metrics
     */
    private logRateLimitEvent;
    /**
     * Reset rate limit for a base (for testing or manual override)
     */
    resetRateLimit(baseId: string): Promise<void>;
}
//# sourceMappingURL=rateLimiter.d.ts.map