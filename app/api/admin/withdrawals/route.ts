import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.email !== process.env.ADMIN_EMAIL) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { withdrawalId, action } = await req.json()
    if (!withdrawalId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    if (action === 'reject') {
      // Refund user's withdrawable balance
      const { data: withdrawal } = await adminClient.from('withdrawals').select('user_id, amount').eq('id', withdrawalId).single()
      if (withdrawal) {
        const { data: profile } = await adminClient.from('profiles').select('withdrawable').eq('id', withdrawal.user_id).single()
        if (profile) {
          await adminClient.from('profiles').update({
            withdrawable: (profile.withdrawable || 0) + withdrawal.amount,
          }).eq('id', withdrawal.user_id)
        }
      }
      await adminClient.from('withdrawals').update({ status: 'rejected', processed_at: new Date().toISOString() }).eq('id', withdrawalId)
    } else {
      await adminClient.from('withdrawals').update({ status: 'processed', processed_at: new Date().toISOString() }).eq('id', withdrawalId)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
