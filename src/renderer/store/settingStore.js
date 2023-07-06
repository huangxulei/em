import { defineStore } from 'pinia'
import EventBus from '../../common/EventBus'
import { useIpcRenderer, useIpcRenderer } from '../../common/Utils'
import { useThemeStore } from './themeStore'

const useIpcRenderer = useIpcRenderer()

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
    }),
    getters: {

    },
    actions: {
        presetThemes() {
            const { getPresetThemes } = useThemeStore()
            return getPresetThemes()
        },
        getCurrentTheme() {
            const { getTheme } = useThemeStore()
            const { type, index } = this.theme
            return getTheme(type, index)
        },
    }
})
