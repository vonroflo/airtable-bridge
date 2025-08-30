import Redis from 'ioredis';
import { logger } from '../utils/logger';

let redis: Redis;

export function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env['REDIS_URL'] || 'redis://localhost:6379';
    
    redis = new Redis(redisUrl, {
      enableReadyCheck: false,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    // Handle connection events
    redis.on('connect', () => {
      logger.info('Redis connected');
    });

    redis.on('ready', () => {
      logger.info('Redis ready');
    });

    redis.on('error', (error) => {
      logger.error('Redis error:', { error: error.message });
    });

    redis.on('close', () => {
      logger.warn('Redis connection closed');
    });

    redis.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });
  }

  return redis;
}

export async function connectRedis(): Promise<void> {
  try {
    const client = getRedisClient();
    await client.ping();
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.error('Redis connection failed:', { error: (error as Error).message });
    throw error;
  }
}

export async function disconnectRedis(): Promise<void> {
  try {
    const client = getRedisClient();
    await client.quit();
    logger.info('Redis disconnected successfully');
  } catch (error) {
    logger.error('Redis disconnection failed:', { error: (error as Error).message });
  }
}
