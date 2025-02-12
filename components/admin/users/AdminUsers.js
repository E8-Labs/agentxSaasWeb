'use client'
import Apis from '@/components/apis/Apis'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { CircularProgress } from '@mui/material'
import SelectedUserDetails from './SelectedUserDetails'
import { GetFormattedDateString } from '@/utilities/utility'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [index, setIndex] = useState(0)

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

        if (response.data?.status) {
          setUsers(response.data.data)
        }
      }
    } catch (e) {
      console.log('Error fetching users:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header */}
      <div className="flex flex-row items-center justify-between w-full px-10 mt-4 pb-4 border-b border-gray-200">
        <div style={styles.heading}>Users</div>
      </div>

      {/* Scrollable Table Container */}
      <div className="w-full items-center overflow-x-auto" style={{ scrollbarWidth: "thin", WebkitOverflowScrolling: "touch" }}>
        <div className="min-w-[1400px] w-full items-center">
          {/* Table Headers */}
          <div className="flex items-center justify-center flex-nowrap p-4 text-sm font-semibold text-gray-600">
            <div className="w-[10vw] p-2">Name</div>
            <div className="w-[10vw] p-2">Email</div>
            <div className="w-[6vw] p-2">Leads</div>
            <div className="w-[6vw] p-2">Plan</div>
            <div className="w-[6vw] p-2">Teams</div>
            <div className="w-[6vw] p-2 truncate-cel">Total Spent</div>
            <div className="w-[6vw] p-2 truncate-cel">Mins Used</div>
            <div className="w-[6vw] p-2 truncate-cel">Mins Balance</div>
            <div className="w-[6vw] p-2 truncate-cel">Renewal</div>
            <div className="w-[6vw] p-2 ">Agents</div>
            <div className="w-[8vw] p-2 truncate-cel">Referred by</div>
            <div className="w-[6vw] p-2">Closer</div>
            <div className="w-[6vw] p-2">Source</div>
            <div className="w-[6vw] p-2">Created</div>
          </div>

          {/* Table Data */}
          <div className="flex w-full flex-col items-center h-[72vh] pb-[100px] overflow-y-auto">
            {loading ? (
              <CircularProgress size={30} />
            ) : (
              users.map((item, index) => (
                <div key={index} className="flex flex-nowrap text-sm text-gray-900 items-center justify-start">
                  
                  {/* Name & Profile */}
                  <div className="w-[10vw] flex flex-row items-center gap-3 py-2">
                    {item.thumb_profile_image ? (
                      <Image src={item.thumb_profile_image} height={40} width={40} className="rounded-full" alt="User" />
                    ) : (
                      <div className="w-[40px] h-[40px] rounded-full bg-black flex items-center justify-center text-white">
                        {item.name[0]}
                      </div>
                    )}
                    <div className="truncate-cell">{item.name}</div>
                  </div>

                  {/* Other User Details */}
                  <div className="w-[10vw] p-2 truncate-cell">{item.email}</div>
                  <div className="w-[6vw] p-2 truncate-cell">{item.leads || '0'}</div>
                  <div className="w-[6vw] p-2 truncate-cell">{item.plan || '-'}</div>
                  <div className="w-[6vw] p-2 truncate-cell">{item.team || '-'}</div>
                  <div className="w-[6vw] p-2 truncate-cell">${item.totalSpent || '0.00'}</div>
                  <div className="w-[6vw] p-2 truncate-cell">{item.minutesUsed || '0'} mins</div>
                  <div className="w-[6vw] p-2 truncate-cell">{item.totalSecondsAvailable || '0'} mins</div>
                  <div className="w-[6vw] p-2 truncate-cell">{GetFormattedDateString(item.nextChargeDate)}</div>
                  <div className="w-[6vw] p-2 truncate-cell">{item.agents || '-'}</div>
                  <div className="w-[8vw] p-2 truncate-cell">{item.campaignee || '-'}</div>
                  <div className="w-[6vw] p-2 truncate-cell">{item.closerName || '-'}</div>
                  <div className="w-[6vw] p-2 truncate-cell">{item.uniqueUrl || '-'}</div>
                  <div className="w-[6vw] p-2 truncate-cell">{GetFormattedDateString(item.createdAt)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUsers

const styles = {
  heading: {
    fontWeight: "700",
    fontSize: 25,
  },
  paragraph: {
    fontWeight: "500",
    fontSize: 15,
    whiteSpace: 'nowrap',
  },
}
