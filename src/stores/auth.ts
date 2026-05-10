import { ref } from 'vue'
import { defineStore } from 'pinia'
import { myAxios } from '@/instances/myAxios'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const initialized = ref(false)

  const getUser = async () => {
    try {
      const { data } = await myAxios.get<User>('/user')
      user.value = data
      return true
    } catch {
      user.value = null
      return false
    } finally {
      initialized.value = true
    }
  }

  const login = async (payload: { email: string; password: string }) => {
    await myAxios.post('/login', payload)
    await getUser()
  }

  const logout = async () => {
    user.value = null
    await myAxios.post('/logout')
  }

  const register = async (payload: {
    name: string
    email: string
    password: string
    password_confirmation: string
  }) => {
    await myAxios.post('/register', payload)
    await login({ email: payload.email, password: payload.password })
  }

  return { user, initialized, getUser, login, logout, register }
})
