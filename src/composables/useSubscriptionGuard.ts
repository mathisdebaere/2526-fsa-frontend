// composable met AI om een bug op te lossen (uiteindelijk NIET opgelost)
import { computed } from 'vue'
import { useQuery } from '@pinia/colada'
import { useApi } from '@/composables/useApi'
import type { Subscription } from '@/types/api'

function isReallyActive(s: Subscription): boolean {
  if (s.status !== 'active') return false
  const today = new Date().toISOString().slice(0, 10)
  return s.end_date.slice(0, 10) >= today
}

export function useSubscriptionGuard() {
  const api = useApi()

  const { data: subscriptions, isLoading } = useQuery({
    key: ['subscriptions', 'mine'],
    query: () => api.get<Subscription[]>('/subscriptions'),
  })

  function toArr(v: unknown): Subscription[] {
    if (!v) return []
    return Array.isArray(v) ? v : ((v as { data?: Subscription[] }).data ?? [])
  }

  const hasLoaded = computed(() => !isLoading.value && subscriptions.value !== undefined)

  const hasActive = computed(
    () => hasLoaded.value && toArr(subscriptions.value).some(isReallyActive),
  )

  const isExpired = computed(() => {
    if (!hasLoaded.value) return false
    const list = toArr(subscriptions.value)
    const hasActiveStatus = list.some((s) => s.status === 'active')
    return hasActiveStatus && !hasActive.value
  })

  const noSubscription = computed(() => hasLoaded.value && !hasActive.value)

  return { noSubscription, isExpired }
}
