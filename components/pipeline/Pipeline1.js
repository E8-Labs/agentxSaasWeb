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
import AgentSelectSnackMessage, { SnackbarTypes } from "../dashboard/leads/AgentSelectSnackMessage";

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

  const [reorderSuccessBarMessage, setReorderSuccessBarMessage] = useState(null);
  const [isVisibleSnack, setIsVisibleSnack] = useState(false);
  const [snackType, setSnackType] = useState(null);

  useEffect(() => {
    console.log("Snack message is", reorderSuccessBarMessage)
  }, [reorderSuccessBarMessage])


  const [reorderLoader, setReorderLoader] = useState(false);
  //code for new Lead calls
  // const [rows, setRows] = useState([]);
  // const [assignedNewLEad, setAssignedNewLead] = useState(false);
  useEffect(() => {
    const localCadences = localStorage.getItem("AddCadenceDetails");
    if (localCadences) {
      const localCadenceDetails = JSON.parse(localCadences);
      console.log("Local cadences retrieved:", localCadenceDetails);

      // Set the selected pipeline item
      const storedPipelineItem = localCadenceDetails.pipelineID;
      const storedCadenceDetails = localCadenceDetails.cadenceDetails;

      // Fetch pipelines to ensure we have the list
      // getPipelines().then(() => {
      const selectedPipeline = pipelinesDetails.find(
        (pipeline) => pipeline.id === storedPipelineItem
      );

      if (selectedPipeline) {
        console.log("found selected pipeline");
        setSelectedPipelineItem(selectedPipeline);
        setSelectedPipelineStages(selectedPipeline.stages);

        // Restore assigned leads and rows by index
        const restoredAssignedLeads = {};
        const restoredRowsByIndex = {};
        const restoredNextStage = {};

        storedCadenceDetails.forEach((cadence) => {
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
        console.log("not found selected pipeline", storedPipelineItem);
      }
      // });
    } else {
      // getPipelines();
    }
  }, [pipelinesDetails]);

  // console.log("selected pipelinestages array is:", selectedPipelineStages);

  useEffect(() => {
    // const localCadences = localStorage.getItem("AddCadenceDetails");
    // if (localCadences) {
    //     const localCadenceDetails = JSON.parse(localCadences);
    //     console.log("Local cadences recieved are :", localCadenceDetails);
    // }
    getPipelines();
  }, []);

  useEffect(() => {
    if (selectedPipelineItem && rowsByIndex) {
      console.log("Should continue");
      setShouldContinue(false);
      return;
    } else if (!selectedPipelineItem || !rowsByIndex) {
      console.log("Should not continue");
      setShouldContinue(true);
    }

    // console.log("selected pipelinestages array is:", selectedPipelineStages);
  }, [selectedPipelineItem, selectedPipelineStages]);

  //code to raorder the stages list

  useEffect(() => {
    let previousStages = oldStages.map((item) => item.id);
    let updatedStages = selectedPipelineStages.map((item) => item.id);

    console.log("Old stages list is reorder stages:", previousStages);
    console.log("Updated stages list is reorder stages:", updatedStages);

    // Compare arrays
    const areArraysEqual =
      previousStages.length === updatedStages.length &&
      previousStages.every((item, index) => item === updatedStages[index]);

    if (areArraysEqual) {
      console.log("Should not reorder stages");
    } else {
      console.log("Should reorder stages");
      handleReorder();
    }
  }, [selectedPipelineStages]);

  //code to get pipelines
  const getPipelines = async () => {
    try {
      const ApiPath = Apis.getPipelines;
      let AuthToken = null;
      const LocalData = localStorage.getItem("User");
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData);
        AuthToken = UserDetails.token;
      }

      console.log("Auth token is :", AuthToken);

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        console.log("Response of getPipelines api is :--", response.data.data);
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
      console.error("Error occured in get pipelies api is :", error);
    } finally {
      console.log("Api call completed");
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
    console.log("Lead index is:", leadIndex);
    console.log("Row id is:", rowId);
    console.log("Field is:", field);
    console.log("Value is", value);
    setRowsByIndex((prev) => ({
      ...prev,
      [leadIndex]: prev[leadIndex].map((row) =>
        row.id === rowId ? { ...row, [field]: Number(value) || 0 } : row
      ),
    }));
  };

  const addRow = (index) => {
    setRowsByIndex((prev) => {
      let id = (prev[index]?.length || 0) + 1;
      console.log(`Assigned Row Id `, id);
      console.log(`Rows at ${index}`);
      console.log(prev);
      if ((prev[index]?.length || 0) > 0) {
        let array = prev[index];
        console.log("Array is now ", array);
        let lastRow = array[array.length - 1];
        id = lastRow.id + 1;
      }
      console.log(`Now Assigned Row Id `, id);

      return {
        ...prev,
        [index]: [
          ...(prev[index] || []),
          { id: id, waitTimeDays: 0, waitTimeHours: 0, waitTimeMinutes: 0 },
        ],
      };
    });
  };

  const removeRow = (leadIndex, rowId) => {
    setRowsByIndex((prev) => ({
      ...prev,
      [leadIndex]: prev[leadIndex].filter((row) => row.id !== rowId),
    }));
  };

  const printAssignedLeadsData = async () => {
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

    const pipelineID = selectedPipelineItem.id;
    const cadence = allData;

    const cadenceData = {
      pipelineID: selectedPipelineItem.id,
      cadenceDetails: cadence,
    };

    console.log("Cadence data storing on local storage is :", cadenceData);

    localStorage.setItem("AddCadenceDetails", JSON.stringify(cadenceData));

    handleContinue();

    // try {
    //     console.log("Check 1 clear");

    //     // console.log("Ray to send in api :--", cadence);
    //     // console.log("Assigned Leads Data:", allData);

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
    //         // console.log("Recieved from are :--", agentData);
    //         currentAgentDetails = agentData;
    //     }
    //     console.log("My agent details are :--", currentAgentDetails);

    //     const ApiPath = Apis.createPipeLineCadence;
    //     console.log("Api path is :", ApiPath);

    //     const ApiData = {
    //         pipelineId: selectedPipelineItem.id,
    //         mainAgentId: currentAgentDetails.id,
    //         cadence: cadence
    //     }

    //     console.log("Data sending in api is :--", ApiData);
    //     // const JSONData = JSON.stringify(ApiData);
    //     // console.log("Json data is", JSONData);
    //     // return
    //     const response = await axios.post(ApiPath, ApiData, {
    //         headers: {
    //             "Authorization": "Bearer " + AuthToken,
    //             "Content-Type": "application/json"
    //         }
    //     });

    //     if (response) {
    //         console.log("Response of create pipeline api is :---", response);
    //         if(response.data.status === true){
    //             handleContinue();
    //         }
    //     }

    // } catch (error) {
    //     console.error("Error occured in create pipeline is: ---", error);
    // } finally {
    //     console.log("Api call completed");
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
    console.log("Selected Item:", selectedItem.stages);
    setSelectedPipelineItem(selectedItem);
    setSelectedPipelineStages(selectedItem.stages);
    setOldStages(selectedItem.stages);
  };

  // const handleSelectNextChange = (event) => {
  //     const selectedValue = event.target.value;
  //     setNextStage(selectedValue);
  //     // Find the selected item from the pipelinesDetails array
  //     const selectedItem = selectedPipelineStages.find(item => item.stageTitle === selectedValue);
  //     console.log('Selected Item:', selectedItem);
  //     setSelectedNextStage(selectedItem);
  // }

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

    console.log(`Index ${index} Selected Item:`, selectedItem);

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

      console.log("Updated stages order is :", updateStages);

      const ApiPath = Apis.reorderStages;
      let AuthToken = null;
      const LocalData = localStorage.getItem("User");
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData);
        AuthToken = UserDetails.token;
      }
      // console.log("Selected pipeline id is: ", selectedPipelineItem.id);
      const ApiData = {
        pipelineId: selectedPipelineItem.id,
        reorderedStages: updateStages,
      };

      // console.log("Auth token is :", AuthToken);
      console.log("Api data is :", ApiData);
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        console.log("Response of updated stages is:", response.data);
        if (response.data.status === true) {
          let type = SnackbarTypes.Success
          setSnackType("Success");
          setReorderSuccessBarMessage(response.data.message);
        } else if (response.data.status === false) {
          let type = SnackbarTypes.Error
          setSnackType("Error");
          setReorderSuccessBarMessage(response.data.message);
        }
        setIsVisibleSnack(true);
      }
    } catch (error) {
      console.error("Error occured in rearrange order api is:", error);
    } finally {
      console.log("api call completed");
      setReorderLoader(false);
    }
  };

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
      {
        isVisibleSnack && (
          <AgentSelectSnackMessage
            isVisible={isVisibleSnack === false ? false : true}
            hide={() => setIsVisibleSnack(false)}
            message={reorderSuccessBarMessage} type={snackType}
          />
        )
      }
      <div
        className="bg-white rounded-2xl w-10/12 h-[100%] py-4 flex flex-col justify-between" //overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
      >
        <div>
          {/* header */}
          <Header />
          {/* Body */}
          <div className="flex flex-col items-center px-4 w-full">
            <div
              className="mt-6 w-11/12 md:text-4xl text-lg font-[700]"
              style={{ textAlign: "center" }}
            >
              Pipeline and Stages
            </div>
            <div
              className="mt-8 w-6/12 gap-4 flex flex-col h-[56vh] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple"
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

              <div>
                <button
                  className="flex flex-row items-center gap-4"
                  onClick={() => {
                    setIntroVideoModal(true);
                  }}
                >
                  <Image
                    src={"/assets/youtubeplay.png"}
                    height={71}
                    width={58}
                    alt="*"
                    style={{ borderRadius: "7px" }}
                  />
                  <div style={styles.inputStyle} className="underline">
                    Watch to learn more on assigning agents
                  </div>
                </button>
              </div>

              {/* intro video modal */}
              <Modal
                open={introVideoModal}
                onClose={() => setIntroVideoModal(false)}
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
                  className="lg:w-7/12 sm:w-full w-8/12"
                  sx={styles.AddNewKYCQuestionModal}
                >
                  <div className="flex flex-row justify-center w-full">
                    <div
                      className="sm:w-7/12 w-full"
                      style={{
                        backgroundColor: "#ffffff",
                        padding: 20,
                        borderRadius: "13px",
                      }}
                    >
                      <div className="flex flex-row justify-end">
                        <button
                          onClick={() => {
                            setIntroVideoModal(false);
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
                        className="text-center sm:font-24 font-16"
                        style={{ fontWeight: "700" }}
                      >
                        Learn more about assigning agents
                      </div>

                      <div className="mt-6">
                        <iframe
                          src="https://www.youtube.com/embed/Dy9DM5u_GVg?autoplay=1&mute=1" //?autoplay=1&mute=1 to make it autoplay
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="YouTube video"
                          // className='w-20vh h-40vh'
                          style={{
                            width: "100%",
                            height: "50vh",
                            borderRadius: 15,
                          }}
                        />
                      </div>

                      {/* Can be use full to add shadow */}
                      {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                    </div>
                  </div>
                </Box>
              </Modal>

              <div className="mt-4" style={styles.inputStyle}>
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
                nextStage={nextStage}
                handleSelectNextChange={handleSelectNextChange}
                selectedPipelineStages={selectedPipelineStages}
                selectedPipelineItem={selectedPipelineItem}
                setShowRearrangeErr={setReorderSuccessBarMessage}
                setIsVisibleSnack={setIsVisibleSnack}
                setSnackType={setSnackType}
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
