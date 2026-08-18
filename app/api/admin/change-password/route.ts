import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json()
    if (!email || !newPassword || newPassword.length < 6) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient.from('profiles').select('id').eq('email', email.toLowerCase()).single()
    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { error } = await adminClient.auth.admin.updateUserById(profile.id, { password: newPassword })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
