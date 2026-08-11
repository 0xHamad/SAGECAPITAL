import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

const PAYHOOK_WEBHOOK_SECRET = process.env.PAYHOOK_WEBHOOK_SECRET

function verifyPayhookSignature(rawBody: string, header: string, secret: string, toleranceSec = 300) {
  const parts = Object.fromEntries(
    header.split(',').map(p => p.split('=').map(s => s.trim()))
  )
  if (!parts.t || !parts.v1) return false

  const ts = parseInt(parts.t, 10)
  if (Math.abs(Date.now() / 1000 - ts) > toleranceSec) return false

  const signed = `${ts}.${rawBody}`
  const expected = crypto.createHmac('sha256', secret).update(signed).digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(parts.v1, 'hex')
    )
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  if (!PAYHOOK_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const header = req.headers.get('x-payhook-signature')
  if (!header) {
    return NextResponse.json({ error: 'Missing signature header' }, { status: 400 })
  }

  const rawBody = await req.text()
  
  if (!verifyPayhookSignature(rawBody, header, PAYHOOK_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event
  try {
    event = JSON.parse(rawBody)
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (event.event !== 'payment.confirmed') {
    return NextResponse.json({ received: true }) // ignore other events
  }

  const paymentId = event.payment_id
  const adminClient = createAdminClient()

  try {
    // 1. Get the pending deposit
    const { data: deposit, error: fetchError } = await adminClient
      .from('deposits')
      .select('*')
      .eq('np_payment_id', paymentId)
      .eq('status', 'waiting')
      .single()

    if (fetchError || !deposit) {
      console.log(`Deposit not found or already processed for ${paymentId}`)
      return NextResponse.json({ received: true }) // Idempotent success
    }

    // 2. Mark deposit as finished
    const { error: updateError } = await adminClient
      .from('deposits')
      .update({ status: 'finished' })
      .eq('id', deposit.id)

    if (updateError) throw updateError

    // 3. Update user total_balance using RPC or direct update
    // We fetch current profile to increment balance securely
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', deposit.user_id)
      .single()

    if (profileError || !profile) throw new Error('Profile not found')

    const newTotalBalance = (profile.total_balance || 0) + deposit.amount_usd
    const newTotalDeposited = (profile.total_deposited || 0) + deposit.amount_usd

    const { error: balanceError } = await adminClient
      .from('profiles')
      .update({ 
        total_balance: newTotalBalance,
        total_deposited: newTotalDeposited 
      })
      .eq('id', deposit.user_id)

    if (balanceError) throw balanceError

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
