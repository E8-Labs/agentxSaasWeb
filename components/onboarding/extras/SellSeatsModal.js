import { Box, Modal } from '@mui/material'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

const SellSeatsModal = ({
    showModal,
    closeModal,
    seats
}) => {

    const [seatsPrice, setSeatsPrice] = useState("");

    useEffect(() => {
        // console.log("setting seats are", seats);
        if (seats) {
            setSeatsPrice(seats);
        }
    }, [seats]);

    const handleClose = () => {
        if (seats) {
            closeModal(seatsPrice);
            console.log("Modal close with sending seats");
        } else {
            closeModal();
            console.log("Modal close without sending seats");
        }
        // setSeatsPrice("");
    }

    //styles
    const styles = {
        heading: {
            fontWeight: "600",
            fontSize: 22
        },
        subheading: {
            fontWeight: "500",
            fontSize: 15
        },
        button: {
            fontWeight: "600",
            fontSize: 17
        },
    }

    return (
        <Modal open={showModal} onClose={() => { 
            handleClose();
            setSeatsPrice("");
        }}>
            {/*<Box className="bg-white rounded-xl p-6 max-w-md w-[95%] mx-auto mt-20 shadow-lg">*/}
            <Box
                className="bg-white rounded-xl p-6 max-w-md w-[95%] max-h-[90vh] border-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col">
                <div className='w-full'>
                    <div className='flex flex-row items-center justify-between w-full'>
                        <div style={styles.heading}>
                            Sell Seats
                        </div>
                        <button
                            onClick={() => { handleClose() }}
                        >
                            <Image
                                src={"/assets/cross.png"}
                                alt='*'
                                height={13}
                                width={13}
                            />
                        </button>
                    </div>
                    <div style={styles.subheading} className='mt-8'>
                        Amount per month
                    </div>
                    <div className='border border-gray-200 rounded px-2 py-0 mt-2 flex flex-row items-center w-full'>
                        <div className='' style={styles.subheading}>
                            $
                        </div>
                        <input
                            style={styles.subheading}
                            type="number"
                            className="w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none"
                            placeholder="00"
                            value={seatsPrice}
                            onChange={(e) => {
                                setSeatsPrice(e.target.value);
                            }}
                        />
                    </div>
                    <div className='w-full flex flex-row items-center mt-6'>
                        <button
                            className='w-1/2 text-center text-purple'
                            style={styles.button}
                            onClick={() => {
                                handleClose();
                                // setSeatsPrice("");
                            }}
                        >
                            Cancel
                        </button>
                        <div className='w-1/2 flex flex-row items-center justify-end pe-2'>
                            <button
                                className='h-[50px] w-8/12 bg-purple text-white rounded-lg'
                                style={styles.button}
                                onClick={() => {
                                    closeModal(seatsPrice);
                                    setSeatsPrice("");
                                }}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </Box>
        </Modal>
    )
}

export default SellSeatsModal;
