"use client"
import BusinessInfo from '@/components/twiliohub/customerprofile/BusinessInfo';
import ContactPoint from '@/components/twiliohub/customerprofile/ContactPoint';
import GeneralInfo from '@/components/twiliohub/customerprofile/GeneralInfo';
import React, { useState } from 'react';

const Page = () => {

  const [selectedMenuBar, setSelectedMenuBar] = useState(1);

  const menuBar = [
    {
      id: 1,
      title: "General Information",
    },
    {
      id: 2,
      title: "Business Information",
    },
    {
      id: 3,
      title: "Point of Contact",
    },
  ];


  //handle menu bar navigation
  const handleMenuBarSelect = (item) => {
    setSelectedMenuBar(item.id);
  }

  //show the component according to the selected menu item
  const renderMenuComponent = () => {
    if (selectedMenuBar === 1) {
      return <GeneralInfo />;
    } else if (selectedMenuBar === 2) {
      return <BusinessInfo />;
    } else if (selectedMenuBar === 3) {
      return <ContactPoint />;
    } else {
      return "Select the menu bar item";
    }
  }

  return (
    <div className='h-screen w-full'>
      <div className='w-full flex flex-row items-center justify-between px-8 h-[10vh] border-b'>
        <div style={{ fontWeight: "700", fontSize: 22 }}>
          Twilio Hub
        </div>
        <div>
          Notifications
        </div>
      </div>
      <div className='h-[90vh] flex flex-row items-start'>
        <div className='w-2/12 h-[100%] border-r pt-8 ms-8'>
          <div>
            {
              menuBar.map((item) => {
                return (
                  <button
                    key={item.id}
                    className={`${selectedMenuBar === item.id ? "text-purple" : "text-black"} outline-none border-none mb-14`}
                    style={{
                      fontWeight: "500",
                      fontSize: 15
                    }}
                    onClick={() => {
                      handleMenuBarSelect(item)
                    }}>
                    {item.title}
                  </button>
                )
              })
            }
          </div>
        </div>
        <div className='w-10/12 pt-8 flex flex-row items-start justify-center h-[100%]'>
          {renderMenuComponent()}
        </div>
      </div>
    </div>
  )
}

export default Page
