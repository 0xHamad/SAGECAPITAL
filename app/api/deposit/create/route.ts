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
    const { amount } = body
    const baseAmount = Math.floor(amount)

    if (!baseAmount || baseAmount < 1) {
      return NextResponse.json({ error: 'Minimum deposit is $1' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    let uniqueAmountCrypto = 0
    let attempts = 0
    let foundUnique = false

    // Try to find a unique decimal between .010 and .099
    while (attempts < 50 && !foundUnique) {
      const randomDecimal = Math.floor(Math.random() * 90 + 10) / 1000 // .010 to .099
      const candidateAmount = parseFloat((baseAmount + randomDecimal).toFixed(3))
      
      // Check if this exact amount is currently "waiting" within the last 15 mins
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60000).toISOString()
      const { data: existing } = await adminClient
        .from('deposits')
        .select('id')
        .eq('amount_crypto', candidateAmount)
        .eq('status', 'waiting')
        .gte('created_at', fifteenMinsAgo)
        .limit(1)

      if (!existing || existing.length === 0) {
        uniqueAmountCrypto = candidateAmount
        foundUnique = true
      }
      attempts++
    }

    if (!foundUnique) {
      return NextResponse.json({ error: 'System busy, please try again in a minute' }, { status: 503 })
    }

    const masterWallet = process.env.MASTER_WALLET_ADDRESS
    if (!masterWallet) {
      console.error('MASTER_WALLET_ADDRESS not configured')
      return NextResponse.json({ error: 'System configuration error' }, { status: 500 })
    }

    const external_order_id = `DEP_${session.user.id}_${Date.now()}`

    // Save initial deposit record as 'waiting' using Admin Client
    const { error: dbError } = await adminClient.from('deposits').insert({
      user_id: session.user.id,
      np_payment_id: null,
      np_order_id: external_order_id,
      amount_usd: baseAmount,
      amount_crypto: uniqueAmountCrypto,
      coin: 'USDTBSC',
      pay_address: masterWallet,
      status: 'waiting'
    })

    if (dbError) {
      console.error('Database Error:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const expires_at = new Date(Date.now() + 15 * 60000).toISOString()

    return NextResponse.json({
      payment_id: external_order_id, // we use order id as payment_id for polling
      pay_address: masterWallet,
      pay_amount: uniqueAmountCrypto.toString(),
      pay_currency: 'USDTBSC',
      order_id: external_order_id,
      expires_at: expires_at
    })

  } catch (error: any) {
    console.error('Create Deposit Exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
