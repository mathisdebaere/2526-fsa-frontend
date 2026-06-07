import { ref } from 'vue'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockData = ref<any>(undefined)
const mockIsLoading = ref(true)

vi.mock('@pinia/colada', () => ({
  useQuery: vi.fn().mockImplementation(() => ({
    data: mockData,
    isLoading: mockIsLoading,
  })),
}))

vi.mock('@/composables/useApi', () => ({
  useApi: () => ({ get: vi.fn() }),
}))

import { useSubscriptionGuard } from '@/composables/useSubscriptionGuard'

const einddatumToekomst = new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10)
const einddatumVerleden = new Date(Date.now() - 86400000 * 30).toISOString().slice(0, 10)

describe('useSubscriptionGuard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockData.value = undefined
    mockIsLoading.value = true
  })

  it('noSubscription en isExpired zijn false zolang nog aan het laden', () => {
    const { noSubscription, isExpired } = useSubscriptionGuard()
    expect(noSubscription.value).toBe(false)
    expect(isExpired.value).toBe(false)
  })

  it('noSubscription is true wanneer geladen en lijst leeg is', () => {
    mockIsLoading.value = false
    mockData.value = []
    const { noSubscription } = useSubscriptionGuard()
    expect(noSubscription.value).toBe(true)
  })

  it('noSubscription is false bij een actief abonnement met toekomstige einddatum', () => {
    mockIsLoading.value = false
    mockData.value = [{ status: 'active', end_date: einddatumToekomst }]
    const { noSubscription } = useSubscriptionGuard()
    expect(noSubscription.value).toBe(false)
  })

  it('isExpired is true wanneer status active maar einddatum in het verleden ligt', () => {
    mockIsLoading.value = false
    mockData.value = [{ status: 'active', end_date: einddatumVerleden }]
    const { isExpired } = useSubscriptionGuard()
    expect(isExpired.value).toBe(true)
  })

  it('isExpired is false wanneer geen enkel abonnement status active heeft', () => {
    mockIsLoading.value = false
    mockData.value = [{ status: 'expired', end_date: einddatumVerleden }]
    const { isExpired } = useSubscriptionGuard()
    expect(isExpired.value).toBe(false)
  })

  it('werkt correct met een gepagineerde respons ({ data: [...] })', () => {
    mockIsLoading.value = false
    mockData.value = { data: [{ status: 'active', end_date: einddatumToekomst }] }
    const { noSubscription } = useSubscriptionGuard()
    expect(noSubscription.value).toBe(false)
  })

  it('werkt correct wanneer data null is', () => {
    mockIsLoading.value = false
    mockData.value = null
    const { noSubscription, isExpired } = useSubscriptionGuard()
    expect(noSubscription.value).toBe(true)
    expect(isExpired.value).toBe(false)
  })

  it('isExpired is false wanneer ingeladen maar geen abonnementen', () => {
    mockIsLoading.value = false
    mockData.value = []
    const { isExpired } = useSubscriptionGuard()
    expect(isExpired.value).toBe(false)
  })
})
