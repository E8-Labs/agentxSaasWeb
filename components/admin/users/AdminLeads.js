'use client'

// Import default styles
// import "./CalendarOverrides.css";
import '../../calls/CalendarOverrides.css'
import 'react-calendar/dist/Calendar.css'

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
  Switch,
  TextareaAutosize,
} from '@mui/material'
import {
  CalendarDots,
  CaretDown,
  CaretUp,
  Cross,
  DotsThree,
  EnvelopeSimple,
  Plus,
  X,
} from '@phosphor-icons/react'
import axios from 'axios'
import { filter, first } from 'draft-js/lib/DefaultDraftBlockRenderMap'
import parsePhoneNumberFromString from 'libphonenumber-js'
import moment from 'moment'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Calendar from 'react-calendar'
import InfiniteScroll from '@/components/ui/infinite-scroll'

import { formatFractional2 } from '@/components/agency/plan/AgencyUtilities'
import { userLocalData } from '@/components/agency/plan/AuthDetails'
import DashboardSlider from '@/components/animations/DashboardSlider'
import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import AssignLead from '@/components/dashboard/leads/AssignLead'
import LeadDetails from '@/components/dashboard/leads/extras/LeadDetails'
import CloseBtn, { CloseBtn2 } from '@/components/globalExtras/CloseBtn'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'
import CalendarInput from '@/components/test/DatePicker'
import { GetFormattedDateString } from '@/utilities/utility'

import AdminGetProfileDetails from '../AdminGetProfileDetails'
import AdminAssignLead from './AdminAssignLead'
import CreateSmartlistModal from '@/components/messaging/CreateSmartlistModal'
import { TypographyH3 } from '@/lib/typography'

const AdminLeads = ({
  handleShowAddLeadModal,
  handleShowUserLeads,
  newListAdded,
  shouldSet,
  setSetData,
  selectedUser,
  agencyUser = false,
}) => {
  //Sheet Caching related
  let sheetIndexSelected = useRef(0)
  let searchParams = useSearchParams()
  const router = useRouter()

  // Refs for request versioning (using cursor-based pagination like Userleads)

  //user local data
  const [userLocalDetails, setUserLocalDetails] = useState(null)
  const [totalLeads, setTotalLeads] = useState(0)

  const [snackMessage, setSnackMessage] = useState(null)
  const [messageType, setMessageType] = useState(null)
  const [showsnackMessage, setShowSnackMessage] = useState(false)

  const [initialLoader, setInitialLoader] = useState(false)
  const [SheetsList, setSheetsList] = useState([])
  const [currentSheet, setCurrentSheet] = useState(null)
  const [sheetsLoader, setSheetsLoader] = useState(false)
  const [LeadsList, setLeadsList] = useState([])
  const [searchLead, setSearchLead] = useState('')
  const [FilterLeads, setFilterLeads] = useState([])
  const [leadColumns, setLeadColumns] = useState([])
  const [SelectedSheetId, setSelectedSheetId] = useState(null)
  const [toggleClick, setToggleClick] = useState([])
  const [selectedAll, setSelectedAll] = useState(false)
  const [AssignLeadModal, setAssignLeadModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedFromDate, setSelectedFromDate] = useState(null)
  const [showFromDatePicker, setShowFromDatePicker] = useState(false)
  const [showAddNewSheetModal, setShowAddNewSheetModal] = useState(false)

  const requestVersion = useRef(0)

  const [filtersSelected, setFiltersSelected] = useState([])
  const [isInbound, setIsInbound] = useState(false)

  useEffect(() => {
    ////console.log;
  }, [FilterLeads])

  const [LeadsInSheet, setLeadsInSheet] = useState({})

  const [AllLeads, setAllLeads] = useState({})

  //code for pagination variables (using cursor-based pagination like Userleads)
  const [hasMore, setHasMore] = useState(true)
  const [moreLeadsLoader, setMoreLeadsLoader] = useState(false)
  const [nextCursorValue, setNextCursorValue] = useState(0)
  const nextCursorRef = useRef(0) // Track cursor synchronously for scroll handler
  
  // Refs to prevent duplicate requests (like subaccounts)
  const isLoadingMoreRef = useRef(false)

  //code for delete smart list popover
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [delSmartListLoader, setDelSmartListLoader] = useState(false)
  const [selectedSmartList, setSelectedSmartList] = useState(null)
  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  //code for passing columns
  const [Columns, setColumns] = useState(null)


  //err msg when no leaad in list
  const [showNoLeadErr, setShowNoLeadErr] = useState(null)
  const [showNoLeadsLabel, setShowNoLeadsLabel] = useState(false)

  //code for showing leads details
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedLeadsDetails, setSelectedLeadsDetails] = useState(null)

  //code for call activity transcript text
  const [isExpanded, setIsExpanded] = useState([])
  const [isExpandedActivity, setIsExpandedActivity] = useState([])

  // //////console.log;

  //to date filter
  // const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedToDate, setSelectedToDate] = useState(null)
  const [showToDatePicker, setShowToDatePicker] = useState(false)
  const [stagesList, setStagesList] = useState([])
  const [stagesLoader, setStagesLoader] = useState(false)
  const [selectedStage, setSelectedStage] = useState([])

  //code for buttons of details popup
  const [showKYCDetails, setShowKycDetails] = useState(true)
  const [showNotesDetails, setShowNotesDetails] = useState(false)
  const [showAcitivityDetails, setShowAcitivityDetails] = useState(false)

  //code for add stage notes
  const [showAddNotes, setShowAddNotes] = useState(false)
  const [addNotesValue, setddNotesValue] = useState('')
  const [noteDetails, setNoteDetails] = useState([])
  const [addLeadNoteLoader, setAddLeadNoteLoader] = useState(false)

  //code for deltag loader
  const [DelTagLoader, setDelTagLoader] = useState(null)

  //code for pipelines api
  const [pipelinesList, setPipelinesList] = useState([])

  //pipelines dropdown
  // const [selectedPipeline, setSelectedPipeline] = useState("");
  const [selectedPipeline, setSelectedPipeline] = useState('')
  const [userDetails, setUserDetails] = useState(null)

  useEffect(() => {
    const getUserDetails = async () => {
      if (selectedUser?.id) {
        const user = await AdminGetProfileDetails(selectedUser.id)
        if (user) {
          setUserDetails(user)
        }
      }
    }
    getUserDetails()
  }, [selectedUser?.id])


  const handleChange = (event) => {
    const selectedValue = event.target.value

    setSelectedPipeline(event.target.value)

    const selectedItem = pipelinesList.find(
      (item) => item.title === selectedValue,
    )

    // //console.log;

    setStagesList(selectedItem.stages)
  }

  useEffect(() => {
    // getLeads();
    const localPipelines = localStorage.getItem('pipelinesList')
    if (localPipelines) {
      const Data = JSON.parse(localPipelines)
      setPipelinesList(Data)
    }
    getProfile()
    getPipelines()
    getSheets()
  }, [selectedUser])

  // IntersectionObserver-based lazy loading (shadcn InfiniteScroll)
  const [leadsScrollRoot, setLeadsScrollRoot] = useState(null)
  const leadsScrollRootRef = useRef(null)
  const lastNextCursorRequestedRef = useRef(null)
  const setLeadsScrollRootEl = useCallback((el) => {
    if (el && leadsScrollRootRef.current !== el) {
      leadsScrollRootRef.current = el
      setLeadsScrollRoot(el)
    }
  }, [])

  useEffect(() => {
    if (shouldSet === true) {
      //////console.log;
      let sheets = []
      let found = false
      SheetsList.map((sheet) => {
        if (sheet.id == newListAdded.id) {
          // //console.log;
          found = true
        }
        sheets.push(sheet)
      })
      if (!found) {
        // //console.log;
        sheets.push(newListAdded)
      }
      setSelectedSheetId(newListAdded.id) // setSelectedSheetId(item.id);
      setSheetsList(sheets)
      setSetData(false)
    }
  }, [shouldSet])

  useEffect(() => {
    //////console.log;
    //////console.log;
  }, [LeadsList, FilterLeads])

  useEffect(() => {
    // Scroll to the bottom when inputs change
    setFilterLeads([])
    setLeadsList([])
    setNextCursorValue(0) // Reset cursor when filters change
    nextCursorRef.current = 0 // Reset ref as well
    setHasMore(true) // Reset hasMore when filters/sheet change
    let filterText = getFilterText()
    // //console.log;
    handleFilterLeads(filterText)
    setShowNoLeadsLabel(false)
  }, [filtersSelected, SelectedSheetId, selectedUser])

  //Caching & refresh logic
  useEffect(() => {
    const sheet = searchParams.get('sheet') // Get the value of 'tab'
    let number = Number(sheet) || 0
    // //console.log;
    sheetIndexSelected = number
    if (!sheet) {
      // setParamsInSearchBar(1);
    }
  }, [])
  const setParamsInSearchBar = (index = 1) => {
    // Create a new URLSearchParams object to modify
    const params = new URLSearchParams(searchParams.toString())
    params.set('sheet', index) // Set or update the 'tab' parameter

    // Push the updated URL
    router.push(`/dashboard/leads?${params.toString()}`)

    // //console.log;
  }

  //leads count
  // function getLeadSelectedCount() {
  //   console.log("toggleClick length", toggleClick.length);
  //   console.log("totalLeads length", totalLeads.length);
  //   if (toggleClick.length !== totalLeads) {
  //     return totalLeads - toggleClick.length;
  //   } else {
  //     return totalLeads;
  //   }
  // }

  function SetSheetsToLocalStorage(data) {
    localStorage.setItem('sheets', JSON.stringify(data))
  }

  function GetAndSetDataFromLocalStorage() {
    let d = localStorage.getItem('sheets')
    if (d) {
      // //console.log;
      let data = JSON.parse(d)
      let ind = 0
      if (sheetIndexSelected < data.length) {
        ind = sheetIndexSelected
      }
      setSheetsList(data)
      setCurrentSheet(data[ind])
      setSelectedSheetId(data[ind].id)
      return true //
    } else {
      // //console.log;
      return false
    }
  }

  //code for get profile function
  const getProfile = async () => {
    try {
      const LocalData = userLocalData()
      setUserLocalDetails(LocalData)
      let data = await AdminGetProfileDetails(selectedUser.id)
      // console.log('data', data)
      setUserLocalDetails(data)
    } catch (error) {
      // console.error("Error occured in api is error", error);
    }
  }

  //fucntion to read more transcript text
  const handleReadMoreToggle = (item) => {
    // setIsExpanded(!isExpanded);

    setIsExpanded((prevIds) => {
      if (prevIds.includes(item.id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== item.id)
      } else {
        // Select the item if it's not already selected
        return [...prevIds, item.id]
      }
    })
  }

  //function to delete lead
  const handleDeleteLead = async (delLead) => {
    //////console.log;
    setShowDetailsModal(false)
    let filtered = LeadsList.filter((lead) => lead.id !== delLead.id)
    //////console.log;
    // return
    localStorage.setItem(`Leads${SelectedSheetId}`, JSON.stringify(filtered))
    setLeadsList(filtered)
    setFilterLeads(filtered)
  }

  //function to format the number
  const formatPhoneNumber = (rawNumber) => {
    const phoneNumber = parsePhoneNumberFromString(
      rawNumber?.startsWith('+') ? rawNumber : `+${rawNumber}`,
    )
    // //////console.log;
    return phoneNumber
      ? phoneNumber.formatInternational()
      : 'Invalid phone number'
  }

  //fucntion to ShowMore ActivityData transcript text
  const handleShowMoreActivityData = (item) => {
    // setIsExpanded(!isExpanded);

    setIsExpandedActivity((prevIds) => {
      if (prevIds.includes(item.id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== item.id)
      } else {
        // Select the item if it's not already selected
        return [...prevIds, item.id]
      }
    })
  }

  //function to show the callStatus
  const checkCallStatus = (callActivity) => {
    let callStatus = null
    let item = callActivity
    // callActivity.forEach((item) => {
    if (item.status === 'completed') {
      // Check for hotlead, humancalldrop, and dnd
      if (item.hotlead || item.humancalldrop || item.dnd) {
        ////console.log(
        //   "Status is completed with the following additional information:"
        // );
        if (item.hotlead === true) {
          //////console.log;
          callStatus = 'Hot Lead'
        }
        if (item.humancalldrop === true) {
          //////console.log;
          callStatus = 'Human Call Drop'
        }
        if (item.dnd === true) {
          //////console.log;
          callStatus = 'DND'
        }
        if (item.notinterested) {
          //////console.log;
          callStatus = 'Not Interested'
        }
      } else {
        callStatus = item.status
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
      callStatus = item.status
    }
    // });
    return callStatus
  }

  //code for del tag api
  const handleDelTag = async (tag) => {
    try {
      setDelTagLoader(tag)

      let AuthToken = null

      const userData = localStorage.getItem('User')
      if (userData) {
        const localData = JSON.parse(userData)
        AuthToken = localData.token
      }

      //////console.log;

      const ApiData = {
        tag: tag,
      }

      const ApiPath = Apis.delLeadTag
      //////console.log;
      //////console.log;

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        //////console.log;
        if (response.data.status === true) {
          //////console.log;

          const updatedTags = selectedLeadsDetails.tags.filter(
            (item) => item !== tag,
          )
          setSelectedLeadsDetails((prevDetails) => ({
            ...prevDetails,
            tags: updatedTags,
          }))
        }
      }
    } catch (error) {
      // console.error("Error occured in api is:", error);
    } finally {
      setDelTagLoader(null)
    }
  }

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
    let found = -1
    for (let i = 0; i < selectedStage.length; i++) {
      if (selectedStage[i].id == item.id) {
        found = i
      } else {
        // stages.push(selectedStage[i]);
      }
    }

    return found
  }
  const handleSelectStage = (item) => {
    // setSelectedStage(item);

    let stages = []
    let found = -1
    for (let i = 0; i < selectedStage.length; i++) {
      if (selectedStage[i].id == item.id) {
        found = i
      } else {
        stages.push(selectedStage[i])
      }
    }
    if (found >= 0) {
    } else {
      stages.push(item)
    }
    setSelectedStage(stages)

    // setSelectedStage((prevIds) => {
    //   if (prevIds.includes(item.id)) {
    //     // Unselect the item if it's already selected
    //     return prevIds.filter((prevId) => prevId !== item.id);
    //   } else {
    //     // Select the item if it's not already selected
    //     return [...prevIds, item.id];
    //   }
    // });
  }

  //function for del smartlist stage popover

  const handleShowPopup = (event, item) => {
    setAnchorEl(event.currentTarget)
    //////console.log;
    setSelectedSmartList(item)
  }

  const handleClosePopup = () => {
    setAnchorEl(null)
  }

  //function to delete smart list
  const handleDeleteSmartList = async () => {
    try {
      setDelSmartListLoader(true)

      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      //////console.log;

      const ApiData = {
        sheetId: selectedSmartList.id,
      }

      // //console.log;

      const ApiPath = Apis.delSmartList
      // //console.log;
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
        },
      })

      if (response) {
        //////console.log;
        if (response.data.status === true) {
          setSheetsList((prevSheetsList) =>
            prevSheetsList.filter((sheet) => sheet.id !== selectedSmartList.id),
          )
          setToggleClick([])
          setSelectedAll(false)
          setFilterLeads([])
          setLeadsList([])
          setNextCursorValue(0) // Reset cursor when clearing
          nextCursorRef.current = 0 // Reset ref as well
          setShowNoLeadsLabel(true)
          handleClosePopup()
        }
      }
    } catch (error) {
      // console.error("ERror occured in del smart list api is:", error);
    } finally {
      setDelSmartListLoader(false)
    }
  }

  // function to handle select data change
  const handleFromDateChange = (date) => {
    setSelectedFromDate(date) // Set the selected date
    setShowFromDatePicker(false)
  }

  const handleToDateChange = (date) => {
    setSelectedToDate(date) // Set the selected date
    setShowToDatePicker(false)
  }

  function getFilterText() {
    //fromDate=${formtFromDate}&toDate=${formtToDate}&stageIds=${stages}&offset=${offset}
    if (filtersSelected.length == 0) {
      return null
    }
    let string = `sheetId=${SelectedSheetId}`
    let stageIds = ''
    let stageSeparator = ''
    filtersSelected.map((filter) => {
      if (filter.key == 'date') {
        const formtFromDate = moment(filter.values[0]).format('MM/DD/YYYY')
        const formtToDate = moment(filter.values[1]).format('MM/DD/YYYY')
        string = `${string}&fromDate=${formtFromDate}&toDate=${formtToDate}`
      }
      if (filter.key == 'stage') {
        stageIds = `${stageIds}${stageSeparator}${filter.values[0].id}`
        stageSeparator = ','
      }
      if (filter.key == 'pipeline') {
        // string = `${string}&pipelineId=${selectedPipeline}`
        // stageSeparator = ","
      }
    })
    // string = `${string}&stageIds=${stageIds}`;
    if (stageIds.length > 0) {
      string = `${string}&stageIds=${stageIds}`
    }

    return string
  }

  function getLocallyCachedLeads() {
    ////console.log;
    const id = SelectedSheetId
    //Set leads in cache
    let leadsData = LeadsInSheet[SelectedSheetId] || null
    ////console.log;
    if (!leadsData) {
      ////console.log;
      let d = localStorage.getItem(`Leads${SelectedSheetId}`)
      if (d) {
        ////console.log;
        leadsData = JSON.parse(d)
      }
    }
    ////console.log;
    let leads = leadsData?.data
    let leadColumns = leadsData?.columns
    // setSelectedSheetId(item.id);
    // setLeadsList([]);
    // setFilterLeads([]);
    if (leads && leadColumns) {
      // //////console.log
      setLeadsList((prevDetails) => [...prevDetails, ...leads])
      setFilterLeads((prevDetails) => [...prevDetails, ...leads])
      let dynamicColumns = []
      if (leads.length > 0) {
        dynamicColumns = [
          ...leadColumns,
          // { title: "Tag" },
          {
            title: 'More',
            idDefault: false,
          },
        ]
      }
      // setLeadColumns(response.data.columns);
      setLeadColumns(dynamicColumns)
      // return
    } else {
      ////console.log;
    }
  }

  //function for filtering leads (using cursor-based pagination like Userleads)
  const handleFilterLeads = async (filterText = null, append = false) => {
    // Use ref value for API call to ensure we always use the latest cursor
    const currentCursor = nextCursorRef.current
    
    // If appending (lazy load), check if already loading to prevent duplicates (like subaccounts)
    if (append) {
      if (isLoadingMoreRef.current) {
        return
      }
      setMoreLeadsLoader(true)
      isLoadingMoreRef.current = true
    } else {
      setSheetsLoader(true)
      // Reset cursor when starting fresh
      setNextCursorValue(0)
      nextCursorRef.current = 0
      setHasMore(true)
      isLoadingMoreRef.current = false
    }
    
    const currentRequestVersion = ++requestVersion.current
    const currentSheetId = SelectedSheetId // Capture the sheet ID at request start
    try {
      // Only set loading if this is still the current request and sheet
      if (currentRequestVersion === requestVersion.current && currentSheetId === SelectedSheetId) {
        if (!append) {
          setMoreLeadsLoader(true)
        }
      }

      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      //////console.log;
      //   const formtFromDate = moment(selectedFromDate).format("MM/DD/YYYY");
      //   const formtToDate = moment(selectedToDate).format("MM/DD/YYYY");
      //////console.log;

      //   const id = currentSheet.id;
      //   let stageIds = selectedStage.map((stage) => stage.id);
      //   const stages = stageIds.join(",");
      //   //////console.log;
      let ApiPath = null
      if (filterText) {
        ApiPath = `${Apis.getLeads}?${filterText}`
        if (currentCursor && currentCursor != 'undefined' && currentCursor != 0) {
          ApiPath = ApiPath + `&id=${currentCursor}`
        }
      } else {
        if (currentCursor == 0) {
          getLocallyCachedLeads()
        }
        ApiPath = `${Apis.getLeads}?sheetId=${SelectedSheetId}`
        if (currentCursor && currentCursor != 'undefined' && currentCursor != 0) {
          ApiPath = ApiPath + `&id=${currentCursor}`
        }
      }
      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          // "Content-Type": "application/json"
        },
      })

      if (response) {
        if (currentRequestVersion === requestVersion.current) {
          const responseData = response.data
          const responseLeads = responseData?.data || []
          const newCursor = responseData?.nextCursor ?? 0
          const apiHasMore = responseData?.hasMore ?? false

          // Capture the OLD cursor value before updating (to determine if this was first load)
          const wasFirstLoad = !currentCursor || currentCursor === 0

          // Update cursor value from API response (both state and ref)
          // IMPORTANT: Update ref FIRST, then state, to ensure ref is always current
          nextCursorRef.current = newCursor // Update ref synchronously FIRST
          setNextCursorValue(newCursor) // Then update state

          if (response.data.status === true) {
            setShowFilterModal(false)
            setTotalLeads(response.data.leadCount)

            const data = responseLeads
            // Get sheetId from response to verify it matches current selection
            let sheetId = null
            if (data && data.length > 0) {
              sheetId = data[0].sheetId
            }
            
            // Only process response if it matches the currently selected sheet
            // This prevents race conditions when switching sheets quickly
            // For empty responses, we process them if it's the first page
            // because empty responses don't have a sheetId but should still be shown for the current sheet
            const shouldProcess = (sheetId == SelectedSheetId) || 
              (data.length === 0 && wasFirstLoad)
            
            if (shouldProcess) {
              if (wasFirstLoad) {
                // First page load
                if (data.length > 0) {
                  setShowNoLeadsLabel(null)
                } else {
                  setShowNoLeadsLabel(true)
                }

                // Only set leads if sheet matches (or empty response for first page)
                if (sheetId == SelectedSheetId || data.length === 0) {
                  if (data.length > 0 && sheetId == SelectedSheetId) {
                    LeadsInSheet[SelectedSheetId] = response.data
                    localStorage.setItem(
                      `Leads${SelectedSheetId}`,
                      JSON.stringify(response.data),
                    )
                  }

                  setLeadsList(data)
                  setFilterLeads(data)
                }
              } else {
                // For pagination, append leads only if sheet matches
                setShowNoLeadsLabel(false)
                if (sheetId == SelectedSheetId && data.length > 0) {
                  setLeadsList((prevDetails) => [...prevDetails, ...data])
                  setFilterLeads((prevDetails) => [...prevDetails, ...data])
                }
              }

              // Set columns only if sheet matches or it's an empty response
              if (sheetId == SelectedSheetId || (data.length === 0 && wasFirstLoad)) {
                let leads = data
                let leadColumns = response.data.columns
                if (leads && leadColumns) {
                  let dynamicColumns = []
                  if (leads.length > 0) {
                    dynamicColumns = [
                      ...leadColumns,
                      {
                        title: 'More',
                        idDefault: false,
                      },
                    ]
                  }
                  setLeadColumns(dynamicColumns)
                } else if (data.length === 0) {
                  // Clear columns if no leads for this sheet
                  setLeadColumns([])
                }
              }
            } else {}

            setHasMore(apiHasMore)
          } else {
            setHasMore(false)
          }
        }
      }
    } catch (error) {
      console.error("Error occured in api is :", error);
      setMoreLeadsLoader(false)
      setSheetsLoader(false)
      isLoadingMoreRef.current = false // Reset flag on error
    } finally {
      // Only clear loading if this is still the current request
      // This prevents old requests from clearing the loader when a new request has started
      if (currentRequestVersion === requestVersion.current) {
        setMoreLeadsLoader(false)
        setSheetsLoader(false)
        isLoadingMoreRef.current = false // Reset flag after request completes
      }
    }
  }

  //function for getting the leads
  const getLeads = async (item, offset = 0, oldSheet) => {
    try {
      setSheetsLoader(true)
      const id = item.id
      //Set leads in cache
      let leadsData = LeadsInSheet[id] || null
      if (!leadsData) {
        //////console.log;
        let d = localStorage.getItem(`Leads${id}`)
        if (d) {
          //////console.log;
          leadsData = JSON.parse(d)
        }
      }
      let leads = leadsData?.data
      let leadColumns = leadsData?.columns
      setSelectedSheetId(item.id)
      setLeadsList([])
      setFilterLeads([])
      setNextCursorValue(0) // Reset cursor when sheet changes
      nextCursorRef.current = 0 // Reset ref as well
      if (leads && leadColumns) {
        // //////console.log
        setLeadsList((prevDetails) => [...prevDetails, ...leads])
        setFilterLeads((prevDetails) => [...prevDetails, ...leads])
        let dynamicColumns = []
        if (leads.length > 0) {
          dynamicColumns = [
            ...leadColumns,
            // { title: "Tag" },
            {
              title: 'More',
              idDefault: false,
            },
          ]
        }
        // setLeadColumns(response.data.columns);
        setLeadColumns(dynamicColumns)
        // return
      } else {
        //////console.log;
      }

      // setSheetsLoader(true);

      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      //////console.log;

      //////console.log;

      // const ApiPath = `${Apis.getLeads}?sheetId=${id}`;

      const formtFromDate = moment(selectedFromDate).format('MM/DD/YYYY')
      const formtToDate = moment(selectedToDate).format('MM/DD/YYYY')

      let ApiPath = null
      const stages = selectedStage.join(',')
      if (selectedFromDate && selectedToDate) {
        ApiPath = `${Apis.getLeads}?sheetId=${id}&fromDate=${formtFromDate}&toDate=${formtToDate}&stageIds=${stages}&offset=${offset}`
      } else {
        ApiPath = `${Apis.getLeads}?sheetId=${id}&offset=${offset}`
      }

      //////console.log;

      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          // "Content-Type": "application/json"
        },
      })

      if (response) {
        //////console.log;
        let leadData = []
        let leadColumns = []
        // setLeadsList(response.data.data);
        // setFilterLeads(response.data.data);

        const data = response.data.data
        //////console.log;
        let firstLead = null
        if (data.length > 0) {
          //////console.log;
          let l = data[0]
          let sheetOfLead = l.sheetId
          //////console.log;
          if (item.id == sheetOfLead) {
            //////console.log;
            setLeadsList([...data])
            setFilterLeads([...data])
          }
        }
        // if (SelectedSheetId == item.id || SelectedSheetId == null) {
        //   setLeadsList([...data]);
        //   setFilterLeads([...data]);
        // }

        leadData = data

        if (leads) {
          // leads = {...leads, ...data}
        } else {
          LeadsInSheet[id] = response.data
          localStorage.setItem(`Leads${id}`, JSON.stringify(response.data))
        }
        let dynamicColumns = []
        if (response.data.data.length > 0) {
          dynamicColumns = [
            ...response.data.columns,
            // { title: "Tag" },
            {
              title: 'More',
              idDefault: false,
            },
          ]
        }
        // setLeadColumns(response.data.columns);
        setLeadColumns(dynamicColumns)
        leadColumns = response.data.columns
        //////console.log;
        //////console.log;
      }
    } catch (error) {
      // console.error("Error occured in api is :", error);
    } finally {
      setSheetsLoader(false)
      //////console.log;
    }
  }

  //function to add lead notes
  const handleAddLeadNotes = async () => {
    try {
      setAddLeadNoteLoader(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      //////console.log;

      const ApiData = {
        note: addNotesValue,
        leadId: selectedLeadsDetails.id,
      }

      //////console.log;

      const ApiPath = Apis.addLeadNote
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        //////console.log;
        // setNoteDetails()
        if (response.data.status === true) {
          setShowAddNotes(false)
          setNoteDetails([response.data.data, ...noteDetails])
          setddNotesValue('')
        }
      }
    } catch (error) {
      // console.error("Error occured in add lead note api is:", error);
    } finally {
      setAddLeadNoteLoader(false)
    }
  }

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
  //                     className="underline text-brand-primary"
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
    const { title } = column

    // //////console.log;
    // //////console.log;

    switch (title) {
      case 'Name':
        return (
          <div>
            <div className="w-full flex flex-row items-center gap-2 truncate">
              {toggleClick.includes(item.id) ? (
                <button
                  className="h-[20px] w-[20px] border rounded bg-brand-primary outline-none flex flex-row items-center justify-center"
                  onClick={() => handleToggleClick(item.id)}
                >
                  <Image className=" object-contain pb-0.5"
                    src={'/assets/whiteTick.png'}
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
                className="h-[32px] w-[32px] bg-black rounded-full flex flex-row items-center justify-center text-white"
                onClick={() => handleToggleClick(item.id)}
              >
                {item.firstName.slice(0, 1)}
              </div>
              <div
                className="truncate cursor-pointer"
                onClick={() => handleToggleClick(item.id)}
              >
                {item.firstName} {item.lastName}
              </div>
            </div>
          </div>
        )
      case 'Phone':
        return (
          <button onClick={() => handleToggleClick(item.id)}>
            {item.phone ? item.phone : '-'}
          </button>
        )
      case 'Stage':
        return (
          <button onClick={() => handleToggleClick(item.id)}>
            {item.stage ? item.stage.stageTitle : 'No Stage'}
          </button>
        )
      // case "Date":
      //     return item.createdAt ? moment(item.createdAt).format('MMM DD, YYYY') : "-";
      case 'More':
        return (
          <button
            className="underline text-brand-primary"
            onClick={() => {
              // //console.log;
              setSelectedLeadsDetails(item) // Pass selected lead data
              setNoteDetails(item.notes)
              setShowDetailsModal(true) // Show modal
              setColumns(column)
            }}
          >
            Details
          </button>
        )
      default:
        const value = item[title]
        if (typeof value === 'object' && value !== null) {
          JSON.stringify(value)
        }
        return (
          <div
            className="cursor-pointer"
            onClick={() => {
              handleToggleClick(item.id)
            }}
          >
            {value || '-'}
          </div>
        )
    }
  }

  //stoped for some reason
  const getDetailsColumnData = (column, item) => {
    let filteredColumns = column

    const { title } = filteredColumns

    // //////console.log;
    // //////console.log;

    if (item) {
      switch (title) {
        case 'Name':
          return <div></div>
        case 'Date':
          return item.createdAt ? GetFormattedDateString(item?.createdAt) : '-'
        case 'Phone':
          return '-'
        case 'Stage':
          return item.stage ? item.stage.stageTitle : 'No Stage'
        default:
          const value = item[title]
          if (typeof value === 'object' && value !== null) {
            // Handle objects gracefully
            return JSON.stringify(value) // Convert to string or handle as needed
          }
          return value || '-'
      }
    }
  }

  //code for getting the sheets
  const getSheets = async () => {
    try {
      let alreadyCached = GetAndSetDataFromLocalStorage()
      // return;
      setInitialLoader(!alreadyCached)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      //////console.log;

      const ApiPath = Apis.getSheets + '?userId=' + selectedUser.id
      //console.log;

      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        //console.log;
        if (response.data.data.length === 0) {
          handleShowUserLeads(null)
        } else {
          handleShowUserLeads('leads exist')
          setSheetsList(response.data.data)
          let sheets = response.data.data
          SetSheetsToLocalStorage(sheets)
          if (sheets.length > 0) {
            let ind = 0
            if (sheetIndexSelected < sheets.length) {
              ind = sheetIndexSelected
            }
            setCurrentSheet(response.data.data[ind])
            setSelectedSheetId(response.data.data[ind].id)
          }

          //   getLeads(response.data.data[0], 0);
        }
      }
    } catch (error) {
      // console.error("Error occured in api is :", error);
    } finally {
      setInitialLoader(false)
      //////console.log;
    }
  }

  //function to get the stages list using pipelineId
  const getStagesList = async (item) => {
    try {
      setStagesLoader(true)
      let AuthToken = null

      const localDetails = localStorage.getItem('User')
      if (localDetails) {
        const Data = JSON.parse(localDetails)
        // //////console.log;
        AuthToken = Data.token
      }

      //////console.log;

      const ApiPath = `${Apis.getStagesList}?pipelineId=${item.id}`

      //////console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        //////console.log;
        if (response.data.status === true) {
          setStagesList(response?.data?.data[0]?.stages)
        }
      }
    } catch (error) {
      // console.error("Error occured in api is", error);
    } finally {
      //////console.log;
      setStagesLoader(false)
    }
  }

  //function to get pipelines
  const getPipelines = async () => {
    try {
      let AuthToken = null

      const localDetails = localStorage.getItem('User')
      if (localDetails) {
        const Data = JSON.parse(localDetails)
        // //////console.log;
        AuthToken = Data.token
      }

      //////console.log;

      const ApiPath = Apis.getPipelines + '?userId=' + selectedUser.id

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        ////console.log(
        //   "Response of get pipelines list api is",
        //   response.data.data
        // );
        if (response.data.status === true) {
          localStorage.setItem(
            'pipelinesList',
            JSON.stringify(response.data.data),
          )
          setPipelinesList(response.data.data)
        }
      }
    } catch (error) {
      // console.error("Error occured in api is error", error);
    } finally {
      //////console.log;
    }
  }

  //code for toggle click
  const handleToggleClick = (id) => {
    if (selectedAll) {
      setSelectedAll(false)
    }
    setToggleClick((prevSelectedItems) => {
      if (prevSelectedItems.includes(id)) {
        // Remove the ID if it's already selected
        return prevSelectedItems.filter((itemId) => itemId !== id)
      } else {
        // Add the ID to the selected items
        return [...prevSelectedItems, id]
      }
    })
  }

  //close assign lead modal
  const handleCloseAssignLeadModal = ({
    status,
    showSnack,
    disSelectLeads,
  }) => {
    setAssignLeadModal(status)
    // //console.log;
    // //console.log;
    setSnackMessage(showSnack)
    if (disSelectLeads === true) {
      setToggleClick([])
      setShowSnackMessage(true)
      setMessageType(SnackbarTypes.Success)
    } else if (disSelectLeads === false) {
      setShowSnackMessage(true)
      setMessageType(SnackbarTypes.Error)
      // setToggleClick([])
    }
  }

  //code for handle search change
  const handleSearchChange = (value) => {
    if (value.trim() === '') {
      // //////console.log;
      // Reset to original list when input is empty
      setFilterLeads(LeadsList)
      return
    }

    const filtered = LeadsList.filter((item) => {
      const term = value.toLowerCase()
      return (
        item.firstName?.toLowerCase().includes(term) ||
        item.lastName?.toLowerCase().includes(term) ||
        item.address?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        (item.phone && item.phone.includes(term))
      )
    })

    setFilterLeads(filtered)
  }

  function HandleUpdateStage(stage) {
    // setShowDetailsModal(false);

    // //console.log;
    // //console.log;
    let selLead = selectedLeadsDetails
    selLead.stage = stage
    let newList = []
    LeadsList.map((lead) => {
      if (selLead.id == lead.id) {
        newList.push(selLead)
      } else {
        newList.push(lead)
      }
    })

    setLeadsList(newList)
    let filteredList = []
    FilterLeads.map((lead) => {
      if (selLead.id == lead.id) {
        filteredList.push(selLead)
      } else {
        filteredList.push(lead)
      }
    })
    setFilterLeads(filteredList)
    // //console.log;
    // //console.log;

    localStorage.setItem(
      `Leads${SelectedSheetId}`,
      JSON.stringify(filteredList),
    )
    // setLeadsList(filtered);
    // setFilterLeads(filtered);
  }


  const styles = {
    heading: {
      fontWeight: '700',
      fontSize: 17,
    },
    paragraph: {
      fontWeight: '500',
      fontSize: 15,
    },
    modalsStyle: {
      height: 'auto',
      bgcolor: 'transparent',
      // p: 2,
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-55%)',
      borderRadius: 2,
      border: 'none',
      outline: 'none',
    },
    subHeading: {
      fontWeight: '500',
      fontSize: 12,
      color: '#00000060',
    },
    heading2: {
      fontWeight: '500',
      fontSize: 15,
      color: '#00000080',
    },
  }

  function getFilterTitle(filter) {
    if (filter.key == 'date') {
      let string = ''
      let values = filter.values
      if (values.length > 0) {
        string = moment(values[0]).format('MMM Do') + ''
        if (values.length > 1) {
          string = `${string} -
            ${moment(values[1]).format('MMM Do')}`
        }
        return string
      }

      return string
    }
    if (filter.key == 'stage') {
      let values = filter.values
      if (values.length > 0) {
        let stageTitle = values[0].stageTitle
        return stageTitle
      }
      return ''
    }
    if (filter.key == 'pipeline') {
      let values = filter.values
      if (values.length > 0) {
        let stageTitle = values[0]
        return stageTitle
      }
      return ''
    }
  }

  function setFiltersFromSelection() {
    let filters = []
    if (selectedFromDate && selectedToDate) {
      let dateFilter = {
        key: 'date',
        values: [selectedFromDate, selectedToDate],
      }
      filters.push(dateFilter)
    }
    if (selectedPipeline) {
      let dateFilter = {
        key: 'pipeline',
        values: [selectedPipeline],
      }
      filters.push(dateFilter)
    }
    if (selectedStage && selectedStage.length > 0) {
      selectedStage.map((stage) => {
        let dateFilter = {
          key: 'stage',
          values: [stage],
        }
        filters.push(dateFilter)
      })
    }

    setFiltersSelected(filters)
  }

  return (
    <div className="w-full flex flex-col items-center h-full justify-start">
      {/* Slider code */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
        }}
      >
        <DashboardSlider needHelp={false} selectedUser={userDetails} />
      </div>
      <AgentSelectSnackMessage
        isVisible={showsnackMessage}
        hide={() => setShowSnackMessage(false)}
        message={snackMessage}
        type={messageType}
      />
      <div
        className="flex flex-row items-center justify-between w-full px-4"
        style={{ }}
        // style={{ borderBottom: "1px solid #15151510" }}
      >
        <div className="flex fex-row items-center gap-2">
          <TypographyH3>Leads</TypographyH3>
          {userDetails?.currentUsage?.maxLeads &&
            userDetails?.planCapabilities?.maxLeads < 10000000 &&
            userDetails?.plan?.planId != null && (
              <div
                style={{ fontSize: 14, fontWeight: '400', color: '#0000080' }}
              >
                {`${formatFractional2(userDetails?.currentUsage?.maxLeads)}/${formatFractional2(userDetails?.planCapabilities?.maxLeads) || 0} used`}
              </div>
            )}
        </div>

        <div className="flex fex-row items-center gap-6">
          <button
            style={{
              backgroundColor: toggleClick.length > 0 ? 'hsl(var(--brand-primary))' : '',
              color: toggleClick.length > 0 ? 'white' : '#000000',
            }}
            className="flex flex-row items-center gap-4 h-[50px] rounded-lg bg-[#33333315] w-[189px] justify-center"
            onClick={() => {
              if (userLocalDetails?.plan) {
                setAssignLeadModal(true)
              } else {
                setSnackMessage('Add payment method to continue')
                setShowSnackMessage(true)
                setMessageType(SnackbarTypes.Warning)
              }
            }}
            disabled={!toggleClick.length > 0}
          >
            {toggleClick.length > 0 ? (
              <Image
                src={'/assets/callBtnFocus.png'}
                height={17}
                width={17}
                alt="*"
              />
            ) : (
              <Image
                src={'/assets/callBtn.png'}
                height={17}
                width={17}
                alt="*"
              />
            )}
            <span style={styles.heading}>Start Campaign</span>
          </button>
          {/* <div className="flex flex-col">
            <NotficationsDrawer />
          </div> */}
        </div>
      </div>
      <div className="w-[95%] pe-12 mt-2">
        {initialLoader ? (
          <div className="w-full h-screen flex flex-row justify-center mt-12">
            <CircularProgress size={35} sx={{ color: 'hsl(var(--brand-primary))' }} />
          </div>
        ) : (
          <div>
            <div className="flex flex-row items-center justify-end">
              <div className="flex flex-row items-center gap-6">
                <Modal
                  open={AssignLeadModal}
                  onClose={() => setAssignLeadModal(false)}
                  closeAfterTransition
                  BackdropProps={{
                    timeout: 100,
                    sx: {
                      backgroundColor: '#00000020',
                      // //backdropFilter: "blur(5px)",
                    },
                  }}
                >
                  <Box className="w-[80%] sm:w-[546px]" sx={styles.modalsStyle}>
                    <div className="flex flex-row justify-center w-full">
                      <div
                        className="w-full"
                        style={{
                          backgroundColor: '#ffffff',
                          padding: 20,
                          borderRadius: '13px',
                          paddingTop: 30,
                          paddingBottom: 30,
                        }}
                      >
                        <div className="flex flex-row justify-end">
                          <CloseBtn onClick={() => setAssignLeadModal(false)} />
                        </div>
                        <div className="w-full">
                          <AdminAssignLead
                            selectedLead={toggleClick}
                            selectedAll={selectedAll}
                            handleCloseAssignLeadModal={
                              handleCloseAssignLeadModal //(false, showSnack, disSelectLeads)
                            }
                            leadIs={toggleClick}
                            userProfile={userLocalDetails}
                            selectedUser={selectedUser}
                            totalLeads={totalLeads}
                            sheetId={SelectedSheetId}
                          />
                        </div>

                        {/* Can be use full to add shadow */}
                        {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                      </div>
                    </div>
                  </Box>
                </Modal>
              </div>
            </div>
           
            <div className="flex flex-row items-center justify-between w-full mt-4 w-full">
              <div className="flex flex-row items-center gap-4 overflow-none flex-shrink-0 w-[90%]">
                <div className="flex flex-row items-center gap-1 w-[22vw] flex-shrink-0 border  rounded-full pe-2">
                  <input
                    style={styles.paragraph}
                    className="outline-none border-none w-full bg-transparent focus:outline-none focus:ring-0 rounded-full"
                    placeholder="Search by name, email or phone"
                    value={searchLead}
                    onChange={(e) => {
                      const value = e.target.value
                      setSearchLead(e.target.value)
                      handleSearchChange(value)
                    }}
                  />
                  <button className="outline-none border-none">
                    <Image
                      src={'/assets/searchIcon.png'}
                      height={24}
                      width={24}
                      alt="*"
                    />
                  </button>
                </div>
                <button
                  className="outline-none flex-shrink-0"
                  onClick={() => {
                    setShowFilterModal(true)
                  }}
                >
                  <Image
                    src={'/assets/filterIcon.png'}
                    height={16}
                    width={16}
                    alt="*"
                  />
                </button>
                {/* Show filters here in a row*/}
                <div
                  className="flex flex-row items-center gap-4 flex-shrink-0 overflow-auto w-[60%] "
                  style={{
                    scrollbarColor: '#00000000',
                    scrollbarWidth: 'none',
                  }}
                >
                  {filtersSelected.map((filter, index) => {
                    //////console.log;
                    return (
                      <div className="flex-shrink-0" key={filter.key + index}>
                        <div
                          className="px-4 py-2 bg-brand-primary/10 text-brand-primary  flex-shrink-0 rounded-[25px] flex flex-row items-center gap-2"
                          style={{ fontWeight: '500', fontSize: 15 }}
                        >
                          {getFilterTitle(filter)}
                          <button
                            className="outline-none"
                            onClick={() => {
                              let filters = []
                              let stages = []
                              let pipeline = null
                              let fromDate = null
                              let toDate = null
                              filtersSelected.map((f, ind) => {
                                if (index != ind) {
                                  filters.push(f)
                                  if (f.key == 'stage') {
                                    stages.push(f.values[0])
                                  }
                                  if (f.key == 'pipeline') {
                                    pipeline = f.values[0]
                                  }
                                  if (f.key == 'date') {
                                    fromDate = f.values[0]
                                    toDate = f.values[1]
                                  }
                                } else {
                                }
                              })

                              //////console.log;
                              //////console.log;
                              //////console.log;
                              // //console.log;
                              setSelectedStage(stages)
                              setSelectedFromDate(fromDate)
                              setSelectedToDate(toDate)
                              setSelectedPipeline(pipeline)
                              //   setFilterLeads([]);
                              //   setLeadsList([]);
                              //   setTimeout(() => {
                              //     let filterText = getFilterText();
                              //     handleFilterLeads(0, filterText);
                              //   }, 1000);

                              //   filters.splice(index, 1);
                              //////console.log;
                              setFiltersSelected(filters)
                            }}
                          >
                            <CloseBtn onClick={() => {}} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-row items-center gap-2 w-[40%]">
                {toggleClick.length >= 0 && (
                  <div>
                    {toggleClick.length === FilterLeads.length ? (
                      <div>
                        {LeadsList.length > 0 && (
                          <div className="flex flex-row items-center gap-2">
                            <button
                              className="h-[20px] w-[20px] border rounded bg-brand-primary outline-none flex flex-row items-center justify-center"
                              onClick={() => {
                                setToggleClick([])
                                setSelectedAll(false)
                              }}
                            >
                              <Image
                                src={'/assets/whiteTick.png'}
                                height={10}
                                width={10}
                                alt="*"
                              />
                            </button>
                            <div
                              style={{
                                fontSize: '15',
                                fontWeight: '600',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Select All
                            </div>
                            <div style={{ fontSize: '15', fontWeight: '600', whiteSpace: 'nowrap' }}>
                              {/*getLeadSelectedCount()*/}
                              {totalLeads}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-row items-center gap-2">
                        <button
                          className="h-[20px] w-[20px] border-2 rounded outline-none"
                          onClick={() => {
                            setToggleClick(FilterLeads.map((item) => item.id))
                            setSelectedAll(true)
                          }}
                        ></button>
                        <div style={{ fontSize: '15', fontWeight: '600', whiteSpace: 'nowrap' }}>
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
                  overflowY: 'hidden',
                  scrollbarWidth: 'none', // For Firefox
                  msOverflowStyle: 'none', // For Internet Explorer and Edge
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
                            ? '2px solid hsl(var(--brand-primary))'
                            : '',
                        color: SelectedSheetId === item.id ? 'hsl(var(--brand-primary))' : '',
                        whiteSpace: 'nowrap', // Prevent text wrapping
                      }}
                      // className='flex flex-row items-center gap-1 px-3'
                      // style={{ borderBottom: SelectedSheetId === item.id ? "2px solid hsl(var(--brand-primary))" : "", color: SelectedSheetId === item.id ? "hsl(var(--brand-primary))" : "" }}
                    >
                      <button
                        style={styles.paragraph}
                        className="outline-none w-full"
                        onClick={() => {
                          setSearchLead('')
                          setSelectedSheetId(item.id)
                          setToggleClick([])
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
                          handleShowPopup(event, item)
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
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'left', // Ensures the Popover's top right corner aligns with the anchor point
                        }}
                        PaperProps={{
                          elevation: 0, // This will remove the shadow
                          style: {
                            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.05)',
                            borderRadius: '10px',
                            width: '120px',
                          },
                        }}
                      >
                        <div
                          className="p-2 flex flex-col gap-2"
                          style={{ fontWeight: '500', fontSize: 15 }}
                        >
                          {delSmartListLoader ? (
                            <CircularProgress size={15} sx={{ color: 'hsl(var(--brand-primary))' }} />
                          ) : (
                            <button
                              className="text-red flex flex-row items-center gap-1"
                              onClick={handleDeleteSmartList}
                            >
                              <Image
                                src={'/assets/delIcon.png'}
                                height={18}
                                width={18}
                                alt="*"
                              />
                              <p
                                className="text-red"
                                style={{ fontWeight: '00', fontSize: 16 }}
                              >
                                Delete
                              </p>
                            </button>
                          )}
                        </div>
                      </Popover>
                    </div>
                  )
                })}
              </div>
              <button
                className="flex flex-row items-center gap-1 text-brand-primary flex-shrink-0"
                style={styles.paragraph}
                // onClick={() => { setShowAddNewSheetModal(true) }}
                onClick={() => {
                  handleShowAddLeadModal(true)
                }}
              >
                <Plus size={15} color="hsl(var(--brand-primary))" weight="bold" />
                <span>New Leads</span>
              </button>
            </div>

            {/* <div className='w-full flex flex-row items-center mt-4' style={{ ...styles.paragraph, color: "#00000060" }}>
                                <div className='w-2/12'>Name</div>
                                <div className='w-2/12'>Email</div>
                                <div className='w-2/12'>Phone Number</div>
                                <div className='w-2/12'>Address</div>
                                <div className='w-2/12'>Tag</div>
                                <div className='w-2/12 flex flex-row items-center'>
                                    <div className='w-5/12'>Stage</div>
                                    <div className='w-5/12'>Date</div>
                                    <div className='w-2/12'>More</div>
                                </div>
                            </div> */}

            {sheetsLoader ? (
              <div className="w-full flex flex-row justify-center mt-12 ">
                <CircularProgress size={30} sx={{ color: 'hsl(var(--brand-primary))' }} />
              </div>
            ) : (
              <div className="w-full flex flex-col">
                {LeadsList.length > 0 ? (
                  <div
                    className={`relative overflow-auto pb-[100px] mt-6 ${agencyUser ? 'h-[75vh]' : 'h-[70vh]'}`}
                    id="adminLeadsScrollableDiv"
                    data-component="AdminLeads"
                    ref={setLeadsScrollRootEl}
                    style={{ scrollbarWidth: 'none', height: agencyUser ? '75vh' : '70vh', maxHeight: agencyUser ? '75vh' : '70vh' }}
                  >
                    {/* Global (fixed) loading pill so it's always visible */}
                    {(moreLeadsLoader || sheetsLoader) && hasMore && (
                      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2">
                        <div className="flex flex-row items-center gap-2 rounded-full border border-black/10 bg-white/95 px-4 py-2 shadow-lg backdrop-blur">
                          <CircularProgress
                            size={18}
                            sx={{ color: 'hsl(var(--brand-primary))' }}
                          />
                          <span
                            style={{
                              fontWeight: '500',
                              fontFamily: 'inter',
                              fontSize: 12,
                              color: '#00000080',
                            }}
                          >
                            Loading more…
                          </span>
                        </div>
                      </div>
                    )}

                    <InfiniteScroll
                      isLoading={moreLeadsLoader || sheetsLoader}
                      hasMore={hasMore}
                      root={leadsScrollRoot}
                      rootMargin="200px"
                      threshold={1}
                      next={() => {
                        const cursorToUse = nextCursorRef.current
                        if (isLoadingMoreRef.current) return
                        if (moreLeadsLoader || sheetsLoader) return
                        // Avoid repeated calls when sentinel stays visible
                        if (!FilterLeads || FilterLeads.length === 0) return
                        if (!cursorToUse || cursorToUse === 0) return
                        if (lastNextCursorRequestedRef.current === cursorToUse) return
                        lastNextCursorRequestedRef.current = cursorToUse
                        const filterText = getFilterText()
                        handleFilterLeads(filterText, true)
                      }}
                    >
                      <div className="flex flex-col w-full pb-[20px]">
                        <table className="table-auto w-full border-collapse border border-none">
                          <thead>
                            <tr style={{ fontWeight: '500' }}>
                              {leadColumns.map((column, index) => {
                                const isMoreColumn = column.title === 'More'
                                const isDateColumn = column.title === 'Date'
                                const columnWidth =
                                  column.title === 'More' ? '200px' : '150px'
                                return (
                                  <th
                                    key={index}
                                    className={`border-none px-4 py-2 text-left text-[#00000060] font-[500] ${
                                      isMoreColumn
                                        ? 'sticky right-0 bg-white'
                                        : ''
                                    }`}
                                    style={{
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      zIndex:
                                        isMoreColumn === 'More' ? 1 : 'auto',
                                      maxWidth: columnWidth,
                                    }}
                                  >
                                    {column.title.slice(0, 1).toUpperCase()}
                                    {column.title.slice(1)}
                                  </th>
                                )
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {FilterLeads.map((item, index) => {
                              return (
                                <tr key={index} className="hover:bg-gray-50">
                                  {leadColumns.map((column, colIndex) => (
                                    <td
                                      key={colIndex}
                                      className={`border-none px-4 py-2 ${
                                        column.title === 'More'
                                          ? 'sticky right-0 bg-white'
                                          : ''
                                      }`}
                                      style={{
                                        whiteSpace: 'nowrap',
                                        zIndex:
                                          column.title === 'More' ? 1 : 'auto',
                                        width: '200px',
                                      }}
                                    >
                                      {getColumnData(column, item)}
                                    </td>
                                  ))}
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {moreLeadsLoader && (
                        <div className="w-full flex flex-row justify-center mt-8">
                          <CircularProgress
                            size={35}
                            sx={{ color: 'hsl(var(--brand-primary))' }}
                          />
                        </div>
                      )}

                      {/* Visible loading overlay (so you can see it even when we prefetch) */}
                      {(moreLeadsLoader || sheetsLoader) && hasMore && (
                        <div className="pointer-events-none absolute bottom-3 left-0 z-50 w-full flex justify-center">
                          <div className="flex flex-row items-center gap-2 rounded-full border border-black/10 bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
                            <CircularProgress
                              size={18}
                              sx={{ color: 'hsl(var(--brand-primary))' }}
                            />
                            <span
                              style={{
                                fontWeight: '500',
                                fontFamily: 'inter',
                                fontSize: 12,
                                color: '#00000080',
                              }}
                            >
                              Loading more…
                            </span>
                          </div>
                        </div>
                      )}

                      {!hasMore && FilterLeads.length > 0 && (
                        <p
                          style={{
                            textAlign: 'center',
                            paddingTop: '10px',
                            fontWeight: '400',
                            fontFamily: 'inter',
                            fontSize: 16,
                            color: '#00000060',
                          }}
                        >
                          You're all caught up
                        </p>
                      )}

                      {/* sentinel (must be the last child) */}
                      <div aria-hidden="true" className="h-px w-full" />
                    </InfiniteScroll>
                  </div>
                ) : (
                  <div
                    className="text-xl text-center mt-8"
                    style={{ fontWeight: '700', fontSize: 22 }}
                  >
                    {showNoLeadsLabel == true ? 'No leads found' : 'Loading...'}
                  </div>
                )}
              </div>
            )}

            {/* <div> */}
            <Modal
              open={showFilterModal}
              closeAfterTransition
              BackdropProps={{
                sx: {
                  backgroundColor: '#00000020',
                  maxHeight: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  // //backdropFilter: "blur(5px)",
                },
              }}
            >
              <Box
                className="flex flex-row justify-center items-start lg:w-4/12 sm:w-7/12 w-8/12 py-2 px-6 bg-white max-h-[75svh]  overflow-auto md:overflow-auto"
                sx={{
                  ...styles.modalsStyle,
                  scrollbarWidth: 'none',
                  backgroundColor: 'white',
                }}
              >
                <div className="w-full flex flex-col items-center justify-start ">
                  <div className="flex flex-row items-center justify-between w-full">
                    <div>Filter</div>
                    <CloseBtn onClick={() => setShowFilterModal(false)} />
                  </div>
                  <div className="mt-2 w-full overflow-auto h-[85%]">
                    <div className="flex flex-row items-start gap-4">
                      <div className="w-1/2 h-full">
                        <div
                          className="h-full"
                          style={{
                            fontWeight: '500',
                            fontSize: 12,
                            color: '#00000060',
                            marginTop: 10,
                          }}
                        >
                          From
                        </div>
                        <div>
                          <button
                            style={{ border: '1px solid #00000020' }}
                            className="flex flex-row items-center justify-between p-2 rounded-lg mt-2 w-full justify-between"
                            onClick={() => {
                              setShowFromDatePicker(true)
                            }}
                          >
                            <p>
                              {selectedFromDate
                                ? selectedFromDate.toDateString()
                                : 'Select Date'}
                            </p>
                            <CalendarDots weight="regular" size={25} />
                          </button>

                          <div>
                            {showFromDatePicker && (
                              <div>
                                {/* <div className='w-full flex flex-row items-center justify-start -mb-5'>
                                                                    <button>
                                                                        <Image src={"/assets/cross.png"} height={18} width={18} alt='*' />
                                                                    </button>
                                                                </div> */}
                                <Calendar
                                  onChange={handleFromDateChange}
                                  value={selectedFromDate}
                                  locale="en-US"
                                  onClose={() => {
                                    setShowFromDatePicker(false)
                                  }}
                                  tileClassName={({ date, view }) => {
                                    const today = new Date()

                                    // Highlight the current date
                                    if (
                                      date.getDate() === today.getDate() &&
                                      date.getMonth() === today.getMonth() &&
                                      date.getFullYear() === today.getFullYear()
                                    ) {
                                      return 'current-date' // Add a custom class for current date
                                    }

                                    return null // Default for other dates
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-1/2 h-full">
                        <div
                          style={{
                            fontWeight: '500',
                            fontSize: 12,
                            color: '#00000060',
                            marginTop: 10,
                          }}
                        >
                          To
                        </div>
                        <div>
                          <button
                            style={{ border: '1px solid #00000020' }}
                            className="flex flex-row items-center justify-between p-2 rounded-lg mt-2 w-full justify-between"
                            onClick={() => {
                              setShowToDatePicker(true)
                            }}
                          >
                            <p>
                              {selectedToDate
                                ? selectedToDate.toDateString()
                                : 'Select Date'}
                            </p>
                            <CalendarDots weight="regular" size={25} />
                          </button>
                          <div>
                            {showToDatePicker && (
                              <div>
                                {/* <div className='w-full flex flex-row items-center justify-start -mb-5'>
                                                                    <button>
                                                                        <Image src={"/assets/cross.png"} height={18} width={18} alt='*' />
                                                                    </button>
                                                                </div> */}
                                <Calendar
                                  onChange={handleToDateChange}
                                  value={selectedToDate}
                                  locale="en-US"
                                  onClose={() => {
                                    setShowToDatePicker(false)
                                  }}
                                  tileClassName={({ date, view }) => {
                                    const today = new Date()

                                    // Highlight the current date
                                    if (
                                      date.getDate() === today.getDate() &&
                                      date.getMonth() === today.getMonth() &&
                                      date.getFullYear() === today.getFullYear()
                                    ) {
                                      return 'current-date' // Add a custom class for current date
                                    }

                                    return null // Default for other dates
                                  }}
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
                        fontWeight: '500',
                        fontSize: 14,
                        color: '#00000060',
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
                              return <div style={{ color: '#aaa' }}>Select</div> // Placeholder style
                            }
                            return selected
                          }}
                          sx={{
                            border: '1px solid #00000020', // Default border
                            '&:hover': {
                              border: '1px solid #00000020', // Same border on hover
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none', // Remove the default outline
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              border: 'none', // Remove outline on focus
                            },
                            '&.MuiSelect-select': {
                              py: 0, // Optional padding adjustments
                            },
                          }}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: '30vh', // Limit dropdown height
                                overflow: 'auto', // Enable scrolling in dropdown
                                scrollbarWidth: 'none',
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
                                    setSelectedStage([])
                                    // getStagesList(item);
                                  }}
                                >
                                  {item.title}
                                </button>
                              </MenuItem>
                            )
                          })}
                        </Select>
                      </FormControl>
                    </div>

                    <div
                      className="mt-6"
                      style={{
                        fontWeight: '500',
                        fontSize: 14,
                        color: '#00000060',
                        marginTop: 10,
                      }}
                    >
                      Stage
                    </div>

                    {stagesLoader ? (
                      <div className="w-full flex flex-row justify-center mt-8">
                        <CircularProgress size={25} sx={{ color: 'hsl(var(--brand-primary))' }} />
                      </div>
                    ) : (
                      <div className="w-full flex flex-wrap gap-4">
                        {stagesList?.map((item, index) => {
                          let found = isStageSelected(item)
                          return (
                            <div
                              key={index}
                              className="flex flex-row items-center mt-2 justify-start"
                              style={{ fontSize: 15, fontWeight: '500' }}
                            >
                              <button
                                onClick={() => {
                                  handleSelectStage(item)
                                }}
                                className={`p-2 border border-[#00000020] ${
                                  found >= 0 ? `bg-purple` : 'bg-transparent'
                                } px-6
                                                                    ${
                                                                      found >= 0
                                                                        ? `text-white`
                                                                        : 'text-black'
                                                                    } rounded-2xl`}
                              >
                                {item.stageTitle}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row items-center w-full justify-between mt-4 pb-8">
                    <button
                      className="outline-none w-[105px]"
                      style={{ fontSize: 16.8, fontWeight: '600' }}
                      onClick={() => {
                        // setSelectedFromDate(null);
                        // setSelectedToDate(null);
                        // setSelectedStage(null);
                        // getLeads()
                        //   window.location.reload();
                        setFiltersSelected([])
                      }}
                    >
                      Reset
                    </button>
                    {sheetsLoader ? (
                      <CircularProgress size={25} sx={{ color: 'hsl(var(--brand-primary))' }} />
                    ) : (
                      <button
                        className="bg-purple h-[45px] w-[140px] bg-purple text-white rounded-xl outline-none"
                        style={{
                          fontSize: 16.8,
                          fontWeight: '600',
                          // backgroundColor: selectedFromDate && selectedToDate && selectedStage.length > 0 ? "" : "#00000050"
                        }}
                        onClick={() => {
                          //////console.log;
                          // setLeadsList([]);
                          // setFilterLeads([]);
                          setShowFilterModal(false)
                          setFiltersFromSelection()

                          // let filterText = getFilterText();
                          // handleFilterLeads(0, filterText);
                          // if (selectedFromDate && selectedToDate && selectedStage.length > 0) {
                          //     //////console.log;
                          //     setLeadsList([]);
                          //     setFilterLeads([]);
                          //     handleFilterLeads(0)
                          // } else {
                          //     //////console.log;
                          // }
                        }}
                      >
                        Apply Filter
                      </button>
                    )}
                  </div>
                </div>
              </Box>
            </Modal>
            {/* </div> */}

            <CreateSmartlistModal
              open={showAddNewSheetModal}
              onClose={() => setShowAddNewSheetModal(false)}
              onSuccess={(newSmartlist) => {
                setSheetsList([...SheetsList, newSmartlist])
              }}
              selectedUser={selectedUser}
            />
          </div>
        )}
      </div>

      {showDetailsModal && (
        <div
          className="overflow-scroll"
          style={{
            backgroundColor: '',
            height:
              typeof window !== 'undefined'
                ? window.innerHeight * 0.95
                : 1000 * 0.95,
            width: '100%',
          }}
        >
          <LeadDetails
            selectedUser={selectedUser}
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
            backgroundColor: '#00000020',
          },
        }}
      >
        <Box
          className="sm:w-5/12 lg:w-5/12 xl:w-4/12 w-8/12 max-h-[70vh]"
          sx={{ ...styles.modalsStyle, scrollbarWidth: 'none' }}
        >
          <div className="flex flex-row justify-center w-full h-[50vh]">
            <div
              className="w-full"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                paddingInline: 30,
                borderRadius: '13px',
                // paddingBottom: 10,
                // paddingTop: 10,
                height: '100%',
              }}
            >
              <div style={{ fontWeight: '700', fontsize: 22 }}>
                Add your notes
              </div>
              <div
                className="mt-4"
                style={{
                  height: '70%',
                  overflow: 'auto',
                }}
              >
                <TextareaAutosize
                  maxRows={12}
                  className="outline-none focus:outline-none focus:ring-0 w-full"
                  style={{
                    fontsize: 15,
                    fontWeight: '500',
                    height: '250px',
                    border: '1px solid #00000020',
                    resize: 'none',
                    borderRadius: '13px',
                  }}
                  placeholder="Add notes"
                  value={addNotesValue}
                  onChange={(event) => {
                    setddNotesValue(event.target.value)
                  }}
                />
              </div>
              <div className="w-full mt-4 h-[20%] flex flex-row justify-center">
                {addLeadNoteLoader ? (
                  <CircularProgress size={25} sx={{ color: 'hsl(var(--brand-primary))' }} />
                ) : (
                  <button
                    className="bg-purple h-[50px] rounded-xl text-white rounded-xl w-6/12"
                    style={{
                      fontWeight: '600',
                      fontsize: 16,
                    }}
                    onClick={() => {
                      handleAddLeadNotes()
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

      <div></div>
    </div>
  )
}

export default AdminLeads
