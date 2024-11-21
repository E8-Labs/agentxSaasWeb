import { Box, Modal, Popover } from '@mui/material'
import { CaretDown, CaretUp, DotsThree } from '@phosphor-icons/react'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Apis from '../apis/Apis'
import AddSellerKyc from './AddSellerKyc'
import AddBuyerKyc from './AddBuyerKyc'

const KYCs = ({ kycsDetails }) => {

    const [anchorEl, setAnchorEl] = useState(null);
    const [BuyerAnchor, setBuyerAnchor] = useState(null);
    const [kycsData, setKycsData] = useState(null);
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const openBuyerKyc = Boolean(BuyerAnchor);
    const buyerId = openBuyerKyc ? 'buyer-popover' : undefined;
    const [selectedKyc, setSelectedKyc] = useState(null);

    //seller kyc data
    const [SellerNeedData, setSellerNeedData] = useState([]);
    const [showSellerNeedData, setShowSellerNeedData] = useState(false);
    const [SellerMotivationData, setSellerMotivationData] = useState([]);
    const [showSellerMotivationData, setShowSellerMotivationData] = useState(false);
    const [SellerUrgencyData, setSellerUrgencyData] = useState([]);
    const [showSellerUrgencyData, setShowSellerUrgencyData] = useState(false);
    const [addSellerKyc, setAddSellerKyc] = useState(false);

    //buyer kyc data
    const [BuyerNeedData, setBuyerNeedData] = useState([]);
    const [showBuyerNeedData, setShowBuyerNeedData] = useState(false);
    const [BuyerMotivationData, setBuyerMotivationData] = useState([]);
    const [showBuyerMotivationData, setShowBuyerMotivationData] = useState(false);
    const [BuyerUrgencyData, setBuyerUrgencyData] = useState([]);
    const [showBuyerUrgencyData, setShowBuyerUrgencyData] = useState(false);
    const [addBuyerKyc, setAddBuyerKyc] = useState(false);

    //popover code here
    const handleOpenPopover = (event, item) => {
        setAnchorEl(event.currentTarget);
        setSelectedKyc(item);
    };

    const handleOpenBuyerKycPopover = (event) => {
        setBuyerAnchor(event.currentTarget);
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
        setBuyerAnchor(null);
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
                kycsDetails(response.data.data)
                const filteredSellerQuestions = response.data.data.filter(item => item.type === 'seller');
                const filteredBuyerQuestions = response.data.data.filter(item => item.type === 'buyer');
                console.log("Seler kycs are :=--", filteredSellerQuestions);
                console.log("Buyer Kycs are :--", filteredBuyerQuestions);
                //code for seller kyc questions
                const filteredSellerNeedQuestions = filteredSellerQuestions.filter(item => item.category === 'need');
                const filteredSellerMotivationQuestions = filteredSellerQuestions.filter(item => item.category === 'motivation');
                const filteredSellerUrgencyQuestions = filteredSellerQuestions.filter(item => item.category === 'urgency');
                console.log("Need kycs are :--", filteredSellerNeedQuestions);
                setSellerNeedData(filteredSellerNeedQuestions);
                console.log("Motivation KYCs are :--", filteredSellerMotivationQuestions);
                setSellerMotivationData(filteredSellerMotivationQuestions);
                console.log("Urgency kycs are :---", filteredSellerUrgencyQuestions);
                setSellerUrgencyData(filteredSellerUrgencyQuestions);
                //code for buyer kyc questions
                const filteredBuyerNeedQuestions = filteredBuyerQuestions.filter(item => item.category === 'need');
                const filteredBuyerMotivationQuestions = filteredBuyerQuestions.filter(item => item.category === 'motivation');
                const filteredBuyerUrgencyQuestions = filteredBuyerQuestions.filter(item => item.category === 'urgency');
                console.log("BuyerNeed kycs are :--", filteredSellerNeedQuestions);
                setBuyerNeedData(filteredBuyerNeedQuestions);
                console.log("BuyerMotivation KYCs are :--", filteredBuyerMotivationQuestions);
                setBuyerMotivationData(filteredBuyerMotivationQuestions);
                console.log("BuyerUrgency kycs are :---", filteredBuyerUrgencyQuestions);
                setBuyerUrgencyData(filteredBuyerUrgencyQuestions);

            } else {
                console.log("No data found")
            }
        } catch (error) {
            console.error("Error occured in gett kyc api is :--", error);
        } finally {
            console.log("Get kycs api call completed");
        }

    }

    useEffect(() => {
        getKyc()
    }, []);

    //close add seller kyc modal
    const handleCloseSellerKyc = () => {
        setAddSellerKyc(false);
        setAddBuyerKyc(false);
    }

    //getadd seller kyc data
    const handleAddSellerKycData = (data) => {
        console.log("Data added in new kyc is :--", data);
        const categories = data[0].category;
        console.log("Categgory is :", categories);
        if (categories === "need") {
            setSellerNeedData([...SellerNeedData, ...data]);
        } else if (categories === "motivation") {
            setSellerMotivationData([...SellerMotivationData, ...data]);
        } else if (categories === "urgency") {
            setSellerUrgencyData([...SellerUrgencyData, ...data]);
        }
    }

    //getadd buyer kyc data
    const handleAddBuyerKycData = (data) => {
        console.log("Data added in new kyc is :--", data);
        const categories = data[0].category;
        console.log("Categgory is :", categories);
        if (categories === "need") {
            setBuyerNeedData([...BuyerNeedData, ...data]);
        } else if (categories === "motivation") {
            setBuyerMotivationData([...BuyerMotivationData, ...data]);
        } else if (categories === "urgency") {
            setBuyerUrgencyData([...BuyerUrgencyData, ...data]);
        }
    }



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
        <div>
            <div style={styles.headingStyle} className='mt-4'>
                KYC - Seller
            </div>
            <div className='border p-2 rounded-lg p-4 w-full mt-4'>
                <div className='flex flex-row items-center justify-between w-full'>
                    <div style={styles.inputStyle}>
                        Need
                    </div>
                    <div className='flex flex-row items-center gap-2'>
                        <div className='border flex flex-row items-center justify-center' style={{ height: "20px", width: "18px", fontSize: 12, fontWeight: "700", borderRadius: "50%" }}>
                            {SellerNeedData?.length}
                        </div>
                        <button onClick={() => { setShowSellerNeedData(!showSellerNeedData) }}>
                            {
                                showSellerNeedData ?
                                    <CaretUp size={25} weight='bold' /> :
                                    <CaretDown size={25} weight='bold' />
                            }
                        </button>
                    </div>
                </div>

                {
                    showSellerNeedData && (
                        <div>
                            {
                                SellerNeedData.map((item, index) => (
                                    <div key={index} className='mt-4'>
                                        <div className='flex flex-row items-center justify-between mt-4'>
                                            <div style={styles.inputStyle}>
                                                {item.question}
                                            </div>
                                            <button aria-describedby={id} onClick={(event) => { handleOpenPopover(event, item) }}>
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
                                                PaperProps={{
                                                    elevation: 0, // This will remove the shadow
                                                    style: {
                                                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.05)',
                                                    },
                                                }}
                                            >
                                                <button className='p-2 flex flex-row items-center gap-2'>
                                                    <Image src={"/assets/delIcon.png"} height={16} width={16} alt='*' />
                                                    <div className='text-red' style={styles.inputStyle}>Delete</div>
                                                </button>
                                            </Popover>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )
                }

                <div className='underline text-purple mt-4' style={styles.inputStyle} onClick={() => { setAddSellerKyc(true) }}>
                    Add Question
                </div>

            </div>

            <div className='border p-2 rounded-lg p-4 w-full mt-4'>
                <div className='flex flex-row items-center justify-between w-full'>
                    <div style={styles.inputStyle}>
                        Motivation
                    </div>
                    <div className='flex flex-row items-center gap-2'>
                        <div className='border flex flex-row items-center justify-center' style={{ height: "20px", width: "18px", fontSize: 12, fontWeight: "700", borderRadius: "50%" }}>
                            {SellerMotivationData?.length}
                        </div>
                        <button onClick={() => { setShowSellerMotivationData(!showSellerMotivationData) }}>
                            {
                                showSellerMotivationData ?
                                    <CaretUp size={25} weight='bold' /> :
                                    <CaretDown size={25} weight='bold' />
                            }
                        </button>
                    </div>
                </div>

                {
                    showSellerMotivationData && (
                        <div>
                            {
                                SellerMotivationData.map((item, index) => (
                                    <div key={index} className='mt-4'>
                                        <div className='flex flex-row items-center justify-between mt-4'>
                                            <div style={styles.inputStyle}>
                                                {item.question}
                                            </div>
                                            <button aria-describedby={id} onClick={(event) => { handleOpenPopover(event, item) }}>
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
                                                PaperProps={{
                                                    elevation: 0, // This will remove the shadow
                                                    style: {
                                                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.05)',
                                                    },
                                                }}
                                            >
                                                <button className='p-2 flex flex-row items-center gap-2'>
                                                    <Image src={"/assets/delIcon.png"} height={16} width={16} alt='*' />
                                                    <div className='text-red' style={styles.inputStyle}>Delete</div>
                                                </button>
                                            </Popover>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )
                }

                <div className='underline text-purple mt-4' style={styles.inputStyle} onClick={() => { setAddSellerKyc(true) }}>
                    Add Question
                </div>

            </div>

            <div className='border p-2 rounded-lg p-4 w-full mt-4'>
                <div className='flex flex-row items-center justify-between w-full'>
                    <div style={styles.inputStyle}>
                        Urgency
                    </div>
                    <div className='flex flex-row items-center gap-2'>
                        <div className='border flex flex-row items-center justify-center' style={{ height: "20px", width: "18px", fontSize: 12, fontWeight: "700", borderRadius: "50%" }}>
                            {SellerUrgencyData?.length}
                        </div>
                        <button onClick={() => { setShowSellerUrgencyData(!showSellerUrgencyData) }}>
                            {
                                showSellerUrgencyData ?
                                    <CaretUp size={25} weight='bold' /> :
                                    <CaretDown size={25} weight='bold' />
                            }
                        </button>
                    </div>
                </div>

                {
                    showSellerUrgencyData && (
                        <div>
                            {
                                SellerUrgencyData.map((item, index) => (
                                    <div key={index} className='mt-4'>
                                        <div className='flex flex-row items-center justify-between mt-4'>
                                            <div style={styles.inputStyle}>
                                                {item.question}
                                            </div>
                                            <button aria-describedby={id} onClick={(event) => { handleOpenPopover(event, item) }}>
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
                                                PaperProps={{
                                                    elevation: 0, // This will remove the shadow
                                                    style: {
                                                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.05)',
                                                    },
                                                }}
                                            >
                                                <button className='p-2 flex flex-row items-center gap-2'>
                                                    <Image src={"/assets/delIcon.png"} height={16} width={16} alt='*' />
                                                    <div className='text-red' style={styles.inputStyle}>Delete</div>
                                                </button>
                                            </Popover>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )
                }

                <div className='underline text-purple mt-4' style={styles.inputStyle} onClick={() => { setAddSellerKyc(true) }}>
                    Add Question
                </div>

            </div>

            {/* <div className='underline text-purple mt-4' style={styles.inputStyle} onClick={() => { setAddSellerKyc(true) }}>
                Add Question
            </div> */}

            {/* Code to add seller kyc */}
            {/* Modals code goes here */}
            <Modal
                open={addSellerKyc}
                onClose={() => setAddSellerKyc(false)}
                closeAfterTransition
                BackdropProps={{
                    timeout: 1000,
                    sx: {
                        backgroundColor: "#00000020",
                        backdropFilter: "blur(20px)",
                    },
                }}
            >
                <Box className="sm:w-10/12 w-10/12 max-h-[70vh] overflow-auto" sx={styles.modalsStyle}>
                    <div className="flex flex-row justify-center w-full">
                        <div
                            className="sm:w-10/12 w-full"
                            style={{
                                backgroundColor: "#ffffff",
                                padding: 20,
                                borderRadius: "13px",
                            }}
                        >
                            <div className='flex flex-row justify-end'>
                                <button onClick={() => { setAddSellerKyc(false) }}>
                                    <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                                </button>
                            </div>

                            <AddSellerKyc handleCloseSellerKyc={handleCloseSellerKyc} handleAddSellerKycData={handleAddSellerKycData} />


                            {/* Can be use full to add shadow */}
                            {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                        </div>
                    </div>
                </Box>
            </Modal>

            {/* code for buyer kys */}

            <div style={styles.headingStyle} className='mt-4'>
                KYC - Buyer
            </div>

            <div className='border p-2 rounded-lg p-4 w-full mt-4'>
                <div className='flex flex-row items-center justify-between w-full'>
                    <div style={styles.inputStyle}>
                        Need
                    </div>
                    <div className='flex flex-row items-center gap-2'>
                        <div className='border flex flex-row items-center justify-center' style={{ height: "20px", width: "18px", fontSize: 12, fontWeight: "700", borderRadius: "50%" }}>
                            {BuyerNeedData.length}
                        </div>
                        <button onClick={() => { setShowBuyerNeedData(!showBuyerNeedData) }}>
                            {
                                showBuyerNeedData ?
                                    <CaretUp size={25} weight='bold' /> :
                                    <CaretDown size={25} weight='bold' />
                            }
                        </button>
                    </div>
                </div>

                {
                    showBuyerNeedData && (
                        <div>
                            {
                                BuyerNeedData.map((item, index) => (
                                    <div className='mt-4' key={index}>
                                        <div className='flex flex-row items-center justify-between mt-4'>
                                            <div>
                                                {item.question}
                                            </div>
                                            <button aria-describedby={buyerId} onClick={handleOpenBuyerKycPopover}>
                                                <DotsThree size={35} weight='bold' />
                                            </button>
                                            <Popover
                                                id={buyerId}
                                                open={openBuyerKyc}
                                                anchorEl={BuyerAnchor}
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
                                    </div>
                                ))
                            }
                        </div>
                    )
                }

                <div className='underline text-purple' style={styles.inputStyle} onClick={() => { setAddBuyerKyc(true) }}>
                    Add Question
                </div>

            </div>

            <div className='border p-2 rounded-lg p-4 w-full mt-4'>
                <div className='flex flex-row items-center justify-between w-full'>
                    <div style={styles.inputStyle}>
                        Motivation
                    </div>
                    <div className='flex flex-row items-center gap-2'>
                        <div className='border flex flex-row items-center justify-center' style={{ height: "20px", width: "18px", fontSize: 12, fontWeight: "700", borderRadius: "50%" }}>
                            {BuyerMotivationData.length}
                        </div>
                        <button onClick={() => { setShowBuyerMotivationData(!showBuyerMotivationData) }}>
                            {
                                showBuyerMotivationData ?
                                    <CaretUp size={25} weight='bold' /> :
                                    <CaretDown size={25} weight='bold' />
                            }
                        </button>
                    </div>
                </div>

                {
                    showBuyerMotivationData && (
                        <div>
                            {
                                BuyerMotivationData.map((item, index) => (
                                    <div className='mt-4' key={index}>
                                        <div className='flex flex-row items-center justify-between mt-4'>
                                            <div>
                                                {item.question}
                                            </div>
                                            <button aria-describedby={buyerId} onClick={handleOpenBuyerKycPopover}>
                                                <DotsThree size={35} weight='bold' />
                                            </button>
                                            <Popover
                                                id={buyerId}
                                                open={openBuyerKyc}
                                                anchorEl={BuyerAnchor}
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
                                    </div>
                                ))
                            }
                        </div>
                    )
                }

                <div className='underline text-purple' style={styles.inputStyle} onClick={() => { setAddBuyerKyc(true) }}>
                    Add Question
                </div>

            </div>

            <div className='border p-2 rounded-lg p-4 w-full mt-4'>
                <div className='flex flex-row items-center justify-between w-full'>
                    <div style={styles.inputStyle}>
                        Urgency
                    </div>
                    <div className='flex flex-row items-center gap-2'>
                        <div className='border flex flex-row items-center justify-center' style={{ height: "20px", width: "18px", fontSize: 12, fontWeight: "700", borderRadius: "50%" }}>
                            {BuyerUrgencyData.length}
                        </div>
                        <button onClick={() => { setShowBuyerUrgencyData(!showBuyerUrgencyData) }}>
                            {
                                showBuyerUrgencyData ?
                                    <CaretUp size={25} weight='bold' /> :
                                    <CaretDown size={25} weight='bold' />
                            }
                        </button>
                    </div>
                </div>

                {
                    showBuyerUrgencyData && (
                        <div>
                            {
                                BuyerUrgencyData.map((item, index) => (
                                    <div className='mt-4' key={index}>
                                        <div className='flex flex-row items-center justify-between mt-4'>
                                            <div>
                                                {item.question}
                                            </div>
                                            <button aria-describedby={buyerId} onClick={handleOpenBuyerKycPopover}>
                                                <DotsThree size={35} weight='bold' />
                                            </button>
                                            <Popover
                                                id={buyerId}
                                                open={openBuyerKyc}
                                                anchorEl={BuyerAnchor}
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
                                    </div>
                                ))
                            }
                        </div>
                    )
                }

                <div className='underline text-purple' style={styles.inputStyle} onClick={() => { setAddBuyerKyc(true) }}>
                    Add Question
                </div>

            </div>

            {/* Add modals code */}
            <Modal
                open={addBuyerKyc}
                onClose={() => setAddBuyerKyc(false)}
                closeAfterTransition
                BackdropProps={{
                    timeout: 1000,
                    sx: {
                        backgroundColor: "#00000020",
                        backdropFilter: "blur(20px)",
                    },
                }}
            >
                <Box className="sm:w-10/12 w-10/12 max-h-[70vh] overflow-auto" sx={styles.modalsStyle}>
                    <div className="flex flex-row justify-center w-full">
                        <div
                            className="sm:w-10/12 w-full"
                            style={{
                                backgroundColor: "#ffffff",
                                padding: 20,
                                borderRadius: "13px",
                            }}
                        >
                            <div className='flex flex-row justify-end'>
                                <button onClick={() => { setAddBuyerKyc(false) }}>
                                    <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                                </button>
                            </div>

                            <AddBuyerKyc handleCloseSellerKyc={handleCloseSellerKyc} handleAddBuyerKycData={handleAddBuyerKycData} />


                            {/* Can be use full to add shadow */}
                            {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                        </div>
                    </div>
                </Box>
            </Modal>

        </div>
    )
}

export default KYCs