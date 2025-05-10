import Apis from "@/components/apis/Apis";
import {
  Alert,
  Box,
  CircularProgress,
  Drawer,
  Fade,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Popover,
  Select,
  Snackbar,
  TextareaAutosize,
  Tooltip,
} from "@mui/material";
import {
  CaretDown,
  CaretUp,
  EnvelopeSimple,
  Plus,
  X,
} from "@phosphor-icons/react";
import axios from "axios";
import parsePhoneNumberFromString from "libphonenumber-js";
import moment from "moment";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "../AgentSelectSnackMessage";
import { GetFormattedDateString } from "@/utilities/utility";
import LeadTeamsAssignedList from "../LeadTeamsAssignedList";
import SelectStageDropdown from "../StageSelectDropdown";
import { AssignTeamMember } from "@/components/onboarding/services/apisServices/ApiService";
import CircularLoader from "@/utilities/CircularLoader";
import { getAgentsListImage } from "@/utilities/agentUtilities";
import { capitalize } from "@/utilities/StringUtility";
import CloseIcon from "@mui/icons-material/Close";

import { Phone } from "lucide-react";
import Perplexity from "./Perplexity";
import NoPerplexity from "./NoPerplexity";
import ConfirmPerplexityModal from "./CofirmPerplexityModal";
import { setUser } from "@sentry/nextjs";
import getProfileDetails from "@/components/apis/GetProfile";

import Player from "@madzadev/audio-player";
import "@madzadev/audio-player/dist/index.css";
import { TranscriptViewer } from "@/components/calls/TranscriptViewer";
import NoVoicemailView from "../../myagentX/NoVoicemailView";

const LeadDetails = ({
  showDetailsModal,
  selectedLead,
  setShowDetailsModal,
  pipelineId,
  handleDelLead,
  hideDelete,
  isPipeline = false,
  noBackDrop = false,
  leadStageUpdated,
  leadAssignedTeam,
}) => {
  // //console.log;
  // //console.log;

  const [columnsLength, setcolumnsLength] = useState([]);

  const [initialLoader, setInitialLoader] = useState(false);

  const [selectedLeadsDetails, setSelectedLeadsDetails] = useState(null);
  const [leadColumns, setLeadColumns] = useState([]);

  const [globalLoader, setGlobalLoader] = useState(false);
  //code for emailPopup
  const [showAllEmails, setShowAllEmails] = useState(false);

  //code for buttons of details popup
  const [showKYCDetails, setShowKycDetails] = useState(false);
  const [showNotesDetails, setShowNotesDetails] = useState(false);
  const [showAcitivityDetails, setShowAcitivityDetails] = useState(false);
  const [showPerplexityDetails, setShowPerpelexityDetails] = useState(true);

  //code for add stage notes
  const [showAddNotes, setShowAddNotes] = useState(false);
  const [addNotesValue, setddNotesValue] = useState("");
  const [noteDetails, setNoteDetails] = useState([]);
  const [addLeadNoteLoader, setAddLeadNoteLoader] = useState(false);

  //code for call activity transcript text
  const [isExpanded, setIsExpanded] = useState(null); // earlier it was empty array
  const [isExpandedActivity, setIsExpandedActivity] = useState([]);

  const [expandedCustomFields, setExpandedCustomFields] = useState([]); // check if the custom fields Read More or Read less should show

  //code for audio play popup
  const [showAudioPlay, setShowAudioPlay] = useState(null);
  const [showNoAudioPlay, setShowNoAudioPlay] = useState(false);

  //show custom variables
  const [showCustomVariables, setShowCustomVariables] = useState(false);

  //code for del tag
  const [DelTagLoader, setDelTagLoader] = useState(null);

  //code for stages drop down
  const [selectedStage, setSelectedStage] = useState("");
  const [stagesList, setStagesList] = useState([]);
  const [stagesListLoader, setStagesListLoader] = useState(false);

  //code for snakbars
  const [showSuccessSnack, setShowSuccessSnack] = useState(null);
  const [showSuccessSnack2, setShowSuccessSnack2] = useState(false);
  const [showErrorSnack, setShowErrorSnack] = useState(null);
  const [showErrorSnack2, setShowErrorSnack2] = useState(false);

  //update lead loader
  const [updateLeadLoader, setUpdateLeadLoader] = useState(false);

  //code for delete lead
  const [delLeadLoader, setDelLeadLoader] = useState(false);

  //variable for popover
  const [anchorEl, setAnchorEl] = React.useState(null);

  //variables storing tammember data
  const [myTeam, setMyTeam] = useState([]);
  const [myTeamAdmin, setMyTeamAdmin] = useState(null);

  //variable for showing modal
  const [extraTagsModal, setExtraTagsModal] = useState(false);

  //variable for gtteam loader
  const [getTeamLoader, setGetTeamLoader] = useState(false);

  const [showConfirmPerplexity, setshowConfirmPerplexity] = useState(false);

  const [userLocalData, setUserLocalData] = useState("");
  const [loading, setLoading] = useState(false);

  const [showDelModal, setShowDelModal] = useState(false);

  useEffect(() => {
    const getData = async () => {
      let user = await getProfileDetails();
      if (user) {
        setUserLocalData(user.data.data);
        // console.log('user', user)
      }
    };

    getData();
  }, []);

  useEffect(() => {
    if (!selectedLead) return;
    getLeadDetails(selectedLead);

    console.log("pipelineId", pipelineId);

    if (pipelineId) {
      // //console.log;
      getStagesList(selectedLead);
    }
    getMyteam();
  }, [selectedLead]);

  //code for getting teammebers
  const getMyteam = async () => {
    //console.log;
    try {
      setGetTeamLoader(true);
      const data = localStorage.getItem("User");

      if (data) {
        let u = JSON.parse(data);
        let path = Apis.getTeam;

        const response = await axios.get(path, {
          headers: {
            Authorization: "Bearer " + u.token,
          },
        });

        if (response) {
          setGetTeamLoader(false);

          if (response.data.status === true) {
            //console.log;
            setMyTeam(response.data.data);
            setMyTeamAdmin(response.data.admin);
          } else {
            // //console.log;
          }
        }
      }
    } catch (e) {
      setGetTeamLoader(false);

      // //console.log;
    }
  };

  //function to assign lead to the team
  const handleAssignLeadToTeammember = async (item) => {
    try {
      //console.log;
      handleClosePopup();
      setGlobalLoader(true);
      let response = await AssignTeamMember(
        selectedLeadsDetails.id,
        item.invitingUserId
      );
      if (response.data.status === true) {
        setSelectedLeadsDetails((prevData) => {
          return {
            ...prevData,
            teamsAssigned: [...prevData.teamsAssigned, item],
          };
        });
        leadAssignedTeam(item, selectedLeadsDetails);
      }
      //console.log;
    } catch (error) {
      // console.error("Error occured is", error);
    } finally {
      setGlobalLoader(false);
      handleClosePopup();
    }
  };

  //function to handle stages dropdown selection
  const handleStageChange = (event) => {
    //// //console.log
    setSelectedStage(event.target.value);
    // updateLeadStage();
  };

  //function to update stage
  const updateLeadStage = async (stage) => {
    try {
      // //console.log;
      let AuthToken = null;
      setUpdateLeadLoader(true);

      const localDetails = localStorage.getItem("User");
      if (localDetails) {
        const Data = JSON.parse(localDetails);
        //// //console.log;
        AuthToken = Data.token;
      }

      const ApiData = {
        leadId: selectedLead,
        stageId: stage.id,
      };

      // //console.log;

      const ApiPath = Apis.updateLeadStageApi;
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        setUpdateLeadLoader(false);
        if (response.data.status === true) {
          setShowSuccessSnack(response.data.message);
          setShowSuccessSnack2(true);
          leadStageUpdated(stage);
        } else if (response.data.status === false) {
          setShowErrorSnack(response.data.message);
          setShowErrorSnack2(true);
        }
      }
    } catch (error) {
      // console.error("Error occured in api is", error);
      setUpdateLeadLoader(false);
    } finally {
      // //console.log;
    }
  };

  //code for popover

  const handleShowPopup = (event) => {
    setAnchorEl(event.currentTarget);
    //// //console.log;
  };

  const handleClosePopup = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  //function to get the lead detils
  const getLeadDetails = async (selectedLead) => {
    try {
      setInitialLoader(true);
      // //console.log;
      let AuthToken = null;

      const localDetails = localStorage.getItem("User");
      if (localDetails) {
        const Data = JSON.parse(localDetails);
        //// //console.log;
        AuthToken = Data.token;
      }

      // //console.log;

      const ApiPath = `${Apis.getLeadDetails}?leadId=${selectedLead}`;

      // //console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // console.log("lead details are", response.data.data)
        let dynamicColumns = [];
        dynamicColumns = [
          ...response?.data?.columns,
          // { title: "Tag" },
          {
            title: "More",
            idDefault: false,
          },
        ];
        // setLeadColumns(response.data.columns);
        setSelectedLeadsDetails(response.data.data);
        console.log("Lead details response", response.data.data);
        setSelectedStage(response?.data?.data?.stage?.stageTitle);
        // setSelectedStage(response?.data?.data?.stage?.stageTitle);
        setLeadColumns(dynamicColumns);
        setcolumnsLength(response?.data?.columns);
        setNoteDetails(response.data.data.notes);
      }
    } catch (error) {
      // console.error("Error occured in api is", error);
    } finally {
      setInitialLoader(false);
      // //console.log;
    }
  };

  //function to get the stages list using pipelineId
  const getStagesList = async () => {
    try {
      let AuthToken = null;
      setStagesListLoader(true);
      const localDetails = localStorage.getItem("User");
      if (localDetails) {
        const Data = JSON.parse(localDetails);
        //console.log;
        AuthToken = Data.token;
      }

      // //console.log;

      const ApiPath = `${Apis.getStagesList}?pipelineId=${pipelineId}&liteResource=true`;

      // console.log("ApiPath", ApiPath);

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // setStagesListLoader(false);
        //console.log;
        if (response.data.status === true) {
          // console.log("stages list are", response.data.data.stages);
          setStagesList(response.data.data.stages);
        } else {
          // setShowErrorSnack(response.data.message);
          console.log("Error in stages list", response.data.message);
          // setShowErrorSnack2(true);
        }
      }
    } catch (error) {
      console.error("Error occured in stage list api is", error);
    } finally {
      setStagesListLoader(false);
      // //console.log;
    }
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

  //function to format the phone number
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

  const ShowReadMoreButton = (column, item) => {
    let filteredColumns = column;
    const { title } = filteredColumns;

    if (item) {
      switch (title) {
        case "Name":
        case "Date":
        case "Phone":
        case "Stage":
          return false;
        default:
          const value = `${item[title]}`;

          if (value.length > 60) {
            return true;
          } else {
            return false;
          }
      }
    }
  };

  //code for custom variables
  const getDetailsColumnData = (column, item) => {
    // console.log("Testing colum data is", item);
    let filteredColumns = column;
    const { title } = filteredColumns;
    if (item) {
      switch (title) {
        case "Name":
          return <div></div>;
        case "Date":
          return item.createdAt ? GetFormattedDateString(item?.createdAt) : "-";
        case "Phone":
          return "-";
        case "Stage":
          return item.stage ? item.stage.stageTitle : "No Stage";
        default:
          const value = `${item[title]}`;
          //console.log;
          if (typeof value === "object" && value !== null) {
            // Handle objects gracefully
            return JSON.stringify(value); // Convert to string or handle as needed
          }
          const initialTextLength = Math.ceil(
            value.length > 60 ? 60 : value.length
          ); // 50 characters
          var dots = value.length > 60 ? "..." : "";
          const initialText = expandedCustomFields.includes(title)
            ? value
            : value.slice(0, initialTextLength);
          return initialText + dots || "-";
      }
    }
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

  //code for del tag api
  const handleDelTag = async (tag) => {
    try {
      // //console.log;
      setDelTagLoader(tag);

      let AuthToken = null;

      const userData = localStorage.getItem("User");
      if (userData) {
        const localData = JSON.parse(userData);
        AuthToken = localData.token;
      }

      // //console.log;

      const ApiData = {
        tag: tag,
        leadId: selectedLeadsDetails.id,
      };

      const ApiPath = Apis.delLeadTag;
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

          const updatedTags = selectedLeadsDetails.tags.filter(
            (item) => item !== tag
          );
          setSelectedLeadsDetails((prevDetails) => ({
            ...prevDetails,
            tags: updatedTags,
          }));
        }
      }
    } catch (error) {
      // console.error("Error occured in api is:", error);
    } finally {
      setDelTagLoader(null);
    }
  };

  //fucntion to read more transcript text
  const handleReadMoreToggle = (item) => {
    // setIsExpanded(!isExpanded);

    setIsExpanded(item);
    // setIsExpanded((prevIds) => {
    //   if (prevIds.includes(item.id)) {
    //     // Unselect the item if it's already selected
    //     return prevIds.filter((prevId) => prevId !== item.id);
    //   } else {
    //     // Select the item if it's not already selected
    //     return [...prevIds, item.id];
    //   }
    // });
  };

  const handleDeleteLead = async () => {
    try {
      // handleDelLead(selectedLeadsDetails);
      // return;
      setDelLeadLoader(true);

      let AuthToken = null;

      const userData = localStorage.getItem("User");
      if (userData) {
        const localData = JSON.parse(userData);
        AuthToken = localData.token;
      }

      const ApiData = {
        leadId: selectedLeadsDetails.id,
        isPipeline: isPipeline,
      };

      // //console.log;

      const ApiPath = Apis.deleteLead;

      // const localLead = localStorage.getItem("")

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
          handleDelLead(selectedLeadsDetails);
          setShowSuccessSnack2(response.data.message);
          setShowDelModal(false);
        }
      }
    } catch (error) {
      // console.error("Error occured in api is", error);
    } finally {
      setDelLeadLoader(false);
    }
  };

  const styles = {
    modalsStyle: {
      // height: "auto",
      bgcolor: "transparent",
      // p: 2,
      mx: "auto",
      my: "50vh",
      transform: "translateY(-50%)",
      borderRadius: 2,
      border: "none",
      outline: "none",
    },
    heading2: {
      fontsize: 15,
      fontWeight: "500",
      color: "#000000100",
    },
    subHeading: {
      fontsize: 12,
      fontWeight: "500",
      color: "#15151560",
    },
  };

  function getExtraColumsCount(columns) {
    // //console.log
    let count = 0;
    let ExcludedColumns = [
      "name",
      "phone",
      "email",
      "status",
      "stage",
      "address",
    ];
    for (const c of columns) {
      if (!c.isDefault) {
        if (!ExcludedColumns.includes(c?.title?.toLowerCase() || "")) {
          count += 1;
        }
      }
    }
    // //console.log;

    return count;
  }

  const handleEnrichLead = async () => {
    try {
      setLoading(true);
      const data = localStorage.getItem("User");

      if (data) {
        let u = JSON.parse(data);

        let apidata = {
          leadId: selectedLeadsDetails.id,
        };
        // console.log('apidata', apidata)
        // console.log('u.token', u.token)

        const response = await axios.post(Apis.enrichLead, apidata, {
          headers: {
            Authorization: "Bearer " + u.token,
          },
        });

        if (response.data) {
          setLoading(false);
          if (response.data.status === true) {
            // console.log('response of enrich lead aip is', response.data.data)
            setSelectedLeadsDetails(response.data.data);
            let credits = u.user.enrichCredits;

            setShowSuccessSnack(response.data.message);
            setShowSuccessSnack2(true);

            if (credits == 0) {
              u.user.enrichCredits = 99;
            } else {
              u.user.enrichCredits = credits - 1;
            }

            localStorage.setItem("User", JSON.stringify(u));

            setshowConfirmPerplexity(false);
          } else {
            setShowErrorSnack(response.data.message);
            setShowErrorSnack2(true);

            console.log("response.data.message", response.data.message);
          }
        }
      }
    } catch (e) {
      setLoading(false);
      console.log("error in enrich lead is", e);
    } finally {
      setLoading(false);
    }
  };

  // console.log('enrichData', enrichData)

  return (
    <div className="h-[100svh]">
      <Drawer
        open={showDetailsModal}
        anchor="right"
        onClose={() => {
          setShowDetailsModal(false);
        }}
        PaperProps={{
          sx: {
            width: "45%", // Adjust width as needed
            borderRadius: "20px", // Rounded corners
            padding: "0px", // Internal padding
            boxShadow: 3, // Light shadow
            margin: "1%", // Small margin for better appearance
            backgroundColor: "white", // Ensure it's visible
            height: "96.5vh",
            overflow: "hidden",
            scrollbarWidth: "none",
          },
        }}
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <div className="flex flex-col w-full h-full  py-2 px-5 rounded-xl">
          <div className="w-full flex flex-col items-center h-full">
            <AgentSelectSnackMessage
              isVisible={showSuccessSnack2}
              hide={() => setShowSuccessSnack2(false)}
              message={showSuccessSnack}
              type={SnackbarTypes.Success}
            />
            <AgentSelectSnackMessage
              isVisible={showErrorSnack2}
              hide={() => setShowErrorSnack2(false)}
              message={showErrorSnack2}
              type={SnackbarTypes.Error}
            />

            <div className="w-full">
              {initialLoader ? (
                <div className="w-full flex flex-row items-center justify-center mt-24">
                  <CircularProgress size={45} thickness={2} />
                </div>
              ) : (
                <div
                  className="h-[95vh] overflow-auto"
                  style={{ scrollbarWidth: "none" }}
                >
                  <div
                    style={{
                      padding: 20,
                      paddingInline: 30,
                    }}
                  >
                    <div className="w-full flex flex-row items-center justify-between pb-4 border-b">
                      <div style={{ fontSize: 18, fontWeight: "700" }}>
                        More Info
                      </div>
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                        }}
                      >
                        <CloseIcon />
                      </button>
                    </div>
                    <div>
                      <div className="flex flex-row items-start justify-between mt-4  w-full">
                        <div className="flex flex-col items-start gap-[5px] ">
                          <div className="flex flex-row items-center gap-4">
                            <div
                              className="h-[32px] w-[32px] bg-black rounded-full flex flex-row items-center justify-center text-white"
                            // onClick={() => handleToggleClick(item.id)}
                            >
                              {selectedLeadsDetails?.firstName.slice(0, 1)}
                            </div>
                            <div
                              className="truncate"
                              onClick={() => handleToggleClick(item.id)}
                            >
                              {selectedLeadsDetails?.firstName}{" "}
                              {selectedLeadsDetails?.lastName}
                            </div>
                            {selectedLeadsDetails?.isOnDncList && (
                              <div className="rounded-full bg-red justify-center items-center  color-black p-1 px-2">
                                DNC
                              </div>
                            )}
                          </div>
                          {/* Email Field */}
                          <div className="flex flex-row items-center gap-2">
                            <EnvelopeSimple size={20} color="#000000100" />
                            <div style={styles.heading2}>
                              {selectedLeadsDetails?.email ? (
                                selectedLeadsDetails?.email
                              ) : (
                                <div>
                                  {selectedLeadsDetails?.emails
                                    ?.slice(0, 1)
                                    .map((email, emailIndex) => {
                                      return (
                                        <div
                                          key={emailIndex}
                                          className="flex flex-row items-center gap-2"
                                        >
                                          <div
                                            className="flex flex-row items-center gap-2 px-1 mt-1 rounded-lg border border-[#00000020]"
                                            style={styles.paragraph}
                                          >
                                            <Image
                                              src={"/assets/power.png"}
                                              height={9}
                                              width={7}
                                              alt="*"
                                            />
                                            <div>
                                              <span className="text-purple">
                                                New
                                              </span>{" "}
                                              {email.email}
                                            </div>
                                          </div>
                                          <button
                                            className="text-purple underline"
                                            onClick={() => {
                                              setShowAllEmails(true);
                                            }}
                                          >
                                            {selectedLeadsDetails?.emails
                                              ?.length > 1
                                              ? `+${selectedLeadsDetails?.emails
                                                ?.length - 1
                                              }`
                                              : ""}
                                          </button>
                                        </div>
                                      );
                                    })}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            {selectedLeadsDetails?.email && (
                              <div className="flex flex-row w-full justify-end">
                                {selectedLeadsDetails?.emails
                                  ?.slice(0, 1)
                                  .map((email, emailIndex) => {
                                    return (
                                      <div
                                        key={emailIndex}
                                        className="flex flex-row items-center gap-2"
                                      >
                                        <div
                                          className="flex flex-row items-center gap-2 px-1 mt-1 rounded-lg border border-[#00000020]"
                                          style={styles.paragraph}
                                        >
                                          <Image
                                            src={"/assets/power.png"}
                                            height={9}
                                            width={7}
                                            alt="*"
                                          />
                                          <div>
                                            <span className="text-purple">
                                              New
                                            </span>{" "}
                                            {email.email}
                                          </div>
                                        </div>
                                        <button
                                          className="text-purple underline"
                                          onClick={() => {
                                            setShowAllEmails(true);
                                          }}
                                        >
                                          {selectedLeadsDetails?.emails
                                            ?.length > 1
                                            ? `+${selectedLeadsDetails?.emails
                                              ?.length - 1
                                            }`
                                            : ""}
                                        </button>
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-row gap-2 justify-center items-center">
                            {/* <div className="w-4 h-4 filter invert brightness-0"> */}
                            <Image
                              src="/assets/callBtn.png"
                              width={16}
                              height={16}
                              alt="call"
                            />
                            {/* </div> */}
                            {/* <Phone className="w-4 h-4 text-black" /> */}
                            <div style={styles.heading2}>
                              {formatPhoneNumber(selectedLeadsDetails?.phone) ||
                                "-"}
                            </div>
                            {selectedLeadsDetails?.cell != null && (
                              <div
                                className="rounded-full font-medium justify-center items-center color-[#ffffff] p-1 px-2 bg-[#15151580]"
                                style={{ color: "white" }}
                              >
                                {selectedLeadsDetails?.cell}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-row items-center gap-2">
                            {/* <EnvelopeSimple size={20} color='#00000060' /> */}
                            <Image
                              src={"/assets/location.png"}
                              height={16}
                              width={16}
                              alt="man"
                            />
                            <div style={styles.heading2}>
                              {selectedLeadsDetails?.address || "-"}
                            </div>
                          </div>
                          <div className="flex flex-row items-center gap-2">
                            <Image
                              src={"/assets/tag.png"}
                              height={16}
                              width={16}
                              alt="man"
                            />
                            <div>
                              {selectedLeadsDetails?.tags.length > 0 ? (
                                <div
                                  className="text-end flex flex-row items-center gap-2 "
                                // style={styles.paragraph}
                                >
                                  {
                                    // selectedLeadsDetails?.tags?.map.slice(0, 1)
                                    selectedLeadsDetails?.tags
                                      .slice(0, 2)
                                      .map((tag, index) => {
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
                                              {DelTagLoader &&
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
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })
                                  }
                                  <button
                                    className="outline-none"
                                    onClick={() => {
                                      // console.log(
                                      //   "tags are",
                                      //   selectedLeadsDetails?.tags
                                      // );
                                      setExtraTagsModal(true);
                                    }}
                                  >
                                    {selectedLeadsDetails?.tags.length > 2 && (
                                      <div className="text-purple underline">
                                        +{selectedLeadsDetails?.tags.length - 2}
                                      </div>
                                    )}
                                  </button>
                                </div>
                              ) : (
                                "-"
                              )}
                            </div>
                          </div>

                          <div className="flex flex-row items-center gap-2">
                            <Image
                              src="/assets/pipelineIcon.svg"
                              height={20}
                              width={20}
                              alt="*"
                              style={{
                                filter:
                                  "invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%)",
                              }}
                            />
                            <div style={styles.heading2}>
                              {selectedLeadsDetails?.pipeline
                                ? selectedLeadsDetails?.pipeline?.title
                                : "-"}
                            </div>
                          </div>

                          <div>
                            {selectedLeadsDetails?.booking && (
                              <div className="flex flex-row items-center gap-2">
                                <Image
                                  src="/svgIcons/calendar.svg"
                                  height={20}
                                  width={20}
                                  alt="*"
                                />
                                <div style={styles.heading2}>
                                  {GetFormattedDateString(
                                    selectedLeadsDetails.booking.datetime,
                                    true
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-[5px]">
                          <div className="flex flex-row items-center gap-2">
                            {/* <Image
                              src={"/assets/arrow.png"}
                              height={16}
                              width={16}
                              alt="man"
                            /> */}
                            <div
                              className="text-end flex flex-row items-center gap-1"
                              style={styles.paragraph}
                            >
                              {stagesListLoader ? (
                                <CircularProgress size={25} />
                              ) : (
                                <>
                                  <div
                                    className="h-[10px] w-[10px] rounded-full"
                                    style={{
                                      backgroundColor:
                                        selectedLeadsDetails?.stage
                                          ?.defaultColor,
                                    }}
                                  ></div>

                                  {
                                    updateLeadLoader ? (
                                      <CircularProgress size={20} />
                                    ) : (
                                      <SelectStageDropdown
                                        selectedStage={selectedStage}
                                        handleStageChange={handleStageChange}
                                        stagesList={stagesList}
                                        updateLeadStage={updateLeadStage}
                                      />
                                    )
                                  }
                                </>
                              )}
                            </div>
                          </div>

                          <div className="mt-10">
                            {selectedLeadsDetails?.teamsAssigned?.length > 0 ? (
                              <div className="p-8">
                                <LeadTeamsAssignedList
                                  users={selectedLeadsDetails?.teamsAssigned}
                                />
                              </div>
                            ) : globalLoader ? (
                              <CircularProgress size={25} />
                            ) : (
                              <button
                                className="text-end outline-none"
                                style={styles.paragraph}
                                aria-describedby={id}
                                variant="contained"
                                onClick={(event) => {
                                  handleShowPopup(event);
                                }}
                              >
                                <Image
                                  src={"/assets/manIcon.png"}
                                  height={30}
                                  width={30}
                                  alt="man"
                                />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className=" flex w-full">
                        {getExtraColumsCount(columnsLength) >= 1 && (
                          <div className="flex flex-col mt-2 rounded-xl p-2 w-full max-w-full overflow-hidden">
                            <button
                              onClick={() => {
                                setShowCustomVariables(!showCustomVariables);
                              }}
                              className="flex flex-row items-center w-full justify-between outline-none"
                            >
                              <div className="flex flex-row items-center gap-3">
                                <Image
                                  src={"/assets/customsIcon.svg"}
                                  alt="*"
                                  height={16}
                                  width={16}
                                />
                                <div
                                  style={{
                                    fontWeight: "600",
                                    fontsize: 15,
                                    color: "#000000100",
                                  }}
                                >
                                  Custom fields
                                </div>
                                {showCustomVariables ? (
                                  <CaretUp
                                    size={16}
                                    weight="bold"
                                    color="#15151570"
                                  />
                                ) : (
                                  <CaretDown
                                    size={16}
                                    weight="bold"
                                    color="#15151570"
                                  />
                                )}
                              </div>
                              <div>
                                {getExtraColumsCount(columnsLength) > 0 ? (
                                  <div
                                    className="text-purple underline"
                                    style={{ fontsize: 15, fontWeight: "500" }}
                                  >
                                    +{getExtraColumsCount(columnsLength)}
                                  </div>
                                ) : (
                                  ""
                                )}
                              </div>
                            </button>
                            <div className="flex w-full ">
                              {showCustomVariables && (
                                <div className="flex flex-col mt-4 gap-1 w-full max-w-full overflow-hidden">
                                  {leadColumns.map((column, index) => {
                                    if (
                                      [
                                        "Name",
                                        "Phone",
                                        "address",
                                        "More",
                                        0,
                                        "Stage",
                                        "status",
                                      ].includes(column?.title)
                                    ) {
                                      return null;
                                    }
                                    return (
                                      <div
                                        key={index}
                                        className="flex flex-row items-start gap-1 justify-between w-full flex-wrap"
                                      >
                                        <div className="flex flex-row items-center gap-4">
                                          <div style={styles.subHeading}>
                                            {capitalize(column?.title || "")}
                                          </div>
                                        </div>
                                        <div className="flex flex-row whitespace-normal break-words overflow-hidden items-end flex-wrap">
                                          <div className="flex flex-col items-end flex-grow w-full">
                                            {getDetailsColumnData(
                                              column,
                                              selectedLeadsDetails
                                            )}
                                          </div>
                                          {ShowReadMoreButton(
                                            column,
                                            selectedLeadsDetails
                                          ) && (
                                              <div className="flex items-end justify-end min-w-[120px]">
                                                <button
                                                  style={{
                                                    fontWeight: "600",
                                                    fontSize: 15,
                                                  }}
                                                  onClick={() => {
                                                    setExpandedCustomFields(
                                                      (prevFields) =>
                                                        prevFields.includes(
                                                          column?.title
                                                        )
                                                          ? prevFields.filter(
                                                            (field) =>
                                                              field !==
                                                              column?.title
                                                          )
                                                          : [
                                                            ...prevFields,
                                                            column?.title,
                                                          ]
                                                    );
                                                  }}
                                                  className="text-black underline w-[120px]"
                                                >
                                                  {expandedCustomFields.includes(
                                                    column?.title
                                                  )
                                                    ? "Read Less"
                                                    : "Read More"}
                                                </button>
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Modal for All Emails */}
                      <Modal
                        open={showAllEmails}
                        onClose={() => setShowAllEmails(null)}
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
                          className="lg:w-5/12 sm:w-full w-8/12"
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
                              <div>
                                {selectedLeadsDetails?.emails.map(
                                  (email, emailIndex) => {
                                    return (
                                      <div key={emailIndex}>
                                        <div
                                          className="flex flex-row items-center gap-2 px-1 mt-2 rounded-lg py-2 border border-[#00000020]"
                                          style={styles.paragraph}
                                        >
                                          <Image
                                            src={"/assets/power.png"}
                                            height={9}
                                            width={7}
                                            alt="*"
                                          />
                                          <div>
                                            <span className="text-purple">
                                              New
                                            </span>{" "}
                                            {email?.email}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                              <div className="mt-4">
                                <button
                                  onClick={() => {
                                    setShowAllEmails(false);
                                  }}
                                  className="h-[50px] rounded-xl bg-purple text-white w-full"
                                >
                                  Close
                                </button>
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
                                {selectedLeadsDetails?.tags.map(
                                  (tag, index) => {
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
                                          {DelTagLoader &&
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
                                          )}
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        </Box>
                      </Modal>

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
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                            borderRadius: "10px",
                            minWidth: "120px",
                          },
                        }}
                      >
                        <button
                          className="hover:bg-gray-50"
                          onClick={() => {
                            handleAssignLeadToTeammember(myTeamAdmin);
                          }}
                        >
                          <div className="p-2 w-full flex flex-row items-center justify-start gap-2 ">
                            <div className="">
                              {myTeamAdmin?.thumb_profile_image ? (
                                <Image
                                  className="rounded-full"
                                  src={myTeamAdmin.thumb_profile_image}
                                  height={32}
                                  width={32}
                                  alt="*"
                                  style={{
                                    borderRaduis: 50,
                                  }}
                                />
                              ) : (
                                <div
                                  className="h-[32px] w-[32px] bg-black rounded-full flex flex-row items-center justify-center text-white"
                                  onClick={() => handleToggleClick(item.id)}
                                >
                                  {myTeamAdmin?.name.slice(0, 1)}
                                </div>
                              )}
                            </div>
                            <div className="">{myTeamAdmin?.name}</div>
                            <div className="bg-purple text-white text-sm px-2 rounded-full">
                              Admin
                            </div>
                          </div>
                        </button>
                        {myTeam.length > 0 ? (
                          <div>
                            {myTeam.map((item, index) => {
                              return (
                                <div
                                  key={index}
                                  className="p-2 flex flex-col gap-2"
                                  style={{ fontWeight: "500", fontSize: 15 }}
                                >
                                  <button
                                    className="text-start flex flex-row items-center justify-start gap-2 hover:bg-gray-50"
                                    onClick={() => {
                                      handleAssignLeadToTeammember(item);
                                    }}
                                  >
                                    {item?.invitedUser?.thumb_profile_image ? (
                                      <Image
                                        className="rounded-full"
                                        src={
                                          item.invitedUser?.thumb_profile_image
                                        }
                                        height={32}
                                        width={32}
                                        alt="*"
                                        style={{}}
                                      />
                                    ) : (
                                      <div
                                        className="h-[32px] w-[32px] bg-black rounded-full flex flex-row items-center justify-center text-white"
                                        onClick={() =>
                                          handleToggleClick(item.id)
                                        }
                                      >
                                        {item?.name.slice(0, 1)}
                                      </div>
                                    )}
                                    {item.name}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          ""
                        )}
                      </Popover>

                      {/* Code for custom variables */}
                    </div>

                    <div
                      className="w-full flex flex-row items-center justify-between mt-2"
                      style={{
                        ...styles.paragraph,
                        paddingInline: 20,
                      }}
                    >
                      <button
                        className="outline-none p-2 flex flex-row gap-2"
                        style={{
                          borderBottom: showPerplexityDetails
                            ? "2px solid #7902DF"
                            : "",
                          backgroundColor: showPerplexityDetails
                            ? "#7902DF05"
                            : "",
                        }}
                        onClick={() => {
                          setShowPerpelexityDetails(true);
                          setShowKycDetails(false);
                          setShowNotesDetails(false);
                          setShowAcitivityDetails(false);
                        }}
                      >
                        <Image
                          src={
                            showPerplexityDetails
                              ? "/svgIcons/sparklesPurple.svg"
                              : "/svgIcons/sparkles.svg"
                          }
                          width={20}
                          height={20}
                          alt="*"
                        />
                        <div
                          style={{
                            color: showPerplexityDetails ? "#7902DF" : "black",
                          }}
                        >
                          Insights
                        </div>
                      </button>

                      <button
                        className="outline-none p-2 flex flex-row gap-2"
                        style={{
                          borderBottom: showKYCDetails
                            ? "2px solid #7902DF"
                            : "",
                          backgroundColor: showKYCDetails ? "#7902DF05" : "",
                        }}
                        onClick={() => {
                          setShowPerpelexityDetails(false);
                          setShowKycDetails(true);
                          setShowNotesDetails(false);
                          setShowAcitivityDetails(false);
                        }}
                      >
                        <Image
                          src={
                            showKYCDetails
                              ? "/svgIcons/selectedKycIcon.svg"
                              : "/svgIcons/unselectedKycIcon.svg"
                          }
                          width={24}
                          height={24}
                          alt="*"
                        />
                        <div
                          style={{
                            color: showKYCDetails ? "#7902DF" : "black",
                          }}
                        >
                          KYC
                        </div>
                      </button>

                      <button
                        className="outline-none p-2 flex flex-row gap-2"
                        style={{
                          borderBottom: showAcitivityDetails
                            ? "2px solid #7902DF"
                            : "",
                          backgroundColor: showAcitivityDetails
                            ? "#7902DF05"
                            : "",
                        }}
                        onClick={() => {
                          setShowPerpelexityDetails(false);
                          setShowKycDetails(false);
                          setShowNotesDetails(false);
                          setShowAcitivityDetails(true);
                        }}
                      >
                        <Image
                          src={
                            showAcitivityDetails
                              ? "/svgIcons/selectedActivityIcon.svg"
                              : "/svgIcons/unselectedActivityIcon.svg"
                          }
                          width={24}
                          height={24}
                          alt="*"
                        />
                        <div
                          style={{
                            color: showAcitivityDetails ? "#7902DF" : "black",
                          }}
                        >
                          Activity
                        </div>
                      </button>

                      <button
                        className="outline-none p-2 flex flex-row gap-2"
                        style={{
                          borderBottom: showNotesDetails
                            ? "2px solid #7902DF"
                            : "",
                          backgroundColor: showNotesDetails ? "#7902DF05" : "",
                        }}
                        onClick={() => {
                          setShowPerpelexityDetails(false);
                          setShowKycDetails(false);
                          setShowNotesDetails(true);
                          setShowAcitivityDetails(false);
                        }}
                      >
                        <Image
                          src={
                            showNotesDetails
                              ? "/svgIcons/selectedNotesIcon.svg"
                              : "/svgIcons/unselectedNotesIcon.svg"
                          }
                          width={24}
                          height={24}
                          alt="*"
                        />
                        <div
                          style={{
                            color: showNotesDetails ? "#7902DF" : "black",
                          }}
                        >
                          Notes
                        </div>
                      </button>
                    </div>
                    <div
                      className="w-full"
                      style={{ height: "1px", backgroundColor: "#15151530" }}
                    />

                    <div style={{ paddingInline: 0 }}>
                      {showPerplexityDetails &&
                        (selectedLeadsDetails &&
                          selectedLeadsDetails.enrichData ? (
                          <Perplexity
                            selectedLeadsDetails={selectedLeadsDetails}
                          />
                        ) : (
                          <NoPerplexity
                            setshowConfirmPerplexity={setshowConfirmPerplexity}
                            user={userLocalData}
                            handleEnrichLead={handleEnrichLead}
                            loading={loading}
                          />
                        ))}

                      <ConfirmPerplexityModal
                        showConfirmPerplexity={showConfirmPerplexity}
                        setshowConfirmPerplexity={setshowConfirmPerplexity}
                        selectedLeadsDetails={selectedLeadsDetails}
                        handleEnrichLead={handleEnrichLead}
                        loading={loading}
                      />

                      {showKYCDetails && (
                        <div>
                          {selectedLeadsDetails?.kycs.length < 1 ? (
                            <div
                              className="flex flex-col items-center justify-center w-full mt-12"
                              style={{ fontWeight: "500", fontsize: 15 }}
                            >
                              <div className="h-[51px] w-[52px] rounded-full bg-[#00000020] flex flex-row items-center justify-center">
                                <Image
                                  src={"/assets/FAQ.png"}
                                  height={24}
                                  width={24}
                                  alt="*"
                                />
                              </div>
                              <div className="mt-4">
                                <i style={{ fontWeight: "500", fontsize: 15 }}>
                                  KYC Data collected from calls will be shown
                                  here
                                </i>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full mt-4 pb-12">
                              {selectedLeadsDetails?.kycs.map((item, index) => {
                                return (
                                  <div
                                    className="w-full flex flex-row gap-2 mt-2"
                                    key={index}
                                  >
                                    <div
                                      className="h-full"
                                      style={{
                                        width: "2px",
                                        backgroundColor: "red",
                                      }}
                                    ></div>
                                    <div className="h-full w-full">
                                      {/* <div className='mt-4' style={{ fontWeight: "600", fontSize: 15 }}>
                                            Outcome | <span style={{ fontWeight: "600", fontSize: 12 }} className='text-purple'>
                                                {selectedLeadsDetails?.firstName} {selectedLeadsDetails?.lastName}
                                            </span>
                                        </div> */}
                                      <div
                                        className="mt-4"
                                        style={
                                          {
                                            // border: "1px solid #00000020", padding: 10, borderRadius: 15
                                          }
                                        }
                                      >
                                        <div
                                          style={{
                                            fontWeight: "500",
                                            fontSize: 15,
                                          }}
                                        >
                                          {item.question}
                                        </div>
                                        <div
                                          className="mt-1"
                                          style={{
                                            fontWeight: "500",
                                            fontSize: 13,
                                            color: "#00000060",
                                          }}
                                        >
                                          {item.answer}
                                        </div>
                                      </div>
                                      <div></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notes go here */}
                      {showNotesDetails && (
                        <div>
                          {noteDetails?.length < 1 ? (
                            <div
                              className="flex flex-col items-center justify-center w-full mt-12"
                              style={{ fontWeight: "500", fontsize: 15 }}
                            >
                              <div className="h-[52px] w-[52px] rounded-full bg-[#00000020] flex flex-row items-center justify-center">
                                <Image
                                  src={"/assets/notes.png"}
                                  height={24}
                                  width={24}
                                  alt="*"
                                />
                              </div>
                              <div className="mt-4">
                                <i style={{ fontWeight: "500", fontsize: 15 }}>
                                  You can add and manage your notes here
                                </i>
                              </div>
                              <button
                                className="flex flex-row items-center gap-1 mt-2"
                                onClick={() => {
                                  setShowAddNotes(true);
                                }}
                              >
                                <Plus size={17} color="#7902DF" weight="bold" />
                                <div className="text-purple">Add Notes</div>
                              </button>
                            </div>
                          ) : (
                            <div className="">
                              <div
                                className=""
                                style={{ scrollbarWidth: "none" }}
                              >
                                {noteDetails.map((item, index) => {
                                  return (
                                    <div
                                      key={index}
                                      className="border rounded-xl p-4 mb-4 mt-4"
                                      style={{ border: "1px solid #00000020" }}
                                    >
                                      <div
                                        style={{
                                          fontWeight: "500",
                                          color: "#15151560",
                                          fontsize: 12,
                                        }}
                                      >
                                        {GetFormattedDateString(
                                          item?.createdAt
                                        )}
                                      </div>
                                      <div
                                        className="mt-4"
                                        style={{
                                          fontWeight: "500",
                                          color: "#151515",
                                          fontsize: 15,
                                        }}
                                      >
                                        {item.note}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div
                                className="flex flex-col items-start justify-start w-full pb-6"
                                style={{ fontWeight: "500", fontsize: 15 }}
                              >
                                <button
                                  className="flex flex-row items-center gap-1 mt-2"
                                  onClick={() => {
                                    setShowAddNotes(true);
                                  }}
                                >
                                  <Plus
                                    size={17}
                                    color="#7902DF"
                                    weight="bold"
                                  />
                                  <div className="text-purple">Add Notes</div>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Call activity goes here */}
                      {showAcitivityDetails && (
                        <div>
                          {selectedLeadsDetails?.callActivity.length < 1 ? (
                            <div
                              className="flex flex-col items-center justify-center mt-12 w-full"
                              style={{ fontWeight: "500", fontsize: 15 }}
                            >
                              <div className="h-[52px] w-[52px] rounded-full bg-[#00000020] flex flex-row items-center justify-center">
                                <Image
                                  src={"/assets/activityClock.png"}
                                  height={24}
                                  width={24}
                                  alt="*"
                                />
                              </div>
                              <div className="mt-4">
                                <i style={{ fontWeight: "500", fontsize: 15 }}>
                                  All activities related to this lead will be
                                  shown here
                                </i>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {selectedLeadsDetails?.callActivity.map(
                                (item, index) => {
                                  const initialTextLength = Math.ceil(
                                    item.transcript?.length * 0.1
                                  ); // 40% of the text
                                  const initialText = item.transcript?.slice(
                                    0,
                                    initialTextLength
                                  );
                                  return (
                                    <div key={index}>
                                      {item.status === "voicemail" ||
                                        item.callOutcome === "Voicemail" ? (
                                        <div>
                                          {item.voicemail ? (
                                            <div>
                                              {item.voicemailsent ? (
                                                <NoVoicemailView
                                                  showAddBtn={false}
                                                  title={"Voicemail Delivered"}
                                                  subtitle={
                                                    "Delivered during the first missed call"
                                                  }
                                                />
                                              ) : (
                                                <NoVoicemailView
                                                  showAddBtn={false}
                                                  title={
                                                    "Not able to Leave a Voicemail"
                                                  }
                                                  subtitle={
                                                    "The phone was either a landline or has a full voicemail"
                                                  }
                                                />
                                              )}
                                            </div>
                                          ) : (
                                            <NoVoicemailView
                                              showAddBtn={false}
                                            />
                                          )}
                                        </div>
                                      ) : (
                                        <div className="mt-4">
                                          <div
                                            className="-ms-4"
                                            style={{
                                              fontsize: 15,
                                              fontWeight: "500",
                                              color: "#15151560",
                                            }}
                                          >
                                            {GetFormattedDateString(
                                              item?.createdAt,
                                              true
                                            )}
                                          </div>
                                          <div className="w-full flex flex-row items-center gap-2 h-full">
                                            <div
                                              className="pb-4 pt-6 ps-4 w-full"
                                              style={{
                                                borderLeft:
                                                  "1px solid #00000020",
                                              }}
                                            >
                                              <div className="h-full w-full">
                                                <div className="flex flex-row items-center justify-between">
                                                  <div className="flex flex-row items-center gap-1">
                                                    <div
                                                      style={{
                                                        fontWeight: "600",
                                                        fontsize: 15,
                                                      }}
                                                    >
                                                      Outcome
                                                    </div>
                                                    {/* <div className='text-purple' style={{ fontWeight: "600", fontsize: 12 }}>
                                                                                                        {selectedLeadsDetails?.firstName} {selectedLeadsDetails?.lastName}
                                                                                                    </div> */}
                                                  </div>
                                                  <button
                                                    className="text-end flex flex-row items-center gap-1"
                                                    style={styles.paragraph}
                                                    onClick={() => {
                                                      handleShowMoreActivityData(
                                                        item
                                                      );
                                                    }}
                                                  >
                                                    <div
                                                      className="h-[10px] w-[10px] rounded-full"
                                                      style={{
                                                        backgroundColor:
                                                          selectedLeadsDetails
                                                            ?.stage
                                                            ?.defaultColor,
                                                      }}
                                                    ></div>
                                                    {item?.callOutcome
                                                      ? item?.callOutcome
                                                      : "Ongoing"}
                                                    {/* {checkCallStatus(item)} */}
                                                    <div>
                                                      {isExpandedActivity.includes(
                                                        item.id
                                                      ) ? (
                                                        <div>
                                                          <CaretUp
                                                            size={17}
                                                            weight="bold"
                                                          />
                                                        </div>
                                                      ) : (
                                                        <div>
                                                          <CaretDown
                                                            size={17}
                                                            weight="bold"
                                                          />
                                                        </div>
                                                      )}
                                                    </div>
                                                  </button>
                                                </div>
                                                {isExpandedActivity.includes(
                                                  item.id
                                                ) && (
                                                    <div
                                                      className="mt-6"
                                                      style={{
                                                        border:
                                                          "1px solid #00000020",
                                                        borderRadius: "10px",
                                                        padding: 10,
                                                        paddingInline: 15,
                                                      }}
                                                    >
                                                      <div
                                                        className="mt-4"
                                                        style={{
                                                          fontWeight: "500",
                                                          fontSize: 12,
                                                          color: "#00000070",
                                                        }}
                                                      >
                                                        Transcript
                                                      </div>
                                                      <div className="flex flex-row items-center justify-between mt-4">
                                                        <div
                                                          style={{
                                                            fontWeight: "500",
                                                            fontSize: 15,
                                                          }}
                                                        >
                                                          {moment(
                                                            item?.duration * 1000
                                                          ).format("mm:ss")}{" "}
                                                        </div>
                                                        <button
                                                          onClick={() => {
                                                            if (
                                                              item?.recordingUrl
                                                            ) {
                                                              setShowAudioPlay(
                                                                item?.recordingUrl
                                                              );
                                                            } else {
                                                              setShowNoAudioPlay(
                                                                true
                                                              );
                                                            }
                                                            // window.open(item.recordingUrl, "_blank")
                                                          }}
                                                        >
                                                          <Image
                                                            src={
                                                              "/assets/play.png"
                                                            }
                                                            height={35}
                                                            width={35}
                                                            alt="*"
                                                          />
                                                        </button>
                                                      </div>
                                                      {item.transcript ? (
                                                        <div className="w-full">
                                                          <div
                                                            className="mt-4"
                                                            style={{
                                                              fontWeight: "600",
                                                              fontSize: 15,
                                                            }}
                                                          >
                                                            {/* {item.transcript} */}
                                                            {`${initialText}...`}
                                                            {/* {isExpanded.includes(
                                                        item.id
                                                      )
                                                        ? `${item.transcript}`
                                                        : `${initialText}...`} */}
                                                          </div>
                                                          <button
                                                            style={{
                                                              fontWeight: "600",
                                                              fontSize: 15,
                                                            }}
                                                            onClick={() => {
                                                              handleReadMoreToggle(
                                                                item
                                                              );
                                                            }}
                                                            className="mt-2 text-black underline"
                                                          >
                                                            {
                                                              // isExpanded.includes(
                                                              //   item.id
                                                              // )
                                                              //   ? "Read Less"
                                                              // :
                                                              "Read more"
                                                            }
                                                          </button>
                                                        </div>
                                                      ) : (
                                                        <div
                                                          style={{
                                                            fontWeight: "600",
                                                            fontSize: 15,
                                                          }}
                                                        >
                                                          No transcript
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        bottom: 20,
                        right: 20,
                      }}
                    >
                      <div>
                        {!hideDelete && (
                          <button
                            className="flex flex-row gap-2 items-center"
                            onClick={() => {
                              // handleDeleteLead()

                              setShowDelModal(true);
                            }}
                            style={{
                              marginTop: 20,
                              alignSelf: "end",
                            }}
                          >
                            <Image
                              src={"/otherAssets/redDeleteIcon.png"}
                              height={24}
                              width={24}
                              alt="del"
                              style={{
                                filter:
                                  "brightness(0) saturate(100%) opacity(0.5)", // Convert to black and make semi-transparent
                              }}
                            />

                            <div
                              style={{
                                fontSize: 15,
                                fontWeight: "600",
                                color: "#15151590",
                                textDecorationLine: "underline",
                              }}
                            >
                              Delete
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Show Transcript UI Modal*/}

            <Modal
              open={isExpanded}
              onClose={() => setIsExpanded(null)}
              closeAfterTransition
              BackdropProps={{
                timeout: 1000,
                sx: {
                  backgroundColor: "#00000020",
                },
              }}
            >
              <Box
                className="lg:w-4/12 sm:w-4/12 w-6/12"
                sx={styles.modalsStyle}
              >
                <div className="flex flex-row justify-center w-full">
                  <div
                    className="w-full"
                    style={{
                      backgroundColor: "#ffffff",
                      padding: 20,
                      borderRadius: "13px",
                    }}
                  >
                    <div className="w-full flex flex-row items-center justify-between">
                      <div className="font-bold text-xl mt-4 mb-4">
                        Call Transcript
                      </div>
                      <div>
                        <button
                          className="font-bold outline-none border-none"
                          onClick={() => setIsExpanded(null)}
                        >
                          <CloseIcon />
                        </button>
                      </div>
                    </div>
                    <TranscriptViewer
                      transcript={isExpanded?.messageTranscript || []}
                    />
                  </div>
                </div>
              </Box>
            </Modal>
            {/* delete lead modal */}

            <Modal
              open={showDelModal}
              onClose={() => setShowDelModal(false)}
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
                className="lg:w-4/12 sm:w-4/12 w-6/12"
                sx={styles.modalsStyle}
              >
                <div className="flex flex-row justify-center w-full">
                  <div
                    className="w-full"
                    style={{
                      backgroundColor: "#ffffff",
                      padding: 20,
                      borderRadius: "13px",
                    }}
                  >
                    <div className="font-bold text-xl mt-6">
                      Are you sure you want to delete this lead
                    </div>
                    <div className="flex flex-row items-center gap-4 w-full mt-6 mb-6">
                      <button
                        className="w-1/2 font-bold text-xl border border-[#00000020] rounded-xl h-[50px]"
                        onClick={() => {
                          setShowDelModal(false);
                        }}
                      >
                        Cancel
                      </button>
                      {delLeadLoader ? (
                        <CircularProgress size={20} />
                      ) : (
                        <button
                          className="w-1/2 text-red font-bold text-xl border border-[#00000020] rounded-xl h-[50px]"
                          onClick={async () => {
                            await handleDeleteLead(selectedLeadsDetails);
                            //  setShowDelModal(false)
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Box>
            </Modal>
          </div>
        </div>
      </Drawer>

      {/* Modal to add notes */}

      <Modal
        open={showAddNotes}
        onClose={() => setShowAddNotes(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: "#00000020",
          },
        }}
      >
        <Box
          className="sm:w-5/12 lg:w-5/12 xl:w-4/12 w-8/12 h-[70vh]"
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

      {/* Warning Modal for no voice */}
      <Modal
        open={showNoAudioPlay}
        onClose={() => setShowNoAudioPlay(false)}
        closeAfterTransition
        BackdropProps={{
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(5px)",
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

      {/* Modal for audio play */}
      <Modal
        open={showAudioPlay}
        onClose={() => setShowAudioPlay(null)}
        closeAfterTransition
        BackdropProps={{
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(5px)",
          },
        }}
      >
        <Box className="lg:w-3/12 sm:w-5/12 w-3/12" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center">
            <div
              className="w-full flex flex-col items-center"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
              }}
            >
              {/* <Player
                trackList={[
                  {
                    url: showAudioPlay,
                    title: "Call recording",
                    tags: [],
                  },
                ]}
                includeSearch={false}
                showPlaylist={false}
                sortTracks={false}
              /> */}
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
    </div>
  );
};

export default LeadDetails;
