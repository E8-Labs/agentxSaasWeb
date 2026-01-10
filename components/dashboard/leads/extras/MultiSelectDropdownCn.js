'use client'

import { ChevronDown, Users, Circle } from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TypographyBody } from './TypographyCN'

/**
 * Pill-shaped multi-select dropdown for assigning team members.
 * options: [{ id, label, avatar, selected }]
 */
const MultiSelectDropdownCn = ({ label = 'Assign', options = [], onToggle }) => {
  const [open, setOpen] = useState(false)
  
  const selectedCount = useMemo(
    () => options.filter((opt) => opt.selected).length,
    [options],
  )

  const handleOptionClick = (opt) => {
    const isCurrentlySelected = opt.selected
    onToggle?.(opt, !isCurrentlySelected)
  }

  // Handle open change to prevent modal closing when dropdown closes
  const handleOpenChange = (newOpen, event) => {
    // Prevent event from propagating when toggling dropdown
    if (event) {
      event.stopPropagation()
    }
    setOpen(newOpen)
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button 
          className="flex items-center rounded-lg border border-gray-300 bg-white px-2 py-2 text-base font-regular shadow-sm focus:outline-none hover:bg-gray-50 h-[36px]"
          style={{ cursor: 'pointer' }}
          onMouseDown={(e) => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MultiSelectDropdownCn.js:47',message:'MultiSelect trigger mousedown',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            // Prevent event from bubbling up to modal close handler
            e.stopPropagation()
          }}
          onClick={(e) => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MultiSelectDropdownCn.js:52',message:'MultiSelect trigger click',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            // Prevent event from bubbling up to modal close handler
            e.stopPropagation()
          }}
        >
          {selectedCount > 0 && options.find(opt => opt.selected) ? (
            <>
              {options.find(opt => opt.selected)?.avatar ? (
                <img
                  src={options.find(opt => opt.selected).avatar}
                  alt={options.find(opt => opt.selected).label}
                  className="w-5 h-5 rounded-full object-cover mr-1"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-semibold mr-1">
                  {options.find(opt => opt.selected)?.label?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <TypographyBody className="text-sm text-foreground">
                {options.find(opt => opt.selected)?.label || label}
              </TypographyBody>
            </>
          ) : (
            <>
              <Users className="mr-1 h-4 w-4 text-muted-foreground" />
              <TypographyBody className="text-sm text-foreground">
                <span>{label}</span>
              </TypographyBody>
            </>
          )}
          <span className="mx-2 h-5 w-px bg-gray-300" />
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="z-[2000] w-64 border border-muted/70 bg-white text-foreground shadow-lg px-1 max-h-[300px] overflow-y-auto"
        onInteractOutside={(e) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MultiSelectDropdownCn.js:88',message:'MultiSelect onInteractOutside',data:{targetTag:e.target.tagName},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v4',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          // Only prevent if clicking inside the task board (to prevent modal from closing)
          // Otherwise, let the dropdown close normally
          const taskBoard = document.querySelector('[data-task-board]')
          if (taskBoard && taskBoard.contains(e.target)) {
            e.preventDefault()
          }
        }}
      >
        <DropdownMenuLabel className="px-2 text-sm font-semibold text-muted-foreground">
          Assign agents
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.length ? (
          options.map((opt) => {
            const isSelected = opt.selected

            return (
              <DropdownMenuItem
                key={opt.id || opt.value || opt.label}
                className="gap-2 px-2 justify-end pl-8 text-brand-primary hover:text-brand-primary cursor-pointer relative"
                onSelect={(e) => {
                  e.preventDefault()
                  handleOptionClick(opt)
                }}
              >
                {/* Radio button indicator */}
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  <Circle 
                    className={`h-3.5 w-3.5 stroke-current stroke-2 fill-none ${
                      isSelected ? 'text-brand-primary' : 'text-muted-foreground'
                    }`} 
                  />
                  {isSelected && (
                    <Circle className="absolute h-2 w-2 fill-current text-brand-primary" />
                  )}
                </span>
                
                <div className="flex items-center gap-2 flex-1">
                  {opt.avatar ? (
                    <img
                      src={opt.avatar}
                      alt={opt.label}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      {opt.label?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <TypographyBody className="text-black">{opt.label}</TypographyBody>
                </div>
              </DropdownMenuItem>
            )
          })
        ) : (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">No agents</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MultiSelectDropdownCn
