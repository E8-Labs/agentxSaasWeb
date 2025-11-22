import axios from 'axios'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'

const AdminPaymentsNeedingRefund = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    status: 'pending',
    limit: 100,
    offset: 0,
  })
  const [summary, setSummary] = useState({
    pending_refunds: { count: 0, total_amount: 0, average_amount: 0 },
    processed_refunds: { count: 0, total_amount: 0 },
  })
  const [processingRefund, setProcessingRefund] = useState(null)

  const fetchPaymentsNeedingRefund = async () => {
    try {
      setLoading(true)
      setError(null)

      const baseURL = Apis.getRefundNeededPayments
      const params = new URLSearchParams({
        limit: filters.limit,
        offset: filters.offset,
        status: filters.status,
      })
      let AuthToken = null
      const LocalData = localStorage.getItem('User')

      if (LocalData) {
        const UserDetails = JSON.parse(LocalData)
        AuthToken = UserDetails.token
      }
      // console.log('token ', AuthToken)

      const response = await axios.get(`${baseURL}?${params}`, {
        headers: {
          Authorization: `Bearer ${AuthToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data.status) {
        setPayments(response.data.data || [])
        setSummary(
          response.data.summary || {
            pending_refunds: { count: 0, total_amount: 0, average_amount: 0 },
            processed_refunds: { count: 0, total_amount: 0 },
          },
        )
      } else {
        setError('Failed to fetch payments needing refund')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data')
      console.error('Error fetching payments needing refund:', err)
    } finally {
      setLoading(false)
    }
  }

  const markRefundAsProcessed = async (paymentId, refundId, notes) => {
    try {
      setProcessingRefund(paymentId)

      let AuthToken = null
      const LocalData = localStorage.getItem('User')

      if (LocalData) {
        const UserDetails = JSON.parse(LocalData)
        AuthToken = UserDetails.token
      }

      const response = await axios.post(
        Apis.markRefundProcessed,
        {
          paymentId,
          refundId,
          notes,
        },
        {
          headers: {
            Authorization: `Bearer ${AuthToken}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (response.data.status) {
        // Refresh the data
        await fetchPaymentsNeedingRefund()
        alert('Refund marked as processed successfully')
      } else {
        throw new Error(
          response.data.message || 'Failed to mark refund as processed',
        )
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process refund')
      console.error('Error marking refund as processed:', err)
    } finally {
      setProcessingRefund(null)
    }
  }

  useEffect(() => {
    fetchPaymentsNeedingRefund()
  }, [filters])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, offset: 0 }))
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical':
        return 'text-red-600 bg-red-100'
      case 'high':
        return 'text-orange-600 bg-orange-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-green-600 bg-green-100'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const handleMarkAsProcessed = (payment) => {
    const refundId = prompt(
      `Enter the Stripe refund ID for ${payment.user.name}:`,
    )
    if (refundId) {
      const notes = prompt('Enter any notes (optional):') || ''
      markRefundAsProcessed(payment.id, refundId, notes)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payments Needing Refund
        </h1>
        <p className="text-gray-600">
          Monitor and process payment refunds that need manual handling
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Pending Refunds
          </h3>
          <p className="text-2xl font-bold text-red-600">
            {summary.pending_refunds.count}
          </p>
          <p className="text-sm text-gray-500">
            Total: {formatAmount(summary.pending_refunds.total_amount)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Average Refund
          </h3>
          <p className="text-2xl font-bold text-purple-600">
            {formatAmount(summary.pending_refunds.average_amount)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Processed Refunds
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {summary.processed_refunds.count}
          </p>
          <p className="text-sm text-gray-500">
            Total: {formatAmount(summary.processed_refunds.total_amount)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="pending">Pending Only</option>
              <option value="processed">Processed Only</option>
              <option value="all">All</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Results per page
            </label>
            <select
              value={filters.limit}
              onChange={(e) =>
                handleFilterChange('limit', parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => fetchPaymentsNeedingRefund()}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Refund Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Charge Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Old
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No payments needing refund found
                  </td>
                </tr>
              ) : (
                payments.map((payment, index) => (
                  <tr key={payment.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.user.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          {payment.user.company}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.transactionId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.paymentType}
                        </div>
                        <div className="text-xs text-gray-400">
                          {payment.environment}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatAmount(payment.refundAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.chargeDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.daysOld} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(payment.urgency)}`}
                      >
                        {payment.urgency || 'normal'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="text-sm text-gray-900 max-w-xs truncate"
                        title={payment.refundReason}
                      >
                        {payment.refundReason}
                      </div>
                      <div className="text-xs text-gray-500">
                        {payment.processingStatus}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {payment.refundId ? (
                        <span className="text-green-600">Processed</span>
                      ) : (
                        <button
                          onClick={() => handleMarkAsProcessed(payment)}
                          disabled={processingRefund === payment.id}
                          className="text-purple-600 hover:text-purple-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingRefund === payment.id
                            ? 'Processing...'
                            : 'Mark as Processed'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {payments.length === filters.limit && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {filters.offset + 1} to {filters.offset + payments.length}{' '}
            results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                handleFilterChange(
                  'offset',
                  Math.max(0, filters.offset - filters.limit),
                )
              }
              disabled={filters.offset === 0}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() =>
                handleFilterChange('offset', filters.offset + filters.limit)
              }
              disabled={payments.length < filters.limit}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPaymentsNeedingRefund
