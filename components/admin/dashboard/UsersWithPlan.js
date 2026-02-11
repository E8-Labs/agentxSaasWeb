import CallMade from '@mui/icons-material/CallMade'
import {
  Avatar,
  Box,
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
        sx: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          borderRadius: '16px',
          border: '1px solid #EDEDED',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.12)',
          p: 0,
          width: '500px',
          height: '600px',
          maxWidth: '90%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        {/* Popup header: title + close */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            px: 2,
            py: 1.5,
            flexShrink: 0,
          }}
        >
          <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 600 }}>
            {`Users on ${planName}`}
          </Typography>
          <CloseBtn
            onClick={onClose}
            className="!w-8 !h-8 !bg-transparent hover:!bg-black/5"
          />
        </Box>

        {/* Loading State */}
        {loading ? (
          <Typography sx={{ mt: 4, color: '#666', textAlign: 'center' }}>
            Loading...
          </Typography>
        ) : (
          <>
            {/* List of Users */}
            <List
              sx={{
                width: '100%',
                flex: 1,
                overflow: 'auto',
                scrollbarWidth: 'none',
                py: 0,
                px: 2,
              }}
            >
              {users.length === 0 ? (
                <Typography sx={{ mt: 4, color: '#666', textAlign: 'center' }}>
                  No users found for this plan
                </Typography>
              ) : (
                users.map((userItem, index) => (
                  <ListItem
                    key={userItem.id || index}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      if (userItem.id) {
                        let url = `/admin/users?userId=${userItem.id}`
                        if (from === 'agency') {
                          url = `/agency/users?userId=${userItem.id}`
                        }
                        window.open(url, '_blank')
                      }
                    }}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      },
                      '&:hover .list-item-hover-icon': {
                        opacity: 1,
                      },
                    }}
                  >
                    {/* Avatar */}
                    <ListItemAvatar>
                      <Avatar
                        src={userItem.thumb_profile_image}
                        alt={userItem.name}
                        sx={{ bgcolor: 'rgba(0, 0, 0, 0.8)' }}
                      >
                        {!userItem.thumb_profile_image &&
                          (userItem.name?.[0]?.toUpperCase() || 'U')}
                      </Avatar>
                    </ListItemAvatar>

                    {/* User Details */}
                    <ListItemText
                      primary={
                        <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
                          {userItem.name || userItem.email || 'Unknown User'}
                        </Typography>
                      }
                      secondary={
                        <Typography sx={{ color: '#666', fontSize: '14px' }}>
                          {userItem.email || 'No email'}
                        </Typography>
                      }
                    />
                    <CallMade
                      className="list-item-hover-icon"
                      sx={{
                        fontSize: 16,
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        ml: 'auto',
                        flexShrink: 0,
                      }}
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
