import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useQueryCache } from '@pinia/colada'
import type { User, LoginPayload, RegisterPayload, LoginResponse } from '@/types/api'
import { useApi } from '@/composables/useApi'

export const useAuthStore = defineStore('auth', () => {
  const queryCache = useQueryCache()
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<User | null>(null)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  const isAdvisor = computed(() => user.value?.role === 'advisor' || !!user.value?.is_admin)
  const isAdmin = isAdvisor
  const isClient = computed(() => user.value?.role === 'client')
  const isVolunteer = computed(() => user.value?.role === 'volunteer')
  const isPendingApproval = computed(
    () => isAuthenticated.value && user.value?.account_status === 'waiting_for_interview',
  )

  async function fetchUser(): Promise<void> {
    if (!token.value) {
      initialized.value = true
      return
    }
    const api = useApi()
    try {
      user.value = await api.get<User>('/user')
    } catch {
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
    } finally {
      initialized.value = true
    }
  }

  async function getUser(): Promise<void> {
    return fetchUser()
  }

  async function login(payload: LoginPayload): Promise<void> {
    const api = useApi()
    const response = await api.post<LoginResponse>('/login', payload)
    token.value = response.token
    user.value = response.user
    initialized.value = true
    localStorage.setItem('auth_token', response.token)
    queryCache.invalidateQueries({ key: ['subscriptions'] })
  }

  async function register(payload: RegisterPayload): Promise<void> {
    const api = useApi()
    await api.post('/register', payload)
    try {
      if (payload.email) {
        await login({ email: payload.email, password: payload.password })
      } else if (payload.phone) {
        await login({ phone: payload.phone, password: payload.password })
      }
    } catch {}
  }

  async function logout(): Promise<void> {
    const api = useApi()
    try {
      await api.post('/logout')
    } catch {
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
    }
  }

  return {
    token,
    user,
    initialized,
    isAuthenticated,
    isAdvisor,
    isAdmin,
    isClient,
    isVolunteer,
    isPendingApproval,
    fetchUser,
    getUser,
    login,
    register,
    logout,
  }
})
