import { Router } from 'express'
import { z } from 'zod'
import { getPrismaClient } from '../../config/database'
import { getRedisClient } from '../../config/redis'
import { QueueManager } from '../../services/queue/manager'
import { AirtableClient } from '../../services/airtable/client'
import { SoftrClient } from '../../services/softr/client'
import { ProvisioningManager } from '../../services/provisioning/manager'
import { logger } from '../../utils/logger'

const router = Router()
const prisma = getPrismaClient()
const redis = getRedisClient()

// Initialize services
const queueManager = new QueueManager(redis, prisma)
const airtableClient = new AirtableClient(prisma)
const softrClient = new SoftrClient(process.env['SOFTR_API_KEY'] || '')
const provisioningManager = new ProvisioningManager(
  prisma,
  redis,
  queueManager,
  airtableClient,
  softrClient
)

// Validation schemas
const provisioningRequestSchema = z.object({
  customerId: z.string().min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  portalName: z.string().min(1),
  deploymentModel: z.enum(['isolated', 'shared']),
  includeSampleData: z.boolean().default(false),
  userList: z.array(z.object({
    name: z.string().min(1),
    email: z.string().email(),
    role: z.enum(['admin', 'team', 'client'])
  })).optional()
})

// Start provisioning
router.post('/start', async (req, res, next) => {
  try {
    const validatedData = provisioningRequestSchema.parse(req.body)

    // Check if customer already has active provisioning
    const existingJobs = await provisioningManager.getCustomerJobs(validatedData.customerId)
    const activeJob = existingJobs.find(job => 
      job.status !== 'completed' && job.status !== 'failed'
    )

    if (activeJob) {
      return res.status(409).json({
        error: 'Provisioning already in progress',
        jobId: activeJob.id,
        status: activeJob.status,
        progress: activeJob.progress
      })
    }

    const job = await provisioningManager.startProvisioning(validatedData)

    return res.status(202).json({
      message: 'Provisioning started',
      jobId: job.id,
      estimatedCompletion: job.estimatedCompletion,
      status: job.status
    })
  } catch (error) {
    return next(error)
  }
})

// Get provisioning status
router.get('/status/:jobId', async (req, res, next) => {
  try {
    const { jobId } = req.params

    const job = await provisioningManager.getJobStatus(jobId)

    if (!job) {
      return res.status(404).json({
        error: 'Provisioning job not found',
        jobId
      })
    }

    return res.json({
      job: {
        id: job.id,
        customerId: job.customerId,
        status: job.status,
        progress: job.progress,
        airtableBaseId: job.airtableBaseId,
        softrPortalId: job.softrPortalId,
        error: job.error,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        estimatedCompletion: job.estimatedCompletion
      }
    })
  } catch (error) {
    return next(error)
  }
})

// Get customer provisioning history
router.get('/customer/:customerId', async (req, res, next) => {
  try {
    const { customerId } = req.params

    const jobs = await provisioningManager.getCustomerJobs(customerId)

    return res.json({
      customerId,
      jobs: jobs.map(job => ({
        id: job.id,
        status: job.status,
        progress: job.progress,
        error: job.error,
        startedAt: job.startedAt,
        completedAt: job.completedAt
      }))
    })
  } catch (error) {
    return next(error)
  }
})

// Cancel provisioning job
router.delete('/:jobId', async (req, res, next) => {
  try {
    const { jobId } = req.params

    const job = await provisioningManager.getJobStatus(jobId)

    if (!job) {
      return res.status(404).json({
        error: 'Provisioning job not found',
        jobId
      })
    }

    if (job.status === 'completed' || job.status === 'failed') {
      return res.status(400).json({
        error: 'Cannot cancel completed or failed job',
        jobId,
        status: job.status
      })
    }

    await provisioningManager.cancelJob(jobId)

    return res.json({
      message: 'Provisioning job cancelled',
      jobId
    })
  } catch (error) {
    return next(error)
  }
})

// Get CRM schema information
router.get('/schema', async (req, res) => {
  try {
    const { CRM_SCHEMA } = await import('../../services/crm/schema')
    
    return res.json({
      schema: {
        name: CRM_SCHEMA.name,
        description: CRM_SCHEMA.description,
        tables: CRM_SCHEMA.tables.map(table => ({
          name: table.name,
          description: table.description,
          fieldCount: table.fields.length,
          viewCount: table.views.length
        })),
        relationshipCount: CRM_SCHEMA.relationships.length
      }
    })
  } catch (error) {
    logger.error('Error getting CRM schema:', { error: (error as Error).message })
    return res.status(500).json({
      error: 'Failed to load CRM schema'
    })
  }
})

export default router