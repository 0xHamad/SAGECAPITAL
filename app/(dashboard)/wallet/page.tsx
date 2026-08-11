'use client'

import * as React from 'react'
import { Wallet, useStyles } from '@/components/dashboard-ui'

export default function WalletPage() {
  const styles = useStyles()
  const [copied, setCopied] = React.useState(false)
  const copyLink = () => { setCopied(true); window.setTimeout(() => setCopied(false), 1600) }

  return <Wallet styles={styles} copied={copied} copyLink={copyLink} />
}
