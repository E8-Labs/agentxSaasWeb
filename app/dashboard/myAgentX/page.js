"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Button,
  Modal,
  Box,
  Drawer,
  Snackbar,
  Fade,
  Alert,
  CircularProgress,
  Popover,
  Select,
  FormControl,
  MenuItem,
  InputLabel,
  Menu,
  Avatar,
  Tooltip,
} from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import { Plus } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import moment from "moment";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { GreetingTagInput } from "@/components/pipeline/tagInputs/GreetingTagInput";
import { PromptTagInput } from "@/components/pipeline/tagInputs/PromptTagInput";
import KYCs from "@/components/pipeline/KYCs";
import Objection from "@/components/pipeline/advancedsettings/Objection";
import GuarduanSetting from "@/components/pipeline/advancedsettings/GuardianSetting";
import PiepelineAdnStage from "@/components/dashboard/myagentX/PiepelineAdnStage";
import voicesList from "@/components/createagent/Voices";
import UserCalender from "@/components/dashboard/myagentX/UserCallender";
// import LeadScoringTab from "@/components/dashboard/myagentX/LeadScoringTab";
import AddScoringModal from "@/components/modals/add-scoring-modal";
import CircularLoader from "@/utilities/CircularLoader";
import imageCompression from "browser-image-compression";
import NotficationsDrawer from "@/components/notofications/NotficationsDrawer";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "@/components/dashboard/leads/AgentSelectSnackMessage";
import MoreAgentsPopup from "@/components/dashboard/MoreAgentsPopup";
import { GetFormattedDateString } from "@/utilities/utility";
import {
  findLLMModel,
  formatPhoneNumber,
  getAgentImage,
  getAgentProfileImage,
  getAgentsListImage,
} from "@/utilities/agentUtilities";
import { getLocalLocation } from "@/components/onboarding/services/apisServices/ApiService";
import ClaimNumber from "@/components/dashboard/myagentX/ClaimNumber";
import {
  AgentLLmModels,
  Constants,
  fromatMessageName,
  HowtoVideos,
  HowToVideoTypes,
  models,
  PersistanceKeys,
} from "@/constants/Constants";
import IntroVideoModal from "@/components/createagent/IntroVideoModal";
import LoaderAnimation from "@/components/animations/LoaderAnimation";
import { getVideoUrlByType, getTutorialByType } from "@/utils/tutorialVideos";
import Link from "next/link";

import { ArrowUpRight } from "@phosphor-icons/react";
import VideoCard from "@/components/createagent/VideoCard";
import { UserTypes } from "@/constants/UserTypes";
import Knowledgebase from "@/components/dashboard/myagentX/Knowledgebase";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import { PauseCircle } from "@mui/icons-material";
import { EditPhoneNumberModal } from "@/components/dashboard/myagentX/EditPhoneNumberPopup";
import VoiceMailTab from "../../../components/dashboard/myagentX/VoiceMailTab";
import { AgentLanguagesList } from "@/utilities/AgentLanguages";
import NoAgent from "@/components/dashboard/myagentX/NoAgent";
import AgentsListPaginated from "@/components/dashboard/myagentX/AgentsListPaginated";
import AgentInfoCard from "@/components/dashboard/myagentX/AgentInfoCard";
import { AuthToken } from "@/components/agency/plan/AuthDetails";
import PipelineLoading from "@/components/dashboardPipeline/PipelineLoading";
import MyAgentXLoader from "@/components/loaders/MyAgentXLoader";
import DashboardSlider from "@/components/animations/DashboardSlider";

import dynamic from "next/dynamic";
import DuplicateConfirmationPopup from "@/components/dashboard/myagentX/DuplicateConfirmationPopup";
import TestEmbed from "@/app/test-embed/page";
import UpgradeModal from "@/constants/UpgradeModal";
import UpgardView from "@/constants/UpgardView";
import { getUserLocalData, UpgradeTagWithModal } from "@/components/constants/constants";
import AskToUpgrade from "@/constants/AskToUpgrade";
import getProfileDetails from "@/components/apis/GetProfile";
import { useUser } from "@/hooks/redux-hooks";
import { usePlanCapabilities } from "@/hooks/use-plan-capabilities";
import WebAgentModal from "@/components/dashboard/myagentX/WebAgentModal";
import NewSmartListModal from "@/components/dashboard/myagentX/NewSmartListModal";
import AllSetModal from "@/components/dashboard/myagentX/AllSetModal";
import EmbedModal from "@/components/dashboard/myagentX/EmbedModal";
import EmbedSmartListModal from "@/components/dashboard/myagentX/EmbedSmartListModal";
import { DEFAULT_ASSISTANT_ID } from "@/components/askSky/constants";
import CloseBtn from "@/components/globalExtras/CloseBtn";
import { fetchTemplates } from "@/services/leadScoringSerevices/FetchTempletes";
import LeadScoring from "@/components/dashboard/myagentX/leadScoring/LeadScoring";
import UpgradePlan from "@/components/userPlans/UpgradePlan";
import ActionsTab from "@/components/dashboard/myagentX/ActionsTab";
import { isPlanActive } from "@/components/userPlans/UserPlanServices";
// import EmbedVapi from "@/app/embed/vapi/page";
// import EmbedWidget from "@/app/test-embed/page";


const DuplicateButton = dynamic(
  () => import("@/components/animation/DuplicateButton"),
  {
    ssr: false,
  }
);
function Page() {
  // Redux hooks for plan management
  const { user: reduxUser, isAuthenticated, setUser: setReduxUser } = useUser();

  // Add flags to prevent infinite loops
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // useEffect(() => {
  //   console.log("reduxUser on myAgentX page", reduxUser)
  // }, [reduxUser])
  const {
    canCreateAgent,
    allowVoicemail,
    allowToolsAndActions,
    allowKnowledgeBases,
    allowLiveCallTransfer,
    isFeatureAllowed,
    getUpgradeMessage,
    isFreePlan,
    currentAgents,
    maxAgents
  } = usePlanCapabilities();

  let baseUrl =
    process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
      ? "https://app.assignx.ai/"
      : "https://dev.assignx.ai/";

  let demoBaseUrl =
    process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
      ? "https://apimyagentx.com/agentx/"
      : "https://apimyagentx.com/agentxtest/";


  const timerRef = useRef();
  const fileInputRef = useRef([]);
  const searchTimeoutRef = useRef(null);
  let attempts = 0;
  const maxAttempts = 10;
  // const fileInputRef = useRef(null);
  const router = useRouter();
  let tabs = ["Agent Info", "Actions", "Pipeline", "Knowledge"];
  const [AgentMenuOptions, setAgentMenuOptions] = useState(tabs);
  const [openTestAiModal, setOpenTestAiModal] = useState(false);
  const [name, setName] = useState("");
  //code for phonenumber
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [locationLoader, setLocationLoader] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [address, setAddress] = useState("");
  // const [budget, setBudget] = useState("");
  const [showDrawerSelectedAgent, setShowDrawerSelectedAgent] = useState(null);
  const [showMainAgent, setShowMainAgent] = useState(null);
  //calender details of selected agent
  const [calendarDetails, setCalendarDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("Agent Info");
  const [showAddScoringModal, setShowAddScoringModal] = useState(false);
  const [mainAgentsList, setMainAgentsList] = useState([]);
  const [canGetMore, setCanGetMore] = useState(false);
  const [paginationLoader, setPaginationLoader] = useState(false);
  const [oldAgentsList, setOldAgentsList] = useState([]);
  //supporting variable
  const [canKeepLoading, setCanKeepLoading] = useState(false);
  const [initialLoader, setInitialLoader] = useState(true);

  //code for assigning the umber
  // const []
  const [assignNumber, setAssignNumber] = React.useState("");
  const [previousNumber, setPreviousNumber] = useState([]);
  const selectRef = useRef();
  const [openCalimNumDropDown, setOpenCalimNumDropDown] = useState(false);
  const [showGlobalBtn, setShowGlobalBtn] = useState(true);
  const [showReassignBtn, setShowReassignBtn] = useState(false);
  const [showReassignBtnWidth, setShowReassignBtnWidth] = useState(false);
  const [reassignLoader, setReassignLoader] = useState(null);
  const [showClaimPopup, setShowClaimPopup] = useState(false);
  const [findeNumberLoader, setFindeNumberLoader] = useState(false);
  const [foundeNumbers, setFoundeNumbers] = useState([]);
  const [findNumber, setFindNumber] = useState("");
  const [purchaseLoader, setPurchaseLoader] = useState(false);
  const [openPurchaseSuccessModal, setOpenPurchaseSuccessModal] =
    useState(false);
  const [selectedPurchasedNumber, setSelectedPurchasedNumber] = useState(null);
  const [selectedPurchasedIndex, setSelectedPurchasedIndex] = useState(null);
  const [assignLoader, setAssignLoader] = useState(false);

  //code for assign number confirmation model
  const [showConfirmationModal, setShowConfirmationModal] = useState(null);

  //code for user pipelines
  const [UserPipeline, setUserPipeline] = useState(null);

  //code for main agent id for update agent api
  const [MainAgentId, setMainAgentId] = useState("");

  //image variable
  const [selectedImages, setSelectedImages] = useState({});
  const [selectedAgent, setSelectedAgent] = useState(null);
  //del loader
  const [DelLoader, setDelLoader] = useState(false);
  const [delAgentModal, setDelAgentModal] = useState(false);
  //if agent have no number assigned
  const [ShowWarningModal, setShowWarningModal] = useState(null);
  //code for view script
  const [showScriptModal, setShowScriptModal] = useState(null);
  const [showScript, setShowScript] = useState(false);
  const [SeledtedScriptKYC, setSeledtedScriptKYC] = useState(false);
  //show objection and guadrails
  const [showObjection, setShowObjection] = useState(false);
  const [showGuardrails, setShowGuardrails] = useState(false);
  const [showObjectives, setShowObjectives] = useState(true);
  //code for outboundObjective
  const [objective, setObjective] = useState("");
  const [oldObjective, setOldObjective] = useState("");
  //code for objective
  // const [objective, setobjective] = useState("");
  // const [inboundOldObjective, setInboundOldObjective] = useState("");
  const [showObjectionsSaveBtn, setShowObjectionsSaveBtn] = useState(false);
  const [SeledtedScriptAdvanceSetting, setSeledtedScriptAdvanceSetting] =
    useState(false);
  const [introVideoModal, setIntroVideoModal] = useState(false);
  const [introVideoModal2, setIntroVideoModal2] = useState(false);
  const [kycsData, setKycsData] = useState(null);
  //greeting tag input
  const [greetingTagInput, setGreetingTagInput] = useState("");
  const [oldGreetingTagInput, setOldGreetingTagInput] = useState("");
  const [scrollOffset, setScrollOffset] = useState({
    scrollTop: 0,
    scrollLeft: 0,
  });
  const containerRef = useRef(null); // Ref to the scrolling container
  const [showSuccessSnack, setShowSuccessSnack] = useState(null);
  const [showErrorSnack, setShowErrorSnack] = useState(null);

  //for updated snack
  const [isVisibleSnack, setIsVisibleSnack] = useState(null);
  const [isVisibleSnack2, setIsVisibleSnack2] = useState(null);

  const [testAIloader, setTestAIloader] = useState(false);
  const [uniqueColumns, setUniqueColumns] = useState([]);
  const [showMoreUniqueColumns, setShowMoreUniqueColumns] = useState(false);
  const [showSaveChangesBtn, setShowSaveChangesBtn] = useState(false);
  const [UpdateAgentLoader, setUpdateAgentLoader] = useState(false);
  const [fetureType, setFetureType] = useState("");
  const [moreAgentsPopupType, setMoreAgentsPopupType] = useState("");

  //agent KYC's
  const [kYCList, setKYCList] = useState([]);

  //prompt tag input
  const [scriptTagInput, setScriptTagInput] = useState("");
  const [OldScriptTagInput, setOldScriptTagInput] = useState("");

  //code for testing the ai
  let callScript = null;
  let keys = [];

  //variable string the keys
  const [scriptKeys, setScriptKeys] = useState([]);
  //variable for input field value
  const [inputValues, setInputValues] = useState({});
  //code for storing the agents data
  const [hasMoreAgents, setHasMoreAgents] = useState(true);
  const [agentsListSeparated, setAgentsListSeparated] = useState([]); //agentsListSeparated: Inbound and outbound separated. Api gives is under one main agent
  const [agentsList, setAgentsList] = useState([]);
  //agents before search
  const [agentsBeforeSearch, setAgentsBeforeSearch] = useState([]);

  const [actionInfoEl, setActionInfoEl] = React.useState(null);
  const [hoveredIndexStatus, setHoveredIndexStatus] = useState(null);
  const [hoveredIndexAddress, setHoveredIndexAddress] = useState(null);

  //code for image select and drag and drop
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedImage2, setSelectedImage2] = useState(null);
  const [dragging, setDragging] = useState(false);

  const [globalLoader, setGlobalLoader] = useState(false);

  const [showVoiceLoader, setShowVoiceLoader] = useState(false);
  const [showPhoneLoader, setShowPhoneLoader] = useState(false);

  //all calenders added by user
  const [previousCalenders, setPreviousCalenders] = useState([]);

  const [user, setUser] = useState(null);

  // console.log('user', user)

  const [showRenameAgentPopup, setShowRenameAgentPopup] = useState(false);
  const [renameAgent, setRenameAgent] = useState("");
  const [selectedRenameAgent, setSelectedRenameAgent] = useState("");
  const [renameAgentLoader, setRenameAgentLoader] = useState(false);

  const [openGptManu, setOpenGptManu] = useState("");
  const [selectedGptManu, setSelectedGptManu] = useState(models[0]);

  const [voiceExpressiveness, setVoiceExpressiveness] = useState("");
  const [startingPace, setStartingPace] = useState("");
  const [patienceValue, setPatienceValue] = useState("");
  const [languageValue, setLanguageValue] = useState("");

  const [callRecordingPermition, setCallRecordingPermition] = useState("");

  const [showCallRecordingLoader, setShowCallRecordingLoader] = useState(false);
  const [showStartingPaceLoader, setShowStartingPaceLoader] = useState(false);
  const [showPatienceLoader, setShowPatienceLoader] = useState(false);
  const [showLanguageLoader, setShowLanguageLoader] = useState(false);
  const [showVoiceExpressivenessLoader, setShowVoiceExpressivenessLoader] =
    useState(false);

  const [showModelLoader, setShowModelLoader] = useState(false);

  const [preview, setPreview] = useState(null);
  const [audio, setAudio] = useState(null);

  const [showEditNumberPopup, setShowEditNumberPopup] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState("");

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [duplicateLoader, setDuplicateLoader] = useState(false);

  //nedd help popup
  const [needHelp, setNeedHelp] = useState(false);

  //it saves previous list of agents before search
  const [allAgentsList, setAllAgentsList] = useState([]);

  const [showDuplicateConfirmationPopup, setShowDuplicateConfirmationPopup] = useState(false);

  const [showEmbed, setShowEmbed] = useState(false);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showUpgradePlanModal, setShowUpgradePlanModal] = useState(false)
  const [showMoreAgentsPopup, setShowMoreAgentsPopup] = useState(false)
  const [title, setTitle] = useState(null)
  const [subTitle, setSubTitle] = useState(null)

  const [showAskToUpgradeModal, setShowAskToUPgradeModal] = useState(false)

  // Web Agent Modal states
  const [showWebAgentModal, setShowWebAgentModal] = useState(false)
  const [showNewSmartListModal, setShowNewSmartListModal] = useState(false)
  const [showAllSetModal, setShowAllSetModal] = useState(false)
  const [selectedAgentForWebAgent, setSelectedAgentForWebAgent] = useState(null)

  // Embed Modal states
  const [showEmbedModal, setShowEmbedModal] = useState(false)
  const [showEmbedSmartListModal, setShowEmbedSmartListModal] = useState(false)
  const [showEmbedAllSetModal, setShowEmbedAllSetModal] = useState(false)
  const [selectedAgentForEmbed, setSelectedAgentForEmbed] = useState(null)
  const [embedCode, setEmbedCode] = useState('')
  const [showSnackMsg, setShowSnackMsg] = useState({
    type: SnackbarTypes.Success,
    message: "",
    isVisible: false
  })
  const [featureTitle, setFeatureTitle] = useState("")
  const [selectedSmartList, setSelectedSmartList] = useState('');




  // Function to refresh user data after plan upgrade
  const refreshUserData = async () => {
    try {
      console.log('🔄 [UPGRADE-TAG] Refreshing user data after plan upgrade...');
      const profileResponse = await getProfileDetails();

      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data;
        const localData = JSON.parse(localStorage.getItem("User") || '{}');

        console.log('🔄 [UPGRADE-TAG] Fresh user data received after upgrade');

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


  const getKyc = async () => {
    try {
      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        // //console.log;
        AuthToken = Data.token;
      }

      let MainAgentData = null;
      const mainAgentData = localStorage.getItem("agentDetails");
      if (mainAgentData) {
        const Data = JSON.parse(mainAgentData);
        //console.log;
        MainAgentData = Data.id;
      }

      // //console.log;

      let ApiPath = null;

      if (MainAgentData) {
        ApiPath = `${Apis.getKYCs}?mainAgentId=${MainAgentId}`;

      } else {
        ApiPath = `${Apis.getKYCs}?mainAgentId=${MainAgentId}`;
      }

      // //console.log;
      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      console.log("response of get kycs", response)
      if (response) {
        setKycsData(response.data.data);
      } else {
        // //console.log
      }
    } catch (error) {
      // console.error("Error occured in gett kyc api is :--", error);
    } finally {
      // //console.log;
    }
  };



  // Web Agent Modal handlers
  const handleWebAgentClick = (agent) => {

    if (reduxUser?.agencyCapabilities?.allowEmbedAndWebAgents === false) {
      setShowUpgradeModal(true)
      setTitle("Unlock your Web Agent")
      setSubTitle("Bring your AI agent to your website allowing them to engage with leads and customers")
      setFeatureTitle("EmbedAgents");
    } else {
      if (reduxUser?.planCapabilities?.allowEmbedAndWebAgents === false) {
        setShowUpgradeModal(true)
        setTitle("Unlock your Web Agent")
        setSubTitle("Bring your AI agent to your website allowing them to engage with leads and customers")
      } else {
        setSelectedAgentForWebAgent(agent);
        setShowWebAgentModal(true);
        setFetureType("webagent")
      }
    }
  }

  const handleOpenAgentInNewTab = () => {
    let agent = {
      ...selectedAgentForWebAgent,
      smartListId: selectedSmartList
    }
    setSelectedAgentForWebAgent(agent);
    console.log('selectedAgentForWebAgent after updating', selectedAgentForWebAgent)
    showDrawerSelectedAgent.smartListId = selectedSmartList;
    console.log('showDrawerSelectedAgent after updating', showDrawerSelectedAgent)

    if (selectedAgentForWebAgent) {
      const modelId = encodeURIComponent(selectedAgentForWebAgent?.modelIdVapi || selectedAgentForWebAgent?.agentUuid || "");
      // console.log('selectedAgentForWebAgent', selectedAgentForWebAgent)
      console.log('selectedAgentForWebAgent?.modelIdVapi', selectedAgentForWebAgent?.modelIdVapi)
      console.log('selectedAgentForWebAgent?.agentUuid', selectedAgentForWebAgent?.agentUuid)
      console.log('modelId', modelId)
      const name = encodeURIComponent(selectedAgentForWebAgent?.name || "");
      // return;
      window.open(`/web-agent/${modelId}?name=${name}`, "_blank");
    }
    setShowWebAgentModal(false);
    setShowAllSetModal(true);
  };

  const handleShowNewSmartList = () => {
    setShowWebAgentModal(false);
    setShowNewSmartListModal(true);
  };

  const handleSmartListCreated = (smartListData) => {
    console.log('smartListData', smartListData)
    let agent = {
      ...selectedAgentForWebAgent,
      smartListId: smartListData.id
    }
    console.log('agent', agent)
    setSelectedAgentForWebAgent(agent);
    console.log('selectedAgentForWebAgent after updating', selectedAgentForWebAgent)
    showDrawerSelectedAgent.smartListId = smartListData.id;
    console.log('showDrawerSelectedAgent after updating', showDrawerSelectedAgent)
    setFetureType("webagent")
    setShowNewSmartListModal(false);
    setShowAllSetModal(true);
  };

  const handleCloseAllSetModal = () => {
    setShowAllSetModal(false);
    setSelectedAgentForWebAgent(null);
  };



  // Embed Modal handlers
  const handleEmbedClick = (agent) => {
    if (reduxUser?.agencyCapabilities?.allowEmbedAndWebAgents === false) {
      setShowUpgradeModal(true)
      setTitle("Unlock your Web Agent")
      setSubTitle("Bring your AI agent to your website allowing them to engage with leads and customers")
      setFeatureTitle("EmbedAgents");
    } else {
      if (reduxUser?.planCapabilities?.allowEmbedAndWebAgents === false) {
        setShowUpgradeModal(true)
        setTitle("Unlock your Web Agent")
        setSubTitle("Bring your AI agent to your website allowing them to engage with leads and customers")
      } else {
        setSelectedAgentForEmbed(agent);
        setShowEmbedModal(true);
      };
    }
  }

  const handleShowEmbedSmartList = () => {
    setShowEmbedModal(false);
    setShowEmbedSmartListModal(true);
  };

  const handleEmbedSmartListCreated = (smartListData) => {
    setShowEmbedSmartListModal(false);
    setShowEmbedAllSetModal(true);
    // Generate embed code here
    const code = `<iframe src="${baseUrl}embed/support/${selectedAgentForEmbed ? selectedAgentForEmbed?.modelIdVapi : DEFAULT_ASSISTANT_ID}" style="position: fixed; bottom: 0; right: 0; width: 320px; 
  height: 100vh; border: none; background: transparent; z-index: 
  9999; pointer-events: none;" allow="microphone" onload="this.style.pointerEvents = 'auto';">
  </iframe>`;
    setEmbedCode(code);
  };

  const handleCloseEmbedAllSetModal = () => {
    setShowEmbedAllSetModal(false);
    setSelectedAgentForEmbed(null);
    setEmbedCode('');
  };

  const playVoice = (url) => {
    if (audio) {
      audio.pause();
    }
    const ad = new Audio(url); // Create a new Audio object with the preview URL
    ad.play();
    setAudio(ad); // Play the audio
    setPreview(url);

    // Handle when the audio ends
    ad.addEventListener("ended", () => {
      setPreview(null);
    });
  };

  // const Languages  = AgentLanguagesList

  const voiceExpressivenessList = [
    {
      id: 1,
      title: "🎭 Expressive",
      value: "Expressive",
    },
    {
      id: 2,
      title: "⚖️ Balanced",
      value: "Balanced",
    },
    {
      id: 3,
      title: "😌 Calm",
      value: "Calm",
    },
  ];

  // 🐢
  const TalkingPaceList = [
    { id: 1, title: "💨 Fast", value: "Fast" },
    { id: 2, title: "⚖️ Balanced", value: "Balanced" },
    { id: 3, title: "🐢 Slow", value: "Slow" },
  ];
  const ResponseSpeedList = [
    {
      id: 1,
      title: "⚡️ Instant",
      value: "Instant",
    },
    {
      id: 2,
      title: "⏳ Short Pause",
      value: "Short Pause",
    },
    {
      id: 3,
      title: "🧘 Delayed",
      value: "Natural Conversation Flow",
    },
  ];


  // get selected agent from local if calendar added by google

  useEffect(() => {
    getKyc();
  }, [showScriptModal]);

  useEffect(() => {

    console.log("redux user", reduxUser)
    console.log("user data is", user)

    let d = localStorage.getItem(PersistanceKeys.CalendarAddedByGoogle)
    if (d) {
      let calendarAddedByGoogle = JSON.parse(d)
      if (calendarAddedByGoogle) {
        let ag = localStorage.getItem(PersistanceKeys.SelectedAgent)
        if (ag) {
          let agent = JSON.parse(ag)

          // console.log('selected agent from local is', agent)
          setShowDrawerSelectedAgent(agent)
        }
      }
    }

    // Prefetch the createagent route for faster navigation
    router.prefetch('/createagent');

    // Cleanup function for component unmount
  }, [])


  // Function to sync fresh profile data to Redux
  const syncProfileToRedux = async (skipLocalStorage = false) => {
    try {
      // console.log('🔄 [DASHBOARD] Fetching fresh profile data...');
      const profileResponse = await getProfileDetails();

      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data;
        const localData = getUserLocalData();

        // console.log('🔄 [DASHBOARD] Syncing profile to Redux - userId:', freshUserData?.id);

        // Update Redux with fresh data
        setReduxUser({
          token: localData.token,
          user: freshUserData
        });

        // Only update localStorage if not skipped (to prevent loops during initialization)
        if (!skipLocalStorage) {
          const updatedUserData = {
            token: localData.token,
            user: freshUserData
          };
          localStorage.setItem("User", JSON.stringify(updatedUserData));
          setUser(updatedUserData);
        }
      }
    } catch (error) {
      console.error('🔴 [DASHBOARD] Error syncing profile to Redux:', error);
    }
  };

  // Handle successful plan upgrade - refresh user data
  const handleUpgradeSuccess = async () => {
    // console.log('🎉 [DASHBOARD] Plan upgrade successful! Fetching fresh profile data...');

    try {
      // Always fetch fresh profile data after upgrade
      // console.log('🔄 [DASHBOARD] Calling getProfileDetails API for latest plan info...');
      const profileResponse = await getProfileDetails();

      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data;
        const localData = getUserLocalData();

        // console.log('✅ [DASHBOARD] Fresh profile data received - maxAgents:', freshUserData?.planCapabilities?.maxAgents);

        const updatedUserData = {
          token: localData.token,
          user: freshUserData
        };

        // Update both Redux and localStorage
        setReduxUser(updatedUserData);
        localStorage.setItem("User", JSON.stringify(updatedUserData));
        setUser(updatedUserData);

        // console.log('🎊 [DASHBOARD] User data successfully refreshed after upgrade!');
      } else {
        console.error('🔴 [DASHBOARD] Failed to get fresh profile data after upgrade');
      }
    } catch (error) {
      console.error('🔴 [DASHBOARD] Error refreshing user data after upgrade:', error);
    }
  };

  // Combined initialization function (merges Redux + test branch logic)
  const initializeUserData = async () => {
    // Prevent infinite loops
    if (isInitializing || hasInitialized) {
      // console.log('🛑 [DASHBOARD] Initialization already in progress or completed');
      return;
    }

    setIsInitializing(true);
    attempts++;
    // console.log(`🔄 [DASHBOARD] Initializing user data - attempt ${attempts}`);

    try {
      const data = localStorage.getItem("User");
      if (data) {
        const userData = JSON.parse(data);
        // console.log(`✅ [DASHBOARD] User found on attempt ${attempts}`);

        // Set local state (from test branch)
        setUser(userData);

        // Load into Redux if not already there (from our branch)
        if (userData && !reduxUser) {
          // console.log('🔄 [DASHBOARD] Loading localStorage to Redux');
          setReduxUser({
            token: userData.token,
            user: userData.user
          });
        }

        // Only sync profile if we haven't already initialized
        // Skip localStorage update during initialization to prevent loops
        if (!hasInitialized) {
          await syncProfileToRedux(true);
        }

        setHasInitialized(true);

      } else if (attempts < maxAttempts) {
        // console.log(`⚠️ [DASHBOARD] User not found on attempt ${attempts}, retrying in 500ms...`);
        setIsInitializing(false); // Allow retry
        setTimeout(initializeUserData, 500); // retry after 500ms
        return; // Don't set isInitializing to false at the end
      } else {
        // console.warn(`❌ [DASHBOARD] User not found in localStorage after ${attempts} attempts.`);
        setHasInitialized(true); // Prevent further retries
      }
    } catch (error) {
      console.error('🔴 [DASHBOARD] Error in initializeUserData:', error);
      setHasInitialized(true); // Prevent infinite retries on error
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    // Combined initialization: Redux + localStorage with retry logic
    // Only run once on component mount
    if (!hasInitialized && !isInitializing) {
      initializeUserData();
    }
  }, [hasInitialized, isInitializing]); // Add dependencies to prevent infinite loops
  // get selected agent from local if calendar added by google

  //printing the user object data after setting the data inside it
  // useEffect(() => {
  //   if (user) {
  //     console.log("Data stored in user variable is", user)
  //   }
  // }, [user])

  useEffect(() => {
    let d = localStorage.getItem(PersistanceKeys.CalendarAddedByGoogle);
    if (d) {
      let calendarAddedByGoogle = JSON.parse(d);
      if (calendarAddedByGoogle) {
        let ag = localStorage.getItem(PersistanceKeys.SelectedAgent);
        if (ag) {
          let agent = JSON.parse(ag);

          // console.log("selected agent from local is", agent);
          setShowDrawerSelectedAgent(agent);
        }
      }
    }
  }, []);

  //storing agents in backup variable before

  useEffect(() => {
    const updateAgentManueList = () => {
      if (showDrawerSelectedAgent?.agentType === "outbound") {
        let newTab = "Voicemail";
        if (!AgentMenuOptions.includes("Voicemail")) {
          setAgentMenuOptions((prev) => [...prev, newTab]);
        }
      } else {
        setAgentMenuOptions(tabs);
      }
      // console.log('agent type is', showDrawerSelectedAgent?.agentType)
    };
    updateAgentManueList();
  }, [showDrawerSelectedAgent]);

  //call get numbers list api
  useEffect(() => {
    if (showDrawerSelectedAgent === null) {
      getAvailabePhoneNumbers();
    }
  }, [showDrawerSelectedAgent]);

  useEffect(() => {
    const d = localStorage.getItem(PersistanceKeys.TestAiCredentials);
    if (!d) return;

    const cr = JSON.parse(d);
    // console.log("credentials from local", cr);

    setName(cr?.name || "");
    setPhone(cr?.phone || "");

    // Combine all extraColumns into one flat object
    const flatExtraColumns = {};
    if (Array.isArray(cr.extraColumns)) {
      cr.extraColumns.forEach((obj) => {
        Object.entries(obj).forEach(([key, value]) => {
          flatExtraColumns[key] = value;
        });
      });
    }

    // console.log('flatExtracolumns', flatExtraColumns)

    // Now map through current scriptKeys and set values if present
    const updatedInputValues = {};
    scriptKeys.forEach((key) => {
      if (flatExtraColumns?.hasOwnProperty(key)) {
        updatedInputValues[key] = flatExtraColumns[key];
      }
    });

    // console.log('updatedInputValues', updatedInputValues)

    setInputValues(updatedInputValues);
  }, [openTestAiModal]);

  ////// //console.log;

  //code for scroll ofset
  useEffect(() => {
    getUniquesColumn();
    getAvailabePhoneNumbers();
    let loc = getLocalLocation();
    ////// //console.log;
    setCountryCode(loc);
    ////////console.log
    const handleScroll = () => {
      ////console.log
      if (containerRef.current) {
        setScrollOffset({
          scrollTop: containerRef.current.scrollTop,
          scrollLeft: containerRef.current.scrollLeft,
        });
      } else {
        ////////console.log
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  //check if need to show the save btn or not
  useEffect(() => {
    ////// //console.log;
    ////// //console.log;
    ////console.log
    if (
      oldGreetingTagInput !== greetingTagInput ||
      OldScriptTagInput !== scriptTagInput
    ) {
      //console.log;
      //console.log

      ////console.log
      setShowSaveChangesBtn(true);
    } else {
      ////console.log
      setShowSaveChangesBtn(false);
    }
  }, [greetingTagInput, scriptTagInput]); //scriptTagInput

  useEffect(() => {
    if (objective !== oldObjective) {
      setShowObjectionsSaveBtn(true);
    } else {
      setShowObjectionsSaveBtn(false);
    }
  }, [objective]);

  //fetch local data after 500ms
  const checkUser = async () => {
    // await getProfileDetails();
    attempts++;
    // console.log(`Trying to get user - try no ${attempts}`);

    const data = localStorage.getItem("User");
    let userData = null;
    if (data) {
      // console.log(`User found on try ${attempts}`);
      // console.log("user data for showing max agents is", JSON.parse(data))
      setUser(JSON.parse(data));
    } else if (attempts < maxAttempts) {
      // console.log(`User not found on try ${attempts}, retrying in 500ms...`);
      setTimeout(checkUser, 500); // retry after 500ms
    } else {
      console.warn(`User not found in localStorage after ${attempts} attempts.`);
    }
  };

  //function for numbers width
  const numberDropDownWidth = (agName) => {
    if (
      showDrawerSelectedAgent?.agentType === "outbound" ||
      showDrawerSelectedAgent?.name === agName ||
      !agName
    ) {
      return "100%";
    }
  };

  // console.log('user?.plan?.price', user)

  // function findLLMModel(value) {
  //   let model = null;
  //   for (const m of models) {
  //     if (m.model == value) {
  //       model = m;
  //     }
  //   }
  //   // console.log("Selected model:", model);
  //   if (model === null) {
  //     return models[0]; // Default to the first model if not found
  //   }

  //   return model;
  // }

  //function for image selection on dashboard
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }

    //console.log;
    if (file) {
      //console.log;
      try {
        // Compression options
        //console.log;
        const options = {
          maxSizeMB: 1, // Maximum size in MB
          maxWidthOrHeight: 1920, // Max width/height
          useWebWorker: true, // Use web workers for better performance
        };
        //console.log;
        // Compress the image
        const compressedFile = file; //await imageCompression(file, options);
        //console.log;
        //console.log;
        // Set the compressed image
        setSelectedImage2(compressedFile);
        updateAgentProfile(compressedFile);
      } catch (error) {
        //console.log;
      }
    }

    return () => clearTimeout(timer);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];

    ////// //console.log;

    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }

    if (file) {
      try {
        // Compression options
        const options = {
          maxSizeMB: 1, // Maximum size in MB
          maxWidthOrHeight: 1920, // Max width/height
          useWebWorker: true, // Use web workers for better performance
        };

        // Compress the image
        const compressedFile = await imageCompression(file, options);
        ////// //console.log;
        // Set the compressed image
        setSelectedImage2(compressedFile);
        updateAgentProfile(compressedFile);
      } catch (error) {
        ////// console.error("Error while compressing the image:", error);
      }
    }

    // const timer = setTimeout(() => {
    //   updateAgentProfile()
    // }, 100);

    return () => clearTimeout(timer);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  //function to update agent profile image
  const updateAgentProfile = async (image) => {
    try {
      // console.log("Trigered update api");
      setGlobalLoader(true);

      const LocalData = localStorage.getItem("User");

      let AuthToken = null;

      if (LocalData) {
        const userData = JSON.parse(LocalData);
        //// //console.log;
        AuthToken = userData.token;
      }

      const ApiPath = Apis.updateAgentImg;

      const formData = new FormData();

      formData.append("media", image);
      formData.append("agentId", showDrawerSelectedAgent?.id);

      // console.log('showDrawerSelectedAgent', showDrawerSelectedAgent)

      for (let [key, value] of formData.entries()) {
        // console.log(key, value)
      }

      //// //console.log;

      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
        },
      });

      if (response) {
        // console.log("response of update image is", response.data)

        if (response.data.status === true) {
          const localAgentsList = localStorage.getItem(
            PersistanceKeys.LocalStoredAgentsListMain
          );

          if (localAgentsList) {
            const agentsList = JSON.parse(localAgentsList);
            // agentsListDetails = agentsList;

            const updateAgentData = response.data.data;

            //// //console.log;

            // const updatedArray = agentsList.map((localItem) => {
            //   const apiItem =
            //     updateAgentData.id === localItem.id ? updateAgentData : null;

            //   return apiItem ? { ...localItem, ...apiItem } : localItem;
            // });

            const updatedArray = agentsList.map((localItem) => {
              // Check if there's a match with the agent's id
              if (updateAgentData.mainAgentId === localItem.id) {
                // Update sub-agents
                const updatedSubAgents = localItem.agents.map((subAgent) => {
                  // Check if the sub-agent id matches the updateAgentData.id (or another relevant sub-agent id)
                  return updateAgentData.id === subAgent.id
                    ? { ...subAgent, ...updateAgentData } // Update the matching sub-agent
                    : subAgent; // Leave the others unchanged
                });

                //// //console.log;

                // Return the updated agent with the updated subAgents
                return { ...localItem, agents: updatedSubAgents };
              }

              // If no match for the agent, return the original item
              return localItem;
            });

            //// //console.log;
            localStorage.setItem(
              PersistanceKeys.LocalStoredAgentsListMain,
              JSON.stringify(updatedArray)
            );
            setMainAgentsList(updatedArray);
            // agentsListDetails = updatedArray
          }
        } else if (response.data.status === false) {
          //// //console.log;
        }
      }
    } catch (error) {
      // console.log("Error occured in api is", error);
      setGlobalLoader(false);
    } finally {
      setGlobalLoader(false);
    }
  };

  //function to open drawer
  const handleShowDrawer = (item) => {
    //console.log;
    // return
    // console.log("Agent  item", item);

    if (item.Calendar) {
      // console.log("Agent has calendaer in item");
    } else {
      // console.log("Agent donot have calendar in the item");
    }

    setAssignNumber(item?.phoneNumber);
    const matchedVoice = voicesList.find(
      (voice) => voice.voice_id === item?.voiceId
    );

    setSelectedVoice(matchedVoice?.name || item?.voiceId); // ✅ use name if found by ID, otherwise fallback to voice name

    // setSelectedVoice(item?.voiceId);

    let v =
      item.agentLanguage === "English" || item.agentLanguage === "Multilingual"
        ? "en"
        : "es";
    // console.log("v", v);
    let voices = [];

    voices = voicesList.filter((voice) => voice.langualge === v);

    // console.log("filtered voices are", voices);
    setFilteredVoices(voices);
    setCallRecordingPermition(item.consentRecording);
    setVoiceExpressiveness(item.voiceStability);
    setStartingPace(item.talkingPace);
    //console.log;
    setPatienceValue(item.responseSpeed);
    setLanguageValue(item?.agentLanguage ? item.agentLanguage : "");

    let modelValue = item.agentLLmModel;
    if (modelValue) {
      let model = findLLMModel(modelValue);

      // console.log("Selected model 2:", model);
      setSelectedGptManu(model);
    }

    let comparedAgent = []

    // console.log('search before', search)
    if (!search) {
      comparedAgent = mainAgentsList.find((mainAgent) => {
        // console.log("Main agent list is", mainAgent);
        return mainAgent.agents.some((subAgent) => subAgent.id === item.id);
      });
    } else {
      // console.log('agentsListSeparated', agentsListSeparated)
      comparedAgent = agentsListSeparated.find((mainAgent) => {
        // console.log("seperated agent list is", mainAgent);
        return mainAgent.id === item.id;
      });
    }

    // console.log("comparedAgent is", comparedAgent);

    setCalendarDetails(comparedAgent);

    ////console.log
    setShowDrawerSelectedAgent(item);
    setSelectedImage(item?.thumb_profile_image);
    //// //console.log;
    if (item.agentType === "inbound") {
      setShowReassignBtn(true);
      setShowGlobalBtn(false);
      // if(item.claimedBy.name !== showDrawer.name){
      //   setShowReassignBtnWidth(true)
      // }
    } else if (item.agentType === "outbound") {
      setShowReassignBtn(false);
      setShowGlobalBtn(true);
    }
  };

  //function to format the name of agent
  const formatName = (item) => {
    let agentName = null;

    if (item?.name?.length > 15) {
      agentName = item?.name?.slice(0, 15) + "...";
    } else {
      agentName = item?.name;
    }
    return (
      <div>
        {agentName?.slice(0, 1).toUpperCase(0)}
        {agentName?.slice(1)}
      </div>
    );
  };

  //function to close script modal
  const handleCloseScriptModal = () => {
    setShowScriptModal(null);
    setShowScript(false);
    setSeledtedScriptKYC(false);
    setSeledtedScriptAdvanceSetting(false);
    setSeledtedScriptKYC(false);
    setSeledtedScriptAdvanceSetting(false);
    localStorage.removeItem("ObjectionsList");
    localStorage.removeItem("GuadrailsList");
  };

  //function to select the number to assign to the user
  const handleAssignNumberChange = (event) => {
    setAssignNumber(event.target.value);
  };

  // const formatPhoneNumber = (rawNumber) => {
  //   if (rawNumber) {
  //     const phoneNumber = parsePhoneNumberFromString(
  //       rawNumber?.startsWith("+") ? rawNumber : `+${rawNumber}`
  //     );
  //     // ////console.log;
  //     return phoneNumber
  //       ? phoneNumber.formatInternational()
  //       : "No phone number";
  //   } else {
  //     return "No phone number";
  //   }
  // };

  //fucntion for assigning the number
  const handleCloseClaimPopup = () => {
    setShowClaimPopup(false);
  };

  //function to finad number
  //function to fine numbers api
  const handleFindeNumbers = async (number) => {
    try {
      setFindeNumberLoader(true);
      const ApiPath = `${Apis.findPhoneNumber}?areaCode=${number}`;
      let AuthToken = null;
      const LocalData = localStorage.getItem("User");
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData);
        AuthToken = UserDetails.token;
      }

      ////console.log;
      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        ////console.log;
        if (response.data.status === true) {
          setFoundeNumbers(response.data.data);
        }
      }
    } catch (error) {
      // console.error("Error occured in finde number api is :---", error);
    } finally {
      setFindeNumberLoader(false);
    }
  };

  //code for reassigning the number api
  const handleReassignNumber = async (item) => {
    try {
      //// //console.log;
      // return;
      setReassignLoader(item);
      let AuthToken = null;
      const LocalData = localStorage.getItem("User");
      const agentDetails = localStorage.getItem("agentDetails");
      let MyAgentData = null;
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData);
        AuthToken = UserDetails.token;
      }

      if (agentDetails) {
        ////console.log
        const agentData = JSON.parse(agentDetails);
        ////console.log;
        MyAgentData = agentData;
      }

      const ApiPath = Apis.reassignNumber;

      const ApiData = {
        agentId: item.claimedBy.id,
        phoneNumber: item.phoneNumber,
        newAgentId: showDrawerSelectedAgent.id,
      };
      ////console.log

      //// //console.log;
      ////console.log;
      ////console.log;

      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        getAvailabePhoneNumbers();
        //// //console.log;
        if (response.data.status === true) {
          setAssignNumber(item.phoneNumber);
          setShowSuccessSnack(
            `Phone number assigned`
          );
        } else if (response.data.status === false) {
          setShowSuccessSnack(response.data.message);
        }
        setIsVisibleSnack(true);
        // AssignNumber()
        // setShowClaimPopup(null);
        setAssignNumber(item.phoneNumber.slice(1));
        setOpenCalimNumDropDown(false);
        setShowDrawerSelectedAgent((prev) => {
          return { ...prev, phoneNumber: item.phoneNumber };
        });

        const localAgentsList = localStorage.getItem(
          PersistanceKeys.LocalStoredAgentsListMain
        );

        if (localAgentsList) {
          const mainAgentsList = JSON.parse(localAgentsList);
          let mainAgents = []; //Main agents not subagents list

          for (let mainAgent of mainAgentsList) {
            let subAgents = mainAgent.agents;
            let newAgents = [];
            for (let ag of subAgents) {
              if (ag.phoneNumber == item.phoneNumber) {
                if (ag.agentType == "inbound") {
                  ag.phoneNumber = "";
                  //// //console.log;
                }
              } else {
                if (ag.id == showDrawerSelectedAgent.id) {
                  ag.phoneNumber = item.phoneNumber;
                  //// //console.log;
                }
              }
              newAgents.push(ag);
            }
            mainAgent.agents = newAgents;
            mainAgents.push(mainAgent);
          }
          setMainAgentsList(mainAgents);
          localStorage.setItem(
            PersistanceKeys.LocalStoredAgentsListMain,
            JSON.stringify(mainAgents)
          );
        }
        setShowConfirmationModal(null);
        // setShowDrawer(null);

        //code to close the dropdown
        if (selectRef.current) {
          selectRef.current.blur(); // Triggers dropdown close
        }
        return;

        // Update the agent's phone number and ensure no other agents have the same phone number
        //// //console.log;
        let agents = [];
        let mainAgents = []; //Main agents not subagents list

        for (let ag of agentsListSeparated) {
          if (ag.phoneNumber == item.phoneNumber) {
            if (ag.agentType == "inbound") {
              ag.phoneNumber = "";
              //// //console.log;
            }
          } else {
            if (ag.id == showDrawerSelectedAgent.id) {
              ag.phoneNumber = item.phoneNumber;
              //// //console.log;
            }
          }
          agents.push(ag);
        }
        //// //console.log;
        setAgentsListSeparated(agents);
        localStorage.setItem(
          PersistanceKeys.LocalStoredAgentsListMain,
          JSON.stringify(agents)
        );

        //// //console.log;
      }
    } catch (error) {
      //// console.error("Error occured in reassign the number api:", error);
    } finally {
      setReassignLoader(null);
      ////console.log
    }
  };

  //function to purchse number
  const handlePurchaseNumber = async () => {
    try {
      setPurchaseLoader(true);
      let AuthToken = null;
      const LocalData = localStorage.getItem("User");
      const agentDetails = localStorage.getItem("agentDetails");
      let MyAgentData = null;
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData);
        AuthToken = UserDetails.token;
      }

      ////console.log;

      if (agentDetails) {
        ////console.log
        const agentData = JSON.parse(agentDetails);
        ////console.log;
        MyAgentData = agentData;
      }

      const ApiPath = Apis.purchaseNumber;
      ////console.log;
      // ////console.log;
      const formData = new FormData();
      formData.append("phoneNumber", selectedPurchasedNumber.phoneNumber);
      // formData.append("phoneNumber", "+16505403715");
      // formData.append("callbackNumber", "+16505403715");
      formData.append("mainAgentId", MyAgentData.id);

      for (let [key, value] of formData.entries()) {
        ////console.log;
      }

      // localStorage.setItem("purchasedNumberDetails", JSON.stringify(response.data.data));
      // setOpenPurchaseSuccessModal(true);
      // setAssignNumber(selectedPurchasedNumber.phoneNumber);
      // setPreviousNumber([...previousNumber, selectedPurchasedNumber]);
      // setShowClaimPopup(false);
      // setOpenCalimNumDropDown(false);

      // return

      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "multipart/form-data",
          // "Content-Type": "application/json"
        },
      });

      if (response) {
        ////console.log;
        if (response.data.status === true) {
          localStorage.setItem(
            "purchasedNumberDetails",
            JSON.stringify(response.data.data)
          );
          setOpenPurchaseSuccessModal(true);
          // handleContinue();
          setAssignNumber(selectedPurchasedNumber.phoneNumber);
          setPreviousNumber([...previousNumber, selectedPurchasedNumber]);
          setShowClaimPopup(false);
          setOpenCalimNumDropDown(false);
        }
      }
    } catch (error) {
      //// console.error("Error occured in purchase number api is: --", error);
    } finally {
      setPurchaseLoader(false);
    }
  };

  //function to select the number to purchase
  const handlePurchaseNumberClick = (item, index) => {
    ////console.log;
    setSelectedPurchasedNumber((prevId) => (prevId === item ? null : item));
    setSelectedPurchasedIndex((prevId) => (prevId === index ? null : index));
  };

  //code to get the user previous numbers
  const getAvailabePhoneNumbers = async () => {
    try {
      let AuthToken = null;

      // const agentDetails = localStorage.getItem("agentDetails");
      const LocalData = localStorage.getItem("User");
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData);
        AuthToken = UserDetails.token;
      }
      ////console.log;
      const ApiPath = Apis.userAvailablePhoneNumber;
      ////console.log;

      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
        },
      });

      if (response) {
        // //console.log;
        ////// //console.log;
        setPreviousNumber(response.data.data);
      }
    } catch (error) {
      //// console.error("Error occured in: ", error);
    } finally {
      ////console.log
    }
  };

  //code for update agent api
  const handleRenameAgent = async () => {
    try {
      setRenameAgentLoader(true);

      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        AuthToken = Data.token;

        const ApiPath = Apis.updateSubAgent;

        let apidata = {
          agentId: selectedRenameAgent.id,
          name: renameAgent, //selectedRenameAgent?.name,
        };
        // console.log("Selected agent ", showDrawerSelectedAgent);
        // console.log("data sending in api is", apidata);
        // return
        const response = await axios.post(ApiPath, apidata, {
          headers: {
            Authorization: "Bearer " + AuthToken,
          },
        });

        if (response) {
          setShowRenameAgentPopup(false);
          // console.log("Response of api is", response);
          // //console.log;
          setShowSuccessSnack(
            `${fromatMessageName(selectedRenameAgent.name)} updated`
          );
          if (response.data.status === true) {
            setIsVisibleSnack(true);

            const localAgentsList = localStorage.getItem(
              PersistanceKeys.LocalStoredAgentsListMain
            );

            if (showDrawerSelectedAgent) {
              const updateAgentData = response.data.data;

              const matchedAgent = updateAgentData.agents.find(
                (localItem) => localItem.id === showDrawerSelectedAgent.id
              );

              if (matchedAgent) {
                setShowDrawerSelectedAgent(matchedAgent);
                // console.log("Matched Agent Stored:"); //, matchedAgent
              } else {
                // console.log("No matching agent found.");
              }
            }

            if (localAgentsList) {
              const agentsList = JSON.parse(localAgentsList);
              // agentsListDetails = agentsList;

              const updateAgentData = response.data.data;

              // showDrawerSelectedAgent();

              const updatedArray = agentsList.map((localItem) => {
                const apiItem =
                  updateAgentData.id === localItem.id ? updateAgentData : null;

                return apiItem ? { ...localItem, ...apiItem } : localItem;
              });
              // let updatedSubAgent = null

              //// //console.log;
              localStorage.setItem(
                PersistanceKeys.LocalStoredAgentsListMain,
                JSON.stringify(updatedArray)
              );
              setMainAgentsList(updatedArray);
              // agentsListDetails = updatedArray
            }
            // setShowDrawer(null);
          }
        }
      }
    } catch (error) {
      //// console.error("Error occured in api is", error);
      setRenameAgentLoader(false);
    } finally {
      ////console.log;
      setRenameAgentLoader(false);
    }
  };

  const updateAgent = async (voiceId) => {
    //console.log;
    // return
    try {
      // return
      setUpdateAgentLoader(true);
      // setGlobalLoader(true);
      // getAgents()
      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        ////////console.log;
        AuthToken = Data.token;
      }

      const ApiPath = Apis.updateAgent;

      const formData = new FormData();

      //console.log;
      // return;
      if (showDrawerSelectedAgent) {
        if (showDrawerSelectedAgent.agentType === "inbound") {
          ////console.log;
          formData.append("inboundGreeting", greetingTagInput);
          formData.append("inboundPrompt", scriptTagInput);
          formData.append("inboundObjective", objective);
        } else {
          formData.append("prompt", scriptTagInput);
          formData.append("greeting", greetingTagInput);
          formData.append("outboundObjective", objective);
        }
        formData.append("mainAgentId", showDrawerSelectedAgent.mainAgentId);
      } else if (showScriptModal) {
        if (showScriptModal.agentType === "inbound") {
          ////console.log;
          formData.append("inboundGreeting", greetingTagInput);
          formData.append("inboundPrompt", scriptTagInput);
          formData.append("inboundObjective", objective);
        } else {
          formData.append("prompt", scriptTagInput);
          formData.append("greeting", greetingTagInput);
          formData.append("outboundObjective", objective);
        }
        formData.append("mainAgentId", showScriptModal.mainAgentId);
      }

      if (voiceId) {
        formData.append("voiceId", voiceId);
      }

      for (let [key, value] of formData.entries()) {
        // console.log(`agnet key ${key} and value ${value}`);
      }

      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
        },
      });

      if (response) {
        setShowSuccessSnack(
          `${fromatMessageName(
            showDrawerSelectedAgent
              ? showDrawerSelectedAgent.name
              : showScriptModal.name
          )} updated`
        );
        if (response.data.status === true) {
          setIsVisibleSnack(true);
          // console.log("Here status true");
          const localAgentsList = localStorage.getItem(
            PersistanceKeys.LocalStoredAgentsListMain
          );

          let agentsListDetails = [];

          if (localAgentsList) {
            // console.log("local agents List");
            const agentsList = JSON.parse(localAgentsList);
            // agentsListDetails = agentsList;

            const updateAgentData = response.data.data;
            // console.log(
            //   `Agent updated data ${updateAgentData.agents.length
            //   } ${!showScriptModal}`,
            //   updateAgentData
            // );

            const updatedArray = agentsList.map((localItem) => {
              const apiItem =
                updateAgentData.id === localItem.id ? updateAgentData : null;

              return apiItem ? { ...localItem, ...apiItem } : localItem;
            });
            // let updatedSubAgent = null
            if (showDrawerSelectedAgent) {
              if (updateAgentData.agents.length > 0) {
                // console.log("Updated showDrawerAgent");
                if (
                  updateAgentData.agents[0].id == showDrawerSelectedAgent.id
                ) {
                  // console.log("Updated showDrawerAgent first subagent");
                  setShowDrawerSelectedAgent(updateAgentData.agents[0]);
                } else if (updateAgentData.agents.length > 1) {
                  if (
                    updateAgentData.agents[1].id == showDrawerSelectedAgent.id
                  ) {
                    // console.log("Updated showDrawerAgent second subagent");
                    setShowDrawerSelectedAgent(updateAgentData.agents[1]);
                  }
                }
              }
            } else if (showScriptModal) {
              if (updateAgentData.agents.length > 0) {
                // console.log("Updated showScriptModal");
                if (updateAgentData.agents[0].id == showScriptModal.id) {
                  // console.log("Updated showScriptModal first subagent");
                  setShowScriptModal(updateAgentData.agents[0]);
                } else if (updateAgentData.agents.length > 1) {
                  if (updateAgentData.agents[1].id == showScriptModal.id) {
                    // console.log("Updated showScriptModal second subagent");
                    setShowScriptModal(updateAgentData.agents[1]);
                  }
                }
              }
            }

            //// //console.log;
            localStorage.setItem(
              PersistanceKeys.LocalStoredAgentsListMain,
              JSON.stringify(updatedArray)
            );
            setMainAgentsList(updatedArray);
            // agentsListDetails = updatedArray
          } else {
            // console.log("No local agents list");
          }

          // setShowDrawer(null);
        }
      }
    } catch (error) {
      console.error("Error occured in api is", error);
      setGlobalLoader(false);
    } finally {
      //console.log;
      setUpdateAgentLoader(false);
      setGlobalLoader(false);
    }
  };

  const updateSubAgent = async (voiceData = null, model = null) => {
    // console.log(
    //   "Updating sub agent with voiceData:",
    //   voiceData,
    //   "and model:",
    //   model
    // );

    // return
    try {
      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        AuthToken = Data.token;

        const ApiPath = Apis.updateSubAgent;

        let formData = new FormData();
        formData.append("agentId", showDrawerSelectedAgent.id);

        if (voiceData) {
          if (voiceData.voiceExpressiveness) {
            formData.append("voiceStability", voiceData.voiceExpressiveness);
          }
          if (voiceData.agentLanguage) {
            formData.append("agentLanguage", voiceData.agentLanguage);
          }
          if (voiceData.talkingPace) {
            formData.append("talkingPace", voiceData.talkingPace);
          }
          if (voiceData.responseSpeed) {
            formData.append("responseSpeed", voiceData.responseSpeed);
          }
          if (voiceData.callRecordingPermition) {
            formData.append(
              "consentRecordings",
              voiceData.callRecordingPermition
            );
          }

          if (
            voiceData.liveTransferNumber ||
            voiceData.liveTransferNumber !== undefined
          ) {
            formData.append("liveTransferNumber", voiceData.liveTransferNumber);
          }
          if (
            voiceData.callbackNumber ||
            voiceData.callbackNumber !== undefined
          ) {
            formData.append("callbackNumber", voiceData.callbackNumber);
          }
        }

        // if (showDrawerSelectedAgent) {
        //   formData.append("mainAgentId", showDrawerSelectedAgent.mainAgentId);
        // }

        if (model) {
          formData.append("agentLLmModel", model);
        }

        // console.log("Data to update");
        for (let [key, value] of formData.entries()) {
          // console.log(`${key}: ${value}`);
        }

        // return
        const response = await axios.post(ApiPath, formData, {
          headers: {
            Authorization: "Bearer " + AuthToken,
          },
        });

        if (response) {
          // setShowRenameAgentPopup(false);
          // console.log(
          //   "Response of update sub agent api is :--",
          //   response.data.data
          // );
          // //console.log;
          setShowSuccessSnack(
            `${fromatMessageName(
              showDrawerSelectedAgent ? showDrawerSelectedAgent.name : "Agent"
            )} updated`
          );
          if (response.data.status === true) {
            setIsVisibleSnack(true);
            let agent = response.data.data;
            if (agent.agents[0].id == showDrawerSelectedAgent.id) {
              setShowDrawerSelectedAgent(agent.agents[0]);
            } else if (agent.agents.length > 1) {
              if (agent.agents[1].id == showDrawerSelectedAgent.id) {
                setShowDrawerSelectedAgent(agent.agents[1]);
              }
            }

            const localAgentsList = localStorage.getItem(
              PersistanceKeys.LocalStoredAgentsListMain
            );

            if (localAgentsList) {
              const agentsList = JSON.parse(localAgentsList);
              // agentsListDetails = agentsList;

              const updateAgentData = response.data.data;

              const updatedArray = agentsList.map((localItem) => {
                const apiItem =
                  updateAgentData.id === localItem.id ? updateAgentData : null;

                return apiItem ? { ...localItem, ...apiItem } : localItem;
              });
              // let updatedSubAgent = null

              //// //console.log;
              localStorage.setItem(
                PersistanceKeys.LocalStoredAgentsListMain,
                JSON.stringify(updatedArray)
              );
              setMainAgentsList(updatedArray);
              // agentsListDetails = updatedArray
            }
            // setShowDrawer(null);
          }
        }
      }
    } catch (error) {
      console.error("Error occured in update sub agent api is", error);
      setRenameAgentLoader(false);
    } finally {
      ////console.log;
      setRenameAgentLoader(false);
    }
  };

  //function for scripts modal screen change
  const handleShowScript = () => {
    setShowScript(true);
    setSeledtedScriptKYC(false);
    setSeledtedScriptAdvanceSetting(false);
  };

  const AssignNumber = async (phoneNumber) => {
    if (showDrawerSelectedAgent.phoneNumber == phoneNumber) {
      return;
    }
    try {
      //// //console.log;

      // setGlobalLoader(true);
      // setAssignLoader(true);
      setShowPhoneLoader(true);
      let AuthToken = null;
      const LocalData = localStorage.getItem("User");

      if (LocalData) {
        const UserDetails = JSON.parse(LocalData);
        AuthToken = UserDetails.token;
      }

      const formData = new FormData();
      formData.append("phoneNumber", phoneNumber);
      formData.append(
        "callbackNumber",
        showDrawerSelectedAgent?.callbackNumber
      );

      formData.append(
        "liveTransforNumber",
        showDrawerSelectedAgent?.liveTransferNumber
      );
      formData.append("agentId", showDrawerSelectedAgent.id);

      const ApiPath = Apis.asignPhoneNumber;

      for (let [key, value] of formData.entries()) {
        //// //console.log;
      }

      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
        },
      });

      // setAssignLoader(false);
      getAvailabePhoneNumbers();
      setShowPhoneLoader(false);
      if (response) {
        //console.log;
        if (response.data.status === true) {
          setAssignNumber(phoneNumber);
          setShowSuccessSnack(
            `Phone number assigned`
          );

          setShowDrawerSelectedAgent((prev) => {
            return { ...prev, phoneNumber };
          });
          setIsVisibleSnack(true);
          setShowConfirmationModal(null);

          const localAgentsList = localStorage.getItem(
            PersistanceKeys.LocalStoredAgentsListMain
          );

          if (localAgentsList) {
            const agentsList = JSON.parse(localAgentsList);
            const updateAgentData = showDrawerSelectedAgent;

            //// //console.log;
            const updatedArray = agentsList.map((localItem) => {
              if (updateAgentData.mainAgentId === localItem.id) {
                const updatedSubAgents = localItem.agents.map((subAgent) => {
                  return updateAgentData.id === subAgent.id
                    ? { ...subAgent, phoneNumber: phoneNumber }
                    : subAgent;
                });

                //// //console.log;

                return { ...localItem, agents: updatedSubAgents };
              }

              return localItem;
            });
            //// console.log(
            // "Updated agents list array with phone is",
            // updatedArray
            // );
            localStorage.setItem(
              PersistanceKeys.LocalStoredAgentsListMain,
              JSON.stringify(updatedArray)
            );
            setMainAgentsList(updatedArray);
            // agentsListDetails = updatedArray
          }
        } else if (response.data.status === false) {
          setShowErrorSnack(response.data.message);
          setIsVisibleSnack2(true);
        }
      }
    } catch (error) {
      //// console.error("Error occured in api is:", error);
      setShowErrorSnack(response.data.message);
      setIsVisibleSnack2(true);
      setGlobalLoader(false);
    } finally {
      ////console.log;
      setGlobalLoader(false);
    }
  };

  const handleShowKycs = () => {
    setShowScript(false);
    setSeledtedScriptKYC(true);
    setSeledtedScriptAdvanceSetting(false);
  };

  const handleShowAdvanceSeting = () => {
    setShowScript(false);
    setSeledtedScriptKYC(false);
    setSeledtedScriptAdvanceSetting(true);
  };

  //function to show the objection and guadrails
  const handleShowObjection = () => {
    setShowObjection(true);
    setShowGuardrails(false);
    setShowObjectives(false);
  };

  const handleShowGuardrails = () => {
    setShowObjection(false);
    setShowGuardrails(true);
    setShowObjectives(false);
  };

  const handleShowObjectives = () => {
    setShowObjectives(true);
    setShowObjection(false);
    setShowGuardrails(false);
  };

  const handleGptManuSelect = async (model) => {
    if (!model.disabled) {
      setSelectedGptManu(model);
    }

    setShowModelLoader(true);
    await updateSubAgent(null, model.model);
    setShowModelLoader(false);
    setOpenGptManu(null);
  };

  //function ot compare the selected agent wiith the main agents list
  const matchingAgent = (agent) => {
    //// //console.log;
    const agentData = mainAgentsList.filter((prevAgent) => {
      //// //console.log;
      if (prevAgent.id === agent.mainAgentId) {
        return true;
      } else {
        return false;
      }
    });
    //// //console.log;
    if (
      typeof agentData == undefined ||
      agentData == null ||
      agentData.length === 0
    ) {
      return;
    }
    // console.log("Matching agent data:", agentData);
    setKYCList(agentData[0].kyc);

    ////console.log;
    //// //console.log;
    setMainAgentId(agentData[0].id);
    let firstAgent = agentData[0];
    //// //console.log;
    setUserPipeline(firstAgent.pipeline);
    // if (
    //   firstAgent.agents?.length === 2

    // ) {
    //   if(firstAgent.agents[0].agentType === "outbound"){
    //     setUserPipeline(firstAgent.pipeline);
    //   }

    //   // setOldGreetingTagInput(firstAgent.greeting);
    //   // setGreetingTagInput(firstAgent.greeting);
    //   // setScriptTagInput(firstAgent.callScript);
    //   // setOldScriptTagInput(firstAgent.callScript);
    // } else if (firstAgent.agents[0].agentType === "inbound") {
    //   setUserPipeline(firstAgent.pipeline);
    //   // setGreetingTagInput(agentData[0].inboundGreeting);
    //   // setOldGreetingTagInput(agentData[0].inboundGreeting);
    //   // setScriptTagInput(agentData[0].inboundScript);
    //   // setOldScriptTagInput(agentData[0].inboundScript);
    // }

    // setGreetingTagInput(agentData[0].greeting);
    // // setOldGreetingTagInput(agentData[0].greeting);
    // setScriptTagInput(agentData[0].callScript);
  };

  //code for getting uniqueCcolumns
  const getUniquesColumn = async () => {
    try {
      // setColumnloader(true);
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        // setUser(UserDetails);
        AuthToken = UserDetails.token;
      }

      ////////console.log;

      const ApiPath = Apis.uniqueColumns;
      ////////console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        console.log("response of get unique columns", response)
        if (response.data.status === true) {
          setUniqueColumns(response.data.data);
        }
      }
    } catch (error) {
      //// console.error("Error occured in getColumn is :", error);
    } finally {
      // setColumnloader(false)
    }
  };

  ///code to show more unique columns
  const handleShowUniqueCols = () => {
    setShowMoreUniqueColumns(!showMoreUniqueColumns);
  };

  //function to handle input field change
  const handleInputChange = (key, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [key]: value, // Update the specific index value
    }));
  };

  //function to delete the agent
  const handleDeleteAgent = async () => {
    try {
      setDelLoader(true);
      let AuthToken = null;
      const userData = localStorage.getItem("User");
      if (userData) {
        const localData = JSON.parse(userData);
        ////console.log;
        AuthToken = localData.token;
      }

      const ApiData = {
        agentId: showDrawerSelectedAgent.id,
      };
      //// //console.log;

      //// //console.log;

      // return
      const ApiPath = Apis.DelAgent;
      ////console.log;

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        //// //console.log;
        setAgentsListSeparated(
          agentsListSeparated.filter(
            (item) => item.id !== showDrawerSelectedAgent.id
          )
        );
        setAgentsList(
          agentsListSeparated.filter(
            (item) => item.id !== showDrawerSelectedAgent.id
          )
        );

        setIsVisibleSnack(true);
        setShowSuccessSnack(response.data.message);

        setShowDrawerSelectedAgent(null);
        setActiveTab("Agent Info");
        setDelAgentModal(false);

        //updating data on localstorage
        const localAgentsList = localStorage.getItem(
          PersistanceKeys.LocalStoredAgentsListMain
        );
        if (localAgentsList) {
          const agentsList = JSON.parse(localAgentsList);
          // agentsListDetails = agentsList;

          const updateAgentData = showDrawerSelectedAgent;

          const updatedAgentsList = agentsList.map((agentGroup) => {
            if (Array.isArray(agentGroup.agents)) {
              // Remove the agent with the matching ID from the 'agents' array
              const updatedAgents = agentGroup.agents.filter(
                (localItem) => localItem.id !== updateAgentData.id
              );

              // Return the updated agentGroup with the modified 'agents' array
              return {
                ...agentGroup,
                agents: updatedAgents,
              };
            }
            return agentGroup; // Return the item as is if 'agents' is not an array
          });

          //// //console.log;
          localStorage.setItem(
            PersistanceKeys.LocalStoredAgentsListMain,
            JSON.stringify(updatedAgentsList)
          );
          // agentsListDetails = updatedArray
        }
      }
    } catch (error) {
      //// console.error("Error occured in del agent api is:", error);
    } finally {
      setDelLoader(false);
    }
  };

  //function to call testAi Api
  const handleTestAiClick = async () => {
    try {
      setTestAIloader(true);
      let AuthToken = null;
      const userData = localStorage.getItem("User");

      if (userData) {
        const localData = JSON.parse(userData);
        ////console.log;
        AuthToken = localData.token;
      }

      const newArray = scriptKeys.map((key) => ({
        [key]: inputValues[key] || "", // Use the input value or empty string if not set
      }));
      ////console.log;
      ////console.log);

      const ApiData = {
        agentId: selectedAgent.id,
        name: name,
        phone: phone,
        extraColumns: newArray,
      };

      // console.log('ApiData', ApiData)

      localStorage.setItem(
        PersistanceKeys.TestAiCredentials,
        JSON.stringify(ApiData)
      );

      const ApiPath = Apis.testAI;

      ////console.log);
      ////console.log);
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        ////console.log;
        setOpenTestAiModal(false);
        setShowSuccessSnack(response.data.message);
        setIsVisibleSnack(true);
        // if (response.data.status === true) {
        //   // setName("");
        //   // setPhone("");
        // }
      }
    } catch (error) {
      console.error("Error occured in test api is", error);
      setOpenTestAiModal(false);
    } finally {
      ////console.log;
      setTestAIloader(false);
    }
  };

  //function for phonenumber input
  const handlePhoneNumberChange = (phone) => {
    setPhone(phone);
    validatePhoneNumber(phone);

    if (!phone) {
      setErrorMessage("");
    }
  };

  // Function to validate phone number
  const validatePhoneNumber = (phoneNumber) => {
    // const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`);
    // parsePhoneNumberFromString(`+${phone}`, countryCode?.toUpperCase())
    const parsedNumber = parsePhoneNumberFromString(
      `+${phoneNumber}`,
      countryCode?.toUpperCase()
    );
    // if (parsedNumber && parsedNumber.isValid() && parsedNumber.country === countryCode?.toUpperCase()) {
    if (!parsedNumber || !parsedNumber.isValid()) {
      setErrorMessage("Invalid");
    } else {
      setErrorMessage("");

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // setCheckPhoneResponse(null);
      ////console.log
    }
  };

  useEffect(() => {
    const agentLocalDetails = localStorage.getItem(
      PersistanceKeys.LocalStoredAgentsListMain
    );

    if (agentLocalDetails) {
      const agentData = JSON.parse(agentLocalDetails);
      //// //console.log;
      setMainAgentsList(agentData);
    } else {
      //// //console.log;
    }

    const userData = localStorage.getItem("User");

    try {
      setInitialLoader(true);
      if (userData) {
        const userLocalData = JSON.parse(userData);
        getAgents(); //userLocalData
      }
    } catch (error) {
      //// console.error("Error occured is :", error);
    } finally {
      setShowPhoneLoader(false);

      setInitialLoader(false);
    }

    getCalenders();

    // Cleanup function to clear timeouts
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectProfileImg = (index) => {
    fileInputRef.current[index]?.click();
  };

  const handleProfileImgChange = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages((prev) => ({
          ...prev,
          [index]: reader.result, // Set the preview URL for the specific index
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  //code to get agents
  const getAgents = async (
    paginationStatus,
    search = null,
    searchLoader = false
  ) => {
    setPaginationLoader(true);

    // Clear previous data if it's a new search to prevent memory buildup
    if (search && searchLoader) {
      setMainAgentsList([]);
      setAgentsListSeparated([]);
    }

    //test code failed for saving search value

    // if (searchLoader && !search) {
    //   console.log('search clear', search)
    //   setAgentsListSeparated(allAgentsList);
    //   return
    // }

    // console.log("Pagination status passed is", paginationStatus);
    // console.log('search', search)
    try {
      const agentLocalDetails = localStorage.getItem(
        PersistanceKeys.LocalStoredAgentsListMain
      );
      if (!agentLocalDetails || searchLoader) {
        setInitialLoader(true);
      }
      let offset = mainAgentsList.length;
      let ApiPath = `${Apis.getAgents}?offset=${offset}`; //?agentType=outbound

      if (search) {
        offset = 0;
        ApiPath = `${Apis.getAgents}?offset=${offset}&search=${search}`;
      }
      // console.log("Api path is", ApiPath);

      const Auth = AuthToken();
      ////console.log;
      // const AuthToken = userData.token;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + Auth,
          "Content-Type": "application/json",
        },
      });

      // if (response) {
      //   //console.log;
      //   setPaginationLoader(false);
      //   let agents = response.data.data || [];
      //   console.log("Agents from api", agents);
      //   if (!search) {
      //     setAllAgentsList(agents)

      //   }
      //   setOldAgentsList(agents)
      //   if (agents.length >= 6) {
      //     setCanGetMore(true);
      //   } else {
      //     setPaginationLoader(false);
      //     setCanGetMore(false);
      //   }

      //   if (search) {
      //     setAgentsListSeparated(agents);
      //     return
      //   }

      //   let newList = [...mainAgentsList]; // makes a shallow copy
      //   if (Array.isArray(agents) && agents.length > 0) {
      //     newList.push(...agents); // append all agents at once
      //   }

      //   console.log("Agents after pushing", newList);

      //   localStorage.setItem(
      //     PersistanceKeys.LocalStoredAgentsListMain,
      //     JSON.stringify(newList)
      //   );

      //   setMainAgentsList(newList);
      // }

      if (response) {
        //console.log;
        setPaginationLoader(false);
        let agents = response.data.data || [];
        // console.log("Agents from api", agents);
        setOldAgentsList(agents);
        if (agents.length >= 6) {
          setCanGetMore(true);
        } else {
          setPaginationLoader(false);
          setCanGetMore(false);
        }

        if (search) {
          let subAgents = [];
          agents.forEach((item) => {
            if (item.agents && item.agents.length > 0) {
              for (let i = 0; i < item.agents.length; i++) {
                const agent = item.agents[i];
                if (agent) {
                  subAgents.push(agent);
                }
              }
            }
          });

          setAgentsListSeparated(subAgents);


          return;
        }

        let newList = [...mainAgentsList]; // makes a shallow copy

        if (Array.isArray(agents) && agents.length > 0) {
          newList.push(...agents); // append all agents at once
        }

        // console.log("Agents after pushing", newList);
        if (!search) {
          localStorage.setItem(
            PersistanceKeys.LocalStoredAgentsListMain,
            JSON.stringify(newList)
          );
        }
        setMainAgentsList(newList);
      }
    } catch (error) {
      setInitialLoader(false);
      //// console.error("Error occured in get Agents api is :", error);
    } finally {
      setInitialLoader(false);
    }
  };


  //function to add new agent by more agents popup
  const handleAddAgentByMoreAgentsPopup = () => {
    try {
      setShowMoreAgentsPopup(false)
      console.log("handleAddAgentByMoreAgentsPopup is called")
      const data = {
        status: true,
      };
      localStorage.setItem("fromDashboard", JSON.stringify(data));

      localStorage.setItem("AddAgentByPayingPerMonth", JSON.stringify({
        status: true,
      }));
      //remove data from local storage after 2 minutes
      setTimeout(() => {
        localStorage.removeItem("AddAgentByPayingPerMonth");
        console.log("AddAgentByPayingPerMonth removed from local storage")
      }, 2 * 60 * 1000);

      console.log("routing to createagent from add new agent function")

      // Use setTimeout to ensure state updates complete before navigation
      setTimeout(() => {
        router.push('/createagent');
      }, 0);
    } catch (error) {
      console.error("Error in handleAddAgentByMoreAgentsPopup:", error);
    }
  }

  //function to add new agent - Combined Redux + localStorage logic
  const handleAddNewAgent = (event) => {
    console.log("handleAddNewAgent is called", reduxUser?.plan)
    console.log("isPlanActive", isPlanActive(reduxUser?.plan))
    if (!isPlanActive(reduxUser?.plan)) {
      setShowErrorSnack("Your plan is paused. Activate to create agents")
      setIsVisibleSnack2(true)
      return
    }
    // return

    try {
      // event.preventDefault();
      // setShowMoreAgentsPopup(true)
      // return

      // Combined plan checking - use Redux as primary, localStorage as fallback
      // console.log('🎯 [DASHBOARD] Combined plan check for new agent');

      // Use Redux plan capabilities as primary source
      if (reduxUser?.planCapabilities) {
        // console.log('🔴 [DASHBOARD] Using Redux plan capabilities');
        if (!canCreateAgent) {
          if (isFreePlan && currentAgents >= 1) {
            // console.log('🚫 [DASHBOARD] Free plan user has reached limit');
            setShowUpgradeModal(true)
            return
          } else if (currentAgents >= maxAgents) {
            // console.log('🚫 [DASHBOARD] Paid plan user is over the allowed capabilities');
            setShowMoreAgentsPopup(true)
            setMoreAgentsPopupType("newagent")
            return
          }
        }
      } else {
        // Fallback to localStorage logic (from test branch)
        // console.log('🔶 [DASHBOARD] Fallback to localStorage plan capabilities');

        // Check if user is on free plan and has reached their limit
        if (user?.user?.plan === null || user?.user?.plan?.price === 0) {
          if (user?.user?.currentUsage?.maxAgents >= user?.user?.planCapabilities?.maxAgents) {
            // console.log('Free plan user has reached limit');
            setShowUpgradeModal(true)
            return
          }
        }

        // Check if paid plan user has reached their agent limit
        if (user?.user?.currentUsage?.maxAgents >= user?.user?.planCapabilities?.maxAgents) {
          // console.log('Paid plan user is over the allowed capabilities');
          setShowMoreAgentsPopup(true)
          setMoreAgentsPopupType("newagent")
          return
        }
      }

      // User can create agent - proceed to creation
      // console.log('✅ [DASHBOARD] User can create agent - proceeding to /createagent')
      const data = {
        status: true,
      };
      localStorage.setItem("fromDashboard", JSON.stringify(data));
      console.log("routing to createagent from add new agent function")
      setTimeout(() => {
        router.push('/createagent');
      }, 0);
    } catch (error) {
      console.error("Error in handleAddNewAgent:", error);
    }
  };

  const handlePopoverOpen = (event, item) => {
    ////// //console.log;
    setActionInfoEl(event.currentTarget);
    setHoveredIndexStatus(item.status);
    setHoveredIndexAddress(item.address);
  };

  const handlePopoverClose = () => {
    setActionInfoEl(null);
    setHoveredIndexStatus(null);
    setHoveredIndexAddress(null);
  };

  const open = Boolean(actionInfoEl);

  useEffect(() => {
    let agents = [];

    //// //console.log;

    const localAgentsData = localStorage.getItem(
      PersistanceKeys.LocalStoredAgentsListMain
    );

    let localDetails = [];
    if (localAgentsData) {
      localDetails = JSON.parse(localAgentsData);
    }

    localDetails.map((item, index) => {
      // Check if agents exist
      if (item.agents && item.agents?.length > 0) {
        for (let i = 0; i < item.agents?.length; i++) {
          const agent = item.agents[i];
          ////console.log;
          // Add a condition here if needed  //.agentType === 'outbound'
          if (agent) {
            agents.push(agent);
          }
        }
      } else {
        // agentsContent.push(<div key="no-agent">No agents available</div>);
      }
    });
    setAgentsListSeparated(agents);
    setAgentsList(agents);

    //console.log;
  }, [mainAgentsList]);

  //code for voices droopdown
  const [SelectedVoice, setSelectedVoice] = useState("");
  const [filteredVoices, setFilteredVoices] = useState([]);

  ////console.log);

  const handleChangeVoice = async (event) => {
    setShowVoiceLoader(true);
    const selectedVoice = voicesList.find(
      (voice) => voice.name === event.target.value
    );

    if (!selectedVoice) {
      setShowVoiceLoader(false);
      return;
    }

    await updateAgent(selectedVoice.name); // ✅ send name
    setSelectedVoice(selectedVoice.name); // ✅ store name now
    setShowVoiceLoader(false);

    if (showDrawerSelectedAgent.thumb_profile_image) {
      return;
    } else {
      // setSelectedImage(selectedVoice.img);
      // updateAgentProfile(selectedVoice.img);
    }
  };

  //function for getitng the calenders list
  const getCalenders = async () => {
    try {
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      //// //console.log;

      const ApiPath = Apis.getCalenders;

      //// //console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        //// //console.log;
        setPreviousCalenders(response.data.data);
      }
    } catch (error) {
      //// console.error("Error occured in the api is ", error);
    } finally {
      //// //console.log;
    }
  };

  //update variabels after adding calendar
  const updateAfterAddCalendar = () => {
    const agentLocalDetails = localStorage.getItem(
      PersistanceKeys.LocalStoredAgentsListMain
    );

    if (agentLocalDetails) {
      const agentData = JSON.parse(agentLocalDetails);
      //console.log;
      getCalenders();
      setMainAgentsList(agentData);
    } else {
      //// //console.log;
    }
  };

  const shouldDuplicateAgent = async () => {
    console.log("shouldDuplicateAgent is called", reduxUser?.planCapabilities)
    console.log("canCreateAgent", canCreateAgent)
    console.log("isFreePlan", isFreePlan)
    console.log("currentAgents", currentAgents)
    console.log("maxAgents", maxAgents)
    if (reduxUser?.planCapabilities) {
      if (!canCreateAgent) {
        if (isFreePlan && currentAgents >= 1) {
          setShowUpgradeModal(true)
          setTitle("Unlock your Web Agent")
          setSubTitle("Bring your AI agent to your website allowing them to engage with leads and customers")
          setShowDuplicateConfirmationPopup(false)
          return
        } else if (currentAgents >= maxAgents) {
          setShowMoreAgentsPopup(true)
          setMoreAgentsPopupType("duplicate")
          // setShowDuplicateConfirmationPopup(false)
          return
        }
      }
      handleDuplicate()
    } else {
      // Fallback to localStorage logic
      const user = getUserLocalData();
      if (user?.user?.planCapabilities) {
        // Check if user is on free plan and has reached their limit
        if (user?.user?.plan === null || user?.user?.plan?.price === 0) {
          if (user?.user?.currentUsage?.maxAgents >= user?.user?.planCapabilities?.maxAgents) {
            setShowUpgradePlanModal(true)
            setMoreAgentsPopupType("duplicate")
            // setShowDuplicateConfirmationPopup(false)
            return
          }
        }

        // Check if paid plan user has reached their agent limit
        if (user?.user?.currentUsage?.maxAgents >= user?.user?.planCapabilities?.maxAgents) {
          setShowUpgradePlanModal(true)
          setMoreAgentsPopupType("duplicate")
          // setShowDuplicateConfirmationPopup(false)
          return
        }

        handleDuplicate()
      }
    }
  }

  const handleDuplicate = async () => {

    if (!isPlanActive(reduxUser?.plan)) {
      setShowErrorSnack("Your plan is paused. Activate to duplicate agents")
      setIsVisibleSnack2(true)
      return
    }
    // duplicate agent
    setDuplicateLoader(true);
    try {
      const data = localStorage.getItem("User");

      if (data) {
        const userData = JSON.parse(data);
        const token = AuthToken();
        const ApiPath = Apis.duplicateAgent;

        let apidata = {
          agentId: showDrawerSelectedAgent.id,
        };

        const response = await axios.post(ApiPath, apidata, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        if (response) {
          setDuplicateLoader(false);
          setShowDuplicateConfirmationPopup(false);

          // console.log("duplicate agent data ", response);
          if (response.data.status === true) {
            await refreshUserData();
            setMoreAgentsPopupType("")
            setShowSuccessSnack("Agent duplicated successfully");
            setIsVisibleSnack(true);
            const localAgentsList = localStorage.getItem(
              PersistanceKeys.LocalStoredAgentsListMain
            );

            if (localAgentsList) {
              const agentsList = JSON.parse(localAgentsList);
              // agentsListDetails = agentsList;

              const updatedArray = [response.data.data, ...agentsList];
              localStorage.setItem(
                PersistanceKeys.LocalStoredAgentsListMain,
                JSON.stringify(updatedArray)
              );
              setMainAgentsList(updatedArray);
            }
          } else {
            // setmoreAgentsPopupType("")
            setShowErrorSnack(response.data.message);
            setIsVisibleSnack2(true);
          }
        }
      }
    } catch (error) {
      setDuplicateLoader(false);
      console.error("Error occured in duplicate agent api is", error);
      // setShowErrorSnack("Error occured while duplicating agent");
      const errorMessage =
        error?.response?.data?.message || error?.message || error.toString();

      console.error("Error occurred in duplicate agent API:", errorMessage);
      setShowErrorSnack(`Error: ${errorMessage}`);
      setIsVisibleSnack2(true);
    }
  };

  const handleLanguageChange = async (event) => {
    let value = event.target.value;
    // console.log("selected language is", value);
    // console.log("selected voice is",SelectedVoice)

    // Combined language selection checking - Redux first, localStorage fallback
    if (value === "Multilingual") {
      // Use Redux plan capabilities as primary source
      if (reduxUser?.planCapabilities) {
        if (!isFeatureAllowed('allowLanguageSelection')) {
          // Trigger the upgrade modal from UpgradeTagWithModal
          setShowUpgradePlanModal(true);
          return
        }
      } else {
        // Fallback to localStorage logic
        if (user?.user?.planCapabilities?.allowLanguageSelection === false) {
          // Trigger the upgrade modal from UpgradeTagWithModal
          setShowUpgradePlanModal(true);
          return
        }
      }
    }

    setShowLanguageLoader(true);


    let voice = voicesList.find((voice) => voice.name === SelectedVoice);

    let selectedLanguage =
      value === "English" || value === "Multilingual" ? "en" : "es";

    // console.log("selected langualge", selectedLanguage);
    let voiceData = {};

    voiceData = {
      agentLanguage: value,
    };

    await updateSubAgent(voiceData);

    // if selected language is different from friltered voices list
    if (selectedLanguage != voice.langualge) {
      // update voice list as well
      setFilteredVoices(
        // voicesList.filter((voice) => voice.langualge === selectedLanguage)
        voicesList
      );

      const newVoiceName = selectedLanguage === "en" ? "Ava" : "Maria";
      await updateAgent(newVoiceName);

      setSelectedVoice(newVoiceName);
    }
    setShowLanguageLoader(false);
    // setSelectedVoice(event.target.value);
    setLanguageValue(value);
  };
  const styles = {
    claimPopup: {
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
    findNumberTitle: {
      fontSize: 17,
      fontWeight: "500",
    },
    findNumberDescription: {
      fontSize: 15,
      fontWeight: "500",
    },
    dropdownMenu: {
      fontSize: 15,
      fontWeight: "500",
      color: "#000000",
    },
    modalsStyle: {
      height: "auto",
      bgcolor: "transparent",
      p: 2,
      mx: "auto",
      my: "50vh",
      transform: "translateY(-50%)",
      borderRadius: 2,
      border: "none",
      outline: "none",
    },
    headingStyle: {
      fontSize: 16,
      fontWeight: "700",
    },
    inputStyle: {
      fontSize: 15,
      fontWeight: "500",
      marginTop: 10,
      borderColor: "#00000020",
    },
    paragraph: {
      fontSize: 15,
      fontWeight: "500",
    },
  };

  // ////console.log

  const handleWebhookClick = () => {
    if (reduxUser?.planCapabilities?.allowEmbedAndWebAgents === false) {
      setShowUpgradeModal(true)
      setTitle("Unlock your Web Agent")
      setSubTitle("Bring your AI agent to your website allowing them to engage with leads and customers")
    } else {
      let agent = {
        ...selectedAgentForWebAgent,
        smartListId: selectedSmartList
      }
      setSelectedAgentForWebAgent(agent);
      console.log('selectedAgentForWebAgent after updating', selectedAgentForWebAgent)
      showDrawerSelectedAgent.smartListId = selectedSmartList;
      console.log('showDrawerSelectedAgent after updating', showDrawerSelectedAgent)
      let modelId = showDrawerSelectedAgent?.modelIdVapi || selectedAgentForWebAgent?.agentUuid || ""

      let url = demoBaseUrl + "api/agent/demoAi/" + modelId
      navigator.clipboard
        .writeText(url)
        .then(() => {
          // alert("Embed code copied to clipboard!");
          setShowSuccessSnack("Webhook URL Copied");
          setIsVisibleSnack(true);
          setShowWebAgentModal(false);
          setShowAllSetModal(false);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    }
  };

  const handleCopy = (assistantId, baseUrl) => {
    if (reduxUser?.planCapabilities?.allowEmbedAndWebAgents === false) {
      setShowUpgradeModal(true)
      setTitle("Unlock your Web Agent")
      setSubTitle("Bring your AI agent to your website allowing them to engage with leads and customers")
    } else {

      const iframeCode = `<iframe src="${baseUrl}embed/support/${assistantId}" style="position: fixed; bottom: 0; right: 0; width: 320px; 
  height: 100vh; border: none; background: transparent; z-index: 
  9999; pointer-events: none;" allow="microphone" onload="this.style.pointerEvents = 'auto';">
  </iframe>`;

      navigator.clipboard
        .writeText(iframeCode)
        .then(() => {
          // alert("Embed code copied to clipboard!");
          setShowSuccessSnack("Embed widget copied");
          setIsVisibleSnack(true);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    }
  };


  const handleDrawerClose = async () => {
    setShowDrawerSelectedAgent(null);
    await getProfileDetails()
    // Sync fresh profile data to Redux after profile update
    await syncProfileToRedux();
    setActiveTab("Agent Info");
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Success snack bar */}
      <div>
        <AgentSelectSnackMessage
          isVisible={isVisibleSnack}
          hide={() => {
            setIsVisibleSnack(false);
          }}
          type={SnackbarTypes.Success}
          message={showSuccessSnack}
        />
      </div>
      <div>
        <AgentSelectSnackMessage
          isVisible={isVisibleSnack2}
          hide={() => setIsVisibleSnack2(false)}
          message={showErrorSnack}
          type={SnackbarTypes.Error}
        />

        <AgentSelectSnackMessage
          message={showSnackMsg.message}
          type={showSnackMsg.type}
          isVisible={showSnackMsg.isVisible}
          hide={() => setShowSnackMsg({ type: null, message: "", isVisible: false })}
        />
      </div>

      <div
        className="w-full flex flex-row justify-between items-center py-4 mt-2 px-10"
        style={{ borderBottomWidth: 2, borderBottomColor: "#00000010" }}
      >
        <div className="flex flex-row items-center gap-3">

          <div style={{ fontSize: 24, fontWeight: "600" }}
            onClick={() => {
              console.log("routing to createagent from agents title")
              router.push('/createagent')
            }}
          >
            Agents
          </div>
          {reduxUser?.plan?.planId != null && reduxUser?.planCapabilities?.maxAgents < 1000 && (
            <div style={{ fontSize: 14, fontWeight: "400", color: '#0000080' }}>
              {`${reduxUser?.currentUsage?.maxAgents}/${reduxUser?.planCapabilities?.maxAgents || 0} used`}
            </div>
          )}

          {
            (reduxUser?.plan?.planId != null && reduxUser?.planCapabilities?.maxAgents < 1000) && (
              <Tooltip
                title={`Additional agents are $${reduxUser?.planCapabilities?.costPerAdditionalAgent || 10}/month each.`}
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: "#ffffff", // Ensure white background
                      color: "#333", // Dark text color
                      fontSize: "14px",
                      padding: "10px 15px",
                      borderRadius: "8px",
                      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow
                    },
                  },
                  arrow: {
                    sx: {
                      color: "#ffffff", // Match tooltip background
                    },
                  },
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#000000",
                    cursor: "pointer",
                  }}
                >
                  <Image src="/agencyIcons/InfoIcon.jpg" alt="info" width={16} height={16} className="cursor-pointer rounded-full"
                  // onClick={() => setIntroVideoModal2(true)}
                  />
                </div>
              </Tooltip>
            )
          }
        </div>
        <div className="flex flex-row gap-4 items-center">
          <div className="flex flex-row items-center gap-1  flex-shrink-0 border rounded-full px-4">
            <input
              // style={styles.paragraph}
              className="outline-none border-none w-full bg-transparent focus:outline-none focus:ring-0"
              placeholder="Search an agent"
              value={search}
              onChange={(e) => {

                setSearch(e.target.value);
                if (canGetMore === true) {
                  setCanKeepLoading(true);
                } else {
                  setCanKeepLoading(false);
                }

                // Clear existing timeout to prevent memory leaks
                if (searchTimeoutRef.current) {
                  clearTimeout(searchTimeoutRef.current);
                }
                searchTimeoutRef.current = setTimeout(() => {
                  // handleSearch(e);
                  let searchLoader = true;
                  getAgents(false, e.target.value, searchLoader);
                }, 500);
              }}
            //test code 2 failed
            // onChange={(e) => {
            //   const a = e.target.value;
            //   setSearch(a);

            //   if (a) {
            //     console.log("There was some value");

            //     // ✅ Only save original list once
            //     if (agentsBeforeSearch.length === 0) {
            //       setAgentsBeforeSearch(agentsListSeparated);
            //     }

            //     clearTimeout(searchTimeoutRef.current);
            //     searchTimeoutRef.current = setTimeout(() => {
            //       const searchLoader = true;
            //       getAgents(false, a, searchLoader);
            //     }, 500);
            //   } else {
            //     console.log("There was no value");

            //     // ✅ Restore the original list when search is cleared
            //     setAgentsListSeparated(agentsBeforeSearch);
            //   }

            //   // ✅ Optional: toggle loading based on canGetMore
            //   setCanKeepLoading(canGetMore === true);
            // }}
            />
            <button className="outline-none border-none">
              <Image
                src={"/assets/searchIcon.png"}
                height={24}
                width={24}
                alt="*"
              />
            </button>
          </div>
          <NotficationsDrawer />
          <div
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
            }}
          >
            {/*
              <DashboardSlider needHelp={false} />
            */}
          </div>
        </div>
      </div>

      <div className="w-9/12 items-center " style={{}}>
        {/* code for agents list */}
        {initialLoader ? (
          <div className="h-[70vh] flex flex-row justify-center gap-4">
            {/*<CircularProgress size={45} />*/}
            <MyAgentXLoader />
          </div>
        ) : (
          <AgentsListPaginated
            oldAgentsList={oldAgentsList}
            agentsListSeparatedParam={agentsListSeparated}
            selectedImagesParam={selectedImages}
            handlePopoverClose={handlePopoverClose}
            user={user}
            getAgents={(p, s) => {
              // console.log("p", s);
              getAgents(p, s); //user
            }}
            search={search}
            setObjective={setObjective}
            setOldObjective={setOldObjective}
            setGreetingTagInput={setGreetingTagInput}
            setOldGreetingTagInput={setOldGreetingTagInput}
            setScriptTagInput={setScriptTagInput}
            setOldScriptTagInput={setOldScriptTagInput}
            setShowScriptModal={setShowScriptModal}
            matchingAgent={matchingAgent}
            setShowScript={setShowScript}
            handleShowDrawer={handleShowDrawer}
            handleProfileImgChange={handleProfileImgChange}
            setShowRenameAgentPopup={setShowRenameAgentPopup}
            setSelectedRenameAgent={setSelectedRenameAgent}
            setRenameAgent={setRenameAgent}
            // ShowWarningModal={ShowWarningModal}
            // setShowWarningModal={setShowWarningModal}
            setShowDrawerSelectedAgent={setShowDrawerSelectedAgent}
            setOpenTestAiModal={setOpenTestAiModal}
            mainAgentsList={mainAgentsList}
            setScriptKeys={setScriptKeys}
            setSelectedAgent={setSelectedAgent}
            keys={keys}
            canGetMore={canGetMore}
            paginationLoader={paginationLoader}
            initialLoader={initialLoader}
          />
        )}

        {/* code to add new agent */}
        {agentsListSeparated.length > 0 && (
          <Link
            className="w-full py-6 flex justify-center items-center"
            href=""
            prefetch={true}
            style={{
              // marginTop: 40,
              border: "1px dashed #7902DF",
              borderRadius: "10px",
              // borderColor: '#7902DF',
              boxShadow: "0px 0px 10px 10px rgba(64, 47, 255, 0.05)",
              backgroundColor: "#FBFCFF",
            }}
            onClick={handleAddNewAgent}
          >
            <div
              className="flex flex-row items-center gap-1"
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: "#000",
              }}
            >
              <Plus weight="bold" size={22} /> Add New Agent
            </div>
          </Link>
        )}
      </div>

      {/* Modal to rename the agent */}
      <Modal
        open={showRenameAgentPopup}
        onClose={() => {
          setShowRenameAgentPopup(false);
        }}
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box
          className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12"
          sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
        >
          <div style={{ width: "100%" }}>
            <div
              className="max-h-[60vh] overflow-auto"
              style={{ scrollbarWidth: "none" }}
            >
              <div
                style={{
                  width: "100%",
                  direction: "row",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* <div style={{ width: "20%" }} /> */}
                <div style={{ fontWeight: "700", fontSize: 22 }}>
                  Rename Agent
                </div>
                <div
                  style={{
                    direction: "row",
                    display: "flex",
                    justifyContent: "end",
                  }}
                >
                  <CloseBtn
                    onClick={() => {
                      setShowRenameAgentPopup(null);
                    }}
                  />
                </div>
              </div>

              <div>
                <div
                  className="mt-4"
                  style={{ fontWeight: "600", fontSize: 12, paddingBottom: 5 }}
                >
                  Agent Name
                </div>
                <input
                  value={renameAgent || ""}
                  // value = {showRenameAgentPopup?.name}
                  onChange={(e) => {
                    setRenameAgent(e.target.value);
                  }}
                  placeholder={
                    "Enter agent title"
                    // selectedRenameAgent?.name
                    //   ? selectedRenameAgent.name
                    //   : "Enter agent title"
                  }
                  className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px]"
                  style={{ border: "1px solid #00000020" }}
                />
              </div>
            </div>

            {renameAgentLoader ? (
              <div className="flex flex-row iems-center justify-center w-full mt-4">
                <CircularProgress size={25} />
              </div>
            ) : (
              <button
                className="mt-4 outline-none"
                style={{
                  backgroundColor: "#7902DF",
                  color: "white",
                  height: "50px",
                  borderRadius: "10px",
                  width: "100%",
                  fontWeight: 600,
                  fontSize: "20",
                }}
                onClick={handleRenameAgent}
              >
                Update
              </button>
            )}
          </div>
        </Box>
      </Modal>

      {/* Test ai modal */}

      <Modal
        open={openTestAiModal}
        onClose={() => {
          setOpenTestAiModal(false);
          setName("");
          setPhone("");
          setErrorMessage("");
        }}
        closeAfterTransition
        BackdropProps={{
          timeout: 500,
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-4/12 sm:w-10/12 w-full" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full max-h-[80vh]">
            <div
              className="sm:w-full w-full px-10 py-8 h-full"
              style={{
                backgroundColor: "#ffffff",
                scrollbarWidth: "none",
                borderRadius: "13px",
              }}
            >
              <div className="h-[85%] overflow-auto">
                <div className="flex flex-row justify-between">
                  <div className="flex flex-row gap-3">
                    <Image
                      src={"/otherAssets/testAiIcon.png"}
                      height={19}
                      width={19}
                      alt="icon"
                    />
                    <div
                      style={{ fontSize: 16, fontWeight: "500", color: "#000" }}
                    >
                      Test
                    </div>

                    {!selectedAgent?.phoneNumber && (
                      <div className="flex flex-row items-center gap-2 -mt-1">
                        <Image
                          src={"/assets/warningFill.png"}
                          height={20}
                          width={20}
                          alt="*"
                        />
                        <p>
                          <i
                            className="text-red"
                            style={{
                              fontSize: 12,
                              fontWeight: "600",
                            }}
                          >
                            No phone number assigned
                          </i>
                        </p>
                      </div>
                    )}
                  </div>

                  <CloseBtn
                    onClick={() => {
                      // setShowRenameAgentPopup(null);
                      setOpenTestAiModal(false);
                      setName("");
                      setPhone("");
                      setErrorMessage("");
                    }}
                  />
                  {/* <button
                    onClick={() => {
                      setOpenTestAiModal(false);
                      setName("");
                      setPhone("");
                      setErrorMessage("");
                    }}
                  >
                    <Image
                      src={"/otherAssets/crossIcon.png"}
                      height={24}
                      width={24}
                      alt="*"
                    />
                  </button> */}
                </div>

                <div
                  style={{
                    fontSize: 24,
                    fontWeight: "700",
                    color: "#000",
                    marginTop: 20,
                  }}
                >
                  Tryout ({selectedAgent?.name.slice(0, 1).toUpperCase()}
                  {selectedAgent?.name.slice(1)})
                </div>

                <div className="pt-5" style={styles.headingStyle}>
                  Who are you calling
                </div>
                <input
                  placeholder="Name"
                  className="w-full rounded p-2 outline-none focus:outline-none focus:ring-0"
                  style={{
                    ...styles.inputStyle,
                    border: "1px solid #00000010",
                  }}
                  value={name || ""}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                />

                <div className="pt-5" style={styles.headingStyle}>
                  Phone Number
                </div>

                <div style={{ marginTop: "8px" }}>
                  <PhoneInput
                    className="border outline-none bg-white"
                    country={"us"}
                    onlyCountries={["us", "sv", "pk", "mx"]}
                    disableDropdown={false}
                    countryCodeEditable={false}
                    value={phone}
                    onChange={handlePhoneNumberChange}
                    placeholder={
                      locationLoader ? "Loading location ..." : "Enter Number"
                    }
                    // disabled={loading} // Disable input if still loading
                    style={{ borderRadius: "7px" }}
                    inputStyle={{
                      width: "100%",
                      borderWidth: "0px",
                      backgroundColor: "transparent",
                      paddingLeft: "60px",
                      paddingTop: "20px",
                      paddingBottom: "20px",
                    }}
                    buttonStyle={{
                      border: "none",
                      backgroundColor: "transparent",
                      // display: 'flex',
                      // alignItems: 'center',
                      // justifyContent: 'center',
                    }}
                    dropdownStyle={{
                      maxHeight: "150px",
                      overflowY: "auto",
                    }}
                  // defaultMask={loading ? 'Loading...' : undefined}
                  />
                </div>

                {errorMessage ? (
                  <p
                    style={{
                      ...styles.errmsg,
                      color: errorMessage && "red",
                      height: "20px",
                    }}
                  >
                    {errorMessage}
                  </p>
                ) : (
                  ""
                )}

                <div
                  className="max-h-[37vh] overflow-none"
                  style={{ scrollbarWidth: "none" }}
                >
                  {scriptKeys?.map((key, index) => (
                    <div key={index}>
                      <div className="pt-5" style={styles.headingStyle}>
                        {key[0]?.toUpperCase()}
                        {key?.slice(1)}
                      </div>
                      <input
                        placeholder="Type here"
                        // className="w-full border rounded p-2 outline-none focus:outline-none focus:ring-0 mb-12"
                        className={`w-full rounded p-2 outline-none focus:outline-none focus:ring-0 ${index === scriptKeys?.length - 1 ? "mb-16" : ""
                          }`}
                        style={{
                          ...styles.inputStyle,
                          border: "1px solid #00000010",
                        }}
                        value={inputValues[key] || ""} // Default to empty string if no value
                        onChange={(e) =>
                          handleInputChange(key, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full mt-6 h-[15%]" style={{}}>
                {testAIloader ? (
                  <div className="flex flex-row items-center justify-center w-full p-3 mt-2">
                    <CircularProgress size={30} />
                  </div>
                ) : (
                  <div>
                    {name && phone && (
                      <button
                        // style={{ marginTop: 10 }}
                        className="w-full flex bg-purple p-3 rounded-lg items-center justify-center"
                        onClick={handleTestAiClick}
                      >
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: "500",
                            color: "#fff",
                          }}
                        >
                          Test AI
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Can be use full to add shadow */}
              {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>

      <UpgradeModal
        open={showUpgradeModal}
        handleClose={() => {
          setFeatureTitle("");
          setShowUpgradeModal(false)
        }}
        onUpgradeSuccess={handleUpgradeSuccess}
        title={title || "Unlock More Agents"}
        subTitle={subTitle || "Upgrade to add more agents to your team and scale your calling power"}
        buttonTitle={"No Thanks"}
        functionality="webAgent"
        featureTitle={featureTitle}
      />

      <UpgradePlan
        selectedPlan={null}
        setSelectedPlan={() => { }}
        open={showUpgradePlanModal}
        handleClose={async (upgradeResult) => {
          setShowUpgradePlanModal(false);
          if (upgradeResult) {
            console.log('🔄 [NEW-BILLING] Upgrade successful, refreshing profile...', upgradeResult);
            setShowDuplicateConfirmationPopup(false);
            await refreshUserData();
          }
        }}
        plan={null}
        currentFullPlan={reduxUser?.user?.plan}
      />

      <MoreAgentsPopup
        open={showMoreAgentsPopup}
        onClose={() => setShowMoreAgentsPopup(false)}
        onUpgrade={() => {
          setShowMoreAgentsPopup(false);
          setShowUpgradePlanModal(true);
        }}
        onAddAgent={() => {
          console.log("moreAgentsPopupType", moreAgentsPopupType)
          if (moreAgentsPopupType === "duplicate") {
            setShowMoreAgentsPopup(false);
            handleDuplicate()
          } else if (moreAgentsPopupType === "newagent") {
            handleAddAgentByMoreAgentsPopup()

            // router.push('/createagent')
            // setShowMoreAgentsPopup(false);
          } else {
            //  router.push('/createagent')
            //  setShowMoreAgentsPopup(false);
            handleAddAgentByMoreAgentsPopup()
          }
        }}
        costPerAdditionalAgent={reduxUser?.planCapabilities?.costPerAdditionalAgent || 10}
        from={"myAgentX"}
      />

      <AskToUpgrade
        open={showAskToUpgradeModal}
        handleClose={() => {
          setShowAskToUPgradeModal(false)
        }}
      />

      {/* Error snack bar message */}

      {/* drawer */}

      <Drawer
        anchor="right"
        open={showDrawerSelectedAgent != null}
        onClose={() => {
          handleDrawerClose()
        }}
        PaperProps={{
          sx: {
            width: "45%", // Adjust width as needed
            borderRadius: "20px", // Rounded corners
            padding: "0px", // Internal padding
            boxShadow: 3, // Light shadow
            margin: "1%", // Small margin for better appearance
            backgroundColor: "white", // Ensure it's visible
            height: "96.5vh",
            overflow: "hidden",
            scrollbarWidth: "none",
          },
        }}
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <div
          className="flex flex-col w-full h-full  py-2 px-5 rounded-xl"
        // style={{  }}
        >
          <div
            className="w-full flex flex-col h-[95%]"
            style={{
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarWidth: "none",
            }}
          >
            {/* Agent TOp Info */}
            <div className="flex flex-row items-start justify-between w-full mt-2 ">
              <div className="flex flex-row items-start justify-start mt-2 gap-4">
                {/* Profile Image */}
                <div className="">
                  <button
                    // className='mt-8'
                    onClick={() => {
                      document.getElementById("fileInput").click();
                      // if (typeof document === "undefined") {
                      // }
                    }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <div
                      className="flex flex-row items-end"
                      style={
                        {
                          // border: dragging ? "2px dashed #0070f3" : "",
                        }
                      }
                    >
                      {selectedImage ? (
                        <div style={{ marginTop: "", background: "" }}>
                          <Image
                            src={selectedImage}
                            height={45}
                            width={45}
                            alt="profileImage"
                            className="rounded-full"
                            style={{
                              objectFit: "cover",
                              resize: "cover",
                              height: "74px",
                              width: "74px",
                            }}
                          />
                        </div>
                      ) : (
                        getAgentsListImage(showDrawerSelectedAgent)
                      )}

                      <Image
                        src={"/otherAssets/cameraBtn.png"}
                        style={{ marginLeft: -25 }}
                        height={20}
                        width={20}
                        alt="profileImage"
                      />
                    </div>
                  </button>

                  {/* Hidden file input */}
                  <input
                    value={""}
                    type="file"
                    accept="image/*"
                    id="fileInput"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                  />

                  {/* Global Loader */}
                  {globalLoader && (
                    <CircularLoader
                      globalLoader={globalLoader}
                      setGlobalLoader={setGlobalLoader}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-2 items-start ml-2">
                  <div className="flex flex-row justify-center items-center gap-2">
                    <button
                      onClick={() => {
                        setShowRenameAgentPopup(true);
                        setSelectedRenameAgent(showDrawerSelectedAgent);
                        setRenameAgent(showDrawerSelectedAgent?.name);
                      }}
                    >
                      <div className="flex flex-row items-center gap-2">
                        <Image
                          src={"/svgIcons/editIcon2.svg"}
                          height={24}
                          width={24}
                          alt="*"
                        />
                        <div className="relative group max-w-[150px]">
                          <div className="truncate font-semibold text-[22px]">
                            {showDrawerSelectedAgent?.name
                              ?.slice(0, 1)
                              .toUpperCase()}
                            {showDrawerSelectedAgent?.name?.slice(1)}
                          </div>

                          {/* Tooltip */}
                          <div
                            className="absolute left-0 top-full mt-1 w-max max-w-xs px-2 py-1 rounded-md bg-white
                           shadow-md p-2 text-black text-md font-[500] opacity-0 group-hover:opacity-100 pointer-events-none
                           transition-opacity duration-200 z-50"
                          >
                            {showDrawerSelectedAgent?.name}
                          </div>
                        </div>
                      </div>
                    </button>
                    <div
                      className="text-purple max-w-[140px]"
                      style={{ fontSize: 11, fontWeight: "600" }}
                    >
                      {showDrawerSelectedAgent?.agentObjective}{" "}
                      <span>
                        {" "}
                        |{" "}
                        {showDrawerSelectedAgent?.agentType
                          ?.slice(0, 1)
                          .toUpperCase(0)}
                        {showDrawerSelectedAgent?.agentType?.slice(1)} |{" "}
                      </span>
                    </div>

                    {/* <EmbedWidget
                      assistantId={showDrawerSelectedAgent?.modelIdVapi}
                      setShowSuccessSnack={setShowSuccessSnack}
                      setIsVisible={setIsVisibleSnack}
                      baseUrl={baseUrl}
                    /> */}
                  </div>

                  <div
                    style={{ fontSize: 15, fontWeight: "500", color: "#000" }}
                  >
                    {/* {showDrawer?.phoneNumber} */}
                    {formatPhoneNumber(showDrawerSelectedAgent?.phoneNumber)}
                  </div>

                  <div className="flex flex-row gap-2 items-center ">
                    <div
                      style={{ fontSize: 11, fontWeight: "500", color: "#666" }}
                    >
                      Created on:
                    </div>
                    <div
                      style={{ fontSize: 11, fontWeight: "500", color: "#000" }}
                    >
                      {/* {showDrawer?.createdAt} */}
                      {GetFormattedDateString(
                        showDrawerSelectedAgent?.createdAt
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div>
                  <DuplicateConfirmationPopup
                    open={showDuplicateConfirmationPopup}
                    handleClose={() => setShowDuplicateConfirmationPopup(false)}
                    handleDuplicate={shouldDuplicateAgent}
                    duplicateLoader={duplicateLoader}
                  />
                  <div className="flex flex-col gap-2  ">
                    {/* GPT Button */}

                    {showModelLoader ? (
                      <CircularProgress size={25} />
                    ) : (
                      <div>
                        <button
                          id="gpt"
                          onClick={(event) =>
                            setOpenGptManu(event.currentTarget)
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            borderRadius: "20px",
                            padding: "6px 12px",
                            border: "1px solid #EEE",
                            backgroundColor: "white",
                            // boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.05)",
                            fontSize: "16px",
                            fontWeight: "500",
                            color: "#000",
                            textTransform: "none",
                            "&:hover": { backgroundColor: "#F5F5F5" },
                          }}
                        >
                          <Avatar
                            src={selectedGptManu?.icon}
                            sx={{ width: 24, height: 24, marginRight: 1 }}
                          />
                          {selectedGptManu?.name}
                          <Image
                            src={"/svgIcons/downArrow.svg"}
                            width={18}
                            height={18}
                            alt="*"
                          />
                        </button>

                        <Menu
                          id="gpt"
                          anchorEl={openGptManu}
                          open={openGptManu}
                          onClose={() => setOpenGptManu(null)}
                          sx={{
                            "& .MuiPaper-root": {
                              borderRadius: "12px",
                              padding: "8px",
                              minWidth: "220px",
                            },
                          }}
                        >
                          {models.map((model, index) => (
                            <MenuItem
                              key={index}
                              onClick={() => handleGptManuSelect(model)}
                              disabled={model.disabled}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "10px",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                transition: "background 0.2s",
                                "&:hover": {
                                  backgroundColor: model.disabled
                                    ? "inherit"
                                    : "#F5F5F5",
                                },
                                opacity: model.disabled ? 0.6 : 1,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <Avatar
                                  src={model.icon}
                                  sx={{ width: 24, height: 24 }}
                                />
                                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                                  {model.name}
                                </span>
                              </div>
                              <div
                                style={{
                                  backgroundColor: "#7902DF05",
                                  color: "#7902DF",
                                  padding: "4px 8px",
                                  borderRadius: "12px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  minWidth: "fit-content",
                                }}
                              >
                                {model.responseTime}
                              </div>
                            </MenuItem>
                          ))}
                        </Menu>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <Tooltip title="Duplicate" arrow
                    componentsProps={{
                      tooltip: {
                        sx: {
                          backgroundColor: "#ffffff", // Ensure white background
                          color: "#333", // Dark text color
                          fontSize: "14px",
                          padding: "10px 15px",
                          borderRadius: "8px",
                          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow
                        },
                      },
                      arrow: {
                        sx: {
                          color: "#ffffff", // Match tooltip background
                        },
                      },
                    }}
                  >
                    <div className="cursor-pointer pt-1">
                      <DuplicateButton
                        handleDuplicate={() => {
                          setShowDuplicateConfirmationPopup(true);
                        }}
                        loading={duplicateLoader}
                      />
                    </div>
                  </Tooltip>
                  <Tooltip title="Open Tab"

                    arrow
                    componentsProps={{
                      tooltip: {
                        sx: {
                          backgroundColor: "#ffffff", // Ensure white background
                          color: "#333", // Dark text color
                          fontSize: "14px",
                          padding: "10px 15px",
                          borderRadius: "8px",
                          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow
                        },
                      },
                      arrow: {
                        sx: {
                          color: "#ffffff", // Match tooltip background
                        },
                      },
                    }}
                  >
                    <button onClick={() => {

                      handleWebAgentClick(showDrawerSelectedAgent);
                    }}
                    >
                      <Image
                        src={"/assets/openVoice.png"}
                        alt="*"
                        height={18}
                        width={18}
                      />
                    </button>
                  </Tooltip>
                  <Tooltip title="Embed"
                    arrow
                    componentsProps={{
                      tooltip: {
                        sx: {
                          backgroundColor: "#ffffff", // Ensure white background
                          color: "#333", // Dark text color
                          fontSize: "14px",
                          padding: "10px 15px",
                          borderRadius: "8px",
                          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow
                        },
                      },
                      arrow: {
                        sx: {
                          color: "#ffffff", // Match tooltip background
                        },
                      },
                    }}
                  >
                    <button
                      style={{ paddingLeft: "3px" }}
                      onClick={() => {

                        handleEmbedClick(showDrawerSelectedAgent);

                      }}
                    >
                      <Image src={'/svgIcons/embedIcon.svg'}
                        height={22} width={22} alt="*"
                      />
                    </button>
                  </Tooltip>

                  <Tooltip title="Webhook"
                    arrow
                    componentsProps={{
                      tooltip: {
                        sx: {
                          backgroundColor: "#ffffff", // Ensure white background
                          color: "#333", // Dark text color
                          fontSize: "14px",
                          padding: "10px 15px",
                          borderRadius: "8px",
                          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow
                        },
                      },
                      arrow: {
                        sx: {
                          color: "#ffffff", // Match tooltip background
                        },
                      },
                    }}
                  >
                    <button
                      style={{ paddingLeft: "3px" }}
                      onClick={() => {
                        // handleWebhookClick(showDrawerSelectedAgent?.modelIdVapi, demoBaseUrl)
                        if (reduxUser?.agencyCapabilities?.allowEmbedAndWebAgents === false) {
                          setShowUpgradeModal(true)
                          setTitle("Unlock your Web Agent")
                          setSubTitle("Bring your AI agent to your website allowing them to engage with leads and customers")
                          setFeatureTitle("EmbedAgents");
                        } else {
                          if (reduxUser?.planCapabilities?.allowEmbedAndWebAgents === false) {
                            setShowUpgradeModal(true)
                            setTitle("Unlock your Web Agent")
                            setSubTitle("Bring your AI agent to your website allowing them to engage with leads and customers")
                          } else {

                            setFetureType("webhook")
                            setSelectedAgentForWebAgent(showDrawerSelectedAgent)
                            setShowWebAgentModal(true)
                          }
                        }
                      }}
                    >
                      <Image src={'/svgIcons/webhook.svg'}
                        height={22} width={22} alt="*"
                      />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Center Stats View  */}
            <div className="grid grid-cols-5 gap-6 border p-6 flex-row justify-between w-full rounded-lg mb-6 mt-2 ">
              <Card
                name="Calls"
                value={
                  showDrawerSelectedAgent?.calls &&
                    showDrawerSelectedAgent?.calls > 0 ? (
                    <div>{showDrawerSelectedAgent?.calls}</div>
                  ) : (
                    "-"
                  )
                }
                icon="/svgIcons/selectedCallIcon.svg"
                bgColor="bg-blue-100"
                iconColor="text-blue-500"
              />
              <Card
                name="Convos"
                value={
                  showDrawerSelectedAgent?.callsGt10 &&
                    showDrawerSelectedAgent?.callsGt10 > 0 ? (
                    <div>{showDrawerSelectedAgent?.callsGt10}</div>
                  ) : (
                    "-"
                  )
                }
                icon="/svgIcons/convosIcon2.svg"
                bgColor="bg-purple-100"
                iconColor="text-purple-500"
              />
              <Card
                name="Hot Leads"
                value={
                  <div>
                    {showDrawerSelectedAgent?.hotleads
                      ? showDrawerSelectedAgent?.hotleads
                      : "-"}
                  </div>
                }
                icon="/otherAssets/hotLeadsIcon2.png"
                bgColor="bg-orange-100"
                iconColor="text-orange-500"
              />
              <Card
                name="Booked"
                value={
                  <div>
                    {showDrawerSelectedAgent?.booked
                      ? showDrawerSelectedAgent?.booked
                      : "-"}
                  </div>
                }
                icon="/otherAssets/greenCalenderIcon.png"
                bgColor="bg-green-100"
                iconColor="text-green-500"
              />
              <Card
                name="Mins Talked"
                value={
                  showDrawerSelectedAgent?.totalDuration &&
                    showDrawerSelectedAgent?.totalDuration > 0 ? (
                    // <div>{showDrawer?.totalDuration}</div>
                    <div>
                      {showDrawerSelectedAgent?.totalDuration
                        ? moment
                          .utc(
                            (showDrawerSelectedAgent?.totalDuration || 0) *
                            1000
                          )
                          .format("HH:mm:ss")
                        : "-"}
                    </div>
                  ) : (
                    "-"
                  )
                }
                icon="/otherAssets/minsCounter.png"
                bgColor="bg-green-100"
                iconColor="text-green-500"
              />
            </div>
            {/* Bottom Agent Info */}
            <div className="flex flex-row justify-between items-center pb-2 mb-4">
              {AgentMenuOptions.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${activeTab === tab
                    ? "text-purple border-b-2 border-purple"
                    : "text-black-500"
                    }`}
                  style={{
                    fontSize: 15,
                    fontWeight: "500",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Code for agent info */}
            {activeTab === "Agent Info" ? (
              <div className="w-full">
                <div className="flex flex-col">
                  <div className="flex flex-row items-center justify-between">
                    <div
                      style={{ fontSize: 16, fontWeight: "600", color: "#000" }}
                    >
                      Voice Options
                    </div>
                  </div>
                  {/* Language */}
                  <div className="flex w-full justify-between items-center ">
                    <div
                      style={{ fontSize: 15, fontWeight: "500", color: "#666" }}
                    >
                      Language
                    </div>

                    <div
                      style={{
                        // width: "115px",
                        display: "flex",
                        alignItems: "center",
                        // borderWidth:1,
                        marginRight: -15,
                      }}
                    >
                      {showLanguageLoader ? (
                        <div
                          style={{
                            width: "115px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CircularProgress size={15} />
                        </div>
                      ) : (
                        <FormControl>
                          <Select
                            value={languageValue}
                            onChange={async (event) => {
                              handleLanguageChange(event);
                            }}
                            displayEmpty // Enables placeholder
                            renderValue={(selected) => {
                              if (!selected) {
                                return (
                                  <div style={{ color: "#aaa" }}>Select</div>
                                ); // Placeholder style
                              }
                              const selectedVoice = AgentLanguagesList.find(
                                (lang) => lang?.title === selected
                              );
                              // console.log(
                              //   `Selected Language for ${selected} is ${selectedVoice?.title}`
                              // );
                              //  return selectedVoice ? selectedVoice.title : null;

                              return (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                  }}
                                >
                                  <Image
                                    src={selectedVoice?.flag}
                                    height={22}
                                    width={22}
                                    alt="Selected Language"
                                  />
                                  <div>{selectedVoice?.title}</div>
                                </div>
                              );
                            }}
                            sx={{
                              border: "none", // Default border
                              "&:hover": {
                                border: "none", // Same border on hover
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                border: "none", // Remove the default outline
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                              {
                                border: "none", // Remove outline on focus
                              },
                              "&.MuiSelect-select": {
                                py: 0, // Optional padding adjustments
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: "30vh", // Limit dropdown height
                                  overflow: "auto", // Enable scrolling in dropdown
                                  scrollbarWidth: "none",
                                  // borderRadius: "10px"
                                },
                              },
                            }}
                          >
                            {AgentLanguagesList.map((item, index) => {
                              return (
                                <MenuItem
                                  className="flex flex-row items-center gap-2 bg-purple10 w-full"
                                  value={item?.title}
                                  key={index}
                                  // disabled={item.value === "multi" && (reduxUser?.planCapabilities?.allowLanguageSelection === false)}
                                  style={
                                    item.value === "multi" && reduxUser?.planCapabilities?.allowLanguageSelection === false
                                      ? { pointerEvents: "auto" }
                                      : {}
                                  }
                                >
                                  <Image
                                    src={item?.flag}
                                    alt="*"
                                    height={22}
                                    width={22}
                                  />
                                  <div>{item?.title}</div>
                                  <div
                                    style={{ color: "#00000060", fontSize: 13 }}
                                  >
                                    {item.subLang}
                                  </div>

                                  {
                                    item.value === "multi" && (
                                      // Combined check - Redux first, localStorage fallback
                                      reduxUser?.agencyCapabilities?.allowLanguageSelection === false ? true :
                                      (reduxUser?.planCapabilities ?
                                        !isFeatureAllowed('allowLanguageSelection') :
                                        user?.user?.planCapabilities?.allowLanguageSelection === false
                                      )
                                    ) && (
                                      <UpgradeTagWithModal
                                        externalTrigger={showUpgradePlanModal}
                                        onModalClose={() => setShowUpgradePlanModal(false)}
                                        reduxUser={reduxUser}
                                        setReduxUser={setReduxUser}
                                      />
                                    )
                                  }
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      )}
                    </div>
                  </div>

                  <div className="flex w-full justify-between items-center -mt-4">
                    <div
                      style={{ fontSize: 15, fontWeight: "500", color: "#666" }}
                    >
                      Voice
                    </div>

                    <div
                      style={{
                        // width: "115px",
                        display: "flex",
                        alignItems: "center",
                        // borderWidth:1,
                        marginRight: -15,
                      }}
                    >
                      {showVoiceLoader ? (
                        <div
                          style={{
                            width: "115px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CircularProgress size={15} />
                        </div>
                      ) : (
                        <FormControl>
                          <Select
                            value={SelectedVoice}
                            onChange={handleChangeVoice}
                            displayEmpty // Enables placeholder
                            renderValue={(selected) => {
                              // console.log("selected", selected);
                              if (!selected)
                                return (
                                  <div style={{ color: "#aaa" }}>Select</div>
                                );

                              const selectedVoice = voicesList.find(
                                (voice) => voice.name === selected
                              );

                              return selectedVoice ? (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  {selectedVoice.img && (
                                    <Image
                                      src={selectedVoice.img}
                                      height={30}
                                      width={30}
                                      alt="Selected Voice"
                                    />
                                  )}
                                  <div>{selectedVoice.name}</div>
                                </div>
                              ) : null;
                            }}
                            sx={{
                              border: "none", // Default border
                              "&:hover": { border: "none" }, // Same border on hover
                              "& .MuiOutlinedInput-notchedOutline": {
                                border: "none",
                              }, // Remove the default outline
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                { border: "none" },
                            }}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: "30vh", // Limit dropdown height
                                  overflow: "auto", // Enable scrolling in dropdown
                                  scrollbarWidth: "none",
                                },
                              },
                            }}
                          >
                            {voicesList.map((item, index) => {
                              const selectedVoiceName = (id) => {
                                const voiceName = voicesList.find(
                                  (voice) => voice.voice_id === id
                                );
                                return voiceName?.name || "Unknown";
                              };

                              return (
                                <MenuItem
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginLeft: item.name === "Max" || item.name === "Axel" ? 5 : 0,
                                  }}
                                  value={item.name}
                                  key={index}
                                  disabled={SelectedVoice === item.name}
                                >
                                  <Image
                                    src={item.img}
                                    height={item.name === "Axel" || item.name === "Max" ? 40 : 35}
                                    width={item.name === "Axel" || item.name === "Max" ? 22 : 35}
                                    alt="*"
                                  />
                                  <div>{item.name}</div>

                                  {/* Play/Pause Button (Prevents dropdown close) */}
                                  {item.preview ? (
                                    <div //style={{marginLeft:15}}
                                      onClick={(e) => {
                                        // console.log(
                                        //   "audio preview ",
                                        //   item.preview
                                        // );
                                        e.stopPropagation(); // Prevent dropdown from closing
                                        e.preventDefault(); // Prevent selection event

                                        if (preview === item.preview) {
                                          if (audio) {
                                            audio.pause();
                                            audio.removeEventListener("ended", () => { });
                                          }
                                          setPreview(null);
                                        } else {

                                          playVoice(item.preview);
                                        }
                                      }}
                                    >
                                      {preview === item.preview ? (
                                        <PauseCircle
                                          size={38}
                                          weight="regular"
                                        />
                                      ) : (
                                        <Image
                                          src={"/assets/play.png"}
                                          height={25}
                                          width={25}
                                          alt="*"
                                        />
                                      )}
                                    </div>
                                  ) : (
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowNoAudioModal(item);
                                      }}
                                    >
                                      <Image
                                        src={"/assets/play.png"}
                                        height={25}
                                        width={25}
                                        alt="*"
                                      />
                                    </div>
                                  )}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      )}
                    </div>
                  </div>
                  {/* Expression */}
                  <div className="flex w-full justify-between items-center -mt-4">
                    <div
                      style={{ fontSize: 15, fontWeight: "500", color: "#666" }}
                    >
                      Personality
                    </div>

                    <div
                      style={{
                        // width: "115px",
                        display: "flex",
                        alignItems: "center",
                        // borderWidth:1,
                        marginRight: -15,
                      }}
                    >
                      {showVoiceExpressivenessLoader ? (
                        <div
                          style={{
                            width: "115px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CircularProgress size={15} />
                        </div>
                      ) : (
                        <FormControl>
                          <Select
                            value={voiceExpressiveness}
                            onChange={async (event) => {
                              setShowVoiceExpressivenessLoader(true);
                              let value = event.target.value;
                              //console.log;
                              let voiceData = {
                                voiceExpressiveness: value,
                              };
                              await updateSubAgent(voiceData);
                              setShowVoiceExpressivenessLoader(false);
                              setVoiceExpressiveness(value);
                            }}
                            displayEmpty // Enables placeholder
                            renderValue={(selected) => {
                              if (!selected) {
                                return (
                                  <div style={{ color: "#aaa" }}>Select</div>
                                ); // Placeholder style
                              }
                              const selectedVoice =
                                voiceExpressivenessList.find(
                                  (voice) => voice.value === selected
                                );
                              return selectedVoice
                                ? selectedVoice?.title
                                : null;
                            }}
                            sx={{
                              border: "none", // Default border
                              "&:hover": {
                                border: "none", // Same border on hover
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                border: "none", // Remove the default outline
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                              {
                                border: "none", // Remove outline on focus
                              },
                              "&.MuiSelect-select": {
                                py: 0, // Optional padding adjustments
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: "30vh", // Limit dropdown height
                                  overflow: "auto", // Enable scrolling in dropdown
                                  scrollbarWidth: "none",
                                  // borderRadius: "10px"
                                },
                              },
                            }}
                          >
                            {voiceExpressivenessList.map((item, index) => {
                              return (
                                <MenuItem
                                  value={item?.value}
                                  key={index}
                                  disabled={voiceExpressiveness === item?.title}
                                >
                                  <div>{item?.title}</div>
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      )}
                    </div>
                  </div>
                  {/* Talking Pace */}
                  <div className="flex w-full justify-between items-center -mt-4">
                    <div
                      style={{ fontSize: 15, fontWeight: "500", color: "#666" }}
                    >
                      Talking Pace
                    </div>

                    <div
                      style={{
                        // width: "115px",
                        display: "flex",
                        alignItems: "center",
                        // borderWidth:1,
                        marginRight: -15,
                      }}
                    >
                      {showStartingPaceLoader ? (
                        <div
                          style={{
                            width: "115px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CircularProgress size={15} />
                        </div>
                      ) : (
                        <FormControl>
                          <Select
                            value={startingPace}
                            onChange={async (event) => {
                              setShowStartingPaceLoader(true);
                              let value = event.target.value;
                              //console.log;
                              let voiceData = {
                                talkingPace: value,
                              };
                              await updateSubAgent(voiceData);
                              setShowStartingPaceLoader(false);
                              // setSelectedVoice(event.target.value);
                              setStartingPace(value);
                            }}
                            displayEmpty // Enables placeholder
                            renderValue={(selected) => {
                              if (!selected) {
                                return (
                                  <div style={{ color: "#aaa" }}>Select</div>
                                ); // Placeholder style
                              }
                              const selectedVoice = TalkingPaceList.find(
                                (voice) => voice.value === selected
                              );
                              return selectedVoice
                                ? selectedVoice?.title
                                : null;
                            }}
                            sx={{
                              border: "none", // Default border
                              "&:hover": {
                                border: "none", // Same border on hover
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                border: "none", // Remove the default outline
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                              {
                                border: "none", // Remove outline on focus
                              },
                              "&.MuiSelect-select": {
                                py: 0, // Optional padding adjustments
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: "30vh", // Limit dropdown height
                                  overflow: "auto", // Enable scrolling in dropdown
                                  scrollbarWidth: "none",
                                  // borderRadius: "10px"
                                },
                              },
                            }}
                          >
                            {TalkingPaceList.map((item, index) => {
                              return (
                                <MenuItem
                                  value={item.value}
                                  key={index}
                                  disabled={startingPace === item?.title}
                                >
                                  <div>{item?.title}</div>
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      )}
                    </div>
                  </div>

                  {/* Patience level */}
                  <div className="flex w-full justify-between items-center -mt-4">
                    <div
                      style={{ fontSize: 15, fontWeight: "500", color: "#666" }}
                    >
                      Response Speed
                    </div>

                    <div
                      style={{
                        // width: "115px",
                        display: "flex",
                        alignItems: "center",
                        // borderWidth:1,
                        marginRight: -15,
                      }}
                    >
                      {showPatienceLoader ? (
                        <div
                          style={{
                            width: "115px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CircularProgress size={15} />
                        </div>
                      ) : (
                        <FormControl>
                          <Select
                            value={patienceValue}
                            onChange={async (event) => {
                              setShowPatienceLoader(true);
                              let value = event.target.value;
                              //console.log;
                              let voiceData = {
                                responseSpeed: value,
                              };
                              await updateSubAgent(voiceData);
                              setShowPatienceLoader(false);
                              // setSelectedVoice(event.target.value);
                              setPatienceValue(value);
                            }}
                            displayEmpty // Enables placeholder
                            renderValue={(selected) => {
                              if (!selected) {
                                return (
                                  <div style={{ color: "#aaa" }}>Select</div>
                                ); // Placeholder style
                              }
                              const selectedVoice = ResponseSpeedList.find(
                                (voice) => voice.value === selected
                              );
                              console
                                .log
                                // `Selected Patience Level for ${selected} is ${selectedVoice?.title}`
                                ();
                              return selectedVoice
                                ? selectedVoice?.title
                                : null;
                            }}
                            sx={{
                              border: "none", // Default border
                              "&:hover": {
                                border: "none", // Same border on hover
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                border: "none", // Remove the default outline
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                              {
                                border: "none", // Remove outline on focus
                              },
                              "&.MuiSelect-select": {
                                py: 0, // Optional padding adjustments
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: "30vh", // Limit dropdown height
                                  overflow: "auto", // Enable scrolling in dropdown
                                  scrollbarWidth: "none",
                                  // borderRadius: "10px"
                                },
                              },
                            }}
                          >
                            {ResponseSpeedList.map((item, index) => {
                              return (
                                <MenuItem
                                  value={item.value}
                                  key={index}
                                  disabled={patienceValue === item?.title}
                                >
                                  <div>{item?.title}</div>
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 mt-4">
                  <div
                    style={{ fontSize: 16, fontWeight: "600", color: "#000" }}
                  >
                    Contact
                  </div>

                  <div className="flex justify-between items-center">
                    <div
                      style={{ fontSize: 15, fontWeight: "500", color: "#666" }}
                    >
                      Number used for calls
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: "500",
                        color: "#000",
                      }}
                    >
                      {showPhoneLoader ? (
                        <div
                          style={{
                            width: "150px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CircularProgress size={15} />
                        </div>
                      ) : (
                        <Box className="w-full">
                          <FormControl className="w-full">
                            <Select
                              ref={selectRef}
                              open={openCalimNumDropDown}
                              onClose={() => setOpenCalimNumDropDown(false)}
                              onOpen={() => setOpenCalimNumDropDown(true)}
                              className="border-none rounded-2xl outline-none p-0 m-0"
                              displayEmpty
                              value={assignNumber}
                              // onChange={handleSelectNumber}
                              // onChange={(e) => {
                              //   let value = e.target.value;
                              //   console.log(
                              //     "Assign number here: Value changed",
                              //     value
                              //   );
                              //   // return;
                              //   setAssignNumber(value);
                              //   // setOpenCalimNumDropDown(false);
                              // }}
                              renderValue={(selected) => {
                                if (selected === "") {
                                  return <div>Select Number</div>;
                                }
                                return (
                                  <div
                                    style={{
                                      fontSize: 15,
                                      fontWeight: "500",
                                      color: "#000",
                                    }}
                                  >
                                    <div>{selected}</div>
                                  </div>
                                );
                              }}
                              sx={{
                                ...styles.dropdownMenu,
                                backgroundColor: "none",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  border: "none",
                                },
                                padding: 0,
                                margin: 0,
                              }}
                            >
                              {previousNumber?.map((item, index) => {
                                // //console.log;
                                // //console.log;
                                return (
                                  <MenuItem
                                    key={index}
                                    style={styles.dropdownMenu}
                                    value={item.phoneNumber.slice(1)}
                                    className="flex flex-row items-center gap-2 "
                                    disabled={
                                      assignNumber?.replace("+", "") ===
                                      item.phoneNumber.replace("+", "")
                                    }
                                    onClick={(e) => {
                                      //console.log;
                                      // return;
                                      if (showReassignBtn && item?.claimedBy) {
                                        e.stopPropagation();
                                        setShowConfirmationModal(item);
                                        // console.log(
                                        //   "Hit release number api",
                                        //   item
                                        // );
                                        // AssignNumber
                                      } else {
                                        //console.log;
                                        //// console.log(
                                        //   "Should call assign number api"
                                        // );
                                        // return;
                                        AssignNumber(item.phoneNumber);
                                        //// console.log(
                                        //   "Updated number is",
                                        //   item.phoneNumber
                                        // );
                                      }
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: numberDropDownWidth(
                                          item?.claimedBy?.name
                                        ),
                                      }}
                                    >
                                      {item.phoneNumber}
                                    </div>
                                    {showReassignBtn && (
                                      <div
                                        className="w-full"
                                      // onClick={(e) => {
                                      //   console.log(
                                      //     "Should open confirmation modal"
                                      //   );
                                      //   e.stopPropagation();
                                      //   setShowConfirmationModal(item);
                                      // }}
                                      >
                                        {item.claimedBy && (
                                          <div className="flex flex-row items-center gap-2">
                                            {showDrawerSelectedAgent?.name !==
                                              item.claimedBy.name && (
                                                <div>
                                                  <span className="text-[#15151570]">{`(Claimed by ${item.claimedBy.name}) `}</span>
                                                  {reassignLoader === item ? (
                                                    <CircularProgress size={15} />
                                                  ) : (
                                                    <button
                                                      className="text-purple underline"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowConfirmationModal(
                                                          item
                                                        );
                                                      }}
                                                    >
                                                      Reassign
                                                    </button>
                                                  )}
                                                </div>
                                              )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </MenuItem>
                                );
                              })}
                              <MenuItem
                                style={styles.dropdownMenu}
                                value={showGlobalBtn ? 16505403715 : ""}
                                // disabled={!showGlobalBtn}
                                disabled={
                                  (assignNumber &&
                                    assignNumber.replace("+", "") ===
                                    Constants.GlobalPhoneNumber.replace(
                                      "+",
                                      ""
                                    )) ||
                                  (showDrawerSelectedAgent &&
                                    showDrawerSelectedAgent.agentType ===
                                    "inbound")
                                }
                                onClick={() => {
                                  // console.log(
                                  //   "This triggers when user clicks on assigning global number",
                                  //   assignNumber
                                  // );
                                  // return;
                                  AssignNumber(Constants.GlobalPhoneNumber);
                                  // handleReassignNumber(showConfirmationModal);
                                }}
                              >
                                {Constants.GlobalPhoneNumber}
                                {showGlobalBtn &&
                                  " (available for testing calls only)"}
                                {showGlobalBtn == false &&
                                  " (Only for outbound agents. You must buy a number)"}
                              </MenuItem>
                              <div
                                className="ms-4 pe-4"
                                style={{
                                  ...styles.inputStyle,
                                  color: "#00000070",
                                }}
                              >
                                <i>Get your own unique phone number.</i>{" "}
                                <button
                                  className="text-purple underline"
                                  onClick={() => {
                                    setShowClaimPopup(true);
                                  }}
                                >
                                  Claim one
                                </button>
                              </div>
                            </Select>
                          </FormControl>
                        </Box>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex flex-row gap-3">
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: "500",
                          color: "#666",
                        }}
                      >
                        Call back number
                      </div>
                      <div
                      // aria-owns={open ? 'mouse-over-popover' : undefined}
                      // aria-haspopup="true"
                      // onMouseEnter={handlePopoverOpen}
                      // onMouseLeave={handlePopoverClose}
                      ></div>
                      {/* Code for popover */}
                    </div>

                    <div className="flex flex-row items-center justify-between gap-2">
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: "400",
                          color: "#000",
                        }}
                      >
                        {showDrawerSelectedAgent?.callbackNumber ? (
                          <div>{showDrawerSelectedAgent?.callbackNumber}</div>
                        ) : (
                          "-"
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setShowEditNumberPopup(
                            showDrawerSelectedAgent?.callbackNumber
                          );
                          setSelectedNumber("Callback");
                        }}
                      >
                        <Image
                          src={"/svgIcons/editIcon2.svg"}
                          height={24}
                          width={24}
                          alt="*"
                        />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <div className="flex flex-row gap-3">
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: "500",
                          color: "#666",
                        }}
                      >
                        Call transfer number
                      </div>
                    </div>
                    {
                      reduxUser?.agencyCapabilities?.allowLiveCallTransfer === false ? (
                        <UpgradeTagWithModal
                          reduxUser={reduxUser}
                          setReduxUser={setReduxUser}
                          requestFeature={true}
                        />
                      ) : !allowLiveCallTransfer ? (
                        <UpgradeTagWithModal
                          reduxUser={reduxUser}
                          setReduxUser={setReduxUser}
                        />
                      ) :
                        (
                          <div className="flex flex-row items-center justify-between gap-2">
                            <div>
                              {showDrawerSelectedAgent?.liveTransferNumber ? (
                                <div>
                                  {showDrawerSelectedAgent?.liveTransferNumber}
                                </div>
                              ) : (
                                "-"
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setShowEditNumberPopup(
                                  showDrawerSelectedAgent?.liveTransferNumber
                                );
                                setSelectedNumber("Calltransfer");
                              }}
                            >
                              <Image
                                src={"/svgIcons/editIcon2.svg"}
                                height={24}
                                width={24}
                                alt="*"
                              />
                            </button>
                          </div>
                        )
                    }
                  </div>
                </div>

                <div className="w-full">
                  <EditPhoneNumberModal
                    open={showEditNumberPopup}
                    close={() => setShowEditNumberPopup(null)}
                    number={showEditNumberPopup && showEditNumberPopup}
                    title={
                      selectedNumber === "Callback"
                        ? "Call Back Number"
                        : "Call Transfer Number"
                    }
                    loading={loading}
                    update={async (value) => {
                      let data = "";
                      if (selectedNumber === "Callback") {
                        data = {
                          callbackNumber: value,
                        };
                      } else {
                        data = {
                          liveTransferNumber: value,
                        };
                      }
                      //console.log;
                      setLoading(true);
                      await updateSubAgent(data);
                      setLoading(false);
                      setShowEditNumberPopup(null);
                    }}
                  />
                </div>
              </div>
            ) : activeTab === "Actions" ? (
              user?.agencyCapabilities?.allowToolsAndActions === false ? (
                <UpgardView
                  setShowSnackMsg={setShowSnackMsg}
                  title={"Unlock Actions"}
                  subTitle={"Upgrade to enable AI booking, calendar sync, and advanced tools to give you AI like Gmail, Hubspot and 10k+ tools."}
                />
              ) : !allowToolsAndActions ? (
                <UpgardView
                  setShowSnackMsg={setShowSnackMsg}
                  title={"Unlock Actions"}
                  subTitle={"Upgrade to enable AI booking, calendar sync, and advanced tools to give you AI like Gmail, Hubspot and 10k+ tools."}
                />
              ) :
                <div className="w-full">
                  <div
                    className=" lg:flex hidden  xl:w-[350px] lg:w-[350px]"
                    style={
                      {
                        // backgroundColor: "red"
                      }
                    }
                  ></div>

                  <ActionsTab
                    calendarDetails={calendarDetails}
                    setUserDetails={setMainAgentsList}
                    selectedAgent={showDrawerSelectedAgent}
                    setSelectedAgent={setShowDrawerSelectedAgent}
                    mainAgentId={MainAgentId}
                    previousCalenders={previousCalenders}
                    updateVariableData={updateAfterAddCalendar}
                    setShowUpgradeModal={setShowUpgradeModal}
                    activeTab={activeTab}
                    showDrawerSelectedAgent={showDrawerSelectedAgent}
                    setShowAddScoringModal={setShowAddScoringModal}
                    setShowDrawerSelectedAgent={setShowDrawerSelectedAgent}
                  />

                  {/* Calendar Section 
                  <UserCalender
                    calendarDetails={calendarDetails}
                    setUserDetails={setMainAgentsList}
                    selectedAgent={showDrawerSelectedAgent}
                    setSelectedAgent={setShowDrawerSelectedAgent}
                    mainAgentId={MainAgentId}
                    previousCalenders={previousCalenders}
                    updateVariableData={updateAfterAddCalendar}
                    setShowUpgradeModal={setShowUpgradeModal}
                  />*/}

                  {/* Lead Scoring Section 
                  <LeadScoring
                    activeTab={activeTab}
                    showDrawerSelectedAgent={showDrawerSelectedAgent}
                    setShowAddScoringModal={setShowAddScoringModal}

                  />*/}
                </div>
            ) : activeTab === "Pipeline" ? (
              <div className="flex flex-col gap-4">
                <PiepelineAdnStage
                  selectedAgent={showDrawerSelectedAgent}
                  UserPipeline={UserPipeline}
                  mainAgent={calendarDetails}
                />
              </div>
            ) : activeTab === "Knowledge" ? (
              user?.agencyCapabilities?.allowKnowledgeBases === false ? (
                <UpgardView
                  setShowSnackMsg={setShowSnackMsg}
                  title={"Unlock Knowledge Base"}
                  subTitle={"Upgrade to enable custom knowledge bases and document uploads for your AI agents."}
                />
              ) : !allowKnowledgeBases ? (
                <UpgardView
                  setShowSnackMsg={setShowSnackMsg}
                  title={"Unlock Knowledge Base"}
                  subTitle={"Upgrade to enable custom knowledge bases and document uploads for your AI agents."}
                />
              ) : (
                <div className="flex flex-col gap-4">
                  <Knowledgebase user={reduxUser} agent={showDrawerSelectedAgent}
                    setShowUpgradeModal={setShowUpgradeModal}
                  />
                </div>
              )
            ) : activeTab === "Voicemail" ? (
              user?.agencyCapabilities?.allowVoicemail === false ? (
                <UpgardView
                  setShowSnackMsg={setShowSnackMsg}
                  title={"Unlock Voicemail"}
                  subTitle={"Upgrade to enable voicemail features for your outbound agents."}
                />
              ) : !allowVoicemail ? (
                <UpgardView
                  setShowSnackMsg={setShowSnackMsg}
                  title={"Unlock Voicemail"}
                  subTitle={"Upgrade to enable voicemail features for your outbound agents."}
                />
              ) : (
                <div className="flex flex-col gap-4 w-full">
                  <VoiceMailTab
                    setMainAgentsList={setMainAgentsList}
                    agent={showDrawerSelectedAgent}
                    setShowDrawerSelectedAgent={setShowDrawerSelectedAgent}
                    kycsData={kycsData}
                    uniqueColumns={uniqueColumns}
                  />
                </div>
              )
            ) : (
              ""
            )}
          </div>
          {/* Delete agent button */}
          <div className="w-full flex flex-row items-center justify-end">
            <button
              className="flex flex-row gap-2 items-center"
              onClick={() => {
                setDelAgentModal(true);
              }}
              style={
                {
                  // // marginTop: 20,
                  // alignSelf: "end",
                  // position: "absolute",
                  // bottom: "7%",
                }
              }
            >
              {/* <Image src={'/otherAssets/redDeleteIcon.png'}
                height={24}
                width={24}
                alt='del'
              /> */}

              <Image
                src={"/otherAssets/redDeleteIcon.png"}
                height={24}
                width={24}
                alt="del"
                style={{
                  filter: "brightness(0) saturate(100%) opacity(0.5)", // Convert to black and make semi-transparent
                }}
              />

              <div
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: "#15151590",
                  textDecorationLine: "underline",
                }}
              >
                Delete Agent
              </div>
            </button>
          </div>
        </div >
      </Drawer >

      {/* Code to del agent */}
      < Modal
        open={delAgentModal}
        onClose={() => {
          setDelAgentModal(false);
        }
        }
        BackdropProps={{
          timeout: 200,
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box
          className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 p-8 rounded-[15px]"
          sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
        >
          <div style={{ width: "100%" }}>
            <div
              className="max-h-[60vh] overflow-auto"
              style={{ scrollbarWidth: "none" }}
            >
              <div
                style={{
                  width: "100%",
                  direction: "row",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* <div style={{ width: "20%" }} /> */}
                <div style={{ fontWeight: "500", fontSize: 17 }}>
                  Delete Agent
                </div>
                <div
                  style={{
                    direction: "row",
                    display: "flex",
                    justifyContent: "end",
                  }}
                >
                  <button
                    onClick={() => {
                      setDelAgentModal(false);
                    }}
                    className="outline-none"
                  >
                    <Image
                      src={"/assets/crossIcon.png"}
                      height={40}
                      width={40}
                      alt="*"
                    />
                  </button>
                </div>
              </div>

              <div className="mt-6" style={{ fontWeight: "700", fontSize: 22 }}>
                This is irreversible. Are you sure?
              </div>
            </div>

            <div className="flex flex-row items-center gap-4 mt-6">
              <button className="w-1/2 text-[#6b7280] outline-none  h-[50px] outline-none">
                Cancel
              </button>
              <div className="w-1/2">
                {DelLoader ? (
                  <div className="flex flex-row iems-center justify-center w-full mt-4">
                    <CircularProgress size={25} />
                  </div>
                ) : (
                  <button
                    className="outline-none bg-red"
                    style={{
                      color: "white",
                      height: "50px",
                      borderRadius: "10px",
                      width: "100%",
                      fontWeight: 600,
                      fontSize: "20",
                    }}
                    onClick={handleDeleteAgent}
                  >
                    Yes! Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </Box>
      </Modal >

      {/*  Test comment */}
      {/* Code for the confirmation of reassign button */}
      <Modal
        open={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(null);
        }}
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box
          className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-5/12 p-8 rounded-[15px]"
          sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
        >
          <div style={{ width: "100%" }}>
            <div
              className="max-h-[60vh] overflow-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {/* <div style={{ width: "100%", direction: "row", display: "flex", justifyContent: "end", alignItems: "center" }}>
                <div style={{ direction: "row", display: "flex", justifyContent: "end" }}>
                  <button onClick={() => {
                    setShowWarningModal(false);
                  }} className='outline-none'>
                    <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                  </button>
                </div>
              </div> */}

              <div className="flex flex-row items-center justify-between w-full">
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: "600",
                  }}
                >
                  Reassign Number
                </div>
                <CloseBtn
                  onClick={() => {
                    setShowConfirmationModal(null);
                  }}
                />
              </div>

              <div
                className="mt-8"
                style={{
                  fontSize: 22,
                  fontWeight: "600",
                }}
              >
                Confirm Action
              </div>

              <p
                className="mt-8"
                style={{
                  fontSize: 15,
                  fontWeight: "500",
                }}
              >
                Please confirm you would like to reassign{" "}
                <span className="text-purple">
                  {formatPhoneNumber(showConfirmationModal?.phoneNumber)}
                </span>{" "}
                to {showDrawerSelectedAgent?.name}.
                {/* {`{${showDrawer?.name}}`}. */}
              </p>
            </div>

            <div className="flex flex-row items-center gap-4 mt-6">
              <button
                className="mt-4 outline-none w-1/2"
                style={{
                  color: "black",
                  height: "50px",
                  borderRadius: "10px",
                  width: "100%",
                  fontWeight: 600,
                  fontSize: "20",
                }}
                onClick={() => {
                  setShowClaimPopup(null);
                  setAssignNumber(showDrawerSelectedAgent?.phoneNumber || "");
                  setShowConfirmationModal(false);
                }}
              >
                Discard
              </button>
              <div className="w-full">
                {reassignLoader ? (
                  <div className="mt-4 w-full flex flex-row items-center justify-center">
                    <CircularProgress size={25} />
                  </div>
                ) : (
                  <button
                    className="mt-4 outline-none bg-purple w-full"
                    style={{
                      color: "white",
                      height: "50px",
                      borderRadius: "10px",
                      width: "100%",
                      fontWeight: 600,
                      fontSize: "20",
                    }}
                    onClick={() => {
                      handleReassignNumber(showConfirmationModal);
                      ////console.log
                    }}
                  >
                    {`I'm sure`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </Box>
      </Modal>

      {/* code for script */}

      <Modal
        open={showScriptModal}
        onClose={() => {
          handleCloseScriptModal();
        }}
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box
          className="w-10/12 h-[90%] sm:w-[760px] p-8 rounded-[15px]"
          sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
        >
          <div style={{ width: "100%" }}>
            <div className="h-[90vh]" style={{ scrollbarWidth: "none" }}>
              <div
                style={{
                  height: "8%",
                  width: "100%",
                  direction: "row",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* <div style={{ width: "20%" }} /> */}
                <div style={{ fontWeight: "600", fontSize: 22 }}>
                  {showScriptModal?.name?.slice(0, 1).toUpperCase(0)}
                  {showScriptModal?.name?.slice(1)}
                </div>
                <div
                  style={{
                    direction: "row",
                    display: "flex",
                    justifyContent: "end",
                  }}
                >
                  <button
                    onClick={() => {
                      handleCloseScriptModal();
                    }}
                    className="outline-none"
                  >
                    <Image
                      src={"/assets/crossIcon.png"}
                      height={40}
                      width={40}
                      alt="*"
                    />
                  </button>
                </div>
              </div>

              <div
                className="mt-4 flex flex-row gap-6"
                style={{ height: "", fontWeight: "500", fontSize: 15 }}
              >
                <button
                  className="px-2 pb-1"
                  style={{
                    borderBottom: showScript && "2px solid #7902DF",
                  }}
                  onClick={handleShowScript}
                >
                  Script
                </button>
                <button
                  className="px-2 pb-1"
                  style={{
                    borderBottom: SeledtedScriptKYC && "2px solid #7902DF",
                  }}
                  onClick={handleShowKycs}
                >
                  KYC
                </button>
                <button
                  className="px-2 pb-1"
                  style={{
                    borderBottom:
                      SeledtedScriptAdvanceSetting && "2px solid #7902DF",
                  }}
                  onClick={handleShowAdvanceSeting}
                >
                  Advanced Settings
                </button>
              </div>

              {showScript && (
                <div style={{ height: "73%", borderWidth: 0 }}>
                  <div
                    style={{
                      height: showSaveChangesBtn ? "95%" : "100%",
                      borderWidth: 0,
                    }}
                  >
                    <div className="bg-[#00000002] p-2 mt-2">
                      <div
                        style={styles.inputStyle}
                        className="flex flex-row items-center gap-2"
                      >
                        <Image
                          src={"/assets/lightBulb.png"}
                          alt="*"
                          height={24}
                          width={24}
                        />{" "}
                        Editing Tips
                      </div>
                      <div
                        style={styles.inputStyle}
                        className="flex flex-row flex-wrap gap-2"
                      >
                        <div>You can use these variables:</div>
                        {/* <div className='flex flex-row items-center gap-2'> */}
                        <div
                          style={{ width: "fit-content" }}
                          className="text-purple flex flex-row gap-2"
                        >
                          {`{Address}`},{`{Phone}`}, {`{Email}`},{`{Kyc}`}
                          {/* {`{First Name}`}, {`{Email}`}, */}
                        </div>

                        {uniqueColumns?.length > 0 && showMoreUniqueColumns ? (
                          <div className="flex flex-row flex-wrap gap-2">
                            {uniqueColumns.map((item, index) => (
                              <div
                                key={index}
                                className="flex flex-row items-center gap-2 text-purple"
                              >
                                {`{${item}}`},
                              </div>
                            ))}
                            <button
                              className="text-purple outline-none"
                              onClick={handleShowUniqueCols}
                            >
                              show less
                            </button>
                          </div>
                        ) : (
                          <div>
                            {uniqueColumns?.length > 0 && (
                              <button
                                className="text-purple flex flex-row items-center font-bold outline-none"
                                onClick={() => {
                                  handleShowUniqueCols();
                                }}
                              >
                                <Plus
                                  weight="bold"
                                  size={15}
                                  style={{
                                    strokeWidth: 40, // Adjust as needed
                                  }}
                                />
                                {uniqueColumns?.length}
                              </button>
                            )}
                          </div>
                        )}

                        {/* </div> */}
                      </div>
                    </div>

                    <div className="w-full">
                      <div className="w-5/12">
                        <VideoCard
                          duration={"13 min 56 sec"}
                          width="60"
                          height="40"
                          horizontal={false}
                          playVideo={() => {
                            setIntroVideoModal(true);
                          }}
                          title="Learn how to customize your script"
                        />
                      </div>

                      {/* <div
                        className="mt-4"
                        style={{ fontSize: 24, fontWeight: "700" }}
                      >
                        Script
                      </div> */}

                      <div
                        style={{ fontSize: 24, fontWeight: "700" }}
                        className="flex flex-row items-center center w-full justify-between"
                      >
                        <div>Script</div>
                      </div>

                      <div className="flex flex-row items-center justify-between">
                        <div
                          className="mt-2"
                          style={{ ...styles.paragraph, color: "#00000060" }}
                        >
                          Greeting
                        </div>

                        <button
                          className="flex flex-row items-center gap-2 h-[43px] rounded-md bg-purple text-white px-4"
                          style={{
                            fontWeight: "500",
                            fontSize: 15,
                          }}
                          onClick={() => {
                            window.open(
                              "https://chatgpt.com/g/g-0O0jItKdk-agentx-script-builder",
                              "_blank"
                            );
                          }}
                        >
                          Use Script Builder
                          <ArrowUpRight size={20} color="white" />
                        </button>
                      </div>

                      <div className="mt-2">
                        <GreetingTagInput
                          greetTag={showScriptModal?.prompt?.greeting}
                          kycsList={kycsData}
                          uniqueColumns={uniqueColumns}
                          tagValue={(text) => {
                            setGreetingTagInput(text);
                            let agent = showScriptModal;
                            agent.prompt.greeting = text;
                            setShowScriptModal(agent);
                          }}
                          scrollOffset={scrollOffset}
                        />
                      </div>
                      <div className="mt-4 w-full ">
                        <PromptTagInput
                          promptTag={scriptTagInput}
                          kycsList={kycsData}
                          from={"Prompt"}
                          uniqueColumns={uniqueColumns}
                          tagValue={(text) => {
                            // console.log("Text updated ", text);
                            setScriptTagInput(text);
                            // let agent = showScriptModal;
                            // agent.prompt.callScript = text;
                            // setShowScriptModal(agent);
                          }}
                          scrollOffset={scrollOffset}
                          showSaveChangesBtn={showSaveChangesBtn}
                          saveUpdates={async () => {
                            await updateAgent();
                            setShowSaveChangesBtn(false);
                            setOldScriptTagInput(scriptTagInput);
                          }}
                        />

                        {/* <DynamicDropdown /> */}
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-2 right-7 left-7" style={{}}>
                    {showSaveChangesBtn && (
                      <div className="w-full">
                        {UpdateAgentLoader ? (
                          <div className="w-full flex flex-row mt-6 justify-center">
                            <CircularProgress size={35} />
                          </div>
                        ) : (
                          <button
                            className="bg-purple w-full h-[50px] rounded-xl text-white"
                            style={{ fontWeight: "600", fontSize: 15 }}
                            onClick={async () => {
                              await updateAgent();
                              setShowScriptModal(null);
                              setGreetingTagInput("");
                              setScriptTagInput("");
                              setShowScript(false);
                              setSeledtedScriptKYC(false);
                              setSeledtedScriptAdvanceSetting(false);
                              setShowSaveChangesBtn(false);
                              setShowObjectionsSaveBtn(false);
                            }}
                          >
                            Save Changes
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {SeledtedScriptAdvanceSetting && (
                <div style={{ height: "80%" }}>
                  <div className="flex flex-row items-center gap-2 mt-4">
                    <button
                      className="px-2 outline-none"
                      style={{
                        borderBottom: showObjectives && "2px solid #7902DF",
                      }}
                      onClick={handleShowObjectives}
                    >
                      Objective
                    </button>
                    <button
                      className="px-2 outline-none"
                      style={{
                        borderBottom: showGuardrails && "2px solid #7902DF",
                      }}
                      onClick={handleShowGuardrails}
                    >
                      Guardrails
                    </button>
                    <button
                      className="px-2 outline-none"
                      style={{
                        borderBottom: showObjection && "2px solid #7902DF",
                      }}
                      onClick={handleShowObjection}
                    >
                      Objections
                    </button>
                  </div>

                  {showObjection && (
                    <div style={{ height: "80%" }}>
                      <div style={{ marginTop: "40px", height: "80%" }}>
                        <Objection
                          showTitle={true}
                          selectedAgentId={showScriptModal}
                          kycsData={kycsData}
                          uniqueColumns={uniqueColumns}
                        />
                      </div>
                    </div>
                  )}

                  {showGuardrails && (
                    <div style={{ height: "80%" }}>
                      <div style={{ marginTop: "40px", height: "80%" }}>
                        <GuarduanSetting
                          showTitle={true}
                          selectedAgentId={showScriptModal}
                          kycsData={kycsData}
                          uniqueColumns={uniqueColumns}
                        />
                      </div>
                    </div>
                  )}

                  {showObjectives && (
                    <div style={{ height: "80%" }}>
                      <div style={{ marginTop: "40px", height: "80%" }}>
                        {/* {showScriptModal?.prompt?.objective} */}

                        {/* {
                          <textarea
                            className="outline-none rounded-xl focus:ring-0"
                            // ref={objective}
                            value={objective}
                            onChange={(e) => {
                              const value = e.target.value;
                              setObjective(value);
                            }}
                            placeholder="Add Objective"
                            style={{
                              fontSize: "15px",
                              padding: "15px",
                              width: "100%",
                              fontWeight: "500",
                              height: "100%", // Initial height
                              maxHeight: "100%", // Maximum height before scrolling
                              overflowY: "auto", // Enable vertical scrolling when max-height is exceeded
                              resize: "none", // Disable manual resizing
                              border: "1px solid #00000020",
                            }}
                          />
                        } */}

                        <div className="mt-4 w-full">
                          <PromptTagInput
                            promptTag={objective}
                            kycsList={kycsData}
                            uniqueColumns={uniqueColumns}
                            tagValue={setObjective}
                            scrollOffset={scrollOffset}
                            showSaveChangesBtn={showObjectionsSaveBtn}
                            from={"Objective"}
                            saveUpdates={async () => {
                              await updateAgent();
                              setShowObjectionsSaveBtn(false);
                              setOldObjective(objective);
                            }}
                          />

                          {/* <DynamicDropdown /> */}
                        </div>

                        <div>
                          {showObjectionsSaveBtn && (
                            <div>
                              {UpdateAgentLoader ? (
                                <div className="w-full flex flex-row justify-center">
                                  <CircularProgress size={35} />
                                </div>
                              ) : (
                                <button
                                  className="bg-purple w-full h-[50px] rounded-xl mb-4 text-white"
                                  style={{ fontWeight: "600", fontSize: 15 }}
                                  onClick={async () => {
                                    await updateAgent();
                                    setShowObjectionsSaveBtn(false);
                                    setOldObjective(objective);
                                  }}
                                >
                                  Save Changes
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {SeledtedScriptKYC && (
                <div
                  style={{
                    height: "80%",
                    overflow: "auto",
                    scrollbarWidth: "none",
                    backgroundColor: "",
                  }}
                >
                  <KYCs
                    kycsDetails={setKycsData}
                    mainAgentId={MainAgentId}
                    user={user && user}
                  />
                </div>
              )}
            </div>
          </div>
        </Box>
      </Modal>

      {/* Modal for video */}

      <IntroVideoModal
        open={introVideoModal}
        onClose={() => setIntroVideoModal(false)}
        videoTitle={getTutorialByType(HowToVideoTypes.Analytics)?.title || "Learn how to customize your script"}
        videoUrl={getVideoUrlByType(HowToVideoTypes.Analytics) || HowtoVideos.script}
      />

      <IntroVideoModal
        open={introVideoModal2}
        onClose={() => setIntroVideoModal2(false)}
        videoTitle="Learn how to add a calendar"
        videoUrl={HowtoVideos.Calendar}
      />

      {
        showClaimPopup && (
          <ClaimNumber
            showClaimPopup={showClaimPopup}
            handleCloseClaimPopup={handleCloseClaimPopup}
            setOpenCalimNumDropDown={setOpenCalimNumDropDown}
            setSelectNumber={setAssignNumber}
            setPreviousNumber={setPreviousNumber}
            previousNumber={previousNumber}
            AssignNumber={AssignNumber}
          />
        )
      }

      {/* Web Agent Modals */}
      <WebAgentModal
        open={showWebAgentModal}
        onClose={() => setShowWebAgentModal(false)}
        agentName={selectedAgentForWebAgent?.name || ""}
        modelId={selectedAgentForWebAgent?.modelIdVapi || selectedAgentForWebAgent?.agentUuid || ""}
        agentId={selectedAgentForWebAgent?.id || selectedAgentForWebAgent?.modelIdVapi}
        onOpenAgent={handleOpenAgentInNewTab}
        onShowNewSmartList={handleShowNewSmartList}
        agentSmartRefill={selectedAgentForWebAgent?.smartListId}
        fetureType={fetureType}
        onCopyUrl={handleWebhookClick}
        selectedSmartList={selectedSmartList}
        setSelectedSmartList={setSelectedSmartList}

      />

      <NewSmartListModal
        open={showNewSmartListModal}
        onClose={() => setShowNewSmartListModal(false)}
        agentId={selectedAgentForWebAgent?.id || selectedAgentForWebAgent?.modelIdVapi}
        onSuccess={handleSmartListCreated}
      />

      <AllSetModal
        open={showAllSetModal}
        onClose={handleCloseAllSetModal}
        agentName={selectedAgentForWebAgent?.name || ""}
        onOpenAgent={handleOpenAgentInNewTab}
        fetureType={fetureType}
        onCopyUrl={handleWebhookClick}
      />

      {/* Embed Modals */}
      <EmbedModal
        open={showEmbedModal}
        onClose={() => setShowEmbedModal(false)}
        agentName={selectedAgentForEmbed?.name || ""}
        agentId={selectedAgentForEmbed?.id || selectedAgentForEmbed?.modelIdVapi}
        agentSmartRefill={selectedAgentForEmbed?.smartListId}
        onShowSmartList={handleShowEmbedSmartList}
        onShowAllSet={() => {
          setShowEmbedModal(false);
          setShowEmbedAllSetModal(true);
          const code = `<iframe src="${baseUrl}embed/support/${selectedAgentForEmbed ? selectedAgentForEmbed?.modelIdVapi : DEFAULT_ASSISTANT_ID}" style="position: fixed; bottom: 0; right: 0; width: 320px; 
  height: 100vh; border: none; background: transparent; z-index: 
  9999; pointer-events: none;" allow="microphone" onload="this.style.pointerEvents = 'auto';">
  </iframe>`;
          setEmbedCode(code);
        }}
      />

      <EmbedSmartListModal
        open={showEmbedSmartListModal}
        onClose={() => setShowEmbedSmartListModal(false)}
        agentId={selectedAgentForEmbed?.id || selectedAgentForEmbed?.modelIdVapi}
        onSuccess={handleEmbedSmartListCreated}
        fetureType={fetureType}
      />

      <AllSetModal
        open={showEmbedAllSetModal}
        onClose={handleCloseEmbedAllSetModal}
        agentName={selectedAgentForEmbed?.name || ""}
        isEmbedFlow={true}
        embedCode={embedCode}
      // fetureType={fetureType}
      // onCopyUrl={handleWebhookClick}
      />


    </div >
  );
}

const Card = ({ name, value, icon, bgColor, iconColor }) => {
  return (
    <div className="flex flex-col items-start gap-2">
      {/* Icon */}
      <Image src={icon} height={24} color={bgColor} width={24} alt="icon" />

      <div style={{ fontSize: 15, fontWeight: "500", color: "#000" }}>
        {name}
      </div>
      <div style={{ fontSize: 20, fontWeight: "600", color: "#000" }}>
        {value}
      </div>
    </div>
  );
};

export default Page;
