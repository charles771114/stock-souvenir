<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true">
      <div class="flex min-h-screen items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-indigo-950/40 backdrop-blur-xl transition-all duration-500" @click="close"></div>

        <!-- Modal Content -->
        <div class="relative bg-white border border-white/50 shadow-2xl w-full max-w-md rounded-[2.5rem] overflow-hidden animate-modal-scale">
          <div class="p-8">
            <h3 class="text-2xl font-black text-gray-900 tracking-tighter mb-2">轉移分身帳戶</h3>
            <p class="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-8">選擇目標帳戶以移動資料</p>

            <div v-if="item" class="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/30 mb-8 flex items-center gap-4">
              <span class="font-mono text-[10px] font-black px-2 py-1 bg-white rounded-lg text-indigo-600 border border-indigo-100">
                {{ item.souvenir?.code }}
              </span>
              <span class="text-sm font-black text-gray-700">{{ item.souvenir?.name }}</span>
            </div>

            <div class="space-y-3">
              <button
                v-for="portfolio in portfolios"
                :key="portfolio.id"
                @click="selectedPortfolioId = portfolio.id"
                class="w-full flex items-center justify-between p-5 rounded-3xl border-2 transition-all group"
                :class="selectedPortfolioId === portfolio.id 
                  ? 'border-indigo-500 bg-indigo-50/50 shadow-lg shadow-indigo-500/10' 
                  : 'border-slate-50 bg-slate-50/30 hover:bg-white hover:border-indigo-200'"
              >
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all"
                    :class="selectedPortfolioId === portfolio.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 group-hover:text-indigo-400'">
                    {{ portfolio.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="text-sm font-black text-gray-900">{{ portfolio.name }}</div>
                    <div v-if="portfolio.is_default" class="text-[9px] font-black text-indigo-400 uppercase tracking-widest">預設帳戶</div>
                  </div>
                </div>
                <div v-if="selectedPortfolioId === portfolio.id" class="text-indigo-600">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          <div class="bg-slate-50 p-6 flex gap-4">
            <button @click="close" class="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
              取消
            </button>
            <button 
              @click="confirm" 
              :disabled="!selectedPortfolioId || loading || selectedPortfolioId === item?.portfolio_id"
              class="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {{ loading ? '轉移中...' : '確認轉移' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { usePortfolio } from '@/composables/usePortfolio'
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  item: Object,
  loading: Boolean
})

const emit = defineEmits(['close', 'confirm'])
const { portfolios } = usePortfolio()

const selectedPortfolioId = ref(null)

watch(() => props.isOpen, (val) => {
  if (val && props.item) {
    selectedPortfolioId.value = props.item.portfolio_id
  }
})

const close = () => {
  emit('close')
}

const confirm = () => {
  if (selectedPortfolioId.value && selectedPortfolioId.value !== props.item?.portfolio_id) {
    emit('confirm', selectedPortfolioId.value)
  }
}
</script>

<style scoped>
@keyframes modalScale {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modal-scale {
  animation: modalScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
</style>
