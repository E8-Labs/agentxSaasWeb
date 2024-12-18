'use client'
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Button, Modal, Box, Drawer, Snackbar, Fade, Alert, CircularProgress, Popover, Select, FormControl, MenuItem } from '@mui/material'
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import { Plus } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { GreetingTagInput } from '@/components/pipeline/tagInputs/GreetingTagInput';
import { PromptTagInput } from '@/components/pipeline/tagInputs/PromptTagInput';
import KYCs from '@/components/pipeline/KYCs';
import Objection from '@/components/pipeline/advancedsettings/Objection';
import GuarduanSetting from '@/components/pipeline/advancedsettings/GuardianSetting';
import PiepelineAdnStage from '@/components/dashboard/myagentX/PiepelineAdnStage';

function Page() {

  let isInbound = null
  const timerRef = useRef();
  const fileInputRef = useRef([]);
  // const fileInputRef = useRef(null);
  const router = useRouter()
  const [openTestAiModal, setOpenTestAiModal] = useState(false);
  const [name, setName] = useState("");
  //code for phonenumber
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState('');
  const [locationLoader, setLocationLoader] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  const [address, setAddress] = useState("");
  // const [budget, setBudget] = useState("");
  const [showDrawer, setShowDrawer] = useState(null);
  //calender details of selected agent
  const [calendarDetails, setCalendarDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("Agent Info");
  const [userDetails, setUserDetails] = useState([]);
  const [agentData, setAgentData] = useState([]);
  const [initialLoader, setInitialLoader] = useState(false);

  //code for assigning the umber
  // const []
  const [assignNumber, setAssignNumber] = React.useState('');
  const [previousNumber, setPreviousNumber] = useState([]);
  const selectRef = useRef();
  const [openCalimNumDropDown, setOpenCalimNumDropDown] = useState(false);
  const [showGlobalBtn, setShowGlobalBtn] = useState(true);
  const [showReassignBtn, setShowReassignBtn] = useState(false);
  const [reassignLoader, setReassignLoader] = useState(null);
  const [showClaimPopup, setShowClaimPopup] = useState(false);
  const [findeNumberLoader, setFindeNumberLoader] = useState(false);
  const [foundeNumbers, setFoundeNumbers] = useState([]);
  const [findNumber, setFindNumber] = useState("");
  const [purchaseLoader, setPurchaseLoader] = useState(false);
  const [openPurchaseSuccessModal, setOpenPurchaseSuccessModal] = useState(false);
  const [selectedPurchasedNumber, setSelectedPurchasedNumber] = useState(null);
  const [selectedPurchasedIndex, setSelectedPurchasedIndex] = useState(null);
  const [assignLoader, setAssignLoader] = useState(false);

  //code for assign number confirmation model
  const [showConfirmationModal, setShowConfirmationModal] = useState(null);


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
  const [showObjection, setShowObjection] = useState(true);
  const [showGuardrails, setShowGuardrails] = useState(false);
  const [showObjectives, setShowObjectives] = useState(false);
  const [SeledtedScriptAdvanceSetting, setSeledtedScriptAdvanceSetting] = useState(false);
  const [introVideoModal, setIntroVideoModal] = useState(false);
  const [kycsData, setKycsData] = useState(null);
  //greeting tag input
  const [greetingTagInput, setGreetingTagInput] = useState('');
  const [oldGreetingTagInput, setOldGreetingTagInput] = useState('');
  const [scrollOffset, setScrollOffset] = useState({ scrollTop: 0, scrollLeft: 0 });
  const containerRef = useRef(null); // Ref to the scrolling container
  const [showSuccessSnack, setShowSuccessSnack] = useState(null);
  const [testAIloader, setTestAIloader] = useState(false);
  const [uniqueColumns, setUniqueColumns] = useState([]);
  const [showMoreUniqueColumns, setShowMoreUniqueColumns] = useState(false);
  const [showSaveChangesBtn, setShowSaveChangesBtn] = useState(false);
  const [UpdateAgentLoader, setUpdateAgentLoader] = useState(false);

  //agent KYC's
  const [kYCList, setKYCList] = useState([]);

  //prompt tag input
  const [scriptTagInput, setScriptTagInput] = useState('');
  const [OldScriptTagInput, setOldScriptTagInput] = useState("")


  //code for testing the ai
  let callScript = null;
  let keys = [];

  //variable string the keys
  const [scriptKeys, setScriptKeys] = useState([]);
  //variable for input field value
  const [inputValues, setInputValues] = useState({});
  //code for storing the agents data
  const [agentsContent, setAgentsContent] = useState([]);
  const [actionInfoEl, setActionInfoEl] = React.useState(null);
  const [hoveredIndexStatus, setHoveredIndexStatus] = useState(null);
  const [hoveredIndexAddress, setHoveredIndexAddress] = useState(null);

  //code for scroll ofset
  useEffect(() => {
    getUniquesColumn();
    getAvailabePhoneNumbers();
    ////console.log("Setting scroll offset")
    const handleScroll = () => {
      console.log("Div scrolled", containerRef.current.scrollTop)
      if (containerRef.current) {
        setScrollOffset({
          scrollTop: containerRef.current.scrollTop,
          scrollLeft: containerRef.current.scrollLeft,
        });
      }
      else {
        ////console.log("No ref div")
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
    console.log("Olde tag length", oldGreetingTagInput.length)
    console.log("olde tag 2 length", greetingTagInput.length)
    console.log("olde tag 3 length", scriptTagInput.length)
    if (oldGreetingTagInput !== greetingTagInput || OldScriptTagInput !== scriptTagInput) {
      console.log(greetingTagInput);
      console.log(oldGreetingTagInput)
      console.log("not same")
      setShowSaveChangesBtn(true);
    } else {
      console.log("hde save")
      setShowSaveChangesBtn(false);
    }
  }, [greetingTagInput, scriptTagInput]);

  //function to open drawer
  const handleShowDrawer = (item) => {
    setAssignNumber(item?.phoneNumber);
    // let comparedAgent = null;
    console.log("Main agents list is:", userDetails);

    const comparedAgent = userDetails.find((prevAgent) =>
      prevAgent.agents.some((subAgent) => subAgent.id === item.id)
    );
    console.log("Agent selected details are", comparedAgent);

    setCalendarDetails(comparedAgent);

    console.log("")
    setShowDrawer(item)
    console.log("Selected agent is:", item);
    if (item.agentType === "inbound") {
      setShowReassignBtn(true);
      setShowGlobalBtn(false);
    } else if (item.agentType === "outbound") {
      setShowReassignBtn(false);
    }
  }

  //function to format the name of agent
  const formatName = (item) => {

    let agentName = null;

    if (item?.name?.length > 15) {
      agentName = item?.name?.slice(0, 15) + "..."
    } else {
      agentName = item?.name
    }
    return (
      <div>
        {agentName?.slice(0, 1).toUpperCase(0)}{agentName?.slice(1)}
      </div>
    )
  }


  //function to close script modal
  const handleCloseScriptModal = () => {
    setShowScriptModal(null);
    setSeledtedScriptKYC(false)
    setSeledtedScriptAdvanceSetting(false);
    localStorage.removeItem("ObjectionsList");
    localStorage.removeItem("GuadrailsList");
  }

  //function to select the number to assign to the user
  const handleAssignNumberChange = (event) => {
    setAssignNumber(event.target.value);
  };

  //code for formating the number
  const formatPhoneNumber = (rawNumber) => {
    const phoneNumber = parsePhoneNumberFromString(
      rawNumber?.startsWith('+') ? rawNumber : `+${rawNumber}`
    );
    // console.log("Raw number is", rawNumber);
    return phoneNumber ? phoneNumber.formatInternational() : 'Invalid phone number';
  };

  //fucntion for assigning the number
  const handleCloseClaimPopup = () => {
    setShowClaimPopup(false)
  }

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

      console.log("Apipath is :--", ApiPath);
      // return
      const response = await axios.get(ApiPath, {
        headers: {
          "Authorization": "Bearer " + AuthToken,
          "Content-Type": "application/json"
        }
      });

      if (response) {
        console.log("Response of find number api is :--", response.data);
        if (response.data.status === true) {
          setFoundeNumbers(response.data.data);
        }

      }

    } catch (error) {
      console.error("Error occured in finde number api is :---", error);
    } finally {
      setFindeNumberLoader(false);
    }
  }

  //code for reassigning the number api
  const handleReassignNumber = async (item) => {
    try {
      console.log("Phonenumber is:", item.phoneNumber.slice(1));
      // return
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
        console.log("trying")
        const agentData = JSON.parse(agentDetails);
        console.log("Agent details are :--", agentData);
        MyAgentData = agentData;

      }

      const ApiPath = Apis.reassignNumber;

      const ApiData = {
        agentId: item.claimedBy.id,
        phoneNumber: item.phoneNumber
      }
      console.log("I a just trigered")

      console.log("Data sending in api is:", ApiData);
      console.log("Api path is:", ApiPath);
      console.log("Authtoken is:", AuthToken);

      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          "Authorization": "Bearer " + AuthToken,
          "Content-Type": "application/json"
        }
      });

      if (response) {
        console.log("Respose of reassign api is:", response);
        setShowSuccessSnack(response.data.message);
        setShowConfirmationModal(null);
        // setShowClaimPopup(null);
        setAssignNumber(item.phoneNumber.slice(1));
        setOpenCalimNumDropDown(false);
        //code to close the dropdown
        if (selectRef.current) {
          selectRef.current.blur(); // Triggers dropdown close
        }


        // if (response.data.status === true) {
        //     setSelectNumber(phoneNumber);
        // } else {
        //     setSelectNumber(phoneNumber);
        // }
      }

    } catch (error) {
      console.error("Error occured in reassign the number api:", error);
    } finally {
      setReassignLoader(null);
      console.log("reassign api completed")
    }
  }

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

      console.log("Authtoken is:", AuthToken);

      if (agentDetails) {
        console.log("trying")
        const agentData = JSON.parse(agentDetails);
        console.log("Agent details are :--", agentData);
        MyAgentData = agentData;

      }

      const ApiPath = Apis.purchaseNumber;
      console.log("Apipath is :--", ApiPath);
      // console.log("Number selected is:", selectedPurchasedNumber);
      const formData = new FormData();
      formData.append("phoneNumber", selectedPurchasedNumber.phoneNumber);
      // formData.append("phoneNumber", "+14062040550");
      // formData.append("callbackNumber", "+14062040550");
      formData.append("mainAgentId", MyAgentData.id);

      for (let [key, value] of formData.entries()) {
        console.log(`${key} ${value} `);
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
          "Authorization": "Bearer " + AuthToken,
          "Content-Type": "multipart/form-data",
          // "Content-Type": "application/json"
        }
      });

      if (response) {
        console.log("Response of purchase number api is :--", response.data);
        if (response.data.status === true) {
          localStorage.setItem("purchasedNumberDetails", JSON.stringify(response.data.data));
          setOpenPurchaseSuccessModal(true);
          // handleContinue();
          setAssignNumber(selectedPurchasedNumber.phoneNumber);
          setPreviousNumber([...previousNumber, selectedPurchasedNumber]);
          setShowClaimPopup(false);
          setOpenCalimNumDropDown(false);
        }
      }

    } catch (error) {
      console.error("Error occured in purchase number api is: --", error);
    } finally {
      setPurchaseLoader(false);
    }
  }

  //function to select the number to purchase
  const handlePurchaseNumberClick = (item, index) => {
    console.log("Item Selected is :---", item);
    setSelectedPurchasedNumber(prevId => (prevId === item ? null : item));
    setSelectedPurchasedIndex(prevId => (prevId === index ? null : index));
  }

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
      console.log("initial api authtoken is:", AuthToken);
      const ApiPath = Apis.userAvailablePhoneNumber;
      console.log("Apipath", ApiPath);

      // return
      const response = await axios.get(ApiPath, {
        headers: {
          "Authorization": "Bearer " + AuthToken
        }
      });

      if (response) {
        console.log("Response of api is :", response.data);
        console.log("PArsed data is ", response.data.data);
        setPreviousNumber(response.data.data);
      }

    } catch (error) {
      console.error("Error occured in: ", error);
    } finally {
      console.log("Api cal completed")
    }
  }


  //code for update agent api
  const updateAgent = async () => {
    try {
      setUpdateAgentLoader(true);

      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        ////console.log("Localdat recieved is :--", Data);
        AuthToken = Data.token;
      }

      const ApiPath = Apis.updateAgent;

      const formData = new FormData();

      // console.log("Agent to update is:", showScriptModal);

      if (showScriptModal.agentType === "inbound") {
        console.log("Is inbound true");
        formData.append("inboundGreeting", greetingTagInput);
        formData.append("inboundPrompt", scriptTagInput);
      } else {
        formData.append("prompt", scriptTagInput);
        formData.append("greeting", greetingTagInput);
      }
      formData.append("mainAgentId", showScriptModal.id);

      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          "Authorization": "Bearer " + AuthToken
        }
      });

      if (response) {
        console.log("Response of update api is :--", response.data);
        if (response.data.status === true) {
          setShowSuccessSnack(response.data.message);

          const localAgentsList = localStorage.getItem("localAgentDetails");

          let agentsListDetails = [];
          if (localAgentsList) {
            const agentsList = JSON.parse(localAgentsList);
            agentsListDetails = agentsList;
          }

          // agentsListDetails = (prevAgents) =>
          //   prevAgents.map((agent) =>
          //     agent.id === showScriptModal.id
          //       ? { ...agent, ...response.data.data }
          //       : agent
          //   )

          agentsListDetails = agentsListDetails.map((agent) =>
            agent.id === showScriptModal.id
              ? { ...agent, ...response.data.data }
              : agent
          )

          localStorage.setItem("localAgentDetails", JSON.stringify(agentsListDetails));

          // console.log("Updated agents list data on localstorage s:", agentsListDetails);

          setUserDetails((prevAgents) =>
            prevAgents.map((agent) =>
              agent.id === showScriptModal.id
                ? { ...agent, ...response.data.data }
                : agent
            )
          );
          setShowScriptModal(null);
        }
      }

    } catch (error) {
      console.error("Error occured in api is", error);
    } finally {
      console.log("Api call completed");
      setUpdateAgentLoader(false);
    }
  }

  //function for scripts modal screen change
  const handleShowScript = () => {
    setShowScript(true);
    setSeledtedScriptKYC(false);
    setSeledtedScriptAdvanceSetting(false);
  }

  const AssignNumber = async () => {
    try {
      setAssignLoader(true);
      let AuthToken = null;
      const LocalData = localStorage.getItem("User");

      if (LocalData) {
        const UserDetails = JSON.parse(LocalData);
        AuthToken = UserDetails.token;
      }

      const formData = new FormData();
      formData.append("phoneNumber", assignNumber);
      formData.append("callbackNumber", showDrawer?.callbackNumber);
      // if (userSelectedNumber) {
      //   formData.append("callbackNumber", assignNumber);
      // } else {
      //   formData.append("callbackNumber", officeNumber);
      // }
      formData.append("liveTransforNumber", showDrawer?.liveTransferNumber);
      formData.append("agentId", showDrawer.id);
      // formData.append("mainAgentId", showDrawer.id);
      // formData.append("liveTransfer", toggleClick);

      const ApiPath = Apis.asignPhoneNumber;

      for (let [key, value] of formData.entries()) {
        console.log(`${key} ${value}`)
      }

      // return

      const response = await axios.post(ApiPath, formData, {
        headers: {
          "Authorization": "Bearer " + AuthToken
        }
      });

      if (response) {
        console.log("Response of assign number api is :", response.data)
        if (response.data.status === true) {
          setShowSuccessSnack(response.data.message);
          setAgentsContent((prevAgents) =>
            prevAgents.map((agent) =>
              agent.id === showDrawer.id
                ? { ...agent, phoneNumber: assignNumber }
                : agent
            )
          );
          setShowDrawer(null);
          //phoneNumber
          // handleContinue();
          // alert("Phone number assigned")
          // const calimNoData = {
          //   officeNo: officeNumber,
          //   userNumber: selectNumber,
          //   usernumber2: userSelectedNumber,
          //   callBackNumber: callBackNumber
          // }
          // localStorage.setItem("claimNumberData", JSON.stringify(calimNoData))
        }
      }

    } catch (error) {
      console.error("Error occured in api is:", error);
    } finally {
      console.log("Assign Number Api call completed");
      setAssignLoader(false);
    }
  }

  const handleShowKycs = () => {
    setShowScript(false);
    setSeledtedScriptKYC(true);
    setSeledtedScriptAdvanceSetting(false);
  }

  const handleShowAdvanceSeting = () => {
    setShowScript(false);
    setSeledtedScriptKYC(false);
    setSeledtedScriptAdvanceSetting(true);
  }

  //function to show the objection and guadrails
  const handleShowObjection = () => {
    setShowObjection(true);
    setShowGuardrails(false);
    setShowObjectives(false);
  }

  const handleShowGuardrails = () => {
    setShowObjection(false);
    setShowGuardrails(true);
    setShowObjectives(false);
  }

  const handleShowObjectives = () => {
    setShowObjectives(true);
    setShowObjection(false);
    setShowGuardrails(false);
  }

  //function ot compare the selected agent wiith the main agents list
  const matchingAgent = (agent) => {
    const agentData = userDetails.filter((prevAgent) => prevAgent.name === agent.name);
    console.log("Agent matcing grretings are:", agentData);
    setKYCList(agentData[0].kyc);

    if (agentData[0].agents.length === 2 || agentData[0].agents[0].agentType === "outbound") {
      setOldGreetingTagInput(agentData[0].greeting);
      setGreetingTagInput(agentData[0].greeting);
      setScriptTagInput(agentData[0].callScript);
      setOldScriptTagInput(agentData[0].callScript);
    } else if (agentData[0].agents[0].agentType === "inbound") {
      isInbound = "inbound"
      setGreetingTagInput(agentData[0].inboundGreeting);
      setOldGreetingTagInput(agentData[0].inboundGreeting);
      setScriptTagInput(agentData[0].inboundScript);
      setOldScriptTagInput(agentData[0].inboundScript);
    }

    // setGreetingTagInput(agentData[0].greeting);
    // // setOldGreetingTagInput(agentData[0].greeting);
    // setScriptTagInput(agentData[0].callScript);
  }


  //code for getting uniqueCcolumns
  const getUniquesColumn = async () => {
    try {
      // setColumnloader(true);
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      ////console.log("Auth token is :--", AuthToken);

      const ApiPath = Apis.uniqueColumns;
      ////console.log("Api path is ", ApiPath);

      const response = await axios.get(ApiPath, {
        headers: {
          "Authorization": "Bearer " + AuthToken,
          "Content-Type": "application/json"
        }
      });

      if (response) {
        console.log("Response of getColumns api is:", response.data);
        if (response.data.status === true) {
          setUniqueColumns(response.data.data);
        }
      }

    } catch (error) {
      console.error("Error occured in getColumn is :", error);
    } finally {
      // setColumnloader(false)
    }
  }

  ///code to show more unique columns
  const handleShowUniqueCols = () => {
    setShowMoreUniqueColumns(!showMoreUniqueColumns);
  }

  //function to handle input field change
  const handleInputChange = (index, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [index]: value, // Update the specific index value
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
        console.log("Authtoken is:", localData.token);
        AuthToken = localData.token;
      }

      const ApiData = {
        mainAgentId: showDrawer?.id
      }
      console.log("Data sending in del agent api is:", ApiData);
      // return
      const ApiPath = Apis.DelAgent;
      console.log("Apipath is:", ApiPath);

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          "Authorization": "Bearer " + AuthToken,
          "Content-Type": "application/json"
        }
      });

      if (response) {
        console.log("Response of del agent api is:", response);
        setAgentsContent(agentsContent.filter((item) => item.id !== showDrawer.id));
        setShowDrawer(null);
        setDelAgentModal(false);
      }

    } catch (error) {
      console.error("Error occured in del agent api is:", error);
    }
    finally {
      setDelLoader(false);
    }
  }

  //function to call testAi Api
  const handleTestAiClick = async () => {
    try {
      setTestAIloader(true);
      let AuthToken = null;
      const userData = localStorage.getItem("User");
      if (userData) {
        const localData = JSON.parse(userData);
        console.log("Authtoken is:", localData.token);
        AuthToken = localData.token;
      }

      const newArray = scriptKeys.map((key, index) => ({
        [key]: inputValues[index] || "", // Use the input value or empty string if not set
      }));
      console.log("New array created is:", newArray);
      console.log("New array created is:", JSON.stringify(newArray));

      const ApiData = {
        agentId: selectedAgent.id,
        name: name,
        phone: phone,
        extraColumns: newArray
      }

      const ApiPath = Apis.testAI;

      console.log("Data sending in api is:", JSON.stringify(ApiData));
      console.log("Api path is:", JSON.stringify(ApiPath));
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          "Authorization": "Bearer " + AuthToken,
          "Content-Type": "application/json"
        }
      });

      if (response) {
        console.log("Response of test AI api is :", response);
        setShowSuccessSnack(response.data.message);
        if (response.data.status === true) {
          setOpenTestAiModal(false);
          setName("");
          setPhone("");
        }
      }

    } catch (error) {
      console.error("Error occured in test api is", error);
    } finally {
      console.log("Test ai call api done");
      setTestAIloader(false);
    }
  }

  //function for phonenumber input
  const handlePhoneNumberChange = (phone) => {
    setPhone(phone);
    validatePhoneNumber(phone);

    if (!phone) {
      setErrorMessage("");
    }

  };

  //code to get user location

  const getLocation = () => {
    console.log("getlocation trigered")
    const registerationDetails = localStorage.getItem("registerDetails");
    // let registerationData = null;
    setLocationLoader(true);
    if (registerationDetails) {
      const registerationData = JSON.parse(registerationDetails);
      console.log("User registeration data is :--", registerationData);
      // setUserData(registerationData);
    } else {
      // alert("Add details to continue");
    }
    const fetchCountry = async () => {
      try {
        // Get user's geolocation
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;

          // Fetch country code based on lat and long
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await response.json();

          // Set the country code based on the geolocation API response
          setCountryCode(data.countryCode.toLowerCase());
          // setLoading(false);
        });
      } catch (error) {
        console.error("Error fetching location:", error);
        setLoading(true); // Stop loading if there’s an error
      } finally {
        setLocationLoader(false);
      }
    };

    fetchCountry();
  }

  // Function to validate phone number
  const validatePhoneNumber = (phoneNumber) => {
    // const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`);
    // parsePhoneNumberFromString(`+${phone}`, countryCode.toUpperCase())
    const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`, countryCode.toUpperCase());
    // if (parsedNumber && parsedNumber.isValid() && parsedNumber.country === countryCode.toUpperCase()) {
    if (!parsedNumber || !parsedNumber.isValid()) {
      setErrorMessage('Enter valid number');
    } else {
      setErrorMessage('');

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // setCheckPhoneResponse(null);
      console.log("Trigered")
    }
  };

  useEffect(() => {

    const agentLocalDetails = localStorage.getItem("localAgentDetails");
    if (agentLocalDetails) {
      const agentData = JSON.parse(agentLocalDetails);
      setUserDetails(agentData);
    }

    const userData = localStorage.getItem("User");

    try {
      // setInitialLoader(true);
      if (userData) {
        const userLocalData = JSON.parse(userData);
        getAgents(userLocalData);
      }
    } catch (error) {
      console.error("Error occured is :", error);
    } finally {
      // setInitialLoader(false)
    }

  }, []);

  // code to select image

  // const handleSelectProfileImg = () => {
  //   fileInputRef.current.click(); // Programmatically click the hidden file input
  // };

  // const handleProfileImgChange = (event) => {
  //   // const file = event.target.files[0]; // Get the selected file
  //   // if (file) {
  //   //   console.log('Selected file:', file); // Do something with the file
  //   //   setSelectedImage(file);
  //   // }
  //   const file = event.target.files[0]; // Get the selected file
  //   if (file) {
  //     // Use FileReader to generate a preview URL
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setSelectedImage(reader.result); // Update state with the image preview URL
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

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
  const getAgents = async (userData) => {
    try {
      const agentLocalDetails = localStorage.getItem("localAgentDetails");
      if (!agentLocalDetails) {
        setInitialLoader(true);
      }
      const ApiPath = `${Apis.getAgents}?agentType=outbound`;

      console.log("Api path is: ", ApiPath);

      const AuthToken = userData.token;
      console.log("Auth token is", AuthToken);

      const response = await axios.get(ApiPath, {
        headers: {
          "Authorization": "Bearer " + AuthToken,
          "Content-Type": "application/json"
        }
      });

      if (response) {
        console.log("Response of get agents api is:", response.data);
        localStorage.setItem("localAgentDetails", JSON.stringify(response.data.data));
        setUserDetails(response.data.data);
      }



    } catch (error) {
      console.error("Error occured in get Agents api is :", error);
    } finally {
      setInitialLoader(false)
    }
  }

  //function to add new agent
  const handleAddNewAgent = () => {
    const data = {
      status: true
    }
    localStorage.setItem("fromDashboard", JSON.stringify(data));
    router.push("/createagent");
  }

  //code for spiling the agnts
  // let agentsContent = [];
  //code for popover

  const handlePopoverOpen = (event, item) => {
    console.log("Hovered index is", item)
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

    let agents = []
    userDetails.map((item, index) => {
      // Check if agents exist
      if (item.agents && item.agents.length > 0) {
        for (let i = 0; i < item.agents.length; i++) {
          const agent = item.agents[i];
          console.log("Agent spilting data is:", agent);
          // Add a condition here if needed  //.agentType === 'outbound'
          if (agent) {
            agents.push(agent)
          }
        }
      } else {
        // agentsContent.push(<div key="no-agent">No agents available</div>);
      }
    });
    setAgentsContent(agents);

    console.log("Agents data in updated array is", agentsContent);


  }, [userDetails]);

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
      fontWeight: "500"
    },
    findNumberDescription: {
      fontSize: 15,
      fontWeight: "500"
    },
    dropdownMenu: {
      fontSize: 15,
      fontWeight: "500",
      color: "#000000"
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
  }


  // console.log("Current agent selected is:", showDrawer)


  return (
    <div className='w-full flex flex-col items-center'>
      <div className='w-full flex flex-row justify-between items-center py-4 px-10'
        style={{ borderBottomWidth: 2, borderBottomColor: '#00000010' }}
      >
        <div style={{ fontSize: 24, fontWeight: '600' }}>
          My Agents
        </div>

        <button className='pr-10'>
          <img src='/otherAssets/notificationIcon.png'
            style={{ height: 24, width: 24 }}
            alt='notificationIcon'
          />
        </button>
      </div>

      <div className='w-9/12 pt-10 items-center ' style={{}}>

        {/* code for agents list */}
        {
          initialLoader ?
            <div className='h-[70vh] flex flex-row justify-center pt-32 gap-4'>
              <CircularProgress size={45} />
            </div> :
            <div className='h-[70vh] overflow-auto flex flex-col gap-4' style={{ scrollbarWidth: "none" }}>
              {
                agentsContent.map((item, index) => (
                  <div key={index}
                    className='w-full px-10 py-2' style={{
                      borderWidth: 1, borderColor: '#15151510', backgroundColor: '#FBFCFF',
                      borderRadius: 20
                    }}>
                    <div className='w-12/12 flex flex-row items-center justify-between'>
                      <div className='flex flex-row gap-5 items-center'>

                        <div className='flex flex-row items-end'>
                          {selectedImages[index] ? (
                            <div>
                              <Image
                                src={selectedImages[index]}
                                height={70}
                                width={70}
                                alt="Profile"
                                style={{ borderRadius: "50%", objectFit: "cover", height: "60px", width: "60px" }}
                              />
                            </div>
                          ) :
                            <Image className='hidden md:flex' src="/agentXOrb.gif" style={{ height: "69px", width: "75px", resize: "contain" }} height={69} width={69} alt='*' />
                          }


                          <input
                            type="file"
                            accept="image/*"
                            ref={(el) => (fileInputRef.current[index] = el)} // Store a ref for each input
                            onChange={(e) => handleProfileImgChange(e, index)}
                            style={{ display: 'none' }}
                          />

                          <button style={{ marginLeft: -30 }} onClick={() => { handleSelectProfileImg(index) }}>
                            <Image src={'/otherAssets/cameraBtn.png'}

                              height={36}
                              width={36}
                              alt='profile'
                            />
                          </button>
                        </div>


                        <div className='flex flex-col gap-1'>

                          <div className='flex flex-row gap-3 items-center'>
                            <button onClick={() => {
                              console.log("Drawer details are:", item);
                              handleShowDrawer(item)
                            }}>

                              <div style={{ fontSize: 24, fontWeight: '600', color: '#000' }}>
                                {/* {item.name?.slice(0, 1).toUpperCase(0)}{item.name?.slice(1)} */}
                                {formatName(item)}
                              </div>
                            </button>
                            <div style={{ fontSize: 12, fontWeight: '600', color: '#00000080' }} className='flex flex-row items-center gap-1'>
                              <div
                                aria-owns={open ? 'mouse-over-popover' : undefined}
                                aria-haspopup="true"
                                onMouseEnter={(event) => { handlePopoverOpen(event, item) }}
                                onMouseLeave={handlePopoverClose}
                                style={{ cursor: "pointer" }}
                              >
                                {item.agentObjective}
                              </div>
                              <div>
                                | {item.agentType?.slice(0, 1).toUpperCase(0)}{item.agentType?.slice(1)}
                              </div>
                            </div>

                            {/* Code for popover */}
                            <Popover
                              id="mouse-over-popover"
                              sx={{
                                pointerEvents: 'none',
                                // marginBottom: "20px"
                              }}
                              open={open}
                              anchorEl={actionInfoEl}
                              anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'center',
                              }}
                              transformOrigin={{
                                vertical: 'bottom',
                                horizontal: 'center',
                              }}
                              PaperProps={{
                                elevation: 1, // This will remove the shadow
                                style: {
                                  boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.01)",
                                },
                              }}
                              onClose={handlePopoverClose}
                              disableRestoreFocus
                            >
                              <div className="p-3 w-[250px]">
                                <div className="flex flex-row items-center justify-between gap-1">
                                  <p style={{ ...styles.paragraph, color: "#00000060" }}>
                                    Status
                                  </p>
                                  <p style={styles.paragraph}>
                                    {hoveredIndexStatus ? (hoveredIndexStatus) : "-"}
                                  </p>
                                </div>
                                <div className="flex flex-row items-center justify-between mt-1 gap-1">
                                  <p style={{ ...styles.paragraph, color: "#00000060" }}>
                                    Address
                                  </p>
                                  <p style={styles.paragraph}>
                                    {hoveredIndexAddress ? (hoveredIndexAddress) : "-"}
                                  </p>
                                </div>
                              </div>
                            </Popover>

                          </div>
                          <div className='flex flex-row gap-3 items-center text-purple' style={{ fontSize: 15, fontWeight: '500' }}>
                            <button onClick={() => {
                              setShowScriptModal(item);
                              matchingAgent(item);
                              setShowScript(true);
                            }}>
                              <div>
                                View Script
                              </div>
                            </button>

                            <div>
                              |
                            </div>

                            <button onClick={() => {
                              handleShowDrawer(item)
                            }}>
                              <div>
                                More info
                              </div>
                            </button>
                          </div>
                        </div>

                      </div>


                      <div className='flex flex-row items-start gap-2'>

                        {
                          !item.phoneNumber && (
                            <div className='flex flex-row items-center gap-2 -mt-1'>
                              <Image src={"/assets/warningFill.png"} height={18} width={18} alt='*' />
                              <p>
                                <i className='text-red' style={{
                                  fontSize: 12,
                                  fontWeight: "600"
                                }}>
                                  No Phone number assigned
                                </i>
                              </p>
                            </div>
                          )
                        }

                        <button className='bg-purple px-4 py-2 rounded-lg'
                          onClick={() => {
                            console.log("Selected agent for test ai is:", item);
                            if (!item.phoneNumber) {
                              setShowWarningModal(item);
                            } else {
                              setOpenTestAiModal(true);
                            }
                            let callScript = item.prompt.callScript;

                            // console.log("Keys extracted are", callScript);

                            //function for extracting the keys
                            const regex = /\{(.*?)\}/g;
                            let match;
                            let mainAgent = null;
                            userDetails.map((ma) => {
                              if (ma.agents.length > 0) {
                                if (ma.agents[0].id == item.id) {
                                  mainAgent = ma
                                }
                                else if (ma.agents.length >= 2) {
                                  if (ma.agents[1].id == item.id) {
                                    mainAgent = ma
                                  }
                                }
                              }
                            })
                            let kyc = (mainAgent?.kyc || []).map((kyc) => kyc.question)
                            console.log("Main agent selected ", mainAgent)
                            while ((match = regex.exec(callScript)) !== null) {
                              // "Email", "Address",
                              let defaultVariables = ["Full Name", "First Name", "Last Name", "firstName", "seller_kyc", "buyer_kyc", "CU_address", "CU_status"]
                              if (!defaultVariables.includes(match[1])) {
                                // match[1].length < 15
                                if (!keys.includes(match[1]) && !kyc.includes(match[1])) {
                                  keys.push(match[1]);
                                }
                              }
                              // Add the variable name (without braces) to the array
                            }
                            setScriptKeys(keys);
                            console.log("Keys extracted are", keys);
                            setSelectedAgent(item);
                          }}
                        >
                          <div style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                            Test AI
                          </div>
                        </button>

                      </div>

                    </div>


                    <div style={{ marginTop: 20 }} className='w-9.12 bg-white p-6 rounded-lg '>
                      <div className='w-full flex flex-row items-center justify-between'>

                        <Card
                          name="Calls"
                          value={item.calls && item.calls > 0 ? (<div>{item.calls}</div>) : "-"}
                          icon='/assets/selectedCallIcon.png'
                          bgColor="bg-blue-100"
                          iconColor="text-blue-500"
                        />
                        <Card
                          name="Convos"
                          value={item.callsGt10 && item.callsGt10 > 0 ? (<div>{item.callsGt10}</div>) : "-"}
                          icon='/otherAssets/convosIcon2.png'
                          bgColor="bg-purple-100"
                          iconColor="text-purple-500"
                        />
                        <Card
                          name="Hot Leads"
                          value="-"
                          icon='/otherAssets/hotLeadsIcon2.png'
                          bgColor="bg-orange-100"
                          iconColor="text-orange-500"
                        />

                        <Card
                          name="Booked Meetings"
                          value="-"
                          icon='/otherAssets/greenCalenderIcon.png'
                          bgColor="green"
                          iconColor="text-orange-500"
                        />

                        <Card
                          name="Mins Talked"
                          value={item.totalDuration && item.totalDuration > 0 ? (<div>{item.totalDuration}</div>) : "-"}
                          icon='/otherAssets/transferIcon.png'
                          bgColor="green"
                          iconColor="text-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
        }



        {/* code to add new agent */}
        <button
          className="w-full py-6 flex justify-center items-center"
          style={{
            marginTop: 40,
            border: "1px dashed #7902DF",
            borderRadius: "10px",
            // borderColor: '#7902DF',
            boxShadow: '0px 0px 15px 15px rgba(64, 47, 255, 0.05)',
            backgroundColor: "#FBFCFF"
          }}
          onClick={handleAddNewAgent}
        >
          <div className='flex flex-row items-center gap-1'
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: '#000',
            }}
          >
            <Plus weight='bold' size={22} /> Add New Agent
          </div>
        </button>

      </div>

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
            backgroundColor: "#00000030",
            // backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-5/12 sm:w-full w-6/12" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full h-[80vh]">
            <div
              className="sm:w-full w-full px-10 py-8"
              style={{
                backgroundColor: "#ffffff",

                borderRadius: "13px",
              }}
            >
              <div className='flex flex-row justify-between'>
                <div className='flex flex-row gap-3'>
                  <Image
                    src={'/otherAssets/testAiIcon.png'}
                    height={19} width={19} alt='icon'
                  />
                  <div style={{ fontSize: 16, fontWeight: '500', color: '#000' }}>
                    Test
                  </div>

                  {
                    !selectedAgent?.phoneNumber && (
                      <div className='flex flex-row items-center gap-2 -mt-1'>
                        <Image src={"/assets/warningFill.png"} height={20} width={20} alt='*' />
                        <p>
                          <i className='text-red' style={{
                            fontSize: 12,
                            fontWeight: "600"
                          }}>
                            No Phone number assigned
                          </i>
                        </p>
                      </div>
                    )
                  }

                </div>
                <button onClick={() => {
                  setOpenTestAiModal(false);
                  setName("");
                  setPhone("");
                  setErrorMessage("");
                }}>
                  <Image src={"/otherAssets/crossIcon.png"} height={24} width={24} alt='*' />
                </button>
              </div>

              <div style={{ fontSize: 24, fontWeight: '700', color: '#000', marginTop: 20 }}>
                Tryout ({selectedAgent?.name.slice(0, 1).toUpperCase()}{selectedAgent?.name.slice(1)})
              </div>


              <div className='pt-5' style={styles.headingStyle}>
                Who are you calling
              </div>
              <input
                placeholder="Name"
                className='w-full rounded p-2 outline-none focus:outline-none focus:ring-0'
                style={{ ...styles.inputStyle, border: "1px solid #00000020" }}
                value={name}
                onChange={(e) => { setName(e.target.value) }}
              />

              <div className='pt-5' style={styles.headingStyle}>
                Phone Number
              </div>

              <div style={{ marginTop: "8px" }}>
                <PhoneInput
                  className="border outline-none bg-white"
                  country={countryCode} // Set the default country
                  value={phone}
                  onChange={handlePhoneNumberChange}
                  onFocus={getLocation}
                  placeholder={locationLoader ? "Loading location ..." : "Enter Number"}
                  // disabled={loading} // Disable input if still loading
                  style={{ borderRadius: "7px" }}
                  inputStyle={{
                    width: '100%',
                    borderWidth: '0px',
                    backgroundColor: 'transparent',
                    paddingLeft: '60px',
                    paddingTop: "20px",
                    paddingBottom: "20px",
                  }}
                  buttonStyle={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    // display: 'flex',
                    // alignItems: 'center',
                    // justifyContent: 'center',
                  }}
                  dropdownStyle={{
                    maxHeight: '150px',
                    overflowY: 'auto'
                  }}
                  countryCodeEditable={true}
                // defaultMask={loading ? 'Loading...' : undefined}
                />
              </div>

              {
                errorMessage ?
                  <p style={{ ...styles.errmsg, color: errorMessage && 'red', height: '20px' }}>
                    {errorMessage}
                  </p> : ""
              }

              <div className='h-[37vh] overflow-auto' style={{ scrollbarWidth: "none" }}>
                {
                  scriptKeys?.map((key, index) => (
                    <div key={index}>
                      <div className='pt-5' style={styles.headingStyle}>
                        Variable {`{${key}}`}
                      </div>
                      <input
                        placeholder="Type here"
                        // className="w-full border rounded p-2 outline-none focus:outline-none focus:ring-0 mb-12"
                        className={`w-full border rounded p-2 outline-none focus:outline-none focus:ring-0 ${index === scriptKeys.length - 1 ? "mb-16" : ""
                          }`}
                        style={styles.inputStyle}
                        value={inputValues[index] || ""} // Default to empty string if no value
                        onChange={(e) => handleInputChange(index, e.target.value)}
                      />
                    </div>
                  ))
                }
              </div>

              <div className='w-full' style={{}}>
                {
                  testAIloader ?
                    <div className="flex flex-row items-center justify-center w-full p-3 mt-2">
                      <CircularProgress size={30} />
                    </div> :
                    <div>
                      {
                        name && phone && (
                          <button style={{ marginTop: 20 }}
                            className='w-full flex bg-purple p-3 rounded-lg items-center justify-center mb-8'
                            onClick={handleTestAiClick}
                          >
                            <div style={{ fontSize: 16, fontWeight: '500', color: '#fff' }}>
                              Test AI
                            </div>
                          </button>
                        )
                      }
                    </div>
                }
              </div>




              {/* Can be use full to add shadow */}
              {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>

      {/* Success snack bar */}
      <div>
        <Snackbar
          open={showSuccessSnack}
          autoHideDuration={3000}
          onClose={() => {
            setShowSuccessSnack(null);
          }}
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          TransitionComponent={Fade}
          TransitionProps={{
            direction: "center",
          }}
        >
          <Alert
            onClose={() => {
              setShowSuccessSnack(null);
            }}
            severity="success"
            // className='bg-purple rounded-lg text-white'
            sx={{
              width: "auto",
              fontWeight: "700",
              fontFamily: "inter",
              fontSize: "22",
            }}
          >
            {showSuccessSnack}
          </Alert>
        </Snackbar>
      </div>

      {/* drawer */}

      <Drawer
        anchor="right"
        open={showDrawer}
        onClose={() => setShowDrawer(null)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "50%", // Adjust the width as per your design
            padding: "60px", // Add padding for internal spacing
          },
        }}
      >
        <div className="flex flex-col w-full">
          <div className="w-full flex flex-row items-center justify-between mb-8">

            <div className="flex flex-row items-center gap-4 ">
              <div className="flex items-end">
                <Image
                  src={"/assets/colorCircle.png"}
                  height={90}
                  width={90}
                  alt="profile"
                />
                <button style={{ marginLeft: -35 }}>
                  <Image
                    src={"/otherAssets/cameraBtn.png"}
                    height={36}
                    width={36}
                    alt="camera"
                  />
                </button>
              </div>
              <div className='flex flex-col gap-1 items-start '>
                <div className='flex flex-row gap-2 items-center '>
                  <div style={{ fontSize: 22, fontWeight: "600" }}>
                    {showDrawer?.name.slice(0, 1).toUpperCase()}{showDrawer?.name.slice(1)}
                  </div>
                  <div className='text-purple' style={{ fontSize: 11, fontWeight: "600" }}>
                    {showDrawer?.agentObjective} <span className='text-[#00000060]'> | {showDrawer?.agentType}</span>
                  </div>
                </div>

                <div style={{ fontSize: 15, fontWeight: "500", color: "#000" }}>
                  {/* {showDrawer?.phoneNumber} */}
                  {formatPhoneNumber(showDrawer?.phoneNumber)}
                </div>

                <div className='flex flex-row gap-2 items-center '>
                  <div style={{ fontSize: 11, fontWeight: "500", color: "#666" }}>
                    Created on:
                  </div>
                  <div style={{ fontSize: 11, fontWeight: "500", color: "#000" }}>
                    {/* {showDrawer?.createdAt} */}
                    {moment(showDrawer?.createdAt).format("MMM DD, YYYY")}
                  </div>

                </div>
              </div>
            </div>

          </div>



          <div className="grid grid-cols-5 gap-6 border p-8 flex-row justify-between w-full rounded-lg mb-6">
            <Card
              name="Calls"
              value={showDrawer?.calls && showDrawer?.calls > 0 ? (<div>{showDrawer?.calls}</div>) : "-"}
              icon="/assets/selectedCallIcon.png"
              bgColor="bg-blue-100"
              iconColor="text-blue-500"
            />
            <Card
              name="Convos"
              value={showDrawer?.callsGt10 && showDrawer?.callsGt10 > 0 ? (<div>{showDrawer?.callsGt10}</div>) : "-"}
              icon="/otherAssets/convosIcon2.png"
              bgColor="bg-purple-100"
              iconColor="text-purple-500"
            />
            <Card
              name="Hot Leads"
              value="-"
              icon="/otherAssets/hotLeadsIcon2.png"
              bgColor="bg-orange-100"
              iconColor="text-orange-500"
            />
            <Card
              name="Booked Meetings"
              value="-"
              icon="/otherAssets/greenCalenderIcon.png"
              bgColor="bg-green-100"
              iconColor="text-green-500"
            />
            <Card
              name="Mins Talked"
              value={showDrawer?.totalDuration && showDrawer?.totalDuration > 0 ? (<div>{showDrawer?.totalDuration}</div>) : "-"}
              icon="/otherAssets/transferIcon.png"
              bgColor="bg-green-100"
              iconColor="text-green-500"
            />
          </div>

          <div className="flex gap-8 pb-2 mb-4">
            {["Agent Info", "Calender", "Pipeline | Stages"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${activeTab === tab ? "text-purple border-b-2 border-purple" : "text-black-500"
                  }`} style={{ fontSize: 15, fontWeight: '500' }}
              >
                {tab}
              </button>
            ))}

          </div>





          {/* <div className='w-full flex items-end justify-end mb-5'>
            <button style={{ color: '#7902DF', fontSize: 15, fontWeight: '600' }}>
              Save Changes
            </button>
          </div> */}

          {/* Code for agent info */}
          {
            activeTab === "Agent Info" ? (
              <div className='w-full'>
                <div className="flex flex-col gap-4">
                  <div className='flex flex-row items-center justify-between'>
                    <div style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>
                      Agent
                    </div>
                    {
                      assignLoader ?
                        <div>
                          <CircularProgress size={25} />
                        </div> :
                        <button
                          className='text-purple underline'
                          style={{ fontSize: 16, fontWeight: '600', color: '' }}
                          onClick={AssignNumber}
                        >
                          Save Changes
                        </button>
                    }
                  </div>
                  <div className="flex justify-between">
                    <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>Name</div>
                    <div
                      style={{
                        fontSize: 15, fontWeight: '500', color: '#000'
                      }}>
                      {showDrawer?.name}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>Role</div>
                    <div
                      style={{
                        fontSize: 15, fontWeight: '500', color: '#000'
                      }}>
                      {showDrawer?.agentRole}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>Voice</div>
                    <div className='flex flex-row items-center gap-1'
                      style={{
                        fontSize: 15, fontWeight: '500', color: '#000'
                      }}>
                      <Image src={"/otherAssets/voiceAvt.png"} height={22} width={22} alt='*' />
                      {showDrawer?.voiceId}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4 mt-4">

                  <div style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>
                    Contact Info
                  </div>

                  <div className="flex justify-between items-center">
                    <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>
                      Number used for calls
                    </div>
                    <div
                      style={{
                        fontSize: 15, fontWeight: '500', color: '#000'
                      }}>
                      {/*showDrawer?.phoneNumber*/}
                      {/* <FormControl size="200px">

                        <Select
                          value={assignNumber}
                          onChange={handleAssignNumberChange}
                          displayEmpty // Enables placeholder
                          renderValue={(selected) => {
                            if (!selected) {
                              return <div style={{ color: "#aaa" }}>Select</div>; // Placeholder style
                            }
                            return selected;
                          }}
                          sx={{
                            border: "1px solid #00000020", // Default border
                            "&:hover": {
                              border: "1px solid #00000020", // Same border on hover
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              border: "none", // Remove the default outline
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
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
                          <MenuItem value={10}>Ten</MenuItem>
                          <MenuItem value={20}>Twenty</MenuItem>
                          <MenuItem value={30}>Thirty</MenuItem>
                        </Select>
                      </FormControl> */}
                      <Box className="w-full">
                        <FormControl className="w-full">
                          <Select
                            ref={selectRef}
                            open={openCalimNumDropDown}
                            onClose={() => setOpenCalimNumDropDown(false)}
                            onOpen={() => setOpenCalimNumDropDown(true)}
                            className='border-none rounded-2xl outline-none p-0 m-0'
                            displayEmpty
                            value={assignNumber}
                            // onChange={handleSelectNumber}
                            onChange={(e) => {
                              let value = e.target.value
                              setAssignNumber(value)
                              setOpenCalimNumDropDown(false);
                            }}
                            renderValue={(selected) => {
                              if (selected === '') {
                                return <div>Select Number</div>;
                              }
                              return selected;
                            }}
                            sx={{
                              ...styles.dropdownMenu,
                              backgroundColor: 'none',
                              '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none',
                              },
                              padding: 0,
                              margin: 0
                            }}
                          >
                            {
                              previousNumber.map((item, index) => (
                                <MenuItem key={index} style={styles.dropdownMenu} value={item.phoneNumber.slice(1)} className='flex flex-row items-center gap-2'>
                                  {item.phoneNumber}
                                  {
                                    showReassignBtn && (
                                      <div>
                                        {
                                          item.claimedBy && (
                                            <div className='flex flex-row items-center gap-2'>
                                              {`(Claimed by {${item.claimedBy.name}})`}
                                              {
                                                reassignLoader === item ?
                                                  <CircularProgress size={15} /> :
                                                  <button className="text-purple underline" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowConfirmationModal(item);
                                                    // handleReassignNumber(item)
                                                    // handleReassignNumber(e.target.value)
                                                  }} >
                                                    Reassign
                                                  </button>
                                              }
                                            </div>
                                          )
                                        }
                                      </div>
                                    )
                                  }
                                </MenuItem>
                              ))
                            }
                            <MenuItem style={styles.dropdownMenu} value={showGlobalBtn ? 14062040550 : ""}>
                              +14062040550
                              {
                                showGlobalBtn && (
                                  " (Our global phone number avail to first time users)"
                                )
                              }
                              {
                                showGlobalBtn == false && (
                                  " (Only for outbound agents. You must Buy a number)"
                                )
                              }
                            </MenuItem>
                            <div className='ms-4' style={{ ...styles.inputStyle, color: '#00000070' }}><i>Get your own unique phone number.</i> <button className='text-purple underline' onClick={() => { setShowClaimPopup(true) }}>Claim one</button></div>
                          </Select>
                        </FormControl>
                      </Box>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className='flex flex-row gap-3'>
                      <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>
                        Call back number
                      </div>
                      <div
                      // aria-owns={open ? 'mouse-over-popover' : undefined}
                      // aria-haspopup="true"
                      // onMouseEnter={handlePopoverOpen}
                      // onMouseLeave={handlePopoverClose}
                      >
                        <Image src={'/otherAssets/updateIcon.png'}
                          style={{
                            height: "20px",
                            width: "20px",
                            objectFit: "cover" // Ensures proper fitting
                          }}
                          height={20}
                          width={20}
                          alt='call'
                        />
                      </div>
                      {/* Code for popover */}

                    </div>
                    <div
                      style={{
                        fontSize: 15, fontWeight: '500', color: '#000'
                      }}>
                      {showDrawer?.callbackNumber ?
                        <div>
                          {showDrawer?.callbackNumber}
                        </div> : "-"
                      }
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <div className='flex flex-row gap-3'>
                      <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>
                        Call transfer number
                      </div>
                      <Image
                        src={'/otherAssets/updateIcon.png'}
                        style={{
                          height: "20px",
                          width: "20px",
                          objectFit: "cover" // Ensures proper fitting
                        }}
                        alt="call"
                        height={20}
                        width={20}
                      />

                    </div>
                    <div>
                      {showDrawer?.liveTransferNumber ?
                        <div>
                          {showDrawer?.liveTransferNumber}
                        </div> : "-"
                      }
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === "Calender" ? (
              <div>
                <div className='flex flex-row items-center justify-between'>
                  <p style={{ fontSize: 15, fontWeight: '600', color: '#666' }}>
                    Title
                  </p>
                  <p style={{ fontSize: 16, fontWeight: '500', color: '#000' }}>
                    {calendarDetails?.calendar?.title ?
                      <div>
                        {calendarDetails?.calendar?.title}
                      </div> : "-"
                    }
                  </p>
                </div>
                <div className='flex flex-row items-center justify-between mt-6'>
                  <p style={{ fontSize: 15, fontWeight: '600', color: '#666' }}>
                    Event
                  </p>
                  <p style={{ fontSize: 16, fontWeight: '500', color: '#000' }}>
                    {calendarDetails?.calendar?.eventId ?
                      <div>
                        {calendarDetails?.calendar?.eventId}
                      </div>
                      : "-"
                    }
                  </p>
                </div>
                <div className='flex flex-row items-center justify-between mt-6'>
                  <p style={{ fontSize: 15, fontWeight: '600', color: '#666' }}>
                    Api key
                  </p>
                  <p style={{ fontSize: 16, fontWeight: '500', color: '#000' }}>
                    {calendarDetails?.calendar?.apiKey ?
                      <div>
                        {calendarDetails?.calendar?.apiKey}
                      </div> : "-"
                    }
                  </p>
                </div>
              </div>
            ) : activeTab === "Pipeline | Stages" ? (
              <div className="flex flex-col gap-4">
                <PiepelineAdnStage selectedAgent={showDrawer} />
              </div>
            ) : ""
          }

          <div className='flex flex-row justify-end w-full mt-4'>
            <button
              className='flex flex-row gap-2 items-center'
              onClick={() => { setDelAgentModal(true) }}
              style={{
                position: "absolute", bottom: 20
              }}
            >
              {/* <Image src={'/otherAssets/redDeleteIcon.png'}
                height={24}
                width={24}
                alt='del'
              /> */}

              <Image
                src={'/otherAssets/redDeleteIcon.png'}
                height={24}
                width={24}
                alt="del"
                style={{
                  filter: "brightness(0) saturate(100%) opacity(0.6)" // Convert to black and make semi-transparent
                }}
              />


              <div style={{
                fontSize: 15, fontWeight: '600',
                color: '#00000060', textDecorationLine: 'underline',
              }}>
                Delete Agent
              </div>
            </button>
          </div>




        </div>
      </Drawer>

      {/* Code to del agent */}
      <Modal
        open={delAgentModal}
        onClose={() => {
          setDelAgentModal(false);
        }}
      >
        <Box className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 p-8 rounded-[15px]" sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}>
          <div style={{ width: "100%", }}>

            <div className='max-h-[60vh] overflow-auto' style={{ scrollbarWidth: "none" }}>
              <div style={{ width: "100%", direction: "row", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {/* <div style={{ width: "20%" }} /> */}
                <div style={{ fontWeight: "500", fontSize: 17 }}>
                  Delete Agent
                </div>
                <div style={{ direction: "row", display: "flex", justifyContent: "end" }}>
                  <button onClick={() => {
                    setDelAgentModal(false);
                  }} className='outline-none'>
                    <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                  </button>
                </div>
              </div>

              <div className='mt-6' style={{ fontWeight: "700", fontSize: 22 }}>
                This is irreversible. Are you sure?
              </div>


            </div>

            <div className='flex flex-row items-center gap-4 mt-6'>
              <button className='w-1/2'>
                Cancel
              </button>
              <div className='w-1/2'>
                {
                  DelLoader ?
                    <div className='flex flex-row iems-center justify-center w-full mt-4'>
                      <CircularProgress size={25} />
                    </div> :
                    <button
                      className='mt-4 outline-none bg-red'
                      style={{
                        color: "white",
                        height: "50px", borderRadius: "10px", width: "100%",
                        fontWeight: 600, fontSize: '20'
                      }}
                      onClick={handleDeleteAgent}
                    >
                      Yes! Delete
                    </button>
                }
              </div>
            </div>


          </div>
        </Box>
      </Modal>

      {/* Warning modal */}
      <Modal
        open={ShowWarningModal}
        onClose={() => {
          setShowWarningModal(null);
        }}
      >
        <Box className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 p-8 rounded-[15px]" sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}>
          <div style={{ width: "100%", }}>

            <div className='max-h-[60vh] overflow-auto' style={{ scrollbarWidth: "none" }}>

              {/* <div style={{ width: "100%", direction: "row", display: "flex", justifyContent: "end", alignItems: "center" }}>
                <div style={{ direction: "row", display: "flex", justifyContent: "end" }}>
                  <button onClick={() => {
                    setShowWarningModal(false);
                  }} className='outline-none'>
                    <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                  </button>
                </div>
              </div> */}

              <div className='flex flex-row items-center justify-center gap-2 -mt-1'>
                <Image src={"/assets/warningFill.png"} height={18} width={18} alt='*' />
                <p>
                  <i className='text-red' style={{
                    fontSize: 16,
                    fontWeight: "600"
                  }}>
                    No Phone number assigned
                  </i>
                </p>
              </div>

            </div>

            <div className='flex flex-row items-center gap-4 mt-6'>
              <button
                className='mt-4 outline-none w-1/2'
                style={{
                  color: "black",
                  height: "50px", borderRadius: "10px", width: "100%",
                  fontWeight: 600, fontSize: '20'
                }}
                onClick={() => {
                  setShowWarningModal(null);
                }}
              >
                Close
              </button>
              <button
                className='mt-4 outline-none bg-purple w-1/2'
                style={{
                  color: "white",
                  height: "50px", borderRadius: "10px", width: "100%",
                  fontWeight: 600, fontSize: '20'
                }}
                onClick={() => {
                  setShowDrawer(ShowWarningModal);
                  setShowWarningModal(null);
                }}
              >
                Assign Number
              </button>
            </div>


          </div>
        </Box>
      </Modal>

      {/* Code for the confirmation of reassign button */}
      <Modal
        open={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(null);
        }}
      >
        <Box className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-5/12 p-8 rounded-[15px]" sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}>
          <div style={{ width: "100%", }}>

            <div className='max-h-[60vh] overflow-auto' style={{ scrollbarWidth: "none" }}>

              {/* <div style={{ width: "100%", direction: "row", display: "flex", justifyContent: "end", alignItems: "center" }}>
                <div style={{ direction: "row", display: "flex", justifyContent: "end" }}>
                  <button onClick={() => {
                    setShowWarningModal(false);
                  }} className='outline-none'>
                    <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                  </button>
                </div>
              </div> */}

              <div className='flex flex-row items-center justify-between w-full'>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: "600"
                  }}>
                  Reassign Number
                </div>
                <button
                  onClick={() => {
                    setShowConfirmationModal(null);
                  }}>
                  <Image src={"/assets/blackBgCross.png"} height={20} width={20} alt='*' />
                </button>
              </div>

              <div
                className='mt-8'
                style={{
                  fontSize: 22,
                  fontWeight: "600"
                }}>
                Confirm Action
              </div>

              <p
                className='mt-8'
                style={{
                  fontSize: 15,
                  fontWeight: "500"
                }}>
                Please confirm you would like to reassign <span className='text-purple'>({formatPhoneNumber(showConfirmationModal?.phoneNumber)})</span> to {`{${showDrawer?.name}}`}.
              </p>

            </div>

            <div className='flex flex-row items-center gap-4 mt-6'>
              <button
                className='mt-4 outline-none w-1/2'
                style={{
                  color: "black",
                  height: "50px", borderRadius: "10px", width: "100%",
                  fontWeight: 600, fontSize: '20'
                }}
                onClick={() => {
                  setShowClaimPopup(null);
                }}
              >
                Discard
              </button>
              <div className='w-full'>
                {
                  reassignLoader ?
                    <div
                      className='mt-4 w-full flex flex-row items-center justify-center'>
                      <CircularProgress size={25} />
                    </div> :
                    <button
                      className='mt-4 outline-none bg-purple w-full'
                      style={{
                        color: "white",
                        height: "50px", borderRadius: "10px", width: "100%",
                        fontWeight: 600, fontSize: '20'
                      }}
                      onClick={() => {
                        handleReassignNumber(showConfirmationModal);
                        console.log("test")
                      }}
                    >
                      {`I'm sure`}
                    </button>
                }
              </div>
            </div>


          </div>
        </Box>
      </Modal>

      {/* code for script */}

      <Modal
        open={showScriptModal}
        onClose={() => {
          handleCloseScriptModal()
        }}
      >
        <Box className="w-10/12 sm:w-10/12 md:w-8/12 lg:w-6/12 p-8 rounded-[15px]" sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}>
          <div style={{ width: "100%", }}>

            <div className='h-[90vh]' style={{ scrollbarWidth: "none" }}>
              <div style={{ height: "10%", width: "100%", direction: "row", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {/* <div style={{ width: "20%" }} /> */}
                <div style={{ fontWeight: "600", fontSize: 22 }}>
                  {showScriptModal?.name?.slice(0, 1).toUpperCase(0)}{showScriptModal?.name?.slice(1)}
                </div>
                <div style={{ direction: "row", display: "flex", justifyContent: "end" }}>
                  <button onClick={() => {
                    handleCloseScriptModal();
                  }} className='outline-none'>
                    <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                  </button>
                </div>
              </div>

              <div className='mt-6 flex flex-row gap-6'
                style={{ height: "", fontWeight: "500", fontSize: 15 }}>
                <button className='px-2 pb-1'
                  style={{
                    borderBottom: showScript && "2px solid #7902DF"
                  }}
                  onClick={handleShowScript}
                >
                  Script
                </button>
                <button className='px-2 pb-1'
                  style={{
                    borderBottom: SeledtedScriptKYC && "2px solid #7902DF"
                  }}
                  onClick={handleShowKycs}
                >
                  KYC
                </button>
                <button className='px-2 pb-1'
                  style={{
                    borderBottom: SeledtedScriptAdvanceSetting && "2px solid #7902DF"
                  }}
                  onClick={handleShowAdvanceSeting}
                >
                  Advance Settings
                </button>
              </div>

              {
                showScript && (
                  <div style={{ height: "80%", overflow: "auto", scrollbarWidth: "none" }}>

                    <div style={{ height: "90%" }}>
                      <div className='bg-[#00000002] p-2 mt-6'>
                        <div style={styles.inputStyle} className='flex flex-row items-center gap-2'>
                          <Image src={"/assets/lightBulb.png"} alt='*' height={24} width={24} />  Editing Tips
                        </div>
                        <div style={styles.inputStyle} className='flex flex-row flex-wrap gap-2'>
                          <div>
                            You can use these variables:
                          </div>
                          {/* <div className='flex flex-row items-center gap-2'> */}
                          <div style={{ width: "fit-content" }} className='text-purple flex flex-row gap-2'>
                            {`{Address}`},{`{Phone}`}, {`{Email}`},{`{Kyc}`}
                            {/* {`{First Name}`}, {`{Email}`}, */}
                          </div>

                          {
                            uniqueColumns.length > 0 && showMoreUniqueColumns ?
                              <div className='flex flex-row flex-wrap gap-2'>
                                {
                                  uniqueColumns.map((item, index) => (
                                    <div key={index} className='flex flex-row items-center gap-2 text-purple'>
                                      {`{${item}}`},
                                    </div>
                                  ))
                                }
                                <button className='text-purple outline-none' onClick={handleShowUniqueCols}>
                                  show less
                                </button>
                              </div> :
                              <div>
                                {
                                  uniqueColumns.length > 0 && (
                                    <button
                                      className='text-purple flex flex-row items-center font-bold outline-none'
                                      onClick={() => {
                                        handleShowUniqueCols()
                                      }}
                                    >
                                      <Plus weight='bold' size={15}
                                        style={{
                                          strokeWidth: 40, // Adjust as needed
                                        }}
                                      />
                                      {uniqueColumns.length}
                                    </button>
                                  )
                                }
                              </div>
                          }


                          {/* </div> */}
                        </div>
                      </div>

                      <div className='w-full'>
                        <div className='flex flex-row items-center mt-4'>
                          <button className='flex flex-row items-center gap-4' onClick={() => { setIntroVideoModal(true) }}>
                            <Image src={"/assets/youtubeplay.png"} height={45} width={45} alt='*' style={{ borderRadius: "7px" }} />
                            <div
                              style={{
                                fontSize: 15,
                                fontWeight: "500",
                                borderColor: "#00000020"
                              }} className='underline'>
                              Learn how to customize your script
                            </div>
                          </button>
                        </div>

                        <div className='mt-4' style={{ fontSize: 24, fontWeight: "700" }}>
                          Script
                        </div>

                        <div className='flex flex-row items-center justify-between'>
                          <div className='mt-2' style={{ ...styles.paragraph, color: "#00000060" }}>
                            Greeting
                          </div>

                        </div>

                        <div className='mt-2'>
                          <GreetingTagInput greetTag={greetingTagInput} kycsList={kycsData} uniqueColumns={uniqueColumns} tagValue={setGreetingTagInput} scrollOffset={scrollOffset} />
                        </div>
                        <div className='mt-4 w-full'>

                          <PromptTagInput promptTag={scriptTagInput} kycsList={kycsData} tagValue={setScriptTagInput} scrollOffset={scrollOffset} />

                          {/* <DynamicDropdown /> */}

                        </div>
                      </div>
                    </div>

                    <div style={{ height: "10%" }}>
                      {
                        !showSaveChangesBtn && (
                          <div className='w-full pb-8'>
                            {
                              UpdateAgentLoader ?
                                <div className='w-full flex flex-row justify-center'>
                                  <CircularProgress size={15} />
                                </div> :
                                <button
                                  className='underline bg-purple w-full h-[50px] rounded-xl mb-4 text-white'
                                  style={{ fontWeight: "600", fontSize: 15 }}
                                  onClick={() => { updateAgent() }}
                                >
                                  Save Changes
                                </button>
                            }
                          </div>)
                      }
                    </div>

                  </div>
                )
              }

              {
                SeledtedScriptAdvanceSetting && (
                  <div style={{ height: "80%" }}>
                    <div className='flex flex-row items-center gap-2 mt-4'>
                      <button className='px-2 outline-none' style={{ borderBottom: showObjection && "2px solid #7902DF" }} onClick={handleShowObjection}>
                        Objection
                      </button>
                      <button
                        className='px-2 outline-none' style={{
                          borderBottom: showGuardrails && "2px solid #7902DF"
                        }}
                        onClick={handleShowGuardrails}>
                        Guardrails
                      </button>
                      <button
                        className='px-2 outline-none' style={{
                          borderBottom: showObjectives && "2px solid #7902DF"
                        }}
                        onClick={handleShowObjectives}>
                        Objectives
                      </button>
                    </div>

                    {
                      showObjection && (
                        <div style={{ height: "80%" }}>
                          <div style={{ marginTop: "40px", height: "80%" }}>
                            <Objection showTitle={true} selectedAgentId={showScriptModal} />
                          </div>
                        </div>
                      )
                    }

                    {
                      showGuardrails && (
                        <div style={{ height: "80%" }}>
                          <div style={{ marginTop: "40px", height: "80%" }}>
                            <GuarduanSetting showTitle={true} selectedAgentId={showScriptModal} />
                          </div>
                        </div>
                      )
                    }

                    {
                      showObjectives && (
                        <div style={{ height: "80%" }}>
                          <div style={{ overflow: "auto", scrollbarWidth: "none", marginTop: "40px", height: "80%" }}>
                            {showScriptModal?.prompt?.objective}
                          </div>
                        </div>
                      )
                    }
                  </div>
                )
              }

              {
                SeledtedScriptKYC && (
                  <div style={{ height: "80%", overflow: "auto", scrollbarWidth: "none", backgroundColor: "" }}>
                    <KYCs kycsDetails={setKycsData} />
                  </div>
                )
              }


            </div>




          </div>
        </Box>
      </Modal>

      {/* Modal for video */}
      <Modal
        open={introVideoModal}
        onClose={() => setIntroVideoModal(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: "#00000020",
            // backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-5/12 sm:w-full w-8/12" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-full w-full"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
              }}
            >
              <div className='flex flex-row justify-end'>
                <button onClick={() => { setIntroVideoModal(false) }}>
                  <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                </button>
              </div>

              <div className='text-center sm:font-24 font-16' style={{ fontWeight: "700" }}>
                Learn more about assigning leads
              </div>

              <div className='mt-6'>
                <iframe
                  src="https://www.youtube.com/embed/Dy9DM5u_GVg?autoplay=1&mute=1" //?autoplay=1&mute=1 to make it autoplay
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube video"
                  // className='w-20vh h-40vh'
                  style={{
                    width: "100%",
                    height: "50vh",
                    borderRadius: 15,
                  }}
                />
              </div>

              {/* Can be use full to add shadow */}
              {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>

      {/* Code for Purchase and find number popup */}
      <Modal
        open={showClaimPopup}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: "#00000020",
            // backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-8/12 sm:w-full w-8/12" sx={styles.claimPopup}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-8/12 w-full min-h-[50vh] max-h-[80vh] flex flex-col justify-between"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
              }}
            >
              <div>
                <div className='flex flex-row justify-end'>
                  <button onClick={handleCloseClaimPopup}>
                    <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                  </button>
                </div>
                <div style={{
                  fontSize: 24,
                  fontWeight: "700",
                  textAlign: "center"
                }}>
                  {`Let's claim your phone number`}
                </div>
                <div className='mt-2' style={{
                  fontSize: 15,
                  fontWeight: "700", textAlign: "center"
                }}>
                  Enter the 3 digit area code you would like to use
                </div>
                <div className='mt-4'
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: "#15151550"
                  }}>
                  Number
                </div>
                <div className='mt-2'>
                  <input className='border border-[#00000010] outline-none p-3 rounded-lg w-full mx-2 focus:outline-none focus:ring-0' type='' placeholder='Ex: 619, 213, 313'
                    value={findNumber}
                    onChange={(e) => {
                      setFindeNumberLoader(true);
                      if (timerRef.current) {
                        clearTimeout(timerRef.current);
                      }

                      const value = e.target.value
                      setFindNumber(e.target.value.replace(/[^0-9]/g, ""));
                      // handleFindeNumbers(value)
                      if (value) {
                        timerRef.current = setTimeout(() => {
                          handleFindeNumbers(value);
                        }, 300);
                      } else {
                        console.log("Should not search")
                        return
                      }
                    }}
                  />
                </div>

                {
                  findNumber ?
                    <div>
                      {
                        findeNumberLoader ?
                          <div className='flex flex-row justify-center mt-6'>
                            <CircularProgress size={35} />
                          </div> :
                          <div className='mt-6 max-h-[40vh] overflow-auto' style={{ scrollbarWidth: "none" }}>
                            {
                              foundeNumbers.length > 0 ?
                                <div className='w-full'>
                                  {
                                    foundeNumbers.map((item, index) => (
                                      <div key={index} className='h-[10vh] rounded-2xl flex flex-col justify-center p-4 mb-4'
                                        style={{
                                          border: index === selectedPurchasedIndex ? "2px solid #7902DF" : "1px solid #00000020",
                                          backgroundColor: index === selectedPurchasedIndex ? "#402FFF05" : ""
                                        }}
                                      >
                                        <button className='flex flex-row items-start justify-between outline-none' onClick={(e) => { handlePurchaseNumberClick(item, index) }}>
                                          <div>
                                            <div style={styles.findNumberTitle}>
                                              {item.phoneNumber}
                                            </div>
                                            <div className='text-start mt-2' style={styles.findNumberDescription}>
                                              {item.locality} {item.region}
                                            </div>
                                          </div>
                                          <div className="flex flex-row items-start gap-4">
                                            <div style={styles.findNumberTitle}>
                                              ${item.price}/mo
                                            </div>
                                            <div>
                                              {
                                                index == selectedPurchasedIndex ?
                                                  <Image src={"/assets/charmTick.png"} height={35} width={35} alt='*' /> :
                                                  <Image src={"/assets/charmUnMark.png"} height={35} width={35} alt='*' />
                                              }
                                            </div>
                                          </div>
                                        </button>
                                      </div>
                                    ))
                                  }
                                </div> :
                                <div className='text-xl font-[600] text-center mt-4'>
                                  No result found. Try a new search
                                </div>
                            }
                          </div>
                      }
                    </div> :
                    <div className='text-xl font-[600] text-center mt-4'>
                      Enter number to search
                    </div>
                }



              </div>
              <div className='h-[50px]'>
                <div>
                  {
                    purchaseLoader ?
                      <div className='w-full flex flex-row justify-center mt-4'>
                        <CircularProgress size={32} />
                      </div> :
                      <div>
                        {
                          selectedPurchasedNumber && (
                            <button className='text-white bg-purple w-full h-[50px] rounded-lg' onClick={handlePurchaseNumber}>
                              Proceed to Buy
                            </button>
                          )
                        }
                      </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </Box>
      </Modal>

    </div >
  )
}


const Card = ({ name, value, icon, bgColor, iconColor }) => {
  return (
    <div className="flex flex-col items-start gap-2">
      {/* Icon */}
      <Image src={icon}
        height={24}
        color={bgColor}
        width={24}
        alt='icon'
      />

      <div style={{ fontSize: 15, fontWeight: '500', color: '#000' }}>{name}</div>
      <div style={{ fontSize: 20, fontWeight: '600', color: '#000' }}>{value}</div>
    </div>
  );
};


export default Page


const styles = {
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
  headingStyle: {
    fontSize: 16,
    fontWeight: "700"
  },
  inputStyle: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 10,
    borderColor: "#00000020"
  },
  paragraph: {
    fontSize: 15,
    fontWeight: "500"
  }
}

