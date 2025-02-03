'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import AdminUsers from '@/components/admin/users/AdminUsers'

function Page() {

  const manuBar = [
    {
      id: 1,
      name: 'Dashboard',
    }, {
      id: 2,
      name: 'Users',
    },
  ]

  const [selectedManu, setSelectedManu] = useState(manuBar[0])


  return (
    <div className="w-full flex flex-col items-center h-[100svh] overflow-hidden">
      <div
        className="flex flex-row items-center justify-between w-full px-14 mt-6 pb-6"
        style={{ borderBottom: "1px solid #15151510" }}
      >
        <div style={{ fontWeight: "700", fontSize: 25 }}>Management</div>
      </div>


      <div className='flex w-[100vw] flex-row items-center justify-start gap-3 px-10 pt-5'>
        {
          manuBar.map((item) => (
            <button key={item.id} onClick={() => {
              setSelectedManu(item)
            }}
              className={`flex flex-row items-center gap-3 p-2 items-center 
                      ${selectedManu.id == item.id && "border-b-[2px] border-purple"}`
              }>

              <div style={{ fontSize: 16, fontWeight: 500, color: selectedManu.id == item.id ? "#7902df" : '#000' }}>
                {item.name}
              </div>

            </button>
          ))
        }

      </div>


      <div className='w-full'>
        {
          selectedManu.name === "Users" ? (
            <AdminUsers />

          ) : ""
        }
      </div>

    </div>
  )
}

export default Page