import CloseIcon from '@mui/icons-material/Close'
import {
  Avatar,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Modal,
  Typography,
} from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import CloseBtn from '@/components/globalExtras/CloseBtn'

export default function UsersWithPlan({
  open,
  onClose,
  user,
  planName,
  from,
  selectedAgency,
}) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && planName) {
      fetchUsers()
    }
  }, [open, planName])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const d = localStorage.getItem('User')

      if (d) {
        const u = JSON.parse(d)

        const token = u.token // Extract JWT token

        // Build API path with plan filter
        let apiPath = Apis.getUsers
        const separator = apiPath.includes('?') ? '&' : '?'
        
        // Add plan filter - handle special cases like "Trial"
        if (planName === 'Trial') {
          // For trial users, we need to check isTrial flag
          // The API should handle this, but we'll pass it as plan=Trial
          apiPath += `${separator}plan=${encodeURIComponent(planName)}`
        } else {
          apiPath += `${separator}plan=${encodeURIComponent(planName)}`
        }

        // Add agency filter if from agency context
        if (from === 'agency' && selectedAgency?.id) {
          apiPath += `&userId=${selectedAgency.id}`
        }

        const response = await axios.get(apiPath, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data) {
          if (response.data.status === true) {
            setUsers(response.data.data || [])
          } else {
            console.error('Failed to fetch users:', response.data.message)
            setUsers([])
          }
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      BackdropProps={{
        sx: { backgroundColor: 'rgba(0, 0, 0, 0.05)' }, // 10% black opacity
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          width: '400px',
          height: '90vh',
          maxWidth: '90%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 'none', // ✅ Removed the shadow
        }}
      >
        {/* Close Button */}
        <div className='absolute top-4 right-4'>
          <CloseBtn onClick={onClose} />
        </div>
       

        {/* Modal Title */}
        <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
          {`Users on ${planName}`}
        </Typography>

        {/* Loading State */}
        {loading ? (
          <Typography sx={{ mt: 4, color: '#666' }}>Loading...</Typography>
        ) : (
          <>
            {/* List of Users */}
            <List sx={{ width: '100%', mt: 2, overflow: 'scroll' }}>
              {users.length === 0 ? (
                <Typography sx={{ mt: 4, color: '#666' }}>
                  No users found for this plan
                </Typography>
              ) : (
                users.map((userItem, index) => (
                  <ListItem
                    key={userItem.id || index}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      if (userItem.id) {
                        // Open a new tab with user ID as query param
                        let url = `/admin/users?userId=${userItem.id}`
                        if (from === 'agency') {
                          url = `/agency/users?userId=${userItem.id}`
                        }
                        window.open(url, '_blank')
                      }
                    }}
                  >
                    {/* Avatar */}
                    <ListItemAvatar>
                      <Avatar src={userItem.thumb_profile_image} alt={userItem.name}>
                        {!userItem.thumb_profile_image &&
                          (userItem.name?.[0]?.toUpperCase() || 'U')}
                      </Avatar>
                    </ListItemAvatar>

                    {/* User Details */}
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 'bold' }}>
                          {userItem.name || userItem.email || 'Unknown User'}
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ color: '#666', fontSize: '14px' }}>
                          {userItem.email || 'No email'}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </>
        )}
      </Box>
    </Modal>
  )
}
