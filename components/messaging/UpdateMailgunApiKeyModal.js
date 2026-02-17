'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material'
import axios from 'axios'
import Apis from '@/components/apis/Apis'
import { AuthToken } from '@/components/agency/plan/AuthDetails'

/**
 * Modal to update the Mailgun API key for a connected domain.
 * Backend validates that the new key belongs to the same Mailgun account (can access the domain).
 */
const UpdateMailgunApiKeyModal = ({ open, onClose, integration, onSuccess }) => {
  const [apiKey, setApiKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setApiKey('')
      setError('')
    }
  }, [open])

  const handleSubmit = async () => {
    if (!apiKey.trim() || !integration?.id) return

    setSaving(true)
    setError('')

    try {
      const token = AuthToken()
      const response = await axios.put(
        `${Apis.updateMailgunIntegration}/${integration.id}`,
        { mailgunApiKey: apiKey.trim() },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      )

      if (response.data?.status) {
        onSuccess?.()
        onClose()
      } else {
        setError(response.data?.message || 'Failed to update API key')
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Failed to update API key. Ensure the key is from the same Mailgun account as this domain.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update API key</DialogTitle>
      <DialogContent>
        <p className="text-sm text-gray-600 mb-3">
          Enter a new Mailgun API key for <strong>{integration?.domain}</strong>. The key must be from the same Mailgun account as the connected domain.
        </p>
        <TextField
          autoFocus
          margin="dense"
          label="Mailgun API key"
          type="password"
          fullWidth
          variant="outlined"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="key-..."
          error={!!error}
          helperText={error}
          disabled={saving}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving || !apiKey.trim()}
          sx={{
            bgcolor: 'hsl(var(--brand-primary))',
            color: '#fff',
            '&:hover': {
              bgcolor: 'hsl(var(--brand-primary) / 0.9)',
              color: '#fff',
            },
          }}
        >
          {saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Update API key'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UpdateMailgunApiKeyModal
