import React, { useState } from 'react'
import { Users, X } from 'lucide-react'
import Image from 'next/image'
import { Popover } from '@mui/material'

const LeadTeamsAssignedList = ({ users, onAssignClick, compactMode = false }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  
  // Filter duplicates based on user ID
  const uniqueUsers = users.filter((user, index, self) => 
    index === self.findIndex((u) => u.id === user.id)
  )

  const handleOpenMembersList = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMembersList = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  // Compact mode: Google-style (one avatar + badge, no assign button when assigned)
  if (compactMode) {
    // If no members assigned, show Assign Team button
    if (uniqueUsers.length === 0) {
      return (
        <div className="flex flex-row items-center gap-2">
          <Users
            size={16}
            color="#000000"
          />
          <button
            className="outline-none flex flex-row items-center gap-1"
            onClick={onAssignClick}
          >
            <div style={{ fontSize: 15, fontWeight: '500', color: '#000000100' }}>
              Assign Team
            </div>
          </button>
        </div>
      )
    }

    // Get first member
    const firstMember = uniqueUsers[0]
    const remainingCount = uniqueUsers.length - 1

    return (
      <div className="flex flex-row items-center gap-2">
        {/* First member avatar */}
        <div className="flex items-center gap-2">
          {firstMember?.thumb_profile_image ? (
            <Image
              className="rounded-full cursor-pointer"
              src={firstMember.thumb_profile_image}
              height={22}
              width={22}
              alt={firstMember?.name || 'User'}
              onClick={remainingCount > 0 ? handleOpenMembersList : undefined}
              style={{
                borderRadius: 50,
                cursor: remainingCount > 0 ? 'pointer' : 'default',
              }}
            />
          ) : (
            <div 
              className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              onClick={remainingCount > 0 ? handleOpenMembersList : undefined}
              style={{
                cursor: remainingCount > 0 ? 'pointer' : 'default',
              }}
            >
              {firstMember?.name?.charAt(0) || 'U'}
            </div>
          )}
          
          {/* Badge showing count of remaining members */}
          {remainingCount > 0 && (
            <div
              className="h-8 px-2 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={handleOpenMembersList}
            >
              <span className="text-gray-700 text-xs font-medium">
                +{remainingCount}
              </span>
            </div>
          )}
        </div>

        {/* Popover showing all assigned members */}
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleCloseMembersList}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          PaperProps={{
            style: {
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
              borderRadius: '10px',
              padding: '8px',
              minWidth: '200px',
              maxWidth: '300px',
            },
          }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between px-2 py-1 border-b border-gray-200">
              <div style={{ fontSize: 14, fontWeight: '600', color: '#000000' }}>
                Assigned Team Members
              </div>
              <button
                onClick={handleCloseMembersList}
                className="outline-none p-1 hover:bg-gray-100 rounded"
              >
                <X size={16} color="#6b7280" />
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
              {uniqueUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded"
                >
                  {user?.thumb_profile_image ? (
                    <Image
                      className="rounded-full"
                      src={user.thumb_profile_image}
                      height={32}
                      width={32}
                      alt={user?.name || 'User'}
                      style={{
                        borderRadius: 50,
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="text-gray-700 text-sm">
                    {user?.name || 'Unknown'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Popover>
      </div>
    )
  }

  // Default mode: Always show Assign button + horizontal scrolling list (for LeadDetails)
  return (
    <div className="flex flex-row items-center gap-3 w-full">
      {/* Assign Button */}
      <button
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

      {/* Horizontal scrollable list of assigned members */}
      <div className="flex flex-row items-center gap-2 overflow-x-auto flex-1 min-w-0" style={{ scrollbarWidth: 'thin' }}>
        {uniqueUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-2 flex-shrink-0"
          >
            {user?.thumb_profile_image ? (
              <Image
                className="rounded-full"
                src={user.thumb_profile_image}
                height={32}
                width={32}
                alt={user?.name || 'User'}
                style={{
                  borderRadius: 50,
                }}
              />
            ) : (
              <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <span className="text-gray-700 text-sm whitespace-nowrap">
              {user?.name || 'Unknown'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LeadTeamsAssignedList
