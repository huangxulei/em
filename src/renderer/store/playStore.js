import { defineStore } from 'pinia';
import { PLAY_MODE } from '../../common/Constants';
import EventBus from '../../common/EventBus';
import { Track } from '../../common/Track';
import { toMmss } from '../../common/Times';
import { Playlist } from '../../common/Playlist';

const NO_TRACK = new Track('0', '', '听你想听，爱你所爱',
    [{ id: '0', name: '不枉青春' }],
    { id: '0', name: '山川湖海，日月星辰' },
    0, 'default_cover.png')

export const usePlayStore = defineStore('play', {
    state: () => ({
        playing: false,
        playingIndex: -1,
        playMode: PLAY_MODE.REPEAT_ALL,
        queueTracks: [],
        //单位: ms
        currentTime: 0,
        //0.0 - 1.0
        progress: 0.0,
        //0.0 - 1.0
        volume: 0.5,
        //是否正在自动下一曲
        isAutoPlaying: false
    }),
    getters: {
        track(state) {
            return (index) => (state.queueTracks[index])
        },
        currentTrack(state) {
            if (this.playingIndex < 0) return NO_TRACK
            return this.track(this.playingIndex)
        },
        noTrack() {
            return NO_TRACK
        },
        mmssCurrentTime() {
            return toMmss(this.currentTime)
        },
        queueTracksSize(state) {
            return state.queueTracks.length
        },
        hasLyric(state) {
            const track = state.currentTrack
            if (!track) return false
            const lyric = track.lyric
            if (!lyric) return false
            return lyric.data.size > 0
        }
    },
    actions: {
        findIndex(track) {
            return this.queueTracks.findIndex((item, index) => Track.isEquals(track, item))
        },
        isCurrentTrack(track) {
            return Track.isEquals(this.currentTrack, track)
        },
        isPlaying() {
            return this.playing
        },
        setPlaying(value) {
            this.playing = value
        },
        isDefaultFMRadioType(track) {
            return track && Playlist.isFMRadioType(track) && !track.streamType
        },
        togglePlay() {
            const { currentTrack: track } = this
            //FM广播
            if (this.isDefaultFMRadioType(track)) {
                EventBus.emit('radio-togglePlay')
                return
            }
            //播放列表为空
            if (this.queueTracksSize < 1) return
            //当前歌曲不存在或存在但缺少url
            if (!Track.hasUrl(track) || NO_TRACK == track) {
                this.playNextTrack()
                return
            }
            //当前歌曲正常
            EventBus.emit('track-togglePlay')
        },
        addTrack(track) {
            //TODO 超级列表如何保证时效
            const index = this.findIndex(track)
            if (index == -1) this.queueTracks.push(track)
        },
        addTracks(tracks) {
            //TODO 暂时不去重, 超级列表如何保证时效
            //this.queueTracks.push(...tracks)
            if (tracks.length < 1) return
            tracks.forEach(item => this.addTrack(item));
        },
        resetQueue() {
            this.isAutoPlaying = false
            this.queueTracks.length = 0
            this.playingIndex = -1
            this.__resetPlayState()
        },
        __resetPlayState() {
            this.playing = false
            this.currentTime = 0
            this.progress = 0.0
        },
        //直接播放，其他状态一概不管
        playTrackDirectly(track) {
            this.__resetPlayState()
            let playEventName = 'track-play'
            if (!Track.hasUrl(track)) {   //普通歌曲
                console.log('ptd')
                playEventName = 'track-changed'
            }
            EventBus.emit(playEventName, track)
        },
        //播放，并更新当前播放列表相关状态
        playTrack(track) {
            let index = this.findIndex(track)
            if (index == -1) {
                index = this.playingIndex + 1
                this.queueTracks.splice(index, 0, track)
            }
            this.playingIndex = index
            this.playTrackDirectly(track)
        },
        playPrevTrack() {
            const maxSize = this.queueTracksSize
            if (maxSize < 1) return
            switch (this.playMode) {
                case PLAY_MODE.REPEAT_ALL:
                    --this.playingIndex //先减1 
                    this.playingIndex = this.playingIndex < 0 ? maxSize - 1 : this.playingIndex
                    break
                case PLAY_MODE.REPEAT_ONE:
                    break
                case PLAY_MODE.RANDOM:
                    break
            }
            this.__validPlayingIndex()
            this.playTrackDirectly(this.currentTrack)
        },
        playNextTrack() {
            const maxSize = this.queueTracksSize
            if (maxSize < 1) return
            switch (this.playMode) {
                case PLAY_MODE.REPEAT_ALL:
                    this.playingIndex = ++this.playingIndex % maxSize
                    break
                case PLAY_MODE.REPEAT_ONE:
                    break
                case PLAY_MODE.RANDOM:
                    this.playingIndex = Math.ceil(Math.random() * maxSize)
                    break
            }
            this.__validPlayingIndex()
            this.playTrackDirectly(this.currentTrack)
        },
        __validPlayingIndex() {
            const maxSize = this.queueTracksSize
            this.playingIndex = this.playingIndex > 0 ? this.playingIndex : 0
            this.playingIndex = this.playingIndex < maxSize ? this.playingIndex : (maxSize - 1)
        },
        updateVolume(value) {
            value = parseFloat(value)
            value = value > 0 ? value : 0
            value = value < 1 ? value : 1
            this.volume = value
            EventBus.emit("volume-set", value)
        },
        updateVolumeByOffset(value) {
            value = parseFloat(value)
            this.updateVolume(this.volume + value)
        },
        toggleVolumeMute() {
            this.updateVolume(this.volume > 0 ? 0.0 : 1.0)
        },
        switchPlayMode() {
            this.playMode = ++this.playMode % 3
        },
        setAutoPlaying(value) {
            this.isAutoPlaying = value
        }

    }
})