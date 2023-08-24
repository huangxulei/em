<script>
//定义名称，方便用于<keep-alive>
export default {
    name: 'BatchActionView'
}
</script>

<script setup>
import { storeToRefs } from 'pinia';
import { inject, ref, onMounted, reactive, shallowRef, watch } from 'vue';
import EventBus from '../../common/EventBus';
import Mousetrap from 'mousetrap';
import { useAppCommonStore } from '../store/appCommonStore';
import { usePlatformStore } from '../store/platformStore';
import { usePlayStore } from '../store/playStore';
import { useSettingStore } from '../store/settingStore';
import { useLocalMusicStore } from '../store/localMusicStore';
import AlbumListControl from '../components/AlbumListControl.vue';
import PlaylistsControl from '../components/playlistscontrol.vue'
import SongListControl from '../components/SongListControl.vue';
import { useIpcRenderer } from '../../common/Utils';
import { toYyyymmddHhMmSs } from '../../common/Times';

const props = defineProps({
    source: String, //数据源，所属功能/模块
    id: String //记录ID
})
const { currentRoutePath, backward } = inject('appRoute')
const ipcRenderer = useIpcRenderer()

const title = ref("")
const subtitle = ref("")
const activeTab = ref(0)
const tabTipText = ref("")
const currentTabView = shallowRef(null)
const tabData = reactive([])

//TODO
const actionShowCtl = reactive({
    playBtn: false,
    addToBtn: false,
    moveToBtn: false,
    addToQueueBtn: false,
    deleteBtn: true,
    exportBtn: false
})
</script>
<template>
    <div id="batch-action-view">
        <div class="header">
            <div class="title-wrap">批量操作
                <div class="title">
                    <span class="subtitle" v-html="subtitle"></span>{{ title }}
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped></style>