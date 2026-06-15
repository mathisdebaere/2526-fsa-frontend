import { computed } from 'vue'
import { useMySubscriptions } from '@/composables/useMySubscriptions'
import type { Subscription } from '@/types/api'

function isReallyActive(s: Subscription): boolean {
  if (s.status !== 'active') return false
  const today = new Date().toISOString().slice(0, 10)
  return s.end_date.slice(0, 10) >= today
}

export function useSubscriptionGuard() {
  const { data: subscriptions, isLoading } = useMySubscriptions()

  const hasLoaded = computed(() => !isLoading.value && subscriptions.value !== undefined)

  const hasActive = computed(
    () => hasLoaded.value && (subscriptions.value ?? []).some(isReallyActive),
  )

  const isExpired = computed(() => {
    if (!hasLoaded.value) return false
    const list = subscriptions.value ?? []
    const hasActiveStatus = list.some((s) => s.status === 'active')
    return hasActiveStatus && !hasActive.value
  })

  const noSubscription = computed(() => hasLoaded.value && !hasActive.value)

  return { noSubscription, isExpired, isLoading }
}
