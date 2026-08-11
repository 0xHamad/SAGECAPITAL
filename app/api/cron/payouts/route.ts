import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const maxDuration = 60 // Allow up to 60 seconds
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient()
    const url = new URL(req.url)
    const cronSecret = url.searchParams.get('secret')

    // Optional: protect cron job with a secret
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Find all active plans where next_payout <= now()
    const { data: plans, error: plansError } = await supabase
      .from('user_plans')
      .select('*, profiles!inner(id, referred_by)')
      .eq('status', 'active')
      .lte('next_payout', new Date().toISOString())

    if (plansError) throw plansError
    if (!plans || plans.length === 0) {
      return NextResponse.json({ status: 'No pending payouts' })
    }

    const processed = []

    // 2. Process each plan
    for (const plan of plans) {
      // Calculate random profit between min and max
      const min = Number(plan.weekly_min || 5)
      const max = Number(plan.weekly_max || 15)
      const randomPct = (Math.random() * (max - min) + min).toFixed(2)
      const profitEarned = ((Number(plan.amount) * Number(randomPct)) / 100).toFixed(2)

      // Update the plan
      const nextPayout = new Date()
      nextPayout.setDate(nextPayout.getDate() + 7) // Add 7 days

      await supabase.from('user_plans').update({
        last_week_pct: Number(randomPct),
        last_week_earned: Number(profitEarned),
        next_payout: nextPayout.toISOString()
      }).eq('id', plan.id)

      // Insert earning record
      await supabase.from('earnings').insert({
        user_id: plan.user_id,
        plan_id: plan.id,
        percentage: Number(randomPct),
        amount: Number(profitEarned),
      })

      // Fetch user profile to update totals
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', plan.user_id)
        .single()

      if (userProfile) {
        await supabase.from('profiles').update({
          total_earned: Number(userProfile.total_earned) + Number(profitEarned),
          total_balance: Number(userProfile.total_balance) + Number(profitEarned),
          withdrawable: Number(userProfile.withdrawable) + Number(profitEarned),
        }).eq('id', plan.user_id)
      }

      // 3. Process Referral Commissions (Up to 3 levels)
      let currentUserId = userProfile?.referred_by
      const levels = [
        { level: 1, pct: 0.1 / 100 },
        { level: 2, pct: 0.01 / 100 },
        { level: 3, pct: 0.001 / 100 }
      ]

      for (const { level, pct } of levels) {
        if (!currentUserId) break // No referrer at this level

        const commission = (Number(profitEarned) * pct).toFixed(4)
        if (Number(commission) > 0) {
          // Record commission
          await supabase.from('referral_commissions').insert({
            earner_id: currentUserId,
            source_id: plan.user_id,
            plan_id: plan.id,
            level: level,
            percentage: pct * 100, // stored as visual percentage, e.g. 0.1
            amount: Number(commission)
          })

          // Update earner's profile
          const { data: earnerProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUserId)
            .single()

          if (earnerProfile) {
            await supabase.from('profiles').update({
              referral_income: Number(earnerProfile.referral_income) + Number(commission),
              total_balance: Number(earnerProfile.total_balance) + Number(commission),
              withdrawable: Number(earnerProfile.withdrawable) + Number(commission)
            }).eq('id', currentUserId)
            
            // Move up to the next level
            currentUserId = earnerProfile.referred_by
          } else {
            break
          }
        } else {
          // If commission is 0 due to rounding on tiny plans, break or continue
          break
        }
      }

      processed.push({ plan_id: plan.id, profit: profitEarned })
    }

    return NextResponse.json({ status: 'Processed payouts', processed })
  } catch (error: any) {
    console.error('Payouts Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
