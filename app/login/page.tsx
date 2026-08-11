'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button, Input, Label, makeStyles, Subtitle1, Body2 } from '@fluentui/react-components'
import { ShieldCheckmark24Regular, Mail24Regular, LockClosed24Regular, Eye24Regular, ArrowRight24Regular } from '@fluentui/react-icons'

const useStyles = makeStyles({
  page: { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', background: 'linear-gradient(135deg,#241044 0%,#0b1731 100%)', color: '#fff' },
  card: { width: '100%', maxWidth: '420px', padding: '34px', borderRadius: '24px', backgroundColor: 'rgba(255,255,255,.09)', border: '1px solid rgba(255,255,255,.16)', boxShadow: '0 24px 70px rgba(0,0,0,.3)', backdropFilter: 'blur(18px)', display: 'flex', flexDirection: 'column', gap: '18px' },
  logo: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px', fontSize: '22px', fontWeight: 800, background: 'linear-gradient(90deg,#c084fc,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  trust: { textAlign: 'center', color: '#cbd5e1', fontSize: '12px', marginBottom: '4px' },
  title: { textAlign: 'center', fontSize: '30px', fontWeight: 800 },
  sub: { textAlign: 'center', color: '#b6c2d5' },
  field: { display: 'flex', flexDirection: 'column', gap: '7px' },
  input: { width: '100%', backgroundColor: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff' },
  forgot: { textAlign: 'right', color: '#c4b5fd', fontSize: '12px' },
  divider: { height: '1px', backgroundColor: 'rgba(255,255,255,.16)' },
  footer: { textAlign: 'center', color: '#b6c2d5', fontSize: '13px' },
  link: { color: '#c4b5fd', fontWeight: 700 },
  note: { textAlign: 'center', color: '#94a3b8', fontSize: '11px' },
})

export default function LoginPage() {
  const styles = useStyles()
  const [show, setShow] = React.useState(false)
  return <main className={styles.page}><section className={styles.card}><div className={styles.trust}>14,200+ Investors · $6.1M Paid Out · 5–15% Weekly</div><div className={styles.logo}><ShieldCheckmark24Regular />SageCapital</div><div><h1 className={styles.title}>Welcome Back</h1><p className={styles.sub}>Sign in to your SageCapital account</p></div><div className={styles.field}><Label htmlFor="email" style={{ color: '#e2e8f0' }}>Email</Label><Input id="email" className={styles.input} contentBefore={<Mail24Regular />} placeholder="you@example.com" /></div><div className={styles.field}><Label htmlFor="password" style={{ color: '#e2e8f0' }}>Password</Label><Input id="password" className={styles.input} type={show ? 'text' : 'password'} contentBefore={<LockClosed24Regular />} contentAfter={<button type="button" aria-label="Toggle password visibility" onClick={() => setShow(!show)} style={{ color: '#cbd5e1', background: 'transparent', border: 0 }}><Eye24Regular /></button>} placeholder="Enter your password" /></div><Link href="#" className={styles.forgot}>Forgot Password?</Link><Button appearance="primary" size="large" icon={<ArrowRight24Regular />}>Sign In</Button><div className={styles.divider} /><div className={styles.footer}>Don&apos;t have an account? <Link href="/signup" className={styles.link}>Create Account</Link></div><div className={styles.note}>256-bit SSL Secured · Your funds are protected</div></section></main>
}

void Subtitle1
void Body2
void Input
void Button
