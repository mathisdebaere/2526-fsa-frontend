import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppIcon from '@/components/atoms/AppIcon.vue'

describe('AppIcon', () => {
  it('rendert een <i>-element', () => {
    const wrapper = mount(AppIcon, { props: { name: 'user' } })
    expect(wrapper.find('i').exists()).toBe(true)
  })

  it('past de FontAwesome-klasse toe voor het icoon "user"', () => {
    const wrapper = mount(AppIcon, { props: { name: 'user' } })
    expect(wrapper.find('i').classes()).toContain('fa-solid')
    expect(wrapper.find('i').classes()).toContain('fa-user')
  })

  it('past de FontAwesome-klasse toe voor het icoon "calendar"', () => {
    const wrapper = mount(AppIcon, { props: { name: 'calendar' } })
    expect(wrapper.find('i').classes()).toContain('fa-calendar')
  })

  it('valt terug op fa-circle-info voor een onbekend icoon', () => {
    const wrapper = mount(AppIcon, { props: { name: 'onbekend-icoon' } })
    expect(wrapper.find('i').classes()).toContain('fa-circle-info')
  })

  it('stelt font-size in via de size prop', () => {
    const wrapper = mount(AppIcon, { props: { name: 'user', size: 24 } })
    expect(wrapper.find('i').attributes('style')).toContain('24px')
  })

  it('heeft geen stijl wanneer size niet opgegeven is', () => {
    const wrapper = mount(AppIcon, { props: { name: 'user' } })
    expect(wrapper.find('i').attributes('style')).toBeFalsy()
  })

  it('is verborgen voor schermlezers wanneer geen ariaLabel opgegeven is', () => {
    const wrapper = mount(AppIcon, { props: { name: 'user' } })
    expect(wrapper.find('i').attributes('aria-hidden')).toBe('true')
  })

  it('stelt aria-label in wanneer opgegeven', () => {
    const wrapper = mount(AppIcon, { props: { name: 'user', ariaLabel: 'Gebruikersprofiel' } })
    expect(wrapper.find('i').attributes('aria-label')).toBe('Gebruikersprofiel')
    expect(wrapper.find('i').attributes('aria-hidden')).toBeFalsy()
  })
})
