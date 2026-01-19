import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useGifts() {
  const gifts = ref([])
  const myCollections = ref([])
  const loading = ref(false)
  const error = ref(null)

  /**
   * 取得紀念品列表（支援篩選）
   * @param {Object} filters - 篩選條件
   * @param {number} filters.year - 年份
   * @param {string} filters.companyCode - 公司代號
   * @param {string} filters.companyName - 公司名稱（模糊搜尋）
   * @param {string} filters.giftName - 紀念品名稱（模糊搜尋）
   * @param {string} filters.category - 分類
   */
  const fetchAllGifts = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
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
      return { data, error: null }
    } catch (e) {
      console.error('取得紀念品列表失敗:', e)
      error.value = e.message
      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 取得我的收藏
   */
  const fetchMyCollections = async () => {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Not logged in, clear collections locally and return
        myCollections.value = []
        return { data: [], error: null }
      }

      const { data, error: fetchError } = await supabase
        .from('user_collections')
        .select(`
          *,
          gift:souvenirs (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Transform the data structure if necessary to match frontend expectations
      // Since 'gift' object structure changed (e.g. name instead of company_name), 
      // we might need frontend adjustments or map it here.
      // For now, let's keep it raw but point to 'souvenirs' table.

      myCollections.value = data || []
      return { data, error: null }
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
        .insert({
          user_id: user.id,
          souvenir_id: giftId,
          // collected_date: collectedDate, // Removed from new schema or handled via 'created_at' or 'status'
          status: 'collected'
        })
        .select()
        .single()

      if (insertError) throw insertError

      // 重新載入收藏列表
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

      // 重新載入收藏列表
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

  return {
    gifts,
    myCollections,
    loading,
    error,
    fetchAllGifts,
    fetchMyCollections,
    addToCollection,
    removeFromCollection,
    updateCollectionNote,
    updateCollectionDate,
    isInCollection,
    getCollection,
  }
}
