import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUiStore } from '@/stores/ui'

describe('useUiStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('begint met een lege toastlijst', () => {
    const store = useUiStore()
    expect(store.toasts).toHaveLength(0)
  })

  it('voegt een succesmelding toe via addToast', () => {
    const store = useUiStore()
    store.addToast({ type: 'success', message: 'Opgeslagen!' })
    expect(store.toasts).toHaveLength(1)
    expect(store.toasts[0]?.message).toBe('Opgeslagen!')
    expect(store.toasts[0]?.type).toBe('success')
  })

  it('voegt een foutmelding toe via addToast', () => {
    const store = useUiStore()
    store.addToast({ type: 'error', message: 'Er is iets misgegaan.' })
    expect(store.toasts[0]?.type).toBe('error')
  })

  it('verwijdert de toast automatisch na de opgegeven duur', () => {
    const store = useUiStore()
    store.addToast({ type: 'info', message: 'Laden...' }, 2000)
    expect(store.toasts).toHaveLength(1)
    vi.advanceTimersByTime(2000)
    expect(store.toasts).toHaveLength(0)
  })

  it('verwijdert een toast handmatig via removeToast', () => {
    const store = useUiStore()
    store.addToast({ type: 'success', message: 'Klaar' })
    const id = store.toasts[0]!.id
    store.removeToast(id)
    expect(store.toasts).toHaveLength(0)
  })

  it('removeToast doet niets bij een onbekend id', () => {
    const store = useUiStore()
    store.addToast({ type: 'info', message: 'Bericht' })
    store.removeToast(99999)
    expect(store.toasts).toHaveLength(1)
  })
})
