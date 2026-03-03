import { CircularProgress } from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { PersistanceKeys } from '@/constants/Constants'
import { GetServicesForUser } from '@/utilities/AgentServices'
import { Checkbox } from '@/components/ui/checkbox'

import Apis from '../apis/Apis'
import Footer from './Footer'
import Header from './Header'
import ProgressBar from './ProgressBar'
import DefaultData from './extras/DefaultData'

const UserService = ({ handleContinue, handleBack }) => {
  const router = useRouter()
  const [serviceId, setServiceId] = useState([])
  const [servicesData, setServicesData] = useState([])
  const [loader, setLoader] = useState(false)
  const [value, setValue] = useState(0)
  const [shouldContinue, setShouldContinue] = useState(true)

  //stores default data
  // const [DefaultData, setDefaultData] = useState([]);

  useEffect(() => {
    const selectedServiceID = localStorage.getItem(
      PersistanceKeys.RegisterDetails,
    )
    if (selectedServiceID) {
      const serviceIds = JSON.parse(selectedServiceID)
      //// //console.log;
      setServiceId(serviceIds.serviceID)
    }
  }, [])

  useEffect(() => {
    getDefaultData()
    // if (servicesData) {
    //     setLoader(false);
    //     // <DefaultData setServicesData={setServicesData} />
    //     // setServicesData(servicesData);
    // } else {
    //    // //console.log
    // }
  }, [])

  useEffect(() => {
    if (serviceId.length > 0) {
      // //console.log;
      setShouldContinue(false)
    } else if (serviceId.length === 0) {
      setShouldContinue(true)
    }
  }, [serviceId])

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
      let servicesLocal = GetServicesForUser(AgentTypeTitle)
      setServicesData(servicesLocal)

      // //console.log;
      const ApiPath = `${Apis.defaultData}?type=${AgentTypeTitle}`
      // console.log("api path of agent services api ",ApiPath)
      const response = await axios.get(ApiPath, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // For Creator, API may not have seeded rows yet; keep local list if empty
        const apiServices = response.data.data?.agentServices
        if (
          (AgentTypeTitle === 'Creator' || AgentTypeTitle === 'HomeServices') &&
          (!apiServices || apiServices.length === 0)
        ) {
          setServicesData(servicesLocal)
        } else {
          setServicesData(apiServices || servicesLocal)
        }
      } else {
        // alert(response.data);
      }
    } catch (error) {
      // console.error("ERror occured in default data api is :----", error);
    } finally {
      setLoader(false)
    }
  }

  const handleserviceId = (id) => {
    // setServiceId(prevId => (prevId === id ? null : id));
    setServiceId((prevIds) => {
      if (prevIds.includes(id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== id)
      } else {
        // Select the item if it's not already selected
        return [...prevIds, id]
      }
    })
    setValue(30)
  }

  const handleNext = () => {
    const data = localStorage.getItem(PersistanceKeys.RegisterDetails)
    if (data) {
      const details = JSON.parse(data)
      details.serviceID = serviceId
      localStorage.setItem(
        PersistanceKeys.RegisterDetails,
        JSON.stringify(details),
      )
      if (serviceId) {
        if (serviceId.length > 0) {
          handleContinue()
        }
      }
    }
  }

  //code for linear progress moving
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setProgress((oldProgress) => {
  //       if (oldProgress === 100) {
  //         return 0;
  //       }
  //       const diff = Math.random() * 10;
  //       return Math.min(oldProgress + diff, 100);
  //     });
  //   }, 500);

  //   return () => {
  //     clearInterval(timer);
  //   };
  // }, []);

  return (
    <div
      style={{ width: '100%' }}
      className="overflow-y-none flex flex-row justify-center items-center "
    >
      <div
        className="bg-white sm:rounded-2xl flex flex-col w-full sm:mx-2 md:w-10/12 h-[100%] sm:h-[95%] py-4 relative"
        style={{ scrollbarWidth: 'none' }} // overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
      >
        <div className="h-[95svh] sm:h-[92svh] overflow-hidden pb-24">
          {/* header84svh */}
          <div className="absolute top-0 left-0 right-0">
            <Header />
          </div>
          {/* Body */}
          <div className="flex flex-col items-center px-4 w-full h-[100%] mt-4">
            <div
              className="w-10/12 sm:w-full md:w-11/12 md:text-4xl text-lg font-[650] sm:font-[600]"
              style={{ textAlign: 'center' }}
            >
              What would you like to assign to your AI?
            </div>

            {loader ? (
              <div className="w-full flex flex-row justify-center items-center h-screen">
                <CircularProgress size={35} />
              </div>
            ) : (
              <div
                className="mt-2 pb-10 sm:mt-8 w-full md:w-10/12 lg:w-7/12 gap-4 flex flex-col  overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin"
                style={{
                  scrollbarColor: 'hsl(var(--brand-primary, 270 75% 50%)) transparent',
                }}
                // style={{ scrollbarWidth: "none" }}
              >
                {servicesData.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleserviceId(item.id)
                    }}
                    className="border-none outline-none"
                  >
                    <div
                      className="border bg-white flex flex-row items-center w-full rounded-2xl py-2"
                      style={{
                        border: serviceId.includes(item.id)
                          ? '2px solid hsl(var(--brand-primary, 270 75% 50%))'
                          : '',
                        scrollbarWidth: 'none',
                        backgroundColor: serviceId.includes(item.id)
                          ? 'hsl(var(--brand-primary, 270 75% 50%) / 0.05)'
                          : '',
                      }}
                    >
                      <div className="flex flex-row items-start px-4 w-full py-2 gap-2">
                        {/* heck mark for small screens 
                        <div className="mt-2 sm:hidden">
                          {serviceId.includes(item.id) ? (
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
                          {serviceId.includes(item.id) ? (
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

                        <div className="text-start w-[100%] md:w-[90%]">
                          <div
                            style={{
                              fontFamily: "",
                              fontWeight: "700",
                              fontSize: 20,
                              textAlign: "start"
                            }}
                          >
                            {item.title}
                          </div>

                          <div className="mt-2 " style={{ textAlign: "start" }}>
                            {item.description}
                          </div>
                        </div>*/}

                        <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                          {/* Check mark for small screens*/}
                          <div className="sm:hidden flex items-center">
                            <Checkbox
                              checked={serviceId.includes(item.id)}
                              className="h-5 w-5 rounded-full border-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                            />
                          </div>

                          {/*Check mark for large screens */}
                          <div className="flex items-center sm:flex hidden">
                            <Checkbox
                              checked={serviceId.includes(item.id)}
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
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100">
          <div className="px-4 pt-3 pb-2">
            <ProgressBar value={33} />
          </div>
          <div className="flex items-center justify-between w-full " style={{ minHeight: '50px' }}>
            <Footer
              handleContinue={handleNext}
              handleBack={handleBack}
              shouldContinue={shouldContinue}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserService
