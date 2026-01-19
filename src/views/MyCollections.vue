<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">我的收藏</h1>
        <p class="text-gray-600">管理您收藏的股東會紀念品</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="myCollections.length === 0" class="text-center py-12">
        <svg class="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">還沒有收藏</h3>
        <p class="text-gray-600 mb-4">開始收藏您感興趣的股東會紀念品吧！</p>
        <router-link
          to="/gifts"
          class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          瀏覽紀念品
        </router-link>
      </div>

      <!-- Collections List -->
      <div v-else class="space-y-4">
        <div
          v-for="collection in myCollections"
          :key="collection.id"
          class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="p-6">
            <div class="flex items-start justify-between">
              <!-- Gift Info -->
              <div class="flex-1">
                <div class="flex items-center mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ collection.gift?.company_name }}
                    <span class="text-gray-500 text-sm ml-2">
                      ({{ collection.gift?.company_code }})
                    </span>
                  </h3>
                </div>
                
                <p class="text-indigo-600 font-medium mb-2 flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  {{ collection.gift?.gift_name }}
                </p>

                <div class="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {{ collection.gift?.gift_year }} 年
                  </span>
                  <span v-if="collection.gift?.gift_category" class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    {{ collection.gift?.gift_category }}
                  </span>
                </div>

                <!-- Collected Date -->
                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    收藏日期
                  </label>
                  <input
                    :value="collection.collected_date"
                    type="date"
                    class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    @change="updateDate(collection.id, $event.target.value)"
                  />
                </div>

                <!-- Notes -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    備註
                  </label>
                  <textarea
                    :value="collection.notes"
                    rows="2"
                    placeholder="新增備註..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    @blur="updateNote(collection.id, $event.target.value)"
                  ></textarea>
                </div>
              </div>

              <!-- Actions -->
              <div class="ml-4 flex flex-col space-y-2">
                <button
                  v-if="collection.gift?.source_url"
                  @click="openUrl(collection.gift.source_url)"
                  class="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                  title="查看來源"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
                
                <button
                  @click="confirmRemove(collection)"
                  class="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="移除收藏"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div v-if="myCollections.length > 0" class="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">收藏統計</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-indigo-600">{{ myCollections.length }}</div>
            <div class="text-sm text-gray-600 mt-1">總收藏數</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">{{ collectedCount }}</div>
            <div class="text-sm text-gray-600 mt-1">已標記日期</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{{ uniqueCompanies }}</div>
            <div class="text-sm text-gray-600 mt-1">不同公司</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600">{{ uniqueYears }}</div>
            <div class="text-sm text-gray-600 mt-1">不同年份</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useGifts } from '@/composables/useGifts'
import Navbar from '@/components/Navbar.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const { myCollections, loading, error, fetchMyCollections, removeFromCollection, updateCollectionNote, updateCollectionDate } = useGifts()

const collectedCount = computed(() => {
  return myCollections.value.filter(c => c.collected_date).length
})

const uniqueCompanies = computed(() => {
  const companies = new Set()
  myCollections.value.forEach(c => {
    if (c.gift?.company_code) companies.add(c.gift.company_code)
  })
  return companies.size
})

const uniqueYears = computed(() => {
  const years = new Set()
  myCollections.value.forEach(c => {
    if (c.gift?.gift_year) years.add(c.gift.gift_year)
  })
  return years.size
})

const updateNote = async (collectionId, note) => {
  await updateCollectionNote(collectionId, note)
}

const updateDate = async (collectionId, date) => {
  await updateCollectionDate(collectionId, date)
}

const confirmRemove = async (collection) => {
  if (confirm(`確定要移除「${collection.gift?.gift_name}」嗎？`)) {
    await removeFromCollection(collection.id)
  }
}

const openUrl = (url) => {
  window.open(url, '_blank')
}

onMounted(async () => {
  await fetchMyCollections()
})
</script>
