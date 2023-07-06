<script setup>
import { storeToRefs } from 'pinia';
import { onMounted, watch } from 'vue';
import CssReset from './CssReset.vue'
import CssCommon from './CssCommon.vue'
import EventBus from '../common/EventBus'


const setupFontStyle = () => {
    theme = theme || 
}

onMounted(setupFontStyle)

</script>
<template>
    <CssReset></CssReset>
    <CssCommon></CssCommon>
    <slot></slot>
</template>
<style></style>