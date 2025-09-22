import Body from "@/components/onboarding/Body";
import Header from "@/components/onboarding/Header";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { useRouter } from "next/navigation";
import Footer from "@/components/onboarding/Footer";
import Apis from "../apis/Apis";
import axios from "axios";
import { Box, CircularProgress, Modal, Popover } from "@mui/material";
import LoaderAnimation from "../animations/LoaderAnimation";
// Removed Google Maps imports for simple string input
import VideoCard from "./VideoCard";
import IntroVideoModal from "./IntroVideoModal";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "../dashboard/leads/AgentSelectSnackMessage";
import { HowtoVideos, PersistanceKeys } from "@/constants/Constants";
import { UserTypes } from "@/constants/UserTypes";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import UpgradePlan from "../userPlans/UpgradePlan";
import UnlockAgentModal from "@/constants/UnlockAgentModal";
import MoreAgentsPopup from "../dashboard/MoreAgentsPopup";
import { useUser } from "../../hooks/redux-hooks";
import { usePlanCapabilities } from "../../hooks/use-plan-capabilities";
import getProfileDetails from "../apis/GetProfile";

const CreateAgent1 = ({ handleContinue, handleSkipAddPayment }) => {
  // Removed Google Maps API key - no longer needed
  const router = useRouter();
  const bottomRef = useRef();
  const [loaderModal, setLoaderModal] = useState(false);
  const [shouldContinue, setShouldContinue] = useState(true);
  const [toggleClick, setToggleClick] = useState(false);
  const [OutBoundCalls, setOutBoundCalls] = useState(false);
  const [InBoundCalls, setInBoundCalls] = useState(false);
  const [buildAgentLoader, setBuildAgentLoader] = useState(false);
  const [agentObjective, setAgentObjective] = useState(null);

  const [agentName, setAgentName] = useState("");
  const [agentRole, setAgentRole] = useState("");

  const [showModal, setShowModal] = useState(false);

  //variable for video card
  const [introVideoModal, setIntroVideoModal] = useState(false);

  //sbakc message when agent builded
  const [snackMessage, setSnackMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [msgType, setMsgType] = useState(null);

  //other status
  const [showSomtthingElse, setShowSomtthingElse] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [otherStatus, setOtherStatus] = useState("");
  //get address
  const [address, setAddress] = useState("");

  const bottomToAddress = useRef(null); // Ref for scrolling
  const [addressSelected, setAddressSelected] = useState(null);

  //code for address input (simple string)
  const [addressValue, setAddressValue] = useState("");

  const [user, setUser] = useState(null);

  const [showUnclockModal, setShowUnclockModal] = useState(false)
  const [modalDesc, setModalDesc] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showMoreAgentsModal, setShowMoreAgentsModal] = useState(false)
  const [showUpgradePlanModal, setShowUpgradePlanModal] = useState(false)
  const [pendingAgentSelection, setPendingAgentSelection] = useState(null) // Track what selection was attempted
  const [hasAgreedToExtraCost, setHasAgreedToExtraCost] = useState(false) // Track if user agreed to pay extra

  // Redux state
  const { user: reduxUser, setUser: setReduxUser } = useUser();
  const { canCreateAgent, isFreePlan, currentAgents, maxAgents } = usePlanCapabilities();

  // Removed address picker modal - no longer needed

  useEffect(() => {
    refreshUserData();
    getSelectedUser()
  }, [])


  const getSelectedUser = () => {
    let U = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency);
    if (U) {
      console.log("found selected user")
      setSelectedUser(JSON.parse(U))
    }else{
    console.log("slected user not found")
    }
  }

  useEffect(() => {
    setAddress(address?.label);
  }, [addressSelected]);

  useEffect(() => {
    let userData = localStorage.getItem(PersistanceKeys.LocalStorageUser);
    if (userData) {
      let d = JSON.parse(userData);
      setUser(d);
    }
  }, [])
  // const [scollAddress, setScollAddress] = useState("");
  //// //console.log;

  //other objective
  const [showOtherObjective, setShowOtherObjective] = useState(false);
  const [otherObjVal, setOtherObjVal] = useState("");

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);



  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  //auto move to the bottom
  useEffect(() => {
    let userData = localStorage.getItem(PersistanceKeys.LocalStorageUser);
    if (userData) {
      let d = JSON.parse(userData);
      setUser(d);
    }
    if (showOtherObjective && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showOtherObjective]);

  useEffect(() => {
    if (
      OutBoundCalls ||
      (InBoundCalls === true && agentName && agentRole && toggleClick)
    ) {
      setShouldContinue(false);
      // //console.log;
    } else if (
      !OutBoundCalls ||
      (!InBoundCalls === true && !agentName && !agentRole && !toggleClick)
    ) {
      setShouldContinue(true);
      // //console.log;
    }
  }, [agentName, agentRole, agentObjective, otherObjVal]);

  const handleToggleClick = (item) => {
    setAgentObjective(item);
    setToggleClick(item.id);
    // setToggleClick(prevId => (prevId === item.id ? null : item.id));

    if (item.id === 3) {
      setShowModal(true);
    }
    if (item.id === 100) {
      // //console.log;
      // if (bottomRef.current) {
      //     bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      // }
      setShowOtherObjective(true);
    } else {
      setShowOtherObjective("");
      setOtherObjVal("");
    }
  };

  const AgentObjective = [
    {
      id: 1,
      icon: "",
      title: "Absentee Owners",
      details:
        "Reach out to property owners who may not live in the property to discuss potential selling or investment opportunities.",
      focusIcn: "/svgIcons/obj1F.svg",
      unFocusIcon: "/objectiveIcons/obj1UF.png",
    },
    {
      id: 2,
      icon: "",
      title: "Circle Prospecting",
      details:
        "Call homeowners in a specific farm to inform them about recent property activities, and gauge their interest in selling or buying.",
      focusIcn: "/svgIcons/obj2F.svg",
      unFocusIcon: "/objectiveIcons/obj2UF.png",
    },
    {
      id: 3,
      icon: "",
      title: "Community Update",
      details:
        "Provide local homeowners with relevant updates on a property like just listed, just sold, in escrow or something else. ",
      focusIcn: "/svgIcons/obj3F.svg",
      unFocusIcon: "/objectiveIcons/obj3UF.png",
    },
    {
      id: 4,
      icon: "",
      title: "Lead Reactivation",
      details:
        "Reconnect with past leads who previously expressed interest but did not convert, to reignite their interest in your services.",
      focusIcn: "/svgIcons/obj3F.svg",
      unFocusIcon: "/objectiveIcons/obj3UF.png",
    },
    {
      id: 5,
      icon: "",
      title: "Recruiting Agent",
      details:
        "Identify, engage, and attract potential real estate agents to expand your team with top talent. Recruit new agents to your team.",
      focusIcn: "/svgIcons/obj5RAF.svg",
      unFocusIcon: "/svgIcons/obj5RAU.svg",
    },
    {
      id: 7,
      icon: "",
      title: "Receptionist",
      details:
        "Greet clients, manage appointments, and ensure smooth office operations. Provide front-desk support for incoming calls.",
      focusIcn: "/svgIcons/reciptionistFC.svg",
      unFocusIcon: "/svgIcons/reciptionistUFC.svg",
    },
    {
      id: 6,
      icon: "",
      title: "Expired Listing",
      details:
        "Connect with homeowners whose listings have expired to understand their needs and offer solutions. Help relist their property and guide them toward a successful sale.",
      focusIcn: "/svgIcons/obj6FOCUS.svg",
      unFocusIcon: "/svgIcons/obj6ELU.svg",
    },
    {
      id: 8,
      icon: "",
      title: "Speed to Lead",
      details:
        "Instantly engage new leads from Zillow, Realtor.com, Facebook ads, and more the moment they enter your CRM to maximize conversion chances.",
      focusIcn: "/svgIcons/obj5RAF.svg",
      unFocusIcon: "/objectiveIcons/obj5UF.png",
    },
    {
      id: 9,
      icon: "",
      title: "FSBO (For Sale By Owner)",
      details:
        "Connect with homeowners trying to sell on their own, offering professional guidance and solutions to help them successfully close.",
      focusIcn: "/svgIcons/obj2F.svg",
      unFocusIcon: "/objectiveIcons/obj2UF.png",
    },
    {
      id: 10,
      icon: "",
      title: "Probate",
      details:
        "Reach out to property heirs navigating probate, providing support and options for handling inherited real estate during a difficult time.",
      focusIcn: "/svgIcons/obj1F.svg",
      unFocusIcon: "/objectiveIcons/obj1UF.png",
    },
    {
      id: 100,
      icon: "",
      title: "Something Else",
      details: "",
      focusIcn: "/svgIcons/obj6F.svg",
      unFocusIcon: "/objectiveIcons/obj6UF.png",
    },
  ];

  function canShowObjectives() {
    const U = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency);
    let FromAdminOrAgency = null;
    if (U) {
      const Data = JSON.parse(U);
      FromAdminOrAgency = Data.subAccountData;
    }
    // console.log("U_Ser type is", FromAdminOrAgency);
    if ((FromAdminOrAgency && FromAdminOrAgency?.userType && FromAdminOrAgency?.userType == UserTypes.RealEstateAgent) || (user && user.user.userType == UserTypes.RealEstateAgent)) {
      return true;
    } else {
      return false;
    }
  }

  function canContinue() {
    if (!user) {
      return false;
    }
    // console.log("Details ", {
    //   agentName,
    //   agentRole,
    //   agentObjective,
    //   InBoundCalls,
    //   OutBoundCalls,
    // });
    if (user.user.userType == UserTypes.RealEstateAgent) {
      if (
        agentName &&
        agentRole &&
        agentObjective &&
        (InBoundCalls || OutBoundCalls)
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      if (agentName && agentRole && (InBoundCalls || OutBoundCalls)) {
        return true;
      }
    }
    return false;
  }

  //code for selecting inbound calls
  const handleInboundCallClick = () => {
    const newInboundState = !InBoundCalls;

    // Always allow toggling OFF
    if (!newInboundState) {
      setInBoundCalls(false);
      setPendingAgentSelection(null);
      return;
    }

    // Check limits when toggling ON
    const limitResult = checkAgentLimits('inbound', newInboundState, OutBoundCalls);
    if (limitResult.showModal) {
      // Store what the user was trying to select
      setPendingAgentSelection({
        type: 'inbound',
        inbound: newInboundState,
        outbound: OutBoundCalls
      });
      return; // Don't toggle the state, just show the modal
    } else {
      setInBoundCalls(true);
    }
  };

  //code for selecting outbound calls
  const handleOutBoundCallClick = () => {
    const newOutboundState = !OutBoundCalls;

    // Always allow toggling OFF
    if (!newOutboundState) {
      setOutBoundCalls(false);
      setPendingAgentSelection(null);
      return;
    }

    // Check limits when toggling ON
    const limitResult = checkAgentLimits('outbound', InBoundCalls, newOutboundState);
    if (limitResult.showModal) {
      // Store what the user was trying to select
      setPendingAgentSelection({
        type: 'outbound',
        inbound: InBoundCalls,
        outbound: newOutboundState
      });
      return; // Don't toggle the state, just show the modal
    } else {
      setOutBoundCalls(true);
    }
  };

  // Comprehensive plan checking logic
  const checkAgentLimits = (agentType, wouldHaveInbound, wouldHaveOutbound) => {
    // console.log('🔍 [CREATE-AGENT] Checking agent limits');
    console.log("Redux user", reduxUser)

    // Use Redux as primary source, localStorage as fallback
    const planData = reduxUser?.planCapabilities ? {
      isFreePlan: isFreePlan,
      currentAgents: currentAgents,
      maxAgents: maxAgents,
      costPerAdditionalAgent: reduxUser?.planCapabilities?.costPerAdditionalAgent || 10
    } : {
      isFreePlan: (() => {
        const planType = user?.user?.plan?.type?.toLowerCase();
        if (planType?.includes('free')) return true;
        if (user?.user?.planCapabilities?.maxAgents > 1) return false;
        return user?.user?.plan === null || user?.user?.plan?.price === 0;
      })(),
      currentAgents: user?.user?.currentUsage?.maxAgents || 0,
      maxAgents: user?.user?.planCapabilities?.maxAgents || 1,
      costPerAdditionalAgent: user?.user?.planCapabilities?.costPerAdditionalAgent || 10
    };

    console.log("Plan data is", planData)

    // Calculate agents that would be created
    let agentsToCreate = 0;
    if (wouldHaveInbound) agentsToCreate++;
    if (wouldHaveOutbound) agentsToCreate++;

    // console.log('📊 [CREATE-AGENT] Agent calculation complete');

    // FREE PLAN LOGIC
    if (planData.isFreePlan) {
      // console.log('🆓 [CREATE-AGENT] Free plan detected');

      // If user already has 1 agent, don't allow any more
      if (planData.currentAgents >= 1) {
        // console.log('🚫 [CREATE-AGENT] Free plan user has reached limit');
        setModalDesc("The free plan only allows for 1 AI Agent.");
        setShowUnclockModal(true);
        return { showModal: true };
      }

      // If user is trying to select both types at once on free plan
      if (agentsToCreate > 1) {
        // console.log('🚫 [CREATE-AGENT] Free plan user trying to select both agent types');
        setModalDesc("The free plan only allows for 1 AI Agent.");
        setShowUnclockModal(true);
        return { showModal: true };
      }

      return { showModal: false };
    }

    // PAID PLAN LOGIC
    // console.log('💰 [CREATE-AGENT] Paid plan detected');

    // Check if user has already reached their limit
    if (planData.currentAgents >= planData.maxAgents) {
      // console.log('🚫 [CREATE-AGENT] Paid plan user has reached limit');
      setShowMoreAgentsModal(true);
      return { showModal: true };
    }

    // Check if the selection would exceed the limit
    if (planData.currentAgents + agentsToCreate > planData.maxAgents) {
      // console.log('🚫 [CREATE-AGENT] Selection would exceed limit');
      setShowMoreAgentsModal(true);
      return { showModal: true };
    }

    // console.log('✅ [CREATE-AGENT] Selection allowed');
    return { showModal: false };
  };

  // Function to apply the pending agent selection when user agrees to extra cost
  const applyPendingSelection = () => {
    if (pendingAgentSelection) {
      // console.log('💰 [CREATE-AGENT] Applying pending selection with extra cost');
      setInBoundCalls(pendingAgentSelection.inbound);
      setOutBoundCalls(pendingAgentSelection.outbound);
      setHasAgreedToExtraCost(true);
      setPendingAgentSelection(null);
    }
  };

  // Function to refresh user data after plan upgrade
  const refreshUserData = async () => {
    try {
      // console.log('🔄 [CREATE-AGENT] Refreshing user data after plan upgrade...');
      const profileResponse = await getProfileDetails();

      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data;
        const localData = JSON.parse(localStorage.getItem("User") || '{}');

        // console.log('🔄 [CREATE-AGENT] Fresh user data received after upgrade');

        // Update Redux with fresh data
        setReduxUser({
          token: localData.token,
          user: freshUserData
        });

        // Update local state as well
        setUser({
          token: localData.token,
          user: freshUserData
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error('🔴 [CREATE-AGENT] Error refreshing user data:', error);
      return false;
    }
  };


  //code for creating agent api
  const handleBuildAgent = async () => {
    // return
    try {
      setBuildAgentLoader(true);
      setLoaderModal(true);
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      let LocalDetails = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        // //console.log;
        AuthToken = UserDetails.token;
        LocalDetails = UserDetails;
      }
      // return
      // //console.log;
      const ApiPath = Apis.buildAgent;
      // //console.log;
      const formData = new FormData();

      //code for sending the user  id if from agency subaccount flow
      let userId = null;

      if (selectedUser) {

        console.log("Subaccount data recieved on createagent_1 screen is", selectedUser);
        userId = selectedUser.subAccountData.id;
      }

      if (userId) {
        console.log("User id to create new agent is", userId);
        formData.append("userId", userId);
      }

      formData.append("name", agentName);
      formData.append("agentRole", agentRole);
      let agentType = null;
      if (InBoundCalls && OutBoundCalls) {
        agentType = "both";
      } else if (InBoundCalls) {
        agentType = "inbound";
      } else if (OutBoundCalls) {
        agentType = "outbound";
      }
      formData.append("agentType", agentType);

      // Include extra cost agreement information if user agreed to pay additional
      if (hasAgreedToExtraCost) {
        formData.append("hasAgreedToExtraCost", "true");
        formData.append("extraCostAmount", reduxUser?.planCapabilities?.costPerAdditionalAgent ||
          user?.user?.planCapabilities?.costPerAdditionalAgent ||
          10);
        // console.log('💰 [CREATE-AGENT] Including extra cost agreement in API call');
      }

      if (selectedStatus) {
        if (selectedStatus.id === 5) {
          formData.append("status", otherStatus);
        } else {
          formData.append("status", selectedStatus.title);
        }
      } else {
      }
      // return;
      if (addressValue) {
        formData.append("address", addressValue);
      }
      if (!canShowObjectives()) {
        //if the user type is not real estate then we don't show objectives to user
        formData.append("agentObjective", "others");
        formData.append("agentObjectiveDescription", "");
        formData.append("agentObjectiveId", 100);
      } else if (agentObjective.id === 100) {
        formData.append("agentObjective", "others");
        formData.append("agentObjectiveDescription", otherObjVal);
        formData.append("agentObjectiveId", 100);
      } else {
        formData.append("agentObjective", agentObjective.title);
        formData.append("agentObjectiveDescription", agentObjective.details);
        formData.append("agentObjectiveId", agentObjective.id);
      }

      // //console.log;
      for (let [key, value] of formData.entries()) {
        console.log(`${key} = ${value}`);
      }

      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
        },
      });

      if (response) {
        // //console.log;
        setIsVisible(true);
        if (response.data.status === true) {
          console.log("Response of add new agent is", response.data);
          setSnackMessage("Agent created successfully.");
          setMsgType(SnackbarTypes.Success);
          localStorage.setItem(
            PersistanceKeys.LocalSavedAgentDetails,
            JSON.stringify(response.data.data)
          );

          let AT = { agentType, agentName };
          localStorage.setItem("agentType", JSON.stringify(AT));

          const L = localStorage.getItem("isFromCheckList");

          const localData = localStorage.getItem("User");
          if (localData) {
            let D = JSON.parse(localData);
            D.user.checkList.checkList.agentCreated = true;
            localStorage.setItem("User", JSON.stringify(D));
          }
          window.dispatchEvent(
            new CustomEvent("UpdateCheckList", { detail: { update: true } })
          );
          handleContinue();
          // }
        } else if (response.data.status === false) {
          setSnackMessage("Agent creation failed!");
          setMsgType(SnackbarTypes.Error);
          setBuildAgentLoader(false);
        }
      }
    } catch (error) {
      // console.error("Error occured in build agent api is: ----", error);
      setLoaderModal(false);
      setBuildAgentLoader(false);
    } finally {
    }
  };

  //code to select the status
  const handleSelectStatus = (item) => {
    if (item.id === 5) {
      setShowSomtthingElse(true);
    } else {
      setShowSomtthingElse(false);
    }
    setSelectedStatus((prevId) => (prevId === item ? null : item));
  };

  // Removed Google Places service - using simple string input

  // Simple address input handler
  const handleAddressChange = (evt) => {
    setAddressValue(evt.target.value);
  };

  const status = [
    {
      id: 1,
      title: "Coming soon",
    },
    {
      id: 2,
      title: "Just sold",
    },
    {
      id: 3,
      title: "Just listed",
    },
    {
      id: 4,
      title: "In escrow",
    },
    {
      id: 5,
      title: "Something else",
    },
  ];

  const styles = {
    headingStyle: {
      fontSize: 14,
      fontWeight: "600",
    },
    inputStyle: {
      fontSize: 13,
      fontWeight: "400",
      width: "95%",
    },
    headingTitle: {
      fontSize: 13,
      fontWeight: "700",
      width: "95%",
    },
    modalsStyle: {
      height: "auto",
      bgcolor: "transparent",
      // p: 2,
      mx: "auto",
      my: "50vh",
      transform: "translateY(-55%)",
      borderRadius: 2,
      border: "none",
      outline: "none",
    },
  };

  return (
    <div
      style={{ width: "100%" }}
      className="overflow-y-hidden flex flex-row justify-center items-center  w-full"
    >
      <div
        className=" sm:rounded-2xl w-full md:w-10/12 h-[90vh] flex flex-col items-center"
        style={{ scrollbarWidth: "none", backgroundColor: "#ffffff" }} // overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
      >
        <AgentSelectSnackMessage
          message={snackMessage}
          type={msgType}
          isVisible={isVisible}
          hide={() => {
            setIsVisible(false);
            setSnackMessage("");
            setMsgType(null);
          }}
        />

        <div className="w-full h-[90%]">
          {/* Video card */}

          <IntroVideoModal
            open={introVideoModal}
            onClose={() => setIntroVideoModal(false)}
            videoTitle="Learn about getting started"
            videoUrl={HowtoVideos.GettingStarted}
          />

          {/* header */}
          <div className="h-[10%]">
            <Header />
          </div>
          {/* Body */}
          <div
            className="-ml-4 lg:flex hidden  xl:w-[350px] lg:w-[350px]"
            style={{
              position: "absolute",
              // left: "18%",
              // translate: "-50%",
              // left: "14%",
              top: "20%",
              // backgroundColor: "red"
            }}
          >
            <VideoCard
              duration="1 min 47 sec"
              horizontal={false}
              playVideo={() => {
                setIntroVideoModal(true);
              }}
              title="Learn about getting started"
            />
          </div>
          <div className="flex flex-col items-center px-4 w-full h-[90%]">
            <button
              className="mt-6 w-11/12 md:text-4xl text-lg font-[700]"
              style={{ textAlign: "center" }}
            // onClick={handleContinue}
            >
              Get started with your AI agent
            </button>
            <div className="w-full flex flex-col  items-center max-h-[90%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple">
              <div
                className="mt-8 w-6/12  gap-4 flex flex-col  px-2"
                style={{ scrollbarWidth: "none" }}
              >
                <div
                  style={styles.headingStyle}
                  className="flex flex-row items-center gap-2"
                // onClick={handleContinue}
                >
                  {`What's this AI agent's name?`}
                  <div
                    aria-owns={open ? "mouse-over-popover" : undefined}
                    aria-haspopup="true"
                    onMouseEnter={handlePopoverOpen}
                    onMouseLeave={handlePopoverClose}
                    style={{ cursor: "pointer" }}
                  >
                    <Image
                      src={"/svgIcons/infoIcon.svg"}
                      height={20}
                      width={20}
                      alt="*"
                    />
                  </div>
                </div>
                {/* Info popover */}
                <Popover
                  id="mouse-over-popover"
                  sx={{ pointerEvents: "none" }}
                  open={open}
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "center",
                  }}
                  transformOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                  }}
                  onClose={handlePopoverClose}
                  disableRestoreFocus
                >
                  <div className="flex flex-row items-center px-2 h-[40px] gap-2">
                    <Image
                      src={"/svgIcons/infoIcon.svg"}
                      height={20}
                      width={20}
                      alt="*"
                    />
                    <div style={{ fontWeight: "600", fontSize: 15 }}>
                      Your AI will identify itself by this name
                    </div>
                  </div>
                </Popover>
                <input
                  placeholder="Ex: Ana's AI, Ana.ai, Ana's Assistant"
                  className="border rounded p-3 outline-none focus:outline-none focus:ring-0"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  enterKeyHint="done"
                  style={{
                    ...styles.inputStyle,
                    border: "1px solid #00000020",
                  }}
                  value={agentName}
                  onChange={(e) => {
                    setAgentName(e.target.value);
                  }}
                />

                <div className="mt-2" style={styles.headingStyle}>
                  {`What's this AI agent's task?`}
                </div>

                <div className="sm:flex sm:flex-row items-center gap-4">
                  <div
                    className="flex flex-row cursor-pointer items-center justify-center gap-2 h-[60px] w-full sm:w-[240px] px-6"
                    style={{
                      borderRadius: "23px",
                      border: OutBoundCalls
                        ? "2px solid #7902DF"
                        : "2px solid #00000010",
                    }}
                    onClick={handleOutBoundCallClick}
                  >
                    {OutBoundCalls ? (
                      <Image
                        src={"/svgIcons/callOutFocus.svg"}
                        height={24}
                        width={24}
                        alt="*"
                      />
                    ) : (
                      <Image
                        src={"/assets/callOut.png"}
                        height={24}
                        width={24}
                        alt="*"
                      />
                    )}
                    <div
                      className={`text-start ms-2 sm:text-center sm:ms-0`} // transition-all duration-400 ease-in-out transform active:scale-90
                      style={{
                        ...styles.inputStyle,
                        // transition: "0.4s ease",
                        // scale: "0.9"
                      }}
                    >
                      Making Outbound Calls
                    </div>
                  </div>
                  <div
                    className="flex flex-row cursor-pointer items-center justify-center gap-2  h-[60px] sm:mt-0 mt-4 w-full sm:w-[240px] px-6"
                    style={{
                      borderRadius: "23px",
                      border: InBoundCalls
                        ? "2px solid #7902DF"
                        : "2px solid #00000010",
                    }}
                    onClick={handleInboundCallClick}
                  >
                    {InBoundCalls ? (
                      <Image
                        src={"/svgIcons/callInFocus.svg"}
                        height={24}
                        width={24}
                        alt="*"
                      />
                    ) : (
                      <Image
                        src={"/assets/callIn.png"}
                        height={24}
                        width={24}
                        alt="*"
                      />
                    )}
                    <div
                      className="text-start ms-2 sm:text-center sm:ms-0"
                      style={styles.inputStyle}
                    >
                      Taking Inbound Calls
                    </div>
                  </div>
                </div>

                <div className="mt-2" style={styles.headingStyle}>
                  {`What's this AI agent's title?`}
                </div>
                <input
                  autoComplete="off"
                  autoCorrect="on"
                  spellCheck="true"
                  enterKeyHint="done"
                  placeholder="Ex: Senior Property Acquisition Specialist"
                  className="border rounded p-3 outline-none focus:outline-none focus:ring-0"
                  style={{
                    ...styles.inputStyle,
                    border: "1px solid #00000020",
                  }}
                  value={agentRole}
                  onChange={(e) => {
                    setAgentRole(e.target.value);
                  }}
                />

                {canShowObjectives() && (
                  <div className="mt-2" style={styles.headingStyle}>
                    {`What's this AI agent's primary objective during the call?`}
                  </div>
                )}

                {canShowObjectives() && (
                  <div style={styles.inputStyle}>
                    Select only one. You can create new agents to dedicate them
                    to other objectives.
                  </div>
                )}
                {canShowObjectives() && (
                  <div className="flex flex-wrap">
                    {AgentObjective.map((item) => (
                      <div
                        key={item.id}
                        className="w-full text-start md:w-1/2 pe-2 flex py-4"
                      >
                        <button
                          className="border-2 w-full rounded-2xl text-start p-4 h-full flex flex-col justify-between outline-none"
                          onClick={() => {
                            handleToggleClick(item);
                          }}
                          style={{
                            borderColor:
                              item.id === toggleClick ? "#7902DF" : "",
                            backgroundColor:
                              item.id === toggleClick ? "#402FFF10 " : "",
                          }}
                        >
                          {item.id === toggleClick ? (
                            <Image
                              src={item.focusIcn}
                              height={30}
                              width={30}
                              alt="*"
                            />
                          ) : (
                            <Image
                              src={item.unFocusIcon}
                              height={30}
                              width={30}
                              alt="*"
                            />
                          )}
                          <div className="mt-8" style={styles.headingTitle}>
                            {item.title}
                          </div>
                          <div
                            className="mt-4"
                            style={{ fontSize: 11, fontWeight: "300" }}
                          >
                            {item.details}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {showOtherObjective && (
                  <div>
                    <div style={styles.headingStyle}>{`Agent's Objective`}</div>
                    {/* <input ref={bottomRef}
                                            placeholder="Type Here.... "
                                            className='border   rounded p-3 outline-none w-full mt-1 mx-2'
                                            style={styles.inputStyle}
                                            value={otherObjVal}
                                            onChange={(e) => { setOtherObjVal(e.target.value) }}
                                        /> */}
                    <input
                      ref={bottomRef}
                      // autoComplete="off"
                      // autoCorrect="off"
                      // spellCheck="false"
                      enterKeyHint="done"
                      placeholder="Type Here...."
                      className="border w-6/12 rounded p-1 outline-none w-full mt-1 mx-2 mb-2 focus:outline-none focus:ring-0"
                      style={{
                        ...styles.inputStyle,
                        border: "1px solid #00000020",
                      }}
                      value={otherObjVal}
                      onChange={(e) => setOtherObjVal(e.target.value)}
                    />
                  </div>
                )}

                <UnlockAgentModal
                  open={showUnclockModal}
                  handleClose={(data) => {
                    if (data) {
                      console.log('data', data)
                      setSelectedUser(data)
                    }
                    setShowUnclockModal(false)
                  }}
                  desc={modalDesc}
                />

                <MoreAgentsPopup
                  open={showMoreAgentsModal}
                  onClose={() => {
                    setShowMoreAgentsModal(false);
                    setPendingAgentSelection(null); // Clear pending selection if user cancels
                  }}
                  onUpgrade={() => {
                    setShowMoreAgentsModal(false);
                    setShowUpgradePlanModal(true);
                    // Keep the pending selection so it can be applied after upgrade
                    // console.log('🔄 [CREATE-AGENT] User chose to upgrade plan');
                  }}
                  onAddAgent={() => {
                    // Handle "Add Agent with price" - apply the pending selection
                    setShowMoreAgentsModal(false);
                    applyPendingSelection(); // This will set the agent states and mark as agreed to extra cost
                    // console.log('💰 [CREATE-AGENT] User chose to add agent with additional cost');
                  }}
                  costPerAdditionalAgent={
                    reduxUser?.planCapabilities?.costPerAdditionalAgent ||
                    user?.user?.planCapabilities?.costPerAdditionalAgent ||
                    10
                  }
                />

                <UpgradePlan
                  open={showUpgradePlanModal}
                  handleClose={async (result) => {
                    setShowUpgradePlanModal(false);
                    if (result) {
                      // console.log('🎉 [CREATE-AGENT] Plan upgraded successfully');
                      // Refresh user data after upgrade to get new plan capabilities
                      const refreshSuccess = await refreshUserData();
                      if (refreshSuccess) {
                        // console.log('✅ [CREATE-AGENT] User data refreshed successfully after upgrade');
                        // If there was a pending selection, apply it now with the new plan limits
                        if (pendingAgentSelection) {
                          // console.log('🔄 [CREATE-AGENT] Retrying pending selection with new plan limits...');
                          // Clear the pending selection and recheck limits
                          const pendingSelection = pendingAgentSelection;
                          setPendingAgentSelection(null);

                          // Apply the selection now that limits have been upgraded
                          setInBoundCalls(pendingSelection.inbound);
                          setOutBoundCalls(pendingSelection.outbound);
                        }
                      }
                    }
                  }}
                />

                {/* <Body /> */}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-[10%] ">
          <div>
            <ProgressBar value={33} />
          </div>

          <Footer
            handleContinue={handleBuildAgent}
            donotShowBack={true}
            registerLoader={buildAgentLoader}
            shouldContinue={!canContinue()}
          />
        </div>
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        closeAfterTransition
        BackdropProps={{
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(5px)",
          },
        }}
      >
        <Box className="lg:w-4/12 sm:w-10/12 w-full" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full h-[70vh]">
            <div
              className="w-full overflow-auto"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
              }}
            >
              <div
                className="w-full px-2 h-[90%] overflow-auto"
                style={{ scrollbarWidth: "none", zIndex: 12 }}
              >
                <div className="flex flex-row items-center justify-end w-full">
                  <button
                    className="outline-none border-none"
                    onClick={() => {
                      setShowModal(false);
                    }}
                  >
                    <Image
                      src={"/assets/crossIcon.png"}
                      height={40}
                      width={40}
                      alt="*"
                    />
                  </button>
                </div>

                <div
                  className="text-center"
                  style={{ fontWeight: "600", fontSize: 24 }}
                >
                  Community Update
                </div>

                <div style={styles.headingStyle} className="mt-4">
                  {`What's the status?`}
                </div>

                <div className="flex flex-row flex-wrap gap-4 mt-4">
                  {status.map((item) => (
                    <button
                      key={item.id}
                      onClick={(e) => {
                        handleSelectStatus(item);
                      }}
                      className="px-6 border rounded-3xl h-[65px] text-center flex flex-row justify-center items-center outline-none"
                      style={{
                        border:
                          selectedStatus?.id === item.id
                            ? "2px solid #7902DF"
                            : "",
                        backgroundColor:
                          selectedStatus?.id === item.id ? "#402FFF15" : "",
                      }}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>

                {showSomtthingElse && (
                  <div>
                    <div style={styles.headingStyle} className="mt-4">
                      {`What's that`}
                    </div>

                    <div className="mt-1">
                      <input
                        className="h-[50px] border rounded-lg outline-none border p-3 w-full focus:outline-none focus:ring-0"
                        // rows={3}
                        placeholder="Type here..."
                        value={otherStatus}
                        onChange={(e) => {
                          setOtherStatus(e.target.value);
                        }}
                        style={{
                          ...styles.inputStyle,
                          border: "1px solid #00000020",
                        }}
                      />
                    </div>
                  </div>
                )}

                <div style={styles.headingStyle} className="mt-4">
                  {`What's the address`}
                </div>
                {/* Simple address input */}
                <div className="mt-1 pb-4">
                  <input
                    className="w-full h-[50px] rounded-lg outline-none focus:ring-0 px-4"
                    style={{ border: "1px solid #00000020" }}
                    placeholder="Enter property address..."
                    value={addressValue}
                    onChange={handleAddressChange}
                  />
                </div>

              </div>

              <div
                className="w-full flex flex-row items-center justify-center"
                style={{ position: "absolute", bottom: 0, left: 0 }}
              >
                <button
                  className="text-white w-11/12 h-[50px] rounded-lg bg-purple mb-8"
                  onClick={() => {
                    setShowModal(false);
                  }}
                >
                  Continue
                </button>
              </div>

              {/* Can be use full to add shadow
                            <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>

      <LoaderAnimation loaderModal={loaderModal} />


      {/* <Modal
                open={loaderModal}
                // onClose={() => loaderModal(false)}
                closeAfterTransition
                BackdropProps={{
                    sx: {
                        backgroundColor: "#00000020",
                        // //backdropFilter: "blur(5px)",
                    },
                }}
            >
                <Box className="lg:w-4/12 sm:w-7/12 w-8/12" sx={styles.modalsStyle}>
                    <div className="flex flex-row justify-center w-full h-[65vh]">
                        <div
                            className="w-full"
                            style={{
                                backgroundColor: "transparent",
                                padding: 20,
                                borderRadius: "13px",
                            }}
                        >

                            <div className='flex flex-row items-center justify-center h-full'>
                                <CircularProgress size={200} thickness={1} />
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal> */}
    </div>
  );
};

export default CreateAgent1;
