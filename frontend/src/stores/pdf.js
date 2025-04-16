// src/stores/pdf.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'

const baseUrl = import.meta.env.VITE_API_BASE_URL

export const usePdfGiftStore = defineStore('pdfGift', () => {
  const file = ref(null)
  const password = ref('')
  const result = ref([])
  const gifts = ref([])
  const owned = ref([])
  const notOwned = ref([])
  const loading = ref(false)
  const error = ref('')

  function setFile(f) {
    file.value = f
  }

  async function decryptPdf() {
    if (!file.value || !password.value) {
      error.value = '請選擇 PDF 並輸入密碼'
      return
    }

    const formData = new FormData()
    formData.append('file', file.value)
    formData.append('password', password.value)

    try {
      loading.value = true
      error.value = ''
      result.value = []

      const { data } = await axios.post(`${baseUrl}/api/pdf/decrypt`, formData)
      result.value = data.stocks || []

      compareWithGifts()
    } catch (err) {
      error.value = err.response?.data?.error || '解密失敗'
    } finally {
      loading.value = false
    }
  }

  async function fetchGiftData() {
    try {
      const snapshot = await getDocs(collection(db, 'souvenirs'))
      gifts.value = snapshot.docs.map(doc => doc.data())
      compareWithGifts()
    } catch (err) {
      error.value = '讀取紀念品資料失敗'
    }
  }

  function compareWithGifts() {
    if (!result.value.length || !gifts.value.length) return

    owned.value = gifts.value.filter(g =>
      result.value.some(r => r.code === g.number)
    )
    notOwned.value = gifts.value.filter(g =>
      !result.value.some(r => r.code === g.number)
    )
  }

  return {
    file,
    password,
    result,
    gifts,
    owned,
    notOwned,
    loading,
    error,
    setFile,
    decryptPdf,
    fetchGiftData
  }
})
