import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import { ArrowUpRight, X } from '@phosphor-icons/react';
import Image from 'next/image';

const AllSetModal = ({ 
  open, 
  onClose, 
  agentName,
  onOpenAgent 
}) => {
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
            {agentName?.charAt(0).toUpperCase() + agentName?.slice(1)} | Browser Agent
          </Typography>
          <button onClick={onClose}>
            <Image
              src={"/assets/crossIcon.png"}
              height={40}
              width={40}
              alt="*"
            />
          </button>
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
          You're All Set!
        </Typography>

        {/* Open Agent Button */}
        <button
          className="w-full py-3 px-4 border border-gray-300 text-purple bg-white rounded-lg font-medium hover:bg-purple hover:text-white hover:border-purple"
          onClick={onOpenAgent}
        >
          Open agent in new tab
          <ArrowUpRight size={16} className="ml-2 inline" />
        </button>
      </div>
    </div>
  );
};

export default AllSetModal;
