import { defineStore } from 'pinia'
import { presetThemes, presetCustomThemes } from './themes.json'

export const useThemeStore = defineStore('themes', {
    state: () => ({
        customThemes: []
    }),
    getters: {},
    actions: {
        //从themes.json 里面获取数据
        getTheme(type, index) {
            index = index > 0 ? index : 0
            const allThemes = [presetThemes, this.customThemes]
            return allThemes[type][index]
        },
        getPresetThemes() {
            return presetThemes
        }
    }
})