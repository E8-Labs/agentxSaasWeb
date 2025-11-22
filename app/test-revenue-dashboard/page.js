'use client'

import React from 'react'

import AgencyRevenueDashboard from '@/components/agency/dashboard/revenue/AgencyRevenueDashboard'

/**
 * Test page for Agency Revenue Dashboard
 * This page displays all the revenue dashboard components in the layout shown in the screenshot
 */
function Page() {
  // Sample data for testing
  const topMetrics = {
    totalRevenue: '$121,000',
    mrr: '$31,040',
    netRevenue: '$93,164',
    agencyNetEarnings: '$90,920',
    stripeBalance: '$9,302.12',
  }

  const revenueChartData = [
    { month: 'Jan', value: 100 },
    { month: 'Feb', value: 200 },
    { month: 'Mar', value: 300 },
    { month: 'Apr', value: 121200 },
    { month: 'May', value: 500 },
    { month: 'Jun', value: 600 },
    { month: 'Jul', value: 700 },
    { month: 'Aug', value: 800 },
    { month: 'Sep', value: 900 },
    { month: 'Oct', value: 1000 },
    { month: 'Nov', value: 1100 },
    { month: 'Dec', value: 1200 },
  ]

  const leaderboardData = [
    {
      rank: 1,
      accountName: 'Chris Perez',
      accountIcon: '5',
      revenue: '$3,018.88',
      mrr: '$3,670.73',
      netRevenue: '$3,018.88',
    },
    {
      rank: 2,
      accountName: 'Jael Wilson',
      accountIcon: '2',
      revenue: '$6,986.19',
      mrr: '$6,202.91',
      netRevenue: '$6,986.19',
    },
    {
      rank: 3,
      accountName: 'Storm Johns...',
      accountIcon: '3',
      revenue: '$4,005.65',
      mrr: '$1,502.62',
      netRevenue: '$4,005.65',
    },
    {
      rank: 4,
      accountName: 'Cypress Rob...',
      accountIcon: '4',
      revenue: '$9,137.14',
      mrr: '$4,368.30',
      netRevenue: '$9,137.14',
    },
    {
      rank: 5,
      accountName: 'Hollis Kim',
      accountIcon: '1',
      revenue: '$3,556.78',
      mrr: '$3,549.89',
      netRevenue: '$3,556.78',
    },
  ]

  const transactionData = [
    {
      id: 1,
      subAccount: 'Chris Perez',
      accountIcon: '5',
      product: 'Product N...',
      type: 'XBar',
      totalPaid: '$3,018.88',
      stripeFee: '$3,018.88',
      platformFee: '$18.88',
      payout: '$6,367.65',
      date: '11/11/2024',
      status: 'success',
    },
    {
      id: 2,
      subAccount: 'Jael Wilson',
      accountIcon: '2',
      product: 'Product N...',
      type: 'Trial Mins',
      totalPaid: '$6,986.19',
      stripeFee: '$6,986.19',
      platformFee: '$686.19',
      payout: '$8,149.61',
      date: '27/1/2024',
      status: 'failed',
    },
    {
      id: 3,
      subAccount: 'Storm Johnson',
      accountIcon: '3',
      product: 'Product N...',
      type: 'Seats',
      totalPaid: '$4,005.65',
      stripeFee: '$4,005.65',
      platformFee: '$505.65',
      payout: '$8,006.89',
      date: '28/9/2025',
      status: 'pending',
    },
    {
      id: 4,
      subAccount: 'Cypress Roberts',
      accountIcon: '4',
      product: 'Product N...',
      type: 'Phone',
      totalPaid: '$9,137.14',
      stripeFee: '$9,137.14',
      platformFee: '$37.14',
      payout: '$6,475.73',
      date: '4/8/2025',
      status: 'success',
    },
    {
      id: 5,
      subAccount: 'Hollis Kim',
      accountIcon: '1',
      product: 'Product N...',
      type: 'Enrichment',
      totalPaid: '$3,556.78',
      stripeFee: '$3,556.78',
      platformFee: '$356.78',
      payout: '$9,119.84',
      date: '15/1/2025',
      status: 'success',
    },
  ]

  const payoutMetrics = {
    nextPayoutDate: 'March 12',
    nextPayoutTime: '12:04PM',
    lifetimePayouts: '$9,302.12',
    avgTransactionValue: '$9,302.12',
    refundsCount: '12',
    refundsAmount: '$40,902',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyRevenueDashboard
        topMetrics={topMetrics}
        revenueChart={{
          data: revenueChartData,
          currentValue: '11,728',
          selectedPeriod: 'This Year',
        }}
        leaderboardData={leaderboardData}
        transactionData={transactionData}
        payoutMetrics={payoutMetrics}
      />
    </div>
  )
}

export default Page
