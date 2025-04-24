"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  CircularProgress,
  Fade,
  Link,
  Modal,
  Snackbar,
  Typography,
} from "@mui/material";
import getProfileDetails from "@/components/apis/GetProfile";
import Apis from "@/components/apis/Apis";
import axios from "axios";
// const FacebookPixel = dynamic(() => import("../utils/facebookPixel.js"), {
//   ssr: false,
// });

// import { initFacebookPixel } from "@/utilities/facebookPixel";

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "../leads/AgentSelectSnackMessage";
import { requestToken } from "@/components/firbase";
import { initializeApp } from "firebase/app";
import { UpdateProfile } from "@/components/apis/UpdateProfile";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import AddCardDetails from "@/components/createagent/addpayment/AddCardDetails";
import { PersistanceKeys, userType } from "@/constants/Constants";
import { logout } from "@/utilities/UserUtility";

let stripePublickKey =
  process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
    ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
    : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripePublickKey);

const AgencyNavBar = () => {
  // const [user, setUser] = useState(null)

  const router = useRouter();
  const pathname = usePathname();

  const [showPlansPopup, setShowPlansPopup] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [subscribePlanLoader, setSubscribePlanLoader] = useState(false);

  const [togglePlan, setTogglePlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  //snack messages variables
  const [successSnack, setSuccessSnack] = useState(null);
  const [showsuccessSnack, setShowSuccessSnack] = useState(null);
  const [errorSnack, setErrorSnack] = useState(null);
  const [showerrorSnack, setShowErrorSnack] = useState(null);

  const [userType, setUserType] = useState("");

  const [addPaymentPopUp, setAddPaymentPopup] = useState(false);
  const [canAcceptPaymentsAgencyccount, setCanAcceptPaymentsAgencyccount] = useState(false);


  //useeffect that redirect the user back to the main screen for mobile view
  useEffect(() => {
    let windowWidth = 1000;
    if (typeof window !== "undefined") {
      windowWidth = window.innerWidth;
    }
    if (windowWidth < 640) {
      router.push("/createagent/desktop");
    } else {
      const d = localStorage.getItem("User");
    }
  }, []);

  const getUserProfile = async () => {
    const data = localStorage.getItem("User");
    if (data) {
      const LocalData = JSON.parse(data);
      const agencyProfile = await getProfileDetails()
      if (agencyProfile) {
        console.log("Agency profile details are", agencyProfile);
        const agencyProfileData = agencyProfile.data.data
        if (!agencyProfileData.plan) {
          const d = {
            subPlan: false
          }
          localStorage.setItem(PersistanceKeys.LocalStorageSubPlan, JSON.stringify(d));
          router.push("/agency/onboarding");
        } else if (agencyProfileData.plan && agencyProfileData.canAcceptPaymentsAgencyccount === false) {
          setCanAcceptPaymentsAgencyccount(true);
        }
      } else {
        console.log("No profile detail found yet");
      }
      console.log('LocalData.user.profile_status', LocalData.user.profile_status)
      if (LocalData.user.profile_status === "paused") {
        setErrorSnack("Your account has been frozen.")
        logout()
        router.push("/");
        return
      }
      setUserDetails(LocalData);
      if (LocalData.user.plan == null) {
        // user haven't subscribed to any plan
        // setPlans(plansWitTrial);
      }
    }
  };

  useEffect(() => {
    getUserProfile();
  }, []);

  const agencyLinks = [
    {
      id: 1,
      name: "Dashboard",
      href: "/agency/dashboard",
      selected: "/svgIcons/selectdDashboardIcon.svg",
      uneselected: "/svgIcons/unSelectedDashboardIcon.svg",
    }, {
      id: 2,
      name: "Sub Account",
      href: "/agency/dashboard/subAccounts",
      selected: "/svgIcons/selectedSubAccountIcon.svg",
      uneselected: "/svgIcons/unSelectedSubAccountIcon.svg",
    }, {
      id: 3,
      name: "Plans",
      href: "/agency/dashboard/plans",
      selected: "/svgIcons/selectedPlansIcon.svg",
      uneselected: "/svgIcons/unSelectedPlansIcon.svg",
    },
  ];


  const styles = {
    paymentModal: {
      // height: "auto",
      bgcolor: "transparent",
      // p: 2,
      mx: "auto",
      // my: "50vh",
      // transform: "translateY(-50%)",
      borderRadius: 2,
      border: "none",
      outline: "none",
      height: "100svh",
    },
    cardStyles: {
      fontSize: "14",
      fontWeight: "500",
      border: "1px solid #00000020",
    },
    pricingBox: {
      position: "relative",
      // padding: '10px',
      borderRadius: "10px",
      // backgroundColor: '#f9f9ff',
      display: "inline-block",
      width: "100%",
    },
    triangleLabel: {
      position: "absolute",
      top: "0",
      right: "0",
      width: "0",
      height: "0",
      borderTop: "50px solid #7902DF", // Increased height again for more padding
      borderLeft: "50px solid transparent",
    },
    labelText: {
      position: "absolute",
      top: "10px", // Adjusted to keep the text centered within the larger triangle
      right: "5px",
      color: "white",
      fontSize: "10px",
      fontWeight: "bold",
      transform: "rotate(45deg)",
    },
    content: {
      textAlign: "left",
      paddingTop: "10px",
    },
    originalPrice: {
      textDecoration: "line-through",
      color: "#7902DF65",
      fontSize: 18,
      fontWeight: "600",
    },
    discountedPrice: {
      color: "#000000",
      fontWeight: "bold",
      fontSize: 18,
      marginLeft: "10px",
      whiteSpace: "nowrap",
    },
  };

  return (
    <div>
      <AgentSelectSnackMessage
        isVisible={showsuccessSnack}
        hide={() => setShowSuccessSnack(false)}
        message={successSnack}
        type={SnackbarTypes.Success}
      />
      <AgentSelectSnackMessage
        isVisible={showerrorSnack}
        hide={() => setShowErrorSnack(false)}
        message={errorSnack}
        type={SnackbarTypes.Error}
      />

      {/* Sticky Modal */}
      <Modal
        open={canAcceptPaymentsAgencyccount}
        className="border-none outline-none"
        BackdropProps={{
          style: { backgroundColor: 'transparent' }
        }}
      >
        <Box className="w-full flex flex-row items-center justify-center border-none outline-none" sx={{ backgroundColor: "transparent" }}>
          <div className="flex flex-row items-center gap-4 bg-white mt-4 rounded-md shadow-lg p-2">
            <Image alt="error" src={"/assets/salmanassets/danger_conflict.svg"} height={40} width={40} />
            <div className="text-red text-xl font-bold">
              Verify your identity to use your account
            </div>
            <button
              className="bg-purple text-white text-lg rounded-md p-2 outline-none border-none"
              onClick={() => {
                router.push("/agency/verify");
              }}
            >
              Verify now
            </button>
          </div>
        </Box>
      </Modal>

      <div
        className="w-full pt-5 flex flex-col items-center"
        style={{
          height: "90vh",
          overflow: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="w-full flex flex-row gap-3 items-center justify-center">
          <div className="w-9/12">
            <Image
              src={"/assets/agentX.png"}
              alt="profile"
              height={33}
              width={140}
              objectFit="contain"
            />
          </div>
        </div>

        <div className="w-full mt-8 flex flex-col items-center gap-3">
          {agencyLinks.map((item) => (
            <div key={item.id} className="w-full flex flex-col gap-3 pl-3">
              <Link
                sx={{ cursor: "pointer", textDecoration: "none" }}
                href={item.href}
              // onClick={(e) => handleOnClick(e, item.href)}
              >
                <div
                  className="w-full flex flex-row gap-2 items-center py-2 rounded-full"
                  style={{}}
                >
                  <Image
                    src={
                      pathname === item.href ? item.selected : item.uneselected
                    }
                    height={24}
                    width={24}
                    alt="icon"
                  />
                  <div
                    className={
                      pathname === item.href ? "text-purple" : "text-black"
                    }
                    style={{
                      fontSize: 15,
                      fontWeight: 500, //color: pathname === item.href ? "#402FFF" : 'black'
                    }}
                  >
                    {item.name}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* <div>
          <button onClick={requestNotificationPermission}>
            Req Not
          </button>
        </div> */}
      </div>

      <div
        className="w-full flex flex-row items-start justify-center h-[10%] pt-2"
        style={{
          borderTop: "1px solid #00000010",
        }}
      >
        <Link
          href={"/agency/dashboard/myAccount"}
          className="w-11/12  flex flex-row items-start gap-3 px-4 py-2 truncate outline-none text-start" //border border-[#00000015] rounded-[10px]
          style={{
            textOverflow: "ellipsis",
            textDecoration: "none",
          }}
        >
          {userDetails?.user?.thumb_profile_image ? (
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%", // Ensures circular shape
                overflow: "hidden", // Clips any overflow from the image
                display: "flex", // Centers the image if needed
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={userDetails?.user?.thumb_profile_image}
                alt="*"
                style={{ height: "100%", width: "100%" }}
              />
            </div>
          ) : (
            <div className="h-[32px] flex-shrink-0 w-[32px] rounded-full bg-black text-white flex flex-row items-center justify-center">
              {userDetails?.user?.name.slice(0, 1).toUpperCase()}
            </div>
          )}

          <div>
            <div
              className="truncate"
              style={{
                fontSize: 15,
                fontWeight: "500",
                color: "",
                width: "100px",
                color: "black",
              }}
            >
              {userDetails?.user?.name?.split(" ")[0]}
            </div>
            <div
              className="truncate w-[120px]"
              style={{
                fontSize: 15,
                fontWeight: "500",
                color: "#15151560",
                textOverflow: "ellipsis",
              }}
            >
              {userDetails?.user?.email}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AgencyNavBar;
