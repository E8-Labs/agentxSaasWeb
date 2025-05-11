import { Box, Modal } from '@mui/material'
import Image from 'next/image'
import React from 'react'

const SelectYearlypopup = ({
    showYearlyPlan,
    continueMonthly,
    continueYearlyPlan,
    handleClose
}) => {
    console.log("yearly plan is", showYearlyPlan);
    return (
        <Modal
            open={showYearlyPlan}
        >
            <Box className="max-w-lg outline-none border-none w-[100%] bg-white rounded-xl p-6 mx-auto mt-[15vh]">
                <div className='w-full'>
                    <div className='w-full flex flex-row items-center justify-between'>
                        <div style={{ fontWeight: "600", fontSize: 22 }}>
                            Pay less with annual billing
                        </div>
                        <button
                            className='outline-none border-none'
                            onClick={() => { handleClose() }}>
                            <Image
                                src={"/assets/crossIcon.png"}
                                alt='*'
                                height={40}
                                width={40}
                            />
                        </button>
                    </div>

                    <div className='flex flex-row items-start gap-2 w-full mt-4'>
                        <Image
                            src={"/agencyIcons/dollar.jpg"}
                            alt='*'
                            height={108}
                            width={108}
                        />
                        <div>
                            <div className='flex flex-row items-center gap-2'>
                                <div style={{ fontSize: 16, fontWeight: "600" }}>
                                    Subscribe to yearly plan
                                </div>
                                <div className='px-2 py-1 rounded-full bg-[#DEFCE9]'>
                                    2 months free
                                </div>
                            </div>
                            <div style={{ fontSize: 15, fontWeight: "500", color: "#00000060" }}>
                                All annual plans get 16% discount compared to monthly plans
                            </div>
                        </div>
                    </div>

                    <div className='w-full flex flex-row items-center gap-8 mt-4' style={{ fontSize: 15, fontWeight: "500" }}>
                        <button
                            className='outline-none border rounded-xl h-[55px] w-1/2'
                            onClick={continueYearlyPlan}>
                            Continue Yearly
                        </button>
                        <button
                            className='outline-none border-none bg-purple text-white rounded-xl h-[55px] w-1/2'
                            onClick={continueMonthly}>
                            Continue Monthly
                        </button>
                    </div>

                </div>
            </Box>
        </Modal>
    )
}

export default SelectYearlypopup
