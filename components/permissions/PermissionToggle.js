'use client'

import { Switch, FormControlLabel, Tooltip } from '@mui/material'
import React from 'react'

/**
 * PermissionToggle Component
 * A simple toggle switch for a single permission
 * 
 * @param {Object} props
 * @param {string} props.permissionKey - Permission key
 * @param {boolean} props.checked - Whether permission is granted
 * @param {function} props.onChange - Callback when toggled
 * @param {string} props.label - Label for the toggle
 * @param {string} props.description - Optional description
 */
function PermissionToggle({
  permissionKey,
  checked,
  onChange,
  label,
  description,
}) {
  return (
    <Tooltip title={description || ''} arrow>
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={(e) => onChange(permissionKey, e.target.checked)}
            color="primary"
          />
        }
        label={label}
      />
    </Tooltip>
  )
}

export default PermissionToggle
