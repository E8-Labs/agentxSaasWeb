'use client'

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
} from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

import StandardHeader from '@/components/common/StandardHeader'

function PermissionsPage() {
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingPermission, setEditingPermission] = useState(null)
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    category: '',
    userRole: '',
    context: '',
    isActive: true,
  })

  useEffect(() => {
    loadPermissions()
  }, [])

  const loadPermissions = async () => {
    try {
      setLoading(true)
      const localData = localStorage.getItem('User')
      if (!localData) {
        setLoading(false)
        return
      }

      const userData = JSON.parse(localData)
      const token = userData.token

      const response = await axios.get('/api/permissions/definitions', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status && response.data?.data) {
        setPermissions(response.data.data)
      }
    } catch (error) {
      console.error('Error loading permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (permission = null) => {
    if (permission) {
      setEditingPermission(permission)
      setFormData({
        key: permission.key,
        name: permission.name,
        description: permission.description || '',
        category: permission.category,
        userRole: permission.userRole,
        context: permission.context || '',
        isActive: permission.isActive,
      })
    } else {
      setEditingPermission(null)
      setFormData({
        key: '',
        name: '',
        description: '',
        category: '',
        userRole: '',
        context: '',
        isActive: true,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingPermission(null)
    setFormData({
      key: '',
      name: '',
      description: '',
      category: '',
      userRole: '',
      context: '',
      isActive: true,
    })
  }

  const handleSave = async () => {
    try {
      const localData = localStorage.getItem('User')
      if (!localData) {
        alert('User not authenticated')
        return
      }

      const userData = JSON.parse(localData)
      const token = userData.token

      if (editingPermission) {
        // Update existing permission
        const response = await axios.put(
          `/api/permissions/definitions/${editingPermission.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (response.data?.status) {
          await loadPermissions()
          handleCloseDialog()
        }
      } else {
        // Create new permission
        const response = await axios.post(
          '/api/permissions/definitions',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (response.data?.status) {
          await loadPermissions()
          handleCloseDialog()
        }
      }
    } catch (error) {
      console.error('Error saving permission:', error)
      alert(error.response?.data?.message || 'Failed to save permission')
    }
  }

  // Group permissions by category and userRole
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const key = `${perm.category}-${perm.userRole}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(perm)
    return acc
  }, {})

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <div>
      <StandardHeader />
      <Box sx={{ p: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Typography variant="h4">Permission Definitions</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Permission
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage permission definitions that can be assigned to team members
        </Typography>

        {Object.entries(groupedPermissions).map(([key, perms]) => {
          const [category, userRole] = key.split('-')
          return (
            <Card key={key} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {category.replace(/_/g, ' ')} - {userRole}
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Key</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Context</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {perms.map((perm) => (
                        <TableRow key={perm.id}>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {perm.key}
                            </Typography>
                          </TableCell>
                          <TableCell>{perm.name}</TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {perm.description || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>{perm.context || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={perm.isActive ? 'Active' : 'Inactive'}
                              color={perm.isActive ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(perm)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )
        })}
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPermission ? 'Edit Permission' : 'Create Permission'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Permission Key"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              fullWidth
              required
              disabled={!!editingPermission}
              helperText="Unique identifier (e.g., agency.dashboard.view)"
            />
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
            />
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                label="Category"
              >
                <MenuItem value="agency_dashboard">Agency Dashboard</MenuItem>
                <MenuItem value="subaccount_actions">Subaccount Actions</MenuItem>
                <MenuItem value="agentx_dashboard">AgentX Dashboard</MenuItem>
                <MenuItem value="subaccount_dashboard">Subaccount Dashboard</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>User Role</InputLabel>
              <Select
                value={formData.userRole}
                onChange={(e) =>
                  setFormData({ ...formData, userRole: e.target.value })
                }
                label="User Role"
              >
                <MenuItem value="Agency">Agency</MenuItem>
                <MenuItem value="AgentX">AgentX</MenuItem>
                <MenuItem value="AgencySubAccount">AgencySubAccount</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Context</InputLabel>
              <Select
                value={formData.context}
                onChange={(e) =>
                  setFormData({ ...formData, context: e.target.value })
                }
                label="Context"
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="agency">Agency</MenuItem>
                <MenuItem value="subaccount">Subaccount</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingPermission ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default PermissionsPage
