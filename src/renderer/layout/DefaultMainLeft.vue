<script setup>
import { inject, ref } from 'vue';
import { storeToRefs } from 'pinia'
import { usePlatformStore } from '../store/platformStore';
import WinTrafficLightBtn from '../components/WinTrafficLightBtn.vue';
import { useAppCommonStore } from '../store/appCommonStore';
import EventBus from '../../common/EventBus';
import { useUseCustomTrafficLight } from '../../common/Utils';
import path from 'path';
import { useSettingStore } from '../store/settingStore';

const { visitRoute } = inject('appRoute')
const { platforms, currentPlatformIndex, currentPlatformCode } = storeToRefs(usePlatformStore())
const { updateCurrentPlatform, isLocalMusic, isFreeFM } = usePlatformStore()
const { isPlaylistMode, isArtistMode, isRadioMode, isUserHomeMode,
    exploreModeCode } = storeToRefs(useAppCommonStore())
const { nextExploreMode, setPlaylistExploreMode, setRadioExploreMode } = useAppCommonStore()

//是否使用自定义交通灯控件
const useCustomTrafficLight = useUseCustomTrafficLight()

// //TODO
const updatePlatformIndex = (index, isSwitchMode) => {
    updateCurrentPlatform(index)
    const platform = currentPlatformCode.value
    const exploreMode = exploreModeCode.value
    let path = null
    if (isLocalMusic(platform)) {
        path = `/${exploreMode}/${platform}`
    } else if (isUserHomeMode.value && isSwitchMode) {
        path = `/${exploreMode}/${platform}`
    } else if (isPlaylistMode.value || isArtistMode.value || isRadioMode.value) {
        path = `/${exploreMode}/square/${platform}`
    }
    visitRoute(path)
}

const switchExploreMode = () => {
    nextExploreMode()
    updatePlatformIndex(0, true)
}

</script>
<template>
    <div id="main-left">
        <div class="header">
            <WinTrafficLightBtn v-show="useCustomTrafficLight"></WinTrafficLightBtn>
        </div>
        <div class="center">
            <div id="explore-mode">
                <div class="mode-item" v-show="isPlaylistMode" @click="switchExploreMode">
                    <svg width="19" height="19" viewBox="0 -20 895.95 703.92" xmlns="http://www.w3.org/2000/svg">
                        <g id="Layer_2" data-name="Layer 2">
                            <g id="Layer_1-2" data-name="Layer 1">
                                <path
                                    d="M640,424.12v-6.58q0-88.74,0-177.47c.06-28.13,23.63-50.33,51.42-47.73,9.63.9,19.09,4.34,28.48,7.13,46.39,13.79,92.63,28.15,139.14,41.53,33.47,9.63,46.39,45.87,29.44,72.69a47.22,47.22,0,0,1-53,20.5c-31-8.94-61.86-18.42-92.77-27.67-2-.61-4.09-1.17-6.75-1.92V311q0,124.49,0,249a144,144,0,0,1-287.25,13.81C441,495,499,424.34,577.75,416.75,598.8,414.71,619.24,417.27,640,424.12ZM592,608a48,48,0,1,0-48-48A48.07,48.07,0,0,0,592,608Z" />
                                <path
                                    d="M400,96Q224.5,96,49,96C20.9,96-.62,74.16,0,46.47.59,21.86,21,1.09,45.57.05c1.33-.06,2.67,0,4,0H750.48c25.24,0,44.59,16.1,48.86,40.56,4.81,27.6-16.74,54.18-44.92,55.38-2,.08-4,0-6,0Z" />
                                <path
                                    d="M287.78,352q-119.47,0-238.95,0C20.79,352-.7,330,0,302.29.66,277.7,21.13,257,45.75,256c1.17,0,2.34,0,3.5,0q238.71,0,477.42,0c27.85,0,49.4,21.12,49.31,48.2A47.92,47.92,0,0,1,528.74,352c-22,.2-44,0-66,0Z" />
                                <path
                                    d="M191.69,608c-47.82,0-95.65.07-143.47,0A48,48,0,0,1,0,559.19C.31,533.67,21.27,512.47,46.84,512c11.5-.2,23,0,34.49,0q127,0,253.94,0c27.18,0,48.64,21.16,48.71,47.79A48,48,0,0,1,335.65,608Q263.67,608.1,191.69,608Z" />
                            </g>
                        </g>
                    </svg>
                    <span>分类歌单</span>
                </div>
                <div class="mode-item" v-show="isArtistMode" @click="switchExploreMode">
                    <svg width="18" height="17" viewBox="0 0 829.44 853.21" xmlns="http://www.w3.org/2000/svg">
                        <g id="Layer_2" data-name="Layer 2">
                            <g id="Layer_1-2" data-name="Layer 1">
                                <path
                                    d="M452.22,362.51c3.95,1.95,7.81,3.81,11.64,5.74q62.49,31.49,99.13,91.11c12.66,20.52,6.7,46.41-13.52,59-19.86,12.42-45.38,6.11-58.82-13.71-7.54-11.11-15.46-22.28-24.89-31.74C435.33,442.41,398,427.1,354.88,426.63c-36.66-.41-73.33-.2-110-.07-79.48.29-145.22,56.72-157.39,135.27a177.7,177.7,0,0,0-1.64,26.91q-.19,109.5-.09,219c0,21.7-12,38.5-31.05,43.81-28,7.8-54.27-12.63-54.39-42.6-.15-36.67,0-73.34,0-110,0-36.5-.71-73,.14-109.5,2.43-103.61,50-178.92,143-225.31.87-.43,1.71-.93,2.93-1.6C98.45,310.58,78.18,249.84,88.71,180.05c8.19-54.34,34.49-99.12,77.51-133.24,85.75-68,205.87-61.08,283.45,15.27C529.63,140.77,536.33,276.78,452.22,362.51ZM299.31,341.27C369.85,341,427.18,283.54,427,213.18a128,128,0,1,0-256,.54C171.28,284.15,229,341.53,299.31,341.27Z" />
                                <path
                                    d="M655.22,588.85v-6.68q0-145.71,0-291.42c0-23.72,10.19-37.88,32.72-45.62,28-9.62,56-19.36,84-28.92,21.87-7.47,44.05,1.51,53.57,21.49,10.54,22.11-.86,49-24.49,57.64-18.59,6.81-37.17,13.63-55.82,20.23-3.35,1.19-4.6,2.7-4.6,6.36q.15,164,.13,327.92a14.75,14.75,0,0,0,1,5.79c16.25,36.64,8.11,69.07-17.86,97.7-22.07,24.32-50.65,37.47-82.44,43.62-42.92,8.31-84.29,3.54-123-17.53-25.15-13.68-45.3-32.63-54.83-60.35-11.71-34-2.87-64.06,20.89-89.94,22.09-24.07,50.44-37,82-43.54,28.2-5.84,56.28-4.72,84.18,2.22C651.93,588.14,653.21,588.4,655.22,588.85Z" />
                            </g>
                        </g>
                    </svg>
                    <svg width="16" height="16" viewBox="0 0 810 854.54" xmlns="http://www.w3.org/2000/svg">
                        <g id="Layer_2" data-name="Layer 2">
                            <g id="Layer_1-2" data-name="Layer 1">
                                <path
                                    d="M385,0c117.88.3,213.35,96.08,213,213.66-.38,118.12-95.71,213.26-213.49,213.07s-213.49-96.16-213-213.58C172,95,267.43-.3,385,0Zm-.58,341.47c70.36.28,127.94-56.94,128.31-127.5a128,128,0,1,0-256-.64C256.5,283.64,313.83,341.19,384.37,341.47Z" />
                                <path
                                    d="M640.7,682.51v-20q0-74,0-148c0-19.27,8.52-33,25.74-41.6,27.27-13.56,54.42-27.36,81.76-40.78,25.87-12.7,55.2,1.93,61,30.15,3.72,18-5.84,37.41-22.29,45.6-18.92,9.41-37.7,19.1-56.66,28.43-3.37,1.66-4.38,3.6-4.38,7.23q.17,107.74.09,215.48c0,46.09-36,88-81.81,93.46-20.79,2.51-42,3.79-62.43-2.85-38.64-12.58-61.61-39.33-68.54-79.37-.83-4.8.79-10.24,2.08-15.17a97.51,97.51,0,0,1,100-72.67C623.48,682.9,631.8,682.51,640.7,682.51Z" />
                                <path
                                    d="M312.19,512q56.49,0,113,0c21.61,0,38.67,12.73,43.48,32.1,6.92,27.84-13.42,53.25-43,53.34-46.49.15-93,0-139.46,0-25.33,0-50.66-.34-76,.16-65,1.29-119.65,52.93-123.4,117.82-1.79,30.89-.74,61.95-.8,92.94,0,9.06-1.78,17.5-6.67,25.2a42.56,42.56,0,0,1-47,18.26C14.33,847,1,831.09.85,812.66c-.32-32.49-1.95-65.13.39-97.45,6.53-89.82,52.23-152.77,135-188.31,25.72-11,53.08-14.93,81-14.92Z" />
                            </g>
                        </g>
                    </svg>
                    <span>万千歌手</span>
                </div>
                <div class="mode-item" v-show="isRadioMode" @click="switchExploreMode">
                    <svg width="18" height="18" viewBox="0 0 939.22 940.41" xmlns="http://www.w3.org/2000/svg">
                        <g id="Layer_2" data-name="Layer 2">
                            <g id="Layer_1-2" data-name="Layer 1">
                                <path
                                    d="M939.22,475.3c-.9,97-31.58,190.79-93.23,274.28-11,14.94-26,21.46-44.17,17.57-17.94-3.83-29.16-15.54-32.91-33.58-2.65-12.76.67-24.36,8.51-34.79a372.54,372.54,0,0,0,44.34-76.25c24.06-55.71,34.77-113.84,30.76-174.43-7.32-110.58-53.46-202-137.95-273.46C660.59,129,597.94,101.17,528,90.57,439.57,77.16,355.88,92.18,278.55,137c-94.46,54.71-156.23,135.6-181.76,241.82C69.1,494,91.05,600.56,160.19,696.88c14.52,20.23,11.94,42,1.08,55.39-17.84,22-50.46,21.2-67.82-1.74a456.73,456.73,0,0,1-49.39-82C11,597.9-3.13,523.54.58,445.77,9.4,261.1,128.39,97.23,301.09,31.32,363.79,7.39,428.63-3.29,495.52.89Q670.41,11.81,797.09,133.48c70,67.1,113.13,148.84,132.87,243.31C936.29,407,939,437.72,939.22,475.3Z" />
                                <path
                                    d="M469.62,341.83c73-.14,131.64,61.47,127.53,134.23-1.79,31.61-13.84,59.07-35.88,81.92-2.63,2.73-3.35,5-2.4,8.71q40.49,158.88,80.7,317.82c6.34,25.08-7.8,48.55-32.47,54.44-23.71,5.67-47.05-9.34-52.73-34-3.66-15.89-7.33-31.78-10.76-47.72-.62-2.91-1.74-3.72-4.59-3.72q-69.75.12-139.49,0c-3,0-3.85,1.14-4.44,3.88-3.49,16.1-7.16,32.16-10.84,48.22C379.4,926.8,362,940.86,341.38,940.4c-22.11-.5-39.81-14.87-43.33-36.22a48.47,48.47,0,0,1,1.1-19.2q40.07-159.24,80.71-318.33c.95-3.74.11-5.93-2.43-8.7-34-37.1-45.18-80.27-29.43-128.1s50.13-76.5,99.75-86.33a118.4,118.4,0,0,1,12.88-1.65C463.61,341.62,466.62,341.83,469.62,341.83ZM521,768.14,478.31,597.58c-4.38,0-8.41.36-12.34-.09-4.74-.54-6.48,1.21-7.61,5.84-10.73,43.79-21.75,87.5-32.68,131.24-2.76,11.08-5.47,22.18-8.28,33.57ZM426.66,469.63a42.7,42.7,0,0,0,85.4.13c.17-23.46-19.47-43.1-42.89-42.88A42.89,42.89,0,0,0,426.66,469.63Z" />
                                <path
                                    d="M464.77,170.81c147.44.55,270,100.94,297.32,240.39C776.35,484,764.9,553,728.54,617.69c-10.23,18.21-29.86,26.37-49.34,20.88-18.8-5.3-32-23-30.56-42.89a50,50,0,0,1,5.92-19.81c13.67-25,23.17-51.31,26.41-79.59,6.66-58.08-7.16-111-43.06-157.24-36.1-46.54-84-73.64-142.43-81.16C392,244.55,292.93,310,264.53,410.32c-16.5,58.32-9.28,114,20.61,166.81,15,26.51.78,58-28.88,64a42.13,42.13,0,0,1-44.08-19.9c-22.42-38.17-36.09-79.28-39.93-123.43-7-80.53,14.44-152.85,65.09-215.8,46.4-57.68,106.82-92.67,179.56-106.32,6.87-1.29,13.81-2.33,20.76-3C448.27,171.71,458.92,171.2,464.77,170.81Z" />
                            </g>
                        </g>
                    </svg>
                    <span>相约电波</span>
                </div>
                <div class="mode-item excluded-mode-item" v-show="isUserHomeMode" @click="">
                    <svg width="17" height="17" viewBox="0 0 938.47 938.5" xmlns="http://www.w3.org/2000/svg">
                        <g id="Layer_2" data-name="Layer 2">
                            <g id="Layer_1-2" data-name="Layer 1">
                                <path
                                    d="M0,469C.33,209.53,210.36-.32,469.38,0,729.05.32,939.22,210.78,938.47,469.76c-.76,259.7-211.12,469.66-469.63,468.74C208.87,937.57-.33,728.06,0,469Zm453.81,128,.12-.34-1.95-.2c-53.39-5.09-94.44-29.95-122-76.3-14.75-24.84-23-52-27.21-80.35-4.62-31.1-6.87-62.34-.49-93.46,10.07-49.16,36-87.34,80.26-111.88,32.13-17.8,67-23.53,103.32-20.28,46.06,4.12,84.22,23.72,113.49,59.63,24.9,30.54,37.7,66,39.88,105.16,2.3,41.55-2.47,82.21-19,120.79-19.26,44.86-51.57,75.78-98.75,90.18a171.59,171.59,0,0,1-18,4.28c-6,1.14-12.07,1.77-19.36,2.8,2.76.19,4.26.35,5.75.38,39.17.82,78.23,3.08,117,8.94,33.49,5.07,66.42,12.41,97.94,25.1,27.78,11.19,53.28,25.93,73.53,48.57,2.16,2.43,4.24,4.93,6.42,7.46,100.84-141.58,96.84-361.06-57.33-502.35C576.61,46.82,340.65,52.88,196.73,198.77,51.56,345.94,60.23,558.41,153.79,687.36c2.07-2.44,4.06-4.88,6.15-7.22,23.12-25.8,52.64-41.45,84.68-52.86,50.51-18,103.12-24.68,156.28-28C418.51,598.18,436.17,597.7,453.81,596.94Zm15.45,85.56c-55,0-99.89,3.54-143.71,11.75C299.3,699.17,273.61,706,250,719c-13.9,7.67-26.18,17.11-33.23,32-1.83,3.88-1.62,6.33,1.92,9.29,86,71.89,184.71,102.35,296.12,90,74.25-8.24,140.09-37.15,198-84.26,12.85-10.45,12.94-12.24,2.41-25.61-9-11.4-20.9-19-33.75-25.16-25-12-51.65-18.4-78.78-23C558.52,684.74,513.94,682.83,469.26,682.5ZM383.5,389.86c1,11.78,1.58,23.6,3,35.32a178.07,178.07,0,0,0,4.84,24c10.64,39.94,33.24,60,72.16,62.46,39.11,2.43,67.94-13.22,81.51-52.5,9.63-27.85,11.93-56.79,7.84-85.82-3.8-26.92-16.6-49.06-40.58-63.43C495,299.51,476.06,297,456.38,299.32c-31.89,3.81-55.18,19.38-66.8,50.18C384.68,362.46,383.45,376,383.5,389.86Z" />
                            </g>
                        </g>
                    </svg>
                    <span>我的主页</span>
                </div>
            </div>
            <div id="platform-list">
                <ul>
                    <li v-for="(item, index) in platforms()" :class="{ active: (currentPlatformIndex == index) }"
                        @click="updatePlatformIndex(index)" v-html="item.name">
                    </li>
                </ul>
            </div>
        </div>
        <div class="bottom">
            <div id="app-logo">
                <span>L</span>
            </div>
            <div id="app-name">Less Player</div>
        </div>
    </div>
</template>
<style>
#main-left {
    width: 211px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    /*box-shadow: 0px 0px 3px var(--border-left-nav-border-color);*/
    border-right: 1px solid var(--border-left-nav-border-color);
    background: var(--content-left-nav-bg-color);
}

#main-left ::-webkit-scrollbar-thumb {
    background: transparent;
    border: 1px solid transparent;
}

.mousewheelViewpoint ::-webkit-scrollbar-thumb {
    background: var(--others-scrollbar-color) !important;
    border: 1px solid var(--others-scrollbar-color) !important;
}

#main-left .secondary-text {
    /*font-size: 13px;*/
    font-size: var(--content-text-tip-text-size);
    text-align: left;
    color: var(--content-secondary-text-color);
    padding-left: 22%;
    padding-left: 19.5%;
    margin-bottom: 10px;
    font-weight: 520;
}

#main-left .header,
#main-left .center,
#main-left .bottom {
    width: 100%;
}

#main-left .header {
    -webkit-app-region: drag;
    height: 72px;
    margin-bottom: 8px;
    display: flex;
}

#main-left .header .win-traffic-light-btn {
    margin-top: 17px;
    margin-left: 20px;
}

#main-left .header .logo-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: 16%;
    top: 60px;
    display: none;
}

#main-left .center {
    flex: 1;
    padding-bottom: 36px;
    overflow: scroll;
}

#explore-mode {
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    /* color: var(--content-subtitle-text-color); */
}

#explore-mode svg,
#custom-playlist-list svg {
    fill: var(--content-subtitle-text-color);
    margin-right: 6px;
}

#explore-mode {
    position: relative;
}

#explore-mode .mode-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;
    padding: 3px 6px;
    font-size: var(--content-text-module-title2-size);
    font-weight: bold;
    color: var(--content-subtitle-text-color);
    margin-right: 23%;
}

#explore-mode .mode-item:hover span {
    background: var(--content-text-highlight-color);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

#explore-mode .mode-item:hover svg {
    fill: var(--content-highlight-color);
}

#explore-mode .exit-btn {
    position: absolute;
    top: 8px;
    right: 13px;
}

#explore-mode .exit-btn:hover svg {
    fill: var(--content-highlight-color);
    cursor: pointer;
}

#explore-mode .excluded-mode-item {
    cursor: default !important;
}

#explore-mode .excluded-mode-item:hover span {
    color: var(--content-subtitle-text-color) !important;
}

#explore-mode .excluded-mode-item:hover svg {
    fill: var(--content-subtitle-text-color) !important;
}

#custom-playlist-list,
#favorite-playlist-list,
#follow-artist-list {
    margin-top: 36px;
    position: relative;
}

#main-left .center .add-custom-btn,
#main-left .center .collapse-btn,
#main-left .center .expand-btn {
    fill: var(--content-subtitle-text-color);
    cursor: pointer;
    position: absolute;
    /* right: 15px; */
    right: 19px;
    top: 4px;
}

#main-left .center .collapse-btn,
#main-left .center .expand-btn {
    /* right: 22px; */
    right: 26px;
}

#main-left .center .add-custom-btn:hover {
    fill: var(--content-highlight-color);
}

#main-left ul {
    list-style: none;
    text-align: left;
    padding-left: 13%;
    padding-left: 10%;
    line-height: var(--content-left-nav-line-height);
}

#main-left li {
    text-decoration: none;
    width: 60%;
    width: 128px;
    margin-bottom: var(--content-left-nav-line-spacing);
    padding-left: 20px;
    padding-right: 20px;
    cursor: pointer;
    border-radius: 5px;
    text-align: left;
    overflow: hidden;
    word-wrap: break-all;
    white-space: pre-wrap;
    line-break: anywhere;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
}

#main-left li:hover {
    background: var(--content-list-item-hover-bg-color);
}

#custom-playlist-list li,
#favorite-playlist-list li {
    font-size: var(--content-text-subtitle-size);
}

#favorite-playlist-list li {
    padding-left: 15px;
    padding-right: 15px;
    /* width: 127px; */
    width: 138px;
}

#main-left .active {
    background: var(--button-icon-text-btn-bg-color) !important;
    color: var(--button-icon-text-btn-icon-color);
}

#main-left .bottom {
    height: 60px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-right: 23px;
}

#app-logo {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10rem 0 10rem 10rem;
    border: 0px solid;
    font-weight: bold;
    background: var(--app-logo-bg-color);
}

#app-logo span {
    width: 16px;
    height: 16px;
    line-height: 16px;
    font-size: 13.5px;
    justify-content: center;
    border-radius: 10rem;
    background: var(--app-logo-inner-bg-color);
    color: var(--app-logo-inner-text-color);
}

#app-name {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 10px;
    font-size: 20px;
    font-weight: bold;
    background: var(--app-logo-app-name-text-color);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}
</style>