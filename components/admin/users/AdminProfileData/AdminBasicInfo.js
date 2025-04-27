"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { TextField, Button, Box, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import AdminGetProfileDetails from "../../AdminGetProfileDetails";
import { UpdateProfile } from "@/components/apis/UpdateProfile";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import { UserTypes } from "@/constants/UserTypes";

function AdminBasicInfo({ selectedUser }) {
  const router = useRouter();
  const [focusedName, setFocusedName] = useState(false);
  const [focusedFarm, setFocusedFarm] = useState(false);
  const [focusedBrokerage, setFocusedBrokerage] = useState(false);
  const [focusedCompany, setFocusedCompany] = useState(false);
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
    // //console.log;
    getProfile();
  }, [selectedUser]);

  //function to fetch the profile data
  const getProfile = async () => {
    try {
      let LocalData = await AdminGetProfileDetails(selectedUser.id);

      if (LocalData) {
        const userData = LocalData;
        await getAgentDefaultData(userData);
        console.log("image is ",LocalData)

        setUserRole(userData?.userRole);
        setUserType(userData?.userType);
        setUserDetails(userData.user);
        setName(userData?.name);
        setSelectedImage(LocalData?.thumb_profile_image);
        setEmail(userData?.email);
        setFarm(userData?.farm);
        setTransaction(userData?.averageTransactionPerYear);
        setBrokerAge(userData?.brokerage);
        setPhone(userData?.phone);

        setServiceArea(userData?.areaOfService);
        setClientType(userData?.primaryClientType);
        setClientType2(userData?.clientType);

        setCompany(userData?.company);
        // setProjectSize(userData?.projectSizeKw);
        setWebsiteUrl(userData?.website);
        setCompanyAffiliation(userData?.firmOrCompanyAffiliation);
        setClientsPerMonth(userData?.averageMonthlyClients);
        setCasessPerMonth(userData?.caseVolume);

        setInstallationVolume(userData?.projectsPerYear || "");
        setProjectSize(userData?.projectSizeKw || "");

        // //console.log;
        // //console.log;

        // Initialize arrays to hold services and areas of focus
        const industriesArray = [];
        const servicesArray = [];
        const focusAreasArray = [];

        // Pre-populate selected services and areas based on the user profile
        userData?.services?.forEach((item) => {
          servicesArray.push(item.id); // Add the full object or only IDs as needed
        });
        userData?.userIndustry?.forEach((item) => {
          industriesArray.push(item.id); // Add the full object or only IDs as needed
        });

        userData?.focusAreas?.forEach((item) => {
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
      } else {
        //console.log;
      }
    } catch (error) {
      console.error("Error occured in api is error", error);
    }
  };

  const getAgentDefaultData = async (userData) => {
    try {
      setServiceLoader(true);
      let data = localStorage.getItem("User");
      if (data) {
        let d = JSON.parse(data);
        let AgentTypeTitle = userData.userType;
        //console.log;

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

  const choseClientType = () => {
    if (userType === UserTypes.LoanOfficerAgent) {
      return primaryClientTypes4;
    } else {
      return primaryClientTypes2;
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

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      
      const imageUrl = URL.createObjectURL(file); // Generate preview URL

      setSelectedImage(imageUrl); // Set the preview image

      await uploadeImage(file);
    } catch (error) {
      // console.error("Error uploading image:", error);
    } finally {
    
    }
  };

  const uploadeImage = async (imageUrl) => {
    setloading5(true);
      try {
        const data = localStorage.getItem("User");
        if (data) {
          let u = JSON.parse(data);
          const apidata = new FormData();
  
          apidata.append("media", imageUrl);  
          apidata.append("userId", selectedUser.id);  
          // //console.log;
          for (let pair of apidata.entries()) {
            console.log(pair) // Debug FormData contents
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
              console.log("imageUploaded",response.data.data)
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
        console.log("error in upload image:",e);
      }
      finally{
        setloading5(false);
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

      {userRole && userRole != "Invitee" && userRole != "AgencySubAccount"&& (
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
                  type="text"
                  className="w-11/12 outline-none focus:ring-0"
                  onFocus={() => setFocusedTransaction(true)}
                  onBlur={() => setFocusedTransaction(false)}
                  value={transaction}
                  onChange={(event) => {
                    setTransaction(event.target.value);
                    setIsTransactionChange(true);
                  }}
                  placeholder="Value"
                  style={{ border: "0px solid #000000", outline: "none" }}
                />
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
                  type="number"
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
                  : "Average Project Size (kW)"}
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
              What would you like Agentx to help you with
            </div>
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
    </div>
  );
}

export default AdminBasicInfo;

const styles = {
  headingStyle: {
    fontSize: 16,
    fontWeight: "600",
  },
};
