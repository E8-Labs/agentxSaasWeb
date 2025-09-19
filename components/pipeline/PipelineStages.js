import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Image from "next/image";
import { CaretDown, CaretUp, Minus, PencilSimple } from "@phosphor-icons/react";
import {
  Alert,
  Box,
  CircularProgress,
  Fade,
  FormControl,
  Menu,
  MenuItem,
  Modal,
  Popover,
  Select,
  Snackbar,
  Tooltip,
} from "@mui/material";
import Apis from "../apis/Apis";
import axios from "axios";
import ColorPicker from "../dashboardPipeline/ColorPicker";
import TagsInput from "../dashboard/leads/TagsInput";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "../dashboard/leads/AgentSelectSnackMessage";
import { getTeamsList } from "../onboarding/services/apisServices/ApiService";
import { getAgentsListImage } from "@/utilities/agentUtilities";
import { getA2PNumbers, getTempletes } from "./TempleteServices";
import EmailTempletePopup from "./EmailTempletePopup";
import SMSTempletePopup from "./SMSTempletePopup";
import { getAvailabePhoneNumbers } from "../globalExtras/GetAvailableNumbers";
import AuthSelectionPopup from "./AuthSelectionPopup";
import { PersistanceKeys } from "@/constants/Constants";
import { getUserLocalData, UpgradeTag } from "../constants/constants";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import UpgradePlan from '../userPlans/UpgradePlan';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);


const PipelineStages = ({
  stages,
  onUpdateOrder,
  assignedLeads,
  handleUnAssignNewStage,
  assignNewStage,
  handleInputChange,
  rowsByIndex,
  removeRow,
  addRow,
  updateRow,
  nextStage,
  handleSelectNextChange,
  selectedPipelineStages,
  selectedPipelineItem,
  setShowRearrangeErr,
  setIsVisibleSnack,
  setSnackType,
  onNewStageCreated,
  handleReOrder,
}) => {
  const [showSampleTip, setShowSampleTip] = useState(false);

  //VIP variable for checking if agent is ononNewStageCreatedly inbound
  const [isInboundAgent, setIsInboundAgent] = useState(false);

  const [pipelineStages, setPipelineStages] = useState(stages);
  const [delStageLoader, setDelStageLoader] = useState(false);
  const [delStageLoader2, setDelStageLoader2] = useState(false);
  const [successSnack, setSuccessSnack] = useState(null);
  const [errorSnack, setErrorSnack] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  //code for stages list
  const [stagesList, setStagesList] = useState([]);
  //code for deleting stage
  const [showDelStagePopup, setShowDelStagePopup] = useState(null);
  const [actionInfoEl, setActionInfoEl] = React.useState(null);
  const [actionInfoEl2, setActionInfoEl2] = React.useState(null);
  //code for dropdown stages when delstage
  const [assignNextStage, setAssignNextStage] = useState("");
  const [assignNextStageId, setAssignNextStageId] = useState("");
  //variable for tags input
  const [tagsValue, setTagsValue] = useState([]);

  //code for rename stage popup
  const [showRenamePopup, setShowRenamePopup] = useState(false);
  const [renameStage, setRenameStage] = useState("");
  const [renameStageLoader, setRenameStageLoader] = useState(false);
  const [updateStageColor, setUpdateStageColor] = useState("");
  const [selectedStage, setSelectedStage] = useState("");

  //code to add new stage
  const [addNewStageModal, setAddNewStageModal] = useState(false);
  const [newStageTitle, setNewStageTitle] = useState("");
  const [stageColor, setStageColor] = useState("#000");
  const [addStageLoader, setAddStageLoader] = useState(false);
  //code for advance setting modal inside new stages
  const [showAdvanceSettings, setShowAdvanceSettings] = useState(false);

  const [showAuthSelectionPopup, setShowAuthSelectionPopup] = useState(false)

  //code for upgrade plan modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  //code for input arrays
  const [inputs, setInputs] = useState([
    {
      id: 1,
      value: "",
      placeholder: `Sure, i’d be interested in knowing what my home is worth`,
    },
    { id: 2, value: "", placeholder: "Yeah, how much is my home worth today?" },
    { id: 3, value: "", placeholder: "Yeah, how much is my home worth today?" },
  ]);
  const [action, setAction] = useState("");

  //variable to show and hide the add stage btn
  const [showAddStageBtn, setShowAddStageBtn] = useState(false);

  //get my teams list
  const [myTeamList, setMyTeamList] = useState([]);
  const [myTeamAdmin, setMyTeamAdmin] = useState([]);
  const [assignToMember, setAssignToMember] = useState("");
  const [assignLeadToMember, setAssignLeadToMember] = useState([]);


  //templetes variables
  const [templates, setTempletes] = useState([])
  const [tempLoader, setTempLoader] = useState(null)

  const [showEmailTemPopup, setShowEmailTempPopup] = useState(false)
  const [showSmsTemPopup, setShowSmsTempPopup] = useState(false)

  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [selectedType, setSelectedType] = useState(null)

  const [selectedIndex, setSelectedIndex] = useState(null)

  // Edit functionality variables
  const [isEditing, setIsEditing] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [editingStageIndex, setEditingStageIndex] = useState(null)

  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState(null)

  const [user, setUser] = useState(null)

  const ACTIONS = [
    { value: "email", label: "Email", icon: '/otherAssets/@Icon.png', focusedIcon: '/otherAssets/blue@Icon.png' },
    { value: "sms", label: "Text", icon: '/otherAssets/smsIcon.png', focusedIcon: '/otherAssets/blueSmsIcon.png' },
    { value: "call", label: "Call", icon: '/otherAssets/callIcon.png', focusedIcon: '/otherAssets/blueCallIcon.png' },
  ];

  const actionLabel = (v) => ACTIONS.find(a => a.value === v)?.label || "Make Call";

  console.log('rowsByIndex', rowsByIndex)

  // one menu anchor per stage row-set
  const [addMenuAnchor, setAddMenuAnchor] = useState({}); // { [stageIndex]: HTMLElement|null }

  const openAddMenu = (stageIndex, e) => {
    setAddMenuAnchor((prev) => ({ ...prev, [stageIndex]: e.currentTarget }));
  };

  const closeAddMenu = (stageIndex) => {
    localStorage.removeItem(PersistanceKeys.isDefaultCadenceEditing)
    console.log('is default cadence removed from local')
    setAddMenuAnchor((prev) => ({ ...prev, [stageIndex]: null }));
    setIsEditing(false);
    setEditingRow(null);
    setEditingStageIndex(null);
    setSelectedType(null);
    setSelectedIndex(null);

  };

  const handleSelectAdd = async (stageIndex, value) => {
    if (user?.planCapabilities.allowTextMessages === false && value == "sms") {
      setShowUpgradeModal(true);
      return
    }
    if (value != "call") {
      setSelectedIndex(stageIndex)
      setSelectedType(value)
      // if (temp && temp.length > 0) {
      if (value === "email") {
        setShowAuthSelectionPopup(true)
      } else {
        setShowSmsTempPopup(true)

      }
      // }
    } else {
      if (isEditing) {
        closeAddMenu(stageIndex);
      } else {
        addRow(stageIndex, value);
        closeAddMenu(stageIndex);

      }
    }
    // closeAddMenu(stageIndex);
  };

  const handleEditRow = async (stageIndex, row, e) => {
    if (!row.communicationType) {
      console.log('default cadence editing')
      localStorage.setItem(PersistanceKeys.isDefaultCadenceEditing, JSON.stringify({ isdefault: true }))
      openAddMenu(stageIndex, e)
    }
    console.log('row for edit', row)
    setIsEditing(true);
    setEditingRow(row);
    setEditingStageIndex(stageIndex);
    setSelectedType(row.action ? row.action : 'call');
    setSelectedIndex(stageIndex);

    if (row.communicationType === "email") {
      setShowEmailTempPopup(true);
    } else if (row.communicationType === "sms") {
      setShowSmsTempPopup(true);
    }
  };

  const handleUpdateRow = (rowId, updatedData) => {
    console.log('rowId', rowId)
    console.log('updateData', updatedData)

    // Update the specific row in the pipeline using the updateRow prop

    if (editingStageIndex !== null && updateRow) {
      console.log('update row', editingStageIndex)
      updateRow(editingStageIndex, rowId, updatedData);
    }

    // Reset editing state
    setIsEditing(false);
    setEditingRow(null);
    setEditingStageIndex(null);
  };







  useEffect(() => {

    let data = getUserLocalData()
    // console.log('user local data', data)
    setUser(data.user)
    getMyTeam();
    getNumbers()
  }, [stages]);


  useEffect(() => {
    if (showEmailTemPopup) {
      getTemp()
    }
  }, [showEmailTemPopup])

  const getTemp = async () => {
    // setTempLoader(selectedType)
    let temp = await getTempletes(selectedType)
    setTempletes(temp)
    // setTempLoader(null)
    setShowEmailTempPopup(true)
  }

  const getNumbers = async () => {

    let data = localStorage.getItem("selectedUser")
    if(!data){
      data = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
    }
    let selectedUser  = null
    // console.log('data', data)
    if(data != "undefined"){
       selectedUser = JSON.parse(data)
      console.log("selected user data from local",selectedUser)
    }
    console.log('trying to get a2p numbers')
    setPhoneLoading(true)
    let id = selectedUser?.id
    let num = await getA2PNumbers(id)
    if (num) {
      setPhoneNumbers(num)
    }
    setPhoneLoading(false)
  }

  //ading stages data
  useEffect(() => {
    if (selectedPipelineStages) {
      setStagesList(selectedPipelineStages);
    }
  }, [selectedPipelineStages]);



  function canProceed() {
    if (newStageTitle.length > 0 && action.length == 0) {
      return true;
    }
    if (
      action &&
      action.length > 0 &&
      newStageTitle &&
      newStageTitle.length > 0 &&
      inputs.filter((input) => input.value.trim() !== "").length === 3
    ) {
      return true;
    }
    return false;
  }

  const handlePopoverOpen = (event) => {
    setActionInfoEl(event.currentTarget);
  };

  //get my team
  const getMyTeam = async () => {
    try {
      let response = await getTeamsList();
      if (response) {
        // //console.log;
        let teams = [];
        if (response.admin) {
          let admin = response.admin;
          let newInvite = { id: -1, invitedUser: admin, invitingUser: admin };
          teams.push(newInvite);
        }
        if (response.data && response.data.length > 0) {
          for (const t of response.data) {
            if (t.status == "Accepted") {
              teams.push(t);
            }
          }
        }

        setMyTeamList(teams);
        setMyTeamAdmin(response.admin);
      }
    } catch (error) {
      // console.error("Error occured in api is", error);
    }
  };

  //new teammeber
  const handleAssignTeamMember = (event) => {
    let value = event.target.value;
    // //console.log;
    setAssignToMember(event.target.value);

    const selectedItem = myTeamList.find(
      (item) => item?.invitedUser?.name === value
    );
    // //console.log;
    setAssignToMember(
      selectedItem?.invitedUser?.name || myTeamAdmin.invitedUser?.name
    ); //
    setAssignLeadToMember([
      ...assignLeadToMember,
      selectedItem?.invitedUser?.id || myTeamAdmin.invitedUser?.id,
    ]); //

    // //console.log;
  };

  const handlePopoverClose = () => {
    setActionInfoEl(null);
    setActionInfoEl2(null);
  };

  const open = Boolean(actionInfoEl);
  const openAction = Boolean(actionInfoEl2);

  //gets recent agent details
  useEffect(() => {
    const agentDetails = localStorage.getItem("agentDetails");
    if (agentDetails && agentDetails != "undefined") {
      const agentData = JSON.parse(agentDetails);
      // //console.log;
      if (agentData.agents?.length > 1) {
        // //console.log;
        setIsInboundAgent(false);
      } else {
        if (agentData.agents[0]?.agentType === "inbound") {
          setIsInboundAgent(true);
        } else {
          setIsInboundAgent(false);
        }
      }
    }
  }, []);

  useEffect(() => {
    // //console.log;
    setPipelineStages(stages);
  }, [stages]);



  //code to rename the stage
  const handleRenameStage = async () => {
    try {
      setRenameStageLoader(true);
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      // //console.log;

      // const ApiData = {
      //     stageTitle: renameStage,
      //     stageId: selectedStage.id,
      //     color: updateStageColor
      // }

      const formData = new FormData();
      formData.append("stageTitle", renameStage);
      formData.append("stageId", selectedStage.id);
      formData.append("color", updateStageColor);

      //// //console.log;

      for (let [key, value] of formData.entries()) {
        // //console.log;
      }

      const ApiPath = Apis.UpdateStage;

      // //console.log;
      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        setPipelineStages(response.data.data.stages);
        setShowRenamePopup(false);
        // setSuccessSnack(response.data.message);
        // handleCloseStagePopover();
      }
    } catch (error) {
      // //console.log;
    } finally {
      setRenameStageLoader(false);
    }
  };

  //code to close the add stage model
  const handleCloseAddStage = () => {
    setAddNewStageModal(false);
    setNewStageTitle("");
    setInputs([
      { id: 1, value: "" },
      { id: 2, value: "" },
      { id: 3, value: "" },
    ]);
  };

  //code for drag and drop stages
  const handleOnDragEnd = (result) => {
    // //console.log;
    const { source, destination } = result;
    // //console.log;
    // if (!destination) return;
    if (!destination || source.index === 0 || destination.index === 0) {
      setShowRearrangeErr("Cannot rearrange when stage is expanded.");
      setIsVisibleSnack(true);
      setSnackType("Error");
      // //console.log;
      return;
    }

    // if (!destination || source.index === destination.index) {
    //    // //console.log
    //     return;
    // }

    // //console.log;
    const items = Array.from(pipelineStages);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    // //console.log;
    const updatedStages = items.map((stage, index) => ({
      ...stage,
      order: index + 1,
    }));

    // //console.log;
    setPipelineStages(updatedStages);
    onUpdateOrder(updatedStages);
    handleReOrder();
  };

  //functions to move to stage after deleting one
  const handleChangeNextStage = (event) => {
    let value = event.target.value;
    //// //console.log;
    setAssignNextStage(event.target.value);

    const selectedItem = pipelineStages.find(
      (item) => item.stageTitle === value
    );
    setAssignNextStageId(selectedItem.id);

    // //console.log;
  };

  //code to delete stage
  const handleDeleteStage = async (value) => {
    try {
      if (value === "del2") {
        // //console.log;
        setDelStageLoader2(true);
      } else if (value === "del") {
        // //console.log;
        setDelStageLoader(true);
      }
      // //console.log;
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
        //// //console.log;
      }

      // //console.log;

      const ApiData = {
        // pipelineId: selectedPipelineItem.id,
        // stageId: showDelStagePopup.id
        pipelineId: selectedPipelineItem.id,
        stageId: showDelStagePopup.id,
        moveToStageId: assignNextStageId,
      };

      // //console.log;
      // return
      const ApiPath = Apis.deleteStage;
      // //console.log;

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          setPipelineStages(response.data.data.stages);
          setSuccessSnack(response.data.message);
          setShowDelStagePopup(null);
          let p = localStorage.getItem("pipelinesList")

          if (p) {
            let localPipelines = JSON.parse(p)

            let updatedPipelines = localPipelines.map(pipeline => {
              if (selectedPipelineItem.id === pipeline.id) {
                return {
                  ...pipeline,
                  stages: pipeline.stages.filter(stage => stage.id !== showDelStagePopup.id)
                };
              }
              return pipeline; // Return unchanged pipeline for others
            });

            //console.log
            localStorage.setItem("pipelinesList", JSON.stringify(updatedPipelines));

          } else {
            //console.log
          }
          // setStageAnchorel(null);
        }
      }
    } catch (error) {
      // console.error("Error occured in delstage api is:", error);
    } finally {
      setDelStageLoader(false);
    }
  };

  //code for add stage input fields
  const handleAddStageInputsChanges = (id, value) => {
    setInputs(
      inputs.map((input) => (input.id === id ? { ...input, value } : input))
    );
  };

  // Handle deletion of input field
  const handleDelete = (id) => {
    setInputs(inputs.filter((input) => input.id !== id));
  };

  // Handle adding a new input field
  const handleAddInput = () => {
    const newId = inputs.length ? inputs[inputs.length - 1].id + 1 : 1;
    setInputs([
      ...inputs,
      { id: newId, value: "", placeholder: "Add sample answer" },
    ]);
  };

  //code for adding new custom stage
  const handleAddNewStageTitle = async () => {
    try {
      setAddStageLoader(true);
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
        // //console.log;
      }

      // //console.log;

      const ApiPath = Apis.addCustomStage;
      // //console.log;

      const ApiData = {
        stageTitle: newStageTitle,
        color: stageColor,
        pipelineId: selectedPipelineItem.id,
        action: action,
        examples: inputs,
        tags: tagsValue,
        teams: assignLeadToMember,
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
          setPipelineStages(response.data.data.stages);
          handleCloseAddStage();
          setNewStageTitle("");
          // setStageColor("");
          setStagesList(response.data.data.stages);
          selectedPipelineItem.stages = response.data.data.stages;
          onNewStageCreated(selectedPipelineItem);
        } else {
          let message = response.data.message;
          setErrorMessage(message);
          setErrorSnack(true)
        }
      }
    } catch (error) {
      // console.error("Error occured inn adding new stage title api is", error);
    } finally {
      setAddStageLoader(false);
    }
  };


  const shouldDisable = (item) => {
    if (item.value == "sms" && ((phoneNumbers.length === 0) && user?.planCapabilities.allowTextMessages === false)) {// 
      return true
    } else {
      return false
    }
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
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="pipelineStages">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{
              maxHeight: "100vh",
              // overflowY: "auto",
              // borderRadius: "8px",
              // padding: "10px",
              border: "none",
              scrollbarWidth: "none",
              marginTop: 20,
            }}
          >
            {pipelineStages.map((item, index) => (
              <Draggable
                key={item.id}
                draggableId={item.id.toString()}
                index={index}
                isDragDisabled={index === 0}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      // border: "1px solid red",
                      borderRadius: "10px",
                      // padding: "15px",
                      marginBottom: "10px",
                      backgroundColor: "#fff",
                      // boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                    className="flex flex-row items-start"
                  >
                    <AgentSelectSnackMessage
                      isVisible={
                        successSnack == false || successSnack == null
                          ? false
                          : true
                      }
                      hide={() => setSuccessSnack(false)}
                      message={successSnack}
                      type={SnackbarTypes.Success}
                    />
                    <AgentSelectSnackMessage
                      isVisible={
                        errorSnack == false || errorSnack == null
                          ? false
                          : true
                      }
                      hide={() => setErrorSnack(false)}
                      message={errorMessage}
                      type={SnackbarTypes.Error}
                    />
                    <div className="w-[5%]">
                      {index > 0 && (
                        <div className="outline-none mt-2">
                          <Image
                            src={"/assets/list.png"}
                            height={6}
                            width={16}
                            alt="*"
                          />
                        </div>
                      )}
                    </div>
                    <div className="border w-[95%] rounded-xl p-3 px-4">
                      <div className="flex flex-row items-center justify-between">
                        <div className="flex flex-row items-center gap-2">
                          <div style={styles.inputStyle}>{item.stageTitle}</div>
                          {index > 0 && (
                            <button
                              className="outline-none"
                              onClick={() => {
                                setShowRenamePopup(true);
                                setRenameStage(item.stageTitle);
                                setSelectedStage(item);
                              }}
                            >
                              <PencilSimple size={16} weight="regular" />
                            </button>
                          )}
                        </div>

                        {isInboundAgent ? (
                          <div>
                            {index > 0 && item.stageTitle !== "Booked" && (
                              <div className="w-full flex flex-row items-center justify-end mt-2">
                                <button
                                  className="flex flex-row items-center gap-1"
                                  onClick={() => {
                                    setShowDelStagePopup(item);
                                  }}
                                >
                                  <Image
                                    src={"/assets/delIcon.png"}
                                    height={20}
                                    width={18}
                                    alt="*"
                                    style={{
                                      filter:
                                        "invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)",
                                      opacity: 0.5,
                                    }}
                                  />
                                  <p
                                    className="text-[#15151580]"
                                    style={{ fontWeight: "500", fontSize: 14 }}
                                  >
                                    Delete
                                  </p>
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            {assignedLeads[index] ? (
                              <div>
                                <button
                                  className="bg-[#00000020] flex flex-row items-center justify-center gap-1"
                                  style={{
                                    ...styles.inputStyle,
                                    borderRadius: "55px",
                                    height: "40px",
                                    width: "104px",
                                  }}
                                  onClick={() => handleUnAssignNewStage(index)}
                                >
                                  <Minus size={18} weight="regular" />
                                  <div>Unassign</div>
                                </button>
                              </div>
                            ) : (
                              <button
                                className="bg-purple text-white flex flex-row items-center justify-center gap-2"
                                style={{
                                  ...styles.inputStyle,
                                  borderRadius: "55px",
                                  height: "38px",
                                  width: "104px",
                                }}
                                onClick={() => assignNewStage(index)}
                              >
                                <Image
                                  src={"/assets/addIcon.png"}
                                  height={16}
                                  width={16}
                                  alt="*"
                                />
                                <div>Assign</div>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        {assignedLeads[index] && (
                          <div>
                            <div
                              className="mt-4"
                              style={{ fontWeight: "500", fontSize: 12 }}
                            >
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: "500",
                                  color: "#00000060",
                                }}
                              >
                                {item.description}
                              </div>
                            </div>
                            <div className="border rounded-xl py-4 px-4 mt-4">
                              <div>
                                {(rowsByIndex[index] || []).map(
                                  (row, rowIndex) => (
                                    <div
                                      key={row.id}
                                      className="flex flex-row items-center justify-center mb-2"
                                    >
                                      <div className="mt-2" style={styles.headingStyle}>
                                        Wait
                                      </div>
                                      <div className="ms-6 flex flex-row items-center w-full justify-between">
                                        <div className="flex flex-row items-center">
                                          <div>
                                            <label
                                              className="ms-1 px-2"
                                              style={styles.labelStyle}
                                            >
                                              Days
                                            </label>
                                            <input
                                              className="flex flex-row items-center justify-center text-center outline-none focus:ring-0"
                                              style={{
                                                ...styles.inputStyle,
                                                height: "42px",
                                                width: "80px",
                                                border: "1px solid #00000020",
                                                borderTopLeftRadius: "10px",
                                                borderBottomLeftRadius: "10px",
                                              }}
                                              placeholder="Days"
                                              value={row.waitTimeDays}
                                              onChange={(e) =>
                                                handleInputChange(
                                                  index,
                                                  row.id,
                                                  "waitTimeDays",
                                                  e.target.value.replace(
                                                    /[^0-9]/g,
                                                    ""
                                                  )
                                                )
                                              }
                                            />
                                          </div>
                                          <div>
                                            <label
                                              className="ms-1 px-2"
                                              style={styles.labelStyle}
                                            >
                                              Hours
                                            </label>
                                            <input
                                              className="flex flex-row items-center justify-center text-center outline-none focus:ring-0"
                                              style={{
                                                ...styles.inputStyle,
                                                height: "42px",
                                                width: "80px",
                                                border: "1px solid #00000020",
                                                borderRight: "none",
                                                borderLeft: "none",
                                              }}
                                              placeholder="Hours"
                                              value={row.waitTimeHours}
                                              onChange={(e) =>
                                                handleInputChange(
                                                  index,
                                                  row.id,
                                                  "waitTimeHours",
                                                  e.target.value.replace(
                                                    /[^0-9]/g,
                                                    ""
                                                  )
                                                )
                                              }
                                            />
                                          </div>
                                          <div>
                                            <label
                                              className="ms-1 px-2"
                                              style={styles.labelStyle}
                                            >
                                              Mins
                                            </label>
                                            <input
                                              className="flex flex-row items-center justify-center text-center outline-none focus:ring-0"
                                              style={{
                                                ...styles.inputStyle,
                                                height: "42px",
                                                width: "80px",
                                                border: "1px solid #00000020",
                                                borderTopRightRadius: "10px",
                                                borderBottomRightRadius: "10px",
                                              }}
                                              placeholder="Minutes"
                                              value={row.waitTimeMinutes}
                                              onChange={(e) =>
                                                handleInputChange(
                                                  index,
                                                  row.id,
                                                  "waitTimeMinutes",
                                                  e.target.value.replace(
                                                    /[^0-9]/g,
                                                    ""
                                                  )
                                                )
                                              }
                                            />
                                          </div>
                                          <div
                                            className="ms-4 mt-2 flex flex-row items-center"
                                            style={styles.inputStyle}
                                          ><div>
                                              {item.stageTitle === "Booked" &&
                                                "before the meeting"}
                                              , then{" "}
                                            </div>
                                            <div className="ml-2" style={{ fontWeight: "600" }}>
                                              <div className="flex flex-row bg-[#7902df10] items-cetner gap-2 p-2 rounded">
                                                <div className="text-purple text-[12px]">
                                                  {
                                                    (row.communicationType && row.communicationTyp != "call") ? (
                                                      `Send ${actionLabel(row.communicationType)}`
                                                    ) : (
                                                      `Make Call`
                                                    )
                                                  }

                                                </div>


                                                <button onClick={(e) => handleEditRow(index, row, e)}>
                                                  <Image src={'/svgIcons/editIconPurple.svg'}
                                                    height={16} width={16} alt="*"
                                                  />
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        {rowIndex > 0 && (
                                          <button
                                            className="ms-2 mt-2"
                                            onClick={() =>
                                              removeRow(index, row.id)
                                            }
                                          >
                                            <Image
                                              src="/assets/blackBgCross.png"
                                              height={20}
                                              width={20}
                                              alt="*"
                                            />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )
                                )}
                                <button
                                  onClick={(e) => openAddMenu(index, e)}
                                  style={styles.inputStyle}
                                  className="text-purple mt-4"
                                >
                                  + Add (If no answer)
                                </button>
                                <Menu
                                  anchorEl={addMenuAnchor[index] || null}
                                  open={Boolean(addMenuAnchor[index])}
                                  onClose={() => {
                                    closeAddMenu(index)
                                    localStorage.removeItem(PersistanceKeys.isDefaultCadenceEditing)
                                  }}
                                  PaperProps={{
                                    style: {
                                      boxShadow: "0px_-2px_25.600000381469727px_1px_rgba(0,0,0,0.05)", // custom purple shadow
                                      borderRadius: "12px",
                                    },
                                  }}
                                >
                                  {ACTIONS.map((a) => (
                                    <Tooltip key={a.id}
                                      title={shouldDisable(a) && user?.planCapabilities.allowTextMessages === true ? "You need to complete A2P to text" : ""}
                                      arrow
                                      disableHoverListener={!shouldDisable(a)}
                                      disableFocusListener={!shouldDisable(a)}
                                      disableTouchListener={!shouldDisable(a)}
                                      componentsProps={{
                                        tooltip: {
                                          sx: {
                                            backgroundColor: "#ffffff", // Ensure white background
                                            color: "#333", // Dark text color
                                            fontSize: "16px",
                                            fontWeight: "500",
                                            padding: "10px 15px",
                                            borderRadius: "8px",
                                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow
                                          },
                                        },
                                        arrow: {
                                          sx: {
                                            color: "#ffffff", // Match tooltip background
                                          },
                                        },
                                      }}
                                    >
                                      <div>
                                        <MenuItem
                                          // disabled={shouldDisable(a)}
                                          key={a.value}
                                          sx={{
                                            width: 180,
                                            '&:hover .action-icon': {
                                              display: 'none',
                                            },
                                            '&:hover .action-icon-hover': {
                                              display: 'block',
                                            },
                                          }}
                                          onClick={() => handleSelectAdd(index, a.value)}
                                        >
                                          {
                                            tempLoader === a.value ? (
                                              <CircularProgress size={20} />
                                            ) : (
                                              <div className="flex flex-row items-center justify-between w-full">
                                                <div className="flex flex-row items-center gap-3">
                                                  {/* default icon */}
                                                  <Image
                                                    src={a.icon}
                                                    height={20}
                                                    width={20}
                                                    alt="*"
                                                    className="action-icon"
                                                    style={{ display: 'block' }}
                                                  />
                                                  {/* blue (hover) icon */}
                                                  <Image
                                                    src={a.focusedIcon}
                                                    height={20}
                                                    width={20}
                                                    alt="*"
                                                    className="action-icon-hover"
                                                    style={{ display: 'none' }}
                                                  />

                                                  <div style={{ fontSize: 15, fontWeight: '400' }}>{a.label}</div>
                                                  {
                                                    user?.planCapabilities.allowTextMessages === false && a.label == "Text" &&

                                                    <button className="ml-2">
                                                      <UpgradeTag />
                                                    </button>
                                                  }

                                                </div>
                                                {
                                                  shouldDisable(a)  && user?.planCapabilities.allowTextMessages != false && a.label == "Text" && (
                                                    <Image
                                                      src={"/otherAssets/redInfoIcon.png"}
                                                      height={16}
                                                      width={16}
                                                      alt="*"
                                                    />
                                                  )
                                                }
                                              </div>
                                            )}
                                        </MenuItem>
                                      </div>
                                    </Tooltip>
                                  ))}
                                </Menu>


                              </div>
                              <div className="flex flex-row items-center gap-2 mt-4">
                                <div style={styles.inputStyle}>
                                  Then move to
                                </div>

                                <Box
                                  className="flex flex-row item-center justify-center"
                                  sx={{ width: "141px", py: 0, m: 0 }}
                                >
                                  <FormControl
                                    fullWidth
                                    sx={{ py: 0, my: 0, minHeight: 0 }}
                                  >
                                    <Select
                                      displayEmpty
                                      value={nextStage[index] || ""}
                                      onChange={(event) =>
                                        handleSelectNextChange(index, event)
                                      }
                                      renderValue={(selected) => {
                                        if (selected === "") {
                                          return (
                                            <div style={styles.dropdownMenu}>
                                              Select Stage
                                            </div>
                                          );
                                        }
                                        return selected;
                                      }}
                                      sx={{
                                        ...styles.dropdownMenu,
                                        backgroundColor: "transparent",
                                        color: "#000000",
                                        border: "1px solid #00000020",
                                        py: 0,
                                        my: 0,
                                        minHeight: 0,
                                        height: "32px",
                                        "& .MuiOutlinedInput-root": {
                                          py: 0,
                                          my: 0,
                                          minHeight: 0,
                                        },
                                        "& .MuiSelect-select": {
                                          py: 0,
                                          my: 0,
                                          display: "flex",
                                          alignItems: "center",
                                        },
                                        "& .MuiOutlinedInput-notchedOutline": {
                                          border: "none",
                                        },
                                      }}
                                    >
                                      <MenuItem value="">Select stage</MenuItem>

                                      {stagesList.map((dropDownStateItem) => (
                                        <MenuItem
                                          disabled={
                                            dropDownStateItem.order <=
                                            item.order
                                          }
                                          key={dropDownStateItem.id}
                                          value={dropDownStateItem.stageTitle}
                                          sx={{
                                            py: 0,
                                            my: 0,
                                            minHeight: "32px",
                                          }}
                                        >
                                          {dropDownStateItem.stageTitle
                                            .slice(0, 1)
                                            .toUpperCase()}
                                          {dropDownStateItem.stageTitle.slice(
                                            1
                                          )}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Box>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {index > 0 && !isInboundAgent && item.stageTitle !== "Booked" && (
                        <div className="w-full flex flex-row items-center justify-end mt-2">
                          <button
                            className="flex flex-row items-center gap-1"
                            onClick={() => {
                              setShowDelStagePopup(item);
                            }}
                          >
                            <Image
                              src={"/assets/delIcon.png"}
                              height={20}
                              width={18}
                              alt="*"
                              style={{
                                filter:
                                  "invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)",
                                opacity: 0.5,
                              }}
                            />
                            <p
                              className="text-[#15151580]"
                              style={{ fontWeight: "500", fontSize: 14 }}
                            >
                              Delete
                            </p>
                          </button>
                        </div>
                      )}

                      {/* Modal to rename stage */}
                      <Modal
                        open={showRenamePopup}
                        onClose={() => {
                          setShowRenamePopup(false);
                          // handleCloseStagePopover();
                        }}
                        BackdropProps={{
                          timeout: 1000,
                          sx: {
                            backgroundColor: "#00000010",
                            //backdropFilter: "blur(5px)",
                          },
                        }}
                      >
                        <Box
                          className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12"
                          sx={{
                            ...styles.modalsStyle,
                            backgroundColor: "white",
                          }}
                        >
                          <div style={{ width: "100%" }}>
                            <div
                              className="max-h-[60vh] overflow-auto"
                              style={{ scrollbarWidth: "none" }}
                            >
                              <div
                                style={{
                                  width: "100%",
                                  direction: "row",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                {/* <div style={{ width: "20%" }} /> */}
                                <div
                                  style={{ fontWeight: "700", fontSize: 22 }}
                                >
                                  Rename stage
                                </div>
                                <div
                                  style={{
                                    direction: "row",
                                    display: "flex",
                                    justifyContent: "end",
                                  }}
                                >
                                  <button
                                    onClick={() => {
                                      setShowRenamePopup(false);
                                      // handleCloseStagePopover();
                                    }}
                                    className="outline-none"
                                  >
                                    <Image
                                      src={"/assets/crossIcon.png"}
                                      height={40}
                                      width={40}
                                      alt="*"
                                    />
                                  </button>
                                </div>
                              </div>

                              <div>
                                <div
                                  className="mt-4"
                                  style={{
                                    fontWeight: "600",
                                    fontSize: 12,
                                    paddingBottom: 5,
                                  }}
                                >
                                  Stage Title*
                                </div>
                                <input
                                  value={renameStage}
                                  onChange={(e) => {
                                    setRenameStage(e.target.value);
                                  }}
                                  placeholder="Enter stage title"
                                  className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px]"
                                  style={{ border: "1px solid #00000020" }}
                                />
                                <div
                                  style={{
                                    marginTop: 20,
                                    fontWeight: "600",
                                    fontSize: 12,
                                    paddingBottom: 5,
                                  }}
                                >
                                  color
                                </div>
                                <ColorPicker
                                  setStageColor={setUpdateStageColor}
                                  stageColor={updateStageColor}
                                />
                              </div>
                            </div>

                            {renameStageLoader ? (
                              <div className="flex flex-row iems-center justify-center w-full mt-4">
                                <CircularProgress size={25} />
                              </div>
                            ) : (
                              <button
                                className="mt-4 outline-none bg-purple"
                                style={{
                                  // backgroundColor: "#402FFF",
                                  color: "white",
                                  height: "50px",
                                  borderRadius: "10px",
                                  width: "100%",
                                  fontWeight: 600,
                                  fontSize: "20",
                                }}
                                onClick={handleRenameStage}
                              >
                                Add
                              </button>
                            )}
                          </div>
                        </Box>
                      </Modal>

                      {/* Modal to delete stage */}
                      <Modal
                        open={showDelStagePopup}
                        onClose={() => setShowDelStagePopup(null)}
                        closeAfterTransition
                        BackdropProps={{
                          timeout: 1000,
                          sx: {
                            backgroundColor: "#00000010",
                            //backdropFilter: "blur(5px)",
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
                              <div className="flex flex-row justify-between items-center">
                                <div
                                  className="text-center font-16"
                                  style={{ fontWeight: "700" }}
                                >
                                  Delete stage
                                </div>

                                <button
                                  onClick={() => {
                                    setShowDelStagePopup(null);
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

                              {selectedStage?.hasLeads ? (
                                <div>
                                  <div
                                    className="max-h-[60vh] overflow-auto"
                                    style={{ scrollbarWidth: "none" }}
                                  >
                                    <div
                                      className="mt-6"
                                      style={{
                                        fontWeight: "500",
                                        fontSize: 15,
                                      }}
                                    >
                                      This stage has leads associated with it.
                                      Move this lead to another stage before
                                      deleting.
                                    </div>

                                    <div
                                      className="mt-6"
                                      style={{
                                        fontWeight: "700",
                                        fontSize: 15,
                                      }}
                                    >
                                      Move to
                                    </div>

                                    <FormControl fullWidth>
                                      <Select
                                        id="demo-simple-select"
                                        value={assignNextStage || ""} // Default to empty string when no value is selected
                                        onChange={handleChangeNextStage}
                                        displayEmpty // Enables placeholder
                                        renderValue={(selected) => {
                                          if (!selected) {
                                            return (
                                              <div style={{ color: "#aaa" }}>
                                                Select Stage
                                              </div>
                                            ); // Placeholder style
                                          }
                                          return selected;
                                        }}
                                        sx={{
                                          border: "1px solid #00000020", // Default border
                                          "&:hover": {
                                            border: "1px solid #00000020", // Same border on hover
                                          },
                                          "& .MuiOutlinedInput-notchedOutline":
                                          {
                                            border: "none", // Remove the default outline
                                          },
                                          "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                          {
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
                                            },
                                          },
                                        }}
                                      >
                                        {pipelineStages.map((stage, index) => {
                                          return (
                                            <MenuItem
                                              key={index}
                                              value={stage.stageTitle}
                                              disabled={
                                                stage.id === selectedStage?.id
                                              }
                                            >
                                              {stage.stageTitle}
                                            </MenuItem>
                                          );
                                        })}
                                      </Select>
                                    </FormControl>
                                  </div>

                                  {delStageLoader2 ? (
                                    <div className="flex flex-row iems-center justify-center w-full mt-10">
                                      <CircularProgress size={25} />
                                    </div>
                                  ) : (
                                    <button
                                      className="mt-10 outline-none bg-purple"
                                      disabled={!assignNextStage}
                                      style={{
                                        color: "white",
                                        height: "50px",
                                        borderRadius: "10px",
                                        width: "100%",
                                        backgroundColor:
                                          !assignNextStage && "#00000020",
                                        color: !assignNextStage && "#000000",
                                        fontWeight: 600,
                                        fontSize: "20",
                                      }}
                                      onClick={(e) => {
                                        handleDeleteStage("del2");
                                      }}
                                    >
                                      Delete
                                    </button>
                                  )}

                                  {delStageLoader ? (
                                    <div className="flex flex-row iems-center justify-center w-full mt-4">
                                      <CircularProgress size={25} />
                                    </div>
                                  ) : (
                                    <div className="flex flex-row iems-center justify-center w-full">
                                      <button
                                        className="mt-2 outline-none"
                                        style={{
                                          color: "#00000080",
                                          fontWeight: "500",
                                          fontSize: 15,
                                          borderBottom: "1px solid #00000080",
                                        }}
                                        onClick={(e) => {
                                          handleDeleteStage("del");
                                        }}
                                      >
                                        Delete and remove leads from pipeline
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <div
                                    className="mt-6"
                                    style={{
                                      fontWeight: "500",
                                      fontSize: 15,
                                    }}
                                  >
                                    Confirm you want to delete this stage.This
                                    action is irreversible.
                                  </div>
                                  <div className="flex flex-row items-center w-full mt-8">
                                    <div
                                      className="w-1/2 text-center"
                                      onClick={() => {
                                        setShowDelStagePopup(null);
                                      }}
                                    >
                                      Cancel
                                    </div>
                                    {delStageLoader ? (
                                      <div className="flex flex-row iems-center justify-center w-1/2">
                                        <CircularProgress size={25} />
                                      </div>
                                    ) : (
                                      <button
                                        className="bg-red text-white w-1/2 h-[44px] rounded-[10px]"
                                        onClick={(e) => {
                                          handleDeleteStage("del");
                                        }}
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </Box>
                      </Modal>
                    </div>

                    <SMSTempletePopup

                      open={showSmsTemPopup}
                      onClose={() => {
                        setShowSmsTempPopup(false)
                        closeAddMenu(selectedIndex)
                      }}
                      phoneNumbers={phoneNumbers}
                      phoneLoading={phoneLoading}
                      addRow={(templateData) => addRow(selectedIndex, selectedType, templateData)}
                      communicationType={selectedType}
                      onUpdateRow={handleUpdateRow}
                      isEditing={isEditing}
                      editingRow={editingRow}
                    />
                  </div>
                )}


              </Draggable>
            ))}
            {provided.placeholder}

            <button
              className="outline-none w-full flex flex-row items-center justify-center h-[50px] mt-4 rounded-lg"
              style={{
                border: "2px dashed #7902DF",
              }}
              onClick={() => {
                setAddNewStageModal(true);
              }}
            >
              <div className="gap-1 flex flex-row items-center">
                <Image
                  src={"/assets/addIcon.png"}
                  height={15}
                  width={15}
                  alt="*"
                  style={{
                    // filter: 'invert(23%) sepia(50%) saturate(7999%) hue-rotate(259deg) brightness(100%) contrast(140%)',
                    filter:
                      "invert(59%) sepia(84%) saturate(7500%) hue-rotate(260deg) brightness(90%) contrast(110%)",
                  }}
                />
                <p
                  className="text-purple"
                  style={{ fontSize: 16, fontWeight: "600" }}
                >
                  Add New Stage
                </p>
              </div>
            </button>

            <AuthSelectionPopup open={showAuthSelectionPopup}
              onClose={() => setShowAuthSelectionPopup(false)}
              showEmailTemPopup={showEmailTemPopup}
              setShowEmailTempPopup={setShowEmailTempPopup}
              setSelectedGoogleAccount={(account) => {
                console.log('PipelineStages: setSelectedGoogleAccount called with:', account)
                setSelectedGoogleAccount(account)
              }}

            />

            <EmailTempletePopup open={showEmailTemPopup} onClose={() => {
              setShowEmailTempPopup(false)
              setIsEditing(false);
              setEditingRow(null);
              setEditingStageIndex(null);
              closeAddMenu(selectedIndex)
            }}
              setSelectedGoogleAccount={(account) => {
                console.log(`PipelineStagesEmailTempletePopup: setSelectedGoogleAccount called with: ${account}`)
                setSelectedGoogleAccount(account)
              }}
              selectedGoogleAccount={selectedGoogleAccount}
              onGoogleAccountChange={(account) => {
                console.log(`PipelineStages: onGoogleAccountChange called with: ${account}`)
                setSelectedGoogleAccount(account)
              }}
              templetes={templates}
              setTempletes={setTempletes}
              communicationType={selectedType} // in this varable i have stored selected option value like email or sms
              addRow={(templateData) => {
                console.log('PipelineStages: addRow called with:', {
                  selectedIndex,
                  selectedType,
                  templateData
                });
                addRow(selectedIndex, selectedType, templateData)
              }}
              isEditing={isEditing}
              editingRow={editingRow}
              onUpdateRow={handleUpdateRow}
            />





            {/* Code for add stage modal */}
            <Modal
              open={addNewStageModal}
              onClose={() => {
                handleCloseAddStage();
              }}
            >
              <Box
                className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12"
                sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
              >
                <div style={{ width: "100%" }}>
                  <div
                    style={{ scrollbarWidth: "none" }} //className='max-h-[60vh] overflow-auto'
                  >
                    <div
                      style={{
                        width: "100%",
                        direction: "row",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      {/* <div style={{ width: "20%" }} /> */}
                      <div style={{ fontWeight: "700", fontSize: 22 }}>
                        Add New Stage
                      </div>
                      <div
                        style={{
                          direction: "row",
                          display: "flex",
                          justifyContent: "end",
                        }}
                      >
                        <button
                          onClick={() => {
                            handleCloseAddStage();
                          }}
                          className="outline-none"
                        >
                          <Image
                            src={"/assets/crossIcon.png"}
                            height={40}
                            width={40}
                            alt="*"
                          />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div
                        className="mt-4"
                        style={{
                          fontWeight: "600",
                          fontSize: 12,
                          paddingBottom: 5,
                        }}
                      >
                        Stage Title*
                      </div>
                      <input
                        value={newStageTitle}
                        onChange={(e) => {
                          setNewStageTitle(e.target.value);
                        }}
                        placeholder="Enter stage title"
                        className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px]"
                        style={{ border: "1px solid #00000020" }}
                      />
                      <div
                        style={{
                          marginTop: 20,
                          fontWeight: "600",
                          fontSize: 12,
                          paddingBottom: 5,
                        }}
                      >
                        color
                      </div>
                      <ColorPicker setStageColor={setStageColor} />
                    </div>

                    <div className="text-purple mt-4">
                      <button
                        onClick={() => {
                          setShowAdvanceSettings(!showAdvanceSettings);
                        }}
                        className="flex flex-row items-center gap-2 outline-none"
                      >
                        <div style={{ fontWeight: "600", fontSize: 15 }}>
                          Advanced Settings
                        </div>
                        {showAdvanceSettings ? (
                          <CaretUp size={15} weight="bold" />
                        ) : (
                          <CaretDown size={15} weight="bold" />
                        )}
                      </button>
                    </div>

                    {showAdvanceSettings && (
                      <div
                        className="max-h-[40vh] overflow-auto"
                        style={{ scrollbarWidth: "none" }}
                      >
                        <div className="flex flex-row items-center gap-2 mt-4">
                          <p style={{ fontWeight: "600", fontSize: 15 }}>
                            Action
                          </p>
                          {/* <Image src={"/svgIcons/infoIcon.svg"} height={20} width={20} alt='*' /> */}
                          <Image
                            src="/svgIcons/infoIcon.svg"
                            height={20}
                            width={20}
                            alt="*"
                            aria-owns={open ? "mouse-over-popover" : undefined}
                            aria-haspopup="true"
                            onMouseEnter={handlePopoverOpen}
                            onMouseLeave={handlePopoverClose}
                          />

                          <Popover
                            id="mouse-over-popover"
                            sx={{
                              pointerEvents: "none",
                            }}
                            open={open}
                            anchorEl={actionInfoEl}
                            anchorOrigin={{
                              vertical: "top",
                              horizontal: "center",
                            }}
                            transformOrigin={{
                              vertical: "bottom",
                              horizontal: "left",
                            }}
                            PaperProps={{
                              elevation: 1, // This will remove the shadow
                              style: {
                                boxShadow: "0px 10px 10px rgba(0, 0, 0, 0.1)",
                              },
                            }}
                            onClose={handlePopoverClose}
                            disableRestoreFocus
                          >
                            <div className="p-2">
                              <div className="flex flex-row items-center gap-1">
                                <Image
                                  src={"/svgIcons/infoIcon.svg"}
                                  height={24}
                                  width={24}
                                  alt="*"
                                />
                                <p style={{ fontWeight: "500", fontSize: 12 }}>
                                  Tip: Tell your AI when to move the leads to
                                  this stage.
                                </p>
                              </div>
                            </div>
                          </Popover>
                        </div>
                        <textarea
                          className="h-[50px] px-2 outline-none focus:ring-0 w-full mt-1 rounded-lg"
                          placeholder="Ex: Does the human express interest getting a CMA "
                          style={{
                            border: "1px solid #00000020",
                            fontWeight: "500",
                            fontSize: 15,
                            maxHeight: "200px"
                          }}
                          value={action}
                          onChange={(e) => {
                            setAction(e.target.value);
                          }}
                        />

                        <div className="flex flex-row items-center gap-2 mt-4">
                          <p style={{ fontWeight: "600", fontSize: 15 }}>
                            Sample Answers
                          </p>
                          {/* <Image src={"/svgIcons/infoIcon.svg"} height={20} width={20} alt='*' /> */}
                          <Image
                            src="/svgIcons/infoIcon.svg"
                            height={20}
                            width={20}
                            alt="*"
                            aria-owns={
                              openAction ? "mouse-over-popover2" : undefined
                            }
                            aria-haspopup="true"
                            onMouseEnter={(event) => {
                              setShowSampleTip(true);
                              setActionInfoEl2(event.currentTarget);
                            }}
                            onMouseLeave={() => {
                              handlePopoverClose();
                              setShowSampleTip(false);
                            }}
                          />
                        </div>

                        <div
                          className=" mt-2" //scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple max-h-[30vh] overflow-auto
                          style={{ scrollbarWidth: "none" }}
                        >
                          {inputs.map((input, index) => (
                            <div
                              key={input.id}
                              className="w-full flex flex-row items-center gap-4 mt-4"
                            >
                              <input
                                className="border p-2 rounded-lg px-3 outline-none focus:outline-none focus:ring-0 h-[53px]"
                                style={{
                                  ...styles.paragraph,
                                  width: "95%",
                                  borderColor: "#00000020",
                                }}
                                placeholder={input.placeholder}
                                // placeholder={`
                                //     ${index === 0 ? "Sure, i would be interested in knowing what my home is worth" :
                                //         index === 1 ? "Yeah, how much is my home worth today?" :
                                //         `Add sample answer ${index + 1}`
                                //     }`}
                                value={input.value}
                                onChange={(e) =>
                                  handleAddStageInputsChanges(
                                    input.id,
                                    e.target.value
                                  )
                                }
                              />
                              {/* <button className='outline-none border-none' style={{ width: "5%" }} onClick={() => handleDelete(input.id)}>
                                                                    <Image src={"/assets/blackBgCross.png"} height={20} width={20} alt='*' />
                                                                </button> */}
                            </div>
                          ))}
                        </div>
                        {/* <div style={{ height: "50px" }}>
                                                        {
                                                            inputs.length < 3 && (
                                                                <button onClick={handleAddInput} className='mt-4 p-2 outline-none border-none text-purple rounded-lg underline' style={{
                                                                    fontSize: 15,
                                                                    fontWeight: "700"
                                                                }}>
                                                                    Add New
                                                                </button>
                                                            )
                                                        }
                                                    </div> */}

                        <div className="flex flex-row items-center gap-2 mt-4">
                          <p style={{ fontWeight: "600", fontSize: 15 }}>
                            Assign to
                          </p>
                          {/* <Image src={"/svgIcons/infoIcon.svg"} height={20} width={20} alt='*' /> */}
                          <Image
                            src="/svgIcons/infoIcon.svg"
                            height={20}
                            width={20}
                            alt="*"
                            aria-owns={
                              openAction ? "mouse-over-popover2" : undefined
                            }
                            aria-haspopup="true"
                            onMouseEnter={(event) => {
                              setActionInfoEl2(event.currentTarget);
                            }}
                            onMouseLeave={handlePopoverClose}
                          />

                          <Popover
                            id="mouse-over-popover2"
                            sx={{
                              pointerEvents: "none",
                            }}
                            open={openAction}
                            anchorEl={actionInfoEl2}
                            anchorOrigin={{
                              vertical: "top",
                              horizontal: "center",
                            }}
                            transformOrigin={{
                              vertical: "bottom",
                              horizontal: "left",
                            }}
                            PaperProps={{
                              elevation: 1, // This will remove the shadow
                              style: {
                                boxShadow: "0px 10px 10px rgba(0, 0, 0, 0.1)",
                              },
                            }}
                            onClose={handlePopoverClose}
                            disableRestoreFocus
                          >
                            <div className="p-2">
                              <div className="flex flex-row items-center gap-1">
                                <Image
                                  src={"/svgIcons/infoIcon.svg"}
                                  height={24}
                                  width={24}
                                  alt="*"
                                />
                                <p style={{ fontWeight: "500", fontSize: 12 }}>
                                  {showSampleTip
                                    ? "What are possible answers leads will give to this question?"
                                    : "Notify a team member when leads move here."}
                                </p>
                              </div>
                            </div>
                          </Popover>
                        </div>

                        <div className="mt-2">
                          <FormControl fullWidth>
                            <Select
                              id="demo-simple-select"
                              value={assignToMember || ""} // Default to empty string when no value is selected
                              onChange={handleAssignTeamMember}
                              displayEmpty // Enables placeholder
                              renderValue={(selected) => {
                                if (!selected) {
                                  return (
                                    <div style={{ color: "#aaa" }}>
                                      Select team member
                                    </div>
                                  ); // Placeholder style
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
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
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
                                  },
                                },
                              }}
                            >
                              {/* <MenuItem value={myTeamAdmin.name}>
                                <div className="w-full flex flex-row items-center gap-2">
                                  <div>{myTeamAdmin.name}</div>
                                  <div className="bg-purple text-white text-sm px-2 rounded-full">
                                    Admin
                                  </div>
                                </div>
                              </MenuItem> */}
                              <MenuItem value="">
                                <em>Delete</em>
                              </MenuItem>
                              {myTeamList.map((item, index) => {
                                return (
                                  <MenuItem
                                    className="flex flex-row items-center gap-2"
                                    key={index}
                                    value={item?.invitedUser?.name}
                                  >
                                    {/* <Image
                                      src={item.invitedUser.full_profile_image || "/agentXOrb.gif"}
                                      width={35}
                                      height={35}
                                      alt="*"
                                    /> */}
                                    {getAgentsListImage(
                                      item?.invitedUser,
                                      42,
                                      42
                                    )}
                                    {item.invitedUser?.name}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </FormControl>
                        </div>

                        <p
                          className="mt-2"
                          style={{ fontWeight: "500", fontSize: 15 }}
                        >
                          Tags
                        </p>

                        <div className="mt-4">
                          <TagsInput setTags={setTagsValue} />
                        </div>
                      </div>
                    )}
                  </div>

                  {addStageLoader ? (
                    <div className="flex flex-row iems-center justify-center w-full mt-4">
                      <CircularProgress size={25} />
                    </div>
                  ) : (
                    <div className="w-full">
                      {
                        //inputs.filter(input => input.value.trim() !== "").length === 3 &&
                        canProceed() ? (
                          <button
                            className="mt-4 outline-none"
                            style={{
                              backgroundColor: "#7902DF",
                              color: "white",
                              height: "50px",
                              borderRadius: "10px",
                              width: "100%",
                              fontWeight: 600,
                              fontSize: "20",
                            }}
                            onClick={handleAddNewStageTitle}
                          >
                            Add Stage
                          </button>
                        ) : (
                          <button
                            className="mt-4 outline-none"
                            disabled={true}
                            style={{
                              backgroundColor: "#00000020",
                              color: "black",
                              height: "50px",
                              borderRadius: "10px",
                              width: "100%",
                              fontWeight: 600,
                              fontSize: "20",
                            }}
                          // onClick={handleAddNewStageTitle}
                          >
                            Add Stage
                          </button>
                        )
                      }
                    </div>
                  )}
                </div>
              </Box>
            </Modal>

            {/* Upgrade Plan Modal */}
            <Elements stripe={stripePromise}>
              <UpgradePlan
                open={showUpgradeModal}
                handleClose={() => setShowUpgradeModal(false)}
                plan={selectedPlan}
                currentFullPlan={null}
              />
            </Elements>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default PipelineStages;
