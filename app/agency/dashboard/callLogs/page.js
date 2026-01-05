import React from 'react'

import AdminDashboardCallLogs from '@/components/admin/CallLogs/AdminDashboardCallLogs'

const Pauseage = () => {
  return (
    <div className="w-full h-screen flex flex-col">
      <AdminDashboardCallLogs isFromAgency={true} />
    </div>
  )
}

export default Pauseage
