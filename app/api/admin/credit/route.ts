import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { userId, amount } = await req.json()
    if (!userId || !amount || amount <= 0) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient.from('profiles').select('total_balance, total_deposited').eq('id', userId).single()
    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    await adminClient.from('profiles').update({
      total_balance: (profile.total_balance || 0) + amount,
      total_deposited: (profile.total_deposited || 0) + amount,
    }).eq('id', userId)

    await adminClient.from('deposits').insert({
      user_id: userId,
      np_payment_id: `MANUAL_${Date.now()}`,
      np_order_id: `MANUAL_DEP_${userId}_${Date.now()}`,
      amount_usd: amount,
      amount_crypto: amount,
      coin: 'USDTBSC',
      pay_address: 'MANUAL_CREDIT',
      status: 'finished',
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
