<script setup>
import { storeToRefs } from 'pinia';
import { inject, provide, onMounted, watch, ref, computed } from 'vue';

import EventBus from '../common/EventBus';
import { Track } from '../common/Track'
import { isDevEnv, useIpcRenderer } from '../common/Utils';
import { PLAY_STATE, TRAY_ACTION, IMAGE_PROTOCAL } from '../common/Constants';
import { Playlist } from '../common/Playlist';
import { toMmss } from '../common/Times';
import { Lyric } from '../common/Lyric';
import { usePlayStore } from './store/playStore'
import { useSettingStore } from './store/settingStore';

const ipcRenderer = useIpcRenderer()
const { currentTrack, queueTracksSize, playingIndex, playing } = storeToRefs(usePlayStore())
const { playTrack } = usePlayStore()


/* EventBus事件 */

EventBus.on('track-play', track => {
    traceRecentTrack(track)
})

</script>
<template></template>
<style scoped></style>