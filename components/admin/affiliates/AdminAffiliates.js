'use client'

import 'react-phone-input-2/lib/style.css'

import { Button, CircularProgress, Fab, colors } from '@mui/material'
import { Box, Drawer, Modal } from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import axios from 'axios'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import PhoneInput from 'react-phone-input-2'

import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'
import {
  checkPhoneNumber,
  getLocalLocation,
} from '@/components/onboarding/services/apisServices/ApiService'
import { PersistanceKeys, isValidUrl } from '@/constants/Constants'
import { logout } from '@/utilities/UserUtility'
import { formatPhoneNumber } from '@/utilities/agentUtilities'
import {
  GetFormattedDateString,
  GetFormattedTimeString,
} from '@/utilities/utility'

import AffiliateDetailsDrawer from './AffiliateDetailsDrawer'
import { AffiliatesFilterModal } from './AffiliatesFilterModal'

function AdminAffiliates({ selectedUser }) {
  const timerRef = useRef(null)
  const router = useRouter()

  const [openAffiliatePopup, setOpenAffiliatePopup] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [officeHourUrl, setOfficeHourUrl] = useState('')
  const [uniqueUrl, SetUniqueUrl] = useState('')

  const [showError, setShowError] = useState(false)

  const [affiliatsList, setAffiliatesList] = useState([])

  const [getAffeliatesLoader, setGetAffiliatesLoader] = useState(false)
  const [addAffiliateLoader, setAddAffiliateLoader] = useState(false)

  const [validEmail, setValidEmail] = useState('')

  const [showSnak, setShowSnak] = useState(false)
  const [snackTitle, setSnackTitle] = useState('Team invite sent successfully')

  //variables for phone number err messages and checking
  const [errorMessage, setErrorMessage] = useState(null)
  const [checkPhoneResponse, setCheckPhoneResponse] = useState(null)
  const [countryCode, setCountryCode] = useState('') // Default country

  const [urlError, setUrlError] = useState('')
  const [urlError2, setUrlError2] = useState('')
  const [search, setSearch] = useState('')
  const [filteredAffiliates, setFilteredAffiliates] = useState([])

  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filters, setFilters] = useState({})

  const [showUsersModal, setShowUsersModal] = useState(false)
  const [selectedAffiliate, setSelectedAffiliate] = useState('')
  const [affilateUsers, setAffiliateUsers] = useState([])
  const [affilateUsersLoader, setAffiliateUsersLoader] = useState([])

  const [showAffiliateDrawer, setShowAffiliateDrawer] = useState(false)

  useEffect(() => {})

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let loc = getLocalLocation()
      setCountryCode(loc)
      getAffiliates()
    }
  }, [selectedUser])

  useEffect(() => {
    let timer = setTimeout(() => {
      //console.log);
      if (officeHourUrl) {
        if (isValidUrl(officeHourUrl)) {
          setUrlError('')
          //console.log;
        } else {
          setUrlError('Invalid')
        }
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [officeHourUrl])

  useEffect(() => {
    let timer = setTimeout(() => {
      //console.log);
      if (uniqueUrl) {
        checkUniqueUrl(uniqueUrl)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [uniqueUrl])

  const checkUniqueUrl = async (url) => {
    try {
      // setAffiliateUsersLoader(true);
      let data = localStorage.getItem(PersistanceKeys.LocalStorageUser)

      if (data) {
        let u = JSON.parse(data)

        let path = Apis.chechAffiliateUniqueUrl
        console.log('path', path)

        let apidata = {
          uniqueUrl: url,
        }

        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response.data) {
          setAffiliateUsersLoader(false)

          if (response.data.status === true) {
            console.log('', response.data.message)
          } else {
            console.log('api messsage is', response.data.message)

            setUrlError2(response.data.message)
          }
        }
      }
    } catch (e) {
      setAffiliateUsersLoader(false)

      //console.log;
    }
  }

  useEffect(() => {
    getUsersForAffiliate()
  }, [selectedAffiliate])

  const getUsersForAffiliate = async (offset = 0) => {
    //console.log;
    try {
      setAffiliateUsersLoader(true)
      let data = localStorage.getItem(PersistanceKeys.LocalStorageUser)

      if (data) {
        let u = JSON.parse(data)

        let path = `${Apis.getUsersForAffiliate}?offset=${offset}&campaigneeId=${selectedAffiliate?.id}`

        const response = await axios.get(path, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response.data) {
          setAffiliateUsersLoader(false)

          if (response.data.status === true) {
            // console.log(
            //   "users for selected affiliate are ",
            //   response.data.data
            // );
            setAffiliateUsers(response.data.data)
          } else {
            // console.log(
            //   "users for selected affiliate api messsage is",
            //   response.data.message
            // );
          }
        }
      }
    } catch (e) {
      setAffiliateUsersLoader(false)

      //console.log;
    }
  }

  //   useEffect(() => {
  //     let timer = setTimeout(() => {
  //       //console.log);
  //       if (uniqueUrl) {
  //         if (isValidUrl(uniqueUrl)) {
  //           setUrlError2("");
  //           //console.log;
  //         } else {
  //             setUrlError2("")
  //             //   setUrlError2("Invalid");
  //         }
  //       }
  //     }, 300);

  //     return () => clearTimeout(timer);
  //   }, [uniqueUrl]);

  //function to get team mebers api
  const getAffiliates = async (offset = 0, filter = null) => {
    const affiliat = localStorage.getItem(PersistanceKeys.LocalAffiliates)

    if (affiliat) {
      let localAffiliate = JSON.parse(affiliat)
      setAffiliatesList(localAffiliate)
      setFilteredAffiliates(localAffiliate)
      // return
    }
    try {
      setGetAffiliatesLoader(true)
      const data = localStorage.getItem('User')

      if (data) {
        let u = JSON.parse(data)

        let path = Apis.getAffiliate + '?offset=' + offset
        //console.log;
        if (filter) {
          if (filter.users) {
            path = `${path}&minUsers=${filter.users[0]}&maxUsers=${filter.users[1]}`
          }
          if (filter.revenue) {
            path = `${path}&minRevenue=${filter.revenue[0]}&maxRevenue=${filter.revenue[1]}`
          }
          if (filter.xBar) {
            path = `${path}&minxBar=${filter.revenue[0]}&maxxBar=${filter.revenue[1]}`
          }
        }
        console.log('get affiliates path is', path)

        const response = await axios.get(path, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response) {
          setGetAffiliatesLoader(false)
          console.log('response is', response.data)

          if (response.data.status === true) {
            setAffiliatesList(response.data.data)
            setFilteredAffiliates(response.data.data)

            localStorage.setItem(
              PersistanceKeys.LocalAffiliates,
              JSON.stringify(response.data.data),
            )
          } else {
            //console.log;
          }
        }
      }
    } catch (e) {
      setGetAffiliatesLoader(false)

      //console.log;
    } finally {
      setGetAffiliatesLoader(false)
    }
  }

  //funcion to invitem tem member
  const addAffiliate = async (item) => {
    //console.log;
    // return
    if (
      !item.name ||
      !item.email ||
      !item.phone ||
      !item.officeHoursUrl ||
      !item.uniqueUrl
    ) {
      setShowError(true)
      return
    }
    try {
      const data = localStorage.getItem('User')
      setAddAffiliateLoader(true)
      if (data) {
        let u = JSON.parse(data)

        let path = Apis.addAffiliate

        let apidata = {
          name: item.name,
          email: item.email,
          phone: item.phone,
          officeHoursUrl: item.officeHoursUrl,
          uniqueUrl: item.uniqueUrl,
        }

        //console.log;

        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response) {
          setAddAffiliateLoader(false)
          if (response.data.status === true) {
            //console.log;
            let newMember = response.data.data
            // //console.log;
            // //console.log;
            setAffiliatesList((prev) => {
              // //console.log;
              // //console.log;
              const isAlreadyPresent = prev.some(
                (member) => member.id === newMember.id,
              ) // Check by unique ID
              // //console.log;
              if (isAlreadyPresent) {
                // //console.log;
                return prev
              }
              return [...prev, newMember]
            })
            setSnackTitle('Affiliate added successfully')
            setShowSnak(true)
            setOpenAffiliatePopup(false)
            setName('')
            setEmail('')
            setPhone('')
            SetUniqueUrl('')
            setOfficeHourUrl('')
            // getMyteam()
          } else {
            //console.log;
          }
        }
      }
    } catch (e) {
      setAddAffiliateLoader(false)
      //console.log;
    }
  }

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
    }
    // else {
    //     setErrorMessage("");

    //     if (timerRef.current) {
    //         clearTimeout(timerRef.current);
    //     }

    //     try {
    //         setCheckPhoneLoader("Checking...");
    //         let response = await checkPhoneNumber(phoneNumber);
    //         // //console.log;
    //         // setErrorMessage(null)
    //         setCheckPhoneResponse(response.data);
    //         if (response.data.status === false) {
    //             setErrorMessage("Taken");
    //         } else if (response.data.status === true) {
    //             setErrorMessage("Available");
    //         }
    //     } catch (error) {
    //         // console.error("Error occured in api is", error);
    //         setCheckPhoneLoader(null);
    //     } finally {
    //         setCheckPhoneLoader(null);
    //     }

    //     // setCheckPhoneResponse(null);
    //     // //console.log;
    // }
  }

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase()
    setSearch(searchTerm)

    if (!searchTerm) {
      setFilteredAffiliates(affiliatsList) // Reset to original data
      return
    }

    const filtered = affiliatsList.filter((item) => {
      const name = item.name.toLowerCase()
      const email = item.email?.toLowerCase() || ''
      const phone = item.phone || ''

      return (
        name.includes(searchTerm) ||
        email.includes(searchTerm) ||
        phone.includes(searchTerm)
      )
    })

    setFilteredAffiliates(filtered)
  }

  const mockAffiliate = {
    name: 'Carol Perez',
    email: 'shakia.chidubem@gmail.com',
    phone: '(945) 952-9271',
    url: 'myagentx.com/carolperez_ai',
    createdAt: 'Jan 1 2025',
    totalUsers: 24,
    revenue: '1,527.73',
    xbarAmount: '1,527.73',
    topClient: { name: 'Maria Hall', amount: '4,513.80' },
    payouts: [
      { date: '7 May 2010', amount: '1,527.73', paidAmount: '152' },
      { date: '27 September 2011', amount: '5,440.01', paidAmount: '544' },
      { date: '5 November 2023', amount: '6,597.00', paid: true },
      { date: '14 April 2006', amount: '9,983.57', paid: true },
      { date: '10 February 2008', amount: '4,588.92', paid: true },
      { date: '22 October 2022', amount: '6,011.04', paid: true },
      { date: '21 May 2007', amount: '7,414.90', paid: true },
      { date: '1 January 2021', amount: '3,265.50', paid: true },
    ],
  }

  return (
    <div className="w-full flex flex-col items-center">
      {showSnak && (
        <AgentSelectSnackMessage
          isVisible={showSnak}
          hide={() => setShowSnak(false)}
          message={snackTitle}
          type={SnackbarTypes.Success}
        />
      )}
      {showFilterModal && (
        <AffiliatesFilterModal
          filters={filters}
          showFilterModal={showFilterModal}
          onDismissCallback={() => {
            setShowFilterModal(false)
          }}
          updateFilters={(filter) => {
            //console.log;
            // let f = { ...filters, filter }
            setFilters(filter)
            if (filter?.finalUpdate === true) {
              getAffiliates(0, filter)
              setShowFilterModal(false)
            }
          }}
        />
      )}

      <div
        className="flex w-full justify-center overflow-hidden pb-50"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="w-11/12 flex flex-col items-start">
          <div style={{ fontSize: 24, fontWeight: '600' }}>LeaderBoard</div>
          <div className="w-full flex flex-row items-center justify-between">
            <div className="flex flex-row justify-start items-center gap-4 p-6 w-full">
              <div className="flex flex-row items-center gap-1 w-[22vw] flex-shrink-0 border rounded-full pe-2">
                <input
                  // style={styles.paragraph}
                  className="outline-none border-none w-full bg-transparent focus:outline-none focus:ring-0 rounded-full"
                  placeholder="Search by name, email or phone"
                  value={search}
                  onChange={handleSearch}
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
                  //console.log;
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
            </div>
            <button
              className="rounded-lg text-white bg-purple p-3"
              style={{
                fontWeight: '500',
                fontSize: '16',
                height: '50px',
                width: '173px',
              }}
              onClick={() => setOpenAffiliatePopup(true)}
            >
              Add Affiliate
            </button>
          </div>

          <div className="w-full flex flex-row bg-purple h-[52px] mt-4 gap-2 px-2">
            <div className="w-1/12 flex border-r-2 border-[#15151510] flex-row items-center gap-2">
              <img src="/svgIcons/rankIcon.svg" style={styles.image} alt="*" />
              <div style={styles.text}>Rank</div>
            </div>
            <div className="w-3/12 border-r-2 border-[#15151510] flex flex-row items-center gap-2">
              <img
                src="/svgIcons/affiliateIcon.svg"
                style={styles.image}
                alt="*"
              />
              <div style={styles.text}>Affiliate</div>
            </div>
            <div className="w-2/12 flex border-r-2 border-[#15151510] flex-row items-center gap-2">
              <img src="/svgIcons/usersIcon.svg" style={styles.image} alt="*" />
              <div style={styles.text}>Users</div>
            </div>

            <div className="w-3/12 flex border-r-2 border-[#15151510] flex-row items-center gap-2">
              <img
                src="/svgIcons/topSpendingIcon.svg"
                style={styles.image}
                alt="*"
              />
              <div style={styles.text}>Top Spending Client</div>
            </div>
            <div className="w-2/12 flex border-r-2 border-[#15151510] flex-row items-center gap-2">
              <img
                src="/svgIcons/revenueIcon.svg"
                style={styles.image}
                alt="*"
              />
              <div style={styles.text}>Revenue</div>
            </div>
            <div className="w-2/12 flex border-r-2 border-[#15151510] flex-row items-center gap-2">
              <img src="/svgIcons/xBarIcon.svg" style={styles.image} alt="*" />
              <div style={styles.text}>Xbar Amount</div>
            </div>

            <div className="w-1/12 flex border-r-2 border-[#15151510] flex-row items-center gap-2">
              <img
                src="/svgIcons/detailsIcon.svg"
                style={styles.image}
                alt="*"
              />
              <div style={styles.text}>Details</div>
            </div>
          </div>

          {getAffeliatesLoader ? (
            <div className="w-full pt-[100px] flex flex-col items-center">
              <CircularProgress size={40} />
            </div>
          ) : affiliatsList.length > 0 ? (
            <div
              className="flex flex-col h-[70vh] w-full"
              style={{ overflow: 'auto', scrollbarWidth: 'none' }}
            >
              {filteredAffiliates.map((item, index) => (
                <div
                  key={item.id}
                  style={{ cursor: 'pointer' }}
                  className="w-full flex flex-row items-center gap-2 h-[60px] hover:bg-[#402FFF05]"
                >
                  <div className="w-1/12 h-full border-r-2 border-[#15151510] pl-4">
                    <div style={styles.text2}>{index + 1}</div>
                  </div>
                  <div className="w-3/12  h-full border-r-2 border-[#15151510] pl-4">
                    <div style={styles.text2}>{item.name}</div>
                  </div>
                  <div className="w-2/12  h-full border-r-2 border-[#15151510] pl-4">
                    {/* (item.LeadModel?.phone) */}

                    <div style={styles.text2}>
                      <button
                        onClick={() => {
                          setShowUsersModal(true)
                          setSelectedAffiliate(item)
                        }}
                        className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                        style={{ cursor: 'pointer' }}
                      >
                        {item.totalUsers ? item?.totalUsers : '-'}
                      </button>
                    </div>
                  </div>
                  <div className="w-3/12  h-full border-r-2 border-[#15151510] pl-4">
                    <div style={styles.text2}>
                      {item.topSpender
                        ? `${item.topSpender?.user?.name}
                        ($${item.topSpender?.totalSpent.toFixed(2)})`
                        : ''}
                    </div>
                  </div>
                  <div className="w-2/12  h-full border-r-2 border-[#15151510]">
                    <div style={styles.text2}>
                      {item.Revenue ? `$${item.Revenue.toFixed(2)}` : '-'}
                    </div>
                  </div>
                  <div className="w-2/12 pl-4">
                    <div style={styles.text2}>
                      {item.xbarTotalRevenue?.totalSpent
                        ? `$${item.xbarTotalRevenue?.totalSpent.toFixed(2)}`
                        : '-'}
                    </div>
                  </div>

                  <button
                    className="w-1/12 pl-4"
                    onClick={() => {
                      setShowAffiliateDrawer(true)
                      setSelectedAffiliate(item)
                    }}
                  >
                    <div style={{ textDecorationLine: 'underline' }}>
                      More Info
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[68vh] w-full flex flex-col items-center justify-center">
              <div style={{ fontSize: 15, fontWeight: '500' }}>
                No affiliates found
              </div>
            </div>
          )}
        </div>
      </div>

      {/* drawer for selected affiliate */}

      <AffiliateDetailsDrawer
        open={showAffiliateDrawer}
        onClose={() => {
          setShowAffiliateDrawer(false)
        }}
        affiliate={selectedAffiliate}
      />

      {/* open user detail popup */}

      <Modal
        open={showUsersModal}
        onClose={() => setShowUsersModal(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: '#00000020',
            alignItems: 'center',
            justifyContent: 'center',
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box
          className="sm:w-10/12 lg:w-10/12 xl:w-8/12 w-11/12"
          sx={{ ...styles.modalsStyle, scrollbarWidth: 'none' }}
        >
          <div className="flex flex-row items-center justify-center w-full h-[80vh]">
            <div
              className="sm:w-10/12 w-full h-[100%] overflow-none mt-[10vh]"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: '13px',
              }}
            >
              <div className="flex flex-row items-center justify-between">
                <div
                  style={{
                    fontWeight: '500',
                    fontSize: 17,
                  }}
                >
                  {selectedAffiliate?.name}
                </div>
                <button
                  onClick={() => {
                    setShowUsersModal(false)
                  }}
                >
                  <Image
                    src={'/assets/crossIcon.png'}
                    height={40}
                    width={40}
                    alt="*"
                  />
                </button>
              </div>
              <div
                // className="max-h-[92%] overflow-auto"
                style={{
                  // borderWidth:1,
                  scrollbarWidth: 'none',
                }}
              >
                <div className="w-full flex flex-row">
                  <div className="w-3/12">
                    <div
                      style={{
                        fontSize: 14,
                        color: 'black',
                        fontWeight: '500',
                      }}
                    >
                      Name
                    </div>
                  </div>
                  <div className="w-2/12">
                    <div
                      style={{
                        fontSize: 14,
                        color: 'black',
                        fontWeight: '500',
                      }}
                    >
                      Email
                    </div>
                  </div>
                  <div className="w-2/12">
                    <div
                      style={{
                        fontSize: 14,
                        color: 'black',
                        fontWeight: '500',
                      }}
                    >
                      Contact Number
                    </div>
                  </div>
                  <div className="w-2/12">
                    <div
                      style={{
                        fontSize: 14,
                        color: 'black',
                        fontWeight: '500',
                      }}
                    >
                      Unique Url
                    </div>
                  </div>

                  <div className="w-1/12">
                    <div
                      style={{
                        fontSize: 14,
                        color: 'black',
                        fontWeight: '500',
                      }}
                    >
                      Revenue
                    </div>
                  </div>

                  <div className="w-2/12">
                    <div
                      style={{
                        fontSize: 14,
                        color: 'black',
                        fontWeight: '500',
                      }}
                    >
                      Date
                    </div>
                  </div>
                </div>

                <div
                  className="h-[60svh] overflow-auto pb-[100px] mt-2"
                  id="scrollableDiv1"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {affilateUsersLoader ? (
                    <div className="flex flex-row items-center justify-center h-full">
                      <CircularProgress size={35} />
                    </div>
                  ) : affilateUsers.length > 0 ? (
                    affilateUsers.map((item, index) => (
                      <div
                        key={item.id}
                        style={{ cursor: 'pointer' }}
                        className="w-full flex flex-row items-center mt-5 hover:bg-[#402FFF05]"
                      >
                        <div className="w-3/12 flex flex-row gap-2 items-center">
                          <div className="h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white">
                            {item.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div style={styles.text2}>{item.name}</div>
                        </div>
                        <div className="w-2/12">
                          <div style={styles.text2}>{item.email}</div>
                        </div>
                        <div className="w-2/12">
                          <div style={styles.text2}>
                            {item.phone ? (
                              <div>{formatPhoneNumber(item?.phone)}</div>
                            ) : (
                              '-'
                            )}
                          </div>
                        </div>
                        <div className="w-2/12">
                          <div style={styles.text2}>
                            {item.uniqueUrl ? item.uniqueUrl : '-'}
                          </div>
                        </div>

                        <div className="w-1/12">
                          <div style={styles.text2}>
                            {item.totalSpent
                              ? `$${item.totalSpent.toFixed(2)}`
                              : '-'}
                          </div>
                        </div>

                        <div className="w-2/12">
                          <div style={styles.text2}>
                            {GetFormattedDateString(item.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>No user found</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Box>
      </Modal>

      {/* add affiliate popup */}
      <Modal
        open={openAffiliatePopup}
        onClose={() => setOpenAffiliatePopup(false)}
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

                Radius: '13px',
              }}
            >
              <div className="flex flex-row justify-between">
                <div className="flex flex-row gap-3">
                  <div
                    style={{ fontSize: 16, fontWeight: '500', color: '#000' }}
                  >
                    Add Affiliate
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOpenAffiliatePopup(false)
                  }}
                >
                  <Image
                    src={'/otherAssets/crossIcon.png'}
                    height={24}
                    width={24}
                    alt="*"
                  />
                </button>
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

                  if (!value) {
                    // //console.log;
                    setValidEmail('')
                    return
                  }

                  if (!validateEmail(value)) {
                    // //console.log;
                    setValidEmail('Invalid')
                  } else {
                    setValidEmail('')
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
                        color: 'red',
                      }}
                    >
                      {errorMessage}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-row items-center justify-center gap-2 w-full mt-3">
                <div className="flex flex-row items-center gap-2 border rounded-lg w-full justify-between pe-4">
                  <div className="w-full">
                    <PhoneInput
                      className="outline-none bg-transparent focus:ring-0"
                      country="us" // Default country
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
                      countryCodeEditable={true}
                      // defaultMask={locationLoader ? "Loading..." : undefined}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full flex flex-row items-center justify-between">
                <div className="pt-5" style={styles.headingStyle}>
                  Office Hours Url
                </div>
                {urlError && (
                  <div style={{ ...styles.errmsg, color: 'red' }}>
                    {urlError}
                  </div>
                )}
              </div>
              <input
                placeholder="url"
                className="w-full border rounded p-2 outline-none outline-none focus:ring-0"
                style={styles.inputStyle}
                value={officeHourUrl}
                onChange={(e) => {
                  setOfficeHourUrl(e.target.value)
                  setUrlError('')
                }}
              />
              <div className="w-full flex flex-row items-center justify-between">
                <div className="pt-5" style={styles.headingStyle}>
                  Unique Url
                </div>
                {urlError2 && (
                  <div style={{ ...styles.errmsg, color: 'red' }}>
                    {urlError2}
                  </div>
                )}
              </div>
              <input
                placeholder="url"
                className="w-full border rounded p-2 outline-none outline-none focus:ring-0"
                style={styles.inputStyle}
                value={uniqueUrl}
                onChange={(e) => {
                  SetUniqueUrl(e.target.value)
                  setUrlError2('')
                }}
              />

              {addAffiliateLoader ? (
                <div className="flex flex-col items-center p-5">
                  <CircularProgress size={30} />
                </div>
              ) : (
                <button
                  style={{
                    marginTop: 20,
                    backgroundColor:
                      !name ||
                      !email ||
                      !phone ||
                      //   emailCheckResponse?.status !== true ||
                      //   checkPhoneResponse?.status !== true ||
                      !!urlError ||
                      !!urlError2 ||
                      !uniqueUrl ||
                      !officeHourUrl
                        ? '#00000020'
                        : '',
                  }}
                  className="w-full flex bg-purple p-3 rounded-lg items-center justify-center"
                  onClick={() => {
                    let data = {
                      name: name,
                      email: email,
                      phone: phone,
                      uniqueUrl: uniqueUrl,
                      officeHoursUrl: officeHourUrl,
                    }
                    addAffiliate(data)
                  }}
                  disabled={
                    !name ||
                    !email ||
                    !phone ||
                    // emailCheckResponse?.status !== true ||
                    // checkPhoneResponse?.status !== true ||
                    !!urlError ||
                    !!urlError2 ||
                    !uniqueUrl ||
                    !officeHourUrl
                  }
                >
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color:
                        !name || !email || !phone
                          ? // emailCheckResponse?.status !== true ||
                            // checkPhoneResponse?.status !== true
                            '#000000'
                          : '#ffffff',
                    }}
                  >
                    Add Affiliate
                  </div>
                </button>
              )}

              {/* Can be use full to add shadow */}
              {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

export default AdminAffiliates

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
  text: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  image: {
    height: 16,
    width: 16,
  },
  text2: {
    textAlignLast: 'left',
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
    whiteSpace: 'nowrap', // Prevent text from wrapping
    overflow: 'hidden', // Hide overflow text
    textOverflow: 'ellipsis', // Add ellipsis for overflow text
  },
}
