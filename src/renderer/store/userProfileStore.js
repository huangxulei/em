import { defineStore } from "pinia";
import EventBus from "../../common/EventBus";
import { randomTextWithinAlphabetNums, trimArray } from "../../common/Utils";
import { Playlist } from "../../common/Playlist";

const filterByPlatform = (state, platform) => {
    if (!platform || platform.trim() == 'all') {
        return state
    }
    return state.filter(item => (item.platform == platform.trim()))
}

export const useUserProfileStore = defineStore("userProfile", {
    state: () => ({
        user: {
            id: 0,
            nickname: "",
            cover: "",
            about: ""
        },
        favorites: {
            playlists: [],
            albums: [],
            songs: [],
            radios: [],
        },
        customPlaylists: [],
        follows: {
            artists: [],
        },
        recents: {
            playlists: [],
            albums: [],
            songs: [],
            radios: [],
        },
        decoration: {
            current: 1001
        }
    }),
    getters: {
        getUserCover() { //Potrait
            return this.user.cover
        },
        getUserNickName() {
            let nickname = this.user.nickname
            if (nickname && nickname.trim().length > 0) {
                return nickname.trim()
            }
            return "我的主页"
        },
        getUserAbout() {
            let about = this.user.about
            if (about && about.trim().length > 0) {
                return about.trim()
            }
            return "这个人很懒，什么也没留下~"
        },

    },
    actions: {

    }
})