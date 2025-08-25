import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

import Image from 'next/image';
import { CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useEffect } from 'react';

export default function AddMcpPopup({
    open,
    handleClose,
    handleAddMcp,
    addMcpLoader,
    setMcpName,
    setMcpUrl,
    setMcpDescription,
    mcpName, mcpUrl, mcpDescription }) {

    const [mcpUrlError, setMcpUrlError] = useState("");
    const [descriptionChars, setDescriptionChars] = useState("");

    //check the limit of description chars
    useEffect(() => {
        setDescriptionChars(mcpDescription?.length)
    }, [mcpDescription]);

    const handleMcpUrlChange = (e) => {
        const value = e.target.value;
        setMcpUrl(value);

        // Basic check for https and valid URL structure
        try {
            const url = new URL(value);
            if (url.protocol !== "https:") {
                setMcpUrlError("URL must start with https://");
            } else {
                setMcpUrlError("");
            }
        } catch (err) {
            if (value) {
                setMcpUrlError("Invalid URL format");
            } else {
                setMcpUrlError("");
            }
        }
    };
    return (
        <Modal
            open={open}
            onClose={handleClose}
            closeAfterTransition
            BackdropProps={{
                timeout: 1000,
                sx: {
                    backgroundColor: "#00000020",
                    // //backdropFilter: "blur(5px)",
                },
            }}
        >
            <Box className="w-4/12" sx={styles.modalsStyle}>
                <div className="flex flex-row justify-center w-full">
                    <div
                        className="w-full px-[30px] py-[20px]"
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "13px",
                        }}
                    >
                        <div className='w-full flex flex-row items-center justify-between'>
                            <div className='text-[17px] font-[600] text-black'>
                                Add Tool
                            </div>
                            <button onClick={handleClose} className='cursor-pointer px-3 py-3 rounded-full bg-[#00000005]'>
                                <Image src="/assets/cross.png" alt="close" width={15} height={15} />
                            </button>
                        </div>

                        <div className='w-full flex flex-col gap-2 mt-4'>

                            <div className='text-[15px] font-[500] text-black mt-2'>
                                Name
                            </div>

                            <input type="text" placeholder='Type here...'
                                value={mcpName}
                                onChange={(e) => setMcpName(e.target.value)}
                                className='w-full border focus:outline-none focus:ring-0 border-gray-300 rounded-md p-2' />

                            <div className='text-[15px] font-[500] text-black mt-3'>
                                Server URL
                            </div>
                            <input
                                type="text"
                                placeholder='Paste your mcp url here'
                                value={mcpUrl}
                                onChange={(e) => handleMcpUrlChange(e)}
                                className='w-full border border-gray-300 rounded-md p-2' />

                            {mcpUrlError && <div style={{ color: "red", fontSize: 12 }}>{mcpUrlError}</div>}

                            <div className='flex flex-row items-center w-full justify-between mt-3'>
                                <div className='text-[15px] font-[500] text-black'>
                                    Description
                                </div>

                                <div className='text-[14px] font-[400] text-black'>
                                    {mcpDescription?.length}/1000
                                </div>
                            </div>

                            <textarea
                                placeholder='Describe when the AI should use this'
                                value={mcpDescription}
                                onChange={(e) => setMcpDescription(e.target.value)}
                                maxLength={1000}
                                style={{
                                    fontSize: "15px",
                                    fontWeight: "500",
                                    height: "150px",
                                    border: "1px solid #00000020",
                                    resize: "none",
                                    borderRadius: "13px",
                                }}
                                className="w-full border focus:outline-none focus:ring-0 border-gray-300 rounded-md p-2" />

                            <div className='w-full flex flex-row items-center justify-between gap-8 mt-3'>
                                <button className='w-1/2 border text-black rounded-md p-2 h-[55px] text-[15px] font-[500]'
                                    onClick={handleClose}
                                >
                                    Cancel
                                </button>
                                {
                                    addMcpLoader ? (
                                        <CircularProgress size={20} />
                                    ) : (
                                        <button className='w-1/2 bg-purple text-white rounded-md p-2 h-[55px] text-[15px] font-[500]'
                                            onClick={handleAddMcp}
                                        >
                                            Add
                                        </button>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>

            </Box>
        </Modal>
    );
}


const styles = {

    modalsStyle: {
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
};