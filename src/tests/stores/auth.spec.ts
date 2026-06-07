import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockInvalidateQueries = vi.fn()

vi.mock('@pinia/colada', () => ({
  useQueryCache: () => ({ invalidateQueries: mockInvalidateQueries }),
}))

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}))

vi.mock('@/composables/useApi', () => ({
  useApi: () => mockApi,
}))

import { useAuthStore } from '@/stores/auth'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    mockApi.get.mockReset()
    mockApi.post.mockReset()
    mockInvalidateQueries.mockReset()
  })

  describe('computed: isAuthenticated', () => {
    it('is false wanneer geen token in localStorage', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
    })

    it('is true wanneer token aanwezig is in localStorage', () => {
      localStorage.setItem('auth_token', 'test-token')
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(true)
    })
  })

  describe('computed: isAdvisor', () => {
    it('is false wanneer geen user', () => {
      const store = useAuthStore()
      expect(store.isAdvisor).toBe(false)
    })

    it('is true wanneer role advisor', () => {
      const store = useAuthStore()
      store.user = { role: 'advisor', is_admin: false } as any
      expect(store.isAdvisor).toBe(true)
    })

    it('is true wanneer is_admin true ongeacht rol', () => {
      const store = useAuthStore()
      store.user = { role: 'client', is_admin: true } as any
      expect(store.isAdvisor).toBe(true)
    })

    it('is false wanneer rol niet advisor en is_admin false', () => {
      const store = useAuthStore()
      store.user = { role: 'client', is_admin: false } as any
      expect(store.isAdvisor).toBe(false)
    })
  })

  describe('computed: isClient', () => {
    it('is false wanneer geen user', () => {
      const store = useAuthStore()
      expect(store.isClient).toBe(false)
    })

    it('is true wanneer role client', () => {
      const store = useAuthStore()
      store.user = { role: 'client' } as any
      expect(store.isClient).toBe(true)
    })
  })

  describe('computed: isVolunteer', () => {
    it('is false wanneer geen user', () => {
      const store = useAuthStore()
      expect(store.isVolunteer).toBe(false)
    })

    it('is true wanneer role volunteer', () => {
      const store = useAuthStore()
      store.user = { role: 'volunteer' } as any
      expect(store.isVolunteer).toBe(true)
    })
  })

  describe('computed: isPendingApproval', () => {
    it('is false wanneer niet ingelogd', () => {
      const store = useAuthStore()
      expect(store.isPendingApproval).toBe(false)
    })

    it('is true wanneer ingelogd en account_status is waiting_for_interview', () => {
      localStorage.setItem('auth_token', 'token')
      const store = useAuthStore()
      store.user = { account_status: 'waiting_for_interview' } as any
      expect(store.isPendingApproval).toBe(true)
    })

    it('is false wanneer ingelogd maar account_status is verified', () => {
      localStorage.setItem('auth_token', 'token')
      const store = useAuthStore()
      store.user = { account_status: 'verified' } as any
      expect(store.isPendingApproval).toBe(false)
    })
  })

  describe('fetchUser', () => {
    it('zet initialized op true en doet geen API-call wanneer geen token', async () => {
      const store = useAuthStore()
      await store.fetchUser()
      expect(store.initialized).toBe(true)
      expect(mockApi.get).not.toHaveBeenCalled()
    })

    it('haalt de user op en zet initialized wanneer token aanwezig is', async () => {
      localStorage.setItem('auth_token', 'token')
      const mockUser = { id: 1, role: 'client' }
      mockApi.get.mockResolvedValue(mockUser)
      const store = useAuthStore()
      await store.fetchUser()
      expect(store.user).toEqual(mockUser)
      expect(store.initialized).toBe(true)
    })

    it('verwijdert token en user bij API-fout', async () => {
      localStorage.setItem('auth_token', 'token')
      mockApi.get.mockRejectedValue(new Error('Unauthorized'))
      const store = useAuthStore()
      await store.fetchUser()
      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.initialized).toBe(true)
    })
  })

  describe('getUser', () => {
    it('delegeert naar fetchUser', async () => {
      const store = useAuthStore()
      await store.getUser()
      expect(store.initialized).toBe(true)
    })
  })

  describe('login', () => {
    it('slaat token op in store en localStorage', async () => {
      const mockResponse = { token: 'nieuw-token', user: { id: 1, role: 'client' } }
      mockApi.post.mockResolvedValue(mockResponse)
      const store = useAuthStore()
      await store.login({ email: 'bart@example.be', password: 'wachtwoord' })
      expect(store.token).toBe('nieuw-token')
      expect(store.user).toEqual(mockResponse.user)
      expect(localStorage.getItem('auth_token')).toBe('nieuw-token')
      expect(mockInvalidateQueries).toHaveBeenCalled()
    })
  })

  describe('register', () => {
    it('logt in met email na registratie wanneer email opgegeven is', async () => {
      const loginResponse = { token: 'token', user: { id: 1 } }
      mockApi.post.mockResolvedValueOnce(undefined)
      mockApi.post.mockResolvedValueOnce(loginResponse)
      const store = useAuthStore()
      await store.register({
        first_name: 'Bart',
        last_name: 'Delrue',
        email: 'bart@example.be',
        password: 'wachtwoord',
        password_confirmation: 'wachtwoord',
        role: 'client',
        contact_preference: 'email',
        privacy_agreement: true,
      })
      expect(store.token).toBe('token')
    })

    it('logt in met telefoon na registratie wanneer alleen phone opgegeven is', async () => {
      const loginResponse = { token: 'token', user: { id: 1 } }
      mockApi.post.mockResolvedValueOnce(undefined)
      mockApi.post.mockResolvedValueOnce(loginResponse)
      const store = useAuthStore()
      await store.register({
        first_name: 'Bart',
        last_name: 'Delrue',
        phone: '0412345678',
        password: 'wachtwoord',
        password_confirmation: 'wachtwoord',
        role: 'client',
        contact_preference: 'phone',
        privacy_agreement: true,
      })
      expect(store.token).toBe('token')
    })

    it('slokt login-fouten na registratie', async () => {
      mockApi.post.mockResolvedValueOnce(undefined)
      mockApi.post.mockRejectedValueOnce(new Error('Login mislukt'))
      const store = useAuthStore()
      await expect(
        store.register({
          first_name: 'Jan',
          last_name: 'Peeters',
          email: 'bart@example.be',
          password: 'fout',
          password_confirmation: 'fout',
          role: 'client',
          contact_preference: 'email',
          privacy_agreement: true,
        }),
      ).resolves.toBeUndefined()
    })
  })

  describe('logout', () => {
    it('verwijdert token en user na uitloggen', async () => {
      mockApi.post.mockResolvedValue(undefined)
      const store = useAuthStore()
      store.token = 'token'
      store.user = { id: 1 } as any
      await store.logout()
      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(localStorage.getItem('auth_token')).toBeNull()
    })

    it('verwijdert token ook wanneer de API-call faalt', async () => {
      mockApi.post.mockRejectedValue(new Error('Netwerk fout'))
      const store = useAuthStore()
      store.token = 'token'
      await store.logout()
      expect(store.token).toBeNull()
    })
  })
})
