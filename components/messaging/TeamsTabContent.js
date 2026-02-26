'use client'

import React, { useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { TypographyBody } from '@/components/dashboard/leads/extras/TypographyCN'

/**
 * Team list with radio-style selection; assign/unassign via onToggle(teamId, team, shouldAssign).
 */
export default function TeamsTabContent({ teamOptions = [], onToggle }) {
  const listWrapRef = useRef(null)
  const [pill, setPill] = useState({ top: 0, height: 0 })
  const [pillVisible, setPillVisible] = useState(false)

  const handleListMouseMove = (e) => {
    const wrap = listWrapRef.current
    if (!wrap) return
    const item = e.target?.closest?.('[data-sliding-pill-item]')
    if (item) {
      const r = item.getBoundingClientRect()
      const wrapRect = wrap.getBoundingClientRect()
      setPill({ top: r.top - wrapRect.top + wrap.scrollTop, height: r.height })
      setPillVisible(true)
    }
  }
  const handleListMouseLeave = () => setPillVisible(false)

  const handleTeamClick = (team) => {
    const teamId = String(team.id)
    const isCurrentlySelected = team.selected
    onToggle?.(teamId, team, !isCurrentlySelected)
  }

  if (teamOptions.length === 0) {
    return (
      <div className="px-2 py-3 text-sm text-muted-foreground">
        No team members
      </div>
    )
  }

  return (
    <div className="p-2 rounded-lg">
    <div ref={listWrapRef} className="relative max-h-[220px] overflow-y-hidden space-y-0.5" onMouseMove={handleListMouseMove} onMouseLeave={handleListMouseLeave}>
      {pillVisible && (
        <div
          className="absolute left-1 right-1 rounded-lg bg-black/[0.02] transition-[top,height] duration-150 ease-out pointer-events-none"
          style={{ top: pill.top, height: pill.height }}
        />
      )}
      {teamOptions.map((team) => {
        const isSelected = team.selected
        return (
          <div key={team.id} data-sliding-pill-item>
          <button
            type="button"
            className="h-10 w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md hover:bg-transparent cursor-pointer text-left"
            style={isSelected ? { backgroundColor: 'hsl(var(--brand-primary) / 0.05)' } : undefined}
            onClick={() => handleTeamClick(team)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {team.avatar ? (
                <img
                  src={team.avatar}
                  alt={team.label}
                  className="h-8 w-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                  {team.label?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <TypographyBody className={`text-sm truncate ${isSelected ? 'text-brand-primary font-medium' : 'text-black'}`}>{team.label}</TypographyBody>
            </div>
            {isSelected && (
              <Check className="h-4 w-4 shrink-0 text-brand-primary" aria-hidden />
            )}
          </button>
          </div>
        )
      })}
    </div>
    </div>
  )
}
