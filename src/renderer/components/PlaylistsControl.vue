<script setup>
import PaginationTiles from './PaginationTiles.vue'

const props = defineProps({
    data: Array,
    loading: Boolean
})
</script>

<template>
    <div class="playlists-ctl">
        <PaginationTiles v-show="!loading">
            <ImageTextTile v-for="item in data" :cover="item.cover" :title="item.title" :playable="true">
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
