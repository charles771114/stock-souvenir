
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')
const LINE_NOTIFY_TARGET_ID = Deno.env.get('LINE_NOTIFY_TARGET_ID')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

serve(async (req) => {
    try {
        if (req.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 })
        }

        if (!LINE_CHANNEL_ACCESS_TOKEN) {
            console.error('Missing LINE configuration')
            return new Response('Missing LINE configuration', { status: 500 })
        }

        const now = new Date()
        const offset = 8 * 60 * 60 * 1000
        const localNow = new Date(now.getTime() + offset)

        const currentHour = localNow.getUTCHours()
        const currentDay = localNow.getUTCDay()

        const year = localNow.getUTCFullYear()
        const month = String(localNow.getUTCMonth() + 1).padStart(2, '0')
        const day = String(localNow.getUTCDate()).padStart(2, '0')
        const todayStr = `${year}-${month}-${day}`

        if (currentDay === 0 || currentDay === 6) {
            return new Response('Weekend - Skipped', { status: 200 })
        }

        const targetDates: string[] = []
        const isMorningPrep = currentHour === 9
        const isFinalCall = currentHour === 13

        if (isFinalCall || isMorningPrep) {
            targetDates.push(todayStr)
        }

        if (isMorningPrep) {
            const d1 = new Date(localNow)
            d1.setUTCDate(localNow.getUTCDate() + 1)
            const t1 = `${d1.getUTCFullYear()}-${String(d1.getUTCMonth() + 1).padStart(2, '0')}-${String(d1.getUTCDate()).padStart(2, '0')}`
            targetDates.push(t1)
        }

        const uniqueDates = [...new Set(targetDates)]
        if (uniqueDates.length === 0) return new Response('No targets for this hour', { status: 200 })

        const { data: souvenirs, error: souvenirError } = await supabase
            .from('souvenirs')
            .select('*')
            .in('last_buy_date', uniqueDates)
            .order('last_buy_date', { ascending: true })

        if (souvenirError) throw souvenirError
        if (!souvenirs || souvenirs.length === 0) return new Response('No notifications needed', { status: 200 })

        const { data: categories } = await supabase
            .from('souvenir_categories')
            .select('*')
            .order('sort_order', { ascending: true })

        const itemsByDiff: Record<number, any[]> = {}
        const todayMidnight = new Date(todayStr + 'T00:00:00')

        souvenirs.forEach(item => {
            if (!item.last_buy_date) return
            const target = new Date(item.last_buy_date)
            const diffDays = Math.ceil((target.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24))
            if (!itemsByDiff[diffDays]) itemsByDiff[diffDays] = []
            itemsByDiff[diffDays].push(item)
        })

        const formatItem = async (item: any, diff: number) => {
            let categoryName = '其他'
            if (categories) {
                for (const cat of categories) {
                    if (cat.keywords && Array.isArray(cat.keywords)) {
                        // @ts-ignore
                        if (cat.keywords.some(k => item.souvenir_item?.includes(k))) {
                            categoryName = cat.name
                            break
                        }
                    }
                }
            }
            const currentYear = parseInt(item.year || year.toString())
            const prevDocId = `${item.code}_${currentYear - 1}`
            const { data: prevData } = await supabase.from('souvenirs').select('souvenir_item').eq('doc_id', prevDocId).maybeSingle()
            const prevInfo = prevData?.souvenir_item ? `\n(去年：${prevData.souvenir_item})` : ''
            const timeWarning = (diff === 0) ? '🔥 今天截止 (⚠️ 13:30前買進)' : `📅 最後買進日：${item.last_buy_date}`
            return `[${item.code}] ${item.name}\n${categoryName} - ${item.souvenir_item || '尚未公布'}${prevInfo}\n${timeWarning}`
        }

        const messageParts: string[] = []

        // High Priority Gift Cards
        const giftCards = souvenirs.filter(s => {
            if (!s.souvenir_item) return false
            const giftCardCat = categories?.find(c => c.name === '超商商品卡')
            // @ts-ignore
            return giftCardCat?.keywords?.some(k => s.souvenir_item.includes(k))
        })

        if (giftCards.length > 0) {
            messageParts.push('💳 【 高優先：亮點商品卡 】')
            for (const item of giftCards) {
                const target = new Date(item.last_buy_date)
                const diff = Math.ceil((target.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24))
                messageParts.push(await formatItem(item, diff))
            }
            messageParts.push('\n---\n')
        }

        const sortedDiffs = Object.keys(itemsByDiff).map(Number).sort((a, b) => a - b)
        for (const diff of sortedDiffs) {
            const list = itemsByDiff[diff].filter(item => !giftCards.includes(item))
            if (list.length === 0) continue

            if (messageParts.length > 0 && messageParts[messageParts.length - 1] !== '\n---\n') {
                messageParts.push('\n---\n')
            }

            let header = ''
            if (diff === 0) header = '【 🔥 今天截止 🔥 】'
            else if (diff === 1) header = '【 ⏳ 明天截止 】'
            else header = `【 📅 ${diff} 天後截止 】`

            messageParts.push(header)
            for (const item of list) {
                messageParts.push(await formatItem(item, diff))
            }
        }

        messageParts.push('\n---\n點擊查看您的庫存狀態：\nhttps://stock-souvenir.vercel.app/gifts')

        const fullMessage = `📢 股東會紀念品最後買進日提醒\n\n${messageParts.join('\n\n')}`

        const { data: activeGroups } = await supabase.from('line_groups').select('group_id').eq('is_active', true)

        if (!activeGroups || activeGroups.length === 0) {
            if (LINE_NOTIFY_TARGET_ID) await sendPush(LINE_NOTIFY_TARGET_ID, fullMessage)
        } else {
            console.log(`Broadcasting to ${activeGroups.length} groups...`)
            for (const group of activeGroups) {
                await sendPush(group.group_id, fullMessage)
            }
        }

        return new Response('Notifications sent', { status: 200 })

    } catch (error) {
        console.error('Error:', error)
        return new Response('Internal Server Error', { status: 500 })
    }
})

async function sendPush(to: string, text: string) {
    const token = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')
    if (!token) return
    try {
        const response = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ to, messages: [{ type: 'text', text: text.slice(0, 5000) }] })
        })
        if (!response.ok) console.error(`Failed to send to ${to}:`, await response.text())
    } catch (e) {
        console.error(`Error sending push to ${to}:`, e)
    }
}
