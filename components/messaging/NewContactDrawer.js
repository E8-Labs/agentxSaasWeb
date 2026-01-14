'use client'

import 'react-phone-input-2/lib/style.css'

import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { X, Plus } from 'lucide-react'
import PhoneInput from 'react-phone-input-2'
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
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { getTeamsList } from '@/components/onboarding/services/apisServices/ApiService'
import MultiSelectDropdownCn from '@/components/dashboard/leads/extras/MultiSelectDropdownCn'
import CloseBtn from '../globalExtras/CloseBtn'

const NewContactDrawer = ({ open, onClose, onSuccess, selectedUser = null }) => {
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
  const [selectedAgents, setSelectedAgents] = useState([])
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState([])
  const [createMessageThread, setCreateMessageThread] = useState(false)
  const [isPipelineSelectOpen, setIsPipelineSelectOpen] = useState(false)
  const previousPipelineValueRef = useRef('')
  const valueChangedRef = useRef(false)

  // Data state
  const [smartlists, setSmartlists] = useState([])
  const [pipelines, setPipelines] = useState([])
  const [stages, setStages] = useState([])
  const [agents, setAgents] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [customFields, setCustomFields] = useState([])
  const [customFieldValues, setCustomFieldValues] = useState({})

  // Loading states
  const [loadingSmartlists, setLoadingSmartlists] = useState(false)
  const [loadingPipelines, setLoadingPipelines] = useState(false)
  const [loadingAgents, setLoadingAgents] = useState(false)
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false)
  const [loadingCustomFields, setLoadingCustomFields] = useState(false)
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
      // setSelectedAgentIds([])
      setSelectedTeamMemberIds([])
      setStages([])
      setAgents([])
      setTeamMembers([])
      setCustomFields([])
      setCustomFieldValues({})
      setErrors({})
      setCreateMessageThread(false)
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
      setSelectedAgents([])
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
    
    // Extract custom fields from smartlist if available, otherwise fetch them
    if (smartlist?.id) {
      try {
        if (smartlist.columns && Array.isArray(smartlist.columns) && smartlist.columns.length > 0) {
          extractCustomFields(smartlist.columns)
        } else {
          // If no columns in smartlist, try fetching them
          fetchCustomFields(smartlist.id)
        }
      } catch (error) {
        console.error('Error extracting custom fields:', error)
        // If extraction fails, set empty custom fields and still show default fields
        setCustomFields([])
        setCustomFieldValues({})
      }
    } else {
      // No smartlist selected, clear custom fields
      setCustomFields([])
      setCustomFieldValues({})
    }
    
    // Always show default fields (first name, last name, email, phone) after a short delay
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

      // Build query string with userId if selectedUser is provided (for agency viewing subaccount)
      // Pass type=all to fetch all smartlists regardless of type
      let queryString = 'type=all'
      const userId = selectedUser?.id || selectedUser?.userId || selectedUser?.user?.id
      if (userId) {
        queryString += `&userId=${userId}`
        console.log('📋 [NewContactDrawer] Fetching all smartlists for userId:', userId)
      } else {
        console.log('📋 [NewContactDrawer] Fetching all smartlists')
      }

      const apiPath = `/api/smartlists?${queryString}`
      const response = await axios.get(apiPath, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status && response.data?.data) {
        setSmartlists(response.data.data)
        console.log('✅ [NewContactDrawer] Loaded smartlists:', response.data.data.length)
      } else {
        console.warn('⚠️ [NewContactDrawer] No smartlists returned')
        setSmartlists([])
      }
    } catch (error) {
      console.error('❌ [NewContactDrawer] Error fetching smartlists:', error)
      toast.error('Failed to load smartlists')
      setSmartlists([])
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

      // Build query string with userId if selectedUser is provided (for agency viewing subaccount)
      let queryString = 'liteResource=true'
      const userId = selectedUser?.id || selectedUser?.userId || selectedUser?.user?.id
      if (userId) {
        queryString += `&userId=${userId}`
        console.log('📋 [NewContactDrawer] Fetching pipelines for userId:', userId)
      }

      const response = await axios.get(`/api/pipelines?${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status && response.data?.data) {
        setPipelines(response.data.data)
        console.log('✅ [NewContactDrawer] Loaded pipelines:', response.data.data.length)
      } else {
        console.warn('⚠️ [NewContactDrawer] No pipelines returned')
        setPipelines([])
      }
    } catch (error) {
      console.error('❌ [NewContactDrawer] Error fetching pipelines:', error)
      toast.error('Failed to load pipelines')
      setPipelines([])
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

      // Fetch all agents (same as AssignLead.js)
      const response = await axios.get('/api/agents', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status && response.data?.data) {
        // Step 1: Filter to only agents that have a pipeline and stages (same as AssignLead.js)
        const agentsWithPipeline = response.data.data.filter((agent) => {
          return agent.pipeline != null && agent.stages && agent.stages.length > 0
        })

        // Step 2: Filter by selected pipeline ID
        const agentsInPipeline = agentsWithPipeline.filter((agent) => {
          return agent.pipeline?.id?.toString() === pipelineId?.toString()
        })

        // Step 3: Filter to only show outbound agents with valid phone numbers and flatten the structure
        // Use a Map to deduplicate by mainAgentId - only keep one sub-agent per main agent
        const outboundAgentsMap = new Map()
        agentsInPipeline.forEach((agent) => {
          // Check if agent has sub-agents with outbound type
          if (agent.agents && agent.agents.length > 0) {
            agent.agents.forEach((subAgent) => {
              // Only include outbound agents with valid phone numbers
              const hasValidPhoneNumber =
                subAgent.phoneNumber &&
                subAgent.phoneNumber.trim() !== '' &&
                subAgent.phoneStatus !== 'inactive'
              
              if (subAgent.agentType === 'outbound' && hasValidPhoneNumber) {
                // Store main agent ID (from agent.id or subAgent.mainAgentId) for pipeline assignment
                const mainAgentId = agent.id || subAgent.mainAgentId
                
                // Only add if we haven't seen this mainAgentId before (deduplicate)
                if (!outboundAgentsMap.has(mainAgentId)) {
                  outboundAgentsMap.set(mainAgentId, {
                    id: subAgent.id, // Sub-agent ID for display/selection
                    mainAgentId: mainAgentId, // Main agent ID for pipeline assignment
                    name: subAgent.name || agent.name,
                    thumb_profile_image: subAgent.thumb_profile_image || agent.thumb_profile_image,
                    raw: { ...subAgent, mainAgentId },
                  })
                }
              }
            })
          }
        })
        setAgents(Array.from(outboundAgentsMap.values()))
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
      toast.error('Failed to load agents')
    } finally {
      setLoadingAgents(false)
    }
  }

  const extractCustomFields = (columns) => {
    // Default columns to exclude (case-insensitive)
    const excludedColumns = [
      'firstname',
      'lastname',
      'email',
      'phone',
      'fullname',
      'address',
      'name',
    ]

    // Ensure columns is an array
    if (!Array.isArray(columns) || columns.length === 0) {
      setCustomFields([])
      setCustomFieldValues({})
      return
    }

    // Filter out default columns and get custom fields
    const customCols = columns
      .filter((col) => {
        // Safely extract column name - handle both string and object formats
        let columnName = null
        if (typeof col === 'string') {
          columnName = col.toLowerCase()
        } else if (col && typeof col === 'object') {
          // Handle object with columnName property
          if (col.columnName && typeof col.columnName === 'string') {
            columnName = col.columnName.toLowerCase()
          }
        }
        
        // Skip if columnName couldn't be extracted or is in excluded list
        if (!columnName || excludedColumns.includes(columnName)) {
          return false
        }
        return true
      })
      .map((col) => {
        // Safely extract column name and id
        const columnName = typeof col === 'string' ? col : (col.columnName || '')
        const id = col.id || col.columnName || col || ''
        return {
          columnName: columnName,
          id: id,
        }
      })
      .filter((field) => field.columnName) // Remove any fields without a valid columnName

    setCustomFields(customCols)
    // Reset custom field values
    setCustomFieldValues({})
  }

  const fetchCustomFields = async (smartlistId) => {
    try {
      setLoadingCustomFields(true)
      const localData = localStorage.getItem('User')
      if (!localData) {
        setCustomFields([])
        return
      }

      const userData = JSON.parse(localData)
      const token = userData.token

      // Fetch smartlist details to get columns
      const response = await axios.get('/api/sheets', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status && response.data?.data) {
        // Find the selected smartlist
        const smartlist = response.data.data.find(
          (s) => s.id.toString() === smartlistId.toString()
        )

        if (smartlist?.columns && Array.isArray(smartlist.columns) && smartlist.columns.length > 0) {
          try {
            extractCustomFields(smartlist.columns)
          } catch (extractError) {
            console.error('Error extracting custom fields from fetched data:', extractError)
            setCustomFields([])
          }
        } else {
          // No columns found, set empty custom fields (default fields will still show)
          setCustomFields([])
        }
      } else {
        // No data returned, set empty custom fields
        setCustomFields([])
      }
    } catch (error) {
      console.error('Error fetching custom fields:', error)
      // Don't show error toast for missing custom fields - default fields should still work
      // Only show error if it's a real API error
      if (error.response?.status >= 500) {
        toast.error('Failed to load custom fields')
      }
      setCustomFields([])
    } finally {
      setLoadingCustomFields(false)
    }
  }

  // Email validation function
  const isValidEmail = (email) => {
    if (!email || !email.trim()) return true // Email is optional, so empty is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  // Phone validation function
  const isValidPhone = (phone) => {
    if (!phone || !phone.trim()) return false // Phone is required
    // Phone should have at least 10 digits (country code + number)
    // react-phone-input-2 includes country code, so we check for minimum length
    const digitsOnly = phone.replace(/\D/g, '')
    return digitsOnly.length >= 10
  }

  // Check if form is valid for enabling/disabling the button
  const isFormValid = () => {
    // First Name is required
    if (!formData.firstName.trim()) {
      return false
    }
    
    // Phone is required and must be valid
    if (!formData.phone.trim() || !isValidPhone(formData.phone)) {
      return false
    }
    
    // If email is provided, it must be valid
    if (formData.email.trim() && !isValidEmail(formData.email)) {
      return false
    }
    
    return true
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!selectedSmartlist) {
      newErrors.smartlist = 'Smartlist is required'
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    // Validate email if provided (email is optional)
    if (formData.email.trim() && !isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
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

      // Build extraColumns from custom fields
      const extraColumns = {}
      customFields.forEach((field) => {
        const value = customFieldValues[field.columnName]?.trim() || ''
        if (value) {
          extraColumns[field.columnName] = value
        }
      })

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
            extraColumns: extraColumns,
          },
        ],
      }

      // Add optional fields if selected
      if (selectedPipeline?.id) {
        payload.pipelineId = selectedPipeline.id.toString()
        
        // Add stageId if a stage is selected
        if (selectedStage?.id) {
          payload.stageId = selectedStage.id.toString()
        }
      }

      // Add agent assignments if selected (only if pipeline is selected)
      // Extract mainAgentIds from selected agent objects and deduplicate
      if (selectedPipeline?.id && selectedAgents.length > 0) {
        payload.mainAgentIds = [
          ...new Set(selectedAgents.map((agent) => agent.mainAgentId.toString())),
        ]
      }

      // Add team assignments if selected
      if (selectedTeamMemberIds.length > 0) {
        payload.teamsAssigned = selectedTeamMemberIds.map((id) => id.toString())
      }

      // Add default values from example
      payload.batchSize = 5
      payload.startTimeDifFromNow = 0

      // Add createMessageThread parameter
      if (createMessageThread) {
        payload.createMessageThread = true
      }

      // Add userId if selectedUser is provided (for agency creating contact for subaccount)
      const userId = selectedUser?.id || selectedUser?.userId || selectedUser?.user?.id
      if (userId) {
        payload.userId = userId.toString()
        console.log('📋 [NewContactDrawer] Creating contact for userId:', userId)
      }

      const response = await axios.post('/api/leads/create', payload, {
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
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
    // Real-time validation for email and phone
    if (field === 'email' && value.trim()) {
      if (!isValidEmail(value)) {
        setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }))
      } else {
        setErrors((prev) => ({ ...prev, email: null }))
      }
    }
    if (field === 'phone' && value.trim()) {
      if (!isValidPhone(value)) {
        setErrors((prev) => ({ ...prev, phone: 'Please enter a valid phone number' }))
      } else {
        setErrors((prev) => ({ ...prev, phone: null }))
      }
    }
  }

  const handleCustomFieldChange = (columnName, value) => {
    setCustomFieldValues((prev) => ({
      ...prev,
      [columnName]: value,
    }))
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="!w-[1000px] !max-w-[500px] sm:!max-w-[500px] p-0 flex flex-col [&>button]:hidden !z-[1400]"
        overlayClassName="!z-[1399]"
        style={{
          marginTop: '12px',
          marginBottom: '12px',
          marginRight: '12px',
          height: 'calc(100vh - 24px)',
          borderRadius: '12px',
          width: '600px',
          maxWidth: '600px',
          zIndex: 1400,
        }}
      >
        <SheetHeader className="px-3 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold text-black">
              New Contact
            </SheetTitle>
            <CloseBtn onClick={onClose} />
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
              <SelectContent className="max-h-[200px] !z-[1500]">
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
                  className={cn(
                    'h-9 bg-white border border-gray-200 rounded-lg shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary',
                    errors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  )}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1">
                <Label className="text-sm text-gray-600">
                  Phone Number<span className="text-red-500">*</span>
                </Label>
                <div
                  className={cn(
                    'rounded-lg border border-gray-200 shadow-sm bg-white focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary',
                    errors.phone && 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500'
                  )}
                >
                  <PhoneInput
                    country={'us'}
                    onlyCountries={['us', 'ca', 'mx']}
                    disableDropdown={false}
                    countryCodeEditable={false}
                    disableCountryCode={false}
                    value={formData.phone}
                    onChange={(value) => handleInputChange('phone', value)}
                    placeholder="Enter Phone Number"
                    containerClass="phone-input-container"
                    className="outline-none bg-transparent focus:ring-0"
                    style={{
                      borderRadius: '8px',
                      border: 'none',
                      outline: 'none',
                      boxShadow: 'none',
                      width: '100%',
                    }}
                    inputStyle={{
                      width: '100%',
                      borderWidth: '0px',
                      backgroundColor: 'transparent',
                      paddingLeft: '60px',
                      paddingTop: '8px',
                      paddingBottom: '8px',
                      height: '36px',
                      outline: 'none',
                      boxShadow: 'none',
                      fontSize: '14px',
                    }}
                    buttonStyle={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      outline: 'none',
                    }}
                    dropdownStyle={{
                      maxHeight: '150px',
                      overflowY: 'auto',
                    }}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-0.5">{errors.phone}</p>
                )}
              </div>

              {/* Custom Fields */}
              {loadingCustomFields ? (
                <div className="px-2 py-1.5 text-sm text-gray-500">
                  Loading custom fields...
                </div>
              ) : customFields.length > 0 ? (
                <>
                
                  <div className="space-y-4">
                    {customFields.map((field) => (
                      <div key={field.id || field.columnName} className="flex flex-col gap-1">
                        <Label className="text-sm text-gray-600">
                          {field.columnName}
                        </Label>
                        <Input
                          value={customFieldValues[field.columnName] || ''}
                          onChange={(e) =>
                            handleCustomFieldChange(field.columnName, e.target.value)
                          }
                          placeholder="Type here"
                          className="h-9 bg-white border border-gray-200 rounded-lg shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : null}

              <Separator className="my-4" />

              {/* Pipeline and Stage - Side by Side */}
              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1">
                  <Label className="text-sm text-gray-600">Pipeline</Label>
                  <Select
                    value={selectedPipeline?.id?.toString() || ''}
                    onOpenChange={(open) => {
                      if (open) {
                        // Store the current value when dropdown opens
                        previousPipelineValueRef.current = selectedPipeline?.id?.toString() || ''
                        valueChangedRef.current = false
                        setIsPipelineSelectOpen(true)
                      } else {
                        // When dropdown closes, check if value didn't change (same item clicked)
                        const currentValue = selectedPipeline?.id?.toString() || ''
                        if (isPipelineSelectOpen && !valueChangedRef.current && previousPipelineValueRef.current === currentValue && currentValue !== '') {
                          // Same item was clicked and value didn't change, toggle it off
                          setTimeout(() => {
                            setSelectedPipeline(null)
                            setSelectedStage(null)
                            setStages([])
                            setAgents([])
                            setSelectedAgents([])
                          }, 0)
                        }
                        setIsPipelineSelectOpen(false)
                      }
                    }}
                    onValueChange={(value) => {
                      valueChangedRef.current = true
                      if (!value) {
                        // Clear pipeline selection
                        setSelectedPipeline(null)
                        setSelectedStage(null)
                        setStages([])
                        setAgents([])
                        setSelectedAgents([])
                      } else {
                        const pipeline = pipelines.find(
                          (p) => p.id.toString() === value
                        )
                        // If selecting the same pipeline that's already selected, unselect it
                        if (selectedPipeline?.id?.toString() === value) {
                          setSelectedPipeline(null)
                          setSelectedStage(null)
                          setStages([])
                          setAgents([])
                          setSelectedAgents([])
                        } else {
                          setSelectedPipeline(pipeline)
                        }
                      }
                    }}
                    disabled={loadingPipelines}
                  >
                    <SelectTrigger className="h-8 bg-white border border-gray-200 rounded-lg shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary">
                      <SelectValue placeholder="Select Pipeline" />
                    </SelectTrigger>
                    <SelectContent className="!z-[1500]">
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
                    <SelectContent className="!z-[1500]">
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

              {/* Assign to (Agents and Team Members) - Multi-select - Only show when pipeline is selected */}
              {selectedPipeline && (
                <div className="flex flex-col gap-1">
                  <Label className="text-sm text-gray-600">Assign to</Label>
                  {loadingAgents ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                      Loading...
                    </div>
                  ) : agents.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                      No agents available
                    </div>
                  ) : (
                    <MultiSelectDropdownCn
                      label="Select"
                      options={agents.map((agent) => {
                        const id = `agent_${agent.id}`
                        // Check if this agent is selected by comparing mainAgentId
                        const isSelected = selectedAgents.some(
                          (selectedAgent) => selectedAgent.mainAgentId === agent.mainAgentId
                        )
                        return {
                          id,
                          label: agent.name,
                          avatar: agent.thumb_profile_image,
                          selected: isSelected,
                          raw: { ...agent, type: 'agent' },
                        }
                      })}
                      onToggle={(opt, checked) => {
                        const raw = opt.raw
                        if (raw.type === 'agent') {
                          // Handle agent selection - store complete agent object
                          if (checked) {
                            setSelectedAgents((prev) => {
                              // Avoid duplicates by checking mainAgentId
                              const exists = prev.some(
                                (agent) => agent.mainAgentId === raw.mainAgentId
                              )
                              if (!exists) {
                                return [...prev, raw]
                              }
                              return prev
                            })
                          } else {
                            setSelectedAgents((prev) =>
                              prev.filter((agent) => agent.mainAgentId !== raw.mainAgentId)
                            )
                          }
                        }
                      }}
                    />
                  )}
                </div>
              )}

              <Separator className="my-4" />

              {/* Create Message Thread Checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="createMessageThread"
                  checked={createMessageThread}
                  onCheckedChange={(checked) => setCreateMessageThread(checked === true)}
                />
                <Label
                  htmlFor="createMessageThread"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Create message thread
                </Label>
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
            disabled={submitting || !isFormValid()}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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

