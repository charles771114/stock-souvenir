import { supabase } from '@/lib/supabase'
import { ref } from 'vue'
import * as XLSX from 'xlsx'

export function useInventoryImport() {
    const uploading = ref(false)
    const error = ref(null)
    const progress = ref(0) // 0-100

    /**
     * 解析 Excel/CSV 檔案
     * @param {File} file 
     * @returns {Promise<Array>}
     */
    const parseFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = (e) => {
                try {
                    const data = e.target.result
                    // Specifying codepage: 65001 (UTF-8) ensures correct parsing of UTF-8 encoded CSVs/Text
                    // when read as binary string.
                    const workbook = XLSX.read(data, { type: 'binary', codepage: 65001 })

                    // 假設讀取第一個 Sheet
                    const firstSheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[firstSheetName]

                    // 轉換為 JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet)
                    resolve(jsonData)
                } catch (err) {
                    reject(new Error('檔案解析失敗: ' + err.message))
                }
            }

            reader.onerror = (err) => reject(err)
            reader.readAsBinaryString(file)
        })
    }

    /**
     * 批次上傳至 Staging Table
     * @param {Array} parsedData - 解析後的資料陣列
     * @param {Number} year - 選擇的年度
     */
    const uploadToStaging = async (parsedData, year) => {
        uploading.value = true
        error.value = null
        progress.value = 0

        try {
            if (!year) throw new Error('請選擇年度')
            if (!parsedData || parsedData.length === 0) throw new Error('無有效資料')

            // 1. 產生 Batch ID
            const batchId = crypto.randomUUID()

            // 2. 轉換資料格式
            // 假設 excel 欄位名稱可能是中文，需要 Mapping
            // 預期欄位: 股票代號, 股票名稱, 姓名
            // Mapping table
            const mapRow = (row) => {
                // 嘗試多種可能的欄位名稱
                const code = row['股票代號'] || row['代號'] || row['Code'] || row['stock_code']
                const name = row['股票名稱'] || row['名稱'] || row['Name'] || row['stock_name']
                const owner = row['姓名'] || row['Owner'] || row['owner_name']

                if (!owner) return null // 姓名是必須的

                return {
                    import_batch_id: batchId,
                    year: parseInt(year),
                    stock_code: code ? String(code).trim() : null,
                    stock_name: name ? String(name).trim() : null,
                    owner_name: String(owner).trim(),
                    status: 'PENDING'
                }
            }

            const rowsToInsert = parsedData.map(mapRow).filter(r => r !== null)

            if (rowsToInsert.length === 0) throw new Error('找不到有效的資料欄位 (需包含「姓名」)')

            // 3. 批次寫入 (Supabase 建議每次不要超過 1000 筆)
            const BATCH_SIZE = 500
            const total = rowsToInsert.length
            let processed = 0

            for (let i = 0; i < total; i += BATCH_SIZE) {
                const chunk = rowsToInsert.slice(i, i + BATCH_SIZE)

                const { error: insertError } = await supabase
                    .from('inventory_staging')
                    .insert(chunk)

                if (insertError) throw insertError

                processed += chunk.length
                progress.value = Math.round((processed / total) * 100)
            }

            return { success: true, count: total, batchId }

        } catch (e) {
            console.error('上傳失敗:', e)
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
        uploadToStaging
    }
}
