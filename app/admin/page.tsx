'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'

const ADMIN_PASSWORD = 'sage7860'

export default function AdminPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = React.useState(false)
  const [inputPwd, setInputPwd] = React.useState('')
  const [pwdError, setPwdError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [stats, setStats] = React.useState<any>(null)
  const [tab, setTab] = React.useState('overview')
  const [search, setSearch] = React.useState('')
  const [creditEmail, setCreditEmail] = React.useState('')
  const [creditAmount, setCreditAmount] = React.useState('')
  const [creditMsg, setCreditMsg] = React.useState('')
  const [pwdEmail, setPwdEmail] = React.useState('')
  const [newPwd, setNewPwd] = React.useState('')
  const [pwdMsg, setPwdMsg] = React.useState('')
  const [returnsEmail, setReturnsEmail] = React.useState('')
  const [returnsWeeks, setReturnsWeeks] = React.useState('')
  const [returnsMsg, setReturnsMsg] = React.useState('')

  const handleLogin = async () => {
    setPwdError('')
    if (inputPwd !== ADMIN_PASSWORD) {
      setPwdError('❌ Incorrect password')
      return
    }
    setLoading(true)
    const res = await fetch('/api/admin/stats')
    if (res.ok) {
      setStats(await res.json())
      setAuthorized(true)
    } else {
      setPwdError('❌ Failed to load admin data')
    }
    setLoading(false)
  }

  // Password Gate Screen
  if (!authorized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '48px 40px', maxWidth: 400, width: '90%', textAlign: 'center', backdropFilter: 'blur(20px)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚙️</div>
          <div style={{ color: '#fff', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Admin Panel</div>
          <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 32 }}>SageCapital Administration</div>
          <input
            type="password"
            placeholder="Enter admin password"
            value={inputPwd}
            onChange={e => setInputPwd(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 15, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
          />
          {pwdError && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{pwdError}</div>}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
          >
            {loading ? 'Loading...' : 'Access Admin Panel →'}
          </button>
        </div>
      </div>
    )
  }

  const handleCredit = async () => {
    setCreditMsg('')
    const res = await fetch('/api/admin/credit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: creditEmail, amount: Number(creditAmount) })
    })
    const d = await res.json()
    setCreditMsg(res.ok ? '✅ Balance credited!' : `❌ ${d.error}`)
    if (res.ok) { setCreditEmail(''); setCreditAmount(''); const r = await fetch('/api/admin/stats'); if (r.ok) setStats(await r.json()) }
  }

  const handleReturns = async () => {
    setReturnsMsg('Processing returns... Please wait.')
    try {
      const res = await fetch('/api/admin/add-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: returnsEmail, weeks: Number(returnsWeeks), password })
      })
      const data = await res.json()
      if (res.ok) {
        setReturnsMsg(`✅ ${data.message}`)
        setReturnsEmail('')
        setReturnsWeeks('')
        fetchStats()
      } else {
        setReturnsMsg(`❌ Error: ${data.error}`)
      }
    } catch (e: any) {
      setReturnsMsg(`❌ Error: ${e.message}`)
    }
  }

  const handlePwd = async () => {
    setPwdMsg('')
    const res = await fetch('/api/admin/change-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: pwdEmail, newPassword: newPwd })
    })
    const d = await res.json()
    setPwdMsg(res.ok ? '✅ Password changed!' : `❌ ${d.error}`)
    if (res.ok) { setPwdEmail(''); setNewPwd('') }
  }

  const handleWithdrawal = async (id: string, action: 'approve' | 'reject') => {
    await fetch('/api/admin/withdrawals', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ withdrawalId: id, action })
    })
    const r = await fetch('/api/admin/stats'); if (r.ok) setStats(await r.json())
  }

  if (loading) return <div style={s.loading}>Loading admin panel...</div>
  if (!authorized) return null

  const filteredUsers = (stats?.users || []).filter((u: any) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.referral_code?.toLowerCase().includes(search.toLowerCase())
  )

  const pendingWithdrawals = (stats?.withdrawals || []).filter((w: any) => w.status === 'pending')

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.headerTitle}>⚙️ SageCapital Admin Panel</div>
          <div style={s.headerSub}>Full control over the platform</div>
        </div>
        <button style={s.backBtn} onClick={() => router.push('/dashboard')}>← Back to Dashboard</button>
      </div>

      {/* Stats Cards */}
      <div style={s.statsGrid}>
        {[
          { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: '#6d28d9' },
          { label: 'Total Deposited', value: `$${(stats?.totalDeposited || 0).toFixed(2)}`, icon: '💰', color: '#059669' },
          { label: 'Active Plans', value: stats?.totalPlans || 0, icon: '📊', color: '#2563eb' },
          { label: 'Total Earnings Paid', value: `$${(stats?.totalEarnings || 0).toFixed(2)}`, icon: '💸', color: '#d97706' },
        ].map(card => (
          <div key={card.label} style={{ ...s.statCard, borderTop: `4px solid ${card.color}` }}>
            <div style={{ fontSize: 28 }}>{card.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        <button style={{ ...s.tabBtn, ...(tab === 'overview' ? s.tabActive : {}) }} onClick={() => setTab('overview')}>📊 Overview</button>
        <button style={{ ...s.tabBtn, ...(tab === 'users' ? s.tabActive : {}) }} onClick={() => setTab('users')}>👥 Users</button>
        <button style={{ ...s.tabBtn, ...(tab === 'credit' ? s.tabActive : {}) }} onClick={() => setTab('credit')}>💳 Manual Credit</button>
        <button style={{ ...s.tabBtn, ...(tab === 'returns' ? s.tabActive : {}) }} onClick={() => setTab('returns')}>📈 Add Returns</button>
        <button style={{ ...s.tabBtn, ...(tab === 'password' ? s.tabActive : {}) }} onClick={() => setTab('password')}>🔑 Change Password</button>
        <button style={{ ...s.tabBtn, ...(tab === 'withdrawals' ? s.tabActive : {}) }} onClick={() => setTab('withdrawals')}>💸 Withdrawals {pendingWithdrawals.length > 0 && `(${pendingWithdrawals.length})`}</button>
      </div>

      {/* Tab: Users Table */}
      {tab === 'users' && (
        <div style={s.card}>
          <div style={s.cardTitle}>All Users ({stats?.users?.length || 0})</div>
          <input
            style={s.input}
            placeholder="Search by name, email, or referral code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>{['Name', 'Email', 'Balance', 'Deposited', 'Ref Code', 'Refs (L1/L2/L3)', 'Ref Earnings', 'Joined'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filteredUsers.map((u: any) => (
                  <tr key={u.id}>
                    <td style={s.td}>{u.full_name || '—'}</td>
                    <td style={s.td}>{u.email}</td>
                    <td style={{ ...s.td, color: '#059669', fontWeight: 700 }}>${(u.total_balance || 0).toFixed(2)}</td>
                    <td style={s.td}>${(u.total_deposited || 0).toFixed(2)}</td>
                    <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 12 }}>{u.referral_code}</td>
                    <td style={{ ...s.td, fontWeight: 600, color: '#6d28d9', fontSize: 13 }}>
                      {u.refCountL1 || 0} <span style={{color: '#9ca3af', fontWeight: 400}}>/</span> {u.refCountL2 || 0} <span style={{color: '#9ca3af', fontWeight: 400}}>/</span> {u.refCountL3 || 0}
                    </td>
                    <td style={{ ...s.td, color: '#059669' }}>${(u.referral_income || 0).toFixed(2)}</td>
                    <td style={s.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && <tr><td colSpan={8} style={{ ...s.td, textAlign: 'center', color: '#9ca3af' }}>No users found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Manual Credit */}
      {tab === 'credit' && (
        <div style={s.card}>
          <div style={s.cardTitle}>💳 Manual Balance Credit</div>
          <p style={{ color: '#6b7280', marginBottom: 16 }}>Add balance directly to a user's account using their email address.</p>
          <div style={s.formRow}>
            <input style={s.input} placeholder="User Email (e.g. test@gmail.com)" value={creditEmail} onChange={e => setCreditEmail(e.target.value)} />
            <input style={s.input} placeholder="Amount in USD (e.g. 100)" type="number" value={creditAmount} onChange={e => setCreditAmount(e.target.value)} />
            <button style={s.btn} onClick={handleCredit}>Credit Balance</button>
          </div>
          {creditMsg && <div style={{ marginTop: 12, padding: '10px 16px', background: creditMsg.includes('✅') ? '#d1fae5' : '#fee2e2', borderRadius: 8 }}>{creditMsg}</div>}
          <hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />
          <div style={s.cardTitle} id="user-ids">User Reference</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead><tr><th style={s.th}>Name</th><th style={s.th}>Email</th><th style={s.th}>Balance</th></tr></thead>
              <tbody>
                {(stats?.users || []).map((u: any) => (
                  <tr key={u.id}>
                    <td style={s.td}>{u.full_name || '—'}</td>
                    <td style={s.td}>{u.email}</td>
                    <td style={s.td}>${(u.total_balance || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Add Returns */}
      {tab === 'returns' && (
        <div style={s.card}>
          <div style={s.cardTitle}>📈 Add Weekly Returns</div>
          <p style={{ color: '#6b7280', marginBottom: 16 }}>Instantly add multiple weeks of returns to a user's active plans. This automatically generates a random profit (5-15%) per week and distributes referral commissions.</p>
          <div style={s.formRow}>
            <input style={s.input} placeholder="User Email (e.g. test@gmail.com)" value={returnsEmail} onChange={e => setReturnsEmail(e.target.value)} />
            <input style={s.input} placeholder="Number of Weeks (e.g. 4)" type="number" value={returnsWeeks} onChange={e => setReturnsWeeks(e.target.value)} />
            <button style={{...s.btn, background: '#059669', borderColor: '#059669'}} onClick={handleReturns}>Process Returns</button>
          </div>
          {returnsMsg && <div style={{ marginTop: 12, padding: '10px 16px', background: returnsMsg.includes('✅') ? '#d1fae5' : '#fee2e2', borderRadius: 8 }}>{returnsMsg}</div>}
        </div>
      )}

      {/* Tab: Change Password */}
      {tab === 'password' && (
        <div style={s.card}>
          <div style={s.cardTitle}>🔑 Change User Password</div>
          <p style={{ color: '#6b7280', marginBottom: 16 }}>Force-change any user's password using their email address.</p>
          <div style={s.formRow}>
            <input style={s.input} placeholder="User Email (e.g. test@gmail.com)" value={pwdEmail} onChange={e => setPwdEmail(e.target.value)} />
            <input style={s.input} placeholder="New Password (min 6 chars)" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
            <button style={s.btn} onClick={handlePwd}>Change Password</button>
          </div>
          {pwdMsg && <div style={{ marginTop: 12, padding: '10px 16px', background: pwdMsg.includes('✅') ? '#d1fae5' : '#fee2e2', borderRadius: 8 }}>{pwdMsg}</div>}
        </div>
      )}

      {/* Tab: Withdrawals */}
      {tab === 'withdrawals' && (
        <div style={s.card}>
          <div style={s.cardTitle}>💸 Withdrawal Requests ({pendingWithdrawals.length} pending)</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>{['User ID', 'Amount', 'Wallet', 'Requested', 'Status', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {(stats?.withdrawals || []).map((w: any) => (
                  <tr key={w.id}>
                    <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 11 }}>{w.user_id?.slice(0, 12)}...</td>
                    <td style={{ ...s.td, fontWeight: 700, color: '#d97706' }}>${w.amount}</td>
                    <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 11 }}>{w.wallet_address?.slice(0, 16)}...</td>
                    <td style={s.td}>{new Date(w.requested_at).toLocaleDateString()}</td>
                    <td style={s.td}>
                      <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: w.status === 'pending' ? '#fef3c7' : w.status === 'processed' ? '#d1fae5' : '#fee2e2', color: w.status === 'pending' ? '#92400e' : w.status === 'processed' ? '#065f46' : '#991b1b' }}>
                        {w.status}
                      </span>
                    </td>
                    <td style={s.td}>
                      {w.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button style={{ ...s.btn, background: '#059669', padding: '4px 14px', fontSize: 12 }} onClick={() => handleWithdrawal(w.id, 'approve')}>✅ Approve</button>
                          <button style={{ ...s.btn, background: '#dc2626', padding: '4px 14px', fontSize: 12 }} onClick={() => handleWithdrawal(w.id, 'reject')}>❌ Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {(stats?.withdrawals || []).length === 0 && <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#9ca3af' }}>No withdrawals yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Overview - Recent Activity */}
      {tab === 'overview' && (
        <div style={s.card}>
          <div style={s.cardTitle}>📊 Platform Overview</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ padding: 20, background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb' }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>💰 Deposit Breakdown</div>
              <div>Total Finished Deposits: ${(stats?.totalDeposited || 0).toFixed(2)}</div>
            </div>
            <div style={{ padding: 20, background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb' }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>👥 User Summary</div>
              <div>Total Registered Users: {stats?.totalUsers || 0}</div>
              <div>Active Investment Plans: {stats?.totalPlans || 0}</div>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: 20, background: '#fffbeb', borderRadius: 12, border: '1px solid #fde68a' }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>⚠️ Pending Actions</div>
            <div>Pending Withdrawals: {pendingWithdrawals.length}</div>
          </div>
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f3f4f6', padding: '24px', fontFamily: 'system-ui, sans-serif' },
  loading: { minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'system-ui', color: '#6b7280', fontSize: 16 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, background: '#1f2937', borderRadius: 16, padding: '20px 28px', color: '#fff' },
  headerTitle: { fontSize: 22, fontWeight: 800 },
  headerSub: { color: '#9ca3af', fontSize: 13 },
  backBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
  tabs: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  tabBtn: { padding: '8px 18px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151' },
  tabActive: { background: '#6d28d9', color: '#fff', borderColor: '#6d28d9' },
  card: { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#1f2937' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 700 },
  th: { textAlign: 'left', padding: '12px 10px', color: '#9ca3af', fontSize: 12, fontWeight: 700, borderBottom: '2px solid #f3f4f6' },
  td: { padding: '12px 10px', borderBottom: '1px solid #f9fafb', fontSize: 13, color: '#374151' },
  input: { padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, flex: 1, outline: 'none', width: '100%', marginBottom: 8 },
  formRow: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' },
  btn: { background: '#6d28d9', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' },
}
