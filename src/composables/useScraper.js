import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useScraper() {
  const sources = ref([])
  const logs = ref([])
  const loading = ref(false)
  const error = ref(null)

  /**
   * 取得所有爬蟲來源
   */
  const fetchScraperSources = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('scraper_sources')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      sources.value = data || []
      return { data, error: null }
    } catch (e) {
      console.error('取得爬蟲來源失敗:', e)
      error.value = e.message
      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 新增爬蟲來源
   * @param {Object} sourceData - 來源資料
   */
  const addScraperSource = async (sourceData) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('scraper_sources')
        .insert(sourceData)
        .select()
        .single()

      if (insertError) throw insertError

      // 重新載入列表
      await fetchScraperSources()

      return { data, error: null }
    } catch (e) {
      console.error('新增爬蟲來源失敗:', e)
      error.value = e.message
      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新爬蟲來源
   * @param {string} sourceId - 來源 ID
   * @param {Object} updates - 更新資料
   */
  const updateScraperSource = async (sourceId, updates) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('scraper_sources')
        .update(updates)
        .eq('id', sourceId)
        .select()
        .single()

      if (updateError) throw updateError

      // 重新載入列表
      await fetchScraperSources()

      return { data, error: null }
    } catch (e) {
      console.error('更新爬蟲來源失敗:', e)
      error.value = e.message
      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 刪除爬蟲來源
   * @param {string} sourceId - 來源 ID
   */
  const deleteScraperSource = async (sourceId) => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('scraper_sources')
        .delete()
        .eq('id', sourceId)

      if (deleteError) throw deleteError

      // 重新載入列表
      await fetchScraperSources()

      return { error: null }
    } catch (e) {
      console.error('刪除爬蟲來源失敗:', e)
      error.value = e.message
      return { error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 手動觸發爬蟲（呼叫 Edge Function）
   * @param {string} sourceId - 來源 ID
   */
  const triggerScraper = async (sourceId) => {
    loading.value = true
    error.value = null

    try {
      // Invoke 'stock-api' using Supabase client
      // This automatically handles Auth/Headers and URL resolution (Local vs Remote)
      const { data: responseData, error: invokeError } = await supabase.functions.invoke('stock-api', {
        body: JSON.stringify({ source_id: sourceId })
      })

      if (invokeError) throw invokeError

      const data = responseData
      const invokeResult = { data }


      // Log the success locally to the table for record keeping (Optional, but good for UI feedback)
      // Since the Edge Function creates a storage file, we just log that it ran.
      const { error: logError } = await supabase
        .from('scraper_logs')
        .insert({
          source_id: sourceId,
          status: 'success',
          items_scraped: data?.data?.length || 0, // Mock data length
          completed_at: new Date().toISOString()
        })

      if (logError) console.warn('Failed to save log:', logError)

      // 重新載入來源列表（更新 last_scraped_at）
      await fetchScraperSources()

      // 重新載入日誌
      await fetchScraperLogs(sourceId, 10)

      return { data, error: null }
    } catch (e) {
      console.error('觸發爬蟲失敗:', e)
      error.value = e.message

      // Log failure
      await supabase.from('scraper_logs').insert({
        source_id: sourceId,
        status: 'failed',
        error_message: e.message,
        completed_at: new Date().toISOString()
      })

      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 查看執行記錄
   * @param {string} sourceId - 來源 ID（可選，不傳則取得所有）
   * @param {number} limit - 限制筆數
   */
  const fetchScraperLogs = async (sourceId = null, limit = 50) => {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('scraper_logs')
        .select(`
          *,
          source:scraper_sources (
            source_name,
            source_url
          )
        `)
        .order('executed_at', { ascending: false })
        .limit(limit)

      if (sourceId) {
        query = query.eq('source_id', sourceId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      logs.value = data || []
      return { data, error: null }
    } catch (e) {
      console.error('取得執行記錄失敗:', e)
      error.value = e.message
      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  /**
   * 取得爬蟲統計
   */
  const fetchScraperStats = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('scraper_stats')
        .select('*')

      if (fetchError) throw fetchError

      return { data, error: null }
    } catch (e) {
      console.error('取得爬蟲統計失敗:', e)
      error.value = e.message
      return { data: null, error: e }
    } finally {
      loading.value = false
    }
  }

  return {
    sources,
    logs,
    loading,
    error,
    fetchScraperSources,
    addScraperSource,
    updateScraperSource,
    deleteScraperSource,
    triggerScraper,
    fetchScraperLogs,
    fetchScraperStats,
  }
}
