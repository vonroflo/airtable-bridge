"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirtableRateLimiter = void 0;
const logger_1 = require("../../utils/logger");
class AirtableRateLimiter {
    constructor(redis, prisma) {
        this.defaultConfig = {
            capacity: 5, // 5 requests per second
            refillRate: 5,
            refillTime: 1
        };
        this.redis = redis;
        this.prisma = prisma;
    }
    /**
     * Acquire a token for making an Airtable API request
     * Returns true if token is available, false if rate limited
     */
    async acquireToken(baseId) {
        const key = `rate_limit:${baseId}`;
        const now = Date.now();
        try {
            // Get base configuration
            const base = await this.prisma.airtableBase.findUnique({
                where: { baseId },
                select: { rateLimitRpm: true }
            });
            const config = base ? {
                ...this.defaultConfig,
                capacity: Math.floor(base.rateLimitRpm / 60) // Convert RPM to per-second
            } : this.defaultConfig;
            // Use Redis Lua script for atomic token bucket operation
            const luaScript = `
        local key = KEYS[1]
        local now = tonumber(ARGV[1])
        local capacity = tonumber(ARGV[2])
        local refillRate = tonumber(ARGV[3])
        local refillTime = tonumber(ARGV[4])
        
        local bucket = redis.call('HMGET', key, 'tokens', 'lastRefill')
        local tokens = tonumber(bucket[1]) or capacity
        local lastRefill = tonumber(bucket[2]) or now
        
        -- Calculate time passed and tokens to add
        local timePassed = now - lastRefill
        local tokensToAdd = math.floor(timePassed / (refillTime * 1000) * refillRate)
        
        -- Refill bucket
        tokens = math.min(capacity, tokens + tokensToAdd)
        lastRefill = now
        
        -- Check if we can consume a token
        if tokens >= 1 then
          tokens = tokens - 1
          redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', lastRefill)
          redis.call('EXPIRE', key, 60) -- Expire after 1 minute
          return 1
        else
          redis.call('HMSET', key, 'tokens', tokens, 'lastRefill', lastRefill)
          redis.call('EXPIRE', key, 60)
          return 0
        end
      `;
            const result = await this.redis.eval(luaScript, 1, key, now.toString(), config.capacity.toString(), config.refillRate.toString(), config.refillTime.toString());
            const hasToken = result === 1;
            // Log metrics
            await this.logRateLimitEvent(baseId, hasToken);
            return hasToken;
        }
        catch (error) {
            logger_1.logger.error('Rate limiter error:', { baseId, error: error.message });
            // On error, allow the request to proceed (fail open)
            return true;
        }
    }
    /**
     * Get current queue depth for a base
     */
    async getQueueDepth(baseId) {
        try {
            const key = `queue:${baseId}`;
            return await this.redis.llen(key);
        }
        catch (error) {
            logger_1.logger.error('Error getting queue depth:', { baseId, error: error.message });
            return 0;
        }
    }
    /**
     * Get comprehensive metrics for a base
     */
    async getMetrics(baseId) {
        try {
            const now = new Date();
            const oneMinuteAgo = new Date(now.getTime() - 60000);
            // Get recent API metrics from database
            const recentMetrics = await this.prisma.apiMetric.findMany({
                where: {
                    baseId,
                    timestamp: {
                        gte: oneMinuteAgo
                    }
                }
            });
            const requestsPerMinute = recentMetrics.length;
            const queueDepth = await this.getQueueDepth(baseId);
            const averageResponseTime = recentMetrics.length > 0
                ? recentMetrics.reduce((sum, metric) => sum + metric.responseTime, 0) / recentMetrics.length
                : 0;
            const errorRate = recentMetrics.length > 0
                ? recentMetrics.filter(m => m.statusCode >= 400).length / recentMetrics.length
                : 0;
            // Get last reset time from Redis
            const key = `rate_limit:${baseId}`;
            const lastRefill = await this.redis.hget(key, 'lastRefill');
            const lastResetTime = lastRefill ? new Date(parseInt(lastRefill)) : now;
            return {
                requestsPerMinute,
                queueDepth,
                averageResponseTime,
                errorRate,
                lastResetTime
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting metrics:', { baseId, error: error.message });
            return {
                requestsPerMinute: 0,
                queueDepth: 0,
                averageResponseTime: 0,
                errorRate: 0,
                lastResetTime: new Date()
            };
        }
    }
    /**
     * Add request to queue when rate limited
     */
    async addToQueue(baseId, request) {
        try {
            const key = `queue:${baseId}`;
            await this.redis.lpush(key, JSON.stringify({
                ...request,
                timestamp: Date.now()
            }));
            await this.redis.expire(key, 3600); // Expire after 1 hour
        }
        catch (error) {
            logger_1.logger.error('Error adding to queue:', { baseId, error: error.message });
        }
    }
    /**
     * Process queued requests when tokens become available
     */
    async processQueue(baseId) {
        try {
            const key = `queue:${baseId}`;
            const hasToken = await this.acquireToken(baseId);
            if (hasToken) {
                const queuedRequest = await this.redis.rpop(key);
                if (queuedRequest) {
                    const request = JSON.parse(queuedRequest);
                    // Process the queued request (this would be handled by the calling service)
                    logger_1.logger.info('Processing queued request:', { baseId, requestId: request.id });
                }
            }
        }
        catch (error) {
            logger_1.logger.error('Error processing queue:', { baseId, error: error.message });
        }
    }
    /**
     * Log rate limit events for metrics
     */
    async logRateLimitEvent(baseId, allowed) {
        try {
            await this.prisma.apiMetric.create({
                data: {
                    baseId,
                    endpoint: 'rate_limit_check',
                    method: 'GET',
                    statusCode: allowed ? 200 : 429,
                    responseTime: 0,
                    timestamp: new Date()
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error logging rate limit event:', { baseId, error: error.message });
        }
    }
    /**
     * Reset rate limit for a base (for testing or manual override)
     */
    async resetRateLimit(baseId) {
        try {
            const key = `rate_limit:${baseId}`;
            await this.redis.del(key);
            logger_1.logger.info('Rate limit reset for base:', { baseId });
        }
        catch (error) {
            logger_1.logger.error('Error resetting rate limit:', { baseId, error: error.message });
        }
    }
}
exports.AirtableRateLimiter = AirtableRateLimiter;
//# sourceMappingURL=rateLimiter.js.map