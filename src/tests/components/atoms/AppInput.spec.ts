import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppInput from '@/components/atoms/AppInput.vue'

describe('AppInput', () => {
  it('rendert een invoerveld', () => {
    const wrapper = mount(AppInput, { props: { modelValue: '' } })
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('gebruikt de opgegeven id-prop', () => {
    const wrapper = mount(AppInput, { props: { modelValue: '', id: 'mijn-veld' } })
    expect(wrapper.find('input').attributes('id')).toBe('mijn-veld')
  })

  it('heeft standaard type text', () => {
    const wrapper = mount(AppInput, { props: { modelValue: '' } })
    expect(wrapper.find('input').attributes('type')).toBe('text')
  })

  it('past het opgegeven type toe', () => {
    const wrapper = mount(AppInput, { props: { modelValue: '', type: 'email' } })
    expect(wrapper.find('input').attributes('type')).toBe('email')
  })

  it('is uitgeschakeld wanneer disabled true is', () => {
    const wrapper = mount(AppInput, { props: { modelValue: '', disabled: true } })
    expect((wrapper.find('input').element as HTMLInputElement).disabled).toBe(true)
  })

  it('heeft aria-invalid true wanneer error is ingesteld', () => {
    const wrapper = mount(AppInput, { props: { modelValue: '', error: 'Fout!' } })
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('past de foutstijlklasse toe wanneer error is ingesteld', () => {
    const wrapper = mount(AppInput, { props: { modelValue: '', error: 'Fout' } })
    expect(wrapper.find('input').classes()).toContain('app-input-error')
  })

  it('emits update:modelValue wanneer de waarde verandert', async () => {
    const wrapper = mount(AppInput, { props: { modelValue: '' } })
    await wrapper.find('input').setValue('hallo')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hallo'])
  })
})
