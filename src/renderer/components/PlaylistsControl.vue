<script setup>
import { inject } from 'vue'
import PaginationTiles from './PaginationTiles.vue'
import { usePlatformStore } from '../store/platformStore'

const { visitPlaylist } = inject('appRoute')
const { isPlatformValid } = usePlatformStore()

const props = defineProps({
    data: Array,
    checkbox: Boolean,
    checkedAll: Boolean,
    ignoreCheckAllEvent: Boolean,
    checkChangedFn: Function,
    loading: Boolean,
    customLoadingCount: Number
})

const visitItem = (item) => {
    const { checkbox } = props
    if (checkbox) return
    const { id, platform } = item
    const platformValid = isPlatformValid(platform)
    const idValid = (typeof (id) == 'string') ? (id.trim().length > 0) : (id > 0)
    const visitable = platformValid && idValid
    if (visitable) {
        visitPlaylist(platform, id)
    }
}
</script>

<template>
    <div class="playlists-ctl">
        <PaginationTiles v-show="!loading">
            <ImageTextTile v-for="item in data" @click="visitItem(item)" :cover="item.cover"
                :checkbox="checkbox" :checked="checkedAll" :ignoreCheckAllEvent="ignoreCheckAllEvent"
                :title="item.title" :playable="true" :checkChangedFn="(checked) => checkChangedFn(checked, item)" :platform="item.platform">
            </ImageTextTile>
        </PaginationTiles>
    </div>
</template>

<style scoped>
.playlists-ctl {
    /* margin-top: 15px; */
    margin-top: 5px;
}
</style>
