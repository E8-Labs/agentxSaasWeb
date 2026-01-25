import React, { useState } from 'react'
import { Users, X } from 'lucide-react'
import Image from 'next/image'
import { Popover } from '@mui/material'

const LeadTeamsAssignedList = ({ users, onAssignClick, onRemoveClick, compactMode = false }) => {
  const [anchorEl, setAnchorEl] = useState(null)

  // Filter duplicates based on user ID
  const uniqueUsers = users ? (users.length > 0 ? users.filter((user, index, self) =>
    index === self.findIndex((u) => u?.id === user?.id)
  ) : []) : []

  const handleOpenMembersList = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMembersList = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  console.log('uniqueUsers', uniqueUsers)

  // Default mode: Always show Assign button + horizontal scrolling list (for LeadDetails)
  return (
    <div className="flex flex-row items-center gap-3 w-full">

      {/* Horizontal scrollable list of assigned members */}
      <div className="flex flex-row items-center gap-2 overflow-x-auto flex-1 min-w-0" style={{ scrollbarWidth: 'thin' }}>
        {uniqueUsers?.length > 0 ? (
          <div className="flex items-center">
            {uniqueUsers
              .slice(0, 3) // Show max 3 avatars
              .map((user, index) => (
                <div
                  key={user?.id || index}
                  className={`relative ${index >= 0 ? '-mr-2' : ''}`}
                  style={{ zIndex: uniqueUsers?.length - index }}
                >
                  {user?.thumb_profile_image ? (
                    <img
                      src={user?.thumb_profile_image}
                      alt={user?.label}
                      className="w-5 h-5 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-semibold border-2 border-white">
                      {user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
              ))}
            {uniqueUsers?.length > 3 && (
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-semibold border-2 border-white">
                +{uniqueUsers?.length - 3}
              </div>
            )}
          </div>

        ) : (
          !compactMode && (
            < button
              className="outline-none flex flex-row items-center gap-2 flex-shrink-0"
              onClick={onAssignClick}
            >
              <Users
                size={16}
                color="#000000"
              />
              <div style={{ fontSize: 15, fontWeight: '500', color: '#000000100' }}>
                Assign Team
              </div>
            </button>
          ))
        }


      </div>
    </div >
  )
}

export default LeadTeamsAssignedList
