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
import { useAppCommonStore } from './store/appCommonStore';
import { usePlatformStore } from './store/platformStore'
import { useSettingStore } from './store/settingStore';

const ipcRenderer = useIpcRenderer()
const { currentTrack, queueTracksSize, playingIndex, playing } = storeToRefs(usePlayStore())
const { playTrack, playNextTrack, setAutoPlaying, playPrevTrack, togglePlay,
    switchPlayMode, toggleVolumeMute, updateVolumeByOffset, setPlaying, resetQueue, addTracks,
    addTrack, playTrackDirectly, isCurrentTrack, isPlaying } = usePlayStore()
const { getVendor, isLocalMusic } = usePlatformStore()
const { playingViewShow, videoPlayingViewShow, playingViewThemeIndex } = storeToRefs(useAppCommonStore())
const { togglePlaybackQueueView, toggleVideoPlayingView, showFailToast } = useAppCommonStore()

const playState = ref(PLAY_STATE.NONE)
const setPlayState = (value) => playState.value = value

//播放进度
const mmssCurrentTime = ref('00:00')
const mmssPreseekTime = ref(null) //格式: 00:00
const currentTimeState = ref(0) //单位: 秒
const progressState = ref(0)

const resetPlayState = (ignore) => {
    currentTimeState.value = 0
    mmssCurrentTime.value = '00:00'
    mmssPreseekTime.value = null
    progressState.value = 0
    if (!ignore) setPlayState(PLAY_STATE.NONE)
}

//播放进度
const seekTrack = (percent) => {
    //清除预备状态
    mmssPreseekTime.value = null

    if (isPlaying()) {
        seekTrackDirectly(percent)
    } else { //非播放状态
        markTrackSeekPending(percent)
        //播放歌曲
        if (playState.value == PLAY_STATE.PAUSE) {
            togglePlay()
        } else {
            playTrackDirectly(currentTrack.value)
        }
    }
    //setTimeout(() => seekTrackDirectly(percent), delay)
}

const seekTrackDirectly = (percent) => EventBus.emit('track-seek', percent)
const markTrackSeekPending = (percent) => EventBus.emit('track-markSeekPending', percent)

/* EventBus事件 */

// EventBus.on('track-play', track => {
//     traceRecentTrack(track)
// })

EventBus.on('track-state', state => {
    setPlayState(state)
    switch (state) {
        case PLAY_STATE.INIT:
            resetPlayState(true)
            break
        case PLAY_STATE.PLAYING:
            setPlayState(true)
            break
        case PLAY_STATE.PAUSE:
            setPlaying(false)
            break
        case PLAY_STATE.END:
            playNextTrack()
            break
        default:
            break
    }
})
//普通歌曲
EventBus.on('track-changed', track => {
    bootstrapTrack(track).then(track => {
        if (isCurrentTrack(track)) {
            playTrackDirectly(track)
        }
    })
})

const updateLyric = (track, { lyric, roma, trans }) => {
    if (track || Lyric.hasData(lyric)) Object.assign(track, { lyric })
    if (track || Lyric.hasData(roma)) Object.assign(track, { lyricRoma: roma })
    if (track || Lyric.hasData(trans)) Object.assign(track, { lyricTrans: trans })
    EventBus.emit('track-lyricLoaded', track)
}

//获取和设置歌曲播放信息
const bootstrapTrack = (track) => {
    return new Promise(async (resolve, reject) => {
        if (!track) {
            reject('none')
            return
        }
        const { id, platform } = track
        //平台服务
        const vendor = getVendor(platform)
        if (!vendor || !vendor.playDetail) {
            reject('noService')
            return
        }
        //获取歌曲信息
        const result = await vendor.playDetail(id, track)
        const { lyric, cover, artist, url } = result
        if (Track.hasUrl(result)) Object.assign(track, { url })
        //无法获取到有效url
        if (!Track.hasUrl(track)) { //VIP收费歌曲或其他
            reject('noUrl')
            return
        }
        setAutoPlaying(false)
        //设置歌词
        if (Track.hasLyric(result) && !Track.isCandidate(track)) updateLyric(track, { lyric })
        //设置封面
        if (Track.hasCover(result)) Object.assign(track, { cover })
        resolve(track)
    })
}
/* 播放歌单 */
const playPlaylist = async (playlist, text, traceId) => {
    try {
        doPlayPlaylist(playlist, text, traceId)
    } catch (error) {
        console.log(error)
        if (traceId && !isCurrentTraceId(traceId)) return
        showFailToast('网络异常！请稍候重试')
        return
    }
}

//播放歌单
const doPlayPlaylist = async (playlist, text, traceId) => {
    if (traceId && !isCurrentTraceId(traceId)) return
}

provide('player', {
    seekTrack, playPlaylist, playAlbum, playMv, addAndPlayTracks, loadLyric,
    mmssCurrentTime,
})

</script>
<template></template>
<style scoped></style>