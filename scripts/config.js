// scripts/config.js
// Supabase configuration
// No longer using Firebase
const projectId = null;
const region = 'asia-east1';

// 優先使用環境變數，否則組裝成本地 emulator 或雲端 function URL
const localEndpoint = `http://127.0.0.1:5001/${projectId}/${region}/getCompany?companyId=`;
const remoteEndpoint = `https://${region}-${projectId}.cloudfunctions.net/getCompany?companyId=`;

export const ENDPOINT = process.env.BATCH_ENDPOINT || (process.env.NODE_ENV === 'development' ? localEndpoint : remoteEndpoint);
