'use client'

import { CircularProgress, duration } from '@mui/material'
import axios from 'axios'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import DashboardSlider from '@/components/animations/DashboardSlider'
import Apis from '@/components/apis/Apis'
import AllCalls from '@/components/calls/AllCalls'
import CallActivities from '@/components/calls/CallActivties'
import SheduledCalls from '@/components/calls/SheduledCalls'
import LeadLoading from '@/components/dashboard/leads/LeadLoading'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'
import { PersistanceKeys } from '@/constants/Constants'

function Page() {
  // //console.log;
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('All Activities')

  //nedd help popup
  const [needHelp, setNeedHelp] = useState(false)

  useEffect(() => {
    let localD = localStorage.getItem(PersistanceKeys.LocalStorageUser)
    if (localD) {
      let d = JSON.parse(localD)
      setUser(d)
    }
    // getSheduledCallLogs();
  }, [])

  return (
    <div className="w-full flex flex-col items-center overflow-hidden">
      <div
        className=" w-full flex flex-row justify-between items-center py-4 mt-2 px-10"
        style={{ borderBottomWidth: 2, borderBottomColor: '#00000010' }}
      >
        <div style={{ fontSize: 24, fontWeight: '600' }}>Activity</div>

        <div className="flex flex-row items-center gap-4">
          <NotficationsDrawer user={user} />
          <div
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
            }}
          >
            {/*
              <DashboardSlider
                needHelp={false} />
            */}
          </div>
        </div>
      </div>

      <div className=" w-full flex mt-6  gap-8 pb-2 mb-4 pl-10">
        {['All Activities', 'Campaign Activity'].map(
          (
            tab, //, "Scheduled"
          ) => (
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
          ),
        )}
      </div>

      <div className="w-full">
        {activeTab === 'All Activities' ? (
          <AllCalls user={user} />
        ) : activeTab === 'Scheduled' ? (
          <SheduledCalls user={user} />
        ) : (
          // <LeadLoading />

          <CallActivities user={user} />
        )}
      </div>
    </div>
  )
}

export default Page
