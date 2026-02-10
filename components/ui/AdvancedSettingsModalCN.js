'use client'

import React, { useState, useEffect } from 'react'
import {
  Modal,
  Box,
  Typography,

  MenuItem,
  FormControl,
  TextField,
  CircularProgress,
} from '@mui/material'

import { Button } from '@/components/ui/button'


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'


import { Input } from '@/components/ui/input'
import CloseBtn from '../globalExtras/CloseBtn'
import AgentSelectSnackMessage, { SnackbarTypes } from '../dashboard/leads/AgentSelectSnackMessage'

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

const AdvancedSettingsModalCN = ({
  open,
  onOpenChange,
  onSave,
  initialValues = {},
  loading = false,
  className,
}) => {
  const [maxDurationSeconds, setMaxDurationSeconds] = useState(
    initialValues.maxDurationSeconds ?? 10
  )
  const [idleTimeoutSeconds, setIdleTimeoutSeconds] = useState(
    initialValues.idleTimeoutSeconds ?? 10
  )
  const [idleMessage, setIdleMessage] = useState(
    initialValues.idleMessage ?? IDLE_MESSAGES[0]
  )

  const initMaxDuration = initialValues.maxDurationSeconds ?? 600
  const initIdleTimeout = initialValues.idleTimeoutSeconds ?? 10
  const initIdleMessage = initialValues.idleMessage ?? IDLE_MESSAGES[0]
  //code for snackbar
  const [isVisibleSnack, setIsVisibleSnack] = useState(false)

  useEffect(() => {
    if (open) {
      setMaxDurationSeconds(initMaxDuration / 60)
      setIdleTimeoutSeconds(initIdleTimeout)
      setIdleMessage(initIdleMessage)
    }
  }, [open, initMaxDuration, initIdleTimeout, initIdleMessage])

  const isValid = () => {
    const maxDurationValid =
      maxDurationSeconds >= 1 &&
      maxDurationSeconds <= 720 &&
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
      maxDurationSeconds: Number(maxDurationSeconds) * 60,
      idleTimeoutSeconds: Number(idleTimeoutSeconds),
      idleMessage,
    })
  }

  const handleCancel = () => {
    setMaxDurationSeconds(initialValues.maxDurationSeconds / 60 ?? 10)
    setIdleTimeoutSeconds(initialValues.idleTimeoutSeconds ?? 10)
    setIdleMessage(initialValues.idleMessage ?? IDLE_MESSAGES[0])
    onOpenChange(false)
  }

  const handleMaxDurationChange = (e) => {
    const value = e.target.value === '' ? '' : parseInt(e.target.value, 10)
    setMaxDurationSeconds(value)
  }

  const isMinimumTimeValid = (value) => {
    if (value < 10) {
      setIsVisibleSnack(true)
    } else if (value >= 10) {
      setIsVisibleSnack(false)
    }
  }

  const handleIdleTimeoutChange = (e) => {
    const value = e.target.value === '' ? '' : parseInt(e.target.value, 10)
    setIdleTimeoutSeconds(value)
    isMinimumTimeValid(value);
  }

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1600,
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          p: 4,
          width: '100%',
          maxWidth: '600px',
          mx: 2,
          maxHeight: '90vh',
          overflow: 'auto',
          outline: 'none',
          zIndex: 1700
        }}
        className={className}
      >
        {/* Header */}

        <div>
          <AgentSelectSnackMessage
            isVisible={isVisibleSnack}
            type={SnackbarTypes.Error}
            message={`Minimum time of the call can’t be less than 10 seconds`}
            hide={() => {
              setIsVisibleSnack(false)
            }}
          />
        </div>

        <div className='flex flex-row items-center justify-between z-1750'>
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
          >
            Advanced Settings
          </Typography>

          <CloseBtn
            onClick={() => {
              console.log("clicked")
              onOpenChange(false)
            }}
          />
        </div>

        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
          sx={{ mb: 3 }}
        >
          Configure advanced call settings for your agent
        </Typography>

        {/* Content */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, zIndex: 1800 }}>
          {/* Maximum Duration */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
            >
              Maximum Duration (seconds)
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ mb: 1 }}
            >
              The maximum duration of a call in minutes
            </Typography>
            <div className="flex flex-row items-center border rounded w-1/2 focus-within:outline-none focus-within:ring-0 focus-within:border-black transition-colors">
              <Input
                type="number"
                value={maxDurationSeconds}
                onChange={(e) => setMaxDurationSeconds(e.target.value)}
                className="border-0 rounded-r-none rounded-l px-3 py-2.5 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 w-full bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap pr-3 pointer-events-none">
                {Number(maxDurationSeconds) === 1 ? 'min' : 'mins'}
              </span>
            </div>
          </Box>

          {/* Silence Timeout */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
            >
              Silence Timeout (seconds)
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ mb: 1 }}
            >
              Time before considering user as idle
            </Typography>
            <div className="flex flex-row items-center border rounded w-1/2 focus-within:outline-none focus-within:ring-0 focus-within:border-black transition-colors">
              <Input
                type="number"
                value={idleTimeoutSeconds}
                onChange={handleIdleTimeoutChange}
                placeholder="Silence Timeout"
                className="border-0 rounded-r-none rounded-l px-3 py-2.5 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 w-full bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap pr-3 pointer-events-none">
                {Number(idleTimeoutSeconds) === 1 ? 'sec' : 'secs'}
              </span>
            </div>
          </Box>

          {/* Silence Response */}
          <Box className="z-1900">
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
            >
              Silence Response
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ mb: 1 }}
            >
              Message to say when user is silent.
            </Typography>
            <Select
              value={idleMessage}
              onValueChange={setIdleMessage}
            >
              <SelectTrigger id="idleMessage" className="w-full">
                <SelectValue placeholder="Select a message" />
              </SelectTrigger>
              <SelectContent className="z-[2000]">
                {IDLE_MESSAGES.map((message, index) => (
                  <SelectItem key={index} value={message}>
                    {message}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            onClick={handleSave}
            disabled={loading || !isValid()}
            className="bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default AdvancedSettingsModalCN