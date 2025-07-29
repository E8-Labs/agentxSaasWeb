"use client";
import {
  Alert,
  Box,
  CircularProgress,
  Fade,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Popover,
  Select,
  Snackbar,
  TextareaAutosize,
  Typography,
  Menu,
} from "@mui/material";
import {
  CaretDown,
  CaretUp,
  DotsThree,
  EnvelopeSimple,
  Plus,
  X,
} from "@phosphor-icons/react";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Apis from "../apis/Apis";
import axios from "axios";
//pagination
import InfiniteScroll from "react-infinite-scroll-component";
import ColorPicker from "./ColorPicker";
import RearrangeStages from "../pipeline/RearrangeStages";
// import Tags from '../dashboard/leads/TagsInput';
import TagInput from "../test/TagInput";
import TagsInput from "../dashboard/leads/TagsInput";

import Tags from "@yaireo/tagify/dist/react.tagify";
import "@yaireo/tagify/dist/tagify.css";
import parsePhoneNumberFromString from "libphonenumber-js";
import moment from "moment";
import LeadDetails from "../dashboard/leads/extras/LeadDetails";
import NotficationsDrawer from "../notofications/NotficationsDrawer";
import CallWorthyReviewsPopup from "../dashboard/leads/CallWorthyReviewsPopup";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "../dashboard/leads/AgentSelectSnackMessage";
import LeadTeamsAssignedList from "../dashboard/leads/LeadTeamsAssignedList";
import { getTeamsList } from "../onboarding/services/apisServices/ApiService";
import { PersistanceKeys } from "@/constants/Constants";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GetFormattedDateString,
  GetFormattedTimeString,
} from "@/utilities/utility";
import { getAgentsListImage } from "@/utilities/agentUtilities";
import PipelineLoading from "./PipelineLoading";
import { AuthToken } from "../agency/plan/AuthDetails";
import DashboardSlider from "../animations/DashboardSlider";
import ConfigurePopup from "./ConfigurePopup";

const Pipeline1 = () => {
  const bottomRef = useRef();
  const colorPickerRef = useRef();
  let searchParams = useSearchParams();
  const router = useRouter();

  //value storing of search bar
  const [searchValue, setSearchValue] = useState("");

  //code for showing the reorder stages btn
  const [showReorderBtn, setShowReorderBtn] = useState(false);

  //variale for floating view
  const [expandSideView, setExpandSideView] = useState(false);
  const [openCallWorthyPopup, setOpenCallWorthyPopup] = useState(false);

  const [pipelinePopoverAnchorel, setPipelinePopoverAnchorel] = useState(null);
  const open = Boolean(pipelinePopoverAnchorel);
  const id = pipelinePopoverAnchorel ? "simple-popover" : undefined;

  const [otherPipelinePopoverAnchorel, setOtherPipelinePopoverAnchorel] =
    useState(null);
  const openOtherPipelines = Boolean(otherPipelinePopoverAnchorel);
  const OtherPipelineId = otherPipelinePopoverAnchorel
    ? "simple-popover"
    : undefined;

  const [StageAnchorel, setStageAnchorel] = useState(null);
  const openStage = Boolean(StageAnchorel);
  const stageId = StageAnchorel ? "stageAnchor" : undefined;

  const [initialLoader, setInitialLoader] = useState(true);
  const [pipelineDetailLoader, setPipelineDetailLoader] = useState(false);

  const [SelectedPipeline, setSelectedPipeline] = useState(null);
  let selectedPipelineIndex = useRef(-1);
  const [PipeLines, setPipeLines] = useState([]);
  const [StagesList, setStagesList] = useState([]);
  const [leadsCountInStage, setLeadsCountInStage] = useState(null);
  const [reservedLeadsCountInStage, setReservedLeadsCountInStage] = useState(null);
  const [oldStages, setOldStages] = useState([]);
  const [LeadsList, setLeadsList] = useState([]);
  //for search
  const [reservedLeads, setReservedLeads] = useState([]);
  //search timer
  const searchTimeout = useRef(null);
  //pagination
  // const [hasMore, setHasMore] = useState(true);
  const [hasMoreMap, setHasMoreMap] = useState({});
  const [moreLeadsLoader, setMoreLeadsLoader] = useState(false);
  //code to add new stage
  const [addNewStageModal, setAddNewStageModal] = useState(false);
  const [newStageTitle, setNewStageTitle] = useState("");
  const [stageColor, setStageColor] = useState("#000000");
  const [addStageLoader, setAddStageLoader] = useState(false);
  const [isEditingStage, setIsEditingStage] = useState(false);
  //code for advance setting modal inside new stages
  const [showAdvanceSettings, setShowAdvanceSettings] = useState(false);
  //code for input arrays
  const [inputs, setInputs] = useState([
    {
      id: 1,
      value: "",
      placeholder: `Sure, i'd be interested in knowing what my home is worth`,
    },
    { id: 2, value: "", placeholder: "Yeah, how much is my home worth today?" },
    { id: 3, value: "", placeholder: "Yeah, how much is my home worth today?" },
  ]);
  const [action, setAction] = useState("");

  //code for popover
  const [actionInfoEl, setActionInfoEl] = React.useState(null);
  const [assigntoActionInfoEl, setAssigntoActionInfoEl] = React.useState(null);
  const openaction = Boolean(actionInfoEl);
  const openAssigneAction = Boolean(assigntoActionInfoEl);

  //test code
  const [showSampleTip, setShowSampleTip] = useState(false);

  //code for adding new pipeline
  const [createPipeline, setCreatePipeline] = useState(false);
  const [newPipelineTitle, setNewPipelineTitle] = useState("");
  const [newPipelineStage, setNewPipelineStage] = useState(null);
  const [addPipelineLoader, setAddPipelineLoader] = useState(false);

  //code for filter modal popup
  const [showFilterModal, setShowFilterModal] = useState(false);

  const handlePopoverOpen = (event) => {
    setActionInfoEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setActionInfoEl(null);
    setAssigntoActionInfoEl(null);
  };
  //dele stage loader

  const [showDelBtn, setShowDelBtn] = useState(false);

  const [selectedStage, setSelectedStage] = useState(null);
  const [delStageLoader, setDelStageLoader] = useState(false);
  const [delStageLoader2, setDelStageLoader2] = useState(false);
  const [showDelStageModal, setShowDelStageModal] = useState(false);
  const [SuccessSnack, setSuccessSnack] = useState(null);
  const [snackMessage, setSnackMessage] = useState(null);
  //code for dropdown stages when delstage
  const [assignNextStage, setAssignNextStage] = useState("");
  const [assignNextStageId, setAssignNextStageId] = useState("");

  //get my teams list
  const [myTeamList, setMyTeamList] = useState([]);
  const [myTeamAdmin, setMyTeamAdmin] = useState(null);
  const [assignToMember, setAssignToMember] = useState("");
  const [assignLeadToMember, setAssignLeadToMember] = useState([]);

  const [showDeletePipelinePopup, setShowDeletePiplinePopup] = useState(false);

  //nedd help popup
  const [needHelp, setNeedHelp] = useState(false);

  const handleChangeNextStage = (event) => {
    let value = event.target.value;
    //// //console.log;
    setAssignNextStage(event.target.value);

    const selectedItem = StagesList.find((item) => item.stageTitle === value);
    setAssignNextStageId(selectedItem.id);

    // //console.log;
  };

  //new teammeber
  // const handleAssignTeamMember = (event) => {
  //   let value = event.target.value;
  //   //// //console.log;
  //   setAssignToMember(event.target.value);

  //   const selectedItem = myTeamList.find(
  //     (item) => item.invitedUser.name === value
  //   );
  //  // //console.log;
  //   setAssignToMember(
  //     selectedItem.invitedUser.name || myTeamAdmin.invitedUser.name
  //   ); //
  //   setAssignLeadToMember([
  //     ...assignLeadToMember,
  //     selectedItem.invitedUser.id || myTeamAdmin.invitedUser.id,
  //   ]); //

  //  // //console.log;
  // };

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

  //renaame the stage
  const [showRenamePopup, setShowRenamePopup] = useState(false);
  const [renameStage, setRenameStage] = useState("");
  const [renameStageLoader, setRenameStageLoader] = useState(false);
  //update the stage color
  const [updateStageColor, setUpdateStageColor] = useState("");
  const [stageColorUpdate, setStageColorUpdate] = useState(null);
  //configure popup
  const [showConfigureBtn, setShowConfigureBtn] = useState(false);
  const [showConfigurePopup, setShowConfigurePopup] = useState(false);
  const [configureLoader, setConfigureLoader] = useState(false);

  //code for rename pipeline
  const [showRenamePipelinePopup, setShowRenamePipelinePopup] = useState(false);
  const [renamePipeline, setRenamePipeline] = useState("");
  const [renamePipelineLoader, setRenamePipelineLoader] = useState(false);
  const [deletePipelineLoader, setDeletePipelineLoader] = useState(false);

  //code for rearranging stages
  const [showStagesPopup, setShowStagesPopup] = useState(false);
  const [nextStage, setNextStage] = useState({});
  const [selectedNextStage, setSelectedNextStage] = useState({});

  //code for storing tags value
  const [tagsValue, setTagsValue] = useState([]);

  //reorder stages loader
  const [reorderStageLoader, setReorderStageLoader] = useState(false);

  //variabl for deltag
  const [DelTagLoader, setDelTagLoader] = useState(null);

  //code for the lead details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLeadsDetails, setSelectedLeadsDetails] = useState(null);
  const [pipelineId, setPipelineId] = useState("");

  //code for buttons of details popup
  const [showKYCDetails, setShowKycDetails] = useState(true);
  const [showNotesDetails, setShowNotesDetails] = useState(false);
  const [showAcitivityDetails, setShowAcitivityDetails] = useState(false);

  //code for add stage notes
  const [showAddNotes, setShowAddNotes] = useState(false);
  const [addNotesValue, setddNotesValue] = useState("");
  const [noteDetails, setNoteDetails] = useState([]);
  const [addLeadNoteLoader, setAddLeadNoteLoader] = useState(false);

  //code for audio play popup
  const [showAudioPlay, setShowAudioPlay] = useState(null);
  const [showNoAudioPlay, setShowNoAudioPlay] = useState(false);

  //code for lead columns
  const [leadColumns, setLeadColumns] = useState([]);

  //code for call activity transcript text
  const [isExpanded, setIsExpanded] = useState([]);
  const [isExpandedActivity, setIsExpandedActivity] = useState([]);

  //variable to show and hide the add stage btn
  const [showAddStageBtn, setShowAddStageBtn] = useState(false);

  //variables for getting woorthy call logs
  const [importantCalls, setImportantCalls] = useState([]);
  const [selectedCall, setSelectedCall] = useState("");

  useEffect(() => {
    getImportantCalls();
    getMyTeam();
    const pipelineIndex = searchParams.get("pipeline"); // Get the value of 'tab'
    let number = Number(pipelineIndex) || 0;
    //console.log;
    selectedPipelineIndex = number;
    if (!pipelineIndex) {
      setParamsInSearchBar(number);
    }
  }, []);

  //wherever a pipeline is selected, it fetches the details
  useEffect(() => {
    const fetchPipelineDetails = async () => {
      if (SelectedPipeline && !SelectedPipeline?.leads) {
        await getPipelineDetails(SelectedPipeline);
      } else {
        // console.log(
        //   `Pipeline ${SelectedPipeline?.id} already has leads ${SelectedPipeline?.leads?.length}`
        // );
      }
    };

    fetchPipelineDetails();
  }, [SelectedPipeline]);

  const setParamsInSearchBar = (index = 0, from = "default") => {
    //console.log;
    //console.log;
    // Create a new URLSearchParams object to modify
    const params = new URLSearchParams(searchParams.toString());
    params.set("pipeline", index); // Set or update the 'tab' parameter

    // Push the updated URL
    router.push(`/dashboard/pipeline?${params.toString()}`);

    // //console.log;
  };

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

        // //console.log;

        setMyTeamList(teams);
        setMyTeamAdmin(response.admin);
      }
    } catch (error) {
      // console.error("Error occured in api is", error);
    }
  };

  useEffect(() => {
    // //console.log;
  }, [selectedLeadsDetails]);
  const getImportantCalls = async () => {
    try {
      const data = localStorage.getItem("User");
      if (data) {
        const u = JSON.parse(data);
        let path = Apis.getImportantCalls;
        //console.log;
        // //console.log;
        const response = await axios.get(path, {
          headers: {
            Authorization: `Bearer ${u.token}`,
          },
        });

        if (response) {
          if (response.data.status === true) {
            // console.log(
            //   "response of get imporatant calls api is",
            //   response.data.data
            // );
            setImportantCalls(response.data.data);
            setSelectedCall(response.data.data[0]);
          } else {
            // console.log(
            //   "message of get important calls api is",
            //   response.data.message
            // );
          }
        }
      }
    } catch (e) {
      //console.log;
    }
  };

  //code for showing the add stage button according to dirredent conditions
  // useEffect(() => {

  //     if (showAdvanceSettings) {
  //         if (!newStageTitle || !action || inputs.filter(input => input.value.trim() !== "").length < 3) {
  //            // //console.log
  //             setShowAddStageBtn(false);
  //         }
  //         else if (newStageTitle && action && inputs.filter(input => input.value.trim() !== "").length === 3) {
  //            // //console.log
  //             setShowAddStageBtn(true);
  //         }
  //     }
  //     else if (!showAdvanceSettings) {
  //         // if (newStageTitle) {
  //         if (newStageTitle) {
  //             setShowAddStageBtn(true);
  //         } else if (!newStageTitle) {
  //             setShowAddStageBtn(false);
  //         }
  //         // }
  //     }

  // }, [showAdvanceSettings, newStageTitle, inputs, action])

  function canProceed() {
    if (newStageTitle.length > 0 && action.length == 0) {
      return true;
    }
    if (
      action &&
      action.length > 0 &&
      newStageTitle &&
      newStageTitle.length > 0 &&
      inputs.filter((input) => input.value && input.value.trim() !== "").length === 3
    ) {
      return true;
    }
    return false;
  }

  useEffect(() => {
    getPipelines();
  }, []);

  useEffect(() => {
    // //console.log;
    const timer = setTimeout(() => {
      //// //console.log;
      if (stageColorUpdate) {
        handleUpdateColor();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [stageColorUpdate]);

  // useEffect(() => {
  //     // handleReorder()
  //     let previousStages = oldStages.map((item) => item.id);
  //     let updatedStages = StagesList.map((item) => item.id);

  //    // //console.log;
  //    // //console.log;

  //     // Compare arrays
  //     const areArraysEqual = previousStages.length === updatedStages.length &&
  //         previousStages.every((item, index) => item === updatedStages[index]);

  //     if (areArraysEqual) {
  //        // //console.log;
  //     } else {
  //        // //console.log;
  //         handleReorder();
  //     }
  // }, [StagesList]);

  //code to auto scroll to end

  useEffect(() => {
    const timer = setTimeout(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [StagesList]);

  //function to call create pipeline api
  const handleCreatePipeline = async () => {
    try {
      setAddPipelineLoader(true);
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
        // //console.log;
      }

      // //console.log;

      const formData = new FormData();
      formData.append("title", newPipelineTitle);

      for (let [key, value] of formData.entries()) {
        // //console.log;
      }

      const ApiPath = Apis.createPipeLine;
      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          // "Content-Type": "application/josn"
        },
      });

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          let updatedPipelinesList = [];
          setPipeLines([...PipeLines, response.data.data]);
          updatedPipelinesList = [...PipeLines, response.data.data];
          let reversePipelinesList = updatedPipelinesList.reverse();
          // setSelectedPipeline(reversePipelinesList[0]);
          // setStagesList(reversePipelinesList[0].stages);

          // getPipelineDetails(reversePipelinesList[0]);
          setLeadsCountInStage(response.data.data.leadsCountInStage);
          setReservedLeadsCountInStage(response.data.data.leadsCountInStage);
          setSelectedPipeline(reversePipelinesList[0]);
          setStagesList(reversePipelinesList[0]?.stages);
          setLeadsList(reversePipelinesList[0]?.leads || []);
          setNewPipelineTitle("");
          setNewPipelineStage(null);
          setSuccessSnack(response.data.message);
          setCreatePipeline(false);
          handlePipelineClosePopover();

          selectedPipelineIndex = PipeLines.length;
          setParamsInSearchBar(selectedPipelineIndex, "handlecreatePipeline");
        }
      }
    } catch (error) {
      // console.error("Error occured in api  create is:", error);
    } finally {
      setAddPipelineLoader(false);
    }
  };

  //code for get pipeline
  function GetPipelinesCached() {
    let dataFound = false;
    let data = localStorage.getItem(PersistanceKeys.LocalStoragePipelines);
    if (data) {
      let jsonData = JSON.parse(data);
      //console.log;
      setPipeLines(jsonData);
      if (jsonData.length > 0) {
        let index = 0;
        if (selectedPipelineIndex < jsonData.length) {
          index = selectedPipelineIndex;
        } else if (jsonData > 0) {
          index = 0;
        } else {
          index = -1;
        }

        // //console.log;

        if (index != -1) {
          setPipeLines(jsonData);
          setSelectedPipeline(jsonData[index]);
          setStagesList(jsonData[index].stages);
          setOldStages(jsonData[index].stages);
          setLeadsList(jsonData[index].leads);
          // //console.log;
        }
        // setSelectedPipeline(jsonData[selectedPipelineIndex]);
        // setStagesList(jsonData[selectedPipelineIndex].stages);
        // setOldStages(jsonData[selectedPipelineIndex].stages);
        // setLeadsList(jsonData[selectedPipelineIndex].leads);
      }
      dataFound = true;
    }
    return dataFound;
  }

  async function getPipelineDetails(pipeline) {
    //console.log;
    // console.log(
    //   "Pipeline index from getpipelinedetails is ",
    //   selectedPipelineIndex
    // );
    try {
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
        // //console.log;
      }

      // //console.log;
      const ApiPath = Apis.getPipelineById + "?pipelineId=" + pipeline.id;
      //console.log;
      setPipelineDetailLoader(true);
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      setPipelineDetailLoader(false);
      if (response) {
        console.log(
          "Response of getpipeline details api is :",
          response.data.data
        );
        const pipelineDetails = response.data.data;

        //  Merge updated details with existing pipelines list
        let updatedPipelines = PipeLines?.map((p) =>
          p.id === pipeline.id ? { ...p, ...pipelineDetails } : p
        );
        //console.log;
        //console.log;
        setPipeLines(updatedPipelines);
        if (
          selectedPipelineIndex.current == -1 ||
          pipeline.id == PipeLines[selectedPipelineIndex].id
        ) {
          // console.log(
          //   "Current selected is same ",
          //   PipeLines[selectedPipelineIndex].id
          // );
          //in admin side i was unable to find this function now if getting error related to leadscount in stage in admin and agency side then first find getpipeline details
          setLeadsCountInStage(pipelineDetails.leadsCountInStage);
          setReservedLeadsCountInStage(pipelineDetails.leadsCountInStage);
          setSelectedPipeline(pipelineDetails);
          setStagesList(pipelineDetails.stages);
          setLeadsList(pipelineDetails.leads);
          setReservedLeads(pipelineDetails.leads);
        } else {
          //console.log;
        }
        // Save updated pipelines list to localStorage
        localStorage.setItem(
          PersistanceKeys.LocalStoragePipelines,
          JSON.stringify(updatedPipelines)
        );

        localStorage.setItem("pipelinesList", JSON.stringify(updatedPipelines));
      }
    } catch (error) {
      // console.error("Error occured in api is:", error);
    } finally {
      // //console.log;
      setInitialLoader(false);
    }
  }

  //code for get more Leads In Stage
  const getMoreLeadsInStage = async ({ stageId, offset = 0, search }) => {
    console.log("Search value is", search);
    try {
      // return;
      const Auth = AuthToken();
      let ApiPath = `${Apis.getLeadsInStage}?offset=${offset}&stageId=${stageId}`;
      if (search) {
        ApiPath = `${Apis.getLeadsInStage}?stageId=${stageId}&search=${search}&offset=${offset}`;
      }
      console.log(`Api path is ${ApiPath}`);
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + Auth,
          "Content-Type": "application/json",
        },
      });
      if (response) {
        let newLeads = response?.data?.data || [];
        // if (newLeads.length > 11) {
        //   setHasMore(true);
        // } else {
        //   setHasMore(false);
        // }

        setHasMoreMap((prev) => {
          const updated = {
            ...prev,
            [stageId]: newLeads.length >= 7,
          };
          console.log("Updated hasMoreMap:", updated); // ← ✅ Console log here
          return updated;
        });

        console.log("New leads list is", newLeads);

        if (offset === 0) {
          console.log("Set leads for search value", response.data.data);
          setLeadsList(newLeads);
          setLeadsCountInStage(response.data.leadsCountInStage);
          // setReservedLeadsCountInStage(response.data.leadsCountInStage)
        } else {
          setLeadsList([...LeadsList, ...newLeads]);
        }
      }
    } catch (error) {
      console.log("Error occured in api is", error);
    }
  };

  //code for get pipeline
  const getPipelines = async () => {
    try {
      let data = false; //GetPipelinesCached();
      //console.log;
      if (!data) {
        setInitialLoader(true);
      }

      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
        // //console.log;
      }

      // //console.log;
      const ApiPath = Apis.getPipelines + "?liteResource=true";
      //console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });
      if (response) {
        setInitialLoader(false);
        console.log("Initial response", response.data.data);

        localStorage.setItem(
          PersistanceKeys.LocalStoragePipelines,
          JSON.stringify(response.data.data)
        );
        localStorage.setItem(
          "pipelinesList",
          JSON.stringify(response.data.data)
        );
        const pipelinesList = response.data.data;
        setPipeLines(pipelinesList);

        if (pipelinesList.length > 0) {
          // console.log(
          //   "Pipeline index from getpipelines is ",
          //   selectedPipelineIndex
          // );
          let pipeline = pipelinesList[selectedPipelineIndex]; // Select first pipeline
          setSelectedPipeline(pipeline);
          // getPipelineDetails(pipeline); // Fetch details for the selected pipeline
        }

        // let index = selectedPipelineIndex;
        // if (selectedPipelineIndex < response.data.data.length) {
        //   index = selectedPipelineIndex;
        // } else if (response.data.data.length > 0) {
        //   index = 0;
        // } else {
        //   index = -1;
        // }

        // if (index != -1) {
        //   setPipeLines(response.data.data);
        //   let pipeline = response.data.data[index]
        //   setSelectedPipeline(pipeline);
        //   getPipelineDetails(pipeline)

        //   // //console.log;
        // }
      }
    } catch (error) {
      // console.error("Error occured in api is:", error);
    } finally {
      // //console.log;
      // setInitialLoader(false);
    }
  };

  //code to delete the tag value
  //code for del tag api
  const handleDelTag = async (tag, lead) => {
    try {
      setDelTagLoader(lead.lead.id);

      // //console.log;

      let AuthToken = null;

      const userData = localStorage.getItem("User");
      if (userData) {
        const localData = JSON.parse(userData);
        AuthToken = localData.token;
      }

      // //console.log;

      const ApiData = {
        leadId: lead.lead.id,
        tag: tag,
      };

      const ApiPath = Apis.delLeadTag;
      // //console.log;
      // //console.log;
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
          // //console.log;
          // const updatedTags = LeadsList.lead.tags.filter(
          //   (item) => item !== tag
          // );
          // setLeadsList((prevDetails) => ({
          //   ...prevDetails,
          //   tags: updatedTags,
          // }));
        }
      }
    } catch (error) {
      // console.error("Error occured in api is:", error);
    } finally {
      setDelTagLoader(null);
    }
  };

  //code for poovers

  const handleShowPipelinePopover = (event) => {
    setPipelinePopoverAnchorel(event.currentTarget);
  };

  const handlePipelineClosePopover = () => {
    setPipelinePopoverAnchorel(null);
  };

  const handleShowStagePopover = (event, stage) => {
    setStageAnchorel(event.currentTarget);
    setSelectedStage(stage);
    setStageColorUpdate(stage.defaultColor);
  };

  const handleCloseStagePopover = () => {
    setStageAnchorel(null);
  };

  const handleShowOtherPipeline = (event) => {
    setOtherPipelinePopoverAnchorel(event.currentTarget);
  };

  const handleCloseOtherPipeline = () => {
    setOtherPipelinePopoverAnchorel(null);
  };

  //code to seect other pipeline
  const handleSelectOtherPipeline = (item, index) => {
    // getPipelineDetails(item);
    setSelectedPipeline(item);

    // setSelectedPipeline(item);
    // setSelectedPipeline(item);
    setStagesList(item.stages);
    setLeadsCountInStage(item.leadsCountInStage);
    setReservedLeadsCountInStage(item.leadsCountInStage);
    setLeadsList(item?.leads || []);
    handleCloseOtherPipeline();
    selectedPipelineIndex = index;
    //console.log;
    setParamsInSearchBar(index, "handleSelectOtherPipeline");
  };

  //code for adding new custom stage
  const handleAddCustomStage = async () => {
    try {
      setAddStageLoader(true);
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
        // //console.log;
      }

      let mainAgent = null;

      const mainAgentData = localStorage.getItem("agentDetails");
      // //console.log;

      if (mainAgentData) {
        const mainAgentDetails = JSON.parse(mainAgentData);
        // //console.log;
        // //console.log;
        mainAgent = mainAgentDetails;
      }

      // return

      // //console.log;

      const ApiPath = Apis.addCustomStage;
      // //console.log;

      const ApiData = {
        stageTitle: newStageTitle,
        color: stageColor,
        pipelineId: SelectedPipeline.id,
        action: action,
        examples: inputs,
        // mainAgentId: mainAgent.id,
        tags: tagsValue,
        teams: assignLeadToMember,
      };
      console.log("add stgae api data is", ApiData);

      // return

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        console.log("Response of add stage api is", response.data);
        if (response.data.status === true) {
          setLeadsCountInStage(response.data.data.leadsCountInStage);
          setReservedLeadsCountInStage(response.data.data.leadsCountInStage);
          setStagesList(response.data.data.stages);
          handleCloseAddStage();
          setPipelinePopoverAnchorel(null);
          setSelectedPipeline((prevData) => ({
            ...prevData, // Spread the previous state
            stages: response.data.data.stages, // Update or add the `stages` property
          }));

          const newPipeline = response.data.data;

          setPipeLines((prevData) =>
            prevData.map((item) =>
              item.id === SelectedPipeline.id
                ? { ...item, ...newPipeline } // Update the matching item with the new pipeline data
                : item
            )
          );

          // setPipeLines([...PipeLines, newPipeline]);
        } else if (response.data.status == false) {
          let message = response.data.message;
          setSnackMessage({ message: message, type: SnackbarTypes.Error });
        }
      }
    } catch (error) {
      console.error("Error occured inn adding new stage title api is", error);
    } finally {
      setAddStageLoader(false);
    }
  };

  //code for updating existing custom stage
  const handleUpdateCustomStage = async () => {
    try {
      setAddStageLoader(true);
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      const ApiPath = Apis.UpdateStage;
      const formData = new FormData();

      formData.append("stageId", selectedStage.id);
      formData.append("stageTitle", newStageTitle);
      formData.append("color", stageColor);
      formData.append("action", action);

      // Add examples array
      inputs.forEach((input, index) => {
        if (input.value && input.value.trim() !== "") {
          formData.append(`examples[${index}]`, input.value);
        }
      });

      console.log("Update stage API data:");
      for (let [key, value] of formData) {
        console.log(`${key} = ${value}`);
      }

      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response) {
        console.log("Response of update stage api is", response.data);
        if (response.data.status === true) {
          setStagesList(response.data.data.stages);
          handleCloseAddStage();
          setSnackMessage({ message: response.data.message || "Stage updated successfully", type: SnackbarTypes.Success });

          // Update selected pipeline stages
          setSelectedPipeline((prevData) => ({
            ...prevData,
            stages: response.data.data.stages,
          }));

          // Update pipelines list
          setPipeLines((prevData) =>
            prevData.map((item) =>
              item.id === SelectedPipeline.id
                ? { ...item, stages: response.data.data.stages }
                : item
            )
          );
        } else if (response.data.status == false) {
          let message = response.data.message;
          setSnackMessage({ message: message, type: SnackbarTypes.Error });
        }
      }
    } catch (error) {
      console.error("Error occurred in updating stage api:", error);
      setSnackMessage({ message: "Failed to update stage", type: SnackbarTypes.Error });
    } finally {
      setAddStageLoader(false);
    }
  };

  useEffect(() => {
    let data = localStorage.getItem("pipelinesList");

    if (data) {
      let d = JSON.parse(data);

      //console.log;
    }
  }, []);

  //code ford deleting the stage
  const handleDeleteStage = async (value) => {
    try {
      if (value === "del2") {
        // //console.log;
        setDelStageLoader2(true);
      } else if (value === "del") {
        // //console.log;
        setDelStageLoader(true);
      }
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
        //// //console.log;
      }

      // //console.log;

      const ApiData = {
        pipelineId: SelectedPipeline.id,
        stageId: selectedStage.id,
        moveToStageId: assignNextStageId,
      };

      const formData = new FormData();
      formData.append("pipelineId", SelectedPipeline.id);
      formData.append("stageId", selectedStage.id);
      if (assignNextStageId) {
        formData.append("moveToStage", assignNextStageId);
      }

      for (let [key, value] of formData) {
        // //console.log;
      }

      // return
      const ApiPath = Apis.deleteStage;
      // //console.log;

      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        //console.log;
        if (response.data.status === true) {
          setStagesList(response.data.data.stages);
          setSuccessSnack(response.data.message);
          setStageAnchorel(null);
          setShowDelStageModal(false);

          let p = localStorage.getItem("pipelinesList");

          if (p) {
            let localPipelines = JSON.parse(p);

            let updatedPipelines = localPipelines.map((pipeline) => {
              if (SelectedPipeline.id === pipeline.id) {
                return {
                  ...pipeline,
                  stages: pipeline.stages.filter(
                    (stage) => stage.id !== selectedStage.id
                  ),
                };
              }
              return pipeline; // Return unchanged pipeline for others
            });

            //console.log;
            localStorage.setItem(
              "pipelinesList",
              JSON.stringify(updatedPipelines)
            );
          } else {
            //console.log;
          }
        }
      }
    } catch (error) {
      console.error("Error occured in delstage api is:", error);
    } finally {
      setDelStageLoader(false);
      setDelStageLoader2(false);
    }
  };

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
        setStagesList(response.data.data.stages);
        setShowRenamePopup(false);
        handleCloseStagePopover();
      }
    } catch (error) {
      // //console.log;
    } finally {
      setRenameStageLoader(false);
    }
  };

  //code to rename the stage
  const handleRenamePipeline = async () => {
    try {
      setRenamePipelineLoader(true);
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      // //console.log;

      const ApiData = {
        title: renamePipeline,
        pipelineId: SelectedPipeline.id,
      };

      // //console.log;
      const ApiPath = Apis.updatePipeline;

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
        // setPipeLines()
        setPipeLines((prevPipelines) =>
          prevPipelines.map((pipeline) =>
            pipeline.id === SelectedPipeline.id
              ? { ...pipeline, ...response.data.data } // Merge updates into the matching object
              : pipeline
          )
        );
        setSelectedPipeline(response.data.data);
        setShowRenamePipelinePopup(false);
        handlePipelineClosePopover();
      }
    } catch (error) {
      // //console.log;
    } finally {
      setRenamePipelineLoader(false);
    }
  };

  //code to handle updaet color
  const handleUpdateColor = async () => {
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
      // formData.append("stageTitle", renameStage);
      formData.append("stageId", selectedStage?.id);
      formData.append("color", stageColorUpdate);

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
        setStagesList(response.data.data.stages);
        // setShowRenamePopup(false);
        // handleCloseStagePopover();
      }
    } catch (error) {
      // //console.log;
    } finally {
      setRenameStageLoader(false);
    }
  };

  //code to delete pipeline

  const handleDeletePipeline = async () => {
    try {
      setDeletePipelineLoader(true);
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      // //console.log;

      const formData = new FormData();
      formData.append("pipelineId", SelectedPipeline.id);

      for (let [key, value] of formData.entries()) {
        // //console.log;
      }

      //// //console.log;
      const ApiPath = Apis.deletePipeline;

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
        if (response.data.status === true) {
          let updatedPipelines = [];
          setPipeLines(
            PipeLines.filter((pipeline) => pipeline.id !== SelectedPipeline.id)
          );
          updatedPipelines = PipeLines.filter(
            (pipeline) => pipeline.id !== SelectedPipeline.id
          );

          localStorage.setItem(
            "pipelinesList",
            JSON.stringify(updatedPipelines)
          );

          // //console.log;
          setSelectedPipeline(updatedPipelines[0]);
          setStagesList(updatedPipelines[0].stages);
          setLeadsList(updatedPipelines[0].leads);
          // setSelectedPipeline(PipeLines)
          handlePipelineClosePopover();
          setShowDeletePiplinePopup(false);
        }
      }
    } catch (error) {
      // //console.log;
    } finally {
      setDeletePipelineLoader(false);
    }
  };

  //code for arrayinput fields of settings modal
  const handleInputChange = (id, value) => {
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

  //code to add new sheet list
  const handleAddSheetNewList = async () => {
    try {
      setShowaddCreateListLoader(true);

      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      // //console.log;

      const ApiData = {
        sheetName: newSheetName,
        columns: inputs.map((columns) => columns.value),
      };
      // //console.log;

      const ApiPath = Apis.addSmartList;
      // //console.log;

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        if (response.data.status) {
          setShowAddNewSheetModal(false);
        }
      }
    } catch (error) {
      // console.error("Error occured in adding new list api is:", error);
    } finally {
      setShowaddCreateListLoader(false);
    }
  };

  //codde for reorder stages
  const handleSelectNextChange = (index, event) => {
    const selectedValue = event.target.value;

    // Update the next stage for the specific index
    setNextStage((prev) => ({
      ...prev,
      [index]: selectedValue,
    }));

    // Find the selected item for the specific index
    const selectedItem = StagesList.find(
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
    //// //console.log;
    // return;
    try {
      setReorderStageLoader(true);
      const updateStages = StagesList.map((stage, index) => ({
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
        pipelineId: SelectedPipeline.id,
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
          setShowStagesPopup(false);
          setShowReorderBtn(false);
          handleCloseStagePopover();
          setSuccessSnack(response.data.message);
          setShowRenamePipelinePopup(null);
          handlePipelineClosePopover();
        }
      }
    } catch (error) {
      // console.error("Error occured in rearrange order api is:", error);
    } finally {
      // //console.log;
      setReorderStageLoader(false);
    }
  };

  //code to  close tha add new stage
  const handleCloseAddStage = () => {
    setAddNewStageModal(false);
    setNewStageTitle("");
    // setStageColor("");
    setInputs([
      {
        id: 1,
        value: "",
        placeholder: `Sure, i'd be interested in knowing what my home is worth`,
      },
      {
        id: 2,
        value: "",
        placeholder: "Yeah, how much is my home worth today?",
      },
      {
        id: 3,
        value: "",
        placeholder: "Yeah, how much is my home worth today?",
      },
    ]);
    setAction("");
    setStageColor("#000000");
    setShowAdvanceSettings(false);
    setAssignToMember("");
    setTagsValue([]);
    setIsEditingStage(false); // Reset editing state
  };

  //fucntion to read more transcript text
  const handleReadMoreToggle = (item) => {
    // setIsExpanded(!isExpanded);

    setIsExpanded((prevIds) => {
      if (prevIds.includes(item.id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== item.id);
      } else {
        // Select the item if it's not already selected
        return [...prevIds, item.id];
      }
    });
  };

  //function to format the number
  const formatPhoneNumber = (rawNumber) => {
    const phoneNumber = parsePhoneNumberFromString(
      rawNumber?.startsWith("+") ? rawNumber : `+${rawNumber}`
    );
    //// //console.log;
    return phoneNumber
      ? phoneNumber.formatInternational()
      : "Invalid phone number";
  };

  //fucntion to ShowMore ActivityData transcript text
  const handleShowMoreActivityData = (item) => {
    // setIsExpanded(!isExpanded);

    setIsExpandedActivity((prevIds) => {
      if (prevIds.includes(item.id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== item.id);
      } else {
        // Select the item if it's not already selected
        return [...prevIds, item.id];
      }
    });
  };

  //function to show the callStatus
  const checkCallStatus = (callActivity) => {
    let callStatus = null;
    let item = callActivity;
    // callActivity.forEach((item) => {
    if (item.status === "completed") {
      // Check for hotlead, humancalldrop, and dnd
      if (item.hotlead || item.humancalldrop || item.dnd) {
        // console.log(
        //   "Status is completed with the following additional information:"
        // );
        if (item.hotlead === true) {
          // //console.log;
          callStatus = "Hot Lead";
        }
        if (item.humancalldrop === true) {
          // //console.log;
          callStatus = "Human Call Drop";
        }
        if (item.dnd === true) {
          // //console.log;
          callStatus = "DND";
        }
        if (item.notinterested) {
          // //console.log;
          callStatus = "Not Interested";
        }
      } else {
        callStatus = item.status;
        // console.log(
        //   "Status is completed, but no special flags for lead ID:",
        //   item.leadId
        // );
      }
    } else {
      // console.log(
      //   "Other status for lead ID:",
      //   item.leadId,
      //   "Status:",
      //   item.status
      // );
      callStatus = item.status;
    }
    // });
    return callStatus;
  };

  //function to add lead notes
  const handleAddLeadNotes = async () => {
    try {
      setAddLeadNoteLoader(true);
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      // //console.log;

      const ApiData = {
        note: addNotesValue,
        leadId: selectedLeadsDetails.id,
      };

      // //console.log;

      const ApiPath = Apis.addLeadNote;
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        // setNoteDetails()
        if (response.data.status === true) {
          setShowAddNotes(false);
          setNoteDetails([...noteDetails, response.data.data]);
          setddNotesValue("");
        }
      }
    } catch (error) {
      // console.error("Error occured in add lead note api is:", error);
    } finally {
      setAddLeadNoteLoader(false);
    }
  };

  //If lead stage is updated manually
  function HandleUpdateStage(stage) {
    // setShowDetailsModal(false);

    let selLead = selectedLeadsDetails;
    selLead.stage = stage.id;
    let updatedLeads = [];
    LeadsList.map((lead) => {
      if (selLead.id == lead.id) {
        updatedLeads.push(selLead);
      } else {
        updatedLeads.push(lead);
      }
    });
    setLeadsList(updatedLeads);

    // //console.log;

    const updatedPipelines = PipeLines.map((pipeline) => {
      return {
        ...pipeline,
        leads: pipeline.leads.map((lead) => {
          // Check if the lead's ID matches the selected lead's ID
          if (lead.lead.id === selLead.id) {
            return {
              ...lead,
              lead: {
                ...lead.lead,
                ...selLead, // Update the lead with the selectedLead's data
              },
            };
          }
          return lead; // Return the lead unchanged if no match
        }),
      };
    });

    // //console.log;

    // //console.log;

    // let leadesList = [];

    setStagesList(SelectedPipeline.stages);

    setPipeLines(updatedPipelines);
  }

  function HandleLeadAssignedTeam(team, lead) {
    //code to add team members to the lead data
    // //console.log;
    // //console.log;
    // //console.log;

    const updatedLeadsList = LeadsList.map((item) =>
      item.leadId === lead.id
        ? {
          ...item,
          lead: {
            ...item.lead,
            teamsAssigned: [...item.lead.teamsAssigned, team],
          },
        }
        : item
    );

    // //console.log;

    setLeadsList(updatedLeadsList);
  }
  //function to delete leads
  const handleDelLead = async () => {
    try {
      const leadToDelete = selectedLeadsDetails;
      // Remove the lead from the list
      const filteredLeads = LeadsList?.filter((lead) => lead.lead.id !== leadToDelete.id);

      // Remove the lead from all pipelines, safely handling undefined leads
      const filteredPipelines = PipeLines.map((pipeline) => ({
        ...pipeline,
        leads: (pipeline.leads || []).filter((lead) => lead.lead.id !== leadToDelete.id),
      }));

      setPipeLines(filteredPipelines);
      setLeadsList(filteredLeads);
      setSelectedLeadsDetails(null); // Clear selected lead
      setShowDetailsModal(false);    // Hide modal
    } catch (error) {
      console.log('error in delete lead', error)
      // Handle error
    }
  };


  function handldSearch(e) {
    let search = e.target.value.toLowerCase();
    setSearchValue(search);
    let pipeline = SelectedPipeline;

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current); // Clear previous timer
    }

    searchTimeout.current = setTimeout(() => {
      if (search === "") {
        setLeadsList(reservedLeads);
        setLeadsCountInStage(reservedLeadsCountInStage)
      } else {
        getMoreLeadsInStage({
          stageId: pipeline?.stages[0].id,
          search: search
        });
      }
    }, 500); // Delay of 3000ms = 3 seconds
  }


  const styles = {
    heading: {
      fontWeight: "700",
      fontSize: 17,
    },
    paragraph: {
      fontWeight: "500",
      fontSize: 15,
    },
    agentName: {
      fontWeight: "600",
      fontSize: 12,
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
    heading: {
      fontWeight: "700",
      fontSize: 17,
    },
    paragraph: {
      fontWeight: "500",
      fontSize: 15,
    },
    subHeading: {
      fontWeight: "500",
      fontSize: 12,
      color: "#00000060",
    },
    heading2: {
      fontWeight: "500",
      fontSize: 15,
      color: "#00000080",
    },
  };

  return (
    <div className="w-full flex flex-col items-start h-screen">
      {initialLoader ? (
        <div className="w-screen">
          <PipelineLoading />
        </div>
      ) : (
        <>
          <AgentSelectSnackMessage
            type={SnackbarTypes.Success}
            isVisible={
              SuccessSnack == null || SuccessSnack == false ? false : true
            }
            hide={() => setSuccessSnack(false)}
            message={SuccessSnack}
          />

          <AgentSelectSnackMessage
            type={snackMessage?.type}
            isVisible={snackMessage != null}
            hide={() => setSnackMessage(null)}
            message={snackMessage?.message}
          />
          <div
            className="w-full flex flex-row justify-center"
            style={{ borderBottom: "1px solid #15151510" }}
          >
            <div className="w-full">
              <div className="flex flex-row items-center justify-between px-10 mt-4 mb-4">
                <div className="flex flex-row items-center gap-2">
                  <span style={{ fontWeight: "700", fontSize: 25 }}>
                    {SelectedPipeline?.title}
                  </span>
                  <div>
                    {PipeLines.length > 1 && !pipelineDetailLoader && (
                      <button
                        className="outline-none"
                        aria-describedby={OtherPipelineId}
                        variant="contained"
                        onClick={handleShowOtherPipeline}
                      >
                        <CaretDown size={22} weight="bold" />
                      </button>
                    )}
                    <Menu
                      id={OtherPipelineId}
                      anchorEl={otherPipelinePopoverAnchorel}
                      open={openOtherPipelines}
                      onClose={handleCloseOtherPipeline}
                      MenuListProps={{
                        "aria-labelledby": OtherPipelineId,
                      }}
                    >
                      {PipeLines.map((item, index) => (
                        <MenuItem
                          key={index}
                          onClick={() => {
                            handleSelectOtherPipeline(item, index);
                            handleCloseOtherPipeline(); // Close menu after selection
                          }}
                        >
                          {item.title}
                        </MenuItem>
                      ))}
                    </Menu>
                  </div>
                  <button
                    aria-describedby={id}
                    variant="contained"
                    onClick={handleShowPipelinePopover}
                    className="outline-none"
                  >
                    <DotsThree size={27} weight="bold" />
                  </button>
                  <Popover
                    id={id}
                    open={open}
                    anchorEl={pipelinePopoverAnchorel}
                    onClose={handlePipelineClosePopover}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                  // PaperProps={{
                  //     elevation: 0, // This will remove the shadow
                  //     style: {
                  //         boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.08)',
                  //     },
                  // }}
                  >
                    <div className="p-3">
                      <button
                        className="flex flex-row items-center gap-4"
                        onClick={() => {
                          setCreatePipeline(true);
                        }}
                      >
                        <Plus size={17} weight="bold" />{" "}
                        <span style={{ fontWeight: "500", fontSize: 15 }}>
                          New Pipeline
                        </span>
                      </button>
                      <div className="w-full flex flex-row mt-4">
                        <button
                          className="text-black flex flex-row items-center gap-4 me-2 outline-none"
                          style={styles.paragraph}
                          onClick={() => {
                            setShowRenamePipelinePopup(true);
                            setRenamePipeline(SelectedPipeline.title);
                            // //console.log;
                          }}
                        >
                          <Image
                            src={"/assets/editPen.png"}
                            height={15}
                            width={15}
                            alt="*"
                          />
                          Rename
                        </button>
                      </div>
                      <div className="w-full flex flex-row mt-4">
                        <button
                          className="text-black flex flex-row items-center gap-4 me-2 outline-none"
                          style={styles.paragraph}
                          onClick={() => {
                            setAddNewStageModal(true);
                          }}
                        >
                          <Image
                            src={"/svgIcons/arrowBlack.svg"}
                            height={18}
                            width={15}
                            alt="*"
                          />
                          Add Stage
                        </button>
                      </div>
                      <div className="w-full flex flex-row mt-4">
                        {/* {
                                                    delStageLoader ?
                                                        <CircularProgress size={20} /> :
                                                       
                                                } */}
                        <button
                          className="text-black flex flex-row items-center gap-4 me-2 outline-none"
                          style={styles.paragraph}
                          onClick={() => {
                            setShowStagesPopup(true);
                          }}
                        >
                          <Image
                            src={"/assets/list.png"}
                            height={18}
                            width={15}
                            alt="*"
                          />
                          Rearrange Stage
                        </button>
                      </div>

                      <button
                        className="text-red flex flex-row items-center gap-4 mt-4 me-2 outline-none"
                        style={styles.paragraph}
                        onClick={() => {
                          setShowDeletePiplinePopup(true);
                        }}
                      >
                        <Image
                          src={"/assets/delIcon.png"}
                          height={18}
                          width={18}
                          alt="*"
                        />
                        Delete
                      </button>
                    </div>
                  </Popover>
                </div>
                <div className="flex fex-row items-center gap-6">
                  <div
                    className="flex flex-row items-center justify-between w-[25vw] border h-[50px] px-4 gap-8"
                    style={{ borderRadius: "50px" }}
                  >
                    <input
                      style={{ MozOutline: "none" }}
                      value={searchValue}
                      onChange={handldSearch}
                      className="outline-none bg-transparent w-full mx-2 border-none focus:outline-none focus:ring-0"
                      placeholder="Search by name, phone or email"
                    />
                    <button className="outline-none">
                      <Image
                        src={"/assets/searchIcon.png"}
                        height={24}
                        width={24}
                        alt="*"
                      />
                    </button>
                  </div>
                  <div className="flex flex-col">
                    <NotficationsDrawer />
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      bottom: 0
                    }}>
                    <DashboardSlider
                      needHelp={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {pipelineDetailLoader ? (
            <PipelineLoading fullScreen={false} />
          ) : (
            <div className="flex flex-col items-center w-full">
              <div
                className="w-[95%] flex flex-col items-start overflow-x-auto  h-[85vh] mt-8
            scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
            "
              >
                <div className="flex flex-row items-center gap-4"></div>

                <div className="flex flex-row items-start gap-2">
                  <div className="flex flex-row items-start gap-4">
                    {StagesList?.map((stage, index) => (
                      <div
                        key={index}
                        style={{ width: "300px" }}
                        className="flex flex-col items-start h-full gap-8"
                      >
                        {/* Display the stage */}
                        <div className="flex flex-row items-center w-full justify-between">
                          <div
                            className="h-[36px] flex flex-row items-center justify-center gap-8 rounded-xl px-4"
                            style={{
                              ...styles.heading,
                              backgroundColor: stage.defaultColor,
                              color: "white",
                              // textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
                            }}
                          >
                            <span>
                              {stage.stageTitle.length > 15 ? (
                                <div className="flex flex-row items-center gap-1">
                                  {stage.stageTitle.slice(0, 15) + "..."}
                                </div>
                              ) : (
                                stage.stageTitle
                              )}
                            </span>
                            <div
                              className="rounded-full px-2 py-1 bg-white flex flex-row items-center justify-center text-black"
                              style={{ ...styles.paragraph, fontSize: 14 }}
                            >
                              {/* {leadCounts[stage.id] ? (
                            <div>{leadCounts[stage.id]}</div>
                          ) : (
                            "0"
                          )} */}

                              {
                                leadsCountInStage?.[stage.id] !== undefined
                                  ? leadsCountInStage[stage.id]
                                  : "0"
                              }


                              {/* {leadCounts.map((item) => {
   
                                                })} */}
                            </div>
                          </div>

                          <button
                            aria-describedby={stageId}
                            variant="contained"
                            onClick={(evetn) => {
                              if (stage.identifier === "new_lead" || stage.identifier === "booked") {
                                // //console.log;
                                setShowDelBtn(true);
                              } else {
                                setShowDelBtn(false);
                              }
                              if (stage.identifier.startsWith("custom_stage")) {
                                setShowConfigureBtn(true);
                              } else {
                                setShowConfigureBtn(false);
                              }
                              // //console.log;
                              handleShowStagePopover(evetn, stage);
                            }}
                            className="outline-none"
                          >
                            <DotsThree size={27} weight="bold" />
                          </button>
                        </div>
                        <Popover
                          id={stageId}
                          open={openStage}
                          anchorEl={StageAnchorel}
                          onClose={handleCloseStagePopover}
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
                              boxShadow: "0px 4px 5px rgba(0, 0, 0, 0.02), 0px 0px 4px rgba(0, 0, 0, 0.02)",
                              borderRadius: "12px",
                            },
                          }}
                        >
                          <div
                            className="w-36 px-4 py-3 bg-white rounded-[10px] inline-flex flex-col justify-start items-start gap-2"
                            // style={{ border: "4px solid black" }}
                          >
                            <div className="w-full flex flex-row">
                              <button
                                className=" text-black text-base font-medium flex flex-row items-center gap-4 outline-none"
                                // style={styles.paragraph}
                                onClick={() => {
                                  setShowRenamePopup(true);
                                  // //console.log;
                                  setRenameStage(selectedStage.stageTitle);
                                  setUpdateStageColor(
                                    selectedStage.defaultColor
                                  );
                                }} //handleRenameStage
                              >
                                <Image
                                  src={"/assets/editPen.png"}
                                  height={15}
                                  width={15}
                                  alt="*"
                                />
                                Rename
                              </button>
                            </div>
                            <div className="w-full flex flex-row mt-4">
                              {/* {
                                                        delStageLoader ?
                                                            <CircularProgress size={20} /> :
                                                           
                                                    } */}
                              <div
                                className="text-black flex flex-row items-center gap-4 outline-none"
                                style={styles.paragraph}
                              // onClick={handleDeleteStage}
                              >
                                <div
                                  style={{
                                    height: "15px",
                                    width: "15px",
                                    borderRadius: "50%",
                                    backgroundColor: stageColorUpdate,
                                    cursor: "pointer", // Pointer to indicate clickable
                                  }}
                                  onClick={() => colorPickerRef.current.click()} // Trigger ColorPicker
                                />
                                <button
                                  className="flex flex-row gap-2 outline-none"
                                  onClick={() => colorPickerRef.current.click()}
                                  style={styles.paragraph}
                                >
                                  Color
                                </button>
                                <div
                                  style={{
                                    opacity: 0,
                                    position: "absolute",
                                    pointerEvents: "auto", // Ensure interactions still work
                                  }}
                                >
                                  <ColorPicker
                                    ref={colorPickerRef}
                                    setStageColor2={setStageColorUpdate}
                                    setStageColor={setUpdateStageColor}
                                    onlyShowColorBox={true}
                                    updateOnchange={true}
                                    handleUpdateColor={handleUpdateColor}
                                    stageColor={stageColorUpdate}
                                  />
                                </div>
                              </div>
                            </div>
                            <div ref={bottomRef}></div>

                            {/* Code for configure */}
                            {
                              showConfigureBtn && (
                                <button
                                  className="border-none outline-none cursor-pointer flex flex-row items-center gap-4"
                                  onClick={() => {
                                    console.log("Configure button clicked for stage:", selectedStage);

                                    // Parse advancedConfig JSON string to get action and examples
                                    let parsedConfig = {};
                                    if (selectedStage.advancedConfig) {
                                      try {
                                        parsedConfig = JSON.parse(selectedStage.advancedConfig);
                                        console.log("Parsed advanced config:", parsedConfig);
                                      } catch (error) {
                                        console.error("Error parsing advancedConfig:", error);
                                      }
                                    }

                                    // Pre-populate the modal with selected stage data
                                    setNewStageTitle(selectedStage.stageTitle);
                                    setStageColor(selectedStage.defaultColor || "#000000");
                                    setAction(parsedConfig.action || "");

                                    // Pre-populate sample answers if they exist
                                    const stageExamples = parsedConfig.examples || [];
                                    console.log("Found examples:", stageExamples);

                                    if (stageExamples && stageExamples.length > 0) {
                                      const updatedInputs = inputs.map((input, index) => {
                                        const exampleValue = stageExamples[index];
                                        // Handle both object format {id, value} and string format
                                        const value = typeof exampleValue === 'object' && exampleValue?.value
                                          ? String(exampleValue.value)
                                          : String(exampleValue || "");

                                        return {
                                          ...input,
                                          value: value
                                        };
                                      });
                                      setInputs(updatedInputs);
                                    } else {
                                      // Clear inputs if no examples
                                      const clearedInputs = inputs.map((input) => ({
                                        ...input,
                                        value: ""
                                      }));
                                      setInputs(clearedInputs);
                                    }

                                    // Automatically show advanced settings when configuring
                                    setShowAdvanceSettings(true);
                                    setIsEditingStage(true);
                                    setAddNewStageModal(true);
                                    // Close the stage popover
                                    handleCloseStagePopover();
                                  }}
                                >
                                  <Image
                                    src={"/otherAssets/colorDrop.jpg"}
                                    height={18}
                                    width={18}
                                    alt="*"
                                  />
                                  <div className="text-base font-medium text-black">
                                    Configure
                                  </div>
                                </button>
                              )
                            }

                            {!showDelBtn && (
                              <div className="w-full flex flex-row mt-4">
                                <button
                                  className="text-red text-base font-medium flex flex-row items-center gap-4 outline-none"
                                  // style={styles.paragraph}
                                  onClick={() => {
                                    // console.log(
                                    //   "Selected stage is:",
                                    //   selectedStage
                                    // );
                                    // setSelectedStage(item);
                                    setShowDelStageModal(true);
                                  }}
                                >
                                  <Image
                                    src={"/assets/delIcon.png"}
                                    height={18}
                                    width={18}
                                    alt="*"
                                  />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </Popover>

                        {/* Display leads matching this stage */}
                        {LeadsList?.filter(
                          (lead) => lead.lead.stage === stage.id
                        ).length > 0 && (
                            <div
                              id={`scrollableDiv-${stage.id}`}
                              className="relative flex flex-col gap-4 mt-4 h-[75vh] overflow-y-auto rounded-xl"
                              style={{
                                scrollbarWidth: "none",
                                borderWidth: 1,
                                borderRadius: "12px",
                                borderStyle: "solid",
                                borderColor: "#00000010",
                              }}
                            >
                              <InfiniteScroll
                                className="mt-4"
                                endMessage={<p
                                  style={{
                                    textAlign: "center",
                                    paddingTop: "10px",
                                    fontWeight: "400",
                                    fontFamily: "inter",
                                    fontSize: 16,
                                    color: "#00000060",
                                    paddingBottom: 20
                                  }}
                                >
                                  {`You're all caught up`}
                                </p>}
                                scrollableTarget={`scrollableDiv-${stage.id}`}
                                dataLength={
                                  LeadsList.filter(
                                    (lead) => lead.lead.stage === stage.id
                                  ).length
                                }
                                next={() => {
                                  console.log("Load Next Leads");
                                  let leadsInStage = LeadsList.filter(
                                    (lead) => lead.lead.stage === stage.id
                                  );

                                  if (searchValue) {
                                    getMoreLeadsInStage({
                                      stageId: stage.id,
                                      offset: leadsInStage.length,
                                      search: searchValue
                                    });
                                  } else {
                                    getMoreLeadsInStage({
                                      stageId: stage.id,
                                      offset: leadsInStage.length
                                    });
                                  }

                                }} // Fetch more when scrolled
                                hasMore={hasMoreMap[stage.id] !== false}
                                loader={
                                  <div className="w-full flex justify-center mt-4 pb-12">
                                    <CircularProgress size={30} sx={{ color: "#7902DF" }} />
                                  </div>
                                }
                                style={{ overflow: "unset" }}
                              >
                                {LeadsList?.filter(
                                  (lead) => lead.lead.stage === stage.id
                                ).map((lead, leadIndex) => (
                                  <div
                                    className="px-3 mt-4 h-full"
                                    style={{ width: "300px", height: 200 }}
                                    key={leadIndex}
                                  >
                                    <div className="border rounded-xl px-4 py-2 h-full">
                                      <button
                                        className="flex flex-row items-center gap-3"
                                        onClick={() => {
                                          // console.log(
                                          //   "Selected lead details are:",
                                          //   lead
                                          // );
                                          setShowDetailsModal(true);
                                          setSelectedLeadsDetails(lead.lead);
                                          setPipelineId(lead.lead.pipeline.id);
                                          setNoteDetails(lead.lead.notes);
                                        }}
                                      >
                                        {/* T is center aligned */}
                                        <div
                                          className="bg-black text-white rounded-full flex flex-row item-center justify-center"
                                          style={{
                                            height: "27px",
                                            width: "27px",
                                          }}
                                        >
                                          {lead.lead.firstName.slice(0, 1)}
                                        </div>
                                        <div style={styles.paragraph}>
                                          {lead.lead.firstName}
                                        </div>
                                      </button>
                                      <div className="flex flex-row items-center justify-between w-full mt-2">
                                        <div
                                          className="text-[#00000060]"
                                          style={styles.agentName}
                                        >
                                          {(lead?.lead?.email
                                            ? lead?.lead?.email?.slice(0, 10) +
                                            "..."
                                            : "") || ""}
                                        </div>
                                        <div className="flex flex-row items-center gap-4">
                                          <Image
                                            src={"/assets/colorCircle.png"}
                                            height={24}
                                            width={24}
                                            alt="*"
                                          />
                                          <div
                                            className="text-purple underline"
                                            style={styles.agentName}
                                          >
                                            {lead.agent?.agents[0]?.agentType ===
                                              "outbound"
                                              ? lead.agent?.agents[0]?.name
                                              : lead.agent?.agents[1]?.name}
                                          </div>
                                        </div>
                                      </div>

                                      {lead?.lead?.booking?.date && (
                                        <div
                                          className="flex flex-row items-center gap-2"
                                          style={{
                                            // fontWeight: "500",

                                            color: "#15151560",
                                            // backgroundColor: 'red',
                                          }}
                                        >
                                          <Image
                                            src="/svgIcons/calendar.svg"
                                            height={16}
                                            width={16}
                                            alt="*"
                                            style={{ filter: "opacity(50%)" }}
                                          />
                                          {/* {moment(lead?.lead?.booking?.date).format(
                                          "MMM D"
                                        ) || "-"} */}
                                          <p
                                            style={{
                                              fontSize: 13,
                                              fontWeight: 500,
                                            }}
                                          >
                                            {GetFormattedDateString(
                                              lead?.lead?.booking?.date,
                                              true,
                                              "MMM DD"
                                            )}
                                          </p>

                                          <Image
                                            src="/svgIcons/clock.svg"
                                            height={16}
                                            width={16}
                                            alt="*"
                                            style={{ filter: "opacity(50%)" }}
                                          />
                                          <p
                                            style={{
                                              fontSize: 13,
                                              fontWeight: 500,
                                            }}
                                          >
                                            {GetFormattedTimeString(
                                              lead?.lead?.booking?.datetime
                                            )}
                                          </p>

                                          {/* {moment(
                                          lead?.lead?.booking?.time,
                                          "HH:mm"
                                        ).format("HH:mm") || "-"} */}
                                        </div>
                                      )}

                                      <div className="w-full flex flex-row items-center justify-between mt-12">
                                        {lead?.lead?.teamsAssigned?.length > 0 ? (
                                          <LeadTeamsAssignedList
                                            users={lead?.lead?.teamsAssigned}
                                            maxVisibleUsers={1}
                                          />
                                        ) : (
                                          <Image
                                            src={"/assets/manIcon.png"}
                                            height={32}
                                            width={32}
                                            alt="*"
                                          />
                                        )}
                                        {/* <div className="flex flex-row items-center gap-3">
                                                                            <div className="text-purple bg-[#1C55FF10] px-4 py-2 rounded-3xl rounded-lg">
                                                                                Tag
                                                                            </div>
                                                                            <div className="text-purple bg-[#1C55FF10] px-4 py-2 rounded-3xl rounded-lg">
                                                                                Tag
                                                                            </div>
                                                                        </div> */}

                                        {lead.lead.tags.length > 0 ? (
                                          <div className="flex flex-row items-center gap-1">
                                            {lead?.lead?.tags
                                              .slice(0, 1)
                                              .map((tagVal, index) => {
                                                return (
                                                  // <div key={index} className="text-[#402fff] bg-[#402fff10] px-4 py-2 rounded-3xl rounded-lg">
                                                  //     {tagVal}
                                                  // </div>
                                                  <div
                                                    key={index}
                                                    className="flex flex-row items-center gap-2 bg-purple10 px-2 py-1 rounded-lg"
                                                  >
                                                    <div
                                                      className="text-purple" //1C55FF10
                                                    >
                                                      {tagVal.length > 4 ? (
                                                        <div
                                                          style={{ fontSize: 13 }}
                                                        >
                                                          {tagVal.slice(0, 4)}
                                                          {"..."}
                                                        </div>
                                                      ) : (
                                                        <div
                                                          style={{ fontSize: 13 }}
                                                        >
                                                          {tagVal}
                                                        </div>
                                                      )}
                                                    </div>
                                                    {DelTagLoader &&
                                                      lead.lead.id ===
                                                      DelTagLoader ? (
                                                      <div>
                                                        <CircularProgress
                                                          size={15}
                                                        />
                                                      </div>
                                                    ) : (
                                                      <button
                                                        onClick={() => {
                                                          // console.log(
                                                          //   "Tag value is",
                                                          //   tagVal
                                                          // );
                                                          handleDelTag(
                                                            tagVal,
                                                            lead
                                                          );
                                                          let updatedTags =
                                                            lead.lead.tags.filter(
                                                              (tag) =>
                                                                tag != tagVal
                                                            ) || [];
                                                          lead.lead.tags =
                                                            updatedTags;
                                                          let newLeadCad = [];
                                                          LeadsList.map(
                                                            (item) => {
                                                              if (
                                                                item.id == lead.id
                                                              ) {
                                                                newLeadCad.push(
                                                                  lead
                                                                );
                                                              } else {
                                                                newLeadCad.push(
                                                                  item
                                                                );
                                                              }
                                                            }
                                                          );
                                                          setLeadsList(
                                                            newLeadCad
                                                          );
                                                        }}
                                                      >
                                                        <X
                                                          size={15}
                                                          weight="bold"
                                                          color="#7902DF"
                                                        />
                                                      </button>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            {lead.lead.tags.length > 1 && (
                                              <div>
                                                +{lead.lead.tags.length - 1}
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          "-"
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </InfiniteScroll>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                  <div className="h-[36px] flex flex-row items-start justify-center">
                    <button
                      className="h-[23px] text-purple outline-none mt-2"
                      style={{
                        width: "200px",
                        fontSize: "16.8",
                        fontWeight: "700",
                      }}
                      onClick={() => {
                        setAddNewStageModal(true);
                      }}
                    >
                      Add Stage
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Code for Configure Popup */}
          {
            showConfigurePopup && (
              <ConfigurePopup
                showConfigurePopup={showConfigurePopup}
                setShowConfigurePopup={setShowConfigurePopup}
                configureLoader={configureLoader}
                setConfigureLoader={setConfigureLoader}
                selectedStage={selectedStage}
                setStagesList={setStagesList}
                setSnackMessage={setSnackMessage}
                handleCloseStagePopover={handleCloseStagePopover}
              />
            )
          }

          {/* code for delete pipeline modal */}

          <Modal
            open={showDeletePipelinePopup}
            onClose={() => {
              setShowDeletePiplinePopup(false);
            }}
            BackdropProps={{
              timeout: 200,
              sx: {
                backgroundColor: "#00000020",
                // //backdropFilter: "blur(20px)",
              },
            }}
          >
            <Box
              className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 p-8 rounded-[15px]"
              sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
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
                    <div style={{ fontWeight: "500", fontSize: 17 }}>
                      Delete Pipeline
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
                          setShowDeletePiplinePopup(false);
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

                  <div
                    className="mt-6"
                    style={{ fontWeight: "700", fontSize: 22 }}
                  >
                    Are you sure you want to delete this pipeline?
                  </div>
                </div>

                <div className="flex flex-row items-center justify-center gap-4 mt-6">
                  <button className="w-1/2 mt-[13px]">Never mind</button>
                  <div className="w-1/2">
                    {deletePipelineLoader ? (
                      <div className="flex flex-row items-center w-full mt-4">
                        <CircularProgress size={25} />
                      </div>
                    ) : (
                      <button
                        className="mt-4 outline-none bg-red"
                        style={{
                          color: "white",
                          height: "50px",
                          borderRadius: "10px",
                          width: "100%",
                          fontWeight: 600,
                          fontSize: "20",
                        }}
                        onClick={handleDeletePipeline}
                      >
                        Yes! Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Box>
          </Modal>
          {/* Code for add stage modal */}
          <Modal
            open={addNewStageModal}
            onClose={() => {
              handleCloseAddStage();
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
              className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12"
              sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
            >
              <div style={{ width: "100%" }}>
                <div>
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
                      {isEditingStage ? "Configure Stage" : "Add New Stage"}
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
                      className="outline-none flex flex-row items-center gap-2"
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
                          open={openaction}
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
                                Tip: Tell your AI when to move the leads to this
                                stage.
                              </p>
                            </div>
                          </div>
                        </Popover>
                      </div>
                      {/*
                        <input
                          className="h-[50px] px-2 outline-none focus:ring-0 w-full mt-1 rounded-lg"
                          placeholder="Ex: Does the human express interest getting a CMA "
                          style={{
                            border: "1px solid #00000020",
                            fontWeight: "500",
                            fontSize: 15,
                          }}
                          value={action}
                          onChange={(e) => {
                            setAction(e.target.value);
                          }}
                        />
                      */}

                      <textarea
                        className="min-h-[50px] px-2 outline-none focus:ring-0 w-full mt-1 rounded-lg"
                        placeholder="Ex: Does the human express interest getting a CMA "
                        style={{
                          border: "1px solid #00000020",
                          fontWeight: "500",
                          fontSize: 15,
                          resize: "vertical",
                          maxHeight: "200px"
                        }}
                        value={action}
                        onChange={(e) => {
                          setAction(e.target.value);
                        }}
                        rows={2}
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
                          aria-owns={open ? "mouse-over-popover2" : undefined}
                          aria-haspopup="true"
                          onMouseEnter={(event) => {
                            setShowSampleTip(true);
                            setAssigntoActionInfoEl(event.currentTarget);
                          }}
                          onMouseLeave={() => {
                            handlePopoverClose();
                            setShowSampleTip(false);
                          }}
                        />
                      </div>

                      <div
                        className="max-h-[30vh] overflow-auto mt-2" //scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
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
                                handleInputChange(input.id, e.target.value)
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

                      {!isEditingStage && (
                        <>
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
                              aria-owns={open ? "mouse-over-popover2" : undefined}
                              aria-haspopup="true"
                              onMouseEnter={(event) => {
                                setAssigntoActionInfoEl(event.currentTarget);
                              }}
                              onMouseLeave={handlePopoverClose}
                            />
                          </div>

                          <Popover
                            id="mouse-over-popover2"
                            sx={{
                              pointerEvents: "none",
                            }}
                            open={openAssigneAction}
                            anchorEl={assigntoActionInfoEl}
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

                          {/* <button
                    className="flex flex-row items-center w-full justify-between rounded-lg h-[50px] px-2 mt-1 outline-none"
                    style={{ border: "1px solid #00000020" }}
                  >
                    <div>Select team member</div>
                    <div>
                      <CaretDown size={20} weight="bold" />
                    </div>
                  </button> */}

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
                                {/* <MenuItem value={myTeamAdmin?.name}>
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
                                      {item.id === -1 && (
                                        <div className="bg-purple text-white text-sm px-2 rounded-full">
                                          Admin
                                        </div>
                                      )}
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

                          <div
                            className="h-[45px] p-2 rounded-lg  items-center gap-2"
                            style={{ border: "0px solid #00000030" }}
                          >
                            <TagsInput setTags={setTagsValue} />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="w-full h-[80px]">
                  {
                    //inputs.filter(input => input.value.trim()).length === 3 &&
                    canProceed() ? (
                      <div>
                        {addStageLoader ? (
                          <div className="flex flex-row iems-center justify-center w-full mt-4">
                            <CircularProgress size={25} />
                          </div>
                        ) : (
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
                            onClick={isEditingStage ? handleUpdateCustomStage : handleAddCustomStage}
                          >
                            {isEditingStage ? "Update Stage" : "Add Stage"}
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        disabled={true}
                        className="mt-4 outline-none"
                        style={{
                          backgroundColor: "#00000020",
                          color: "black",
                          height: "50px",
                          borderRadius: "10px",
                          width: "100%",
                          fontWeight: 600,
                          fontSize: "20",
                        }}
                      >
                        Add
                      </button>
                    )
                  }
                </div>
              </div>
            </Box>
          </Modal>
          {/* Modal to Rename the Stage */}
          <Modal
            open={showRenamePopup}
            onClose={() => {
              setShowRenamePopup(false);
              handleCloseStagePopover();
            }}
            BackdropProps={{
              timeout: 100,
              sx: {
                backgroundColor: "#00000020",
                //backdropFilter: "blur(20px)",
              },
            }}
          >
            <Box
              className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12"
              sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
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
                    <div style={{ fontWeight: "700", fontSize: 22 }}>
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
                          handleCloseStagePopover();
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
                      Stage Title
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
                    className="mt-4 outline-none  bg-purple"
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
            open={showDelStageModal}
            onClose={() => {
              setShowDelStageModal(false);
              handleCloseStagePopover();
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
              className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12"
              sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
            >
              <div style={{ width: "100%" }}>
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
                    Delete Stage
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
                        setShowDelStageModal(false);
                        handleCloseStagePopover();
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
                        This stage has leads associated with it. Move this lead
                        to another stage before deleting.
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
                              },
                            },
                          }}
                        >
                          {StagesList?.map((stage, index) => {
                            return (
                              <MenuItem
                                key={index}
                                value={stage.stageTitle}
                                disabled={stage.id === selectedStage?.id}
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
                          backgroundColor: !assignNextStage && "#00000020",
                          color: !assignNextStage ? "#000000" : "#fff",
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
                      Confirm you want to delete this stage.This action is
                      irreversible.
                    </div>
                    <div className="flex flex-row items-center w-full mt-8">
                      <div
                        className="w-1/2 text-center"
                        onClick={() => {
                          setShowDelStageModal(false);
                          handleCloseStagePopover();
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
            </Box>
          </Modal>
          {/* Modal to rename the pipeline */}
          <Modal
            open={showRenamePipelinePopup}
            onClose={() => {
              setShowRenamePipelinePopup(false);
              handlePipelineClosePopover();
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
              className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12"
              sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
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
                    <div style={{ fontWeight: "700", fontSize: 22 }}>
                      Rename pipeline
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
                          setShowRenamePipelinePopup(false);
                          handlePipelineClosePopover();
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
                      Pipeline Title
                    </div>
                    <input
                      value={renamePipeline}
                      onChange={(e) => {
                        setRenamePipeline(e.target.value);
                      }}
                      placeholder="Enter stage title"
                      className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px]"
                      style={{ border: "1px solid #00000020" }}
                    />
                  </div>
                </div>

                {renamePipelineLoader ? (
                  <div className="flex flex-row iems-center justify-center w-full mt-4">
                    <CircularProgress size={25} />
                  </div>
                ) : (
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
                    onClick={handleRenamePipeline}
                  >
                    Update
                  </button>
                )}
              </div>
            </Box>
          </Modal>
          {/* Code for creating new pipeline */}
          <Modal
            open={createPipeline}
            onClose={() => {
              setCreatePipeline(false);
              handlePipelineClosePopover();
            }}
            closeAfterTransition
            BackdropProps={{
              timeout: 1000,
              sx: {
                backgroundColor: "#00000020",
                // ////backdropFilter: "blur(5px)",
              },
            }}
          >
            <Box className="lg:w-5/12 sm:w-7/12 w-8/12" sx={styles.modalsStyle}>
              <div className="flex flex-row justify-center w-full">
                <div
                  className="w-full"
                  style={{
                    backgroundColor: "#ffffff",
                    padding: 20,
                    borderRadius: "13px",
                  }}
                >
                  <div className="flex flex-row justify-between">
                    <div style={{ fontWeight: "600", fontSize: 22 }}>
                      Add Pipeline
                    </div>
                    <button
                      onClick={() => {
                        setCreatePipeline(false);
                        handlePipelineClosePopover();
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
                  <div className="w-full">
                    <div
                      style={{ fontWeight: "500", fontSize: 15, marginTop: 10 }}
                    >
                      Pipeline Name
                    </div>

                    <input
                      value={newPipelineTitle}
                      onChange={(e) => {
                        setNewPipelineTitle(e.target.value);
                      }}
                      className="outline-none rounded-xl focus:ring-0 w-full mt-4 h-[50px]"
                      placeholder="Type Here"
                      style={{
                        border: "1px solid #00000020",
                        fontWeight: "500",
                        fontSize: 15,
                      }}
                    />

                    {/* <div style={{ fontWeight: "500", fontSize: 12, marginTop: 10, color: "#00000060" }}>
                                    Stage
                                </div>

                                <div className='flex flex-wrap gap-4 mt-4 items-center'>
                                    {StagesList.map((stage, index) => (
                                        <div key={index} className="flex flex-col items-start h-full">
                                            <button className='px-6 rounded-[15px] h-[40px] flex flex-row items-center outline-none'
                                                onClick={() => {
                                                    setNewPipelineStage(stage.stageTitle);
                                                }}
                                                style={{
                                                    border: "1px solid #15151520",
                                                    backgroundColor: newPipelineStage === stage.stageTitle ? "#7902DF" : "",
                                                    color: newPipelineStage === stage.stageTitle ? "white" : "",
                                                    fontSize: 15, fontWeight: "500"
                                                }}
                                            >
                                                {stage.stageTitle}
                                            </button>
                                        </div>
                                    ))}
                                    <button className='px-4 rounded-[15px] h-[40px] flex flex-row items-center'
                                        style={{
                                            border: "1px solid #15151520"
                                        }}>
                                        <Plus size={25} weight='bold' />
                                    </button>
                                </div> */}

                    {addPipelineLoader ? (
                      <div className="w-full flex flex-row justify-center mt-12">
                        <CircularProgress size={30} />
                      </div>
                    ) : (
                      <button
                        className="w-full h-[50px] rounded-xl bg-purple text-white mt-12"
                        style={{
                          fontWeight: "600",
                          fontSize: 16.8,
                        }}
                        onClick={() => {
                          handleCreatePipeline();
                        }}
                      >
                        Create Pipeline
                      </button>
                    )}
                  </div>

                  {/* Can be use full to add shadow */}
                  {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                </div>
              </div>
            </Box>
          </Modal>
          {/* Code for rearranging stages */}
          <Modal
            open={showStagesPopup}
            onClose={() => {
              setShowStagesPopup(false);
              setShowReorderBtn(false);
              handleCloseStagePopover();
            }}
            closeAfterTransition
            BackdropProps={{
              timeout: 1000,
              sx: {
                backgroundColor: "#00000020",
                // ////backdropFilter: "blur(5px)",
              },
            }}
          >
            <Box
              className="lg:w-6/12 sm:w-8/12 w-10/12"
              sx={{
                height: "auto",
                bgcolor: "transparent",
                p: 2,
                mx: "auto",
                my: "50vh",
                transform: "translateY(-50%)",
                borderRadius: 2,
                border: "none",
                outline: "none",
              }}
            >
              <div className="flex flex-row justify-center w-full h-[100%]">
                <div
                  className="w-full h-[100%]"
                  style={{
                    backgroundColor: "#ffffff",
                    padding: 20,
                    borderRadius: "13px",
                    maxHeight: "90svh",
                  }}
                >
                  <div className="flex flex-row justify-between h-[10%] w-full">
                    <div style={{ fontWeight: "600", fontSize: 22 }}>
                      Rearrange Stages
                    </div>
                    <button
                      onClick={() => {
                        setShowStagesPopup(false);
                        handleCloseStagePopover();
                        setShowReorderBtn(false);
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

                  <div
                    className="w-full h-[80%] overflow-auto"
                    style={{ scrollbarWidth: "none" }}
                  >
                    <RearrangeStages
                      // stages={StagesList}
                      // onUpdateOrder={(stages) => {
                      //     setStagesList(stages);
                      // }}
                      stages={StagesList}
                      onUpdateOrder={(stages) => {
                        setStagesList(stages);
                      }}
                      // assignedLeads={assignedLeads}
                      // handleUnAssignNewStage={handleUnAssignNewStage}
                      // assignNewStage={assignNewStage}
                      // handleInputChange={handleInputChange}
                      // rowsByIndex={rowsByIndex}
                      // removeRow={removeRow}
                      // addRow={addRow}
                      nextStage={nextStage}
                      handleSelectNextChange={handleSelectNextChange}
                      selectedPipelineStages={StagesList}
                      selectedPipelineItem={SelectedPipeline}
                      handleReorderStages={handleReorder}
                      reorderStageLoader={reorderStageLoader}
                      setShowReorderBtn={setShowReorderBtn}
                    />
                  </div>

                  <div className="w-full h-[10%]">
                    {reorderStageLoader ? (
                      <div className="w-full flex flex-row items-center h-[50px] justify-center mt-6">
                        <CircularProgress size={25} />
                      </div>
                    ) : (
                      <div>
                        <button
                          disabled={!showReorderBtn}
                          className="w-full bg-purple text-white mt-6 h-[50px] rounded-xl text-xl font-[500]"
                          onClick={() => {
                            handleReorder();
                          }}
                          style={{
                            color: !showReorderBtn ? "#000000" : "",
                            backgroundColor: !showReorderBtn ? "#00000020" : "",
                          }}
                        >
                          Reorder
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Can be use full to add shadow */}
                  {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                </div>
              </div>
            </Box>
          </Modal>
          {/* Modal for lead details */}
          {showDetailsModal && (
            <LeadDetails
              selectedLead={selectedLeadsDetails?.id}
              pipelineId={pipelineId && pipelineId}
              showDetailsModal={showDetailsModal}
              setShowDetailsModal={setShowDetailsModal}
              isPipeline={true}
              handleDelLead={handleDelLead}
              leadStageUpdated={HandleUpdateStage}
              leadAssignedTeam={HandleLeadAssignedTeam}
            />
          )}
          {/* Modal for audio play */}
          <Modal
            open={showAudioPlay}
            onClose={() => setShowAudioPlay(null)}
            closeAfterTransition
            BackdropProps={{
              sx: {
                backgroundColor: "#00000020",
                ////backdropFilter: "blur(5px)",
              },
            }}
          >
            <Box className="lg:w-3/12 sm:w-5/12 w-8/12" sx={styles.modalsStyle}>
              <div className="flex flex-row justify-center w-full">
                <div
                  className="w-full flex flex-col items-center"
                  style={{
                    backgroundColor: "#ffffff",
                    padding: 20,
                    borderRadius: "13px",
                  }}
                >
                  <audio controls>
                    <source src={showAudioPlay} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  <button
                    className="text-white w-full h-[50px] rounded-lg bg-purple mt-4"
                    onClick={() => {
                      setShowAudioPlay(null);
                    }}
                    style={{ fontWeight: "600", fontSize: 15 }}
                  >
                    Close
                  </button>

                  {/* Can be use full to add shadow
                            <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                </div>
              </div>
            </Box>
          </Modal>
          {/* Warning Modal for no voice */}
          <Modal
            open={showNoAudioPlay}
            onClose={() => setShowNoAudioPlay(false)}
            closeAfterTransition
            BackdropProps={{
              sx: {
                backgroundColor: "#00000020",
                ////backdropFilter: "blur(5px)",
              },
            }}
          >
            <Box className="lg:w-3/12 sm:w-5/12 w-8/12" sx={styles.modalsStyle}>
              <div className="flex flex-row justify-center w-full">
                <div
                  className="w-full flex flex-col items-center"
                  style={{
                    backgroundColor: "#ffffff",
                    padding: 20,
                    borderRadius: "13px",
                  }}
                >
                  <audio controls>
                    <source src={showAudioPlay} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  <button
                    className="text-white w-full h-[50px] rounded-lg bg-purple mt-4"
                    onClick={() => {
                      setShowNoAudioPlay(false);
                    }}
                    style={{ fontWeight: "600", fontSize: 15 }}
                  >
                    Close
                  </button>

                  {/* Can be use full to add shadow
                            <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                </div>
              </div>
            </Box>
          </Modal>
          {/* Modal to add notes */}
          <Modal
            open={showAddNotes}
            onClose={() => setShowAddNotes(false)}
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
              className="sm:w-5/12 lg:w-5/12 xl:w-4/12 w-8/12 max-h-[70vh]"
              sx={{ ...styles.modalsStyle, scrollbarWidth: "none" }}
            >
              <div className="flex flex-row justify-center w-full h-[50vh]">
                <div
                  className="w-full"
                  style={{
                    backgroundColor: "#ffffff",
                    padding: 20,
                    paddingInline: 30,
                    borderRadius: "13px",
                    // paddingBottom: 10,
                    // paddingTop: 10,
                    height: "100%",
                  }}
                >
                  <div style={{ fontWeight: "700", fontsize: 22 }}>
                    Add your notes
                  </div>
                  <div
                    className="mt-4"
                    style={{
                      height: "70%",
                      overflow: "auto",
                    }}
                  >
                    <TextareaAutosize
                      maxRows={12}
                      className="outline-none focus:outline-none focus:ring-0 w-full"
                      style={{
                        fontsize: 15,
                        fontWeight: "500",
                        height: "250px",
                        border: "1px solid #00000020",
                        resize: "none",
                        borderRadius: "13px",
                      }}
                      placeholder="Add notes"
                      value={addNotesValue}
                      onChange={(event) => {
                        setddNotesValue(event.target.value);
                      }}
                    />
                  </div>
                  <div className="w-full mt-4 h-[20%] flex flex-row justify-center">
                    {addLeadNoteLoader ? (
                      <CircularProgress size={25} />
                    ) : (
                      <button
                        className="bg-purple h-[50px] rounded-xl text-white rounded-xl w-6/12"
                        style={{
                          fontWeight: "600",
                          fontsize: 16,
                        }}
                        onClick={() => {
                          handleAddLeadNotes();
                        }}
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Box>
          </Modal>
          {/* Code for side view */}
          {importantCalls?.length > 0 && (
            <div
              className={`flex items-center gap-4 p-4 bg-white shadow-lg transition-all h-20 duration-300 ease-in-out ${expandSideView ? "w-[506px]" : "w-[100px]"
                }`} //${expandSideView ? 'w-[32vw]' : 'w-[7vw]'}
              style={{
                borderTopLeftRadius: expandSideView ? "0" : "40px",
                borderBottomLeftRadius: expandSideView ? "0" : "40px",
                // alignSelf: 'flex-end',
                position: "absolute",
                // transform: expandSideView ? "translateX(0)" : "translateX(100%)",
                bottom: 100,
                right: 0,
              }}
              onClick={() => { }}
            >
              {expandSideView ? (
                <div className="flex  items-center justify-center w-full">
                  <div className="w-11/12 flex flex-col items-start gap-1  h-20 ">
                    <div className="flex flex-row gap-2 w-full">
                      <button
                        className="flex flex-col items-center justify-center gap-1"
                        onClick={() => {
                          setOpenCallWorthyPopup(true);
                        }}
                      >
                        <img
                          src="/svgIcons/fireIcon.png"
                          style={{ height: 25, width: 25 }}
                          alt="Fire Icon"
                        />
                        <img
                          src="/svgIcons/threeDots.svg"
                          style={{ height: 5, width: 15 }}
                          alt="Three Dots"
                        />
                      </button>

                      <div className="flex  items-center justify-start w-full">
                        <button
                          onClick={() => {
                            // setOpenCallWorthyPopup(true);
                          }}
                          className="flex flex-col items-start  truncate"
                        >
                          <div className="text-[17px] font-[600]">
                            While you were away
                          </div>
                        </button>
                        <div className="flex flex-col items-start ml-[30px] border border-purple rounded">
                          <button
                            className="text-purple  px-2"
                            onClick={() => {
                              // setExpandSideView(false);
                              setOpenCallWorthyPopup(true);
                            }}
                          >
                            Listen Now
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-[15px] font-[500] pl-8 truncate">
                      Here are some calls that sounded important.
                    </div>
                  </div>
                  <div className="flex flex-col items-center -mt-2 -ml-2">
                    <button
                      className="text-purple"
                      onClick={() => {
                        setExpandSideView(false);
                      }}
                    >
                      <img
                        src="/svgIcons/cross.svg"
                        style={{ height: 24, width: 24 }}
                      />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="w-full flex flex-row gap-4 items-center cursor-pointer h-20"
                  onClick={() => setExpandSideView(!expandSideView)}
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <img
                      src="/svgIcons/fireIcon.png"
                      style={{ height: 25, width: 25 }}
                      alt="Fire Icon"
                    />
                    <img
                      src="/svgIcons/threeDots.svg"
                      style={{ height: 5, width: 15 }}
                      alt="Three Dots"
                    />
                  </div>
                  <img
                    src="/svgIcons/leftArrowIcon.svg"
                    style={{ height: 24, width: 24 }}
                    alt="Three Dots"
                  />
                </div>
              )}
            </div>
          )}
          {/* Code for calll worthy modal */}
          {openCallWorthyPopup && (
            <CallWorthyReviewsPopup
              open={openCallWorthyPopup}
              close={() => {
                setOpenCallWorthyPopup(false);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Pipeline1;
