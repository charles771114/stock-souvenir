import * as pdfjsLib from 'pdfjs-dist'
import { ref } from 'vue'

import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

// Set worker path using local worker with Vite ?url suffix for reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export function usePDFScraper() {
  const loading = ref(false)
  const results = ref([])
  const error = ref(null)

  /**
   * Load and parse PDF file
   * @param {File} file 
   * @param {string} password 
   */
  const processPDF = async (file, password = '') => {
    loading.value = true
    error.value = null
    results.value = []

    try {
      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        password: password
      })

      const pdf = await loadingTask.promise
      const numPages = pdf.numPages
      const extractedData = []

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const strings = textContent.items.map(item => item.str)
        
        // Joined text for better regex matching
        const fullText = strings.join(' ')
        
        // Strategy: Look for the table header "證券代號"
        // This helps us avoid noise like account numbers or dates in the document header
        const headerIndex = fullText.indexOf('證券代號')
        if (headerIndex === -1) {
          // If header not found on this page, skip to next page
          continue
        }
        
        const bodyText = fullText.substring(headerIndex)

        // Regex explanation:
        // 1. (\d+)?\s* : Optional leading index (項次)
        // 2. (\d{4,6}) : Security Code (4-6 digits)
        // 3. \s+ : Separator
        // 4. ([\u4e00-\u9fa5A-Z0-9a-z...]+) : Security Name
        const regex = /(?:\d+\s+)?(\d{4,6})\s+([\u4e00-\u9fa5A-Z0-9a-z（）\(\)股份有限公司.\-_]+)/g
        
        let match
        while ((match = regex.exec(bodyText)) !== null) {
          const code = match[1]
          const name = match[2].trim()

          // Strict filters:
          // 1. If name is too short or just a date fragment (e.g. "月26日")
          if (name.length < 2) continue
          if (/^[年月0-9日\s]+$/.test(name)) continue // Purely date-like labels
          
          // 2. Skip common document labels
          const noiseLabels = ['產製時間', '帳號', '開戶日期', '戶名', '身分證', '統一編號', '證券代號', '證券名稱', '受控管', '借入', '市值']
          if (noiseLabels.some(label => name.includes(label))) continue
          
          // 3. Ensure code looks like a Taiwan stock code (usually not part of a longer sequence)
          // Since we matched 4-6 digits, we want to ensure it's not a fragment of a date or account number
          // We check the context around the match if possible, but the header boundary already helps.

          if (!extractedData.some(item => item.code === code)) {
            extractedData.push({ code, name })
          }
        }
      }

      results.value = extractedData
      return extractedData
    } catch (err) {
      console.error('PDF processing failed:', err)
      if (err.name === 'PasswordException') {
        error.value = 'PASSWORD_REQUIRED'
      } else {
        error.value = err.message || '解析 PDF 失敗'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    results,
    error,
    processPDF
  }
}
