import { defineStore } from 'pinia'
import { usePlatformStore } from './platformStore'

export const usePlaylistSquareStore = defineStore('playlistSquare', {
    state: () => ({
        categoriesMap: new Map(),
        currentCategoryItem: {
            data: { key: '默认', value: '' },
            row: 0,
            col: 0
        }
    }),
    getters: {
        currentPlatformCode(state) {
            const { currentPlatformCode } = usePlatformStore()
            return currentPlatformCode
        },
        currentCategoryCode(state) {
            return state.currentCategoryItem.data.value
        },
    },
    actions: {
        putCategories(key, value) {
            this.categoriesMap.set(key, value)
        },
        putCurrentPlatformCategories(value) {
            this.putCategory(this.currentCategoryCode, value)
        },
        getCategories(key) {
            return this.categoriesMap.get(key)
        },
        currentPlatformCategories() {
            return this.getCategories(this.currentCategoryCode)
        },
        currentVender() {
            const { currentVender } = usePlatformStore()
            return currentVender()
        },
        updateCurrentCategoryItem(data, row, col) {
            this.currentCategoryItem.data = data
            this.currentCategoryItem.row = row
            this.currentCategoryItem.col = col
        },
        resetCurrentCategoryItem() {
            this.updateCurrentCategoryItem({ key: '默认', value: '' }, -1, -1)
        }
    }
})