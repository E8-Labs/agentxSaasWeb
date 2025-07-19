import { Box, FormControl, MenuItem, Select } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react'
import { businessTypesArray } from '../twilioExtras/TwilioHubConstants';
import SampleMessageComponent from './SampleMessageComponent';
import Image from 'next/image';

const CampaignDetails = ({
  handleContinue,
  handleClose
}) => {

  const selectRef = useRef(null);

  const [campaignUserCase, setCampaignUserCase] = useState("");
  const [openBusinessTypeDropwDown, setOpenBusinessTypeDropwDown] = useState(false);

  //
  const [useCase, setUseCase] = useState("");
  //sample messages
  const [sampleMessage1, setSampleMessage1] = useState("");
  const [sampleMessage2, setSampleMessage2] = useState("");
  //messages metadata flags
  const [messagesMetadataFlags, setMessagesMetadataFlags] = useState([]);
  //disable btn state
  const [isDisabled, setIsDisabled] = useState(true);

  //check for disable btn state
  useEffect(() => {
    if (sampleMessage1.length < 20 || sampleMessage2.length < 20 || !campaignUserCase || !useCase) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [sampleMessage1, sampleMessage2, campaignUserCase, useCase])


  const toggleOption = (value) => {
    setMessagesMetadataFlags((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const options = [
    {
      label: 'The message will include an embedded link',
      value: 'includesLink',
    },
    {
      label: 'The message will include phone numbers',
      value: 'includesPhoneNumber',
    },
    {
      label: 'The messages include age gated content as defined by Carrier and CTA guidelines',
      value: 'includesAgeGatedContent',
    },
    {
      label: 'The messages include content related to direct lending or other loan arrangement.',
      value: 'includesLoanContent',
    },
  ];

  //examples arrays

  //use case examples
  const userCaseExamples = [
    {
      id: 1,
      text: "This campaign sends appointment information - confirmation & reminder messages to customers once they have booked an appointment with company_name on website and opted-in to receive promotional and notification SMS from company_name."
    },
    {
      id: 2,
      text: "The campaign will be used to reach out to customers who signed up for the updates via SMS."
    },
    {
      id: 3,
      text: "This campaign will be used by company_name to reach out to clients who have opted in to receive messages."
    },
  ]

  // sample message 1 examples
  const sampleMessage1Examples = [
    {
      id: 1,
      text: "Hi John! This is Jane from company_name. Our appointment for July 20 11:00 AM is confirmed. Please reach out to +1(213) 725-2867 in case you need to reschedule. Reply STOP to unsubscribe."
    },
    {
      id: 2,
      text: "Hello, this is Adam from LC Phone. I am following up with you about our meeting yesterday, would you have time to discuss this today? Reply STOP to cancel."
    }
  ]

  // sample message 2 examples
  const sampleMessage2Examples = [
    {
      id: 1,
      text: "Hey Brian! This is Jane from company_name. I see that you weren't able to make it for our appointment. Would you like to reschedule? - https://www.mycompany.com/book. Reply STOP to unsubscribe."
    },
    {
      id: 2,
      text: "Hello, this is Dr. Lea. We are confirming your appointment tomorrow at 9 am. Reply STOP to cancel."
    }
  ]

  //styles
  const styles = {
    normalTxt: {
      fontWeight: "500",
      fontSize: 15
    },
    size13: {
      fontWeight: "500",
      fontSize: 13,
    },
    semiBold: {
      fontWeight: "600",
      fontSize: 22,
    }
  }

  return (
    <div className='h-[100%] flex flex-col items-center justify-between'>
      <div className='w-10/12 overflow-auto h-[85%]'>
        <div>
          <div style={styles.semiBold}>
            Campaign Details
          </div>
          <div
            className='mt-4'
            style={styles.normalTxt}>
            Campaign Use case<span className='text-red'>*</span>
          </div>

          <div className="border rounded-lg mt-2">
            <Box className="w-full">
              <FormControl className="w-full">
                <Select
                  ref={selectRef}
                  open={openBusinessTypeDropwDown}
                  onClose={() => setOpenBusinessTypeDropwDown(false)}
                  onOpen={() => setOpenBusinessTypeDropwDown(true)}
                  className="border-none rounded-2xl outline-none"
                  displayEmpty
                  value={campaignUserCase}
                  // onChange={handleselectBusinessType}
                  onChange={(e) => {
                    let value = e.target.value;
                    console.log("Value for business type is", value);
                    setCampaignUserCase(value);
                    setOpenBusinessTypeDropwDown(false);
                  }}
                  renderValue={(selected) => {
                    if (selected === "") {
                      return <div>Business Type</div>;
                    }
                    return selected;
                  }}
                  sx={{
                    ...styles.normalTxt,
                    backgroundColor: "#FFFFFF",
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: "30vh", // Limit dropdown height
                        overflow: "auto", // Enable scrolling in dropdown
                        scrollbarWidth: "none",
                      },
                    },
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  {
                    businessTypesArray.map((item) => {
                      return (
                        <MenuItem
                          key={item.id}
                          style={styles.normalTxt}
                          value={item.title}
                          className='w-full'
                        >
                          {item.title}
                        </MenuItem>
                      )
                    })
                  }
                </Select>
              </FormControl>
            </Box>
          </div>

          <div className='mt-4'>
            <SampleMessageComponent
              title="Use case"
              subTitle="Please explain in detail"
              warning="Min length: 40 characters. Max length 4096 characters"
              compulsory={true}
              //stores values
              value={useCase}
              setValue={setUseCase}
              minRequiredLength={40}
              maxRequiredLength={4096}
              examples={userCaseExamples}
            />
          </div>

          <div className='mt-4'>
            <SampleMessageComponent
              title="Sample Message #1"
              subTitle="Must include lead name, your name, business name & opt-out language"
              warning="Min length: 20 characters. Max length 1024 characters"
              compulsory={true}
              //stores values
              value={sampleMessage1}
              setValue={setSampleMessage1}
              examples={sampleMessage1Examples}
            />
          </div>

          <div className='mt-4'>
            <SampleMessageComponent
              title="Sample Message #2"
              subTitle="Must include lead name, your name, business name & opt-out language"
              warning="Min length: 20 characters. Max length 1024 characters"
              compulsory={true}
              //stores values
              value={sampleMessage2}
              setValue={setSampleMessage2}
              examples={sampleMessage2Examples}
            />
          </div>

          <div className="mt-4">
            {options.map((option) => (
              <button
                key={option.value}
                className="border-none outline-none"
                onClick={() => toggleOption(option.value)}
              >
                <div className="flex flex-row items-center gap-2 pb-2">
                  <div>
                    {messagesMetadataFlags.includes(option.value) ? (
                      <div
                        className="bg-purple flex flex-row items-center justify-center rounded"
                        style={{ height: "24px", width: "24px" }}
                      >
                        <Image
                          src={"/assets/whiteTick.png"}
                          height={8}
                          width={10}
                          alt="*"
                        />
                      </div>
                    ) : (
                      <div
                        className="bg-none border-2 flex flex-row items-center justify-center rounded"
                        style={{ height: "24px", width: "24px" }}
                      ></div>
                    )}
                  </div>
                  <div className="text-start" style={styles.normalTxt}>
                    {option.label}
                  </div>
                </div>
              </button>
            ))}
          </div>

        </div>
      </div>
      <div className='w-full flex flex-row items-center gap-4 justify-between'>
        <button
          className="text-violet-blue w-[165px]"
          disabled={isDisabled}
          onClick={() => { handleClose() }}
        >
          Save & Exit
        </button>
        <button
          onClick={handleContinue}
          className={`w-[176px] ${isDisabled ? "bg-btngray text-black" : "bg-violet-blue text-white"} h-[50px] rounded-lg`}
          disabled={isDisabled}>
          Continue
        </button>
      </div>
    </div>
  )
}

export default CampaignDetails
