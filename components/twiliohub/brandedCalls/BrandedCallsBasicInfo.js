import BrandedCallsHeader from "./BrandedCallsHeader";
import { Box, FormControl, MenuItem, Select } from '@mui/material';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { businessTypesArray, bussinessRegionArea, callingRules, customerType, industriesTypeArray, registrationIdType } from '../twilioExtras/TwilioHubConstants';


const BrandedCallsBasicInfo = ({
    handleContinue
}) => {

    const selectRef = useRef(null);

    const [canContinue, setCanContinue] = useState(true);

    const [openCountry, setOpenCountry] = useState(false);
    const [country, setCountry] = useState("");

    const [outboundVoiceService, setOutBoundVoiceService] = useState("");
    const [complaintCalling, setComplaintCalling] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        if (!country) {
            setCanContinue(true);
        } else {
            setCanContinue(false);
        }
    }, [country]);

    //get selected and unselected radio img
    //radios check images
    const getRadioImg = (id) => {
        if (outboundVoiceService.id === id) {
            return "/twiliohubassets/RadioFocus.jpg"
        } else {
            return "/twiliohubassets/Radio.jpg"
        }
    }

    //radios check images for complaint
    const getRadioComplaintImg = (id) => {
        if (complaintCalling.id === id) {
            return "/twiliohubassets/RadioFocus.jpg"
        } else {
            return "/twiliohubassets/Radio.jpg"
        }
    }

    const ysNoArray = [
        {
            id: 0,
            title: "Yes"
        },
        {
            id: 1,
            title: "No"
        }
    ]

    const styles = {
        boldFont: {
            fontSize: 22,
            fontWeight: "700"
        },
        regularFont: {
            fontSize: 15,
            fontWeight: "500"
        },
        semiBold: {
            fontSize: 18,
            fontWeight: "700"
        }
    }

    return (
        <div className='h-[100%] w-full flex flex-col items-center justify-between'>
            <div className='w-11/12 h-[90%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple pb-2 px-2'>
                <BrandedCallsHeader />
                <div
                    className='mt-6'
                    style={styles.regularFont}>
                    Select country*
                </div>
                <div className="border rounded-lg">
                    <Box className="w-full rounded-lg">
                        <FormControl className="w-full">
                            <Select
                                ref={selectRef}
                                open={openCountry}
                                onClose={() => setOpenCountry(false)}
                                onOpen={() => setOpenCountry(true)}
                                className="border-none rounded-2xl outline-none"
                                displayEmpty
                                value={country}
                                // onChange={handleselectBusinessType}
                                onChange={(e) => {
                                    let value = e.target.value;
                                    console.log("Value for business type is", value);
                                    setCountry(value);
                                    setOpenCountry(false);
                                }}
                                renderValue={(selected) => {
                                    if (selected === "") {
                                        return <div>Select</div>;
                                    }
                                    return selected;
                                }}
                                sx={{
                                    ...styles.regularFont,
                                    backgroundColor: "#FFFFFF",
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: "none",
                                    },
                                    borderRadius: "20px"
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
                                    bussinessRegionArea.map((item) => {
                                        return (
                                            <MenuItem
                                                key={item.id}
                                                style={styles.regularFont}
                                                value={item.areaName}
                                                className='w-full'
                                            >
                                                {item.areaName}
                                            </MenuItem>
                                        )
                                    })
                                }
                            </Select>
                        </FormControl>
                    </Box>
                </div>
                <div style={styles.semiBold} className="mt-4 pt-2 border-t-[2px] border-[#00000010]">
                    Beta Program Qualifications
                </div>
                <div className="mt-2" style={styles.regularFont}>
                    Has your account been using outbound voice services on Twilio for over 3 months in production capacity?
                </div>
                <div className="mt-4">
                    {ysNoArray.map((item) => {
                        return (
                            <button
                                key={item.id}
                                className="border-none outline-none flex flex-row items-center gap-2 mb-2"
                                onClick={() => { setOutBoundVoiceService(item) }}>
                                <Image
                                    alt="*"
                                    src={getRadioImg(item.id)}
                                    height={15
                                    }
                                    width={15}
                                />
                                <div>
                                    {item.title}
                                </div>
                            </button>
                        )
                    })}
                </div>
                <div style={styles.regularFont} className="mt-2">
                    Do you strictly follow best practice guidelines of compliant outbound calling, such as but not limited to:
                </div>
                <ul className="list-disc pl-6 mt-2 text-black space-y-1">
                    {callingRules.map((rule) => (
                        <li key={rule.id}>{rule.title}</li>
                    ))}
                </ul>
                <div className="mt-4">
                    {ysNoArray.map((item) => {
                        return (
                            <button
                                key={item.id}
                                className="border-none outline-none flex flex-row items-center gap-2 mb-2"
                                onClick={() => { setComplaintCalling(item) }}>
                                <Image
                                    alt="*"
                                    src={getRadioComplaintImg(item.id)}
                                    height={15
                                    }
                                    width={15}
                                />
                                <div>
                                    {item.title}
                                </div>
                            </button>
                        )
                    })}
                </div>
                <div style={styles.semiBold} className="mt-6"//pt-2 border-t-[2px] border-[#00000010]
                >
                    Brand Contact
                </div>
                <div className="w-full flex flex-row items-center justify-between mt-3">
                    <div className="w-[90%]">
                        <div
                            // className='mt-4'
                            style={styles.regularFont}>
                            First Name
                        </div>
                        <div className='w-full mt-2'>
                            <input
                                className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
                                style={styles.regularFont}
                                placeholder='First Name'
                                value={firstName}
                                onChange={(e) => {
                                    setFirstName(e.target.value);
                                }}
                            />
                        </div>
                    </div>
                    <div className="w-[90%] ms-6">
                        <div
                            // className='mt-4'
                            style={styles.regularFont}>
                            Last Name
                        </div>
                        <div className='w-full mt-2'>
                            <input
                                className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
                                style={styles.regularFont}
                                placeholder='Last Name'
                                value={lastName}
                                onChange={(e) => {
                                    setLastName(e.target.value);
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div
                    className='mt-4'
                    style={styles.regularFont}>
                    Email Address
                </div>
                <div className='w-full mt-2'>
                    <input
                        className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
                        style={styles.regularFont}
                        placeholder='Email Address'
                        value={email}
                        type="email"
                        onChange={(e) => {
                            setEmail(e.target.value);
                        }}
                    />
                </div>
                <div
                    className='mt-4'
                    style={styles.regularFont}>
                    Phone Number
                </div>
                <div className='w-full mt-2'>
                    <input
                        className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
                        style={styles.regularFont}
                        placeholder='Phone Number'
                        value={phone}
                        type="phone"
                        onChange={(e) => {
                            setPhone(e.target.value);
                        }}
                    />
                </div>
            </div>
            <div className='w-full max-h-[10%] flex flex-row items-center justify-between'>
                <button
                    className='outline-none border-none text-purple'
                    style={styles.regularFont}
                // onClick={() => {
                //     handleBack()
                // }}
                >
                    Back
                </button>
                <button
                    className={`h-[50px] w-[170px] text-center rounded-lg ${canContinue ? "bg-[#00000040] text-black" : "text-white bg-purple"}`}
                    disabled={canContinue}
                    onClick={() => {
                        handleContinue()
                    }}
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default BrandedCallsBasicInfo;
