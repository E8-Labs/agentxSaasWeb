import { Box, CircularProgress, Modal } from '@mui/material';
import React, { useState } from 'react';
import Image from 'next/image';
import CloseBtn from './CloseBtn';
import { PersistanceKeys } from '@/constants/Constants';

const AgencyLinkWarning = ({
    open,
    handleClose,
    linkCopied,
    handleCopyLink,
    userData,
    agencyOnboardingLink
}) => {

    const [confirmChecked, setConfirmChecked] = useState(false);

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
                <div className="bg-white rounded-2xl p-6 max-w-lg w-[90%] relative shadow-2xl">
                    <div className='flex flex-row justify-between items-center w-full'>
                        <div style={styles.heading}>Heads up</div>
                        <CloseBtn
                            onClick={handleClose}
                        />
                    </div>
                    <div
                        className="mt-4"
                        style={styles.subHeading}
                    >
                        {`If your subaccount limit exceeds your account will automatically be upgraded to the next plan to prevent service interruptions.`}
                    </div>
                    {
                        agencyOnboardingLink ? (
                            <div className="w-full mt-4 flex flex-row justify-center items-center">
                                <CircularProgress size={25} />
                            </div>
                        ) : (
                            <div className="w-full">
                                <div className='flex flex-row items-center w-full justify-start mt-4 gap-2'>
                                    <button onClick={() => {
                                        setConfirmChecked(!confirmChecked)
                                    }}>
                                        {confirmChecked ? (
                                            <div
                                                className="bg-purple flex flex-row items-center justify-center rounded"
                                                style={{ height: "17px", width: "17px" }}
                                            >
                                                <Image
                                                    src={"/assets/whiteTick.png"}
                                                    height={6}
                                                    width={8}
                                                    alt="*"
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className="bg-none border-2 flex flex-row items-center justify-center rounded"
                                                style={{ height: "17px", width: "17px" }}
                                            ></div>
                                        )}
                                    </button>

                                    <button
                                        className='text-xs font-normal'
                                        onClick={() => { window.open(PersistanceKeys.CopyLinkTerms, "_blank") }}
                                    >
                                        I agree to <span className='text-purple underline ms-1'>Terms and Conditions</span>.
                                    </button>
                                </div>
                                <button
                                    className={`${confirmChecked ? "bg-purple" : "bg-btngray"} ${confirmChecked ? "text-white" : "text-black"} px-4 h-[40px] rounded-lg mt-4 w-full`}
                                    onClick={handleCopyLink}
                                    disabled={!confirmChecked}
                                >
                                    {linkCopied ? "Link Copied" : "Copy Link"}
                                </button>
                            </div>
                        )
                    }
                </div>
            </Box>
        </Modal>
    )
}

export default AgencyLinkWarning;

const styles = {
    heading: {
        fontSize: 20,
        fontWeight: 600,
        color: "#000000",
    },
    subHeading: {
        fontSize: 16,
        fontWeight: 400,
        color: "#000000",
    },
}