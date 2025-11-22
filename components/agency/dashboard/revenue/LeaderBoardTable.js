'use client'

import Image from 'next/image'
import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

/**
 * LeaderBoardTable - Displays top accounts leaderboard
 * @param {Object} props
 * @param {Array} props.data - Array of account objects with ranking data
 * @param {Function} props.onSeeAll - Callback when "See All" is clicked
 */
function LeaderBoardTable({ data = [], onSeeAll }) {
  const [open, setOpen] = React.useState(false)
  // Default sample data
  const defaultData = [
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

  const leaderboardData = data.length > 0 ? data : []

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇' // Gold medal
      case 2:
        return '🥈' // Silver medal
      case 3:
        return '🥉' // Bronze medal
      default:
        return '🏅' // General medal
    }
  }

  const getAccountIconColor = (rank) => {
    const colors = [
      '#8E24AA', // Purple
      '#FF6600', // Orange
      '#402FFF', // Blue
      '#FF2D2D', // Red
      '#F59E0B', // Amber
    ]
    return colors[(rank - 1) % colors.length]
  }

  return (
    <Card className="bg-white rounded-lg border-2 border-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">
              LeaderBoard
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">Top 5 Account</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            {/* <DialogTrigger asChild>
              <button
                onClick={() => { setOpen(true); if (onSeeAll) onSeeAll(); }}
                className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                See All
                <span>→</span>
              </button>
            </DialogTrigger> */}
            <DialogContent className="max-w-3xl w-[90vw]">
              <DialogHeader>
                <DialogTitle>All accounts</DialogTitle>
              </DialogHeader>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="text-gray-600 font-medium">
                        Rank
                      </TableHead>
                      <TableHead className="text-gray-600 font-medium">
                        Account
                      </TableHead>
                      <TableHead className="text-gray-600 font-medium">
                        Revenue
                      </TableHead>
                      <TableHead className="text-gray-600 font-medium">
                        MRR
                      </TableHead>
                      <TableHead className="text-gray-600 font-medium">
                        Net Revenue
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboardData.map((item) => (
                      <TableRow
                        key={`all-${item.rank}`}
                        className="border-b border-gray-100"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {getMedalIcon(item.rank) || '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {/* <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                              style={{ backgroundColor: getAccountIconColor(item.rank) }}
                            >
                              {item.accountIcon || item.rank || "-"}
                            </div> */}
                            <span className="text-sm font-medium text-gray-900">
                              {item.accountName || '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {item.revenue || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {item.mrr || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {item.netRevenue || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead className="text-gray-600 font-medium">Rank</TableHead>
              <TableHead className="text-gray-600 font-medium">
                Account
              </TableHead>
              <TableHead className="text-gray-600 font-medium">
                Revenue
              </TableHead>
              <TableHead className="text-gray-600 font-medium">MRR</TableHead>
              <TableHead className="text-gray-600 font-medium">
                Net Revenue
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboardData.map((item) => (
              <TableRow
                key={item.rank}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getMedalIcon(item.rank) || '-'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {/* <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                      style={{
                        backgroundColor: getAccountIconColor(item.rank),
                      }}
                    >
                      {item.accountIcon || item.rank || "-"}
                    </div> */}
                    <span className="text-sm font-medium text-gray-900">
                      {item.accountName || '-'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-700">
                  {item.revenue || '-'}
                </TableCell>
                <TableCell className="text-sm text-gray-700">
                  {item.mrr || '-'}
                </TableCell>
                <TableCell className="text-sm text-gray-700">
                  {item.netRevenue || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default LeaderBoardTable
