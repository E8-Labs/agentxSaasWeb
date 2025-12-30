'use client'

import { useEffect, useState } from 'react'
import { Button as ButtonBase } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { FileText, Plus, Pencil, X, Check } from 'lucide-react'
import { toast } from 'sonner'

// Type assertions for components from .jsx files
const Button = ButtonBase as any

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

  // Fetch scripts when component mounts or expands
  useEffect(() => {
    if (isExpanded) {
      fetchScripts()
    }
  }, [isExpanded])

  // Set default script when scripts are loaded
  useEffect(() => {
    if (scripts.length > 0 && !selectedScript) {
      const defaultScript = scripts.find((s) => s.isDefault && s.isActive)
      if (defaultScript) {
        setSelectedScript(defaultScript)
      } else {
        // If no default, use first active script
        const firstActive = scripts.find((s) => s.isActive)
        if (firstActive) {
          setSelectedScript(firstActive)
        }
      }
    }
  }, [scripts])

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
    setEditTitle('')
    setEditContent('')
    setSelectedScript(null)
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
    if (scripts.length > 0) {
      const defaultScript = scripts.find((s) => s.isDefault && s.isActive)
      setSelectedScript(defaultScript || scripts.find((s) => s.isActive) || null)
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
            isDefault: scripts.length === 0, // Set as default if it's the first script
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
    <div className="flex flex-col h-full w-full border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-brand-primary" style={{ color: 'hsl(var(--brand-primary))' }} />
          <h3 className="font-semibold text-base" style={{ color: 'hsl(var(--brand-primary))' }}>
            Calling script
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-gray-500">Loading scripts...</div>
          </div>
        ) : scripts.length === 0 && !isCreating ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText size={32} className="text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">No script found</p>
              <Button
                onClick={handleCreateScript}
                className="flex items-center gap-2"
                style={{ backgroundColor: 'hsl(var(--brand-primary))', color: 'white' }}
              >
                <Plus size={16} />
                Add Script
              </Button>
            </div>
          </div>
        ) : isCreating || isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter script title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                style={{ fontSize: '14px' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Content</label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Enter script content..."
                className="w-full min-h-[300px] resize-none"
                style={{ fontSize: '14px' }}
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-base">{selectedScript.title}</h4>
              <Button
                onClick={() => handleEditScript(selectedScript)}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <Pencil size={16} />
              </Button>
            </div>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                {selectedScript.content}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText size={32} className="text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">No script found</p>
              <Button
                onClick={handleCreateScript}
                className="flex items-center gap-2"
                style={{ backgroundColor: 'hsl(var(--brand-primary))', color: 'white' }}
              >
                <Plus size={16} />
                Add Script
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

