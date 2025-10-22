import AdminDashboardCallLogs from '@/components/admin/CallLogs/AdminDashboardCallLogs'
import React from 'react';

const Pauseage = () => {
    return (
        <div className='w-full'>
            <AdminDashboardCallLogs isFromAgency={true} />
        </div>
    )
}

export default Pauseage
