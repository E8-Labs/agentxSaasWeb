'use client'

import React, { useMemo } from 'react'
import { ChevronDown, Users, Bot, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import TeamsTabContent from './TeamsTabContent'
import AgentsListForThread from './AgentsListForThread'
import SettingsTabContent from './SettingsTabContent'

/**
 * Thread options dropdown with three tabs: Teams | Agents | Settings.
 * Replaces the single "Team" dropdown in the conversation header.
 *
 * Props:
 * - selectedThread: { id (threadId), leadId, selectedAgentId }
 * - teamOptions: [{ id, label, avatar, selected, raw }]
 * - leadSettings: { autoReplyDisabled, cadenceDisabled, pendingCallsCount }
 * - selectedUser: for API context
 * - onToggle: (teamId, team, shouldAssign) for team assign/unassign
 * - onSettingsUpdate: (updatedSettings) when lead settings change
 * - onThreadUpdated: (updatedThread) when thread is updated (e.g. selectedAgentId)
 */
export default function ThreadOptionsDropdown({
  label = 'Team',
  selectedThread,
  teamOptions = [],
  leadSettings = null,
  selectedUser = null,
  onToggle,
  onSettingsUpdate,
  onThreadUpdated,
  withoutBorder = false,
}) {
  const selectedTeams = useMemo(
    () => teamOptions.filter((opt) => opt.selected),
    [teamOptions],
  )

  const threadId = selectedThread?.id ?? selectedThread?.threadId
  const leadId = selectedThread?.leadId
  const selectedAgentId = selectedThread?.selectedAgentId ?? null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center ${
            withoutBorder ? '' : 'shadow-sm border px-4 py-2 border-muted/70 rounded-xl '
          } bg-white text-base font-semibold focus:outline-none`}
        >
          {selectedTeams.length > 0 ? (
            <div className="flex items-center -space-x-2">
              {selectedTeams.slice(0, 3).map((team, index) => (
                <div
                  key={team.id || index}
                  className="relative rounded-full -mr-2"
                  style={{ zIndex: selectedTeams.length - index }}
                >
                  {team.avatar ? (
                    <img
                      src={team.avatar}
                      alt={team.label}
                      className="w-5 h-5 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-semibold border-2 border-white">
                      {team.label?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
              ))}
              {selectedTeams.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-semibold border-2 border-white">
                  +{selectedTeams.length - 3}
                </div>
              )}
            </div>
          ) : (
            <>
              <Users className="mr-2 h-4 w-4" />
              <span>{label}</span>
            </>
          )}
          {withoutBorder ? null : (
            <span className="mx-3 h-6 w-px bg-muted/80" />
          )}
          <ChevronDown className={`${withoutBorder ? 'ml-4' : ''} h-4 w-4 text-foreground`} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="z-[2000] w-72 border border-muted/70 bg-white text-foreground shadow-lg p-2 max-h-[360px] overflow-hidden flex flex-col"
      >
        <Tabs defaultValue="teams" className="flex flex-col flex-1 min-h-0">
          <TabsList className="grid w-full grid-cols-3 shrink-0">
            <TabsTrigger value="teams" className="text-xs gap-1">
              <Users className="h-3.5 w-3.5" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="agents" className="text-xs gap-1">
              <Bot className="h-3.5 w-3.5" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs gap-1">
              <Settings className="h-3.5 w-3.5" />
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="teams" className="flex-1 mt-2 min-h-0 overflow-auto">
            <TeamsTabContent teamOptions={teamOptions} onToggle={onToggle} />
          </TabsContent>
          <TabsContent value="agents" className="flex-1 mt-2 min-h-0 overflow-auto">
            {threadId ? (
              <AgentsListForThread
                selectedUser={selectedUser}
                selectedAgentId={selectedAgentId}
                threadId={threadId}
                onSelectionSaved={onThreadUpdated}
              />
            ) : (
              <div className="px-2 py-3 text-sm text-muted-foreground">
                Select a conversation to choose an agent.
              </div>
            )}
          </TabsContent>
          <TabsContent value="settings" className="flex-1 mt-2 min-h-0 overflow-auto">
            <SettingsTabContent
              leadId={leadId}
              leadSettings={leadSettings}
              onSettingsUpdate={onSettingsUpdate}
            />
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
