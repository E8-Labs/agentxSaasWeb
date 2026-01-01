'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { Button as ButtonBase } from '../ui/button'
import { Textarea as TextareaBase } from '../ui/textarea'
import { Input as InputBase } from '../ui/input'
import { FileText, Plus, Pencil, X, Check, Hash, Square, Eye, Type, RotateCw, Grid3x3, Minus, Code, ChevronDown, Send, MoreVertical, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Menu, MenuItem } from '@mui/material'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'

// Type assertions for components from .jsx files
const Button = ButtonBase as any
const Textarea = TextareaBase as any
const Input = InputBase as any

interface CallingScript {
  id: number
  title: string
  content: string
  isActive: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface CallingScriptProps {
  leadId?: number
  leadName?: string
  isExpanded: boolean
  onClose: () => void
}

export default function CallingScript({
  leadId,
  leadName,
  isExpanded,
  onClose,
}: CallingScriptProps) {
  const [scripts, setScripts] = useState<CallingScript[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedScript, setSelectedScript] = useState<CallingScript | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [scriptMenuAnchor, setScriptMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedScriptForMenu, setSelectedScriptForMenu] = useState<CallingScript | null>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Fetch scripts when component mounts or expands
  useEffect(() => {
    if (isExpanded) {
      fetchScripts()
    }
  }, [isExpanded])

  // Don't auto-select any script - show list by default

  const fetchScripts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('User') || '{}').token

      if (!token) {
        toast.error('Not authenticated')
        return
      }

      const response = await fetch('/api/calling-scripts', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || 'Failed to fetch scripts')
        return
      }

      setScripts(data.data || [])
    } catch (error: any) {
      console.error('Error fetching scripts:', error)
      toast.error('Failed to fetch scripts')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateScript = () => {
    setIsCreating(true)
    setIsEditing(false)
    setEditTitle('')
    setEditContent('')
    setSelectedScript(null)
    // Focus the title input after a short delay to ensure it's rendered
    setTimeout(() => {
      titleInputRef.current?.focus()
    }, 100)
  }

  const handleEditScript = (script: CallingScript) => {
    setIsEditing(true)
    setIsCreating(false)
    setEditTitle(script.title)
    setEditContent(script.content)
    setSelectedScript(script)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setIsCreating(false)
    setEditTitle('')
    setEditContent('')
    setSelectedScript(null) // Go back to list view
  }

  const handleDeleteScript = async (scriptId: number) => {
    if (!confirm('Are you sure you want to delete this script?')) {
      return
    }

    try {
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('User') || '{}').token

      if (!token) {
        toast.error('Not authenticated')
        return
      }

      const response = await fetch(`/api/calling-scripts/${scriptId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || 'Failed to delete script')
        return
      }

      toast.success('Script deleted successfully')
      await fetchScripts() // Refresh scripts
      setSelectedScript(null) // Go back to list view
    } catch (error: any) {
      console.error('Error deleting script:', error)
      toast.error('Failed to delete script')
    }
  }


  const handleSaveScript = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error('Title and content are required')
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('User') || '{}').token

      if (!token) {
        toast.error('Not authenticated')
        return
      }

      let response
      if (isCreating) {
        // Create new script
        response = await fetch('/api/calling-scripts', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: editTitle.trim(),
            content: editContent.trim(),
            isActive: true,
          }),
        })
      } else if (selectedScript) {
        // Update existing script
        response = await fetch(`/api/calling-scripts/${selectedScript.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: editTitle.trim(),
            content: editContent.trim(),
          }),
        })
      } else {
        return
      }

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || 'Failed to save script')
        return
      }

      toast.success(isCreating ? 'Script created successfully' : 'Script updated successfully')
      setIsEditing(false)
      setIsCreating(false)
      setEditTitle('')
      setEditContent('')
      setSelectedScript(null) // Go back to list view after saving
      await fetchScripts() // Refresh scripts
    } catch (error: any) {
      console.error('Error saving script:', error)
      toast.error('Failed to save script')
    } finally {
      setSaving(false)
    }
  }

  if (!isExpanded) {
    return null
  }

  return (
    <div 
      className="flex flex-col h-full w-full border-r border-gray-200 bg-white relative"
      style={{ zIndex: 2000, position: 'relative' }}
    >
      {/* Header - Title and Add Script button */}
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between" style={{ position: 'relative', zIndex: 2000 }}>
        <h3 className="font-bold text-xl text-gray-900">
          Calling script
        </h3>
        {!isCreating && !isEditing && (
          <Button
            onClick={handleCreateScript}
            size="sm"
            className="rounded-full"
            style={{ 
              backgroundColor: 'hsl(var(--brand-primary))',
              color: 'white',
              padding: '6px 16px',
              fontSize: '14px',
            }}
          >
            <Plus size={16} className="mr-1" />
            Add Script
          </Button>
        )}
      </div>

      {/* Content Area */}
      <div 
        className="flex-1 overflow-y-auto px-6"
        style={{ position: 'relative', zIndex: 2000 }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-gray-500">Loading scripts...</div>
          </div>
        ) : scripts.length === 0 && !isCreating ? (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F9F9F9' }}>
              <Image 
                src="/svgIcons/OLD AGENTX UI/script_icon.svg" 
                alt="Script icon" 
                width={32}
                height={32}
              />
            </div>
            <div className="text-center">
              <p className="text-base mb-5" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>No script found</p>
              <Button
                onClick={handleCreateScript}
                className="rounded-full bg-gray-50 hover:bg-gray-50"
                style={{ 
                  color: '#374151',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  boxShadow: 'none',
                }}
              >
                <Plus size={16} className="mr-1" />
                Add Script
              </Button>
            </div>
          </div>
        ) : isCreating || isEditing ? (
          <div 
            className="space-y-4 pb-6"
            style={{ position: 'relative', zIndex: 2000 }}
          >
            <div style={{ position: 'relative', zIndex: 2001 }}>
              <label className="text-sm font-medium mb-2 block text-gray-700">Title</label>
              <Input
                ref={titleInputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter script title"
                className="border border-[#00000020] p-3 outline-none focus:outline-none focus:ring-0 focus:border-black focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black"
                style={{ 
                  fontSize: '14px',
                  position: 'relative',
                  zIndex: 2001,
                  borderRadius: '7px',
                }}
                autoFocus
                tabIndex={0}
              />
            </div>
            <div style={{ position: 'relative', zIndex: 2001 }}>
              <label className="text-sm font-medium mb-2 block text-gray-700">Content</label>
              <Textarea
                ref={contentTextareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Enter script content..."
                className="w-full min-h-[400px] resize-none border-2 border-[#00000020] rounded-lg px-3 py-2 outline-none focus:outline-none focus:ring-0 focus:border-black focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black"
                style={{ 
                  fontSize: '14px',
                  position: 'relative',
                  zIndex: 2001,
                  borderRadius: '7px',
                }}
                tabIndex={0}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveScript}
                disabled={saving || !editTitle.trim() || !editContent.trim()}
                className="flex-1"
                style={{ backgroundColor: 'hsl(var(--brand-primary))', color: 'white' }}
              >
                {saving ? 'Saving...' : isCreating ? 'Create' : 'Save'}
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                disabled={saving}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : selectedScript ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setSelectedScript(null)}
                  variant="ghost"
                  size="sm"
                  className="p-2 h-8 w-8"
                >
                  <ArrowLeft size={16} />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--brand-primary) / 0.1)' }}>
                    <FileText size={20} style={{ color: 'hsl(var(--brand-primary))' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{selectedScript.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Calling Script</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedScriptForMenu(selectedScript)
                  setScriptMenuAnchor(e.currentTarget)
                }}
                variant="ghost"
                size="sm"
                className="p-2 h-8 w-8"
              >
                <MoreVertical size={18} />
              </Button>
            </div>

            {/* Content Card */}
            <Card className="flex-1 border-2" style={{ borderColor: 'hsl(var(--brand-primary) / 0.2)' }}>
              <CardContent className="p-6">
                <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed" style={{ 
                  lineHeight: '1.75',
                  fontSize: '14px',
                }}>
                  {selectedScript.content}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : scripts.length > 0 ? (
          <div className="space-y-3 py-4">
            {scripts.map((script, index) => (
              <div
                key={script.id}
                onClick={() => setSelectedScript(script)}
                className="p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md"
                style={{
                  borderColor: script.isActive 
                    ? '#e5e7eb' 
                    : '#f3f4f6',
                  backgroundColor: 'white',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                        {script.title}
                      </h4>
                      {!script.isActive && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p 
                      className="text-xs text-gray-600"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {script.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedScriptForMenu(script)
                        setScriptMenuAnchor(e.currentTarget)
                      }}
                      variant="ghost"
                      size="sm"
                      className="p-1.5 h-auto"
                    >
                      <MoreVertical size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F9F9F9' }}>
              <Image 
                src="/svgIcons/OLD AGENTX UI/script_icon.svg" 
                alt="Script icon" 
                width={32}
                height={32}
              />
            </div>
            <div className="text-center">
              <p className="text-base mb-5" style={{ color: 'rgba(0, 0, 0, 0.6)' }}>No script found</p>
              <Button
                onClick={handleCreateScript}
                className="rounded-full bg-gray-50 hover:bg-gray-50"
                style={{ 
                  color: '#374151',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  boxShadow: 'none',
                }}
              >
                <Plus size={16} className="mr-1" />
                Add Script
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Script Menu */}
      {selectedScriptForMenu && (
        <Menu
          anchorEl={scriptMenuAnchor}
          open={Boolean(scriptMenuAnchor)}
          onClose={() => {
            setScriptMenuAnchor(null)
            setSelectedScriptForMenu(null)
          }}
          MenuListProps={{
            'aria-labelledby': 'script-menu-button',
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
          <MenuItem
            onClick={() => {
              if (selectedScriptForMenu) {
                handleEditScript(selectedScriptForMenu)
              }
              setScriptMenuAnchor(null)
              setSelectedScriptForMenu(null)
            }}
          >
            <Pencil size={14} className="mr-2" />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (selectedScriptForMenu) {
                handleDeleteScript(selectedScriptForMenu.id)
              }
              setScriptMenuAnchor(null)
              setSelectedScriptForMenu(null)
            }}
            style={{ color: '#dc2626' }}
          >
            <X size={14} className="mr-2" />
            Delete
          </MenuItem>
        </Menu>
      )}
    </div>
  )
}

