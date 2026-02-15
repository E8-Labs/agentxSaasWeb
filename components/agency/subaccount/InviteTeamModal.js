import 'react-phone-input-2/lib/style.css'

import { Box, CircularProgress, Modal } from '@mui/material'
import axios from 'axios'
import parsePhoneNumberFromString from 'libphonenumber-js'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import PhoneInput from 'react-phone-input-2'

import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import { checkPhoneNumber } from '@/components/onboarding/services/apisServices/ApiService'
import PermissionManager from '@/components/permissions/PermissionManager'

const InviteTeamModal = ({
  openInvitePopup,
  handleCloseInviteTeam,
  userID,
}) => {
  const timerRef = useRef(null)
  const router = useRouter()

  // const [openInvitePopup, setOpenInvitePopup] = useState(false);
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  //err msg
  const [showError, setShowError] = useState(false)
  //emial veriables
  const [emailLoader, setEmailLoader] = useState(false)
  const [emailCheckResponse, setEmailCheckResponse] = useState(null)
  const [validEmail, setValidEmail] = useState('')

  const [showSnak, setShowSnak] = useState(false)
  const [snackTitle, setSnackTitle] = useState('Team invite sent successfully')

  //others
  const [inviteTeamLoader, setInviteTeamLoader] = useState(false)
  const [reInviteTeamLoader, setReInviteTeamLoader] = useState(false)

  //variables for phone number err messages and checking
  const [errorMessage, setErrorMessage] = useState(null)
  const [checkPhoneLoader, setCheckPhoneLoader] = useState(null)
  const [checkPhoneResponse, setCheckPhoneResponse] = useState(null)
  const [countryCode, setCountryCode] = useState('') // Default country

  // Permission management state
  const [showPermissionManager, setShowPermissionManager] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState(null)

  //email validation function
  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    // Check if email contains consecutive dots, which are invalid
    if (/\.\./.test(email)) {
      return false
    }

    // Check the general pattern for a valid email
    return emailPattern.test(email)
  }

  //check email
  const checkEmail = async (value) => {
    try {
      setValidEmail('')
      setEmailLoader(true)

      const ApiPath = Apis.CheckEmail

      const ApiData = {
        email: value,
      }

      // //console.log;

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          // //console.log;
          setEmailCheckResponse(response.data)
        } else {
          setEmailCheckResponse(response.data)
        }
      }
    } catch (error) {
      console.error('Error occured in check email api is :', error)
    } finally {
      setEmailLoader(false)
    }
  }

  //phone input change
  const handlePhoneNumberChange = (phone) => {
    setPhone(phone)
    setErrorMessage(null)
    validatePhoneNumber(phone)
    setCheckPhoneResponse(null)

    if (!phone) {
      setErrorMessage(null)
      setCheckPhoneResponse(null)
    }
  }

  //number validation
  const validatePhoneNumber = async (phoneNumber) => {
    // const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`);
    // parsePhoneNumberFromString(`+${phone}`, countryCode?.toUpperCase())
    const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`)
    // if (parsedNumber && parsedNumber.isValid() && parsedNumber.country === countryCode?.toUpperCase()) {
    if (!parsedNumber || !parsedNumber.isValid()) {
      setErrorMessage('Invalid')
    } else {
      setErrorMessage('')

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      try {
        setCheckPhoneLoader('Checking...')
        let response = await checkPhoneNumber(phoneNumber)
        // //console.log;
        // setErrorMessage(null)
        setCheckPhoneResponse(response.data)
        if (response.data.status === false) {
          setErrorMessage('Taken')
        } else if (response.data.status === true) {
          setErrorMessage('Available')
        }
      } catch (error) {
        // console.error("Error occured in api is", error);
        setCheckPhoneLoader(null)
      } finally {
        setCheckPhoneLoader(null)
      }

      // setCheckPhoneResponse(null);
      // //console.log;
    }
  }

  //funcion to invitem tem member
  const inviteTeamMember = async (item) => {
    // return
    if (!item.name || !item.email || !item.phone) {
      setShowError(true)
      return
    }
    try {
      const data = localStorage.getItem('User')
      setInviteTeamLoader(true)
      if (data) {
        let u = JSON.parse(data)

        let path = Apis.inviteTeamMember

        let apidata = {
          name: item.name,
          email: item.email,
          phone: item.phone,
          userId: userID,
          permissions: selectedPermissions, // Include permissions if set
        }

        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response) {
          setInviteTeamLoader(false)
          if (response.data.status === true) {
            setShowSnak(true)
            // setSnackTitle("Team invite sent successfully");
            setName('')
            setEmail('')
            setPhone('')
            setSelectedPermissions(null) // Reset permissions after successful invitation
            handleCloseInviteTeam('showSnack')
            // getMyteam()
          } else {
            // //console.log;
          }
        }
      }
    } catch (e) {
      setInviteTeamLoader(false)
      setReInviteTeamLoader(false)
      // //console.log;
    }
  }

  //function to resend invite
  // const handleResendInvite = async (item) => {
  //     // //console.log;

  //     let data = {
  //       name: item.name,
  //       email: item.email,
  //       phone: item.phone,
  //     };
  //     setReInviteTeamLoader(true);
  //     await inviteTeamMember(data);
  //     setReInviteTeamLoader(false);
  //     setOpenMoreDropdown(false);
  //   };

  return (
    <div>
      {showSnak && (
        <AgentSelectSnackMessage
          isVisible={showSnak}
          hide={() => {
            setShowSnak(false)
          }}
          message={snackTitle}
          type={SnackbarTypes.Success}
        />
      )}
      <Modal
        open={openInvitePopup}
        onClose={handleCloseInviteTeam}
        closeAfterTransition
        BackdropProps={{
          timeout: 500,
          sx: {
            backgroundColor: '#00000030',
            // backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-5/12 sm:w-full w-6/12r" sx={styles.modalsStyle}>
          <AgentSelectSnackMessage
            isVisible={showError}
            hide={() => setShowError(false)}
            message={'Enter all credentials'}
          />
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-full w-full p-8"
              style={{
                backgroundColor: '#ffffff',

                borderRadius: '13px',
              }}
            >
              <div className="flex flex-row justify-between">
                <div className="flex flex-row gap-3">
                  <div
                    style={{ fontSize: 16, fontWeight: '500', color: '#000' }}
                  >
                    New Invite
                  </div>
                </div>
                <button onClick={handleCloseInviteTeam}>
                  <Image
                    src={'/otherAssets/crossIcon.png'}
                    height={24}
                    width={24}
                    alt="*"
                  />
                </button>
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: '#000',
                  marginTop: 20,
                }}
              >
                Invite Team
              </div>

              <div className="pt-5" style={styles.headingStyle}>
                Name
              </div>
              <input
                placeholder="Type here"
                className="w-full border rounded p-2 outline-none outline-none focus:ring-0"
                style={styles.inputStyle}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setShowError(false)
                }}
              />

              <div className="pt-5" style={styles.headingStyle}>
                Email Address
              </div>
              <div className="text-end">
                {emailLoader ? (
                  <p style={{ ...styles.errmsg, color: 'black' }}>
                    Checking ...
                  </p>
                ) : (
                  <div>
                    {email && emailCheckResponse ? (
                      <p
                        style={{
                          ...styles.errmsg,
                          color:
                            emailCheckResponse?.status === true
                              ? 'green'
                              : 'red',
                        }}
                      >
                        {emailCheckResponse?.message
                          ?.slice(0, 1)
                          .toUpperCase() +
                          emailCheckResponse?.message?.slice(1)}
                      </p>
                    ) : (
                      <div />
                    )}
                  </div>
                )}
                <div style={{ ...styles.errmsg, color: 'red' }}>
                  {validEmail}
                </div>
              </div>
              <input
                placeholder="Type here"
                className="w-full border rounded p-2 focus:ring-0 outline-none"
                style={styles.inputStyle}
                value={email}
                onChange={(e) => {
                  let value = e.target.value
                  setEmail(value)
                  setShowError(false)
                  if (timerRef.current) {
                    clearTimeout(timerRef.current)
                  }

                  setEmailCheckResponse(null)

                  if (!value) {
                    // //console.log;
                    setValidEmail('')
                    return
                  }

                  if (!validateEmail(value)) {
                    // //console.log;
                    setValidEmail('Invalid')
                  } else {
                    // //console.log;
                    if (value) {
                      // Set a new timeout
                      timerRef.current = setTimeout(() => {
                        checkEmail(value)
                      }, 300)
                    } else {
                      // Reset the response if input is cleared
                      setEmailCheckResponse(null)
                      setValidEmail('')
                    }
                  }
                }}
              />

              <div className="pt-5" style={styles.headingStyle}>
                Phone Number
              </div>
              {/* Code for error messages */}
              <div className="w-full mt-2">
                <div>
                  {errorMessage && (
                    <div
                      className={`text-end text-red`}
                      style={{
                        ...styles.errmsg,
                        color:
                          checkPhoneResponse?.status === true ? 'green' : 'red',
                      }}
                    >
                      {errorMessage}
                    </div>
                  )}
                </div>
                <div>
                  {checkPhoneLoader && (
                    <div
                      className={`text-end text-red`}
                      style={{ ...styles.errmsg }}
                    >
                      {checkPhoneLoader}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-row items-center justify-center gap-2 w-full mt-3">
                <div className="flex flex-row items-center gap-2 border rounded-lg w-full justify-between pe-4">
                  <div className="w-full">
                    <PhoneInput
                      className="outline-none bg-transparent focus:ring-0"
                      country={'us'} // restrict to US only
                      onlyCountries={['us', 'mx','sv', 'ec']}
                      disableDropdown={true}
                      countryCodeEditable={false}
                      disableCountryCode={false}
                      value={phone}
                      onChange={handlePhoneNumberChange}
                      // placeholder={locationLoader ? "Loading location ..." : "Enter Number"}
                      placeholder={'Type here'}
                      // disabled={loading}
                      style={{
                        borderRadius: '7px',
                        outline: 'none', // Ensure no outline on wrapper
                        boxShadow: 'none', // Remove any shadow
                      }}
                      inputStyle={{
                        width: '100%',
                        borderWidth: '0px',
                        backgroundColor: 'transparent',
                        paddingLeft: '60px',
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        fontSize: 15,
                        fontWeight: '500',
                        height: '50px',
                        outline: 'none', // Remove outline on input
                        boxShadow: 'none', // Remove shadow as well
                      }}
                      buttonStyle={{
                        border: 'none',
                        backgroundColor: 'transparent',
                        outline: 'none', // Ensure no outline on button
                      }}
                      dropdownStyle={{
                        maxHeight: '150px',
                        overflowY: 'auto',
                      }}
                      // defaultMask={locationLoader ? "Loading..." : undefined}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-row gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowPermissionManager(true)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  style={{
                    borderColor: selectedPermissions ? 'hsl(var(--brand-primary))' : undefined,
                    color: selectedPermissions ? 'hsl(var(--brand-primary))' : undefined,
                  }}
                >
                  {selectedPermissions ? `Permissions Set (${selectedPermissions.length})` : 'Set Permissions'}
                </button>
              </div>

              {inviteTeamLoader ? (
                <div className="flex flex-col items-center p-5">
                  <CircularProgress size={30} sx={{ color: 'hsl(var(--brand-primary))' }} />
                </div>
              ) : (
                <button
                  style={{
                    marginTop: 20,
                    backgroundColor:
                      !name ||
                      !email ||
                      !phone ||
                      emailCheckResponse?.status !== true ||
                      checkPhoneResponse?.status !== true
                        ? '#00000020'
                        : '',
                  }}
                  className="w-full flex bg-brand-primary p-3 rounded-lg items-center justify-center"
                  onClick={() => {
                    let data = {
                      name: name,
                      email: email,
                      phone: phone,
                    }
                    inviteTeamMember(data)
                  }}
                  disabled={
                    !name ||
                    !email ||
                    !phone ||
                    emailCheckResponse?.status !== true ||
                    checkPhoneResponse?.status !== true
                  }
                >
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color:
                        !name ||
                        !email ||
                        !phone ||
                        emailCheckResponse?.status !== true ||
                        checkPhoneResponse?.status !== true
                          ? '#000000'
                          : '#ffffff',
                    }}
                  >
                    Send Invite
                  </div>
                </button>
              )}

              <PermissionManager
                open={showPermissionManager}
                onClose={() => setShowPermissionManager(false)}
                teamMemberId={null}
                context="agency"
                contextUserId={null}
                onPermissionsChange={(permissions) => {
                  setSelectedPermissions(permissions)
                  setShowPermissionManager(false)
                }}
                initialPermissions={selectedPermissions}
              />

              {/* Can be use full to add shadow */}
              {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

export default InviteTeamModal

const styles = {
  itemText: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#000',
  },
  deleteText: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#FF4D4F', // Red color for delete
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
  headingStyle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#00000050',
  },
  inputStyle: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 10,
    border: '1px solid #00000010',
    height: '50px',
  },
  errmsg: {
    fontSize: 12,
    fontWeight: '500',
  },
}
