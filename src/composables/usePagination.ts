// gestolen en omgevormd naar vue
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function usePagination() {
  const route = useRoute()
  const router = useRouter()

  const currentPage = computed(() => Math.max(1, Number(route.query.page ?? 1)))

  function goToPage(n: number) {
    router.push({ query: { ...route.query, page: String(n) } })
  }

  function nextPage() {
    goToPage(currentPage.value + 1)
  }

  function prevPage() {
    goToPage(currentPage.value - 1)
  }

  function resetPage() {
    if (currentPage.value !== 1) {
      router.replace({ query: { ...route.query, page: '1' } })
    }
  }

  return { currentPage, goToPage, nextPage, prevPage, resetPage }
}
