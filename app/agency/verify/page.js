"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthToken } from '@/components/agency/plan/AuthDetails';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import { PersistanceKeys } from '@/constants/Constants';
import getProfileDetails from '@/components/apis/GetProfile';
import { getStripeLink } from '@/components/onboarding/services/apisServices/ApiService';
import ConnectStripe from '@/components/agency/stripe/ConnectStripe';

const Page = () => {


    return (
        <ConnectStripe />
    )
}

export default Page
