'use client'

import './CalendarOverrides.css'
import 'react-calendar/dist/Calendar.css'

import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  duration,
} from '@mui/material'
import { CalendarDots } from '@phosphor-icons/react'
import axios from 'axios'
import parsePhoneNumberFromString from 'libphonenumber-js'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import Calendar from 'react-calendar'
import InfiniteScroll from 'react-infinite-scroll-component'

import Apis from '@/components/apis/Apis'
import LeadDetails from '@/components/dashboard/leads/extras/LeadDetails'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { getStatus } from '@/services/leadScoringSerevices/callLogServices/CallLogServices'
import {
  GetFormattedDateString,
  GetFormattedTimeString,
  GetTimezone,
  convertUTCToTimezone,
} from '@/utilities/utility'

import AdminLeadDetails from '../AdminLeadDetails'

function AdminAllCalls({ selectedUser }) {
  const LimitPerPage = 20

  const [searchValue, setSearchValue] = useState('')

  const [callDetails, setCallDetails] = useState([])
  const [filteredCallDetails, setFilteredCallDetails] = useState([])
  const [initialLoader, setInitialLoader] = useState(false)

  //code for filter call log details
  //variabl for deltag
  const [DelTagLoader, setDelTagLoader] = useState(null)

  const [AssignLeadModal, setAssignLeadModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)

  const [selectedFromDate, setSelectedFromDate] = useState(null)
  const [showFromDatePicker, setShowFromDatePicker] = useState(false)
  const [selectedToDate, setSelectedToDate] = useState(null)
  const [showToDatePicker, setShowToDatePicker] = useState(false)

  const [sheetsLoader, setSheetsLoader] = useState(false)

  //code for pipelines
  const [pipelinesList, setPipelinesList] = useState([])
  const [stagesList, setStagesList] = useState([])

  //code for details modal
  const [selectedLeadsDetails, setselectedLeadsDetails] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const [selectedPipeline, setSelectedPipeline] = useState('')
  const [selectedStageIds, setSelectedStageIds] = useState([])
  const [selectedStatus, setSelectedStatus] = useState([])
  const [filtersChanged, setFiltersChanged] = useState(false)
  const [pipelineLoader, setPipelineLoader] = useState(false)

  //code for pagination
  const [offset, setOffset] = useState(5)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const requestVersion = useRef(0)

  const filterRef = useRef(null)
  const fromCalendarRef = useRef(null)
  const toCalendarRef = useRef(null)

  const statusList = [
    {
      id: 1,
      status: 'Voicemail',
    },
    {
      id: 2,
      status: 'Booked',
    },
    {
      id: 3,
      status: 'Hangup',
    },
    {
      id: 4,
      status: 'Hot Lead',
    },
    {
      id: 5,
      status: 'Agent Goodbye',
    },
    {
      id: 6,
      status: 'Human Goodbye',
    },
    {
      id: 7,
      status: 'Busy',
    },
    {
      id: 8,
      status: 'Failed',
    },
    {
      id: 9,
      status: 'Not Interested',
    },
    {
      id: 10,
      status: 'No answer',
    },
  ]

  useEffect(() => {
    //console.log;
    // if ((selectedFromDate && selectedToDate) || selectedStageIds.length > 0) {
    setHasMore(true)
    setCallDetails([])
    setFilteredCallDetails([])
    setInitialLoader(true)
    getCallLogs(0)
    // }
  }, [filtersChanged || searchValue])

  useEffect(() => {
    if (filterRef.current) {
      clearTimeout(filterRef.current)
    }
    filterRef.current = setTimeout(() => {
      //console.log;
      setHasMore(true)
      setCallDetails([])
      setFilteredCallDetails([])
      setInitialLoader(true)
      getCallLogs(0)
    }, 400)
  }, [searchValue])
  //select pipeline
  const handleChangePipeline = (event) => {
    const selectedValue = event.target.value
    setSelectedPipeline(event.target.value)

    const selectedItem = pipelinesList.find(
      (item) => item.title === selectedValue,
    )
    // //console.log;
    // setSelectedPipelineItem(selectedItem);
    setStagesList(selectedItem.stages)
    // setSelectedPipelineStages(selectedItem.stages);
  }

  function getFilterTitle(filter) {
    if (filter.key == 'date') {
      let string = ''
      let values = filter.values
      if (values.length > 0) {
        string = moment(values[0]).format('MMM Do') + ''
        if (values.length > 1) {
          string = `${string} - 
            ${moment(values[1]).format('MMM Do')}`
        }
        return string
      }

      return string
    }
    if (filter.key == 'stage') {
      let values = filter.values
      if (values.length > 0) {
        let stageTitle = values[0].stageTitle
        return stageTitle
      }
      return ''
    }
    if (filter.key == 'pipeline') {
      let values = filter.values
      if (values.length > 0) {
        let stageTitle = values[0]
        return stageTitle
      }
      return ''
    }

    if (filter.key === 'status') {
      return filter.values[0] // ✅ Fix: Just return the string value
    }
    //console.log;
  }

  function GetFiltersFromSelection() {
    let filters = []
    if (selectedFromDate && selectedToDate) {
      let dateFilter = {
        key: 'date',
        values: [selectedFromDate, selectedToDate],
      }
      filters.push(dateFilter)
    }
    if (selectedPipeline) {
      let dateFilter = {
        key: 'pipeline',
        values: [selectedPipeline],
      }
      filters.push(dateFilter)
    }
    if (selectedStageIds && selectedStageIds.length > 0) {
      let currentSelectedStages = []
      stagesList.map((stage) => {
        if (selectedStageIds.includes(stage.id)) {
          currentSelectedStages.push(stage)
        }
      })

      if (currentSelectedStages.length > 0) {
        currentSelectedStages.map((stage) => {
          let dateFilter = {
            key: 'stage',
            values: [stage],
          }
          filters.push(dateFilter)
        })
      }
    }

    if (selectedStatus.length > 0) {
      selectedStatus.forEach((status) => {
        filters.push({
          key: 'status',
          values: [status], // ✅ Fix: Store each status separately
        })
      })
    }

    //console.log;

    // Status filters (Ensure each status is separate)
    // selectedStatus.forEach((status) => {
    //   filters.push({
    //     key: "status",
    //     values: [status], // Pass each status individually
    //   });
    // });

    return filters
  }

  useEffect(() => {
    // const localPipelines = localStorage.getItem("pipelinesData");
    // if (localPipelines) {
    //   const PipelineDetails = JSON.parse(localPipelines);
    //  // //console.log;
    //   setPipelinesList(PipelineDetails);
    //   setSelectedPipeline(PipelineDetails[0].title);
    //   setStagesList(PipelineDetails[0].stages);
    // }

    try {
      // //console.log;
      getPipelines()
      const localCalls = localStorage.getItem('calldetails')
      if (localCalls) {
        const localCallData = JSON.parse(localCalls)
        // //console.log;
        setCallDetails(localCallData)
        setFilteredCallDetails(localCallData)
      } else {
        getCallLogs()
      }
    } catch (error) {
      // console.error("Error ", error);
    } finally {
    }
  }, [])

  //function for getting pipelines
  const getPipelines = async () => {
    try {
      const ApiPath = Apis.getPipelines + '?userId=' + selectedUser.id

      let AuthToken = null
      const LocalData = localStorage.getItem('User')
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData)
        AuthToken = UserDetails.token
      }

      // //console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;

        if (response.data.status === true) {
          setPipelinesList(response.data.data)
          // setSelectedPipeline(response.data.data[0].title);
          setStagesList(response.data.data[0].stages)
        }
      }
    } catch (error) {
      // console.error("Error occured in get pipelies api is :", error);
    } finally {
      // //console.log;
    }
  }

  //code for getting call log details
  const getCallLogs = async (offset = null) => {
    const currentRequestVersion = ++requestVersion.current
    // //console.log;
    try {
      setLoading(true)
      setInitialLoader(true)
      // //console.log;
      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const Data = JSON.parse(localData)
        // //console.log;
        AuthToken = Data.token
      }
      // //console.log;
      let startDate = ''
      let endDate = ''

      if (selectedFromDate && selectedToDate) {
        startDate = moment(selectedFromDate).format('MM-DD-YYYY HH:mm:ss')
        endDate = moment(selectedToDate).format('MM-DD-YYYY HH:mm:ss')
      }

      // //console.log;
      const stages = selectedStageIds.join(',')
      //console.log;
      // //console.log;
      let ApiPath = null
      // //console.log;
      if (offset == null) {
        offset = filteredCallDetails.length
      }
      let separator = '?'
      if (selectedFromDate && selectedToDate) {
        ApiPath = `${Apis.getCallLogs}${separator}startDate=${startDate}&endDate=${endDate}`
        separator = '&'
      } else {
        ApiPath = `${Apis.getCallLogs}` //Apis.getCallLogs;
        // separator = "&";
      }
      if (selectedPipeline) {
        let pipeline = pipelinesList.filter(
          (pipeline) => selectedPipeline === pipeline.title,
        )
        //console.log
        ApiPath = ApiPath + separator + 'pipelineId=' + pipeline[0].id
        separator = '&'
      }

      if (stages.length > 0) {
        ApiPath = `${ApiPath}${separator}stageIds=${stages}`
        separator = '&'
      }
      if (searchValue && searchValue.length > 0) {
        ApiPath = `${ApiPath}${separator}name=${searchValue}`
        separator = '&'
      }

      if (selectedStatus.length > 0) {
        ApiPath += `${separator}status=${selectedStatus.join(',')}`
        separator = '&'
      }

      // if (selectedFromDate && selectedToDate && stages.length > 0) {
      //     ApiPath = `${Apis.getCallLogs}?startDate=${startDate}&endDate=${endDate}&stageIds=${stages}&offset=${offset}&limit=10`;
      // }
      ApiPath = `${ApiPath}${separator}offset=${offset}&timezone=${GetTimezone()}&limit=${LimitPerPage}`

      ApiPath = ApiPath + '&userId=' + selectedUser.id

      console.log('api path is ', ApiPath)
      //console.log;

      //// //console.log;
      // return;
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })
      setLoading(false)

      if (currentRequestVersion === requestVersion.current) {
        if (response) {
          console.log
          // setCallDetails(response.data.data);
          // setFilteredCallDetails(response.data.data);
          console.log('call logs length is', response.data.data.length)

          const data = response.data.data
          localStorage.setItem(
            'callDetails',
            JSON.stringify(response.data.data),
          )
          setCallDetails((prevDetails) => [...prevDetails, ...data])
          setFilteredCallDetails((prevDetails) => [...prevDetails, ...data])

          if (data.length < LimitPerPage) {
            setHasMore(false)
          }
          // setOffset((prevOffset) => prevOffset + 5);
        }
      }
    } catch (error) {
      console.error('Error occured in gtting calls log api is:', error)
    } finally {
      setInitialLoader(false)
    }
  }

  //fetch more data from api
  const fetchMoreData = () => {
    if (!loading && hasMore) {
      setLoading(true) // Prevent multiple fetches during loading
    }
  }

  //code to filter search
  const handleSearchChange = (value) => {
    if (value.trim() === '') {
      //// //console.log;
      // Reset to original list when input is empty
      setFilteredCallDetails(callDetails)
      return
    }

    const filtered = callDetails.filter((item) => {
      const term = value.toLowerCase()
      return (
        item.LeadModel?.firstName.toLowerCase().includes(term) ||
        // item.LeadModel?.lastName.toLowerCase().includes(term) ||
        // item.LeadModel?.address.toLowerCase().includes(term) ||
        item.LeadModel?.email.toLowerCase().includes(term) ||
        (item.LeadModel?.phone && callDetails.LeadModel?.phone.includes(term))
      )
    })

    setFilteredCallDetails(filtered)
  }

  //function to select date
  const handleFromDateChange = (date) => {
    setSelectedFromDate(date) // Set the selected date
    setShowFromDatePicker(false)
  }

  const handleToDateChange = (date) => {
    setSelectedToDate(date) // Set the selected date
    setShowToDatePicker(false)
  }

  //code to select stage
  const handleSelectStage = (item) => {
    // setSelectedStage(item);
    setSelectedStageIds((prevIds) => {
      if (prevIds.includes(item.id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== item.id)
      } else {
        // Select the item if it's not already selected
        return [...prevIds, item.id]
      }
    })
  }

  //function to format phone number
  //code for formating the number
  const formatPhoneNumber = (rawNumber) => {
    const phoneNumber = parsePhoneNumberFromString(
      rawNumber?.startsWith('+') ? rawNumber : `+${rawNumber}`,
    )
    //// //console.log;
    return phoneNumber
      ? phoneNumber.formatInternational()
      : 'Invalid phone number'
  }

  const [filterData, setFilterData] = useState({
    fromdate: '',
    todate: '',
    stages: [
      {
        id: '',
        title: '',
      },
    ],
  })

  return (
    <div className="w-full items-start">
      <div className="flex w-full pl-10 flex-row items-center gap-3">
        <div className="flex flex-row items-center gap-1 w-[22vw] flex-shrink-0 border  rounded-full pe-2">
          <input
            style={{ fontSize: 15 }}
            type="text"
            placeholder="Search by name, email or phone"
            className="flex-grow outline-none font-[500]  border-none focus:outline-none focus:ring-0 flex-shrink-0 rounded-full"
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value
              // handleSearchChange(value);
              setSearchValue(value)
            }}
          />
          <img
            src={'/otherAssets/searchIcon.png'}
            alt="Search"
            width={20}
            height={20}
          />
        </div>

        <button
          className="flex-shrink-0"
          onClick={() => {
            setShowFilterModal(true)
          }}
        >
          <Image
            src={'/otherAssets/filterBtn.png'}
            height={36}
            width={36}
            alt="Search"
          />
        </button>

        {/* Show filters here in a row*/}
        <div
          className="flex flex-row items-center gap-4 flex-shrink-0 overflow-auto w-[70%] "
          style={{
            scrollbarColor: '#00000000',
            scrollbarWidth: 'none',
          }}
        >
          {GetFiltersFromSelection().map((filter, index) => {
            //////console.log;
            return (
              <div className="flex-shrink-0" key={filter.key + index}>
                <div
                  className="px-4 py-2 bg-[#402FFF10] text-purple  flex-shrink-0 [#7902DF10] rounded-[25px] flex flex-row items-center gap-2"
                  style={{ fontWeight: '500', fontSize: 15 }}
                >
                  {getFilterTitle(filter)}
                  <button
                    className="outline-none "
                    onClick={() => {
                      if (filter.key == 'date') {
                        setSelectedFromDate(null)
                        setSelectedToDate(null)
                        setFiltersChanged((prev) => !prev)
                      }
                      if (filter.key == 'stage') {
                        setSelectedStageIds((prev) => {
                          const updatedstage = prev.filter(
                            (s) => s !== filter.values[0].id,
                          )

                          // ✅ Call API AFTER state update using setTimeout (ensures latest state is used

                          return updatedstage // Update state
                        })
                        setFiltersChanged((prev) => !prev)
                      }
                      if (filter.key == 'pipeline') {
                        setSelectedPipeline(null)
                        setSelectedStageIds([])
                        setFiltersChanged((prev) => !prev)
                      }
                      if (filter.key === 'status') {
                        // ✅ Update state first
                        setSelectedStatus((prev) => {
                          const updatedStatus = prev.filter(
                            (s) => s !== filter.values[0],
                          )
                          return updatedStatus // Update state
                        })

                        setFiltersChanged((prev) => !prev)
                      }
                    }}
                  >
                    <Image
                      src={'/otherAssets/crossIcon.png'}
                      height={20}
                      width={20}
                      alt="*"
                    />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="w-full flex flex-row gap-2 mt-2 px-10 mt-12">
        <div className="w-2/12">
          <div style={styles.text}>Name</div>
        </div>

        <div className="w-1/12">
          <div style={styles.text}>Agent</div>
        </div>

        <div className="w-2/12">
          <div style={styles.text}>Contact</div>
        </div>
        <div className="w-2/12 ">
          <div style={styles.text}>Pipeline</div>
        </div>
        <div className="w-1/12">
          <div style={styles.text}>Stage</div>
        </div>
        <div className="w-1/12">
          <div style={styles.text}>Type</div>
        </div>
        <div className="w-1/12">
          <div style={styles.text}>Status</div>
        </div>
        <div className="w-2/12">
          <div style={styles.text}>Date</div>
        </div>
        <div className="w-1/12">
          <div style={styles.text}>More</div>
        </div>
      </div>

      {initialLoader && filteredCallDetails.length == 0 ? (
        <div
          className={`flex flex-row items-center justify-center mt-12 h-[41vh] overflow-auto`}
        >
          <CircularProgress size={35} thickness={2} />
        </div>
      ) : (
        <div
          className={`h-[41vh] overflow-auto`}
          id="scrollableDiv1"
          style={{ scrollbarWidth: 'none' }}
        >
          <InfiniteScroll
            className="lg:flex hidden flex-col w-full"
            endMessage={
              <p
                style={{
                  textAlign: 'center',
                  paddingTop: '10px',
                  fontWeight: '400',
                  fontFamily: 'inter',
                  fontSize: 16,
                  color: '#00000060',
                }}
              >
                {`You're all caught up`}
              </p>
            }
            scrollableTarget="scrollableDiv1"
            dataLength={filteredCallDetails.length}
            next={() => {
              console.log('Trigered scrolling on admin call logs')
              if (!loading && hasMore) {
                getCallLogs(filteredCallDetails.length)
              }
            }} // Fetch more when scrolled
            hasMore={hasMore} // Check if there's more data
            loader={
              <div className="w-full flex flex-row justify-center mt-8">
                <CircularProgress size={35} />
              </div>
            }
            style={{ overflow: 'unset' }}
          >
            {filteredCallDetails?.length > 0 ? (
              <div>
                {filteredCallDetails.map((item) => (
                  <div
                    key={item.id}
                    style={{ cursor: 'pointer' }}
                    className="w-full flex flex-row gap-2 items-center mt-5 px-10 hover:bg-[#402FFF05] py-2"
                  >
                    <div
                      className="w-2/12 truncate flex flex-row gap-3 items-center cursor-pointer"
                      onClick={() => {
                        // //console.log;
                        setselectedLeadsDetails(item)
                        setShowDetailsModal(true)
                      }}
                    >
                      <div className="h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white">
                        {item.LeadModel?.firstName.slice(0, 1).toUpperCase()}
                      </div>
                      <div
                        className="truncate"
                        style={{ ...styles.text2, ...{ width: '65%' } }}
                      >
                        {item.LeadModel?.firstName} {item.LeadModel?.lastName}
                      </div>
                    </div>
                    <div
                      style={{ ...styles.text2 }}
                      className="w-1/12 truncate flex flex-row items-center flex-shrink-0 "
                    >
                      {item.agent?.name}
                    </div>

                    <div className="w-2/12 truncate">
                      {/* (item.LeadModel?.phone) */}
                      <div style={styles.text2}>
                        {item.LeadModel?.phone ? (
                          <div className="truncate">
                            {formatPhoneNumber(item?.LeadModel?.phone)}
                          </div>
                        ) : (
                          '-'
                        )}
                      </div>
                    </div>

                    <div className="w-2/12 truncate">
                      <div style={styles.text2}>
                        {item.pipeline ? (
                          <div>{item.pipeline?.title}</div>
                        ) : (
                          '-'
                        )}
                      </div>
                    </div>

                    <div className="w-1/12 truncate">
                      <div style={styles.text2}>
                        {item?.callStage?.stageTitle
                          ? item.callStage?.stageTitle
                          : '-'}
                      </div>
                    </div>
                    <div className="w-1/12 truncate capitalize">
                      <div style={styles.text2}>
                        {item.communicationType ? item.communicationType : '-'}
                      </div>
                    </div>
                    <div className="w-1/12 truncate capitalize">
                      <div style={styles.text2}>{getStatus(item) || '-'}</div>
                    </div>
                    <div className="w-2/12 truncate">
                      <div style={styles.text2}>
                        {GetFormattedDateString(item?.createdAt)}{' '}
                        {GetFormattedTimeString(item?.createdAt)}
                      </div>
                    </div>
                    <div className="w-1/12 truncate">
                      <button
                        onClick={() => {
                          // //console.log;
                          setselectedLeadsDetails(item)
                          setShowDetailsModal(true)
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            color: '#7902DF',
                            textDecorationLine: 'underline',
                          }}
                        >
                          Details
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="text-center mt-4"
                style={{ fontWeight: 'bold', fontSize: 20 }}
              >
                No activities found
              </div>
            )}
          </InfiniteScroll>
        </div>
        //     )
        //   }

        // </div>
      )}

      {/* Code for filter modal */}
      <div>
        <Modal
          open={showFilterModal}
          closeAfterTransition
          BackdropProps={{
            sx: {
              backgroundColor: '#00000020',
              // //backdropFilter: "blur(5px)",
            },
          }}
        >
          <Box
            className="lg:w-4/12 sm:w-7/12 w-8/12 px-6 flex justify-center items-center"
            sx={{
              ...styles.modalsStyle,
              scrollbarWidth: 'none',
              backgroundColor: 'transparent',
              height: '100svh',
            }}
          >
            <div className="w-full flex flex-col items-center justify-between h-[60vh] bg-white p-4 rounded-md overflow-auto  ">
              <div className="mt-2 w-full">
                <div className="flex flex-row items-center justify-between w-full">
                  <div>Filter</div>
                  <CloseBtn
                    onClick={() => {
                      setShowFilterModal(false)
                    }}
                  />
                </div>

                <div className="flex flex-row items-start gap-4">
                  <div className="w-1/2 h-full">
                    <div
                      className="h-full"
                      style={{
                        fontWeight: '500',
                        fontSize: 12,
                        color: '#00000060',
                        marginTop: 10,
                      }}
                    >
                      From
                    </div>
                    <div>
                      <button
                        style={{ border: '1px solid #00000020' }}
                        className="flex flex-row items-center justify-between p-2 rounded-lg mt-2 w-full justify-between"
                        onClick={() => {
                          setShowFromDatePicker(true)
                        }}
                      >
                        <p>
                          {selectedFromDate
                            ? selectedFromDate.toDateString()
                            : 'Select Date'}
                        </p>
                        <CalendarDots weight="regular" size={25} />
                      </button>

                      <div>
                        {showFromDatePicker && (
                          <div ref={fromCalendarRef}>
                            <Calendar
                              onChange={handleFromDateChange}
                              value={selectedFromDate}
                              locale="en-US"
                              onClose={() => {
                                setShowFromDatePicker(false)
                              }}
                              tileClassName={({ date, view }) => {
                                const today = new Date()

                                // Highlight the current date
                                if (
                                  date.getDate() === today.getDate() &&
                                  date.getMonth() === today.getMonth() &&
                                  date.getFullYear() === today.getFullYear()
                                ) {
                                  return 'current-date' // Add a custom class for current date
                                }

                                return null // Default for other dates
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-1/2 h-full">
                    <div
                      style={{
                        fontWeight: '500',
                        fontSize: 12,
                        color: '#00000060',
                        marginTop: 10,
                      }}
                    >
                      To
                    </div>
                    <div>
                      <button
                        style={{ border: '1px solid #00000020' }}
                        className="flex flex-row items-center justify-between p-2 rounded-lg mt-2 w-full justify-between"
                        onClick={() => {
                          setShowToDatePicker(true)
                        }}
                      >
                        <p>
                          {selectedToDate
                            ? selectedToDate.toDateString()
                            : 'Select Date'}
                        </p>
                        <CalendarDots weight="regular" size={25} />
                      </button>
                      <div>
                        {showToDatePicker && (
                          <div ref={toCalendarRef}>
                            <Calendar
                              className="react-calendar"
                              onChange={handleToDateChange}
                              value={selectedToDate}
                              locale="en-US"
                              onClose={() => {
                                setShowToDatePicker(false)
                              }}
                              tileClassName={({ date, view }) => {
                                const today = new Date()

                                // Highlight the current date
                                if (
                                  date.getDate() === today.getDate() &&
                                  date.getMonth() === today.getMonth() &&
                                  date.getFullYear() === today.getFullYear()
                                ) {
                                  return 'current-date' // Add a custom class for current date
                                }

                                return null // Default for other dates
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 w-full">
                  {pipelineLoader ? (
                    <CircularProgress size={25} />
                  ) : (
                    <FormControl fullWidth>
                      {/* <InputLabel id="demo-simple-select-label">Age</InputLabel> */}
                      <Select
                        value={selectedPipeline}
                        onChange={handleChangePipeline}
                        displayEmpty // Enables placeholder
                        renderValue={(selected) => {
                          if (!selected) {
                            return (
                              <div style={{ color: '#aaa' }}>
                                Select pipeline
                              </div>
                            ) // Placeholder style
                          }
                          return selected
                        }}
                        sx={{
                          border: '1px solid #00000020', // Default border
                          '&:hover': {
                            border: '1px solid #00000020', // Same border on hover
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none', // Remove the default outline
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            border: 'none', // Remove outline on focus
                          },
                          '&.MuiSelect-select': {
                            py: 0, // Optional padding adjustments
                          },
                        }}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: '30vh', // Limit dropdown height
                              overflow: 'auto', // Enable scrolling in dropdown
                              scrollbarWidth: 'none',
                              // borderRadius: "10px"
                            },
                          },
                        }}
                      >
                        {pipelinesList.map((item, index) => (
                          <MenuItem
                            key={item.id}
                            style={styles.dropdownMenu}
                            value={item.title}
                          >
                            {item.title}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </div>

                <div
                  className="mt-6"
                  style={{
                    fontWeight: '500',
                    fontSize: 12,
                    color: '#00000060',
                    marginTop: 10,
                  }}
                >
                  Stage
                </div>

                {selectedPipeline && (
                  <div className="w-full flex flex-wrap gap-4">
                    {stagesList.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-row items-center mt-2 justify-start"
                        style={{ fontSize: 15, fontWeight: '500' }}
                      >
                        <button
                          onClick={() => {
                            handleSelectStage(item)
                          }}
                          className={`p-2 border border-[#00000020] ${
                            selectedStageIds.includes(item.id)
                              ? `bg-purple`
                              : 'bg-transparent'
                          } px-6
                                                                ${
                                                                  selectedStageIds.includes(
                                                                    item.id,
                                                                  )
                                                                    ? `text-white`
                                                                    : 'text-black'
                                                                } rounded-2xl`}
                        >
                          {item.stageTitle}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    fontWeight: '500',
                    fontSize: 12,
                    color: '#00000060',
                    marginTop: 10,
                  }}
                >
                  Status
                </div>

                <div className="w-full flex flex-row items-center gap-2 flex-wrap mt-4">
                  {statusList.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedStatus((prev) => {
                          if (prev.includes(item.status)) {
                            return prev.filter((s) => s !== item.status)
                          } else {
                            return [...prev, item.status]
                          }
                        })
                      }}
                    >
                      <div
                        className="py-2 px-3 border rounded-full"
                        style={{
                          color: selectedStatus.includes(item.status)
                            ? '#fff'
                            : '',
                          backgroundColor: selectedStatus.includes(item.status)
                            ? '#7902df'
                            : '',
                        }}
                      >
                        {item.status}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-row items-center w-full justify-between mt-4 pb-8">
                <button
                  className="outline-none w-full"
                  style={{ fontSize: 16.8, fontWeight: '600' }}
                  onClick={() => {
                    setSelectedFromDate(null)
                    setSelectedToDate(null)
                    setSelectedStageIds([])
                    setSelectedStatus([])
                    setSelectedPipeline('')
                    setFiltersChanged((prev) => !prev)
                    setShowFilterModal(false)
                    // if (typeof window !== "undefined") {
                    //   window.location.reload();
                    // }
                  }}
                >
                  Reset
                </button>
                {sheetsLoader ? (
                  <CircularProgress size={25} />
                ) : (
                  <button
                    className="bg-purple h-[45px] w-full bg-purple text-white rounded-xl outline-none"
                    style={{
                      fontSize: 16.8,
                      fontWeight: '600',
                      backgroundColor:
                        (selectedFromDate && selectedToDate) ||
                        selectedStageIds.length > 0 ||
                        selectedStatus.length > 0
                          ? ''
                          : '#00000050',
                    }}
                    onClick={() => {
                      // //console.log;
                      if (
                        (selectedFromDate && selectedToDate) ||
                        selectedStageIds.length > 0 ||
                        selectedStatus.length > 0 ||
                        selectedPipeline
                      ) {
                        localStorage.removeItem('callDetails')
                        setHasMore(true)
                        setCallDetails([])
                        setFilteredCallDetails([])
                        setInitialLoader(true)
                        getCallLogs(0)
                        setShowFilterModal(false)
                        // getCallLogs(0);
                      } else {
                        // //console.log;
                      }
                    }}
                  >
                    Apply Filter
                  </button>
                )}
              </div>
            </div>
          </Box>
        </Modal>
      </div>

      {/* Code for details view */}
      {showDetailsModal && (
        <AdminLeadDetails
          selectedLead={selectedLeadsDetails?.LeadModel?.id}
          pipelineId={selectedLeadsDetails?.PipelineStages?.pipelineId}
          showDetailsModal={showDetailsModal}
          setShowDetailsModal={setShowDetailsModal}
          hideDelete={true}
        />
      )}
    </div>
  )
}

export default AdminAllCalls

//styles
const styles = {
  text: {
    fontSize: 15,
    color: '#00000090',
    fontWeight: '600',
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
  modalsStyle: {
    // height: "auto",
    bgcolor: 'transparent',
    p: 2,
    mx: 'auto',
    // my: "50vh",
    // transform: "translateY(-55%)",
    borderRadius: 2,
    border: 'none',
    outline: 'none',
  },
}
