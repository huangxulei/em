<script setup>
import { onActivated, watch, onMounted, shallowRef } from 'vue';
import { storeToRefs } from 'pinia'
import { useAppCommonStore } from '../store/appCommonStore';
import { useSettingStore } from '../store/settingStore';
import DefaultMainContent from './DefaultMainContent.vue'
import ClassicMainTop from './ClassicMainTop.vue'
import ClassicMainBottom from './ClassicMainBottom.vue'
import DefaultMainTop from './DefaultMainTop.vue'
import DefaultMainBottom from './DefaultMainBottom.vue'
import EventBus from '../../common/EventBus'

const { isDefaultLayout, isDefaultClassicLayout } = storeToRefs(useSettingStore())

const currentMainTop = shallowRef(null)
const currentMainBottom = shallowRef(null)

const setupDefaultLayout = () => {
    if (isDefaultClassicLayout.value) {//默认
        currentMainTop.value = ClassicMainTop
        currentMainBottom.value = ClassicMainBottom
    } else {
        currentMainTop.value = DefaultMainTop
        currentMainBottom.value = DefaultMainBottom
    }
}

onActivated(setupDefaultLayout)

EventBus.on('app-layout-default', setupDefaultLayout)
</script>
<template>
    <div id="default-main-center">
        <component id="default-main-top" :is="currentMainTop"></component>
        <DefaultMainContent id="default-main-content"></DefaultMainContent>
        <component id="default-main-bottom" :is="currentMainBottom"></component>
    </div>
</template>
<style>
#default-main-center {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    background: var(--content-bg-color);
}

#default-main-center,
#default-main-top,
#default-main-content,
#default-main-bottom {
    z-index: 0;
}

#default-main-center .autolayout {
    top: 60px;
}
</style>