"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { TextField, Button, Box, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import getProfileDetails from "../apis/GetProfile";
import { UpdateProfile } from "../apis/UpdateProfile";
import Apis from "../apis/Apis";
import axios from "axios";
import { UserTypes } from "@/constants/UserTypes";

function BasicInfo() {
  const router = useRouter();
  const [focusedName, setFocusedName] = useState(false);
  const [focusedFarm, setFocusedFarm] = useState(false);
  const [focusedTerritory, setFocusedTerritory] = useState(false);
  const [focusedBrokerage, setFocusedBrokerage] = useState(false);
  const [focusedCompany, setFocusedCompany] = useState(false);
  const [focusedTransaction, setFocusedTransaction] = useState(false);
  const [focusedInstallationVolume, setFocusedInstallationVolume] = useState(false);
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedServiceArea, setFocusedServiceArea] = useState(false);
  const [focusedProjectSize, setFocusedProjectSize] = useState(false);
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
  const [serviceArea, setServiceArea] = useState("")
  const [teritorry, setTeritorry] = useState("")
  const [company, setCompany] = useState("")
  const [installationVolume, setInstallationVolume] = useState("")
  const [projectSize, setProjectSize] = useState("")
  const [clientType, setClientType] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")


  const [isNameChanged, setIsNameChanged] = useState(false);
  const [isTransactionChanged, setIsTransactionChange] = useState("");
  const [isFarmChanged, setIsFarmChanged] = useState(false);
  const [isBrokerageChanged, setIsBrokerageChanged] = useState(false);
  const [isServiceAreaChanged, setIsServiceAreaChanged] = useState(false);
  const [isTeritorryChanged, setIsTeritorryChanged] = useState("")
  const [isCompanyChanged, setIsCompanyChanged] = useState("")
  const [isInstallationVolumechanged, setIsInstallationVolumeChanged] = useState("")
  const [isProjectSizeChanged, setIsprojectSizeChanged] = useState("")
  const [isWebsiteUrlChanged, setIsWebsiteUrlChanged] = useState("")


  const [agentServices, setAgentServices] = useState([]);
  const [agentAreasOfFocus, setAgentAreasOfFocus] = useState([]);

  const [loading, setloading] = useState(false);
  const [loading2, setloading2] = useState(false);
  const [loading3, setloading3] = useState(false);
  const [loading4, setloading4] = useState(false);
  const [loading5, setloading5] = useState(false);
  const [loading6, setloading6] = useState(false);
  const [loading7, setloading7] = useState(false);
  const [loading8, setloading8] = useState(false);
  const [loading9, setloading9] = useState(false);
  const [loading10, setLoading10] = useState(farm)

  const [srviceLoader, setServiceLoader] = useState(false);
  const [areaLoading, setAreaLoading] = useState(false);

  const [selected, setSelected] = useState([]);
  const [selectedArea, setSelectedArea] = useState([]);

  //code for image select and drag and drop
  const [selectedImage, setSelectedImage] = useState("");
  const [dragging, setDragging] = useState(false);

  const [originalSelectedArea, setOriginalSelectedArea] = useState([]); // To track initial state
  const [originalSelectedService, setOriginalSelectedService] = useState([]); // To track initial state

  //user details
  const [UserDetails, setUserDetails] = useState(null);


  const [userRole, setUserRole] = useState("")
  const [userType, setUserType] = useState("")



  const primaryClientTypes = [
    {
      id: 1,
      title: "Residential clients",
    },
    {
      id: 2,
      title: "Commercial clients",
    },
    {
      id: 3,
      title: "Both",
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
      console.log("Should set data", userData?.user);

      setUserRole(userData?.user?.userRole)
      setUserType(userData?.user?.userType)
      // setUserType(UserTypes.SolarRep)
      setUserDetails(userData.user);
      setName(userData?.user?.name);
      setSelectedImage(userData?.user?.thumb_profile_image);
      setEmail(userData?.user?.email);
      setFarm(userData?.user?.farm);
      setTransaction(userData?.user?.averageTransactionPerYear);
      setBrokerAge(userData?.user?.brokerage);
      setPhone(userData?.user?.phone);

      setInstallationVolume(userData?.user?.projectsPerYear)
      setServiceArea(userData?.user?.areaOfService)
      setClientType(userData?.user?.primaryClientType)
      setCompany(userData?.user?.company)
      setProjectSize(userData?.user?.projectSizeKw)
      setWebsiteUrl(userData?.user?.website)


      // Initialize arrays to hold services and areas of focus
      const servicesArray = [];
      const focusAreasArray = [];

      // Pre-populate selected services and areas based on the user profile
      userData?.user?.services?.forEach((item) => {
        servicesArray.push(item.agentService); // Add the full object or only IDs as needed
      });

      userData?.user?.focusAreas?.forEach((item) => {
        focusAreasArray.push(item.areaOfFocus); // Add the full object or only IDs as needed
      });

      setServiceId(servicesArray);

      // Set default selected areas and services
      // setSelected(servicesArray); // Default select services
      setSelectedArea(focusAreasArray); // Default select areas of focus

      setOriginalSelectedArea(focusAreasArray); // Save the initial state
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

        // console.log("Uploading image with apidata:");
        for (let pair of apidata.entries()) {
          // console.log(`${pair[0]}:`, pair[1]); // Debug FormData contents
        }
        let path = Apis.updateProfileApi;

        // console.log("Authtoken is", u.token);
        // console.log("Api Data passsed is", apidata);
        // return
        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: "Bearer " + u.token,
          },
        });

        if (response) {
          if (response.data.status === true) {
            // console.log("updateProfile data is", response.data);
            u.user = response.data.data;

            //// console.log('u', u)
            localStorage.setItem("User", JSON.stringify(u));
            // console.log("trying to send event");
            window.dispatchEvent(
              new CustomEvent("UpdateProfile", { detail: { update: true } })
            );
            return response.data.data;
          }
        }
      }
    } catch (e) {
      // console.log("error in update profile is", e);
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
        // console.log("AgentTypeTitle is", AgentTypeTitle);

        const ApiPath = `${Apis.defaultData}?type=${AgentTypeTitle}`;
        // console.log("Api link is:--", ApiPath);
        const response = await axios.get(ApiPath, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response) {
          // console.log("Response of services api is : -----", response.data);
          setAgentServices(response.data.data.agentServices);
          setAgentAreasOfFocus(response.data.data.areaOfFocus);
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
      // console.log("Error in updating", e);
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
      // console.log("error in updating", e);
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
      // console.log("error in updating", e);
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
      // console.log("error in updating", e);
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
      // console.log("error in updating", e);
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
      // console.log("error in updating", e);
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
      // console.log("error in updating", e);
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
      // console.log("error in updating", e);
    }
  };



  const handleserviceId = (id) => {
    // console.log("Id to ad is", id);
    // console.log("Old is are", serviceId);
    let newIDs = [];
    if (serviceId.includes(id)) {
      // Unselect the item if it's already selected
      newIDs = serviceId.filter((prevId) => prevId !== id);
    } else {
      // Select the item if it's not already selected
      newIDs = [...serviceId, id];
    }

    setServiceId(newIDs);
    // console.log("New array is", newIDs);
  };

  const handleAreaSelect = (id) => {
    // console.log("Id to ad is", id);
    // console.log("Old is are", selectedArea);
    let newIDs = [];
    if (selectedArea.includes(id)) {
      // Unselect the item if it's already selected
      newIDs = selectedArea.filter((prevId) => prevId !== id);
    } else {
      // Select the item if it's not already selected
      newIDs = [...selectedArea, id];
    }
    setSelectedArea(newIDs);
    // console.log("New array is", newIDs);
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

  const handleSelectClientType = async (item) => {
    // console.log("Select client type", item);
    setClientType(item.title);
    let ClientType = item.title
    let clienttype = ""

    if (ClientType === "Residential clients") {
      clienttype = "residential";
    } else if (ClientType === "Commercial clients") {
      clienttype = "commercial";
    } else if (ClientType === "Both") {
      clienttype = "both";
    }
    let data = {
      primaryClientType: clienttype,
    };
    await UpdateProfile(data);

  };

  const handleAreaChange = async () => {
    try {
      setAreaLoading(true);
      let data = {
        areaOfFocus: selectedArea, //[selectedArea.join()]
      };
      // console.log("data is", data);

      // return
      await UpdateProfile(data);
      setOriginalSelectedArea([...selectedArea]);
      setAreaLoading(false);
    } catch (e) {
      // console.log("error in updating", e);
    }
  };

  const handleServiceChange = async () => {
    try {
      setServiceLoader(true);
      let data = {
        agentService: serviceId, //[serviceId.join()]
      };
      // console.log("Api data is", serviceId);

      // return
      await UpdateProfile(data);
      setOriginalSelectedService([...serviceId]);
      setServiceLoader(false);
    } catch (e) {
      // console.log("error in updating", e);
    }
  };

  const handleWebsiteChange = async () => {
    try {
      setLoading10(true);
      let data = {
        website: websiteUrl,
      };
      // console.log("Api data is", serviceId);

      // return
      await UpdateProfile(data);
      setIsWebsiteUrlChanged(false);
      setLoading10(false);
    } catch (e) {
      // console.log("error in updating", e);
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
                    objectFit: 'cover',
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

      {
        userRole && userRole != "Invitee" && (
          <>
            {
              userType && userType === UserTypes.RealEstateAgent ||
                userType && userType === UserTypes.RealEstateAgent
                ? (
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
                            style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}
                          >
                            Save
                          </button>
                        ))}
                    </div>
                  </>

                ) : (
                  userType && userType === UserTypes.SolarRep ||
                    userType && userType === UserTypes.SalesDevRep ||
                    userType && userType === UserTypes.MarketerAgent ||
                    userType && userType === UserTypes.TaxAgent ||
                    userType && userType === UserTypes.RecruiterAgent ||
                    userType && userType === UserTypes.DebtCollectorAgent ||
                    userType && userType === UserTypes.MedSpaAgent ||
                    userType && userType === UserTypes.LawAgent ||
                    userType && userType === UserTypes.LoanOfficerAgent

                    ? (
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
                            border: `1px solid ${focusedServiceArea ? "#8a2be2" : "#00000010"}`,
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
                                style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}
                              >
                                Save
                              </button>
                            ))}

                        </div>
                      </>
                    ) : ""
                )
            }


            {
              userType && userType === UserTypes.RealEstateAgent ||
                userType && userType === UserTypes.RealEstateAgent
                ? (

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
                        border: `1px solid ${focusedBrokerage ? "#8a2be2" : "#00000010"}`,
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
                            style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}
                          >
                            Save
                          </button>
                        ))}
                    </div>

                  </>
                ) : (
                  userType && userType === UserTypes.SolarRep ||
                    userType && userType === UserTypes.SolarRep ||
                    userType && userType === UserTypes.MarketerAgent ||
                    userType && userType === UserTypes.DebtCollectorAgent ||
                    userType && userType === UserTypes.MedSpaAgent ||
                    userType && userType === UserTypes.LawAgent ||
                    userType && userType === UserTypes.LoanOfficerAgent


                    ? (
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
                            border: `1px solid ${focusedBrokerage ? "#8a2be2" : "#00000010"}`,
                            transition: "border-color 0.3s ease",
                          }}
                        >
                          <input
                            className="w-11/12 outline-none focus:ring-0"
                            onFocus={() => setFocusedCompany(true)}
                            onBlur={() => setFocusedCompany(false)}
                            value={brokerAge}
                            onChange={(event) => {
                              setCompany(event.target.value);
                              setIsCompanyChanged(true);
                            }}
                            type="text"
                            placeholder="Brokerage"
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
                                style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}
                              >
                                Save
                              </button>
                            ))}
                        </div>
                      </>
                    ) : (
                      userType && userType === UserTypes.WebsiteAgent ? (
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
                              border: `1px solid ${focusedWebsite ? "#8a2be2" : "#00000010"}`,
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
                                  style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}
                                >
                                  Save
                                </button>
                              ))}
                          </div>
                        </>
                      ) : ""
                    )
                )
            }

            {
              userType && userType === UserTypes.RealEstateAgent ? (
                <>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#000",
                      marginTop: "4vh",
                    }}
                  >
                    Average transaction volume per year
                  </div>

                  <div
                    className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5"
                    style={{
                      border: `1px solid ${focusedTransaction ? "#8a2be2" : "#00000010"}`,
                      transition: "border-color 0.3s ease",
                    }}
                  >
                    <input
                      type="number"
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
                    {isTransactionChanged &&
                      (loading4 ? (
                        <CircularProgress size={20} />
                      ) : (
                        <button
                          onClick={async () => {
                            handleTransactionSave();
                          }}
                          style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}
                        >
                          Save
                        </button>
                      ))}
                  </div>
                </>
              ) : (
                userType && userType === UserTypes.SolarRep ||
                  userType && userType === UserTypes.DebtCollectorAgent ||
                  userType && userType === UserTypes.LoanOfficerAgent ||
                  userType && userType === UserTypes.LawAgent ||
                  userType && userType === UserTypes.MedSpaAgent

                  ? (
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
                          border: `1px solid ${focusedInstallationVolume ? "#8a2be2" : "#00000010"}`,
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
                        {isInstallationVolumechanged &&
                          (loading7 ? (
                            <CircularProgress size={20} />
                          ) : (
                            <button
                              onClick={async () => {
                                handleInstallationVolumeSave();
                              }}
                              style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}
                            >
                              Save
                            </button>
                          ))}
                      </div>
                    </>
                  ) : ""

              )
            }


            {
              userType && userType === UserTypes.SolarRep ? (
                <>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#000",
                      marginTop: "4vh",
                    }}
                  >
                    Average Project Size (kW)
                  </div>

                  <div
                    className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5"
                    style={{
                      border: `1px solid ${focusedProjectSize ? "#8a2be2" : "#00000010"}`,
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
                          style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}
                        >
                          Save
                        </button>
                      ))}
                  </div>
                </>
              ) : ("")
            }
            {
              userType && userType === UserTypes.SolarRep ||
                userType && userType === UserTypes.DebtCollectorAgent

                ? (
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
                                  clientType === item.title
                                    ? "2px solid #7902DF"
                                    : "",
                                backgroundColor:
                                  clientType === item.title ? "#402FFF20" : "",
                              }}
                            >
                              {item.title}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                  </>
                ) : ("")
            }
            {
              userType && userType === UserTypes.LawAgent ||
                userType && userType === UserTypes.LoanOfficerAgent ? (
                <>
                  <div style={styles.headingStyle} className="mt-6">
                    Client Type
                  </div>


                  <div
                    className="flex w-full flex-wrap flex-row items-center gap-2"
                    style={{ marginTop: "8px", flexWrap: 'wrap' }}
                  >
                    {primaryClientTypes2.map((item, index) => {
                      return (
                        <div key={index} className="w-full">
                          <button
                            onClick={() => {
                              handleSelectClientType(item);
                            }}
                            className="border border-[#00000010] rounded px-4 py-4 outline-none focus:outline-none focus:ring-0"
                            style={{
                              ...styles.inputStyle,
                              borderRadius: "30px",
                              paddingInline: index === 2 && "40px",
                              border:
                                ClientType === item.title
                                  ? "2px solid #7902DF"
                                  : "",
                              backgroundColor:
                                ClientType === item.title ? "#402FFF20" : "",
                            }}
                          >
                            {item.title}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : ""
            }
            {
              userType && userType === UserTypes.LawAgent ? (
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
                              handleSelectClientType(item);
                            }}
                            className="border border-[#00000010] rounded px-4 py-4 outline-none focus:outline-none focus:ring-0"
                            style={{
                              ...styles.inputStyle,
                              borderRadius: "30px",
                              paddingInline: index === 2 && "40px",
                              border:
                                ClientType === item.title
                                  ? "2px solid #7902DF"
                                  : "",
                              backgroundColor:
                                ClientType === item.title ? "#402FFF20" : "",
                            }}
                          >
                            {item.title}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>

              ) : ""
            }
          </>
        )}



      {
        userRole && userRole != "Invitee" && (
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
              {serviceId.length > 0 &&
                hasServiceChanged() &&
                (srviceLoader ? (
                  <CircularProgress size={20} />
                ) : (
                  <button
                    onClick={async () => {
                      handleServiceChange();
                    }}
                    style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}
                  >
                    Save
                  </button>
                ))}
            </div>

            <div className="w-9/12 flex flex-row flex-wrap gap-2">
              {agentServices.map((item, index) => (
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
                  <div style={{ fontSize: 15, fontWeight: "700" }}>{item.title}</div>

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
              ))}
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
                What area of real estate do you focus on?
              </div>
              {selectedArea.length > 0 &&
                hasAreaFocusChanged() &&
                (areaLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <button
                    onClick={async () => {
                      handleAreaChange();
                    }}
                    style={{ color: " #8a2be2", fontSize: "14px", fontWeight: "600" }}
                  >
                    Save
                  </button>
                ))}
            </div>

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
                  <div style={{ fontSize: 15, fontWeight: "700" }}>{item.title}</div>

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

          </>
        )
      }



    </div>
  );
}

export default BasicInfo;


const styles = {
  headingStyle: {
    fontSize: 16,
    fontWeight: "600",
  },
}