import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-ignore
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
// @ts-ignore
import * as XLSX from "https://esm.sh/xlsx@0.18.5";
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GOODDIE_BASE_URL = 'https://www.gooddie.tw'
const APP_URL = Deno.env.get('APP_URL') || 'https://stock-souvenir.vercel.app'
const TARGET_YEAR = new Date().getFullYear().toString()

const GOODDIE_EMAIL = Deno.env.get('GOODDIE_EMAIL')
const GOODDIE_PASSWORD = Deno.env.get('GOODDIE_PASSWORD')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'


function extractCookies(res: Response) {
    // @ts-ignore
    const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : (res.headers.get('set-cookie')?.split(',') || []);
    return cookies.map(c => c.split(';')[0].trim()).join('; ');
}

// 計算資料指紋（用於偵測變化）
function calculateFingerprint(souvenirs: any[]) {
    const content = souvenirs
        .map(s => `${s.code}:${s.souvenir_item || 'null'}:${s.meeting_date || 'null'}`)
        .sort()
        .join('|')

    // 簡單的 hash 函式
    let hash = 0
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    return hash.toString(36)
}


// 計算剩餘天數
function getDaysRemaining(dateStr: string | null): number {
    if (!dateStr) return -1
    const targetDate = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffTime = targetDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// 解析日期字串
const parseDateString = (d: any) => {
    if (!d) return null
    const str = d.toString().trim()
    if (/^\d{5}$/.test(str)) {
        try {
            const date = new Date((parseInt(str) - 25569) * 86400 * 1000)
            return date.toISOString().split('T')[0]
        } catch (e) { return null }
    }

    const nums = str.match(/\d+/g)
    if (!nums || nums.length < 2) return null
    let y = TARGET_YEAR
    let m, day
    if (nums.length === 2) { m = nums[0]; day = nums[1] }
    else if (nums.length === 3) {
        y = nums[0].length === 4 ? nums[0] : (parseInt(nums[0]) + 1911).toString()
        m = nums[1]; day = nums[2]
    } else return null
    return `${y}-${m.padStart(2, '0')}-${day.padStart(2, '0')}`
}

async function loginToGooddie(): Promise<string> {
    if (!GOODDIE_EMAIL || !GOODDIE_PASSWORD) {
        throw new Error('Missing GOODDIE_EMAIL or GOODDIE_PASSWORD')
    }

    console.log('Attempting to login to Gooddie...')

    // 1. Get login page to extract VerificationToken
    const loginPageRes = await fetch(`${GOODDIE_BASE_URL}/Account/Login`, {
        headers: { 'User-Agent': USER_AGENT }
    })
    const loginHtml = await loginPageRes.text()
    const loginDoc = new DOMParser().parseFromString(loginHtml, "text/html")
    const token = loginDoc?.querySelector('input[name="__RequestVerificationToken"]')?.getAttribute('value')

    if (!token) throw new Error('Could not find __RequestVerificationToken')

    const initialCookies = extractCookies(loginPageRes)

    // 2. POST to Login
    const formData = new URLSearchParams()
    formData.append('Email', GOODDIE_EMAIL)
    formData.append('Password', GOODDIE_PASSWORD)
    formData.append('RememberMe', 'false')
    formData.append('__RequestVerificationToken', token)

    const loginRes = await fetch(`${GOODDIE_BASE_URL}/Account/Login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': USER_AGENT,
            'Cookie': initialCookies,
            'Referer': `${GOODDIE_BASE_URL}/Account/Login`
        },
        body: formData,
        redirect: 'manual'
    })

    const sessionCookies = extractCookies(loginRes)
    const allCookies = [initialCookies, sessionCookies].filter(Boolean).join('; ')

    console.log('Login successful, session cookies obtained.')
    return allCookies
}

async function fetchExcelData(cookies: string): Promise<any[]> {
    console.log(`Downloading Excel for year ${TARGET_YEAR}...`)
    const res = await fetch(`${GOODDIE_BASE_URL}/stock/meeting/${TARGET_YEAR}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': USER_AGENT,
            'Cookie': cookies,
            'Referer': `${GOODDIE_BASE_URL}/stock/meeting/${TARGET_YEAR}`
        },
        body: `Year=${TARGET_YEAR}&isDownload=true`
    })

    if (!res.ok) throw new Error(`Excel download failed: ${res.statusText}`)

    const buffer = await res.arrayBuffer()
    const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' })
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    console.log(`Excel parsed: ${jsonData.length} rows found. Mapping data...`)

    return jsonData.map((row: any) => {
        // 嘗試匹配常見欄位名稱
        const code = (row['股票代號'] || row['股號'] || row['代號'])?.toString().trim()
        const name = (row['股票名稱'] || row['股名'] || row['名稱'])?.trim()
        const souvenir = (row['紀念品內容'] || row['紀念品'] || row['禮物'])?.trim()
        const meetingDate = row['開會日期'] || row['日期'] || row['開會']
        const lastBuyDate = row['最後買進日'] || row['最後買進']

        return {
            doc_id: `${code}_${TARGET_YEAR}`,
            code: code,
            name: name,
            meeting_date: parseDateString(meetingDate),
            souvenir_item: souvenir,
            last_buy_date: parseDateString(lastBuyDate),
            source_url: GOODDIE_BASE_URL,
            updated_at: new Date().toISOString()
        }
    }).filter(r => r.code && /^\d{4,6}$/.test(r.code))
}

Deno.serve(async (req) => {
    // 1. Handle CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {

        const logEntry: any = {
            scraper_name: 'gooddie',
            status: 'running',
            items_processed: 0,
            message: '',
            created_at: new Date().toISOString()
        }

        const logs: string[] = []
        const addLog = (msg: string) => {
            console.log(msg)
            logs.push(msg)
        }

        let currentLogId: any = null
        const notifications: string[] = []

        // 1. Fetch Categories for matching
        const { data: categories } = await supabase
            .from('souvenir_categories')
            .select('*')
            .order('sort_order', { ascending: true })

        const matchCategory = (text: string | null) => {
            if (!text) return '其他'
            if (categories) {
                for (const cat of categories) {
                    if (cat.keywords && Array.isArray(cat.keywords)) {
                        // @ts-ignore
                        if (cat.keywords.some(k => text.includes(k))) {
                            return cat.name
                        }
                    }
                }
            }
            return '其他'
        }

        const isGiftCard = (text: string | null) => matchCategory(text) === '超商商品卡'

        try {
            addLog(`Starting Gooddie Scraper for year ${TARGET_YEAR}...`)
            logEntry.scraper_source = 'HTML' // 預設

            // 建立初始 log
            const { data: initialLog, error: initialLogError } = await supabase
                .from('scraper_logs')
                .insert(logEntry)
                .select()
                .single()

            if (initialLogError) {
                console.error('Failed to create initial log:', initialLogError)
            } else {
                currentLogId = initialLog.id
                addLog(`Log entry created: ${currentLogId}`)
            }

            let rowsToSync: any[] = []
            let scrapSource = 'HTML'

            // --- Step 0: Strategy A - Excel Scraping ---
            try {
                addLog('Step 0: Attempting Strategy A (Excel Scraping)...')
                const cookies = await loginToGooddie()
                rowsToSync = await fetchExcelData(cookies)

                if (rowsToSync.length > 0) {
                    scrapSource = 'Excel'
                    addLog(`Strategy A Successful: ${rowsToSync.length} rows fetched via Excel.`)
                } else {
                    throw new Error('Excel returned 0 rows')
                }
            } catch (excelError: any) {
                addLog(`Strategy A Failed: ${excelError.message}. Falling back to Strategy B...`)

                // --- Step 1: Strategy B - HTML Scraping (Fallback) ---
                addLog('Step 1: Scraping HTML content...')
                let page = 1; let hasNextPage = true; const scrapedRows: any[] = []

                while (hasNextPage && page <= 10) {
                    addLog(`Scraping HTML Page ${page}...`)
                    const pageRes = await fetch(`${GOODDIE_BASE_URL}/stock/meeting/${TARGET_YEAR}?Page=${page}`, { headers: { 'User-Agent': USER_AGENT } })
                    const html = await pageRes.text()
                    const pageDoc = new DOMParser().parseFromString(html, "text/html")
                    const cards = pageDoc?.querySelectorAll('.list .card') || []

                    if (cards.length === 0) break

                    for (const card of (cards as any)) {
                        const titleText = card.querySelector('a.text-truncate')?.textContent.trim() || ''
                        const parts = titleText.split(/\s+/)
                        const code = parts[0]; const name = parts[1]
                        if (!code || !/^\d{4,6}$/.test(code)) continue

                        // Extract souvenir item with multiple fallback strategies
                        let souvenirEl = card.querySelector('.col.text-truncate div[data-content]')
                        if (!souvenirEl) {
                            const textTruncateDiv = card.querySelector('.text-truncate[title]')
                            if (textTruncateDiv) {
                                souvenirEl = textTruncateDiv.querySelector('.form-row .col.text-truncate')
                            }
                        }
                        if (!souvenirEl) {
                            souvenirEl = card.querySelector('.col.text-truncate .text-truncate:last-child')
                        }

                        const souvenir = souvenirEl ? (souvenirEl.getAttribute('data-content') || souvenirEl.textContent.trim()) : ''

                        const getValByTitle = (titlePrefix: string) => {
                            const titleEl = (Array.from(card.querySelectorAll('.title')) as any[]).find((t: any) => t.textContent.includes(titlePrefix))
                            return (titleEl as any)?.closest('.form-row')?.querySelector('.col')?.textContent.replace('仍可買', '').trim() || ''
                        }

                        scrapedRows.push({
                            doc_id: `${code}_${TARGET_YEAR}`,
                            code: code,
                            name: name,
                            meeting_date: parseDateString(parts[2] || getValByTitle('開會')),
                            souvenir_item: souvenir,
                            last_buy_date: parseDateString(getValByTitle('最後買進日')),
                            source_url: GOODDIE_BASE_URL,
                            updated_at: new Date().toISOString()
                        })
                    }
                    if (pageDoc?.querySelector('a[rel="next"]')) page++
                    else hasNextPage = false
                }
                rowsToSync = scrapedRows
                scrapSource = 'HTML'
            }

            logEntry.scraper_source = scrapSource

            //過濾噪音文字
            rowsToSync = rowsToSync.map(row => {
                let s = row.souvenir_item
                if (s) {
                    if (s.includes('開會55日前') || s.includes('尚未公告') || (row.code && s.includes(row.code) && row.name && s.includes(row.name))) {
                        row.souvenir_item = null
                    }
                }
                return row
            })

            addLog(`Step 2: Syncing ${rowsToSync.length} rows (Source: ${scrapSource})...`)

            // --- Step 2: Deduplicate rowsToSync by doc_id before upsert ---
            const uniqueMap = new Map()
            const collisions: any[] = []

            for (const row of rowsToSync) {
                // Aggressive normalization: trim and remove non-printable characters
                const normalizedDocId = row.doc_id.toString()
                    .trim()
                    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")

                row.doc_id = normalizedDocId

                const existing = uniqueMap.get(normalizedDocId)
                if (existing) {
                    collisions.push({
                        id: normalizedDocId,
                        prev: { code: existing.code, name: existing.name, souvenir: existing.souvenir_item },
                        curr: { code: row.code, name: row.name, souvenir: row.souvenir_item }
                    })
                    // If existing row has no souvenir, but current one does, prefer current one
                    if (!existing.souvenir_item && row.souvenir_item) {
                        uniqueMap.set(normalizedDocId, row)
                    }
                } else {
                    uniqueMap.set(normalizedDocId, row)
                }
            }

            const originalCount = rowsToSync.length
            rowsToSync = Array.from(uniqueMap.values())

            if (collisions.length > 0) {
                const collisionSummary = collisions.slice(0, 3).map(c => `${c.id} (${c.prev.name} vs ${c.curr.name})`).join(', ')
                addLog(`Deduplication: Removed ${originalCount - rowsToSync.length} rows. Collisions: ${collisionSummary}${collisions.length > 3 ? '...' : ''}`)
                console.log('Detailed Collisions:', JSON.stringify(collisions, null, 2))
            } else {
                addLog(`Deduplication: All ${rowsToSync.length} rows are unique.`)
            }

            // --- Step 2: 查詢上次執行結果（用於比較變化）---
            const { data: lastLog } = await supabase
                .from('scraper_logs')
                .select('*')
                .eq('scraper_name', 'gooddie')
                .eq('status', 'success')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            const lastFingerprint = lastLog?.data_fingerprint || null
            const lastItemsProcessed = lastLog?.items_processed || 0

            // 計算本次指紋
            const currentFingerprint = calculateFingerprint(rowsToSync)
            const currentItemsProcessed = rowsToSync.length

            // --- Step 3: Upsert 資料並偵測變化 ---
            const updatedGifts: any[] = [] // 紀念品從空值→有內容的公司
            const addedGifts: any[] = [] // 本次新增的公司

            if (rowsToSync.length > 0) {
                // 先查詢現有資料（用於偵測紀念品更新）
                const { data: existingData } = await supabase
                    .from('souvenirs')
                    .select('doc_id, souvenir_item')
                    .in('doc_id', rowsToSync.map(r => r.doc_id))

                const existingMap = new Map(existingData?.map(e => [e.doc_id, e.souvenir_item]) || [])

                // Upsert
                const { error: upsertError } = await supabase
                    .from('souvenirs')
                    .upsert(rowsToSync, { onConflict: 'doc_id' })

                if (upsertError) throw upsertError

                // 偵測項目變化
                for (const row of rowsToSync) {
                    const oldSouvenir = existingMap.get(row.doc_id)
                    const isNewForYear = !existingMap.has(row.doc_id)
                    const newSouvenir = row.souvenir_item

                    const daysLeft = getDaysRemaining(row.last_buy_date)
                    if (daysLeft < 0) continue // 只提醒未過期的

                    // 獲取去年資料背景
                    let lastYearSouvenir = null
                    if (!newSouvenir || newSouvenir.includes('尚未公告') || newSouvenir.includes('開會55日前')) {
                        const lastYear = (parseInt(TARGET_YEAR) - 1).toString()
                        const { data: prevYearData } = await supabase
                            .from('souvenirs')
                            .select('souvenir_item')
                            .eq('doc_id', `${row.code}_${lastYear}`)
                            .maybeSingle()
                        lastYearSouvenir = prevYearData?.souvenir_item || null
                    }

                    const isOldSouvenirEmpty = !oldSouvenir || (typeof oldSouvenir === 'string' && (oldSouvenir.includes('尚未公告') || oldSouvenir.includes('開會55日前')))

                    const category = matchCategory(newSouvenir)

                    // 1. 偵測新增項目 (針對該年份)
                    if (isNewForYear) {
                        addedGifts.push({
                            code: row.code,
                            name: row.name,
                            souvenir: newSouvenir || '尚未公布',
                            category,
                            lastYearSouvenir,
                            lastBuyDate: row.last_buy_date,
                            daysLeft
                        })
                    }
                    // 2. 偵測紀念品更新 (舊資料為空或尚待公布 -> 現在有新內容)
                    else if (isOldSouvenirEmpty && newSouvenir) {
                        updatedGifts.push({
                            code: row.code,
                            name: row.name,
                            souvenir: newSouvenir,
                            category,
                            lastBuyDate: row.last_buy_date,
                            daysLeft
                        })
                    }
                }

                logEntry.items_processed = currentItemsProcessed
                logEntry.data_fingerprint = currentFingerprint
                logEntry.status = 'success'
            }

            // --- Step 4: 檢查是否需要發送通知 ---
            const hasChanges = (currentFingerprint !== lastFingerprint) || (currentItemsProcessed !== lastItemsProcessed)

            if (hasChanges) {
                // 分類列表
                const addedGiftCards = addedGifts.filter(g => g.category === '超商商品卡')
                const addedOthers = addedGifts.filter(g => g.category !== '超商商品卡')
                const updatedGiftCards = updatedGifts.filter(g => g.category === '超商商品卡')
                const updatedOthers = updatedGifts.filter(g => g.category !== '超商商品卡')

                const hasGiftCardUpdate = addedGiftCards.length > 0 || updatedGiftCards.length > 0

                // 通知類型 1: 爬蟲更新提醒
                let notification = `${hasGiftCardUpdate ? '🎁 商品卡更新提醒！' : '✅ Gooddie 更新提醒'} (${scrapSource})\n\n`
                notification += `本次處理：${currentItemsProcessed} 筆\n`

                if (lastItemsProcessed > 0) {
                    notification += `上次處理：${lastItemsProcessed} 筆\n`
                    const diff = currentItemsProcessed - lastItemsProcessed
                    if (diff > 0) {
                        notification += `變化：+${diff} 筆 📈\n`
                    } else if (diff < 0) {
                        notification += `變化：${diff} 筆 📉\n`
                    } else {
                        notification += `筆數相同，但內容有更新\n`
                    }
                }

                // A. 商品卡優先區
                if (hasGiftCardUpdate) {
                    notification += `\n💳 【 商品卡新公告 】\n`
                    const allGiftCards = [...addedGiftCards, ...updatedGiftCards]
                    allGiftCards.slice(0, 5).forEach(g => {
                        notification += `🌟 [${g.code}] ${g.name}\n`
                        notification += `  ${g.souvenir}\n`
                        const timeInfo = g.daysLeft === 0 ? `🔥 今天截止 (⚠️ 13:30前)` : `${g.lastBuyDate} (剩${g.daysLeft}天)`
                        notification += `  最後買進：${timeInfo}\n\n`
                    })
                }

                // B. 其他新增項目
                if (addedOthers.length > 0) {
                    notification += `\n🆕 其他新增項目：\n`
                    addedOthers.slice(0, 5).forEach(g => {
                        const catTag = g.category !== '其他' ? `[${g.category}] ` : ''
                        notification += `📌 ${g.code} ${g.name}\n`
                        if (g.souvenir === '尚未公布' && g.lastYearSouvenir) {
                            notification += `  紀念品：尚未公布\n  (去年參考：${g.lastYearSouvenir})\n`
                        } else {
                            notification += `  ${catTag}${g.souvenir}\n`
                        }
                        const timeInfo = g.daysLeft === 0 ? `🔥 今天截止 (⚠️ 13:30前)` : `${g.lastBuyDate} (剩${g.daysLeft}天)`
                        notification += `  最後買進：${timeInfo}\n\n`
                    })
                    if (addedOthers.length > 5) notification += `...及其他 ${addedOthers.length - 5} 家公司\n`
                }

                // C. 其他紀念品更新
                if (updatedOthers.length > 0) {
                    notification += `\n✨ 其他紀念品更新：\n`
                    updatedOthers.slice(0, 5).forEach(g => {
                        const catTag = g.category !== '其他' ? `[${g.category}] ` : ''
                        notification += `📌 ${g.code} ${g.name}\n`
                        notification += `  更新：${catTag}${g.souvenir}\n`
                        const timeInfo = g.daysLeft === 0 ? `🔥 今天截止 (⚠️ 13:30前)` : `${g.lastBuyDate} (剩${g.daysLeft}天)`
                        notification += `  最後買進：${timeInfo}\n\n`
                    })
                    if (updatedOthers.length > 5) notification += `...及其他 ${updatedOthers.length - 5} 家公司\n`
                }

                notification += `\n執行時間：${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`
                notification += `\n\n點擊查看您的庫存狀態：${APP_URL}/gifts`
                notifications.push(notification)
            }

            // --- Step 5: 最後買進日提醒（類型2B）---
            const today = new Date().toISOString().split('T')[0]
            const { data: todayLastBuyDate } = await supabase
                .from('souvenirs')
                .select('*')
                .eq('last_buy_date', today)
                .is('souvenir_item', null)

            if (todayLastBuyDate && todayLastBuyDate.length > 0) {
                // 檢查去年是否發放商品卡
                const lastYear = (parseInt(TARGET_YEAR) - 1).toString()
                const codesToCheck = todayLastBuyDate.map(s => s.code)

                const { data: lastYearData } = await supabase
                    .from('souvenirs')
                    .select('*')
                    .in('doc_id', codesToCheck.map(c => `${c}_${lastYear}`))

                const giftCardCompanies = lastYearData?.filter(s => isGiftCard(s.souvenir_item)) || []

                if (giftCardCompanies.length > 0) {
                    let notification = `⏰ 最後買進日提醒！\n\n`
                    notification += `以下公司「今天」是最後買進日，去年發放商品卡：\n\n`

                    giftCardCompanies.forEach(company => {
                        const current = todayLastBuyDate.find(s => s.code === company.code.replace(`_${lastYear}`, ''))
                        if (current) {
                            notification += `🔥 ${current.code} ${current.name}\n`
                            notification += `去年：${company.souvenir_item}\n`
                            notification += `最後買進日：🔥 今天截止 (⚠️ 13:30 前買進)\n\n`
                        }
                    })

                    notification += `今天是最後機會，請把握時間！⚠️`
                    notification += `\n\n點擊查看您的庫存狀態：${APP_URL}/gifts`
                    notifications.push(notification)
                }
            }

            // --- Step 6: 商品卡智慧提醒（類型2A，首次發現）---
            addLog('Step 6: Checking gift card smart reminders...')

            // 查詢當年度紀念品為空值的公司
            const { data: emptyGiftData } = await supabase
                .from('souvenirs')
                .select('*')
                .like('doc_id', `%_${TARGET_YEAR}`) // 只查詢當年度
                .is('souvenir_item', null)
                .not('last_buy_date', 'eq', today)

            if (emptyGiftData && emptyGiftData.length > 0) {
                const lastYear = (parseInt(TARGET_YEAR) - 1).toString()
                const codesToCheck = emptyGiftData.map(s => s.code)

                const { data: lastYearData } = await supabase
                    .from('souvenirs')
                    .select('*')
                    .in('doc_id', codesToCheck.map(c => `${c}_${lastYear}`))

                const giftCardCandidates: any[] = []
                lastYearData?.forEach(lastYearItem => {
                    if (isGiftCard(lastYearItem.souvenir_item)) {
                        const code = lastYearItem.code || lastYearItem.doc_id.replace(`_${lastYear}`, '')
                        const currentItem = emptyGiftData.find(e => e.code === code)
                        if (currentItem) {
                            const daysLeft = getDaysRemaining(currentItem.last_buy_date)
                            if (daysLeft >= 0) {
                                giftCardCandidates.push({
                                    code: currentItem.code,
                                    name: currentItem.name,
                                    lastYearGift: lastYearItem.souvenir_item,
                                    lastBuyDate: currentItem.last_buy_date,
                                    daysLeft
                                })
                            }
                        }
                    }
                })

                // 檢查是否已通知過（使用 scraper_logs 的 metadata 欄位記錄）
                // 簡化版：每次執行只通知一次，不跨日重複
                if (giftCardCandidates.length > 0) {
                    let notification = `💳 商品卡提醒 (${TARGET_YEAR}年度)\n\n`
                    notification += `以下公司去年發放商品卡，今年尚未公告：\n\n`

                    giftCardCandidates.slice(0, 5).forEach(c => {
                        notification += `📌 ${c.code} ${c.name}\n`
                        notification += `去年：${c.lastYearGift}\n`
                        notification += `最後買進日：${c.lastBuyDate} (還有${c.daysLeft}天)\n\n`
                    })

                    if (giftCardCandidates.length > 5) {
                        notification += `...及其他 ${giftCardCandidates.length - 5} 家公司\n\n`
                    }

                    notification += `共 ${giftCardCandidates.length} 家公司，建議持續關注 👀`
                    notification += `\n\n點擊查看您的庫存狀態：${APP_URL}/gifts`
                    notifications.push(notification)

                    addLog(`Found ${giftCardCandidates.length} companies with gift card history`)
                }
            }

            // --- 發送所有通知 ---
            for (const notification of notifications) {
                await sendLineBroadcast(notification)
            }

            logEntry.message = `Processed ${currentItemsProcessed} items via ${scrapSource}. Deduplicated ${originalCount - currentItemsProcessed} rows. Sent ${notifications.length} notifications.`

        } catch (error: any) {
            addLog(`Scraper Error: ${error.message}`)
            logEntry.status = 'error'
            logEntry.message = error.message

            // 錯誤通知
            const errorNotification = `❌ Gooddie 爬蟲執行失敗\n\n錯誤訊息：${error.message}\n時間：${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}\n\n請檢查爬蟲設定或網站狀態`
            await sendLineBroadcast(errorNotification)
        } finally {
            // 只在 message 為空時才設定詳細日誌（避免覆蓋成功/錯誤訊息）
            if (!logEntry.message) {
                logEntry.message = logs.join('\n')
            }

            // 更新資料庫記錄
            if (currentLogId) {
                await supabase.from('scraper_logs').update(logEntry).eq('id', currentLogId)
            } else {
                await supabase.from('scraper_logs').insert(logEntry)
            }
        }
        return new Response(JSON.stringify(logEntry), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    } catch (err: any) {
        console.error('Edge Function Error:', err)
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
    }
})

async function sendLineBroadcast(text: string) {
    const token = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')
    if (!token) {
        console.error('Missing LINE_CHANNEL_ACCESS_TOKEN')
        return
    }

    // 查詢所有啟用的群組
    const { data: activeGroups, error } = await supabase
        .from('line_groups')
        .select('group_id, group_name')
        .eq('is_active', true)

    if (error) {
        console.error('Error fetching active groups:', error)
        return
    }

    if (!activeGroups || activeGroups.length === 0) {
        console.log('No active groups to send notification')
        return
    }

    console.log(`Sending notification to ${activeGroups.length} active group(s)`)

    // 發送到所有啟用的群組
    for (const group of activeGroups) {
        try {
            const response = await fetch('https://api.line.me/v2/bot/message/push', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    to: group.group_id,
                    messages: [{ type: 'text', text: text }]
                })
            })

            if (response.ok) {
                console.log(`✅ Sent to group: ${group.group_name || group.group_id}`)

                // 更新最後活動時間
                await supabase
                    .from('line_groups')
                    .update({ last_active_at: new Date().toISOString() })
                    .eq('group_id', group.group_id)
            } else {
                const errorText = await response.text()
                console.error(`❌ Failed to send to group ${group.group_id}:`, errorText)
            }
        } catch (e) {
            console.error(`Error sending to group ${group.group_id}:`, e)
        }
    }
}

