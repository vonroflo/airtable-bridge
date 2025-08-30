export interface CRMTable {
  name: string
  description: string
  fields: CRMField[]
  views: CRMView[]
}

export interface CRMField {
  name: string
  type: string
  description: string
  options?: any
  required?: boolean
}

export interface CRMView {
  name: string
  type: 'grid' | 'kanban' | 'calendar' | 'gallery' | 'form'
  filterByFormula?: string
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>
  groupBy?: string
}

export interface CRMSchema {
  name: string
  description: string
  tables: CRMTable[]
  relationships: CRMRelationship[]
}

export interface CRMRelationship {
  fromTable: string
  toTable: string
  type: 'one-to-many' | 'many-to-many' | 'one-to-one'
  fromField: string
  toField: string
}

export const CRM_SCHEMA: CRMSchema = {
  name: 'Standard CRM Schema',
  description: 'Complete CRM schema with users, clients, projects, tasks, files, invoices, and messages',
  tables: [
    {
      name: 'Users',
      description: 'Team members and system users',
      fields: [
        { name: 'Name', type: 'singleLineText', description: 'Full name', required: true },
        { name: 'Email', type: 'email', description: 'Email address', required: true },
        { name: 'Role', type: 'singleSelect', description: 'User role', required: true, options: {
          choices: [
            { name: 'Admin', color: 'redBright' },
            { name: 'Team Member', color: 'blueBright' },
            { name: 'Client', color: 'greenBright' }
          ]
        }},
        { name: 'Company', type: 'singleLineText', description: 'Company name' },
        { name: 'Active Status', type: 'checkbox', description: 'User is active' },
        { name: 'Phone', type: 'phoneNumber', description: 'Contact phone number' },
        { name: 'Avatar', type: 'multipleAttachments', description: 'Profile picture' },
        { name: 'Created Date__calc', type: 'dateTime', description: 'Shadow field for created date' },
        { name: 'Last Modified__calc', type: 'dateTime', description: 'Shadow field for last modified' }
      ],
      views: [
        { name: 'All Users', type: 'grid' },
        { name: 'Active Users', type: 'grid', filterByFormula: '{Active Status} = TRUE()' },
        { name: 'Clients Only', type: 'grid', filterByFormula: '{Role} = "Client"' },
        { name: 'Team Members', type: 'grid', filterByFormula: '{Role} = "Team Member"' }
      ]
    },
    {
      name: 'Clients',
      description: 'Customer companies and contacts',
      fields: [
        { name: 'Company Name', type: 'singleLineText', description: 'Client company name', required: true },
        { name: 'Primary Contact', type: 'linkToAnotherRecord', description: 'Main contact person', options: { linkedTableId: 'Users' }},
        { name: 'Email', type: 'email', description: 'Primary email address' },
        { name: 'Phone', type: 'phoneNumber', description: 'Primary phone number' },
        { name: 'Address', type: 'multilineText', description: 'Business address' },
        { name: 'Status', type: 'singleSelect', description: 'Client status', options: {
          choices: [
            { name: 'Active', color: 'greenBright' },
            { name: 'Inactive', color: 'grayBright' },
            { name: 'Prospect', color: 'yellowBright' },
            { name: 'Former', color: 'redBright' }
          ]
        }},
        { name: 'Outstanding Balance', type: 'currency', description: 'Total unpaid invoices', options: { precision: 2 }},
        { name: 'Website', type: 'url', description: 'Company website' },
        { name: 'Notes', type: 'multilineText', description: 'Client notes and history' },
        { name: 'Created Date__calc', type: 'dateTime', description: 'Shadow field for created date' },
        { name: 'Last Modified__calc', type: 'dateTime', description: 'Shadow field for last modified' }
      ],
      views: [
        { name: 'All Clients', type: 'grid' },
        { name: 'Active Clients', type: 'grid', filterByFormula: '{Status} = "Active"' },
        { name: 'Outstanding Balance', type: 'grid', filterByFormula: '{Outstanding Balance} > 0', sort: [{ field: 'Outstanding Balance', direction: 'desc' }] }
      ]
    },
    {
      name: 'Projects',
      description: 'Client projects and engagements',
      fields: [
        { name: 'Name', type: 'singleLineText', description: 'Project name', required: true },
        { name: 'Client', type: 'linkToAnotherRecord', description: 'Associated client', required: true, options: { linkedTableId: 'Clients' }},
        { name: 'Start Date', type: 'date', description: 'Project start date' },
        { name: 'Due Date', type: 'date', description: 'Project deadline' },
        { name: 'Status', type: 'singleSelect', description: 'Project status', options: {
          choices: [
            { name: 'Planning', color: 'grayBright' },
            { name: 'In Progress', color: 'blueBright' },
            { name: 'Review', color: 'yellowBright' },
            { name: 'Completed', color: 'greenBright' },
            { name: 'On Hold', color: 'redBright' }
          ]
        }},
        { name: 'Budget', type: 'currency', description: 'Project budget', options: { precision: 2 }},
        { name: 'Progress', type: 'percent', description: 'Completion percentage' },
        { name: 'Description', type: 'multilineText', description: 'Project description and scope' },
        { name: 'Team Members', type: 'linkToAnotherRecord', description: 'Assigned team members', options: { linkedTableId: 'Users' }},
        { name: 'Created Date__calc', type: 'dateTime', description: 'Shadow field for created date' },
        { name: 'Last Modified__calc', type: 'dateTime', description: 'Shadow field for last modified' }
      ],
      views: [
        { name: 'All Projects', type: 'grid' },
        { name: 'Active Projects', type: 'grid', filterByFormula: 'AND({Status} != "Completed", {Status} != "On Hold")' },
        { name: 'Project Calendar', type: 'calendar', groupBy: 'Due Date' },
        { name: 'By Status', type: 'kanban', groupBy: 'Status' }
      ]
    },
    {
      name: 'Tasks',
      description: 'Project tasks and deliverables',
      fields: [
        { name: 'Name', type: 'singleLineText', description: 'Task name', required: true },
        { name: 'Project', type: 'linkToAnotherRecord', description: 'Associated project', required: true, options: { linkedTableId: 'Projects' }},
        { name: 'Assignee', type: 'linkToAnotherRecord', description: 'Assigned team member', options: { linkedTableId: 'Users' }},
        { name: 'Status', type: 'singleSelect', description: 'Task status', options: {
          choices: [
            { name: 'To Do', color: 'grayBright' },
            { name: 'In Progress', color: 'blueBright' },
            { name: 'Review', color: 'yellowBright' },
            { name: 'Done', color: 'greenBright' },
            { name: 'Blocked', color: 'redBright' }
          ]
        }},
        { name: 'Priority', type: 'singleSelect', description: 'Task priority', options: {
          choices: [
            { name: 'Low', color: 'grayBright' },
            { name: 'Medium', color: 'yellowBright' },
            { name: 'High', color: 'orangeBright' },
            { name: 'Critical', color: 'redBright' }
          ]
        }},
        { name: 'Due Date', type: 'date', description: 'Task deadline' },
        { name: 'Estimated Hours', type: 'number', description: 'Estimated time to complete', options: { precision: 1 }},
        { name: 'Actual Hours', type: 'number', description: 'Actual time spent', options: { precision: 1 }},
        { name: 'Description', type: 'multilineText', description: 'Task description and requirements' },
        { name: 'Dependencies', type: 'linkToAnotherRecord', description: 'Dependent tasks', options: { linkedTableId: 'Tasks' }},
        { name: 'Created Date__calc', type: 'dateTime', description: 'Shadow field for created date' },
        { name: 'Last Modified__calc', type: 'dateTime', description: 'Shadow field for last modified' }
      ],
      views: [
        { name: 'All Tasks', type: 'grid' },
        { name: 'My Tasks', type: 'grid', filterByFormula: '{Assignee} = CURRENT_USER()' },
        { name: 'Task Kanban', type: 'kanban', groupBy: 'Status' },
        { name: 'By Priority', type: 'grid', sort: [{ field: 'Priority', direction: 'desc' }] },
        { name: 'Overdue Tasks', type: 'grid', filterByFormula: 'AND({Due Date} < TODAY(), {Status} != "Done")' }
      ]
    },
    {
      name: 'Files',
      description: 'Project files and documents',
      fields: [
        { name: 'Name', type: 'singleLineText', description: 'File name', required: true },
        { name: 'Project', type: 'linkToAnotherRecord', description: 'Associated project', required: true, options: { linkedTableId: 'Projects' }},
        { name: 'File', type: 'multipleAttachments', description: 'Uploaded file', required: true },
        { name: 'Version', type: 'singleLineText', description: 'File version number' },
        { name: 'Upload Date', type: 'dateTime', description: 'When file was uploaded' },
        { name: 'File Type', type: 'singleSelect', description: 'Document category', options: {
          choices: [
            { name: 'Document', color: 'blueBright' },
            { name: 'Image', color: 'greenBright' },
            { name: 'Spreadsheet', color: 'yellowBright' },
            { name: 'Presentation', color: 'orangeBright' },
            { name: 'Other', color: 'grayBright' }
          ]
        }},
        { name: 'Uploaded By', type: 'linkToAnotherRecord', description: 'User who uploaded', options: { linkedTableId: 'Users' }},
        { name: 'Description', type: 'multilineText', description: 'File description' },
        { name: 'Previous Version', type: 'linkToAnotherRecord', description: 'Previous file version', options: { linkedTableId: 'Files' }},
        { name: 'Created Date__calc', type: 'dateTime', description: 'Shadow field for created date' },
        { name: 'Last Modified__calc', type: 'dateTime', description: 'Shadow field for last modified' }
      ],
      views: [
        { name: 'All Files', type: 'grid' },
        { name: 'Recent Files', type: 'grid', sort: [{ field: 'Upload Date', direction: 'desc' }] },
        { name: 'By Type', type: 'grid', groupBy: 'File Type' }
      ]
    },
    {
      name: 'Invoices',
      description: 'Client invoices and billing',
      fields: [
        { name: 'Invoice Number', type: 'singleLineText', description: 'Unique invoice number', required: true },
        { name: 'Client', type: 'linkToAnotherRecord', description: 'Billing client', required: true, options: { linkedTableId: 'Clients' }},
        { name: 'Project', type: 'linkToAnotherRecord', description: 'Associated project', options: { linkedTableId: 'Projects' }},
        { name: 'Amount', type: 'currency', description: 'Invoice total', required: true, options: { precision: 2 }},
        { name: 'Status', type: 'singleSelect', description: 'Payment status', options: {
          choices: [
            { name: 'Draft', color: 'grayBright' },
            { name: 'Sent', color: 'blueBright' },
            { name: 'Paid', color: 'greenBright' },
            { name: 'Overdue', color: 'redBright' },
            { name: 'Cancelled', color: 'grayBright' }
          ]
        }},
        { name: 'Issue Date', type: 'date', description: 'Invoice issue date' },
        { name: 'Due Date', type: 'date', description: 'Payment due date' },
        { name: 'Payment Date', type: 'date', description: 'Date payment received' },
        { name: 'Payment Link', type: 'url', description: 'Online payment URL' },
        { name: 'Notes', type: 'multilineText', description: 'Invoice notes' },
        { name: 'Created Date__calc', type: 'dateTime', description: 'Shadow field for created date' },
        { name: 'Last Modified__calc', type: 'dateTime', description: 'Shadow field for last modified' }
      ],
      views: [
        { name: 'All Invoices', type: 'grid' },
        { name: 'Outstanding Invoices', type: 'grid', filterByFormula: 'AND({Status} != "Paid", {Status} != "Cancelled")' },
        { name: 'Overdue Invoices', type: 'grid', filterByFormula: 'AND({Due Date} < TODAY(), {Status} != "Paid")' },
        { name: 'By Status', type: 'kanban', groupBy: 'Status' }
      ]
    },
    {
      name: 'Messages',
      description: 'Project communications and notes',
      fields: [
        { name: 'Content', type: 'multilineText', description: 'Message content', required: true },
        { name: 'Sender', type: 'linkToAnotherRecord', description: 'Message sender', required: true, options: { linkedTableId: 'Users' }},
        { name: 'Recipient', type: 'linkToAnotherRecord', description: 'Message recipient', options: { linkedTableId: 'Users' }},
        { name: 'Project', type: 'linkToAnotherRecord', description: 'Associated project', options: { linkedTableId: 'Projects' }},
        { name: 'Timestamp', type: 'dateTime', description: 'Message timestamp', required: true },
        { name: 'Type', type: 'singleSelect', description: 'Message type', options: {
          choices: [
            { name: 'Note', color: 'blueBright' },
            { name: 'Update', color: 'greenBright' },
            { name: 'Question', color: 'yellowBright' },
            { name: 'Issue', color: 'redBright' }
          ]
        }},
        { name: 'Attachments', type: 'multipleAttachments', description: 'Message attachments' },
        { name: 'Read Status', type: 'checkbox', description: 'Message has been read' },
        { name: 'Created Date__calc', type: 'dateTime', description: 'Shadow field for created date' },
        { name: 'Last Modified__calc', type: 'dateTime', description: 'Shadow field for last modified' }
      ],
      views: [
        { name: 'All Messages', type: 'grid', sort: [{ field: 'Timestamp', direction: 'desc' }] },
        { name: 'Unread Messages', type: 'grid', filterByFormula: '{Read Status} = FALSE()' },
        { name: 'By Project', type: 'grid', groupBy: 'Project' }
      ]
    }
  ],
  relationships: [
    { fromTable: 'Clients', toTable: 'Users', type: 'one-to-many', fromField: 'Primary Contact', toField: 'Company' },
    { fromTable: 'Projects', toTable: 'Clients', type: 'many-to-one', fromField: 'Client', toField: 'Company Name' },
    { fromTable: 'Tasks', toTable: 'Projects', type: 'many-to-one', fromField: 'Project', toField: 'Name' },
    { fromTable: 'Tasks', toTable: 'Users', type: 'many-to-one', fromField: 'Assignee', toField: 'Name' },
    { fromTable: 'Files', toTable: 'Projects', type: 'many-to-one', fromField: 'Project', toField: 'Name' },
    { fromTable: 'Files', toTable: 'Users', type: 'many-to-one', fromField: 'Uploaded By', toField: 'Name' },
    { fromTable: 'Invoices', toTable: 'Clients', type: 'many-to-one', fromField: 'Client', toField: 'Company Name' },
    { fromTable: 'Invoices', toTable: 'Projects', type: 'many-to-one', fromField: 'Project', toField: 'Name' },
    { fromTable: 'Messages', toTable: 'Users', type: 'many-to-one', fromField: 'Sender', toField: 'Name' },
    { fromTable: 'Messages', toTable: 'Users', type: 'many-to-one', fromField: 'Recipient', toField: 'Name' },
    { fromTable: 'Messages', toTable: 'Projects', type: 'many-to-one', fromField: 'Project', toField: 'Name' },
    { fromTable: 'Tasks', toTable: 'Tasks', type: 'many-to-many', fromField: 'Dependencies', toField: 'Name' },
    { fromTable: 'Files', toTable: 'Files', type: 'one-to-one', fromField: 'Previous Version', toField: 'Name' }
  ]
}

export class CRMSchemaService {
  /**
   * Deploy CRM schema to an Airtable base
   */
  async deploySchema(baseId: string, schema: CRMSchema = CRM_SCHEMA): Promise<void> {
    // Implementation would use Airtable API to create tables and fields
    console.log(`Deploying CRM schema to base ${baseId}:`, schema)
    
    // This would be implemented with actual Airtable API calls
    // For now, this is a placeholder that shows the structure
  }

  /**
   * Validate schema deployment
   */
  async validateSchema(baseId: string, schema: CRMSchema = CRM_SCHEMA): Promise<boolean> {
    // Implementation would verify all tables and fields exist
    console.log(`Validating CRM schema for base ${baseId}`)
    return true
  }

  /**
   * Get schema deployment progress
   */
  async getDeploymentProgress(baseId: string): Promise<{
    tablesCreated: number
    totalTables: number
    fieldsCreated: number
    totalFields: number
    viewsCreated: number
    totalViews: number
    progress: number
  }> {
    // Mock progress for demonstration
    return {
      tablesCreated: 5,
      totalTables: 7,
      fieldsCreated: 45,
      totalFields: 52,
      viewsCreated: 18,
      totalViews: 22,
      progress: 85
    }
  }
}