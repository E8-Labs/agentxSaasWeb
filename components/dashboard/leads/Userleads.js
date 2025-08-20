"use client";
import Apis from "@/components/apis/Apis";
import {
  Alert,
  Box,
  CircularProgress,
  Fade,
  FormControl,
  MenuItem,
  Modal,
  Popover,
  Select,
  Snackbar,
  TextareaAutosize,
} from "@mui/material";
import {
  CalendarDots,
  CaretDown,
  CaretUp,
  Cross,
  DotsThree,
  EnvelopeSimple,
  Plus,
  X,
} from "@phosphor-icons/react";
import axios from "axios";
import { filter, first } from "draft-js/lib/DefaultDraftBlockRenderMap";
import moment from "moment";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import AssignLead from "./AssignLead";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Import default styles
// import "./CalendarOverrides.css";
import "../../calls/CalendarOverrides.css";
import CalendarInput from "@/components/test/DatePicker";
import parsePhoneNumberFromString from "libphonenumber-js";
import InfiniteScroll from "react-infinite-scroll-component";
import LeadDetails from "./extras/LeadDetails";
import getProfileDetails from "@/components/apis/GetProfile";
import NotficationsDrawer from "@/components/notofications/NotficationsDrawer";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "./AgentSelectSnackMessage";
import { GetFormattedDateString } from "@/utilities/utility";
import { useRouter, useSearchParams } from "next/navigation";
import { fromJSON } from "postcss";
import LeadLoading from "./LeadLoading";
import { pipeline } from "zod";
import AssignLeadAnimation from "./assignLeadSlideAnimation/AssignLeadAnimation";
import DashboardSlider from "@/components/animations/DashboardSlider";
import { userLocalData } from "@/components/agency/plan/AuthDetails";

const Userleads = ({
  handleShowAddLeadModal,
  handleShowUserLeads,
  newListAdded,
  shouldSet,
  setSetData,
}) => {
  const LimitPerPage = 30;
  const bottomRef = useRef(null);

  //Sheet Caching related
  let sheetIndexSelected = useRef(0);
  let searchParams = useSearchParams();
  const router = useRouter();

  //user local data
  const [userLocalDetails, setUserLocalDetails] = useState(null);
  const [snackMessage, setSnackMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [showsnackMessage, setShowSnackMessage] = useState(false);

  const [initialLoader, setInitialLoader] = useState(false);
  const [SheetsList, setSheetsList] = useState([]);
  const [currentSheet, setCurrentSheet] = useState(null);
  const [sheetsLoader, setSheetsLoader] = useState(false);
  const [LeadsList, setLeadsList] = useState([]);
  const [searchLead, setSearchLead] = useState("");
  const [FilterLeads, setFilterLeads] = useState([]);
  const [leadColumns, setLeadColumns] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [SelectedSheetId, setSelectedSheetId] = useState(null);
  const [selectedLeadsList, setSelectedLeadsList] = useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [AssignLeadModal, setAssignLeadModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showAddNewSheetModal, setShowAddNewSheetModal] = useState(false);

  //nedd help popup
  const [needHelp, setNeedHelp] = useState(false);

  const requestVersion = useRef(0);

  const [filtersSelected, setFiltersSelected] = useState([]);

  const [noStageSelected, setNoStageSelected] = useState(false);

  const fromCalendarRef = useRef(null);
  const toCalendarRef = useRef(null);

  useEffect(() => {
    //console.log;
  }, [FilterLeads]);

  useEffect(() => {
    //console.log;
  }, [totalLeads]);
  /*
 
  [
    {
        key: date,
        values: ["date or value"]
    },
   
    {
        key: stage,
        values: ["stageId"]
    },
    {
        key: pipeline,
        values: ["pipeline"]
    },
    {
        key: status,
        values: ["status"]
    }
  ]
 
  */

  const [LeadsInSheet, setLeadsInSheet] = useState({});

  const [AllLeads, setAllLeads] = useState({});

  //code for pagination variables
  const [hasMore, setHasMore] = useState(true);
  const [moreLeadsLoader, setMoreLeadsLoader] = useState(false);

  //code for delete smart list popover
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [delSmartListLoader, setDelSmartListLoader] = useState(false);
  const [selectedSmartList, setSelectedSmartList] = useState(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  //code for passing columns
  const [Columns, setColumns] = useState(null);

  //code for array input fields
  const [inputs, setInputs] = useState([
    { id: 1, value: "First Name" },
    { id: 2, value: "Last Name" },
    { id: 3, value: "Phone Number" },
    { id: 4, value: "" },
    { id: 5, value: "" },
    { id: 6, value: "" },
  ]);
  //
  const [showaddCreateListLoader, setShowaddCreateListLoader] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");

  //render status
  const isFirstRender = useRef(true);

  //err msg when no leaad in list
  const [showNoLeadErr, setShowNoLeadErr] = useState(null);
  const [showNoLeadsLabel, setShowNoLeadsLabel] = useState(false);

  //code for showing leads details
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLeadsDetails, setSelectedLeadsDetails] = useState(null);

  //code for call activity transcript text
  const [isExpanded, setIsExpanded] = useState([]);
  const [isExpandedActivity, setIsExpandedActivity] = useState([]);

  // console.log("pipelineId is",selectedLeadsDetails)

  //to date filter
  // const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedToDate, setSelectedToDate] = useState(null);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [stagesList, setStagesList] = useState([]);
  const [stagesLoader, setStagesLoader] = useState(false);
  const [selectedStage, setSelectedStage] = useState([]);

  //code for buttons of details popup
  const [showKYCDetails, setShowKycDetails] = useState(true);
  const [showNotesDetails, setShowNotesDetails] = useState(false);
  const [showAcitivityDetails, setShowAcitivityDetails] = useState(false);

  //code for add stage notes
  const [showAddNotes, setShowAddNotes] = useState(false);
  const [addNotesValue, setddNotesValue] = useState("");
  const [noteDetails, setNoteDetails] = useState([]);
  const [addLeadNoteLoader, setAddLeadNoteLoader] = useState(false);

  //code for deltag loader
  const [DelTagLoader, setDelTagLoader] = useState(null);

  //code for pipelines api
  const [pipelinesList, setPipelinesList] = useState([]);

  //pipelines dropdown
  // const [selectedPipeline, setSelectedPipeline] = useState("");
  const [selectedPipeline, setSelectedPipeline] = useState("");
  const filterRef = useRef(null);

  const handleChange = (event) => {
    const selectedValue = event.target.value;

    setSelectedPipeline(event.target.value);

    const selectedItem = pipelinesList.find(
      (item) => item.title === selectedValue
    );

    // console.log("Stages list is", selectedItem.stages);

    setStagesList(selectedItem.stages);
  };

  useEffect(() => {

    //check the render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (filterRef.current) {
      clearTimeout(filterRef.current);
    }
    filterRef.current = setTimeout(() => {
      //console.log;
      if (SelectedSheetId) {
        setHasMore(true);
        setFilterLeads([]);
        setLeadsList([]);
        let filterText = getFilterText();
        //console.log;
        handleFilterLeads(0, filterText);
        setShowNoLeadsLabel(false);
      }
    }, 400);
  }, [searchLead]);

  useEffect(() => {
    // getLeads();
    const localPipelines = localStorage.getItem("pipelinesList");
    if (localPipelines) {
      const Data = JSON.parse(localPipelines);
      setPipelinesList(Data);
    }
    getProfile();
    getPipelines();
    getSheets();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showFromDatePicker &&
        fromCalendarRef.current &&
        !fromCalendarRef.current.contains(event.target)
      ) {
        setShowFromDatePicker(false);
      }

      if (
        showToDatePicker &&
        toCalendarRef.current &&
        !toCalendarRef.current.contains(event.target)
      ) {
        setShowToDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFromDatePicker, showToDatePicker]);

  useEffect(() => {
    if (shouldSet === true) {
      //////console.log;
      let sheets = [];
      let found = false;
      SheetsList.map((sheet, index) => {
        if (sheet.id == newListAdded.id) {
          // //console.log;
          found = true;
        }
        sheets.push(sheet);
      });
      if (!found) {
        // //console.log;
        sheets.push(newListAdded);
      }
      setSelectedSheetId(newListAdded.id); // setSelectedSheetId(item.id);
      setSheetsList(sheets);
      setSetData(false);
    }
  }, [shouldSet]);

  useEffect(() => {
    //////console.log;
    //////console.log;
  }, [LeadsList, FilterLeads]);

  //code to scroll to the bottom
  useEffect(() => {
    // Scroll to the bottom when inputs change
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [inputs]);

  useEffect(() => {
    // Scroll to the bottom when inputs change
    setFilterLeads([]);
    setLeadsList([]);
    // console.log("Hello here");
    // return;
    let filterText = getFilterText();

    // //console.log;
    handleFilterLeads(0, filterText);
    setShowNoLeadsLabel(false);
  }, [filtersSelected, SelectedSheetId]);

  //Caching & refresh logic
  useEffect(() => {
    const sheet = searchParams.get("sheet"); // Get the value of 'tab'
    let number = Number(sheet) || 0;
    //console.log;
    sheetIndexSelected = number;
    // if (!sheet) {
    setParamsInSearchBar(number);
    // }
  }, []);
  const setParamsInSearchBar = (index = 1) => {
    // Create a new URLSearchParams object to modify
    const params = new URLSearchParams(searchParams.toString());
    params.set("sheet", index); // Set or update the 'tab' parameter

    // Push the updated URL
    router.push(`/dashboard/leads?${params.toString()}`);

    // //console.log;
  };

  function SetSheetsToLocalStorage(data) {
    localStorage.setItem("sheets", JSON.stringify(data));
  }

  function GetAndSetDataFromLocalStorage() {
    let d = localStorage.getItem("sheets");
    if (d) {
      // //console.log;
      let data = JSON.parse(d);
      let ind = 0;
      if (sheetIndexSelected < data.length) {
        ind = sheetIndexSelected;
      }
      setSheetsList(data);
      setCurrentSheet(data[ind]);
      setSelectedSheetId(data[ind].id);
      setParamsInSearchBar(ind);
      return true; //
    } else {
      // //console.log;
      return false;
    }
  }

  //code for get profile function
  const getProfile = async () => {
    try {

      const LocalData = userLocalData();
      setUserLocalDetails(LocalData);

      await getProfileDetails();

      const Data = localStorage.getItem("User");
      if (Data) {
        const localData = JSON.parse(Data);
        setUserLocalDetails(localData.user);
      }
    } catch (error) {
      // console.error("Error occured in api is error", error);
    }
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

  //function to delete lead
  const handleDeleteLead = async (delLead) => {
    //////console.log;
    setShowDetailsModal(false);
    let filtered = LeadsList.filter((lead) => lead.id !== delLead.id);
    //////console.log;
    // return
    localStorage.setItem(`Leads${SelectedSheetId}`, JSON.stringify(filtered));
    setLeadsList(filtered);
    setFilterLeads(filtered);
  };

  //function to format the number
  const formatPhoneNumber = (rawNumber) => {
    const phoneNumber = parsePhoneNumberFromString(
      rawNumber?.startsWith("+") ? rawNumber : `+${rawNumber}`
    );
    // //////console.log;
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
        ////console.log(
        //   "Status is completed with the following additional information:"
        // );
        if (item.hotlead === true) {
          //////console.log;
          callStatus = "Hot Lead";
        }
        if (item.humancalldrop === true) {
          //////console.log;
          callStatus = "Human Call Drop";
        }
        if (item.dnd === true) {
          //////console.log;
          callStatus = "DND";
        }
        if (item.notinterested) {
          //////console.log;
          callStatus = "Not Interested";
        }
      } else {
        callStatus = item.status;
        ////console.log(
        //   "Status is completed, but no special flags for lead ID:",
        //   item.leadId
        // );
      }
    } else {
      ////console.log(
      //     "Other status for lead ID:",
      //     item.leadId,
      //     "Status:",
      //     item.status
      //   );
      callStatus = item.status;
    }
    // });
    return callStatus;
  };

  //code for del tag api
  const handleDelTag = async (tag) => {
    try {
      setDelTagLoader(tag);

      let AuthToken = null;

      const userData = localStorage.getItem("User");
      if (userData) {
        const localData = JSON.parse(userData);
        AuthToken = localData.token;
      }

      //////console.log;

      const ApiData = {
        tag: tag,
      };

      const ApiPath = Apis.delLeadTag;
      //////console.log;
      //////console.log;

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        //////console.log;
        if (response.data.status === true) {
          //////console.log;

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

  // const checkCallStatus = () => {
  //     let displayValue = "";

  //     selectedLeadsDetails.callActivity.forEach((item) => {
  //         if (item.status === "completed") {
  //             if (item.hotlead) {
  //                 displayValue = item.hotlead;
  //             } else if (item.humancalldrop) {
  //                 displayValue = item.humancalldrop;
  //             } else if (item.dnd) {
  //                 displayValue = item.dnd;
  //             } else {
  //                 displayValue = "Completed with no special flags";
  //             }
  //         } else if (item.status === "busy") {
  //             displayValue = item.status;
  //         } else {
  //             displayValue = `Other Status: ${item.status}`;
  //         }
  //     });

  //     return displayValue;
  // };

  //function to select the stage for filters

  function isStageSelected(item) {
    let found = -1;
    for (let i = 0; i < selectedStage.length; i++) {
      if (selectedStage[i].id == item.id) {
        found = i;
      } else {
        // stages.push(selectedStage[i]);
      }
    }

    return found;
  }
  const handleSelectStage = (item) => {
    setSelectedStage((prevStages) => {
      const isSelected = prevStages.some((s) => s.id === item.id);
      return isSelected
        ? prevStages.filter((s) => s.id !== item.id)
        : [...prevStages, item];
    });
  };

  //function for del smartlist stage popover

  const handleShowPopup = (event, item) => {
    setAnchorEl(event.currentTarget);
    //////console.log;
    setSelectedSmartList(item);
  };

  const handleClosePopup = () => {
    setAnchorEl(null);
  };

  //function to delete smart list
  const handleDeleteSmartList = async () => {
    try {
      setDelSmartListLoader(true);

      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      //////console.log;

      const ApiData = {
        sheetId: selectedSmartList.id,
      };

      // //console.log;

      const ApiPath = Apis.delSmartList;
      // //console.log;
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
        },
      });

      if (response) {
        //////console.log;
        if (response.data.status === true) {
          setSheetsList((prevSheetsList) =>
            prevSheetsList.filter((sheet) => sheet.id !== selectedSmartList.id)
          );
          setSelectedLeadsList([]);
          setFilterLeads([]);
          setLeadsList([]);
          setShowNoLeadsLabel(true);
          handleClosePopup();
        }
      }
    } catch (error) {
      // console.error("ERror occured in del smart list api is:", error);
    } finally {
      setDelSmartListLoader(false);
    }
  };

  // function to handle select data change
  const handleFromDateChange = (date) => {
    setSelectedFromDate(date); // Set the selected date
    setShowFromDatePicker(false);
  };

  const handleToDateChange = (date) => {
    setSelectedToDate(date); // Set the selected date
    setShowToDatePicker(false);
  };

  function getFilterText() {
    //fromDate=${formtFromDate}&toDate=${formtToDate}&stageIds=${stages}&offset=${offset}
    let string = `sheetId=${SelectedSheetId}`;
    if (filtersSelected.length == 0) {
      if (searchLead && searchLead.length > 0) {
        string = `${string}&search=${searchLead}`;
      }
      return string;
    }

    let stageIds = "";
    let stageSeparator = "";
    filtersSelected.map((filter) => {
      if (filter.key == "date") {
        const formtFromDate = moment(filter.values[0]).format("MM/DD/YYYY");
        const formtToDate = moment(filter.values[1]).format("MM/DD/YYYY");
        string = `${string}&fromDate=${formtFromDate}&toDate=${formtToDate}`;
      }
      if (filter.key == "stage") {
        stageIds = `${stageIds}${stageSeparator}${filter.values[0].id}`;
        stageSeparator = ",";
      }
      if (filter.key == "pipeline") {
        // string = `${string}&pipelineId=${selectedPipeline}`
        // stageSeparator = ","
      }
    });
    if (searchLead && searchLead.length > 0) {
      string = `${string}&search=${searchLead}`;
    }
    // string = `${string}&stageIds=${stageIds}`;
    if (stageIds.length > 0) {
      string = `${string}&stageIds=${stageIds}`;
    }

    return string;
  }

  function getFiltersObject() {
    //fromDate=${formtFromDate}&toDate=${formtToDate}&stageIds=${stages}&offset=${offset}
    let filters = {};
    let string = `sheetId=${SelectedSheetId}`;
    if (SelectedSheetId) {
      filters["sheetId"] = SelectedSheetId;
    }
    // if (filtersSelected.length == 0) {
    if (searchLead && searchLead.length > 0) {
      string = `${string}&search=${searchLead}`;
      filters["search"] = searchLead;
    }
    // return string;
    // }

    let stageIds = "";
    let stageSeparator = "";
    filtersSelected.map((filter) => {
      if (filter.key == "date") {
        const formtFromDate = moment(filter.values[0]).format("MM/DD/YYYY");
        const formtToDate = moment(filter.values[1]).format("MM/DD/YYYY");
        // string = `${string}&fromDate=${formtFromDate}&toDate=${formtToDate}`;
        filters["fromDate"] = formtFromDate;
        filters["toDate"] = formtToDate;
      }
      if (filter.key == "stage") {
        stageIds = `${stageIds}${stageSeparator}${filter.values[0].id}`;
        stageSeparator = ",";
      }
      if (filter.key == "pipeline") {
        // string = `${string}&pipelineId=${selectedPipeline}`
        // stageSeparator = ","
      }
    });
    // if (searchLead && searchLead.length > 0) {
    // string = `${string}&search=${searchLead}`;
    // }
    // string = `${string}&stageIds=${stageIds}`;
    if (stageIds.length > 0) {
      // string = `${string}&stageIds=${stageIds}`;
      filters["stageIds"] = stageIds;
    }

    return filters;
  }

  function getLocallyCachedLeads() {
    // return;
    // //console.log;
    const id = SelectedSheetId;
    //Set leads in cache
    let leadsData = LeadsInSheet[SelectedSheetId] || null;
    // //console.log;
    if (!leadsData) {
      // //console.log;
      let d = localStorage.getItem(`Leads${SelectedSheetId}`);
      if (d) {
        leadsData = JSON.parse(d);
        // //console.log;
      }
    }
    // //console.log;
    let leads = leadsData?.data || [];
    let leadColumns = leadsData?.columns || [];
    // setSelectedSheetId(item.id);
    // setLeadsList([]);
    // setFilterLeads([]);
    if (leads && leads.length > 0 && leadColumns && leadColumns.length > 0) {
      // //console.log;
      setLeadsList((prevDetails) => [...prevDetails, ...leads]);
      setFilterLeads((prevDetails) => [...prevDetails, ...leads]);
      let dynamicColumns = [];
      if (leads.length > 0) {
        dynamicColumns = [
          ...leadColumns,
          // { title: "Tag" },
          {
            title: "More",
            idDefault: false,
          },
        ];
      }
      // setLeadColumns(response.data.columns);
      // //console.log;
      setLeadColumns(dynamicColumns);
      // return
    } else {
      // //console.log;
    }
  }

  //function for filtering leads
  const handleFilterLeads = async (offset = 0, filterText = null) => {
    //fromDate=${formtFromDate}&toDate=${formtToDate}&stageIds=${stages}&offset=${offset}
    const currentRequestVersion = ++requestVersion.current;
    try {
      setMoreLeadsLoader(true);

      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      //////console.log;
      //   const formtFromDate = moment(selectedFromDate).format("MM/DD/YYYY");
      //   const formtToDate = moment(selectedToDate).format("MM/DD/YYYY");
      //////console.log;

      //   const id = currentSheet.id;
      //   let stageIds = selectedStage.map((stage) => stage.id);
      //   const stages = stageIds.join(",");
      //   //////console.log;
      let ApiPath = null;
      if (filterText) {
        //console.log;
        ApiPath = `${Apis.getLeads}?${filterText}`; //&fromDate=${formtFromDate}&toDate=${formtToDate}&stageIds=${stages}&offset=${offset}`;
        ApiPath = ApiPath + "&noStage=" + noStageSelected;
        ApiPath = ApiPath + `&offset=${offset}`;
      } else {
        if (offset == 0) {
          getLocallyCachedLeads();
        }
        ApiPath = `${Apis.getLeads}?sheetId=${SelectedSheetId}&offset=${offset}`;
      }
      //console.log;

      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          // "Content-Type": "application/json"
        },
      });

      if (response) {
        // console.log(
        //   "Response of get leads filter api is api is :",
        //   response.data
        // );
        if (currentRequestVersion === requestVersion.current) {
          if (response.data.status === true) {
            setShowFilterModal(false);
            setTotalLeads(response.data.leadCount);
            // setLeadsList(response.data.data);
            // setFilterLeads(response.data.data);
            let allLeads;

            setShowFilterModal(false);
            //   setShowNoLeadErr("No leads found");

            const data = response.data.data;
            if (offset == 0) {
              let sheetId = null;
              if (data.length > 0) {
                sheetId = data[0].sheetId;
                setShowNoLeadsLabel(null);
              } else {
                setShowNoLeadsLabel(true);
              }

              if (sheetId == SelectedSheetId) {
                LeadsInSheet[SelectedSheetId] = response.data;
                localStorage.setItem(
                  `Leads${SelectedSheetId}`,
                  JSON.stringify(response.data)
                );
                setLeadsList(data);
                setFilterLeads(data);
              }

              let leads = data;
              let leadColumns = response.data.columns;
              //   setSelectedSheetId(item.id);
              //   setLeadsList([]);
              //   setFilterLeads([]);
              if (leads && leadColumns) {
                // //////console.log
                // setLeadsList((prevDetails) => [...prevDetails, ...leads]);
                // setFilterLeads((prevDetails) => [...prevDetails, ...leads]);
                let dynamicColumns = [];
                if (leads.length > 0) {
                  dynamicColumns = [
                    ...leadColumns,
                    // { title: "Tag" },
                    {
                      title: "More",
                      idDefault: false,
                    },
                  ];
                }
                // setLeadColumns(response.data.columns);
                setLeadColumns(dynamicColumns);
                // return
              } else {
                //////console.log;
              }
            } else {
              setShowNoLeadsLabel(false);
              setLeadsList((prevDetails) => [...prevDetails, ...data]);
              setFilterLeads((prevDetails) => [...prevDetails, ...data]);
            }

            if (data.length < LimitPerPage) {
              setHasMore(false);
            } else {
              setHasMore(true);
              // handleFilterLeads(offset + 30, filterText);
            }
          } else {
            // //console.log;
          }
        }
      }
    } catch (error) {
      // console.error("Error occured in api is :", error);
    } finally {
      setMoreLeadsLoader(false);
      setSheetsLoader(false);
      //////console.log;
    }
  };

  //function for getting the leads
  // const getLeads = async (item, offset = 0, oldSheet) => {
  //   try {
  //     setSheetsLoader(true);
  //     const id = item.id;
  //     //Set leads in cache
  //     let leadsData = LeadsInSheet[id] || null;
  //     if (!leadsData) {
  //       //////console.log;
  //       let d = localStorage.getItem(`Leads${id}`);
  //       if (d) {
  //         //////console.log;
  //         leadsData = JSON.parse(d);
  //       }
  //     }
  //     let leads = leadsData?.data;
  //     let leadColumns = leadsData?.columns;
  //     setSelectedSheetId(item.id);
  //     setLeadsList([]);
  //     setFilterLeads([]);
  //     if (leads && leadColumns) {
  //       // //////console.log
  //       setLeadsList((prevDetails) => [...prevDetails, ...leads]);
  //       setFilterLeads((prevDetails) => [...prevDetails, ...leads]);
  //       let dynamicColumns = [];
  //       if (leads.length > 0) {
  //         dynamicColumns = [
  //           ...leadColumns,
  //           // { title: "Tag" },
  //           {
  //             title: "More",
  //             idDefault: false,
  //           },
  //         ];
  //       }
  //       // setLeadColumns(response.data.columns);
  //       setLeadColumns(dynamicColumns);
  //       // return
  //     } else {
  //       //////console.log;
  //     }

  //     // setSheetsLoader(true);

  //     const localData = localStorage.getItem("User");
  //     let AuthToken = null;
  //     if (localData) {
  //       const UserDetails = JSON.parse(localData);
  //       AuthToken = UserDetails.token;
  //     }

  //     //////console.log;

  //     //////console.log;

  //     // const ApiPath = `${Apis.getLeads}?sheetId=${id}`;

  //     const formtFromDate = moment(selectedFromDate).format("MM/DD/YYYY");
  //     const formtToDate = moment(selectedToDate).format("MM/DD/YYYY");

  //     let ApiPath = null;
  //     const stages = selectedStage.join(",");
  //     if (selectedFromDate && selectedToDate) {
  //       ApiPath = `${Apis.getLeads}?sheetId=${id}&fromDate=${formtFromDate}&toDate=${formtToDate}&stageIds=${stages}&offset=${offset}`;
  //     } else {
  //       ApiPath = `${Apis.getLeads}?sheetId=${id}&offset=${offset}`;
  //     }

  //     //////console.log;

  //     // return
  //     const response = await axios.get(ApiPath, {
  //       headers: {
  //         Authorization: "Bearer " + AuthToken,
  //         // "Content-Type": "application/json"
  //       },
  //     });

  //     if (response) {
  //       //////console.log;
  //       let leadData = [];
  //       let leadColumns = [];
  //       // setLeadsList(response.data.data);
  //       // setFilterLeads(response.data.data);

  //       const data = response.data.data;
  //       //////console.log;
  //       let firstLead = null;
  //       if (data.length > 0) {
  //         //////console.log;
  //         let l = data[0];
  //         let sheetOfLead = l.sheetId;
  //         //////console.log;
  //         if (item.id == sheetOfLead) {
  //           //////console.log;
  //           setLeadsList([...data]);
  //           setFilterLeads([...data]);
  //         }
  //       }
  //       // if (SelectedSheetId == item.id || SelectedSheetId == null) {
  //       //   setLeadsList([...data]);
  //       //   setFilterLeads([...data]);
  //       // }

  //       leadData = data;

  //       if (leads) {
  //         // leads = {...leads, ...data}
  //       } else {
  //         LeadsInSheet[id] = response.data;
  //         localStorage.setItem(`Leads${id}`, JSON.stringify(response.data));
  //       }
  //       let dynamicColumns = [];
  //       if (response.data.data.length > 0) {
  //         dynamicColumns = [
  //           ...response.data.columns,
  //           // { title: "Tag" },
  //           {
  //             title: "More",
  //             idDefault: false,
  //           },
  //         ];
  //       }
  //       // setLeadColumns(response.data.columns);
  //       setLeadColumns(dynamicColumns);
  //       leadColumns = response.data.columns;
  //       //////console.log;
  //       //////console.log;
  //     }
  //   } catch (error) {
  //     // console.error("Error occured in api is :", error);
  //   } finally {
  //     setSheetsLoader(false);
  //     //////console.log;
  //   }
  // };

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

      //////console.log;

      const ApiData = {
        note: addNotesValue,
        leadId: selectedLeadsDetails.id,
      };

      //////console.log;

      const ApiPath = Apis.addLeadNote;
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        //////console.log;
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

  // const getMatchingData = (title) => {
  //     // Special case for "Name" column
  //     if (title === "Name") {
  //         return FilterLeads.map((item) => `${item.firstName} ${item.lastName}`);
  //     }
  //     // For other columns
  //     return FilterLeads.map((item) => item[title] || "-");
  // };

  //function for getting the sheets

  // const getColumnData = (column, item) => {

  //     const { title } = column;

  //     switch (title) {
  //         case "Name":
  //             return (
  //                 <div>
  //                     <div className='w-full flex flex-row items-center gap-2 truncate'>
  //                         {toggleClick.includes(item.id) ? (
  //                             <button
  //                                 className="h-[20px] w-[20px] border rounded bg-purple outline-none flex flex-row items-center justify-center"
  //                                 onClick={() => handleToggleClick(item.id)}
  //                             >
  //                                 <Image src={"/assets/whiteTick.png"} height={10} width={10} alt='*' />
  //                             </button>
  //                         ) : (
  //                             <button
  //                                 className="h-[20px] w-[20px] border-2 rounded outline-none"
  //                                 onClick={() => handleToggleClick(item.id)}
  //                             >
  //                             </button>
  //                         )}
  //                         <div className='h-[32px] w-[32px] bg-black rounded-full flex flex-row items-center justify-center text-white'
  //                             onClick={() => handleToggleClick(item.id)}>
  //                             {item.firstName.slice(0, 1)}
  //                         </div>
  //                         <div className='truncate cursor-pointer'
  //                             onClick={() => handleToggleClick(item.id)}>
  //                             {item.firstName} {item.lastName}
  //                         </div>
  //                     </div>
  //                 </div>
  //             );
  //         case "Date":
  //             return item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-";
  //         case "Phone":
  //             return item.phone ? item.phone : "-";
  //         case "Stage":
  //             return item.stage ? item.stage : "No Stage";
  //         case "More":
  //             return (
  //                 <button
  //                     className="underline text-purple"
  //                     onClick={() => {
  //                         //////console.log
  //                         setSelectedLeadsDetails(item); // Pass selected lead data
  //                         setShowDetailsModal(true); // Show modal
  //                     }}
  //                 >
  //                     Details
  //                 </button>
  //             );
  //         default:
  //             return item[title] || "-"; // Match dynamically by converting title to lowercase
  //     }
  // };

  const getColumnData = (column, item) => {
    const { title } = column;
    let canShowSelected = false;
    if (selectedAll) {
      //check if item.id is in the toggle list or not
      if (selectedLeadsList.includes(item.id)) {
        canShowSelected = false;
      } else {
        canShowSelected = true;
      }
    } else {
      if (selectedLeadsList.includes(item.id)) {
        canShowSelected = true;
      } else {
        canShowSelected = false;
      }
    }

    // //console.log;
    // //console.log;

    // return <div>Salman</div>;
    switch (title) {
      case "Name":
        // //console.log;
        return (
          <div>
            <div className="w-full flex flex-row items-center gap-2 truncate">
              {canShowSelected ? (
                <button
                  className="h-[20px] w-[20px] border rounded bg-purple outline-none flex flex-row items-center justify-center"
                  onClick={() => {
                    handleToggleClick(item.id);
                  }}
                >
                  <Image
                    src={"/assets/whiteTick.png"}
                    height={10}
                    width={10}
                    alt="*"
                  />
                </button>
              ) : (
                <button
                  className="h-[20px] w-[20px] border-2 rounded outline-none"
                  onClick={() => handleToggleClick(item.id)}
                ></button>
              )}
              <div
                className="h-[32px] w-[32px] bg-black cursor-pointer rounded-full flex flex-row items-center justify-center text-white  break-words overflow-hidden text-ellipsis"
                onClick={() => {
                  setSelectedLeadsDetails(item); // Pass selected lead data
                  setNoteDetails(item.notes);
                  setShowDetailsModal(true); // Show modal
                  setColumns(column);
                }}
              >
                {item.firstName.slice(0, 1)}
              </div>
              <div
                className="w-[80%] truncate cursor-pointer  break-words overflow-hidden text-ellipsis"
                onClick={() => {
                  setSelectedLeadsDetails(item); // Pass selected lead data
                  setNoteDetails(item.notes);
                  setShowDetailsModal(true); // Show modal
                  setColumns(column);
                }}
              >
                {item.firstName} {item.lastName}
              </div>
            </div>
          </div>
        );
      case "Phone":
        // //console.log;
        return (
          <button onClick={() => handleToggleClick(item.id)}>
            {item.phone ? item.phone : "-"}
          </button>
        );
      case "Stage":
        // //console.log;
        return (
          <button onClick={() => handleToggleClick(item.id)}>
            {item.stage ? item.stage.stageTitle : "No Stage"}
          </button>
        );
      // case "Date":
      //     return item.createdAt ? moment(item.createdAt).format('MMM DD, YYYY') : "-";
      case "More":
        // //console.log;
        return (
          <button
            className="underline text-purple"
            onClick={() => {
              // //console.log;
              setSelectedLeadsDetails(item); // Pass selected lead data
              setNoteDetails(item.notes);
              setShowDetailsModal(true); // Show modal
              setColumns(column);
            }}
          >
            Details
          </button>
        );
      default:
        let value = item[title];
        // console.log("Available keys:", Object.keys(item));
        if (typeof value === "object" && value !== null) {
          value = JSON.stringify(value);
        }
        return (
          <div
            className="cursor-pointer  break-words overflow-hidden text-ellipsis"
            onClick={() => {
              handleToggleClick(item.id);
            }}
          >
            {value || "-"}
          </div>
        );
    }
  };

  //stoped for some reason
  const getDetailsColumnData = (column, item) => {
    let filteredColumns = column;

    const { title } = filteredColumns;

    // //////console.log;
    // //////console.log;

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
          const value = item[title];
          if (typeof value === "object" && value !== null) {
            // Handle objects gracefully
            return JSON.stringify(value); // Convert to string or handle as needed
          }
          return value || "-";
      }
    }
  };

  //code for getting the sheets
  const getSheets = async () => {
    try {
      let alreadyCached = GetAndSetDataFromLocalStorage();
      // return;
      setInitialLoader(!alreadyCached);
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      //////console.log;

      const ApiPath = Apis.getSheets;
      //////console.log;

      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        //////console.log;
        if (response.data.data.length === 0) {
          handleShowUserLeads(null);
        } else {
          handleShowUserLeads("leads exist");
          setSheetsList(response.data.data);
          let sheets = response.data.data;
          SetSheetsToLocalStorage(sheets);
          if (sheets.length > 0) {
            let ind = 0;
            if (sheetIndexSelected < sheets.length) {
              ind = sheetIndexSelected;
            }
            setCurrentSheet(response.data.data[ind]);
            setSelectedSheetId(response.data.data[ind].id);
            // setParamsInSearchBar(ind);
          }

          //   getLeads(response.data.data[0], 0);
        }
      }
    } catch (error) {
      // console.error("Error occured in api is :", error);
    } finally {
      setInitialLoader(false);
      //////console.log;
    }
  };

  //function to get the stages list using pipelineId
  const getStagesList = async (item) => {
    try {
      setStagesLoader(true);
      let AuthToken = null;

      const localDetails = localStorage.getItem("User");
      if (localDetails) {
        const Data = JSON.parse(localDetails);
        // //////console.log;
        AuthToken = Data.token;
      }

      //////console.log;

      const ApiPath = `${Apis.getStagesList}?pipelineId=${item.id}`;

      //////console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        //////console.log;
        if (response.data.status === true) {
          setStagesList(response?.data?.data[0]?.stages);
        }
      }
    } catch (error) {
      // console.error("Error occured in api is", error);
    } finally {
      //////console.log;
      setStagesLoader(false);
    }
  };

  //function to get pipelines
  const getPipelines = async () => {
    try {
      let AuthToken = null;

      const localDetails = localStorage.getItem("User");
      if (localDetails) {
        const Data = JSON.parse(localDetails);
        // //////console.log;
        AuthToken = Data.token;
      }

      //////console.log;

      const ApiPath = Apis.getPipelines;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        ////console.log(
        //   "Response of get pipelines list api is",
        //   response.data.data
        // );
        if (response.data.status === true) {
          localStorage.setItem(
            "pipelinesList",
            JSON.stringify(response.data.data)
          );
          setPipelinesList(response.data.data);
        }
      }
    } catch (error) {
      // console.error("Error occured in api is error", error);
    } finally {
      //////console.log;
    }
  };

  //code for toggle click
  const handleToggleClick = (id, selectedAll) => {
    if (selectedAll) {
      // setSelectedAll(false);
      if (selectedLeadsList.includes(id)) {
        setSelectedLeadsList((prev) => prev.filter((item) => item.id != id));
      } else {
        setSelectedLeadsList((prev) => [...prev, id]);
      }
    } else {
      setSelectedLeadsList((prevSelectedItems) => {
        if (prevSelectedItems.includes(id)) {
          // Remove the ID if it's already selected
          return prevSelectedItems.filter((itemId) => itemId !== id);
        } else {
          // Add the ID to the selected items
          return [...prevSelectedItems, id];
        }
      });
    }
  };

  //close assign lead modal
  const handleCloseAssignLeadModal = ({
    status,
    showSnack,
    disSelectLeads,
  }) => {
    setAssignLeadModal(status);
    // //console.log;
    // //console.log;
    setSnackMessage(showSnack);
    if (disSelectLeads === true) {
      setSelectedLeadsList([]);
      if (showSnack) {
        setShowSnackMessage(true);
      }
      setSelectedAll(false);
      setMessageType(SnackbarTypes.Success);
    } else if (disSelectLeads === false) {
      setShowSnackMessage(true);
      setMessageType(SnackbarTypes.Error);
      // setToggleClick([])
    }
  };

  //code for handle search change
  const handleSearchChange = (value) => {
    return;
    if (value.trim() === "") {
      // //////console.log;
      // Reset to original list when input is empty
      setFilterLeads(LeadsList);
      return;
    }

    const filtered = LeadsList.filter((item) => {
      const term = value.toLowerCase();
      return (
        item.firstName?.toLowerCase().includes(term) ||
        item.lastName?.toLowerCase().includes(term) ||
        item.address?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        (item.phone && item.phone.includes(term))
      );
    });

    setFilterLeads(filtered);
  };

  //code for array input fields changes
  // Handle change in input field
  const handleInputChange = (id, value) => {
    setInputs(
      inputs.map((input) => (input.id === id ? { ...input, value } : input))
    );
  };

  // Handle deletion of input field
  const handleDelete = (id) => {
    setInputs(inputs.filter((input) => input.id !== id));
  };

  function HandleUpdateStage(stage) {
    // setShowDetailsModal(false);

    // //console.log;
    // //console.log;
    let selLead = selectedLeadsDetails;
    selLead.stage = stage;
    let newList = [];
    LeadsList.map((lead) => {
      if (selLead.id == lead.id) {
        newList.push(selLead);
      } else {
        newList.push(lead);
      }
    });

    setLeadsList(newList);
    let filteredList = [];
    FilterLeads.map((lead) => {
      if (selLead.id == lead.id) {
        filteredList.push(selLead);
      } else {
        filteredList.push(lead);
      }
    });
    setFilterLeads(filteredList);
    // //console.log;
    // //console.log;

    localStorage.setItem(
      `Leads${SelectedSheetId}`,
      JSON.stringify(filteredList)
    );
    // setLeadsList(filtered);
    // setFilterLeads(filtered);
  }

  // Handle adding a new input field
  const handleAddInput = () => {
    const newId = inputs.length ? inputs[inputs.length - 1].id + 1 : 1;
    setInputs([...inputs, { id: newId, value: "" }]);
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

      //////console.log;

      const ApiData = {
        sheetName: newSheetName,
        columns: inputs.map((columns) => columns.value),
      };
      //////console.log;

      const ApiPath = Apis.addSmartList;
      //////console.log;

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        //////console.log;
        if (response.data.status === true) {
          setSheetsList([...SheetsList, response.data.data]);
          setShowAddNewSheetModal(false);
          setInputs([
            { id: 1, value: "First Name" },
            { id: 2, value: "Last Name" },
            { id: 3, value: "Phone Number" },
            { id: 4, value: "" },
            { id: 5, value: "" },
            { id: 6, value: "" },
          ]);
          setNewSheetName("");
        }
      }
    } catch (error) {
      // console.error("Error occured in adding new list api is:", error);
    } finally {
      setShowaddCreateListLoader(false);
    }
  };

  const styles = {
    heading: {
      fontWeight: "700",
      fontSize: 17,
    },
    paragraph: {
      fontWeight: "500",
      fontSize: 15,
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

  function getFilterTitle(filter) {
    if (filter.key == "date") {
      let string = "";
      let values = filter.values;
      if (values.length > 0) {
        string = moment(values[0]).format("MMM Do") + "";
        if (values.length > 1) {
          string = `${string} -
            ${moment(values[1]).format("MMM Do")}`;
        }
        return string;
      }

      return string;
    }
    if (filter.key == "stage") {
      let values = filter.values;
      if (values.length > 0) {
        let stageTitle = values[0].stageTitle;
        return stageTitle;
      }
      return "";
    }
    if (filter.key == "pipeline") {
      let values = filter.values;
      if (values.length > 0) {
        let stageTitle = values[0];
        return stageTitle;
      }
      return "";
    }
  }

  function setFiltersFromSelection() {
    let filters = [];
    if (selectedFromDate && selectedToDate) {
      let dateFilter = {
        key: "date",
        values: [selectedFromDate, selectedToDate],
      };
      filters.push(dateFilter);
    }
    if (selectedPipeline) {
      let dateFilter = {
        key: "pipeline",
        values: [selectedPipeline],
      };
      filters.push(dateFilter);
    }
    if (selectedStage && selectedStage.length > 0) {
      selectedStage.map((stage) => {
        let dateFilter = {
          key: "stage",
          values: [stage],
        };
        filters.push(dateFilter);
      });
    }

    setFiltersSelected(filters);
  }

  function getLeadSelectedCount() {
    if (selectedAll) {
      return totalLeads - selectedLeadsList.length;
    } else {
      return selectedLeadsList.length;
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {initialLoader || sheetsLoader ? ( ///|| !(LeadsList.length > 0 && showNoLeadsLabel)
        <div className="w-screen">
          <LeadLoading />
        </div>
      ) : (
        <>
          <AgentSelectSnackMessage
            isVisible={showsnackMessage}
            hide={() => setShowSnackMessage(false)}
            message={snackMessage}
            type={messageType}
          />
          <div
            className="flex flex-row items-center justify-between w-full px-10 py-4 "
            style={{ borderBottom: "1px solid #15151510" }}
          >
            <div style={{ fontWeight: "600", fontSize: 24 }}>Leads</div>
            <div className="flex fex-row items-center gap-6">
              <button
                style={{
                  backgroundColor:
                    selectedLeadsList.length > 0 || selectedAll
                      ? "#7902DF"
                      : "",
                  color:
                    selectedLeadsList.length > 0 || selectedAll
                      ? "white"
                      : "#000000",
                }}
                className="flex flex-row items-center gap-4 h-[50px] rounded-lg bg-[#33333315] w-[189px] justify-center"
                onClick={() => {
                  if (userLocalDetails?.plan) {
                    setAssignLeadModal(true);
                  } else {
                    setSnackMessage("Add payment method to continue");
                    setShowSnackMessage(true);
                    setMessageType(SnackbarTypes.Warning);
                  }
                }}
                disabled={!(selectedLeadsList.length > 0 || selectedAll)}
              >
                {selectedLeadsList.length > 0 || selectedAll ? (
                  <Image
                    src={"/assets/callBtnFocus.png"}
                    height={17}
                    width={17}
                    alt="*"
                  />
                ) : (
                  <Image
                    src={"/assets/callBtn.png"}
                    height={17}
                    width={17}
                    alt="*"
                  />
                )}
                <span style={styles.heading}>Start Calling</span>
              </button>
              <div className="flex flex-col">
                <NotficationsDrawer />
              </div>
            </div>
          </div>

          <div className="w-[95%] pe-12 mt-2">
            <div>
              <div className="flex flex-row items-center justify-end">
                <div className="flex flex-row items-center gap-6">
                  {/* <div className='flex flex-row items-center gap-2'>
                                        <Image src={"/assets/buyLeadIcon.png"} height={24} width={24} alt='*' />
                                        <span className='text-purple' style={styles.paragraph}>
                                            Buy Lead
                                        </span>
                                    </div> */}

                  <AssignLeadAnimation
                    showModal={AssignLeadModal}
                    selectedLead={selectedLeadsList}
                    handleClose={
                      handleCloseAssignLeadModal //(false, showSnack, disSelectLeads)
                    }
                    leadIs={selectedLeadsList}
                    selectedAll={selectedAll}
                    filters={getFiltersObject()}
                    totalLeads={totalLeads}
                    userProfile={userLocalDetails} // this is the .user object doesn't include token
                  />

                  {/* <Modal
                    open={AssignLeadModal}
                    onClose={() => setAssignLeadModal(false)}
                    closeAfterTransition
                    BackdropProps={{
                      timeout: 100,
                      sx: {
                        backgroundColor: "#00000020",
                        // //backdropFilter: "blur(5px)",
                      },
                    }}
                  >
                    <Box
                      className="w-[80%] sm:w-[546px]"
                      sx={styles.modalsStyle}
                    >
                      <div className="flex flex-row justify-center w-full">
                        <div
                          className="w-full"
                          style={{
                            backgroundColor: "#ffffff",
                            padding: 20,
                            borderRadius: "13px",
                            paddingTop: 30,
                            paddingBottom: 30,
                          }}
                        >
                          <div className="flex flex-row justify-end">
                            <button
                              onClick={() => {
                                setAssignLeadModal(false);
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
                            <AssignLead
                              selectedLead={selectedLeadsList}
                              handleCloseAssignLeadModal={
                                handleCloseAssignLeadModal //(false, showSnack, disSelectLeads)
                              }
                              leadIs={selectedLeadsList}
                              selectedAll={selectedAll}
                              filters={getFiltersObject()}
                              totalLeads={totalLeads}
                              userProfile={userLocalDetails} // this is the .user object doesn't include token
                            />
                          </div>
                        </div>
                      </div>
                    </Box>
                  </Modal>*/}

                </div>
              </div>
              <div className="flex flex-row items-center justify-between w-full mt-4 w-full">
                <div className="flex flex-row items-center gap-4 overflow-none flex-shrink-0 w-[80%]">
                  <div className="flex flex-row items-center gap-1 w-[22vw] flex-shrink-0 border rounded-full pe-2">
                    <input
                      style={styles.paragraph}
                      className="outline-none border-none w-full rounded-full bg-transparent focus:outline-none focus:ring-0"
                      placeholder="Search by name, email or phone"
                      value={searchLead}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchLead(e.target.value);
                        handleSearchChange(value);
                      }}
                    />
                    <button className="outline-none border-none">
                      <Image
                        src={"/assets/searchIcon.png"}
                        height={24}
                        width={24}
                        alt="*"
                      />
                    </button>
                  </div>
                  <button
                    className="outline-none flex-shrink-0"
                    onClick={() => {
                      setShowFilterModal(true);
                    }}
                  >
                    <Image
                      src={"/assets/filterIcon.png"}
                      height={16}
                      width={16}
                      alt="*"
                    />
                  </button>
                  {/* Show filters here in a row*/}
                  <div
                    className="flex flex-row items-center gap-4 flex-shrink-0 overflow-auto w-[70%] "
                    style={{
                      scrollbarColor: "#00000000",
                      scrollbarWidth: "none",
                    }}
                  >
                    {filtersSelected.map((filter, index) => {
                      //////console.log;
                      return (
                        <div className="flex-shrink-0" key={filter.key + index}>
                          <div
                            className="px-4 py-2 bg-[#402FFF10] text-purple  flex-shrink-0 [#7902DF10] rounded-[25px] flex flex-row items-center gap-2"
                            style={{ fontWeight: "500", fontSize: 15 }}
                          >
                            {getFilterTitle(filter)}
                            <button
                              className="outline-none"
                              onClick={() => {
                                let filters = [];
                                let stages = [];
                                let pipeline = null;
                                let fromDate = null;
                                let toDate = null;
                                filtersSelected.map((f, ind) => {
                                  if (index != ind) {
                                    filters.push(f);
                                    if (f.key == "stage") {
                                      stages.push(f.values[0]);
                                    }
                                    if (f.key == "pipeline") {
                                      pipeline = f.values[0];
                                    }
                                    if (f.key == "date") {
                                      fromDate = f.values[0];
                                      toDate = f.values[1];
                                    }
                                  } else {
                                  }
                                });

                                //////console.log;
                                //////console.log;
                                //////console.log;
                                // //console.log;
                                setSelectedStage(stages);
                                setSelectedFromDate(fromDate);
                                setSelectedToDate(toDate);
                                setSelectedPipeline(pipeline);
                                //   setFilterLeads([]);
                                //   setLeadsList([]);
                                //   setTimeout(() => {
                                //     let filterText = getFilterText();
                                //     handleFilterLeads(0, filterText);
                                //   }, 1000);

                                //   filters.splice(index, 1);
                                //////console.log;
                                setFiltersSelected(filters);
                              }}
                            >
                              <Image
                                src={"/otherAssets/crossIcon.png"}
                                height={20}
                                width={20}
                                alt="*"
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-row items-center gap-2">
                  {selectedLeadsList.length >= 0 && (
                    <div>
                      {selectedAll ? (
                        <div>
                          <div className="flex flex-row items-center gap-2">
                            <button
                              className="h-[20px] w-[20px] border rounded bg-purple outline-none flex flex-row items-center justify-center"
                              onClick={() => {
                                setSelectedLeadsList([]);
                                setSelectedAll(false);
                              }}
                            >
                              <Image
                                src={"/assets/whiteTick.png"}
                                height={10}
                                width={10}
                                alt="*"
                              />
                            </button>
                            <div style={{ fontSize: "15", fontWeight: "600" }}>
                              Select All
                            </div>

                            <div
                              className="text-purple"
                              style={{ fontSize: "15", fontWeight: "600" }}
                            >
                              {/* {LeadsList.length} */}
                              {getLeadSelectedCount()}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-row items-center gap-2">
                          <button
                            className="h-[20px] w-[20px] rounded outline-none"
                            style={{
                              border: "3px solid #00000070"
                            }}
                            onClick={() => {
                              //if select all then in the selectedLeads, we include the leads that are excluded
                              //if selected all is false then in selected Leads we include the included leads
                              setSelectedLeadsList([]); // setToggleClick(FilterLeads.map((item) => item.id)); 
                              //LeadsList.map((item) => item.id)
                              setSelectedAll(true);
                            }}
                          ></button>
                          <div style={{ fontSize: "15", fontWeight: "600" }}>
                            Select All
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* <button className='flex flex-row items-center justify-center gap-2 bg-none outline-none border h-[43px] w-[101px] rounded'>
                                        <span>
                                            Import
                                        </span>
                                        <Image src={"/assets/downloadIcon.png"} height={15} width={15} alt='*' />
                                    </button> */}
                </div>
              </div>

              <div
                className="flex flex-row items-center mt-8 gap-2"
                style={styles.paragraph}
              // className="flex flex-row items-center mt-8 gap-2"
              // style={{ ...styles.paragraph, overflowY: "hidden" }}
              >
                <div
                  className="flex flex-row items-center gap-2 w-full"
                  style={{
                    ...styles.paragraph,
                    overflowY: "hidden",
                    scrollbarWidth: "none", // For Firefox
                    msOverflowStyle: "none", // For Internet Explorer and Edge
                  }}
                >
                  <style jsx>
                    {`
                      div::-webkit-scrollbar {
                        display: none; /* For Chrome, Safari, and Opera */
                      }
                    `}
                  </style>
                  {SheetsList.map((item, index) => {
                    return (
                      <div
                        key={index}
                        className="flex flex-row items-center gap-1 px-3"
                        style={{
                          borderBottom:
                            SelectedSheetId === item.id
                              ? "2px solid #7902DF"
                              : "",
                          color: SelectedSheetId === item.id ? "#7902DF" : "",
                          whiteSpace: "nowrap", // Prevent text wrapping
                        }}
                      // className='flex flex-row items-center gap-1 px-3'
                      // style={{ borderBottom: SelectedSheetId === item.id ? "2px solid #7902DF" : "", color: SelectedSheetId === item.id ? "#7902DF" : "" }}
                      >
                        <button
                          style={styles.paragraph}
                          className="outline-none w-full"
                          onClick={() => {
                            setSearchLead("");
                            setSelectedSheetId(item.id);
                            setParamsInSearchBar(index);
                            setSelectedLeadsList([]);
                            setSelectedAll(false);
                            setSelectedLeadsList([]);
                            //   getLeads(item, 0);
                          }}
                        >
                          {item.sheetName}
                        </button>
                        <button
                          className="outline-none"
                          aria-describedby={id}
                          variant="contained"
                          onClick={(event) => {
                            handleShowPopup(event, item);
                          }}
                        >
                          <DotsThree weight="bold" size={25} color="black" />
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
                            horizontal: "left", // Ensures the Popover's top right corner aligns with the anchor point
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
                            {delSmartListLoader ? (
                              <CircularProgress
                                size={15}
                                sx={{ color: "#7902DF" }}
                              />
                            ) : (
                              <button
                                className="text-red flex flex-row items-center gap-1"
                                onClick={handleDeleteSmartList}
                              >
                                <Image
                                  src={"/assets/delIcon.png"}
                                  height={18}
                                  width={18}
                                  alt="*"
                                />
                                <p
                                  className="text-red"
                                  style={{ fontWeight: "00", fontSize: 16 }}
                                >
                                  Delete
                                </p>
                              </button>
                            )}
                          </div>
                        </Popover>
                      </div>
                    );
                  })}
                </div>
                <button
                  className="flex flex-row items-center gap-1 text-purple flex-shrink-0"
                  style={styles.paragraph}
                  // onClick={() => { setShowAddNewSheetModal(true) }}
                  onClick={() => {
                    handleShowAddLeadModal(true);
                  }}
                >
                  <Plus size={15} color="#7902DF" weight="bold" />
                  <span>New Leads</span>
                </button>
              </div>

              {LeadsList.length > 0 ? (
                <div
                  className="h-[70svh] overflow-auto pb-[100px] mt-6"
                  id="scrollableDiv1"
                  style={{ scrollbarWidth: "none" }}
                >
                  <InfiniteScroll
                    className="flex flex-col w-full"
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
                    dataLength={FilterLeads.length}
                    next={() => {
                      let filterText = getFilterText();
                      handleFilterLeads(FilterLeads.length, filterText);
                    }}
                    hasMore={hasMore}
                    loader={
                      <div className="w-full flex flex-row justify-center mt-8">
                        {moreLeadsLoader && (
                          <CircularProgress
                            size={35}
                            sx={{ color: "#7902DF" }}
                          />
                        )}
                      </div>
                    }
                    style={{ overflow: "unset" }}
                  >
                    <table className="table-auto w-full border-collapse border border-none">
                      <thead>
                        <tr style={{ fontWeight: "500" }}>
                          {leadColumns.map((column, index) => {
                            const isMoreColumn = column.title === "More";
                            const columnWidth = isMoreColumn
                              ? "200px"
                              : "150px";
                            return (
                              <th
                                key={index}
                                className={`border-none px-4 py-2 text-left text-[#00000060] font-[500] ${isMoreColumn ? "sticky right-0 bg-white" : ""
                                  }`}
                                style={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  zIndex: isMoreColumn ? 1 : "auto",
                                  maxWidth: columnWidth,
                                }}
                              >
                                {column.title.charAt(0).toUpperCase() +
                                  column.title.slice(1)}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {FilterLeads.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            {leadColumns.map((column, colIndex) => (
                              <td
                                key={colIndex}
                                className={`border-none px-4 py-2 max-w-[330px] whitespace-normal break-words overflow-hidden text-ellipsis ${column.title === "More"
                                  ? "sticky right-0 bg-white"
                                  : ""
                                  }`}
                                style={{
                                  whiteSpace: "nowrap",
                                  zIndex: column.title === "More" ? 1 : "auto",
                                  // width: "200px",
                                }}
                              >
                                {getColumnData(column, item)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </InfiniteScroll>
                </div>
              ) : showNoLeadsLabel ? (
                <div className="text-xl text-center mt-8 font-bold text-[22px]">
                  No leads found
                </div>
              ) : (
                <div className="w-full flex justify-center items-center">
                  <LeadLoading />
                  {/* <div>Loading..</div>
                  <CircularProgress size={35} sx={{ color: "#7902DF" }} /> */}
                </div>
              )}

              <Modal
                open={showFilterModal}
                closeAfterTransition
                BackdropProps={{
                  sx: {
                    backgroundColor: "#00000020",
                    maxHeight: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    // //backdropFilter: "blur(5px)",
                  },
                }}
              >
                <Box
                  className="flex flex-row justify-center items-start lg:w-4/12 sm:w-7/12 w-8/12 py-2 px-6 bg-white max-h-[75svh]  overflow-auto md:overflow-auto"
                  sx={{
                    ...styles.modalsStyle,
                    scrollbarWidth: "none",
                    backgroundColor: "white",
                  }}
                >
                  <div className="w-full flex flex-col items-center justify-start ">
                    <div className="flex flex-row items-center justify-between w-full">
                      <div>Filter</div>
                      <button
                        onClick={() => {
                          setShowFilterModal(false);
                        }}
                      >
                        <Image
                          src={"/assets/cross.png"}
                          height={17}
                          width={17}
                          alt="*"
                        />
                      </button>
                    </div>
                    <div className="mt-2 w-full overflow-auto h-[85%]">
                      <div className="flex flex-row items-start gap-4">
                        <div className="w-1/2 h-full">
                          <div
                            className="h-full"
                            style={{
                              fontWeight: "500",
                              fontSize: 12,
                              color: "#00000060",
                              marginTop: 10,
                            }}
                          >
                            From
                          </div>
                          <div>
                            <button
                              style={{ border: "1px solid #00000020" }}
                              className="flex flex-row items-center justify-between p-2 rounded-lg mt-2 w-full justify-between"
                              onClick={() => {
                                setShowFromDatePicker(true);
                              }}
                            >
                              <p>
                                {selectedFromDate
                                  ? selectedFromDate.toDateString()
                                  : "Select Date"}
                              </p>
                              <CalendarDots weight="regular" size={25} />
                            </button>

                            <div>
                              {showFromDatePicker && (
                                <div ref={fromCalendarRef}>
                                  <Calendar
                                    onChange={handleFromDateChange}
                                    value={selectedFromDate}
                                    locale="en-US"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="w-1/2 h-full">
                          <div
                            style={{
                              fontWeight: "500",
                              fontSize: 12,
                              color: "#00000060",
                              marginTop: 10,
                            }}
                          >
                            To
                          </div>
                          <div>
                            <button
                              style={{ border: "1px solid #00000020" }}
                              className="flex flex-row items-center justify-between p-2 rounded-lg mt-2 w-full justify-between"
                              onClick={() => {
                                setShowToDatePicker(true);
                              }}
                            >
                              <p>
                                {selectedToDate
                                  ? selectedToDate.toDateString()
                                  : "Select Date"}
                              </p>
                              <CalendarDots weight="regular" size={25} />
                            </button>
                            <div>
                              {showToDatePicker && (
                                <div
                                  className="w-full border"
                                  ref={toCalendarRef}
                                >
                                  <Calendar
                                    onChange={handleToDateChange}
                                    value={selectedToDate}
                                    locale="en-US"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className="mt-6"
                        style={{
                          fontWeight: "500",
                          fontSize: 14,
                          color: "#00000060",
                          marginTop: 10,
                        }}
                      >
                        Select Pipeline
                      </div>

                      <div className="mt-2">
                        <FormControl fullWidth>
                          <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={selectedPipeline}
                            label="Age"
                            onChange={handleChange}
                            displayEmpty // Enables placeholder
                            renderValue={(selected) => {
                              if (!selected) {
                                return (
                                  <div style={{ color: "#aaa" }}>Select</div>
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
                                  // borderRadius: "10px"
                                },
                              },
                            }}
                          >
                            {pipelinesList.map((item, index) => {
                              return (
                                <MenuItem key={index} value={item.title}>
                                  <button
                                    onClick={() => {
                                      //////console.log;
                                      setSelectedStage([]);
                                      // getStagesList(item);
                                    }}
                                  >
                                    {item.title}
                                  </button>
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </div>

                      <div
                        className="mt-6"
                        style={{
                          fontWeight: "500",
                          fontSize: 14,
                          color: "#00000060",
                          marginTop: 10,
                        }}
                      >
                        Stage
                      </div>

                      {stagesLoader ? (
                        <div className="w-full flex flex-row justify-center mt-8">
                          <CircularProgress
                            size={25}
                            sx={{ color: "#7902DF" }}
                          />
                        </div>
                      ) : (
                        <div className="w-full flex flex-wrap gap-4">
                          {stagesList?.map((item, index) => {
                            let found = isStageSelected(item);
                            return (
                              <div
                                key={index}
                                className="flex flex-row items-center mt-2 justify-start"
                                style={{ fontSize: 15, fontWeight: "500" }}
                              >
                                <button
                                  onClick={() => {
                                    handleSelectStage(item);
                                  }}
                                  className={`p-2 border border-[#00000020] ${found >= 0 ? `bg-purple` : "bg-transparent"
                                    } px-6
                              ${found >= 0 ? `text-white` : "text-black"
                                    } rounded-2xl`}
                                >
                                  {item.stageTitle}
                                </button>
                              </div>
                            );
                          })}

                          {/* Add "No Stage" button after the list */}
                          <div className="flex flex-row items-center mt-2 justify-start">
                            <button
                              onClick={() => {
                                setNoStageSelected((prev) => !prev);
                              }}

                              className={`p-2 border border-[#00000020] ${noStageSelected
                                ? `bg-purple text-white`
                                : "bg-transparent text-black"
                                } px-6 rounded-2xl`}
                            >
                              No Stage
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row items-center w-full justify-between mt-4 pb-8">
                      <button
                        className="outline-none w-[105px]"
                        style={{ fontSize: 16.8, fontWeight: "600" }}
                        onClick={() => {
                          // setSelectedFromDate(null);
                          // setSelectedToDate(null);
                          // setSelectedStage(null);
                          // getLeads()
                          //   window.location.reload();
                          setFiltersSelected([]);
                        }}
                      >
                        Reset
                      </button>
                      {sheetsLoader ? (
                        <CircularProgress size={25} sx={{ color: "#7902DF" }} />
                      ) : (
                        <button
                          className="bg-purple h-[45px] w-[140px] bg-purple text-white rounded-xl outline-none"
                          style={{
                            fontSize: 16.8,
                            fontWeight: "600",
                            // backgroundColor: selectedFromDate && selectedToDate && selectedStage.length > 0 ? "" : "#00000050"
                          }}
                          onClick={() => {
                            //////console.log;
                            // setLeadsList([]);
                            // setFilterLeads([]);
                            setShowFilterModal(false);
                            setFiltersFromSelection();
                          }}
                        >
                          Apply Filter
                        </button>
                      )}
                    </div>
                  </div>
                </Box>
              </Modal>

              {/* When Thre are leads and user choose to add SmartList */}
              <div>
                <Modal
                  open={showAddNewSheetModal}
                  closeAfterTransition
                  BackdropProps={{
                    sx: {
                      backgroundColor: "#00000020",
                      // //backdropFilter: "blur(5px)",
                    },
                  }}
                >
                  <Box
                    className="lg:w-4/12 sm:w-7/12 w-8/12 bg-white py-2 px-6 h-[60vh] overflow-auto rounded-3xl h-[70vh]"
                    sx={{
                      ...styles.modalsStyle,
                      scrollbarWidth: "none",
                      backgroundColor: "white",
                    }}
                  >
                    <div
                      className="w-full flex flex-col items-center h-full justify-between"
                      style={{ backgroundColor: "white" }}
                    >
                      <div className="w-full">
                        <div className="flex flex-row items-center justify-between w-full mt-4 px-2">
                          <div style={{ fontWeight: "500", fontSize: 15 }}>
                            New SmartList
                          </div>
                          <button
                            onClick={() => {
                              setShowAddNewSheetModal(false);
                              setNewSheetName("");
                              setInputs([
                                { id: 1, value: "First Name" },
                                { id: 2, value: "Last Name" },
                                { id: 3, value: "Phone Number" },
                                { id: 4, value: "" },
                                { id: 5, value: "" },
                                { id: 6, value: "" },
                              ]);
                            }}
                          >
                            <Image
                              src={"/assets/cross.png"}
                              height={15}
                              width={15}
                              alt="*"
                            />
                          </button>
                        </div>

                        <div className="px-4 w-full">
                          <div className="flex flex-row items-center justify-start mt-6 gap-2">
                            <span style={styles.paragraph}>List Name</span>
                            {/* <Image
                            src={"/svgIcons/infoIcon.svg"}
                            height={15}
                            width={15}
                            alt="*"
                          /> */}
                          </div>
                          <div className="mt-4">
                            <input
                              value={newSheetName}
                              onChange={(e) => {
                                setNewSheetName(e.target.value);
                              }}
                              placeholder="Enter list name"
                              className="outline-none focus:outline-none focus:ring-0 border w-full rounded-xl h-[53px]"
                              style={{
                                ...styles.paragraph,
                                border: "1px solid #00000020",
                              }}
                            />
                          </div>
                          <div className="mt-8" style={styles.paragraph}>
                            Create Columns
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
                                  placeholder={`Column Name`}
                                  value={input.value}
                                  onChange={(e) => {
                                    if (index > 2) {
                                      handleInputChange(
                                        input.id,
                                        e.target.value
                                      );
                                    }
                                  }}
                                />
                                <div style={{ width: "5%" }}>
                                  {index > 2 && (
                                    <button
                                      className="outline-none border-none"
                                      onClick={() => handleDelete(input.id)}
                                    >
                                      <Image
                                        src={"/assets/blackBgCross.png"}
                                        height={20}
                                        width={20}
                                        alt="*"
                                      />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                            {/* Dummy element for scrolling */}
                            <div ref={bottomRef}></div>
                          </div>
                          <div style={{ height: "50px" }}>
                            {/*
                                                        inputs.length < 3 && (
                                                            <button onClick={handleAddInput} className='mt-4 p-2 outline-none border-none text-purple rounded-lg underline' style={{
                                                                fontSize: 15,
                                                                fontWeight: "700"
                                                            }}>
                                                                Add New
                                                            </button>
                                                        )
                                                    */}
                            <button
                              onClick={handleAddInput}
                              className="mt-4 p-2 outline-none border-none text-purple rounded-lg underline"
                              style={styles.paragraph}
                            >
                              New Column
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="w-full pb-8">
                        {showaddCreateListLoader ? (
                          <div className="flex flex-row items-center justify-center w-full h-[50px]">
                            <CircularProgress
                              size={25}
                              sx={{ color: "#7902DF" }}
                            />
                          </div>
                        ) : (
                          <button
                            className={` h-[50px] rounded-xl text-white w-full ${newSheetName && newSheetName.length > 0
                              ? "bg-red"
                              : ""
                              }`}
                            style={{
                              fontWeight: "600",
                              fontSize: 16.8,
                              // backgroundColor: newSheetName ? "" : ""
                            }}
                            onClick={handleAddSheetNewList}
                          >
                            Create List
                          </button>
                        )}
                      </div>
                    </div>
                  </Box>
                </Modal>
              </div>
            </div>
          </div>

          {showDetailsModal && (
            <div
              className="overflow-scroll"
              style={{
                backgroundColor: "",
                height:
                  typeof window !== "undefined"
                    ? window.innerHeight * 0.95
                    : 1000 * 0.95,
                width: "100%",
              }}
            >
              <LeadDetails
                selectedLead={selectedLeadsDetails?.id}
                pipelineId={selectedLeadsDetails?.pipeline?.id}
                showDetailsModal={showDetailsModal}
                setShowDetailsModal={setShowDetailsModal}
                handleDelLead={handleDeleteLead}
                leadStageUpdated={HandleUpdateStage}
              />
            </div>
          )}

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
                      <CircularProgress size={25} sx={{ color: "#7902DF" }} />
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
        </>
      )}

      <div></div>
    </div>
  );
};

export default Userleads;
