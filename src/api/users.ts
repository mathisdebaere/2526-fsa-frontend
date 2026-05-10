import { myAxios } from '@/instances/myAxios'

const getUsers = () => myAxios.get('/users')

export { getUsers }
