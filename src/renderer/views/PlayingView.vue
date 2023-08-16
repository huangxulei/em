<script setup>
import { onMounted, ref, watch, inject, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import EventBus from '../../common/EventBus';
import { usePlayStore } from '../store/playStore';
import { useAppCommonStore } from '../store/appCommonStore';
import { useSettingStore } from '../store/settingStore';
import ArtistControl from '../components/ArtistControl.vue';
import LyricControl from '../components/LyricControl.vue';
import WinTrafficLightBtn from '../components/WinTrafficLightBtn.vue';
import { useUseCustomTrafficLight } from '../../common/Utils';
import { Track } from '../../common/Track';

const { seekTrack, progressState, mmssCurrentTime,
    currentTimeState, preseekTrack, mmssPreseekTime, isTrackSeekable } = inject('player')
//是否使用自定义交通灯控件
const useCustomTrafficLight = useUseCustomTrafficLight()
const { playingViewShow } = storeToRefs(useAppCommonStore())
const { hidePlayingView, minimize, showToast, switchPlayingViewTheme,
    toggleSoundEffectView } = useAppCommonStore()
const { currentTrack, playingIndex, volume, playing } = storeToRefs(usePlayStore())
const { getWindowZoom, lyricMetaPos } = storeToRefs(useSettingStore())

const volumeBarRef = ref(null)
const onUserMouseWheel = (e) => EventBus.emit('lyric-userMouseWheel', e)
</script>
<template>
    <div class="playing-view">
        <div class="container">
            <div class="header">
                <div class="win-ctl-wrap">
                    <WinTrafficLightBtn v-show="useCustomTrafficLight" :showCollapseBtn="true"
                        :collapseAction="hidePlayingView">
                    </WinTrafficLightBtn>
                </div>
                <div class="meta-wrap" v-show="(lyricMetaPos == 2)">
                    <div class="meta">
                        <div class="audio-title" v-html="currentTrack.title"></div>
                        <div v-show="Track.hasArtist(currentTrack)">&nbsp;-&nbsp;</div>
                        <div class="audio-artist spacing">
                            <ArtistControl :visitable="true" :platform="currentTrack.platform" :data="currentTrack.artist" :trackId="currentTrack.id" class="ar-ctl">
                            </ArtistControl>
                        </div>
                    </div>
                </div>
            </div>
            <div class="center">
                <div class="cover">
                    <img v-lazy="currentTrack.cover" />
                </div>
                <div class="lyric-wrap">
                    <LyricControl :track="currentTrack" :currentTime="currentTimeState">
                    </LyricControl>
                </div>
            </div>
            <div class="bottom">
                <SliderBar :value="progressState" :disable="!isTrackSeekable" :onSeek="seekTrack"
                    :onScroll="preseekTrack" :onScrollFinish="seekTrack" :onDragRelease="seekTrack"
                    :onDragMove="preseekTrack">
                </SliderBar>
            </div>
        </div>
    </div>
</template>
<style scoped>
.playing-view {
    display: flex;
    /*flex-direction: column;*/
    overflow: hidden;
    --others-sliderbar-ctl-height: 3px;
}

.playing-view .spacing {
    margin-left: 20px;
}

.playing-view .container {
    display: flex;
    flex: 1;
    flex-direction: column;
    background: var(--content-bg-color);
    background: var(--content-bg-color-no-transparent);
}

.playing-view .header {
    height: 56px;
    display: flex;
    -webkit-app-region: drag;
}

.playing-view .header svg {
    -webkit-app-region: none;
}

.playing-view .header .win-ctl-wrap {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-left: var(--others-win-ctl-margin-left);
}

.playing-view .meta-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
}

.playing-view .meta {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex: 1;
    width: 61.8%;
}

.playing-view .meta-wrap .audio-title,
.playing-view .meta-wrap .audio-artist {
    font-weight: bold;
    color: var(--content-subtitle-text-color);
    text-align: left;

    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    align-items: center;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
}

.playing-view .meta-wrap .audio-title {
    word-break: break-all;
}

.playing-view .meta-wrap .audio-artist {
    -webkit-app-region: none;
}

.playing-view .mv {
    margin-right: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.playing-view svg {
    fill: var(--button-icon-btn-color);
    cursor: pointer;
}

.playing-view .header svg:hover,
.playing-view .theme svg:hover,
.playing-view .equalizer svg:hover,
.playing-view .active svg,
.playing-view .collapse-btn:hover svg {
    fill: var(--content-highlight-color);
    cursor: pointer;
}

.playing-view .center {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0px 60px;
}

.playing-view .center .cover,
.playing-view .center .lyric-wrap {
    /* 偶尔有少数歌曲，歌词太长，会强行挤占左边Cover空间*/
    flex: 1;
    max-width: 50%;
}

.playing-view .center .cover {
    margin-right: 41px;
    margin-bottom: 0px;
    display: flex;
    justify-content: flex-end;
}

.playing-view .center .cover img {
    width: 356px;
    height: 356px;
    border: 6px solid #292929;
    border-radius: 3px;
    background-size: cover;
}

.playing-view .center .lyric-wrap {
    margin-left: 41px;
}

.playing-view .bottom {
    height: 77px;
    padding-bottom: 5px;
}

.playing-view .bottom .action {
    display: flex;
    justify-content: center;
    align-items: center;
}

.playing-view .bottom .action>div {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.playing-view .bottom .action .btm-left svg {
    fill: var(--button-icon-btn-color);
    cursor: pointer;
}

.playing-view .bottom .action .btm-left svg:hover {
    fill: var(--content-highlight-color);
}

.playing-view .bottom .action .love-btn {
    fill: var(--content-highlight-color) !important;
}
</style>