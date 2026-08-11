import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { amount, coin, wallet_address } = body

    if (!amount || amount <= 0 || !coin || !wallet_address) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // 1. Check user balance
    const { data: profile } = await adminClient
      .from('profiles')
      .select('withdrawable, total_balance')
      .eq('id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (Number(profile.withdrawable) < Number(amount)) {
      return NextResponse.json({ error: 'Insufficient withdrawable balance' }, { status: 400 })
    }

    // 2. Create pending withdrawal record
    const { error: insertError } = await adminClient.from('withdrawals').insert({
      user_id: session.user.id,
      amount: Number(amount),
      coin: coin,
      wallet_address: wallet_address,
      status: 'pending'
    })

    if (insertError) {
      console.error('Withdrawal Insert Error:', insertError)
      return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
    }

    // 3. Deduct balance immediately so they can't double-withdraw
    await adminClient.from('profiles').update({
      withdrawable: Number(profile.withdrawable) - Number(amount),
      total_balance: Number(profile.total_balance) - Number(amount)
    }).eq('id', session.user.id)

    return NextResponse.json({ status: 'Withdrawal requested successfully' })
  } catch (error: any) {
    console.error('Withdrawal Request Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
