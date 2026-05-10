import './assets/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { myAxios } from '@/instances/myAxios'

await myAxios.get('/sanctum/csrf-cookie', { baseURL: import.meta.env.VITE_BASE_URL })

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
