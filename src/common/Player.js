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
        const player = Player.get()
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
            }
        })
    }

    notify(event, args) {
        EventBus.emit(event, args)
        return this
    }

    notifyStateChanged(state) {
        this.playState = state
        this.notify('track-state', this.playState)
    }


}

