<script setup>
import { ref, inject, reactive, onActivated, watch } from 'vue'
import { storeToRefs } from 'pinia';
import EventBus from '../../common/EventBus';
import { useAppCommonStore } from '../store/appCommonStore';
import { usePlatformStore } from '../store/platformStore'
import { usePlayStore } from '../store/playStore';
import { useSettingStore } from '../store/settingStore';
import SongListControl from '../components/SongListControl.vue';
import PlayAddAllBtn from '../components/PlayAddAllBtn.vue';

const { addAndPlayTracks, playPlaylist } = inject('player')

const { showToast } = useAppCommonStore()
const { getVendor } = usePlatformStore()
const { addTracks } = usePlayStore()

const detail = reactive({})
const filteredData = ref(null)
const listSizeText = ref("0")
const playlistDetailRef = ref(null)

let markScrollTop = 0
let offset = 0, page = 1, limit = 1000
const isLoading = ref(true)
const setLoading = (value) => isLoading.value = value
const titleRef = ref(null)
const isTwoLinesTitle = ref(false)
const setTwoLinesTitle = (value) => isTwoLinesTitle.value = value

const props = defineProps({
    platform: String,
    id: String
})

const resetScrollState = () => {
    markScrollTop = 0
    if (playlistDetailRef.value) playlistDetailRef.value.scrollTop = markScrollTop
}

const restoreScrollState = () => {
    if (markScrollTop < 1) return
    if (playlistDetailRef.value) playlistDetailRef.value.scrollTop = markScrollTop

}
//TODO
const trimExtraHtml = (text) => {
    text = (text || '').trim()
    //TODO 暂时不处理html空白格式信息
    return text
}

onActivated(() => {
    restoreScrollState()
    //detectTitleHeight()
})

const loadContent = async (noLoadingMask) => {
    if (!noLoadingMask) setLoading(true)
    const vendor = getVendor(props.platform)
    if (!vendor || !vendor.playlistDetail) return
    let maxRetry = 3, retry = 0, success = false
    do {
        const result = await vendor.playlistDetail(props.id, offset, limit, page)
        if (!result || result.data.length < 1) {
            ++retry
            continue
        }
        if (page > 1) result.data.unshift(...detail.data)
        if (!result.total) detail.total = 0
        Object.assign(detail, result)
        updateListSizeText()
        setLoading(false)
        success = true
        break
    } while (retry > 0 && retry < maxRetry)
    if (!success) { //回退分页信息，并提示
        page = page - 1
        offset = page * limit
        if (offset < detail.total) showToast('网络异常！请稍候重试')
    }
}

const playAll = () => {
    if (filteredData.value) {
        addAndPlayTracks(filteredData.value, true)
    } else {
        playPlaylist(detail)
    }
}

const addAll = (text) => {
    addTracks(filteredData.value || detail.data)
    showToast(text || "歌曲已全部添加！")
}

const updateListSizeText = () => {
    const total = detail.total
    const length = filteredData.value ? filteredData.value.length : detail.data.length
    const text = total > length ? `${length} / ${total}` : length
    listSizeText.value = text
}

const resetView = () => {
    Object.assign(detail, { cover: 'default_cover.png', title: '', about: '', data: [] })
    offset = 0
    page = 1
    detail.total = 0
    updateListSizeText()
}

watch(() => props.id, () => {
    resetView()
    resetScrollState()
    loadContent()
}, { immediate: true })

</script>
<template>
    <div id="playlist-detail-view" ref="playlistDetailRef">
        <div class="header">
            <div>
                <img class="cover" v-lazy="detail.cover" />
            </div>
            <div class="right" v-show="!isLoading">
                <div class="title" v-html="detail.title" ref="titleRef"></div>
                <div class="about" v-html="trimExtraHtml(detail.about)" :class="{ 'short-about': isTwoLinesTitle }"></div>
                <div class="action">
                    <PlayAddAllBtn :leftAction="() => playAll()" :rightAction="() => addAll()" class="btn-spacing">
                    </PlayAddAllBtn>
                </div>
            </div>
        </div>
        <div class="center">
            <div class="list-title">
                <div class="size-text content-text-highlight" v-show="!isLoading">列表({{ listSizeText }})</div>
            </div>
            <SongListControl :data="filteredData || detail.data" :artistVisitable="true" :albumVisitable="true" :loading="isLoading">
            </SongListControl>
        </div>
    </div>
</template>
<style>
#playlist-detail-view {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 20px 33px 10px 33px;
    overflow: scroll;
    overflow-x: hidden;
}

#playlist-detail-view .header {
    display: flex;
    flex-direction: row;
    margin-bottom: 25px;
}

#playlist-detail-view .header .right {
    flex: 1;
    margin-left: 25px;
}

#playlist-detail-view .header .title,
#playlist-detail-view .header .about {
    text-align: left;
    margin-bottom: 10px;
}

#playlist-detail-view .header .title {
    /*font-size: 30px;*/
    font-size: var(--content-text-module-title-size);
    font-weight: bold;
    margin-bottom: 3px;

    overflow: hidden;
    word-wrap: break-all;
    white-space: pre-wrap;
    line-break: anywhere;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}

#playlist-detail-view .header .about {
    height: 139px;
    /*line-height: 23px;*/
    line-height: var(--content-text-line-height);
    font-size: var(--content-text-subtitle-size);
    color: var(--content-subtitle-text-color);
    /* font-size: 15px; */
    overflow: hidden;
    word-wrap: break-word;
    /*white-space: pre-wrap;
    line-break: anywhere;*/
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 5;
}

#playlist-detail-view .header .short-about {
    height: 105px;
    -webkit-line-clamp: 4;
}

#playlist-detail-view .header .cover {
    width: 236px;
    height: 236px;
    border-radius: 6px;
    box-shadow: 0px 0px 1px #161616;
}

#playlist-detail-view .action {
    display: flex;
    flex-direction: row;
}

#playlist-detail-view .btn-spacing {
    margin-right: 20px;
}

#playlist-detail-view .list-title {
    margin-bottom: 10px;
    text-align: left;
    font-size: 16px;
    font-weight: bold;
    display: flex;
    position: relative;
}

#playlist-detail-view .list-title .size-text {
    margin-left: 3px;
}

#playlist-detail-view .checkbox {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: 8px;
    margin-right: 15px;
    cursor: pointer;
}

#playlist-detail-view .search-wrap {
    position: absolute;
    right: -10px;
    display: flex;
    align-items: center;
    font-weight: bold;
}

#playlist-detail-view .search-wrap svg {
    margin-top: 1px;
}
</style>