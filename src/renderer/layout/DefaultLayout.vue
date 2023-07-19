<script setup>
import DefaultMainLeft from './DefaultMainLeft.vue';
import DefaultMainCenter from './DefaultMainCenter.vue';

</script>
<template>
    <div class="default-layout">
        <DefaultMainLeft></DefaultMainLeft>
        <DefaultMainCenter></DefaultMainCenter>
    </div>
</template>
<style scoped>
.default-layout {
    flex: 1;
    display: flex;
}
</style>