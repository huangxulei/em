<script setup>
import { storeToRefs } from 'pinia';
import { inject } from 'vue'
import { useSettingStore } from '../store/settingStore';
import { useAppCommonStore } from '../store/appCommonStore';
import EventBus from '../../common/EventBus';


</script>
<template>
    <div class="classic-main-top">

    </div>
</template>
<style>
.classic-main-top {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 60px;
    -webkit-app-region: drag;
    position: relative;
    padding-left: 33px;
}
</style>