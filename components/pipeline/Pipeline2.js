import {
  Box,
  FormControl,
  MenuItem,
  Modal,
  Popover,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import {
  ArrowUpRight,
  CaretDown,
  CaretUp,
  DotsThree,
  Plus,
} from '@phosphor-icons/react'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import Body from '@/components/onboarding/Body'
import Footer from '@/components/onboarding/Footer'
import Header from '@/components/onboarding/Header'
import ProgressBar from '@/components/onboarding/ProgressBar'
import {
  HowToVideoTypes,
  HowtoVideos,
  PersistanceKeys,
} from '@/constants/Constants'
import { getTutorialByType, getVideoUrlByType } from '@/utils/tutorialVideos'

import Apis from '../apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../dashboard/leads/AgentSelectSnackMessage'
import IntroVideoModal from '../createagent/IntroVideoModal'
import VideoCard from '../createagent/VideoCard'
import DraftMentions from '../test/DraftMentions'
import DynamicDropdown from '../test/DynammicTagField'
import MentionsInputTest from '../test/MentionsInput'
import ReactMentions from '../test/ReactMentions'
import TagInput from '../test/TagInput'
import KYCs from './KYCs'
import { ScriptLoader } from './ScriptLoader'
import GuardianSetting from './advancedsettings/GuardianSetting'
import Objection from './advancedsettings/Objection'
import CallScriptTag from './tagInputs/CallScriptTag'
import GreetingTag from './tagInputs/GreetingTag'
import { GreetingTagInput } from './tagInputs/GreetingTagInput'
import { PromptTagInput } from './tagInputs/PromptTagInput'

const Pipeline2 = ({ handleContinue, handleBack }) => {
  const containerRef = useRef(null) // Ref to the scrolling container
  const [scrollOffset, setScrollOffset] = useState({
    scrollTop: 0,
    scrollLeft: 0,
  })
  const router = useRouter()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [kycsData, setKycsData] = useState(null)
  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  const [user, setUser] = useState(null)
  const [AgentDetails, setAgentDetails] = useState(null)
  const [introVideoModal, setIntroVideoModal] = useState(false)
  const [isSubaccount, setIsSubaccount] = useState(false)
  //code for tag inputs
  // const [greetingTagInput, setGreetingTagInput] = useState("");
  // const [scriptTagInput, setScriptTagInput] = useState("");
  //code for tag input
  // const [greetingTagInput, setGreetingTagInput] = useState('');
  // const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  // const [cursorPosition, setCursorPosition] = useState(0);
  // const greetingInputRef = useRef(null); // Reference to the input element

  // const tags = ['name', 'phone', 'email', 'address'];

  const [loader, setLoader] = useState(false)
  //variables for advance setting variables
  const [advancedSettingModal, setAdvancedSettingModal] = useState(false)
  const [settingToggleClick, setSettingToggleClick] = useState(1)
  const [showObjectiveDetail, setShowObjectiveDetails] = useState(false)
  const [columnloader, setColumnloader] = useState(false)
  const [uniqueColumns, setUniqueColumns] = useState([])
  const [showMoreUniqueColumns, setShowMoreUniqueColumns] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isErrorVisible, setIsErrorVisible] = useState(false)
  const [errorType, setErrorType] = useState(SnackbarTypes.Error)

  const [showOrb, setShowOrb] = useState(true)

  //code for objective
  const [objective, setObjective] = useState('')

  const [loadingAgentDetails, setLoadingAgentDetails] = useState(false)

  // const handleInputChange = (e) => {
  //     const value = e.target.value;
  //     const cursorPos = e.target.selectionStart;

  //     setGreetingTagInput(value);
  //     setCursorPosition(cursorPos);

  //     // Show dropdown if `{` is typed
  //     if (value[cursorPos - 1] === '{') {
  //         setIsDropdownVisible(true);
  //     } else {
  //         setIsDropdownVisible(false);
  //     }
  // };

  // const handleGreetingsTagChange = (tag) => {
  //     //////console.log;
  //     const beforeCursor = greetingTagInput.slice(0, cursorPosition);
  //     const afterCursor = greetingTagInput.slice(cursorPosition);

  //     // Replace `{` with the selected tag
  //     const updatedInput = beforeCursor.replace(/\{$/, `{${tag}} `) + afterCursor;

  //     setGreetingTagInput(updatedInput);
  //     setIsDropdownVisible(false);

  //     // Move focus back to the input and place the cursor after the inserted tag
  //     const newCursorPosition = beforeCursor.length + tag.length + 2; // Position after the tag
  //     setCursorPosition(newCursorPosition);

  //     // Set focus and cursor position
  //     greetingInputRef.current.focus();
  //     setTimeout(() => {
  //         greetingInputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
  //     }, 0);
  // };

  const tags = ['name', 'phone', 'email', 'address', 'name han']
  const [greetingTagInput, setGreetingTagInput] = useState('')
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [filteredTags, setFilteredTags] = useState(tags) // Filtered dropdown items
  const greetingInputRef = useRef(null) // Reference to the input element

  useEffect(() => {
    // Check if user is subaccount and if agency has logo
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('User')
        let isSub = false
        let hasLogo = false

        if (userData) {
          const parsedUser = JSON.parse(userData)
          isSub =
            parsedUser?.user?.userRole === 'AgencySubAccount' ||
            parsedUser?.userRole === 'AgencySubAccount'
          setIsSubaccount(isSub)
        }

        // Check if agency has branding logo
        let branding = null
        const storedBranding = localStorage.getItem('agencyBranding')
        if (storedBranding) {
          try {
            branding = JSON.parse(storedBranding)
          } catch (error) { }
        }

        // Also check user data for agencyBranding
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData)
            if (parsedUser?.user?.agencyBranding) {
              branding = parsedUser.user.agencyBranding
            } else if (parsedUser?.agencyBranding) {
              branding = parsedUser.agencyBranding
            } else if (parsedUser?.user?.agency?.agencyBranding) {
              branding = parsedUser.user.agency.agencyBranding
            }
          } catch (error) { }
        }

        hasLogo = !!branding?.logoUrl

        // Show orb if: not subaccount OR (subaccount but no logo)
        setShowOrb(!isSub || (isSub && !hasLogo))
      } catch (error) { }
    }
  }, [])

  useEffect(() => {
    let userData = localStorage.getItem(PersistanceKeys.LocalStorageUser)
    if (userData) {
      let u = JSON.parse(userData)
      setUser(u)
    }
    // Check if user is subaccount
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('User')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setIsSubaccount(
            parsedUser?.user?.userRole === 'AgencySubAccount' ||
            parsedUser?.userRole === 'AgencySubAccount',
          )
        }
      } catch (error) { }
    }
  }, [])

  useEffect(() => {
    //////console.log
    const handleScroll = () => {
      // //console.log;
      if (containerRef.current) {
        setScrollOffset({
          scrollTop: containerRef.current.scrollTop,
          scrollLeft: containerRef.current.scrollLeft,
        })
      } else {
        //////console.log
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  function GetUserType() {
    let type = UserTypes.RealEstateAgent
    if (user) {
      let profile = user.user
      type = profile.userType
    }
    return type
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart

    setGreetingTagInput(value)
    setCursorPosition(cursorPos)

    // Extract text after the last `{`
    const textAfterLastBrace = value.slice(
      value.lastIndexOf('{') + 1,
      cursorPos,
    )

    if (value[cursorPos - 1] === '{') {
      setFilteredTags(tags) // Show all tags when `{` is typed
      setIsDropdownVisible(true)
    } else if (value.includes('{') && isDropdownVisible) {
      // Filter tags based on input after `{`
      const filtered = tags.filter((tag) => tag.startsWith(textAfterLastBrace))
      setFilteredTags(filtered)
    } else {
      setIsDropdownVisible(false)
    }
  }

  const handleGreetingsTagChange = (tag) => {
    // Replace the last `{text` with `{ tag }` (with spaces)
    const value = greetingTagInput
    const lastBraceIndex = value.lastIndexOf('{')
    const newValue =
      value.slice(0, lastBraceIndex + 1) +
      ` ${tag} ` +
      `} ` +
      value.slice(cursorPosition)

    setGreetingTagInput(newValue)
    setIsDropdownVisible(false)

    // Move the cursor after the inserted tag
    setTimeout(() => {
      const input = greetingInputRef.current
      const newCursorPosition = lastBraceIndex + tag.length + 5 // Adjust for spaces
      input.setSelectionRange(newCursorPosition, newCursorPosition)
      input.focus()
    }, 0)
  }

  const [scriptTagInput, setScriptTagInput] = useState('')
  const [promptDropDownVisible, setPromptDropDownVisible] = useState(false)
  const [kYCSDropDown, setKYCSDropDown] = useState(false)
  const [promptCursorPosition, setPromptCursorPosition] = useState(0)
  const textFieldRef = useRef(null) // Reference to the TextField element
  ////console.log;
  // //console.log;
  const tags1 = ['name', 'Agent Name', 'Brokerage Name', 'Client Name']

  const handlePromptChange = (e) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart

    setScriptTagInput(value)
    setPromptCursorPosition(cursorPos)

    // Show dropdown if `{kyc|` is typed, case-insensitive
    const typedText = value.slice(0, cursorPos).toLowerCase() // Get text up to the cursor in lowercase
    if (typedText.endsWith('{kyc')) {
      setKYCSDropDown(true)
    } else if (typedText.endsWith('{')) {
      setPromptDropDownVisible(true)
    } else {
      setPromptDropDownVisible(false)
      setKYCSDropDown(false)
    }
  }

  const handlePromptTagSelection = (selectedKYC) => {
    const beforeCursor = scriptTagInput.slice(0, promptCursorPosition)
    const afterCursor = scriptTagInput.slice(promptCursorPosition)

    // Insert the selected KYC tag in the desired format
    const updatedInput = `${beforeCursor} | ${selectedKYC} }${afterCursor}`

    // const updatedInput = beforeCursor.slice(0, 4) + `{ KYC | ${selectedKYC} } ${afterCursor}`;

    // Update the input value and close the dropdown
    setScriptTagInput(updatedInput)
    setPromptDropDownVisible(false)
    setKYCSDropDown(false)

    // Calculate the new cursor position after the selected KYC tag
    const newCursorPosition =
      beforeCursor.length + ` KYC | ${selectedKYC} `.length + 2 // Account for brackets and spaces

    // Update the cursor position state
    setPromptCursorPosition(newCursorPosition)

    // Focus the input field and set the cursor position after the inserted tag
    setTimeout(() => {
      if (textFieldRef.current) {
        textFieldRef.current.focus()
        textFieldRef.current.setSelectionRange(
          newCursorPosition,
          newCursorPosition,
        )
      }
    }, 0)
  }

  //function to close Advanced Settings
  const handleCloseAdvanceSettings = () => {
    setAdvancedSettingModal(false)
    localStorage.removeItem('GuadrailsList')
    localStorage.removeItem('ObjectionsList')
  }

  useEffect(() => {
    getAgentDetails()
  }, [])

  useEffect(() => {
    const agentDetailsLocal = localStorage.getItem('agentDetails')
    if (agentDetailsLocal) {
      const localAgentData = JSON.parse(agentDetailsLocal)
      // //console.log;
      setAgentDetails(localAgentData)
      if (
        localAgentData.agents.length === 2 ||
        localAgentData.agents[0].agentType === 'outbound'
      ) {
        // console.log(
        // "Check case for 2Agents",
        // localAgentData.agents.filter((item) =>
        //   item.agentType === "outbound" ? item : ""
        // )
        // );
        const outBoundAgent = localAgentData.agents.filter((item) =>
          item.agentType === 'outbound' ? item : '',
        )
        setGreetingTagInput(outBoundAgent[0]?.prompt?.greeting)
        setScriptTagInput(outBoundAgent[0]?.prompt?.callScript)
        setObjective(outBoundAgent[0]?.prompt?.objective)
      } else if (localAgentData.agents[0].agentType === 'inbound') {
        // //console.log;
        setGreetingTagInput(localAgentData?.agents[0]?.prompt?.greeting)
        setScriptTagInput(localAgentData?.agents[0]?.prompt?.callScript)
        setObjective(localAgentData?.agents[0]?.prompt?.objective)
      }
    }
    getUniquesColumn()
  }, [])

  useEffect(() => {
    // //console.log;
  }, [scriptTagInput])

  //code for getting uniqueCcolumns
  const getUniquesColumn = async () => {
    try {
      setColumnloader(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      let isFromAgencyOrAdmin = null
      const FromAgencyOrAdmin = localStorage.getItem(
        PersistanceKeys.isFromAdminOrAgency,
      )
      if (FromAgencyOrAdmin) {
        const R = JSON.parse(FromAgencyOrAdmin)
        isFromAgencyOrAdmin = R
      }

      //////console.log;

      let ApiPath = Apis.uniqueColumns
      if (isFromAgencyOrAdmin) {
        ApiPath = `${Apis.uniqueColumns}?userId=${isFromAgencyOrAdmin.subAccountData.id}`
      }

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          setUniqueColumns(response.data.data)
        }
      }
    } catch (error) {
      // console.error("Error occured in getColumn is :", error);
    } finally {
      setColumnloader(false)
    }
  }

  //code for showing more unique columns
  const handleShowUniqueCols = () => {
    setShowMoreUniqueColumns(!showMoreUniqueColumns)
  }

  //code for advance setting
  const handleAdvanceSettingToggleClick = (id) => {
    setSettingToggleClick((prevId) => id)
  }

  // //code for getting the uniques columns
  // const getUniqueColumns = async () => {
  //     try {
  //         const ApiPath = Apis.getUniqueColumns;

  //         let AuthToken = null;
  //         const localData = localStorage.getItem("User");
  //         if (localData) {
  //             const userDetails = JSON.parse(localData);
  //             AuthToken = userDetails.token;
  //         }

  //        // //console.log;

  //        // //console.log;

  //         const response = await axios.get(ApiPath, {
  //             headers: {
  //                 "Authorization": "Bearer " + AuthToken,
  //                 "Content-Type": "application/json"
  //             }
  //         });

  //         if (response) {
  //            // //console.log;
  //         }

  //     } catch (error) {
  //        // console.error("Error occured in getting unique columns is :", error);
  //     }
  // }

  const handleNextClick = async (e) => {
    e.preventDefault()
    // router.push("/dashboard");

    // //////console.log;

    // //////console.log;

    // return
    try {
      setLoader(true)

      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const Data = JSON.parse(localData)
        //////console.log;
        AuthToken = Data.token
      }

      let mainAgentId = null
      let AgentName = null
      let AgentObjective = null
      let AgentDescription = null
      let AgentType = null
      let AgentRole = null
      let Stat = null
      let Address = null
      let isInbound = null
      // let VoiceId = "Mtewh2emAIf6sPTaximW";
      const mainAgentData = localStorage.getItem('agentDetails')
      if (mainAgentData) {
        const Data = JSON.parse(mainAgentData)
        // //console.log;
        mainAgentId = Data.id
        AgentObjective = Data.agents[0].agentObjective
        AgentDescription = Data.agents[0].agentObjectiveDescription
        AgentType = Data.agents[0].agentType
        Address = Data.agents[0].address
        AgentRole = Data.agents[0].agentRole
        if (
          Data.agents.length === 2 ||
          Data.agents[0].agentType === 'outbound'
        ) {
          // console.log(
          //   "Check case for 2Agents",
          //   Data.agents.filter((item) =>
          //     item.agentType === "outbound" ? item : ""
          //   )
          // );
          const outBoundAgent = Data.agents.filter((item) =>
            item.agentType === 'outbound' ? item : '',
          )
          // setGreetingTagInput(localAgentData.greeting);
          // setScriptTagInput(localAgentData.callScript);
        } else if (Data.agents[0].agentType === 'inbound') {
          isInbound = true
          // setGreetingTagInput(localAgentData.inboundGreeting);
          // setScriptTagInput(localAgentData.inboundPrompt);
        }
      }

      //////console.log;

      const ApiPath = Apis.updateAgent
      //////console.log;

      const formData = new FormData()

      formData.append('agentObjective', AgentObjective)
      formData.append('agentObjectiveDescription', AgentDescription)
      // formData.append("agentType", AgentType);
      // formData.append("address", Address);
      formData.append('mainAgentId', mainAgentId)
      formData.append('outboundObjective', objective)
      // formData.append("voiceId", VoiceId);
      if (isInbound) {
        formData.append('inboundGreeting', greetingTagInput)
        formData.append('inboundPrompt', scriptTagInput)
      } else {
        formData.append('prompt', scriptTagInput)
        formData.append('greeting', greetingTagInput)
      }

      //////console.log;
      for (let [key, value] of formData.entries()) {
        // //console.log;
      }
      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
        },
      })

      if (response) {
        //////console.log;
        if (response.data.status === true) {
          handleAddCadence()
          // router.push("/dashboard");
        }
      }
    } catch (error) {
      // console.error("Error occured in update agent api is:", error);
      setLoader(false)
    } finally {
      //////console.log;
    }
  }

  const handleAddCadence = async () => {
    try {
      setLoader(true)
      //////console.log;
      let cadence = null
      const cadenceData = localStorage.getItem('AddCadenceDetails')
      if (cadenceData) {
        const cadenceDetails = JSON.parse(cadenceData)
        cadence = cadenceDetails
      }

      let mainAgentId = null
      const mainAgentData = localStorage.getItem('agentDetails')
      if (mainAgentData) {
        const Data = JSON.parse(mainAgentData)
        //////console.log;
        mainAgentId = Data.id
      }

      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const Data = JSON.parse(localData)
        //////console.log;
        AuthToken = Data.token
      }

      //////console.log;

      //////console.log;

      const ApiData = {
        pipelineId: cadence?.pipelineID,
        mainAgentId: mainAgentId,
        cadence: cadence.cadenceDetails,
      }

      const ApiPath = Apis.createPipeLineCadence
      //////console.log;

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        if (response.data.status === true) {
          localStorage.removeItem('AddCadenceDetails')
          // router.push("/dashboard/leads");
          let isFromAgencyOrAdmin = null
          const isFromAdminOrAgency = localStorage.getItem(
            PersistanceKeys.isFromAdminOrAgency,
          )
          isFromAgencyOrAdmin = isFromAdminOrAgency
          const returnUrl = localStorage.getItem(
            PersistanceKeys.returnUrlAfterAgentCreation,
          )

          //If the agency/admin is creating the agent, send the event to the parent window
          //and close this tab else route to the dashboard/myAgentX
          if (isFromAdminOrAgency) {
            // Parse the stored data to get subaccount info
            let subaccountData = null
            try {
              const parsed = JSON.parse(isFromAdminOrAgency)
              subaccountData = parsed?.subAccountData
            } catch (error) { }

            // Send event to parent window (opener) that agent was created
            if (window.opener && subaccountData) {
              try {
                window.opener.postMessage(
                  {
                    type: 'AGENT_CREATED',
                    userId: subaccountData.id,
                    agentId: mainAgentId,
                  },
                  '*', // In production, specify the exact origin
                )
              } catch (error) { }
            }

            // Clean up the stored data
            localStorage.removeItem(PersistanceKeys.isFromAdminOrAgency)
            localStorage.removeItem(PersistanceKeys.returnUrlAfterAgentCreation)

            // Close the tab after a short delay to allow message to be sent
            setTimeout(() => {
              window.close()
            }, 500)
          }
          else {
            router.push('/dashboard/myAgentX')
          }
          // console.log('Is from agency or admin', isFromAgencyOrAdmin)
          // if (isFromAgencyOrAdmin?.isFromAgency === 'admin') {
          //   router.push('/admin')
          //   localStorage.removeItem(PersistanceKeys.isFromAdminOrAgency)
          // } else if (isFromAgencyOrAdmin?.isFromAgency === 'subaccount') {
          //   router.push('/agency/dashboard/subAccounts') //agency
          //   localStorage.removeItem(PersistanceKeys.isFromAdminOrAgency)
          // } else {
          //   router.push('/dashboard/myAgentX')
          // }
        } else {
          // API returned error response
          const errorMsg =
            response.data?.message ||
            'Failed to create pipeline cadence. Please try again.'
          setErrorMessage(errorMsg)
          setErrorType(SnackbarTypes.Error)
          setIsErrorVisible(true)
          setLoader(false)
        }
      }
    } catch (error) {
      console.error('Error occured in api is :', error)

      // Handle axios errors (network errors, non-200 status codes)
      let errorMsg = 'Failed to create pipeline cadence. Please try again.'

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMsg =
          error.response.data?.message ||
          error.response.data?.error ||
          `Error: ${error.response.status} - ${error.response.statusText}`
      } else if (error.request) {
        // The request was made but no response was received
        errorMsg =
          'Network error. Please check your internet connection and try again.'
      } else {
        // Something happened in setting up the request
        errorMsg = error.message || errorMsg
      }


      setErrorMessage(errorMsg)
      setErrorType(SnackbarTypes.Error)
      setIsErrorVisible(true)
      setLoader(false)
    } finally {
    }
  }

  const getAgentDetails = async () => {
    //console.log
    try {
      setLoadingAgentDetails(true)
      const data = localStorage.getItem('User')

      if (data) {
        let u = JSON.parse(data)
        // //console.log

        let ag = localStorage.getItem(PersistanceKeys.LocalSavedAgentDetails)

        if (ag) {
          let agent = JSON.parse(ag)

          //console.log
          let apiPath = Apis.getAgentDetails + '?mainAgentId=' + agent?.id

          //console.log

          const response = await axios.get(apiPath, {
            headers: {
              Authorization: 'Bearer ' + u.token,
            },
          })

          if (response.data) {
            if (response.data.status === true) {
              let agentData = response.data.data

              if (
                agentData.agents.length === 2 ||
                agentData.agents[0].agentType === 'outbound'
              ) {
                // console.log(
                // "Check case for 2Agents",
                // localAgentData.agents.filter((item) =>
                //   item.agentType === "outbound" ? item : ""
                // )
                // );
                const outBoundAgent = agentData.agents.filter((item) =>
                  item.agentType === 'outbound' ? item : '',
                )
                setGreetingTagInput(outBoundAgent[0]?.prompt?.greeting)
                setScriptTagInput(outBoundAgent[0]?.prompt?.callScript)
                setObjective(outBoundAgent[0]?.prompt?.objective)
              } else if (agentData.agents[0].agentType === 'inbound') {
                // //console.log;
                setGreetingTagInput(agentData?.agents[0]?.prompt?.greeting)
                setScriptTagInput(agentData?.agents[0]?.prompt?.callScript)
                setObjective(agentData?.agents[0]?.prompt?.objective)
              }

              localStorage.setItem(
                PersistanceKeys.LocalSavedAgentDetails,
                JSON.stringify(response.data.data),
              )
            }
          }
        }
      }
    } catch (e) {
      setLoadingAgentDetails(false)
      //console.log
    } finally {
      setLoadingAgentDetails(false)
    }
  }

  //handleGet kyc details
  const handleGetKYCs = () => {
    const test = [
      {
        id: 1,
        question: 'name',
      },
      {
        id: 2,
        question: 'phone',
      },
      {
        id: 3,
        question: 'email',
      },
      {
        id: 4,
        question: 'address',
      },
      {
        id: 5,
        question: 'name han',
      },
    ]
  }

  const advanceSettingType = [
    {
      id: 1,
      title: 'Objective',
    },
    {
      id: 2,
      title: 'Guardrails',
    },
    {
      id: 3,
      title: 'Objections',
    },
    {
      id: 4,
      title: 'KYC',
    },
  ]

  // useEffect(() => {
  //     getKyc()
  // }, [])

  const styles = {
    headingStyle: {
      fontSize: 14,
      fontWeight: '400',
    },
    inputStyle: {
      fontSize: 15,
      fontWeight: '500',
    },
    dropdownMenu: {
      fontSize: 15,
      fontWeight: '500',
      color: '#00000070',
    },
    modalsStyle: {
      maxHeight: '80vh',
      bgcolor: 'transparent',
      // p: 2,
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-55%)',
      borderRadius: 2,
      border: 'none',
      outline: 'none',
    },
  }

  return (
    <div className="relative flex min-h-[100svh] w-full flex-col bg-[#f9f9f9]">
      <AgentSelectSnackMessage
        isVisible={isErrorVisible}
        hide={() => setIsErrorVisible(false)}
        message={errorMessage}
        type={errorType}
      />
      <div className="sticky top-0 z-40 shrink-0 bg-[#f9f9f9]">
        <Header variant="createAgentToolbar" />
      </div>

      <IntroVideoModal
        open={introVideoModal}
        onClose={() => setIntroVideoModal(false)}
        videoTitle={
          getTutorialByType(HowToVideoTypes.Script)?.title ||
          'Learn about creating a script'
        }
        videoUrl={
          getVideoUrlByType(HowToVideoTypes.Script) ||
          HowtoVideos.script
        }
      />

      <div
        ref={containerRef}
        className="firecrawl-scrollbar flex-1 overflow-y-auto"
      >
        <div className="mx-auto flex w-full max-w-[600px] flex-col items-center gap-3 p-6">
          <div
            className="w-full text-center text-[22px] font-semibold leading-[30px] tracking-[-0.77px] text-black"
            style={{ zIndex: 50 }}
          >
            Create a Script
          </div>
          <div className="w-full text-center text-[14px] font-normal leading-[1.6] text-[#666]">
            {AgentDetails?.name} Script
          </div>

          <div className="w-full flex flex-col gap-4 pt-3 pb-6">
              <div
                className="w-full"
              >
                <div className="w-full bg-[rgba(234,226,255,0.4)] border-l-2 border-[#7804df] px-4 py-3 flex flex-row gap-3 items-start">
                  <div className="shrink-0 rounded-[6px] bg-[#7804df] p-1">
                    <Image
                      src={'/svgIcons/lightBulb.svg'}
                      alt="*"
                      height={16}
                      width={16}
                      style={{ filter: 'brightness(0) invert(1)' }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="text-[14px] font-medium text-[#7804df]">
                      Editing tips
                    </div>
                    <div className="text-[14px] font-normal leading-[1.6] text-black">
                      <span>You can use variables:&nbsp;</span>
                      <span className="text-brand-primary">
                        {`{First Name}`}, {`{Email}`}, {`{Address}`},{`{Phone}`},{`{Kyc}`}{' '}
                      </span>
                      {uniqueColumns.length > 0 && (
                        <>
                          {showMoreUniqueColumns ? (
                            <span className="text-brand-primary">
                              {uniqueColumns.map((item) => ` {${item}},`)}
                              <button
                                className="ml-1 text-brand-primary underline decoration-solid"
                                onClick={handleShowUniqueCols}
                                type="button"
                              >
                                show less
                              </button>
                            </span>
                          ) : (
                            <button
                              className="ml-1 inline-flex items-center text-brand-primary underline decoration-solid"
                              onClick={handleShowUniqueCols}
                              type="button"
                            >
                              <Plus
                                weight="bold"
                                size={15}
                                style={{ strokeWidth: 40 }}
                              />
                              {uniqueColumns.length} more
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* <div>
                <button
                  className="flex flex-row items-center gap-4"
                  onClick={() => {
                    setIntroVideoModal(true);
                  }}
                >
                  <Image
                    src={"/assets/youtubeplay.png"}
                    height={36}
                    width={36}
                    alt="*"
                    style={{ borderRadius: "7px" }}
                  />
                  <div style={styles.inputStyle} className="underline">
                    Learn how to customize your script
                  </div>
                </button>
              </div> */}
              <div className="flex flex-row items-center justify-between w-full">
                <div style={styles.headingStyle} className="">Greeting</div>
                <div className="">
                  <button
                    className="flex flex-row items-center gap-2 text-[14px] font-normal leading-[1.6] text-brand-primary underline decoration-solid"
                    onClick={() => {
                      const scriptBuilderUrl =
                        user?.user?.agencySettings?.scriptWidgetUrl ||
                        user?.user?.userSettings?.scriptWidgetUrl ||
                        PersistanceKeys.DefaultScriptBuilderUrl
                      window.open(scriptBuilderUrl, '_blank')
                    }}
                  >
                    Use {user?.user?.agencySettings?.scriptWidgetTitle ?? user?.user?.userSettings?.scriptWidgetTitle ?? 'Script Builder'}
                    <ArrowUpRight size={16} className="text-brand-primary" />
                  </button>
                </div>
              </div>

              <div className="relative w-full">

                {loadingAgentDetails ? (
                  <ScriptLoader height={50} />
                ) : (
                  <GreetingTagInput
                    greetTag={greetingTagInput}
                    kycsList={kycsData}
                    uniqueColumns={uniqueColumns}
                    tagValue={setGreetingTagInput}
                    scrollOffset={scrollOffset}
                  />
                )}
              </div>

              {/* <MentionsInputTest /> <TagInput /> */}

              {/* <GreetingTag handleGreetingTag={handleGreetingTag} /> */}
            </div>
            <div className="w-full pt-2">
              <div className="flex flex-row items-center justify-between w-full">
                <div style={styles.headingStyle}>Call Script</div>
                <button
                  className="text-[14px] font-normal leading-[1.6] text-brand-primary underline decoration-solid"
                  onClick={() => {
                    setAdvancedSettingModal(true)
                  }}
                >
                  Advanced Settings
                </button>
              </div>
              <div className="mt-2">
                {loadingAgentDetails ? (
                  <ScriptLoader height={100} />
                ) : (
                  <div className="h-[394px] w-full">
                    <PromptTagInput
                      promptTag={scriptTagInput}
                      kycsList={kycsData}
                      tagValue={setScriptTagInput}
                      scrollOffset={scrollOffset}
                      uniqueColumns={uniqueColumns}
                      fillHeight
                    />
                  </div>
                )}
                {/* <DynamicDropdown /> */}
              </div>
            </div>
            <div className="w-full mt-2">
              <div className="flex flex-row justify-end mt-4"></div>
              {/*<KYCs kycsDetails={setKycsData} user={user} />*/}
              {/* <div className='mt-4' style={styles.headingStyle}>
                                {`Agent's Objective`}
                            </div>
                            <div className='bg-white rounded-xl p-2 px-4 mt-4'>
                                <div className='flex flex-row items-center justify-between'>
                                    <div style={styles.inputStyle}>
                                        {AgentDetails && (AgentDetails?.agents[0]?.agentObjective)}
                                    </div>
                                    <div>
                                        <button onClick={() => { setShowObjectiveDetails(!showObjectiveDetail) }}>
                                            {
                                                showObjectiveDetail ?
                                                    <CaretUp size={25} weight='bold' /> :
                                                    <CaretDown size={25} weight='bold' />
                                            }
                                        </button>
                                    </div>
                                </div>
                                {
                                    showObjectiveDetail && (
                                        <div>
                                            <div className='mt-2' style={styles.inputStyle}>
                                                {AgentDetails && (AgentDetails?.agents[0]?.prompt.objective) || "-"}
                                            </div>
                                            <div className='flex flex-row items-center justify-between mt-2'>
                                                <div style={{ ...styles.inputStyle, color: "#00000060" }}>
                                                    Status
                                                </div>
                                                <div style={styles.inputStyle}>
                                                    {AgentDetails && (AgentDetails?.agents[0]?.status) || "--"}
                                                </div>
                                            </div>
                                            <div className='flex flex-row items-center justify-between mt-4'>
                                                <div style={{ ...styles.inputStyle, color: "#00000060" }}>
                                                    Address
                                                </div>

                                                <div style={{ ...styles.inputStyle }}>
                                                    {AgentDetails && (AgentDetails?.agents[0]?.address) || "--"}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div> */}
          </div>
        </div>
      </div>

      {/* Floating help video (matches Figma placement) */}
      <div className="fixed bottom-[105px] right-8 z-50 hidden md:block">
        <VideoCard
          duration={(() => {
            const tutorial = getTutorialByType(HowToVideoTypes.Script)
            return tutorial?.description || '13:56'
          })()}
          horizontal
          playVideo={() => setIntroVideoModal(true)}
          title={
            getTutorialByType(HowToVideoTypes.Script)?.title ||
            'Learn about creating a script'
          }
          videoUrl={getVideoUrlByType(HowToVideoTypes.Script) || HowtoVideos.script}
          hideCta
          className="w-[288px] rounded-[8px] border-transparent p-2 shadow-[0px_7px_147.2px_0px_rgba(0,0,0,0.06)]"
        />
      </div>

      {/* Modals code goes here */}
      <Modal
        open={advancedSettingModal}
        onClose={() => {
          handleCloseAdvanceSettings()
        }}
        closeAfterTransition
        BackdropProps={{
          timeout: 250,
          sx: {
            backgroundColor: '#00000099',
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="w-[650px] max-w-[90vw]" sx={styles.modalsStyle}>
          <div
            className="w-full max-h-[90vh] flex flex-col overflow-hidden rounded-[12px] bg-white"
            style={{
              boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
              border: '1px solid #eaeaea',
            }}
          >
            {/* Header */}
            <div
              className="flex flex-row items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid #eaeaea' }}
            >
              <div className="text-[16px] font-semibold text-black">
                Advanced Settings
              </div>
              <button
                type="button"
                className="rounded flex items-center justify-center w-10 h-10 bg-transparent hover:bg-black/5 transition-colors duration-150 ease-out"
                onClick={handleCloseAdvanceSettings}
                aria-label="Close"
              >
                <Image src={'/assets/crossIcon.png'} height={20} width={20} alt="Close" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-5 pt-4">
              <div className="flex flex-row items-center gap-6 border-b border-[#eaeaea]">
                {advanceSettingType.map((item) => {
                  const isActive = item.id === settingToggleClick
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={
                        isActive
                          ? 'relative -mb-px pb-3 text-[14px] font-medium text-brand-primary outline-none border-b-2 border-brand-primary'
                          : 'relative -mb-px pb-3 text-[14px] font-medium text-black/70 hover:text-black outline-none border-b-2 border-transparent focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:rounded-md'
                      }
                      onClick={() => handleAdvanceSettingToggleClick(item.id)}
                    >
                      {item.title}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Body */}
            <div className="firecrawl-scrollbar flex-1 overflow-auto px-5 py-5">
              {settingToggleClick === 1 ? (
                <div className="w-full">
                  <div className="mb-2 text-[13px] font-medium text-black/70">
                    Objective
                  </div>
                  <PromptTagInput
                    promptTag={objective}
                    kycsList={kycsData}
                    uniqueColumns={uniqueColumns}
                    tagValue={setObjective}
                    scrollOffset={scrollOffset}
                    fillHeight
                  />
                </div>
              ) : settingToggleClick === 2 ? (
                <GuardianSetting kycsData={kycsData} uniqueColumns={uniqueColumns} />
              ) : settingToggleClick === 3 ? (
                <Objection kycsData={kycsData} uniqueColumns={uniqueColumns} />
              ) : settingToggleClick === 4 ? (
                <KYCs
                  kycsDetails={setKycsData}
                  mainAgentId={AgentDetails?.id}
                  user={user && user}
                />
              ) : null}
            </div>

            {/* Footer */}
            <div
              className="flex flex-row items-center justify-end gap-2 px-5 py-4"
              style={{ borderTop: '1px solid #eaeaea' }}
            >
              <button
                type="button"
                className="h-[40px] rounded-lg px-4 text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors duration-150 active:scale-[0.98]"
                onClick={handleCloseAdvanceSettings}
              >
                Close
              </button>
            </div>
          </div>
        </Box>
      </Modal>

      {/* Fixed Footer */}
      <div className="sticky bottom-0 left-0 right-0 z-40 bg-[#f9f9f9]">
        <div className="border-t border-[rgba(21,21,21,0.1)]">
          <div className="h-[4px] w-full">
            <ProgressBar value={100} />
          </div>
          <div className="flex h-[65px] w-full items-center justify-between px-8">
            <button
              type="button"
              className="rounded-[8px] bg-[#efefef] px-4 py-[7.5px] text-[14px] font-normal tracking-[0.07px] text-[#0f172a]"
              onClick={handleBack}
            >
              Back
            </button>

            <button
              type="button"
              className="rounded-[8px] bg-brand-primary px-4 py-[7.5px] text-[14px] font-semibold tracking-[0.07px] text-white disabled:bg-black/10 disabled:text-black"
              onClick={handleNextClick}
              disabled={!!loader}
            >
              {loader ? 'Loading…' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pipeline2
