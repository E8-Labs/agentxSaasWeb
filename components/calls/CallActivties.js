import React, { useEffect, useState } from "react";
import Image from "next/image";
import Apis from "../apis/Apis";
import axios from "axios";
import { Box, CircularProgress, Modal, Popover } from "@mui/material";
import moment from "moment";
import { GetFormattedDateString } from "@/utilities/utility";
import { getAgentsListImage } from "@/utilities/agentUtilities";

function SheduledCalls() {
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

  useEffect(() => {
    getAgents();
    // getSheduledCallLogs();
  }, []);

  //code to show popover
  const handleShowPopup = (event, item, agent) => {
    setAnchorEl(event.currentTarget);
    console.log("Selected item details are ", item);
    console.log("Selected agent  details are ", agent);
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
    console.log("Agent selected is:", agent);
    console.log("Item selected is:", item);
    setSelectedAgent(agent);
    setSelectedItem(item);
    setSelectedLeadsList(item.leads);
    setFilteredSelectedLeadsList(item.leads);
    setShowLeadDetailsModal(true);
  };

  //code to filter slected agent leads
  const handleLeadsSearchChange = (value) => {
    if (value.trim() === "") {
      // console.log("Should reset to original");
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
  const getAgents = async () => {
    try {
      setInitialLoader(true);

      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        console.log("Localdat recieved is :--", Data);
        AuthToken = Data.token;
      }

      console.log("Auth token is:", AuthToken);

      let mainAgent = null;
      const localAgent = localStorage.getItem("agentDetails");
      if (localAgent) {
        const agentDetails = JSON.parse(localAgent);
        console.log("Check 1 cleear");
        console.log("Agent details are:", agentDetails);
        mainAgent = agentDetails;
      }
      // const ApiPath = `${Apis.getSheduledCallLogs}?mainAgentId=${mainAgent.id}`;
      const ApiPath = `${Apis.getSheduledCallLogs}?scheduled=false`;
      console.log("Api path is: ", ApiPath); //scheduled
      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        console.log("Response of get sheduled api is:", response.data.data);

        setFilteredAgentsList(response.data.data);
        setCallDetails(response.data.data);
        setAgentsList(response.data.data);
      }
    } catch (error) {
      console.error("Error occured in get Agents api is :", error);
    } finally {
      setInitialLoader(false);
    }
  };

  //code to show call log details popup

  const handleShowDetails = () => {
    console.log("Details of item are:", SelectedItem)
    // const AgentId = filteredAgentsList.map((item) => item.id);
    // console.log("Agent id is:", AgentId);
    console.log("selected agent is:", SelectedAgent);
    console.log("Call log details are :", callDetails);
    let updatedCallDetails = callDetails.map((item) => item.agentCalls);
    let CallsArray = [];

    // updatedCallDetails.forEach((item) => {
    //     if (item.agentId === SelectedItem.id) {
    //         CallsArray.push(item);
    //     }
    // });

    // console.log("Calls of this agent are :", CallsArray);

    let matchingPastCallsLeads = SelectedItem.leads.filter((lead) => {
      lead.id === SelectedItem.pastCalls.map((item) => item.leadId);
      return lead;
    });

    console.log("Matching lead with the past call", SelectedItem.pastCalls);

    setSheduledCalllogs(SelectedItem.pastCalls);
    setFilteredSheduledCalllogs(SelectedItem.pastCalls);
    setShowDetailsModal(true);
  };

  //code to filter slected agent leads
  const handleDetailsSearchChange = (value) => {
    if (value.trim() === "") {
      // console.log("Should reset to original");
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
      // console.log("Should reset to original");
      // Reset to original list when input is empty
      setFilteredAgentsList(agentsList);
      return;
    }

    // console.log("Value is", value);

    const filtered = agentsList.filter((item) => {
      const term = value.toLowerCase();
      // console.log("Item to lower case is", term)
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
    console.log("Selected agent is:", SelectedItem);

    try {
      setPauseLoader(true);
      const ApiPath = Apis.pauseAgent;

      console.log("Api path is: ", ApiPath);

      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        console.log("Localdat recieved is :--", Data);
        AuthToken = Data.token;
      }

      console.log("Auth token is:", AuthToken);
      const ApiData = {
        // mainAgentId: SelectedItem.id
        batchId: SelectedItem.id,
      };
      console.log("Apidata is", ApiData);
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        console.log("Response of get agents api is:", response.data);
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
          console.log("Current status is:", currentStatus);

          setFilteredAgentsList(currentStatus);
          handleClosePopup();
        }
        // setFilteredAgentsList(response.data.data);
        // setAgentsList(response.data.data);
      }
    } catch (error) {
      console.error("Error occured in get Agents api is :", error);
    } finally {
      setPauseLoader(false);
    }
  };

  //function to resume calls
  const resumeCalls = async () => {
    console.log("Selected agent is:", SelectedItem);
    console.log("Resume call api trigered")
    // return
    try {
      setPauseLoader(true);
      const ApiPath = Apis.resumeCalls;

      console.log("Api path is: ", ApiPath);

      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        console.log("Localdat recieved is :--", Data);
        AuthToken = Data.token;
      }

      console.log("Auth token is:", AuthToken);
      const ApiData = {
        // mainAgentId: SelectedItem.id
        batchId: SelectedItem.id,
      };
      console.log("Apidata is", ApiData);
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        console.log("Response of get agents api is:", response.data);
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
          console.log("Current status is:", currentStatus);

          setFilteredAgentsList(currentStatus);
          handleClosePopup();
        }
        // setFilteredAgentsList(response.data.data);
        // setAgentsList(response.data.data);
      }
    } catch (error) {
      console.error("Error occured in get Agents api is :", error);
    } finally {
      setPauseLoader(false);
    }
  };

  return (
    <div className="w-full items-start overflow-hidden">
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
                    // console.log("Calls are paused")
                    setColor(true);
                    setShowConfirmationPopup("resume Calls")
                  } else {
                    // console.log("Calls are active")
                    setShowConfirmationPopup("pause Calls")
                    setColor(false);
                  }
                  console.log("Cha")
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
              handleShowDetails();
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

      <div className="flex w-full pl-10 flex-row items-start gap-3 overflow-hidden">
      </div>

      <div className="w-full flex flex-row justify-between mt-10 px-10">
        <div className="w-3/12">
          <div style={styles.text}>Agent</div>
        </div>
        <div className="w-2/12 ">
          <div style={styles.text}>Objective</div>
        </div>
        <div className="w-1/12">
          <div style={styles.text}>Leads</div>
        </div>
        <div className="w-1/12">
          <div style={styles.text}>Date created</div>
        </div>
        <div className="w-2/12">
          <div style={styles.text}>Call Status</div>
        </div>
        <div className="w-1/12">
          <div style={styles.text}>
            Action
          </div>
        </div>
      </div>

      <div>
        {initialLoader ? (
          <div className="flex flex-row items-center justify-center mt-12">
            <CircularProgress size={35} />
          </div>
        ) : (
          <div style={{ scrollbarWidth: "none" }}>
            {
              filteredAgentsList.length > 0 ? (
                <div className="overflow-auto max-h-[67svh]">
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
                                <div className="w-3/12 flex flex-row gap-4 items-center">
                                  {/* {agent?.agents[0]?.thumb_profile_image ? (
                                    <Image
                                      className="rounded-full"
                                      src={agent?.agents[0].thumb_profile_image}
                                      height={40}
                                      width={40}
                                      style={{
                                        height: "40px",
                                        width: "40px",
                                        resize: "cover",
                                      }}
                                      alt="*"
                                    />
                                  ) : (
                                    <div className="h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white">
                                      {agent.name.slice(0, 1).toUpperCase()}
                                    </div>
                                  )} */}

                                  <div>
                                    {getAgentsListImage(agent?.agents[0])}
                                  </div>

                                  <div style={styles.text2}>{agent.name}</div>
                                </div>
                                <div className="w-2/12 ">
                                  {agent?.agents[0]?.agentObjective ? (
                                    <div style={styles.text2}>
                                      {agent.agents[0]?.agentObjective}
                                    </div>
                                  ) : (
                                    "-"
                                  )}
                                </div>
                                <div className="w-1/12">
                                  <button
                                    style={styles.text2}
                                    className="text-purple underline outline-none"
                                    onClick={() => {
                                      handleShowLeads(agent, item);
                                    }}
                                  >
                                    {item?.totalLeads}
                                  </button>
                                </div>
                                <div className="w-1/12">
                                  {item?.createdAt ? (
                                    <div style={styles.text2}>
                                      {GetFormattedDateString(
                                        item?.createdAt
                                      )}
                                    </div>
                                  ) : (
                                    "-"
                                  )}
                                </div>
                                <div className="w-2/12">
                                  {/* {
                                                                        item.startTime ?
                                                                            <div style={styles.text2}>
                                                                                {moment(item.startTime).format("MMM DD,YYYY - hh:mm A")}
                                                                            </div> : "-"
                                                                    } */}
                                  {item.status}
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
                <div style={{ fontWeight: "600", fontSize: 24, textAlign: "center", marginTop: 20 }}>
                  No Call Activity Found
                </div>
              )
            }
          </div>
        )}
      </div>

      {/* Modals goes here */}
      <Modal
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
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
          <div className="flex flex-row justify-center w-full max-h-[80svh]">
            <div
              className="sm:w-10/12 w-full"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
              }}
            >
              <div className="flex flex-row justify-end">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
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
              <div>
                {AgentCallLogLoader ? (
                  <div className="flex flex-row items-center justify-center h-full">
                    <CircularProgress size={35} />
                  </div>
                ) : (
                  <div>
                    <div>
                      {SelectedAgent?.name.slice(0, 1).toUpperCase() +
                        SelectedAgent?.name.slice(1)}{" "}
                      call activity
                    </div>

                    <div className="flex w-full items-center border border-gray-300 rounded-lg px-4 max-w-md shadow-sm mt-6">
                      <input
                        type="text"
                        placeholder="Search by name or phone"  //, email
                        className="flex-grow outline-none text-gray-600 placeholder-gray-400 border-none focus:outline-none focus:ring-0"
                        value={detailsFilterSearchValue}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleDetailsSearchChange(value);
                          setDetailsFilterSearchValue(e.target.value);
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
                      <div className="w-2/12">Status</div>
                    </div>

                    {sheduledCalllogs.length > 0 ? (
                      <div
                        className="w-full max-h[92%] overflow-auto"
                        style={{
                          scrollbarWidth: "none"
                        }}
                      >
                        {filteredSheduledCalllogs.map((item, index) => {
                          return (
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
                                style={{ fontSize: 15, fontWeight: "500" }}
                              >
                                <div className="w-3/12 flex flex-row items-center gap-2 truncate">
                                  <div className="h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white flex-shrink-0">
                                    {item?.LeadModel.firstName.slice(0, 1).toUpperCase()}
                                  </div>
                                  <div className="truncate" style={{
                                    width: "100px",
                                    textOverflow: "ellipsis"
                                  }}>
                                    {item?.LeadModel.firstName} {item?.LeadModel.lastName}
                                  </div>
                                  {/* <div style={{ fontSize: 11, fontWeight: "500", color: "#00000060" }}>
                                                                                        {item?.email}
                                                                                    </div> */}
                                </div>
                                <div className="w-2/12 truncate">
                                  {item?.LeadModel.phone}
                                </div>
                                <div className="w-3/12 truncate">
                                  {item?.LeadModel.address || "-"}
                                </div>
                                <div className="w-2/12 truncate flex flex-row items-center gap-2">
                                  {item?.tags?.length > 0 ? (
                                    <div className="flex flex-row gap-2">
                                      {item?.tags?.slice(0, 2).map((tag, index) => {
                                        return (
                                          <div
                                            key={index}
                                            className="flex flex-row items-center gap-2 bg-purple10 px-2 py-1 rounded-lg text-purple"
                                          >
                                            {tag}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    "-"
                                  )
                                  }
                                  {item?.tags?.length > 1 && (
                                    <div
                                      key={index}
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
                                      {item.tags.length - 1}
                                    </div>
                                  )}
                                </div>
                                <div className="w-2/12 truncate">
                                  {item?.status}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center mt-6 text-3xl">
                        No Call Found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Box>
      </Modal>

      {/* Modals goes here */}
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
                  scrollbarWidth: "none"
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
                          handleLeadsSearchChange(value);
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
                      <div className="w-2/12">Status</div>
                    </div>

                    {filteredSelectedLeadsList.length > 0 ? (
                      <div className="w-full">
                        {filteredSelectedLeadsList.map((item, index) => {
                          return (
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
                                style={{ fontSize: 15, fontWeight: "500" }}
                              >
                                <div className="w-3/12 flex flex-row items-center gap-2 truncate">
                                  <div className="h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white flex-shrink-0">
                                    {item?.firstName?.slice(0, 1).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="truncate w-[100px]">
                                      {item?.firstName} {item?.lastName}
                                    </div>
                                    {/* <div style={{ fontSize: 11, fontWeight: "500", color: "#00000060" }}>
                                                                                        {item?.email}
                                                                                    </div> */}
                                  </div>
                                </div>
                                <div className="w-2/12 truncate">
                                  {item?.phone}
                                </div>
                                <div className="w-3/12 truncate">
                                  {item?.address}
                                </div>
                                <div className="w-2/12">
                                  {
                                    item.tags.length > 0 ? (
                                      <div className="w-full truncate flex flex-row items-center gap-1">
                                        {item.tags.slice(0, 1).map((tag, index) => {
                                          return (
                                            <div
                                              key={index}
                                              // className="bg-[#1C55FF10] text-[#1C55FF] rounded p-2"
                                              className="flex flex-row items-center gap-2 bg-purple10 px-2 py-1 rounded-lg text-purple"
                                            >
                                              {tag}
                                            </div>
                                          );
                                        })}
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
                                    )
                                  }
                                </div>
                                <div className="w-2/12 truncate">
                                  {SelectedItem?.status}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center mt-6 text-3xl">
                        No Call Found
                      </div>
                    )}
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
        <Box
          className="lg:w-3/12 sm:w-full w-4/12"
          sx={styles.modalsStyle}
        >
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

export const ShowConfirmationPopup = ({
  showConfirmationPopuup,
  setShowConfirmationPopup,
  PauseLoader,
  pauseAgent,
  resumeCalls,
  color
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
                  }}>
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
                        resumeCalls()
                      } else {
                        pauseAgent()
                      }
                    }}
                  >
                    Yes! {showConfirmationPopuup[0].toUpperCase()}{showConfirmationPopuup.slice(1)}
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
