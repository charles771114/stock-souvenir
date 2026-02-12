
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')
const LINE_NOTIFY_TARGET_ID = Deno.env.get('LINE_NOTIFY_TARGET_ID')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

serve(async (req) => {
    try {
        // Only allow POST requests (triggered by GitHub Actions/Cron)
        if (req.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 })
        }

        if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_NOTIFY_TARGET_ID) {
            console.error('Missing LINE configuration')
            return new Response('Missing LINE configuration', { status: 500 })
        }

        console.log('Starting daily notification check...')

        // 1. Calculate Time & Dates (UTC+8)
        const now = new Date()
        // Convert to UTC+8
        const offset = 8 * 60 * 60 * 1000
        const localNow = new Date(now.getTime() + offset)

        const currentHour = localNow.getUTCHours()
        const currentDay = localNow.getUTCDay() // 0=Sun, 1=Mon, ..., 6=Sat

        // Construct YYYY-MM-DD from localNow parts manually to avoid toISOString() UTC reversion
        const year = localNow.getUTCFullYear()
        const month = String(localNow.getUTCMonth() + 1).padStart(2, '0')
        const day = String(localNow.getUTCDate()).padStart(2, '0')
        const todayStr = `${year}-${month}-${day}`

        console.log(`Current Local Time (UTC+8): ${todayStr} ${currentHour}:00, Day: ${currentDay}`)

        // Weekends: Skip (Postpone logic handled on Monday)
        if (currentDay === 0 || currentDay === 6) {
            console.log('Today is weekend. Skipping notification.')
            return new Response('Weekend - Skipped', { status: 200 })
        }

        const targetDates: string[] = []

        // Logic based on Time
        // Range for 13:00 trigger (Final Call)
        const isFinalCall = currentHour === 13
        // Range for 21:00 trigger (Preparation)
        const isPrepRun = currentHour === 21

        if (!isFinalCall && !isPrepRun) {
            console.log('Not a scheduled hour. Defaulting to Prep Run logic for manual testing.')
        }

        // Rules:
        if (isFinalCall) {
            // 13:00 Logic: Only check today (Urgent)
            targetDates.push(todayStr)
        } else {
            // 21:00 Logic (or Manual default)

            // 1. "Tomorrow" (Today + 1)
            const d1 = new Date(localNow)
            d1.setUTCDate(localNow.getUTCDate() + 1)
            const t1 = `${d1.getUTCFullYear()}-${String(d1.getUTCMonth() + 1).padStart(2, '0')}-${String(d1.getUTCDate()).padStart(2, '0')}`
            targetDates.push(t1)

            // 2. "3 Days Later" (Today + 3) - DISABLED by User Request
            /*
            const d3 = new Date(localNow)
            d3.setUTCDate(localNow.getUTCDate() + 3)
            const t3 = `${d3.getUTCFullYear()}-${String(d3.getUTCMonth()+1).padStart(2,'0')}-${String(d3.getUTCDate()).padStart(2,'0')}`
            targetDates.push(t3)
            */

            // 3. Monday Catch-up for Prep Run
            // Note: Monday catch-up for Sunday's "3 Days Later" (which is Today+2) should also be disabled if we don't want future previews?
            // User said "3天後截止 這個可以後台先做開關先不要嗎" implies ignoring far-future previews.
            // Sunday+3 = Wed. On Monday, Wed is Today+2.
            // If we disable Today+3, we should probably disable Today+2 catchup too to be consistent.
            // I will comment it out for now.

            /*
            if (currentDay === 1) { // Monday
                // Sunday 21:00 was skipped.
                // Sunday checked: Sun+1 (Mon) -> Covered by Mon 13:00? No, prep for Mon was missed. 
                // But Mon 13:00 covers Mon urgency.
                // Sunday checked: Sun+3 (Wed) -> Today+2.
                
                // So on Monday 21:00, we need to notify for Wednesday (Today+2)
                const d2 = new Date(localNow)
                d2.setUTCDate(localNow.getUTCDate() + 2)
                 const t2 = `${d2.getUTCFullYear()}-${String(d2.getUTCMonth()+1).padStart(2,'0')}-${String(d2.getUTCDate()).padStart(2,'0')}`
                targetDates.push(t2)
                
                console.log('Monday Catch-up: Added Today+2 (Wed) target.')
            }
            */
        }

        // Remove duplicates
        const uniqueDates = [...new Set(targetDates)]
        console.log(`Target dates: ${uniqueDates.join(', ')}`)

        if (uniqueDates.length === 0) {
            return new Response('No targets for this hour', { status: 200 })
        }

        // 2. Query Souvenirs
        const { data: souvenirs, error: souvenirError } = await supabase
            .from('souvenirs')
            .select('*')
            .in('last_buy_date', uniqueDates)
            .order('last_buy_date', { ascending: true })

        if (souvenirError) {
            console.error('Souvenir fetch error:', souvenirError)
            throw souvenirError
        }

        if (!souvenirs || souvenirs.length === 0) {
            console.log('No souvenirs found for target dates.')
            return new Response('No notifications needed', { status: 200 })
        }

        // 3. Fetch Categories for matching
        const { data: categories } = await supabase
            .from('souvenir_categories')
            .select('*')
            .order('sort_order', { ascending: true })

        // 4. Group by Date Diff
        const itemsByDiff: Record<number, any[]> = {}

        souvenirs.forEach(item => {
            if (!item.last_buy_date) return
            const itemDate = new Date(item.last_buy_date) // This is UTC midnight
            // We need to compare with localNow date string
            // Actually, we can just diff strings or use timestamps
            // Use simple string diff
            const target = new Date(item.last_buy_date)
            // Reset localNow to midnight for comparison
            const todayMidnight = new Date(todayStr + 'T00:00:00') // Assume YYYY-MM-DD matches

            // Calculate diff in days
            const diffTime = target.getTime() - todayMidnight.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (!itemsByDiff[diffDays]) itemsByDiff[diffDays] = []
            itemsByDiff[diffDays].push(item)
        })

        const messageParts: string[] = []

        // Helper to format stock item (Keep existing helper logic)
        // Note: moved outside or ensure scope accessibility. 
        // Since replace_file_content replaces block, we need to ensure formatItem is accessible or refined.
        // Re-declaring helper here since previous block didn't encompass it fully? 
        // Wait, previous replace assumed formatItem exists. 
        // To be safe, I will output the logic that uses the EXISTING formatItem function.

        // Logical Order: 3 -> 2 -> 1 -> 0
        const sortedDiffs = Object.keys(itemsByDiff).map(Number).sort((a, b) => b - a)

        // Helper to format stock item
        const formatItem = async (item: any) => {
            // Match Category
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

            // Fetch Previous Year Info
            const currentYear = parseInt(item.year || new Date().getFullYear().toString())
            const year = item.meeting_date ? new Date(item.meeting_date).getFullYear() : currentYear
            const prevYear = year - 1

            const { data: prevData } = await supabase
                .from('souvenirs')
                .select('souvenir_item')
                .eq('code', item.code)
                .gte('meeting_date', `${prevYear}-01-01`)
                .lte('meeting_date', `${prevYear}-12-31`)
                .maybeSingle()

            const prevInfo = prevData?.souvenir_item ? `(去年：${prevData.souvenir_item})` : ''

            return `[${item.code}] ${item.name}\n${categoryName} - ${item.souvenir_item || '尚未公布'}\n${prevInfo}\n📅 最後買進日：${item.last_buy_date}`
        }

        for (const diff of sortedDiffs) {
            const list = itemsByDiff[diff]
            if (!list || list.length === 0) continue

            if (messageParts.length > 0) messageParts.push('\n---\n')

            let header = ''
            if (diff === 0) header = '【 🔥 今天截止 🔥 】'
            else if (diff === 1) header = '【 ⏳ 明天截止 】'
            else if (diff === 3) header = '【 剩 3 天 】'
            else header = `【 剩 ${diff} 天 (假日補通知) 】`

            messageParts.push(header)

            for (const item of list) {
                messageParts.push(await formatItem(item))
            }
        }

        // Footer
        messageParts.push('\n---\n👇 點擊查看您的庫存狀態：\nhttps://stock-souvenir.web.app/gifts')

        const fullMessage = `📢 股東會紀念品最後買進日提醒\n\n${messageParts.join('\n\n')}`

        console.log('Sending message:', fullMessage)

        // 5. Send Push Message
        await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
                to: LINE_NOTIFY_TARGET_ID,
                messages: [{ type: 'text', text: fullMessage }],
            }),
        })

        return new Response('Notification sent', { status: 200 })

    } catch (error) {
        console.error('Error:', error)
        return new Response('Internal Server Error', { status: 500 })
    }
})
