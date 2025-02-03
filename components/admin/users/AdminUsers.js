'use client'
import Apis from '@/components/apis/Apis'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { CircularProgress, Menu, MenuItem } from '@mui/material'
import SelectedUserDetails from './SelectedUserDetails'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null) // For menu position
  const [selectedUser, setSelectedUser] = useState(null) // To know which user is selected for action

  const [showUserDetails, setShowUserDetails] = useState(false)

  useEffect(() => {
    getUsersList()
  }, [])

  const getUsersList = async () => {
    try {
      setLoading(true)
      const data = localStorage.getItem("User")
      if (data) {
        let u = JSON.parse(data)
        let apiPath = Apis.getUsers;

        const response = await axios.get(apiPath, {
          headers: {
            "Authorization": 'Bearer ' + u.token
          }
        })

        if (response.data) {
          if (response.data.status === true) {
            console.log('users list is ', response.data.data)
            setUsers(response.data.data)
          } else {
            console.log('users list message is', response.data.message)
          }
        }
      }
    } catch (e) {
      console.log('error in get users list api is', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className="flex flex-row items-center justify-between w-full px-10 mt-4 pb-4"
        style={{ borderBottom: "1px solid #15151510" }}
      >
        <div style={{ fontWeight: "700", fontSize: 25 }}>Users</div>
      </div>
      <div className="flex flex-row justify-start items-center gap-4 p-6 w-full">
        <div className="flex flex-row items-center gap-1 w-[22vw] flex-shrink-0 border rounded pe-2">
          <input
            style={styles.paragraph}
            className="outline-none border-none w-full bg-transparent focus:outline-none focus:ring-0"
            placeholder="Search by name, email or phone"
            value=""
            onChange={(e) => {
              // Handle search input
            }}
          />
          <button className="outline-none border-none">
            <Image
              src={"/assets/searchIcon.png"}
              height={24}
              width={24}
              alt="*"
            />
          </button>
        </div>
        <button className="outline-none flex-shrink-0">
          <Image src={"/assets/filterIcon.png"} height={16} width={16} alt="*" />
        </button>
      </div>
      <div className="w-full p-6 flex flex-row items-center" style={{ ...styles.paragraph, color: "#00000060", fontWeight: "600" }}>
        <div className="w-3/12 p-2 ">Name</div>
        <div className="w-3/12 p-2 ">Email</div>
        <div className="w-2/12 p-2 ">Phone Number</div>
        <div className="w-2/12 p-2 ">Plan</div>
        <div className="w-2/12 p-2 ">More</div>
      </div>

      <div className='w-[95%] flex flex-col items-center h-[55vh] pb-[100px] overflow-auto' style={{scrollbarWidth:"none"}}>
        {
          loading ? (
            <CircularProgress size={30} />
          ) :
            users.map((item, index) => (
              <div key={index} className="w-full flex flex-row items-center" style={{ ...styles.paragraph, color: "#000000" }}>
                <button className="w-3/12 flex flex-row items-center gap-3 p-2"
                  onClick={() => {
                    console.log('selected item', item)
                    setSelectedUser(item)
                    // setShowUserDetails(true)
                  }}
                >
                  {item.thumb_profile_image ? (
                    <Image
                      src={item.thumb_profile_image}
                      height={40}
                      width={40}
                      style={{ borderRadius: "50%" }}
                      alt="*"
                    />
                  ) : (
                    <div
                      style={{ color: "#fff" }}
                      className="w-[40px] h-[40px] rounded-[50%] bg-black flex items-center justify-center"
                    >
                      {item.name[0]}
                    </div>
                  )}
                  <div>{item.name}</div>
                </button>
                <div className="w-3/12 p-2">{item.email}</div>
                <div className="w-2/12 p-2">{item.phone}</div>
                <div className="w-2/12 p-2">{item.plan?.type}</div>
                <button
                  className="w-2/12 p-2"
                  onClick={(e) => handleMenuOpen(e, item)}
                >
                  <Image src={'/svgIcons/threeDotsIcon.svg'}
                    height={24}
                    width={24}
                    alt='*'
                  />
                </button>
              </div>
            ))
        }

        { selectedUser &&
          <SelectedUserDetails open={selectedUser?true:false} close={() => {
            setSelectedUser(null)
          }} selectedUser={selectedUser} />

        }
      </div>
    </div>
  )
}

export default AdminUsers

const styles = {
  heading: {
    fontWeight: "700",
    fontSize: 17,
  },
  paragraph: {
    fontWeight: "500",
    fontSize: 15,
  },
}
