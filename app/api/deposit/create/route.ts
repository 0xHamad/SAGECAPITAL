import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY
const API_URL = 'https://api.nowpayments.io/v1/payment'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { amount, currency } = body

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Minimum deposit is $1' }, { status: 400 })
    }

    if (!['USDTBSC', 'USDCBSC', 'BNBBSC'].includes(currency)) {
      return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 })
    }

    // Generate unique order ID
    const order_id = `DEP_${session.user.id}_${Date.now()}`

    // Call NowPayments API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: currency,
        ipn_callback_url: 'https://sagecapital.online/api/webhook/nowpayments',
        order_id: order_id,
        order_description: `Deposit to SageCapital by ${session.user.email}`,
      }),
    })

    const npData = await response.json()

    if (!response.ok) {
      console.error('NowPayments Error:', npData)
      return NextResponse.json({ error: 'Payment gateway error', details: npData }, { status: 500 })
    }

    // Save initial deposit record as 'waiting' using Admin Client to bypass RLS
    const adminClient = createAdminClient()
    const { error: dbError } = await adminClient.from('deposits').insert({
      user_id: session.user.id,
      np_payment_id: npData.payment_id.toString(),
      np_order_id: order_id,
      amount_usd: npData.price_amount,
      amount_crypto: npData.pay_amount,
      coin: npData.pay_currency,
      pay_address: npData.pay_address,
      status: 'waiting'
    })

    if (dbError) {
      console.error('Database Error:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      payment_id: npData.payment_id,
      pay_address: npData.pay_address,
      pay_amount: npData.pay_amount,
      pay_currency: npData.pay_currency,
      order_id: order_id
    })

  } catch (error: any) {
    console.error('Create Deposit Exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
