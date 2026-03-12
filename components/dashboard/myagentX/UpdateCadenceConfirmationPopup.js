'use client'

import { Box, Fade, Modal } from '@mui/material'

import CloseBtn from '@/components/globalExtras/CloseBtn'

export const UpdateCadenceConfirmationPopup = ({
  showConfirmationPopuup,
  setShowConfirmationPopup,
  onContinue,
}) => {
  const handleClose = () => setShowConfirmationPopup(false)

  return (
    <Modal
      open={!!showConfirmationPopuup}
      onClose={handleClose}
      closeAfterTransition
      BackdropProps={{
        timeout: 250,
        sx: { backgroundColor: '#00000099' },
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Fade in={!!showConfirmationPopuup} timeout={250}>
        <Box
          className="flex w-[400px] max-w-[90vw] flex-col overflow-hidden rounded-[12px] bg-white"
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
            <span
              className="font-semibold"
              style={{ fontSize: 16, color: 'rgba(0,0,0,0.9)' }}
            >
              Update Pipeline and Stages
            </span>
            <CloseBtn onClick={handleClose} />
          </div>

          {/* Body */}
          <div
            className="px-4 py-4"
            style={{ fontSize: 14, color: 'rgba(0,0,0,0.8)' }}
          >
            By updating this, you'll pause all calls assigned to this agent.
          </div>

          {/* Footer */}
          <div
            className="flex flex-row items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid #eaeaea' }}
          >
            <button
              type="button"
              onClick={handleClose}
              className="flex h-[40px] items-center justify-center rounded-lg px-4 text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors duration-150 active:scale-[0.98] outline-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onContinue()}
              className="flex h-[40px] items-center justify-center rounded-lg px-4 text-sm font-semibold bg-brand-primary text-white hover:opacity-90 transition-all duration-150 active:scale-[0.98] outline-none"
            >
              Continue
            </button>
          </div>
        </Box>
      </Fade>
    </Modal>
  )
}
