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
            }
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
        isHideToTrayOnMinimized() {
            return this.tray.showOnMinimized
        },
    }
})
