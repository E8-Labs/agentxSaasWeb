'use client'

import { Box, Button, CircularProgress, TextField } from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'

import Apis from '@/components/apis/Apis'
import { UpdateProfile } from '@/components/apis/UpdateProfile'
import { Checkbox } from '@/components/ui/checkbox'
import { UserTypes } from '@/constants/UserTypes'
import { getAreaOfFocusTitle } from '@/utilities/getAreaOfFocusTitle'

import AdminGetProfileDetails from '../../AdminGetProfileDetails'

function AdminBasicInfo({ selectedUser, isAgencyView = false }) {
  const router = useRouter()
  const [focusedName, setFocusedName] = useState(false)
  const [focusedFarm, setFocusedFarm] = useState(false)
  const [focusedBrokerage, setFocusedBrokerage] = useState(false)
  const [focusedCompany, setFocusedCompany] = useState(false)
  const [focusedTransaction, setFocusedTransaction] = useState(false)
  const [focusedInstallationVolume, setFocusedInstallationVolume] =
    useState(false)
  const [focusedEmail, setFocusedEmail] = useState(false)
  const [focusedServiceArea, setFocusedServiceArea] = useState(false)
  const [focusedProjectSize, setFocusedProjectSize] = useState(false)
  const [focusedClientsPerMonth, setFocusedClientsPerMonth] = useState(false)
  const [focusedCasesPerMonth, setFocusedCasesPerMonth] = useState(false)
  const [focusedWebsite, setFocusedWebSite] = useState(false)

  //my variable
  const [serviceId, setServiceId] = useState([])
  const [servicesData, setServicesData] = useState([])
  const [focusedTerritory, setFocusedTerritory] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [farm, setFarm] = useState('')
  const [transaction, setTransaction] = useState('')
  const [brokerAge, setBrokerAge] = useState('')
  const [phone, setPhone] = useState('')
  const [serviceArea, setServiceArea] = useState('')
  const [teritorry, setTeritorry] = useState('')
  const [company, setCompany] = useState('')
  const [installationVolume, setInstallationVolume] = useState('')
  const [projectSize, setProjectSize] = useState('')
  const [clientType, setClientType] = useState('')
  const [consoltation, setconsaltation] = useState('')
  const [clientType2, setClientType2] = useState('')
  const [collectionStratigy, setcollectionStratigy] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [companyAffiliation, setCompanyAffiliation] = useState('')
  const [clientsPerMonth, setClientsPerMonth] = useState('')
  const [CasesPerMonth, setCasessPerMonth] = useState('')

  const [isNameChanged, setIsNameChanged] = useState(false)
  const [isEmailChanged, setIsEmailChanged] = useState(false)
  const [isTransactionChanged, setIsTransactionChange] = useState('')
  const [isFarmChanged, setIsFarmChanged] = useState(false)
  const [isBrokerageChanged, setIsBrokerageChanged] = useState(false)
  const [isServiceAreaChanged, setIsServiceAreaChanged] = useState(false)
  const [isTeritorryChanged, setIsTeritorryChanged] = useState('')
  const [isCompanyChanged, setIsCompanyChanged] = useState('')
  const [isCompanyAffiliationChanged, setIsCompanyAffiliationChanged] =
    useState('')
  const [isInstallationVolumechanged, setIsInstallationVolumeChanged] =
    useState('')
  const [isProjectSizeChanged, setIsprojectSizeChanged] = useState('')
  const [isClientsPerMonthChanged, setIsClientsPerMonthChanged] = useState('')
  const [iscasesPerMonthChanged, setIcasesPerMonthChanged] = useState('')
  const [isWebsiteUrlChanged, setIsWebsiteUrlChanged] = useState('')

  const [agentServices, setAgentServices] = useState([])
  const [agentAreasOfFocus, setAgentAreasOfFocus] = useState([])
  const [agentIndustries, setAgentIndustries] = useState([])
  const [selectedIndustries, setSelectedIndustries] = useState([])

  const [loading, setloading] = useState(false)
  const [loading2, setloading2] = useState(false)
  const [loading3, setloading3] = useState(false)
  const [loading4, setloading4] = useState(false)
  const [loading5, setloading5] = useState(false)
  const [loading6, setloading6] = useState(false)
  const [loading7, setloading7] = useState(false)
  const [loading8, setloading8] = useState(false)
  const [loading9, setloading9] = useState(false)
  const [loading10, setLoading10] = useState(false)
  const [loading11, setLoading11] = useState(false)
  const [loading12, setLoading12] = useState(false)
  const [loading13, setLoading13] = useState(false)
  const [loading14, setLoading14] = useState(false)
  const [loading15, setLoading15] = useState(false)

  const [srviceLoader, setServiceLoader] = useState(false)
  const [areaLoading, setAreaLoading] = useState(false)

  // Refs for input fields
  const nameRef = useRef(null)
  const emailRef = useRef(null)
  const farmRef = useRef(null)
  const serviceAreaRef = useRef(null)
  const brokerAgeRef = useRef(null)
  const companyRef = useRef(null)
  const websiteRef = useRef(null)
  const companyAffiliationRef = useRef(null)
  const transactionRef = useRef(null)
  const installationVolumeRef = useRef(null)
  const projectSizeRef = useRef(null)
  const clientsPerMonthRef = useRef(null)
  const casesPerMonthRef = useRef(null)
  const teritorryRef = useRef(null)

  // Email validation and checking states
  const [originalEmail, setOriginalEmail] = useState('')
  const [emailLoader, setEmailLoader] = useState(false)
  const [emailCheckResponse, setEmailCheckResponse] = useState(null)
  const [validEmail, setValidEmail] = useState('')
  const emailTimerRef = useRef(null)

  const [selected, setSelected] = useState([])
  const [selectedArea, setSelectedArea] = useState([])

  //code for image select and drag and drop
  const [selectedImage, setSelectedImage] = useState('')
  const [dragging, setDragging] = useState(false)

  const [originalSelectedIndustries, setOriginalSelectedIndustries] = useState(
    [],
  ) // To track initial state
  const [originalSelectedArea, setOriginalSelectedArea] = useState([]) // To track initial state
  const [originalSelectedService, setOriginalSelectedService] = useState([]) // To track initial state

  //user details
  const [UserDetails, setUserDetails] = useState(null)

  const [userRole, setUserRole] = useState('')
  const [userType, setUserType] = useState('')
  const [isInternal, setIsInternal] = useState(false)

  const primaryClientTypes = [
    {
      id: 1,
      title: 'Residential clients',
      value: 'residential',
    },
    {
      id: 2,
      title: 'Commercial clients',
      value: 'commercial',
    },
    {
      id: 3,
      title: 'Both',
      value: 'both',
    },
  ]

  const primaryClientTypes3 = [
    {
      id: 1,
      title: 'Soft Collections',
    },
    {
      id: 2,
      title: 'Hard Collections',
    },
    {
      id: 3,
      title: 'Hybrid Approach',
    },
    // {
    //   id: 100,
    //   title: "All",
    // },
  ]
  const primaryClientTypes4 = [
    {
      id: 1,
      title: 'First-Time Homebuyers',
    },
    {
      id: 2,
      title: 'Investors & Property Developers',
    },
    {
      id: 3,
      title: 'Veterans & Active Military',
    },
    {
      id: 3,
      title: 'Luxury Homebuyers',
    },
    {
      id: 5,
      title: 'Self-Employed & Entrepreneurs',
    },
    {
      id: 6,
      title: 'Other (type here)',
    },
  ]

  //array for the primary client types
  const primaryClientTypes2 = [
    {
      id: 1,
      title: 'Individuals (B2)',
    },
    {
      id: 2,
      title: 'Businesses & Corporations (B2B)',
    },
    {
      id: 3,
      title: 'Government & Public Sector',
    },
  ]

  const ConsultationFormat = [
    {
      id: 1,
      title: 'In-Person Consultations',
    },
    {
      id: 2,
      title: 'Virtual Consultations',
    },
    {
      id: 3,
      title: 'Virtual Consultations',
    },
  ]

  //fetching the data
  useEffect(() => {
    // Initialize userType from selectedUser if available (fallback)
    if (selectedUser?.userType && !userType) {
      setUserType(selectedUser.userType)
    }
    // //console.log;
    getProfile()
  }, [selectedUser])

  //function to fetch the profile data
  const getProfile = async () => {
    try {
      let LocalData = await AdminGetProfileDetails(selectedUser.id)
      if (LocalData) {
        const userData = LocalData
        await getAgentDefaultData(userData)

        setUserRole(userData?.userRole)
        setUserType(userData?.userType)
        setUserDetails(userData?.user)
        setName(userData?.name)
        setSelectedImage(LocalData?.thumb_profile_image)
        setEmail(userData?.email)
        setOriginalEmail(userData?.email || '')
        setFarm(userData?.farm)
        setTransaction(userData?.averageTransactionPerYear)
        setBrokerAge(userData?.brokerage)
        setPhone(userData?.phone)

        setServiceArea(userData?.areaOfService)
        setClientType(userData?.primaryClientType)
        setClientType2(userData?.clientType)

        setCompany(userData?.company)
        setTeritorry(userData?.territory)
        setWebsiteUrl(userData?.website)
        setCompanyAffiliation(userData?.firmOrCompanyAffiliation)
        setClientsPerMonth(userData?.averageMonthlyClients)
        setCasessPerMonth(userData?.caseVolume)

        setInstallationVolume(userData?.projectsPerYear || '')
        setProjectSize(userData?.projectSizeKw || '')

        setIsInternal(userData.isInternal)

        // //console.log;
        // //console.log;

        // Initialize arrays to hold services and areas of focus
        const industriesArray = []
        const servicesArray = []
        const focusAreasArray = []

        // Pre-populate selected services and areas based on the user profile
        userData?.services?.forEach((item) => {
          servicesArray.push(item.id) // Add the full object or only IDs as needed
        })
        userData?.userIndustry?.forEach((item) => {
          industriesArray.push(item.id) // Add the full object or only IDs as needed
        })

        userData?.focusAreas?.forEach((item) => {
          focusAreasArray.push(item.id) // Add the full object or only IDs as needed
        })

        // Set default selected areas and services
        // setSelected(servicesArray); // Default select services

        setSelectedIndustries(industriesArray)
        setOriginalSelectedIndustries(industriesArray)

        setSelectedArea(focusAreasArray)
        setOriginalSelectedArea(focusAreasArray) // Save the initial state

        //console.log;
        setServiceId(servicesArray)
        setOriginalSelectedService(servicesArray)
      } else {
        //console.log;
      }
    } catch (error) {
      console.error('Error occured in api is error', error)
    }
  }

  const getAgentDefaultData = async (userData) => {
    try {
      setServiceLoader(true)
      let data = localStorage.getItem('User')
      if (data) {
        let d = JSON.parse(data)
        let AgentTypeTitle = userData.userType
        //console.log;

        const ApiPath = `${Apis.defaultData}?type=${AgentTypeTitle}`
        // //console.log;
        const response = await axios.get(ApiPath, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response) {
          setAgentServices(response.data.data.agentServices)
          setAgentAreasOfFocus(response.data.data.areaOfFocus)
          setAgentIndustries(response.data.data.userIndustry)
        } else {
          alert(response.data.message)
        }
      }
    } catch (error) {
      setServiceLoader(false)
      // console.error("ERror occured in default data api is :----", error);
    } finally {
      setServiceLoader(false)
    }
  }

  const choseClientType = () => {
    if (userType === UserTypes.LoanOfficerAgent) {
      return primaryClientTypes4
    } else {
      return primaryClientTypes2
    }
  }

  const handleNameSave = async () => {
    try {
      setloading(true)
      const data = { name: name }
      if (selectedUser) {
        data.userId = selectedUser?.id
      }
      await UpdateProfile(data)
      setloading(false)
      setIsNameChanged(false)
    } catch (e) {
      setloading(false)
    }
  }

  // Email validation function
  const validateEmail = (emailVal) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (/\.\./.test(emailVal)) {
      return false
    }
    return emailPattern.test(emailVal)
  }

  // Function to check if email exists in database
  const checkEmail = async (value) => {
    try {
      if (value === originalEmail) {
        setEmailCheckResponse(null)
        setValidEmail('')
        return
      }

      setValidEmail('')
      setEmailLoader(true)

      const ApiPath = Apis.CheckEmail
      let ApiData = { email: value }

      if (selectedUser) {
        ApiData.userId = selectedUser?.id
      }

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        setEmailCheckResponse(response.data)
      }
    } catch (error) {
      console.error('Error checking email:', error)
    } finally {
      setEmailLoader(false)
    }
  }

  const handleEmailSave = async () => {
    try {
      if (!validateEmail(email)) {
        return
      }

      if (email !== originalEmail) {
        if (emailLoader) {
          return
        }
        if (emailCheckResponse === null) {
          return
        }
        if (emailCheckResponse.status === false) {
          return
        }
      }

      setLoading15(true)
      const data = { email: email }
      if (selectedUser) {
        data.userId = selectedUser?.id
      }
      await UpdateProfile(data)
      setLoading15(false)
      setIsEmailChanged(false)
      setOriginalEmail(email)
      setEmailCheckResponse(null)
      setValidEmail('')
    } catch (e) {
      setLoading15(false)
    }
  }

  const handleFarmSave = async () => {
    try {
      setloading2(true)
      const data = { farm: farm }
      if (selectedUser) {
        data.userId = selectedUser?.id
      }
      await UpdateProfile(data)
      setloading2(false)
      setIsFarmChanged(false)
    } catch (e) {
      setloading2(false)
    }
  }

  const handleBrokerAgeSave = async () => {
    try {
      setloading3(true)
      const data = { brokerage: brokerAge }
      if (selectedUser) {
        data.userId = selectedUser?.id
      }
      await UpdateProfile(data)
      setloading3(false)
      setIsBrokerageChanged(false)
    } catch (e) {
      setloading3(false)
    }
  }

  const handleCompanySave = async () => {
    try {
      setloading8(true)
      const data = { company: company }
      if (selectedUser) {
        data.userId = selectedUser?.id
      }
      await UpdateProfile(data)
      setloading8(false)
      setIsCompanyChanged(false)
    } catch (e) {
      setloading8(false)
    }
  }

  const handleWebsiteChange = async () => {
    try {
      setLoading10(true)
      const data = { website: websiteUrl }
      if (selectedUser) {
        data.userId = selectedUser?.id
      }
      await UpdateProfile(data)
      setLoading10(false)
      setIsWebsiteUrlChanged(false)
    } catch (e) {
      setLoading10(false)
    }
  }

  const handleCompanyAffiliationSave = async () => {
    try {
      setLoading11(true)
      const data = { firmOrCompanyAffiliation: companyAffiliation }
      if (selectedUser) {
        data.userId = selectedUser?.id
      }
      await UpdateProfile(data)
      setLoading11(false)
      setIsCompanyAffiliationChanged(false)
    } catch (e) {
      setLoading11(false)
    }
  }

  const handleTransactionSave = async () => {
    try {
      setloading4(true)
      const data = { averageTransactionPerYear: transaction }
      if (selectedUser) {
        data.userId = selectedUser?.id
      }
      await UpdateProfile(data)
      setloading4(false)
      setIsTransactionChange(false)
    } catch (e) {
      setloading4(false)
    }
  }

  const handleInstallationVolumeSave = async () => {
    try {
      setloading7(true)
      const data = { projectsPerYear: installationVolume }
      if (selectedUser) {
        data.userId = selectedUser?.id
      }
      await UpdateProfile(data)
      setloading7(false)
      setIsInstallationVolumeChanged(false)
    } catch (e) {
      setloading7(false)
    }
  }

  const handleProjectSizeSave = async () => {
    try {
      setloading9(true)
      const data = { projectSizeKw: projectSize }
      if (selectedUser) {
        data.userId = selectedUser?.id
      }
      await UpdateProfile(data)
      setloading9(false)
      setIsprojectSizeChanged(false)
    } catch (e) {
      setloading9(false)
    }
  }

  const handleClientsPerMonthSave = async () => {
    try {
      setLoading12(true)
      const data = { averageMonthlyClients: clientsPerMonth }
      if (selectedUser) {
        data.userId = selectedUser?.id
      }
      await UpdateProfile(data)
      setLoading12(false)
      setIsClientsPerMonthChanged(false)
    } catch (e) {
      setLoading12(false)
    }
  }

  const handleCasesPerMonthSave = async () => {
    try {
      setLoading12(true)
      const data = { caseVolume: CasesPerMonth }
      if (selectedUser) {
        data.userId = selectedUser?.id
      }
      await UpdateProfile(data)
      setLoading12(false)
      setIcasesPerMonthChanged(false)
    } catch (e) {
      setLoading12(false)
    }
  }

  const handleServiceAreaSave = async () => {
    try {
      setloading6(true)
      const data = { areaOfService: serviceArea }
      if (selectedUser) {
        data.userId = selectedUser?.id
      }
      await UpdateProfile(data)
      setloading6(false)
      setIsServiceAreaChanged(false)
    } catch (e) {
      setloading6(false)
    }
  }

  const handleTeritorrySave = async () => {
    try {
      setLoading14(true)
      const data = { territory: teritorry }
      if (selectedUser) {
        data.userId = selectedUser?.id
      }
      await UpdateProfile(data)
      setLoading14(false)
      setIsTeritorryChanged(false)
    } catch (e) {
      setLoading14(false)
    }
  }

  const handleDrop = async (event) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file)
      setSelectedImage(imageUrl)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleImageChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      const imageUrl = URL.createObjectURL(file) // Generate preview URL

      setSelectedImage(imageUrl) // Set the preview image

      await uploadeImage(file)
    } catch (error) {
      // console.error("Error uploading image:", error);
    } finally {
    }
  }

  const uploadeImage = async (imageUrl) => {
    setloading5(true)
    try {
      const data = localStorage.getItem('User')
      if (data) {
        let u = JSON.parse(data)
        const apidata = new FormData()

        apidata.append('media', imageUrl)
        apidata.append('userId', selectedUser.id)
        // //console.log;
        for (let pair of apidata.entries()) { }
        let path = Apis.updateProfileApi

        // //console.log;
        // //console.log;
        // return
        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response) {
          if (response.data.status === true) {
            u.user = response.data.data

            //// //console.log
            localStorage.setItem('User', JSON.stringify(u))
            // //console.log;
            window.dispatchEvent(
              new CustomEvent('UpdateProfile', { detail: { update: true } }),
            )
            return response.data.data
          }
        }
      }
    } catch (e) { } finally {
      setloading5(false)
    }
  }

  return (
    <div
      className="w-full flex flex-col items-start px-8 py-2 h-[100vh]"
      style={{
        paddingBottom: '20px',

        // overflow: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      <div className="w-full flex flex-row items-center justify-between">
        <div>
          <div style={{ fontSize: 22, fontWeight: '700', color: '#000' }}>
            Basic Information
          </div>

          <div style={{ fontSize: 12, fontWeight: '500', color: '#00000090' }}>
            {'Account > Basic Information'}
          </div>
        </div>
      </div>
      <button
        className="mt-8"
        onClick={() => {
          if (typeof document !== 'undefined') {
            document.getElementById('fileInput').click()
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {loading5 ? (
          <CircularProgress size={20} sx={{ color: 'hsl(var(--brand-primary))' }} />
        ) : (
          <div
            className="flex flex-row items-end"
            style={
              {
                // border: dragging ? "2px dashed #0070f3" : "",
              }
            }
          >
            {selectedImage ? (
              <div style={{ marginTop: '20px' }}>
                <Image
                  src={selectedImage}
                  height={74}
                  width={74}
                  // layout="intrinsic"
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                  alt="profileImage"
                />
              </div>
            ) : (
              <Image
                src={'/agentXOrb.gif'}
                height={74}
                width={74}
                alt="profileImage"
              />
            )}
          </div>
        )}
      </button>
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        id="fileInput"
        style={{ display: 'none' }}
        onChange={handleImageChange}
      />
      <div
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: '#000',
          marginTop: '4vh',
        }}
      >
        Full Name
      </div>
      <div className="flex items-center w-6/12 mt-2 gap-2">
        <div
          className="flex items-center rounded-lg px-3 py-2 w-full"
          style={{
            border: `1px solid ${focusedName ? '#8a2be2' : '#00000010'}`,
            transition: 'border-color 0.3s ease',
          }}
        >
          <input
            ref={nameRef}
            className="w-11/12 outline-none focus:ring-0"
            onFocus={() => setFocusedName(true)}
            onBlur={() => setFocusedName(false)}
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setIsNameChanged(true)
            }}
            type="text"
            placeholder="Name"
            style={{ border: '0px solid hsl(var(--brand-primary))', outline: 'none' }}
          />
        </div>
        {isNameChanged ? (
          loading ? (
            <CircularProgress size={20} sx={{ color: 'hsl(var(--brand-primary))' }} />
          ) : (
            <button
              onClick={async () => {
                handleNameSave()
              }}
              style={{ color: ' #8a2be2', fontSize: '14px', fontWeight: '600' }}
            >
              Save
            </button>
          )
        ) : (
          ""
        )}
      </div>
      {/*<button
        onClick={() => {
          nameRef.current?.focus()
        }}
      >
        <Image
          src={'/svgIcons/editIcon.svg'}
          width={24}
          height={24}
          alt="*"
        />
      </button>*/}
      <div
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: '#000',
          marginTop: '4vh',
        }}
      >
        Email address
      </div>
      <div className="flex items-center w-6/12 mt-2 gap-2">
        <div
          className="flex items-center rounded-lg px-3 py-2 w-full"
          style={{
            border: `1px solid ${focusedEmail ? '#8a2be2' : '#00000010'}`,
            transition: 'border-color 0.3s ease',
          }}
        >
          <input
            ref={emailRef}
            className="w-11/12 outline-none focus:ring-0"
            onFocus={() => setFocusedEmail(true)}
            onBlur={() => setFocusedEmail(false)}
            value={email}
            onChange={(event) => {
              const value = event.target.value
              setEmail(value)
              setIsEmailChanged(true)
              setEmailCheckResponse(null)

              if (!value) {
                setValidEmail('')
                return
              }

              if (!validateEmail(value)) {
                setValidEmail('Invalid')
              } else {
                setValidEmail('')
                if (emailTimerRef.current) {
                  clearTimeout(emailTimerRef.current)
                }
                emailTimerRef.current = setTimeout(() => {
                  checkEmail(value)
                }, 300)
              }
            }}
            type="email"
            placeholder="Email"
            style={{ border: '0px solid hsl(var(--brand-primary))', outline: 'none' }}
          />
        </div>
        {isEmailChanged ? (
          emailLoader ? (
            <CircularProgress size={20} sx={{ color: 'hsl(var(--brand-primary))' }} />
          ) : validEmail === 'Invalid' ? (
            <div style={{ fontSize: 12, color: 'red' }}>Invalid</div>
          ) : emailCheckResponse?.status === false ? (
            <div style={{ fontSize: 12, color: 'red' }}>Taken</div>
          ) : (
            <button
              onClick={async () => {
                handleEmailSave()
              }}
              style={{ color: ' #8a2be2', fontSize: '14px', fontWeight: '600' }}
            >
              Save
            </button>
          )
        ) : (
          ""
        )}
        {/*<button
          onClick={() => {
            emailRef.current?.focus()
          }}
        >
          <Image
            src={'/svgIcons/editIcon.svg'}
            width={24}
            height={24}
            alt="*"
          />
        </button>*/}
      </div>
      {!isInternal && (
        <>
          <div
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: '#000',
              marginTop: '4vh',
            }}
          >
            Phone number
          </div>
          <div
            className="flex items-center rounded-lg px-3 py-2 w-6/12 mt-5 outline-none focus:ring-0"
            style={{
              border: `1px solid #00000010`,
              transition: 'border-color 0.3s ease',
            }}
          >
            <input
              readOnly
              className="w-11/12 outline-none focus:ring-0"
              // onFocus={() => setFocusedEmail(true)}
              // onBlur={() => setFocusedEmail(false)}
              value={phone}
              onChange={(event) => {
                // setEmail(event.target.value)
              }}
              type="text"
              placeholder="Phone"
              style={{ border: '0px solid #000000', outline: 'none' }}
            />
          </div>
        </>
      )}
      {userRole && userRole != 'Invitee' && userRole != 'AgencySubAccount' && (
        <>
          {(userType && userType === UserTypes.RealEstateAgent) ||
            (userType && userType === UserTypes.InsuranceAgent) ||
            (userType && userType === UserTypes.RealEstateAgent) ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#000',
                  marginTop: '4vh',
                }}
              >
                Farm
              </div>

              <div className="flex items-center w-6/12 mt-2 gap-2">
                <div
                  className="flex items-center rounded-lg px-3 py-2 w-full"
                  style={{
                    border: `1px solid ${focusedFarm ? '#8a2be2' : '#00000010'}`,
                    transition: 'border-color 0.3s ease',
                  }}
                >
                  <input
                    ref={farmRef}
                    className="w-11/12 outline-none focus:ring-0"
                    onFocus={() => setFocusedFarm(true)}
                    onBlur={() => setFocusedFarm(false)}
                    value={farm}
                    onChange={(event) => {
                      setFarm(event.target.value)
                      setIsFarmChanged(true)
                    }}
                    type="text"
                    placeholder="Farm"
                    style={{ border: '0px solid #000000', outline: 'none' }}
                  />
                </div>
                {isFarmChanged ? (
                  loading2 ? (
                    <CircularProgress size={20} sx={{ color: 'hsl(var(--brand-primary))' }} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleFarmSave()
                      }}
                      style={{ color: ' #8a2be2', fontSize: '14px', fontWeight: '600' }}
                    >
                      Save
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      farmRef.current?.focus()
                    }}
                  >
                    <Image
                      src={'/svgIcons/editIcon.svg'}
                      width={24}
                      height={24}
                      alt="*"
                    />
                  </button>
                )}
              </div>
            </>
          ) : (userType && userType === UserTypes.SolarRep) ||
            (userType && userType === UserTypes.SalesDevRep) ||
            (userType && userType === UserTypes.MarketerAgent) ||
            (userType && userType === UserTypes.TaxAgent) ||
            (userType && userType === UserTypes.RecruiterAgent) ||
            (userType && userType === UserTypes.DebtCollectorAgent) ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#000',
                  marginTop: '4vh',
                }}
              >
                Area of service
              </div>

              <div className="flex items-center w-6/12 mt-2 gap-2">
                <div
                  className="flex items-center rounded-lg px-3 py-2 w-full"
                  style={{
                    border: `1px solid ${focusedServiceArea ? '#8a2be2' : '#00000010'
                      }`,
                    transition: 'border-color 0.3s ease',
                  }}
                >
                  <input
                    ref={serviceAreaRef}
                    className="w-11/12 outline-none focus:ring-0"
                    onFocus={() => setFocusedServiceArea(true)}
                    onBlur={() => setFocusedServiceArea(false)}
                    value={serviceArea}
                    onChange={(event) => {
                      setServiceArea(event.target.value)
                      setIsServiceAreaChanged(true)
                    }}
                    type="text"
                    placeholder="Area of service"
                    style={{ border: '0px solid #000000', outline: 'none' }}
                  />
                </div>
                {isServiceAreaChanged ? (
                  loading6 ? (
                    <CircularProgress size={20} sx={{ color: 'hsl(var(--brand-primary))' }} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleServiceAreaSave()
                      }}
                      style={{ color: ' #8a2be2', fontSize: '14px', fontWeight: '600' }}
                    >
                      Save
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      serviceAreaRef.current?.focus()
                    }}
                  >
                    <Image
                      src={'/svgIcons/editIcon.svg'}
                      width={24}
                      height={24}
                      alt="*"
                    />
                  </button>
                )}
              </div>
            </>
          ) : (userType && userType === UserTypes.General) ||
            (userType && userType === UserTypes.Reception) ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#000',
                  marginTop: '4vh',
                }}
              >
                Teritorry
              </div>

              <div className="flex items-center w-6/12 mt-2 gap-2">
                <div
                  className="flex items-center rounded-lg px-3 py-2 w-full"
                  style={{
                    border: `1px solid ${focusedTerritory ? '#8a2be2' : '#00000010'
                      }`,
                    transition: 'border-color 0.3s ease',
                  }}
                >
                  <input
                    ref={teritorryRef}
                    className="w-11/12 outline-none focus:ring-0"
                    onFocus={() => setFocusedTerritory(true)}
                    onBlur={() => setFocusedTerritory(false)}
                    value={teritorry}
                    onChange={(event) => {
                      setTeritorry(event.target.value)
                      setIsTeritorryChanged(true)
                    }}
                    type="text"
                    placeholder="Teritorry"
                    style={{ border: '0px solid #000000', outline: 'none' }}
                  />
                </div>
                {isTeritorryChanged ? (
                  loading14 ? (
                    <CircularProgress size={20} sx={{ color: 'hsl(var(--brand-primary))' }} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleTeritorrySave()
                      }}
                      style={{
                        color: ' #8a2be2',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      Save
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      teritorryRef.current?.focus()
                    }}
                  >
                    <Image
                      src={'/svgIcons/editIcon.svg'}
                      width={24}
                      height={24}
                      alt="*"
                    />
                  </button>
                )}
              </div>
            </>
          ) : (
            ''
          )}

          {(userType && userType === UserTypes.RealEstateAgent) ||
            (userType && userType === UserTypes.InsuranceAgent) ||
            (userType && userType === UserTypes.RealEstateAgent) ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#000',
                  marginTop: '4vh',
                }}
              >
                Brokerage
              </div>

              <div className="flex items-center w-6/12 mt-2 gap-2">
                <div
                  className="flex items-center rounded-lg px-3 py-2 w-full"
                  style={{
                    border: `1px solid ${focusedBrokerage ? '#8a2be2' : '#00000010'
                      }`,
                    transition: 'border-color 0.3s ease',
                  }}
                >
                  <input
                    ref={brokerAgeRef}
                    className="w-11/12 outline-none focus:ring-0"
                    onFocus={() => setFocusedBrokerage(true)}
                    onBlur={() => setFocusedBrokerage(false)}
                    value={brokerAge}
                    onChange={(event) => {
                      setBrokerAge(event.target.value)
                      setIsBrokerageChanged(true)
                    }}
                    type="text"
                    placeholder="Brokerage"
                    style={{ border: '0px solid #000000', outline: 'none' }}
                  />
                </div>
                {isBrokerageChanged ? (
                  loading3 ? (
                    <CircularProgress size={20} sx={{ color: 'hsl(var(--brand-primary))' }} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleBrokerAgeSave()
                      }}
                      style={{ color: ' #8a2be2', fontSize: '14px', fontWeight: '600' }}
                    >
                      Save
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      brokerAgeRef.current?.focus()
                    }}
                  >
                    <Image
                      src={'/svgIcons/editIcon.svg'}
                      width={24}
                      height={24}
                      alt="*"
                    />
                  </button>
                )}
              </div>
            </>
          ) : (userType && userType === UserTypes.SolarRep) ||
            (userType && userType === UserTypes.SalesDevRep) ||
            (userType && userType === UserTypes.MarketerAgent) ||
            (userType && userType === UserTypes.Reception) ||
            (userType && userType === UserTypes.General) ||
            (userType && userType === UserTypes.DebtCollectorAgent) ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#000',
                  marginTop: '4vh',
                }}
              >
                Company
              </div>

              <div className="flex items-center w-6/12 mt-2 gap-2">
                <div
                  className="flex items-center rounded-lg px-3 py-2 w-full"
                  style={{
                    border: `1px solid ${focusedCompany ? '#8a2be2' : '#00000010'
                      }`,
                    transition: 'border-color 0.3s ease',
                  }}
                >
                  <input
                    ref={companyRef}
                    className="w-11/12 outline-none focus:ring-0"
                    onFocus={() => setFocusedCompany(true)}
                    onBlur={() => setFocusedCompany(false)}
                    value={company}
                    onChange={(event) => {
                      setCompany(event.target.value)
                      setIsCompanyChanged(true)
                    }}
                    type="text"
                    placeholder="Company"
                    style={{ border: '0px solid #000000', outline: 'none' }}
                  />
                </div>
                {isCompanyChanged ? (
                  loading8 ? (
                    <CircularProgress size={20} sx={{ color: 'hsl(var(--brand-primary))' }} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleCompanySave()
                      }}
                      style={{ color: ' #8a2be2', fontSize: '14px', fontWeight: '600' }}
                    >
                      Save
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      companyRef.current?.focus()
                    }}
                  >
                    <Image
                      src={'/svgIcons/editIcon.svg'}
                      width={24}
                      height={24}
                      alt="*"
                    />
                  </button>
                )}
              </div>
            </>
          ) : userType && userType === UserTypes.WebsiteAgent ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#000',
                  marginTop: '4vh',
                }}
              >
                Website URL
              </div>

              <div className="flex items-center w-6/12 mt-2 gap-2">
                <div
                  className="flex items-center rounded-lg px-3 py-2 w-full"
                  style={{
                    border: `1px solid ${focusedWebsite ? '#8a2be2' : '#00000010'
                      }`,
                    transition: 'border-color 0.3s ease',
                  }}
                >
                  <input
                    ref={websiteRef}
                    className="w-11/12 outline-none focus:ring-0"
                    onFocus={() => setFocusedWebSite(true)}
                    onBlur={() => setFocusedWebSite(false)}
                    value={websiteUrl}
                    onChange={(event) => {
                      setWebsiteUrl(event.target.value)
                      setIsWebsiteUrlChanged(true)
                    }}
                    type="text"
                    placeholder="Website URL"
                    style={{ border: '0px solid #000000', outline: 'none' }}
                  />
                </div>
                {isWebsiteUrlChanged ? (
                  loading10 ? (
                    <CircularProgress size={20} sx={{ color: 'hsl(var(--brand-primary))' }} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleWebsiteChange()
                      }}
                      style={{ color: ' #8a2be2', fontSize: '14px', fontWeight: '600' }}
                    >
                      Save
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      websiteRef.current?.focus()
                    }}
                  >
                    <Image
                      src={'/svgIcons/editIcon.svg'}
                      width={24}
                      height={24}
                      alt="*"
                    />
                  </button>
                )}
              </div>
            </>
          ) : (userType && userType === UserTypes.MedSpaAgent) ||
            (userType && userType === UserTypes.LawAgent) ||
            (userType && userType === UserTypes.LoanOfficerAgent) ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#000',
                  marginTop: '4vh',
                }}
              >
                Company Affiliation
              </div>

              <div className="flex items-center w-6/12 mt-2 gap-2">
                <div
                  className="flex items-center rounded-lg px-3 py-2 w-full"
                  style={{
                    border: `1px solid ${focusedCompanyAffiliation ? '#8a2be2' : '#00000010'
                      }`,
                    transition: 'border-color 0.3s ease',
                  }}
                >
                  <input
                    ref={companyAffiliationRef}
                    className="w-11/12 outline-none focus:ring-0"
                    onFocus={() => setFocusedCompanyAffiliation(true)}
                    onBlur={() => setFocusedCompanyAffiliation(false)}
                    value={companyAffiliation}
                    onChange={(event) => {
                      setCompanyAffiliation(event.target.value)
                      setIsCompanyAffiliationChanged(true)
                    }}
                    type="text"
                    placeholder="Company Affiliation"
                    style={{ border: '0px solid #000000', outline: 'none' }}
                  />
                </div>
                {isCompanyAffiliationChanged ? (
                  loading11 ? (
                    <CircularProgress size={20} sx={{ color: 'hsl(var(--brand-primary))' }} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleCompanyAffiliationSave()
                      }}
                      style={{ color: ' #8a2be2', fontSize: '14px', fontWeight: '600' }}
                    >
                      Save
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      companyAffiliationRef.current?.focus()
                    }}
                  >
                    <Image
                      src={'/svgIcons/editIcon.svg'}
                      width={24}
                      height={24}
                      alt="*"
                    />
                  </button>
                )}
              </div>
            </>
          ) : (
            ''
          )}

          {userType && userType === UserTypes.RealEstateAgent ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#000',
                  marginTop: '4vh',
                }}
              >
                How many homes did you sell last year
              </div>

              <div className="flex items-center w-6/12 mt-2 gap-2">
                <div
                  className="flex items-center rounded-lg px-3 py-2 w-full"
                  style={{
                    border: `1px solid ${focusedTransaction ? '#8a2be2' : '#00000010'
                      }`,
                    transition: 'border-color 0.3s ease',
                  }}
                >
                  <input
                    ref={transactionRef}
                    className="w-11/12 outline-none focus:ring-0"
                    onFocus={() => setFocusedTransaction(true)}
                    onBlur={() => setFocusedTransaction(false)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={transaction}
                    onChange={(e) => {
                      // Only keep digits in state
                      const onlyNums = e.target.value.replace(/\D/g, '')
                      setTransaction(onlyNums)
                      setIsTransactionChange(true)
                    }}
                    placeholder="Value"
                    style={{ border: '0px solid #000000', outline: 'none' }}
                  />
                </div>
                {isTransactionChanged ? (
                  loading4 ? (
                    <CircularProgress size={20} sx={{ color: 'hsl(var(--brand-primary))' }} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleTransactionSave()
                      }}
                      style={{ color: ' #8a2be2', fontSize: '14px', fontWeight: '600' }}
                    >
                      Save
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      transactionRef.current?.focus()
                    }}
                  >
                    <Image
                      src={'/svgIcons/editIcon.svg'}
                      width={24}
                      height={24}
                      alt="*"
                    />
                  </button>
                )}
              </div>
            </>
          ) : userType && userType === UserTypes.SolarRep ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#000',
                  marginTop: '4vh',
                }}
              >
                Installation Volume per Year
              </div>

              <div className="flex items-center w-6/12 mt-2 gap-2">
                <div
                  className="flex items-center rounded-lg px-3 py-2 w-full"
                  style={{
                    border: `1px solid ${focusedInstallationVolume ? '#8a2be2' : '#00000010'
                      }`,
                    transition: 'border-color 0.3s ease',
                  }}
                >
                  <input
                    ref={installationVolumeRef}
                    // type="number"
                    className="w-11/12 outline-none focus:ring-0"
                    onFocus={() => setFocusedInstallationVolume(true)}
                    onBlur={() => setFocusedInstallationVolume(false)}
                    value={installationVolume}
                    onChange={(event) => {
                      setInstallationVolume(event.target.value)
                      setIsInstallationVolumeChanged(true)
                    }}
                    placeholder="Value"
                    style={{ border: '0px solid #000000', outline: 'none' }}
                  />
                </div>
                {isInstallationVolumechanged ? (
                  loading7 ? (
                    <CircularProgress size={20} sx={{ color: 'hsl(var(--brand-primary))' }} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleInstallationVolumeSave()
                      }}
                      style={{ color: ' #8a2be2', fontSize: '14px', fontWeight: '600' }}
                    >
                      Save
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      installationVolumeRef.current?.focus()
                    }}
                  >
                    <Image
                      src={'/svgIcons/editIcon.svg'}
                      width={24}
                      height={24}
                      alt="*"
                    />
                  </button>
                )}
              </div>
            </>
          ) : (
            ''
          )}

          {(userType && userType === UserTypes.SolarRep) ||
            (userType && userType === UserTypes.DebtCollectorAgent) ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#000',
                  marginTop: '4vh',
                }}
              >
                {userType === UserTypes.DebtCollectorAgent
                  ? ' Balance Size of Debts '
                  : 'Average Project Size (kw)'}
              </div>

              <div className="flex items-center w-6/12 mt-2 gap-2">
                <div
                  className="flex items-center rounded-lg px-3 py-2 w-full"
                  style={{
                    border: `1px solid ${focusedProjectSize ? '#8a2be2' : '#00000010'
                      }`,
                    transition: 'border-color 0.3s ease',
                  }}
                >
                  <input
                    ref={projectSizeRef}
                    type="number"
                    className="w-11/12 outline-none focus:ring-0"
                    onFocus={() => setFocusedProjectSize(true)}
                    onBlur={() => setFocusedProjectSize(false)}
                    value={projectSize}
                    onChange={(event) => {
                      setProjectSize(event.target.value)
                      setIsprojectSizeChanged(true)
                    }}
                    placeholder="Value"
                    style={{ border: '0px solid #000000', outline: 'none' }}
                  />
                </div>
                {isProjectSizeChanged ? (
                  loading9 ? (
                    <CircularProgress size={20} sx={{ color: 'hsl(var(--brand-primary))' }} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleProjectSizeSave()
                      }}
                      style={{ color: ' #8a2be2', fontSize: '14px', fontWeight: '600' }}
                    >
                      Save
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      projectSizeRef.current?.focus()
                    }}
                  >
                    <Image
                      src={'/svgIcons/editIcon.svg'}
                      width={24}
                      height={24}
                      alt="*"
                    />
                  </button>
                )}
              </div>
            </>
          ) : userType && userType === UserTypes.MedSpaAgent ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#000',
                  marginTop: '4vh',
                }}
              >
                Clients per month
              </div>

              <div className="flex items-center w-6/12 mt-2 gap-2">
                <div
                  className="flex items-center rounded-lg px-3 py-2 w-full"
                  style={{
                    border: `1px solid ${focusedClientsPerMonth ? '#8a2be2' : '#00000010'
                      }`,
                    transition: 'border-color 0.3s ease',
                  }}
                >
                  <input
                    ref={clientsPerMonthRef}
                    type="number"
                    className="w-11/12 outline-none focus:ring-0"
                    onFocus={() => setFocusedClientsPerMonth(true)}
                    onBlur={() => setFocusedClientsPerMonth(false)}
                    value={clientsPerMonth}
                    onChange={(event) => {
                      setClientsPerMonth(event.target.value)
                      setIsClientsPerMonthChanged(true)
                    }}
                    placeholder="Value"
                    style={{ border: '0px solid #000000', outline: 'none' }}
                  />
                </div>
                {isClientsPerMonthChanged ? (
                  loading12 ? (
                    <CircularProgress size={20} sx={{ color: 'hsl(var(--brand-primary))' }} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleClientsPerMonthSave()
                      }}
                      style={{ color: ' #8a2be2', fontSize: '14px', fontWeight: '600' }}
                    >
                      Save
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      clientsPerMonthRef.current?.focus()
                    }}
                  >
                    <Image
                      src={'/svgIcons/editIcon.svg'}
                      width={24}
                      height={24}
                      alt="*"
                    />
                  </button>
                )}
              </div>
            </>
          ) : userType && userType === UserTypes.LawAgent ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#000',
                  marginTop: '4vh',
                }}
              >
                Cases per month
              </div>

              <div className="flex items-center w-6/12 mt-2 gap-2">
                <div
                  className="flex items-center rounded-lg px-3 py-2 w-full"
                  style={{
                    border: `1px solid ${focusedCasesPerMonth ? '#8a2be2' : '#00000010'
                      }`,
                    transition: 'border-color 0.3s ease',
                  }}
                >
                  <input
                    ref={casesPerMonthRef}
                    type="number"
                    className="w-11/12 outline-none focus:ring-0"
                    onFocus={() => setFocusedCasesPerMonth(true)}
                    onBlur={() => setFocusedCasesPerMonth(false)}
                    value={CasesPerMonth}
                    onChange={(event) => {
                      setCasessPerMonth(event.target.value)
                      setIcasesPerMonthChanged(true)
                    }}
                    placeholder="Value"
                    style={{ border: '0px solid #000000', outline: 'none' }}
                  />
                </div>
                {iscasesPerMonthChanged ? (
                  loading12 ? (
                    <CircularProgress size={20} sx={{ color: 'hsl(var(--brand-primary))' }} />
                  ) : (
                    <button
                      onClick={async () => {
                        handleCasesPerMonthSave()
                      }}
                      style={{ color: ' #8a2be2', fontSize: '14px', fontWeight: '600' }}
                    >
                      Save
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      casesPerMonthRef.current?.focus()
                    }}
                  >
                    <Image
                      src={'/svgIcons/editIcon.svg'}
                      width={24}
                      height={24}
                      alt="*"
                    />
                  </button>
                )}
              </div>
            </>
          ) : (
            ''
          )}
          {userType && userType === UserTypes.SolarRep ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#000',
                  marginTop: '4vh',
                }}
              >
                Primary Client Type
              </div>

              <div
                className="flex flex-row items-center gap-4"
                style={{ marginTop: '8px' }}
              >
                {primaryClientTypes.map((item, index) => {
                  return (
                    <div key={index} className="w-full">
                      <button
                        className="border border-[#00000010] rounded px-4 h-[70px] outline-none focus:outline-none focus:ring-0 w-full"
                        style={{
                          fontSize: 15,
                          fontWeight: '500',
                          borderRadius: '7px',
                          borderRadius: '30px',
                          paddingInline: index === 2 && '40px',
                          border:
                            clientType === item.value
                              ? '2px solid hsl(var(--brand-primary))'
                              : '',
                          backgroundColor:
                            clientType === item.value ? 'hsl(var(--brand-primary) / 0.2)' : '',
                        }}
                      >
                        {item.title}
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          ) : userType && userType === UserTypes.DebtCollectorAgent ? (
            <>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#000',
                  marginTop: '4vh',
                }}
              >
                Typical Collection Strategy
              </div>

              <div
                className="flex flex-row items-center gap-4"
                style={{ marginTop: '8px' }}
              >
                {primaryClientTypes3.map((item, index) => {
                  return (
                    <div key={index} className="w-full">
                      <button
                        className="border border-[#00000010] rounded px-4 h-[70px] outline-none focus:outline-none focus:ring-0 w-full"
                        style={{
                          fontSize: 15,
                          fontWeight: '500',
                          borderRadius: '7px',
                          borderRadius: '30px',
                          paddingInline: index === 2 && '40px',
                          border:
                            collectionStratigy === item.value
                              ? '2px solid hsl(var(--brand-primary))'
                              : '',
                          backgroundColor:
                            collectionStratigy === item.value
                              ? 'hsl(var(--brand-primary) / 0.2)'
                              : '',
                        }}
                      >
                        {item.title}
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            ''
          )}
          {(userType && userType === UserTypes.LawAgent) ||
            (userType && userType === UserTypes.LoanOfficerAgent) ? (
            <>
              <div style={styles.headingStyle} className="mt-6">
                Client Type
              </div>

              <div
                className="flex w-full flex-wrap flex-row items-center gap-2"
                style={{ marginTop: '8px', flexWrap: 'wrap' }}
              >
                {choseClientType().map((item, index) => {
                  return (
                    <div key={index} className="w-full">
                      <button
                        className="border border-[#00000010] rounded px-4 py-4 outline-none focus:outline-none focus:ring-0"
                        style={{
                          ...styles.inputStyle,
                          borderRadius: '30px',
                          paddingInline: index === 2 && '40px',
                          border:
                            clientType2 === item.title
                              ? '2px solid hsl(var(--brand-primary))'
                              : '',
                          backgroundColor:
                            clientType2 === item.title ? 'hsl(var(--brand-primary) / 0.2)' : '',
                        }}
                      >
                        {item.title}
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            ''
          )}
          {userType && userType === UserTypes.LawAgent ? (
            <>
              <div style={styles.headingStyle} className="mt-6">
                Consultation Format
              </div>

              <div
                className="flex w-full flex-wrap flex-row items-center gap-2"
                style={{ marginTop: '8px' }}
              >
                {ConsultationFormat.map((item, index) => {
                  return (
                    <div key={index} className="w-full">
                      <button
                        className="border border-[#00000010] rounded px-4 py-4 outline-none focus:outline-none focus:ring-0"
                        style={{
                          ...styles.inputStyle,
                          borderRadius: '30px',
                          paddingInline: index === 2 && '40px',
                          border:
                            consoltation === item.title
                              ? '2px solid hsl(var(--brand-primary))'
                              : '',
                          backgroundColor:
                            consoltation === item.title ? 'hsl(var(--brand-primary) / 0.2)' : '',
                        }}
                      >
                        {item.title}
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            ''
          )}
        </>
      )}
      {userRole && userRole != 'Invitee' && (
        <>
          <div className="w-full flex flex-row items-center justify-between">
            <div
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: '#000',
                marginTop: '4vh',
                marginBottom: '2vh',
              }}
            >
              What would you like to assign to your AI
            </div>
          </div>

          <div className="w-9/12 flex flex-row flex-wrap gap-2">
            {agentServices.map((item, index) => {
              return (
                <div
                  key={index}
                  className="w-5/12 p-4 flex flex-col gap-2 items-start rounded-2xl"
                  style={{
                    borderWidth: 2,
                    borderColor: serviceId.includes(item.id)
                      ? 'hsl(var(--brand-primary))'
                      : '#00000008',
                    backgroundColor: serviceId.includes(item.id)
                      ? 'hsl(var(--brand-primary))05'
                      : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: '700' }}>
                    {item.title}
                  </div>

                  <div style={{ fontSize: 14, fontWeight: '500' }}>
                    {item.description}
                  </div>
                  <div className="mt-auto self-end flex-shrink-0">
                    <Checkbox
                      checked={serviceId.includes(item.id)}
                      className="h-6 w-6 !rounded-full border-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="w-full flex flex-row items-center justify-between">
            <div
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: '#000',
                marginTop: '4vh',
                marginBottom: '2vh',
              }}
            >
              {agentAreasOfFocus.length > 0
                ? getAreaOfFocusTitle(userType || selectedUser?.userType) || 'What area do you focus on?'
                : 'What industries do you specialize in?'}
            </div>
          </div>

          {agentAreasOfFocus.length > 0 && (
            <div className="w-9/12 flex flex-row flex-wrap gap-2 ">
              {agentAreasOfFocus.map((item, index) => (
                <div
                  key={index}
                  className="w-5/12 p-4 flex flex-col justify-betweeen items-start rounded-2xl"
                  style={{
                    borderWidth: 2,
                    borderColor: selectedArea.includes(item.id)
                      ? 'hsl(var(--brand-primary))'
                      : '#00000008',
                    backgroundColor: selectedArea.includes(item.id)
                      ? 'hsl(var(--brand-primary))05'
                      : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: '700' }}>
                    {item.title}
                  </div>

                  <div style={{ fontSize: 14, fontWeight: '500' }}>
                    {item.description}
                  </div>
                  <div className="mt-auto self-end flex-shrink-0">
                    <Checkbox
                      checked={selectedArea.includes(item.id)}
                      className="h-6 w-6 !rounded-full border-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {agentIndustries.length > 0 && (
            <div className="w-9/12 flex flex-row flex-wrap gap-2 ">
              {agentIndustries.map((item, index) => (
                <div
                  key={index}
                  className="w-5/12 p-4 flex flex-col justify-betweeen items-start rounded-2xl"
                  style={{
                    borderWidth: 2,
                    borderColor: selectedIndustries.includes(item.id)
                      ? 'hsl(var(--brand-primary))'
                      : '#00000008',
                    backgroundColor: selectedIndustries.includes(item.id)
                      ? 'hsl(var(--brand-primary))05'
                      : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: '700' }}>
                    {item.title}
                  </div>

                  <div style={{ fontSize: 14, fontWeight: '500' }}>
                    {item.description}
                  </div>
                  <div className="mt-auto self-end flex-shrink-0">
                    <Checkbox
                      checked={selectedIndustries.includes(item.id)}
                      className="h-6 w-6 !rounded-full border-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminBasicInfo

const styles = {
  headingStyle: {
    fontSize: 16,
    fontWeight: '600',
  },
}
