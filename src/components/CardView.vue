<template>
  <div class="flex flex-col space-y-3">
    <GiftRow
      v-for="item in items"
      :key="item.number"
      :item="item"
      :isExpired="isExpired"
    />
  </div>
</template>

<script setup>
import GiftRow from './GiftRow.vue'

defineProps({
  items: Array,
  isExpired: Function,
})
</script>
