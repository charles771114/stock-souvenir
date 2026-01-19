import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'

const routes = [
  {
    path: '/',
    redirect: '/gifts'
  },
  {
    path: '/login',
    redirect: to => {
      return { path: '/', query: { auth: 'login' } }
    }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('@/views/AuthCallback.vue')
  },
  {
    path: '/gifts',
    name: 'GiftCatalog',
    component: () => import('@/views/GiftCatalog.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/my-collections',
    name: 'MyCollections',
    component: () => import('@/views/MyCollections.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    redirect: '/admin/scraper'
  },
  {
    path: '/admin/scraper',
    name: 'ScraperManager',
    component: () => import('@/views/ScraperManager.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    component: () => import('@/views/AdminSettings.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/panel',
    name: 'AdminPanel',
    component: () => import('@/views/AdminPanel.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/gifts'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守衛
router.beforeEach(async (to, from, next) => {
  let session = null
  try {
    const { data } = await supabase.auth.getSession()
    session = data.session
  } catch (e) {
    console.warn('Router checking session failed:', e)
  }

  // 1. 處理需要 Auth 的頁面
  if (to.meta.requiresAuth && !session) {
    return next({ path: '/', query: { auth: 'login' } })
  }

  // 2. 處理 Guests Only 頁面 (如 Login)
  // 如果已登入且嘗試訪問 Login 頁面，導向首頁 (GiftCatalog) 或 Admin 頁面
  if (to.meta.requiresGuest && session) {
    return next('/gifts')
  }

  // 3. 處理需要 Admin 權限的頁面
  if (to.meta.requiresAdmin && session) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()

      if (error) {
        console.error('取得用戶資料失敗:', error)
        return next('/gifts')
      }

      const isAdmin = profile?.role === 'admin'

      if (!isAdmin) {
        console.warn('非 admin 用戶嘗試訪問 admin 頁面')
        return next('/gifts')
      }
    } catch (error) {
      console.error('路由守衛錯誤:', error)
      return next('/gifts')
    }
  }

  next()
})

export default router
