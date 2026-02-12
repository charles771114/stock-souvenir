import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-ignore
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GOODDIE_BASE_URL = 'https://www.gooddie.tw'
const TARGET_YEAR = new Date().getFullYear().toString()

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// 商品卡關鍵字
const GIFT_CARD_KEYWORDS = [
    '商品卡', '禮物卡', '提貨券', '禮券', '購物金',
    '全家', 'FamilyMart', '7-11', '7-ELEVEN', '統一超商',
    '萊爾富', 'Hi-Life', '家樂福', 'Carrefour',
    'Gift Card', 'Voucher', 'Coupon'
]

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

// 檢查是否為商品卡
function isGiftCard(souvenirText: string | null): boolean {
    if (!souvenirText) return false
    return GIFT_CARD_KEYWORDS.some(keyword => souvenirText.includes(keyword))
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

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

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

    try {
        addLog(`Starting Gooddie Scraper for year ${TARGET_YEAR}...`)

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

        // Helper to parse dates
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

        // --- Step 1: HTML Scraping ---
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
                    doc_id: code,
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

        // Filter out noisy souvenir texts
        const rowsToSync = scrapedRows.map(row => {
            let s = row.souvenir_item
            if (s) {
                if (s.includes('開會55日前') || s.includes('尚未公告') || (row.code && s.includes(row.code) && row.name && s.includes(row.name))) {
                    row.souvenir_item = null
                }
            }
            return row
        })

        addLog(`Step 2: Syncing ${rowsToSync.length} rows...`)

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

        if (rowsToSync.length > 0) {
            // 先查詢現有資料（用於偵測紀念品更新）
            const { data: existingData } = await supabase
                .from('souvenirs')
                .select('code, souvenir_item')
                .in('code', rowsToSync.map(r => r.code))

            const existingMap = new Map(existingData?.map(e => [e.code, e.souvenir_item]) || [])

            // Upsert
            const { error: upsertError } = await supabase
                .from('souvenirs')
                .upsert(rowsToSync, { onConflict: 'doc_id' })

            if (upsertError) throw upsertError

            // 偵測紀念品更新（空值→有內容）
            rowsToSync.forEach(row => {
                const oldSouvenir = existingMap.get(row.code)
                const newSouvenir = row.souvenir_item

                // 檢查是否從空值變為有內容
                if ((!oldSouvenir || oldSouvenir.includes('尚未公告') || oldSouvenir.includes('開會55日前')) && newSouvenir) {
                    const daysLeft = getDaysRemaining(row.last_buy_date)
                    if (daysLeft >= 0) { // 只提醒未過期的
                        updatedGifts.push({
                            code: row.code,
                            name: row.name,
                            souvenir: newSouvenir,
                            lastBuyDate: row.last_buy_date,
                            daysLeft
                        })
                    }
                }
            })

            logEntry.items_processed = currentItemsProcessed
            logEntry.data_fingerprint = currentFingerprint
            logEntry.status = 'success'
        }

        // --- Step 4: 檢查是否需要發送通知 ---
        const hasChanges = (currentFingerprint !== lastFingerprint) || (currentItemsProcessed !== lastItemsProcessed)

        if (hasChanges) {
            // 通知類型 1: 爬蟲更新提醒
            let notification = `✅ Gooddie 更新提醒\n\n`
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

            // 紀念品更新
            if (updatedGifts.length > 0) {
                notification += `\n紀念品更新：\n`
                updatedGifts.slice(0, 5).forEach(g => {
                    notification += `📌 ${g.code} ${g.name}\n`
                    notification += `  更新：${g.souvenir} ✨\n`
                    notification += `  最後買進日：${g.lastBuyDate} (還有${g.daysLeft}天)\n\n`
                })
                if (updatedGifts.length > 5) {
                    notification += `...及其他 ${updatedGifts.length - 5} 家公司\n`
                }
            }

            notification += `\n執行時間：${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`
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
                        notification += `最後買進日：今天！(${today})\n\n`
                    }
                })

                notification += `今天是最後機會，請把握時間！⚠️`
                notifications.push(notification)
            }
        }

        // --- Step 6: 商品卡智慧提醒（類型2A，首次發現）---
        addLog('Step 6: Checking gift card smart reminders...')

        // 查詢當年度紀念品為空值的公司（不包含今天是最後買進日的，避免重複）
        const { data: emptyGiftData } = await supabase
            .from('souvenirs')
            .select('*')
            .not('doc_id', 'like', `%_%`) // 只查詢當年度（doc_id 不包含 _）
            .is('souvenir_item', null)
            .not('last_buy_date', 'eq', today) // 排除今天是最後買進日的（已在 Step 5 處理）

        if (emptyGiftData && emptyGiftData.length > 0) {
            // 查詢去年資料
            const lastYear = (parseInt(TARGET_YEAR) - 1).toString()
            const codesToCheck = emptyGiftData.map(s => s.code)

            const { data: lastYearData } = await supabase
                .from('souvenirs')
                .select('*')
                .in('doc_id', codesToCheck.map(c => `${c}_${lastYear}`))

            // 篩選出去年發放商品卡的公司
            const giftCardCandidates: any[] = []
            lastYearData?.forEach(lastYearItem => {
                if (isGiftCard(lastYearItem.souvenir_item)) {
                    const code = lastYearItem.code || lastYearItem.doc_id.replace(`_${lastYear}`, '')
                    const currentItem = emptyGiftData.find(e => e.code === code)
                    if (currentItem) {
                        const daysLeft = getDaysRemaining(currentItem.last_buy_date)
                        if (daysLeft >= 0) { // 只提醒未過期的
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
                notifications.push(notification)

                addLog(`Found ${giftCardCandidates.length} companies with gift card history`)
            }
        }

        // --- 發送所有通知 ---
        for (const notification of notifications) {
            await sendLineBroadcast(notification)
        }

        logEntry.message = `Processed ${currentItemsProcessed} items. Sent ${notifications.length} notifications.`

    } catch (error: any) {
        addLog(`Scraper Error: ${error.message}`)
        logEntry.status = 'error'
        logEntry.message = error.message

        // 錯誤通知
        const errorNotification = `❌ Gooddie 爬蟲執行失敗\n\n錯誤訊息：${error.message}\n時間：${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}\n\n請檢查爬蟲設定或網站狀態`
        await sendLineBroadcast(errorNotification)
    } finally {
        logEntry.message = logs.join('\n')
        if (currentLogId) await supabase.from('scraper_logs').update(logEntry).eq('id', currentLogId)
        else await supabase.from('scraper_logs').insert(logEntry)
    }
    return new Response(JSON.stringify(logEntry), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
})

async function sendLineBroadcast(text: string) {
    const token = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')
    const target = Deno.env.get('LINE_NOTIFY_TARGET_ID')
    if (!token || !target) return
    await fetch('https://api.line.me/v2/bot/message/push', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ to: target, messages: [{ type: 'text', text: text }] }) })
}
