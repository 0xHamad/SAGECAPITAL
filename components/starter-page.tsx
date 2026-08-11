'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  makeStyles,
  mergeClasses,
  tokens,
  typographyStyles,
  Title1,
  Title2,
  Title3,
  Subtitle1,
  Subtitle2,
  Body1,
  Body2,
  Caption1,
  Button,
  Input,
  Card,
  CardHeader,
  Divider,
  Avatar,
  Badge,
  CounterBadge,
  ProgressBar,
  TabList,
  Tab,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
} from '@fluentui/react-components'
import {
  Home24Regular,
  DataTrending24Regular,
  WalletCreditCard24Regular,
  PeopleTeam24Regular,
  Person24Regular,
  Search24Regular,
  Alert24Regular,
  ArrowUpRight24Regular,
  ArrowRight24Regular,
  Money24Regular,
  Sparkle24Regular,
  ShieldCheckmark24Regular,
  LockClosed24Regular,
  Copy24Regular,
  CheckmarkCircle24Regular,
  Settings24Regular,
  ChevronDown16Regular,
  Add24Regular,
} from '@fluentui/react-icons'

const useStyles = makeStyles({
  shell: { minHeight: '100vh', display: 'flex', backgroundColor: '#f8f9fb', color: '#172033' },
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
  mobileItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#8a93a5', fontSize: '10px', backgroundColor: 'transparent', border: 'none' },
  mobileActive: { color: '#7041d5', fontWeight: 700 },
})

const navItems = [
  ['Dashboard', Home24Regular], ['My Plans', DataTrending24Regular], ['Wallet', WalletCreditCard24Regular], ['Referrals', PeopleTeam24Regular], ['Profile', Person24Regular],
] as const
const plans = [
  ['Starter', '$10', '0.1%', '#64748b'], ['Basic', '$20', '0.2%', '#3b82f6'], ['Explorer', '$30', '0.3%', '#7c3aed'], ['Bronze', '$50', '0.5%', '#d97706'], ['Silver', '$100', '1.0%', '#64748b'], ['Gold', '$200', '2.0%', '#ca8a04'], ['Platinum', '$500', '5.0%', '#0891b2'],
]

function Logo() { return <div className="logo-wrap"><div className="logo-mark"><ShieldCheckmark24Regular /></div><div><div className="logo-name">SageCapital</div><div className="logo-sub">Investment Platform</div></div></div> }

export interface StarterPageProps {
  userName: string
  userEmail: string
  userData: {
    totalBalance: number
    withdrawable: number
    totalDeposited: number
    totalEarned: number
    referralIncome: number
    activePlans: Array<{ name: string; amount: number; returnRange: string; lastWeekPct: number; lastWeekEarned: number }>
    recentActivity: Array<{ description: string; sub: string; amount: string; date: string; status: string }>
    referralCount: number
    referralCode: string
  }
  onSignOut: () => void
}

export function StarterPage({ userName, userEmail, userData, onSignOut }: StarterPageProps) {
  const styles = useStyles()
  const router = useRouter()
  const handleSignOut = async () => { await onSignOut(); router.push('/login') }
  const [active, setActive] = React.useState('Dashboard')
  const [copied, setCopied] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  React.useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  const copyLink = () => { setCopied(true); window.setTimeout(() => setCopied(false), 1600) }
  return <div className={styles.shell}>
    {!isMobile && <aside className={styles.sidebar}>
      <Logo />
      <Input className={styles.search} contentBefore={<Search24Regular />} placeholder="Search" />
      <nav className={styles.nav} aria-label="Primary navigation">{navItems.map(([label, NavIcon]) => <Button key={label} appearance="subtle" className={mergeClasses(styles.navButton, active === label && styles.navActive)} icon={<NavIcon />} onClick={() => setActive(label)}>{label}</Button>)}</nav>
      <Divider />
      <div className={styles.sidebarBottom}><Button appearance="subtle" className={styles.navButton} icon={<Alert24Regular />}>Support</Button><Button appearance="subtle" className={styles.navButton} icon={<ArrowRight24Regular />} onClick={handleSignOut}>Sign Out</Button></div>
    </aside>}
    <div className={styles.content}>
      <header className={styles.topbar}><div className={styles.crumb}>SageCapital <span aria-hidden>›</span> <strong>{active}</strong></div><div className={styles.user}><CounterBadge count={3} color="danger" size="small"><Alert24Regular /></CounterBadge><Avatar name={userName} color="brand" size={32} /><Body2>{userName}</Body2><ChevronDown16Regular /></div></header>
      <main className={styles.main}>
        {active === 'Dashboard' && <Dashboard styles={styles} userData={userData} />}
        {active === 'My Plans' && <Plans styles={styles} />}
        {active === 'Wallet' && <Wallet styles={styles} copied={copied} copyLink={copyLink} userData={userData} />}
        {active === 'Referrals' && <Referrals styles={styles} copied={copied} copyLink={copyLink} userData={userData} />}
        {active === 'Profile' && <Profile styles={styles} userName={userName} userEmail={userEmail} />}
      </main>
      <nav className={styles.mobileNav} style={{ display: isMobile ? 'flex' : undefined }} aria-label="Mobile navigation">{navItems.map(([label, NavIcon]) => <button key={label} className={mergeClasses(styles.mobileItem, active === label && styles.mobileActive)} onClick={() => setActive(label)}><NavIcon />{label === 'My Plans' ? 'Plans' : label}</button>)}</nav>
    </div>
  </div>
}

function Dashboard({ styles, userData }: { styles: ReturnType<typeof useStyles>; userData: StarterPageProps['userData'] }) { const money = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; return <>
  <section className={styles.hero}><div className={styles.globe} /><div className={styles.heroContent}><Badge appearance="tint" color="success">⚡ Auto Trading Active</Badge><div className={styles.heroTitle}>Your Capital is Working 24/7</div><Body1 className={styles.heroText}>AI-powered trading engine generates random weekly returns of 5%–15%. Sit back and earn.</Body1><div className={styles.heroActions}><Button className={styles.whiteButton} icon={<DataTrending24Regular />}>View My Plans</Button><Button appearance="outline" className={styles.outlineButton} icon={<WalletCreditCard24Regular />}>Deposit Now</Button></div></div></section>
  <div className={styles.metrics}>{[['Total Balance',money(userData.totalBalance),`${money(userData.totalEarned)} earned`,Money24Regular],['Active Plans',`${userData.activePlans.length} Plans`,'Auto Trading ON',DataTrending24Regular],['Last Week’s Profit',money(userData.totalEarned),'Current earnings',Sparkle24Regular],['Referral Income',money(userData.referralIncome),`${userData.referralCount} active referrals`,PeopleTeam24Regular]].map(([title,value,sub,MetricIcon], i) => <div className={styles.metric} key={title as string}><div className={styles.metricTop}><Caption1 className={styles.muted}>{title as string}</Caption1><div className={styles.metricIcon}><MetricIcon /></div></div><div className={styles.metricValue}>{value as string}</div><Caption1 className={i === 1 ? styles.planAccent : styles.green}>{sub as string}</Caption1></div>)}</div>
  <section className={styles.engine}><div><div className={styles.liveLabel}><span className={styles.pulse} /> AUTO TRADING ENGINE — SAGECAPITAL</div><Subtitle2>Live market allocation</Subtitle2><Caption1 className={styles.muted}>Your plans are actively managed</Caption1></div><div className={styles.chart}>{[28,35,31,44,39,53,57,65,61,76,72,88].map((height, i) => <span key={i} className={styles.bar} style={{ height: `${height}%` }} />)}</div><div className={styles.countdown}><Caption1>Next Payout</Caption1><Title3>3d 14h 22m</Title3><Caption1>{userData.activePlans.length ? 'Returns update after the next payout' : 'No active investment plans yet'}</Caption1></div></section>
  <section className={styles.tableCard}><div className={styles.sectionTitle}><Title3>Active Plans</Title3><Button appearance="subtle">View all <ArrowUpRight24Regular /></Button></div><table className={styles.table}><thead><tr>{['Plan Name','Invested','Return Range','Last Week','Earned Last Week','Status'].map(h => <th className={styles.th} key={h}>{h}</th>)}</tr></thead><tbody>{userData.activePlans.length ? userData.activePlans.map(plan => <tr key={plan.name}><td className={styles.td}>{plan.name}</td><td className={styles.td}>{money(plan.amount)}</td><td className={styles.td}>{plan.returnRange}</td><td className={styles.td}>{plan.lastWeekPct}%</td><td className={styles.td}><strong className={styles.green}>{money(plan.lastWeekEarned)}</strong></td><td className={styles.td}><Badge appearance="tint" color="success">● Auto Trading</Badge></td></tr>) : <tr><td className={styles.td} colSpan={6}>No active plans yet.</td></tr>}</tbody></table></section>
  <section className={styles.tableCard}><div className={styles.sectionTitle}><Title3>Recent Activity</Title3><Button appearance="subtle">See history</Button></div><table className={styles.table}><tbody>{userData.recentActivity.length ? userData.recentActivity.map(row => <tr key={`${row.description}-${row.date}`}><td className={styles.td}><CheckmarkCircle24Regular /> <strong>{row.description}</strong><br /><Caption1 className={styles.muted}>{row.sub}</Caption1></td><td className={mergeClasses(styles.td, styles.green)}>{row.amount}</td><td className={mergeClasses(styles.td, styles.muted)}>{row.date}</td><td className={styles.td}><Badge appearance="tint" color="success">{row.status}</Badge></td></tr>) : <tr><td className={styles.td} colSpan={4}>No recent activity yet.</td></tr>}</tbody></table></section>
</> }

function Plans({ styles }: { styles: ReturnType<typeof useStyles> }) { return <><section className={styles.hero}><div className={styles.globe} /><div className={styles.heroContent}><Badge appearance="tint" color="success">⚡ Simple, automated investing</Badge><div className={styles.heroTitle}>Choose a Plan — Auto Trading Starts Immediately</div><Body1 className={styles.heroText}>Put your capital to work with a plan designed around your goals. Weekly returns are credited automatically.</Body1></div></section><div className={styles.info}><strong>⚡ How it works: </strong>Your plan runs automated crypto trading on SageCapital's engine. Each week, the engine generates a random return between your plan's minimum and maximum percentage. Returns are credited every 7 days automatically.</div><div className={styles.planGrid}>{plans.map(([name, price, referral, color], i) => <div className={styles.planCard} style={{ borderTop: `3px solid ${color}` }} key={name}><div className={styles.metricTop}><Badge appearance="tint" style={{ color }}> {i === 4 ? '★ Most Popular' : i === 5 ? '🔥 Best Value' : i === 6 ? '🏆 Elite' : 'Tier ' + (i + 1)}</Badge><Add24Regular /></div><Subtitle1>{name}</Subtitle1><Title2>{price}</Title2><div className={styles.planAccent} style={{ color }}>5% – 15%</div><Body2>👥 Refer & earn {referral} of profit</Body2><Button appearance="primary" icon={<ArrowRight24Regular />}>Buy {name}</Button></div>)}</div></> }

function Wallet({ styles, copied, copyLink, userData }: { styles: ReturnType<typeof useStyles>; copied: boolean; copyLink: () => void; userData: StarterPageProps['userData'] }) {
  const [tab, setTab] = React.useState('deposit')
  const [submitted, setSubmitted] = React.useState(false)
  const [coin, setCoin] = React.useState('USDTBSC')
  const [depositAmount, setDepositAmount] = React.useState('')
  const [depositData, setDepositData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleCreateDeposit = async () => {
    setError('')
    if (!depositAmount || Number(depositAmount) < 1) return setError('Minimum deposit is $1')
    setLoading(true)
    try {
      const res = await fetch('/api/deposit/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(depositAmount), currency: coin })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create deposit')
      setDepositData(data)
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  const [withdrawAmount, setWithdrawAmount] = React.useState('')
  const [withdrawAddress, setWithdrawAddress] = React.useState('')
  const [withdrawLoading, setWithdrawLoading] = React.useState(false)
  const [withdrawError, setWithdrawError] = React.useState('')

  const handleWithdraw = async () => {
    setWithdrawError('')
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return setWithdrawError('Invalid amount')
    if (Number(withdrawAmount) > userData.withdrawable) return setWithdrawError('Insufficient balance')
    if (!withdrawAddress) return setWithdrawError('Please enter a wallet address')

    setWithdrawLoading(true)
    try {
      const res = await fetch('/api/withdraw/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(withdrawAmount), coin, wallet_address: withdrawAddress })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit request')
      setSubmitted(true)
    } catch (e: any) {
      setWithdrawError(e.message)
    }
    setWithdrawLoading(false)
  }

  return <><Title1>Wallet</Title1><Body1 className={styles.muted}>Manage deposits, withdrawals, and transaction history.</Body1><div className={styles.metrics}>{[['Total Balance',`$${userData.totalBalance.toFixed(2)}`],['Withdrawable Earnings',`$${userData.withdrawable.toFixed(2)}`],['Total Deposited',`$${userData.totalDeposited.toFixed(2)}`]].map(([a,b]) => <div className={styles.metric} key={a}><Caption1 className={styles.muted}>{a}</Caption1><div className={styles.metricValue}>{b}</div><Caption1 className={styles.green}>Available balance</Caption1></div>)}</div><Card className={styles.tableCard}><TabList selectedValue={tab} onTabSelect={(_, data) => setTab(String(data.value))}><Tab value="deposit">Deposit</Tab><Tab value="withdraw">Withdraw</Tab></TabList>{tab === 'deposit' ? <div style={{ paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>{depositData ? <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}><Title3>Send Payment</Title3><Body1>Send exactly <strong>{depositData.pay_amount} {depositData.pay_currency.toUpperCase()}</strong> to the address below:</Body1><div className={styles.info} style={{ wordBreak: 'break-all', textAlign: 'center' }}><strong>{depositData.pay_address}</strong></div><MessageBar intent="info"><MessageBarBody>We will automatically credit your account when the payment is confirmed on the blockchain.</MessageBarBody></MessageBar><Button appearance="subtle" onClick={() => setDepositData(null)}>Cancel</Button></div> : <><Subtitle2>Select a network</Subtitle2><div className={styles.planGrid}>{['USDTBSC','USDCBSC','BNBBSC'].map(c => <Button key={c} appearance={coin === c ? 'primary' : 'outline'} onClick={() => setCoin(c)}>{c}</Button>)}</div><label><Body2>Amount to Deposit (USD)</Body2><Input style={{ width: '100%', marginTop: '6px' }} placeholder="Minimum $1" type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} /></label>{error && <div style={{ color: '#d13438', fontSize: '13px' }}>{error}</div>}<Button appearance="primary" onClick={handleCreateDeposit} disabled={loading}>{loading ? 'Generating Address...' : 'Create Deposit'}</Button></>}</div> : submitted ? <div style={{ paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', textAlign: 'center' }}><CheckmarkCircle24Regular style={{ color: '#159447', fontSize: '48px' }} /><Title3>Request Submitted!</Title3><Body1>Your withdrawal will be processed this Monday.</Body1></div> : <div style={{ paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}><MessageBar intent="success"><MessageBarBody><MessageBarTitle>Withdrawable Balance: ${userData.withdrawable.toFixed(2)}</MessageBarTitle>Only your earned weekly profits can be withdrawn. Your invested principal stays active in trading.</MessageBarBody></MessageBar><MessageBar intent="warning"><MessageBarBody>Withdrawals are processed every Monday. Requests submitted anytime during the week will be paid next Monday.</MessageBarBody></MessageBar><Subtitle2>Select Coin to Receive</Subtitle2><div className={styles.planGrid}>{['USDTBSC','USDCBSC','BNBBSC'].map(value => <Button key={value} appearance={coin === value ? 'primary' : 'outline'} onClick={() => setCoin(value)}>{value}</Button>)}</div><label><Body2>Your Wallet Address (BEP20)</Body2><Input style={{ width: '100%', marginTop: '6px' }} placeholder="0x... enter your BEP20 receiving address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} /></label><label><Body2>Amount to Withdraw (USD)</Body2><Input style={{ width: '100%', marginTop: '6px' }} placeholder={`Enter amount (Available: $${userData.withdrawable.toFixed(2)})`} type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} /><Caption1 className={styles.muted}>Network fee: $0.00</Caption1></label>{withdrawError && <div style={{ color: '#d13438', fontSize: '13px' }}>{withdrawError}</div>}<Button appearance="primary" onClick={handleWithdraw} disabled={withdrawLoading}>{withdrawLoading ? 'Submitting...' : 'Submit Withdrawal Request'}</Button></div>}</Card></> }

function Referrals({ styles, copied, copyLink, userData }: { styles: ReturnType<typeof useStyles>; copied: boolean; copyLink: () => void; userData: StarterPageProps['userData'] }) { return <><section className={styles.hero}><div className={styles.globe} /><div className={styles.heroContent}><Badge appearance="tint" color="success">💎 Built for your network</Badge><div className={styles.heroTitle}>SageCapital Referral Network</div><Body1 className={styles.heroText}>Earn 3 levels deep when your referrals invest. Commission is paid automatically every Monday.</Body1></div></section><Card className={styles.tableCard}><Subtitle2>Your referral link</Subtitle2><div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '12px' }}><Input value={`sagecapital.io/ref/${userData.referralCode}`} readOnly style={{ flex: 1, minWidth: '220px' }} /><Button appearance="primary" icon={copied ? <CheckmarkCircle24Regular /> : <Copy24Regular />} onClick={copyLink}>{copied ? 'Copied' : 'Copy link'}</Button></div></Card><div className={styles.metrics}>{[['Total Network', userData.referralCount.toString()],['Level 1', userData.referralCount.toString()],['Level 2','0'],['Total Earned',`$${userData.referralIncome.toFixed(2)}`]].map(([a,b]) => <div className={styles.metric} key={a}><Caption1 className={styles.muted}>{a}</Caption1><div className={styles.metricValue}>{b}</div></div>)}</div><section className={styles.tableCard}><Title3>Commission structure</Title3><table className={styles.table}><thead><tr>{['Level','Who','$10 Plan','$50 Plan','$100 Plan','$500 Plan'].map(h => <th className={styles.th} key={h}>{h}</th>)}</tr></thead><tbody>{[['🥇 Level 1','Direct referral','0.1%','0.5%','1.0%','5.0%'],['🥈 Level 2','Their referrals','0.01%','0.05%','0.1%','0.5%'],['🥉 Level 3','3rd generation','0.001%','0.005%','0.01%','0.05%']].map(row => <tr key={row[0]}>{row.map(x => <td className={styles.td} key={x}>{x}</td>)}</tr>)}</tbody></table></section></> }

function Profile({ styles, userName, userEmail }: { styles: ReturnType<typeof useStyles>; userName: string; userEmail: string }) { return <><div className={styles.user}><Avatar name={userName} color="brand" size={64} /><div><Title1>{userName}</Title1><Body1 className={styles.muted}>{userEmail}</Body1></div></div><div className={styles.planGrid}><Card className={styles.tableCard}><CardHeader header={<Subtitle2>Account Info</Subtitle2>} image={<Person24Regular />} /><Body2>Name, email, and verification status</Body2><Badge appearance="tint" color="success">✓ Identity verified</Badge></Card><Card className={styles.tableCard}><CardHeader header={<Subtitle2>Linked Wallet</Subtitle2>} image={<WalletCreditCard24Regular />} /><Body2>0x71A4...9f2E · BEP20</Body2><Button appearance="outline">Update wallet</Button></Card><Card className={styles.tableCard}><CardHeader header={<Subtitle2><span style={{ color: '#2495e8' }}>Telegram</span></Subtitle2>} image={<PeopleTeam24Regular />} /><Subtitle2>24/7 Live Support</Subtitle2><Body2>Get instant help from our support team on Telegram</Body2><Button as="a" href="https://t.me/SageCapitalSupport" target="_blank" rel="noreferrer" appearance="primary">Chat on Telegram</Button><Caption1 className={styles.muted}>Average response time: under 5 minutes</Caption1></Card></div></> }

export default StarterPage
