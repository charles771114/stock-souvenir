// scripts/fetch-gifts-sinotrade.js
/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

const BASE = "https://www.sinotrade.com.tw/richclub/tools/gifts";
const OUT_DIR = path.resolve("output");
const DEBUG_DIR = path.join(OUT_DIR, "debug-sino");

// 參數：最多抓幾頁、每頁等待
const MAX_PAGES = Number(process.env.MAX_PAGES || 200);
const WAIT_MS   = Number(process.env.WAIT_MS || 1000);  // 每頁載入後等一下
const HEADLESS  = (process.env.HEADLESS ?? "1") !== "0";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function ensureDirs() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  if (!fs.existsSync(DEBUG_DIR)) fs.mkdirSync(DEBUG_DIR, { recursive: true });
}

function normalize(s) {
  return (s || "").replace(/\u3000/g, " ").replace(/\s+/g, " ").trim();
}

function extractRow(rowEl, $) {
  const text = normalize($(rowEl).text());

  let stockCode = '';
  let stockName = '';
  let gift = '';
  let lastBuy = '';
  let shareLimit = '';
  let stockPrice = '';
  let dividend = '';
  let industry = '';

  // 股號/股名
  const nameEl = $(rowEl).find("h6");
  if (nameEl) {
      const nameText = normalize(nameEl.text());
      const codeMatch = nameText.match(/^(\d{3,6})/);
      if(codeMatch) {
          stockCode = codeMatch[1];
          stockName = nameText.replace(stockCode, '').trim();
      }
  }

  // 紀念品
  const giftEl = $(rowEl).find("p:first-child");
  if(giftEl) {
      gift = normalize(giftEl.find('span').text());
  }

  // 最後買進日 & 配息
  const dateDiv = $(rowEl).find("p:last-child");
  if(dateDiv) {
      const dateText = normalize(dateDiv.text());
      const lastBuyMatch = dateText.match(/最後買進日：(\d{4}[.\/-]\d{2}[.\/-]\d{2})/);
      if (lastBuyMatch) {
          lastBuy = lastBuyMatch[1].replace(/[.\/]/g, '-');
      }
      const dividendMatch = dateText.match(/配息：([^\s]+)/);
      if (dividendMatch) {
          dividend = dividendMatch[1];
      }
  }


  // 股價
  const priceEl = $(rowEl).find("div[class*='dhohrt']");
  if(priceEl) {
      const priceText = normalize(priceEl.text());
      const priceMatch = priceText.match(/^([\d.]+)/);
      if(priceMatch) {
          stockPrice = priceMatch[1];
      }
  }


  // 股數限制
  const shareLimitEl = $(rowEl).find("div[class*='kTReuq'] span:first-child");
  if(shareLimitEl) {
      shareLimit = normalize(shareLimitEl.text());
  }


  // 產業
  const industryMatch = text.match(/([^\d\s]+)\s*\d+\s*$/);
  if (industryMatch) {
    industry = industryMatch[1];
  }


  return {
    '股號': stockCode,
    '股名': stockName,
    '2025 紀念品': gift,
    '最後買進日': lastBuy,
    '股數限制': shareLimit,
    '股價': stockPrice,
    '2024 配息': dividend,
    '產業': industry,
    rawText: text,
  };
}


async function main() {
  ensureDirs();

  const browser = await puppeteer.launch({
    headless: HEADLESS ? "new" : false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8" });

  await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });

  let pageNo = 1;
  const all = [];
  let totalPages = 1; // will be updated

  for (; pageNo <= totalPages; pageNo++) {
    await sleep(WAIT_MS);

    // 保存原始頁面（除錯用）
    const html = await page.content();
    fs.writeFileSync(path.join(DEBUG_DIR, `sino-page-${String(pageNo).padStart(3,"0")}.html`), html);

    const $ = cheerio.load(html);

    if (pageNo === 1) {
        const nextData = $('#__NEXT_DATA__').html();
        if(nextData) {
            const data = JSON.parse(nextData);
            totalPages = Math.ceil(data.props.pageProps.list.total / 10);
            if (totalPages > MAX_PAGES) {
                totalPages = MAX_PAGES;
            }
            console.log(`總共有 ${totalPages} 頁資料`);
        }
    }

    const rows = $("div[class*='sc-cfb85aee-0'] > div[class*='sc-cfb85aee-1']");
    console.log(`頁 ${pageNo} 抓到 ${rows.length} 列`);

    rows.each((i, el) => {
        const item = extractRow(el, $);
        all.push(item);
    });


    if (pageNo < totalPages) {
        try {
            await page.evaluate(() => {
                const nextButton = document.querySelector("ul[class^='sc-'] li:last-child button");
                if(nextButton) nextButton.click();
            });
            await sleep(WAIT_MS); // Wait for the content to load
        } catch (e) {
            console.error(`Clicking next page failed on page ${pageNo}:`, e);
            break;
        }
    }
  }

  // 清洗去重（同股票同禮品同日期視為同一筆）
  const key = (r) => [r['股號'], r['2025 紀念品'], r['最後買進日']].join("|");
  const dedup = [];
  const seen = new Set();
  for (const r of all) {
    if(!r['股號']) continue;
    const k = key(r);
    if (seen.has(k)) continue;
    seen.add(k);
    dedup.push(r);
  }

  const stamp = dayjs().format("YYYYMMDD_HHmm");
  const outFile = path.join(OUT_DIR, `sinotrade-gifts-${stamp}.json`);
  fs.writeFileSync(outFile, JSON.stringify(dedup, null, 2));
  console.log(`✅ 完成，共 ${dedup.length} 筆 → ${outFile}`);

  await browser.close();
}

main().catch((e) => {
  console.error("發生錯誤：", e);
  process.exit(1);
});