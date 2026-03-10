'use client'

import 'react-phone-input-2/lib/style.css'

import { PauseCircle } from '@mui/icons-material'
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Drawer,
  Fade,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Modal,
  Popover,
  Select,
  Snackbar,
  Tooltip,
} from '@mui/material'
import { ArrowDropDownIcon } from '@mui/x-date-pickers'
import { Calendar, ChevronDown, Code, Hourglass, MessageCircleMore, SquareArrowOutUpRight, Webhook, X, Zap } from 'lucide-react'
import { ArrowUpRight, Info, Plus } from '@phosphor-icons/react'
import axios from 'axios'
import imageCompression from 'browser-image-compression'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import moment from 'moment'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import PhoneInput from 'react-phone-input-2'

import TestEmbed from '@/app/test-embed/page'
import { AuthToken } from '@/components/agency/plan/AuthDetails'
import DashboardSlider from '@/components/animations/DashboardSlider'
import LoaderAnimation from '@/components/animations/LoaderAnimation'
import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import { DEFAULT_ASSISTANT_ID } from '@/components/askSky/constants'
import {
  UpgradeTagWithModal,
  getUserLocalData,
} from '@/components/constants/constants'
import IntroVideoModal from '@/components/createagent/IntroVideoModal'
import VideoCard from '@/components/createagent/VideoCard'
import voicesList from '@/components/createagent/Voices'
import MoreAgentsPopup from '@/components/dashboard/MoreAgentsPopup'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import ActionsTab from '@/components/dashboard/myagentX/ActionsTab'
import AgentInfoCard from '@/components/dashboard/myagentX/AgentInfoCard'
import AgentsListPaginated from '@/components/dashboard/myagentX/AgentsListPaginated'
import AllSetModal from '@/components/dashboard/myagentX/AllSetModal'
import ClaimNumber from '@/components/dashboard/myagentX/ClaimNumber'
import DuplicateConfirmationPopup from '@/components/dashboard/myagentX/DuplicateConfirmationPopup'
import { EditPhoneNumberModal } from '@/components/dashboard/myagentX/EditPhoneNumberPopup'
import EmbedModal from '@/components/dashboard/myagentX/EmbedModal'
import EmbedSmartListModal from '@/components/dashboard/myagentX/EmbedSmartListModal'
import Knowledgebase from '@/components/dashboard/myagentX/Knowledgebase'
import NewSmartListModal from '@/components/dashboard/myagentX/NewSmartListModal'
import NoAgent from '@/components/dashboard/myagentX/NoAgent'
import PiepelineAdnStage from '@/components/dashboard/myagentX/PiepelineAdnStage'
import UserCalender from '@/components/dashboard/myagentX/UserCallender'
import WebAgentModal from '@/components/dashboard/myagentX/WebAgentModal'
import LeadScoring from '@/components/dashboard/myagentX/leadScoring/LeadScoring'
import PipelineLoading from '@/components/dashboardPipeline/PipelineLoading'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import UnlockPremiunFeatures from '@/components/globalExtras/UnlockPremiunFeatures'
import MyAgentXLoader from '@/components/loaders/MyAgentXLoader'
// import LeadScoringTab from "@/components/dashboard/myagentX/LeadScoringTab";
import AddScoringModal from '@/components/modals/add-scoring-modal'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'
import StandardHeader from '@/components/common/StandardHeader'
import { TypographyH3 } from '@/lib/typography'
import { getLocalLocation } from '@/components/onboarding/services/apisServices/ApiService'
import KYCs from '@/components/pipeline/KYCs'
import GuarduanSetting from '@/components/pipeline/advancedsettings/GuardianSetting'
import Objection from '@/components/pipeline/advancedsettings/Objection'
import { GreetingTagInput } from '@/components/pipeline/tagInputs/GreetingTagInput'
import { PromptTagInput } from '@/components/pipeline/tagInputs/PromptTagInput'
import UpgradePlan from '@/components/userPlans/UpgradePlan'
import { isPlanActive } from '@/components/userPlans/UserPlanServices'
import AskToUpgrade from '@/constants/AskToUpgrade'
import {
  AgentLLmModels,
  Constants,
  HowToVideoTypes,
  HowtoVideos,
  PersistanceKeys,
  fromatMessageName,
  models,
} from '@/constants/Constants'
import UpgardView from '@/constants/UpgardView'
import UpgradeModal from '@/constants/UpgradeModal'
import { UserTypes } from '@/constants/UserTypes'
import { useUser } from '@/hooks/redux-hooks'
import { usePlanCapabilities } from '@/hooks/use-plan-capabilities'
import { fetchTemplates } from '@/services/leadScoringSerevices/FetchTempletes'
import { AgentLanguagesList } from '@/utilities/AgentLanguages'
import CircularLoader from '@/utilities/CircularLoader'
import { getGlobalPhoneNumber } from '@/utilities/PhoneNumberUtility'
import {
  findLLMModel,
  formatPhoneNumber,
  getAgentImage,
  getAgentProfileImage,
  getAgentsListImage,
} from '@/utilities/agentUtilities'
import { GetFormattedDateString } from '@/utilities/utility'
import { getTutorialByType, getVideoUrlByType } from '@/utils/tutorialVideos'
import { parseOAuthState } from '@/utils/oauthState'
import { forceApplyBranding } from '@/utilities/applyBranding'
import { hexToHsl, calculateIconFilter } from '@/utilities/colorUtils'

import VoiceMailTab from '../../../components/dashboard/myagentX/VoiceMailTab'
import AdvancedSettingsModalCN from '@/components/ui/AdvancedSettingsModalCN'
import ProtectedRoute from '@/components/permissions/ProtectedRoute'
import { PermissionProvider } from '@/contexts/PermissionContext'

// import EmbedVapi from "@/app/embed/vapi/page";
// import EmbedWidget from "@/app/test-embed/page";

const DuplicateButton = dynamic(
  () => import('@/components/animation/DuplicateButton'),
  {
    ssr: false,
  },
)

/** Modal content transition: scale 0.95→1 and opacity 0→1 on enter; reverse on exit. */
function ScaleFadeTransition({ in: inProp, children, onEnter, onExited, timeout = 250 }) {
  const [stage, setStage] = useState(inProp ? 'entering' : 'exited')
  const rafRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (inProp) {
      if (stage !== 'entered') {
        setStage('entering')
        onEnter?.()
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = requestAnimationFrame(() => setStage('entered'))
        })
      }
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      }
    } else {
      if (stage === 'exited') return
      setStage('exiting')
      timerRef.current = setTimeout(() => {
        onExited?.()
        setStage('exited')
      }, timeout)
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }
  }, [inProp, onEnter, onExited, stage, timeout])

  let style = {
    transition: `opacity ${timeout}ms ease-out, transform ${timeout}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
    opacity: 0,
    transform: 'scale(0.95)',
  }

  if (stage === 'entering' || stage === 'entered') {
    style = { ...style, opacity: 1, transform: 'scale(1)' }
  } else if (stage === 'exiting') {
    style = { ...style, opacity: 0, transform: 'scale(0.95)' }
  }

  if (stage === 'exited' && !inProp) {
    return null
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div style={style}>{children}</div>
    </div>
  )
}

function Page() {
  // IMMEDIATE POPUP HANDLING - Run before React renders to preserve popup context
  // This must run synchronously when component loads, before any state updates
  let shouldClosePopup = false
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    const ghlOauthSuccess = params.get('ghl_oauth')
    const locationId = params.get('locationId')
    const code = params.get('code')
    const error = params.get('error')

    // Check if we're in a popup window
    const isPopup = window.opener !== null && window.opener !== window
    const hasOpener = typeof window.opener !== 'undefined' && window.opener !== null


    // If in popup and GHL OAuth success, close immediately
    if (ghlOauthSuccess === 'success' && (isPopup || hasOpener)) {
      shouldClosePopup = true
      try {
        // Send message to parent window
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            {
              type: 'GHL_OAUTH_SUCCESS',
              locationId: locationId || null
            },
            window.location.origin,
          )
        }
      } catch (e) {
        console.error('🚨 IMMEDIATE: Error sending message:', e)
      }

      // Close popup immediately - try multiple times
      const closePopup = () => {
        try {
          window.close()
          // If close doesn't work, focus parent
          setTimeout(() => {
            if (!window.closed && window.opener && !window.opener.closed) {
              try {
                window.opener.focus()
              } catch (e) {
                console.error('🚨 IMMEDIATE: Error focusing parent:', e)
              }
            }
          }, 50)
        } catch (e) {
          console.error('🚨 IMMEDIATE: Error closing popup:', e)
          try {
            if (window.opener && !window.opener.closed) {
              window.opener.focus()
            }
          } catch (e2) {
            console.error('🚨 IMMEDIATE: Error focusing parent:', e2)
          }
        }
      }

      // Try closing immediately
      closePopup()

      // Try again after a short delay (some browsers need this)
      setTimeout(closePopup, 100)
      setTimeout(closePopup, 300)
    }

    // Also handle initial OAuth callback in popup (code parameter)
    if ((code || error) && (isPopup || hasOpener)) { }
  }

  // If this page is opened as the GHL OAuth redirect (contains ?code=...),
  // immediately message the opener (the original app window) and close.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')
    const state = params.get('state')
    if (!code && !error) return

    const hasOpener = typeof window.opener !== 'undefined' && window.opener !== null && window.opener !== window


    if (hasOpener) {
      try {
        window.opener.postMessage(
          { type: 'GHL_OAUTH_CODE', code, error, state },
          '*',
        )
      } catch { }
      try {
        window.close()
      } catch { }
    }
  }, [])


  // Redux hooks for plan management
  const { user: reduxUser, isAuthenticated, setUser: setReduxUser } = useUser()

  // Add flags to prevent infinite loops
  const [isInitializing, setIsInitializing] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Custom domain detection and branding
  const [isCustomDomain, setIsCustomDomain] = useState(false)
  const [agencyBranding, setAgencyBranding] = useState(null)

  // Handle OAuth callbacks - redirect to handler if OAuth parameters are present
  // Also handle GHL OAuth success redirect from exchange route
  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const error = params.get('error')
    const redirectUri = params.get('redirect_uri')
    const ghlOauthSuccess = params.get('ghl_oauth')
    const locationId = params.get('locationId')

    // Check if we're in a popup window - check multiple ways
    const isPopup = window.opener !== null && window.opener !== window
    const hasOpener = typeof window.opener !== 'undefined' && window.opener !== null

    // Handle GHL OAuth success redirect (after token exchange)
    if (ghlOauthSuccess === 'success') {
      // If in popup, send message to parent and close immediately
      if (isPopup || hasOpener) {
        // Function to close popup and notify parent
        const closePopupAndNotify = () => {
          try {
            // Send message to parent window first
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage(
                {
                  type: 'GHL_OAUTH_SUCCESS',
                  locationId: locationId || null
                },
                window.location.origin,
              )
            }
          } catch (e) {
            console.error('Error sending message to parent:', e)
          }

          // Close popup
          try {
            window.close()

            // If window didn't close (some browsers block it), focus parent as fallback
            setTimeout(() => {
              if (!window.closed && window.opener && !window.opener.closed) {
                try {
                  window.opener.focus()
                } catch (e) {
                  console.error('Error focusing parent:', e)
                }
              }
            }, 200)
          } catch (e) {
            console.error('Error closing popup:', e)
            // Fallback: try to focus parent window
            try {
              if (window.opener && !window.opener.closed) {
                window.opener.focus()
              }
            } catch (e2) {
              console.error('Error focusing parent:', e2)
            }
          }
        }

        // Close immediately (don't wait)
        closePopupAndNotify()
        return
      }

      // If not in popup, trigger calendar refresh via event
      const cleanUrl = new URL(window.location.href)
      cleanUrl.searchParams.delete('ghl_oauth')
      cleanUrl.searchParams.delete('locationId')
      window.history.replaceState({}, '', cleanUrl.toString())

      window.dispatchEvent(new CustomEvent('ghl-oauth-success', {
        detail: { locationId }
      }))

      return
    }

    // If OAuth parameters are present (but not from exchange route), redirect to the OAuth handler
    if (code || error) {
      // If in popup, handle redirect client-side to preserve popup context
      if (isPopup) {
        // Parse state to determine custom domain
        let stateData = null
        if (state) {
          try {
            // Use browser-compatible base64 decoding
            const decoded = atob(state)
            stateData = JSON.parse(decoded)
          } catch (e) {
            console.error('Error parsing state:', e)
          }
        }

        // If custom domain in state, redirect to custom domain exchange route
        if (stateData?.customDomain && stateData?.provider === 'ghl') {
          const isLocalhost = stateData.customDomain.includes('localhost') || stateData.customDomain.includes('127.0.0.1')
          const protocol = isLocalhost ? 'http' : 'https'
          const exchangeUrl = new URL('/api/ghl/exchange', `${protocol}://${stateData.customDomain}`)
          exchangeUrl.searchParams.set('code', code)
          if (state) exchangeUrl.searchParams.set('state', state)
          if (redirectUri) exchangeUrl.searchParams.set('redirect_uri', redirectUri)

          window.location.href = exchangeUrl.toString()
          return
        }

        // Fallback: redirect to OAuth handler
        const oauthHandlerUrl = new URL('/api/oauth/redirect', window.location.origin)
        if (code) oauthHandlerUrl.searchParams.set('code', code)
        if (state) oauthHandlerUrl.searchParams.set('state', state)
        if (error) oauthHandlerUrl.searchParams.set('error', error)
        if (params.get('error_description')) {
          oauthHandlerUrl.searchParams.set('error_description', params.get('error_description'))
        }
        if (redirectUri) oauthHandlerUrl.searchParams.set('redirect_uri', redirectUri)

        window.location.href = oauthHandlerUrl.toString()
        return
      }

      // Not in popup - use normal redirect
      const oauthHandlerUrl = new URL('/api/oauth/redirect', window.location.origin)
      if (code) oauthHandlerUrl.searchParams.set('code', code)
      if (state) oauthHandlerUrl.searchParams.set('state', state)
      if (error) oauthHandlerUrl.searchParams.set('error', error)
      if (params.get('error_description')) {
        oauthHandlerUrl.searchParams.set('error_description', params.get('error_description'))
      }
      if (redirectUri) oauthHandlerUrl.searchParams.set('redirect_uri', redirectUri)

      window.location.href = oauthHandlerUrl.toString()
      return
    }
  }, []) // Run only once on mount

  // useEffect(() => {
  //   console.log("reduxUser on myAgentX page", reduxUser)
  // }, [reduxUser])
  const {
    canCreateAgent,
    allowVoicemail,
    allowToolsAndActions,
    allowKnowledgeBases,
    allowLiveCallTransfer,
    isFeatureAllowed,
    getUpgradeMessage,
    isFreePlan,
    currentAgents,
    maxAgents,
  } = usePlanCapabilities()

  let baseUrl =
    process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
      ? 'https://app.assignx.ai/'
      : 'https://dev.assignx.ai/'

  let demoBaseUrl =
    reduxUser?.agencyBranding?.customDomain ? `https://${reduxUser?.agencyBranding?.customDomain}/` : baseUrl

  const timerRef = useRef()
  const fileInputRef = useRef([])
  const searchTimeoutRef = useRef(null)
  let attempts = 0
  const maxAttempts = 10
  // const fileInputRef = useRef(null);
  const router = useRouter()
  let tabs = ['Agent Info', 'Actions', 'Pipeline', 'Knowledge']
  const [AgentMenuOptions, setAgentMenuOptions] = useState(tabs)
  const [openTestAiModal, setOpenTestAiModal] = useState(false)
  const [name, setName] = useState('')
  //code for phonenumber
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [locationLoader, setLocationLoader] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [address, setAddress] = useState('')
  // const [budget, setBudget] = useState("");
  const [showDrawerSelectedAgent, setShowDrawerSelectedAgent] = useState(null)
  const [showMainAgent, setShowMainAgent] = useState(null)
  //calender details of selected agent
  const [calendarDetails, setCalendarDetails] = useState(null)
  const [activeTab, setActiveTab] = useState('Agent Info')
  const [showAddScoringModal, setShowAddScoringModal] = useState(false)
  const [mainAgentsList, setMainAgentsList] = useState([])
  const [canGetMore, setCanGetMore] = useState(false)
  const [paginationLoader, setPaginationLoader] = useState(false)
  const [oldAgentsList, setOldAgentsList] = useState([])
  //supporting variable
  const [canKeepLoading, setCanKeepLoading] = useState(false)
  const [initialLoader, setInitialLoader] = useState(true)

  //code for assigning the umber
  // const []
  const [assignNumber, setAssignNumber] = React.useState('')
  const [previousNumber, setPreviousNumber] = useState([])
  const selectRef = useRef()
  const [openCalimNumDropDown, setOpenCalimNumDropDown] = useState(false)
  const [showGlobalBtn, setShowGlobalBtn] = useState(true)
  const [showReassignBtn, setShowReassignBtn] = useState(false)
  const [showReassignBtnWidth, setShowReassignBtnWidth] = useState(false)
  const [reassignLoader, setReassignLoader] = useState(null)
  const [showClaimPopup, setShowClaimPopup] = useState(false)
  const [findeNumberLoader, setFindeNumberLoader] = useState(false)
  const [foundeNumbers, setFoundeNumbers] = useState([])
  const [findNumber, setFindNumber] = useState('')
  const [purchaseLoader, setPurchaseLoader] = useState(false)
  const [openPurchaseSuccessModal, setOpenPurchaseSuccessModal] =
    useState(false)
  const [selectedPurchasedNumber, setSelectedPurchasedNumber] = useState(null)
  const [selectedPurchasedIndex, setSelectedPurchasedIndex] = useState(null)
  const [assignLoader, setAssignLoader] = useState(false)

  //code for assign number confirmation model
  const [showConfirmationModal, setShowConfirmationModal] = useState(null)

  //code for user pipelines
  const [UserPipeline, setUserPipeline] = useState(null)

  //code for main agent id for update agent api
  const [MainAgentId, setMainAgentId] = useState('')

  //image variable
  const [selectedImages, setSelectedImages] = useState({})
  const [selectedAgent, setSelectedAgent] = useState(null)
  //del loader
  const [DelLoader, setDelLoader] = useState(false)
  const [delAgentModal, setDelAgentModal] = useState(false)
  //if agent have no number assigned
  const [ShowWarningModal, setShowWarningModal] = useState(null)
  //code for view script
  const [showScriptModal, setShowScriptModal] = useState(null)
  const [showScript, setShowScript] = useState(false)
  const [SeledtedScriptKYC, setSeledtedScriptKYC] = useState(false)
  //code for advanced settings
  const [showAdvancedSettingsModal, setShowAdvancedSettingsModal] = useState(false)
  const [advancedSettingsLoader, setAdvancedSettingsLoader] = useState(false)
  //show objection and guadrails
  const [showObjection, setShowObjection] = useState(false)
  const [showGuardrails, setShowGuardrails] = useState(false)
  const [showObjectives, setShowObjectives] = useState(true)
  //code for outboundObjective
  const [objective, setObjective] = useState('')
  const [oldObjective, setOldObjective] = useState('')
  //code for objective
  // const [objective, setobjective] = useState("");
  // const [inboundOldObjective, setInboundOldObjective] = useState("");
  const [showObjectionsSaveBtn, setShowObjectionsSaveBtn] = useState(false)
  const [SeledtedScriptAdvanceSetting, setSeledtedScriptAdvanceSetting] =
    useState(false)
  const [introVideoModal, setIntroVideoModal] = useState(false)
  const [introVideoModal2, setIntroVideoModal2] = useState(false)
  const [showNoAudioModal, setShowNoAudioModal] = useState(null)
  const [kycsData, setKycsData] = useState(null)
  //greeting tag input
  const [greetingTagInput, setGreetingTagInput] = useState('')
  const [oldGreetingTagInput, setOldGreetingTagInput] = useState('')
  const [scrollOffset, setScrollOffset] = useState({
    scrollTop: 0,
    scrollLeft: 0,
  })
  const containerRef = useRef(null) // Ref to the scrolling container
  const [showSuccessSnack, setShowSuccessSnack] = useState(null)
  const [showErrorSnack, setShowErrorSnack] = useState(null)

  //for updated snack
  const [isVisibleSnack, setIsVisibleSnack] = useState(null)
  const [isVisibleSnack2, setIsVisibleSnack2] = useState(null)

  const [testAIloader, setTestAIloader] = useState(false)
  const [uniqueColumns, setUniqueColumns] = useState([])
  const [showMoreUniqueColumns, setShowMoreUniqueColumns] = useState(false)
  const [showSaveChangesBtn, setShowSaveChangesBtn] = useState(false)
  const [UpdateAgentLoader, setUpdateAgentLoader] = useState(false)
  const [fetureType, setFetureType] = useState('')
  const [moreAgentsPopupType, setMoreAgentsPopupType] = useState('')

  //agent KYC's
  const [kYCList, setKYCList] = useState([])

  //prompt tag input
  const [scriptTagInput, setScriptTagInput] = useState('')
  const [OldScriptTagInput, setOldScriptTagInput] = useState('')

  //code for testing the ai
  let callScript = null
  let keys = []

  //variable string the keys
  const [scriptKeys, setScriptKeys] = useState([])
  //variable for input field value
  const [inputValues, setInputValues] = useState({})
  //code for storing the agents data
  const [hasMoreAgents, setHasMoreAgents] = useState(true)
  const [agentsListSeparated, setAgentsListSeparated] = useState([]) //agentsListSeparated: Inbound and outbound separated. Api gives is under one main agent
  const [agentsList, setAgentsList] = useState([])
  //agents before search
  const [agentsBeforeSearch, setAgentsBeforeSearch] = useState([])

  const [actionInfoEl, setActionInfoEl] = React.useState(null)
  const [hoveredIndexStatus, setHoveredIndexStatus] = useState(null)
  const [hoveredIndexAddress, setHoveredIndexAddress] = useState(null)

  //code for image select and drag and drop
  const [selectedImage, setSelectedImage] = useState('')
  const [selectedImage2, setSelectedImage2] = useState(null)
  const [profileImageHovered, setProfileImageHovered] = useState(false)
  const [dragging, setDragging] = useState(false)

  const [globalLoader, setGlobalLoader] = useState(false)

  const [showVoiceLoader, setShowVoiceLoader] = useState(false)
  const [showPhoneLoader, setShowPhoneLoader] = useState(false)

  //all calenders added by user
  const [previousCalenders, setPreviousCalenders] = useState([])

  const [user, setUser] = useState(null)

  // console.log('user', user)

  const [showRenameAgentPopup, setShowRenameAgentPopup] = useState(false)
  const [renameAgent, setRenameAgent] = useState('')
  const [selectedRenameAgent, setSelectedRenameAgent] = useState('')
  const [renameAgentLoader, setRenameAgentLoader] = useState(false)

  const [openGptManu, setOpenGptManu] = useState('')
  const [selectedGptManu, setSelectedGptManu] = useState(models[0])
  const getModelIcon = (model) =>
    model?.value === 'gpt-4.1-mini' &&
      (reduxUser?.agencyBranding?.supportWidgetLogoUrl)
      ? (reduxUser?.agencyBranding?.supportWidgetLogoUrl)
      : model?.icon
    // console.log("Value of reduxUser is", reduxUser)

  // Agency custom name for the AssignX (gpt-4.1-mini) model; subaccounts see this via agency branding
  const assignxModelDisplayName =
    agencyBranding?.customizations?.assignxModelDisplayName ||
    reduxUser?.agencyBranding?.customizations?.assignxModelDisplayName
  const getModelDisplayName = (model) =>
    model?.value === 'gpt-4.1-mini' && assignxModelDisplayName
      ? assignxModelDisplayName
      : model?.name

  const [voiceExpressiveness, setVoiceExpressiveness] = useState('')
  const [startingPace, setStartingPace] = useState('')
  const [patienceValue, setPatienceValue] = useState('')
  const [languageValue, setLanguageValue] = useState('')

  const [callRecordingPermition, setCallRecordingPermition] = useState('')

  const [showCallRecordingLoader, setShowCallRecordingLoader] = useState(false)
  const [showStartingPaceLoader, setShowStartingPaceLoader] = useState(false)
  const [showPatienceLoader, setShowPatienceLoader] = useState(false)
  const [showLanguageLoader, setShowLanguageLoader] = useState(false)
  const [showVoiceExpressivenessLoader, setShowVoiceExpressivenessLoader] =
    useState(false)

  const [showModelLoader, setShowModelLoader] = useState(false)

  const [preview, setPreview] = useState(null)
  const [audio, setAudio] = useState(null)

  const [showEditNumberPopup, setShowEditNumberPopup] = useState(null)
  const [selectedNumber, setSelectedNumber] = useState('')

  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState('')
  const [duplicateLoader, setDuplicateLoader] = useState(false)

  //nedd help popup
  const [needHelp, setNeedHelp] = useState(false)

  //it saves previous list of agents before search
  const [allAgentsList, setAllAgentsList] = useState([])

  const [showDuplicateConfirmationPopup, setShowDuplicateConfirmationPopup] =
    useState(false)

  const [showEmbed, setShowEmbed] = useState(false)

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showUpgradePlanModal, setShowUpgradePlanModal] = useState(false)
  const [showMoreAgentsPopup, setShowMoreAgentsPopup] = useState(false)
  const [title, setTitle] = useState(null)
  const [subTitle, setSubTitle] = useState(null)

  const [showAskToUpgradeModal, setShowAskToUPgradeModal] = useState(false)

  // Web Agent Modal states
  const [showWebAgentModal, setShowWebAgentModal] = useState(false)
  const [showNewSmartListModal, setShowNewSmartListModal] = useState(false)
  const [showAllSetModal, setShowAllSetModal] = useState(false)
  const [selectedAgentForWebAgent, setSelectedAgentForWebAgent] = useState(null)

  // Embed Modal states
  const [showEmbedModal, setShowEmbedModal] = useState(false)
  const [showEmbedSmartListModal, setShowEmbedSmartListModal] = useState(false)
  const [showEmbedAllSetModal, setShowEmbedAllSetModal] = useState(false)
  const [selectedAgentForEmbed, setSelectedAgentForEmbed] = useState(null)
  const [embedCode, setEmbedCode] = useState('')
  const [showSnackMsg, setShowSnackMsg] = useState({
    type: SnackbarTypes.Success,
    message: '',
    isVisible: false,
  })
  const [featureTitle, setFeatureTitle] = useState('')
  const [selectedSmartList, setSelectedSmartList] = useState('')
  const [showUnlockPremiumFeaturesPopup, setShowUnlockPremiumFeaturesPopup] =
    useState(false)

  // Function to refresh user data after plan upgrade
  const refreshUserData = async () => {
    try {
      const profileResponse = await getProfileDetails()

      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data
        const localData = JSON.parse(localStorage.getItem('User') || '{}')

        // Update Redux with fresh data
        const updatedUserData = {
          token: localData.token,
          user: freshUserData,
        }

        setReduxUser(updatedUserData)
        localStorage.setItem('User', JSON.stringify(updatedUserData))

        return true
      }
      return false
    } catch (error) {
      console.error('🔴 [UPGRADE-TAG] Error refreshing user data:', error)
      return false
    }
  }

  const getKyc = async () => {
    try {
      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const Data = JSON.parse(localData)
        // //console.log;
        AuthToken = Data.token
      }

      let MainAgentData = null
      const mainAgentData = localStorage.getItem('agentDetails')
      if (mainAgentData) {
        const Data = JSON.parse(mainAgentData)
        //console.log;
        MainAgentData = Data.id
      }

      // //console.log;

      let ApiPath = null

      if (MainAgentData) {
        ApiPath = `${Apis.getKYCs}?mainAgentId=${MainAgentId}`
      } else {
        ApiPath = `${Apis.getKYCs}?mainAgentId=${MainAgentId}`
      }

      // //console.log;
      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        setKycsData(response.data.data)
      } else {
        // //console.log
      }
    } catch (error) {
      // console.error("Error occured in gett kyc api is :--", error);
    } finally {
      // //console.log;
    }
  }

  // Web Agent Modal handlers
  const handleWebAgentClick = (agent) => {
    if (reduxUser?.agencyCapabilities?.allowEmbedAndWebAgents === false) {
      setShowUpgradeModal(true)
      setTitle('Unlock your Web Agent')
      setSubTitle(
        'Bring your AI agent to your website allowing them to engage with leads and customers',
      )
      setFeatureTitle('EmbedAgents')
    } else {
      if (reduxUser?.planCapabilities?.allowEmbedAndWebAgents === false) {
        setShowUpgradeModal(true)
        setTitle('Unlock your Web Agent')
        setSubTitle(
          'Bring your AI agent to your website allowing them to engage with leads and customers',
        )
      } else {
        // Merge with existing updated agent state if available (to preserve smartlist updates)
        let agentToUse = agent
        if (selectedAgentForWebAgent && selectedAgentForWebAgent.id === agent.id) {
          // We have an updated version of this agent - merge the smartlist fields
          agentToUse = {
            ...agent,
            // Preserve updated smartlist fields from state
            smartListIdForWeb: selectedAgentForWebAgent.smartListIdForWeb ?? agent.smartListIdForWeb,
            smartListEnabledForWeb: selectedAgentForWebAgent.smartListEnabledForWeb ?? agent.smartListEnabledForWeb,
            smartListIdForWebhook: selectedAgentForWebAgent.smartListIdForWebhook ?? agent.smartListIdForWebhook,
            smartListEnabledForWebhook: selectedAgentForWebAgent.smartListEnabledForWebhook ?? agent.smartListEnabledForWebhook,
            smartListIdForEmbed: selectedAgentForWebAgent.smartListIdForEmbed ?? agent.smartListIdForEmbed,
            smartListEnabledForEmbed: selectedAgentForWebAgent.smartListEnabledForEmbed ?? agent.smartListEnabledForEmbed,
          }
        }
        setSelectedAgentForWebAgent(agentToUse)
        setShowWebAgentModal(true)
        setFetureType('webagent')
      }
    }
  }

  const handleOpenAgentInNewTab = () => {
    let agent = {
      ...selectedAgentForWebAgent,
      smartListId: selectedSmartList,
    }
    setSelectedAgentForWebAgent(agent)
    showDrawerSelectedAgent.smartListId = selectedSmartList

    if (selectedAgentForWebAgent) {
      const modelId = encodeURIComponent(
        selectedAgentForWebAgent?.modelIdVapi ||
        selectedAgentForWebAgent?.agentUuid ||
        '',
      )
      const name = encodeURIComponent(selectedAgentForWebAgent?.name || '')

      let baseUrl;
      if (reduxUser?.agencyBranding?.customDomain) {
        baseUrl = `https://${reduxUser.agencyBranding.customDomain}`;
      } else {
        baseUrl = window.location.origin;
      }
      // return;
      window.open(`${baseUrl}/web-agent/${modelId}?name=${name}`, '_blank')
    }
    setShowWebAgentModal(false)
    setShowAllSetModal(true)
  }

  const handleShowNewSmartList = () => {
    setShowWebAgentModal(false)
    setShowNewSmartListModal(true)
  }

  // Helper function to get agent from mainAgentsList (reads from nested agents array)
  const getAgentFromMainList = (agentId) => {
    if (!mainAgentsList || mainAgentsList.length === 0) {
      return null
    }

    // Convert agentId to number if it's a numeric string for strict comparison
    const agentIdNum = typeof agentId === 'string' && !isNaN(agentId) ? Number(agentId) : agentId
    const agentIdStr = String(agentId)

    for (const mainAgent of mainAgentsList) {
      if (mainAgent.agents && mainAgent.agents.length > 0) {
        const foundAgent = mainAgent.agents.find((subAgent) => {
          // Strict matching: check numeric id first, then UUIDs
          if (typeof agentIdNum === 'number' && !isNaN(agentIdNum)) {
            return subAgent.id === agentIdNum
          }
          return (
            (subAgent.modelIdVapi && subAgent.modelIdVapi === agentIdStr) ||
            (subAgent.agentUuid && subAgent.agentUuid === agentIdStr)
          )
        })

        if (foundAgent) {
          return foundAgent
        }
      }
    }

    console.warn('🔍 GET-AGENT-FROM-MAIN-LIST - Agent not found:', {
      agentId,
      agentIdNum,
      mainAgentsListCount: mainAgentsList.length,
    })
    return null
  }

  // Helper function to update agent in mainAgentsList and localStorage
  const updateAgentInMainList = (agentId, updates) => {
    // Convert agentId to number if it's a numeric string for strict comparison
    const agentIdNum = typeof agentId === 'string' && !isNaN(agentId) ? Number(agentId) : agentId
    const agentIdStr = String(agentId)

    let foundAgent = null
    let updatedCount = 0

    const updatedList = mainAgentsList.map((mainAgent) => {
      const updatedSubAgents = mainAgent.agents.map((subAgent) => {
        // Strict matching: check numeric id first, then UUIDs
        let matches = false

        // For numeric IDs, do strict numeric comparison
        if (typeof agentIdNum === 'number' && !isNaN(agentIdNum)) {
          matches = subAgent.id === agentIdNum
        }

        // If not matched by numeric ID, try UUIDs (exact string match)
        if (!matches) {
          matches =
            (subAgent.modelIdVapi && subAgent.modelIdVapi === agentIdStr) ||
            (subAgent.agentUuid && subAgent.agentUuid === agentIdStr)
        }

        if (matches) {
          foundAgent = subAgent
          updatedCount++
          return {
            ...subAgent,
            ...updates,
          }
        }
        return subAgent
      })

      return {
        ...mainAgent,
        agents: updatedSubAgents,
      }
    })

    if (!foundAgent) {
      console.error('🔧 AGENT-UPDATE - Agent NOT found in mainAgentsList:', {
        agentId,
        agentIdNum,
        agentIdStr,
        mainAgentsListCount: mainAgentsList.length,
        availableAgentIds: mainAgentsList.flatMap(ma =>
          ma.agents?.map(a => ({ id: a.id, name: a.name, modelIdVapi: a.modelIdVapi })) || []
        ),
      })
      return // Don't update if agent not found
    }

    if (updatedCount > 1) {
      console.error('🔧 AGENT-UPDATE - WARNING: Multiple agents matched! This should not happen:', {
        agentId,
        updatedCount,
      })
      return // Don't update if multiple matches (data corruption risk)
    }

    // Update state
    setMainAgentsList(updatedList)

    // Update localStorage
    localStorage.setItem(
      PersistanceKeys.LocalStoredAgentsListMain,
      JSON.stringify(updatedList),
    )
  }

  const handleSmartListCreated = async (smartListData) => {
    // Note: AddSmartList API already attached the smartlist with correct agentType
    // So we don't need to call attachSmartList again here
    // Just update local state for UI consistency
    const smartListId = smartListData?.id || smartListData?.data?.id || smartListData
    // Use agentType from the response if available, otherwise fall back to fetureType
    const agentType = smartListData?.agentType || (fetureType === 'webhook' ? 'webhook' : 'web')

    // Explicitly set fetureType based on agentType to ensure AllSetModal shows correct type
    // This ensures the modal title displays correctly even if fetureType state was not set properly
    // agentType can be 'webhook' or 'web', and we map 'web' to 'webagent' for fetureType
    if (agentType === 'webhook') {
      setFetureType('webhook')
    } else if (agentType === 'web') {
      setFetureType('webagent')
    } else { }

    // Determine which fields to update based on agentType
    const updates = {
      smartListId: smartListId, // Legacy field
    }

    if (agentType === 'webhook') {
      updates.smartListIdForWebhook = smartListId
      updates.smartListEnabledForWebhook = true
    } else {
      updates.smartListIdForWeb = smartListId
      updates.smartListEnabledForWeb = true
    }

    // Update selectedAgentForWebAgent state
    const updatedAgent = {
      ...selectedAgentForWebAgent,
      ...updates,
    }
    setSelectedAgentForWebAgent(updatedAgent)

    // Update agent in mainAgentsList and localStorage
    // CRITICAL: Use numeric ID only - never use modelIdVapi as it could match wrong agent
    const agentIdToUpdate = selectedAgentForWebAgent?.id
    if (agentIdToUpdate && typeof agentIdToUpdate === 'number') {
      updateAgentInMainList(agentIdToUpdate, updates)
    } else {
      console.error('🔧 WEB-AGENT - Cannot update main list: agentId is missing or invalid', {
        agentIdToUpdate,
        agentIdType: typeof agentIdToUpdate,
        selectedAgentForWebAgent: {
          id: selectedAgentForWebAgent?.id,
          idType: typeof selectedAgentForWebAgent?.id,
          modelIdVapi: selectedAgentForWebAgent?.modelIdVapi,
          name: selectedAgentForWebAgent?.name,
        },
      })
    }

    // Update showDrawerSelectedAgent if it exists
    if (showDrawerSelectedAgent) {
      showDrawerSelectedAgent.smartListId = smartListId
      if (agentType === 'webhook') {
        showDrawerSelectedAgent.smartListIdForWebhook = smartListId
        showDrawerSelectedAgent.smartListEnabledForWebhook = true
      } else {
        showDrawerSelectedAgent.smartListIdForWeb = smartListId
        showDrawerSelectedAgent.smartListEnabledForWeb = true
      }
    }

    setShowNewSmartListModal(false)
    setShowAllSetModal(true)
  }

  const handleCloseAllSetModal = () => {
    setShowAllSetModal(false)
    setSelectedAgentForWebAgent(null)
  }

  // Embed Modal handlers
  const handleEmbedClick = (agent) => {
    // CRITICAL: Always read from mainAgentsList (localStorage) as the source of truth
    // This ensures we get the correct smartlist status from persisted data
    const agentFromMainList = getAgentFromMainList(agent.id)

    // Use agent from main list if found (has latest persisted data), otherwise use the passed agent
    let agentToUse = agentFromMainList || agent

    // CRITICAL: Only merge selectedAgentForEmbed if it's for the EXACT SAME agent
    // This prevents cross-contamination between different agents
    if (selectedAgentForEmbed && selectedAgentForEmbed.id === agent.id && selectedAgentForEmbed.id === agentToUse.id) {
      // We have an updated version of THIS SPECIFIC agent - merge the smartlist fields
      // But prioritize agentFromMainList data since it's from localStorage (persisted)
      agentToUse = {
        ...agentToUse,
        // Only override if selectedAgentForEmbed has newer data (non-null/true values)
        smartListIdForEmbed: selectedAgentForEmbed.smartListIdForEmbed ?? agentToUse.smartListIdForEmbed,
        smartListEnabledForEmbed: selectedAgentForEmbed.smartListEnabledForEmbed ?? agentToUse.smartListEnabledForEmbed,
        smartListIdForWeb: selectedAgentForEmbed.smartListIdForWeb ?? agentToUse.smartListIdForWeb,
        smartListEnabledForWeb: selectedAgentForEmbed.smartListEnabledForWeb ?? agentToUse.smartListEnabledForWeb,
        smartListIdForWebhook: selectedAgentForEmbed.smartListIdForWebhook ?? agentToUse.smartListIdForWebhook,
        smartListEnabledForWebhook: selectedAgentForEmbed.smartListEnabledForWebhook ?? agentToUse.smartListEnabledForWebhook,
      }
    } else {
      // Clear selectedAgentForEmbed if it's for a different agent to prevent cross-contamination
      if (selectedAgentForEmbed && selectedAgentForEmbed.id !== agent.id) {
        setSelectedAgentForEmbed(null)
      }

      if (agentFromMainList) { } else { }
    }

    if (reduxUser?.agencyCapabilities?.allowEmbedAndWebAgents === false) {
      setShowUpgradeModal(true)
      setTitle('Unlock your Web Agent')
      setSubTitle(
        'Bring your AI agent to your website allowing them to engage with leads and customers',
      )
      setFeatureTitle('EmbedAgents')
    } else {
      if (reduxUser?.planCapabilities?.allowEmbedAndWebAgents === false) {
        setShowUpgradeModal(true)
        setTitle('Unlock your Web Agent')
        setSubTitle(
          'Bring your AI agent to your website allowing them to engage with leads and customers',
        )
      } else {
        // CRITICAL: Validate that agentToUse has the correct smartlist data
        // Log a warning if we detect potential cross-contamination
        if (agentToUse.smartListIdForEmbed && agentToUse.id !== agent.id) {
          console.error('🔍 EMBED-CLICK - WARNING: Potential data corruption detected!', {
            agentId: agent.id,
            agentName: agent.name,
            agentToUseId: agentToUse.id,
            agentToUseName: agentToUse.name,
            smartListIdForEmbed: agentToUse.smartListIdForEmbed,
          })
        }

        setSelectedAgentForEmbed(agentToUse)
        setShowEmbedModal(true)
      }
    }
  }

  const handleShowEmbedSmartList = () => {
    setShowEmbedModal(false)
    setShowEmbedSmartListModal(true)
  }

  const handleEmbedSmartListCreated = async (smartListData) => {
    // Note: AddSmartList API already attached the smartlist with agentType='embed'
    // Update local agent state so the modal shows correct state if reopened
    const smartListId = smartListData?.id || smartListData?.data?.id || smartListData

    if (selectedAgentForEmbed && smartListId) {
      // Determine which fields to update for embed agent
      const updates = {
        smartListId: smartListId, // Legacy field
        smartListIdForEmbed: smartListId,
        smartListEnabledForEmbed: true,
      }

      // Update selectedAgentForEmbed state
      const updatedAgent = {
        ...selectedAgentForEmbed,
        ...updates,
      }
      setSelectedAgentForEmbed(updatedAgent)

      // Update agent in mainAgentsList and localStorage
      // CRITICAL: Use numeric ID only - never use modelIdVapi as it could match wrong agent
      const agentIdToUpdate = selectedAgentForEmbed?.id
      if (agentIdToUpdate && typeof agentIdToUpdate === 'number') {
        updateAgentInMainList(agentIdToUpdate, updates)
      } else {
        console.error('🔧 EMBED-AGENT - Cannot update main list: agentId is missing or invalid', {
          agentIdToUpdate,
          agentIdType: typeof agentIdToUpdate,
          selectedAgentForEmbed: {
            id: selectedAgentForEmbed?.id,
            idType: typeof selectedAgentForEmbed?.id,
            modelIdVapi: selectedAgentForEmbed?.modelIdVapi,
            name: selectedAgentForEmbed?.name,
          },
        })
      }
    }

    setShowEmbedSmartListModal(false)
    setShowEmbedAllSetModal(true)
    // Generate embed code here
    const code = `<iframe src="${baseUrl}embed/support/${selectedAgentForEmbed ? selectedAgentForEmbed?.modelIdVapi : DEFAULT_ASSISTANT_ID}" style="position: fixed; bottom: 0; right: 0; width: 320px; 
  height: 100vh; border: none; background: transparent; z-index: 
  9999; pointer-events: none;" allow="microphone" onload="this.style.pointerEvents = 'auto';">
  </iframe>`
    setEmbedCode(code)
  }

  const handleCloseEmbedAllSetModal = () => {
    setShowEmbedAllSetModal(false)
    // Don't clear selectedAgentForEmbed - keep it so the state persists when modal is reopened
    // setSelectedAgentForEmbed(null)
    setEmbedCode('')
  }

  const playVoice = (url) => {
    if (audio) {
      audio.pause()
    }
    const ad = new Audio(url) // Create a new Audio object with the preview URL
    ad.play()
    setAudio(ad) // Play the audio
    setPreview(url)

    // Handle when the audio ends
    ad.addEventListener('ended', () => {
      setPreview(null)
    })
  }

  // const Languages  = AgentLanguagesList

  const voiceExpressivenessList = [
    {
      id: 1,
      title: '🎭 Expressive',
      value: 'Expressive',
    },
    {
      id: 2,
      title: '⚖️ Balanced',
      value: 'Balanced',
    },
    {
      id: 3,
      title: '😌 Calm',
      value: 'Calm',
    },
  ]

  // 🐢
  const TalkingPaceList = [
    { id: 1, title: '💨 Fast ~1.1', value: 'Fast' },
    { id: 2, title: '⚖️ Balanced ~3.0', value: 'Balanced' },
    { id: 3, title: '🐢 Slow ~0.9', value: 'Slow' },
  ]
  const ResponseSpeedList = [
    {
      id: 1,
      title: '⚡️ Instant ~100ms',
      value: 'Instant',
    },
    {
      id: 2,
      title: '⏳ Short Pause ~400ms',
      value: 'Short Pause',
    },
    {
      id: 3,
      title: '🧘 Delayed ~600ms',
      value: 'Natural Conversation Flow',
    },
  ]

  // get selected agent from local if calendar added by google

  useEffect(() => {
    getKyc()
  }, [showScriptModal])

  useEffect(() => {
    let d = localStorage.getItem(PersistanceKeys.CalendarAddedByGoogle)
    if (d) {
      let calendarAddedByGoogle = JSON.parse(d)
      if (calendarAddedByGoogle) {
        let ag = localStorage.getItem(PersistanceKeys.SelectedAgent)
        if (ag) {
          let agent = JSON.parse(ag)

          // console.log('selected agent from local is', agent)
          setShowDrawerSelectedAgent(agent)
        }
      }
    }

    // Prefetch the createagent route for faster navigation
    router.prefetch('/createagent')

    // Cleanup function for component unmount
  }, [])

  // Function to sync fresh profile data to Redux
  const syncProfileToRedux = async (skipLocalStorage = false) => {
    try {
      // console.log('🔄 [DASHBOARD] Fetching fresh profile data...');
      const profileResponse = await getProfileDetails()

      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data
        const localData = getUserLocalData()

        // console.log('🔄 [DASHBOARD] Syncing profile to Redux - userId:', freshUserData?.id);

        // Update Redux with fresh data
        setReduxUser({
          token: localData.token,
          user: freshUserData,
        })

        // Only update localStorage if not skipped (to prevent loops during initialization)
        if (!skipLocalStorage) {
          const updatedUserData = {
            token: localData.token,
            user: freshUserData,
          }
          localStorage.setItem('User', JSON.stringify(updatedUserData))
          setUser(updatedUserData)
        }
      }
    } catch (error) {
      console.error('🔴 [DASHBOARD] Error syncing profile to Redux:', error)
    }
  }

  // Handle successful plan upgrade - refresh user data
  const handleUpgradeSuccess = async () => {
    // console.log('🎉 [DASHBOARD] Plan upgrade successful! Fetching fresh profile data...');

    try {
      // Always fetch fresh profile data after upgrade
      // console.log('🔄 [DASHBOARD] Calling getProfileDetails API for latest plan info...');
      const profileResponse = await getProfileDetails()

      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data
        const localData = getUserLocalData()

        // console.log('✅ [DASHBOARD] Fresh profile data received - maxAgents:', freshUserData?.planCapabilities?.maxAgents);

        const updatedUserData = {
          token: localData.token,
          user: freshUserData,
        }

        // Update both Redux and localStorage
        setReduxUser(updatedUserData)
        localStorage.setItem('User', JSON.stringify(updatedUserData))
        setUser(updatedUserData)

        // console.log('🎊 [DASHBOARD] User data successfully refreshed after upgrade!');
      } else {
        console.error(
          '🔴 [DASHBOARD] Failed to get fresh profile data after upgrade',
        )
      }
    } catch (error) {
      console.error(
        '🔴 [DASHBOARD] Error refreshing user data after upgrade:',
        error,
      )
    }
  }

  // Combined initialization function (merges Redux + test branch logic)
  const initializeUserData = async () => {
    // Prevent infinite loops
    if (isInitializing || hasInitialized) {
      // console.log('🛑 [DASHBOARD] Initialization already in progress or completed');
      return
    }

    setIsInitializing(true)
    attempts++
    // console.log(`🔄 [DASHBOARD] Initializing user data - attempt ${attempts}`);

    try {
      const data = localStorage.getItem('User')
      if (data) {
        const userData = JSON.parse(data)
        // console.log(`✅ [DASHBOARD] User found on attempt ${attempts}`);

        // Set local state (from test branch)
        setUser(userData)

        // Load into Redux if not already there (from our branch)
        if (userData && !reduxUser) {
          // console.log('🔄 [DASHBOARD] Loading localStorage to Redux');
          setReduxUser({
            token: userData.token,
            user: userData.user,
          })
        }

        // Only sync profile if we haven't already initialized
        // Skip localStorage update during initialization to prevent loops
        if (!hasInitialized) {
          await syncProfileToRedux(true)
        }

        setHasInitialized(true)
      } else if (attempts < maxAttempts) {
        // console.log(`⚠️ [DASHBOARD] User not found on attempt ${attempts}, retrying in 500ms...`);
        setIsInitializing(false) // Allow retry
        setTimeout(initializeUserData, 500) // retry after 500ms
        return // Don't set isInitializing to false at the end
      } else {
        // console.warn(`❌ [DASHBOARD] User not found in localStorage after ${attempts} attempts.`);
        setHasInitialized(true) // Prevent further retries
      }
    } catch (error) {
      console.error('🔴 [DASHBOARD] Error in initializeUserData:', error)
      setHasInitialized(true) // Prevent infinite retries on error
    } finally {
      setIsInitializing(false)
    }
  }

  useEffect(() => {
    // Combined initialization: Redux + localStorage with retry logic
    // Only run once on component mount
    if (!hasInitialized && !isInitializing) {
      initializeUserData()
    }
  }, [hasInitialized, isInitializing]) // Add dependencies to prevent infinite loops
  // get selected agent from local if calendar added by google

  //printing the user object data after setting the data inside it
  // useEffect(() => {
  //   if (user) {
  //     console.log("Data stored in user variable is", user)
  //   }
  // }, [user])

  useEffect(() => {
    let d = localStorage.getItem(PersistanceKeys.CalendarAddedByGoogle)
    if (d) {
      let calendarAddedByGoogle = JSON.parse(d)
      if (calendarAddedByGoogle) {
        let ag = localStorage.getItem(PersistanceKeys.SelectedAgent)
        if (ag) {
          let agent = JSON.parse(ag)

          // console.log("selected agent from local is", agent);
          setShowDrawerSelectedAgent(agent)
        }
      }
    }
  }, [])

  //storing agents in backup variable before

  useEffect(() => {
    const updateAgentManueList = () => {
      if (showDrawerSelectedAgent?.agentType === 'outbound') {
        let newTab = 'Voicemail'
        if (!AgentMenuOptions.includes('Voicemail')) {
          setAgentMenuOptions((prev) => [...prev, newTab])
        }
      } else {
        setAgentMenuOptions(tabs)
      }
      // console.log('agent type is', showDrawerSelectedAgent?.agentType)
    }
    updateAgentManueList()
  }, [showDrawerSelectedAgent])

  //call get numbers list api
  useEffect(() => {
    if (showDrawerSelectedAgent === null) {
      getAvailabePhoneNumbers()
    }
  }, [showDrawerSelectedAgent])

  useEffect(() => {
    const d = localStorage.getItem(PersistanceKeys.TestAiCredentials)
    if (!d) return

    const cr = JSON.parse(d)
    // console.log("credentials from local", cr);

    setName(cr?.name || '')
    setPhone(cr?.phone || '')

    // Combine all extraColumns into one flat object
    const flatExtraColumns = {}
    if (Array.isArray(cr.extraColumns)) {
      cr.extraColumns.forEach((obj) => {
        Object.entries(obj).forEach(([key, value]) => {
          flatExtraColumns[key] = value
        })
      })
    }

    // console.log('flatExtracolumns', flatExtraColumns)

    // Now map through current scriptKeys and set values if present
    const updatedInputValues = {}
    scriptKeys.forEach((key) => {
      if (flatExtraColumns?.hasOwnProperty(key)) {
        updatedInputValues[key] = flatExtraColumns[key]
      }
    })

    // console.log('updatedInputValues', updatedInputValues)

    setInputValues(updatedInputValues)
  }, [openTestAiModal])

  ////// //console.log;

  // Function to render icon with branding using mask-image (same logic as NotificationsDrawer.js)
  // Optional 4th arg: useBlack = true forces icon color to black instead of brand color
  const renderBrandedIcon = (iconPath, width, height, useBlack = false) => {
    if (typeof window === 'undefined') {
      return <Image src={iconPath} width={width} height={height} alt="*" />
    }

    // Get brand color from CSS variable (unless useBlack)
    const root = document.documentElement
    const brandColor = getComputedStyle(root).getPropertyValue('--brand-primary')?.trim()
    const iconColor = useBlack ? '#000' : (brandColor && brandColor !== '' && brandColor.length >= 3 ? `hsl(${brandColor})` : undefined)

    // Black icon (e.g. drawer actions)
    if (useBlack) {
      return (
        <div
          style={{
            width: width,
            height: height,
            minWidth: width,
            minHeight: height,
            backgroundColor: '#000',
            WebkitMaskImage: `url(${iconPath})`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            WebkitMaskMode: 'alpha',
            maskImage: `url(${iconPath})`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            maskMode: 'alpha',
            flexShrink: 0,
          }}
        />
      )
    }

    // No valid brand color: plain Image
    if (!iconColor) {
      return <Image src={iconPath} width={width} height={height} alt="*" />
    }

    // Use mask-image approach: background color with icon as mask
    return (
      <div
        style={{
          width: width,
          height: height,
          minWidth: width,
          minHeight: height,
          backgroundColor: iconColor,
          WebkitMaskImage: `url(${iconPath})`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          WebkitMaskMode: 'alpha',
          maskImage: `url(${iconPath})`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          maskMode: 'alpha',
          transition: 'background-color 0.2s ease-in-out',
          flexShrink: 0,
        }}
      />
    )
  }

  // Custom domain detection and branding application
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if current domain is a custom domain (not dev.assignx.ai or app.assignx.ai)
    const hostname = window.location.hostname
    const isCustom = hostname !== 'dev.assignx.ai' && hostname !== 'app.assignx.ai'
    setIsCustomDomain(isCustom)

    // Get agency branding from localStorage
    const storedBranding = localStorage.getItem('agencyBranding')
    if (storedBranding) {
      try {
        const brandingData = JSON.parse(storedBranding)
        setAgencyBranding(brandingData)

        // Apply branding CSS variables if it's a custom domain
        if (isCustom && brandingData) {
          try {
            const primaryColor = brandingData.primaryColor || '#7902DF'
            const secondaryColor = brandingData.secondaryColor || '#8B5CF6'
            const primaryHsl = hexToHsl(primaryColor)
            const secondaryHsl = hexToHsl(secondaryColor)

            document.documentElement.style.setProperty('--brand-primary', primaryHsl)
            document.documentElement.style.setProperty('--brand-secondary', secondaryHsl)
            document.documentElement.style.setProperty('--primary', primaryHsl)
            document.documentElement.style.setProperty('--secondary', secondaryHsl)

            const iconFilter = calculateIconFilter(primaryColor)
            document.documentElement.style.setProperty('--icon-filter', iconFilter)
          } catch (error) { }
        }
      } catch (error) { }
    }

    // Listen for branding updates
    const handleBrandingUpdate = (event) => {
      const updatedBranding = event.detail
      if (updatedBranding) {
        setAgencyBranding(updatedBranding)
        if (isCustom) {
          try {
            const primaryColor = updatedBranding.primaryColor || '#7902DF'
            const primaryHsl = hexToHsl(primaryColor)
            document.documentElement.style.setProperty('--brand-primary', primaryHsl)
            const iconFilter = calculateIconFilter(primaryColor)
            document.documentElement.style.setProperty('--icon-filter', iconFilter)
          } catch (error) { }
        }
      }
    }

    window.addEventListener('agencyBrandingUpdated', handleBrandingUpdate)

    return () => {
      window.removeEventListener('agencyBrandingUpdated', handleBrandingUpdate)
    }
  }, [])

  //code for scroll ofset
  useEffect(() => {
    getUniquesColumn()
    getAvailabePhoneNumbers()
    let loc = getLocalLocation()
    ////// //console.log;
    setCountryCode(loc)
    ////////console.log
    const handleScroll = () => {
      ////console.log
      if (containerRef.current) {
        setScrollOffset({
          scrollTop: containerRef.current.scrollTop,
          scrollLeft: containerRef.current.scrollLeft,
        })
      } else {
        ////////console.log
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

  //check if need to show the save btn or not
  useEffect(() => {
    ////// //console.log;
    ////// //console.log;
    ////console.log
    if (
      oldGreetingTagInput !== greetingTagInput ||
      OldScriptTagInput !== scriptTagInput
    ) {
      //console.log;
      //console.log

      ////console.log
      setShowSaveChangesBtn(true)
    } else {
      ////console.log
      setShowSaveChangesBtn(false)
    }
  }, [greetingTagInput, scriptTagInput]) //scriptTagInput

  useEffect(() => {
    if (objective !== oldObjective) {
      setShowObjectionsSaveBtn(true)
    } else {
      setShowObjectionsSaveBtn(false)
    }
  }, [objective])

  //fetch local data after 500ms
  const checkUser = async () => {
    // await getProfileDetails();
    attempts++
    // console.log(`Trying to get user - try no ${attempts}`);

    const data = localStorage.getItem('User')
    let userData = null
    if (data) {
      // console.log(`User found on try ${attempts}`);
      // console.log("user data for showing max agents is", JSON.parse(data))
      setUser(JSON.parse(data))
    } else if (attempts < maxAttempts) {
      // console.log(`User not found on try ${attempts}, retrying in 500ms...`);
      setTimeout(checkUser, 500) // retry after 500ms
    } else {
      console.warn(`User not found in localStorage after ${attempts} attempts.`)
    }
  }

  //function for numbers width
  const numberDropDownWidth = (agName) => {
    if (
      showDrawerSelectedAgent?.agentType === 'outbound' ||
      showDrawerSelectedAgent?.name === agName ||
      !agName
    ) {
      return '100%'
    }
  }

  // console.log('user?.plan?.price', user)

  // function findLLMModel(value) {
  //   let model = null;
  //   for (const m of models) {
  //     if (m.model == value) {
  //       model = m;
  //     }
  //   }
  //   // console.log("Selected model:", model);
  //   if (model === null) {
  //     return models[0]; // Default to the first model if not found
  //   }

  //   return model;
  // }


  /**
   * Renders the live call transfer number section with appropriate upgrade/request feature modals
   * @param {Object} params - Function parameters
   * @param {Object} params.reduxUser - The current user from Redux store
   * @param {Function} params.setReduxUser - Function to update Redux user state
   * @param {Object} params.showDrawerSelectedAgent - The selected agent object
   * @param {Function} params.setShowEditNumberPopup - Function to show edit number popup
   * @param {Function} params.setSelectedNumber - Function to set selected number type
   * @returns {JSX.Element} The rendered component
   */
  function renderLiveCallTransferSection({
    reduxUser,
    setReduxUser,
    showDrawerSelectedAgent,
    setShowEditNumberPopup,
    setSelectedNumber,
  }) {
    // Use backend-provided flags
    const planCapabilities = reduxUser?.planCapabilities || {}
    const shouldShowUpgrade = planCapabilities.shouldShowAllowLiveTransferUpgrade === true
    const shouldShowRequestFeature = planCapabilities.shouldShowLiveTransferRequestFeature === true

    if (shouldShowUpgrade || shouldShowRequestFeature) {
      return (
        <UpgradeTagWithModal
          reduxUser={reduxUser}
          setReduxUser={setReduxUser}
          requestFeature={shouldShowRequestFeature}
        />
      )
    }

    // Show live transfer number and edit button if feature is enabled
    // Note: This function has access to isCustomDomain and agencyBranding from parent scope
    return (
      <div className="flex flex-row items-center justify-between gap-2">
        <div>
          {showDrawerSelectedAgent?.liveTransferNumber ? (
            <div>{showDrawerSelectedAgent?.liveTransferNumber}</div>
          ) : (
            '-'
          )}
        </div>
        <button
          onClick={() => {
            setShowEditNumberPopup(showDrawerSelectedAgent?.liveTransferNumber)
            setSelectedNumber('Calltransfer')
          }}
        >
          {renderBrandedIcon('/svgIcons/editIcon2.svg', 24, 24)}
        </button>
      </div>
    )
  }

  //function for image selection on dashboard
  const handleImageChange = async (event) => {
    const file = event.target.files[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setSelectedImage(imageUrl)
    }

    //console.log;
    if (file) {
      //console.log;
      try {
        // Compression options
        //console.log;
        const options = {
          maxSizeMB: 1, // Maximum size in MB
          maxWidthOrHeight: 1920, // Max width/height
          useWebWorker: true, // Use web workers for better performance
        }
        //console.log;
        // Compress the image
        const compressedFile = file //await imageCompression(file, options);
        //console.log;
        //console.log;
        // Set the compressed image
        setSelectedImage2(compressedFile)
        updateAgentProfile(compressedFile)
      } catch (error) {
        //console.log;
      }
    }

    return () => clearTimeout(timer)
  }

  const handleDrop = async (event) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files[0]

    ////// //console.log;

    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file)
      setSelectedImage(imageUrl)
    }

    if (file) {
      try {
        // Compression options
        const options = {
          maxSizeMB: 1, // Maximum size in MB
          maxWidthOrHeight: 1920, // Max width/height
          useWebWorker: true, // Use web workers for better performance
        }

        // Compress the image
        const compressedFile = await imageCompression(file, options)
        ////// //console.log;
        // Set the compressed image
        setSelectedImage2(compressedFile)
        updateAgentProfile(compressedFile)
      } catch (error) {
        ////// console.error("Error while compressing the image:", error);
      }
    }

    // const timer = setTimeout(() => {
    //   updateAgentProfile()
    // }, 100);

    return () => clearTimeout(timer)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  //function to update agent profile image
  const updateAgentProfile = async (image) => {
    try {
      // console.log("Trigered update api");
      setGlobalLoader(true)

      const LocalData = localStorage.getItem('User')

      let AuthToken = null

      if (LocalData) {
        const userData = JSON.parse(LocalData)
        //// //console.log;
        AuthToken = userData.token
      }

      const ApiPath = Apis.updateAgentImg

      const formData = new FormData()

      formData.append('media', image)
      formData.append('agentId', showDrawerSelectedAgent?.id)

      // console.log('showDrawerSelectedAgent', showDrawerSelectedAgent)

      for (let [key, value] of formData.entries()) {
        // console.log(key, value)
      }

      //// //console.log;

      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
        },
      })

      if (response) {
        // console.log("response of update image is", response.data)

        if (response.data.status === true) {
          const localAgentsList = localStorage.getItem(
            PersistanceKeys.LocalStoredAgentsListMain,
          )

          if (localAgentsList) {
            const agentsList = JSON.parse(localAgentsList)
            // agentsListDetails = agentsList;

            const updateAgentData = response.data.data

            //// //console.log;

            // const updatedArray = agentsList.map((localItem) => {
            //   const apiItem =
            //     updateAgentData.id === localItem.id ? updateAgentData : null;

            //   return apiItem ? { ...localItem, ...apiItem } : localItem;
            // });

            const updatedArray = agentsList.map((localItem) => {
              // Check if there's a match with the agent's id
              if (updateAgentData.mainAgentId === localItem.id) {
                // Update sub-agents
                const updatedSubAgents = localItem.agents.map((subAgent) => {
                  // Check if the sub-agent id matches the updateAgentData.id (or another relevant sub-agent id)
                  return updateAgentData.id === subAgent.id
                    ? { ...subAgent, ...updateAgentData } // Update the matching sub-agent
                    : subAgent // Leave the others unchanged
                })

                //// //console.log;

                // Return the updated agent with the updated subAgents
                return { ...localItem, agents: updatedSubAgents }
              }

              // If no match for the agent, return the original item
              return localItem
            })

            //// //console.log;
            localStorage.setItem(
              PersistanceKeys.LocalStoredAgentsListMain,
              JSON.stringify(updatedArray),
            )
            setMainAgentsList(updatedArray)
            // agentsListDetails = updatedArray
          }
        } else if (response.data.status === false) {
          //// //console.log;
        }
      }
    } catch (error) {
      // console.log("Error occured in api is", error);
      setGlobalLoader(false)
    } finally {
      setGlobalLoader(false)
    }
  }

  //function to open drawer
  const handleShowDrawer = (item) => {
    //console.log;
    // return
    // console.log("Agent  item", item);

    if (item.Calendar) {
      // console.log("Agent has calendaer in item");
    } else {
      // console.log("Agent donot have calendar in the item");
    }

    setAssignNumber(item?.phoneNumber)
    const matchedVoice = voicesList.find(
      (voice) => voice.voice_id === item?.voiceId,
    )

    setSelectedVoice(matchedVoice?.name || item?.voiceId) // ✅ use name if found by ID, otherwise fallback to voice name

    // setSelectedVoice(item?.voiceId);

    let v =
      item.agentLanguage === 'English' || item.agentLanguage === 'Multilingual'
        ? 'en'
        : 'es'
    // console.log("v", v);
    let voices = []

    voices = voicesList.filter((voice) => voice.langualge === v)

    // console.log("filtered voices are", voices);
    setFilteredVoices(voices)
    setCallRecordingPermition(item.consentRecording)
    setVoiceExpressiveness(item.voiceStability)
    setStartingPace(item.talkingPace)
    //console.log;
    setPatienceValue(item.responseSpeed)
    setLanguageValue(item?.agentLanguage ? item.agentLanguage : '')

    let modelValue = item.agentLLmModel
    if (modelValue) {
      let model = findLLMModel(modelValue)

      // console.log("Selected model 2:", model);
      setSelectedGptManu(model)
    }

    let comparedAgent = []

    // console.log('search before', search)
    comparedAgent = mainAgentsList.find((mainAgent) => {
      // console.log("Main agent list is", mainAgent);
      return mainAgent.agents.some((subAgent) => subAgent.id === item.id)
    })
    // if (!search) {
    // } else {
    //   console.log('agentsListSeparated', agentsListSeparated)
    //   comparedAgent = agentsListSeparated.find((mainAgent) => {
    //     // console.log("seperated agent list is", mainAgent);
    //     return mainAgent.id === item.id
    //   })
    // }

    console.log("comparedAgent is", comparedAgent);

    setCalendarDetails(comparedAgent)

    ////console.log
    setShowDrawerSelectedAgent(item)
    setSelectedImage(item?.thumb_profile_image)
    //// //console.log;
    if (item.agentType === 'inbound') {
      setShowReassignBtn(true)
      setShowGlobalBtn(false)
      // if(item.claimedBy.name !== showDrawer.name){
      //   setShowReassignBtnWidth(true)
      // }
    } else if (item.agentType === 'outbound') {
      setShowReassignBtn(false)
      // For subaccounts, only show global button if agency global number exists
      if (reduxUser?.userRole === 'AgencySubAccount') {
        const globalNumber = getGlobalPhoneNumber(reduxUser)
        setShowGlobalBtn(globalNumber !== null)
      } else {
        setShowGlobalBtn(true)
      }
    }
  }

  //function to format the name of agent
  const formatName = (item) => {
    let agentName = null

    if (item?.name?.length > 15) {
      agentName = item?.name?.slice(0, 15) + '...'
    } else {
      agentName = item?.name
    }
    return (
      <div>
        {agentName?.slice(0, 1).toUpperCase(0)}
        {agentName?.slice(1)}
      </div>
    )
  }

  //function to close script modal
  const handleCloseScriptModal = () => {
    setShowScriptModal(null)
    setShowScript(false)
    setSeledtedScriptKYC(false)
    setSeledtedScriptAdvanceSetting(false)
    setSeledtedScriptKYC(false)
    setSeledtedScriptAdvanceSetting(false)
    localStorage.removeItem('ObjectionsList')
    localStorage.removeItem('GuadrailsList')
  }

  //function to select the number to assign to the user
  const handleAssignNumberChange = (event) => {
    setAssignNumber(event.target.value)
  }

  // const formatPhoneNumber = (rawNumber) => {
  //   if (rawNumber) {
  //     const phoneNumber = parsePhoneNumberFromString(
  //       rawNumber?.startsWith("+") ? rawNumber : `+${rawNumber}`
  //     );
  //     // ////console.log;
  //     return phoneNumber
  //       ? phoneNumber.formatInternational()
  //       : "No phone number";
  //   } else {
  //     return "No phone number";
  //   }
  // };

  //fucntion for assigning the number
  const handleCloseClaimPopup = () => {
    setShowClaimPopup(false)
  }

  //function to finad number
  //function to fine numbers api
  const handleFindeNumbers = async (number) => {
    try {
      setFindeNumberLoader(true)
      const ApiPath = `${Apis.findPhoneNumber}?areaCode=${number}`
      let AuthToken = null
      const LocalData = localStorage.getItem('User')
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData)
        AuthToken = UserDetails.token
      }

      ////console.log;
      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        ////console.log;
        if (response.data.status === true) {
          setFoundeNumbers(response.data.data)
        }
      }
    } catch (error) {
      // console.error("Error occured in finde number api is :---", error);
    } finally {
      setFindeNumberLoader(false)
    }
  }

  //code for reassigning the number api
  const handleReassignNumber = async (item) => {
    try {
      //// //console.log;
      // return;
      setReassignLoader(item)
      let AuthToken = null
      const LocalData = localStorage.getItem('User')
      const agentDetails = localStorage.getItem('agentDetails')
      let MyAgentData = null
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData)
        AuthToken = UserDetails.token
      }

      if (agentDetails) {
        ////console.log
        const agentData = JSON.parse(agentDetails)
        ////console.log;
        MyAgentData = agentData
      }

      const ApiPath = Apis.reassignNumber

      const ApiData = {
        agentId: item.claimedBy.id,
        phoneNumber: item.phoneNumber,
        newAgentId: showDrawerSelectedAgent.id,
      }
      ////console.log

      //// //console.log;
      ////console.log;
      ////console.log;

      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        getAvailabePhoneNumbers()
        //// //console.log;
        if (response.data.status === true) {
          setAssignNumber(item.phoneNumber)
          setShowSuccessSnack(`Phone number assigned`)
        } else if (response.data.status === false) {
          setShowSuccessSnack(response.data.message)
        }
        setIsVisibleSnack(true)
        // AssignNumber()
        // setShowClaimPopup(null);
        setAssignNumber(item.phoneNumber.slice(1))
        setOpenCalimNumDropDown(false)
        setShowDrawerSelectedAgent((prev) => {
          return { ...prev, phoneNumber: item.phoneNumber }
        })

        const localAgentsList = localStorage.getItem(
          PersistanceKeys.LocalStoredAgentsListMain,
        )

        if (localAgentsList) {
          const mainAgentsList = JSON.parse(localAgentsList)
          let mainAgents = [] //Main agents not subagents list

          for (let mainAgent of mainAgentsList) {
            let subAgents = mainAgent.agents
            let newAgents = []
            for (let ag of subAgents) {
              if (ag.phoneNumber == item.phoneNumber) {
                if (ag.agentType == 'inbound') {
                  ag.phoneNumber = ''
                  //// //console.log;
                }
              } else {
                if (ag.id == showDrawerSelectedAgent.id) {
                  ag.phoneNumber = item.phoneNumber
                  //// //console.log;
                }
              }
              newAgents.push(ag)
            }
            mainAgent.agents = newAgents
            mainAgents.push(mainAgent)
          }
          setMainAgentsList(mainAgents)
          localStorage.setItem(
            PersistanceKeys.LocalStoredAgentsListMain,
            JSON.stringify(mainAgents),
          )
        }
        setShowConfirmationModal(null)
        // setShowDrawer(null);

        //code to close the dropdown
        if (selectRef.current) {
          selectRef.current.blur() // Triggers dropdown close
        }
        return

        // Update the agent's phone number and ensure no other agents have the same phone number
        //// //console.log;
        let agents = []
        let mainAgents = [] //Main agents not subagents list

        for (let ag of agentsListSeparated) {
          if (ag.phoneNumber == item.phoneNumber) {
            if (ag.agentType == 'inbound') {
              ag.phoneNumber = ''
              //// //console.log;
            }
          } else {
            if (ag.id == showDrawerSelectedAgent.id) {
              ag.phoneNumber = item.phoneNumber
              //// //console.log;
            }
          }
          agents.push(ag)
        }
        //// //console.log;
        setAgentsListSeparated(agents)
        localStorage.setItem(
          PersistanceKeys.LocalStoredAgentsListMain,
          JSON.stringify(agents),
        )

        //// //console.log;
      }
    } catch (error) {
      //// console.error("Error occured in reassign the number api:", error);
    } finally {
      setReassignLoader(null)
      ////console.log
    }
  }

  //function to purchse number
  const handlePurchaseNumber = async () => {
    try {
      setPurchaseLoader(true)
      let AuthToken = null
      const LocalData = localStorage.getItem('User')
      const agentDetails = localStorage.getItem('agentDetails')
      let MyAgentData = null
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData)
        AuthToken = UserDetails.token
      }

      ////console.log;

      if (agentDetails) {
        ////console.log
        const agentData = JSON.parse(agentDetails)
        ////console.log;
        MyAgentData = agentData
      }

      const ApiPath = Apis.purchaseNumber
      ////console.log;
      // ////console.log;
      const formData = new FormData()
      formData.append('phoneNumber', selectedPurchasedNumber.phoneNumber)
      // formData.append("phoneNumber", "+16505403715");
      // formData.append("callbackNumber", "+16505403715");
      formData.append('mainAgentId', MyAgentData.id)

      for (let [key, value] of formData.entries()) {
        ////console.log;
      }

      // localStorage.setItem("purchasedNumberDetails", JSON.stringify(response.data.data));
      // setOpenPurchaseSuccessModal(true);
      // setAssignNumber(selectedPurchasedNumber.phoneNumber);
      // setPreviousNumber([...previousNumber, selectedPurchasedNumber]);
      // setShowClaimPopup(false);
      // setOpenCalimNumDropDown(false);

      // return

      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'multipart/form-data',
          // "Content-Type": "application/json"
        },
      })

      if (response) {
        ////console.log;
        if (response.data.status === true) {
          localStorage.setItem(
            'purchasedNumberDetails',
            JSON.stringify(response.data.data),
          )
          setOpenPurchaseSuccessModal(true)
          // handleContinue();
          setAssignNumber(selectedPurchasedNumber.phoneNumber)
          setPreviousNumber([...previousNumber, selectedPurchasedNumber])
          setShowClaimPopup(false)
          setOpenCalimNumDropDown(false)
        }
      }
    } catch (error) {
      //// console.error("Error occured in purchase number api is: --", error);
    } finally {
      setPurchaseLoader(false)
    }
  }

  //function to select the number to purchase
  const handlePurchaseNumberClick = (item, index) => {
    ////console.log;
    setSelectedPurchasedNumber((prevId) => (prevId === item ? null : item))
    setSelectedPurchasedIndex((prevId) => (prevId === index ? null : index))
  }

  //code to get the user previous numbers
  const getAvailabePhoneNumbers = async () => {
    try {
      let AuthToken = null

      // const agentDetails = localStorage.getItem("agentDetails");
      const LocalData = localStorage.getItem('User')
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData)
        AuthToken = UserDetails.token
      }
      ////console.log;
      const ApiPath = Apis.userAvailablePhoneNumber
      ////console.log;

      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
        },
      })

      if (response) {
        // //console.log;
        ////// //console.log;
        setPreviousNumber(response.data.data)
      }
    } catch (error) {
      //// console.error("Error occured in: ", error);
    } finally {
      ////console.log
    }
  }

  //code for update agent api
  const handleRenameAgent = async () => {
    try {
      setRenameAgentLoader(true)

      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const Data = JSON.parse(localData)
        AuthToken = Data.token

        const ApiPath = Apis.updateSubAgent

        let apidata = {
          agentId: selectedRenameAgent.id,
          name: renameAgent, //selectedRenameAgent?.name,
        }
        // console.log("Selected agent ", showDrawerSelectedAgent);
        // console.log("data sending in api is", apidata);
        // return
        const response = await axios.post(ApiPath, apidata, {
          headers: {
            Authorization: 'Bearer ' + AuthToken,
          },
        })

        if (response) {
          setShowRenameAgentPopup(false)
          // console.log("Response of api is", response);
          // //console.log;
          setShowSuccessSnack(
            `${fromatMessageName(selectedRenameAgent.name)} updated`,
          )
          if (response.data.status === true) {
            setIsVisibleSnack(true)

            const localAgentsList = localStorage.getItem(
              PersistanceKeys.LocalStoredAgentsListMain,
            )

            if (showDrawerSelectedAgent) {
              const updateAgentData = response.data.data

              const matchedAgent = updateAgentData.agents.find(
                (localItem) => localItem.id === showDrawerSelectedAgent.id,
              )

              if (matchedAgent) {
                setShowDrawerSelectedAgent(matchedAgent)
                // console.log("Matched Agent Stored:"); //, matchedAgent
              } else {
                // console.log("No matching agent found.");
              }
            }

            if (localAgentsList) {
              const agentsList = JSON.parse(localAgentsList)
              // agentsListDetails = agentsList;

              const updateAgentData = response.data.data

              // showDrawerSelectedAgent();

              const updatedArray = agentsList.map((localItem) => {
                const apiItem =
                  updateAgentData.id === localItem.id ? updateAgentData : null

                return apiItem ? { ...localItem, ...apiItem } : localItem
              })
              // let updatedSubAgent = null

              //// //console.log;
              localStorage.setItem(
                PersistanceKeys.LocalStoredAgentsListMain,
                JSON.stringify(updatedArray),
              )
              setMainAgentsList(updatedArray)
              // agentsListDetails = updatedArray
            }
            // setShowDrawer(null);
          }
        }
      }
    } catch (error) {
      //// console.error("Error occured in api is", error);
      setRenameAgentLoader(false)
    } finally {
      ////console.log;
      setRenameAgentLoader(false)
    }
  }

  const updateAgent = async (voiceId) => {
    //console.log;
    // return
    try {
      // return
      setUpdateAgentLoader(true)
      // setGlobalLoader(true);
      // getAgents()
      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const Data = JSON.parse(localData)
        ////////console.log;
        AuthToken = Data.token
      }

      const ApiPath = Apis.updateAgent

      const formData = new FormData()

      //console.log;
      // return;
      if (showDrawerSelectedAgent) {
        if (showDrawerSelectedAgent.agentType === 'inbound') {
          ////console.log;
          formData.append('inboundGreeting', greetingTagInput)
          formData.append('inboundPrompt', scriptTagInput)
          formData.append('inboundObjective', objective)
        } else {
          formData.append('prompt', scriptTagInput)
          formData.append('greeting', greetingTagInput)
          formData.append('outboundObjective', objective)
        }
        formData.append('mainAgentId', showDrawerSelectedAgent.mainAgentId)
      } else if (showScriptModal) {
        if (showScriptModal.agentType === 'inbound') {
          ////console.log;
          formData.append('inboundGreeting', greetingTagInput)
          formData.append('inboundPrompt', scriptTagInput)
          formData.append('inboundObjective', objective)
        } else {
          formData.append('prompt', scriptTagInput)
          formData.append('greeting', greetingTagInput)
          formData.append('outboundObjective', objective)
        }
        formData.append('mainAgentId', showScriptModal.mainAgentId)
      }

      if (voiceId) {
        formData.append('voiceId', voiceId)
      }

      for (let [key, value] of formData.entries()) {
        // console.log(`agnet key ${key} and value ${value}`);
      }

      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
        },
      })

      if (response) {
        setShowSuccessSnack(
          `${fromatMessageName(
            showDrawerSelectedAgent
              ? showDrawerSelectedAgent.name
              : showScriptModal.name,
          )} updated`,
        )
        if (response.data.status === true) {
          setIsVisibleSnack(true)
          // console.log("Here status true");
          const localAgentsList = localStorage.getItem(
            PersistanceKeys.LocalStoredAgentsListMain,
          )

          let agentsListDetails = []

          if (localAgentsList) {
            // console.log("local agents List");
            const agentsList = JSON.parse(localAgentsList)
            // agentsListDetails = agentsList;

            const updateAgentData = response.data.data
            // console.log(
            //   `Agent updated data ${updateAgentData.agents.length
            //   } ${!showScriptModal}`,
            //   updateAgentData
            // );

            const updatedArray = agentsList.map((localItem) => {
              const apiItem =
                updateAgentData.id === localItem.id ? updateAgentData : null

              return apiItem ? { ...localItem, ...apiItem } : localItem
            })
            // let updatedSubAgent = null
            if (showDrawerSelectedAgent) {
              if (updateAgentData.agents.length > 0) {
                // console.log("Updated showDrawerAgent");
                if (
                  updateAgentData.agents[0].id == showDrawerSelectedAgent.id
                ) {
                  // console.log("Updated showDrawerAgent first subagent");
                  setShowDrawerSelectedAgent(updateAgentData.agents[0])
                } else if (updateAgentData.agents.length > 1) {
                  if (
                    updateAgentData.agents[1].id == showDrawerSelectedAgent.id
                  ) {
                    // console.log("Updated showDrawerAgent second subagent");
                    setShowDrawerSelectedAgent(updateAgentData.agents[1])
                  }
                }
              }
            } else if (showScriptModal) {
              if (updateAgentData.agents.length > 0) {
                // console.log("Updated showScriptModal");
                if (updateAgentData.agents[0].id == showScriptModal.id) {
                  // console.log("Updated showScriptModal first subagent");
                  setShowScriptModal(updateAgentData.agents[0])
                } else if (updateAgentData.agents.length > 1) {
                  if (updateAgentData.agents[1].id == showScriptModal.id) {
                    // console.log("Updated showScriptModal second subagent");
                    setShowScriptModal(updateAgentData.agents[1])
                  }
                }
              }
            }

            //// //console.log;
            localStorage.setItem(
              PersistanceKeys.LocalStoredAgentsListMain,
              JSON.stringify(updatedArray),
            )
            setMainAgentsList(updatedArray)
            // agentsListDetails = updatedArray
          } else {
            // console.log("No local agents list");
          }

          // setShowDrawer(null);
        }
      }
    } catch (error) {
      console.error('Error occured in api is', error)
      setGlobalLoader(false)
    } finally {
      //console.log;
      setUpdateAgentLoader(false)
      setGlobalLoader(false)
    }
  }

  const updateSubAgent = async (voiceData = null, model = null) => {
    // console.log(
    //   "Updating sub agent with voiceData:",
    //   voiceData,
    //   "and model:",
    //   model
    // );

    // return
    try {
      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const Data = JSON.parse(localData)
        AuthToken = Data.token

        const ApiPath = Apis.updateSubAgent
        console.log("ApiPath for update sub agent live transfer number is", ApiPath);

        let formData = new FormData()
        formData.append('agentId', showDrawerSelectedAgent.id)

        if (voiceData) {
          if (voiceData.voiceExpressiveness) {
            formData.append('voiceStability', voiceData.voiceExpressiveness)
          }
          if (voiceData.agentLanguage) {
            formData.append('agentLanguage', voiceData.agentLanguage)
          }
          if (voiceData.talkingPace) {
            formData.append('talkingPace', voiceData.talkingPace)
          }
          if (voiceData.responseSpeed) {
            formData.append('responseSpeed', voiceData.responseSpeed)
          }
          if (voiceData.callRecordingPermition) {
            formData.append(
              'consentRecordings',
              voiceData.callRecordingPermition,
            )
          }

          if (
            voiceData.liveTransferNumber ||
            voiceData.liveTransferNumber !== undefined
          ) {
            formData.append('liveTransferNumber', voiceData.liveTransferNumber)
          }
          if (voiceData.liveTransferMessage !== undefined) {
            formData.append(
              'liveTransferMessage',
              voiceData.liveTransferMessage,
            )
          }
          if (
            voiceData.callbackNumber ||
            voiceData.callbackNumber !== undefined
          ) {
            formData.append('callbackNumber', voiceData.callbackNumber)
          }
        }

        // if (showDrawerSelectedAgent) {
        //   formData.append("mainAgentId", showDrawerSelectedAgent.mainAgentId);
        // }

        if (model) {
          formData.append('agentLLmModel', model)
        }

        // Advanced settings
        if (voiceData?.maxDurationSeconds !== undefined) {
          formData.append('maxDurationSeconds', voiceData.maxDurationSeconds)
        }
        if (voiceData?.idleTimeoutSeconds !== undefined) {
          formData.append('idleTimeoutSeconds', voiceData.idleTimeoutSeconds)
        }
        if (voiceData?.idleMessage !== undefined) {
          formData.append('idleMessage', voiceData.idleMessage)
        }
        if (voiceData?.additionalSettings !== undefined) {
          formData.append(
            'additionalSettings',
            typeof voiceData.additionalSettings === 'string'
              ? voiceData.additionalSettings
              : JSON.stringify(voiceData.additionalSettings),
          )
        }

        // console.log("Data to update");
        for (let [key, value] of formData.entries()) {
          console.log(`test data passed is ${key}: ${value}`);
        }

        // return
        const response = await axios.post(ApiPath, formData, {
          headers: {
            Authorization: 'Bearer ' + AuthToken,
          },
        })

        if (response) {
          // setShowRenameAgentPopup(false);
          // console.log(
          //   "Response of update sub agent api is :--",
          //   response.data.data
          // );
          console.log("Response o update live transfer number is", response.data.data);
          if (voiceData?.maxDurationSeconds || voiceData?.idleTimeoutSeconds || voiceData?.idleMessage || voiceData?.additionalSettings) {
            setShowSuccessSnack("Advanced Settings Updated");
          } else {
            setShowSuccessSnack(
              `${fromatMessageName(
                showDrawerSelectedAgent ? showDrawerSelectedAgent.name : 'Agent',
              )} updated`,
            )
          }
          if (response.data.status === true) {
            setIsVisibleSnack(true)
            let agent = response.data.data
            if (agent.agents[0].id == showDrawerSelectedAgent.id) {
              setShowDrawerSelectedAgent(agent.agents[0])
            } else if (agent.agents.length > 1) {
              if (agent.agents[1].id == showDrawerSelectedAgent.id) {
                setShowDrawerSelectedAgent(agent.agents[1])
              }
            }

            const localAgentsList = localStorage.getItem(
              PersistanceKeys.LocalStoredAgentsListMain,
            )

            if (localAgentsList) {
              const agentsList = JSON.parse(localAgentsList)
              // agentsListDetails = agentsList;

              const updateAgentData = response.data.data

              const updatedArray = agentsList.map((localItem) => {
                const apiItem =
                  updateAgentData.id === localItem.id ? updateAgentData : null

                return apiItem ? { ...localItem, ...apiItem } : localItem
              })
              // let updatedSubAgent = null

              //// //console.log;
              localStorage.setItem(
                PersistanceKeys.LocalStoredAgentsListMain,
                JSON.stringify(updatedArray),
              )
              setMainAgentsList(updatedArray)
              // agentsListDetails = updatedArray
            }
            // setShowDrawer(null);
          }
        }
      }
    } catch (error) {
      console.error('Error occured in update sub agent api is', error)
      setRenameAgentLoader(false)
    } finally {
      ////console.log;
      setRenameAgentLoader(false)
    }
  }

  //function for scripts modal screen change
  const handleShowScript = () => {
    setShowScript(true)
    setSeledtedScriptKYC(false)
    setSeledtedScriptAdvanceSetting(false)
  }

  // Handler for saving advanced settings
  const handleSaveAdvancedSettings = async (settings) => {
    setAdvancedSettingsLoader(true)
    try {
      await updateSubAgent({
        maxDurationSeconds: settings.maxDurationSeconds,
        idleTimeoutSeconds: settings.idleTimeoutSeconds,
        idleMessage: settings.idleMessage,
      })
      setShowAdvancedSettingsModal(false)
    } catch (error) {
      console.error('Error saving advanced settings:', error)
    } finally {
      setAdvancedSettingsLoader(false)
    }
  }

  const AssignNumber = async (phoneNumber) => {
    if (showDrawerSelectedAgent.phoneNumber == phoneNumber) {
      return
    }
    try {
      //// //console.log;

      // setGlobalLoader(true);
      // setAssignLoader(true);
      setShowPhoneLoader(true)
      let AuthToken = null
      const LocalData = localStorage.getItem('User')

      if (LocalData) {
        const UserDetails = JSON.parse(LocalData)
        AuthToken = UserDetails.token
      }

      const formData = new FormData()
      formData.append('phoneNumber', phoneNumber)
      formData.append('callbackNumber', showDrawerSelectedAgent?.callbackNumber)

      formData.append(
        'liveTransforNumber',
        showDrawerSelectedAgent?.liveTransferNumber,
      )
      formData.append('agentId', showDrawerSelectedAgent.id)

      const ApiPath = Apis.asignPhoneNumber

      for (let [key, value] of formData.entries()) {
        //// //console.log;
      }

      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
        },
      })

      // setAssignLoader(false);
      getAvailabePhoneNumbers()
      setShowPhoneLoader(false)
      if (response) {
        //console.log;
        if (response.data.status === true) {
          setAssignNumber(phoneNumber)
          setShowSuccessSnack(`Phone number assigned`)

          setShowDrawerSelectedAgent((prev) => {
            return { ...prev, phoneNumber }
          })
          setIsVisibleSnack(true)
          setShowConfirmationModal(null)

          const localAgentsList = localStorage.getItem(
            PersistanceKeys.LocalStoredAgentsListMain,
          )

          if (localAgentsList) {
            const agentsList = JSON.parse(localAgentsList)
            const updateAgentData = showDrawerSelectedAgent

            //// //console.log;
            const updatedArray = agentsList.map((localItem) => {
              if (updateAgentData.mainAgentId === localItem.id) {
                const updatedSubAgents = localItem.agents.map((subAgent) => {
                  return updateAgentData.id === subAgent.id
                    ? { ...subAgent, phoneNumber: phoneNumber }
                    : subAgent
                })

                //// //console.log;

                return { ...localItem, agents: updatedSubAgents }
              }

              return localItem
            })
            //// console.log(
            // "Updated agents list array with phone is",
            // updatedArray
            // );
            localStorage.setItem(
              PersistanceKeys.LocalStoredAgentsListMain,
              JSON.stringify(updatedArray),
            )
            setMainAgentsList(updatedArray)
            // agentsListDetails = updatedArray
          }
        } else if (response.data.status === false) {
          setShowErrorSnack(response.data.message)
          setIsVisibleSnack2(true)
        }
      }
    } catch (error) {
      //// console.error("Error occured in api is:", error);
      setShowErrorSnack(response.data.message)
      setIsVisibleSnack2(true)
      setGlobalLoader(false)
    } finally {
      ////console.log;
      setGlobalLoader(false)
    }
  }

  const handleShowKycs = () => {
    setShowScript(false)
    setSeledtedScriptKYC(true)
    setSeledtedScriptAdvanceSetting(false)
  }

  const handleShowAdvanceSeting = () => {
    setShowScript(false)
    setSeledtedScriptKYC(false)
    setSeledtedScriptAdvanceSetting(true)
  }

  //function to show the objection and guadrails
  const handleShowObjection = () => {
    setShowObjection(true)
    setShowGuardrails(false)
    setShowObjectives(false)
  }

  const handleShowGuardrails = () => {
    setShowObjection(false)
    setShowGuardrails(true)
    setShowObjectives(false)
  }

  const handleShowObjectives = () => {
    setShowObjectives(true)
    setShowObjection(false)
    setShowGuardrails(false)
  }

  const handleGptManuSelect = async (model) => {
    if (!model.disabled) {
      setSelectedGptManu(model)
    }

    setShowModelLoader(true)
    await updateSubAgent(null, model.value)
    setShowModelLoader(false)
    setOpenGptManu(null)
  }

  //function ot compare the selected agent wiith the main agents list
  const matchingAgent = (agent) => {
    //// //console.log;
    const agentData = mainAgentsList.filter((prevAgent) => {
      //// //console.log;
      if (prevAgent.id === agent.mainAgentId) {
        return true
      } else {
        return false
      }
    })
    //// //console.log;
    if (
      typeof agentData == undefined ||
      agentData == null ||
      agentData.length === 0
    ) {
      return
    }
    // console.log("Matching agent data:", agentData);
    setKYCList(agentData[0].kyc)

    ////console.log;
    //// //console.log;
    setMainAgentId(agentData[0].id)
    let firstAgent = agentData[0]
    //// //console.log;
    setUserPipeline(firstAgent.pipeline)
    // if (
    //   firstAgent.agents?.length === 2

    // ) {
    //   if(firstAgent.agents[0].agentType === "outbound"){
    //     setUserPipeline(firstAgent.pipeline);
    //   }

    //   // setOldGreetingTagInput(firstAgent.greeting);
    //   // setGreetingTagInput(firstAgent.greeting);
    //   // setScriptTagInput(firstAgent.callScript);
    //   // setOldScriptTagInput(firstAgent.callScript);
    // } else if (firstAgent.agents[0].agentType === "inbound") {
    //   setUserPipeline(firstAgent.pipeline);
    //   // setGreetingTagInput(agentData[0].inboundGreeting);
    //   // setOldGreetingTagInput(agentData[0].inboundGreeting);
    //   // setScriptTagInput(agentData[0].inboundScript);
    //   // setOldScriptTagInput(agentData[0].inboundScript);
    // }

    // setGreetingTagInput(agentData[0].greeting);
    // // setOldGreetingTagInput(agentData[0].greeting);
    // setScriptTagInput(agentData[0].callScript);
  }

  //code for getting uniqueCcolumns
  const getUniquesColumn = async () => {
    try {
      // setColumnloader(true);
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        // setUser(UserDetails);
        AuthToken = UserDetails.token
      }

      ////////console.log;

      const ApiPath = Apis.uniqueColumns
      ////////console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        if (response.data.status === true) {
          setUniqueColumns(response.data.data)
        }
      }
    } catch (error) {
      //// console.error("Error occured in getColumn is :", error);
    } finally {
      // setColumnloader(false)
    }
  }

  ///code to show more unique columns
  const handleShowUniqueCols = () => {
    setShowMoreUniqueColumns(!showMoreUniqueColumns)
  }

  //function to handle input field change
  const handleInputChange = (key, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [key]: value, // Update the specific index value
    }))
  }

  //function to delete the agent
  const handleDeleteAgent = async () => {
    try {
      setDelLoader(true)
      let AuthToken = null
      const userData = localStorage.getItem('User')
      if (userData) {
        const localData = JSON.parse(userData)
        ////console.log;
        AuthToken = localData.token
      }

      const ApiData = {
        agentId: showDrawerSelectedAgent.id,
      }
      //// //console.log;

      //// //console.log;

      // return
      const ApiPath = Apis.DelAgent
      ////console.log;

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        //// //console.log;
        setAgentsListSeparated(
          agentsListSeparated.filter(
            (item) => item.id !== showDrawerSelectedAgent.id,
          ),
        )
        setAgentsList(
          agentsListSeparated.filter(
            (item) => item.id !== showDrawerSelectedAgent.id,
          ),
        )

        setIsVisibleSnack(true)
        setShowSuccessSnack(response.data.message)

        setActiveTab('Agent Info')
        setShowDrawerSelectedAgent(null)
        setDelAgentModal(false)

        //updating data on localstorage
        const localAgentsList = localStorage.getItem(
          PersistanceKeys.LocalStoredAgentsListMain,
        )
        if (localAgentsList) {
          const agentsList = JSON.parse(localAgentsList)
          // agentsListDetails = agentsList;

          const updateAgentData = showDrawerSelectedAgent

          const updatedAgentsList = agentsList.map((agentGroup) => {
            if (Array.isArray(agentGroup.agents)) {
              // Remove the agent with the matching ID from the 'agents' array
              const updatedAgents = agentGroup.agents.filter(
                (localItem) => localItem.id !== updateAgentData.id,
              )

              // Return the updated agentGroup with the modified 'agents' array
              return {
                ...agentGroup,
                agents: updatedAgents,
              }
            }
            return agentGroup // Return the item as is if 'agents' is not an array
          })

          //// //console.log;
          localStorage.setItem(
            PersistanceKeys.LocalStoredAgentsListMain,
            JSON.stringify(updatedAgentsList),
          )
          // agentsListDetails = updatedArray
        }
      }
    } catch (error) {
      //// console.error("Error occured in del agent api is:", error);
    } finally {
      setDelLoader(false)
    }
  }

  //function to call testAi Api
  const handleTestAiClick = async () => {
    try {
      setTestAIloader(true)
      let AuthToken = null
      const userData = localStorage.getItem('User')

      if (userData) {
        const localData = JSON.parse(userData)
        ////console.log;
        AuthToken = localData.token
      }

      const newArray = scriptKeys.map((key) => ({
        [key]: inputValues[key] || '', // Use the input value or empty string if not set
      }))
      ////console.log;
      ////console.log);

      const ApiData = {
        agentId: selectedAgent.id,
        name: name,
        phone: phone,
        extraColumns: newArray,
      }

      // console.log('ApiData', ApiData)

      localStorage.setItem(
        PersistanceKeys.TestAiCredentials,
        JSON.stringify(ApiData),
      )

      const ApiPath = Apis.testAI

      ////console.log);
      ////console.log);
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        ////console.log;
        setOpenTestAiModal(false)
        setShowSuccessSnack(response.data.message)
        setIsVisibleSnack(true)
        // if (response.data.status === true) {
        //   // setName("");
        //   // setPhone("");
        // }
      }
    } catch (error) {
      console.error('Error occured in test api is', error)

      // Extract error message from API response
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while testing the AI agent'

      // Display error message to user
      setShowErrorSnack(errorMessage)
      setIsVisibleSnack2(true)

      //test chanressssss

      // Only close modal if it's a non-critical error (optional)
      // setOpenTestAiModal(false)
    } finally {
      ////console.log;
      setTestAIloader(false)
    }
  }

  //function for phonenumber input
  const handlePhoneNumberChange = (phone) => {
    setPhone(phone)
    validatePhoneNumber(phone)

    if (!phone) {
      setErrorMessage('')
    }
  }

  // Function to validate phone number
  const validatePhoneNumber = (phoneNumber) => {
    // const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`);
    // parsePhoneNumberFromString(`+${phone}`, countryCode?.toUpperCase())
    const parsedNumber = parsePhoneNumberFromString(
      `+${phoneNumber}`,
      countryCode?.toUpperCase(),
    )
    // if (parsedNumber && parsedNumber.isValid() && parsedNumber.country === countryCode?.toUpperCase()) {
    if (!parsedNumber || !parsedNumber.isValid()) {
      setErrorMessage('Invalid')
    } else {
      setErrorMessage('')

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      // setCheckPhoneResponse(null);
      ////console.log
    }
  }

  useEffect(() => {
    const agentLocalDetails = localStorage.getItem(
      PersistanceKeys.LocalStoredAgentsListMain,
    )

    if (agentLocalDetails) {
      const agentData = JSON.parse(agentLocalDetails)
      //// //console.log;
      setMainAgentsList(agentData)
    } else {
      //// //console.log;
    }

    const userData = localStorage.getItem('User')

    try {
      setInitialLoader(true)
      if (userData) {
        const userLocalData = JSON.parse(userData)
        getAgents() //userLocalData
      }
    } catch (error) {
      //// console.error("Error occured is :", error);
    } finally {
      setShowPhoneLoader(false)

      setInitialLoader(false)
    }

    getCalenders()

    // Cleanup function to clear timeouts
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const handleSelectProfileImg = (index) => {
    fileInputRef.current[index]?.click()
  }

  const handleProfileImgChange = (event, index) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImages((prev) => ({
          ...prev,
          [index]: reader.result, // Set the preview URL for the specific index
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  //code to get agents
  const getAgents = async (
    paginationStatus,
    search = null,
    searchLoader = false,
  ) => {
    setPaginationLoader(true)

    // Clear previous data if it's a new search to prevent memory buildup
    if (search && searchLoader) {
      setMainAgentsList([])
      setAgentsListSeparated([])
    }

    //test code failed for saving search value

    // if (searchLoader && !search) {
    //   console.log('search clear', search)
    //   setAgentsListSeparated(allAgentsList);
    //   return
    // }

    // console.log("Pagination status passed is", paginationStatus);
    // console.log('search', search)
    try {
      const agentLocalDetails = localStorage.getItem(
        PersistanceKeys.LocalStoredAgentsListMain,
      )
      if (!agentLocalDetails || searchLoader) {
        setInitialLoader(true)
      }
      let offset = mainAgentsList.length
      let ApiPath = `${Apis.getAgents}?offset=${offset}` //?agentType=outbound

      if (search) {
        offset = 0
        ApiPath = `${Apis.getAgents}?offset=${offset}&search=${search}`
      }
      // console.log("Api path is", ApiPath);

      const Auth = AuthToken()
      ////console.log;
      // const AuthToken = userData.token;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + Auth,
          'Content-Type': 'application/json',
        },
      })

      // if (response) {
      //   //console.log;
      //   setPaginationLoader(false);
      //   let agents = response.data.data || [];
      //   console.log("Agents from api", agents);
      //   if (!search) {
      //     setAllAgentsList(agents)

      //   }
      //   setOldAgentsList(agents)
      //   if (agents.length >= 6) {
      //     setCanGetMore(true);
      //   } else {
      //     setPaginationLoader(false);
      //     setCanGetMore(false);
      //   }

      //   if (search) {
      //     setAgentsListSeparated(agents);
      //     return
      //   }

      //   let newList = [...mainAgentsList]; // makes a shallow copy
      //   if (Array.isArray(agents) && agents.length > 0) {
      //     newList.push(...agents); // append all agents at once
      //   }

      //   console.log("Agents after pushing", newList);

      //   localStorage.setItem(
      //     PersistanceKeys.LocalStoredAgentsListMain,
      //     JSON.stringify(newList)
      //   );

      //   setMainAgentsList(newList);
      // }

      if (response) {
        //console.log;
        setPaginationLoader(false)
        let agents = response.data.data || []
        // console.log("Agents from api", agents);
        setOldAgentsList(agents)
        if (agents.length >= 6) {
          setCanGetMore(true)
        } else {
          setPaginationLoader(false)
          setCanGetMore(false)
        }

        if (search) {
          let subAgents = []
          agents.forEach((item) => {
            if (item.agents && item.agents.length > 0) {
              for (let i = 0; i < item.agents.length; i++) {
                const agent = item.agents[i]
                if (agent) {
                  subAgents.push(agent)
                }
              }
            }
          })

          setAgentsListSeparated(agents) //subAgents

          // return
        }

        let newList = [...mainAgentsList] // makes a shallow copy

        if (Array.isArray(agents) && agents.length > 0) {
          newList.push(...agents) // append all agents at once
        }

        // console.log("Agents after pushing", newList);
        if (!search) {
          localStorage.setItem(
            PersistanceKeys.LocalStoredAgentsListMain,
            JSON.stringify(newList),
          )
        } else {
          localStorage.setItem(
            PersistanceKeys.LocalStoredAgentsListMain,
            JSON.stringify(agents),
          )
        }
        // console.log("New list is", newList);
        if (search) {
          setMainAgentsList(agents)
        } else {
          setMainAgentsList(newList)
        }
      }
    } catch (error) {
      setInitialLoader(false)
      //// console.error("Error occured in get Agents api is :", error);
    } finally {
      setInitialLoader(false)
    }
  }

  //function to add new agent by more agents popup
  const handleAddAgentByMoreAgentsPopup = () => {
    try {
      setShowMoreAgentsPopup(false)
      const data = {
        status: true,
      }
      localStorage.setItem('fromDashboard', JSON.stringify(data))

      localStorage.setItem(
        'AddAgentByPayingPerMonth',
        JSON.stringify({
          status: true,
        }),
      )
      //remove data from local storage after 2 minutes
      setTimeout(
        () => {
          localStorage.removeItem('AddAgentByPayingPerMonth')
        },
        2 * 60 * 1000,
      )

      // Use window.location.href for hard redirect to ensure page loads properly
      // This prevents navigation issues where URL changes but page doesn't render
      setTimeout(() => {
        window.location.href = '/createagent'
      }, 100)
    } catch (error) {
      console.error('Error in handleAddAgentByMoreAgentsPopup:', error)
    }
  }

  //function to add new agent - Combined Redux + localStorage logic
  const handleAddNewAgent = (event) => {

    const isFromAdminOrAgency = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency);
    if (isFromAdminOrAgency) {
      localStorage.removeItem(PersistanceKeys.isFromAdminOrAgency);
      console.log("Admin agency removed");
    } else { console.log("No admin agency"); }

    if (!isPlanActive(reduxUser?.plan)) {
      setShowErrorSnack('Your plan is paused. Activate to create agents')
      setIsVisibleSnack2(true)
      return
    }
    // return

    try {
      // event.preventDefault();
      // setShowMoreAgentsPopup(true)
      // return

      // Combined plan checking - use Redux as primary, localStorage as fallback
      // console.log('🎯 [DASHBOARD] Combined plan check for new agent');

      // Use Redux plan capabilities as primary source
      if (reduxUser?.planCapabilities) {
        // console.log('🔴 [DASHBOARD] Using Redux plan capabilities');
        if (!canCreateAgent) {
          if (isFreePlan && currentAgents >= 1) {
            // console.log('🚫 [DASHBOARD] Free plan user has reached limit');
            setShowUpgradeModal(true)
            return
          } else if (currentAgents >= maxAgents) {
            // console.log('🚫 [DASHBOARD] Paid plan user is over the allowed capabilities');
            setShowMoreAgentsPopup(true)
            setMoreAgentsPopupType('newagent')
            return
          }
        }
      } else {
        // Fallback to localStorage logic (from test branch)
        // console.log('🔶 [DASHBOARD] Fallback to localStorage plan capabilities');

        // Check if user is on free plan and has reached their limit
        if (user?.user?.plan === null || user?.user?.plan?.price === 0) {
          if (
            user?.user?.currentUsage?.maxAgents >=
            user?.user?.planCapabilities?.maxAgents
          ) {
            // console.log('Free plan user has reached limit');
            setShowUpgradeModal(true)
            return
          }
        }

        // Check if paid plan user has reached their agent limit
        if (
          user?.user?.currentUsage?.maxAgents >=
          user?.user?.planCapabilities?.maxAgents
        ) {
          // console.log('Paid plan user is over the allowed capabilities');
          setShowMoreAgentsPopup(true)
          setMoreAgentsPopupType('newagent')
          return
        }
      }

      // User can create agent - proceed to creation
      // console.log('✅ [DASHBOARD] User can create agent - proceeding to /createagent')
      const data = {
        status: true,
      }
      localStorage.setItem('fromDashboard', JSON.stringify(data))
      setTimeout(() => {
        router.push('/createagent')
      }, 0)
    } catch (error) {
      console.error('Error in handleAddNewAgent:', error)
    }
  }

  const handlePopoverOpen = (event, item) => {
    ////// //console.log;
    setActionInfoEl(event.currentTarget)
    setHoveredIndexStatus(item.status)
    setHoveredIndexAddress(item.address)
  }

  const handlePopoverClose = () => {
    setActionInfoEl(null)
    setHoveredIndexStatus(null)
    setHoveredIndexAddress(null)
  }

  const open = Boolean(actionInfoEl)

  useEffect(() => {
    let agents = []

    //// //console.log;

    const localAgentsData = localStorage.getItem(
      PersistanceKeys.LocalStoredAgentsListMain,
    )

    let localDetails = []
    if (localAgentsData) {
      localDetails = JSON.parse(localAgentsData)
    }

    localDetails.map((item, index) => {
      // Check if agents exist
      if (item.agents && item.agents?.length > 0) {
        for (let i = 0; i < item.agents?.length; i++) {
          const agent = item.agents[i]
          ////console.log;
          // Add a condition here if needed  //.agentType === 'outbound'
          if (agent) {
            agents.push(agent)
          }
        }
      } else {
        // agentsContent.push(<div key="no-agent">No agents available</div>);
      }
    })
    setAgentsListSeparated(agents)
    setAgentsList(agents)

    //console.log;
  }, [mainAgentsList])

  //code for voices droopdown
  const [SelectedVoice, setSelectedVoice] = useState('')
  const [filteredVoices, setFilteredVoices] = useState([])

  ////console.log);

  const handleChangeVoice = async (event) => {
    setShowVoiceLoader(true)
    const selectedVoice = voicesList.find(
      (voice) => voice.name === event.target.value,
    )

    if (!selectedVoice) {
      setShowVoiceLoader(false)
      return
    }

    await updateAgent(selectedVoice.name) // ✅ send name
    setSelectedVoice(selectedVoice.name) // ✅ store name now
    setShowVoiceLoader(false)

    if (showDrawerSelectedAgent.thumb_profile_image) {
      return
    } else {
      // setSelectedImage(selectedVoice.img);
      // updateAgentProfile(selectedVoice.img);
    }
  }

  //function for getitng the calenders list
  const getCalenders = async () => {
    try {
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      //// //console.log;

      const ApiPath = Apis.getCalenders

      //// //console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        //// //console.log;
        setPreviousCalenders(response.data.data)
      }
    } catch (error) {
      //// console.error("Error occured in the api is ", error);
    } finally {
      //// //console.log;
    }
  }

  //update variabels after adding calendar
  const updateAfterAddCalendar = () => {
    const agentLocalDetails = localStorage.getItem(
      PersistanceKeys.LocalStoredAgentsListMain,
    )

    if (agentLocalDetails) {
      const agentData = JSON.parse(agentLocalDetails)
      //console.log;
      getCalenders()
      setMainAgentsList(agentData)
    } else {
      //// //console.log;
    }
  }

  const shouldDuplicateAgent = async () => {
    if (reduxUser?.planCapabilities) {
      if (!canCreateAgent) {
        if (isFreePlan && currentAgents >= 1) {
          setShowUpgradeModal(true)
          setTitle('Unlock your Web Agent')
          setSubTitle(
            'Bring your AI agent to your website allowing them to engage with leads and customers',
          )
          setShowDuplicateConfirmationPopup(false)
          return
        } else if (currentAgents >= maxAgents) {
          setShowMoreAgentsPopup(true)
          setMoreAgentsPopupType('duplicate')
          // setShowDuplicateConfirmationPopup(false)
          return
        }
      }
      handleDuplicate()
    } else {
      // Fallback to localStorage logic
      const user = getUserLocalData()
      if (user?.user?.planCapabilities) {
        // Check if user is on free plan and has reached their limit
        if (user?.user?.plan === null || user?.user?.plan?.price === 0) {
          if (
            user?.user?.currentUsage?.maxAgents >=
            user?.user?.planCapabilities?.maxAgents
          ) {
            setShowUpgradePlanModal(true)
            setMoreAgentsPopupType('duplicate')
            // setShowDuplicateConfirmationPopup(false)
            return
          }
        }

        // Check if paid plan user has reached their agent limit
        if (
          user?.user?.currentUsage?.maxAgents >=
          user?.user?.planCapabilities?.maxAgents
        ) {
          setShowUpgradePlanModal(true)
          setMoreAgentsPopupType('duplicate')
          // setShowDuplicateConfirmationPopup(false)
          return
        }

        handleDuplicate()
      }
    }
  }

  const handleDuplicate = async () => {
    if (!isPlanActive(reduxUser?.plan)) {
      setShowErrorSnack('Your plan is paused. Activate to duplicate agents')
      setIsVisibleSnack2(true)
      return
    }
    // duplicate agent
    setDuplicateLoader(true)
    try {
      const data = localStorage.getItem('User')

      if (data) {
        const userData = JSON.parse(data)
        const token = AuthToken()
        const ApiPath = Apis.duplicateAgent

        let apidata = {
          agentId: showDrawerSelectedAgent.id,
        }

        const response = await axios.post(ApiPath, apidata, {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        })

        if (response) {
          setDuplicateLoader(false)
          setShowDuplicateConfirmationPopup(false)

          // console.log("duplicate agent data ", response);
          if (response.data.status === true) {
            await refreshUserData()
            setMoreAgentsPopupType('')
            setShowSuccessSnack('Agent duplicated successfully')
            setIsVisibleSnack(true)
            const localAgentsList = localStorage.getItem(
              PersistanceKeys.LocalStoredAgentsListMain,
            )

            if (localAgentsList) {
              const agentsList = JSON.parse(localAgentsList)
              // agentsListDetails = agentsList;

              const updatedArray = [response.data.data, ...agentsList]
              localStorage.setItem(
                PersistanceKeys.LocalStoredAgentsListMain,
                JSON.stringify(updatedArray),
              )
              setMainAgentsList(updatedArray)
            }
          } else {
            // setmoreAgentsPopupType("")
            setShowErrorSnack(response.data.message)
            setIsVisibleSnack2(true)
          }
        }
      }
    } catch (error) {
      setDuplicateLoader(false)
      console.error('Error occured in duplicate agent api is', error)
      // setShowErrorSnack("Error occured while duplicating agent");
      const errorMessage =
        error?.response?.data?.message || error?.message || error.toString()

      console.error('Error occurred in duplicate agent API:', errorMessage)
      setShowErrorSnack(`Error: ${errorMessage}`)
      setIsVisibleSnack2(true)
    }
  }

  const handleLanguageChange = async (event) => {
    let value = event.target.value
    // console.log("selected language is", value);
    // console.log("selected voice is",SelectedVoice)

    // Combined language selection checking - Redux first, localStorage fallback
    if (value === 'Multilingual') {
      // Use Redux plan capabilities as primary source
      if (reduxUser?.agencyCapabilities?.allowLanguageSelection === false) {
        setShowUnlockPremiumFeaturesPopup(true)
        setFeatureTitle('LanguageSelection')
        return
      }
      if (reduxUser?.planCapabilities) {
        if (!isFeatureAllowed('allowLanguageSelection')) {
          // Trigger the upgrade modal from UpgradeTagWithModal
          setShowUpgradePlanModal(true)
          return
        }
      } else {
        // Fallback to localStorage logic
        if (user?.user?.planCapabilities?.allowLanguageSelection === false) {
          // Trigger the upgrade modal from UpgradeTagWithModal
          setShowUpgradePlanModal(true)
          return
        }
      }
    }

    setShowLanguageLoader(true)

    let voice = voicesList.find((voice) => voice.name === SelectedVoice)

    let selectedLanguage =
      value === 'English' || value === 'Multilingual' ? 'en' : 'es'

    // console.log("selected langualge", selectedLanguage);
    let voiceData = {}

    voiceData = {
      agentLanguage: value,
    }

    await updateSubAgent(voiceData)

    // if selected language is different from friltered voices list
    if (selectedLanguage != voice.langualge) {
      // update voice list as well
      setFilteredVoices(
        // voicesList.filter((voice) => voice.langualge === selectedLanguage)
        voicesList,
      )

      const newVoiceName = selectedLanguage === 'en' ? 'Ava' : 'Maria'
      await updateAgent(newVoiceName)

      setSelectedVoice(newVoiceName)
    }
    setShowLanguageLoader(false)
    // setSelectedVoice(event.target.value);
    setLanguageValue(value)
  }
  const styles = {
    claimPopup: {
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
    findNumberTitle: {
      fontSize: 17,
      fontWeight: '500',
    },
    findNumberDescription: {
      fontSize: 15,
      fontWeight: '500',
    },
    dropdownMenu: {
      fontSize: 15,
      fontWeight: '500',
      color: '#000000',
    },
    modalsStyle: {
      height: 'auto',
      bgcolor: 'transparent',
      p: 2,
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-50%)',
      borderRadius: '20px',
      border: 'none',
      outline: 'none',
    },
    headingStyle: {
      fontSize: 16,
      fontWeight: '700',
    },
    inputStyle: {
      fontSize: 15,
      fontWeight: '500',
      marginTop: 10,
      borderColor: '#00000020',
    },
    paragraph: {
      fontSize: 15,
      fontWeight: '500',
    },
  }

  // ////console.log

  const handleWebhookClick = () => {
    if (reduxUser?.planCapabilities?.allowEmbedAndWebAgents === false) {
      setShowUpgradeModal(true)
      setTitle('Unlock your Web Agent')
      setSubTitle(
        'Bring your AI agent to your website allowing them to engage with leads and customers',
      )
    } else {
      let agent = {
        ...selectedAgentForWebAgent,
        smartListId: selectedSmartList,
      }
      setSelectedAgentForWebAgent(agent)
      showDrawerSelectedAgent.smartListId = selectedSmartList
      let modelId =
        showDrawerSelectedAgent?.modelIdVapi ||
        selectedAgentForWebAgent?.agentUuid ||
        ''

      let url = demoBaseUrl + 'api/agent/demoAi/' + modelId
      navigator.clipboard
        .writeText(url)
        .then(() => {
          // Only show "Webhook URL Copied" for webhook agents, not for embed agents
          const message = fetureType === 'webhook' ? 'Webhook URL Copied' : 'Embed code copied'
          setShowSuccessSnack(message)
          setIsVisibleSnack(true)
          setShowWebAgentModal(false)
          setShowAllSetModal(false)
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err)
        })
    }
  }

  const handleCopy = (assistantId, baseUrl) => {
    if (reduxUser?.planCapabilities?.allowEmbedAndWebAgents === false) {
      setShowUpgradeModal(true)
      setTitle('Unlock your Web Agent')
      setSubTitle(
        'Bring your AI agent to your website allowing them to engage with leads and customers',
      )
    } else {
      const iframeCode = `<iframe src="${baseUrl}embed/support/${assistantId}" style="position: fixed; bottom: 0; right: 0; width: 320px; 
  height: 100vh; border: none; background: transparent; z-index: 
  9999; pointer-events: none;" allow="microphone" onload="this.style.pointerEvents = 'auto';">
  </iframe>`

      navigator.clipboard
        .writeText(iframeCode)
        .then(() => {
          // alert("Embed code copied to clipboard!");
          setShowSuccessSnack('Embed code copied')
          setIsVisibleSnack(true)
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err)
        })
    }
  }

  const handleDrawerClose = async () => {
    setShowDrawerSelectedAgent(null)
    setActiveTab('Agent Info')
    await getProfileDetails()
    // Sync fresh profile data to Redux after profile update
    await syncProfileToRedux()
  }

  return (
    <PermissionProvider>
      <ProtectedRoute
        permissionKey="agentx.agents.view"
        hideIfNoPermission={false}
        fallback={
          <div className="w-full flex flex-col items-center justify-center h-screen">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1rem' }}>
                Access Denied
              </h2>
              <p style={{ fontSize: '16px', color: '#666' }}>
                You do not have permission to view agents.
              </p>
            </div>
          </div>
        }
      >
        <div className="flex h-full w-full min-h-0 flex-col items-center bg-white" style={{ backgroundColor: '#ffffff', width: '100%' }}>
          {/* Success snack bar */}
          <div>
            <AgentSelectSnackMessage
              isVisible={isVisibleSnack}
              hide={() => {
                setIsVisibleSnack(false)
              }}
              type={SnackbarTypes.Success}
              message={showSuccessSnack}
            />
          </div>
          <div>
            <AgentSelectSnackMessage
              isVisible={isVisibleSnack2}
              hide={() => setIsVisibleSnack2(false)}
              message={showErrorSnack}
              type={SnackbarTypes.Error}
            />

            <AgentSelectSnackMessage
              message={showSnackMsg.message}
              type={showSnackMsg.type}
              isVisible={showSnackMsg.isVisible}
              hide={() =>
                setShowSnackMsg({ type: null, message: '', isVisible: false })
              }
            />
          </div>
          <div className="w-full flex-shrink-0">
            <StandardHeader
            titleContent={
              <div className="flex flex-row items-center gap-3">
                <TypographyH3
                  className="cursor-pointer"
                  onClick={() => {
                    router.push('/createagent')
                  }}
                >
                  Agents
                </TypographyH3>
                {reduxUser?.plan?.planId != null &&
                  reduxUser?.planCapabilities?.maxAgents < 10000000 && (
                    <div
                      style={{ fontSize: 14, fontWeight: '400', color: '#0000080' }}
                    >
                      {`${reduxUser?.currentUsage?.maxAgents}/${reduxUser?.planCapabilities?.maxAgents || 0} used`}
                    </div>
                  )}

                {reduxUser?.plan?.planId != null &&
                  reduxUser?.planCapabilities?.maxAgents < 10000000 && (
                    <Tooltip
                      title={`Additional agents are $${reduxUser?.planCapabilities?.costPerAdditionalAgent || 10}/month each.`}
                      arrow
                      componentsProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: '#ffffff', // Ensure white background
                            color: '#333', // Dark text color
                            fontSize: '14px',
                            padding: '10px 15px',
                            borderRadius: '8px',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Soft shadow
                          },
                        },
                        arrow: {
                          sx: {
                            color: '#ffffff', // Match tooltip background
                          },
                        },
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: '#000000',
                          cursor: 'pointer',
                        }}
                      >
                        <Image
                          src="/agencyIcons/InfoIcon.jpg"
                          alt="info"
                          width={16}
                          height={16}
                          className="cursor-pointer rounded-full"
                        />
                      </div>
                    </Tooltip>
                  )}
              </div>
            }
            showTasks={true}
            rightContent={
              <div className="flex flex-row items-center gap-1 flex-shrink-0 border rounded-full px-4 h-[35px]">
                <input
                  className="outline-none border-none w-full bg-transparent focus:outline-none focus:ring-0"
                  placeholder="Search an agent"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    if (canGetMore === true) {
                      setCanKeepLoading(true)
                    } else {
                      setCanKeepLoading(false)
                    }

                    // Clear existing timeout to prevent memory leaks
                    if (searchTimeoutRef.current) {
                      clearTimeout(searchTimeoutRef.current)
                    }
                    searchTimeoutRef.current = setTimeout(() => {
                      let searchLoader = true
                      getAgents(false, e.target.value, searchLoader)
                    }, 500)
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
            }
          />
          </div>
          <div
            id="agentsPageScrollContent"
            className={`flex min-h-0 flex-1 flex-col overflow-auto w-full items-center ${agentsListSeparated.length > 0 ? 'pb-[170px]' : ''}`}
          >
            {/* code for agents list */}
            {initialLoader ? (
              <div className="flex flex-1 flex-row justify-center gap-4 py-8">
                {/*<CircularProgress size={45} />*/}
                <MyAgentXLoader />
              </div>
            ) : (
              <AgentsListPaginated
                oldAgentsList={oldAgentsList}
                agentsListSeparatedParam={agentsListSeparated}
                selectedImagesParam={selectedImages}
                handlePopoverClose={handlePopoverClose}
                user={user}
                getAgents={(p, s) => {
                  // console.log("p", s);
                  getAgents(p, s) //user
                }}
                search={search}
                setObjective={setObjective}
                setOldObjective={setOldObjective}
                setGreetingTagInput={setGreetingTagInput}
                setOldGreetingTagInput={setOldGreetingTagInput}
                setScriptTagInput={setScriptTagInput}
                setOldScriptTagInput={setOldScriptTagInput}
                setShowScriptModal={setShowScriptModal}
                matchingAgent={matchingAgent}
                setShowScript={setShowScript}
                handleShowDrawer={handleShowDrawer}
                handleProfileImgChange={handleProfileImgChange}
                setShowRenameAgentPopup={setShowRenameAgentPopup}
                setSelectedRenameAgent={setSelectedRenameAgent}
                setRenameAgent={setRenameAgent}
                // ShowWarningModal={ShowWarningModal}
                // setShowWarningModal={setShowWarningModal}
                setShowDrawerSelectedAgent={setShowDrawerSelectedAgent}
                setOpenTestAiModal={setOpenTestAiModal}
                mainAgentsList={mainAgentsList}
                setScriptKeys={setScriptKeys}
                setSelectedAgent={setSelectedAgent}
                setShowClaimPopup={setShowClaimPopup}
                keys={keys}
                canGetMore={canGetMore}
                paginationLoader={paginationLoader}
                initialLoader={initialLoader}
                scrollableTarget="agentsPageScrollContent"
              />
            )}
          </div>

          {/* Add New Agent bar - fixed to bottom, above scrollable content */}
          {agentsListSeparated.length > 0 && (
            <div
              className="fixed bottom-0 left-[250px] right-0 z-10 flex w-full flex-col items-center justify-center bg-white p-4"
              style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
            >
              <div
                className="agents-add-new-bar-inner flex min-h-[70px] w-full max-w-[1028px] flex-shrink-0 cursor-pointer items-center justify-center rounded-[10px] py-6"
                style={{
                  border: '1px dashed hsl(var(--brand-primary))',
                  boxShadow: '0px 0px 10px 10px rgba(64, 47, 255, 0.05)',
                  backgroundColor: '#FBFCFF',
                }}
                onClick={handleAddNewAgent}
              >
                <div
                  className="flex flex-row items-center justify-center gap-1"
                  style={{
                    fontSize: 20,
                    fontWeight: '500',
                    color: '#000',
                  }}
                >
                  <Plus weight="bold" size={22} /> Add New Agent
                </div>
              </div>
            </div>
          )}
          {/* Modal to rename the agent */}
          <Modal
            open={!!showRenameAgentPopup}
            onClose={() => {
              setShowRenameAgentPopup(false)
            }}
            closeAfterTransition
            BackdropProps={{
              timeout: 250,
              sx: {
                backgroundColor: '#00000099',
              },
            }}
          >
            <ScaleFadeTransition in={!!showRenameAgentPopup} timeout={250}>
              <Box
                className="w-[400px]"
                sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}
              >
                <div style={{ width: '100%' }}>
                <div
                  className="max-h-[60vh] overflow-auto"
                  style={{ scrollbarWidth: 'none' }}
                >
                  <div
                    style={{
                      width: '100%',
                      direction: 'row',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    {/* <div style={{ width: "20%" }} /> */}
                    <div style={{ fontWeight: '700', fontSize: 22 }}>
                      Rename Agent
                    </div>
                    <div
                      style={{
                        direction: 'row',
                        display: 'flex',
                        justifyContent: 'end',
                      }}
                    >
                      <CloseBtn
                        onClick={() => {
                          setShowRenameAgentPopup(null)
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div
                      className="mt-4"
                      style={{ fontWeight: '600', fontSize: 12, paddingBottom: 5 }}
                    >
                      Agent Name
                    </div>
                    <input
                      value={renameAgent || ''}
                      // value = {showRenameAgentPopup?.name}
                      onChange={(e) => {
                        setRenameAgent(e.target.value)
                      }}
                      placeholder={
                        'Enter agent title'
                        // selectedRenameAgent?.name
                        //   ? selectedRenameAgent.name
                        //   : "Enter agent title"
                      }
                      className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px]"
                      style={{ border: '1px solid #00000020' }}
                    />
                  </div>
                </div>

                {renameAgentLoader ? (
                  <div className="flex flex-row iems-center justify-center w-full mt-4">
                    <CircularProgress size={25} />
                  </div>
                ) : (
                  <button
                    className="mt-4 outline-none"
                    style={{
                      backgroundColor: 'hsl(var(--brand-primary))',
                      color: 'white',
                      height: '50px',
                      borderRadius: '10px',
                      width: '100%',
                      fontWeight: 600,
                      fontSize: '20',
                    }}
                    onClick={handleRenameAgent}
                  >
                    Update
                  </button>
                )}
              </div>
            </Box>
            </ScaleFadeTransition>
          </Modal>
          {/* Test ai modal - firecrawl style */}
          <Modal
            open={openTestAiModal}
            onClose={() => {
              setOpenTestAiModal(false)
              setName('')
              setPhone('')
              setErrorMessage('')
            }}
            closeAfterTransition
            BackdropProps={{
              timeout: 250,
              sx: { backgroundColor: '#00000099' },
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Fade in={openTestAiModal} timeout={250}>
              <Box
                className="flex w-[400px] max-w-[90vw] max-h-[80vh] flex-col overflow-hidden rounded-[12px] bg-white"
                sx={{
                  boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
                  border: '1px solid #eaeaea',
                  outline: 'none',
                  '@keyframes modalEnter': {
                    '0%': { transform: 'scale(0.95)' },
                    '100%': { transform: 'scale(1)' },
                  },
                  animation: 'modalEnter 250ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                }}
              >
                {/* Header */}
                <div
                  className="flex flex-row items-center justify-between px-4 py-3 flex-shrink-0 flex-wrap gap-2"
                  style={{ borderBottom: '1px solid #eaeaea' }}
                >
                  <div className="flex flex-row items-center gap-2 flex-wrap">
                    <span
                      className="font-semibold"
                      style={{ fontSize: 16, color: 'rgba(0,0,0,0.9)' }}
                    >
                      Tryout Test
                    </span>
                    {!selectedAgent?.phoneNumber && (
                      <div className="flex flex-row items-center gap-2">
                        <Image
                          src="/assets/warningFill.png"
                          height={20}
                          width={20}
                          alt=""
                        />
                        <span className="text-red" style={{ fontSize: 12, fontWeight: 600 }}>
                          No phone number assigned
                        </span>
                      </div>
                    )}
                  </div>
                  <CloseBtn
                    onClick={() => {
                      setOpenTestAiModal(false)
                      setName('')
                      setPhone('')
                      setErrorMessage('')
                    }}
                  />
                </div>

                {/* Body */}
                <div
                  className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-4 py-4"
                  style={{ fontSize: 14, color: 'rgba(0,0,0,0.8)', scrollbarWidth: 'none' }}
                >
                  <div className="flex flex-col gap-2">
                    <label className="pt-0" style={{ fontSize: 14, fontWeight: 400 }}>
                      Who are you calling
                    </label>
                    <div className="search-input-wrapper flex h-[40px] w-full flex-row items-center overflow-hidden rounded-lg px-3">
                      <input
                        placeholder="Name"
                        className="h-full w-full border-none bg-transparent text-sm font-medium outline-none focus:outline-none focus:ring-0"
                        style={{ color: '#111827', fontSize: 14 }}
                        value={name || ''}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="pt-0" style={{ fontSize: 14, fontWeight: 400 }}>
                      Phone Number
                    </label>
                    <div
                      className="search-input-wrapper flex h-[40px] w-full flex-row items-center overflow-hidden rounded-lg px-0"
                      style={{ position: 'relative' }}
                    >
                      <PhoneInput
                        className="border-0 bg-transparent outline-none"
                        country="us"
                        onlyCountries={['us', 'sv', 'pk', 'mx', 'sv', 'ec']}
                        disableDropdown={false}
                        countryCodeEditable={false}
                        value={phone}
                        onChange={handlePhoneNumberChange}
                        placeholder={
                          locationLoader ? 'Loading location ...' : 'Enter Number'
                        }
                        style={{ borderRadius: '8px', height: '100%' }}
                        containerStyle={{ position: 'relative', height: '100%', flex: 1 }}
                        inputStyle={{
                          width: '100%',
                          height: '40px',
                          borderWidth: '0px',
                          backgroundColor: 'transparent',
                          paddingLeft: '48px',
                          paddingTop: '0',
                          paddingBottom: '0',
                          fontSize: 14,
                          fontWeight: 500,
                          color: '#111827',
                        }}
                        buttonStyle={{
                          border: 'none',
                          backgroundColor: 'transparent',
                        }}
                        dropdownStyle={{
                          maxHeight: '150px',
                          overflowY: 'auto',
                          position: 'absolute',
                          top: 'auto',
                          bottom: '100%',
                          marginBottom: '4px',
                          zIndex: 9999,
                        }}
                      />
                    </div>
                  </div>

                  {errorMessage ? (
                    <p
                      style={{
                        ...styles.errmsg,
                        color: 'red',
                        height: '20px',
                      }}
                    >
                      {errorMessage}
                    </p>
                  ) : null}

                  <div style={{ scrollbarWidth: 'none' }}>
                    {scriptKeys?.map((key, index) => (
                      <div
                        key={key}
                        className={index === scriptKeys?.length - 1 ? 'mb-4' : ''}
                      >
                        <label
                          className="pt-0"
                          style={{ fontSize: 14, fontWeight: 400 }}
                        >
                          {key[0]?.toUpperCase()}
                          {key?.slice(1)}
                        </label>
                        <div className="search-input-wrapper mt-1 flex h-[40px] w-full flex-row items-center overflow-hidden rounded-lg px-3">
                          <input
                            placeholder="Type here"
                            className="h-full w-full border-none bg-transparent text-sm font-medium outline-none focus:outline-none focus:ring-0"
                            style={{ color: '#111827', fontSize: 14 }}
                            value={inputValues[key] || ''}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="flex flex-shrink-0 flex-row items-center justify-between px-4 py-3"
                  style={{ borderTop: '1px solid #eaeaea' }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOpenTestAiModal(false)
                      setName('')
                      setPhone('')
                      setErrorMessage('')
                    }}
                    className="flex h-[40px] items-center justify-center rounded-lg px-4 text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors duration-150 active:scale-[0.98] outline-none"
                  >
                    Cancel
                  </button>
                  {testAIloader ? (
                    <div className="flex h-[40px] items-center justify-center px-6">
                      <CircularProgress size={24} />
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!name || !phone}
                      onClick={handleTestAiClick}
                      className="flex h-[40px] items-center justify-center rounded-lg px-4 text-sm font-semibold bg-brand-primary text-white hover:opacity-90 transition-all duration-150 active:scale-[0.98] outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Test AI
                    </button>
                  )}
                </div>
              </Box>
            </Fade>
          </Modal>
          <UnlockPremiunFeatures
            open={showUnlockPremiumFeaturesPopup}
            handleClose={() => {
              setShowUnlockPremiumFeaturesPopup(false)
            }}
            title={featureTitle}
          />
          <UpgradeModal
            open={showUpgradeModal}
            handleClose={() => {
              setFeatureTitle('')
              setShowUpgradeModal(false)
            }}
            onUpgradeSuccess={handleUpgradeSuccess}
            title={title || 'Unlock More Agents'}
            subTitle={
              subTitle ||
              'Upgrade to add more agents to your team and scale your calling power'
            }
            buttonTitle={'No Thanks'}
            functionality="webAgent"
            featureTitle={featureTitle}
          />
          <UpgradePlan
            selectedPlan={null}
            setSelectedPlan={() => { }}
            open={showUpgradePlanModal}
            handleClose={async (upgradeResult) => {
              setShowUpgradePlanModal(false)
              if (upgradeResult) {
                setShowDuplicateConfirmationPopup(false)
                await refreshUserData()
              }
            }}
            plan={null}
            currentFullPlan={reduxUser?.user?.plan}
          />
          <MoreAgentsPopup
            open={showMoreAgentsPopup}
            onClose={() => {
              setShowMoreAgentsPopup(false)
            }}
            onUpgrade={() => {
              // Close current modal first, then open upgrade modal after delay to prevent React DOM errors
              setShowMoreAgentsPopup(false)
              setTimeout(() => {
                setShowUpgradePlanModal(true)
              }, 150)
            }}
            onAddAgent={() => {
              // Close modal first to prevent React DOM errors
              setShowMoreAgentsPopup(false)
              // Execute action after a small delay
              setTimeout(() => {
                if (moreAgentsPopupType === 'duplicate') {
                  handleDuplicate()
                } else if (moreAgentsPopupType === 'newagent') {
                  handleAddAgentByMoreAgentsPopup()
                } else {
                  handleAddAgentByMoreAgentsPopup()
                }
              }, 150)
            }}
            costPerAdditionalAgent={
              reduxUser?.planCapabilities?.costPerAdditionalAgent || 10
            }
            from={'agents'}
          />
          <AskToUpgrade
            open={showAskToUpgradeModal}
            handleClose={() => {
              setShowAskToUPgradeModal(false)
            }}
          />
          {/* Error snack bar message */}
          {/* drawer */}
          <Drawer
            anchor="right"
            open={showDrawerSelectedAgent != null}
            onClose={() => {
              handleDrawerClose()
            }}
            transitionDuration={{ enter: 280, exit: 220 }}
            PaperProps={{
              className: 'responsive-drawer-paper flex flex-col gap-3',
              sx: {
                padding: 0,
                backgroundColor: '#ffffff',
                overflow: 'hidden',
                scrollbarWidth: 'none',
                border: '1px solid #eaeaea',
                borderRight: 'none',
                boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
                width: { xs: '100%', sm: '650px !important' },
                minWidth: { xs: 'auto', sm: '650px !important' },
                maxWidth: { xs: '100vw', sm: '650px !important' },
                borderRadius: '16px',
                margin: { xs: 0, sm: '1%' },
                height: { xs: '100vh', sm: '96.5vh' },
              },
            }}
            BackdropProps={{
              timeout: 280,
              sx: {
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'none',
              },
            }}
          >
            <div className="flex flex-col w-full h-full overflow-hidden m-[1px] gap-[12px]">
              {/* Header: agent name, actions, close */}
              <header
                className="flex-shrink-0 w-full flex flex-col gap-3 p-0 border-b border-[#eaeaea] bg-white"
                style={{ minHeight: 72 }}
              >
                <div
                  className="flex items-center justify-between shrink-0 w-full"
                  style={{ paddingTop: 12, paddingBottom: 12, paddingLeft: 16, paddingRight: 16, borderBottom: '1px solid #eaeaea' }}
                >
                  <span style={{ fontSize: 18, fontWeight: 600 }}>Agent Detail</span>
                  <div className="flex items-center gap-2">
                    {showModelLoader ? (
                      <div className="flex items-center justify-center h-[40px] px-3">
                        <CircularProgress size={25} />
                      </div>
                    ) : (
                      <>
                        <div
                          className="flex flex-row items-center gap-1 border-0 rounded-[12px] bg-white h-[40px]"
                          style={{
                            paddingLeft: 12,
                            paddingRight: 12,
                          }}
                        >
                          <button
                            id="gpt"
                            onClick={(event) =>
                              setOpenGptManu(event.currentTarget)
                            }
                            className="flex items-center gap-1 h-[40px] rounded-lg bg-transparent px-0 text-foreground hover:bg-black/[0.02] transition-colors duration-150 active:scale-[0.98] [&_img]:hover:animate-pulse [&_svg]:text-foreground"
                            style={{
                              fontSize: 14,
                              fontWeight: 400,
                            }}
                          >
                            <Avatar
                              src={getModelIcon(selectedGptManu)}
                              sx={{ width: 24, height: 24, marginRight: 1 }}
                            />
                            {getModelDisplayName(selectedGptManu)}
                            <ChevronDown size={18} className="shrink-0 opacity-80" />
                          </button>
                        </div>
                        <Menu
                          id="gpt-menu"
                          anchorEl={openGptManu}
                          open={openGptManu}
                          onClose={() => setOpenGptManu(null)}
                          TransitionProps={{ timeout: { enter: 200, exit: 200 } }}
                          slotProps={{
                            paper: {
                              className: 'animate-in slide-in-from-bottom-2 duration-200 ease-out',
                            },
                          }}
                          sx={{
                            '& .MuiPaper-root': {
                              border: '1px solid #eaeaea',
                              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
                              borderRadius: '12px',
                              padding: 0,
                              paddingLeft: '4px',
                              paddingRight: '4px',
                              minWidth: '231px',
                              overflow: 'hidden',
                            },
                            '& .MuiMenu-list': {
                              padding: 0,
                              marginTop: '1px',
                            },
                            '& .MuiMenuItem-root': {
                              borderRadius: '8px',
                              transition: 'background-color 0.15s ease-out',
                              fontWeight: 400,
                              backgroundColor: 'rgba(0, 0, 0, 0.02)',
                              color: 'hsl(var(--brand-primary))',
                            },
                            '& .MuiMenuItem-root:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            },
                          }}
                        >
                          <Box
                            component="div"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 12px',
                              borderBottom: '1px solid #eaeaea',
                              backgroundColor: '#ffffff',
                            }}
                          >
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>Model</span>
                            <button
                              type="button"
                              onClick={() => setOpenGptManu(null)}
                              className="rounded flex items-center justify-center w-8 h-8 bg-transparent hover:bg-black/[0.05] transition-colors duration-150 ease-out"
                              aria-label="Close"
                            >
                              <X size={14} className="opacity-80" />
                            </button>
                          </Box>
                          {models.map((model, index) => {
                            const iconSrc =
                              model.value === 'gpt-4.1-mini' && reduxUser?.agencyBranding?.supportWidgetLogoUrl
                                ? reduxUser.agencyBranding.supportWidgetLogoUrl
                                : model.icon
                            return (
                              <MenuItem
                                key={index}
                                onClick={() => handleGptManuSelect(model)}
                                disabled={model.disabled}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '10px',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  transition: 'background 0.2s',
                                  '&:hover': {
                                    backgroundColor: model.disabled
                                      ? 'inherit'
                                      : '#F5F5F5',
                                  },
                                  opacity: model.disabled ? 0.6 : 1,
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                  }}
                                >
                                  <Avatar
                                    src={iconSrc}
                                    sx={{ width: 24, height: 24 }}
                                  />
                                  <span
                                    style={{
                                      fontSize: '14px',
                                      fontWeight: 400,
                                      color: 'rgba(0, 0, 0, 0.8)',
                                    }}
                                  >
                                    {getModelDisplayName(model)}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    backgroundColor: 'hsl(var(--brand-primary) / 0.05)',
                                    color: 'hsl(var(--brand-primary))',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    minWidth: 'fit-content',
                                  }}
                                >
                                  {model.responseTime}
                                </div>
                              </MenuItem>
                            )
                          })}
                        </Menu>
                      </>
                    )}
                    <CloseBtn onClick={handleDrawerClose} />
                  </div>
                </div>
                <div className="flex flex-row items-start justify-between w-full gap-3 min-w-0 py-3 px-4">
                  <div className="flex flex-row items-start justify-start gap-3 w-full p-4">
                    {/* Profile Image (left) */}
                    <div className="flex items-center justify-center w-[120px] h-[120px] rounded-[16px] shrink-0" style={{ backgroundColor: 'hsl(var(--brand-primary) / 0.02)' }}>
                      <button
                        onClick={() => {
                          document.getElementById('fileInput').click()
                        }}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onMouseEnter={() => setProfileImageHovered(true)}
                        onMouseLeave={() => setProfileImageHovered(false)}
                        className="transition-all duration-300 ease-out"
                      >
                        <div
                          className="flex flex-row items-center justify-center w-[120px] h-[120px] overflow-hidden relative"
                          style={{
                            border: '3px solid white',
                            boxShadow: '0 16px 30px rgba(0, 0, 0, 0.055)',
                            backdropFilter: 'blur(8px)',
                            backgroundColor: 'transparent',
                            borderRadius: 16,
                          }}
                        >
                          <div
                            className="absolute left-1/2 z-0 w-[60px] h-[60px] rounded-full bg-brand-primary -translate-x-1/2"
                            style={{
                              top: '-30px',
                              filter: `blur(${profileImageHovered ? 38 : 30}px)`,
                              opacity: profileImageHovered ? 0.88 : 0.75,
                              transition: 'filter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out',
                            }}
                            aria-hidden
                          />
                          <div className="relative z-10 flex flex-row items-center justify-center bg-transparent w-auto h-auto p-1 [&_*]:bg-transparent">
                          {selectedImage ? (
                            <div className="bg-transparent">
                              <Image
                                src={selectedImage}
                                height={74}
                                width={74}
                                alt="profileImage"
                                className="rounded-full"
                                style={{
                                  objectFit: 'cover',
                                  resize: 'cover',
                                  height: 74,
                                  width: 74,
                                }}
                              />
                            </div>
                          ) : (
                            getAgentsListImage(showDrawerSelectedAgent, 74, 74)
                          )}

                          <Image
                            src={'/otherAssets/cameraBtn.png'}
                            style={{ marginLeft: -25, filter: 'var(--brand-primary-filter, none)' }}
                            height={20}
                            width={20}
                            alt="profileImage"
                          />
                          </div>
                        </div>
                      </button>

                      <input
                        value={''}
                        type="file"
                        accept="image/*"
                        id="fileInput"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                      />

                      {globalLoader && (
                        <CircularLoader
                          globalLoader={globalLoader}
                          setGlobalLoader={setGlobalLoader}
                        />
                      )}
                    </div>
                    {/* Name and info (right) */}
                    <div className="flex flex-col gap-2 items-start ml-2 text-sm text-black/80 font-normal pt-2" style={{ fontWeight: 400 }}>
                      <div className="flex flex-row justify-center items-center gap-2">
                        <button
                          onClick={() => {
                            setShowRenameAgentPopup(true)
                            setSelectedRenameAgent(showDrawerSelectedAgent)
                            setRenameAgent(showDrawerSelectedAgent?.name)
                          }}
                        >
                          <div className="flex flex-row items-center gap-2">
                            <div className="relative group max-w-[150px] text-left w-full">
                              <div className="truncate text-left font-semibold w-full" style={{ fontSize: 18, color: 'rgba(0,0,0,0.8)', fontWeight: 600 }}>
                                {showDrawerSelectedAgent?.name
                                  ?.slice(0, 1)
                                  .toUpperCase()}
                                {showDrawerSelectedAgent?.name?.slice(1)}
                              </div>

                              {/* Tooltip */}
                              <div
                                className="absolute left-0 top-full mt-1 w-max max-w-xs px-2 py-1 rounded-md bg-white
                           shadow-md p-2 text-black text-md font-[500] opacity-0 group-hover:opacity-100 pointer-events-none
                           transition-opacity duration-200 z-50"
                              >
                                {showDrawerSelectedAgent?.name}
                              </div>
                            </div>
                            {renderBrandedIcon('/svgIcons/editIcon2.svg', 24, 24)}
                          </div>
                      </button>
                      </div>

                      <div
                        style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.8)' }}
                      >
                        {showDrawerSelectedAgent?.agentObjective}{' '}
                        <span>
                          {' '}
                          |{' '}
                          {showDrawerSelectedAgent?.agentType
                            ?.slice(0, 1)
                            .toUpperCase(0)}
                          {showDrawerSelectedAgent?.agentType?.slice(1)} |{' '}
                        </span>
                      </div>

                      <div
                        style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.8)' }}
                      >
                        {/* {showDrawer?.phoneNumber} */}
                        {formatPhoneNumber(showDrawerSelectedAgent?.phoneNumber)}
                      </div>

                      <div className="flex flex-row gap-2 items-center ">
                        <div
                          style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.8)' }}
                        >
                          Created on:
                        </div>
                        <div
                          style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.8)' }}
                        >
                          {/* {showDrawer?.createdAt} */}
                          {                          GetFormattedDateString(
                            showDrawerSelectedAgent?.createdAt,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 py-3 self-stretch">
                    <div className="flex flex-col items-center justify-between gap-2 p-1 h-full [&>div:not(:last-child)]:border [&>div:not(:last-child)]:border-[#eaeaea] [&>div]:rounded-lg [&>div]:min-h-[40px]">
                      <div>
                        <DuplicateConfirmationPopup
                          open={showDuplicateConfirmationPopup}
                          handleClose={() => setShowDuplicateConfirmationPopup(false)}
                          handleDuplicate={shouldDuplicateAgent}
                          duplicateLoader={duplicateLoader}
                        />
                        <div
                          className="flex flex-row items-center gap-[2px] text-black/80 [&_svg]:text-black/80 [&_img]:opacity-80 border border-[#eaeaea] rounded-[64px] bg-white"
                          style={{
                            color: 'rgba(0,0,0,0.8)',
                            paddingLeft: 12,
                            paddingRight: 12,
                            paddingTop: 6,
                            paddingBottom: 6,
                            boxShadow: '0 16px 30px rgba(0, 0, 0, 0.12)',
                          }}
                        >
                          <div className="w-8 h-8 rounded-[16px] flex items-center justify-center hover:bg-black/[0.05] [&:has(button:active)]:scale-[0.98] transition-colors transition-transform duration-150">
                            <Tooltip
                              title="Duplicate"
                              arrow
                              componentsProps={{ tooltip: { sx: { backgroundColor: '#000000', color: '#ffffff', fontSize: '12px', padding: '8px 12px', borderRadius: '12px' } }, arrow: { sx: { color: '#000000' } } }}
                              TransitionProps={{ timeout: { enter: 150, exit: 100 } }}
                            >
                              <div className="cursor-pointer pt-1 border-0">
                                <DuplicateButton handleDuplicate={() => setShowDuplicateConfirmationPopup(true)} loading={duplicateLoader} size={16} useBlack />
                              </div>
                            </Tooltip>
                          </div>
                          <div className="w-8 h-8 rounded-[16px] flex items-center justify-center hover:bg-black/[0.05] [&:has(button:active)]:scale-[0.98] transition-colors transition-transform duration-150">
                            <Tooltip
                              title="Open Tab"
                              arrow
                              componentsProps={{ tooltip: { sx: { backgroundColor: '#000000', color: '#ffffff', fontSize: '12px', padding: '8px 12px', borderRadius: '12px' } }, arrow: { sx: { color: '#000000' } } }}
                              TransitionProps={{ timeout: { enter: 150, exit: 100 } }}
                            >
                              <button onClick={() => handleWebAgentClick(showDrawerSelectedAgent)}>
                                <SquareArrowOutUpRight size={16} className="text-black shrink-0" style={{ color: '#000' }} />
                              </button>
                            </Tooltip>
                          </div>
                          <div className="w-8 h-8 rounded-[16px] flex items-center justify-center hover:bg-black/[0.05] [&:has(button:active)]:scale-[0.98] transition-colors transition-transform duration-150">
                            <Tooltip
                              title="Embed"
                              arrow
                              componentsProps={{ tooltip: { sx: { backgroundColor: '#000000', color: '#ffffff', fontSize: '12px', padding: '8px 12px', borderRadius: '12px' } }, arrow: { sx: { color: '#000000' } } }}
                              TransitionProps={{ timeout: { enter: 150, exit: 100 } }}
                            >
                              <button style={{ paddingLeft: '3px' }} onClick={() => handleEmbedClick(showDrawerSelectedAgent)}>
                                <Code size={16} className="text-black shrink-0" style={{ color: '#000' }} />
                              </button>
                            </Tooltip>
                          </div>
                          <div className="w-8 h-8 rounded-[16px] flex items-center justify-center hover:bg-black/[0.05] [&:has(button:active)]:scale-[0.98] transition-colors transition-transform duration-150">
                            <Tooltip
                              title="Webhook"
                              arrow
                              componentsProps={{ tooltip: { sx: { backgroundColor: '#000000', color: '#ffffff', fontSize: '12px', padding: '8px 12px', borderRadius: '12px' } }, arrow: { sx: { color: '#000000' } } }}
                              TransitionProps={{ timeout: { enter: 150, exit: 100 } }}
                            >
                              <button
                                style={{ paddingLeft: '3px' }}
                                onClick={() => {
                                  if (reduxUser?.agencyCapabilities?.allowEmbedAndWebAgents === false) {
                                    setShowUpgradeModal(true)
                                    setTitle('Unlock your Web Agent')
                                    setSubTitle('Bring your AI agent to your website allowing them to engage with leads and customers')
                                    setFeatureTitle('EmbedAgents')
                                  } else if (reduxUser?.planCapabilities?.allowEmbedAndWebAgents === false) {
                                    setShowUpgradeModal(true)
                                    setTitle('Unlock your Web Agent')
                                    setSubTitle('Bring your AI agent to your website allowing them to engage with leads and customers')
                                  } else {
                                    let agentToUse = showDrawerSelectedAgent
                                    if (selectedAgentForWebAgent && selectedAgentForWebAgent.id === showDrawerSelectedAgent.id) {
                                      agentToUse = { ...showDrawerSelectedAgent, smartListIdForWeb: selectedAgentForWebAgent.smartListIdForWeb ?? showDrawerSelectedAgent.smartListIdForWeb, smartListEnabledForWeb: selectedAgentForWebAgent.smartListEnabledForWeb ?? showDrawerSelectedAgent.smartListEnabledForWeb, smartListIdForWebhook: selectedAgentForWebAgent.smartListIdForWebhook ?? showDrawerSelectedAgent.smartListIdForWebhook, smartListEnabledForWebhook: selectedAgentForWebAgent.smartListEnabledForWebhook ?? showDrawerSelectedAgent.smartListEnabledForWebhook, smartListIdForEmbed: selectedAgentForWebAgent.smartListIdForEmbed ?? showDrawerSelectedAgent.smartListIdForEmbed, smartListEnabledForEmbed: selectedAgentForWebAgent.smartListEnabledForEmbed ?? showDrawerSelectedAgent.smartListEnabledForEmbed }
                                    }
                                    setFetureType('webhook')
                                    setSelectedAgentForWebAgent(agentToUse)
                                    setShowWebAgentModal(true)
                                  }
                                }}
                              >
                                <Webhook size={16} className="text-black shrink-0" style={{ color: '#000' }} />
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              {/* Body: scrollable content */}
              <div
                className="flex-1 min-h-0 overflow-y-auto w-full flex flex-col gap-3 px-4 py-0"
                style={{ scrollbarWidth: 'none' }}
              >
                {/* Center Stats View — icons match agent card call stat container (AgentsListPaginated) */}
                <div
                  className="grid grid-cols-5 gap-3 w-full rounded-lg px-4 py-3 bg-white text-sm"
                  style={{ boxShadow: '0 4.2px 30px rgba(0, 0, 0, 0.06)', fontSize: 14, fontWeight: 400 }}
                >
                  <div className="flex flex-col items-start gap-2">
                    <AgentInfoCard
                      name="Calls"
                      value={
                        showDrawerSelectedAgent?.calls &&
                          showDrawerSelectedAgent?.calls > 0 ? (
                          <div>{showDrawerSelectedAgent?.calls}</div>
                        ) : (
                          '-'
                        )
                      }
                      iconComponent={<Zap size={18} />}
                      iconWrapperClassName="w-10 h-10 rounded-[8px] bg-brand-primary/[0.08]"
                      iconColor="text-brand-primary"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <AgentInfoCard
                      name="Convos"
                      value={
                        showDrawerSelectedAgent?.callsGt10 &&
                          showDrawerSelectedAgent?.callsGt10 > 0 ? (
                          <div>{showDrawerSelectedAgent?.callsGt10}</div>
                        ) : (
                          '-'
                        )
                      }
                      iconComponent={<MessageCircleMore size={18} />}
                      iconWrapperClassName="w-10 h-10 rounded-[8px] bg-brand-primary/[0.08]"
                      iconColor="text-brand-primary"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <AgentInfoCard
                      name="Hot Leads"
                      value={
                        <div>
                          {showDrawerSelectedAgent?.hotleads
                            ? showDrawerSelectedAgent?.hotleads
                            : '-'}
                        </div>
                      }
                      iconComponent={<Zap size={18} />}
                      iconWrapperClassName="w-10 h-10 rounded-[8px] bg-brand-primary/[0.08]"
                      iconColor="text-brand-primary"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <AgentInfoCard
                      name="Booked"
                      value={
                        <div>
                          {showDrawerSelectedAgent?.booked
                            ? showDrawerSelectedAgent?.booked
                            : '-'}
                        </div>
                      }
                      iconComponent={<Calendar size={18} />}
                      iconWrapperClassName="w-10 h-10 rounded-[8px] bg-brand-primary/[0.08]"
                      iconColor="text-brand-primary"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <AgentInfoCard
                      name="Mins Talked"
                      value={
                        showDrawerSelectedAgent?.totalDuration &&
                          showDrawerSelectedAgent?.totalDuration > 0 ? (
                          <div>
                            {showDrawerSelectedAgent?.totalDuration
                              ? moment
                                  .utc(
                                    (showDrawerSelectedAgent?.totalDuration || 0) * 1000
                                  )
                                  .format('HH:mm:ss')
                              : '-'}
                          </div>
                        ) : (
                          '-'
                        )
                      }
                      iconComponent={<Hourglass size={18} />}
                      iconWrapperClassName="w-10 h-10 rounded-[8px] bg-brand-primary/[0.08]"
                      iconColor="text-orange-500"
                    />
                  </div>
                </div>
                {/* Bottom Agent Info */}
                <div className="flex flex-row items-center gap-2 w-full h-auto max-h-none p-0 m-0 border-b border-border">
                  {AgentMenuOptions.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 min-w-0 min-h-[40px] pb-2 -mb-0.5 border-b-2 transition-colors flex items-center justify-center ${activeTab === tab
                        ? 'text-brand-primary border-brand-primary'
                        : 'text-muted-foreground border-transparent hover:text-foreground'
                        }`}
                      style={{
                        fontSize: 15,
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Code for agent info */}
                {activeTab === 'Agent Info' ? (
                  <div className="w-full flex flex-col gap-4">
                    <div
                      className="flex flex-col overflow-hidden bg-white"
                      style={{
                        border: '1px solid #eaeaea',
                        borderRadius: 12,
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      <div
                        className="flex flex-row items-center justify-between px-4 py-3"
                        style={{ borderBottom: '1px solid #eaeaea' }}
                      >
                        <span className="font-semibold" style={{ fontSize: 16, color: 'rgba(0, 0, 0, 0.9)' }}>
                          Voice Options
                        </span>
                        <button
                          onClick={() => setShowAdvancedSettingsModal(true)}
                          className="text-sm font-medium text-brand-primary hover:opacity-90 transition-opacity"
                        >
                          Advanced Settings
                        </button>
                      </div>
                      <div className="px-4 py-4" style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.8)' }}>
                      {/* Language */}
                      <div className="flex w-full justify-between items-center py-2">
                        <div
                          style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0, 0, 0, 0.7)' }}
                        >
                          Language
                        </div>

                        <div
                          style={{
                            // width: "115px",
                            display: 'flex',
                            alignItems: 'center',
                            // borderWidth:1,
                            marginRight: -15,
                          }}
                        >
                          {showLanguageLoader ? (
                            <div
                              style={{
                                width: '115px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <CircularProgress size={15} />
                            </div>
                          ) : (
                            <FormControl>
                              <Select
                                value={languageValue}
                                onChange={async (event) => {
                                  handleLanguageChange(event)
                                }}
                                displayEmpty // Enables placeholder
                                renderValue={(selected) => {
                                  if (!selected) {
                                    return (
                                      <div style={{ color: '#aaa' }}>Select</div>
                                    ) // Placeholder style
                                  }
                                  const selectedVoice = AgentLanguagesList.find(
                                    (lang) => lang?.title === selected,
                                  )
                                  // console.log(
                                  //   `Selected Language for ${selected} is ${selectedVoice?.title}`
                                  // );
                                  //  return selectedVoice ? selectedVoice.title : null;

                                  return (
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                      }}
                                    >
                                      <Image
                                        src={selectedVoice?.flag}
                                        height={22}
                                        width={22}
                                        alt="Selected Language"
                                      />
                                      <div>{selectedVoice?.title}</div>
                                    </div>
                                  )
                                }}
                                sx={{
                                  border: 'none', // Default border
                                  '& .MuiOutlinedInput-root': { height: 40, minHeight: 40 },
                                  '&:hover': {
                                    border: 'none', // Same border on hover
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
                                  TransitionProps: { timeout: { enter: 200, exit: 200 } },
                                  slotProps: { paper: { className: 'animate-in slide-in-from-bottom-2 duration-200 ease-out' } },
                                  PaperProps: {
                                    sx: {
                                      border: '1px solid #eaeaea',
                                      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
                                      borderRadius: '12px',
                                      overflow: 'hidden',
                                      maxHeight: '30vh',
                                      overflowY: 'auto',
                                      scrollbarWidth: 'none',
                                    },
                                  },
                                  sx: {
                                    '& .MuiMenuItem-root': { borderRadius: '8px', transition: 'background-color 0.15s ease-out' },
                                    '& .MuiMenuItem-root:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                                  },
                                }}
                              >
                                {AgentLanguagesList.map((item, index) => {
                                  return (
                                    <MenuItem
                                      className="flex flex-row items-center gap-2 bg-brand-primary/10 w-full"
                                      value={item?.title}
                                      key={index}
                                      // disabled={item.value === "multi" && (reduxUser?.planCapabilities?.allowLanguageSelection === false)}
                                      style={
                                        item.value === 'multi' &&
                                          reduxUser?.planCapabilities
                                            ?.allowLanguageSelection === false
                                          ? { pointerEvents: 'auto' }
                                          : {}
                                      }
                                      sx={{
                                        '&:hover': {
                                          backgroundColor: '#F5F5F5',
                                        },
                                        '&.Mui-selected': {
                                          backgroundColor: '#F5F5F5',
                                          '&:hover': {
                                            backgroundColor: '#F5F5F5',
                                          },
                                        },
                                      }}
                                    >
                                      <Image
                                        src={item?.flag}
                                        alt="*"
                                        height={22}
                                        width={22}
                                      />
                                      <div>{item?.title}</div>
                                      {item.value !== 'multi' && item.subLang && (
                                        <div
                                          style={{ color: '#00000060', fontSize: 13 }}
                                        >
                                          {item.subLang}
                                        </div>
                                      )}

                                      {item.value === 'multi' &&
                                        // Combined check - Redux first, localStorage fallback
                                        (reduxUser?.agencyCapabilities
                                          ?.allowLanguageSelection === false ? (
                                          <UpgradeTagWithModal
                                            externalTrigger={showUpgradePlanModal}
                                            onModalClose={() =>
                                              setShowUpgradePlanModal(false)
                                            }
                                            reduxUser={reduxUser}
                                            setReduxUser={setReduxUser}
                                            requestFeature={true}
                                          />
                                        ) : (
                                          !isFeatureAllowed(
                                            'allowLanguageSelection',
                                          ) && (
                                            <UpgradeTagWithModal
                                              externalTrigger={showUpgradePlanModal}
                                              onModalClose={() =>
                                                setShowUpgradePlanModal(false)
                                              }
                                              reduxUser={reduxUser}
                                              setReduxUser={setReduxUser}
                                            />
                                          )
                                        ))}
                                    </MenuItem>
                                  )
                                })}
                              </Select>
                            </FormControl>
                          )}
                        </div>
                      </div>

                      <div className="flex w-full justify-between items-center py-2">
                        <div
                          style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0, 0, 0, 0.7)' }}
                        >
                          Voice
                        </div>

                        <div
                          style={{
                            // width: "115px",
                            display: 'flex',
                            alignItems: 'center',
                            // borderWidth:1,
                            marginRight: -15,
                          }}
                        >
                          {showVoiceLoader ? (
                            <div
                              style={{
                                width: '115px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <CircularProgress size={15} />
                            </div>
                          ) : (
                            <FormControl>
                              <Select
                                value={SelectedVoice}
                                onChange={handleChangeVoice}
                                displayEmpty // Enables placeholder
                                renderValue={(selected) => {
                                  // console.log("selected", selected);
                                  if (!selected)
                                    return (
                                      <div style={{ color: '#aaa' }}>Select</div>
                                    )

                                  const selectedVoice = voicesList.find(
                                    (voice) => voice.name === selected,
                                  )

                                  return selectedVoice ? (
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                      }}
                                    >
                                      {selectedVoice.img && (
                                        <Image
                                          src={selectedVoice.img}
                                          height={30}
                                          width={30}
                                          alt="Selected Voice"
                                        />
                                      )}
                                      <div>{selectedVoice.name}</div>
                                    </div>
                                  ) : null
                                }}
                                sx={{
                                  border: 'none', // Default border
                                  '& .MuiOutlinedInput-root': { height: 40, minHeight: 40 },
                                  '&:hover': { border: 'none' }, // Same border on hover
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    border: 'none',
                                  }, // Remove the default outline
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                                    { border: 'none' },
                                }}
                                MenuProps={{
                                  TransitionProps: { timeout: { enter: 200, exit: 200 } },
                                  slotProps: { paper: { className: 'animate-in slide-in-from-bottom-2 duration-200 ease-out' } },
                                  PaperProps: {
                                    sx: {
                                      border: '1px solid #eaeaea',
                                      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
                                      borderRadius: '12px',
                                      overflow: 'hidden',
                                      maxHeight: '30vh',
                                      overflowY: 'auto',
                                      scrollbarWidth: 'none',
                                    },
                                  },
                                  sx: {
                                    '& .MuiMenuItem-root': { borderRadius: '8px', transition: 'background-color 0.15s ease-out' },
                                    '& .MuiMenuItem-root:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                                  },
                                }}
                              >
                                {voicesList.map((item, index) => {
                                  const selectedVoiceName = (id) => {
                                    const voiceName = voicesList.find(
                                      (voice) => voice.voice_id === id,
                                    )
                                    return voiceName?.name || 'Unknown'
                                  }

                                  return (
                                    <MenuItem
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',

                                      }}
                                      value={item.name}
                                      key={index}
                                      disabled={SelectedVoice === item.name}
                                    >
                                      <div className="flex flex-row items-center justify-center">
                                        <Image
                                          src={item.img}
                                          height={
                                            // item.name === 'Axel' ||
                                            // item.name === 'Max'
                                            //   ? 40
                                            // :
                                            35
                                          }
                                          width={
                                            // item.name === 'Axel' ||
                                            // item.name === 'Max'
                                            //   ? 22: 
                                            35
                                          }
                                          alt="*"
                                        />
                                      </div>
                                      <div>{item.name}</div>

                                      {/* Play/Pause Button (Prevents dropdown close) */}
                                      {item.preview ? (
                                        <div //style={{marginLeft:15}}
                                          onClick={(e) => {
                                            // console.log(
                                            //   "audio preview ",
                                            //   item.preview
                                            // );
                                            e.stopPropagation() // Prevent dropdown from closing
                                            e.preventDefault() // Prevent selection event

                                            if (preview === item.preview) {
                                              if (audio) {
                                                audio.pause()
                                                audio.removeEventListener(
                                                  'ended',
                                                  () => { },
                                                )
                                              }
                                              setPreview(null)
                                            } else {
                                              playVoice(item.preview)
                                            }
                                          }}
                                        >
                                          {preview === item.preview ? (
                                            <PauseCircle
                                              size={38}
                                              weight="regular"
                                            />
                                          ) : (
                                            <Image
                                              src={'/assets/play.png'}
                                              height={25}
                                              width={25}
                                              alt="*"
                                            />
                                          )}
                                        </div>
                                      ) : (
                                        <div
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            e.preventDefault()
                                            setShowNoAudioModal(item)
                                          }}
                                        >
                                          <Image
                                            src={'/assets/play.png'}
                                            height={25}
                                            width={25}
                                            alt="*"
                                          />
                                        </div>
                                      )}
                                    </MenuItem>
                                  )
                                })}
                              </Select>
                            </FormControl>
                          )}
                        </div>
                      </div>
                      {/* Expression */}
                      <div className="flex w-full justify-between items-center py-2">
                        <div
                          style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0, 0, 0, 0.7)' }}
                        >
                          Personality
                        </div>

                        <div
                          style={{
                            // width: "115px",
                            display: 'flex',
                            alignItems: 'center',
                            // borderWidth:1,
                            marginRight: -15,
                          }}
                        >
                          {showVoiceExpressivenessLoader ? (
                            <div
                              style={{
                                width: '115px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <CircularProgress size={15} />
                            </div>
                          ) : (
                            <FormControl>
                              <Select
                                value={voiceExpressiveness}
                                onChange={async (event) => {
                                  setShowVoiceExpressivenessLoader(true)
                                  let value = event.target.value
                                  //console.log;
                                  let voiceData = {
                                    voiceExpressiveness: value,
                                  }
                                  await updateSubAgent(voiceData)
                                  setShowVoiceExpressivenessLoader(false)
                                  setVoiceExpressiveness(value)
                                }}
                                displayEmpty // Enables placeholder
                                renderValue={(selected) => {
                                  if (!selected) {
                                    return (
                                      <div style={{ color: '#aaa' }}>Select</div>
                                    ) // Placeholder style
                                  }
                                  const selectedVoice =
                                    voiceExpressivenessList.find(
                                      (voice) => voice.value === selected,
                                    )
                                  return selectedVoice ? selectedVoice?.title : null
                                }}
                                sx={{
                                  border: 'none', // Default border
                                  '& .MuiOutlinedInput-root': { height: 40, minHeight: 40 },
                                  '&:hover': {
                                    border: 'none', // Same border on hover
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
                                  TransitionProps: { timeout: { enter: 200, exit: 200 } },
                                  slotProps: { paper: { className: 'animate-in slide-in-from-bottom-2 duration-200 ease-out' } },
                                  PaperProps: {
                                    sx: {
                                      border: '1px solid #eaeaea',
                                      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
                                      borderRadius: '12px',
                                      overflow: 'hidden',
                                      maxHeight: '30vh',
                                      overflowY: 'auto',
                                      scrollbarWidth: 'none',
                                    },
                                  },
                                  sx: {
                                    '& .MuiMenuItem-root': { borderRadius: '8px', transition: 'background-color 0.15s ease-out' },
                                    '& .MuiMenuItem-root:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                                  },
                                }}
                              >
                                {voiceExpressivenessList.map((item, index) => {
                                  return (
                                    <MenuItem
                                      value={item?.value}
                                      key={index}
                                      disabled={voiceExpressiveness === item?.title}
                                    >
                                      <div>{item?.title}</div>
                                    </MenuItem>
                                  )
                                })}
                              </Select>
                            </FormControl>
                          )}
                        </div>
                      </div>
                      {/* Talking Pace */}
                      <div className="flex w-full justify-between items-center py-2">
                        <div
                          style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0, 0, 0, 0.7)' }}
                        >
                          Talking Pace
                        </div>

                        <div
                          style={{
                            // width: "115px",
                            display: 'flex',
                            alignItems: 'center',
                            // borderWidth:1,
                            marginRight: -15,
                          }}
                        >
                          {showStartingPaceLoader ? (
                            <div
                              style={{
                                width: '115px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <CircularProgress size={15} />
                            </div>
                          ) : (
                            <FormControl>
                              <Select
                                value={startingPace}
                                onChange={async (event) => {
                                  setShowStartingPaceLoader(true)
                                  let value = event.target.value
                                  //console.log;
                                  let voiceData = {
                                    talkingPace: value,
                                  }
                                  await updateSubAgent(voiceData)
                                  setShowStartingPaceLoader(false)
                                  // setSelectedVoice(event.target.value);
                                  setStartingPace(value)
                                }}
                                displayEmpty // Enables placeholder
                                renderValue={(selected) => {
                                  if (!selected) {
                                    return (
                                      <div style={{ color: '#aaa' }}>Select</div>
                                    ) // Placeholder style
                                  }
                                  const selectedVoice = TalkingPaceList.find(
                                    (voice) => voice.value === selected,
                                  )
                                  return selectedVoice ? selectedVoice?.title : null
                                }}
                                sx={{
                                  border: 'none', // Default border
                                  '&:hover': {
                                    border: 'none', // Same border on hover
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
                                  TransitionProps: { timeout: { enter: 200, exit: 200 } },
                                  slotProps: { paper: { className: 'animate-in slide-in-from-bottom-2 duration-200 ease-out' } },
                                  PaperProps: {
                                    sx: {
                                      border: '1px solid #eaeaea',
                                      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
                                      borderRadius: '12px',
                                      overflow: 'hidden',
                                      maxHeight: '30vh',
                                      overflowY: 'auto',
                                      scrollbarWidth: 'none',
                                    },
                                  },
                                  sx: {
                                    '& .MuiMenuItem-root': { borderRadius: '8px', transition: 'background-color 0.15s ease-out' },
                                    '& .MuiMenuItem-root:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                                  },
                                }}
                              >
                                {TalkingPaceList.map((item, index) => {
                                  return (
                                    <MenuItem
                                      value={item.value}
                                      key={index}
                                      disabled={startingPace === item?.title}
                                    >
                                      <div>{item?.title}</div>
                                    </MenuItem>
                                  )
                                })}
                              </Select>
                            </FormControl>
                          )}
                        </div>
                      </div>

                      {/* Patience level */}
                      <div className="flex w-full justify-between items-center py-2">
                        <div
                          style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0, 0, 0, 0.7)' }}
                        >
                          Response Speed
                        </div>

                        <div
                          style={{
                            // width: "115px",
                            display: 'flex',
                            alignItems: 'center',
                            // borderWidth:1,
                            marginRight: -15,
                          }}
                        >
                          {showPatienceLoader ? (
                            <div
                              style={{
                                width: '115px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <CircularProgress size={15} />
                            </div>
                          ) : (
                            <FormControl>
                              <Select
                                value={patienceValue}
                                onChange={async (event) => {
                                  setShowPatienceLoader(true)
                                  let value = event.target.value
                                  //console.log;
                                  let voiceData = {
                                    responseSpeed: value,
                                  }
                                  await updateSubAgent(voiceData)
                                  setShowPatienceLoader(false)
                                  // setSelectedVoice(event.target.value);
                                  setPatienceValue(value)
                                }}
                                displayEmpty // Enables placeholder
                                renderValue={(selected) => {
                                  if (!selected) {
                                    return (
                                      <div style={{ color: '#aaa' }}>Select</div>
                                    ) // Placeholder style
                                  }
                                  const selectedVoice = ResponseSpeedList.find(
                                    (voice) => voice.value === selected,
                                  )
                                  return selectedVoice ? selectedVoice?.title : null
                                }}
                                sx={{
                                  border: 'none', // Default border
                                  '& .MuiOutlinedInput-root': { height: 40, minHeight: 40 },
                                  '&:hover': {
                                    border: 'none', // Same border on hover
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
                                  TransitionProps: { timeout: { enter: 200, exit: 200 } },
                                  slotProps: { paper: { className: 'animate-in slide-in-from-bottom-2 duration-200 ease-out' } },
                                  PaperProps: {
                                    sx: {
                                      border: '1px solid #eaeaea',
                                      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
                                      borderRadius: '12px',
                                      overflow: 'hidden',
                                      maxHeight: '30vh',
                                      overflowY: 'auto',
                                      scrollbarWidth: 'none',
                                    },
                                  },
                                  sx: {
                                    '& .MuiMenuItem-root': { borderRadius: '8px', transition: 'background-color 0.15s ease-out' },
                                    '& .MuiMenuItem-root:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                                  },
                                }}
                              >
                                {ResponseSpeedList.map((item, index) => {
                                  return (
                                    <MenuItem
                                      value={item.value}
                                      key={index}
                                      disabled={patienceValue === item?.title}
                                    >
                                      <div>{item?.title}</div>
                                    </MenuItem>
                                  )
                                })}
                              </Select>
                            </FormControl>
                          )}
                        </div>
                      </div>
                    </div>
                    </div>

                    <div
                      className="flex flex-col overflow-hidden bg-white"
                      style={{
                        border: '1px solid #eaeaea',
                        borderRadius: 12,
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      <div
                        className="px-4 py-3 font-semibold"
                        style={{ fontSize: 16, color: 'rgba(0, 0, 0, 0.9)', borderBottom: '1px solid #eaeaea' }}
                      >
                        Contact
                      </div>
                      <div className="px-4 py-4" style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.8)' }}>
                      <div className="flex justify-between items-center py-2">
                        <div
                          style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0, 0, 0, 0.7)' }}
                        >
                          Number used for calls
                        </div>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: '500',
                            color: '#000',
                          }}
                        >
                          {showPhoneLoader ? (
                            <div
                              style={{
                                width: '150px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <CircularProgress size={15} />
                            </div>
                          ) : (
                            <Box className="w-full">
                              <FormControl className="w-full">
                                <Select
                                  ref={selectRef}
                                  open={openCalimNumDropDown}
                                  onClose={() => setOpenCalimNumDropDown(false)}
                                  onOpen={() => setOpenCalimNumDropDown(true)}
                                  className="border-none rounded-2xl outline-none p-0 m-0"
                                  displayEmpty
                                  value={assignNumber}
                                  // onChange={handleSelectNumber}
                                  // onChange={(e) => {
                                  //   let value = e.target.value;
                                  //   console.log(
                                  //     "Assign number here: Value changed",
                                  //     value
                                  //   );
                                  //   // return;
                                  //   setAssignNumber(value);
                                  //   // setOpenCalimNumDropDown(false);
                                  // }}
                                  renderValue={(selected) => {
                                    if (selected === '') {
                                      return <div>Select Number</div>
                                    }
                                    return (
                                      <div
                                        style={{
                                          fontSize: 15,
                                          fontWeight: '500',
                                          color: '#000',
                                        }}
                                      >
                                        <div>{selected}</div>
                                      </div>
                                    )
                                  }}
                                  sx={{
                                    ...styles.dropdownMenu,
                                    backgroundColor: 'none',
                                    '& .MuiOutlinedInput-root': { height: 40, minHeight: 40 },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      border: 'none',
                                    },
                                    padding: 0,
                                    margin: 0,
                                  }}
                                  MenuProps={{
                                    TransitionProps: { timeout: { enter: 200, exit: 200 } },
                                    slotProps: { paper: { className: 'animate-in slide-in-from-bottom-2 duration-200 ease-out' } },
                                    PaperProps: {
                                      sx: {
                                        border: '1px solid #eaeaea',
                                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        maxHeight: '30vh',
                                        overflowY: 'auto',
                                        scrollbarWidth: 'none',
                                      },
                                    },
                                    sx: {
                                      '& .MuiMenuItem-root': { borderRadius: '8px', transition: 'background-color 0.15s ease-out' },
                                      '& .MuiMenuItem-root:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                                    },
                                  }}
                                >
                                  {previousNumber?.map((item, index) => {
                                    // //console.log;
                                    // //console.log;
                                    return (
                                      <MenuItem
                                        key={index}
                                        style={styles.dropdownMenu}
                                        value={item.phoneNumber.slice(1)}
                                        className="flex flex-row items-center gap-2 "
                                        disabled={
                                          assignNumber?.replace('+', '') ===
                                          item.phoneNumber.replace('+', '')
                                        }
                                        onClick={(e) => {
                                          //console.log;
                                          // return;
                                          if (showReassignBtn && item?.claimedBy) {
                                            e.stopPropagation()
                                            setShowConfirmationModal(item)
                                            // console.log(
                                            //   "Hit release number api",
                                            //   item
                                            // );
                                            // AssignNumber
                                          } else {
                                            //console.log;
                                            //// console.log(
                                            //   "Should call assign number api"
                                            // );
                                            // return;
                                            AssignNumber(item.phoneNumber)
                                            //// console.log(
                                            //   "Updated number is",
                                            //   item.phoneNumber
                                            // );
                                          }
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: numberDropDownWidth(
                                              item?.claimedBy?.name,
                                            ),
                                          }}
                                        >
                                          {item.phoneNumber}
                                        </div>
                                        {showReassignBtn && (
                                          <div
                                            className="w-full"
                                          // onClick={(e) => {
                                          //   console.log(
                                          //     "Should open confirmation modal"
                                          //   );
                                          //   e.stopPropagation();
                                          //   setShowConfirmationModal(item);
                                          // }}
                                          >
                                            {item.claimedBy && (
                                              <div className="flex flex-row items-center gap-2">
                                                {showDrawerSelectedAgent?.name !==
                                                  item.claimedBy.name && (
                                                    <div>
                                                      <span className="text-[#15151570]">{`(Claimed by ${item.claimedBy.name}) `}</span>
                                                      {reassignLoader === item ? (
                                                        <CircularProgress size={15} />
                                                      ) : (
                                                        <button
                                                          className="text-brand-primary underline"
                                                          onClick={(e) => {
                                                            e.stopPropagation()
                                                            setShowConfirmationModal(
                                                              item,
                                                            )
                                                          }}
                                                        >
                                                          Reassign
                                                        </button>
                                                      )}
                                                    </div>
                                                  )}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </MenuItem>
                                    )
                                  })}
                                  {showGlobalBtn && getGlobalPhoneNumber(reduxUser) && (
                                    <MenuItem
                                      style={styles.dropdownMenu}
                                      value={
                                        getGlobalPhoneNumber(reduxUser)?.replace(
                                          '+',
                                          '',
                                        ) || ''
                                      }
                                      disabled={
                                        (assignNumber &&
                                          assignNumber.replace('+', '') ===
                                          getGlobalPhoneNumber(reduxUser)?.replace(
                                            '+',
                                            '',
                                          )) ||
                                        (showDrawerSelectedAgent &&
                                          showDrawerSelectedAgent.agentType ===
                                          'inbound')
                                      }
                                      onClick={() => {
                                        // console.log(
                                        //   "This triggers when user clicks on assigning global number",
                                        //   assignNumber
                                        // );
                                        // return;
                                        const globalNumber = getGlobalPhoneNumber(reduxUser)
                                        if (globalNumber) {
                                          AssignNumber(globalNumber)
                                        }
                                        // handleReassignNumber(showConfirmationModal);
                                      }}
                                    >
                                      {getGlobalPhoneNumber(reduxUser)}
                                      {' (available for testing calls only)'}
                                    </MenuItem>
                                  )}
                                  <div
                                    className="ms-4 pe-4"
                                    style={{
                                      ...styles.inputStyle,
                                      color: '#00000070',
                                    }}
                                  >
                                    <i>Get your own unique phone number.</i>{' '}
                                    <button
                                      className="text-brand-primary underline"
                                      onClick={() => {
                                        setShowClaimPopup(true)
                                      }}
                                    >
                                      Claim one
                                    </button>
                                  </div>
                                </Select>
                              </FormControl>
                            </Box>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <div className="flex flex-row gap-3">
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 400,
                              color: 'rgba(0, 0, 0, 0.7)',
                            }}
                          >
                            Call back number
                          </div>
                          <div
                          // aria-owns={open ? 'mouse-over-popover' : undefined}
                          // aria-haspopup="true"
                          // onMouseEnter={handlePopoverOpen}
                          // onMouseLeave={handlePopoverClose}
                          ></div>
                          {/* Code for popover */}
                        </div>

                        <div className="flex flex-row items-center justify-between gap-2">
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: '400',
                              color: '#000',
                            }}
                          >
                            {showDrawerSelectedAgent?.callbackNumber ? (
                              <div>{showDrawerSelectedAgent?.callbackNumber}</div>
                            ) : (
                              '-'
                            )}
                          </div>

                          <button
                            onClick={() => {
                              setShowEditNumberPopup(
                                showDrawerSelectedAgent?.callbackNumber,
                              )
                              setSelectedNumber('Callback')
                            }}
                          >
                            {renderBrandedIcon('/svgIcons/editIcon2.svg', 24, 24)}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <div className="flex flex-row gap-3">
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 400,
                              color: 'rgba(0, 0, 0, 0.7)',
                            }}
                          >
                            Call transfer number
                          </div>
                        </div>
                        {renderLiveCallTransferSection({
                          reduxUser,
                          setReduxUser,
                          showDrawerSelectedAgent,
                          setShowEditNumberPopup,
                          setSelectedNumber,
                        })}
                      </div>
                      </div>
                    </div>

                    <div className="w-full">
                      <EditPhoneNumberModal
                        open={showEditNumberPopup}
                        close={() => setShowEditNumberPopup(null)}
                        number={showEditNumberPopup && showEditNumberPopup}
                        title={
                          selectedNumber === 'Callback'
                            ? 'Call Back Number'
                            : 'Call Transfer Number'
                        }
                        loading={loading}
                        isTransfer={selectedNumber === 'Calltransfer'}
                        transferMessage={showDrawerSelectedAgent?.liveTransferMessage}
                        update={async (value, transferMessage) => {
                          let data = ''
                          if (selectedNumber === 'Callback') {
                            data = {
                              callbackNumber: value,
                            }
                          } else {
                            data = {
                              liveTransferNumber: value,
                              ...(transferMessage !== undefined && {
                                liveTransferMessage: transferMessage,
                              }),
                            }
                          }
                          console.log('data passed is', data);
                          // return
                          setLoading(true)
                          await updateSubAgent(data)
                          setLoading(false)
                          setShowEditNumberPopup(null)
                        }}
                      />
                    </div>
                  </div>
                ) : activeTab === 'Actions' ? (
                  !allowToolsAndActions &&
                    reduxUser?.userRole !== 'AgencySubAccount' ? (
                    <UpgardView
                      setShowSnackMsg={setShowSnackMsg}
                      title={'Unlock Actions'}
                      subTitle={
                        'Upgrade to enable AI booking, calendar sync, and advanced tools to give you AI like Gmail, Hubspot and 10k+ tools.'
                      }
                    />
                  ) : (
                    <div className="w-full">
                      <div
                        className=" lg:flex hidden  xl:w-[350px] lg:w-[350px]"
                        style={
                          {
                            // backgroundColor: "red"
                          }
                        }
                      ></div>

                      <ActionsTab
                        calendarDetails={calendarDetails}
                        setUserDetails={setMainAgentsList}
                        selectedAgent={showDrawerSelectedAgent}
                        setSelectedAgent={setShowDrawerSelectedAgent}
                        mainAgentId={MainAgentId}
                        previousCalenders={previousCalenders}
                        updateVariableData={updateAfterAddCalendar}
                        setShowUpgradeModal={setShowUpgradeModal}
                        activeTab={activeTab}
                        showDrawerSelectedAgent={showDrawerSelectedAgent}
                        setShowAddScoringModal={setShowAddScoringModal}
                        setShowDrawerSelectedAgent={setShowDrawerSelectedAgent}
                        setShowSnackMsg={setShowSnackMsg}
                      />

                      {/* Calendar Section 
                  <UserCalender
                    calendarDetails={calendarDetails}
                    setUserDetails={setMainAgentsList}
                    selectedAgent={showDrawerSelectedAgent}
                    setSelectedAgent={setShowDrawerSelectedAgent}
                    mainAgentId={MainAgentId}
                    previousCalenders={previousCalenders}
                    updateVariableData={updateAfterAddCalendar}
                    setShowUpgradeModal={setShowUpgradeModal}
                  />*/}

                      {/* Lead Scoring Section 
                  <LeadScoring
                    activeTab={activeTab}
                    showDrawerSelectedAgent={showDrawerSelectedAgent}
                    setShowAddScoringModal={setShowAddScoringModal}

                  />*/}
                    </div>
                  )
                ) : activeTab === 'Pipeline' ? (
                  <div className="flex flex-col gap-4">
                    <PiepelineAdnStage
                      selectedAgent={showDrawerSelectedAgent}
                      UserPipeline={UserPipeline}
                      mainAgent={calendarDetails}
                      selectedUser={reduxUser}
                    />
                  </div>
                ) : activeTab === 'Knowledge' ? (
                  user?.agencyCapabilities?.allowKnowledgeBases === false ? (
                    <UpgardView
                      setShowSnackMsg={setShowSnackMsg}
                      title={'Unlock Knowledge Base'}
                      subTitle={
                        'Upgrade to enable custom knowledge bases and document uploads for your AI agents.'
                      }
                    />
                  ) : !allowKnowledgeBases ? (
                    <UpgardView
                      setShowSnackMsg={setShowSnackMsg}
                      title={'Unlock Knowledge Base'}
                      subTitle={
                        'Upgrade to enable custom knowledge bases and document uploads for your AI agents.'
                      }
                    />
                  ) : (
                    <div className="flex flex-col gap-4">
                      <Knowledgebase
                        user={reduxUser}
                        agent={showDrawerSelectedAgent}
                        setShowUpgradeModal={setShowUpgradeModal}
                      />
                    </div>
                  )
                ) : activeTab === 'Voicemail' ? (
                  user?.agencyCapabilities?.allowVoicemail === false ? (
                    <UpgardView
                      setShowSnackMsg={setShowSnackMsg}
                      title={'Unlock Voicemail'}
                      subTitle={
                        'Upgrade to enable voicemail features for your outbound agents.'
                      }
                    />
                  ) : !allowVoicemail ? (
                    <UpgardView
                      setShowSnackMsg={setShowSnackMsg}
                      title={'Unlock Voicemail'}
                      subTitle={
                        'Upgrade to enable voicemail features for your outbound agents.'
                      }
                    />
                  ) : (
                    <div className="flex flex-col gap-4 w-full">
                      <VoiceMailTab
                        setMainAgentsList={setMainAgentsList}
                        agent={showDrawerSelectedAgent}
                        setShowDrawerSelectedAgent={setShowDrawerSelectedAgent}
                        kycsData={kycsData}
                        uniqueColumns={uniqueColumns}
                        onSaveVoicemailAdvancedSettings={(voicemailDetection) => {
                          const existing = showDrawerSelectedAgent?.additionalSettings || {}
                          updateSubAgent({
                            additionalSettings: {
                              ...existing,
                              voicemailDetection,
                            },
                          })
                        }}
                      />
                    </div>
                  )
                ) : (
                  ''
                )}
              </div>

              {/* Footer: primary actions */}
              <footer className="flex-shrink-0 w-full border-t border-[#eaeaea] px-4 py-3 bg-white">
                <div className="w-full flex flex-row items-center justify-end">
                  <button
                    className="flex flex-row gap-2 items-center"
                    onClick={() => {
                      setDelAgentModal(true)
                    }}
                    style={
                      {
                        // // marginTop: 20,
                        // alignSelf: "end",
                        // position: "absolute",
                        // bottom: "7%",
                      }
                    }
                  >
                    {/* <Image src={'/otherAssets/redDeleteIcon.png'}
                height={24}
                width={24}
                alt='del'
              /> */}

                    <Image
                      src={'/otherAssets/redDeleteIcon.png'}
                      height={24}
                      width={24}
                      alt="del"
                      style={{
                        filter: 'brightness(0) saturate(100%) opacity(0.5)', // Convert to black and make semi-transparent
                      }}
                    />

                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: '600',
                        color: '#15151590',
                        textDecorationLine: 'underline',
                      }}
                    >
                      Delete Agent
                    </div>
                  </button>
                </div>
              </footer>
            </div>
          </Drawer>
          {/* Code to del agent */}
          <Modal
            open={delAgentModal}
            onClose={() => {
              setDelAgentModal(false)
            }}
            BackdropProps={{
              timeout: 200,
              sx: {
                backgroundColor: '#00000020',
                // //backdropFilter: "blur(20px)",
              },
            }}
          >
            <Box
              className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 p-8 rounded-[15px]"
              sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}
            >
              <div style={{ width: '100%' }}>
                <div
                  className="max-h-[60vh] overflow-auto"
                  style={{ scrollbarWidth: 'none' }}
                >
                  <div
                    style={{
                      width: '100%',
                      direction: 'row',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    {/* <div style={{ width: "20%" }} /> */}
                    <div style={{ fontWeight: '500', fontSize: 17 }}>
                      Delete Agent
                    </div>
                    <div
                      style={{
                        direction: 'row',
                        display: 'flex',
                        justifyContent: 'end',
                      }}
                    >
                      <button
                        onClick={() => {
                          setDelAgentModal(false)
                        }}
                        className="outline-none"
                      >
                        <Image
                          src={'/assets/crossIcon.png'}
                          height={40}
                          width={40}
                          alt="*"
                        />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6" style={{ fontWeight: '700', fontSize: 22 }}>
                    This is irreversible. Are you sure?
                  </div>
                </div>

                <div className="flex flex-row items-center gap-4 mt-6">
                  <button
                    className="w-1/2 flex items-center justify-center h-[50px] rounded-lg bg-muted px-3 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors duration-150 active:scale-[0.98] outline-none"
                    onClick={() => setDelAgentModal(false)}
                  >
                    Cancel
                  </button>
                  <div className="w-1/2">
                    {DelLoader ? (
                      <div className="flex flex-row iems-center justify-center w-full mt-4">
                        <CircularProgress size={25} />
                      </div>
                    ) : (
                      <button
                        className="w-full flex items-center justify-center h-[50px] rounded-lg bg-red px-3 text-sm font-medium text-white hover:opacity-90 transition-colors duration-150 active:scale-[0.98] outline-none"
                        onClick={handleDeleteAgent}
                      >
                        Yes! Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Box>
          </Modal>
          {/*  Test comment */}
          {/* Code for the confirmation of reassign button */}
          <Modal
            open={showConfirmationModal}
            onClose={() => {
              setShowConfirmationModal(null)
            }}
            BackdropProps={{
              timeout: 100,
              sx: {
                backgroundColor: '#00000020',
                // //backdropFilter: "blur(20px)",
              },
            }}
          >
            <Box
              className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-5/12 p-8 rounded-[15px]"
              sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}
            >
              <div style={{ width: '100%' }}>
                <div
                  className="max-h-[60vh] overflow-auto"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {/* <div style={{ width: "100%", direction: "row", display: "flex", justifyContent: "end", alignItems: "center" }}>
                <div style={{ direction: "row", display: "flex", justifyContent: "end" }}>
                  <button onClick={() => {
                    setShowWarningModal(false);
                  }} className='outline-none'>
                    <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                  </button>
                </div>
              </div> */}

                  <div className="flex flex-row items-center justify-between w-full">
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: '600',
                      }}
                    >
                      Reassign Number
                    </div>
                    <CloseBtn
                      onClick={() => {
                        setShowConfirmationModal(null)
                      }}
                    />
                  </div>

                  <div
                    className="mt-8"
                    style={{
                      fontSize: 22,
                      fontWeight: '600',
                    }}
                  >
                    Confirm Action
                  </div>

                  <p
                    className="mt-8"
                    style={{
                      fontSize: 15,
                      fontWeight: '500',
                    }}
                  >
                    Please confirm you would like to reassign{' '}
                    <span className="text-brand-primary">
                      {formatPhoneNumber(showConfirmationModal?.phoneNumber)}
                    </span>{' '}
                    to {showDrawerSelectedAgent?.name}.
                    {/* {`{${showDrawer?.name}}`}. */}
                  </p>
                </div>

                <div className="flex flex-row items-center gap-4 mt-6">
                  <button
                    className="w-1/2 flex items-center justify-center h-[50px] rounded-lg bg-muted px-3 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors duration-150 active:scale-[0.98] outline-none"
                    onClick={() => {
                      setShowClaimPopup(null)
                      setAssignNumber(showDrawerSelectedAgent?.phoneNumber || '')
                      setShowConfirmationModal(false)
                    }}
                  >
                    Discard
                  </button>
                  <div className="w-full">
                    {reassignLoader ? (
                      <div className="mt-4 w-full flex flex-row items-center justify-center">
                        <CircularProgress size={25} />
                      </div>
                    ) : (
                      <button
                        className="w-full flex items-center justify-center h-[50px] rounded-lg bg-brand-primary px-3 text-sm font-medium text-white hover:opacity-90 transition-colors duration-150 active:scale-[0.98] outline-none"
                        onClick={() => {
                          handleReassignNumber(showConfirmationModal)
                          ////console.log
                        }}
                      >
                        {`I'm sure`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Box>
          </Modal>
          {/* code for script */}
          <Modal
            open={showScriptModal}
            onClose={() => {
              handleCloseScriptModal()
            }}
            BackdropProps={{
              timeout: 100,
              sx: {
                backgroundColor: '#00000099',
                // //backdropFilter: "blur(20px)",
              },
            }}
          >
            <Box
              className="w-8/12 h-[90%] sm:w-[608px] p-0 rounded-xl"
              sx={{ ...styles.modalsStyle, backgroundColor: 'white', padding: 0 }}
            >
              <div style={{ width: '100%' }}>
                <div className="h-[90vh] text-sm flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-200 ease-out" style={{ scrollbarWidth: 'none', fontSize: 14 }}>
                  <div
                    className="w-full py-3 px-4 border-b flex flex-row items-center justify-between max-h-[54px]"
                    style={{ borderBottomColor: '#eaeaea' }}
                  >
                    {/* <div style={{ width: "20%" }} /> */}
                    <div style={{ fontWeight: '600', fontSize: 18 }}>
                      {showScriptModal?.name?.slice(0, 1).toUpperCase(0)}
                      {showScriptModal?.name?.slice(1)}
                    </div>
                    <div
                      style={{
                        direction: 'row',
                        display: 'flex',
                        justifyContent: 'end',
                      }}
                    >
                      <CloseBtn
                        onClick={handleCloseScriptModal}
                        className="h-9 w-9 shrink-0 rounded-lg hover:bg-black/[0.06]"
                        iconSize={12}
                        aria-label="Close modal"
                      />
                    </div>
                  </div>

                  <div
                    className="mt-2 flex flex-row items-center gap-6 w-full border-b border-border px-4 h-11 min-h-0"
                    style={{ borderBottomColor: 'hsl(var(--border))', fontSize: 14 }}
                    role="tablist"
                    aria-label="Script sections"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={showScript}
                      className="flex flex-row items-center gap-2 h-11 px-1 -mb-px rounded-none border-b-2 border-transparent bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                      style={{
                        borderBottomColor: showScript ? 'hsl(var(--brand-primary))' : 'transparent',
                        color: showScript ? 'hsl(var(--brand-primary))' : undefined,
                      }}
                      onClick={handleShowScript}
                    >
                      Script
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={SeledtedScriptKYC}
                      className="flex flex-row items-center gap-2 h-11 px-1 -mb-px rounded-none border-b-2 border-transparent bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                      style={{
                        borderBottomColor: SeledtedScriptKYC ? 'hsl(var(--brand-primary))' : 'transparent',
                        color: SeledtedScriptKYC ? 'hsl(var(--brand-primary))' : undefined,
                      }}
                      onClick={handleShowKycs}
                    >
                      KYC
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={SeledtedScriptAdvanceSetting}
                      className="flex flex-row items-center gap-2 h-11 px-1 -mb-px rounded-none border-b-2 border-transparent bg-transparent font-medium text-sm text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                      style={{
                        borderBottomColor: SeledtedScriptAdvanceSetting ? 'hsl(var(--brand-primary))' : 'transparent',
                        color: SeledtedScriptAdvanceSetting ? 'hsl(var(--brand-primary))' : undefined,
                      }}
                      onClick={handleShowAdvanceSeting}
                    >
                      Advanced Settings
                    </button>
                  </div>

                  {showScript && (
                    <div className="flex-1 min-h-0 h-full flex flex-col" style={{ borderWidth: 0 }}>
                        <div className="flex-1 min-h-0 h-full flex flex-col" style={{ borderWidth: 0 }}>
                        <div className="flex-1 min-h-0 h-full overflow-auto flex flex-col gap-3 px-4 py-[2px] text-sm">
                        <div className="rounded-[1px] border-l-4 border-brand-primary bg-primary/5 p-3 mt-2">
                          <div className="flex flex-row items-center gap-2 text-sm font-medium text-foreground">
                            <Info size={20} weight="fill" className="text-brand-primary flex-shrink-0" />
                            Editing Tips
                          </div>
                          <div className="flex flex-row flex-wrap gap-2 text-sm text-muted-foreground mt-1">
                            <div>You can use these variables:</div>
                            {/* <div className='flex flex-row items-center gap-2'> */}
                            <div
                              style={{ width: 'fit-content' }}
                              className="text-brand-primary flex flex-row gap-2"
                            >
                              {`{Address}`},{`{Phone}`}, {`{Email}`},{`{Kyc}`}
                              {/* {`{First Name}`}, {`{Email}`}, */}
                            </div>

                            {uniqueColumns?.length > 0 && showMoreUniqueColumns ? (
                              <div className="flex flex-row flex-wrap gap-2">
                                {uniqueColumns.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex flex-row items-center gap-2 text-brand-primary"
                                  >
                                    {`{${item}}`},
                                  </div>
                                ))}
                                <button
                                  className="text-brand-primary outline-none"
                                  onClick={handleShowUniqueCols}
                                >
                                  show less
                                </button>
                              </div>
                            ) : (
                              <div>
                                {uniqueColumns?.length > 0 && (
                                  <button
                                    className="text-brand-primary flex flex-row items-center font-bold outline-none"
                                    onClick={() => {
                                      handleShowUniqueCols()
                                    }}
                                  >
                                    <Plus
                                      weight="bold"
                                      size={15}
                                      style={{
                                        strokeWidth: 40, // Adjust as needed
                                      }}
                                    />
                                    {uniqueColumns?.length}
                                  </button>
                                )}
                              </div>
                            )}

                            {/* </div> */}
                          </div>
                        </div>

                        <div className="w-full h-full flex flex-col gap-3 [&_input]:h-[40px] [&_input]:min-h-[40px] [&_input]:rounded-lg [&_input]:border [&_input]:border-[#e5e7eb] [&_input]:px-3 [&_input]:py-2.5 [&_input]:text-sm [&_input]:outline-none [&_input]:transition-colors [&_input]:focus:border-brand-primary [&_input]:focus:ring-2 [&_input]:focus:ring-brand-primary/20 [&_input]:hover:border-gray-300 [&_input]:hover:bg-gray-50/30 [&_textarea]:min-h-[40px] [&_textarea]:w-full [&_textarea]:flex-1 [&_textarea]:min-h-0 [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-[#e5e7eb] [&_textarea]:px-3 [&_textarea]:py-2.5 [&_textarea]:text-sm [&_textarea]:font-normal [&_textarea]:text-black/80 [&_textarea]:outline-none [&_textarea]:transition-colors [&_textarea]:focus:border-brand-primary [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-brand-primary/20 [&_textarea]:hover:border-gray-300">
                          <div className="flex w-full">
                            <VideoCard
                              duration={getTutorialByType(HowToVideoTypes.Script)?.description || '13:56'}
                              width="120"
                              height="120"
                              horizontal={false}
                              playVideo={() => {
                                setIntroVideoModal(true)
                              }}
                              title={getTutorialByType(HowToVideoTypes.Script)?.title || 'Learn how to customize your script'}
                            />
                          </div>

                          {/* <div
                        className="mt-4"
                        style={{ fontSize: 24, fontWeight: "700" }}
                      >
                        Script
                      </div> */}

                          <div
                            style={{ fontSize: 14, fontWeight: '700' }}
                            className="flex flex-row items-center center w-full justify-between"
                          >
                            <div>Script</div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="flex flex-row items-center justify-between">
                              <div
                                className="mt-2 pt-3"
                                style={{ fontSize: 18, color: '#000000', fontWeight: 400 }}
                              >
                                Greeting
                              </div>

                              <button
                                className="flex flex-row items-center gap-1 h-[28px] rounded-lg bg-white text-brand-primary px-3 font-medium text-sm hover:opacity-90 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 outline-none transition-all duration-150 [&_svg]:text-brand-primary"
                                onClick={() => {
                                  const scriptBuilderUrl =
                                    reduxUser?.agencySettings?.scriptWidgetUrl ||
                                    reduxUser?.userSettings?.scriptWidgetUrl ||
                                    PersistanceKeys.DefaultScriptBuilderUrl
                                  window.open(scriptBuilderUrl, '_blank')
                                }}
                              >
                                Use {reduxUser?.agencySettings?.scriptWidgetTitle ?? reduxUser?.userSettings?.scriptWidgetTitle ?? 'Script Builder'}
                                <ArrowUpRight size={14} />
                              </button>
                            </div>

                            <div className="mt-0">
                              <GreetingTagInput
                              greetTag={showScriptModal?.prompt?.greeting}
                              kycsList={kycsData}
                              uniqueColumns={uniqueColumns}
                              tagValue={(text) => {
                                setGreetingTagInput(text)
                                let agent = showScriptModal
                                agent.prompt.greeting = text
                                setShowScriptModal(agent)
                              }}
                              scrollOffset={scrollOffset}
                            />
                            </div>
                          </div>
                          <div className="mt-4 w-full ">
                            <PromptTagInput
                              promptTag={scriptTagInput}
                              kycsList={kycsData}
                              from={'Prompt'}
                              uniqueColumns={uniqueColumns}
                              tagValue={(text) => {
                                // console.log("Text updated ", text);
                                setScriptTagInput(text)
                                // let agent = showScriptModal;
                                // agent.prompt.callScript = text;
                                // setShowScriptModal(agent);
                              }}
                              scrollOffset={scrollOffset}
                              showSaveChangesBtn={showSaveChangesBtn}
                              saveUpdates={async () => {
                                await updateAgent()
                                setShowSaveChangesBtn(false)
                                setOldScriptTagInput(scriptTagInput)
                              }}
                            />

                            {/* <DynamicDropdown /> */}
                          </div>
                        </div>
                        </div>
                      </div>

                      <div className="absolute bottom-2 right-7 left-7" style={{}}>
                        {showSaveChangesBtn && (
                          <div className="w-full">
                            {UpdateAgentLoader ? (
                              <div className="w-full flex flex-row mt-6 justify-center">
                                <CircularProgress size={35} />
                              </div>
                            ) : (
                              <button
                                className="bg-brand-primary w-full h-[50px] rounded-xl text-white"
                                style={{ fontWeight: '600', fontSize: 15 }}
                                onClick={async () => {
                                  await updateAgent()
                                  setShowScriptModal(null)
                                  setGreetingTagInput('')
                                  setScriptTagInput('')
                                  setShowScript(false)
                                  setSeledtedScriptKYC(false)
                                  setSeledtedScriptAdvanceSetting(false)
                                  setShowSaveChangesBtn(false)
                                  setShowObjectionsSaveBtn(false)
                                }}
                              >
                                Save Changes
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {SeledtedScriptAdvanceSetting && (
                    <div className="px-4 flex flex-col gap-1 py-[2px] flex-1 min-h-0 overflow-hidden" style={{ height: '80%' }}>
                      <div
                        className="flex flex-row items-center mt-2 rounded-xl p-1 gap-0 min-w-[400px] max-w-[400px] mx-auto h-10 flex-shrink-0"
                        style={{
                          backgroundColor: '#F2F2F2',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        }}
                        role="tablist"
                        aria-label="Objective, Guardrails, Objections"
                      >
                        <button
                          type="button"
                          role="tab"
                          aria-selected={showObjectives}
                          className="flex-1 min-w-0 h-full rounded-lg font-medium text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 transition-all"
                          style={{
                            backgroundColor: showObjectives ? '#FFFFFF' : 'transparent',
                            color: showObjectives ? '#333333' : '#828282',
                            boxShadow: showObjectives ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                          }}
                          onClick={handleShowObjectives}
                        >
                          Objective
                        </button>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={showGuardrails}
                          className="flex-1 min-w-0 h-full rounded-lg font-medium text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 transition-all"
                          style={{
                            backgroundColor: showGuardrails ? '#FFFFFF' : 'transparent',
                            color: showGuardrails ? '#333333' : '#828282',
                            boxShadow: showGuardrails ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                          }}
                          onClick={handleShowGuardrails}
                        >
                          Guardrails
                        </button>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={showObjection}
                          className="flex-1 min-w-0 h-full rounded-lg font-medium text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 transition-all"
                          style={{
                            backgroundColor: showObjection ? '#FFFFFF' : 'transparent',
                            color: showObjection ? '#333333' : '#828282',
                            boxShadow: showObjection ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                          }}
                          onClick={handleShowObjection}
                        >
                          Objections
                        </button>
                      </div>

                      {showObjection && (
                        <div className="flex-1 min-h-0 flex flex-col overflow-auto">
                          <div className="flex-1 min-h-0 mt-2 overflow-auto">
                            <Objection
                              showTitle={true}
                              selectedAgentId={showScriptModal}
                              kycsData={kycsData}
                              uniqueColumns={uniqueColumns}
                            />
                          </div>
                        </div>
                      )}

                      {showGuardrails && (
                        <div className="flex-1 min-h-0 flex flex-col overflow-auto">
                          <div className="flex-1 min-h-0 mt-2 overflow-auto">
                            <GuarduanSetting
                              showTitle={true}
                              selectedAgentId={showScriptModal}
                              kycsData={kycsData}
                              uniqueColumns={uniqueColumns}
                            />
                          </div>
                        </div>
                      )}

                      {showObjectives && (
                        <div className="flex-1 min-h-0 flex flex-col overflow-auto">
                          <div className="flex-1 min-h-0 mt-2 overflow-auto flex flex-col">
                            {/* {showScriptModal?.prompt?.objective} */}

                            {/* {
                          <textarea
                            className="outline-none rounded-xl focus:ring-0"
                            // ref={objective}
                            value={objective}
                            onChange={(e) => {
                              const value = e.target.value;
                              setObjective(value);
                            }}
                            placeholder="Add Objective"
                            style={{
                              fontSize: 14,
                              padding: "15px",
                              width: "100%",
                              fontWeight: 400,
                              height: "100%", // Initial height
                              maxHeight: "100%", // Maximum height before scrolling
                              overflowY: "auto", // Enable vertical scrolling when max-height is exceeded
                              resize: "none", // Disable manual resizing
                              border: "1px solid #00000020",
                            }}
                          />
                        } */}

                            <div className="mt-2 flex-1 min-h-0 flex flex-col w-full">
                              <PromptTagInput
                                promptTag={objective}
                                kycsList={kycsData}
                                uniqueColumns={uniqueColumns}
                                tagValue={setObjective}
                                scrollOffset={scrollOffset}
                                showSaveChangesBtn={showObjectionsSaveBtn}
                                from={'Objective'}
                                fillHeight
                                saveUpdates={async () => {
                                  await updateAgent()
                                  setShowObjectionsSaveBtn(false)
                                  setOldObjective(objective)
                                }}
                              />

                              {/* <DynamicDropdown /> */}
                            </div>

                            <div>
                              {showObjectionsSaveBtn && (
                                <div>
                                  {UpdateAgentLoader ? (
                                    <div className="w-full flex flex-row justify-center">
                                      <CircularProgress size={35} />
                                    </div>
                                  ) : (
                                    <button
                                      className="bg-brand-primary w-full h-[50px] rounded-xl mb-2 text-white"
                                      style={{ fontWeight: '600', fontSize: 15 }}
                                      onClick={async () => {
                                        await updateAgent()
                                        setShowObjectionsSaveBtn(false)
                                        setOldObjective(objective)
                                      }}
                                    >
                                      Save Changes
                                    </button>
                                  )}
                                </div>
                              )}


                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {SeledtedScriptKYC && (
                    <div
                      className="px-4 flex flex-col gap-2 py-[2px] flex-1 min-h-0"
                      style={{
                        height: '80%',
                        overflow: 'auto',
                        scrollbarWidth: 'none',
                        backgroundColor: '',
                      }}
                    >
                      <div className="h-full min-h-0 flex flex-col">
                      <KYCs
                        kycsDetails={setKycsData}
                        mainAgentId={MainAgentId}
                        user={user && user}
                      />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Box>
          </Modal>
          {/* Modal for video */}
          <IntroVideoModal
            open={introVideoModal}
            onClose={() => setIntroVideoModal(false)}
            videoTitle={
              getTutorialByType(HowToVideoTypes.Script)?.title ||
              'Learn how to customize your script'
            }
            videoUrl={
              getVideoUrlByType(HowToVideoTypes.Script) || HowtoVideos.script
            }
          />
          <IntroVideoModal
            open={introVideoModal2}
            onClose={() => setIntroVideoModal2(false)}
            videoTitle="Learn how to add a calendar"
            videoUrl={HowtoVideos.Calendar}
          />
          {showClaimPopup && (
            <ClaimNumber
              showClaimPopup={showClaimPopup}
              handleCloseClaimPopup={handleCloseClaimPopup}
              setOpenCalimNumDropDown={setOpenCalimNumDropDown}
              setSelectNumber={setAssignNumber}
              setPreviousNumber={setPreviousNumber}
              previousNumber={previousNumber}
              AssignNumber={AssignNumber}
            />
          )}
          <AdvancedSettingsModalCN
            open={showAdvancedSettingsModal}
            onOpenChange={setShowAdvancedSettingsModal}
            onSave={handleSaveAdvancedSettings}
            initialValues={{
              maxDurationSeconds: showDrawerSelectedAgent?.maxDurationSeconds ?? 600,
              idleTimeoutSeconds: showDrawerSelectedAgent?.idleTimeoutSeconds ?? 10,
              idleMessage: showDrawerSelectedAgent?.idleMessage ?? 'Are you still there?',
            }}
            loading={advancedSettingsLoader}
          />
          {/* Web Agent Modals */}
          <WebAgentModal
            open={showWebAgentModal}
            onClose={() => setShowWebAgentModal(false)}
            agentName={selectedAgentForWebAgent?.name || ''}
            modelId={
              selectedAgentForWebAgent?.modelIdVapi ||
              selectedAgentForWebAgent?.agentUuid ||
              ''
            }
            agentId={
              selectedAgentForWebAgent?.id || selectedAgentForWebAgent?.modelIdVapi
            }
            onOpenAgent={handleOpenAgentInNewTab}
            onShowNewSmartList={handleShowNewSmartList}
            agentSmartRefill={selectedAgentForWebAgent?.smartListId}
            fetureType={fetureType}
            onCopyUrl={handleWebhookClick}
            selectedSmartList={selectedSmartList}
            setSelectedSmartList={setSelectedSmartList}
            agent={selectedAgentForWebAgent} // Pass full agent object
            onAgentUpdate={(updatedAgent) => {
              // Update the agent state when smartlist is attached/detached
              setSelectedAgentForWebAgent(updatedAgent)

              // Also update in mainAgentsList and localStorage
              // CRITICAL: Use numeric ID only - never use modelIdVapi as it could match wrong agent
              const agentIdToUpdate = updatedAgent?.id
              if (agentIdToUpdate && typeof agentIdToUpdate === 'number') {
                // Determine which fields were updated
                const updates = {}
                if (updatedAgent.smartListIdForWeb !== undefined) {
                  updates.smartListIdForWeb = updatedAgent.smartListIdForWeb
                }
                if (updatedAgent.smartListEnabledForWeb !== undefined) {
                  updates.smartListEnabledForWeb = updatedAgent.smartListEnabledForWeb
                }
                if (updatedAgent.smartListIdForWebhook !== undefined) {
                  updates.smartListIdForWebhook = updatedAgent.smartListIdForWebhook
                }
                if (updatedAgent.smartListEnabledForWebhook !== undefined) {
                  updates.smartListEnabledForWebhook = updatedAgent.smartListEnabledForWebhook
                }
                if (Object.keys(updates).length > 0) {
                  updateAgentInMainList(agentIdToUpdate, updates)
                }
              }
            }}
          />
          <NewSmartListModal
            open={showNewSmartListModal}
            onClose={() => setShowNewSmartListModal(false)}
            agentId={
              selectedAgentForWebAgent?.id || selectedAgentForWebAgent?.modelIdVapi
            }
            onSuccess={handleSmartListCreated}
            agentType={fetureType === 'webhook' ? 'webhook' : 'web'} // Pass agentType
          />
          <AllSetModal
            open={showAllSetModal}
            onClose={handleCloseAllSetModal}
            agentName={selectedAgentForWebAgent?.name || ''}
            onOpenAgent={handleOpenAgentInNewTab}
            fetureType={fetureType}
            onCopyUrl={handleWebhookClick}
          />
          {/* Embed Modals */}
          <EmbedModal
            open={showEmbedModal}
            onClose={() => setShowEmbedModal(false)}
            agentName={selectedAgentForEmbed?.name || ''}
            agentId={
              selectedAgentForEmbed?.id || selectedAgentForEmbed?.modelIdVapi
            }
            agentSmartRefill={selectedAgentForEmbed?.smartListIdForEmbed || selectedAgentForEmbed?.smartListId} // Use embed-specific field
            onShowSmartList={handleShowEmbedSmartList}
            agent={selectedAgentForEmbed}
            onAgentUpdate={(updatedAgent) => {
              // Update the agent state when smartlist is attached
              setSelectedAgentForEmbed(updatedAgent)

              // Also update in mainAgentsList and localStorage
              // CRITICAL: Use numeric ID only - never use modelIdVapi as it could match wrong agent
              const agentIdToUpdate = updatedAgent?.id
              if (agentIdToUpdate && typeof agentIdToUpdate === 'number') {
                // Determine which fields were updated
                const updates = {}
                if (updatedAgent.smartListIdForEmbed !== undefined) {
                  updates.smartListIdForEmbed = updatedAgent.smartListIdForEmbed
                }
                if (updatedAgent.smartListEnabledForEmbed !== undefined) {
                  updates.smartListEnabledForEmbed = updatedAgent.smartListEnabledForEmbed
                }
                if (Object.keys(updates).length > 0) {
                  updateAgentInMainList(agentIdToUpdate, updates)
                }
              }
            }}
            onShowAllSet={() => {
              setShowEmbedModal(false)
              setShowEmbedAllSetModal(true)
              const code = `<iframe src="${baseUrl}embed/support/${selectedAgentForEmbed ? selectedAgentForEmbed?.modelIdVapi : DEFAULT_ASSISTANT_ID}" style="position: fixed; bottom: 0; right: 0; width: 320px; 
  height: 100vh; border: none; background: transparent; z-index: 
  9999; pointer-events: none;" allow="microphone" onload="this.style.pointerEvents = 'auto';">
  </iframe>`
              setEmbedCode(code)
            }}
          />
          <EmbedSmartListModal
            open={showEmbedSmartListModal}
            onClose={() => setShowEmbedSmartListModal(false)}
            agentId={
              selectedAgentForEmbed?.id ?? selectedAgentForEmbed?.modelIdVapi
            }
            onSuccess={handleEmbedSmartListCreated}
            fetureType={fetureType}
            agent={selectedAgentForEmbed}
          />
          <AllSetModal
            open={showEmbedAllSetModal}
            onClose={handleCloseEmbedAllSetModal}
            agentName={selectedAgentForEmbed?.name || ''}
            isEmbedFlow={true}
            embedCode={embedCode}
          // fetureType={fetureType}
          // onCopyUrl={handleWebhookClick}
          />
        </div>
      </ProtectedRoute>
    </PermissionProvider>
  );
}

const Card = ({ name, value, icon, bgColor, iconColor, isCustomDomain, agencyBranding }) => {
  // Render icon with branding using mask-image approach (same logic as NotificationsDrawer.js)
  const renderIcon = () => {
    if (typeof window === 'undefined') {
      return <Image src={icon} height={24} width={24} alt="icon" />
    }

    // Get brand color from CSS variable
    const root = document.documentElement
    const brandColor = getComputedStyle(root).getPropertyValue('--brand-primary')?.trim()

    // Only apply branding if brand color is set and valid (indicates custom domain with branding)
    if (!brandColor || brandColor === '' || brandColor.length < 3) {
      return <Image src={icon} height={24} width={24} alt="icon" />
    }

    // Use mask-image approach: background color with icon as mask
    return (
      <div
        style={{
          width: 24,
          height: 24,
          minWidth: 24,
          minHeight: 24,
          backgroundColor: `hsl(${brandColor})`,
          WebkitMaskImage: `url(${icon})`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          WebkitMaskMode: 'alpha',
          maskImage: `url(${icon})`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          maskMode: 'alpha',
          transition: 'background-color 0.2s ease-in-out',
          flexShrink: 0,
        }}
      />
    )
  }

  return (
    <div
      className="flex flex-col items-start gap-2"
      style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0, 0, 0, 0.8)' }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center w-[42px] h-[42px] rounded-lg shrink-0"
        style={{ backgroundColor: 'hsl(var(--brand-primary) / 0.05)' }}
      >
        {renderIcon()}
      </div>

      <div style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0, 0, 0, 0.8)' }}>
        {name}
      </div>
      <div style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0, 0, 0, 0.8)' }}>
        {value}
      </div>
    </div>
  )
}

export default Page