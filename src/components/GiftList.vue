<template>
  <div>
    <!-- 切換按鈕與排序欄位 -->
    <div class="mb-4 flex flex-wrap justify-between items-center">
      <div class="flex items-center gap-3">
        <i class="ri-list-settings-line text-2xl text-brand-primary"></i>
        <span class="text-2xl font-black text-slate-800 tracking-tight">所有紀念品</span>
      </div>

      <!-- 排序選單 -->
      <div class="mt-4 sm:mt-0 flex items-center bg-slate-100 p-1.5 rounded-xl">
        <label class="text-base font-black uppercase tracking-widest text-slate-400 ml-2 mr-3">排序</label>
        <select v-model="sortBy" class="bg-white border-none rounded-lg px-4 py-2 text-base font-black text-slate-700 focus:ring-2 focus:ring-brand-primary/20 appearance-none cursor-pointer">
          <option value="number">股票代號</option>
          <option value="lastBuy">最後買進日</option>
        </select>
        <button @click="toggleSort" class="ml-3 px-4 py-2 bg-white rounded-lg text-base font-black text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm flex items-center gap-2">
          <i :class="sortDir === 'asc' ? 'ri-sort-asc' : 'ri-sort-desc'" class="text-xl"></i>
          <span>{{ sortDir === 'asc' ? '升冪' : '降冪' }}</span>
        </button>
      </div>
    </div>

    <!-- 區分是否已過期 -->
    <div class="mb-8 p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-wrap items-center gap-8">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
          <i class="ri-error-warning-fill text-rose-500 text-2xl"></i>
        </div>
        <div>
          <span class="block text-sm uppercase font-black text-slate-400 tracking-widest mb-1">已過最後買進</span>
          <span class="text-2xl font-black text-slate-800">{{ expiredGifts.length }} <small class="text-sm font-bold text-slate-400">筆</small></span>
        </div>
      </div>
      
      <div class="w-px h-10 bg-slate-100 hidden sm:block"></div>

      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
          <i class="ri-checkbox-circle-fill text-emerald-500 text-2xl"></i>
        </div>
        <div>
          <span class="block text-sm uppercase font-black text-slate-400 tracking-widest mb-1">尚可買進</span>
          <span class="text-2xl font-black text-slate-800">{{ validGifts.length }} <small class="text-sm font-bold text-slate-400">筆</small></span>
        </div>
      </div>
    </div>

    <!-- 尚可買進 區塊 -->
    <div class="mb-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
      <button
        @click="toggleSection('valid')"
        class="w-full text-left px-8 py-6 bg-emerald-50/50 hover:bg-emerald-50 font-black text-lg text-emerald-900 flex items-center justify-between transition-colors"
      >
        <div class="flex items-center gap-3">
          <i class="ri-checkbox-circle-line text-2xl"></i>
          <span>尚可買進 ({{ validGifts.length }})</span>
        </div>
        <i :class="expanded.valid ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'" class="text-2xl opacity-40"></i>
      </button>
      <div v-show="expanded.valid" class="p-4">
        <TableView
          :items="sortedGifts.filter((item) => !isExpired(item.lastBuy))"
          :isExpired="isExpired"
        />
      </div>
    </div>

    <!-- 已過期 區塊 -->
    <div class="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
      <button
        @click="toggleSection('expired')"
        class="w-full text-left px-8 py-6 bg-rose-50/50 hover:bg-rose-50 font-black text-lg text-rose-900 flex items-center justify-between transition-colors"
      >
        <div class="flex items-center gap-3">
          <i class="ri-error-warning-line text-2xl"></i>
          <span>已過最後買進日 ({{ expiredGifts.length }})</span>
        </div>
        <i :class="expanded.expired ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'" class="text-2xl opacity-40"></i>
      </button>
      <div v-show="expanded.expired" class="p-4">
        <TableView
          :items="sortedGifts.filter((item) => isExpired(item.lastBuy))"
          :isExpired="isExpired"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TableView from './TableView.vue'

const props = defineProps({
  gifts: Array,
})

const sortBy = ref('number')
const sortDir = ref('asc')
const expanded = ref({ valid: true, expired: true })

function toggleSort() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

function toggleSection(key) {
  expanded.value[key] = !expanded.value[key]
}

function parseDate(mmdd) {
  return new Date(`${new Date().getFullYear()}/${mmdd}`)
}

function isExpired(lastBuy) {
  if (!lastBuy) return false
  const today = new Date().setHours(0, 0, 0, 0)
  const buyDate = parseDate(lastBuy).setHours(0, 0, 0, 0)
  return buyDate < today
}

const sortedGifts = computed(() => {
  return [...props.gifts].sort((a, b) => {
    let aVal =
      sortBy.value === 'lastBuy'
        ? parseDate(a.lastBuy || '01/01')
        : a[sortBy.value]
    let bVal =
      sortBy.value === 'lastBuy'
        ? parseDate(b.lastBuy || '01/01')
        : b[sortBy.value]
    return sortDir.value === 'asc'
      ? aVal > bVal
        ? 1
        : -1
      : aVal < bVal
        ? 1
        : -1
  })
})

const expiredGifts = computed(() =>
  props.gifts.filter((g) => isExpired(g.lastBuy))
)
const validGifts = computed(() =>
  props.gifts.filter((g) => !isExpired(g.lastBuy))
)
</script>

<style scoped>
button:focus {
  outline: none;
}
</style>
