import React, { useEffect, useState } from "react";
import Image from "next/image";
import Apis from "../apis/Apis";
import axios from "axios";
import { Box, CircularProgress, Modal, Popover } from "@mui/material";
import moment from "moment";
import { GetFormattedDateString } from "@/utilities/utility";
import { getAgentsListImage } from "@/utilities/agentUtilities";
import { ShowConfirmationPopup } from "./CallActivties";
import { UserTypes } from "@/constants/UserTypes";

function SheduledCalls({ user }) {
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
  //code for details view search
  const [filteredSheduledCalllogs, setFilteredSheduledCallDetails] = useState(
    []
  );
  const [callDetailsSearchValue, setcallDetailsSearchValue] = useState("");
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

  const [PauseLoader, setPauseLoader] = useState(false);

  useEffect(() => {
    getAgents();
    // getSheduledCallLogs();
  }, []);

  //code to show popover
  const handleShowPopup = (event, item, agent) => {
    setAnchorEl(event.currentTarget);
    // console.log("Selected item details are ", item);
    // console.log("Selected agent  details are ", agent);
    localStorage.setItem("curentCalllogItem", JSON.stringify(item));
    localStorage.setItem("currentCalllogAgent", JSON.stringify(agent));
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
    // console.log("Agent selected is:", agent);
    // console.log("Item selected is:", item);
    setSelectedAgent(agent);
    setSelectedItem(item);
    setSelectedLeadsList(item.leads);
    setFilteredSelectedLeadsList(item.leads);
    setShowLeadDetailsModal(true);
  };

  //code to filter slected agent leads
  const handleLeadsSearchChange = (value) => {
    if (value.trim() === "") {
      //// console.log("Should reset to original");
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
        // console.log("Localdat recieved is :--", Data);
        AuthToken = Data.token;
      }

      // console.log("Auth token is:", AuthToken);

      let mainAgent = null;
      const localAgent = localStorage.getItem("agentDetails");
      if (localAgent) {
        const agentDetails = JSON.parse(localAgent);
        // console.log("Check 1 cleear");
        // console.log("Agent details are:", agentDetails);
        mainAgent = agentDetails;
      }
      // const ApiPath = `${Apis.getSheduledCallLogs}?mainAgentId=${mainAgent.id}`;
      const ApiPath = `${Apis.getSheduledCallLogs}?scheduled=true`;

      // console.log("Api path is: ", ApiPath);
      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // console.log("Response of get Scheduled api is:", response.data.data);

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

  const handleShowDetails = () => {
    //// console.log("Details of item are:", SelectedItem)
    // const AgentId = filteredAgentsList.map((item) => item.id);
    //// console.log("Agent id is:", AgentId);
    //// console.log("selected agent is:", SelectedAgent);
    // console.log("Call log details are :", callDetails);
    let updatedCallDetails = callDetails.map((item) => item.agentCalls);
    let CallsArray = [];

    // updatedCallDetails.forEach((item) => {
    //     if (item.agentId === SelectedItem.id) {
    //         CallsArray.push(item);
    //     }
    // });

    //// console.log("Calls of this agent are :", CallsArray);

    const calls = SelectedItem.agentCalls.map((item) =>
      item.calls.map((item) => item.leadId)
    );

    const leads = SelectedItem.leads.map((item) => item.id);

    const matchingCallLeadsData = SelectedItem.leads.filter((lead) => {
      lead.id ===
        SelectedItem.agentCalls.map((item) =>
          item.calls.map((item) => item.leadId)
        );
      return lead;
    });
    // console.log("Leadcall matching data", matchingCallLeadsData);
    // console.log("Lead id are", calls);

    setSheduledCalllogs(matchingCallLeadsData);
    setFilteredSheduledCallDetails(matchingCallLeadsData);
    setShowDetailsModal(true);
  };

  //code for details search field
  const handleDetailsSearchChange = (value) => {
    if (value.trim() === "") {
      //// console.log("Should reset to original");
      // Reset to original list when input is empty
      setFilteredSheduledCallDetails(sheduledCalllogs);
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

    setFilteredSheduledCallDetails(filtered);
  };

  const handleSearchChange = (value) => {
    if (value.trim() === "") {
      //// console.log("Should reset to original");
      // Reset to original list when input is empty
      setFilteredAgentsList(agentsList);
      return;
    }

    const filtered = agentsList.filter((item) => {
      const term = value.toLowerCase();
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

  //code to pause the agent
  const pauseAgents = async () => {
    // console.log("Selected agent is:", SelectedItem);

    try {
      setPauseLoader(true);
      const ApiPath = Apis.pauseAgent;

      // console.log("Api path is: ", ApiPath);

      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        // console.log("Localdat recieved is :--", Data);
        AuthToken = Data.token;
      }

      // console.log("Auth token is:", AuthToken);
      const ApiData = {
        // mainAgentId: SelectedItem.id
        batchId: SelectedItem.id,
      };
      // console.log("Apidata is", ApiData);
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // console.log("Response of get agents api is:", response.data);
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
          // console.log("Current status is:", currentStatus);

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
    // console.log("Selected agent is:", SelectedItem);
    // console.log("Resume call api trigered")
    // return
    try {
      setPauseLoader(true);
      const ApiPath = Apis.resumeCalls;

      // console.log("Api path is: ", ApiPath);

      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        // console.log("Localdat recieved is :--", Data);
        AuthToken = Data.token;
      }

      // console.log("Auth token is:", AuthToken);
      const ApiData = {
        // mainAgentId: SelectedItem.id
        batchId: SelectedItem.id,
      };
      // console.log("Apidata is", ApiData);
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // console.log("Response of get agents api is:", response.data);
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
          // console.log("Current status is:", currentStatus);

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

  return (
    <div className="w-full items-start">
      <div className="flex w-full pl-10 flex-row items-start gap-3">
        {/* <div className="flex w-3/12 items-center border border-gray-300 rounded-lg px-4 max-w-md shadow-sm">
          <input
            type="text"
            placeholder="Search by name, email or phone"
            className="flex-grow outline-none text-gray-600 placeholder-gray-400 border-none focus:outline-none focus:ring-0"
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value;
              handleSearchChange(value);
              setSearchValue(e.target.value);
            }}
          />
          <img
            src={"/otherAssets/searchIcon.png"}
            alt="Search"
            width={20}
            height={20}
          />
        </div> */}

        {/* <button>
                    <Image src={'/otherAssets/filterBtn.png'}
                        height={36}
                        width={36}
                        alt='Search'
                    />
                </button> */}
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
          <div style={styles.text}>Scheduled on</div>
        </div>
        <div className="w-1/12">
          <div style={styles.text}>Action</div>
        </div>
      </div>

      <div>
        {initialLoader ? (
          <div className="flex flex-row items-center justify-center mt-12">
            <CircularProgress size={35} />
          </div>
        ) : (
          <div
            className={`h-[67vh] overflow-auto`}
            style={{ scrollbarWidth: "none" }}
          >
            {filteredAgentsList.length > 0 ? (
              <div className={`h-[67vh] overflow-auto`}>
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

                                <div style={{ width: "fit-content" }}>
                                  {getAgentsListImage(agent?.agents[0])}
                                </div>
                                <div style={styles.text2}>{agent.name}</div>
                              </div>
                              <div className="w-2/12 ">
                                {user.user.userType == UserTypes.RealEstateAgent
                                  ? `${agent?.agents[0]?.agentObjective
                                      ?.slice(0, 1)
                                      .toUpperCase()}${agent?.agents[0]?.agentObjective?.slice(
                                      1
                                    )}`
                                  : `${agent?.agents[0]?.agentRole}`}
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
                                    {GetFormattedDateString(item?.createdAt)}
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </div>
                              <div className="w-2/12">
                                {item.startTime ? (
                                  <div style={styles.text2}>
                                    {moment(item.startTime).format(
                                      "MMM DD,YYYY - hh:mm A"
                                    )}
                                  </div>
                                ) : (
                                  "-"
                                )}
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
                                      boxShadow:
                                        "0px 0px 10px rgba(0, 0, 0, 0.05)",
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
                                            if (
                                              SelectedItem?.status == "Paused"
                                            ) {
                                              //// console.log("Calls are paused")
                                              setColor(true);
                                              setShowConfirmationPopup(
                                                "resume Calls"
                                              );
                                            } else {
                                              //// console.log("Calls are active")
                                              setShowConfirmationPopup(
                                                "pause Calls"
                                              );
                                              setColor(false);
                                            }
                                            // console.log("Cha")
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
                                    showConfirmationPopuup={
                                      showConfirmationPopuup
                                    }
                                    setShowConfirmationPopup={
                                      setShowConfirmationPopup
                                    }
                                    pauseAgent={pauseAgents}
                                    color={color}
                                    PauseLoader={PauseLoader}
                                    resumeCalls={resumeCalls}
                                  />
                                )}
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
                No Call Scheduled
              </div>
            )}
          </div>
        )}
      </div>

      {/* agent call details Modal goes here */}
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
          className="sm:w-10/12 lg:w-10/12 xl:w-8/12 w-11/12 max-h-[70vh]"
          sx={{ ...styles.modalsStyle, scrollbarWidth: "none" }}
        >
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-10/12 w-full"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
              }}
            >
              <div className="flex flex-row justify-between items-center">
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
                    <div className="flex w-full items-center border border-gray-300 rounded-lg px-4 max-w-md shadow-sm mt-6">
                      <input
                        type="text"
                        placeholder="Search by name, email or phone"
                        className="flex-grow outline-none text-gray-600 placeholder-gray-400 border-none focus:outline-none focus:ring-0"
                        value={callDetailsSearchValue}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleDetailsSearchChange(value);
                          setcallDetailsSearchValue(e.target.value);
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
                      <div className="w-full">
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
                                  <div
                                    className="h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white"
                                    style={{ flexShrink: 0 }}
                                  >
                                    {item?.firstName.slice(0, 1).toUpperCase()}
                                  </div>
                                  <div className="truncate">
                                    <div
                                      className="truncate w-[100px]"
                                      // style={{ textOverflow: "ellipsis" }}
                                    >
                                      {item?.firstName} {item?.lastName}
                                    </div>
                                    {/* <div
                                      style={{
                                        fontSize: 11,
                                        fontWeight: "500",
                                        color: "#00000060",
                                      }}
                                    >
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
                                <div className="w-2/12 truncate">-</div>
                                <div className="w-2/12 truncate">Scheduled</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center mt-6 text-3xl">No Call</div>
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
          className="sm:w-10/12 lg:w-10/12 xl:w-8/12 w-11/12 max-h-[70vh]"
          sx={{ ...styles.modalsStyle, scrollbarWidth: "none" }}
        >
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-10/12 w-full"
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
              <div>
                {AgentCallLogLoader ? (
                  <div className="flex flex-row items-center justify-center h-full">
                    <CircularProgress size={35} />
                  </div>
                ) : (
                  <div>
                    <div className="flex w-full items-center border border-gray-300 rounded-lg px-4 max-w-md shadow-sm mt-6">
                      <input
                        type="text"
                        placeholder="Search by name, email or phone"
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
                                  <div className="truncate">
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
                                <div className="w-2/12 truncate flex flex-row gap-1">
                                  {item.tags.slice(0, 2).map((tag, index) => {
                                    return (
                                      <div
                                        key={index}
                                        className="bg-[#1C55FF10] text-[#1C55FF] rounded p-2"
                                      >
                                        {tag}
                                      </div>
                                    );
                                  })}
                                  {item.tags.length > 2 && (
                                    <div>+{item.tags.length - 2}</div>
                                  )}
                                </div>
                                <div className="w-2/12 truncate">Scheduled</div>
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
