<script setup>
import { onMounted, inject, shallowRef, provide, computed } from 'vue'
import { storeToRefs } from 'pinia';
import Mousetrap from 'mousetrap';
import Themes from './Themes.vue'
import DefaultLayout from './layout/DefaultLayout.vue'
import SimpleLayout from './layout/SimpleLayout.vue'
import { useSettingStore } from './store/settingStore';
import { usePlayStore } from './store/playStore';
import { useAppCommonStore } from './store/appCommonStore';
import { isMacOS, isWinOS, useIpcRenderer } from '../common/Utils'
import EventBus from '../common/EventBus';

const { isSimpleLayout, getWindowZoom } = storeToRefs(useSettingStore())
const { hidePlaybackQueueView, hideAllCategoryViews, hideAllCtxMenus } = useAppCommonStore()
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
        EventBus.emit(channel)
    }
    if (ipcRenderer) ipcRenderer.send(channel, { zoom: getWindowZoom.value, isInit })
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

const hideAllPopoverViews = () => {
    //隐藏当前播放
    hidePlaybackQueueView()
    //隐藏全部分类
    hideAllCategoryViews()
    //隐藏上下文菜单
    hideAllCtxMenus()
}

onMounted(() => {
    //点击事件监听
    document.addEventListener('click', e => {
        //隐藏全部浮层
        hideAllPopoverViews()
    })

})

let isConfirmDialogShowing = false
const showConfirm = async ({ title, msg }) => {
    if (!ipcRenderer || isConfirmDialogShowing) return false
    isConfirmDialogShowing = true
    const ok = await ipcRenderer.invoke('show-confirm', {
        title: title || '确认',
        msg
    })
    isConfirmDialogShowing = false
    return ok
}


provide('appCommon', {
    showConfirm
})

</script>
<template>
    <Themes>
        <keep-alive :max="2">
            <component :is="currentAppLayout"> </component>
        </keep-alive>
        <slot></slot>
    </Themes>
</template>
<style scoped></style>