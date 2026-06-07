import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useToast } from '@/composables/useToast'
import { useUiStore } from '@/stores/ui'

describe('useToast', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('success() voegt een succesmelding toe aan de store', () => {
    const toast = useToast()
    const store = useUiStore()
    toast.success('Opgeslagen!')
    expect(store.toasts[0]?.type).toBe('success')
    expect(store.toasts[0]?.message).toBe('Opgeslagen!')
  })

  it('error() voegt een foutmelding toe aan de store', () => {
    const toast = useToast()
    const store = useUiStore()
    toast.error('Er is iets misgegaan')
    expect(store.toasts[0]?.type).toBe('error')
    expect(store.toasts[0]?.message).toBe('Er is iets misgegaan')
  })

  it('info() voegt een infobericht toe aan de store', () => {
    const toast = useToast()
    const store = useUiStore()
    toast.info('Bezig met laden...')
    expect(store.toasts[0]?.type).toBe('info')
    expect(store.toasts[0]?.message).toBe('Bezig met laden...')
  })
})
