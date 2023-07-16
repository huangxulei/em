<script setup>
import { onMounted, ref, inject, watch } from 'vue';
import VolumeBar from './VolumeBar.vue'
import AudioTime from './AudioTime.vue'
import { useAppCommonStore } from '../store/appCommonStore';
import { usePlayStore } from '../store/playStore';
import { usePlatformStore } from '../store/platformStore';
import { storeToRefs } from 'pinia';
import { Track } from '../../common/Track';

const { mmssCurrentTime } = inject('player')

const { currentTrack, volume, playing } = storeToRefs(usePlayStore())
const { coverMaskShow } = storeToRefs(useAppCommonStore())
const { showPlayingView, toggleCoverMask } = useAppCommonStore()
const volumeBarRef = ref(null)
//组合歌曲名字和歌手名字
const trackMeta = (track) => {
    let artistName = Track.artistName(track)
    if (artistName.length > 0) artistName = ' - ' + artistName
    return track.title + artistName
}

onMounted(() => {
    //初始化声音 默认0.5
    if (volumeBarRef) volumeBarRef.value.setVolume(volume.value)
})

</script>
<template>
    <div class="play-meta">
        <div class="cover-wrap">
            <img class="audio-cover" v-lazy="currentTrack.cover" />
            <div class="cover-mask" v-show="coverMaskShow" @click="showPlayingView">
                <svg width="19" height="19" viewBox="0 0 763.32 424.57" xmlns="http://www.w3.org/2000/svg">
                    <g id="Layer_2" data-name="Layer 2">
                        <g id="Layer_1-2" data-name="Layer 1">
                            <path
                                d="M380.47,322.11c27.6-27.5,54-53.68,80.23-80Q575,127.75,689.38,13.4C708.7-5.81,735-2.92,750.83,12.91c17,17,16.57,43.39-.9,60.87L414.1,409.61c-19.89,19.89-45,20-64.9.08Q180.9,241.45,12.66,73.15A42.53,42.53,0,1,1,72.85,13Q224.7,164.87,376.48,316.73A46.1,46.1,0,0,1,380.47,322.11Z" />
                        </g>
                    </g>
                </svg>
            </div>
        </div>
        <div class="title-wrap">
            <div class="audio-title-wrap">
                <div class="audio-title" v-html="trackMeta(currentTrack)"></div>
            </div>
            <div class="time-volume-wrap">
                <AudioTime :current="mmssCurrentTime" :duration="Track.mmssDuration(currentTrack)"></AudioTime>
                <VolumeBar class="volume-bar" ref="volumeBarRef"></VolumeBar>
            </div>
        </div>
    </div>
</template>
<style scoped>
.play-meta {
    display: flex;
    height: var(--others-playmeta-height);
    align-items: center;
}

.play-meta .title-wrap {
    width: 211px;
    margin-left: 10px;
}

.play-meta .cover-wrap {
    position: relative;
    width: var(--others-playmeta-height);
    height: var(--others-playmeta-height);
    box-shadow: 0px 0px 1px var(--border-left-nav-border-color);
    border: 0.1px solid var(--border-color);
}

.play-meta .audio-cover,
.play-meta .cover-mask {
    /*width: 100%;*/
    width: var(--others-playmeta-height);
    height: var(--others-playmeta-height);
    cursor: pointer;
    -webkit-user-drag: none;
    -webkit-app-region: no-drag;

    position: absolute;
    top: 0px;
    left: 0px;
    z-index: 1;
}
</style>