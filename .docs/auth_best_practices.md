# Supabase Google OAuth Best Practices (Vue 3 Edition)

本指南說明在生產環境中實作 Supabase Google OAuth 登入的最佳實踐，涵蓋多環境設定、安全性 (PKCE)、錯誤處理與 Session 管理。

## 1. 核心概念與最佳實踐

### A. 多環境 Redirect URL 處理
不要寫死 `localhost:5173` 或正式域名。應根據環境變數動態決定。

**最佳實踐：**
*   **本地開發 (Local)**: `http://localhost:5173/auth/callback`
*   **正式環境 (Production)**: `https://your-domain.com/auth/callback`
*   **Supabase 設定**: 在 Authentication > URL Configuration > Redirect URLs 中必須把這兩個網址都加入白名單。

### B. 安全性考量 (PKCE & State)
*   **PKCE (Proof Key for Code Exchange)**: Supabase JS Client v2 預設已啟用 PKCE (Flow Type: `pkce`)。這比傳統的 Implicit Flow 更安全，能防止 Authorization Code 攔截攻擊。
    *   *Action*: 確保 `createClient` 初始化時不要刻意停用它。
*   **State Parameter**: 用於防止 CSRF 攻擊，或在 Redirect 後恢復使用者狀態（例如：登入前在瀏覽的頁面）。
    *   *Action*: 在 `signInWithOAuth` 的 `options.queryParams` 中可帶入自定義數據，或使用 `options.skipBrowserRedirect` 自行處理轉跳。

### C. 錯誤處理機制
OAuth 流程中最常見的錯誤發生在 **Callback 階段**：
1.  **使用者取消授權**：需要優雅地提示，而不是拋出紅字錯誤。
2.  **Email 已被註冊**：若同一個 Email 已用 Email/Password 註冊，Google 登入可能會失敗（視專案設定而定）。
3.  **Hash 解析失敗**：Supabase Client 會自動解析 URL hash，但若失敗需有 fallback。

### D. Session 管理
*   使用 `onAuthStateChange` 監聽器是同步 UI 狀態的黃金標準。
*   不要依賴 `localStorage` 手動存取 Token，讓 Supabase Client 自動處理。

---

## 2. 完整 Vue 3 實作範例

以下提供一個模組化、可複用的實作。

### Step 1: 環境變數設定 (.env)
```ini
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
# 自動偵測目前網址，或指定固定網址
VITE_SITE_URL=http://localhost:5173
```

### Step 2: 封裝 Composable (`useAuth.ts`)

這個 Composable 負責處理與 Supabase 的交互邏輯。

```typescript
import { ref, computed } from 'vue'
import { createClient } from '@supabase/supabase-js'

// 初始化 Client (建議放在獨立的 lib/supabase.ts)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Global State (保持狀態在組件間共享)
const user = ref(null)
const session = ref(null)
const loading = ref(false)

export function useAuth() {
  
  /**
   * Google 登入 (Redirect 模式)
   * 支援 redirectTo 參數，登入後可跳轉回指定頁面
   */
  const loginWithGoogle = async (redirectTo = '/dashboard') => {
    loading.value = true
    try {
      // 1. 動態建構 Callback URL
      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin
      const callbackUrl = `${siteUrl}/auth/callback`

      // 2. 呼叫 Supabase
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          // 透過 queryParams 傳遞登入後要導向的目標路由 (State 的一種應用)
          queryParams: {
            next: redirectTo
          }
        }
      })
      
      if (error) throw error
    } catch (e) {
      console.error('Google Login Error:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * 登出
   */
  const logout = async () => {
    loading.value = true
    const { error } = await supabase.auth.signOut()
    if (!error) {
      user.value = null
      session.value = null
    }
    loading.value = false
  }

  /**
   * 初始化監聽器 (建議在 App.vue onMounted 呼叫)
   */
  const initAuthListener = () => {
    // 1. 取得初始 Session
    supabase.auth.getSession().then(({ data }) => {
      session.value = data.session
      user.value = data.session?.user ?? null
    })

    // 2. 監聽狀態變化 (登入、登出、Token 更新)
    supabase.auth.onAuthStateChange((_event, _session) => {
      session.value = _session
      user.value = _session?.user ?? null
      
      // 處理特殊事件
      if (_event === 'SIGNED_OUT') {
        // 清理其他狀態 (如 pinia store)
        window.location.href = '/' // 強制刷新以確保狀態乾淨
      }
    })
  }

  return {
    user,
    session,
    loading,
    loginWithGoogle,
    logout,
    initAuthListener,
    isAuthenticated: computed(() => !!user.value)
  }
}
```

### Step 3: Callback 處理頁面 (`views/AuthCallback.vue`)

這是一個專門處理登入後回調的中轉頁面。它負責：
1. 等待 Supabase 解析 URL 中的 Code (PKCE flow)
2. 建立 Session
3. 根據 `next` 參數導向目標頁面

```vue
<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div v-if="error" class="text-red-600">
        <h3 class="text-lg font-bold">登入失敗</h3>
        <p>{{ error }}</p>
        <button @click="router.push('/login')" class="mt-4 text-blue-500 underline">返回登入</button>
      </div>
      <div v-else>
        <svg class="w-10 h-10 mx-auto animate-spin text-indigo-600" viewBox="0 0 24 24">
          <!-- Spinner Icon -->
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-2 text-gray-600">正在驗證身分...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase' // 引用上方定義的 client

const router = useRouter()
const error = ref(null)

onMounted(async () => {
  try {
    // Supabase 雖然會自動處理 hash，但為了確保 Session 建立完成，我們手動檢查一次
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) throw sessionError

    if (session) {
      // 成功！檢查是否有 'next' 參數要轉跳 (從 useAuth 傳來的)
      // 注意：params 通常在 hash 或 query 中，視 flow 而定
      // 這裡簡單示範預設轉跳
      
      // 進階：從 User Metadata 判斷是否為首次登入
      // const isNewUser = session.user.created_at === session.user.last_sign_in_at
      
      router.replace('/dashboard') 
    } else {
      // PKCE Flow 有時需要一點時間交換 Code， Supabase Client 其實在背景處理中。
      // 通常我們只需監聽 onAuthStateChange，但此頁面確保 UI 狀態正確。
      
      // 如果是用戶手動重新整理此頁，可能導致 code 失效，導回首頁
      setTimeout(() => {
         if (!error.value) router.replace('/')
      }, 3000)
    }
  } catch (e) {
    console.error('Callback Error:', e)
    error.value = e.message || '驗證過程發生未預期的錯誤'
  }
})
</script>
```

### Step 4: 路由設定 (Router)

```javascript
// router/index.js
const routes = [
  { path: '/login', component: Login },
  { path: '/auth/callback', component: AuthCallback }, // 必須與 redirect URL 一致
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } }
]
```

## 3. 常見問題排查

| 問題 | 可能原因 | 解法 |
|:--- |:--- |:--- |
| **Redirect mismatch** | 開發環境與 Supabase 設定不符 | 檢查 `.env` 的 URL 與 Supabase Dashboard > Auth > URL Configuration 是否完全一致（包含結尾 slash）。 |
| **Login loop** | AuthCallback 頁面邏輯錯誤 | 確保 Callback 頁面不要再次觸發 `signInWithOAuth`，且 Session 建立後應使用 `router.replace` 離開。 |
| **Token 無效** | Anon Key 錯誤或專案 ID 不對 | 檢查 `.env` 變數是否正確載入。 |

---
此架構遵循了目前 Vue 3 + Supabase 社群最推薦的實作方式，兼顧了安全性與開發體驗。
