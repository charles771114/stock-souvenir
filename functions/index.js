const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const pkg = require("pdfjs-dist/legacy/build/pdf.js");

const {getDocument} = pkg;
const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

// 放你的 /api/pdf/decrypt 路由
app.post("/api/pdf/decrypt", upload.single("file"), async (req, res) => {
  try {
    const fileBuffer = req.file?.buffer;
    const password = req.body?.password;

    if (!fileBuffer || !password) {
      return res.status(400).json({error: "請提供 PDF 檔案與密碼"});
    }

    const loadingTask = getDocument({
      data: new Uint8Array(fileBuffer.buffer),
      password,
    });
    const pdf = await loadingTask.promise;

    const lines = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      let currentLine = "";
      let lastY = null;

      for (const item of content.items) {
        const y = item.transform[5];
        if (lastY !== null && Math.abs(y - lastY) > 2) {
          lines.push(currentLine.trim());
          currentLine = "";
        }
        currentLine += item.str + " ";
        lastY = y;
      }

      if (currentLine) lines.push(currentLine.trim());
    }

    const stocks = [];
    const seen = new Set();

    const stockRowRegex = /([0-9]{4,6})\s+([\u4e00-\u9fa5A-Za-z（）、·‧．\-.]+)(?:\s|$)/;

    for (const line of lines) {
      const match = line.match(stockRowRegex);
      if (match) {
        const code = match[1];
        const name = match[2].replace(/\s.*/, "").trim(); // 清除名稱後的雜訊
        if (!seen.has(code)) {
          seen.add(code);
          stocks.push({code, name});
        }
      }
    }

    res.json({stocks});
  } catch (err) {
    console.error("[PDF 解密失敗]", err.message);
    res.status(500).json({error: "PDF 解密或讀取失敗，可能密碼錯誤或檔案損壞"});
  }
});

// HiStock 路由
app.get("/api/histock/gifts", async (req, res) => {
  const year = req.query.year || "2025";
  const url = `https://histock.tw/stock/gift.aspx?year=${year}`;

  try {
    const {data} = await axios.get(url, {responseType: "arraybuffer"});
    const html = iconv.decode(Buffer.from(data), "utf8");
    const $ = cheerio.load(html);

    const rows = [];
    $("table tr").each((_, tr) => {
      const td = $(tr).find("td");
      if (td.length < 9) return;

      const souvenir = td.eq(7).text().trim().replace(/參考圖/g, "");
      rows.push({
        number: td.eq(0).text().trim(),
        name: td.eq(1).text().trim(),
        price: parseFloat(td.eq(2).text()) || 0,
        lastBuy: td.eq(3).text().trim(),
        meetingDate: td.eq(4).text().trim(),
        meetingType: td.eq(5).text().trim(),
        location: td.eq(6).text().trim(),
        souvenir,
        oddLot: td.eq(8).text().trim() === "是",
      });
    });

    // 1. 做 hash 檢查是否與上次一樣
    const hash = crypto.createHash("md5").update(JSON.stringify(rows)).digest("hex");
    const metaRef = db.collection("histock_meta").doc(`year_${year}`);
    const metaSnap = await metaRef.get();

    if (metaSnap.exists && metaSnap.data().hash === hash) {
      console.log(`[${year}] 資料未變動，略過寫入`);
      return res.json({status: "nochange", rows});
    }

    // 2. 寫入 firestore（先清除舊的）
    const dataRef = db.collection("histock_gifts").doc(`year_${year}`);
    await dataRef.set({updatedAt: new Date(), rows});

    // 3. 更新 hash 紀錄
    await metaRef.set({hash, updatedAt: new Date()});

    res.json({status: "updated", rows});
  } catch (e) {
    res.status(500).json({error: "Histock 解析錯誤: " + e.message});
  }
});

// 匯出 Cloud Function
exports.api = functions.https.onRequest(app);
