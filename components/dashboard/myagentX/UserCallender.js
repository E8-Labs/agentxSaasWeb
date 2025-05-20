import React, { useEffect, useState } from "react";
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
import { HowtoVideos } from "@/constants/Constants";

const UserCalender = ({
  calendarDetails,
  setUserDetails,
  previousCalenders,
  selectedAgent,
  updateVariableData,
}) => {
  const [agent, setAgent] = useState(selectedAgent);
  const [calenderLoader, setAddCalenderLoader] = useState(false);
  const [shouldContinue, setshouldContinue] = useState(true);

  const [calenderTitle, setCalenderTitle] = useState("");
  const [calenderApiKey, setCalenderApiKey] = useState("");
  const [eventId, setEventId] = useState("");

  const [selectedCalenderTitle, setSelectedCalenderTitle] = useState("");
  const [selectCalender, setSelectCalender] = useState("");
  const [initialLoader, setInitialLoader] = useState(false);
  //intro video modla
  const [introVideoModal2, setIntroVideoModal2] = useState(false);

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

  //code for the IANA time zone lists

  const [selectTimeZone, setSelectTimeZone] = useState("");

  const [showDelBtn, setShowDelBtn] = useState(false);
  const [showDelPopup, setShowDelPopup] = useState(false);
  const [calenderDelLoader, setCalenderDelLoader] = useState(null);

  // const [timeZones, setTimeZones] = useState([]);
  useEffect(() => {
    setAllCalendars(previousCalenders);
    console.log("Previous calendars passed", previousCalenders);
    if (selectedAgent?.calendar) {
      //console.log;
      setSelectCalender(selectedAgent.calendar);
      console.log(
        "Selected agent passed on calendar side",
        selectedAgent.calendar
      );
      setSelectedCalenderTitle(selectedAgent.calendar?.id || "");
    } else {
      //console.log;
    }
    // getCalenders();
  }, []);

  useEffect(() => {
    //console.log;
  }, [selectCalender]);

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

  //code for add calender api
  const handleAddCalender = async (calendar) => {
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

      // formData.append("apiKey", calendar ? calendar.apiKey : calenderApiKey); //|| calenderApiKey
      // formData.append("title", calendar ? calendar.title : calenderTitle); //|| calenderTitle
      // formData.append("mainAgentId", calendarDetails.id);
      // formData.append("timeZone", calendar ? calendar.timeZone : selectTimeZone) //|| selectTimeZone
      // formData.append("eventId", calendar ? calendar.eventId : eventId); //|| eventId
      // formData.append("agentId", selectedAgent.id);

      formData.append("apiKey", calendar.apiKey || calenderApiKey); //|| calenderApiKey
      formData.append("title", calendar.title || calenderTitle); //|| calenderTitle
      formData.append("mainAgentId", calendarDetails.id);
      formData.append("timeZone", calendar.timeZone || selectTimeZone); //|| selectTimeZone
      formData.append("eventId", calendar.eventId || eventId); //|| eventId
      formData.append("agentId", selectedAgent.id);

      for (let [key, value] of formData.entries()) {
        //console.log;
      }

      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
        },
      });

      if (response) {
        //console.log;
        if (calendar) {
          setIsVisible2(true);
        } else {
          setIsVisible(true);
        }
        if (response.data.status === true) {
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

            setAgent(selecAgent);
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
                      //console.log;
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
                      if (cals && cals.length == 1) {
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
                          // //console.log;
                          setCalendarSelected(null);
                          // setCalenderTitle("");
                          // setCalenderApiKey("");
                          // setEventId("");
                          // setSelectTimeZone("");
                          setShowAddNewCalender(true);
                        }}
                      >
                        Add New Calender
                      </button>
                    </MenuItem>
                  </Select>
                </FormControl>
              )}
            </div>
            <VideoCard
              duration="2 min 42 sec"
              horizontal={false}
              playVideo={() => {
                setIntroVideoModal2(true);
              }}
              title="Learn how to add a calendar"
            />
            <IntroVideoModal
              open={introVideoModal2}
              onClose={() => setIntroVideoModal2(false)}
              videoTitle="Learn how to add a calendar"
              videoUrl={HowtoVideos.Calendar}
            />
            {/* <div className='w-full mt-4'>
                                {
                                    calenderLoader ?
                                        <div className='w-full flex flex-row items-center justify-center'>
                                            <CircularProgress size={25} />
                                        </div> :
                                        <button
                                            disabled={!isEnabled()}
                                            className='h-[50px] w-full text-white rounded-xl'
                                            style={{
                                                fontWeight: "600", fontSize: 16,
                                                backgroundColor: !isEnabled() ? "#00000060" : "#7902DF"
                                            }}
                                            onClick={handleAddCalender}
                                        >
                                            Add
                                        </button>
                                }
                            </div> */}
          </div>
        ) : (
          <NoCalendarView
            showVideo={true}
            addCalendarAction={() => {
              // //console.log;
              setShowAddNewCalender(true);
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
            <div style={{ width: "100%" }}>
              <div className="" style={{ scrollbarWidth: "none" }}>
                <div className="w-full">
                  <div className="w-full flex flex-row justify-end">
                    <button
                      className="outline-none"
                      onClick={() => {
                        setShowAddNewCalender(false);
                        setCalenderTitle("");
                        setCalenderApiKey("");
                        setEventId("");
                        setSelectTimeZone("");
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
                    className="mt-4"
                    style={{
                      fontWeight: "600",
                      fontSize: 16.8,
                      textAlign: "start",
                    }}
                  >
                    Calender title
                  </div>
                  <div>
                    <input
                      className="w-full rounded-xl h-[50px] outline-none focus:ring-0 p-2 mt-1"
                      placeholder="Type here"
                      style={styles.inputStyles}
                      value={calenderTitle}
                      onChange={(e) => {
                        let value = e.target.value;
                        setCalenderTitle(value);
                      }}
                    />
                  </div>
                  <div
                    className="mt-4"
                    style={{
                      fontWeight: "600",
                      fontSize: 16.8,
                      textAlign: "start",
                    }}
                  >
                    Api key
                  </div>
                  <div>
                    <input
                      className="w-full rounded-xl h-[50px] outline-none focus:ring-0 p-2 mt-1"
                      placeholder="Type here"
                      style={styles.inputStyles}
                      value={calenderApiKey}
                      onChange={(e) => {
                        let value = e.target.value;
                        setCalenderApiKey(value);
                      }}
                    />
                  </div>
                  <div
                    className="mt-4"
                    style={{
                      fontWeight: "600",
                      fontSize: 16.8,
                      textAlign: "start",
                    }}
                  >
                    Event id
                  </div>
                  <div>
                    <input
                      className="w-full rounded-xl h-[50px] outline-none focus:ring-0 p-2 mt-1"
                      placeholder="Type here"
                      style={styles.inputStyles}
                      value={eventId}
                      onChange={(e) => {
                        let value = e.target.value;
                        setEventId(value);
                      }}
                    />
                  </div>

                  <div
                    className="mt-4"
                    style={{
                      fontWeight: "600",
                      fontSize: 16.8,
                      textAlign: "start",
                    }}
                  >
                    Select timezone
                  </div>

                  <div className="w-full mt-2">
                    <FormControl sx={{}} className="w-full h-[50px]">
                      <Select
                        value={selectTimeZone}
                        // label="Age"
                        onChange={handleChangeTimeZone}
                        displayEmpty // Enables placeholder
                        renderValue={(selected) => {
                          if (!selected) {
                            return <div style={{ color: "#aaa" }}>Select</div>; // Placeholder style
                          }
                          return selected;
                        }}
                        sx={{
                          height: "48px",
                          borderRadius: "13px",
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
                        {timeZones.map((item, index) => {
                          return (
                            <MenuItem
                              className="w-full"
                              value={item}
                              key={index}
                            >
                              <button onClick={() => {}}>{item}</button>
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </div>

                  <div className="w-full mt-4">
                    {calenderLoader ? (
                      <div className="w-full flex flex-row items-center justify-center">
                        <CircularProgress size={25} />
                      </div>
                    ) : (
                      <button
                        disabled={!isEnabled()}
                        className="h-[50px] w-full text-white rounded-xl"
                        style={{
                          fontWeight: "600",
                          fontSize: 16,
                          backgroundColor: !isEnabled()
                            ? "#00000020"
                            : "#7902DF",
                          color: !isEnabled() ? "#000000" : "",
                        }}
                        onClick={() => {
                          let calendar = {
                            apiKey: calenderApiKey,
                            eventId: eventId,
                            timeZone: selectTimeZone,
                          };
                          handleAddCalender(calendar);
                        }}
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
