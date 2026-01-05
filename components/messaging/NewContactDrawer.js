'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { X, Plus } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import Apis from '@/components/apis/Apis'
import { getTeamsList } from '@/components/onboarding/services/apisServices/ApiService'
import MultiSelectDropdownCn from '@/components/dashboard/leads/extras/MultiSelectDropdownCn'

const NewContactDrawer = ({ open, onClose, onSuccess }) => {
  // Form state
  const [selectedSmartlist, setSelectedSmartlist] = useState(null)
  const [showFields, setShowFields] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })
  const [selectedPipeline, setSelectedPipeline] = useState(null)
  const [selectedStage, setSelectedStage] = useState(null)
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState([])
  const [selectedAgent, setSelectedAgent] = useState(null)

  // Data state
  const [smartlists, setSmartlists] = useState([])
  const [pipelines, setPipelines] = useState([])
  const [stages, setStages] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [agents, setAgents] = useState([])

  // Loading states
  const [loadingSmartlists, setLoadingSmartlists] = useState(false)
  const [loadingPipelines, setLoadingPipelines] = useState(false)
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false)
  const [loadingAgents, setLoadingAgents] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Validation errors
  const [errors, setErrors] = useState({})

  // Reset form when drawer closes
  useEffect(() => {
    if (!open) {
      setSelectedSmartlist(null)
      setShowFields(false)
      setFormData({ firstName: '', lastName: '', email: '', phone: '' })
      setSelectedPipeline(null)
      setSelectedStage(null)
      setSelectedTeamMemberIds([])
      setSelectedAgent(null)
      setStages([])
      setAgents([])
      setErrors({})
    }
  }, [open])

  // Fetch smartlists
  useEffect(() => {
    if (open) {
      fetchSmartlists()
      fetchPipelines()
      fetchTeamMembers()
    }
  }, [open])

  // Fetch agents when pipeline is selected
  useEffect(() => {
    if (open && selectedPipeline?.id) {
      fetchAgents(selectedPipeline.id)
    } else {
      setAgents([])
      setSelectedAgent(null)
    }
  }, [open, selectedPipeline])

  // Update stages when pipeline changes
  useEffect(() => {
    if (selectedPipeline?.stages) {
      setStages(selectedPipeline.stages)
      setSelectedStage(null) // Reset stage when pipeline changes
    } else {
      setStages([])
      setSelectedStage(null)
    }
  }, [selectedPipeline])

  // Handle smartlist selection - show fields with animation
  const handleSmartlistSelect = (value) => {
    const smartlist = smartlists.find((s) => s.id.toString() === value)
    setSelectedSmartlist(smartlist)
    setErrors((prev) => ({ ...prev, smartlist: null }))
    
    // Animate in fields after a short delay
    setTimeout(() => {
      setShowFields(true)
    }, 100)
  }

  const fetchSmartlists = async () => {
    try {
      setLoadingSmartlists(true)
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      const response = await axios.get('/api/smartlists?type=manual', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status && response.data?.data) {
        setSmartlists(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching smartlists:', error)
      toast.error('Failed to load smartlists')
    } finally {
      setLoadingSmartlists(false)
    }
  }

  const fetchPipelines = async () => {
    try {
      setLoadingPipelines(true)
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      const response = await axios.get(`${Apis.getPipelines}?liteResource=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status && response.data?.data) {
        setPipelines(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching pipelines:', error)
      toast.error('Failed to load pipelines')
    } finally {
      setLoadingPipelines(false)
    }
  }

  const fetchTeamMembers = async () => {
    try {
      setLoadingTeamMembers(true)
      const response = await getTeamsList()
      
      if (response) {
        const members = []
        // Add admin if exists
        if (response.admin) {
          members.push({
            id: response.admin.id,
            name: response.admin.name,
            email: response.admin.email,
            thumb_profile_image: response.admin.thumb_profile_image,
          })
        }
        // Add team members
        if (response.data && response.data.length > 0) {
          for (const t of response.data) {
            if (t.status === 'Accepted' && t.invitedUser) {
              members.push({
                id: t.invitedUser.id,
                name: t.invitedUser.name,
                email: t.invitedUser.email,
                thumb_profile_image: t.invitedUser.thumb_profile_image,
                invitedUserId: t.invitedUserId, // Keep for compatibility
              })
            }
          }
        }
        setTeamMembers(members)
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
      toast.error('Failed to load team members')
    } finally {
      setLoadingTeamMembers(false)
    }
  }

  const fetchAgents = async (pipelineId) => {
    try {
      setLoadingAgents(true)
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      const response = await axios.get(
        `${Apis.getAgents}?pipelineId=${pipelineId}&pipeline=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data?.status && response.data?.data) {
        // Filter to only show outbound agents
        const outboundAgents = response.data.data.filter((agent) => {
          // Check if agent has sub-agents with outbound type
          if (agent.agents && agent.agents.length > 0) {
            return agent.agents.some((subAgent) => subAgent.agentType === 'outbound')
          }
          return false
        })
        setAgents(outboundAgents)
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
      toast.error('Failed to load agents')
    } finally {
      setLoadingAgents(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!selectedSmartlist) {
      newErrors.smartlist = 'Smartlist is required'
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      const localData = localStorage.getItem('User')
      if (!localData) {
        toast.error('Please log in again')
        return
      }

      const userData = JSON.parse(localData)
      const token = userData.token

      // Build the payload according to the specified structure
      const payload = {
        sheetName: selectedSmartlist.sheetName,
        leads: [
          {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim() || '',
            fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
            phone: formData.phone.trim() || '',
            email: formData.email.trim() || '',
            address: '', // Not in form, but in example
            extraColumns: {},
          },
        ],
      }

      // Add optional fields if selected
      if (selectedPipeline?.id) {
        payload.pipelineId = selectedPipeline.id.toString()
      }

      if (selectedAgent?.id) {
        payload.mainAgentIds = [selectedAgent.id.toString()]
      }

      // Add team assignments if selected
      if (selectedTeamMemberIds.length > 0) {
        payload.teamsAssigned = selectedTeamMemberIds.map((id) => id.toString())
      }

      // Add default values from example
      payload.batchSize = 5
      payload.startTimeDifFromNow = 0

      const response = await axios.post(Apis.createLead, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status) {
        toast.success('Contact created successfully')
        onSuccess?.()
        onClose()
      } else {
        toast.error(response.data?.message || 'Failed to create contact')
      }
    } catch (error) {
      console.error('Error creating contact:', error)
      toast.error(error.response?.data?.message || 'Failed to create contact')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="!w-[1000px] !max-w-[500px] sm:!max-w-[500px] p-0 flex flex-col"
        style={{
          marginTop: '12px',
          marginBottom: '12px',
          marginRight: '12px',
          height: 'calc(100vh - 24px)',
          borderRadius: '12px',
          width: '600px',
          maxWidth: '600px',
        }}
      >
        <SheetHeader className="px-3 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold text-black">
              New Contact
            </SheetTitle>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {/* Smartlist Dropdown */}
          <div className="flex flex-col gap-1 px-0 py-2">
            <Label className="text-sm text-gray-600">Smartlist</Label>
            <Select
              value={selectedSmartlist?.id?.toString() || ''}
              onValueChange={handleSmartlistSelect}
              disabled={loadingSmartlists}
            >
              <SelectTrigger
                className={cn(
                  'h-9 bg-white border border-gray-200 rounded-lg shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary',
                  errors.smartlist && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                )}
              >
                <SelectValue placeholder="Select Smartlist" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {loadingSmartlists ? (
                  <div className="px-2 py-1.5 text-sm text-gray-500">
                    Loading...
                  </div>
                ) : smartlists.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-gray-500">
                    No smartlists available
                  </div>
                ) : (
                  smartlists.map((smartlist) => (
                    <SelectItem
                      key={smartlist.id}
                      value={smartlist.id.toString()}
                    >
                      {smartlist.sheetName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.smartlist && (
              <p className="text-xs text-red-500 mt-0.5">{errors.smartlist}</p>
            )}
          </div>

          <Separator className="my-4" />

          {/* Progressive Fields - Animated */}
          {showFields && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* First Name */}
              <div className="flex flex-col gap-1">
                <Label className="text-sm text-gray-600">
                  First Name<span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Type here"
                  className={cn(
                    'h-9 bg-white border border-gray-200 rounded-lg shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary',
                    errors.firstName && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  )}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500 mt-0.5">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="flex flex-col gap-1">
                <Label className="text-sm text-gray-600">Last Name</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Type here"
                  className="h-9 bg-white border border-gray-200 rounded-lg shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1">
                <Label className="text-sm text-gray-600">Email Address</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Type here"
                  className="h-9 bg-white border border-gray-200 rounded-lg shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1">
                <Label className="text-sm text-gray-600">Phone Number</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Type here"
                  className="h-9 bg-white border border-gray-200 rounded-lg shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <Separator className="my-4" />

              {/* Pipeline and Stage - Side by Side */}
              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1">
                  <Label className="text-sm text-gray-600">Pipeline</Label>
                  <Select
                    value={selectedPipeline?.id?.toString() || ''}
                    onValueChange={(value) => {
                      const pipeline = pipelines.find(
                        (p) => p.id.toString() === value
                      )
                      setSelectedPipeline(pipeline)
                    }}
                    disabled={loadingPipelines}
                  >
                    <SelectTrigger className="h-8 bg-white border border-gray-200 rounded-lg shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary">
                      <SelectValue placeholder="Select Pipeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingPipelines ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          Loading...
                        </div>
                      ) : pipelines.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          No pipelines available
                        </div>
                      ) : (
                        pipelines.map((pipeline) => (
                          <SelectItem
                            key={pipeline.id}
                            value={pipeline.id.toString()}
                          >
                            {pipeline.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <Label className="text-sm text-gray-600">Stage</Label>
                  <Select
                    value={selectedStage?.id?.toString() || ''}
                    onValueChange={(value) => {
                      const stage = stages.find((s) => s.id.toString() === value)
                      setSelectedStage(stage)
                    }}
                    disabled={!selectedPipeline || stages.length === 0}
                  >
                    <SelectTrigger className="h-8 bg-white border border-gray-200 rounded-lg shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary">
                      <SelectValue placeholder="Select Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          {selectedPipeline
                            ? 'No stages available'
                            : 'Select pipeline first'}
                        </div>
                      ) : (
                        stages.map((stage) => (
                          <SelectItem
                            key={stage.id}
                            value={stage.id.toString()}
                          >
                            {stage.stageTitle}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Assign to (Team Members) - Multi-select */}
              <div className="flex flex-col gap-1">
                <Label className="text-sm text-gray-600">Assign to</Label>
                {loadingTeamMembers ? (
                  <div className="px-2 py-1.5 text-sm text-gray-500">
                    Loading...
                  </div>
                ) : (
                  <MultiSelectDropdownCn
                    label="Assign"
                    options={teamMembers.map((member) => {
                      const id = member.id || member.invitedUserId
                      const isSelected = selectedTeamMemberIds.includes(id)
                      return {
                        id,
                        label: member.name,
                        avatar: member.thumb_profile_image,
                        selected: isSelected,
                        raw: member,
                      }
                    })}
                    onToggle={(opt, checked) => {
                      if (checked) {
                        setSelectedTeamMemberIds((prev) => [...prev, opt.id])
                      } else {
                        setSelectedTeamMemberIds((prev) =>
                          prev.filter((id) => id !== opt.id)
                        )
                      }
                    }}
                  />
                )}
              </div>

              {/* Agents Dropdown */}
              <div className="flex flex-col gap-1">
                <Label className="text-sm text-gray-600">Agent</Label>
                <Select
                  value={selectedAgent?.id?.toString() || ''}
                  onValueChange={(value) => {
                    const agent = agents.find((a) => a.id.toString() === value)
                    setSelectedAgent(agent)
                  }}
                  disabled={!selectedPipeline || loadingAgents}
                >
                  <SelectTrigger className="h-8 bg-white border border-gray-200 rounded-lg shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary">
                    <SelectValue placeholder="Select Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingAgents ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">
                        Loading...
                      </div>
                    ) : !selectedPipeline ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">
                        Select pipeline first
                      </div>
                    ) : agents.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">
                        No outbound agents available for this pipeline
                      </div>
                    ) : (
                      agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id.toString()}>
                          {agent.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

            </div>
          )}
        </div>

        <SheetFooter className="px-3 py-3 border-t border-gray-200 gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border border-gray-300"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white"
          >
            {submitting ? (
              'Creating...'
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default NewContactDrawer

