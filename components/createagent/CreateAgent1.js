import Body from '@/components/onboarding/Body';
import Header from '@/components/onboarding/Header';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Footer from '@/components/onboarding/Footer';
import Apis from '../apis/Apis';
import axios from 'axios';
import { Box, CircularProgress, Modal, Popover } from '@mui/material';
import AddressPicker from '../test/AddressPicker';
import LoaderAnimation from '../animations/LoaderAnimation';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import GoogleAdddressPicker from '../test/GoogleAdddressPicker';
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";

const CreateAgent1 = ({ handleContinue, handleBack }) => {

    const addressKey = process.env.NEXT_PUBLIC_AddressPickerApiKey;

    const router = useRouter();
    const bottomRef = useRef();
    const [loaderModal, setLoaderModal] = useState(false);
    const [shouldContinue, setShouldContinue] = useState(true);
    const [toggleClick, setToggleClick] = useState(false);
    const [OutBoundCalls, setOutBoundCalls] = useState(false);
    const [InBoundCalls, setInBoundCalls] = useState(false);
    const [buildAgentLoader, setBuildAgentLoader] = useState(false);
    const [agentObjective, setAgentObjective] = useState(null);

    const [agentName, setAgentName] = useState("");
    const [agentRole, setAgentRole] = useState("");

    const [showModal, setShowModal] = useState(false);
    //other status
    const [showSomtthingElse, setShowSomtthingElse] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [otherStatus, setOtherStatus] = useState("");
    //get address
    const [address, setAddress] = useState("");

    const bottomToAddress = useRef(null); // Ref for scrolling
    const [addressSelected, setAddressSelected] = useState(null);

    //code for address picker
    const [addressValue, setAddressValue] = useState("");
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        setAddress(address?.label);
    }, [addressSelected]);
    // const [scollAddress, setScollAddress] = useState("");
    // console.log("User address is:", address);

    //other objective
    const [showOtherObjective, setShowOtherObjective] = useState(false);
    const [otherObjVal, setOtherObjVal] = useState("");

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };



    //auto move to the bottom
    useEffect(() => {
        if (showOtherObjective && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [showOtherObjective]);

    useEffect(() => {
        if (OutBoundCalls || InBoundCalls === true && agentName
            && agentRole
            && toggleClick) {
            setShouldContinue(false);
            console.log("Should continue")
        } else {
            console.log("Should Nott continue")
        }
    }, [agentName, agentRole, agentObjective, otherObjVal]);

    const handleToggleClick = (item) => {
        setAgentObjective(item);
        setToggleClick(item.id);
        // setToggleClick(prevId => (prevId === item.id ? null : item.id));

        if (item.id === 3) {
            setShowModal(true);
        }
        if (item.id === 100) {
            console.log("Trigered");
            // if (bottomRef.current) {
            //     bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
            // }
            setShowOtherObjective(true);
        } else {
            setShowOtherObjective("");
            setOtherObjVal("")
        }

    }

    const AgentObjective = [
        {
            id: 1,
            icon: "",
            title: "Call absentee owners",
            details: "Reach out to property owners who may not live in the property to discuss potential selling or investment opportunities.",
            focusIcn: "/objectiveIcons/obj1FC.png",
            unFocusIcon: "/objectiveIcons/obj1UF.png"
        },
        {
            id: 2,
            icon: "",
            title: "Circle prospecting",
            details: "Call homeowners in a specific farm to inform them about recent property activities, and gauge their interest in selling or buying.",
            focusIcn: "/objectiveIcons/obj2FC.png",
            unFocusIcon: "/objectiveIcons/obj2UF.png"
        },
        {
            id: 3,
            icon: "",
            title: "Community update",
            details: "Provide local homeowners with relevant updates on a property like just listed, just sold, in escrow or something else. ",
            focusIcn: "/objectiveIcons/obj3FC.png",
            unFocusIcon: "/objectiveIcons/obj3UF.png"
        },
        {
            id: 4,
            icon: "",
            title: "Lead reactivation",
            details: "Reconnect with past leads who previously expressed interest but did not convert, to reignite their interest in your services.",
            focusIcn: "/objectiveIcons/obj4FC.png",
            unFocusIcon: "/objectiveIcons/obj4UF.png"
        },
        {
            id: 5,
            icon: "",
            title: "Agent Recruiting",
            details: "Identify, engage, and attract potential real estate agents to expand your team with top talent. Recruit new agents to your team.",
            focusIcn: "/objectiveIcons/obj5FC.png",
            unFocusIcon: "/objectiveIcons/obj5UF.png"
        },
        {
            id: 6,
            icon: "",
            title: "Expired Listing",
            details: "Connect with homeowners whose listings have expired to understand their needs and offer solutions. Help relist their property and guide them toward a successful sale.",
            focusIcn: "/objectiveIcons/obj5FC.png",
            unFocusIcon: "/objectiveIcons/obj5UF.png"
        },
        {
            id: 100,
            icon: "",
            title: "others",
            details: "",
            focusIcn: "/objectiveIcons/obj6FC.png",
            unFocusIcon: "/objectiveIcons/obj6UF.png"
        },
    ];

    //code for selecting outbound calls
    const handleInboundCallClick = () => {
        // setOutBoundCalls(false);
        setInBoundCalls(!InBoundCalls);
    }

    //code for selecting inbound calls
    const handleOutBoundCallClick = () => {
        // setInBoundCalls(false);
        setOutBoundCalls(!OutBoundCalls);
    }

    //code for creating agent api
    const handleBuildAgent = async () => {
        try {
            setBuildAgentLoader(true);
            setLoaderModal(true);
            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const UserDetails = JSON.parse(localData);
                AuthToken = UserDetails.token;
            }
            console.log("Auth token is :--", AuthToken);
            const ApiPath = Apis.buildAgent;
            console.log("Api link for build agent is :--", ApiPath);
            const formData = new FormData();
            formData.append("name", agentName);
            formData.append("agentRole", agentRole);
            let agentType = null
            if (InBoundCalls && OutBoundCalls) {
                agentType = "both"
            } else if (InBoundCalls) {
                agentType = "inbound"
            } else if (OutBoundCalls) {
                agentType = "outbound"
            }
            formData.append("agentType", agentType);
            if (selectedStatus) {
                if (selectedStatus.id === 5) {
                    formData.append("status", otherStatus);
                } else {
                    formData.append("status", selectedStatus.title);
                }
            }
            if (addressValue) {
                formData.append("address", addressValue);
            }
            if (agentObjective.id === 100) {
                formData.append("agentObjective", "others");
                formData.append("agentObjectiveDescription", otherObjVal);
                formData.append("agentObjectiveId", 100);
            } else {
                formData.append("agentObjective", agentObjective.title);
                formData.append("agentObjectiveDescription", agentObjective.details);
                formData.append("agentObjectiveId", agentObjective.id);
            }

            console.log("Build agent details are is :-----");
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            // return
            const response = await axios.post(ApiPath, formData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken
                }
            });

            if (response) {
                console.log("Response of build agent api  is :---", response.data);
                if (response.data.status === true) {
                    console.log("Status of build agent is :", response.data.status);
                    localStorage.setItem("agentDetails", JSON.stringify(response.data.data));
                    handleContinue();
                }
            }

        } catch (error) {
            console.error("Error occured in build agent api is: ----", error);
        } finally {
            setBuildAgentLoader(false);
            setLoaderModal(false);
        }
    }

    //code to select the status
    const handleSelectStatus = (item) => {
        if (item.id === 5) {
            setShowSomtthingElse(true);
        } else {
            setShowSomtthingElse(false);
        }
        setSelectedStatus((prevId) => prevId === item ? null : item);
    }

    //code for address picker
    const {
        placesService,
        placePredictions,
        getPlacePredictions,
        isPlacePredictionsLoading,
    } = usePlacesService({
        apiKey: process.env.NEXT_PUBLIC_AddressPickerApiKey,
    });

    //function for address picker

    const handleSelectAddress = (placeId, description) => {
        // Set the input field to the selected place's description
        setAddressValue(description);
        setShowDropdown(false); // Hide dropdown on selection

        // Fetch place details if required
        if (placesService) {
            placesService.getDetails(
                { placeId },
                (details) => {
                    setSelectedPlace(details);
                    console.log("Selected Place Details:", details);
                }
            );
        }
    };

    const renderItem = (item) => {
        return (
            <div
                key={item.place_id}
                className="prediction-item"
                onClick={() => handleSelectAddress(item.place_id, item.description)}
                style={{
                    cursor: "pointer",
                    padding: "8px",
                    borderBottom: "1px solid #ddd",
                }}
            >
                {item.description}
            </div>
        );
    };


    const status = [
        {
            id: 1,
            title: "Coming soon"
        },
        {
            id: 2,
            title: "Just sold"
        },
        {
            id: 3,
            title: "Just listed"
        },
        {
            id: 4,
            title: "In escrow"
        },
        {
            id: 5,
            title: "Something else"
        },
    ]

    const styles = {
        headingStyle: {
            fontSize: 14,
            fontWeight: "600"
        },
        inputStyle: {
            fontSize: 13,
            fontWeight: "400",
            width: "95%"
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
            <div className=' rounded-2xl w-full lg:w-10/12 h-[90vh] flex flex-col items-center' style={{ scrollbarWidth: "none", backgroundColor: '#ffffff' }} // overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
            >

                <div className='w-full h-[77vh]'>
                    {/* header */}
                    <div className='h-[10%]'>
                        <Header />
                    </div>
                    {/* Body */}
                    <div className='flex flex-col items-center px-4 w-full h-[90%]'>
                        <button className='mt-6 w-11/12 md:text-4xl text-lg font-[700]' style={{ textAlign: "center" }} onClick={handleContinue}>
                            Get started with your AI agent
                        </button>
                        <div className='mt-8 w-full md:w-10/12 lg:w-6/12 gap-4 flex flex-col max-h-[80%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple px-2' style={{ scrollbarWidth: "none" }}>

                            <div style={styles.headingStyle} className='flex flex-row items-center gap-2'>
                                {`What's your AI agent's name?`}
                                <div
                                    aria-owns={open ? 'mouse-over-popover' : undefined}
                                    aria-haspopup="true"
                                    onMouseEnter={handlePopoverOpen}
                                    onMouseLeave={handlePopoverClose}
                                    style={{ cursor: "pointer" }}
                                >
                                    <Image src={"/assets/infoIcon.png"} height={20} width={20} alt='*' />
                                </div>
                            </div>
                            {/* Info popover */}
                            <Popover
                                id="mouse-over-popover"
                                sx={{ pointerEvents: 'none' }}
                                open={open}
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'center',
                                }}
                                transformOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'center',
                                }}
                                onClose={handlePopoverClose}
                                disableRestoreFocus
                            >
                                <div className='flex flex-row items-center px-2 h-[40px] gap-2'>
                                    <Image src={"/assets/infoIcon.png"} height={20} width={20} alt='*' />
                                    <div style={{ fontWeight: "600", fontSize: 15 }}>
                                        Your AI will identify itself by this name
                                    </div>
                                </div>
                            </Popover>
                            <input
                                placeholder="Ex: Ana's AI, Ana.ai, Ana's Assistant"
                                className='border rounded p-3 outline-none focus:outline-none focus:ring-0'
                                style={{ ...styles.inputStyle, border: "1px solid #00000020" }}
                                value={agentName}
                                onChange={(e) => { setAgentName(e.target.value) }}
                            />

                            <div className='mt-2' style={styles.headingStyle}>
                                {`What's this agent's task?`}
                            </div>

                            <div className='sm:flex sm:flex-row items-center gap-4'>
                                <button className='flex flex-row items-center justify-center gap-2 border h-[60px] w-full sm:w-[240px] outline-none px-6'
                                    style={{
                                        borderRadius: "23px", border: OutBoundCalls ? "2px solid #7902DF" : ""
                                    }}
                                    onClick={handleOutBoundCallClick}>
                                    {OutBoundCalls ?
                                        <Image src={"/assets/callOutFocus.png"} height={24} width={24} alt='*' /> :
                                        <Image src={"/assets/callOut.png"} height={24} width={24} alt='*' />
                                    }
                                    <div
                                        className='text-start ms-2 sm:text-center sm:ms-0'
                                        style={styles.inputStyle}
                                    >
                                        Making outbound calls
                                    </div>
                                </button>
                                <button className='flex flex-row items-center justify-center gap-2 border h-[60px] sm:mt-0 mt-4 w-full sm:w-[240px] outline-none px-6'
                                    style={{
                                        borderRadius: "23px", border: InBoundCalls ? "2px solid #7902DF" : ""
                                    }} onClick={handleInboundCallClick}>
                                    {InBoundCalls ?
                                        <Image src={"/assets/callInFocus.png"} height={24} width={24} alt='*' /> :
                                        <Image src={"/assets/callIn.png"} height={24} width={24} alt='*' />
                                    }
                                    <div
                                        className='text-start ms-2 sm:text-center sm:ms-0'
                                        style={styles.inputStyle}
                                    >
                                        Taking Inbound Calls
                                    </div>
                                </button>
                            </div>

                            <div className='mt-2' style={styles.headingStyle}>
                                {`What's this agent's role?`}
                            </div>
                            <input
                                placeholder="Ex: Senior Property Acquisition Specialist"
                                className='border rounded p-3 outline-none focus:outline-none focus:ring-0'
                                style={{ ...styles.inputStyle, border: "1px solid #00000020" }}
                                value={agentRole}
                                onChange={(e) => { setAgentRole(e.target.value) }}
                            />

                            <div className='mt-2' style={styles.headingStyle}>
                                {`What's this agent's primary objective during the call`}
                            </div>

                            <div style={styles.inputStyle}>
                                Select only one. You can create new agents to dedicate them to other objectives.
                            </div>

                            <div className="flex flex-wrap">
                                {AgentObjective.map((item) => (
                                    <div key={item.id} className="w-full text-start md:w-1/2 pe-2 flex py-4">
                                        <button
                                            className="border-2 w-full rounded-2xl text-start p-4 h-full flex flex-col justify-between outline-none"
                                            onClick={() => { handleToggleClick(item) }}
                                            style={{ borderColor: item.id === toggleClick ? "#7902DF" : "", backgroundColor: item.id === toggleClick ? "#402FFF10 " : "" }}
                                        >
                                            {item.id === toggleClick ?
                                                <Image src={item.focusIcn} height={30} width={30} alt='*' /> :
                                                <Image src={item.unFocusIcon} height={30} width={30} alt='*' />
                                            }
                                            <div className='mt-8' style={styles.inputStyle}>{item.title}</div>
                                            <div className='mt-4' style={{ fontSize: 11, fontWeight: "300" }}>{item.details}</div>
                                        </button>
                                    </div>
                                ))}
                            </div>


                            {
                                showOtherObjective && (
                                    <div>
                                        <div style={styles.headingStyle}>
                                            {`Agent's Objective`}
                                        </div>
                                        {/* <input ref={bottomRef}
                                            placeholder="Type Here.... "
                                            className='border   rounded p-3 outline-none w-full mt-1 mx-2'
                                            style={styles.inputStyle}
                                            value={otherObjVal}
                                            onChange={(e) => { setOtherObjVal(e.target.value) }}
                                        /> */}
                                        <input
                                            ref={bottomRef}
                                            placeholder="Type Here...."
                                            className="border w-6/12 rounded p-1 outline-none w-full mt-1 mx-2 mb-2 focus:outline-none focus:ring-0"
                                            style={{ ...styles.inputStyle, border: "1px solid #00000020" }}
                                            value={otherObjVal}
                                            onChange={(e) => setOtherObjVal(e.target.value)}
                                        />
                                    </div>
                                )
                            }




                            {/* <Body /> */}
                        </div>
                    </div>
                </div>

                <div className='w-full h-[10%]'>
                    <div>
                        <ProgressBar value={33} />
                    </div>

                    <Footer handleContinue={handleBuildAgent} donotShowBack={true} registerLoader={buildAgentLoader} shouldContinue={shouldContinue} />
                </div>

            </div>


            <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                closeAfterTransition
                BackdropProps={{
                    sx: {
                        backgroundColor: "#00000020",
                        backdropFilter: "blur(5px)",
                    },
                }}
            >
                <Box className="lg:w-4/12 sm:w-10/12 w-full" sx={styles.modalsStyle}>
                    <div className="flex flex-row justify-center w-full h-[70vh]">
                        <div
                            className="w-full overflow-auto"
                            style={{
                                backgroundColor: "#ffffff",
                                padding: 20,
                                borderRadius: "13px",
                            }}
                        >

                            <div className='w-full px-2 h-[90%] overflow-auto' style={{ scrollbarWidth: "none", zIndex: 12 }}>
                                <div className='flex flex-row items-center justify-end w-full'>
                                    <button className='outline-none border-none' onClick={() => { setShowModal(false) }}>
                                        <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                                    </button>
                                </div>

                                <div className='text-center' style={{ fontWeight: "600", fontSize: 24 }}>
                                    Community Update
                                </div>

                                <div style={styles.headingStyle} className='mt-4'>
                                    {`What's the status?`}
                                </div>

                                <div className='flex flex-row flex-wrap gap-4 mt-4'>
                                    {
                                        status.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={(e) => { handleSelectStatus(item) }}
                                                className='px-6 border rounded-3xl h-[65px] text-center flex flex-row justify-center items-center outline-none'
                                                style={{ border: selectedStatus?.id === item.id ? "2px solid #7902DF" : "", backgroundColor: selectedStatus?.id === item.id ? "#402FFF15" : "" }}
                                            >
                                                {item.title}
                                            </button>
                                        ))
                                    }
                                </div>

                                {
                                    showSomtthingElse && (
                                        <div>
                                            <div style={styles.headingStyle} className='mt-4'>
                                                {`What's that`}
                                            </div>

                                            <div className='mt-1'>
                                                <input
                                                    className='h-[50px] border rounded-lg outline-none border p-3 w-full focus:outline-none focus:ring-0'
                                                    // rows={3}
                                                    placeholder='Type here...'
                                                    value={otherStatus}
                                                    onChange={(e) => { setOtherStatus(e.target.value) }}
                                                    style={{ ...styles.inputStyle, border: "1px solid #00000020" }}
                                                />
                                            </div>
                                        </div>
                                    )
                                }

                                <div style={styles.headingStyle} className='mt-4'>
                                    {`What's the address`}
                                </div>

                                <div className='mt-1' style={{ zIndex: 15 }}>
                                    <div>
                                        <input
                                            className='w-full h-[50px] rounded-lg outline-none focus:ring-0'
                                            style={{ border: "1px solid #00000020" }}
                                            placeholder="Type here ..."
                                            value={addressValue}
                                            onChange={(evt) => {
                                                setAddressValue(evt.target.value); // Update input field value
                                                getPlacePredictions({ input: evt.target.value });
                                                setShowDropdown(true); // Show dropdown on input
                                            }}
                                        />
                                        {isPlacePredictionsLoading && <p>Loading...</p>}
                                        {showDropdown && placePredictions.map((item) => renderItem(item))}
                                    </div>
                                </div>
                            </div>

                            <div
                                className='w-full flex flex-row items-center justify-center'
                                style={{ position: "absolute", bottom: 0, left: 0 }}
                            >
                                <button
                                    className='text-white w-11/12 h-[50px] rounded-lg bg-purple mb-8'
                                    onClick={() => { setShowModal(false) }}>
                                    Continue
                                </button>
                            </div>

                            {/* Can be use full to add shadow
                            <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                        </div>
                    </div>
                </Box>
            </Modal>

            <LoaderAnimation loaderModal={loaderModal} />

            {/* <Modal
                open={loaderModal}
                // onClose={() => loaderModal(false)}
                closeAfterTransition
                BackdropProps={{
                    sx: {
                        backgroundColor: "#00000020",
                        backdropFilter: "blur(5px)",
                    },
                }}
            >
                <Box className="lg:w-4/12 sm:w-7/12 w-8/12" sx={styles.modalsStyle}>
                    <div className="flex flex-row justify-center w-full h-[65vh]">
                        <div
                            className="w-full"
                            style={{
                                backgroundColor: "transparent",
                                padding: 20,
                                borderRadius: "13px",
                            }}
                        >

                            <div className='flex flex-row items-center justify-center h-full'>
                                <CircularProgress size={200} thickness={1} />
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal> */}


        </div>
    )
}

export default CreateAgent1
