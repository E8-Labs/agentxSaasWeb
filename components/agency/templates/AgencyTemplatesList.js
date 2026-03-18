'use client'

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Typography,
} from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded'

import Apis from '@/components/apis/Apis'
import { UserTypeOptions } from '@/constants/UserTypeOptions'
import { AuthToken } from '@/components/agency/plan/AuthDetails'
import DelConfirmationModal from '@/components/common/DelConfirmationModal'
import { toast } from '@/utils/toast'

const cardShadow = '0 2px 12px rgba(0, 0, 0, 0.06)'
const cardShadowHover = '0 8px 24px rgba(0, 0, 0, 0.1)'
const textPrimary = '#151515'
const textSecondary = '#6b7280'
const textMuted = '#666666'
const grayCaption = '#8a8a8a'
const pillBg = 'rgba(255,255,255,0.4)'
const pillBorder = '1px solid rgba(255,255,255,1)'
const pillShadow = '0px 7px 50px 0px rgba(0,0,0,0.14)'
const borderSubtle = '1px solid rgba(21,21,21,0.1)'
const newCardBg = '#faf9ff'
const successGreen = '#01CB76'

/** Map industry value to display label (e.g. RealEstateAgent -> Real Estate) */
function industryLabel(industry) {
  if (!industry) return 'Industry'
  const map = {
    RealEstateAgent: 'Real Estate',
    SalesDevRep: 'Sales Dev',
    SolarRep: 'Solar',
    InsuranceAgent: 'Insurance',
    MarketerAgent: 'Marketer',
    RecruiterAgent: 'Recruiter',
    Creator: 'Creator',
    TaxAgent: 'Tax',
  }
  return map[industry] || industry.replace(/([A-Z])/g, ' $1').trim()
}

export default function AgencyTemplatesList() {
  const router = useRouter()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [menuAnchorEl, setMenuAnchorEl] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [openConfirmationDelete, setOpenConfirmationDelete] = useState(false)
  const [delLoader, setDelLoader] = useState(false)
  const [draftLoader, setDraftLoader] = useState(false)
  // Assign template to subaccount modal
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assigningForTemplate, setAssigningForTemplate] = useState(null)
  const [assignSubaccounts, setAssignSubaccounts] = useState([])
  const [assignSubaccountsLoading, setAssignSubaccountsLoading] = useState(false)
  const [assignAgentLoading, setAssignAgentLoading] = useState(false)
  const [assignError, setAssignError] = useState(null)
  const [selectedSubaccountId, setSelectedSubaccountId] = useState(null)
  const [assignAnchorEl, setAssignAnchorEl] = useState(null)

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(Apis.getTemplates, {
        headers: { Authorization: 'Bearer ' + AuthToken() },
      })
      if (res?.data?.status && res?.data?.data?.agencyTemplates) {
        console.log("res.data.data.agencyTemplates", res.data.data.agencyTemplates)
        setTemplates(res.data.data.agencyTemplates)
      } else {
        setTemplates([])
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || 'Failed to load templates',
      )
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const menuOpen = Boolean(menuAnchorEl)

  const handleMenuOpen = (event, template) => {
    event.preventDefault()
    event.stopPropagation()
    setMenuAnchorEl(event.currentTarget)
    setSelectedTemplate(template)
  }

  const handleMenuClose = () => {
    setMenuAnchorEl(null)
    setSelectedTemplate(null)
  }

  //function to pblish or draf template
  const handleDraftClick = async () => {
    try{
      setDraftLoader(true)
      const token = AuthToken()
      console.log("template.status", token)
      // {{template_id}}/status
      const status_to_update = selectedTemplate.status === 'published' || selectedTemplate.status === "Published" ? 'draft' : 'published'
      const ApiPath = `${Apis.draftTemplates}/${selectedTemplate.agentTemplateId}/status`
      const ApiData = {
        status: status_to_update
      }
      console.log("ApiPath for draft api", ApiPath)
      const response = await axios.patch(ApiPath, ApiData, {
        headers: { Authorization: 'Bearer ' + token },
      })
      console.log("response.data.data for draft api", response)
      if(response.data.status){
        toast.success('Template drafted successfully')
        await fetchTemplates()
        handleMenuClose()
      } else {
        toast.error(response.data.message || 'Failed to draft template')
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to draft template'
      toast.error(msg)
    } finally {
      setDraftLoader(false)
    }
  }

  const handleEdit = () => {
    if (!selectedTemplate) return
    handleMenuClose()
    router.push(`/create-template?templateId=${selectedTemplate.agentTemplateId}`)
  }

  const handleAssignClick = () => {
    if (!selectedTemplate) return
    setAssignAnchorEl(menuAnchorEl)
    setAssigningForTemplate(selectedTemplate)
    setAssignModalOpen(true)
    setAssignSubaccounts([])
    setSelectedSubaccountId(null)
    setAssignError(null)
    handleMenuClose()
  }

  useEffect(() => {
    if (!assignModalOpen || !assigningForTemplate) return
    let cancelled = false
    setAssignSubaccountsLoading(true)
    setAssignError(null)
    const token = AuthToken()
    axios
      .get('/api/agency/subaccounts', {
        params: { limit: 50, offset: 0 },
        headers: { Authorization: 'Bearer ' + token },
      })
      .then((res) => {
        if (cancelled) return
        const data = res?.data?.data ?? []
        setAssignSubaccounts(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (cancelled) return
        setAssignSubaccounts([])
        setAssignError(err?.response?.data?.message || err?.message || 'Failed to load subaccounts')
      })
      .finally(() => {
        if (!cancelled) setAssignSubaccountsLoading(false)
      })
    return () => { cancelled = true }
  }, [assignModalOpen, assigningForTemplate])

  const handleAssignModalClose = () => {
    setAssignModalOpen(false)
    setAssignAnchorEl(null)
    setAssigningForTemplate(null)
    setAssignSubaccounts([])
    setSelectedSubaccountId(null)
    setAssignError(null)
  }

  const isAgentLimitError = (message, status) => {
    if (!message || typeof message !== 'string') return false
    const lower = message.toLowerCase()
    const limitRelated =
      lower.includes('limit') &&
      (lower.includes('agent') || lower.includes('plan limit') || lower.includes('maximum number'))
    const knownLimitMessages =
      lower.includes("you've reached the limit on agents") ||
      lower.includes('maximum number of agents') ||
      lower.includes('add a payment method to create additional agents')
    return (status === 402 || status === 403) && (limitRelated || knownLimitMessages)
  }

  const handleConfirmAssign = async () => {
    if (!assigningForTemplate || selectedSubaccountId == null) return
    const template = assigningForTemplate
    const agentName = template.agentRole || template.name || 'Agent'
    const formData = new FormData()
    formData.append('userId', selectedSubaccountId)
    formData.append('agentTemplateId', template.agentTemplateId)
    formData.append('name', agentName)
    formData.append('agentRole', template.agentRole || '')
    formData.append('agentType', template.agentType || 'both')
    formData.append('agentObjective', template.name || '')
    formData.append('agentObjectiveDescription', template.description || '')
    setAssignAgentLoading(true)
    setAssignError(null)
    try {
      const res = await axios.post(Apis.buildAgent, formData, {
        headers: { Authorization: 'Bearer ' + AuthToken() },
      })
      if (res?.data?.status) {
        toast.success('Agent created successfully in selected subaccount.')
        handleAssignModalClose()
        fetchTemplates()
      } else {
        const msg = res?.data?.message || 'Failed to create agent'
        setAssignError(
          isAgentLimitError(msg, res?.status) ? 'Subaccount agent limit reached' : msg,
        )
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create agent'
      const status = err?.response?.status
      setAssignError(
        isAgentLimitError(msg, status) ? 'Subaccount agent limit reached' : msg,
      )
    } finally {
      setAssignAgentLoading(false)
    }
  }

  const handleDelete = async () => {
    // Use template passed from modal (selectedDetails) so delete runs only when modal Delete is clicked
    const id = selectedTemplate.agentTemplateId
    setDeletingId(id)
    setDelLoader(true)
    handleMenuClose()
    try {
      await axios.delete(`${Apis.getTemplates}/${id}`, {
        headers: { Authorization: 'Bearer ' + AuthToken() },
      })
      await fetchTemplates()
      setOpenConfirmationDelete(false)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete template'
      window.alert(msg)
    } finally {
      setDeletingId(null)
      setDelLoader(false)
    }
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={280}
        sx={{ color: textSecondary }}
      >
        <CircularProgress size={32} />
      </Box>
    )
  }

  // if (error) {
  //   return (
  //     <Box sx={{ p: 3 }}>
  //       <Typography sx={{ color: '#b91c1c', fontSize: '0.9375rem' }}>
  //         {error}
  //       </Typography>
  //     </Box>
  //   )
  // }

  return (
    <Box
      sx={{
        py: 3,
        mx: 'auto',
      }}
    >
      <Box
        sx={{
          pb: 2,
          mb: 2,
          px: 3,
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <Typography
          component="h1"
          sx={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: textPrimary,
            letterSpacing: '-0.02em',
          }}
        >
          Templates
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: 2.5,
          px: 3
        }}
      >
        {/* Template cards (Figma: node 24207-80889) */}
        {templates.map((t) => {
          const status = t?.status.toLowerCase()
          return (
            <Card
              key={t.agentTemplateId}
              elevation={0}
              sx={{
                borderRadius: '8px',
                boxShadow: cardShadow,
                border: borderSubtle,
                bgcolor: '#ffffff',
                minHeight: 260,
                overflow: 'hidden',
                transition: 'box-shadow 0.2s ease',
                '&:hover': {
                  boxShadow: cardShadowHover,
                },
              }}
            >
              <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Top section: pills + menu (Figma #faf9ff area) */}
                <Box
                  sx={{
                    bgcolor: newCardBg,
                    // borderBottom: borderSubtle,
                    px: 1,
                    py: 1,
                    position: 'relative',
                    minHeight: 180,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      width: '100%',
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: 0,
                      px: 1.5,
                      pt: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 0.5,
                          py: 0.25,
                          borderRadius: '64px',
                          bgcolor: pillBg,
                          border: pillBorder,
                          boxShadow: pillShadow,
                        }}
                      >
                        <Box
                          sx={{
                            width: 7.373,
                            height: 7.373,
                            borderRadius: '50%',
                            bgcolor: t?.status?.toLowerCase() === 'published' ? successGreen : textSecondary,
                          }}
                        />
                        <Typography
                          sx={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '12px',
                            fontWeight: 400,
                            lineHeight: '16px',
                            letterSpacing: '-0.06px',
                            color: textPrimary,
                          }}
                        >
                          {t?.status}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: 0.5,
                          py: 0.25,
                          borderRadius: '64px',
                          bgcolor: pillBg,
                          border: pillBorder,
                          boxShadow: pillShadow,
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '12px',
                            fontWeight: 400,
                            lineHeight: '16px',
                            letterSpacing: '-0.06px',
                            color: textPrimary,
                          }}
                        >
                          {industryLabel(t.industry)}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton
                      size="medium"
                      sx={{ color: textPrimary, mt: -1, mr: -0.5 }}
                      aria-label="More actions"
                      aria-haspopup="true"
                      aria-expanded={menuOpen ? 'true' : undefined}
                      aria-controls={menuOpen ? 'template-actions-menu' : undefined}
                      onClick={(e) => handleMenuOpen(e, t)}
                    >
                      <MoreHorizRoundedIcon fontSize="medium" />
                    </IconButton>
                    <Menu
                      id="template-actions-menu"
                      anchorEl={menuAnchorEl}
                      open={menuOpen}
                      onClose={handleMenuClose}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      PaperProps={{
                        sx: {
                          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                          borderRadius: '8px',
                          minWidth: 120,
                        },
                      }}
                    >
                      <MenuItem onClick={handleEdit}>Edit</MenuItem>
                      <MenuItem onClick={handleAssignClick}>Assign</MenuItem>
                      <MenuItem onClick={() => handleDraftClick(t)} disabled={draftLoader}>{draftLoader ? `${status === 'published' ? 'Drafting...' : 'Publishing...'}` : `${status === 'published' ? 'Draft' : 'Publish'}`}</MenuItem>
                      <MenuItem
                        onClick={() => {
                          setOpenConfirmationDelete(true)
                        }}
                        disabled={deletingId === selectedTemplate?.agentTemplateId}
                      >
                        {deletingId === selectedTemplate?.agentTemplateId ? 'Deleting…' : 'Delete'}
                      </MenuItem>
                    </Menu>
                  </Box>
                  {/* Avatar: industry icon or name initial */}
                  {(() => {
                    const industryIcon = t.industry
                      ? UserTypeOptions.find((o) => o.userType === t.industry)?.icon
                      : null
                    return (
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          background: industryIcon
                            ? 'transparent'
                            : 'radial-gradient(circle at 30% 30%, #e0e7ff 0%, #fce7f3 50%, #e0f2fe 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mt: 4,
                          flexShrink: 0,
                          overflow: 'hidden',
                        }}
                      >
                        {industryIcon ? (
                          <Image
                            src={industryIcon}
                            alt={industryLabel(t.industry)}
                            width={100}
                            height={100}
                            style={{ objectFit: 'cover', width: 100, height: 100 }}
                          />
                        ) : (
                          <Typography sx={{ fontSize: '1.75rem', fontWeight: 600, color: textPrimary }}>
                            {t.name ? t.name.charAt(0).toUpperCase() : '?'}
                          </Typography>
                        )}
                      </Box>
                    )
                  })()}
                  <Typography
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      fontWeight: 400,
                      lineHeight: '16px',
                      letterSpacing: '-0.06px',
                      color: textPrimary,
                      mt: 2,
                    }}
                  >
                    0 sub accounts
                  </Typography>
                </Box>

                {/* Name and Role */}
                <Box sx={{ px: 2, pt: 1.25, textAlign: 'center' }}>
                  <Typography
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      lineHeight: 1.2,
                      letterSpacing: '-0.14px',
                      color: textPrimary,
                    }}
                  >
                    {t.name || 'Unnamed template'}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '10px',
                      fontWeight: 400,
                      lineHeight: 1.2,
                      letterSpacing: '-0.1px',
                      color: grayCaption,
                    }}
                  >
                    {t.agentRole || 'Role'}
                  </Typography>
                </Box>

                {/* KPIs: Leads (unique called), Booked, Calls */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 0.5,
                    px: 1.5,
                    pt: 1.25,
                    // pb: 2,
                    mt: 'auto',
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                    <Typography
                      sx={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        fontWeight: 400,
                        lineHeight: 1.4,
                        letterSpacing: '-0.12px',
                        color: textMuted,
                      }}
                    >
                      Leads
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight: 1.4,
                        letterSpacing: '-0.14px',
                        color: textPrimary,
                      }}
                    >
                      {t.uniqueLeadsCalled != null ? t.uniqueLeadsCalled : '—'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                    <Typography
                      sx={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        fontWeight: 400,
                        lineHeight: 1.4,
                        letterSpacing: '-0.12px',
                        color: textMuted,
                      }}
                    >
                      Booked
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight: 1.4,
                        letterSpacing: '-0.14px',
                        color: textPrimary,
                      }}
                    >
                      {t.booked != null ? t.booked : '—'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                    <Typography
                      sx={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        fontWeight: 400,
                        lineHeight: 1.4,
                        letterSpacing: '-0.12px',
                        color: textMuted,
                      }}
                    >
                      Calls
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight: 1.4,
                        letterSpacing: '-0.14px',
                        color: textPrimary,
                      }}
                    >
                      {t.calls != null ? t.calls : '—'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )
        })}

        {/* Assign template to subaccount popover */}
        <Popover
          open={assignModalOpen}
          anchorEl={assignAnchorEl}
          onClose={handleAssignModalClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              borderRadius: '8px',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              minWidth: 320,
              maxWidth: 400,
              maxHeight: 'min(420px, 70vh)',
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          <Box sx={{ px: 2, pt: 2, pb: 1 }}>
            <Typography sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: textPrimary, fontSize: '1rem' }}>
              Assign template to subaccount
            </Typography>
          </Box>
          <Box sx={{ px: 2, flex: 1, minHeight: 0, overflow: 'auto' }}>
            {assignSubaccountsLoading ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress size={32} sx={{ color: textSecondary }} />
              </Box>
            ) : assignError ? (
              <Typography sx={{ color: '#b91c1c', fontSize: '0.875rem', py: 1 }}>
                {assignError}
              </Typography>
            ) : assignSubaccounts.length === 0 ? (
              <Typography sx={{ color: textSecondary, fontSize: '0.875rem', py: 2 }}>
                No subaccounts found.
              </Typography>
            ) : (
              <List dense sx={{ pt: 0 }}>
                {assignSubaccounts.map((sub) => (
                  <ListItemButton
                    key={sub.id}
                    selected={selectedSubaccountId === sub.id}
                    onClick={() => setSelectedSubaccountId(sub.id)}
                    sx={{
                      borderRadius: '8px',
                      mb: 0.5,
                      '&.Mui-selected': { bgcolor: 'rgba(21,21,21,0.06)' },
                    }}
                  >
                    <ListItemText
                      primary={sub.name || sub.email || `Subaccount ${sub.id}`}
                      secondary={sub.email && sub.name ? sub.email : null}
                      primaryTypographyProps={{ sx: { fontWeight: 500, color: textPrimary } }}
                      secondaryTypographyProps={{ sx: { fontSize: '0.75rem', color: textSecondary } }}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
          <Box sx={{ px: 2, py: 2, pt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleAssignModalClose} color="inherit" sx={{ color: textSecondary }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmAssign}
              disabled={assignSubaccountsLoading || assignAgentLoading || !selectedSubaccountId || assignSubaccounts.length === 0}
              sx={{
                bgcolor: 'hsl(var(--brand-primary, 270 75% 50%)) !important',
                color: '#fff !important',
                '&:hover': {
                  bgcolor: 'hsl(var(--brand-primary, 270 75% 50%) / 0.9) !important',
                },
              }}
            >
              {assignAgentLoading ? 'Creating…' : 'Assign'}
            </Button>
          </Box>
        </Popover>

        {/* Single delete confirmation modal (outside map so only one instance) */}
        <DelConfirmationModal
          showDelModal={openConfirmationDelete}
          setShowDelModal={setOpenConfirmationDelete}
          handleDelete={handleDelete}
          delLoader={delLoader}
          selectedDetails={selectedTemplate}
          title="template"
        />

        {/* New card Figma 24207-80562 */}
        {/* New Template card - always first (Figma: node 24207-80562) */}
        <Link href="/create-template" style={{ textDecoration: 'none' }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '8px',
              boxShadow: 'none',
              border: '0.738px solid rgba(21,21,21,0.1)',
              bgcolor: newCardBg,
              minHeight: 297,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
              '&:hover': {
                boxShadow: cardShadowHover,
                borderColor: 'rgba(21,21,21,0.15)',
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 5, width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5,
                  mx: 'auto',
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '3rem',
                    fontWeight: 300,
                    lineHeight: 1,
                    color: textPrimary,
                  }}
                >
                  +
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '1rem',
                    lineHeight: 'normal',
                    color: textPrimary,
                  }}
                >
                  New Template
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Link>
      </Box>
    </Box>
  )
}
