import React from 'react';
import { Modal, Box, CircularProgress } from '@mui/material';
import Image from 'next/image';
import CloseBtn from '../globalExtras/CloseBtn';

const YearlyPlanModal = ({ open, handleClose, onContinueYearly, onContinueMonthly, selectedDuration = null, loading = false }) => {
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
                        <div className="text-2xl font-bold text-black">
                            Pay less with annual billing
                        </div>
                        <CloseBtn
                            onClick={handleClose}
                        />
                    </div>

                    {/* Plan Offer Section */}
                    <div className="flex items-center gap-4 mb-8">
                        {/* Icon */}
                        <div className="w-16 h-16 rounded-lg border border-gray-200 bg-white flex items-center justify-center flex-shrink-0">
                            <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center">
                                <span className="text-black font-bold text-xl">$</span>
                            </div>
                        </div>

                        {/* Offer Details */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-lg font-bold text-black">
                                    Subscribe to yearly plan
                                </span>
                                <div className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap">
                                    2 months free
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">
                                {`All annual plans get 35% discount compared to ${selectedDuration ? selectedDuration.title : "monthly"} plans`}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-row gap-3">
                        <button
                            onClick={onContinueYearly}
                            className="w-full bg-purple text-white py-3 px-6 rounded-xl font-semibold text-base hover:bg-purple-700 transition-colors"
                        >
                            Continue Yearly
                        </button>
                        {
                            loading ? (
                                <CircularProgress />
                            ) : (
                                <button
                                    onClick={onContinueMonthly}
                                    className="w-full bg-white border border-gray-300 text-black py-3 px-6 rounded-xl font-semibold text-base hover:bg-gray-50 transition-colors"
                                >
                                    {`Continue ${selectedDuration ? selectedDuration.title : "Monthly"}`}
                                </button>
                            )
                        }
                    </div>
                </div>
            </Box>
        </Modal>
    );
};

export default YearlyPlanModal;
