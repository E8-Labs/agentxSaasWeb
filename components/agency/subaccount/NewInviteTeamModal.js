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
import CloseBtn from '@/components/globalExtras/CloseBtn'
import {
  checkPhoneNumber,
  getLocalLocation,
} from '@/components/onboarding/services/apisServices/ApiService'
import PermissionManager from '@/components/permissions/PermissionManager'

const NewInviteTeamModal = ({
  openInvitePopup,
  handleCloseInviteTeam,
  userID,
}) => {
  const timerRef = useRef(null)
  const router = useRouter()

  const defaultMembers = [
    {
      name: '',
      email: '',
      phone: '',
      emailError: '',
      emailValid: null,
      phoneError: '',
      phoneValid: null,
    },
    {
      name: '',
      email: '',
      phone: '',
      emailError: '',
      emailValid: null,
      phoneError: '',
      phoneValid: null,
    },
  ]

  //code for teammembers
  const [teamMembers, setTeamMembers] = useState(defaultMembers)

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

  useEffect(() => {
    let loc = getLocalLocation()
    setCountryCode(loc)
  }, [])

  //code to add teammeber
  const handleAddMember = () => {
    setTeamMembers([...teamMembers, { name: '', email: '', phone: '' }])
  }

  const handleRemoveMember = (index) => {
    const updated = [...teamMembers]
    updated.splice(index, 1)
    setTeamMembers(updated)
  }

  const handleChange = (index, field, value) => {
    const updated = [...teamMembers]
    updated[index][field] = value
    setTeamMembers(updated)
  }

  //user email validation function
  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    // Check if email contains consecutive dots, which are invalid
    if (/\.\./.test(email)) {
      return false
    }

    // Check the general pattern for a valid email
    return emailPattern.test(email)
  }

  //validate member email
  const validateMemberEmail = (index, email) => {
    const updated = [...teamMembers]
    const isValid = validateEmail(email)

    updated[index].emailError = isValid ? '' : 'Invalid'
    updated[index].emailValid = isValid
    setTeamMembers(updated)

    if (isValid) {
      // Add debounce API call if needed
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        checkTeamMemberEmail(index, email)
      }, 300)
    }
  }

  //member email check
  const checkTeamMemberEmail = async (index, email) => {
    try {
      const response = await axios.post(Apis.CheckEmail, { email })
      const updated = [...teamMembers]

      // console.log("memberEmail check", response);

      if (response.data.status === true) {
        updated[index].emailValid = true
        updated[index].emailError = ''
      } else {
        updated[index].emailValid = false
        updated[index].emailError =
          response.data.message || 'Email not available'
      }

      setTeamMembers(updated)
    } catch (err) {
      console.error('Email check error:', err)
    }
  }

  //validate Member Phone
  const validateMemberPhone = (index, phone, countryCode) => {
    // console.log("Checking phone validation");
    const updated = [...teamMembers]
    const parsed = parsePhoneNumberFromString(
      `+${phone}`,
      countryCode?.toUpperCase(),
    )
    if (!parsed || !parsed.isValid()) {
      updated[index].phoneError = 'Invalid'
      updated[index].phoneValid = false
    } else {
      updated[index].phoneError = ''
      updated[index].phoneValid = true

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        checkTeamMemberPhone(index, phone)
      }, 300)
    }

    setTeamMembers(updated)
  }

  //member check phone api call
  const checkTeamMemberPhone = async (index, phone) => {
    try {
      const response = await axios.post(Apis.CheckPhone, { phone })
      const updated = [...teamMembers]

      if (response.data.status === true) {
        updated[index].phoneValid = true
        updated[index].phoneError = ''
      } else {
        updated[index].phoneValid = false
        updated[index].phoneError =
          response.data.message || 'Phone not available'
      }

      setTeamMembers(updated)
    } catch (err) {
      console.error('Phone check error:', err)
    }
  }

  //funcion to invitem tem member
  const inviteTeamMember = async () => {
    // return
    if (
      teamMembers.some(
        (member) =>
          member?.name?.trim() === '' ||
          member?.email?.trim() === '' ||
          member?.phone?.trim() === '',
      )
    ) {
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
          moreTeams: teamMembers
            .filter((item) => item.name && item.email && item.phone) // Filter members with all fields present
            .map((item) => ({
              name: item.name,
              phone: `+${item.phone}`,
              email: item.email,
            })),
          userId: userID,
          permissions: selectedPermissions, // Include permissions if set
        }

        // return

        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response) {
          setInviteTeamLoader(false)
          if (response.data.status === true) {
            setShowSnak(true)
            handleCloseInviteTeam('showSnack')
            setTeamMembers(defaultMembers)
            setSelectedPermissions(null) // Reset permissions after successful invitation
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
        <Box className="lg:w-5/12 sm:w-full w-6/12" sx={styles.modalsStyle}>
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
              <div className="flex flex-col justify-between">
                <div className="flex flex-row w-full justify-between">
                  <div
                    className="mb-4"
                    style={{ fontSize: 18, fontWeight: '800', color: '#000' }}
                  >
                    Invite Team
                  </div>
                  <CloseBtn onClick={handleCloseInviteTeam} />
                </div>

                <div className="mb-4">
                  <div className="flex fex-row ites-center w-full mb-2">
                    <div className="w-4/12" style={styles.inputs}>
                      Full Name
                    </div>
                    <div className="w-4/12" style={styles.inputs}>
                      Email Address
                    </div>
                    <div className="w-4/12" style={styles.inputs}>
                      Phone Number
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto pr-2 space-y-4">
                    {teamMembers.map((member, index) => (
                      <div
                        key={index}
                        className="gap-4 flex flex-row items-center"
                        // relative grid grid-cols-1 md:grid-cols-3
                      >
                        <input
                          type="text"
                          placeholder="Type here..."
                          className="px-3 py-2 border border-gray-300 rounded-lg w-4/12 outline-none focus:outline-none focus:ring-0 focus:border-gray-200"
                          value={member.name}
                          onChange={(e) =>
                            handleChange(index, 'name', e.target.value)
                          }
                          style={styles.inputs}
                        />

                        <div className="w-4/12">
                          <input
                            type="email"
                            placeholder="Type here..."
                            className="px-3 py-2 w-[90%] border border-gray-300 rounded-lg outline-none focus:outline-none focus:ring-0 focus:border-gray-200"
                            value={member.email}
                            onChange={(e) => {
                              handleChange(index, 'email', e.target.value)
                              validateMemberEmail(index, e.target.value)
                            }}
                            style={styles.inputs}
                          />

                          {/* Success/Error Message */}
                          <div>
                            {member.emailError && (
                              <p style={{ ...styles.errmsg, color: 'red' }}>
                                {member.emailError}
                              </p>
                            )}
                            {member.emailValid && !member.emailError && (
                              <p style={{ ...styles.errmsg, color: 'green' }}>
                                Valid
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-row items-center overflow-hidden w-4/12">
                          <div className="w-[90%] flex flex-row items-center">
                            <div className="w-full">
                              <PhoneInput
                                country={'us'} // restrict to US only
                                onlyCountries={['us', 'mx']}
                                disableDropdown={true}
                                countryCodeEditable={false}
                                disableCountryCode={false}
                                value={member.phone}
                                onChange={(value, countryData, e) => {
                                  handleChange(index, 'phone', value)
                                  // if (e?.type === 'input') {
                                  validateMemberPhone(index, value, countryCode)
                                  // }
                                }}
                                specialLabel=""
                                inputStyle={{
                                  width: '100%',
                                  borderWidth: '0px',
                                  backgroundColor: 'transparent',
                                  paddingLeft: '45px',
                                  paddingTop: '14px',
                                  paddingBottom: '14px',
                                  fontSize: '15px',
                                  fontWeight: '500',
                                }}
                                buttonStyle={{
                                  border: 'none',
                                  backgroundColor: 'transparent',
                                }}
                                dropdownStyle={{
                                  maxHeight: '150px',
                                  overflowY: 'auto',
                                }}
                                containerClass="border border-gray-300 rounded-lg w-full"
                              />
                              {/* Show validation */}
                              {member.phoneError && (
                                <p style={{ ...styles.errmsg, color: 'red' }}>
                                  {member.phoneError}
                                </p>
                              )}
                              {member.phoneValid && !member.phoneError && (
                                <p style={{ ...styles.errmsg, color: 'green' }}>
                                  Valid
                                </p>
                              )}
                            </div>
                          </div>
                          {index > 0 && (
                            <button
                              onClick={() => handleRemoveMember(index)}
                              className="text-red-500 hover:text-black text-sm ms-2 text-bold"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="w-full flex flex-row items-center justify-end pe-4">
                    <button
                      onClick={handleAddMember}
                      className="mt-3 text-brand-primary border-b boder-2 border-purple60 text-sm"
                    >
                      New Member
                    </button>
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
                    backgroundColor: teamMembers.some(
                      (member) =>
                        member?.name?.trim() === '' ||
                        member?.email?.trim() === '' ||
                        member?.phone?.trim() === '',
                    )
                      ? '#00000020'
                      : '',
                  }}
                  className="w-full flex bg-brand-primary p-3 rounded-lg items-center justify-center"
                  onClick={() => {
                    inviteTeamMember()
                  }}
                  disabled={teamMembers.some(
                    (member) =>
                      member?.name?.trim() === '' ||
                      member?.email?.trim() === '' ||
                      member?.phone?.trim() === '',
                  )}
                >
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color: teamMembers.some(
                        (member) =>
                          member?.name?.trim() === '' ||
                          member?.email?.trim() === '' ||
                          member?.phone?.trim() === '',
                      )
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

export default NewInviteTeamModal

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
  inputs: {
    fontWeight: '500',
    fontSize: '15px',
  },
  headings: {
    fontWeight: '600',
    fontSize: '17px',
  },
  errmsg: {
    fontSize: 12,
    fontWeight: '500',
    borderRadius: '7px',
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
