'use client'

import { useStyles } from '@/components/dashboard-ui'
import { Title2, Card, CardHeader, Subtitle2, Body2, Badge, Button, Caption1 } from '@fluentui/react-components'
import { PeopleTeam24Regular } from '@fluentui/react-icons'

export default function SupportPage() {
  const styles = useStyles()
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Title2>Support</Title2>
      <div className={styles.planGrid}>
        <Card className={styles.tableCard}>
          <CardHeader header={<Subtitle2><span style={{ color: '#2495e8' }}>Support Bot</span></Subtitle2>} image={<PeopleTeam24Regular />} />
          <Subtitle2>24/7 Live Support</Subtitle2>
          <Body2>Get instant help from our support team on Telegram</Body2>
          <Button as="a" href="https://t.me/SAGE_CAPITAL_BOT" target="_blank" rel="noreferrer" appearance="primary">Chat with Bot</Button>
          <Caption1 className={styles.muted}>Average response time: under 5 minutes</Caption1>
        </Card>
        <Card className={styles.tableCard}>
          <CardHeader header={<Subtitle2><span style={{ color: '#2495e8' }}>Community Group</span></Subtitle2>} image={<PeopleTeam24Regular />} />
          <Subtitle2>Join our Community</Subtitle2>
          <Body2>Connect with other investors and stay updated</Body2>
          <Button as="a" href="https://t.me/+iaDnftGtqgsxZjY8" target="_blank" rel="noreferrer" appearance="outline">Join Telegram Group</Button>
          <Caption1 className={styles.muted}>Official SageCapital Group</Caption1>
        </Card>
      </div>
    </div>
  )
}
