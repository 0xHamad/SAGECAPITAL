import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const PAYHOOK_API_KEY = process.env.PAYHOOK_API_KEY
const API_URL = 'https://api.payhook.app/api/v1/payments/'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { amount, coin } = body

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Minimum deposit is $1' }, { status: 400 })
    }

    // Map frontend coin string to Payhook network/currency
    let network = ''
    let currency = ''
    if (coin === 'USDTBSC') { network = 'bsc'; currency = 'usdt' }
    else if (coin === 'USDTTRC20') { network = 'trx'; currency = 'usdt' }
    else if (coin === 'USDCBSC') { network = 'bsc'; currency = 'usdc' }
    else if (coin === 'BNBBSC') { network = 'bsc'; currency = 'bnb' }
    else {
      return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 })
    }

    const amount_usd_cents = Math.round(amount * 100)
    const external_order_id = `DEP_${session.user.id}_${Date.now()}`

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'X-API-Key': PAYHOOK_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount_usd_cents,
        network,
        currency,
        external_order_id,
        customer_email: session.user.email
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Payhook Error:', data)
      return NextResponse.json({ error: 'Payment gateway error', details: data }, { status: 500 })
    }

    // Save initial deposit record as 'waiting' using Admin Client to bypass RLS
    const adminClient = createAdminClient()
    const { error: dbError } = await adminClient.from('deposits').insert({
      user_id: session.user.id,
      np_payment_id: data.payment_number, // repurposing np_payment_id for Payhook ID
      np_order_id: external_order_id,
      amount_usd: amount,
      amount_crypto: parseFloat(data.expected_crypto_amount),
      coin: coin,
      pay_address: data.assigned_address,
      status: 'waiting'
    })

    if (dbError) {
      console.error('Database Error:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      payment_id: data.payment_number,
      pay_address: data.assigned_address,
      pay_amount: data.expected_crypto_amount,
      pay_currency: coin,
      order_id: external_order_id,
      expires_at: data.expires_at
    })

  } catch (error: any) {
    console.error('Create Deposit Exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
