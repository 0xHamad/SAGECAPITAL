import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// Official BNB Chain Public RPC — Free, no API key needed
// Rate limit: 10,000 req/5min — safe with our 5s polling
const BSC_RPC = 'https://bsc-dataseed.bnbchain.org'
const USDT_CONTRACT = '0x55d398326f99059fF775485246999027B3197955'

export const dynamic = 'force-dynamic'

async function rpcCall(method: string, params: any[]) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(BSC_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      signal: controller.signal,
    })
    clearTimeout(timer)
    const json = await res.json()
    if (json.error) {
      console.warn(`RPC error [${method}]:`, json.error.message)
      return null
    }
    return json.result ?? null
  } catch (e: any) {
    clearTimeout(timer)
    console.warn(`RPC timeout/fail [${method}]:`, e.message)
    return null
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()

    // Fetch deposit record
    const { data: deposit, error: dbError } = await adminClient
      .from('deposits')
      .select('*')
      .eq('np_order_id', id)
      .eq('user_id', session.user.id)
      .single()

    if (dbError || !deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 })
    }

    // Return immediately if already settled
    if (deposit.status === 'finished') return NextResponse.json({ status: 'finished' })
    if (deposit.status === 'rejected') return NextResponse.json({ status: 'rejected', error: 'Transaction rejected: older than 15 minutes.' })
    if (deposit.status === 'expired') return NextResponse.json({ status: 'expired' })

    // Check if 15-minute window expired
    const expiresAt = new Date(new Date(deposit.created_at).getTime() + 15 * 60000)
    if (new Date() > expiresAt) {
      await adminClient.from('deposits').update({ status: 'expired' }).eq('id', deposit.id)
      return NextResponse.json({ status: 'expired' })
    }

    const txHash = deposit.np_payment_id?.toLowerCase()
    if (!txHash) return NextResponse.json({ status: 'waiting' })

    // Fetch transaction receipt from BSC
    const receipt = await rpcCall('eth_getTransactionReceipt', [txHash])

    // Receipt not yet mined — still waiting
    if (!receipt) return NextResponse.json({ status: 'waiting' })
    if (!receipt.logs) return NextResponse.json({ status: 'waiting' })

    // Find USDT Transfer log to our master wallet
    for (const log of receipt.logs) {
      if (log.address?.toLowerCase() !== USDT_CONTRACT.toLowerCase()) continue
      if (!log.topics || log.topics.length < 3) continue

      const toAddress = '0x' + log.topics[2].slice(-40)
      if (toAddress.toLowerCase() !== deposit.pay_address.toLowerCase()) continue

      // Match found! Check block timestamp for 15-min rule
      const blockNumber = receipt.blockNumber
      if (blockNumber) {
        const block = await rpcCall('eth_getBlockByNumber', [blockNumber, false])
        if (block?.timestamp) {
          const txTimeMs = parseInt(block.timestamp, 16) * 1000
          const fifteenMinsAgo = Date.now() - 15 * 60 * 1000
          if (txTimeMs < fifteenMinsAgo) {
            await adminClient.from('deposits').update({ status: 'rejected' }).eq('id', deposit.id)
            return NextResponse.json({ status: 'rejected', error: 'Transaction is older than 15 minutes.' })
          }
        }
      }

      // Parse USDT amount (18 decimals)
      const amount = parseInt(log.data, 16) / 1e18

      // Mark deposit as finished
      await adminClient.from('deposits').update({
        status: 'finished',
        amount_usd: amount,
        amount_crypto: amount,
      }).eq('id', deposit.id)

      // Credit user's total_balance and total_deposited
      const { data: profile } = await adminClient
        .from('profiles')
        .select('total_balance, total_deposited')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        await adminClient.from('profiles').update({
          total_balance: (profile.total_balance || 0) + amount,
          total_deposited: (profile.total_deposited || 0) + amount,
        }).eq('id', session.user.id)
      }

      return NextResponse.json({ status: 'finished', amount })
    }

    // No matching transfer found yet
    return NextResponse.json({ status: 'waiting' })

  } catch (err: any) {
    console.error('Deposit status error:', err)
    return NextResponse.json({ status: 'waiting' })
  }
}
