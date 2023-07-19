<script setup>
import { provide } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import EventBus from '../common/EventBus'
import { Playlist } from '../common/Playlist';
import { isDevEnv } from '../common/Utils'
import { usePlatformStore } from './store/platformStore';
import { useAppCommonStore } from './store/appCommonStore'
import { useSettingStore } from './store/settingStore'

const { setExploreMode, setArtistExploreMode, setRadioExploreMode,
    setUserHomeExploreMode, updateCurrentPlatformByCode } = usePlatformStore()
const { exploreModeCode, isUserHomeMode } = storeToRefs(useAppCommonStore())
const { hidePlayingView, hideVideoPlayingView } = useAppCommonStore()
const { isSimpleLayout } = storeToRefs(useSettingStore())
const { switchToFallbackLayout } = useSettingStore()
/* 全局Router设置  */
const router = useRouter()
const setupRouter = () => {
    router.beforeResolve((to, from) => {
        if (isDevEnv()) console.log("[ ROUTE ] ==>>> " + to.path)
        autoSwitchExploreMode(to)
        highlightPlatform(to)
        hideRelativeComponents(to)//清除所有显示的组件
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

const hideRelativeComponents = (to) => {
    hidePlayingView()
    hideVideoPlayingView()
}

setupRouter()

const currentRoutePath = () => (router.currentRoute.value.path)
const resolveExploreMode = (exploreMode) => (exploreMode || exploreModeCode.value)
const resolveRoute = (route) => (typeof (route) == 'object' ? route : { toPath: route.toString() })
const visitRoute = (route) => {
    return new Promise((resolve, reject) => {
        if (!route) {
            return
        }
        const { toPath, onRoutReady, beforeRoute } = resolveRoute(route)
        if (!toPath) {
            return
        }
        if (beforeRoute) beforeRoute(toPath)
        const fromPath = currentRoutePath()
        const isSame = (fromPath == toPath)
        if (isSame) {
            return
        }
        if (onRoutReady) onRoutReady(toPath)
        router.push(toPath)
        if (resolve) resolve()

    })
}

provide('appRoute', {
    currentRoutePath, visitRoute,
    backward: () => router.back(),
    forward: () => router.forward(),
})
</script>
<template>
    <slot></slot>
</template>
<style scoped></style>