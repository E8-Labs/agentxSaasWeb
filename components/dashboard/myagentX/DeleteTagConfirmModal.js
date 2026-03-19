'use client'

import { Box, Fade, Modal } from '@mui/material'
import { Trash } from 'lucide-react'

import CloseBtn from '@/components/globalExtras/CloseBtn'
import { cn } from '@/lib/utils'

const DeleteTagConfirmModal = ({ open, tag, onClose, onConfirm, loading = false }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
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
                <Trash size={18} className="text-destructive" strokeWidth={2} />
              </div>
              <span
                className="font-semibold"
                style={{ fontSize: 16, color: 'rgba(0,0,0,0.9)' }}
              >
                Delete tag
              </span>
            </div>
            <CloseBtn onClick={onClose} />
          </div>

          {/* Body */}
          <div
            className="flex-1 px-4 py-4"
            style={{ fontSize: 14, color: 'rgba(0,0,0,0.8)' }}
          >
            {tag ? (
              <>
                Delete tag &quot;<strong>{tag}</strong>&quot; from all agents? This cannot be
                undone.
              </>
            ) : (
              'Delete this tag from all agents? This cannot be undone.'
            )}
          </div>

          {/* Footer */}
          <div
            className="flex flex-row items-center justify-end gap-2 px-4 py-3"
            style={{ borderTop: '1px solid #eaeaea' }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={cn(
                'flex h-[40px] items-center justify-center rounded-lg px-4 text-sm font-medium',
                'bg-muted text-foreground hover:bg-muted/80',
                'transition-colors duration-150 active:scale-[0.98]',
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={cn(
                'flex h-[40px] items-center justify-center rounded-lg px-4 text-sm font-semibold',
                'bg-destructive text-destructive-foreground hover:opacity-90',
                'transition-all duration-150 active:scale-[0.98]',
                loading && 'opacity-70 pointer-events-none',
              )}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting…
                </span>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </Box>
      </Fade>
    </Modal>
  )
}

export default DeleteTagConfirmModal
