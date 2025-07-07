import React, { useEffect, useRef, useState } from "react";
import Header from "@/components/onboarding/Header";
import Footer from "@/components/onboarding/Footer";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { borderColor, Box } from "@mui/system";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import {
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
} from "@mui/material";
import Image from "next/image";
import NoCalendarView from "./NoCalendarView";
import timeZones from "@/utilities/Timezones";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "../leads/AgentSelectSnackMessage";
import CircularLoader from "@/utilities/CircularLoader";
import VideoCard from "@/components/createagent/VideoCard";
import IntroVideoModal from "@/components/createagent/IntroVideoModal";
import { HowtoVideos, PersistanceKeys } from "@/constants/Constants";
import { SelectAll } from "@mui/icons-material";
import AskSkyConfirmation from "@/components/dashboard/myagentX/CalenderModal";
import { signIn, signOut, useSession } from "next-auth/react";
import { getSession } from "next-auth/react";
import CalendarModal from "@/components/dashboard/myagentX/CalenderModal";

const UserCalender = ({
  calendarDetails,
  setUserDetails,
  previousCalenders,
  selectedAgent,
  updateVariableData,
  selectedUser
}) => {

  const justLoggedIn = useRef(false);

  const [agent, setAgent] = useState(selectedAgent);
  const [calenderLoader, setAddCalenderLoader] = useState(false);
  const [shouldContinue, setshouldContinue] = useState(true);

  const [calenderTitle, setCalenderTitle] = useState("");
  const [calenderApiKey, setCalenderApiKey] = useState("");
  const [eventId, setEventId] = useState("");

  const [selectedCalenderTitle, setSelectedCalenderTitle] = useState("");
  const [selectCalender, setSelectCalender] = useState("");
  const [initialLoader, setInitialLoader] = useState(false);

  const [showAddNewCalender, setShowAddNewCalender] = useState(false);
  const [calendarToDelete, setCalendarToDelete] = useState(null);

  //all calenders
  const [allCalendars, setAllCalendars] = useState([]);

  //variables for snack bar
  const [message, setMessage] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [type, setType] = useState(null);

  const [calendarSelected, setCalendarSelected] = useState(null);
  const [showCalendarConfirmation, setShowCalendarConfirmation] = useState(false);
  const [addGoogleCalendar, setAddGoogleCalendar] = useState(false);

  //code for the IANA time zone lists

  const [selectTimeZone, setSelectTimeZone] = useState("");

  const [showDelBtn, setShowDelBtn] = useState(false);
  const [showDelPopup, setShowDelPopup] = useState(false);
  const [calenderDelLoader, setCalenderDelLoader] = useState(null);

  //video card
  const [introVideoModal2, setIntroVideoModal2] = useState(false);

  //get the calendar sessions
  const { data: session, status } = useSession();

  useEffect(() => {
    setAllCalendars(previousCalenders);
    console.log("Selected agent ", selectedAgent);
    if (selectedAgent?.calendar) {
      //console.log;
      setSelectCalender(selectedAgent.calendar);
      setSelectedCalenderTitle(selectedAgent.calendar?.id || "");
    } else {
      //console.log;
    }
    // getCalenders();
  }, []);

  useEffect(() => {
    setAgent(selectedAgent);
  }, [selectedAgent]);

  useEffect(() => {
    //console.log;
  }, [selectCalender]);

  useEffect(() => {
    console.log("Agent changed ", agent);
  }, [agent]);

  // useEffect(() => {
  //   if (calenderTitle && calenderApiKey && eventId && selectTimeZone) {
  //     setshouldContinue(false);
  //   } else {
  //     setshouldContinue(true);
  //   }
  // }, [calenderTitle, calenderApiKey, eventId, selectTimeZone]);

  const pollSessionAndTriggerCallback = async (retries = 10, interval = 500) => {
    for (let i = 0; i < retries; i++) {
      const session = await getSession();
      if (session?.accessToken) {
        console.log("🎯 Session is ready after login", session);
        handleAfterLogin(session); // 🔥 call your custom logic
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    console.warn("⚠️ Timed out waiting for session after login.");
  };

  const handleAfterLogin = (session) => {
    console.log("👉 Session after login:", session);
    // Add your custom logic here: open calendar modal, call API, etc.
  };


  function isEnabled() {
    if (calendarSelected) {
      // //console.log;
      return true;
    }
    if (calenderTitle && calenderApiKey && eventId && selectTimeZone) {
      // //console.log;
      return true;
    } else {
      // //console.log;
      return false;
    }
  }

  //code for the dropdown selection

  const handleChange = (event) => {
    //console.log;
    // setSelectCalender(event.target.value);
    //console.log;
  };



  //code to select the time zone
  const handleChangeTimeZone = (event) => {
    setSelectTimeZone(event.target.value);
  };

  const handleDeleteCalendar = async () => {
    setCalenderDelLoader(calendarToDelete);
    try {
      const data = localStorage.getItem("User");

      if (data) {
        let u = JSON.parse(data);
        //console.log;
        // return
        let apiData = {
          apiKey: calendarToDelete.apiKey,
        };
        //console.log;
        // return;

        let path = Apis.deleteCalendar;

        const response = await axios.post(path, apiData, {
          headers: {
            Authorization: "Bearer " + u.token,
            "Content-Type": "application/json",
          },
        });
        // setCalendarToDelete(null)
        setCalenderDelLoader(null);

        if (response.data.status === true) {
          //console.log;
          let newCalList = allCalendars.filter(
            (item) => item.apiKey != calendarToDelete.apiKey
          );
          setShowDelPopup(false);
          setAllCalendars(newCalList);
          setCalendarToDelete(null);
          setIsVisible(true);
          setMessage("Calendar deleted");
          setType(SnackbarTypes.Success);
          updateVariableData();
        } else {
          //console.log;
          setIsVisible(true);
          setMessage(response.data.message);
          setType(SnackbarTypes.Error);
        }
      }
    } catch (e) {
      //console.log;
    } finally {
      setCalenderDelLoader(null);
    }
  };

  //code for add calender api
  const handleAddCalender = async (calendar) => {
    console.log("Calendar details passed from addgoogle calednar", calendar);
    if (calendar?.isFromAddGoogleCal) {
      console.log("Is from google cal", calendar?.isFromAddGoogleCal);
    } else {
      console.log("Is not from google cal");
    }
    // return
    try {
      setAddCalenderLoader(true);

      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      let currentAgentDetails = null;

      const agentDetails = localStorage.getItem("agentDetails");
      if (agentDetails) {
        const agentData = JSON.parse(agentDetails);
        // //console.log;
        currentAgentDetails = agentData;
      }

      // //console.log;
      const ApiPath = Apis.addCalender;
      // //console.log;

      const formData = new FormData();

      // console.log(`Apikey == ${calenderApiKey}; Title == ${calenderTitle}; TimeZone == ${selectTimeZone}`);

      if (calendar?.isFromAddGoogleCal) {
        formData.append("title", calendar.title);
        formData.append("calendarType", "google");
        // formData.append("mainAgentId", "");
        formData.append("agentId", selectedAgent?.id);
        formData.append("accessToken", calendar.accessToken);
        formData.append("refreshToken", calendar.refreshToken);
        formData.append("scope", "openid email profile https://www.googleapis.com/auth/calendar");
        formData.append("expiryDate", calendar.expiryDate);
        // formData.append("googleUserId", calendar.id); // here google id was undefined
        formData.append("googleUserId", calendar.googleUserId);
      } else {
        formData.append("apiKey", calendar?.apiKey || calenderApiKey);
        formData.append("title", calendar?.title || calenderTitle);
        formData.append("timeZone", calendar?.timeZone || selectTimeZone);
        if (calendar?.id) {
          // formData.append("mainAgentId", calendarDetails.id);
          formData.append("calendarId", calendar?.id); //|| selected calendar id
          console.log("Sending calendar id ", calendar?.id);
        }
        formData.append("eventId", calendar?.eventId || eventId); //|| eventId

        if (selectedUser) {
          formData.append("userId", selectedUser?.id);
        }
        if (selectedAgent) {
          formData.append("agentId", selectedAgent?.id);
        }
      }



      for (let [key, value] of formData.entries()) {
        console.log(`${key} ===== ${value}`);
      }

      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
        },
      });

      if (response) {
        console.log("add calendar response is", response.data);
        if (calendar) {
          setIsVisible2(true);
        } else {
          setIsVisible(true);
        }
        if (response.data.status === true) {
          setShowCalendarConfirmation(false);
          setType(SnackbarTypes.Success);
          setMessage("Calender added");

          const localAgentsList = localStorage.getItem("localAgentDetails");

          if (localAgentsList) {
            const agentsList = JSON.parse(localAgentsList);
            // agentsListDetails = agentsList;

            const newCalendarData = response.data.data;
            let calendars = allCalendars.filter(
              (item) => item.apiKey != newCalendarData.apiKey
            );
            let selecAgent = { ...agent, calendar: newCalendarData };

            setAgent(selecAgent); // Now this triggers useEffect
            setAllCalendars([...calendars, newCalendarData]);
            setSelectCalender(newCalendarData);
            setSelectedCalenderTitle(newCalendarData?.id);

            let updatedArray = [];

            for (let i = 0; i < agentsList.length; i++) {
              let ag = agentsList[i];
              // console.log(
              //   `Comparing ${ag.id} = ${newCalendarData.mainAgentId}`
              // );
              if (ag.agents.length > 0) {
                if (ag.agents[0].id == selectedAgent.id) {
                  ag.agents[0].calendar = newCalendarData;
                }
              }
              if (ag.agents.length > 1) {
                if (ag.agents[1].id == selectedAgent.id) {
                  ag.agents[1].calendar = newCalendarData;
                }
              }

              updatedArray.push(ag);
            }

            //console.log;
            localStorage.setItem(
              "localAgentDetails",
              JSON.stringify(updatedArray)
            );
            updateVariableData();
            setUserDetails(updatedArray);
            setShowAddNewCalender(false);
            setShowAddNewCalender(false);
            // agentsListDetails = updatedArray
          }
        } else if (response.data.status === false) {
          setIsVisible(true);
          setMessage(response.data.message);
          setShowAddNewCalender(false);
          setType(SnackbarTypes.Error);
        }
      }
    } catch (error) {
      setIsVisible(true);
      setMessage(error);
      setType(SnackbarTypes.Error);
      console.error("Error occured in api is:", error);
    } finally {
      setAddCalenderLoader(false);
    }
  };



  const styles = {
    inputStyles: {
      fontWeight: "500",
      fontSize: 15,
      borderColor: "#00000020",
    },
    modalsStyle: {
      height: "auto",
      bgcolor: "transparent",
      p: 2,
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
      className="overflow-y-none flex flex-row justify-center items-center "
    >
      {isVisible && (
        <AgentSelectSnackMessage
          type={type}
          message={message}
          isVisible={isVisible}
          hide={() => {
            setIsVisible(false);
          }}
        />
      )}

      {isVisible2 && (
        <AgentSelectSnackMessage
          type={type}
          message={message}
          isVisible={true}
          hide={() => {
            setIsVisible2(false);
          }}
        />
      )}

      <div className="bg-white rounded-2xl w-full h-[90vh] py-4 flex flex-col">
        {selectedAgent?.calendar || allCalendars.length > 0 ? (
          <div className="w-full flex flex-col w-full items-center">
            <div className="w-full">
              {calenderLoader ? (
                <div className="w-full flex flex-row justify-center">
                  <CircularProgress size={30} />
                </div>
              ) : (
                <FormControl sx={{ m: 1 }} className="w-full">
                  <Select
                    labelId="demo-select-small-label"
                    id="demo-select-small"
                    value={selectedCalenderTitle}
                    // label="Age"
                    // onChange={handleChange}
                    displayEmpty // Enables placeholder
                    renderValue={(selected) => {
                      console.log("Selected Render ", selected);
                      if (!selected) {
                        return <div style={{ color: "#aaa" }}>Select</div>; // Placeholder style
                      }
                      let cals = allCalendars.filter((item) => {
                        return (
                          item.title == agent?.calendar?.title &&
                          item.apiKey == agent?.calendar?.apiKey &&
                          item.eventId == agent?.calendar?.eventId
                        );
                      });
                      //console.log;
                      let cal = null;
                      if (cals && cals.length >= 1) {
                        cal = cals[0];
                      }
                      return cal?.title || "";
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
                    {allCalendars.map((item, index) => (
                      <MenuItem
                        key={index}
                        value={item.title}
                        className="hover:bg-purple10 hover:text-black"
                        sx={{
                          backgroundColor:
                            selectCalender.id === item.id
                              ? "#7902DF10"
                              : "transparent",
                          "&.Mui-selected": {
                            backgroundColor: "#7902DF10",
                          },
                        }}
                        onMouseEnter={() => setShowDelBtn(item)} // Track hovered item
                        onMouseLeave={() => setShowDelBtn(null)} // Hide button when not hovering
                      >
                        <div className="w-full flex flex-row items-center justify-between">
                          {/* Calendar Name */}
                          <button
                            className="w-full text-start"
                            onClick={() => {
                              setCalendarSelected(item);
                              setSelectCalender(item);
                              handleAddCalender(item);
                            }}
                            style={{ flexGrow: 1, textAlign: "left" }}
                          >
                            {item.title}
                          </button>

                          {/* Delete Button (Only Show on Hover) */}
                          {showDelBtn?.id === item.id && (
                            // (calenderDelLoader &&
                            // calendarToDelete?.id === item.id ? (
                            //   <CircularProgress size={25} />
                            // ) :
                            <button
                              onClick={(e) => {
                                // e.stopPropagation(); // Prevents dropdown from closing
                                // setSelectCalender(item);
                                setCalenderDelLoader(null);
                                setCalendarToDelete(item);
                                setShowDelPopup(true);
                              }}
                              className="transition-opacity px-2"
                              style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "#7902df",
                                fontWeight: "500",
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </MenuItem>
                    ))}

                    <MenuItem className="w-full" value="Custom Calender">
                      <button
                        className="text-purple underline w-full text-start"
                        onClick={() => {
                          // setCalendarSelected(null);
                          // setShowAddNewCalender(true);
                          setShowCalendarConfirmation(true);
                        }}
                      >
                        Add New Calender
                      </button>
                    </MenuItem>
                  </Select>
                </FormControl>
              )}
            </div>

            {/* Confirmation to add google calendar or cal.com */}
            <CalendarModal
              open={showCalendarConfirmation}
              selectedAgent={selectedAgent}
              onClose={() => {
                setShowCalendarConfirmation(false);
              }}
              calenderLoader={calenderLoader}
              calendarSelected={calendarSelected}
              handleAddCalendar = {handleAddCalender}
              calenderTitle = {calenderTitle}
              setCalenderTitle = {setCalenderTitle}
              calenderApiKey = {calenderApiKey}
              setCalenderApiKey = {setCalenderApiKey}
              setEventId = {setEventId}
              eventId = {eventId}
              selectTimeZone = {selectTimeZone}
              setSelectTimeZone = {setSelectTimeZone}
            />

            {/* video modal to add calendar */}
            <div className="mt-6">
              <VideoCard
                duration="2 min 42 sec"
                horizontal={false}
                playVideo={() => {
                  setIntroVideoModal2(true);
                }}
                title="Learn how to add a calendar"
              />
            </div>

            {/* Intro modal */}
            <IntroVideoModal
              open={introVideoModal2}
              onClose={() => setIntroVideoModal2(false)}
              videoTitle="Learn how to add a calendar"
              videoUrl={HowtoVideos.Calendar}
            />

          </div>
        ) : (
          <NoCalendarView
            showVideo={true}
            addCalendarAction={() => {
              // //console.log;
              setShowCalendarConfirmation(true);
            }}
          />
        )}

        {/* Modal to add custom calender */}
        <Modal open={showAddNewCalender}>
          <Box
            className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12"
            sx={{
              ...styles.modalsStyle,
              backgroundColor: "white",
              paddingInline: "25px",
              paddingTop: "25px",
              paddingBottom: "30px",
            }}
          >

          </Box>
        </Modal>

        {/* Delete calendar popup */}

        <Modal
          open={showDelPopup}
          onClose={() => setShowDelPopup(false)}
          closeAfterTransition
          BackdropProps={{
            timeout: 1000,
            sx: {
              backgroundColor: "#00000020",
              // //backdropFilter: "blur(5px)",
            },
          }}
        >
          <Box className="lg:w-4/12 sm:w-4/12 w-6/12" sx={styles.modalsStyle}>
            <div className="flex flex-row justify-center w-full">
              <div
                className="w-full"
                style={{
                  backgroundColor: "#ffffff",
                  padding: 20,
                  borderRadius: "13px",
                }}
              >
                <div className="font-bold text-xl mt-6">
                  Are you sure you want to delete this calendar
                </div>
                <div className="flex flex-row items-center gap-4 w-full mt-6 mb-6">
                  <button
                    className="w-1/2 font-bold text-xl border border-[#00000020] rounded-xl h-[50px]"
                    onClick={() => {
                      setShowDelPopup(false);
                    }}
                  >
                    Cancel
                  </button>
                  {calenderDelLoader ? (
                    <div className="flex justify-center items-center w-1/2 text-red font-bold text-xl border border-[#00000020] rounded-xl h-[50px]">
                      <CircularProgress size={25} />
                    </div>
                  ) : (
                    <button
                      className="w-1/2 text-red font-bold text-xl border border-[#00000020] rounded-xl h-[50px]"
                      onClick={() => {
                        handleDeleteCalendar();
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default UserCalender;
