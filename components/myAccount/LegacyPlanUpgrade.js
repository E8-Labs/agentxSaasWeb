import CloseBtn from '@/components/globalExtras/CloseBtn'
import UpgradePlan from '@/components/userPlans/UpgradePlan'
import { Box, Modal } from '@mui/material'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Image from 'next/image'
import React, { useState } from 'react'

function LeggacyPlanUpgrade({
    open,
    handleClose,
    plan,
    handleContinue,
    reduxUser,

}) {

    return (
        <div className='w-full'>
            <Modal
                open={open}
            // onClose={handleClose()}
            //     handleResetValues();
            //     handleClose("");
            // }}
            >
                {/*<Box className="bg-white rounded-xl p-6 max-w-md w-[95%] mx-auto mt-20 shadow-lg">*/}
                <Box className="bg-white h-auto overflow-auto rounded-xl w-11/12 sm:w-10/12 md:w-6/12 lg:w-4/12 xl:w-5/12 2xl:w-4/12 border-none outline-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-full ">
                        <div className='w-full flex flex-col items-center justify-center px-8 pt-4'>
                            <div className='w-full flex flex-row items-start justify-end'>
                                <CloseBtn
                                    onClick={
                                        () => {
                                            handleClose()
                                        }
                                    }
                                />
                            </div>
                            <Image className=''
                                src="/otherAssets/unlockAgents.png"
                                height={50}
                                width={300}
                                alt="Axel"
                            />

                            <div className="flex flex-row items-center -mt-10">
                                <div
                                    className="text-purple"
                                    style={{ fontSize: "29px", fontWeight: "700" }}
                                >
                                    Plan Upgrade Impact
                                </div>

                            </div>
                            <div className="mt-3 w-full text-center" style={{ fontSize: "16px", fontWeight: "400" }}>
                                {`Your selected plan allows you to use ${plan?.capabilities?.maxAgents} agents and ${plan?.capabilities?.maxTeamMembers} team seats.
                                     After upgrading to ${plan?.name || plan?.title}, you will loose access to ${reduxUser?.currentUsage?.maxAgents - plan?.capabilities?.maxAgents} agent(s) and ${reduxUser?.currentUsage?.maxTeamMembers - plan?.capabilities?.maxTeamMembers} team seat(s).
                                `}
                            </div>


                            <div
                                className="w-full h-[200px] flex flex-col items-center justify-end -mt-10"
                                style={{
                                    backgroundImage: "url('/otherAssets/gradientBg.png')",
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    // borderRadius:'20px'
                                }}
                            >
                                <div className='w-full flex flex-row items-center justify-between gap-4 mb-10'>
                                    <button className='w-1/2'
                                        style={{ fontSize: "15px", fontWeight: "500" }}
                                        onClick={
                                            () => {
                                                handleClose()
                                            }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="h-[54px] w-[50%] px-10 rounded-xl bg-purple text-white text-center flex flex-row items-center justify-center"
                                        style={{ fontSize: "15px", fontWeight: "500" }}
                                        onClick={() => {
                                            handleContinue()
                                        }}
                                    >
                                        Continue
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>



        </div>
    )
}

export default LeggacyPlanUpgrade