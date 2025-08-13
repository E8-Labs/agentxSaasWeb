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
import { HowtoVideos, PersistanceKeys, userType } from "@/constants/Constants";
import { logout } from "@/utilities/UserUtility";
import CheckList from "./CheckList";
import { uploadBatchSequence } from "../leads/extras/UploadBatch";
import CallPausedPopup from "@/components/callPausedPoupup/CallPausedPopup";
import IntroVideoModal from "@/components/createagent/IntroVideoModal";
import { AuthToken } from "@/components/agency/plan/AuthDetails";

let stripePublickKey =
  process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
    ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
    : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripePublickKey);

let plansWithoutTrial = [
  {
    id: 1,
    mints: 30,
    calls: 125,
    details: "Great for trying out AI sales agents.",
    originalPrice: "",
    discountPrice: "45",
    planStatus: "",
    status: "",
  },
  {
    id: 2,
    mints: 120,
    calls: "500",
    details: "Perfect for lead updates and engagement.",
    originalPrice: "165",
    discountPrice: "99",
    planStatus: "40%",
    status: "",
  },
  {
    id: 3,
    mints: 360,
    calls: "1500",
    details: "Perfect for lead reactivation and prospecting.",
    originalPrice: "540",
    discountPrice: "299",
    planStatus: "50%",
    status: "Popular",
  },
  {
    id: 4,
    mints: 720,
    calls: "5k",
    details: "Ideal for teams and reaching new GCI goals.  ",
    originalPrice: "1200",
    discountPrice: "599",
    planStatus: "50%",
    status: "Best Value",
  },
];

let plansWitTrial = [
  {
    id: 1,
    startFreeLabel: "Free",
    mints: 30,
    calls: 125,
    isTrial: true,
    trial: "7 Day Trial",
    details: "Perfect to start for free, then $45 to continue.",
    originalPrice: "45",
    discountPrice: "Free Trial",
    planStatus: "Free",
    status: "",
  },
  {
    id: 2,
    mints: 120,
    isTrial: false,
    calls: "500",
    details: "Perfect for lead updates and engagement.", // "Perfect for lead updates and engagement.",
    originalPrice: "165",
    discountPrice: "99",
    planStatus: "40%",
    status: "",
  },
  {
    id: 3,
    mints: 360,
    isTrial: false,
    calls: "1500",
    details: "Perfect for lead reactivation and prospecting.",
    originalPrice: "540",
    discountPrice: "299",
    planStatus: "50%",
    status: "Popular",
  },
  {
    id: 4,
    mints: 720,
    isTrial: false,
    calls: "5k",
    details: "Ideal for teams and reaching new GCI goals.  ",
    originalPrice: "1200",
    discountPrice: "599",
    planStatus: "50%",
    status: "Best Value",
  },
];
//banner
const ProfileNav = () => {
  // const [user, setUser] = useState(null)

  const [plans, setPlans] = useState(plansWithoutTrial);
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


  // Add state for batch upload persistence and progress
  const [uploading, setUploading] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userLeads, setUserLeads] = useState("loading");

  const [showCallPausedPopup, setShowCallPausedPopup] = useState(false);
  const [walkthroughWatched, setWalkthroughWatched] = useState(false);
  const [updateProfileLoader, setUpdateProfileLoader] = useState(false);

  const [addPaymentPopUp, setAddPaymentPopup] = useState(false);
  const [showUpgradePlanBar, setShowUpgradePlanBar] = useState(false)
  const [showFailedPaymentBar, setShowFailedPaymentBar] = useState(false)

  //walkthroughWatched popup
  // useEffect(() => {
  //   getShowWalkThrough();
  // }, []);

  //update profile if walkthrough is true
  useEffect(() => {
    if (walkthroughWatched) {
      // UpdateProfile({});
      const localData = localStorage.getItem("User");
      if (localData) {
        const u = JSON.parse(localData);
        const watched = u?.user?.walkthroughWatched;
        if (u?.user?.plan && (watched === false || watched === "false")) {
          updateWalkthroughWatched();
        }
      }
      // updateWalkthroughWatched();
    }
  }, [walkthroughWatched]);

  // useEffect(() => {
  //   let pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
  //   // requestNotificationPermission();
  //   UpdateProfile({});
  //   // FacebookPixel.initFacebookPixel(pixelId); //initFacebookPixel(pixed_id);
  // }, []);

  useEffect(() => {
    const testNot = async () => {
      try {
        const localData = localStorage.getItem("User");
        let AuthToken = null;
        if (localData) {
          const D = JSON.parse(localData);
          AuthToken = D.token;
        }

        const ApiPath = Apis.getAiNot;

        const response = axios.post(
          ApiPath,
          {},
          {
            headers: {
              Authorization: "Bearer " + AuthToken,
              "Content-Type": "application/json",
            },
          }
        );

        // if (response) {
        //  // //console.log;
        // }
      } catch (error) {
        // console.error("Error occured in test not is"), error;
      }
    };
    testNot();
  }, []);


  //conde for continue lead uploading on route change

  useEffect(() => {
    const savedUpload = localStorage.getItem(PersistanceKeys.leadUploadState);
    if (savedUpload) {
      const {
        data,
        currentBatch,
        sheetName,
        columnMappings,
        tagsValue,
        enrich,
      } = JSON.parse(savedUpload);

      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      console.log("uploading in background after route change")

      uploadBatchSequence({
        data,
        sheetName,
        columnMappings,
        tagsValue,
        enrich,
        startIndex: currentBatch,
        AuthToken,
        setUploading,
        setUploadProgress,
        setCurrentBatch,
        setUserLeads,
        // onProgress: (batch, total) => {
        //   console.log(`Uploading batch ${batch}/${total}`);
        // },
        onComplete: () => {
          console.log("Background lead upload complete.");
        },
      });
    }
  }, []);


  //useeffect that redirect the user back to the main screen for mobile view
  useEffect(() => {
    let windowWidth = 1000;
    if (typeof window !== "undefined") {
      windowWidth = window.innerWidth;
    }
    if (windowWidth < 640) {
      router.push("/createagent/desktop");
    } else {
      return;
    }
  }, []);


  useEffect(() => {
    const handleHidePlanBar = (event) => {
      console.log("hidePlanBar event received:", event.detail.update); // true
      getProfile();
    };

    window.addEventListener("hidePlanBar", handleHidePlanBar);

    return () => {
      window.removeEventListener("hidePlanBar", handleHidePlanBar); // Clean up
    };
  }, []);

  //intro video
  // const getShowWalkThrough = () => {
  //   console.log("Trigered check for walkthrough")
  //   const localData = localStorage.getItem("User");
  //   if (localData) {
  //     const UserDetails = JSON.parse(localData);
  //     // console.log("UserDetails for ShowWalkthroughWatchedPopup", UserDetails.user.walkthroughWatched);
  //     console.log(
  //       "walkthroughWatched raw value:",
  //       UserDetails.user.walkthroughWatched,
  //       "typeof:",
  //       typeof UserDetails.user.walkthroughWatched
  //     );

  //     const watched = UserDetails?.user?.walkthroughWatched;
  //     if (UserDetails?.user?.plan && (watched === false || watched === "false")) {
  //       console.log("✅ should show intro video");
  //       setWalkthroughWatched(true);
  //     } else {
  //       console.log("⛔ should not show intro video");
  //       setWalkthroughWatched(false);
  //     }

  //     // if (UserDetails.user.plan && UserDetails?.user?.walkthroughWatched === false) {
  //     //   console.log("should show intro video ")
  //     //   setWalkthroughWatched(true);
  //     // } else {
  //     //   console.log("should not show intro video")
  //     //   setWalkthroughWatched(false);
  //     // }

  //   }
  // }

  const getShowWalkThrough = () => {
    console.log("rigered the intro video")
    const localData = localStorage.getItem("User");
    if (localData) {
      const UserDetails = JSON.parse(localData);
      const watched = UserDetails?.user?.walkthroughWatched;

      if (UserDetails?.user?.plan && (watched === false || watched === "false")) {
        console.log("✅ should show intro video");
        setWalkthroughWatched(true);
      } else {
        // 👇 Prevent flipping it back off if it’s already been set
        // console.log("⛔ should not show intro video");
        // Do not set it to false here — allow modal to control it via onClose
      }
    }
  };


  const updateWalkthroughWatched = async () => {
    try {
      setUpdateProfileLoader(true);
      const apidata = {
        walkthroughWatched: true
      }
      const response = await UpdateProfile(apidata);
      if (response) {
        setUpdateProfileLoader(false);
        window.dispatchEvent(
          new CustomEvent("UpdateCheckList", { detail: { update: true } })
        );
        console.log("Update api resopnse after walkthrough true", response)
      }
      // console.log("Response of update profile api is", response)
    } catch (error) {
      setUpdateProfileLoader(false);
      console.log("Error occured in update catch api is", error)
    }
  }

  const getUserProfile = async () => {
    await getProfile();
    const data = localStorage.getItem("User");
    getShowWalkThrough();
    if (data) {
      const LocalData = JSON.parse(data);
      console.log(
        "LocalData.user.profile_status",
        LocalData.user.profile_status
      );
      if (LocalData.user.profile_status === "paused") {
        setErrorSnack("Your account has been frozen.");
        logout();
        router.push("/");
        return;
      }
      setUserDetails(LocalData);
      if (LocalData.user.plan == null) {
        // user haven't subscribed to any plan
        setPlans(plansWitTrial);
      }

      if (LocalData.user.needsChargeConfirmation) {
        setShowCallPausedPopup(true);
      }

      console.log('LocalData', LocalData.user.needsChargeConfirmation)


    };
  }

  useEffect(() => {
    getUserProfile();
  }, []);

  useEffect(() => {
    const handleUpdateProfile = (event) => {
      // //console.log;
      getUserProfile(); // Refresh the profile data
      console.log("Navbar called getprofile api 1");
    };

    window.addEventListener("UpdateProfile", handleUpdateProfile);

    return () => {
      document.removeEventListener("UpdateProfile", handleUpdateProfile); // Clean up
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          // console.log(
          //   "Service Worker registered with scope:",
          //   registration.scope
          // );
          // Firebase automatically uses this service worker for messaging
        })
        .catch((error) => {
          // console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  //function to get the notification permissione
  const requestNotificationPermission = () => {
    // setShowNotificationLoader(true);
    // //console.log;
    // //console.log;
    Notification.requestPermission()
      .then((permission) => {
        if (permission === "granted") {
          // //console.log;
          requestToken((FCMToken) => {
            if (FCMToken) {
              // //console.log;
              let apidata = {
                fcm_token: FCMToken,
              };
              let SavedLocation = localStorage.getItem(
                PersistanceKeys.LocalStorageCompleteLocation
              );
              if (SavedLocation) {
                let parsedLocation = JSON.parse(SavedLocation);
                apidata.lat = parsedLocation.latitude;
                apidata.lang = parsedLocation.longitude;
              }
              //console.log;
              // UpdateProfile()
            } else {
              alert("FCM token not generated!!!");
            }
          });
        } else {
          router.push("/tristan.ai");
        }
      })
      .catch((error) => {
        // console.error("Error occured in api is", error);
      })
      .finally(() => {
        // setShowNotificationLoader(false);
      });
  };

  const links = [
    {
      id: 1,
      name: "Dashboard",
      href: "/dashboard",
      selected: "/svgIcons/selectdDashboardIcon.svg",
      uneselected: "/svgIcons/unSelectedDashboardIcon.svg",
    },
    {
      id: 2,
      name: "Agents",
      href: "/dashboard/myAgentX",
      selected: "/svgIcons/selectedAgentXIcon.svg",
      uneselected: "/svgIcons/agentXIcon.svg",
    },
    {
      id: 3,
      name: "Leads",
      href: "/dashboard/leads",
      selected: "/svgIcons/selectedLeadsIcon.svg",
      uneselected: "/svgIcons/unSelectedLeadsIcon.svg",
    },
    {
      id: 4,
      name: "Pipeline",
      href: "/dashboard/pipeline",
      selected: "/svgIcons/selectedPiplineIcon.svg",
      uneselected: "/svgIcons/unSelectedPipelineIcon.svg",
    },
    {
      id: 5,
      name: "Call Log",
      href: "/dashboard/callLog",
      selected: "/svgIcons/selectedCallIcon.svg",
      uneselected: "/svgIcons/unSelectedCallIcon.svg",
    },
    {
      id: 6,
      name: "Integration",
      href: "/dashboard/integration",
      selected: "/svgIcons/selectedIntegration.svg",
      uneselected: "/svgIcons/unSelectedIntegrationIcon.svg",
    },
    {
      id: 7,
      name: "Team",
      href: "/dashboard/team",
      selected: "/svgIcons/selectedTeam.svg",
      uneselected: "/svgIcons/unSelectedTeamIcon.svg",
    },
    // {
    //   id: 8,
    //   name: 'My Account',
    //   href: '/dashboard/myAccount',
    //   selected: '/assets/selectedTeamIcon.png',
    //   uneselected: '/assets/unSelectedTeamIcon.png'
    // },
  ];

  const adminLinks = [
    {
      id: 1,
      name: "Users",
      href: "/admin/",
      selected: "/svgIcons/selectdDashboardIcon.svg",
      uneselected: "/svgIcons/unSelectedDashboardIcon.svg",
    },
  ];

  const agencyLinks = [
    {
      id: 1,
      name: "Dashboard",
      href: "/dashboard",
      selected: "/svgIcons/selectdDashboardIcon.svg",
      uneselected: "/svgIcons/unSelectedDashboardIcon.svg",
    },
    {
      id: 1,
      name: "Sub Account",
      href: "/dashboard",
      selected: "/svgIcons/selectedSubAccountIcon.svg",
      uneselected: "/svgIcons/unSelectedSubAccountIcon.svg",
    },
    {
      id: 1,
      name: "Plans",
      href: "/dashboard",
      selected: "/svgIcons/selectPlansIcon.svg",
      uneselected: "/svgIcons/unSelectePlansIcon.svg",
    },
  ];

  //function to getprofile
  const getProfile = async () => {
    console.log('trying to get profile from nav')
    
    try {
      let response = await getProfileDetails();
      getShowWalkThrough();
      // //console.log;
      if (response?.status == 404) {
        //console.log;
        // logout();
        // router.push("/");
        return;
      }

      // //console.log;

      const userlocalData = localStorage.getItem("User");
      if (userlocalData) {
        // setUserDetails(response.data.data);
        //removed this bcz i am getting data from localstorage and api data is creating issues here
        // setUserDetails(userlocalData);
      }
      // //console.log;

      let Data = response?.data?.data;
      // Data.totalSecondsAvailable  = 100

      console.log(
        "Available seconds are Profile Nav",
        Data?.totalSecondsAvailable
      );

      if (response) {
        // //console.log;
        if (response?.data) {
          console.log("Response of get profile api is", response);
          setUserType(response?.data?.data.userType);
          if (response?.data?.data.userType != "admin") {
            // if (
            //   Data?.userRole === "AgencySubAccount" &&
            //   (Data?.plan == null ||
            //     (Data?.plan && Data?.plan?.status !== "active"))
            // )
            if (
              Data?.userRole === "AgencySubAccount" &&
              (Data?.plan == null ||
                (Data?.plan &&
                  Data?.plan?.status !== "active" &&
                  Data?.totalSecondsAvailable <= 120)
                ||
                (Data?.plan &&
                  Data?.plan?.status === "active" &&
                  Data?.totalSecondsAvailable <= 120))
            ) {
              const fromDashboard = { fromDashboard: true };
              localStorage.setItem(
                "fromDashboard",
                JSON.stringify(fromDashboard)
              );
              router.push("/subaccountInvite/subscribeSubAccountPlan");
            } else if (Data?.userRole !== "AgencySubAccount") {
              if (
                (Data.cards.length === 0) &&
                (Data.needsChargeConfirmation === false) &&
                (!Data.callsPausedUntilSubscription)
              ) {
                // if user comes first time then show plans popup
                setShowPlansPopup(true);
              } else if (

                (Data?.paymentFailed === true)
                && (Data.needsChargeConfirmation === false) &&
                (!Data.callsPausedUntilSubscription)
              ) {
                setShowFailedPaymentBar(true)

              } else if (
                (
                  Data?.plan == null ||
                  (Data?.plan &&
                    Data?.plan?.status !== "active" &&
                    Data?.totalSecondsAvailable <= 120) ||
                  (Data?.plan &&
                    Data?.plan?.status === "active" &&
                    Data?.totalSecondsAvailable <= 120)
                )
                && (Data.needsChargeConfirmation === false) &&
                (!Data.callsPausedUntilSubscription)
              ) {
                //if user have less then 2 minuts show upgrade plan bar
                setShowUpgradePlanBar(true)
              }else{
                console.log('no plans condition is true')
              setShowPlansPopup(false);
              setShowUpgradePlanBar(false)
              setShowFailedPaymentBar(false)
              }

            } else {
              console.log('no condition is true')
              setShowPlansPopup(false);
              setShowUpgradePlanBar(false)
              setShowFailedPaymentBar(false)
            }

            let plan = response?.data?.data?.plan;
            let togglePlan = plan?.type;
            let planType = null;
            if (togglePlan === "Plan30") {
              planType = 1;
            } else if (togglePlan === "Plan120") {
              planType = 2;
            } else if (togglePlan === "Plan360") {
              planType = 3;
            } else if (togglePlan === "Plan720") {
              planType = 4;
            }

            setTogglePlan(planType);
          }
        } else {
          //console.log;
          //Logout user
          logout();
          router.push("/");
        }
      } else {
        //console.log;
      }
    } catch (error) {
      console.error("Error occured in api is error", error);
    }
  };
  const handleOnClick = (e, href) => {
    localStorage.removeItem("openBilling");

    // if (!userDetails.user.plan) {
    //   getProfile();
    // }

    // e.preventDefault();
    // router.push(href);
  };

  //function to subsscribe plan

  //function to select plan
  const handleTogglePlanClick = (item) => {
    setTogglePlan(item.id);
    setSelectedPlan((prevId) => (prevId === item ? null : item));
  };

  //functiion to get cards list
  const getCardsList = async () => {
    try {
      setSubscribePlanLoader(true);

      const localData = localStorage.getItem("User");

      let AuthToken = null;

      if (localData) {
        const Data = JSON.parse(localData);
        AuthToken = Data.token;
      }

      // //console.log;

      //Talabat road

      const ApiPath = Apis.getCardsList;

      // //console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: `Bearer ${AuthToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          if (response.data.data.length === 0) {
            setAddPaymentPopup(true);
          }
        }
      }
    } catch (error) {
      // //console.log;
    } finally {
      // //console.log;
      // setGetCardLoader(false);
    }
  };

  const handleSubscribePlan = async () => {
    try {
      // let cards = [];

      // cards = await getCardsList();
      // if (cards.length == 0) {
      //   setAddPaymentPopup(true);
      //   return;
      // }
      // return;
      let planType = null;

      //// //console.log;

      if (togglePlan === 1) {
        planType = "Plan30";
      } else if (togglePlan === 2) {
        planType = "Plan120";
      } else if (togglePlan === 3) {
        planType = "Plan360";
      } else if (togglePlan === 4) {
        planType = "Plan720";
      }

      // //console.log;

      setSubscribePlanLoader(true);
      let AuthToken = null;
      let localDetails = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const LocalDetails = JSON.parse(localData);
        localDetails = LocalDetails;
        AuthToken = LocalDetails.token;
      }
      // if (localDetails.user.cards.length == 0) {
      //   setAddPaymentPopup(true);
      //   return;
      // }

      // //console.log;

      const ApiData = {
        plan: planType,
        payNow: true,
      };

      // //console.log;

      const ApiPath = Apis.subscribePlan;
      // //console.log;

      // return

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          localDetails.user.plan = response.data.data;
          // //console.log;
          // getProfile();
          localStorage.setItem("User", JSON.stringify(localDetails));
          setSuccessSnack(response.data.message);
          setShowSuccessSnack(true);
          setShowPlansPopup(false);
          console.log("Should triger the intro video")
          getShowWalkThrough();
          getProfile();
        } else if (response.data.status === false) {
          setErrorSnack(response.data.message);
          setShowErrorSnack(true);
        }
      }
    } catch (error) {
      // console.error("Error occured in api is:", error);
    } finally {
      setSubscribePlanLoader(false);
    }
  };

  const handleClose = async (data) => {
    // //console.log;
    if (data.status === true) {
      let newCard = data.data;
      setAddPaymentPopup(false);
      await getProfile();
      // setCards([newCard, ...cards]);
      setSubscribePlanLoader(false)
    }
  };

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

  const showLinks = () => {
    if (userType && userType == "admin") {
      return adminLinks;
    } else {
      return links;
    }
  };

  const SnackBarForUpgradePlan = () => {
    return (

      <div
        style={{
          position: 'fixed',
          top: 20,
          left: '55%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
        }}
        className={`bg-[#845EEE45]  border border-[#845EEE21]  rounded-2xl flex flex-row items-center gap-1 px-2 py-2`}
      >
        <Image src={'/assets/infoBlue.png'} //src={'/otherAssets/infoBlue.jpg'}
          height={24} width={24} alt="*"
        />
        {
          showUpgradePlanBar ? (
            <div style={{ fontSize: showUpgradePlanBar ? 10 : 13, fontWeight: '700', whiteSpace: 'nowrap', }}>
              {`Action needed! Your calls are paused: You don't have enough minutes to run calls.`} <span
                className="text-purple underline cursor-pointer"
                onClick={() => {
                  window.open('/dashboard/myAccount?tab=2')
                }}
              >
                Turn on Smart Refill
              </span>  or  <span
                className="text-purple underline cursor-pointer"
                onClick={() => {
                  window.open('/dashboard/myAccount?tab=2')
                }}
              > Upgrade
              </span>.
            </div>

          ) : (
            <div style={{ fontSize: 15, fontWeight: '700', }}>

              {`Action needed!  Your payment method failed, please add a new`} <span
                className="text-purple underline cursor-pointer"
                onClick={() => {
                  window.open('/dashboard/myAccount?tab=2')
                }}
              >
                Payment Method
              </span>.
            </div>
          )
        }

      </div>

    )
  }

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

      {/* For Walkthrough Watched Popup */}
      {/* Intro modal */}
      <IntroVideoModal
        open={walkthroughWatched}
        onClose={() => setWalkthroughWatched(false)}
        videoTitle="Welcome to AgentX"
        videoDescription="This short video will show you where everything is. Enjoy!"
        videoUrl={HowtoVideos.WalkthroughWatched}//WalkthroughWatched
        showLoader={updateProfileLoader}
      />

      <div className="w-full flex flex-col items-center justify-between h-screen">
        <div
          className="w-full pt-5 flex flex-col items-center"
          style={{
            // height: "90vh",
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
            {showLinks().map((item) => (
              <div key={item.id} className="w-full flex flex-col gap-3 pl-6">
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
                        pathname === item.href
                          ? item.selected
                          : item.uneselected
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
        {/* Lower body */}
        <div className="w-full">
          {/* Code for Check list menu bar */}
          <div>{userDetails && <CheckList userDetails={userDetails} setWalkthroughWatched={setWalkthroughWatched} />}</div>

          <div
            className="w-full flex flex-row items-start justify-start pt-2"
            style={{
              borderTop: "1px solid #00000010",
            }}
          >
            <Link
              href={"/dashboard/myAccount"}
              className="w-full  flex flex-row items-start gap-3 px-2 py-2 truncate outline-none text-start" //border border-[#00000015] rounded-[10px]
              style={{
                textOverflow: "ellipsis",
                textDecoration: "none",
              }}
            >
              {userDetails?.user?.thumb_profile_image ? (
                <img
                  src={userDetails?.user?.thumb_profile_image}
                  alt="*"
                  style={{
                    objectFit: "fill",
                    height: "34px",
                    width: "34px",
                    borderRadius: "50%",
                  }}
                />
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

        {
          (showUpgradePlanBar || showFailedPaymentBar) && (
            <SnackBarForUpgradePlan
            />
          )
        }
      </div>

      <CallPausedPopup
        open={showCallPausedPopup}
        onClose={() => setShowCallPausedPopup(false)}
      />

      {/* Subscribe Plan modal */}
      <div>
        {/* Subscribe Plan modal */}

        <Modal
          open={showPlansPopup}  //showPlansPopup
          closeAfterTransition
          BackdropProps={{
            timeout: 100,
            sx: {
              backgroundColor: "#00000020",
            },
          }}
        >
          <Box
            className="lg:w-8/12 sm:w-full w-full flex justify-center items-center"
            sx={{
              ...styles.paymentModal,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh", // Full viewport height
            }}
          >
            <div
              className="flex flex-row justify-center w-full"
              style={{
                maxHeight: "90vh", // Restrict modal height to 90% of the viewport
                overflow: "hidden", // Prevent scrolling on the entire modal
              }}
            >
              <div
                className="sm:w-7/12 w-full"
                style={{
                  backgroundColor: "#ffffff",
                  paddingInline: 30,
                  paddingTop: 20,
                  paddingBottom: 40,
                  borderRadius: "13px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  overflow: "hidden",
                }}
              >


                <div
                  className="flex  items-start"
                  style={{
                    fontSize: 22,
                    fontWeight: "600",
                    marginTop: 20,
                  }}
                >
                  {`AI Agents from just $1.50/day`}
                </div>
                <div
                  className="flex  items-start"
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    marginTop: 0,
                  }}
                >
                  {`Gets more done than coffee. Cheaper too. Cancel anytime. 😉`}
                </div>



                <div
                  style={{
                    overflowY: "auto", // Make the plans scrollable
                    paddingBottom: "0px", // Add space for the fixed buttons
                    // height: "800px",
                    // borderWidth: 1,
                  }}
                >
                  {plans.map((item, index) => (
                    <button
                      key={item.id}
                      className="w-full mt-4"
                      onClick={() => handleTogglePlanClick(item)}
                    >
                      <div
                        className="px-4 py-1 pb-4"
                        style={{
                          ...styles.pricingBox,
                          border:
                            item.id === togglePlan
                              ? "2px solid #7902DF"
                              : "1px solid #15151520",
                          backgroundColor:
                            item.id === togglePlan ? "#402FFF10" : "",
                        }}
                      >
                        {index === 0 && (
                          <Image
                            style={{
                              position: "absolute",
                              right: 60,
                              top: -17,
                            }}
                            width={40}
                            height={40}
                            src={"/assets/giftRibbon.png"}
                            alt="*"
                          />
                        )}
                        <div
                          style={{
                            ...styles.triangleLabel,
                            borderTopRightRadius: "7px",
                          }}
                        ></div>
                        <span style={styles.labelText}>{item.planStatus}</span>
                        <div
                          className="flex flex-row items-start gap-3"
                          style={styles.content}
                        >
                          <div className="mt-1">
                            <div>
                              {item.id === togglePlan ? (
                                <Image
                                  src={"/svgIcons/checkMark.svg"}
                                  height={24}
                                  width={24}
                                  alt="*"
                                />
                              ) : (
                                <Image
                                  src={"/svgIcons/unCheck.svg"}
                                  height={24}
                                  width={24}
                                  alt="*"
                                />
                              )}
                            </div>
                          </div>
                          <div className="w-full">
                            <div
                              style={{
                                color: "#151515",
                                fontSize: 20,
                                fontWeight: "600",
                              }}
                              className="flex flex-row items-center gap-2"
                            >
                              {item.startFreeLabel
                                ? `${item.startFreeLabel} `
                                : ""}
                              {item.mints}mins
                              {item.trial ? ` ${item.trial} ` : "  "}|{" "}
                              {item.calls} Calls*
                              {item.status && (
                                <div
                                  className="flex hidden sm:flex px-2 py-1 bg-purple rounded-full text-white"
                                  style={{ fontSize: 11.6, fontWeight: "500" }}
                                >
                                  {item.status}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-row items-center justify-between">
                              <div
                                className="mt-2"
                                style={{
                                  color: "#15151590",
                                  fontSize: 12,
                                  width: "80%",
                                  fontWeight: "600",
                                }}
                              >
                                {item.details}
                              </div>
                              <div className="flex flex-row items-center">
                                <div style={styles.originalPrice}>
                                  {item.originalPrice && (
                                    <div>${item.originalPrice}</div>
                                  )}
                                </div>
                                <div className="flex flex-row justify-start items-start ">
                                  <div style={styles.discountedPrice}>
                                    {item.trial ? "" : "$"}
                                    {item.discountPrice}
                                  </div>
                                  <p style={{ color: "#15151580" }}>
                                    {item.trial ? `` : "/mo*"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div>
                  {subscribePlanLoader ? (
                    <div>
                      <CircularProgress size={30} />
                    </div>
                  ) : (
                    <button
                      disabled={!togglePlan}
                      className="w-full flex flex-row items-center justify-center h-[50px] bg-purple rounded-lg text-white"
                      style={{
                        fontSize: 16.8,
                        fontWeight: "600",
                        backgroundColor: togglePlan ? "" : "#00000020",
                        color: togglePlan ? "" : "#000000",
                      }}
                      onClick={() => {
                        setSubscribePlanLoader(true);
                        let localDetails = null;
                        const localData = localStorage.getItem(
                          PersistanceKeys.LocalStorageUser
                        );
                        if (localData) {
                          const LocalDetails = JSON.parse(localData);
                          localDetails = LocalDetails;
                          // AuthToken = LocalDetails.token;
                        }
                        if (localDetails?.user?.cards?.length == 0) {
                          setAddPaymentPopup(true);
                        } else {
                          handleSubscribePlan();
                        }
                      }}
                    >
                      Subscribe Plan
                    </button>
                  )}
                </div>

                <div className="w-full mt-2 flex flex-row items-center justify-center">
                  <button
                    onClick={() => {
                      localStorage.clear();
                      if (typeof document !== "undefined") {
                        document.cookie =
                          "User=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                      }
                      router.push("/");
                    }}
                    className="text-red bg-[#FF4E4E40] font-[600] text-lg px-4 py-1 rounded-full"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </Box>
        </Modal>



        {/* Add Payment Modal */}
        <Modal
          open={addPaymentPopUp} //addPaymentPopUp
          // open={true}
          closeAfterTransition
          BackdropProps={{
            timeout: 100,
            sx: {
              backgroundColor: "#00000020",
              // //backdropFilter: "blur(20px)",
            },
          }}
        >
          <Box
            className="flex lg:w-8/12 sm:w-full w-full justify-center items-center"
            sx={styles.paymentModal}
          >
            <div className="flex flex-row justify-center w-full ">
              <div
                className="sm:w-7/12 w-full"
                style={{
                  backgroundColor: "#ffffff",
                  padding: 20,
                  borderRadius: "13px",
                }}
              >
                <div className="flex flex-row justify-between items-center">
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: "600",
                    }}
                  >
                    Payment Details
                  </div>
                  <button onClick={() => setAddPaymentPopup(false)}>
                    <Image
                      src={"/assets/crossIcon.png"}
                      height={40}
                      width={40}
                      alt="*"
                    />
                  </button>
                </div>
                <Elements stripe={stripePromise}>
                  <AddCardDetails
                    //selectedPlan={selectedPlan}
                    // stop={stop}
                    // getcardData={getcardData} //setAddPaymentSuccessPopUp={setAddPaymentSuccessPopUp} handleClose={handleClose}
                    handleClose={handleClose}
                    togglePlan={togglePlan}
                  // handleSubLoader={handleSubLoader} handleBuilScriptContinue={handleBuilScriptContinue}
                  />
                </Elements>
              </div>
            </div>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default ProfileNav;


