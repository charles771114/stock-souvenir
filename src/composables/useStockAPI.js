import { ref } from 'vue'

/**
 * 台灣股票資料查詢 Composable
 * 使用 FinMind API 查詢上市櫃公司資訊
 */
export function useStockAPI() {
  const loading = ref(false)
  const error = ref(null)

  /**
   * 搜尋台灣上市櫃股票
   * @param {string} query - 股票代號或公司名稱
   * @returns {Promise<Array>} 股票資料陣列
   */
  const searchStock = async (query) => {
    if (!query || query.length < 2) return []

    loading.value = true
    error.value = null

    try {
      // 使用 FinMind API 查詢台灣股票資訊
      const response = await fetch(
        `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockInfo`
      )

      if (!response.ok) {
        throw new Error('無法取得股票資料')
      }

      const data = await response.json()

      if (!data.data || !Array.isArray(data.data)) {
        return []
      }

      // 過濾符合查詢條件的股票
      const results = data.data.filter(stock => {
        const matchCode = stock.stock_id?.includes(query)
        const matchName = stock.stock_name?.includes(query)
        return matchCode || matchName
      })

      // 轉換為統一格式
      return results.map(stock => ({
        code: stock.stock_id,
        name: stock.stock_name,
        industry: stock.industry_category,
        type: stock.type,
        isFromAPI: true // 標記這是從 API 來的資料
      }))
    } catch (e) {
      console.error('Stock API Error:', e)
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 取得單一股票資訊
   * @param {string} stockCode - 股票代號
   * @returns {Promise<Object|null>} 股票資料
   */
  const getStockInfo = async (stockCode) => {
    const results = await searchStock(stockCode)
    return results.find(s => s.code === stockCode) || null
  }

  return {
    loading,
    error,
    searchStock,
    getStockInfo
  }
}
