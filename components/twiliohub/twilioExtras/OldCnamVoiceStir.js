import React, { useState } from 'react'
import { FormControl, Select, MenuItem, Box, Typography } from '@mui/material'

const OldCnamVoiceStir = ({
  value,
  setValue,
  twilioLocalData
}) => {

  // Use the actual trust products data from props
  const options = twilioLocalData || []

  const handleChange = (event) => {
    setValue(event.target.value)
  }

  return (
    <div>

      <FormControl fullWidth>
        <Select
          fullWidth
          value={value}
          onChange={handleChange}
          displayEmpty
          renderValue={(selected) => {
            if (!selected) {
              return (
                <div style={{ color: "#aaa" }}>
                  Select a trust product
                </div>
              )
            }
            // Find the selected option to display the friendly name
            const selectedOption = options.find(option => option.id === selected)
            return selectedOption ? selectedOption?.friendlyName : selected
          }}
          sx={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            "&:hover": {
              border: "1px solid #e5e7eb",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "& .MuiSelect-select": {
              py: 2,
              px: 2.2,
            },
          }}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: "30vh",
                overflow: "auto",
                scrollbarWidth: "none",
              },
            },
          }}
        >
          {options.map((option, index) => (
            <MenuItem
              key={index}
              value={option.id}
              sx={{
                '&:hover': {
                  backgroundColor: '#7902DF10', // This will use your purple10 color
                  color: '#000000',
                },
                '&.Mui-selected': {
                  backgroundColor: '#7902DF20',
                  color: '#000000',
                  '&:hover': {
                    backgroundColor: '#7902DF10',
                    color: '#000000',
                  }
                }
              }}
            >
              <div className="flex flex-col">
                <div>{option?.friendlyName}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Status: {option?.status}
                </div>
              </div>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

    </div>
  )
}

export default OldCnamVoiceStir
