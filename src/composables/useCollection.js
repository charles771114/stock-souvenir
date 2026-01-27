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
     * 取得庫存指紋（最後更新時間）
     */
    const getInventoryFingerprint = async () => {
        if (!user.value) return null
        try {
            // 1. 檢查使用者收藏的最近變動
            const { data: collUpdate } = await supabase
                .from('user_collections')
                .select('updated_at')
                .eq('user_id', user.value.id)
                .eq('status', 'holding')
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            // 2. 檢查紀念品主表的最近變動（為了同步名稱更新）
            const { data: souvenirUpdate } = await supabase
                .from('souvenirs')
                .select('updated_at')
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            return `${collUpdate?.updated_at || ''}|${souvenirUpdate?.updated_at || ''}`
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

            const { data, error: fetchError } = await supabase
                .from('user_collections')
                .select(`
          *,
          souvenir: souvenirs (*)
        `)
                .eq('user_id', user.value.id)
                .eq('status', 'holding') // Specifically for inventory (owned items)
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError

            collection.value = data || []

            // 儲存快取
            if (fingerprint) {
                cache.set(cacheKey, data, { fingerprint })
            }

            return { data, fromCache: false }
        } catch (err) {
            console.error('Fetch inventory failed:', err)
            error.value = err.message
            return { error: err }
        } finally {
            loading.value = false
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

            collection.value = data
        } catch (err) {
            console.error('Fetch collection failed:', err)
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const addToCollection = async (souvenirId) => {
        if (!user.value) {
            return { success: false, error: '請先登入' }
        }

        try {
            const { error: insertError } = await supabase
                .from('user_collections')
                .upsert({
                    user_id: user.value.id,
                    souvenir_id: souvenirId,
                    status: 'holding'
                }, { onConflict: 'user_id,souvenir_id,status' })

            if (insertError) throw insertError

            // 清除快取
            cache.remove(`inventory:${user.value.id}`)
            
            await fetchAllInventory() // Reload inventory
            return { success: true }
        } catch (err) {
            console.error('Add to collection failed:', err)
            return { success: false, error: err.message }
        }
    }

    const removeFromCollection = async (collectionId) => {
        try {
            const { error: deleteError } = await supabase
                .from('user_collections')
                .delete()
                .eq('id', collectionId)

            if (deleteError) throw deleteError

            // 清除快取
            if (user.value) {
                cache.remove(`inventory:${user.value.id}`)
            }

            collection.value = collection.value.filter(item => item.id !== collectionId)
            return { success: true }
        } catch (err) {
            console.error('Remove from collection failed:', err)
            return { success: false, error: err.message }
        }
    }

    const clearAllCollections = async () => {
        if (!user.value) {
            return { success: false, error: '請先登入' }
        }

        try {
            const { error: deleteError } = await supabase
                .from('user_collections')
                .delete()
                .eq('user_id', user.value.id)
                .eq('status', 'holding') // ONLY clear inventory holdings

            if (deleteError) throw deleteError

            // 清除快取
            cache.remove(`inventory:${user.value.id}`)

            collection.value = []
            return { success: true }
        } catch (err) {
            console.error('Clear all collections failed:', err)
            return { success: false, error: err.message }
        }
    }

    return {
        collection,
        loading,
        error,
        fetchCollection, // Keep for backward compatibility
        fetchAllInventory, // New explicit function
        addToCollection,
        removeFromCollection,
        clearAllCollections
    }
}
