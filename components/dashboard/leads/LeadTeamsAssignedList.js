import React from 'react'
import { Users } from 'lucide-react'
import Image from 'next/image'

const LeadTeamsAssignedList = ({ users, onAssignClick, maxVisibleUsers = 2 }) => {
  // Filter duplicates based on user ID
  const uniqueUsers = users.filter((user, index, self) => 
    index === self.findIndex((u) => u.id === user.id)
  )

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
