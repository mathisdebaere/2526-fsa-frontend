import { defineQuery, useQuery } from '@pinia/colada'
import { useApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth'
import type { Subscription } from '@/types/api'

export const useMySubscriptions = defineQuery(() => {
  const api = useApi()
  const auth = useAuthStore()

  return useQuery({
    key: ['subscriptions', 'mine'],
    query: async (): Promise<Subscription[]> => {
      const res = await api.get<Subscription[] | { data?: Subscription[] }>('/subscriptions')
      return Array.isArray(res) ? res : (res.data ?? [])
    },
    enabled: () => auth.isClient,
  })
})
