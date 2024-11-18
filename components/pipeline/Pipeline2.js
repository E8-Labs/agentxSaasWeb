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
import TagInput from '../test/TagInput';
import MentionsInputTest from '../test/MentionsInput';
import Objection from './advancedsettings/Objection';
import GuardianSetting from './advancedsettings/GuardianSetting';
import KYCs from './KYCs';

const Pipeline2 = ({ handleContinue, handleBack }) => {

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [kycsData, setKycsData] = useState(null);
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    //variables for advance setting variables
    const [advancedSettingModal, setAdvancedSettingModal] = useState(false);
    const [settingToggleClick, setSettingToggleClick] = useState(1);


    const handleAdvanceSettingToggleClick = (id) => {
        setSettingToggleClick(prevId => (prevId === id ? null : id));
    }

    

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

            const ApiPath = `${Apis.getKYCs}?mainAgentId=${MainAgentData}`;
            console.log("Api path is :--", ApiPath);
            const ApiData = {
                mainAgentId: MainAgentData
            }

            console.log("Main agent id is :", ApiData);
            // return
            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of get kycs api is :--", response);
                const filteredSellerQuestions = response.data.data.filter(item => item.type === 'seller');
                const filteredBuyerQuestions = response.data.data.filter(item => item.type === 'buyer');
                console.log("Seler kycs are :=--", filteredSellerQuestions);
                console.log("Buyer Kycs are :--", filteredBuyerQuestions);
            } else {
                console.log("No data found")
            }
        } catch (error) {
            console.error("Error occured in gett kyc api is :--", error);
        } finally {
            console.log("Get kycs api call completed");
        }

    }

    const advanceSettingType = [
        {
            id: 1,
            title: "Objection"
        },
        {
            id: 2,
            title: "Guardrails"
        }
    ]

    // useEffect(() => {
    //     getKyc()
    // }, [])


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
        modalsStyle: {
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

                            {/* <input
                                className='border p-2 rounded-lg outline-none bg-transparent'
                                placeholder="Hey {name}, It's {Agent Name} with {Brokerage Name}! How's it going?"
                            /> */}
                            <TagInput />
                            {/* <MentionsInputTest /> */}

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
                                    }}
                                    onClick={() => { setAdvancedSettingModal(true) }}
                                >
                                    Advanced Settings
                                </button>
                            </div>
                            <KYCs />
                        </div>
                    </div>
                </div>

                {/* Modals code goes here */}
                <Modal
                    open={advancedSettingModal}
                    onClose={() => setAdvancedSettingModal(false)}
                    closeAfterTransition
                    BackdropProps={{
                        timeout: 1000,
                        sx: {
                            backgroundColor: "#00000020",
                            // backdropFilter: "blur(20px)",
                        },
                    }}
                >
                    <Box className="lg:w-5/12 sm:w-full w-8/12" sx={styles.modalsStyle}>
                        <div className="flex flex-row justify-center w-full">
                            <div
                                className="sm:w-7/12 w-full"
                                style={{
                                    backgroundColor: "#ffffff",
                                    padding: 20,
                                    borderRadius: "13px",
                                }}
                            >
                                <div className='flex flex-row justify-end'>
                                    <button onClick={() => { setAdvancedSettingModal(false) }}>
                                        <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                                    </button>
                                </div>
                                <div className='text-center mt-2' style={{ fontWeight: "700", fontSize: 24 }}>
                                    Advance Settings
                                </div>

                                <div className='flex flex-col items-center gap-2'>
                                    <div className='flex flex-row items-center gap-10 mt-10'>
                                        {
                                            advanceSettingType.map((item, index) => (
                                                <button key={item.id} style={{ ...styles.inputStyle, color: item.id === settingToggleClick ? "#402FFF" : "" }} onClick={(e) => { handleAdvanceSettingToggleClick(item.id) }}>
                                                    {item.title}
                                                </button>
                                            ))
                                        }
                                    </div>
                                    <div>
                                        {
                                            settingToggleClick === 1 ?
                                                (
                                                    <Image src={"/assets/objectionSetting.png"} height={5} width={200} alt='*' />
                                                ) :
                                                settingToggleClick === 2 ?
                                                    (
                                                        <Image src={"/assets/motivationSetting.png"} height={5} width={200} alt='*' />
                                                    ) : ""
                                        }
                                    </div>
                                </div>

                                <div className='w-full'>
                                    {
                                        settingToggleClick === 1 ?
                                            (
                                                <Objection />
                                            ) :
                                            settingToggleClick === 2 ?
                                                (
                                                    <GuardianSetting />
                                                ) : ""
                                    }
                                </div>


                                {/* Can be use full to add shadow */}
                                {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                            </div>
                        </div>
                    </Box>
                </Modal>

                <div>
                    <div>
                        <ProgressBar value={33} />
                    </div>

                    <Footer handleContinue={handleContinue} handleBack={handleBack} />
                </div>
            </div>
        </div>
    )
}

export default Pipeline2