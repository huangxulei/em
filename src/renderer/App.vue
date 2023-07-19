<script setup>
import AppRoute from './AppRoute.vue'
import PlayBootstrap from './PlayBootstrap.vue'
import AppContent from './AppContent.vue';

</script>
<template>
    <AppRoute>
        <PlayBootstrap>
            <AppContent></AppContent>
        </PlayBootstrap>
    </AppRoute>
</template>
<style>
html,
body,
#app {
    background: transparent;
    height: 100%;
}
</style>