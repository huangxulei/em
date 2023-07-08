import { defineStore } from 'pinia';
import { QQ } from '../../vendor/qq';
import { NetEase } from '../../vendor/netease';
import { KuWo } from '../../vendor/kuwo';
import { KuGou } from '../../vendor/kugou';
import { DouBan } from '../../vendor/douban';
import { RadioCN } from '../../vendor/radiocn';
import { Qingting } from '../../vendor/qingting';
import { LocalMusic } from '../../vendor/localmusic';
import { Ximalaya } from '../../vendor/ximalaya';
import { FreeFM } from '../../vendor/freefm';

//weight权重，范围：1 - 10
const T_TYPES = [{
    code: 'songs',
    name: '歌曲',
    weight: 5
}, {
    code: 'playlists',
    name: '歌单',
    weight: 8,    //包括歌单电台
}, {
    code: 'albums',
    name: '专辑',
    weight: 3
}, {
    code: 'artists',
    name: '歌手',
    weight: 5
}, {
    code: 'fmRadios',
    name: '广播电台',
    weight: 3
}, {
    code: 'anchorRadios',
    name: '主播电台',
    weight: 3
}]

const randomMusicTypes = T_TYPES.slice(1)
randomMusicTypes.splice(1, 2)

//音乐平台
const ALL_PLATFORMS = [
    {
        code: 'all',
        name: '全部平台',
        shortName: 'ALL',
        online: null,
        types: null
    },
    {
        code: QQ.CODE,
        name: 'QQ音乐',
        shortName: 'QQ',
        online: true,
        types: ['playlists', 'artists', 'albums'],
        weight: 8
    },
    {
        code: NetEase.CODE,
        name: '网易云音乐',
        shortName: 'WY',
        online: true,
        types: ['playlists', 'artists', 'albums', 'anchorRadios'],
        weight: 8
    },
    {
        code: KuWo.CODE,
        name: '酷我音乐',
        shortName: 'KW',
        online: true,
        types: ['playlists', 'artists', 'albums'],
        weight: 8
    },
    {
        code: KuGou.CODE,
        name: '酷狗音乐',
        shortName: 'KG',
        online: true,
        types: ['playlists', 'artists', 'albums'],
        weight: 8
    },
    {
        code: DouBan.CODE,
        name: '豆瓣FM',
        shortName: 'DB',
        online: true,
        types: ['playlists', 'artists', 'albums'],
        weight: 5
    },
    {
        code: LocalMusic.CODE,
        name: '本地歌曲',
        shortName: 'LO',
        online: false,
        types: null
    },
    {
        code: RadioCN.CODE,
        name: '央广云听',
        shortName: 'YT',
        online: true,
        types: ['fmRadios', 'anchorRadios'],
        weight: 5
    },
    {
        code: Qingting.CODE,
        name: '蜻蜓FM',
        shortName: 'QT',
        online: true,
        types: ['anchorRadios'],
        weight: 5
    },
    {
        code: Ximalaya.CODE,
        name: '喜马拉雅FM',
        shortName: 'XMLY',
        online: true,
        types: ['fmRadios'],
        weight: 5
    },
    {
        code: FreeFM.CODE,
        name: '自由FM',
        shortName: 'FREE',
        online: true,
        types: ['fmRadios'],
        weight: 5
    }
]