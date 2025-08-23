import Body from "@/components/onboarding/Body";
import Header from "@/components/onboarding/Header";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { useRouter } from "next/navigation";
import Footer from "@/components/onboarding/Footer";
import {
  Alert,
  Box,
  CircularProgress,
  Fade,
  FormControl,
  MenuItem,
  Modal,
  Select,
  Snackbar,
} from "@mui/material";
import Apis from "../apis/Apis";
import axios from "axios";
import { CaretDown, Minus, YoutubeLogo } from "@phosphor-icons/react";
import PipelineStages from "./PipelineStages";
import { set } from "draft-js/lib/DefaultDraftBlockRenderMap";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "../dashboard/leads/AgentSelectSnackMessage";
import IntroVideoModal from "../createagent/IntroVideoModal";
import VideoCard from "../createagent/VideoCard";
import { HowtoVideos, PersistanceKeys } from "@/constants/Constants";

const Pipeline1 = ({ handleContinue }) => {
  const router = useRouter();

  const [shouldContinue, setShouldContinue] = useState(true);
  const [toggleClick, setToggleClick] = useState(false);
  const [selectedPipelineItem, setSelectedPipelineItem] = useState(null);
  const [selectPipleLine, setSelectPipleLine] = useState("");
  const [introVideoModal, setIntroVideoModal] = useState(false);
  const [selectedPipelineStages, setSelectedPipelineStages] = useState([]);
  const [oldStages, setOldStages] = useState([]);
  const [pipelinesDetails, setPipelinesDetails] = useState([]);
  const [assignedLeads, setAssignedLeads] = useState({});
  const [rowsByIndex, setRowsByIndex] = useState({});
  const [createPipelineLoader, setPipelineLoader] = useState(false);

  const [nextStage, setNextStage] = useState({});
  const [selectedNextStage, setSelectedNextStage] = useState({});

  const [showRearrangeErr, setShowRearrangeErr] = useState(null);

  // const [nextStage, setNextStage] = useState([]);
  // const [selectedNextStage, setSelectedNextStage] = useState([]);

  const [reorderSuccessBarMessage, setReorderSuccessBarMessage] =
    useState(null);
  const [isVisibleSnack, setIsVisibleSnack] = useState(false);
  const [snackType, setSnackType] = useState(null);

  useEffect(() => {
    // //console.log;
  }, [reorderSuccessBarMessage]);

  const [reorderLoader, setReorderLoader] = useState(false);
  //code for new Lead calls
  // const [rows, setRows] = useState([]);
  // const [assignedNewLEad, setAssignedNewLead] = useState(false);
  useEffect(() => {
    const localAgentData = localStorage.getItem("agentDetails");
    if (localAgentData && localAgentData != "undefined") {
      const Data = JSON.parse(localAgentData);
      if (Data.agents.length === 1 && Data.agents[0].agentType == "inbound") {
        return;
      } else {
        // //console.log;
      }
    }
    const localCadences = localStorage.getItem("AddCadenceDetails");
    if (localCadences && localCadences != "null") {
      const localCadenceDetails = JSON.parse(localCadences);
      // //console.log;

      // Set the selected pipeline item
      const storedPipelineItem = localCadenceDetails.pipelineID;
      const storedCadenceDetails = localCadenceDetails.cadenceDetails;

      // Fetch pipelines to ensure we have the list
      // getPipelines().then(() => {
      const selectedPipeline = pipelinesDetails.find(
        (pipeline) => pipeline.id === storedPipelineItem
      );

      if (selectedPipeline) {
        // //console.log;
        setSelectedPipelineItem(selectedPipeline);
        setSelectedPipelineStages(selectedPipeline.stages);

        // Restore assigned leads and rows by index
        const restoredAssignedLeads = {};
        const restoredRowsByIndex = {};
        const restoredNextStage = {};

        storedCadenceDetails?.forEach((cadence) => {
          const stageIndex = selectedPipeline.stages.findIndex(
            (stage) => stage.id === cadence.stage
          );

          if (stageIndex !== -1) {
            restoredAssignedLeads[stageIndex] = true;
            restoredRowsByIndex[stageIndex] = cadence.calls || [];
            if (cadence.moveToStage) {
              const nextStage = selectedPipeline.stages.find(
                (stage) => stage.id === cadence.moveToStage
              );
              if (nextStage) {
                restoredNextStage[stageIndex] = nextStage;
              }
            }
          }
        });

        setAssignedLeads(restoredAssignedLeads);
        setRowsByIndex(restoredRowsByIndex);
        setSelectedNextStage(restoredNextStage);
      } else {
        // //console.log;
      }
      // });
    } else {
      // getPipelines();
    }
  }, [pipelinesDetails]);

  //// //console.log;

  useEffect(() => {
    // const localCadences = localStorage.getItem("AddCadenceDetails");
    // if (localCadences) {
    //     const localCadenceDetails = JSON.parse(localCadences);
    //    // //console.log;
    // }
    getPipelines();
  }, []);

  useEffect(() => {
    if (selectedPipelineItem && rowsByIndex) {
      // //console.log;
      setShouldContinue(false);
      return;
    } else if (!selectedPipelineItem || !rowsByIndex) {
      // //console.log;
      setShouldContinue(true);
    }

    //// //console.log;
  }, [selectedPipelineItem, selectedPipelineStages]);

  //code to raorder the stages list

  useEffect(() => {
    let previousStages = oldStages.map((item) => item.id);
    let updatedStages = selectedPipelineStages.map((item) => item.id);

    // //console.log;
    // //console.log;

    // Compare arrays
    const areArraysEqual =
      previousStages.length === updatedStages.length &&
      previousStages.every((item, index) => item === updatedStages[index]);

    if (areArraysEqual) {
      // //console.log;
    } else {
      // //console.log;
      // handleReorder();
    }
  }, [selectedPipelineStages]);

  //code to get pipelines
  const getPipelines = async () => {
    try {
      console.log("Trigered getpipelines")
      const selectedUserLocalData = localStorage.getItem(PersistanceKeys.selectedUser);
      let selectedUser = null;
      console.log("Selected user local data is", selectedUserLocalData);
      if (selectedUserLocalData !== "undefined" && selectedUserLocalData !== null) {
        selectedUser = JSON.parse(selectedUserLocalData);
        console.log("Selected user details are", selectedUser);
      }
      let ApiPath = Apis.getPipelines + "?liteResource=true"

      if (selectedUser) {
        ApiPath = ApiPath + "&userId=" + selectedUser?.id;
      }

      console.log("ApiPath is", ApiPath);
      let AuthToken = null;
      const LocalData = localStorage.getItem("User");
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData);
        AuthToken = UserDetails.token;
      }

      // //console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        console.log("Response is of get pipelines", response.data.data);
        setPipelinesDetails(response.data.data);
        setSelectPipleLine(response.data.data[0].title);
        setSelectedPipelineItem(response.data.data[0]);
        setSelectedPipelineStages(response.data.data[0].stages);
        setOldStages(response.data.data[0].stages);
        localStorage.setItem(
          "pipelinesData",
          JSON.stringify(response.data.data)
        );
      }
    } catch (error) {
      console.log("Error occured in get pipelies api is :", error);
    } finally {
      // //console.log;
    }
  };

  //function for new lead
  // const addRow = () => {
  //     setRows([...rows, { id: rows.length + 1, days: '', hours: '', minutes: '' }]);
  // };

  // const removeRow = (id) => {
  //     setRows(rows.filter(row => row.id !== id));
  // };

  // const handleInputChange = (id, field, value) => {
  //     setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  // };

  // const assignNewLead = () => {
  //     setAssignedNewLead(true);
  //     setRows([...rows, { id: rows.length + 1, days: '', hours: '', minutes: '' }]);
  // }

  // const handleUnAssignNewLead = () => {
  //     setAssignedNewLead(false);
  //     setRows([]);
  // }

  //code for selecting stages

  const assignNewStage = (index) => {
    setAssignedLeads((prev) => ({ ...prev, [index]: true }));
    setRowsByIndex((prev) => ({
      ...prev,
      [index]: [
        { id: index, waitTimeDays: 0, waitTimeHours: 0, waitTimeMinutes: 0 },
      ],
    }));
  };

  const handleUnAssignNewStage = (index) => {
    setAssignedLeads((prev) => ({ ...prev, [index]: false }));
    setRowsByIndex((prev) => {
      const updatedRows = { ...prev };
      delete updatedRows[index];
      return updatedRows;
    });
  };

  const handleInputChange = (leadIndex, rowId, field, value) => {

    setRowsByIndex((prev) => ({
      ...prev,
      [leadIndex]: (prev[leadIndex] ?? []).map((row) =>
        row.id === rowId ? { ...row, [field]: Number(value) || 0 } : row
      ),
    }));
  };

  const addRow = (index, action = "call", templateData = null) => {
    setRowsByIndex((prev) => {
      const list = prev[index] ?? [];
      const nextId = list.length ? list[list.length - 1].id + 1 : 1;

      const newRow = {
        id: nextId,
        waitTimeDays: 0,
        waitTimeHours: 0,
        waitTimeMinutes: 0,
        action, // "call" | "sms" | "email"
        communicationType: action, // Set communicationType to match action
      };

      // Add template information for email and SMS actions
      if (templateData) {
        // Add additional template-specific data
        if (action === "email") {
          newRow.templateId = templateData.templateId;
          newRow.emailAccountId = templateData.emailAccountId;
        } else if (action === "sms") {
          newRow.templateId = templateData.templateId;
        }
      }

      return {
        ...prev,
        [index]: [
          ...list,
          newRow,
        ],
      };
    });
  };

  const removeRow = (leadIndex, rowId) => {
    setRowsByIndex((prev) => ({
      ...prev,
      [leadIndex]: (prev[leadIndex] ?? []).filter((row) => row.id !== rowId),
    }));
  };

  const updateRow = (leadIndex, rowId, updatedData) => {
    setRowsByIndex((prev) => ({
      ...prev,
      [leadIndex]: (prev[leadIndex] ?? []).map((row) =>
        row.id === rowId ? { ...row, ...updatedData } : row
      ),
    }));
  };

  const printAssignedLeadsData = async () => {
    console.log("print clicked", assignedLeads);
    // return
    setPipelineLoader(true);

    const allData = Object.keys(assignedLeads)
      .map((index) => {
        if (assignedLeads[index]) {
          const lead = selectedPipelineStages[index]; // Get the lead information
          const nextStage = selectedNextStage[index]; // Get the "then move to" selected stage for this index
          return {
            stage: lead?.id || "Unknown ID", // Pipeline ID
            calls: rowsByIndex[index] || [], // Associated rows
            moveToStage: nextStage?.id,
            // ? { id: nextStage.id, title: nextStage.stageTitle }
            // : { id: "None", title: "None" }, // Handle if no selection
          };
        }
        return null; // Ignore unassigned leads
      })
      .filter((item) => item !== null); // Filter out null values

    console.log("All Data ", allData);
    
  
    
    const pipelineID = selectedPipelineItem.id;
    const cadence = allData;

    let cadenceData = null;

    //getting local agent data then sending the cadence accordingly
    const agentDetails = localStorage.getItem("agentDetails");
    // console.log("Agent Details ", agentDetails);
    if (agentDetails) {
      const agentData = JSON.parse(agentDetails);
      // //console.log;
      if (
        agentData.agents.length === 1 &&
        agentData.agents[0].agentType === "inbound"
      ) {
        cadenceData = {
          pipelineID: selectedPipelineItem?.id,
          cadenceDetails: [
            {
              stage: selectedPipelineItem?.stages[0]?.id,
              calls: [
                {
                  id: 0,
                  waitTimeDays: 3650,
                  waitTimeHours: 0,
                  waitTimeMinutes: 0,
                  communicationType : "call"
                },
              ],
            },
          ],
        };
      } else {
        // //console.log;
        cadenceData = {
          pipelineID: selectedPipelineItem.id,
          cadenceDetails: cadence,
        };
      }
    }

    // //console.log;

    console.log(
      "Cadence data storing on local storage is :",
      cadence
    );

    if (cadenceData) {
      localStorage.setItem("AddCadenceDetails", JSON.stringify(cadenceData));
    }
    handleContinue();

    // try {
    //    // //console.log;

    //     //// //console.log;
    //     //// //console.log;

    //     const localData = localStorage.getItem("User");
    //     let AuthToken = null;
    //     if (localData) {
    //         const userData = JSON.parse(localData);
    //         AuthToken = userData.token;
    //     }

    //     let currentAgentDetails = null;

    //     const agentDetails = localStorage.getItem("agentDetails");
    //     if (agentDetails) {
    //         const agentData = JSON.parse(agentDetails);
    //         //// //console.log;
    //         currentAgentDetails = agentData;
    //     }
    //    // //console.log;

    //     const ApiPath = Apis.createPipeLineCadence;
    //    // //console.log;

    //     const ApiData = {
    //         pipelineId: selectedPipelineItem.id,
    //         mainAgentId: currentAgentDetails.id,
    //         cadence: cadence
    //     }

    //    // //console.log;
    //     // const JSONData = JSON.stringify(ApiData);
    //     //// //console.log;
    //     // return
    //     const response = await axios.post(ApiPath, ApiData, {
    //         headers: {
    //             "Authorization": "Bearer " + AuthToken,
    //             "Content-Type": "application/json"
    //         }
    //     });

    //     if (response) {
    //        // //console.log;
    //         if(response.data.status === true){
    //             handleContinue();
    //         }
    //     }

    // } catch (error) {
    //    // console.error("Error occured in create pipeline is: ---", error);
    // } finally {
    //    // //console.log;
    //     setPipelineLoader(false);
    // }
  };

  const handleToggleClick = (id) => {
    setToggleClick((prevId) => (prevId === id ? null : id));
  };

  const handleSelectPipleLine = (event) => {
    const selectedValue = event.target.value;
    setSelectPipleLine(selectedValue);

    // Find the selected item from the pipelinesDetails array
    const selectedItem = pipelinesDetails.find(
      (item) => item.title === selectedValue
    );
    // //console.log;
    setSelectedPipelineItem(selectedItem);
    setSelectedPipelineStages(selectedItem.stages);
    setOldStages(selectedItem.stages);
  };

  const handleSelectNextChange = (index, event) => {
    const selectedValue = event.target.value;

    // Update the next stage for the specific index
    setNextStage((prev) => ({
      ...prev,
      [index]: selectedValue,
    }));

    // Find the selected item for the specific index
    const selectedItem = selectedPipelineStages.find(
      (item) => item.stageTitle === selectedValue
    );

    // //console.log;

    // Update the selected next stage for the specific index
    setSelectedNextStage((prev) => ({
      ...prev,
      [index]: selectedItem,
    }));
  };

  //code to rearrange stages list
  const handleReorder = async () => {
    try {
      setReorderLoader(true);
      const updateStages = selectedPipelineStages.map((stage, index) => ({
        id: stage.id,
        order: stage.order,
      }));

      // //console.log;

      const ApiPath = Apis.reorderStages;
      let AuthToken = null;
      const LocalData = localStorage.getItem("User");
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData);
        AuthToken = UserDetails.token;
      }
      //// //console.log;
      const ApiData = {
        pipelineId: selectedPipelineItem.id,
        reorderedStages: updateStages,
      };

      //// //console.log;
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
          let type = SnackbarTypes.Success;
          setSnackType("Success");
          setReorderSuccessBarMessage(response.data.message);
        } else if (response.data.status === false) {
          let type = SnackbarTypes.Error;
          setSnackType("Error");
          setReorderSuccessBarMessage(response.data.message);
        }
        setIsVisibleSnack(true);
      }
    } catch (error) {
      // console.error("Error occured in rearrange order api is:", error);
    } finally {
      // //console.log;
      setReorderLoader(false);
    }
  };

  function onNewStageCreated(pipeline) {
    let pipelines = [];

    for (let p of pipelinesDetails) {
      if (p.id == pipeline.id) {
        pipelines.push(pipeline);
      } else {
        pipelines.push(p);
      }
    }
    setSelectedPipelineItem(pipeline);
    setSelectedPipelineStages(pipeline.stages);
    setPipelinesDetails(pipelines);
  }

  const styles = {
    headingStyle: {
      fontSize: 16,
      fontWeight: "700",
    },
    inputStyle: {
      fontSize: 15,
      fontWeight: "500",
    },
    dropdownMenu: {
      fontSize: 15,
      fontWeight: "500",
      color: "#00000070",
    },
    AddNewKYCQuestionModal: {
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
    labelStyle: {
      backgroundColor: "white",
      fontWeight: "400",
      fontSize: 10,
    },
  };

  return (
    <div
      style={{ width: "100%" }}
      className="overflow-y-hidden flex flex-row justify-center items-center"
    >
      {/* <AgentSelectSnackMessage isVisible={reorderSuccessBar == null || reorderSuccessBar == false ? false : true} hide={() => setReorderSuccessBar(null)} message={reorderSuccessBar} time={SnackbarTypes.Success} /> */}
      {isVisibleSnack && (
        <AgentSelectSnackMessage
          isVisible={isVisibleSnack === false ? false : true}
          hide={() => setIsVisibleSnack(false)}
          message={reorderSuccessBarMessage}
          type={snackType}
        />
      )}
      <div
        className="bg-white rounded-2xl w-10/12 h-[100%] py-4 flex flex-col justify-between" //overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
      >
        <div>
          {/* header */}
          <Header />
          {/* Body */}

          {/* Code for side video */}
          <IntroVideoModal
            open={introVideoModal}
            onClose={() => setIntroVideoModal(false)}
            videoTitle="Learn about pipeline and stages"
            videoUrl={HowtoVideos.Pipeline}
          />

          <div
            className="-ml-4 lg:flex hidden  xl:w-[350px] lg:w-[350px]"
            style={{
              position: "absolute",
              // left: "18%",
              // translate: "-50%",
              // left: "14%",
              top: "20%",
              // backgroundColor: "red"
            }}
          >
            <VideoCard
              duration="8 min 17 sec"
              horizontal={false}
              playVideo={() => {
                setIntroVideoModal(true);
              }}
              title="Learn about pipeline and stages"
            />
          </div>

          <div className="flex flex-col items-center px-4 w-full">
            <div
              className="mt-6 w-11/12 md:text-4xl text-lg font-[700]"
              style={{ textAlign: "center" }}
            >
              Pipeline and Stages
            </div>
            <div
              className="mt-4 w-6/12 gap-4 flex flex-col h-[56vh] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple"
              style={{ scrollbarWidth: "none" }}
            >
              {pipelinesDetails.length > 1 && (
                <div>
                  <div style={styles.headingStyle}>Select a pipeline</div>
                  <div className="border rounded-lg">
                    <Box className="w-full">
                      <FormControl className="w-full">
                        <Select
                          className="border-none rounded-lg outline-none"
                          displayEmpty
                          value={selectPipleLine}
                          onChange={handleSelectPipleLine}
                          renderValue={(selected) => {
                            if (selected === "") {
                              return <div>Select Pipeline</div>;
                            }
                            return selected;
                          }}
                          sx={{
                            ...styles.dropdownMenu,
                            backgroundColor: "#FFFFFF",
                            "& .MuiOutlinedInput-notchedOutline": {
                              border: "none",
                            },
                            color: "#000000",
                          }}
                        >
                          {/* <MenuItem value="">
                                                        <div style={styles.dropdownMenu}>None</div>
                                                    </MenuItem> */}
                          {pipelinesDetails.map((item, index) => (
                            <MenuItem
                              key={item.id}
                              style={styles.dropdownMenu}
                              value={item.title}
                            >
                              {item.title}
                            </MenuItem>
                          ))}
                          {/* <MenuItem value={20}>03058191079</MenuItem>
                                        <MenuItem value={30}>03281575712</MenuItem> */}
                        </Select>
                      </FormControl>
                    </Box>
                  </div>
                </div>
              )}

              <div className="mt-4" style={styles.headingStyle}>
                Assign this agent to a stage
              </div>

              <div className="mt-2" style={styles.inputStyle}>
                {`This agent will call leads when they're added to the selected stage.`}
              </div>

              <PipelineStages
                stages={selectedPipelineStages}
                onUpdateOrder={(stages) => {
                  setSelectedPipelineStages(stages);
                }}
                assignedLeads={assignedLeads}
                handleUnAssignNewStage={handleUnAssignNewStage}
                assignNewStage={assignNewStage}
                handleInputChange={handleInputChange}
                rowsByIndex={rowsByIndex}
                removeRow={removeRow}
                addRow={addRow}
                updateRow={updateRow}
                nextStage={nextStage}
                handleSelectNextChange={handleSelectNextChange}
                selectedPipelineStages={selectedPipelineStages}
                selectedPipelineItem={selectedPipelineItem}
                setShowRearrangeErr={setReorderSuccessBarMessage}
                setIsVisibleSnack={setIsVisibleSnack}
                setSnackType={setSnackType}
                onNewStageCreated={onNewStageCreated}
                handleReOrder={handleReorder}
              />

              {/* Reorder stage loader modal */}
              <Modal
                open={reorderLoader}
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
                  className="lg:w-6/12 sm:w-9/12 w-10/12"
                  sx={styles.AddNewKYCQuestionModal}
                >
                  <div className="w-full flex flex-row items-center justify-center">
                    <CircularProgress
                      className="text-purple"
                      size={150}
                      weight=""
                      thickness={1}
                    />
                  </div>
                </Box>
              </Modal>

              {/* <div>
                                <button className='text-red text-lg font-bold' onClick={handleReorder}>
                                    Rearrange
                                </button>
                            </div> */}
            </div>
          </div>
        </div>
        <div>
          <div>
            <ProgressBar value={33} />
          </div>

          <Footer
            handleContinue={printAssignedLeadsData}
            donotShowBack={true}
            registerLoader={createPipelineLoader}
            shouldContinue={shouldContinue}
          />
        </div>
      </div>
    </div>
  );
};

export default Pipeline1;
