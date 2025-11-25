import {
  Box,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
} from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

import { AuthToken } from '@/components/agency/plan/AuthDetails'
import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import AddScoringModal from '@/components/modals/add-scoring-modal'
import { fetchTemplates } from '@/services/leadScoringSerevices/FetchTempletes'

import NoActionView from './NoActionView'

function LeadScoring({
  showDrawerSelectedAgent,
  activeTab,
  setUserDetails,
  setShowDrawerSelectedAgent,
  selectedUser,
}) {
  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [showAddScoringModal, setShowAddScoringModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false)
  const [snackbar, setSnackbar] = useState({
    isVisible: false,
    title: '',
    message: '',
    type: SnackbarTypes.Error,
  })

  useEffect(() => {
    if (activeTab === 'Actions' && showDrawerSelectedAgent?.id) {
      fetchTemplates({
        agentId: showDrawerSelectedAgent?.id,
        setTemplates: setTemplates,
        setTemplatesLoading: setTemplatesLoading,
        userId: selectedUser?.id,
      })

      // Also fetch agent's current scoring template
      fetchAgentScoring()
    }
  }, [
    activeTab,
    showDrawerSelectedAgent?.id,
    showDrawerSelectedAgent?.template,
  ])

  // Fetch agent's current scoring configuration
  const fetchAgentScoring = async () => {
    if (!showDrawerSelectedAgent?.id) return

    // Prefer fields on the selected agent first for instant preselection
    if (showDrawerSelectedAgent?.template?.id) {
      setSelectedTemplate(String(showDrawerSelectedAgent.template.id))
      return
    }
    if (showDrawerSelectedAgent?.templateId) {
      setSelectedTemplate(String(showDrawerSelectedAgent.templateId))
      return
    }
    if (showDrawerSelectedAgent?.scoringTemplateId) {
      setSelectedTemplate(String(showDrawerSelectedAgent.scoringTemplateId))
      return
    }

    try {
      const token = AuthToken()
      let path = `${Apis.getAgentScoring}/${showDrawerSelectedAgent.id}`
      if (selectedUser) {
        path = path + '?userId=' + selectedUser.id
      }
      const response = await axios.get(path, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data && response.data.status === true) {
        const agentScoring = response.data.data
        // Prefer templateId or nested template.id; fallback to id
        const selectedId =
          agentScoring?.templateId ??
          agentScoring?.template?.id ??
          agentScoring?.id
        if (selectedId) {
          setSelectedTemplate(String(selectedId))
        }
      }
    } catch (error) {
      console.error('Error fetching agent scoring:', error)
    }
  }

  console.log('templates', templates)

  const showSnackbar = (title, message, type = SnackbarTypes.Error) => {
    setSnackbar({
      isVisible: true,
      title,
      message,
      type,
    })
  }

  const hideSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, isVisible: false }))
  }

  const handleEditTemplate = (template) => {
    setEditingTemplate(template)
    setShowAddScoringModal(true)
  }

  const handleTemplateSelect = async (templateId) => {
    if (!templateId) {
      setSelectedTemplate('')
      return
    }

    const template = templates.find((t) => String(t.id) === String(templateId))
    if (!template) return

    // Set loading state to prevent dropdown from closing
    setIsApplyingTemplate(true)

    try {
      const token = AuthToken()
      let path = `${Apis.copyAgentScoring}/${showDrawerSelectedAgent?.id}/copy-template`
      if (selectedUser) {
        path = path + '?userId=' + selectedUser.id
      }

      let body = {
        agentId: showDrawerSelectedAgent?.id,
        templateId: template.id,
      }

      if (selectedUser) {
        body.userId = selectedUser.id
      }

      const response = await axios.post(path, body, {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        if (response.data.status === true) {
          showSnackbar('', 'Lead Score Added', SnackbarTypes.Success)
          // Optimistically set selected to the applied template id
          setSelectedTemplate(String(template.id))
          fetchAgentScoring() // Refresh agent's current scoring

          // Refresh templates after applying
          fetchTemplates({
            agentId: showDrawerSelectedAgent?.id,
            setTemplates: setTemplates,
            setTemplatesLoading: setTemplatesLoading,
            userId: selectedUser?.id,
          })
        } else {
          showSnackbar(
            'Error',
            response.data.message || 'Failed to apply template',
            SnackbarTypes.Error,
          )
          setSelectedTemplate('') // Reset selection on error
        }
      }
    } catch (error) {
      console.error('Error applying template:', error)
      showSnackbar(
        'Error',
        'Failed to apply template. Please try again.',
        SnackbarTypes.Error,
      )
    } finally {
      // Clear loading state after API calls complete
      setIsApplyingTemplate(false)
    }
  }

  return (
    <div className="mt-2">
      <div className="space-y-4">
        {/* Lead Scoring Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900"></h2>
          {templates.length > 0 && (
            <button
              onClick={() => setShowAddScoringModal(true)}
              className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium underline"
            >
              + Add Score
            </button>
          )}
        </div>

        {/* Templates Dropdown - Simple Version */}
        {templatesLoading ? (
          <div className="flex justify-center items-center py-4">
            <CircularProgress size={20} />
          </div>
        ) : templates.length > 0 ? (
          <div className="space-y-3">
            <Box className="w-full">
              <FormControl className="w-full">
                <Select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  displayEmpty
                  disabled={isApplyingTemplate}
                  className="border-none rounded-lg outline-none"
                  renderValue={(selected) => {
                    if (selected === '' || !templates.length) {
                      return (
                        <div className="text-gray-500">Choose a template</div>
                      )
                    }
                    const selectedTemplateObj = templates.find(
                      (t) => String(t.id) === String(selected),
                    )
                    return (
                      <div className="flex items-center">
                        <span className="text-gray-900">
                          {selectedTemplateObj?.templateName ||
                            'Choose a template'}
                        </span>
                        {isApplyingTemplate && (
                          <CircularProgress size={16} className="ml-2" />
                        )}
                      </div>
                    )
                  }}
                  sx={{
                    backgroundColor: '#FFFFFF',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid #E5E7EB',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid #D1D5DB',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid hsl(var(--brand-primary))',
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: '30vh',
                        overflow: 'auto',
                        scrollbarWidth: 'none',
                        borderRadius: '8px',
                        boxShadow:
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      },
                    },
                  }}
                >
                  <MenuItem value="">
                    <div className="text-gray-500">Choose a template</div>
                  </MenuItem>
                  {templates.map((template) => (
                    <MenuItem
                      key={template.id}
                      value={String(template.id)}
                      disabled={isApplyingTemplate}
                      sx={{
                        '&:hover': {
                          backgroundColor: isApplyingTemplate
                            ? 'transparent'
                            : '#F3F4F6',
                        },
                        opacity: isApplyingTemplate ? 0.6 : 1,
                      }}
                    >
                      <div className="w-full flex items-center justify-between">
                        <div className="font-medium text-gray-900">
                          {template.templateName}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!isApplyingTemplate) {
                              handleEditTemplate(template)
                            }
                          }}
                          disabled={isApplyingTemplate}
                          className={`ml-2 text-base text-brand-primary underline ${isApplyingTemplate ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          Edit
                        </button>
                      </div>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </div>
        ) : (
          <NoActionView
            title="No scoring data available"
            featureName="Scoring"
            setShowAddScoringModal={setShowAddScoringModal}
          />
        )}
      </div>

      {/* Add Scoring Modal */}
      <AddScoringModal
        selectedUser={selectedUser}
        open={showAddScoringModal}
        onClose={() => {
          setShowAddScoringModal(false)
          setEditingTemplate(null)
        }}
        agentId={showDrawerSelectedAgent?.id}
        selectedAgent={showDrawerSelectedAgent}
        editingTemplate={editingTemplate}
        onSubmit={(templateData) => {
          console.log('Template created/updated:', templateData)
          // Refresh templates after creation/update
          showSnackbar('', 'Lead Score Added', SnackbarTypes.Success)
          const newId =
            templateData?.data?.scoringConfiguration?.id ??
            templateData?.data?.scoringConfiguration?.templateId
          console.log('newId', newId)
          if (newId) {
            setSelectedTemplate(String(newId))
          }
          if (!editingTemplate) {
            setShowDrawerSelectedAgent((prev) => ({
              ...prev,
              template: templateData.data.scoringConfig,
            }))
            if (typeof setUserDetails === 'function') {
              setUserDetails((prev) => {
                if (!Array.isArray(prev)) return prev
                return prev.map((agent) => {
                  if (agent?.id === showDrawerSelectedAgent?.id) {
                    return {
                      ...agent,
                      template: templateData.data.scoringConfig,
                    }
                  }
                  return agent
                })
              })
            }
          }
          fetchTemplates({
            agentId: showDrawerSelectedAgent?.id,
            setTemplates: setTemplates,
            setTemplatesLoading: setTemplatesLoading,
            userId: selectedUser?.id,
          })
          fetchAgentScoring()
          // Reset editing state
          setEditingTemplate(null)
        }}
      />

      {/* Snackbar for notifications */}
      <AgentSelectSnackMessage
        isVisible={snackbar.isVisible}
        title={snackbar.title}
        message={snackbar.message}
        type={snackbar.type}
        hide={hideSnackbar}
      />
    </div>
  )
}

export default LeadScoring
