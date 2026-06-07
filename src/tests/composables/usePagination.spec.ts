import { describe, it, expect, vi } from 'vitest'

const mockPush = vi.fn()
const mockReplace = vi.fn()
const mockQuery = { page: '2' }

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: mockQuery }),
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}))

import { usePagination } from '@/composables/usePagination'

describe('usePagination', () => {
  it('currentPage leest de paginaquery als getal', () => {
    const { currentPage } = usePagination()
    expect(currentPage.value).toBe(2)
  })

  it('goToPage() pusht de nieuwe pagina naar de router', () => {
    const { goToPage } = usePagination()
    goToPage(5)
    expect(mockPush).toHaveBeenCalledWith({ query: { page: '5' } })
  })

  it('nextPage() gaat naar de volgende pagina', () => {
    const { nextPage } = usePagination()
    nextPage()
    expect(mockPush).toHaveBeenCalledWith({ query: { page: '3' } })
  })

  it('prevPage() gaat naar de vorige pagina', () => {
    const { prevPage } = usePagination()
    prevPage()
    expect(mockPush).toHaveBeenCalledWith({ query: { page: '1' } })
  })

  it('resetPage() roept replace aan wanneer de huidige pagina niet 1 is', () => {
    const { resetPage } = usePagination()
    resetPage()
    expect(mockReplace).toHaveBeenCalledWith({ query: { page: '1' } })
  })
})
