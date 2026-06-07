import { ref } from 'vue'
import type { ApiError } from '@/types/api'

export function useFormErrors() {
  const fieldErrors = ref<Record<string, string>>({})
  const generalError = ref<string | null>(null)

  function setFromApiError(err: unknown): void {
    fieldErrors.value = {}
    generalError.value = null

    const apiErr = extractApiError(err)
    if (!apiErr) {
      generalError.value = 'Er is een onbekende fout opgetreden.'
      return
    }

    if (apiErr.errors) {
      for (const [field, messages] of Object.entries(apiErr.errors)) {
        if (messages[0]) fieldErrors.value[field] = messages[0]
      }
    }

    generalError.value = apiErr.message ?? null
  }

  function clear(): void {
    fieldErrors.value = {}
    generalError.value = null
  }

  function fieldError(field: string): string | undefined {
    return fieldErrors.value[field]
  }

  return { fieldErrors, generalError, setFromApiError, clear, fieldError }
}

function extractApiError(err: unknown): ApiError | null {
  if (
    err &&
    typeof err === 'object' &&
    'response' in err &&
    err.response &&
    typeof err.response === 'object' &&
    'data' in err.response
  ) {
    return err.response.data as ApiError
  }
  return null
}
