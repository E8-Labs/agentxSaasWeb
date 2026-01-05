'use client'

import { ChevronDown, Users, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { getAgentsListImage } from '@/utilities/agentUtilities'
import { TypographyBody, TypographyBodySemibold } from './TypographyCN'

/**
 * Assign dropdown with AI Agents and Team sections
 * agents: [{ id, name, thumb_profile_image, ... }]
 * teamOptions: [{ id, label, avatar, selected }]
 * selectedValue: { type: 'agent' | 'team', id: string }
 * onSelect: (type, id, item) => void
 * onCreateAgent: () => void
 */
const AssignDropdownCn = ({
  label = 'Assign',
  agents = [],
  teamOptions = [],
  selectedValue = null,
  onSelect,
  onCreateAgent,
}) => {
  const router = useRouter()

  const handleCreateAgent = () => {
    if (onCreateAgent) {
      onCreateAgent()
    } else {
      // Default: navigate to create agent page
      router.push('/createagent')
    }
  }

  const selectedItem = useMemo(() => {
    if (!selectedValue) return null

    if (selectedValue.type === 'agent') {
      const agent = agents.find((a) => String(a.id || a.agentId) === String(selectedValue.id))
      return agent ? { type: 'agent', item: agent, label: agent?.name || agent?.agentName || 'Agent' } : null
    } else if (selectedValue.type === 'team') {
      const team = teamOptions.find((t) => String(t.id) === String(selectedValue.id))
      return team ? { type: 'team', item: team, label: team?.label || 'Team Member' } : null
    }
    return null
  }, [selectedValue, agents, teamOptions])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center rounded-xl border border-muted/70 bg-white px-4 py-2 text-base font-semibold shadow-sm focus:outline-none">
          {!selectedValue && (
            <>
              <Users className="mr-2 h-4 w-4" />
              <span>{label}</span>
            </>
          )}
          {selectedItem && (
            <div className="flex items-center gap-2">
              {selectedItem.type === 'agent' && (
                <div className="h-6 w-6 flex-shrink-0">
                  {getAgentsListImage(selectedItem.item, 24, 24)}
                </div>
              )}
              {selectedItem.type === 'team' && (
                <>
                  {selectedItem.item.avatar ? (
                    <img
                      src={selectedItem.item.avatar}
                      alt={selectedItem.label}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      {selectedItem.label?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </>
              )}
              <span className="px-2 py-0.5 text-xs font-semibold text-foreground">
                {selectedItem.label}
              </span>
            </div>
          )}
          <span className="mx-3 h-6 w-px " />
          <ChevronDown className="h-4 w-4 text-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="z-[2000] w-64 border border-muted/70 bg-white text-foreground shadow-lg px-1"
      >
        <DropdownMenuRadioGroup
          value={
            selectedValue
              ? `${selectedValue.type}-${String(selectedValue.id)}`
              : undefined
          }
          onValueChange={(value) => {
            if (value && value.startsWith('agent-')) {
              const agentId = value.replace('agent-', '')
              const agent = agents.find((a) => String(a.id || a.agentId) === String(agentId))
              if (agent) {
                onSelect?.('agent', agentId, agent)
              }
            } else if (value && value.startsWith('team-')) {
              const teamId = value.replace('team-', '')
              const team = teamOptions.find((t) => String(t.id) === String(teamId))
              if (team) {
                onSelect?.('team', teamId, team)
              }
            }
          }}
        >
          {/* AI Agents Section */}
          <DropdownMenuLabel className="px-2 text-sm font-semibold text-muted-foreground">
            AI Agents
          </DropdownMenuLabel>
          {agents.length > 0 ? (
            agents.map((agent) => {
              const agentId = agent.id || agent.agentId
              const value = `agent-${agentId}`

              const isSelected = selectedValue?.type === 'agent' && String(selectedValue.id) === String(agentId)

              return (
                <DropdownMenuRadioItem
                  key={agentId}
                  value={value}
                  className="gap-2 px-2 justify-end pl-8 text-brand-primary hover:text-brand-primary"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="h-6 w-6 flex-shrink-0">
                      {getAgentsListImage(agent, 24, 24)}
                    </div>
                    <TypographyBody className="text-black">{agent.name || agent.agentName || 'Agent'}</TypographyBody>
                  </div>
                </DropdownMenuRadioItem>
              )
            })
          ) : (
            <TypographyBody className="px-2 py-1.5 text-sm text-muted-foreground">No agents available</TypographyBody>
          )}

          {/* Create AI Agent Option */}
          <button
            type="button"
            onClick={handleCreateAgent}
            className="w-full px-2 py-1.5 flex items-center gap-2 text-brand-primary hover:bg-muted/50 rounded-sm transition-colors"
          >
           <Image src="/messaging/aiIcon.svg" alt="Create AI Agent" width={24} height={24} />
            <TypographyBodySemibold className="text-brand-primary">Create AI Agent</TypographyBodySemibold>
          </button>

          <DropdownMenuSeparator />

          {/* Team Section */}
          <DropdownMenuLabel className="px-2 text-sm font-semibold text-muted-foreground">
            Team
          </DropdownMenuLabel>
          {teamOptions.length > 0 ? (
            teamOptions.map((team) => {
              const value = `team-${team.id}`

              const isSelected = selectedValue?.type === 'team' && String(selectedValue.id) === String(team.id)

              return (
                <DropdownMenuRadioItem
                  key={team.id}
                  value={value}
                  className="gap-2 px-2 justify-end pl-8 text-brand-primary hover:text-brand-primary"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {team.avatar ? (
                      <img
                        src={team.avatar}
                        alt={team.label}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-centertext-xs font-bold">
                        {team.label?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <TypographyBody className="text-black">{team.label}</TypographyBody>
                  </div>
                </DropdownMenuRadioItem>
              )
            })
          ) : (
            <TypographyBody className="px-2 py-1.5 text-sm text-muted-foreground">No team members</TypographyBody>
          )}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AssignDropdownCn

