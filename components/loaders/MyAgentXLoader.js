import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import React from 'react'

function MyAgentXLoader() {
  return (
    <div
      role="status"
      aria-label="Loading agents"
      className="flex w-full max-w-[1028px] flex-col items-center gap-4 px-0 py-6"
    >
      <p className="m-0 text-sm font-medium text-muted-foreground">
        Loading agents…
      </p>
      <div className="flex w-full flex-col items-center gap-3">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton
            key={i}
            className={cn('h-[150px] w-full max-w-full')}
          />
        ))}
      </div>
    </div>
  )
}

export default MyAgentXLoader
