import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import { ArrowUpRight, X, Copy } from '@phosphor-icons/react';
import Image from 'next/image';
import AgentSelectSnackMessage, { SnackbarTypes } from '../leads/AgentSelectSnackMessage';
import CloseBtn from '@/components/globalExtras/CloseBtn';

const AllSetModal = ({ 
  open, 
  onClose, 
  agentName,
  onOpenAgent,
  isEmbedFlow = false,
  embedCode = '',
  fetureType = '',
  onCopyUrl = () => {}
}) => {
  const [codeCopied, setCodeCopied] = useState(false);
  const [snackbar, setSnackbar] = useState({
    isVisible: false,
    title: '',
    message: '',
    type: SnackbarTypes.Error
  });

  const showSnackbar = (title, message, type = SnackbarTypes.Success) => {
    setSnackbar({
      isVisible: true,
      title,
      message,
      type
    });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({ ...prev, isVisible: false }));
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCodeCopied(true);
      showSnackbar('Success', 'Code Copied!', SnackbarTypes.Success);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
      showSnackbar('Error', 'Failed to copy code', SnackbarTypes.Error);
    }
  };
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 24,
          width: 500,
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)',
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            {agentName?.charAt(0).toUpperCase() + agentName?.slice(1)} | {`${fetureType === "webhook" ? "Webhook Agent" : "Browser Agent"}`}
          </Typography>
          <CloseBtn
             onClick={onClose}
          />
         
        </Box>

        {/* Animated Orb */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Image
            src="/agentXOrb.gif"
            alt="AgentX Orb"
            width={120}
            height={120}
          />
        </Box>

        {/* Success Message */}
        <Typography 
          variant="h5" 
          component="h3" 
          sx={{ 
            fontWeight: 'bold', 
            mb: 3,
            color: 'text.primary'
          }}
        >
          {`You're All Set!`}
        </Typography>

        {/* Code Copied Message (only for embed flow) */}
        {isEmbedFlow && codeCopied && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <Typography variant="body1" className="text-green-600 font-medium">
              Code Copied!
            </Typography>
          </Box>
        )}

        {/* Button */}
        {isEmbedFlow ? (
          <button
            className="w-full py-3 px-4 border border-gray-300 text-purple bg-white rounded-lg font-medium hover:bg-purple hover:text-white hover:border-purple flex items-center justify-center"
            onClick={handleCopyCode}
          >
            Copy Embed Code
            <Copy size={16} className="ml-2" />
          </button>
        ) : (

          <button
            className="w-full py-3 px-4 border border-gray-300 text-purple bg-white rounded-lg font-medium hover:bg-purple hover:text-white hover:border-purple"
            onClick={fetureType === "webagent" ? onOpenAgent : onCopyUrl}
          >
            {fetureType === "webagent" ? "Open agent in new tab" : "Copy Webhook Url"}
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
      </div>
    </div>
  );
};

export default AllSetModal;
