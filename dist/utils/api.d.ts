export declare const API_BASE_URL = "/api";
export interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    message?: string;
}
declare class ApiClient {
    private request;
    get<T>(endpoint: string): Promise<T>;
    post<T>(endpoint: string, data?: any): Promise<T>;
    put<T>(endpoint: string, data?: any): Promise<T>;
    delete<T>(endpoint: string): Promise<T>;
}
export declare const apiClient: ApiClient;
export declare const API_ENDPOINTS: {
    health: string;
    bases: string;
    metrics: (baseId: string) => string;
    rateLimitStatus: (baseId: string) => string;
    records: (baseId: string, tableId: string) => string;
    batchStatus: (baseId: string, tableId: string, operationType: string) => string;
};
export {};
//# sourceMappingURL=api.d.ts.map