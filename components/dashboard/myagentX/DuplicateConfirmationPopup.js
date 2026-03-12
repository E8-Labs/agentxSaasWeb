'use client'

import { Box, CircularProgress, Fade, Modal } from '@mui/material'
import React from 'react'

import CloseBtn from '@/components/globalExtras/CloseBtn'
import { cn } from '@/lib/utils'

const DuplicateConfirmationPopup = ({
  open,
  handleClose,
  handleDuplicate,
  duplicateLoader = false,
}) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
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
      }}
    >
      <Fade in={open} timeout={250}>
        <Box
          className={cn(
            'flex flex-col w-[400px] max-w-[90vw] overflow-hidden rounded-[12px] bg-white',
          )}
          sx={{
            boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
            border: '1px solid #eaeaea',
            outline: 'none',
            '@keyframes modalEnter': {
              '0%': { transform: 'scale(0.95)' },
              '100%': { transform: 'scale(1)' },
            },
            animation: 'modalEnter 250ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
        >
          {/* Header */}
          <div
            className="flex flex-row items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid #eaeaea' }}
          >
            <div className="flex flex-row items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10"
                aria-hidden
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-destructive"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
              <span
                className="font-semibold"
                style={{ fontSize: 16, color: 'rgba(0,0,0,0.9)' }}
              >
                Duplicate Agent
              </span>
            </div>
            <CloseBtn onClick={handleClose} />
          </div>

          {/* Body */}
          <div className="flex-1 px-4 py-4" style={{ fontSize: 14, color: 'rgba(0,0,0,0.8)' }}>
            Are you sure you want to duplicate this agent?
          </div>

          {/* Footer (action bar) */}
          <div
            className="flex flex-row items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid #eaeaea' }}
          >
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                'flex h-[40px] items-center justify-center rounded-lg px-4 text-sm font-medium',
                'bg-muted text-foreground hover:bg-muted/80',
                'transition-colors duration-150 active:scale-[0.98]',
              )}
            >
              Cancel
            </button>
            {duplicateLoader ? (
              <div className="flex h-[40px] items-center justify-center px-6">
                <CircularProgress size={24} />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDuplicate}
                className={cn(
                  'flex h-[40px] items-center justify-center rounded-lg px-4 text-sm font-semibold',
                  'bg-brand-primary text-white hover:opacity-90',
                  'transition-all duration-150 active:scale-[0.98]',
                )}
              >
                Yes. Duplicate
              </button>
            )}
          </div>
        </Box>
      </Fade>
    </Modal>
  )
}

export default DuplicateConfirmationPopup
