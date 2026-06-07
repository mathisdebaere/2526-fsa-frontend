import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { PER_PAGE, usePageState, usePaginatedData } from '@/composables/usePaginatedData'

describe('PER_PAGE', () => {
  it('is 18', () => {
    expect(PER_PAGE).toBe(18)
  })
})

describe('usePageState', () => {
  it('begint op pagina 1', () => {
    const { currentPage } = usePageState()
    expect(currentPage.value).toBe(1)
  })

  it('goToPage() zet de huidige pagina', () => {
    const { currentPage, goToPage } = usePageState()
    goToPage(4)
    expect(currentPage.value).toBe(4)
  })

  it('resetPage() zet terug naar pagina 1', () => {
    const { currentPage, goToPage, resetPage } = usePageState()
    goToPage(5)
    resetPage()
    expect(currentPage.value).toBe(1)
  })
})

describe('usePaginatedData', () => {
  it('retourneert lege waarden wanneer de data null is', () => {
    const data = ref(null)
    const { items, total, lastPage } = usePaginatedData(data)
    expect(items.value).toEqual([])
    expect(total.value).toBe(0)
    expect(lastPage.value).toBe(1)
  })

  it('werkt met een array als data (niet-gepagineerde respons)', () => {
    const lijst = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const data = ref(lijst)
    const { items, total, lastPage } = usePaginatedData(data)
    expect(items.value).toEqual(lijst)
    expect(total.value).toBe(3)
    expect(lastPage.value).toBe(1)
  })

  it('werkt met een gepagineerde respons', () => {
    const paginatedResp = {
      data: [{ id: 1 }, { id: 2 }],
      total: 50,
      last_page: 3,
      current_page: 1,
      per_page: 18,
      next_page_url: null,
      prev_page_url: null,
    }
    const data = ref(paginatedResp)
    const { items, total, lastPage } = usePaginatedData(data)
    expect(items.value).toEqual(paginatedResp.data)
    expect(total.value).toBe(50)
    expect(lastPage.value).toBe(3)
  })

  it('is reactief wanneer de data verandert', () => {
    const data = ref<any>(null)
    const { items } = usePaginatedData(data)
    expect(items.value).toEqual([])
    data.value = [{ id: 10 }]
    expect(items.value).toEqual([{ id: 10 }])
  })
})
