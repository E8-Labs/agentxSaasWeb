'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Check } from 'lucide-react'
import axios from 'axios'
import Apis from '@/components/apis/Apis'
import { getAgentsListImage } from '@/utilities/agentUtilities'
import { AgentXOrb } from '@/components/common/AgentXOrb'
import { TypographyBody } from '@/components/dashboard/leads/extras/TypographyCN'
import { toast } from '@/utils/toast'
import { PersistanceKeys } from '@/constants/Constants'

const AGENTS_CACHE_KEY = PersistanceKeys.agentsListForMessaging;

const AGENTS_LIST_CACHE_KEY = 'messaging_agents_list'

function getCacheKey(userId) {
  return userId ? `${AGENTS_LIST_CACHE_KEY}_${userId}` : AGENTS_LIST_CACHE_KEY
}

function getCachedAgents(userId = null) {
  if (typeof window === 'undefined') return null
  try {
    const key = getCacheKey(userId)
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function setCachedAgents(list, userId = null) {
  if (typeof window === 'undefined' || !Array.isArray(list)) return
  try {
    const key = getCacheKey(userId)
    localStorage.setItem(key, JSON.stringify(list))
  } catch (e) {
    console.warn('AgentsListForThread: failed to cache agents', e)
  }
}

/**
 * Fetches agents via GET Apis.getAgents, shows list with getAgentsListImage.
 * Loads from localStorage first (if any), then refreshes from API and updates cache.
 * - When mode === 'thread': on select PATCH thread with selectedAgentId, then call onSelectionSaved(updatedThread).
 * - When mode === 'social': on select call onSocialAgentSaved(agentId) (saves to message settings for FB/IG).
 */
export default function AgentsListForThread({
  selectedUser,
  selectedAgentId,
  threadId,
  mode = 'thread',
  onSelectionSaved,
  onSocialAgentSaved,
}) {
  // When agency/admin views a subaccount, selectedUser is the subaccount; scope cache by selectedUser.id
  const contextUserId = selectedUser?.id ?? null
  const [agentsList, setAgentsList] = useState(() => getCachedAgents(contextUserId) ?? [])
  const [loading, setLoading] = useState(!getCachedAgents(contextUserId))
  const [saving, setSaving] = useState(false)
  const listWrapRef = React.useRef(null)
  const [pill, setPill] = React.useState({ top: 0, height: 0 })
  const [pillVisible, setPillVisible] = React.useState(false)

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

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      setAgentsList([])
      return
    }

    const cached = getCachedAgents(contextUserId)
    const hasCache = cached?.length > 0
    if (cached) setAgentsList(cached)
    if (!hasCache) setLoading(true)

    // When agency/admin is viewing a subaccount's messages, pass subaccount userId so backend returns that user's agents
    const query = new URLSearchParams({ pagination: 'false' })
    if (contextUserId) query.set('userId', String(contextUserId))
    const apiUrl = `${Apis.getAgents}?${query.toString()}`

    fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const list = data?.data && Array.isArray(data.data) ? data.data : []
        setAgentsList(list)
        setCachedAgents(list, contextUserId)
      })
      .catch((err) => {
        console.error('Error fetching agents for thread:', err)
        if (!hasCache) setAgentsList([])
      })
      .finally(() => setLoading(false))
  }, [threadId, contextUserId])

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
    if (mode === 'social') {
      setSaving(true)
      try {
        await onSocialAgentSaved?.(agentId)
        toast.success('Agent for social messages updated')
      } catch (error) {
        console.error('Error updating social agent:', error)
        toast.error('Failed to update social agent')
      } finally {
        setSaving(false)
      }
      return
    }

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
    <div className="py-2 px-3 rounded-lg m-0 flex-1 min-h-0 flex flex-col">
      <div ref={listWrapRef} className="relative flex-1 min-h-0 overflow-y-auto space-y-0.5" onMouseMove={handleListMouseMove} onMouseLeave={handleListMouseLeave}>
        {pillVisible && (
          <div
            className="absolute left-1 right-1 rounded-lg bg-black/[0.02] transition-[top,height] duration-150 ease-out pointer-events-none"
            style={{ top: pill.top, height: pill.height }}
          />
        )}
        {/* First option: Sky (default for normal chats, same as AI Chat) */}
        <div data-sliding-pill-item className="w-full">
          <button
            type="button"
            className="h-10 w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md hover:bg-transparent cursor-pointer text-left"
            style={selectedAgentId == null ? { backgroundColor: 'hsl(var(--brand-primary) / 0.05)' } : undefined}
            onClick={() => handleSelect(null)}
            disabled={saving}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative shrink-0 w-[24px] h-[24px] rounded-full overflow-hidden bg-muted flex items-center justify-center">
                <div
                  className="absolute left-0 right-0 flex items-center justify-center rounded-full overflow-hidden"
                  style={{ top: 6, filter: 'blur(10px)', transform: 'scale(0.9)', zIndex: 0 }}
                  aria-hidden
                >
                  <AgentXOrb width={24} height={24} />
                </div>
                <div className="relative z-10 flex items-center justify-center w-full h-full">
                  <AgentXOrb width={24} height={24} />
                </div>
              </div>
              <TypographyBody className={`text-sm truncate ${selectedAgentId == null ? 'text-brand-primary font-medium' : 'text-foreground'}`}>Sky</TypographyBody>
            </div>
            {selectedAgentId == null && (
              <Check className="h-4 w-4 shrink-0 text-brand-primary" aria-hidden />
            )}
          </button>
        </div>

        {flatAgents.map((agent) => {
          const isSelected = selectedAgentId != null && Number(selectedAgentId) === Number(agent.id)
          return (
            <div key={agent.id} data-sliding-pill-item className="w-full">
              <button
                type="button"
                className="h-10 w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md hover:bg-transparent cursor-pointer text-left"
                style={isSelected ? { backgroundColor: 'hsl(var(--brand-primary) / 0.05)' } : undefined}
                onClick={() => handleSelect(agent.id)}
                disabled={saving}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="relative shrink-0 w-[24px] h-[24px] rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    <div
                      className="absolute left-0 right-0 flex items-center justify-center rounded-full overflow-hidden"
                      style={{ top: 6, filter: 'blur(10px)', transform: 'scale(0.9)', zIndex: 0 }}
                      aria-hidden
                    >
                      {getAgentsListImage(agent.raw, 24, 24)}
                    </div>
                    <div className="relative z-10 flex items-center justify-center w-full h-full">
                      {getAgentsListImage(agent.raw, 24, 24)}
                    </div>
                  </div>
                  <TypographyBody className={`text-sm truncate ${isSelected ? 'text-brand-primary font-medium' : 'text-foreground'}`}>{agent.name}</TypographyBody>
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
