import { myAxios } from '@/instances/myAxios'
import type { User } from '@/types'

const login = (email: string, password: string) => myAxios.post('/login', { email, password })

const logout = () => myAxios.post('/logout')

const getUser = () => myAxios.get<User>('/user')

const patchUser = (payload: Partial<Pick<User, 'name' | 'email'>>) =>
  myAxios.patch<User>('/user', payload)

export { login, logout, getUser, patchUser }
