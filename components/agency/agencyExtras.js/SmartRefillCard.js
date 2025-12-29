import { CircularProgress, Switch } from '@mui/material'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import AdminGetProfileDetails from '@/components/admin/AdminGetProfileDetails'
import {
  RemoveSmartRefillApi,
  SmartRefillApi,
} from '@/components/onboarding/extras/SmartRefillapi'
import { isLightColor } from '@/utilities/colorUtils'

const SmartRefillCard = ({
  selectedUser = null,
  isDisabled = false,
  onDisabledClick = null,
  isFreePlan = false,
}) => {
  //smart refill variables
  const [allowSmartRefill, setAllowSmartRefill] = useState(false)
  const [userDataLoader, setUserDataLoader] = useState(false)
  //snack messages variables
  const [successSnack, setSuccessSnack] = useState(null)
  const [errorSnack, setErrorSnack] = useState(null)
  //subaccount detection and text color
  const [isSubaccount, setIsSubaccount] = useState(false)
  const [textColor, setTextColor] = useState('#fff')

  const [userData, setUserData] = useState(null)

  useEffect(() => {
    selectRefillOption()


    const getUserData = async () => {
      let user = null
      if (selectedUser) {
        user = await AdminGetProfileDetails(selectedUser.id)
        console.log('user data is', user)
      }
      setUserData(user)
    }

    getUserData()

    // Check if user is subaccount and calculate text color
    if (typeof window !== 'undefined') {
      try {
        const data = localStorage.getItem('User')
        if (data) {
          const parsedUser = JSON.parse(data)
          const isSub =
            parsedUser?.user?.userRole === 'AgencySubAccount' ||
            userData?.userRole === 'AgencySubAccount'

          console.log('selectedUser', userData)


          console.log('isSub', isSub)
          setIsSubaccount(isSub)

          if (isSub) {
            // Calculate text color based on background
            const brandPrimary = getComputedStyle(document.documentElement)
              .getPropertyValue('--brand-primary')
              .trim()
            const opacity = 0.4
            const isLight = isLightColor(brandPrimary, opacity)
            setTextColor(isLight ? '#000' : '#fff')
          }
        }
      } catch (error) {
        console.log('Error parsing user data:', error)
      }
    }
  }, [])

  const selectRefillOption = async () => {
    if (selectedUser) {
      let data = await AdminGetProfileDetails(selectedUser.id)
      console.log('smart refill ', selectedUser)
      setAllowSmartRefill(data?.smartRefill)
    } else {
      const d = localStorage.getItem('User')
      if (d) {
        const Data = JSON.parse(d)
        console.log('Smart refill is', Data.user.smartRefill)
        setAllowSmartRefill(Data?.user?.smartRefill)
      }
    }
  }

  //function to update profile
  const handleUpdateProfile = async () => {
    try {
      setUserDataLoader(true)
      const response = await SmartRefillApi(selectedUser)
      if (response) {
        setUserDataLoader(false)
        console.log('Response of update profile api is', response)
        if (response.data.status === true) {
          setSuccessSnack(response.data.message)
          setAllowSmartRefill(true)
          window.dispatchEvent(
            new CustomEvent('hidePlanBar', { detail: { update: true } }),
          )
        } else if (response.data.status === false) {
          setErrorSnack(response.data.message)
        }
      }
    } catch (error) {
      console.error('Error occured in api is', error)
      setUserDataLoader(false)
    }
  }

  //function to remove smart refill
  const handleRemoveSmartRefill = async () => {
    try {
      setUserDataLoader(true)
      const response = await RemoveSmartRefillApi(selectedUser)
      if (response) {
        setUserDataLoader(false)
        console.log('Response of remove smart refill api is', response)
        if (response.data.status === true) {
          setSuccessSnack(response.data.message)
          setAllowSmartRefill(false)
        } else if (response.data.status === false) {
          setErrorSnack(response.data.message)
        }
      }
    } catch (error) {
      console.error('Error occured in api is', error)
      setUserDataLoader(false)
    }
  }

  return (
    <div
      className="w-full flex flex-row items-center mt-4 p-2 rounded-3xl"
      style={{
        backgroundImage: isSubaccount
          ? (process.env.NEXT_PUBLIC_GRADIENT_TYPE === 'linear'
            ? `linear-gradient(to bottom left, hsl(var(--brand-primary)) 0%, hsl(var(--brand-primary) / 0.4) 100%)`
            : `radial-gradient(circle at top right, hsl(var(--brand-primary)) 0%, hsl(var(--brand-primary) / 0.4) 100%)`)
          : 'url(/svgIcons/cardBg.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: isSubaccount ? textColor : '#fff',
        alignSelf: 'center',
        marginTop: '2vh',
      }}
    >
      {/*
                userDataLoader ? (
                    <CircularProgress size={20} />
                ) : (
                    
                )
            */}
      <div>
        <Switch
          checked={isFreePlan ? false : allowSmartRefill}
          onChange={() => {
            // If user is on free plan and trying to enable Smart Refill (always show as off for free plans)
            if (isFreePlan && onDisabledClick) {
              onDisabledClick()
              return
            }

            if (isDisabled && onDisabledClick) {
              onDisabledClick()
              return
            }
            setAllowSmartRefill(!allowSmartRefill)
            if (allowSmartRefill === true) {
              handleRemoveSmartRefill()
            } else if (allowSmartRefill === false) {
              handleUpdateProfile()
            }
          }}
          sx={{
            // ✅ Checked: brand color thumb, white track
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: 'hsl(var(--brand-primary))',
              '& + .MuiSwitch-track': {
                backgroundColor: '#ffffff',
                opacity: 1,
              },
            },
            // ✅ Checked + focused: brand color thumb
            '& .MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb': {
              backgroundColor: 'hsl(var(--brand-primary))',
            },

            // ✅ Unchecked: gray thumb, gray track
            '& .MuiSwitch-thumb': {
              backgroundColor: '#9e9e9e',
            },
            '& .MuiSwitch-track': {
              backgroundColor: '#bdbdbd',
              opacity: 1,
            },

            // ✅ Focus ring: brand color
            '& .Mui-focusVisible .MuiSwitch-thumb': {
              outline: '2px solid hsl(var(--brand-primary))',
            },
          }}
        />
      </div>
      <Image
        src={'/otherAssets/smartRefillIcon.png'}
        height={32}
        width={32}
        alt="*"
      />
      <div className="ms-4 text-base font-bold w-2/12" style={{ color: isSubaccount ? textColor : '#fff' }}>Smart Refill</div>
      <div
        className="ms-2 w-8/12 text-[13px] font-normal"
        style={{ color: isSubaccount ? textColor : '#fff' }}
      >
        Refill AI credits when it runs low. Keeps your AI active.
      </div>
    </div>
  )
}

export default SmartRefillCard
