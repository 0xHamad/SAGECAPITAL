import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { withdrawalId, action } = await req.json()
    if (!withdrawalId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    if (action === 'reject') {
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
