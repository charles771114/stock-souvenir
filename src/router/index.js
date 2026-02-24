import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/lib/supabase'
import { createRouter, createWebHistory } from 'vue-router'

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
    path: '/today',
    name: 'TodayHighlights',
    component: () => import('@/views/TodayHighlightsView.vue'),
    meta: { requiresAuth: false } // Or true depending on if it needs auth
  },
  {
    path: '/my-collections',
    name: 'MyCollections',
    component: () => import('@/views/MyCollections.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('@/views/InventoryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    redirect: '/admin/scraper'
  },

  {
    path: '/admin/settings',
    redirect: '/admin/users'
  },
  {
    path: '/admin/panel',
    name: 'AdminPanel',
    component: () => import('@/views/AdminPanel.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/favorites',
    name: 'AdminUserFavorites',
    component: () => import('@/views/AdminUserFavorites.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/classification',
    name: 'ClassificationCenter',
    component: () => import('@/views/admin/ClassificationCenterView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  // Retrofit old routes to redirect
  {
    path: '/admin/categories',
    redirect: '/admin/classification'
  },
  {
    path: '/admin/review',
    redirect: '/admin/classification'
  },
  {
    path: '/admin/import',
    name: 'AdminImport',
    component: () => import('@/views/admin/DataImportView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/import/inventory',
    name: 'InventoryImport',
    component: () => import('@/views/admin/InventoryImportView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/staging',
    name: 'InventoryStaging',
    component: () => import('@/views/admin/InventoryStagingView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: () => import('@/views/admin/UserManagementView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/line-groups',
    name: 'LineGroupManagement',
    component: () => import('@/views/admin/LineGroupManagementView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/scraper',
    name: 'ScraperManagement',
    component: () => import('@/views/admin/ScraperManagementView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/inventory',
    name: 'AdminInventoryManagement',
    component: () => import('@/views/admin/AdminInventoryManagementView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/souvenirs',
    name: 'SouvenirManagement',
    component: () => import('@/views/admin/SouvenirManagementView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/notifications',
    name: 'NotificationManagement',
    component: () => import('@/views/admin/NotificationManagementView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/import/souvenirs',
    name: 'SouvenirBulkImport',
    component: () => import('@/views/admin/SouvenirImportView.vue'),
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
  // Ensure auth is initialized
  const { initAuth, user: authUser } = useAuth()
  try {
    await initAuth()
    // If authUser is populated, we have a session
    if (authUser.value) {
      const { data } = await supabase.auth.getSession()
      session = data.session
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.warn('Router checking session failed:', e)
    }
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
