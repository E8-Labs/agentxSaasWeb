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
  const [loading, setLoading] = useState(false)
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
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(AGENTS_CACHE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) setAgentsList(parsed)
          return
        }
      } catch (_) {
        // ignore cache read errors
      }
    }

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
        const list = data?.data && Array.isArray(data.data) ? data.data : []
        setAgentsList(list)
        if (typeof window !== 'undefined' && list.length > 0) {
          try {
            localStorage.setItem(AGENTS_CACHE_KEY, JSON.stringify(list))
          } catch (_) {
            // ignore cache write errors
          }
        }
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
