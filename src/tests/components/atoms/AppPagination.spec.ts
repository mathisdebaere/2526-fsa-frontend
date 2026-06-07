import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppPagination from '@/components/atoms/AppPagination.vue'

describe('AppPagination', () => {
  it('toont niets wanneer er maar één pagina is', () => {
    const wrapper = mount(AppPagination, {
      props: { currentPage: 1, lastPage: 1, total: 5, perPage: 18 },
    })
    expect(wrapper.find('[data-testid="paginatie"]').exists()).toBe(false)
  })

  it('toont een enkelvoudige resultaattekst wanneer lastPage 1 is en total > 0', () => {
    const wrapper = mount(AppPagination, {
      props: { currentPage: 1, lastPage: 1, total: 12, perPage: 18 },
    })
    expect(wrapper.text()).toContain('12 resultaten')
  })

  it('toont de paginatieinfo met huidig paginanummer en totaal', () => {
    const wrapper = mount(AppPagination, {
      props: { currentPage: 2, lastPage: 5, total: 80, perPage: 18 },
    })
    expect(wrapper.text()).toContain('Pagina 2 van 5')
    expect(wrapper.text()).toContain('80 resultaten')
  })

  it('de vorige-knop is uitgeschakeld op pagina 1', () => {
    const wrapper = mount(AppPagination, {
      props: { currentPage: 1, lastPage: 3, total: 50, perPage: 18 },
    })
    const vorige = wrapper.find('[data-testid="paginatie-vorige"]')
    expect((vorige.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('de volgende-knop is uitgeschakeld op de laatste pagina', () => {
    const wrapper = mount(AppPagination, {
      props: { currentPage: 3, lastPage: 3, total: 50, perPage: 18 },
    })
    const volgende = wrapper.find('[data-testid="paginatie-volgende"]')
    expect((volgende.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('emits pageChange met volgend paginanummer bij klik op volgende', async () => {
    const wrapper = mount(AppPagination, {
      props: { currentPage: 1, lastPage: 3, total: 50, perPage: 18 },
    })
    await wrapper.find('[data-testid="paginatie-volgende"]').trigger('click')
    expect(wrapper.emitted('pageChange')?.[0]).toEqual([2])
  })

  it('emits pageChange met vorig paginanummer bij klik op vorige', async () => {
    const wrapper = mount(AppPagination, {
      props: { currentPage: 2, lastPage: 3, total: 50, perPage: 18 },
    })
    await wrapper.find('[data-testid="paginatie-vorige"]').trigger('click')
    expect(wrapper.emitted('pageChange')?.[0]).toEqual([1])
  })

  it('emits pageChange bij klik op een paginanummer-knop', async () => {
    const wrapper = mount(AppPagination, {
      props: { currentPage: 1, lastPage: 4, total: 60, perPage: 18 },
    })
    const paginaKnops = wrapper.findAll('.pagination_num')
    await paginaKnops[1]!.trigger('click')
    expect(wrapper.emitted('pageChange')?.[0]).toEqual([2])
  })
})
