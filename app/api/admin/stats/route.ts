import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminEmail = process.env.ADMIN_EMAIL
    if (session.user.email !== adminEmail) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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

    return NextResponse.json({
      totalUsers: users.data?.length || 0,
      totalDeposited,
      totalPlans: plans.data?.length || 0,
      totalEarnings,
      users: users.data || [],
      withdrawals: withdrawals.data || [],
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
