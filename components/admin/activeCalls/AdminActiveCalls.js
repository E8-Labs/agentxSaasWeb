import {
  Box,
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
import React, { useCallback, useEffect, useState } from 'react'

import Apis from '../../apis/Apis'

function AdminActiveCalls() {
  const [callAnalytics, setCallAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState({
    startDate: '2025-08-01',
    endDate: '2025-09-02',
  })

  useEffect(() => {
    fetchCallAnalytics()
  }, [dateRange])

  const fetchCallAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const userData = JSON.parse(localStorage.getItem('User'))

      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })

      const response = await axios.get(
        `${Apis.getCallAnalytics}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        },
      )

      if (response.data.status) {
        setCallAnalytics(response.data.data)
      } else {
        setError('Failed to fetch call analytics')
      }
    } catch (err) {
      console.error('Error fetching call analytics:', err)
      setError('Error fetching call analytics')
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }))
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
    <div
      className="w-full p-6 h-[65vh] overflow-y-auto"
      style={{ scrollbarWidth: 'none' }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Active Calls Analytics
        </h1>

        {/* Date Range Selector */}
        <div className="flex gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Summary Cards */}
        {callAnalytics?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-2xl font-bold text-purple">
                {callAnalytics.summary.totalUsers}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500">Total Calls</h3>
              <p className="text-2xl font-bold text-purple">
                {callAnalytics.summary.totalCalls.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500">
                Total Minutes
              </h3>
              <p className="text-2xl font-bold text-purple">
                {callAnalytics.summary.totalMinutesUsed}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500">
                Unique Leads
              </h3>
              <p className="text-2xl font-bold text-purple">
                {callAnalytics.summary.uniqueLeadsCalled}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      {callAnalytics?.userList && callAnalytics.userList.length > 0 && (
        <Paper className="w-full ">
          <TableContainer className="">
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell className="bg-gray-50 font-semibold">
                    User Name
                  </TableCell>
                  <TableCell className="bg-gray-50 font-semibold">
                    Email
                  </TableCell>
                  <TableCell className="bg-gray-50 font-semibold">
                    Role
                  </TableCell>
                  <TableCell className="bg-gray-50 font-semibold">
                    Total Calls
                  </TableCell>
                  <TableCell className="bg-gray-50 font-semibold">
                    Total Minutes
                  </TableCell>
                  <TableCell className="bg-gray-50 font-semibold">
                    Unique Leads
                  </TableCell>
                  <TableCell className="bg-gray-50 font-semibold">
                    Hot Leads
                  </TableCell>
                  <TableCell className="bg-gray-50 font-semibold">
                    Booked Leads
                  </TableCell>
                  <TableCell className="bg-gray-50 font-semibold">
                    Success Rate
                  </TableCell>
                  <TableCell className="bg-gray-50 font-semibold">
                    Balance Minutes
                  </TableCell>
                  <TableCell className="bg-gray-50 font-semibold">
                    Avg Call Duration
                  </TableCell>
                  <TableCell className="bg-gray-50 font-semibold">
                    Leads Per Call
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {callAnalytics.userList.map((user) => (
                  <TableRow key={user.userId} hover>
                    <TableCell className="font-medium">
                      {user.userName}
                    </TableCell>
                    <TableCell>{user.userEmail}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        {user.userRole}
                      </span>
                    </TableCell>
                    <TableCell>{user.totalCalls.toLocaleString()}</TableCell>
                    <TableCell>{user.totalMinutes}</TableCell>
                    <TableCell>{user.uniqueLeadsCalled}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.hotLeads > 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.hotLeads}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.bookedLeads > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.bookedLeads}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.successCallRate > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.successCallRate}%
                      </span>
                    </TableCell>
                    <TableCell>{user.currentBalanceMinutes}</TableCell>
                    <TableCell>{user.averageCallDuration}</TableCell>
                    <TableCell>{user.leadsPerCall}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Agency Info */}
      {callAnalytics?.agencyInfo && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Agency Information
          </h3>
          <p className="text-gray-600">
            <span className="font-medium">Agency:</span>{' '}
            {callAnalytics.agencyInfo.agencyName}
            <span className="ml-4 font-medium">ID:</span>{' '}
            {callAnalytics.agencyInfo.agencyId}
          </p>
        </div>
      )}
    </div>
  )
}

export default AdminActiveCalls
