"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Link } from '@mui/material';

const ProfileNav = () => {

  const router = useRouter();
  const pathname = usePathname();

  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("User");
    if (data) {
      const LocalData = JSON.parse(data);
      setUserDetails(LocalData);
    }
  }, [])

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
      selected: '/assets/selectedPiplineIcon.png',
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
      href: '/dashboard/integration',
      selected: '/assets/selectedIntegration.png',
      uneselected: '/assets/unSelectedIntegrationIcon.png'
    }, {
      id: 7,
      name: 'Team',
      href: '/dashboard/team',
      selected: '/assets/selectedTeamIcon.png',
      uneselected: '/assets/unSelectedTeamIcon.png'
    },
    // {
    //   id: 8,
    //   name: 'My Account',
    //   href: '/dashboard/myAccount',
    //   selected: '/assets/selectedTeamIcon.png',
    //   uneselected: '/assets/unSelectedTeamIcon.png'
    // },
  ]

  const handleOnClick = (e, href) => {
    e.preventDefault();
    router.push(href);
  }


  return (
    <div>
      <div className='w-full pt-10 flex flex-col items-center'
        style={{ height: '90vh', overflow: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', }}
      >
        <div className='w-full flex flex-row gap-3 items-center justify-center'>
          <div className='w-9/12'>
            <Image src={"/assets/agentX.png"} alt='profile'
              height={23} width={98} objectFit='contain'
            />
          </div>
        </div>

        <div className='w-full mt-8 flex flex-col items-center gap-3'>
          {
            links.map((item) => (
              <div key={item.id} className='w-9/12 flex flex-col gap-3 '>
                <Link sx={{ cursor: 'pointer', textDecoration: 'none', }} onClick={(e) => handleOnClick(e, item.href)}
                >
                  <div className='w-full flex flex-row gap-2 items-center py-2 rounded-full'
                    style={{}}
                  >
                    <Image src={pathname === item.href ? item.selected : item.uneselected}
                      height={24} width={24} alt='icon'
                    />
                    <div className={pathname === item.href ? "text-purple" : "text-black"} style={{
                      fontSize: 15, fontWeight: 500, //color: pathname === item.href ? "#402FFF" : 'black'
                    }}>
                      {item.name}
                    </div>
                  </div>
                </Link>

              </div>
            ))
          }
        </div>
      </div>

      <div
        className='w-full flex flex-row items-start justify-center h-[10%]'
        style={{

        }}>
        <button
          onClick={() => { router.push("/dashboard/myAccount") }}
          className='w-9/12 border border-[#00000015] rounded-[10px] flex flex-row items-start gap-3 px-4 py-2 truncate outline-none text-start'
          style={{ textOverflow: "ellipsis" }}>
          <div className='h-[32px] flex-shrink-0 w-[32px] rounded-full bg-black text-white flex flex-row items-center justify-center'>
            {userDetails?.user?.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: "500", color: "" }}>
              {userDetails?.user?.name}
            </div>
            <div className='truncate max-w-full' style={{ fontSize: 15, fontWeight: "500", color: "#15151560", textOverflow: "ellipsis" }}>
              {userDetails?.user?.email}
            </div>
          </div>
        </button>
      </div>
    </div >
  );
}

export default ProfileNav;