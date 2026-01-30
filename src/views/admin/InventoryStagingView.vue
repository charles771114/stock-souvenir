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
            庫存歸戶管理
          </h1>
          <p class="text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
            核對並將匯入的數據與使用者身份進行關聯
          </p>
        </div>

        <router-link to="/admin/import/inventory"
          class="h-12 px-8 bg-white border border-slate-100 text-indigo-600 rounded-2xl shadow-sm hover:bg-indigo-50 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 leading-none">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          匯入新檔案
        </router-link>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12 animate-fade-in-up delay-100">
        <div
          class="glass-card p-6 sm:p-8 flex flex-col justify-between group overflow-hidden relative border-rose-100/30">
          <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg class="w-16 h-16 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">待處理總筆數</span>
          <div class="flex items-end gap-2">
            <span class="text-4xl font-black text-slate-800 tracking-tighter">{{ stats.pendingCount }}</span>
            <span class="text-[10px] font-black text-rose-500 mb-1.5 uppercase tracking-widest">筆紀錄</span>
          </div>
        </div>

        <div
          class="glass-card p-6 sm:p-8 flex flex-col justify-between group overflow-hidden relative border-amber-100/30">
          <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg class="w-16 h-16 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"
              stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">已識別對象姓名</span>
          <div class="flex items-end gap-2">
            <span class="text-4xl font-black text-slate-800 tracking-tighter">{{ stats.uniqueOwners }}</span>
            <span class="text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">位使用者</span>
          </div>
        </div>

        <div class="glass-card p-2 sm:p-4 flex items-center relative overflow-hidden group/search">
          <div class="absolute inset-y-0 left-6 sm:left-10 flex items-center pointer-events-none z-10">
            <svg class="h-5 w-5 text-indigo-400 transition-transform" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input v-model="searchOwner" type="text" placeholder="搜尋姓名..."
            class="w-full h-full pl-12 sm:pl-16 pr-6 bg-transparent border-none text-slate-800 placeholder-slate-300 focus:outline-none font-bold text-sm sm:text-base" />
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="animate-fade-in-up delay-200">
        <div v-if="loading" class="py-24 flex flex-col items-center gap-6">
          <div class="w-16 h-16 border-8 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
          <p class="text-sm font-black text-indigo-300 uppercase tracking-[0.2em] animate-pulse">同步暫存項目中...</p>
        </div>

        <div v-else-if="groupedStaging.length === 0" class="glass-card py-24 text-center border-emerald-100/30">
          <div
            class="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-emerald-100 text-emerald-500 shadow-xl shadow-emerald-50">
            <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-3xl font-black text-slate-800 mb-2 tracking-tighter">歸戶完成</h3>
          <p class="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">目前無待處理的暫存項目</p>
        </div>

        <div v-else class="glass-card overflow-hidden p-0">
          <!-- Desktop View -->
          <div class="hidden lg:block overflow-x-auto">
            <table class="w-full border-separate border-spacing-0">
              <thead>
                <tr class="bg-slate-50/50 border-b border-slate-100">
                  <th
                    class="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    待歸戶身份</th>
                  <th
                    class="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    數據組成項目</th>
                  <th
                    class="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    筆數</th>
                  <th
                    class="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none pr-10">
                    歸戶操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="(group, gIdx) in filteredGroups" :key="group.owner_name"
                  class="group hover:bg-slate-50/50 transition-colors">
                  <td class="px-8 py-6">
                    <div class="flex items-center gap-4">
                      <div
                        class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl shadow-sm">
                        {{ group.owner_name.charAt(0) }}
                      </div>
                      <div>
                        <div class="text-xl font-black text-slate-800 tracking-tighter">{{ group.owner_name }}</div>
                        <div class="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none mt-1">
                          等待歸戶中</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-6 max-w-lg">
                    <div class="flex flex-wrap gap-1.5">
                      <span v-for="(item, idx) in group.items.slice(0, 4)" :key="idx"
                        class="px-2.5 py-1.5 rounded-lg text-[9px] font-black bg-white border border-slate-100 text-slate-500 uppercase tracking-wider shadow-sm group-hover:border-indigo-200 transition-all">
                        {{ item.stock_name || item.stock_code }}
                      </span>
                      <div v-if="group.items.length > 4"
                        class="px-2.5 py-1.5 rounded-lg text-[9px] font-black bg-slate-900 text-white shadow-lg">
                        +{{ group.items.length - 4 }} 筆
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-6 text-center">
                    <span
                      class="text-sm font-black text-slate-700 bg-amber-50 border border-amber-100 px-4 py-2 rounded-2xl shadow-sm">
                      {{ group.items.length }}
                    </span>
                  </td>
                  <td class="px-6 py-6 text-right pr-8">
                    <button @click="openLinkModal(group)"
                      class="h-12 px-6 bg-indigo-600 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 ml-auto shadow-lg shadow-indigo-100">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      連結使用者
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="lg:hidden p-6 sm:p-8 space-y-4">
            <div v-for="(group, gIdx) in filteredGroups" :key="group.owner_name"
              class="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:border-indigo-200 transition-all group active:scale-[0.98]">
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                  <div
                    class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-xl shadow-indigo-100">
                    {{ group.owner_name.charAt(0) }}
                  </div>
                  <div class="text-xl font-black text-slate-800 tracking-tighter">{{ group.owner_name }}</div>
                </div>
                <span class="h-10 px-4 flex items-center rounded-xl bg-amber-50 text-amber-600 text-xs font-black">{{
                  group.items.length }} 筆</span>
              </div>

              <div class="flex flex-wrap gap-2 mb-8">
                <span v-for="(item, idx) in group.items.slice(0, 3)" :key="idx"
                  class="px-2 py-1.5 rounded-lg text-[10px] font-bold bg-slate-50 text-slate-400 border border-slate-100 uppercase truncate max-w-[120px]">
                  {{ item.stock_name || item.stock_code }}
                </span>
                <div v-if="group.items.length > 3"
                  class="px-2 py-1.5 rounded-lg text-[10px] font-black bg-slate-900 text-white">+{{ group.items.length -
                    3 }}</div>
              </div>

              <button @click="openLinkModal(group)"
                class="w-full flex items-center justify-center h-14 bg-indigo-600 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                連結使用者帳戶
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Match Modal -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" @click="closeModal"></div>
        <div class="relative bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl animate-bounce-in overflow-hidden">
          <!-- Top Accent -->
          <div class="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

          <div class="p-8 sm:p-12">
            <div class="flex items-center justify-between mb-10">
              <div>
                <span class="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-1">Staging
                  暫存交接</span>
                <h3 class="text-4xl font-black text-slate-800 tracking-tighter">歸戶協作</h3>
              </div>
              <button @click="closeModal"
                class="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 hover:text-slate-800 transition-all">&times;</button>
            </div>

            <div
              class="p-8 rounded-[2rem] bg-indigo-50/50 border border-indigo-100 mb-10 group/owner relative overflow-hidden">
              <div
                class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover/owner:opacity-10 transition-opacity">
                <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              </div>
              <span class="text-[10px] font-black text-indigo-300 uppercase tracking-widest block mb-1">Source Dataset
                來源數據實體</span>
              <div class="text-3xl font-black text-indigo-950 tracking-tighter">{{ selectedGroup?.owner_name }}</div>
              <div
                class="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-lg bg-white border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-sm">
                {{ selectedGroup?.items.length }} 筆待處理紀錄
              </div>
            </div>

            <!-- User Search Section -->
            <div class="space-y-6">
              <div class="relative group">
                <span
                  class="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 group-focus-within:text-indigo-600 uppercase tracking-widest pointer-events-none transition-colors">Find
                  尋找對象:</span>
                <input v-model="userSearch" @input="searchUsers" type="text" placeholder="電子郵件或暱稱..."
                  class="w-full h-16 pl-28 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none" />
                <div v-if="searchingUsers" class="absolute right-6 top-1/2 -translate-y-1/2">
                  <svg class="animate-spin h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                </div>
              </div>

              <!-- User Search Results -->
              <div v-if="!targetUser" class="max-h-60 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                <div v-for="user in userResults" :key="user.id" @click="selectUser(user)"
                  class="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group transition-all cursor-pointer hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98]">
                  <div class="flex items-center gap-4">
                    <div
                      class="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {{ user.full_name?.charAt(0) || '?' }}
                    </div>
                    <div class="min-w-0">
                      <div class="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">
                        {{ user.full_name || '匿名用戶' }}
                        <span v-if="user.nickname" class="text-indigo-400 font-bold ml-1 text-xs">@{{ user.nickname
                        }}</span>
                      </div>
                      <div class="text-[9px] font-bold text-slate-300 uppercase leading-none">{{ user.email }}</div>
                    </div>
                  </div>
                  <svg class="w-4 h-4 text-slate-200 group-hover:text-indigo-600 transition-colors" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              <!-- Portfolio Choice -->
              <div v-else class="space-y-4 animate-bounce-in">
                <div
                  class="p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-100 flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-black text-xl">
                      {{ targetUser.email.charAt(0).toUpperCase() }}</div>
                    <div>
                      <div class="text-lg font-black tracking-tight leading-none mb-1">{{ targetUser.full_name ||
                        targetUser.email }}</div>
                      <div class="text-[10px] font-bold opacity-60 uppercase tracking-widest leading-none">Ready for
                        準備進行核對歸戶</div>
                    </div>
                  </div>
                  <button @click="targetUser = null; targetPortfolios = []; selectedPortfolioId = null"
                    class="h-10 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic underline">更改對象</button>
                </div>

                <div class="space-y-3">
                  <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest block ml-4">Select Target
                    選擇目標帳戶</span>
                  <div v-if="fetchingPortfolios" class="py-12 flex flex-col items-center gap-4">
                    <div class="w-8 h-8 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span
                      class="text-[10px] font-black text-indigo-300 uppercase tracking-widest animate-pulse">Scanning
                      正在掃描帳戶...</span>
                  </div>
                  <div v-else class="space-y-2">
                    <div v-for="port in targetPortfolios" :key="port.id" @click="selectedPortfolioId = port.id"
                      class="p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group"
                      :class="selectedPortfolioId === port.id ? 'border-indigo-600 bg-indigo-50 shadow-xl shadow-indigo-500/10' : 'border-slate-50 bg-slate-50/50 hover:border-indigo-200 hover:bg-white'">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all"
                          :class="selectedPortfolioId === port.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-300'">
                          {{ port.name.charAt(0) }}
                        </div>
                        <div class="text-sm font-black text-slate-700">{{ port.name }}</div>
                      </div>
                      <div v-if="port.is_default"
                        class="text-[9px] font-black text-indigo-400 uppercase bg-white border border-indigo-100 px-2 py-0.5 rounded shadow-sm">
                        主要帳戶</div>
                    </div>

                    <div v-if="targetPortfolios.length === 0" @click="selectedPortfolioId = 'NEW_DEFAULT'"
                      class="p-6 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer flex items-center justify-between"
                      :class="selectedPortfolioId === 'NEW_DEFAULT' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-slate-50/30 hover:border-indigo-200 hover:bg-white'">
                      <div class="flex items-center gap-4">
                        <div
                          class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-100 p-3">
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div class="text-left">
                          <div class="text-sm font-black text-slate-800 tracking-tight">建立主要帳戶</div>
                          <div class="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">偵測到新使用者
                          </div>
                        </div>
                      </div>
                      <div
                        class="w-6 h-6 rounded-full flex items-center justify-center transition-all bg-indigo-600 shadow-lg scale-0 opacity-0"
                        :class="{ 'scale-100 opacity-100': selectedPortfolioId === 'NEW_DEFAULT' }">
                        <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          stroke-width="4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-12 flex gap-4">
              <button @click="closeModal"
                class="flex-1 h-16 bg-slate-100 text-slate-400 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">放棄歸戶</button>
              <button @click="confirmLink" :disabled="linking"
                class="flex-[2] h-16 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-30 transition-all">
                {{ linking ? '歸戶對齊中...' : '確認完成核對歸戶' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import { useToast } from '@/composables/useToast'
import { supabase } from '@/lib/supabase'
import { computed, onMounted, ref } from 'vue'

const loading = ref(true)
const stagingItems = ref([])
const searchOwner = ref('')
const { showToast } = useToast()

const isModalOpen = ref(false)
const selectedGroup = ref(null)
const userSearch = ref('')
const userResults = ref([])
const searchingUsers = ref(false)
const targetUser = ref(null)
const targetPortfolios = ref([])
const fetchingPortfolios = ref(false)
const selectedPortfolioId = ref(null)
const linking = ref(false)

const stats = computed(() => {
  const pendingCount = stagingItems.value.length
  const uniqueOwners = new Set(stagingItems.value.map(i => i.owner_name)).size
  return { pendingCount, uniqueOwners }
})

const groupedStaging = computed(() => {
  const groups = {}
  stagingItems.value.forEach(item => {
    if (!groups[item.owner_name]) {
      groups[item.owner_name] = { owner_name: item.owner_name, items: [] }
    }
    groups[item.owner_name].items.push(item)
  })
  return Object.values(groups)
})

const filteredGroups = computed(() => {
  if (!searchOwner.value) return groupedStaging.value
  return groupedStaging.value.filter(g =>
    g.owner_name.toLowerCase().includes(searchOwner.value.toLowerCase())
  )
})

const fetchStagingData = async () => {
  loading.value = true
  let allData = []
  let from = 0
  const PAGE_SIZE = 1000
  let hasMore = true
  try {
    while (hasMore) {
      const { data, error } = await supabase
        .from('inventory_staging')
        .select('*')
        .eq('status', 'PENDING')
        .order('id')
        .range(from, from + PAGE_SIZE - 1)
      if (error) throw error
      if (data && data.length > 0) {
        allData = [...allData, ...data]
        if (data.length < PAGE_SIZE) hasMore = false
        else from += PAGE_SIZE
      } else hasMore = false
    }
    stagingItems.value = allData
  } catch (err) {
    showToast('載入資料失敗', 'error')
  } finally {
    loading.value = false
  }
}

let searchTimer
const searchUsers = () => {
  clearTimeout(searchTimer)
  if (!userSearch.value || userSearch.value.length < 2) {
    userResults.value = []
    return
  }
  searchingUsers.value = true
  searchTimer = setTimeout(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, nickname')
      .or(`email.ilike.%${userSearch.value}%,full_name.ilike.%${userSearch.value}%,nickname.ilike.%${userSearch.value}%`)
      .limit(10)
    if (!error) userResults.value = data
    searchingUsers.value = false
  }, 400)
}

const selectUser = async (user) => {
  targetUser.value = user
  fetchingPortfolios.value = true
  targetPortfolios.value = []
  selectedPortfolioId.value = null
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
    if (!error) {
      targetPortfolios.value = data || []
      const defaultPort = data?.find(p => p.is_default)
      if (defaultPort) selectedPortfolioId.value = defaultPort.id
      else if (data?.length > 0) selectedPortfolioId.value = data[0].id
      else selectedPortfolioId.value = 'NEW_DEFAULT'
    }
  } catch (err) {
    showToast('無法取得該用戶的帳戶清單', 'error')
  } finally {
    fetchingPortfolios.value = false
  }
}

const openLinkModal = (group) => {
  selectedGroup.value = group
  isModalOpen.value = true
  targetUser.value = null
  targetPortfolios.value = []
  selectedPortfolioId.value = null
  userSearch.value = ''
  userResults.value = []
}

const closeModal = () => {
  isModalOpen.value = false
  targetUser.value = null
  targetPortfolios.value = []
  selectedPortfolioId.value = null
}

const convenienceStoreCategoryId = ref(null)
const fetchCategoriesData = async () => {
  const { data } = await supabase.from('souvenir_categories').select('*')
  if (data) {
    const cat = data.find(c => c.name === '超商商品卡')
    if (cat) convenienceStoreCategoryId.value = cat.id
  }
}

const confirmLink = async () => {
  console.log('Confirm link triggered')
  if (!selectedGroup.value || !targetUser.value || !selectedPortfolioId.value) {
    console.warn('Missing required fields:', { 
      group: selectedGroup.value, 
      user: targetUser.value, 
      portfolio: selectedPortfolioId.value 
    })
    showToast('請先選擇目標使用者及帳戶（請點選其中一個帳戶卡片）', 'warning')
    return
  }
  
  linking.value = true
  try {
    const items = selectedGroup.value.items
    const userId = targetUser.value.id
    let portId = selectedPortfolioId.value
    console.log('Linking start:', { itemsCount: items.length, userId, portId })

    if (portId === 'NEW_DEFAULT') {
      const { data: newPort, error: portError } = await supabase.from('portfolios').insert({ user_id: userId, name: '本人', is_default: true }).select().single()
      if (portError) throw portError
      portId = newPort.id
      console.log('Created new portfolio:', portId)
    }

    const uniqueCombos = []
    const seen = new Set()
    items.forEach(item => {
      const key = `${item.stock_code}_${item.year}`
      if (!seen.has(key)) {
        seen.add(key)
        uniqueCombos.push({ code: item.stock_code, year: item.year, stock_name: item.stock_name })
      }
    })

    const codes = uniqueCombos.map(c => c.code)
    const { data: existingSouvenirs, error: fetchError } = await supabase.from('souvenirs').select('id, code, meeting_date').in('code', codes)
    if (fetchError) throw fetchError

    const souvenirMap = {}
    existingSouvenirs?.forEach(s => {
      const year = new Date(s.meeting_date).getFullYear()
      souvenirMap[`${s.code}_${year}`] = s.id
    })

    const missingCombos = uniqueCombos.filter(c => !souvenirMap[`${c.code}_${c.year}`])
    console.log('Missing combos to create:', missingCombos)

    if (missingCombos.length > 0) {
      // Check convenience store category id
      if (!convenienceStoreCategoryId.value) {
         console.warn('Convenience Store Category ID is missing, fetching...')
         await fetchCategoriesData()
      }
      
      const toInsert = missingCombos.map(c => ({
        code: c.code,
        name: c.stock_name || '未知公司',
        souvenir_item: '超商商品卡',
        meeting_date: `${c.year}-06-30`,
        category_id: convenienceStoreCategoryId.value,
        classification_status: 'system_matched',
        doc_id: `AUTO_${c.code}_${c.year}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
      }))
      
      const { data: createdData, error: createError } = await supabase.from('souvenirs').insert(toInsert).select('id, code, meeting_date')
      if (createError) throw createError
      
      createdData?.forEach(s => {
        const year = new Date(s.meeting_date).getFullYear()
        souvenirMap[`${s.code}_${year}`] = s.id
      })
    }

    const collectionsToUpsertMap = new Map()
    const inventoryToUpsertMap = new Map()

    items.forEach(item => {
      const souvenirId = souvenirMap[`${item.stock_code}_${item.year}`]
      if (souvenirId) {
        const collKey = `${portId}_${souvenirId}_holding`
        collectionsToUpsertMap.set(collKey, { user_id: userId, portfolio_id: portId, souvenir_id: souvenirId, status: 'holding' })
        
        const invKey = `${portId}_${item.stock_code}`
        inventoryToUpsertMap.set(invKey, { user_id: userId, portfolio_id: portId, stock_code: item.stock_code, stock_name: item.stock_name || '未知公司', updated_at: new Date().toISOString() })
      }
    })

    const collectionsToUpsert = Array.from(collectionsToUpsertMap.values())
    const inventoryToUpsert = Array.from(inventoryToUpsertMap.values())
    
    console.log('Upserting collections:', collectionsToUpsert.length)
    console.log('Upserting inventory:', inventoryToUpsert.length)

    if (collectionsToUpsert.length === 0) throw new Error('找不到可歸戶的紀念品資料')
    
    const { error: collError } = await supabase.from('user_collections').upsert(collectionsToUpsert, { onConflict: 'portfolio_id,souvenir_id' })
    if (collError) throw collError

    if (inventoryToUpsert.length > 0) {
      const { error: invError } = await supabase.from('user_inventory').upsert(inventoryToUpsert, { onConflict: 'portfolio_id,stock_code' })
      if (invError) throw invError
    }

    const { error: stageError } = await supabase.from('inventory_staging').update({ status: 'IMPORTED', matched_user_id: userId }).in('id', items.map(i => i.id))
    if (stageError) throw stageError

    showToast(`成功歸戶 ${items.length} 筆資料`, 'success')
    closeModal()
    await fetchStagingData()
  } catch (e) {
    console.error('Confirm Link Error:', e)
    showToast('歸戶過程發生錯誤: ' + (e.message || e), 'error')
  } finally {
    linking.value = false
  }
}

onMounted(() => {
  fetchStagingData()
  fetchCategoriesData()
})
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 2.25rem;
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

.delay-200 {
  animation-delay: 0.2s;
}
</style>
