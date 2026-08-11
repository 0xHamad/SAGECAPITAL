'use client'

import { Plans, useStyles } from '@/components/dashboard-ui'

export default function MyPlanPage() {
  const styles = useStyles()
  return <Plans styles={styles} />
}
