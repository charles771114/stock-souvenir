---
name: vtest
description: Standardized testing utility for stock-souvenir project using Vitest. Provides patterns for mocking Supabase, testing Vue composables, and verifying unit logic.
---

# vtest Agent Skill

Use this skill when you need to write, run, or debug tests in the `stock-souvenir` project. This project uses **Vitest** and **Vue Test Utils** for unit testing.

> [!IMPORTANT]
> **Mandatory Verification Rule**: 
> 任何程式碼生成（Composables, Utils, Components）之後，皆「必須」先執行 `vtest` 進行檢查，確保邏輯正確並無 Regression。嚴禁在未經過 `npm run test:unit` 驗證的情況下交付代碼。

## Core Capabilities
- **Unit Testing**: Testing individual functions and logic.
- **Composable Testing**: Using `jsdom` environment to test Vue 3 Composition API.
- **Supabase Mocking**: Standard patterns for mocking database responses and authentication.

## Project-Specific Setup
The project defines a `test:unit` script in `package.json`:
```bash
npm run test:unit
```

### 🧪 Testing Composables
Since composables often use `ref`, `reactive`, and other Vue APIs, you MUST include the following at the top of your test file:
```javascript
/**
 * @vitest-environment jsdom
 */
```

### 🔗 Mocking Supabase
Most logic in this project depends on the Supabase client. Use `vi.mock` to intercept calls to `@/lib/supabase`.

**Standard Mock Template:**
```javascript
// Mocking Supabase client
const mockSupabase = {
  from: vi.fn(),
}

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

// Mocking useAuth (frequently needed)
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    user: ref({ id: 'test-user' }),
    isAuthenticated: ref(true),
    // ... other auth properties
  }),
}))
```

### 🛠️ Common Patterns for Database Queries
When testing database operations, you often need to mock a chain of calls (e.g., `from().select().eq().order()`):

```javascript
const mockData = [{ id: 1, name: 'Item' }]
const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null })
const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

mockSupabase.from.mockReturnValue({ select: mockSelect })
```

## 📈 專案開發補充 (Project-Specific Supplementary)

### 1. Composables 狀態測試
本專案大量使用 Composition API。測試時需驗證 `ref` 的值變化。
- **Tip**: 在測試函式中解構 return 值，並使用 `await` 等待非同步操作完成。
- **Verify**: 確保 `loading.value` 在請求期間為 `true`，結束後回到 `false`。

### 2. 多帳戶 (Portfolio) 系統模擬
許多功能（如收藏、目錄）都依賴 `usePortfolio` 中的 `currentPortfolioId`。
```javascript
vi.mock('@/composables/usePortfolio', () => ({
  usePortfolio: () => ({
    currentPortfolioId: ref('test-portfolio-id'),
    isCombinedView: ref(false),
    portfolios: ref([{ id: 'test-p-1', name: '帳戶1' }])
  }),
}))
```

### 3. 時間與日期邏輯
針對「緊迫程度 (Urgency)」與「最後買進日 (Last Buy Date)」的測試，應固定系統時間：
```javascript
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-06-01'))
})
afterEach(() => {
  vi.useRealTimers()
})
```

### 4. 前後端連動驗證
- **user_collections vs user_inventory**: 在測試 `addToCollection` (status: 'holding') 時，應同時驗證是否對 `user_inventory` 發起 `insert` 請求。
- **快取一致性**: 驗證 `fetchMyCollections` 在 `requestYear` 為非當年度時，是否正確從 `localStorage` 讀取快取。

---
*Created as part of the stock-souvenir development ecosystem.*
