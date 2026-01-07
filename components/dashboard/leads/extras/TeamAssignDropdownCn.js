'use client'

import { ChevronDown, Users, Circle } from 'lucide-react'
import { useMemo } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TypographyBody } from './TypographyCN'

/**
 * Team-only assign dropdown with radio buttons
 * teamOptions: [{ id, label, avatar, selected }]
 * onToggle: (teamId, team, isSelected) => void - called when a team is toggled
 */
const TeamAssignDropdownCn = ({
  label = 'Assign',
  teamOptions = [],
  onToggle,
}) => {
  const selectedTeams = useMemo(
    () => teamOptions.filter((opt) => opt.selected),
    [teamOptions],
  )

  const handleTeamClick = (team) => {
    const teamId = String(team.id)
    const isCurrentlySelected = team.selected
    
    // Toggle: if selected, unassign; if not selected, assign
    onToggle?.(teamId, team, !isCurrentlySelected)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center rounded-xl border border-muted/70 bg-white px-4 py-2 text-base font-semibold shadow-sm focus:outline-none">
          <Users className="mr-2 h-4 w-4" />
          <span>{label}</span>
          {selectedTeams.length > 0 && (
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
              {selectedTeams.length}
            </span>
          )}
          <span className="mx-3 h-6 w-px bg-muted/80" />
          <ChevronDown className="h-4 w-4 text-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="z-[2000] w-64 border border-muted/70 bg-white text-foreground shadow-lg px-1 max-h-[300px] overflow-y-auto"
      >
        <DropdownMenuLabel className="px-2 text-sm font-semibold text-muted-foreground">
          Team
        </DropdownMenuLabel>
        {teamOptions.length > 0 ? (
          teamOptions.map((team) => {
            const isSelected = team.selected

            return (
              <DropdownMenuItem
                key={team.id}
                className="gap-2 px-2 justify-end pl-8 text-brand-primary hover:text-brand-primary cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault()
                  handleTeamClick(team)
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
                  {team.avatar ? (
                    <img
                      src={team.avatar}
                      alt={team.label}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      {team.label?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <TypographyBody className="text-black">{team.label}</TypographyBody>
                </div>
              </DropdownMenuItem>
            )
          })
        ) : (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">No team members</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TeamAssignDropdownCn
