<script setup>
// 缓存
const excludes = ['LocalMusicView', 'BatchActionView', 'LocalPlaylistEditView']
</script>
<template>
    <div id="default-main-content">
        <router-view v-slot="{ Component }">
            <keep-alive :exclude="excludes" :max="12">
                <component :is="Component" />
            </keep-alive>
        </router-view>
    </div>
</template>
<style>
#default-main-content {
    display: flex;
    flex: 1;
    overflow: auto;
    overflow-x: hidden;
}
</style>