'use client'

import { CircularProgress, duration } from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import DashboardSlider from '@/components/animations/DashboardSlider'
import Apis from '@/components/apis/Apis'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'

import AdminActiveCalls from './callLog/AdminActiveCalls'
import AdminAllCalls from './callLog/AdminAllCalls'
import AdminScheduledCalls from './callLog/AdminScheduledCalls'

function AdminCallLogs({ selectedUser }) {
  const [activeTab, setActiveTab] = useState('All Activities')

  return (
    <div className="w-full h-full bg-blue flex flex-col items-center overflow-hidden">
      <div
        className=" w-full flex flex-row justify-between items-center px-4"
        // style={{ borderBottomWidth: 2, borderBottomColor: '#00000010' }}
      >
        {/* Slider code */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
          }}
        >
          <DashboardSlider needHelp={false} selectedUser={selectedUser} />
        </div>
        <div style={{ fontSize: 24, fontWeight: '600' }}>Activity</div>
      </div>

      <div className=" w-full flex mt-4  gap-8 pb-2 mb-4 pl-10">
        {['All Activities', 'Campaign Activity'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${
              activeTab === tab
                ? 'text-purple border-b-2 border-purple outline-none'
                : ''
            }`}
            style={{ fontSize: 15, fontWeight: '500' }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="w-full">
        {activeTab === 'All Activities' ? (
          <AdminAllCalls selectedUser={selectedUser} />
        ) : (
          <AdminActiveCalls selectedUser={selectedUser} />
        )}
      </div>
    </div>
  )
}

export default AdminCallLogs
