<script setup>
import { inject } from 'vue';
import EventBus from '../../common/EventBus';

const props = defineProps({
    visitable: Boolean,
    platform: String,
    data: Array
})
</script>
<template>
    <div class="artist-ctl" v-show="data && data.length > 0">
        <template v-for="(item, index) in data">
            <span class="artist-item" :class="{ visitable: visitable }"
                v-html="item.name">
            </span>
            <template v-if="index < (data.length - 1)">、</template>
        </template>
    </div>
</template>
<style scoped>
.artist-ctl {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    /* -webkit-app-region: none; */
    text-align: left;
}

.artist-ctl .visitable {
    cursor: pointer;
}

.artist-ctl .visitable:hover {
    background: var(--content-text-highlight-color);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}
</style>