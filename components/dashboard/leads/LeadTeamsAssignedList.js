import React from 'react'

const UserAssignedTeamView = ({ user }) => {
  return (
    <div className="flex items-center space-x-1">
      {/* Avatar */}
      <div className="w-6 h-6 bg-purple rounded-full flex items-center justify-center text-white font-bold text-sm">
        {user?.name?.charAt(0)}
      </div>

      {/* User Name */}
      <span className="text-gray-700 text-sm">{user?.name}</span>
    </div>
  )
}

//   export default UserView;

const LeadTeamsAssignedList = ({ users, maxVisibleUsers = 2 }) => {
  // Calculate the overflow count
  // const maxVisibleUsers = 2;
  const overflowCount = users.length - maxVisibleUsers

  return users.map((user) => (
    <div key={user.id} className="flex space-x-3 overflow-x-auto items-center">
      <div className="flex items-center space-x-1">
        <div className="w-6 h-6 bg-purple rounded-full flex items-center justify-center text-white font-bold text-sm">
          {user?.name?.charAt(0)}
        </div>
        <span className="text-gray-700 text-sm">{user?.name}</span>
      </div>
    </div>
  ))
}

export default LeadTeamsAssignedList
