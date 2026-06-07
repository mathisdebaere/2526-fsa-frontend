import axios, { type AxiosInstance } from 'axios'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:8080/api'

let instance: AxiosInstance | null = null

function getInstance(): AxiosInstance {
  if (instance) return instance

  instance = axios.create({
    baseURL: BASE_URL,
    headers: { Accept: 'application/json' },
  })

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token')
        const { useAuthStore } = await import('@/stores/auth')
        const { default: router } = await import('@/router')
        const auth = useAuthStore()
        auth.token = null
        auth.user = null
        router.push('/login')
      }
      return Promise.reject(error)
    },
  )

  return instance
}

export function useApi() {
  const http = getInstance()

  return {
    get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
      return http.get<T>(url, { params }).then((r) => r.data)
    },

    post<T>(url: string, data?: unknown): Promise<T> {
      return http.post<T>(url, data).then((r) => r.data)
    },

    put<T>(url: string, data?: unknown): Promise<T> {
      return http.put<T>(url, data).then((r) => r.data)
    },

    patch<T>(url: string, data?: unknown): Promise<T> {
      return http.patch<T>(url, data).then((r) => r.data)
    },

    delete<T>(url: string, data?: unknown): Promise<T> {
      return http.delete<T>(url, { data }).then((r) => r.data)
    },

    postMultipart<T>(url: string, data: FormData): Promise<T> {
      return http
        .post<T>(url, data, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((r) => r.data)
    },
  }
}
