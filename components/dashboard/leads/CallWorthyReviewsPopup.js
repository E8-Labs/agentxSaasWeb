import { Box, CircularProgress, Modal } from '@mui/material'
import {
  CaretDown,
  CaretUp,
  EnvelopeSimple,
  Plus,
  X,
} from '@phosphor-icons/react'
import axios from 'axios'
import parsePhoneNumberFromString from 'libphonenumber-js'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import { GetFormattedDateString } from '@/utilities/utility'

function CallWorthyReviewsPopup({ open, close }) {
  const [importantCalls, setImportantCalls] = useState([])
  const [selectedCall, setSelectedCall] = useState('')
  const [initialLoader, setInitialLoader] = useState(false)

  const [isExpandedActivity, setIsExpandedActivity] = useState([])
  const [isExpanded, setIsExpanded] = useState([])

  const [showAudioPlay, setShowAudioPlay] = useState(null)

  useEffect(() => {
    getImportantCalls()
  }, [])

  const getImportantCalls = async () => {
    try {
      setInitialLoader(true)
      const data = localStorage.getItem('User')
      if (data) {
        const u = JSON.parse(data)
        let path = Apis.getImportantCalls
        // //console.log;
        const response = await axios.get(path, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response) {
          if (response.data.status === true) {
            console.log(
              'response of get imporatant calls api is',
              response.data.data,
            )
            setImportantCalls(response.data.data)
            setSelectedCall(response.data.data[0])
          } else {
            // console.log(
            // "message of get important calls api is",
            //   response.data.message
            // );
          }
        }
      }
    } catch (e) {
      // //console.log;
    } finally {
      setInitialLoader(false)
    }
  }

  const formatPhoneNumber = (rawNumber) => {
    const phoneNumber = parsePhoneNumberFromString(
      rawNumber?.startsWith('+') ? rawNumber : `+${rawNumber}`,
    )
    //// //console.log;
    return phoneNumber
      ? phoneNumber.formatInternational()
      : 'Invalid phone number'
  }
  const handleShowMoreActivityData = (item) => {
    // setIsExpanded(!isExpanded);

    setIsExpandedActivity((prevIds) => {
      if (prevIds.includes(item.id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== item.id)
      } else {
        // Select the item if it's not already selected
        return [...prevIds, item.id]
      }
    })
  }
  const handleReadMoreToggle = (item) => {
    // setIsExpanded(!isExpanded);

    setIsExpanded((prevIds) => {
      if (prevIds.includes(item.id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== item.id)
      } else {
        // Select the item if it's not already selected
        return [...prevIds, item.id]
      }
    })
  }

  return (
    <div className="w-full">
      <Modal
        open={open}
        onClose={() => {
          close()
        }}
        closeAfterTransition
        BackdropProps={{
          timeout: 500,
          sx: {
            backgroundColor: '#00000020',
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-9/12 sm:w-full w-full" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full h-[90vh]">
            <div
              className="sm:w-full w-full px-6 py-6"
              style={{
                backgroundColor: '#ffffff',

                borderRadius: '13px',
              }}
            >
              <div className="w-full flex flex-row items-center justify-between">
                <div style={{ fontSize: 22, fontWeight: '600', color: '#000' }}>
                  Recommend giving these a listen
                </div>

                <button onClick={close} className="flex flex-row gap-2">
                  <div style={{ fontSize: 15, fontWeight: '500' }}>Close</div>
                  <img
                    src="/svgIcons/cross.svg"
                    style={{ height: 24, width: 24 }}
                  />
                </button>
              </div>

              <div
                className="h-[100%] pb-12"
                style={{ scrollbarWidth: 'none' }}
              >
                {initialLoader ? (
                  <div className="w-full flex flex-row items-center justify-center mt-12">
                    <CircularProgress size={35} thickness={2} />
                  </div>
                ) : (
                  <div className="w-full h-[100%]">
                    {importantCalls?.length > 0 ? (
                      <div className="w-full flex flex-row items-start justify-between h-[100%]">
                        <div
                          className="w-4/12 px-3 flex flex-col overflow-auto h-[100%]"
                          style={{ scrollbarWidth: 'none' }}
                        >
                          {importantCalls?.map(
                            (
                              item,
                              index, //.slice.reverse
                            ) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setSelectedCall(item)
                                }}
                                className="w-full p-3 flex flex-col gap-2 border-[2px] rounded-lg mt-5"
                                style={{
                                  borderColor:
                                    selectedCall.id === item.id
                                      ? '#7902df'
                                      : '',
                                }}
                              >
                                <div className="w-full flex flex-row justify-between items-center">
                                  <div className="flex flex-col gap-2 items-start">
                                    <div className="flex flex-row gap-2 items-center">
                                      <div
                                        className="h-[27px] w-[27px] items-center justify-center pt-[2px] rounded-full bg-black"
                                        style={{
                                          fontSize: 15,
                                          fontWeight: '500',
                                          color: '#fff',
                                        }}
                                      >
                                        {item.firstName[0]}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: 15,
                                          fontWeight: '500',
                                        }}
                                      >
                                        {item.firstName}
                                      </div>
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 13,
                                        fontWeight: '500',
                                        color: '#00000060',
                                        width: 100,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      }}
                                    >
                                      {item.email.slice(0, 10) + '...'}
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-2 items-end">
                                    <img
                                      src="/svgIcons/fireIcon.png"
                                      style={{ height: 17, width: 17 }}
                                    />
                                    <div className="flex flex-row gap-2 items-center">
                                      <Image
                                        src={'/agentXOrb.gif'}
                                        height={23}
                                        width={23}
                                        alt="gif"
                                      />
                                      <div
                                        style={{
                                          fontSize: 13,
                                          fontWeight: '600',
                                          color: '#7902df',
                                          textDecorationLine: 'underline',
                                          marginRight: 30,
                                        }}
                                      >
                                        {item?.callActivity[0]?.agent?.name ||
                                          '-'}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="w-full flex flex-row justify-between items-center">
                                  <Image
                                    src={'/assets/manIcon.png'}
                                    height={23}
                                    width={23}
                                    alt="*"
                                  />

                                  <div className="flex flex-row gap-2">
                                    {item.tags?.length > 0 ? (
                                      <div
                                        className="text-end flex flex-row items-center gap-4"
                                        style={styles.paragraph}
                                      >
                                        {
                                          // selectedLeadsDetails?.tags?.map.slice(0, 1)
                                          item?.tags
                                            .slice(0, 2)
                                            .map((tag, index) => {
                                              return (
                                                <div
                                                  key={index}
                                                  className="flex flex-row items-center gap-4"
                                                >
                                                  <div className="flex flex-row items-center gap-4 bg-[#7902df05] px-2 py-1 rounded-lg">
                                                    <div
                                                      className="text-purple text-[13px]" //1C55FF10
                                                    >
                                                      {tag}
                                                    </div>
                                                  </div>
                                                </div>
                                              )
                                            })
                                        }
                                        <div>
                                          {item?.tags.length > 2 && (
                                            <div>+{item?.tags.length - 2}</div>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      '-'
                                    )}
                                  </div>
                                </div>
                              </button>
                            ),
                          )}
                        </div>

                        <div className="w-8/12 flex flex-col">
                          <div className="w-full flex flex-col items-center h-full">
                            {selectedCall && (
                              <div
                                className="w-full h-[80vh]"
                                style={{
                                  overflow: 'auto',
                                  scrollbarWidth: 'none',
                                }}
                              >
                                <div>
                                  <div
                                    style={{
                                      padding: 20,
                                      paddingInline: 30,
                                    }}
                                  >
                                    <div className="flex flex-row items-center justify-between mt-4">
                                      <div className="flex flex-row items-center gap-4">
                                        <div
                                          className="h-[32px] w-[32px] bg-black rounded-full flex flex-row items-center justify-center text-white"
                                          onClick={() =>
                                            handleToggleClick(item.id)
                                          }
                                        >
                                          {selectedCall?.firstName.slice(0, 1)}
                                        </div>
                                        <div
                                          className="truncate"
                                          onClick={() =>
                                            handleToggleClick(item.id)
                                          }
                                        >
                                          {selectedCall?.firstName}{' '}
                                          {selectedCall?.lastName}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex flex-row items-center w-full justify-between mt-4">
                                      <div className="flex flex-row items-center gap-4">
                                        <EnvelopeSimple
                                          size={20}
                                          color="#000000"
                                        />
                                        <div style={styles.subHeading}>
                                          Email Address
                                        </div>
                                      </div>
                                      <div>
                                        <div
                                          className="text-end"
                                          style={styles.paragraph}
                                        >
                                          {selectedCall?.email || '-'}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex flex-row items--center w-full justify-between mt-4">
                                      <div className="flex flex-row items-center gap-4">
                                        {/* <EnvelopeSimple size={20} color='#00000060' /> */}
                                        <Image
                                          src={'/svgIcons/call.svg'}
                                          height={20}
                                          width={20}
                                          alt="man"
                                        />
                                        <div style={styles.subHeading}>
                                          Phone Number
                                        </div>
                                      </div>
                                      <div
                                        className="text-end"
                                        style={styles.paragraph}
                                      >
                                        {/* {selectedLeadsDetails?.phone} */}
                                        {formatPhoneNumber(
                                          selectedCall?.phone,
                                        ) || '-'}
                                      </div>
                                    </div>

                                    {selectedCall?.address && (
                                      <div className="flex flex-row items--center w-full justify-between mt-4">
                                        <div className="flex flex-row items-center gap-4">
                                          {/* <EnvelopeSimple size={20} color='#00000060' /> */}
                                          <Image
                                            src={'/assets/location.png'}
                                            height={16}
                                            width={16}
                                            alt="man"
                                          />
                                          <div style={styles.subHeading}>
                                            Address
                                          </div>
                                        </div>
                                        <div
                                          className="text-end"
                                          style={styles.paragraph}
                                        >
                                          {selectedCall?.address || '-'}
                                        </div>
                                      </div>
                                    )}

                                    {selectedCall?.tags.length > 0 && (
                                      <div className="flex flex-row items--center w-full justify-between mt-4">
                                        <div className="flex flex-row items-center gap-4">
                                          <Image
                                            src={'/assets/tag.png'}
                                            height={16}
                                            width={16}
                                            alt="man"
                                          />
                                          <div style={styles.subHeading}>
                                            Tag
                                          </div>
                                        </div>
                                        {selectedCall?.tags.length > 0 ? (
                                          <div
                                            className="text-end flex flex-row items-center gap-4"
                                            style={styles.paragraph}
                                          >
                                            {
                                              // selectedLeadsDetails?.tags?.map.slice(0, 1)
                                              selectedCall?.tags
                                                .slice(0, 2)
                                                .map((tag, index) => {
                                                  return (
                                                    <div
                                                      key={index}
                                                      className="flex flex-row items-center gap-4"
                                                    >
                                                      <div className="flex flex-row items-center gap-4 bg-[#402FFF17] px-2 py-1 rounded-lg">
                                                        <div
                                                          className="text-purple text-[13px]" //1C55FF10
                                                        >
                                                          {tag}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )
                                                })
                                            }
                                            <div>
                                              {selectedCall?.tags.length >
                                                2 && (
                                                <div>
                                                  +
                                                  {selectedCall?.tags.length -
                                                    2}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ) : (
                                          '-'
                                        )}
                                      </div>
                                    )}

                                    {/*
                                                            <div className="flex flex-row items-center w-full justify-between mt-4">
                                                                <div className="flex flex-row items-center gap-4">
                                                                    <Image
                                                                        src="/assets/pipelineIcon.svg"
                                                                        height={20}
                                                                        width={20}
                                                                        alt="*"
                                                                        style={{
                                                                            filter:
                                                                                "invert(9%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(93%)",
                                                                        }}
                                                                    />
                                                                    <div style={styles.subHeading}>Pipeline</div>
                                                                </div>
                                                                <div className="text-end" style={styles.paragraph}>
                                                                    {selectedLeadsDetails?.pipeline
                                                                        ? selectedLeadsDetails.pipeline.title
                                                                        : "-"}
                                                                </div>
                                                            </div> */}
                                    {selectedCall?.pipeline && (
                                      <div className="flex flex-row items--center w-full justify-between mt-4">
                                        <div className="flex flex-row items-center gap-2">
                                          {/* <Image src={"/otherAssets/calenderIcon.png"} height={16} width={16} alt='man' /> */}
                                          <Image
                                            src="/assets/pipelineIcon.svg"
                                            height={16}
                                            width={16}
                                            alt="*"
                                            style={{
                                              filter:
                                                'invert(9%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(93%)',
                                            }}
                                          />
                                          <div style={styles.subHeading}>
                                            Pipeline
                                          </div>
                                        </div>
                                        <div
                                          className="text-end"
                                          style={styles.paragraph}
                                        >
                                          {/* {selectedLeadsDetails?.phone} */}
                                          {selectedCall?.pipeline
                                            ? selectedCall.pipeline.title
                                            : '-'}
                                        </div>
                                      </div>
                                    )}

                                    {selectedCall?.stage && (
                                      <div className="flex flex-row items--center w-full justify-between mt-4">
                                        <div className="flex flex-row items-center gap-4">
                                          <Image
                                            src={'/svgIcons/arrow2.svg'}
                                            height={25}
                                            width={25}
                                            alt="man"
                                          />
                                          <div style={styles.subHeading}>
                                            Stage
                                          </div>
                                        </div>
                                        <div
                                          className="text-end flex flex-row items-center gap-1"
                                          style={styles.paragraph}
                                        >
                                          <div
                                            className="h-[10px] max-w-[200px] "
                                            style={{
                                              // backgroundColor: "red",
                                              overflow: 'hidden', // Ensures content is clipped
                                              whiteSpace: 'nowrap', // Prevents text from wrapping
                                              textOverflow: 'ellipsis', // Adds the ellipsis
                                              height: '50px',
                                            }}
                                            title={
                                              selectedCall?.stage?.stageTitle
                                            } // Optional: Show full text on hover
                                          >
                                            {selectedCall?.stage?.stageTitle}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex flex-row items--center w-full justify-between mt-4">
                                      <div className="flex flex-row items-center gap-4">
                                        <Image
                                          src={'/svgIcons/manIcon.svg'}
                                          height={20}
                                          width={20}
                                          alt="man"
                                        />
                                        <div style={styles.subHeading}>
                                          Assign
                                        </div>
                                      </div>
                                      <div
                                        className="text-end"
                                        style={styles.paragraph}
                                      >
                                        <Image
                                          src={'/assets/manIcon.png'}
                                          height={16}
                                          width={16}
                                          alt="man"
                                        />
                                      </div>
                                    </div>

                                    {selectedCall?.booking && (
                                      <div className="flex flex-row items--center w-full justify-between mt-4">
                                        <div className="flex flex-row items-center gap-4">
                                          <Image
                                            src="/otherAssets/calenderIcon.png"
                                            height={20}
                                            width={20}
                                            alt="*"
                                            style={{
                                              filter:
                                                'invert(9%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(93%)',
                                            }}
                                          />
                                          <div style={styles.subHeading}>
                                            Appointment
                                          </div>
                                        </div>
                                        <div
                                          className="text-end"
                                          style={styles.paragraph}
                                        >
                                          {/* {selectedLeadsDetails?.phone} */}
                                          {GetFormattedDateString(
                                            selectedCall.booking.datetime,
                                            true,
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Code for custom variables */}
                                  </div>

                                  <div style={{ paddingInline: 30 }}>
                                    <div
                                      style={{
                                        fontsize: 22,
                                        fontWeight: '600',
                                      }}
                                    >
                                      Call Activity
                                    </div>

                                    <div>
                                      {selectedCall?.callActivity.length < 1 ? (
                                        <div
                                          className="flex flex-col items-center justify-center h-[20vh] w-full"
                                          style={{
                                            fontWeight: '500',
                                            fontsize: 15,
                                          }}
                                        >
                                          <div className="h-[52px] w-[52px] rounded-full bg-[#00000020] flex flex-row items-center justify-center">
                                            <Image
                                              src={'/assets/activityClock.png'}
                                              height={24}
                                              width={24}
                                              alt="*"
                                            />
                                          </div>
                                          <div className="mt-4">
                                            <i
                                              style={{
                                                fontWeight: '500',
                                                fontsize: 15,
                                              }}
                                            >
                                              All activities related to this
                                              lead will be shown here
                                            </i>
                                          </div>
                                        </div>
                                      ) : (
                                        <div style={{ paddingInline: 10 }}>
                                          {selectedCall?.callActivity.map(
                                            (item, index) => {
                                              const initialTextLength =
                                                Math.ceil(
                                                  item.transcript?.length * 0.1,
                                                ) // 40% of the text
                                              const initialText =
                                                item.transcript?.slice(
                                                  0,
                                                  initialTextLength,
                                                )
                                              return (
                                                <div
                                                  key={index}
                                                  className="mt-4"
                                                >
                                                  <div
                                                    className="-ms-4"
                                                    style={{
                                                      fontsize: 15,
                                                      fontWeight: '500',
                                                      color: '#15151560',
                                                    }}
                                                  >
                                                    {GetFormattedDateString(
                                                      item?.createdAt,
                                                    )}
                                                  </div>
                                                  <div className="w-full flex flex-row items-center gap-4 h-full">
                                                    <div
                                                      className="pb-4 pt-6 ps-4 w-full"
                                                      style={
                                                        {
                                                          // borderLeft: "1px solid #00000020",
                                                        }
                                                      }
                                                    >
                                                      <div className="h-full w-full">
                                                        <div className="flex flex-row items-center justify-between">
                                                          <div className="flex flex-row items-center gap-1">
                                                            <div
                                                              style={{
                                                                fontWeight:
                                                                  '600',
                                                                fontsize: 15,
                                                              }}
                                                            >
                                                              Outcome
                                                            </div>
                                                            {/* <div className='text-purple' style={{ fontWeight: "600", fontsize: 12 }}>
                                                                                                       {selectedLeadsDetails?.firstName} {selectedLeadsDetails?.lastName}
                                                                                                   </div> */}
                                                          </div>
                                                          <button
                                                            className="text-end flex flex-row items-center gap-1"
                                                            style={
                                                              styles.paragraph
                                                            }
                                                            onClick={() => {
                                                              handleShowMoreActivityData(
                                                                item,
                                                              )
                                                            }}
                                                          >
                                                            <div
                                                              className="h-[10px] w-[10px] rounded-full"
                                                              style={{
                                                                backgroundColor:
                                                                  selectedCall
                                                                    ?.stage
                                                                    ?.defaultColor,
                                                              }}
                                                            ></div>
                                                            {item?.callOutcome
                                                              ? item?.callOutcome
                                                              : 'Ongoing'}
                                                            {/* {checkCallStatus(item)} */}
                                                            <div>
                                                              {isExpandedActivity.includes(
                                                                item.id,
                                                              ) ? (
                                                                <div>
                                                                  <CaretUp
                                                                    size={17}
                                                                    weight="bold"
                                                                  />
                                                                </div>
                                                              ) : (
                                                                <div>
                                                                  <CaretDown
                                                                    size={17}
                                                                    weight="bold"
                                                                  />
                                                                </div>
                                                              )}
                                                            </div>
                                                          </button>
                                                        </div>
                                                        {isExpandedActivity.includes(
                                                          item.id,
                                                        ) && (
                                                          <div
                                                            className="mt-6"
                                                            style={{
                                                              border:
                                                                '1px solid #00000020',
                                                              borderRadius:
                                                                '10px',
                                                              padding: 10,
                                                              paddingInline: 15,
                                                            }}
                                                          >
                                                            <div
                                                              className="mt-4"
                                                              style={{
                                                                fontWeight:
                                                                  '500',
                                                                fontSize: 12,
                                                                color:
                                                                  '#00000070',
                                                              }}
                                                            >
                                                              Transcript
                                                            </div>
                                                            <div className="flex flex-row items-center justify-between mt-4">
                                                              <div
                                                                style={{
                                                                  fontWeight:
                                                                    '500',
                                                                  fontSize: 15,
                                                                }}
                                                              >
                                                                {moment(
                                                                  item?.duration *
                                                                    1000,
                                                                ).format(
                                                                  'mm:ss',
                                                                )}{' '}
                                                              </div>
                                                              <button
                                                                onClick={() => {
                                                                  if (
                                                                    item?.recordingUrl
                                                                  ) {
                                                                    setShowAudioPlay(
                                                                      item?.recordingUrl,
                                                                    )
                                                                  } else {
                                                                    setShowNoAudioPlay(
                                                                      true,
                                                                    )
                                                                  }
                                                                  // window.open(item.recordingUrl, "_blank")
                                                                }}
                                                              >
                                                                <Image
                                                                  src={
                                                                    '/assets/play.png'
                                                                  }
                                                                  height={35}
                                                                  width={35}
                                                                  alt="*"
                                                                />
                                                              </button>
                                                            </div>
                                                            {item.transcript ? (
                                                              <div className="w-full">
                                                                <div
                                                                  className="mt-4"
                                                                  style={{
                                                                    fontWeight:
                                                                      '600',
                                                                    fontSize: 15,
                                                                  }}
                                                                >
                                                                  {/* {item.transcript} */}
                                                                  {isExpanded.includes(
                                                                    item.id,
                                                                  )
                                                                    ? `${item.transcript}`
                                                                    : `${initialText}...`}
                                                                </div>
                                                                <button
                                                                  style={{
                                                                    fontWeight:
                                                                      '600',
                                                                    fontSize: 15,
                                                                  }}
                                                                  onClick={() => {
                                                                    handleReadMoreToggle(
                                                                      item,
                                                                    )
                                                                  }}
                                                                  className="mt-2 text-black underline"
                                                                >
                                                                  {isExpanded.includes(
                                                                    item.id,
                                                                  )
                                                                    ? 'Read Less'
                                                                    : 'Read more'}
                                                                </button>
                                                              </div>
                                                            ) : (
                                                              <div
                                                                style={{
                                                                  fontWeight:
                                                                    '600',
                                                                  fontSize: 15,
                                                                }}
                                                              >
                                                                No transcript
                                                              </div>
                                                            )}
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              )
                                            },
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* )} */}

                                {/* Modal for audio play */}
                                <Modal
                                  open={showAudioPlay}
                                  onClose={() => setShowAudioPlay(null)}
                                  closeAfterTransition
                                  BackdropProps={{
                                    sx: {
                                      backgroundColor: '#00000020',
                                      // //backdropFilter: "blur(5px)",
                                    },
                                  }}
                                >
                                  <Box
                                    className="lg:w-3/12 sm:w-5/12 w-8/12"
                                    sx={styles.modalsStyle}
                                  >
                                    <div className="flex flex-row justify-center w-full">
                                      <div
                                        className="w-full flex flex-col items-center"
                                        style={{
                                          backgroundColor: '#ffffff',
                                          padding: 20,
                                          borderRadius: '13px',
                                        }}
                                      >
                                        <audio controls>
                                          <source
                                            src={showAudioPlay}
                                            type="audio/mpeg"
                                          />
                                          Your browser does not support the
                                          audio element.
                                        </audio>
                                        <button
                                          className="text-white w-full h-[50px] rounded-lg bg-purple mt-4"
                                          onClick={() => {
                                            setShowAudioPlay(null)
                                          }}
                                          style={{
                                            fontWeight: '600',
                                            fontSize: 15,
                                          }}
                                        >
                                          Close
                                        </button>

                                        {/* Can be use full to add shadow
                                                                                <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                                      </div>
                                    </div>
                                  </Box>
                                </Modal>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          fontsize: 24,
                          fontWeight: '600',
                          textAlign: 'center',
                          marginTop: 20,
                        }}
                      >
                        No Data Found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

export default CallWorthyReviewsPopup

const styles = {
  modalsStyle: {
    height: 'auto',
    bgcolor: 'transparent',
    p: 2,
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-50%)',
    borderRadius: 2,
    border: 'none',
    outline: 'none',
  },
  subHeading: {
    fontsize: 12,
    fontWeight: '500',
    color: '#151515',
  },
}
