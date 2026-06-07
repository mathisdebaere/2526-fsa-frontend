// gestolen van vorige projecte
import { ref } from 'vue'

const message = ref('')
const isOpen = ref(false)
let resolvePromise: ((value: boolean) => void) | null = null

export function useConfirmDialog() {
  function showConfirmationDialog(msg: string): Promise<boolean> {
    message.value = msg
    isOpen.value = true
    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  function confirm() {
    isOpen.value = false
    resolvePromise?.(true)
    resolvePromise = null
  }

  function cancel() {
    isOpen.value = false
    resolvePromise?.(false)
    resolvePromise = null
  }

  return { message, isOpen, showConfirmationDialog, confirm, cancel }
}
