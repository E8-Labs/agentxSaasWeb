'use client'

import { ChevronDown, Users, Circle } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import axios from 'axios'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { TypographyBody, TypographyBodySemibold, TypographyCaption } from './TypographyCN'
import Apis from '@/components/apis/Apis'
import { toast } from '@/utils/toast'

/**
 * Team-only assign dropdown with radio buttons
 * teamOptions: [{ id, label, avatar, selected }]
 * onToggle: (teamId, team, isSelected) => void - called when a team is toggled
 * leadId: Lead ID for settings toggles (optional)
 * leadSettings: { autoReplyDisabled, cadenceDisabled, pendingCallsCount } (optional)
 * onSettingsUpdate: Callback when settings are updated (optional)
 */
const TeamAssignDropdownCn = ({
  label = '',
  teamOptions = [],
  selectedUser = null,
  onToggle,
  withoutBorder = false,
  leadId = null,
  leadSettings = null,
  onSettingsUpdate = null,
}) => {
  // Create a stable key from teamOptions to ensure useMemo recalculates
  const teamOptionsKey = useMemo(
    () => teamOptions.map(opt => `${opt.id}-${opt.selected}`).join(','),
    [teamOptions]
  )

  const selectedTeams = useMemo(
    () => teamOptions.filter((opt) => opt.selected),
    [teamOptionsKey, teamOptions],
  )

  useEffect(() => {
    console.log("teamOptions passed are", teamOptions)
  }, [teamOptions])

  // Lead settings state
  const [autoReplyDisabled, setAutoReplyDisabled] = useState(false)
  const [cadenceDisabled, setCadenceDisabled] = useState(false)
  const [pendingCallsCount, setPendingCallsCount] = useState(0)
  const [loadingSettings, setLoadingSettings] = useState(false)

  // Initialize settings from props or fetch if leadId provided
  useEffect(() => {
    if (!leadId) {
      // Reset if no leadId
      setAutoReplyDisabled(false)
      setCadenceDisabled(false)
      setPendingCallsCount(0)
      return
    }

    if (leadSettings !== null && leadSettings !== undefined) {
      // Always sync with prop when provided
      setAutoReplyDisabled(leadSettings.autoReplyDisabled === true)
      setCadenceDisabled(leadSettings.cadenceDisabled === true)
      setPendingCallsCount(Number(leadSettings.pendingCallsCount) || 0)
    } else {
      // Fetch if no prop provided
      fetchLeadSettings()
    }
  }, [leadId, leadSettings])

  const fetchLeadSettings = async () => {
    if (!leadId) return

    try {
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      const response = await axios.get(
        `${Apis.getLeadSettings}/${leadId}/settings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data?.status && response.data?.data) {
        const data = response.data.data
        setAutoReplyDisabled(data.autoReplyDisabled === true)
        setCadenceDisabled(data.cadenceDisabled === true)
        setPendingCallsCount(Number(data.pendingCallsCount) || 0)
      }
    } catch (error) {
      console.error('Error fetching lead settings:', error)
    }
  }

  const handleAutoReplyToggle = async (checked) => {
    if (!leadId) return

    setLoadingSettings(true)
    try {
      const localData = localStorage.getItem('User')
      if (!localData) {
        toast.error('Please log in to update settings')
        return
      }

      const userData = JSON.parse(localData)
      const token = userData.token

      const response = await axios.put(
        `${Apis.updateLeadSettings}/${leadId}/settings`,
        {
          autoReplyDisabled: checked,
          cadenceDisabled: cadenceDisabled,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data?.status) {
        const updatedData = response.data.data
        setAutoReplyDisabled(updatedData.autoReplyDisabled === true)
        setCadenceDisabled(updatedData.cadenceDisabled === true)
        setPendingCallsCount(Number(updatedData.pendingCallsCount) || 0)
        toast.success('Auto-reply settings updated')
        onSettingsUpdate?.(updatedData)
      } else {
        toast.error(response.data?.message || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating auto-reply settings:', error)
      toast.error('Failed to update auto-reply settings')
    } finally {
      setLoadingSettings(false)
    }
  }

  const handleCadenceToggle = async (checked) => {
    if (!leadId) return

    setLoadingSettings(true)
    try {
      const localData = localStorage.getItem('User')
      if (!localData) {
        toast.error('Please log in to update settings')
        return
      }

      const userData = JSON.parse(localData)
      const token = userData.token

      const response = await axios.put(
        `${Apis.updateLeadSettings}/${leadId}/settings`,
        {
          autoReplyDisabled: autoReplyDisabled,
          cadenceDisabled: checked,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data?.status) {
        const updatedData = response.data.data
        setAutoReplyDisabled(updatedData.autoReplyDisabled === true)
        setCadenceDisabled(updatedData.cadenceDisabled === true)
        setPendingCallsCount(Number(updatedData.pendingCallsCount) || 0)
        toast.success(
          checked
            ? 'Cadence disabled - pending calls have been skipped'
            : 'Cadence enabled'
        )
        onSettingsUpdate?.(updatedData)
      } else {
        toast.error(response.data?.message || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating cadence settings:', error)
      toast.error('Failed to update cadence settings')
    } finally {
      setLoadingSettings(false)
    }
  }

  const handleTeamClick = (team) => {
    const teamId = String(team.id)
    const isCurrentlySelected = team.selected

    // Toggle: if selected, unassign; if not selected, assign
    onToggle?.(teamId, team, !isCurrentlySelected)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`flex items-center ${withoutBorder ? '' : 'shadow-sm border px-4 py-2  border-muted/70 rounded-xl '} bg-white text-base font-semibold  focus:outline-none`}>
          {selectedTeams.length > 0 ? (
            <div className="flex items-center -space-x-2">
              {selectedTeams
                .slice(0, 3) // Show max 3 avatars
                .map((team, index) => (
                  <div
                    key={team.id || index}
                    className={`relative rounded-full -mr-2 `}
                    style={{ zIndex: selectedTeams.length - index, }}
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
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <TypographyBodySemibold>{label}</TypographyBodySemibold>
            </div>
          )}
          {withoutBorder ? null : (
            <span className="mx-3 h-6 w-px bg-muted/80" />
          )}
          <ChevronDown className={`${withoutBorder ? 'ml-2' : ''} h-4 w-4 text-foreground`} />
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
                    className={`h-3.5 w-3.5 stroke-current stroke-2 fill-none ${isSelected ? 'text-brand-primary' : 'text-muted-foreground'
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

        {/* Lead Settings Toggles */}
        {leadId && (
          <>
            <DropdownMenuSeparator className="my-1" />

            {/* Disable Auto Replies Toggle */}
            <div className="px-2 py-1.5">
              <div className="flex items-center justify-between gap-2">
                <TypographyBody className="text-sm text-foreground">
                  Disable auto replies
                </TypographyBody>
                <Switch
                  checked={autoReplyDisabled}
                  onCheckedChange={handleAutoReplyToggle}
                  disabled={loadingSettings}
                />
              </div>
            </div>

            {/* Disable Cadence Toggle - Only show if there are pending calls */}
            {Number(pendingCallsCount) > 0 && (
              <div className="px-2 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <TypographyBody className="text-sm text-foreground">
                      Disable cadence
                    </TypographyBody>
                    <TypographyCaption className="text-xs text-muted-foreground">
                      {pendingCallsCount} pending call{Number(pendingCallsCount) !== 1 ? 's' : ''}
                    </TypographyCaption>
                  </div>
                  <Switch
                    checked={cadenceDisabled}
                    onCheckedChange={handleCadenceToggle}
                    disabled={loadingSettings}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default TeamAssignDropdownCn
