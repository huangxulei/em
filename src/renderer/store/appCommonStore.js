import { defineStore } from 'pinia'
import EventBus from '../../common/EventBus';
import { useIpcRenderer } from "../../common/Utils";

const ipcRenderer = useIpcRenderer()
let toastTimer = null

export const useAppCommonStore = defineStore('appCommon', {
    state: () => ({
        coverMaskShow: false,
        playlistCategoryViewShow: false,
        artistCategoryViewShow: false,
        radioCategoryViewShow: false,
        playbackQueueViewShow: false,
        playingViewShow: false,
        videoPlayingViewShow: false,
        soundEffectViewShow: false,
        customThemeEditViewShow: false,
        workingCustomTheme: null, //当前工作区的自定义主题，即正在编辑的主题
        //探索模式，歌单、歌手
        exploreModes: ['playlists', 'artists', 'radios', 'userhome'],
        exploreModeIndex: 0,
        exploreModeActiveStates: [true, true, true, false],
        //通用通知
        commonNotificationShow: false,
        commonNotificationText: null,
        commonNotificationType: 0, //类型，0 - 普通成功消息，1-失败消息
        commonNotificationImportant: false, //是否可以被新消息覆盖
        //通用上下文菜单
        commonCtxMenuShow: false,
        commonCtxMenuData: [],//菜单数据
        commonCtxItem: {},  // 全部数据
        commonCtxMenuCacheItem: {}, //选择的数据
        commonCtxMenuSeparatorNums: 0,//分隔符 数量
        addToListSubmenuShow: false,
        artistListSubmenuShow: false,
        exitToHomeBtnShow: false,
        playingViewThemeIndex: 0,
        spectrumIndex: 0,
        //歌词设置
        lyricToolbarShow: false,
        //随便听听设置
        randomMusicToolbarShow: false,
        randomMusicPlatformCodes: [],
        randomMusicTypeCodes: [],
        currentMusicCategoryName: null,
        //当前调用链路追踪ID
        currentTraceId: null,
        colorPickerToolbarShow: false,
        gradientColorToolbarShow: false,
        //悬浮提示
        popoverHintShow: false,
        popoverHintText: null,
        popoverHintTarget: null,
        //独占搜索框
        searchBarExclusiveAction: null,
        playlistExportToolbarShow: false,
        playlistExportContextItem: null
    }),
    getters: {
        isPlaylistMode() {
            return this.exploreModeIndex == 0
        },
        isArtistMode() {
            return this.exploreModeIndex == 1
        },
        isRadioMode() {
            return this.exploreModeIndex == 2
        },
        isUserHomeMode() {
            return this.exploreModeIndex == 3
        },
        exploreModeCode() {
            return this.exploreModes[this.exploreModeIndex]
        },
        exploreModeLength() {
            return this.exploreModes.length
        },
        isActiveRandomMusicPlatform() {
            return (platform) => {
                return this.randomMusicPlatformCodes.includes(platform)
            }
        },
        isActiveRandomMusicType() {
            return (type) => {
                return this.randomMusicTypeCodes.includes(type)
            }
        },
        isExploreModeEnable() {
            return (exploreMode) => {
                const index = this.exploreModes.findIndex(item => (item == exploreMode))
                return this.exploreModeActiveStates[index]
            }
        },
        isRadioModeEnable() {
            return this.isExploreModeEnable('radios')
        }
    },
    actions: {
        hidePlaybackQueueView() {
            this.playbackQueueViewShow = false
        },
        togglePlaybackQueueView() {
            this.playbackQueueViewShow = !this.playbackQueueViewShow
        },
        togglePlaylistCategoryView() {
            this.playlistCategoryViewShow = !this.playlistCategoryViewShow
            if (!this.playlistCategoryViewShow) {
                EventBus.emit("playlistCategory-resetScroll")
            }
        },
        hidePlaylistCategoryView() {
            this.playlistCategoryViewShow = false
            EventBus.emit("playlistCategory-resetScroll")
        },
        toggleArtistCategoryView() {
            this.artistCategoryViewShow = !this.artistCategoryViewShow
            if (!this.artistCategoryViewShow) {
                EventBus.emit("artistCategory-resetScroll")
            }
        },
        hideArtistCategoryView() {
            this.artistCategoryViewShow = false
            EventBus.emit("artistCategory-resetScroll")
        },
        toggleRadioCategoryView() {
            this.radioCategoryViewShow = !this.radioCategoryViewShow
            if (!this.radioCategoryViewShow) {
                EventBus.emit("radioCategory-resetScroll")
            }
        },
        hideRadioCategoryView() {
            this.radioCategoryViewShow = false
            EventBus.emit("radioCategory-resetScroll")
        },
        showPlayingView() {
            this.playingViewShow = true
        },
        hidePlayingView() {
            this.playingViewShow = false
        },
        togglePlayingView() {
            this.playingViewShow = !this.playingViewShow
        },
        hideVideoPlayingView() {
            this.videoPlayingViewShow = false
        },
        toggleVideoPlayingView() {
            this.videoPlayingViewShow = !this.videoPlayingViewShow
        },
        hideSoundEffectView() {
            this.soundEffectViewShow = false
        },
        toggleSoundEffectView() {
            this.soundEffectViewShow = !this.soundEffectViewShow
        },
        toggleCoverMask() {
            this.coverMaskShow = !this.coverMaskShow
        },
        setCurrentTraceId(id) {
            this.currentTraceId = id
        },
        isCurrentTraceId(id) {
            return this.currentTraceId == id
        },
        quit() {
            if (ipcRenderer) ipcRenderer.send('app-quit')
        },
        minimize(isToTray) {
            if (ipcRenderer) ipcRenderer.send('app-min', isToTray)
        },
        maximize() {
            if (ipcRenderer) ipcRenderer.send('app-max')
        },
        setExploreMode(index) {
            if (!index || index < 0) index = 0
            this.exploreModeIndex = index % this.exploreModeLength
        },
        setPlaylistExploreMode() {
            this.setExploreMode(0)
        },
        setArtistExploreMode() {
            this.setExploreMode(1)
        },
        setRadioExploreMode() {
            this.setExploreMode(2)
        },
        setUserHomeExploreMode() {
            this.setExploreMode(3)
        },
        nextExploreMode() {
            const length = this.exploreModeLength
            if (this.exploreModeIndex == length - 2) {
                this.setExploreMode(0)
            } else {
                this.setExploreMode(this.exploreModeIndex + 1)
            }
        },
        hideAllCategoryViews() {
            this.hidePlaylistCategoryView()
            // this.hideArtistCategoryView()
            // this.hideRadioCategoryView()
        },
        hideAllCtxMenus() {
            this.hideCommonCtxMenu()
            // this.hideAddToListSubmenu()
            // this.hideArtistListSubmenu()
        },
        setCommonNotificationType(type) {
            this.commonNotificationType = type || 0
        },
        showCommonNotification(text) {
            //没有内容就不显示
            if (!text || typeof (text) != 'string' || text.trim().length < 1) return
            this.commonNotificationText = text
            this.commonNotificationShow = true
        },
        hideCommonNotification() {
            this.commonNotificationShow = false
            this.commonNotificationText = null
            this.commonNotificationImportant = false
            this.setCommonNotificationType(-1)
        },
        doToast(text, type, callback, delay) {
            if (toastTimer) clearTimeout(toastTimer)
            this.showCommonNotification(text)
            this.setCommonNotificationType(type)
            toastTimer = setTimeout(() => {
                this.hideCommonNotification()
                try {
                    if (callback) callback()
                } catch (error) {
                    console.log(error)
                }
            }, (delay || 1500))
        },
        showToast(text, callback, delay) {
            if (this.commonNotificationImportant) return
            this.doToast(text || "操作成功！", 0, callback, delay || 1688)
        },
        showFailToast(text, callback, delay) {
            this.doToast(text || "操作失败！", 1, callback, delay || 2233)
        },
        updateCommonCtxItem(value) {
            this.commonCtxItem = value
        },
        updateCommonCtxMenuCacheItem(value) {
            this.commonCtxMenuCacheItem = value
        },
        showCommonCtxMenu(value) {
            this.commonCtxMenuShow = true
            this.updateCommonCtxMenuCacheItem(value)
        },
        hideCommonCtxMenu(clearCache) {
            this.commonCtxMenuShow = false
            if (clearCache) this.updateCommonCtxMenuCacheItem(null)
        },
        setCommonCtxMenuData(data) {
            this.commonCtxMenuData.length = 0
            if (data) {
                let spCnt = 0
                data.forEach(item => {
                    this.commonCtxMenuData.push(item)
                    if (item.separator) ++spCnt
                });
                this.commonCtxMenuSeparatorNums = spCnt
            }
        },
        showPlaylistExportToolbar(contextItem) {
            this.playlistExportContextItem = contextItem
            this.playlistExportToolbarShow = true
        },
        hidePlaylistExportToolbar() {
            this.playlistExportContextItem = null
            this.playlistExportToolbarShow = false
        }
    }
})