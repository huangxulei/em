<script setup>
import { onActivated, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import EventBus from '../../common/EventBus';
import { usePlaylistSquareStore } from '../store/playlistSquareStore';
import PlaylistCategoryBar from '../components/PlaylistCategoryBar.vue';

const { currentPlatformCode, currentCategoryCode } = storeToRefs(usePlaylistSquareStore())
const { currentVender, currentPlatformCategories, putCategories } = usePlaylistSquareStore()
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

const resetCommom = () => {

}

const loadCategories = async () => {
    categories.length = 0
    setLoadingCategories(true)
    setLoadingContent(true)
    let cachedCates = currentPlatformCategories()
    if (!cachedCates) {
        const vender = currentVender()
        if (!vender || !vender.categories) return
        const result = await vender.categories()
        if (!result || result.data.length < 1) return
        cachedCates = result.data
        if (!cachedCates) return
        putCategories(result.platform, cachedCates)
    }
    categories.push(...cachedCates)
    EventBus.emit('playlistCategory-update')
    setLoadingCategories(false)
}

/*-------------- 各种监听 --------------*/
onMounted(() => {
    resetCommom()
    loadCategories()
})


</script>
<template>
    <div class="playlist-square-view" ref="squareContentRef">
        <PlaylistCategoryBar :data="categories" :loading="isLoadingCategories"></PlaylistCategoryBar>
    </div>
</template>
<style scoped>
.playlist-square-view {
    padding: 20px 33px 15px 33px;
    overflow: scroll;
    overflow-x: hidden;
}
</style>