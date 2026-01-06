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
 */
const ToggleGroupCN = ({ options = [], value, onChange, className }) => {
  return (
    <div
      style={{
        backgroundColor: 'hsl(var(--brand-primary) / 0.05)',
      }}
      className={cn("p-2 rounded-xl flex flex-row items-center justify-center gap-2", className)}
    >
      {options.map((option) => {
        const isSelected = value === option.value
        const Icon = option.icon
        
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "px-2 py-1 rounded-lg transition-colors",
              isSelected ? 'bg-white' : 'bg-transparent text-brand-primary'
            )}
          >
            <TypographyBody className="flex items-center gap-2">
              {Icon && (
                <Icon 
                  size={20} 
                  className={isSelected ? 'text-brand-primary' : 'text-brand-primary'} 
                />
              )}
              <span>{option.label}</span>
              {option.count !== undefined && option.count !== null && (
                <span
                  style={{
                    backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
                  }}
                  className="text-brand-primary font-bold px-1 rounded-full"
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

