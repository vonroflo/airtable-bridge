"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSystemHealth = useSystemHealth;
const react_query_1 = require("@tanstack/react-query");
const api_1 = require("../utils/api");
function useSystemHealth() {
    return (0, react_query_1.useQuery)({
        queryKey: ['system-health'],
        queryFn: () => api_1.apiClient.get(api_1.API_ENDPOINTS.health),
        refetchInterval: 5000,
        staleTime: 0,
    });
}
//# sourceMappingURL=useSystemHealth.js.map