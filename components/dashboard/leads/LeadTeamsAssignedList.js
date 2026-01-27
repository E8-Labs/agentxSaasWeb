import React, { useState } from 'react'
import { Users, X } from 'lucide-react'
import Image from 'next/image'
import { Popover } from '@mui/material'

const LeadTeamsAssignedList = ({ users, onAssignClick, onRemoveClick, compactMode = false }) => {
  const [anchorEl, setAnchorEl] = useState(null)

  // Filter duplicates based on user ID and filter out null/undefined users
  const uniqueUsers = users
    .filter((user) => user != null) // Filter out null/undefined users first
    .filter((user, index, self) => {
      const userId = user.id || user.invitedUserId
      return index === self.findIndex((u) => {
        if (!u) return false
        const uId = u.id || u.invitedUserId
        return uId === userId
      })
    })

  const handleOpenMembersList = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMembersList = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  // Default mode: Always show Assign button + horizontal scrolling list (for LeadDetails)
  return (
    <div className="flex flex-row items-center gap-3 w-full">

      {/* Horizontal scrollable list of assigned members */}
      <div className="flex flex-row items-center  overflow-x-auto flex-1 min-w-0" style={{ scrollbarWidth: 'thin' }}>
        {
          uniqueUsers.length > 0 ? (
            uniqueUsers.map((user) => (
              <div
                key={user.id || user.invitedUserId}
                className="flex items-center gap-2 flex-shrink-0 -mr-3"
                onClick={onAssignClick}
              >
                {user?.thumb_profile_image ? (
                  <Image
                    className="rounded-full w-6 h-6 object-cover"
                    src={user.thumb_profile_image}
                    height={50}
                    width={50}
                    alt={user?.name || 'User'}
                    style={{
                      borderRadius: 50,
                    }}
                  />
                ) : (
                  <div className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                {onRemoveClick && (
                  <button
                    className="outline-none flex flex-row items-center gap-2 flex-shrink-0"
                    onClick={(event) => {
                      event.stopPropagation()
                      const userIdToRemove = user.id || user.invitedUserId
                      onRemoveClick(userIdToRemove)
                    }}
                  >
                    <X size={16} color="#6b7280" />
                  </button>
                )}
              </div>
            ))
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
