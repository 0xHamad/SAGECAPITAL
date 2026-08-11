'use client'

import { Dashboard, useStyles } from '@/components/dashboard-ui'

export default function DashboardIndexPage() {
  const styles = useStyles()
  return <Dashboard styles={styles} />
}
