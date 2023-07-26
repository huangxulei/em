<script setup>
import { onMounted, inject, shallowRef, provide, computed } from 'vue'
import { storeToRefs } from 'pinia';
import Mousetrap from 'mousetrap';
import Themes from './Themes.vue'
import DefaultLayout from './layout/DefaultLayout.vue'
import SimpleLayout from './layout/SimpleLayout.vue'
import { useSettingStore } from './store/settingStore'
import { isMacOS, isWinOS, useIpcRenderer } from '../common/Utils'

const { isSimpleLayout, getWindowZoom } = storeToRefs(useSettingStore())
const ipcRenderer = useIpcRenderer()
const currentAppLayout = shallowRef(null)

//载入布局
const setupLayout = (isInit) => {
    let channel = 'app-layout-default'
    if (isSimpleLayout.value) {
        currentAppLayout.value = SimpleLayout
        channel = 'app-layout-simple'
    } else {
        currentAppLayout.value = DefaultLayout
        //EventBus.emit(channel)
    }
    //if (ipcRenderer) ipcRenderer.send(channel, { zoom: getWindowZoom.value, isInit })
}

const restoreSetting = () => {
    //初始化
    setupLayout(true)
}

const initialize = () => {
    restoreSetting()
}

//直接在setup()时初始化，不需要等待其他生命周期
initialize()

</script>
<template>
    <Themes>
        <component :is="currentAppLayout"> </component>
        <slot></slot>
    </Themes>
</template>
<style scoped></style>