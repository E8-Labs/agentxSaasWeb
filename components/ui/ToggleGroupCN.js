'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { TypographyBody } from '@/lib/typography'

/**
 * Reusable Toggle Group Component
 * Firecrawl-inspired minimal pill tabs with brand styling.
 * Used for toggle buttons like All/Unreplied/Starred, SMS/Email, etc.
 *
 * @param {Object} props
 * @param {Array<{label: string, value: string, count?: number, icon?: React.ComponentType}>} props.options - Array of toggle options
 * @param {string} props.value - Currently selected value
 * @param {function} props.onChange - Callback when selection changes (value: string) => void
 * @param {string} props.className - Optional additional classes
 * @param {string} props.height - Optional height class (e.g., 'h-[40px] py-1', 'p-1.5')
 * @param {string} props.roundedness - Optional roundedness class (e.g., 'rounded-lg', 'rounded-full')
 */
const ToggleGroupCN = ({ options = [], value, onChange, className, height = 'h-[40px] py-1', roundedness = 'rounded-lg' }) => {
  return (
    <div
      className={cn(
        height,
        'flex flex-row items-stretch justify-center gap-px',
        'bg-black/[0.04]',
        roundedness,
        className,
      )}
    >
      {options.map((option) => {
        const isSelected = value === option.value
        const Icon = option.icon

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'w-auto px-2 flex items-center justify-center gap-1.5',
              'transition-all duration-150 ease-out rounded-[6px]',
              'active:scale-[0.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-1',
              isSelected
                ? 'bg-white text-brand-primary shadow-sm border border-black/[0.06]'
                : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-black/[0.02]',
            )}
          >
            <TypographyBody
              className={cn(
                'flex items-center gap-1.5 text-[14px] font-medium',
                isSelected ? 'text-brand-primary' : 'text-inherit',
              )}
            >
              {Icon && (
                <Icon
                  size={18}
                  className={cn('shrink-0', isSelected ? 'text-brand-primary' : 'text-muted-foreground')}
                />
              )}
              <span>{option.label}</span>
              {option.count !== undefined && option.count !== null && (
                <span
                  className={cn(
                    'font-semibold px-1.5 py-0.5 rounded-md text-[11px] min-w-[18px] text-center',
                    isSelected
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'bg-black/[0.06] text-muted-foreground',
                  )}
                >
                  {option.count}
                </span>
              )}
            </TypographyBody>
          </button>
        )
      })}
    </div>
  )
}

export default ToggleGroupCN

