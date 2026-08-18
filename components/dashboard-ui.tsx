'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  makeStyles, mergeClasses, tokens, typographyStyles,
  Title1, Title2, Title3, Subtitle1, Subtitle2,
  Body1, Body2, Caption1, Button, Input, Card,
  Divider, Avatar, Badge, CounterBadge, TabList, Tab,
  MessageBar, MessageBarBody, MessageBarTitle,
} from '@fluentui/react-components'
import {
  Home24Regular, DataTrending24Regular, WalletCreditCard24Regular,
  PeopleTeam24Regular, Person24Regular, Search24Regular,
  Alert24Regular, ArrowUpRight24Regular, ArrowRight24Regular,
  Money24Regular, Sparkle24Regular, ShieldCheckmark24Regular,
  LockClosed24Regular, Copy24Regular, CheckmarkCircle24Regular,
  Settings24Regular, ChevronDown16Regular, Add24Regular,
  Dismiss24Regular,
} from '@fluentui/react-icons'
import { useDashboard } from './dashboard-context'

const useStyles = makeStyles({
  shell: { minHeight: '100vh', display: 'flex', backgroundColor: '#f3f4f8', color: '#172033' },
  sidebar: { width: '252px', flexShrink: 0, backgroundColor: '#fff', borderRight: '1px solid #e7eaf0', padding: '26px 18px', display: 'flex', flexDirection: 'column', gap: '26px' },
  brand: { display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '10px' },
  brandIcon: { width: '36px', height: '36px', borderRadius: '12px', display: 'grid', placeItems: 'center', color: '#fff', background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', boxShadow: '0 8px 18px rgba(99,72,220,.25)' },
  brandName: { ...typographyStyles.subtitle1, fontWeight: 800, background: 'linear-gradient(90deg,#7c3aed,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  brandSub: { ...typographyStyles.caption1, color: '#8a93a5' },
  search: { backgroundColor: '#f6f7fa', border: 'none', borderRadius: '10px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '5px' },
  navButton: { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'flex-start', paddingLeft: '13px', borderRadius: '10px', color: '#768097', minHeight: '42px' },
  navActive: { color: '#6d45d8', backgroundColor: '#f1edff', fontWeight: 700 },
  sidebarBottom: { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' },
  content: { flex: 1, minWidth: 0, width: '100%' },
  topbar: { height: '76px', backgroundColor: '#fff', borderBottom: '1px solid #e7eaf0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px', gap: '16px' },
  crumb: { color: '#7b8497', ...typographyStyles.body2 },
  user: { display: 'flex', alignItems: 'center', gap: '11px' },
  main: { width: '100%', maxWidth: '1440px', margin: '0 auto', padding: '30px 34px 80px', display: 'flex', flexDirection: 'column', gap: '24px' },
  hero: { position: 'relative', overflow: 'hidden', minHeight: '224px', borderRadius: '18px', padding: '30px 34px', color: '#fff', background: 'linear-gradient(115deg,#6d28d9 0%,#7c3aed 43%,#2563eb 100%)', boxShadow: '0 16px 35px rgba(91,62,190,.18)' },
  globe: { position: 'absolute', right: '-34px', top: '-120px', width: '430px', height: '430px', borderRadius: '50%', border: '1px solid rgba(255,255,255,.25)', boxShadow: '0 0 0 25px rgba(255,255,255,.07),0 0 0 50px rgba(255,255,255,.05),0 0 0 80px rgba(255,255,255,.035)' },
  heroContent: { position: 'relative', zIndex: 1, maxWidth: '650px', display: 'flex', flexDirection: 'column', gap: '12px' },
  heroTitle: { ...typographyStyles.title1, fontWeight: 800 },
  heroText: { color: 'rgba(255,255,255,.82)', maxWidth: '570px' },
  heroActions: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' },
  whiteButton: { backgroundColor: '#fff', color: '#6036cb', borderRadius: '9px', fontWeight: 700 },
  outlineButton: { color: '#fff', border: '1px solid rgba(255,255,255,.55)', borderRadius: '9px' },
  metrics: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '16px' },
  metric: { padding: '20px', backgroundColor: '#fff', border: '1px solid #e7eaf0', borderRadius: '14px', boxShadow: '0 5px 14px rgba(31,40,70,.04)', transition: 'transform .2s, box-shadow .2s', ':hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 25px rgba(31,40,70,.09)' } },
  metricTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  metricIcon: { width: '38px', height: '38px', borderRadius: '11px', display: 'grid', placeItems: 'center', backgroundColor: '#f0ebff', color: '#7041d5' },
  metricValue: { ...typographyStyles.title2, fontWeight: 800 },
  green: { color: '#159447' },
  muted: { color: '#8791a5' },
  engine: { borderRadius: '16px', padding: '21px 24px', backgroundColor: '#101827', color: '#fff', border: '1px solid #32c779', boxShadow: '0 0 25px rgba(36,203,120,.1)', display: 'grid', gridTemplateColumns: '1.1fr 1.4fr 1fr', alignItems: 'center', gap: '24px' },
  liveLabel: { display: 'flex', alignItems: 'center', gap: '8px', color: '#6ee7a6', ...typographyStyles.caption1, fontWeight: 700 },
  pulse: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#43df8c', boxShadow: '0 0 0 5px rgba(67,223,140,.13)' },
  chart: { height: '72px', display: 'flex', alignItems: 'end', gap: '6px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.12)' },
  bar: { flex: 1, borderRadius: '4px 4px 0 0', background: 'linear-gradient(180deg,#61e49f,#1b9b68)', minHeight: '12px' },
  countdown: { textAlign: 'right', fontFamily: 'monospace', color: '#c6cedb' },
  tableCard: { padding: '20px', backgroundColor: '#fff', border: '1px solid #e7eaf0', borderRadius: '14px', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '680px' },
  th: { textAlign: 'left', padding: '12px 10px', color: '#8b95a8', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid #edf0f4' },
  td: { padding: '14px 10px', borderBottom: '1px solid #f0f2f6', fontSize: '13px' },
  planGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '16px' },
  planCard: { padding: '20px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '13px', transition: 'transform .2s, box-shadow .2s', ':hover': { transform: 'translateY(-4px)', boxShadow: '0 14px 30px rgba(86,66,170,.12)' } },
  planAccent: { color: '#7041d5', fontWeight: 800, ...typographyStyles.title2 },
  info: { backgroundColor: '#eef6ff', border: '1px solid #d8eaff', borderRadius: '12px', padding: '16px', color: '#245c99' },
  sectionTitle: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' },
  mobileNav: { display: 'none', position: 'fixed', zIndex: 20, bottom: 0, left: 0, right: 0, height: '68px', backgroundColor: '#fff', borderTop: '1px solid #e7eaf0', justifyContent: 'space-around', alignItems: 'center', boxShadow: '0 -5px 18px rgba(30,40,70,.08)' },
  mobileItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#8a93a5', fontSize: '10px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' },
  mobileActive: { color: '#7041d5', fontWeight: 700 },
})

export const navItems = [
  ['Dashboard', Home24Regular, '/dashboard'],
  ['My Plans', DataTrending24Regular, '/myplan'],
  ['Wallet', WalletCreditCard24Regular, '/wallet'],
  ['Referrals', PeopleTeam24Regular, '/referrals'],
  ['Profile', Person24Regular, '/profile'],
] as const

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 12, display: 'grid', placeItems: 'center', color: '#fff', background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', boxShadow: '0 8px 18px rgba(99,72,220,.25)' }}>
        <ShieldCheckmark24Regular />
      </div>
      <div>
        <div style={{ fontWeight: 800, background: 'linear-gradient(90deg,#7c3aed,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 15 }}>SageCapital</div>
        <div style={{ color: '#8a93a5', fontSize: 11 }}>Investment Platform</div>
      </div>
    </div>
  )
}

export function DashboardLayout({ children, onSignOut }: { children: React.ReactNode, onSignOut: () => void }) {
  const styles = useStyles()
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useDashboard()
  const userName = user?.name || 'Investor'
  const handleSignOut = async () => { await onSignOut(); router.push('/login') }
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return (
    <div className={styles.shell}>
      {!isMobile && (
        <aside className={styles.sidebar}>
          <Logo />
          <Input className={styles.search} contentBefore={<Search24Regular />} placeholder="Search" />
          <nav className={styles.nav} aria-label="Primary navigation">
            {navItems.map(([label, NavIcon, path]) => (
              <Link href={path as string} key={label as string} style={{ textDecoration: 'none' }}>
                <Button appearance="subtle" className={mergeClasses(styles.navButton, pathname === path && styles.navActive)} icon={<NavIcon />}>
                  {label as string}
                </Button>
              </Link>
            ))}
          </nav>
          <Divider />
          <div className={styles.sidebarBottom}>
            <Link href="/support" style={{ textDecoration: 'none' }}>
              <Button appearance="subtle" className={mergeClasses(styles.navButton, pathname === '/support' && styles.navActive)} icon={<Alert24Regular />}>Support</Button>
            </Link>
            <Button appearance="subtle" className={styles.navButton} icon={<ArrowRight24Regular />} onClick={handleSignOut}>Sign Out</Button>
          </div>
        </aside>
      )}
      <div className={styles.content}>
        <header className={styles.topbar}>
          <div className={styles.crumb}>SageCapital <span aria-hidden>›</span> <strong>{navItems.find(i => i[2] === pathname)?.[0] || 'Dashboard'}</strong></div>
          <div className={styles.user}>
            <CounterBadge count={0} color="danger" size="small"><Alert24Regular /></CounterBadge>
            <Avatar name={userName} color="brand" size={32} />
            <Body2>{userName}</Body2>
            <ChevronDown16Regular />
          </div>
        </header>
        <main className={styles.main}>{children}</main>
        <nav className={styles.mobileNav} style={{ display: isMobile ? 'flex' : undefined }} aria-label="Mobile navigation">
          {navItems.map(([label, NavIcon, path]) => (
            <Link href={path as string} key={label as string} style={{ textDecoration: 'none' }}>
              <button className={mergeClasses(styles.mobileItem, pathname === path && styles.mobileActive)}>
                <NavIcon />{label === 'My Plans' ? 'Plans' : label as string}
              </button>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

// ─── Dashboard Home ────────────────────────────────────────────────────────────
export function Dashboard({ styles }: { styles: ReturnType<typeof useStyles> }) {
  const { userData } = useDashboard()
  const router = useRouter()
  const money = (v: number) => `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // Compute next payout from earliest active plan
  const nextPayoutLabel = React.useMemo(() => {
    if (!userData.activePlans.length) return 'No active plans'
    return `${userData.activePlans.length} plan${userData.activePlans.length > 1 ? 's' : ''} active`
  }, [userData.activePlans])

  return <>
    <section className={styles.hero}>
      <div className={styles.globe} />
      <div className={styles.heroContent}>
        <Badge appearance="tint" color="success">⚡ SageCapital Investment Platform</Badge>
        <div className={styles.heroTitle}>Your Capital is Growing 24/7</div>
        <Body1 className={styles.heroText}>Smart automated investing generates weekly returns of 5%–15%. Your plans run automatically.</Body1>
        <div className={styles.heroActions}>
          <Button className={styles.whiteButton} icon={<DataTrending24Regular />} onClick={() => router.push('/myplan')}>View My Plans</Button>
          <Button appearance="outline" className={styles.outlineButton} icon={<WalletCreditCard24Regular />} onClick={() => router.push('/wallet')}>Deposit Now</Button>
        </div>
      </div>
    </section>

    <div className={styles.metrics}>
      {[
        ['Total Balance', money(userData.totalBalance), `${money(userData.totalEarned)} earned`, Money24Regular],
        ['Active Plans', `${userData.activePlans.length}`, nextPayoutLabel, DataTrending24Regular],
        ['Total Earned', money(userData.totalEarned), 'Weekly profits credited', Sparkle24Regular],
        ['Referral Income', money(userData.referralIncome), `${userData.referralCount} referrals`, PeopleTeam24Regular],
      ].map(([title, value, sub, MetricIcon], i) => (
        <div className={styles.metric} key={title as string}>
          <div className={styles.metricTop}>
            <Caption1 className={styles.muted}>{title as string}</Caption1>
            <div className={styles.metricIcon}><MetricIcon /></div>
          </div>
          <div className={styles.metricValue}>{value as string}</div>
          <Caption1 className={styles.green}>{sub as string}</Caption1>
        </div>
      ))}
    </div>

    <section className={styles.engine}>
      <div>
        <div className={styles.liveLabel}><span className={styles.pulse} /> LIVE TRADING ENGINE</div>
        <Subtitle2>SageCapital Auto-Invest</Subtitle2>
        <Caption1 className={styles.muted}>Plans run 24/7 automatically</Caption1>
      </div>
      <div className={styles.chart}>
        {[28, 35, 31, 44, 39, 53, 57, 65, 61, 76, 72, 88].map((h, i) => <span key={i} className={styles.bar} style={{ height: `${h}%` }} />)}
      </div>
      <div className={styles.countdown}>
        <Caption1>Portfolio</Caption1>
        <Title3>{userData.activePlans.length ? '📈 Growing' : '⏳ Idle'}</Title3>
        <Caption1>{userData.activePlans.length ? 'Weekly returns auto-credited' : 'Buy a plan to start earning'}</Caption1>
      </div>
    </section>

    <section className={styles.tableCard}>
      <div className={styles.sectionTitle}>
        <Title3>Active Plans</Title3>
        <Button appearance="subtle" onClick={() => router.push('/myplan')}>View all <ArrowUpRight24Regular /></Button>
      </div>
      <table className={styles.table}>
        <thead><tr>{['Plan Name', 'Invested', 'Return Range', 'Status'].map(h => <th className={styles.th} key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {userData.activePlans.length
            ? userData.activePlans.map(plan => (
              <tr key={plan.name}>
                <td className={styles.td}><strong>{plan.name}</strong></td>
                <td className={styles.td}>{money(plan.amount)}</td>
                <td className={styles.td}>{plan.returnRange}</td>
                <td className={styles.td}><Badge appearance="tint" color="success">● Running</Badge></td>
              </tr>
            ))
            : <tr><td className={styles.td} colSpan={4} style={{ textAlign: 'center', color: '#9ca3af' }}>No active plans. <button onClick={() => router.push('/myplan')} style={{ color: '#7041d5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Buy a plan →</button></td></tr>
          }
        </tbody>
      </table>
    </section>

    <section className={styles.tableCard}>
      <div className={styles.sectionTitle}><Title3>Recent Activity</Title3></div>
      <table className={styles.table}>
        <tbody>
          {userData.recentActivity.length
            ? userData.recentActivity.map((row, i) => (
              <tr key={i}>
                <td className={styles.td}><CheckmarkCircle24Regular /> <strong>{row.description}</strong><br /><Caption1 className={styles.muted}>{row.sub}</Caption1></td>
                <td className={mergeClasses(styles.td, styles.green)}>{row.amount}</td>
                <td className={mergeClasses(styles.td, styles.muted)}>{row.date}</td>
                <td className={styles.td}><Badge appearance="tint" color="success">{row.status}</Badge></td>
              </tr>
            ))
            : <tr><td className={styles.td} colSpan={4} style={{ textAlign: 'center', color: '#9ca3af' }}>No recent activity yet.</td></tr>
          }
        </tbody>
      </table>
    </section>
  </>
}

// ─── Plans with 3D Success Modal ──────────────────────────────────────────────
const PLANS = [
  { name: 'Basic', price: 10, referralRate: '0.1%', tier: 'Tier 1', color: '#7041d5' },
  { name: 'Starter', price: 50, referralRate: '0.5%', tier: 'Tier 2', color: '#7041d5' },
  { name: 'Standard', price: 100, referralRate: '1.0%', tier: 'Tier 3', color: '#2563eb' },
  { name: 'Advanced', price: 200, referralRate: '2.0%', tier: 'Tier 4', color: '#059669' },
  { name: 'Pro', price: 500, referralRate: '5.0%', tier: '★ Most Popular', color: '#d97706' },
  { name: 'Business', price: 1000, referralRate: '10.0%', tier: '🔥 Best Value', color: '#dc2626' },
  { name: 'Enterprise', price: 5000, referralRate: '50.0%', tier: '🏆 Elite', color: '#7c3aed' },
]

export function Plans({ styles }: { styles: ReturnType<typeof useStyles> }) {
  const { userData } = useDashboard()
  const [loading, setLoading] = React.useState('')
  const [error, setError] = React.useState('')
  const [successPlan, setSuccessPlan] = React.useState<{ name: string; price: number } | null>(null)

  const handleBuy = async (planName: string, price: number) => {
    setLoading(planName); setError('')
    try {
      const res = await fetch('/api/plans/buy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planName }) })
      const data = await res.json()
      if (res.ok) {
        setSuccessPlan({ name: planName, price })
      } else {
        setError(data.error || 'Failed to purchase plan')
      }
    } catch (e: any) {
      setError(e.message)
    }
    setLoading('')
  }

  const ownedPlanNames = userData.activePlans.map(p => p.name)

  return <>
    {/* 3D Success Modal */}
    {successPlan && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
        <style>{`
          @keyframes modalIn { from { transform: scale(0.5) rotateY(-30deg); opacity:0; } to { transform: scale(1) rotateY(0); opacity:1; } }
          @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
          @keyframes sparkle { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(1.5); } }
        `}</style>
        <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)', borderRadius: 24, padding: '48px 40px', maxWidth: 440, width: '90%', textAlign: 'center', color: '#fff', boxShadow: '0 0 80px rgba(109,40,217,0.6), 0 0 200px rgba(109,40,217,0.2)', animation: 'modalIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards', border: '1px solid rgba(109,40,217,0.4)' }}>
          <div style={{ fontSize: 80, animation: 'float 3s ease-in-out infinite', display: 'block', marginBottom: 16 }}>🎉</div>
          <div style={{ background: 'linear-gradient(90deg,#a855f7,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
            Plan Activated!
          </div>
          <div style={{ color: '#c4b5fd', fontSize: 16, marginBottom: 24 }}>
            Your <strong style={{ color: '#fff' }}>{successPlan.name}</strong> plan worth <strong style={{ color: '#4ade80' }}>${successPlan.price}</strong> is now live and earning 5–15% weekly returns.
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
            {['⚡', '💰', '📈', '🚀', '✨'].map((e, i) => (
              <span key={i} style={{ fontSize: 24, animation: `sparkle ${1 + i * 0.3}s ease-in-out infinite` }}>{e}</span>
            ))}
          </div>
          <button onClick={() => { setSuccessPlan(null); window.location.reload() }} style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 36px', fontSize: 16, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
            View My Plans →
          </button>
        </div>
      </div>
    )}

    <section className={styles.hero}>
      <div className={styles.globe} />
      <div className={styles.heroContent}>
        <Badge appearance="tint" color="success">💰 Automated Weekly Returns</Badge>
        <div className={styles.heroTitle}>Choose an Investment Plan</div>
        <Body1 className={styles.heroText}>Deposit funds and select a plan. Weekly returns of 5%–15% are credited automatically every 7 days.</Body1>
      </div>
    </section>

    <div className={styles.info}>
      <strong>💡 How it works:</strong> Deposit USDT → Buy a plan → Earn 5%–15% weekly, automatically. Referral commissions are paid weekly when your referrals earn profit. Rates scale with their plan size.
    </div>

    {error && <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar>}

    <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '12px 16px', color: '#92400e', fontSize: 13 }}>
      💰 Your available balance: <strong>${userData.totalBalance.toFixed(2)}</strong>
    </div>

    <div className={styles.planGrid}>
      {PLANS.map((plan, i) => {
        const owned = ownedPlanNames.includes(plan.name)
        const canBuy = userData.totalBalance >= plan.price
        return (
          <div className={styles.planCard} style={{ borderTop: `3px solid ${plan.color}` }} key={plan.name}>
            <div className={styles.metricTop}>
              <Badge appearance="tint" style={{ color: plan.color }}>{plan.tier}</Badge>
              {owned && <Badge appearance="filled" color="success">✓ Active</Badge>}
            </div>
            <Subtitle1>{plan.name}</Subtitle1>
            <Title2>${plan.price}</Title2>
            <div className={styles.planAccent} style={{ color: plan.color }}>5% – 15% weekly</div>
            <Body2 style={{ color: '#6b7280', fontSize: 12 }}>
              L1 commission: <strong>{plan.referralRate}</strong> of their weekly profit
            </Body2>
            <Button
              appearance="primary"
              icon={<ArrowRight24Regular />}
              onClick={() => !owned && canBuy && handleBuy(plan.name, plan.price)}
              disabled={loading === plan.name || owned || !canBuy}
              style={{ background: owned ? '#059669' : !canBuy ? '#9ca3af' : `linear-gradient(135deg,${plan.color},#3b82f6)` }}
            >
              {loading === plan.name ? 'Processing...' : owned ? '✓ Plan Active' : !canBuy ? `Need $${plan.price}` : `Buy ${plan.name}`}
            </Button>
          </div>
        )
      })}
    </div>
  </>
}

// ─── Wallet ────────────────────────────────────────────────────────────────────
export function Wallet({ styles, copied, copyLink }: { styles: ReturnType<typeof useStyles>; copied: boolean; copyLink: () => void }) {
  const { userData } = useDashboard()
  const [tab, setTab] = React.useState('deposit')
  const [submitted, setSubmitted] = React.useState(false)
  const [txHash, setTxHash] = React.useState('')
  const [depositData, setDepositData] = React.useState<any>(userData?.activeDeposit || null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [timeLeft, setTimeLeft] = React.useState('')
  const [withdrawAmount, setWithdrawAmount] = React.useState('')
  const [withdrawAddress, setWithdrawAddress] = React.useState('')
  const [withdrawLoading, setWithdrawLoading] = React.useState(false)
  const [withdrawError, setWithdrawError] = React.useState('')

  const masterWallet = process.env.NEXT_PUBLIC_MASTER_WALLET || '0x951f08258E53F69a368EFB9D923dC6d19416e50c'

  React.useEffect(() => {
    if (userData?.activeDeposit) setDepositData(userData.activeDeposit)
  }, [userData?.activeDeposit])

  // Countdown timer
  React.useEffect(() => {
    if (!depositData?.expires_at) return
    const interval = setInterval(() => {
      const diff = new Date(depositData.expires_at).getTime() - Date.now()
      if (diff <= 0) { clearInterval(interval); setTimeLeft('Expired'); return }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${m}m ${s.toString().padStart(2, '0')}s`)
    }, 1000)
    return () => clearInterval(interval)
  }, [depositData])

  // Poll deposit status every 5 seconds
  React.useEffect(() => {
    if (!depositData || depositData.status === 'finished' || timeLeft === 'Expired') return
    const orderId = depositData.order_id || depositData.np_order_id
    if (!orderId) return

    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/deposit/status?id=${orderId}&_t=${Date.now()}`, {
          cache: 'no-store', headers: { 'Cache-Control': 'no-cache, no-store' }
        })
        const data = await res.json()
        if (data.status === 'finished') {
          setDepositData((prev: any) => ({ ...prev, status: 'finished' }))
          clearInterval(poll)
        } else if (data.status === 'rejected' || data.status === 'expired') {
          setError(data.error || `Transaction ${data.status}.`)
          setDepositData(null)
          clearInterval(poll)
        }
        // status === 'waiting' → keep polling
      } catch { /* network error — keep polling */ }
    }, 5000)
    return () => clearInterval(poll)
  }, [depositData, timeLeft])

  const handleCreateDeposit = async () => {
    if (!txHash || txHash.length < 60) return setError('Please enter a valid BSC transaction hash (starts with 0x)')
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/deposit/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tx_hash: txHash.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit')
      setDepositData(data)
      setTxHash('')
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  const handleWithdraw = async () => {
    setWithdrawError('')
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return setWithdrawError('Enter a valid amount')
    if (Number(withdrawAmount) > userData.withdrawable) return setWithdrawError(`Max withdrawable: $${userData.withdrawable.toFixed(2)}`)
    if (!withdrawAddress || !withdrawAddress.startsWith('0x')) return setWithdrawError('Enter a valid BEP20 wallet address')
    setWithdrawLoading(true)
    try {
      const res = await fetch('/api/withdraw/request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(withdrawAmount), coin: 'USDTBSC', wallet_address: withdrawAddress })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setSubmitted(true)
    } catch (e: any) { setWithdrawError(e.message) }
    setWithdrawLoading(false)
  }

  return <>
    <Title1>Wallet</Title1>
    <Body1 className={styles.muted}>Manage deposits and withdrawals.</Body1>

    <div className={styles.metrics}>
      {[
        ['Total Balance', `$${userData.totalBalance.toFixed(2)}`, 'Available for plans'],
        ['Withdrawable Earnings', `$${userData.withdrawable.toFixed(2)}`, 'Weekly profits only'],
        ['Total Deposited', `$${userData.totalDeposited.toFixed(2)}`, 'All time'],
      ].map(([a, b, c]) => (
        <div className={styles.metric} key={a}>
          <Caption1 className={styles.muted}>{a}</Caption1>
          <div className={styles.metricValue}>{b}</div>
          <Caption1 className={styles.green}>{c}</Caption1>
        </div>
      ))}
    </div>

    <Card className={styles.tableCard}>
      <TabList selectedValue={tab} onTabSelect={(_, d) => setTab(String(d.value))}>
        <Tab value="deposit">Deposit</Tab>
        <Tab value="withdraw">Withdraw</Tab>
      </TabList>

      {tab === 'deposit' ? (
        <div style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {depositData ? (
            depositData.status === 'finished' ? (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: 64 }}>✅</div>
                <Title3 style={{ color: '#059669' }}>Deposit Confirmed!</Title3>
                <Body1>Your funds have been credited. Refresh to see updated balance.</Body1>
                <Button appearance="primary" style={{ marginTop: 16 }} onClick={() => { setDepositData(null); window.location.reload() }}>Refresh Dashboard</Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', padding: 16 }}>
                <div style={{ fontSize: 48 }}>⏳</div>
                <Title3>Verifying Transaction</Title3>
                <Body1 style={{ textAlign: 'center', color: '#6b7280' }}>We are confirming your transaction on the BSC blockchain. This usually takes under 30 seconds.</Body1>
                {timeLeft && (
                  <Badge appearance="filled" color="warning" style={{ fontSize: 14, padding: '8px 16px' }}>
                    ⏱️ Time remaining: {timeLeft}
                  </Badge>
                )}
                <MessageBar intent="info">
                  <MessageBarBody>Please keep this page open. Your balance will update automatically when confirmed.</MessageBarBody>
                </MessageBar>
                <Button appearance="subtle" onClick={() => setDepositData(null)}>Cancel & Submit Different TX</Button>
              </div>
            )
          ) : (
            <>
              <Subtitle2>Deposit USDT (BEP20 / BSC)</Subtitle2>
              <MessageBar intent="warning">
                <MessageBarBody>
                  <MessageBarTitle>Important</MessageBarTitle>
                  Only send USDT on the BEP20 (Binance Smart Chain) network. Other networks will result in permanent loss of funds. Submit your TxID within 15 minutes of sending.
                </MessageBarBody>
              </MessageBar>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${masterWallet}`}
                  alt="Deposit QR"
                  style={{ borderRadius: 8, padding: 10, background: 'white', border: '1px solid #e5e7eb' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', width: '100%', maxWidth: 520 }}>
                  <code style={{ flex: 1, fontSize: 12, wordBreak: 'break-all' }}>{masterWallet}</code>
                  <Button icon={<Copy24Regular />} size="small" appearance="subtle" onClick={() => navigator.clipboard.writeText(masterWallet).then(() => alert('Copied!'))} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Body2><strong>Step 1:</strong> Send USDT (BEP20) to the address above</Body2>
                <Body2><strong>Step 2:</strong> Copy your transaction hash from your wallet</Body2>
                <Body2><strong>Step 3:</strong> Paste it below and click Submit</Body2>
              </div>

              <label>
                <Body2>Transaction Hash (TxID)</Body2>
                <Input
                  style={{ width: '100%', marginTop: 6, fontFamily: 'monospace' }}
                  placeholder="0x... paste your BSC transaction hash here"
                  value={txHash}
                  onChange={e => setTxHash(e.target.value)}
                />
              </label>
              {error && <div style={{ color: '#dc2626', fontSize: 13, padding: '8px 12px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}
              <Button appearance="primary" onClick={handleCreateDeposit} disabled={loading} style={{ alignSelf: 'flex-start' }}>
                {loading ? 'Submitting...' : 'Submit Transaction ID'}
              </Button>
            </>
          )}
        </div>
      ) : (
        submitted ? (
          <div style={{ paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', textAlign: 'center' }}>
            <CheckmarkCircle24Regular style={{ color: '#059669', fontSize: 48, width: 48, height: 48 }} />
            <Title3>Withdrawal Requested!</Title3>
            <Body1>Your request has been submitted. Withdrawals are processed every Monday.</Body1>
            <Button appearance="subtle" onClick={() => setSubmitted(false)}>Submit Another</Button>
          </div>
        ) : (
          <div style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <MessageBar intent="success">
              <MessageBarBody>
                <MessageBarTitle>Withdrawable: ${userData.withdrawable.toFixed(2)}</MessageBarTitle>
                Only your earned weekly profits can be withdrawn. Your invested principal stays in your active plans.
              </MessageBarBody>
            </MessageBar>
            <MessageBar intent="warning">
              <MessageBarBody>Withdrawals are processed every Monday. Submit anytime and it will be paid on the next Monday.</MessageBarBody>
            </MessageBar>
            <Subtitle2>Withdraw USDT (BEP20)</Subtitle2>
            <label>
              <Body2>Your BEP20 Wallet Address</Body2>
              <Input style={{ width: '100%', marginTop: 6 }} placeholder="0x... your BEP20 receiving address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            </label>
            <label>
              <Body2>Amount (USD)</Body2>
              <Input style={{ width: '100%', marginTop: 6 }} placeholder={`Enter amount (max: $${userData.withdrawable.toFixed(2)})`} type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            </label>
            {withdrawError && <div style={{ color: '#dc2626', fontSize: 13 }}>{withdrawError}</div>}
            <Button appearance="primary" onClick={handleWithdraw} disabled={withdrawLoading} style={{ alignSelf: 'flex-start' }}>
              {withdrawLoading ? 'Submitting...' : 'Submit Withdrawal Request'}
            </Button>
          </div>
        )
      )}
    </Card>
  </>
}

// ─── Referrals ────────────────────────────────────────────────────────────────
export function Referrals({ styles, copied, copyLink }: { styles: ReturnType<typeof useStyles>; copied: boolean; copyLink: () => void }) {
  const { userData } = useDashboard()
  const refLink = typeof window !== 'undefined' ? `${window.location.origin}/signup?ref=${userData.referralCode}` : `https://sagecapital.online/signup?ref=${userData.referralCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink).then(() => copyLink())
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <section className={styles.hero} style={{ minHeight: 160, background: 'linear-gradient(115deg,#1d4ed8 0%,#7c3aed 100%)' }}>
        <div className={styles.globe} />
        <div className={styles.heroContent}>
          <Badge appearance="tint" color="success">💰 Multi-Level Referral Program</Badge>
          <div className={styles.heroTitle}>Invite Friends & Earn Commissions</div>
          <Body1 className={styles.heroText}>Earn weekly commissions when people you invite earn their weekly profits.</Body1>
        </div>
      </section>

      {/* Commission Levels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {[
          { level: 'Level 1 (Direct)', rate: '0.1% – 5.0%', desc: 'Of weekly profit, scaling by plan size ($10=$0.001, $100=$0.10)', color: '#6d28d9', icon: '🥇' },
          { level: 'Level 2', rate: '0.01% – 0.5%', desc: 'When your referral\'s referral earns weekly profit', color: '#2563eb', icon: '🥈' },
          { level: 'Level 3', rate: '0.001% – 0.05%', desc: 'Three levels deep in your network', color: '#059669', icon: '🥉' },
        ].map(c => (
          <div key={c.level} style={{ padding: 20, background: '#fff', border: `2px solid ${c.color}20`, borderRadius: 14, borderLeft: `4px solid ${c.color}` }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontWeight: 700, color: c.color, fontSize: 22 }}>{c.rate}</div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{c.level}</div>
            <div style={{ color: '#6b7280', fontSize: 12 }}>{c.desc}</div>
          </div>
        ))}
      </div>

      {/* Referral Link */}
      <div className={styles.tableCard} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Subtitle1>Your Referral Link</Subtitle1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Input readOnly value={refLink} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
          <Button
            icon={copied ? <CheckmarkCircle24Regular style={{ color: '#059669' }} /> : <Copy24Regular />}
            onClick={handleCopy}
            appearance={copied ? 'secondary' : 'primary'}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>
        <Caption1 className={styles.muted}>Share this link. When someone signs up and buys a plan, you earn automatically.</Caption1>
      </div>

      {/* Stats */}
      <div className={styles.metrics}>
        <div className={styles.metric}>
          <Caption1 className={styles.muted}>Your Referral Code</Caption1>
          <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 800, letterSpacing: 2 }}>{userData.referralCode || '—'}</div>
        </div>
        <div className={styles.metric}>
          <Caption1 className={styles.muted}>Total Referrals (L1 / L2 / L3)</Caption1>
          <div className={styles.metricValue}>
            {userData.refCountL1} <span style={{color: '#9ca3af', fontWeight: 400}}>/</span> {userData.refCountL2} <span style={{color: '#9ca3af', fontWeight: 400}}>/</span> {userData.refCountL3}
          </div>
        </div>
        <div className={styles.metric}>
          <Caption1 className={styles.muted}>Total Commission Earned</Caption1>
          <div className={styles.metricValue} style={{ color: '#059669' }}>${userData.referralIncome.toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export function Profile({ styles, userName, userEmail }: { styles: ReturnType<typeof useStyles>; userName: string; userEmail: string }) {
  const supabase = React.useMemo(() => {
    const { createClient: createBrowserClient } = require('@supabase/supabase-js')
    return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }, [])
  const [name, setName] = React.useState(userName)
  const [saving, setSaving] = React.useState(false)
  const [saveMsg, setSaveMsg] = React.useState('')
  const [curPwd, setCurPwd] = React.useState('')
  const [newPwd, setNewPwd] = React.useState('')
  const [pwdLoading, setPwdLoading] = React.useState(false)
  const [pwdMsg, setPwdMsg] = React.useState('')

  const { createClient: createBrowserSupabase } = React.useMemo(() => require('@/lib/supabase/client'), [])

  const handleSaveName = async () => {
    setSaving(true); setSaveMsg('')
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const sb = createClient()
      await sb.auth.updateUser({ data: { full_name: name } })
      setSaveMsg('✅ Name updated!')
    } catch { setSaveMsg('❌ Failed to update') }
    setSaving(false)
  }

  const handleUpdatePwd = async () => {
    setPwdLoading(true); setPwdMsg('')
    if (newPwd.length < 6) { setPwdMsg('❌ Password must be at least 6 characters'); setPwdLoading(false); return }
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const sb = createClient()
      const { error } = await sb.auth.updateUser({ password: newPwd })
      if (error) throw error
      setPwdMsg('✅ Password updated successfully!')
      setCurPwd(''); setNewPwd('')
    } catch (e: any) { setPwdMsg(`❌ ${e.message}`) }
    setPwdLoading(false)
  }

  return (
    <div className={styles.tableCard} style={{ maxWidth: 600, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Title2>Profile Settings</Title2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Avatar name={userName} size={72} color="brand" />
        <div><Subtitle1>{userName}</Subtitle1><Body2 style={{ color: '#6b7280' }}>{userEmail}</Body2></div>
      </div>
      <Divider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Subtitle2>Full Name</Subtitle2>
          <Input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Subtitle2>Email Address</Subtitle2>
          <Input defaultValue={userEmail} disabled />
        </div>
        {saveMsg && <div style={{ fontSize: 13, color: saveMsg.includes('✅') ? '#059669' : '#dc2626' }}>{saveMsg}</div>}
        <Button appearance="primary" style={{ alignSelf: 'flex-start' }} onClick={handleSaveName} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      <Divider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Title3>Change Password</Title3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><Subtitle2>New Password</Subtitle2><Input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Min 6 characters" /></div>
        {pwdMsg && <div style={{ fontSize: 13, color: pwdMsg.includes('✅') ? '#059669' : '#dc2626' }}>{pwdMsg}</div>}
        <Button icon={<Settings24Regular />} style={{ alignSelf: 'flex-start' }} onClick={handleUpdatePwd} disabled={pwdLoading}>
          {pwdLoading ? 'Updating...' : 'Update Password'}
        </Button>
      </div>
    </div>
  )
}

export { useStyles }
