'use client'

import React, { useState, useCallback } from 'react'
import axios from 'axios'
import { Search, Loader2, Link2 } from 'lucide-react'
import Apis from '@/components/apis/Apis'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const DEBOUNCE_MS = 300

/**
 * Modal to link a dummy Messenger/Instagram thread to an existing lead.
 * Shows search input and lead list; on select, calls link-lead API and invokes onLinked(newThread).
 */
export default function LinkToLeadModal({
  open,
  onClose,
  threadId,
  selectedUser = null,
  onLinked,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [linking, setLinking] = useState(false)
  const [error, setError] = useState(null)

  const searchLeads = useCallback(async (term) => {
    if (!term || term.trim().length < 1) {
      setLeads([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const localData = localStorage.getItem('User')
      if (!localData) {
        setLeads([])
        return
      }
      const userData = JSON.parse(localData)
      const token = userData.token
      let apiPath = `${Apis.searchLeadsForMessaging}?search=${encodeURIComponent(term.trim())}&limit=50`
      if (selectedUser?.id) {
        apiPath += `&userId=${selectedUser.id}`
      }
      const response = await axios.get(apiPath, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.data?.status && response.data?.data) {
        setLeads(Array.isArray(response.data.data) ? response.data.data : [])
      } else {
        setLeads([])
      }
    } catch (err) {
      console.error('Error searching leads:', err)
      setLeads([])
      setError('Failed to search leads')
    } finally {
      setLoading(false)
    }
  }, [selectedUser?.id])

  React.useEffect(() => {
    if (!open) return
    const t = setTimeout(() => searchLeads(searchTerm), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [open, searchTerm, searchLeads])

  const handleSelectLead = async (lead) => {
    if (!threadId || !lead?.id) return
    setLinking(true)
    setError(null)
    try {
      const localData = localStorage.getItem('User')
      if (!localData) {
        setError('Not authenticated')
        return
      }
      const userData = JSON.parse(localData)
      const token = userData.token
      let url = `${Apis.linkThreadToLead}/${threadId}/link-lead`
      if (selectedUser?.id) {
        url += `?userId=${selectedUser.id}`
      }
      const body = { targetLeadId: lead.id }
      if (selectedUser?.id) body.userId = selectedUser.id
      const response = await axios.post(
        url,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      if (response.data?.status && response.data?.data?.thread) {
        onLinked?.(response.data.data.thread)
        onClose()
      } else {
        setError(response.data?.message || 'Failed to link thread')
      }
    } catch (err) {
      console.error('Error linking thread:', err)
      setError(err.response?.data?.message || err.message || 'Failed to link thread')
    } finally {
      setLinking(false)
    }
  }

  const handleClose = () => {
    setSearchTerm('')
    setLeads([])
    setError(null)
    setLinking(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Link to lead
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This conversation will be merged with the lead you select. Search and choose a lead.
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <div className="max-h-[280px] overflow-auto border rounded-md divide-y">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : leads.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {searchTerm.trim() ? 'No leads found. Try a different search.' : 'Type to search leads.'}
            </div>
          ) : (
            leads.map((lead) => (
              <button
                key={lead.id}
                type="button"
                className="w-full px-4 py-3 text-left hover:bg-muted/60 flex flex-col gap-0.5"
                onClick={() => handleSelectLead(lead)}
                disabled={linking}
              >
                <span className="font-medium">
                  {[lead.firstName, lead.lastName].filter(Boolean).join(' ') || 'Unnamed'}
                </span>
                {(lead.email || lead.phone) && (
                  <span className="text-xs text-muted-foreground">
                    {[lead.email, lead.phone].filter(Boolean).join(' · ')}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
        {linking && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Linking…
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
