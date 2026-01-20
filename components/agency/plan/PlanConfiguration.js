import { Box, CircularProgress, Modal, Switch, Tooltip } from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { useEffect } from 'react'

import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import UpgradePlan from '@/components/userPlans/UpgradePlan'

import {
  formatDecimalValue,
} from '../agencyServices/CheckAgencyData'
import { AuthToken } from './AuthDetails'
import ConfigureSideUI from './ConfigureSideUI'
import PlanFeatures from './PlanFeatures'
import SideUI from './SideUI'
import SubDuration from './SubDuration'

// import { AiOutlineInfoCircle } from 'react-icons/ai';

export default function PlanConfiguration({
  handleClose,
  onPlanCreated,
  canAddPlan,
  agencyPlanCost,
  isEditPlan,
  selectedPlan,
  selectedAgency,
  handleContinue,
  //new props
  open,
  handleBack,
  basicsData,
  configurationData,
  setConfigurationData,
}) {
  //auto scroll to bottom
  const scrollContainerRef = useRef(null)

  //bannar and loaders
  const [showTrailWarning, setShowTrailWarning] = useState(false)
  const [createPlanLoader, setCreatePlanLoader] = useState(false)
  const [snackMsg, setSnackMsg] = useState(null)
  const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Error)
  const [snackBannerMsg, setSnackBannerMsg] = useState(null)
  const [snackBannerMsgType, setSnackBannerMsgType] = useState(
    SnackbarTypes.Error,
  )
  const [trialDaysError, setTrialDaysError] = useState(false)

  //new variables
  const [noOfAgents, setNoOfAgents] = useState('')
  const [costPerAdditionalAgent, setCostPerAdditionalAgent] = useState('')
  const [noOfContacts, setNoOfContacts] = useState('')
  const [noOfSeats, setNoOfSeats] = useState('')
  const [costPerAdditionalSeat, setCostPerAdditionalSeat] = useState('')
  const [language, setLanguage] = useState('english')
  const [languageTitle, setLanguageTitle] = useState(
    'English and Spanish Compatible',
  )
  const [trialValidForDays, setTrialValidForDays] = useState('')
  //upgrade Plan popup variable
  const [showUpgradePlanPopup, setShowUpgradePlanPopup] = useState(false)
  const [currentAgencyPlan, setCurrentAgencyPlan] = useState(null)
  //custom features
  const [customFeatures, setCustomFeatures] = useState([])
  const [allowedFeatures, setAllowedFeatures] = useState([])

  const [features, setFeatures] = useState({
    allowLanguageSelection: false,
    toolsActions: false,
    calendars: false,
    liveTransfer: false,
    ragKnowledgeBase: false,
    embedBrowserWebhookAgent: false,
    apiKey: false,
    voicemail: false,
    allowTextMessages: false,
    allowEmails: false,
    twilio: false,
    sendText: false,
    allowTrial: false,
    allowTeamSeats: false,
    allowLeadSource: false,
  })
  const [agencyAllowedFeatures, setAgencyAllowedFeatures] = useState({
    allowLanguageSelection: false,
    toolsActions: false,
    calendars: false,
    liveTransfer: false,
    ragKnowledgeBase: false,
    embedBrowserWebhookAgent: false,
    apiKey: false,
    voicemail: false,
    allowTextMessages: false,
    allowEmails: false,
    twilio: false,
    allowTrial: true,
    allowTeamSeats: false,
    allowLeadSource: false,
  })

  //features list
  const featuresList = [
    {
      label: 'Multilingual',
      tooltip:
        'Allow the agents to switch between languages in the same conversation',
      stateKey: 'allowLanguageSelection',
    },
    {
      label: 'Tools & Actions',
      tooltip:
        'Bring your AI to work in apps like hubspot, slack, apollo and 10k+ options.', // "Maximize revenue by selling seats per month to any org.",
      stateKey: 'toolsActions',
    },
    {
      label: 'Calendars',
      tooltip: 'Sync calendars for bookings and scheduling.',
      stateKey: 'calendars',
    },
    {
      label: 'Live Transfer',
      tooltip: ' Allow agents to make live transfers.', //"Enable live call transfers between agents.",
      stateKey: 'liveTransfer',
    },
    {
      label: 'RAG Knowledge Base',
      tooltip:
        'Allow users to train agents on their own custom data. Add Youtube videos, website links, documents and more.', //"Use knowledge base for better responses.",
      stateKey: 'ragKnowledgeBase',
    },
    {
      label: 'Web Agents',
      tooltip:
        'Bring AI Agents to browsers and websites using webhooks or embedding.', //"Embed the agent into sites, browsers, or trigger webhooks.",
      stateKey: 'embedBrowserWebhookAgent',
    },
    {
      label: 'Enable API integrations',
      tooltip:
        'Connect your AI agents to external tools like Zapier, Make, GHL and more.',
      stateKey: 'apiKey',
    },
    {
      label: 'Voicemail',
      tooltip: 'Allow agents to leave voicemails', //Enable voicemail recording.
      stateKey: 'voicemail',
    },
    {
      label: 'Twilio',
      tooltip:
        'Import your Twilio phone numbers and access all Trust Hub features to increase answer rate.', //"Integrate with Twilio for calls & SMS.",
      stateKey: 'twilio',
    },
    {
      label: 'Text Messages',
      tooltip: 'Enable SMS/text messaging capabilities for agents.',
      stateKey: 'allowTextMessages',
    },
    {
      label: 'Emails',
      tooltip: 'Enable email messaging capabilities for agents. Allow sending and receiving emails.',
      stateKey: 'allowEmails',
    },
    {
      label: 'Dialer',
      tooltip: 'Enable dialer capabilities for users. Allow teams to make outbound calls.',
      stateKey: 'allowDialer',
    },
    {
      label: 'Lead Scoring',
      tooltip:
        'Enable lead scoring to automatically rate and prioritize leads based on their behavior and engagement.',
      stateKey: 'allowLeadSource',
    },
    {
      // label: "Allow Team Seats",
      label: noOfSeats
        ? `${noOfSeats} Team Seat${noOfSeats > 1 ? 's' : ''}`
        : 'Allow Team Seats',
      tooltip: 'Allow sub accounts to add and invite teams.',
      stateKey: 'allowTeamSeats',
    },
    {
      label: 'Allow Trial',
      tooltip: '', //Allow trial access for users.
      stateKey: 'allowTrial',
    },
  ]

  //reset form when opening for new plan (not edit)
  useEffect(() => {
    if (open && !isEditPlan && !configurationData) {
      setNoOfAgents('')
      setNoOfContacts('')
      setCostPerAdditionalAgent('')
      setCostPerAdditionalSeat('')
      setLanguage('english')
      setLanguageTitle('English and Spanish Compatible')
      setTrialValidForDays('')
      setTrialDaysError(false)
      setFeatures({
        allowLanguageSelection: false,
        toolsActions: false,
        calendars: false,
        liveTransfer: false,
        ragKnowledgeBase: false,
        embedBrowserWebhookAgent: false,
        apiKey: false,
        voicemail: false,
        allowTextMessages: false,
        allowEmails: false,
        allowDialer: false,
        twilio: false,
        sendText: false,
        allowTrial: false,
        allowTeamSeats: false,
        allowLeadSource: false,
      })
      setCustomFeatures([])
      setAllowedFeatures([])
      setNoOfSeats('')
      setCostPerAdditionalSeat('')
    }
  }, [open, isEditPlan, configurationData])

  // Initialize current agency plan when component opens or selectedAgency changes
  useEffect(() => {
    if (open) {
      // Get current agency plan
      if (selectedAgency?.plan) {
        setCurrentAgencyPlan(selectedAgency.plan)
      } else {
        // Get from localStorage (same as fetchAgencyAllowedFeatures)
        const localData = localStorage.getItem('User')
        if (localData) {
          const LD = JSON.parse(localData)
          setCurrentAgencyPlan(LD?.user?.plan || null)
        }
      }
    }
  }, [open, selectedAgency])

  //check for seats features
  useEffect(() => {
    if (costPerAdditionalSeat?.length > 0 && costPerAdditionalSeat > 0) {
      setFeatures({
        ...features,
        allowTeamSeats: true,
      })
    }
  }, [costPerAdditionalSeat])

  useEffect(() => {
    //this might be problematic removing temporarily
    if (!features.allowTeamSeats) {
      setNoOfSeats('')
      setCostPerAdditionalSeat('')
    }

    // const coreFeatures = featuresList
    //     .filter(item => features[item.stateKey])
    //     .map(item => ({
    //         id: item.stateKey,      // stable id
    //         text: item.label,
    //     }));

    const coreFeatures = featuresList
      .filter((item) => item.stateKey !== 'allowTrial') // exclude Allow Trial
      .filter((item) => features[item.stateKey])
      .map((item) => {
        let displayText = item.label
        if (item.label === 'Multilingual') {
          displayText = 'Multilingual Compatible'
        } else if (item.label === 'Twilio') {
          displayText = 'Twilio Trust Hub'
        }
        return {
          id: item.stateKey,
          text: displayText,
        }
      })

    const extraFeatures = []

    if (noOfAgents) {
      extraFeatures.push({
        id: 'agents',
        text: `${noOfAgents} AI Agent${noOfAgents > 1 ? 's' : ''}`,
      })
    }

    if (noOfContacts) {
      extraFeatures.push({
        id: 'contacts',
        text: `${noOfContacts} Contact${noOfContacts > 1 ? 's' : ''}`,
      })
    }

    // if (languageTitle) {
    //     extraFeatures.push({
    //         id: "language",
    //         text: `${languageTitle}`,
    //     });
    // }

    if (basicsData?.minutes) {
      extraFeatures.push({
        id: 'credits',
        text: `${basicsData?.minutes} AI Credits`,
      })
    }
    extraFeatures.push({
      id: 'english&spanish',
      text: 'English and Spanish Compatible',
    })

    // Add custom features to the allowed features
    // const customFeaturesList = customFeatures?.filter(feature => feature.trim() !== "")?.map((feature, index) => ({
    //         id: `custom_${index}`,
    //         text: feature,
    //     }));

    const customFeaturesList = Array.isArray(customFeatures)
      ? customFeatures
          .filter((feature) => feature?.trim?.() !== '')
          .map((feature, index) => ({
            id: `custom_${index}`,
            text: feature,
          }))
      : []

    // console.log("custom features list 2.1", customFeaturesList)

    setAllowedFeatures([
      ...extraFeatures,
      ...coreFeatures,
      ...customFeaturesList,
    ])
  }, [
    features,
    language,
    languageTitle,
    noOfAgents,
    noOfContacts,
    customFeatures,
    noOfSeats,
    basicsData,
  ])

  //auto remove show trial warning
  useEffect(() => {
    if (showTrailWarning) {
      const timer = setTimeout(() => {
        setShowTrailWarning(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [showTrailWarning])

  // scroll when new custom feature is added
  useEffect(() => {
    if (customFeatures?.length > 0) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth',
          })
        }
      }, 100) // small delay ensures input is rendered
    }
  }, [customFeatures])

  //set the values of selected plan to edit plan
  // useEffect(() => {
  //     if (selectedPlan) {
  //         console.log("Selected plan data passed is", selectedPlan);
  //         const dynamicFeatures = selectedPlan?.dynamicFeatures;
  //         setNoOfAgents(dynamicFeatures?.maxAgents);
  //         setNoOfContacts(dynamicFeatures?.maxLeads);
  //         setFeatures({
  //             toolsActions: dynamicFeatures?.allowToolsAndActions || false,
  //             calendars: dynamicFeatures?.allowCalendars || false,
  //             liveTransfer: dynamicFeatures?.allowLiveTransfer || false,
  //             ragKnowledgeBase: dynamicFeatures?.allowRAGKnowledgeBase || false,
  //             embedBrowserWebhookAgent: dynamicFeatures?.allowEmbedBrowserWebhookAgent || false,
  //             apiKey: dynamicFeatures?.allowAPIKey || false,
  //             voicemail: dynamicFeatures?.allowVoicemail || false,
  //             twilio: dynamicFeatures?.allowTwilio || false,
  //             allowTrial: dynamicFeatures?.allowTrial || false,
  //         });
  //         setTrialValidForDays(selectedPlan?.trialValidForDays);
  //     }
  // }, [selectedPlan])

  //set the values of configuration data

  useEffect(() => {
    fetchAgencyAllowedFeatures()
    if (configurationData) {
      const dynamicFeatures = configurationData?.features
      setNoOfAgents(configurationData?.maxAgents)
      setNoOfContacts(configurationData?.maxLeads)
      setCostPerAdditionalAgent(configurationData?.costPerAdditionalAgent)
      setCostPerAdditionalSeat(configurationData?.costPerAdditionalSeat)
      const allowTextMessagesValue =
        dynamicFeatures?.allowTextMessages ||
        dynamicFeatures?.allowTextMessages ||
        false
      const twilioValue =
        dynamicFeatures?.twilio || dynamicFeatures?.allowTwilio || false
      // If Text Messages is enabled, ensure Twilio is also enabled
      const finalTwilioValue = allowTextMessagesValue ? true : twilioValue
      // If Twilio is disabled, ensure Text Messages is also disabled
      const finalAllowTextMessagesValue = twilioValue
        ? allowTextMessagesValue
        : false

      setFeatures({
        // allowLanguageSelection:
        //     dynamicFeatures?.allowLanguageSelection ??
        //     dynamicFeatures?.allowLanguageSwitch ??
        //     (typeof configurationData?.language === "string"
        //         ? configurationData?.language?.toLowerCase() === "multilingual"
        //         : false),
        toolsActions:
          dynamicFeatures?.toolsActions ||
          dynamicFeatures?.allowToolsAndActions ||
          false,
        calendars:
          dynamicFeatures?.calendars ||
          dynamicFeatures?.allowCalendars ||
          false,
        liveTransfer:
          dynamicFeatures?.liveTransfer ||
          dynamicFeatures?.allowLiveTransfer ||
          dynamicFeatures?.allowLiveCallTransfer ||
          false,
        ragKnowledgeBase:
          dynamicFeatures?.ragKnowledgeBase ||
          dynamicFeatures?.allowRAGKnowledgeBase ||
          false,
        embedBrowserWebhookAgent:
          dynamicFeatures?.embedBrowserWebhookAgent ||
          dynamicFeatures?.allowEmbedBrowserWebhookAgent ||
          false,
        apiKey:
          dynamicFeatures?.apiKey || dynamicFeatures?.allowAPIKey || false,
        voicemail:
          dynamicFeatures?.voicemail ||
          dynamicFeatures?.allowVoicemailSettings ||
          false,
        allowTextMessages: finalAllowTextMessagesValue,
        allowEmails:
          dynamicFeatures?.allowEmails ||
          dynamicFeatures?.allowEmailMessages ||
          false,
        allowDialer:
          dynamicFeatures?.allowDialer ||
          dynamicFeatures?.allowDialerCapability ||
          false,
        twilio: finalTwilioValue,
        sendText:
          dynamicFeatures?.sendText ||
          dynamicFeatures?.allowTextMessages ||
          false,
        allowTrial:
          dynamicFeatures?.allowTrial || dynamicFeatures?.allowTrial || false,
        allowTeamSeats:
          dynamicFeatures?.allowTeamSeats ||
          dynamicFeatures?.allowTeamCollaboration ||
          false,
        allowLanguageSelection: dynamicFeatures?.allowLanguageSelection,
        allowLeadSource:
          dynamicFeatures?.allowLeadSource ||
          dynamicFeatures?.allowLeadScoring ||
          false,
      })
      setTrialValidForDays(configurationData?.trialValidForDays)
      setNoOfSeats(configurationData?.noOfSeats)
      setCostPerAdditionalSeat(configurationData?.costPerAdditionalSeat)
      const incomingLanguage =
        typeof configurationData?.language === 'string'
          ? configurationData.language.trim().toLowerCase()
          : 'english'
      const isMultilingual = incomingLanguage === 'multilingual'
      setLanguage(isMultilingual ? 'multilingual' : 'english')
      setLanguageTitle(
        isMultilingual
          ? 'Multilingual Compatible'
          : configurationData?.languageTitle ||
              'English and Spanish Compatible',
      )
      setCustomFeatures(configurationData?.customFeatures || [])
    }
  }, [configurationData])

  useEffect(() => {
    if (!agencyAllowedFeatures.allowLanguageSelection) {
      // setFeatures((prev) => {
      //     if (!prev.allowLanguageSelection) {
      //         return prev;
      //     }
      //     return { ...prev, allowLanguageSelection: false };
      // });
      setLanguage('english')
      setLanguageTitle('English and Spanish Compatible')
    }
  }, [agencyAllowedFeatures.allowLanguageSelection])

  //reset values after plan added
  const handleResetValues = () => {
    setNoOfAgents('')
    setNoOfContacts('')
    setCostPerAdditionalAgent('')
    setCostPerAdditionalSeat('')
    setLanguage('english')
    setLanguageTitle('English and Spanish Compatible')
    setTrialValidForDays('')
    setTrialDaysError(false)
    setFeatures({
      allowLanguageSelection: false,
      toolsActions: false,
      calendars: false,
      liveTransfer: false,
      ragKnowledgeBase: false,
      embedBrowserWebhookAgent: false,
      apiKey: false,
      voicemail: false,
      allowTextMessages: false,
      twilio: false,
      sendText: false,
      allowTrial: false,
      allowTeamSeats: false,
      allowLeadSource: false,
    })
    setCustomFeatures([])
    setAllowedFeatures([])
    setShowUpgradePlanPopup(false)
    setShowTrailWarning(false)
    setCreatePlanLoader(false)
  }

  //function giving api data
  const apiFormData = () => {
    const formData = new FormData()
    formData.append('title', basicsData?.title)
    formData.append('planDescription', basicsData?.planDescription)
    formData.append('originalPrice', basicsData?.originalPrice || 0) //replaced
    // basicsData.discountedPrice is now total price per month (not price per credit)
    formData.append('totalPricePerMonth', basicsData?.discountedPrice)
    // Keep pricePerCredit for backward compatibility (will be ignored if totalPricePerMonth is provided)
    if (selectedAgency) {
      formData.append('userId', selectedAgency.id)
    }
    if (basicsData?.originalPrice > 0) {
      const disCountPercentag = (
        ((basicsData?.originalPrice -
          Number(basicsData?.discountedPrice)) /
          basicsData?.originalPrice) * //replaced - discountedPrice is now total, not per credit
        100
      ).toFixed(2)
      formData.append('percentageDiscount', disCountPercentag)
    } else {
      formData.append('percentageDiscount', 0)
    }
    // formData.append("hasTrial", allowTrial);
    formData.append('isDefault', basicsData?.isDefault)
    // formData.append("trialValidForDays", trialValidForDays);
    // formData.append("trialMinutes", "23");
    formData.append('tag', basicsData?.tag)
    formData.append('subscriptionDuration', basicsData?.planDuration)
    formData.append('credits', basicsData?.minutes)

    formData.append('numberOfAgents', noOfAgents)
    formData.append('numberOfContacts', noOfContacts)
    formData.append('language', language)
    formData.append('teamSeatCount', noOfSeats)
    formData.append('costPerAdditionalAgent', costPerAdditionalAgent)
    formData.append('costPerAdditionalTeamSeat', costPerAdditionalSeat)
    if (features.allowTrial) {
      formData.append('durationOfTrial', trialValidForDays)
    }
    formData.append('allowToolsAndActions', features.toolsActions)
    formData.append('allowCalendars', features.calendars)
    formData.append('allowLiveTransfer', features.liveTransfer)
    formData.append('allowRAGKnowledgeBase', features.ragKnowledgeBase)
    formData.append(
      'allowEmbedBrowserWebhookAgent',
      features.embedBrowserWebhookAgent,
    )
    formData.append('allowAPIKey', features.apiKey)
    formData.append('allowVoicemail', features.voicemail)
    formData.append('allowTextMessages', features.allowTextMessages)
    formData.append('allowEmails', features.allowEmails)
    formData.append('allowDialer', features.allowDialer)
    formData.append('allowTwilio', features.twilio)
    formData.append('allowTrial', features.allowTrial)
    formData.append('allowLeadSource', features.allowLeadSource)
    if (customFeatures?.length > 0) {
      customFeatures?.forEach((feature, index) => {
        formData.append(`customFeatures[${index}]`, feature)
      })
    }

    return formData
  }

  //code to create plan
  const handleCreatePlan = async () => {
    try {
      // Validate profit margin before creating plan - now using price per credit derived from total price
      if (
        basicsData?.discountedPrice &&
        basicsData?.minutes &&
        agencyPlanCost &&
        Number(agencyPlanCost) > 0 &&
        Number(basicsData.minutes) > 0
      ) {
        const pricePerCredit = Number(basicsData.discountedPrice) / Number(basicsData.minutes)
        const margin =
          ((pricePerCredit - Number(agencyPlanCost)) /
            Number(agencyPlanCost)) *
          100
        if (margin < 10) {
          setSnackMsg(
            `Cannot create plan: Profit margin must be at least 10%. Current margin: ${margin.toFixed(2)}%`,
          )
          setSnackMsgType(SnackbarTypes.Error)
          return
        }
      }

      setCreatePlanLoader(true)

      const Token = AuthToken()
      const ApiPath = Apis.addMonthlyPlan

      const formData = apiFormData()

      for (let [key, value] of formData.entries()) {}
      // return

      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + Token,
        },
      })

      if (response) {
        setCreatePlanLoader(false)
        onPlanCreated(response)
        if (response.data.status === true) {
          //update the monthlyplans state on localstorage to update checklist
          const localData = localStorage.getItem('User')
          if (localData) {
            let D = JSON.parse(localData)
            D.user.checkList.checkList.plansAdded = true
            localStorage.setItem('User', JSON.stringify(D))
          }
          window.dispatchEvent(
            new CustomEvent('UpdateAgencyCheckList', {
              detail: { update: true },
            }),
          )

          setSnackMsg(response.data.message)
          setSnackMsgType(SnackbarTypes.Success)
          handleResetValues()
          handleClose(response.data.message)
        } else if (response.data.status === false) {
          setSnackMsg(response.data.message)
          setSnackMsgType(SnackbarTypes.Error)
        }
      }
    } catch (error) {
      console.error('Error occured is', error)
      setCreatePlanLoader(false)
    }
  }

  const handleUpdatePlan = async () => {
    try {
      // Validate profit margin before updating plan - now using price per credit derived from total price
      if (
        basicsData?.discountedPrice &&
        basicsData?.minutes &&
        agencyPlanCost &&
        Number(agencyPlanCost) > 0 &&
        Number(basicsData.minutes) > 0
      ) {
        const pricePerCredit = Number(basicsData.discountedPrice) / Number(basicsData.minutes)
        const margin =
          ((pricePerCredit - Number(agencyPlanCost)) /
            Number(agencyPlanCost)) *
          100
        if (margin < 10) {
          setSnackMsg(
            `Cannot update plan: Profit margin must be at least 10%. Current margin: ${margin.toFixed(2)}%`,
          )
          setSnackMsgType(SnackbarTypes.Error)
          return
        }
      }

      setCreatePlanLoader(true)

      const Token = AuthToken()
      // console.log("Selected plans passed is", planPassed);
      // const ApiPath = Apis.updateAgencyPlan;

      const url = `${Apis.updateAgencyPlan}/${selectedPlan.id}`
      const formData = apiFormData()

      for (let [key, value] of formData.entries()) {}
      // return

      const response = await axios.put(url, formData, {
        headers: {
          Authorization: 'Bearer ' + Token,
        },
      })
      // const response = await axios({
      //   url,
      //   method,
      //   data: formData,
      //   headers: { Authorization: `Bearer ${Token}` },
      //   // ...extra, // uncomment if using query param style
      // });

      if (response) {
        setCreatePlanLoader(false)
        onPlanCreated(response)
        if (response.data.status === true) {
          //update the monthlyplans state on localstorage to update checklist
          const localData = localStorage.getItem('User')
          if (localData) {
            let D = JSON.parse(localData)
            D.user.checkList.checkList.plansAdded = true
            localStorage.setItem('User', JSON.stringify(D))
          }
          window.dispatchEvent(
            new CustomEvent('UpdateAgencyCheckList', {
              detail: { update: true },
            }),
          )

          setSnackMsg(response.data.message)
          setSnackMsgType(SnackbarTypes.Success)
          handleResetValues()
          handleClose(response.data.message)
        } else if (response.data.status === false) {
          setSnackMsg(response.data.message)
          setSnackMsgType(SnackbarTypes.Error)
        }
      }
    } catch (error) {
      console.error('Error occured is', error)
      setCreatePlanLoader(false)
    }
  }

  // Keep only up to 2 fractional digits; always render as "0.xx"

  const formatFractional2 = (raw) => {
    const s = raw ?? ''
    // If there's already a dot, take only what's after the first dot.
    const afterDot = s.includes('.') ? s.split('.')[1] : s
    const digits = afterDot.replace(/\D/g, '').slice(0, 2)
    return digits ? `0.${digits}` : ''
  }

  const isFormValid = () => {
    const agentsStr = noOfAgents?.toString().trim()
    const agentsStrPrice = costPerAdditionalAgent?.toString().trim()
    const contactsStr = noOfContacts?.toString().trim()
    let seatsStr = noOfSeats?.toString().trim()
    let costPerSeatStr = costPerAdditionalSeat?.toString().trim()

    // Validate agents count is within allowed range (1-1000)
    const agentsNum = Number(noOfAgents)
    const agentsValid = agentsStr && agentsNum > 0 && agentsNum <= 1000

    let requiredData
    if (features?.allowTeamSeats === true) {
      seatsStr = noOfSeats?.toString().trim()
      costPerSeatStr = costPerAdditionalSeat?.toString().trim()
      requiredData =
        agentsValid &&
        contactsStr &&
        language &&
        seatsStr &&
        costPerSeatStr &&
        agentsStrPrice &&
        snackBannerMsg === null
    } else {
      requiredData =
        agentsValid &&
        contactsStr &&
        language &&
        agentsStrPrice &&
        snackBannerMsg === null
    }

    const requiredFieldsFilled = requiredData
    let trialValid = true
    if (features.allowTrial) {
      const trialDays = Number(trialValidForDays)
      trialValid = trialDays > 0 && trialDays <= 14
    }

    return requiredFieldsFilled && trialValid
  }

  //add custom features
  const handleAddCustomFeature = () => {
    // setCustomFeatures((prev) => [...prev, ""]); // add empty field
    setCustomFeatures((prev) => [...(prev || []), ''])
  }

  //handle custom field change
  const handleChangeCustomFeature = (index, value, e) => {
    setCustomFeatures((prev) => prev.map((f, i) => (i === index ? value : f)))
    // setCustomFeatures((prev) => {
    //     const newFeatures = [...prev];
    //     newFeatures[index] = value;
    //     return newFeatures;
    // });
  }

  //remove custom field
  const handleRemoveCustomFeature = (index) => {
    setCustomFeatures((prev) => prev.filter((_, i) => i !== index))
  }

  //handle back function click with storing the current data
  const handleBackClick = () => {
    setConfigurationData({
      maxAgents: noOfAgents,
      maxLeads: noOfContacts, // Store noOfContacts, not noOfAgents
      costPerAdditionalAgent: costPerAdditionalAgent,
      costPerAdditionalSeat: costPerAdditionalSeat,
      language: language,
      features: features,
      trialValidForDays: trialValidForDays,
      noOfSeats: noOfSeats,
      costPerAdditionalSeat: costPerAdditionalSeat,
      languageTitle: languageTitle,
      language: language,
      customFeatures: customFeatures,
    })
    handleBack()
  }

  //fetch agencyallwoed features
  const fetchAgencyAllowedFeatures = () => {
    const localData = localStorage.getItem('User')
    if (localData) {
      const LD = JSON.parse(localData)
      const dynamicFeatures = LD?.user?.planCapabilities || {}
      const planType = LD?.user?.plan?.title?.toLowerCase?.() || ''
      const canUseMultilingual =
        planType.includes('growth') || planType.includes('scale')

      setAgencyAllowedFeatures({
        allowLanguageSelection: dynamicFeatures?.allowLanguageSelection,
        toolsActions: dynamicFeatures?.allowToolsAndActions,
        calendars: dynamicFeatures?.allowCalendarIntegration,
        liveTransfer: dynamicFeatures?.allowLiveCallTransfer,
        ragKnowledgeBase: dynamicFeatures?.allowKnowledgeBases,
        embedBrowserWebhookAgent: dynamicFeatures?.allowEmbedAndWebAgents,
        apiKey: dynamicFeatures?.allowAPIAccess,
        voicemail: dynamicFeatures?.allowVoicemail,
        allowTextMessages: dynamicFeatures?.allowTextMessages,
        allowEmails:
          dynamicFeatures?.allowEmails ||
          dynamicFeatures?.allowEmailMessages ||
          false,
        allowDialer:
          dynamicFeatures?.allowDialer ||
          dynamicFeatures?.allowDialerCapability ||
          false,
        twilio: dynamicFeatures?.allowTwilioIntegration,
        allowTeamSeats: dynamicFeatures?.allowTeamCollaboration,
        sendText: dynamicFeatures?.allowTextMessages,
        allowTrial: true,
        allowLeadSource:
          dynamicFeatures?.allowLeadSource ||
          dynamicFeatures?.allowLeadScoring ||
          false,
      })
    }
  }

  //open upgrade plan popup
  const handleUpgradePlanModalClick = async () => {
    // Get current agency plan before opening modal
    try {
      // First try to get from selectedAgency if it has plan data
      if (selectedAgency?.plan) {
        setCurrentAgencyPlan(selectedAgency.plan)
      } else {
        // Otherwise get from localStorage (same as fetchAgencyAllowedFeatures)
        const localData = localStorage.getItem('User')
        if (localData) {
          const LD = JSON.parse(localData)
          setCurrentAgencyPlan(LD?.user?.plan || null)
        }
      }
    } catch (error) {
      console.error('Error getting agency plan:', error)
      // Still open modal even if plan fetch fails
    }
    setShowUpgradePlanPopup(true)
  }

  //code for close modal
  const handleCloseModal = async (d) => {
    if (d) {
      await getProfileDetails()
      setShowUpgradePlanPopup(false)
      fetchAgencyAllowedFeatures()
    } else {
      setShowUpgradePlanPopup(false)
    }
  }
  //switch btns for plan features
  const handleToggle = (key) => {
    if (
      key === 'allowLanguageSelection' &&
      !agencyAllowedFeatures.allowLanguageSelection
    ) {
      setLanguage('english')
      setLanguageTitle('English and Spanish Compatible')
      return
    }

    setFeatures((prev) => {
      const newState = { ...prev, [key]: !prev[key] }

      if (key === 'allowLanguageSelection') {
        const nextValue = !prev.allowLanguageSelection
        if (nextValue) {
          setLanguage('multilingual')
          setLanguageTitle('Multilingual Compatible')
        } else {
          setLanguage('english')
          setLanguageTitle('English and Spanish Compatible')
        }
      }

      // If Text Messages is enabled, automatically enable Twilio
      if (key === 'allowTextMessages' && newState.allowTextMessages) {
        newState.twilio = true
      }

      // If Twilio is disabled, automatically disable Text Messages
      if (key === 'twilio' && !newState.twilio) {
        newState.allowTextMessages = false
      }

      // if allowTeamSeats just got enabled, scroll down
      if (
        key === 'allowTeamSeats' ||
        (key === 'allowTrial' &&
          !prev.allowTeamSeats &&
          newState.allowTeamSeats)
      ) {
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ top: 40, behavior: 'smooth' })
          }
        }, 100)
      }

      return newState
    })
  }

  return (
    <Modal
      open={open}
      // onClose={() => {
      //   handleResetValues();
      //   handleClose("");
      // }}
    >
      {/*<Box className="bg-white rounded-xl p-6 max-w-md w-[95%] mx-auto mt-20 shadow-lg">*/}
      <Box className="bg-white rounded-xl max-w-[80%] w-[95%] h-[90vh] border-none outline-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <AgentSelectSnackMessage
          isVisible={snackMsg !== null}
          message={snackMsg}
          hide={() => {
            setSnackMsg(null)
          }}
          type={snackMsgType}
        />
        <AgentSelectSnackMessage
          isVisible={snackBannerMsg !== null}
          message={snackBannerMsg}
          hide={() => {
            // setSnackMsg(null);
          }}
          type={snackBannerMsgType}
        />
        <div className="w-full flex flex-row h-[100%] items-start">
          {showTrailWarning && (
            <div className="absolute left-1/2 -translate-x-1/2 top-10">
              <Image
                className="rounded-md"
                src={'/agencyIcons/trialPlans.jpg'}
                height={40}
                width={356}
                alt="*"
              />
            </div>
          )}
          <div className="w-6/12 h-[100%] p-6">
            <div
              ref={scrollContainerRef}
              className="overflow-y-auto w-full h-[80%] scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <div className="mb-4" style={{ fontWeight: '600', fontSize: 18 }}>
                {isEditPlan ? 'Edit Plan > Configure' : 'New Plan > Configure'}
              </div>

              <div className="w-full flex flex-row items-center justify-center gap-2">
                {/* Plan Name */}
                <div className="w-1/2">
                  <label style={styles.labels}>
                    Number of Agents <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div
                    className={`border ${noOfAgents && Number(noOfAgents) > 1000 ? 'border-red' : 'border-gray-200'} rounded px-2 py-0 mb-4 mt-1 flex flex-row items-center w-full`}
                  >
                    <input
                      style={styles.inputs}
                      className="w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none"
                      placeholder="Max 1,000"
                      value={noOfAgents}
                      type="number"
                      min={0}
                      max={1000}
                      onChange={(e) => {
                        const value = e.target.value
                        // Allow only digits and one optional period
                        const sanitized = value.replace(/[^0-9.]/g, '')

                        // Prevent multiple periods
                        let valid =
                          sanitized.split('.')?.length > 2
                            ? sanitized.substring(0, sanitized.lastIndexOf('.'))
                            : sanitized
                        
                        // Cap the value at 1000
                        if (valid && Number(valid) > 1000) {
                          valid = '1000'
                          setSnackBannerMsg('Number of agents cannot be greater than 1,000')
                          setSnackBannerMsgType(SnackbarTypes.Error)
                        } else {
                          // Only clear snackBannerMsg if it's the number of agents error
                          // Check if current message is about agents before clearing
                          if (
                            snackBannerMsg &&
                            snackBannerMsg.includes('agents') &&
                            snackBannerMsg.includes('1,000')
                          ) {
                            setSnackBannerMsg(null)
                          }
                        }
                        
                        setNoOfAgents(valid)
                      }}
                    />
                  </div>
                </div>

                {/* Tag Option */}
                <div className="w-1/2">
                  <div className="flex flex-row items-center gap-2">
                    <label style={styles.labels}>
                      Price Additional Agents <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <Tooltip
                      title={
                        "Your cost for additional agents are $5. We don't charge you for this, we bill the customer when they optin to add additional agents."
                      }
                      placement="top"
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
                      <Image
                        src="/otherAssets/infoLightDark.png"
                        alt="info"
                        width={14}
                        height={14}
                        className="cursor-pointer rounded-full"
                      />
                    </Tooltip>
                  </div>
                  <div
                    className={`border ${snackBannerMsg && costPerAdditionalAgent && Number(costPerAdditionalAgent) < 5 ? 'border-red' : 'border-gray-200'} rounded px-2 py-0 mb-4 mt-1 flex flex-row items-center w-full`}
                  >
                    <div className="" style={styles.inputs}>
                      $
                    </div>
                    <input
                      style={styles.inputs}
                      type="text"
                      className={`w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none`}
                      placeholder=""
                      value={costPerAdditionalAgent}
                      onChange={(e) => {
                        const value = e.target.value
                        // Allow only digits and one optional period
                        if (value && value < 5) {
                          setSnackBannerMsg(
                            'Price per agent cannot be less than $5.',
                          )
                          setSnackBannerMsgType(SnackbarTypes.Error)
                        } else {
                          // Only clear snackBannerMsg if it's the additional agent error
                          // Check if current message is about additional agent before clearing
                          if (
                            snackBannerMsg &&
                            snackBannerMsg.includes('agent')
                          ) {
                            setSnackBannerMsg(null)
                          }
                        }
                        const sanitized = value.replace(/[^0-9.]/g, '')

                        // Prevent multiple periods
                        const valid =
                          sanitized.split('.')?.length > 2
                            ? sanitized.substring(0, sanitized.lastIndexOf('.'))
                            : sanitized
                        // setOriginalPrice(valid);
                        setCostPerAdditionalAgent(valid)
                      }}
                    />
                  </div>
                </div>
              </div>
              {/*
                                <div className="w-full flex flex-row items-center justify-center gap-2">
                                    <div className="w-1/2">
                                        <label style={styles.labels}>Number of Seats</label>
                                        <input
                                            style={styles.inputs}
                                            className="w-full border border-gray-200 rounded p-2 mb-4 mt-1 outline-none focus:outline-none focus:ring-0 focus:border-gray-200"
                                            placeholder=""
                                            value={noOfSeats}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Allow only digits and one optional period
                                                const sanitized = value.replace(/[^0-9.]/g, '');
    
                                                // Prevent multiple periods
                                                const valid = sanitized.split('.')?.length > 2
                                                    ? sanitized.substring(0, sanitized.lastIndexOf('.'))
                                                    : sanitized;
                                                // setOriginalPrice(valid);
                                                setNoOfSeats(valid ? Number(valid) : 0);
                                            }}
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <label style={styles.labels}>Price Additional Seats</label>
                                        <div className="border border-gray-200 rounded px-2 py-0 mb-4 mt-1 flex flex-row items-center w-full">
                                            <div className="" style={styles.inputs}>
                                                $
                                            </div>
                                            <input
                                                style={styles.inputs}
                                                type="text"
                                                className={`w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none`}
                                                placeholder="00"
                                                value={costPerAdditionalSeat}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    // Allow only digits and one optional period
                                                    const sanitized = value.replace(/[^0-9.]/g, '');
    
                                                    // Prevent multiple periods
                                                    const valid = sanitized.split('.')?.length > 2
                                                        ? sanitized.substring(0, sanitized.lastIndexOf('.'))
                                                        : sanitized;
                                                    // setOriginalPrice(valid);
                                                    setCostPerAdditionalSeat(valid ? Number(valid) : 0);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            */}
              <div className="w-full">
                <label style={styles.labels}>
                  Number of Contacts <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  style={styles.inputs}
                  className="w-full border border-gray-200 outline-none focus:outline-none focus:ring-0 focus:border-gray-200 rounded p-2 mb-4 mt-1"
                  placeholder=""
                  value={noOfContacts}
                  onChange={(e) => {
                    setNoOfContacts(e.target.value)
                  }}
                />
              </div>
              <PlanFeatures
                featuresList={featuresList}
                features={features}
                agencyAllowedFeatures={agencyAllowedFeatures}
                setFeatures={setFeatures}
                customFeatures={customFeatures}
                handleChangeCustomFeature={handleChangeCustomFeature}
                handleRemoveCustomFeature={handleRemoveCustomFeature}
                trialValidForDays={trialValidForDays}
                setTrialValidForDays={setTrialValidForDays}
                upgradePlanClickModal={handleUpgradePlanModalClick}
                noOfSeats={noOfSeats}
                setNoOfSeats={setNoOfSeats}
                costPerAdditionalSeat={costPerAdditionalSeat}
                setCostPerAdditionalSeat={setCostPerAdditionalSeat}
                handleToggle={handleToggle}
                setSnackBannerMsg={setSnackBannerMsg}
                setSnackBannerMsgType={setSnackBannerMsgType}
                trialDaysError={trialDaysError}
                setTrialDaysError={setTrialDaysError}
              />
            </div>
            {/* Action Buttons */}
            <div className="w-full pt-1">
              <div
                className="w-full flex flex-row items-center justify-between pt-2"
                style={{ borderTop: '2px solid #15151510' }}
              >
                <div styles={{ fontSize: '15px', fontWeight: '700' }}>
                  Custom Features
                </div>
                <button
                  styles={{ fontSize: '15px', fontWeight: '700' }}
                  className="underline text-brand-primary outline-none border-none"
                  onClick={() => {
                    handleAddCustomFeature()
                  }}
                >
                  + Add
                </button>
              </div>
              <div className="flex justify-between mt-10">
                <button
                  disabled={createPlanLoader}
                  onClick={() => {
                    handleBackClick()
                  }}
                  className="text-brand-primary font-semibold border rounded-lg w-[12vw]"
                >
                  Back
                </button>
                {createPlanLoader ? (
                  <CircularProgress size={30} />
                ) : (
                  <button
                    className={` ${isFormValid() ? 'bg-brand-primary' : 'bg-[#00000020]'} w-[12vw] ${isFormValid() ? 'text-white' : 'text-black'} font-semibold py-2 px-4 rounded-lg`}
                    onClick={() => {
                      if (isEditPlan) {
                        handleUpdatePlan()
                      } else {
                        handleCreatePlan()
                      }
                    }}
                    disabled={!isFormValid()}
                  >
                    {isEditPlan ? 'Update' : 'Create Plan'}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="w-6/12 h-full rounded-tr-xl rounded-br-xl">
            <ConfigureSideUI
              handleClose={handleClose}
              handleResetValues={handleResetValues}
              allowedFeatures={allowedFeatures}
              noOfAgents={noOfAgents}
              noOfContacts={noOfAgents}
              basicsData={basicsData}
              features={features}
              allowTrial={features.allowTrial}
              trialValidForDays={trialValidForDays}
              from={'addPlan'}
            />
          </div>

          {/*Upgrade agency plan*/}
          <UpgradePlan
            open={showUpgradePlanPopup}
            handleClose={async () => {
              // Refresh profile and features after upgrade
              await getProfileDetails()
              fetchAgencyAllowedFeatures()
              setShowUpgradePlanPopup(false)
            }}
            from="agency"
            selectedUser={selectedAgency}
            currentFullPlan={currentAgencyPlan}
          />
        </div>
      </Box>
    </Modal>
  );
}

const styles = {
  labels: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#00000050',
  },
  inputs: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#000000',
  },
  text: {
    fontSize: '15px',
    fontWeight: '500',
  },
  text2: {
    textAlignLast: 'left',
    fontSize: 15,
    color: '#000000',
    fontWeight: 500,
    whiteSpace: 'nowrap', // Prevent text from wrapping
    overflow: 'hidden', // Hide overflow text
    textOverflow: 'ellipsis', // Add ellipsis for overflow text
  },
  headingStyle: {
    fontSize: 16,
    fontWeight: '700',
  },
  gitTextStyle: {
    fontSize: 15,
    fontWeight: '700',
  },

  //style for plans
  cardStyles: {
    fontSize: '14',
    fontWeight: '500',
    border: '1px solid #00000020',
  },
  triangleLabel: {
    position: 'absolute',
    top: '0',
    right: '0',
    width: '0',
    height: '0',
    borderTop: '50px solid hsl(var(--brand-primary))', // Increased height again for more padding
    borderLeft: '50px solid transparent',
  },
  labelText: {
    position: 'absolute',
    top: '10px', // Adjusted to keep the text centered within the larger triangle
    right: '5px',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    transform: 'rotate(45deg)',
  },
  content: {
    textAlign: 'left',
    paddingTop: '10px',
  },
  originalPrice: {
    // textDecoration: "line-through",
    color: 'hsl(var(--brand-primary))',
    fontSize: 18,
    fontWeight: '600',
  },
  discountedPrice: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 22,
    // marginLeft: "10px",
  },
}
