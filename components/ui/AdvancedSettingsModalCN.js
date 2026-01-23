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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import SliderCN from '@/components/ui/SliderCN'
import { Phone, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

// Predefined idle messages
const IDLE_MESSAGES = [
  'Are you still there?',
  'Is there anything else you need help with?',
  'Feel free to ask me any questions.',
  'How can I assist you further?',
  'Let me know if there\'s anything you need.',
  'I\'m still here if you need assistance.',
  'I\'m ready to help whenever you are.',
  'Is there something specific you\'re looking for?',
]

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
 * @param {string} props.initialValues.idleMessage - Initial idle message (default: "Are you still there?")
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
    initialValues.idleMessage ?? IDLE_MESSAGES[0]
  )

  // Update local state when initialValues change
  useEffect(() => {
    if (open) {
      setMaxDurationSeconds(initialValues.maxDurationSeconds ?? 600)
      setIdleTimeoutSeconds(initialValues.idleTimeoutSeconds ?? 10)
      setIdleMessage(initialValues.idleMessage ?? IDLE_MESSAGES[0])
    }
  }, [open, initialValues])

  // Validation: Check if values are within valid range
  const isValid = () => {
    const maxDurationValid =
      maxDurationSeconds >= 10 &&
      maxDurationSeconds <= 43200 &&
      !isNaN(maxDurationSeconds)
    const idleTimeoutValid =
      idleTimeoutSeconds >= 10 &&
      idleTimeoutSeconds <= 3600 &&
      !isNaN(idleTimeoutSeconds)
    const idleMessageValid = idleMessage.trim().length > 0

    return maxDurationValid && idleTimeoutValid && idleMessageValid
  }

  const handleSave = () => {
    if (!isValid()) return

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
    setIdleMessage(initialValues.idleMessage ?? IDLE_MESSAGES[0])
    onOpenChange(false)
  }

  return (
    <Dialog className="z-[1500]" open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-2xl z-[1600]', className)}>
        <DialogHeader>
          <DialogTitle>Advanced Settings</DialogTitle>
          <DialogDescription>
            Configure advanced call settings for your agent
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">

          <Label htmlFor="idleMessage" className="text-base font-semibold">
            Maximum Duration
          </Label>
          <p className="text-sm text-muted-foreground">
            The maximum number of minutes a call will last. Change the unit to minutes.
          </p>

          <Input type="number"
            className="border-2 border-[#00000020] rounded p-3 outline-none focus:outline-none focus:ring-0 focus:border-brand-primary focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-brand-primary"
            value={maxDurationSeconds}
            onChange={(e) => setMaxDurationSeconds(e.target.value)}
            min={10}
            max={43200}
            step={1}
            placeholder="Maximum Duration"
          />
      

          {/* Silence Timeout Slider */}
          <SliderCN
            value={idleTimeoutSeconds}
            onValueChange={(values) => setIdleTimeoutSeconds(values[0])}
            onInputChange={(val) => {
              const numVal = parseInt(val) || 0
              setIdleTimeoutSeconds(numVal)
            }}
            min={10}
            max={3600}
            step={1}
            label="Silence Timeout"
            description="How long should the AI wait before ending the call due to no response?"
            icon={<Phone className="h-6 w-6" />}
            unit="sec"
          />

          {/* Silence Response Select */}
          <div className="space-y-2">
            <Label htmlFor="idleMessage" className="text-base font-semibold">
              Silence Response
            </Label>
            <p className="text-sm text-muted-foreground">
              Message to say when user is silent.
            </p>
            <Select
              value={idleMessage}
              onValueChange={setIdleMessage}
            >
              <SelectTrigger id="idleMessage" className="w-full">
                <SelectValue placeholder="Select a message" />
              </SelectTrigger>
              <SelectContent className="z-[1500]">
                {IDLE_MESSAGES.map((message, index) => (
                  <SelectItem key={index} value={message}>
                    {message}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={loading || !isValid()}
            className="bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AdvancedSettingsModalCN
