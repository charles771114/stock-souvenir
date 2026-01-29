<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">待審核紀念品</h1>
      <button @click="fetchQueue" class="text-indigo-600 hover:text-indigo-900">重新整理</button>
    </div>

    <!-- Stats -->
    <div class="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4" v-if="queue.length > 0">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
            fill="currentColor">
            <path fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-yellow-700">
            共有 {{ queue.length }} 筆紀念品尚未分類。請手動指定分類。
          </p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">載入中...</p>
    </div>

    <div v-else-if="queue.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
      <svg class="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">皆已分類完成</h3>
      <p class="mt-1 text-sm text-gray-500">目前沒有需要審核的項目。</p>
    </div>

    <!-- Queue Table -->
    <div v-else class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">代號 / 公司</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">紀念品名稱</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指定分類</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in queue" :key="item.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <div class="font-medium">{{ item.code }}</div>
              <div class="text-gray-500">{{ item.name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.souvenir_item }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <select @change="e => assignCategory(item, (e.target as HTMLSelectElement).value)"
                class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option value="">選擇分類...</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <!-- Future: Add quick keyword add -->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCategories } from '@/composables/useCategories'
import { useToast } from '@/composables/useToast'
import { supabase } from '@/lib/supabase'
import { onMounted, ref } from 'vue'

const { showToast } = useToast()

const { categories, fetchCategories } = useCategories()
const queue = ref<any[]>([])
const loading = ref(false)

onMounted(() => {
  fetchCategories()
  fetchQueue()
})

const fetchQueue = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('souvenirs')
    .select('*')
    .eq('classification_status', 'unclassified')
    .order('meeting_date', { ascending: false })
    .limit(100)

  if (data) {
    queue.value = data
  }
  loading.value = false
}

const assignCategory = async (item: any, categoryIdStr: string) => {
  if (!categoryIdStr) return
  const categoryId = parseInt(categoryIdStr)

  const { error } = await supabase
    .from('souvenirs')
    .update({
      category_id: categoryId,
      classification_status: 'verified'
    })
    .eq('id', item.id)

  if (!error) {
    // Remove from local queue
    queue.value = queue.value.filter(q => q.id !== item.id)
    showToast('分類更新成功', 'success')
  } else {
    showToast('更新失敗: ' + error.message, 'error')
  }
}
</script>
