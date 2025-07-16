import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import CircularProgress from '@mui/material/CircularProgress';

import Image from 'next/image';

export default function EditMcpPopup({ open, handleClose,
    selectedMcpTool,
    setShowEditMcpPopup,
    setMcpName,
    setMcpUrl,
    setMcpDescription,
    mcpName,
    mcpUrl,
    mcpDescription,
    editMcpLoader,
    handleEditMcp,
    handleDeleteMcp,
    deleteMcpLoader
}) {



    useEffect(() => {
        const updateMcpTool = async () => {
            console.log("Selected MCP tool is", selectedMcpTool);
            if (selectedMcpTool) {
                setMcpName(selectedMcpTool.name);
                setMcpUrl(selectedMcpTool.url);
                setMcpDescription(selectedMcpTool.description);
            }
        }
        updateMcpTool();
    }, [selectedMcpTool]);

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
            <Box className="w-5/12" sx={styles.modalsStyle}>
                <div className="flex flex-row justify-center w-full">
                    <div
                        className="w-full"
                        style={{
                            backgroundColor: "#ffffff",
                            padding: 30,
                            borderRadius: "13px",
                        }}
                    >
                        <div className='w-full flex flex-row items-center justify-between'>
                            <div className='text-[17px] font-[500] text-black'>
                                Edit MCP
                            </div>
                            <button onClick={() => setShowEditMcpPopup(false)}>
                                <Image src="/assets/cross.png" alt="close" width={20} height={20} />
                            </button>
                        </div>

                        <div className='w-full flex flex-col gap-2'>

                            <div className='text-[15px] font-[500] text-black'>
                                Name
                            </div>

                            <input type="text" placeholder='Type here...'
                                value={mcpName}
                                onChange={(e) => setMcpName(e.target.value)}
                                className='w-full border focus:outline-none focus:ring-0 border-gray-300 rounded-md p-2' />

                            <div className='text-[15px] font-[500] text-black'>
                                URL
                            </div>

                            <input
                                type="text"
                                placeholder='Paste your mcp url here'
                                value={mcpUrl}
                                onChange={(e) => setMcpUrl(e.target.value)}
                                className='w-full border border-gray-300 rounded-md p-2' />

                            <div className='text-[15px] font-[500] text-black'>
                                Description
                            </div>

                            <textarea
                                placeholder='Type here...'
                                style={{
                                    fontSize: "15px",
                                    fontWeight: "500",
                                    height: "150px",
                                    border: "1px solid #00000020",
                                    resize: "none",
                                    borderRadius: "13px",
                                }}
                                value={mcpDescription}
                                onChange={(e) => setMcpDescription(e.target.value)}
                                className="w-full border focus:outline-none focus:ring-0 border-gray-300 rounded-md p-2" />

                            <div className='w-full flex flex-row items-center justify-between gap-4 mt-4'>
                                {
                                    deleteMcpLoader ? (
                                        <CircularProgress size={20} />
                                    ) : (
                                        <button className='w-1/2 border text-black rounded-md p-2 h-[55px]'
                                            onClick={handleDeleteMcp}
                                        >
                                            Delete
                                        </button>
                                    )
                                }
                                {
                                    editMcpLoader ? (
                                        <CircularProgress size={20} />
                                    ) : (
                                        <button className='w-1/2 bg-purple text-white rounded-md p-2 h-[55px]'
                                            onClick={handleEditMcp}
                                        >
                                            Save
                                        </button>
                                    )
                                }

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