import Apis from "@/components/apis/Apis";
import {
  Box,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Modal,
  Radio,
  RadioGroup,
  Switch,
  Typography,
} from "@mui/material";
import { CalendarDots, CaretLeft } from "@phosphor-icons/react";
import axios from "axios";
import moment from "moment";
import Image from "next/image";
import React, { use, useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import AgentSelectSnackMessage from "./AgentSelectSnackMessage";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs"; // Import Day.js
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getAgentImage } from "@/utilities/agentUtilities";

dayjs.extend(utc);
dayjs.extend(timezone);

const AssignLead = ({
  leadIs,
  handleCloseAssignLeadModal,
  selectedAll = false,
  filters = null,
  totalLeads = 0,
  userProfile, // this is the .user object doesn't include token
}) => {
  const [initialLoader, setInitialLoader] = useState(false);
  const [agentsList, setAgentsList] = useState([]);
  const [stages, setStages] = useState([]);
  const [SelectedAgents, setSelectedAgents] = useState([]);
  const [CannotAssignLeadModal, setCannotAssignLeadModal] = useState(false);
  const [loader, setLoader] = useState(false);
  const [lastStepModal, setLastStepModal] = useState(false);
  const [ShouldContinue, setShouldContinue] = useState(false);
  const [NoOfLeadsToSend, setNoOfLeadsToSend] = useState("");
  const [customLeadsToSend, setCustomLeadsToSend] = useState("");
  const [isFocustedCustomLeads, setisFocustedCustomLeads] = useState("");
  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(dayjs());
  const [CallNow, setCallNow] = useState("");
  const [CallLater, setCallLater] = useState(false);

  const [invalidTimeMessage, setInvalidTimeMessage] = useState(null);

  //new code by salman
  const [errorMessage, setErrorMessage] = useState(null);
  const [errTitle, setErrTitle] = useState(null);
  const SelectAgentErrorTimeout = 4000; //change this to change the duration of the snack timer

  const [hasUserSelectedDate, setHasUserSelectedDate] = useState(false);
  const [isDncChecked, setIsDncChecked] = useState(false);

  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setErrorMessage(null);
        setErrTitle(null);
      }, SelectAgentErrorTimeout);
    }
  }, [errorMessage]);

  // useEffect(() => {
  //     let NewList = [];
  //     item.agents.forEach((agent) => {
  //         if (agent.agentType !== "inbound") {
  //             NewList.push(agent);
  //         }
  //     });
  // })

  useEffect(() => {
    if (SelectedAgents.length === 0) {
      setShouldContinue(true);
    }

    // if (ShouldContinue === true) {
    //    // console.log(
    //         "hit"
    //     )
    //     setShouldContinue(false);
    // } else {
    //     setShouldContinue(true);
    // }
  }, [SelectedAgents]);

  useEffect(() => {
    // console.log("Leads asigned are :", leadIs);

    let agentsList = [];

    const localAgents = localStorage.getItem("localAgentDetails");
    if (localAgents) {
      agentsList = JSON.parse(localAgents);
      // console.log("Agents got from local host are", agentsList);
      let newAgenstList = [];

      newAgenstList = agentsList.filter((mainAgent) => {
        // Check if all subagents are either outbound or both inbound and outbound
        const subAgents = mainAgent.agents;
        const hasOutbound = subAgents.some(
          (item) => item.agentType === "outbound"
        );
        const hasInbound = subAgents.some(
          (item) => item.agentType === "inbound"
        );

        // Keep the main agent if it has only outbound agents or both inbound and outbound agents
        return hasOutbound && (!hasInbound || hasInbound);
      });

      // console.log("Filtered agents list is", newAgenstList);

      setAgentsList(newAgenstList);
      setStages(newAgenstList.stages);
    }
    // else {
    // console.log("Agents got from api");
    getAgents();
    // }
  }, []);

  useEffect(() => {
    // console.log("Assigned agent is", SelectedAgents);
  }, [SelectedAgents]);

  //get agents api
  const getAgents = async () => {
    try {
      const checkLocalAgentsList = localStorage.getItem("localAgentDetails");
      if (!checkLocalAgentsList) {
        setInitialLoader(true);
      }
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
        // console.log("USer details are :", UserDetails);
      }

      // console.log("Auth token is :--", AuthToken);

      const ApiPath = Apis.getAgents;
      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        console.log("Response of get agents api is:", response.data);
        localStorage.setItem(
          "localAgentDetails",
          JSON.stringify(response.data.data)
        );
        // let filterredAgentsList = [];
        //// console.log("Parsed data is", JSON.parse(response.data.data));
        const filterredAgentsList = response.data.data.filter((mainAgent) => {
          // Check if all subagents are either outbound or both inbound and outbound
          const subAgents = mainAgent.agents;
          const hasOutbound = subAgents.some(
            (item) => item.agentType === "outbound"
          );
          const hasInbound = subAgents.some(
            (item) => item.agentType === "inbound"
          );

          // Keep the main agent if it has only outbound agents or both inbound and outbound agents
          return hasOutbound && (!hasInbound || hasInbound);
        });
        setAgentsList(filterredAgentsList);
        console.log("Filtered Agents ", filterredAgentsList);
        setStages(filterredAgentsList.stages);
      }
    } catch (error) {
      // console.error("ERrror occured in agents api is :", error);
    } finally {
      setInitialLoader(false);
      // console.log("Api call completed");
    }
  };

  function GetOutboundAgent(mainAgent) {
    if (mainAgent.agents.length == 0) {
      return null;
    }
    if (mainAgent.agents.length > 0) {
      let outbound = null;
      for (const a of mainAgent.agents) {
        if (a.agentType == "outbound") {
          outbound = a;
        }
      }
      return outbound;
    }
  }

  //can assign stage or not
  const canAssignStage = (item) => {
    // console.log("Id selected is:", item);
    //0 unselected
    //1 selected
    //2 can not assign
    // Check if the item is already selected
    const isAlreadySelected = SelectedAgents.some(
      (selectedItem) => selectedItem.id === item.id
    );

    if (isAlreadySelected) {
      // Remove the item if it's already selected
      // console.log("Cheak 1");
      return 1;
      // return prevSelectedItems.filter((selectedItem) => selectedItem.id !== item.id);
    } else {
      let allSelectedAgentStages = [];
      // item.stages.map((agent) => {
      //     allSelectedAgentStages.push(agent)
      // })

      SelectedAgents.map((agent) => {
        allSelectedAgentStages = [...allSelectedAgentStages, ...agent.stages];
        // allSelectedAgentStages.push(agent.stages)
      });

      let canAssignStage = 0;
      // Check if the pipeline.id matches with any previously selected item's pipeline.id
      if (item) {
        SelectedAgents.map((agent) => {
          if (agent.pipeline.id != item.pipeline.id) {
            canAssignStage = 2;
          }
        });
      }

      if (canAssignStage == 0) {
        // console.log("Pipeline matches");
      } else {
        // console.log("Pipeline does not match");
        if (!errorMessage) {
          setErrTitle("Pipeline Confilict");
          setErrorMessage(
            "You can’t assign leads to agents in different pipelines"
          );
        }
        return 2;
      }

      // console.log("Previously selected items are :", SelectedAgents);

      // Check if any of the selected items have a matching stageTitle

      // console.log("All agents stages are :", allSelectedAgentStages);
      // console.log("Item.stages ==..", item.stages);

      if (item.stages) {
        item.stages.map((stage) => {
          allSelectedAgentStages.map((selectedStage) => {
            //// console.log(Matchin stage ${stage.id} with ${JSON.stringify(selectedStage)})
            if (stage.id == selectedStage.id) {
              // console.log("Agents in same stage so can not assign");
              if (!errorMessage) {
                setErrTitle("Conflicting Agents");
                setErrorMessage(
                  "You can’t assign leads to agents in the same stage"
                );
              }
              canAssignStage = 2;
            }
          });
        });
      }

      // item.stages.forEach((stage) => {
      //     allSelectedAgentStages.forEach((selectedStage) => {
      //         if (stage.id === selectedStage.id) {
      //            // console.log("Agents in the same stage, so cannot assign");
      //             canAssignStage = 2; // Update the flag
      //         }
      //     });
      // });

      return canAssignStage;
    }
    // });
  };

  const handleAssignLead = async () => {
    let userTimeZone = userProfile.timeZone || "America/Los_Angeles";
    const selectedDate = dayjs(selectedDateTime).tz(userTimeZone); // Convert input date to Day.js object
    const currentHour = selectedDate.hour(); // Get the current hour (0-23)
    const currentMinute = selectedDate.minute(); // Get minutes for 8:30 PM check
    console.log("Time in user's timezone is ", selectedDate);
    console.log("Hour in user's timezone is ", currentHour);
    console.log("Minute in user's timezone is ", currentMinute);
    console.log("Time in not user's timezone is ", selectedDateTime);

    const isAfterStartTime = currentHour >= 7; // || (selectedHour === 7 && selectedMinute >= 0); // 7:00 AM or later
    const isBeforeEndTime =
      currentHour < 20 || (currentHour === 20 && currentMinute <= 30); // Before 8:30 PM
    if (
      isAfterStartTime && // After 7:00 AM
      isBeforeEndTime // Before 8:30 PM
    ) {
      console.log(
        "✅ Selected time is between 7 AM and 8:30 PM.",
        selectedDate.format()
      );
      // setSelectedDateTime(selectedDate);
    } else {
      console.log("❌ Current time is outside 7 AM to 8:30 PM.");
      setInvalidTimeMessage(
        "Calls only between 7am-8:30pm"
        // "Calling is only available between 7AM and 8:30PM in " + userTimeZone
      );
      return;
    }

    // return;

    try {
      setLoader(true);

      let timer = null;
      let batchSize = null;

      if (customLeadsToSend) {
        batchSize = customLeadsToSend;
      } else if (NoOfLeadsToSend) {
        batchSize = NoOfLeadsToSend;
      }

      if (CallNow) {
        timer = 0;
      } else if (CallLater) {
        const currentDateTime = dayjs(); // Get current date and time using Day.js

        const differenceInMilliseconds = selectedDateTime.diff(currentDateTime); // Difference in ms
        const minutes = differenceInMilliseconds / (1000 * 60); // Convert ms to minutes
        timer = minutes.toFixed(0); // Round to nearest integer

        // console.log("Current Date:", currentDate);
        // console.log("Future Date:", futureDate);
        // console.log("Difference in Minutes:", timer);
      }

      let Apidata = {
        pipelineId: SelectedAgents[0].pipeline.id,
        mainAgentIds: SelectedAgents.map((item) => item.id),
        leadIds: leadIs,
        startTimeDifFromNow: timer,
        batchSize: batchSize,
        selectedAll: selectedAll,
        dncCheck: isDncChecked ? true : false,
      };

      console.log("Api data ", Apidata);
      // return;
      if (filters && selectedAll) {
        Apidata = {
          pipelineId: SelectedAgents[0].pipeline.id,
          mainAgentIds: SelectedAgents.map((item) => item.id),
          leadIds: leadIs,
          startTimeDifFromNow: timer,
          batchSize: batchSize,
          selectedAll: selectedAll,
          dncCheck: isDncChecked,
          ...filters,
        };
      }

      console.log("Data sending in api is:", Apidata);
      // return;
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      // console.log("Auth token is :--", AuthToken);

      const ApiPath = Apis.assignLeadToPipeLine;

      // console.log("Data sending in api is :", Apidata);

      const response = await axios.post(ApiPath, Apidata, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // console.log("Response of api is:", response);
        if (response.data.status === true) {
          handleCloseAssignLeadModal({
            status: false,
            showSnack: "Lead assigned",
            disSelectLeads: true,
          });
          setLastStepModal(false);
          // window.location.reload();
        } else if (response.data.status === false) {
          handleCloseAssignLeadModal({
            status: true,
            showSnack: "Error assigning lead",
            disSelectLeads: false,
          });
        }
      }
    } catch (error) {
      // console.error("Error occured in api is", error);
    } finally {
      setLoader(false);
    }
  };

  //code for date picker

  const handleDateChange = (date) => {
    if (!date) {
      // console.log("No date selected");
      return;
    }

    setSelectedDateTime(date);
    setHasUserSelectedDate(true);
  };

  const handleFromDateChange = (date) => {
    setSelectedFromDate(date); // Set the selected date
    setShowFromDatePicker(false);
  };

  function getLeadSelectedCount() {
    if (selectedAll) {
      return totalLeads - leadIs.length;
    } else {
      return leadIs.length;
    }
  }

  function GetAgentsActiveInPipelinesAndStages() {
    let filtered = agentsList.filter((item) => {
      return item.pipeline != null && item.stages.length > 0;
    });
    return filtered;
  }

  const styles = {
    heading: {
      fontWeight: "600",
      fontSize: 17,
    },
    paragraph: {
      fontWeight: "500",
      fontSize: 12,
    },
    paragraph2: {
      fontWeight: "500",
      fontSize: 12,
    },
    title: {
      fontWeight: "500",
      fontSize: 15,
    },
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
  };

  return (
    <div className="w-full">
      <AgentSelectSnackMessage
        message={errorMessage}
        title={errTitle}
        isVisible={errorMessage}
        hide={() => {
          //   setIsSnackVisible(false);
          setErrorMessage(null);
        }}
      />
      {/* Snackbar for invalid time */}

      <div className="flex flex-row items-center justify-between mt-4">
        <div style={{ fontSize: 24, fontWeight: "700" }}>Select your Agent</div>
        <div className="text-purple" style={styles.paragraph}>
          {getLeadSelectedCount()} Contacts Selected
        </div>
      </div>
      <div
        className="mt-2"
        style={styles.paragraph2}
        onClick={() => {
          // setLastStepModal(true);
        }}
      >
        Only outbound agents assigned to a stage can make calls.
      </div>

      {initialLoader ? (
        <div className="w-full flex flex-row justify-center mt-4">
          <CircularProgress size={30} />
        </div>
      ) : (
        <div
          className="max-h-[50vh] overflow-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {GetAgentsActiveInPipelinesAndStages().map((item, index) => {
            const noNumberWarning = (mainAgent) => {
              // console.log(
              //   "Agent passed is",
              //   mainAgent?.agents?.map((item) => item.phoneNumber)
              // );
              return mainAgent.agents.map((subAgent, index) => {
                // Check if the agent is of type 'outbound' and has no phone number
                if (
                  subAgent.agentType === "outbound" &&
                  (!subAgent.phoneNumber || subAgent.phoneNumber === "")
                ) {
                  return (
                    <div key={index}>
                      <div className="flex flex-row items-center gap-2 -mt-1">
                        <Image
                          src={"/assets/warningFill.png"}
                          height={18}
                          width={18}
                          alt="*"
                        />
                        <p>
                          <i
                            className="text-red"
                            style={{
                              fontSize: 12,
                              fontWeight: "600",
                            }}
                          >
                            No phone number assigned
                          </i>
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              });
            };

            return (
              <button
                key={index}
                className="rounded-xl p-2 mt-4 w-full outline-none"
                style={{
                  border: SelectedAgents.includes(item)
                    ? "2px solid #7902DF"
                    : "1px solid #00000020",
                  backgroundColor: SelectedAgents.includes(item)
                    ? "#402FFF05"
                    : "",
                }}
                onClick={() => {
                  let canAssign = canAssignStage(item);
                  if (canAssign == 0) {
                    //push to the array
                    // console.log("Cheak 1 at 0");
                    setSelectedAgents([...SelectedAgents, item]);
                    // setLastStepModal(true);//loader
                    setShouldContinue(false);
                  } else if (canAssign == 1) {
                    //remove from the array
                    // console.log("Cheak 2");
                    let agents = SelectedAgents.filter(
                      (selectedItem) => selectedItem.id !== item.id
                    );
                    setSelectedAgents(agents);
                  } else if (canAssign == 2) {
                    //can not assign. Show popup
                    setCannotAssignLeadModal(true);
                  }
                }}
              >
                <div className="flex flex-row items-center justify-between pt-2">
                  <div className="flex flex-row items-center gap-2">
                    {getAgentImage(item)}
                    <span style={styles.heading}>
                      {GetOutboundAgent(item)?.name?.slice(0, 1)?.toUpperCase()}
                      {GetOutboundAgent(item)?.name?.slice(1)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <div>{noNumberWarning(item)}</div>
                    <div
                      style={{
                        fontWeight: "500",
                        fontSize: 12,
                      }}
                    >
                      {item.agents[0]?.agentRole}
                    </div>
                  </div>
                </div>

                <div
                  className="flex flex-row items-center gap-2 mt-6 pb-2 w-full overflow-auto"
                  style={{
                    ...styles.paragraph,
                    overflowY: "hidden",
                    scrollbarWidth: "none", // For Firefox
                    msOverflowStyle: "none", // For Internet Explorer and Edge
                  }}
                >
                  <style jsx>
                    {`
                      div::-webkit-scrollbar {
                        display: none; /* For Chrome, Safari, and Opera */
                      }
                    `}
                  </style>
                  <div
                    className="flex-shrink-0 flex flex-row items-center gap-1"
                    style={styles.paragraph}
                  >
                    <span className="text-purple">Active in | </span>{" "}
                    {item.pipeline?.title}
                  </div>

                  <div
                    className="flex-shrink-0 flex flex-row gap-2 overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {item.stages.map((item, index) => (
                      <div
                        className="px-3 py-1 rounded-3xl border"
                        style={styles.paragraph}
                        key={index}
                      >
                        {item.stageTitle}
                      </div>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div>
        <button
          className="rounded-lg mt-4 w-full h-[50px]"
          style={{
            ...styles.heading,
            backgroundColor: ShouldContinue ? "#00000020" : "#7902DF",
            color: ShouldContinue ? "#00000080" : "white",
          }} //onClick={handleAssigLead}
          disabled={ShouldContinue}
          onClick={() => {
            setLastStepModal(true);
          }}
        >
          Continue
        </button>
      </div>

      {/* last step modal */}
      <Modal
        open={lastStepModal}
        onClose={() => setLastStepModal(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-4/12 sm:w-7/12 w-8/12" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full">
            <AgentSelectSnackMessage
              className=""
              message={invalidTimeMessage}
              isVisible={invalidTimeMessage}
              hide={() => {
                setInvalidTimeMessage(null);
              }}
            />
            <div
              className="w-full"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
              }}
            >
              <div className="flex flex-row justify-between">
                <button className="flex flex-row items-center justify-center gap-2 bg-[#15151515] h-[34px] w-[92px] rounded-2xl pe-2">
                  <CaretLeft size={20} weight="bold" />
                  <span
                    style={styles.title}
                    onClick={() => {
                      setLastStepModal(false);
                    }}
                  >
                    Back
                  </span>
                </button>
                <button
                  onClick={() => {
                    setLastStepModal(false);
                  }}
                >
                  <Image
                    src={"/assets/cross.png"}
                    height={14}
                    width={14}
                    alt="*"
                  />
                </button>
              </div>

              <div className="flex flex-row items-center justify-between mt-6">
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: 24,
                  }}
                >
                  One last thing
                </div>
                <div className="flex flex-col items-start">
                  <div
                    className="text-purple"
                    style={{ fontSize: 12, fontWeight: "600" }}
                  >
                    {getLeadSelectedCount()} Contacts Selected
                  </div>

                  <div className="flex flex-row items-center  -mt-2">
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: "#000000",
                      }}
                    >
                      Check DNC List
                    </div>
                    <Switch
                      checked={isDncChecked}
                      // color="#7902DF"
                      // exclusive
                      onChange={(event) => {
                        setIsDncChecked(event.target.checked);
                      }}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#7902DF",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: "#7902DF",
                        },
                        margin: 0,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4" style={styles.heading}>
                Drip calls per day
              </div>

              <div className="flex flex-row items-center gap-8 mt-4">
                <input
                  className="w-1/2 flex flex-row items-center p-4 rounded-2xl otline-none focus:ring-0"
                  style={{
                    border: `${isFocustedCustomLeads
                        ? "2px solid #7902Df"
                        : "1px solid #00000040"
                      }`,
                    height: "50px",
                  }}
                  value={customLeadsToSend}
                  onFocus={() => {
                    setNoOfLeadsToSend("");
                    setisFocustedCustomLeads(true);
                  }}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (!/[0-9]/.test(value) && value !== "") return;
                    setCustomLeadsToSend(e.target.value);
                  }}
                  placeholder="Ex: 100"
                />
                <button
                  className="w-1/2 flex flex-row items-center p-4 rounded-2xl"
                  style={{
                    border: NoOfLeadsToSend
                      ? "2px solid #7902DF"
                      : "1px solid #00000040",
                    height: "50px",
                  }}
                  onClick={() => {
                    setNoOfLeadsToSend(totalLeads);
                    setCustomLeadsToSend("");
                    setisFocustedCustomLeads(false);
                  }}
                >
                  All {getLeadSelectedCount()}
                </button>
              </div>

              <div className="mt-4" style={styles.heading}>
                When to start calling?
              </div>

              <div className="flex flex-row items-center gap-8 mt-4">
                <button
                  className="w-1/2 flex flex-col justify-between p-4 rounded-2xl"
                  style={{
                    border: CallNow
                      ? "2px solid #7902DF"
                      : "1px solid #00000040",
                    height: "119px",
                  }}
                  onClick={() => {
                    const currentDateTime = new Date();
                    const currentHour = currentDateTime.getHours(); // Get the current hour (0-23)
                    // if (currentHour >= 5 && currentHour < 19) {
                    //   console.log("✅ Current time is between 5 AM and 7 PM.");
                    setCallNow(currentDateTime);
                    setCallLater(false);
                    // } else {
                    //   console.log("❌ Current time is outside 5 AM to 7 PM.");
                    //   setInvalidTimeMessage(
                    //     "❌ Current time is outside 5 AM to 7 PM."
                    //   );
                    // }
                    // console.log(
                    //   "Current data is:",
                    //   currentDateTime.toLocaleString()
                    // );
                    setSelectedDateTime(dayjs());

                    // handleDateTimerDifference();
                  }}
                >
                  <Image
                    src={"/assets/callBtn.png"}
                    height={24}
                    width={24}
                    alt="*"
                  />
                  <div style={styles.title}>Call Now</div>
                </button>
                <div className="w-1/2">
                  <button
                    className="w-full flex flex-col justify-between p-4 rounded-2xl"
                    style={{
                      border: CallLater
                        ? "2px solid #7902DF"
                        : "1px solid #00000040",
                      height: "119px",
                    }}
                    onClick={() => {
                      setShowFromDatePicker(!showFromDatePicker);
                      setCallNow("");
                      setCallLater(true);
                    }}
                  >
                    <CalendarDots size={32} weight="bold" />
                    <div style={styles.title}>Schedule Call</div>
                  </button>
                  {/* <div>
                                        {
                                            showFromDatePicker && (
                                                <div>
                                                    <Calendar
                                                        onChange={handleFromDateChange}
                                                        value={selectedFromDate}
                                                        locale="en-US"
                                                        onClose={() => { setShowFromDatePicker(false) }}
                                                    />
                                                </div>
                                            )
                                        }
                                    </div> */}

                  <Modal
                    // open={showFromDatePicker}
                    onClose={() => setShowFromDatePicker(false)}
                    closeAfterTransition
                    BackdropProps={{
                      timeout: 1000,
                      sx: {
                        backgroundColor: "#00000020",
                        // //backdropFilter: "blur(5px)",
                      },
                    }}
                  >
                    <Box
                      className="lg:w-4/12 sm:w-7/12 w-8/12"
                      sx={styles.modalsStyle}
                    >
                      <div className="flex flex-row justify-center w-full">
                        <div
                          className="w-full flex flex-row justify-center"
                          style={{
                            backgroundColor: "#ffffff",
                            padding: 20,
                            borderRadius: "13px",
                          }}
                        >
                          <div>
                            {/* <Calendar
                                                            onChange={handleFromDateChange}
                                                            value={selectedFromDate}
                                                            locale="en-US"
                                                            onClose={() => { setShowFromDatePicker(false) }}
                                                        /> */}
                            <div className="text-center text-xl font-bold">
                              Select date and time to shedule call
                            </div>
                            <div className="w-full mt-4 flex flex-row justify-center">
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                  // label="Select date and time"
                                  minDateTime={dayjs().tz(userProfile.timeZone)}
                                  //   value={value}
                                  sx={{
                                    // Date Picker (Large Screen)
                                    "& .MuiPickersDay-root.Mui-selected": {
                                      backgroundColor: "#7902DF !important", // Purple background for selected date
                                      color: "white !important",
                                    },
                                    "& .MuiPickersDay-root:hover": {
                                      backgroundColor: "#a352df !important", // Lighter purple on hover
                                    },
                                    "& .Mui-selected": {
                                      backgroundColor: "#7902DF !important",
                                      color: "#fff !important",
                                    },
                              
                                    // Time Picker (Large Screen)
                                    "& .MuiClock-pin": {
                                      backgroundColor: "#7902DF !important", // Change clock pin color
                                    },
                                    "& .MuiClockPointer-root": {
                                      backgroundColor: "#7902DF !important", // Change clock pointer color
                                    },
                                    "& .MuiClockPointer-thumb": {
                                      borderColor: "#7902DF !important", // Change pointer thumb color
                                    },
                                    "& .MuiPickersToolbar-root": {
                                      backgroundColor: "#7902DF !important", // Toolbar background purple
                                    },
                                    "& .MuiTypography-root": {
                                      color: "#7902DF !important", // Header text color
                                    },
                              
                                    // Time Selection List (Large Screen)
                                    "& .MuiPickersTimeClock-root .Mui-selected": {
                                      backgroundColor: "#7902DF !important", // Purple selected time
                                      color: "white !important",
                                    },
                                    "& .MuiPickersTimeClock-root .MuiButtonBase-root:hover": {
                                      backgroundColor: "#a352df !important", // Lighter purple on hover
                                    },
                              
                                    // Time Picker List (Dropdown List)
                                    "& .MuiTimeClock-root .Mui-selected": {
                                      backgroundColor: "#7902DF !important",
                                      color: "white !important",
                                    },
                                    "& .MuiTimeClock-root .MuiButtonBase-root:hover": {
                                      backgroundColor: "#a352df !important",
                                    },
                                  }}
                                
                                  onChange={handleDateChange}
                                  renderInput={(params) => (
                                    <input
                                      {...params.inputProps}
                                      style={{
                                        border: "none", // Disable border
                                        outline: "none",
                                        padding: "8px",
                                        backgroundColor: "#f9f9f9", // Optional: subtle background for better visibility
                                      }}
                                      onFocus={(e) => {
                                        e.target.style.border = "none"; // Ensure no border on focus
                                        e.target.style.outline = "none"; // Ensure no outline on focus
                                      }}
                                      onBlur={(e) => {
                                        e.target.style.border = "none"; // Reset border on blur
                                        e.target.style.outline = "none"; // Reset outline on blur
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.border = "none"; // Remove border on hover
                                        e.target.style.outline = "none"; // Remove outline on hover
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.border = "none"; // Reset border on hover out
                                        e.target.style.outline = "none"; // Reset outline on hover out
                                      }}
                                    />
                                  )}
                                />
                              </LocalizationProvider>
                            </div>
                            <div className="w-full flex flex-row justify-center mt-6">
                              <button
                                className="w-7/12 h-[50px] bg-purple rounded-xl text-white font-bold"
                                onClick={() => {
                                  setShowFromDatePicker(false);
                                }}
                              >
                                Select & close
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Box>
                  </Modal>

                  {/*  */}
                </div>
              </div>

              {CallLater && (
                <div>
                  <div
                    className="mt-4"
                    style={{
                      fontWeight: "500",
                      fontsize: 12,
                      color: "#00000050",
                    }}
                  >
                    Select date & time
                  </div>
                  <div className="mt-2">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        // label="Select date and time"
                        // minDateTime={dayjs()}
                        //   value={value}
                        minDate={dayjs()}
                        onChange={handleDateChange}
                        sx={{
                          "& .MuiPickersDay-root.Mui-selected": {
                            backgroundColor: "#7902DF !important", // Change selected date color to purple
                            color: "white !important",
                          },
                          "& .MuiPickersDay-root:hover": {
                            backgroundColor: "#a352df !important", // Lighter purple on hover
                          },
                          "& .MuiButtonBase-root.MuiPickersDay-root:not(.Mui-selected)": {
                            color: "#333 !important", // Default color for unselected dates
                          },
                          "& .Mui-selected": {
                            backgroundColor: "#7902DF !important",
                            color: "#fff !important",
                          },
                          "& .MuiClock-pin": {
                            backgroundColor: "#7902DF !important", // Change clock pin color
                          },
                          "& .MuiClockPointer-root": {
                            backgroundColor: "#7902DF !important", // Change clock pointer color
                          },
                          "& .MuiClockPointer-thumb": {
                            borderColor: "#7902DF !important", // Change pointer thumb color
                          },
                        }}
                        renderInput={(params) => (
                          <input
                            {...params.inputProps}
                            style={{
                              border: "none", // Disable border
                              outline: "none",
                              padding: "8px",
                              backgroundColor: "#f9f9f9", // Optional: subtle background for better visibility
                            }}
                            onFocus={(e) => {
                              e.target.style.border = "none"; // Ensure no border on focus
                              e.target.style.outline = "none"; // Ensure no outline on focus
                            }}
                            onBlur={(e) => {
                              e.target.style.border = "none"; // Reset border on blur
                              e.target.style.outline = "none"; // Reset outline on blur
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.border = "none"; // Remove border on hover
                              e.target.style.outline = "none"; // Remove outline on hover
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.border = "none"; // Reset border on hover out
                              e.target.style.outline = "none"; // Reset outline on hover out
                            }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </div>
                </div>
              )}

              {loader ? (
                <div className="mt-4 w-full flex flex-row items-center justify-center">
                  <CircularProgress size={30} />
                </div>
              ) : (
                <div className="w-full">
                  {(NoOfLeadsToSend || customLeadsToSend) &&
                    (CallNow ||
                      (CallLater && selectedDateTime && hasUserSelectedDate)) &&
                    isDncChecked ? (
                    <button
                      className="text-white w-full h-[50px] rounded-lg bg-purple mt-4"
                      onClick={() => {
                        handleAssignLead();
                        // handleAssigLead()
                      }}
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      className="text-[#000000] w-full h-[50px] rounded-lg bg-[#00000020] mt-4"
                      disabled={true}
                    >
                      Continue
                    </button>
                  )}
                </div>
              )}

              {/* <div className='mt-4 w-full'>
                                <button className="text-white bg-purple rounded-xl w-full h-[50px]" style={styles.heading} onClick={() => { setLastStepModal(false) }}>
                                    Continue
                                </button>
                            </div> */}

              {/* Can be use full to add shadow */}
              {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default AssignLead;
