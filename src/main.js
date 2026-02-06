import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/style/common.css'
import './assets/style/seed.css'
import './assets/style/bubble.css'
import './assets/style/more.css'
import './assets/style/detail.scss'

import './utils/public'

import Main from './main.vue'

const pinia = createPinia()

createApp(Main)
    .use(pinia)
    .mount('#app')
