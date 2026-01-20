import {
  Box,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
} from '@mui/material'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import { jobPositionArray } from '../twilioExtras/TwilioHubConstants'

const ContactPoint = ({
  firstNameP,
  lastNameP,
  businessTitleP,
  jobPositionP,
  agreeTermsP,
  loaderP,
  handleBack,
  handleContinue,
}) => {
  const selectRef = useRef(null)

  const [openJobPositionDropwDown, setOpenJobPositionDropwDown] =
    useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [businessTitle, setBusinessTitle] = useState('')
  const [jobPosition, setJobPosition] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)

  const [canContinue, setCanContinue] = useState(false)

  useEffect(() => {
    setFirstName(firstNameP)
    setLastName(lastNameP)
    setBusinessTitle(businessTitleP)
    setJobPosition(jobPositionP)
    setAgreeTerms(agreeTermsP)
  }, [])

  useEffect(() => {
    if (!firstName) {
      setCanContinue(true)
    } else {
      setCanContinue(false)
    }
  }, [firstName])

  //toggle agree terms click
  const handleToggleTermsClick = () => {
    setAgreeTerms(!agreeTerms)
  }

  //go back
  const handleGoBack = () => {
    const pointContact = {
      firstName: firstName,
      lastName: lastName,
      businessTitle: businessTitle,
      jobPosition: jobPosition,
      agreeTerms: agreeTerms,
    }
    handleBack(pointContact)
  }

  //stylles
  const styles = {
    normalTxt: {
      fontWeight: '500',
      fontSize: 15,
    },
  }

  return (
    <div className="h-[100%] w-full flex flex-col items-center justify-between">
      <div className="w-8/12 h-[80%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple pb-2 px-2">
        <div style={{ fontWeight: '700', fontSize: 22 }}>Point of Contact</div>
        <div style={{ fontWeight: '700', fontSize: 17 }}>
          Authorised Representative
        </div>
        <div className="mt-6" style={styles.normalTxt}>
          First Name*
        </div>
        <div className="w-full mt-2">
          <input
            className="border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0"
            style={styles.normalTxt}
            placeholder="First Name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value)
            }}
          />
        </div>
        <div className="mt-4" style={styles.normalTxt}>
          Last Name
        </div>
        <div className="w-full mt-2">
          <input
            className="border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0"
            style={styles.normalTxt}
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value)
            }}
          />
        </div>
        {/* Add email input */}
        <div className="flex flex-row items-center gap-2 mt-2">
          <Image
            alt="*"
            src="/agencyIcons/infoIcon.jpg"
            height={14}
            width={14}
            style={{ opacity: 0.5 }} // adjust value between 0 and 1
          />
          <div
            className="text-grayclr75"
            style={{ fontWeight: '400', fontSize: 13 }}
          >
            Use email address associated with your website domain can help
            expedite your approval
          </div>
        </div>
        {/* Add phone number input */}
        <div className="mt-4" style={styles.normalTxt}>
          Business title
        </div>
        <div className="w-full mt-2">
          <input
            className="border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0"
            style={styles.normalTxt}
            placeholder="Business title"
            value={businessTitle}
            onChange={(e) => {
              setBusinessTitle(e.target.value)
            }}
          />
        </div>
        <div className="mt-4" style={styles.normalTxt}>
          Job position
        </div>
        <div className="border rounded-lg">
          <Box className="w-full">
            <FormControl className="w-full">
              <Select
                ref={selectRef}
                open={openJobPositionDropwDown}
                onClose={() => setOpenJobPositionDropwDown(false)}
                onOpen={() => setOpenJobPositionDropwDown(true)}
                className="border-none rounded-2xl outline-none"
                displayEmpty
                value={jobPosition}
                // onChange={handleselectBusinessType}
                onChange={(e) => {
                  let value = e.target.value
                  setJobPosition(value)
                  setOpenJobPositionDropwDown(false)
                }}
                renderValue={(selected) => {
                  if (selected === '') {
                    return <div>Job position</div>
                  }
                  return selected
                }}
                sx={{
                  ...styles.normalTxt,
                  backgroundColor: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: '30vh', // Limit dropdown height
                      overflow: 'auto', // Enable scrolling in dropdown
                      scrollbarWidth: 'none',
                    },
                  },
                }}
              >
                <MenuItem value="">None</MenuItem>
                {jobPositionArray.map((item) => {
                  return (
                    <MenuItem
                      key={item.id}
                      style={styles.normalTxt}
                      value={item.title}
                      className="w-full"
                    >
                      {item.title}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          </Box>
        </div>
        <div className="mt-4" style={styles.normalTxt}>
          Terms of service and privacy policy
        </div>
        <div className="flex flex-row items-start gap-2">
          <button onClick={handleToggleTermsClick}>
            {agreeTerms ? (
              <div
                className="bg-purple flex flex-row items-center justify-center rounded"
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
          <div style={styles.normalTxt}>
            {`I declare that the information provided is accurate. I acknowledge that Twilio will be processing the information the business profile information after account closure in the casr of a . traceback from a lregulatory aud Twilio will process your personal data according to the Twilio Privacy Statement`}
          </div>
        </div>
      </div>
      <div className="w-10/12 h-[20%] flex flex-row items-center justify-between">
        <button
          className="outline-none border-none text-purple"
          style={styles.normalTxt}
          onClick={() => {
            handleGoBack()
          }}
        >
          Back
        </button>
        {loaderP ? (
          <CircularProgress size={30} />
        ) : (
          <button
            className={`h-[50px] w-[170px] text-center rounded-lg ${canContinue ? 'bg-[#00000040] text-black' : 'text-white bg-purple'}`}
            disabled={canContinue}
            onClick={handleContinue}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

export default ContactPoint
