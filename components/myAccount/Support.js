import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import { PersistanceKeys } from '@/constants/Constants'
import { getSupportUrlFor } from '@/utilities/UserUtility'

function Support() {
  const [HoverAIWebinar, setHoverAIWebinar] = useState(false)
  const [hoverConsultation, setHoverConsultation] = useState(false)

  const [userDetails, setUserDetails] = useState(null)

  useEffect(() => {
    const localData = localStorage.getItem('User')
    let AuthToken = null
    if (localData) {
      const UserDetails = JSON.parse(localData)
      // //console.log;
      setUserDetails(UserDetails.user)
      AuthToken = UserDetails.token
    }
  }, [])

  //function to get support
  const getSupport = () => {
    let userData = localStorage.getItem('User')
    if (userData) {
      const D = JSON.parse(userData)
      let url = getSupportUrlFor(D.user)
      if (typeof window !== 'undefined') {
        window.open(url, '_blank')
      }
    }
  }

  const getConsultation = () => {
    let url = PersistanceKeys.GlobalConsultationUrl
    if (typeof window !== 'undefined') {
      window.open(url, '_blank')
    }
  }
  return (
    <div
      className="w-full flex flex-col items-start px-8 py-2"
      style={{
        paddingBottom: '50px',
        height: '100%',
        overflow: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      <div style={{ fontSize: 22, fontWeight: '700', color: '#000' }}>
        Support
      </div>

      <div style={{ fontSize: 12, fontWeight: '500', color: '#00000090' }}>
        {'Account > Support'}
      </div>

      <div className="w-full flex flex-row items-center justify-center">
        <div
          // style={{ flex: 1 }}
          className="w-9/12 border border-[#00000010] rounded-xl p-4 mt-12"
        >
          <div className="w-full">
            <div className="flex flex-row items-center justify-between">
              <div className="outline-none border-none flex flex-row items-center gap-2">
                <Image
                  src={'/agencyIcons/questionMark.jpg'}
                  alt="*"
                  height={20}
                  width={20}
                  style={{ borderRadius: '50%' }}
                />
                <div style={{ fontWeight: '600', fontSize: 16 }}>Get Help</div>
              </div>
            </div>
            <div className="mt-2" style={{ fontWeight: '600', fontSize: 17 }}>
              Need Help Setting Up Your AI Agent?
            </div>
            <div className="flex flex-row items-start gap-2 mt-4">
              <Image
                src={'/agencyIcons/suportPlaceholder.png'}
                alt="*"
                height={64}
                width={64}
              />
              <div style={{ fontWeight: '500', fontSize: 17 }}>
                {`If you're unsure where to start or want expert guidance, we're here to help. You can join our weekly support webinar to get answers to your questions—or let our team handle it and build out your AI for you.`}
              </div>
            </div>
            <div className="w-full flex flex-row items-center gap-4">
              <button
                className="mt-4 p-2 border rounded-lg hover:bg-purple hover:text-white w-[187px] h-[39px] whitespace-nowrap"
                style={{ fontSize: 15, fontWeight: '500' }}
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    let url = PersistanceKeys.ResourceHubUrl
                    //console.log
                    window.open(url, '_blank')
                  }
                }}
              >
                Resource Hub
              </button>
              <button
                className="mt-4 p-2 border rounded-lg hover:bg-purple hover:text-white w-[187px] h-[39px] whitespace-nowrap"
                style={{ fontSize: 15, fontWeight: '500' }}
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    let url = PersistanceKeys.SupportWebinarUrl
                    //console.log
                    window.open(url, '_blank')
                  }
                }}
              >
                Support Webinar
              </button>
              <button
                className="mt-4 p-2 border rounded-lg hover:bg-purple hover:text-white w-[187px] h-[39px] whitespace-nowrap"
                style={{ fontSize: 15, fontWeight: '500' }}
                onClick={() => {
                  let url = PersistanceKeys.GlobalConsultationUrl
                  if (typeof window !== 'undefined') {
                    window.open(url, '_blank')
                  }
                }}
              >
                Hire AI Team
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*<div
        style={{
          alignSelf: "center",
          cursor: "pointer",
        }}
        className="w-8/12 hover:bg-purple border rounded p-4 mt-10 cursor-pointer"
        onMouseEnter={() => {
          setHoverAIWebinar(true);
        }}
        onMouseLeave={() => {
          setHoverAIWebinar(false);
        }}
        onClick={getSupport}
      >
        <div className="flex flex-row gap-2">
          {HoverAIWebinar ? (
            <Image
              src={"/assets/whiteCalenderIcon.svg"}
              alt="calender"
              height={24}
              width={24}
            />
          ) : (
            <Image
              src={"/svgIcons/calenderIcon.svg"}
              alt="calender"
              height={24}
              width={24}
            />
          )}
          <div
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: HoverAIWebinar ? "white" : "#7902DF",
            }}
          >
            Join our weekly AI Webinar
          </div>
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: "400",
            marginTop: "1vh",
            color: HoverAIWebinar ? "white" : "",
          }}
        >
          {`Learn tips and tricks to enhance your AI, perfect your script, and master best practices in our weekly live webinar. Don't miss out on actionable insights to boost your success!`}
        </div>
      </div>

      <div
        className="w-8/12 hover:bg-purple border rounded p-4 mt-10 cursor-pointer"
        style={{ alignSelf: "center", cursor: "pointer" }}
        onMouseEnter={() => {
          setHoverConsultation(true);
        }}
        onMouseLeave={() => {
          setHoverConsultation(false);
        }}
        onClick={getConsultation}
      >
        <div className="flex flex-row gap-2">
          {hoverConsultation ? (
            <Image
              src={"/svgIcons/screenIcon.svg"}
              alt="calender"
              height={24}
              width={24}
            />
          ) : (
            <Image
              src={"/assets/blueScreenIcon.svg"}
              alt="calender"
              height={24}
              width={24}
            />
          )}
          <div
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: hoverConsultation ? "#fff" : "#7902DF",
            }}
          >
           Done with you agent setup
          </div>
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: "400",
            marginTop: "1vh",
            color: hoverConsultation ? "#fff" : "",
          }}
        >
          {
            "Get up and running the right way. We'll work alongside to set up and integrate your CRM, ensuring everything is optimized for success from the start. See results faster and start closing more deals."
          }
        </div>
      </div>*/}
    </div>
  )
}

export default Support
