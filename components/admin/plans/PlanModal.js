'use client'

import { Plus, Trash2, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { PlanApiService } from '@/utilities/PlanApiService'

const PlanModal = ({ plan, onClose, planType }) => {
  const [formData, setFormData] = useState({
    title: '',
    planType: '',
    planDescription: '',
    price: 0,
    originalPrice: 0,
    discountedPrice: 0,
    percentageDiscount: 0,
    minutes: 0,
    aiCreditsMinutes: 0,
    contactsLimit: 0,
    billingCycle: 'monthly',
    hasTrial: false,
    trialMinutes: 0,
    trialValidForDays: 7,
    isActive: true,
    sortOrder: 0,
    displayOrder: 0,
    isFree: false,
    tag: '',
    status: '',
    planStatus: '',
    environment: 'production',
    dynamicFeatures: {
      maxAgents: 0,
      crmProvider: 'Copilot',
      aiCreditRate: 0.27,
      maxAICredits: 0,
      maxTeamSeats: 0,
      supportedLLMs: ['AgentX'],
      allowDNCChecks: false,
      allowWebAgents: false,
      maxSubAccounts: 0,
      allowLeadSource: false,
      maxIntegrations: 0,
      affiliatePercent: 0,
      allowEmbedAgents: false,
      allowAIPoweredCRM: false,
      allowAdvancedLLMs: false,
      allowPhoneNumbers: false,
      allowAIAaaSAcademy: false,
      allowWebhookAgents: false,
      comingSoonFeatures: [],
      profitSharePercent: 0,
      allowDiscordSupport: false,
      allowLeadEnrichment: false,
      allowTwilioTrustHub: false,
      automatedPayoutDays: 7,
      allowAIPoweredEmails: false,
      allowPriorityCalling: false,
      integrationProviders: ['Zapier'],
      allowCustomVoicemails: false,
      allowLiveCallTransfer: false,
      allowAIPowerediMessage: false,
      costPerAdditionalAgent: 0,
      leadEnrichmentProvider: 'Perplexity',
      allowUnlimitedTeamSeats: false,
      costPerAdditionalTeamSeat: 0,
      allowRAGKnowledgeBase: false,
      allowUnlimitedMinutes: false,
      allowCustomClientPlans: false,
      allowPersonalZoomSupport: false,
      allowDedicatedSupportLine: false,
      allowUltraPriorityCalling: false,
      allowVoiceCallsEmailsTexts: false,
    },
  })

  const [newLLM, setNewLLM] = useState('')
  const [newIntegrationProvider, setNewIntegrationProvider] = useState('')
  const [newComingSoonFeature, setNewComingSoonFeature] = useState('')

  useEffect(() => {
    if (plan) {
      console.log('PlanModal - Received plan data:', plan)
      // Map the plan data to the correct form fields
      const mappedPlan = {
        title: plan.name || plan.title || '',
        planType: plan.planType || '',
        planDescription: plan.description || plan.planDescription || '',
        price: plan.price || plan.totalPrice || 0,
        originalPrice: plan.originalPrice || 0,
        discountedPrice:
          plan.discountedPrice || plan.price || plan.totalPrice || 0,
        percentageDiscount: plan.percentageDiscount || 0,
        minutes: plan.minutes || 0,
        aiCreditsMinutes: plan.aiCreditsMinutes || 0,
        contactsLimit: plan.contactsLimit || 0,
        billingCycle: plan.billingCycle || 'monthly',
        hasTrial: plan.hasTrial || false,
        trialMinutes: plan.trialMinutes || 0,
        trialValidForDays: plan.trialValidForDays || 7,
        isActive: plan.isActive !== undefined ? plan.isActive : true,
        sortOrder: plan.sortOrder || 0,
        displayOrder: plan.displayOrder || 0,
        isFree: plan.isFree || false,
        tag: plan.tag || '',
        status: plan.status || '',
        planStatus: plan.planStatus || '',
        environment: plan.environment || 'production',
        dynamicFeatures: {
          ...formData.dynamicFeatures,
          ...plan.capabilities,
          ...plan.dynamicFeatures,
        },
      }

      console.log('PlanModal - Mapped plan data:', mappedPlan)
      setFormData(mappedPlan)
    }
  }, [plan])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFeatureChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      dynamicFeatures: {
        ...prev.dynamicFeatures,
        [field]: value,
      },
    }))
  }

  const addLLM = () => {
    if (newLLM.trim()) {
      handleFeatureChange('supportedLLMs', [
        ...formData.dynamicFeatures.supportedLLMs,
        newLLM.trim(),
      ])
      setNewLLM('')
    }
  }

  const removeLLM = (index) => {
    const updated = formData.dynamicFeatures.supportedLLMs.filter(
      (_, i) => i !== index,
    )
    handleFeatureChange('supportedLLMs', updated)
  }

  const addIntegrationProvider = () => {
    if (newIntegrationProvider.trim()) {
      handleFeatureChange('integrationProviders', [
        ...formData.dynamicFeatures.integrationProviders,
        newIntegrationProvider.trim(),
      ])
      setNewIntegrationProvider('')
    }
  }

  const removeIntegrationProvider = (index) => {
    const updated = formData.dynamicFeatures.integrationProviders.filter(
      (_, i) => i !== index,
    )
    handleFeatureChange('integrationProviders', updated)
  }

  const addComingSoonFeature = () => {
    if (newComingSoonFeature.trim()) {
      handleFeatureChange('comingSoonFeatures', [
        ...formData.dynamicFeatures.comingSoonFeatures,
        newComingSoonFeature.trim(),
      ])
      setNewComingSoonFeature('')
    }
  }

  const removeComingSoonFeature = (index) => {
    const updated = formData.dynamicFeatures.comingSoonFeatures.filter(
      (_, i) => i !== index,
    )
    handleFeatureChange('comingSoonFeatures', updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Map form data back to the correct API format
      const apiData = {
        ...formData,
        // For AgentX plans, map title back to name if needed
        ...(planType === 'agentx' && { name: formData.title }),
        // Ensure capabilities are properly structured
        capabilities: formData.dynamicFeatures,
      }

      console.log('PlanModal - Submitting data:', apiData)

      if (plan) {
        // Update existing plan
        if (planType === 'agency') {
          await PlanApiService.updateAgencyPlan(plan.id, apiData)
        } else {
          await PlanApiService.updateAgentXPlan(plan.id, apiData)
        }
      } else {
        // Create new plan
        if (planType === 'agency') {
          await PlanApiService.createAgencyPlan(apiData)
        } else {
          await PlanApiService.createAgentXPlan(apiData)
        }
      }
      onClose()
    } catch (error) {
      console.error('Error saving plan:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {plan ? 'Edit Plan' : 'Add New Plan'} -{' '}
            {planType === 'agency' ? 'Agency' : 'AgentX'}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Plan Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="planType">Plan Type</Label>
                  <Input
                    id="planType"
                    value={formData.planType}
                    onChange={(e) =>
                      handleInputChange('planType', e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="planDescription">Description</Label>
                <Textarea
                  id="planDescription"
                  value={formData.planDescription}
                  onChange={(e) =>
                    handleInputChange('planDescription', e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      handleInputChange(
                        'price',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="originalPrice">Original Price</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      handleInputChange(
                        'originalPrice',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="discountedPrice">Discounted Price</Label>
                  <Input
                    id="discountedPrice"
                    type="number"
                    value={formData.discountedPrice}
                    onChange={(e) =>
                      handleInputChange(
                        'discountedPrice',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="minutes">Minutes</Label>
                  <Input
                    id="minutes"
                    type="number"
                    value={formData.minutes}
                    onChange={(e) =>
                      handleInputChange(
                        'minutes',
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="aiCreditsMinutes">AI Credits Minutes</Label>
                  <Input
                    id="aiCreditsMinutes"
                    type="number"
                    value={formData.aiCreditsMinutes}
                    onChange={(e) =>
                      handleInputChange(
                        'aiCreditsMinutes',
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="contactsLimit">Contacts Limit</Label>
                  <Input
                    id="contactsLimit"
                    type="number"
                    value={formData.contactsLimit}
                    onChange={(e) =>
                      handleInputChange(
                        'contactsLimit',
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="billingCycle">Billing Cycle</Label>
                  <Select
                    value={formData.billingCycle}
                    onValueChange={(value) =>
                      handleInputChange('billingCycle', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tag">Tag</Label>
                  <Input
                    id="tag"
                    value={formData.tag}
                    onChange={(e) => handleInputChange('tag', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange('status', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      handleInputChange('isActive', checked)
                    }
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFree"
                    checked={formData.isFree}
                    onCheckedChange={(checked) =>
                      handleInputChange('isFree', checked)
                    }
                  />
                  <Label htmlFor="isFree">Free Plan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasTrial"
                    checked={formData.hasTrial}
                    onCheckedChange={(checked) =>
                      handleInputChange('hasTrial', checked)
                    }
                  />
                  <Label htmlFor="hasTrial">Has Trial</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="maxAgents">Max Agents</Label>
                  <Input
                    id="maxAgents"
                    type="number"
                    value={formData.dynamicFeatures.maxAgents}
                    onChange={(e) =>
                      handleFeatureChange(
                        'maxAgents',
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="maxAICredits">Max AI Credits</Label>
                  <Input
                    id="maxAICredits"
                    type="number"
                    value={formData.dynamicFeatures.maxAICredits}
                    onChange={(e) =>
                      handleFeatureChange(
                        'maxAICredits',
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="maxTeamSeats">Max Team Seats</Label>
                  <Input
                    id="maxTeamSeats"
                    type="number"
                    value={formData.dynamicFeatures.maxTeamSeats}
                    onChange={(e) =>
                      handleFeatureChange(
                        'maxTeamSeats',
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="aiCreditRate">AI Credit Rate</Label>
                  <Input
                    id="aiCreditRate"
                    type="number"
                    step="0.01"
                    value={formData.dynamicFeatures.aiCreditRate}
                    onChange={(e) =>
                      handleFeatureChange(
                        'aiCreditRate',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="profitSharePercent">Profit Share %</Label>
                  <Input
                    id="profitSharePercent"
                    type="number"
                    step="0.1"
                    value={formData.dynamicFeatures.profitSharePercent}
                    onChange={(e) =>
                      handleFeatureChange(
                        'profitSharePercent',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="affiliatePercent">Affiliate %</Label>
                  <Input
                    id="affiliatePercent"
                    type="number"
                    step="0.1"
                    value={formData.dynamicFeatures.affiliatePercent}
                    onChange={(e) =>
                      handleFeatureChange(
                        'affiliatePercent',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="maxSubAccounts">Max Sub Accounts</Label>
                  <Input
                    id="maxSubAccounts"
                    type="number"
                    value={formData.dynamicFeatures.maxSubAccounts}
                    onChange={(e) =>
                      handleFeatureChange(
                        'maxSubAccounts',
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="maxIntegrations">Max Integrations</Label>
                  <Input
                    id="maxIntegrations"
                    type="number"
                    value={formData.dynamicFeatures.maxIntegrations}
                    onChange={(e) =>
                      handleFeatureChange(
                        'maxIntegrations',
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="automatedPayoutDays">
                    Automated Payout Days
                  </Label>
                  <Input
                    id="automatedPayoutDays"
                    type="number"
                    value={formData.dynamicFeatures.automatedPayoutDays}
                    onChange={(e) =>
                      handleFeatureChange(
                        'automatedPayoutDays',
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
              </div>

              {/* Supported LLMs */}
              <div>
                <Label>Supported LLMs</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.dynamicFeatures.supportedLLMs.map((llm, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {llm}
                      <button
                        type="button"
                        onClick={() => removeLLM(index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newLLM}
                    onChange={(e) => setNewLLM(e.target.value)}
                    placeholder="Add new LLM"
                  />
                  <Button type="button" onClick={addLLM} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Integration Providers */}
              <div>
                <Label>Integration Providers</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.dynamicFeatures.integrationProviders.map(
                    (provider, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {provider}
                        <button
                          type="button"
                          onClick={() => removeIntegrationProvider(index)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ),
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newIntegrationProvider}
                    onChange={(e) => setNewIntegrationProvider(e.target.value)}
                    placeholder="Add new provider"
                  />
                  <Button
                    type="button"
                    onClick={addIntegrationProvider}
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Coming Soon Features */}
              <div>
                <Label>Coming Soon Features</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.dynamicFeatures.comingSoonFeatures.map(
                    (feature, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeComingSoonFeature(index)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ),
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newComingSoonFeature}
                    onChange={(e) => setNewComingSoonFeature(e.target.value)}
                    placeholder="Add new feature"
                  />
                  <Button
                    type="button"
                    onClick={addComingSoonFeature}
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Toggles */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'allowDNCChecks', label: 'Allow DNC Checks' },
                  { key: 'allowWebAgents', label: 'Allow Web Agents' },
                  { key: 'allowLeadSource', label: 'Allow Lead Source' },
                  { key: 'allowEmbedAgents', label: 'Allow Embed Agents' },
                  { key: 'allowAIPoweredCRM', label: 'Allow AI Powered CRM' },
                  { key: 'allowAdvancedLLMs', label: 'Allow Advanced LLMs' },
                  { key: 'allowPhoneNumbers', label: 'Allow Phone Numbers' },
                  { key: 'allowAIAaaSAcademy', label: 'Allow AI AaaS Academy' },
                  { key: 'allowWebhookAgents', label: 'Allow Webhook Agents' },
                  {
                    key: 'allowDiscordSupport',
                    label: 'Allow Discord Support',
                  },
                  {
                    key: 'allowLeadEnrichment',
                    label: 'Allow Lead Enrichment',
                  },
                  {
                    key: 'allowTwilioTrustHub',
                    label: 'Allow Twilio Trust Hub',
                  },
                  {
                    key: 'allowAIPoweredEmails',
                    label: 'Allow AI Powered Emails',
                  },
                  {
                    key: 'allowPriorityCalling',
                    label: 'Allow Priority Calling',
                  },
                  {
                    key: 'allowCustomVoicemails',
                    label: 'Allow Custom Voicemails',
                  },
                  {
                    key: 'allowLiveCallTransfer',
                    label: 'Allow Live Call Transfer',
                  },
                  {
                    key: 'allowAIPowerediMessage',
                    label: 'Allow AI Powered iMessage',
                  },
                  {
                    key: 'allowUnlimitedTeamSeats',
                    label: 'Allow Unlimited Team Seats',
                  },
                  {
                    key: 'allowRAGKnowledgeBase',
                    label: 'Allow RAG Knowledge Base',
                  },
                  {
                    key: 'allowUnlimitedMinutes',
                    label: 'Allow Unlimited Minutes',
                  },
                  {
                    key: 'allowCustomClientPlans',
                    label: 'Allow Custom Client Plans',
                  },
                  {
                    key: 'allowPersonalZoomSupport',
                    label: 'Allow Personal Zoom Support',
                  },
                  {
                    key: 'allowDedicatedSupportLine',
                    label: 'Allow Dedicated Support Line',
                  },
                  {
                    key: 'allowUltraPriorityCalling',
                    label: 'Allow Ultra Priority Calling',
                  },
                  {
                    key: 'allowVoiceCallsEmailsTexts',
                    label: 'Allow Voice Calls, Emails & Texts',
                  },
                ].map((feature) => (
                  <div
                    key={feature.key}
                    className="flex items-center space-x-2"
                  >
                    <Switch
                      id={feature.key}
                      checked={formData.dynamicFeatures[feature.key]}
                      onCheckedChange={(checked) =>
                        handleFeatureChange(feature.key, checked)
                      }
                    />
                    <Label htmlFor={feature.key}>{feature.label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              {plan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PlanModal
