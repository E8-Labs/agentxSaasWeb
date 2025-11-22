import { Box, CircularProgress, Modal } from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import CloseBtn from '@/components/globalExtras/CloseBtn'

import { formatDecimalValue } from '../agencyServices/CheckAgencyData'
import { AuthToken } from '../plan/AuthDetails'
import { getXBarOptions } from './GetPlansList'

const ViewSubAccountXBar = ({ showXBar, hideXBar, selectedUser }) => {
  console.log('selected user passed is', selectedUser)

  const [initialLoader, setInitialLoader] = useState(false)
  const [agencyXBarPlans, setAgencyXBarPlans] = useState([])
  const [subAccountXBarPlans, setSubAccountXBarPlans] = useState([])
  const [selectedXBarPlans, setSelectedXBarPlans] = useState([])
  //update agency xbar plans loader
  const [updateXBarLoader, setUpdateXBarLoader] = useState(false)
  //snack bar msg
  const [snackMsg, setSnackMsg] = useState(null)
  const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Error)

  useEffect(() => {
    if (subAccountXBarPlans?.length > 0) {
      setSelectedXBarPlans(subAccountXBarPlans.map((plan) => plan.id))
    }
  }, [subAccountXBarPlans])

  useEffect(() => {
    console.log('Current selected XBar plans is', selectedXBarPlans)
  }, [selectedXBarPlans])

  useEffect(() => {
    getXBarPlans()
    getAgencyXBarPlans()
  }, [])

  //const get Agency XBar plans
  const getAgencyXBarPlans = async () => {
    try {
      setInitialLoader(true)
      const Token = AuthToken()
      const response = await getXBarOptions(selectedUser?.agencyId)
      if (response) {
        console.log('Response of get agency XBar plans api is', response)
        setAgencyXBarPlans(response)
      }
    } catch (error) {
      console.log('Error occured in getAgencyXBarPlans is', error)
    }
  }

  //get XBar plans from user id api
  const getXBarPlans = async () => {
    try {
      setInitialLoader(true)
      const Token = AuthToken()
      console.log('user id is', selectedUser?.id)
      let ApiPath = null
      if (selectedUser) {
        ApiPath = `${Apis.getSubAccountPlans}?userId=${selectedUser?.id}`
      } else {
        ApiPath = Apis.getSubAccountPlans
      }
      console.log('Api path of get XBar plans is', ApiPath)
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + Token,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        console.log('Response of get XBar plans api is', response.data.data)
        setSubAccountXBarPlans(response.data.data.xbarPlans || [])
        setInitialLoader(false)
      }
    } catch (error) {
      setInitialLoader(false)
      console.error('Error occured in getting subaccount XBar plans', error)
    }
  }

  //toggle XBar plans click
  const handleToggleXBarClick = (planId) => {
    setSelectedXBarPlans(
      (prev) =>
        prev.includes(planId)
          ? prev.filter((id) => id !== planId) // remove if already selected
          : [...prev, planId], // add if not selected
    )
  }

  //handle Update agency XBar plans
  const handleUpdateAgencyXBarPlans = async () => {
    try {
      setUpdateXBarLoader(true)
      const Token = AuthToken()
      // Using the same API as monthly plans since there's no specific XBar update API
      const ApiPath = Apis.updateSubAccountPlansFromAgency
      console.log('Selected user is', selectedUser)
      const apiData = {
        subaccountUserId: selectedUser.id,
        xbarPlans: selectedXBarPlans,
      }
      const response = await axios.post(ApiPath, apiData, {
        headers: {
          Authorization: 'Bearer ' + Token,
          'Content-Type': 'application/json',
        },
      })
      if (response) {
        console.log(
          'Response of update agency subaccount XBar plans api is',
          response.data,
        )
        if (response.data.status === true) {
          setSnackMsg('XBar Plans Updated.')
          setSnackMsgType(SnackbarTypes.Success)
          setUpdateXBarLoader(false)
          hideXBar(response?.data)
        } else {
          setSnackMsg(response.data.message)
          setSnackMsgType(SnackbarTypes.Error)
          setUpdateXBarLoader(false)
        }
      }
    } catch (error) {
      setUpdateXBarLoader(false)
      console.log('Error occured in update agency XBar plans api is', error)
    }
  }

  //check if the selected XBar plans equal to agency XBar plans
  // utility function to compare two arrays of IDs
  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false
    const sortedA = [...a].sort()
    const sortedB = [...b].sort()
    return sortedA.every((val, index) => val === sortedB[index])
  }

  return (
    <Modal
      open={showXBar}
      onClose={() => {
        hideXBar()
      }}
      closeAfterTransition
      BackdropProps={{
        timeout: 500,
        sx: {
          backgroundColor: '#00000030',
          // backdropFilter: "blur(20px)",
        },
      }}
    >
      <Box
        className="w-6/12 bg-white p-6 h-[70vh]"
        sx={subaccountstyles.modalsStyle}
      >
        <AgentSelectSnackMessage
          isVisible={snackMsg !== null}
          message={snackMsg}
          hide={() => {
            setSnackMsg(null)
          }}
          type={snackMsgType}
        />
        <div className="w-full flex flex-row items-center justify-between mb-6">
          <div style={{ fontWeight: '600', fontSize: 18 }}>View XBar Plans</div>
          <CloseBtn
            onClick={() => {
              hideXBar()
            }}
          />
        </div>
        {initialLoader ? (
          <div className="w-full flex flex-row items-center justify-center">
            <CircularProgress size={25} />
          </div>
        ) : (
          <div className="w-full">
            <div className="h-[53vh] overflow-auto">
              {agencyXBarPlans.map((item, index) => (
                <button
                  key={index}
                  className="w-full mt-4 outline-none"
                  disabled={item.id === selectedUser?.xbarPlan?.id}
                  onClick={(e) => {
                    handleToggleXBarClick(item.id)
                  }}
                >
                  {item.hasTrial && (
                    <div className="w-full rounded-t-lg bg-gradient-to-r from-[#7902DF] to-[#C502DF] px-4 py-2">
                      <div className="flex flex-row items-center gap-2">
                        <Image
                          src={'/otherAssets/batchIcon.png'}
                          alt="*"
                          height={24}
                          width={24}
                        />
                        <div
                          style={{
                            fontWeight: '600',
                            fontSize: 18,
                            color: 'white',
                          }}
                        >
                          First{' '}
                          {item.hasTrial == true &&
                            `| ${item.trialValidForDays}`}{' '}
                          Days Free
                        </div>
                      </div>
                    </div>
                  )}
                  <div
                    className={`px-4 py-1 pb-4 ${item.hasTrial ? 'rounded-b-lg' : 'rounded-lg'}`}
                    style={{
                      ...styles.pricingBox,
                      border: selectedXBarPlans.includes(item.id)
                        ? '2px solid #7902DF'
                        : '1px solid #15151520',
                      backgroundColor:
                        item.id === selectedUser?.xbarPlan?.id
                          ? '#402FFF05'
                          : '',
                    }}
                  >
                    <div
                      style={{
                        ...styles.triangleLabel,
                        borderTopRightRadius: item.hasTrial ? '0px' : '7px',
                      }}
                    ></div>
                    <span style={styles.labelText}>
                      {formatDecimalValue(item.percentageDiscount)}%
                    </span>
                    <div
                      className="flex flex-row items-start gap-3"
                      style={styles.content}
                    >
                      <div className="mt-1">
                        <div>
                          {selectedXBarPlans.includes(item.id) ? (
                            <Image
                              src={'/svgIcons/checkMark.svg'}
                              height={24}
                              width={24}
                              alt="*"
                            />
                          ) : (
                            <Image
                              src={'/svgIcons/unCheck.svg'}
                              height={24}
                              width={24}
                              alt="*"
                            />
                          )}
                        </div>
                      </div>
                      <div className="w-full">
                        {item.id === selectedUser?.xbarPlan?.id && (
                          <div
                            className="-mt-[27px] flex px-2 py-1 bg-purple rounded-full text-white"
                            style={{
                              fontSize: 11.6,
                              fontWeight: '500',
                              width: 'fit-content',
                            }}
                          >
                            Current Plan
                          </div>
                        )}

                        <div className="flex flex-row items-center gap-3">
                          <div className="flex flex-row items-center gap-4">
                            <div
                              style={{
                                color: '#151515',
                                fontSize: 20,
                                fontWeight: '600',
                              }}
                            >
                              {item.title}
                            </div>
                            {item.tag && (
                              <div className="bg-purple text-white px-2 py-1 rounded-full">
                                {item.tag}
                              </div>
                            )}
                          </div>
                          {item.status && (
                            <div
                              className="flex px-2 py-1 bg-purple rounded-full text-white"
                              style={{ fontSize: 11.6, fontWeight: '500' }}
                            >
                              {item.status}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-row items-center justify-between">
                          <div
                            className="mt-2"
                            style={{
                              color: '#15151590',
                              fontSize: 12,
                              width: '60%',
                              fontWeight: '600',
                            }}
                          >
                            {item.planDescription}
                          </div>
                          <div className="flex flex-row items-center">
                            <div className="flex flex-row justify-start items-center">
                              {item.originalPrice && (
                                <div style={styles.originalPrice}>
                                  ${formatDecimalValue(item.originalPrice)}
                                </div>
                              )}
                              <div style={styles.discountedPrice}>
                                ${formatDecimalValue(item.discountedPrice)}
                              </div>
                              <p style={{ color: '#15151580' }}>/mo*</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 mt-2">
              {!arraysEqual(
                subAccountXBarPlans.map((plan) => plan.id),
                selectedXBarPlans,
              ) && (
                <button
                  className="w-full text-center rounded-lg text-white bg-purple h-[49px]"
                  onClick={handleUpdateAgencyXBarPlans}
                  disabled={updateXBarLoader}
                >
                  {updateXBarLoader ? (
                    <CircularProgress size={25} sx={{ color: 'white' }} />
                  ) : (
                    'Update'
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </Box>
    </Modal>
  )
}

export default ViewSubAccountXBar

const subaccountstyles = {
  modalsStyle: {
    height: 'auto',
    // bgcolor: "transparent",
    // p: 2,
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-55%)',
    borderRadius: 2,
    border: 'none',
    outline: 'none',
  },
  nrmlTxt: {
    fontWeight: '500',
    fontSize: 15,
  },
}

const styles = {
  text: {
    fontSize: 12,
    color: '#00000090',
  },
  text2: {
    textAlignLast: 'left',
    fontSize: 15,
    color: '#000000',
    fontWeight: 500,
    whiteSpace: 'nowrap', // Prevent text from wrapping
    overflow: 'hidden', // Hide overflow text
    textOverflow: 'ellipsis', // Add ellipsis for overflow text
  },
  paymentModal: {
    height: 'auto',
    bgcolor: 'transparent',
    // p: 2,
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-50%)',
    borderRadius: 2,
    border: 'none',
    outline: 'none',
  },
  headingStyle: {
    fontSize: 16,
    fontWeight: '700',
  },
  gitTextStyle: {
    fontSize: 15,
    fontWeight: '700',
  },

  //style for plans
  cardStyles: {
    fontSize: '14',
    fontWeight: '500',
    border: '1px solid #00000020',
  },
  pricingBox: {
    position: 'relative',
    // padding: '10px',
    // borderRadius: "10px",
    // backgroundColor: '#f9f9ff',
    display: 'inline-block',
    width: '100%',
  },
  triangleLabel: {
    position: 'absolute',
    top: '0',
    right: '0',
    width: '0',
    height: '0',
    borderTop: '50px solid #7902DF', // Increased height again for more padding
    borderLeft: '50px solid transparent',
  },
  labelText: {
    position: 'absolute',
    top: '10px', // Adjusted to keep the text centered within the larger triangle
    right: '5px',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    transform: 'rotate(45deg)',
  },
  content: {
    textAlign: 'left',
    paddingTop: '10px',
  },
  originalPrice: {
    textDecoration: 'line-through',
    color: 'black',
    fontSize: 15,
    fontWeight: '600',
  },
  discountedPrice: {
    color: '#7902DF65',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: '10px',
  },
}
