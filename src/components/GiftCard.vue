<template>
  <div class="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full transform hover:-translate-y-1">
    <div class="p-6 flex flex-col h-full relative overflow-hidden">
      <!-- Decorative Gradient Blob -->
      <div class="absolute top-[-50px] right-[-50px] w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
      
      <!-- Header -->
      <div class="flex justify-between items-start mb-4 relative z-10">
        <div>
           <div class="flex items-center space-x-2">
               <span class="text-xs font-bold tracking-wider text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">{{ gift.code }}</span>
               <h3 class="text-xl font-bold text-gray-900 tracking-tight">{{ gift.name }}</h3>
           </div>
           <p class="text-xs text-gray-400 mt-1" v-if="gift.meeting_date">股東會: {{ formatDate(gift.meeting_date) }}</p>
        </div>
        <span 
          :class="[
            'text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border',
            gift.odd_lot 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
              : 'bg-gray-50 text-gray-500 border-gray-100'
          ]"
        >
          {{ gift.odd_lot ? '零股可領' : '限整股' }}
        </span>
      </div>

      <!-- Souvenir Name -->
      <div class="mb-6 flex-grow relative z-10">
        <h4 class="text-sm text-gray-500 mb-1 font-medium">紀念品</h4>
        <p class="text-base text-gray-800 font-semibold line-clamp-2" :title="gift.souvenir_item">
          {{ gift.souvenir_item || '尚未公佈' }}
        </p>
      </div>

      <!-- Last Buy Date (Urgency) -->
      <div class="mt-auto pt-4 border-t border-gray-50 relative z-10">
        <div class="flex justify-between items-end mb-4">
             <div>
                 <p class="text-xs text-gray-400 font-medium">最後買進日</p>
                 <p class="text-sm font-bold mt-0.5" :class="isUrgent(gift.last_buy_date) ? 'text-rose-500' : 'text-gray-700'">
                     {{ formatDate(gift.last_buy_date) || '未定' }}
                 </p>
             </div>
             <div v-if="isUrgent(gift.last_buy_date)" class="animate-pulse">
                 <span class="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1"></span>
                 <span class="text-xs text-rose-500 font-bold">即將截止</span>
             </div>
        </div>

        <!-- Action Button -->
        <button
          @click.stop="toggleCollection"
          :class="[
            'w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2',
            isCollected
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-purple-700'
          ]"
        >
          <svg v-if="isCollected" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
             <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          <span v-else>＋</span>
          <span>{{ isCollected ? '已收藏' : '加入清單' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  gift: {
    type: Object,
    required: true
  },
  isCollected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-collection'])

const formatDate = (dateString, format = 'YYYY-MM-DD') => {
  if (!dateString) return ''
  // Simple check for YYYY-MM-DD format validity
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  return dateString // Assuming input is YYYY-MM-DD, just return it. Or format properly.
}

const isUrgent = (dateString) => {
  if (!dateString) return false
  const target = new Date(dateString)
  const now = new Date()
  const diffTime = target - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 7 && diffDays >= 0
}

const toggleCollection = () => {
  emit('toggle-collection', props.gift)
}
</script>
