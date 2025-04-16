import express from 'express'
import axios from 'axios'
import * as cheerio from 'cheerio'
import iconv from 'iconv-lite'
import multer from 'multer'
import pkg from 'pdfjs-dist/legacy/build/pdf.js'
import cors from 'cors'
import { db } from './firebase.js'
import crypto from 'crypto'

// ✅ 匯入 Firestore 同步函式
import { updateToFirestore } from './syncFirestore.js'

const { getDocument } = pkg
const app = express()
const upload = multer()

app.use(cors())
app.use(express.json())

/**
 * 取得 Firestore 中的股東紀念品資料
 */
app.get('/api/firestore/gifts', async (req, res) => {
  try {
    const snapshot = await db.collection('souvenirs').get()
    const data = snapshot.docs.map(doc => doc.data())
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: '讀取 Firestore 錯誤' })
  }
})

/**
 * 🔁 由前端觸發：手動同步 Firestore
 */
app.post('/api/firestore/sync', async (req, res) => {
  try {
    await updateToFirestore()
    res.json({ success: true, message: '同步完成' })
  } catch (err) {
    console.error('❌ 同步失敗：', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * 🔓 PDF 解密 API：解析上傳的 PDF 並提取代碼與名稱
 */
app.post('/api/pdf/decrypt', upload.single('file'), async (req, res) => {
  try {
    const fileBuffer = req.file?.buffer
    const password = req.body?.password

    if (!fileBuffer || !password) {
      return res.status(400).json({ error: '請提供 PDF 檔案與密碼' })
    }

    const loadingTask = getDocument({
      data: new Uint8Array(fileBuffer.buffer),
      password
    })

    const pdf = await loadingTask.promise
    const lines = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      let currentLine = ''
      let lastY = null

      for (const item of content.items) {
        const y = item.transform[5]
        if (lastY !== null && Math.abs(y - lastY) > 2) {
          lines.push(currentLine.trim())
          currentLine = ''
        }
        currentLine += item.str + ' '
        lastY = y
      }

      if (currentLine) lines.push(currentLine.trim())
    }

    const stocks = []
    const seen = new Set()
    const stockRowRegex = /([0-9]{4,6})\s+([\u4e00-\u9fa5A-Za-z（）、·‧．\-.]+)(?:\s|$)/

    for (const line of lines) {
      const match = line.match(stockRowRegex)
      if (match) {
        const code = match[1]
        const name = match[2].replace(/\s.*/, '').trim()
        if (!seen.has(code)) {
          seen.add(code)
          stocks.push({ code, name })
        }
      }
    }

    res.json({ stocks })
  } catch (err) {
    console.error('[PDF 解密失敗]', err.message)
    res.status(500).json({ error: 'PDF 解密或讀取失敗，可能密碼錯誤或檔案損壞' })
  }
})

// 啟動伺服器
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`✅ API server is running at http://localhost:${PORT}`)
})

