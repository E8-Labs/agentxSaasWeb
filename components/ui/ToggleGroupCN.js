'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { TypographyBody } from '@/lib/typography'

/**
 * Reusable Toggle Group Component
 * Firecrawl-style segmented control: light gray container, selected item
 * "pops" with white background and soft shadow, unselected with hover feedback.
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
        'flex flex-row items-stretch justify-center gap-0',
        'bg-black/[0.06]',
        roundedness,
        'shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-1',
        className,
      )}
    >
      {options.map((option, index) => {
        const isSelected = value === option.value
        const Icon = option.icon

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'w-auto px-2 flex items-center justify-center gap-1.5 min-w-0',
              'transition-all duration-150 ease-out rounded-md',
              'active:scale-[0.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-1',
              index > 0 && 'border-l border-black/[0.08]',
              isSelected
                ? 'bg-white text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]'
                : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-black/[0.04]',
            )}
          >
            <TypographyBody
              className={cn(
                'flex items-center gap-1.5 text-[14px]',
                isSelected ? 'font-medium text-foreground' : 'font-medium text-inherit',
              )}
            >
              {Icon && (
                <Icon
                  size={18}
                  className={cn('shrink-0', isSelected ? 'text-brand-primary' : 'text-inherit')}
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

