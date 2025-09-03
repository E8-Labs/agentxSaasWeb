import { Box, CircularProgress, Modal, Slider } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { styled } from "@mui/material/styles";
import { getDiscount, purchaseMins } from '@/components/userPlans/UserPlanServices';

const ObtainOffer = ({
    handleContinue
}) => {

    const GradientSlider = styled(Slider)(({ theme }) => ({
        color: "transparent", // base color removed
        height: 8,
        padding: "20px 0",

        "& .MuiSlider-rail": {
            opacity: 1,
            backgroundColor: "#e0e0e0", // rail color
            height: 8,
            borderRadius: 8,
        },

        "& .MuiSlider-track": {
            border: "none",
            background: "linear-gradient(90deg, #7902DF, #C73BFF)", // gradient track
            height: 14,
            borderRadius: 8,
        },

        "& .MuiSlider-thumb": {
            height: 30,
            width: 30,
            background: "linear-gradient(135deg, #7902DF, #C73BFF)",
            border: "3px solid white",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            "&:hover": {
                boxShadow: "0 0 15px rgba(0,0,0,0.3)",
            },
        },

        "& .MuiSlider-valueLabel": {
            background: "linear-gradient(135deg, #7902DF, #C73BFF)",
            color: "white",
            borderRadius: 6,
            padding: "4px 8px",
            fontSize: 12,
            fontWeight: "bold",
            transform: "translateY(-120%) scale(1)",

            "&:before": {
                content: '""',
                position: "absolute",
                bottom: -10, // distance below the box
                left: "50%",
                transform: "translateX(-50%)",
                width: 16,
                height: 10,
                background: "linear-gradient(135deg, #7902DF, #C73BFF)",
                clipPath: "polygon(50% 100%, 0 0, 100% 0)", // triangle shape
            },
        },

    }));

    const [offerData, setOfferData] = useState(null)
    const [mins, setMins] = useState(200)
    const [loading, setLoading] = useState(false)

    let totalCost = (offerData?.discountOffer?.discount?.discountedCostPerMinute * mins).toFixed(2)

    console.log('totalCost', totalCost, offerData?.discountOffer?.discount?.discountedCostPerMinute, mins)
    useEffect(() => {
        getOffer()
    }, [])

    const getOffer = async () => {
        let data = await getDiscount()
        if (data) {
            setOfferData(data)
        }
    }


    const purchaseDeal = async () => {
        setLoading(true)
        let data = await purchaseMins(mins)
        setLoading(false)
        let nextAction = "closeModel"

        handleContinue(nextAction)
        
    }

    // console.log('mins', mins)

    return (
        <div>
            <div className='h-[100%] w-full flex flex-col items-center justify-center p-4 -mt-5'>
                <div
                    className="bg-gradient-to-r from-[#7902DF] to-[#C73BFF] bg-clip-text text-transparent -mt-4"
                    style={{ fontSize: "35px", fontWeight: 700 }}
                >
                    50% Off
                </div>
                <div className="" style={{ fontSize: "15px", fontWeight: "400" }}>
                    Your Minutes
                </div>
                <div className="mt-4" style={{ fontSize: "22px", fontWeight: "700" }}>
                    {`Let’s Make a Deal!`}
                </div>
                <div className="mt-1 text-center" style={{ fontSize: "15px", fontWeight: "400" }}>
                    {`We want to give you the best price possible, so we’ll cut the cost by 50%. Just don’t tell the world. `}
                </div>

                <div className='flex flex-col items-center justify-center w-full h-[200px] shadow-medium border mt-5 rounded-lg bg-white'>
                    {/*<div
                        style={{
                            width: "100%",
                            height: "80%",
                            backgroundImage: "url('/otherAssets/dealOrb.png')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderBottomLeftRadius: "1700px",
                            borderBottomRightRadius: "1700px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            // opacity: '0.5'
                        }}
                    >*/}
                    <div className='flex flex-col items-cetner'
                        style={{
                            opacity: '1'
                        }}
                    >
                        <div className='text-lg font-semibold mt-3'>
                            How many minutes do you need?
                        </div>

                        <GradientSlider className='mt-5'

                            max={2000}
                            min={30}
                            valueLabelDisplay="on"
                            aria-label="Gradient Slider"
                            value={mins}
                            onChange={(e, newValue) => {
                                setMins(newValue);        // newValue is the slider value
                            }}
                        />

                        <div className='text-[12px] font-normal text-center mt-4'>
                            Your new total is : <span className='font-semibold'>{`$${totalCost}`}</span>
                        </div>


                        {/* </div>*/}

                    </div>
                </div>
                {
                    loading ? (
                        <CircularProgress />
                    ) : (
                        <button className='flex flex-col w-full h-[50px] bg-purple mt-6 items-center justify-center text-white rounded-lg text-base font-regular'
                            onClick={() => {
                                purchaseDeal()
                            }}
                        >
                            Continue to Payment
                        </button>
                    )
                }


                <button className='flex flex-col w-full h-[50px] border mt-3 items-center justify-center  rounded-lg text-base font-regular'
                    onClick={() => {
                        let nextAction = "cancelConfirmationFromDeal"
                        handleContinue(nextAction)
                    }}
                >
                    No Deal. Cancel Subscription
                </button>
            </div>

        </div>
    )
}

export default ObtainOffer