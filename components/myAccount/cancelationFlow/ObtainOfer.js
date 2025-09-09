import { Box, CircularProgress, Modal, Slider } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { styled } from "@mui/material/styles";
import { getDiscount, purchaseMins } from '@/components/userPlans/UserPlanServices';
import Image from 'next/image';

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
    const [showDeleteAgentsModal, setShowDeleteAgentsModal] = useState(false)

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

    // Function to check if user has more than 1 agent
    const checkUserAgents = () => {
        try {
            const userData = localStorage.getItem('User');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                const maxAgents = parsedUser?.user?.currentUsage?.maxAgents || 0;
                return maxAgents > 1;
            }
        } catch (error) {
            console.error('Error checking user agents:', error);
        }
        return false;
    }

    // Function to handle cancel subscription
    const handleCancelSubscription = () => {
        if (checkUserAgents()) {
            setShowDeleteAgentsModal(true);
        } else {
            let nextAction = "cancelConfirmationFromDeal";
            handleContinue(nextAction);
        }
    }

    // Function to handle delete agents and redirect
    const handleDeleteAgents = () => {
        setShowDeleteAgentsModal(false);
        window.location.href = 'http://localhost:3000/dashboard/myAgentX';
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
                    onClick={handleCancelSubscription}
                >
                    No Deal. Cancel Subscription
                </button>
            </div>

            {/* Delete Agents Modal */}
            <Modal
                open={showDeleteAgentsModal}
                onClose={() => setShowDeleteAgentsModal(false)}
                closeAfterTransition
                BackdropProps={{
                    timeout: 100,
                    sx: {
                        backgroundColor: "#00000020",
                    },
                }}
            >
                <Box
                    className="w-11/12 sm:w-8/12 md:w-6/12 lg:w-5/12 xl:w-4/12"
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'white',
                        borderRadius: '12px',
                        boxShadow: 24,
                        p: 0,
                        outline: 'none',
                    }}
                >
                    <div className="py-3 px-4">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-semibold text-gray-800">
                                
                            </h2>
                            <button
                                onClick={() => setShowDeleteAgentsModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <Image
                                    src="/assets/crossIcon.png"
                                    height={30}
                                    width={30}
                                    alt="Close"
                                />
                            </button>
                        </div>

                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            {/* <div className="w-16 h-16 bg-purple rounded-full flex items-center justify-center">
                                <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                                    <div className="w-4 h-4 bg-purple rounded-sm"></div>
                                </div>
                            </div> */}
                            <Image
                                    src="/assets/Pause_Icon.svg"
                                    height={40}
                                    width={40}
                                    alt="Close"
                                />
                        </div>

                        {/* Title */}
                        <div className="text-center mb-4">
                            <h3 className="text-xl font-semibold text-black mb-2">
                                Delete Your Agents
                            </h3>
                            {/* <div className="w-32 h-0.5 bg-blue-200 mx-auto"></div> */}
                        </div>

                        {/* Content */}
                        <div className="text-center mb-6">
                            <p className="text-gray-700 text-sm leading-relaxed">
                                {`To cancel your plan, you'll need to first delete your agents.`}
                            </p>
                            <p className="text-gray-700 text-sm leading-relaxed mt-2">
                                The free plan only allows for 1 AI Agent.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteAgentsModal(false)}
                                className="flex-1 h-12 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAgents}
                                className="flex-1 h-12 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </Box>
            </Modal>

        </div>
    )
}

export default ObtainOffer