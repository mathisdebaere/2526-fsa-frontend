// gestolen van ander project
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { PaginatedResponse } from '@/types/api'

export const PER_PAGE = 18

export function usePageState() {
  const currentPage = ref(1)
  function goToPage(n: number) {
    currentPage.value = n
  }
  function resetPage() {
    currentPage.value = 1
  }
  return { currentPage, goToPage, resetPage }
}

export function usePaginatedData<T>(pageData: Ref<PaginatedResponse<T> | T[] | null | undefined>) {
  const items = computed<T[]>(() => {
    const v = pageData.value
    if (!v) return []
    return Array.isArray(v) ? v : (v.data ?? [])
  })

  const total = computed<number>(() => {
    const v = pageData.value
    if (!v) return 0
    return Array.isArray(v) ? v.length : (v.total ?? 0)
  })

  const lastPage = computed<number>(() => {
    const v = pageData.value
    if (!v || Array.isArray(v)) return 1
    return v.last_page ?? 1
  })

  return { items, total, lastPage }
}
