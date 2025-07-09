import { AuthToken } from '@/components/agency/plan/AuthDetails';
import Apis from '@/components/apis/Apis';
import { Box, CircularProgress, Modal } from '@mui/material';
import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

const StirCalling = ({
    showShakenStir,
    handleClose
}) => {

    const [agreeTerms, setAgreeTerms] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);
    const [loader, setLoader] = useState(false);
    const [productName, setProductName] = useState("");
    const [getNumbersLoader, setGetNumbersLoader] = useState(false);
    const [phonesList, setPhonesList] = useState([]);
    const [phoneSelect, setPhoneSelect] = useState([]);

    useEffect(() => {
        getPhonesList();
    }, [])

    //toggle agree terms click
    const handleToggleTermsClick = () => {
        setAgreeTerms(!agreeTerms);
    };

    useEffect(() => {
        if (!productName) {
            setIsDisabled(true);
        } else {
            setIsDisabled(false);
        }
    });

    //select phones
    const handlephoneSelect = (phone) => {
        setPhoneSelect((prevPhoneNumbers) => {
            if (prevPhoneNumbers.includes(phone)) {
                // Unselect the item if it's already selected
                return prevPhoneNumbers.filter((prevId) => prevId !== phone);
            } else {
                // Select the item if it's not already selected
                return [...prevPhoneNumbers, phone];
            }
        });
    };

    //add the shaken stir
    const handleAddShakenStir = async () => {
        try {
            setLoader(true);
            const token = AuthToken();
            const ApiPath = Apis.createShakenStir;
            let ApiData = null;
            if (phoneSelect.length > 0) {
                ApiData = {
                    friendlyName: productName,
                    phone_numbers: phoneSelect
                }
            } else {
                ApiData = {
                    friendlyName: productName,
                }
            }
            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                setLoader(false);
                handleClose();
                console.log("Response of api is", response);
            }

        } catch (error) {
            setLoader(false);
            console.log("Error occured in api is", error);
        }
    }

    //get the phone numbers list
    const getPhonesList = async () => {
        try {
            setGetNumbersLoader(true);
            const token = AuthToken();
            const ApiPath = Apis.userAvailablePhoneNumber;
            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("List of get numbers", response);
                setGetNumbersLoader(false);
                setPhonesList(response.data.data);
            }

        } catch (error) {
            setGetNumbersLoader(false);
            console.log("Error occured in api is", error);
        }
    }

    //stylles
    const styles = {
        normalTxt: {
            fontWeight: "500",
            fontSize: 15
        }
    }

    return (
        <Modal
            open={showShakenStir}
            onClose={() => {
                handleClose();
            }}
            BackdropProps={{
                timeout: 200,
                sx: {
                    backgroundColor: "#00000020",
                    backdropFilter: "blur(20px)"
                },
            }}
            sx={{
                zIndex: 1300,
                // backgroundColor: "red"
            }}
        >
            <Box
                className="rounded-xl max-w-2xl w-full shadow-lg bg-white border-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col p-6"
            // className="w-full h-[100%]"
            >
                <div className='max-h-[80svh]  w-full flex flex-col items-center justify-between'>
                    <div
                        className='w-full max-h-[80%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple pb-2 px-2'
                    >
                        <div className='mt-8' style={{ fontWeight: "700", fontSize: 22 }}>
                            SHAKEN/STIR Calling
                        </div>
                        <div
                            className='mt-2'
                            style={{ fontWeight: "700", fontSize: 17 }}>
                            {`Enter a display name for CNAM`}
                        </div>
                        <div className='mt-2' style={styles.normalTxt}>
                            This name will show on your customers phone when you call them. You can display uptill 15 characters. The display name will be vetted for appropriateness and relevance to your Business.
                        </div>
                        <div
                            className='mt-6'
                            style={styles.normalTxt}>
                            Trust product name*
                        </div>
                        <div className='w-full mt-2'>
                            <input
                                className='border rounded-lg p-2 h-[50px] outline-none focus:outline-none w-full focus:ring-0 focus:border'
                                style={styles.normalTxt}
                                placeholder='Trust product name'
                                value={productName}
                                onChange={(e) => {
                                    setProductName(e.target.value)
                                }}
                            />
                        </div>
                        {/*<div
                            className='pt-4 mt-6 w-full'
                            style={{
                                fontWeight: "700",
                                fontSize: 18,
                                borderTop: "2px solid #00000010"
                            }}>
                            Select a Business Profile
                        </div>
                        <div
                            className='mt-2'
                            style={{
                                fontWeight: "400",
                                fontSize: 13,
                                color: "#00000060"
                            }}>
                            {`We will enable SHAKEN/STIR for outbound calls on all united States numbers assigned to this Twilio Approved Business Profile. No additional configuration is required. Enabling SHAKEN/STIR Trusted calling will not interupt your existing services`}
                        </div>
                        <div className='w-full mt-2'>
                            <input
                                className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
                                style={styles.normalTxt}
                                placeholder='Trust product name'
                            />
                        </div>*/}
                        <div
                            className='pt-2 mt-6 w-full'
                            style={{
                                fontWeight: "700",
                                fontSize: 18,
                                borderTop: "2px solid #00000010"
                            }}>
                            Register Phone Number to SHAKEN/STIR Trust Product
                        </div>
                        <div
                            className='mt-2'
                            style={styles.normalTxt}>
                            Select phone numbers on your Twilio Approved Business Profile and assign them to this SHAKEN/STIR Trust Product.
                        </div>
                        <div className='flex flex-row items-center gap-4 mt-6'>
                            {
                                getNumbersLoader ? (
                                    <CircularProgress size={25} />
                                ) : (
                                    <div>
                                        {phonesList.length > 0 ? (
                                            <div>
                                                {phonesList.map((item, index) => {
                                                    return (
                                                        <button key={index}
                                                            className={`flex flex-row items-center gap-4 border-none outline-none rounded-lg h-[50px] ${phoneSelect.includes(item.phoneNumber) ? "bg-purple text-white" : "text-black bg-purple10"}`}
                                                            onClick={() => { handlephoneSelect(item.phoneNumber) }}
                                                        >
                                                            {item.phoneNumber}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <div>
                                                No Number Found
                                            </div>
                                        )}
                                    </div>
                                )
                            }
                            <button className='border-none outline-none rounded-lg h-[50px] w-[236px] flex flex-row items-center justify-center text-purple bg-purple10'>
                                Register Phone Numbers
                            </button>
                        </div>
                        <div className='flex flex-row items-start gap-2 mt-4 bg-[#00000005] p-2 rounded-lg'>
                            <button onClick={handleToggleTermsClick}>
                                {agreeTerms ? (
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
                            </button>
                            <div style={styles.normalTxt} className="text-sm leading-snug text-black">
                                {`I certify that the associated Business Profile is the originator of the phone calls and certify that I will participate in traceback efforts, including those initiated by the`}
                                <a
                                    href="https://www.atis.org/sti-pa/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple underline"
                                >
                                    Secure Telephony Identity Policy Administrator (STI-PA)
                                </a>
                                {` and `}
                                <a
                                    href="https://www.ustelecom.org/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple underline"
                                >
                                    US telecom
                                </a>
                            </div>

                        </div>
                    </div>
                    <div className='w-full flex flex-row items-center gap-4 mt-8 max-h-[20%]'>
                        <button
                            className='text-purple w-1/2 bg-purple10 h-[50px] rounded-lg outline-none border-none'
                            style={styles.normalTxt}
                            onClick={handleClose}>
                            Exit
                        </button>
                        <button
                            className={`${isDisabled ? "bg-[#00000040]" : "bg-purple"} w-1/2 text-white h-[50px] rounded-lg px-6 outline-none border-none`}
                            onClick={handleAddShakenStir}
                            disabled={loader || isDisabled}
                        >
                            {
                                loader ? (
                                    <CircularProgress size={25} />
                                ) : ("Continue")
                            }
                        </button>
                    </div>
                </div>
            </Box>
        </Modal>
    )
}

export default StirCalling
