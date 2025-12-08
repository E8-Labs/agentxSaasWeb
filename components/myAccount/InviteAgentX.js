import { Alert, CircularProgress, Fade, Snackbar } from '@mui/material'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import { formatDecimalValue } from '../agency/agencyServices/CheckAgencyData'
import { AuthToken } from '../agency/plan/AuthDetails'
import Apis from '../apis/Apis'
import getProfileDetails from '../apis/GetProfile'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../dashboard/leads/AgentSelectSnackMessage'
import { getUserPlans } from '../userPlans/UserPlanServices'
import { isSubaccountTeamMember } from '@/constants/teamTypes/TeamTypes'
import { getUserLocalData } from '../constants/constants'

function InviteAgentX({ isSubAccount }) {
  const [userDetails, setUserDetails] = useState(null)
  const [togglePlan, setTogglePlan] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [subscribePlanLoader, setSubscribePlanLoader] = useState(false)

  //snack bars
  const [successSnack, setSuccessSnack] = useState(null)
  const [errorSnack, setErrorSnack] = useState(null)

  //user plans list
  const [plans, setPlans] = useState([])
  const [initialLoader, setInitialLoader] = useState(true)

  useEffect(() => {
    loadPlans()

    const localData = localStorage.getItem('User')

    if (localData) {
      const Data = JSON.parse(localData)

      // //console.log;
      setUserDetails(Data.user)
    }
  }, [])

  // Function to load plans from API (same as NewBilling.js)
  const loadPlans = async () => {
    try {
      setInitialLoader(true)
      let plansList = await getUserPlans()
      console.log('plansList are', plansList)
      let userData = getUserLocalData()

      console.log('isSubaccountTeamMember', isSubaccountTeamMember(userData))
      let filteredPlans = []
      
      // Handle case where getUserPlans returns monthlyPlans array directly (for subAccount)
      // or an object with monthlyPlans property (for regular users)
      let plansArray = Array.isArray(plansList) 
        ? plansList 
        : plansList?.monthlyPlans || []

      if (plansArray && plansArray.length > 0) {
        // Filter features in each plan to only show features where thumb = true
        if (!isSubaccountTeamMember(userData)) {
          filteredPlans = plansArray?.map((plan) => ({
            ...plan,
            features:
              plan.features && Array.isArray(plan.features)
                ? plan.features.filter((feature) => feature.thumb === true)
                : [],
          }))
        } else {
          // filter the plans and show only first 6 features of each plan
          filteredPlans = plansArray?.map((plan) => ({
            ...plan,
            features: plan.features ? plan.features.slice(0, 6) : [],
          }))
        }

        console.log('filteredPlans after filtering', filteredPlans)

        // Ensure we only show monthly plans
        const monthlyPlans = filteredPlans.filter(
          (plan) => plan.billingCycle === 'monthly' || !plan.billingCycle, // Include plans without billingCycle for backward compatibility
        )

        setPlans(monthlyPlans)
        setInitialLoader(false)
      } else {
        setPlans([])
        setInitialLoader(false)
      }
    } catch (error) {
      console.error('Error loading InviteAgentX plans:', error)
      setPlans([])
      setInitialLoader(false)
    }
  }

  // Plans will be loaded dynamically

  //select the plan
  const handleTogglePlanClick = (item) => {
    if (togglePlan === item.id) {
      // If clicking the same plan, deselect it
      setTogglePlan(null)
      setSelectedPlan(null)
    } else {
      // Select the new plan
      setTogglePlan(item.id)
      setSelectedPlan(item)
    }
  }

  //function to subscribe plan
  const handleSubScribePlan = async () => {
    try {
      if (!selectedPlan) {
        setErrorSnack('Please select a plan')
        return
      }

      let planType = selectedPlan.planType

      setSubscribePlanLoader(true)
      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const LocalDetails = JSON.parse(localData)
        AuthToken = LocalDetails.token
      }

      let ApiData = {
        plan: planType,
        payNow: true,
      }

      const formData = new FormData()

      let ApiPath = Apis.subscribePlan
      if (isSubAccount) {
        formData.append('planId', selectedPlan.id)
        ApiPath = Apis.subAgencyAndSubAccountPlans
        ApiData = formData
      }

      if (isSubAccount) {
        for (let [key, value] of formData.entries()) {
          console.log(`${key} = ${value}`)
        }
      }

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        if (response.data.status === true) {
          setSuccessSnack(response?.data?.message)
          let response2 = await getProfileDetails()
          setUserDetails(response2)
        } else if (response.data.status === false) {
          setErrorSnack(response?.data?.message)
        }
      }
    } catch (error) {
      console.error('Error occurred in subscribe plan api:', error)
      setErrorSnack('An error occurred while subscribing to the plan')
    } finally {
      setSubscribePlanLoader(false)
    }
  }


  const styles = {
    headingStyle: {
      fontSize: 16,
      fontWeight: '700',
    },
    giftTextStyle: {
      fontSize: 14,
      fontWeight: '500',
    },
    cardStyles: {
      fontSize: '14',
      fontWeight: '500',
      border: '1px solid #00000020',
    },
    pricingBox: {
      position: 'relative',
      // padding: '10px',
      borderRadius: '10px',
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
      color: '#7902DF65',
      fontSize: 18,
      fontWeight: '600',
    },
    discountedPrice: {
      color: '#000000',
      fontWeight: 'bold',
      fontSize: 18,
      marginLeft: '10px',
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
  }

  return (
    <div
      className="w-full flex flex-col items-start px-8 py-2"
      style={{
        paddingBottom: '50px',
        height: '100%',
        overflow: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      <AgentSelectSnackMessage
        isVisible={
          successSnack === null || successSnack === false ? false : true
        }
        hide={() => setSuccessSnack(false)}
        message={successSnack}
        type={SnackbarTypes.Success}
      />
      <AgentSelectSnackMessage
        isVisible={errorSnack === null || errorSnack === false ? false : true}
        hide={() => setErrorSnack(false)}
        message={errorSnack}
        type={SnackbarTypes.Error}
      />
      <div style={{ fontSize: 22, fontWeight: '700', color: '#000' }}>
        Invite Agent
      </div>

      <div style={{ fontSize: 12, fontWeight: '500', color: '#00000090' }}>
        {'Account > Invite Agent'}
      </div>

      <div
        className="w-10/12 p-6 rounded-lg flex flex-row items-center"
        style={{
          backgroundImage: 'url(/svgIcons/cardBg.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: '#fff',
          alignSelf: 'center',
          marginTop: '7vh',
          // boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="flex flex-col pt-5">
          <div
            style={{ fontSize: '2vh', fontWeight: '700', marginBottom: '10px' }}
          >
            Get 60 credits when you invite an agent
          </div>
          <p
            style={{
              fontSize: '15px',
              fontWeight: '400',
              lineHeight: '1.5',
              width: '90%',
            }}
          >
            You and the agent you invite both get 30 AI credits. The more agents
            you invite, the more you get. Everybody wins. The agents can use
            this code at checkout.
          </p>
        </div>
      </div>

      {userDetails && userDetails?.plan && userDetails?.isTrial === true ? (
        // {true ? (
        <div className="w-full flex flex-col items-center">
          <div className="w-full flex flex-row justify-center mt-4">
            <div
              className="w-10/12 flex flex-row items-start gap-2"
              style={{
                border: '2px solid #FF4E4E',
                backgroundColor: '#FF4E4E10',
                padding: 10,
                borderRadius: '10px',
              }}
            >
              <div className="mt-2">
                <Image
                  src={'/svgIcons/warning.svg'}
                  height={28}
                  width={26}
                  alt="*"
                />
              </div>
              <div>
                <div
                  className="text-red"
                  style={{
                    fontWeight: '600',
                    fontSize: 16.8,
                    marginTop: 5,
                  }}
                >
                  Info
                </div>
                <div
                  style={{
                    fontWeight: '500',
                    fontSize: 15,
                    marginTop: 5,
                  }}
                >
                  {`You currently don't have an active AssignX plan, to take advantage of this discount you will need an active plan.`}
                </div>
              </div>
            </div>
          </div>
          {initialLoader ? (
            <div className="w-full flex flex-row items-center justify-center mt-4">
              <CircularProgress size={30} />
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              {plans.map((item, index) => (
                <button
                  key={item.id}
                  className="w-10/12 mt-4"
                  onClick={(e) => handleTogglePlanClick(item)}
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
                    className="px-4 py-1 pb-4"
                    style={{
                      ...styles.pricingBox,
                      border:
                        item.id === togglePlan
                          ? '2px solid #7902DF'
                          : '1px solid #15151520',
                      backgroundColor:
                        item.id === togglePlan ? '#402FFF05' : '',
                      borderTopLeftRadius: item.hasTrial == true ? '' : '10px',
                      borderTopRightRadius: item.hasTrial == true ? '' : '10px',
                      borderBottomLeftRadius: '10px',
                      borderBottomRightRadius: '10px',
                    }}
                  >
                    {item.percentageDiscount && (
                      <>
                        <div
                          style={{
                            ...styles.triangleLabel,
                            borderTopRightRadius:
                              item.hasTrial == true ? '' : '7px',
                          }}
                        ></div>
                        <span style={styles.labelText}>
                          {formatDecimalValue(item.percentageDiscount)}%
                        </span>
                      </>
                    )}
                    <div
                      className="flex flex-row items-start gap-3"
                      style={styles.content}
                    >
                      <div className="mt-1">
                        <div>
                          {item.id === togglePlan ? (
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
                        {item.status && (
                          <div
                            className="-mt-[27px] sm:hidden px-2 py-1 bg-purple rounded-full text-white"
                            style={{
                              fontSize: 11.6,
                              fontWeight: '500',
                              width: 'fit-content',
                            }}
                          >
                            {item.status}
                          </div>
                        )}
                        <div
                          style={{
                            color: '#151515',
                            fontSize: 20,
                            fontWeight: '600',
                          }}
                          className="flex flex-row items-center gap-1"
                        >
                          {item.name || item.title} | {item.mints || item.minutes}{' '}
                          AI credits
                          {item.tag && (
                            <span
                              className="px-2 py-1 bg-purple ms-2 rounded-full text-white"
                              style={{ fontSize: '14px', fontWeight: '500' }}
                            >
                              {item.tag}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-row items-center justify-between">
                          <div
                            className="mt-2"
                            style={{
                              color: '#15151590',
                              fontSize: 12,
                              width: '80%',
                              fontWeight: '600',
                            }}
                          >
                            {item.planDescription || item.details || ''}
                          </div>
                          <div className="flex flex-row items-center">
                            {item.originalPrice && (
                              <div style={styles.originalPrice}>
                                ${formatDecimalValue(item.originalPrice)}
                              </div>
                            )}
                            <div className="flex flex-row justify-start items-start">
                              <div style={styles.discountedPrice}>
                                $
                                {item.discountPrice || item.discountedPrice
                                  ? formatDecimalValue(
                                      item.discountPrice || item.discountedPrice,
                                    )
                                  : 0}
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
          )}

          {subscribePlanLoader ? (
            <div className="flex flex-row items-center justify-center h-[50px]">
              <CircularProgress size={30} />
            </div>
          ) : (
            <div className="w-full flex flex-row items-center justify-center mt-4">
              <button
                disabled={!togglePlan}
                className="w-10/12 h-[50px] rounded-lg"
                style={{
                  fontWeight: '600',
                  fontSize: 16.8,
                  color: togglePlan ? 'white' : 'black',
                  backgroundColor: togglePlan ? '#7902DF' : '#00000020',
                }}
                onClick={handleSubScribePlan}
              >
                Continue to payment
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{ alignSelf: 'center' }}
          className="w-10/12 flex flex-col justify-center items-center"
        >
          <Image
            src={'/svgIcons/balloons.svg'}
            width={600}
            height={428}
            alt="image"
            style={{}}
          />

          <div className="w-8/12 flex flex-col items-start rounded-lg p-2 bg-purple -mt-20 ">
            <div
              className="flex flex-row items-center gap-2"
              style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}
            >
              <img
                src="/otherAssets/tagIcon.png"
                alt="Tag Icon"
                style={{ height: '16px', width: '16px' }}
              />
              Code
            </div>
            <div
              style={{
                fontSize: '5svw',
                color: '#fff',
                fontWeight: '700',
                alignSelf: 'center',
                background: 'linear-gradient(to top, #ffffff40, #ffffff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}
            >
              {userDetails?.plan && userDetails?.isTrial === false
                ? userDetails?.myInviteCode
                  ? userDetails?.myInviteCode
                  : 'N/A'
                : 'N/A'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InviteAgentX
