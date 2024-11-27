'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { duration } from '@mui/material';
import AllCalls from '@/components/calls/AllCalls';
import SheduledCalls from '@/components/calls/SheduledCalls';
import CallActivities from '@/components/calls/CallActivties';


function Page() {

  const [activeTab, setActiveTab] = useState("All Calls")
  const callDetails = [
    {
      id: 1, name: "Rayna Passaquindici Arcand", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
      stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
    },
    {
      id: 2, name: "Gretchen Workman", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
      stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
    },
    {
      id: 3, name: "Zain Baptista", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
      stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
    },
    {
      id: 4, name: "Jordyn Korsgaard", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
      stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
    },
    {
      id: 5, name: "Lincoln Stanton", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
      stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
    },
  ];
  return (
    <div className='w-full flex flex-col items-center'>
      <div className=' w-full flex flex-row justify-between items-center py-4 px-10'
        style={{ borderBottomWidth: 2, borderBottomColor: '#00000010' }}
      >
        <div style={{ fontSize: 24, fontWeight: '600' }}>
          Call Log
        </div>


      </div>

      <div className=" w-full flex mt-10  gap-8 pb-2 mb-4 pl-10">
        {["All Calls", "Sheduled", "Call Activities"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${activeTab === tab ? "text-purple border-b-2 border-purple" : "text-black-500"
              }`} style={{ fontSize: 15, fontWeight: '500' }}
          >
            {tab}
          </button>
        ))}

      </div>

      <div className='flex w-full pl-10 flex-row items-start gap-3'>
        <div className="flex w-3/12 items-center border border-gray-300 rounded-lg px-4 py-2 max-w-md shadow-sm">
          <input
            type="text"
            placeholder="Search by name, email or phone"
            className="flex-grow outline-none text-gray-600 placeholder-gray-400"
          />
          <img
            src={'/otherAssets/searchIcon.png'}
            alt="Search"
            width={20}
            height={20}
          />
        </div>

        <button>
          <Image src={'/otherAssets/filterBtn.png'}
            height={36}
            width={36}
            alt='Search'
          />
        </button>
      </div>

      {
        activeTab==="All Calls" ? (
          <AllCalls />
        ):(
          activeTab === "Sheduled"?(
            <SheduledCalls />
          ):(
            <CallActivities />
          )
        )
      }

      
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