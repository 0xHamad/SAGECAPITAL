import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY
const USDT_CONTRACT = '0x55d398326f99059fF775485246999027B3197955' // BSC USDT BEP20

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // 1. Get deposit record
    const { data: deposit, error: dbError } = await adminClient
      .from('deposits')
      .select('*')
      .eq('np_order_id', id)
      .eq('user_id', session.user.id)
      .single()

    if (dbError || !deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 })
    }

    // 2. If already finished or rejected, return immediately
    if (deposit.status === 'finished') {
      return NextResponse.json({ status: 'finished' })
    }
    if (deposit.status === 'rejected') {
      return NextResponse.json({ status: 'rejected', error: 'This transaction was rejected because it is older than 15 minutes.' })
    }

    // 3. If expired, return immediately
    const expiresAt = new Date(new Date(deposit.created_at).getTime() + 15 * 60000)
    if (new Date() > expiresAt) {
      if (deposit.status !== 'expired') {
        await adminClient.from('deposits').update({ status: 'expired' }).eq('id', deposit.id)
      }
      return NextResponse.json({ status: 'expired' })
    }

    // 4. Fetch the exact transaction receipt (Real-time, bypasses BscScan cache) via Public RPC
    const submittedTxHash = deposit.np_payment_id?.toLowerCase()
    if (!submittedTxHash) {
      return NextResponse.json({ status: deposit.status })
    }

    const RPC_URL = 'https://bsc-dataseed.binance.org/'

    const rpcPayload = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getTransactionReceipt',
      params: [submittedTxHash]
    }

    const res = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rpcPayload)
    })
    const data = await res.json()

    if (data.result && data.result.logs) {
      const logs = data.result.logs

      for (const log of logs) {
        // Check if log is from USDT contract
        if (log.address.toLowerCase() === USDT_CONTRACT.toLowerCase()) {
          // Topics[0] is the Transfer event signature
          // Topics[1] is From
          // Topics[2] is To (padded to 32 bytes)
          if (log.topics && log.topics.length >= 3) {
            const toAddressHex = log.topics[2]
            const toAddress = '0x' + toAddressHex.slice(-40) // Extract last 40 chars (20 bytes)

            if (toAddress.toLowerCase() === deposit.pay_address.toLowerCase()) {
              // Found the transfer to our master wallet!

              // Let's check how old this transaction is using its blockNumber via RPC
              const blockNumberHex = data.result.blockNumber;
              if (blockNumberHex) {
                const blockPayload = {
                  jsonrpc: '2.0',
                  id: 1,
                  method: 'eth_getBlockByNumber',
                  params: [blockNumberHex, false]
                }
                
                try {
                  const blockRes = await fetch(RPC_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(blockPayload)
                  })
                  const blockData = await blockRes.json()
                  if (blockData.result && blockData.result.timestamp) {
                    const txTimeMs = parseInt(blockData.result.timestamp, 16) * 1000
                    const fifteenMinsAgo = Date.now() - (15 * 60 * 1000)
                    if (txTimeMs < fifteenMinsAgo) {
                      // Transaction is too old
                      await adminClient.from('deposits').update({ status: 'rejected' }).eq('id', deposit.id)
                      return NextResponse.json({ error: 'This transaction is older than 15 minutes and cannot be claimed.' }, { status: 400 })
                    }
                  }
                } catch (e) {
                  console.error('Failed to verify block time', e)
                }
              }

              const amountHex = log.data
              const amount = parseInt(amountHex, 16) / 1e18 // Convert from Wei
              
              // A. Update deposit status and real amount
              await adminClient
                .from('deposits')
                .update({ 
                  status: 'finished', 
                  amount_usd: amount,
                  amount_crypto: amount 
                })
                .eq('id', deposit.id)

              // B. Update user balance
              const { data: userData } = await adminClient
                .from('profiles')
                .select('total_balance, total_deposited')
                .eq('id', session.user.id)
                .single()

              if (userData) {
                await adminClient
                  .from('profiles')
                  .update({
                    total_balance: (userData.total_balance || 0) + amount,
                    total_deposited: (userData.total_deposited || 0) + amount
                  })
                  .eq('id', session.user.id)
              }

              return NextResponse.json({ status: 'finished' })
            }
          }
        }
      }
    }

    return NextResponse.json({ status: deposit.status })

  } catch (error: any) {
    console.error('Status Check Exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
