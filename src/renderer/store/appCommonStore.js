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
        //通用通知
        commonNotificationShow: false,
        commonNotificationText: null,
        commonNotificationType: 0, //类型，0 - 普通成功消息，1-失败消息
        commonNotificationImportant: false, //是否可以被新消息覆盖
        //通用上下文菜单
        commonCtxMenuShow: false,
        commonCtxMenuData: [],
        commonCtxItem: {},  //菜单的上下文对象，用于公共参数传递
        commonCtxMenuCacheItem: {}, //菜单缓存对象，与具体点击的菜单项相关
        commonCtxMenuSeparatorNums: 0,
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
        quit() {
            if (ipcRenderer) ipcRenderer.send('app-quit')
        },
        minimize(isToTray) {
            if (ipcRenderer) ipcRenderer.send('app-min', isToTray)
        },
        maximize() {
            if (ipcRenderer) ipcRenderer.send('app-max')
        },
    }
})