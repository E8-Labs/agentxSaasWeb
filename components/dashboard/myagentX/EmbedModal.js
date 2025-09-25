import React, { useState, useRef } from 'react';
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
  Modal,
  Fade,
} from '@mui/material';
import { ArrowUpRight, X, Upload } from '@phosphor-icons/react';
import axios from 'axios';
import Image from 'next/image';
import AgentSelectSnackMessage, { SnackbarTypes } from '../leads/AgentSelectSnackMessage';

const EmbedModal = ({ 
  open, 
  onClose, 
  agentName,
  agentId,
  onShowSmartList,
  onShowAllSet
}) => {
  const [buttonLabel, setButtonLabel] = useState('Get Help');
  const [requireForm, setRequireForm] = useState(false);
  const [smartLists, setSmartLists] = useState([]);
  const [selectedSmartList, setSelectedSmartList] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);
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
    if (event.target.checked) {
      fetchSmartLists();
    } else {
      setSelectedSmartList('');
    }
  };

  const handleLogoChange = (event) => {
    try {
      const file = event.target.files[0];
      if (file) {
        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setLogoPreview(e.target.result);
        };
        reader.onerror = (error) => {
          console.error('Error reading file:', error);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error handling logo change:', error);
    }
  };

  const handleCopyEmbed = async () => {
    try {
      setLoading(true);
      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      const formData = new FormData();
      formData.append('agentId', agentId);
      if (logoFile) {
        formData.append('media', logoFile);
      }
      formData.append('supportButtonText', buttonLabel);
      formData.append('smartListEnabled', requireForm.toString());
      if (requireForm && selectedSmartList) {
        formData.append('smartListId', selectedSmartList);
      }

      const response = await axios.post(
        'https://apimyagentx.com/agentxtest/api/agent/updateAgentSupportButton',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${AuthToken}`
          }
        }
      );

      if (response.data) {
        if (requireForm && selectedSmartList) {
          onShowSmartList();
        } else {
          onShowAllSet();
        }
      }
    } catch (error) {
      console.error('Error updating support button:', error);
      showSnackbar('Error', 'Error updating support button. Please try again.', SnackbarTypes.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSmartList = () => {
    onShowSmartList();
  };

  const styles = {
    modalsStyle: {
      height: "auto",
    //   width: "45vw",
      bgcolor: "transparent",
      mx: "auto",
      my: "50vh",
      transform: "translateY(-50%)",
      borderRadius: 2,
      border: "none",
      outline: "none",
    },
  };

  if (!open) return null;

  console.log('EmbedModal rendering, open:', open);

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropProps={{
        timeout: 1000,
        sx: {
          backgroundColor: "#00000020",
        },
      }}
    >
      <Box className="xl:w-6/12 lg:w-7/12 sm:w-10/12 w-8/12" sx={styles.modalsStyle}>
        <div className="flex flex-row justify-center w-full">
          <div
            className="w-full"
            style={{
              backgroundColor: "#ffffff",
              padding: 24,
              borderRadius: "13px",
              display: 'flex',
              maxHeight: '90vh',
            }}
          >
            {/* Left Side - Configuration */}
            <div style={{ flex: 1, paddingRight: 24 }}>
            {/* Header */}
            {/* <div className="flex flex-row justify-between items-center mb-3">
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                {agentName?.charAt(0).toUpperCase() + agentName?.slice(1)} | Embed Agent
              </Typography>
              <button onClick={onClose}>
                <Image
                  src={"/assets/cross.png"}
                  height={14}
                  width={14}
                  alt="*"
                />
              </button>
            </div> */}

        {/* Logo Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundImage: logoPreview ? `url(${logoPreview})` : 'url(/thumbOrbSmall.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                marginRight: 12,
                border: logoPreview ? 'none' : '1px solid #e0e0e0',
              }}
            />
            <button
              className="text-purple underline text-transform-none font-medium flex items-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} className="mr-1" />
              Change Logo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              onClick={(e) => e.stopPropagation()}
              style={{ display: 'none' }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 40, marginRight: 12 }}></div>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px', marginLeft: -6 }}>
              Ensure Image is a 1:1 dimension for better quality
            </Typography>
            <div style={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              backgroundColor: '#e0e0e0', 
              marginLeft: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              color: '#666'
            }}>
              i
            </div>
          </Box>
        </Box>

        {/* Button Label */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
            Button Label
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              ref={textInputRef}
              type="text"
              value={buttonLabel}
              onChange={(e) => setButtonLabel(e.target.value)}
              placeholder="Get Help"
              maxLength={10}
              className="outline-none focus:outline-none focus:ring-0 border rounded-lg p-3"
              style={{
                fontSize: '14px',
                width: '100%',
                border: '1px solid #00000020'
              }}
            />
            <span style={{ marginLeft: '16px', fontSize: '12px', color: '#666' }}>
              {buttonLabel ? buttonLabel.length : 0}/10
            </span>
          </div>
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
                      onClick={(e) => e.stopPropagation()}
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
                Select Smartlist
              </Typography>
              <button
                className="text-purple underline text-transform-none font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowSmartList();
                }}
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
                  onChange={(e) => {
                    e.stopPropagation();
                    setSelectedSmartList(e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
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

        {/* Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 3 }}>
          <button
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 bg-purple text-white rounded-lg font-medium hover:bg-purple hover:opacity-90 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            onClick={(e) => {
              e.stopPropagation();
              handleCopyEmbed();
            }}
            disabled={loading || (requireForm && !selectedSmartList)}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Copy Embed'}
          </button>
        </Box>

        </div>

        {/* Right Side - Preview */}
        <div style={{ flex: 1, position: 'relative', marginRight: -24, marginTop: -24, marginBottom: -24 }}>
          <div
            style={{
              backgroundImage: 'url(/agencyIcons/bg-embed-agent.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              borderRadius: '0 8px 8px 0',
              height: '100%',
              minHeight: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Close button for preview */}
            <button
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
              }}
              onClick={(e) => {
                console.log('Cross button clicked');
                e.stopPropagation();
                onClose();
              }}
            >
              <X size={16} />
            </button>

            {/* Preview Button */}
            <button
              style={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: 25,
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundImage: logoPreview ? `url(${logoPreview})` : 'url(/thumbOrbSmall.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  marginRight: 8,
                  border: logoPreview ? 'none' : '1px solid #e0e0e0',
                }}
              />
              <span style={{ color: '#333', fontWeight: '500' }}>{buttonLabel}</span>
            </button>
          </div>
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
      </Box>
    </Modal>
  );
};

export default EmbedModal;
