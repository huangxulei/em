<script setup>
import { watch, ref, onMounted } from 'vue';
const props = defineProps({
    value: Number, //0.0 - 1.0
    disable: Boolean,
    disableScroll: Boolean,
    disableOptimize: Boolean,
    onSeek: Function,
    onScroll: Function,
    onScrollFinish: Function,
    onDragStart: Function,
    onDragMove: Function,
    onDragRelease: Function
})

const sliderCtlRef = ref(null)
const progressRef = ref(null)
const thumbRef = ref(null)
let onDrag = ref(false)
let value = parseFloat(props.value).toFixed(2)

const updateProgress = (percent) => {
    percent = percent * 100
    percent = percent > 0 ? percent : 0
    percent = percent < 100 ? percent : 100
    progressRef.value.style.width = percent + "%"
    thumbRef.value.style.left = percent + "%"
    value = (percent / 100).toFixed(2)
}

watch(() => props.value, (nv, ov) => {
    updateProgress(nv, ov)
})

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