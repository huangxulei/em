<script setup>
import { onMounted, ref, inject } from 'vue'
import { storeToRefs } from 'pinia'
import PlayMeta from '../components/PlayMeta.vue'
import { useAppCommonStore } from '../store/appCommonStore';
import { usePlayStore } from '../store/playStore'

const { seekTrack, preseekTrack, progressState,
    favoritedState, toggleFavoritedState, isTrackSeekable } = inject('player')
const volumeBarRef = ref(null)
const { volume, playing } = storeToRefs(usePlayStore())

onMounted(() => {
    if (volumeBarRef) volumeBarRef.value.setVolume(volume.value)
})
</script>
<template>
    <div class="classic-main-bottom">
        <SliderBar :value="progressState" :disable="!isTrackSeekable" :onSeek="seekTrack">
        </SliderBar>
        <div id="play-nav">
            <PlayMeta id="play-meta"></PlayMeta>
        </div>
    </div>
</template>
<style>
.classic-main-bottom,
#play-nav {
    display: flex;
}

.classic-main-bottom {
    flex-direction: column;
    height: var(--others-playnav-height);
    -webkit-app-region: none;
    padding-top: 8px;
}

.classic-main-bottom .spacing {
    margin-left: 18px;
}

.classic-main-bottom #play-nav #play-meta {
    width: 34.33%;
}

.classic-main-bottom #play-nav {
    padding-left: 28px;
}

.classic-main-bottom #play-nav #play-meta .cover-wrap,
.classic-main-bottom #play-nav #play-meta .audio-cover,
.classic-main-bottom #play-nav #play-meta .cover-mask {
    width: 45px;
    height: 45px;
    border-radius: 3px;
}

.classic-main-bottom #play-nav #play-meta .title-wrap {
    padding-bottom: 7px;
}

.classic-main-bottom #play-nav .play-ctl-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0px 15px;
}

.classic-main-bottom #play-nav .right {
    width: 33.33%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    padding-right: 36px;
}

.classic-main-bottom svg {
    fill: var(--button-icon-btn-color);
    cursor: pointer;
}

.classic-main-bottom svg:hover,
.classic-main-bottom .active svg {
    fill: var(--content-highlight-color);
}

.classic-main-bottom .volume-bar {
    width: 21px;
    /* margin-left: 3px; */
}

.classic-main-bottom .volume-bar:hover {
    width: 100px;
}

.classic-main-bottom .love-btn {
    fill: var(--content-highlight-color) !important;
}
</style>