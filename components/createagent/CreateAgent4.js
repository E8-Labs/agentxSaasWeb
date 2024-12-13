import Body from '@/components/onboarding/Body';
import Header from '@/components/onboarding/Header';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Footer from '@/components/onboarding/Footer';
//import for input drop down menu
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { CircularProgress, Modal, Popover } from '@mui/material';
import Apis from '../apis/Apis';
import axios from 'axios';
import PurchaseNumberSuccess from './PurchaseNumberSuccess';
import { Key } from '@phosphor-icons/react';
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import PhoneInput from "react-phone-input-2";

const CreateAgent4 = ({ handleContinue, handleBack }) => {

    const timerRef = useRef(null);
    const router = useRouter();
    const selectRef = useRef(null);
    const [toggleClick, setToggleClick] = useState(false);
    const [selectNumber, setSelectNumber] = useState('');
    const [openCalimNumDropDown, setOpenCalimNumDropDown] = useState(false);
    const [reassignLoader, setReassignLoader] = useState(false);
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
    //show reassign btn or not
    const [showReassignBtn, setShowReassignBtn] = useState(false);
    const [showGlobalBtn, setShowGlobalBtn] = useState(true);
    //code for find numbers
    const [findNumber, setFindNumber] = useState("");
    const [findeNumberLoader, setFindeNumberLoader] = useState(false);
    const [foundeNumbers, setFoundeNumbers] = useState([]);
    const [selectedPurchasedIndex, setSelectedPurchasedIndex] = useState(null);
    const [selectedPurchasedNumber, setSelectedPurchasedNumber] = useState(null);
    const [purchaseLoader, setPurchaseLoader] = useState(false);
    const [openPurchaseSuccessModal, setOpenPurchaseSuccessModal] = useState(false);

    const [callBackNumber, setCallBackNumber] = useState("");
    const [countryCode, setCountryCode] = useState("us");
    const [assignLoader, setAssignLoader] = useState(false);
    const [shouldContinue, setShouldContinue] = useState(true);
    const [errorMessage, setErrorMessage] = useState(false);
    const [officeErrorMessage, setOfficeErrorMessage] = useState(false);



    useEffect(() => {
        const localData = localStorage.getItem("claimNumberData");
        if (localData) {

            const claimNumberDetails = JSON.parse(localData);

            console.log("Claim number details are:", claimNumberDetails);

            if (claimNumberDetails.officeNo) {
                console.log("Should work")
                setUseOfficeNumber(true);
                setShowOfficeNumberInput(true);
                setOfficeNumber(claimNumberDetails.officeNo);
            } else {
                setUserSelectedNumber(claimNumberDetails.usernumber2)
            }
            setCallBackNumber(claimNumberDetails.callBackNumber);
            setSelectNumber(claimNumberDetails.userNumber);
            setShouldContinue(false);
        }
        getAvailabePhoneNumbers();
        const localAgentsData = localStorage.getItem("agentDetails");
        if (localAgentsData) {
            const agetnDetails = JSON.parse(localAgentsData);
            console.log("Created agent details are :", agetnDetails);
            if (agetnDetails.agents.length === 2) {
                setShowReassignBtn(false);
            } else if (agetnDetails.agents[0].agentType === "inbound") {
                setShowReassignBtn(true);
                setShowGlobalBtn(false);
            }
        }

    }, []);

    useEffect(() => {
        console.log("Main number is :", selectNumber);
        console.log("User selected number is :", userSelectedNumber);
        console.log("User callback number is :", callBackNumber);
        console.log("do not staus is :", toggleClick);
        if (
            selectNumber &&
            // callBackNumber ||
            // !toggleClick &&
            userSelectedNumber || useOfficeNumber
        ) {
            setShouldContinue(false);
        } else {
            setShouldContinue(true);
        }
    }, [selectNumber, userSelectedNumber, callBackNumber, toggleClick]);

    //code to format the number
    const formatPhoneNumber = (rawNumber) => {
        const phoneNumber = parsePhoneNumberFromString(
            rawNumber.startsWith('+') ? rawNumber : `+${rawNumber}`
        );
        // console.log("Raw number is", rawNumber);
        return phoneNumber ? phoneNumber.formatInternational() : 'Invalid phone number';
    };

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


    //code for phone number inputs functions
    const handleCallBackNumberChange = (phone) => {
        setCallBackNumber(phone);
        validatePhoneNumber(phone);

        if (!phone) {
            setErrorMessage("");
            setOfficeErrorMessage("");
        }
    };

    //code for reassigning the number api
    const handleReassignNumber = async (phoneNumber) => {
        try {
            console.log("Phonenumber is:", phoneNumber.slice(1));
            // return
            setReassignLoader(true);
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

            const ApiPath = Apis.reassignNumber;

            const ApiData = {
                agentId: MyAgentData.userId,
                phoneNumber: phoneNumber
            }
            console.log("I a just trigered")

            console.log("Data sending in api is:", ApiData);
            console.log("Api path is:", ApiPath);
            console.log("Authtoken is:", AuthToken);

            // return
            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Respose of reassign api is:", response);
                setSelectNumber(phoneNumber.slice(1));
                setOpenCalimNumDropDown(false);
                //code to close the dropdown
                if (selectRef.current) {
                    selectRef.current.blur(); // Triggers dropdown close
                }


                // if (response.data.status === true) {
                //     setSelectNumber(phoneNumber);
                // } else {
                //     setSelectNumber(phoneNumber);
                // }
            }

        } catch (error) {
            console.error("Error occured in reassign the number api:", error);
        } finally {
            setReassignLoader(false);
            console.log("reassign api completed")
        }
    }

    //code for office number change
    const handleOfficeNumberChange = (phone, e) => {
        setOfficeNumber(phone);
        validatePhoneNumber(phone, e);
        setUserSelectedNumber("");

        if (!phone) {
            setErrorMessage("");
            setOfficeErrorMessage("");
        }
    };



    //phone validation
    //number validation
    const validatePhoneNumber = (phoneNumber, e) => {
        // const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`);
        // parsePhoneNumberFromString(`+${phone}`, countryCode.toUpperCase())
        const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`, countryCode.toUpperCase());
        // if (parsedNumber && parsedNumber.isValid() && parsedNumber.country === countryCode.toUpperCase()) {
        if (!parsedNumber || !parsedNumber.isValid()) {
            if (e) {
                setOfficeErrorMessage('Enter valid number');
            } else {
                setErrorMessage('Enter valid number');
            }
        } else {
            setErrorMessage('');
            setOfficeErrorMessage('');

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            // setCheckPhoneResponse(null);
            console.log("Trigered")

            timerRef.current = setTimeout(() => {
                // checkPhoneNumber(phoneNumber);
            }, 300);
        }
    };


    //code to select Purchase number
    const handlePurchaseNumberClick = (item, index) => {
        console.log("Item Selected is :---", item);
        setSelectedPurchasedNumber(prevId => (prevId === item ? null : item));
        setSelectedPurchasedIndex(prevId => (prevId === index ? null : index));
    }

    //function to fine numbers api
    const handleFindeNumbers = async (number) => {
        try {
            setFindeNumberLoader(true);
            const ApiPath = `${Apis.findPhoneNumber}?areaCode=${number}`;
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

            console.log("Authtoken is:", AuthToken);

            if (agentDetails) {
                console.log("trying")
                const agentData = JSON.parse(agentDetails);
                console.log("Agent details are :--", agentData);
                MyAgentData = agentData;

            }

            const ApiPath = Apis.purchaseNumber;
            console.log("Apipath is :--", ApiPath);
            // console.log("Number selected is:", selectedPurchasedNumber);
            const formData = new FormData();
            formData.append("phoneNumber", selectedPurchasedNumber.phoneNumber);
            // formData.append("phoneNumber", "+14062040550");
            // formData.append("callbackNumber", "+14062040550");
            formData.append("mainAgentId", MyAgentData.id);

            for (let [key, value] of formData.entries()) {
                console.log(`${key} ${value} `);
            }

            // localStorage.setItem("purchasedNumberDetails", JSON.stringify(response.data.data));
            setOpenPurchaseSuccessModal(true);
            setSelectNumber(selectedPurchasedNumber.phoneNumber);
            setPreviousNumber([...previousNumber, selectedPurchasedNumber]);
            setShowClaimPopup(false);
            setOpenCalimNumDropDown(false);


            // return

            const response = await axios.post(ApiPath, formData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "multipart/form-data",
                    // "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of purchase number api is :--", response.data);
                if (response.data.status === true) {
                    localStorage.setItem("purchasedNumberDetails", JSON.stringify(response.data.data));
                    setOpenPurchaseSuccessModal(true);
                    // handleContinue();
                    setSelectNumber(selectedPurchasedNumber.phoneNumber);
                    setPreviousNumber([...previousNumber, selectedPurchasedNumber]);
                    setShowClaimPopup(false);
                    setOpenCalimNumDropDown(false);
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

            // const agentDetails = localStorage.getItem("agentDetails");
            const LocalData = localStorage.getItem("User");
            if (LocalData) {
                const UserDetails = JSON.parse(LocalData);
                AuthToken = UserDetails.token;
            }
            console.log("initial api authtoken is:", AuthToken);
            const ApiPath = Apis.userAvailablePhoneNumber;
            console.log("Apipath", ApiPath);

            // return
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
            formData.append("phoneNumber", selectNumber);
            if (userSelectedNumber) {
                formData.append("callbackNumber", userSelectedNumber.phoneNumber);
            } else {
                formData.append("callbackNumber", officeNumber);
            }
            formData.append("liveTransforNumber", callBackNumber);
            formData.append("mainAgentId", MyAgentData.id);
            formData.append("liveTransfer", toggleClick);

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
                    const calimNoData = {
                        officeNo: officeNumber,
                        userNumber: selectNumber,
                        usernumber2: userSelectedNumber,
                        callBackNumber: callBackNumber
                    }
                    localStorage.setItem("claimNumberData", JSON.stringify(calimNoData))
                }
            }

        } catch (error) {
            console.error("Error occured in api is:", error);
        } finally {
            console.log("Assign Number Api call completed");
            setAssignLoader(false);
        }
    }



    // const PhoneNumbers = [
    //     {
    //         id: 1,
    //         number: "03011958712"
    //     },
    //     {
    //         id: 2,
    //         number: "03281575712"
    //     },
    //     {
    //         id: 3,
    //         number: "03058191079"
    //     },
    // ]

    const styles = {
        headingStyle: {
            fontSize: 15,
            fontWeight: "600"
        },
        inputStyle: {
            fontSize: 14,
            fontWeight: "400",
            color: "#000000"
        },
        dropdownMenu: {
            fontSize: 15,
            fontWeight: "500",
            color: "#000000"
        },
        callBackStyles: {
            // height: "71px", //width: "210px",
            border: "1px solid #15151550", borderRadius: "20px",
            fontWeight: "500", fontSize: 15
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
            <div className='bg-white rounded-2xl w-10/12 h-[90vh] py-4 flex flex-col justify-between'
            // overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
            >

                <div>
                    {/* header */}
                    <Header />
                    {/* Body */}
                    <div className='flex flex-col items-center px-4 w-full h-[65vh] overflow-auto' style={{ scrollbarWidth: "none" }}>
                        <div className='mt-6 w-11/12 md:text-4xl text-lg font-[600]' style={{ textAlign: "center" }} onClick={handleContinue}>
                            {`Let's talk digits`}
                        </div>
                        <div className='mt-8 w-6/12 gap-4 flex flex-col h-[55vh] overflow-auto'
                            // overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
                            style={{ scrollbarWidth: "none" }}
                        >

                            <div style={styles.headingStyle}>
                                {`Select a phone number you'd like to use to call with`}
                            </div>


                            <div className='border rounded-lg'>
                                <Box className="w-full">
                                    <FormControl className="w-full">
                                        <Select
                                            ref={selectRef}
                                            open={openCalimNumDropDown}
                                            onClose={() => setOpenCalimNumDropDown(false)}
                                            onOpen={() => setOpenCalimNumDropDown(true)}
                                            className='border-none rounded-2xl outline-none'
                                            displayEmpty
                                            value={selectNumber}
                                            // onChange={handleSelectNumber}
                                            onChange={(e) => {
                                                let value = e.target.value
                                                setSelectNumber(value)
                                                setOpenCalimNumDropDown(false);
                                            }}
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
                                            {
                                                previousNumber.map((item, index) => (
                                                    <MenuItem key={index} style={styles.dropdownMenu} value={item.phoneNumber.slice(1)} className='flex flex-row items-center gap-2'>
                                                        {item.phoneNumber}
                                                        {
                                                            showReassignBtn && (
                                                                <div>
                                                                    {
                                                                        item.claimedBy && (
                                                                            <div className='flex flex-row items-center gap-2'>
                                                                                {`(Claimed by {${item.claimedBy.name}})`}
                                                                                {
                                                                                    reassignLoader ?
                                                                                        <CircularProgress size={15} /> :
                                                                                        <button className="text-purple underline" onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleReassignNumber(item.phoneNumber)
                                                                                            // handleReassignNumber(e.target.value)
                                                                                        }} >
                                                                                            Reassign
                                                                                        </button>
                                                                                }
                                                                            </div>
                                                                        )
                                                                    }
                                                                </div>
                                                            )
                                                        }
                                                    </MenuItem>
                                                ))
                                            }
                                            <MenuItem style={styles.dropdownMenu} value={showGlobalBtn ? 14062040550 : ""}>
                                                +14062040550
                                                {
                                                    showGlobalBtn && (
                                                        " (Our global phone number avail to first time users)"
                                                    )
                                                }
                                                {
                                                    showGlobalBtn == false && (
                                                        " (Only for outbound agents. You must Buy a number)"
                                                    )
                                                }
                                            </MenuItem>
                                            <div className='ms-4' style={{ ...styles.inputStyle, color: '#00000070' }}><i>Get your own unique phone number.</i> <button className='text-purple underline' onClick={() => { setShowClaimPopup(true) }}>Claim one</button></div>
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
                                                    <input className='border border-[#00000010] outline-none p-3 rounded-lg w-full mx-2 focus:outline-none focus:ring-0' type='' placeholder='Ex: 619, 213, 313'
                                                        value={findNumber}
                                                        onChange={(e) => {
                                                            setFindeNumberLoader(true);
                                                            if (timerRef.current) {
                                                                clearTimeout(timerRef.current);
                                                            }

                                                            const value = e.target.value
                                                            setFindNumber(e.target.value.replace(/[^0-9]/g, ""));
                                                            // handleFindeNumbers(value)
                                                            if (value) {
                                                                timerRef.current = setTimeout(() => {
                                                                    handleFindeNumbers(value);
                                                                }, 300);
                                                            } else {
                                                                console.log("Should not search")
                                                                return
                                                            }
                                                        }}
                                                    />
                                                </div>

                                                {
                                                    findNumber ?
                                                        <div>
                                                            {
                                                                findeNumberLoader ?
                                                                    <div className='flex flex-row justify-center mt-6'>
                                                                        <CircularProgress size={35} />
                                                                    </div> :
                                                                    <div className='mt-6 max-h-[40vh] overflow-auto' style={{ scrollbarWidth: "none" }}>
                                                                        {
                                                                            foundeNumbers.length > 0 ?
                                                                                <div className='w-full'>
                                                                                    {
                                                                                        foundeNumbers.map((item, index) => (
                                                                                            <div key={index} className='h-[10vh] rounded-2xl flex flex-col justify-center p-4 mb-4'
                                                                                                style={{
                                                                                                    border: index === selectedPurchasedIndex ? "2px solid #7902DF" : "1px solid #00000020",
                                                                                                    backgroundColor: index === selectedPurchasedIndex ? "#402FFF05" : ""
                                                                                                }}
                                                                                            >
                                                                                                <button className='flex flex-row items-start justify-between outline-none' onClick={(e) => { handlePurchaseNumberClick(item, index) }}>
                                                                                                    <div>
                                                                                                        <div style={styles.findNumberTitle}>
                                                                                                            {item.phoneNumber}
                                                                                                        </div>
                                                                                                        <div className='text-start mt-2' style={styles.findNumberDescription}>
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
                                                                                </div> :
                                                                                <div className='text-xl font-[600] text-center mt-4'>
                                                                                    No result found. Try a new search
                                                                                </div>
                                                                        }
                                                                    </div>
                                                            }
                                                        </div> :
                                                        <div className='text-xl font-[600] text-center mt-4'>
                                                            Enter number to search
                                                        </div>
                                                }



                                            </div>
                                            <div className='h-[50px]'>
                                                <div>
                                                    {
                                                        purchaseLoader ?
                                                            <div className='w-full flex flex-row justify-center mt-4'>
                                                                <CircularProgress size={32} />
                                                            </div> :
                                                            <div>
                                                                {
                                                                    selectedPurchasedNumber && (
                                                                        <button className='text-white bg-purple w-full h-[50px] rounded-lg' onClick={handlePurchaseNumber}>
                                                                            Proceed to Buy
                                                                        </button>
                                                                    )
                                                                }
                                                            </div>
                                                    }
                                                </div>
                                                {/* {selectedPurchasedNumber ? (
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
                                                )} */}
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
                                                <PurchaseNumberSuccess selectedNumber={selectedPurchasedNumber} handleContinue={() => { setOpenPurchaseSuccessModal(false) }} />
                                            </div>
                                        </div>
                                    </div>
                                </Box>
                            </Modal>




                            <button onClick={() => { setOpenPurchaseSuccessModal(true) }} style={styles.headingStyle} className='text-start'>
                                What callback number should we use if someone requests one during a call?
                            </button>

                            <div className='flex flex-row items-center gap-4 overflow-x-auto h-[80px]'
                                style={{
                                    scrollbarWidth: "none", overflowY: 'hidden',
                                    height: "80px", // Ensures the height is always fixed
                                    flexShrink: 0,
                                }}>

                                <div className='flex flex-row items-center gap-4'>
                                    {
                                        previousNumber.map((item, index) => (
                                            <button className='flex flex-row items-center justify-center w-[271px] h-[71px]' key={index}
                                                style={{
                                                    ...styles.callBackStyles, border: userSelectedNumber === item ? "2px solid #7902DF" : "1px solid #15151550",
                                                    backgroundColor: userSelectedNumber === item ? "2px solid #402FFF15" : ""
                                                }}
                                                onClick={(e) => { handleSelectedNumberClick(item) }}
                                            >
                                                Use {formatPhoneNumber(item.phoneNumber)}
                                            </button>
                                        ))
                                    }
                                    <button className='flex flex-row items-center justify-center h-[71px]'
                                        style={{
                                            ...styles.callBackStyles, width: "242px", border: useOfficeNumber ? "2px solid #7902DF" : "1px solid #15151550",
                                            backgroundColor: useOfficeNumber ? "2px solid #402FFF15" : ""
                                        }}
                                        onClick={handleOfficeNumberClick}
                                    >
                                        Use my cell or office number
                                    </button>
                                </div>

                            </div>

                            {showOfficeNumberInput ? (
                                <div className='w-full'>
                                    <div className='mt-4' style={styles.dropdownMenu}>
                                        Enter Number
                                    </div>

                                    <PhoneInput
                                        className="border outline-none bg-white"
                                        country={countryCode} // Default country
                                        value={officeNumber}
                                        onChange={handleOfficeNumberChange}
                                        // onFocus={getLocation}
                                        // placeholder={locationLoader ? "Loading location ..." : "Enter Number"}
                                        placeholder={"Enter Number"}
                                        // disabled={loading} // Disable input if still loading
                                        style={{ borderRadius: "7px" }}
                                        inputStyle={{
                                            width: "100%",
                                            borderWidth: "0px",
                                            backgroundColor: "transparent",
                                            paddingLeft: "60px",
                                            paddingTop: "12px",
                                            paddingBottom: "12px",
                                        }}
                                        buttonStyle={{
                                            border: "none",
                                            backgroundColor: "transparent",
                                        }}
                                        dropdownStyle={{
                                            maxHeight: "150px",
                                            overflowY: "auto",
                                        }}
                                        countryCodeEditable={true}
                                    // defaultMask={locationLoader ? "Loading..." : undefined}
                                    />

                                    <div className='mt-2' style={{ fontWeight: "500", fontSize: 11, color: "red" }}>
                                        {officeErrorMessage}
                                    </div>

                                </div>
                            ) : ""}


                            {/* Phone number input here */}

                            <div className='w-full'>
                                <div style={styles.headingStyle}>
                                    What number should we forward live transfers to when a lead wants to talk to you?
                                </div>
                                <PhoneInput
                                    className="border outline-none bg-white"
                                    country={countryCode} // Default country
                                    value={callBackNumber}
                                    onChange={handleCallBackNumberChange}
                                    // onFocus={getLocation}
                                    // placeholder={locationLoader ? "Loading location ..." : "Enter Number"}
                                    placeholder={"Enter Number"}
                                    // disabled={loading} // Disable input if still loading
                                    style={{ borderRadius: "7px" }}
                                    inputStyle={{
                                        width: "100%",
                                        borderWidth: "0px",
                                        backgroundColor: "transparent",
                                        paddingLeft: "60px",
                                        paddingTop: "12px",
                                        paddingBottom: "12px",
                                    }}
                                    buttonStyle={{
                                        border: "none",
                                        backgroundColor: "transparent",
                                    }}
                                    dropdownStyle={{
                                        maxHeight: "150px",
                                        overflowY: "auto",
                                    }}
                                    countryCodeEditable={true}
                                // defaultMask={locationLoader ? "Loading..." : undefined}
                                />
                                <div style={{ fontWeight: "500", fontSize: 11, color: "red" }}>
                                    {errorMessage}
                                </div>
                            </div>

                            <div className='flex flex-row items-center gap-4 justify-start'>
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
                                <div style={{ color: "#151515", fontSize: 15, fontWeight: "500" }}>
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

                    <Footer handleContinue={AssignNumber} handleBack={handleBack} registerLoader={assignLoader} shouldContinue={shouldContinue} />
                </div>

            </div>
        </div>
    )
}

export default CreateAgent4
