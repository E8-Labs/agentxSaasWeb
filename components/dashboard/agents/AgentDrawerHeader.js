import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Avatar, CircularProgress, FormControl, Menu, MenuItem, Select } from "@mui/material";
import { models } from "@/constants/Constants";
import DuplicateButton from "@/components/animation/DuplicateButton";
import DuplicateConfirmationPopup from "@/components/dashboard/myagentX/DuplicateConfirmationPopup";
import { findLLMModel, formatPhoneNumber, getAgentsListImage } from "@/utilities/agentUtilities";
import { GetFormattedDateString } from "@/utilities/utility";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import CircularLoader from "@/utilities/CircularLoader";

const AgentDrawerHeader = ({
  showDrawerSelectedAgent,
  setShowRenameAgentPopup,
  setSelectedRenameAgent,
  setRenameAgent,
  setMainAgentsList,
  setShowSuccessSnack,
  setIsVisibleSnack2,
  globalLoader,
  setGlobalLoader,
  updateSubAgent,
}) => {
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedImage2, setSelectedImage2] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [openGptManu, setOpenGptManu] = useState("");
  const [selectedGptManu, setSelectedGptManu] = useState(models[0]);
  const [showDuplicateConfirmationPopup, setShowDuplicateConfirmationPopup] = useState(false);
  const [duplicateLoader, setDuplicateLoader] = useState(false);
  const [showModelLoader, setShowModelLoader] = useState(false);

  useEffect(()=>{
    const getDefaultModel = () =>{

      let item = showDrawerSelectedAgent
       let modelValue = item?.agentLLmModel;
      if (modelValue) {
        let model = findLLMModel(modelValue);

        console.log("Selected model 2:", showDrawerSelectedAgent);
        setSelectedGptManu(model);

      }
    }

    getDefaultModel()
  },[showDrawerSelectedAgent])

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setSelectedImage2(file);
      await updateAgentProfile(file);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setSelectedImage2(file);
      await updateAgentProfile(file);
    }
  };
  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleGptManuSelect = async (model) => {
    if (!model.disabled) {
      setSelectedGptManu(model);
    }

    setShowModelLoader(true);
    await updateSubAgent(null, model.model);
    setShowModelLoader(false);
    setOpenGptManu(null);
  };

  const handleDuplicate = async () => {
    console.log("Duplicate agent clicked");
    setDuplicateLoader(true)
    setShowDuplicateConfirmationPopup(false)
    try {
      const data = localStorage.getItem("User")

      if (data) {
        const userData = JSON.parse(data);
        const AuthToken = userData.token;
        const ApiPath = Apis.duplicateAgent;

        let apidata = {
          agentId: showDrawerSelectedAgent.id,
        }

        const response = await axios.post(ApiPath,
          apidata, {
          headers: {
            "Authorization": "Bearer " + AuthToken,
          }
        })

        if (response) {
          setDuplicateLoader(false)
          if (response.data.status === true) {
            console.log('duplicate agent data ', response);

            setShowSuccessSnack("Agent duplicated successfully");
            setIsVisibleSnack(true);
            const localAgentsList = localStorage.getItem(
              PersistanceKeys.LocalStoredAgentsListMain
            );

            if (localAgentsList) {
              const agentsList = JSON.parse(localAgentsList);
              // agentsListDetails = agentsList;

              const updatedArray = [response.data.data, ...agentsList];
              localStorage.setItem(
                PersistanceKeys.LocalStoredAgentsListMain,
                JSON.stringify(updatedArray)
              );
              setMainAgentsList(updatedArray);
            }
          }
        }
      }
    } catch (error) {
      setDuplicateLoader(false)
      console.error("Error occured in duplicate agent api is", error);
      setShowErrorSnack("Error occured while duplicating agent");
      setIsVisibleSnack2(true);

    }
  }

  return (
    <div>
      {/* Agent TOp Info */}
      <div className="flex flex-row items-start justify-between w-full mt-2 ">
        <div className="flex flex-row items-start justify-start mt-2 gap-4">
          {/* Profile Image */}
          <div className="">
            <button
              // className='mt-8'
              onClick={() => {
                document.getElementById("fileInput").click();
                // if (typeof document === "undefined") {
                // }
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div
                className="flex flex-row items-end"
                style={
                  {
                    // border: dragging ? "2px dashed #0070f3" : "",
                  }
                }
              >
                {selectedImage ? (
                  <div style={{ marginTop: "", background: "" }}>
                    <Image
                      src={selectedImage}
                      height={45}
                      width={45}
                      alt="profileImage"
                      className="rounded-full"
                      style={{
                        objectFit: "cover",
                        resize: "cover",
                        height: "74px",
                        width: "74px",
                      }}
                    />
                  </div>
                ) : (
                  getAgentsListImage(showDrawerSelectedAgent)
                )}

                <Image
                  src={"/otherAssets/cameraBtn.png"}
                  style={{ marginLeft: -25 }}
                  height={20}
                  width={20}
                  alt="profileImage"
                />
              </div>
            </button>

            {/* Hidden file input */}
            <input
              value={""}
              type="file"
              accept="image/*"
              id="fileInput"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />

            {/* Global Loader */}
            {globalLoader && (
              <CircularLoader
                globalLoader={globalLoader}
                setGlobalLoader={setGlobalLoader}
              />
            )}
          </div>
          <div className="flex flex-col gap-1 items-start">
            <div className="flex flex-row justify-center items-center gap-2">
              <button

                onClick={() => {
                  setShowRenameAgentPopup(true);
                  setSelectedRenameAgent(showDrawerSelectedAgent);
                  setRenameAgent(showDrawerSelectedAgent?.name);
                }}
              >
                <div className="flex flex-row items-center gap-2">
                  <Image
                    src={"/svgIcons/editIcon2.svg"}
                    height={24}
                    width={24}
                    alt="*"
                  />
                  <div
                    style={{ fontSize: 22, fontWeight: "600" }}
                  >
                    {showDrawerSelectedAgent?.name?.slice(0, 1).toUpperCase()}
                    {showDrawerSelectedAgent?.name?.slice(1)}
                  </div>
                </div>
              </button>
              <div
                className="text-purple"
                style={{ fontSize: 11, fontWeight: "600" }}
              >
                {showDrawerSelectedAgent?.agentObjective}{" "}
                <span>
                  {" "}
                  |{" "}
                  {showDrawerSelectedAgent?.agentType
                    ?.slice(0, 1)
                    .toUpperCase(0)}
                  {showDrawerSelectedAgent?.agentType?.slice(1)}
                </span>
              </div>
            </div>

            <div
              style={{ fontSize: 15, fontWeight: "500", color: "#000" }}
            >
              {/* {showDrawer?.phoneNumber} */}
              {formatPhoneNumber(showDrawerSelectedAgent?.phoneNumber)}
            </div>

            <div className="flex flex-row gap-2 items-center ">
              <div
                style={{ fontSize: 11, fontWeight: "500", color: "#666" }}
              >
                Created on:
              </div>
              <div
                style={{ fontSize: 11, fontWeight: "500", color: "#000" }}
              >
                {/* {showDrawer?.createdAt} */}
                {GetFormattedDateString(
                  showDrawerSelectedAgent?.createdAt
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row items-center gap-2">


          <DuplicateButton
            handleDuplicate={() => {
              setShowDuplicateConfirmationPopup(true)
            }}
            loading={duplicateLoader}
          />

          <DuplicateConfirmationPopup
            open={showDuplicateConfirmationPopup}
            handleClose={() => setShowDuplicateConfirmationPopup(false)}
            handleDuplicate={handleDuplicate}
          />
          <div className="flex flex-col gap-2  ">
            {/* GPT Button */}

            {showModelLoader ? (
              <CircularProgress size={25} />
            ) : (
              <div>
                <button
                  id="gpt"
                  onClick={(event) => setOpenGptManu(event.currentTarget)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "20px",
                    padding: "6px 12px",
                    border: "1px solid #EEE",
                    backgroundColor: "white",
                    // boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.05)",
                    fontSize: "16px",
                    fontWeight: "500",
                    color: "#000",
                    textTransform: "none",
                    "&:hover": { backgroundColor: "#F5F5F5" },
                  }}
                >
                  <Avatar
                    src={selectedGptManu?.icon}
                    sx={{ width: 24, height: 24, marginRight: 1 }}
                  />
                  {selectedGptManu?.name}
                  <Image
                    src={"/svgIcons/downArrow.svg"}
                    width={18}
                    height={18}
                    alt="*"
                  />
                </button>

                <Menu
                  id="gpt"
                  anchorEl={openGptManu}
                  open={openGptManu}
                  onClose={() => setOpenGptManu(null)}
                  sx={{
                    "& .MuiPaper-root": {
                      borderRadius: "12px",
                      padding: "8px",
                      minWidth: "180px",
                    },
                  }}
                >
                  {models.map((model, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => handleGptManuSelect(model)}
                      disabled={model.disabled}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        transition: "background 0.2s",
                        "&:hover": {
                          backgroundColor: model.disabled
                            ? "inherit"
                            : "#F5F5F5",
                        },
                        opacity: model.disabled ? 0.6 : 1,
                      }}
                    >
                      <Avatar
                        src={model.icon}
                        sx={{ width: 24, height: 24 }}
                      />
                      {model.name}
                    </MenuItem>
                  ))}
                </Menu>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDrawerHeader;