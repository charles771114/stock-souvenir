<template>
  <div class="app-wrapper">
    <!-- <Loading /> -->
    <Header />
    <div class="main">
      <AppMain />
    </div>
  </div>
</template>

<script>
// import Loading from '@/components/Loading.vue'
import AppMain from '@/layout/components/AppMain.vue'
import Header from '@/layout/components/Header.vue'
import Sidebar from '@/layout/components/Sidebar.vue'
// import NavigationBar from '@/layout/components/NavigationBar.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Layout',
  components: {
    // Loading,
    AppMain,
    Header,
    Sidebar
    // NavigationBar
  }
})
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  // height: 100%;
  // width: 100%;
}
</style>
