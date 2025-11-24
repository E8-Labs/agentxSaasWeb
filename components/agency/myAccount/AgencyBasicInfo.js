'use client'

import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import { UpdateProfile } from '@/components/apis/UpdateProfile'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import { Input } from '@/components/ui/input'
import { UserTypes } from '@/constants/UserTypes'
import { useUser } from '@/hooks/redux-hooks'
import { logout } from '@/utilities/UserUtility'

function AgencyBasicInfo({ selectedAgency }) {
  const router = useRouter()
  const { setUser: setReduxUser } = useUser()
  const emailRef = useRef(null)

  const [serviceLoader, setServiceLoader] = useState(false)

  const [focusedName, setFocusedName] = useState(false)

  const [focusedEmail, setFocusedEmail] = useState(false)
  const [focusedWebsite, setFocusedWebsite] = useState(false)
  const [focusedCompany, setFocusedCompany] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [phone, setPhone] = useState('')

  const [isNameChanged, setIsNameChanged] = useState(false)
  const [isEmailChanged, setIsEmailChanged] = useState(false)
  const [isWebsiteUrlChanged, setIsWebsiteUrlChanged] = useState(false)
  const [isCompanyChanged, setIsCompanyChanged] = useState(false)

  const [loading, setloading] = useState(false)

  const [loading5, setloading5] = useState(false)
  const [loading10, setLoading10] = useState(false)
  const [loading13, setLoading13] = useState(false)
  const [loading14, setLoading14] = useState(false)

  // Email validation and checking states
  const [originalEmail, setOriginalEmail] = useState('')
  const [emailLoader, setEmailLoader] = useState(false)
  const [emailCheckResponse, setEmailCheckResponse] = useState(null)
  const [validEmail, setValidEmail] = useState('')
  const emailTimerRef = useRef(null)

  // Success message states
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Error message states
  const [showErrorMessage, setShowErrorMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [selectedImage, setSelectedImage] = useState('')
  const [dragging, setDragging] = useState(false)

  const [websiteUrl, setWebsiteUrl] = useState('')

  const [company, setCompany] = useState('')
  const [minSize, setMinSize] = useState('')
  const [maxSize, setMaxSize] = useState('')

  const sizeList = [
    { label: '1-10', min: 1, max: 10 },
    { label: '11-50', min: 11, max: 50 },
    { label: '51-100', min: 51, max: 100 },
    { label: '100+', min: 101, max: 1000 }, // You can set a reasonable upper bound
  ]

  //fetching the data
  useEffect(() => {
    const LocalData = localStorage.getItem('User')
    if (selectedAgency) {
      const agencyData = localStorage.getItem('AdminProfileData')
      if (agencyData) {
        const data = JSON.parse(agencyData)
        setValues(data)
      }
    } else {
      if (LocalData) {
        const userData = JSON.parse(LocalData)
        console.log('user data is:', userData)
        const data = userData?.user
        setValues(data)
      }
    }

    getProfile()
  }, [])

  const setValues = (data) => {
    console.log('Data passed for values are', data)
    setName(data.name)
    setSelectedImage(data.thumb_profile_image)
    setEmail(data.email)
    setOriginalEmail(data.email || '')

    setPhone(data.phone)

    setCompany(data.company)
    // setProjectSize(data.projectSizeKw);
    setWebsiteUrl(data.website)
    setMinSize(data.companySizeMin)
    setMaxSize(data.companySizeMax)
  }

  const uploadeImage = async (imageUrl) => {
    try {
      const data = localStorage.getItem('User')
      if (data) {
        let u = JSON.parse(data)
        const apidata = new FormData()

        apidata.append('media', imageUrl)
        if (selectedAgency) {
          apidata.append('userId', selectedAgency.id)
        }

        // //console.log;
        for (let pair of apidata.entries()) {
          // //console.log; // Debug FormData contents
        }
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
            // //console.log;
            u.user = response.data.data

            //// //console.log
            localStorage.setItem('User', JSON.stringify(u))
            // Update Redux store immediately
            setReduxUser(u)
            // //console.log;
            window.dispatchEvent(
              new CustomEvent('UpdateProfile', { detail: { update: true } }),
            )
            return response.data.data
          } else {
            throw new Error('Upload failed: Invalid response status')
          }
        } else {
          throw new Error('Upload failed: No response received')
        }
      } else {
        throw new Error('Upload failed: No user data found')
      }
    } catch (e) {
      // Re-throw the error so it can be caught by the caller
      throw e
    }
  }

  //function to fetch the profile data
  const getProfile = async () => {
    try {
      await getProfileDetails(selectedAgency)
    } catch (error) {
      // console.error("Error occured in api is error", error);
    }
  }

  //function to handle image selection
  const handleImageChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      setloading5(true)
      const imageUrl = URL.createObjectURL(file) // Generate preview URL

      setSelectedImage(imageUrl) // Set the preview image

      const result = await uploadeImage(file)
      if (result) {
        showSuccess('Profile image uploaded')
      }
    } catch (error) {
      // console.error("Error uploading image:", error);
      setErrorMessage('Failed to upload profile image')
      setShowErrorMessage(true)
    } finally {
      setloading5(false)
    }
  }

  const handleDrop = async (event) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      try {
        setloading5(true)
        const imageUrl = URL.createObjectURL(file)
        setSelectedImage(imageUrl)
        const result = await uploadeImage(file)
        if (result) {
          showSuccess('Profile image uploaded')
        }
      } catch (error) {
        // console.error("Error uploading image:", error);
        setErrorMessage('Failed to upload profile image')
        setShowErrorMessage(true)
      } finally {
        setloading5(false)
      }
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const areas = [
    {
      id: 1,
      heading: 'Commercial real estate',
      subHeading:
        'Dealing with commercial real estate like offices, retail spaces, and industrial properties',
    },
    {
      id: 2,
      heading: 'Residential real estate',
      subHeading: 'Buying and selling residential properties',
    },
    {
      id: 3,
      heading: 'Investment property',
      subHeading:
        'Helping clients invest in income-generating propertiesd) Selling high-end, luxury homes in exclusive areas',
    },
    {
      id: 4,
      heading: 'Land broker',
      subHeading: 'Specializing in the sale of undeveloped land',
    },
    {
      id: 5,
      heading: 'Sale associate',
      subHeading: 'Selling newly built homes for builders and developers',
    },
    {
      id: 6,
      heading: 'Relocation consultant',
      subHeading:
        'Assisting people with finding homes and moving when they relocate',
    },
    {
      id: 7,
      heading: 'Real estate management',
      subHeading:
        'Managing properties, including leasing and maintenance, for owners',
    },
  ]

  useEffect(() => {
    getAgentDefaultData()
  }, [])

  const getAgentDefaultData = async () => {
    try {
      setServiceLoader(true)
      let data = localStorage.getItem('User')
      if (data) {
        let d = JSON.parse(data)
        let AgentTypeTitle = d.user.userType
        // //console.log;

        let ApiPath = `${Apis.defaultData}?type=${AgentTypeTitle}`
        if (selectedAgency) {
          ApiPath = ApiPath + `?userId=${selectedAgency.id}`
        }
        console.log('Get agency default api', ApiPath)
        const response = await axios.get(ApiPath, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response) {
          //console.log;
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

  const handleNameSave = async () => {
    try {
      setloading(true)
      const data = { name: name }
      await UpdateProfile(data)
      setloading(false)
      setIsNameChanged(false)
      showSuccess('Account Updated')
    } catch (e) {
      // //console.log;
    }
  }

  // Helper function to show success message
  const showSuccess = (message) => {
    setSuccessMessage(message)
    setShowSuccessMessage(true)
  }

  // Email validation function
  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    // Check if email contains consecutive dots, which are invalid
    if (/\.\./.test(email)) {
      return false
    }

    // Check the general pattern for a valid email
    return emailPattern.test(email)
  }

  // Function to check if email exists in database
  const checkEmail = async (value) => {
    try {
      // Don't check if email hasn't changed
      if (value === originalEmail) {
        setEmailCheckResponse(null)
        setValidEmail('')
        return
      }

      setValidEmail('')
      setEmailLoader(true)

      const ApiPath = Apis.CheckEmail

      const ApiData = {
        email: value,
      }

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        if (response.data.status === true) {
          // Email is available
          setEmailCheckResponse(response.data)
        } else {
          // Email is taken
          setEmailCheckResponse(response.data)
        }
      }
    } catch (error) {
      console.error('Error checking email:', error)
    } finally {
      setEmailLoader(false)
    }
  }

  const handleEmailSave = async () => {
    try {
      // Validate email format
      if (!validateEmail(email)) {
        setShowSuccessMessage(false)
        setSuccessMessage('')
        // We'll show error in the UI via validEmail state
        return
      }

      // Check if email is taken (only if it's different from original)
      if (email !== originalEmail) {
        // Wait for email check to complete if it's in progress
        if (emailLoader) {
          return
        }

        // If email check hasn't been done or email is taken
        if (emailCheckResponse === null) {
          return
        }

        if (emailCheckResponse.status === false) {
          // Email is taken, error will show in UI
          return
        }
      }

      setLoading13(true)
      const data = { email: email }
      if (selectedAgency) {
        data.userId = selectedAgency.id
      }
      await UpdateProfile(data)
      setLoading13(false)
      setIsEmailChanged(false)
      setOriginalEmail(email) // Update original email after successful save
      setEmailCheckResponse(null)
      setValidEmail('')
      showSuccess('Account Updated')
    } catch (e) {
      setLoading13(false)
      // //console.log;
    }
  }

  const handleWebsiteChange = async () => {
    try {
      setLoading10(true)
      let data = {
        website: websiteUrl,
      }
      if (selectedAgency) {
        data.userId = selectedAgency.id
      }
      await UpdateProfile(data)
      setIsWebsiteUrlChanged(false)
      setLoading10(false)
      showSuccess('Account Updated')
    } catch (e) {
      setLoading10(false)
      // //console.log;
    }
  }

  const handleCompanySave = async () => {
    try {
      setLoading14(true)
      let data = {
        company: company,
      }
      if (selectedAgency) {
        data.userId = selectedAgency.id
      }
      await UpdateProfile(data)
      setIsCompanyChanged(false)
      setLoading14(false)
      showSuccess('Account Updated')
    } catch (e) {
      setLoading14(false)
      // //console.log;
    }
  }

  return (
    <div
      className="w-full flex flex-col items-start px-8 py-2"
      style={{
        paddingBottom: '50px',
        height: '100%',
        overflow: 'auto',
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
        <div>
          <button
            className="text-red text-start mt-4 bg-[#FF4E4E40] px-3 py-1 rounded-3xl"
            style={{ fontWeight: '600', fontSize: 17 }}
            onClick={() => {
             logout()
            }}
          >
            Log Out
          </button>
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
          <CircularProgress size={20} />
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

            <Image
              src={'/otherAssets/cameraBtn.png'}
              style={{ marginLeft: -25 }}
              height={36}
              width={36}
              alt="profileImage"
            />
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

      <div style={styles.headingStyle}>Full Name</div>
      <div className="flex items-center w-6/12 mt-2 gap-2">
        <Input
          className="border rounded px-3 py-2.5 outline-none focus:outline-none focus:ring-0 focus:border-black w-full transition-colors"
          style={{
            ...styles.inputStyle,
            marginTop: '8px',
            border: `1px solid ${focusedName ? '#000' : '#00000010'}`,
          }}
          onFocus={() => setFocusedName(true)}
          onBlur={() => setFocusedName(false)}
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setIsNameChanged(true)
          }}
          type="text"
          placeholder="Name"
        />
        {isNameChanged &&
          (loading ? (
            <CircularProgress size={20} />
          ) : (
            <button
              onClick={async () => {
                handleNameSave()
              }}
              style={{ color: ' #8a2be2', fontSize: '14px', fontWeight: '600' }}
            >
              Save
            </button>
          ))}
      </div>

      <div style={styles.headingStyle}>Email address</div>
      <div className="flex items-center w-6/12 mt-2 gap-2">
        <Input
          ref={emailRef}
          className="border rounded px-3 py-2.5 outline-none focus:outline-none focus:ring-0 focus:border-black w-full transition-colors"
          style={{
            ...styles.inputStyle,
            marginTop: '8px',
            border: `1px solid ${focusedEmail ? '#000' : '#00000010'}`,
          }}
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
              // Clear previous timer
              if (emailTimerRef.current) {
                clearTimeout(emailTimerRef.current)
              }

              // Set a new timeout to check email after user stops typing
              emailTimerRef.current = setTimeout(() => {
                checkEmail(value)
              }, 300)
            }
          }}
          type="text"
          placeholder="Email"
        />
        {isEmailChanged && (
          emailLoader ? (
            <CircularProgress size={20} />
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
        )}
      </div>

      <div style={styles.headingStyle}>Phone number</div>
      <div className="w-6/12 mt-2">
        <Input
          readOnly
          className="border rounded px-3 py-2.5 outline-none focus:outline-none focus:ring-0 focus:border-black w-full transition-colors"
          style={{
            ...styles.inputStyle,
            marginTop: '8px',
            border: '1px solid #00000010',
          }}
          value={phone}
          type="text"
          placeholder="Phone number"
        />
      </div>

      <div style={styles.headingStyle}>Company</div>
      <div className="flex items-center w-6/12 mt-2 gap-2">
        <Input
          className="border rounded px-3 py-2.5 outline-none focus:outline-none focus:ring-0 focus:border-black w-full transition-colors"
          style={{
            ...styles.inputStyle,
            marginTop: '8px',
            border: `1px solid ${focusedCompany ? '#000' : '#00000010'}`,
          }}
          onFocus={() => setFocusedCompany(true)}
          onBlur={() => setFocusedCompany(false)}
          value={company}
          onChange={(event) => {
            setCompany(event.target.value)
            setIsCompanyChanged(true)
          }}
          type="text"
          placeholder="Company"
        />
        {isCompanyChanged &&
          (loading14 ? (
            <CircularProgress size={20} />
          ) : (
            <button
              onClick={async () => {
                handleCompanySave()
              }}
              style={{ color: ' #8a2be2', fontSize: '14px', fontWeight: '600' }}
            >
              Save
            </button>
          ))}
      </div>

      <div style={styles.headingStyle}>Website</div>
      <div className="flex items-center w-6/12 mt-2 gap-2">
        <Input
          className="border rounded px-3 py-2.5 outline-none focus:outline-none focus:ring-0 focus:border-black w-full transition-colors"
          style={{
            ...styles.inputStyle,
            marginTop: '8px',
            border: `1px solid ${focusedWebsite ? '#000' : '#00000010'}`,
          }}
          onFocus={() => setFocusedWebsite(true)}
          onBlur={() => setFocusedWebsite(false)}
          value={websiteUrl}
          onChange={(event) => {
            setWebsiteUrl(event.target.value)
            setIsWebsiteUrlChanged(true)
          }}
          type="text"
          placeholder="Website"
        />
        {isWebsiteUrlChanged &&
          (loading10 ? (
            <CircularProgress size={20} />
          ) : (
            <button
              onClick={async () => {
                handleWebsiteChange()
              }}
              style={{ color: ' #8a2be2', fontSize: '14px', fontWeight: '600' }}
            >
              Save
            </button>
          ))}
      </div>

      <div style={styles.headingStyle}>Company Size</div>
      <div className="w-6/12 mt-2">
        <FormControl fullWidth>
          <Select
            value={minSize && maxSize ? `${minSize}-${maxSize}` : ''}
            onChange={(e) => {
              const value = e.target.value
              if (value) {
                const [min, max] = value.split('-')
                setMinSize(parseInt(min))
                setMaxSize(parseInt(max))
              } else {
                setMinSize('')
                setMaxSize('')
              }
            }}
            displayEmpty
            sx={{
              height: '40px',
              borderRadius: '7px',
              fontSize: '15px',
              fontWeight: '500',
              border: '1px solid #00000020',
              '& .MuiOutlinedInput-notchedOutline': {
                border: '1px solid #00000020',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                border: '1px solid #00000020',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                border: '1px solid #000',
              },
            }}
          >
            <MenuItem value="">
              <em>Select company size</em>
            </MenuItem>
            {sizeList.map((size) => (
              <MenuItem key={size.label} value={`${size.min}-${size.max}`}>
                {size.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Success Message */}
      <AgentSelectSnackMessage
        isVisible={showSuccessMessage}
        hide={() => setShowSuccessMessage(false)}
        message={successMessage}
        type={SnackbarTypes.Success}
      />

      {/* Error Message */}
      <AgentSelectSnackMessage
        isVisible={showErrorMessage}
        hide={() => setShowErrorMessage(false)}
        message={errorMessage}
        type={SnackbarTypes.Error}
      />
    </div>
  )
}

export default AgencyBasicInfo

const styles = {
  headingStyle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: '4vh',
  },
  inputStyle: {
    fontSize: 15,
    fontWeight: '500',
    borderRadius: '7px',
  },
}
