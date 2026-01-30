import { ref } from 'vue'

import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

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
      // Lazy load pdfjs-dist library
      const pdfjsLib = await import('pdfjs-dist')
      // Set worker path
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        password: password
      })

      const pdf = await loadingTask.promise
      const numPages = pdf.numPages

      // Parallelize page processing
      const pagePromises = Array.from({ length: numPages }, (_, i) => i + 1).map(async (pageNum) => {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        const strings = textContent.items.map(item => item.str)
        const fullText = strings.join(' ')

        const headerIndex = fullText.indexOf('證券代號')
        if (headerIndex === -1) return []

        const bodyText = fullText.substring(headerIndex)
        const regex = /(?:\d+\s+)?(\d{4,6})\s+([\u4e00-\u9fa5A-Z0-9a-z（）\(\)股份有限公司.\-_]+)/g

        const pageResults = []
        let match
        while ((match = regex.exec(bodyText)) !== null) {
          const code = match[1]
          const name = match[2].trim()

          if (name.length < 2) continue
          if (/^[年月0-9日\s]+$/.test(name)) continue

          const noiseLabels = ['產製時間', '帳號', '開戶日期', '戶名', '身分證', '統一編號', '證券代號', '證券名稱', '受控管', '借入', '市值']
          if (noiseLabels.some(label => name.includes(label))) continue

          pageResults.push({ code, name })
        }
        return pageResults
      })

      const allPagesResults = await Promise.all(pagePromises)

      // Flatten and deduplicate
      const flatResults = allPagesResults.flat()
      const seenCodes = new Set()
      const uniqueResults = []

      for (const item of flatResults) {
        if (!seenCodes.has(item.code)) {
          seenCodes.add(item.code)
          uniqueResults.push(item)
        }
      }

      results.value = uniqueResults
      return uniqueResults
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
