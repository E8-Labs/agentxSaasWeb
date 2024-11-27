'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { CircularProgress, duration } from '@mui/material';
import AllCalls from '@/components/calls/AllCalls';
import SheduledCalls from '@/components/calls/SheduledCalls';
import CallActivities from '@/components/calls/CallActivties';
import Apis from '@/components/apis/Apis';
import axios from 'axios';


function Page() {

  const [activeTab, setActiveTab] = useState("All Calls")
  // const callDetails = [
  //   {
  //     id: 1, name: "Rayna Passaquindici Arcand", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
  //     stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
  //   },
  //   {
  //     id: 2, name: "Gretchen Workman", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
  //     stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
  //   },
  //   {
  //     id: 3, name: "Zain Baptista", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
  //     stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
  //   },
  //   {
  //     id: 4, name: "Jordyn Korsgaard", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
  //     stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
  //   },
  //   {
  //     id: 5, name: "Lincoln Stanton", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
  //     stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
  //   },
  // ];

  const [callDetails, setCallDetails] = useState([]);
  const [initialLoader, setInitialLoader] = useState(false);

  useEffect(() => {
    getCallLogs()
  }, []);

  const getCallLogs = async () => {
    try {
      setInitialLoader(true);
      const ApiPath = Apis.getCallLogs;

      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        console.log("Localdat recieved is :--", Data);
        AuthToken = Data.token;
      }

      console.log("Auth token is:", AuthToken);

      const response = await axios.get(ApiPath, {
        headers: {
          "Authorization": "Bearer " + AuthToken,
          "Content-Type": "application/json"
        }
      });

      if (response) {
        if (response) {
          console.log("response of get call logs api is :", response.data);
          setCallDetails(response.data.data);
        }
      }

    } catch (error) {
      console.error("Error occured in gtting calls log api is:", error);
    } finally {
      setInitialLoader(false);
    }
  }


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
            className={`${activeTab === tab ? "text-purple border-b-2 border-purple" : ""
              }`} style={{ fontSize: 15, fontWeight: '500' }}
          >
            {tab}
          </button>
        ))}

      </div>

      <div className='flex w-full pl-10 flex-row items-start gap-3'>
        <div className="flex w-3/12 items-center border border-gray-300 rounded-lg px-4 max-w-md shadow-sm">
          <input
            type="text"
            placeholder="Search by name, email or phone"
            className="flex-grow outline-none text-gray-600 placeholder-gray-400 border-none"
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
        initialLoader ?
          <div className='w-full flex flex-row items-center justify-center mt-12'>
            <CircularProgress size={35} thickness={2} />
          </div> :
          <div className='w-full'>
            {
              activeTab === "All Calls" ? (
                <AllCalls callDetails={callDetails} />
              ) : (
                activeTab === "Sheduled" ? (
                  <SheduledCalls />
                ) : (
                  <CallActivities />
                )
              )
            }
          </div>
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