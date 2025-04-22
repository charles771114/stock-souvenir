import { ref } from 'vue'
import axios from 'axios'
import { useLoadingStore } from '@/stores/ui'

const STORAGE_KEY = 'souvenir_gifts'

export function useGifts(baseUrl) {
  const gifts = ref([])
  const error = ref('')
  const loadingStore = useLoadingStore()

  const fetchGifts = async () => {
    try {
      loadingStore.startLoading()

      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        gifts.value = JSON.parse(cached)
        return
      }

      const { data } = await axios.get(`${baseUrl}/api/firestore/gifts`)
      gifts.value = data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (err) {
      error.value = err.message
    } finally {
      loadingStore.stopLoading()
    }
  }

  return { gifts, error, fetchGifts }
}
