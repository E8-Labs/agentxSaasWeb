import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import { X, Plus } from '@phosphor-icons/react';
import axios from 'axios';
import TagsInput from '../leads/TagsInput';
import Image from 'next/image';
import AgentSelectSnackMessage, { SnackbarTypes } from '../leads/AgentSelectSnackMessage';

const NewSmartListModal = ({ 
  open, 
  onClose, 
  agentId,
  onSuccess 
}) => {
  const [sheetName, setSheetName] = useState('');
  const [customFields, setCustomFields] = useState(['', '']);
  const [tagsValue, setTagsValue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    isVisible: false,
    title: '',
    message: '',
    type: SnackbarTypes.Error
  });

  const predefinedFields = ['First Name', 'Last Name', 'Phone'];

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


  const handleSave = async () => {
    if (!sheetName.trim()) {
      showSnackbar('Error', 'Please enter a smart list name', SnackbarTypes.Error);
      return;
    }

    try {
      setLoading(true);
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

      if (response.data) {
        onSuccess(response.data);
        handleClose();
      }
    } catch (error) {
      console.error('Error creating smart list:', error);
      showSnackbar('Error', 'Error creating smart list. Please try again.', SnackbarTypes.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSheetName('');
    setCustomFields(['', '']);
    setTagsValue([]);
    onClose();
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
      onClick={handleClose}
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
            New Smart List
          </Typography>
          <button onClick={handleClose}>
            <Image
              src={"/assets/crossIcon.png"}
              height={40}
              width={40}
              alt="*"
            />
          </button>
        </Box>

        {/* Smart List Name */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
            New Smart List
          </Typography>
          <input
            className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px]"
            style={{ border: "1px solid #00000020" }}
            placeholder="Type name here"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
          />
        </Box>

        {/* Create Fields */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Create Fields
          </Typography>
          
          {/* Predefined Fields */}
          {predefinedFields.map((field, index) => (
            <input
              key={`predefined-${index}`}
              className="outline-none bg-white w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px] mb-3"
              style={{ 
                border: "1px solid #00000020",
                color: "#000"
              }}
              value={field}
              disabled
            />
          ))}

          {/* Custom Fields */}
          {customFields.map((field, index) => (
            <Box key={`custom-${index}`} sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <input
                className="outline-none bg-white border-none focus:outline-none focus:ring-0 rounded-lg h-[50px] mr-1"
                style={{ 
                  border: "1px solid #00000020",
                  width: "95%"
                }}
                placeholder="Custom Field"
                value={field}
                onChange={(e) => handleCustomFieldChange(index, e.target.value)}
              />
              <div style={{ width: "5%" }}>
                <button
                  className="outline-none border-none"
                  onClick={() => handleRemoveCustomField(index)}
                >
                  <Image
                    src={"/assets/blackBgCross.png"}
                    height={20}
                    width={20}
                    alt="*"
                  />
                </button>
              </div>
            </Box>
          ))}

          <button
            className="text-purple underline text-transform-none font-medium hover:bg-purple hover:bg-opacity-10 p-2 rounded"
            onClick={handleAddCustomField}
          >
            <Plus size={16} className="inline mr-1" />
            New Field
          </button>
        </Box>

        {/* Tags */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Tags
          </Typography>
          
          <TagsInput setTags={setTagsValue} tags={tagsValue} />
        </Box>

        {/* Save Button */}
        <button
          className="w-full py-3 px-4 bg-purple text-white rounded-lg font-medium hover:bg-purple hover:opacity-90 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          onClick={handleSave}
          disabled={loading || !sheetName.trim()}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
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

export default NewSmartListModal;
