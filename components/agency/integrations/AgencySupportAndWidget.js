import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import { CircularProgress, Switch, Tooltip } from '@mui/material';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { AuthToken } from '../plan/AuthDetails';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import { isValidUrl } from '@/constants/Constants';

const AgencySupportAndWidget = () => {

  //settings data
  const [settingsData, setSettingsData] = useState(null);
  //snack msg
  const [showSnackMessage, setShowSnackMessage] = useState(null);
  const [showSnackType, setShowSnackType] = useState(SnackbarTypes.Success);
  //support web calendar
  const [allowSuportWebCalendar, setAllowSuportWebCalendar] = useState(false);
  const [addSuportWebCalendar, setAddSuportWebCalendar] = useState(false);
  const [addSuportWebCalendarLoader, setAddSuportWebCalendarLoader] = useState(false);
  const [delSuportWebCalendarLoader, setDelSuportWebCalendarLoader] = useState(false);
  const [suportWebCalendar, setSuportWebCalendar] = useState("");
  const [isInValidUrlSuportWebCalendar, setIsInValidUrlSuportWebCalendar] = useState(false);
  //sky
  const [allowSky, setAllowSky] = useState(false);
  const [addSky, setAddSky] = useState(false);
  const [addSkyLoader, setAddSkyLoader] = useState(false);
  const [sky, setSky] = useState("");
  const [delSkyLoader, setDelSkyLoader] = useState(false);
  //feedback
  const [allowFeedBack, setAllowFeedBack] = useState(false);
  const [addFeedBack, setAddFeedBack] = useState(false);
  const [addFeedBackLoader, setAddFeedBackLoader] = useState(false);
  const [feedBack, setFeedBack] = useState("");
  const [delFeedBackLoader, setDelFeedBackLoader] = useState(false);
  const [isInValidUrlFeedBack, setIsInValidUrlFeedBack] = useState(false);
  //hire team
  const [allowHireTeam, setAllowHireTeam] = useState(false);
  const [addHireTeam, setAddHireTeam] = useState(false);
  const [addHireTeamLoader, setAddHireTeamLoader] = useState(false);
  const [hireTeam, setHireTeam] = useState("");
  const [delHireTeamLoader, setDelHireTeamLoader] = useState(false);
  const [isInValidUrlHireTeam, setIsInValidUrlHireTeam] = useState(false);
  //billing and support
  const [allowBillingAndSupport, setAllowBillingAndSupport] = useState(false);
  const [addBillingAndSupport, setAddBillingAndSupport] = useState(false);
  const [addBillingAndSupportLoader, setAddBillingAndSupportLoader] = useState(false);
  const [billingAndSupport, setBillingAndSupport] = useState("");
  const [delBillingAndSupportLoader, setDelBillingAndSupportLoader] = useState(false);
  const [isInValidUrlBillingAndSupport, setIsInValidUrlBillingAndSupport] = useState(false);
  //initial loader
  const [initialLoader, setInitialLoader] = useState(false);

  //get user settings
  useEffect(() => {
    getUserSettings();
  }, []);

  //get user settings
  const getUserSettings = async () => {
    try {
      setInitialLoader(true);
      const ApiPath = Apis.userSettings;
      const Auth = AuthToken();
      const response = await axios.get(ApiPath, {
        headers: {
          "Authorization": "Bearer " + Auth,
          "Content-Type": "application/json",
        },
      });
      if (response) {
        console.log("response of get user settings api is", response)
        const Data = response?.data?.data;
        setAllowSuportWebCalendar(Data?.supportWebinarCalendar || false);
        setSuportWebCalendar(Data?.supportWebinarCalendarUrl || "");
        setAllowSky(Data?.skyAgent || false);
        setSky(Data?.skyAgentId || "");
        setAllowFeedBack(Data?.giveFeedback || false);
        setFeedBack(Data?.giveFeedbackUrl || "");
        setAllowHireTeam(Data?.hireTeam || false);
        setHireTeam(Data?.hireTeamUrl || "");
        setAllowBillingAndSupport(Data?.billingAndSupport || false);
        setBillingAndSupport(Data?.billingAndSupportUrl || "");
        setSettingsData(Data);
        setInitialLoader(false);
      }
    } catch (err) {
      console.log("Error occured in api is", err);
      setInitialLoader(false);
    }
  }

  //user settings api data
  const userSettingDataUpgrade = (from) => {
    console.log("Api will run for", from);
    if (from === "suportWebCalendar") {
      setAddSuportWebCalendarLoader(true);
      return {
        supportWebinarCalendar: true,
        supportWebinarCalendarUrl: suportWebCalendar,
      }
    } else if (from === "sky") {
      setAddSkyLoader(true);
      return {
        skyAgent: true,
        skyAgentId: sky,
      }
    } else if (from === "feedBack") {
      setAddFeedBackLoader(true);
      return {
        giveFeedback: true,
        giveFeedbackUrl: feedBack,
      }
    } else if (from === "hireTeam") {
      setAddHireTeamLoader(true);
      return {
        hireTeam: true,
        hireTeamUrl: hireTeam,
      }
    } else if (from === "billingAndSupport") {
      setAddBillingAndSupportLoader(true);
      return {
        billingAndSupport: true,
        billingAndSupportUrl: billingAndSupport,
      }
    }
  }

  //api data for deleting user setting
  const userSettingDataDel = (from) => {
    console.log("Api will run for", from);
    if (from === "suportWebCalendarDel") {
      setDelSuportWebCalendarLoader(true);
      return {
        supportWebinarCalendar: false,
        supportWebinarCalendarUrl: "",
      }
    } else if (from === "skyDel") {
      setDelSkyLoader(true);
      return {
        skyAgent: false,
        skyAgentId: "",
      }
    } else if (from === "feedBackDel") {
      setDelFeedBackLoader(true);
      return {
        giveFeedback: false,
        giveFeedbackUrl: "",
      }
    } else if (from === "hireTeamDel") {
      setDelHireTeamLoader(true);
      return {
        hireTeam: false,
        hireTeamUrl: "",
      }
    } else if (from === "billingAndSupportDel") {
      setDelBillingAndSupportLoader(true);
      return {
        billingAndSupport: false,
        billingAndSupportUrl: "",
      }
    }
  }

  //user settings api
  const handleUserSettings = async (from) => {
    try {
      const Auth = AuthToken();
      const ApiPath = Apis.userSettings;
      let ApiData = null;
      if (from?.endsWith("Del")) {
        ApiData = userSettingDataDel(from);
      } else {
        ApiData = userSettingDataUpgrade(from);
      }
      console.log("Api data sending in user setting api is", ApiData);
      const response = await axios.put(ApiPath, ApiData, {
        headers: {
          "Authorization": "Bearer " + Auth,
          "Content-Type": "application/json",
        },
      });
      console.log("Response of user settings api is", response);
      if (response) {
        if (response.data.status === true) {
          setShowSnackMessage(response.data.message);
          setShowSnackType(SnackbarTypes.Success);
          setAddSuportWebCalendar(false);
          setAddSky(false);
          setAddFeedBack(false);
          setAddHireTeam(false);
          setAddBillingAndSupport(false);
          setSettingsData(response.data.data);
        } else {
          setShowSnackMessage(response.data.message);
          setShowSnackType(SnackbarTypes.Error);
        }
        handleResetLoaders();
      }
    }
    catch (error) {
      console.error("Error occured in user settings api is", error);
      handleResetLoaders();
    }
  }

  //reset loaders
  const handleResetLoaders = () => {
    setAddSuportWebCalendarLoader(false);
    setAddSkyLoader(false);
    setAddFeedBackLoader(false);
    setAddHireTeamLoader(false);
    setAddBillingAndSupportLoader(false);
    setDelSuportWebCalendarLoader(false);
    setDelSkyLoader(false);
    setDelFeedBackLoader(false);
    setDelHireTeamLoader(false);
    setDelBillingAndSupportLoader(false);
  }

  return (
    <div className="flex flex-row justify-center h-[73vh] w-full overflow-y-auto">
      <div className='w-11/12 pt-4'>
        <AgentSelectSnackMessage
          isVisible={showSnackMessage}
          hide={() => {
            setShowSnackMessage(null);
          }}
          type={showSnackType}
          message={showSnackMessage}
        />
        {
          initialLoader ? (
            <div className="flex flex-row items-center justify-center w-full">
              <CircularProgress size={30} />
            </div>
          ) : (
            <div className="w-full border rounded-xl p-4 rounded-lg border rounded-xl">
              <div style={{ fontWeight: "600", fontSize: "22px", color: "#000000" }}>Support Widget</div>
              <div className='border-b'>
                <div className='border rounded-lg px-4 py-2 bg-[#D9D9D917] mb-4 mt-4'>
                  <div className='flex flex-row items-center justify-between w-full'>
                    <div className='flex flex-row items-center gap-2'>
                      <div style={styles.subHeading}>
                        Support webinar calendar
                      </div>
                      <Tooltip
                        title="If you want to offer support calls, add your support calendar here."
                        arrow
                        componentsProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: "#ffffff", // Ensure white background
                              color: "#333", // Dark text color
                              fontSize: "16px",
                              fontWeight: '500',
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
                        <Image src={"/svgIcons/infoIcon.svg"}
                          height={16} width={16} alt="*"
                        />
                      </Tooltip>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      {
                        delSuportWebCalendarLoader ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Switch
                            checked={allowSuportWebCalendar}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setAllowSuportWebCalendar(checked);

                              if (allowSuportWebCalendar === false) {
                                setAddSuportWebCalendar(true);
                              } else {
                                if (settingsData?.supportWebinarCalendarUrl) {
                                  handleUserSettings("suportWebCalendarDel")
                                } else {
                                  setSuportWebCalendar("");
                                  setAddSuportWebCalendar(false);
                                }
                              }
                            }}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: 'white',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#7902DF',
                              },
                            }}
                          />
                        )
                      }
                    </div>
                  </div>
                  {settingsData?.supportWebinarCalendarUrl && (
                    <div className='flex flex-row items-center justify-between w-full mt-2'>
                      <div style={styles.subHeading}>
                        URL: {settingsData?.supportWebinarCalendarUrl || ""}
                      </div>
                      <button
                        className="flex flex-row items-center gap-2"
                        onClick={() => {
                          setAddSuportWebCalendar(true);
                        }}
                      >
                        <div className="text-purple outline-none border-none rounded p-1 bg-white" style={{ fontSize: "16px", fontWeight: "400" }}>Edit</div>
                        <Image
                          alt="*"
                          src={"/assets/editPen.png"}
                          height={16}
                          width={16}
                        />
                      </button>
                    </div>
                  )}
                  {
                    addSuportWebCalendar && (
                      <div className="flex flex-row items-center justify-center gap-2 mt-2">
                        <div className="border border-gray-200 rounded px-2 py-0 flex flex-row items-center w-[90%]">
                          <input
                            style={styles.inputs}
                            type="text"
                            className={`w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none`}
                            placeholder="Enter your URL"
                            value={suportWebCalendar}
                            onChange={(e) => {
                              const value = e.target.value;
                              const validUrl = isValidUrl(value);
                              setSuportWebCalendar(value);
                              setTimeout(() => {
                                if (value && !validUrl) {
                                  setIsInValidUrlSuportWebCalendar(true);
                                } else {
                                  setIsInValidUrlSuportWebCalendar(false);
                                }
                              }, 1000);
                            }}
                          />
                        </div>
                        {
                          addSuportWebCalendarLoader ? (
                            <div className="flex flex-row items-center justify-center w-[10%]">
                              <CircularProgress size={30} />
                            </div>
                          ) : (
                            <button
                              className={`w-[10%] h-[40px] rounded-xl ${isInValidUrlSuportWebCalendar || !suportWebCalendar ? "bg-btngray text-black" : "bg-purple text-white"}`}
                              style={{ fontSize: "15px", fontWeight: "500" }}
                              onClick={() => { handleUserSettings("suportWebCalendar") }}
                              disabled={isInValidUrlSuportWebCalendar || !suportWebCalendar}
                            >
                              {isInValidUrlSuportWebCalendar ? "Invalid URL" : "Save"}
                            </button>
                          )
                        }
                      </div>
                    )
                  }
                </div>
              </div>
              {/*
                <div className='border-b'>
                  <div className='border rounded-lg px-4 py-2 bg-[#D9D9D917] mt-4'>
                    <div className='flex flex-row items-center justify-between w-full'>
                      <div className='flex flex-row items-center gap-2'>
                      <div style={styles.subHeading}>
                        Sky
                      </div>

                      <Tooltip
                      title="If you want to offer support calls, add your support calendar here."
                      arrow
                      componentsProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: "#ffffff", // Ensure white background
                            color: "#333", // Dark text color
                            fontSize: "16px",
                            fontWeight: '500',
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
                      <Image src={"/svgIcons/infoIcon.svg"}
                        height={16} width={16} alt="*"
                      />
                    </Tooltip>
                    </div>

                      <div className="flex flex-row items-center gap-2">
                        <Switch
                          checked={allowSky}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setAllowSky(checked);
  
                            if (allowSky === false) {
                              setAddSky(true);
                            } else {
                              setSky("");
                              setAddSky(false);
                            }
                          }}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: 'white',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#7902DF',
                            },
                          }}
                        />
                      </div>
                    </div>
                    {
                      settingsData?.skyAgentId && (
                        <div className='flex flex-row items-center justify-between w-full mt-2'>
                          <div style={styles.subHeading}>
                            Agent ID: {settingsData?.skyAgentId || ""}
                          </div>
                          <button className="flex flex-row items-center gap-2" onClick={() => {
                            setAddSky(true);
                          }}>
                            <div className="text-purple outline-none border-none rounded p-1 bg-white" style={{ fontSize: "16px", fontWeight: "400" }}>Edit</div>
                            <Image
                              alt="*"
                              src={"/assets/editPen.png"}
                              height={16}
                              width={16}
                            />
                          </button>
                        </div>
                      )}
                    {
                      addSky && (
                        <div className="flex flex-row items-center justify-center gap-2 mt-2">
                          <div className="border border-gray-200 rounded px-2 py-0 flex flex-row items-center w-[90%]">
                            <input
                              style={styles.inputs}
                              type="text"
                              className={`w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none`}
                              placeholder="Enter your Agent ID"
                              value={sky}
                              onChange={(e) => {
                                const value = e.target.value;
                                const validUrl = isValidUrl(value);
                                setSky(value);
                                setTimeout(() => {
                                  if (value && !validUrl) {
                                    setShowSnackMessage("Invalid URL");
                                    setShowSnackType(SnackbarTypes.Error);
                                  }
                                }, 1000);
                              }}
                            />
                          </div>
                          {
                            addSkyLoader ? (
                              <div className="flex flex-row items-center justify-center w-[10%]">
                                <CircularProgress size={30} />
                              </div>
                            ) : (
                              <button onClick={() => { handleUserSettings("sky") }} className={`w-[10%] bg-purple text-white h-[40px] rounded-xl`} style={{ fontSize: "15px", fontWeight: "500" }}>
                                Save
                              </button>
                            )
                          }
                        </div>
                      )
                    }
                  </div>
                </div>
              */}
              <div className='border-b'>
                <div className='border rounded-lg px-4 py-2 bg-[#D9D9D917] mb-4 mt-4'>
                  <div className='flex flex-row items-center justify-between w-full'>
                    <div className='flex flex-row items-center gap-2'>
                      <div style={styles.subHeading}>
                        Give feedback
                      </div>
                      <Tooltip
                        title="This allows you to collect feedback from your users."
                        arrow
                        componentsProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: "#ffffff", // Ensure white background
                              color: "#333", // Dark text color
                              fontSize: "16px",
                              fontWeight: '500',
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
                        <Image src={"/svgIcons/infoIcon.svg"}
                          height={16} width={16} alt="*"
                        />
                      </Tooltip>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      {
                        delFeedBackLoader ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Switch
                            checked={allowFeedBack}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setAllowFeedBack(checked);

                              if (allowFeedBack === false) {
                                setAddFeedBack(true);
                              } else {
                                if (settingsData?.giveFeedbackUrl) {
                                  handleUserSettings("feedBackDel")
                                } else {
                                  setFeedBack("");
                                  setAddFeedBack(false);
                                }
                              }
                            }}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: 'white',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#7902DF',
                              },
                            }}
                          />
                        )
                      }
                    </div>
                  </div>
                  {
                    settingsData?.giveFeedbackUrl && (
                      <div className='flex flex-row items-center justify-between w-full mt-2'>
                        <div style={styles.subHeading}>
                          URL: {settingsData?.giveFeedbackUrl || ""}
                        </div>
                        <button className="flex flex-row items-center gap-2" onClick={() => {
                          setAddFeedBack(true);
                        }}>
                          <div className="text-purple outline-none border-none rounded p-1 bg-white" style={{ fontSize: "16px", fontWeight: "400" }}>Edit</div>
                          <Image
                            alt="*"
                            src={"/assets/editPen.png"}
                            height={16}
                            width={16}
                          />
                        </button>
                      </div>
                    )}
                  {
                    addFeedBack && (
                      <div className="flex flex-row items-center justify-center gap-2 mt-2">
                        <div className="border border-gray-200 rounded px-2 py-0 flex flex-row items-center w-[90%]">
                          <input
                            style={styles.inputs}
                            type="text"
                            className={`w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none`}
                            placeholder="Enter your URL"
                            value={feedBack}
                            onChange={(e) => {
                              const value = e.target.value;
                              const validUrl = isValidUrl(value);
                              setFeedBack(value);
                              setTimeout(() => {
                                if (value && !validUrl) {
                                  setIsInValidUrlFeedBack(true);
                                } else {
                                  setIsInValidUrlFeedBack(false);
                                }
                              }, 1000);
                            }}
                          />
                        </div>
                        {
                          addFeedBackLoader ? (
                            <div className="flex flex-row items-center justify-center w-[10%]">
                              <CircularProgress size={30} />
                            </div>
                          ) : (
                            <button
                              className={`w-[10%] h-[40px] rounded-xl ${isInValidUrlFeedBack || !feedBack ? "bg-btngray text-black" : "bg-purple text-white"}`}
                              style={{ fontSize: "15px", fontWeight: "500" }}
                              onClick={() => { handleUserSettings("feedBack") }}
                              disabled={isInValidUrlFeedBack || !feedBack}
                            >
                              {isInValidUrlFeedBack ? "Invalid URL" : "Save"}
                            </button>
                          )
                        }
                      </div>
                    )
                  }
                </div>
              </div>
              <div className='border-b'>
                <div className='border rounded-lg px-4 py-2 bg-[#D9D9D917] mb-4 mt-4'>
                  <div className='flex flex-row items-center justify-between w-full'>
                    <div className='flex flex-row items-center gap-2'>
                    <div style={styles.subHeading}>
                      Hire team
                    </div>

                    <Tooltip
                    title="Allow your users to get on a sales call to hire you for a white glove service."
                    arrow
                    componentsProps={{
                      tooltip: {
                        sx: {
                          backgroundColor: "#ffffff", // Ensure white background
                          color: "#333", // Dark text color
                          fontSize: "16px",
                          fontWeight: '500',
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
                    <Image src={"/svgIcons/infoIcon.svg"}
                      height={16} width={16} alt="*"
                    />
                  </Tooltip>
                  </div>
                    <div className="flex flex-row items-center gap-2">
                      {
                        delHireTeamLoader ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Switch
                            checked={allowHireTeam}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setAllowHireTeam(checked);

                              if (allowHireTeam === false) {
                                setAddHireTeam(true);
                              } else {
                                if (settingsData?.hireTeamUrl) {
                                  handleUserSettings("hireTeamDel")
                                } else {
                                  setHireTeam("");
                                  setAddHireTeam(false);
                                }
                              }
                            }}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: 'white',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#7902DF',
                              },
                            }}
                          />
                        )
                      }
                    </div>
                  </div>
                  {
                    settingsData?.hireTeamUrl && (
                      <div className='flex flex-row items-center justify-between w-full mt-2'>
                        <div style={styles.subHeading}>
                          URL: {settingsData?.hireTeamUrl || ""}
                        </div>
                        <button className="flex flex-row items-center gap-2" onClick={() => {
                          setAddHireTeam(true);
                        }}>
                          <div className="text-purple outline-none border-none rounded p-1 bg-white" style={{ fontSize: "16px", fontWeight: "400" }}>Edit</div>
                          <Image
                            alt="*"
                            src={"/assets/editPen.png"}
                            height={16}
                            width={16}
                          />
                        </button>
                      </div>
                    )}
                  {
                    addHireTeam && (
                      <div className="flex flex-row items-center justify-center gap-2 mb-2">
                        <div className="border border-gray-200 rounded px-2 py-0 flex flex-row items-center w-[90%]">
                          <input
                            style={styles.inputs}
                            type="text"
                            className={`w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none`}
                            placeholder="Enter your URL"
                            value={hireTeam}
                            onChange={(e) => {
                              const value = e.target.value;
                              const validUrl = isValidUrl(value);
                              setHireTeam(value);
                              setTimeout(() => {
                                if (value && !validUrl) {
                                  setIsInValidUrlHireTeam(true);
                                } else {
                                  setIsInValidUrlHireTeam(false);
                                }
                              }, 1000);
                            }}
                          />
                        </div>
                        {
                          addHireTeamLoader ? (
                            <div className="flex flex-row items-center justify-center w-[10%]">
                              <CircularProgress size={30} />
                            </div>
                          ) : (
                            <button
                              onClick={() => { handleUserSettings("hireTeam") }}
                              className={`w-[10%] h-[40px] rounded-xl ${isInValidUrlHireTeam || !hireTeam ? "bg-btngray text-black" : "bg-purple text-white"}`}
                              style={{ fontSize: "15px", fontWeight: "500" }}
                              disabled={isInValidUrlHireTeam || !hireTeam}
                            >
                              {isInValidUrlHireTeam ? "Invalid URL" : "Save"}
                            </button>
                          )
                        }
                      </div>
                    )
                  }
                </div>
              </div>
              <div>
                <div className='border rounded-lg px-4 py-2 bg-[#D9D9D917] mb-4 mt-4'>
                  <div className='flex flex-row items-center justify-between w-full'>
                    <div className='flex flex-row items-center gap-2'>
                    <div style={styles.subHeading}>
                      Billing and Support
                    </div>
                    <Tooltip
                    title="Allow your users to get help with billing."
                    arrow
                    componentsProps={{
                      tooltip: {
                        sx: {
                          backgroundColor: "#ffffff", // Ensure white background
                          color: "#333", // Dark text color
                          fontSize: "16px",
                          fontWeight: '500',
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
                    <Image src={"/svgIcons/infoIcon.svg"}
                      height={16} width={16} alt="*"
                    />
                  </Tooltip>
                  </div>
                    <div className="flex flex-row items-center gap-2">
                      {
                        delBillingAndSupportLoader ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Switch
                            checked={allowBillingAndSupport}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setAllowBillingAndSupport(checked);

                              if (allowBillingAndSupport === false) {
                                setAddBillingAndSupport(true);
                              } else {
                                if (settingsData?.billingAndSupportUrl) {
                                  handleUserSettings("billingAndSupportDel")
                                } else {
                                  setBillingAndSupport("");
                                  setAddBillingAndSupport(false);
                                }
                              }
                            }}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: 'white',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#7902DF',
                              },
                            }}
                          />
                        )
                      }
                    </div>
                  </div>
                  {
                    settingsData?.billingAndSupportUrl && (
                      <div className='flex flex-row items-center justify-between w-full mt-2'>
                        <div style={styles.subHeading}>
                          URL: {settingsData?.billingAndSupportUrl || ""}
                        </div>
                        <button className="flex flex-row items-center gap-2" onClick={() => {
                          setAddBillingAndSupport(true);
                        }}>
                          <div className="text-purple outline-none border-none rounded p-1 bg-white" style={{ fontSize: "16px", fontWeight: "400" }}>Edit</div>
                          <Image
                            alt="*"
                            src={"/assets/editPen.png"}
                            height={16}
                            width={16}
                          />
                        </button>
                      </div>
                    )
                  }
                  {
                    addBillingAndSupport && (
                      <div className="flex flex-row items-center justify-center gap-2 mb-2">
                        <div className="border border-gray-200 rounded px-2 py-0 flex flex-row items-center w-[90%]">
                          <input
                            style={styles.inputs}
                            type="text"
                            className={`w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none`}
                            placeholder="Enter your URL"
                            value={billingAndSupport}
                            onChange={(e) => {
                              const value = e.target.value;
                              const validUrl = isValidUrl(value);
                              setBillingAndSupport(value);
                              setTimeout(() => {
                                if (value && !validUrl) {
                                  setIsInValidUrlBillingAndSupport(true);
                                } else {
                                  setIsInValidUrlBillingAndSupport(false);
                                }
                              }, 400);
                            }}
                          />
                        </div>
                        {
                          addBillingAndSupportLoader ? (
                            <div className="flex flex-row items-center justify-center w-[10%]">
                              <CircularProgress size={30} />
                            </div>
                          ) : (
                            <button
                              onClick={() => { handleUserSettings("billingAndSupport") }}
                              className={`w-[10%] h-[40px] rounded-xl ${isInValidUrlBillingAndSupport || !billingAndSupport ? "bg-btngray text-black" : "bg-purple text-white"}`}
                              style={{ fontSize: "15px", fontWeight: "500" }}
                              disabled={isInValidUrlBillingAndSupport || !billingAndSupport}
                            >
                              {isInValidUrlBillingAndSupport ? "Invalid URL" : "Save"}
                            </button>
                          )
                        }
                      </div>
                    )
                  }
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default AgencySupportAndWidget


const styles = {
  heading: {
    fontWeight: "600", fontSize: 17
  },
  subHeading: {
    fontWeight: "500", fontSize: 15
  }
}