<script setup>
import { ref, watch } from 'vue'
import EventBus from '../../common/EventBus';
import { usePlatformStore } from '../../renderer/store/platformStore'

const props = defineProps({
    cover: String,
    title: String,
    subtitle: String,
    color: String,
    playable: Boolean,
    playAction: Function,
    platform: String
})

const isChecked = ref(props.checked)
const setChecked = (value) => {
    isChecked.value = value
}
</script>

<template>
    <div class="image-text-tile">
        <div class="cover-wrap">
            <img v-lazy="cover" v-show="!color" class="cover">
            <div class="cover" v-show="color" :style="{ background: color }"></div>
            <div class="cover-mask" :class="{ selectable: checkbox }">
                <div class="play-btn" v-show="playable">
                    <svg width="21" height="21" viewBox="0 0 139 139" xml:space="preserve"
                        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <path
                            d="M117.037,61.441L36.333,14.846c-2.467-1.424-5.502-1.424-7.972,0c-2.463,1.423-3.982,4.056-3.982,6.903v93.188  c0,2.848,1.522,5.479,3.982,6.9c1.236,0.713,2.61,1.067,3.986,1.067c1.374,0,2.751-0.354,3.983-1.067l80.704-46.594  c2.466-1.422,3.984-4.054,3.984-6.9C121.023,65.497,119.502,62.866,117.037,61.441z" />
                    </svg>
                </div>
            </div>
        </div>
        <div class="title" v-html="title"></div>
        <div class="subtitle" v-show="subtitle" v-html="subtitle"></div>
    </div>
</template>

<style scoped>
.image-text-tile {
    margin: 15px 13px;
}

.image-text-tile .cover {
    width: var(--others-image-text-tile-cover-size);
    height: var(--others-image-text-tile-cover-size);
    line-height: var(--others-image-text-tile-cover-size);
    border-radius: 6px;
    cursor: pointer;
    box-shadow: 0px 0px 3px var(--border-popovers-border-color);
    box-shadow: 0px 0px 3px #181818;
    background-color: var(--app-bg-color);
}

.image-text-tile .cover-wrap:hover {
    transform: scale(1.05) translateY(-4px);
}

.image-text-tile .title {
    width: var(--others-image-text-tile-cover-size);
    margin-top: 10px;
    text-align: left;
    cursor: pointer;
    line-height: var(--content-text-line-height);

    overflow: hidden;
    text-overflow: ellipsis;
    word-wrap: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.image-text-tile .title:hover {
    background: var(--content-text-highlight-color);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.image-text-tile .subtitle {
    width: var(--others-image-text-tile-cover-size);
    text-align: left;
    line-height: 25px;
    color: var(--content-secondary-text-color);
    font-size: var(--content-text-tip-text-size);
    /*font-weight: bold;*/
    color: var(--content-subtitle-text-color);

    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}

.image-text-tile svg {
    fill: var(--button-icon-btn-color);
    cursor: pointer;
    -webkit-app-region: no-drag;
}

.image-text-tile .cover-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.image-text-tile .cover-wrap .cover-mask {
    position: absolute;
    margin: auto;
    z-index: 2;
    visibility: hidden;
}

.image-text-tile .cover-wrap:hover .cover-mask {
    visibility: visible;
}

.image-text-tile .cover-wrap .selectable {
    visibility: visible;
    top: 10px;
    left: 10px;
    width: 25px;
    height: 25px;
    /*background: var(--others-checkbox-bg-color);*/
    background: var(--app-bg-color);
    border-radius: 6px;
    display: flex;
    justify-content: flex-start;
    cursor: pointer;
}

.image-text-tile .cover-mask .checkbox {}

.image-text-tile .checkbox svg {
    fill: var(--content-highlight-color);
}

.image-text-tile .cover-wrap .play-btn {
    border-radius: 10rem;
    width: 43px;
    height: 43px;
    background: var(--button-icon-text-btn-bg-color);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
}

.image-text-tile .cover-wrap .play-btn:hover {
    background: var(--button-icon-text-btn-hover-bg-color);
}

.image-text-tile .cover-wrap .play-btn svg {
    margin-top: 1px;
    margin-left: 2px;
    fill: var(--button-icon-text-btn-icon-color) !important;
}
</style>
