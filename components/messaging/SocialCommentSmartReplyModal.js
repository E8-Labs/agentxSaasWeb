'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import Apis from '@/components/apis/Apis'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getUniquesColumn } from '@/components/globalExtras/GetUniqueColumns'
import { X } from 'lucide-react'
import { toast } from '@/utils/toast'

function ruleKey(platform, externalId) {
  return `${platform}:${externalId}`
}

function normalizeVariableLabel(v) {
  return String(v || '')
    .trim()
    .replace(/^\{+/, '')
    .replace(/\}+$/, '')
    .trim()
}

function dedupeNormalizedVariables(list) {
  const out = []
  const seen = new Set()
  for (const item of list || []) {
    const label = normalizeVariableLabel(item)
    if (!label) continue
    const key = label.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(label)
  }
  return out
}

export default function SocialCommentSmartReplyModal({
  open,
  onClose,
  selectedUser,
  socialConnections = [],
  onSaved,
}) {
  const fbIg = useMemo(
    () =>
      socialConnections.filter(
        (c) => c.platform === 'facebook' || c.platform === 'instagram',
      ),
    [socialConnections],
  )

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [allRules, setAllRules] = useState([])
  const [selectedKey, setSelectedKey] = useState('')
  const [phrases, setPhrases] = useState([])
  const [phraseInput, setPhraseInput] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [selectedVariable, setSelectedVariable] = useState('')
  const [uniqueColumns, setUniqueColumns] = useState([])

  const loadSettings = useCallback(async () => {
    const localData = typeof window !== 'undefined' ? localStorage.getItem('User') : null
    if (!localData) return
    const userData = JSON.parse(localData)
    const token = userData.token
    let url = `${Apis.BasePath}api/mail/settings`
    if (selectedUser?.id) url += `?userId=${selectedUser.id}`
    setLoading(true)
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      const raw = res.data?.data?.socialCommentSmartReplyRules
      let rules = []
      if (Array.isArray(raw)) rules = raw
      else if (typeof raw === 'string') {
        try {
          rules = JSON.parse(raw)
        } catch {
          rules = []
        }
      }
      setAllRules(Array.isArray(rules) ? rules : [])

      const first = fbIg[0]
      if (first) {
        const k = ruleKey(first.platform, first.externalId)
        setSelectedKey(k)
        const existing = (Array.isArray(rules) ? rules : []).find(
          (r) => r.platform === first.platform && String(r.externalId) === String(first.externalId),
        )
        setPhrases(existing?.phrases && Array.isArray(existing.phrases) ? [...existing.phrases] : [])
        setMessageBody(typeof existing?.message === 'string' ? existing.message : '')
      } else {
        setSelectedKey('')
        setPhrases([])
        setMessageBody('')
      }
    } catch (e) {
      console.error(e)
      toast.error(e.response?.data?.message || 'Could not load settings')
    } finally {
      setLoading(false)
    }
  }, [selectedUser?.id, fbIg])

  useEffect(() => {
    if (open) {
      loadSettings()
    }
  }, [open, loadSettings])

  useEffect(() => {
    if (!open) return
    const fetchUniqueColumns = async () => {
      try {
        const localData = localStorage.getItem('User')
        const localUserId = localData ? JSON.parse(localData)?.user?.id : null
        const targetUserId = selectedUser?.id || localUserId
        const defaultColumns = [
          'First Name',
          'Last Name',
          'Email',
          'Phone',
          'Address',
          'Assigned Team Member',
        ]
        const res = await getUniquesColumn(targetUserId)
        const merged = Array.isArray(res) && res.length > 0 ? [...defaultColumns, ...res] : defaultColumns
        setUniqueColumns(dedupeNormalizedVariables(merged))
      } catch (error) {
        console.error('Error fetching unique columns:', error)
        setUniqueColumns(dedupeNormalizedVariables([
          'First Name',
          'Last Name',
          'Email',
          'Phone',
          'Address',
          'Assigned Team Member',
        ]))
      }
    }
    fetchUniqueColumns()
  }, [open, selectedUser?.id])

  const applyRuleForKey = (key) => {
    if (!key) return
    const colon = key.indexOf(':')
    if (colon < 0) return
    const platform = key.slice(0, colon)
    const externalId = key.slice(colon + 1)
    const existing = allRules.find(
      (r) => r.platform === platform && String(r.externalId) === String(externalId),
    )
    setPhrases(existing?.phrases && Array.isArray(existing.phrases) ? [...existing.phrases] : [])
    setMessageBody(typeof existing?.message === 'string' ? existing.message : '')
  }

  const handleSelectConnection = (key) => {
    setSelectedKey(key)
    applyRuleForKey(key)
  }

  const removePhrase = (idx) => {
    setPhrases((p) => p.filter((_, i) => i !== idx))
  }

  const addPhraseFromInput = () => {
    const t = phraseInput.trim()
    if (!t) return
    if (phrases.includes(t)) {
      setPhraseInput('')
      return
    }
    setPhrases((p) => [...p, t])
    setPhraseInput('')
  }

  const handleSave = async () => {
    if (!selectedKey) {
      toast.error('Select a page or account')
      return
    }
    const colon = selectedKey.indexOf(':')
    const platform = colon >= 0 ? selectedKey.slice(0, colon) : ''
    const externalId = colon >= 0 ? selectedKey.slice(colon + 1) : ''
    if (!platform || !externalId) {
      toast.error('Invalid selection')
      return
    }
    const trimmedPhrases = phrases.map((p) => String(p).trim()).filter(Boolean)
    const msg = messageBody.trim()
    if (trimmedPhrases.length === 0) {
      toast.error('Add at least one phrase')
      return
    }
    if (!msg) {
      toast.error('Enter a message')
      return
    }
    if (msg.length > 500) {
      toast.error('Message must be 500 characters or less')
      return
    }

    const next = allRules.filter(
      (r) => !(r.platform === platform && String(r.externalId) === String(externalId)),
    )
    next.push({
      platform,
      externalId: String(externalId),
      phrases: trimmedPhrases,
      message: msg,
    })

    const localData = localStorage.getItem('User')
    if (!localData) return
    const userData = JSON.parse(localData)
    const token = userData.token
    let url = `${Apis.BasePath}api/mail/settings`
    if (selectedUser?.id) url += `?userId=${selectedUser.id}`

    setSaving(true)
    try {
      await axios.put(
        url,
        { socialCommentSmartReplyRules: next },
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        },
      )
      setAllRules(next)
      toast.success('Smart Reply saved')
      onSaved?.()
      onClose()
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const insertVariable = (key) => {
    const label = normalizeVariableLabel(key)
    if (!label) return
    setMessageBody((prev) => (prev || '') + `{${label}}`)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pb-3 border-b border-black/[0.08]">
          <DialogTitle className="text-lg font-semibold">Smart Reply</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : fbIg.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            Connect a Facebook Page or Instagram account to configure comment Smart Reply.
          </p>
        ) : (
          <div className="space-y-4 py-1 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Phrase</label>
              <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 rounded-md border border-input bg-background">
                {phrases.map((p, idx) => (
                  <span
                    key={`${p}-${idx}`}
                    className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm"
                  >
                    {p}
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => removePhrase(idx)}
                      aria-label="Remove phrase"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
                <input
                  className="flex-1 min-w-[120px] border-0 bg-transparent text-sm outline-none"
                  placeholder="Type and press Enter"
                  value={phraseInput}
                  onChange={(e) => setPhraseInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addPhraseFromInput()
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Page</label>
              <Select value={selectedKey} onValueChange={handleSelectConnection}>
                <SelectTrigger className="w-full bg-[#F9F9F9]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="z-[25000] bg-[#F9F9F9]">
                  {fbIg.map((c) => {
                    const k = ruleKey(c.platform, c.externalId)
                    return (
                      <SelectItem key={k} value={k}>
                        {c.displayName || c.externalId} ({c.platform === 'facebook' ? 'Facebook' : 'Instagram'})
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground">Message</label>
                <Select
                  value={selectedVariable}
                  onValueChange={(val) => {
                    setSelectedVariable('')
                    if (val) insertVariable(val)
                  }}
                >
                  <SelectTrigger className="h-8 w-[120px] text-xs bg-white">
                    <SelectValue placeholder="Variables" />
                  </SelectTrigger>
                  <SelectContent className="z-[25000]">
                    {uniqueColumns.map((variable) => (
                      <SelectItem key={variable} value={variable}>
                        {variable}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <textarea
                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Type your message"
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                maxLength={500}
              />
              <div className="text-right text-xs text-muted-foreground mt-1">
                {messageBody.length}/500 char
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-2 border-t border-black/[0.08] pt-3 flex w-full justify-between">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary))]/90 text-white"
            disabled={saving || loading || fbIg.length === 0}
            onClick={handleSave}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
