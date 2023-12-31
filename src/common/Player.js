import { Howl, Howler } from 'howler';
import { PLAY_STATE } from '../common/Constants';
import EventBus from '../common/EventBus';
import { Track } from './Track';

let singleton = null

export class Player {
    constructor(track) {
        this.currentTrack = track
        this.sound = null
        this.playState = PLAY_STATE.NONE
        this.currentTime = 0
        this.retry = 0
        this.webAudioApi = null
        this.pendingSoundEffectType = 0 // 0 =>均衡器， 1 => 混响
        this.pendingSoundEffect = null
        this.animationFrameId = 0
        this.seekPendingMark = 0 //percent
        this.animationFrameCnt = 0 //动画帧数计数器，控制事件触发频率，降低CPU占用
        this.stateRefreshFrequency = 60 //歌曲进度更新频度
        this.spectrumRefreshFrequency = 3 //歌曲频谱更新频度
    }
    static get() {
        if (!singleton) singleton = new Player()
        return singleton
    }

    static initAndSetup() {
        const player = Player.get()//初始化
        return player.on('track-play', track => player.playTrack(track))
            .on('track-restore', track => player.restore(track))
            .on('track-changed', () => player.setCurrent(null))
            .on('track-togglePlay', () => player.togglePlay())
            .on('track-seek', percent => player.seek(percent))
            .on('volume-set', volume => player.volume(volume))
            .on('radio-play', () => player.setCurrent(null))
            .on('playbackQueue-empty', () => player.setCurrent(null))
            .on('track-updateEQ', values => player.updateEQ(values))
            .on('track-updateIR', source => player.updateIR(source))
            .on('track-stateRefreshFrequency', value => player.stateRefreshFrequency = value)
            .on('track-spectrumRefreshFrequency', value => player.spectrumRefreshFrequency = value)
            .on('track-markSeekPending', value => player.seekPendingMark = value)
    }

    _isTrackAvailable() {
        return Track.hasUrl(this.currentTrack)
    }

    createSound() {
        if (!this._isTrackAvailable()) return null
        var self = this
        this.sound = new Howl({
            src: [this.currentTrack.url],
            html5: true,
            autoplay: false,
            preload: false,
            pool: 1,
            onplay: function () {
                self.retry = 0
                self.notifyStateChanged(PLAY_STATE.PLAYING)
                self._rewindAnimationFrame(self._step.bind(self))
            },
            onpause: function () {
                self._stopAnimationFrame()
                self.notifyStateChanged(PLAY_STATE.PAUSE)
            },
            onend: function () {
                self.notifyStateChanged(PLAY_STATE.END)
            },
            onseek: function () {
                //重置动画帧
                self._rewindAnimationFrame(self._step.bind(self))
            },
            onloaderror: function () {
                self._retryPlay(1)
            },
            onplayerror: function () {
                self._retryPlay(1)
            }
        })
        this._tryUnlockHowlAudios()
        this.currentTime = 0
        this.notifyStateChanged(PLAY_STATE.INIT)
        return this.sound
    }

    getSound() {
        return this._isTrackAvailable() ? this.sound : null
    }

    play() {
        const sound = this.getSound()
        if (sound) sound.play()
    }

    pause() {
        const sound = this.getSound()
        if (sound) sound.pause()
    }

    togglePlay() {
        console.log(this.currentTrack)
        const sound = this.getSound()
        if (!sound) {
            this._retryPlay(1)
            return
        }
        if (sound.playing()) {
            sound.pause()
        } else {
            sound.play()
        }
    }

    stop() {
        const sound = this.getSound()
        if (sound) {
            sound.stop()
            sound.unload()
        }
    }

    setCurrent(track) {
        this.stop()
        this.currentTrack = track
        this.createSound()
    }

    playTrack(track) {
        this.setCurrent(track)
        this.play()
    }

    restore(track) {
        this.setCurrent(track)
    }

    volume(value) {
        Howler.volume(value)
    }

    seek(percent) {
        const sound = this.getSound()
        if (!sound || !sound.playing()) return
        const duration = sound.duration()
        if (duration) {
            sound.seek(Math.min(duration * percent, duration))
        }
    }

    _step() {
        const sound = this.getSound()
        if (!sound) return
        if (!sound.playing() && this.playState != PLAY_STATE.PLAYING) {
            this._stopAnimationFrame()
            return
        }
        this.currentTime = sound.seek() || 0
        if (this.isStateRefreshEnabled()) this.notify('track-pos', this.currentTime)
        this._countAnimationFrame()
        //循环动画
        this._rewindAnimationFrame(this._step.bind(this), true)
    }

    on(event, handler) {
        EventBus.on(event, handler)
        return this
    }

    _tryUnlockHowlAudios() {
        const audios = Howler._html5AudioPool
        // Unlock CORS
        if (audios) audios.forEach(audio => audio.crossOrigin = 'anonymous')
    }

    _notifyError(isRetry) {
        const { currentTrack: track, currentTime } = this
        this.notify('track-error', { retry: isRetry, track, currentTime })
    }

    _retryPlay(maxRetry) {
        const isRetry = this.retry < maxRetry
        this._notifyError(isRetry)
        if (isRetry) {
            ++this.retry
        } else {
            this.retry = 0
        }
    }

    notify(event, args) {
        EventBus.emit(event, args)
        return this
    }

    notifyStateChanged(state) {
        this.playState = state
        this.notify('track-state', this.playState)
    }

    _countAnimationFrame() {
        const max = this.stateRefreshFrequency || 1024
        this.animationFrameCnt = (this.animationFrameCnt + 1) % max
    }

    isStateRefreshEnabled() {
        return this.animationFrameCnt % this.stateRefreshFrequency == 0
    }

    _stopAnimationFrame(noReset) {
        if (this.animationFrameId > 0) cancelAnimationFrame(this.animationFrameId)
        if (!noReset) this.animationFrameCnt = 0
    }

    _rewindAnimationFrame(callback, noReset) {
        this._stopAnimationFrame(noReset)
        this.animationFrameId = requestAnimationFrame(callback)
    }

}

