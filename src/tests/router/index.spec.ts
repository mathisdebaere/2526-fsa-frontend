import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'

const mockAuth = vi.hoisted(() => ({
  initialized: true,
  isAuthenticated: false,
  isPendingApproval: false,
  isAdvisor: false,
  isClient: false,
  fetchUser: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuth,
}))

import router from '@/router/index'

describe('router', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    mockAuth.isAuthenticated = false
    mockAuth.isPendingApproval = false
    mockAuth.isAdvisor = false
    mockAuth.isClient = false
    await router.push('/')
    await router.isReady()
  })

  afterEach(async () => {
    await router.push('/')
    vi.restoreAllMocks()
  })

  it('elke route heeft een meta.title', () => {
    expect(router.getRoutes().every((r) => !!r.meta?.title)).toBe(true)
  })

  it('navigeert naar de loginpagina als niet ingelogd', async () => {
    await router.push('/login')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('navigeert naar de registratiepagina', async () => {
    await router.push('/register')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('register')
  })

  it('stuurt een ingelogde gebruiker door naar dashboard bij /login', async () => {
    mockAuth.isAuthenticated = true
    mockAuth.isPendingApproval = false
    await router.push('/login')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('stuurt een niet-ingelogde gebruiker door naar login bij een beveiligde route', async () => {
    mockAuth.isAuthenticated = false
    await router.push('/dashboard')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('stuurt een ingelogde gebruiker in afwachting door naar /pending-approval', async () => {
    mockAuth.isAuthenticated = true
    mockAuth.isPendingApproval = true
    await router.push('/dashboard')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('pending-approval')
  })
})
