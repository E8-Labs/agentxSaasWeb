"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { TextField, Button, Box, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import getProfileDetails from "@/components/apis/GetProfile";
import { UpdateProfile } from "@/components/apis/UpdateProfile";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import { UserTypes } from "@/constants/UserTypes";

function AgencyBasicInfo() {
  const router = useRouter();
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

  const [srviceLoader, setServiceLoader] = useState(false);
  const [areaLoading, setAreaLoading] = useState(false);

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
            // //console.log;
            window.dispatchEvent(
              new CustomEvent("UpdateProfile", { detail: { update: true } })
            );
            return response.data.data;
          }
        }
      }
    } catch (e) {
      // //console.log;
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

      uploadeImage(file);
    } catch (error) {
      // console.error("Error uploading image:", error);
    } finally {
      setloading5(false);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
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
      //console.log;

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
      //console.log;

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
      //console.log;

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
          readOnly
          className="w-11/12 outline-none focus:ring-0"
          // onFocus={() => setFocusedEmail(true)}
          // onBlur={() => setFocusedEmail(false)}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
          type="text"
          placeholder="Email"
          style={{ border: "0px solid #000000", outline: "none" }}
        />
        {/* {
 email.length > 0 && (
 <button style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}>Save</button>
 )
 } */}
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
          border: `1px solid ${focusedEmail ? "#8a2be2" : "#00000010"}`,
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
     
    </div>
  );
}

export default AgencyBasicInfo;

const styles = {
  headingStyle: {
    fontSize: 16,
    fontWeight: "600",
  },
};
