"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClient = getPrismaClient;
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
let prisma;
function getPrismaClient() {
    if (!prisma) {
        prisma = new client_1.PrismaClient({
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
async function connectDatabase() {
    try {
        const client = getPrismaClient();
        await client.$connect();
        logger_1.logger.info('Database connected successfully');
    }
    catch (error) {
        logger_1.logger.error('Database connection failed:', { error: error.message });
        throw error;
    }
}
async function disconnectDatabase() {
    try {
        const client = getPrismaClient();
        await client.$disconnect();
        logger_1.logger.info('Database disconnected successfully');
    }
    catch (error) {
        logger_1.logger.error('Database disconnection failed:', { error: error.message });
    }
}
//# sourceMappingURL=database.js.map