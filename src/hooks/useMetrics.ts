import { useQuery } from '@tanstack/react-query'
import { apiClient, API_ENDPOINTS } from '../utils/api'
import { BaseMetrics, RateLimitStatus } from '../types'

export function useBaseMetrics(baseId: string, period = '24h') {
  return useQuery<BaseMetrics>({
    queryKey: ['base-metrics', baseId, period],
    queryFn: () => apiClient.get(`${API_ENDPOINTS.metrics(baseId)}?period=${period}`),
    enabled: !!baseId,
  })
}

export function useRateLimitStatus(baseId: string) {
  return useQuery<RateLimitStatus>({
    queryKey: ['rate-limit-status', baseId],
    queryFn: () => apiClient.get(API_ENDPOINTS.rateLimitStatus(baseId)),
    enabled: !!baseId,
    refetchInterval: 2000, // More frequent for rate limits
  })
}

export function useSystemMetrics() {
  return useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      // Aggregate metrics from multiple endpoints
      const [health, bases] = await Promise.all([
        apiClient.get(API_ENDPOINTS.health),
        apiClient.get(API_ENDPOINTS.bases)
      ])

      return {
        health,
        totalBases: bases.pagination?.total || 0,
        activeBases: bases.bases?.filter((b: AirtableBase) => b.isActive).length || 0,
      }
    },
  })
}