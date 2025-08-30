import { useQuery } from '@tanstack/react-query'
import { apiClient, API_ENDPOINTS } from '../utils/api'
import { SystemHealth } from '../types'

export function useSystemHealth() {
  return useQuery<SystemHealth>({
    queryKey: ['system-health'],
    queryFn: () => apiClient.get(API_ENDPOINTS.health),
    refetchInterval: 5000,
    staleTime: 0,
  })
}