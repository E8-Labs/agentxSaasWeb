import { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import { claimGift, getDiscount } from '@/components/userPlans/UserPlanServices';
import { CircularProgress } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react'


function ClaimGift({ handleContinue,setShowSnak }) {

    const [claimLoader, setClaimLoader] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleClaimMins = async () => {
        setClaimLoader(true)
        let response = await claimGift()
        if (response) {
            setShowSnak({
                message: response.message,
                type: SnackbarTypes.Success
            })
        }
        setClaimLoader(false)

        let nextAction = "closeModel"
        handleContinue(nextAction)

    }


    const handleContinueCancel = async () => {
        setLoading(true)
        let data = await getDiscount()

        console.log('data', data)
        if (data?.discountOffer?.alreadyUsed === false) {
            let nextAction = "obtainOffer"
            handleContinue(nextAction)
        } else {
            let nextAction = "cancelConfirmationFromGift"
            handleContinue(nextAction)
        }

        setLoading(false)


    }

    return (
        <div className='w-full flex flex-col items-center'>
            <div
                className="text-center text-purple "
                style={{
                    fontWeight: "600",
                    fontSize: 16.8,
                }}
            >
                {`Here’s a Gift`}
            </div>

            <div className="flex flex-row items-center justify-center w-full mt-3">
                <div
                    className="text-center text-xl font-semibold  w-full"

                >
                    {`Don’t Hang Up Yet! Get 30 Minutes of Free Talk Time and Stay Connected!`}
                </div>
            </div>

            <div className="flex flex-col items-center px-4 w-full">
                <div
                    className={`flex flex-row items-center gap-2 text-purple text-base font-semibold mt-4 bg-[#402FFF10] py-2 px-4 rounded-full`}

                >
                    <Image
                        src={"/svgIcons/gift.svg"}
                        height={
                            24
                        }
                        width={
                            24
                        }
                        alt="*"
                    />
                    Enjoy your next calls on us
                </div>
                <div className="w-full flex flex-row justify-center items-end">


                    <div
                        className="text-purple -mt-6"
                        style={{
                            fontSize: 173,
                            fontWeight: "400",
                            // zIndex: 0,
                        }}
                    >
                        30
                    </div>

                    <div
                        style={{
                            fontSize: 40,
                            fontWeight: "700",
                            marginBottom: 60
                        }}
                    >
                        Mins
                    </div>

                </div>

                {/* <div style={{
                    position:'relative'
                }} className='flex flex-row items-center border gap-8 -mt-10'>
                    <div style={{
                        position:'relative',
                        left:40
                    }}  class="w-24 h-[1.73px] opacity-40 bg-black rounded-full blur-[3.24px]"></div>
                    <div style={{
                        position:'relative',

                    }}  class="w-14 h-[1.73px] opacity-40 bg-black rounded-full blur-[3.24px]"></div>

                </div>
               */}
                {claimLoader ? (
                    <div className="h-[50px] w-full flex flex-row items-center justify-center">
                        <CircularProgress size={30} />
                    </div>
                ) : (
                    <button
                        className="rounded-lg w-full text-white bg-purple outline-none"
                        style={{
                            fontWeight: "400",
                            fontSize: "16",
                            height: "50px",
                        }}
                        onClick={handleClaimMins}
                    >
                        Claim my 30 minutes
                    </button>
                )}

                {
                    loading ? (
                        <CircularProgress className='mt-3' />
                    ) : (
                        <button
                            className="rounded-lg border w-full outline-none mt-3"
                            style={{
                                fontWeight: "400",
                                fontSize: "16",
                                height: "50px",
                            }}
                            onClick={() => {
                                handleContinueCancel()
                            }}
                        >
                            Continue to Cancel Subscription
                        </button>
                    )
                }
            </div>
        </div >
    )
}


const styles = {
    text: {
        fontSize: 12,
        color: "#00000090",
    },
    text2: {
        textAlignLast: "left",
        fontSize: 15,
        color: "#000000",
        fontWeight: 500,
        whiteSpace: "nowrap", // Prevent text from wrapping
        overflow: "hidden", // Hide overflow text
        textOverflow: "ellipsis", // Add ellipsis for overflow text
    },
    paymentModal: {
        height: "auto",
        bgcolor: "transparent",
        // p: 2,
        mx: "auto",
        my: "50vh",
        transform: "translateY(-50%)",
        borderRadius: 2,
        border: "none",
        outline: "none",
    },
    headingStyle: {
        fontSize: 16,
        fontWeight: "700",
    },
    gitTextStyle: {
        fontSize: 15,
        fontWeight: "700",
    },

    //style for plans
    cardStyles: {
        fontSize: "14",
        fontWeight: "500",
        border: "1px solid #00000020",
    },
    pricingBox: {
        position: "relative",
        // padding: '10px',
        borderRadius: "10px",
        // backgroundColor: '#f9f9ff',
        display: "inline-block",
        width: "100%",
    },
    triangleLabel: {
        position: "absolute",
        top: "0",
        right: "0",
        width: "0",
        height: "0",
        borderTop: "50px solid #7902DF", // Increased height again for more padding
        borderLeft: "50px solid transparent",
    },
    labelText: {
        position: "absolute",
        top: "10px", // Adjusted to keep the text centered within the larger triangle
        right: "5px",
        color: "white",
        fontSize: "10px",
        fontWeight: "bold",
        transform: "rotate(45deg)",
    },
    content: {
        textAlign: "left",
        paddingTop: "10px",
    },
    originalPrice: {
        textDecoration: "line-through",
        color: "#7902DF65",
        fontSize: 18,
        fontWeight: "600",
    },
    discountedPrice: {
        color: "#000000",
        fontWeight: "bold",
        fontSize: 18,
        marginLeft: "10px",
    },
};

export default ClaimGift
