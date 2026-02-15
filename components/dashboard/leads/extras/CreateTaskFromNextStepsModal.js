'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import TaskForm from '@/components/messaging/TaskForm'
import { createTask } from '@/components/onboarding/services/apisServices/TaskService'
import { getTeamsList } from '@/components/onboarding/services/apisServices/ApiService'
import { formatNextStepsForDescription } from './activityUtils'
import { toast } from 'sonner'
import { TypographyH3 } from '@/lib/typography'

const CreateTaskFromNextStepsModal = ({
  open,
  onClose,
  nextSteps,
  leadId,
  leadName,
  callId = null,
  selectedUser = null,
}) => {
  const [teamMembers, setTeamMembers] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidForm, setIsValidForm] = useState(false)
  // Fetch team members
  const fetchTeamMembers = useCallback(async () => {
    try {
      const response = await getTeamsList(selectedUser?.id)
      if (response) {
        const members = []
        // Add admin
        if (response.admin) {
          members.push({
            id: response.admin.id,
            name: response.admin.name,
            email: response.admin.email,
            thumb_profile_image: response.admin.thumb_profile_image,
          })
        }
        // Add team members
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach((team) => {
            if (team.status === 'Accepted' && team.invitedUser) {
              members.push({
                id: team.invitedUser.id,
                name: team.invitedUser.name,
                email: team.invitedUser.email,
                thumb_profile_image: team.invitedUser.thumb_profile_image,
                invitedUserId: team.invitedUser.id,
                invitedUser: team.invitedUser,
              })
            }
          })
        }
        setTeamMembers(members)
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
    }
  }, [selectedUser?.id])


  // Load team members when modal opens
  useEffect(() => {
    if (open) {
      fetchTeamMembers()
    }
  }, [open, fetchTeamMembers])

  // Handle task creation
  const handleCreateTask = async (taskData) => {

    if (!taskData.title.trim() || !taskData.description.trim()) {
      setIsValidForm(false)
      return false
    }

    try {
      setIsSubmitting(true)
      const response = await createTask(taskData, selectedUser?.id)
      if (response.status) {
        toast.success('Task created successfully')

        // Dispatch custom event for task updates
        window.dispatchEvent(new CustomEvent('tasksChanged'))

        // Close modal
        onClose()
      } else {
        toast.error(response.message || 'Failed to create task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format next steps for description
  const formattedDescription = nextSteps ? formatNextStepsForDescription(nextSteps) : ''

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>
            <TypographyH3>New Task</TypographyH3>
          </DialogTitle>
        </DialogHeader>

        {/* Divider between title and input fields */}
        <div className="border-b border-gray-200 mx-6" />

        <div className="flex-1 overflow-y-auto px-6 pt-4 pb-2">
          <TaskForm
            teamMembers={teamMembers}
            onSubmit={handleCreateTask}
            onCancel={onClose}
            leadId={leadId}
            callId={callId}
            showButtons={false}
            shouldShowLeadMention={true}
            leadName={leadName}
            initialDescription={formattedDescription}
            hideBorder={true}
            isValidForm={isValidForm}
            setIsValidForm={setIsValidForm}
          />
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="px-6 pt-4 pb-1 border-t border-gray-200 flex-shrink-0 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="task-form"
            disabled={isSubmitting || !isValidForm}
            className="px-4 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>

                Creating...
              </>
            ) : (
              <>
                <span>+</span>
                Create Task
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateTaskFromNextStepsModal
