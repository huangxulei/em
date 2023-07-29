<script setup>
import PaginationTiles from './PaginationTiles.vue'
const props = defineProps({
    date: Array,
    loading: Boolean
})
</script>

<template>
    <div class="playlists-ctl">
        <PaginationTiles v-show="!loading">

        </PaginationTiles>
    </div>
</template>

<style scoped></style>
