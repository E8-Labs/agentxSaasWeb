import { FormControl, MenuItem, Select } from '@mui/material'
import React from 'react'

const SelectStageDropdown = ({
  selectedStage,
  handleStageChange,
  stagesList,
  updateLeadStage,
}) => {
  // //console.log;
  return (
    <FormControl size="fit-content">
      <Select
        value={selectedStage}
        onChange={handleStageChange}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return (
              <div style={{ color: '#aaa' }}>
                {stagesList?.length > 0 ? 'Select' : 'No Stage'}
              </div>
            )
          }
          return selected
        }}
        sx={{
          border: 'none',
          '&:hover': { 
            border: 'none',
            backgroundColor: '#f5f5f5',
          },
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
          '&.Mui-focused': {
            backgroundColor: '#f5f5f5',
          },
          '& .MuiSelect-select': {
            padding: '0 24px 0 8px',
            lineHeight: 1,
            minHeight: 'unset',
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiSelect-icon': {
            right: '4px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#666',
          },
        }}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: '90vh',
              overflow: 'auto',
              scrollbarWidth: 'none',
            },
          },
        }}
      >
        {/* Render stages */}
        {stagesList?.length > 0 &&
          stagesList.map((item, index) => (
            <MenuItem
              value={item.stageTitle}
              key={index}
              sx={{
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  color: '#000000',
                },
                '&.Mui-selected': {
                  backgroundColor: '#f5f5f5',
                  color: '#000000',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                },
              }}
            >
              <button
                className="outline-none border-none w-full text-start"
                onClick={() => updateLeadStage(item)}
              >
                {item.stageTitle}
              </button>
            </MenuItem>
          ))}

        {/* Render fallback when no stages are available */}
        {!stagesList?.length > 0 && (
          <MenuItem className="text-sm text-[#15151560] font-bold">
            No Stage
          </MenuItem>
        )}
      </Select>
    </FormControl>
  )
}

export default SelectStageDropdown
