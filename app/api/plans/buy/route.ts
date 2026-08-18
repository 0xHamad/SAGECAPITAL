import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminClient = createClient(supabaseUrl, supabaseServiceKey)

const PLAN_PRICES: Record<string, number> = {
  'Basic': 10,
  'Starter': 50,
  'Standard': 100,
  'Advanced': 200,
  'Pro': 500,
  'Business': 1000,
  'Enterprise': 5000
}

const REFERRAL_RATES = [0.10, 0.05, 0.01] // Level 1: 10%, Level 2: 5%, Level 3: 1%

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('cookie')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Initialize regular client for auth
    const { createServerClient } = require('@supabase/ssr')
    const { cookies } = require('next/headers')
    const cookieStore = cookies()
    const supabase = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value }
      }
    })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { planName } = body

    if (!PLAN_PRICES[planName]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const price = PLAN_PRICES[planName]

    // Get user balance
    const { data: userProfile, error: profileErr } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileErr || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    if (userProfile.total_balance < price) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // Deduct balance and create plan
    const newBalance = userProfile.total_balance - price
    await adminClient.from('profiles').update({ total_balance: newBalance }).eq('id', session.user.id)

    const nextPayout = new Date()
    nextPayout.setDate(nextPayout.getDate() + 7) // 7 days from now

    const { data: newPlan, error: planErr } = await adminClient.from('user_plans').insert({
      user_id: session.user.id,
      plan_name: planName,
      amount: price,
      next_payout: nextPayout.toISOString()
    }).select().single()

    if (planErr || !newPlan) {
      // Refund if plan creation failed
      await adminClient.from('profiles').update({ total_balance: userProfile.total_balance }).eq('id', session.user.id)
      return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
    }

    // Process Referral Commissions (3 Levels)
    let currentReferrerId = userProfile.referred_by
    for (let level = 0; level < 3; level++) {
      if (!currentReferrerId) break

      const { data: referrerData } = await adminClient
        .from('profiles')
        .select('id, referred_by, total_balance, referral_income')
        .eq('id', currentReferrerId)
        .single()

      if (!referrerData) break

      const commission = price * REFERRAL_RATES[level]
      
      // Update referrer's balance
      await adminClient.from('profiles').update({
        total_balance: (referrerData.total_balance || 0) + commission,
        referral_income: (referrerData.referral_income || 0) + commission
      }).eq('id', referrerData.id)

      // Log commission
      await adminClient.from('referral_commissions').insert({
        earner_id: referrerData.id,
        source_id: session.user.id,
        plan_id: newPlan.id,
        level: level + 1,
        percentage: REFERRAL_RATES[level],
        amount: commission
      })

      currentReferrerId = referrerData.referred_by
    }

    return NextResponse.json({ success: true, newBalance })

  } catch (error: any) {
    console.error('Plan Buy Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
