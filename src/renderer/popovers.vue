<script setup>
import { onMounted, reactive, ref, shallowRef, watch } from 'vue';
import { storeToRefs } from 'pinia';
import EventBus from '../common/EventBus';
import { useAppCommonStore } from './store/appCommonStore';
import { useSettingStore } from './store/settingStore';
import Notification from './components/Notification.vue';
import CommonContextMenu from './components/CommonContextMenu.vue';
import PlaylistCategoryView from './views/PlaylistCategoryView.vue';
import PlayingView from './views/PlayingView.vue';
import VisualPlayingView from './views/VisualPlayingView.vue';
import PlaylistExportToolbar from './components/PlaylistExportToolbar.vue';

const currentPlayingView = shallowRef(null)
const ctxMenuPosStyle = reactive({ left: -999, top: -999 })
const ctxSubmenuPosStyle = reactive({ left: -999, top: -999 })
let ctxMenuPos = null, submenuItemNums = 0

const { playbackQueueViewShow, playingViewShow, playingViewThemeIndex, commonNotificationShow, commonCtxMenuData,
    commonCtxMenuSeparatorNums, commonNotificationType, playlistCategoryViewShow, commonCtxMenuShow, playlistExportToolbarShow,
    commonNotificationText } = storeToRefs(useAppCommonStore())
const { hideCommonCtxMenu, showCommonCtxMenu } = useAppCommonStore()

const { isDefaultClassicLayout } = storeToRefs(useSettingStore())

const setupPlayingView = (index) => {
    index = index || playingViewThemeIndex.value
    const playingViewThemes = [PlayingView, VisualPlayingView]
    currentPlayingView.value = playingViewThemes[index]
    //重置动画计数器，让歌曲进度直接刷新
    //nextTick(() => EventBus.emit('track-resetAnimFrameCnt'))
}

const appBackgroundScope = reactive({
    playingView: true,
    playbackQueue: false,
    contextMenu: false,
    toast: false,
    soundEffectView: false,
    lyricToolbar: false,
    randomMusicToolbar: false
})

onMounted(() => {
    setupPlayingView()
})
//计算菜单的高度 
const getCtxMenuAutoHeight = () => {
    const total = commonCtxMenuData.value.length || 1 //所有数量
    const spNums = commonCtxMenuSeparatorNums.value //分隔符
    const itemHeight = 38, padding = 15 //每个item 高度
    return itemHeight * (total - spNums) + 7.5 * spNums + 2 * padding
}

const menuWidth = 208
//菜单位置校正 
const adjustMenuPosition = (event) => {
    // x y 左下角坐标 鼠标点击坐标 
    const { x, y, clientX, clientY } = event
    const pos = { x, y }
    //校正 意义不大
    const { clientWidth, clientHeight } = document.documentElement
    const menuHeight = getCtxMenuAutoHeight(), padding = 10
    const gapX = clientX + menuWidth - clientWidth
    const tGapY = clientY - menuHeight
    const bGapY = clientY + menuHeight - clientHeight
    //右边界
    if (gapX > 0) {
        pos.x = pos.x - gapX - padding
    }
    //TODO 菜单有可能溢出顶部边界
    if (bGapY > 0) { //溢出底部边界
        pos.y = pos.y - menuHeight + padding / 2
    }
    return pos
}

const setMenuPosition = (event) => {
    ctxMenuPos = adjustMenuPosition(event)
    ctxMenuPosStyle.left = ctxMenuPos.x + 'px !important'
    ctxMenuPosStyle.top = ctxMenuPos.y + 'px !important'
}

EventBus.on('commonCtxMenu-show', ({ event, value }) => {
    hideCommonCtxMenu(true) //强制取消上次的显示
    setMenuPosition(event)//设置显示位置
    showCommonCtxMenu(value)
})

</script>
<template>
    <div id="popovers">

        <CommonContextMenu v-show="commonCtxMenuShow" :class="{ 'app-custom-theme-bg': appBackgroundScope.contextMenu }"
            :posStyle="ctxMenuPosStyle" :data="commonCtxMenuData">
        </CommonContextMenu>

        <!-- 浮层(Component、View)-->
        <transition name="fade-ex">
            <PlaylistCategoryView id="playlist-category-view"
                :class="{ autolayout: isDefaultClassicLayout, 'app-custom-theme-bg': appBackgroundScope.categoryView }"
                v-show="playlistCategoryViewShow">
            </PlaylistCategoryView>
        </transition>

        <!-- 通用通知 -->
        <transition>
            <Notification class="common-ntf" v-show="commonNotificationShow" :class="{ 'app-custom-theme-bg': appBackgroundScope.toast }">
                <template #text>
                    <svg v-show="commonNotificationType == 0" width="36" height="36" viewBox="0 0 938.64 938.69"
                        xmlns="http://www.w3.org/2000/svg">
                        <g id="Layer_2" data-name="Layer 2">
                            <g id="Layer_1-2" data-name="Layer 1">
                                <path
                                    d="M938.46,466.59C937,602.08,888.74,717.76,790.36,811.31,722.44,875.92,641.39,915.54,549,931.7,306.41,974.12,70.65,819.29,13.17,579.86-38.14,366.13,63.88,146.91,260.42,49A462.65,462.65,0,0,1,435.07,1.28Q552.46-7.2,660,40.58c15.8,7,24.57,19.69,25.33,37.09s-6.88,30.65-22,39.18C651,123.88,638,124,625,118.26a376.21,376.21,0,0,0-96.43-28.41c-69.72-10.57-137.89-4-202.85,23.59C197.76,167.71,119,263.69,91.84,399.89s26.83,280,135.37,367.47q85.32,68.79,194,82.94c192.43,25.2,376.66-101.94,421.23-290.4a408.28,408.28,0,0,0,10.9-96.56c-.08-13.64-.79-27.46,1-40.89,2.93-21.41,23-36.29,44.43-34.79A42.34,42.34,0,0,1,938.4,428.6C938.75,441.26,938.46,453.93,938.46,466.59Z" />
                                <path
                                    d="M470.19,495.64c1.38-2,2.4-3.95,3.9-5.45Q668.36,295.61,862.65,101.05c8.69-8.71,18.42-14.78,30.91-15.44A42.62,42.62,0,0,1,926.39,158c-19.87,20.19-40,40.14-60,60.18Q683.73,401,501.09,583.9C490.92,594.08,479,599,464.58,597.61A41.12,41.12,0,0,1,439,585.32q-64-63.95-127.93-128a42.29,42.29,0,0,1,.12-60.22c16.85-16.81,43.36-16.72,60.59.42q46.78,46.56,93.36,93.3C466.4,492.08,467.73,493.29,470.19,495.64Z" />
                            </g>
                        </g>
                    </svg>
                    <svg v-show="commonNotificationType == 1" class="warning" width="36" height="36" viewBox="0 0 832.69 833.08"
                        xmlns="http://www.w3.org/2000/svg">
                        <g id="Layer_2" data-name="Layer 2">
                            <g id="Layer_1-2" data-name="Layer 1">
                                <path
                                    d="M0,418.14C2,184.11,181.54,3.07,414.93,0,639.74-2.89,831.55,180.28,832.68,415.49c1.05,217.63-172.6,416.07-409.88,417.58C194.72,834.53.54,657.29,0,418.14Zm75.72,3.78c3.1,196.32,163.2,339.48,350.11,335.38,191.56-4.21,332.05-161.39,331.12-342-1-191.48-157.61-341.62-342.68-340C236.24,76.93,73.14,219.63,75.72,421.92Z" />
                                <path
                                    d="M454.23,345c0,41.82.08,83.63-.09,125.45A56.72,56.72,0,0,1,452,487.12c-6.05,18.87-28.39,28.48-49,21.57-15-5-23.76-16.62-24.43-32.4-.08-2-.1-4-.1-6q0-125.44.08-250.9a56.36,56.36,0,0,1,2.1-16.71c5.27-16.66,22.26-25.72,42.18-23.21,17.37,2.19,30,15.26,31.06,32.55.48,8.14.3,16.32.31,24.48Q454.25,290.72,454.23,345Z" />
                                <path
                                    d="M452.88,599.79c-.06,22.38-15.21,37.83-37,37.71-21.28-.12-36.23-15.84-36.18-38,.05-22,15.29-37.76,36.5-37.8C437.74,561.63,452.94,577.45,452.88,599.79Z" />
                            </g>
                        </g>
                    </svg>
                    <p v-html="commonNotificationText"></p>
                </template>
            </Notification>
        </transition>

        <!-- 顶层浮动窗口 -->
        <transition name="fade-y">
            <component id="playing-view" v-show="playingViewShow" :is="currentPlayingView" :class="{ 'app-custom-theme-bg': appBackgroundScope.playingView }">
            </component>
        </transition>

        <transition name="fade-ex">
            <PlaybackQueueView id="playback-queue-view" :class="{ 'app-custom-theme-bg': appBackgroundScope.playbackQueue }"
                v-show="playbackQueueViewShow">
            </PlaybackQueueView>
        </transition>

        <PlaylistExportToolbar id="playlist-export-toolbar" v-show="playlistExportToolbarShow"></PlaylistExportToolbar>
    </div>
</template>
<style>
#playlist-category-view,
#artist-category-view,
#radio-category-view,
#tags-category-view {
    position: fixed;
    top: 85px;
    right: 0px;
    width: 404px;
    width: 40.4%;
    z-index: 55;
    background-color: var(--app-bg-color);
    background-image: var(--app-bg-image);
    box-shadow: 0px 0px 10px #161616;
}

#playback-queue-view {
    position: absolute;
    top: 0;
    right: 0px;
    width: 335px;
    max-width: 404px;
    width: 33.5%;
    height: 100%;
    z-index: 99;
    box-shadow: var(--box-shadow);
    border-top-right-radius: var(--border-macstyle-border-radius);
    border-bottom-right-radius: var(--border-macstyle-border-radius);
}

#playing-view,
#video-playing-view {
    position: absolute;
    top: 0;
    left: 0px;
    width: 100%;
    height: 100%;
    z-index: 99;
    background-position: center;
    background-size: cover;
    border-radius: var(--border-macstyle-border-radius);
}

#video-playing-view {
    z-index: 100;
}

#sound-effect-view {
    position: absolute;
    right: 30px;
    bottom: 80px;
    width: 725px;
    height: 550px;
    z-index: 99;
    box-shadow: var(--box-shadow);
}

#lyric-toolbar {
    position: absolute;
    top: 202px;
    right: 30px;
    z-index: 99;
    box-shadow: var(--box-shadow);
}

#random-music-toolbar {
    position: absolute;
    bottom: 128px;
    right: 30px;
    z-index: 99;
    box-shadow: var(--box-shadow);
}

#custom-theme-edit-view {
    position: absolute;
    right: 30px;
    bottom: 80px;
    width: 768px;
    height: 520px;
    z-index: 99;
    background-color: var(--app-bg-color);
    box-shadow: var(--box-shadow);
}

#color-picker-toolbar {
    position: absolute;
    left: 50%;
    bottom: 125px;
    z-index: 101;
    background-color: var(--app-bg-color);
    box-shadow: var(--box-shadow);
}

#gradient-color-toolbar {
    width: 768px;
    height: 568px;
    position: absolute;
    left: 50%;
    bottom: 125px;
    z-index: 100;
    background-color: var(--app-bg-color);
    box-shadow: var(--box-shadow);
}

#playlist-export-toolbar {
    width: 520px;
    height: 211px;
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 100;
    background-color: var(--app-bg-color);
    box-shadow: var(--box-shadow);
}

.app-custom-theme-bg .ntf-dialog-mask {
    background-color: var(--app-bg-color);
    background-image: var(--app-bg-image);
}

#popovers .autolayout {
    top: 60px;
}

#popovers .popover-hint {
    z-index: 1024;
}

#popovers .popover-hint .ntf-dialog-mask {
    border-radius: 6px;
}

#popovers .popover-hint .ntf-dialog {
    width: auto !important;
    height: auto !important;
    align-items: flex-start;
}

#popovers .popover-hint .ntf-text {
    font-size: var(--content-text-tip-text-size);
    padding: 6px 15px;
}

#popovers .popover-hint .ntf-text div {
    text-align: left;
    align-items: center;
    min-width: 20px;
    max-width: 520px;
    width: max-content !important;
    height: auto !important;
}
</style>