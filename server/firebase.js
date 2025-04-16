// ✅ firebase.js
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// ✅ 從 base64 的環境變數解析 serviceAccount
const firebaseKeyBase64 = process.env.FIREBASE_KEY_B64
if (!firebaseKeyBase64) throw new Error('找不到 FIREBASE_KEY_B64 環境變數')

const serviceAccount = JSON.parse(
  Buffer.from(firebaseKeyBase64, 'base64').toString('utf8')
)

initializeApp({
  credential: cert(serviceAccount)
})

export const db = getFirestore()
