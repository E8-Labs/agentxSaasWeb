import Apis from "@/components/apis/Apis";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "@/components/dashboard/leads/AgentSelectSnackMessage";
import {
  Alert,
  Box,
  CircularProgress,
  Fade,
  Modal,
  Popover,
  Snackbar,
  TextareaAutosize,
} from "@mui/material";
import { CaretDown, CaretUp, DotsThree } from "@phosphor-icons/react";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const GuardianSetting = ({ showTitle, selectedAgentId }) => {
  const [guardrailsList, setGuardrailsList] = useState([]);
  const [initialLoader, setInitialLoader] = useState(false);
  const [showAddObjForm, setShowAddObjForm] = useState(false);
  const [addObjTitle, setAddObjTitle] = useState("");
  const [addObjDescription, setAddObjDescription] = useState("");

  const [addObjectionLoader, setAddObjectionLoader] = useState(false);

  //show details
  const [showDetails, setShowDetails] = useState([]);

  //code for del popover
  const [anchorEl, setAnchorEl] = useState(null);
  const [SelectedGuardrail, setSelectedGuardrail] = useState(null);
  const [delLoader, setDelLoader] = useState(false);

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  //code for desnack bars
  const [showErrorSnack, setShowErrorSnack] = useState(null);
  const [showSuccessSnack, setShowSuccessSnack] = useState(null);

  useEffect(() => {
    const guadrailsList = localStorage.getItem("GuadrailsList");
    if (guadrailsList) {
      // //console.log;
      const guardrailsData = JSON.parse(guadrailsList);
      // //console.log;
      setGuardrailsList(guardrailsData);
    } else {
      // //console.log;
      getGuadrails();
    }
  }, []);

  //code for popover
  // const open = Boolean(actionInfoEl);

  //code for getting agent data
  const getGuadrails = async () => {
    try {
      setInitialLoader(true);
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      // let mainAgent = null
      // const agentDetailsLocal = localStorage.getItem("agentDetails");
      // if (agentDetailsLocal) {
      //   const localAgentData = JSON.parse(agentDetailsLocal);
      //  // //console.log;
      //   mainAgent = localAgentData;
      // }

      let mainAgentId = null;

      if (selectedAgentId) {
        mainAgentId = selectedAgentId.mainAgentId; //selectedAgentId.id
      } else {
        const localAgent = localStorage.getItem("agentDetails");
        if (localAgent) {
          const agentDetails = JSON.parse(localAgent);
          // //console.log;
          mainAgentId = agentDetails.id;
        }
      }

      // //console.log;

      const ApiPath = `${Apis.getObjectionGuardrial}?mainAgentId=${mainAgentId}`;
      // //console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        setGuardrailsList(response.data.data.guardrails);
        localStorage.setItem(
          "GuadrailsList",
          JSON.stringify(response.data.data.guardrails)
        );
      }
    } catch (error) {
      // console.error("Error occured in get agents api is:", error);
    } finally {
      setInitialLoader(false);
    }
  };

  //code for add objection guardrial api
  const addGuadrial = async () => {
    try {
      setAddObjectionLoader(true);

      // let mainAgent = null
      // const agentDetailsLocal = localStorage.getItem("agentDetails");
      // if (agentDetailsLocal) {
      //   const localAgentData = JSON.parse(agentDetailsLocal);
      //  // //console.log;
      //   mainAgent = localAgentData;
      // }

      let mainAgentId = null;

      if (selectedAgentId) {
        mainAgentId = selectedAgentId.mainAgentId; //selectedAgentId.id
      } else {
        const localAgent = localStorage.getItem("agentDetails");
        if (localAgent) {
          const agentDetails = JSON.parse(localAgent);
          // //console.log;
          mainAgentId = agentDetails.id;
        }
      }

      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      // //console.log;

      const ApiData = {
        title: addObjTitle,
        description: addObjDescription,
        type: "guardrail",
        mainAgentId: mainAgentId,
      };

      // //console.log;

      const ApiPath = Apis.addObjectionGuardrial;
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
          setGuardrailsList(response.data.data.guardrails);
          localStorage.setItem(
            "GuadrailsList",
            JSON.stringify(response.data.data.guardrails)
          );
          setShowAddObjForm(false);
          setAddObjTitle("");
          setAddObjDescription("");
        } else if (response.data.status === false) {
          setShowErrorSnack(response.data.message);
        }
      }
    } catch (error) {
      // console.error("Error occured in add objection:", error);
    } finally {
      setAddObjectionLoader(false);
    }
  };

  //function to handle show details
  const handleShowDetails = (item) => {
    setShowDetails((prevItems) => {
      // Check if the item is already in the array (expanded)
      if (prevItems.some((prevItem) => prevItem.id === item.id)) {
        // Remove the item to collapse it
        return prevItems.filter((prevItem) => prevItem.id !== item.id);
      } else {
        // Add the item to expand it
        return [...prevItems, item];
      }
    });
  };

  //functions for del popover
  const handleClick = (event, item) => {
    // //console.log;
    setSelectedGuardrail(item);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  //function to delete guadrail
  //function to delete guadrail
  const handleDelGuadrail = async () => {
    try {
      setDelLoader(true);

      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      // //console.log;

      const formData = new FormData();
      formData.append("id", SelectedGuardrail.id);

      for (let [key, value] of formData.entries()) {
        // //console.log
      }

      const ApiPath = Apis.DelObjectGuard;

      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          setGuardrailsList(response.data.data.guardrails);
          setShowSuccessSnack(response.data.message);
          localStorage.setItem(
            "GuadrailsList",
            JSON.stringify(response.data.data.guardrails)
          );
          setAnchorEl(null);
        } else if (response.data.status === false) {
          setShowErrorSnack(response.data.message);
        }
      }
    } catch (error) {
      // console.error("Error occured in api is", error);
    } finally {
      setDelLoader(false);
      // //console.log;
    }
  };

  const styles = {
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
    title: {
      fontSize: 15,
      fontWeight: "600",
    },
    inputStyle: {
      fontSize: 15,
      fontWeight: 500,
      border: "1px solid #00000020",
      outline: "none",
      borderRadius: "7px",
      width: "100%",
      marginTop: 10,
      padding: 5,
      height: "50px",
    },
  };

  return (
    <div>
      <AgentSelectSnackMessage
        isVisible={
          showSuccessSnack == false || showSuccessSnack == null ? false : true
        }
        hide={() => setShowSuccessSnack(false)}
        message={showSuccessSnack}
        type={SnackbarTypes.Success}
      />
      <AgentSelectSnackMessage
        isVisible={
          showErrorSnack == false || showErrorSnack == null ? false : true
        }
        hide={() => setShowErrorSnack(false)}
        message={showErrorSnack}
        type={SnackbarTypes.Error}
      />

      {showTitle && (
        <div className="flex flex-row items-center justify-between mt-4 pb-3">
          <div style={{ fontWeight: "600", fontSize: 16.8 }}></div>
          <button
            className="text-purple underline outline-none"
            style={{ fontWeight: "500", fontSize: 15 }}
            onClick={() => setShowAddObjForm(true)}
          >
            New Guardrail
          </button>
        </div>
      )}

      {guardrailsList.length > 0 ? (
        <div
          style={{
            scrollbarWidth: "none",
            overflow: "auto",
            maxHeight: showTitle ? "60vh" : "40vh",
          }}
        >
          {guardrailsList.map((item, index) => {
            const isExpanded = showDetails.some(
              (detail) => detail.id === item.id
            );
            return (
              <div
                className="p-3 rounded-xl mt-4"
                key={index}
                style={{ border: "1px solid #00000020" }}
              >
                <div className="flex flex-row items-center justify-between">
                  <div style={{ fontWeight: "600", fontSize: 15 }}>
                    {item.title}
                  </div>
                  <button
                    className="outline-none"
                    onClick={() => {
                      handleShowDetails(item);
                    }}
                  >
                    {isExpanded ? (
                      <CaretUp size={20} />
                    ) : (
                      <CaretDown size={20} />
                    )}
                  </button>
                </div>
                {isExpanded && (
                  <div className="flex flex-row items-start justify-between">
                    <div
                      className="mt-2 bg-gray-100 p-2"
                      style={{ fontWeight: "500", fontSize: 15 }}
                    >
                      {item.description}
                    </div>
                    <button
                      aria-describedby={id}
                      variant="contained"
                      onClick={(event) => {
                        handleClick(event, item);
                      }}
                      className="p-2 px-3"
                    >
                      <DotsThree weight="bold" size={35} />
                    </button>
                    <Popover
                      id={id}
                      open={open}
                      anchorEl={anchorEl}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      transformOrigin={{
                        vertical: "center",
                        horizontal: "right", // Ensures the Popover's top right corner aligns with the anchor point
                      }}
                      PaperProps={{
                        elevation: 0, // This will remove the shadow
                        style: {
                          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.05)",
                          // borderRadius: "13px"
                        },
                      }}
                    >
                      {delLoader ? (
                        <CircularProgress size={20} />
                      ) : (
                        <button
                          onClick={() => {
                            handleDelGuadrail();
                          }}
                          className="text-red p-2 px-4"
                          style={{
                            fontsize: 15,
                            fontWeight: "500",
                            padding: 2,
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </Popover>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          {initialLoader ? (
            <div className="w-full flex flex-row items-center justify-center mt-8">
              <CircularProgress size={25} />
            </div>
          ) : (
            <div className="text-center text-2xl mt-6">
              <div
                className="flex flex-col items-center justify-center h-[30vh] w-full"
                style={{ fontWeight: "500", fontsize: 15 }}
              >
                <Image
                  className="grayscale"
                  src={"/svgIcons/noGuardiarlsIcon.svg"}
                  height={200}
                  width={237}
                  alt="*"
                />
                <div className="" style={{ fontWeight: "500", fontSize: 15 }}>
                  {/* <i style={{ fontWeight: "500", fontsize: 15 }}> */}
                  {`Looks like you haven't added guardrails yet`}
                  {/* </i> */}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!showTitle && (
        <button
          className="text-purple mt-4 outline-none"
          style={{ fontWeight: "700", fontSize: 16 }}
          onClick={() => setShowAddObjForm(true)}
        >
          Add New
        </button>
      )}

      {/* Modal for Adding new item in array */}
      <Modal
        open={showAddObjForm}
        onClose={() => {
          setShowAddObjForm(false);
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
          sx={{ ...styles.modalsStyle, width: "30%", backgroundColor: "white" }}
        >
          <div style={{ width: "100%" }}>
            <div
              className="w-full"
              style={{
                direction: "row",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: "600", fontSize: 16.8 }}>
                Add New Guardrail
              </div>
              <button
                onClick={() => {
                  setShowAddObjForm(false);
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
            <div style={styles.title}>{`What's the guardrail`}</div>
            <input
              className="outline-none focus:outline-none focus:ring-0"
              style={styles.inputStyle}
              placeholder="Add title"
              value={addObjTitle}
              onChange={(event) => {
                setAddObjTitle(event.target.value);
              }}
            />
            <div style={{ ...styles.title, marginTop: 10 }}>Description</div>
            <TextareaAutosize
              maxRows={5}
              className="outline-none focus:outline-none focus:ring-0"
              style={styles.inputStyle}
              placeholder="Add description"
              value={addObjDescription}
              onChange={(event) => {
                setAddObjDescription(event.target.value);
              }}
            />
            <div className="w-full">
              {addObjectionLoader ? (
                <div className="w-full flex flex-row items-center justify-center mt-8 h-[50px]">
                  <CircularProgress size={25} />
                </div>
              ) : (
                <button
                  className="text-white bg-purple h-[50px] rounded-xl w-full mt-8"
                  onClick={addGuadrial}
                  style={styles.title}
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default GuardianSetting;
