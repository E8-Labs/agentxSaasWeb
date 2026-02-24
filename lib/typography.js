/**
 * Global Typography System - Agency Design System
 * Based on Agency typography specifications
 * Usage: import { TypographyH1, TypographyBody, etc. } from '@/lib/typography'
 */

import React from 'react'
import { cn } from '@/lib/utils'

// Base Typography Component Factory
const createTypography = (baseStyles, defaultTag = 'div') => {
  return React.forwardRef(({ children, className = '', as, ...props }, ref) => {
    const Component = as || defaultTag
    return (
      <Component
        ref={ref}
        className={cn(baseStyles, className)}
        {...props}
      >
        {children}
      </Component>
    )
  })
}

// Agency Headings (Semibold by default)
export const TypographyH1 = createTypography('text-[28px] leading-[36px] font-semibold', 'h1')
TypographyH1.displayName = 'TypographyH1'

export const TypographyH2 = createTypography('text-[22px] leading-[30px] font-semibold', 'h2')
TypographyH2.displayName = 'TypographyH2'

export const TypographyH3 = createTypography('text-[18px] leading-[25px] font-semibold', 'h3')
TypographyH3.displayName = 'TypographyH3'

export const TypographyH4 = createTypography('text-[16px] leading-[22px] font-semibold', 'h4')
TypographyH4.displayName = 'TypographyH4'

// Agency Body (14px with auto line height - using normal which is ~1.5)
export const TypographyBody = createTypography('text-[14px] leading-normal font-normal', 'div')
TypographyBody.displayName = 'TypographyBody'

export const TypographyBodySemibold = createTypography('text-[14px] leading-normal font-semibold', 'div')
TypographyBodySemibold.displayName = 'TypographyBodySemibold'

// Agency Caption (14px per design feedback)
export const TypographyCaption = createTypography('text-[14px] leading-[20px] font-normal', 'div')
TypographyCaption.displayName = 'TypographyCaption'

export const TypographyCaptionSemibold = createTypography('text-[14px] leading-[20px] font-semibold', 'div')
TypographyCaptionSemibold.displayName = 'TypographyCaptionSemibold'

// Agency Input (for form inputs)
export const TypographyInput = createTypography('text-[14px] leading-[20px] font-normal', 'div')
TypographyInput.displayName = 'TypographyInput'

// Agency Button Text
export const TypographyButtonText = createTypography('text-[14px] leading-[18px] font-normal', 'div')
TypographyButtonText.displayName = 'TypographyButtonText'

// Title (using H3 sizing for compatibility)
export const TypographyTitle = createTypography('text-[18px] leading-[25px] font-medium', 'div')
TypographyTitle.displayName = 'TypographyTitle'

export const TypographyTitleSemibold = createTypography('text-[18px] leading-[25px] font-semibold', 'div')
TypographyTitleSemibold.displayName = 'TypographyTitleSemibold'

// Body Medium (for buttons and medium weight text)
export const TypographyBodyMedium = createTypography('text-[14px] leading-normal font-medium', 'div')
TypographyBodyMedium.displayName = 'TypographyBodyMedium'

// Legacy support - keeping old names but with Agency sizing
export const TypographyH1Semibold = TypographyH1
export const TypographyH2Semibold = TypographyH2
export const TypographyH3Semibold = TypographyH3
export const TypographyH4Semibold = TypographyH4
export const TypographyH5 = TypographyH3
export const TypographyH5Semibold = TypographyH3
export const TypographyTitleMedium = TypographyTitle
export const TypographyCaptionMedium = TypographyCaption

// Alert (keeping for backward compatibility)
export const TypographyAlert = createTypography('text-[10px] leading-[120%] font-normal', 'div')
TypographyAlert.displayName = 'TypographyAlert'

export const TypographyAlertSemibold = createTypography('text-[10px] leading-[120%] font-semibold', 'div')
TypographyAlertSemibold.displayName = 'TypographyAlertSemibold'

