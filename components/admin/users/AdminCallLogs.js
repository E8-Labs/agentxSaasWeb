'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { CircularProgress, duration } from '@mui/material';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer';
import AdminAllCalls from './callLog/AdminAllCalls';
import AdminScheduledCalls from './callLog/AdminScheduledCalls';
import AdminActiveCalls from './callLog/AdminActiveCalls';
import DashboardSlider from '@/components/animations/DashboardSlider';


function AdminCallLogs({ selectedUser }) {

  const [activeTab, setActiveTab] = useState("All Calls");


  return (
    <div className='w-full flex flex-col items-center overflow-hidden'>
      <div className=' w-full flex flex-row justify-between items-center py-4 px-4'
      // style={{ borderBottomWidth: 2, borderBottomColor: '#00000010' }}
      >
        {/* Slider code */}
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0
          }}>
          <DashboardSlider
            needHelp={false} />
        </div>
        <div style={{ fontSize: 24, fontWeight: '600' }}>
          Call Log
        </div>

      </div>

      <div className=" w-full flex mt-4  gap-8 pb-2 mb-4 pl-10">
        {["All Calls", "Call Activities",].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${activeTab === tab ? "text-purple border-b-2 border-purple outline-none" : ""
              }`} style={{ fontSize: 15, fontWeight: '500' }}
          >
            {tab}
          </button>
        ))}

      </div>



      <div className='w-full'>
        {
          activeTab === "All Calls" ? (
            <AdminAllCalls selectedUser={selectedUser} />
          ) : (
            activeTab === "Scheduled" ? (
              <AdminScheduledCalls selectedUser={selectedUser} />
            ) : (
              <AdminActiveCalls selectedUser={selectedUser} />
            )
          )
        }
      </div>


    </div>
  )
}

export default AdminCallLogs;
