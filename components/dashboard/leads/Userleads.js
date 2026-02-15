'use client'

// Import default styles

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
import { fromJSON } from 'postcss'
import React, { useEffect, useRef, useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover as ShadPopover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import InfiniteScroll from 'react-infinite-scroll-component'
import { pipeline } from 'zod'

import { formatFractional2 } from '@/components/agency/plan/AgencyUtilities'
import { AuthToken, userLocalData } from '@/components/agency/plan/AuthDetails'
import DashboardSlider from '@/components/animations/DashboardSlider'
import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import { getUserLocalData } from '@/components/constants/constants'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'
import StandardHeader from '@/components/common/StandardHeader'
import { TypographyH3, TypographyH4 } from '@/lib/typography'
import CalendarInput from '@/components/test/DatePicker'
import UpgradeModal from '@/constants/UpgradeModal'
import { useUser } from '@/hooks/redux-hooks'
import { useHasPermission } from '@/contexts/PermissionContext'
import { GetFormattedDateString } from '@/utilities/utility'

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from './AgentSelectSnackMessage'
import AssignLead from './AssignLead'
import LeadLoading from './LeadLoading'
import AssignLeadAnimation from './assignLeadSlideAnimation/AssignLeadAnimation'
import LeadDetailsCN from './extras/LeadDetailsCN'
import { Trash } from 'lucide-react'
import LeadDetails from './extras/LeadDetails'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import CreateSmartlistModal from '@/components/messaging/CreateSmartlistModal'
import { Checkbox } from '@/components/ui/checkbox'
import TagManagerCn from './extras/TagManagerCn'

import { getUniqueTags as fetchUniqueTags, getUniqueTagsList } from '@/components/globalExtras/GetUniqueTags'


const Userleads = ({
  handleShowAddLeadModal,
  handleShowUserLeads,
  newListAdded,
  shouldSet,
  uploading,
  setSetData,
  reduxUser,
}) => {
  const LimitPerPage = 30

  // Permission for Export: agentx.leads.export (subaccount and agentx teams)
  const [hasExportPermission, isExportPermissionChecking] = useHasPermission('agentx.leads.export')



  //Sheet Caching related
  let searchParams = useSearchParams()
  const router = useRouter()
  // Read sheet parameter synchronously on component initialization
  const initialSheetParam = searchParams.get('sheet')
  const initialSheetIndex = initialSheetParam !== null ? Number(initialSheetParam) || 0 : 0
  let sheetIndexSelected = useRef(initialSheetIndex)

  //user local data
  const [userLocalDetails, setUserLocalDetails] = useState(null)
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
  const [totalLeads, setTotalLeads] = useState(0)
  const [SelectedSheetId, setSelectedSheetId] = useState(null)
  const [selectedLeadsList, setSelectedLeadsList] = useState([])

  // Helper function to filter out address column if no leads have address data
  const filterAddressColumn = (columns, leads) => {
    if (!columns || !leads || leads.length === 0) return columns

    // Check if address column exists in the columns
    const addressColumn = columns.find(
      (column) =>
        column.title?.toLowerCase() === 'address' ||
        column.key?.toLowerCase() === 'address',
    )

    if (addressColumn) { }

    // Check if any lead has address data
    const hasAddressData = leads.some(
      (lead) => lead.address && lead.address.trim() !== '',
    )

    // If no leads have address data, filter out address column
    if (!hasAddressData && addressColumn) {
      return columns.filter(
        (column) =>
          column.title?.toLowerCase() !== 'address' &&
          column.key?.toLowerCase() !== 'address',
      )
    }

    if (hasAddressData && addressColumn) { }

    return columns
  }
  const [selectedAll, setSelectedAll] = useState(false)
  const [AssignLeadModal, setAssignLeadModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedFromDate, setSelectedFromDate] = useState(null)
  const [showFromDatePicker, setShowFromDatePicker] = useState(false)
  const [showAddNewSheetModal, setShowAddNewSheetModal] = useState(false)

  //nedd help popup
  const [needHelp, setNeedHelp] = useState(false)

  const requestVersion = useRef(0)
  const isFilteringRef = useRef(false) // Track if filtering is in progress

  const [filtersSelected, setFiltersSelected] = useState([])

  const [noStageSelected, setNoStageSelected] = useState(false)

  const [exportLoading, setExportLoading] = useState(false)


  useEffect(() => {
    //console.log;
  }, [FilterLeads])

  useEffect(() => {
    //console.log;
  }, [totalLeads])
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

  const [LeadsInSheet, setLeadsInSheet] = useState({})

  const [AllLeads, setAllLeads] = useState({})

  //code for pagination variables
  const [hasMore, setHasMore] = useState(true)
  const [moreLeadsLoader, setMoreLeadsLoader] = useState(false)
  const [nextCursorValue, setNextCursorValue] = useState(0)

  //code for delete smart list dropdown
  const [delSmartListLoader, setDelSmartListLoader] = useState(false)
  const [selectedSmartList, setSelectedSmartList] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState({})

  //code for edit smart list
  const [editSmartListLoader, setEditSmartListLoader] = useState(false)
  const [showEditSmartList, setShowEditSmartList] = useState(false)
  const [selectedSmartListForEdit, setSelectedSmartListForEdit] = useState(null)

  //code for passing columns
  const [Columns, setColumns] = useState(null)


  //render status
  const isFirstRender = useRef(true)

  //err msg when no leaad in list
  const [showNoLeadErr, setShowNoLeadErr] = useState(null)
  const [showNoLeadsLabel, setShowNoLeadsLabel] = useState(false)

  //code for showing leads details
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedLeadsDetails, setSelectedLeadsDetails] = useState(null)

  //code for call activity transcript text
  const [isExpanded, setIsExpanded] = useState([])
  const [isExpandedActivity, setIsExpandedActivity] = useState([])

  // console.log("pipelineId is",selectedLeadsDetails)

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
  const filterRef = useRef(null)

  const [user, setUser] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)


  const [filterTags, setFilterTags] = useState([])
  const [filterTagInputValue, setFilterTagInputValue] = useState('')
  const [showFilterTagSuggestions, setShowFilterTagSuggestions] = useState(false)
  const [filterTagSuggestions, setFilterTagSuggestions] = useState([])
  const [filterTagInputRef] = useState(useRef(null))
  const [uniqueColumns, setUniqueColumns] = useState([])
  //unique tags list
  const [uniqueTagsList, setUniqueTagsList] = useState([])

  const tagFilterManagerRef = useRef(null)

  // Add this function to handle tag suggestions for filter
  const loadFilterTagSuggestions = async (query = '') => {
    try {
      const userId = reduxUser?.id
      console.log("User ID istst", userId);
      const tags = await fetchUniqueTags(userId)
      const uniqueTags = await getUniqueTagsList(userId)
      setUniqueTagsList(uniqueTags)
      console.log("simple tags list are", tags);
      console.log("Unique tags are", uniqueTags);
      if (tags && Array.isArray(tags)) {
        setUniqueColumns(tags) // Keep variable name for backward compatibility
        // Refresh suggestions if there's a current input value
        if (filterTagInputValue.trim()) {
          const existingTags = selectedLeadsDetails?.tags || []
          const filtered = tags
            .filter((tag) => {
              const tagLower = tag.toLowerCase()
              const valueLower = filterTagInputValue.toLowerCase()
              return tagLower.includes(valueLower)
            })
            .filter((tag) => !existingTags.includes(tag))
          setFilterTagSuggestions(filtered)
          setShowFilterTagSuggestions(filtered.length > 0)
        }
      }
    } catch (error) {
      console.error('Error fetching unique tags:', error)
    }
  }

  // Add this effect to load initial suggestions
  useEffect(() => {
    loadFilterTagSuggestions()
  }, [])

  // Reload filter tag suggestions when LeadDetails drawer closes (tags may have changed)
  const prevShowDetailsModalRef = useRef(showDetailsModal)
  useEffect(() => {
    if (prevShowDetailsModalRef.current === true && showDetailsModal === false) {
      loadFilterTagSuggestions()
    }
    prevShowDetailsModalRef.current = showDetailsModal
  }, [showDetailsModal])

  // Add these handler functions
  const handleFilterTagInputChange = (e) => {
    const value = e.target.value
    setFilterTagInputValue(value)

    if (value.trim()) {
      loadFilterTagSuggestions(value)
    } else {
      loadFilterTagSuggestions()
      setShowFilterTagSuggestions(false)
    }
  }

  const handleFilterTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && filterTagInputValue.trim()) {
      e.preventDefault()
      const newTag = filterTagInputValue.trim()
      if (!filterTags.includes(newTag)) {
        setFilterTags(prev => [...prev, newTag])
      }
      setFilterTagInputValue('')
      setShowFilterTagSuggestions(false)
    } else if (e.key === 'Backspace' && !filterTagInputValue && filterTags.length > 0) {
      // Remove last tag on backspace when input is empty
      setFilterTags(prev => prev.slice(0, -1))
    }
  }

  const handleFilterTagAdd = (tag) => {
    console.log("select Filter tags btn triggered")
    // if (!filterTags.includes(tag)) {
    //   setFilterTags(prev => [...prev, tag])
    // }
    // setFilterTagInputValue('')
    // setShowFilterTagSuggestions(false)
    setFilterTags((prevTags) => {
      const isSelected = prevTags.some((t) => t === tag)
      return isSelected
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    }
    )
  }

  const handleFilterTagRemove = (tagToRemove) => {
    setFilterTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const clearFilterTags = () => {
    setFilterTags([])
  }

  // Update your reset function to clear tags
  const resetFilters = () => {
    setFiltersSelected([])
    setFilterTags([])
    setFilterTagInputValue('')
    if (tagFilterManagerRef.current) {
      tagFilterManagerRef.current.clearTags()
    }
  }


  useEffect(() => {
    let data = getUserLocalData()
    setUser(data.user)
  }, [])

  const handleChange = (event) => {
    const selectedValue = event.target.value

    setSelectedPipeline(event.target.value)

    const selectedItem = pipelinesList.find(
      (item) => item.title === selectedValue,
    )

    // console.log("Stages list is", selectedItem.stages);

    setStagesList(selectedItem.stages)
  }

  useEffect(() => {
    //check the render
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (filterRef.current) {
      clearTimeout(filterRef.current)
    }
    filterRef.current = setTimeout(() => {
      //console.log;
      if (SelectedSheetId) {
        setHasMore(true)
        setFilterLeads([])
        setLeadsList([])
        let filterText = getFilterText()
        //console.log;
        handleFilterLeads(filterText)
        setShowNoLeadsLabel(false)
      }
    }, 400)
  }, [searchLead])

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

    // Check localStorage usage for debugging
    checkLocalStorageUsage()
  }, [])


  useEffect(() => {
    if (shouldSet === true) {
      //////console.log;
      let sheets = []
      let found = false
      SheetsList.map((sheet, index) => {
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
    // Empty effect - kept for potential future use
    // Removed logging to prevent unnecessary re-renders
  }, [LeadsList, FilterLeads])

  //code to scroll to the bottom
  useEffect(() => {
    // Prevent infinite loops by checking if filtering is already in progress
    if (isFilteringRef.current) {
      return
    }

    // Don't run if SelectedSheetId is not set yet
    if (!SelectedSheetId) {
      return
    }

    // Use a timeout to debounce and prevent rapid successive calls
    isFilteringRef.current = true
    setFilterLeads([])
    setLeadsList([])

    let filterText = getFilterText()

    // Use setTimeout to defer the async call and prevent React scheduler conflicts
    // This ensures state updates complete before starting the async operation
    const timeoutId = setTimeout(() => {
      Promise.resolve(handleFilterLeads(filterText))
        .catch((error) => {
          console.error('Error in handleFilterLeads:', error)
        })
        .finally(() => {
          // Reset the flag after filtering completes
          setTimeout(() => {
            isFilteringRef.current = false
          }, 100)
        })
    }, 0)

    setShowNoLeadsLabel(false)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [filtersSelected, SelectedSheetId])

  //Caching & refresh logic - sync URL parameter with ref
  useEffect(() => {
    const sheet = searchParams.get('sheet') // Get the value of 'sheet'
    let number = Number(sheet) || 0
    // Update the ref with the current sheet index from URL
    sheetIndexSelected.current = number
    // Ensure URL is set if it was missing
    if (sheet === null) {
      setParamsInSearchBar(number)
    }
  }, [searchParams])
  const setParamsInSearchBar = (index = 1) => {
    // Create a new URLSearchParams object to modify
    const params = new URLSearchParams(searchParams.toString())
    params.set('sheet', index) // Set or update the 'tab' parameter

    // Push the updated URL
    router.push(`/dashboard/leads?${params.toString()}`)

    // //console.log;
  }

  function SetSheetsToLocalStorage(data) {
    try {
      localStorage.setItem('sheets', JSON.stringify(data))
    } catch (error) {
      console.warn('⚠️ Failed to store sheets in localStorage:', error.message)
    }
  }

  // Utility function to safely store large data in localStorage
  function safeLocalStorageSet(key, data, maxRetries = 2) {
    try {
      const dataString = JSON.stringify(data)

      // Check if data is too large (localStorage typically has 5-10MB limit)
      if (dataString.length > 4 * 1024 * 1024) {
        // 4MB threshold
        console.warn(
          `⚠️ Data for ${key} is very large (${Math.round(dataString.length / 1024 / 1024)}MB), may cause quota issues`,
        )
      }

      localStorage.setItem(key, dataString)
      return true
    } catch (error) {
      console.warn(`⚠️ localStorage quota exceeded for ${key}:`, error.message)

      if (maxRetries > 0) {
        try {
          // Clean up old cached leads data to free space
          cleanupOldCachedLeads()

          // Remove old data for this key
          localStorage.removeItem(key)
          // Try again
          localStorage.setItem(key, JSON.stringify(data))
          return true
        } catch (retryError) {
          console.warn(
            `❌ Still unable to store ${key} after cleanup:`,
            retryError.message,
          )
          return false
        }
      }
      return false
    }
  }

  // Function to check localStorage usage
  function checkLocalStorageUsage() {
    try {
      let totalSize = 0
      const keysToCheck = []

      // Get all localStorage keys and calculate total size
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key)
          const size = key.length + value.length
          totalSize += size
          keysToCheck.push({ key, size })
        }
      }

      // Show leads-related keys specifically
      const leadsKeys = keysToCheck.filter((item) =>
        item.key.startsWith('Leads'),
      )
      leadsKeys.forEach((item) => { })

      return {
        totalSize,
        keysCount: keysToCheck.length,
        leadsKeys: leadsKeys.length,
      }
    } catch (error) {
      console.warn('⚠️ Error checking localStorage usage:', error.message)
      return null
    }
  }

  // Function to clean up old cached leads data to free localStorage space
  function cleanupOldCachedLeads() {
    try {
      const usageBefore = checkLocalStorageUsage()

      const keysToCheck = []

      // Get all localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('Leads')) {
          keysToCheck.push(key)
        }
      }

      // Remove old cached data (keep only the most recent 2 sheets)
      if (keysToCheck.length > 2) {
        keysToCheck.sort() // Sort to get consistent order
        const keysToRemove = keysToCheck.slice(0, keysToCheck.length - 2) // Keep last 2

        keysToRemove.forEach((key) => {
          localStorage.removeItem(key)
        })
      }

      const usageAfter = checkLocalStorageUsage()

      if (usageBefore && usageAfter) {
        const savedSpace = usageBefore.totalSize - usageAfter.totalSize
      }
    } catch (error) {
      console.warn('⚠️ Error during localStorage cleanup:', error.message)
    }
  }

  function GetAndSetDataFromLocalStorage() {
    let d = localStorage.getItem('sheets')
    if (d) {
      // //console.log;
      let data = JSON.parse(d)
      let ind = 0
      // Use .current to access the ref value
      if (sheetIndexSelected.current < data.length) {
        ind = sheetIndexSelected.current
      }
      setSheetsList(data)
      setCurrentSheet(data[ind])
      setSelectedSheetId(data[ind].id)
      setParamsInSearchBar(ind)
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

      await getProfileDetails()

      const Data = localStorage.getItem('User')
      if (Data) {
        const localData = JSON.parse(Data)
        setUserLocalDetails(localData.user)
      }
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
    setSelectedStage((prevStages) => {
      const isSelected = prevStages.some((s) => s.id === item.id)
      return isSelected
        ? prevStages.filter((s) => s.id !== item.id)
        : [...prevStages, item]
    })
  }

  //function for del smartlist stage dropdown

  const handleShowPopup = (item) => {
    setSelectedSmartList(item)
  }

  //function to delete smart list
  const handleDeleteSmartList = async (item = null) => {
    try {
      setDelSmartListLoader(true)

      // Use the passed item or fall back to selectedSmartList
      const itemToDelete = item || selectedSmartList

      if (!itemToDelete) {
        console.error('No item selected for deletion')
        setDelSmartListLoader(false)
        return
      }

      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      //////console.log;

      const ApiData = {
        sheetId: itemToDelete.id,
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
          setNextCursorValue('')
          setSheetsList((prevSheetsList) =>
            prevSheetsList.filter((sheet) => sheet.id !== itemToDelete.id),
          )
          setSelectedLeadsList([])
          setFilterLeads([])
          setLeadsList([])
          setShowNoLeadsLabel(true)
          setSelectedSmartList(null)
          // Close the dropdown
          setDropdownOpen((prev) => ({
            ...prev,
            [itemToDelete.id]: false,
          }))
          // Show success message
          setSnackMessage('Smart list deleted successfully')
          setMessageType(SnackbarTypes.Success)
          setShowSnackMessage(true)
        }
      }
    } catch (error) {
      // console.error("ERror occured in del smart list api is:", error);
      // Show error message
      setSnackMessage('Failed to delete smart list. Please try again.')
      setMessageType(SnackbarTypes.Error)
      setShowSnackMessage(true)
      // Close the dropdown on error as well
      if (item || selectedSmartList) {
        const itemToClose = item || selectedSmartList
        setDropdownOpen((prev) => ({
          ...prev,
          [itemToClose.id]: false,
        }))
      }
    } finally {
      setDelSmartListLoader(false)
    }
  }

  // function to handle select data change
  const handleFromDateChange = (date) => {
    setSelectedFromDate(date || null)
    setShowFromDatePicker(false)
  }

  const handleToDateChange = (date) => {
    setSelectedToDate(date || null)
    setShowToDatePicker(false)
  }

  function getFilterText() {
    const searchTrimmed = searchLead ? String(searchLead).trim() : ''
    // When user is searching: do not send sheetId so API searches across all sheets
    if (searchTrimmed) {
      let string = `search=${encodeURIComponent(searchTrimmed)}`
      let stageIds = ''
      let stageSeparator = ''
      filtersSelected.forEach((filter) => {
        if (filter.key == 'date') {
          const formtFromDate = moment(filter.values[0]).format('MM/DD/YYYY')
          const formtToDate = moment(filter.values[1]).format('MM/DD/YYYY')
          string = `${string}&fromDate=${formtFromDate}&toDate=${formtToDate}`
        }
        if (filter.key == 'stage') {
          stageIds = `${stageIds}${stageSeparator}${filter.values[0].id}`
          stageSeparator = ','
        }
      })
      if (stageIds.length > 0) {
        string = `${string}&stageIds=${stageIds}`
      }
      return string
    }

    // No search: require sheetId (single sheet)
    let string = `sheetId=${SelectedSheetId}`
    if (filtersSelected.length == 0) {
      return string
    }

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
    if (stageIds.length > 0) {
      string = `${string}&stageIds=${stageIds}`
    }

    return string
  }

  function getFiltersObject() {
    const searchTrimmed = searchLead ? String(searchLead).trim() : ''
    let filters = {}
    // When searching across all sheets, do not send sheetId
    if (!searchTrimmed && SelectedSheetId) {
      filters['sheetId'] = SelectedSheetId
    }
    if (searchTrimmed) {
      filters['search'] = searchTrimmed
    }
    let string = searchTrimmed ? `search=${encodeURIComponent(searchTrimmed)}` : `sheetId=${SelectedSheetId}`
    // return string;
    // }

    let stageIds = ''
    let stageSeparator = ''
    filtersSelected.map((filter) => {
      if (filter.key == 'date') {
        const formtFromDate = moment(filter.values[0]).format('MM/DD/YYYY')
        const formtToDate = moment(filter.values[1]).format('MM/DD/YYYY')
        // string = `${string}&fromDate=${formtFromDate}&toDate=${formtToDate}`;
        filters['fromDate'] = formtFromDate
        filters['toDate'] = formtToDate
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
    // if (searchLead && searchLead.length > 0) {
    // string = `${string}&search=${searchLead}`;
    // }
    // string = `${string}&stageIds=${stageIds}`;
    if (stageIds.length > 0) {
      // string = `${string}&stageIds=${stageIds}`;
      filters['stageIds'] = stageIds
    }

    return filters
  }

  function getLocallyCachedLeads() {
    // return;
    // //console.log;
    const id = SelectedSheetId
    //Set leads in cache
    let leadsData = LeadsInSheet[SelectedSheetId] || null
    // //console.log;
    if (!leadsData) {
      let d = localStorage.getItem(`Leads${SelectedSheetId}`)
      if (d) {
        leadsData = JSON.parse(d)
        // //console.log;
      }
    }
    // //console.log;
    let leads = leadsData?.data || []
    let leadColumns = leadsData?.columns || []
    // setSelectedSheetId(item.id);
    // setLeadsList([]);
    // setFilterLeads([]);
    if (leads && leads.length > 0 && leadColumns && leadColumns.length > 0) {
      setLeadsList((prevDetails) => [...prevDetails, ...leads])
      setFilterLeads((prevDetails) => [...prevDetails, ...leads])
      let dynamicColumns = []
      if (leads.length > 0) {
        // Filter out address column if no leads have address data
        const filteredColumns = filterAddressColumn(leadColumns, leads)
        dynamicColumns = [
          ...filteredColumns,
          // { title: "Tag" },
          {
            title: 'More',
            idDefault: false,
          },
        ]
      }
      // setLeadColumns(response.data.columns);
      // //console.log;
      setLeadColumns(dynamicColumns)
      // return
    } else { }
  }

  //function for filtering leads
  const handleFilterLeads = async (filterText = null) => {
    const searchTrimmed = searchLead ? String(searchLead).trim() : ''
    const isSearchingAllSheets = !!searchTrimmed
    //fromDate=${formtFromDate}&toDate=${formtToDate}&stageIds=${stages}&id=${nextCursorValue === null ? 'null' : nextCursorValue}
    console.log("Filter leads triggered")
    const currentRequestVersion = ++requestVersion.current
    const currentSheetId = SelectedSheetId // Capture the sheet ID at request start
    try {
      // Only set loading if this is still the current request and sheet
      if (currentRequestVersion === requestVersion.current && currentSheetId === SelectedSheetId) {
        setMoreLeadsLoader(true)
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
      let uniqueTags = filterTags.map((tag) => tag);
      const uniqueTagsString = uniqueTags.join(",");
      console.log("Filter tags list is", uniqueTagsString);
      let ApiPath = null
      console.log("Filter text is", filterText);
      if (filterText) {
        ApiPath = `${Apis.getLeads}?${filterText}` //&fromDate=${formtFromDate}&toDate=${formtToDate}&stageIds=${stages}&id=${nextCursorValue === null ? 'null' : nextCursorValue}`;
        ApiPath = ApiPath + '&noStage=' + noStageSelected
        if (nextCursorValue && nextCursorValue != 'undefined') {
          ApiPath = ApiPath + `&id=${nextCursorValue}`
        }
        if (filterTags.length > 0) {
          ApiPath = ApiPath + '&tags=' + uniqueTagsString;
        }
      } else {
        if (nextCursorValue == 0) {
          getLocallyCachedLeads()
        }
        ApiPath = `${Apis.getLeads}?sheetId=${SelectedSheetId}&id=${nextCursorValue}`
      }
      console.log("Api path for filter is", ApiPath);
      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          // "Content-Type": "application/json"
        },
      })

      if (response) {
        // console.log(
        //   "Response of get leads filter api is api is :",
        //   response.data
        // );
        if (currentRequestVersion === requestVersion.current) {
          const responseData = response.data
          setNextCursorValue(responseData.nextCursor)
          if (response.data.status === true) {
            setShowFilterModal(false)
            setTotalLeads(response.data.leadCount)
            // setLeadsList(response.data.data);
            // setFilterLeads(response.data.data);

            //   setShowNoLeadErr("No leads found");

            const data = response.data.data
            // Get sheetId from response to verify it matches current selection (not used when searching all sheets)
            let sheetId = null
            if (data.length > 0) {
              sheetId = data[0].sheetId
            }

            // When searching across all sheets, always process; otherwise only if sheet matches or empty first page
            const shouldProcess =
              isSearchingAllSheets ||
              (sheetId == SelectedSheetId) ||
              (data.length === 0 && !nextCursorValue)

            if (shouldProcess) {
              if (!nextCursorValue) {
                // First page load
                if (data.length > 0) {
                  setShowNoLeadsLabel(null)
                } else {
                  setShowNoLeadsLabel(true)
                }

                // When searching all sheets, don't cache by sheet; always set leads
                if (isSearchingAllSheets || sheetId == SelectedSheetId || data.length === 0) {
                  if (!isSearchingAllSheets && data.length > 0 && sheetId == SelectedSheetId) {
                    LeadsInSheet[SelectedSheetId] = response.data

                    // Try to save to localStorage with error handling
                    const storageKey = `Leads${SelectedSheetId}`
                    const storageSuccess = safeLocalStorageSet(
                      storageKey,
                      response.data,
                    )

                    if (!storageSuccess) {
                      console.warn(
                        '⚠️ Failed to store in localStorage, data will be available in memory cache only',
                      )
                    }
                  }

                  setLeadsList(data)
                  setFilterLeads(data)
                }
              } else {
                // For pagination: append when searching all sheets or when sheet matches
                if ((isSearchingAllSheets || sheetId == SelectedSheetId) && data.length > 0) {
                  setLeadsList((prevDetails) => [...prevDetails, ...data])
                  setFilterLeads((prevDetails) => [...prevDetails, ...data])
                }
              }

              // Set columns when searching all sheets, or when sheet matches or empty response
              if (isSearchingAllSheets || sheetId == SelectedSheetId || (data.length === 0 && !nextCursorValue)) {
                let leads = data
                let leadColumns = response.data.columns
                if (leads && leadColumns) {
                  let dynamicColumns = []
                  if (leads.length > 0) {
                    // Filter out address column if no leads have address data
                    const filteredColumns = filterAddressColumn(
                      leadColumns,
                      leads,
                    )
                    dynamicColumns = [
                      ...filteredColumns,
                      // { title: "Tag" },
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
            } else { }

            setHasMore(responseData.hasMore)

            // if (data.length < LimitPerPage) {
            //   setHasMore(responseData.hasMore);
            // } else {
            //   setHasMore(true);
            //   // handleFilterLeads(offset + 30, filterText);
            // }
          } else {
            // //console.log;
          }
        }
      }
    } catch (error) {
      // console.error("Error occured in api is :", error);
    } finally {
      // Only clear loading if this is still the current request
      // This prevents old requests from clearing the loader when a new request has started
      if (currentRequestVersion === requestVersion.current) {
        setMoreLeadsLoader(false)
        setSheetsLoader(false)
      }
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
    const { title } = column
    let canShowSelected = false
    if (selectedAll) {
      //check if item.id is in the toggle list or not
      if (selectedLeadsList.includes(item.id)) {
        canShowSelected = false
      } else {
        canShowSelected = true
      }
    } else {
      if (selectedLeadsList.includes(item.id)) {
        canShowSelected = true
      } else {
        canShowSelected = false
      }
    }

    // //console.log;
    // //console.log;

    // return <div>Salman</div>;
    switch (title) {
      case 'Name':
        // //console.log;
        return (
          <div>
            <div className="w-full flex flex-row items-center gap-2 truncate">
              {canShowSelected ? (
                <button
                  className="h-[20px] w-[20px] border rounded bg-brand-primary outline-none flex flex-row items-center justify-center"
                  onClick={() => {
                    handleToggleClick(item.id)
                  }}
                >
                  <Image className=" object-contain pb-0.5"
                    src={'/assets/whiteTick.png'}
                    height={10}
                    width={10}
                    alt="*"
                  />
                </button>
              ) : (
                <Checkbox
                  className="h-4 w-4 flex-shrink-0 border-2 border-muted"
                  onClick={() => handleToggleClick(item.id)}
                />
              )}
              <div
                className="h-[32px] w-[32px] bg-black cursor-pointer rounded-full flex flex-row items-center justify-center text-white  break-words overflow-hidden text-ellipsis"
                onClick={() => {
                  setSelectedLeadsDetails(item) // Pass selected lead data
                  setNoteDetails(item.notes)
                  setShowDetailsModal(true) // Show modal
                  setColumns(column)
                }}
              >
                {item.firstName.slice(0, 1)}
              </div>
              <div
                className="w-[80%] truncate cursor-pointer  break-words overflow-hidden text-ellipsis"
                onClick={() => {
                  setSelectedLeadsDetails(item) // Pass selected lead data
                  setNoteDetails(item.notes)
                  setShowDetailsModal(true) // Show modal
                  setColumns(column)
                }}
              >
                {item.firstName} {item.lastName}
              </div>
            </div>
          </div>
        )
      case 'Phone':
        // //console.log;
        return (
          <button onClick={() => handleToggleClick(item.id)}>
            {item.phone ? item.phone : '-'}
          </button>
        )
      case 'Stage':
        // //console.log;
        return (
          <button onClick={() => handleToggleClick(item.id)}>
            {item.stage ? item.stage.stageTitle : 'No Stage'}
          </button>
        )
      // case "Date":
      //     return item.createdAt ? moment(item.createdAt).format('MMM DD, YYYY') : "-";
      case 'More':
        // //console.log;
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
        let value = item[title]
        // console.log("Available keys:", Object.keys(item));
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value)
        }
        return (
          <div
            className="cursor-pointer  break-words overflow-hidden text-ellipsis"
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

      const ApiPath = Apis.getSheets
      //////console.log;

      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        console.log("response of get sheets", response.data);
        if (response.data.data.length === 0) {
          handleShowUserLeads(null)
        } else {
          handleShowUserLeads('leads exist')
          setSheetsList(response.data.data)
          let sheets = response.data.data
          SetSheetsToLocalStorage(sheets)
          if (sheets.length > 0) {
            let ind = 0
            // Use .current to access the ref value
            if (sheetIndexSelected.current < sheets.length) {
              ind = sheetIndexSelected.current
            }
            setCurrentSheet(response.data.data[ind])
            setSelectedSheetId(response.data.data[ind].id)
            // setParamsInSearchBar(ind);
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

      const ApiPath = Apis.getPipelines

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
  const handleToggleClick = (id, selectedAll) => {
    if (selectedAll) {
      // setSelectedAll(false);
      if (selectedLeadsList.includes(id)) {
        setSelectedLeadsList((prev) => prev.filter((item) => item.id != id))
      } else {
        setSelectedLeadsList((prev) => [...prev, id])
      }
    } else {
      setSelectedLeadsList((prevSelectedItems) => {
        if (prevSelectedItems.includes(id)) {
          // Remove the ID if it's already selected
          return prevSelectedItems.filter((itemId) => itemId !== id)
        } else {
          // Add the ID to the selected items
          return [...prevSelectedItems, id]
        }
      })
    }
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
      setSelectedLeadsList([])
      if (showSnack) {
        setShowSnackMessage(true)
      }
      setSelectedAll(false)
      setMessageType(SnackbarTypes.Success)
    } else if (disSelectLeads === false) {
      setShowSnackMessage(true)
      setMessageType(SnackbarTypes.Error)
      // setToggleClick([])
    }
  }

  //code for handle search change
  const handleSearchChange = (value) => {
    return
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
    if (filter.key == 'tag') {
      let values = filter.values
      if (values.length > 0) {
        return values[0]
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
    if (filterTags && filterTags.length > 0) {
      filterTags.forEach((tag) => {
        filters.push({ key: 'tag', values: [tag] })
      })
    }

    setFiltersSelected(filters)
  }

  function getLeadSelectedCount() {
    if (selectedAll) {
      return totalLeads - selectedLeadsList.length
    } else {
      return selectedLeadsList.length
    }
  }

  async function handleExportLeads() {
    if (!SelectedSheetId) {
      setSnackMessage('Select a sheet to export')
      setShowSnackMessage(true)
      setMessageType(SnackbarTypes.Error)
      return
    }
    try {
      setExportLoading(true)
      let path = Apis.exportLeads + '?sheetId=' + SelectedSheetId

      const response = await axios.get(path, {
        headers: {
          Authorization: 'Bearer ' + AuthToken(),
        },
      })
      if (response.data) {
        if (response.data.status === true) {
          window.open(response.data.downloadUrl, '_blank')
        } else {
          setSnackMessage(response.data.message)
          setShowSnackMessage(true)
          setMessageType(SnackbarTypes.Error)
        }
      }
    } catch (error) {
      console.error('Error exporting leads:', error)
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {initialLoader || sheetsLoader ? ( ///|| !(LeadsList.length > 0 && showNoLeadsLabel)
        (<div className="w-screen">
          <LeadLoading />
        </div>)
      ) : (
        <>
          <AgentSelectSnackMessage
            isVisible={showsnackMessage}
            hide={() => setShowSnackMessage(false)}
            message={snackMessage}
            type={messageType}
          />
          <StandardHeader
            titleContent={
              <div className="flex flex-row items-center gap-2">
                <TypographyH3>Leads</TypographyH3>
                {reduxUser?.currentUsage?.maxLeads &&
                  reduxUser?.planCapabilities?.maxLeads < 10000000 &&
                  reduxUser?.plan?.planId != null && (
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: '400',
                        color: '#0000080',
                      }}
                    >
                      {`${formatFractional2(reduxUser?.currentUsage?.maxLeads)}/${formatFractional2(reduxUser?.planCapabilities?.maxLeads) || 0} used`}
                    </div>
                  )}
              </div>
            }
            showTasks={true}
            rightContent={
              <button
                style={{
                  backgroundColor:
                    selectedLeadsList.length > 0 || selectedAll
                      ? 'hsl(var(--brand-primary))'
                      : '',
                  color:
                    selectedLeadsList.length > 0 || selectedAll
                      ? 'white'
                      : '#000000',
                }}
                className="flex flex-row items-center gap-4 h-[40px] rounded-lg bg-[#33333315] w-[189px] justify-center"
                onClick={() => {
                  if (userLocalDetails?.plan) {
                    setAssignLeadModal(true)
                  } else {
                    setSnackMessage('Add payment method to continue')
                    setShowSnackMessage(true)
                    setMessageType(SnackbarTypes.Warning)
                  }
                }}
                disabled={!(selectedLeadsList.length > 0 || selectedAll)}
              >
                {selectedLeadsList.length > 0 || selectedAll ? (
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
                <TypographyH4>Start Campaign</TypographyH4>
              </button>
            }
          />

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
                    sheetId={SelectedSheetId}
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
                <div className="flex flex-row items-center gap-4 overflow-none flex-shrink-0 w-[70%]">
                  <div className="flex flex-row items-center gap-1 w-[22vw] flex-shrink-0 border  rounded-full pe-2">
                    <input
                      style={styles.paragraph}
                      className="outline-none border-none w-full bg-transparent focus:outline-none focus:ring-0 rounded-full"
                      placeholder="Search by name, email or phone"
                      value={searchLead}
                      onChange={(e) => {
                        setNextCursorValue('')
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
                    className="flex flex-row items-center gap-4 flex-shrink-0 overflow-auto w-[65%]"
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
                                const remainingTags = []
                                setNextCursorValue('')
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
                                    if (f.key == 'tag') {
                                      remainingTags.push(f.values[0])
                                    }
                                  }
                                })
                                //   setFilterLeads([]);
                                //   setLeadsList([]);
                                //   setTimeout(() => {
                                //     let filterText = getFilterText();
                                //     handleFilterLeads(0, filterText);
                                //   }, 1000);

                                //   filters.splice(index, 1);
                                setSelectedStage(stages)
                                setSelectedFromDate(fromDate)
                                setSelectedToDate(toDate)
                                setSelectedPipeline(pipeline)
                                setFilterTags(remainingTags)
                                setFiltersSelected(filters)
                              }}
                            >
                              <Image
                                src={'/otherAssets/crossIcon.png'}
                                height={20}
                                width={20}
                                alt="*"
                              />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex flex-row items-center justify-end gap-2 w-[30%]">
                  {hasExportPermission && (
                    exportLoading ? (
                      <CircularProgress size={24} sx={{ color: 'hsl(var(--brand-primary))' }} />
                    ) : (
                      <button
                        className="flex flex-row items-center gap-1.5 px-3 py-2 pe-3 border-2 border-gray-200 rounded-lg transition-all duration-150 group hover:border-brand-primary hover:text-brand-primary"
                        style={{ fontWeight: 400, fontSize: 14 }}
                        onClick={() => {
                          handleExportLeads()
                        }}
                        disabled={exportLoading}
                      >
                        <div className="transition-colors duration-150">
                          Export
                        </div>
                        <Image
                          src={'/otherAssets/exportIcon.png'}
                          height={24}
                          width={24}
                          alt="Export"
                          className="group-hover:hidden block transition-opacity duration-150"
                        />
                        <Image
                          src={'/otherAssets/exportIconPurple.png'}
                          height={24}
                          width={24}
                          alt="Export"
                          className="hidden group-hover:block transition-opacity duration-150"
                        />
                      </button>
                    )
                  )}

                  {selectedLeadsList.length >= 0 && (
                    <div>
                      {selectedAll ? (
                        <div>
                          <div className="flex flex-row items-center gap-2">
                            <button
                              className="h-[20px] w-[20px] border rounded bg-brand-primary outline-none flex flex-row items-center justify-center"
                              onClick={() => {
                                setSelectedLeadsList([])
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

                            <div
                              className="text-brand-primary"
                              style={{
                                fontSize: '15',
                                fontWeight: '600',
                                whiteSpace: 'nowrap',
                              }}
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
                              border: '3px solid #00000070',
                            }}
                            onClick={() => {
                              //if select all then in the selectedLeads, we include the leads that are excluded
                              //if selected all is false then in selected Leads we include the included leads
                              setSelectedLeadsList([]) // setToggleClick(FilterLeads.map((item) => item.id));
                              //LeadsList.map((item) => item.id)
                              setSelectedAll(true)
                            }}
                          ></button>
                          <div style={{ fontSize: '15', fontWeight: '600' }}>
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

              {/* Hide sheets list when searching across all sheets */}
              {!(searchLead && String(searchLead).trim()) && (
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
                      // style={{ borderBottom: SelectedSheetId === item.id ? "2px solid #7902DF" : "", color: SelectedSheetId === item.id ? "#7902DF" : "" }}
                      >
                        <button
                          style={styles.paragraph}
                          className="outline-none w-full"
                          onClick={() => {
                            setSearchLead('')
                            // Update ref immediately to prevent flash
                            sheetIndexSelected.current = index
                            // Clear leads immediately to prevent race condition
                            setLeadsList([])
                            setFilterLeads([])
                            setLeadColumns([])
                            // Clear loading state immediately to prevent showing old loading state
                            setMoreLeadsLoader(false)
                            setSheetsLoader(false)
                            setInitialLoader(false)
                            // Reset filtering flag to allow new request to start
                            isFilteringRef.current = false
                            // Invalidate any pending requests by incrementing request version
                            requestVersion.current++
                            // Reset pagination
                            setNextCursorValue(0)
                            setHasMore(true)
                            // Update selected sheet
                            setSelectedSheetId(item.id)
                            setParamsInSearchBar(index)
                            setSelectedLeadsList([])
                            setSelectedAll(false)
                            //   getLeads(item, 0);
                          }}
                        >
                          {item.sheetName}
                        </button>
                        <DropdownMenu
                          open={dropdownOpen[item.id] || false}
                          onOpenChange={(open) => {
                            setDropdownOpen((prev) => ({
                              ...prev,
                              [item.id]: open,
                            }))
                            if (open) {
                              handleShowPopup(item)
                            }
                          }}
                        >
                          <DropdownMenuTrigger asChild>
                            <button
                              className="outline-none"
                              onClick={() => {
                                handleShowPopup(item)
                              }}
                            >
                              <DotsThree weight="bold" size={25} color="black" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-[120px]"
                          >
                            <DropdownMenuItem
                              className="text-black focus:text-purple cursor-pointer"
                              onSelect={(e) => {
                                e.preventDefault()
                                setShowEditSmartList(true);
                                setSelectedSmartListForEdit(item);
                                console.log("selectedSmartListForEdit", item);
                              }}
                              disabled={editSmartListLoader}
                            >
                              {editSmartListLoader ? (
                                <CircularProgress
                                  size={15}
                                  sx={{ color: 'hsl(var(--brand-primary))' }}
                                  className="mr-2"
                                />
                              ) : (
                                <Image
                                  className='mr-2'
                                  src={'/assets/editPen.png'}
                                  height={15}
                                  width={15}
                                  alt="*"
                                />
                              )}
                              <span style={{ fontWeight: '500', fontSize: 16 }}>
                                Edit
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red focus:text-red cursor-pointer"
                              onSelect={(e) => {
                                e.preventDefault()
                                handleDeleteSmartList(item)
                              }}
                              disabled={delSmartListLoader}
                            >
                              {delSmartListLoader ? (
                                <CircularProgress
                                  size={15}
                                  sx={{ color: 'hsl(var(--brand-primary))' }}
                                  className="mr-2"
                                />
                              ) : (
                                <Trash size={18} className="mr-2" />
                              )}
                              <span style={{ fontWeight: '500', fontSize: 16 }}>
                                Delete
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )
                  })}
                </div>
                <button
                  className="flex flex-row items-center gap-1 text-brand-primary flex-shrink-0"
                  style={styles.paragraph}
                  // onClick={() => { setShowAddNewSheetModal(true) }}
                  onClick={() => {
                    if (uploading) {
                      setSnackMessage(
                        'Please wait. Another Lead upload is in progress.',
                      )
                      setShowSnackMessage(true)
                      setMessageType(SnackbarTypes.Warning)
                      return
                    }
                    if (
                      user?.planCapabilities.maxLeads >
                      user?.currentUsage.maxLeads
                    ) {
                      handleShowAddLeadModal(true)
                    } else {
                      setShowUpgradeModal(true)
                    }
                  }}
                >
                  <Plus size={15} color="hsl(var(--brand-primary))" weight="bold" />
                  <span>New Leads</span>
                </button>
              </div>
              )}

              {LeadsList.length > 0 ? (
                <div
                  className="h-[70svh] overflow-auto pb-[100px] mt-6"
                  id="scrollableDiv1"
                  style={{ scrollbarWidth: 'none' }}
                >
                  <InfiniteScroll
                    className="flex flex-col w-full"
                    endMessage={
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
                        {`You're all caught up`}
                      </p>
                    }
                    scrollableTarget="scrollableDiv1"
                    dataLength={FilterLeads.length}
                    next={() => {
                      let filterText = getFilterText()
                      handleFilterLeads(filterText)
                    }}
                    hasMore={hasMore}
                    loader={
                      <div className="w-full flex flex-row justify-center mt-8">
                        {moreLeadsLoader && (
                          <CircularProgress
                            size={35}
                            sx={{ color: '#7902DF' }}
                          />
                        )}
                      </div>
                    }
                    style={{ overflow: 'unset' }}
                  >
                    <table className="table-auto w-full border-collapse border border-none">
                      <thead>
                        <tr style={{ fontWeight: '500' }}>
                          {leadColumns.map((column, index) => {
                            const isMoreColumn = column.title === 'More'
                            const columnWidth = isMoreColumn ? '200px' : '150px'
                            return (
                              <th
                                key={index}
                                className={`border-none px-4 py-2 text-left text-[#00000060] font-[500] ${isMoreColumn ? 'sticky right-0 bg-white' : ''
                                  }`}
                                style={{
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  zIndex: isMoreColumn ? 1 : 'auto',
                                  maxWidth: columnWidth,
                                }}
                              >
                                {column.title.charAt(0).toUpperCase() +
                                  column.title.slice(1)}
                              </th>
                            )
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {FilterLeads.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            {leadColumns.map((column, colIndex) => (
                              <td
                                key={colIndex}
                                className={`border-none px-4 py-2 max-w-[330px] whitespace-normal break-words overflow-hidden text-ellipsis ${column.title === 'More'
                                  ? 'sticky right-0 bg-white'
                                  : ''
                                  }`}
                                style={{
                                  whiteSpace: 'nowrap',
                                  zIndex: column.title === 'More' ? 1 : 'auto',
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
              ) : moreLeadsLoader || initialLoader || sheetsLoader ? (
                <div className="w-full flex justify-center items-center">
                  <LeadLoading />
                  {/* <div>Loading..</div>
                  <CircularProgress size={35} sx={{ color: "#7902DF" }} /> */}
                </div>
              ) : null}

              <UpgradeModal
                open={showUpgradeModal}
                handleClose={() => {
                  setShowUpgradeModal(false)
                }}
                title={"You've Hit Your Leads Limit"}
                subTitle={'Upgrade to add more Leads'}
                buttonTitle={'No Thanks'}
                functionality="webAgent"
              />
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
                      <CloseBtn
                        onClick={() => {
                          setShowFilterModal(false)
                        }}
                      />
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
                          <ShadPopover open={showFromDatePicker} onOpenChange={setShowFromDatePicker}>
                            <PopoverTrigger asChild>
                              <button
                                style={{ border: '1px solid #00000020' }}
                                className="flex flex-row items-center justify-between p-2 rounded-lg mt-2 w-full"
                              >
                                <p>
                                  {selectedFromDate
                                    ? selectedFromDate.toDateString()
                                    : 'Select Date'}
                                </p>
                                <CalendarDots weight="regular" size={25} />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" style={{ zIndex: 1400 }} align="start">
                              <Calendar
                                mode="single"
                                selected={selectedFromDate}
                                onSelect={handleFromDateChange}
                                initialFocus
                                classNames={{
                                  day_selected: 'bg-brand-primary text-white hover:bg-brand-primary hover:text-white focus:bg-brand-primary focus:text-white',
                                  day_today: 'bg-brand-primary/20 text-brand-primary',
                                }}
                              />
                            </PopoverContent>
                          </ShadPopover>
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
                          <ShadPopover open={showToDatePicker} onOpenChange={setShowToDatePicker}>
                            <PopoverTrigger asChild>
                              <button
                                style={{ border: '1px solid #00000020' }}
                                className="flex flex-row items-center justify-between p-2 rounded-lg mt-2 w-full"
                              >
                                <p>
                                  {selectedToDate
                                    ? selectedToDate.toDateString()
                                    : 'Select Date'}
                                </p>
                                <CalendarDots weight="regular" size={25} />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" style={{ zIndex: 1400 }} align="start">
                              <Calendar
                                mode="single"
                                selected={selectedToDate}
                                onSelect={handleToDateChange}
                                initialFocus
                                classNames={{
                                  day_selected: 'bg-brand-primary text-white hover:bg-brand-primary hover:text-white focus:bg-brand-primary focus:text-white',
                                  day_today: 'bg-brand-primary/20 text-brand-primary',
                                }}
                              />
                            </PopoverContent>
                          </ShadPopover>
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
                                return (
                                  <div style={{ color: '#aaa' }}>Select</div>
                                ) // Placeholder style
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
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                              {
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
                        Tags
                      </div>

                      <div className="mt-2">
                        {/*<TagManagerCn
                          ref={tagFilterManagerRef}
                          mode="filter"
                          selectedFilterTags={filterTags}
                          onFilterTagAdd={handleFilterTagAdd}
                          onFilterTagRemove={handleFilterTagRemove}
                          clearAllTags={clearFilterTags}
                          // Tag input props
                          tagInputRef={filterTagInputRef}
                          tagInputValue={filterTagInputValue}
                          onInputChange={handleFilterTagInputChange}
                          onInputKeyDown={handleFilterTagInputKeyDown}
                          showSuggestions={showFilterTagSuggestions}
                          setShowSuggestions={setShowFilterTagSuggestions}
                          tagSuggestions={filterTagSuggestions}
                          onSuggestionClick={handleFilterTagAdd}
                          maxDisplayedTags={3} // Show 3 tags before showing +X
                        />
                        <div className="text-xs text-muted-foreground mt-2">
                          Type to search tags, press Enter to add, or click suggestions
                        </div>*/}
                        <div className="w-full flex flex-wrap gap-4">
                          {uniqueTagsList?.length > 0 && uniqueTagsList?.map((item, index) => {
                            let found = filterTags?.includes(item)
                            return (
                              <div
                                key={index}
                                className="flex flex-row items-center mt-2 justify-start"
                                style={{ fontSize: 15, fontWeight: '500' }}
                              >
                                <button
                                  onClick={() => {
                                    handleFilterTagAdd(item)
                                  }}
                                  className={`p-2 border border-[#00000020] ${found ? `bg-brand-primary` : 'bg-transparent'
                                    } px-6
                              ${found ? `text-white` : 'text-black'
                                    } rounded-2xl`}
                                >
                                  {item}
                                </button>
                              </div>
                            )
                          })}
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
                        Stage
                      </div>

                      {stagesLoader ? (
                        <div className="w-full flex flex-row justify-center mt-8">
                          <CircularProgress
                            size={25}
                            sx={{ color: '#7902DF' }}
                          />
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
                                  className={`p-2 border border-[#00000020] ${found >= 0 ? `bg-brand-primary` : 'bg-transparent'
                                    } px-6
                              ${found >= 0 ? `text-white` : 'text-black'
                                    } rounded-2xl`}
                                >
                                  {item.stageTitle}
                                </button>
                              </div>
                            )
                          })}

                          {/* Add "No Stage" button after the list */}
                          <div className="flex flex-row items-center mt-2 justify-start">
                            <button
                              onClick={() => {
                                setNoStageSelected((prev) => !prev)
                              }}
                              className={`p-2 border border-[#00000020] ${noStageSelected
                                ? `bg-brand-primary text-white`
                                : 'bg-transparent text-black'
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
                        style={{ fontSize: 16.8, fontWeight: '600' }}
                        onClick={() => {
                          resetFilters()
                        }}
                      >
                        Reset
                      </button>
                      {sheetsLoader ? (
                        <CircularProgress size={25} sx={{ color: '#7902DF' }} />
                      ) : (
                        <button
                          className="bg-brand-primary h-[45px] w-[140px] text-white rounded-xl outline-none"
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
                            setNextCursorValue('')
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
              <CreateSmartlistModal
                open={showAddNewSheetModal}
                onClose={() => setShowAddNewSheetModal(false)}
                onSuccess={(newSmartlist) => {
                  setSheetsList([...SheetsList, newSmartlist])
                }}
              />

              {showEditSmartList && (
                <CreateSmartlistModal
                  open={showEditSmartList}
                  onClose={() => {
                    setShowEditSmartList(false)
                    setSelectedSmartListForEdit(null)
                  }}
                  onSuccess={(newSmartlist) => {
                    setSheetsList(SheetsList.map(item => item.id === selectedSmartListForEdit.id ? newSmartlist : item))
                    setShowEditSmartList(false)
                    setSelectedSmartListForEdit(null)
                  }}
                  isEditSmartList={true}
                  selectedSmartList={selectedSmartListForEdit}
                />
              )}
            </div>
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
                      <CircularProgress size={25} sx={{ color: '#7902DF' }} />
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
        </>
      )}
      <div></div>
    </div>
  );
}

export default Userleads
