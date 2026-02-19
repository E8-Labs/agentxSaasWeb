'use client'

import { Skeleton } from '@mui/material'
import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Skeleton loader that mirrors the main dashboard content layout:
 * - Usage / Total Activity / stat number
 * - Duration selector + Balance card
 * - 9 metric cards grid
 */
function DashboardSkeletonLoader() {
  const cardBorderClasses = [
    'border-b-2',
    'border-l-2 border-b-2',
    'border-l-2 border-b-2',
    '',
    'border-l-2',
    'border-l-2',
    'border-t-2',
    'border-l-2 border-t-2',
    'border-l-2 border-t-2',
  ]

  return (
    <div className="h-[95%] w-11/12 flex flex-row justify-center bg-white rounded-xl mt-12">
      <div className="w-11/12 h-[100%]">
        {/* Top row: Usage block + selector + Balance card */}
        <div className="w-full flex flex-row items-center justify-between h-[30%]">
          <div className="w-2/12 flex flex-col gap-1">
            <Skeleton variant="text" width={80} height={32} sx={{ fontSize: 29 }} />
            <Skeleton variant="text" width={100} height={20} sx={{ fontSize: 15 }} />
            <Skeleton variant="text" width={60} height={56} sx={{ fontSize: 50 }} />
          </div>
          <div className="w-8/12 flex flex-col items-end gap-2">
            <div
              className="w-fit flex flex-row justify-between"
              style={{ backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 5 }}
            >
              <Skeleton variant="rounded" width={140} height={40} sx={{ borderRadius: 1 }} />
            </div>
            <div
              className="flex flex-row justify-between items-center px-8 py-4 relative overflow-hidden rounded-[10px]"
              style={{
                backgroundColor: 'hsl(var(--brand-primary) / 0.15)',
                width: '40vw',
                minHeight: '13vh',
              }}
            >
              <div className="flex flex-row gap-3 items-start">
                <Skeleton variant="rounded" width={50} height={50} />
                <div className="flex flex-col gap-1">
                  <Skeleton variant="text" width={60} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.4)' }} />
                  <Skeleton variant="text" width={120} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.4)' }} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton variant="text" width={100} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.4)' }} />
                <Skeleton variant="rounded" width={130} height={43} sx={{ borderRadius: '15px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Metrics grid: 9 cards */}
        <div className="w-full py-8 overflow-none">
          <div className="w-full mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {cardBorderClasses.map((borderSide, index) => (
              <div
                key={index}
                className={cn(
                  'bg-white flex flex-col items-center p-4',
                  borderSide
                )}
                style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
              >
                <div className="w-10/12 ps-4 py-4 flex flex-col gap-2">
                  <div className="flex flex-row w-full items-center justify-between">
                    <Skeleton variant="rounded" width={50} height={50} />
                  </div>
                  <Skeleton variant="text" width="70%" height={24} />
                  <Skeleton variant="text" width="50%" height={36} />
                  <div className="mt-2 flex flex-row gap-2 justify-end w-full">
                    <Skeleton variant="text" width={60} height={20} />
                    <Skeleton variant="text" width={40} height={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardSkeletonLoader
