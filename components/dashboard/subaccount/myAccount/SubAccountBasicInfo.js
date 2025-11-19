"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { TextField, Button, Box, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import getProfileDetails from "@/components/apis/GetProfile";
import { UpdateProfile } from "@/components/apis/UpdateProfile";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import { UserTypes } from "@/constants/UserTypes";
import AgentSelectSnackMessage, { SnackbarTypes } from "@/components/dashboard/leads/AgentSelectSnackMessage";
import { useUser } from "@/hooks/redux-hooks";

function SubAccountBasicInfo() {
  const router = useRouter();
  const { setUser: setReduxUser } = useUser();
  const [focusedName, setFocusedName] = useState(false);
  const [focusedFarm, setFocusedFarm] = useState(false);
  const [focusedTerritory, setFocusedTerritory] = useState(false);
  const [focusedBrokerage, setFocusedBrokerage] = useState(false);
  const [focusedCompany, setFocusedCompany] = useState(false);
  const [focusedCompanyAffiliation, setFocusedCompanyAffiliation] =
    useState(false);
  const [focusedTransaction, setFocusedTransaction] = useState(false);
  const [focusedInstallationVolume, setFocusedInstallationVolume] =
    useState(false);
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedServiceArea, setFocusedServiceArea] = useState(false);
  const [focusedProjectSize, setFocusedProjectSize] = useState(false);
  const [focusedClientsPerMonth, setFocusedClientsPerMonth] = useState(false);
  const [focusedCasesPerMonth, setFocusedCasesPerMonth] = useState(false);
  const [focusedWebsite, setFocusedWebSite] = useState(false);

  //my variable
  const [serviceId, setServiceId] = useState([]);
  const [servicesData, setServicesData] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [farm, setFarm] = useState("");
  const [transaction, setTransaction] = useState("");
  const [brokerAge, setBrokerAge] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [teritorry, setTeritorry] = useState("");
  const [company, setCompany] = useState("");
  const [installationVolume, setInstallationVolume] = useState("");
  const [projectSize, setProjectSize] = useState("");
  const [clientType, setClientType] = useState("");
  const [consoltation, setconsaltation] = useState("");
  const [clientType2, setClientType2] = useState("");
  const [collectionStratigy, setcollectionStratigy] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [companyAffiliation, setCompanyAffiliation] = useState("");
  const [clientsPerMonth, setClientsPerMonth] = useState("");
  const [CasesPerMonth, setCasessPerMonth] = useState("");

  const [isNameChanged, setIsNameChanged] = useState(false);
  const [isTransactionChanged, setIsTransactionChange] = useState("");
  const [isFarmChanged, setIsFarmChanged] = useState(false);
  const [isBrokerageChanged, setIsBrokerageChanged] = useState(false);
  const [isServiceAreaChanged, setIsServiceAreaChanged] = useState(false);
  const [isTeritorryChanged, setIsTeritorryChanged] = useState("");
  const [isCompanyChanged, setIsCompanyChanged] = useState("");
  const [isCompanyAffiliationChanged, setIsCompanyAffiliationChanged] =
    useState("");
  const [isInstallationVolumechanged, setIsInstallationVolumeChanged] =
    useState("");
  const [isProjectSizeChanged, setIsprojectSizeChanged] = useState("");
  const [isClientsPerMonthChanged, setIsClientsPerMonthChanged] = useState("");
  const [iscasesPerMonthChanged, setIcasesPerMonthChanged] = useState("");
  const [isWebsiteUrlChanged, setIsWebsiteUrlChanged] = useState("");

  const [agentServices, setAgentServices] = useState([]);
  const [agentAreasOfFocus, setAgentAreasOfFocus] = useState([]);
  const [agentIndustries, setAgentIndustries] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);

  const [loading, setloading] = useState(false);
  const [loading2, setloading2] = useState(false);
  const [loading3, setloading3] = useState(false);
  const [loading4, setloading4] = useState(false);
  const [loading5, setloading5] = useState(false);
  const [loading6, setloading6] = useState(false);
  const [loading7, setloading7] = useState(false);
  const [loading8, setloading8] = useState(false);
  const [loading9, setloading9] = useState(false);
  const [loading10, setLoading10] = useState(false);
  const [loading11, setLoading11] = useState(false);
  const [loading12, setLoading12] = useState(false);
  const [loading13, setLoading13] = useState(false);

  const [srviceLoader, setServiceLoader] = useState(false);
  const [areaLoading, setAreaLoading] = useState(false);

  // Email editing state
  const [isEmailChanged, setIsEmailChanged] = useState(false);
  const emailRef = useRef(null);

  // Email validation and checking states
  const [originalEmail, setOriginalEmail] = useState("");
  const [emailLoader, setEmailLoader] = useState(false);
  const [emailCheckResponse, setEmailCheckResponse] = useState(null);
  const [validEmail, setValidEmail] = useState("");
  const emailTimerRef = useRef(null);

  // Success and error message states
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [selected, setSelected] = useState([]);
  const [selectedArea, setSelectedArea] = useState([]);

  //code for image select and drag and drop
  const [selectedImage, setSelectedImage] = useState("");
  const [dragging, setDragging] = useState(false);

  const [originalSelectedIndustries, setOriginalSelectedIndustries] = useState(
    []
  ); // To track initial state
  const [originalSelectedArea, setOriginalSelectedArea] = useState([]); // To track initial state
  const [originalSelectedService, setOriginalSelectedService] = useState([]); // To track initial state

  //user details
  const [UserDetails, setUserDetails] = useState(null);

  const [userRole, setUserRole] = useState("");
  const [userType, setUserType] = useState("");

  const primaryClientTypes = [
    {
      id: 1,
      title: "Residential clients",
      value: "residential",
    },
    {
      id: 2,
      title: "Commercial clients",
      value: "commercial",
    },
    {
      id: 3,
      title: "Both",
      value: "both",
    },
  ];

  const primaryClientTypes3 = [
    {
      id: 1,
      title: "Soft Collections",
    },
    {
      id: 2,
      title: "Hard Collections",
    },
    {
      id: 3,
      title: "Hybrid Approach",
    },
    // {
    //   id: 100,
    //   title: "All",
    // },
  ];
  const primaryClientTypes4 = [
    {
      id: 1,
      title: "First-Time Homebuyers",
    },
    {
      id: 2,
      title: "Investors & Property Developers",
    },
    {
      id: 3,
      title: "Veterans & Active Military",
    },
    {
      id: 3,
      title: "Luxury Homebuyers",
    },
    {
      id: 5,
      title: "Self-Employed & Entrepreneurs",
    },
    {
      id: 6,
      title: "Other (type here)",
    },
  ];

  //array for the primary client types
  const primaryClientTypes2 = [
    {
      id: 1,
      title: "Individuals (B2)",
    },
    {
      id: 2,
      title: "Businesses & Corporations (B2B)",
    },
    {
      id: 3,
      title: "Government & Public Sector",
    },
  ];

  const ConsultationFormat = [
    {
      id: 1,
      title: "In-Person Consultations",
    },
    {
      id: 2,
      title: "Virtual Consultations",
    },
    {
      id: 3,
      title: "Virtual Consultationsr",
    },
  ];

  //fetching the data
  useEffect(() => {
    const LocalData = localStorage.getItem("User");
    if (LocalData) {
      const userData = JSON.parse(LocalData);
      //console.log;

      setUserRole(userData?.user?.userRole);
      setUserType(userData?.user?.userType);
      // setUserType(UserTypes.SolarRep)
      setUserDetails(userData.user);
      setName(userData?.user?.name);
      setSelectedImage(userData?.user?.thumb_profile_image);
      setEmail(userData?.user?.email);
      setOriginalEmail(userData?.user?.email || "");
      setFarm(userData?.user?.farm);
      setTransaction(userData?.user?.averageTransactionPerYear);
      setBrokerAge(userData?.user?.brokerage);
      setPhone(userData?.user?.phone);

      setServiceArea(userData?.user?.areaOfService);
      setClientType(userData?.user?.primaryClientType);
      setClientType2(userData?.user?.clientType);

      setCompany(userData?.user?.company);
      // setProjectSize(userData?.user?.projectSizeKw);
      setWebsiteUrl(userData?.user?.website);
      setCompanyAffiliation(userData?.user?.firmOrCompanyAffiliation);
      setClientsPerMonth(userData?.user?.averageMonthlyClients);
      setCasessPerMonth(userData?.user?.caseVolume);

      setInstallationVolume(userData?.user?.projectsPerYear || "");
      setProjectSize(userData?.user?.projectSizeKw || "");

      //console.log;
      //console.log;

      // Initialize arrays to hold services and areas of focus
      const industriesArray = [];
      const servicesArray = [];
      const focusAreasArray = [];

      // Pre-populate selected services and areas based on the user profile
      userData?.user?.services?.forEach((item) => {
        servicesArray.push(item.id); // Add the full object or only IDs as needed
      });
      userData?.user?.userIndustry?.forEach((item) => {
        industriesArray.push(item.id); // Add the full object or only IDs as needed
      });

      userData?.user?.focusAreas?.forEach((item) => {
        focusAreasArray.push(item.id); // Add the full object or only IDs as needed
      });

      // Set default selected areas and services
      // setSelected(servicesArray); // Default select services

      setSelectedIndustries(industriesArray);
      setOriginalSelectedIndustries(industriesArray);

      setSelectedArea(focusAreasArray);
      setOriginalSelectedArea(focusAreasArray); // Save the initial state

      //console.log;
      setServiceId(servicesArray);
      setOriginalSelectedService(servicesArray);
    }

    getProfile();
  }, []);

  const hasAreaFocusChanged = () => {
    // if (selectedArea.length !== originalSelectedArea.length) return true;
    // return selectedArea.includes((id) => !originalSelectedArea.includes(id));
    return true;
  };

  const hasServiceChanged = () => {
    // if (serviceId.length !== originalSelectedService.length)
    return true;
    // return serviceId.includes((id) => !originalSelectedService.includes(id));
  };

  const uploadeImage = async (imageUrl) => {
    try {
      const data = localStorage.getItem("User");
      if (data) {
        let u = JSON.parse(data);
        const apidata = new FormData();

        apidata.append("media", imageUrl);

        // //console.log;
        for (let pair of apidata.entries()) {
          // //console.log; // Debug FormData contents
        }
        let path = Apis.updateProfileApi;

        // //console.log;
        // //console.log;
        // return
        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: "Bearer " + u.token,
          },
        });

        if (response) {
          if (response.data.status === true) {
            // //console.log;
            u.user = response.data.data;

            //// //console.log
            localStorage.setItem("User", JSON.stringify(u));
            // Update Redux store immediately
            setReduxUser(u);
            // //console.log;
            window.dispatchEvent(
              new CustomEvent("UpdateProfile", { detail: { update: true } })
            );
            return response.data.data;
          } else {
            throw new Error("Upload failed: Invalid response status");
          }
        } else {
          throw new Error("Upload failed: No response received");
        }
      } else {
        throw new Error("Upload failed: No user data found");
      }
    } catch (e) {
      // Re-throw the error so it can be caught by the caller
      throw e;
    }
  };

  //function to fetch the profile data
  const getProfile = async () => {
    try {
      await getProfileDetails();
    } catch (error) {
      // console.error("Error occured in api is error", error);
    }
  };

  //function to handle image selection
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setloading5(true);
      const imageUrl = URL.createObjectURL(file); // Generate preview URL

      setSelectedImage(imageUrl); // Set the preview image

      const result = await uploadeImage(file);
      if (result) {
        showSuccess("Profile image uploaded");
      }
    } catch (error) {
      // console.error("Error uploading image:", error);
      setErrorMessage("Failed to upload profile image");
      setShowErrorMessage(true);
    } finally {
      setloading5(false);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      try {
        setloading5(true);
        const imageUrl = URL.createObjectURL(file);
        setSelectedImage(imageUrl);
        const result = await uploadeImage(file);
        if (result) {
          showSuccess("Profile image uploaded");
        }
      } catch (error) {
        // console.error("Error uploading image:", error);
        setErrorMessage("Failed to upload profile image");
        setShowErrorMessage(true);
      } finally {
        setloading5(false);
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const areas = [
    {
      id: 1,
      heading: "Commercial real estate",
      subHeading:
        "Dealing with commercial real estate like offices, retail spaces, and industrial properties",
    },
    {
      id: 2,
      heading: "Residential real estate",
      subHeading: "Buying and selling residential properties",
    },
    {
      id: 3,
      heading: "Investment property",
      subHeading:
        "Helping clients invest in income-generating propertiesd) Selling high-end, luxury homes in exclusive areas",
    },
    {
      id: 4,
      heading: "Land broker",
      subHeading: "Specializing in the sale of undeveloped land",
    },
    {
      id: 5,
      heading: "Sale associate",
      subHeading: "Selling newly built homes for builders and developers",
    },
    {
      id: 6,
      heading: "Relocation consultant",
      subHeading:
        "Assisting people with finding homes and moving when they relocate",
    },
    {
      id: 7,
      heading: "Real estate management",
      subHeading:
        "Managing properties, including leasing and maintenance, for owners",
    },
  ];

  useEffect(() => {
    getAgentDefaultData();
  }, []);

  const getAgentDefaultData = async () => {
    try {
      setServiceLoader(true);
      let data = localStorage.getItem("User");
      if (data) {
        let d = JSON.parse(data);
        let AgentTypeTitle = d.user.userType;
        // //console.log;

        const ApiPath = `${Apis.defaultData}?type=${AgentTypeTitle}`;
        // //console.log;
        const response = await axios.get(ApiPath, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response) {
          //console.log;
          setAgentServices(response.data.data.agentServices);
          setAgentAreasOfFocus(response.data.data.areaOfFocus);
          setAgentIndustries(response.data.data.userIndustry);
        } else {
          alert(response.data.message);
        }
      }
    } catch (error) {
      setServiceLoader(false);
      // console.error("ERror occured in default data api is :----", error);
    } finally {
      setServiceLoader(false);
    }
  };

  const handleNameSave = async () => {
    try {
      setloading(true);
      const data = { name: name };
      await UpdateProfile(data);
      setloading(false);
      setIsNameChanged(false);
    } catch (e) {
      // //console.log;
    }
  };

  const handleFarmSave = async () => {
    try {
      setloading2(true);

      let data = {
        farm: farm,
      };
      await UpdateProfile(data);
      setloading2(false);
      setIsFarmChanged(false);
    } catch (e) {
      // //console.log;
    }
  };

  const handleCompanySave = async () => {
    try {
      setloading8(true);

      let data = {
        company: company,
      };
      await UpdateProfile(data);
      setloading8(false);
      setIsCompanyChanged(false);
    } catch (e) {
      // //console.log;
    }
  };

  const handleCompanyAffiliationSave = async () => {
    try {
      setLoading11(true);

      let data = {
        firmOrCompanyAffiliation: companyAffiliation,
      };
      await UpdateProfile(data);
      setLoading11(false);
      setIsCompanyAffiliationChanged(false);
    } catch (e) {
      // //console.log;
    }
  };

  const handleBrokerAgeSave = async () => {
    try {
      setloading3(true);

      let data = {
        brokerage: brokerAge,
      };
      await UpdateProfile(data);
      setloading3(false);
      setIsBrokerageChanged(false);
    } catch (e) {
      // //console.log;
    }
  };

  const handleTransactionSave = async () => {
    try {
      setloading4(true);
      let data = {
        averageTransactionPerYear: transaction,
      };
      await UpdateProfile(data);
      setloading4(false);

      setIsTransactionChange(false);
    } catch (e) {
      // //console.log;
    }
  };

  const handleInstallationVolumeSave = async () => {
    try {
      setloading7(true);
      let data = {
        projectsPerYear: installationVolume,
      };
      await UpdateProfile(data);
      setloading7(false);
      setIsInstallationVolumeChanged(false);
    } catch (e) {
      // //console.log;
    }
  };

  const handleServiceAreaSave = async () => {
    try {
      setloading6(true);

      let data = {
        areaOfService: serviceArea,
      };
      await UpdateProfile(data);
      setloading6(false);
      setIsServiceAreaChanged(false);
    } catch (e) {
      // //console.log;
    }
  };
  const handleProjectSizeSave = async () => {
    try {
      setloading9(true);
      let data = {
        projectSizeKw: projectSize,
      };
      await UpdateProfile(data);
      setloading9(false);
      setIsprojectSizeChanged(false);
    } catch (e) {
      // //console.log;
    }
  };

  const handleClientsPerMonthSave = async () => {
    try {
      setLoading12(true);
      let data = {
        averageMonthlyClients: clientsPerMonth,
      };
      await UpdateProfile(data);
      setLoading12(false);
      setIsprojectSizeChanged(false);
    } catch (e) {
      // //console.log;
    }
  };

  // Helper function to show success message
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
  };

  // Email validation function
  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Check if email contains consecutive dots, which are invalid
    if (/\.\./.test(email)) {
      return false;
    }

    // Check the general pattern for a valid email
    return emailPattern.test(email);
  };

  // Function to check if email exists in database
  const checkEmail = async (value) => {
    try {
      // Don't check if email hasn't changed
      if (value === originalEmail) {
        setEmailCheckResponse(null);
        setValidEmail("");
        return;
      }

      setValidEmail("");
      setEmailLoader(true);

      const ApiPath = Apis.CheckEmail;

      const ApiData = {
        email: value,
      };

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response) {
        if (response.data.status === true) {
          // Email is available
          setEmailCheckResponse(response.data);
        } else {
          // Email is taken
          setEmailCheckResponse(response.data);
        }
      }
    } catch (error) {
      console.error("Error checking email:", error);
    } finally {
      setEmailLoader(false);
    }
  };

  // Function to handle email save
  const handleEmailSave = async () => {
    try {
      // Validate email format
      if (!validateEmail(email)) {
        setErrorMessage("Please enter a valid email address");
        setShowErrorMessage(true);
        return;
      }

      // Check if email is taken (only if it's different from original)
      if (email !== originalEmail) {
        // Wait for email check to complete if it's in progress
        if (emailLoader) {
          setErrorMessage("Please wait while we check the email availability");
          setShowErrorMessage(true);
          return;
        }

        // If email check hasn't been done or email is taken
        if (emailCheckResponse === null) {
          setErrorMessage("Please wait for email validation to complete");
          setShowErrorMessage(true);
          return;
        }

        if (emailCheckResponse.status === false) {
          setErrorMessage("Email is already taken");
          setShowErrorMessage(true);
          return;
        }
      }

      setLoading13(true);
      const data = { email: email };
      await UpdateProfile(data);
      setLoading13(false);
      setIsEmailChanged(false);
      setOriginalEmail(email); // Update original email after successful save
      setEmailCheckResponse(null);
      setValidEmail("");
      showSuccess("Email updated successfully");
    } catch (e) {
      setLoading13(false);
      setErrorMessage("Failed to update email. Please try again.");
      setShowErrorMessage(true);
      console.error("Error updating email:", e);
    }
  };

  const handleserviceId = (id) => {
    // //console.log;
    // //console.log;
    let newIDs = [];
    if (serviceId.includes(id)) {
      // Unselect the item if it's already selected
      newIDs = serviceId.filter((prevId) => prevId !== id);
    } else {
      // Select the item if it's not already selected
      newIDs = [...serviceId, id];
    }

    setServiceId(newIDs);
    // //console.log;
  };

  const handleAreaSelect = (id) => {
    // //console.log;
    // //console.log;
    let newIDs = [];
    if (selectedArea.includes(id)) {
      // Unselect the item if it's already selected
      newIDs = selectedArea.filter((prevId) => prevId !== id);
    } else {
      // Select the item if it's not already selected
      newIDs = [...selectedArea, id];
    }
    setSelectedArea(newIDs);
    // //console.log;
    return;
    setSelectedArea((prevIds) => {
      if (prevIds.includes(id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== id);
      } else {
        // Select the item if it's not already selected
        return [...prevIds, id];
      }
    });
  };

  const handleSelectAgentIndustry = (id) => {
    // //console.log;
    // //console.log;
    let newIDs = [];
    if (selectedIndustries.includes(id)) {
      // Unselect the item if it's already selected
      newIDs = selectedIndustries.filter((prevId) => prevId !== id);
    } else {
      // Select the item if it's not already selected
      newIDs = [...selectedIndustries, id];
    }
    setSelectedIndustries(newIDs);
    // //console.log;
    return;
  };

  const handleSelectClientType = async (item) => {
    // //console.log;
    setClientType(item.value);

    let data = {
      primaryClientType: item.value,
    };
    await UpdateProfile(data);
  };
  const handleSelectconsoltation = async (item) => {
    // //console.log;
    setconsaltation(item.title);

    let data = {
      collectionStrategies: item.value,
    };
    await UpdateProfile(data);
  };

  const handleSelectClientType2 = async (item) => {
    // //console.log;
    setClientType(item.title);

    let data = {
      clientType: item.title,
    };
    await UpdateProfile(data);
  };

  const handleSelectCollectionStretigy = async (item) => {
    // //console.log;
    setcollectionStratigy(item.value);

    let data = {
      collectionStratigy: item.value,
    };
    await UpdateProfile(data);
  };

  const handleAreaChange = async () => {
    try {
      setAreaLoading(true);
      let data = {
        areaOfFocus: selectedArea, //[selectedArea.join()]
      };
      console.log("Data to update area is", data);

      // return
      await UpdateProfile(data);
      setOriginalSelectedArea([...selectedArea]);
      setAreaLoading(false);
    } catch (e) {
      // //console.log;
    }
  };
  const handleIndustryChange = async () => {
    try {
      setAreaLoading(true);
      let data = {
        userIndustry: selectedIndustries, //[selectedArea.join()]
      };
      console.log("Data to update area is", data);

      // return
      await UpdateProfile(data);
      setOriginalSelectedIndustries([...selectedIndustries]);
      setAreaLoading(false);
    } catch (e) {
      // //console.log;
    }
  };

  const handleServiceChange = async () => {
    try {
      setServiceLoader(true);
      let data = {
        agentService: serviceId, //[serviceId.join()]
      };
      console.log("Data to update service is", data);

      // return
      await UpdateProfile(data);
      setOriginalSelectedService([...serviceId]);
      setServiceLoader(false);
    } catch (e) {
      // //console.log;
    }
  };

  const handleWebsiteChange = async () => {
    try {
      setLoading10(true);
      let data = {
        website: websiteUrl,
      };
      // //console.log;

      // return
      await UpdateProfile(data);
      setIsWebsiteUrlChanged(false);
      setLoading10(false);
    } catch (e) {
      // //console.log;
    }
  };

  const choseClientType = () => {
    if (userType === UserTypes.LoanOfficerAgent) {
      return primaryClientTypes4;
    } else {
      return primaryClientTypes2;
    }
  };

  return (
    <div
      className="w-full flex flex-col items-start px-8 py-2"
      style={{
        paddingBottom: "50px",
        height: "100%",
        overflow: "auto",
        scrollbarWidth: "none",
      }}
    >
      <div className="w-full flex flex-row items-center justify-between">
        <div>
          <div style={{ fontSize: 22, fontWeight: "700", color: "#000" }}>
            Basic Information
          </div>

          <div style={{ fontSize: 12, fontWeight: "500", color: "#00000090" }}>
            {"Account > Basic Information"}
          </div>
        </div>
        <div>
          <button
            className="text-red text-start mt-4 bg-[#FF4E4E40] px-3 py-1 rounded-3xl"
            style={{ fontWeight: "600", fontSize: 17 }}
            onClick={() => {
              localStorage.clear();
              // localStorage.removeItem("User");
              // localStorage.removeItem("localAgentDetails");
              if (typeof document !== "undefined") {
                document.cookie =
                  "User=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              }
              router.push("/");
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      <button
        className="mt-8"
        onClick={() => {
          if (typeof document !== "undefined") {
            document.getElementById("fileInput").click();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {loading5 ? (
          <CircularProgress size={20} />
        ) : (
          <div
            className="flex flex-row items-end"
            style={
              {
                // border: dragging ? "2px dashed #0070f3" : "",
              }
            }
          >
            {selectedImage ? (
              <div style={{ marginTop: "20px" }}>
                <Image
                  src={selectedImage}
                  height={74}
                  width={74}
                  // layout="intrinsic"
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                  alt="profileImage"
                />
              </div>
            ) : (
              <Image
                src={"/agentXOrb.gif"}
                height={74}
                width={74}
                alt="profileImage"
              />
            )}

            <Image
              src={"/otherAssets/cameraBtn.png"}
              style={{ marginLeft: -25 }}
              height={36}
              width={36}
              alt="profileImage"
            />
          </div>
        )}
      </button>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        id="fileInput"
        style={{ display: "none" }}
        onChange={handleImageChange}
      />

      <div
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#000",
          marginTop: "4vh",
        }}
      >
        Full Name
      </div>

      <div
        className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5"
        style={{
          border: `1px solid ${focusedName ? "#8a2be2" : "#00000010"}`,
          transition: "border-color 0.3s ease",
        }}
      >
        <input
          className="w-11/12 outline-none focus:ring-0"
          onFocus={() => setFocusedName(true)}
          onBlur={() => setFocusedName(false)}
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setIsNameChanged(true);
          }}
          type="text"
          placeholder="Name"
          style={{ border: "0px solid #7902DF", outline: "none" }}
        />
        {isNameChanged &&
          (loading ? (
            <CircularProgress size={20} />
          ) : (
            <button
              onClick={async () => {
                handleNameSave();
              }}
              style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}
            >
              Save
            </button>
          ))}
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#000",
          marginTop: "4vh",
        }}
      >
        Email address
      </div>
      <div
        className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5 outline-none focus:ring-0"
        style={{
          border: `1px solid ${focusedEmail ? "#8a2be2" : "#00000010"}`,
          transition: "border-color 0.3s ease",
        }}
      >
        <input
          ref={emailRef}
          className="w-11/12 outline-none focus:ring-0"
          onFocus={() => setFocusedEmail(true)}
          onBlur={() => setFocusedEmail(false)}
          value={email}
          onChange={(event) => {
            const value = event.target.value;
            setEmail(value);
            setIsEmailChanged(true);
            setEmailCheckResponse(null);

            if (!value) {
              setValidEmail("");
              return;
            }

            if (!validateEmail(value)) {
              setValidEmail("Invalid");
            } else {
              setValidEmail("");
              // Clear previous timer
              if (emailTimerRef.current) {
                clearTimeout(emailTimerRef.current);
              }

              // Set a new timeout to check email after user stops typing
              emailTimerRef.current = setTimeout(() => {
                checkEmail(value);
              }, 300);
            }
          }}
          type="email"
          placeholder="Email"
          style={{ border: "0px solid #000000", outline: "none" }}
        />
        {isEmailChanged ? (
          emailLoader ? (
            <CircularProgress size={20} />
          ) : validEmail === "Invalid" ? (
            <div style={{ fontSize: 12, color: "red" }}>Invalid</div>
          ) : emailCheckResponse?.status === false ? (
            <div style={{ fontSize: 12, color: "red" }}>Taken</div>
          ) : (
            <button
              onClick={async () => {
                handleEmailSave();
              }}
              style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}
            >
              Save
            </button>
          )
        ) : (
          <button
            onClick={() => {
              emailRef.current?.focus();
            }}
            className="outline-none"
          >
            <Image
              src={'/svgIcons/editIcon.svg'}
              width={24}
              height={24}
              alt="edit"
            />
          </button>
        )}
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#000",
          marginTop: "4vh",
        }}
      >
        Phone number
      </div>
      <div
        className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5 outline-none focus:ring-0"
        style={{
          border: `1px solid #00000010`,
          transition: "border-color 0.3s ease",
        }}
      >
        <input
          readOnly
          className="w-11/12 outline-none focus:ring-0"
          // onFocus={() => setFocusedEmail(true)}
          // onBlur={() => setFocusedEmail(false)}
          value={phone}
          onChange={(event) => {
            // setEmail(event.target.value)
          }}
          type="text"
          placeholder="Email"
          style={{ border: "0px solid #000000", outline: "none" }}
        />
      </div>

      {userRole && userRole != "Invitee" && (
        <>
          {(userType && userType === UserTypes.RealEstateAgent) ||
            (userType && userType === UserTypes.InsuranceAgent) ||
            (userType && userType === UserTypes.RealEstateAgent) ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#000",
                  marginTop: "4vh",
                }}
              >
                Farm
              </div>

              <div
                className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5"
                style={{
                  border: `1px solid ${focusedFarm ? "#8a2be2" : "#00000010"}`,
                  transition: "border-color 0.3s ease",
                }}
              >
                <input
                  className="w-11/12 outline-none focus:ring-0"
                  onFocus={() => setFocusedFarm(true)}
                  onBlur={() => setFocusedFarm(false)}
                  value={farm}
                  onChange={(event) => {
                    setFarm(event.target.value);
                    setIsFarmChanged(true);
                  }}
                  type="text"
                  placeholder="Farm"
                  style={{ border: "0px solid #000000", outline: "none" }}
                />
                {isFarmChanged &&
                  (loading2 ? (
                    <CircularProgress size={20} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleFarmSave();
                      }}
                      style={{
                        color: " #8a2be2",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Save
                    </button>
                  ))}
              </div>
            </>
          ) : (userType && userType === UserTypes.SolarRep) ||
            (userType && userType === UserTypes.SalesDevRep) ||
            (userType && userType === UserTypes.MarketerAgent) ||
            (userType && userType === UserTypes.TaxAgent) ||
            (userType && userType === UserTypes.RecruiterAgent) ||
            (userType && userType === UserTypes.DebtCollectorAgent) ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#000",
                  marginTop: "4vh",
                }}
              >
                Area of service
              </div>

              <div
                className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5"
                style={{
                  border: `1px solid ${focusedServiceArea ? "#8a2be2" : "#00000010"
                    }`,
                  transition: "border-color 0.3s ease",
                }}
              >
                <input
                  className="w-11/12 outline-none focus:ring-0"
                  onFocus={() => setFocusedServiceArea(true)}
                  onBlur={() => setFocusedServiceArea(false)}
                  value={serviceArea}
                  onChange={(event) => {
                    setServiceArea(event.target.value);
                    setIsServiceAreaChanged(true);
                  }}
                  type="text"
                  placeholder="Farm"
                  style={{ border: "0px solid #000000", outline: "none" }}
                />
                {isServiceAreaChanged &&
                  (loading6 ? (
                    <CircularProgress size={20} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleServiceAreaSave();
                      }}
                      style={{
                        color: " #8a2be2",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Save
                    </button>
                  ))}
              </div>
            </>
          ) : (
            ""
          )}

          {(userType && userType === UserTypes.RealEstateAgent) ||
            (userType && userType === UserTypes.InsuranceAgent) ||
            (userType && userType === UserTypes.RealEstateAgent) ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#000",
                  marginTop: "4vh",
                }}
              >
                Brokerage
              </div>

              <div
                className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5 "
                style={{
                  border: `1px solid ${focusedBrokerage ? "#8a2be2" : "#00000010"
                    }`,
                  transition: "border-color 0.3s ease",
                }}
              >
                <input
                  className="w-11/12 outline-none focus:ring-0"
                  onFocus={() => setFocusedBrokerage(true)}
                  onBlur={() => setFocusedBrokerage(false)}
                  value={brokerAge}
                  onChange={(event) => {
                    setBrokerAge(event.target.value);
                    setIsBrokerageChanged(true);
                  }}
                  type="text"
                  placeholder="Brokerage"
                  style={{ border: "0px solid #000000", outline: "none" }}
                />
                {isBrokerageChanged &&
                  (loading3 ? (
                    <CircularProgress size={20} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleBrokerAgeSave();
                      }}
                      style={{
                        color: " #8a2be2",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Save
                    </button>
                  ))}
              </div>
            </>
          ) : (userType && userType === UserTypes.SolarRep) ||
            (userType && userType === UserTypes.SalesDevRep) ||
            (userType && userType === UserTypes.MarketerAgent) ||
            (userType && userType === UserTypes.DebtCollectorAgent) ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#000",
                  marginTop: "4vh",
                }}
              >
                Company
              </div>

              <div
                className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5 "
                style={{
                  border: `1px solid ${focusedCompany ? "#8a2be2" : "#00000010"
                    }`,
                  transition: "border-color 0.3s ease",
                }}
              >
                <input
                  className="w-11/12 outline-none focus:ring-0"
                  onFocus={() => setFocusedCompany(true)}
                  onBlur={() => setFocusedCompany(false)}
                  value={company}
                  onChange={(event) => {
                    setCompany(event.target.value);
                    setIsCompanyChanged(true);
                  }}
                  type="text"
                  placeholder="Company"
                  style={{ border: "0px solid #000000", outline: "none" }}
                />
                {isCompanyChanged &&
                  (loading8 ? (
                    <CircularProgress size={20} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleCompanySave();
                      }}
                      style={{
                        color: " #8a2be2",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Save
                    </button>
                  ))}
              </div>
            </>
          ) : userType && userType === UserTypes.WebsiteAgent ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#000",
                  marginTop: "4vh",
                }}
              >
                Website URL
              </div>

              <div
                className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5 "
                style={{
                  border: `1px solid ${focusedWebsite ? "#8a2be2" : "#00000010"
                    }`,
                  transition: "border-color 0.3s ease",
                }}
              >
                <input
                  className="w-11/12 outline-none focus:ring-0"
                  onFocus={() => setFocusedWebSite(true)}
                  onBlur={() => setFocusedWebSite(false)}
                  value={websiteUrl}
                  onChange={(event) => {
                    setWebsiteUrl(event.target.value);
                    setIsWebsiteUrlChanged(true);
                  }}
                  type="text"
                  placeholder="Brokerage"
                  style={{ border: "0px solid #000000", outline: "none" }}
                />
                {isWebsiteUrlChanged &&
                  (loading10 ? (
                    <CircularProgress size={20} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleWebsiteChange();
                      }}
                      style={{
                        color: " #8a2be2",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Save
                    </button>
                  ))}
              </div>
            </>
          ) : (userType && userType === UserTypes.MedSpaAgent) ||
            (userType && userType === UserTypes.LawAgent) ||
            (userType && userType === UserTypes.LoanOfficerAgent) ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#000",
                  marginTop: "4vh",
                }}
              >
                Company Affiliation
              </div>

              <div
                className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5 "
                style={{
                  border: `1px solid ${focusedCompany ? "#8a2be2" : "#00000010"
                    }`,
                  transition: "border-color 0.3s ease",
                }}
              >
                <input
                  className="w-11/12 outline-none focus:ring-0"
                  onFocus={() => setFocusedCompanyAffiliation(true)}
                  onBlur={() => setFocusedCompanyAffiliation(false)}
                  value={companyAffiliation}
                  onChange={(event) => {
                    setCompanyAffiliation(event.target.value);
                    setIsCompanyAffiliationChanged(true);
                  }}
                  type="text"
                  placeholder="Company"
                  style={{ border: "0px solid #000000", outline: "none" }}
                />
                {isCompanyAffiliationChanged &&
                  (loading11 ? (
                    <CircularProgress size={20} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleCompanyAffiliationSave();
                      }}
                      style={{
                        color: " #8a2be2",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Save
                    </button>
                  ))}
              </div>
            </>
          ) : (
            ""
          )}

          {userType && userType === UserTypes.RealEstateAgent ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#000",
                  marginTop: "4vh",
                }}
              >
                How many homes did you sell last year
              </div>

              <div
                className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5"
                style={{
                  border: `1px solid ${focusedTransaction ? "#8a2be2" : "#00000010"
                    }`,
                  transition: "border-color 0.3s ease",
                }}
              >
                <input
                  className="w-11/12 outline-none focus:ring-0"
                  onFocus={() => setFocusedTransaction(true)}
                  onBlur={() => setFocusedTransaction(false)}
                  value={transaction}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={(e) => {
                    // Only keep digits in state
                    const onlyNums = e.target.value.replace(/\D/g, "");
                    setTransaction(onlyNums);
                    setIsTransactionChange(true);
                  }}
                  placeholder="Type here"
                  style={{ border: "0px solid #000000", outline: "none" }}
                />
                {isTransactionChanged &&
                  (loading4 ? (
                    <CircularProgress size={20} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleTransactionSave();
                      }}
                      style={{
                        color: " #8a2be2",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Save
                    </button>
                  ))}
              </div>
            </>
          ) : userType && userType === UserTypes.SolarRep ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#000",
                  marginTop: "4vh",
                }}
              >
                Installation Volume per Year
              </div>

              <div
                className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5"
                style={{
                  border: `1px solid ${focusedInstallationVolume ? "#8a2be2" : "#00000010"
                    }`,
                  transition: "border-color 0.3s ease",
                }}
              >
                <input
                  // type="number"
                  className="w-11/12 outline-none focus:ring-0"
                  onFocus={() => setFocusedInstallationVolume(true)}
                  onBlur={() => setFocusedInstallationVolume(false)}
                  value={installationVolume}
                  onChange={(event) => {
                    setInstallationVolume(event.target.value);
                    setIsInstallationVolumeChanged(true);
                  }}
                  placeholder="Value"
                  style={{ border: "0px solid #000000", outline: "none" }}
                />
                {isInstallationVolumechanged &&
                  (loading7 ? (
                    <CircularProgress size={20} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleInstallationVolumeSave();
                      }}
                      style={{
                        color: " #8a2be2",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Save
                    </button>
                  ))}
              </div>
            </>
          ) : (
            ""
          )}

          {(userType && userType === UserTypes.SolarRep) ||
            (userType && userType === UserTypes.DebtCollectorAgent) ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#000",
                  marginTop: "4vh",
                }}
              >
                {userType === UserTypes.DebtCollectorAgent
                  ? " Balance Size of Debts "
                  : "Average Project Size (kw)"}
              </div>

              <div
                className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5"
                style={{
                  border: `1px solid ${focusedProjectSize ? "#8a2be2" : "#00000010"
                    }`,
                  transition: "border-color 0.3s ease",
                }}
              >
                <input
                  type="number"
                  className="w-11/12 outline-none focus:ring-0"
                  onFocus={() => setFocusedProjectSize(true)}
                  onBlur={() => setFocusedProjectSize(false)}
                  value={projectSize}
                  onChange={(event) => {
                    setProjectSize(event.target.value);
                    setIsprojectSizeChanged(true);
                  }}
                  placeholder="Value"
                  style={{ border: "0px solid #000000", outline: "none" }}
                />
                {isProjectSizeChanged &&
                  (loading9 ? (
                    <CircularProgress size={20} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleProjectSizeSave();
                      }}
                      style={{
                        color: " #8a2be2",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Save
                    </button>
                  ))}
              </div>
            </>
          ) : userType && userType === UserTypes.MedSpaAgent ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#000",
                  marginTop: "4vh",
                }}
              >
                Clients per month
              </div>

              <div
                className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5"
                style={{
                  border: `1px solid ${focusedClientsPerMonth ? "#8a2be2" : "#00000010"
                    }`,
                  transition: "border-color 0.3s ease",
                }}
              >
                <input
                  type="number"
                  className="w-11/12 outline-none focus:ring-0"
                  onFocus={() => setFocusedClientsPerMonth(true)}
                  onBlur={() => setFocusedClientsPerMonth(false)}
                  value={clientsPerMonth}
                  onChange={(event) => {
                    setClientsPerMonth(event.target.value);
                    setIsClientsPerMonthChanged(true);
                  }}
                  placeholder="Value"
                  style={{ border: "0px solid #000000", outline: "none" }}
                />
                {isClientsPerMonthChanged &&
                  (loading12 ? (
                    <CircularProgress size={20} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleClientsPerMonthSave();
                      }}
                      style={{
                        color: " #8a2be2",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Save
                    </button>
                  ))}
              </div>
            </>
          ) : userType && userType === UserTypes.LawAgent ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#000",
                  marginTop: "4vh",
                }}
              >
                Cases per month
              </div>

              <div
                className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5"
                style={{
                  border: `1px solid ${focusedClientsPerMonth ? "#8a2be2" : "#00000010"
                    }`,
                  transition: "border-color 0.3s ease",
                }}
              >
                <input
                  type="number"
                  className="w-11/12 outline-none focus:ring-0"
                  onFocus={() => setFocusedCasesPerMonth(true)}
                  onBlur={() => setFocusedCasesPerMonth(false)}
                  value={CasesPerMonth}
                  onChange={(event) => {
                    setCasessPerMonth(event.target.value);
                    iscasesPerMonthChanged(true);
                  }}
                  placeholder="Value"
                  style={{ border: "0px solid #000000", outline: "none" }}
                />
                {iscasesPerMonthChanged &&
                  (loading12 ? (
                    <CircularProgress size={20} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleClientsPerMonthSave();
                      }}
                      style={{
                        color: " #8a2be2",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Save
                    </button>
                  ))}
              </div>
            </>
          ) : (
            ""
          )}
          {userType && userType === UserTypes.SolarRep ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#000",
                  marginTop: "4vh",
                }}
              >
                Primary Client Type
              </div>

              <div
                className="flex flex-row items-center gap-4"
                style={{ marginTop: "8px" }}
              >
                {primaryClientTypes.map((item, index) => {
                  return (
                    <div key={index} className="w-full">
                      <button
                        onClick={() => {
                          handleSelectClientType(item);
                        }}
                        className="border border-[#00000010] rounded px-4 h-[70px] outline-none focus:outline-none focus:ring-0 w-full"
                        style={{
                          fontSize: 15,
                          fontWeight: "500",
                          borderRadius: "7px",
                          borderRadius: "30px",
                          paddingInline: index === 2 && "40px",
                          border:
                            clientType === item.value
                              ? "2px solid #7902DF"
                              : "",
                          backgroundColor:
                            clientType === item.value ? "#402FFF20" : "",
                        }}
                      >
                        {item.title}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          ) : userType && userType === UserTypes.DebtCollectorAgent ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#000",
                  marginTop: "4vh",
                }}
              >
                Typical Collection Strategy
              </div>

              <div
                className="flex flex-row items-center gap-4"
                style={{ marginTop: "8px" }}
              >
                {primaryClientTypes3.map((item, index) => {
                  return (
                    <div key={index} className="w-full">
                      <button
                        onClick={() => {
                          handleSelectCollectionStretigy(item);
                        }}
                        className="border border-[#00000010] rounded px-4 h-[70px] outline-none focus:outline-none focus:ring-0 w-full"
                        style={{
                          fontSize: 15,
                          fontWeight: "500",
                          borderRadius: "7px",
                          borderRadius: "30px",
                          paddingInline: index === 2 && "40px",
                          border:
                            collectionStratigy === item.value
                              ? "2px solid #7902DF"
                              : "",
                          backgroundColor:
                            collectionStratigy === item.value
                              ? "#402FFF20"
                              : "",
                        }}
                      >
                        {item.title}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            ""
          )}
          {(userType && userType === UserTypes.LawAgent) ||
            (userType && userType === UserTypes.LoanOfficerAgent) ? (
            <>
              <div style={styles.headingStyle} className="mt-6">
                Client Type
              </div>

              <div
                className="flex w-full flex-wrap flex-row items-center gap-2"
                style={{ marginTop: "8px", flexWrap: "wrap" }}
              >
                {choseClientType().map((item, index) => {
                  return (
                    <div key={index} className="w-full">
                      <button
                        onClick={() => {
                          handleSelectClientType2(item);
                        }}
                        className="border border-[#00000010] rounded px-4 py-4 outline-none focus:outline-none focus:ring-0"
                        style={{
                          ...styles.inputStyle,
                          borderRadius: "30px",
                          paddingInline: index === 2 && "40px",
                          border:
                            clientType2 === item.title
                              ? "2px solid #7902DF"
                              : "",
                          backgroundColor:
                            clientType2 === item.title ? "#402FFF20" : "",
                        }}
                      >
                        {item.title}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            ""
          )}
          {userType && userType === UserTypes.LawAgent ? (
            <>
              <div style={styles.headingStyle} className="mt-6">
                Consultation Format
              </div>

              <div
                className="flex w-full flex-wrap flex-row items-center gap-2"
                style={{ marginTop: "8px" }}
              >
                {ConsultationFormat.map((item, index) => {
                  return (
                    <div key={index} className="w-full">
                      <button
                        onClick={() => {
                          handleSelectconsoltation(item);
                        }}
                        className="border border-[#00000010] rounded px-4 py-4 outline-none focus:outline-none focus:ring-0"
                        style={{
                          ...styles.inputStyle,
                          borderRadius: "30px",
                          paddingInline: index === 2 && "40px",
                          border:
                            consoltation === item.title
                              ? "2px solid #7902DF"
                              : "",
                          backgroundColor:
                            consoltation === item.title ? "#402FFF20" : "",
                        }}
                      >
                        {item.title}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            ""
          )}
        </>
      )}

      {userRole && userRole != "Invitee" && (
        <>
          <div className="w-full flex flex-row items-center justify-between">
            <div
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#000",
                marginTop: "4vh",
                marginBottom: "2vh",
              }}
            >
              What would you like to assign to your AI
            </div>
            {serviceId.length > 0 &&
              hasServiceChanged() &&
              (srviceLoader ? (
                <CircularProgress size={20} />
              ) : (
                <button
                  onClick={async () => {
                    handleServiceChange();
                  }}
                  style={{
                    color: " #8a2be2",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  Save
                </button>
              ))}
          </div>

          <div className="w-9/12 flex flex-row flex-wrap gap-2">
            {agentServices.map((item, index) => {
              console
                .log
                // `${item.id} included in array `,
                // serviceId.includes(item.id)
                ();
              return (
                <div
                  key={index}
                  className="w-5/12 p-4 flex flex-col gap-2 items-start rounded-2xl"
                  style={{
                    borderWidth: 2,
                    borderColor: serviceId.includes(item.id)
                      ? "#7902DF"
                      : "#00000008",
                    backgroundColor: serviceId.includes(item.id)
                      ? "#7902DF05"
                      : "transparent",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    handleserviceId(item.id);
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: "700" }}>
                    {item.title}
                  </div>

                  <div style={{ fontSize: 14, fontWeight: "500" }}>
                    {item.description}
                  </div>
                  <Image
                    src={
                      serviceId.includes(item.id)
                        ? "/otherAssets/selectedTickBtn.png"
                        : "/otherAssets/unselectedTickBtn.png"
                    }
                    height={24}
                    width={24}
                    alt="icon"
                    style={{ alignSelf: "flex-end" }}
                  />
                </div>
              );
            })}
          </div>

          <div className="w-full flex flex-row items-center justify-between">
            <div
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#000",
                marginTop: "4vh",
                marginBottom: "2vh",
              }}
            >
              {agentAreasOfFocus.length > 0
                ? "What area of real estate do you focus on?"
                : "What industries do you specialize in?"}
            </div>
            {selectedArea.length > 0 &&
              hasAreaFocusChanged() &&
              (areaLoading ? (
                <CircularProgress size={20} />
              ) : (
                <button
                  onClick={async () => {
                    //console.log;
                    if (userType == UserTypes.RecruiterAgent) {
                      handleIndustryChange();
                    } else {
                      handleAreaChange();
                    }
                  }}
                  style={{
                    color: " #8a2be2",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  Save
                </button>
              ))}
          </div>

          {agentAreasOfFocus.length > 0 && (
            <div className="w-9/12 flex flex-row flex-wrap gap-2 ">
              {agentAreasOfFocus.map((item, index) => (
                <div
                  key={index}
                  className="w-5/12 p-4 flex flex-col justify-betweeen items-start rounded-2xl"
                  style={{
                    borderWidth: 2,
                    borderColor: selectedArea.includes(item.id)
                      ? "#7902DF"
                      : "#00000008",
                    backgroundColor: selectedArea.includes(item.id)
                      ? "#7902DF05"
                      : "transparent",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    handleAreaSelect(item.id);
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: "700" }}>
                    {item.title}
                  </div>

                  <div style={{ fontSize: 14, fontWeight: "500" }}>
                    {item.description}
                  </div>
                  <Image
                    src={
                      selectedArea.includes(item.id)
                        ? "/otherAssets/selectedTickBtn.png"
                        : "/otherAssets/unselectedTickBtn.png"
                    }
                    height={24}
                    width={24}
                    alt="icon"
                    style={{ alignSelf: "flex-end" }}
                  />
                </div>
              ))}
            </div>
          )}
          {agentIndustries.length > 0 && (
            <div className="w-9/12 flex flex-row flex-wrap gap-2 ">
              {agentIndustries.map((item, index) => (
                <div
                  key={index}
                  className="w-5/12 p-4 flex flex-col justify-betweeen items-start rounded-2xl"
                  style={{
                    borderWidth: 2,
                    borderColor: selectedIndustries.includes(item.id)
                      ? "#7902DF"
                      : "#00000008",
                    backgroundColor: selectedIndustries.includes(item.id)
                      ? "#7902DF05"
                      : "transparent",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    handleSelectAgentIndustry(item.id);
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: "700" }}>
                    {item.title}
                  </div>

                  <div style={{ fontSize: 14, fontWeight: "500" }}>
                    {item.description}
                  </div>
                  <Image
                    src={
                      selectedIndustries.includes(item.id)
                        ? "/otherAssets/selectedTickBtn.png"
                        : "/otherAssets/unselectedTickBtn.png"
                    }
                    height={24}
                    width={24}
                    alt="icon"
                    style={{ alignSelf: "flex-end" }}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Success Message */}
      <AgentSelectSnackMessage
        isVisible={showSuccessMessage}
        hide={() => setShowSuccessMessage(false)}
        message={successMessage}
        type={SnackbarTypes.Success}
      />

      {/* Error Message */}
      <AgentSelectSnackMessage
        isVisible={showErrorMessage}
        hide={() => setShowErrorMessage(false)}
        message={errorMessage}
        type={SnackbarTypes.Error}
      />
    </div>
  );
}

export default SubAccountBasicInfo;

const styles = {
  headingStyle: {
    fontSize: 16,
    fontWeight: "600",
  },
};
