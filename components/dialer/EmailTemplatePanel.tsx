'use client'

import { useState } from 'react'
import { Button as ButtonBase } from '../ui/button'
import { toast } from 'sonner'
import { Mail, MoreVertical, Pencil, X, Loader2, Check, FileText, Trash, Plus } from 'lucide-react'
import { Menu, MenuItem } from '@mui/material'
import EmailTempletePopupBase from '../pipeline/EmailTempletePopup'
import { getGmailAccounts } from '../pipeline/TempleteServices'

const Button = ButtonBase as any
const EmailTempletePopup = EmailTempletePopupBase as any

interface EmailTemplatePanelProps {
  emailTemplates: any[]
  selectedTemplate: any
  templatesLoading: boolean
  emailAccounts: any[]
  emailAccountsLoading: boolean
  sendingEmail: boolean
  leadId?: number
  selectedUser: any
  onTemplateSelect: (template: any) => void
  onSendEmail: (emailAccountId?: number) => void
  onDeleteTemplate: (template: any) => void
  onEditTemplate: (template: any) => void
  onRefreshTemplates: (createdTemplateId?: number) => void
  onRefreshEmailAccounts: () => Promise<void>
  onClose: () => void
}

export default function EmailTemplatePanel({
  emailTemplates,
  selectedTemplate,
  templatesLoading,
  emailAccounts,
  emailAccountsLoading,
  sendingEmail,
  leadId,
  selectedUser,
  onTemplateSelect,
  onSendEmail,
  onDeleteTemplate,
  onEditTemplate,
  onRefreshTemplates,
  onRefreshEmailAccounts,
  onClose,
}: EmailTemplatePanelProps) {
  const [emailAccountDropdownAnchor, setEmailAccountDropdownAnchor] = useState<null | HTMLElement>(null)
  const [selectedEmailAccount, setSelectedEmailAccount] = useState<any>(null)
  const [showEmailTemplatePopup, setShowEmailTemplatePopup] = useState(false)
  const [isEditingTemplate, setIsEditingTemplate] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [templateMenuAnchor, setTemplateMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedTemplateForMenu, setSelectedTemplateForMenu] = useState<any>(null)
  const [selectedGoogleAccountInPopup, setSelectedGoogleAccountInPopup] = useState<any>(null)

  const getProviderLabel = (provider?: string) => {
    if (!provider) return 'Email'
    if (provider === 'gmail') return 'Gmail'
    if (provider === 'mailgun') return 'Mailgun'
    return provider.charAt(0).toUpperCase() + provider.slice(1)
  }

  const handleEmailAccountSelected = (account: any) => {
    setSelectedEmailAccount(account)
    setEmailAccountDropdownAnchor(null)
    onSendEmail(account.id)
  }

  const handleComposeNew = () => {
    setIsEditingTemplate(false)
    setEditingTemplate(null)
    setSelectedGoogleAccountInPopup(null) // Reset selected account when creating new template
    setShowEmailTemplatePopup(true)
  }

  const handleEditClick = (template: any) => {
    const normalizedTemplate = {
      ...template,
      id: template.id || template.templateId,
      templateId: template.templateId || template.id,
    }
    setEditingTemplate(normalizedTemplate)
    setIsEditingTemplate(true)
    setShowEmailTemplatePopup(true)
    setTemplateMenuAnchor(null)
    setSelectedTemplateForMenu(null)
  }

  const handleDeleteClick = async (template: any) => {
    await onDeleteTemplate(template)
    setTemplateMenuAnchor(null)
    setSelectedTemplateForMenu(null)
  }

  const handleSendClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    
    // Always show the dropdown - it will handle loading and empty states
    setEmailAccountDropdownAnchor(e.currentTarget)
    
    // Fetch accounts if needed (only if not already loading)
    if (emailAccounts.length === 0 && !emailAccountsLoading) {
      await onRefreshEmailAccounts()
    }
  }

  return (
    <>
      <div
        className="w-80 border-r border-gray-200 flex-shrink-0 flex flex-col"
        style={{ maxHeight: '60vh', pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Select Email</h3>
          <Button
            onClick={handleComposeNew}
            variant="filled"
            className="rounded-full py-2 px-4 transition-all"
            style={{
              backgroundColor: '#F9F9F9',
              border: '1px solid #e5e7eb',
              color: '#374151',
              fontSize: '14px',
              height: 'auto',
            }}
          >
            <Plus size={14} className="mr-0" />
            Add Email  
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {templatesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">Loading templates...</div>
            </div>
          ) : emailTemplates.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">No email templates found</div>
            </div>
          ) : (
            <div className="space-y-3">
              {emailTemplates.map((template: any) => (
                <div
                  key={template.id}
                  onClick={() => onTemplateSelect(template)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedTemplate?.id === template.id
                      ? 'border-2 border-purple-500 bg-purple-50'
                      : 'border border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {template.templateName}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-2">
                        {template.subject}
                      </div>
                      {template.content && (
                        <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {template.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        setSelectedTemplateForMenu(template)
                        setTemplateMenuAnchor(e.currentTarget)
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation()
                      }}
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto ml-2 flex-shrink-0"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <MoreVertical size={16} className="text-gray-400" />
                    </Button>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                      <Button
                        onClick={handleSendClick}
                        disabled={sendingEmail}
                        className="w-full rounded-lg"
                        style={{
                          backgroundColor: 'hsl(var(--brand-primary))',
                          color: 'white',
                          fontSize: '14px',
                          padding: '8px 16px',
                        }}
                      >
                        {sendingEmail ? 'Sending...' : 'Send'}
                      </Button>
                      {/* Email Account Dropdown */}
                      {emailAccountDropdownAnchor && (
                        <Menu
                          anchorEl={emailAccountDropdownAnchor}
                          open={Boolean(emailAccountDropdownAnchor)}
                          onClose={() => setEmailAccountDropdownAnchor(null)}
                          PaperProps={{
                            style: {
                              maxHeight: '300px',
                              width: '280px',
                              zIndex: 1500,
                              marginTop: '8px',
                            },
                          }}
                          style={{ zIndex: 1500 }}
                          MenuListProps={{
                            style: { zIndex: 1500, padding: '4px' },
                          }}
                          container={() => document.body}
                          disablePortal={false}
                        >
                          {emailAccountsLoading ? (
                            <MenuItem disabled>
                              <div className="flex items-center gap-2 py-2">
                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                <span className="text-sm text-gray-500">Loading accounts...</span>
                              </div>
                            </MenuItem>
                          ) : emailAccounts.length === 0 ? (
                            <MenuItem disabled>
                              <div className="text-sm text-gray-500 py-2">
                                No email accounts found
                              </div>
                            </MenuItem>
                          ) : (
                            emailAccounts.map((account) => {
                              const isSelected = selectedEmailAccount?.id === account.id
                              const accountEmail = account.email || account.displayName || account.name || 'Unknown'
                              const provider = account.provider || 'email'

                              return (
                                <MenuItem
                                  key={account.id}
                                  onClick={() => handleEmailAccountSelected(account)}
                                  style={{
                                    border: isSelected ? '2px solid hsl(var(--brand-primary))' : '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    margin: '4px 0',
                                    padding: '12px 16px',
                                    backgroundColor: isSelected ? 'hsl(var(--brand-primary) / 0.05)' : 'white',
                                  }}
                                >
                                  <div className="flex items-center justify-between w-full gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{
                                          backgroundColor: isSelected
                                            ? 'hsl(var(--brand-primary) / 0.1)'
                                            : '#f3f4f6',
                                        }}
                                      >
                                        <Mail
                                          className="w-4 h-4"
                                          style={{
                                            color: isSelected
                                              ? 'hsl(var(--brand-primary))'
                                              : '#6b7280',
                                          }}
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div
                                          className="text-sm font-medium truncate"
                                          style={{
                                            color: isSelected
                                              ? 'hsl(var(--brand-primary))'
                                              : '#111827',
                                          }}
                                        >
                                          {accountEmail}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                          {getProviderLabel(provider)}
                                        </div>
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <div className="flex-shrink-0">
                                        <div
                                          className="w-5 h-5 rounded-full flex items-center justify-center"
                                          style={{
                                            backgroundColor: 'hsl(var(--brand-primary))',
                                          }}
                                        >
                                          <Check size={12} className="text-white" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </MenuItem>
                              )
                            })
                          )}
                        </Menu>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Template Popup */}
      {showEmailTemplatePopup && (
        <EmailTempletePopup
          open={showEmailTemplatePopup}
          onClose={(createdTemplateId?: number) => {
            setShowEmailTemplatePopup(false)
            setIsEditingTemplate(false)
            setEditingTemplate(null)
            // Don't reset selectedGoogleAccountInPopup here - keep it for next time
            onRefreshTemplates(createdTemplateId)
          }}
          communicationType="email"
          addRow={null}
          isEditing={isEditingTemplate}
          editingRow={editingTemplate}
          onUpdateRow={null}
          selectedGoogleAccount={selectedGoogleAccountInPopup}
          setSelectedGoogleAccount={(account) => {
            setSelectedGoogleAccountInPopup(account)
          }}
          onSendEmail={null}
          isLeadEmail={false}
          leadEmail={null}
          leadId={leadId}
          selectedUser={selectedUser}
        />
      )}

      {/* Template Menu */}
      {selectedTemplateForMenu && (
        <Menu
          anchorEl={templateMenuAnchor}
          open={Boolean(templateMenuAnchor)}
          onClose={() => {
            setTemplateMenuAnchor(null)
            setSelectedTemplateForMenu(null)
          }}
          MenuListProps={{
            'aria-labelledby': 'template-menu-button',
          }}
          PaperProps={{
            style: {
              minWidth: '120px',
              zIndex: 1500,
            },
          }}
          style={{
            zIndex: 1500,
          }}
          disablePortal={false}
        >
          <MenuItem onClick={() => handleEditClick(selectedTemplateForMenu)}>
            <Pencil size={14} className="mr-2" />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => handleDeleteClick(selectedTemplateForMenu)}
            style={{ color: '#dc2626' }}
          >
            <Trash size={14} className="mr-2" />
            Delete
          </MenuItem>
        </Menu>
      )}
    </>
  )
}


