<script setup>
import { provide } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import EventBus from '../common/EventBus'
import { Playlist } from '../common/Playlist';
import { isDevEnv } from '../common/Utils'
/* 全局Router设置  */
const router = useRouter()
const setupRouter = () => {
    router.beforeResolve((to, from) => {
        if (isDevEnv()) console.log("[ ROUTE ] ==>>> " + to.path)
        autoSwitchExploreMode(to)
        highlightPlatform(to)
    })
}

//根据浏览模式选择
const autoSwitchExploreMode = (to) => {
    const path = to.path
    if (path.includes('/playlists/')) {
        setExploreMode(0)
    } else if (path.includes('/artists/')) {
        setArtistExploreMode()
    } else if (path.includes('/radios')) {
        setRadioExploreMode()
    } else if (path.includes('/userhome')) {
        setUserHomeExploreMode()
    } else {
        //setExploreMode(0)
    }
}

//platform 固定
const highlightPlatform = (to) => {
    const path = to.path
    let platform = ''
    if (path.includes('/local')) {
        platform = 'local'
    } else if (path.includes('/freefm')) {
        platform = 'freefm'
    } else if (path.includes('/square') || path.includes('/playlist')
        || path.includes('/artist') || path.includes('/album')) {
        platform = path.split('/')[3]
    } else if (path.includes('/userhome')) {
        const parts = path.split('/')
        // /userhome/{code}
        if (parts.length === 3) platform = parts[2]
        // /userhome/custom/{id}
        if (parts.length === 4 && parts[2] === 'custom') platform = 'all'
    }
    updateCurrentPlatformByCode(platform)
}

setupRouter()

</script>
<template>
    <slot></slot>
</template>
<style scoped></style>