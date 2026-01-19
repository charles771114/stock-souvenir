// scripts/fetch-all.js
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import pLimit from 'p-limit';
import pRetry from 'p-retry';
import { fileURLToPath } from 'url';

import { COMPANIES } from './company-list.js';

/** ========= 可調參數（用環境變數覆蓋） ========= */
const ENDPOINT = process.env.BATCH_ENDPOINT || ''; // 例如: https://asia-east1-<project>.cloudfunctions.net/getCompany?companyId=
const CONCURRENCY = Number(process.env.CONCURRENCY || 5); // 併發數
const RETRIES = Number(process.env.RETRIES || 3);         // 每筆重試次數
const TIMEOUT = Number(process.env.TIMEOUT || 30000);     // 單筆逾時 ms
const JITTER_MS = Number(process.env.JITTER_MS || 150);   // 每請求前的抖動延遲，降低被擋風險
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : null; // 測試時只抓前 N 筆
const RESUME = String(process.env.RESUME || 'true').toLowerCase() !== 'false'; // 是否啟用續跑

/** ========= 安全性與前置 ========= */
if (!ENDPOINT) {
  console.error('❌ 未設定 BATCH_ENDPOINT。請先設定，例如：');
  console.error('   export BATCH_ENDPOINT="https://asia-east1-<project>.cloudfunctions.net/getCompany?companyId="');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.join(__dirname, '..', 'output');
fs.mkdirSync(outDir, { recursive: true });

const now = new Date();
const ts = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
  '-',
  String(now.getHours()).padStart(2, '0'),
  String(now.getMinutes()).padStart(2, '0'),
].join('');

const OUTPUT_JSON = path.join(outDir, `souvenirs-${ts}.json`);
const FAILED_JSON = path.join(outDir, 'failed.json');
const RESUME_JSON = path.join(outDir, '_resume.json');

/** ========= 準備公司清單 ========= */
function uniqById(list) {
  const map = new Map();
  for (const it of list) {
    if (!map.has(it.id)) map.set(it.id, it);
  }
  return Array.from(map.values());
}

let targets = uniqById(COMPANIES).sort((a, b) => a.id.localeCompare(b.id));
if (LIMIT && Number.isFinite(LIMIT)) {
  targets = targets.slice(0, LIMIT);
}

// 續跑：若有 _resume.json，就優先用其 pending 清單
if (RESUME && fs.existsSync(RESUME_JSON)) {
  try {
    const r = JSON.parse(fs.readFileSync(RESUME_JSON, 'utf-8'));
    if (Array.isArray(r.pending) && r.pending.length > 0) {
      const set = new Set(r.pending);
      targets = targets.filter((c) => set.has(c.id));
      console.log(`ℹ️ 續跑模式：從 _resume.json 載入 ${targets.length} 筆待處理`);
    }
  } catch (e) {
    console.warn('⚠️ _resume.json 解析失敗，忽略續跑：', e.message);
  }
}

if (targets.length === 0) {
  console.error('❌ 無待處理公司（COMPANIES 可能是空、或 LIMIT=0、或 _resume.json 沒有 pending）');
  process.exit(1);
}

console.log(`➡️ 準備抓取 ${targets.length} 家公司（併發=${CONCURRENCY}、重試=${RETRIES}、timeout=${TIMEOUT}ms）`);
console.log(`➡️ 目標端點：${ENDPOINT}(companyId)`);

/** ========= 請求工具 ========= */
const client = axios.create({
  timeout: TIMEOUT,
  headers: {
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'application/json, text/plain, */*',
  },
  validateStatus: (s) => s >= 200 && s < 500, // 讓 4xx 也能拿到 body
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** 呼叫單一公司 */
async function fetchOne(company) {
  const url = `${ENDPOINT}${encodeURIComponent(company.id)}`;

  // 抖動延遲，避免尖峰打爆
  if (JITTER_MS > 0) {
    await sleep(Math.floor(Math.random() * JITTER_MS));
  }

  // 用 p-retry 包一層
  return pRetry(
    async () => {
      const res = await client.get(url);
      if (res.status >= 400) {
        const msg = `HTTP ${res.status}`;
        const err = new Error(msg);
        err.code = 'HTTP_ERROR';
        err.status = res.status;
        err.body = typeof res.data === 'string' ? res.data.slice(0, 200) : res.data;
        throw err;
      }

      // 預期後端回傳 JSON；若不是，當作錯誤
      const data = res.data;
      if (data == null) throw new Error('Empty response');
      // 可在此做 schema 最小校驗
      return { companyId: company.id, companyName: company.name, market: company.market, ...data };
    },
    {
      retries: RETRIES,
      factor: 2,
      minTimeout: 500,
      maxTimeout: 4000,
      randomize: true,
      onFailedAttempt: (err) => {
        const { attemptNumber, retriesLeft } = err;
        console.warn(
          `⚠️ [${company.id} ${company.name}] 第 ${attemptNumber} 次失敗：${err.message}（剩餘重試 ${retriesLeft}）`
        );
      },
    }
  );
}

/** ========= 主流程 ========= */
const limit = pLimit(CONCURRENCY);
const results = [];
const failed = [];

let processed = 0;

function printProgress() {
  const ok = results.length;
  const ko = failed.length;
  const total = targets.length;
  const pct = ((processed / total) * 100).toFixed(1).padStart(5, ' ');
  process.stdout.write(
    `\r進度: ${processed}/${total} (${pct}%)  成功:${ok}  失敗:${ko}   `
  );
}

function writeCheckpoint() {
  // 寫最新成果
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(results, null, 2));
  fs.writeFileSync(FAILED_JSON, JSON.stringify(failed, null, 2));
  // 寫 pending 清單（續跑用）
  const done = new Set(results.map((r) => r.companyId));
  const errs = new Set(failed.map((r) => r.companyId));
  const pending = targets
    .map((c) => c.id)
    .filter((id) => !done.has(id) && !errs.has(id));
  fs.writeFileSync(RESUME_JSON, JSON.stringify({ pending }, null, 2));
}

async function main() {
  console.log(`\n📦 輸出檔：\n - ${OUTPUT_JSON}\n - ${FAILED_JSON}\n - ${RESUME_JSON}\n`);

  const jobs = targets.map((c) =>
    limit(async () => {
      try {
        const data = await fetchOne(c);
        results.push(data);
        console.log(`\n✅ ${c.id} ${c.name} -> OK`);
      } catch (e) {
        failed.push({
          companyId: c.id,
          companyName: c.name,
          market: c.market,
          error: e?.message || String(e),
          status: e?.status,
        });
        console.log(`\n❌ ${c.id} ${c.name} -> ${e?.message || e}`);
      } finally {
        processed += 1;
        printProgress();
        if (processed % 20 === 0 || processed === targets.length) {
          writeCheckpoint();
        }
      }
    })
  );

  await Promise.all(jobs);

  // 最終收尾
  writeCheckpoint();
  console.log('\n\n🎉 完成');
  console.log(`總計：成功 ${results.length}，失敗 ${failed.length}`);
  console.log(`結果檔案：${OUTPUT_JSON}`);
  if (failed.length) {
    console.log(`失敗清單：${FAILED_JSON}（下次會自動續跑未完成的 pending）`);
  }
}

main().catch((e) => {
  console.error('\n❌ 批次失敗：', e?.stack || e);
  process.exit(1);
});