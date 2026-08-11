'use client'

import * as React from 'react'

export interface DashboardData {
  totalBalance: number
  withdrawable: number
  totalDeposited: number
  totalEarned: number
  referralIncome: number
  activePlans: Array<{ name: string; amount: number; returnRange: string; lastWeekPct: number; lastWeekEarned: number }>
  recentActivity: Array<{ description: string; sub: string; amount: string; date: string; status: string }>
  referralCount: number
  referralCode: string
  activeDeposit: any
}

interface DashboardContextType {
  userData: DashboardData
  user: { email: string; name: string } | null
}

export const DashboardContext = React.createContext<DashboardContextType | null>(null)

export function DashboardProvider({ children, value }: { children: React.ReactNode, value: DashboardContextType }) {
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboard() {
  const context = React.useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
