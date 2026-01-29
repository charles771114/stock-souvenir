import { onMounted, onUnmounted, ref } from 'vue'

export function usePullRefresh(onRefresh, options = {}) {
  const {
    threshold = 80,
    resistance = 2.5
  } = options

  const pullDistance = ref(0)
  const isRefreshing = ref(false)
  const isPulling = ref(false)
  
  let startY = 0
  let currentY = 0

  const handleTouchStart = (e) => {
    // Only allow pull to refresh when at the top of the page
    if (window.scrollY > 0 || isRefreshing.value) return
    
    startY = e.touches[0].pageY
    isPulling.value = true
  }

  const handleTouchMove = (e) => {
    if (!isPulling.value || isRefreshing.value) return
    
    currentY = e.touches[0].pageY
    const diff = currentY - startY
    
    // Only track downward pulls
    if (diff > 0) {
      // Apply resistance to make it feel more natural
      pullDistance.value = Math.pow(diff, 0.85) * (resistance / 2)
      
      // Prevent scrolling while pulling
      if (pullDistance.value > 10 && e.cancelable) {
        e.preventDefault()
      }
    } else {
      pullDistance.value = 0
    }
  }

  const handleTouchEnd = async () => {
    if (!isPulling.value || isRefreshing.value) return
    
    isPulling.value = false
    
    if (pullDistance.value >= threshold) {
      isRefreshing.value = true
      pullDistance.value = threshold // Keep it at threshold while refreshing
      
      try {
        await onRefresh()
      } finally {
        // Animation delay for smooth return
        setTimeout(() => {
          isRefreshing.value = false
          pullDistance.value = 0
        }, 300)
      }
    } else {
      pullDistance.value = 0
    }
  }

  onMounted(() => {
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
  })

  onUnmounted(() => {
    window.removeEventListener('touchstart', handleTouchStart)
    window.removeEventListener('touchmove', handleTouchMove)
    window.removeEventListener('touchend', handleTouchEnd)
  })

  return {
    pullDistance,
    isRefreshing,
    isPulling
  }
}
