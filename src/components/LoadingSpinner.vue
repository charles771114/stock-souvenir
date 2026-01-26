<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <!-- Premium Multi-Layer Spinner -->
    <div class="relative" :class="sizeClass">
      <!-- Outer Ring - Slow Gradient Rotation -->
      <div 
        class="absolute inset-0 rounded-full border-2 border-transparent animate-spin-slow"
        :class="outerRingClass"
        style="background: linear-gradient(135deg, transparent 50%, currentColor 50%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; padding: 2px;"
      ></div>
      
      <!-- Middle Ring - Counter Rotation -->
      <div 
        class="absolute inset-1 rounded-full border-2 border-transparent animate-spin-reverse"
        :class="middleRingClass"
        style="background: linear-gradient(-135deg, transparent 60%, currentColor 60%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; padding: 2px;"
      ></div>
      
      <!-- Inner Circle - Pulsing Glow -->
      <div 
        class="absolute inset-2 rounded-full animate-pulse-glow"
        :class="innerGlowClass"
      ></div>
      
      <!-- Center Dot -->
      <div 
        class="absolute inset-0 flex items-center justify-center"
      >
        <div 
          class="rounded-full animate-ping-slow"
          :class="centerDotClass"
        ></div>
      </div>
    </div>
    
    <!-- Optional Text -->
    <span v-if="text" class="ml-3 text-gray-600 font-medium" :class="textClass">{{ text }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  variant: {
    type: String,
    default: 'gradient',
    validator: (value) => ['gradient', 'simple', 'dots'].includes(value)
  },
  text: {
    type: String,
    default: ''
  }
})

const sizeClass = computed(() => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20'
  }
  return sizes[props.size]
})

const containerClass = computed(() => {
  return props.variant === 'dots' ? 'gap-1' : ''
})

const outerRingClass = computed(() => {
  return 'text-indigo-500'
})

const middleRingClass = computed(() => {
  return 'text-purple-400'
})

const innerGlowClass = computed(() => {
  return 'bg-gradient-to-br from-indigo-400/30 to-purple-500/30'
})

const centerDotClass = computed(() => {
  const sizes = {
    sm: 'h-1 w-1',
    md: 'h-1.5 w-1.5',
    lg: 'h-2 w-2',
    xl: 'h-3 w-3'
  }
  return `${sizes[props.size]} bg-indigo-600`
})

const textClass = computed(() => {
  const sizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }
  return sizes[props.size]
})
</script>

<style scoped>
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes spin-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes ping-slow {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

.animate-spin-reverse {
  animation: spin-reverse 2s linear infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

.animate-ping-slow {
  animation: ping-slow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
