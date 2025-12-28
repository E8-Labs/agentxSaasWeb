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
        console.log('MoreAgentsPopup is open', {
          onClose: typeof onClose,
          onUpgrade: typeof onUpgrade,
          onAddAgent: typeof onAddAgent,
        })
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
    console.log('handleUpgrade called', { onUpgrade, onClose })
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
    console.log('handleAddAgent called', { onAddAgent })
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
    console.log('handleClose called', { onClose })
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
        timeout: 100,
        sx: {
          backgroundColor: '#00000020',
          backdropFilter: 'blur(15px)',
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
          className="bg-white rounded-2xl p-8 relative max-w-2xl w-full mx-4"
          onClick={(e) => {
            // Prevent clicks inside modal from closing it, but allow button clicks
            if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
              e.stopPropagation()
            }
          }}
          style={{
            boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.1)',
            pointerEvents: 'auto',
            zIndex: 1401,
            position: 'relative',
          }}
        >
          <div className="w-full flex flex-col items-center">
            <div className="flex flex-row items-center justify-between w-full">
              <div></div>
              {/* Close Button */}
              <CloseBtn 
                onClick={handleClose}
              />
            </div>
            {/* Avatars */}
            {mounted && (
              <img
                src="/otherAssets/unlockAgents.png"
                alt="Unlock Agents"
                style={{
                  height: '100px',
                  width: 'auto',
                  maxWidth: '300px',
                  objectFit: 'contain',
                }}
              />
            )}

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4 -mt-3">
              Add Extra Agents
            </h2>

            {/* Description */}
            <div className="text-center text-gray-600 mb-8 space-y-2">
              <p>{`You've reached the maximum number of agents on your current plan.`}</p>
              <p>
                You can upgrade your plan or add an agent for{' '}
                <span className="font-semibold text-brand-primary">
                  ${costPerAdditionalAgent}
                </span>{' '}
                per month.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Upgrade Button */}
              <button
                onClick={handleUpgrade}
                onMouseDown={(e) => {
                  e.stopPropagation()
                }}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors cursor-pointer"
                type="button"
                style={{ pointerEvents: 'auto', zIndex: 1402, position: 'relative' }}
              >
                Upgrade
              </button>

              {/* Add Agent Button */}
              <button
                onClick={handleAddAgent}
                onMouseDown={(e) => {
                  e.stopPropagation()
                }}
                className="w-full text-brand-primary hover:text-brand-primary/80 font-semibold py-2 px-6 rounded-lg transition-colors block text-center cursor-pointer"
                type="button"
                style={{ pointerEvents: 'auto', zIndex: 1402, position: 'relative' }}
              >
                Add Agent ${costPerAdditionalAgent} per month
              </button>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  )
}

export default MoreAgentsPopup
