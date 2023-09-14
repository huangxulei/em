<script setup>
import { inject, ref } from 'vue';
import { storeToRefs } from 'pinia';
import EventBus from '../../common/EventBus';

//TODO 整体设计比较乱，后续待梳理
import { useLocalMusicStore } from '../store/localMusicStore';
import { useAppCommonStore } from '../store/appCommonStore';
import { usePlatformStore } from '../store/platformStore';
import { usePlayStore } from '../store/playStore';
import { Playlist } from '../../common/Playlist';

const props = defineProps({
    posStyle: Object,
    data: Array
})

const { visitCustomPlaylistCreate, visitLocalPlaylistCreate } = inject('appRoute')
const { playPlaylist } = inject('player')
let currentDataType = -1

const { commonCtxItem, commonCtxMenuCacheItem } = storeToRefs(useAppCommonStore())
const { showToast, setCommonCtxMenuData, hideAllCtxMenus } = useAppCommonStore()
const { playTrackLater, addTrack, removeTrack, addTracks, playTrack } = usePlayStore()
const { addToLocalPlaylist, moveToLocalPlaylist } = useLocalMusicStore()
const { localPlaylists } = storeToRefs(useLocalMusicStore())
const { isLocalMusic } = usePlatformStore()

const isLocalMusicType = (dataType) => (dataType == 10)
//TODO
const isMenu = () => true

const toastAndHideMenu = (text) => {
    showToast(text)
    hideAllCtxMenus()
}

const playItem = () => {
    hideAllCtxMenus()
    playTrack(commonCtxMenuCacheItem.value)
}

const addItemToQueue = () => {
    const cache = commonCtxMenuCacheItem.value
    if (Array.isArray(cache)) {
        addTracks(cache)
    } else {
        addTrack(cache)
    }
    toastAndHideMenu("歌曲添加成功！")
}

const playItemLater = () => {
    playTrackLater(commonCtxMenuCacheItem.value)
    toastAndHideMenu("下一曲将为您播放！")
}

const showAddToList = (event, mode) => {
    const track = commonCtxMenuCacheItem.value
    if (!track || Playlist.isFMRadioType(track)) return
    const { platform } = track
    const dataType = isLocalMusic(platform) ? 10 : 6
    // doShowAddToListSubmenu(event, 2, dataType)
}

const visitPlaylistCreate = () => {
    isLocalMusicType(currentDataType) ? visitLocalPlaylistCreate() : visitCustomPlaylistCreate()
}

const MenuItems = {
    sp: {
        separator: true
    },
    play: {
        name: '播放',
        icon: '<svg width="16" height="16" viewBox="0 0 139 139" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M117.037,61.441L36.333,14.846c-2.467-1.424-5.502-1.424-7.972,0c-2.463,1.423-3.982,4.056-3.982,6.903v93.188  c0,2.848,1.522,5.479,3.982,6.9c1.236,0.713,2.61,1.067,3.986,1.067c1.374,0,2.751-0.354,3.983-1.067l80.704-46.594  c2.466-1.422,3.984-4.054,3.984-6.9C121.023,65.497,119.502,62.866,117.037,61.441z"/></svg>',
        action: playItem,
    },
    playLater: {
        name: '下一曲播放',
        icon: '<svg width="16" height="16" viewBox="0 0 1016.14 1016.1" xmlns="http://www.w3.org/2000/svg" ><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path d="M855.35,134.55q23.42-24,46.82-47.91c6.59-6.74,14.31-8.93,23.23-5.48,8.24,3.18,12.69,10.31,12.7,20.15q.06,57,0,114,0,33.49,0,67c0,14-8.28,22.46-22.36,22.47q-90.5.09-181,0c-10.7,0-17.88-4.41-21.12-12.85-3.55-9.25-.61-16.75,6.14-23.5,20.64-20.6,41.13-41.35,61.93-62.31a20,20,0,0,0-2-2.21c-57.49-50.33-123.7-83-199-95.71C467.07,89,362.61,112.61,269.37,180.43c-83.05,60.41-137,141.45-157.78,242.16-26.92,130.72,2.28,248.84,89,350.94,56.55,66.57,128.32,109.92,213.54,130C605,948.46,798.31,854.19,880.52,676.35A390.93,390.93,0,0,0,914.21,556.2c3.36-29.3,24.65-48.78,52.66-48,28.86.77,52.2,27.58,49,56.25-23.63,209.77-175.59,383.91-380.38,435.94a507.7,507.7,0,0,1-178.46,13C250.67,992.07,76.68,846.67,19.72,647.81A498.26,498.26,0,0,1,2.91,455.41C17.55,320.13,77.17,208.27,180.28,120,246.77,63,324.09,27.56,409.73,10.1A490.72,490.72,0,0,1,556.41,2.33q157.29,15.45,279.36,116c6.05,5,11.88,10.21,17.82,15.31.11.09.31.08.46.11Z"/><path d="M407.78,508q0-91.2,0-182.41c0-3.14,0-6.45.94-9.38,3.77-11.85,19-15.17,28-6.11,5.28,5.31,10.19,11,15.25,16.53Q528.83,410.82,605.63,495c7.79,8.54,8,16.88.35,25.32q-83.93,92.22-168,184.33c-8.22,9-20.92,9-27-.47-2.24-3.5-3.13-8.43-3.14-12.71-.2-56.64-.14-113.28-.14-169.92Z"/></g></g></svg>',
        action: playItemLater,
    },
    addToQueue: {
        name: '当前播放',
        icon: '<svg width="13" height="13" viewBox="0 0 682.28 597.06" xmlns="http://www.w3.org/2000/svg"><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path d="M597.41,348.87v-7.12q0-148.73,0-297.45c0-21.61,12.87-38.33,33-43.16,25.6-6.14,51,13.32,51.67,39.64.14,5.33.07,10.66.07,16,0,136.81.29,273.62-.14,410.42-.17,54.89-25.81,95.18-75.43,118.3-76.43,35.63-167.21-14.9-178.41-98.26C418.79,417.15,465.4,354,535,342.85a119,119,0,0,1,56.75,4.31C593.32,347.67,594.9,348.11,597.41,348.87Z"/><path d="M255.64,84.82q-104.73,0-209.46.06c-13.1,0-24.79-3.21-33.93-12.94C.19,59.1-3.13,44,3,27.57S21.6,2,39.19.34c2.65-.25,5.32-.29,8-.29Q255.89,0,464.6,0c9.48,0,18.54,1.16,26.81,6.3,15.55,9.68,23.33,28.26,19,45.77-4.53,18.37-19.25,31-37.85,32.44-3.15.24-6.32.29-9.48.29Q359.36,84.84,255.64,84.82Z"/><path d="M234.76,255.4q-95.46,0-190.92,0c-21.35,0-38.21-13.2-42.57-32.94A42.4,42.4,0,0,1,41,170.69c1.33-.06,2.66-.07,4-.07q189.66,0,379.33,0c21.48,0,38,12.15,43.2,31.67,7.08,26.38-12.46,52.85-39.81,53-64.3.27-128.61.09-192.91.09Z"/><path d="M170.39,341.48c42.81,0,85.62-.11,128.42,0,21.15.08,38,14.74,41.44,35.38a42.3,42.3,0,0,1-40.09,49.26c-1.33.07-2.67.07-4,.07q-125.67,0-251.35,0C24.12,426.22,8,414.9,2.16,396.47c-8.51-26.86,11.14-54.69,39.31-54.89,43-.3,85.94-.08,128.92-.08Z"/><path d="M170.48,596.82c-41.64,0-83.28-.08-124.92,0-17.84,0-31.81-6.75-40.39-22.64-14.51-26.86,3.62-59.55,34.07-61.89,2.32-.18,4.66-.28,7-.28q124.41,0,248.84-.06c18.44,0,32.79,6.84,41.31,23.55,13.68,26.81-4.47,58.93-34.5,60.88-12.44.81-25,.37-37.46.39Q217.46,596.87,170.48,596.82Z"/></g></g></svg>',
        action: addItemToQueue,
    },
    addToList: {
        name: '添加到',
        icon: '<svg width="16" height="16" viewBox="0 0 768.02 554.57" xmlns="http://www.w3.org/2000/svg"><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path d="M341.9,0q148,0,296,0C659,0,675,11.28,680.8,30.05c8.34,26.78-11.43,54.43-39.45,55.18-1.17,0-2.33,0-3.5,0q-296.46,0-592.93,0C22.37,85.25,5.32,71.87.87,50.78-4.36,26,14.59,1.39,39.94.12c2.49-.13,5-.11,7.5-.11Z"/><path d="M554.64,426.5h-6.72c-26.49,0-53,.17-79.47-.1a41.87,41.87,0,0,1-39.06-27.7,42.4,42.4,0,0,1,11.2-46.19,41.85,41.85,0,0,1,29.11-11.25q39.49,0,79,0h6V335c0-26-.12-52,0-78,.15-25.3,19.44-44.3,44.06-43.72,23.23.55,41.24,19.54,41.37,43.92.13,25.82,0,51.65,0,77.48v6.57h5.67c26.65,0,53.31-.11,80,.05,20.38.12,37.94,14.9,41.51,34.49,3.74,20.57-7.15,40.65-26.59,47.73a53.72,53.72,0,0,1-17.56,2.85c-25.66.3-51.32.13-77,.13h-6v6.36c0,26,.1,52,0,78-.11,20.74-13.1,37.68-32.17,42.41-27.42,6.8-53-13.28-53.24-42.11-.22-26-.05-52-.05-78Z"/><path d="M234.37,256q-94.73,0-189.44,0c-21.55,0-38.62-12.68-43.5-32.09-6.74-26.8,12.45-52.1,40.47-53.35,1.33-.06,2.67-.05,4-.05H423.78c21.17,0,37.53,11.12,43.49,29.46,9.15,28.13-11.52,55.87-42,56-36.32.15-72.64,0-109,0Z"/><path d="M170.91,426.5c-42.48,0-85,.07-127.45,0-20.94-.06-37.61-13.2-42.21-32.85-6.18-26.41,13.5-52,40.6-52.3,23.82-.27,47.65-.07,71.47-.07q92.46,0,184.93,0c24.55,0,43.52,19.37,43.12,43.58-.38,23.41-19.15,41.53-43.51,41.61-40,.12-80,0-120,0Z"/></g></g></svg>',
        menu: isMenu,
        action: showAddToList,
    },
    addToListNoQueue: () => ({
        name: '添加到',
        icon: '<svg width="16" height="16" viewBox="0 0 768.02 554.57" xmlns="http://www.w3.org/2000/svg"><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path d="M341.9,0q148,0,296,0C659,0,675,11.28,680.8,30.05c8.34,26.78-11.43,54.43-39.45,55.18-1.17,0-2.33,0-3.5,0q-296.46,0-592.93,0C22.37,85.25,5.32,71.87.87,50.78-4.36,26,14.59,1.39,39.94.12c2.49-.13,5-.11,7.5-.11Z"/><path d="M554.64,426.5h-6.72c-26.49,0-53,.17-79.47-.1a41.87,41.87,0,0,1-39.06-27.7,42.4,42.4,0,0,1,11.2-46.19,41.85,41.85,0,0,1,29.11-11.25q39.49,0,79,0h6V335c0-26-.12-52,0-78,.15-25.3,19.44-44.3,44.06-43.72,23.23.55,41.24,19.54,41.37,43.92.13,25.82,0,51.65,0,77.48v6.57h5.67c26.65,0,53.31-.11,80,.05,20.38.12,37.94,14.9,41.51,34.49,3.74,20.57-7.15,40.65-26.59,47.73a53.72,53.72,0,0,1-17.56,2.85c-25.66.3-51.32.13-77,.13h-6v6.36c0,26,.1,52,0,78-.11,20.74-13.1,37.68-32.17,42.41-27.42,6.8-53-13.28-53.24-42.11-.22-26-.05-52-.05-78Z"/><path d="M234.37,256q-94.73,0-189.44,0c-21.55,0-38.62-12.68-43.5-32.09-6.74-26.8,12.45-52.1,40.47-53.35,1.33-.06,2.67-.05,4-.05H423.78c21.17,0,37.53,11.12,43.49,29.46,9.15,28.13-11.52,55.87-42,56-36.32.15-72.64,0-109,0Z"/><path d="M170.91,426.5c-42.48,0-85,.07-127.45,0-20.94-.06-37.61-13.2-42.21-32.85-6.18-26.41,13.5-52,40.6-52.3,23.82-.27,47.65-.07,71.47-.07q92.46,0,184.93,0c24.55,0,43.52,19.37,43.12,43.58-.38,23.41-19.15,41.53-43.51,41.61-40,.12-80,0-120,0Z"/></g></g></svg>',
        menu: isMenu,
        action: (event) => showAddToList(event, 2),
    }),
    addAllToListNoQueue: () => ({
        name: '全部添加到',
        icon: '<svg width="16" height="16" viewBox="0 0 768.02 554.57" xmlns="http://www.w3.org/2000/svg"><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path d="M341.9,0q148,0,296,0C659,0,675,11.28,680.8,30.05c8.34,26.78-11.43,54.43-39.45,55.18-1.17,0-2.33,0-3.5,0q-296.46,0-592.93,0C22.37,85.25,5.32,71.87.87,50.78-4.36,26,14.59,1.39,39.94.12c2.49-.13,5-.11,7.5-.11Z"/><path d="M554.64,426.5h-6.72c-26.49,0-53,.17-79.47-.1a41.87,41.87,0,0,1-39.06-27.7,42.4,42.4,0,0,1,11.2-46.19,41.85,41.85,0,0,1,29.11-11.25q39.49,0,79,0h6V335c0-26-.12-52,0-78,.15-25.3,19.44-44.3,44.06-43.72,23.23.55,41.24,19.54,41.37,43.92.13,25.82,0,51.65,0,77.48v6.57h5.67c26.65,0,53.31-.11,80,.05,20.38.12,37.94,14.9,41.51,34.49,3.74,20.57-7.15,40.65-26.59,47.73a53.72,53.72,0,0,1-17.56,2.85c-25.66.3-51.32.13-77,.13h-6v6.36c0,26,.1,52,0,78-.11,20.74-13.1,37.68-32.17,42.41-27.42,6.8-53-13.28-53.24-42.11-.22-26-.05-52-.05-78Z"/><path d="M234.37,256q-94.73,0-189.44,0c-21.55,0-38.62-12.68-43.5-32.09-6.74-26.8,12.45-52.1,40.47-53.35,1.33-.06,2.67-.05,4-.05H423.78c21.17,0,37.53,11.12,43.49,29.46,9.15,28.13-11.52,55.87-42,56-36.32.15-72.64,0-109,0Z"/><path d="M170.91,426.5c-42.48,0-85,.07-127.45,0-20.94-.06-37.61-13.2-42.21-32.85-6.18-26.41,13.5-52,40.6-52.3,23.82-.27,47.65-.07,71.47-.07q92.46,0,184.93,0c24.55,0,43.52,19.37,43.12,43.58-.38,23.41-19.15,41.53-43.51,41.61-40,.12-80,0-120,0Z"/></g></g></svg>',
        menu: isMenu,
        action: (event) => showAddToList(event, 3),
    }),
    moveToList: {
        name: '移动到',
        icon: '<svg width="16" height="16" viewBox="0 0 896.41 896.43" xmlns="http://www.w3.org/2000/svg" ><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path d="M415.82,109.83l-48,48.05q-11.67,11.67-23.34,23.33c-14.07,14-33.73,14.73-46.83,1.73s-12.53-32.9,1.73-47.17q59-59.06,118.08-118.09c2.82-2.83,5.51-5.8,8.4-8.56,12.57-12,32.28-12.27,44.62,0q64.28,64.05,128.23,128.43a31.73,31.73,0,0,1,0,45.37c-12.6,12.5-32.34,12.53-45.37-.36-22.87-22.61-45.53-45.44-68.25-68.21-1.29-1.3-2.32-2.85-4.48-3.71V415.9H786.3c-1.58-1.7-2.72-3-3.95-4.25-22.74-22.76-45.57-45.41-68.2-68.27-17.51-17.69-10.76-46.49,12.53-53.62,12.85-3.94,23.94-.4,33.33,9q55.34,55.33,110.67,110.65c5.3,5.3,10.7,10.51,16,15.83,12.84,12.93,13.06,32.88.24,45.72q-63.58,63.68-127.36,127.18c-13.4,13.34-33.4,13.48-46.1.58s-12.39-32.47.78-45.74q33.82-34.05,67.88-67.87a42.32,42.32,0,0,1,4.34-3.38l-.68-1.09H480.5V786.38c1.78-1.66,3.1-2.82,4.34-4.06,22.75-22.74,45.39-45.59,68.27-68.2,17.57-17.36,46-10.82,53.41,12.18,4.13,12.82.82,24-8.56,33.42Q563.39,794.43,528.69,829q-28.62,28.66-57.19,57.36c-13.28,13.32-33.2,13.4-46.44.15q-63.24-63.3-126.45-126.67c-15.18-15.23-13.55-38.16,3.41-49.93,13-9,29.71-7.37,41.5,4.36q34,33.84,67.88,67.87c1.28,1.27,2.3,2.8,4.44,3.56V480.48H110c1.59,1.68,2.73,2.93,3.92,4.13,22.74,22.75,45.56,45.42,68.2,68.26,16.12,16.26,12.33,41.91-7.47,51.9-12.65,6.39-27,4-37.65-6.56-15.15-15-30.17-30.16-45.27-45.23Q51,512.36,10.27,471.77C-3.29,458.26-3.46,438.41,10,425q63.14-63.06,126.31-126.1c12.29-12.27,29-14.12,42.24-4.83,16.7,11.76,18.39,34.58,3.47,49.61-22.55,22.71-45.23,45.27-67.85,67.91-1.25,1.25-2.43,2.57-4.12,4.37H415.82Z"/></g></g></svg>',
        menu: isMenu,
        action: (event) => showAddToList(event, 1),
    },
    createCustom: {
        name: '新建歌单',
        icon: '<svg width="16" height="16" viewBox="0 0 768.02 554.57" xmlns="http://www.w3.org/2000/svg"><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path d="M341.9,0q148,0,296,0C659,0,675,11.28,680.8,30.05c8.34,26.78-11.43,54.43-39.45,55.18-1.17,0-2.33,0-3.5,0q-296.46,0-592.93,0C22.37,85.25,5.32,71.87.87,50.78-4.36,26,14.59,1.39,39.94.12c2.49-.13,5-.11,7.5-.11Z"/><path d="M554.64,426.5h-6.72c-26.49,0-53,.17-79.47-.1a41.87,41.87,0,0,1-39.06-27.7,42.4,42.4,0,0,1,11.2-46.19,41.85,41.85,0,0,1,29.11-11.25q39.49,0,79,0h6V335c0-26-.12-52,0-78,.15-25.3,19.44-44.3,44.06-43.72,23.23.55,41.24,19.54,41.37,43.92.13,25.82,0,51.65,0,77.48v6.57h5.67c26.65,0,53.31-.11,80,.05,20.38.12,37.94,14.9,41.51,34.49,3.74,20.57-7.15,40.65-26.59,47.73a53.72,53.72,0,0,1-17.56,2.85c-25.66.3-51.32.13-77,.13h-6v6.36c0,26,.1,52,0,78-.11,20.74-13.1,37.68-32.17,42.41-27.42,6.8-53-13.28-53.24-42.11-.22-26-.05-52-.05-78Z"/><path d="M234.37,256q-94.73,0-189.44,0c-21.55,0-38.62-12.68-43.5-32.09-6.74-26.8,12.45-52.1,40.47-53.35,1.33-.06,2.67-.05,4-.05H423.78c21.17,0,37.53,11.12,43.49,29.46,9.15,28.13-11.52,55.87-42,56-36.32.15-72.64,0-109,0Z"/><path d="M170.91,426.5c-42.48,0-85,.07-127.45,0-20.94-.06-37.61-13.2-42.21-32.85-6.18-26.41,13.5-52,40.6-52.3,23.82-.27,47.65-.07,71.47-.07q92.46,0,184.93,0c24.55,0,43.52,19.37,43.12,43.58-.38,23.41-19.15,41.53-43.51,41.61-40,.12-80,0-120,0Z"/></g></g></svg>',
        action: visitPlaylistCreate,
    },
}

const moveToAction = (dataType, item) => {
    const tracks = []
    const cache = commonCtxMenuCacheItem.value //被选择的数据
    if (Array.isArray(cache)) {
        tracks.push(...cache)
    } else {
        tracks.push(item)
    }
    const fromId = commonCtxItem.value.id //全部的数据
    const toId = item.id

    const action = moveToLocalPlaylist
    if (action) {
        tracks.forEach(track => {
            action(toId, fromId, track)
        })
        toastAndHideMenu("歌曲移动成功！")
    }
}

const doInit = (data) => {
    hideAllCtxMenus()
    setCommonCtxMenuData(data)
}

//获取菜单 Menu.item的一个数组 
/**
 *  --5
 * @param {*} dataType 场景
 * @param {*} isMoveAction 出现位置 有两个地方显示 
 */
const initBatchActionPopupMenuData = (dataType, isMoveAction) => {
    const data = []
    //['当前播放','新建歌单',...'已建歌单']
    const fixedItems = [MenuItems.addToQueue, MenuItems.createCustom]
    // 两个位置 不同菜单选项 
    isMoveAction ? data.push(fixedItems[1]) : data.push(...fixedItems)
    //获取已建歌单 isLocalMusicType(dataType)  dataType==10
    const playlists = localPlaylists.value

    playlists.forEach(item => {//循环歌单 其他歌单载入
        //跳过自身
        if (item.id == commonCtxItem.value.id) return //排除当前歌单
        data.push({ //歌单名字 和动作 已建歌单没有icon 
            name: item.title,
            action: () => {
                moveToAction(dataType, item)
            }
        })
    })
    return data
}

const visitMenuItem = (item, index, event) => {
    if (!item || !item.action) return
    item.action(item, index, event)
    EventBus.emit("commonCtxMenuItem-finish")
}

//--4
EventBus.on("commonCtxMenu-init", ({ dataType, actionType }) => {
    currentDataType = dataType
    let data = []
    switch (dataType) {
        case 6: //我的主页 - 批量操作 - 移动到菜单、移动到菜单 
            data = initBatchActionPopupMenuData(dataType, actionType == 1)
            break;
        case 10: //本地歌曲 - 批量操作 - 添加到菜单、移动到菜单 
            data = initBatchActionPopupMenuData(dataType, actionType == 1)
            break;
    }
    doInit(data)
})

</script>
<template>
    <div class="common-ctx-menu" :style="posStyle" @click.stop="">
        <div class="container">
            <div class="padding"></div>
            <div class="center">
                <template v-for="(item, index) in data">
                    <div class="menuItem" @click="(event) => visitMenuItem(item, index, event)" v-show="!item.separator">
                        <div v-html="item.icon"></div>
                        <div><span>{{ item.name }}</span></div>
                    </div>
                    <div class="separator" v-show="item.separator && false"></div>
                </template>
            </div>
            <div class="padding"></div>
        </div>
    </div>
</template>
<style>
.common-ctx-menu {
    position: absolute;
    z-index: 101;
    display: flex;
    box-shadow: 0px 0px 6px var(--border-popovers-border-color);
    max-height: 386px;
    border-radius: 8px;
}

.common-ctx-menu .container {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: var(--content-bg-color);
    background: var(--content-bg-color-no-transparent);
}

.common-ctx-menu .padding {
    height: 15px;
}

.common-ctx-menu .center {
    overflow: auto;
}

.common-ctx-menu .menuItem {
    width: 168px;
    display: flex;
    flex-direction: row;
    align-items: center;
    /* font-size: 14px; */
    font-size: var(--content-text-subtitle-size);
    padding: 9px 20px;
    height: 23px;
}

.common-ctx-menu .menuItem:hover {
    background-color: var(--content-subtitle-text-color);
    background: var(--button-icon-text-btn-bg-color);
    color: var(--button-icon-text-btn-icon-color);
}

.common-ctx-menu .menuItem:hover svg {
    fill: var(--button-icon-text-btn-icon-color);
}

.common-ctx-menu .menuItem>div {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.common-ctx-menu .menuItem svg {
    margin-right: 15px;
    fill: var(--content-text-color);
}

.common-ctx-menu .menuItem span {
    overflow: hidden;
    word-wrap: break-all;
    white-space: pre-wrap;
    line-break: anywhere;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    text-align: left;
}

.common-ctx-menu .separator {
    margin: 3px 15px;
    height: 0px;
    border-bottom: 0.36px solid var(--border-color);
}
</style>