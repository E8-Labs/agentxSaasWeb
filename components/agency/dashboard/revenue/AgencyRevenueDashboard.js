'use client'

import { CircularProgress } from '@mui/material'
import axios from 'axios'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'

import Apis from '@/components/apis/Apis'

import { formatFractional2 } from '../../plan/AgencyUtilities'
import AgencyDashboard from '../AgencyDashboard'
import AgencyDashboardDefaultUI from '../AgencyDashboardDefaultUI'
import LeaderBoardTable from './LeaderBoardTable'
import PayoutMetricsSection from './PayoutMetricsSection'
import RevenueGrowthChart from './RevenueGrowthChart'
import SubscriptionGraphsSection from './SubscriptionGraphsSection'
import TopMetricsSection from './TopMetricsSection'
import TransactionTable from './TransactionTable'

/**
 * AgencyRevenueDashboard - Main dashboard component arranging all revenue-related components
 * @param {Object} props
 * @param {Object} props.topMetrics - Metrics for top metrics section
 * @param {Object} props.revenueChart - Data for revenue growth chart
 * @param {Array} props.leaderboardData - Data for leaderboard table
 * @param {Array} props.transactionData - Data for transaction table
 * @param {Object} props.payoutMetrics - Metrics for payout section
 */
function AgencyRevenueDashboard({ selectedAgency }) {
  // Cache keys for revenue dashboard data
  const getCacheKey = (key) => {
    const agencyId = selectedAgency?.id || 'all'
    return `revenue_dashboard_${key}_${agencyId}`
  }

  // Load data from cache
  const loadFromCache = (key) => {
    try {
      const cached = localStorage.getItem(getCacheKey(key))
      if (cached) {
        const parsed = JSON.parse(cached)
        // Check if cache is less than 5 minutes old
        const cacheAge = Date.now() - (parsed.timestamp || 0)
        if (cacheAge < 5 * 60 * 1000) {
          return parsed.data
        }
      }
    } catch (e) {
      console.error('Error loading from cache:', e)
    }
    return null
  }

  // Save data to cache
  const saveToCache = (key, data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      }
      localStorage.setItem(getCacheKey(key), JSON.stringify(cacheData))
    } catch (e) {
      console.error('Error saving to cache:', e)
    }
  }

  // Load cached data - recalculate when selectedAgency changes
  const initialCache = useMemo(() => {
    const cachedSummary = loadFromCache('summary')
    const cachedLeaderboard = loadFromCache('leaderboard')
    const cachedPayouts = loadFromCache('payouts')
    const cachedSubscription = loadFromCache('subscription')
    
    // Load cached transactions for default filters
    const defaultTxFilters = {
      type: 'all',
      status: 'all',
      dateFilter: 'all',
      startDate: '',
      endDate: '',
    }
    const cacheKey = `transactions_${JSON.stringify(defaultTxFilters)}`
    const cachedTransactions = loadFromCache(cacheKey)
    
    const hasCachedData = !!(cachedSummary || cachedLeaderboard || cachedPayouts || cachedSubscription)
    const hasCachedTransactions = !!cachedTransactions
    
    return {
      summary: cachedSummary,
      leaderboard: cachedLeaderboard,
      payouts: cachedPayouts,
      subscription: cachedSubscription,
      transactions: cachedTransactions?.transactions || [],
      hasMoreTransactions: cachedTransactions?.hasMore ?? true,
      hasCachedData,
      hasCachedTransactions,
    }
  }, [selectedAgency?.id])

  const [initialDataLoading, setInitialDataLoading] = useState(!initialCache.hasCachedData)
  const [transactionsLoading, setTransactionsLoading] = useState(!initialCache.hasCachedTransactions)
  const [loading, setLoading] = useState(!initialCache.hasCachedData || !initialCache.hasCachedTransactions)
  const [error, setError] = useState(null)

  // Initialize state with cached data if available
  const [summary, setSummary] = useState(initialCache.summary)
  const [growth, setGrowth] = useState(null)
  const [leaderboard, setLeaderboard] = useState(initialCache.leaderboard || [])
  const [payouts, setPayouts] = useState(initialCache.payouts)
  const [transactions, setTransactions] = useState(initialCache.transactions)
  const [hasMoreTransactions, setHasMoreTransactions] = useState(initialCache.hasMoreTransactions)
  const [txLoadingMore, setTxLoadingMore] = useState(false)
  const [subscriptionData, setSubscriptionData] = useState(initialCache.subscription)

  // Update state when cache changes (e.g., when selectedAgency changes)
  useEffect(() => {
    if (initialCache.summary) setSummary(initialCache.summary)
    if (initialCache.leaderboard) setLeaderboard(initialCache.leaderboard)
    if (initialCache.payouts) setPayouts(initialCache.payouts)
    if (initialCache.subscription) setSubscriptionData(initialCache.subscription)
    if (initialCache.transactions.length > 0) {
      setTransactions(initialCache.transactions)
      setHasMoreTransactions(initialCache.hasMoreTransactions)
    }
    setInitialDataLoading(!initialCache.hasCachedData)
    setTransactionsLoading(!initialCache.hasCachedTransactions)
  }, [initialCache])

  const [txPage, setTxPage] = useState(1)
  const [txLimit] = useState(50)
  const [txFilters, setTxFilters] = useState({
    type: 'all',
    status: 'all',
    dateFilter: 'all',
    startDate: '',
    endDate: '',
  })

  // Revenue growth filter state
  const [revenueGrowthFilter, setRevenueGrowthFilter] = useState('Last 30 Days')
  const [revenueGrowthStartDate, setRevenueGrowthStartDate] = useState(null)
  const [revenueGrowthEndDate, setRevenueGrowthEndDate] = useState(null)

  const endDate = useMemo(() => moment().toISOString(), [])
  const startDate = '2025-01-01'

  // Helper function to map filter text to API parameters
  const getRevenueGrowthParams = (filterText, startDateParam, endDateParam) => {
    const params = new URLSearchParams()

    if (filterText === 'Custom Range' && startDateParam && endDateParam) {
      params.set('dateFilter', 'customRange')
      params.set('startDate', startDateParam)
      params.set('endDate', endDateParam)
    } else if (filterText === 'All Time' && startDateParam && endDateParam) {
      params.set('dateFilter', 'customRange')
      params.set('startDate', startDateParam)
      params.set('endDate', endDateParam)
    } else {
      switch (filterText) {
        case 'Last 7 Days':
          params.set('dateFilter', 'last7Days')
          break
        case 'Last 30 Days':
          params.set('dateFilter', 'last30Days')
          break
        case 'This Year':
          params.set('range', 'thisYear')
          break
        default:
          params.set('dateFilter', 'last30Days')
      }
    }

    return params.toString()
  }

  // Fetch revenue growth data based on filter
  const fetchRevenueGrowth = async (filter, startDateParam, endDateParam, useCache = true) => {
    try {
      // Try to load from cache first
      if (useCache) {
        const cacheKey = `growth_${filter}_${startDateParam || ''}_${endDateParam || ''}`
        const cachedGrowth = loadFromCache(cacheKey)
        if (cachedGrowth) {
          setGrowth(cachedGrowth)
        }
      }

      const userStr = localStorage.getItem('User')
      const token = userStr ? JSON.parse(userStr)?.token : null
      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        : {}

      const params = getRevenueGrowthParams(
        filter,
        startDateParam,
        endDateParam,
      )
      const growthRes = await axios.get(`${Apis.revenueGrowth}?${params}`, {
        headers,
      })

      const growthData = growthRes?.data?.data || null
      setGrowth(growthData)
      
      // Save to cache
      const cacheKey = `growth_${filter}_${startDateParam || ''}_${endDateParam || ''}`
      saveToCache(cacheKey, growthData)
    } catch (e) {
      console.error('Failed to fetch revenue growth data', e)
    }
  }

  // Handle revenue growth filter change
  const handleRevenueGrowthFilterChange = (
    newFilter,
    startDateParam,
    endDateParam,
  ) => {
    setRevenueGrowthFilter(newFilter)
    setRevenueGrowthStartDate(startDateParam)
    setRevenueGrowthEndDate(endDateParam)
    fetchRevenueGrowth(newFilter, startDateParam, endDateParam)
  }

  // Load cached growth data on mount
  useEffect(() => {
    const cachedGrowth = loadFromCache(`growth_${revenueGrowthFilter}_`)
    if (cachedGrowth) {
      setGrowth(cachedGrowth)
    }
  }, [revenueGrowthFilter])

  // Fetch initial data (summary, growth, leaderboard, payouts, subscriptions)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Check current cache state - only show loading if we don't have cached data
        // If we have cache, fetch silently in background
        const hasCachedSummary = !!loadFromCache('summary')
        const hasCachedLeaderboard = !!loadFromCache('leaderboard')
        const hasCachedPayouts = !!loadFromCache('payouts')
        const hasCachedSubscription = !!loadFromCache('subscription')
        const hasCachedData = hasCachedSummary || hasCachedLeaderboard || hasCachedPayouts || hasCachedSubscription
        
        if (!hasCachedData) {
          setInitialDataLoading(true)
        }
        setError(null)

        const userStr = localStorage.getItem('User')
        const token = userStr ? JSON.parse(userStr)?.token : null
        const headers = token
          ? {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          : {}

        const summaryReq = axios.get(
          `${Apis.revenueSummary}?startDate=${startDate}&endDate=${encodeURIComponent(endDate)}`,
          { headers },
        )

        const leaderboardReq = axios.get(
          `${Apis.revenueLeaderboard}?limit=5&sortBy=revenue&startDate=${startDate}&endDate=${encodeURIComponent(endDate)}`,
          { headers },
        )

        const payoutsReq = axios.get(
          `${Apis.revenuePayoutsSummary}?startDate=${startDate}&endDate=${encodeURIComponent(endDate)}`,
          { headers },
        )

        const subscriptionReq = axios.get(
          `${Apis.AdminAnalytics}?startDate=${startDate}&endDate=${encodeURIComponent(endDate)}${selectedAgency ? `&userId=${selectedAgency.id}` : ''}`,
          { headers },
        )

        const [summaryRes, leaderboardRes, payoutsRes, subscriptionRes] =
          await Promise.all([
            summaryReq,
            leaderboardReq,
            payoutsReq,
            subscriptionReq,
          ])

        const summaryData = summaryRes?.data?.data || null
        const leaderboardData = leaderboardRes?.data?.data?.accounts || []
        const payoutsData = payoutsRes?.data?.data || null
        const subscriptionData = subscriptionRes?.data?.data || null

        // Update state with fresh data
        setSummary(summaryData)
        setLeaderboard(leaderboardData)
        setPayouts(payoutsData)
        setSubscriptionData(subscriptionData)

        // Save to cache
        saveToCache('summary', summaryData)
        saveToCache('leaderboard', leaderboardData)
        saveToCache('payouts', payoutsData)
        saveToCache('subscription', subscriptionData)

        // Fetch initial revenue growth with default filter
        await fetchRevenueGrowth(revenueGrowthFilter, null, null, false)
      } catch (e) {
        console.error('Failed to fetch revenue data', e)
        setError('Failed to load revenue data')
      } finally {
        setInitialDataLoading(false)
      }
    }

    fetchInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAgency])

  // Load cached transactions when filters change (only for page 1)
  useEffect(() => {
    if (txPage === 1) {
      const cacheKey = `transactions_${JSON.stringify(txFilters)}`
      const cachedTransactions = loadFromCache(cacheKey)
      if (cachedTransactions) {
        setTransactions(cachedTransactions.transactions || [])
        setHasMoreTransactions(cachedTransactions.hasMore ?? true)
        setTransactionsLoading(false)
      } else {
        // If no cache for these filters, show loading
        setTransactionsLoading(true)
      }
    }
  }, [txFilters, txPage])

  // Fetch transactions separately (responds to filters and pagination)
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Check if we have cached data for current filters
        const cacheKey = `transactions_${JSON.stringify(txFilters)}`
        const hasCachedTx = !!loadFromCache(cacheKey)
        
        // Show loading only for first page and only if no cached data
        // Otherwise fetch silently in background
        if (txPage === 1 && !hasCachedTx) {
          setTransactionsLoading(true)
        } else if (txPage > 1) {
          setTxLoadingMore(true)
        }

        const userStr = localStorage.getItem('User')
        const token = userStr ? JSON.parse(userStr)?.token : null
        const headers = token
          ? {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          : {}

        // Build transaction query parameters
        // Map "Promo" to "ReferralCode" for backend API
        const typeParam = txFilters.type === 'Promo' ? 'ReferralCode' : txFilters.type
        const txParams = new URLSearchParams({
          page: txPage,
          limit: txLimit,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
          type: typeParam,
          status: txFilters.status,
          dateFilter: txFilters.dateFilter,
        })

        // Add date range if custom range is selected
        if (txFilters.dateFilter === 'customRange') {
          if (txFilters.startDate) {
            txParams.set(
              'startDate',
              moment(txFilters.startDate, 'MM/DD/YYYY').format('YYYY-MM-DD'),
            )
          }
          if (txFilters.endDate) {
            txParams.set(
              'endDate',
              moment(txFilters.endDate, 'MM/DD/YYYY').format('YYYY-MM-DD'),
            )
          }
        }

        const txRes = await axios.get(
          `${Apis.revenueTransactions}?${txParams.toString()}`,
          { headers },
        )

        // Handle transactions with infinite scroll accumulation
        const newTransactions = txRes?.data?.data?.transactions || []
        if (txPage === 1) {
          setTransactions(newTransactions)
          // Cache transactions for page 1 only
          const cacheKey = `transactions_${JSON.stringify(txFilters)}`
          const hasMore = newTransactions.length === txLimit
          saveToCache(cacheKey, {
            transactions: newTransactions,
            hasMore,
          })
        } else {
          setTransactions((prev) => [...prev, ...newTransactions])
        }

        // Check if there are more transactions to load
        const hasMore = newTransactions.length === txLimit
        setHasMoreTransactions(hasMore)
      } catch (e) {
        console.error('Failed to fetch transactions', e)
      } finally {
        if (txPage === 1) {
          setTransactionsLoading(false)
        } else {
          setTxLoadingMore(false)
        }
      }
    }

    fetchTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txPage, txFilters])

  // Combined loading state - only show loading if either initial data or transactions are loading
  useEffect(() => {
    setLoading(initialDataLoading || transactionsLoading)
  }, [initialDataLoading, transactionsLoading])

  const handleTxFilterChange = (key, value) => {
    setTxFilters((prev) => ({ ...prev, [key]: value }))
    setTxPage(1)
    setTransactions([])
  }

  const topMetrics = useMemo(() => {
    if (!summary) {
      return {
        totalRevenue: '-',
        arr: '-',
        mrr: '-',
        netRevenue: '-',
        agencyNetEarnings: '-',
        stripeBalance: '-',
      }
    }
    return {
      totalRevenue: `$${Number(summary.totalRevenue || 0).toLocaleString()}`,
      arr: subscriptionData?.arr
        ? `$${Number(subscriptionData.arr || 0).toLocaleString()}`
        : '-',
      mrr: `$${Number(summary.mrr || 0).toLocaleString()}`,
      netRevenue: `$${Number(summary.netRevenue || 0).toLocaleString()}`,
      agencyNetEarnings: `$${Number(summary.agencyNetEarnings || 0).toLocaleString()}`,
      stripeBalance: `$${Number(summary.stripeBalance || 0).toLocaleString()}`,
    }
  }, [summary, subscriptionData])

  const revenueChart = useMemo(() => {
    if (!growth) {
      return {
        data: [],
        currentValue: '-',
        selectedPeriod: revenueGrowthFilter,
      }
    }
    const monthly = growth?.monthlyData || []
    return {
      data: monthly.map((m) => ({ month: m.month, value: m.revenue || 0 })),
      currentValue: growth?.currentRevenue ? `${growth.currentRevenue}` : '-',
      selectedPeriod: revenueGrowthFilter,
    }
  }, [growth, revenueGrowthFilter])

  const leaderboardData = useMemo(() => {
    return (leaderboard || []).map((row, idx) => ({
      rank: row.rank || idx + 1,
      accountName: row.account?.name || `Account ${idx + 1}`,
      accountIcon: String((idx % 9) + 1),
      revenue: `$${Number(row.revenue || 0).toLocaleString()}`,
      mrr: `$${Number(row.mrr || 0).toLocaleString()}`,
      netEarnings: `$${Number(row.netEarnings || row.netRevenue || 0).toLocaleString()}`,
    }))
  }, [leaderboard])

  const transactionData = useMemo(() => {
    return (transactions || []).map((t, idx) => ({
      id: t.id,
      title: t.title || t.productName || 'Transaction',
      subAccount: t.subaccountName || 'N/A',
      accountIcon: String((idx % 9) + 1),
      product: t.productName || t.title || 'Product',
      type: t.type || '-',
      totalPaid: `$${formatFractional2(Number(t.amountPaid || 0))}`,
      stripeFee: `$${formatFractional2(Number(t.stripeFee || 0))}`,
      platformFee: `$${formatFractional2(Number(t.platformFeeAmount || 0))}`,
      serviceCost: `$${formatFractional2(Number(t.serviceCost || 0))}`,
      agentXShare: `$${formatFractional2(Number(t.agentXShare || 0))}`,
      payout: `$${formatFractional2(Number(t.agencyNetAmount || 0))}`,
      date: moment(t.date).format('MM/DD/YYYY'),
      onHold: t.onHold || false,
      status: (t.status || 'completed').toLowerCase().includes('complete')
        ? 'success'
        : (t.status || '').toLowerCase().includes('pending')
          ? 'pending'
          : (t.status || '').toLowerCase().includes('fail')
            ? 'failed'
            : 'success',
    }))
  }, [transactions])

  const payoutMetrics = useMemo(() => {
    if (!payouts) {
      return {
        nextPayoutDate: '-',
        nextPayoutTime: '-',
        lifetimePayouts: '-',
        avgTransactionValue: '-',
        clv: '-',
        refundsCount: '-',
        refundsAmount: '-',
      }
    }
    const refundsCount =
      Number(payouts.refundsCount || 0) + Number(payouts.chargebacksCount || 0)
    const refundsAmount = (
      Number(payouts.refundsAmount || 0) +
      Number(payouts.chargebacksAmount || 0)
    ).toFixed(2)
    let nextPayoutDate = payouts.nextPayoutAt
      ? moment(payouts.nextPayoutAt).format('MMMM D')
      : '-'
    let nextPayoutTime = payouts.nextPayoutAt
      ? moment(payouts.nextPayoutAt).format('h:mmA')
      : '-'
    return {
      nextPayoutDate,
      nextPayoutTime,
      lifetimePayouts: `$${Number(payouts.lifetimePayouts || 0).toLocaleString()}`,
      avgTransactionValue: `$${Number(payouts.avgTransactionValue || 0).toLocaleString()}`,
      clv: subscriptionData?.clv
        ? `$${Number(subscriptionData.clv || 0).toLocaleString()}`
        : '-',
      refundsCount: `${refundsCount}`,
      refundsAmount: `$${Number(refundsAmount).toLocaleString()}`,
    }
  }, [payouts, subscriptionData])

  // Helper function to check if there's no meaningful revenue data
  // Only check when loading is complete
  const hasNoData = useMemo(() => {
    // Don't show "no data" while still loading
    if (loading || initialDataLoading || transactionsLoading) {
      return false
    }

    // If subscriptionData is null/undefined, show placeholder
    if (!subscriptionData) {
      return true
    }

    // Check if subscriptionData has meaningful values
    const hasSubscriptions = (subscriptionData.totalSubscriptions || 0) > 0
    const hasMRR = parseFloat(subscriptionData.mrr || '0') > 0
    const hasARR = parseFloat(subscriptionData.arr || '0') > 0

    // Check if summary has meaningful values
    const hasTotalRevenue = (summary?.totalRevenue || 0) > 0

    // Show placeholder if all metrics are zero/empty
    return !hasSubscriptions && !hasMRR && !hasARR && !hasTotalRevenue
  }, [subscriptionData, summary, loading, initialDataLoading, transactionsLoading])

  return loading ? (
    <div className="flex flex-col justify-center items-center h-[90svh]">
      <CircularProgress size={45} />
    </div>
  ) : (
    <div
      className="flex flex-col items-center justify-start w-full h-[88vh] bg-gray-50"
      style={{ overflow: 'auto', scrollbarWidth: 'none', paddingTop: '2rem' }}
    >
      {hasNoData ? (
        <AgencyDashboardDefaultUI
          title={'Revenue Dashboard'}
          description={
            'Your agency revenue metrics will appear once you have account activities'
          }
        />
      ) : (
        <div className="flex flex-col items-start w-11/12 gap-6 pb-6">
          {/* Top Metrics Section */}
          <div className="w-full">
            <TopMetricsSection metrics={topMetrics} />
          </div>

          {/* Payout Metrics Section - Full Width */}
          <div className="w-full">
            <PayoutMetricsSection metrics={payoutMetrics} />
          </div>

          {/* Revenue Growth Chart and LeaderBoard - Side by Side */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Revenue Growth Chart - Takes up 7 columns */}
            <div className="lg:col-span-7">
              <RevenueGrowthChart
                data={revenueChart?.data}
                currentValue={revenueChart?.currentValue}
                selectedPeriod={revenueChart?.selectedPeriod}
                onPeriodChange={handleRevenueGrowthFilterChange}
              />
            </div>

            {/* LeaderBoard Table - Takes up 5 columns */}
            <div className="lg:col-span-5">
              <LeaderBoardTable
                data={leaderboardData}
                onSeeAll={() => {
                  // Handle see all action
                  console.log('See all leaderboard')
                }}
              />
            </div>
          </div>

          {/* Subscription Graphs Section - Full Width */}
          <div className="w-full">
            <SubscriptionGraphsSection
              subscriptionData={subscriptionData}
              fetchOwnData={true}
              userId={selectedAgency?.id}
            />
          </div>

          {/* Transaction Table - Full Width */}
          <div className="w-full">
            <TransactionTable
              data={transactionData}
              onSearch={(query) => {
                // Handle search
                console.log('Search query:', query)
              }}
              hasMore={hasMoreTransactions}
              loadingMore={txLoadingMore}
              onLoadMore={() => {
                if (!txLoadingMore && hasMoreTransactions) {
                  setTxPage((prev) => prev + 1)
                }
              }}
              filters={txFilters}
              onFilterChange={handleTxFilterChange}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AgencyRevenueDashboard
