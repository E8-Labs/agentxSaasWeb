"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Link } from '@mui/material';

const ProfileNav = () => {

  const router = useRouter()
  const pathname = usePathname()

  const links = [
    {
      id: 1,
      name: 'Dashboard',
      href: '/dashboard',
      selected: '/assets/selectdDashboardIcon.png',
      uneselected: '/assets/unSelectedDashboardIcon.png'
    },
    {
      id: 2,
      name: 'My Agents',
      href: '/dashboard/myAgentX',
      selected: '/assets/selectedAgentXIcon.png',
      uneselected: '/assets/agentXIcon.png'
    }, {
      id: 3,
      name: 'Leads',
      href: '/dashboard/leads',
      selected: '/assets/selectedLeadsIcon.png',
      uneselected: '/assets/unSelectedLeadsIcon.png'
    }, {
      id: 4,
      name: 'Pipeline',
      href: '/dashboard/pipeline',
      selected: '/assets/SelectedPiplineIcon.png',
      uneselected: '/assets/unSelectedPipelineIcon.png'
    }, {
      id: 5,
      name: 'Call Log',
      href: '/dashboard/callLog',
      selected: '/assets/selectedCallIcon.png',
      uneselected: '/assets/unSelectedCallIcon.png'
    }, {
      id: 6,
      name: 'Integration',
      href: '/dashboard/intigration',
      selected: '/assets/selectedIntegration.png',
      uneselected: '/assets/unSelectedIntegrationIcon.png'
    }, {
      id: 7,
      name: 'Team',
      href: '/dashboard/team',
      selected: '/assets/selectedTeamIcon.png',
      uneselected: '/assets/unSelectedTeamIcon.png'
    },
  ]

  const handleOnClick = (e, href) => {
    e.preventDefault();
    router.push(href);
  }


  return (
    <div>
      <div className='w-full mt-10 flex flex-col items-center'
        style={{ height: '90vh', overflow: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', }}
      >
        <div className='w-full flex flex-row gap-3 items-center justify-center'>
          <Image src={"/assets/agentX.png"} alt='profile'
            height={23} width={98} objectFit='contain'
          />
        </div>


        {/* <div className='w-8/12 flex flex-col mt-20 gap-3' style={{}}>

          <button onClick={handleCreatorClick}>
            <div className='w-full flex flex-row items-center gap-2'>
              {
                actCreator ? (
                  <img src='/assets/selectedDot.png' alt='dot'
                    height={5} width={5}
                  />
                ) : (
                  <div style={{ height: 5, width: 5 }}></div>
                )
              }

              <div style={{ textAlign: 'left', fontSize: 15, color: '#000' }}>
                My CreatorX
              </div>
            </div>
          </button>
          <button onClick={handleAccountClick}>
            <div className='w-full flex flex-row items-center gap-2'>
              {
                actAccount ? (
                  <img src='/assets/selectedDot.png' alt='dot'
                    height={5} width={5}
                  />
                ) : (
                  <div style={{ height: 5, width: 5 }}></div>
                )
              }

              <div style={{ textAlign: 'left', fontSize: 15, color: '#000' }}>
                My Account
              </div>
            </div>
          </button>

          <button onClick={handleCallsClick}>
            <div className='w-full flex flex-row items-center gap-2'>
              {
                actCalls ? (
                  <img src='/assets/selectedDot.png' alt='dot'
                    height={5} width={5}
                  />
                ) : (
                  <div style={{ height: 5, width: 5 }}></div>
                )
              }

              <div style={{ fontSize: 15, color: '#000' }}>
                Calls
              </div>
            </div>
          </button>

          <button onClick={handlePlanClick}>
            <div className='w-full flex flex-row items-center gap-2'>
              {
                actPlans ? (
                  <img src='/assets/selectedDot.png' alt='dot'
                    height={5} width={5}
                  />
                ) : (
                  <div style={{ height: 5, width: 5 }}></div>
                )
              }

              <div style={{ fontSize: 15, color: '#000' }}>
                Plans
              </div>
            </div>
          </button>

          <button onClick={handleSettingClick}>
            <div className='w-full flex flex-row items-center gap-2'>
              {
                actSetting ? (
                  <img src='/assets/selectedDot.png' alt='dot'
                    height={5} width={5}
                  />
                ) : (
                  <div style={{ height: 5, width: 5 }}></div>
                )
              }

              <div style={{ fontSize: 15, color: '#000' }}>
                Setting
              </div>
            </div>
          </button>

          <button onClick={handleFeedbackClick}>
            <div className='w-full flex flex-row items-center gap-2'>
              {
                actFeedBack ? (
                  <img src='/assets/selectedDot.png' alt='dot'
                    height={5} width={5}
                  />
                ) : (
                  <div style={{ height: 5, width: 5 }}></div>
                )
              }

              <div style={{ textAlign: 'left', fontSize: 15, color: '#000', }}>
                Send Feedback
              </div>
            </div>
          </button>
        </div> */}
        <div className='w-full mt-20 flex flex-col items-center gap-3'>
          {
            links.map((item) => (
              <div key={item.id} className='w-10/12 flex flex-col gap-3 '>
                <Link sx={{ cursor: 'pointer', textDecoration: 'none', }} onClick={(e) => handleOnClick(e, item.href)}
                >
                  <div className='w-full flex flex-row gap-2 items-center px-3 py-2 rounded-full'
                    style={{}}
                  >
                    <Image src={pathname === item.href ? item.selected : item.uneselected}
                      height={20} width={20} alt='icon'
                    />
                    <div className={pathname === item.href ? "text-black" : "text-purple"} style={{
                      fontSize: 15, fontWeight: 400, color: pathname === item.href ? "#402FFF" : 'black'
                    }}>
                      {item.name}
                    </div>
                  </div>
                </Link>

              </div>
            ))
          }
        </div>
        <div className='w-full px-6'>
          <button className='text-red text-start mt-4 bg-[#FF4E4E40] px-3 py-1 rounded-3xl' style={{ fontWeight: "600", fontSize: 17 }} onClick={() => {
            localStorage.clear();
            localStorage.removeItem("User");
            router.push("/onboarding");
          }}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileNav;