// import { CardPostalCodeElement } from '@stripe/react-stripe-js';
import {
  Alert,
  Button,
  CircularProgress,
  Fade,
  Slide,
  Snackbar,
} from '@mui/material'
// import stripe
import {
  CardCvcElement,
  CardElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import { getPolicyUrls } from '@/utils/getPolicyUrls'
import { checkReferralCode } from '@/components/userPlans/UserPlanServices'

// import Apis from '../Apis/Apis';

const AddCardDetails = ({
  subscribePlan,
  subscribeLoader,
  fromMYPlansScreen,
  closeAddCardPopup,
  handleClose,
  togglePlan,
  setAddPaymentSuccessPopUp,
  textBelowContinue = '',
  selectedUser,
  fromAdmin = false,
}) => {
  const stripeReact = useStripe()
  const elements = useElements()
  ////console.log
  ////console.log

  const [inviteCode, setInviteCode] = useState('')
  const typingTimeout = useRef(null)

  const [addCardLoader, setAddCardLoader] = useState(false)
  const [credentialsErr, setCredentialsErr] = useState(false)
  const [addCardSuccess, setAddCardSuccess] = useState(false)
  const [addCardFailure, setAddCardFailure] = useState(false)
  const [addCardDetails, setAddCardDetails] = useState(null)
  const [addCardErrtxt, setAddCardErrtxt] = useState(null)
  const [isWideScreen, setIsWideScreen] = useState(false)
  const cardNumberRef = useRef(null)
  const cardExpiryRef = useRef(null)
  const cardCvcRef = useRef(null)

  //check for button
  const [CardAdded, setCardAdded] = useState(false)
  const [CardExpiry, setCardExpiry] = useState(false)
  const [CVC, setCVC] = useState(false)

  //agree terms
  const [agreeTerms, setAgreeTerms] = useState(true)

  //disable continue btn after the card added
  const [disableContinue, setDisableContinue] = useState(false)

  //invite code loader
  const [inviteCodeLoader, setInviteCodeLoader] = useState(false)
  const [isValidCode, setIsValidCode] = useState('')

  // Autofocus the first field when the component mounts
  useEffect(() => {
    // //console.log;
    if (cardNumberRef.current) {
      // //console.log;
      cardNumberRef.current.focus()
    }
  }, [])

  //handle agree terms toggle btn
  const handleToggleTermsClick = () => {
    setAgreeTerms(!agreeTerms)
  }

  // Handle field change to focus on the next input
  const handleFieldChange = (event, ref) => {
    if (event.complete && ref.current) {
      ref.current.focus()
    }
  }
  // const [selectedUserPlan, setSelectedUserPlan] = useState(null);

  if (!stripeReact || !elements) {
    ////console.log;
    ////console.log
    ////console.log
    return <div>Loading stripe</div>
  } else {
    ////console.log;
  }
  const handleBackClick = (e) => {
    e.preventDefault()
    handleBack()
  }

  // //code for wide screen
  // useEffect(() => {
  //     const handleResize = () => {
  //         // Check if width is greater than or equal to 1024px
  //         setIsWideScreen(window.innerWidth >= 500);

  //         // setIsWideScreen2(window.innerWidth >= 500);
  //         // Check if height is greater than or equal to 1024px
  //         // setIsHighScreen(window.innerHeight >= 640);

  //         // Log the updated state values for debugging (Optional)
  //        // //console.log;
  //     };

  //     handleResize(); // Set initial state
  //     window.addEventListener("resize", handleResize);

  //     return () => {
  //         window.removeEventListener("resize", handleResize);
  //     };
  // }, []);

  const elementOptions = {
    style: {
      base: {
        backgroundColor: 'transparent',
        color: '#000000',
        fontSize: '18px',
        lineHeight: '40px',
        borderRadius: 10,
        padding: 10,
        '::placeholder': {
          color: '#00000050',
        },
      },
      invalid: {
        color: 'red',
      },
    },
  }

  //code for adding card api

  // useEffect(()=>{
  //    // //console.log
  // }, [selectedPlan])

  // useEffect(() => {})
  ////console.log
  // let selPlan = null;

  //function to add card
  const handleAddCard = async (e) => {
    setAddCardLoader(true)
    setDisableContinue(true)
    if (stop) {
      stop(false)
      setDisableContinue(false)
    }
    if (e && e.preventDefault) {
      e.preventDefault()
    }

    const LocalData = localStorage.getItem('User')
    const D = JSON.parse(LocalData)
    // //console.log;
    const AuthToken = D.token
    if (!stripeReact || !elements) {
      setDisableContinue(false)
      return
    } else {
      ////console.log;
    }

    // Include userId in query string if selectedUser is provided
    let setupIntentUrl = Apis.createSetupIntent
    if (selectedUser) {
      setupIntentUrl = `${Apis.createSetupIntent}?userId=${selectedUser.id}`
    }

    const res = await fetch(setupIntentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AuthToken}`,
      },
      body: JSON.stringify({ id: 123 }),
    })

    const data = await res.json()

    const result = await stripeReact.confirmCardSetup(data.data, {
      payment_method: {
        card: elements.getElement(CardNumberElement),
        billing_details: {
          name: D.user.name,
        },
      },
    })

    if (result.error) {
      setAddCardLoader(false)
      setAddCardFailure(true)
      setAddCardErrtxt(
        result.error.message || 'Error confirming payment method',
      )
      setDisableContinue(false)
      // setStatus(`Error: ${result.error.message}`);
    } else {
      // console.log("Result", JSON.stringify(result.setupIntent));
      let id = result.setupIntent.payment_method
      // setStatus("Success! Card is ready for auto-payment.");
      // console.log("Payment method ID:", id);

      // Save paymentMethod ID to your server (for later cron charging)
      // Step 3: Send payment method ID to backend to attach to customer

      let requestBody = null
      // Include userId if selectedUser is provided (preferred approach)
      // fromAdmin flag is kept for backward compatibility but selectedUser is required for it to work
      if (selectedUser) {
        requestBody = {
          source: id,
          inviteCode: inviteCode,
          userId: selectedUser.id,
        }
      } else {
        requestBody = {
          source: id,
          inviteCode: inviteCode,
        }
      }
      const addCardRes = await fetch(Apis.addCard, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AuthToken}`,
        },
        body: JSON.stringify(requestBody),
      })

      const result2 = await addCardRes.json()
      setAddCardLoader(false)
      if (result2.status === true) {
        setAddCardSuccess(true)
        // console.log("This is check 1 test")
        if (!togglePlan) handleClose(result)
        if (togglePlan) handleSubscribePlan()
      } else {
        setAddCardFailure(true)
        setAddCardErrtxt(result2.message)
        setDisableContinue(false)
      }
    }
  }

  //function to subscribe plan
  const handleSubscribePlan = async () => {
    try {
      let planType = null

      //// //console.log;

      if (togglePlan === 1) {
        planType = 'Plan30'
      } else if (togglePlan === 2) {
        planType = 'Plan120'
      } else if (togglePlan === 3) {
        planType = 'Plan360'
      } else if (togglePlan === 4) {
        planType = 'Plan720'
      }

      // //console.log;

      setAddCardLoader(true)
      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const LocalDetails = JSON.parse(localData)
        AuthToken = LocalDetails.token
      }

      // //console.log;

      const ApiData = {
        plan: planType,
      }

      // //console.log;

      const ApiPath = Apis.subscribePlan
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        if (response.data.status === true) {
          handleClose(response.data)
          if (setAddPaymentSuccessPopUp) setAddPaymentSuccessPopUp(true)
        }
      }
    } catch (error) {
      // console.error("Error occured in api is:", error);
    } finally {
      setAddCardLoader(false)
    }
  }

  const PayAsYouGoPlanTypes = {
    Plan30Min: 'Plan30',
    Plan120Min: 'Plan120',
    Plan360Min: 'Plan360',
    Plan720Min: 'Plan720',
  }

  //invite code input field handle change
  const handleChange = (e) => {
    const value = e.target.value
    setInviteCode(value)

    // Clear any previous timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current)
    }

    // Set a new timeout to run after 500ms of no typing
    if (value.trim().length > 0) {
      typingTimeout.current = setTimeout(() => {
        isValidReferralCode(value)
      }, 500)
    } else {
      setIsValidCode('')
    }
  }

  //referal code chek
  const isValidReferralCode = async (value) => {
    setInviteCodeLoader(true)
    const response = await checkReferralCode(value.trim())
    if (response) {
      if (response.status === true) {
        setIsValidCode('Valid')
      } else {
        setIsValidCode('Invalid')
      }
    }
    setInviteCodeLoader(false)
  }

  return (
    <div style={{ width: '100%' }}>
      <AgentSelectSnackMessage
        isVisible={credentialsErr}
        hide={() => setCredentialsErr(false)}
        message={addCardErrtxt}
      />
      <AgentSelectSnackMessage
        isVisible={addCardFailure}
        hide={() => setAddCardFailure(false)}
        message={addCardErrtxt}
      />
      <AgentSelectSnackMessage
        isVisible={addCardSuccess}
        hide={() => setAddCardSuccess(false)}
        type={SnackbarTypes.Success}
        message={'Card added successfully'}
      />

      <div className="mt-8">
        <div
          style={{
            fontWeight: '400',

            fontSize: 14,
            color: '#4F5B76',
          }}
        >
          Card Number
        </div>
        <div
          className="mt-2 px-3 py-1 border"
          style={{ backgroundColor: '#ffffff', borderRadius: '8px' }}
        >
          <CardNumberElement
            options={elementOptions}
            autoFocus={true}
            onChange={(event) => {
              handleFieldChange(event, cardExpiryRef)
              if (event.complete) {
                // //console.log;
                setCardAdded(true)
              } else {
                setCardAdded(false)
              }
            }}
            ref={cardNumberRef}
            onReady={(element) => {
              cardNumberRef.current = element
              cardNumberRef.current.focus()
            }}
          />
        </div>
      </div>
      <div className="flex flex-row gap-2 w-full mt-8">
        <div className="w-6/12">
          <div
            style={{
              fontWeight: '400',

              fontSize: 14,
              color: '#4F5B76',
            }}
          >
            Exp Date
          </div>
          <div
            className="mt-2 px-3 py-1 border"
            style={{ backgroundColor: '#ffffff', borderRadius: '8px' }}
          >
            <CardExpiryElement
              options={elementOptions}
              style={{
                width: '100%',
                padding: '8px',
                color: 'white',
                fontSize: '22px',
                border: '1px solid blue',
                borderRadius: '4px',
              }}
              onChange={(event) => {
                handleFieldChange(event, cardCvcRef)
                if (event.complete) {
                  // //console.log;
                  setCardExpiry(true)
                } else {
                  setCardExpiry(false)
                }
              }}
              ref={cardExpiryRef}
              onReady={(element) => {
                cardExpiryRef.current = element
              }}
            />
          </div>
        </div>
        <div className="w-6/12">
          <div
            style={{
              fontWeight: '400',

              fontSize: 14,
              color: '#4F5B76',
            }}
          >
            CVV
          </div>
          <div
            className="mt-2 px-3 py-1 border"
            style={{ backgroundColor: '#ffffff', borderRadius: '8px' }}
          >
            <CardCvcElement
              // options={elementOptions}
              options={{
                ...elementOptions,
                placeholder: 'CVV', // 👈 add this
              }}
              style={{
                width: '100%',
                padding: '8px',
                color: 'white',
                fontSize: '22px',
                border: '1px solid blue',
                borderRadius: '4px',
              }}
              ref={cardCvcRef}
              onReady={(element) => {
                cardCvcRef.current = element
              }}
              onChange={(event) => {
                // handleFieldChange(event, cardCvcRef);
                if (event.complete) {
                  // //console.log;
                  setCVC(true)
                } else {
                  setCVC(false)
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Optional input field for agent x invite code */}

      <div className="w-full flex flex-row items-center justify-between mt-8">
        <div
          // className="mt-8"
          style={{
            fontWeight: '400',

            fontSize: 14,
            color: '#4F5B76',
          }}
        >
          {`Referral Code (optional)`}
        </div>
        {inviteCodeLoader ? (
          <span className="text-sm">Checking...</span>
        ) : (
          <span
            className={`text-sm ${isValidCode === 'Valid' ? 'text-green' : 'text-red'}`}
          >
            {isValidCode}
          </span>
        )}
      </div>

      <div className="mt-4">
        <input
          value={inviteCode}
          onChange={handleChange}
          disabled={inviteCodeLoader}
          className="outline-none focus:ring-0 w-full h-[50px]"
          style={{
            color: '#000000',
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #00000020',
            fontSize: 15,
            fontWeight: '500',
          }}
          placeholder="Enter Referral code"
        />
        <style jsx>{`
          input::placeholder {
            color: #00000050; /* Set placeholder text color to red */
          }
        `}</style>
      </div>

      {/* <CardPostalCodeElement id="postal-code" options={elementOptions} /> */}

      <div className="mt-4 w-full flex flex-row items-center gap-4">
        <button
          className="outline-none border-none"
          onClick={() => {
            handleToggleTermsClick()
          }}
        >
          {agreeTerms ? (
            <div
              className="bg-brand-primary flex flex-row items-center justify-center rounded"
              style={{ height: '24px', width: '24px' }}
            >
              <Image
                src={'/assets/whiteTick.png'}
                height={8}
                width={10}
                alt="*"
              />
            </div>
          ) : (
            <div
              className="bg-none border-2 flex flex-row items-center justify-center rounded"
              style={{ height: '24px', width: '24px' }}
            ></div>
          )}
        </button>
        <div
          className="flex flex-row items-center gap-1"
          style={{
            fontWeight: '500',
            fontSize: 15,
          }}
        >
          <div>I agree to</div>
          <a
            href="#"
            onClick={async (e) => {
              e.preventDefault()
              const { termsUrl } = await getPolicyUrls(selectedUser)
              window.open(termsUrl, '_blank')
            }}
            style={{ textDecoration: 'underline', color: 'black', cursor: 'pointer' }} // Underline and color styling
            rel="noopener noreferrer" // Security for external links
          >
            Terms & Conditions
          </a>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 w-full mt-6 flex justify-center">
        {addCardLoader ? (
          <div className="flex flex-row justify-center items-center mt-8 w-full">
            <CircularProgress size={30} />
          </div>
        ) : (
          <div
            className="flex flex-row justify-end items-center mt-8 w-full"
            //  && isValidCode === "Valid" && !inviteCodeLoader
          >
            {CardAdded &&
            CardExpiry &&
            CVC &&
            agreeTerms &&
            (!inviteCode || (isValidCode === 'Valid' && !inviteCodeLoader)) ? (
              <button
                onClick={handleAddCard}
                disabled={disableContinue}
                className={`${disableContinue ? 'bg-[#00000020] text-black' : 'bg-brand-primary text-white'} w-full h-[50px] rounded-xl px-8 py-3`}
                style={{ fontWeight: '600', fontSize: 17 }}
              >
                Continue
              </button>
            ) : (
              <button
                disabled={true}
                className="bg-[#00000020] w-full h-[50px] rounded-xl px-8 text-[#000000] py-3"
                style={{ fontWeight: '600', fontSize: 17 }}
              >
                Continue
              </button>
            )}
          </div>
        )}
        <p className="text-[#15151580]">{textBelowContinue}</p>
      </div>
    </div>
  )
}

export default AddCardDetails
