
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function processNotifications(supabase: any, localNow: Date, config: { LINE_CHANNEL_ACCESS_TOKEN: string, LINE_NOTIFY_TARGET_ID?: string, dryRun?: boolean, force?: boolean, timeContext?: 'morning' | 'afternoon' }) {
    let currentHour = localNow.getUTCHours()
    const currentDay = localNow.getUTCDay()

    const year = localNow.getUTCFullYear()
    const month = String(localNow.getUTCMonth() + 1).padStart(2, '0')
    const day = String(localNow.getUTCDate()).padStart(2, '0')
    const todayStr = `${year}-${month}-${day}`

    // Override time context for previews
    if (config.timeContext === 'morning') currentHour = 9
    else if (config.timeContext === 'afternoon') currentHour = 13

    const isMorningPrep = currentHour < 13
    const isFinalCall = currentHour >= 13 && currentHour < 18

    if (!config.dryRun && (currentDay === 0 || currentDay === 6)) {
        return { status: 'skipped', reason: 'Weekend' }
    }

    const endDate = new Date(localNow)
    endDate.setUTCDate(localNow.getUTCDate() + 7)
    const endDateStr = `${endDate.getUTCFullYear()}-${String(endDate.getUTCMonth() + 1).padStart(2, '0')}-${String(endDate.getUTCDate()).padStart(2, '0')}`

    const yesterday = new Date(localNow.getTime() - 24 * 60 * 60 * 1000)
    const yesterdayStr = yesterday.toISOString()

    const { data: souvenirs, error: souvenirError } = await supabase
        .from('souvenirs')
        .select('*')
        .or(`last_buy_date.gte.${todayStr},updated_at.gte.${yesterdayStr}`)
        .order('last_buy_date', { ascending: true })

    if (souvenirError) throw souvenirError
    if (!souvenirs || souvenirs.length === 0) return { status: 'no_data' }

    const { data: categories } = await supabase
        .from('souvenir_categories')
        .select('*')
        .order('sort_order', { ascending: true })

    const itemsByDiff: Record<number, any[]> = {}
    const todayMidnight = new Date(todayStr + 'T00:00:00')

    souvenirs.forEach((item: any) => {
        if (!item.last_buy_date) return
        const target = new Date(item.last_buy_date)
        const diffDays = Math.ceil((target.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 0 || (isMorningPrep && diffDays <= 7)) {
            if (!itemsByDiff[diffDays]) itemsByDiff[diffDays] = []
            itemsByDiff[diffDays].push(item)
        }
    })

    const formatItem = async (item: any, diff: number) => {
        let categoryName = '其他'
        if (categories && item.category_id) {
            const cat = categories.find((c: any) => c.id === item.category_id)
            if (cat) categoryName = cat.name
        } else if (categories) {
            for (const cat of categories) {
                if (cat.keywords && Array.isArray(cat.keywords)) {
                    if (cat.keywords.some((k: string) => item.souvenir_item?.includes(k))) {
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
    const giftCards = souvenirs.filter((s: any) => {
        const diff = Math.ceil((new Date(s.last_buy_date).getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24))
        if (diff < 0 || diff > 7) return false
        if (!isMorningPrep && diff !== 0) return false

        if (categories && s.category_id) {
            const cat = categories.find((c: any) => c.id === s.category_id)
            return cat?.name === '超商商品卡'
        }
        if (!s.souvenir_item) return false
        const giftCardCat = categories?.find((c: any) => c.name === '超商商品卡')
        return giftCardCat?.keywords?.some((k: string) => s.souvenir_item.includes(k))
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

    // Recently Updated Items (Last 24h, not "尚未公布", and not already in giftCards)
    const recentlyUpdated = souvenirs.filter((s: any) => {
        if (!s.updated_at || s.souvenir_item === '尚未公布' || !s.souvenir_item) return false
        const updatedDate = new Date(s.updated_at)
        const isRecent = updatedDate.getTime() >= yesterday.getTime()
        const isFuture = new Date(s.last_buy_date).getTime() >= todayMidnight.getTime()
        return isRecent && isFuture && !giftCards.includes(s)
    })

    const isUpdateWindow = currentHour >= 9 && currentHour < 22

    if (recentlyUpdated.length > 0 && isMorningPrep && isUpdateWindow) {
        messageParts.push('📢 【 資料更新提醒 】')
        for (const item of recentlyUpdated) {
            const target = new Date(item.last_buy_date)
            const diff = Math.ceil((target.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24))
            messageParts.push(await formatItem(item, diff))
        }
        messageParts.push('\n---\n')
    }

    const sortedDiffs = Object.keys(itemsByDiff).map(Number).sort((a, b) => a - b)
    for (const diff of sortedDiffs) {
        if (diff > 7) continue // STANDARD 7 DAY PREVIEW
        const list = itemsByDiff[diff].filter((item: any) => !giftCards.includes(item) && !recentlyUpdated.includes(item))
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

    if (messageParts.length === 0) return { status: 'no_notifications' }

    messageParts.push('\n---\n點擊查看您的庫存狀態：\nhttps://stock-souvenir.vercel.app/gifts')
    const fullMessage = `📢 股東會紀念品最後買進日提醒\n\n${messageParts.join('\n\n')}`

    // 7. Deduplication check (only for automated runs or if not forced)
    if (!config.dryRun && !config.force) {
        const { data: lastSnapshot } = await supabase
            .from('notification_broadcast_snapshots')
            .select('message_content')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (lastSnapshot && lastSnapshot.message_content === fullMessage) {
            // Smart Redundancy: If full message is redundant but there are items expiring TODAY,
            // send a condensed "Urgent Reminder" instead.
            const todayItems = itemsByDiff[0] || []
            if (todayItems.length > 0 || giftCards.length > 0) {
                const urgentParts: string[] = []
                if (giftCards.length > 0) {
                    urgentParts.push('💳 【 高優先：亮點商品卡 】')
                    for (const item of giftCards) {
                        const target = new Date(item.last_buy_date)
                        const diff = Math.ceil((target.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24))
                        urgentParts.push(await formatItem(item, diff))
                    }
                    urgentParts.push('\n---\n')
                }

                if (todayItems.length > 0) {
                    urgentParts.push('【 🔥 今天截止 🔥 】')
                    for (const item of todayItems) {
                        urgentParts.push(await formatItem(item, 0))
                    }
                }

                const urgentMessage = `📢 股東會紀念品內容更新提醒\n\n${urgentParts.join('\n\n')}\n\n---\n(完整清單與昨日相同，此為今日重點提醒)\n點擊查看詳情：\nhttps://stock-souvenir.vercel.app/gifts`

                if (lastSnapshot.message_content === urgentMessage) {
                    return { status: 'skipped', reason: 'Redundant urgent message' }
                }

                // If we reached here, send the urgent message instead
                await supabase.from('notification_broadcast_snapshots').insert({ message_content: urgentMessage })
                return { status: 'success', message: urgentMessage }
            }

            return { status: 'skipped', reason: 'Redundant content (no urgent items)' }
        }

        // Save new snapshot for full message
        await supabase.from('notification_broadcast_snapshots').insert({ message_content: fullMessage })
    }

    return { status: 'success', message: fullMessage }
}

export async function verifyLineToken(token: string) {
    try {
        const cleanToken = token.trim();
        // Use bot info endpoint which works for all Messaging API tokens (including stateless ones)
        const response = await fetch('https://api.line.me/v2/bot/info', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${cleanToken}` }
        });
        const data = await response.json();

        if (response.ok) {
            return {
                valid: true,
                display_name: data.displayName,
                basic_id: data.basicId,
                premium_id: data.premiumId,
                picture_url: data.pictureUrl,
                chat_mode: data.chatMode,
                mark_as_read_mode: data.markAsReadMode
            };
        } else {
            console.error('LINE Bot Info Error:', data);
            return {
                valid: false,
                error: data.message || 'Invalid token',
                details: data
            };
        }
    } catch (e) {
        return { valid: false, error: (e as Error).message };
    }
}

export async function getLineQuota(token: string) {
    try {
        const cleanToken = token.trim();

        // 1. Get Monthly Limit
        const quotaRes = await fetch('https://api.line.me/v2/bot/message/quota', {
            headers: { 'Authorization': `Bearer ${cleanToken}` }
        });
        const quotaData = await quotaRes.json();

        // 2. Get Consumption
        const consumptionRes = await fetch('https://api.line.me/v2/bot/message/quota/consumption', {
            headers: { 'Authorization': `Bearer ${cleanToken}` }
        });
        const consumptionData = await consumptionRes.json();

        if (quotaRes.ok && consumptionRes.ok) {
            return {
                type: quotaData.type, // 'none' or 'limited'
                value: quotaData.value || 0, // max messages
                consumed: consumptionData.totalUsage || 0,
                remaining: Math.max(0, (quotaData.value || 0) - (consumptionData.totalUsage || 0))
            };
        } else {
            return {
                error: 'Failed to fetch quota',
                details: { quota: quotaData, consumption: consumptionData }
            };
        }
    } catch (e) {
        return { error: (e as Error).message };
    }
}
