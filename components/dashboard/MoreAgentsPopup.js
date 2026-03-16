import { Box, Modal } from '@mui/material'
import React, { useEffect, useState } from 'react'

import CloseBtn from '../globalExtras/CloseBtn'

const MoreAgentsPopup = ({
  open,
  onClose,
  onUpgrade,
  onAddAgent,
  costPerAdditionalAgent = 10,
  from = '',
}) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (open) {
      // Remove aria-hidden from parent containers that might block interactions
      const removeAriaHidden = () => {
        // Find and temporarily remove aria-hidden from layout containers
        const layoutContainers = document.querySelectorAll(
          '.flex.flex-col.w-full[aria-hidden="true"]'
        )
        layoutContainers.forEach((container) => {
          container.setAttribute('data-aria-hidden-backup', 'true')
          container.removeAttribute('aria-hidden')
        })
      }

      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setMounted(true)
        removeAriaHidden()
      }, 50)

      return () => {
        clearTimeout(timer)
        setMounted(false)
        // Restore aria-hidden if it was backed up
        const containers = document.querySelectorAll(
          '[data-aria-hidden-backup="true"]'
        )
        containers.forEach((container) => {
          container.setAttribute('aria-hidden', 'true')
          container.removeAttribute('data-aria-hidden-backup')
        })
      }
    } else {
      setMounted(false)
    }
  }, [open, onClose, onUpgrade, onAddAgent])

  const handleUpgrade = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    // Close modal first, then open upgrade after a small delay to prevent React DOM errors
    if (onClose && typeof onClose === 'function') {
      onClose()
    }
    // Use setTimeout to prevent race condition with React DOM manipulation
    setTimeout(() => {
      if (onUpgrade && typeof onUpgrade === 'function') {
        onUpgrade()
      }
    }, 100)
  }

  const handleAddAgent = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    // Close modal first, then execute action after a small delay
    if (onClose && typeof onClose === 'function') {
      onClose()
    }
    // Use setTimeout to prevent race condition with React DOM manipulation
    setTimeout(() => {
      if (onAddAgent && typeof onAddAgent === 'function') {
        onAddAgent()
      }
    }, 100)
  }

  const handleClose = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (onClose && typeof onClose === 'function') {
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      disableEscapeKeyDown={false}
      BackdropProps={{
        timeout: 250,
        sx: {
          backgroundColor: '#00000099',
          zIndex: 1400,
        },
        onClick: (e) => {
          // Only close on backdrop click, not on content
          if (e.target === e.currentTarget) {
            handleClose(e)
          }
        },
      }}
      sx={{
        zIndex: 1400,
      }}
      slotProps={{
        root: {
          onError: (e) => {
            e.stopPropagation()
            console.error('Modal error caught:', e)
          },
        },
      }}
      disablePortal={false}
      keepMounted={false}
      disableAutoFocus={true}
      disableEnforceFocus={true}
      disableRestoreFocus={true}
      onTransitionExited={() => {
        // Cleanup after transition
        setMounted(false)
      }}
    >
      <Box
        className="flex justify-center items-center w-full h-full"
        sx={{
          outline: 'none',
          pointerEvents: 'auto',
        }}
        onError={(e) => {
          // Prevent errors from bubbling
          e.stopPropagation()
          console.error('Error in MoreAgentsPopup Box:', e)
        }}
      >
        <div
          className="w-[400px] max-w-[90vw] flex flex-col overflow-hidden rounded-[12px] bg-white mx-4"
          onClick={(e) => {
            if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
              e.stopPropagation()
            }
          }}
          style={{
            boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
            border: '1px solid #eaeaea',
            pointerEvents: 'auto',
            zIndex: 1401,
            position: 'relative',
          }}
        >
          {/* Header */}
          <div
            className="flex flex-row items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid #eaeaea' }}
          >
            <h2 className="text-[16px] font-semibold text-foreground">
              Add Extra Agents
            </h2>
            <CloseBtn onClick={handleClose} />
          </div>

          {/* Body */}
          <div
            className="flex flex-col items-center px-4 py-4"
            style={{ fontSize: 14, color: 'rgba(0,0,0,0.8)' }}
          >
            {mounted && (
              <img
                src="/otherAssets/unlockAgents.png"
                alt="Unlock Agents"
                className="mb-3"
                style={{
                  height: '100px',
                  width: 'auto',
                  maxWidth: '300px',
                  objectFit: 'contain',
                }}
              />
            )}
            <p className="text-center mb-1">
              {`You've reached the maximum number of agents on your current plan.`}
            </p>
            <p className="text-center">
              You can upgrade your plan or add an agent for{' '}
              <span className="font-semibold text-brand-primary">
                ${costPerAdditionalAgent}
              </span>{' '}
              per month.
            </p>
          </div>

          {/* Footer */}
          <div
            className="flex flex-row items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid #eaeaea' }}
          >
            <button
              onClick={handleAddAgent}
              onMouseDown={(e) => e.stopPropagation()}
              type="button"
              className="h-[40px] rounded-lg px-4 text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors duration-150 active:scale-[0.98] cursor-pointer"
              style={{ pointerEvents: 'auto', zIndex: 1402, position: 'relative' }}
            >
              Add Agent ${costPerAdditionalAgent} per month
            </button>
            <button
              onClick={handleUpgrade}
              onMouseDown={(e) => e.stopPropagation()}
              type="button"
              className="h-[40px] rounded-lg px-4 text-sm font-semibold bg-brand-primary text-white hover:opacity-90 transition-all duration-150 active:scale-[0.98] cursor-pointer"
              style={{ pointerEvents: 'auto', zIndex: 1402, position: 'relative' }}
            >
              Upgrade
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  )
}

export default MoreAgentsPopup
