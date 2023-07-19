import { defineStore } from 'pinia'
import EventBus from '../../common/EventBus'
import { useIpcRenderer, useIpcRenderer } from '../../common/Utils'
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
            EventBus.emit("app-layout")
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
        setupWindowZoom(noResize) {
            const zoom = this.common.winZoom
            if (ipcRenderer) ipcRenderer.send("app-zoom", { zoom, noResize })
            EventBus.emit("app-zoom", zoom)
        },
        isHideToTrayOnMinimized() {
            return this.tray.showOnMinimized
        },
    }
})
