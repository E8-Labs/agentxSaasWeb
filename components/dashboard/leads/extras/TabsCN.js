'use client'

import React from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TypographyBody } from '@/lib/typography'
import { cn } from '@/lib/utils'

/**
 * Reusable Tab Component using shadCN
 * 
 * @param {Object} props
 * @param {Array<{id: string, label: string, icon: ReactNode|string, activeIcon?: ReactNode|string, iconSize?: number}}> props.tabs - Array of tab items
 *   - id: Unique identifier for the tab
 *   - label: Display text for the tab
 *   - icon: Icon component (ReactNode) or SVG path (string) for inactive state
 *   - activeIcon: Optional icon component (ReactNode) or SVG path (string) for active state. If not provided, uses icon with brand color
 *   - iconSize: Optional size for SVG mask icons (default: 24)
 * @param {string} props.value - Current active tab ID
 * @param {Function} props.onValueChange - Callback when tab changes: (value: string) => void
 * @param {string} props.className - Optional className for the tabs container
 */
const TabsCN = ({ tabs, value, onValueChange, className }) => {
  const renderIcon = (tab, isActive) => {
    // If icon is a string (SVG path), render with mask image
    if (typeof tab.icon === 'string') {
      const iconSize = tab.iconSize || 24
      const activeIconPath = tab.activeIcon || tab.icon
      const inactiveIconPath = tab.icon
      const iconPath = isActive ? activeIconPath : inactiveIconPath
      
      return (
        <div
          style={{
            width: iconSize,
            height: iconSize,
            backgroundColor: isActive ? 'hsl(var(--brand-primary))' : '#000000',
            WebkitMaskImage: `url(${iconPath})`,
            maskImage: `url(${iconPath})`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
      )
    }
    
    // If icon is a React component, render it with appropriate color
    if (isActive && tab.activeIcon) {
      return (
        <div className="text-brand-primary">
          {tab.activeIcon}
        </div>
      )
    }
    
    // Default: render icon with conditional color
    const IconComponent = tab.icon
    if (React.isValidElement(IconComponent)) {
      return React.cloneElement(IconComponent, {
        className: cn(
          IconComponent.props?.className,
          isActive ? 'text-brand-primary' : 'text-foreground'
        ),
      })
    }
    
    return (
      <div className={isActive ? 'text-brand-primary' : 'text-foreground'}>
        {IconComponent}
      </div>
    )
  }

  return (
    <Tabs value={value} onValueChange={onValueChange} className={cn('w-full mt-0', className)}>
      <TabsList className="w-full flex flex-row items-center justify-between gap-2 bg-transparent p-0 h-auto rounded-none border-b [&>*]:flex-1 mt-0" style={{ borderBottomColor: '#eaeaea' }}>
        {tabs.map((tab) => {
          const isActive = value === tab.id
          
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                'flex flex-row items-center gap-2 h-10 px-3 rounded-none border-b-2 border-transparent bg-transparent shadow-none',
                'border-0 border-b-2',
                'data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                'data-[state=active]:text-brand-primary',
                'text-foreground',
                'hover:bg-muted/50',
                'outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
              )}
            >
              {/* Icon */}
              {renderIcon(tab, isActive)}
              
              {/* Label */}
              <TypographyBody className={cn(
                isActive ? 'text-brand-primary' : 'text-foreground'
              )}>
                {tab.label}
              </TypographyBody>
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}

export default TabsCN

