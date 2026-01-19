// scripts/fetch-gifts-batch.js
/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import dayjs from "dayjs";

const COMPANIES_FILE = path.resolve("output/companies.json");
const OUT_DIR = path.resolve("output");
const DEBUG_DIR = path.join(OUT_DIR, "debug");
const CACHE_FILE = path.join(OUT_DIR, "gifts-cache.json");
const CHECKPOINT_FILE = path.join(OUT_DIR, "gifts-checkpoint.json");

// 可用環境變數覆蓋
const YEAR_RANGE = Number(process.env.YEAR_RANGE || 2);  // 往回 N 年（含今年）
const DELAY_MS   = Number(process.env.DELAY_MS   || 900);
const MAX_RETRY  = Number(process.env.MAX_RETRY  || 2);
const START_AT   = process.env.START_AT || "";           // 續跑：從此代號開始（含）
const LIMIT      = Number(process.env.LIMIT || 0);       // 只處理前 N 家（0=不限制）

// 入口頁
const ENTRY = {
  sii: "https://mops.twse.com.tw/mops/web/t108sb16_q1", // 上市
  otc: "https://mops.twse.com.tw/mops/web/t108sb16_q2", // 上櫃
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const loadJSON = (file, fallback) => {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return fallback; }
};
const saveJSON = (file, obj) => fs.writeFileSync(file, JSON.stringify(obj, null, 2));

function normalizeText(s) {
  if (!s) return "";
  return s.replace(/\s+/g, " ").replace(/\u3000/g, " ").trim();
}

function locateColumns($table) {
  const $theadRow = $table.find("thead tr").first().length
    ? $table.find("thead tr").first()
    : $table.find("tr").first();
  const headers = [];
  $theadRow.find("th,td").each((_, th) => {
    const txt = normalizeText(cheerio.load(th).text());
    if (txt) headers.push(txt);
  });
  const idKeys = ["公司代號", "股票代號", "公司代碼", "證券代號"];
  const giftKeys = ["股東會紀念品", "紀念品", "股東紀念品"];
  let idIdx = -1, giftIdx = -1;
  headers.forEach((h, i) => {
    if (idIdx === -1 && idKeys.some(k => h.includes(k))) idIdx = i;
    if (giftIdx === -1 && giftKeys.some(k => h.includes(k))) giftIdx = i;
  });
  return { idIdx, giftIdx };
}

function parseSouvenirFromHtml(html, companyId) {
  const $ = cheerio.load(html);
  const found = [];

  // 先試表頭比對（較準）
  $("table").each((_, el) => {
    const $table = $(el);
    const { idIdx, giftIdx } = locateColumns($table);
    if (idIdx !== -1 && giftIdx !== -1) {
      $table.find("tbody tr").each((__, tr) => {
        const tds = $(tr).find("td");
        if (!tds.length) return;
        const idText = normalizeText($(tds[idIdx]).text());
        const giftText = normalizeText($(tds[giftIdx]).text());
        if (idText.startsWith(String(companyId)) && giftText) found.push(giftText);
      });
    }
  });

  if (found.length) return [...new Set(found)];

  // Fallback：整頁掃「紀念品」的 <td>/<p>/<li> 句子
  const corpus = [];
  $("td, p, li").each((_, el) => {
    const text = normalizeText($(el).text());
    if (!text) return;
    if (text.includes("紀念品")) corpus.push(text);
  });
  if (corpus.length) return [...new Set(corpus)];

  return [];
}

// 在同一個 page 內，以入口頁的 cookie/session 呼叫 AJAX 端點
async function fetchAjaxTableInPage(page, { typek, companyId, year }) {
  const AJAX = "https://mops.twse.com.tw/mops/web/ajax_t108sb16";
  await page.goto(ENTRY[typek], { waitUntil: "domcontentloaded", timeout: 60000 });

  const plans = (() => {
    const roc = year - 1911;
    return [
      { key: "co_id", y: roc, tag: "roc-co" },
      { key: "stock_id", y: roc, tag: "roc-stock" },
      { key: "co_id", y: year, tag: "gy-co" },
      { key: "stock_id", y: year, tag: "gy-stock" },
    ];
  })();

  for (const p of plans) {
    const result = await page.evaluate(async ({ AJAX, TYPEK, companyId, y, key }) => {
      const form = new URLSearchParams();
      form.set("encodeURIComponent", "1");
      form.set("step", "1");
      form.set("firstin", "1");
      form.set("off", "1");
      form.set("checkbtn", "on");
      form.set("TYPEK", TYPEK);
      form.set("YEAR", String(y));
      form.set("year", String(y));
      form.set("queryName", key);
      form.set("inpuType", key);
      if (key === "co_id") { form.set("co_id", String(companyId)); form.set("stock_id", ""); }
      else { form.set("stock_id", String(companyId)); form.set("co_id", ""); }

      try {
        const r = await fetch(AJAX, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "Accept": "text/html, */*; q=0.01",
            "Origin": "https://mops.twse.com.tw",
            "Referer": location.href,
          },
          body: form,
          credentials: "include",
        });
        const t = await r.text();
        return { ok: r.ok, status: r.status, len: t.length, html: t };
      } catch (e) {
        return { ok: false, status: 0, len: 0, html: String(e) };
      }
    }, { AJAX, TYPEK: typek, companyId, y: p.y, key: p.key });

    // 偵錯輸出 + 落地
    console.log(`[ajax ${typek} ${companyId} ${year} ${p.tag}] ok=${result.ok} status=${result.status} len=${result.len}`);
    if (!fs.existsSync(DEBUG_DIR)) fs.mkdirSync(DEBUG_DIR, { recursive: true });
    fs.writeFileSync(path.join(DEBUG_DIR, `${companyId}-${typek}-${year}-${p.tag}.html`), result.html || "");

    if (result.ok && result.len > 1200 && /<table/i.test(result.html)) {
      return result.html;
    }
  }
  return "";
}

// 備援：列表 → 詳細
async function fallbackByListThenDetail(page, { typek, companyId, year }) {
  const LIST = "https://mops.twse.com.tw/mops/web/ajax_t108sb17";
  await page.goto(ENTRY[typek], { waitUntil: "domcontentloaded", timeout: 60000 });
  const roc = year - 1911;

  // 1) 列表
  const list = await page.evaluate(async ({ LIST, TYPEK, companyId, roc }) => {
    const form = new URLSearchParams();
    form.set("encodeURIComponent","1");
    form.set("step","1");
    form.set("firstin","1");
    form.set("TYPEK", TYPEK);
    form.set("co_id", String(companyId));
    form.set("YEAR", String(roc));
    try {
      const r = await fetch(LIST, {
        method: "POST",
        headers: {"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8","X-Requested-With":"XMLHttpRequest"},
        body: form, credentials: "include"
      });
      return await r.text();
    } catch(e){ return ""; }
  }, { LIST, TYPEK: typek, companyId, roc });

  if (!list) return "";

  const $ = cheerio.load(list);
  const btn = $('input[value="詳細資料"]').first();
  if (!btn.length) return "";

  // 從 onclick 拿參數（常見 .seq_no.value='x' 或 .ppp.value='x'）
  const onclick = btn.attr("onclick") || "";
  const m = onclick.match(/document\.[^.]+\.(\w+)\.value='([^']+)'/);
  if (!m) return "";

  const [ , paramName, paramValue ] = m;
  const DETAIL = "https://mops.twse.com.tw/mops/web/ajax_t108sb16";

  // 2) 詳細
  const detail = await page.evaluate(async ({ DETAIL, TYPEK, companyId, paramName, paramValue, roc }) => {
    const form = new URLSearchParams();
    form.set("encodeURIComponent","1");
    form.set("step","2");
    form.set("firstin","0");
    form.set("TYPEK", TYPEK);
    form.set("co_id", String(companyId));
    form.set("YEAR", String(roc));
    form.set(paramName, String(paramValue));
    try {
      const r = await fetch(DETAIL, {
        method: "POST",
        headers: {"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8","X-Requested-With":"XMLHttpRequest"},
        body: form, credentials: "include"
      });
      return await r.text();
    } catch(e){ return ""; }
  }, { DETAIL, TYPEK: typek, companyId, paramName, paramValue, roc });

  // 落地偵錯
  if (!fs.existsSync(DEBUG_DIR)) fs.mkdirSync(DEBUG_DIR, { recursive: true });
  fs.writeFileSync(path.join(DEBUG_DIR, `${companyId}-${typek}-${year}-detail.html`), detail || "");

  return detail;
}

async function queryOneCompany(page, companyId) {
  const now = new Date();
  const years = Array.from({ length: YEAR_RANGE }, (_, i) => now.getFullYear() - i);
  const typeks = ["sii", "otc"]; // 先上市再上櫃

  for (const y of years) {
    for (const tk of typeks) {
      try {
        const html =
          (await fetchAjaxTableInPage(page, { typek: tk, companyId, year: y })) ||
          (await fallbackByListThenDetail(page, { typek: tk, companyId, year: y }));

        if (!html) continue;

        const texts = parseSouvenirFromHtml(html, companyId);
        if (texts.length) {
          // 描述（取第一筆），並做「未發放」判斷
          const desc = texts[0];
          const noGift = /(未\s*發放|不\s*發放).{0,6}紀念品/i.test(desc);
          return {
            year: y,
            hasGift: !noGift,
            description: desc,
            via: `ajax:${tk}`
          };
        }
      } catch (e) {
        // 繼續嘗試下一個
      }
    }
  }
  return { year: null, hasGift: false, description: "", via: null };
}

// —— 讀取公司清單（同時支援陣列/物件兩種格式） ——
function loadCompanyIds() {
  const raw = fs.readFileSync(COMPANIES_FILE, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error("❌ companies.json 解析失敗，內容前 200 字：", raw.slice(0, 200));
    throw e;
  }

  let list = [];
  if (Array.isArray(parsed)) {
    list = parsed.map(x =>
      String(x.id ?? x.companyId ?? x.code ?? x.stockCode ?? x).trim()
    );
  } else if (parsed && typeof parsed === "object") {
    list = Object.keys(parsed).map(k => String(k).trim());
  }
  list = list.filter(v => /^\d{3,4}$/.test(v)); // 僅 3~4 位數代號
  console.log("📦 讀到公司數量：", list.length);
  console.log("🪪 範例公司：", list.slice(0, 10));
  if (!list.length) console.warn("⚠️ companies.json 沒有可用代號，請確認檔案格式/路徑。");
  return list;
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  if (!fs.existsSync(DEBUG_DIR)) fs.mkdirSync(DEBUG_DIR, { recursive: true });

  const companies = loadCompanyIds();

  // 續跑控制
  let list = companies;
  if (START_AT) {
    const idx = companies.indexOf(String(START_AT));
    if (idx >= 0) list = companies.slice(idx);
  }
  if (LIMIT > 0) list = list.slice(0, LIMIT);

  const cache = loadJSON(CACHE_FILE, {}); // companyId -> result
  const checkpoint = loadJSON(CHECKPOINT_FILE, { done: [] });
  const doneSet = new Set(checkpoint.done || []);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8" });

  const results = [];
  let count = 0;

  for (const companyId of list) {
    if (doneSet.has(companyId)) {
      if (cache[companyId]) results.push({ companyId, ...cache[companyId] });
      continue;
    }

    let attempt = 0;
    let res;
    while (attempt <= MAX_RETRY) {
      attempt++;
      try {
        res = await queryOneCompany(page, companyId);
        break;
      } catch (e) {
        if (attempt > MAX_RETRY) throw e;
        await sleep(400 + attempt * 200);
      }
    }

    const row = { companyId, ...res };
    results.push(row);
    cache[companyId] = res;
    doneSet.add(companyId);

    // 即時保存（快取 + checkpoint）
    saveJSON(CACHE_FILE, cache);
    saveJSON(CHECKPOINT_FILE, { done: Array.from(doneSet) });

    count++;
    process.stdout.write(
      `\r[${count}/${list.length}] ${companyId} -> ${res.hasGift ? "🎁" : "—"} ${res.year || ""}     `
    );
    await sleep(DELAY_MS);
  }

  await browser.close();

  const stamp = dayjs().format("YYYYMMDD_HHmm");
  const outFile = path.join(OUT_DIR, `gifts-${stamp}.json`);
  saveJSON(outFile, results);
  console.log(`\n✅ 輸出完成：${outFile}`);
}

main().catch((e) => {
  console.error("批次錯誤：", e);
  process.exit(1);
});