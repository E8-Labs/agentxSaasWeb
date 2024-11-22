import Body from '@/components/onboarding/Body';
import Header from '@/components/onboarding/Header';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Footer from '@/components/onboarding/Footer';
import { Box, FormControl, MenuItem, Modal, Popover, Select, TextField, Typography } from '@mui/material';
import { CaretDown, CaretUp, DotsThree } from '@phosphor-icons/react';
import Apis from '../apis/Apis';
import axios from 'axios';
import TagInput from '../test/TagInput';
import MentionsInputTest from '../test/MentionsInput';
import Objection from './advancedsettings/Objection';
import GuardianSetting from './advancedsettings/GuardianSetting';
import KYCs from './KYCs';
import GreetingTag from './tagInputs/GreetingTag';
import CallScriptTag from './tagInputs/CallScriptTag';

const Pipeline2 = ({ handleContinue, handleBack }) => {

    const router = useRouter();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [kycsData, setKycsData] = useState(null);
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const [AgentDetails, setAgentDetails] = useState(null);
    //code for tag inputs
    // const [greetingTagInput, setGreetingTagInput] = useState("");
    // const [scriptTagInput, setScriptTagInput] = useState("");
    //code for tag input
    // const [greetingTagInput, setGreetingTagInput] = useState('');
    // const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    // const [cursorPosition, setCursorPosition] = useState(0);
    // const greetingInputRef = useRef(null); // Reference to the input element

    // const tags = ['name', 'phone', 'email', 'address'];

    const [loader, setLoader] = useState(false);
    //variables for advance setting variables
    const [advancedSettingModal, setAdvancedSettingModal] = useState(false);
    const [settingToggleClick, setSettingToggleClick] = useState(1);
    const [showObjectiveDetail, setShowObjectiveDetails] = useState(false);
    const [columnloader, setColumnloader] = useState(false);

    // const handleInputChange = (e) => {
    //     const value = e.target.value;
    //     const cursorPos = e.target.selectionStart;

    //     setGreetingTagInput(value);
    //     setCursorPosition(cursorPos);

    //     // Show dropdown if `{` is typed
    //     if (value[cursorPos - 1] === '{') {
    //         setIsDropdownVisible(true);
    //     } else {
    //         setIsDropdownVisible(false);
    //     }
    // };

    // const handleGreetingsTagChange = (tag) => {
    //     console.log("Tage is :", tag);
    //     const beforeCursor = greetingTagInput.slice(0, cursorPosition);
    //     const afterCursor = greetingTagInput.slice(cursorPosition);

    //     // Replace `{` with the selected tag
    //     const updatedInput = beforeCursor.replace(/\{$/, `{${tag}} `) + afterCursor;

    //     setGreetingTagInput(updatedInput);
    //     setIsDropdownVisible(false);

    //     // Move focus back to the input and place the cursor after the inserted tag
    //     const newCursorPosition = beforeCursor.length + tag.length + 2; // Position after the tag
    //     setCursorPosition(newCursorPosition);

    //     // Set focus and cursor position
    //     greetingInputRef.current.focus();
    //     setTimeout(() => {
    //         greetingInputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
    //     }, 0);
    // };

    const tags = ['name', 'phone', 'email', 'address', 'name han'];
    const [greetingTagInput, setGreetingTagInput] = useState('');
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [filteredTags, setFilteredTags] = useState(tags); // Filtered dropdown items
    const greetingInputRef = useRef(null); // Reference to the input element

    const handleInputChange = (e) => {
        const value = e.target.value;
        const cursorPos = e.target.selectionStart;

        setGreetingTagInput(value);
        setCursorPosition(cursorPos);

        // Extract text after the last `{`
        const textAfterLastBrace = value.slice(value.lastIndexOf('{') + 1, cursorPos);

        if (value[cursorPos - 1] === '{') {
            setFilteredTags(tags); // Show all tags when `{` is typed
            setIsDropdownVisible(true);
        } else if (value.includes('{') && isDropdownVisible) {
            // Filter tags based on input after `{`
            const filtered = tags.filter((tag) =>
                tag.startsWith(textAfterLastBrace)
            );
            setFilteredTags(filtered);
        } else {
            setIsDropdownVisible(false);
        }
    };

    // const handleGreetingsTagChange = (tag) => {
    //     // Replace the last `{text` with the selected tag
    //     const value = greetingTagInput;
    //     const lastBraceIndex = value.lastIndexOf('{');
    //     const beforeCursor = greetingTagInput.slice(0, cursorPosition);
    //     const afterCursor = greetingTagInput.slice(cursorPosition);

    //     // Replace `{` with the selected tag
    //     const updatedInput = beforeCursor.replace(/\{$/, `{${tag}} `) + afterCursor;

    //     // const newValue = value.slice(0, lastBraceIndex + 1) + tag + value.slice(cursorPosition);

    //     setGreetingTagInput(updatedInput);
    //     setIsDropdownVisible(false);

    //     // Move the cursor after the inserted tag
    //     setTimeout(() => {
    //         const input = greetingInputRef.current;
    //         input.setSelectionRange(lastBraceIndex + tag.length + 1, lastBraceIndex + tag.length + 1);
    //         input.focus();
    //     }, 0);
    // };

    const handleGreetingsTagChange = (tag) => {
        // Replace the last `{text` with `{ tag }` (with spaces)
        const value = greetingTagInput;
        const lastBraceIndex = value.lastIndexOf('{');
        const newValue =
            value.slice(0, lastBraceIndex + 1) + ` ${tag} ` + `} ` + value.slice(cursorPosition);

        setGreetingTagInput(newValue);
        setIsDropdownVisible(false);

        // Move the cursor after the inserted tag
        setTimeout(() => {
            const input = greetingInputRef.current;
            const newCursorPosition = lastBraceIndex + tag.length + 5; // Adjust for spaces
            input.setSelectionRange(newCursorPosition, newCursorPosition);
            input.focus();
        }, 0);
    };

    const [scriptTagInput, setScriptTagInput] = useState('');
    const [promptDropDownVisible, setPromptDropDownVisible] = useState(false);
    const [kYCSDropDown, setKYCSDropDown] = useState(false)
    const [promptCursorPosition, setPromptCursorPosition] = useState(0);
    const textFieldRef = useRef(null); // Reference to the TextField element

    const tags1 = ['name', 'Agent Name', 'Brokerage Name', 'Client Name'];

    // const handlePromptChange = (e) => {
    //     const value = e.target.value;
    //     const cursorPos = e.target.selectionStart;

    //     setScriptTagInput(value);
    //     setPromptCursorPosition(cursorPos);

    //     // Show dropdown if `{` is typed
    //     if (value[cursorPos - 1] === '{') {
    //         setPromptDropDownVisible(true);
    //     } else {
    //         setPromptDropDownVisible(false);
    //     }
    // };

    const handlePromptChange = (e) => {
        const value = e.target.value;
        const cursorPos = e.target.selectionStart;

        setScriptTagInput(value);
        setPromptCursorPosition(cursorPos);

        // Show dropdown if `{kyc|` is typed, case-insensitive
        const typedText = value.slice(0, cursorPos).toLowerCase(); // Get text up to the cursor in lowercase
        if (typedText.endsWith('{kyc|')) {
            setKYCSDropDown(true);
        } else if (typedText.endsWith('{')) {
            setPromptDropDownVisible(true);
        } else {
            setPromptDropDownVisible(false);
            setKYCSDropDown(false);
        }
    };


    // const handlePromptTagSelection = (tag) => {
    //     const beforeCursor = scriptTagInput.slice(0, promptCursorPosition);
    //     const afterCursor = scriptTagInput.slice(promptCursorPosition);

    //     // Replace `{` with the selected tag
    //     const updatedInput = beforeCursor.replace(/\{$/, `{${tag}} `) + afterCursor;

    //     setScriptTagInput(updatedInput);
    //     setPromptDropDownVisible(false);

    //     // Move focus back to the input and place the cursor after the inserted tag
    //     const newCursorPosition = beforeCursor.length + tag.length + 2; // Position after the tag
    //     setPromptCursorPosition(newCursorPosition);

    //     // Set focus and cursor position
    //     textFieldRef.current.focus();
    //     setTimeout(() => {
    //         textFieldRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
    //     }, 0);
    // };

    const handlePromptTagSelection = (selectedKYC) => {
        const beforeCursor = scriptTagInput.slice(0, promptCursorPosition);
        const afterCursor = scriptTagInput.slice(promptCursorPosition);

        // Insert the selected KYC tag in the desired format
        const updatedInput = `${beforeCursor} ${selectedKYC} }${afterCursor}`;

        // const updatedInput = beforeCursor.slice(0, 4) + `{ KYC | ${selectedKYC} } ${afterCursor}`;

        // Update the input value and close the dropdown
        setScriptTagInput(updatedInput);
        setPromptDropDownVisible(false);
        setKYCSDropDown(false);

        // Calculate the new cursor position after the selected KYC tag
        const newCursorPosition = beforeCursor.length + ` KYC | ${selectedKYC} `.length + 2; // Account for brackets and spaces

        // Update the cursor position state
        setPromptCursorPosition(newCursorPosition);

        // Focus the input field and set the cursor position after the inserted tag
        setTimeout(() => {
            if (textFieldRef.current) {
                textFieldRef.current.focus();
                textFieldRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
            }
        }, 0);
    };



    useEffect(() => {
        const agentDetailsLocal = localStorage.getItem("agentDetails");
        if (agentDetailsLocal) {
            const localAgentData = JSON.parse(agentDetailsLocal);
            console.log("Locla agent details are :-", localAgentData);
            setAgentDetails(localAgentData);
            setScriptTagInput(localAgentData.agents[0].prompt);
        }
    }, []);

    useEffect(() => {
        console.log("KYCS DETAILS RECIEVED ARE :", kycsData);
        // if (isDropdownVisible === true) {
        //     getUniquesColumn()
        // }
    }), [isDropdownVisible, kycsData]

    //code for getting uniqueCcolumns
    const getUniquesColumn = async () => {
        try {
            setColumnloader(true);
            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const UserDetails = JSON.parse(localData);
                AuthToken = UserDetails.token;
            }

            console.log("Auth token is :--", AuthToken);

            const ApiPath = Apis.uniqueColumns;
            console.log("Api path is ", ApiPath);

            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of getColumns api is:", response.data);
            }

        } catch (error) {
            console.error("Error occured in getColumn is :", error);
        } finally {
            setColumnloader(false)
        }
    }

    const handleAdvanceSettingToggleClick = (id) => {
        setSettingToggleClick(prevId => (prevId === id ? null : id));
    }

    //code for getting tag value from input fields
    // const handleGreetingTag = (value) => {
    //     console.log("Greeting value is :--", value);
    //     setGreetingTagInput(value);
    // }

    // const handleCallScriptTag = (value) => {
    //     console.log("Script tag value is :--", value);
    //     setScriptTagInput(value);
    // }


    const handleNextClick = async () => {
        // router.push("/dashboard");

        // console.log("Greeting value is :", greetingTagInput);

        // console.log("Promt details are :", scriptTagInput);

        // return
        try {
            setLoader(true);

            let AuthToken = null;
            const localData = localStorage.getItem("User");
            if (localData) {
                const Data = JSON.parse(localData);
                console.log("Localdat recieved is :--", Data);
                AuthToken = Data.token;
            }

            let mainAgentId = null;
            let AgentName = null;
            let AgentObjective = null;
            let AgentDescription = null;
            let AgentType = null;
            let AgentRole = null;
            let Stat = null;
            let Address = null;
            // let VoiceId = "Mtewh2emAIf6sPTaximW";
            const mainAgentData = localStorage.getItem("agentDetails");
            if (mainAgentData) {
                const Data = JSON.parse(mainAgentData);
                console.log("Localdat recieved is :--", Data);
                mainAgentId = Data.id;
                AgentName = Data.name;
                AgentObjective = Data.agents[0].agentObjective;
                AgentDescription = Data.agents[0].agentObjectiveDescription;
                AgentType = Data.agents[0].agentType;
                Address = Data.agents[0].address;
                AgentRole = Data.agents[0].agentRole;
            }

            console.log("Auth token is :--", AuthToken);

            const ApiPath = Apis.updateAgent;
            console.log("Api path is :--", ApiPath);


            const formData = new FormData();

            formData.append("name", AgentName);
            formData.append("agentRole", AgentRole);
            formData.append("agentObjective", AgentObjective);
            formData.append("agentObjectiveDescription", AgentDescription);
            formData.append("agentType", AgentType);
            formData.append("status", "Just Listed");
            formData.append("address", Address);
            formData.append("mainAgentId", mainAgentId);
            // formData.append("voiceId", VoiceId);
            formData.append("prompt", greetingTagInput);
            formData.append("greeting", scriptTagInput);

            console.log("Update agent details are is :-----");
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            const response = await axios.post(ApiPath, formData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken
                }
            });

            if (response) {
                console.log("Response of update api is :--", response);
                if (response.data.status === true) {
                    handleAddCadence()
                    // router.push("/dashboard");
                }
            }

        } catch (error) {
            console.error("Error occured in update agent api is:", error);
        } finally {
            setLoader(false);
            console.log("update agent api completed");
        }
    }

    const handleAddCadence = async () => {
        try {
            setLoader(true);
            console.log("");
            let cadence = null;
            const cadenceData = localStorage.getItem("AddCadenceDetails");
            if (cadenceData) {
                const cadenceDetails = JSON.parse(cadenceData);
                cadence = cadenceDetails;
            }

            console.log("cadence details are :",
                cadence
            );

            let mainAgentId = null;
            const mainAgentData = localStorage.getItem("agentDetails");
            if (mainAgentData) {
                const Data = JSON.parse(mainAgentData);
                console.log("Localdat recieved is :--", Data);
                mainAgentId = Data.id;
            }

            let AuthToken = null;
            const localData = localStorage.getItem("User");
            if (localData) {
                const Data = JSON.parse(localData);
                console.log("Localdat recieved is :--", Data);
                AuthToken = Data.token;
            }

            console.log("Authtoke for add cadence api is :", AuthToken);

            console.log("Main agent id is :", mainAgentId);

            const ApiData = {
                pipelineId: cadence.pipelineID,
                mainAgentId: mainAgentId,
                cadence: cadence.cadenceDetails
            }

            const ApiPath = Apis.createPipeLine;
            console.log("Api path is :", ApiPath);

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of create pipeline api is :---", response);
                if (response.data.status === true) {
                    router.push("/dashboard");
                }
            }


        } catch (error) {
            console.error("Error occured in api is :", error);
        } finally {
            setLoader(false);
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
            <div className='bg-white rounded-2xl w-10/12 h-[90vh] py-4 overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple flex flex-col justify-between'>
                <div>
                    {/* header */}
                    <Header />
                    {/* Body */}
                    <div className='flex flex-col items-center px-4 w-full'>
                        <div className='mt-6 w-11/12 md:text-4xl text-lg font-[700]' style={{ textAlign: "center" }}>
                            {`Let's Review`}
                        </div>
                        <div className='mt-8 w-7/12 gap-4 flex flex-col'>
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
                                value={greetingTagInput}
                                onChange={(e) => { setGreetingTagInput(e.target.value) }}
                            /> */}

                            {/* <div className="relative">
                                <input
                                    className="border p-2 rounded-lg outline-none bg-transparent w-full"
                                    placeholder="Hey {name}, It's {Agent Name} with {Brokerage Name}! How's it going?"
                                    value={greetingTagInput}
                                    onChange={handleInputChange}
                                />

                                {isDropdownVisible && (
                                    <div className="absolute bg-white border rounded-lg mt-1 shadow-md w-full z-10">
                                        {tags.map((tag) => (
                                            <div
                                                key={tag}
                                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => handleGreetingsTagChange(tag)}
                                            >
                                                {tag}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div> */}

                            {/* <div className="relative">
                                <input
                                    ref={greetingInputRef} // Attach the ref to the input
                                    className="border p-2 rounded-lg outline-none bg-transparent w-full"
                                    placeholder="Hey {name}, It's {Agent Name} with {Brokerage Name}! How's it going?"
                                    value={greetingTagInput}
                                    onChange={handleInputChange}
                                />

                                {isDropdownVisible && (
                                    <div className="absolute bg-white border rounded-lg mt-1 shadow-md w-full z-10">
                                        {tags.map((tag) => (
                                            <div
                                                key={tag}
                                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => handleGreetingsTagChange(tag)}
                                            >
                                                {tag}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div> */}



                            <div className="relative">
                                <input
                                    ref={greetingInputRef} // Attach the ref to the input
                                    className="border p-2 rounded-lg outline-none bg-transparent w-full"
                                    placeholder="Hey {name}, It's {Agent Name} with {Brokerage Name}! How's it going?"
                                    value={greetingTagInput}
                                    onChange={handleInputChange}
                                />

                                {isDropdownVisible && filteredTags.length > 0 && (
                                    <div className="absolute bg-white border rounded-lg mt-1 shadow-md w-full z-10">
                                        {filteredTags.map((tag) => {
                                            // filteredTags.includes()
                                            return (
                                                <div
                                                    key={tag}
                                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => handleGreetingsTagChange(tag)}
                                                >
                                                    {tag}
                                                </div>)
                                        })}
                                    </div>
                                )}
                            </div>


                            {/* <MentionsInputTest /> <TagInput /> */}

                            {/* <GreetingTag handleGreetingTag={handleGreetingTag} /> */}

                        </div>
                        <div className='w-7/12 mt-4 ps-8'>
                            <div style={styles.headingStyle}>
                                Call Script
                            </div>
                            <div className='mt-6'>

                                {/* <TextField
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
                                    value={scriptTagInput}
                                    onChange={(e) => { setScriptTagInput(e.target.value) }}
                                /> */}

                                <Box sx={{ position: 'relative', width: '100%' }}>
                                    <TextField
                                        inputRef={textFieldRef} // Attach the ref to the TextField
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
                                        value={scriptTagInput}
                                        onChange={handlePromptChange}
                                    />

                                    {promptDropDownVisible && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                background: '#fff',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                                                mt: 1,
                                                zIndex: 1000,
                                                width: '100%',
                                            }}
                                        >
                                            {tags.map((tag) => (
                                                <Typography
                                                    key={tag}
                                                    onClick={() => handlePromptTagSelection(tag)}
                                                    sx={{
                                                        padding: '8px 12px',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            backgroundColor: '#f0f0f0',
                                                        },
                                                    }}
                                                >
                                                    {tag}
                                                </Typography>
                                            ))}
                                        </Box>
                                    )}

                                    {kYCSDropDown && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                background: '#fff',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                                                mt: 1,
                                                zIndex: 1000,
                                                width: '100%',
                                            }}
                                        >
                                            {kycsData.map((tag) => (
                                                <Typography
                                                    key={tag.id}
                                                    onClick={() => handlePromptTagSelection(tag.question)}
                                                    sx={{
                                                        padding: '8px 12px',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            backgroundColor: '#f0f0f0',
                                                        },
                                                    }}
                                                >
                                                    {tag.question}
                                                </Typography>
                                            ))}
                                        </Box>
                                    )}

                                </Box>

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
                            <KYCs kycsDetails={setKycsData} />
                            <div className='mt-4' style={styles.headingStyle}>
                                {`Agent's Objective`}
                            </div>
                            <div className='bg-white rounded-xl p-2 px-4 mt-4'>
                                <div className='flex flex-row items-center justify-between'>
                                    <div style={styles.inputStyle}>
                                        Community Update
                                    </div>
                                    <div>
                                        <button onClick={() => { setShowObjectiveDetails(!showObjectiveDetail) }}>
                                            {
                                                showObjectiveDetail ?
                                                    <CaretUp size={25} weight='bold' /> :
                                                    <CaretDown size={25} weight='bold' />
                                            }
                                        </button>
                                    </div>
                                </div>
                                {
                                    showObjectiveDetail && (
                                        <div>
                                            <div className='mt-2' style={styles.inputStyle}>
                                                Provide local homeowners with relevant updates on community events, real estate trends, or new listings in the area.
                                            </div>
                                            <div className='flex flex-row items-center justify-between mt-2'>
                                                <div style={{ ...styles.inputStyle, color: "#00000060" }}>
                                                    Status
                                                </div>
                                                <div style={styles.inputStyle}>
                                                    Comming Soon
                                                </div>
                                            </div>
                                            <div className='flex flex-row items-center justify-between mt-4'>
                                                <input className='outline-none' style={{ ...styles.inputStyle, width: "70%" }} placeholder='Address' />
                                                <div style={{ ...styles.inputStyle }}>
                                                    Address goes here
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
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

                    <Footer handleContinue={handleNextClick} handleBack={handleBack} registerLoader={loader} />
                </div>
            </div>
        </div>
    )
}

export default Pipeline2