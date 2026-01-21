'use client'

import { CircularProgress } from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import Apis from '@/components/apis/Apis'

import { AuthToken } from '../plan/AuthDetails'

export default function StripeDetailsCard({
  stripeData,
  fromDashboard = true,
}) {
  const router = useRouter()
  const [loader, setLoader] = useState(false)
  const handleViewStripeAccount = async () => {
    try {
      setLoader(true)

      const path = Apis.createStripeLoginLink

      const response = await axios.post(
        path,
        {
          accountId: stripeData?.id,
        },
        {
          headers: {
            Authorization: 'Bearer ' + AuthToken(),
            'Content-Type': 'application/json',
          },
        },
      )
      if (response) {
        const newWindow = window.open()
        if (newWindow) {
          newWindow.opener = null
          newWindow.location = response.data.url
        } else {
          // fallback if popup blocked
          window.location.href = response.data.url
        }
      }
    } catch (error) {} finally {
      setLoader(false)
    }
  }

  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-[28rem] rounded-2xl shadow-lg bg-white border border-gray-200">
        <div
          className="w-full flex flex-row items-start justify-end rounded-t-2xl h-[200px]"
          style={{
            backgroundImage: "url('/agencyIcons/stripeNotConnected.png')", ///agencyIcons/subAccBg.jpg
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            // borderRadius:'20px'
          }}
        >
          <button className="bg-white text-black p-2 rounded-full px-2 py-1 mt-4 me-4 flex flex-row items-center justify-center">
            <Image
              alt="*"
              src={'/agencyIcons/greenDot.png'}
              height={20}
              width={20}
            />
            <p style={{ fontSize: '12px', fontWeight: '400' }}>Connected</p>
          </button>
        </div>
        <div className="p-4 w-full">
          <div className="space-y-4 text-gray-800 mt-2">
            <div className="flex justify-between">
              <span style={{ fontSize: '16px', fontWeight: '400' }}>
                Company:
              </span>
              <span>{stripeData?.company?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: '16px', fontWeight: '400' }}>
                Business Profile:
              </span>
              <span>{stripeData?.business_profile?.name}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: '16px', fontWeight: '400' }}>
                Country:
              </span>
              <span>US</span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: '16px', fontWeight: '400' }}>
                Email:
              </span>
              <span>{stripeData?.email || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ fontSize: '16px', fontWeight: '400' }}>
                Bank Routing:
              </span>
              <span>****{stripeData?.external_accounts?.data[0]?.last4}</span>
            </div>

            {loader ? (
              <div className="w-full flex justify-center items-center">
                <CircularProgress size={20} />
              </div>
            ) : (
              <button
                className="bg-brand-primary text-white rounded-lg h-[50px] w-full"
                onClick={() => {
                  handleViewStripeAccount()
                }}
              >
                {'View Stripe Account'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
