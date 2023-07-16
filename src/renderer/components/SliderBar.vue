<script setup>
import { watch, ref, onMounted } from 'vue';
const props = defineProps({
    value: Number, //0.0 - 1.0
    disable: Boolean,
    onSeek: Function
})

const sliderCtlRef = ref(null)
const progressRef = ref(null)
const thumbRef = ref(null)
let value = parseFloat(props.value).toFixed(2)

const seekProgress = (event) => {
    //改变ui
    if (thumbRef.value.contains(event.target)) {
        updateProgressByDeltaWidth(event.offsetX)
    } else {
        updateProgressByWidth(event.offsetX)
    }
    if (props.onSeek) props.onSeek(value)//改变实际声音
}

const updateProgress = (percent) => {
    //ui改变
    percent = percent * 100
    percent = percent > 0 ? percent : 0
    percent = percent < 100 ? percent : 100
    progressRef.value.style.width = percent + "%"
    thumbRef.value.style.left = percent + "%"
    value = (percent / 100).toFixed(2)
}

const updateProgressByWidth = (width) => {
    const totalWidth = sliderCtlRef.value.offsetWidth
    let percent = width / totalWidth
    updateProgress(percent)
}

const updateProgressByDeltaWidth = (delta) => {
    if (delta == 0) return
    const totalWidth = sliderCtlRef.value.offsetWidth
    const oPercent = parseFloat(progressRef.value.style.width.replace('%', '')) / 100
    if (isNaN(oPercent)) return
    let oWidth = totalWidth * oPercent
    updateProgressByWidth(oWidth + delta)
}

//快捷操作 改变value 音量 0 1 静音 最大
const toggleProgress = () => {
    updateProgress(value > 0 ? 0 : 1)
    return value
}

watch(() => props.value, (nv, ov) => {
    updateProgress(nv, ov)
})
//初始化 value 0.5
onMounted(() => updateProgress(props.value))

//对外提供API
defineExpose({
    updateProgress,
    toggleProgress
})
</script>
<template>
    <div class="slider-bar">
        <div class="slider-bar-ctl" ref="sliderCtlRef" @click="seekProgress">
            <div class="progress" ref="progressRef"></div>
            <div class="thumb" ref="thumbRef" @mousedown="startDrag"></div>
        </div>
    </div>
</template>
<style scoped>
.slider-bar {
    height: 3px;
    background: transparent;
    -webkit-app-region: none;
}

.slider-bar .slider-bar-ctl {
    height: var(--others-sliderbar-ctl-height);
    border-radius: 10rem;
    background: var(--others-progressbar-bg-color);
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;
}

.slider-bar .progress {
    width: 0%;
    height: 100%;
    border-radius: 10rem;
    background: var(--content-text-highlight-color);
    z-index: 1;
    position: absolute;
}

.slider-bar .thumb {
    width: 10px;
    height: 10px;
    border-radius: 10rem;
    /*background-color: var(--others-volumebar-thumb-color);*/
    background-color: var(--content-highlight-color);
    z-index: 2;
    position: absolute;
    left: 0%;
    -webkit-app-region: none;
    visibility: hidden;
}
</style>