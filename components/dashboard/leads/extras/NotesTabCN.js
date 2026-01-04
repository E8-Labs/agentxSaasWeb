'use client'

import React, { useState } from 'react'
import {
  StickyNote,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  Loader2,
} from 'lucide-react'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { GetFormattedDateString } from '@/utilities/utility'
import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, { SnackbarTypes } from '../AgentSelectSnackMessage'
import {
  TypographyBody,
  TypographyCaption,
  TypographyBodySemibold,
  TypographyBodyMedium,
} from '@/lib/typography'

const NotesTabCN = ({
  noteDetails = [],
  selectedLeadsDetails,
  onNotesUpdated,
}) => {
  const [showAddNotes, setShowAddNotes] = useState(false)
  const [addNotesValue, setAddNotesValue] = useState('')
  const [addLeadNoteLoader, setAddLeadNoteLoader] = useState(false)
  
  const [editingNote, setEditingNote] = useState(null)
  const [editNoteValue, setEditNoteValue] = useState('')
  const [editNoteLoader, setEditNoteLoader] = useState(false)
  
  const [deleteNoteId, setDeleteNoteId] = useState(null)
  const [deleteNoteLoader, setDeleteNoteLoader] = useState(false)
  const [showDeleteNoteConfirm, setShowDeleteNoteConfirm] = useState(false)
  
  const [showSnackMsg, setShowSnackMsg] = useState({
    type: SnackbarTypes.Success,
    message: '',
    isVisible: false,
  })

  const showSnackbar = (message, type = SnackbarTypes.Success) => {
    setShowSnackMsg({
      type,
      message,
      isVisible: true,
    })
  }

  const handleAddLeadNotes = async () => {
    try {
      if (!addNotesValue.trim()) {
        showSnackbar('Note content cannot be empty', SnackbarTypes.Error)
        return
      }

      setAddLeadNoteLoader(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      const ApiData = {
        note: addNotesValue,
        leadId: selectedLeadsDetails.id,
      }

      const ApiPath = Apis.addLeadNote
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response && response.data.status === true) {
        setShowAddNotes(false)
        setAddNotesValue('')
        showSnackbar('Note added successfully', SnackbarTypes.Success)
        if (onNotesUpdated) {
          onNotesUpdated()
        }
      } else {
        showSnackbar(response.data.message || 'Failed to add note', SnackbarTypes.Error)
      }
    } catch (error) {
      console.error('Error adding note:', error)
      showSnackbar('Failed to add note. Please try again.', SnackbarTypes.Error)
    } finally {
      setAddLeadNoteLoader(false)
    }
  }

  const handleEditNote = async () => {
    try {
      if (!editingNote || !editNoteValue.trim()) {
        showSnackbar('Note content cannot be empty', SnackbarTypes.Error)
        return
      }

      setEditNoteLoader(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      const response = await fetch(
        `/api/leads/${selectedLeadsDetails.id}/notes/${editingNote.id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${AuthToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            note: editNoteValue,
          }),
        },
      )

      const data = await response.json()

      if (data.status === true) {
        setEditingNote(null)
        setEditNoteValue('')
        showSnackbar('Note updated successfully', SnackbarTypes.Success)
        if (onNotesUpdated) {
          onNotesUpdated()
        }
      } else {
        showSnackbar(data.message || 'Failed to update note', SnackbarTypes.Error)
      }
    } catch (error) {
      console.error('Error updating note:', error)
      showSnackbar('Failed to update note. Please try again.', SnackbarTypes.Error)
    } finally {
      setEditNoteLoader(false)
    }
  }

  const handleDeleteNote = async () => {
    try {
      if (!deleteNoteId) return

      setDeleteNoteLoader(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      const response = await fetch(
        `/api/leads/${selectedLeadsDetails.id}/notes/${deleteNoteId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${AuthToken}`,
            'Content-Type': 'application/json',
          },
        },
      )

      const data = await response.json()

      if (data.status === true) {
        setShowDeleteNoteConfirm(false)
        setDeleteNoteId(null)
        showSnackbar('Note deleted successfully', SnackbarTypes.Success)
        if (onNotesUpdated) {
          onNotesUpdated()
        }
      } else {
        showSnackbar(data.message || 'Failed to delete note', SnackbarTypes.Error)
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      showSnackbar('Failed to delete note. Please try again.', SnackbarTypes.Error)
    } finally {
      setDeleteNoteLoader(false)
    }
  }

  const handleEditClick = (note) => {
    setEditingNote(note)
    setEditNoteValue(note.note)
  }

  const handleDeleteClick = (note) => {
    setDeleteNoteId(note.id)
    setShowDeleteNoteConfirm(true)
  }
  if (noteDetails?.length < 1) {
    return (
      <div className="flex flex-col items-center justify-center w-full mt-12">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <StickyNote className="h-6 w-6" />
        </div>
        <TypographyBody className="mt-4 italic text-muted-foreground">
          You can add and manage your notes here
        </TypographyBody>
        <Button
          variant="ghost"
          className="mt-2 gap-2"
          onClick={() => setShowAddNotes(true)}
        >
          <Plus className="h-4 w-4" />
          <TypographyBodyMedium>Add Notes</TypographyBodyMedium>
        </Button>
      </div>
    )
  }

  return (
    <div>
      {noteDetails.map((note, index) => (
        <Card key={index} className="mb-4 relative">
          <CardContent className="p-4">
            <div className="flex flex-row items-center justify-between w-full">
              <TypographyCaption className="text-muted-foreground">
                {GetFormattedDateString(note?.createdAt, true)}
              </TypographyCaption>
              {/* Show menu for manual notes, or if type is undefined (assume manual) */}
              {(note.type === 'manual' || !note.type || note.type !== 'call_summary') && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 cursor-pointer hover:bg-muted shrink-0"
                      type="button"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-[9999]">
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault()
                        handleEditClick(note)
                      }}
                      className="cursor-pointer"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      <TypographyBodyMedium>Edit</TypographyBodyMedium>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault()
                        handleDeleteClick(note)
                      }}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <TypographyBodyMedium>Delete</TypographyBodyMedium>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <TypographyBody className="mt-4">{note.note}</TypographyBody>
          </CardContent>
        </Card>
      ))}
      <Button
        variant="ghost"
        className="mt-2 gap-2"
        onClick={() => setShowAddNotes(true)}
      >
        <Plus className="h-4 w-4" />
        <TypographyBodyMedium>Add Notes</TypographyBodyMedium>
      </Button>

      {/* Add Note Modal */}
      <Dialog open={showAddNotes} onOpenChange={setShowAddNotes}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              <TypographyBodySemibold>Add your notes</TypographyBodySemibold>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Textarea
              placeholder="Add notes"
              value={addNotesValue}
              onChange={(e) => setAddNotesValue(e.target.value)}
              className="min-h-[250px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddNotes(false)
                setAddNotesValue('')
              }}
            >
              <TypographyBodyMedium>Cancel</TypographyBodyMedium>
            </Button>
            <Button
              onClick={handleAddLeadNotes}
              disabled={addLeadNoteLoader || !addNotesValue.trim()}
            >
              {addLeadNoteLoader ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <TypographyBodyMedium>Adding...</TypographyBodyMedium>
                </>
              ) : (
                <TypographyBodyMedium>Add</TypographyBodyMedium>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Note Modal */}
      <Dialog open={!!editingNote} onOpenChange={(open) => {
        if (!open) {
          setEditingNote(null)
          setEditNoteValue('')
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              <TypographyBodySemibold>Edit your note</TypographyBodySemibold>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Textarea
              placeholder="Edit notes"
              value={editNoteValue}
              onChange={(e) => setEditNoteValue(e.target.value)}
              className="min-h-[250px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingNote(null)
                setEditNoteValue('')
              }}
            >
              <TypographyBodyMedium>Cancel</TypographyBodyMedium>
            </Button>
            <Button
              onClick={handleEditNote}
              disabled={editNoteLoader || !editNoteValue.trim()}
            >
              {editNoteLoader ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <TypographyBodyMedium>Updating...</TypographyBodyMedium>
                </>
              ) : (
                <TypographyBodyMedium>Update</TypographyBodyMedium>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteNoteConfirm} onOpenChange={setShowDeleteNoteConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              <TypographyBodySemibold>Delete Note</TypographyBodySemibold>
            </DialogTitle>
            <DialogDescription>
              <TypographyBody>
                Are you sure you want to delete this note? This action cannot be undone.
              </TypographyBody>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteNoteConfirm(false)
                setDeleteNoteId(null)
              }}
            >
              <TypographyBodyMedium>Cancel</TypographyBodyMedium>
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteNote}
              disabled={deleteNoteLoader}
            >
              {deleteNoteLoader ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <TypographyBodyMedium>Deleting...</TypographyBodyMedium>
                </>
              ) : (
                <TypographyBodyMedium>Delete</TypographyBodyMedium>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <AgentSelectSnackMessage
        isVisible={showSnackMsg.isVisible}
        hide={() => setShowSnackMsg({ ...showSnackMsg, isVisible: false })}
        message={showSnackMsg.message}
        type={showSnackMsg.type}
      />
    </div>
  )
}

export default NotesTabCN

