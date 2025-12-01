'use client'

import { Box, Modal } from '@mui/material'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'
import axios from 'axios'
import { CalendarIcon } from 'lucide-react'
import moment from 'moment'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'
import { Bar, BarChart, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'

import Apis from '@/components/apis/Apis'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import CustomTooltip from '@/utilities/CustomTooltip'

// Helper function to format numbers with commas
const formatNumberWithCommas = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Helper function to format currency with commas
const formatCurrency = (num) => {
  return `$${formatNumberWithCommas(num.toFixed(2))}`
}

// Helper function to format numbers with "k" notation if >= 1000
const formatNumberWithK = (num) => {
  if (num >= 1000) {
    const kValue = num / 1000
    // Show one decimal place if needed, otherwise no decimal
    return kValue % 1 === 0 ? `${kValue}k` : `${kValue.toFixed(1)}k`
  }
  return num.toString()
}

// Custom Tooltip Component for Plans Chart
const PlansChartTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const planName = data.name
    const amount = data.value
    const userCount = data.userCount

    return (
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            color: '#7902DF',
            fontWeight: '600',
            marginBottom: '8px',
            fontSize: '14px',
          }}
        >
          {planName}
        </div>
        {userCount !== null && userCount !== undefined && (
          <div
            style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}
          >
            Count: {userCount}
          </div>
        )}
        <div style={{ color: '#6b7280', fontSize: '13px' }}>
          Amount: {formatCurrency(amount)}
        </div>
      </div>
    )
  }
  return null;
};

// Custom Tooltip Component for New Subscription Chart
// Sorts plans by count (highest to lowest) for the selected day
const SubscriptionChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Sort payload items by value (count) in descending order
    const sortedPayload = [...payload].sort((a, b) => {
      const aValue = a.value || 0;
      const bValue = b.value || 0;
      return bValue - aValue; // Descending order
    });

    return (
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ color: "#6b7280", fontWeight: "600", marginBottom: "8px", fontSize: "14px" }}>
          {label}
        </div>
        {sortedPayload.map((item, index) => {
          const planName = item.dataKey || item.name || "Unknown";
          const count = item.value || 0;
          return (
            <div
              key={item.dataKey || index}
              style={{
                color: "#111827",
                fontSize: "13px",
                marginBottom: index < sortedPayload.length - 1 ? "4px" : "0",
              }}
            >
              {planName}: {count}
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

// Custom Tooltip Component for Reactivation Rate Chart
const ReactivationChartTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const planName = data.name
    const count = data.value

    return (
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            color: '#7902DF',
            fontWeight: '600',
            marginBottom: '8px',
            fontSize: '14px',
          }}
        >
          {planName}
        </div>
        <div style={{ color: '#6b7280', fontSize: '13px' }}>Count: {count}</div>
      </div>
    )
  }
  return null
}

/**
 * SubscriptionGraphsSection - Displays subscription-related graphs
 * @param {Object} props
 * @param {Object} props.subscriptionData - Data for subscription graphs (optional if fetching own data)
 * @param {string} props.dateFilter - Date filter: 'last7Days', 'last30Days', 'customRange', or null
 * @param {string} props.startDate - Start date for customRange (YYYY-MM-DD)
 * @param {string} props.endDate - End date for customRange (YYYY-MM-DD)
 * @param {number} props.userId - Optional agency ID for filtering
 * @param {boolean} props.fetchOwnData - If true, component will fetch its own data using filters
 */
function SubscriptionGraphsSection({
  subscriptionData = {},
  dateFilter = null,
  startDate = null,
  endDate = null,
  userId = null,
  fetchOwnData = false,
}) {
  const [showPlansTooltip, setShowPlansTooltip] = useState(false)
  const [localSubscriptionData, setLocalSubscriptionData] = useState({})
  const [loading, setLoading] = useState(false)
  const [hasFetchedData, setHasFetchedData] = useState(false)

  // Filter states - initialize to trigger initial fetch
  const [localDateFilter, setLocalDateFilter] = useState(
    dateFilter || 'last30Days',
  )
  const [localStartDate, setLocalStartDate] = useState(
    startDate || '2025-01-01',
  )
  const [localEndDate, setLocalEndDate] = useState(
    endDate || moment().format('YYYY-MM-DD'),
  )
  const [selectedRange, setSelectedRange] = useState('All Time')
  const [showCustomRangePopup, setShowCustomRangePopup] = useState(false)
  const [showCustomRange, setShowCustomRange] = useState(false)
  const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false)
  const [endDatePopoverOpen, setEndDatePopoverOpen] = useState(false)

  // Define colors for each plan
  const colors = ['#8E24AA', '#FF6600', '#402FFF', '#FF2D2D']

  const fetchSubscriptionData = useCallback(async () => {
    // return
    try {
      setLoading(true)
      const userStr = localStorage.getItem('User')
      const token = userStr ? JSON.parse(userStr)?.token : null

      if (!token) return

      const params = new URLSearchParams()

      // Use local filter state if component manages its own filters, otherwise use props
      const activeFilter =
        localDateFilter !== null ? localDateFilter : dateFilter
      const activeStartDate = localStartDate || startDate
      const activeEndDate = localEndDate || endDate

      if (activeFilter === 'last7Days') {
        params.set('dateFilter', 'last7Days')
      } else if (activeFilter === 'last30Days') {
        params.set('dateFilter', 'last30Days')
      } else if (
        activeFilter === 'customRange' &&
        activeStartDate &&
        activeEndDate
      ) {
        params.set('dateFilter', 'customRange')
        params.set('startDate', activeStartDate)
        params.set('endDate', activeEndDate)
      } else {
        // Default to last30Days
        params.set('dateFilter', 'last30Days')
      }

      if (userId) {
        params.set('userId', userId)
      }

      const response = await axios.get(
        `${Apis.getPlanSubscriptions}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (response.data?.status && response.data?.data) {
        console.log('Subscription data received:', response.data.data)
        setLocalSubscriptionData(response.data.data)
        setHasFetchedData(true) // Mark that we've fetched our own data
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error)
    } finally {
      setLoading(false)
    }
  }, [
    localDateFilter,
    localStartDate,
    localEndDate,
    userId,
    dateFilter,
    startDate,
    endDate,
  ])

  // Fetch data when filters change or on initial load
  useEffect(() => {
    // Always fetch when component has its own filter UI (since we're showing filters, we should fetch)
    // This ensures filters always trigger API calls
    fetchSubscriptionData()
  }, [fetchSubscriptionData])
  //
  // Also update localSubscriptionData if subscriptionData prop changes and we haven't fetched yet
  useEffect(() => {
    if (
      !hasFetchedData &&
      subscriptionData &&
      Object.keys(subscriptionData).length > 0
    ) {
      console.log('Using prop subscriptionData:', subscriptionData)
      setLocalSubscriptionData(subscriptionData)
    }
  }, [subscriptionData, hasFetchedData])

  const handleFilterChange = (filterType) => {
    if (filterType === 'last7Days') {
      setLocalDateFilter('last7Days')
      setSelectedRange('Last 7 Days')
      setShowCustomRange(false)
      // Trigger API call - useEffect will handle it
    } else if (filterType === 'last30Days') {
      setLocalDateFilter('last30Days')
      setSelectedRange('Last 30 Days')
      setShowCustomRange(false)
      // Trigger API call - useEffect will handle it
    } else if (filterType === 'customRange') {
      setShowCustomRangePopup(true)
      setSelectedRange('Custom Range')
    } else {
      // All Time - use last30Days as default
      setLocalDateFilter('last30Days')
      setLocalStartDate('2025-01-01')
      setLocalEndDate(moment().format('YYYY-MM-DD'))
      setSelectedRange('All Time')
      setShowCustomRange(false)
      // Trigger API call - useEffect will handle it
    }
  }

  const handleCustomRangeApply = () => {
    setLocalDateFilter('customRange')
    setShowCustomRangePopup(false)
    setShowCustomRange(true)
    // Trigger API call - useEffect will handle it when localDateFilter changes
  }

  const {
    planSubscriptionStats = {},
    activePlansUsers = {},
    reactivationsByPlan = {},
    newSubscriptions = 0,
  } = localSubscriptionData

  // Debug: Log the data to see what we're working with
  useEffect(() => {
    if (hasFetchedData || Object.keys(localSubscriptionData).length > 0) {
      console.log('Local subscription data:', localSubscriptionData)
      console.log('Active plans users:', activePlansUsers)
      console.log('Reactivations by plan:', reactivationsByPlan)
    }
  }, [
    localSubscriptionData,
    activePlansUsers,
    reactivationsByPlan,
    hasFetchedData,
  ])

  // Transform API data into chart format for New Subscriptions
  const subscriptionChartData = (() => {
    if (
      !planSubscriptionStats ||
      Object.keys(planSubscriptionStats).length === 0
    ) {
      return []
    }

    // Collect ALL unique dates from all plans
    const allDatesSet = new Set()
    Object.values(planSubscriptionStats).forEach((planDates) => {
      Object.keys(planDates).forEach((date) => {
        allDatesSet.add(date)
      })
    })

    // Convert to array and sort by date
    const allDates = Array.from(allDatesSet).sort((a, b) => {
      return (
        moment(a, 'MMM DD, YY').valueOf() - moment(b, 'MMM DD, YY').valueOf()
      )
    })

    return allDates.map((dateKey) => {
      const formattedDate = moment(dateKey, 'MMM DD, YY').format('MMM DD')
      const entry = { month: formattedDate, fullDate: dateKey }

      Object.keys(planSubscriptionStats).forEach((planName) => {
        entry[planName] = planSubscriptionStats[planName]?.[dateKey] || 0
      })

      return entry
    })
  })()

  // Transform data for Plans chart
  const planChartData = (() => {
    if (!activePlansUsers || typeof activePlansUsers !== 'object') {
      console.warn('activePlansUsers is not an object:', activePlansUsers)
      return []
    }

    const keys = Object.keys(activePlansUsers)
    console.log('ActivePlansUsers keys:', keys)

    return keys
      .map((planName, index) => {
        // Handle new structure: { revenue, userCount }
        const planData = activePlansUsers[planName]
        let revenue, userCount

        if (typeof planData === 'object' && planData !== null) {
          // New structure
          revenue = planData.revenue || 0
          userCount = planData.userCount || 0
        } else {
          // Fallback for old structure (backward compatibility)
          revenue = planData || 0
          userCount = null
        }

        // Convert string values to numbers (API returns revenue as strings)
        const numericValue =
          typeof revenue === 'string'
            ? parseFloat(revenue)
            : Number(revenue) || 0
        console.log(
          `Plan: ${planName}, Revenue: ${revenue}, UserCount: ${userCount}, Numeric: ${numericValue}`,
        )
        return {
          name: planName || '',
          value: numericValue,
          userCount: userCount,
          color: colors[index % colors.length],
        }
      })
      .filter((item) => {
        const hasValue = item.value > 0
        if (!hasValue) {
          console.log(
            `Filtering out plan ${item.name} with value ${item.value}`,
          )
        }
        return hasValue
      }) // Only include plans with data
  })()

  const maxPlanValue =
    planChartData.length > 0
      ? Math.max(...planChartData.map((d) => d.value))
      : 0

  // Transform data for Reactivation Rate chart
  const reActivationChartData = (() => {
    if (!reactivationsByPlan || typeof reactivationsByPlan !== 'object') {
      console.warn('reactivationsByPlan is not an object:', reactivationsByPlan)
      return []
    }

    const keys = Object.keys(reactivationsByPlan)
    console.log('ReactivationsByPlan keys:', keys)

    return keys
      .map((planName, index) => {
        const rawValue = reactivationsByPlan[planName] || 0
        const numericValue =
          typeof rawValue === 'string'
            ? parseInt(rawValue, 10)
            : Number(rawValue) || 0
        console.log(
          `Reactivation Plan: ${planName}, Raw: ${rawValue}, Numeric: ${numericValue}`,
        )
        return {
          name: planName || '',
          value: numericValue,
          color: colors[index % colors.length],
        }
      })
      .filter((item) => {
        const hasValue = item.value > 0
        if (!hasValue) {
          console.log(
            `Filtering out reactivation plan ${item.name} with value ${item.value}`,
          )
        }
        return hasValue
      }) // Only include plans with data
  })()

  const maxReactivationValue =
    reActivationChartData.length > 0
      ? Math.max(...reActivationChartData.map((d) => d.value))
      : 0

  // Debug: Log transformed chart data
  useEffect(() => {
    if (planChartData.length > 0) {
      console.log('Plan chart data:', planChartData)
    }
    if (reActivationChartData.length > 0) {
      console.log('Reactivation chart data:', reActivationChartData)
    }
  }, [planChartData, reActivationChartData])

  return (
    <div className="w-full flex flex-col gap-6">
      {/* New Subscriptions Chart (60%) and Stacked Bar Charts (40%) */}
      <div className="flex flex-row gap-6 w-full items-stretch">
        {/* New Subscriptions Chart - 60% Width */}
        <div
          style={{ border: '2px solid white' }}
          className="flex w-[60%] flex-col items-center bg-[#ffffff68] rounded-lg p-6"
        >
          <div className="flex flex-row items-center gap-4 justify-between w-full">
            <div className="flex flex-row items-center gap-2">
              <div
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#0E0E0E',
                }}
              >
                New Subscription
              </div>
              <CustomTooltip title="Number of new paid users over a period of time" />
            </div>
            <div className="flex flex-row items-center gap-4">
              {/* Subscription Count Badge */}
              <Badge
                variant="secondary"
                className="px-3 py-1.5 text-base font-semibold bg-purple/10 text-purple border-purple/20 rounded-full"
              >
                {newSubscriptions}
              </Badge>

              {/* Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-4 py-2 border border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100 flex flex-row items-center gap-1">
                    <p>{selectedRange || 'Select Range'}</p>
                    <Image
                      src={'/svgIcons/downArrow.svg'}
                      height={20}
                      width={24}
                      alt="*"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="bg-white border rounded-lg shadow-md"
                  style={{ minWidth: '8rem', width: '100%' }}
                >
                  <DropdownMenuGroup style={{ cursor: 'pointer' }}>
                    <DropdownMenuItem
                      className="hover:bg-gray-100 px-3"
                      onClick={() => handleFilterChange(null)}
                    >
                      All Time
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="hover:bg-gray-100 px-3"
                      onClick={() => handleFilterChange('last7Days')}
                    >
                      Last 7 Days
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="hover:bg-gray-100 px-3"
                      onClick={() => handleFilterChange('last30Days')}
                    >
                      Last 30 Days
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleFilterChange('customRange')}
                      className="hover:bg-gray-100 px-3"
                    >
                      Custom Range
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Custom Range Filter Badge */}
              {showCustomRange && (
                <div
                  className="px-4 py-2 bg-[#402FFF10] text-purple flex-shrink-0 rounded-[25px] flex flex-row items-center gap-2"
                  style={{ fontWeight: '500', fontSize: 15 }}
                >
                  {`${moment(localStartDate).format('MM-DD-YYYY')} - ${moment(localEndDate).format('MM-DD-YYYY')}`}
                  <button
                    className="outline-none"
                    onClick={() => handleFilterChange(null)}
                  >
                    <Image
                      src={'/otherAssets/crossIcon.png'}
                      height={20}
                      width={20}
                      alt="Remove Filter"
                    />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex w-full flex-row items-center gap-8 mt-5 overflow-x-auto">
            {Object.keys(planSubscriptionStats || {}).map((planName, index) => (
              <div
                key={planName}
                className="flex flex-row items-center gap-2 flex-shrink-0"
              >
                <div
                  className="h-[13px] w-[13px] rounded-full shadow-md border border-white"
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <p style={{ fontSize: 15, fontWeight: '500', color: '#000' }}>
                  {planName}
                </p>
              </div>
            ))}
          </div>

          <div className="flex w-full justify-center">
            {subscriptionChartData.length > 0 ? (
              <LineChart
                width={600}
                height={460}
                data={subscriptionChartData}
                margin={{
                  top: 20,
                  right: 20,
                  left: 20,
                  bottom: 20,
                }}
              >
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(value) =>
                    moment(value, 'MMM DD').format('MMM DD')
                  }
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  allowDecimals={false}
                />
                <Tooltip content={<SubscriptionChartTooltip />} />

                {Object.keys(planSubscriptionStats || {}).map(
                  (planName, index) => (
                    <Line
                      key={planName}
                      type="monotone"
                      dataKey={planName}
                      stroke={colors[index % colors.length] || '#000'}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ),
                )}
              </LineChart>
            ) : (
              <div className="py-10 text-gray-500">
                Not enough data available.
              </div>
            )}
          </div>
        </div>

        {/* Plans and Reactivation Rate - Stacked Vertically (40%) */}
        <div className="flex flex-col gap-6 w-[40%] flex-1">
          {/* Plans Chart */}
          <div
            style={{ border: '2px solid white' }}
            className="flex w-full flex-col items-center bg-[#ffffff68] rounded-lg p-4 flex-1"
          >
            <div className="w-full flex flex-col items-center h-full">
              <div className="flex flex-row items-center justify-between w-full mb-2">
                <div className="flex flex-row items-center gap-2">
                  <div
                    style={{ fontSize: 18, fontWeight: '700', color: '#000' }}
                  >
                    Plans
                  </div>
                  <CustomTooltip title="Revenue generated from plans" />
                </div>
              </div>
              {planChartData.length > 0 ? (
                <BarChart
                  zIndex={1}
                  width={350}
                  height={210}
                  data={planChartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 10,
                  }}
                >
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    domain={[0, maxPlanValue > 0 ? maxPlanValue * 1.1 : 1]}
                    allowDecimals={true}
                    label={{
                      value: 'Revenue (US$)',
                      angle: -90,
                      position: 'insideLeft',
                      style: {
                        textAnchor: 'middle',
                        fontSize: 12,
                        fill: '#6b7280',
                      },
                    }}
                    tickFormatter={(value) => formatNumberWithK(value)}
                  />
                  <Tooltip content={<PlansChartTooltip />} />
                  <Bar
                    zIndex={1}
                    dataKey="value"
                    fill="#7902DF"
                    isAnimationActive={true}
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              ) : (
                <div className="py-10 text-gray-500 text-sm">
                  Not enough data available.
                </div>
              )}
            </div>
          </div>

          {/* Reactivation Rate Chart */}
          <div
            style={{ border: '2px solid white' }}
            className="flex w-full flex-col items-center bg-[#ffffff68] rounded-lg p-4 flex-1"
          >
            <div className="w-full flex flex-col items-center h-full">
              <div className="flex flex-row items-center justify-between w-full mb-2">
                <div className="flex flex-row items-center gap-2">
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: '#000',
                    }}
                  >
                    Reactivation Rate
                  </div>

                  <CustomTooltip title="Number of users who return to a plan after churning" />
                </div>
              </div>
              {reActivationChartData.length > 0 ? (
                <BarChart
                  zIndex={1}
                  width={350}
                  height={210}
                  data={reActivationChartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 10,
                  }}
                >
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    domain={[
                      0,
                      maxReactivationValue > 0 ? maxReactivationValue + 1 : 1,
                    ]}
                    allowDecimals={false}
                    ticks={Array.from(
                      {
                        length:
                          maxReactivationValue > 0
                            ? maxReactivationValue + 2
                            : 2,
                      },
                      (_, i) => i,
                    )}
                  />
                  <Tooltip content={<ReactivationChartTooltip />} />
                  <Bar
                    zIndex={1}
                    dataKey="value"
                    fill="#7902DF"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              ) : (
                <div className="py-10 text-gray-500 text-sm">
                  Not enough data available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Range Modal */}
      <Modal
        open={showCustomRangePopup}
        onClose={() => setShowCustomRangePopup(false)}
        BackdropProps={{
          timeout: 200,
          sx: {
            backgroundColor: '#00000020',
          },
        }}
      >
        <Box
          className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 p-8 rounded-[15px]"
          sx={{
            height: 'auto',
            bgcolor: 'transparent',
            p: 2,
            mx: 'auto',
            my: '50vh',
            transform: 'translateY(-50%)',
            borderRadius: 2,
            border: 'none',
            outline: 'none',
            backgroundColor: 'white',
          }}
        >
          <div style={{ width: '100%' }}>
            <div
              className="max-h-[60vh] overflow-auto"
              style={{ scrollbarWidth: 'none' }}
            >
              <div
                style={{
                  width: '100%',
                  direction: 'row',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontWeight: '500', fontSize: 17 }}>
                  Select Date
                </div>
                <button onClick={() => setShowCustomRangePopup(false)}>
                  <Image
                    src={'/assets/blackBgCross.png'}
                    height={20}
                    width={20}
                    alt="*"
                  />
                </button>
              </div>

              <div className="w-full flex flex-row items-center justify-between">
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontWeight: '500', fontSize: 14 }}>
                    Start Date
                  </div>
                  <div className="mt-5">
                    <Popover
                      open={startDatePopoverOpen}
                      onOpenChange={setStartDatePopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {localStartDate
                            ? moment(localStartDate).format('MM/DD/YYYY')
                            : 'Start date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 z-[9999]"
                        align="start"
                        onInteractOutside={(e) => {
                          // Prevent closing when clicking inside the modal
                          const modal =
                            document.querySelector('[role="dialog"]')
                          if (modal && modal.contains(e.target)) {
                            e.preventDefault()
                          }
                        }}
                      >
                        <Calendar
                          mode="single"
                          selected={
                            localStartDate
                              ? moment(localStartDate).toDate()
                              : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              setLocalStartDate(
                                moment(date).format('YYYY-MM-DD'),
                              )
                              // Keep popover open - don't close on date selection
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontWeight: '500', fontSize: 14 }}>
                    End Date
                  </div>
                  <div className="mt-5">
                    <Popover
                      open={endDatePopoverOpen}
                      onOpenChange={setEndDatePopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {localEndDate
                            ? moment(localEndDate).format('MM/DD/YYYY')
                            : 'End date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 z-[9999]"
                        align="start"
                        onInteractOutside={(e) => {
                          // Prevent closing when clicking inside the modal
                          const modal =
                            document.querySelector('[role="dialog"]')
                          if (modal && modal.contains(e.target)) {
                            e.preventDefault()
                          }
                        }}
                      >
                        <Calendar
                          mode="single"
                          selected={
                            localEndDate
                              ? moment(localEndDate).toDate()
                              : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              setLocalEndDate(moment(date).format('YYYY-MM-DD'))
                              // Keep popover open - don't close on date selection
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <button
                className="text-white bg-purple outline-none rounded-xl w-full mt-8"
                style={{ height: '50px' }}
                onClick={handleCustomRangeApply}
              >
                Continue
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

export default SubscriptionGraphsSection
