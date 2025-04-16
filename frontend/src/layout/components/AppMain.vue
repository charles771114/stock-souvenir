<template>
  <section class="fixed-menu-layout__content container">
    <router-view v-slot="{ Component }">
      <transition name="scale-slide">
        <component :is="Component" />
      </transition>
    </router-view>
  </section>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'AppMain',
  components: {
  },
  setup () {
    const router = useRouter()

    const key = computed(() => {
      return router.path
    })

    return {
      key
    }
  }
})
</script>

<style lang="scss" scoped>
.scale-slide-enter-active,
.scale-slide-leave-active {
  position: absolute;
  transition: all 1.2s;
}

.scale-slide-enter-from {
  left: -100%;
}

.scale-slide-enter-to {
  left: 0%;
  width: 100%;
}

.scale-slide-leave-from {
  transform: scale(1);
  opacity: 1;
}

.scale-slide-leave-to {
  transform: scale(0.8);
  opacity: 0;
}
</style>
