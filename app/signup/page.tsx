'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button, Input, Label, makeStyles } from '@fluentui/react-components'
import { ShieldCheckmark24Regular, Mail24Regular, LockClosed24Regular, Eye24Regular, Person24Regular, ArrowRight24Regular } from '@fluentui/react-icons'

const useStyles = makeStyles({
  page: { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', background: 'linear-gradient(135deg,#241044 0%,#0b1731 100%)', color: '#fff' },
  card: { width: '100%', maxWidth: '460px', padding: '34px', borderRadius: '24px', backgroundColor: 'rgba(255,255,255,.09)', border: '1px solid rgba(255,255,255,.16)', boxShadow: '0 24px 70px rgba(0,0,0,.3)', backdropFilter: 'blur(18px)', display: 'flex', flexDirection: 'column', gap: '16px' },
  logo: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px', fontSize: '22px', fontWeight: 800, background: 'linear-gradient(90deg,#c084fc,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  title: { textAlign: 'center', fontSize: '29px', fontWeight: 800, marginTop: '4px' },
  sub: { textAlign: 'center', color: '#b6c2d5', marginTop: '5px' },
  field: { display: 'flex', flexDirection: 'column', gap: '7px' },
  input: { width: '100%', backgroundColor: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff' },
  check: { display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '12px' },
  footer: { textAlign: 'center', color: '#b6c2d5', fontSize: '13px' },
  link: { color: '#c4b5fd', fontWeight: 700 },
  note: { textAlign: 'center', color: '#94a3b8', fontSize: '11px' },
})

export default function SignupPage() {
  const styles = useStyles()
  const [show, setShow] = React.useState(false)
  return <main className={styles.page}><section className={styles.card}><div className={styles.logo}><ShieldCheckmark24Regular />SageCapital</div><div><h1 className={styles.title}>Create Your Account</h1><p className={styles.sub}>Join 14,000+ investors earning weekly crypto returns</p></div><div className={styles.field}><Label htmlFor="name" style={{ color: '#e2e8f0' }}>Full Name</Label><Input id="name" className={styles.input} contentBefore={<Person24Regular />} placeholder="Jordan Lee" /></div><div className={styles.field}><Label htmlFor="email" style={{ color: '#e2e8f0' }}>Email Address</Label><Input id="email" className={styles.input} contentBefore={<Mail24Regular />} placeholder="you@example.com" /></div>{['password','confirm'].map((id, i) => <div className={styles.field} key={id}><Label htmlFor={id} style={{ color: '#e2e8f0' }}>{i ? 'Confirm Password' : 'Password'}</Label><Input id={id} className={styles.input} type={show ? 'text' : 'password'} contentBefore={<LockClosed24Regular />} contentAfter={<button type="button" aria-label="Toggle password visibility" onClick={() => setShow(!show)} style={{ color: '#cbd5e1', background: 'transparent', border: 0 }}><Eye24Regular /></button>} placeholder={i ? 'Confirm your password' : 'Create a password'} /></div>)}<div className={styles.field}><Label htmlFor="referral" style={{ color: '#e2e8f0' }}>Referral Code (optional)</Label><Input id="referral" className={styles.input} placeholder="Enter referral code" /></div><label className={styles.check}><input type="checkbox" />I agree to the Terms of Service</label><Button appearance="primary" size="large" icon={<ArrowRight24Regular />}>Create Account</Button><div className={styles.footer}>Already have an account? <Link href="/login" className={styles.link}>Sign In</Link></div><div className={styles.note}>SSL Secured · Funds are Safe</div></section></main>
}
