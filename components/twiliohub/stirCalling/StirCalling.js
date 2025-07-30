import { AuthToken } from '@/components/agency/plan/AuthDetails';
import Apis from '@/components/apis/Apis';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import CloseBtn from '@/components/globalExtras/CloseBtn';
import OldCnamVoiceStir from '@/components/twiliohub/twilioExtras/OldCnamVoiceStir';
import { Box, CircularProgress, Modal } from '@mui/material';
import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

const StirCalling = ({
    showShakenStir,
    trustProducts,
    handleClose,
    // friendlyName
}) => {

    const [selectedSTIR, setSelectedSTIR] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);
    const [loader, setLoader] = useState(false);
    const [productName, setProductName] = useState("");
    const [getNumbersLoader, setGetNumbersLoader] = useState(false);
    const [phonesList, setPhonesList] = useState([]);
    const [phoneSelect, setPhoneSelect] = useState([]);
    const [showSnack, setShowSnack] = useState({
        type: SnackbarTypes.Success,
        message: "",
        isVisible: false
    });

    // const phonesList = [
    //     {
    //         id: 1,
    //         phoneNumber: "+14086799068"
    //     },
    //     {
    //         id: 2,
    //         phoneNumber: "+14086799069"
    //     },
    //     {
    //         id: 3,
    //         phoneNumber: "+14086799067"
    //     },
    //     {
    //         id: 4,
    //         phoneNumber: "+14086799066"
    //     },
    //     {
    //         id: 5,
    //         phoneNumber: "+14086799066"
    //     },
    //     {
    //         id: 6,
    //         phoneNumber: "+14086799066"
    //     },
    // ]

    useEffect(() => {
        getPhonesList();
    }, [])

    //reset one field value to null when the other is filled
    useEffect(() => {
        // Only reset if one field has a value and the other is being set
        if (productName && productName.trim() !== "") {
            setSelectedSTIR("")
        }
    }, [productName])

    useEffect(() => {
        // Only reset if one field has a value and the other is being set
        if (selectedSTIR && String(selectedSTIR).trim() !== "") {
            setProductName("")
        }
    }, [selectedSTIR])

    //toggle agree terms click
    const handleToggleTermsClick = () => {
        setAgreeTerms(!agreeTerms);
    };

    useEffect(() => {
        if ((!productName && !selectedSTIR) || !agreeTerms) {
            setIsDisabled(true);
        } else {
            setIsDisabled(false);
        }
    }, [productName, selectedSTIR, agreeTerms]);

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

            // If user selected an existing STIR/SHAKEN product, use select API
            if (selectedSTIR && String(selectedSTIR).trim() !== "") {
                // Import AddSelectedProduct API
                const { AddSelectedProduct } = await import('@/apiservicescomponent/twilioapis/AddSelectedProduct');
                const response = await AddSelectedProduct(selectedSTIR);

                setLoader(false);
                if (response.status === true) {
                    handleClose(response);
                } else {
                    setShowSnack({
                        type: SnackbarTypes.Error,
                        message: response.message || "Failed to select STIR/SHAKEN product",
                        isVisible: true
                    })
                }
            } else {
                // If user entered a new product name, use create API
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
                console.log("Api data is", ApiData);

                const response = await axios.post(ApiPath, ApiData, {
                    headers: {
                        "Authorization": "Bearer " + token,
                        "Content-Type": "application/json"
                    }
                });

                if (response) {
                    setLoader(false);
                    const apiResponse = response.data;
                    if (apiResponse.status === true) {
                        handleClose(apiResponse);
                    } else if (apiResponse.status === false) {
                        setShowSnack({
                            type: SnackbarTypes.Error,
                            message: apiResponse.message || "Failed to create STIR/SHAKEN product",
                            isVisible: true
                        })
                    }
                    console.log("Response of api is", response);
                }
            }

        } catch (error) {
            setLoader(false);
            console.log("Error occured in api is", error);

            // Extract error message from server response
            let errorMessage = "An unexpected error occurred";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setShowSnack({
                type: SnackbarTypes.Error,
                message: errorMessage,
                isVisible: true
            })
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
                    <AgentSelectSnackMessage
                        type={showSnack.type}
                        message={showSnack.message}
                        isVisible={showSnack.isVisible}
                        hide={() => {
                            setShowSnack({
                                message: "",
                                isVisible: false,
                                type: SnackbarTypes.Success,
                            });
                        }}
                    />
                    <div
                        className='w-full max-h-[80%] overflow-x-hidden overflow-y-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple pb-2 px-2'
                    >
                        <div className='w-full flex flex-row items-center justify-between'>
                            <div style={{ fontWeight: "700", fontSize: 22 }}>
                                SHAKEN/STIR Calling
                            </div>
                            <CloseBtn onClick={() => { handleClose() }} />
                        </div>
                        <div
                            className='mt-2'
                            style={{ fontWeight: "700", fontSize: 17 }}>
                            {`Enter a display name for SHAKEN/STIR`}
                        </div>
                        <div className='mt-2' style={styles.normalTxt}>
                            We will enable SHAKEN/STIR for outbound calls on all United States numbers assigned to this Twilio Approved Business Profile. No additional configuration is required. Enabling SHAKEN/STIR Trusted calling will not interupt your existing services
                        </div>
                        {/* Select STIR/SHAKEN from list */}
                        {
                            trustProducts?.shakenStir?.all?.length > 1 && (
                                <div className='mt-4'>
                                    <div
                                        className='mb-2'
                                        style={styles.normalTxt}
                                    >
                                        Select SHAKEN/STIR
                                    </div>
                                    <OldCnamVoiceStir
                                        twilioLocalData={trustProducts.shakenStir.all}
                                        value={selectedSTIR}
                                        setValue={setSelectedSTIR}
                                    />
                                </div>
                            )
                        }
                        <div
                            className='mt-6'
                            style={styles.normalTxt}>
                            Create SHAKEN/STIR Name
                        </div>
                        <div className='w-full mt-2'>
                            <input
                                className='w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-200'
                                style={styles.normalTxt}
                                placeholder='Type here'
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
                        </div><div
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
                        <div className='flex flex-col items-start gap-4 mt-6'>
                            {
                                getNumbersLoader ? (
                                    <CircularProgress size={25} />
                                ) : (
                                    <div>
                                        {phonesList.length > 0 ? (
                                            <div className='flex flex-col items-center gap-4 w-full overflow-auto max-h-[30vh] scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple'>
                                                {phonesList.map((item, index) => {
                                                    return (
                                                        <button key={index}
                                                            className={`px-2 flex flex-row items-center gap-4 border-none outline-none rounded-lg h-[50px] w-[236px]`}
                                                            onClick={() => { handlephoneSelect(item.phoneNumber) }}
                                                        >
                                                            {
                                                                phoneSelect.includes(item.phoneNumber) ? (
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
                                                                )
                                                            }
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
                        </div>*/}

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
                                    href="https://sti-ga.atis.org/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple underline ml-1"
                                >
                                    Secure Telephony Identity Policy Administrator (STI-PA)
                                </a>
                                {`  and `}
                                <a
                                    // href="https://www.ustelecom.org/"
                                    href="https://tracebacks.org/"
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
                            className={`${isDisabled ? "bg-btngray text-black" : "bg-purple text-white"} w-full h-[50px] rounded-lg px-6 outline-none border-none`}
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
