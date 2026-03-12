import { useAuth } from '@/composables/useAuth'
import { usePortfolio } from '@/composables/usePortfolio'
import { supabase } from '@/lib/supabase'
import { ref } from 'vue'
import { useLocalStorageCache } from './useLocalStorageCache'

export function useCollection() {
    const collection = ref([])
    const loading = ref(false)
    const error = ref(null)

    const { user } = useAuth()
    const { currentPortfolioId, isCombinedView } = usePortfolio()
    const cache = useLocalStorageCache()

    /**
     * 取得庫存指紋（最後更新時間）- 更新為使用 user_inventory表
     */
    const getInventoryFingerprint = async () => {
        if (!user.value) return null
        try {
            // 檢查使用者持股的最近變動
            let query = supabase
                .from('user_inventory')
                .select('updated_at')

            if (isCombinedView.value) {
                query = query.eq('user_id', user.value.id)
            } else if (currentPortfolioId.value) {
                query = query.eq('portfolio_id', currentPortfolioId.value)
            } else {
                return null
            }

            const { data: invUpdate } = await query
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            return invUpdate?.updated_at || 'initial'
        } catch (e) {
            console.warn('Get inventory fingerprint failed:', e)
            return null
        }
    }

    const fetchAllInventory = async (forceRefresh = false) => {
        if (!user.value) return

        loading.value = true
        error.value = null

        try {
            const currentId = isCombinedView.value ? 'combined' : currentPortfolioId.value
            if (!currentId) {
                collection.value = []
                return { data: [] }
            }

            const cacheKey = `inventory:${user.value.id}:${currentId}`
            const cachedEntry = cache.getWithMetadata(cacheKey)

            // Step 1: Check cache if not forcing refresh
            if (!forceRefresh) {
                const fingerprint = await getInventoryFingerprint()
                if (cachedEntry && cachedEntry.fingerprint === fingerprint) {
                    collection.value = cachedEntry.data
                    loading.value = false
                    return { data: cachedEntry.data, fromCache: true }
                }
            }

            // Step 2: Fetch from DB
            let query = supabase
                .from('user_inventory')
                .select('*')

            if (isCombinedView.value) {
                query = query.eq('user_id', user.value.id)
            } else {
                query = query.eq('portfolio_id', currentPortfolioId.value)
            }

            const { data, error: fetchError } = await query
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError

            const formattedData = data.map(item => ({
                id: item.id,
                user_id: item.user_id,
                portfolio_id: item.portfolio_id,
                status: 'holding',
                created_at: item.created_at,
                souvenir: {
                    code: item.stock_code,
                    name: item.stock_name
                }
            }))

            collection.value = formattedData || []

            // Step 3: Update cache with new fingerprint
            const newFingerprint = await getInventoryFingerprint()
            if (newFingerprint) {
                cache.set(cacheKey, formattedData, { fingerprint: newFingerprint })
            }

            return { data: formattedData, fromCache: false }
        } catch (err) {
            console.error('Fetch inventory failed:', err)
            error.value = err.message
            return { error: err }
        } finally {
            loading.value = false
        }
    }

    /**
     * 新增持股至庫存 (寫入 user_inventory)
     */
    const addToInventory = async (stockCode, stockName, portfolioId = null) => {
        if (!user.value) return { success: false, error: '未登入' }

        const targetId = portfolioId || currentPortfolioId.value
        if (isCombinedView.value || !targetId) {
            return { success: false, error: '請先選擇一個特定的帳戶，不能在歸戶模式下新增' }
        }

        try {
            const { data, error } = await supabase
                .from('user_inventory')
                .upsert({
                    user_id: user.value.id,
                    portfolio_id: targetId,
                    stock_code: stockCode,
                    stock_name: stockName,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'portfolio_id,stock_code' })
                .select()
                .single()

            if (error) throw error

            // Invalidate cache immediately on change
            // Remove both the specific portfolio cache and the combined view cache to be safe
            cache.remove(`inventory:${user.value.id}:${targetId}`)
            cache.remove(`inventory:${user.value.id}:combined`)

            return { success: true, data }
        } catch (err) {
            console.error('Add to inventory failed:', err)
            return { success: false, error: err.message }
        }
    }

    const addToCollection = async (souvenirId, status = 'collected', portfolioId = null) => {
        if (!user.value) return { success: false, error: '未登入' }

        const targetId = portfolioId || currentPortfolioId.value
        if (isCombinedView.value || !targetId) {
            return { success: false, error: '請先選擇一個特定的帳戶，不能在歸戶模式下新增' }
        }

        try {
            // 1. 更新 collections 表
            const { data, error: insertError } = await supabase
                .from('user_collections')
                .upsert({
                    user_id: user.value.id,
                    portfolio_id: targetId,
                    souvenir_id: souvenirId,
                    status
                }, { onConflict: 'portfolio_id,souvenir_id' })
                .select()
                .single()

            if (insertError) throw insertError
            return { success: true, data }
        } catch (err) {
            console.error('Add to collection failed:', err)
            return { success: false, error: err.message }
        }
    }


    /**
     * 完全移除：從 user_inventory 移除，同時也從 user_collections 移除 (追蹤也消失)
     * 達到使用者要求的「不論有沒有追蹤都完全消失」
     */
    const removeFromInventoryCompletely = async (souvenirId) => {
        if (!user.value) return { success: false, error: '未登入' }
        if (isCombinedView.value || !currentPortfolioId.value) {
            return { success: false, error: '請先選擇一個特定的帳戶，不能在歸戶模式下操作' }
        }

        try {
            // 1. 先取得紀念品代碼
            const { data: souvenir } = await supabase
                .from('souvenirs')
                .select('code')
                .eq('id', souvenirId)
                .single()

            if (souvenir) {
                // 2. 從 user_inventory 移除
                await supabase
                    .from('user_inventory')
                    .delete()
                    .eq('portfolio_id', currentPortfolioId.value)
                    .eq('stock_code', souvenir.code)

                const currentId = isCombinedView.value ? 'combined' : currentPortfolioId.value
                cache.remove(`inventory:${user.value.id}:${currentId}`)
            }

            // 3. 從 user_collections 完全刪除 (不再是改狀態)
            await supabase
                .from('user_collections')
                .delete()
                .eq('portfolio_id', currentPortfolioId.value)
                .eq('souvenir_id', souvenirId)

            return { success: true }
        } catch (err) {
            console.error('Complete removal failed:', err)
            return { success: false, error: err.message }
        }
    }

    const removeFromCollection = async (id, isInventory = false) => {
        if (!user.value) return { success: false, error: '未登入' }
        try {
            if (isInventory) {
                // 1. 如果是從 inventory 移除
                const { error: delError } = await supabase
                    .from('user_inventory')
                    .delete()
                    .eq('id', id)

                if (delError) throw delError

                // 徹底清除快取，不論是在哪個分身或綜合視圖
                const userId = user.value.id
                const allKeys = Object.keys(localStorage)
                allKeys.filter(k => k.includes(`inventory:${userId}:`)).forEach(k => localStorage.removeItem(k))
            } else {
                // 2. 如果是從 collections 移除
                const { error: delError } = await supabase
                    .from('user_collections')
                    .delete()
                    .eq('id', id)

                if (delError) throw delError
            }

            return { success: true }
        } catch (err) {
            console.error('Remove failed:', err)
            return { success: false, error: err.message }
        }
    }

    const clearAllCollections = async (onlyInventory = true) => {
        if (!user.value) return { success: false, error: '未登入' }
        try {
            // 1. 從 user_inventory 刪除
            const { error: delError } = await supabase
                .from('user_inventory')
                .delete()
                .eq('user_id', user.value.id)

            if (delError) throw delError

            // 2. 如果是清空庫存，也要把 user_collections 裡的 holding 狀態改為 collected
            if (onlyInventory) {
                const { error: updateError } = await supabase
                    .from('user_collections')
                    .update({ status: 'collected' })
                    .eq('user_id', user.value.id)
                    .eq('status', 'holding')

                if (updateError) throw updateError
            } else {
                // 如果是清空「全部」（收藏+庫存），則刪除 user_collections
                const { error: delCollError } = await supabase
                    .from('user_collections')
                    .delete()
                    .eq('user_id', user.value.id)

                if (delCollError) throw delCollError
            }

            // 3. 徹底清除快取
            const userId = user.value.id
            const allKeys = Object.keys(localStorage)
            
            // 清除庫存快取
            allKeys.filter(k => k.includes(`inventory:${userId}:`)).forEach(k => localStorage.removeItem(k))
            
            // 清除收藏快取 (因為狀態可能從 holding 變回 collected)
            allKeys.filter(k => k.includes(`collections:${userId}:`)).forEach(k => localStorage.removeItem(k))

            return { success: true }
        } catch (err) {
            console.error('Clear failed:', err)
            return { success: false, error: err.message }
        }
    }
    const clearOnlyPlannedCollections = async () => {
        if (!user.value) return { success: false, error: '未登入' }
        try {
            // 僅刪除 user_collections 中狀態為 collected 的項目
            let query = supabase
                .from('user_collections')
                .delete()
                .eq('user_id', user.value.id)
                .eq('status', 'collected')

            if (!isCombinedView.value && currentPortfolioId.value) {
                query = query.eq('portfolio_id', currentPortfolioId.value)
            }

            const { error: delError } = await query
            if (delError) throw delError

            // 清除本地相關快取
            const userId = user.value.id
            const allKeys = Object.keys(localStorage)
            allKeys.filter(k => k.includes(`collections:${userId}:`)).forEach(k => localStorage.removeItem(k))

            return { success: true }
        } catch (err) {
            console.error('Clear planned collections failed:', err)
            return { success: false, error: err.message }
        }
    }

    const fetchCollection = async () => {
        if (!user.value) return

        loading.value = true
        error.value = null

        try {
            let query = supabase
                .from('user_collections')
                .select(`
                  *,
                  souvenir: souvenirs (*)
                `)

            if (isCombinedView.value) {
                query = query.eq('user_id', user.value.id)
            } else if (currentPortfolioId.value) {
                query = query.eq('portfolio_id', currentPortfolioId.value)
            } else {
                collection.value = []
                return { data: [] }
            }

            const { data, error: fetchError } = await query
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError
            return { data }
        } catch (err) {
            console.error('Fetch collection failed:', err)
            error.value = err.message
            return { error: err }
        } finally {
            loading.value = false
        }
    }

    return {
        collection,
        loading,
        error,
        fetchCollection,
        fetchAllInventory,
        addToInventory,
        addToCollection,
        removeFromInventoryCompletely,
        removeFromCollection,
        clearAllCollections,
        clearOnlyPlannedCollections
    }
}
