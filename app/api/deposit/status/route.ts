import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY
const USDT_CONTRACT = '0x55d398326f99059fF775485246999027B3197955' // BSC USDT BEP20

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

    // 2. If already finished, return immediately
    if (deposit.status === 'finished') {
      return NextResponse.json({ status: 'finished' })
    }

    // 3. If expired, return immediately
    const expiresAt = new Date(new Date(deposit.created_at).getTime() + 15 * 60000)
    if (new Date() > expiresAt) {
      if (deposit.status !== 'expired') {
        await adminClient.from('deposits').update({ status: 'expired' }).eq('id', deposit.id)
      }
      return NextResponse.json({ status: 'expired' })
    }

    // 4. Fetch latest transactions from BscScan
    if (!BSCSCAN_API_KEY) {
      console.warn('BSCSCAN_API_KEY is not set')
      return NextResponse.json({ status: deposit.status }) // silently fail check if no key
    }

    const url = `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${USDT_CONTRACT}&address=${deposit.pay_address}&page=1&offset=50&sort=desc&apikey=${BSCSCAN_API_KEY}`
    
    const res = await fetch(url)
    const data = await res.json()

    if (data.status === '1' && data.result) {
      const transactions = data.result
      
      // Allow a small timestamp buffer. Only check txs that happened AFTER deposit creation
      const depositTime = new Date(deposit.created_at).getTime() / 1000 - 60 

      for (const tx of transactions) {
        if (
          tx.to.toLowerCase() === deposit.pay_address.toLowerCase() &&
          parseInt(tx.timeStamp) >= depositTime
        ) {
          const value = parseFloat(tx.value) / 1e18 // Convert from Wei
          
          // Check if exact decimal match
          if (Math.abs(value - deposit.amount_crypto) < 0.0001) {
            
            // Ensure this tx hasn't already been processed for another deposit
            const { data: existingTx } = await adminClient
              .from('deposits')
              .select('id')
              .eq('np_payment_id', tx.hash)
              .limit(1)

            if (!existingTx || existingTx.length === 0) {
              // WE HAVE A MATCH! Confirm the deposit!
              
              // A. Update deposit status
              await adminClient
                .from('deposits')
                .update({ status: 'finished', np_payment_id: tx.hash })
                .eq('id', deposit.id)

              // B. Update user balance
              const { data: userData } = await adminClient
                .from('users')
                .select('total_balance, total_deposited')
                .eq('id', session.user.id)
                .single()

              if (userData) {
                await adminClient
                  .from('users')
                  .update({
                    total_balance: (userData.total_balance || 0) + deposit.amount_usd,
                    total_deposited: (userData.total_deposited || 0) + deposit.amount_usd
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
