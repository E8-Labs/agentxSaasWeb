'use client'

import {
  Alert,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Snackbar,
  TextField,
} from '@mui/material'
// import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import InputAdornment from '@mui/material/InputAdornment'
import { CaretDown, CaretUp, Copy } from '@phosphor-icons/react'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import DashboardSlider from '@/components/animations/DashboardSlider'
import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import CallWorthyReviewsPopup from '@/components/dashboard/leads/CallWorthyReviewsPopup'
import { Searchbar } from '@/components/general/MuiSearchBar'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'
import { allIntegrations } from '@/constants/Constants'
import { TypographyH3 } from '@/lib/typography'

function AdminIntegration({ selectedUser, agencyUser }) {
  const [showKeysBox, setshowKeysBox] = useState(false)
  const [myKeys, setMyKeys] = useState([])
  const [keyLoader, setKeyLoader] = useState(false)
  const [genratekeyLoader, setGenrateeyLoader] = useState(false)
  const [genratekeyLoader2, setGenrateeyLoader2] = useState(false)
  const [showCopySnak, setShowCopySnak] = useState(null)

  //test

  const [showCallReviewPopup, setShowCallReviewPopup] = useState(false)

  const [isExpanded, setIsExpanded] = useState(false)

  const [search, setSearch] = useState('')
  const [integrations, setIntegrations] = useState(allIntegrations)

  useEffect(() => {
    getMyApiKeys()
  }, [selectedUser])

  useEffect(() => {
    if (search) {
      let searched = allIntegrations.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase()),
      )
      setIntegrations(searched)
    } else {
      setIntegrations(allIntegrations)
    }
  }, [search])

  const getMyApiKeys = async () => {
    // //console.log;
    try {
      const data = localStorage.getItem('User')
      setKeyLoader(true)
      let u = JSON.parse(data)
      // //console.log;

      let path = Apis.myApiKeys + '?userId=' + selectedUser.id

      const response = await axios.get(path, {
        headers: {
          Authorization: 'Bearer ' + u.token,
        },
      })

      if (response) {
        setKeyLoader(false)

        if (response.data.status) {
          // //console.log;
          setMyKeys(response.data.data)
        } else {
          // //console.log;
        }
      }
    } catch (e) {
      setKeyLoader(false)
      // //console.log;
    }
  }

  const genrateApiKey = async () => {
    try {
      const data = localStorage.getItem('User')

      let u = JSON.parse(data)
      // //console.log;

      let apidata = {
        userId: selectedUser.id,
      }

      // return

      const response = await axios.post(Apis.genrateApiKey, apidata, {
        headers: {
          Authorization: 'Bearer ' + u.token,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        setGenrateeyLoader(false)
        setGenrateeyLoader2(false)

        if (response.data.status) {
          // //console.log;
          setShowCopySnak('Api key generated successfully')
          setMyKeys((prevKeys) => [...prevKeys, response.data.data])
        } else {
          // console.log(
          //   "get genrate api keys api message is",
          //   response.data.message
          // );
        }
      }
    } catch (e) {
      setGenrateeyLoader2(false)
      setGenrateeyLoader(false)

      // //console.log;
    }
  }

  // const myKeys = [
  //   {
  //     "id": 2,
  //     "title": "",
  //     "key": "fdb24df38ca147894653815fba7a0170dbbb7a45262feef8083e7198b28170ac",
  //     "status": "active",
  //     "userId": 10,
  //     "createdAt": "2024-12-27T17:41:54.000Z",
  //     "updatedAt": "2024-12-27T17:41:54.000Z"
  //   }, {
  //     "id": 2,
  //     "title": "",
  //     "key": "fdb24df38ca147894653815fba7a0170dbbb7a45262feef8083e7198b28170ac",
  //     "status": "active",
  //     "userId": 10,
  //     "createdAt": "2024-12-27T17:41:54.000Z",
  //     "updatedAt": "2024-12-27T17:41:54.000Z"
  //   }, {
  //     "id": 2,
  //     "title": "",
  //     "key": "fdb24df38ca147894653815fba7a0170dbbb7a45262feef8083e7198b28170ac",
  //     "status": "active",
  //     "userId": 10,
  //     "createdAt": "2024-12-27T17:41:54.000Z",
  //     "updatedAt": "2024-12-27T17:41:54.000Z"
  //   }
  // ]

  // funtion for mask keys

  const maskId = (id) => {
    const maskedId = id.slice(0, -4).replace(/./g, '*') + id.slice(-4)
    // //console.log;
    // //console.log;
    return maskedId
  }

  return (
    <div className={`w-full h-screen flex flex-col items-center mt-[19vh]`}>
      {/* Slider code */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
        }}
      >
        <DashboardSlider needHelp={false} selectedUser={selectedUser} />
      </div>
      <AgentSelectSnackMessage
        isVisible={showCopySnak}
        hide={() => setShowCopySnak(null)}
        message={showCopySnak}
        type={SnackbarTypes.Success}
      />
      <div
        className=" w-full flex flex-row justify-between items-center px-4"
      // style={{ borderBottomWidth: 2, borderBottomColor: "#00000010" }}
      >
        <TypographyH3>Integration</TypographyH3>
      </div>
      {/* <div className='w-full flex flex-row items-center justify-end p-6'>
        {
          genratekeyLoader ? (
            <CircularProgress size={30} sx={{ color: 'hsl(var(--brand-primary))' }} />
          ) : (
            <button
              onClick={() => {
                setGenrateeyLoader(true)
                genrateApiKey()
              }}
            >
              <div style={{ fontSize: 16, fontWeight: '500', color: 'hsl(var(--brand-primary))', textDecorationLine: 'underline' }}>
                Create New Api Key
              </div>
            </button>
          )
        }

      </div> */}
      <div
        className="w-full flex flex-col h-auto mt-4"
        style={{ overflow: 'auto', scrollbarWidth: 'none' }}
      >
        <div className="w-full pl-5 pr-8">
          <div className="flex flex-row justify-between items-start">
            <Searchbar
              placeholder={'Search your favorite integrations'}
              value={search}
              setValue={(search) => {
                setSearch(search)
              }}
            />
            <div className="border w-4/12 p-3 ">
              <button
                className="w-full"
                onClick={() => {
                  setshowKeysBox(!showKeysBox)
                }}
              >
                <div className="flex flex-row items-center justify-between ">
                  <div> API Keys</div>
                  {showKeysBox ? (
                    <CaretUp size={20} />
                  ) : (
                    <CaretDown size={20} />
                  )}
                </div>
              </button>

              {showKeysBox && (
                <>
                  {/* {
                    myKeys.map((item, index) => {

                      const maskId = (id) => {
                        const maskedId = id.slice(0, -4).replace(/./g, '*') + id.slice(-4);
                        //console.log;
                        //console.log;
                        return maskedId;
                      }

                      return (
                        <button className='flex text-start flex-row items-center justify-between w-full mt-5' key={index}
                          onClick={() => {
                            navigator.clipboard
                              .writeText(item.key)
                              .then(() => setShowCopySnak(true))
                              .catch((err) =>
                                console.error("Failed to copy API key:", err)
                              );
                          }}
                        >
                          <div
                            className='w-[90%] truncate '
                            style={{
                              fontFamily: "'Courier New', monospace", // Monospace font
                              lineHeight: '1.5', // Line height for proper spacing
                              verticalAlign: 'middle', // Align text vertically
                              whiteSpace: 'nowrap', // Prevent wrapping of the text
                            }}
                          >
                            {maskId(item.key)}
                          </div>
                          <Copy size={20} color='#7920fd' />
                        </button>
                      )
                    })
                  } */}

                  {myKeys.length > 0 && (
                    <button
                      className="flex text-start flex-row items-center justify-between w-full mt-5"
                      onClick={() => {
                        navigator.clipboard
                          .writeText(myKeys[myKeys.length - 1].key)
                          .then(() =>
                            setShowCopySnak('Api key copied successfully'),
                          )
                          .catch((err) =>
                            console.error('Failed to copy API key:', err),
                          )
                      }}
                    >
                      <div
                        className="w-[90%] truncate "
                        style={{
                          fontFamily: "'Courier New', monospace", // Monospace font
                          lineHeight: '1.5', // Line height for proper spacing
                          verticalAlign: 'middle', // Align text vertically
                          whiteSpace: 'nowrap', // Prevent wrapping of the text
                        }}
                      >
                        {/* {item.key} */}
                        {maskId(myKeys[myKeys.length - 1].key)}
                      </div>
                      <Copy size={20} color="hsl(var(--brand-primary))" />
                    </button>
                  )}

                  {genratekeyLoader2 ? (
                    <CircularProgress style={{ margin: 10 }} size={20} sx={{ color: 'hsl(var(--brand-primary))' }} />
                  ) : (
                    <button
                      className="mt-5"
                      onClick={() => {
                        setGenrateeyLoader2(true)
                        genrateApiKey()
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: '500',
                          color: 'hsl(var(--brand-primary))',
                          textDecorationLine: 'underline',
                        }}
                      >
                        {myKeys.length > 0 ? 'Refresh' : 'Generate'}
                      </div>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-3 p-4 ">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-3 flex flex-row gap-3 items-start border"
            >
              <img
                src={integration.icon}
                alt={integration.title}
                className="w-12 h-13 object-contain"
              />
              <div className="flex flex-col h-full justify-between">
                <div className="flex flex-col gap-2 flex-1">
                  <div style={{ fontSize: '1vw', fontWeight: '500' }}>
                    {integration.title}
                  </div>
                  <div
                    style={{ fontSize: '1vw', fontWeight: '500' }}
                    className="flex-wrap text-gray-600"
                  >
                    {integration.description}
                  </div>
                </div>
                <button
                  onClick={() => {
                    // if (integration.title === "GHL") {
                    //   setShowCopySnak("Comming soon");
                    //   return;
                    // }
                    if (typeof window !== 'undefined') {
                      window.open(integration.url, '_blank')
                    }
                  }}
                  className="w-full bg-brand-primary text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Add
                </button>

              </div>
            </div>
          ))}
        </div>

        <div></div>
      </div>
    </div>
  )
}

export default AdminIntegration
