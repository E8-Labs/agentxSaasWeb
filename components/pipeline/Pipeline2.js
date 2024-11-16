import Body from '@/components/onboarding/Body';
import Header from '@/components/onboarding/Header';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Footer from '@/components/onboarding/Footer';
import { Box, FormControl, MenuItem, Modal, Popover, Select, TextField } from '@mui/material';
import { CaretDown, DotsThree } from '@phosphor-icons/react';
import Apis from '../apis/Apis';
import axios from 'axios';

const Pipeline2 = ({ handleContinue }) => {

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [kycsData, setKycsData] = useState(null);

    const handleOpenPopover = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
    };

    const getKyc = async () => {

        try {
            let AuthToken = null;
            const localData = localStorage.getItem("User");
            if (localData) {
                const Data = JSON.parse(localData);
                console.log("Localdat recieved is :--", Data);
                AuthToken = Data.token;
            }

            let MainAgentData = null;
            const mainAgentData = localStorage.getItem("agentDetails");
            if (mainAgentData) {
                const Data = JSON.parse(mainAgentData);
                console.log("Localdat recieved is :--", Data);
                MainAgentData = Data.id;
            }

            console.log("Auth token is :--", AuthToken);

            const ApiPath = Apis.getKYCs;
            console.log("Api path is :--", ApiPath);
            const ApiData = {
                mainAgentId: MainAgentData
            }

            console.log("Main agent id is :", ApiData);
            // return
            const response = await axios.get(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of get kycs api is :--", response);
            }
        } catch (error) {
            console.error("Error occured in gett kyc api is :--", error);
        } finally {
            console.log("api call completed")
        }

    }

    useEffect(() => {
        getKyc()
    }, [])

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const styles = {
        headingStyle: {
            fontSize: 16,
            fontWeight: "700"
        },
        inputStyle: {
            fontSize: 15,
            fontWeight: "500"
        },
        dropdownMenu: {
            fontSize: 15,
            fontWeight: "500",
            color: "#00000070"
        },
        AddNewKYCQuestionModal: {
            height: "auto",
            bgcolor: "transparent",
            // p: 2,
            mx: "auto",
            my: "50vh",
            transform: "translateY(-55%)",
            borderRadius: 2,
            border: "none",
            outline: "none",
        },
    }

    return (
        <div style={{ width: "100%" }} className="overflow-y-hidden flex flex-row justify-center items-center">
            <div className='bg-gray-100 rounded-lg w-10/12 h-[90vh] py-4 overflow-auto flex flex-col justify-between'>
                <div>
                    {/* header */}
                    <Header />
                    {/* Body */}
                    <div className='flex flex-col items-center px-4 w-full'>
                        <div className='mt-6 w-11/12 md:text-4xl text-lg font-[700]' style={{ textAlign: "center" }}>
                            Let's Review
                        </div>
                        <div className='mt-8 w-7/12 gap-4 flex flex-col max-h-[50vh] overflow-auto'>
                            <div style={styles.inputStyle} className='flex flex-row items-center gap-2'>
                                <Image src={"/assets/lightBulb.png"} alt='*' height={24} width={24} />  Editing Tips
                            </div>
                            <div style={styles.inputStyle}>
                                You can use these variables: <span className='text-purple'>{`{name}`}, {`{column names}`} </span>
                            </div>
                            <div>
                                <button className='flex flex-row items-center gap-4'>
                                    <Image src={"/assets/youtubeplay.png"} height={36} width={36} alt='*' style={{ borderRadius: "7px" }} />
                                    <div style={styles.inputStyle} className='underline'>
                                        Learn how to customize your script
                                    </div>
                                </button>
                            </div>
                            <div style={{ fontSize: 24, fontWeight: "700" }}>
                                {`{Anna's}`} Script
                            </div>
                            <div style={styles.headingStyle}>
                                Greeting
                            </div>

                            <input
                                className='border p-2 rounded-lg outline-none bg-transparent'
                                placeholder="Hey {name}, It's {Agent Name} with {Brokerage Name}! How's it going?"
                            />

                        </div>
                        <div className='w-7/12 mt-4 ps-8'>
                            <div style={styles.headingStyle}>
                                Call Script
                            </div>
                            <div className='mt-6'>
                                <TextField
                                    placeholder="Call script here"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    minRows={4}
                                    maxRows={5}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                border: "1px solid #00000060"
                                            },
                                            '&:hover fieldset': {
                                                border: "1px solid #00000060"
                                            },
                                            '&.Mui-focused fieldset': {
                                                border: "1px solid #00000060"
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>
                        <div className='w-7/12 mt-4'>
                            <div className='flex flex-row justify-end mt-4'>
                                <button className='text-purple underline'
                                    style={{
                                        fontSize: 15,
                                        fontWeight: "700"
                                    }}>
                                    Advanced Settings
                                </button>
                            </div>
                            <div style={styles.headingStyle} className='mt-4'>
                                KYC - Seller
                            </div>
                            <div className='border p-2 rounded-lg p-4 w-full mt-4'>
                                <div className='flex flex-row items-center justify-between w-full'>
                                    <div style={styles.inputStyle}>
                                        Title
                                    </div>
                                    <div className='flex flex-row items-center gap-2'>
                                        <div className='border flex flex-row items-center justify-center' style={{ height: "20px", width: "18px", fontSize: 12, fontWeight: "700", borderRadius: "50%" }}>
                                            2
                                        </div>
                                        <button>
                                            <CaretDown size={25} weight='bold' />
                                        </button>
                                    </div>
                                </div>

                                <div className='mt-4'>
                                    <div className='flex flex-row items-center justify-between mt-4'>
                                        <div>
                                            What's your primary motivation for selling now rather than waiting?
                                        </div>
                                        <button aria-describedby={id} onClick={handleOpenPopover}>
                                            <DotsThree size={35} weight='bold' />
                                        </button>
                                        <Popover
                                            id={id}
                                            open={open}
                                            anchorEl={anchorEl}
                                            onClose={handleClosePopover}
                                            anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'right',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right', // Ensures the Popover's top right corner aligns with the anchor point
                                            }}
                                        >
                                            <button className='p-2 flex flex-row items-center gap-2'>
                                                <Image src={"/assets/delIcon.png"} height={16} width={16} alt='*' />
                                                <div className='text-red' style={styles.inputStyle}>Delete</div>
                                            </button>
                                        </Popover>
                                    </div>
                                    <div className='underline text-purple' style={styles.inputStyle}>
                                        Add Question
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div>
                        <ProgressBar value={33} />
                    </div>

                    <Footer handleContinue={handleContinue} donotShowBack={true} />
                </div>
            </div>
        </div>
    )
}

export default Pipeline2