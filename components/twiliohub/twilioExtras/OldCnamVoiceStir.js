import React, { useState } from 'react'
import { FormControl, Select, MenuItem, Box, Typography } from '@mui/material'

const OldCnamVoiceStir = ({
  value,
  setValue
}) => {


  // Sample options - you can replace these with your actual data
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4' },
  ]

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
            return selected
          }}
          sx={{
            border: "1px solid #00000020",
            "&:hover": {
              border: "1px solid #00000020",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "& .MuiSelect-select": {
              py: 1,
              px: 2,
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
              value={option.label}
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
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

    </div>
  )
}

export default OldCnamVoiceStir
