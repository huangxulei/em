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
import { United } from '../vendor/united';

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
const { togglePlaybackQueueView, toggleVideoPlayingView, showFailToast, isCurrentTraceId, showToast } = useAppCommonStore()
const { theme, layout, isStoreRecentPlay, isSimpleLayout, isVipTransferEnable,
    isResumePlayAfterVideoEnable } = storeToRefs(useSettingStore())
const { getCurrentThemeHighlightColor, setupStateRefreshFrequency,
    setupSpectrumRefreshFrequency, setupTray } = useSettingStore()

const playState = ref(PLAY_STATE.NONE)
const setPlayState = (value) => playState.value = value

//播放进度
const mmssCurrentTime = ref('00:00')
const mmssPreseekTime = ref(null) //格式: 00:00
const currentTimeState = ref(0) //单位: 秒
const progressState = ref(0)

//处理不可播放歌曲
const AUTO_PLAY_NEXT_MSG = '当前歌曲无法播放<br>即将为您播放下一曲'
const NO_NEXT_MSG = '当前歌曲无法播放<br>列表无其他可播放歌曲'
const OVERTRY_MSG = '尝试播放次数太多<br>请手动播放其他歌曲吧'
const TRY_TRANSFRER_MSG = '当前歌曲无法播放<br>即将尝试切换其他版本'
const TRANSFRER_OK_MSG = '版本切换已完成<br>即将为您播放歌曲'
const TRANSFRER_FAIL_MSG = '没有其他版本切换<br>即将为您播放下一曲'

//连跳计数器
let autoSkipCnt = 0
//重置连跳计数
const resetAutoSkip = () => autoSkipCnt = 0

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
}

const seekTrackDirectly = (percent) => EventBus.emit('track-seek', percent)
const markTrackSeekPending = (percent) => EventBus.emit('track-markSeekPending', percent)

/* EventBus事件 */

// EventBus.on('track-play', track => {
//     traceRecentTrack(track)
// })

const setupCurrentMediaSession = async () => {
    if ("mediaSession" in navigator) {
        const track = currentTrack.value
        if (!track) return
        const { title, cover } = track
        //TODO 本地歌曲可能使用在线封面，会导致数据不一致
        // 暂时忽略，仍然使用旧封面，不去尝试进行更新，得不偿失
        let coverSrc = cover
        if (cover && cover.startsWith(IMAGE_PROTOCAL.prefix)) {
            if (ipcRenderer) coverSrc = await ipcRenderer.invoke('open-image-base64', cover)
        }
        navigator.mediaSession.metadata = new MediaMetadata({
            title,
            artist: Track.artistName(track),
            album: Track.albumName(track),
            artwork: [{
                src: coverSrc || 'default_cover.png',
                sizes: "500x500",
                type: "image/png",
            }]
        })

        navigator.mediaSession.setActionHandler("previoustrack", playPrevTrack)
        navigator.mediaSession.setActionHandler("nexttrack", playNextTrack)
    }
}

EventBus.on('track-state', state => {

    //播放刚开始时，更新MediaSession
    if (playState.value == PLAY_STATE.INIT && state == PLAY_STATE.PLAYING) {
        //setupCurrentMediaSession()//播放时候处理图片
        resetAutoSkip()
    }
    setPlayState(state)
    switch (state) {
        case PLAY_STATE.INIT:
            resetPlayState(true)
            break
        case PLAY_STATE.PLAYING:
            setPlaying(true)
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


//提示并播放下一曲
const toastAndPlayNext = (track, msg) => {
    //前提条件：必须是当前歌曲
    if (isCurrentTrack(track)) {
        showFailToast(msg || AUTO_PLAY_NEXT_MSG, () => {
            if (isCurrentTrack(track)) playNextTrack()
        })
    }
}

//用户手动干预，即主动点击上/下一曲时，产生体验上的Bug
//目前实现方式已稍作处理
const handleUnplayableTrack = (track, msg) => {
    const queueSize = queueTracksSize.value
    const isPlaylistRadio = Playlist.isNormalRadioType(track)
    if (isPlaylistRadio) { //普通歌单电台
        toastAndPlayNext(track, msg)
        return
    } else if (autoSkipCnt >= queueSize) { //非电台歌曲，且没有下一曲
        resetPlayState()
        resetAutoSkip()
        showFailToast(NO_NEXT_MSG)
        return
    }
    //普通歌曲
    //频繁切换下一曲，体验不好，对音乐平台也不友好
    if (autoSkipCnt < 9) {
        ++autoSkipCnt
        toastAndPlayNext(track, msg)
        return
    }
    resetPlayState()
    //10连跳啦，暂停一下吧
    resetAutoSkip()
    showFailToast(OVERTRY_MSG)
}

//接收播放器错误通知，重试播放
const onPlayerErrorRetry = ({ retry, track, currentTime }) => {
    if (!retry) { //超出最大重试次数
        handleUnplayableTrack(track)
    } else if (track) {
        //TODO 暂时重头开始播放
        EventBus.emit('track-changed', track)
    }
}

EventBus.on('track-error', onPlayerErrorRetry)

//普通歌曲
EventBus.on('track-changed', track => {
    bootstrapTrack(track).then(track => {
        if (isCurrentTrack(track)) {
            playTrackDirectly(track)
        }
    }, async (reason) => {
        if (reason == 'noUrl') {
            if (!isVipTransferEnable.value || isLocalMusic(track.platform)) {
                handleUnplayableTrack(track)
                return
            }
            showFailToast(TRY_TRANSFRER_MSG)
            const candidate = await United.transferTrack(track)
            if (!Track.hasUrl(candidate)) {
                handleUnplayableTrack(track, TRANSFRER_FAIL_MSG)
                return
            }
            if (!isCurrentTrack(track)) return
            if (isDevEnv()) console.log(candidate)
            const { url, lyric, lyricTrans, lyricRoma, duration, isCandidate } = candidate
            Object.assign(track, { url, lyric, lyricTrans, lyricRoma, duration, isCandidate })
            showToast(TRANSFRER_OK_MSG, () => {
                if (isCurrentTrack(track)) {
                    // loadLyric(track)
                    playTrackDirectly(track)
                }
            })
        }
    })
})

EventBus.on('track-pos', secs => {
    const track = currentTrack.value
    const currentTime = secs * 1000
    mmssCurrentTime.value = toMmss(currentTime)
    currentTimeState.value = secs
    const duration = track ? track.duration : 0
    progressState.value = duration > 0 ? (currentTime / duration) : 0
})

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
    const { id, platform } = playlist
    if (Playlist.isFMRadioType(playlist)) { //FM广播电台
        showToast(text || '即将为您收听电台')
        const track = playlist.data[0]
        playTrack(track)
        return
    } else if (Playlist.isNormalRadioType(playlist)) { //歌单电台
        //提示前置，避免因网络卡顿导致用户多次请求
        showToast(text || '即将为您播放电台')
        // playNextPlaylistRadioTrack(platform, id, traceId)
        return
    } else if (Playlist.isNormalType(playlist)
        || Playlist.isAnchorRadioType(playlist)) {
        let maxRetry = 3, retry = 0
        while (!playlist.data || playlist.data.length < 1) {
            if (traceId && !isCurrentTraceId(traceId)) return
            if (++retry > maxRetry) return
            //重试一次加载数据
            const vendor = getVendor(platform)
            if (!vendor || !vendor.playlistDetail) return
            playlist = await vendor.playlistDetail(id, 0, 1000, 1)
        }
    }
    if (!playlist.data || playlist.data.length < 1) {
        const failMsg = Playlist.isCustomType(playlist) ? '歌单里还没有歌曲'
            : '网络异常！请稍候重试'
        if (traceId && !isCurrentTraceId(traceId)) return
        showFailToast(failMsg)
        return
    }
    addAndPlayTracks(playlist.data, true, text || '即将为您播放歌单', traceId)
}

//添加到播放列表，并开始播放
const addAndPlayTracks = (tracks, needReset, text, traceId) => {
    if (traceId && !isCurrentTraceId(traceId)) return
    if (needReset) resetQueue()
    showToast(text || "即将为您播放全部！")
    addTracks(tracks)
    playNextTrack()
}

//播放进度，更新预备状态
const preseekTrack = (percent) => {
    const track = currentTrack.value
    if (!track) return
    const duration = track ? track.duration : 0
    if (duration <= 0) return
    mmssPreseekTime.value = toMmss(duration * percent)
}

/* 歌词获取 */
const loadLyric = (track) => {
    if (!track) {
        if (isCurrentTrack(track)) EventBus.emit('track-noLyric', track)
        return
    }
    if (!isCurrentTrack(track)) return
    if (Track.hasLyric(track)) {
        if (isCurrentTrack(track)) EventBus.emit('track-lyricLoaded', track)
        return
    }
    //检查有效性
    const platform = track.platform
    const vendor = getVendor(platform)
    if (!vendor || !vendor.lyric
        || Playlist.isAnchorRadioType(track)) {
        if (isCurrentTrack(track)) EventBus.emit('track-noLyric', track)
        return
    }
    //获取歌词
    vendor.lyric(track.id, track).then(result => {
        //再次确认，可能歌曲已经被切走
        if (isCurrentTrack(track)) updateLyric(track, result)
    })
}

const updateLyric = (track, { lyric }) => {
    if (track || Lyric.hasData(lyric)) Object.assign(track, { lyric })
    EventBus.emit('track-lyricLoaded', track)
}

//应用启动时，恢复歌曲信息
const restoreTrack = () => {
    bootstrapTrack(currentTrack.value, true).then(track => {
        EventBus.emit("track-restore", track)
    }).catch(error => {
        if (error) console.log(error)
    })
}

onMounted(() => {
    restoreTrack()
})

provide('player', {
    seekTrack, playPlaylist, addAndPlayTracks, loadLyric,
    mmssCurrentTime, currentTimeState, progressState, playState,
    preseekTrack, mmssPreseekTime,
})

</script>
<template>
    <slot></slot>
</template>
<style scoped></style>