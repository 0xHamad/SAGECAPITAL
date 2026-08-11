'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/dashboard-ui'
import { DashboardProvider } from '@/components/dashboard-context'

export default function DashboardPageLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = React.useState<{ email: string; name: string } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [userData, setUserData] = React.useState({
    totalBalance: 0,
    withdrawable: 0,
    totalDeposited: 0,
    totalEarned: 0,
    referralIncome: 0,
    activePlans: [] as Array<{ name: string; amount: number; returnRange: string; lastWeekPct: number; lastWeekEarned: number }>,
    recentActivity: [] as Array<{ description: string; sub: string; amount: string; date: string; status: string }>,
    referralCount: 0,
    referralCode: '',
    activeDeposit: null as any,
  })

  React.useEffect(() => {
    const init = async () => {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { user: authUser } = session
      setUser({
        email: authUser.email || '',
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Investor',
      })

      // Try to load real data from Supabase
      try {
        // Load user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (profile) {
          // Load active plans
          const { data: plans } = await supabase
            .from('user_plans')
            .select('*')
            .eq('user_id', authUser.id)
            .eq('status', 'active')

          // Load recent earnings
          const { data: earnings } = await supabase
            .from('earnings')
            .select('*, user_plans(plan_name, amount)')
            .eq('user_id', authUser.id)
            .order('credited_at', { ascending: false })
            .limit(10)

          // Load recent deposits
          const { data: deposits } = await supabase
            .from('deposits')
            .select('*')
            .eq('user_id', authUser.id)
            .order('created_at', { ascending: false })
            .limit(5)

          // Load active pending deposit (less than 30 mins old)
          const { data: latestDeposit } = await supabase
            .from('deposits')
            .select('*')
            .eq('user_id', authUser.id)
            .eq('status', 'waiting')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          let activeDeposit = null
          if (latestDeposit) {
            const ageMs = Date.now() - new Date(latestDeposit.created_at).getTime()
            if (ageMs < 15 * 60 * 1000) { // 15 minutes
              activeDeposit = {
                pay_address: latestDeposit.pay_address,
                pay_amount: latestDeposit.amount_crypto,
                pay_currency: latestDeposit.coin,
                created_at: latestDeposit.created_at,
                expires_at: new Date(new Date(latestDeposit.created_at).getTime() + 15 * 60 * 1000).toISOString()
              }
            }
          }

          // Load referral count
          const { count: refCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('referred_by', authUser.id)

          const activePlansMapped = (plans || []).map(p => ({
            name: p.plan_name,
            amount: p.amount,
            returnRange: `${p.weekly_min}% – ${p.weekly_max}%`,
            lastWeekPct: p.last_week_pct || 0,
            lastWeekEarned: p.last_week_earned || 0,
          }))

          const activity: typeof userData.recentActivity = []
          ;(deposits || []).slice(0, 3).forEach(d => {
            activity.push({
              description: 'Deposit confirmed',
              sub: `${d.coin} · ${d.status}`,
              amount: `+$${d.amount_usd?.toFixed(2) || '0.00'}`,
              date: new Date(d.created_at).toLocaleDateString(),
              status: d.status,
            })
          })
          ;(earnings || []).slice(0, 3).forEach(e => {
            activity.push({
              description: 'Weekly profit credited',
              sub: `${(e.user_plans as { plan_name?: string })?.plan_name || 'Plan'} · ${e.percentage?.toFixed(1)}%`,
              amount: `+$${e.amount?.toFixed(2) || '0.00'}`,
              date: new Date(e.credited_at).toLocaleDateString(),
              status: 'completed',
            })
          })

          setUserData({
            totalBalance: profile.total_balance || 0,
            withdrawable: profile.withdrawable || 0,
            totalDeposited: profile.total_deposited || 0,
            totalEarned: profile.total_earned || 0,
            referralIncome: profile.referral_income || 0,
            activePlans: activePlansMapped,
            recentActivity: activity.sort(() => Math.random() - 0.5).slice(0, 5),
            referralCount: refCount || 0,
            referralCode: profile.referral_code || '',
            activeDeposit: activeDeposit,
          })
        }
      } catch {
        // If tables don't exist yet, use empty state — user just signed up
        console.log('No profile data yet — new user')
      }

      setLoading(false)
    }
    init()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: '#f8f9fb', color: '#6b7280', fontSize: 15
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #ede9fe', borderTopColor: '#7c3aed',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px'
          }} />
          Loading your portfolio...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <DashboardProvider value={{ userData, user }}>
      <DashboardLayout onSignOut={handleSignOut}>
        {children}
      </DashboardLayout>
    </DashboardProvider>
  )
}
