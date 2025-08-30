"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBaseMetrics = useBaseMetrics;
exports.useRateLimitStatus = useRateLimitStatus;
exports.useSystemMetrics = useSystemMetrics;
const react_query_1 = require("@tanstack/react-query");
const api_1 = require("../utils/api");
function useBaseMetrics(baseId, period = '24h') {
    return (0, react_query_1.useQuery)({
        queryKey: ['base-metrics', baseId, period],
        queryFn: () => api_1.apiClient.get(`${api_1.API_ENDPOINTS.metrics(baseId)}?period=${period}`),
        enabled: !!baseId,
    });
}
function useRateLimitStatus(baseId) {
    return (0, react_query_1.useQuery)({
        queryKey: ['rate-limit-status', baseId],
        queryFn: () => api_1.apiClient.get(api_1.API_ENDPOINTS.rateLimitStatus(baseId)),
        enabled: !!baseId,
        refetchInterval: 2000, // More frequent for rate limits
    });
}
function useSystemMetrics() {
    return (0, react_query_1.useQuery)({
        queryKey: ['system-metrics'],
        queryFn: async () => {
            // Aggregate metrics from multiple endpoints
            const [health, bases] = await Promise.all([
                api_1.apiClient.get(api_1.API_ENDPOINTS.health),
                api_1.apiClient.get(api_1.API_ENDPOINTS.bases)
            ]);
            return {
                health,
                totalBases: bases.pagination?.total || 0,
                activeBases: bases.bases?.filter((b) => b.isActive).length || 0,
            };
        },
    });
}
//# sourceMappingURL=useMetrics.js.map