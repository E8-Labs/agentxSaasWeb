import { Box, FormControl, MenuItem, Select } from '@mui/material'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import {
  businessTypesArray,
  bussinessRegionArea,
  customerType,
  industriesTypeArray,
  registrationIdType,
} from '../twilioExtras/TwilioHubConstants'

const BusinessInfo = ({
  customerTypeP,
  businessTypeP,
  businessIndustryP,
  businessRegIdTypeP,
  businessRegNumberP,
  businessOperatingRegionP,
  handleContinue,
  handleBack,
}) => {
  const selectRef = useRef(null)

  const [toggleBusinessRegion, setToggleBusinessRegion] = useState([])

  //dropdown
  const [openBusinessTypeDropwDown, setOpenBusinessTypeDropwDown] =
    useState(false)
  const [
    openBusinessIndustryTypeDropwDown,
    setOpenBusinessIndustryTypeDropwDown,
  ] = useState(false)
  const [openBusinessRegIdType, setOpenBusinessRegIdType] = useState(false)

  const [selectedCustomerType, setSelectedCustomerType] = useState('')
  const [selectBusinessType, setSelectBusinessType] = useState('')
  const [businessIndustry, setBusinessIndustry] = useState('')
  const [businessRegIdType, setBusinessRegIdType] = useState('')
  const [businessRegNumber, setBusinessRegNumber] = useState('')
  const [businessOperatingRegion, setBusinessOperatingRegion] = useState('')
  //continue validation
  const [canContinue, setCanContinue] = useState(false)

  //set the passed data if available
  useEffect(() => {
    // setOpenBusinessTypeDropwDown(businessTypeP);
    // setOpenBusinessIndustryTypeDropwDown(businessIndustryP);
    // setOpenBusinessRegIdType(businessRegIdTypeP);
    setSelectedCustomerType(customerTypeP)
    setSelectBusinessType(businessTypeP)
    setBusinessIndustry(businessIndustryP)
    setBusinessRegIdType(businessRegIdTypeP)
    setBusinessRegNumber(businessRegNumberP)
    setBusinessOperatingRegion(businessOperatingRegionP)
  }, [])

  useEffect(() => {
    if (!selectBusinessType || !businessIndustry) {
      setCanContinue(true)
    } else {
      setCanContinue(false)
    }
  }, [selectBusinessType, businessIndustry])

  //radios check images
  const getRadioImg = (id) => {
    if (selectedCustomerType.id === id) {
      return '/twiliohubassets/RadioFocus.jpg'
    } else {
      return '/twiliohubassets/Radio.jpg'
    }
  }

  //handle toggle bussiness region
  const handleToggleBussinessRegion = (item) => {
    // setToggleBusinessRegion((prevIds) => {
    //   if (prevIds.includes(id)) {
    //     // Unselect the item if it's already selected
    //     return prevIds.filter((prevId) => prevId !== id);
    //   } else {
    //     // Select the item if it's not already selected
    //     return [...prevIds, id];
    //   }
    // });
    setBusinessOperatingRegion(item.areaName)
  }

  //handle next click
  const handleNext = () => {
    const businessinfo = {
      selectedCustomerType: selectedCustomerType,
      selectBusinessType: selectBusinessType,
      businessIndustry: businessIndustry,
      businessRegIdType: businessRegIdType,
      businessRegNumber: businessRegNumber,
      businessOperatingRegion: businessOperatingRegion,
    }
    handleContinue(businessinfo)
  }

  //styles
  const styles = {
    normalTxt: {
      fontWeight: '500',
      fontSize: 15,
    },
    size13: {
      fontWeight: '500',
      fontSize: 13,
    },
  }

  return (
    <div className="h-[100%] w-full flex flex-col items-center justify-between">
      <div className="w-8/12 h-[90%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple pb-2 px-2">
        <div style={{ fontWeight: '700', fontSize: 22 }}>
          Business Information
        </div>
        <div className="mt-2" style={styles.normalTxt}>
          {`Complete the profile with your customer’s or subaccount information and submit for verification`}
        </div>
        <div className="mt-6" style={styles.normalTxt}>
          Select business identity
        </div>
        <div>
          {customerType.map((item) => {
            return (
              <div
                key={item.id}
                className="flex flex-row items-start gap-2 w-full mb-2"
              >
                <button
                  className="border-none outline-none mt-1"
                  onClick={() => {
                    setSelectedCustomerType(item)
                  }}
                >
                  <Image
                    alt="*"
                    src={getRadioImg(item.id)}
                    height={17}
                    width={17}
                  />
                </button>
                <div>
                  <div styles={styles.normalTxt}>{item.title}</div>
                  <div className="text-grayclr75" styles={styles.size13}>
                    {item.description}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4" style={styles.normalTxt}>
          Business type*
        </div>

        <div className="border rounded-lg">
          <Box className="w-full">
            <FormControl className="w-full">
              <Select
                ref={selectRef}
                open={openBusinessTypeDropwDown}
                onClose={() => setOpenBusinessTypeDropwDown(false)}
                onOpen={() => setOpenBusinessTypeDropwDown(true)}
                className="border-none rounded-2xl outline-none"
                displayEmpty
                value={selectBusinessType}
                // onChange={handleselectBusinessType}
                onChange={(e) => {
                  let value = e.target.value
                  setSelectBusinessType(value)
                  setOpenBusinessTypeDropwDown(false)
                }}
                renderValue={(selected) => {
                  if (selected === '') {
                    return <div>Business Type</div>
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
                {businessTypesArray.map((item) => {
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
          Business industry*
        </div>
        <div className="border rounded-lg">
          <Box className="w-full">
            <FormControl className="w-full">
              <Select
                ref={selectRef}
                open={openBusinessIndustryTypeDropwDown}
                onClose={() => setOpenBusinessIndustryTypeDropwDown(false)}
                onOpen={() => setOpenBusinessIndustryTypeDropwDown(true)}
                className="border-none rounded-2xl outline-none"
                displayEmpty
                value={businessIndustry}
                // onChange={handleselectBusinessType}
                onChange={(e) => {
                  let value = e.target.value
                  setBusinessIndustry(value)
                  setOpenBusinessIndustryTypeDropwDown(false)
                }}
                renderValue={(selected) => {
                  if (selected === '') {
                    return <div>Business Industry</div>
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
                {industriesTypeArray.map((item) => {
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
          Business registration ID type
        </div>
        <div className="border rounded-lg">
          <Box className="w-full">
            <FormControl className="w-full">
              <Select
                ref={selectRef}
                open={openBusinessRegIdType}
                onClose={() => setOpenBusinessRegIdType(false)}
                onOpen={() => setOpenBusinessRegIdType(true)}
                className="border-none rounded-2xl outline-none"
                displayEmpty
                value={businessRegIdType}
                // onChange={handleselectBusinessType}
                onChange={(e) => {
                  let value = e.target.value
                  setBusinessRegIdType(value)
                  setOpenBusinessRegIdType(false)
                }}
                renderValue={(selected) => {
                  if (selected === '') {
                    return <div>Business registration ID type</div>
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
                {registrationIdType.map((item) => {
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
          Business registration number
        </div>
        <div className="w-full mt-2">
          <input
            className="border border-[#00000015] rounded-lg p-2 h-[50px] outline-none focus:outline-purple w-full focus:ring-0 focus:border-none"
            style={styles.normalTxt}
            placeholder="Business registration number"
            value={businessRegNumber}
            onChange={(e) => {
              setBusinessRegNumber(e.target.value)
            }}
          />
        </div>
        <div className="text-[#00000060] mt-2" style={styles.normalTxt}>
          Must be a 9-digit number with the following format: 12-3456789
        </div>
        <div className="mt-4" style={styles.normalTxt}>
          Business Region of Operation
        </div>
        <div className="mt-2">
          {bussinessRegionArea.map((item) => {
            return (
              <div
                key={item.id}
                className="flex flex-row items-center gap-2 mb-2"
              >
                <button
                  onClick={() => {
                    handleToggleBussinessRegion(item)
                  }}
                >
                  {businessOperatingRegion === item.areaName ? ( //toggleBusinessRegion.includes(item.id)
                    (<div
                      className="bg-purple flex flex-row items-center justify-center rounded"
                      style={{ height: '24px', width: '24px' }}
                    >
                      <Image
                        src={'/assets/whiteTick.png'}
                        height={8}
                        width={10}
                        alt="*"
                      />
                    </div>)
                  ) : (
                    <div
                      className="bg-none border-2 flex flex-row items-center justify-center rounded"
                      style={{ height: '24px', width: '24px' }}
                    ></div>
                  )}
                </button>
                <div style={styles.normalTxt}>{item.areaName}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-4" style={styles.normalTxt}>
          Business Region of Operation
        </div>
      </div>
      <div className="w-10/12 max-h-[10%] flex flex-row items-center justify-between">
        <button
          className="outline-none border-none text-purple"
          style={styles.normalTxt}
          onClick={() => {
            handleBack()
          }}
        >
          Back
        </button>
        <button
          className={`h-[50px] w-[170px] text-center rounded-lg ${canContinue ? 'bg-[#00000040] text-black' : 'text-white bg-purple'}`}
          disabled={canContinue}
          onClick={() => {
            handleNext()
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default BusinessInfo
