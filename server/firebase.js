import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'

dotenv.config()

const firebaseKeyBase64 = process.env.FIREBASE_KEY_B64
if (!firebaseKeyBase64) throw new Error('找不到 FIREBASE_KEY_B64 環境變數')

// base64 decode
const firebaseKeyJson = Buffer.from(firebaseKeyBase64, 'base64').toString()
const firebaseConfig = JSON.parse(firebaseKeyJson)

const app = initializeApp({
  credential: cert(firebaseConfig)
})

export const db = getFirestore(app)
