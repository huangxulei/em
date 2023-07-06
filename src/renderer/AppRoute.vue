<script setup>
import { provide } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import EventBus from '../common/EventBus'
import { isDevEnv } from '../common/Utils'
/* 全局Router设置  */
const router = useRouter()
const setupRouter = () => {
    router.beforeResolve((to, from) => {
        if (isDevEnv()) console.log("[ ROUTE ] ==>>> " + to.path)
    })
}

setupRouter()

</script>
<template>
    <slot></slot>
</template>
<style scoped></style>