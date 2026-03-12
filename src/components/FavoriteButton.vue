<template>
  <div class="inline-flex flex-col sm:flex-row gap-3 relative min-h-[48px]">
    <transition-group
      name="btn-fade"
      tag="div"
      class="flex flex-col sm:flex-row gap-3 w-full"
    >
      <!-- Plan/Tracking Button -->
      <button
        v-if="!isInInventory && !isConfirming"
        key="track-btn"
        @click.stop="$emit('toggle')"
        :disabled="disabled || loading || inventoryLoading"
        class="favorite-btn track-btn flex-1"
        :class="[
          isActive ? 'active' : 'inactive',
          (disabled || loading || inventoryLoading) ? 'opacity-50 cursor-not-allowed' : ''
        ]"
        :title="isActive ? '取消追蹤' : '加入追蹤清單'"
      >
        <i v-if="loading" class="ri-loader-4-line animate-spin text-xl"></i>
        <i v-else :class="[isActive ? 'ri-eye-fill' : 'ri-eye-line', 'text-xl']"></i>
        <span>{{ isActive ? '追蹤中' : '追蹤' }}</span>
      </button>

      <!-- Direct Add to Inventory Button -->
      <button
        key="inventory-btn"
        @click.stop="handleInventoryClick"
        :disabled="disabled || loading || inventoryLoading"
        class="favorite-btn inventory-btn group/inv flex-1"
        :class="[
          isConfirming ? 'confirming animate-pulse' : isInInventory ? 'in-inventory' : 'out-inventory',
          (disabled || loading || inventoryLoading) ? 'opacity-50 cursor-not-allowed' : ''
        ]"
        :title="isConfirming ? '點擊確認移除' : isInInventory ? '從庫存移除' : '直接加入目前持有庫存'"
      >
        <i v-if="inventoryLoading" class="ri-loader-4-line animate-spin text-xl"></i>
        <template v-else>
          <!-- Confirmation Icon -->
          <i v-if="isConfirming" class="ri-error-warning-fill text-xl"></i>
          
          <!-- In Inventory State Icons -->
          <i v-else-if="isInInventory" class="ri-checkbox-circle-fill text-xl group-hover/inv:hidden"></i>
          <i v-else-if="isInInventory" class="ri-delete-bin-line text-xl hidden group-hover/inv:inline-block"></i>
          
          <!-- Default State Icon -->
          <i v-else class="ri-add-line text-xl"></i>
        </template>
        
        <span>
          <template v-if="isConfirming">確定移除？</template>
          <template v-else-if="isInInventory">
            <span class="group-hover/inv:hidden">在庫存中</span>
            <span class="hidden group-hover/inv:inline">移除庫存</span>
          </template>
          <template v-else>加入庫存</template>
        </span>
      </button>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'

const props = defineProps({
  gift: Object,
  isActive: Boolean,
  disabled: Boolean,
  loading: Boolean,
  inventoryLoading: Boolean,
  isInInventory: Boolean
})

const emit = defineEmits(['toggle', 'toggle-inventory'])

const isConfirming = ref(false)
let confirmTimer = null

const handleInventoryClick = () => {
  if (props.disabled || props.loading || props.inventoryLoading) return

  if (props.isInInventory) {
    if (isConfirming.value) {
      // Second click: Execute removal
      emit('toggle-inventory')
      clearConfirm()
    } else {
      // First click: Enter confirming state
      isConfirming.value = true
      confirmTimer = setTimeout(() => {
        isConfirming.value = false
      }, 3000) // Reset after 3 seconds
    }
  } else {
    // Normal add to inventory
    emit('toggle-inventory')
  }
}

const clearConfirm = () => {
  isConfirming.value = false
  if (confirmTimer) {
    clearTimeout(confirmTimer)
    confirmTimer = null
  }
}

onBeforeUnmount(() => {
  clearConfirm()
})
</script>

<style scoped>
.favorite-btn {
  @apply relative inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-base font-black uppercase tracking-widest transition-all duration-500 border border-transparent shadow-sm min-h-[56px];
}

/* Track Button States */
.track-btn.active {
  background-color: var(--brand-secondary);
  @apply text-white shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-95;
}

.track-btn.inactive {
  @apply bg-slate-50 text-slate-400 border-slate-100 hover:border-amber-200 hover:text-brand-primary hover:bg-white hover:shadow-md;
}

/* Inventory Button States */
.inventory-btn.confirming {
  background-color: var(--status-error);
  @apply text-white shadow-lg shadow-rose-200 animate-pulse;
}

.inventory-btn.in-inventory {
  background-color: var(--status-success);
  @apply text-white shadow-lg shadow-emerald-200 hover:scale-[1.02] active:scale-95;
}

.inventory-btn.in-inventory:hover {
  background-color: var(--status-error);
  @apply shadow-rose-300;
}

.inventory-btn.out-inventory {
  @apply bg-amber-50 text-brand-primary border-amber-100 hover:border-amber-300 hover:bg-amber-100 hover:shadow-md;
}

.btn-fade-enter-active,
.btn-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-fade-enter-from,
.btn-fade-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}

.btn-fade-move {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.animate-pulse {
  animation: pulse 1s infinite cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
