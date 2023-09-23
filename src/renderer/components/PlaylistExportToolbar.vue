<script setup>
import { ref } from 'vue'
import { useAppCommonStore } from '../store/appCommonStore'
import { useIpcRenderer, isWinOS } from '../../common/Utils';
import { storeToRefs } from 'pinia';

const ipcRenderer = useIpcRenderer()

const { playlistExportContextItem } = storeToRefs(useAppCommonStore())
const { showToast, hidePlaylistExportToolbar } = useAppCommonStore()

</script>

<template>
    <div class="playlist-export-toolbar">
        <div class="container" :class="{ 'container-win-style': isWinOS() }">
            <div class="header">
                <div class="action left-action">
                    <div class="close-btn btn" @click="hidePlaylistExportToolbar">
                        <svg width="12" height="12" viewBox="0 0 593.14 593.11" data-name="Layer 1"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M900.38,540.1c-4.44-4.19-8-7.42-11.45-10.83Q783.57,424,678.2,318.63c-13.72-13.69-18.55-29.58-11.75-47.85,10.7-28.71,47.17-36.54,69.58-14.95,18.13,17.45,35.68,35.49,53.47,53.28Q872.75,392.36,956,475.63a47.69,47.69,0,0,1,3.41,4.38c2.07-2,3.5-3.27,4.86-4.63Q1073,366.69,1181.63,258c12.79-12.8,27.71-17.69,45.11-12.36,28.47,8.73,39,43.63,20.49,67a88.49,88.49,0,0,1-6.77,7.34q-107.62,107.65-215.28,215.28c-1.41,1.41-2.94,2.7-4.94,4.53,1.77,1.82,3.2,3.32,4.66,4.79q108.7,108.71,217.39,217.42c15.1,15.11,18.44,35.26,8.88,52.5a42.4,42.4,0,0,1-66.64,10.22c-16.41-15.63-32.17-31.93-48.2-48L963.82,604.19c-1.16-1.16-2.38-2.24-3.83-3.6-1.59,1.52-3,2.84-4.41,4.23Q846.86,713.51,738.15,822.22c-14.56,14.56-33.07,18.24-50.26,10.12a42.61,42.61,0,0,1-14-66.31c1.74-2,3.65-3.89,5.53-5.78Q787.21,652.43,895,544.63C896.44,543.23,898.06,542.06,900.38,540.1Z"
                                transform="translate(-663.4 -243.46)" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.playlist-export-toolbar {
    display: flex;
    /*flex-direction: column;*/
    overflow: hidden;
    border-radius: 15px;
    -webkit-app-region: none;
}

.playlist-export-toolbar .container {
    display: flex;
    flex: 1;
    flex-direction: column;
}

.playlist-export-toolbar .spacing {
    margin-left: 15px;
}

.playlist-export-toolbar .header,
.playlist-export-toolbar .center,
.playlist-export-toolbar .header .title-wrap,
.playlist-export-toolbar .center .bands {
    display: flex;
    flex-direction: row;
}

.playlist-export-toolbar .header {
    padding: 10px 18px 10px 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--content-header-nav-bg-color);
    border-bottom: 1px solid var(--border-color);
}

.playlist-export-toolbar .header .action {
    display: flex;
    /*justify-content: center;
    align-items: center;*/
}

.playlist-export-toolbar .header .left-action svg {
    fill: var(--button-icon-btn-color);
    cursor: pointer;
}
</style>