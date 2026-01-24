<template>
  <footer class="mt-32 pb-16 relative z-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Decorative Line -->
      <div class="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-12 opacity-50"></div>
      
      <div class="flex flex-col md:flex-row justify-between items-center gap-10">
        <!-- Logo & Brand -->
        <div class="flex flex-col items-center md:items-start group/brand">
          <div class="flex items-center gap-3 mb-3 cursor-default">
            <div class="h-9 w-9 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-200/50 group-hover/brand:rotate-12 transition-transform duration-500">
               <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <span class="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 tracking-tighter uppercase">Stock Souvenir</span>
          </div>
          <p class="text-xs text-gray-400 font-black uppercase tracking-widest text-center md:text-left">
            Your Premium Souvenir Curator
          </p>
        </div>

        <!-- Links (Modern Pill Style) -->
        <div class="flex bg-gray-50/50 p-1 rounded-2xl border border-gray-100 backdrop-blur-sm">
          <router-link to="/gifts" class="px-5 py-2 text-[10px] font-black text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all uppercase tracking-widest">Catalog</router-link>
          <router-link to="/my-collections" class="px-5 py-2 text-[10px] font-black text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all uppercase tracking-widest">Collection</router-link>
          <router-link to="/inventory" class="px-5 py-2 text-[10px] font-black text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all uppercase tracking-widest">Inventory</router-link>
        </div>

        <!-- Privacy & Social Placeholder -->
        <div class="flex flex-col items-center md:items-end gap-2">
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] opacity-60">
                &copy; {{ new Date().getFullYear() }} Antigravity Pro
            </div>
            <div class="h-1 w-8 bg-indigo-500 rounded-full"></div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Footer component logic if any
</script>
