<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ source ? '編輯爬蟲來源' : '新增爬蟲來源' }}
        </h3>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Source Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            來源名稱 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.source_name"
            type="text"
            required
            placeholder="例如：永豐金證券股東會紀念品"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <!-- Source URL -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            網站 URL <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.source_url"
            type="url"
            required
            placeholder="https://example.com/gifts"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <!-- Selector Config -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Selector 設定 <span class="text-red-500">*</span>
          </label>
          <p class="text-xs text-gray-500 mb-2">
            設定 CSS Selector 來抓取資料
          </p>

          <div class="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Container Selector</label>
              <input
                v-model="selectorConfig.container"
                type="text"
                placeholder="table tbody tr"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">公司代號</label>
                <input
                  v-model="selectorConfig.selectors.company_code"
                  type="text"
                  placeholder="td:nth-child(1)"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">公司名稱</label>
                <input
                  v-model="selectorConfig.selectors.company_name"
                  type="text"
                  placeholder="td:nth-child(2)"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">紀念品名稱</label>
                <input
                  v-model="selectorConfig.selectors.gift_name"
                  type="text"
                  placeholder="td:nth-child(3)"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">年份</label>
                <input
                  v-model="selectorConfig.selectors.gift_year"
                  type="text"
                  placeholder="td:nth-child(4)"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div class="col-span-2">
                <label class="block text-xs font-medium text-gray-600 mb-1">圖片 URL (可選)</label>
                <input
                  v-model="selectorConfig.selectors.image_url"
                  type="text"
                  placeholder="td:nth-child(5) img"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Is Active -->
        <div class="flex items-center">
          <input
            v-model="formData.is_active"
            type="checkbox"
            id="is_active"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label for="is_active" class="ml-2 block text-sm text-gray-700">
            啟用此爬蟲來源
          </label>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {{ loading ? '儲存中...' : '儲存' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useScraper } from '@/composables/useScraper'

const props = defineProps({
  source: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const { loading, error, addScraperSource, updateScraperSource } = useScraper()

const formData = reactive({
  source_name: '',
  source_url: '',
  is_active: true,
})

const selectorConfig = reactive({
  container: '',
  selectors: {
    company_code: '',
    company_name: '',
    gift_name: '',
    gift_year: '',
    image_url: '',
  }
})

const handleSubmit = async () => {
  // 組合 selector_config
  const data = {
    ...formData,
    selector_config: selectorConfig
  }

  let result
  if (props.source) {
    result = await updateScraperSource(props.source.id, data)
  } else {
    result = await addScraperSource(data)
  }

  if (!result.error) {
    emit('saved')
  }
}

onMounted(() => {
  if (props.source) {
    formData.source_name = props.source.source_name
    formData.source_url = props.source.source_url
    formData.is_active = props.source.is_active

    if (props.source.selector_config) {
      Object.assign(selectorConfig, props.source.selector_config)
    }
  }
})
</script>
