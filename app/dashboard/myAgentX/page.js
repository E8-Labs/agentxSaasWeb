
//test file 

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
import CircularLoader from "@/utilities/CircularLoader";
import imageCompression from "browser-image-compression";
import NotficationsDrawer from "@/components/notofications/NotficationsDrawer";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "@/components/dashboard/leads/AgentSelectSnackMessage";
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
  models,
  PersistanceKeys,
} from "@/constants/Constants";
import IntroVideoModal from "@/components/createagent/IntroVideoModal";
import LoaderAnimation from "@/components/animations/LoaderAnimation";
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

import dynamic from 'next/dynamic';
import DuplicateConfirmationPopup from "@/components/dashboard/myagentX/DuplicateConfirmationPopup";
import RenameAgentModal from "@/components/dashboard/agents/RenameAgentModal";
import TestAIModal from "@/components/dashboard/agents/TestAIModal";
import ScriptModal from "@/components/dashboard/agents/ScriptModal";
import AgentDrawerHeader from "@/components/dashboard/agents/AgentDrawerHeader";
import AgentStats from "@/components/dashboard/agents/AgentStats";
import AgentInfoTab from "@/components/dashboard/agents/AgentInfoTab";
import CalendarTab from "@/components/dashboard/agents/CalendarTab";
import PipelineTab from "@/components/dashboard/agents/PipelineTab";
import KnowledgeTab from "@/components/dashboard/agents/KnowledgeTab";

const DuplicateButton = dynamic(() => import('@/components/animation/DuplicateButton'), {
  ssr: false,
});
function Page() {
  const timerRef = useRef();
  const fileInputRef = useRef([]);
  const searchTimeoutRef = useRef(null);
  // const fileInputRef = useRef(null);
  const router = useRouter();
  let tabs = ["Agent Info", "Calendar", "Pipeline", "Knowledge"];
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

  const [showObjectionsSaveBtn, setShowObjectionsSaveBtn] = useState(false);
  const [SeledtedScriptAdvanceSetting, setSeledtedScriptAdvanceSetting] =
    useState(false);
  const [introVideoModal, setIntroVideoModal] = useState(false);
  const [introVideoModal2, setIntroVideoModal2] = useState(false);
  const [kycsData, setKycsData] = useState(null);
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

  //agent KYC's
  const [kYCList, setKYCList] = useState([]);

  //prompt tag input
  const [scriptTagInput, setScriptTagInput] = useState("");
  const [OldScriptTagInput, setOldScriptTagInput] = useState("");

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

  const [showDuplicateConfirmationPopup, setShowDuplicateConfirmationPopup] = useState(false)

  const playVoice = (url) => {
    if (audio) {
      audio.pause();
    }
    const ad = new Audio(url); // Create a new Audio object with the preview URL
    ad.play();
    setAudio(ad); // Play the audio
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
    let d = localStorage.getItem(PersistanceKeys.TestAiCredentials);
    //console.log;
    if (d) {
      let cr = JSON.parse(d);
      //console.log;
      setName(cr?.name);
      setPhone(cr?.phone);
    }
  }, [openTestAiModal]);

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

    if (
      oldGreetingTagInput !== greetingTagInput ||
      OldScriptTagInput !== scriptTagInput
    ) {

      setShowSaveChangesBtn(true);
    } else {
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

        const options = {
          maxSizeMB: 1, // Maximum size in MB
          maxWidthOrHeight: 1920, // Max width/height
          useWebWorker: true, // Use web workers for better performance
        };

        const compressedFile = file; //await imageCompression(file, options);

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

  //function to update agent profile image
  const updateAgentProfile = async (image) => {
    try {
      //console.log;
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
      formData.append("agentId", showDrawerSelectedAgent.id);

      for (let [key, value] of formData.entries()) {
        //// //console.log;
      }

      //// //console.log;

      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
        },
      });

      if (response) {
        //console.log;

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
      console.error("Error occured in api is", error);
      setGlobalLoader(false);
    } finally {
      setGlobalLoader(false);
    }
  };

  //function to open drawer
  const handleShowDrawer = (item) => {
    //console.log;
    // return
    console.log("Agent  item", item?.agentLanguage);

    if (item.Calendar) {
      console.log("Agent has calendaer in item");
    } else {
      console.log("Agent donot have calendar in the item");
    }

    setAssignNumber(item?.phoneNumber);
    const matchedVoice = voicesList.find(
      (voice) => voice.voice_id === item?.voiceId
    );

    setSelectedVoice(matchedVoice?.name || item?.voiceId); // ✅ use name if found by ID, otherwise fallback to voice name

    // setSelectedVoice(item?.voiceId);

    let v = item.agentLanguage === "English" || item.agentLanguage === "Multilingual" ? "en" : "es"
    console.log('v', v)
    let voices = []

    voices = voicesList.filter((voice) => voice.langualge === v)

    console.log('filtered voices are', voices)
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

      console.log("Selected model 2:", model);
      setSelectedGptManu(model);

    }

    const comparedAgent = mainAgentsList.find((mainAgent) =>
      mainAgent.agents.some((subAgent) => subAgent.id === item.id)
    );
    ////console.log;

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
            `Phone number assigned to ${showDrawerSelectedAgent?.name || "Agent"
            }`
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


  const updateAgent = async (voiceId) => {

    try {
      setUpdateAgentLoader(true);

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
        console.log(`agnet key ${key} and value ${value}`)
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
          console.log("Here status true");
          const localAgentsList = localStorage.getItem(
            PersistanceKeys.LocalStoredAgentsListMain
          );

          let agentsListDetails = [];

          if (localAgentsList) {
            console.log("local agents List");
            const agentsList = JSON.parse(localAgentsList);
            // agentsListDetails = agentsList;

            const updateAgentData = response.data.data;
            console.log(
              `Agent updated data ${updateAgentData.agents.length
              } ${!showScriptModal}`,
              updateAgentData
            );

            const updatedArray = agentsList.map((localItem) => {
              const apiItem =
                updateAgentData.id === localItem.id ? updateAgentData : null;

              return apiItem ? { ...localItem, ...apiItem } : localItem;
            });
            // let updatedSubAgent = null
            if (showDrawerSelectedAgent) {
              if (updateAgentData.agents.length > 0) {
                console.log("Updated showDrawerAgent");
                if (
                  updateAgentData.agents[0].id == showDrawerSelectedAgent.id
                ) {
                  console.log("Updated showDrawerAgent first subagent");
                  setShowDrawerSelectedAgent(updateAgentData.agents[0]);
                } else if (updateAgentData.agents.length > 1) {
                  if (
                    updateAgentData.agents[1].id == showDrawerSelectedAgent.id
                  ) {
                    console.log("Updated showDrawerAgent second subagent");
                    setShowDrawerSelectedAgent(updateAgentData.agents[1]);
                  }
                }
              }
            } else if (showScriptModal) {
              if (updateAgentData.agents.length > 0) {
                console.log("Updated showScriptModal");
                if (updateAgentData.agents[0].id == showScriptModal.id) {
                  console.log("Updated showScriptModal first subagent");
                  setShowScriptModal(updateAgentData.agents[0]);
                } else if (updateAgentData.agents.length > 1) {
                  if (updateAgentData.agents[1].id == showScriptModal.id) {
                    console.log("Updated showScriptModal second subagent");
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
            console.log("No local agents list");
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
    console.log("Updating sub agent with voiceData:", voiceData, "and model:", model);

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

          if (voiceData.liveTransferNumber || voiceData.liveTransferNumber !== undefined) {
            formData.append("liveTransferNumber", voiceData.liveTransferNumber);
          }
          if (voiceData.callbackNumber || voiceData.callbackNumber !== undefined) {
            formData.append("callbackNumber", voiceData.callbackNumber);
          }
        }

        // if (showDrawerSelectedAgent) {
        //   formData.append("mainAgentId", showDrawerSelectedAgent.mainAgentId);
        // }

        if (model) {
          formData.append("agentLLmModel", model);
        }

        console.log("Data to update");
        for (let [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`);
        }

        // return
        const response = await axios.post(ApiPath, formData, {
          headers: {
            Authorization: "Bearer " + AuthToken,
          },
        });

        if (response) {
          // setShowRenameAgentPopup(false);
          console.log(
            "Response of update sub agent api is :--",
            response.data.data
          );
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
            `Phone number assigned to ${showDrawerSelectedAgent?.name || "Agent"
            }`
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


  //code for getting uniqueCcolumns
  const getUniquesColumn = async () => {
    try {
      // setColumnloader(true);
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        setUser(UserDetails);
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
        ////console.log;
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
        getAgents();//userLocalData
      }
    } catch (error) {
      //// console.error("Error occured is :", error);
    } finally {
      setShowPhoneLoader(false);

      setInitialLoader(false);
    }
    getCalenders();

  }, []);

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
  const getAgents = async (paginationStatus, search = null, searchLoader = false) => {

    setPaginationLoader(true);

    //test code failed for saving search value

    // if (searchLoader && !search) {
    //   console.log('search clear', search)
    //   setAgentsListSeparated(allAgentsList);
    //   return
    // }



    console.log("Pagination status passed is", paginationStatus);
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
      console.log("Api path is", ApiPath);

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
        console.log("Agents from api", agents);
        setOldAgentsList(agents)
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
          return
        }


        let newList = [...mainAgentsList]; // makes a shallow copy

        if (Array.isArray(agents) && agents.length > 0) {
          newList.push(...agents); // append all agents at once
        }

        console.log("Agents after pushing", newList);

        localStorage.setItem(
          PersistanceKeys.LocalStoredAgentsListMain,
          JSON.stringify(newList)
        );
        setMainAgentsList(newList);
      }
    } catch (error) {
      setInitialLoader(false);
      //// console.error("Error occured in get Agents api is :", error);
    } finally {
      setInitialLoader(false);

    }
  };

  //function to add new agent
  const handleAddNewAgent = (event) => {
    event.preventDefault();
    const data = {
      status: true,
    };
    localStorage.setItem("fromDashboard", JSON.stringify(data));
    router.push("/createagent");
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


  const handleLanguageChange = async (event) => {
    setShowLanguageLoader(true);
    let value = event.target.value;
    console.log("selected language is", value)
    // console.log("selected voice is",SelectedVoice)

    let voice = voicesList.find((voice) => voice.name === SelectedVoice)

    let selectedLanguage = value === "English" || value === "Multilingual" ? "en" : "es"

    console.log('selected langualge', selectedLanguage)
    let voiceData = {}


    voiceData = {
      agentLanguage: value,
    };

    await updateSubAgent(voiceData);

    // if selected language is different from friltered voices list 
    if (selectedLanguage != voice.langualge) {

      // update voice list as well 
      setFilteredVoices(voicesList.filter((voice) => voice.langualge === selectedLanguage))

      const newVoiceName = selectedLanguage === "en" ? "Ava" : "Maria";
      await updateAgent(newVoiceName);

      setSelectedVoice(newVoiceName);
    }
    setShowLanguageLoader(false);
    // setSelectedVoice(event.target.value);
    setLanguageValue(value);
  }
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
      </div>

      <div
        className="w-full flex flex-row justify-between items-center py-4 mt-2 px-10"
        style={{ borderBottomWidth: 2, borderBottomColor: "#00000010" }}
      >
        <div style={{ fontSize: 24, fontWeight: "600" }}>Agents</div>

        <div className="flex flex-row gap-4 items-center">
          <div className="flex flex-row items-center gap-1  flex-shrink-0 border rounded pe-2">
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

                clearTimeout(searchTimeoutRef.current);
                searchTimeoutRef.current = setTimeout(() => {
                  // handleSearch(e);
                  let searchLoader = true;
                  getAgents(false, e.target.value, searchLoader)
                }, 500);
              }}
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
              bottom: 0
            }}>
            <DashboardSlider
              needHelp={false} />
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
              console.log('p', s)
              getAgents(p, s,);//user
            }}
            search={search}
            setObjective={setObjective}
            setOldObjective={setOldObjective}
            setGreetingTagInput={setGreetingTagInput}
            setOldGreetingTagInput={setOldGreetingTagInput}
            setScriptTagInput={setScriptTagInput}
            setOldScriptTagInput={setOldScriptTagInput}
            setShowScriptModal={setShowScriptModal}
            setShowScript={setShowScript}
            handleShowDrawer={handleShowDrawer}
            handleProfileImgChange={handleProfileImgChange}
            setShowRenameAgentPopup={setShowRenameAgentPopup}
            setSelectedRenameAgent={setSelectedRenameAgent}
            setRenameAgent={setRenameAgent}
            setShowDrawerSelectedAgent={setShowDrawerSelectedAgent}
            setOpenTestAiModal={setOpenTestAiModal}
            mainAgentsList={mainAgentsList}
            setScriptKeys={setScriptKeys}
            setSelectedAgent={setSelectedAgent}
            keys={keys}
            canGetMore={canGetMore}
            paginationLoader={paginationLoader}
            initialLoader={initialLoader}
            setKYCList={setKYCList}
            setMainAgentId={setMainAgentId}
            setUserPipeline={setUserPipeline}
          />
        )}

        {/* code to add new agent */}
        {agentsListSeparated.length > 0 && (
          <Link
            className="w-full py-6 flex justify-center items-center"
            href="/createagent"
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

        <RenameAgentModal
          showRenameAgentPopup={showRenameAgentPopup}
          setShowRenameAgentPopup={setShowRenameAgentPopup}
          selectedRenameAgent={selectedRenameAgent}
          renameAgentLoader={renameAgentLoader}
          setRenameAgentLoader={setReassignLoader}
          setShowSuccessSnack={setShowSuccessSnack}
          fromatMessageName={fromatMessageName}
          setIsVisibleSnack={setIsVisibleSnack}
          showDrawerSelectedAgent={showDrawerSelectedAgent}
          setShowDrawerSelectedAgent={setShowDrawerSelectedAgent}
          setMainAgentsList={setMainAgentsList}
          renameAgent={renameAgent}
          setRenameAgent={setRenameAgent}
        />
        <TestAIModal
          openTestAiModal={openTestAiModal}
          setOpenTestAiModal={setOpenTestAiModal}
          selectedAgent={selectedAgent}
          setShowSuccessSnack={setShowSuccessSnack}
          setIsVisibleSnack={setIsVisibleSnack}
        />

        <ScriptModal
          showScriptModal={showScriptModal}
          handleCloseScriptModal={handleCloseScriptModal}
          kycsData={kycsData}
          MainAgentId={MainAgentId}
        />
        <Drawer
          anchor="right"
          open={showDrawerSelectedAgent != null}
          onClose={() => {
            setShowDrawerSelectedAgent(null);
            setActiveTab("Agent Info");
          }}
          PaperProps={{
            sx: {
              width: "45%", borderRadius: "20px", padding: "0px", boxShadow: 3, margin: "1%", height: "96.5vh",
              overflow: "hidden",
            },
          }}
        >
          <div className="flex flex-col w-full h-full py-2 px-5 rounded-xl">
            <div className="w-full flex flex-col h-[95%] overflow-auto"
              style={{scrollbarWidth:'none'}}
            >
              <AgentDrawerHeader
                showDrawerSelectedAgent={showDrawerSelectedAgent}
                setShowRenameAgentPopup={setShowRenameAgentPopup}
                setSelectedRenameAgent={setSelectedRenameAgent}
                setRenameAgent={setRenameAgent}
                setMainAgentsList={setMainAgentsList}
                setShowSuccessSnack={setShowSuccessSnack}
                setIsVisibleSnack2={setIsVisibleSnack2}
                globalLoader = {globalLoader}
                setGlobalLoader = {setGlobalLoader}
                updateSubAgent={updateSubAgent}
              />

              <AgentStats showDrawerSelectedAgent={showDrawerSelectedAgent} />

              <div className="flex justify-between items-center pb-2 mb-4">
                {AgentMenuOptions.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`${activeTab === tab ? "text-purple border-b-2 border-purple" : "text-black-500"} text-sm font-medium whitespace-nowrap`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === "Agent Info" && <AgentInfoTab
                showDrawerSelectedAgent={showDrawerSelectedAgent}
                setShowDrawerSelectedAgent={setShowDrawerSelectedAgent}
                updateAgent={updateAgent}
                updateSubAgent={updateSubAgent}
              />}
              {activeTab === "Calendar" && <CalendarTab
                calendarDetails={calendarDetails}
                showDrawerSelectedAgent={showDrawerSelectedAgent}
              />}
              {activeTab === "Pipeline" && <PipelineTab
                showDrawerSelectedAgent={showDrawerSelectedAgent}
                UserPipeline={UserPipeline}
                calendarDetails={calendarDetails}
              />}
              {activeTab === "Knowledge" && <KnowledgeTab
                user={user}
                agent={showDrawerSelectedAgent}
              />}
              {activeTab === "Voicemail" && <VoiceMailTab
                setMainAgentsList={setMainAgentsList}
                agent={showDrawerSelectedAgent}
                setShowDrawerSelectedAgent={setShowDrawerSelectedAgent}
              />}
            </div>

            <div className="w-full flex justify-end">
              <button
                className="flex items-center gap-2"
                onClick={() => setDelAgentModal(true)}
              >
                <Image src="/otherAssets/redDeleteIcon.png" height={24} width={24} alt="del" className="opacity-50" />
                <div className="text-[#15151590] font-semibold underline">Delete Agent</div>
              </button>
            </div>
          </div>
        </Drawer>
      </div>



      {/* Code to del agent */}
      <Modal
        open={delAgentModal}
        onClose={() => {
          setDelAgentModal(false);
        }}
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
              <button className="w-1/2">Cancel</button>
              <div className="w-1/2">
                {DelLoader ? (
                  <div className="flex flex-row iems-center justify-center w-full mt-4">
                    <CircularProgress size={25} />
                  </div>
                ) : (
                  <button
                    className="mt-4 outline-none bg-red"
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
      </Modal>

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
                <button
                  onClick={() => {
                    setShowConfirmationModal(null);
                  }}
                >
                  <Image
                    src={"/assets/blackBgCross.png"}
                    height={20}
                    width={20}
                    alt="*"
                  />
                </button>
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

      {/* Modal for video */}

      <IntroVideoModal
        open={introVideoModal}
        onClose={() => setIntroVideoModal(false)}
        videoTitle=" Learn how to customize your script"
        videoUrl={HowtoVideos.script}
      />

      <IntroVideoModal
        open={introVideoModal2}
        onClose={() => setIntroVideoModal2(false)}
        videoTitle="Learn how to add a calendar"
        videoUrl={HowtoVideos.Calendar}
      />

      {showClaimPopup && (
        <ClaimNumbe
          showClaimPopup={showClaimPopup}
          handleCloseClaimPopup={handleCloseClaimPopup}
          setOpenCalimNumDropDown={setOpenCalimNumDropDown}
          setSelectNumber={setAssignNumber}
          setPreviousNumber={setPreviousNumber}
          previousNumber={previousNumber}
          AssignNumber={AssignNumber}
        />
      )}
    </div>
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
