import { Box, Button, IconButton, Modal, Typography } from '@mui/material'
import { ArrowUpRight, Copy, X } from '@phosphor-icons/react'
import Image from 'next/image'
import React, { useState } from 'react'

import { AgentXOrb } from '@/components/common/AgentXOrb'
import CloseBtn from '@/components/globalExtras/CloseBtn'

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../leads/AgentSelectSnackMessage'

const AllSetModal = ({
  open,
  onClose,
  agentName,
  onOpenAgent,
  isEmbedFlow = false,
  embedCode = '',
  fetureType = '',
  onCopyUrl = () => {},
}) => {
  const [codeCopied, setCodeCopied] = useState(false)
  const [snackbar, setSnackbar] = useState({
    isVisible: false,
    title: '',
    message: '',
    type: SnackbarTypes.Error,
  })

  // Determine agent type label based on fetureType and isEmbedFlow
  const getAgentTypeLabel = () => {
    if (isEmbedFlow || fetureType === 'embed') {
      return 'Embed Agent'
    } else if (fetureType === 'webhook') {
      return 'Webhook Agent'
    } else if (fetureType === 'webagent') {
      return 'Browser Agent'
    } else {
      // Default fallback - should not happen in normal flow
      return 'Browser Agent'
    }
  }

  // Debug: Log fetureType when modal opens or fetureType changes
  React.useEffect(() => {
    if (open) {
      console.log('🔧 AllSetModal - Modal opened with fetureType:', fetureType)
      console.log('🔧 AllSetModal - isEmbedFlow:', isEmbedFlow)
      console.log('🔧 AllSetModal - Will show:', getAgentTypeLabel())
    }
  }, [open, fetureType, isEmbedFlow])

  const showSnackbar = (title, message, type = SnackbarTypes.Success) => {
    setSnackbar({
      isVisible: true,
      title,
      message,
      type,
    })
  }

  const hideSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, isVisible: false }))
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCodeCopied(true)
      showSnackbar('Success', 'Code Copied!', SnackbarTypes.Success)
      setTimeout(() => setCodeCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
      showSnackbar('Error', 'Failed to copy code', SnackbarTypes.Error)
    }
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropProps={{
        timeout: 500,
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          borderRadius: 2,
          padding: 3,
          width: 500,
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow:
            '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)',
          textAlign: 'center',
          outline: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography
            className="capitalize"
            variant="h6"
            component="h2"
            sx={{ fontWeight: 'bold' }}
          >
            {agentName.slice(0, 20)} {agentName.length > 20 ? '...' : ''} | {getAgentTypeLabel()}
          </Typography>
          <CloseBtn onClick={onClose} />
        </Box>

        {/* Animated Orb */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <AgentXOrb
            size={120}
            alt="AgentX Orb"
          />
        </Box>

        {/* Success Message */}
        <Typography
          variant="h5"
          component="h3"
          sx={{
            fontWeight: 'bold',
            mb: 3,
            color: 'text.primary',
          }}
        >
          {`You're All Set!`}
        </Typography>

        {/* Code Copied Message (only for embed flow) */}
        {isEmbedFlow && codeCopied && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <Typography variant="body1" className="text-green-600 font-medium">
              Code Copied!
            </Typography>
          </Box>
        )}

        {/* Button */}
        {isEmbedFlow || fetureType === 'embed' ? (
          <button
            className="w-full py-3 px-4 border border-gray-300 text-purple bg-white rounded-lg font-medium hover:bg-purple hover:text-white hover:border-purple flex items-center justify-center"
            onClick={handleCopyCode}
          >
            Copy Embed Code
            <Copy size={16} className="ml-2" />
          </button>
        ) : fetureType === 'webagent' ? (
          <button
            className="w-full py-3 px-4 border border-gray-300 text-purple bg-white rounded-lg font-medium hover:bg-purple hover:text-white hover:border-purple"
            onClick={onOpenAgent}
          >
            Open agent in new tab
            <ArrowUpRight size={16} className="ml-2 inline" />
          </button>
        ) : (
          <button
            className="w-full py-3 px-4 border border-gray-300 text-purple bg-white rounded-lg font-medium hover:bg-purple hover:text-white hover:border-purple"
            onClick={onCopyUrl}
          >
            Copy Webhook Url
            <ArrowUpRight size={16} className="ml-2 inline" />
          </button>
        )}

        {/* Snackbar */}
        <AgentSelectSnackMessage
          isVisible={snackbar.isVisible}
          title={snackbar.title}
          message={snackbar.message}
          type={snackbar.type}
          hide={hideSnackbar}
        />
      </Box>
    </Modal>
  )
}

export default AllSetModal
