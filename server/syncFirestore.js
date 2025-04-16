// 導入套件
import axios from 'axios'              // 用來發送 HTTP 請求
import * as cheerio from 'cheerio'     // HTML DOM 解析
import iconv from 'iconv-lite'         // 解決網頁編碼問題
import { db } from './firebase.js'     // 引入 Firebase 初始化後的 db 連線

/**
 * 步驟一：從 histock 爬取股東紀念品資料
 */
async function fetchGiftData(year = 2025) {
  const url = `https://histock.tw/stock/gift.aspx?year=${year}`
  const { data } = await axios.get(url, { responseType: 'arraybuffer' })
  const html = iconv.decode(Buffer.from(data), 'utf8')
  const $ = cheerio.load(html)
  const rows = []

  $('table tr').each((_, tr) => {
    const td = $(tr).find('td')
    if (td.length < 9) return  // 若欄位不足則略過

    const souvenir = td.eq(7).text().replace(/參考圖/g, '').trim()
    const code = td.eq(1).text().trim()
    
    rows.push({
      number: td.eq(0).text().trim(),
      code,
      name: td.eq(1).text().trim(),
      price: parseFloat(td.eq(2).text()) || 0,
      lastBuy: td.eq(3).text().trim(),
      meetingDate: td.eq(4).text().trim(),
      meetingType: td.eq(5).text().trim(),
      location: td.eq(6).text().trim(),
      souvenir,
      oddLot: td.eq(8).text().trim() === '是'
    })
  })

  return rows
}

/**
 * 步驟二：更新 Firebase Firestore
 */
export async function updateToFirestore() {
  const data = await fetchGiftData()

  const ref = db.collection('souvenirs')
  const snapshot = await ref.get()
  const old = snapshot.docs.map(doc => doc.data())

  const hasChanged = JSON.stringify(old) !== JSON.stringify(data)
  if (!hasChanged) {
    console.log('🔁 無變化，跳過寫入')
    return
  }

  const batch = db.batch()
  data.forEach(item => {
    const docRef = ref.doc(item.code)
    batch.set(docRef, item)
  })

  await batch.commit()
  console.log(`✅ Firestore 同步完成，共 ${data.length} 筆`)
}

// ✅ 如果直接執行此檔案，也可以測試執行更新功能
if (import.meta.url === `file://${process.argv[1]}`) {
  updateToFirestore().catch(err => {
    console.error('❌ 同步失敗:', err.message)
  })
}
