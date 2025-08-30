import { PrismaClient } from '@prisma/client'
import { logger } from '../../utils/logger'

export interface Tenant {
  id: string
  name: string
  email: string
  deploymentModel: 'isolated' | 'shared'
  airtableBaseId?: string
  softrPortalId?: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt: Date
  updatedAt: Date
  subscription: {
    plan: string
    status: string
    expiresAt?: Date
  }
}

export interface TenantConfig {
  maxUsers: number
  maxProjects: number
  maxStorage: number // in MB
  features: string[]
}

export class TenantManager {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * Create new tenant
   */
  async createTenant(data: {
    name: string
    email: string
    deploymentModel: 'isolated' | 'shared'
    subscriptionPlan: string
  }): Promise<Tenant> {
    try {
      const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // In a real implementation, this would create a tenant record
      // For now, we'll use the existing customer structure
      const tenant: Tenant = {
        id: tenantId,
        name: data.name,
        email: data.email,
        deploymentModel: data.deploymentModel,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        subscription: {
          plan: data.subscriptionPlan,
          status: 'active'
        }
      }

      logger.info('Tenant created:', { tenantId, name: data.name, model: data.deploymentModel })
      return tenant
    } catch (error) {
      logger.error('Error creating tenant:', { error: (error as Error).message })
      throw error
    }
  }

  /**
   * Get tenant by ID
   */
  async getTenant(tenantId: string): Promise<Tenant | null> {
    try {
      // Mock implementation - would fetch from actual tenant table
      return {
        id: tenantId,
        name: 'Sample Tenant',
        email: 'admin@example.com',
        deploymentModel: 'isolated',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        subscription: {
          plan: 'professional',
          status: 'active'
        }
      }
    } catch (error) {
      logger.error('Error getting tenant:', { tenantId, error: (error as Error).message })
      return null
    }
  }

  /**
   * Update tenant configuration
   */
  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant> {
    try {
      logger.info('Updating tenant:', { tenantId, updates: Object.keys(updates) })

      // Mock implementation - would update actual tenant record
      const tenant = await this.getTenant(tenantId)
      if (!tenant) {
        throw new Error(`Tenant not found: ${tenantId}`)
      }

      const updatedTenant = { ...tenant, ...updates, updatedAt: new Date() }
      
      logger.info('Tenant updated:', { tenantId })
      return updatedTenant
    } catch (error) {
      logger.error('Error updating tenant:', { tenantId, error: (error as Error).message })
      throw error
    }
  }

  /**
   * Get tenant configuration limits
   */
  async getTenantConfig(tenantId: string): Promise<TenantConfig> {
    try {
      const tenant = await this.getTenant(tenantId)
      if (!tenant) {
        throw new Error(`Tenant not found: ${tenantId}`)
      }

      // Return config based on subscription plan
      const configs: Record<string, TenantConfig> = {
        'starter': {
          maxUsers: 5,
          maxProjects: 10,
          maxStorage: 1000, // 1GB
          features: ['basic_crm', 'project_management']
        },
        'professional': {
          maxUsers: 25,
          maxProjects: 100,
          maxStorage: 10000, // 10GB
          features: ['basic_crm', 'project_management', 'invoicing', 'time_tracking']
        },
        'enterprise': {
          maxUsers: 100,
          maxProjects: 1000,
          maxStorage: 100000, // 100GB
          features: ['basic_crm', 'project_management', 'invoicing', 'time_tracking', 'advanced_reporting', 'api_access']
        }
      }

      return configs[tenant.subscription.plan] || configs['starter']
    } catch (error) {
      logger.error('Error getting tenant config:', { tenantId, error: (error as Error).message })
      throw error
    }
  }

  /**
   * Check if tenant can perform action based on limits
   */
  async checkTenantLimits(tenantId: string, action: string, currentCount: number): Promise<boolean> {
    try {
      const config = await this.getTenantConfig(tenantId)
      
      switch (action) {
        case 'create_user':
          return currentCount < config.maxUsers
        case 'create_project':
          return currentCount < config.maxProjects
        case 'upload_file':
          return currentCount < config.maxStorage
        default:
          return true
      }
    } catch (error) {
      logger.error('Error checking tenant limits:', { tenantId, action, error: (error as Error).message })
      return false
    }
  }

  /**
   * Get tenant usage statistics
   */
  async getTenantUsage(tenantId: string): Promise<{
    users: number
    projects: number
    storage: number
    apiCalls: number
  }> {
    try {
      // Mock implementation - would calculate actual usage
      return {
        users: 12,
        projects: 45,
        storage: 2500, // MB
        apiCalls: 15000
      }
    } catch (error) {
      logger.error('Error getting tenant usage:', { tenantId, error: (error as Error).message })
      return { users: 0, projects: 0, storage: 0, apiCalls: 0 }
    }
  }

  /**
   * Suspend tenant (disable access)
   */
  async suspendTenant(tenantId: string, reason: string): Promise<void> {
    try {
      await this.updateTenant(tenantId, { status: 'suspended' })
      
      logger.info('Tenant suspended:', { tenantId, reason })
    } catch (error) {
      logger.error('Error suspending tenant:', { tenantId, error: (error as Error).message })
      throw error
    }
  }

  /**
   * Reactivate suspended tenant
   */
  async reactivateTenant(tenantId: string): Promise<void> {
    try {
      await this.updateTenant(tenantId, { status: 'active' })
      
      logger.info('Tenant reactivated:', { tenantId })
    } catch (error) {
      logger.error('Error reactivating tenant:', { tenantId, error: (error as Error).message })
      throw error
    }
  }
}