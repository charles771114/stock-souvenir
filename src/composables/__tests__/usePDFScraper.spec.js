/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

// Mocking pdfjs-dist
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {
    workerSrc: ''
  },
  getDocument: vi.fn()
}))

// Mocking the worker import
vi.mock('pdfjs-dist/build/pdf.worker.mjs?url', () => ({
  default: 'mock-worker-url'
}))

import { usePDFScraper } from '../usePDFScraper'

// Polyfill for File.arrayBuffer which is missing in jsdom
if (typeof File !== 'undefined' && !File.prototype.arrayBuffer) {
  File.prototype.arrayBuffer = function() {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsArrayBuffer(this)
    })
  }
}

describe('usePDFScraper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fail if file is too small', async () => {
    const { processPDF, error } = usePDFScraper()
    const smallFile = new File(['abc'], 'test.pdf', { type: 'application/pdf' })

    await expect(processPDF(smallFile)).rejects.toThrow('檔案大小異常，請確認檔案是否正確')
    expect(error.value).toBe('檔案大小異常，請確認檔案是否正確')
  })

  it('should fail if file missing PDF header', async () => {
    const { processPDF, error } = usePDFScraper()
    const invalidFile = new File([new ArrayBuffer(20)], 'test.pdf', { type: 'application/pdf' })

    await expect(processPDF(invalidFile)).rejects.toThrow('檔案格式並非有效的 PDF 格式')
    expect(error.value).toBe('檔案格式並非有效的 PDF 格式')
  })

  it('should validate correctly with valid PDF header', async () => {
    const pdfjsLib = await import('pdfjs-dist')
    const mockPromise = Promise.resolve({
      numPages: 1,
      getPage: vi.fn().mockResolvedValue({
        getTextContent: vi.fn().mockResolvedValue({
          items: [{ str: '證券代號 2330 台積電' }]
        })
      })
    })
    pdfjsLib.getDocument.mockReturnValue({ promise: mockPromise })

    const { processPDF, results } = usePDFScraper()
    const validBuffer = new TextEncoder().encode('%PDF-1.5\n' + 'a'.repeat(20))
    const validFile = new File([validBuffer], 'test.pdf', { type: 'application/pdf' })

    const res = await processPDF(validFile)
    
    expect(res).toHaveLength(1)
    expect(res[0]).toEqual({ code: '2330', name: '台積電' })
    expect(results.value).toHaveLength(1)
  })

  it('should handle PasswordException', async () => {
    const pdfjsLib = await import('pdfjs-dist')
    const passwordError = new Error('Password required')
    passwordError.name = 'PasswordException'
    
    const passwordPromise = Promise.reject(passwordError)
    passwordPromise.catch(() => {}) // Prevent unhandled rejection warning
    
    pdfjsLib.getDocument.mockReturnValue({ 
      promise: passwordPromise
    })

    const { processPDF, error } = usePDFScraper()
    const validBuffer = new TextEncoder().encode('%PDF-1.5\n' + 'a'.repeat(20))
    const validFile = new File([validBuffer], 'test.pdf', { type: 'application/pdf' })

    await expect(processPDF(validFile)).rejects.toThrow('Password required')
    expect(error.value).toBe('PASSWORD_REQUIRED')
  })
})
