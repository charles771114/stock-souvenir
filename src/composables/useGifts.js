import { supabase } from '@/lib/supabase'
import { ref } from 'vue'
import { useAuth } from './useAuth'
import { useLocalStorageCache } from './useLocalStorageCache'

export function useGifts() {
  const gifts = ref([])
  const myCollections = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 初始化快取
  const cache = useLocalStorageCache()

  /**
   * 取得指定年度紀念品的指紋（最後更新時間）
   */
  const getSouvenirFingerprint = async (year) => {
    try {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      const { data } = await supabase
        .from('souvenirs')
        .select('updated_at')
        .gte('meeting_date', startDate)
        .lte('meeting_date', endDate)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      return data?.updated_at || null
    } catch (e) {
      console.warn('Get fingerprint failed:', e)
      return null
    }
  }

  const fetchAllGifts = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
      const currentYear = new Date().getFullYear()
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      const requestYear = filters.year

      // 檢查快取（僅當有指定年份且無其他篩選條件時）
      if (requestYear && !filters.companyCode && !filters.companyName && !filters.giftName) {
        const cacheKey = `gifts:${requestYear}`
        const cachedEntry = cache.getWithMetadata(cacheKey)

        if (cachedEntry) {
          // 過去年度：永久快取
          if (requestYear !== currentYear.toString()) {
            gifts.value = cachedEntry.data
            loading.value = false
            return { data: cachedEntry.data, error: null, fromCache: true }
          }

          // 當年度：指紋檢查
          const fingerprint = await getSouvenirFingerprint(requestYear)
          if (fingerprint && cachedEntry.fingerprint === fingerprint) {
            gifts.value = cachedEntry.data
            loading.value = false
            return { data: cachedEntry.data, error: null, fromCache: true }
          }
        }
      }

      // 呼叫 API
      let query = supabase
        .from('souvenirs') // Updated table name
        .select('*')
        .order('meeting_date', { ascending: false }) // Updated sort field
        .order('updated_at', { ascending: false })

      // 套用篩選條件
      if (filters.year) {
        // Assuming filters.year is a number like 2025
        const startDate = `${filters.year}-01-01`
        const endDate = `${filters.year}-12-31`
        query = query.gte('meeting_date', startDate).lte('meeting_date', endDate)
      }

      if (filters.companyCode) {
        query = query.eq('code', filters.companyCode) // Updated column: company_code -> code
      }

      if (filters.companyName) {
        query = query.ilike('name', `%${filters.companyName}%`) // Updated column: company_name -> name
      }

      if (filters.giftName) {
        query = query.ilike('souvenir_item', `%${filters.giftName}%`) // Updated column: gift_name -> souvenir_item
      }

      // Note: 'gift_category' column was removed in new schema, removing filter for now or need to add it back if essential.

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      gifts.value = data || []

      // 儲存快取（僅當有指定年份且無其他篩選條件時）
      if (requestYear && !filters.companyCode && !filters.companyName && !filters.giftName) {
        const cacheKey = `gifts:${requestYear}`
        const metadata = {
          year: parseInt(requestYear, 10)
        }

        // 當年度加入指紋標記
        if (requestYear === currentYear.toString()) {
          metadata.fingerprint = await getSouvenirFingerprint(requestYear)
        }

        cache.set(cacheKey, data, metadata)
      }

      return { data, error: null, fromCache: false }
    } catch (e) {
      console.error('取得紀念品列表失敗:', e)
      error.value = e.message

      // Fallback: 嘗試使用快取（即使過期）
      if (filters.year && !filters.companyCode && !filters.companyName && !filters.giftName) {
        const cacheKey = `gifts:${filters.year}`
        const cachedEntry = cache.getWithMetadata(cacheKey)
        if (cachedEntry) {
          gifts.value = cachedEntry.data
          console.warn('Using cached data due to API error')
          return { data: cachedEntry.data, error: e, fromCache: true }
        }
      }

      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 取得我的收藏
   * @param {string|number} year - 指定年度（選填）
   */
  const fetchMyCollections = async (year = null) => {
    const { user: currentUser } = useAuth()
    
    loading.value = true
    error.value = null

    /**
     * 去重輔助函數：根據股票代碼去重，優先保留 holding 狀態
     */
    const deduplicateCollections = (rawData) => {
      const filtered = (rawData || []).filter(item => item.gift)
      const uniqueMap = new Map()
      
      filtered.forEach(item => {
        // 強制轉字串並修剪空白，確保 key 絕對一致
        const code = String(item.gift?.code || '').trim()
        const uniqueKey = code || item.souvenir_id
        
        // 優先保留 holding 狀態（已持股），如果兩者都有
        if (!uniqueMap.has(uniqueKey) || item.status === 'holding') {
          uniqueMap.set(uniqueKey, item)
        }
      })
      
      return Array.from(uniqueMap.values())
    }

    try {
      if (!currentUser.value) {
        myCollections.value = []
        return { data: [], error: null }
      }
      
      const userId = currentUser.value.id
      const currentYear = new Date().getFullYear().toString()
      const requestYear = year?.toString()

      // 1. 檢查快取 (僅針對過去年度)
      if (requestYear && requestYear !== currentYear) {
        const cacheKey = `collections:${userId}:${requestYear}`
        const cachedEntry = cache.getWithMetadata(cacheKey)
        if (cachedEntry) {
          // 對快取資料也進行一次去重
          const deduplicatedCache = deduplicateCollections(cachedEntry.data)
          
          myCollections.value = deduplicatedCache
          loading.value = false
          return { data: deduplicatedCache, error: null, fromCache: true }
        }
      }

      // 2. 呼叫 API
      let query = supabase
        .from('user_collections')
        .select(`
          *,
          gift:souvenirs (*)
        `)
        .eq('user_id', userId)
        .in('status', ['collected', 'holding'])

      // 套用年份篩選（如果指定）
      if (requestYear) {
        const startDate = `${requestYear}-01-01`
        const endDate = `${requestYear}-12-31`
        query = query.gte('gift.meeting_date', startDate).lte('gift.meeting_date', endDate)
      }

      const { data, error: fetchError } = await query
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // 3. 去重與更新
      const finalData = deduplicateCollections(data)
      myCollections.value = finalData

      // 4. 儲存快取 (僅針對過去年度)
      if (requestYear && requestYear !== currentYear && finalData.length > 0) {
        const cacheKey = `collections:${userId}:${requestYear}`
        const metadata = { year: requestYear }
        cache.set(cacheKey, finalData, metadata)
      }

      return { data: finalData, error: null, fromCache: false }
    } catch (e) {
      console.error('取得收藏列表失敗:', e)
      error.value = e.message
      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 加入收藏
   * @param {string} giftId - 紀念品 ID
   * @param {string} collectedDate - 收藏日期（可選）
   */
  const addToCollection = async (giftId, collectedDate = null) => {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登入')

      const { data, error: insertError } = await supabase
        .from('user_collections')
        .upsert({
          user_id: user.id,
          souvenir_id: giftId,
          // collected_date: collectedDate, // Removed from new schema or handled via 'created_at' or 'status'
          status: 'collected'
        }, { onConflict: 'user_id,souvenir_id,status' })
        .select()
        .single()

      if (insertError) throw insertError

      // 重新載入收藏列表
      const { user: currentUser } = useAuth()
      if (currentUser.value) {
        const userId = currentUser.value.id
        const cacheKeyPattern = `collections:${userId}:`
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.includes(cacheKeyPattern)) {
            localStorage.removeItem(key)
          }
        }
      }
      await fetchMyCollections()

      return { data, error: null }
    } catch (e) {
      console.error('加入收藏失敗:', e)
      error.value = e.message
      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 移除收藏
   * @param {string} collectionId - 收藏記錄 ID
   */
  const removeFromCollection = async (collectionId) => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('user_collections')
        .delete()
        .eq('id', collectionId)

      if (deleteError) throw deleteError

      // 重新載入收藏列表並清除快取
      const { user: currentUser } = useAuth()
      if (currentUser.value) {
        const userId = currentUser.value.id
        const cacheKeyPattern = `collections:${userId}:`
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.includes(cacheKeyPattern)) {
            localStorage.removeItem(key)
          }
        }
      }
      await fetchMyCollections()

      return { error: null }
    } catch (e) {
      console.error('移除收藏失敗:', e)
      error.value = e.message
      return { error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新收藏備註
   * @param {string} collectionId - 收藏記錄 ID
   * @param {string} note - 備註內容
   */
  const updateCollectionNote = async (collectionId, note) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('user_collections')
        .update({ notes: note })
        .eq('id', collectionId)
        .select()
        .single()

      if (updateError) throw updateError

      // 更新本地資料
      const index = myCollections.value.findIndex(c => c.id === collectionId)
      if (index !== -1) {
        myCollections.value[index].notes = note
      }

      return { data, error: null }
    } catch (e) {
      console.error('更新備註失敗:', e)
      error.value = e.message
      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新收藏日期
   * @param {string} collectionId - 收藏記錄 ID
   * @param {string} date - 日期
   */
  const updateCollectionDate = async (collectionId, date) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('user_collections')
        .update({ collected_date: date })
        .eq('id', collectionId)
        .select()
        .single()

      if (updateError) throw updateError

      // 更新本地資料
      const index = myCollections.value.findIndex(c => c.id === collectionId)
      if (index !== -1) {
        myCollections.value[index].collected_date = date
      }

      return { data, error: null }
    } catch (e) {
      console.error('更新日期失敗:', e)
      error.value = e.message
      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 檢查是否已收藏
   * @param {string} giftId - 紀念品 ID
   */
  const isInCollection = (giftId) => {
    return myCollections.value.some(c => c.souvenir_id === giftId)
  }

  /**
   * 取得收藏記錄
   * @param {string} giftId - 紀念品 ID
   */
  const getCollection = (giftId) => {
    return myCollections.value.find(c => c.souvenir_id === giftId)
  }

  /**
   * 取得使用者庫存項目 ID 列表（僅 collected 狀態）
   * @returns {Promise<Set>} - 庫存項目 ID 的 Set
   */
  const fetchUserInventoryIds = async () => {
    const { user: currentUser } = useAuth()
    try {
      if (!currentUser.value) return new Set()

      const { data } = await supabase
        .from('user_collections')
        .select('souvenir_id')
        .eq('user_id', currentUser.value.id)
        .eq('status', 'holding') // Now tracking inventory as 'holding'

      return new Set(data?.map(d => d.souvenir_id) || [])
    } catch (e) {
      console.error('取得庫存ID失敗:', e)
      return new Set()
    }
  }

  /**
   * 取得上一年度紀念品資料（用於參考顯示）
   * @param {number|string} currentYear - 當前年度
   * @returns {Promise<Map<string, object>>} - 以股票代號為 key 的 Map
   */
  const fetchPreviousYearSouvenirs = async (currentYear) => {
    // Guard: ensure year is valid
    if (!currentYear) {
      return new Map()
    }
    const previousYear = parseInt(currentYear, 10) - 1
    if (isNaN(previousYear)) {
      console.warn('Invalid year for previous year lookup:', currentYear)
      return new Map()
    }
    const cacheKey = `gifts:${previousYear}`
    
    // 嘗試從快取取得
    const cachedEntry = cache.getWithMetadata(cacheKey)
    if (cachedEntry?.data) {
      const souvenirMap = new Map()
      cachedEntry.data.forEach(item => {
        if (item.souvenir_item) {
          souvenirMap.set(item.code, item.souvenir_item)
        }
      })
      return souvenirMap
    }

    // 沒有快取，從 API 取得
    try {
      const startDate = `${previousYear}-01-01`
      const endDate = `${previousYear}-12-31`
      
      const { data } = await supabase
        .from('souvenirs')
        .select('code, souvenir_item')
        .gte('meeting_date', startDate)
        .lte('meeting_date', endDate)

      const souvenirMap = new Map()
      data?.forEach(item => {
        if (item.souvenir_item) {
          souvenirMap.set(item.code, item.souvenir_item)
        }
      })
      return souvenirMap
    } catch (e) {
      console.error('取得上年度資料失敗:', e)
      return new Map()
    }
  }

  /**
   * 為禮品列表加入上年度參考資料
   * @param {Array} currentGifts - 當前年度禮品列表
   * @param {Map} previousYearMap - 上年度資料 Map
   * @returns {Array} - 加入 previousYearSouvenir 欄位的列表
   */
  const enrichWithPreviousYear = (currentGifts, previousYearMap) => {
    return currentGifts.map(gift => {
      const needsReference = !gift.souvenir_item || 
        gift.souvenir_item === '尚未公布' || 
        gift.souvenir_item.trim() === ''
      
      if (needsReference && previousYearMap.has(gift.code)) {
        return {
          ...gift,
          previousYearSouvenir: previousYearMap.get(gift.code)
        }
      }
      return gift
    })
  }

  return {
    gifts,
    myCollections,
    loading,
    error,
    fetchAllGifts,
    fetchMyCollections,
    fetchUserInventoryIds,
    fetchPreviousYearSouvenirs,
    enrichWithPreviousYear,
    addToCollection,
    removeFromCollection,
    updateCollectionNote,
    updateCollectionDate,
    isInCollection,
    getCollection,
  }
}
