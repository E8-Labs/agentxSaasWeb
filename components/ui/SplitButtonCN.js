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
    <ButtonGroup className={cn('gap-1 rounded-lg', className)}>
      {buttons.map((button, index) => (
        <Button
          key={index}
          variant="outline"
          onClick={button.onClick}
          className={cn(
            "h-8 min-w-[2rem] px-3 p-0 flex items-center justify-center border-0 border-r border-gray-200 last:border-r-0 rounded-none first:rounded-l-lg last:rounded-r-lg",
            button.isSelected 
              ? "bg-black/5 text-brand-primary hover:bg-black/10 border-transparent" 
              : "bg-transparent hover:bg-black/[0.02]"
          )}
        >
          <TypographyCaption className={cn('text-[14px]', button.isSelected ? 'text-brand-primary' : 'text-gray-700')}>
            {button.label}
          </TypographyCaption>
        </Button>
      ))}
    </ButtonGroup>
  )
}

export default SplitButtonCN

