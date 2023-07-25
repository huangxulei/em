<script setup>

</script>
<template>
    <div id="default-main-content">
        <router-view v-slot="{ Component }">
            <component :is="Component" />
        </router-view>
    </div>
</template>
<style>
#default-main-content {
    display: flex;
    flex: 1;
    overflow: auto;
    overflow-x: hidden;
}
</style>