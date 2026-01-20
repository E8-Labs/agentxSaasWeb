'use client'

import { CircularProgress } from '@mui/material'
import React, { Suspense, useEffect, useState } from 'react'

import SubAccountMyAccount from '@/components/dashboard/subaccount/myAccount/SubAccountMyAccount'
import MyAccount from '@/components/myAccount/MyAccount'

function Page() {
  const [role, setRole] = useState('')
  const [roleLoader, setRoleLoader] = useState(true)

  useEffect(() => {
    const checkUserType = () => {
      const data = localStorage.getItem('User')
      if (data) {
        let u = JSON.parse(data)

        setRole(u.user.userRole)
        setRoleLoader(false)
      }
    }

    checkUserType()
  }, [])

  return (
    <Suspense>
      {roleLoader ? (
        <div className="h-screen w-full flex flex-row items-center justify-center">
          <CircularProgress size={45} />
        </div>
      ) : (
        <div>
          {role && role === 'AgencySubAccount' ? (
            <SubAccountMyAccount />
          ) : (
            <MyAccount />
          )}
        </div>
      )}
    </Suspense>
  )
}

export default Page
