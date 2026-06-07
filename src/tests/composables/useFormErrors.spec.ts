import { describe, it, expect } from 'vitest'
import { useFormErrors } from '@/composables/useFormErrors'

describe('useFormErrors', () => {
  it('begint met lege fouten en geen algemene fout', () => {
    const { fieldErrors, generalError } = useFormErrors()
    expect(Object.keys(fieldErrors.value)).toHaveLength(0)
    expect(generalError.value).toBeNull()
  })

  it('fieldError() retourneert undefined voor een onbekend veld', () => {
    const { fieldError } = useFormErrors()
    expect(fieldError('naam')).toBeUndefined()
  })

  it('fieldError() retourneert de foutenstring voor een bekend veld', () => {
    const { fieldErrors, fieldError } = useFormErrors()
    fieldErrors.value['email'] = 'Ongeldig e-mailadres'
    expect(fieldError('email')).toBe('Ongeldig e-mailadres')
  })

  it('clear() wist alle veld- en algemene fouten', () => {
    const { fieldErrors, generalError, clear } = useFormErrors()
    fieldErrors.value['email'] = 'Fout'
    generalError.value = 'Algemene fout'
    clear()
    expect(Object.keys(fieldErrors.value)).toHaveLength(0)
    expect(generalError.value).toBeNull()
  })

  it('setFromApiError() verwerkt API-veldfoutenmeldingen', () => {
    const { fieldErrors, generalError, setFromApiError } = useFormErrors()
    const apiError = {
      response: {
        data: {
          message: 'Validatiefout',
          errors: {
            email: ['E-mailadres is verplicht'],
            password: ['Wachtwoord is te kort'],
          },
        },
      },
    }
    setFromApiError(apiError)
    expect(fieldErrors.value['email']).toBe('E-mailadres is verplicht')
    expect(fieldErrors.value['password']).toBe('Wachtwoord is te kort')
    expect(generalError.value).toBe('Validatiefout')
  })

  it('setFromApiError() stelt een algemene fout in bij een onbekende fout', () => {
    const { generalError, setFromApiError } = useFormErrors()
    setFromApiError(new Error('Netwerk fout'))
    expect(generalError.value).toBe('Er is een onbekende fout opgetreden.')
  })

  it('setFromApiError() wist vorige fouten voor het verwerken', () => {
    const { fieldErrors, setFromApiError } = useFormErrors()
    fieldErrors.value['email'] = 'Oud'
    setFromApiError(new Error('Nieuw'))
    expect(fieldErrors.value['email']).toBeUndefined()
  })
})
