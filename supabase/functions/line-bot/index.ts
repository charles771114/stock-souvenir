
// supabase/functions/line-bot/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')
const LINE_CHANNEL_SECRET = Deno.env.get('LINE_CHANNEL_SECRET')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Placeholder for processNotifications, verifyLineToken, getLineQuota
// These functions are not provided in the instruction but are called in the new serve block.
// Assuming they are defined elsewhere or will be added by the user.
async function processNotifications(supabase: any, localNow: Date, options: any) {
    console.log('processNotifications called with:', localNow, options);
    // This is a placeholder. Implement actual notification processing logic here.
    // For now, it will return a success status.
    return { status: 'success', message: 'Notifications processed (placeholder).' };
}

async function verifyLineToken(token: string) {
    console.log('verifyLineToken called with token:', token);
    // Placeholder for LINE token verification logic
    return { verified: true, message: 'Token verified (placeholder).' };
}

async function getLineQuota(token: string) {
    console.log('getLineQuota called with token:', token);
    // Placeholder for LINE quota retrieval logic
    return { quota: { total: 1000, remaining: 999 }, message: 'Quota retrieved (placeholder).' };
}


serve(async (req) => {
    // 1. Validate request method
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 })
    }

    try {
        const url = new URL(req.url)
        const botIdParam = url.searchParams.get('bot_id')

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Default to environment variables
        let channelAccessToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')
        let channelSecret = Deno.env.get('LINE_CHANNEL_SECRET')
        let dbBotId = null

        // If bot_id is provided, try to load from DB
        if (botIdParam) {
            const { data: bot } = await supabase
                .from('line_bots')
                .select('*')
                .eq('id', botIdParam)
                .single()

            if (bot) {
                channelAccessToken = bot.channel_access_token
                channelSecret = bot.channel_secret
                dbBotId = bot.id
                console.log(`Webhook received for bot: ${bot.bot_name} (${dbBotId})`)
            }
        }

        const signature = req.headers.get('x-line-signature')
        if (!signature) {
            return new Response('Missing Signature', { status: 401 })
        }

        const body = await req.text()

        // Verify signature
        if (channelSecret) {
            const encoder = new TextEncoder()
            const key = await crypto.subtle.importKey(
                'raw',
                encoder.encode(channelSecret),
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign']
            )
            const signatureBuffer = await crypto.subtle.sign(
                'HMAC',
                key,
                encoder.encode(body)
            )
            const computedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))

            if (computedSignature !== signature) {
                console.error('Invalid signature')
                return new Response('Unauthorized', { status: 401 })
            }
        }

        const events = JSON.parse(body).events
        if (!events || events.length === 0) {
            return new Response('OK', { status: 200 })
        }

        // 2. Process each event
        for (const event of events) {
            // Handle Join/Leave events for Groups
            if (event.source.type === 'group' || event.source.type === 'room') {
                const groupId = event.source.groupId || event.source.roomId
                if (groupId) {
                    if (event.type === 'join' || event.type === 'memberJoined') {
                        await trackGroup(groupId, channelAccessToken, dbBotId)
                    } else if (event.type === 'leave') {
                        await leaveGroup(groupId)
                    } else if (event.type === 'message') {
                        // Track activity on any message
                        await trackGroup(groupId, channelAccessToken, dbBotId)
                    }
                }
            }

            if (event.type === 'message' && event.message.type === 'text') {
                const replyToken = event.replyToken
                const userMessage = event.message.text.trim().toLowerCase()
                const lineUserId = event.source.userId
                console.log(`Received message: "${userMessage}" from ${lineUserId}`)

                // 1. Check for specific keywords
                const baseUrl = 'https://stock-souvenir.vercel.app'

                // Group Restriction & Rate Limit Check
                let allowKeywords = true
                const sourceId = event.source.type === 'group' ? event.source.groupId : (event.source.type === 'room' ? event.source.roomId : event.source.userId)

                if (event.source.type === 'group' || event.source.type === 'room') {
                    const { data: groupData } = await supabase
                        .from('line_groups')
                        .select('allow_keywords')
                        .eq('group_id', sourceId)
                        .maybeSingle()

                    if (groupData && groupData.allow_keywords === false) {
                        allowKeywords = false
                        console.log(`Keywords disabled for group: ${sourceId}`)
                    }
                }

                // 30-second Cooldown Check
                if (allowKeywords) {
                    const { data: rateLimit } = await supabase
                        .from('line_rate_limits')
                        .select('last_replied_at')
                        .eq('id', sourceId)
                        .maybeSingle()

                    if (rateLimit) {
                        const lastReplied = new Date(rateLimit.last_replied_at).getTime()
                        const now = new Date().getTime()
                        if (now - lastReplied < 30 * 1000) {
                            console.log(`Rate limit hit for ${sourceId}: ${Math.ceil((30 * 1000 - (now - lastReplied)) / 1000)}s remaining`)
                            allowKeywords = false
                        }
                    }
                }

                const TARGET_YEAR = '2026'
                const PREV_YEAR = '2025'

                if (allowKeywords && (userMessage.includes('近期') || userMessage.includes('下週') || userMessage.includes('下周'))) {
                    const today = new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString().split('T')[0]
                    const next7Days = new Date(new Date().getTime() + 8 * 60 * 60 * 1000 + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

                    const { data: soon } = await supabase
                        .from('souvenirs')
                        .select('code, name, souvenir_item, last_buy_date')
                        .gte('last_buy_date', today)
                        .lte('last_buy_date', next7Days)
                        .order('last_buy_date')

                    if (soon && soon.length > 0) {
                        // Fetch last year info for pending items
                        const needsRef = soon.filter(s => !s.souvenir_item || s.souvenir_item.includes('尚未公告'))
                        let lastYearMap = new Map()
                        if (needsRef.length > 0) {
                            const { data: prevData } = await supabase
                                .from('souvenirs')
                                .select('code, souvenir_item')
                                .in('doc_id', needsRef.map(s => `${s.code}_${PREV_YEAR}`))
                            prevData?.forEach(p => lastYearMap.set(p.code, p.souvenir_item))
                        }

                        if (allowKeywords && (userMessage.includes('近期') || userMessage.includes('下週') || userMessage.includes('下周'))) {
                            const today = new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString().split('T')[0]
                            const next7Days = new Date(new Date().getTime() + 8 * 60 * 60 * 1000 + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

                            const { data: soon } = await supabase
                                .from('souvenirs')
                                .select('code, name, souvenir_item, last_buy_date')
                                .gte('last_buy_date', today)
                                .lte('last_buy_date', next7Days)
                                .order('last_buy_date')

                            if (soon && soon.length > 0) {
                                // Fetch last year info for pending items
                                const needsRef = soon.filter(s => !s.souvenir_item || s.souvenir_item.includes('尚未公告'))
                                let lastYearMap = new Map()
                                if (needsRef.length > 0) {
                                    const { data: prevData } = await supabase
                                        .from('souvenirs')
                                        .select('code, souvenir_item')
                                        .in('doc_id', needsRef.map(s => `${s.code}_${PREV_YEAR}`))
                                    prevData?.forEach(p => lastYearMap.set(p.code, p.souvenir_item))
                                }

                                let text = `📅 【 近期截止預告 】\n\n未來 7 天內即將截止的公司共有 ${soon.length} 家：\n\n`
                                soon.slice(0, 15).forEach(s => {
                                    const isNew = s.souvenir_item && !s.souvenir_item.includes('尚未公告')
                                    const daysDiff = Math.ceil((new Date(s.last_buy_date).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24))

                                    text += `📌 ${s.code} ${s.name}\n`
                                    if (isNew) {
                                        text += `紀念品：${s.souvenir_item}\n`
                                    } else {
                                        const lastGift = lastYearMap.get(s.code)
                                        text += `去年：${lastGift || '尚未公告'}\n`
                                    }
                                    text += `最後買進日：${s.last_buy_date} (還有${daysDiff}天)\n\n`
                                })
                                if (soon.length > 15) text += `...及其他 ${soon.length - 15} 家\n\n`
                                text += `🔗 完整清單：${baseUrl}/today`
                                await replyMessage(replyToken, text, channelAccessToken, sourceId, supabase)
                            } else {
                                await replyMessage(replyToken, '🔍 未來 7 天內暫無即將截止的公司。', channelAccessToken, sourceId, supabase)
                            }
                            continue
                        }

                        if (allowKeywords && (userMessage.includes('狀態') || userMessage.includes('status'))) {
                            const { data: lastLog } = await supabase
                                .from('scraper_logs')
                                .select('*')
                                .eq('scraper_name', 'gooddie')
                                .order('created_at', { ascending: false })
                                .limit(1)
                                .maybeSingle()

                            if (lastLog) {
                                const time = new Date(lastLog.created_at).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
                                const statusEmoji = lastLog.status === 'success' ? '✅' : (lastLog.status === 'running' ? '⏳' : '❌')
                                const statusText = lastLog.status === 'success' ? '正常執行' : (lastLog.status === 'running' ? '執行中' : '發生錯誤')

                                let msg = `${statusEmoji} 【 爬蟲運作狀態 】\n\n`
                                msg += `項目：Gooddie 爬蟲\n`
                                msg += `狀態：${statusText}\n`
                                msg += `時間：${time}\n`

                                if (lastLog.status === 'success') {
                                    msg += `本次處理：${lastLog.items_processed || 0} 筆\n`
                                    msg += `來源：${lastLog.scraper_source || '未知'}\n`
                                } else if (lastLog.status === 'error') {
                                    msg += `錯誤：${lastLog.message?.substring(0, 100) || '未知錯誤'}\n`
                                }

                                msg += `\n💡 爬蟲每日會自動執行，您也可以隨時輸入「更新」查看最新成果。`
                                await replyMessage(replyToken, msg, channelAccessToken, sourceId, supabase)
                            } else {
                                await replyMessage(replyToken, '🔍 尚無爬蟲執行紀錄。', channelAccessToken, sourceId, supabase)
                            }
                            continue
                        }

                        if (allowKeywords && userMessage.includes('截止')) {
                            const today = new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString().split('T')[0]
                            const { data: deadlines } = await supabase
                                .from('souvenirs')
                                .select('code, name, souvenir_item')
                                .eq('last_buy_date', today)
                                .order('code')

                            if (deadlines && deadlines.length > 0) {
                                // Fetch last year info for pending items
                                const needsRef = deadlines.filter(d => !d.souvenir_item || d.souvenir_item.includes('尚未公告'))
                                let lastYearMap = new Map()
                                if (needsRef.length > 0) {
                                    const { data: prevData } = await supabase
                                        .from('souvenirs')
                                        .select('code, souvenir_item')
                                        .in('doc_id', needsRef.map(d => `${d.code}_${PREV_YEAR}`))
                                    prevData?.forEach(p => lastYearMap.set(p.code, p.souvenir_item))
                                }

                                let text = `🔥 【 今日截止提醒 】\n\n今天是最後買進日的公司共有 ${deadlines.length} 家：\n\n`
                                deadlines.slice(0, 20).forEach(d => {
                                    const isNew = d.souvenir_item && !d.souvenir_item.includes('尚未公告')
                                    text += `📌 ${d.code} ${d.name}\n`
                                    if (isNew) {
                                        text += `紀念品：${d.souvenir_item}\n`
                                    } else {
                                        const lastGift = lastYearMap.get(d.code)
                                        text += `去年：${lastGift || '尚未公告'}\n`
                                    }
                                    text += `最後買進日：🔥 今天截止 (⚠️ 13:30 前)\n\n`
                                })
                                if (deadlines.length > 20) text += `...及其他 ${deadlines.length - 20} 家\n\n`
                                text += `⚠️ 請在 13:30 前完成交易。\n🔗 完整清單：${baseUrl}/today`
                                await replyMessage(replyToken, text, channelAccessToken, sourceId, supabase)
                            } else {
                                await replyMessage(replyToken, '📅 今日沒有即將截止的公司。', channelAccessToken, sourceId, supabase)
                            }
                            continue
                        }

                        if (allowKeywords && userMessage.includes('更新')) {
                            const last24h = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString()
                            const { data: updates } = await supabase
                                .from('souvenirs')
                                .select('code, name, souvenir_item, updated_at', 'last_buy_date')
                                .gt('updated_at', last24h)
                                .order('updated_at', { ascending: false })

                            if (updates && updates.length > 0) {
                                // Fetch last year info for pending items
                                const needsRef = updates.filter(u => !u.souvenir_item || u.souvenir_item.includes('尚未公告'))
                                let lastYearMap = new Map()
                                if (needsRef.length > 0) {
                                    const { data: prevData } = await supabase
                                        .from('souvenirs')
                                        .select('code, souvenir_item')
                                        .in('doc_id', needsRef.map(u => `${u.code}_${PREV_YEAR}`))
                                    prevData?.forEach(p => lastYearMap.set(p.code, p.souvenir_item))
                                }

                                const today = new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString().split('T')[0]
                                let text = `✨ 【 最近更新項目 】\n\n近 24 小時內異動的公司共有 ${updates.length} 家：\n\n`
                                updates.slice(0, 15).forEach(u => {
                                    const isNew = u.souvenir_item && !u.souvenir_item.includes('尚未公告')
                                    const daysDiff = u.last_buy_date ? Math.ceil((new Date(u.last_buy_date).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)) : null

                                    text += `📌 ${u.code} ${u.name}\n`
                                    if (isNew) {
                                        text += `紀念品：${u.souvenir_item}\n`
                                    } else {
                                        const lastGift = lastYearMap.get(u.code)
                                        text += `去年：${lastGift || '尚未公告'}\n`
                                    }
                                    if (daysDiff !== null) {
                                        text += `最後買進日：${u.last_buy_date} (${daysDiff === 0 ? '🔥 今天截止' : `還有${daysDiff}天`})\n\n`
                                    } else {
                                        text += `\n`
                                    }
                                })
                                if (updates.length > 15) text += `...及其他 ${updates.length - 15} 家\n\n`
                                text += `🔗 完整清單：${baseUrl}/today`
                                await replyMessage(replyToken, text, channelAccessToken, sourceId, supabase)
                            } else {
                                await replyMessage(replyToken, '🔍 過去 24 小時內暫無更新。', channelAccessToken, sourceId, supabase)
                            }
                            continue
                        }
                    } else {
                        await replyMessage(replyToken, '🔍 過去 24 小時內暫無更新。', channelAccessToken, sourceId, supabase)
                    }
                    continue
                }

                // Default highlights for other keywords
                const highlightsKeywords = ['最新', '紀念品', '今日', '重點', '禮物']
                if (highlightsKeywords.some(k => userMessage.includes(k))) {
                    const highlightsText = `📢 這裡有為您整理好的「今日股東會重點」！\n\n包含尚未截止、且最近 48 小時內有更新情報的標的，以及未來 7 天內即將截止的項目：\n\n🔗 ${baseUrl}/today\n\n(點擊上方連結即可查看，不需登入帳號)`
                    await replyMessage(replyToken, highlightsText, channelAccessToken)
                    continue
                }

                // 2. Binding logic (Only in Personal 1-on-1 Chat)
                if (event.source.type === 'user' && lineUserId) {
                    // Check for binding code (6 digits)
                    if (/^\d{6}$/.test(userMessage)) {
                        await handleBinding(replyToken, userMessage, lineUserId, channelAccessToken)
                    } else {
                        // Default help for personal chat
                        const helpText = `你好！我是股東會紀念品小幫手。\n\n💡 輸入「最新」或「紀念品」可以查看今日重點快訊。\n\n🔐 若要綁定帳號以接收個人化推播，請輸入網站上顯示的 6 位數綁定碼。`
                        await replyMessage(replyToken, helpText, channelAccessToken)
                    }
                }
            }
        }

        return new Response('OK', { status: 200 })

    } catch (error) {
        console.error('Webhook Error:', error)
        return new Response('Internal Server Error', { status: 500 })
    }
})

// Helper functions (Binding, Tracking, Leaving, Replying)
async function handleBinding(replyToken: string, code: string, lineUserId: string, channelAccessToken: string | undefined) {
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: binding, error } = await supabase
        .from('user_bindings')
        .select('user_id')
        .eq('binding_code', code)
        .single()

    if (error || !binding) {
        await replyMessage(replyToken, '找不到此綁定碼，請確認是否輸入正確，或重新產生一組。', channelAccessToken)
        return
    }

    const { error: updateError } = await supabase
        .from('user_bindings')
        .update({
            line_user_id: lineUserId,
            binding_code: null
        })
        .eq('user_id', binding.user_id)

    if (updateError) {
        await replyMessage(replyToken, '綁定失敗，系統發生錯誤。', channelAccessToken)
    } else {
        await replyMessage(replyToken, '🎉 帳號綁定成功！\n\n未來有新的紀念品通知，我會第一時間告訴您。', channelAccessToken)
    }
}

async function trackGroup(groupId: string, channelAccessToken: string | undefined, botId: string | null) {
    if (!groupId) return
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let groupName = ''
    let pictureUrl = ''

    if (channelAccessToken) {
        try {
            const res = await fetch(`https://api.line.me/v2/bot/group/${groupId}/summary`, {
                headers: { 'Authorization': `Bearer ${channelAccessToken}` }
            })
            if (res.ok) {
                const data = await res.json()
                groupName = data.groupName
                pictureUrl = data.pictureUrl
            }
        } catch (e) {
            console.error('Failed to fetch group summary:', e)
        }
    }

    // Step 1: Check if group already exists
    const { data: existingGroup } = await supabase
        .from('line_groups')
        .select('group_id, is_active, allow_keywords')
        .eq('group_id', groupId)
        .maybeSingle()

    if (existingGroup) {
        // Step 2: Update only relevant info, preserving user settings
        const { error } = await supabase
            .from('line_groups')
            .update({
                group_name: groupName || existingGroup.group_name,
                picture_url: pictureUrl || existingGroup.picture_url,
                bot_id: botId,
                last_active_at: new Date().toISOString()
            })
            .eq('group_id', groupId)
        if (error) console.error('Error updating group info:', error)
    } else {
        // Step 3: Insert new group with default active status
        const { error } = await supabase
            .from('line_groups')
            .insert({
                group_id: groupId,
                group_name: groupName || null,
                picture_url: pictureUrl || null,
                is_active: true,
                allow_keywords: true,
                bot_id: botId,
                last_active_at: new Date().toISOString()
            })
        if (error) console.error('Error tracking new group:', error)
    }
}

async function leaveGroup(groupId: string) {
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    await supabase.from('line_groups').delete().eq('group_id', groupId)
}

async function replyMessage(replyToken: string, text: string, channelAccessToken: string | undefined, sourceId?: string, supabase?: any) {
    if (!channelAccessToken) {
        console.error('Missing channelAccessToken - cannot reply')
        return
    }
    console.log(`Replying with token: ${replyToken.substring(0, 5)}...`)
    try {
        const response = await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${channelAccessToken}`,
            },
            body: JSON.stringify({
                replyToken: replyToken,
                messages: [{ type: 'text', text: text }],
            }),
        })

        if (!response.ok) {
            const errorMsg = await response.text()
            console.error('LINE API error:', errorMsg)
        } else {
            console.log('Successfully sent replyMessage')
            // Update rate limit timestamp
            if (sourceId && supabase) {
                await supabase
                    .from('line_rate_limits')
                    .upsert({ id: sourceId, last_replied_at: new Date().toISOString() })
                console.log(`Rate limit updated for ${sourceId}`)
            }
        }
    } catch (e) {
        console.error('Failed to call LINE API:', e)
    }
}
