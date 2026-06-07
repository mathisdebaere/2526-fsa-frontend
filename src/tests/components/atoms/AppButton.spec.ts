import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppButton from '@/components/atoms/AppButton.vue'

describe('AppButton', () => {
  it('toont de slot-inhoud', () => {
    const wrapper = mount(AppButton, { slots: { default: 'Bewaar' } })
    expect(wrapper.find('[data-testid="app-knop"]').text()).toContain('Bewaar')
  })

  it('heeft standaard variant primary en grootte md', () => {
    const wrapper = mount(AppButton)
    const btn = wrapper.find('[data-testid="app-knop"]')
    expect(btn.classes()).toContain('btn--primary')
    expect(btn.classes()).toContain('btn--md')
  })

  it('past de variant-klasse danger toe', () => {
    const wrapper = mount(AppButton, { props: { variant: 'danger' } })
    expect(wrapper.find('[data-testid="app-knop"]').classes()).toContain('btn--danger')
  })

  it('past de variant-klasse secondary toe', () => {
    const wrapper = mount(AppButton, { props: { variant: 'secondary' } })
    expect(wrapper.find('[data-testid="app-knop"]').classes()).toContain('btn--secondary')
  })

  it('past de grootte-klasse lg toe', () => {
    const wrapper = mount(AppButton, { props: { size: 'lg' } })
    expect(wrapper.find('[data-testid="app-knop"]').classes()).toContain('btn--lg')
  })

  it('past de grootte-klasse sm toe', () => {
    const wrapper = mount(AppButton, { props: { size: 'sm' } })
    expect(wrapper.find('[data-testid="app-knop"]').classes()).toContain('btn--sm')
  })

  it('is uitgeschakeld wanneer disabled true is', () => {
    const wrapper = mount(AppButton, { props: { disabled: true } })
    expect((wrapper.find('[data-testid="app-knop"]').element as HTMLButtonElement).disabled).toBe(
      true,
    )
  })

  it('is uitgeschakeld en toont spinner tijdens laden', () => {
    const wrapper = mount(AppButton, { props: { loading: true } })
    const btn = wrapper.find('[data-testid="app-knop"]')
    expect((btn.element as HTMLButtonElement).disabled).toBe(true)
    expect(btn.find('.btn_spinner').exists()).toBe(true)
  })

  it('toont geen spinner wanneer loading false is', () => {
    const wrapper = mount(AppButton, { props: { loading: false } })
    expect(wrapper.find('.btn_spinner').exists()).toBe(false)
  })

  it('past de volledige breedte klasse toe', () => {
    const wrapper = mount(AppButton, { props: { fullWidth: true } })
    expect(wrapper.find('[data-testid="app-knop"]').classes()).toContain('btn--full')
  })

  it('stelt het type-attribuut in op submit', () => {
    const wrapper = mount(AppButton, { props: { type: 'submit' } })
    expect(wrapper.find('[data-testid="app-knop"]').attributes('type')).toBe('submit')
  })
})
