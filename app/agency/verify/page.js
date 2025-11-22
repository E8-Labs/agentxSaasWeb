'use client'

import { CircularProgress } from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { AuthToken } from '@/components/agency/plan/AuthDetails'
import ConnectStripe from '@/components/agency/stripe/ConnectStripe'
import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import { getStripeLink } from '@/components/onboarding/services/apisServices/ApiService'
import { PersistanceKeys } from '@/constants/Constants'

const Page = () => {
  return <ConnectStripe fullScreen={true} />
}

export default Page
