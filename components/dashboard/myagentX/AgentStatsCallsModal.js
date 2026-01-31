import { Box, Modal } from '@mui/material'
import axios from 'axios'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { useUser } from '@/hooks/redux-hooks'

const TYPE_LABELS = {
  calls: 'Calls',
  convos: 'Convos',
  hotleads: 'Hot Leads',
  booked: 'Booked Meetings',
}

const styles = {
  modalsStyle: {
    height: 'auto',
    bgcolor: 'transparent',
    p: 2,
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-50%)',
    borderRadius: 2,
    border: 'none',
    outline: 'none',
  },
}

function AgentStatsCallsModal({
  open,
  onClose,
  agentId,
  agentName,
  type,
}) {
  const { user: reduxUser } = useUser()
  const [calls, setCalls] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [offset, setOffset] = useState(0)
  const limit = 20
  const hasMore = calls.length < total

  const fetchCalls = async (reset = false) => {
    if (!agentId || !type) return
    const data = localStorage.getItem('User')
    if (!data) return
    try {
      setLoading(true)
      const u = JSON.parse(data)
      const currentOffset = reset ? 0 : offset
      const url = `${Apis.getAgentCallsByTypeApi}?agentId=${agentId}&type=${type}&offset=${currentOffset}&limit=${limit}`
      const response = await axios.get(url, {
        headers: {
          Authorization: 'Bearer ' + u.token,
        },
      })
      if (response.data?.status === true && response.data?.data) {
        const newCalls = response.data.data.calls || []
        const newTotal = response.data.data.total ?? 0
        if (reset) {
          setCalls(newCalls)
          setOffset(limit)
        } else {
          setCalls((prev) => [...prev, ...newCalls])
          setOffset((prev) => prev + limit)
        }
        setTotal(newTotal)
      } else {
        if (reset) setCalls([])
        setTotal(0)
      }
    } catch (err) {
      if (reset) setCalls([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && agentId && type) {
      setCalls([])
      setTotal(0)
      setOffset(0)
      fetchCalls(true)
    }
  }, [open, agentId, type])

  const handleLoadMore = () => {
    if (!loading && hasMore) fetchCalls(false)
  }

  const openRecordingPage = (callId) => {
    if (!callId) return
    const baseUrl = reduxUser?.agencyBranding?.customDomain
      ? `https://${reduxUser.agencyBranding.customDomain}`
      : (typeof window !== 'undefined' ? window.location.origin : '')
    const url = `${baseUrl}/recordings/${callId}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const title = TYPE_LABELS[type] || type
  const displayName = agentName ? `${title} – ${agentName}` : title

  const emptyMessage = {
    calls: 'No calls found.',
    convos: 'No convos found.',
    hotleads: 'No hot leads found.',
    booked: 'No booked meetings found.',
  }[type] || 'No data found.'

  return (
    <Modal
      open={open}
      onClose={onClose}
      BackdropProps={{
        timeout: 100,
        sx: { backgroundColor: '#00000020' },
      }}
    >
      <Box
        className="w-11/12 sm:w-9/12 md:w-7/12 lg:w-5/12 max-h-[85vh] overflow-hidden flex flex-col p-6 rounded-2xl"
        sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}
      >
        <div className="flex flex-row items-center justify-between mb-4 flex-shrink-0">
          <div style={{ fontSize: 18, fontWeight: 600, color: '#000' }}>
            {displayName}
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        <div
          className="flex-1 overflow-auto pb-4"
          style={{ scrollbarWidth: 'thin' }}
        >
          {loading && calls.length === 0 ? (
            <div className="w-full flex flex-row justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
            </div>
          ) : calls.length === 0 ? (
            <div className="w-full flex flex-row justify-center py-12 text-gray-500">
              {emptyMessage}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {calls.map((call) => {
                const lead = call.LeadModel
                const leadName = lead
                  ? [lead.firstName, lead.lastName].filter(Boolean).join(' ') ||
                    lead.email ||
                    'Unknown'
                  : 'Unknown'
                const durationSec = call.duration
                const durationStr =
                  durationSec != null
                    ? moment.utc(durationSec * 1000).format('mm:ss')
                    : '-'
                const dateStr = call.createdAt
                  ? moment(call.createdAt).format('MMM D, YYYY h:mm A')
                  : '-'
                return (
                  <div
                    key={call.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-row justify-between items-start gap-2">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div
                          className="font-medium text-gray-900 truncate"
                          title={leadName}
                        >
                          {leadName}
                        </div>
                        <div className="text-sm text-gray-500">{dateStr}</div>
                        <div className="flex flex-row gap-3 text-sm text-gray-600">
                          <span>Duration: {durationStr}</span>
                          {call.callOutcome && (
                            <span>Outcome: {call.callOutcome}</span>
                          )}
                        </div>
                      </div>
                      {call.callId && (
                        <button
                          type="button"
                          onClick={() => openRecordingPage(call.callId)}
                          className="flex items-center justify-center flex-shrink-0 p-1 rounded-full hover:opacity-80 transition-opacity"
                          style={{ width: 36, height: 36 }}
                          title="Play recording"
                        >
                          <Image
                            src="/assets/play.png"
                            height={28}
                            width={28}
                            alt="Play recording"
                            style={{
                              filter: 'hue-rotate(0deg) saturate(1) brightness(1)',
                            }}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load more'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Box>
    </Modal>
  )
}

export default AgentStatsCallsModal
