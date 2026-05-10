import { myAxios } from '@/instances/myAxios'
import type { User } from '@/types'

const getUser = () => myAxios.get<User>('/user')

const patchUser = (payload: Partial<Pick<User, 'name' | 'email'>>) =>
  myAxios.patch<User>('/user', payload)

export { getUser, patchUser }
