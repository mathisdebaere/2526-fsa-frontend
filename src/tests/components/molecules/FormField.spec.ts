import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormField from '@/components/molecules/FormField.vue'

describe('FormField', () => {
  it('toont het label', () => {
    const wrapper = mount(FormField, { props: { label: 'E-mailadres', modelValue: '' } })
    expect(wrapper.text()).toContain('E-mailadres')
  })

  it('toont geen foutmelding wanneer er geen error is', () => {
    const wrapper = mount(FormField, { props: { label: 'Naam', modelValue: '', error: null } })
    expect(wrapper.find('[data-testid="veld-fout"]').exists()).toBe(false)
  })

  it('toont de foutmelding wanneer error is ingesteld', () => {
    const wrapper = mount(FormField, {
      props: { label: 'Wachtwoord', modelValue: '', error: 'Verplicht veld' },
    })
    expect(wrapper.find('[data-testid="veld-fout"]').text()).toBe('Verplicht veld')
  })

  it('foutmelding heeft role alert', () => {
    const wrapper = mount(FormField, {
      props: { label: 'Naam', modelValue: '', error: 'Ongeldige waarde' },
    })
    expect(wrapper.find('[data-testid="veld-fout"]').attributes('role')).toBe('alert')
  })

  it('emits update:modelValue wanneer de invoer verandert', async () => {
    const wrapper = mount(FormField, { props: { label: 'Naam', modelValue: '' } })
    await wrapper.find('input').setValue('Bart Delrue')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Bart Delrue'])
  })

  it('geeft het type door aan het invoerveld', () => {
    const wrapper = mount(FormField, {
      props: { label: 'Wachtwoord', modelValue: '', type: 'password' },
    })
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('het invoerveld is uitgeschakeld wanneer disabled true is', () => {
    const wrapper = mount(FormField, {
      props: { label: 'Naam', modelValue: '', disabled: true },
    })
    expect((wrapper.find('input').element as HTMLInputElement).disabled).toBe(true)
  })
})
