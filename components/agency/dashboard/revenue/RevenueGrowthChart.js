'use client'

import { Box, Modal } from '@mui/material'
import { CalendarIcon } from 'lucide-react'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import CustomTooltip from '@/utilities/CustomTooltip'

/**
 * RevenueGrowthChart - Bar chart showing monthly revenue growth
 * @param {Object} props
 * @param {Array} props.data - Chart data array with month and value
 * @param {string} props.currentValue - Current revenue value to display
 * @param {string} props.selectedPeriod - Selected time period (default: "Last 30 Days")
 * @param {Function} props.onPeriodChange - Callback when period changes, receives (period, startDate, endDate)
 */
function RevenueGrowthChart({
  data = [],
  currentValue = '11,728',
  selectedPeriod = 'Last 30 Days',
  onPeriodChange,
}) {
  const [period, setPeriod] = useState(selectedPeriod)
  const [showCustomRangePopup, setShowCustomRangePopup] = useState(false)
  const [showCustomRange, setShowCustomRange] = useState(false)
  const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false)
  const [endDatePopoverOpen, setEndDatePopoverOpen] = useState(false)
  const [localStartDate, setLocalStartDate] = useState('2025-01-01')
  const [localEndDate, setLocalEndDate] = useState(
    moment().format('YYYY-MM-DD'),
  )

  // Sync period state with selectedPeriod prop
  useEffect(() => {
    setPeriod(selectedPeriod)
  }, [selectedPeriod])

  // Use provided data, or empty array if no data
  const chartData = data && data.length > 0 ? data : []

  // Calculate Y-axis domain based on max value
  const maxValue =
    chartData.length > 0 ? Math.max(...chartData.map((d) => d.value), 0) : 0

  // Generate Y-axis ticks in logarithmic-like scale for better visualization
  const generateYTicks = (max) => {
    if (max === 0) return [0]
    const scale = Math.pow(10, Math.floor(Math.log10(max)))
    const multiplier = Math.ceil(max / scale)
    const ticks = []
    const steps = [1, 2, 5, 10]
    const step = steps.find((s) => s * scale * 10 >= max) || 1

    for (let i = 0; i <= multiplier * step; i += step) {
      const value = i * scale
      if (value <= max * 1.2) {
        ticks.push(value)
      }
    }
    return ticks.length > 0 ? ticks : [0, Math.ceil(max)]
  }

  const yTicks = generateYTicks(maxValue)

  const formatYAxis = (tick) => {
    if (tick >= 1000) return `${tick / 1000}k`
    return tick.toString()
  }

  const handlePeriodSelect = (value) => {
    if (value === 'Custom Range') {
      setShowCustomRangePopup(true)
      setPeriod('Custom Range')
    } else if (value === 'All Time') {
      setPeriod('All Time')
      setShowCustomRange(false)
      const allTimeStartDate = '2025-01-01'
      const allTimeEndDate = moment().format('YYYY-MM-DD')
      if (onPeriodChange) {
        onPeriodChange('All Time', allTimeStartDate, allTimeEndDate)
      }
    } else {
      setPeriod(value)
      setShowCustomRange(false)
      if (onPeriodChange) {
        onPeriodChange(value, null, null)
      }
    }
  }

  const handleCustomRangeApply = () => {
    setShowCustomRangePopup(false)
    setShowCustomRange(true)
    if (onPeriodChange) {
      onPeriodChange('Custom Range', localStartDate, localEndDate)
    }
  }

  const handleResetCustomRange = () => {
    setLocalStartDate('2025-01-01')
    setLocalEndDate(moment().format('YYYY-MM-DD'))
    setShowCustomRange(false)
    setPeriod('Last 30 Days')
    if (onPeriodChange) {
      onPeriodChange('Last 30 Days', null, null)
    }
  }

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const monthNames = {
        Jan: 'January',
        Feb: 'February',
        Mar: 'March',
        Apr: 'April',
        May: 'May',
        Jun: 'June',
        Jul: 'July',
        Aug: 'August',
        Sep: 'September',
        Oct: 'October',
        Nov: 'November',
        Dec: 'December',
      }
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-gray-900">
            {monthNames[label] || label}
          </p>
          <p className="text-purple-600 font-semibold">
            ${payload[0].value?.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-white rounded-lg border-2 border-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold text-gray-900">
              Revenue Growth
            </CardTitle>
            <CustomTooltip title="Revenue growth over a period of time" />
          </div>
          <div className="flex items-center gap-2">
            {/* Custom Range Badge */}
            {showCustomRange && (
              <div
                className="px-4 py-2 bg-[#402FFF10] text-purple flex-shrink-0 rounded-[25px] flex flex-row items-center gap-2"
                style={{ fontWeight: '500', fontSize: 15 }}
              >
                {`${moment(localStartDate).format('MM-DD-YYYY')} - ${moment(localEndDate).format('MM-DD-YYYY')}`}
                <button
                  className="outline-none"
                  onClick={handleResetCustomRange}
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50">
                  {period}
                  <Image
                    src="/svgIcons/downArrow.svg"
                    alt="Dropdown"
                    width={16}
                    height={16}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => handlePeriodSelect('All Time')}
                >
                  All Time
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handlePeriodSelect('Last 7 Days')}
                >
                  Last 7 Days
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handlePeriodSelect('Last 30 Days')}
                >
                  Last 30 Days
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handlePeriodSelect('This Year')}
                >
                  This Year
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handlePeriodSelect('Custom Range')}
                >
                  Custom Range
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* <div className="text-2xl font-light text-gray-900 mt-2">{currentValue}</div> */}
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickMargin={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickMargin={10}
                tickFormatter={formatYAxis}
                domain={[0, maxValue > 0 ? maxValue * 1.2 : 100]}
                ticks={yTicks}
              />
              <Tooltip content={customTooltip} />
              <Bar
                dataKey="value"
                fill="#8E24AA"
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <div className="text-center">
              <p className="text-sm font-medium">No data available</p>
              <p className="text-xs mt-1">
                No revenue data found for the selected period
              </p>
            </div>
          </div>
        )}
      </CardContent>

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
    </Card>
  )
}

export default RevenueGrowthChart
