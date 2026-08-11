import { StarterPage, type StarterPageProps } from '@/components/starter-page'

export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const data: StarterPageProps['userData'] = {
    totalBalance: 0,
    withdrawable: 0,
    totalDeposited: 0,
    totalEarned: 0,
    referralIncome: 0,
    activePlans: [],
    recentActivity: [],
    referralCount: 0,
    referralCode: user?.id?.slice(0, 8).toUpperCase() ?? 'USER',
  }
  return <StarterPage userName={user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Investor'} userEmail={user?.email ?? ''} userData={data} onSignOut={async () => { 'use server'; const client = await createClient(); await client.auth.signOut() }} />
}
