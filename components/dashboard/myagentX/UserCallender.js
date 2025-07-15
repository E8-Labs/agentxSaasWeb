import React, { useEffect, useRef, useState } from "react";
import Header from "@/components/onboarding/Header";
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
import { signIn, signOut } from "next-auth/react";
import CalendarModal from "@/components/dashboard/myagentX/CalenderModal";

const UserCalender = ({
  calendarDetails,
  setUserDetails,
  previousCalenders,
  selectedAgent,
  updateVariableData,
  selectedUser,
  loadingCalenders = false,
}) => {

  const justLoggedIn = useRef(false);

  console.log("calender passed is", previousCalenders);



  const [agent, setAgent] = useState(selectedAgent);
  const [calenderLoader, setAddCalenderLoader] = useState(false);
  const [googleCalenderLoader, setGoogleCalenderLoader] = useState(false);
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
    // return
    try {
      if (calendar?.isFromAddGoogleCal) {
        console.log("Is from google cal", calendar?.isFromAddGoogleCal);
        setGoogleCalenderLoader(true);
      } else {
        console.log("Is not from google cal");
        setAddCalenderLoader(true);
      }

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
        // formData.append("title", calendar.title);
        formData.append("calendarType", "google");
        // formData.append("mainAgentId", "");
        formData.append("agentId", selectedAgent?.id);
        formData.append("accessToken", calendar.accessToken);
        formData.append("refreshToken", calendar.refreshToken);
        formData.append("scope", "openid email profile https://www.googleapis.com/auth/calendar");
        formData.append("expiryDate", calendar.expiryDate);
        // formData.append("googleUserId", calendar.id); // here google id was undefined
        formData.append("googleUserId", calendar.googleUserId);
        formData.append("email", calendar.email);
        formData.append("title", calendar.calenderTitle);
        formData.append("timeZone", calendar.selectTimeZone);
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
            // let calendars = allCalendars.filter(
            //   (item) => item.apiKey != newCalendarData.apiKey
            // );
            let selecAgent = { ...agent, calendar: newCalendarData };

            setAgent(selecAgent); // Now this triggers useEffect
            // setAllCalendars([...allCalendars, newCalendarData]);
            setAllCalendars([newCalendarData, ...allCalendars]);
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
      setMessage(error.message);
      setType(SnackbarTypes.Error);
      console.error("Error occured in api is:", error);
    } finally {
      setAddCalenderLoader(false);
      setGoogleCalenderLoader(false);
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

      <div className="flex flex-col w-full gap-3">
        <div className="text-[15px] font-[500] ">
          Calendar
        </div>

        <div className="flex flex-col h-[15vh] overflow-y-auto gap-4">

          {
            allCalendars.map((item) => (
              <button key={item.id} className="w-full" onClick={() => {
                // setCalendarSelected(item);
                // setSelectCalender(item);
                // handleAddCalender(item);
              }}>
                <div className="flex flex-row items-center justify-between w-full">
                  <div className="flex flex-col items-start ">
                    <div className="text-[15px] font-[500] ">
                      {item.title}
                    </div>
                    <div className="text-[15px] font-[400] text-gray-500">
                      API Key: <span
                        className="text-black font-[500]"
                      >{item.apiKey ? "*****" + item.apiKey.slice(-10) : "-"}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end ">
                    <div className="text-[15px] font-[400] text-gray-500">
                      Event ID: <span
                        className="text-black font-[500]"
                      >{item.eventId ? item.eventId : "-"}</span>
                    </div>

                    {
                      setCalenderDelLoader === item ? (
                        <CircularProgress size={20} />
                      ) : (
                        <button className="text-[15px] font-[500] text-red" onClick={() => handleDeleteCalendar(item)}>
                          Delete
                        </button>
                      )
                    }

                  </div>
                </div>
              </button>
            ))
          }
        </div>

        <div className="flex flex-row items-center justify-between w-full">
          <div className="text-[15px] font-[500] ">
            MCP
          </div>


          <button className="text-[15px] font-[500] text-purple" >
            + Add MCP
          </button>

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

            </Select>
          </FormControl>

        </div>
      </div>



    </div>
  );
};

export default UserCalender;
