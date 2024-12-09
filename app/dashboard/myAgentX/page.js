'use client'
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Button, Modal, Box, Drawer, Snackbar, Fade, Alert, CircularProgress, Popover } from '@mui/material'
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import { Plus } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

function Page() {

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
  const [activeTab, setActiveTab] = useState("Agent Info");
  const [userDetails, setUserDetails] = useState([]);
  const [agentData, setAgentData] = useState([]);
  const [initialLoader, setInitialLoader] = useState(false);
  //image variable
  const [selectedImages, setSelectedImages] = useState({});
  const [selectedAgent, setSelectedAgent] = useState(null);
  //del loader
  const [DelLoader, setDelLoader] = useState(false);
  const [delAgentModal, setDelAgentModal] = useState(false);

  //code for testing the ai
  let callScript = null;
  let keys = [];

  //variable string the keys
  const [scriptKeys, setScriptKeys] = useState([]);
  //variable for input field value
  const [inputValues, setInputValues] = useState({});
  const [showSuccessSnack, setShowSuccessSnack] = useState(null);
  const [testAIloader, setTestAIloader] = useState(false);

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
        if (response.data.status === true) {
          setShowSuccessSnack(response.data.message);
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
      setUserData(registerationData);
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


    const userData = localStorage.getItem("User");

    try {
      setInitialLoader(true);
      if (userData) {
        const userLocalData = JSON.parse(userData);
        getAgents(userLocalData);
      }
    } catch (error) {
      console.error("Error occured is :", error);
    } finally {
      setInitialLoader(false)
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
      setInitialLoader(true);
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
        setUserDetails(response.data.data);
        callScript = response.data.data[0].greeting;

        console.log("Keys extracted are", callScript);

        //function for extracting the keys
        const regex = /\{(.*?)\}/g;
        let match;

        while ((match = regex.exec(callScript)) !== null) {
          keys.push(match[1]); // Add the variable name (without braces) to the array
        }
        setScriptKeys((prevKeys) => [...prevKeys, ...keys]);
        console.log("Keys extracted are", keys);

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
  const [agentsContent, setAgentsContent] = useState([]);
  //code for popover
  const [actionInfoEl, setActionInfoEl] = React.useState(null);

  const handlePopoverOpen = (event) => {
    setActionInfoEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setActionInfoEl(null);
  };

  const open = Boolean(actionInfoEl);

  useEffect(() => {

    userDetails.map((item, index) => {
      // Check if agents exist
      if (item.agents && item.agents.length > 0) {
        for (let i = 0; i < item.agents.length; i++) {
          const agent = item.agents[i];
          // console.log("Agent spilting data is:", agent);
          // Add a condition here if needed  //.agentType === 'outbound'
          if (agent) {
            setAgentsContent(prevState => [...prevState, agent]);
          }
        }
      } else {
        agentsContent.push(<div key="no-agent">No agents available</div>);
      }
    });

    console.log("Agents data in updated array is", agentsContent);


  }, [userDetails]);


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
                          setShowDrawer(item)
                        }}>

                          <div style={{ fontSize: 24, fontWeight: '600', color: '#000' }}>
                            {item.name.slice(0, 1).toUpperCase(0)}{item.name.slice(1)}
                          </div>
                        </button>
                        <div style={{ fontSize: 12, fontWeight: '600', color: '#00000080' }} className='flex flex-row items-center gap-1'>
                          <div
                            aria-owns={open ? 'mouse-over-popover' : undefined}
                            aria-haspopup="true"
                            onMouseEnter={handlePopoverOpen}
                            onMouseLeave={handlePopoverClose}
                            style={{ cursor: "pointer" }}
                          >
                            {item.agentObjective}
                          </div>
                          <div>
                            | {item.agentType.slice(0, 1).toUpperCase(0)}{item.agentType.slice(1)}
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
                              boxShadow: "0px 8px 8px rgba(0, 0, 0, 0.01)",
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
                                Coming soon
                              </p>
                            </div>
                            <div className="flex flex-row items-center justify-between mt-1 gap-1">
                              <p style={{ ...styles.paragraph, color: "#00000060" }}>
                                Status
                              </p>
                              <p style={styles.paragraph}>
                                Coming soon
                              </p>
                            </div>
                          </div>
                        </Popover>

                      </div>
                      <div className='flex flex-row gap-3 items-center text-purple' style={{ fontSize: 15, fontWeight: '500' }}>
                        <button>
                          <div>
                            View Script
                          </div>
                        </button>

                        <div>
                          |
                        </div>

                        <button>
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
                        setOpenTestAiModal(true);
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
                      name="Convos >10 Sec"
                      value={item.callsGt10 && item.callsGt10 > 0 ? (<div>{item.callsGt10}</div>) : "-"}
                      icon='/otherAssets/convosIcon2.png'
                      bgColor="bg-purple-100"
                      iconColor="text-purple-500"
                    />
                    <Card
                      name="Hot Leads"
                      value={22}
                      icon='/otherAssets/hotLeadsIcon2.png'
                      bgColor="bg-orange-100"
                      iconColor="text-orange-500"
                    />

                    <Card
                      name="Booked Meetings"
                      value={22}
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



        {/* code to add new agent */}
        <button
          className="w-full py-6 rounded-lg flex justify-center items-center"
          style={{
            marginTop: 40,
            borderWidth: 1,
            borderColor: '#7902DF',
            boxShadow: '0px 0px 15px 15px rgba(64, 47, 255, 0.05)',
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
        onClose={() => setOpenTestAiModal(false)}
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
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-full w-full p-8"
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
                </div>
                <button onClick={() => { setOpenTestAiModal(false) }}>
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
                className='w-full border rounded p-2 outline-none focus:outline-none focus:ring-0'
                style={styles.inputStyle}
                value={name}
                onChange={(e) => { setName(e.target.value) }}
              />

              <div className='pt-5' style={styles.headingStyle}>
                Phone Number
              </div>

              {/*<input
                placeholder="Phone Number"
                className='w-full border rounded p-2 outline-none focus:outline-none focus:ring-0'
                style={styles.inputStyle}
                value={phone}
                onChange={(e) => { setPhone(e.target.value) }}
            />*/}

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

              <div className='max-h-[45vh] overflow-auto' style={{ scrollbarWidth: "none" }}>
                {
                  scriptKeys?.map((key, index) => (
                    <div key={index}>
                      <div className='pt-5' style={styles.headingStyle}>
                        Variable {`{${key}}`}
                      </div>
                      <input
                        placeholder="Type here"
                        className="w-full border rounded p-2 outline-none focus:outline-none focus:ring-0"
                        style={styles.inputStyle}
                        value={inputValues[index] || ""} // Default to empty string if no value
                        onChange={(e) => handleInputChange(index, e.target.value)}
                      />
                    </div>
                  ))
                }
              </div>

              {
                testAIloader ?
                  <div className="flex flex-row items-center justify-center w-full p-3 mt-2">
                    <CircularProgress size={30} />
                  </div> :
                  <button style={{ marginTop: 20 }}
                    className='w-full flex bg-purple p-3 rounded-lg items-center justify-center'
                    onClick={handleTestAiClick}
                  >
                    <div style={{ fontSize: 16, fontWeight: '500', color: '#fff' }}>
                      Test AI
                    </div>
                  </button>
              }




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
                    {showDrawer?.name}
                  </div>
                  <div className='text-purple' style={{ fontSize: 11, fontWeight: "600" }}>
                    {showDrawer?.agentObjective}
                  </div>

                  <Image src={'/otherAssets/blueUpdateIcon.png'}
                    height={24}
                    width={24}
                    alt='icon'
                  />
                </div>

                <div style={{ fontSize: 15, fontWeight: "500", color: "#000" }}>
                  {showDrawer?.phoneNumber}
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
            <button className='flex flex-row gap-2 items-center' onClick={() => { setDelAgentModal(true) }}>
              <Image src={'/otherAssets/redDeleteIcon.png'}
                height={24}
                width={24}
                alt='del'
              />

              <div style={{ fontSize: 15, fontWeight: '600', color: 'red', textDecorationLine: 'underline' }}>
                Delete Agent
              </div>
            </button>
          </div>



          <div className="grid grid-cols-3 gap-6 border p-8 flex-row justify-between w-full rounded-lg mb-6">
            <Card
              name="Number of Calls"
              value={showDrawer?.calls && showDrawer?.calls > 0 ? (<div>{showDrawer?.calls}</div>) : "-"}
              icon="/assets/selectedCallIcon.png"
              bgColor="bg-blue-100"
              iconColor="text-blue-500"
            />
            <Card
              name="Convos >10 Sec"
              value={showDrawer?.callsGt10 && showDrawer?.callsGt10 > 0 ? (<div>{showDrawer?.callsGt10}</div>) : "-"}
              icon="/otherAssets/convosIcon2.png"
              bgColor="bg-purple-100"
              iconColor="text-purple-500"
            />
            <Card
              name="Hot Leads"
              value={22}
              icon="/otherAssets/hotLeadsIcon2.png"
              bgColor="bg-orange-100"
              iconColor="text-orange-500"
            />
            <Card
              name="Booked Meetings"
              value={9}
              icon="/otherAssets/greenCalenderIcon.png"
              bgColor="bg-green-100"
              iconColor="text-green-500"
            />
            <Card
              name="Live Transfers"
              value={12}
              icon="/otherAssets/transferIcon.png"
              bgColor="bg-green-100"
              iconColor="text-green-500"
            />
          </div>

          <div className="flex gap-8 pb-2 mb-4">
            {["Agent Info", "Contact", "Stages"].map((tab) => (
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
              <div className="flex flex-col gap-4">
                <div className="flex justify-between">
                  <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>Name</div>
                  <div>
                    {showDrawer?.name}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div>
                    <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>Task</div>

                  </div>
                  <div>Making {showDrawer?.agentType} Calls</div>
                </div>
                <div className="flex justify-between">
                  <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>Role</div>
                  <div>
                    {showDrawer?.agentRole}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className='flex flex-row gap-3'>
                    <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>Call Objective</div>
                    <Image src={'/otherAssets/updateIcon.png'}
                      height={15}
                      width={20}

                      alt='call'
                    />
                  </div>
                  <div>
                    {showDrawer?.agentObjective}
                  </div>
                </div>

                <div className="flex justify-between">
                  <div className='flex flex-row gap-3'>
                    <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>Assigned Pipeline</div>
                    <Image src={'/otherAssets/updateIcon.png'}
                      height={15}
                      width={20}

                      alt='call'
                    />
                  </div>
                  <div>
                    {showDrawer?.pipeline ?
                      <div>
                        {showDrawer?.pipeline}
                      </div> : "N/A"
                    }
                  </div>
                </div>
              </div>
            ) : activeTab === "Contact" ? (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between">
                  <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>
                    Number used for calls
                  </div>
                  <div>
                    {showDrawer?.phoneNumber}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className='flex flex-row gap-3'>
                    <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>
                      Call back number
                    </div>
                    <Image src={'/otherAssets/updateIcon.png'}
                      height={15}
                      width={20}

                      alt='call'
                    />
                  </div>
                  <div>
                    {showDrawer?.callbackNumber ?
                      <div>
                        {showDrawer?.callbackNumber}
                      </div> : "N/A"
                    }
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className='flex flex-row gap-3'>
                    <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>
                      Call transfer number
                    </div>
                    <Image src={'/otherAssets/updateIcon.png'}
                      height={15}
                      width={20}

                      alt='call'
                    />
                  </div>
                  <div>
                    {showDrawer?.liveTransferNumber ?
                      <div>
                        {showDrawer?.liveTransferNumber}
                      </div> : "N/A"
                    }
                  </div>
                </div>
              </div>
            ) : activeTab === "Stages" ? (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between">
                  <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>
                    Number used for calls
                  </div>
                  <div>
                    {showDrawer?.name}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className='flex flex-row gap-3'>
                    <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>Assigned Pipeline</div>
                    <Image src={'/otherAssets/updateIcon.png'}
                      height={15}
                      width={20}

                      alt='call'
                    />
                  </div>
                  <div>
                    {showDrawer?.pipeline ?
                      <div>
                        {showDrawer?.pipeline}
                      </div> : "N/A"
                    }
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className='flex flex-row gap-3'>
                    <div style={{ fontSize: 15, fontWeight: '500', color: '#666' }}>Assigned Pipeline</div>
                    <Image src={'/otherAssets/updateIcon.png'}
                      height={15}
                      width={20}

                      alt='call'
                    />
                  </div>
                  <div>
                    {showDrawer?.pipeline ?
                      <div>
                        {showDrawer?.pipeline}
                      </div> : "N/A"
                    }
                  </div>
                </div>
              </div>
            ) : ""
          }




        </div>
      </Drawer>

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

