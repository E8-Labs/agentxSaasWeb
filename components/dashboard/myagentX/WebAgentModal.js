import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
  TextField,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import { ArrowUpRight, X } from '@phosphor-icons/react';
import axios from 'axios';
import Image from 'next/image';
import AgentSelectSnackMessage, { SnackbarTypes } from '../leads/AgentSelectSnackMessage';

const WebAgentModal = ({ 
  open, 
  onClose, 
  agentName, 
  modelId, 
  agentId,
  onOpenAgent,
  onShowNewSmartList 
}) => {
  const [requireForm, setRequireForm] = useState(false);
  const [smartLists, setSmartLists] = useState([]);
  const [selectedSmartList, setSelectedSmartList] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    isVisible: false,
    title: '',
    message: '',
    type: SnackbarTypes.Error
  });

  const showSnackbar = (title, message, type = SnackbarTypes.Error) => {
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

  useEffect(() => {
    if (open && requireForm) {
      fetchSmartLists();
    }
  }, [open, requireForm]);

  const fetchSmartLists = async () => {
    try {
      setLoading(true);
      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }
      
      const response = await axios.get(
        'https://apimyagentx.com/agentxtest/api/leads/getSheets?type=manual',
        {
          headers: {
            
            'Authorization': `Bearer ${AuthToken}`
          }
        }
      );
      
      console.log("get sheets response is", response);
      if (response.data && response.data.data && response.data.data.length > 0) {
        setSmartLists(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching smart lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = (event) => {
    setRequireForm(event.target.checked);
    if (!event.target.checked) {
      setSelectedSmartList('');
    }
  };

  const handleOpenAgent = async () => {
    if (requireForm && !selectedSmartList) {
      return; // Don't open if form is required but no smart list selected
    }
    
    // If form is required and a smart list is selected, attach it to the agent first
    if (requireForm && selectedSmartList) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          'https://apimyagentx.com/agentxtest/api/agent/attachSmartList',
          {
            agentId: agentId,
            smartListId: selectedSmartList
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.data) {
          // Success - now open the agent
          onOpenAgent();
        }
      } catch (error) {
        console.error('Error attaching smart list:', error);
        showSnackbar('Error', 'Error attaching smart list. Please try again.', SnackbarTypes.Error);
        return;
      }
    } else {
      // No form required or no smart list selected, just open the agent
      onOpenAgent();
    }
  };

  const handleNewSmartList = () => {
    onShowNewSmartList();
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

        {/* Require Form Section */}
        <Box sx={{ 
          mb: 3, 
          p: 2, 
          backgroundColor: '#f8f9fa', 
          borderRadius: 2,
          border: '1px solid #e9ecef'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Require users to complete a form?
            </Typography>
            <Switch
              checked={requireForm}
              onChange={handleToggleChange}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#9c27b0',
                  '& + .MuiSwitch-track': {
                    backgroundColor: '#9c27b0',
                  },
                },
                '& .MuiSwitch-track': {
                  backgroundColor: '#ccc',
                },
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            This prompts users to fill out a form before they engage in a conversation with your AI.
          </Typography>
        </Box>

        {/* Smart List Selection */}
        {requireForm && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'rgba(0, 0, 0, 0.5)' }}>
                Select Smart List
              </Typography>
              <button
                className="text-purple underline text-transform-none font-medium"
                onClick={handleNewSmartList}
              >
                New Smartlist
              </button>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : smartLists.length > 0 ? (
              <FormControl fullWidth>
                <InputLabel>Select</InputLabel>
                <Select
                  value={selectedSmartList}
                  onChange={(e) => setSelectedSmartList(e.target.value)}
                  label="Select"
                >
                  {smartLists.map((list, index) => (
                    <MenuItem key={index} value={list.id}>
                      {list.sheetName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                No smart lists available. Create a new one to get started.
              </Typography>
            )}
          </Box>
        )}

        {/* Open Agent Button */}
        <button
          className="w-full py-3 px-4 border border-gray-300 text-purple bg-white rounded-lg font-medium hover:bg-purple hover:text-white hover:border-purple disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleOpenAgent}
          disabled={requireForm && !selectedSmartList}
        >
          Open agent in new tab
          <ArrowUpRight size={16} className="ml-2 inline" />
        </button>
        
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

export default WebAgentModal;
