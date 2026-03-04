'use client'

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Circle } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

const RadioGroup = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Root
        className={cn('grid gap-2', className)}
        {...props}
        ref={ref}
      />
    )
  }
)
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
          'aspect-square h-4 w-4 shrink-0 rounded-full border-2 transition-all duration-150 ease-out',
          'border-black/[0.15] bg-white text-brand-primary',
          'hover:border-black/[0.25]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-black/[0.15]',
          'data-[state=checked]:border-brand-primary data-[state=checked]:bg-brand-primary data-[state=checked]:hover:border-brand-primary',
          className
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <Circle className="h-2 w-2 fill-white text-white" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    )
  }
)
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }

