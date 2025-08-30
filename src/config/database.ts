import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });

    // Log queries in development (commented out due to TypeScript issues)
    // if (process.env['NODE_ENV'] === 'development') {
    //   prisma.$on('query' as any, (e: any) => {
    //     logger.debug('Database query:', {
    //       query: e.query,
    //       params: e.params,
    //       duration: e.duration,
    //     });
    //   });
    // }

    // Log errors (commented out due to TypeScript issues)
    // prisma.$on('error' as any, (e: any) => {
    //   logger.error('Database error:', {
    //     error: e.message,
    //     target: e.target,
    //   });
    // });

    // Log warnings (commented out due to TypeScript issues)
    // prisma.$on('warn' as any, (e: any) => {
    //   logger.warn('Database warning:', {
    //     message: e.message,
    //   });
    // });
  }

  return prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    const client = getPrismaClient();
    await client.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed:', { error: (error as Error).message });
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    const client = getPrismaClient();
    await client.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Database disconnection failed:', { error: (error as Error).message });
  }
}
