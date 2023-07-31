<script setup>
import { onActivated, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import EventBus from '../../common/EventBus';
import { usePlaylistSquareStore } from '../store/playlistSquareStore';
import PlaylistCategoryBar from '../components/PlaylistCategoryBar.vue';
import PlaylistsControl from '../components/PlaylistsControl.vue'

const { currentPlatformCode, currentCategoryCode, currentOrder } = storeToRefs(usePlaylistSquareStore())
const { currentVender, currentPlatformCategories, putCategories, putOrders, resetOrder,
    currentPlatformOrders, updateCurrentOrderByValue } = usePlaylistSquareStore()
//TODO 需要梳理优化, 前期缺少设计，现在全是坑
const squareContentRef = ref(null)
//全部分类
const categories = reactive([])
const playlists = reactive([])
const pagination = { offset: 0, limit: 35, page: 1 }

const isLoadingCategories = ref(true)
const isLoadingContent = ref(true)

const setLoadingCategories = (value) => {
    isLoadingCategories.value = value
}

const setLoadingContent = (value) => {
    isLoadingContent.value = value
}

const loadCategories = async () => {
    categories.length = 0
    setLoadingCategories(true)
    setLoadingContent(true)
    let cachedCates = currentPlatformCategories()
    if (!cachedCates) {
        const vendor = currentVender()
        if (!vendor || !vendor.categories) return
        const result = await vendor.categories()
        if (!result || result.data.length < 1) return
        cachedCates = result.data
        if (!cachedCates) return
        putCategories(result.platform, cachedCates)
    }
    categories.push(...cachedCates)
    EventBus.emit('playlistCategory-update')
    setLoadingCategories(false)
}

const resetPagination = () => {
    playlists.length = 0 //清空
    pagination.offset = 0
    pagination.page = 1
}

const resetCommom = () => {
    resetPagination()
}

const refreshData = () => {
    resetCommom()
    loadContent()
}

const loadContent = async (noLoadingMask) => {
    const vendor = currentVender()
    if (!vendor || !vendor.square) return
    if (!noLoadingMask) setLoadingContent(true)
    const cate = currentCategoryCode.value
    const offset = pagination.offset
    const limit = pagination.limit
    const page = pagination.page
    const result = await vendor.square(cate, offset, limit, page)

    if (!result) return
    if (currentPlatformCode.value != result.platform) return
    if (currentCategoryCode.value != result.cate) return
    playlists.push(...result.data)
    setLoadingContent(false)
}


/*-------------- 各种监听 --------------*/
onMounted(() => {
    resetCommom()
    loadCategories()
})

EventBus.on("playlistSquare-refresh", refreshData)

</script>
<template>
    <div class="playlist-square-view" ref="squareContentRef">
        <PlaylistCategoryBar :data="categories" :loading="isLoadingCategories"></PlaylistCategoryBar>
        <PlaylistsControl :data="playlists" :loading="isLoadingContent"></PlaylistsControl>
    </div>
</template>
<style scoped>
.playlist-square-view {
    padding: 20px 33px 15px 33px;
    overflow: scroll;
    overflow-x: hidden;
}
</style>