'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Circle } from 'lucide-react'
import axios from 'axios'
import Apis from '@/components/apis/Apis'
import { getAgentsListImage } from '@/utilities/agentUtilities'
import { AgentXOrb } from '@/components/common/AgentXOrb'
import { TypographyBody } from '@/components/dashboard/leads/extras/TypographyCN'
import { toast } from '@/utils/toast'

/**
 * Fetches agents via GET Apis.getAgents, shows list with getAgentsListImage.
 * On select: PATCH thread with selectedAgentId, then call onSelectionSaved(updatedThread).
 */
export default function AgentsListForThread({
  selectedUser,
  selectedAgentId,
  threadId,
  onSelectionSaved,
}) {
  const [agentsList, setAgentsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      setAgentsList([])
      return
    }

    setLoading(true)
    fetch(`${Apis.getAgents}?pagination=false`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) setAgentsList(Array.isArray(data.data) ? data.data : [])
        else setAgentsList([])
      })
      .catch((err) => {
        console.error('Error fetching agents for thread:', err)
        setAgentsList([])
      })
      .finally(() => setLoading(false))
  }, [threadId])

  const flatAgents = useMemo(() => {
    if (!Array.isArray(agentsList)) return []
    return agentsList.flatMap((m) =>
      (m.agents || []).map((a) => ({
        id: a.id,
        name: a.name || m.name || `Agent ${a.id}`,
        raw: a,
      })),
    )
  }, [agentsList])

  const handleSelect = async (agentId) => {
    if (!threadId) return
    const token = getToken()
    if (!token) {
      toast.error('Please log in to update thread')
      return
    }

    setSaving(true)
    try {
      const response = await axios.patch(
        `${Apis.updateThread}/${threadId}`,
        { selectedAgentId: agentId === null || agentId === undefined ? null : agentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (response.data?.status && response.data?.data) {
        toast.success('Agent for this conversation updated')
        onSelectionSaved?.(response.data.data)
      } else {
        toast.error(response.data?.message || 'Failed to update thread')
      }
    } catch (error) {
      console.error('Error updating thread agent:', error)
      toast.error('Failed to update thread')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="px-2 py-3 text-sm text-muted-foreground">
        Loading agents…
      </div>
    )
  }

  if (flatAgents.length === 0) {
    return (
      <div className="px-2 py-3 text-sm text-muted-foreground">
        No agents found
      </div>
    )
  }

  return (
    <div className="max-h-[220px] overflow-y-auto space-y-0.5">
      {/* First option: Sky (default for normal chats, same as AI Chat) */}
      <button
        type="button"
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/70 cursor-pointer text-left"
        onClick={() => handleSelect(null)}
        disabled={saving}
      >
        <span className="relative flex h-3.5 w-3.5 items-center justify-center shrink-0">
          <Circle
            className={`h-3.5 w-3.5 stroke-current stroke-2 fill-none ${
              selectedAgentId == null ? 'text-brand-primary' : 'text-muted-foreground'
            }`}
          />
          {selectedAgentId == null && (
            <Circle className="absolute h-2 w-2 fill-current text-brand-primary" />
          )}
        </span>
        <div className="shrink-0 w-6 h-6 rounded-full overflow-hidden bg-muted flex items-center justify-center">
          <AgentXOrb width={24} height={24} />
        </div>
        <TypographyBody className="text-sm text-foreground">Sky</TypographyBody>
      </button>

      {flatAgents.map((agent) => {
        const isSelected = selectedAgentId != null && Number(selectedAgentId) === Number(agent.id)
        return (
          <button
            key={agent.id}
            type="button"
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/70 cursor-pointer text-left"
            onClick={() => handleSelect(agent.id)}
            disabled={saving}
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
            <div className="shrink-0 w-6 h-6 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {getAgentsListImage(agent.raw, 24, 24)}
            </div>
            <TypographyBody className="text-sm text-foreground truncate">{agent.name}</TypographyBody>
          </button>
        )
      })}
    </div>
  )
}

function getToken() {
  if (typeof window === 'undefined') return null
  try {
    const local = localStorage.getItem('User')
    if (!local) return null
    const data = JSON.parse(local)
    return data?.token ?? null
  } catch {
    return null
  }
}
