import { describe, it, expect } from 'vitest'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

describe('useConfirmDialog', () => {
  it('begint gesloten', () => {
    const { isOpen } = useConfirmDialog()
    expect(isOpen.value).toBe(false)
  })

  it('showConfirmationDialog() opent de dialog en stelt de boodschap in', async () => {
    const { message, isOpen, showConfirmationDialog, cancel } = useConfirmDialog()
    showConfirmationDialog('Wil je dit verwijderen?')
    expect(isOpen.value).toBe(true)
    expect(message.value).toBe('Wil je dit verwijderen?')
    cancel()
  })

  it('confirm() sluit de dialog en lost de Promise op met true', async () => {
    const { showConfirmationDialog, confirm } = useConfirmDialog()
    const belofte = showConfirmationDialog('Bevestigen?')
    confirm()
    await expect(belofte).resolves.toBe(true)
  })

  it('cancel() sluit de dialog en lost de Promise op met false', async () => {
    const { showConfirmationDialog, cancel } = useConfirmDialog()
    const belofte = showConfirmationDialog('Annuleren?')
    cancel()
    await expect(belofte).resolves.toBe(false)
  })

  it('isOpen is false na confirm()', async () => {
    const { isOpen, showConfirmationDialog, confirm } = useConfirmDialog()
    showConfirmationDialog('Test')
    confirm()
    expect(isOpen.value).toBe(false)
  })

  it('isOpen is false na cancel()', async () => {
    const { isOpen, showConfirmationDialog, cancel } = useConfirmDialog()
    showConfirmationDialog('Test')
    cancel()
    expect(isOpen.value).toBe(false)
  })
})
