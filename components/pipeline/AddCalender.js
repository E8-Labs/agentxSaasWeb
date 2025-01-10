import React, { useEffect, useState } from "react";
import Header from "../onboarding/Header";
import Footer from "../onboarding/Footer";
import ProgressBar from "../onboarding/ProgressBar";
import { borderColor, Box } from "@mui/system";
import Apis from "../apis/Apis";
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
import timeZones from "@/utilities/Timezones";
import VideoCard from "../createagent/VideoCard";
import IntroVideoModal from "../createagent/IntroVideoModal";

const AddCalender = ({ handleContinue }) => {
  const [calenderLoader, setAddCalenderLoader] = useState(false);
  const [shouldContinue, setshouldContinue] = useState(true);

  const [calenderTitle, setCalenderTitle] = useState("");
  const [calenderApiKey, setCalenderApiKey] = useState("");
  const [eventId, setEventId] = useState("");

  const [selectCalender, setSelectCalender] = useState("");
  const [initialLoader, setInitialLoader] = useState(false);
  const [previousCalenders, setPreviousCalenders] = useState([]);
  const [showAddNewCalender, setShowAddNewCalender] = useState(false);
  const [introVideoModal, setIntroVideoModal] = useState(false);
  const [calendarSelected, setCalendarSelected] = useState(null);

  //code for the IANA time zone lists

  const [selectTimeZone, setSelectTimeZone] = useState("");

  useEffect(() => {
    getCalenders();
  }, []);

  // useEffect(() => {
  // if (calenderTitle && calenderApiKey && eventId && selectTimeZone) {
  // setshouldContinue(false);
  // } else {
  // setshouldContinue(true);
  // }
  // }, [calenderTitle, calenderApiKey, eventId, selectTimeZone]);

  function isEnabled() {
    if (calendarSelected) {
      console.log("True because calenarSelected");
      return true;
    }
    if (calenderTitle && calenderApiKey && eventId && selectTimeZone) {
      console.log("True because all values are there");
      return true;
    } else {
      console.log("false calenarSelected");
      return false;
    }
  }

  //code for the dropdown selection

  const handleChange = (event) => {
    setSelectCalender(event.target.value);
  };

  const getCalenders = async () => {
    try {
      setInitialLoader(true);

      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      console.log("Authtoken is:", AuthToken);

      const ApiPath = Apis.getCalenders;

      console.log("Apipath is:", ApiPath);

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        console.log("Response of get calender api is:", response);
        setPreviousCalenders(response.data.data);
      }
    } catch (error) {
      console.error("Error occured in the api is ", error);
    } finally {
      setInitialLoader(false);
    }
  };

  //code for calender api
  const handleAddCalender = async () => {
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
        console.log("Recieved from are :--", agentData);
        currentAgentDetails = agentData;
      }

      console.log("Auth token is:", AuthToken);
      const ApiPath = Apis.addCalender;
      console.log("Api path is:", ApiPath);

      const formData = new FormData();

      formData.append(
        "apiKey",
        calendarSelected ? calendarSelected.apiKey : calenderApiKey
      );
      formData.append(
        "title",
        calendarSelected ? calendarSelected.title : calenderTitle
      );
      formData.append("mainAgentId", currentAgentDetails.id);
      // if (selectTimeZone) {
      formData.append(
        "timeZone",
        calendarSelected ? calendarSelected.timeZone : selectTimeZone
      );
      // }

      // if (eventId) {
      formData.append(
        "eventId",
        calendarSelected ? calendarSelected.eventId : eventId
      );
      // }

      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
        },
      });

      if (response) {
        console.log("Response of add calender api is:", response.data.data);

        if (response.data.status === true) {
          handleContinue();
        }
      }
    } catch (error) {
      console.error("Error occured in api is:", error);
    } finally {
      setAddCalenderLoader(false);
    }
  };

  //code to select the time zone
  const handleChangeTimeZone = (event) => {
    setSelectTimeZone(event.target.value);
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
      className="overflow-y-none flex flex-row justify-center items-center"
    >
      <div className="bg-white rounded-2xl w-10/12 h-[91vh] py-4 flex flex-col">
        <div className="h-[100%]">
          <div className="h-[87%]">
            <div>
              <Header
                showSkip={true}
                handleContinue={handleContinue}
                shouldContinue={shouldContinue}
              />
            </div>

            <div>
              <div
                style={{ fontWeight: "700", fontSize: 38, textAlign: "center" }}
              // onClick={() => { handleAddCalender() }}
              >
                Add a Calendar
              </div>
              <div
                style={{
                  textAlign: "center",
                  marginTop: 4,
                  color: "#151515",
                  fontWeight: "500",
                }}
              >
                By adding a calendar, your agent will use this to book <br />{" "}
                meetings based on your availability.
              </div>
            </div>

            <div className="w-full flex flex-col w-full items-center">
              {
                previousCalenders.length > 0 ? (
                  <div className="w-6/12">
                    <FormControl sx={{ m: 1 }} className="w-full">
                      <Select
                        labelId="demo-select-small-label"
                        id="demo-select-small"
                        value={selectCalender}
                        // label="Age"
                        onChange={handleChange}
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
                        {/* <MenuItem value="">
 <em>None</em>
 </MenuItem> */}
                        {

                          previousCalenders.map((item, index) => {
                            return (
                              <MenuItem
                                className="w-full hover:bg-purple10 hover:text-black"
                                value={item.title}
                                key={index}
                                selected={selectCalender === item.title} // Apply "selected" to match the selected value
                                sx={{
                                  backgroundColor:
                                    selectCalender === item.title
                                      ? "#7902DF10"
                                      : "transparent", // Set background for selected item
                                  // color: selectCalender === item.title ? 'white' : 'inherit', // Change text color for selected item
                                  "&.Mui-selected": {
                                    backgroundColor: "#7902DF10", // Override background for selected item
                                    // color: 'white', // Change text color for selected item
                                  },
                                }}
                              >
                                <button
                                  className="w-full text-start"
                                  onClick={() => {
                                    console.log("Selected calender is:", item);
                                    setCalendarSelected(item);
                                    // setCalenderTitle(item.title);
                                    // setCalenderApiKey(item.apiKey);
                                    // setEventId(item.eventId);
                                    // setSelectTimeZone(item.timeZone);
                                  }}
                                >
                                  {item.title}
                                </button>
                              </MenuItem>
                            );
                          })
                        }
                        <MenuItem className="w-full" value="Custom Calender">
                          <button
                            className="text-purple underline w-full text-start"
                            onClick={() => {
                              console.log("Show show the modal");
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
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center mt-5 gap-3">
                    <Image src={'svgIcons/noCalenderIcon.svg'} height={100} width={113} alt="No Calender" />

                    <div style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>
                      No Calendar added
                    </div>

                    <div style={{ fontSize: 12, fontWeight: '300', color: '#000', width: 140, textAlign: 'center' }}>
                      please add a calendar. to lorem ipsum dor miset
                    </div>

                    <button className="flex items-center justify-center h-[50px] w-[200px] text-white rounded-xl bg-purple" onClick={() => setShowAddNewCalender(true)}>
                      + Add Calender
                    </button>
                  </div>
                )}
            </div>
          </div>

          <div className="h-[13%]">
            <ProgressBar value={33} />
            <Footer
              handleContinue={handleAddCalender}
              donotShowBack={true}
              registerLoader={calenderLoader}
              shouldContinue={!isEnabled()}
            />
          </div>
        </div>
        {/* Modal for video */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            translate: "-50%",
            left: "14%",
            top: "20%",
          }}
        >
          <VideoCard
            horizontal={false}
            playVideo={() => {
              setIntroVideoModal(true);
            }}
            title="Learn how to add a calendar"
          />
        </div>
        <IntroVideoModal
          open={introVideoModal}
          onClose={() => setIntroVideoModal(false)}
          videoTitle="Learn more about assigning leads"
          videoUrl="https://drive.google.com/file/d/1tXG1yC7u3yKWqhZ8HBtdJUmBx0KCWzRV/view?usp=share_link"
        />
        {/* Modal to add custom calender */}

        <Modal
          open={showAddNewCalender}
        // onClose={() => {
        // setShowAddNewCalender(false);
        // }}
        >
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
                              <button
                                onClick={() => {
                                  console.log("Selected time zone is:", item);
                                }}
                              >
                                {item}
                              </button>
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </div>

                  <div className="w-full mt-4">
                    {calenderLoader ? (
                      <div>
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
                        onClick={handleAddCalender}
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
      </div>
    </div>
  );
};

export default AddCalender;


