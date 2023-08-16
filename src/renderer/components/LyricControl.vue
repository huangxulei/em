<script setup>
import { watch, ref, onMounted, inject, onUnmounted, nextTick, onUpdated, computed } from 'vue';
import { storeToRefs } from 'pinia';
import EventBus from '../../common/EventBus';
import { Track } from '../../common/Track';
import { toMMssSSS, toMmss, toMillis } from '../../common/Times';
import ArtistControl from './ArtistControl.vue';
import AlbumControl from './AlbumControl.vue';
import { usePlayStore } from '../store/playStore';
import { useAppCommonStore } from '../store/appCommonStore';
import { useSettingStore } from '../store/settingStore';
import { PLAY_STATE } from '../../common/Constants';
import { smoothScroll } from '../../common/Utils';

const { lyric } = storeToRefs(useSettingStore())
const { playingViewShow } = storeToRefs(useAppCommonStore())
const { toggleLyricTrans, toggleLyricRoma, getStateRefreshFrequency } = useSettingStore()

const props = defineProps({
    track: Object, //Track
    currentTime: Number
})
const { loadLyric, seekTrack, playState } = inject('player')
//当前索引
const currentIndex = ref(-1)
const setLyricCurrentIndex = (value) => currentIndex.value = value
//数据
const lyricData = ref(Track.lyricData(props.track))
const setLyricData = (value) => lyricData.value = value
//时间滞后
let presetOffset = Track.lyricOffset(props.track)
const setPresetOffset = (value) => presetOffset = value

//播放到指定歌词行，即通过歌词调整歌曲进度
const scrollLocatorTime = ref(0)
const setScrollLocatorTime = (value) => scrollLocatorTime.value = value
const scrollLocatorTimeText = ref('00:00')
const setScrollLocatorTimeText = (value) => scrollLocatorTimeText.value = value
const scrollLocatorCurrentIndex = ref(-1)
const setScrollLocatorCurrentIndex = (value) => scrollLocatorCurrentIndex.value = value
//用户鼠标滚轮
const isUserMouseWheel = ref(false)
let userMouseWheelCancelTimer = null
const setUserMouseWheel = (value) => isUserMouseWheel.value = value

const isSeeking = ref(false)
const setSeeking = (value) => isSeeking.value = value
//歌词状态 
//-1 加载中 0 无 1有
const lyricExistState = ref(-1)
const setLyricExistState = (value) => lyricExistState.value = value
const isLyricReady = () => lyricExistState.value == 1

const isHeaderVisible = () => (lyric.value.metaPos == 0)

const updateScrollLocatorTime = () => {
    const locatorEl = document.querySelector('.lyric-ctl .scroll-locator')
    if (!locatorEl) return
    const lyricEl = document.querySelector('.lyric-ctl .center')
    if (!lyricEl) return
    const x = lyricEl.offsetLeft + 88
    const y = locatorEl.offsetTop
    const pointEl = document.elementFromPoint(x, y)
    if (!pointEl) return
    const timekey = pointEl.getAttribute('timeKey')
    if (!timekey) return
    //Time
    setScrollLocatorTime(timekey)
    setScrollLocatorTimeText(timekey.split('.')[0])
    const index = pointEl.getAttribute('index')
    setScrollLocatorCurrentIndex(index)
}

const onUserMouseWheel = (e) => {
    setUserMouseWheel(true)
    if (userMouseWheelCancelTimer) clearTimeout(userMouseWheelCancelTimer)
    userMouseWheelCancelTimer = setTimeout(() => {
        setUserMouseWheel(false)
    }, 2888)
    updateScrollLocatorTime()
}

//重新加载歌词
const reloadLyricData = (track) => {
    let isExist = false
    if (Track.hasLyric(track)) { //确认是否存在有效歌词
        const lyricData = track.lyric.data
        let isValidLyric = true
        if (lyricData.size <= 6) {
            const linesIter = lyricData.values()
            let line = linesIter.next()
            while (!line.done) {
                const lineText = line.value
                isValidLyric = !(lineText.includes('纯音乐')
                    || lineText.includes('没有填词')
                    || lineText.includes('没有歌词'))
                if (!isValidLyric) break
                line = linesIter.next()
            }
        }
        isExist = isValidLyric
    }
    //重置数据
    resetLyricState(track, isExist ? 1 : 0)
    //重新设置样式
    nextTick(() => {
        safeRenderAndScrollLyric(props.currentTime, true)
    })
}

EventBus.on('track-lyricLoaded', reloadLyricData)
EventBus.on('track-noLyric', reloadLyricData)
EventBus.on('lyric-userMouseWheel', onUserMouseWheel)

const setLyricLineStyle = (line) => {
    const { fontSize, hlFontSize, fontWeight, lineHeight, lineSpacing } = lyric.value

    const textEl = line.querySelector('.text')

    if (!textEl || !textEl.style) return

    textEl.style.lineHeight = `${lineHeight}px`
    textEl.style.marginTop = `${lineSpacing}px`

    if (line.classList.contains('current')) { //高亮行
        line.style.fontSize = hlFontSize + "px"
        line.style.fontWeight = 'bold'
    } else { //普通行
        line.style.fontSize = fontSize + "px"
        line.style.fontWeight = fontWeight
    }
}

const setupLyricLines = () => {
    const lines = document.querySelectorAll(".lyric-ctl .center .line")
    if (lines) lines.forEach(line => setLyricLineStyle(line))
}

const renderAndScrollLyric = (secs) => {//渲染滚动
    if (!isLyricReady()) return
    if (isSeeking.value) return
    const userOffset = lyric.value.offset
    const trackTime = Math.max(0, (secs * 1000 + presetOffset + userOffset))
    //Highlight
    const lyricWrap = document.querySelector(".lyric-ctl .center")
    if (!lyricWrap) return
    const lines = lyricWrap.querySelectorAll('.line')
    let index = -1
    for (var i = 0; i < lines.length; i++) {
        const timeKey = lines[i].getAttribute('timeKey')
        const lineTime = toMillis(timeKey)
        if (trackTime >= lineTime) {
            index = i
        } else if (trackTime < lineTime) {
            break
        }
    }
    nextTick(setupLyricLines)
    if (index >= 0) {
        setLyricCurrentIndex(index)
    } else {
        index = 0
    }

    //是否为用户手动滚动歌词
    if (isUserMouseWheel.value || isSeeking.value) return

    ////算法3：播放页垂直居中，依赖offsetParent定位；与算法2相似，只是参考系不同而已 ////
    //基本保证：准确定位，当前高亮行在播放页垂直居中，且基本与ScrollLocator平行
    //绝对意义上来说，并不垂直居中，也并不平行，因为歌词行自身有一定高度
    if (!lines[index] || !lines[index].offsetTop) return
    const { offsetTop } = lyricWrap
    const { clientHeight } = document.documentElement
    const destScrollTop = lines[index].offsetTop - (clientHeight / 2 - offsetTop)
    //暂时随意设置时间值300左右吧，懒得再计算相邻两句歌词之间的时间间隔了，感觉不是很必要
    const frequency = getStateRefreshFrequency()
    const duration = 300 * frequency / 60
    smoothScroll(lyricWrap, destScrollTop, duration, 5, () => {
        return (isUserMouseWheel.value || isSeeking.value)
    })
}

const safeRenderAndScrollLyric = (secs) => {
    try {
        renderAndScrollLyric(secs)
    } catch (error) {
        console.log(error)
    }
}


const resetLyricState = (track, state) => {
    state = state >= -1 ? state : -1
    //重置状态 state 未赋值 state = -1 
    setLyricExistState(state)
    //装数据 
    setLyricData(Track.lyricData(track))
    setPresetOffset(Track.lyricOffset(track))
    //初始化状态
    setLyricCurrentIndex(-1)
    setSeeking(false)
}

//根据播放时间去运行
watch(() => props.currentTime, (nv, ov) => {
    //TODO 暂时简单处理，播放页隐藏时直接返回
    if (!playingViewShow.value) return
    safeRenderAndScrollLyric(nv)
}, { immediate: true })


//获取 载入歌词 给track 添加歌词
watch(() => props.track, (nv, ov) => {
    if (!nv) return
    resetLyricState(nv)
    loadLyric(nv)
}, { immediate: true })


</script>
<template>
    <div class="lyric-ctl" @contextmenu="toggleLyricToolbar">
        <div class="header" v-show="isHeaderVisible()">
            <div class="audio-title">
                <span v-html="track.title"></span>
            </div>
            <div class="audio-artist spacing">
                <b>歌手:</b>
                <span>
                    <ArtistControl :visitable="true" :platform="track.platform"
                        :data="track.artist" class="ar-ctl"></ArtistControl>
                </span>
            </div>
            <div class="audio-album spacing">
                <b>专辑:</b>
                <span>
                    <AlbumControl :visitable="true" :platform="track.platform" :data="track.album" class="al-ctl">
                    </AlbumControl>
                </span>
            </div>
        </div>
        <div class="center" ref="lyricWrapRef">
            <div v-show="lyricExistState == -1" class="no-lyric">
                <label>歌词加载中，请先欣赏音乐吧~</label>
            </div>
            <div v-show="lyricExistState == 0" class="no-lyric">
                <label>暂无歌词，请继续欣赏音乐吧~</label>
            </div>
            <div v-show="lyricExistState == 1" v-for="([key, value], index) in lyricData"
                class="line" :timeKey="key"
                :index="index" :class="{
                    first: index == 0,
                    last: index == (lyricData.size - 1),
                    'content-text-highlight': index == currentIndex,
                    current: index == currentIndex,
                    locatorCurrent: (index == scrollLocatorCurrentIndex && index != currentIndex && isUserMouseWheel)
                }">
                <div class="text" :timeKey="key" :index="index" v-html="value"></div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.lyric-ctl {
    display: flex;
    flex-direction: column;
    text-align: left;
}

.lyric-ctl .spacing {
    margin-top: 10px;
}

.lyric-ctl .header {
    max-height: 202px;
}

.lyric-ctl .header b {
    margin-right: 3px;
    min-width: 43px;
}

.lyric-ctl .mv {
    margin-right: 5px;
}

.lyric-ctl .mv svg {
    fill: var(--button-icon-btn-color);
    cursor: pointer;
}

.lyric-ctl .mv:hover svg {
    fill: var(--content-highlight-color);
}

.lyric-ctl .audio-title {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;

    font-size: 28px;
    font-size: var(--content-text-module-title-size);
    font-weight: bold;
    margin-bottom: 6px;

    word-wrap: break-word;
}

.lyric-ctl .audio-artist,
.lyric-ctl .audio-album {
    /*font-size: 18px;*/
    font-weight: bold;
    color: var(--content-subtitle-text-color);
    display: flex;
}

.lyric-ctl .audio-artist .ar-ctl,
.lyric-ctl .audio-album .al-ctl {
    -webkit-line-clamp: 1;
}

.lyric-ctl .center {
    position: relative;
    height: 399px;
    overflow: auto;
    margin-top: 15px;
    padding-right: 6px;
    padding-bottom: 15px;
    -webkit-mask-image: linear-gradient(transparent 0%, #fff 20%, #fff 80%, transparent 100%);
    mask-image: linear-gradient(transparent 0%, #fff 20%, #fff 80%, transparent 100%);
}

.lyric-ctl .lyric-content {
    overflow: scroll;
}

.lyric-ctl .center::-webkit-scrollbar,
.lyric-ctl .lyric-content::-webkit-scrollbar {
    display: none;
}

.lyric-ctl .center .line {
    font-size: 22px;
    line-height: 28px;
    margin-top: 28px;
    color: var(--content-subtitle-text-color);
    word-break: break-word;
    /*word-wrap: break-word;*/
}

.lyric-ctl .center .current {
    font-size: 22px;
    font-weight: bold !important;
}

/*TODO 窗口大小变化后，无法自适应 */
.lyric-ctl .center .first {
    /*margin-top: 168px !important;*/
    margin-top: 258px !important;
}

.lyric-ctl .center .last {
    /*margin-bottom: 233px !important;*/
    margin-bottom: 366px !important;
}

.lyric-ctl .no-lyric {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-size: 23px;
    font-weight: bold !important;
    color: var(--text-lyric-color);
}

.lyric-ctl .center .line .extra-text {
    /*margin-top: 3px;*/
    color: var(--content-subtitle-text-color) !important;
}

.lyric-ctl .center .current .extra-text {
    /*margin-top: 3px;*/
    color: var(--content-text-color) !important;
}

.lyric-ctl .scroll-locator {
    position: fixed;
    right: 80px;
    top: 50%;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.lyric-ctl .center .locatorCurrent,
.lyric-ctl .center .locatorCurrent .text,
.lyric-ctl .center .locatorCurrent .extra-text {
    color: var(--content-text-color) !important;
    font-weight: bold !important;
}

.lyric-ctl .scroll-locator .time-text {
    font-size: 13px;
    font-weight: 500;
}

/*
.lyric-ctl .scroll-locator .time-text::before {
    content: '';
    display: inline-block;
    width: 366px;
    height: 1px;
    margin-right: 10px;
    margin-bottom: 3px;
    border-bottom: 1px dashed var(--content-text-highlight-color);
}
*/

.lyric-ctl .scroll-locator .play-btn {
    /*margin-top: 16px;*/
    border-radius: 10rem;
    width: 18px;
    height: 18px;
    background: var(--button-icon-text-btn-bg-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 5px;
}

.lyric-ctl .scroll-locator .play-btn:hover {
    background: var(--button-icon-text-btn-hover-bg-color);
}

.lyric-ctl .scroll-locator .play-btn svg {
    margin-left: 1px;
    fill: var(--button-icon-text-btn-icon-color) !important;
}


.lyric-ctl .extra-btn {
    position: fixed;
    right: 35px;
    bottom: 99px;
}

.lyric-ctl .extra-btn span {
    border: 1.25px solid var(--content-subtitle-text-color);
    border-radius: 3px;
    padding: 1px 2px;
    font-size: var(--content-text-tip-text-size);
    font-size: var(--content-text-size);
    cursor: pointer;
    color: var(--content-subtitle-text-color);
    font-weight: bold;
}

.lyric-ctl .extra-btn .active,
.lyric-ctl .extra-btn span:hover {
    background: var(--content-text-highlight-color);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    border-color: var(--content-highlight-color);
}
</style>