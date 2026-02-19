'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { TypographyCaption } from '@/lib/typography'

/**
 * Reusable CC/BCC Button Group Component
 * Uses ButtonGroup to create connected buttons like arrow buttons
 * 
 * @param {Object} props
 * @param {Array<{label: string, isSelected: boolean, onClick: function}>} props.buttons - Array of button configs
 * @param {string} props.className - Optional additional classes
 */
const SplitButtonCN = ({ buttons = [], className }) => {
  if (buttons.length === 0) return null

  return (
    <ButtonGroup className={cn('gap-1', className)}>
      {buttons.map((button, index) => (
        <Button
          key={index}
          variant="outline"
          onClick={button.onClick}
          className={cn(
            "w-10 h-10 p-0 flex items-center justify-center border-0 border-r border-gray-200 last:border-r-0 rounded-[4px] first:rounded-l-[4px] last:rounded-r-[4px]",
            button.isSelected 
              ? "bg-brand-primary text-white hover:bg-brand-primary/90 hover:text-white border-brand-primary" 
              : "bg-white hover:bg-gray-50"
          )}
        >
          <TypographyCaption className={cn('text-[14px]', button.isSelected ? 'text-white' : 'text-gray-700')}>
            {button.label}
          </TypographyCaption>
        </Button>
      ))}
    </ButtonGroup>
  )
}

export default SplitButtonCN

