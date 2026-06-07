import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppAvatar from '@/components/atoms/AppAvatar.vue'

describe('AppAvatar', () => {
  it('toont een afbeelding', () => {
    const wrapper = mount(AppAvatar)
    expect(wrapper.find('img').exists()).toBe(true)
  })

  it('gebruikt de opgegeven src', () => {
    const wrapper = mount(AppAvatar, { props: { src: '/foto.jpg' } })
    expect(wrapper.find('img').attributes('src')).toBe('/foto.jpg')
  })

  it('valt terug op de placeholder wanneer geen src opgegeven is', () => {
    const wrapper = mount(AppAvatar)
    const src = wrapper.find('img').attributes('src')
    expect(src).toBeTruthy()
  })

  it('past de grootte-klasse md toe als standaard', () => {
    const wrapper = mount(AppAvatar)
    expect(wrapper.find('div').classes()).toContain('avatar--md')
  })

  it('past de grootte-klasse sm toe', () => {
    const wrapper = mount(AppAvatar, { props: { size: 'sm' } })
    expect(wrapper.find('div').classes()).toContain('avatar--sm')
  })

  it('past de grootte-klasse lg toe', () => {
    const wrapper = mount(AppAvatar, { props: { size: 'lg' } })
    expect(wrapper.find('div').classes()).toContain('avatar--lg')
  })

  it('stelt aria-label in via de name prop', () => {
    const wrapper = mount(AppAvatar, { props: { name: 'Jan Peeters' } })
    expect(wrapper.find('div').attributes('aria-label')).toBe('Jan Peeters')
  })

  it('stelt aria-label in via de alt prop (heeft voorrang op name)', () => {
    const wrapper = mount(AppAvatar, { props: { name: 'Jan', alt: 'Profielfoto van Jan' } })
    expect(wrapper.find('div').attributes('aria-label')).toBe('Profielfoto van Jan')
  })
})
