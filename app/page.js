"use client";
import Apis from "@/components/apis/Apis";

import { Box, CircularProgress, Modal } from "@mui/material";
import axios from "axios";
import Image from "next/image";
// import { useRouter } from "next/router";
import React, { Suspense, useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import LoaderAnimation from "@/components/animations/LoaderAnimation";
import SendVerificationCode from "@/components/onboarding/services/AuthVerification/AuthService";
import SnackMessages from "@/components/onboarding/services/AuthVerification/SnackMessages";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "@/components/dashboard/leads/AgentSelectSnackMessage";
import { setCookie } from "@/utilities/cookies";
import { PersistanceKeys } from "@/constants/Constants";
import {
  getLocalLocation,
  getLocation,
} from "@/components/onboarding/services/apisServices/ApiService";
import Link from "next/link";
import LoginComponent from "@/components/auth/LoginComponent";
// import MultiWindow3DScene from "@/components/test/Multiwindow3dScene";
// import { useRouter, useSearchParams } from "next/navigation";

const Page = ({ length = 6, onComplete }) => {

  useEffect(() => {
    const inputs = document.querySelectorAll('input, textarea');

    inputs.forEach((el) => {
      el.setAttribute('autocorrect', 'off');
      el.setAttribute('autocomplete', 'off');
      el.setAttribute('spellcheck', 'false');
      el.setAttribute('autocapitalize', 'off');
      // el.setAttribute('inputmode', 'text'); // optional
    });
  }, []);


  useEffect(() => {
    const handleChunkError = (e) => {
      if (e.message?.includes('ChunkLoadError')) {
        console.error('Chunk load failed. Reloading...');
        window.location.reload();
      }
    };

    window.addEventListener('error', handleChunkError);

    return () => {
      window.removeEventListener('error', handleChunkError);
    };
  }, []);

  return (
    <Suspense>
      {/* <MultiWindow3DScene /> */}
      <LoginComponent onComplete={onComplete} length={length} />
    </Suspense>
  );
};

export default Page;
