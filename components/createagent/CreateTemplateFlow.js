'use client'

import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import {
  Box,
  Typography,
  LinearProgress,
  Button,
  FormControl,
  Select,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Menu,
} from '@mui/material'
import ChevronDown from '@mui/icons-material/KeyboardArrowDown'
import MoreVert from '@mui/icons-material/MoreVert'
import axios from 'axios'
import { UserTypeOptions } from '@/constants/UserTypeOptions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SellerKycsQuestions } from '@/constants/Kycs'
import { PersistanceKeys } from '@/constants/Constants'
import Apis from '@/components/apis/Apis'
import CreateTemplatePreviewCard from './CreateTemplatePreviewCard'

const STEP_NAMES = [
  'Get Started',
  'Objective',
  'KYC',
  'Script',
  'Objections',
  'Guardrails',
]

const KYC_CATEGORIES = [
  { key: 'Needs', label: 'Needs', source: 'DefaultSellerKycsNeed' },
  { key: 'Motivation', label: 'Motivation', source: 'DefaultSellerKycsMotivation' },
  { key: 'Urgency', label: 'Urgency', source: 'DefaultSellerKycsUrgency' },
]

const cardStyle = {
  borderRadius: 2,
  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
  // border: '1px solid rgba(0,0,0,0.08)',
  bgcolor: '#fff',
  p: 3,
}

const inputClassName =
  'border-[0.5px] border-[rgba(0,0,0,0.1)] rounded p-3 outline-none focus:outline-none focus:ring-0 focus:border-brand-primary focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-brand-primary'
const inputStyleObj = { fontSize: 15, fontWeight: '500', borderRadius: '7px' }
const labelStyle = { fontSize: 14, fontWeight: '400' }

export default function CreateTemplateFlow({ onSaved }) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Form state
  const [industry, setIndustry] = useState('')
  const [name, setName] = useState('')
  const [agentRole, setAgentRole] = useState('')
  const [description, setDescription] = useState('')
  const [objective, setObjective] = useState('')
  const [kycNeeds, setKycNeeds] = useState(
    () => (SellerKycsQuestions.DefaultSellerKycsNeed || []).map((q) => ({ ...q }))
  )
  const [kycMotivation, setKycMotivation] = useState(
    () => (SellerKycsQuestions.DefaultSellerKycsMotivation || []).map((q) => ({ ...q }))
  )
  const [kycUrgency, setKycUrgency] = useState(
    () => (SellerKycsQuestions.DefaultSellerKycsUrgency || []).map((q) => ({ ...q }))
  )
  const [activeKycTab, setActiveKycTab] = useState('Needs')
  const [kycAddingInline, setKycAddingInline] = useState(false)
  const [kycNewQuestionDraft, setKycNewQuestionDraft] = useState('')
  const [kycMenuAnchor, setKycMenuAnchor] = useState(null)
  const [kycMenuIndex, setKycMenuIndex] = useState(null)
  const [greeting, setGreeting] = useState('')
  const [callScript, setCallScript] = useState('')
  const [objections, setObjections] = useState([])
  const [guardrails, setGuardrails] = useState([])
  const [templateCreated, setTemplateCreated] = useState(false)

  const totalSteps = 6
  const progressPercent = templateCreated ? 100 : ((step + 1) / totalSteps) * 100

  const canContinueStep0 =
    industry &&
    name.trim().length > 0 &&
    name.trim().length <= 20 &&
    agentRole.trim().length <= 20 &&
    description.trim().length <= 120

  const handleNext = useCallback(() => {
    if (step < 5) {
      setDirection(1)
      setStep((s) => s + 1)
      setError(null)
    }
  }, [step])

  const handleBack = useCallback(() => {
    if (step > 0) {
      setDirection(-1)
      setStep((s) => s - 1)
      setError(null)
    }
  }, [step])

  const buildPayload = useCallback(() => {
    const kycs = []
    ;[
      { list: kycNeeds, category: 'Needs' },
      { list: kycMotivation, category: 'Motivation' },
      { list: kycUrgency, category: 'Urgency' },
    ].forEach(({ list, category }) => {
      (list || []).forEach((item) => {
        if (item?.question?.trim()) {
          kycs.push({
            question: item.question.trim(),
            type: 'seller',
            category,
          })
        }
      })
    })
    const promptOutbound = {
      greeting: greeting || '',
      callScript: callScript || '',
      objective: objective || '',
      companyAgentInfo: '',
      personalCharacteristics: '',
      communication: '',
      booking: '',
      guardRails: '',
      objectionHandling: '',
      streetAddress: '',
      getTools: '',
    }
    const promptInbound = { ...promptOutbound }
    return {
      industry: UserTypeOptions.find((o) => o.userType === industry || String(o.id) === industry)?.userType || industry,
      name: name.trim().slice(0, 20),
      agentRole: (agentRole || '').trim().slice(0, 20),
      description: (description || '').trim().slice(0, 120),
      agentType: 'both',
      promptOutbound,
      promptInbound,
      objections: objections.map((o) => ({ title: o.title || '', description: o.description || '' })),
      guardrails: guardrails.map((g) => ({ title: g.title || '', description: g.description || '' })),
      kycs,
    }
  }, [
    industry,
    name,
    agentRole,
    description,
    objective,
    greeting,
    callScript,
    kycNeeds,
    kycMotivation,
    kycUrgency,
    objections,
    guardrails,
  ])

  const handleSubmit = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      const userData = localStorage.getItem(PersistanceKeys.LocalStorageUser) || localStorage.getItem('User')
      const token = userData ? JSON.parse(userData)?.token : null
      if (!token) {
        setError('Please log in again')
        setSaving(false)
        return
      }
      const payload = buildPayload()
      const res = await axios.post(Apis.createTemplate, payload, {
        headers: { Authorization: 'Bearer ' + token },
      })
      if (res?.data?.status) {
        setTemplateCreated(true)
        if (onSaved) onSaved(res.data.data)
      } else {
        setError(res?.data?.message || 'Failed to save template')
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save template')
    } finally {
      setSaving(false)
    }
  }, [buildPayload, onSaved])

  const handleContinue = useCallback(() => {
    if (step === 5) {
      handleSubmit()
    } else {
      handleNext()
    }
  }, [step, handleNext, handleSubmit])

  const getKycList = () => {
    if (activeKycTab === 'Needs') return kycNeeds
    if (activeKycTab === 'Motivation') return kycMotivation
    return kycUrgency
  }

  const setKycList = (updater) => {
    if (activeKycTab === 'Needs') setKycNeeds(updater(kycNeeds))
    else if (activeKycTab === 'Motivation') setKycMotivation(updater(kycMotivation))
    else setKycUrgency(updater(kycUrgency))
  }

  const addKycQuestion = () => {
    setKycList((prev) => [...(prev || []), { id: Date.now(), question: '' }])
  }

  const updateKycQuestion = (index, question) => {
    setKycList((prev) => {
      const next = [...(prev || [])]
      next[index] = { ...next[index], question }
      return next
    })
  }

  const removeKycQuestion = (index) => {
    setKycList((prev) => (prev || []).filter((_, i) => i !== index))
  }

  const saveKycNewQuestion = () => {
    const trimmed = kycNewQuestionDraft.trim()
    if (!trimmed) return
    setKycList((prev) => [...(prev || []), { id: Date.now(), question: trimmed }])
    setKycNewQuestionDraft('')
    setKycAddingInline(false)
  }

  const cancelKycInline = () => {
    setKycAddingInline(false)
    setKycNewQuestionDraft('')
  }

  const addObjection = () => {
    setObjections((prev) => [...prev, { title: '', description: '' }])
  }

  const updateObjection = (index, field, value) => {
    setObjections((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addGuardrail = () => {
    setGuardrails((prev) => [...prev, { title: '', description: '' }])
  }

  const updateGuardrail = (index, field, value) => {
    setGuardrails((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const isLastFormStep = step === 5
  const canContinue =
    step === 0 ? canContinueStep0 : step === 5 ? true : true
  const showForm = !templateCreated

  const brandPurple = '#6A0DAD'

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        minHeight: '100vh',
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Left column - light grey background #F9F9F9 */}
      <Box
        sx={{
          flex: '0 0 60%',
          bgcolor: '#F9F9F9',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 4, pt: 3, pb: 1 }}>
          <Image
            src="/assets/assignX.png"
            alt="assignX"
            height={29}
            width={122}
            style={{ objectFit: 'contain' }}
          />
        </Box>

        {showForm ? (
          <>
            <Box sx={{ flex: 1, overflow: 'auto', px: 4, pb: 2, justifyContent: 'center', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '' }}>
              <Typography
                sx={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#151515',
                  textAlign: 'center',
                  mt: 2,
                }}
              >
                Create your AI agent template
              </Typography>
              <Typography
                sx={{
                  fontSize: 11,
                  color: 'rgba(0,0,0,0.7)',
                  textAlign: 'center',
                  mt: 0.5,
                  mb: 3,
                }}
              >
                <p>The agent you create can be added to subaccounts as</p>
                <p>a template or published to the marketplace.</p>
              </Typography>

              <Box
                sx={{
                  overflow: 'hidden',
                  width: '100%',
                  maxWidth: 560,
                  mx: 'auto',
                  backgroundColor: ''
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    width: '100%',
                    transition: 'transform 0.35s ease-out',
                    transform: `translateX(-${step * 100}%)`,
                  }}
                >
                  {/* Step 0: Get Started */}
                  <Box sx={{ flex: '0 0 100%', px: 0.5 }}>
                    <Box sx={cardStyle}>
                      <Typography
                        sx={{
                          fontSize: 18,
                          fontWeight: 600,
                          color: '#151515',
                          textAlign: 'center',
                          mb: 3,
                        }}
                      >
                        Get Started
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box>
                          <Typography sx={{ ...labelStyle, color: '#151515', mb: 0.75 }}>
                            Agent Type
                          </Typography>
                          <FormControl fullWidth sx={{ mt: 1 }}>
                            <Select
                              value={industry}
                              onChange={(e) => setIndustry(e.target.value)}
                              displayEmpty
                              IconComponent={ChevronDown}
                              renderValue={(val) => {
                                if (!val) return 'Select'
                                const opt = UserTypeOptions.find((o) => o.userType === val)
                                return opt ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    {opt.icon && (
                                      <Image
                                        src={opt.icon}
                                        alt={opt.title}
                                        width={24}
                                        height={24}
                                        style={{ borderRadius: 4, objectFit: 'cover' }}
                                      />
                                    )}
                                    <span>{opt.title}</span>
                                  </Box>
                                ) : (
                                  val
                                )
                              }}
                              sx={{
                                ...inputStyleObj,
                                minHeight: 48,
                                borderRadius: '7px',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(0,0,0,0.1)',
                                  borderWidth: 0.5,
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(0,0,0,0.15)',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'hsl(var(--brand-primary, 270 75% 50%))',
                                  borderWidth: 0.5,
                                },
                              }}
                            >
                              <MenuItem value="">
                                <ListItemText primary="Select" />
                              </MenuItem>
                              {UserTypeOptions.map((opt) => (
                                <MenuItem key={opt.id} value={opt.userType}>
                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                    {opt.icon && (
                                      <Image
                                        src={opt.icon}
                                        alt={opt.title}
                                        width={28}
                                        height={28}
                                        style={{ borderRadius: 4, objectFit: 'cover' }}
                                      />
                                    )}
                                  </ListItemIcon>
                                  <ListItemText primary={opt.title} />
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                            <Typography sx={{ ...labelStyle, color: '#151515' }}>
                              Agent&apos;s Name
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: '#6b7280' }}>
                              {name.length}/20
                            </Typography>
                          </Box>
                          <Input
                            placeholder="Type here"
                            value={name}
                            onChange={(e) => setName(e.target.value.slice(0, 20))}
                            maxLength={20}
                            className={inputClassName}
                            style={{ ...inputStyleObj, marginTop: '8px' }}
                          />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                            <Typography sx={{ ...labelStyle, color: '#151515' }}>
                              Agent&apos;s Role
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: '#6b7280' }}>
                              {agentRole.length}/20
                            </Typography>
                          </Box>
                          <Input
                            placeholder="Type here"
                            value={agentRole}
                            onChange={(e) => setAgentRole(e.target.value.slice(0, 20))}
                            maxLength={20}
                            className={inputClassName}
                            style={{ ...inputStyleObj, marginTop: '8px' }}
                          />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                            <Typography sx={{ ...labelStyle, color: '#151515' }}>
                              Description
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: '#6b7280' }}>
                              {description.length}/120
                            </Typography>
                          </Box>
                          <Textarea
                            placeholder="Type here"
                            value={description}
                            onChange={(e) => setDescription(e.target.value.slice(0, 120))}
                            maxLength={120}
                            rows={3}
                            className={inputClassName}
                            style={{ ...inputStyleObj, marginTop: '8px', minHeight: 80 }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Step 1: Objective */}
                  <Box sx={{ flex: '0 0 100%', px: 0.5 }}>
                    <Box sx={cardStyle}>
                      <Typography
                        sx={{
                          fontSize: 18,
                          fontWeight: 600,
                          color: '#151515',
                          textAlign: 'center',
                          mb: 3,
                        }}
                      >
                        Objective
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: '#151515', mb: 1 }}>
                        What&apos;s the main objective?
                      </Typography>
                      <Textarea
                        placeholder="Type here"
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        rows={5}
                        className={inputClassName}
                        style={{ ...inputStyleObj, marginTop: '8px', minHeight: 120 }}
                      />
                    </Box>
                  </Box>

                  {/* Step 2: KYC */}
                  <Box sx={{ flex: '0 0 100%', px: 0.5 }}>
                    <Box sx={cardStyle}>
                      <Typography
                        sx={{
                          fontSize: 18,
                          fontWeight: 600,
                          color: '#151515',
                          mb: 2,
                        }}
                      >
                        What would you like to ask customers?
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0, borderBottom: '1px solid #e5e7eb', mb: 2 }}>
                        {KYC_CATEGORIES.map((cat) => (
                          <Button
                            key={cat.key}
                            onClick={() => {
                              setActiveKycTab(cat.label)
                              cancelKycInline()
                            }}
                            sx={{
                              textTransform: 'none',
                              fontSize: 14,
                              fontWeight: 500,
                              color: activeKycTab === cat.label ? 'hsl(var(--brand-primary, 270 75% 50%))' : '#6b7280',
                              borderBottom: activeKycTab === cat.label ? '2px solid' : 'none',
                              borderColor: 'hsl(var(--brand-primary, 270 75% 50%))',
                              borderRadius: 0,
                              px: 2,
                              py: 1,
                            }}
                          >
                            {cat.label}
                          </Button>
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {(getKycList() || []).map((item, index) => (
                          <Box
                            key={item.id || index}
                            sx={{
                              border: '0.5px solid rgba(0,0,0,0.1)',
                              borderRadius: 1.5,
                              p: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 1,
                              bgcolor: '#fff',
                            }}
                          >
                            <Typography sx={{ fontSize: 15, fontWeight: 400, color: '#151515', flex: 1 }}>
                              {item.question || ''}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                setKycMenuAnchor(e.currentTarget)
                                setKycMenuIndex(index)
                              }}
                              sx={{ color: '#6b7280', p: 0.5 }}
                            >
                              <MoreVert fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                      <Menu
                        anchorEl={kycMenuAnchor}
                        open={Boolean(kycMenuAnchor)}
                        onClose={() => { setKycMenuAnchor(null); setKycMenuIndex(null) }}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      >
                        <MenuItem
                          onClick={() => {
                            if (kycMenuIndex !== null) removeKycQuestion(kycMenuIndex)
                            setKycMenuAnchor(null)
                            setKycMenuIndex(null)
                          }}
                          sx={{ color: '#EA4335', fontSize: 14 }}
                        >
                          Delete
                        </MenuItem>
                      </Menu>
                      {!kycAddingInline ? (
                        <Button
                          onClick={() => setKycAddingInline(true)}
                          sx={{
                            textTransform: 'none',
                            color: 'hsl(var(--brand-primary, 270 75% 50%))',
                            fontWeight: 600,
                            mt: 1.5,
                            p: 0,
                          }}
                        >
                          Add New
                        </Button>
                      ) : (
                        <Box sx={{ mt: 2, p: 2, border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 1.5, bgcolor: '#fafafa' }}>
                          <Typography sx={{ ...labelStyle, color: '#151515', mb: 0.75 }}>
                            What&apos;s the question?
                          </Typography>
                          <Input
                            placeholder="Ex: What's your name?"
                            value={kycNewQuestionDraft}
                            onChange={(e) => setKycNewQuestionDraft(e.target.value.replace(/[{}\[\]<>]/g, ''))}
                            className={inputClassName}
                            style={{ ...inputStyleObj, marginTop: '8px' }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                            <Button
                              onClick={cancelKycInline}
                              sx={{
                                textTransform: 'none',
                                color: '#EA4335',
                                fontWeight: 500,
                                '&:hover': { bgcolor: 'rgba(234,67,53,0.08)' },
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="contained"
                              onClick={saveKycNewQuestion}
                              disabled={!kycNewQuestionDraft.trim()}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                bgcolor: 'hsl(var(--brand-primary, 270 75% 50%))',
                                '&:hover': { bgcolor: 'hsl(var(--brand-primary, 270 75% 50%) / 0.9)' },
                              }}
                            >
                              Save
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Step 3: Script */}
                  <Box sx={{ flex: '0 0 100%', px: 0.5 }}>
                    <Box sx={cardStyle}>
                      <Typography
                        sx={{
                          fontSize: 18,
                          fontWeight: 600,
                          color: '#151515',
                          textAlign: 'center',
                          mb: 3,
                        }}
                      >
                        Script
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#151515', mb: 0.75 }}>
                          Greetings
                        </Typography>
                        <Input
                          placeholder="Type here"
                          value={greeting}
                          onChange={(e) => setGreeting(e.target.value)}
                          className={inputClassName}
                          style={{ ...inputStyleObj, marginTop: '8px' }}
                        />
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#151515', mb: 0.75 }}>
                          Script
                        </Typography>
                        <Textarea
                          placeholder="Type here"
                          value={callScript}
                          onChange={(e) => setCallScript(e.target.value)}
                          rows={6}
                          className={inputClassName}
                          style={{ ...inputStyleObj, marginTop: '8px', minHeight: 140 }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Step 4: Objections */}
                  <Box sx={{ flex: '0 0 100%', px: 0.5 }}>
                    <Box sx={cardStyle}>
                      <Typography
                        sx={{
                          fontSize: 18,
                          fontWeight: 600,
                          color: '#151515',
                          textAlign: 'center',
                          mb: 2,
                        }}
                      >
                        Objections
                      </Typography>
                      {objections.length === 0 ? (
                        <Box
                          sx={{
                            textAlign: 'center',
                            py: 4,
                          }}
                        >
                          <Box
                            sx={{
                              width: 64,
                              height: 64,
                              borderRadius: '50%',
                              bgcolor: 'rgba(0,0,0,0.06)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              mb: 2,
                            }}
                          >
                            <Typography sx={{ fontSize: 32, color: '#9ca3af' }}>🏆</Typography>
                          </Box>
                          <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#151515', mb: 0.5 }}>
                            No Objections
                          </Typography>
                          <Typography sx={{ fontSize: 14, color: '#6b7280', mb: 2 }}>
                            Create common objections for this AI agent to handle during its conversations
                          </Typography>
                          <Button
                            onClick={addObjection}
                            sx={{
                              textTransform: 'none',
                              color: 'var(--brand-primary, #6A0DAD)',
                              fontWeight: 600,
                            }}
                          >
                            + Add New
                          </Button>
                        </Box>
                      ) : (
                        <>
                          {objections.map((obj, index) => (
                            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e5e7eb', borderRadius: 1 }}>
                              <Input
                                placeholder="Title"
                                value={obj.title || ''}
                                onChange={(e) => updateObjection(index, 'title', e.target.value)}
                                className={inputClassName}
                                style={{ ...inputStyleObj, marginBottom: 8 }}
                              />
                              <Textarea
                                placeholder="Description"
                                value={obj.description || ''}
                                onChange={(e) => updateObjection(index, 'description', e.target.value)}
                                rows={2}
                                className={inputClassName}
                                style={{ ...inputStyleObj, marginTop: '8px' }}
                              />
                            </Box>
                          ))}
                          <Button
                            onClick={addObjection}
                            sx={{
                              textTransform: 'none',
                              color: 'var(--brand-primary, #6A0DAD)',
                              fontWeight: 600,
                            }}
                          >
                            + Add New
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* Step 5: Guardrails */}
                  <Box sx={{ flex: '0 0 100%', px: 0.5 }}>
                    <Box sx={cardStyle}>
                      <Typography
                        sx={{
                          fontSize: 18,
                          fontWeight: 600,
                          color: '#151515',
                          textAlign: 'center',
                          mb: 2,
                        }}
                      >
                        Guardrails
                      </Typography>
                      {guardrails.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Box
                            sx={{
                              width: 64,
                              height: 64,
                              borderRadius: '50%',
                              bgcolor: 'rgba(0,0,0,0.06)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              mb: 2,
                            }}
                          >
                            <Typography sx={{ fontSize: 32, color: '#9ca3af' }}>🛡️</Typography>
                          </Box>
                          <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#151515', mb: 0.5 }}>
                            No Guardrails
                          </Typography>
                          <Typography sx={{ fontSize: 14, color: '#6b7280', mb: 2 }}>
                            Create guardrails for this AI agent to stay within boundaries
                          </Typography>
                          <Button
                            onClick={addGuardrail}
                            sx={{
                              textTransform: 'none',
                              color: 'var(--brand-primary, #6A0DAD)',
                              fontWeight: 600,
                            }}
                          >
                            + Add New
                          </Button>
                        </Box>
                      ) : (
                        <>
                          {guardrails.map((gr, index) => (
                            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e5e7eb', borderRadius: 1 }}>
                              <Input
                                placeholder="Title"
                                value={gr.title || ''}
                                onChange={(e) => updateGuardrail(index, 'title', e.target.value)}
                                className={inputClassName}
                                style={{ ...inputStyleObj, marginBottom: 8 }}
                              />
                              <Textarea
                                placeholder="Description"
                                value={gr.description || ''}
                                onChange={(e) => updateGuardrail(index, 'description', e.target.value)}
                                rows={2}
                                className={inputClassName}
                                style={{ ...inputStyleObj, marginTop: '8px' }}
                              />
                            </Box>
                          ))}
                          <Button
                            onClick={addGuardrail}
                            sx={{
                              textTransform: 'none',
                              color: 'var(--brand-primary, #6A0DAD)',
                              fontWeight: 600,
                            }}
                          >
                            + Add New
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
              </Box>
            </Box>

            {error && (
              <Typography sx={{ color: '#b91c1c', fontSize: 14, textAlign: 'center', mb: 1 }}>
                {error}
              </Typography>
            )}

            {/* Bottom bar - white with divider, progress, Back/Continue */}
            <Box
              sx={{
                flexShrink: 0,
                bgcolor: '#fff',
                borderTop: 'none',
                pt: 2,
                pb: 2,
                px: 4,
              }}
            >
              {/* Progress bar at top */}
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  width: '100%',
                  height: 6,
                  mb: 2,
                  borderRadius: 3,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: brandPurple,
                    borderRadius: 3,
                  },
                  bgcolor: 'rgba(106, 13, 173, 0.15)',
                }}
              />
              {/* Back and Continue buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  onClick={handleBack}
                  disabled={step === 0}
                  variant="outlined"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: 16,
                    color: brandPurple,
                    borderColor: 'rgba(0,0,0,0.12)',
                    bgcolor: '#fff',
                    '&:hover': {
                      borderColor: 'rgba(0,0,0,0.2)',
                      bgcolor: 'rgba(0,0,0,0.02)',
                    },
                    borderRadius: 2,
                    px: 3,
                    py: 1.25,
                  }}
                >
                  Back
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={(step === 0 && !canContinue) || saving}
                  variant="contained"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: 16,
                    color: '#fff',
                    bgcolor: brandPurple,
                    '&:hover': { bgcolor: '#5a0b94' },
                    borderRadius: 2,
                    px: 3,
                    py: 1.25,
                  }}
                >
                  {saving ? 'Saving...' : isLastFormStep ? 'Save Template' : 'Continue'}
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          /* Template Created view */
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              px: 4,
              py: 6,
            }}
          >
            <Typography
              sx={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#151515',
                textAlign: 'center',
                mb: 3,
              }}
            >
              Template created
            </Typography>
            <Box
              sx={{
                ...cardStyle,
                maxWidth: 400,
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#151515', mb: 2 }}>
                Congrats
              </Typography>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 30% 30%, #fce7f3 0%, #e0e7ff 50%, #e0f2fe 100%)',
                  mx: 'auto',
                  mb: 2,
                }}
              />
              <Typography sx={{ fontSize: 16, color: '#6b7280' }}>
                Almost done...
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Right column - solid purple; preview card centered */}
      <Box
        sx={{
          flex: '0 0 40%',
          minWidth: 280,
          flexShrink: 0,
          bgcolor: brandPurple,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CreateTemplatePreviewCard
          industry={industry}
          name={name}
          agentRole={agentRole}
          description={description}
        />
      </Box>
    </Box>
  )
}
