import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Fade from '@mui/material/Fade'
import Modal from '@mui/material/Modal'
import React, { useEffect, useState } from 'react'

import CloseBtn from '@/components/globalExtras/CloseBtn'
import { cn } from '@/lib/utils'

export default function EditMcpPopup({
  open,
  handleClose,
  selectedMcpTool,
  setMcpName,
  setMcpUrl,
  setMcpDescription,
  mcpName,
  mcpUrl,
  mcpDescription,
  editMcpLoader,
  handleEditMcp,
  handleDeleteMcp,
  deleteMcpLoader,
}) {
  useEffect(() => {
    const updateMcpTool = async () => {
      if (selectedMcpTool) {
        setMcpName(selectedMcpTool.name)
        setMcpUrl(selectedMcpTool.url)
        setMcpDescription(selectedMcpTool.description)
      }
    }
    updateMcpTool()
  }, [selectedMcpTool])

  const [mcpUrlError, setMcpUrlError] = useState('')

  const handleMcpUrlChange = (e) => {
    const value = e.target.value
    setMcpUrl(value)

    try {
      const url = new URL(value)
      if (url.protocol !== 'https:') {
        setMcpUrlError('URL must start with https://')
      } else {
        setMcpUrlError('')
      }
    } catch (err) {
      if (value) {
        setMcpUrlError('Invalid format')
      } else {
        setMcpUrlError('')
      }
    }
  }

  return (
    <Modal
      open={open}
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
            animation:
              'modalEnter 250ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
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
              Edit Tool
            </span>
            <CloseBtn onClick={handleClose} />
          </div>

          {/* Body */}
          <div
            className="flex flex-col gap-3 px-4 py-4"
            style={{ fontSize: 14, color: 'rgba(0,0,0,0.8)' }}
          >
            <div>
              <label className="block font-medium mb-1" style={{ fontSize: 14 }}>
                Name
              </label>
              <input
                type="text"
                placeholder="Type here..."
                value={mcpName}
                onChange={(e) => setMcpName(e.target.value)}
                className="w-full h-[40px] rounded-lg border border-input px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-[hsl(var(--brand-primary))] focus:border-[hsl(var(--brand-primary))]"
                style={{ fontSize: 14 }}
              />
            </div>

            <div>
              <label className="block font-medium mb-1" style={{ fontSize: 14 }}>
                Server URL
              </label>
              <input
                type="text"
                placeholder="Paste your mcp url here"
                value={mcpUrl}
                onChange={(e) => handleMcpUrlChange(e)}
                className="w-full h-[40px] rounded-lg border border-input px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-[hsl(var(--brand-primary))] focus:border-[hsl(var(--brand-primary))]"
                style={{ fontSize: 14 }}
              />
              {mcpUrlError && (
                <div className="mt-1" style={{ color: 'red', fontSize: 12 }}>
                  {mcpUrlError}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-row items-center justify-between mb-1">
                <label className="font-medium" style={{ fontSize: 14 }}>
                  Description
                </label>
                <span className="text-muted-foreground" style={{ fontSize: 14 }}>
                  {mcpDescription?.length ?? 0}/1000
                </span>
              </div>
              <textarea
                placeholder="Describe when the AI should use this"
                value={mcpDescription}
                onChange={(e) => setMcpDescription(e.target.value)}
                maxLength={1000}
                className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-[hsl(var(--brand-primary))] focus:border-[hsl(var(--brand-primary))] resize-none"
                style={{
                  fontSize: 14,
                  height: 120,
                  border: '1px solid #eaeaea',
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex flex-row items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid #eaeaea' }}
          >
            {deleteMcpLoader ? (
              <div className="flex h-[40px] items-center justify-center">
                <CircularProgress size={24} />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDeleteMcp}
                className={cn(
                  'flex h-[40px] items-center justify-center rounded-lg px-4 text-sm font-medium',
                  'bg-muted text-foreground hover:bg-muted/80',
                  'transition-colors duration-150 active:scale-[0.98]',
                )}
              >
                Delete
              </button>
            )}
            {editMcpLoader ? (
              <div className="flex h-[40px] items-center justify-center px-6">
                <CircularProgress size={24} />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleEditMcp}
                className={cn(
                  'flex h-[40px] items-center justify-center rounded-lg px-4 text-sm font-semibold',
                  'bg-brand-primary text-white hover:opacity-90',
                  'transition-all duration-150 active:scale-[0.98]',
                )}
              >
                Save
              </button>
            )}
          </div>
        </Box>
      </Fade>
    </Modal>
  )
}
