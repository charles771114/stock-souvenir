import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/lib/supabase'
import { ref } from 'vue'
import { useLocalStorageCache } from './useLocalStorageCache'

export function useCollection() {
    const collection = ref([])
    const loading = ref(false)
    const error = ref(null)

    const { user } = useAuth()
    const cache = useLocalStorageCache()

    /**
     * 取得庫存指紋（最後更新時間）- 更新為使用 user_inventory表
     */
    const getInventoryFingerprint = async () => {
        if (!user.value) return null
        try {
            // 檢查使用者持股的最近變動
            const { data: invUpdate } = await supabase
                .from('user_inventory')
                .select('updated_at')
                .eq('user_id', user.value.id)
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            return invUpdate?.updated_at || 'initial'
        } catch (e) {
            console.warn('Get inventory fingerprint failed:', e)
            return null
        }
    }

    const fetchAllInventory = async () => {
        if (!user.value) return

        loading.value = true
        error.value = null

        try {
            const cacheKey = `inventory:${user.value.id}`
            const cachedEntry = cache.getWithMetadata(cacheKey)

            // 指紋檢查
            const fingerprint = await getInventoryFingerprint()
            if (cachedEntry && cachedEntry.fingerprint === fingerprint) {
                collection.value = cachedEntry.data
                loading.value = false
                return { data: cachedEntry.data, fromCache: true }
            }

            // 改為從 user_inventory 讀取跨年度持股
            const { data, error: fetchError } = await supabase
                .from('user_inventory')
                .select('*')
                .eq('user_id', user.value.id)
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError

            // 格式化回傳格式以相容舊有元件 (模擬 souvenir 結構)
            const formattedData = data.map(item => ({
                id: item.id,
                user_id: item.user_id,
                status: 'holding',
                created_at: item.created_at,
                souvenir: {
                    code: item.stock_code,
                    name: item.stock_name
                }
            }))

            collection.value = formattedData || []

            // 儲存快取
            if (fingerprint) {
                cache.set(cacheKey, formattedData, { fingerprint })
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
    const addToInventory = async (stockCode, stockName) => {
        if (!user.value) return { success: false, error: '未登入' }

        try {
            const { data, error } = await supabase
                .from('user_inventory')
                .upsert({
                    user_id: user.value.id,
                    stock_code: stockCode,
                    stock_name: stockName,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,stock_code' })
                .select()
                .single()

            if (error) throw error
            return { success: true, data }
        } catch (err) {
            console.error('Add to inventory failed:', err)
            return { success: false, error: err.message }
        }
    }

    const addToCollection = async (souvenirId, status = 'collected') => {
        if (!user.value) return { success: false, error: '未登入' }

        // 如果是標記為持股，則重新導向至 addToInventory (代碼需從 souvenir 取得)
        if (status === 'holding') {
            const { data: souvenir } = await supabase
                .from('souvenirs')
                .select('code, name')
                .eq('id', souvenirId)
                .single()
            if (souvenir) {
                return await addToInventory(souvenir.code, souvenir.name)
            }
        }

        try {
            const { data, error: insertError } = await supabase
                .from('user_collections')
                .upsert({
                    user_id: user.value.id,
                    souvenir_id: souvenirId,
                    status
                }, { onConflict: 'user_id,souvenir_id,status' })
                .select()
                .single()

            if (insertError) throw insertError
            return { success: true, data }
        } catch (err) {
            console.error('Add to collection failed:', err)
            return { success: false, error: err.message }
        }
    }

    const removeFromCollection = async (id, isInventory = false) => {
        if (!user.value) return { success: false, error: '未登入' }
        try {
            const table = isInventory ? 'user_inventory' : 'user_collections'
            const { error: delError } = await supabase
                .from(table)
                .delete()
                .eq('id', id)
                .eq('user_id', user.value.id)

            if (delError) throw delError
            return { success: true }
        } catch (err) {
            console.error('Remove failed:', err)
            return { success: false, error: err.message }
        }
    }

    const clearAllCollections = async (onlyInventory = true) => {
        if (!user.value) return { success: false, error: '未登入' }
        try {
            const table = onlyInventory ? 'user_inventory' : 'user_collections'
            const { error: delError } = await supabase
                .from(table)
                .delete()
                .eq('user_id', user.value.id)

            if (delError) throw delError
            return { success: true }
        } catch (err) {
            console.error('Clear failed:', err)
            return { success: false, error: err.message }
        }
    }
    const fetchCollection = async () => {
        if (!user.value) return

        loading.value = true
        error.value = null

        try {
            const { data, error: fetchError } = await supabase
                .from('user_collections')
                .select(`
          *,
          souvenir: souvenirs (*)
        `)
                .eq('user_id', user.value.id)
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
        removeFromCollection,
        clearAllCollections
    }
}
