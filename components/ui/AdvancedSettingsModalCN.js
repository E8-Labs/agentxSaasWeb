'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import SliderCN from '@/components/ui/SliderCN'
import { Phone, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Advanced Settings Modal Component for Agent Configuration
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {Function} props.onOpenChange - Callback when open state changes: (open: boolean) => void
 * @param {Function} props.onSave - Callback when save is clicked: (settings: {maxDurationSeconds: number, idleTimeoutSeconds: number, idleMessage: string}) => void
 * @param {Object} props.initialValues - Initial values for the settings
 * @param {number} props.initialValues.maxDurationSeconds - Initial max duration (default: 600)
 * @param {number} props.initialValues.idleTimeoutSeconds - Initial idle timeout (default: 10)
 * @param {string} props.initialValues.idleMessage - Initial idle message (default: "Are you there?")
 * @param {boolean} props.loading - Whether save is in progress
 * @param {string} props.className - Optional className for the modal
 */
const AdvancedSettingsModalCN = ({
  open,
  onOpenChange,
  onSave,
  initialValues = {},
  loading = false,
  className,
}) => {
  const [maxDurationSeconds, setMaxDurationSeconds] = useState(
    initialValues.maxDurationSeconds ?? 600
  )
  const [idleTimeoutSeconds, setIdleTimeoutSeconds] = useState(
    initialValues.idleTimeoutSeconds ?? 10
  )
  const [idleMessage, setIdleMessage] = useState(
    initialValues.idleMessage ?? 'Are you there?'
  )

  // Update local state when initialValues change
  useEffect(() => {
    if (open) {
      setMaxDurationSeconds(initialValues.maxDurationSeconds ?? 600)
      setIdleTimeoutSeconds(initialValues.idleTimeoutSeconds ?? 10)
      setIdleMessage(initialValues.idleMessage ?? 'Are you there?')
    }
  }, [open, initialValues])

  const handleSave = () => {
    onSave({
      maxDurationSeconds,
      idleTimeoutSeconds,
      idleMessage,
    })
  }

  const handleCancel = () => {
    // Reset to initial values
    setMaxDurationSeconds(initialValues.maxDurationSeconds ?? 600)
    setIdleTimeoutSeconds(initialValues.idleTimeoutSeconds ?? 10)
    setIdleMessage(initialValues.idleMessage ?? 'Are you there?')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-2xl', className)}>
        <DialogHeader>
          <DialogTitle>Advanced Settings</DialogTitle>
          <DialogDescription>
            Configure advanced call settings for your agent
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Maximum Duration Slider */}
          <SliderCN
            value={maxDurationSeconds}
            onValueChange={(values) => setMaxDurationSeconds(values[0])}
            min={10}
            max={43200}
            step={1}
            label="Maximum Duration"
            description="The maximum number of seconds a call will last."
            icon={<Clock className="h-6 w-6" />}
            unit="sec"
          />

          {/* Silence Timeout Slider */}
          <SliderCN
            value={idleTimeoutSeconds}
            onValueChange={(values) => setIdleTimeoutSeconds(values[0])}
            min={10}
            max={3600}
            step={1}
            label="Silence Timeout"
            description="How long to wait before a call is automatically ended due to inactivity."
            icon={<Phone className="h-6 w-6" />}
            unit="sec"
          />

          {/* Silence Response Input */}
          <div className="space-y-2">
            <Label htmlFor="idleMessage" className="text-base font-semibold">
              Silence Response
            </Label>
            <p className="text-sm text-muted-foreground">
              Message to say when user is silent.
            </p>
            <Input
              id="idleMessage"
              value={idleMessage}
              onChange={(e) => setIdleMessage(e.target.value)}
              placeholder="Are you there?"
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-brand-primary hover:bg-brand-primary/90"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AdvancedSettingsModalCN
