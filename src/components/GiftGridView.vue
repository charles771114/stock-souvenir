<template>
  <div class="w-full">
    <transition-group 
      name="list" 
      tag="div" 
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <div v-for="item in items" :key="item.id" class="h-full">
        <GiftCard 
          :gift="item" 
          :isExpired="isExpired"
          :disabled="disabled"
          @toggle-collection="$emit('toggle-collection', item)"
        />
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import GiftCard from './GiftCard.vue';

defineProps({
  items: {
    type: Array,
    required: true
  },
  isExpired: {
    type: Function,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-collection'])
</script>

<style scoped>
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* ensure leaving items are taken out of layout flow so others can move smoothly */
.list-leave-active {
  position: absolute;
  width: 100%; /* Important for grid layout */
  z-index: -1;
}
</style>
