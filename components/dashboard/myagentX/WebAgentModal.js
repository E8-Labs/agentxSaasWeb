import React, { useState, useEffect } from 'react';
import {
  FormControl,
  MenuItem,
  Select,
  Switch,
} from '@mui/material';
import { ArrowUpRight, X } from '@phosphor-icons/react';
import axios from 'axios';
import Image from 'next/image';
import AgentSelectSnackMessage, { SnackbarTypes } from '../leads/AgentSelectSnackMessage';
import Apis from '../../apis/Apis';
import CloseBtn from '@/components/globalExtras/CloseBtn';

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
        `${Apis.getSheets}?type=manual`,
        {
          headers: {
            'Content-Type': 'application/json',
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
      showSnackbar('Error', 'Failed to fetch smart lists. Please try again.', SnackbarTypes.Error);
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
        let AuthToken = null;
        const localData = localStorage.getItem("User");
        if (localData) {
          const UserDetails = JSON.parse(localData);
          AuthToken = UserDetails.token;
        }

        // Note: This API endpoint might need to be added to Apis.js
        const response = await axios.post(
          `${Apis.attachSmartList}`, // Using a placeholder - update Apis.js if needed
          {
            agentId: agentId,
            smartListId: selectedSmartList
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${AuthToken}`
            }
          }
        );

        if (response.data) {
          // Success - now open the agent
          showSnackbar('Success', 'Smart list attached successfully!', SnackbarTypes.Success);
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

  const styles = {
    modalsStyle: {
      height: "auto",
      bgcolor: "transparent",
      mx: "auto",
      // my: "50vh",
      // transform: "translateY(-50%)",
      borderRadius: 2,
      border: "none",
      outline: "none",
    },
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
          position: 'relative',
          zIndex: 1,
          pointerEvents: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
            {agentName?.charAt(0).toUpperCase() + agentName?.slice(1)} | Browser Agent
          </h2>
         <CloseBtn
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          />
        </div>

        {/* Require Form Section */}
        <div style={{
          marginBottom: 24,
          padding: 16,
          backgroundColor: '#f8f9fa',
          borderRadius: 8,
          border: '1px solid #e9ecef'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
              Require users to complete a form?
            </div>
            <Switch
              checked={requireForm}
              onChange={handleToggleChange}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#7902DF',
                  '& + .MuiSwitch-track': {
                    backgroundColor: '#7902DF',
                  },
                },
                '& .MuiSwitch-track': {
                  backgroundColor: '#ccc',
                },
              }}
            />
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            This prompts users to fill out a form before they engage in a conversation with your AI.
          </div>
        </div>

        {/* Smart List Selection */}
        {requireForm && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 'medium', color: 'rgba(0, 0, 0, 0.5)', fontSize: '16px' }}>
                Select Smart List
              </div>
              <button
                className="text-purple underline text-transform-none font-medium"
                onClick={(e) => {
                  console.log('New Smartlist button clicked');
                  e.stopPropagation();
                  handleNewSmartList();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  position: 'relative',
                  zIndex: 10
                }}
              >
                New Smartlist
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                <div>Loading...</div>
              </div>
            ) : smartLists.length > 0 ? (
             <FormControl className='w-full h-[50px]'>
              <Select
                value={selectedSmartList}
                onChange={(e) => setSelectedSmartList(e.target.value)}
                style={{
                  border: "1px solid #E5E7EB",
                  fontSize: '14px',
                  padding: '12px',
                  backgroundColor: '#fff',
                  width: '100%',
                  borderRadius: '6px',
                  outline: 'none'
                }}
                   sx={{
                    height: "48px",
                    borderRadius: "13px",
                    border: "1px solid #00000020", // Default border
                    "&:hover": {
                      border: "1px solid #00000020", // Same border on hover
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none", // Remove the default outline
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      border: "none", // Remove outline on focus
                    },
                    "&.MuiSelect-select": {
                      py: 0, // Optional padding adjustments
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: "30vh", // Limit dropdown height
                        overflow: "auto", // Enable scrolling in dropdown
                        scrollbarWidth: "none",
                        // borderRadius: "10px"
                      },
                    },
                  }}
              >
              
                {smartLists.map((list, index) => (
                  <MenuItem key={list.id || index} value={list.id}>
                    {list.sheetName}
                  </MenuItem>
                ))}
              </Select>
              </FormControl>
            ) : (
              <div style={{ padding: '16px 0', fontSize: '14px', color: '#666' }}>
                No smart lists available. Create a new one to get started.
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 24 }}>
          <button
            onClick={(e) => {
              console.log('Cancel button clicked');
              e.stopPropagation();
              onClose();
            }}
            style={{
              padding: '8px 16px',
              color: '#6b7280',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              position: 'relative',
              zIndex: 10
            }}
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              console.log('Open agent button clicked');
              e.stopPropagation();
              handleOpenAgent();
            }}
            disabled={requireForm && !selectedSmartList}
            style={{
              padding: '8px 24px',
              backgroundColor: requireForm && !selectedSmartList ? '#d1d5db' : '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: requireForm && !selectedSmartList ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              zIndex: 10
            }}
          >
            Open agent in new tab
            <ArrowUpRight size={16} style={{ marginLeft: 8 }} />
          </button>
        </div>
        
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
