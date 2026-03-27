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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getUniquesColumn } from '@/components/globalExtras/GetUniqueColumns'
import { ArrowLeft, Pencil, Plus, Trash2, X } from 'lucide-react'
import { toast } from '@/utils/toast'

function ruleKey(platform, externalId) {
  return `${platform}:${externalId}`
}

function makeTemplateId(platform, externalId) {
  return `tpl_${platform}_${String(externalId || '').replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function normalizeRule(raw) {
  const platform = raw?.platform === 'instagram' ? 'instagram' : 'facebook'
  const externalId = String(raw?.externalId || '').trim()
  return {
    ...raw,
    id:
      typeof raw?.id === 'string' && raw.id.trim()
        ? raw.id.trim()
        : makeTemplateId(platform, externalId),
    name: typeof raw?.name === 'string' ? raw.name : '',
    platform,
    externalId,
    phrases: Array.isArray(raw?.phrases) ? raw.phrases : [],
    message: typeof raw?.message === 'string' ? raw.message : '',
    isActive: raw?.isActive === undefined ? true : Boolean(raw.isActive),
    priority:
      raw?.priority == null || raw?.priority === ''
        ? 0
        : Number.isFinite(Number(raw.priority))
          ? Math.floor(Number(raw.priority))
          : 0,
  }
}

function normalizeRulesArray(rules) {
  return (Array.isArray(rules) ? rules : [])
    .filter((r) => r && typeof r === 'object')
    .map((r) => normalizeRule(r))
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
        (c) =>
          (c.platform === 'facebook' || c.platform === 'instagram') &&
          c?.isActive !== false,
      ),
    [socialConnections],
  )

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [allRules, setAllRules] = useState([])
  const [selectedKey, setSelectedKey] = useState('')
  const [editingTemplateId, setEditingTemplateId] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [phrases, setPhrases] = useState([])
  const [phraseInput, setPhraseInput] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [selectedVariable, setSelectedVariable] = useState('')
  const [uniqueColumns, setUniqueColumns] = useState([])
  const [viewMode, setViewMode] = useState('list') // 'list' | 'editor'

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
      setAllRules(normalizeRulesArray(rules))

      const first = fbIg[0]
      if (first) {
        setSelectedKey(ruleKey(first.platform, first.externalId))
      } else {
        setSelectedKey('')
      }
      setEditingTemplateId('')
      setTemplateName('')
      setPhrases([])
      setMessageBody('')
      setViewMode('list')
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

  const getSelection = useCallback((key) => {
    if (!key) return null
    const colon = key.indexOf(':')
    if (colon < 0) return null
    const platform = key.slice(0, colon)
    const externalId = key.slice(colon + 1)
    if (!platform || !externalId) return null
    return { platform, externalId }
  }, [])

  const selectedTemplates = useMemo(() => {
    const sel = getSelection(selectedKey)
    if (!sel) return []
    return allRules.filter(
      (r) =>
        r.platform === sel.platform &&
        String(r.externalId) === String(sel.externalId),
    )
  }, [allRules, selectedKey, getSelection])

  const resetEditor = () => {
    setEditingTemplateId('')
    setTemplateName('')
    setPhrases([])
    setPhraseInput('')
    setMessageBody('')
    setSelectedVariable('')
    setViewMode('list')
  }

  const handleSelectConnection = (key) => {
    setSelectedKey(key)
    resetEditor()
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

  const persistRules = async (nextRules) => {
    const localData = localStorage.getItem('User')
    if (!localData) return
    const userData = JSON.parse(localData)
    const token = userData.token
    let url = `${Apis.BasePath}api/mail/settings`
    if (selectedUser?.id) url += `?userId=${selectedUser.id}`

    const activeConnectionKeys = new Set(
      fbIg.map((c) => ruleKey(c.platform, String(c.externalId))),
    )
    const normalizedNext = normalizeRulesArray(nextRules)
    const filteredNext = normalizedNext.filter((r) =>
      activeConnectionKeys.has(ruleKey(r.platform, String(r.externalId))),
    )

    setSaving(true)
    try {
      await axios.put(
        url,
        { socialCommentSmartReplyRules: filteredNext },
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        },
      )
      setAllRules(filteredNext)
      toast.success('Smart Reply saved')
      onSaved?.()
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleStartAddTemplate = () => {
    if (!selectedKey) {
      toast.error('Select a page or account')
      return
    }
    resetEditor()
    const sel = getSelection(selectedKey)
    setEditingTemplateId(makeTemplateId(sel?.platform || 'facebook', sel?.externalId || ''))
    setViewMode('editor')
  }

  const handleEditTemplate = (tpl) => {
    const normalized = normalizeRule(tpl)
    setEditingTemplateId(String(normalized.id))
    setTemplateName(String(normalized.name || ''))
    setPhrases(Array.isArray(normalized.phrases) ? [...normalized.phrases] : [])
    setPhraseInput('')
    setMessageBody(String(normalized.message || ''))
    setViewMode('editor')
  }

  const handleDeleteTemplate = async (tplId) => {
    const next = allRules.filter((r) => String(r.id || '') !== String(tplId))
    await persistRules(next)
    if (String(editingTemplateId) === String(tplId)) {
      resetEditor()
    }
  }

  const handleToggleTemplateActive = async (tplId, nextActive) => {
    const next = allRules.map((r) =>
      String(r.id || '') === String(tplId)
        ? { ...r, isActive: Boolean(nextActive) }
        : r,
    )
    await persistRules(next)
  }

  const handleSaveTemplate = async () => {
    const sel = getSelection(selectedKey)
    if (!sel) {
      toast.error('Select a page or account')
      return
    }
    if (!editingTemplateId) {
      toast.error('Click Add Template first')
      return
    }
    const trimmedPhrases = phrases.map((p) => String(p).trim()).filter(Boolean)
    const msg = messageBody.trim()
    if (trimmedPhrases.length === 0) return toast.error('Add at least one phrase')
    if (!msg) return toast.error('Enter a message')
    if (msg.length > 500) return toast.error('Message must be 500 characters or less')

    const next = allRules.filter((r) => String(r.id || '') !== String(editingTemplateId))
    next.push({
      id: editingTemplateId,
      name: templateName.trim(),
      platform: sel.platform,
      externalId: String(sel.externalId),
      phrases: trimmedPhrases,
      message: msg,
      isActive: true,
      priority: 0,
    })
    await persistRules(next)
    resetEditor()
    setViewMode('list')
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

            <div className="rounded-md border border-input p-3 space-y-3">
              {viewMode === 'list' ? (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Templates</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={handleStartAddTemplate}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {selectedTemplates.length === 0 ? 'Add Template' : 'Add More'}
                    </Button>
                  </div>

                  {selectedTemplates.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-2">
                      No templates yet for this page/account.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedTemplates.map((tpl) => (
                        <div
                          key={tpl.id || `${tpl.platform}:${tpl.externalId}:${tpl.message?.slice(0, 24)}`}
                          className="rounded-md border border-input p-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {tpl.name?.trim() || 'Untitled template'}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {tpl.message}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[11px] ${
                                    tpl.isActive === false
                                      ? 'text-muted-foreground'
                                      : 'text-green-700'
                                  }`}
                                >
                                  {tpl.isActive === false ? 'Inactive' : 'Active'}
                                </span>
                                <Switch
                                  checked={tpl.isActive !== false}
                                  onCheckedChange={(v) =>
                                    handleToggleTemplateActive(tpl.id, v)
                                  }
                                  disabled={saving}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleEditTemplate(tpl)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteTemplate(tpl.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3 rounded-md border border-input p-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => {
                        setViewMode('list')
                        resetEditor()
                      }}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                    <p className="text-xs text-muted-foreground">Template Editor</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Template Name</label>
                    <input
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                      placeholder="e.g. Pricing question"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Phrases</label>
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

                  <div className="flex items-center justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={resetEditor}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary))]/90 text-white"
                      disabled={saving}
                      onClick={handleSaveTemplate}
                    >
                      {saving ? 'Saving…' : 'Save Template'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="mt-2 border-t border-black/[0.08] pt-3 flex w-full justify-between">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
