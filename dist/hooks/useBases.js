"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBases = useBases;
exports.useCreateBase = useCreateBase;
exports.useUpdateBase = useUpdateBase;
exports.useDeleteBase = useDeleteBase;
const react_query_1 = require("@tanstack/react-query");
const api_1 = require("../utils/api");
function useBases(page = 1, limit = 10, active) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(active !== undefined && { active: active.toString() })
    });
    return (0, react_query_1.useQuery)({
        queryKey: ['bases', page, limit, active],
        queryFn: () => api_1.apiClient.get(`${api_1.API_ENDPOINTS.bases}?${params}`),
    });
}
function useCreateBase() {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (data) => api_1.apiClient.post(api_1.API_ENDPOINTS.bases, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bases'] });
        },
    });
}
function useUpdateBase() {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: ({ baseId, ...data }) => api_1.apiClient.put(`${api_1.API_ENDPOINTS.bases}/${baseId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bases'] });
        },
    });
}
function useDeleteBase() {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: (baseId) => api_1.apiClient.delete(`${api_1.API_ENDPOINTS.bases}/${baseId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bases'] });
        },
    });
}
//# sourceMappingURL=useBases.js.map