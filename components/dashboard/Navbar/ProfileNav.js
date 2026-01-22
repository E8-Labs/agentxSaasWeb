"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  CircularProgress,
  Fade,
  Modal,
  Snackbar,
  Typography,
} from "@mui/material";
import Link from "next/link";
import getProfileDetails from "@/components/apis/GetProfile";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import { useHasPermission } from "@/contexts/PermissionContext";
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

import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import AddCardDetails from "@/components/createagent/addpayment/AddCardDetails";
import { HowtoVideos, PersistanceKeys, userType } from "@/constants/Constants";
import { logout } from "@/utilities/UserUtility";
import CheckList from "./CheckList";
import socketService from "@/utilities/SocketService";
import { uploadBatchSequence } from "../leads/extras/UploadBatch";
import CallPausedPopup from "@/components/callPausedPoupup/CallPausedPopup";
import IntroVideoModal from "@/components/createagent/IntroVideoModal";
import { checkCurrentUserRole } from "@/components/constants/constants";
import { LeadProgressBanner } from "../leads/extras/LeadProgressBanner";
import DashboardSlider from "@/components/animations/DashboardSlider";
import PlansService from "@/utilities/PlansService";
import UpgradeModal from "@/constants/UpgradeModal";
import SupportFile from "@/components/agency/plan/SupportFile";
import UpgradePlan from "@/components/userPlans/UpgradePlan";
import { GetFormattedDateString } from "@/utilities/utility";
import { useUser } from "@/hooks/redux-hooks";
import moment from "moment";
import AppLogo from "@/components/common/AppLogo";
import { AuthToken } from "@/components/agency/plan/AuthDetails";
import { SmartRefillApi } from "@/components/onboarding/extras/SmartRefillapi";
import { hexToHsl, calculateIconFilter } from "@/utilities/colorUtils";
import { renderBrandedIcon } from "@/utilities/iconMasking";

const stripePromise = getStripe();

// Plans will now be loaded dynamically from API
//banner
const ProfileNav = () => {
  // #region agent log
  const renderCount = useRef(0)
  const mountTime = useRef(Date.now())
  renderCount.current += 1

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Navbar/ProfileNav.js:60', message: 'ProfileNav mounted', data: { pathname: typeof window !== 'undefined' ? window.location.pathname : 'server', mountTime: mountTime.current, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'J' }) }).catch(() => { });
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Navbar/ProfileNav.js:68', message: 'ProfileNav render', data: { renderCount: renderCount.current, pathname: typeof window !== 'undefined' ? window.location.pathname : 'server', timeSinceMount: Date.now() - mountTime.current, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'J' }) }).catch(() => { });
    }
  })
  // #endregion

  // const [user, setUser] = useState(null)

  const { user: reduxUser, setUser: setReduxUser } = useUser();

  const [plans, setPlans] = useState([]);
  const router = useRouter();
  const pathname = usePathname();

  // #region agent log
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Navbar/ProfileNav.js:85', message: 'ProfileNav pathname changed', data: { pathname, timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'J' }) }).catch(() => { });
    }
  }, [pathname])
  // #endregion

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
  const [showPlanPausedBar, setShowPlanPausedBar] = useState(false)
  const [showFailedPaymentBar, setShowFailedPaymentBar] = useState(false)
  const [showAssignBanner, setShowAssignBanner] = useState(false)
  const [bannerProgress, setBannerProgress] = useState(0);
  const [isLeadUploading, setIsLeadUploading] = useState(false);

  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showUpgradePlanModal, setShowUpgradePlanModal] = useState(false);
  const [showUpgradePlanModal2, setShowUpgradePlanModal2] = useState(false);
  const [showLowMinsModal, setShowLowMinsModal] = useState(false);
  const [socketStatus, setSocketStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected'
  const [loading, setLoading] = useState(false);
  const [localUser, setLocalUser] = useState(null);

  // Custom domain detection and branding
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [agencyBranding, setAgencyBranding] = useState(null);

  const [hideDashboardSlider, setHideDashboardSlider] = useState(false);

  // Custom domain detection and branding application
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if current domain is a custom domain (not dev.assignx.ai or app.assignx.ai)
    const hostname = window.location.hostname
    const isCustom = hostname !== 'dev.assignx.ai' && hostname !== 'app.assignx.ai'
    setIsCustomDomain(isCustom)

    // Get agency branding from localStorage
    const storedBranding = localStorage.getItem('agencyBranding')
    if (storedBranding) {
      try {
        const brandingData = JSON.parse(storedBranding)
        setAgencyBranding(brandingData)

        // Apply branding CSS variables if it's a custom domain
        if (isCustom && brandingData) {
          try {
            const primaryColor = brandingData.primaryColor || '#7902DF'
            const secondaryColor = brandingData.secondaryColor || '#8B5CF6'
            const primaryHsl = hexToHsl(primaryColor)
            const secondaryHsl = hexToHsl(secondaryColor)

            document.documentElement.style.setProperty('--brand-primary', primaryHsl)
            document.documentElement.style.setProperty('--brand-secondary', secondaryHsl)
            document.documentElement.style.setProperty('--primary', primaryHsl)
            document.documentElement.style.setProperty('--secondary', secondaryHsl)

            const iconFilter = calculateIconFilter(primaryColor)
            document.documentElement.style.setProperty('--icon-filter', iconFilter)

            // Add class to body for CSS-based icon filtering
            document.body.classList.add('custom-domain-branding')
          } catch (error) {}
        }
      } catch (error) {}
    }

    // Listen for branding updates
    const handleBrandingUpdate = (event) => {
      const updatedBranding = event.detail
      if (updatedBranding) {
        setAgencyBranding(updatedBranding)
        if (isCustom) {
          try {
            const primaryColor = updatedBranding.primaryColor || '#7902DF'
            const primaryHsl = hexToHsl(primaryColor)
            document.documentElement.style.setProperty('--brand-primary', primaryHsl)
            const iconFilter = calculateIconFilter(primaryColor)
            document.documentElement.style.setProperty('--icon-filter', iconFilter)

            // Ensure body has the class for CSS-based icon filtering
            if (!document.body.classList.contains('custom-domain-branding')) {
              document.body.classList.add('custom-domain-branding')
            }
          } catch (error) {}
        }
      }
    }

    window.addEventListener('agencyBrandingUpdated', handleBrandingUpdate)

    return () => {
      window.removeEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    }
  }, [])



  useEffect(() => {
    if (pathname === '/dashboard') {
      setShowHelpModal(true);
    } else {
      setShowHelpModal(false);
    }
  }, [pathname])

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
    const local = localStorage.getItem("User");
    if (local) {
      const parsed = JSON.parse(local);
      setLocalUser(parsed.user);
    }
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
        onComplete: () => {},
      });
    }
  }, []);





  //useeffect that redirect the user back to the main screen for mobile view
  useEffect(() => {
    // checkCurrentUserRole();
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
      getProfile();
    };

    const handleTaskBoardOpen = (event) => {
      console.log("taskBoardOpen event received:", event.detail.update); // true
      setHideDashboardSlider(true);
    };

    const handleTaskBoardClose = (event) => {
      console.log("taskBoardClose event received:", event.detail.update); // true
      setHideDashboardSlider(false);
    };

    const handleHideDashboardSlider = (event) => {
      console.log("hideDashboardSlider event received:", event.detail.update); // true
      setHideDashboardSlider(true);
    };
    

    window.addEventListener("taskBoardOpen", handleTaskBoardOpen);
    window.addEventListener("taskBoardClose", handleTaskBoardClose);
    return () => {
      window.removeEventListener("taskBoardOpen", handleTaskBoardOpen);
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
    const localData = localStorage.getItem("User");
    if (localData) {
      const UserDetails = JSON.parse(localData);
      const watched = UserDetails?.user?.walkthroughWatched;

      if (UserDetails?.user?.plan && (watched === false || watched === "false")) {
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
      }
      // console.log("Response of update profile api is", response)
    } catch (error) {
      setUpdateProfileLoader(false);
    }
  }

  // Function to load plans dynamically
  const loadPlans = async (includeTrial = false) => {
    try {
      const context = 'default';
      const cacheKey = includeTrial ? 'plans_with_trial_profile_nav' : 'plans_without_trial_profile_nav';

      const plansData = await PlansService.getCachedPlans(
        cacheKey,
        'regular',
        includeTrial ? 'onboarding' : context,
        includeTrial
      );

      setPlans(plansData);
    } catch (error) {
      console.error('Error loading plans in ProfileNav:', error);
      // Set fallback plans if API fails
      setPlans(PlansService.getFallbackPlans(includeTrial ? 'onboarding' : 'default', includeTrial));
    }
  };

  //trial days counter
  // const checkTrialDays = (userData) => {
  //   if (userData?.isTrial === false) { return 0 }
  //   console.log("user data passed to counter is", userData);
  //   const todayDate = moment();
  //   console.log("Trial days Today date is", todayDate);
  //   const trialStartDate = moment(userData?.plan?.createdAt);
  //   console.log("Trial days start date is", trialStartDate);
  //   // const trialDays = Math.floor((todayDate - trialStartDate) / (1000 * 60 * 60 * 24));
  //   const trialDays = todayDate.diff(trialStartDate, "days");
  //   console.log(`Trial days left are: ${trialDays} days`);
  //   return trialDays;
  // }

  const checkTrialDays = (userData) => {
    if (userData?.isTrial) {
      // nextChargeDate is the trial END date (when the trial expires)
      const trialEnd = moment(userData?.nextChargeDate || new Date());
      const today = moment().startOf('day'); // Start of day for accurate day counting
      const trialEndStartOfDay = trialEnd.startOf('day');

      // Calculate days remaining: trialEnd - today
      // This gives positive number when trial hasn't ended yet
      let daysLeft = trialEndStartOfDay.diff(today, "days");

      // Ensure daysLeft is never negative (trial already ended)
      daysLeft = Math.max(daysLeft, 0);

      return `${daysLeft} Day${daysLeft !== 1 ? "s" : ""} Left`;
    }
  };

  const getUserProfile = async () => {
    await getProfile();
    const data = localStorage.getItem("User");
    getShowWalkThrough();
    if (data) {
      const LocalData = JSON.parse(data);
      if (LocalData.user.profile_status !== "active") {
        setErrorSnack("Your account has been frozen.");
        setShowErrorSnack(true);
        // Show snackbar briefly before logout
        setTimeout(() => {
          logout("Profile status is not active");
        }, 2000);
        return;
      }
      // checkTrialDays(LocalData.user);
      setUserDetails(LocalData);
      // Update Redux store
      setReduxUser(LocalData);
      if (LocalData.user.plan == null) {
        // user haven't subscribed to any plan - load plans with trial
        await loadPlans(true);
      } else {
        // user has a plan - load regular plans
        await loadPlans(false);
      }

      if (LocalData.user.needsChargeConfirmation) {
        setShowCallPausedPopup(true);
      }
    };
  }

  useEffect(() => {
    getUserProfile();

    // Initialize socket connection after getting user profile
    const initializeSocket = () => {
      const userData = localStorage.getItem("User");
      if (userData) {
        setSocketStatus('connecting');
        socketService.connect();

        // Monitor socket status
        const checkStatus = () => {
          const status = socketService.getConnectionStatus();
          setSocketStatus(status);
        };

        // Check status every 2 seconds
        const statusInterval = setInterval(checkStatus, 2000);

        // Cleanup interval on unmount
        return () => clearInterval(statusInterval);
      }
    };

    // Small delay to ensure localStorage is ready
    const cleanup = setTimeout(initializeSocket, 1000);

    // Cleanup socket on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleUpdateProfile = (event) => {
      // //console.log;
      getUserProfile(); // Refresh the profile data
    };

    window.addEventListener("UpdateProfile", handleUpdateProfile);

    return () => {
      window.removeEventListener("UpdateProfile", handleUpdateProfile); // Clean up
    };
  }, []);


  const simulateProgress = () => {
    let progress = 0;
    setBannerProgress(progress);

    const interval = setInterval(() => {
      progress += 5;

      if (progress >= 90) {
        clearInterval(interval); // stop auto increment at 90%
        setBannerProgress(90);
      } else {
        setBannerProgress(progress);
      }
    }, 1000); // every 1 second
  };

  useEffect(() => {
    const handleOpenBanner = (event) => {
      setShowAssignBanner(true)
      simulateProgress()
    };

    window.addEventListener(PersistanceKeys.AssigningLeads, handleOpenBanner);

    return () => {
      window.removeEventListener(PersistanceKeys.AssigningLeads, handleOpenBanner); // Clean up
    };
  }, []);


  useEffect(() => {
    const handleCloseBanner = (event) => {
      setShowAssignBanner(false)
      setBannerProgress(100)
    };

    window.addEventListener(PersistanceKeys.LeadsAssigned, handleCloseBanner);

    return () => {
      window.removeEventListener(PersistanceKeys.LeadsAssigned, handleCloseBanner); // Clean up
    };
  }, []);

  // Function to refresh user data after plan upgrade
  const refreshUserData = async () => {
    try {
      const profileResponse = await getProfileDetails();

      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data;
        const localData = JSON.parse(localStorage.getItem("User") || '{}');

        // Update Redux with fresh data
        const updatedUserData = {
          token: localData.token,
          user: freshUserData
        };

        setReduxUser(updatedUserData);
        localStorage.setItem("User", JSON.stringify(updatedUserData));

        return true;
      }
      return false;
    } catch (error) {
      console.error('🔴 [UPGRADE-TAG] Error refreshing user data:', error);
      return false;
    }
  };
  // Event listener for lead upload status
  useEffect(() => {
    const handleLeadUploadStart = (event) => {
      setIsLeadUploading(true);
    };

    const handleLeadUploadComplete = (event) => {
      setIsLeadUploading(false);
    };

    window.addEventListener("leadUploadStart", handleLeadUploadStart);
    window.addEventListener("leadUploadComplete", handleLeadUploadComplete);

    return () => {
      window.removeEventListener("leadUploadStart", handleLeadUploadStart);
      window.removeEventListener("leadUploadComplete", handleLeadUploadComplete);
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

  // Determine permission prefix based on user role
  const getPermissionPrefix = () => {
    // Both AgencySubAccount and AgentX users use 'agentx' permission prefix
    if (reduxUser?.userRole === 'AgencySubAccount' || reduxUser?.userRole === 'AgentX') {
      return 'agentx'
    }
    return null // No permission checks for other roles (Admin, etc.)
  }

  const permissionPrefix = getPermissionPrefix()
  const isInvitee = reduxUser?.userRole === 'Invitee'

  const links = [
    {
      id: 1,
      name: "Dashboard",
      href: "/dashboard",
      selected: "/svgIcons/selectdDashboardIcon.svg",
      uneselected: "/svgIcons/unSelectedDashboardIcon.svg",
      permissionKey: permissionPrefix ? `${permissionPrefix}.dashboard.view` : null,
    },
    {
      id: 2,
      name: "Agents",
      href: "/dashboard/myAgentX",
      selected: "/svgIcons/selectedAgentXIcon.svg",
      uneselected: "/svgIcons/agentXIcon.svg",
      permissionKey: permissionPrefix ? `${permissionPrefix}.agents.view` : null,
    },
    {
      id: 3,
      name: "Leads",
      href: "/dashboard/leads",
      selected: "/svgIcons/selectedLeadsIcon.svg",
      uneselected: "/svgIcons/unSelectedLeadsIcon.svg",
      permissionKey: permissionPrefix ? `${permissionPrefix}.leads.manage` : null,
    },
    {
      id: 4,
      name: "Pipeline",
      href: "/dashboard/pipeline",
      selected: "/svgIcons/selectedPiplineIcon.svg",
      uneselected: "/svgIcons/unSelectedPipelineIcon.svg",
      permissionKey: permissionPrefix ? `${permissionPrefix}.pipelines.manage` : null,
    },
    {
      id: 8,
      name: "Messages",
      isBeta: true,
      href: "/dashboard/messages",
      selected: "/messaging/icons_chat_menu.svg",
      uneselected: "/messaging/icons_chat_menu.svg",
      permissionKey: permissionPrefix ? `${permissionPrefix}.messages.manage` : null,
    },
    {
      id: 5,
      name: "Activity",//"Call Log",
      href: "/dashboard/callLog",
      selected: "/otherAssets/selectedActivityLog.png",
      uneselected: "/otherAssets/activityLog.png",
      permissionKey: permissionPrefix ? `${permissionPrefix}.activity.view` : null,
    },
    {
      id: 6,
      name: "Integration",
      href: "/dashboard/integration",
      selected: "/svgIcons/selectedIntegration.svg",
      uneselected: "/svgIcons/unSelectedIntegrationIcon.svg",
      permissionKey: permissionPrefix ? `${permissionPrefix}.integrations.manage` : null,
    },
    {
      id: 7,
      name: "Team",
      href: "/dashboard/team",
      selected: "/svgIcons/selectedTeam.svg",
      uneselected: "/svgIcons/unSelectedTeamIcon.svg",
      permissionKey: permissionPrefix ? `${permissionPrefix}.teams.manage` : null,
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
    try {
      let response = await getProfileDetails();
      getShowWalkThrough();

      if (response?.status == 404) {
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

      let Data = response?.data?.data;

      // Check profile_status from API response
      if (Data?.profile_status && Data.profile_status !== "active") {
        setErrorSnack("Your account has been frozen.");
        setShowErrorSnack(true);
        // Show snackbar briefly before logout
        setTimeout(() => {
          logout("Profile status is not active");
        }, 2000);
        return;
      }

      if (response) {
        if (response?.data) {
          setUserType(response?.data?.data.userType);
          let userPlan = response?.data?.data?.plan;
          const user = response?.data?.data;
          const isBalanceLow = user.totalSecondsAvailable < 120;
          setReduxUser(user);


          if (response?.data?.data.userType != "admin") {
            if (!userPlan && Data?.userRole !== "AgencySubAccount") {
              router.push("/plan")
              return
            }
          }
          if (
            Data?.userRole === "AgencySubAccount" &&
            (Data?.plan == null || (Data?.plan && Data?.plan?.status !== "active"))
            // ||
            // (Data?.plan && isBalanceLow)) // TODO: @Arslan Please handle this condition properly
          ) {
            const fromDashboard = { fromDashboard: true };
            localStorage.setItem(
              "fromDashboard",
              JSON.stringify(fromDashboard)
            );
            router.push("/subaccountInvite/subscribeSubAccountPlan");
          } else if (Data?.userRole === "AgencySubAccount" || Data?.userRole === "AgentX") {
           if (Data?.plan?.status === "paused") {
              setShowPlanPausedBar(true)
            } else if (

              (Data?.paymentFailed === true)
              && (Data.needsChargeConfirmation === false) &&
              (!Data.callsPausedUntilSubscription)
            ) {
              setShowFailedPaymentBar(true)
            } else if (isBalanceLow && (Data?.plan?.price === 0 || Data?.smartRefill === false)) {
              //if user have less then 2 minuts show upgrade plan bar
              setShowUpgradePlanBar(true)
            } else {
              setShowPlansPopup(false);
              setShowUpgradePlanModal(false)

              setShowUpgradePlanBar(false)
              setShowFailedPaymentBar(false)
            }
          } else {
            setShowPlansPopup(false);
            setShowUpgradePlanModal(false)

            setShowUpgradePlanBar(false)
            setShowFailedPaymentBar(false)
          }

          let plan = response?.data?.data?.plan;
          let togglePlan = plan?.type;
          let planType = togglePlan;


          setTogglePlan(planType);
        } else {}
      } else {
        logout("API failure/no response from getProfile");
        router.push("/");
      }
    } catch (error) {
      console.error("❌ [getProfile] Error occurred:", error);
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

  const handleSmartRefill = async () => {
    setLoading(true);
    let response = await SmartRefillApi();
    if (response.data.status === true) {
      setLoading(false);
      setShowUpgradePlanBar(false);
      setShowFailedPaymentBar(false);
      setShowPlanPausedBar(false);
      setShowSuccessSnack(true);
      setSuccessSnack(response.data.message);
      await refreshUserData();
    } else {
      setLoading(false);
      setShowErrorSnack(true);
      setErrorSnack(response.data.message);
    }
  }

  const resumeAccount = async () => {
    setLoading(true);

    try {
      const user = localStorage.getItem("User");
      if (user) {
        const userData = JSON.parse(user);
        let token = userData.token;

        const response = await axios.post(Apis.resumeSubscription, {}, {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        });
        if (response.data.status === true) {
          setShowSuccessSnack(true);
          setSuccessSnack(response.data.message);
          await getProfile();
          setShowPlanPausedBar(false);

          // Dispatch event to notify other components that subscription has been resumed
          window.dispatchEvent(
            new CustomEvent("subscriptionResumed", { detail: { update: true } })
          );
        } else {
          setShowErrorSnack(true);
          setErrorSnack(response.data.message);
        }
      }
    } catch (error) {
      console.error("Error occured in api is:", error);
    } finally {
      setLoading(false);
    }

  }

  const SnackBarForUpgradePlan = (Data) => {
    return (

      <div
        style={{
          position: 'fixed',
          top: 20,
          left: '55%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          backgroundColor: `hsl(var(--brand-primary)/0.3)`,
        }}
        className={` border rounded-2xl flex flex-row items-center gap-1 px-2 py-2`}
      >
        {renderBrandedIcon("/assets/infoBlue.png", 24, 24)}
        {
          showPlanPausedBar ? (
            <div style={{ fontSize: 13, fontWeight: '700', }}>
              {`Your account is paused. Click here to`} <span
                className="text-brand-primary underline cursor-pointer"
                onClick={() => {
                  resumeAccount()
                }}
              > {loading ? <CircularProgress size={20} /> : "Resume"}
              </span>
            </div>

          ) : (
            <>
              {

                showUpgradePlanBar && reduxUser?.plan?.price === 0 ? (
                  <div className="flex flex-col">
                    <div style={{ fontSize: 13, fontWeight: '700', }}>
                      {`You're out of Free AI Credits.`}<span className="text-brand-primary underline cursor-pointer" onClick={() => {
                        setShowUpgradePlanModal2(true)
                      }}>
                        Upgrade
                      </span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: '600', color: "#00000080" }}>
                      Please upgrade or wait until your renewal date.
                    </div>
                  </div>
                ) : (
                  showUpgradePlanBar ? (
                    <div style={{ fontSize: 13, fontWeight: '700', }}>
                      {reduxUser?.plan?.price === 0 ? "You're out of Free AI Credits." :
                        `Action Needed! Your AI agents are paused. You don't have enough credits.`}
                      {reduxUser?.smartRefill === false && (<span
                        className="text-brand-primary underline cursor-pointer"
                        onClick={() => {
                          handleSmartRefill();
                        }}
                      >
                        {loading ? <CircularProgress size={20} /> : " Turn on Smart Refill "} <span className="text-black"> or </span>
                      </span>)}  <span
                        className="text-brand-primary underline cursor-pointer"
                        onClick={() => {
                          setShowUpgradePlanModal2(true)
                        }}
                      > Upgrade
                      </span>
                    </div>

                  ) : (
                    <div>

                      <div style={{ fontSize: 15, fontWeight: '700', }}>
                        {`Your subscription payment could not be processed.`}
                        <span
                          className="text-brand-primary underline cursor-pointer"
                          onClick={() => {
                            setShowUpgradePlanModal2(true)
                          }}
                        > Upgrade
                        </span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: '600', color: "#00000080" }}>
                        {"Please update your payment method to continue"}
                      </div>


                    </div>
                  )
                )
              }

            </>
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
        videoTitle={`Welcome to ${reduxUser?.agencyBranding?reduxUser?.agencyBranding?.companyName:"AssignX"}`}
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
          <div className="w-full flex flex-col gap-2">
            {/* Show company name if no logo for subaccount users */}
            {reduxUser && (reduxUser?.userRole === "AgencySubAccount" || reduxUser?.userRole === "Invitee") && reduxUser?.agencyBranding && !reduxUser.agencyBranding.logoUrl && reduxUser.agencyBranding.companyName ? (
              <div className="w-full text-left pl-6" style={{ marginLeft: "-8px" }}>
                <div className="text-lg font-bold text-black truncate">
                  {reduxUser.agencyBranding.companyName}
                </div>
              </div>
            ) : (
              /* AppLogo handles logo display based on hostname */
              (<div className="w-full flex justify-start pl-6">
                <AppLogo
                  height={reduxUser?.userRole === "AgencySubAccount" || reduxUser?.userRole === "Invitee" ? 40 : 33}
                  width={140}
                  maxWidth={200}
                  style={{ marginLeft: "-8px" }}
                  alt="logo"
                />
              </div>)
            )}
          </div>

          <div className="w-full mt-8 flex flex-col items-center gap-3">
            {showLinks().map((item) => {
              // Component to check permission for nav link
              function PermissionNavLink({ item }) {
                // If not an Invitee or no permission key, show the link
                if (!isInvitee || !item.permissionKey) {
                  return <NavLinkItem item={item} />
                }

                // Check permission for Invitee users
                const [hasAccess, isLoading] = useHasPermission(item.permissionKey)
                
                // Don't render if no permission (hide the link)
                if (isLoading) {
                  return null // Hide while loading
                }
                
                if (!hasAccess) {
                  return null // Hide if no permission
                }
                
                return <NavLinkItem item={item} />
              }

              // Component to render a nav link
              function NavLinkItem({ item }) {
                return (
                  <div className="w-full flex flex-col gap-3 pl-6">
                    <Link
                      href={item.href}
                      className="cursor-pointer no-underline hover:no-underline"
                    >
                      <div
                        className="w-full flex flex-row gap-2 items-center py-2 rounded-full"
                        style={{}}
                      >
                        <div
                          className={
                            pathname === item.href
                              ? "icon-brand-primary"
                              : "icon-black"
                          }
                          style={
                            pathname === item.href
                              ? {
                                '--icon-mask-image': `url(${pathname === item.href
                                    ? item.selected
                                    : item.uneselected
                                  })`,
                              }
                              : {}
                          }
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
                            style={
                              pathname !== item.href && isCustomDomain && agencyBranding
                                ? { filter: 'var(--icon-filter, none)' }
                                : {}
                            }
                          />
                        </div>
                        <div
                          className={
                            pathname === item.href ? "text-brand-primary" : "text-black"
                          }
                          style={{
                            fontSize: 15,
                            fontWeight: 500, //color: pathname === item.href ? "#402FFF" : 'black'
                          }}
                        >
                          {item.name} {item.isBeta && <span className="text-xs text-black">(Beta)</span>}
                        </div>
                      </div>
                    </Link>
                  </div>
                )
              }

              return <PermissionNavLink key={item.id} item={item} />
            })}
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
              className="w-full flex flex-row items-start gap-3 px-2 py-2 truncate outline-none text-start relative no-underline hover:no-underline" //border border-[#00000015] rounded-[10px]
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
                <div className="flex flex-row items-center gap-2">
                  <div
                    className="truncate"
                    style={{
                      fontSize: 15,
                      fontWeight: "500",
                      color: "",
                      // width: "100px",
                      color: "black",
                    }}
                  >
                    {/*userDetails?.user?.name?.split(" ")[0]*/}
                    {(() => {
                      const name = reduxUser?.name?.split(" ")[0] || "";
                      return name.length > 10 ? `${name.slice(0, 7)}...` : name;
                    })()}
                  </div>
                  <div className="text-xs font-medium text-brand-primary">
                    {checkTrialDays(reduxUser) ? `${checkTrialDays(reduxUser)}` : ""}
                  </div>
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
                  {reduxUser?.email}
                </div>
              </div>

              {/* Socket Connection Status Indicator */}

            </Link>


            {
              !showAssignBanner && !isLeadUploading && !hideDashboardSlider && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    bottom: 0
                  }}>
                  <DashboardSlider
                    needHelp={showHelpModal} />
                </div>
              )
            }


            <LeadProgressBanner
              title="Assigning Leads"
              uploading={showAssignBanner}
              uploadProgress={bannerProgress}
            />
          </div>
        </div>

        {
          (showUpgradePlanBar || showFailedPaymentBar || showPlanPausedBar) && (
            <SnackBarForUpgradePlan Data={reduxUser}
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
          open={false}  //showPlansPopup
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
            <SupportFile upgardeAction={() => {
              setShowPlansPopup(false);
              setShowUpgradePlanModal(true);
            }} cancelAction={() => {
              setShowPlansPopup(false)
            }}
              metadata={{
                renewal: reduxUser?.nextChargeDate || ''
              }} />
            {/* <div
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
                                  className="flex hidden sm:flex px-2 py-1 bg-brand-primary rounded-full text-white"
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
                      className="w-full flex flex-row items-center justify-center h-[50px] bg-brand-primary rounded-lg text-white"
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
                      logout("Manual logout button clicked");
                      router.push("/");
                    }}
                    className="text-red bg-[#FF4E4E40] font-[600] text-lg px-4 py-1 rounded-full"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </div> */}
          </Box>
        </Modal>

        <UpgradeModal
          open={showUpgradePlanModal}
          handleClose={() => setShowUpgradePlanModal(false)}
          title={"You've Hit Your AI credits Limit"}
          subTitle={"Upgrade to get more call time and keep your converstaions going"}
          buttonTitle={`No Thanks. Wait until ${GetFormattedDateString(userDetails?.user?.nextChargeDate)} for credits`}
        />



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

        {/* UpgradePlan Modal */}
        <Elements stripe={stripePromise}>
          <UpgradePlan
            setSelectedPlan={() => {}}
            currentFullPlan={reduxUser?.plan}
            open={showUpgradePlanModal2}
            handleClose={(upgradeResult) => {
              setShowUpgradePlanModal2(false)
              if (upgradeResult) {
                refreshUserData()
                setShowUpgradePlanBar(false)
                setShowFailedPaymentBar(false)
                setShowPlanPausedBar(false)
              }
            }}
            setShowSnackMsg={() => {}}
          />
        </Elements>
      </div>
    </div>
  );
};

// Memoize ProfileNav to prevent unnecessary re-renders that could cause layout remounts
export default React.memo(ProfileNav);


