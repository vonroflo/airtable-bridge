"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ENDPOINTS = exports.apiClient = exports.API_BASE_URL = void 0;
exports.API_BASE_URL = '/api';
class ApiClient {
    async request(endpoint, options = {}) {
        const url = `${exports.API_BASE_URL}${endpoint}`;
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}
exports.apiClient = new ApiClient();
// API endpoints
exports.API_ENDPOINTS = {
    health: '/api/health',
    bases: '/bases',
    metrics: (baseId) => `/bases/${baseId}/metrics`,
    rateLimitStatus: (baseId) => `/${baseId}/rate-limit/status`,
    records: (baseId, tableId) => `/${baseId}/tables/${tableId}/records`,
    batchStatus: (baseId, tableId, operationType) => `/${baseId}/tables/${tableId}/batch/${operationType}/status`,
};
//# sourceMappingURL=api.js.map