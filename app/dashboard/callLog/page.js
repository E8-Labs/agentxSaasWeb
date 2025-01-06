'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { CircularProgress, duration } from '@mui/material';
import AllCalls from '@/components/calls/AllCalls';
import SheduledCalls from '@/components/calls/SheduledCalls';
import CallActivities from '@/components/calls/CallActivties';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer';


function Page() {

  const [activeTab, setActiveTab] = useState("All Calls");


  return (
    <div className='w-full flex flex-col items-center'>
      <div className=' w-full flex flex-row justify-between items-center py-4 px-10'
        style={{ borderBottomWidth: 2, borderBottomColor: '#00000010' }}
      >
        <div style={{ fontSize: 24, fontWeight: '600' }}>
          Call Log
        </div>

        <div>
          <NotficationsDrawer />
        </div>


      </div>

      <div className=" w-full flex mt-10  gap-8 pb-2 mb-4 pl-10">
        {["All Calls", "Call Activities", "Scheduled"].map((tab) => (
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
            <AllCalls />
          ) : (
            activeTab === "Scheduled" ? (
              <SheduledCalls />
            ) : (
              <CallActivities />
            )
          )
        }
      </div>


    </div>
  )
}

export default Page


const styles = {
  text: {
    fontSize: 12,
    color: '#00000090'
  },
  text2: {
    textAlignLast: 'left',
    fontSize: 15,
    color: '#000000',
    fontWeight: 500,
    whiteSpace: 'nowrap',  // Prevent text from wrapping
    overflow: 'hidden',    // Hide overflow text
    textOverflow: 'ellipsis'  // Add ellipsis for overflow text
  }
}