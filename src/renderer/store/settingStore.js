import { defineStore } from 'pinia'
import EventBus from '../../common/EventBus'
import { useIpcRenderer } from '../../common/Utils'
import { useThemeStore } from './themeStore'

const ipcRenderer = useIpcRenderer()

const QUALITIES = [
    {
        id: 'standard',
        name: '标准'
    }, {
        id: 'high',
        name: '高品'
    }, {
        id: 'sq',
        name: '无损'
    }, {
        id: 'hi-res',
        name: 'Hi-Res'
    }
]

const FONTSIZE_LEVELS = [
    {
        id: 'default',
        name: '默认',
        value: 15.5
    }, {
        id: 'small',
        name: '小',
        value: 14.5
    }, {
        id: 'standard',
        name: '标准',
        value: 15.5
    }, {
        id: 'medium',
        name: '中等',
        value: 16.5
    }, {
        id: 'large',
        name: '大',
        value: 17.5
    }, {
        id: 'larger',
        name: '较大',
        value: 18.5
    }, {
        id: 'largest',
        name: '更大',
        value: 19.5
    }
]

export const useSettingStore = defineStore('setting', {
    state: () => ({
        theme: {
            type: 0,
            index: 1
        },
        layout: {
            index: 1,
            fallbackIndex: 1
        },
        common: {
            winZoom: 85,
            fontFamily: '',
            fontWeight: 400,
            fontSizeLevel: 3,
            fontSize: 17.5
        },
        modules: {  //功能模块
            off: {  //关闭列表
                playlists: [],
                artists: [],
                radios: [],
                search: []
            }
        },
        track: {
            quality: {
                index: 0
            },
            //VIP收费歌曲，是否自动切换到免费歌曲（可能来自不同平台）
            vipTransfer: true,
            vipFlagShow: false,
            //歌单分类栏随机显示
            playlistCategoryBarRandom: false,
            playlistCategoryBarFlowBtnShow: false,
            playbackQueueAutoPositionOnShow: false,
            listenNumShow: false,
            //视频播放退出后，自动继续播放歌曲
            resumePlayAfterVideo: true,
            //播放歌曲时，防止系统睡眠
            playingWithoutSleeping: true,
            //歌曲进度更新频度，默认为60，范围：1 - 1024
            stateRefreshFrequency: 60,
            //歌曲频谱刷新频度，默认为3，范围：1 - 256
            spectrumRefreshFrequency: 3,
            ////本地歌曲
            //启用在线封面
            useOnlineCover: true,
            //显示音频格式
            audioTypeFlagShow: false,
            //扫描目录时，启用深度遍历
            useDeeplyScanForDirectory: true,
            //启用Dnd操作，创建本地歌单
            useDndForCreateLocalPlaylist: true,
            //启用Dnd操作，为本地歌单添加歌曲
            useDndForAddLocalTracks: true,
        },
        /* 歌词 */
        lyric: {
            fontSize: 22,   //普通字号
            hlFontSize: 22, //高亮字号
            fontWeight: 400,
            lineHeight: 28,
            lineSpacing: 28,
            offset: 0, //时间补偿值，快慢
            metaPos: 0, //歌曲信息, 0:默认, 1:隐藏, 2:顶部
            alignment: 0, //对齐方式, 0:左, 1:中, 2:右
            trans: true, //翻译
            roma: true //发音
        },
        /* 菜单栏、Windows平台为系统托盘 */
        tray: {
            show: false, //是否在菜单栏显示
            showOnMinimized: false, //是否最小化到菜单栏
        },
        /* 导航栏 */
        navigation: {
            customPlaylistsShow: false,
            favoritePlaylistsShow: false,
            followArtistsShow: false,
            radioModeShortcut: true,
            modulesSettingShortcut: false,
            themesShortcut: true,
            userHomeShortcut: true,
            simpleLayoutShortcut: true,
        },
    }),
    getters: {
        isVipTransferEnable() {
            return this.track.vipTransfer
        },
        isDefaultLayout() { //默认布局，目前包含2种
            const index = this.layout.index
            return index == 0 || index == 1
        },
        isDefaultClassicLayout() {
            return this.layout.index == 1
        },
        isSimpleLayout() {
            return this.layout.index == 2
        },
        lyricMetaPos() {
            return this.lyric.metaPos
        },
        getWindowZoom() {
            return this.common.winZoom
        },
        isRadioModeShortcutEnable() {
            return this.navigation.radioModeShortcut
        },
        isModulesSettingShortcutEnable() {
            return this.navigation.modulesSettingShortcut
        },
        isThemesShortcutEnable() {
            return this.navigation.themesShortcut
        },
        isUserHomeShortcutEnable() {
            return this.navigation.userHomeShortcut
        },
        isSimpleLayoutShortcutEnable() {
            return this.navigation.simpleLayoutShortcut
        },
        filterActiveModulesPlatforms() {
            return (platforms, scope) => {
                if (!platforms || platforms.length < 1) return []
                const offPlatforms = this.modules.off[scope]//
                return platforms.filter(item => (!offPlatforms || !offPlatforms.includes(item.code || item)))
            }
        },
        isHideToTrayOnMinimized() {
            return this.tray.showOnMinimized
        },
        currentTheme() {
            return this.getCurrentTheme()
        },
        isResumePlayAfterVideoEnable() {
            return this.track.resumePlayAfterVideo
        },
        isUseOnlineCoverEnable() {
            return this.track.useOnlineCover
        },
        isUseDeeplyScanForDirectoryEnable() {
            return this.track.useDeeplyScanForDirectory
        },
        isUseDndForCreateLocalPlaylistEnable() {
            return this.track.useDndForCreateLocalPlaylist
        }
        ,
        isUseDndForAddLocalTracksEnable() {
            return this.track.useDndForAddLocalTracks
        },
        isPlaybackQueueAutoPositionOnShow() {
            return this.track.playbackQueueAutoPositionOnShow
        }
    },
    actions: {
        setThemeIndex(index, type) {
            this.theme.index = index || 0
            this.theme.type = type || 0
        },
        setLayoutIndex(index) {
            this.layout.index = index || 0
            const currentIndex = this.layout.index
            if (currentIndex < 1) this.layout.fallbackIndex = currentIndex
            //EventBus.emit("app-layout")
        },
        switchToFallbackLayout() {
            this.setLayoutIndex(this.layout.fallbackIndex)
            this.setupWindowZoom()
        },
        presetThemes() {
            const { getPresetThemes } = useThemeStore()
            return getPresetThemes()
        },
        getCurrentTheme() {//获取当前样式css主题
            const { getTheme } = useThemeStore()
            const { type, index } = this.theme
            return getTheme(type, index)
        },
        isCurrentTheme(theme) {
            if (!theme || !theme.id) return false
            const current = this.getCurrentTheme()
            return current.id === theme.id
        },
        setupFontFamily() {
            EventBus.emit('setting-fontFamily', this.common.fontFamily)
        },
        setupFontWeight() {
            const weight = this.common.fontWeight || 400
            EventBus.emit('setting-fontWeight', weight)
        },
        allFontSizeLevels() {
            return FONTSIZE_LEVELS.slice(1)
        },
        currentFontSizeLevel() {
            return this.common.fontSizeLevel
        },
        currentFontSize() {
            return this.common.fontSize
        },
        setupWindowZoom(noResize) {//noResize 无意义
            const zoom = this.common.winZoom
            if (ipcRenderer) ipcRenderer.send("app-zoom", { zoom, noResize })
            EventBus.emit("app-zoom", zoom)
        },
        setWindowZoom(value) {//缩放比例
            if (!value) return
            const zoom = Number(value || 85)
            if (zoom < 50 || zoom > 300) return//控制缩放大小
            if (this.common.winZoom == zoom) return//如果跟之前一样
            this.common.winZoom = zoom
            this.setupWindowZoom()
        },
        getStateRefreshFrequency() {
            return this.track.stateRefreshFrequency
        },
    }
})
