import { BaseMetrics, RateLimitStatus } from '../types';
export declare function useBaseMetrics(baseId: string, period?: string): import("@tanstack/react-query").UseQueryResult<BaseMetrics, Error>;
export declare function useRateLimitStatus(baseId: string): import("@tanstack/react-query").UseQueryResult<RateLimitStatus, Error>;
export declare function useSystemMetrics(): import("@tanstack/react-query").UseQueryResult<{
    health: unknown;
    totalBases: any;
    activeBases: any;
}, Error>;
//# sourceMappingURL=useMetrics.d.ts.map