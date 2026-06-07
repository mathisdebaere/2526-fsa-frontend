import { describe, it, expect, vi } from 'vitest'

vi.mock('@/instances/myAxios', () => ({
  myAxios: {
    post: vi.fn().mockResolvedValue({ data: {} }),
    get: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
  },
}))

import { login, logout, getUser, patchUser } from '@/api/auth'
import { myAxios } from '@/instances/myAxios'

describe('api/auth', () => {
  it('login() roept de juiste endpoint aan', () => {
    login('bart@example.be', 'wachtwoord')
    expect(myAxios.post).toHaveBeenCalledWith('/login', {
      email: 'bart@example.be',
      password: 'wachtwoord',
    })
  })

  it('logout() roept de juiste endpoint aan', () => {
    logout()
    expect(myAxios.post).toHaveBeenCalledWith('/logout')
  })

  it('getUser() roept de juiste endpoint aan', () => {
    getUser()
    expect(myAxios.get).toHaveBeenCalledWith('/user')
  })

  it('patchUser() roept de juiste endpoint aan', () => {
    patchUser({ name: 'Bart Delrue' })
    expect(myAxios.patch).toHaveBeenCalledWith('/user', { name: 'Bart Delrue' })
  })
})
