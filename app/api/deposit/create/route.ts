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
    const { tx_hash } = body

    if (!tx_hash || typeof tx_hash !== 'string' || tx_hash.length < 10) {
      return NextResponse.json({ error: 'Invalid transaction hash' }, { status: 400 })
    }

    const cleanHash = tx_hash.trim()

    const adminClient = createAdminClient()
    
    // Check if this tx_hash has already been used by anyone
    const { data: existing } = await adminClient
      .from('deposits')
      .select('id')
      .eq('np_payment_id', cleanHash)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'This transaction hash has already been used or claimed' }, { status: 400 })
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
      np_payment_id: cleanHash, // We use np_payment_id to store the tx_hash
      np_order_id: external_order_id,
      amount_usd: 0, // Will be updated upon confirmation
      amount_crypto: 0, // Will be updated upon confirmation
      coin: 'USDTBSC',
      pay_address: masterWallet,
      status: 'waiting'
    })

    if (dbError) {
      console.error('Database Error:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const expires_at = new Date(Date.now() + 10 * 60000).toISOString() // 10 minutes timeout to poll

    return NextResponse.json({
      payment_id: cleanHash, // we use tx_hash as payment_id for polling
      order_id: external_order_id,
      expires_at: expires_at
    })

  } catch (error: any) {
    console.error('Create Deposit Exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
