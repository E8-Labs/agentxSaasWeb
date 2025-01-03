"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'
import { MenuItem, FormControl, Select, Snackbar, Alert, CircularProgress } from '@mui/material'
import axios from 'axios'
import Apis from '@/components/apis/Apis'
import { CaretDown, CaretUp, Copy } from '@phosphor-icons/react'
import CallWorthyReviewsPopup from '@/components/dashboard/leads/CallWorthyReviewsPopup'
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage'



function Page() {

  const [showKeysBox, setshowKeysBox] = useState(false)
  const [myKeys, setMyKeys] = useState([])
  const [keyLoader, setKeyLoader] = useState(false)
  const [genratekeyLoader, setGenrateeyLoader] = useState(false)
  const [genratekeyLoader2, setGenrateeyLoader2] = useState(false)
  const [showCopySnak, setShowCopySnak] = useState(null)

  //test 

  const [showCallReviewPopup, setShowCallReviewPopup] = useState(false)


  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {

  };




  useEffect(() => {
    getMyApiKeys()
  }, [])


  const getMyApiKeys = async () => {
    console.log('trying to get my api keys')
    try {
      const data = localStorage.getItem("User")
      setKeyLoader(true)
      let u = JSON.parse(data)
      console.log('user data from local is', u.user)

      let path = Apis.myApiKeys
      console.log('path', path)

      const response = await axios.get(path, {
        headers: {
          "Authorization": "Bearer " + u.token,
        }
      })

      if (response) {
        setKeyLoader(false)

        if (response.data.status) {
          console.log('response of get my api keys is', response.data.data)
          setMyKeys(response.data.data)


        } else {
          console.log('get my api keys api message is', response.data.message)
        }
      }
    } catch (e) {
      setKeyLoader(false)
      console.log('error in get my api keys is', e)
    }
  }

  const genrateApiKey = async () => {
    try {


      const data = localStorage.getItem("User")

      let u = JSON.parse(data)
      console.log('user data from local is', u.user)

      let apidata = {
        "email": u.email,
        "name": u.name,
        "phone": u.phone,
        "farm": u.farm,
        "brokerage": u.brokerage,
        "averageTransactionPerYear": u.averageTransactionPerYear,
        "agentService": u.agentService,
        "areaOfFocus": u.areaOfFocus,
        "userType": u.userType
      }

      // return

      const response = await axios.post(Apis.genrateApiKey, apidata, {
        headers: {
          "Authorization": "Bearer " + u.token,
          "Content-Type": 'application/json'
        }
      })

      if (response) {
        setGenrateeyLoader(false)
        setGenrateeyLoader2(false)

        if (response.data.status) {
          console.log('response of genrate api keys is', response.data.data)
          setShowCopySnak("Api key generated successfully")
          setMyKeys((prevKeys) => [...prevKeys, response.data.data])
        } else {
          console.log('get genrate api keys api message is', response.data.message)
        }
      }
    } catch (e) {
      setGenrateeyLoader2(false)
      setGenrateeyLoader(false)

      console.log('error in genrate api keys is', e)
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
    const maskedId = id.slice(0, -4).replace(/./g, '*') + id.slice(-4);
    console.log("length of mask id is", maskedId.length);
    console.log("length of id is", id);
    return maskedId;
  }


  return (
    <div className='w-full flex flex-col items-center'>
      <AgentSelectSnackMessage isVisible={showCopySnak} hide={() => setShowCopySnak(null)} message={showCopySnak} type={SnackbarTypes.Success} />
      <div className=' w-full flex flex-row justify-between items-center py-4 px-10'
        style={{ borderBottomWidth: 2, borderBottomColor: '#00000010' }}
      >
        <div style={{ fontSize: 24, fontWeight: '600' }}>
          Integration
        </div>
        <div className="flex flex-col">
          <NotficationsDrawer />
        </div>
      </div>
      {/* <div className='w-full flex flex-row items-center justify-end p-6'>
        {
          genratekeyLoader ? (
            <CircularProgress size={30} />
          ) : (
            <button
              onClick={() => {
                setGenrateeyLoader(true)
                genrateApiKey()
              }}
            >
              <div style={{ fontSize: 16, fontWeight: '500', color: '#7902df', textDecorationLine: 'underline' }}>
                Create New Api Key
              </div>
            </button>
          )
        }

      </div> */}
      <div className='w-full flex flex-col h-[80vh] mt-8' style={{ overflow: 'auto', scrollbarWidth: 'none' }}>



        {/* <FormControl className="w-7/12 p-10" style={{ alignSelf: "self-start" }}>
        <Select
          value={selectedKey}
          // onChange={(e) => setSelectedKey(e.target.value)}
          displayEmpty
          renderValue={(selected) => {
            if (!selected) {
              return <span style={{ color: "#000" }}>My API Keys</span>; // Placeholder label style
            }
            return selected; // Display selected value
          }}
          sx={{
            border: "1px solid #00000020",
            "&:hover": { border: "1px solid #00000020" },
            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
          }}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: "30vh",
                overflow: "auto",
              },
            },
          }}
        >
          {myKeys.length > 0 ? (
            myKeys.map((item, index) => (
              <MenuItem key={index} value={item.key}>
                <div className="w-full flex flex-row items-center justify-between">
                  <div
                    className="w-10/12 truncate p-3"
                    style={{ fontSize: 16, fontWeight: "500", color: "#000" }}
                  >
                    {item.key}
                  </div>
                  <button
                    className="w-2/12 text-purple text-[16] font-[500]"
                    onClick={() => {
                      navigator.clipboard
                        .writeText(item.key)
                        .then(() => setShowCopySnak(true))
                        .catch((err) =>
                          console.error("Failed to copy API key:", err)
                        );
                    }}
                  >
                    Copy
                  </button>
                </div>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No API keys found</MenuItem>
          )}
          <MenuItem>
            <button
              onClick={() => { genrateApiKey() }}
            >
              <div style={{ fontSize: 16, fontWeight: '500', color: '#7902df', textDecorationLine: 'underline' }}>
                Create New Api Key
              </div>
            </button>
          </MenuItem>
        </Select>
      </FormControl> */}


        <div className='w-full pl-10 pr-8'>
          <div className='border w-7/12 p-3'>
            <button className='w-full' onClick={() => { setshowKeysBox(!showKeysBox) }}>
              <div className='flex flex-row items-center justify-between '>
                <div>
                  My Api Key
                </div>
                {
                  showKeysBox ?
                    <CaretUp size={20} /> :
                    <CaretDown size={20} />
                }

              </div>
            </button>

            {
              showKeysBox && (
                <>
                  {/* {
                    myKeys.map((item, index) => {

                      const maskId = (id) => {
                        const maskedId = id.slice(0, -4).replace(/./g, '*') + id.slice(-4);
                        console.log("length of mask id is", maskedId.length);
                        console.log("length of id is", id);
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

                  
                  {
                    myKeys.length > 0 && (
                      <button className='flex text-start flex-row items-center justify-between w-full mt-5'
                        onClick={() => {
                          navigator.clipboard
                            .writeText(myKeys[myKeys.length - 1].key)
                            .then(() => setShowCopySnak("Api key copied successfully"))
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
                          {/* {item.key} */}
                          {maskId(myKeys[myKeys.length - 1].key)}
                        </div>
                        <Copy size={20} color='#7920fd' />
                      </button>
                    )
                  }


                  {
                    genratekeyLoader2 ? (
                      <CircularProgress style={{ margin: 10 }} size={20} />
                    ) : (
                      <button className='mt-5'
                        onClick={() => {
                          setGenrateeyLoader2(true)
                          genrateApiKey()
                        }}
                      >
                        <div style={{ fontSize: 16, fontWeight: '500', color: '#7902df', textDecorationLine: 'underline' }}>
                          {myKeys.length> 0 ? "Refresh":"Genrate New Api Key"}
                        </div>
                      </button>
                    )
                  }

                </>
              )
            }

          </div>
        </div>



        <div className='pl-10 flex flex-col items-center w-7/12' style={{ alignSelf: 'flex-start' }}>
          <div className='w-full border p-3 flex flex-row items-center justify-between mt-5'>
            <div className='flex flex-row items-center gap-5'>
              <Image src={'/otherAssets/twiloImage.png'}
                height={47}
                width={47}
                alt='twilo'
              />
              <div className='flex flex-col gap-2'>
                <div style={{ fontSize: 15, fontWeight: '500', color: '#050A08' }}>
                  Twilio
                </div>

                <div style={{ fontSize: 11, fontWeight: '400', color: '#050A0860' }}>
                  Get a phone num from Twilio
                </div>
              </div>
            </div>

            <button className='px-4 py-2 bg-purple border rounded-lg'
              onClick={() => { setShowCallReviewPopup(true) }}
            >
              <div style={{ fontSize: 15, fontWeight: '500', color: '#fff' }}>
                Add
              </div>
            </button>

            {/* <CallWorthyReviewsPopup open = {showCallReviewPopup} close = {()=>setShowCallReviewPopup(false)} /> */}
          </div>

          <div className='w-full border p-3 flex flex-row items-center justify-between mt-5'>
            <div className='flex flex-row items-center gap-5'>
              <Image src={'/otherAssets/calenderImage.png'}
                height={47}
                width={47}
                alt='calender'
              />
              <div className='flex flex-col gap-2'>
                <div style={{ fontSize: 15, fontWeight: '500', color: '#050A08' }}>
                  Calender
                </div>

                <div style={{ fontSize: 11, fontWeight: '400', color: '#050A0860' }}>
                  Connect to Cal.me, Calendly, smtp to google or apple calendar
                </div>
              </div>
            </div>

            <button className='px-4 py-2 bg-purple border rounded-lg'>
              <div style={{ fontSize: 15, fontWeight: '500', color: '#fff' }}>
                Add
              </div>
            </button>
          </div>

          <div className='w-full border p-3 flex flex-row items-center justify-between mt-5'>

            <div className='flex flex-row items-center gap-5'>
              <Image src={'/otherAssets/fubImage.png'}
                height={47}
                width={47}
                alt='fub'
              />
              <div className='flex flex-col gap-2'>
                <div style={{ fontSize: 15, fontWeight: '500', color: '#050A08' }}>
                  FUB
                </div>

                <div style={{ fontSize: 11, fontWeight: '400', color: '#050A0860' }}>
                  API Keys to send hot leads and booked meetings
                </div>
              </div>
            </div>

            <button className='px-4 py-2 bg-purple border rounded-lg'>
              <div style={{ fontSize: 15, fontWeight: '500', color: '#fff' }}>
                Add
              </div>
            </button>
          </div>
        </div>

        <div>
        </div>
      </div>
    </div>


  )
}

export default Page;
