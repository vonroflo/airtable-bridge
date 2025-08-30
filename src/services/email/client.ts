import { logger } from '../../utils/logger'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  variables: string[]
}

export interface EmailMessage {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  htmlContent?: string
  textContent?: string
  templateId?: string
  templateData?: Record<string, any>
  attachments?: EmailAttachment[]
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType: string
}

export interface EmailDeliveryStatus {
  messageId: string
  status: 'sent' | 'delivered' | 'bounced' | 'failed'
  timestamp: string
  error?: string
}

export class EmailClient {
  private apiKey: string
  private provider: 'sendgrid' | 'mailgun' | 'ses'
  private fromEmail: string
  private fromName: string

  constructor(config: {
    provider: 'sendgrid' | 'mailgun' | 'ses'
    apiKey: string
    fromEmail: string
    fromName: string
  }) {
    this.provider = config.provider
    this.apiKey = config.apiKey
    this.fromEmail = config.fromEmail
    this.fromName = config.fromName
  }

  /**
   * Send email message
   */
  async sendEmail(message: EmailMessage): Promise<string> {
    try {
      logger.info('Sending email:', { 
        to: message.to, 
        subject: message.subject,
        provider: this.provider 
      })

      // Mock implementation - would integrate with actual email service
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      logger.info('Email sent successfully:', { messageId, to: message.to })
      return messageId
    } catch (error) {
      logger.error('Error sending email:', { error: (error as Error).message, to: message.to })
      throw error
    }
  }

  /**
   * Send email using template
   */
  async sendTemplateEmail(templateId: string, to: string[], templateData: Record<string, any>): Promise<string> {
    const template = await this.getTemplate(templateId)
    
    const message: EmailMessage = {
      to,
      subject: this.replaceVariables(template.subject, templateData),
      htmlContent: this.replaceVariables(template.htmlContent, templateData),
      textContent: this.replaceVariables(template.textContent, templateData)
    }

    return this.sendEmail(message)
  }

  /**
   * Get email template
   */
  async getTemplate(templateId: string): Promise<EmailTemplate> {
    const templates = await this.getTemplates()
    const template = templates.find(t => t.id === templateId)
    
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }
    
    return template
  }

  /**
   * Get all email templates
   */
  async getTemplates(): Promise<EmailTemplate[]> {
    return [
      {
        id: 'user_invitation',
        name: 'User Invitation',
        subject: 'Welcome to {{portalName}} - Access Your CRM Portal',
        htmlContent: `
          <h1>Welcome to {{portalName}}!</h1>
          <p>Hi {{userName}},</p>
          <p>You've been invited to access the CRM portal for {{companyName}}.</p>
          <p>Click the link below to set up your account:</p>
          <a href="{{invitationLink}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Access Portal
          </a>
          <p>This invitation expires in 7 days.</p>
          <p>Best regards,<br>The {{companyName}} Team</p>
        `,
        textContent: `
          Welcome to {{portalName}}!
          
          Hi {{userName}},
          
          You've been invited to access the CRM portal for {{companyName}}.
          
          Click this link to set up your account: {{invitationLink}}
          
          This invitation expires in 7 days.
          
          Best regards,
          The {{companyName}} Team
        `,
        variables: ['portalName', 'userName', 'companyName', 'invitationLink']
      },
      {
        id: 'project_update',
        name: 'Project Status Update',
        subject: 'Project Update: {{projectName}}',
        htmlContent: `
          <h1>Project Update</h1>
          <p>Hi {{userName}},</p>
          <p>There's been an update to your project: <strong>{{projectName}}</strong></p>
          <p><strong>Status:</strong> {{projectStatus}}</p>
          <p><strong>Progress:</strong> {{projectProgress}}%</p>
          <p><strong>Update:</strong> {{updateMessage}}</p>
          <a href="{{projectLink}}">View Project Details</a>
          <p>Best regards,<br>The {{companyName}} Team</p>
        `,
        textContent: `
          Project Update
          
          Hi {{userName}},
          
          There's been an update to your project: {{projectName}}
          
          Status: {{projectStatus}}
          Progress: {{projectProgress}}%
          Update: {{updateMessage}}
          
          View project details: {{projectLink}}
          
          Best regards,
          The {{companyName}} Team
        `,
        variables: ['userName', 'projectName', 'projectStatus', 'projectProgress', 'updateMessage', 'projectLink', 'companyName']
      },
      {
        id: 'invoice_notification',
        name: 'Invoice Notification',
        subject: 'New Invoice: {{invoiceNumber}}',
        htmlContent: `
          <h1>New Invoice</h1>
          <p>Hi {{clientName}},</p>
          <p>A new invoice has been generated for your account.</p>
          <p><strong>Invoice Number:</strong> {{invoiceNumber}}</p>
          <p><strong>Amount:</strong> {{invoiceAmount}}</p>
          <p><strong>Due Date:</strong> {{dueDate}}</p>
          <a href="{{paymentLink}}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Pay Now
          </a>
          <p>Thank you for your business!</p>
          <p>Best regards,<br>The {{companyName}} Team</p>
        `,
        textContent: `
          New Invoice
          
          Hi {{clientName}},
          
          A new invoice has been generated for your account.
          
          Invoice Number: {{invoiceNumber}}
          Amount: {{invoiceAmount}}
          Due Date: {{dueDate}}
          
          Pay now: {{paymentLink}}
          
          Thank you for your business!
          
          Best regards,
          The {{companyName}} Team
        `,
        variables: ['clientName', 'invoiceNumber', 'invoiceAmount', 'dueDate', 'paymentLink', 'companyName']
      }
    ]
  }

  /**
   * Replace template variables with actual data
   */
  private replaceVariables(content: string, data: Record<string, any>): string {
    let result = content
    
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, String(value))
    }
    
    return result
  }

  /**
   * Get delivery status for a message
   */
  async getDeliveryStatus(messageId: string): Promise<EmailDeliveryStatus> {
    try {
      // Mock implementation - would check actual delivery status
      return {
        messageId,
        status: 'delivered',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      logger.error('Error getting delivery status:', { messageId, error: (error as Error).message })
      throw error
    }
  }

  /**
   * Create or update email template
   */
  async createTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    try {
      const newTemplate: EmailTemplate = {
        ...template,
        id: `tpl_${Date.now()}`
      }

      logger.info('Email template created:', { templateId: newTemplate.id, name: template.name })
      return newTemplate
    } catch (error) {
      logger.error('Error creating email template:', { error: (error as Error).message })
      throw error
    }
  }
}

// Email service factory
export function createEmailClient(): EmailClient {
  const provider = (process.env['EMAIL_PROVIDER'] as 'sendgrid' | 'mailgun' | 'ses') || 'sendgrid'
  const apiKey = process.env['EMAIL_API_KEY'] || ''
  const fromEmail = process.env['EMAIL_FROM_ADDRESS'] || 'noreply@example.com'
  const fromName = process.env['EMAIL_FROM_NAME'] || 'CRM Portal'

  return new EmailClient({
    provider,
    apiKey,
    fromEmail,
    fromName
  })
}