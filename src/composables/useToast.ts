// gestolen van ander project
import { useUiStore } from '@/stores/ui'

export function useToast() {
  const ui = useUiStore()

  return {
    success: (message: string) => ui.addToast({ type: 'success', message }),
    error: (message: string) => ui.addToast({ type: 'error', message }),
    info: (message: string) => ui.addToast({ type: 'info', message }),
  }
}
