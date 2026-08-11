'use client'

import * as React from 'react'
import { Referrals, useStyles } from '@/components/dashboard-ui'

export default function ReferralsPage() {
  const styles = useStyles()
  const [copied, setCopied] = React.useState(false)
  const copyLink = () => { setCopied(true); window.setTimeout(() => setCopied(false), 1600) }

  return <Referrals styles={styles} copied={copied} copyLink={copyLink} />
}
