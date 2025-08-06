import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Apis from "../apis/Apis";
import axios from "axios";
import { Box, CircularProgress, Modal, Popover } from "@mui/material";
import moment from "moment";
import { GetFormattedDateString, ToUppercase } from "@/utilities/utility";
import { getAgentsListImage } from "@/utilities/agentUtilities";
import { PersistanceKeys } from "@/constants/Constants";
import InfiniteScroll from "react-infinite-scroll-component";
import { UserTypes } from "@/constants/UserTypes";
import LeadLoading from "../dashboard/leads/LeadLoading";
import { BatchStatus } from "../constants/constants";

function SheduledCalls({ user }) {
  const Limit = 30;
  // const [user, setUser] = useState(null);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [hasMoreLeads, setHasMoreLeads] = useState(true);
  const [callsLoading, setCallsLoading] = useState(false);
  const [hasMoreCalls, setHasMoreCalls] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  //code for agent details
  const [callDetails, setCallDetails] = useState([]);
  const [initialLoader, setInitialLoader] = useState(false);
  const [agentsList, setAgentsList] = useState([]);
  const [filteredAgentsList, setFilteredAgentsList] = useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  //code for call log details
  const [SelectedAgent, setSelectedAgent] = useState(null);
  const [SelectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [AgentCallLogLoader, setAgentCallLogLoader] = useState(false);
  const [sheduledCalllogs, setSheduledCalllogs] = useState([]);
  const [filteredSheduledCalllogs, setFilteredSheduledCalllogs] = useState([]);
  const [detailsFilterSearchValue, setDetailsFilterSearchValue] = useState("");
  //code for leeads details modal
  const [showLeadDetailsModal, setShowLeadDetailsModal] = useState(false);
  const [selectedLeadsList, setSelectedLeadsList] = useState([]);
  const [filteredSelectedLeadsList, setFilteredSelectedLeadsList] = useState(
    []
  );
  const [leadsSearchValue, setLeadsSearchValue] = useState("");
  //variable for warningpopup
  const [showConfirmationPopuup, setShowConfirmationPopup] = useState(null);
  const [color, setColor] = useState(false);

  //variable for showing modal
  const [extraTagsModal, setExtraTagsModal] = useState(false);
  const [otherTags, setOtherTags] = useState([]);

  const filterTimerRef = useRef(null);
  useEffect(() => {
    getScheduledOrOngoingActivityCalls();
  }, []);
  useEffect(() => {
    if (filterTimerRef.current) {
      clearTimeout(filterTimerRef.current);
    }
    filterTimerRef.current = setTimeout(() => {
      //console.log;
      // if (detailsFilterSearchValue && detailsFilterSearchValue.length > 0) {
      if (SelectedItem) {
        setHasMoreCalls(true);
        setFilteredSheduledCalllogs([]);
        setSheduledCalllogs([]);
        fetchCallsInBatch(SelectedItem, 0);
      }
      // }
    }, 400);
  }, [detailsFilterSearchValue]);

  //code to show popover
  const handleShowPopup = (event, item, agent) => {
    setAnchorEl(event.currentTarget);
    // //console.log;
    // //console.log;
    setSelectedAgent(agent);
    setSelectedItem(item);
  };

  const handleClosePopup = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  //code for showing the selected agent leads
  const handleShowLeads = (agent, item) => {
    // //console.log;
    // //console.log;
    setSelectedAgent(agent);
    setSelectedItem(item);
    setSelectedLeadsList([]);
    setFilteredSelectedLeadsList([]);
    setHasMoreLeads(true);
    setShowLeadDetailsModal(true);
    fetchLeadsInBatch(item);
  };

  //code to filter slected agent leads
  const handleLeadsSearchChange = (value) => {
    if (value.trim() === "") {
      //// //console.log;
      // Reset to original list when input is empty
      setFilteredSelectedLeadsList(selectedLeadsList);
      return;
    }

    const filtered = selectedLeadsList.filter((item) => {
      const term = value.toLowerCase();
      return (
        // item.LeadModel?.firstName.toLowerCase().includes(term) ||
        // item.LeadModel?.lastName.toLowerCase().includes(term) ||
        // item.LeadModel?.address.toLowerCase().includes(term) ||
        item.firstName.toLowerCase().includes(term)
        // (item.LeadModel?.phone && agentsList.includes(term))
      );
    });

    setFilteredSelectedLeadsList(filtered);
  };

  //code to get agents
  const getScheduledOrOngoingActivityCalls = async () => {
    try {
      setInitialLoader(true);

      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        // //console.log;
        AuthToken = Data.token;
      }

      // //console.log;

      let mainAgent = null;
      const localAgent = localStorage.getItem("agentDetails");
      if (localAgent) {
        const agentDetails = JSON.parse(localAgent);
        // //console.log;
        // //console.log;
        mainAgent = agentDetails;
      }
      // const ApiPath = `${Apis.getSheduledCallLogs}?mainAgentId=${mainAgent.id}`;
      const ApiPath = `${Apis.getSheduledCallLogs}?scheduled=false`;

      // //console.log; //scheduled
      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        console.log("response is", response.data.data);

        setFilteredAgentsList(response.data.data);
        setCallDetails(response.data.data);
        setAgentsList(response.data.data);
      }
    } catch (error) {
      // console.error("Error occured in get Agents api is :", error);
    } finally {
      setInitialLoader(false);
    }
  };

  //code to show call log details popup

  const handleShowBatchCalls = (item, agent, event) => {
    if (event) {
      setAnchorEl(event.currentTarget);
    }
    // //console.log;
    // //console.log;
    setSelectedAgent(agent);
    setSelectedItem(item);
    setShowDetailsModal(true);
    setHasMoreCalls(true);
    fetchCallsInBatch(item, 0);
  };

  //code to filter slected agent leads
  const handleDetailsSearchChange = (value) => {
    if (value.trim() === "") {
      //// //console.log;
      // Reset to original list when input is empty
      setFilteredSheduledCalllogs(sheduledCalllogs);
      return;
    }

    const filtered = sheduledCalllogs.filter((item) => {
      const term = value.toLowerCase();
      return (
        // item.LeadModel?.firstName.toLowerCase().includes(term) ||
        // item.LeadModel?.lastName.toLowerCase().includes(term) ||
        // item.LeadModel?.address.toLowerCase().includes(term) ||
        item.firstName.toLowerCase().includes(term)
        // (item.LeadModel?.phone && agentsList.includes(term))
      );
    });

    setFilteredSheduledCalllogs(filtered);
  };

  //main page search
  const handleSearchChange = (value) => {
    if (value.trim() === "") {
      //// //console.log;
      // Reset to original list when input is empty
      setFilteredAgentsList(agentsList);
      return;
    }

    //// //console.log;

    const filtered = agentsList.filter((item) => {
      const term = value.toLowerCase();
      //// //console.log
      return (
        // item.LeadModel?.firstName.toLowerCase().includes(term) ||
        // item.LeadModel?.lastName.toLowerCase().includes(term) ||
        // item.LeadModel?.address.toLowerCase().includes(term) ||
        item?.agents[0]?.name?.toLowerCase().includes(term)
        // (item.LeadModel?.phone && agentsList.includes(term))
      );
    });

    setFilteredAgentsList(filtered);
  };

  const [PauseLoader, setPauseLoader] = useState(false);
  //code to pause the agent
  const pauseAgents = async () => {
    // //console.log;

    try {
      setPauseLoader(true);
      const ApiPath = Apis.pauseAgent;

      // //console.log;

      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        // //console.log;
        AuthToken = Data.token;
      }

      // //console.log;
      const ApiData = {
        // mainAgentId: SelectedItem.id
        batchId: SelectedItem.id,
      };
      // //console.log;
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          setShowConfirmationPopup(null);
          let currentStatus = filteredAgentsList.map((item) => {
            if (item.id === SelectedItem.id) {
              // Update the status for the matching item
              return {
                ...item,
                status: "Paused",
              };
            }
            // Return the item unchanged
            return item;
          });
          // //console.log;

          setFilteredAgentsList(currentStatus);
          handleClosePopup();
        }
        // setFilteredAgentsList(response.data.data);
        // setAgentsList(response.data.data);
      }
    } catch (error) {
      // console.error("Error occured in get Agents api is :", error);
    } finally {
      setPauseLoader(false);
    }
  };

  //function to resume calls
  const resumeCalls = async () => {
    // //console.log;
    // //console.log
    // return
    try {
      setPauseLoader(true);
      const ApiPath = Apis.resumeCalls;

      // //console.log;

      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        // //console.log;
        AuthToken = Data.token;
      }

      // //console.log;
      const ApiData = {
        // mainAgentId: SelectedItem.id
        batchId: SelectedItem.id,
      };
      // //console.log;
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          setShowConfirmationPopup(null);
          let currentStatus = filteredAgentsList.map((item) => {
            if (item.id === SelectedItem.id) {
              // Update the status for the matching item
              return {
                ...item,
                status: "Active",
              };
            }
            // Return the item unchanged
            return item;
          });
          // //console.log;

          setFilteredAgentsList(currentStatus);
          handleClosePopup();
        }
        // setFilteredAgentsList(response.data.data);
        // setAgentsList(response.data.data);
      }
    } catch (error) {
      // console.error("Error occured in get Agents api is :", error);
    } finally {
      setPauseLoader(false);
    }
  };

  const fetchLeadsInBatch = async (batch, offset = 0) => {
    //console.log;
    try {
      let firstApiCall = false;
      setLeadsLoading(true);
      let leadsInBatchLocalData = localStorage.getItem(
        PersistanceKeys.LeadsInBatch + `${batch.id}`
      );
      if (selectedLeadsList.length == 0) {
        firstApiCall = true;
        if (leadsInBatchLocalData) {
          //console.log;
          let leads = JSON.parse(leadsInBatchLocalData);
          //console.log;
          // setSelectedLeadsList(leads);
          // setFilteredSelectedLeadsList(leads);
          setLeadsLoading(false);
          // return;
        } else {
          //console.log;
        }
      } else {
        //console.log;
      }

      const token = user.token; // Extract JWT token
      console.log(
        "Api Call Leads : ",
        "/api/calls/leadsInABatch" + `?batchId=${batch.id}&offset=${offset}`
      );
      const response = await fetch(
        "/api/calls/leadsInABatch" + `?batchId=${batch.id}&offset=${offset}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setLeadsLoading(false);
      const data = await response.json();

      if (response.ok) {
        //console.log;
        // setSelectedLeadsList(data.data);
        // setFilteredSelectedLeadsList(data.data);
        // localStorage.setItem(
        //   PersistanceKeys.LeadsInBatch + `${batch.id}`,
        //   JSON.stringify(data.data)
        // );

        console.log("response is", response.data.length);
        if (firstApiCall) {
          setSelectedLeadsList(data.data);
          setFilteredSelectedLeadsList(data.data);
          localStorage.setItem(
            PersistanceKeys.LeadsInBatch + `${batch.id}`,
            JSON.stringify(data.data)
          );
        } else {
          setSelectedLeadsList((prev) => [...prev, ...data.data]);
          setFilteredSelectedLeadsList((prev) => [...prev, ...data.data]);
        }

        // setShowDetailsModal(true);

        if (data.data.length < Limit) {
          setHasMoreLeads(false);
        } else {
          setHasMoreLeads(true);
        }
        // setStats(data.stats.data);
      } else {
        console.error("Failed to fetch leads in batch:", data.message);
      }
    } catch (error) {
      console.error("Error fetching leads in batch:", error);
    }
  };

  const fetchCallsInBatch = async (batch, offset = 0) => {
    //console.log;

    try {
      let firstCall = false;
      setCallsLoading(true);
      if (sheduledCalllogs.length == 0) {
        firstCall = true;
        // let leadsInBatchLocalData = localStorage.getItem(
        //   PersistanceKeys.CallsInBatch + `${batch.id}`
        // );
        // if (leadsInBatchLocalData) {
        //   // //console.log;
        //   let calls = JSON.parse(leadsInBatchLocalData);
        //   //console.log;
        //   setSheduledCalllogs(calls);
        //   setFilteredSheduledCalllogs(calls);
        //   setShowDetailsModal(true);
        //   setCallsLoading(false);
        //   // return;
        // } else {
        //   //console.log;
        // }
      }

      const token = user.token; // Extract JWT token
      //console.log;
      let url =
        "/api/calls/callsInABatch" + `?batchId=${batch.id}&offset=${offset}`;
      if (detailsFilterSearchValue && detailsFilterSearchValue.length > 0) {
        url = `${url}&search=${detailsFilterSearchValue}`;
      }
      //console.log;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      //console.log;
      setCallsLoading(false);
      const data = await response.json();

      if (response.ok) {
        //console.log;
        if (firstCall) {
          setSheduledCalllogs(data.data.pastCalls);
          setFilteredSheduledCalllogs(data.data.pastCalls);
          localStorage.setItem(
            PersistanceKeys.CallsInBatch + `${batch.id}`,
            JSON.stringify(data.data.pastCalls)
          );
        } else {
          setSheduledCalllogs((prev) => [...prev, ...data.data.pastCalls]);
          setFilteredSheduledCalllogs((prev) => [
            ...prev,
            ...data.data.pastCalls,
          ]);
        }

        // setShowDetailsModal(true);

        if (data.data.pastCalls.length < Limit) {
          setHasMoreCalls(false);
        } else {
          setHasMoreCalls(true);
        }
        // setStats(data.stats.data);
      } else {
        console.error("Failed to fetch leads in batch:", data.message);
      }
    } catch (error) {
      console.error("Error fetching leads in batch:", error);
    }
  };

  function GetLoadingOrNoCallsView() {
    if (callsLoading) {
      return <div className="text-center mt-6 text-3xl">Loading...</div>;
    } else if (!callsLoading && sheduledCalllogs.length == 0) {
      return <div className="text-center mt-6 text-3xl">No Call Found</div>;
    }
  }

  function getReadableStatus(status) {
    if (status === BatchStatus.PausedForNonPayment) {
      return "Paused (Non Payment)";
    }
    return status;
  }

  // function getAgentNameForActiviti(agent) {
  //   const agents = agent.agents || [];
  //   if (agents.length > 0) {
  //     if (agents[0].agentType == "outbound") {
  //       return agents[0]?.name || "-";
  //     } else {
  //       if (agents.length > 1) {
  //         return agents[0]?.name || "-";
  //       }
  //     }
  //   }
  //   return "-";
  // }

  function getAgentNameForActiviti(agent) {
    const agents = agent.agents || [];
    if (agents.length > 0) {
      let name = agents[0]?.name || "-";

      if (agents[0].agentType === "outbound") {
        return formatName(name);
      } else {
        if (agents.length > 1) {
          return formatName(name);
        }
      }
    }
    return "-";
  }

  function getAgentImageForActiviti(agent) {
    const agents = agent.agents || [];
    if (agents.length > 0) {
      let img
      if (agents[0].agentType === "outbound") {
        img = agents[0]?.thumb_profile_image;

        if (img) {
          return (
            <Image
              className="rounded-full"
              src={img}
              height={40}
              width={40}
              style={{
                height: "40px",
                width: "40px",
                resize: "cover",
              }}
              alt="*"
            />
          )
        } else {
          return (

            <div className="h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white">
              {getFirstAlphabetFromName(agent)}
            </div>
          )
        }
      } else {
        if (agents.length > 1) {
          img = agents[0]?.thumb_profile_image;
          if (img) {
            return (
              <Image
                className="rounded-full"
                src={img}
                height={40}
                width={40}
                style={{
                  height: "40px",
                  width: "40px",
                  resize: "cover",
                }}
                alt="*"
              />
            )
          } else {
            return (
              <div className="h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white">
                {getFirstAlphabetFromName(agent)}
              </div>
            )
          }
        }
      }
    }
    return "-";
  }

  function formatName(name) {
    if (typeof name !== "string" || name.length === 0) return "-";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  function getFirstAlphabetFromName(agent) {
    const name = getAgentNameForActiviti(agent);
    return name.length > 0 ? name?.slice(0, 1).toUpperCase() : "";
  }

  return (
    <div className="w-full items-start overflow-hidden">
      {initialLoader ? (
        <LeadLoading />
      ) : (
        <>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClosePopup}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right", // Ensures the Popover's top right corner aligns with the anchor point
            }}
            PaperProps={{
              elevation: 0, // This will remove the shadow
              style: {
                boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.05)",
                borderRadius: "10px",
                width: "120px",
              },
            }}
          >
            <div
              className="p-2 flex flex-col gap-2"
              style={{ fontWeight: "500", fontSize: 15 }}
            >
              <div>
                {PauseLoader ? (
                  <CircularProgress size={18} />
                ) : (
                  <button
                    className="text-start outline-none"
                    onClick={() => {
                      if (SelectedItem?.status == "Paused") {
                        //// //console.log
                        setColor(true);
                        setShowConfirmationPopup("resume Calls");
                      } else {
                        //// //console.log
                        setShowConfirmationPopup("pause Calls");
                        setColor(false);
                      }
                      // //console.log
                    }}
                  >
                    {SelectedItem?.status == "Paused"
                      ? "Run Calls"
                      : "Pause Calls"}
                  </button>
                )}
              </div>

              <button
                className="text-start outline-none"
                onClick={() => {
                  // handleShowLeads(SelectedAgent, SelectedItem);

                  // fetchCallsInBatch(SelectedItem);
                  handleShowBatchCalls(SelectedItem);
                }}
              >
                View Details
              </button>
              {/* <div className="text-red">Delete</div> */}
            </div>
          </Popover>
          {/* Confirmation popup */}
          {showConfirmationPopuup && (
            <ShowConfirmationPopup
              showConfirmationPopuup={showConfirmationPopuup}
              setShowConfirmationPopup={setShowConfirmationPopup}
              pauseAgent={pauseAgents}
              color={color}
              PauseLoader={PauseLoader}
              resumeCalls={resumeCalls}
            />
          )}

          <div className="flex w-full pl-10 flex-row items-start gap-3 overflow-hidden"></div>

          <div className="w-full flex flex-row justify-between mt-10 px-10">
            <div className="w-2/12">
              <div style={styles.text}>Agent</div>
            </div>
            <div className="w-2/12 ">
              <div style={styles.text}>Objective</div>
            </div>
            <div className="w-1/12">
              <div style={styles.text}>Leads</div>
            </div>
            <div className="w-1/12">
              <div style={styles.text}>List Name</div>
            </div>

            <div className="w-2/12">
              <div style={styles.text}>Date created</div>
            </div>
            <div className="w-1/12">
              <div style={styles.text}>Call Status</div>
            </div>
            <div className="w-1/12">
              <div style={styles.text}>Action</div>
            </div>
          </div>

          <div>
            <div
              className={`h-[70vh] overflow-auto`}
              style={{ scrollbarWidth: "none" }}
            >
              {filteredAgentsList.length > 0 ? (
                <div>
                  {filteredAgentsList.map((item, index) => {
                    return (
                      <div key={index}>
                        {item.agents.map((agent, index) => {
                          return (
                            <div key={index}>
                              <div
                                className="w-full flex flex-row items-center justify-between mt-10 px-10"
                                key={index}
                              >
                                <div className="w-2/12 flex flex-row gap-4 items-center">
                                  <div className="w-[30%]">
                                    {getAgentImageForActiviti(agent)}
                                  </div>
                                  <div style={styles.text2}>
                                    {getAgentNameForActiviti(agent)}
                                  </div> 
                                </div>
                                <div className="w-2/12 ">
                                  {user.user.userType ==
                                    UserTypes.RealEstateAgent
                                    ? `${ToUppercase(
                                      agent?.agents[0]?.agentObjective
                                    )}`
                                    : `${agent?.agents[0]?.agentRole || "Other"
                                    }`}
                                </div>
                                <div className="w-1/12">
                                  <button
                                    style={styles.text2}
                                    className="text-purple underline outline-none"
                                    onClick={(event) => {
                                      // handleShowPopup(event, item, agent);
                                      // fetchLeadsInBatch(item);
                                      // handleShowLeads(agent, item);
                                      // setShowDetailsModal(true);
                                      // setHasMoreCalls(true);
                                      // fetchCallsInBatch(SelectedItem);
                                      handleShowBatchCalls(item, agent, null);
                                    }}
                                  >
                                    {item?.totalLeads}
                                  </button>
                                </div>
                                <div className="w-1/12">
                                  {item.Sheet?.sheetName || "-"}
                                </div>
                                <div className="w-2/12">
                                  {item?.createdAt ? (
                                    <div style={styles.text2}>
                                      {GetFormattedDateString(
                                        item?.createdAt,
                                        true
                                      )}
                                    </div>
                                  ) : (
                                    "-"
                                  )}
                                </div>
                                <div className="w-1/12">
                                  {getReadableStatus(item.status)}
                                </div>
                                <div className="w-1/12">
                                  <button
                                    aria-describedby={id}
                                    variant="contained"
                                    onClick={(event) => {
                                      handleShowPopup(event, item, agent);
                                    }}
                                  >
                                    <Image
                                      src={"/otherAssets/threeDotsIcon.png"}
                                      height={24}
                                      width={24}
                                      alt="icon"
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: 24,
                    textAlign: "center",
                    marginTop: 20,
                  }}
                >
                  No Call Activity Found
                </div>
              )}
            </div>
          </div>

          {/* Calls List modal goes here */}
          <Modal
            open={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            closeAfterTransition
            BackdropProps={{
              timeout: 100,
              sx: {
                backgroundColor: "#00000020",
                justifyContent: "center",
                alignItems: "center",
                height: "100svh",
              },
            }}
          >
            <Box
              className="flex flex-col justify-center items-center w-full h-[100svh] "
              sx={{ scrollbarWidth: "none" }}
            >
              <div className="flex flex-row justify-center w-full h-[90svh] ">
                <div className="sm:w-10/12 lg:w-9/12 xl:w-6/12 w-9/12 bg-white p-5 rounded-lg">
                  <div className="flex flex-row justify-end">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setSheduledCalllogs([]);
                        setFilteredSheduledCalllogs([]);
                        setHasMoreCalls(true);
                      }}
                    >
                      <Image
                        src="/assets/crossIcon.png"
                        height={40}
                        width={40}
                        alt="*"
                      />
                    </button>
                  </div>
                  <div className="overflow-hidden">
                    {AgentCallLogLoader ? (
                      <div className="flex flex-row items-center justify-center h-full">
                        <CircularProgress size={35} />
                      </div>
                    ) : (
                      <div className="flex flex-col h-full overflow-hidden">
                        <div className="flex flex-col h-[20%] flex-shrink-0">
                          <div>
                            {SelectedAgent?.name
                              ? SelectedAgent.name.charAt(0).toUpperCase() +
                              SelectedAgent.name.slice(1)
                              : ""}{" "}
                            call activity
                          </div>
                          <div className="flex w-full items-center border border-gray-300 rounded-lg px-4 max-w-md shadow-sm mt-6">
                            <input
                              type="text"
                              placeholder="Search by name or phone"
                              className="flex-grow outline-none text-gray-600 placeholder-gray-400 border-none focus:outline-none focus:ring-0"
                              value={detailsFilterSearchValue}
                              onChange={(e) => {
                                const value = e.target.value;
                                // handleDetailsSearchChange(value);
                                setDetailsFilterSearchValue(value);
                              }}
                            />
                            <img
                              src="/otherAssets/searchIcon.png"
                              alt="Search"
                              width={20}
                              height={20}
                            />
                          </div>
                        </div>
                        <div
                          className="overflow-auto pb-4 flex-grow max-h-[74vh]"
                          id="scrollableDiv1"
                          style={{ scrollbarWidth: "none" }}
                        >
                          <InfiniteScroll
                            className="flex flex-col "
                            endMessage={
                              <p
                                style={{
                                  textAlign: "center",
                                  paddingTop: "10px",
                                  fontWeight: "400",
                                  fontFamily: "inter",
                                  fontSize: 16,
                                  color: "#00000060",
                                }}
                              >
                                {`You're all caught up`}
                              </p>
                            }
                            scrollableTarget="scrollableDiv1"
                            dataLength={filteredSheduledCalllogs.length}
                            next={() => {
                              //console.log;
                              fetchCallsInBatch(
                                SelectedItem,
                                filteredSheduledCalllogs.length
                              );
                            }}
                            hasMore={hasMoreCalls}
                            loader={
                              <div className="w-full flex flex-row justify-center mt-8">
                                {callsLoading && (
                                  <CircularProgress
                                    size={35}
                                    sx={{ color: "#7902DF" }}
                                  />
                                )}
                              </div>
                            }
                            style={{ overflow: "unset" }}
                          >
                            <div
                              className="flex flex-row items-center mt-6"
                              style={{
                                fontSize: 15,
                                fontWeight: "500",
                                color: "#00000070",
                              }}
                            >
                              <div className="w-3/12">Name</div>
                              <div className="w-2/12">Phone Number</div>
                              <div className="w-3/12">Address</div>
                              <div className="w-2/12">Tag</div>
                              <div className="w-2/12">Status</div>
                            </div>
                            {filteredSheduledCalllogs.length > 0 ? (
                              <div
                                className="w-full "
                                style={{ scrollbarWidth: "none" }}
                              >
                                {filteredSheduledCalllogs.map((item, index) => (
                                  <div
                                    key={index}
                                    className="w-full mt-4"
                                    style={{
                                      fontSize: 15,
                                      fontWeight: "500",
                                      scrollbarWidth: "none",
                                    }}
                                  >
                                    <div
                                      className="flex flex-row items-center mt-4"
                                      style={{
                                        fontSize: 15,
                                        fontWeight: "500",
                                      }}
                                    >
                                      <div className="w-3/12 flex flex-row items-center gap-2 truncate">
                                        <div className="h-[40px] w-[40px] rounded-full bg-black flex items-center justify-center text-white flex-shrink-0">
                                          {item?.LeadModel?.firstName
                                            ?.charAt(0)
                                            .toUpperCase()}
                                        </div>
                                        <div
                                          className="truncate"
                                          style={{
                                            width: "100px",
                                            textOverflow: "ellipsis",
                                          }}
                                        >
                                          {item?.LeadModel.firstName}{" "}
                                          {item?.LeadModel.lastName}
                                        </div>
                                      </div>
                                      <div className="w-2/12 truncate">
                                        {item?.LeadModel.phone || "-"}
                                      </div>
                                      <div className="w-3/12 truncate">
                                        {item?.LeadModel.address || "-"}
                                      </div>
                                      <div className="w-2/12 truncate flex flex-row items-center gap-2">
                                        {item?.tags?.length > 0 ? (
                                          <div className="flex flex-row gap-2">
                                            {item?.tags
                                              .slice(0, 2)
                                              .map((tag, idx) => (
                                                <div
                                                  key={idx}
                                                  className="flex flex-row items-center gap-2 bg-purple10 px-2 py-1 rounded-lg text-purple"
                                                >
                                                  {tag}
                                                </div>
                                              ))}
                                          </div>
                                        ) : (
                                          "-"
                                        )}
                                        {item?.tags?.length > 2 && (
                                          <div
                                            className="text-purple underline cursor-pointer"
                                            style={{
                                              fontWeight: "500",
                                              fontSize: 13,
                                            }}
                                            onClick={() => {
                                              setExtraTagsModal(true);
                                              setOtherTags(item?.tags);
                                            }}
                                          >
                                            +{item.tags.length - 2}
                                          </div>
                                        )}
                                      </div>
                                      <div className="w-2/12 truncate">
                                        {item?.status || "-"}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              GetLoadingOrNoCallsView()
                            )}
                          </InfiniteScroll>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Box>
          </Modal>

          {/* Leads list modal goes here */}
          <Modal
            open={showLeadDetailsModal}
            onClose={() => setShowLeadDetailsModal(false)}
            closeAfterTransition
            BackdropProps={{
              timeout: 100,
              sx: {
                backgroundColor: "#00000020",
                // //backdropFilter: "blur(20px)",
              },
            }}
          >
            <Box
              className="sm:w-10/12 lg:w-10/12 xl:w-8/12 w-11/12"
              sx={{ ...styles.modalsStyle, scrollbarWidth: "none" }}
            >
              <div className="flex flex-row justify-center w-full h-[80vh]">
                <div
                  className="sm:w-10/12 w-full h-[100%] overflow-none"
                  style={{
                    backgroundColor: "#ffffff",
                    padding: 20,
                    borderRadius: "13px",
                  }}
                >
                  <div className="flex flex-row items-center justify-between">
                    <div
                      style={{
                        fontWeight: "500",
                        fontSize: 17,
                      }}
                    >
                      {SelectedAgent?.name.slice(0, 1).toUpperCase() +
                        SelectedAgent?.name.slice(1)}{" "}
                      call activity
                    </div>
                    <button
                      onClick={() => {
                        setShowLeadDetailsModal(false);
                      }}
                    >
                      <Image
                        src={"/assets/crossIcon.png"}
                        height={40}
                        width={40}
                        alt="*"
                      />
                    </button>
                  </div>
                  <div
                    className="max-h-[92%] overflow-auto"
                    style={{
                      scrollbarWidth: "none",
                    }}
                  >
                    {AgentCallLogLoader ? (
                      <div className="flex flex-row items-center justify-center h-full">
                        <CircularProgress size={35} />
                      </div>
                    ) : (
                      <div>
                        <div className="flex w-full items-center border border-gray-300 rounded-lg px-4 max-w-md shadow-sm mt-6">
                          <input
                            type="text"
                            placeholder="Search by name or phone"
                            className="flex-grow outline-none text-gray-600 placeholder-gray-400 border-none focus:outline-none focus:ring-0"
                            value={leadsSearchValue}
                            onChange={(e) => {
                              const value = e.target.value;
                              // handleLeadsSearchChange(value);
                              setLeadsSearchValue(e.target.value);
                            }}
                          />
                          <img
                            src={"/otherAssets/searchIcon.png"}
                            alt="Search"
                            width={20}
                            height={20}
                          />
                        </div>

                        <div
                          className="flex flex-row items-center mt-6"
                          style={{
                            fontSize: 15,
                            fontWeight: "500",
                            color: "#00000070",
                          }}
                        >
                          <div className="w-3/12">Name</div>
                          <div className="w-2/12">Phone Number</div>
                          <div className="w-3/12">Address</div>
                          <div className="w-2/12">Tag</div>
                          <div className="w-2/12">Stage</div>
                        </div>

                        <div
                          className="h-[70svh] overflow-auto pb-[100px] mt-6"
                          id="scrollableDiv1"
                          style={{ scrollbarWidth: "none" }}
                        >
                          {filteredSelectedLeadsList.length > 0 ? (
                            <div className="w-full">
                              <InfiniteScroll
                                className="lg:flex hidden flex-col w-full"
                                endMessage={
                                  <p
                                    style={{
                                      textAlign: "center",
                                      paddingTop: "10px",
                                      fontWeight: "400",
                                      fontFamily: "inter",
                                      fontSize: 16,
                                      color: "#00000060",
                                    }}
                                  >
                                    {`You're all caught up`}
                                  </p>
                                }
                                scrollableTarget="scrollableDiv1"
                                dataLength={filteredSelectedLeadsList.length}
                                next={() => {
                                  fetchLeadsInBatch(
                                    SelectedItem,
                                    filteredSelectedLeadsList.length
                                  );
                                }}
                                hasMore={hasMoreLeads}
                                loader={
                                  <div className="w-full flex flex-row justify-center mt-8">
                                    {leadsLoading && (
                                      <CircularProgress
                                        size={35}
                                        sx={{ color: "#7902DF" }}
                                      />
                                    )}
                                  </div>
                                }
                                style={{ overflow: "unset" }}
                              >
                                {filteredSelectedLeadsList.map(
                                  (item, index) => (
                                    <div
                                      key={index}
                                      className="w-full mt-4"
                                      style={{
                                        fontSize: 15,
                                        fontWeight: 500,
                                        scrollbarWidth: "none",
                                      }}
                                    >
                                      <div
                                        className="flex flex-row items-center mt-4"
                                        style={{
                                          fontSize: 15,
                                          fontWeight: 500,
                                        }}
                                      >
                                        <div className="w-3/12 flex flex-row items-center gap-2 truncate">
                                          <div className="h-[40px] w-[40px] rounded-full bg-black flex items-center justify-center text-white flex-shrink-0">
                                            {item?.firstName
                                              ?.charAt(0)
                                              .toUpperCase()}
                                          </div>
                                          <div>
                                            <div className="truncate w-[100px]">
                                              {item?.firstName} {item?.lastName}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="w-2/12 truncate">
                                          {item?.phone || "-"}
                                        </div>
                                        <div className="w-3/12 truncate">
                                          {item?.address || "-"}
                                        </div>
                                        <div className="w-2/12">
                                          {item.tags.length > 0 ? (
                                            <div className="w-full truncate flex flex-row items-center gap-1">
                                              {item.tags
                                                .slice(0, 1)
                                                .map((tag, index) => (
                                                  <div
                                                    key={index}
                                                    className="flex flex-row items-center gap-2 bg-purple10 px-2 py-1 rounded-lg text-purple"
                                                  >
                                                    {tag}
                                                  </div>
                                                ))}
                                              {item.tags.length > 1 && (
                                                <div
                                                  className="text-purple underline cursor-pointer"
                                                  onClick={() => {
                                                    setExtraTagsModal(true);
                                                    setOtherTags(item.tags);
                                                  }}
                                                >
                                                  +{item.tags.length - 1}
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            "-"
                                          )}
                                        </div>
                                        <div className="w-2/12 truncate">
                                          {item?.PipelineStages?.stageTitle || "-"}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              </InfiniteScroll>
                            </div>
                          ) : !leadsLoading ? (
                            <div className="text-center mt-6 text-3xl">
                              No Call Found
                            </div>
                          ) : (
                            <div className="text-center mt-6 text-3xl">
                              Loading...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Box>
          </Modal>

          {/* Modal for All Tags */}
          <Modal
            open={extraTagsModal}
            onClose={() => setExtraTagsModal(false)}
            closeAfterTransition
            BackdropProps={{
              timeout: 1000,
              sx: {
                backgroundColor: "#00000020",
                // //backdropFilter: "blur(20px)",
              },
            }}
          >
            <Box className="lg:w-3/12 sm:w-full w-4/12" sx={styles.modalsStyle}>
              <div className="flex flex-row justify-center w-full">
                <div
                  className="sm:w-full w-full"
                  style={{
                    backgroundColor: "#ffffff",
                    padding: 20,
                    borderRadius: "13px",
                  }}
                >
                  <div className="w-full flex items-center justify-between">
                    <div
                      style={{
                        fontsize: 15,
                        fontWeight: "600",
                      }}
                    >
                      Other Tags
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setExtraTagsModal(false);
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
                  </div>
                  <div className="flex flex-row items-center gap-4 flex-wrap mt-2">
                    {otherTags?.map((tag, index) => {
                      return (
                        <div
                          key={index}
                          className="flex flex-row items-center gap-2"
                        >
                          <div className="flex flex-row items-center gap-2 bg-purple10 px-2 py-1 rounded-lg">
                            <div
                              className="text-purple" //1C55FF10
                            >
                              {tag}
                            </div>
                            {/* {DelTagLoader &&
                          tag.includes(DelTagLoader) ? (
                          <div>
                            <CircularProgress size={15} />
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              handleDelTag(tag);
                            }}
                          >
                            <X
                              size={15}
                              weight="bold"
                              color="#7902DF"
                            />
                          </button>
                        )} */}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Box>
          </Modal>
        </>
      )}
    </div>
  );
}

export default SheduledCalls;
const styles = {
  text: {
    fontSize: 15,
    color: "#00000090",
    fontWeight: "500",
  },
  text2: {
    textAlignLast: "left",
    fontSize: 15,
    // color: '#000000',
    fontWeight: "500",
    whiteSpace: "nowrap", // Prevent text from wrapping
    overflow: "hidden", // Hide overflow text
    textOverflow: "ellipsis", // Add ellipsis for overflow text
  },
  modalsStyle: {
    // height: "auto",
    // height: "90svh",
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

export const ShowConfirmationPopup = ({
  showConfirmationPopuup,
  setShowConfirmationPopup,
  PauseLoader,
  pauseAgent,
  resumeCalls,
  color,
}) => {
  return (
    <div>
      <Modal
        open={showConfirmationPopuup} //showConfirmationPopuup
        onClose={() => {
          setShowConfirmationPopup(null);
        }}
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box
          className="w-10/12 sm:w-7/12 md:w-5/12 lg:w-4/12 p-8 rounded-[15px]"
          sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
        >
          <div style={{ width: "100%" }}>
            <div
              className="max-h-[60vh] overflow-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {/* <div style={{ width: "100%", direction: "row", display: "flex", justifyContent: "end", alignItems: "center" }}>
                <div style={{ direction: "row", display: "flex", justifyContent: "end" }}>
                  <button onClick={() => {
                    setShowWarningModal(false);
                  }} className='outline-none'>
                    <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                  </button>
                </div>
              </div> */}

              <div className="flex flex-row items-center justify-center gap-2 -mt-1">
                <Image
                  src={"/assets/warningFill.png"}
                  height={18}
                  width={18}
                  alt="*"
                />
                <p
                  className="text-black"
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Are you sure you want to {showConfirmationPopuup}
                </p>
              </div>
            </div>
            <div className="flex flex-row items-center gap-4 mt-6">
              <button
                className="w-4/12"
                onClick={() => {
                  setShowConfirmationPopup(null);
                }}
              >
                Cancel
              </button>
              <div className="w-8/12">
                {PauseLoader ? (
                  <div className="flex flex-row iems-center justify-center w-full mt-4">
                    <CircularProgress size={25} />
                  </div>
                ) : (
                  <button
                    className={`outline-none ${color ? "bg-purple" : "bg-red"}`}
                    style={{
                      color: "white",
                      height: "50px",
                      borderRadius: "10px",
                      width: "100%",
                      fontWeight: 600,
                      fontSize: "20",
                    }}
                    onClick={() => {
                      if (color === true) {
                        resumeCalls();
                      } else {
                        pauseAgent();
                      }
                    }}
                  >
                    Yes! {showConfirmationPopuup[0].toUpperCase()}
                    {showConfirmationPopuup.slice(1)}
                  </button>
                )}
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};
