
// supabase/functions/line-bot/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')
const LINE_CHANNEL_SECRET = Deno.env.get('LINE_CHANNEL_SECRET')

serve(async (req) => {
    // 1. 驗證請求方法
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 })
    }

    try {
        const signature = req.headers.get('x-line-signature')
        if (!signature) {
            return new Response('Missing Signature', { status: 401 })
        }

        const body = await req.text()

        // Verify signature
        if (LINE_CHANNEL_SECRET) {
            const encoder = new TextEncoder()
            const key = await crypto.subtle.importKey(
                'raw',
                encoder.encode(LINE_CHANNEL_SECRET),
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

        // console.log('Webhook received:', body)

        const events = JSON.parse(body).events
        if (!events || events.length === 0) {
            return new Response('OK', { status: 200 })
        }

        // 2. 處理每個事件
        for (const event of events) {
            // Handle Join/Leave events for Groups
            if (event.source.type === 'group' || event.source.type === 'room') {
                const groupId = event.source.groupId || event.source.roomId
                if (groupId) {
                    if (event.type === 'join' || event.type === 'memberJoined') {
                        await trackGroup(groupId)
                    } else if (event.type === 'leave') {
                        await leaveGroup(groupId)
                    } else if (event.type === 'message') {
                        // Track activity on any message
                        await trackGroup(groupId)
                    }
                }
            }

            if (event.type === 'message' && event.message.type === 'text') {
                const replyToken = event.replyToken
                const userMessage = event.message.text.trim()
                const lineUserId = event.source.userId
                // const groupId = event.source.groupId // Already handled above

                // If in group, maybe don't reply to everything?
                // Only reply to specific commands or if mentioned?
                // For binding, it usually happens 1-on-1. 
                // But if user sends binding code in group, we should probably ignore or warn?
                // Let's restrict binding to 1-on-1 chats for security.

                if (event.source.type !== 'user') {
                    // In group/room
                    // If needed, check specific keywords
                    // For now, just tracking is enough.
                    continue
                }

                if (!lineUserId) continue

                // 檢查是否為綁定碼 (6位數)
                if (/^\d{6}$/.test(userMessage)) {
                    await handleBinding(replyToken, userMessage, lineUserId)
                } else {
                    // 預設回覆
                    const helpText = `你好！我是股東會紀念品小幫手。\n\n若要綁定帳號，請在網站上取得 6 位數綁定碼，並在此輸入。`
                    await replyMessage(replyToken, helpText)
                }
            }
        }

        return new Response('OK', { status: 200 })

    } catch (error) {
        console.error(error)
        return new Response('Internal Server Error', { status: 500 })
    }
})

// 處理綁定邏輯
async function handleBinding(replyToken: string, code: string, lineUserId: string) {
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. 查詢綁定碼是否有效且未過期 (這裡簡化，直接查 user_bindings)
    const { data: binding, error } = await supabase
        .from('user_bindings')
        .select('user_id')
        .eq('binding_code', code)
        .single()

    if (error || !binding) {
        await replyMessage(replyToken, '找不到此綁定碼，請確認是否輸入正確，或重新產生一組。')
        return
    }

    // 2. 更新 LINE User ID
    const { error: updateError } = await supabase
        .from('user_bindings')
        .update({
            line_user_id: lineUserId,
            binding_code: null // 綁定後清除代碼，避免重複使用
        })
        .eq('user_id', binding.user_id)

    if (updateError) {
        await replyMessage(replyToken, '綁定失敗，系統發生錯誤。')
        console.error('Update Error:', updateError)
    } else {
        await replyMessage(replyToken, '🎉 帳號綁定成功！\n\n未來有新的紀念品通知，我會第一時間告訴您。')
    }
}

// Helper to upsert group info
async function trackGroup(groupId: string) {
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Try to get group summary from LINE API
    let groupName = ''
    let pictureUrl = ''

    if (LINE_CHANNEL_ACCESS_TOKEN) {
        try {
            const res = await fetch(`https://api.line.me/v2/bot/group/${groupId}/summary`, {
                headers: { 'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` }
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

    // Upsert to line_groups
    const { error } = await supabase
        .from('line_groups')
        .upsert({
            group_id: groupId,
            group_name: groupName || null,
            picture_url: pictureUrl || null,
            is_active: true,
            last_active_at: new Date().toISOString()
        }, { onConflict: 'group_id' })

    if (error) console.error('Error tracking group:', error)
    else console.log(`Tracked group: ${groupId} (${groupName})`)
}

// Helper to mark group as inactive
async function leaveGroup(groupId: string) {
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabase
        .from('line_groups')
        .update({ is_active: false })
        .eq('group_id', groupId)

    console.log(`Marked group inactive: ${groupId}`)
}

async function replyMessage(replyToken: string, text: string) {
    if (!LINE_CHANNEL_ACCESS_TOKEN) {
        console.error('Missing LINE_CHANNEL_ACCESS_TOKEN')
        return
    }

    await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
            replyToken: replyToken,
            messages: [{ type: 'text', text: text }],
        }),
    })
}
