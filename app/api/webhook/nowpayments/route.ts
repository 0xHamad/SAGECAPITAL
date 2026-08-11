import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || ''

export async function POST(req: Request) {
  try {
    // 1. Verify Signature
    const signature = req.headers.get('x-nowpayments-sig')
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const bodyText = await req.text()
    const hmac = crypto.createHmac('sha512', IPN_SECRET)
    hmac.update(bodyText)
    const expectedSignature = hmac.digest('hex')

    if (signature !== expectedSignature) {
      console.error('Invalid IPN Signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    const data = JSON.parse(bodyText)
    const { payment_id, order_id, payment_status, actually_paid } = data

    const supabase = createAdminClient()

    // 2. Fetch the deposit record
    const { data: deposit, error: fetchError } = await supabase
      .from('deposits')
      .select('*')
      .eq('np_order_id', order_id)
      .single()

    if (fetchError || !deposit) {
      console.error('Deposit not found:', order_id)
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 })
    }

    // 3. Update deposit status
    await supabase
      .from('deposits')
      .update({ status: payment_status })
      .eq('id', deposit.id)

    // 4. If finished, credit the user's balance
    if (payment_status === 'finished' && deposit.status !== 'finished') {
      // Get current user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_balance, total_deposited')
        .eq('id', deposit.user_id)
        .single()

      if (profile) {
        // We use the requested USD amount or we could calculate based on crypto paid
        // For simplicity, using amount_usd originally requested (or you can use data.pay_amount)
        const amountToAdd = deposit.amount_usd

        await supabase
          .from('profiles')
          .update({
            total_balance: Number(profile.total_balance) + Number(amountToAdd),
            total_deposited: Number(profile.total_deposited) + Number(amountToAdd)
          })
          .eq('id', deposit.user_id)
      }
    }

    return NextResponse.json({ status: 'OK' })
  } catch (error) {
    console.error('Webhook Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
