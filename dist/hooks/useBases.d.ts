import { AirtableBase } from '../types';
export declare function useBases(page?: number, limit?: number, active?: boolean): import("@tanstack/react-query").UseQueryResult<{
    bases: AirtableBase[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}, Error>;
export declare function useCreateBase(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    baseId: string;
    name: string;
    apiKey: string;
    rateLimitRpm?: number;
    recordLimit?: number;
    storageLimit?: number;
}, unknown>;
export declare function useUpdateBase(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    baseId: string;
    name?: string;
    apiKey?: string;
    rateLimitRpm?: number;
    recordLimit?: number;
    storageLimit?: number;
    isActive?: boolean;
}, unknown>;
export declare function useDeleteBase(): import("@tanstack/react-query").UseMutationResult<unknown, Error, string, unknown>;
//# sourceMappingURL=useBases.d.ts.map