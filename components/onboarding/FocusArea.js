import { CircularProgress } from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import ProgressBar from '@/components/onboarding/ProgressBar'
import { PersistanceKeys } from '@/constants/Constants'
import { UserTypes } from '@/constants/UserTypes'
import { GetAreasOfFocusForUser } from '@/utilities/AreaOfFocus'
import { Checkbox } from '@/components/ui/checkbox'

import Apis from '../apis/Apis'
import Footer from './Footer'
import Header from './Header'

const FocusArea = ({
  handleContinue,
  handleBack,
  DefaultData,
  handleSalesAgentContinue,
  handleSolarAgentContinue,
  handleInsuranceContinue,
  handleMarketerAgentContinue,
  handleWebsiteAgentContinue,
  handleRecruiterAgentContinue,
  handleTaxAgentContinue,
}) => {
  const othersFocus = useRef()

  const router = useRouter()

  const [focusArea, setFocusArea] = useState([])
  const [focusAreaTitle, setFocusAreaTitle] = useState('')
  const [loader, setLoader] = useState(false)
  const [focusData, setFocusData] = useState([])
  const [shouldContinue, setShouldContinue] = useState(true)

  //others focus are field
  const [otherType, setOtherType] = useState('')
  const [checkOthersFocusArea, setCheckOthersFocusArea] = useState(false)
  const [showOtherInput, setShowOtherInput] = useState(false)

  useEffect(() => {
    const focusData = localStorage.getItem(PersistanceKeys.RegisterDetails)
    if (focusData) {
      const FocusAreaDetails = JSON.parse(focusData)
      setFocusArea(FocusAreaDetails.focusAreaId)
      setFocusAreaTitle(FocusAreaDetails.areaFocusTitle)
      if (
        FocusAreaDetails.userTypeTitle !== UserTypes.RealEstateAgent &&
        FocusAreaDetails.userTypeTitle !== UserTypes.General &&
        FocusAreaDetails.userTypeTitle !== UserTypes.Reception
      ) {
        setShowOtherInput(true)
      }
    }
  }, [])

  useEffect(() => {
    getDefaultData()
  }, [])

  //function to get the default data
  const getDefaultData = async () => {
    try {
      // setLoader(true);
      const selectedServiceID = localStorage.getItem(
        PersistanceKeys.RegisterDetails,
      )
      let AgentTypeTitle = null
      if (selectedServiceID) {
        const serviceIds = JSON.parse(selectedServiceID)
        // //console.log;
        AgentTypeTitle = serviceIds.userTypeTitle
      }
      const focusData = localStorage.getItem(PersistanceKeys.RegisterDetails)
      if (focusData) {
        const FocusAreaDetails = JSON.parse(focusData)
        if (FocusAreaDetails.userTypeTitle !== 'RecruiterAgent') {
          let servicesLocal = GetAreasOfFocusForUser(AgentTypeTitle)
          setFocusData(servicesLocal)
        }

        // //console.log;
        const ApiPath = `${Apis.defaultData}?type=${AgentTypeTitle}`
        // //console.log;
        const response = await axios.get(ApiPath, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response) {
          // //console.log;

          //// //console.log;
          if (FocusAreaDetails.userTypeTitle === 'RecruiterAgent') {
            //// //console.log
            // //console.log;
            setFocusData(response?.data?.data?.userIndustry)
          } else if (
            FocusAreaDetails.userTypeTitle === 'HomeServices' &&
            (!response?.data?.data?.areaOfFocus ||
              response.data.data.areaOfFocus.length === 0)
          ) {
            setFocusData(servicesLocal)
          } else {
            //// //console.log
            setFocusData(response?.data?.data?.areaOfFocus || servicesLocal)
          }
        }
      } else {
        alert(response.data)
      }
    } catch (error) {
      // console.error("ERror occured in default data api is :----", error);
    } finally {
      setLoader(false)
    }
  }

  useEffect(() => {
    // //console.log;
    if (focusArea.length > 0 || otherType.length > 0) {
      setShouldContinue(false)
    } else if (focusArea.length === 0) {
      setShouldContinue(true)
    }
  }, [focusArea, otherType])

  const handleNext = () => {
    const data = localStorage.getItem(PersistanceKeys.RegisterDetails)

    if (data) {
      const LocalDetails = JSON.parse(data)
      // //console.log;
      let agentType = LocalDetails.userTypeTitle

      let details = LocalDetails
      // details.focusAreaId = focusArea;

      if (Array.isArray(focusArea)) {
        // Append otherType only if it has a value
        details.focusAreaId = otherType.trim()
          ? [...focusArea, otherType]
          : [...focusArea]
      } else {
        // Initialize focusAreaId with otherType only if it has a value
        details.focusAreaId = otherType.trim() ? [otherType] : []
      }

      if (LocalDetails.userTypeTitle === 'HomeServices' && otherType.trim()) {
        details.homeServiceTypeOther = otherType.trim()
      }

      // //console.log;

      // return
      localStorage.setItem(
        PersistanceKeys.RegisterDetails,
        JSON.stringify(details),
      )

      // handleSalesAgentContinue,
      //     handleSolarAgentContinue,
      //     handleInsuranceContinue,
      //     handleMarketerAgentContinue,
      //     handleWebsiteAgentContinue,
      //     handleRecruiterAgentContinue,
      //     handleTaxAgentContinue,

      // //console.log;

      handleContinue()
      // if (agentType === "RealEstateAgent") {
      //   handleContinue();
      // } else if (agentType === "SalesDevRep") {
      //   handleContinue();
      // } else if (agentType === "SolarRep") {
      //   handleContinue();
      // } else if (agentType === "InsuranceAgent") {
      //   handleContinue();
      // } else if (agentType === "MarketerAgent") {
      //   handleContinue();
      // } else if (agentType === "WebsiteAgent") {
      //   handleContinue();
      // } else if (agentType === "RecruiterAgent") {
      //   handleContinue();
      // } else if (agentType === "TaxAgent") {
      //   handleContinue();
      // }
    }

    // if (data) {
    //     const details = JSON.parse(data);
    //     details.focusAreaId = focusArea;
    //     localStorage.setItem(PersistanceKeys.RegisterDetails, JSON.stringify(details));
    //     if (focusArea.length > 0) {
    //         handleContinue();
    //     }
    // }
  }

  const handlefocusArea = (id) => {
    // setFocusArea(prevId => (prevId === id ? null : id))
    setFocusArea((prevIds) => {
      if (prevIds.includes(id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== id)
      } else {
        // Select the item if it's not already selected
        return [...prevIds, id]
      }
    })
  }

  //function to activate others field
  const handleSelectOthersField = () => {
    if (checkOthersFocusArea) {
      if (focusArea.current) {
        focusArea.current.blur() // Remove focus from the input
      }
      setOtherType('')
    } else {
      othersFocus.current.focus()
    }
    setCheckOthersFocusArea(!checkOthersFocusArea)
  }

  return (
    <div
      style={{ width: '100%' }}
      className="overflow-y-none flex flex-row justify-center items-center "
    >
      <div
        className="bg-white sm:rounded-2xl flex flex-col w-full sm:mx-2 md:w-10/12 h-[100%] sm:h-[95%] py-4 relative"
        style={{ scrollbarWidth: 'none' }} // overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
      >
        <div className="h-[95svh] sm:h-[92svh] overflow-none pb-24">
          {/* header84svh */}
          <div className="absolute top-0 left-0 right-0">
            <Header />
          </div>
          {/* Body */}
          <div className="flex flex-col items-center px-4 w-full h-[100%] mt-4">
            <div
              className="w-9/12 sm:w-11/12 md:text-4xl text-lg font-[600]"
              style={{ textAlign: 'center' }}
            >
              {focusAreaTitle ? focusAreaTitle : ''}
            </div>

            {loader ? (
              <div className="w-full flex flex-row items-center justify-center h-screen">
                <CircularProgress size={35} />
              </div>
            ) : (
              <div
                className="mt-2 sm:mt-8 pb-2 md:10/12 w-full lg:w-7/12 gap-4 flex flex-col sm:max-h-[90%] max-h-[100%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin"
                style={{
                  scrollbarColor: 'hsl(var(--brand-primary, 270 75% 50%)) transparent',
                }}
                // style={{ scrollbarWidth: "none" }}
              >
                {focusData.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handlefocusArea(item.id)
                    }}
                    className="border-none outline-none"
                  >
                    <div
                      className="border bg-white flex flex-row items-start pt-3 w-full rounded-2xl"
                      style={{
                        border: focusArea.includes(item.id)
                          ? '2px solid hsl(var(--brand-primary, 270 75% 50%))'
                          : '',
                        scrollbarWidth: 'none',
                        backgroundColor: focusArea.includes(item.id)
                          ? 'hsl(var(--brand-primary, 270 75% 50%) / 0.05)'
                          : '',
                      }}
                    >
                      <div className="w-full flex flex-row items-start px-4 py-2 gap-2">
                        {/* heck mark for small screens
                        Check merk for large screens 
                        <div className="mt-2 sm:hidden">
                          {focusArea.includes(item.id) ? (
                            <Image
                              src={"/assets/charmTick.png"}
                              alt="*"
                              height={24}
                              width={24}
                            />
                          ) : (
                            <Image
                              src={"/assets/charmUnMark.png"}
                              alt="*"
                              height={24}
                              width={24}
                            />
                          )}
                        </div>

                        <div className="mt-2 sm:flex hidden">
                          {focusArea.includes(item.id) ? (
                            <Image
                              src={"/assets/charmTick.png"}
                              alt="*"
                              height={32}
                              width={32}
                            />
                          ) : (
                            <Image
                              src={"/assets/charmUnMark.png"}
                              alt="*"
                              height={32}
                              width={32}
                            />
                          )}
                        </div>

                        <div className="text-start w-[100%] md:w-[90%]">
                          <div
                            style={{
                              fontFamily: "",
                              fontWeight: "700",
                              fontSize: 20,
                            }}
                          >
                            {item.title}
                          </div>
                          <div className="mt-2">{item.description}</div>
                        </div>*/}

                        <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                          {/* Check mark for small screens*/}
                          <div className="sm:hidden flex items-center">
                            <Checkbox
                              checked={focusArea.includes(item.id)}
                              className="h-5 w-5 rounded-full border-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                            />
                          </div>

                          {/*Check mark for large screens */}
                          <div className="flex items-center sm:flex hidden">
                            <Checkbox
                              checked={focusArea.includes(item.id)}
                              className="h-5 w-5 rounded-full border-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                            />
                          </div>

                          {/* Title + Description */}
                          <div>
                            <div className="font-semibold text-start text-base text-black leading-tight">
                              {item.title}
                            </div>
                            <div className="mt-1 text-gray-700 text-sm text-start leading-snug">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}

                {showOtherInput && (
                  <div className="border-none outline-none">
                    <div
                      className="border bg-white flex flex-row items-start pt-3 w-full rounded-2xl"
                      style={{
                        border: checkOthersFocusArea
                          ? '2px solid hsl(var(--brand-primary, 270 75% 50%))'
                          : '',
                        scrollbarWidth: 'none',
                        backgroundColor: checkOthersFocusArea
                          ? 'hsl(var(--brand-primary, 270 75% 50%) / 0.05)'
                          : '',
                      }}
                    >
                      <div className="w-full flex flex-row items-start justify-between px-4 py-2">
                        <div className="text-start w-[100%] md:w-[90%]">
                          <button
                            onClick={handleSelectOthersField}
                            style={{
                              fontFamily: '',
                              fontWeight: '700',
                              fontSize: 20,
                              width: '100%',
                              backgroundColor: '',
                              textAlign: 'start',
                              outline: 'none',
                            }}
                          >
                            Other (Type in)
                          </button>
                          <div className="mt-2">
                            <input
                              ref={othersFocus}
                              className="outline-none border-none focus:ring-0 w-full"
                              style={{
                                fontFamily: '',
                                fontWeight: '500',
                                fontSize: 15,
                                color: '#151515',
                                border: '0px solid black',
                              }}
                              placeholder="Type here..."
                              value={otherType}
                              onChange={(e) => {
                                let value = e.target.value
                                setOtherType(value)
                                if (value) {
                                  setCheckOthersFocusArea(true)
                                }
                              }}
                            />
                          </div>
                        </div>
                        <button onClick={handleSelectOthersField}>
                          <Checkbox
                            checked={checkOthersFocusArea}
                            className="h-5 w-5 rounded-full border-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* <Body /> */}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100">
          <div className="px-4 pt-3 pb-2">
            <ProgressBar value={60} />
          </div>
          <div className="flex items-center justify-between w-full " style={{ minHeight: '50px' }}>
            <Footer
              handleContinue={() => {
                let windowWidth = 1000
                if (typeof window !== 'undefined') {
                  windowWidth = window.innerWidth
                }
                if (windowWidth < 640) {
                  const data = localStorage.getItem(
                    PersistanceKeys.RegisterDetails,
                  )

                  if (data) {
                    const LocalDetails = JSON.parse(data)
                    // //console.log;
                    let agentType = LocalDetails.userTypeTitle

                    let details = LocalDetails
                    // details.focusAreaId = focusArea;

                    if (Array.isArray(focusArea)) {
                      // Append otherType only if it has a value
                      details.focusAreaId = otherType.trim()
                        ? [...focusArea, otherType]
                        : [...focusArea]
                    } else {
                      // Initialize focusAreaId with otherType only if it has a value
                      details.focusAreaId = otherType.trim() ? [otherType] : []
                    }

                    // //console.log;

                    // return
                    localStorage.setItem(
                      PersistanceKeys.RegisterDetails,
                      JSON.stringify(details),
                    )
                  }
                  handleContinue()
                } else {
                  handleNext()
                }
              }}
              handleBack={handleBack}
              shouldContinue={shouldContinue}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FocusArea
