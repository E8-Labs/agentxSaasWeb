import {
  Box,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'

import { GetFormattedDateString } from '@/utilities/utility'

import Apis from '../../apis/Apis'

function AdminPaymentCharges() {
  const [paymentCharges, setPaymentCharges] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Set default dates: 1 month before to now
  const getDefaultDates = () => {
    const now = new Date()
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(now.getMonth() - 1)

    return {
      startDate: oneMonthAgo.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    }
  }

  const [dateRange, setDateRange] = useState(getDefaultDates())
  const [showCards, setShowCards] = useState(true)
  const [pagination, setPagination] = useState({
    limit: 100,
    offset: 0,
  })
  const containerRef = useRef(null)

  useEffect(() => {
    fetchPaymentCharges()
  }, [dateRange, pagination])

  const fetchPaymentCharges = async () => {
    try {
      setLoading(true)
      const userData = JSON.parse(localStorage.getItem('User'))

      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      })

      const response = await axios.get(
        `${Apis.getPaymentCharges}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        },
      )

      if (response.data.status) {
        setPaymentCharges(response.data.data)
      } else {
        setError('Failed to fetch payment charges')
      }
    } catch (err) {
      console.error('Error fetching payment charges:', err)
      setError('Error fetching payment charges')
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Reset pagination when date changes
    setPagination({ limit: 100, offset: 0 })
  }

  const handlePageChange = (newOffset) => {
    setPagination((prev) => ({
      ...prev,
      offset: newOffset,
    }))
  }

  const handleLimitChange = (newLimit) => {
    setPagination({
      limit: newLimit,
      offset: 0,
    })
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success'
      case 'failed':
        return 'error'
      case 'pending':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getChargeTypeColor = (type) => {
    switch (type) {
      case 'PhonePurchase':
        return 'bg-blue-100 text-blue-800'
      case 'Plan30':
        return 'bg-purple-100 text-purple-800'
      case 'Plan120':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  return (
    <div className="w-full p-6" ref={containerRef}>
      <div className="mb-6">
        {/* Header with inline title, dates, and chevron */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Payment Charges
            </h1>

            {/* Inline Date Range Selector */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  From:
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    handleDateChange('startDate', e.target.value)
                  }
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">To:</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Chevron Hide/Show Button */}
          {paymentCharges?.summary && (
            <button
              onClick={() => setShowCards(!showCards)}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              title={showCards ? 'Hide summary cards' : 'Show summary cards'}
            >
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${showCards ? 'rotate-180' : 'rotate-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Summary Cards */}
        {paymentCharges?.summary && showCards && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 transition-all duration-500">
              <div className="bg-white p-4 rounded-lg shadow border">
                <h3 className="text-sm font-medium text-gray-500">
                  Total Charges
                </h3>
                <p className="text-2xl font-bold text-purple">
                  {paymentCharges.summary.totalCharges}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border">
                <h3 className="text-sm font-medium text-gray-500">
                  Total Amount
                </h3>
                <p className="text-2xl font-bold text-green">
                  ${paymentCharges.summary.totalAmount}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border">
                <h3 className="text-sm font-medium text-gray-500">
                  Successful
                </h3>
                <p className="text-2xl font-bold text-green">
                  {paymentCharges.summary.successfulCharges}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border">
                <h3 className="text-sm font-medium text-gray-500">Failed</h3>
                <p className="text-2xl font-bold text-red">
                  {paymentCharges.summary.failedCharges}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border">
                <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                <p className="text-2xl font-bold text-orange-600">
                  {paymentCharges.summary.pendingCharges}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border">
                <h3 className="text-sm font-medium text-gray-500">
                  Success Rate
                </h3>
                <p className="text-2xl font-bold text-green">
                  {paymentCharges.summary.successRate}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Charges by Type */}
        {paymentCharges?.chargesByType &&
          paymentCharges.chargesByType.length > 0 &&
          showCards && (
            <div
              className={`mb-6 transition-all duration-500 ${
                showCards ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{
                transform: showCards ? 'translateY(0)' : 'translateY(-30px)',
              }}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Charges by Type
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentCharges.chargesByType.map((chargeType, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-800">
                        {chargeType.type}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getChargeTypeColor(chargeType.type)}`}
                      >
                        {chargeType.count} charges
                      </span>
                    </div>
                    <p className="text-xl font-bold text-green">
                      ${chargeType.totalAmount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Charges Table */}
      {paymentCharges?.charges && paymentCharges.charges.length > 0 && (
        <Paper className="w-full overflow-hidden">
          <TableContainer className="max-h-[70vh]">
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell className="bg-gray-50 font-semibold">
                    Charge ID
                  </TableCell>
                  <TableCell className="bg-gray-50 font-semibold">
                    User
                  </TableCell>
                  <TableCell className="bg-gray-50 font-semibold">
                    Email
                  </TableCell>
                  <TableCell className="bg-gray-50 font-semibold">
                    Title
                  </TableCell>
                  <TableCell className="bg-gray-50 font-semibold">
                    Description
                  </TableCell>
                  <TableCell className="bg-gray-50 font-semibold">
                    Type
                  </TableCell>
                  <TableCell className="bg-gray-50 font-semibold">
                    Amount
                  </TableCell>
                  <TableCell className="bg-gray-50 font-semibold">
                    Status
                  </TableCell>
                  {/* <TableCell className="bg-gray-50 font-semibold">Environment</TableCell> */}
                  <TableCell className="bg-gray-50 font-semibold">
                    Date
                  </TableCell>
                  <TableCell className="bg-gray-50 font-semibold">
                    Transaction ID
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paymentCharges.charges.map((charge) => (
                  <TableRow key={charge.chargeId} hover>
                    <TableCell className="font-medium">
                      {charge.chargeId}
                    </TableCell>
                    <TableCell>{charge.userName}</TableCell>
                    <TableCell>{charge.userEmail}</TableCell>
                    <TableCell className="font-medium">
                      {charge.title}
                    </TableCell>
                    <TableCell
                      className="max-w-xs truncate"
                      title={charge.description}
                    >
                      {charge.description}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getChargeTypeColor(charge.chargeType)}`}
                      >
                        {charge.chargeType}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-green">
                      ${charge.chargeAmount}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={charge.processingStatus}
                        color={getStatusColor(charge.processingStatus)}
                        size="small"
                      />
                    </TableCell>
                    {/* <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                charge.environment === 'Sandbox' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {charge.environment}
                                            </span>
                                        </TableCell> */}
                    <TableCell>
                      {GetFormattedDateString(charge.chargeDate, true)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {charge.transactionId}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Pagination Controls */}
      {(paymentCharges?.pagination || paymentCharges?.charges) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing {(paymentCharges.pagination?.offset || 0) + 1} -{' '}
                {(paymentCharges.pagination?.offset || 0) +
                  paymentCharges.charges.length}{' '}
                of{' '}
                {paymentCharges.pagination?.totalCount ||
                  paymentCharges.charges.length}{' '}
                charges
              </span>

              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Items per page:</label>
                <select
                  value={pagination.limit}
                  onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                </select>
              </div>
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  handlePageChange(
                    Math.max(0, pagination.offset - pagination.limit),
                  )
                }
                disabled={pagination.offset === 0}
                className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="px-3 py-1 text-sm text-gray-600">
                Page {Math.floor(pagination.offset / pagination.limit) + 1} of{' '}
                {Math.ceil(
                  (paymentCharges.pagination?.totalCount ||
                    paymentCharges.charges.length) / pagination.limit,
                )}
              </span>

              <button
                onClick={() =>
                  handlePageChange(pagination.offset + pagination.limit)
                }
                disabled={
                  !paymentCharges.pagination?.hasMore &&
                  paymentCharges.charges.length < pagination.limit
                }
                className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Info */}
      {/* {paymentCharges?.filters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Applied Filters</h3>
                    <p className="text-gray-600 text-sm">
                        <span className="font-medium">Agency:</span> {paymentCharges.filters.agencyName} | 
                        <span className="ml-2 font-medium">User Role:</span> {paymentCharges.filters.userRole}
                    </p>
                </div>
            )} */}
    </div>
  )
}

export default AdminPaymentCharges
