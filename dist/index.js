"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("./utils/logger");
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const manager_1 = require("./services/queue/manager");
const app = (0, express_1.default)();
const port = process.env['PORT'] || 3000;
// Initialize services
let queueManager;
// Security middleware
app.use((0, helmet_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env['NODE_ENV'] === 'production'
        ? process.env['ALLOWED_ORIGINS']?.split(',')
        : true,
    credentials: true
}));
// Compression middleware
app.use((0, compression_1.default)());
// Global rate limiting
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env['GLOBAL_RATE_LIMIT_RPM'] || '1000'), // limit each IP to 1000 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger_1.logger.info('HTTP Request', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration,
            userAgent: req.get('User-Agent'),
            ip: req.ip
        });
    });
    next();
});
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env['NODE_ENV']
    });
});
// Import routes
const bases_1 = __importDefault(require("./api/routes/bases"));
const records_1 = __importDefault(require("./api/routes/records"));
// API routes
app.use('/api/bases', bases_1.default);
app.use('/api', records_1.default);
app.get('/api', (_req, res) => {
    res.json({
        message: 'Airtable Bridge API',
        version: process.env['API_VERSION'] || 'v1',
        status: 'running',
        endpoints: {
            bases: '/api/bases',
            records: '/api/{baseId}/tables/{tableId}/records'
        }
    });
});
// Error handling middleware
app.use((err, req, res, _next) => {
    logger_1.logger.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });
    res.status(err.statusCode || 500).json({
        error: process.env['NODE_ENV'] === 'production'
            ? 'Internal server error'
            : err.message,
        ...(process.env['NODE_ENV'] === 'development' && { stack: err.stack })
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl
    });
});
// Graceful shutdown
async function gracefulShutdown(signal) {
    logger_1.logger.info(`Received ${signal}. Starting graceful shutdown...`);
    try {
        // Stop accepting new requests
        server.close(() => {
            logger_1.logger.info('HTTP server closed');
        });
        // Close queue manager
        if (queueManager) {
            await queueManager.close();
        }
        // Disconnect from databases
        await (0, redis_1.disconnectRedis)();
        await (0, database_1.disconnectDatabase)();
        logger_1.logger.info('Graceful shutdown completed');
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('Error during graceful shutdown:', { error: error.message });
        process.exit(1);
    }
}
// Initialize application
async function initializeApp() {
    try {
        // Connect to databases
        await (0, database_1.connectDatabase)();
        await (0, redis_1.connectRedis)();
        // Initialize queue manager
        const prisma = (0, database_1.getPrismaClient)();
        const redis = (0, redis_1.getRedisClient)();
        const concurrency = parseInt(process.env['QUEUE_CONCURRENCY'] || '5');
        queueManager = new manager_1.QueueManager(redis, prisma, concurrency);
        await queueManager.processJobs();
        logger_1.logger.info('Application initialized successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to initialize application:', { error: error.message });
        process.exit(1);
    }
}
// Start server
const server = app.listen(port, () => {
    logger_1.logger.info(`Airtable Bridge server running on port ${port}`);
});
// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught exception:', { error: error.message, stack: error.stack });
    gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled rejection:', { reason, promise });
    gracefulShutdown('unhandledRejection');
});
// Initialize the application
initializeApp();
//# sourceMappingURL=index.js.map