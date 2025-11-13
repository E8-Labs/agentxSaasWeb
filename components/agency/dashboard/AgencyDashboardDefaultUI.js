import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const AgencyDashboardDefaultUI = ({ title, description }) => {
  return (
    <div className="flex flex-col justify-start items-start pl-10 h-[90svh] gap-4 pb-8 w-full"
      style={{ overflow: "auto", scrollbarWidth: "none" }}>
      
      {/* Row 1: Four placeholder cards */}
      <div className="grid gap-6 grid-cols-4 md:grid-cols-4 lg:grid-cols-4 w-[96%] mt-4">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton
            key={item}
            className={cn(
              "h-20 rounded-lg",
              "bg-gray-100 border-none",
              "shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]"
            )}
          />
        ))}
      </div>

      {/* Row 2: One wide placeholder card */}
      <div className="w-[96%]">
        <Skeleton
          className={cn(
            "h-20 rounded-lg",
            "bg-gray-100 border-none",
            "shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]"
          )}
        />
      </div>
      {/* Central No Data Section */}
      <div className="flex flex-col items-center justify-center w-full py-16">
        <Image className='' src="/otherAssets/noDataIcon.svg" alt="No Data" width={200} height={200} />
        {/* Text Content */}
        <h2 className="text-xl font-bold text-gray-900 mb-2 mt-4">
          No data to show
        </h2>
        <p className="text-normal text-gray-600 font-normal text-center max-w-md">
          {description}
        </p>
      </div>
    </div>
  )
}

export default AgencyDashboardDefaultUI