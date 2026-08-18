import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    
    const { data: allUsers } = await adminClient
      .from('profiles')
      .select('id, referred_by')
      
    const users = allUsers || []
    
    const l1Users = users.filter(u => u.referred_by === session.user.id)
    const l2Users = users.filter(u => l1Users.some(l1 => l1.id === u.referred_by))
    const l3Users = users.filter(u => l2Users.some(l2 => l2.id === u.referred_by))

    return NextResponse.json({ 
      referralCount: l1Users.length,
      l1Count: l1Users.length,
      l2Count: l2Users.length,
      l3Count: l3Users.length
    })
  } catch (err: any) {
    console.error('Stats API error:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
