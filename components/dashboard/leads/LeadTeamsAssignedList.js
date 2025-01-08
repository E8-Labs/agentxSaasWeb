import React from "react";

const UserAssignedTeamView = ({ user }) => {
  return (
    <div className="flex items-center space-x-1">
      {/* Avatar */}
      <div className="w-6 h-6 bg-purple rounded-full flex items-center justify-center text-white font-bold text-sm">
        {user.name.charAt(0)}
      </div>

      {/* User Name */}
      <span className="text-gray-700 text-sm">{user.name}</span>
    </div>
  );
};

//   export default UserView;

const LeadTeamsAssignedList = ({ users }) => {
  // Calculate the overflow count
  const maxVisibleUsers = 2;
  const overflowCount = users.length - maxVisibleUsers;

  return (
    <div className="flex space-x-3 overflow-x-auto items-center">
      {/* Render visible users */}
      {users.slice(0, maxVisibleUsers).map((user, index) => (
        <UserAssignedTeamView key={index} user={user} />
      ))}

      {/* Render "+X" if there are overflow users */}
      {overflowCount > 0 && (
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
          +{overflowCount}
        </div>
      )}
    </div>
  );
};

export default LeadTeamsAssignedList;
