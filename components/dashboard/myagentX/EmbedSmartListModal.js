import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Divider,
  Modal,
  Fade,
} from '@mui/material';
import { X, Plus, Upload } from '@phosphor-icons/react';
import axios from 'axios';
import TagsInput from '../leads/TagsInput';
import Image from 'next/image';
import AgentSelectSnackMessage, { SnackbarTypes } from '../leads/AgentSelectSnackMessage';
import CloseBtn from '@/components/globalExtras/CloseBtn';

const EmbedSmartListModal = ({
  open,
  onClose,
  agentName,
  agentId,
  onSuccess
}) => {


  const textInputRef = useRef(null);

  const [sheetName, setSheetName] = useState('');
  const [customFields, setCustomFields] = useState(['', '']);
  const [tagsValue, setTagsValue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buttonLabel, setButtonLabel] = useState('Get Help');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);
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

  const predefinedFields = ['First Name', 'Last Name', 'Phone'];

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

  const handleAddCustomField = () => {
    setCustomFields([...customFields, '']);
  };

  const handleRemoveCustomField = (index) => {
    if (customFields.length > 1) {
      const newFields = customFields.filter((_, i) => i !== index);
      setCustomFields(newFields);
    }
  };

  const handleCustomFieldChange = (index, value) => {
    const newFields = [...customFields];
    newFields[index] = value;
    setCustomFields(newFields);
  };

  const updateSupportButton = async () => {
    console.log('🔧 EMBED-SMARTLIST - Updating agent support button settings...');

    try {
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
        console.log('🔧 EMBED-SMARTLIST - Adding logo file to update');
      }
      formData.append('supportButtonText', buttonLabel);
      formData.append('smartListEnabled', 'true');

      console.log('🔧 EMBED-SMARTLIST - Support button settings:', {
        agentId,
        buttonLabel,
        smartListEnabled: true,
        hasLogo: !!logoFile
      });

      const response = await axios.post(
        'https://apimyagentx.com/agentxtest/api/agent/updateAgentSupportButton',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${AuthToken}`
          }
        }
      );

      if (response.data?.status === true) {
        console.log('🔧 EMBED-SMARTLIST - Support button updated successfully');
        return true;
      } else {
        throw new Error(response.data?.message || 'Failed to update support button');
      }
    } catch (error) {
      console.error('🔧 EMBED-SMARTLIST - Error updating support button:', error);
      throw error;
    }
  };

  const createSmartList = async () => {
    console.log('🔧 EMBED-SMARTLIST - Creating new smart list...');

    try {
      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      // Combine predefined fields with custom fields, excluding default columns
      const defaultColumns = ['First name', 'Last name', 'Email', 'Phone'];
      const filteredPredefinedFields = predefinedFields.filter(field => !defaultColumns.includes(field));
      const allFields = [...filteredPredefinedFields];
      customFields.forEach(field => {
        if (field.trim()) {
          allFields.push(field.trim());
        }
      });

      // Use tags from TagsInput component
      const filteredTags = tagsValue || [];

      const payload = {
        sheetName: sheetName.trim(),
        columns: allFields,
        tags: filteredTags,
        agentId: agentId
      };

      console.log('🔧 EMBED-SMARTLIST - Creating smart list with payload:', payload);

      const response = await axios.post(
        'https://apimyagentx.com/agentxtest/api/leads/addSmartList',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AuthToken}`
          }
        }
      );

      if (response.data?.status === true) {
        console.log('🔧 EMBED-SMARTLIST - Smart list created successfully');
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Failed to create smart list');
      }
    } catch (error) {
      console.error('🔧 EMBED-SMARTLIST - Error creating smart list:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!sheetName.trim()) {
      showSnackbar('Error', 'Please enter a smart list name', SnackbarTypes.Error);
      return;
    }

    try {
      setLoading(true);
      console.log('🔧 EMBED-SMARTLIST - Starting save process...');

      // Step 1: Update support button settings first (including logo and button text)
      await updateSupportButton();

      // Step 2: Create the smart list
      const smartListResponse = await createSmartList();

      // Step 3: Call success callback and close modal
      if (smartListResponse) {
        onSuccess(smartListResponse);
        handleClose();
      }

    } catch (error) {
      console.error('🔧 EMBED-SMARTLIST - Error in save process:', error);
      showSnackbar('Error', error.message || 'Error saving settings. Please try again.', SnackbarTypes.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSheetName('');
    setCustomFields(['', '']);
    setTagsValue([]);
    setButtonLabel('Get Help');
    setLogoFile(null);
    setLogoPreview(null);
    onClose();
  };

  const styles = {
    modalsStyle: {
      height: "auto",
      bgcolor: "transparent",
      mx: "auto",
      my: "50vh",
      transform: "translateY(-50%)",
      borderRadius: 2,
      border: "none",
      outline: "none",
    },
  };

  // Add CSS for hiding scrollbars
  const scrollbarHideStyle = `
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
  `;

  if (!open) return null;

  return (
    <>
      <style>{scrollbarHideStyle}</style>
      <Modal
        open={open}
        onClose={handleClose}
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
                overflow: 'hidden',
              }}
            >
              {/* Left Side - Configuration */}
              <div
                className="scrollbar-hide"
                style={{
                  flex: 1,
                  paddingRight: 24,
                  overflowY: 'auto',
                  maxHeight: '90vh',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
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
                      className="text-black px-3 py-1 border-lg border text-transform-none font-medium flex items-center hover:text-white hover:bg-purple transition-all duration-300 rounded-lg p-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Image
                        className="transition-all duration-200 hover:hidden"
                        src={"/otherAssets/uploadIcon.png"}
                        height={24}
                        width={24}
                        alt="Upload"
                      />
                      <Image
                        className="transition-all duration-200 hidden hover:inline"
                        src={"/otherAssets/uploadIconPurple.png"}
                        height={24}
                        width={24}
                        alt="Upload Hover"
                      />
                      <span className="ml-1">Change Logo</span>
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
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px', marginLeft: -6, flexDirection: 'row', alignItems: 'center', display: 'flex' }}>
                      <Image src={"/assets/infoIcon.png"} height={12} width={12} alt="*" className="mr-1" />
                      Ensure Image is a 1:1 dimension for better quality
                    </Typography>
                  </Box>
                </Box>

                {/* Button Label */}
                <Box sx={{ mb: 3 }}>
                  <div className="flex flex-row justify-between items-center mb-1">
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      Button Label
                    </Typography>
                    <div style={{ marginLeft: '16px', fontSize: '12px', color: '#666' }}>
                      {buttonLabel ? buttonLabel.length : 0}/10
                    </div>
                  </div>
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
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    This prompts users to fill out a form before they engage in a conversation with your AI.
                  </Typography>
                </Box>

                {/* Smart List Section */}
                <div className="mb-4">
                  <div style={{ fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 8 }}>
                    List Name
                  </div>
                  <input
                    className="outline-none focus:outline-none focus:ring-0 border rounded w-full"
                    style={{
                      border: "1px solid #E5E7EB",
                      fontSize: '14px',
                      padding: '12px',
                      backgroundColor: '#fff'
                    }}
                    placeholder="Type name here"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                  />
                </div>

                {/* Create Fields */}
                <div className="mb-6">
                  <div style={{ fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 12 }}>
                    Create Fields
                  </div>

                  {/* Predefined Fields */}
                  {predefinedFields.map((field, index) => (
                    <input
                      key={`predefined-${index}`}
                      className="outline-none focus:outline-none focus:ring-0 border rounded w-full mb-3"
                      style={{
                        border: "1px solid #E5E7EB",
                        color: "#666",
                        fontSize: '14px',
                        backgroundColor: '#F9FAFB',
                        padding: '12px'
                      }}
                      value={field}
                      disabled
                    />
                  ))}

                  {/* Custom Fields */}
                  {customFields.map((field, index) => (
                    <div key={`custom-${index}`} className="flex items-center mb-3 gap-3">
                      <input
                        className="outline-none focus:outline-none focus:ring-0 border rounded flex-1"
                        style={{
                          border: "1px solid #E5E7EB",
                          fontSize: '14px',
                          padding: '12px'
                        }}
                        placeholder="Custom Field"
                        value={field}
                        onChange={(e) => handleCustomFieldChange(index, e.target.value)}
                      />
                      <button
                        className="outline-none border-none p-1 rounded-full hover:bg-gray-100 w-8 h-8 flex items-center justify-center"
                        onClick={() => handleRemoveCustomField(index)}
                      >
                        <X size={16} color="#666" />
                      </button>
                    </div>
                  ))}

                  <button
                    className="flex items-center text-purple font-medium hover:bg-purple hover:bg-opacity-5 p-2 -ml-2 rounded"
                    onClick={handleAddCustomField}
                    style={{ fontSize: 14 }}
                  >
                    <Plus size={16} className="mr-1" />
                    New Field
                  </button>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <div style={{ fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 12 }}>
                    Tags
                  </div>
                  <TagsInput setTags={setTagsValue} tags={tagsValue} />
                </div>

                {/* Save Button */}
                <button
                  className="w-full py-3 px-4 bg-purple text-white rounded-lg font-medium hover:bg-purple hover:opacity-90 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                  onClick={handleSave}
                  disabled={loading || !sheetName.trim()}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
                </button>

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
                  <div style={{ position: 'absolute', top: 16, right: 16 }}>
                    <CloseBtn
                      onClick={(e) => {
                        console.log('Cross button clicked');
                        e.stopPropagation();
                        handleClose();
                      }}
                      showWhiteCross={true}
                    />
                  </div>

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
    </>
  );
};

export default EmbedSmartListModal;
