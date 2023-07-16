<script setup>
//歌曲时间显示
const props = defineProps({
    current: String,//当前播放时间
    duration: String//最大时长
})
</script>
<template>
    <div class="audio-time">
        <span class="t-current"> {{ current }}</span>
        <span class="t-sp">/</span>
        <div class="t-duration">{{ duration }}</div>
    </div>
</template>
<style scoped>
.audio-time span {
    vertical-align: middle;
    text-align: left;
}

.audio-time .t-sp {
    text-align: center;
    padding-left: 3px;
    padding-right: 3px;
}
</style>