import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

import { processNotifications, verifyLineToken, getLineQuota } from "./logic.ts"

const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')
const LINE_NOTIFY_TARGET_ID = Deno.env.get('LINE_NOTIFY_TARGET_ID')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        if (req.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
        }

        if (!LINE_CHANNEL_ACCESS_TOKEN) {
            console.error('Missing LINE configuration')
            return new Response('Missing LINE configuration', { status: 500, headers: corsHeaders })
        }

        const now = new Date()
        const offset = 8 * 60 * 60 * 1000
        const localNow = new Date(now.getTime() + offset)

        let dryRun = false
        let force = false
        let timeContext: 'morning' | 'afternoon' | undefined = undefined
        let action: 'notify' | 'verify' | 'quota' = 'notify'

        let botId: string | null = null

        try {
            const body = await req.json()
            dryRun = body.dry_run === true
            force = body.force === true
            timeContext = body.time_context
            botId = body.bot_id || null
            if (body.action === 'verify') action = 'verify'
            if (body.action === 'quota') action = 'quota'
        } catch (e) {
            // No body or not JSON, ignore
        }

        // Handle verify/quota with bot_id
        if (action === 'verify' || action === 'quota') {
            let token = LINE_CHANNEL_ACCESS_TOKEN!
            if (botId) {
                const { data: bot } = await supabase.from('line_bots').select('channel_access_token').eq('id', botId).single()
                if (bot) token = bot.channel_access_token
            }

            if (action === 'verify') {
                const verification = await verifyLineToken(token)
                return new Response(JSON.stringify(verification), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
            } else {
                const quota = await getLineQuota(token)
                return new Response(JSON.stringify(quota), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
            }
        }

        // Default Action: Notify
        const result = await processNotifications(supabase, localNow, {
            LINE_CHANNEL_ACCESS_TOKEN: LINE_CHANNEL_ACCESS_TOKEN!, // Fallback for some inner logic if any
            dryRun: dryRun,
            force: force,
            timeContext: timeContext
        })

        // 1. Handle Weekend skip (No reporting update needed)
        if (result.status === 'skipped' && result.reason === 'Weekend') {
            return new Response(result.reason, { status: 200, headers: corsHeaders })
        }

    }

        // 4. Update reporting timestamp if the check actually ran (Success OR Redundant skip)
        // This ensures the dashboard reflects that the system is active today
        if (!dryRun && hasActiveGroups && (result.status === 'success' || (result.status === 'skipped' && result.reason?.includes('Redundant')))) {
        await supabase
            .from('line_groups')
            .update({ last_active_at: new Date().toISOString() })
            .in('group_id', activeGroups!.map((g: any) => g.group_id))
    }

    // 5. Handle Dry Run response
    if (dryRun) {
        if (result.status === 'success') {
            return new Response(JSON.stringify({ status: 'preview', message: result.message }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        } else {
            return new Response(JSON.stringify({ status: result.status }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
    }

    // 6. Final responses
    if (result.status === 'skipped') return new Response(result.reason, { status: 200, headers: corsHeaders })
    if (result.status === 'no_data' || result.status === 'no_notifications') return new Response('No notifications needed', { status: 200, headers: corsHeaders })

    return new Response('Notifications processed', { status: 200, headers: corsHeaders })
} catch (error) {
    console.error('Error:', error)
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders })
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
