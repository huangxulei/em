<script setup>
import { onMounted, ref, watch } from 'vue';
const barRef = ref(null)
const barValueRef = ref(null)

const props = defineProps({
    value: Number,
    seekable: Boolean,
    onseek: Function
})

const seek = (e) => {
    if (!props.seekable) return
    const offsetX = e.offsetX
    const offsetWidth = barRef.value.offsetWidth
    const percent = (offsetX / offsetWidth).toFixed(3)
    updateProgress(percent)
    if (props.onseek) props.onseek(percent)
}

const updateProgress = (percent) => {
    percent = percent * 100
    barValueRef.value.style.width = percent + "%"
}

watch(() => props.value, (nv, ov) => {
    updateProgress(nv, ov)
})

onMounted(() => updateProgress(props.value))

defineExpose({ updateProgress })
</script>

<template>
    <div class="progressbar" ref="barRef" @click.stop="seek">
        <div class="progress" ref="barValueRef"></div>
    </div>
</template>
<style scoped>
.progressbar {
    height: var(--others-progressbar-height);
    border-radius: 10rem;
    background: var(--others-progressbar-bg-color);
    -webkit-app-region: none;
}

.progressbar .progress {
    width: 0%;
    height: 100%;
    border-radius: 10rem;
    background: var(--content-text-highlight-color);
}

.handcur {
    cursor: pointer;
}
</style>