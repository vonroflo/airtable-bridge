import { Router } from 'express';
import { z } from 'zod';
import { getPrismaClient } from '../../config/database';
import { logger } from '../../utils/logger';

const router = Router();
const prisma = getPrismaClient();

// Validation schemas
const createBaseSchema = z.object({
  baseId: z.string().min(1),
  name: z.string().min(1),
  apiKey: z.string().min(1),
  rateLimitRpm: z.number().int().positive().optional(),
  recordLimit: z.number().int().positive().optional(),
  storageLimit: z.number().int().positive().optional()
});

const updateBaseSchema = z.object({
  name: z.string().min(1).optional(),
  apiKey: z.string().min(1).optional(),
  rateLimitRpm: z.number().int().positive().optional(),
  recordLimit: z.number().int().positive().optional(),
  storageLimit: z.number().int().positive().optional(),
  isActive: z.boolean().optional()
});

// Register new base
router.post('/', async (req, res, next) => {
  try {
    const validatedData = createBaseSchema.parse(req.body);
    
    const existingBase = await prisma.airtableBase.findUnique({
      where: { baseId: validatedData.baseId }
    });

    if (existingBase) {
      return res.status(409).json({
        error: 'Base already exists',
        baseId: validatedData.baseId
      });
    }

    const base = await prisma.airtableBase.create({
      data: {
        baseId: validatedData.baseId,
        name: validatedData.name,
        apiKey: validatedData.apiKey, // In production, this should be encrypted
        rateLimitRpm: validatedData.rateLimitRpm || 300,
        recordLimit: validatedData.recordLimit || null,
        storageLimit: validatedData.storageLimit || null
      }
    });

    logger.info('Base registered:', { baseId: base.baseId, name: base.name });

    return res.status(201).json({
      message: 'Base registered successfully',
      base: {
        id: base.id,
        baseId: base.baseId,
        name: base.name,
        rateLimitRpm: base.rateLimitRpm,
        isActive: base.isActive,
        createdAt: base.createdAt
      }
    });
  } catch (error) {
    return next(error);
  }
});

// List bases
router.get('/', async (req, res, next) => {
  try {
    const { page = '1', limit = '10', active } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    const [bases, total] = await Promise.all([
      prisma.airtableBase.findMany({
        where,
        select: {
          id: true,
          baseId: true,
          name: true,
          rateLimitRpm: true,
          recordLimit: true,
          storageLimit: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              tables: true,
              syncJobs: true,
              queueJobs: true
            }
          }
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.airtableBase.count({ where })
    ]);

    return res.json({
      bases,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    return next(error);
  }
});

// Get base by ID
router.get('/:baseId', async (req, res, next) => {
  try {
    const { baseId } = req.params;

    const base = await prisma.airtableBase.findUnique({
      where: { baseId },
      include: {
        tables: {
          where: { isActive: true },
          orderBy: { name: 'asc' }
        },
        _count: {
          select: {
            syncJobs: true,
            queueJobs: true,
            apiMetrics: true
          }
        }
      }
    });

    if (!base) {
      return res.status(404).json({
        error: 'Base not found',
        baseId
      });
    }

    return res.json({
      base: {
        ...base,
        apiKey: undefined // Don't return the API key
      }
    });
  } catch (error) {
    return next(error);
  }
});

// Update base
router.put('/:baseId', async (req, res, next) => {
  try {
    const { baseId } = req.params;
    const validatedData = updateBaseSchema.parse(req.body);

    const existingBase = await prisma.airtableBase.findUnique({
      where: { baseId }
    });

    if (!existingBase) {
      return res.status(404).json({
        error: 'Base not found',
        baseId
      });
    }

    const updatedBase = await prisma.airtableBase.update({
      where: { baseId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.apiKey && { apiKey: validatedData.apiKey }),
        ...(validatedData.rateLimitRpm && { rateLimitRpm: validatedData.rateLimitRpm }),
        ...(validatedData.recordLimit && { recordLimit: validatedData.recordLimit }),
        ...(validatedData.storageLimit && { storageLimit: validatedData.storageLimit }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive })
      }
    });

    logger.info('Base updated:', { baseId, updatedFields: Object.keys(validatedData) });

    return res.json({
      message: 'Base updated successfully',
      base: {
        id: updatedBase.id,
        baseId: updatedBase.baseId,
        name: updatedBase.name,
        rateLimitRpm: updatedBase.rateLimitRpm,
        isActive: updatedBase.isActive,
        updatedAt: updatedBase.updatedAt
      }
    });
  } catch (error) {
    return next(error);
  }
});

// Delete base
router.delete('/:baseId', async (req, res, next) => {
  try {
    const { baseId } = req.params;

    const existingBase = await prisma.airtableBase.findUnique({
      where: { baseId },
      include: {
        _count: {
          select: {
            tables: true,
            syncJobs: true,
            queueJobs: true
          }
        }
      }
    });

    if (!existingBase) {
      return res.status(404).json({
        error: 'Base not found',
        baseId
      });
    }

    // Check if base has active data
    if (existingBase._count.tables > 0 || existingBase._count.syncJobs > 0 || existingBase._count.queueJobs > 0) {
      return res.status(400).json({
        error: 'Cannot delete base with active data',
        baseId,
        counts: existingBase._count
      });
    }

    await prisma.airtableBase.delete({
      where: { baseId }
    });

    logger.info('Base deleted:', { baseId });

    return res.json({
      message: 'Base deleted successfully',
      baseId
    });
  } catch (error) {
    return next(error);
  }
});

// Get base metrics
router.get('/:baseId/metrics', async (req, res, next) => {
  try {
    const { baseId } = req.params;
    const { period = '24h' } = req.query;

    const existingBase = await prisma.airtableBase.findUnique({
      where: { baseId }
    });

    if (!existingBase) {
      return res.status(404).json({
        error: 'Base not found',
        baseId
      });
    }

    // Calculate time range
    const now = new Date();
    let startTime: Date;
    
    switch (period) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get metrics
    const [apiMetrics, syncJobs, queueJobs] = await Promise.all([
      prisma.apiMetric.findMany({
        where: {
          baseId: existingBase.id,
          timestamp: { gte: startTime }
        },
        orderBy: { timestamp: 'desc' }
      }),
      prisma.syncJob.findMany({
        where: {
          baseId: existingBase.id,
          createdAt: { gte: startTime }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.queueJob.findMany({
        where: {
          baseId: existingBase.id,
          createdAt: { gte: startTime }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Calculate statistics
    const totalRequests = apiMetrics.length;
    const successfulRequests = apiMetrics.filter(m => m.statusCode < 400).length;
    const errorRate = totalRequests > 0 ? (totalRequests - successfulRequests) / totalRequests : 0;
    const averageResponseTime = apiMetrics.length > 0 
      ? apiMetrics.reduce((sum, m) => sum + m.responseTime, 0) / apiMetrics.length 
      : 0;

    const activeSyncJobs = syncJobs.filter(j => j.status === 'running').length;
    const completedSyncJobs = syncJobs.filter(j => j.status === 'completed').length;
    const failedSyncJobs = syncJobs.filter(j => j.status === 'failed').length;

    const pendingQueueJobs = queueJobs.filter(j => j.status === 'pending').length;
    const processingQueueJobs = queueJobs.filter(j => j.status === 'processing').length;
    const completedQueueJobs = queueJobs.filter(j => j.status === 'completed').length;

    return res.json({
      baseId,
      period,
      metrics: {
        api: {
          totalRequests,
          successfulRequests,
          errorRate,
          averageResponseTime,
          requestsByEndpoint: apiMetrics.reduce((acc, m) => {
            acc[m.endpoint] = (acc[m.endpoint] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        sync: {
          total: syncJobs.length,
          active: activeSyncJobs,
          completed: completedSyncJobs,
          failed: failedSyncJobs
        },
        queue: {
          total: queueJobs.length,
          pending: pendingQueueJobs,
          processing: processingQueueJobs,
          completed: completedQueueJobs
        }
      }
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
