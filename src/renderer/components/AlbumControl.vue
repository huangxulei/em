<script setup>

const props = defineProps({
    visitable: Boolean,
    platform: String,
    data: Object
})

</script>

<template>
    <span class="album-ctl" :class="{ 'album-ctl-visitable': visitable }"
        v-html="data.name">
    </span>
</template>

<style>
.album-ctl {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    /* -webkit-app-region: none; */
    text-align: left;
}

.album-ctl-visitable {
    cursor: pointer;
}

.album-ctl-visitable:hover {
    background: var(--content-text-highlight-color);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}
</style>