<template>
  <button @click="toggle" class="text-pink-500 text-xl hover:scale-110 duration-150">
    {{ isFavorite(gift) ? '💖' : '🤍' }}
  </button>
</template>

<script setup>
import { useFavoriteStore } from '@/stores/favorite'

const props = defineProps({ gift: Object })
const store = useFavoriteStore()

const toggle = () => store.toggleFavorite(props.gift)
const isFavorite = store.isFavorite
</script>
