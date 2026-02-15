'use client'

import React from 'react'
import { Circle } from 'lucide-react'
import { TypographyBody } from '@/components/dashboard/leads/extras/TypographyCN'

/**
 * Team list with radio-style selection; assign/unassign via onToggle(teamId, team, shouldAssign).
 */
export default function TeamsTabContent({ teamOptions = [], onToggle }) {
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
    <div className="max-h-[220px] overflow-y-auto space-y-0.5">
      {teamOptions.map((team) => {
        const isSelected = team.selected
        return (
          <button
            key={team.id}
            type="button"
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/70 cursor-pointer text-left"
            onClick={() => handleTeamClick(team)}
          >
            <span className="relative flex h-3.5 w-3.5 items-center justify-center shrink-0">
              <Circle
                className={`h-3.5 w-3.5 stroke-current stroke-2 fill-none ${
                  isSelected ? 'text-brand-primary' : 'text-muted-foreground'
                }`}
              />
              {isSelected && (
                <Circle className="absolute h-2 w-2 fill-current text-brand-primary" />
              )}
            </span>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {team.avatar ? (
                <img
                  src={team.avatar}
                  alt={team.label}
                  className="h-6 w-6 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                  {team.label?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <TypographyBody className="text-black truncate">{team.label}</TypographyBody>
            </div>
          </button>
        )
      })}
    </div>
  )
}
