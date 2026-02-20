'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { TypographyBody } from '@/lib/typography'

/**
 * Reusable Toggle Group Component
 * Used for toggle buttons like All/Unreplied, SMS/Email, etc.
 * 
 * @param {Object} props
 * @param {Array<{label: string, value: string, count?: number, icon?: React.ComponentType}>} props.options - Array of toggle options
 * @param {string} props.value - Currently selected value
 * @param {function} props.onChange - Callback when selection changes (value: string) => void
 * @param {string} props.className - Optional additional classes
 * @param {string} props.height - Optional height class (e.g., 'p-1', 'p-2', 'p-1.5')
 * @param {string} props.roundedness - Optional roundedness class (e.g., 'rounded-lg', 'rounded-xl', 'rounded-md')
 */
const ToggleGroupCN = ({ options = [], value, onChange, className, height = 'p-2', roundedness = 'rounded-full' }) => {
  return (
    <div
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
      }}
      className={cn(height, "flex flex-row items-center justify-center gap-2", roundedness, className)}
    >
      {options.map((option) => {

        const isSelected = value === option.value
        const Icon = option.icon

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "px-2 py-1 transition-colors",
              isSelected ? 'bg-white text-brand-primary' : 'bg-transparent text-black',
              isSelected ? 'rounded-lg' : 'rounded-none',
              isSelected && 'shadow-[0_2px_4px_rgba(0,0,0,0.06)]'
            )}
          >
            <TypographyBody className="flex items-center gap-2">
              {Icon && (
                <Icon 
                  size={18} 
                  className={isSelected ? 'text-brand-primary' : 'text-black'} 
                />
              )}
              <span>{option.label}</span>
              {option.count !== undefined && option.count !== null && (
                <span
                  style={{
                    backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
                  }}
                  className={`${isSelected ? 'text-brand-primary' : 'text-black'} font-bold px-1 rounded-full`}
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

