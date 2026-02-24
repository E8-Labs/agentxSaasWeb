'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const ButtonGroup = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('inline-flex rounded-md bg-white shadow-sm', className)}
        role="group"
        {...props}
      />
    )
  }
)
ButtonGroup.displayName = 'ButtonGroup'

export { ButtonGroup }

