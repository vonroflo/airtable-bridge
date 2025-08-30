import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, API_ENDPOINTS } from '../utils/api'
import { AirtableBase } from '../types'

export function useBases(page = 1, limit = 10, active?: boolean) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(active !== undefined && { active: active.toString() })
  })

  return useQuery<{
    bases: AirtableBase[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }>({
    queryKey: ['bases', page, limit, active],
    queryFn: () => apiClient.get(`${API_ENDPOINTS.bases}?${params}`),
  })
}

export function useCreateBase() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: {
      baseId: string
      name: string
      apiKey: string
      rateLimitRpm?: number
      recordLimit?: number
      storageLimit?: number
    }) => apiClient.post(API_ENDPOINTS.bases, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bases'] })
    },
  })
}

export function useUpdateBase() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ baseId, ...data }: {
      baseId: string
      name?: string
      apiKey?: string
      rateLimitRpm?: number
      recordLimit?: number
      storageLimit?: number
      isActive?: boolean
    }) => apiClient.put(`${API_ENDPOINTS.bases}/${baseId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bases'] })
    },
  })
}

export function useDeleteBase() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (baseId: string) => apiClient.delete(`${API_ENDPOINTS.bases}/${baseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bases'] })
    },
  })
}