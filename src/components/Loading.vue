<template>
  <Loading v-model:active="isLoading" :is-full-page="true" />
</template>

<script setup>
import { useLoadingStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'
import Loading from 'vue3-loading-overlay'
import 'vue3-loading-overlay/dist/vue3-loading-overlay.css'

const loadingStore = useLoadingStore()
const { isLoading } = storeToRefs(loadingStore)
</script>
