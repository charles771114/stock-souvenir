import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFavoriteStore = defineStore('favorite', () => {
  const lists = ref([{ name: 'R', creator: '你', items: [] }])
  const currentIndex = ref(0)

  function toggleFavorite(gift) {
    const currentList = lists.value[currentIndex.value]
    const exists = currentList.items.find((i) => i.number === gift.number)
    if (exists) {
      currentList.items = currentList.items.filter(
        (i) => i.number !== gift.number
      )
    } else {
      currentList.items.push(gift)
    }
  }

  function isFavorite(gift) {
    return lists.value[currentIndex.value].items.some(
      (i) => i.number === gift.number
    )
  }

  function addList(name, creator) {
    lists.value.push({ name, creator, items: [] })
    currentIndex.value = lists.value.length - 1
  }

  return { lists, currentIndex, toggleFavorite, isFavorite, addList }
})
