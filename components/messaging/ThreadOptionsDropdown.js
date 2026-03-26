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
 * When composerMode is 'facebook' or 'instagram' (FB/IG DM tab), the Agents tab
 * shows the social agent (socialSelectedAgentId) as selected and saves to message settings.
 * Otherwise it shows the thread's selectedAgentId and saves to the thread.
 *
 * Props:
 * - selectedThread: { id (threadId), leadId, selectedAgentId }
 * - composerMode: 'sms' | 'email' | 'facebook' | 'instagram' | 'comment'
 * - socialSelectedAgentId: from message settings (used when FB/IG tab is selected)
 * - whatsappSelectedAgentId: from message settings (used when WhatsApp tab is selected)
 * - onSocialAgentSaved: (agentId) => void when user selects social agent
 * - teamOptions, leadSettings, selectedUser, onToggle, onSettingsUpdate, onThreadUpdated
 */
export default function ThreadOptionsDropdown({
  label = 'Assign',
  selectedThread,
  teamOptions = [],
  leadSettings = null,
  selectedUser = null,
  onToggle,
  onSettingsUpdate,
  onThreadUpdated,
  withoutBorder = false,
  composerMode,
  socialSelectedAgentId = null,
  whatsappSelectedAgentId = null,
  onSocialAgentSaved,
}) {
  const selectedTeams = useMemo(
    () => teamOptions.filter((opt) => opt.selected),
    [teamOptions],
  )

  const threadId = selectedThread?.id ?? selectedThread?.threadId
  const leadId = selectedThread?.leadId
  const threadSelectedAgentId = selectedThread?.selectedAgentId ?? null

  const isWhatsAppChannel = composerMode === 'whatsapp'
  const isSocialChannel = composerMode === 'facebook' || composerMode === 'instagram' || isWhatsAppChannel
  const effectiveSelectedAgentId = isSocialChannel
    ? (isWhatsAppChannel ? (whatsappSelectedAgentId ?? null) : (socialSelectedAgentId ?? null))
    : threadSelectedAgentId

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center ${
            withoutBorder ? '' : 'shadow-sm border px-4 py-2 border-muted/70 rounded-xl '
          } bg-white text-sm font-semibold focus:outline-none`}
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
        align="end"
        side="bottom"
        className="z-[2000] w-[280px] min-h-0 border border-black/[0.06] bg-white text-foreground shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-lg p-0 gap-3 max-h-[80vh] overflow-hidden flex flex-col"
      >
        <Tabs defaultValue="teams" className="flex flex-col flex-1 min-h-0 gap-1 max-h-[450px]">
          <div
            className="px-3 h-auto"
            style={{ paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #eaeaea' }}
          >
            <TabsList className="flex w-full shrink-0 h-9 items-center justify-between rounded-lg bg-muted p-1 text-muted-foreground text-[14px] font-['Inter'] gap-2 [&_svg]:size-4">
            <TabsTrigger value="teams" className="flex-1 min-w-0 text-[14px] gap-1 [&_svg]:hidden active:scale-[0.98] transition-transform duration-150">
              <Users className="h-4 w-4" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex-1 min-w-0 text-[14px] gap-1 [&_svg]:hidden active:scale-[0.98] transition-transform duration-150">
              <Bot className="h-4 w-4" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 min-w-0 text-[14px] gap-1 [&_svg]:hidden active:scale-[0.98] transition-transform duration-150">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="teams" className="flex-1 min-h-0 overflow-auto">
            <TeamsTabContent teamOptions={teamOptions} onToggle={onToggle} />
          </TabsContent>
          <TabsContent value="agents" className="flex-1 min-h-0 overflow-auto">
            {threadId || isSocialChannel ? (
              <AgentsListForThread
                selectedUser={selectedUser}
                selectedAgentId={effectiveSelectedAgentId}
                threadId={threadId}
                mode={isSocialChannel ? 'social' : 'thread'}
                onSelectionSaved={onThreadUpdated}
                onSocialAgentSaved={(agentId) =>
                  onSocialAgentSaved?.(agentId, isWhatsAppChannel ? 'whatsapp' : 'social')
                }
              />
            ) : (
              <div className="px-2 py-3 text-sm text-muted-foreground">
                Select a conversation to choose an agent.
              </div>
            )}
          </TabsContent>
          <TabsContent value="settings" className="flex-1 min-h-0 overflow-auto">
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
