
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
                const userMessage = event.message.text.trim()
                const lineUserId = event.source.userId

                if (event.source.type !== 'user') {
                    continue
                }

                if (!lineUserId) continue

                // Check for binding code (6 digits)
                if (/^\d{6}$/.test(userMessage)) {
                    await handleBinding(replyToken, userMessage, lineUserId, channelAccessToken)
                } else {
                    // Default reply
                    const helpText = `你好！我是股東會紀念品小幫手。\n\n若要綁定帳號，請在網站上取得 6 位數綁定碼，並在此輸入。`
                    await replyMessage(replyToken, helpText, channelAccessToken)
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

    const { error } = await supabase
        .from('line_groups')
        .upsert({
            group_id: groupId,
            group_name: groupName || null,
            picture_url: pictureUrl || null,
            is_active: true,
            bot_id: botId,
            last_active_at: new Date().toISOString()
        }, { onConflict: 'group_id' })

    if (error) console.error('Error tracking group:', error)
}

async function leaveGroup(groupId: string) {
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    await supabase.from('line_groups').delete().eq('group_id', groupId)
}

async function replyMessage(replyToken: string, text: string, channelAccessToken: string | undefined) {
    if (!channelAccessToken) return
    await fetch('https://api.line.me/v2/bot/message/reply', {
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
}
