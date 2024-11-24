import Body from '@/components/onboarding/Body';
import Header from '@/components/onboarding/Header';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Footer from '@/components/onboarding/Footer';
//import for input drop down menu
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { CircularProgress, Modal } from '@mui/material';
import Apis from '../apis/Apis';
import axios from 'axios';
import PurchaseNumberSuccess from './PurchaseNumberSuccess';
import { Key } from '@phosphor-icons/react';

const CreateAgent4 = ({ handleContinue, handleBack }) => {

    const router = useRouter();
    const [toggleClick, setToggleClick] = useState(false);
    const [selectNumber, setSelectNumber] = useState('');
    const [useOfficeNumber, setUseOfficeNumber] = useState(false);
    const [userSelectedNumber, setUserSelectedNumber] = useState("");
    const [showOfficeNumberInput, setShowOfficeNumberInput] = useState(false);
    const [officeNumber, setOfficeNumber] = useState("");
    const [showClaimPopup, setShowClaimPopup] = useState(false);
    const [previousNumber, setPreviousNumber] = useState([
        // {
        //     id: 1,
        //     item: 1321321321321321
        // },
        // {
        //     id: 2,
        //     item: 1321321321321321
        // },
        // {
        //     id: 3,
        //     item: 1321321321321321
        // },
        // {
        //     id: 4,
        //     item: 1321321321321321
        // },
        // {
        //     id: 5,
        //     item: 1321321321321321
        // },
        // {
        //     id: 6,
        //     item: 1321321321321321
        // },
    ]);
    //code for find numbers
    const [findNumber, setFindNumber] = useState("");
    const [findeNumberLoader, setFindeNumberLoader] = useState(false);
    const [foundeNumbers, setFoundeNumbers] = useState([]);
    const [selectedPurchasedIndex, setSelectedPurchasedIndex] = useState(false);
    const [selectedPurchasedNumber, setSelectedPurchasedNumber] = useState(null);
    const [purchaseLoader, setPurchaseLoader] = useState(false);
    const [openPurchaseSuccessModal, setOpenPurchaseSuccessModal] = useState(false);

    const [callBackNumber, setCallBackNumber] = useState("");
    const [assignLoader, setAssignLoader] = useState(false);

    useEffect(() => {
        getAvailabePhoneNumbers()
    }, []);

    const handleSelectNumber = (event) => {
        setSelectNumber(event.target.value);
    };

    const handleToggleClick = () => {
        setToggleClick(!toggleClick)
    }

    //code to use office number
    const handleOfficeNumberClick = () => {
        setUserSelectedNumber("");
        setUseOfficeNumber(!useOfficeNumber);
        setShowOfficeNumberInput(!showOfficeNumberInput);
    }

    const handleSelectedNumberClick = (item) => {
        console.log("nuber is :", item)
        setOfficeNumber("");
        setShowOfficeNumberInput(false);
        setUseOfficeNumber(false);
        setUserSelectedNumber(item);
    }

    const handleCloseClaimPopup = () => {
        setShowClaimPopup(false)
    }

    //code to select Purchase number
    const handlePurchaseNumberClick = (item, index) => {
        console.log("Item Selected is :---", item);
        setSelectedPurchasedNumber(prevId => (prevId === item ? null : item));
        setSelectedPurchasedIndex(prevId => (prevId === index ? null : index));
    }

    //function to fine numbers api
    const handleFindeNumbers = async () => {
        try {
            setFindeNumberLoader(true);
            const ApiPath = `${Apis.findPhoneNumber}?contains=${findNumber}`;
            let AuthToken = null;
            const LocalData = localStorage.getItem("User");
            if (LocalData) {
                const UserDetails = JSON.parse(LocalData);
                AuthToken = UserDetails.token;
            }

            console.log("Apipath is :--", ApiPath);
            // return
            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of find number api is :--", response.data);
                if (response.data.status === true) {
                    setFoundeNumbers(response.data.data);
                }

            }

        } catch (error) {
            console.error("Error occured in finde number api is :---", error);
        } finally {
            setFindeNumberLoader(false);
        }
    }

    // function for purchasing number api
    const handlePurchaseNumber = async () => {
        try {
            setPurchaseLoader(true);
            let AuthToken = null;
            const LocalData = localStorage.getItem("User");
            const agentDetails = localStorage.getItem("agentDetails");
            let MyAgentData = null;
            if (LocalData) {
                const UserDetails = JSON.parse(LocalData);
                AuthToken = UserDetails.token;
            }

            if (agentDetails) {
                console.log("trying")
                const agentData = JSON.parse(agentDetails);
                console.log("Agent details are :--", agentData);
                MyAgentData = agentData;

            }

            const ApiPath = Apis.purchaseNumber;
            console.log("Apipath is :--", ApiPath);

            const formData = new FormData();
            formData.append("phoneNumber", "+14062040550");
            formData.append("callbackNumber", "+14062040550");
            formData.append("mainAgentId", MyAgentData.id);

            for (let [key, value] of formData.entries()) {
                console.log(`${key} ${value} `);
            }

            // return

            const response = await axios.post(ApiPath, formData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of purchase number api is :--", response.data);
                if (response.data.status === true) {
                    localStorage.setItem("purchasedNumberDetails", JSON.stringify(response.data.data));
                    setOpenPurchaseSuccessModal(true);
                    // handleContinue();
                }
            }

        } catch (error) {
            console.error("Error occured in purchase number api is: --", error);
        } finally {
            setPurchaseLoader(false);
        }
    }

    //get available phonenumbers
    const getAvailabePhoneNumbers = async () => {
        try {
            let AuthToken = null;
            const LocalData = localStorage.getItem("User");

            const agentDetails = localStorage.getItem("agentDetails");
            if (LocalData) {
                const UserDetails = JSON.parse(LocalData);
                AuthToken = UserDetails.token;
            }

            const ApiPath = Apis.userAvailablePhoneNumber;
            console.log("Apipath", ApiPath);

            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + AuthToken
                }
            });

            if (response) {
                console.log("Response of api is :", response.data);
                console.log("PArsed data is ", response.data.data);
                setPreviousNumber(response.data.data);
            }

        } catch (error) {
            console.error("Error occured in: ", error);
        } finally {
            console.log("Api cal completed")
        }
    }


    //get main agent id
    const AssignNumber = async () => {
        try {
            setAssignLoader(true);
            let AuthToken = null;
            const LocalData = localStorage.getItem("User");
            let MyAgentData = null;
            const agentDetails = localStorage.getItem("agentDetails");
            if (LocalData) {
                const UserDetails = JSON.parse(LocalData);
                AuthToken = UserDetails.token;
            }

            if (agentDetails) {
                console.log("trying");
                const agentData = JSON.parse(agentDetails);
                console.log("Agent details are :--", agentData);
                MyAgentData = agentData;
            }

            const formData = new FormData();
            // formData.append("phoneNumber", selectNumber);
            // formData.append("mainAgentId", MyAgentData.id);
            // formData.append("callbackNumber", callBackNumber);
            // formData.append("liveTransforNumber", userSelectedNumber);

            formData.append("phoneNumber", "+14062040550");
            formData.append("callbackNumber", "+14062040550");
            formData.append("mainAgentId", MyAgentData.id);
            formData.append("liveTransforNumber", "+14062040550");

            const ApiPath = Apis.asignPhoneNumber;

            for (let [key, value] of formData.entries()) {
                console.log(`${key} ${value}`)
            }

            // return

            const response = await axios.post(ApiPath, formData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken
                }
            });

            if (response) {
                console.log("Response of assign number api is :", response.data)
                if (response.data.status === true) {
                    handleContinue();
                }
            }

        } catch (error) {
            console.error("Error occured in api is:", error);
        } finally {
            console.log("Assign Number Api call completed");
            setAssignLoader(false);
        }
    }



    const PhoneNumbers = [
        {
            id: 1,
            number: "03011958712"
        },
        {
            id: 2,
            number: "03281575712"
        },
        {
            id: 3,
            number: "03058191079"
        },
    ]

    const styles = {
        headingStyle: {
            fontSize: 16,
            fontWeight: "700"
        },
        inputStyle: {
            fontSize: 15,
            fontWeight: "500",
            color: "#000000"
        },
        dropdownMenu: {
            fontSize: 15,
            fontWeight: "500",
            color: "#00000070"
        },
        callBackStyles: {
            height: "71px", //width: "210px",
            border: "1px solid #15151550", borderRadius: "20px",
            fontWeight: "500", fontSize: 16
        },
        claimPopup: {
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
        findNumberTitle: {
            fontSize: 17,
            fontWeight: "500"
        },
        findNumberDescription: {
            fontSize: 15,
            fontWeight: "500"
        }
    }


    return (
        <div style={{ width: "100%" }} className="overflow-y-hidden flex flex-row justify-center items-center">
            <div className='bg-white rounded-2xl w-10/12 h-[90vh] py-4 overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple flex flex-col justify-between'>

                <div>
                    {/* header */}
                    <Header />
                    {/* Body */}
                    <div className='flex flex-col items-center px-4 w-full'>
                        <div className='mt-6 w-11/12 md:text-4xl text-lg font-[700]' style={{ textAlign: "center" }} onClick={handleContinue}>
                            {`Let's talk digits`}
                        </div>
                        <div className='mt-8 w-6/12 gap-4 flex flex-col max-h-[50vh] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple'>

                            <div style={styles.headingStyle}>
                                {`Select a phone number you'd like to use to call with`}
                            </div>

                            <div className='border rounded-lg'>
                                <Box className="w-full">
                                    <FormControl className="w-full">
                                        <Select
                                            className='border-none rounded-2xl outline-none'
                                            displayEmpty
                                            value={selectNumber}
                                            onChange={handleSelectNumber}
                                            renderValue={(selected) => {
                                                if (selected === '') {
                                                    return <div>Select Number</div>;
                                                }
                                                return selected;
                                            }}
                                            sx={{
                                                ...styles.dropdownMenu,
                                                backgroundColor: '#FFFFFF',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    border: 'none',
                                                },
                                            }}
                                        >
                                            <MenuItem value="">
                                                <div style={styles.dropdownMenu}>None</div>
                                            </MenuItem>
                                            {/* {
                                                PhoneNumbers.map((item, index) => (
                                                    <MenuItem key={item.id} style={styles.dropdownMenu} value={item.number}>{item.number}</MenuItem>
                                                ))
                                            } */}
                                            <MenuItem style={styles.dropdownMenu} value={14062040550}>+14062040550 (Our global phone number avail to first time users)</MenuItem>
                                            <div className='ms-4' style={styles.inputStyle}>Get your own unique phone number. <button className='text-purple underline' onClick={() => { setShowClaimPopup(true) }}>Claim one</button></div>
                                            {/* <MenuItem value={20}>03058191079</MenuItem>
                                        <MenuItem value={30}>03281575712</MenuItem> */}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </div>

                            {/* Code for Purchase and find number popup */}
                            <Modal
                                open={showClaimPopup}
                                closeAfterTransition
                                BackdropProps={{
                                    timeout: 1000,
                                    sx: {
                                        backgroundColor: "#00000020",
                                        // backdropFilter: "blur(20px)",
                                    },
                                }}
                            >
                                <Box className="lg:w-8/12 sm:w-full w-8/12" sx={styles.claimPopup}>
                                    <div className="flex flex-row justify-center w-full">
                                        <div
                                            className="sm:w-8/12 w-full min-h-[50vh] max-h-[80vh] flex flex-col justify-between"
                                            style={{
                                                backgroundColor: "#ffffff",
                                                padding: 20,
                                                borderRadius: "13px",
                                            }}
                                        >
                                            <div>
                                                <div className='flex flex-row justify-end'>
                                                    <button onClick={handleCloseClaimPopup}>
                                                        <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                                                    </button>
                                                </div>
                                                <div style={{
                                                    fontSize: 24,
                                                    fontWeight: "700",
                                                    textAlign: "center"
                                                }}>
                                                    {`Let's claim your phone number`}
                                                </div>
                                                <div className='mt-2' style={{
                                                    fontSize: 15,
                                                    fontWeight: "700", textAlign: "center"
                                                }}>
                                                    Enter the 3 digit area code you would like to use
                                                </div>
                                                <div className='mt-4'
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: "500",
                                                        color: "#15151550"
                                                    }}>
                                                    Number
                                                </div>
                                                <div className='mt-2'>
                                                    <input className='border outline-none p-2 rounded-lg w-full' type='' placeholder='Ex: 619, 213, 313'
                                                        value={findNumber}
                                                        onChange={(e) => { setFindNumber(e.target.value) }}
                                                    />
                                                </div>

                                                {
                                                    findeNumberLoader ?
                                                        <div className='flex flex-row justify-center mt-6'>
                                                            <CircularProgress size={35} />
                                                        </div> :
                                                        <div className='mt-6 max-h-[40vh] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple'>
                                                            {
                                                                foundeNumbers.map((item, index) => (
                                                                    <div key={index} className='h-[8vh] rounded-2xl flex flex-col justify-center p-4 mb-4'
                                                                        style={{
                                                                            border: index === selectedPurchasedIndex ? "2px solid #402FFF" : "1px solid #00000040"
                                                                        }}
                                                                    >
                                                                        <button className='flex flex-row items-start justify-between outline-none' onClick={(e) => { handlePurchaseNumberClick(item, index) }}>
                                                                            <div>
                                                                                <div style={styles.findNumberTitle}>
                                                                                    {item.phoneNumber}
                                                                                </div>
                                                                                <div className='text-start' style={styles.findNumberDescription}>
                                                                                    {item.locality} {item.region}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex flex-row items-start gap-4">
                                                                                <div style={styles.findNumberTitle}>
                                                                                    ${item.price}/mo
                                                                                </div>
                                                                                <div>
                                                                                    {
                                                                                        index == selectedPurchasedIndex ?
                                                                                            <Image src={"/assets/charmTick.png"} height={35} width={35} alt='*' /> :
                                                                                            <Image src={"/assets/charmUnMark.png"} height={35} width={35} alt='*' />
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </button>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                }

                                            </div>
                                            <div className='h-[50px]'>
                                                {selectedPurchasedNumber ? (
                                                    <div>
                                                        {
                                                            purchaseLoader ?
                                                                <div className='w-full flex flex-row justify-center mt-4'>
                                                                    <CircularProgress size={32} />
                                                                </div> :
                                                                <button className='text-white bg-purple w-full h-[50px] rounded-lg' onClick={handlePurchaseNumber}>
                                                                    Proceed to Buy
                                                                </button>
                                                        }
                                                    </div>
                                                ) : (
                                                    <button className='text-white bg-purple w-full h-[50px] rounded-lg' onClick={handleFindeNumbers}>
                                                        Find Number
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Box>
                            </Modal>

                            {/* Code for Purchase number success popup */}
                            <Modal
                                open={openPurchaseSuccessModal}
                                // onClose={() => setAddKYCQuestion(false)}
                                closeAfterTransition
                                BackdropProps={{
                                    timeout: 1000,
                                    sx: {
                                        backgroundColor: "#00000020",
                                        // backdropFilter: "blur(20px)",
                                    },
                                }}
                            >
                                <Box className="lg:w-8/12 sm:w-full w-8/12" sx={styles.claimPopup}>
                                    <div className="flex flex-row justify-center w-full">
                                        <div
                                            className="sm:w-8/12 w-full min-h-[50vh] max-h-[80vh] flex flex-col justify-between"
                                            style={{
                                                backgroundColor: "#ffffff",
                                                padding: 20,
                                                borderRadius: "13px",
                                            }}
                                        >
                                            <div>
                                                <div className='flex flex-row justify-end'>
                                                    <button onClick={() => { setOpenPurchaseSuccessModal(false) }}>
                                                        <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                                                    </button>
                                                </div>
                                                <PurchaseNumberSuccess handleContinue={handleContinue} />
                                            </div>
                                        </div>
                                    </div>
                                </Box>
                            </Modal>




                            <button onClick={() => { setOpenPurchaseSuccessModal(true) }} style={styles.headingStyle} className='text-start'>
                                What number should we forward live transfers to when a lead wants to talk to you?
                            </button>

                            <div className='flex flex-row items-center gap-4'>

                                <div className='overflow-auto flex flex-row'>
                                    {
                                        previousNumber.map((item) => (
                                            <button className='flex flex-row items-center justify-center w-[271px]' key={item}
                                                style={{
                                                    ...styles.callBackStyles, border: userSelectedNumber === item ? "2px solid #402FFF" : "1px solid #15151550"
                                                }}
                                                onClick={(e) => { handleSelectedNumberClick(item) }}
                                            >
                                                Use  {item.slice(1)}
                                                {/* {item.item} */}
                                            </button>
                                        ))
                                    }
                                </div>

                                <button className='flex flex-row items-center justify-center'
                                    style={{
                                        ...styles.callBackStyles, width: "242px", border: useOfficeNumber ? "2px solid #402FFF" : "1px solid #15151550"
                                    }}
                                    onClick={handleOfficeNumberClick}
                                >
                                    Use my cell or office number
                                </button>
                            </div>

                            {showOfficeNumberInput ? (
                                <div className='w-full'>
                                    <div className='mt-4' style={styles.dropdownMenu}>
                                        Enter Number
                                    </div>

                                    <input
                                        placeholder='Phone Number'
                                        className='border-2 rounded p-2 outline-none w-full mt-1'
                                        style={styles.inputStyle}
                                    />
                                </div>
                            ) : ""}

                            <div style={styles.headingStyle}>
                                What number should we forward live transfers to when a lead wants to talk to you?
                            </div>
                            <input
                                placeholder='Phone Number'
                                className='border-2 rounded p-2 outline-none'
                                style={styles.inputStyle}
                                value={callBackNumber}
                                onChange={(e) => { setCallBackNumber(e.target.value) }}
                            />

                            <div className='flex flex-row items-center gap-4 justify-start mt-6'>
                                <button onClick={handleToggleClick}>
                                    {
                                        toggleClick ?
                                            <div className='bg-purple flex flex-row items-center justify-center rounded' style={{ height: "24px", width: "24px" }}>
                                                <Image src={"/assets/whiteTick.png"} height={8} width={10} alt='*' />
                                            </div> :
                                            <div className='bg-none border-2 flex flex-row items-center justify-center rounded' style={{ height: "24px", width: "24px" }}>
                                            </div>
                                    }
                                </button>
                                <div style={{ color: "#151515", fontSize: 15, fontWeight: "600" }}>
                                    {`Don't make live transfers. Prefer the AI Agent schedules them for a call back.`}
                                </div>
                            </div>




                            {/* <Body /> */}
                        </div>
                    </div>
                </div>

                <div>
                    <div>
                        <ProgressBar value={33} />
                    </div>

                    <Footer handleContinue={AssignNumber} handleBack={handleBack} registerLoader={assignLoader} />
                </div>

            </div>
        </div>
    )
}

export default CreateAgent4
