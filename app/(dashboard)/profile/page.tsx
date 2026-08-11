'use client'

import { Profile, useStyles } from '@/components/dashboard-ui'
import { useDashboard } from '@/components/dashboard-context'

export default function ProfilePage() {
  const styles = useStyles()
  const { user } = useDashboard()
  const userName = user?.name || ''
  const userEmail = user?.email || ''

  return <Profile styles={styles} userName={userName} userEmail={userEmail} />
}
