"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = getRedisClient;
exports.connectRedis = connectRedis;
exports.disconnectRedis = disconnectRedis;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("../utils/logger");
let redis;
function getRedisClient() {
    if (!redis) {
        const redisUrl = process.env['REDIS_URL'] || 'redis://localhost:6379';
        redis = new ioredis_1.default(redisUrl, {
            enableReadyCheck: false,
            maxRetriesPerRequest: 3,
            lazyConnect: true,
        });
        // Handle connection events
        redis.on('connect', () => {
            logger_1.logger.info('Redis connected');
        });
        redis.on('ready', () => {
            logger_1.logger.info('Redis ready');
        });
        redis.on('error', (error) => {
            logger_1.logger.error('Redis error:', { error: error.message });
        });
        redis.on('close', () => {
            logger_1.logger.warn('Redis connection closed');
        });
        redis.on('reconnecting', () => {
            logger_1.logger.info('Redis reconnecting...');
        });
    }
    return redis;
}
async function connectRedis() {
    try {
        const client = getRedisClient();
        await client.ping();
        logger_1.logger.info('Redis connected successfully');
    }
    catch (error) {
        logger_1.logger.error('Redis connection failed:', { error: error.message });
        throw error;
    }
}
async function disconnectRedis() {
    try {
        const client = getRedisClient();
        await client.quit();
        logger_1.logger.info('Redis disconnected successfully');
    }
    catch (error) {
        logger_1.logger.error('Redis disconnection failed:', { error: error.message });
    }
}
//# sourceMappingURL=redis.js.map