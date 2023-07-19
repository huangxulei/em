<script setup>
import { storeToRefs } from 'pinia';
import { onMounted, inject, shallowRef, provide, computed } from 'vue';
import Mousetrap from 'mousetrap';
import Themes from './Themes.vue'
import { isMacOS, isWinOS, useIpcRenderer } from '../common/Utils';

const ipcRenderer = useIpcRenderer()
const currentAppLayout = shallowRef(null)
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