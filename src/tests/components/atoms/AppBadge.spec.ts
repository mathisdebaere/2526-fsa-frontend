import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppBadge from '@/components/atoms/AppBadge.vue'

describe('AppBadge', () => {
  it('toont de slot-inhoud', () => {
    const wrapper = mount(AppBadge, { slots: { default: 'Actief' } })
    expect(wrapper.find('[data-testid="app-badge"]').text()).toBe('Actief')
  })

  it('heeft standaard de default variant', () => {
    const wrapper = mount(AppBadge)
    expect(wrapper.find('[data-testid="app-badge"]').classes()).toContain('badge--default')
  })

  it('past de success variant toe', () => {
    const wrapper = mount(AppBadge, { props: { variant: 'success' } })
    expect(wrapper.find('[data-testid="app-badge"]').classes()).toContain('badge--success')
  })

  it('past de danger variant toe', () => {
    const wrapper = mount(AppBadge, { props: { variant: 'danger' } })
    expect(wrapper.find('[data-testid="app-badge"]').classes()).toContain('badge--danger')
  })

  it('past de warning variant toe', () => {
    const wrapper = mount(AppBadge, { props: { variant: 'warning' } })
    expect(wrapper.find('[data-testid="app-badge"]').classes()).toContain('badge--warning')
  })

  it('past de info variant toe', () => {
    const wrapper = mount(AppBadge, { props: { variant: 'info' } })
    expect(wrapper.find('[data-testid="app-badge"]').classes()).toContain('badge--info')
  })

  it('past de grootte-klasse sm toe', () => {
    const wrapper = mount(AppBadge, { props: { size: 'sm' } })
    expect(wrapper.find('[data-testid="app-badge"]').classes()).toContain('badge--sm')
  })

  it('past de grootte-klasse lg toe', () => {
    const wrapper = mount(AppBadge, { props: { size: 'lg' } })
    expect(wrapper.find('[data-testid="app-badge"]').classes()).toContain('badge--lg')
  })
})
