import { createApp } from 'vue'
import App from './App.vue'

import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persist'

import { router } from './router/router'
import VueLazyLoad from 'vue3-lazyload'

const pinia = createPinia()
pinia.use(piniaPersist)

const app = createApp(App)
//全局异常处理器
app.config.errorHandler = (err, vm, info) => {
    // 处理错误
    // `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
    //暂时仅需捕获，以免程序崩溃，其他不用特别处理
}

app.use(pinia).use(router).use(VueLazyLoad, {
    loading: 'default_cover.png',
    error: 'default_cover.png',
    log: false,
    lifecycle: {
        error: (el) => {
            //console.log(el)
        }
    }
}).mount('#app')