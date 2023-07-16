<script setup>
import { inject } from 'vue'
import PlayMeta from '../components/PlayMeta.vue';


</script>
<template>
    <div class="default-main-top">
        <div id="play-nav">
            <PlayMeta id="play-meta"></PlayMeta>
            <div class="play-ctl-wrap">
                <PlayControl></PlayControl>
            </div>
        </div>
    </div>
</template>
<style>
.default-main-top,
#play-nav {
    display: flex;
}

.default-main-top {
    flex-direction: column;
    height: var(--others-playnav-height);
    -webkit-app-region: drag;
    --others-sliderbar-ctl-height: 3px;
}

.default-main-top #play-nav #play-meta {
    width: 34.33%;
}
</style>