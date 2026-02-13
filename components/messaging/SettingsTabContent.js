'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Switch } from '@/components/ui/switch'
import { TypographyBody, TypographyCaption } from '@/components/dashboard/leads/extras/TypographyCN'
import Apis from '@/components/apis/Apis'
import { toast } from '@/utils/toast'

/**
 * Lead-level settings: Disable auto replies, Disable cadence.
 * leadId, leadSettings (optional), onSettingsUpdate (optional).
 */
export default function SettingsTabContent({
  leadId,
  leadSettings: leadSettingsProp,
  onSettingsUpdate,
}) {
  const [autoReplyDisabled, setAutoReplyDisabled] = useState(false)
  const [cadenceDisabled, setCadenceDisabled] = useState(false)
  const [pendingCallsCount, setPendingCallsCount] = useState(0)
  const [loadingSettings, setLoadingSettings] = useState(false)

  useEffect(() => {
    if (!leadId) {
      setAutoReplyDisabled(false)
      setCadenceDisabled(false)
      setPendingCallsCount(0)
      return
    }
    if (leadSettingsProp !== null && leadSettingsProp !== undefined) {
      setAutoReplyDisabled(leadSettingsProp.autoReplyDisabled === true)
      setCadenceDisabled(leadSettingsProp.cadenceDisabled === true)
      setPendingCallsCount(Number(leadSettingsProp.pendingCallsCount) || 0)
    } else {
      fetchLeadSettings()
    }
  }, [leadId, leadSettingsProp])

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
        },
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
        { autoReplyDisabled: checked, cadenceDisabled },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
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
        { autoReplyDisabled, cadenceDisabled: checked },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )
      if (response.data?.status) {
        const updatedData = response.data.data
        setAutoReplyDisabled(updatedData.autoReplyDisabled === true)
        setCadenceDisabled(updatedData.cadenceDisabled === true)
        setPendingCallsCount(Number(updatedData.pendingCallsCount) || 0)
        toast.success(
          checked ? 'Cadence disabled - pending calls have been skipped' : 'Cadence enabled',
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

  if (!leadId) {
    return (
      <div className="px-2 py-3 text-sm text-muted-foreground">
        Select a conversation to change settings.
      </div>
    )
  }

  return (
    <div className="space-y-3 px-1">
      <div className="flex items-center justify-between gap-2">
        <TypographyBody className="text-sm text-foreground">Disable auto replies</TypographyBody>
        <Switch
          checked={autoReplyDisabled}
          onCheckedChange={handleAutoReplyToggle}
          disabled={loadingSettings}
        />
      </div>
      {Number(pendingCallsCount) > 0 && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <TypographyBody className="text-sm text-foreground">Disable cadence</TypographyBody>
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
      )}
    </div>
  )
}
