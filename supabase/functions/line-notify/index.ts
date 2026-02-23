import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

import { processNotifications, verifyLineToken } from "./logic.ts"

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
        let timeContext: 'morning' | 'afternoon' | undefined = undefined
        let action: 'notify' | 'verify' = 'notify'

        try {
            const body = await req.json()
            dryRun = body.dry_run === true
            timeContext = body.time_context
            if (body.action === 'verify') action = 'verify'
        } catch (e) {
            // No body or not JSON, ignore
        }

        if (action === 'verify') {
            const verification = await verifyLineToken(LINE_CHANNEL_ACCESS_TOKEN!)
            return new Response(JSON.stringify(verification), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const result = await processNotifications(supabase, localNow, {
            LINE_CHANNEL_ACCESS_TOKEN: LINE_CHANNEL_ACCESS_TOKEN!,
            LINE_NOTIFY_TARGET_ID: LINE_NOTIFY_TARGET_ID,
            dryRun,
            timeContext
        })

        if (result.status === 'skipped') {
            return new Response(result.reason, { status: 200, headers: corsHeaders })
        }

        if (result.status === 'no_data' || result.status === 'no_notifications') {
            if (dryRun) return new Response(JSON.stringify({ status: result.status }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            return new Response('No notifications needed', { status: 200, headers: corsHeaders })
        }

        const fullMessage = result.message!

        if (dryRun) {
            return new Response(JSON.stringify({ status: 'preview', message: fullMessage }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        const { data: activeGroups } = await supabase.from('line_groups').select('group_id').eq('is_active', true)

        if (!activeGroups || activeGroups.length === 0) {
            if (LINE_NOTIFY_TARGET_ID) await sendPush(LINE_NOTIFY_TARGET_ID, fullMessage)
        } else {
            console.log(`Broadcasting to ${activeGroups.length} groups...`)
            for (const group of activeGroups) {
                await sendPush(group.group_id, fullMessage)
            }
        }

        return new Response('Notifications sent', { status: 200, headers: corsHeaders })

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
