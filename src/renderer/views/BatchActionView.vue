<script>
//定义名称，方便用于<keep-alive>
export default {
    name: 'BatchActionView'
}
</script>

<script setup>
import { storeToRefs } from 'pinia';
import { inject, ref, onMounted, reactive, shallowRef, watch } from 'vue';
import EventBus from '../../common/EventBus';
import Mousetrap from 'mousetrap';
import { useAppCommonStore } from '../store/appCommonStore';
import { usePlatformStore } from '../store/platformStore';
import { usePlayStore } from '../store/playStore';
import { useSettingStore } from '../store/settingStore';
import { useLocalMusicStore } from '../store/localMusicStore';
import PlaylistsControl from '../components/playlistscontrol.vue'
import SongListControl from '../components/SongListControl.vue';
import { useIpcRenderer } from '../../common/Utils';
import { toYyyymmddHhMmSs } from '../../common/Times';

const { addTracks, playTrack } = usePlayStore()
const { currentPlatformCode } = storeToRefs(usePlatformStore())
const { updateCurrentPlatform } = usePlatformStore()

const { localPlaylists } = storeToRefs(useLocalMusicStore())
const { getLocalPlaylist, removeFromLocalPlaylist, removeLocalPlaylist } = useLocalMusicStore()
const { showToast } = useAppCommonStore()

//来至于 router 
const props = defineProps({
    source: String, //数据源，所属功能/模块
    id: String //记录ID
})
const { currentRoutePath, backward } = inject('appRoute')
const ipcRenderer = useIpcRenderer()

const title = ref("")
const subtitle = ref("")
const activeTab = ref(0)
const tabTipText = ref("")
const currentTabView = shallowRef(null)
const tabData = reactive([])

const checkedData = reactive([])
const checkedAll = ref(false)
const ignoreCheckAllEvent = ref(false)
const sourceItem = reactive({})

const typeTabs = [
    {
        code: 'songs', name: '歌曲', text: '已选择0首歌曲'
    },
    {
        code: 'playlists', name: '歌单', text: '已选择0个歌单'
    }
]

const isCustomPlaylist = () => props.source == "custom"
const isLocalMusic = () => props.source == "local"

const isTabsVisible = (tab, index) => {
    if (isCustomPlaylist() && index == 0) return true
    if (isLocalMusic() && props.id !== '0' && index == 0) return true
    if (isLocalMusic() && props.id === '0' && index == 1) return true
    return false
}

const getFirstVisibleTabIndex = () => {
    if (isLocalMusic() && props.id === '0') {
        return 1
    }
    return 0
}

//操作按钮显示
const actionShowCtl = reactive({
    playBtn: false,//播放歌曲
    addToBtn: false,//添加到当前列表
    moveToBtn: false,//移动
    addToQueueBtn: false,
    deleteBtn: true,
    exportBtn: false
})

const resetTab = () => {
    tabData.length = 0
    checkedData.length = 0
    currentTabView.value = null
    ignoreCheckAllEvent.value = false
    checkedAll.value = false
    Object.assign(actionShowCtl, {
        playBtn: false,
        addToBtn: false,
        moveToBtn: false,
        addToQueueBtn: false,
        exportBtn: false,
        deleteBtn: true
    })
    EventBus.emit("checkbox-refresh")
}

const switchTab = () => {
    resetTab()
    const platform = currentPlatformCode.value
    if (activeTab.value == 0) {//
        Object.assign(actionShowCtl, {
            playBtn: true,
            addToBtn: true,
            deleteBtn: true
        })
        if (isLocalMusic()) {
            Object.assign(actionShowCtl, {
                playBtn: true,
                addToQueueBtn: true,
                addToBtn: true,
                moveToBtn: true,
                deleteBtn: true
            })
            tabData.push(...loadLocalPlaylist())
        }
        currentTabView.value = SongListControl
    } else if (activeTab.value == 1) {
        if (isLocalMusic()) {
            Object.assign(actionShowCtl, {
                addToQueueBtn: true,
                deleteBtn: true,
                exportBtn: true
            })
            tabData.push(...localPlaylists())
        }
        currentTabView.value = PlaylistsControl
    }
    updateTipText()
    //TODO
    EventBus.emit("batchView-show")
}
const loadLocalPlaylist = () => {
    const playlist = getLocalPlaylist(props.id)
    Object.assign(sourceItem, { ...playlist })
    return playlist.data
}

const updateTipText = () => {
    tabTipText.value = typeTabs[activeTab.value].text.replace('0', checkedData.length)
}

const visitTab = (index) => {
    activeTab.value = index
    switchTab()
}

const onCheckChanged = (checked, item) => {
    if (checked) {
        checkedData.push(item)
    } else {
        const index = checkedData.findIndex(e => (item.id == e.id && item.platform == e.platform))
        if (index > -1) checkedData.splice(index, 1)
    }
    ignoreCheckAllEvent.value = true
    checkedAll.value = (checkedData.length == tabData.length)
    updateTipText()
}

//全选
const toggleSelectAll = () => {
    if (tabData.length < 1) return
    ignoreCheckAllEvent.value = false
    checkedAll.value = !checkedAll.value
    checkedData.length = 0
    if (checkedAll.value) {
        checkedData.push(...tabData)// 假如全选,就将数据读入tabData 
    }
    updateTipText() //显示提示 
}

const sortCheckData = () => {
    if (checkedData.length < 1) return
    return checkedData.sort((a, b) => (a.index - b.index))
}

const playChecked = () => {
    const sortedData = sortCheckData()
    addTracks(sortedData)//id, track
    playTrack(sortedData[0])
    showToast("即将为您播放歌曲！")
    refresh()
}

//TODO
const refresh = () => {
    EventBus.emit("checkbox-refresh")
    visitTab(activeTab.value)
}

const addToQueue = () => {
    if (!actionShowCtl.addToQueueBtn) return
    const sortedData = sortCheckData()
    addTracks(sortedData)
    showToast("歌曲添加成功！")
    refresh()
}

onMounted(() => {
    updateCurrentPlatform(0)
    visitTab(getFirstVisibleTabIndex())
})
</script>
<template>
    <div id="batch-action-view">
        <div class="header">
            <div class="title-wrap">批量操作
                <div class="title">
                    <span class="subtitle" v-html="subtitle"></span>{{ title }}
                </div>
            </div>
            <div class="tabs">
                <span class="tab" v-for="(tab, index) in typeTabs"
                    :class="{ active: activeTab == index, 'content-text-highlight': activeTab == index }"
                    @click="visitTab(index)" v-show="isTabsVisible(tab, index)" v-html="tab.name">
                </span>
                <span class="tab-tip content-text-highlight" v-html="tabTipText"></span>
            </div>
        </div>
        <div class="center">
            <div class="action">
                <div class="checkbox checkall" :class="{ 'button-disabled': (tabData.length < 1) }"
                    @click="toggleSelectAll">
                    <svg v-show="!checkedAll" width="16" height="16" viewBox="0 0 731.64 731.66"
                        xmlns="http://www.w3.org/2000/svg">
                        <g id="Layer_2" data-name="Layer 2">
                            <g id="Layer_1-2" data-name="Layer 1">
                                <path
                                    d="M365.63,731.65q-120.24,0-240.47,0c-54.2,0-99.43-30.93-117.6-80.11A124.59,124.59,0,0,1,0,608q0-242.21,0-484.42C.11,60.68,43.7,10.45,105.88,1.23A128.67,128.67,0,0,1,124.81.06q241-.09,481.93,0c61.43,0,110.72,39.85,122.49,99.08a131.72,131.72,0,0,1,2.3,25.32q.19,241.47.07,482.93c0,60.87-40.25,110.36-99.18,121.9a142.56,142.56,0,0,1-26.83,2.29Q485.61,731.81,365.63,731.65ZM48.85,365.45q0,121.76,0,243.5c0,41.57,32.38,73.82,73.95,73.83q243,.06,486,0c41.57,0,73.93-32.24,73.95-73.84q.11-243.24,0-486.49c0-41.3-32.45-73.55-73.7-73.57q-243.24-.06-486.49,0a74.33,74.33,0,0,0-14.89,1.42c-34.77,7.2-58.77,36.58-58.8,72.1Q48.76,244,48.85,365.45Z" />
                            </g>
                        </g>
                    </svg>
                    <svg v-show="checkedAll" class="checked-svg" width="16" height="16" viewBox="0 0 767.89 767.94"
                        xmlns="http://www.w3.org/2000/svg">
                        <g id="Layer_2" data-name="Layer 2">
                            <g id="Layer_1-2" data-name="Layer 1">
                                <path
                                    d="M384,.06c84.83,0,169.66-.18,254.48.07,45,.14,80.79,18.85,106.8,55.53,15.59,22,22.58,46.88,22.57,73.79q0,103,0,206,0,151.74,0,303.48c-.07,60.47-39.68,111.19-98.1,125.25a134.86,134.86,0,0,1-31.15,3.59q-254.73.32-509.47.12c-65,0-117.87-45.54-127.75-109.7a127.25,127.25,0,0,1-1.3-19.42Q0,384,0,129.28c0-65,45.31-117.82,109.57-127.83A139.26,139.26,0,0,1,131,.12Q257.53,0,384,.06ZM299.08,488.44l-74-74c-10.72-10.72-21.28-21.61-32.23-32.1a31.9,31.9,0,0,0-49.07,5.43c-8.59,13-6.54,29.52,5.35,41.43q62,62.07,124.05,124.08c16.32,16.32,34.52,16.38,50.76.15q146.51-146.52,293-293a69.77,69.77,0,0,0,5.44-5.85c14.55-18.51,5.14-45.75-17.8-51-12.6-2.9-23,1.37-32.1,10.45Q438.29,348.38,303.93,482.65C302.29,484.29,300.93,486.22,299.08,488.44Z" />
                            </g>
                        </g>
                    </svg>
                    <span>{{ (checkedAll ? "取消全选" : "全选") }}</span>
                </div>
                <SvgTextButton :disabled="checkedData.length < 1" text="播放" class="spacing" v-show="actionShowCtl.playBtn"
                    :leftAction="playChecked" :rightAction="addToQueue">
                    <template #left-img>
                        <svg width="16" height="16" viewBox="0 0 139 139" xml:space="preserve"
                            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <path
                                d="M117.037,61.441L36.333,14.846c-2.467-1.424-5.502-1.424-7.972,0c-2.463,1.423-3.982,4.056-3.982,6.903v93.188  c0,2.848,1.522,5.479,3.982,6.9c1.236,0.713,2.61,1.067,3.986,1.067c1.374,0,2.751-0.354,3.983-1.067l80.704-46.594  c2.466-1.422,3.984-4.054,3.984-6.9C121.023,65.497,119.502,62.866,117.037,61.441z" />
                        </svg>
                    </template>
                    <template #right-img>
                        <svg v-show="actionShowCtl.addToQueueBtn" width="16" height="16" viewBox="0 0 768.02 554.57"
                            xmlns="http://www.w3.org/2000/svg">
                            <g id="Layer_2" data-name="Layer 2">
                                <g id="Layer_1-2" data-name="Layer 1">
                                    <path
                                        d="M341.9,0q148,0,296,0C659,0,675,11.28,680.8,30.05c8.34,26.78-11.43,54.43-39.45,55.18-1.17,0-2.33,0-3.5,0q-296.46,0-592.93,0C22.37,85.25,5.32,71.87.87,50.78-4.36,26,14.59,1.39,39.94.12c2.49-.13,5-.11,7.5-.11Z" />
                                    <path
                                        d="M554.64,426.5h-6.72c-26.49,0-53,.17-79.47-.1a41.87,41.87,0,0,1-39.06-27.7,42.4,42.4,0,0,1,11.2-46.19,41.85,41.85,0,0,1,29.11-11.25q39.49,0,79,0h6V335c0-26-.12-52,0-78,.15-25.3,19.44-44.3,44.06-43.72,23.23.55,41.24,19.54,41.37,43.92.13,25.82,0,51.65,0,77.48v6.57h5.67c26.65,0,53.31-.11,80,.05,20.38.12,37.94,14.9,41.51,34.49,3.74,20.57-7.15,40.65-26.59,47.73a53.72,53.72,0,0,1-17.56,2.85c-25.66.3-51.32.13-77,.13h-6v6.36c0,26,.1,52,0,78-.11,20.74-13.1,37.68-32.17,42.41-27.42,6.8-53-13.28-53.24-42.11-.22-26-.05-52-.05-78Z" />
                                    <path
                                        d="M234.37,256q-94.73,0-189.44,0c-21.55,0-38.62-12.68-43.5-32.09-6.74-26.8,12.45-52.1,40.47-53.35,1.33-.06,2.67-.05,4-.05H423.78c21.17,0,37.53,11.12,43.49,29.46,9.15,28.13-11.52,55.87-42,56-36.32.15-72.64,0-109,0Z" />
                                    <path
                                        d="M170.91,426.5c-42.48,0-85,.07-127.45,0-20.94-.06-37.61-13.2-42.21-32.85-6.18-26.41,13.5-52,40.6-52.3,23.82-.27,47.65-.07,71.47-.07q92.46,0,184.93,0c24.55,0,43.52,19.37,43.12,43.58-.38,23.41-19.15,41.53-43.51,41.61-40,.12-80,0-120,0Z" />
                                </g>
                            </g>
                        </svg>
                    </template>
                </SvgTextButton>
            </div>
            <div class="content" ref="contentRef">
                <component :is="currentTabView" :data="tabData" :checkbox="true"
                    :checkedAll="checkedAll" :checkChangedFn="onCheckChanged"
                    :ignoreCheckAllEvent="ignoreCheckAllEvent" :checkedData="checkedData">
                </component>
            </div>
        </div>
    </div>
</template>
<style>
#batch-action-view {
    padding: 20px 0px 15px 0px;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

#batch-action-view .header,
#batch-action-view .center .action,
#batch-action-view .center .content {
    padding-left: 33px;
    padding-right: 33px;
}

#batch-action-view .spacing {
    margin-right: 20px;
}

#batch-action-view .header {
    text-align: left;
    margin-bottom: 15px;
}

#batch-action-view .header .title-wrap {
    text-align: left;
    /*font-size: 30px;*/
    font-size: var(--content-text-module-title-size);
    font-weight: bold;
    position: relative;
}

#batch-action-view .header .title {
    position: absolute;
    top: 8px;
    right: 10px;
    text-align: right;
    margin-left: 25px;
    /*font-size: 23px;*/
    font-size: var(--content-text-module-subtitle-size);
    font-weight: bold;
}

#batch-action-view .header .subtitle {
    font-size: 17px;
    font-weight: bold;
    margin-right: 25px;
    color: var(--content-subtitle-text-color);
}

#batch-action-view .header .tabs {
    display: flex;
    align-items: center;
    text-align: left;
    padding-bottom: 0px;
    border-bottom: 1px solid var(--border-color);
    border-bottom: 1px solid transparent;
    margin-top: 8px;
    position: relative;
}

#batch-action-view .header .tab {
    font-size: var(--content-text-tab-title-size);
    padding: 8px 15px;
    border-bottom: 3px solid transparent;
    cursor: pointer;
}

#batch-action-view .header .active {
    font-weight: bold;
    border-bottom: 3px solid var(--content-highlight-color);
}

#batch-action-view .header .search-wrap {
    position: absolute;
    right: 202px;
    display: flex;
    align-items: center;
    font-weight: bold;
}

#batch-action-view .header .search-wrap svg {
    margin-top: 1px;
}

#batch-action-view .header .tab-tip {
    position: absolute;
    right: 10px;
    font-weight: bold;
}

#batch-action-view .center {
    display: flex;
    flex-direction: column;
}

#batch-action-view .action {
    display: flex;
    flex-direction: row;
    position: relative;
    margin-bottom: 10px;
}

#batch-action-view .action svg {
    fill: var(--button-icon-text-btn-text-color);
}

#batch-action-view .action .to-right {
    position: absolute;
    right: 33px;
}

#batch-action-view .action .checkbox {
    flex-direction: row;
    margin-left: 8px;
    margin-right: 15px;
}

/*
#batch-action-view .header .checkbox svg,
#batch-action-view .action .checkbox svg {
    fill: var(--button-icon-btn-color);
    cursor: pointer;
}

#batch-action-view .header .checkbox .checked-svg,
#batch-action-view .action .checkbox .checked-svg {
    fill: var(--content-highlight-color);
}
*/

#batch-action-view .action .checkbox>span {
    text-align: left;
    margin: 0px 20px;
    /*width: 65px;*/
    min-width: 80px;
    cursor: pointer;
}

#batch-action-view .action .checkall span {
    margin-left: 13px;
}

#batch-action-view .content {
    overflow: scroll;
}
</style>