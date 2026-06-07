import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  type: ToastType
  message: string
}

let toastId = 0

export const useUiStore = defineStore('ui', () => {
  const toasts = ref<Toast[]>([])

  function addToast(toast: Omit<Toast, 'id'>, duration = 4000): void {
    const id = ++toastId
    toasts.value.push({ id, ...toast })
    setTimeout(() => removeToast(id), duration)
  }

  function removeToast(id: number): void {
    const idx = toasts.value.findIndex((t) => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  return { toasts, addToast, removeToast }
})
