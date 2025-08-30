import Airtable from 'airtable';
import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/logger';

export interface QueryOptions {
  filterByFormula?: string;
  sort?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
  fields?: string[];
  maxRecords?: number;
  pageSize?: number;
  offset?: string;
  view?: string;
}

export interface CreateRecordData {
  fields: Record<string, any>;
}

export interface UpdateRecordData {
  id: string;
  fields: Record<string, any>;
}

export interface AirtableResponse {
  records: any[];
  offset?: string;
}

export class AirtableClient {
  private prisma: PrismaClient;
  private clients: Map<string, Airtable> = new Map();
  private maxRetries = 3;
  private baseDelay = 1000; // 1 second

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get or create Airtable client for a base
   */
  private async getClient(baseId: string): Promise<Airtable> {
    if (this.clients.has(baseId)) {
      return this.clients.get(baseId)!;
    }

    const base = await this.prisma.airtableBase.findUnique({
      where: { baseId },
      select: { apiKey: true }
    });

    if (!base) {
      throw new Error(`Base not found: ${baseId}`);
    }

    const client = new Airtable({ apiKey: base.apiKey });
    this.clients.set(baseId, client);
    return client;
  }

  /**
   * Create records in batch
   */
  async createRecords(baseId: string, tableId: string, records: CreateRecordData[]): Promise<AirtableResponse> {
    const startTime = Date.now();
    
    try {
      const client = await this.getClient(baseId);
      const table = client.base(baseId).table(tableId);
      
      const result = await this.withRetry(async () => {
        return await table.create(records);
      });

      const responseTime = Date.now() - startTime;
      await this.logApiCall(baseId, 'create', responseTime, 200, records.length);

      return {
        records: result.map(record => ({
          id: record.id,
          fields: record.fields,
          createdTime: record._rawJson.createdTime
        }))
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      await this.logApiCall(baseId, 'create', responseTime, this.getStatusCode(error), records.length);
      throw this.handleError(error, 'createRecords', { baseId, tableId, recordCount: records.length });
    }
  }

  /**
   * Update records in batch
   */
  async updateRecords(baseId: string, tableId: string, records: UpdateRecordData[]): Promise<AirtableResponse> {
    const startTime = Date.now();
    
    try {
      const client = await this.getClient(baseId);
      const table = client.base(baseId).table(tableId);
      
      const result = await this.withRetry(async () => {
        return await table.update(records);
      });

      const responseTime = Date.now() - startTime;
      await this.logApiCall(baseId, 'update', responseTime, 200, records.length);

      return {
        records: result.map(record => ({
          id: record.id,
          fields: record.fields,
          commentCount: record._rawJson.commentCount
        }))
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      await this.logApiCall(baseId, 'update', responseTime, this.getStatusCode(error), records.length);
      throw this.handleError(error, 'updateRecords', { baseId, tableId, recordCount: records.length });
    }
  }

  /**
   * Delete records in batch
   */
  async deleteRecords(baseId: string, tableId: string, recordIds: string[]): Promise<AirtableResponse> {
    const startTime = Date.now();
    
    try {
      const client = await this.getClient(baseId);
      const table = client.base(baseId).table(tableId);
      
      const result = await this.withRetry(async () => {
        return await table.destroy(recordIds);
      });

      const responseTime = Date.now() - startTime;
      await this.logApiCall(baseId, 'delete', responseTime, 200, recordIds.length);

      return {
        records: result.map(record => ({
          id: record.id,
          deleted: record._rawJson.deleted
        }))
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      await this.logApiCall(baseId, 'delete', responseTime, this.getStatusCode(error), recordIds.length);
      throw this.handleError(error, 'deleteRecords', { baseId, tableId, recordCount: recordIds.length });
    }
  }

  /**
   * Query records with options
   */
  async queryRecords(baseId: string, tableId: string, options: QueryOptions = {}): Promise<AirtableResponse> {
    const startTime = Date.now();
    
    try {
      const client = await this.getClient(baseId);
      const table = client.base(baseId).table(tableId);
      
      // Build query with basic options
      const queryOptions: any = {};
      
      if (options.filterByFormula) {
        queryOptions.filterByFormula = options.filterByFormula;
      }
      
      if (options.sort) {
        queryOptions.sort = options.sort;
      }
      
      if (options.fields) {
        queryOptions.fields = options.fields;
      }
      
      if (options.maxRecords) {
        queryOptions.maxRecords = options.maxRecords;
      }
      
      if (options.pageSize) {
        queryOptions.pageSize = options.pageSize;
      }
      
      if (options.view) {
        queryOptions.view = options.view;
      }

      const result = await this.withRetry(async () => {
        return await table.select(queryOptions).all();
      });

      const responseTime = Date.now() - startTime;
      await this.logApiCall(baseId, 'query', responseTime, 200, result.length);

      return {
        records: result.map(record => ({
          id: record.id,
          fields: record.fields,
          createdTime: record._rawJson.createdTime,
          commentCount: record._rawJson.commentCount
        }))
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      await this.logApiCall(baseId, 'query', responseTime, this.getStatusCode(error), 0);
      throw this.handleError(error, 'queryRecords', { baseId, tableId, options });
    }
  }

  /**
   * Get a single record by ID
   */
  async getRecord(baseId: string, tableId: string, recordId: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      const client = await this.getClient(baseId);
      const table = client.base(baseId).table(tableId);
      
      const result = await this.withRetry(async () => {
        return await table.find(recordId);
      });

      const responseTime = Date.now() - startTime;
      await this.logApiCall(baseId, 'get', responseTime, 200, 1);

      return {
        id: result.id,
        fields: result.fields,
        createdTime: result._rawJson.createdTime,
        commentCount: result._rawJson.commentCount
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      await this.logApiCall(baseId, 'get', responseTime, this.getStatusCode(error), 1);
      throw this.handleError(error, 'getRecord', { baseId, tableId, recordId });
    }
  }

  /**
   * Retry logic with exponential backoff
   */
  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (this.shouldNotRetry(error)) {
          throw error;
        }
        
        if (attempt < this.maxRetries) {
          const delay = this.baseDelay * Math.pow(2, attempt - 1);
                logger.warn(`Retrying operation (attempt ${attempt}/${this.maxRetries})`, {
        error: (error as Error).message,
        delay
      });
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Determine if an error should not be retried
   */
  private shouldNotRetry(error: any): boolean {
    // Don't retry on authentication errors, invalid requests, or rate limits
    const nonRetryableErrors = [
      'AUTHENTICATION_REQUIRED',
      'INVALID_API_KEY',
      'INVALID_BASE_ID',
      'INVALID_TABLE_ID',
      'INVALID_RECORD_ID',
      'INVALID_FIELD_NAME',
      'INVALID_FILTER_FORMULA',
      'INVALID_SORT_OBJECT',
      'INVALID_VIEW_ID'
    ];
    
    return nonRetryableErrors.some(errorType => 
      error.message?.includes(errorType) || error.error?.includes(errorType)
    );
  }

  /**
   * Handle and transform errors
   */
  private handleError(error: any, operation: string, context: any): Error {
    const errorMessage = error.message || error.error || 'Unknown error';
    const statusCode = this.getStatusCode(error);
    
    logger.error(`Airtable API error in ${operation}:`, {
      error: errorMessage,
      statusCode,
      context
    });

    // Create a standardized error
    const standardizedError = new Error(`Airtable API error: ${errorMessage}`);
    (standardizedError as any).statusCode = statusCode;
    (standardizedError as any).operation = operation;
    (standardizedError as any).context = context;
    
    return standardizedError;
  }

  /**
   * Extract status code from error
   */
  private getStatusCode(error: any): number {
    if (error.statusCode) return error.statusCode;
    if (error.status) return error.status;
    
    // Map common Airtable errors to status codes
    if (error.message?.includes('AUTHENTICATION_REQUIRED')) return 401;
    if (error.message?.includes('INVALID_API_KEY')) return 401;
    if (error.message?.includes('INVALID_BASE_ID')) return 404;
    if (error.message?.includes('INVALID_TABLE_ID')) return 404;
    if (error.message?.includes('RATE_LIMIT')) return 429;
    
    return 500;
  }

  /**
   * Log API call metrics
   */
  private async logApiCall(baseId: string, method: string, responseTime: number, statusCode: number, _recordCount: number): Promise<void> {
    try {
      await this.prisma.apiMetric.create({
        data: {
          baseId,
          endpoint: method,
          method: 'POST', // Most Airtable operations are POST
          statusCode,
          responseTime,
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('Error logging API call:', { baseId, error: (error as Error).message });
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear cached clients (useful for testing or when API keys change)
   */
  clearCache(): void {
    this.clients.clear();
  }
}
