import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger';
import { connectDatabase, disconnectDatabase, getPrismaClient } from './config/database';
import { connectRedis, disconnectRedis, getRedisClient } from './config/redis';
import { QueueManager } from './services/queue/manager';

const app = express();
const port = process.env['PORT'] || 3000;

// Initialize services
let queueManager: QueueManager;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env['NODE_ENV'] === 'production' 
    ? process.env['ALLOWED_ORIGINS']?.split(',') 
    : true,
  credentials: true
}));

// Compression middleware
app.use(compression());

// Global rate limiting
const globalLimiter = rateLimit({
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
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
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV']
  });
});

// Import routes
import basesRouter from './api/routes/bases';
import recordsRouter from './api/routes/records';

// API routes
app.use('/api/bases', basesRouter);
app.use('/api', recordsRouter);

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
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', {
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
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Stop accepting new requests
    server.close(() => {
      logger.info('HTTP server closed');
    });

    // Close queue manager
    if (queueManager) {
      await queueManager.close();
    }

    // Disconnect from databases
    await disconnectRedis();
    await disconnectDatabase();

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', { error: (error as Error).message });
    process.exit(1);
  }
}

// Initialize application
async function initializeApp() {
  try {
    // Connect to databases
    await connectDatabase();
    await connectRedis();

    // Initialize queue manager
    const prisma = getPrismaClient();
    const redis = getRedisClient();
    const concurrency = parseInt(process.env['QUEUE_CONCURRENCY'] || '5');
    
    queueManager = new QueueManager(redis, prisma, concurrency);
    await queueManager.processJobs();

    logger.info('Application initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize application:', { error: (error as Error).message });
    process.exit(1);
  }
}

// Start server
const server = app.listen(port, () => {
  logger.info(`Airtable Bridge server running on port ${port}`);
});

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', { error: error.message, stack: error.stack });
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection:', { reason, promise });
  gracefulShutdown('unhandledRejection');
});

// Initialize the application
initializeApp();
