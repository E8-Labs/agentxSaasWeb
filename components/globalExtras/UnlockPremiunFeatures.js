import { Box, Modal } from '@mui/material'
import React from 'react'
import CloseBtn from './CloseBtn'
import Image from 'next/image'

const UnlockPremiunFeatures = () => {
    return (
        <Modal
            open={open}
            onClose={handleClose}
            closeAfterTransition
            BackdropProps={{
                timeout: 100,
                sx: {
                    backgroundColor: "#00000040",
                    backdropFilter: "blur(10px)",
                },
            }}
        >
            <Box className="flex justify-center items-center w-full h-full">
                <div className="bg-white rounded-2xl p-8 max-w-lg w-[90%] relative shadow-2xl">
                    {/* Header with Title and Close Button */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-black text-2xl font-bold">
                            {title || "Unlock Premium Features"}
                        </div>
                        <CloseBtn
                            onClick={() => { console.log("This is close button") }}
                        />
                    </div>

                    {/* Plan Offer Section */}
                    <div className="flex items-center gap-4 mb-8">
                        {/* Icon */}
                        <Image src={"/otherAssets/premiumFeatures.png"} alt="premium-feature" width={107} height={107} />
                        <div className="text-md text-gray-600">
                            {description || "This feature is only available on premium plans. Your agency will need to enable this for you. You can request this below."}
                        </div>
                    </div>

                    {/* Action Buttons */}

                    <button
                        // onClick={onContinueMonthly}
                        className="w-full bg-purple text-white py-3 px-6 rounded-xl text-[15px] font-bold transition-colors"
                    >
                        Request Feature
                    </button>
                </div>
            </Box>
        </Modal>
    )
}

export default UnlockPremiunFeatures