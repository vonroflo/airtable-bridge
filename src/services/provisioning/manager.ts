import { PrismaClient } from '@prisma/client'
import { Redis } from 'ioredis'
import { QueueManager } from '../queue/manager'
import { AirtableClient } from '../airtable/client'
import { SoftrClient, SoftrPortalConfig, DEFAULT_CRM_PORTAL_CONFIG } from '../softr/client'
import { EmailClient, createEmailClient } from '../email/client'
import { CRMSchemaService, CRM_SCHEMA } from '../crm/schema'
import { logger } from '../../utils/logger'

export interface ProvisioningRequest {
  customerId: string
  customerName: string
  customerEmail: string
  portalName: string
  deploymentModel: 'isolated' | 'shared'
  includeSampleData: boolean
  userList?: Array<{
    name: string
    email: string
    role: 'admin' | 'team' | 'client'
  }>
}

export interface ProvisioningJob {
  id: string
  customerId: string
  status: 'pending' | 'creating_base' | 'deploying_schema' | 'creating_portal' | 'configuring_users' | 'completed' | 'failed'
  progress: number
  airtableBaseId?: string
  softrPortalId?: string
  error?: string
  startedAt: Date
  completedAt?: Date
  estimatedCompletion?: Date
}

export class ProvisioningManager {
  private prisma: PrismaClient
  private redis: Redis
  private queueManager: QueueManager
  private airtableClient: AirtableClient
  private softrClient: SoftrClient
  private emailClient: EmailClient
  private schemaService: CRMSchemaService

  constructor(
    prisma: PrismaClient,
    redis: Redis,
    queueManager: QueueManager,
    airtableClient: AirtableClient,
    softrClient: SoftrClient
  ) {
    this.prisma = prisma
    this.redis = redis
    this.queueManager = queueManager
    this.airtableClient = airtableClient
    this.softrClient = softrClient
    this.emailClient = createEmailClient()
    this.schemaService = new CRMSchemaService()
  }

  /**
   * Start provisioning process
   */
  async startProvisioning(request: ProvisioningRequest): Promise<ProvisioningJob> {
    try {
      const jobId = `prov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const job: ProvisioningJob = {
        id: jobId,
        customerId: request.customerId,
        status: 'pending',
        progress: 0,
        startedAt: new Date(),
        estimatedCompletion: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      }

      // Store job in database
      await this.prisma.queueJob.create({
        data: {
          id: jobId,
          baseId: request.customerId,
          jobType: 'provisioning',
          status: 'pending',
          priority: 1,
          data: JSON.stringify(request),
          scheduledAt: new Date()
        }
      })

      // Add to queue for processing
      await this.queueManager.addJob('provisioning', {
        baseId: request.customerId,
        operation: 'full_provisioning',
        data: request
      })

      logger.info('Provisioning job started:', { jobId, customerId: request.customerId })
      return job
    } catch (error) {
      logger.error('Error starting provisioning:', { error: (error as Error).message })
      throw error
    }
  }

  /**
   * Process provisioning job
   */
  async processProvisioningJob(request: ProvisioningRequest): Promise<void> {
    const jobId = `prov_${request.customerId}_${Date.now()}`
    
    try {
      logger.info('Processing provisioning job:', { jobId, customerId: request.customerId })

      // Step 1: Create Airtable Base
      await this.updateJobStatus(jobId, 'creating_base', 10)
      const baseId = await this.createAirtableBase(request)
      
      // Step 2: Deploy CRM Schema
      await this.updateJobStatus(jobId, 'deploying_schema', 30)
      await this.deployCRMSchema(baseId)
      
      // Step 3: Create Softr Portal
      await this.updateJobStatus(jobId, 'creating_portal', 60)
      const portalId = await this.createSoftrPortal(request, baseId)
      
      // Step 4: Configure Users
      await this.updateJobStatus(jobId, 'configuring_users', 80)
      await this.configureUsers(request, portalId)
      
      // Step 5: Send Notifications
      await this.updateJobStatus(jobId, 'completed', 100)
      await this.sendCompletionNotifications(request, baseId, portalId)

      logger.info('Provisioning completed successfully:', { 
        jobId, 
        customerId: request.customerId,
        baseId,
        portalId 
      })
    } catch (error) {
      await this.updateJobStatus(jobId, 'failed', 0, (error as Error).message)
      logger.error('Provisioning failed:', { 
        jobId, 
        customerId: request.customerId, 
        error: (error as Error).message 
      })
      throw error
    }
  }

  /**
   * Create Airtable base with CRM structure
   */
  private async createAirtableBase(request: ProvisioningRequest): Promise<string> {
    try {
      logger.info('Creating Airtable base:', { customerName: request.customerName })

      // Mock implementation - would create actual Airtable base
      const baseId = `app${Math.random().toString(36).substr(2, 14).toUpperCase()}`
      
      // Register base in our system
      await this.prisma.airtableBase.create({
        data: {
          baseId,
          name: `${request.customerName} CRM`,
          apiKey: process.env['AIRTABLE_API_KEY'] || '',
          rateLimitRpm: 300,
          isActive: true
        }
      })

      logger.info('Airtable base created:', { baseId, customerName: request.customerName })
      return baseId
    } catch (error) {
      logger.error('Error creating Airtable base:', { error: (error as Error).message })
      throw error
    }
  }

  /**
   * Deploy CRM schema to base
   */
  private async deployCRMSchema(baseId: string): Promise<void> {
    try {
      logger.info('Deploying CRM schema:', { baseId })
      
      await this.schemaService.deploySchema(baseId, CRM_SCHEMA)
      
      // Validate deployment
      const isValid = await this.schemaService.validateSchema(baseId, CRM_SCHEMA)
      if (!isValid) {
        throw new Error('Schema validation failed')
      }

      logger.info('CRM schema deployed successfully:', { baseId })
    } catch (error) {
      logger.error('Error deploying CRM schema:', { baseId, error: (error as Error).message })
      throw error
    }
  }

  /**
   * Create Softr portal
   */
  private async createSoftrPortal(request: ProvisioningRequest, baseId: string): Promise<string> {
    try {
      logger.info('Creating Softr portal:', { portalName: request.portalName, baseId })

      const config: SoftrPortalConfig = {
        ...DEFAULT_CRM_PORTAL_CONFIG,
        name: request.portalName,
        description: `CRM Portal for ${request.customerName}`,
        pages: DEFAULT_CRM_PORTAL_CONFIG.pages.map(page => ({
          ...page,
          blocks: page.blocks.map(block => ({
            ...block,
            airtableSource: {
              ...block.airtableSource,
              baseId
            }
          }))
        }))
      }

      const portal = await this.softrClient.createPortal(config)
      await this.softrClient.configurePortal(portal.id, config)

      logger.info('Softr portal created:', { portalId: portal.id, url: portal.url })
      return portal.id
    } catch (error) {
      logger.error('Error creating Softr portal:', { error: (error as Error).message })
      throw error
    }
  }

  /**
   * Configure users and send invitations
   */
  private async configureUsers(request: ProvisioningRequest, portalId: string): Promise<void> {
    try {
      logger.info('Configuring users:', { portalId, userCount: request.userList?.length || 0 })

      if (!request.userList || request.userList.length === 0) {
        return
      }

      // Add users to Softr portal
      const softrUsers = request.userList.map(user => ({
        email: user.email,
        name: user.name,
        role: user.role,
        groupId: this.getRoleGroupId(user.role)
      }))

      await this.softrClient.addUsers(portalId, softrUsers)

      // Send invitation emails
      for (const user of request.userList) {
        await this.sendUserInvitation(user, request.portalName, request.customerName)
      }

      logger.info('User configuration completed:', { portalId, invitationsSent: request.userList.length })
    } catch (error) {
      logger.error('Error configuring users:', { portalId, error: (error as Error).message })
      throw error
    }
  }

  /**
   * Send user invitation email
   */
  private async sendUserInvitation(
    user: { name: string; email: string; role: string },
    portalName: string,
    companyName: string
  ): Promise<void> {
    try {
      const invitationLink = `https://${portalName.toLowerCase().replace(/\s+/g, '-')}.softr.app/signup?email=${encodeURIComponent(user.email)}`

      await this.emailClient.sendTemplateEmail('user_invitation', [user.email], {
        userName: user.name,
        portalName,
        companyName,
        invitationLink
      })

      logger.info('User invitation sent:', { email: user.email, portalName })
    } catch (error) {
      logger.error('Error sending user invitation:', { email: user.email, error: (error as Error).message })
      // Don't fail the entire provisioning for email errors
    }
  }

  /**
   * Send completion notifications
   */
  private async sendCompletionNotifications(
    request: ProvisioningRequest,
    baseId: string,
    portalId: string
  ): Promise<void> {
    try {
      const portalUrl = `https://${request.portalName.toLowerCase().replace(/\s+/g, '-')}.softr.app`
      
      await this.emailClient.sendEmail({
        to: [request.customerEmail],
        subject: `Your CRM Portal is Ready: ${request.portalName}`,
        htmlContent: `
          <h1>Your CRM Portal is Ready!</h1>
          <p>Hi there,</p>
          <p>Great news! Your CRM portal "${request.portalName}" has been successfully created and is ready to use.</p>
          <p><strong>Portal URL:</strong> <a href="${portalUrl}">${portalUrl}</a></p>
          <p><strong>Airtable Base ID:</strong> ${baseId}</p>
          <p>You can now:</p>
          <ul>
            <li>Access your portal and start managing projects</li>
            <li>Invite team members and clients</li>
            <li>Customize the portal to match your needs</li>
          </ul>
          <p>If you need any assistance, please don't hesitate to reach out.</p>
          <p>Best regards,<br>The CRM Portal Team</p>
        `,
        textContent: `
          Your CRM Portal is Ready!
          
          Hi there,
          
          Great news! Your CRM portal "${request.portalName}" has been successfully created and is ready to use.
          
          Portal URL: ${portalUrl}
          Airtable Base ID: ${baseId}
          
          You can now:
          - Access your portal and start managing projects
          - Invite team members and clients
          - Customize the portal to match your needs
          
          If you need any assistance, please don't hesitate to reach out.
          
          Best regards,
          The CRM Portal Team
        `
      })

      logger.info('Completion notification sent:', { customerEmail: request.customerEmail })
    } catch (error) {
      logger.error('Error sending completion notification:', { error: (error as Error).message })
      // Don't fail provisioning for email errors
    }
  }

  /**
   * Get role group ID for Softr
   */
  private getRoleGroupId(role: string): string {
    const groupMap = {
      'admin': 'administrators',
      'team': 'team_members',
      'client': 'clients'
    }
    return groupMap[role as keyof typeof groupMap] || 'clients'
  }

  /**
   * Update job status and progress
   */
  private async updateJobStatus(
    jobId: string, 
    status: string, 
    progress: number, 
    error?: string
  ): Promise<void> {
    try {
      await this.prisma.queueJob.update({
        where: { id: jobId },
        data: {
          status,
          data: JSON.stringify({ progress, error }),
          updatedAt: new Date(),
          ...(status === 'completed' && { completedAt: new Date() }),
          ...(error && { errorMessage: error })
        }
      })

      logger.info('Job status updated:', { jobId, status, progress })
    } catch (updateError) {
      logger.error('Error updating job status:', { 
        jobId, 
        status, 
        error: (updateError as Error).message 
      })
    }
  }

  /**
   * Get provisioning job status
   */
  async getJobStatus(jobId: string): Promise<ProvisioningJob | null> {
    try {
      const job = await this.prisma.queueJob.findUnique({
        where: { id: jobId }
      })

      if (!job) {
        return null
      }

      const jobData = job.data ? JSON.parse(job.data as string) : {}

      return {
        id: job.id,
        customerId: job.baseId,
        status: job.status as any,
        progress: jobData.progress || 0,
        error: job.errorMessage || undefined,
        startedAt: job.createdAt,
        completedAt: job.completedAt || undefined,
        estimatedCompletion: job.scheduledAt
      }
    } catch (error) {
      logger.error('Error getting job status:', { jobId, error: (error as Error).message })
      return null
    }
  }

  /**
   * Cancel provisioning job
   */
  async cancelJob(jobId: string): Promise<void> {
    try {
      await this.prisma.queueJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          errorMessage: 'Cancelled by user',
          completedAt: new Date()
        }
      })

      logger.info('Provisioning job cancelled:', { jobId })
    } catch (error) {
      logger.error('Error cancelling job:', { jobId, error: (error as Error).message })
      throw error
    }
  }

  /**
   * Get all provisioning jobs for a customer
   */
  async getCustomerJobs(customerId: string): Promise<ProvisioningJob[]> {
    try {
      const jobs = await this.prisma.queueJob.findMany({
        where: {
          baseId: customerId,
          jobType: 'provisioning'
        },
        orderBy: { createdAt: 'desc' }
      })

      return jobs.map(job => {
        const jobData = job.data ? JSON.parse(job.data as string) : {}
        
        return {
          id: job.id,
          customerId: job.baseId,
          status: job.status as any,
          progress: jobData.progress || 0,
          error: job.errorMessage || undefined,
          startedAt: job.createdAt,
          completedAt: job.completedAt || undefined,
          estimatedCompletion: job.scheduledAt
        }
      })
    } catch (error) {
      logger.error('Error getting customer jobs:', { customerId, error: (error as Error).message })
      return []
    }
  }
}