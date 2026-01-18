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
import { FindVoice } from '@/components/createagent/Voices'
import CloseBtn from '@/components/globalExtras/CloseBtn'

// Function to get voice avatar & name
const getAvatarUrl = (voiceId) => FindVoice(voiceId)?.img || ''
const getVoiceName = (voiceId) => FindVoice(voiceId)?.name || 'Unknown Voice'

export default function UsersWithAgnets({ open, onClose, user, from }) {
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetchUsers()
  }, [open])

  const fetchUsers = async () => {
    try {
      const d = localStorage.getItem('User')

      if (d) {
        const u = JSON.parse(d)

        const token = u.token // Extract JWT token
        //console.log;

        const response = await axios.get(Apis.getUsersWithAgents, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data) {
          if (response.data.status === true) {
            //console.log;
            setUsers(response.data.data)
          } else {
            console.error('Failed to fetch admin users:', response.data.message)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching admin users:', error)
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
        {/* List of Voices */}
        <List sx={{ width: '100%', mt: 2, overflow: 'scroll' }}>
          {users.map((user, index) => (
            <ListItem
              key={user.id}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (user.id) {
                  // Open a new tab with user ID as query param
                  let url = ` admin/users?userId=${user.id}`
                  if (from === 'agency') {
                    url = `/agency/users?userId=${user.id}`
                  }
                  //console.log
                  window.open(url, '_blank')
                }
              }}
            >
              {/* Avatar */}
              <ListItemAvatar>
                <Avatar src={user.thumb_profile_image} alt={user.name} />
              </ListItemAvatar>

              {/* Voice Details */}
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: 'bold' }}>
                    {user.name}
                  </Typography>
                }
                secondary={
                  <Typography sx={{ color: '#666', fontSize: '14px' }}>
                    Agents : {user.agentsCount}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>

      </Box>
    </Modal>
  )
}
