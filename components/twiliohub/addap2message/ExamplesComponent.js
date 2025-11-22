import CheckIcon from '@mui/icons-material/Check'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Button, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import React, { useState } from 'react'

const ExamplesComponent = ({ examples }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [copiedIdx, setCopiedIdx] = useState(null)

  const handleOpen = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => {
    setAnchorEl(null)
    // setTimeout(() => setCopiedIdx(null), 500); // Optionally reset after closing
  }

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1500)
    handleClose()
  }

  const styles = {
    regularFont: {
      fontWeight: '400',
      fontSize: 15,
    },
    normalFont: {
      fontWeight: '500',
      fontSize: 15,
    },
    semiBold: {
      fontWeight: '600',
      fontSize: 15,
    },
  }

  return (
    <div>
      <button className="flex flex-row items-center gap-2" onClick={handleOpen}>
        <div
          style={styles.regularFont}
          className="cursor-pointer text-violet-blue underline"
        >
          See Example
        </div>
        {anchorEl ? (
          <CaretUp size={16} className="text-[#5B0EFF]" />
        ) : (
          <CaretDown size={16} className="text-[#5B0EFF]" />
        )}
      </button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left', // Anchor to the left of the button
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left', // Menu appears to the left
        }}
      >
        {examples.map((example) => (
          <MenuItem
            key={example.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              maxWidth: 350,
              whiteSpace: 'normal',
            }}
          >
            <Typography variant="body2" style={{ flex: 1 }}>
              {example.text}
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleCopy(example.text, example.id)}
              aria-label="Copy"
            >
              {copiedIdx === example.id ? (
                <CheckIcon color="success" fontSize="small" />
              ) : (
                <ContentCopyIcon fontSize="small" />
              )}
            </IconButton>
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}

export default ExamplesComponent
