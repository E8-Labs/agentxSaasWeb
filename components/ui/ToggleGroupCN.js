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
const ToggleGroupCN = ({ options = [], value, onChange, className, height = 'p-1', roundedness = 'rounded-xl' }) => {
  return (
    <div
      style={{
        backgroundColor: 'rgba(0,0,0,0.05)',
      }}
      className={cn(height, "flex flex-row items-center justify-center gap-2", roundedness, className)}
    >
      {options.map((option) => {
        // console.log("toggle group action btn option is",value)
        // console.log("toggle group action btn option is compare su",option.value)
        const isSelected = value === option.value
        const Icon = option.icon
        
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "w-auto px-3 py-1 transition-colors active:scale-[0.98]",
              isSelected ? 'rounded-lg bg-white text-brand-primary shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#eaeaea]' : 'rounded-none bg-transparent text-black',
            )}
            style={isSelected ? { borderWidth: '0.5px' } : undefined}
          >
            <TypographyBody className={cn("flex items-center gap-2 text-[14px] font-normal", isSelected ? 'text-brand-primary' : 'text-black/80')}>
              {Icon && (
                <Icon 
                  size={20} 
                  className={isSelected ? 'text-brand-primary' : 'text-black/80'} 
                />
              )}
              <span>{option.label}</span>
              {option.count !== undefined && option.count !== null && (
                <span
                  style={{
                    backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
                  }}
                  className={cn("font-bold px-1 rounded-full", isSelected ? 'text-brand-primary' : 'text-black/80')}
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

