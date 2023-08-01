<script setup>
import { onMounted, ref, inject } from 'vue'
import { storeToRefs } from 'pinia'
import PlayMeta from '../components/PlayMeta.vue'
import { usePlayStore } from '../store/playStore'

const { seekTrack, progressState } = inject('player')
const volumeBarRef = ref(null)
const { volume } = storeToRefs(usePlayStore())

onMounted(() => {
    if (volumeBarRef) volumeBarRef.value.setVolume(volume.value)
})
</script>
<template>
    <div class="classic-main-bottom">
        <SliderBar :value="progressState" :onSeek="seekTrack">
        </SliderBar>
        <div id="play-nav">
            <PlayMeta id="play-meta"></PlayMeta>
            <div class="play-ctl-wrap">
                <PlayControl></PlayControl>
            </div>
            <div class="right">
                <div class="volume-wrap">
                    <VolumeBar ref="volumeBarRef"></VolumeBar>
                </div>
                <div class="equalizer spacing">
                    <svg width="17" height="17" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                        <g id="Layer_2" data-name="Layer 2">
                            <g id="Layer_1-2" data-name="Layer 1">
                                <path
                                    d="M863,1024c-3.34-.88-6.71-1.64-10-2.65-21.36-6.56-33.6-24.24-33.73-49.32-.17-30.82,0-61.64,0-92.46q0-109.46.11-218.91c0-4.23-1.43-5.81-5.23-7.35C757.73,630.46,725,588.87,718,528.43c-8.14-70.43,31.49-134,97.49-158.23,4-1.48,3.72-3.88,3.72-6.86q0-154.18.09-308.37a76.68,76.68,0,0,1,2.37-20.23c5.3-19,18.44-29.82,37.58-33.68C860.53.81,861.76.36,863,0h15a28.56,28.56,0,0,0,3.22,1c19.39,3.76,32.69,14.64,37.89,33.91,1.87,6.95,2.34,14.47,2.35,21.73q.21,152.91,0,305.83c0,4.8,1.56,6.75,5.91,8.47,47.71,18.85,78.4,53.1,91.65,102.69,2.3,8.62,3.37,17.56,5,26.36v24a31.82,31.82,0,0,0-1,3.79c-7.64,60.3-39.34,102.26-95.7,125.25-4.31,1.76-5.92,3.69-5.91,8.49q.22,152.91.09,305.82a99,99,0,0,1-.64,13.46c-2.74,19.87-13,33.85-32.45,40.29-3.42,1.13-7,1.94-10.44,2.9Zm7.18-460.81c30.89.09,51.55-20.44,51.56-51.22,0-30.55-20.46-51-51.12-51.16-30.83-.14-51.58,20.47-51.56,51.21C819.07,542.56,839.6,563.1,870.18,563.19Z" />
                                <path
                                    d="M161,0c3.19.82,6.41,1.52,9.56,2.47,21.83,6.58,34.06,24.31,34.2,50,.14,27.49,0,55,0,82.49q0,216-.13,432c0,5,1.45,7,6.05,8.85,56,22.86,88.39,64.45,95.23,124.47,8.08,70.8-30.68,132.83-97.44,158.36-3.18,1.22-3.78,2.84-3.77,5.84.08,35.17.19,70.34-.07,105.5A74.81,74.81,0,0,1,202,990.18c-5.4,18.61-18.54,29-37.24,32.76-1.26.26-2.49.7-3.73,1.06H146c-1.23-.37-2.45-.83-3.7-1.09-19.33-4-32.45-15-37.59-34.28a79.26,79.26,0,0,1-2.17-19.76q-.3-51.71,0-103.41c0-3.88-1-5.71-4.81-7.22C47.53,838.6,16.07,802.53,3.72,750,2.1,743.09,1.22,736,0,729V705a34.55,34.55,0,0,0,.92-3.84c7.54-60.34,39.28-102.3,95.61-125.32,4.69-1.92,6-4,6-8.91q-.21-244.14-.09-488.29c0-11.66-.14-23.34.65-35C104.46,24,117.66,8.11,136.48,2.51,139.62,1.58,142.82.83,146,0Zm-7.44,665.6c-30.65,0-51.11,20.36-51.3,51s20.57,51.44,51.38,51.46c30.53,0,51.24-20.58,51.29-51C205,686.17,184.4,665.57,153.56,665.6Z" />
                                <path
                                    d="M519,0c3.21.78,6.46,1.43,9.63,2.35,20.59,6,34.06,23.53,34.25,45.8.31,36.66.13,73.33.16,110,0,1.82,0,3.64,0,4.06,13.11,7.06,26.18,12.53,37.5,20.48,45.38,31.92,67.36,76.5,64.39,131.56-3.52,65.4-37.16,110.51-98.14,134.83-3.44,1.37-3.79,3.3-3.79,6.35q.07,139.24,0,278.47c0,78.82.09,157.64-.16,236.47a71.08,71.08,0,0,1-3.59,23c-6,17-19,26.35-36.52,29.64-1.27.23-2.51.67-3.77,1H505c-3.36-.83-6.77-1.53-10.08-2.52-20.31-6-33.68-23.6-33.81-45.63-.27-45.66-.15-91.33-.15-137q0-191.48.08-383c0-3.81-.79-5.73-4.79-7.18-61.56-22.31-101.76-83.08-97.42-148.45,4.36-65.6,37.51-110.79,98.73-135.06,3.41-1.35,3.42-3.33,3.42-6.07,0-36.83-.13-73.66.12-110.49.1-14.25,5.13-26.71,16-36.39C484,6.1,492.19,2.68,501.21,1,502.5.79,503.74.35,505,0Zm-7.23,358.4c30.69.18,51.22-20.08,51.41-50.73.19-30.8-20-51.48-50.45-51.73-31-.25-51.72,20-51.92,50.77C460.62,337.73,480.82,358.23,511.77,358.4Z" />
                            </g>
                        </g>
                    </svg>
                </div>
            </div>
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