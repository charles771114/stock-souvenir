import { supabase } from '@/lib/supabase'
import { ref } from 'vue'
import { useAuth } from './useAuth'
import { useLocalStorageCache } from './useLocalStorageCache'
import { usePortfolio } from './usePortfolio'

export function useGifts() {
  const gifts = ref([])
  const myCollections = ref([])
  const allUserCollections = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 初始化快取
  const cache = useLocalStorageCache()
  const { user } = useAuth()
  const { currentPortfolioId, isCombinedView } = usePortfolio()

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
      
      const existing = uniqueMap.get(uniqueKey)
      
      // 優先順序：
      // 1. user_collections (沒有 _source 或 _source !== 'inventory')
      // 2. holding 狀態
      // 3. inventory 來源
      if (!existing) {
        uniqueMap.set(uniqueKey, item)
      } else {
        const existingIsInventory = existing._source === 'inventory'
        const currentIsInventory = item._source === 'inventory'
        
        // 如果現有的是 inventory 來源，而新的不是，則替換
        if (existingIsInventory && !currentIsInventory) {
          uniqueMap.set(uniqueKey, item)
        }
        // 如果兩者來源相同，優先保留 holding 狀態
        else if (existingIsInventory === currentIsInventory && item.status === 'holding') {
          uniqueMap.set(uniqueKey, item)
        }
      }
    })
    
    return Array.from(uniqueMap.values())
  }

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
        .from('souvenirs')
        .select('*')
        .order('meeting_date', { ascending: false })
        .order('updated_at', { ascending: false })

      // 套用篩選條件
      if (filters.year) {
        const startDate = `${filters.year}-01-01`
        const endDate = `${filters.year}-12-31`
        query = query.gte('meeting_date', startDate).lte('meeting_date', endDate)
      }

      if (filters.companyCode) {
        query = query.eq('code', filters.companyCode)
      }

      if (filters.companyName) {
        query = query.ilike('name', `%${filters.companyName}%`)
      }

      if (filters.giftName) {
        query = query.ilike('souvenir_item', `%${filters.giftName}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      gifts.value = data || []

      // 儲存快取（僅當有指定年份且無其他篩選條件時）
      if (requestYear && !filters.companyCode && !filters.companyName && !filters.giftName) {
        const cacheKey = `gifts:${requestYear}`
        const metadata = {
          year: parseInt(requestYear, 10)
        }

        if (requestYear === currentYear.toString()) {
          metadata.fingerprint = await getSouvenirFingerprint(requestYear)
        }

        cache.set(cacheKey, data, metadata)
      }

      return { data, error: null, fromCache: false }
    } catch (e) {
      console.error('取得紀念品列表失敗:', e)
      error.value = e.message

      if (filters.year && !filters.companyCode && !filters.companyName && !filters.giftName) {
        const cacheKey = `gifts:${filters.year}`
        const cachedEntry = cache.getWithMetadata(cacheKey)
        if (cachedEntry) {
          gifts.value = cachedEntry.data
          return { data: cachedEntry.data, error: e, fromCache: true }
        }
      }

      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 取得庫存中有明確紀念品的項目
   * 用於在 MyCollections 中自動顯示已持有的紀念品
   */
  const fetchInventoryWithGifts = async (year = null) => {
    try {
      if (!user.value) return []

      // 1. 查詢 user_inventory
      let invQuery = supabase
        .from('user_inventory')
        .select('*')
      
      if (isCombinedView.value) {
        invQuery = invQuery.eq('user_id', user.value.id)
      } else if (currentPortfolioId.value) {
        invQuery = invQuery.eq('portfolio_id', currentPortfolioId.value)
      } else {
        return []
      }

      const { data: inventoryData, error: invError } = await invQuery

      if (invError) {
        console.error('查詢庫存失敗:', invError)
        return []
      }

      if (!inventoryData || inventoryData.length === 0) return []

      // 2. 取得所有庫存的股票代號
      const stockCodes = inventoryData.map(inv => inv.stock_code).filter(Boolean)
      
      if (stockCodes.length === 0) return []

      // 3. 查詢對應的紀念品資料
      let souvenirQuery = supabase
        .from('souvenirs')
        .select('*')
        .in('code', stockCodes)

      // 如果有指定年份，加上年份過濾
      if (year) {
        const startDate = `${year}-01-01`
        const endDate = `${year}-12-31`
        souvenirQuery = souvenirQuery
          .gte('meeting_date', startDate)
          .lte('meeting_date', endDate)
      }

      const { data: souvenirData, error: souvenirError } = await souvenirQuery

      if (souvenirError) {
        console.error('查詢紀念品失敗:', souvenirError)
        return []
      }

      // 4. 建立 stock_code -> souvenir 的映射
      const souvenirMap = new Map()
      souvenirData?.forEach(s => {
        const code = String(s.code).trim()
        // 只保留有明確紀念品名稱的
        if (s.souvenir_item && s.souvenir_item !== '尚未公布' && s.souvenir_item !== '') {
          souvenirMap.set(code, s)
        }
      })

      // 5. 合併 inventory 和 souvenir 資料
      const validItems = inventoryData
        .map(inv => {
          const code = String(inv.stock_code).trim()
          const souvenir = souvenirMap.get(code)
          
          if (!souvenir) return null

          return {
            id: `inv_${inv.id}`,
            user_id: inv.user_id,
            portfolio_id: inv.portfolio_id,
            souvenir_id: souvenir.id,
            status: 'holding',
            created_at: inv.created_at,
            gift: souvenir,
            _source: 'inventory'
          }
        })
        .filter(Boolean)

      return validItems
    } catch (e) {
      console.error('取得庫存紀念品失敗:', e)
      return []
    }
  }

  const fetchMyCollections = async (year = null) => {
    loading.value = true
    error.value = null

    try {
      if (!user.value) {
        myCollections.value = []
        return { data: [], error: null }
      }
      
      const userId = user.value.id
      const currentYear = new Date().getFullYear().toString()
      const requestYear = year?.toString()
      const currentPortId = isCombinedView.value ? 'combined' : currentPortfolioId.value

      // 1. 檢查快取
      if (requestYear && requestYear !== currentYear) {
        const cacheKey = `collections:${userId}:${currentPortId}:${requestYear}`
        const cachedEntry = cache.getWithMetadata(cacheKey)
        if (cachedEntry) {
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
      
      if (isCombinedView.value) {
        query = query.eq('user_id', userId)
      } else if (currentPortfolioId.value) {
        query = query.eq('portfolio_id', currentPortfolioId.value)
      } else {
        myCollections.value = []
        return { data: [], error: null }
      }

      query = query.in('status', ['collected', 'holding'])

      if (requestYear) {
        const startDate = `${requestYear}-01-01`
        const endDate = `${requestYear}-12-31`
        query = query.gte('gift.meeting_date', startDate).lte('gift.meeting_date', endDate)
      }

      const { data, error: fetchError } = await query
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // 🆕 取得庫存中的紀念品
      const inventoryGifts = await fetchInventoryWithGifts(requestYear)

      // 🆕 合併兩個來源的資料
      const combinedData = [...(data || []), ...inventoryGifts]
      
      // 🆕 去重：優先保留 user_collections 的記錄
      const finalData = deduplicateCollections(combinedData)
      myCollections.value = finalData

      if (requestYear && requestYear !== currentYear && finalData.length > 0) {
        const cacheKey = `collections:${userId}:${currentPortId}:${requestYear}`
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

  const fetchAllUserCollections = async (year = null) => {
    try {
      if (!user.value) return { data: [], error: null }
      
      let query = supabase
        .from('user_collections')
        .select(`
          *,
          gift:souvenirs (*)
        `)
        .eq('user_id', user.value.id)
        .in('status', ['collected', 'holding'])

      if (year) {
        const startDate = `${year}-01-01`
        const endDate = `${year}-12-31`
        query = query.gte('gift.meeting_date', startDate).lte('gift.meeting_date', endDate)
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      
      const uniqueData = deduplicateCollections(data)
      allUserCollections.value = uniqueData
      return { data: uniqueData, error: null }
    } catch (e) {
      console.error('取得全域收藏失敗:', e)
      return { data: null, error: e }
    }
  }

  const addToCollection = async (giftId) => {
    loading.value = true
    error.value = null

    try {
      if (!user.value) throw new Error('未登入')
      if (isCombinedView.value || !currentPortfolioId.value) {
        throw new Error('請先選擇一個特定的帳戶，不能在歸戶模式下新增')
      }

      const { data, error: insertError } = await supabase
        .from('user_collections')
        .upsert({
          user_id: user.value.id,
          portfolio_id: currentPortfolioId.value,
          souvenir_id: giftId,
          status: 'collected'
        }, { onConflict: 'portfolio_id,souvenir_id' })
        .select()
        .single()

      if (insertError) throw insertError

      // 清除相關快取
      const userId = user.value.id
      const currentPortId = currentPortfolioId.value
      const cacheKeyPattern = `collections:${userId}:${currentPortId}:`
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes(cacheKeyPattern)) {
          localStorage.removeItem(key)
        }
      }
      
      await fetchMyCollections()
      await fetchAllUserCollections()

      return { data, error: null }
    } catch (e) {
      console.error('加入收藏失敗:', e)
      error.value = e.message
      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  const removeFromCollection = async (collectionId) => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('user_collections')
        .delete()
        .eq('id', collectionId)

      if (deleteError) throw deleteError

      if (user.value) {
        const userId = user.value.id
        const currentPortId = isCombinedView.value ? 'combined' : currentPortfolioId.value
        const cacheKeyPattern = `collections:${userId}:${currentPortId}:`
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.includes(cacheKeyPattern)) {
            localStorage.removeItem(key)
          }
        }
      }
      await fetchMyCollections()
      await fetchAllUserCollections()

      return { error: null }
    } catch (e) {
      console.error('移除收藏失敗:', e)
      error.value = e.message
      return { error: e }
    } finally {
      loading.value = false
    }
  }

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

  const isInCollection = (giftId) => {
    return myCollections.value.some(c => c.souvenir_id === giftId)
  }

  const getCollection = (giftId) => {
    return myCollections.value.find(c => c.souvenir_id === giftId)
  }

  const fetchUserInventoryIds = async () => {
    try {
      if (!user.value) return new Set()

      // 1. 從 user_collections 取得 (status = 'holding')
      let collQuery = supabase
        .from('user_collections')
        .select(`
          souvenirs!inner (
            code
          )
        `)
      
      // 2. 從新的 user_inventory 表取得
      let invQuery = supabase
        .from('user_inventory')
        .select('stock_code')

      if (isCombinedView.value) {
        collQuery = collQuery.eq('user_id', user.value.id)
        invQuery = invQuery.eq('user_id', user.value.id)
      } else if (currentPortfolioId.value) {
        collQuery = collQuery.eq('portfolio_id', currentPortfolioId.value)
        invQuery = invQuery.eq('portfolio_id', currentPortfolioId.value)
      } else {
        return new Set()
      }

      const [collRes, invRes] = await Promise.all([
        collQuery.eq('status', 'holding'),
        invQuery
      ])

      const codes = new Set()
      
      // 收集來自 user_collections 的代號
      collRes.data?.forEach(d => {
        if (d.souvenirs?.code) codes.add(String(d.souvenirs.code).trim())
      })

      // 收集來自 user_inventory 的代號
      invRes.data?.forEach(d => {
        if (d.stock_code) codes.add(String(d.stock_code).trim())
      })

      return codes
    } catch (e) {
      console.error('取得持股代號失敗:', e)
      return new Set()
    }
  }

  const fetchPreviousYearSouvenirs = async (currentYear) => {
    if (!currentYear) return new Map()
    const previousYear = parseInt(currentYear, 10) - 1
    if (isNaN(previousYear)) return new Map()
    
    const cacheKey = `gifts:${previousYear}`
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

  const reassignCollectionPortfolio = async (itemId, targetPortfolioId) => {
    if (!user.value) return { success: false, error: '未登入' }
    
    try {
      const { error: updateError } = await supabase
        .from('user_collections')
        .update({ portfolio_id: targetPortfolioId })
        .eq('id', itemId)
        .eq('user_id', user.value.id)

      if (updateError) throw updateError
      return { success: true }
    } catch (e) {
      console.error('Reassign collection failed:', e)
      return { success: false, error: e.message }
    }
  }

  return {
    gifts,
    myCollections,
    allUserCollections,
    loading,
    error,
    fetchAllGifts,
    fetchMyCollections,
    fetchAllUserCollections,
    fetchUserInventoryIds,
    fetchPreviousYearSouvenirs,
    enrichWithPreviousYear,
    addToCollection,
    removeFromCollection,
    updateCollectionNote,
    updateCollectionDate,
    reassignCollectionPortfolio,
    isInCollection,
    getCollection,
  }
}
