'use client'

import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import axios from 'axios'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info, ChevronRight, ArrowLeft } from 'lucide-react'
import { toast } from '@/utils/toast'
import Apis from '@/components/apis/Apis'
import {
  COMMUNICATION_STYLES,
  TAILORING_COMMUNICATION_OPTIONS,
  SENTENCE_STRUCTURE_OPTIONS,
  EXPRESSING_ENTHUSIASM_OPTIONS,
  EXPLAINING_COMPLEX_CONCEPTS_OPTIONS,
  GIVING_UPDATES_OPTIONS,
  HANDLING_OBJECTIONS_OPTIONS,
} from '@/components/constants/constants'
import { TypographyBody, TypographyH3Semibold, TypographyH4Semibold } from '@/lib/typography'
import { cn } from '@/lib/utils'

const MessageSettingsModal = ({ open, onClose, selectedUser = null }) => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    aiIntegrationId: null,
    replyDelayEnabled: false,
    replyDelaySeconds: 30,
    saveAsDraftEnabled: false,
    communicationStyle: null,
    tailoringCommunication: null,
    sentenceStructure: null,
    expressingEnthusiasm: null,
    explainingComplexConcepts: null,
    givingUpdates: null,
    handlingObjections: null,
    agentSettings: null, // { agentMeterSettings: { salesDrive, persuasiveness, clientHandling } }
  })
  const [subModalKey, setSubModalKey] = useState(null) // 'style' | 'tailoring' | ... | 'agentMeter'
  const [subModalSelectedValue, setSubModalSelectedValue] = useState(null) // value selected in sub-modal (before Save)
  const [agentMeterDraft, setAgentMeterDraft] = useState({ salesDrive: 5, persuasiveness: 5, clientHandling: 5 }) // for Agent Meter sub-modal (1-10)
  const [bubbleLeft, setBubbleLeft] = useState({ salesDrive: 50, persuasiveness: 50, clientHandling: 50 }) // % of track for bubble alignment
  const salesDriveTrackRef = useRef(null)
  const persuasivenessTrackRef = useRef(null)
  const clientHandlingTrackRef = useRef(null)
  const [savingSubModal, setSavingSubModal] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiKeyError, setApiKeyError] = useState('')
  const [aiIntegrations, setAiIntegrations] = useState([])
  const [existingIntegrationId, setExistingIntegrationId] = useState(null)
  const [existingApiKey, setExistingApiKey] = useState('') // Legacy: actual key when available (client-masked)
  const [storedApiKeyMasked, setStoredApiKeyMasked] = useState('') // Server-provided masked key (*** + last 6 chars) for display/restore
  const [isEditingApiKey, setIsEditingApiKey] = useState(false) // Track if user is editing
  const [selectedProvider, setSelectedProvider] = useState('openai') // 'openai' | 'google' for AI integration

  // useEffect(() => {
  //   console.log("Value of api key is", apiKey)
  // }, [apiKey])

  /** Normalize agentSettings from API: may be string (JSON) or object; always return object or null */
  const parseAgentSettings = (raw) => {
    if (raw == null) return null
    if (typeof raw === 'object' && raw !== null) return raw
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw)
      } catch {
        return null
      }
    }
    return null
  }

  // Helper function to mask API key (show last 6 chars, rest as stars) - used only when server sends raw key (legacy)
  const maskApiKey = (key) => {
    if (!key || key.length === 0) return ''
    if (key.length <= 6) return '*'.repeat(key.length)
    const last6 = key.slice(-6)
    const stars = '*'.repeat(key.length - 6)
    return stars + last6
  }

  // Fetch current settings when modal opens
  useEffect(() => {
    if (open) {
      fetchSettings()
      fetchAiIntegrations()
      setIsEditingApiKey(false) // Reset editing state when modal opens
    }
  }, [open, selectedUser])

  // Sync API key display from integrations: use selected aiIntegrationId, or first integration when none is set (so key always shows when user has one)
  useEffect(() => {
    if (!open || isEditingApiKey || loading) return
    if (aiIntegrations.length === 0) return

    const existingIntegration = settings.aiIntegrationId
      ? aiIntegrations.find((int) => int.id === settings.aiIntegrationId)
      : aiIntegrations[0]
    if (!existingIntegration) return

    setExistingIntegrationId(existingIntegration.id)
    const provider = existingIntegration.provider === 'google' ? 'google' : 'openai'
    setSelectedProvider(provider)
    const masked = existingIntegration.apiKeyMasked || ''
    const legacyRaw = existingIntegration.apiKey || ''
    if (masked) {
      setStoredApiKeyMasked(masked)
      setApiKey(masked)
    } else if (legacyRaw) {
      setExistingApiKey(legacyRaw)
      setApiKey(maskApiKey(legacyRaw))
    } else {
      setApiKey('••••••••••••••••••••••••••••••••')
    }
  }, [settings.aiIntegrationId, aiIntegrations, isEditingApiKey, loading, open])

  // Agent Meter: compute bubble position from actual track width so bubble/arrow align with thumb (18px thumb)
  const THUMB_PX = 18
  const measureBubbleLeft = () => {
    const calc = (el, value) => {
      if (!el) return 50
      const w = el.offsetWidth
      if (!w) return 50
      return ((Number(value) - 1) / 9 * (w - THUMB_PX) + THUMB_PX / 2) / w * 100
    }
    setBubbleLeft({
      salesDrive: calc(salesDriveTrackRef.current, agentMeterDraft.salesDrive),
      persuasiveness: calc(persuasivenessTrackRef.current, agentMeterDraft.persuasiveness),
      clientHandling: calc(clientHandlingTrackRef.current, agentMeterDraft.clientHandling),
    })
  }
  useLayoutEffect(() => {
    if (subModalKey !== 'agentMeter') return
    measureBubbleLeft()
    const id = requestAnimationFrame(() => measureBubbleLeft())
    return () => cancelAnimationFrame(id)
  }, [subModalKey, agentMeterDraft.salesDrive, agentMeterDraft.persuasiveness, agentMeterDraft.clientHandling])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const localData = localStorage.getItem('User')
      if (!localData) {
        toast.error('Please log in to view settings')
        return
      }

      const userData = JSON.parse(localData)
      const token = userData.token

      const params = selectedUser?.id ? { userId: selectedUser.id } : {}
      let apiUrl = `${Apis.BasePath}api/mail/settings`
      if (selectedUser?.id) {
        apiUrl += `?userId=${selectedUser.id}`
      }

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status && response.data?.data) {
        const data = response.data.data
        const agentSettings = parseAgentSettings(data.agentSettings)
        setSettings({
          aiIntegrationId: data.aiIntegrationId || null,
          replyDelayEnabled: data.replyDelayEnabled || false,
          replyDelaySeconds: data.replyDelaySeconds || 30,
          saveAsDraftEnabled: data.saveAsDraftEnabled || false,
          communicationStyle: data.communicationStyle ?? null,
          tailoringCommunication: data.tailoringCommunication ?? null,
          sentenceStructure: data.sentenceStructure ?? null,
          expressingEnthusiasm: data.expressingEnthusiasm ?? null,
          explainingComplexConcepts: data.explainingComplexConcepts ?? null,
          givingUpdates: data.givingUpdates ?? null,
          handlingObjections: data.handlingObjections ?? null,
          agentSettings: agentSettings ?? null,
        })
        const meter = agentSettings?.agentMeterSettings
        if (meter && typeof meter === 'object') {
          setAgentMeterDraft({
            salesDrive: typeof meter.salesDrive === 'number' && meter.salesDrive >= 1 && meter.salesDrive <= 10 ? meter.salesDrive : 5,
            persuasiveness: typeof meter.persuasiveness === 'number' && meter.persuasiveness >= 1 && meter.persuasiveness <= 10 ? meter.persuasiveness : 5,
            clientHandling: typeof meter.clientHandling === 'number' && meter.clientHandling >= 1 && meter.clientHandling <= 10 ? meter.clientHandling : 5,
          })
        }

        // If there's an existing integration, show apiKeyMasked (last 6 chars from server) or placeholder
        if (data.aiIntegration?.id) {
          setExistingIntegrationId(data.aiIntegration.id)
          const provider = data.aiIntegration.provider === 'google' ? 'google' : 'openai'
          setSelectedProvider(provider)
          const masked = data.aiIntegration.apiKeyMasked || ''
          const legacyRaw = data.aiIntegration.apiKey || ''
          if (!isEditingApiKey) {
            if (masked) {
              setStoredApiKeyMasked(masked)
              setApiKey(masked)
            } else if (legacyRaw) {
              setExistingApiKey(legacyRaw)
              setApiKey(maskApiKey(legacyRaw))
            } else {
              setApiKey('••••••••••••••••••••••••••••••••')
            }
          } else {
            setApiKey('')
          }
        } else if (!data.aiIntegrationId) {
          // Only clear when we're sure there's no integration (no id in settings)
          setExistingIntegrationId(null)
          setExistingApiKey('')
          setStoredApiKeyMasked('')
          setApiKey('')
          setSelectedProvider('openai')
        }
        // If data.aiIntegrationId is set but data.aiIntegration is missing, don't clear – let sync effect from fetchAiIntegrations populate display
      }
    } catch (error) {
      console.error('Error fetching message settings:', error)
      toast.error('Failed to load message settings')
    } finally {
      setLoading(false)
    }
  }

  const fetchAiIntegrations = async () => {
    try {
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      const params = selectedUser?.id ? { userId: selectedUser.id } : {}
      const apiUrl = selectedUser?.id
        ? `${Apis.BasePath}api/mail/ai-integrations?userId=${selectedUser.id}`
        : `${Apis.BasePath}api/mail/ai-integrations`

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log("response integrations", response);

      if (response.data?.status && Array.isArray(response.data?.data)) {
        setAiIntegrations(response.data.data)

        // Check if there's an existing integration
        if (response.data.data.length > 0) {
          // Use the integration ID from settings if available, otherwise use the first one
          const targetIntegrationId = settings.aiIntegrationId || response.data.data[0]?.id
          const existingIntegration = response.data.data.find(
            (int) => int.id === targetIntegrationId
          )

          if (existingIntegration) {
            setExistingIntegrationId(existingIntegration.id)
            const provider = existingIntegration.provider === 'google' ? 'google' : 'openai'
            setSelectedProvider(provider)
            const masked = existingIntegration.apiKeyMasked || ''
            const legacyRaw = existingIntegration.apiKey || ''
            if (masked && !isEditingApiKey && apiKey === '') {
              setStoredApiKeyMasked(masked)
              setApiKey(masked)
            } else if (legacyRaw && !isEditingApiKey && apiKey === '') {
              if (!existingApiKey) setExistingApiKey(legacyRaw)
              setApiKey(maskApiKey(legacyRaw))
            } else if (!isEditingApiKey && apiKey === '' && !masked && !legacyRaw) {
              setApiKey('••••••••••••••••••••••••••••••••')
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching AI integrations:', error)
      // Don't show error toast for this - it's optional
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setApiKeyError('')
      const localData = localStorage.getItem('User')
      if (!localData) {
        toast.error('Please log in to save settings')
        return
      }

      const userData = JSON.parse(localData)
      const token = userData.token

      // Validate: if replyDelayEnabled is true, replyDelaySeconds must be set
      if (settings.replyDelayEnabled && (!settings.replyDelaySeconds || settings.replyDelaySeconds < 0)) {
        toast.error('Please set a valid delay time in seconds')
        return
      }

      // Validate communication settings: each value must be in the allowed list for that key
      const communicationFieldsToValidate = [
        { key: 'communicationStyle', options: COMMUNICATION_STYLES },
        { key: 'tailoringCommunication', options: TAILORING_COMMUNICATION_OPTIONS },
        { key: 'sentenceStructure', options: SENTENCE_STRUCTURE_OPTIONS },
        { key: 'expressingEnthusiasm', options: EXPRESSING_ENTHUSIASM_OPTIONS },
        { key: 'explainingComplexConcepts', options: EXPLAINING_COMPLEX_CONCEPTS_OPTIONS },
        { key: 'givingUpdates', options: GIVING_UPDATES_OPTIONS },
        { key: 'handlingObjections', options: HANDLING_OBJECTIONS_OPTIONS },
      ]
      for (const { key, options } of communicationFieldsToValidate) {
        const v = settings[key]
        if (v != null && v !== '') {
          const validValues = options.map((o) => o.value)
          if (!validValues.includes(v)) {
            toast.error(`Invalid value for ${key}. Please refresh and try again.`)
            return
          }
        }
      }

      let integrationId = settings.aiIntegrationId

      // If API key is provided and it's not the masked version or placeholder, create or update the integration
      const trimmedApiKey = apiKey.trim()
      const isMaskedKey = (existingApiKey && trimmedApiKey === maskApiKey(existingApiKey)) ||
        (storedApiKeyMasked && trimmedApiKey === storedApiKeyMasked)
      const isPlaceholder = trimmedApiKey === '••••••••••••••••••••••••••••••••'

      if (trimmedApiKey && !isMaskedKey && !isPlaceholder) {
        try {
          if (existingIntegrationId) {
            // Update existing integration
            const updateUrl = `${Apis.BasePath}api/mail/ai-integrations/${existingIntegrationId}`
            const updateResponse = await axios.put(
              updateUrl,
              {
                provider: selectedProvider,
                apiKey: trimmedApiKey,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            )

            if (updateResponse.data?.status) {
              integrationId = existingIntegrationId
              setExistingApiKey(trimmedApiKey)
              setIsEditingApiKey(false)
              const newMasked = maskApiKey(trimmedApiKey)
              setStoredApiKeyMasked(newMasked)
              setApiKey(newMasked)
              toast.success('API key updated successfully')
            } else {
              throw new Error(updateResponse.data?.message || 'Failed to update API key')
            }
          } else {
            // Create new integration
            const createUrl = `${Apis.BasePath}api/mail/ai-integrations`
            const createResponse = await axios.post(
              createUrl,
              {
                provider: selectedProvider,
                apiKey: trimmedApiKey,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            )

            if (createResponse.data?.status && createResponse.data?.data) {
              integrationId = createResponse.data.data.id
              setExistingIntegrationId(integrationId)
              setExistingApiKey(trimmedApiKey)
              setIsEditingApiKey(false)
              const newMasked = maskApiKey(trimmedApiKey)
              setStoredApiKeyMasked(newMasked)
              setApiKey(newMasked)
              setSettings(prev => ({ ...prev, aiIntegrationId: integrationId }))
            } else {
              throw new Error(createResponse.data?.message || 'Failed to save API key')
            }
          }
        } catch (apiKeyError) {
          console.error('Error saving API key:', apiKeyError)
          setApiKeyError(apiKeyError.response?.data?.message || 'Failed to save API key. Please check the key and try again.')
          setSaving(false)
          return
        }
      }

      // Save message settings (including communication settings from backend)
      const agentSettings = parseAgentSettings(settings.agentSettings)
      const payload = {
        aiIntegrationId: integrationId || null,
        replyDelayEnabled: settings.replyDelayEnabled,
        replyDelaySeconds: settings.replyDelayEnabled ? settings.replyDelaySeconds : null,
        saveAsDraftEnabled: settings.saveAsDraftEnabled,
        communicationStyle: settings.communicationStyle ?? null,
        tailoringCommunication: settings.tailoringCommunication ?? null,
        sentenceStructure: settings.sentenceStructure ?? null,
        expressingEnthusiasm: settings.expressingEnthusiasm ?? null,
        explainingComplexConcepts: settings.explainingComplexConcepts ?? null,
        givingUpdates: settings.givingUpdates ?? null,
        handlingObjections: settings.handlingObjections ?? null,
        agentSettings: agentSettings ?? null,
      }

      // Add userId if viewing subaccount from admin/agency
      if (selectedUser?.id) {
        payload.userId = selectedUser.id
      }

      const apiUrl = `${Apis.BasePath}api/mail/settings`
      const response = await axios.put(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status) {
        toast.success('Message settings saved successfully')
        onClose()
      } else {
        toast.error(response.data?.message || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving message settings:', error)
      toast.error(error.response?.data?.message || 'Failed to save message settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReplyDelayToggle = (enabled) => {
    // If enabling delay, disable save as draft
    if (enabled) {
      setSettings({
        ...settings,
        replyDelayEnabled: true,
        saveAsDraftEnabled: false,
      })
    } else {
      setSettings({
        ...settings,
        replyDelayEnabled: false,
        replyDelaySeconds: null,
      })
    }
  }

  const handleSaveAsDraftToggle = (enabled) => {
    // If enabling save as draft, disable delay
    if (enabled) {
      setSettings({
        ...settings,
        saveAsDraftEnabled: true,
        replyDelayEnabled: false,
        replyDelaySeconds: null,
      })
    } else {
      setSettings({
        ...settings,
        saveAsDraftEnabled: false,
      })
    }
  }

  const handleDelaySecondsChange = (value) => {
    const numValue = parseInt(value) || 0
    setSettings({
      ...settings,
      replyDelaySeconds: numValue >= 0 ? numValue : 0,
    })
  }

  // Communication Settings rows config: key, label, options, question, settingsKey
  const communicationRowsConfig = [
    {
      key: 'style',
      label: 'Style',
      options: COMMUNICATION_STYLES,
      question: 'What is your communication style when you engage in conversations?',
      settingsKey: 'communicationStyle',
    },
    {
      key: 'tailoring',
      label: 'Tailoring Communication',
      options: TAILORING_COMMUNICATION_OPTIONS,
      question: 'How do you tailor your communication style in different conversations?',
      settingsKey: 'tailoringCommunication',
    },
    {
      key: 'sentenceStructure',
      label: 'Sentence Structure',
      options: SENTENCE_STRUCTURE_OPTIONS,
      question: 'Do you prefer to use short, concise sentences or more elaborate, detailed explanations?',
      settingsKey: 'sentenceStructure',
    },
    {
      key: 'expressingEnthusiasm',
      label: 'Expressing Enthusiasm',
      options: EXPRESSING_ENTHUSIASM_OPTIONS,
      question: 'How do you typically express enthusiasm or excitement in a conversation?',
      settingsKey: 'expressingEnthusiasm',
    },
    {
      key: 'explainingComplexConcepts',
      label: 'Explaining Complex Concepts',
      options: EXPLAINING_COMPLEX_CONCEPTS_OPTIONS,
      question: 'Which example best represents how you explain complex concepts or terms to clients?',
      settingsKey: 'explainingComplexConcepts',
    },
    {
      key: 'givingUpdates',
      label: 'Giving updates',
      options: GIVING_UPDATES_OPTIONS,
      question: 'How do you approach giving updates or bad news?',
      settingsKey: 'givingUpdates',
    },
    {
      key: 'handlingObjections',
      label: 'Handling Objections',
      options: HANDLING_OBJECTIONS_OPTIONS,
      question: 'How do you usually handle objections or concerns from clients?',
      settingsKey: 'handlingObjections',
    },
  ]

  const getLabelForValue = (options, value) => {
    if (!value) return null
    const opt = options.find((o) => o.value === value)
    return opt ? opt.label : null
  }

  const handleSaveCommunicationSubModal = async (settingsKey, value) => {
    const localData = localStorage.getItem('User')
    if (!localData) {
      toast.error('Please log in to save')
      return
    }
    // Client-side validation: value must be null or one of the allowed values for this key
    const config = communicationRowsConfig.find((r) => r.settingsKey === settingsKey)
    if (config) {
      const validValues = config.options.map((o) => o.value)
      if (value != null && value !== '' && !validValues.includes(value)) {
        toast.error(`Invalid value for ${config.label}. Please choose an option from the list.`)
        return
      }
    }
    const userData = JSON.parse(localData)
    const token = userData.token
    try {
      setSavingSubModal(true)
      const payload = {
        ...settings,
        [settingsKey]: value,
      }
      if (selectedUser?.id) payload.userId = selectedUser.id
      const apiUrl = `${Apis.BasePath}api/mail/settings`
      const response = await axios.put(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.data?.status && response.data?.data) {
        const data = response.data.data
        const agentSettings = parseAgentSettings(data.agentSettings)
        setSettings((prev) => ({
          ...prev,
          communicationStyle: data.communicationStyle ?? null,
          tailoringCommunication: data.tailoringCommunication ?? null,
          sentenceStructure: data.sentenceStructure ?? null,
          expressingEnthusiasm: data.expressingEnthusiasm ?? null,
          explainingComplexConcepts: data.explainingComplexConcepts ?? null,
          givingUpdates: data.givingUpdates ?? null,
          handlingObjections: data.handlingObjections ?? null,
          agentSettings: agentSettings ?? prev.agentSettings,
        }))
        setSubModalKey(null)
        toast.success('Saved')
      } else {
        toast.error(response.data?.message || 'Failed to save')
      }
    } catch (error) {
      console.error('Error saving communication setting:', error)
      toast.error(error.response?.data?.message || 'Failed to save')
    } finally {
      setSavingSubModal(false)
    }
  }

  const handleSaveAgentMeter = async () => {
    const localData = localStorage.getItem('User')
    console.log("Value of api key is", apiKey)
    if(!apiKey){
      toast.error('Please set an API key first')
      return;
    }
    if (settings?.replyDelayEnabled && (!settings.replyDelaySeconds || settings.replyDelaySeconds < 10)) {
      // console.log("Reply delay seconds is not set", settings);
      toast.error('Please set a valid delay time in seconds')
      return;
    }
    if (!localData) {
      toast.error('Please log in to save')
      return
    }
    const userData = JSON.parse(localData)
    const token = userData.token
    try {
      setSavingSubModal(true)
      const payload = {
        ...settings,
        agentSettings: {
          agentMeterSettings: {
            salesDrive: agentMeterDraft.salesDrive,
            persuasiveness: agentMeterDraft.persuasiveness,
            clientHandling: agentMeterDraft.clientHandling,
          },
        },
      }
      if (selectedUser?.id) payload.userId = selectedUser.id
      const apiUrl = `${Apis.BasePath}api/mail/settings`
      const response = await axios.put(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.data?.status && response.data?.data) {
        const data = response.data.data
        const agentSettings = parseAgentSettings(data.agentSettings)
        setSettings((prev) => ({ ...prev, agentSettings: agentSettings ?? prev.agentSettings }))
        setSubModalKey(null)
        toast.success('Saved')
      } else {
        toast.error(response.data?.message || 'Failed to save')
      }
    } catch (error) {
      console.error('Error saving agent meter:', error)
      toast.error(error.response?.data?.message || 'Failed to save')
    } finally {
      setSavingSubModal(false)
    }
  }

  const activeSubModalConfig = subModalKey && subModalKey !== 'agentMeter'
    ? communicationRowsConfig.find((r) => r.key === subModalKey)
    : null

  const isSubScreen = subModalKey !== null
  const isAgentMeterScreen = subModalKey === 'agentMeter'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md px-0" overlayClassName="bg-black/40" hideCloseButton={isSubScreen}>
        {/* Sub-screen: Agent Meter (sliders) or Communication setting (radio options) */}
        {isSubScreen ? (
          isAgentMeterScreen ? (
            <div className="max-h-[80svh] overflow-hidden">
              <DialogHeader className="flex flex-row items-center gap-3 pb-2 px-4">
                <button
                  type="button"
                  onClick={() => setSubModalKey(null)}
                  className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors -ml-1"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <DialogTitle className="text-xl font-bold flex-1">Agent Meter</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4 px-4 overflow-y-auto max-h-[60svh]">
                {(() => {
                  const bubbleStyle = (leftPct) => ({ left: `${leftPct}%`, transform: 'translateX(-50%)', top: -44 })
                  return (
                    <>
                      <div>
                        <TypographyH4Semibold>Sales Drive</TypographyH4Semibold>
                        <p className="text-sm text-gray-600 mb-0">On a scale of 1-10, how persistent are you in following up with potential clients?</p>
                        <div className="pt-14">
                          <div className="flex flex-row items-center gap-2">
                            <div className="flex rounded-full h-6 w-6 bg-gray-200 items-center justify-center shrink-0">
                              <TypographyBody>0</TypographyBody>
                            </div>
                            <div ref={salesDriveTrackRef} className="relative flex-1 min-w-0 overflow-visible">
                              <span className="agent-meter-bubble" style={bubbleStyle(bubbleLeft.salesDrive)}>
                                <span className="agent-meter-bubble-inner">{agentMeterDraft.salesDrive}</span>
                                <span className="agent-meter-bubble-arrow" aria-hidden />
                              </span>
                              <input
                                type="range"
                                min={1}
                                max={10}
                                value={agentMeterDraft.salesDrive}
                                onChange={(e) => setAgentMeterDraft((p) => ({ ...p, salesDrive: Number(e.target.value) }))}
                                className="agent-meter-slider w-full block"
                                style={{
                                  background: `linear-gradient(to right, hsl(var(--brand-primary)) 0%, hsl(var(--brand-primary)) ${bubbleLeft.salesDrive}%, #e5e7eb ${bubbleLeft.salesDrive}%, #e5e7eb 100%)`,
                                }}
                              />
                            </div>
                            <div className="flex rounded-full h-6 w-6 bg-gray-200 items-center justify-center shrink-0">
                              <TypographyBody>10</TypographyBody>
                            </div>
                          </div>
                        </div>

                      </div>
                      <div>
                        <TypographyH4Semibold className=" mt-1">Persuasiveness</TypographyH4Semibold>
                        <p className="text-sm text-gray-600 mb-2">On a scale of 1-10, how would you rate your ability to persuade clients to see the value in your product or service?</p>
                        <div className="pt-14">
                          <div className="flex flex-row items-center gap-2">
                            <div className="flex rounded-full h-6 w-6 bg-gray-200 items-center justify-center shrink-0">
                              <TypographyBody>0</TypographyBody>
                            </div>
                            <div ref={persuasivenessTrackRef} className="relative flex-1 min-w-0 overflow-visible">
                              <span className="agent-meter-bubble" style={bubbleStyle(bubbleLeft.persuasiveness)}>
                                <span className="agent-meter-bubble-inner">{agentMeterDraft.persuasiveness}</span>
                                <span className="agent-meter-bubble-arrow" aria-hidden />
                              </span>
                              <input
                                type="range"
                                min={1}
                                max={10}
                                value={agentMeterDraft.persuasiveness}
                                onChange={(e) => setAgentMeterDraft((p) => ({ ...p, persuasiveness: Number(e.target.value) }))}
                                className="agent-meter-slider w-full block"
                                style={{
                                  background: `linear-gradient(to right, hsl(var(--brand-primary)) 0%, hsl(var(--brand-primary)) ${bubbleLeft.persuasiveness}%, #e5e7eb ${bubbleLeft.persuasiveness}%, #e5e7eb 100%)`,
                                }}
                              />
                            </div>
                            <div className="flex rounded-full h-6 w-6 bg-gray-200 items-center justify-center shrink-0">
                              <TypographyBody>10</TypographyBody>
                            </div>
                          </div>
                        </div>

                      </div>
                      <div>
                        <TypographyH4Semibold className="mt-1">Client Handling</TypographyH4Semibold>
                        <p className="text-sm text-gray-600 mb-2">On a scale of 1-10, how would you rate your ability to manage client expectations and address their concerns effectively?</p>
                        <div className="pt-14">
                          <div className="flex flex-row items-center gap-2">
                            <div className="flex rounded-full h-6 w-6 bg-gray-200 items-center justify-center shrink-0">
                              <TypographyBody>0</TypographyBody>
                            </div>
                            <div ref={clientHandlingTrackRef} className="relative flex-1 min-w-0 overflow-visible">
                              <span className="agent-meter-bubble" style={bubbleStyle(bubbleLeft.clientHandling)}>
                                <span className="agent-meter-bubble-inner">{agentMeterDraft.clientHandling}</span>
                                <span className="agent-meter-bubble-arrow" aria-hidden />
                              </span>
                              <input
                                type="range"
                                min={1}
                                max={10}
                                value={agentMeterDraft.clientHandling}
                                onChange={(e) => setAgentMeterDraft((p) => ({ ...p, clientHandling: Number(e.target.value) }))}
                                className="agent-meter-slider w-full block"
                                style={{
                                  background: `linear-gradient(to right, hsl(var(--brand-primary)) 0%, hsl(var(--brand-primary)) ${bubbleLeft.clientHandling}%, #e5e7eb ${bubbleLeft.clientHandling}%, #e5e7eb 100%)`,
                                }}
                              />
                            </div>
                            <div className="flex rounded-full h-6 w-6 bg-gray-200 items-center justify-center shrink-0">
                              <TypographyBody>10</TypographyBody>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
              <DialogFooter className="w-full flex flex-row items-center justify-between sm:justify-between border-t pt-4 mt-2 px-4">
                <Button variant="outline" onClick={() => setSubModalKey(null)} disabled={savingSubModal}>Cancel</Button>
                <Button onClick={handleSaveAgentMeter} disabled={savingSubModal} style={{ backgroundColor: 'hsl(var(--brand-primary))' }} className="text-white hover:opacity-90">
                  {savingSubModal ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="max-h-[80svh] overflow-hidden">
              <DialogHeader className="flex flex-row items-center gap-3 pb-2 px-4">
                <button
                  type="button"
                  onClick={() => setSubModalKey(null)}
                  className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors -ml-1"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <DialogTitle className="text-xl font-bold flex-1">{activeSubModalConfig.label}</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-gray-600 mt-1 px-4">{activeSubModalConfig.question}</p>
              <div
                // className="space-y-2 py-4 overflow-y-auto flex-1 min-h-0 px-4"
                className="space-y-2 py-4 pl-4 pr-2 overflow-y-auto max-h-[60svh]"
              >
                {activeSubModalConfig.options.map((opt) => {
                  const isOptSelected = subModalSelectedValue === opt.value
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-3 rounded-lg border-[1px] cursor-pointer transition-colors ${isOptSelected ? '' : 'border-gray-[#1515151A10] hover:bg-gray-50 hover:border-[#1515151A10]'
                        }`}
                      style={
                        isOptSelected
                          ? {
                            borderColor: 'hsl(var(--brand-primary))',
                            backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
                          }
                          : undefined
                      }
                    >
                      <span className="relative mt-1 shrink-0 flex items-center justify-center w-4 h-4">
                        <input
                          type="radio"
                          name={activeSubModalConfig.settingsKey}
                          value={opt.value}
                          checked={isOptSelected}
                          onClick={(e) => {
                            if (isOptSelected) {
                              e.preventDefault();
                              setSubModalSelectedValue(null);
                            } else {
                              setSubModalSelectedValue(opt.value);
                            }
                          }}
                          onChange={() => {
                            if (!isOptSelected) setSubModalSelectedValue(opt.value);
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-[1]"
                        />
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center pointer-events-none ${!isOptSelected ? 'border-gray-300 bg-white' : ''
                            }`}
                          style={
                            isOptSelected
                              ? {
                                borderColor: 'hsl(var(--brand-primary))',
                                backgroundColor: 'hsl(var(--brand-primary))',
                              }
                              : undefined
                          }
                        >
                          {isOptSelected && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-white"
                              aria-hidden
                            />
                          )}
                        </span>
                      </span>
                      <div className="min-w-0">
                        <span
                          className="text-sm font-medium"
                          style={isOptSelected ? { color: 'hsl(var(--brand-primary))' } : undefined}
                        >
                          {opt.label}
                        </span>
                        {opt.bestFor && (
                          <p className="text-xs text-gray-500 mt-0.5">Best for: {opt.bestFor}</p>
                        )}
                        {opt.example && (
                          <p className="text-xs text-gray-600 mt-3">Ex: {opt.example}</p>
                        )}
                      </div>
                    </label>
                  )
                })}
              </div>
              <DialogFooter className="w-full flex flex-row items-center justify-between sm:justify-between border-t pt-4 mt-2 px-4">
                <Button
                  variant="outline-none"
                  onClick={() => setSubModalKey(null)}
                  disabled={savingSubModal}
                  className="bg-transparent hover:bg-gray-transparent text-black"
                  style={{
                    fontSize: '14px',
                    fontWeight: '400',
                    color: "#000000",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    handleSaveCommunicationSubModal(
                      activeSubModalConfig.settingsKey,
                      subModalSelectedValue
                    )
                  }
                  disabled={savingSubModal || !subModalSelectedValue}
                  className="hover:opacity-90 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-auto"
                  style={{
                    backgroundColor: 'hsl(var(--brand-primary))',
                    fontSize: '14px',
                    fontWeight: '400',
                    color: "#FFFFFF",
                    height: '36px',
                    width: '65px',
                  }}
                >
                  {savingSubModal ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </div>
          )
        ) : (
          <div className='max-h-[75svh] overflow-hidden px-4'>

            <div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">AI Message Settings</DialogTitle>
              </DialogHeader>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                </div>
              ) : (
                <div className="space-y-6 py-4 max-h-[60svh] overflow-y-auto">
                  {/* API Key Section */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">AI Provider</label>
                    <div className="flex gap-4 ms-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="aiProvider"
                          value="openai"
                          checked={selectedProvider === 'openai'}
                          onChange={() => setSelectedProvider('openai')}
                          className="border-2 border-[#00000020] text-brand-primary focus:ring-brand-primary"
                        />
                        <span className="text-sm text-gray-700">OpenAI (GPT)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="aiProvider"
                          value="google"
                          checked={selectedProvider === 'google'}
                          onChange={() => setSelectedProvider('google')}
                          className="border-2 border-[#00000020] text-brand-primary focus:ring-brand-primary"
                        />
                        <span className="text-sm text-gray-700">Google (Gemini)</span>
                      </label>
                    </div>

                    <p className="text-sm text-gray-600">
                      {selectedProvider === 'google'
                        ? 'Add Gemini API key to enable AI text+ email'
                        : 'Add ChatGPT API key to enable AI text+ email'}
                    </p>
                    <Input
                      type={isEditingApiKey ? "password" : "text"}
                      placeholder={
                        existingIntegrationId
                          ? 'Enter new API key to update'
                          : selectedProvider === 'google'
                            ? 'Enter your Gemini API key'
                            : 'Enter your OpenAI API key'
                      }
                      value={apiKey}
                      onChange={(e) => {
                        const newValue = e.target.value
                        const isPlaceholder = apiKey === '••••••••••••••••••••••••••••••••'
                        const isMaskedDisplay = storedApiKeyMasked && apiKey === storedApiKeyMasked
                        const isLegacyMasked = existingApiKey && apiKey === maskApiKey(existingApiKey)
                        if (!isEditingApiKey && (isPlaceholder || isMaskedDisplay || (isLegacyMasked && newValue !== maskApiKey(existingApiKey)))) {
                          setIsEditingApiKey(true)
                          setApiKey(newValue)
                        } else {
                          setApiKey(newValue)
                        }
                        setApiKeyError('')
                      }}
                      onBlur={() => {
                        if (!apiKey.trim()) {
                          setIsEditingApiKey(false)
                          if (storedApiKeyMasked) {
                            setApiKey(storedApiKeyMasked)
                          } else if (existingApiKey) {
                            setApiKey(maskApiKey(existingApiKey))
                          } else if (existingIntegrationId) {
                            setApiKey('••••••••••••••••••••••••••••••••')
                          }
                        }
                      }}
                      className={cn('h-10')}
                    />
                    {apiKeyError && (
                      <p className="text-xs text-red-600 mt-1">{apiKeyError}</p>
                    )}
                  </div>

                  {/* Set Reply Delay Section */}
                  {(
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-semibold text-gray-900">Set reply delay</label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" className="text-gray-400 hover:text-gray-600 transition-colors">
                                  <Info size={16} />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                align="start"
                                sideOffset={8}
                                className="max-w-xs bg-black text-white z-[1500]"
                                collisionPadding={{ top: 16, right: 16, bottom: 16, left: 16 }}
                              >
                                <p className="text-xs">
                                  This allows your AI to reply back to emails and text after a certain time. By default, this is set to 30 seconds.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Switch
                          checked={settings.replyDelayEnabled}
                          onCheckedChange={handleReplyDelayToggle}
                          className="data-[state=checked]:bg-brand-primary"
                        />
                      </div>
                      {settings.replyDelayEnabled && (
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="Set delay time (in seconds)"
                            value={settings.replyDelaySeconds || ''}
                            onChange={(e) => handleDelaySecondsChange(e.target.value)}
                            min={0}
                            className={cn('h-10 pr-10')}
                          />
                          <span
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                            aria-hidden
                          >
                            sec
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Save as Draft Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-gray-900">Save as draft</label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="text-gray-400 hover:text-gray-600 transition-colors">
                                <Info size={16} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              align="start"
                              sideOffset={8}
                              className="max-w-xs bg-black text-white z-[1500]"
                              collisionPadding={{ top: 16, right: 16, bottom: 16, left: 16 }}
                            >
                              <p className="text-xs">
                                Have your AI draft the response for you to review before sending.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Switch
                        checked={settings.saveAsDraftEnabled}
                        onCheckedChange={handleSaveAsDraftToggle}
                        className="data-[state=checked]:bg-brand-primary"
                      />
                    </div>
                  </div>

                  {/* Communication Settings */}
                  <div className="space-y-2">
                    <h3 className="text-sm text-[#666666]">Communication Settings</h3>
                    <div className="space-y-0 rounded-lg overflow-hidden">
                      {communicationRowsConfig.map((row) => {
                        const value = settings[row.settingsKey]
                        const selectedLabel = getLabelForValue(row.options, value)
                        return (
                          <button
                            key={row.key}
                            type="button"
                            onClick={() => {
                              setSubModalKey(row.key)
                              setSubModalSelectedValue(settings[row.settingsKey] ?? null)
                            }}
                            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left transition-colors bg-white hover:bg-gray-50 rounded-lg border-2 border-transparent focus:outline-none focus-visible:border-dashed focus-visible:border-gray-400"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-regular text-gray-900">{row.label}</div>
                              {selectedLabel && (
                                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium border border-gray-200 text-gray-500">
                                  {selectedLabel}
                                </span>
                              )}
                            </div>
                            <ChevronRight className="shrink-0 w-5 h-5 text-gray-400" />
                          </button>
                        )
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          const meter = settings.agentSettings?.agentMeterSettings
                          if (meter && typeof meter === 'object') {
                            setAgentMeterDraft({
                              salesDrive: typeof meter.salesDrive === 'number' && meter.salesDrive >= 1 && meter.salesDrive <= 10 ? meter.salesDrive : 5,
                              persuasiveness: typeof meter.persuasiveness === 'number' && meter.persuasiveness >= 1 && meter.persuasiveness <= 10 ? meter.persuasiveness : 5,
                              clientHandling: typeof meter.clientHandling === 'number' && meter.clientHandling >= 1 && meter.clientHandling <= 10 ? meter.clientHandling : 5,
                            })
                          }
                          setSubModalKey('agentMeter')
                        }}
                        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left transition-colors bg-white hover:bg-gray-50 rounded-lg border-2 border-transparent focus:outline-none focus-visible:border-dashed focus-visible:border-gray-400"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-regular text-gray-900">Agent meter</div>
                          {settings.agentSettings?.agentMeterSettings && (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium border border-gray-200 text-gray-500">
                                Sales: {settings.agentSettings.agentMeterSettings.salesDrive ?? '—'}
                              </span>
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium border border-gray-200 text-gray-500">
                                Persuasion: {settings.agentSettings.agentMeterSettings.persuasiveness ?? '—'}
                              </span>
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium border border-gray-200 text-gray-500">
                                Client: {settings.agentSettings.agentMeterSettings.clientHandling ?? '—'}
                              </span>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="shrink-0 w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={saving}
                className="bg-white hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || loading}
                className="hover:opacity-90 text-white"
                style={{ backgroundColor: 'hsl(var(--brand-primary))' }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default MessageSettingsModal
