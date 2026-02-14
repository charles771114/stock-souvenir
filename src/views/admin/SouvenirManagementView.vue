<template>
  <div class="min-h-screen bg-[#fafafa]">
    <Navbar />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fade-in">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6 animate-fade-in-up">
        <div>
          <div class="flex items-center gap-2 mb-4">
            <router-link to="/admin/panel"
              class="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all font-bold text-xs uppercase tracking-widest leading-none">
              <div
                class="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 shadow-sm transition-all">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              管理主頁
            </router-link>
          </div>
          <h1
            class="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 tracking-tighter mb-2">
            紀念品資料管理
          </h1>
          <p class="text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
            各年度紀念品母檔資料維護
          </p>
        </div>

        <div class="flex gap-3">
          <router-link to="/admin/import/souvenirs"
            class="h-12 px-6 bg-white border border-slate-100 text-slate-600 rounded-2xl shadow-sm hover:bg-slate-50 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 leading-none">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            批次匯入
          </router-link>
          <button @click="openAddModal"
            class="h-12 px-8 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-2xl hover:bg-indigo-700 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            新增資料
          </button>
          <button @click="handleDeleteAllForYear" :disabled="loading || deleting"
            class="h-12 px-6 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl hover:bg-rose-600 hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            刪除全年度
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 animate-fade-in-up delay-100">
        <div class="glass-card p-6 group">
          <span
            class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block leading-none group-hover:text-indigo-600 transition-colors">總紀錄筆數</span>
          <div class="text-3xl font-black text-slate-800 tracking-tighter">{{ filteredSouvenirs.length }}</div>
        </div>
        <div class="glass-card p-6 group">
          <span
            class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block leading-none group-hover:text-emerald-500 transition-colors">已建立紀念品</span>
          <div class="text-3xl font-black text-emerald-500 tracking-tighter">{{ withSouvenirCount }}</div>
        </div>
        <div class="glass-card p-6 group">
          <span
            class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block leading-none group-hover:text-amber-500 transition-colors">待補資料筆數</span>
          <div class="text-3xl font-black text-amber-500 tracking-tighter">{{ pendingCount }}</div>
        </div>
        <div class="glass-card p-6 group flex flex-col justify-between">
          <span
            class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block leading-none group-hover:text-indigo-600 transition-colors">年度篩選</span>
          <div class="flex items-center gap-2">
            <select v-model="selectedYear" @change="fetchSouvenirs"
              class="bg-transparent border-none text-2xl font-black text-slate-800 focus:ring-0 cursor-pointer p-0 appearance-none">
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
            <svg class="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <div
        class="glass-card p-2 sm:p-4 mb-8 flex flex-col sm:flex-row gap-4 items-center animate-fade-in-up delay-150 relative group">
        <div class="absolute inset-y-0 left-8 flex items-center pointer-events-none z-10">
          <svg class="w-4 h-4 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input v-model="searchQuery" type="text" placeholder="搜尋代號、公司名稱或紀念品內容..."
          class="flex-1 w-full pl-14 pr-6 py-4 bg-transparent border-none text-slate-800 placeholder:text-slate-300 font-bold focus:outline-none" />
        <button @click="fetchSouvenirs"
          class="h-12 px-6 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">
          重新整理數據庫
        </button>
      </div>

      <!-- Data Area -->
      <div v-if="loading" class="py-24 flex flex-col items-center gap-6">
        <div class="w-16 h-16 border-8 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
        <p class="text-sm font-black text-indigo-300 uppercase tracking-[0.2em] animate-pulse">正在存取主資料庫...</p>
      </div>

      <div v-else class="animate-fade-in-up delay-200">
        <!-- Main Data Table -->
        <div class="glass-card overflow-hidden p-0 border-none">
          <div class="hidden lg:block overflow-x-auto">
            <table class="w-full border-separate border-spacing-0">
              <thead>
                <tr class="bg-indigo-50/30 border-b border-indigo-50">
                  <th
                    class="px-8 py-5 text-left text-[10px] font-black text-indigo-900/40 uppercase tracking-widest leading-none">
                    股票代碼</th>
                  <th
                    class="px-6 py-5 text-left text-[10px] font-black text-indigo-900/40 uppercase tracking-widest leading-none">
                    所屬企業</th>
                  <th
                    class="px-6 py-5 text-left text-[10px] font-black text-indigo-900/40 uppercase tracking-widest leading-none">
                    發放紀念品</th>
                  <th
                    class="px-6 py-5 text-left text-[10px] font-black text-indigo-900/40 uppercase tracking-widest leading-none">
                    重要時程</th>
                  <th
                    class="px-8 py-5 text-right text-[10px] font-black text-indigo-900/40 uppercase tracking-widest leading-none pr-10">
                    管理功能</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="item in paginatedSouvenirs" :key="item.id"
                  class="group hover:bg-indigo-50/20 transition-all duration-300">
                  <td class="px-8 py-5">
                    <span
                      class="px-3 py-1.5 rounded-xl bg-white border border-slate-100 text-indigo-600 font-mono text-xs font-black shadow-sm group-hover:border-indigo-200 transition-all">
                      {{ item.code }}
                    </span>
                  </td>
                  <td class="px-6 py-5">
                    <div class="text-sm font-black text-slate-800 group-hover:text-indigo-900 transition-colors">{{
                      item.name }}</div>
                    <div class="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none mt-1">Master
                      Record</div>
                  </td>
                  <td class="px-6 py-5">
                    <div v-if="item.souvenir_item" class="text-xs font-bold text-slate-600">{{ item.souvenir_item }}
                    </div>
                    <div v-else class="flex items-center gap-2">
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      <span
                        class="text-[10px] font-black text-amber-500/60 uppercase tracking-widest italic">待補資料</span>
                    </div>
                  </td>
                  <td class="px-6 py-5">
                    <div class="flex flex-col gap-1">
                      <div class="flex items-center gap-1.5">
                        <span class="text-[8px] font-black text-slate-300 uppercase tracking-tighter">股東會:</span>
                        <span class="text-[10px] font-bold text-slate-500 font-mono italic">{{ item.meeting_date || '-'
                          }}</span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <span class="text-[8px] font-black text-slate-300 uppercase tracking-tighter">最後買進:</span>
                        <span class="text-[10px] font-bold text-indigo-400 font-mono italic">{{ item.last_buy_date ||
                          '-' }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-5 text-right pr-10">
                    <div
                      class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                      <button @click="openEditModal(item)"
                        class="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button @click="confirmDelete(item)"
                        class="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition-all">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                          <path stroke-linecap="round" stroke-linejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="lg:hidden p-6 sm:p-8 space-y-4">
            <div v-for="item in paginatedSouvenirs" :key="item.id"
              class="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:border-indigo-200 transition-all active:scale-[0.98]">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div
                    class="px-2 py-1 rounded-lg bg-indigo-600 text-white font-mono text-[10px] font-black shadow-lg shadow-indigo-100">
                    {{ item.code }}</div>
                  <div class="text-lg font-black text-slate-800 tracking-tighter">{{ item.name }}</div>
                </div>
                <div class="flex gap-2">
                  <button @click="openEditModal(item)"
                    class="h-10 w-10 rounded-xl bg-slate-50 text-indigo-600 flex items-center justify-center transition-all"><svg
                      class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg></button>
                  <button @click="confirmDelete(item)"
                    class="h-10 w-10 rounded-xl bg-slate-50 text-rose-500 flex items-center justify-center transition-all"><svg
                      class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg></button>
                </div>
              </div>

              <div class="p-4 rounded-xl bg-slate-50 mb-4 border border-slate-100">
                <span class="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-1">Item
                  紀念品內容描述</span>
                <div v-if="item.souvenir_item" class="text-sm font-bold text-slate-700 leading-tight">{{
                  item.souvenir_item }}</div>
                <div v-else class="text-[10px] font-black text-amber-500/60 uppercase tracking-widest italic">Pending
                  verification</div>
              </div>

              <div class="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <div class="text-slate-300">股東會: <span class="text-slate-600 font-mono">{{ item.meeting_date || '-'
                    }}</span></div>
                <div class="text-indigo-300">買進: <span class="text-indigo-400 font-mono italic">{{ item.last_buy_date
                  || '-' }}</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-12 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            目前顯示第 <span class="text-indigo-600">{{ (currentPage - 1) * pageSize + 1 }}</span> 至 <span
              class="text-indigo-600">{{ Math.min(currentPage * pageSize, filteredSouvenirs.length) }}</span> 筆，共 <span
              class="text-indigo-600">{{ filteredSouvenirs.length }}</span> 筆紀錄
          </div>

          <div class="flex items-center gap-1.5 overflow-x-auto pb-4 sm:pb-0 max-w-full custom-scrollbar">
            <button @click="currentPage--" :disabled="currentPage === 1"
              class="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all disabled:opacity-30">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button v-for="p in visiblePages" :key="p" @click="currentPage = p"
              class="h-10 w-10 rounded-xl text-[10px] font-black transition-all flex items-center justify-center uppercase tracking-widest"
              :class="currentPage === p ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'">
              {{ p }}
            </button>

            <button @click="currentPage++" :disabled="currentPage === totalPages"
              class="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all disabled:opacity-30">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals kept for logic integrity -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" @click="closeModal"></div>
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl relative overflow-hidden animate-bounce-in">
          <div class="p-8 sm:p-12">
            <div class="flex items-center justify-between mb-10">
              <div>
                <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1 block">資料管理</span>
                <h2 class="text-4xl font-black text-slate-800 tracking-tighter">{{ isEditing ? '編輯紀錄' : '建立歸戶' }}</h2>
              </div>
              <button @click="closeModal"
                class="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-800 transition-all flex items-center justify-center">&times;</button>
            </div>

            <form @submit.prevent="saveItem" class="space-y-6">
              <div class="grid grid-cols-2 gap-5">
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">股票代號</label>
                  <input v-model="formData.code" type="text" required :disabled="isEditing"
                    class="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:bg-white focus:border-indigo-200 transition-all outline-none" />
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">公司名稱</label>
                  <input v-model="formData.name" type="text"
                    class="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:bg-white focus:border-indigo-200 transition-all outline-none" />
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">紀念品內容</label>
                <input v-model="formData.souvenir_item" type="text" placeholder="例如：50元超商商品卡"
                  class="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:bg-white focus:border-indigo-200 transition-all outline-none" />
              </div>

              <div class="grid grid-cols-2 gap-5">
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">股東會日期</label>
                  <input v-model="formData.meeting_date" type="date"
                    class="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:bg-white focus:border-indigo-200 transition-all outline-none" />
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">最後買進日</label>
                  <input v-model="formData.last_buy_date" type="date"
                    class="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:bg-white focus:border-indigo-200 transition-all outline-none" />
                </div>
              </div>

              <div class="mt-10 flex gap-4">
                <button type="button" @click="closeModal"
                  class="flex-1 h-14 bg-slate-100 text-slate-400 font-black rounded-2xl uppercase tracking-widest text-xs transition-all">取消</button>
                <button type="submit" :disabled="saving"
                  class="flex-[2] h-14 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                  {{ saving ? '正在儲存...' : '確認儲存資料' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirm Modal Refined -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-[210] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-fade-in"
          @click="showDeleteConfirm = false"></div>
        <div
          class="relative bg-white rounded-[2.5rem] w-full max-w-sm p-10 text-center shadow-2xl animate-bounce-in overflow-hidden">
          <div class="absolute top-0 inset-x-0 h-1.5 bg-rose-600"></div>
          <div
            class="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-50 border-4 border-white">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="text-3xl font-black text-slate-800 tracking-tighter mb-2">確定刪除紀錄？</h3>
          <p class="text-xs font-bold text-slate-400 leading-relaxed mb-8 uppercase tracking-widest">這將會永久從主資料庫中移除「<span
              class="text-rose-600 font-black">{{ itemToDelete?.name }}</span>」。</p>

          <div class="flex flex-col gap-3">
            <button @click="deleteItem" :disabled="deleting"
              class="h-14 bg-rose-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all">確認永久刪除</button>
            <button @click="showDeleteConfirm = false"
              class="h-14 bg-slate-100 text-slate-400 font-black rounded-2xl uppercase tracking-widest text-xs transition-all">取消</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import { useToast } from '@/composables/useToast'
import { useGifts } from '@/composables/useGifts'
import { supabase } from '@/lib/supabase'
import { computed, onMounted, ref, watch } from 'vue'
import Swal from 'sweetalert2'

const { showToast } = useToast()
const { clearGiftsCache } = useGifts()

const souvenirs = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const isEditing = ref(false)
const itemToDelete = ref(null)
const searchQuery = ref('')
const selectedYear = ref(new Date().getFullYear().toString())
const currentPage = ref(1)
const pageSize = 20
const availableYears = ['2026', '2025', '2024']

const formData = ref({ code: '', name: '', souvenir_item: '', meeting_date: '', last_buy_date: '', location: '' })

const filteredSouvenirs = computed(() => {
  if (!searchQuery.value) return souvenirs.value
  const q = searchQuery.value.toLowerCase()
  return souvenirs.value.filter(s => 
    (s.code && String(s.code).toLowerCase().includes(q)) || 
    (s.name && String(s.name).toLowerCase().includes(q)) || 
    (s.souvenir_item && String(s.souvenir_item).toLowerCase().includes(q))
  )
})

const paginatedSouvenirs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredSouvenirs.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredSouvenirs.value.length / pageSize))
const withSouvenirCount = computed(() => souvenirs.value.filter(s => s.souvenir_item && s.souvenir_item.trim() !== '').length)
const pendingCount = computed(() => souvenirs.value.filter(s => !s.souvenir_item || s.souvenir_item.trim() === '').length)

const visiblePages = computed(() => {
  const max = 5
  let start = Math.max(1, currentPage.value - 2)
  let end = Math.min(totalPages.value, start + max - 1)
  if (end - start + 1 < max) start = Math.max(1, end - max + 1)
  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

watch(searchQuery, () => { currentPage.value = 1 })

const fetchSouvenirs = async () => {
  loading.value = true
  currentPage.value = 1
  try {
    const startDate = `${selectedYear.value}-01-01`
    const endDate = `${selectedYear.value}-12-31`
    
    // 建立更寬鬆的篩選邏輯：股東會在該年度，或是股東會未定但最後買進日在該年度
    const { data, error } = await supabase
      .from('souvenirs')
      .select('*')
      .or(`and(meeting_date.gte.${startDate},meeting_date.lte.${endDate}),and(meeting_date.is.null,last_buy_date.gte.${startDate},last_buy_date.lte.${endDate})`)
      .order('code', { ascending: true })
    if (error) throw error
    souvenirs.value = data || []
  } catch (e) {
    showToast('取得資料失敗', 'error')
  } finally { loading.value = false }
}

const openAddModal = () => {
  isEditing.value = false
  formData.value = { code: '', name: '', souvenir_item: '', meeting_date: `${selectedYear.value}-06-01`, last_buy_date: '', location: '' }
  showModal.value = true
}

const openEditModal = (item) => {
  isEditing.value = true
  formData.value = { ...item }
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

const saveItem = async () => {
  saving.value = true
  try {
    const year = formData.value.meeting_date ? formData.value.meeting_date.split('-')[0] : selectedYear.value
    const docId = `${formData.value.code}_${year}`
    if (isEditing.value) {
      const { error } = await supabase.from('souvenirs').update({ name: formData.value.name, souvenir_item: formData.value.souvenir_item, meeting_date: formData.value.meeting_date, last_buy_date: formData.value.last_buy_date || null, location: formData.value.location, updated_at: new Date().toISOString() }).eq('id', formData.value.id)
      if (error) throw error
      showToast('更新成功', 'success')
    } else {
      const { error } = await supabase.from('souvenirs').insert({ doc_id: docId, code: formData.value.code, name: formData.value.name, souvenir_item: formData.value.souvenir_item, meeting_date: formData.value.meeting_date, last_buy_date: formData.value.last_buy_date || null, location: formData.value.location })
      if (error) throw error
      showToast('新增成功', 'success')
    }
    clearGiftsCache(selectedYear.value) // 立即清除快取，確保同步
    closeModal(); await fetchSouvenirs()
  } catch (e) { showToast(e.message || '儲存失敗', 'error') } finally { saving.value = false }
}

const confirmDelete = (item) => { itemToDelete.value = item; showDeleteConfirm.value = true }
const deleteItem = async () => {
  if (!itemToDelete.value) return
  deleting.value = true
  try {
    const { error } = await supabase.from('souvenirs').delete().eq('id', itemToDelete.value.id)
    if (error) throw error
    clearGiftsCache(selectedYear.value) // 立即清除快取，確保同步
    showToast('刪除成功', 'success'); showDeleteConfirm.value = false; itemToDelete.value = null; await fetchSouvenirs()
  } catch (e) { showToast(e.message || '刪除失敗', 'error') } finally { deleting.value = false }
}

const handleDeleteAllForYear = async () => {
  if (!selectedYear.value) return

  const count = filteredSouvenirs.value.length
  if (count === 0) {
    showToast(`目前 ${selectedYear.value} 年度沒有可刪除的資料`, 'info')
    return
  }

  const result = await Swal.fire({
    title: `確定要刪除 ${selectedYear.value} 全年度資料？`,
    html: `這將會永久移除資料庫中 ${selectedYear.value} 年度的 <b class="text-rose-600">${count}</b> 筆紀念品紀錄。<br><br><small class="text-slate-400 uppercase tracking-widest font-black">此操作無法復原，請謹慎執行</small>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '確認永久刪除',
    cancelButtonText: '取消',
    confirmButtonColor: '#e11d48',
    reverseButtons: true,
    customClass: {
      popup: 'rounded-[2rem] border-none shadow-2xl',
      confirmButton: 'rounded-xl font-black px-6 py-3',
      cancelButton: 'rounded-xl font-black px-6 py-3'
    }
  })

  if (!result.isConfirmed) return

  loading.value = true
  try {
    const startDate = `${selectedYear.value}-01-01`
    const endDate = `${selectedYear.value}-12-31`
    
    // 執行範圍刪除
    const { error } = await supabase
      .from('souvenirs')
      .delete()
      .or(`and(meeting_date.gte.${startDate},meeting_date.lte.${endDate}),and(meeting_date.is.null,last_buy_date.gte.${startDate},last_buy_date.lte.${endDate})`)

    if (error) throw error

    clearGiftsCache(selectedYear.value) // 立即清除該年份快取
    showToast(`已成功移除 ${selectedYear.value} 共 ${count} 筆紀錄`, 'success')
    await fetchSouvenirs()
  } catch (e) {
    showToast(e.message || '刪除失敗', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => { fetchSouvenirs() })
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 2.5rem;
  box-shadow: 0 10px 40px -10px rgba(31, 38, 135, 0.05);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(99, 102, 241, 0.1);
  border-radius: 20px;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes bounce-in {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }

  60% {
    transform: scale(1.02);
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
}

.animate-bounce-in {
  animation: bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.delay-100 {
  animation-delay: 0.1s;
}

.delay-150 {
  animation-delay: 0.15s;
}

.delay-200 {
  animation-delay: 0.2s;
}
</style>
