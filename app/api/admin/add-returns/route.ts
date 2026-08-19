import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, weeks, password } = body

    if (password !== 'sage7860') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!email || !weeks || weeks <= 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Find the user
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (userError || !userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find active plans for the user
    const { data: plans, error: plansError } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', userProfile.id)
      .eq('status', 'active')

    if (plansError) throw plansError
    if (!plans || plans.length === 0) {
      return NextResponse.json({ error: 'User has no active plans' }, { status: 400 })
    }

    let totalProfitAdded = 0
    let totalCommissionsAdded = 0

    // Process for each plan
    for (const plan of plans) {
      let planTotalProfit = 0
      let lastPct = 0
      let lastEarned = 0

      // Simulate N weeks
      for (let w = 0; w < weeks; w++) {
        const min = Number(plan.weekly_min || 5)
        const max = Number(plan.weekly_max || 15)
        const randomPct = Number((Math.random() * (max - min) + min).toFixed(2))
        const profitEarned = Number(((Number(plan.amount) * randomPct) / 100).toFixed(2))

        planTotalProfit += profitEarned
        totalProfitAdded += profitEarned
        lastPct = randomPct
        lastEarned = profitEarned

        // Record earning
        await supabase.from('earnings').insert({
          user_id: userProfile.id,
          plan_id: plan.id,
          percentage: randomPct,
          amount: profitEarned,
        })

        // Process Referral Commissions for this week
        let currentUserId = userProfile.referred_by
        const planAmount = Number(plan.amount)
        const levels = [
          { level: 1, pct: (planAmount / 100) / 100 },
          { level: 2, pct: (planAmount / 1000) / 100 },
          { level: 3, pct: (planAmount / 10000) / 100 }
        ]

        for (const { level, pct } of levels) {
          if (!currentUserId) break

          const commission = Number((profitEarned * pct).toFixed(4))
          if (commission > 0) {
            await supabase.from('referral_commissions').insert({
              earner_id: currentUserId,
              source_id: userProfile.id,
              plan_id: plan.id,
              level: level,
              percentage: pct * 100,
              amount: commission
            })

            const { data: earnerProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUserId)
              .single()

            if (earnerProfile) {
              await supabase.from('profiles').update({
                referral_income: Number(earnerProfile.referral_income) + commission,
                total_balance: Number(earnerProfile.total_balance) + commission,
                withdrawable: Number(earnerProfile.withdrawable) + commission
              }).eq('id', currentUserId)
              
              currentUserId = earnerProfile.referred_by
              totalCommissionsAdded += commission
            } else {
              break
            }
          } else {
            break
          }
        }
      }

      // Update plan next_payout
      const nextPayout = plan.next_payout ? new Date(plan.next_payout) : new Date()
      nextPayout.setDate(nextPayout.getDate() + (7 * weeks))

      await supabase.from('user_plans').update({
        last_week_pct: lastPct,
        last_week_earned: lastEarned,
        next_payout: nextPayout.toISOString()
      }).eq('id', plan.id)
    }

    // Refresh user profile to add total profit
    const { data: latestProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userProfile.id)
      .single()

    if (latestProfile) {
      await supabase.from('profiles').update({
        total_earned: Number(latestProfile.total_earned) + totalProfitAdded,
        total_balance: Number(latestProfile.total_balance) + totalProfitAdded,
        withdrawable: Number(latestProfile.withdrawable) + totalProfitAdded,
      }).eq('id', userProfile.id)
    }

    return NextResponse.json({ 
      success: true, 
      message: `Added ${weeks} weeks. Profit: $${totalProfitAdded.toFixed(2)} | Commissions: $${totalCommissionsAdded.toFixed(2)}`
    })
  } catch (error: any) {
    console.error('Add Returns Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
