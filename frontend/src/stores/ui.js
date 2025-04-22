import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false)

  function startLoading() {
    console.log('startLoading')
    isLoading.value = true
  }

  function stopLoading() {
    console.log('stopLoading')
    isLoading.value = false
  }

  return {
    isLoading,
    startLoading,
    stopLoading
  }
})
