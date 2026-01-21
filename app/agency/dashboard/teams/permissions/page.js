'use client'

import {
  Box,
  Tabs,
  Tab,
  Typography,
  Container,
  CircularProgress,
} from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

import PermissionManager from '@/components/permissions/PermissionManager'
import SubaccountPermissionManager from '@/components/permissions/SubaccountPermissionManager'
import { PermissionProvider } from '@/contexts/PermissionContext'
import StandardHeader from '@/components/common/StandardHeader'

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`permission-tabpanel-${index}`}
      aria-labelledby={`permission-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

function TeamPermissionsPage() {
  const [tabValue, setTabValue] = useState(0)
  const [selectedTeamMember, setSelectedTeamMember] = useState(null)
  const [subaccounts, setSubaccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState([])

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const localData = localStorage.getItem('User')
      if (!localData) {
        setLoading(false)
        return
      }

      const userData = JSON.parse(localData)
      const token = userData.token

      // Load team members
      const teamResponse = await axios.get('/api/team', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (teamResponse.data?.status && teamResponse.data?.data) {
        const members = teamResponse.data.data.filter(
          (member) => member.status === 'Accepted'
        )
        setTeamMembers(members)
        if (members.length > 0) {
          setSelectedTeamMember(members[0])
        }
      }

      // Load subaccounts (for agency)
      if (userData.user?.userRole === 'Agency') {
        const subaccountsResponse = await axios.get('/api/agency/subaccounts', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (subaccountsResponse.data?.status && subaccountsResponse.data?.data) {
          setSubaccounts(subaccountsResponse.data.data)
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleTeamMemberChange = (memberId) => {
    const member = teamMembers.find((m) => m.invitedUserId === memberId)
    setSelectedTeamMember(member)
  }

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
    <PermissionProvider>
      <StandardHeader />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Team Permissions
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage what your team members can access and do
        </Typography>

        {/* Team Member Selector */}
        {teamMembers.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Team Member
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              {teamMembers.map((member) => (
                <Box
                  key={member.invitedUserId}
                  onClick={() => handleTeamMemberChange(member.invitedUserId)}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor:
                      selectedTeamMember?.invitedUserId === member.invitedUserId
                        ? 'primary.main'
                        : 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    bgcolor:
                      selectedTeamMember?.invitedUserId === member.invitedUserId
                        ? 'action.selected'
                        : 'background.paper',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Typography variant="body1">
                    {member.name || member.email || `Team Member ${member.id}`}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {selectedTeamMember ? (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Agency Dashboard Permissions" />
                <Tab label="Subaccount Action Permissions" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <PermissionManager
                teamMemberId={selectedTeamMember.invitedUserId}
                context="agency"
                onClose={() => {}}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <SubaccountPermissionManager
                teamMemberId={selectedTeamMember.invitedUserId}
                subaccounts={subaccounts}
                onClose={() => {}}
              />
            </TabPanel>
          </>
        ) : (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
            No team members found. Invite team members to manage their permissions.
          </Typography>
        )}
      </Container>
    </PermissionProvider>
  )
}

export default TeamPermissionsPage
