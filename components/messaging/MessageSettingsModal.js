'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import { toast } from '@/utils/toast'
import Apis from '@/components/apis/Apis'

const MessageSettingsModal = ({ open, onClose, selectedUser = null }) => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    aiIntegrationId: null,
    replyDelayEnabled: false,
    replyDelaySeconds: 30,
    saveAsDraftEnabled: false,
  })
  const [apiKey, setApiKey] = useState('')
  const [apiKeyError, setApiKeyError] = useState('')
  const [aiIntegrations, setAiIntegrations] = useState([])
  const [existingIntegrationId, setExistingIntegrationId] = useState(null)
  const [existingApiKey, setExistingApiKey] = useState('') // Store the actual API key for masking
  const [isEditingApiKey, setIsEditingApiKey] = useState(false) // Track if user is editing

  // Helper function to mask API key (show last 6 chars, rest as stars)
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

  // Sync API key display when both settings and integrations are loaded
  useEffect(() => {
    if (!open || isEditingApiKey || loading) return
    
    // If we have an integration ID and integrations list, but no API key displayed
    if (settings.aiIntegrationId && aiIntegrations.length > 0 && !existingApiKey && apiKey === '') {
      const existingIntegration = aiIntegrations.find(
        (int) => int.id === settings.aiIntegrationId
      )
      
      if (existingIntegration) {
        setExistingIntegrationId(existingIntegration.id)
        // Check if API key is in the integration object
        const apiKeyValue = existingIntegration.apiKey || ''
        if (apiKeyValue) {
          setExistingApiKey(apiKeyValue)
          setApiKey(maskApiKey(apiKeyValue))
        } else {
          // No API key returned (for security) - show placeholder
          setApiKey('••••••••••••••••••••••••••••••••')
        }
      }
    }
  }, [settings.aiIntegrationId, aiIntegrations, existingApiKey, apiKey, isEditingApiKey, loading, open])

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
        setSettings({
          aiIntegrationId: data.aiIntegrationId || null,
          replyDelayEnabled: data.replyDelayEnabled || false,
          replyDelaySeconds: data.replyDelaySeconds || 30,
          saveAsDraftEnabled: data.saveAsDraftEnabled || false,
        })

        // If there's an existing integration, store the API key for masking
        if (data.aiIntegration?.id) {
          setExistingIntegrationId(data.aiIntegration.id)
          // API key might not be returned for security - check if it exists
          const apiKeyValue = data.aiIntegration.apiKey || ''
          setExistingApiKey(apiKeyValue)
          // Show masked version in input if not editing
          if (!isEditingApiKey) {
            if (apiKeyValue) {
              // If we have the actual key, mask it
              setApiKey(maskApiKey(apiKeyValue))
            } else {
              // If no key returned (for security), show placeholder indicating key exists
              setApiKey('••••••••••••••••••••••••••••••••')
            }
          } else {
            setApiKey('')
          }
        } else {
          setExistingIntegrationId(null)
          setExistingApiKey('')
          setApiKey('')
        }
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
            // Store the API key if available (might not be returned for security)
            const apiKeyValue = existingIntegration.apiKey || ''
            
            if (apiKeyValue) {
              // If we have the actual key, store and mask it
              if (!existingApiKey) {
                setExistingApiKey(apiKeyValue)
              }
              // Show masked version if not editing
              if (!isEditingApiKey && apiKey === '') {
                setApiKey(maskApiKey(apiKeyValue))
              }
            } else if (!isEditingApiKey && apiKey === '' && !existingApiKey) {
              // If no API key in response but integration exists, show placeholder
              // This indicates an API key is set but not returned for security
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

      let integrationId = settings.aiIntegrationId

      // If API key is provided and it's not the masked version or placeholder, create or update the integration
      const trimmedApiKey = apiKey.trim()
      const isMaskedKey = existingApiKey && trimmedApiKey === maskApiKey(existingApiKey)
      const isPlaceholder = trimmedApiKey === '••••••••••••••••••••••••••••••••'
      
      if (trimmedApiKey && !isMaskedKey && !isPlaceholder) {
        try {
          if (existingIntegrationId) {
            // Update existing integration
            const updateUrl = `${Apis.BasePath}api/mail/ai-integrations/${existingIntegrationId}`
            const updateResponse = await axios.put(
              updateUrl,
              {
                provider: 'openai', // Default to openai for now
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
              // Update the existing API key with the new one (for masking display)
              setExistingApiKey(trimmedApiKey)
              setIsEditingApiKey(false)
              // Show masked version of new key
              setApiKey(maskApiKey(trimmedApiKey))
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
                provider: 'openai', // Default to openai for now
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
              // Store the new API key for masking
              setExistingApiKey(trimmedApiKey)
              setIsEditingApiKey(false)
              // Show masked version of new key
              setApiKey(maskApiKey(trimmedApiKey))
              // Update settings state to include the new integration ID
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

      // Save message settings
      const payload = {
        aiIntegrationId: integrationId || null,
        replyDelayEnabled: settings.replyDelayEnabled,
        replyDelaySeconds: settings.replyDelayEnabled ? settings.replyDelaySeconds : null,
        saveAsDraftEnabled: settings.saveAsDraftEnabled,
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Message Settings</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* API Key Section */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">API Key</label>
              <p className="text-sm text-gray-600">
                Bring in your own ChatGPT API keys to enable AI text and emails.
              </p>
              <Input
                type={isEditingApiKey ? "password" : "text"}
                placeholder={existingIntegrationId ? "Enter new API key to update" : "Enter your ChatGPT API key"}
                value={apiKey}
                onChange={(e) => {
                  const newValue = e.target.value
                  // If user starts typing and we're showing masked key or placeholder, switch to edit mode
                  const isPlaceholder = apiKey === '••••••••••••••••••••••••••••••••'
                  const isMaskedKey = existingApiKey && apiKey === maskApiKey(existingApiKey)
                  
                  if (!isEditingApiKey && (isPlaceholder || (isMaskedKey && newValue !== maskApiKey(existingApiKey)))) {
                    setIsEditingApiKey(true)
                    setApiKey(newValue)
                  } else {
                    setApiKey(newValue)
                  }
                  setApiKeyError('')
                }}
                onFocus={() => {
                  // When user focuses, if showing masked key or placeholder, switch to edit mode
                  const isPlaceholder = apiKey === '••••••••••••••••••••••••••••••••'
                  if ((existingApiKey || isPlaceholder) && !isEditingApiKey) {
                    setIsEditingApiKey(true)
                    setApiKey('') // Clear the masked/placeholder value so user can type
                  }
                }}
                onBlur={() => {
                  // If user didn't enter anything, restore masked key or placeholder
                  if (!apiKey.trim()) {
                    setIsEditingApiKey(false)
                    if (existingApiKey) {
                      setApiKey(maskApiKey(existingApiKey))
                    } else if (existingIntegrationId) {
                      // Show placeholder if integration exists but no key available
                      setApiKey('••••••••••••••••••••••••••••••••')
                    }
                  }
                }}
                className="border-2 border-[#00000020] rounded p-3 outline-none focus:outline-none focus:ring-0 focus:border-brand-primary focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-brand-primary"
              />
              {apiKeyError && (
                <p className="text-xs text-red-600 mt-1">{apiKeyError}</p>
              )}
            </div>

            {/* Set Reply Delay Section */}
            { (
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
                  <Input
                    type="number"
                    placeholder="Set delay time (in seconds)"
                    value={settings.replyDelaySeconds || ''}
                    onChange={(e) => handleDelaySecondsChange(e.target.value)}
                    min="0"
                    className="border-2 border-[#00000020] rounded p-3 outline-none focus:outline-none focus:ring-0 focus:border-brand-primary focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-brand-primary"
                  />
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
          </div>
        )}

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
            className="bg-brand-primary hover:bg-brand-primary/90 text-white"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MessageSettingsModal
