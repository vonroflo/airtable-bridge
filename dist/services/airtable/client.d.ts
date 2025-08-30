import { PrismaClient } from '@prisma/client';
export interface QueryOptions {
    filterByFormula?: string;
    sort?: Array<{
        field: string;
        direction?: 'asc' | 'desc';
    }>;
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
export declare class AirtableClient {
    private prisma;
    private clients;
    private maxRetries;
    private baseDelay;
    constructor(prisma: PrismaClient);
    /**
     * Get or create Airtable client for a base
     */
    private getClient;
    /**
     * Create records in batch
     */
    createRecords(baseId: string, tableId: string, records: CreateRecordData[]): Promise<AirtableResponse>;
    /**
     * Update records in batch
     */
    updateRecords(baseId: string, tableId: string, records: UpdateRecordData[]): Promise<AirtableResponse>;
    /**
     * Delete records in batch
     */
    deleteRecords(baseId: string, tableId: string, recordIds: string[]): Promise<AirtableResponse>;
    /**
     * Query records with options
     */
    queryRecords(baseId: string, tableId: string, options?: QueryOptions): Promise<AirtableResponse>;
    /**
     * Get a single record by ID
     */
    getRecord(baseId: string, tableId: string, recordId: string): Promise<any>;
    /**
     * Retry logic with exponential backoff
     */
    private withRetry;
    /**
     * Determine if an error should not be retried
     */
    private shouldNotRetry;
    /**
     * Handle and transform errors
     */
    private handleError;
    /**
     * Extract status code from error
     */
    private getStatusCode;
    /**
     * Log API call metrics
     */
    private logApiCall;
    /**
     * Sleep utility for retry delays
     */
    private sleep;
    /**
     * Clear cached clients (useful for testing or when API keys change)
     */
    clearCache(): void;
}
//# sourceMappingURL=client.d.ts.map