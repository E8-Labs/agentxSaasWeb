'use client'

import React, { useState, useEffect } from 'react'
import {
  Modal,
  Box,
  Typography,
  Fade,
  MenuItem,
  FormControl,
  TextField,
  CircularProgress,
} from '@mui/material'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'


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
      closeAfterTransition
      BackdropProps={{
        timeout: 250,
        sx: {
          backgroundColor: '#00000099',
        },
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1600,
      }}
    >
      <Fade in={open} timeout={250}>
        <Box
          className={cn(
            'flex flex-col w-[400px] max-w-[90vw] overflow-hidden rounded-[12px] bg-white',
            className,
          )}
          sx={{
            boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
            border: '1px solid #eaeaea',
            outline: 'none',
            m: 0,
            p: 0,
            maxHeight: '90vh',
            fontFamily: 'Inter, sans-serif',
            '@keyframes modalEnter': {
              '0%': { transform: 'scale(0.95)' },
              '100%': { transform: 'scale(1)' },
            },
            animation:
              'modalEnter 250ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
        >
          <div>
            <AgentSelectSnackMessage
              isVisible={isVisibleSnack}
              type={SnackbarTypes.Error}
              message={`Silence timeout cannot be less than 10 seconds`}
              hide={() => {
                setIsVisibleSnack(false)
              }}
            />
          </div>

          {/* Header */}
          <div
            className="flex flex-row items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid #eaeaea' }}
          >
            <Typography
              variant="h5"
              fontWeight={600}
              gutterBottom
              sx={{ fontSize: 16, fontFamily: 'Inter, sans-serif' }}
            >
              Advanced Settings
            </Typography>

            <CloseBtn
              onClick={() => {
                onOpenChange(false)
              }}
            />
          </div>

          {/* Body */}
          <div
            className="flex-1 px-4 py-4"
            style={{ fontSize: 14, color: 'rgba(0,0,0,0.8)' }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ fontSize: 14, mb: 2 }}
            >
              Configure advanced call settings for your agent
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Maximum Duration */}
              <Box
                sx={{
                  fontSize: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: '1px' }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={400}
                    gutterBottom
                    sx={{ fontSize: 14, fontFamily: 'Inter, sans-serif' }}
                  >
                    Maximum Duration (seconds)
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontSize: 14 }}
                  >
                    The maximum duration of a call in minutes
                  </Typography>
                </Box>
                <div className="flex flex-row items-center h-[40px] border border-input rounded-lg w-full transition-colors hover:border-[hsl(var(--brand-primary)/0.5)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[hsl(var(--brand-primary))] focus-within:ring-offset-0 focus-within:border-[1px] focus-within:border-[hsl(var(--brand-primary))]">
                  <Input
                    type="number"
                    value={maxDurationSeconds}
                    onChange={(e) => setMaxDurationSeconds(e.target.value)}
                    className="border-0 rounded-r-none rounded-l px-3 h-[40px] outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 w-full bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-[14px]"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap pr-3 pointer-events-none">
                    {Number(maxDurationSeconds) === 1 ? 'min' : 'mins'}
                  </span>
                </div>
              </Box>

              {/* Silence Timeout */}
              <Box
                sx={{
                  fontSize: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: '1px' }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={400}
                    gutterBottom
                    sx={{ fontSize: 14, fontFamily: 'Inter, sans-serif' }}
                  >
                    Silence Timeout (seconds)
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontSize: 14 }}
                  >
                    Time before considering user as idle
                  </Typography>
                </Box>
                <div className="flex flex-row items-center h-[40px] border border-input rounded-lg w-full transition-colors hover:border-[hsl(var(--brand-primary)/0.5)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[hsl(var(--brand-primary))] focus-within:ring-offset-0 focus-within:border-[1px] focus-within:border-[hsl(var(--brand-primary))]">
                  <Input
                    type="number"
                    value={idleTimeoutSeconds}
                    onChange={handleIdleTimeoutChange}
                    placeholder="Silence Timeout"
                    className="border-0 rounded-r-none rounded-l px-3 h-[40px] outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 w-full bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-[14px]"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap pr-3 pointer-events-none">
                    {Number(idleTimeoutSeconds) === 1 ? 'sec' : 'secs'}
                  </span>
                </div>
              </Box>

              {/* Silence Response */}
              <Box
                className="z-1900"
                sx={{
                  fontSize: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: '1px' }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={400}
                    gutterBottom
                    sx={{ fontSize: 14, fontFamily: 'Inter, sans-serif' }}
                  >
                    Silence Response
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontSize: 14 }}
                  >
                    Message to say when user is silent.
                  </Typography>
                </Box>
                <Select value={idleMessage} onValueChange={setIdleMessage}>
                  <SelectTrigger
                    id="idleMessage"
                    className="w-full h-[40px] border border-input rounded-lg transition-colors hover:border-[hsl(var(--brand-primary)/0.5)] focus:ring-2 focus:ring-[hsl(var(--brand-primary))] focus:border-[1px] focus:border-[hsl(var(--brand-primary))] data-[state=open]:border-[1px] data-[state=open]:border-[hsl(var(--brand-primary))]"
                  >
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
          </div>

          {/* Footer (action bar) */}
          <div
            className="flex flex-row items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid #eaeaea' }}
          >
            <button
              type="button"
              onClick={handleCancel}
              className={cn(
                'flex h-[40px] items-center justify-center rounded-lg px-4 text-sm font-medium',
                'bg-muted text-foreground hover:bg-muted/80',
                'transition-colors duration-150 active:scale-[0.98]',
              )}
            >
              Cancel
            </button>
            <Button
              onClick={handleSave}
              disabled={loading || !isValid()}
              className={cn(
                'flex h-[40px] items-center justify-center rounded-lg px-4 text-sm font-semibold',
                'bg-brand-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-all duration-150 active:scale-[0.98]',
              )}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Box>
      </Fade>
    </Modal>
  )
}

export default AdvancedSettingsModalCN