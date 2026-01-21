'use client'

import React, { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/**
 * Reusable Slider Component using ShadCN
 * 
 * @param {Object} props
 * @param {number} props.value - Current slider value
 * @param {Function} props.onValueChange - Callback when value changes: (value: number[]) => void
 * @param {number} props.min - Minimum value (default: 0)
 * @param {number} props.max - Maximum value (default: 100)
 * @param {number} props.step - Step increment (default: 1)
 * @param {string} props.label - Label text displayed above the slider
 * @param {string} props.description - Description text displayed below the label
 * @param {ReactNode|string} props.icon - Icon component (ReactNode) or SVG path (string) to display
 * @param {string} props.unit - Unit to display with min/max and value (e.g., "sec", "min") (default: "")
 * @param {Function} props.onInputChange - Optional callback when input value changes (allows typing values outside range): (value: string) => void
 * @param {string} props.className - Optional className for the container
 */
const SliderCN = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  description,
  icon,
  unit = '',
  className,
  onInputChange,
}) => {
  const [inputValue, setInputValue] = useState(value)

  // Sync input value when prop value changes (from slider)
  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleInputChange = (e) => {
    const inputVal = e.target.value
    setInputValue(inputVal)
    
    // Allow typing any value, but call onInputChange if provided for validation
    if (onInputChange) {
      onInputChange(inputVal)
    } else {
      // Default behavior: parse and clamp
      const newValue = parseInt(inputVal) || 0
      const clampedValue = Math.max(min, Math.min(max, newValue))
      onValueChange([clampedValue])
    }
  }

  const handleInputBlur = (e) => {
    // On blur, clamp the value to valid range
    const newValue = parseInt(e.target.value) || min
    const clampedValue = Math.max(min, Math.min(max, newValue))
    setInputValue(clampedValue)
    onValueChange([clampedValue])
  }

  const renderIcon = () => {
    if (!icon) return null

    // If icon is a string (SVG path), render with mask image
    if (typeof icon === 'string') {
      return (
        <div
          style={{
            width: 24,
            height: 24,
            backgroundColor: 'currentColor',
            WebkitMaskImage: `url(${icon})`,
            maskImage: `url(${icon})`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
          className="text-foreground"
        />
      )
    }

    // If icon is a React component, render it
    if (React.isValidElement(icon)) {
      return icon
    }

    return null
  }

  const formatValue = (val) => {
    return unit ? `${val} (${unit})` : val.toString()
  }

  return (
    <div className={cn('w-full space-y-3', className)}>
      {/* Header with icon, label, and description */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {icon && renderIcon()}
          {label && (
            <Label className="text-base font-semibold text-foreground">
              {label}
            </Label>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Slider and value input */}
      <div className="flex items-center gap-4">
        {/* Slider */}
        <div className="flex-1">
          <Slider
            value={[value]}
            onValueChange={onValueChange}
            min={min}
            max={max}
            step={step}
            className="w-full"
          />
        </div>

        {/* Min/Max labels */}
        <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground min-w-[80px]">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>

        {/* Current value input */}
        <div className="w-20">
          <Input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={(e) => {
              // Select text when input receives focus
              e.target.select()
            }}
            min={min}
            max={max}
            step={step}
            className="h-9 rounded-lg text-center font-medium text-foreground"
          />
        </div>
      </div>
    </div>
  )
}

export default SliderCN
