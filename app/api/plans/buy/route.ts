import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const PLAN_PRICES: Record<string, number> = {
  'Basic': 10, 'Starter': 50, 'Standard': 100,
  'Advanced': 200, 'Pro': 500, 'Business': 1000, 'Enterprise': 5000
}
const REFERRAL_RATES = [0.10, 0.05, 0.01]

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { planName } = body

    const price = PLAN_PRICES[planName]
    if (!price) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    const adminClient = createAdminClient()

    const { data: profile, error: profileErr } = await adminClient
      .from('profiles').select('*').eq('id', session.user.id).single()

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    if ((profile.total_balance || 0) < price) {
      return NextResponse.json({ error: `Insufficient balance. You need $${price} but have $${(profile.total_balance || 0).toFixed(2)}` }, { status: 400 })
    }

    // Deduct balance
    const { error: deductErr } = await adminClient.from('profiles')
      .update({ total_balance: profile.total_balance - price })
      .eq('id', session.user.id)

    if (deductErr) return NextResponse.json({ error: 'Failed to deduct balance' }, { status: 500 })

    // Create plan
    const nextPayout = new Date()
    nextPayout.setDate(nextPayout.getDate() + 7)

    const { data: newPlan, error: planErr } = await adminClient.from('user_plans').insert({
      user_id: session.user.id,
      plan_name: planName,
      amount: price,
      weekly_min: 5,
      weekly_max: 15,
      next_payout: nextPayout.toISOString(),
      status: 'active'
    }).select().single()

    if (planErr || !newPlan) {
      // Refund on failure
      await adminClient.from('profiles').update({ total_balance: profile.total_balance }).eq('id', session.user.id)
      return NextResponse.json({ error: 'Failed to activate plan' }, { status: 500 })
    }

    // Pay referral commissions (3 levels, on plan price)
    let referrerId = profile.referred_by
    for (let level = 0; level < 3 && referrerId; level++) {
      const { data: referrer } = await adminClient
        .from('profiles').select('id, referred_by, total_balance, referral_income').eq('id', referrerId).single()
      if (!referrer) break

      const commission = price * REFERRAL_RATES[level]
      await adminClient.from('profiles').update({
        total_balance: (referrer.total_balance || 0) + commission,
        referral_income: (referrer.referral_income || 0) + commission,
      }).eq('id', referrer.id)

      await adminClient.from('referral_commissions').insert({
        earner_id: referrer.id,
        source_id: session.user.id,
        plan_id: newPlan.id,
        level: level + 1,
        percentage: REFERRAL_RATES[level],
        amount: commission,
      })

      referrerId = referrer.referred_by
    }

    return NextResponse.json({ success: true, planName, price, newBalance: profile.total_balance - price })
  } catch (err: any) {
    console.error('Plan buy error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
