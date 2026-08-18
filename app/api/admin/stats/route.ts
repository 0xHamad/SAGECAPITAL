import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const adminClient = createAdminClient()

    const [users, deposits, plans, earnings, withdrawals] = await Promise.all([
      adminClient.from('profiles').select('*').order('created_at', { ascending: false }),
      adminClient.from('deposits').select('*').eq('status', 'finished'),
      adminClient.from('user_plans').select('*').eq('status', 'active'),
      adminClient.from('earnings').select('amount'),
      adminClient.from('withdrawals').select('*').order('requested_at', { ascending: false }),
    ])

    const totalDeposited = (deposits.data || []).reduce((sum, d) => sum + (d.amount_usd || 0), 0)
    const totalEarnings = (earnings.data || []).reduce((sum, e) => sum + (e.amount || 0), 0)

    const allUsers = users.data || []
    
    // Calculate referral count for each user
    const usersWithStats = allUsers.map(u => {
      const refCount = allUsers.filter(other => other.referred_by === u.id).length
      return { ...u, referralCount: refCount }
    })

    return NextResponse.json({
      totalUsers: allUsers.length,
      totalDeposited,
      totalPlans: plans.data?.length || 0,
      totalEarnings,
      users: usersWithStats,
      withdrawals: withdrawals.data || [],
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
