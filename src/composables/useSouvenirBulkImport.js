import { supabase } from '@/lib/supabase'
import { ref } from 'vue'

export function useSouvenirBulkImport() {
  const uploading = ref(false)
  const error = ref(null)
  const progress = ref(0) // 0-100

  /**
   * 解析 Excel/CSV 檔案 (xlsx 採用 Lazy Load)
   * @param {File} file 
   * @returns {Promise<Array>}
   */
  const parseFile = async (file) => {
    const XLSX = await import('xlsx')
    const isCsv = file.name.toLowerCase().endsWith('.csv')

    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = e.target.result
          const readOptions = isCsv ? { type: 'string' } : { type: 'array', cellDates: true }
          const workbook = XLSX.read(data, readOptions)
          console.log('[Import] XLSX 版本:', XLSX.version)
          console.log('[Import] 檔案包含工作表數:', workbook.SheetNames.length, '筆: ', workbook.SheetNames)
          
          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error('Excel 檔案中找不到工作表 (Sheet)')
          }

          let allParsedData = []
          
          // 嘗試解析所有工作表，看是不是資料在別張或是範圍判定出錯
          workbook.SheetNames.forEach((name, idx) => {
            const ws = workbook.Sheets[name]
            
            // 關鍵修正：重新計算 Range
            // 某些 Numbers 匯出的檔案 !ref 可能只有 A1:J3，即便後面還有資料
            let range = ws['!ref']
            
            // 手動計算真正的範圍 (遍歷所有 Key 找出最大 Row/Col)
            const cells = Object.keys(ws).filter(k => k[0] !== '!')
            if (cells.length > 0) {
              let maxRow = 0
              let maxCol = 0
              cells.forEach(c => {
                const cell = XLSX.utils.decode_cell(c)
                if (cell.r > maxRow) maxRow = cell.r
                if (cell.c > maxCol) maxCol = cell.c
              })
              const newRange = { s: { c: 0, r: 0 }, e: { c: maxCol, r: maxRow } }
              const newRef = XLSX.utils.encode_range(newRange)
              if (newRef !== range) {
                console.log(`[Import] 更新 Sheet[${idx}] 範圍: ${range} -> ${newRef}`)
                ws['!ref'] = newRef
                range = newRef
              }
            }

            const jsonData = XLSX.utils.sheet_to_json(ws, { defval: "" })
            console.log(`[Import] Sheet[${idx}] "${name}": 最終範圍=${range}, 解析得 ${jsonData.length} 列`)
            
            if (jsonData.length > 0) {
              allParsedData = [...allParsedData, ...jsonData]
            }
          })

          console.log(`[Import] 所有 Sheet 合計解析出 ${allParsedData.length} 列原始資料`)
          resolve(allParsedData)
        } catch (err) {
          console.error('[Import] 解析核心錯誤:', err)
          reject(new Error(err.message))
        }
      }

      reader.onerror = (err) => reject(err)

      if (isCsv) {
        reader.readAsText(file)
      } else {
        reader.readAsArrayBuffer(file)
      }
    })
  }

  /**
   * 將解析後的原始資料 (JSONArray) 轉換為標準格式
   * 針對 Mac Numbers 或格式不規範的 Excel 進行優化
   */
  const mapData = (rawData) => {
    if (!rawData || rawData.length === 0) return []

    // 1. 識別關鍵欄位索引 (不依賴 JSON Key 名稱，改用內容搜尋)
    // 有些 Excel 標題不在第一列，或者標題名稱有微小差異
    // 我們嘗試從前 10 筆資料中尋找最像「標題列」的那一列
    
    const keywords = {
      code: ['股票代號', '代號', 'Code', 'StockCode', '股票代碼', '證券代號', '代碼'],
      meetingTime: ['開會時間', '日期', 'MeetingTime', '開會日期', '開會', '時間', '會議時間'],
      name: ['股票名稱', '名稱', 'Name', 'StockName', '公司名稱', '公司'],
      souvenir: ['紀念品', 'Souvenir', '紀念品名稱', '商品', '股東紀念品'],
      market: ['市場別', '市場', 'Market', 'MarketType'],
      meetingType: ['開會性質', '性質', 'MeetingType', '會議性質'],
      lastBuy: ['最後買進日', '最後買進', 'LastBuyDate', '最後交易日', '買進日'],
      price: ['股價', 'Price', '成交價'],
      deadline: ['代領截止時間', 'ProxyDeadline', '代領截止日', '截止時間']
    }

    // 輔助函式：標準化 Key 名稱 (去除空格、標點符號，但保留中文字與英數)
    // 原始 regex /[\s\W_]/g 會把中文也當成 \W 刪掉，導致所有中文欄位都變成空字串
    const normalize = (s) => String(s || '').trim().replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')

    console.log('[Import] 解析前 3 筆原始資料 (可展開察看內容):', rawData.slice(0, 3))
    
    let keyIndices = {}
    let headerRowIdx = -1 // 需要跳過的「位於資料列中」的標題列索引

    // 1. 優先策略：直接從物件的 Keys 尋找 (這是 XLSX 最常見的讀取結果)
    if (rawData.length > 0) {
      const firstRowKeys = Object.keys(rawData[0])
      let keyMatchCount = 0
      const currentIndices = {}

      Object.entries(keywords).forEach(([field, aliases]) => {
        for (const alias of aliases) {
          const normAlias = normalize(alias)
          const kIdx = firstRowKeys.findIndex(k => normalize(k) === normAlias)
          if (kIdx !== -1) {
            currentIndices[field] = firstRowKeys[kIdx]
            keyMatchCount++
            break
          }
        }
      })

      if (keyMatchCount >= 2) {
        console.log(`[Import] 成功從 Keys 识别到 ${keyMatchCount} 個欄位，不跳過資料列`)
        keyIndices = currentIndices
        // 此時 headerRowIdx 保持 -1，表示資料從 index 0 開始
      } else {
        // 2. 備選策略：如果 Keys 無意義，則在 Row 的內容 (Values) 中尋找標題
        console.log('[Import] Keys 匹配不足，開始掃描 Row 內容識別標題...')
        let maxMatch = 0
        for (let i = 0; i < Math.min(rawData.length, 10); i++) {
          const row = rawData[i]
          const values = Object.values(row).map(v => String(v || ''))
          const tempIndices = {}
          let matchCount = 0

          Object.entries(keywords).forEach(([field, aliases]) => {
            for (const alias of aliases) {
              const normAlias = normalize(alias)
              const vIdx = values.findIndex(v => normalize(v) === normAlias)
              if (vIdx !== -1) {
                tempIndices[field] = Object.keys(row)[vIdx]
                matchCount++
                break
              }
            }
          })

          if (matchCount > maxMatch) {
            maxMatch = matchCount
            keyIndices = tempIndices
            headerRowIdx = i
          }
          if (matchCount >= 3) break
        }
        console.log(`[Import] 在資料列內容中找到標題，索引: ${headerRowIdx}, 匹配數: ${maxMatch}`)
      }
    }

    console.log('[Import] 最終採用之欄位對應模型:', keyIndices)

    const result = rawData.map((row, index) => {
      // 如果 headerRowIdx !== -1，則跳過該索引及其之前的所有列
      if (headerRowIdx !== -1 && index <= headerRowIdx) {
        return null
      }

      const getValue = (field) => {
        const key = keyIndices[field]
        return key ? row[key] : null
      }

      const code = String(getValue('code') || '').trim()
      const name = getValue('name')
      const meetingTime = getValue('meetingTime')
      const souvenirItem = getValue('souvenir')
      const marketType = getValue('market')
      const meetingType = getValue('meetingType')
      const lastBuyDate = getValue('lastBuy')
      const priceRaw = getValue('price')
      const priceStr = priceRaw !== null ? String(priceRaw).replace(/[,]/g, '') : '0'
      const proxyDeadline = getValue('deadline')

      // 日期處理
      const formatDate = (d) => {
        if (!d) return null
        if (d instanceof Date) return d.toISOString().split('T')[0]
        if (typeof d === 'number') {
          // Excel 日期序號
          try {
            const date = new Date((d - 25569) * 86400 * 1000)
            return date.toISOString().split('T')[0]
          } catch (e) { return null }
        }

        const dateStr = String(d).trim().split(' ')[0]
        const m4 = dateStr.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/)
        if (m4) return `${m4[1]}-${m4[2].padStart(2, '0')}-${m4[3].padStart(2, '0')}`

        const mMdy = dateStr.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
        if (mMdy) {
          let [_, m, day, y] = mMdy
          if (y.length === 2) y = '20' + y
          return `${y}-${m.padStart(2, '0')}-${day.padStart(2, '0')}`
        }

        const mDig = dateStr.match(/^(\d{4})(\d{2})(\d{2})$/)
        if (mDig) return `${mDig[1]}-${mDig[2]}-${mDig[3]}`

        if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.substring(0, 10)
        return null
      }

      const formattedMeetingDate = formatDate(meetingTime)
      
      // 修法：不再過濾掉 null rows，改為標記 isValid
      // 這樣使用者才能在預覽表格看到底哪些是有問題的
      const isValid = code && formattedMeetingDate

      if (!isValid && index < 20) {
        console.warn(`[Import] Row ${index} 不完整: 代號=${code}, 日期=${formattedMeetingDate} (原值:${meetingTime})`)
      }

      return {
        doc_id: isValid ? `${code}_${formattedMeetingDate}` : null,
        code,
        name: name ? String(name).trim() : null,
        price: parseFloat(priceStr) || null,
        meeting_date: formattedMeetingDate,
        meeting_type: meetingType ? String(meetingType).trim() : null,
        souvenir_item: souvenirItem ? String(souvenirItem).trim() : null,
        last_buy_date: formatDate(lastBuyDate),
        market_type: marketType ? String(marketType).trim() : null,
        proxy_deadline: proxyDeadline ? String(proxyDeadline).trim() : null,
        updated_at: new Date().toISOString(),
        isValid // 新增：用於 UI 顯示
      }
    })

    console.log(`[Import] 解析完成，產出 ${result.length} 筆資料`)
    return result
  }
  /**
   * 批次上傳至 souvenirs
   * @param {Array} mappedData 
   */
  const uploadToSouvenirs = async (mappedData) => {
    uploading.value = true
    error.value = null
    progress.value = 0

    try {
      const validData = mappedData.filter(d => d.isValid)
      if (validData.length === 0) throw new Error('無有效且完整的資料可供匯入')

      const BATCH_SIZE = 200
      const total = validData.length
      let processed = 0

      for (let i = 0; i < total; i += BATCH_SIZE) {
        const chunk = validData.slice(i, i + BATCH_SIZE).map(({ isValid, ...rest }) => rest)

        const { error: upsertError } = await supabase
          .from('souvenirs')
          .upsert(chunk, { onConflict: 'doc_id' })

        if (upsertError) throw upsertError
 
         processed += chunk.length
         progress.value = Math.round((processed / total) * 100)
       }
 
       // 關鍵：清除快取，避免前端 Gifts 頁面因為 LocalStorage Cache 而看不到新資料
       try {
         const CACHE_PREFIX = 'stock-souvenir:gifts:'
         Object.keys(localStorage).forEach(key => {
           if (key.startsWith(CACHE_PREFIX)) {
             localStorage.removeItem(key)
           }
         })
         console.log('[Import] 已清除所有紀念品快取')
       } catch (e) {
         console.warn('[Import] 清除快取失敗 (不影響匯入):', e)
       }
 
       return { success: true, count: total }

    } catch (e) {
      console.error('批量匯入失敗:', e)
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      uploading.value = false
    }
  }

  return {
    uploading,
    error,
    progress,
    parseFile,
    mapData,
    uploadToSouvenirs
  }
}
