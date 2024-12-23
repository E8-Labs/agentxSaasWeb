import Apis from '@/components/apis/Apis'
import { Alert, Box, CircularProgress, Fade, FormControl, InputLabel, MenuItem, Modal, Select, Snackbar, TextareaAutosize } from '@mui/material'
import { CaretDown, CaretUp, EnvelopeSimple, Plus, X } from '@phosphor-icons/react'
import axios from 'axios'
import parsePhoneNumberFromString from 'libphonenumber-js'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

const LeadDetails = ({
    showDetailsModal, selectedLead, setShowDetailsModal }) => {

    const [columnsLength, setcolumnsLength] = useState([]);

    const [initialLoader, setInitialLoader] = useState(false);

    const [selectedLeadsDetails, setSelectedLeadsDetails] = useState(null);
    const [leadColumns, setLeadColumns] = useState([]);

    //code for buttons of details popup
    const [showKYCDetails, setShowKycDetails] = useState(true);
    const [showNotesDetails, setShowNotesDetails] = useState(false);
    const [showAcitivityDetails, setShowAcitivityDetails] = useState(false);

    //code for add stage notes
    const [showAddNotes, setShowAddNotes] = useState(false);
    const [addNotesValue, setddNotesValue] = useState("");
    const [noteDetails, setNoteDetails] = useState([]);
    const [addLeadNoteLoader, setAddLeadNoteLoader] = useState(false);

    //code for call activity transcript text
    const [isExpanded, setIsExpanded] = useState([]);
    const [isExpandedActivity, setIsExpandedActivity] = useState([]);

    //code for audio play popup
    const [showAudioPlay, setShowAudioPlay] = useState(null);
    const [showNoAudioPlay, setShowNoAudioPlay] = useState(false);

    //show custom variables
    const [showCustomVariables, setShowCustomVariables] = useState(false);

    //code for del tag
    const [DelTagLoader, setDelTagLoader] = useState(null);

    //code for stages drop down
    const [selectedStage, setSelectedStage] = useState('');
    const [stagesList, setStagesList] = useState([]);

    //code for snakbars
    const [showSuccessSnack, setShowSuccessSnack] = useState(null);
    const [showErrorSnack, setShowErrorSnack] = useState(null);


    useEffect(() => {
        getLeadDetails(selectedLead);
        getStagesList(selectedLead);
    }, [])

    //function to handle stages dropdown selection
    const handleStageChange = (event) => {
        setSelectedStage(event.target.value);
        // updateLeadStage();
    };

    //function to update stage
    const updateLeadStage = async (stage) => {
        try {

            console.log("I am trigered")
            let AuthToken = null;

            const localDetails = localStorage.getItem("User");
            if (localDetails) {
                const Data = JSON.parse(localDetails);
                // console.log("User details are", Data);
                AuthToken = Data.token;
            }

            const ApiData = {
                pipelineId: selectedLead.id,
                stageId: stage.id
            }

            console.log("Api data sending is", ApiData);

            const ApiPath = Apis.updateLeadStageApi;
            return
            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("response of update api is", response.data);
                if (response.data.status === true) {
                    setShowSuccessSnack(response.data.message);
                } else if (response.data.status === false) {
                    setShowErrorSnack(response.data.message);
                }
            }

        } catch (error) {
            console.error("Error occured in api is", error);
        } finally {
            console.log("Update api done")
        }
    }

    //function to get the lead detils
    const getLeadDetails = async (selectedLead) => {
        try {
            setInitialLoader(true);
            console.log("I am trigered")
            let AuthToken = null;

            const localDetails = localStorage.getItem("User");
            if (localDetails) {
                const Data = JSON.parse(localDetails);
                // console.log("User details are", Data);
                AuthToken = Data.token;
            }

            console.log("Auth token is", AuthToken);

            console.log("Lead details are", selectedLead.LeadModel.id);

            const ApiPath = `${Apis.getLeadDetails}?leadId=${selectedLead.LeadModel.id}`;

            console.log("Apipath is", ApiPath);

            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of api is response", response.data);
                let dynamicColumns = []
                dynamicColumns = [
                    ...response.data.columns,
                    // { title: "Tag" },
                    {
                        title: "More",
                        idDefault: false
                    },
                ];
                // setLeadColumns(response.data.columns);
                setSelectedLeadsDetails(response.data.data);
                setLeadColumns(dynamicColumns);
                setcolumnsLength(response.data.columns);
                setNoteDetails(response.data.data.notes);
                setSelectedStage(response.data.data.stage.stageTitle);
            }

        } catch (error) {
            console.error("Error occured in api is", error);
        } finally {
            setInitialLoader(false);
            console.log("Api call completed")
        }
    }

    //function to get the stages list using pipelineId
    const getStagesList = async () => {
        try {
            let AuthToken = null;

            const localDetails = localStorage.getItem("User");
            if (localDetails) {
                const Data = JSON.parse(localDetails);
                // console.log("User details are", Data);
                AuthToken = Data.token;
            }

            console.log("Auth token is", AuthToken);

            console.log("Lead details are", selectedLead.LeadModel.id);

            const ApiPath = `${Apis.getStagesList}?pipelineId=${selectedLead.PipelineStages.pipelineId}`;

            console.log("Apipath is", ApiPath);

            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of getStages list is ", response.data);
                if (response.data.status === true) {
                    setStagesList(response.data.data[0].stages);
                }
            }


        } catch (error) {
            console.error("Error occured in api is", error);
        } finally {
            console.log("Get stages ai call done")
        }
    }

    //function to add lead notes
    const handleAddLeadNotes = async () => {
        try {
            setAddLeadNoteLoader(true);
            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const UserDetails = JSON.parse(localData);
                AuthToken = UserDetails.token;
            }

            console.log("Auth token is :--", AuthToken);

            const ApiData = {
                note: addNotesValue,
                leadId: selectedLeadsDetails.id
            }

            console.log("api data is:", ApiData);

            const ApiPath = Apis.addLeadNote;
            // return
            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of add api is:", response);
                // setNoteDetails()
                if (response.data.status === true) {
                    setShowAddNotes(false);
                    setNoteDetails([...noteDetails, response.data.data]);
                    setddNotesValue("");
                }
            }



        } catch (error) {
            console.error("Error occured in add lead note api is:", error);
        } finally {
            setAddLeadNoteLoader(false);
        }
    }

    //function to format the phone number
    //function to format the number
    const formatPhoneNumber = (rawNumber) => {
        const phoneNumber = parsePhoneNumberFromString(
            rawNumber?.startsWith('+') ? rawNumber : `+${rawNumber}`
        );
        // console.log("Raw number is", rawNumber);
        return phoneNumber ? phoneNumber.formatInternational() : 'Invalid phone number';
    };

    //function to show the callStatus
    const checkCallStatus = (callActivity) => {
        let callStatus = null;
        let item = callActivity;
        // callActivity.forEach((item) => {
        if (item.status === "completed") {
            // Check for hotlead, humancalldrop, and dnd
            if (item.hotlead || item.humancalldrop || item.dnd) {
                console.log("Status is completed with the following additional information:");
                if (item.hotlead === true) {
                    console.log("Hot Lead");
                    callStatus = "Hot Lead";
                }
                if (item.humancalldrop === true) {
                    console.log("Human Call Drop");
                    callStatus = "Human Call Drop";
                }
                if (item.dnd === true) {
                    console.log("DND");
                    callStatus = "DND";
                }
                if (item.notinterested) {
                    console.log("Not interested");
                    callStatus = "Not Interested";
                }
            } else {
                callStatus = item.status;
                console.log("Status is completed, but no special flags for lead ID:", item.leadId);
            }
        } else {
            console.log("Other status for lead ID:", item.leadId, "Status:", item.status);
            callStatus = item.status;
        }
        // });
        return callStatus;
    };

    //code for custom variables
    const getDetailsColumnData = (column, item) => {
        let filteredColumns = column


        const { title } = filteredColumns;

        console.log("Colums of the list are:", column);
        console.log("Comparing items---", item);

        if (item) {
            switch (title) {
                case "Name":
                    return (
                        <div>

                        </div>
                    );
                case "Date":
                    return item.createdAt ? moment(item.createdAt).format('MMM DD, YYYY') : "-";
                case "Phone":
                    return ("-");
                case "Stage":
                    return item.stage ? item.stage.stageTitle : "No Stage";
                default:
                    const value = item[title];
                    if (typeof value === "object" && value !== null) {
                        // Handle objects gracefully
                        return JSON.stringify(value); // Convert to string or handle as needed
                    }
                    return value || "-";
            }
        }

    };

    //fucntion to ShowMore ActivityData transcript text
    const handleShowMoreActivityData = (item) => {
        // setIsExpanded(!isExpanded);

        setIsExpandedActivity((prevIds) => {
            if (prevIds.includes(item.id)) {
                // Unselect the item if it's already selected
                return prevIds.filter((prevId) => prevId !== item.id);
            } else {
                // Select the item if it's not already selected
                return [...prevIds, item.id];
            }
        });

    };

    //code for del tag api
    const handleDelTag = async (tag) => {
        try {
            setDelTagLoader(tag);

            let AuthToken = null

            const userData = localStorage.getItem("User");
            if (userData) {
                const localData = JSON.parse(userData);
                AuthToken = localData.token
            }

            console.log("Auth token is:", AuthToken);

            const ApiData = {
                tag: tag
            }

            const ApiPath = Apis.delLeadTag;
            console.log("Data sending in api is:", ApiData);
            console.log("Api path is:", ApiPath);

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of del tag api is:", response.data);
                if (response.data.status === true) {
                    console.log("Staus is true");

                    const updatedTags = selectedLeadsDetails.tags.filter((item) => item !== tag);
                    setSelectedLeadsDetails((prevDetails) => ({
                        ...prevDetails,
                        tags: updatedTags,
                    }));

                }
            }


        } catch (error) {
            console.error("Error occured in api is:", error);
        } finally {
            setDelTagLoader(null);
        }
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
    }

    return (
        <div>
            <Modal
                open={showDetailsModal}
                closeAfterTransition
                BackdropProps={{
                    sx: {
                        backgroundColor: "#00000020",
                        // //backdropFilter: "blur(5px)",
                    },
                }}
            >
                <Box className="lg:w-6/12 sm:w-7/12 w-8/12 bg-white py-2 h-[80vh] overflow-auto" sx={{ ...styles.modalsStyle, scrollbarWidth: "none", backgroundColor: "white" }}>
                    <div className="w-full flex flex-col items-center h-full">
                        {/* <div className='flex flex-row justify-between items-center'>
                            <div style={{ fontWeight: "500", fontSize: 16.9 }}>
                                Details
                            </div>
                            <button onClick={() => { setShowDetailsModal(false) }}>
                                <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                            </button>
                        </div> */}
                        <div className='w-full'>
                            {initialLoader ?
                                <div className='w-full flex flex-row items-center justify-center mt-24'>
                                    <CircularProgress size={45} thickness={2} />
                                </div> :
                                <div>
                                    <div
                                        style={{
                                            padding: 20,
                                            paddingInline: 30,
                                        }}
                                    >
                                        <div className='flex flex-row justify-between items-center'>
                                            <div style={{ fontWeight: "500", fontSize: 16.9 }}>
                                                Details
                                            </div>
                                            <button onClick={() => { setShowDetailsModal(false) }}>
                                                <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                                            </button>
                                        </div>

                                        <div className='flex flex-row items-center gap-4'>
                                            <div className='h-[32px] w-[32px] bg-black rounded-full flex flex-row items-center justify-center text-white'
                                                onClick={() => handleToggleClick(item.id)}>
                                                {selectedLeadsDetails?.firstName.slice(0, 1)}
                                            </div>
                                            <div className='truncate'
                                                onClick={() => handleToggleClick(item.id)}>
                                                {selectedLeadsDetails?.firstName} {selectedLeadsDetails?.lastName}
                                            </div>
                                        </div>

                                        <div className='flex flex-row items-center w-full justify-between mt-4'>
                                            <div className='flex flex-row items-center gap-2'>
                                                <EnvelopeSimple size={20} color='#00000060' />
                                                <div style={styles.subHeading}>
                                                    Email Address
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-end" style={styles.heading2}>
                                                    {selectedLeadsDetails?.email}
                                                </div>
                                                <div className='flex flex-row items-center gap-2 px-1 mt-1 rounded-lg border border-[#00000020]' style={styles.paragraph}>
                                                    <Image src={"/assets/power.png"} height={9} width={7} alt='*' />
                                                    <div>
                                                        <span className='text-purple'>New</span> hamza@yahoo.com
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='flex flex-row items--center w-full justify-between mt-4'>
                                            <div className='flex flex-row items-center gap-2'>
                                                {/* <EnvelopeSimple size={20} color='#00000060' /> */}
                                                <Image src={"/assets/call.png"} height={16} width={16} alt='man' />
                                                <div style={styles.subHeading}>
                                                    Phone Number
                                                </div>
                                            </div>
                                            <div className="text-end" style={styles.paragraph}>
                                                {/* {selectedLeadsDetails?.phone} */}
                                                {formatPhoneNumber(selectedLeadsDetails?.phone)}
                                            </div>
                                        </div>

                                        <div className='flex flex-row items--center w-full justify-between mt-4'>
                                            <div className='flex flex-row items-center gap-2'>
                                                {/* <EnvelopeSimple size={20} color='#00000060' /> */}
                                                <Image src={"/assets/location.png"} height={16} width={16} alt='man' />
                                                <div style={styles.subHeading}>
                                                    Address
                                                </div>
                                            </div>
                                            <div className="text-end" style={styles.paragraph}>
                                                {selectedLeadsDetails?.address}
                                            </div>
                                        </div>

                                        <div className='flex flex-row items--center w-full justify-between mt-4'>
                                            <div className='flex flex-row items-center gap-2'>
                                                <Image src={"/assets/tag.png"} height={16} width={16} alt='man' />
                                                <div style={styles.subHeading}>
                                                    Tag
                                                </div>
                                            </div>
                                            {
                                                selectedLeadsDetails?.tags.length > 0 ? (
                                                    <div className="text-end flex flex-row items-center gap-2" style={styles.paragraph}>
                                                        {
                                                            // selectedLeadsDetails?.tags?.map.slice(0, 1)
                                                            selectedLeadsDetails?.tags.slice(0, 2).map((tag, index) => {
                                                                return (
                                                                    <div key={index} className='flex flex-row items-center gap-2'>
                                                                        <div
                                                                            className='flex flex-row items-center gap-2 bg-[#402FFF30] px-2 py-1 rounded-lg'
                                                                        >
                                                                            <div
                                                                                className="text-[#402FFF]" //1C55FF10
                                                                            >
                                                                                {tag}
                                                                            </div>
                                                                            {
                                                                                DelTagLoader && tag.includes(DelTagLoader) ?
                                                                                    <div>
                                                                                        <CircularProgress size={15} />
                                                                                    </div> :
                                                                                    <button onClick={() => { handleDelTag(tag) }}>
                                                                                        <X size={15} weight='bold' color='#402fff' />
                                                                                    </button>
                                                                            }

                                                                        </div>
                                                                        <div>
                                                                            {
                                                                                selectedLeadsDetails?.tags.length > 2 && (
                                                                                    <div>
                                                                                        +{selectedLeadsDetails?.tags.length - 2}
                                                                                    </div>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                ) : "-"
                                            }
                                        </div>

                                        <div className='flex flex-row items--center w-full justify-between mt-4'>
                                            <div className='flex flex-row items-center gap-2'>
                                                <Image src={"/assets/arrow.png"} height={16} width={16} alt='man' />
                                                <div style={styles.subHeading}>
                                                    Stage
                                                </div>
                                            </div>
                                            <div className="text-end flex flex-row items-center gap-1" style={styles.paragraph}>
                                                <div className='h-[10px] w-[10px] rounded-full' style={{ backgroundColor: selectedLeadsDetails?.stage?.defaultColor }}>
                                                </div>
                                                {/* {selectedLeadsDetails?.stage?.stageTitle || "-"} */}
                                                <FormControl size="fit-content">
                                                    <Select
                                                        value={selectedStage}
                                                        onChange={handleStageChange}
                                                        displayEmpty // Enables placeholder
                                                        renderValue={(selected) => {
                                                            if (!selected) {
                                                                return <div style={{ color: "#aaa" }}>Select</div>; // Placeholder style
                                                            }
                                                            return selected;
                                                        }}
                                                        sx={{
                                                            border: "none", // Default border
                                                            "&:hover": {
                                                                border: "none", // Same border on hover
                                                            },
                                                            "& .MuiOutlinedInput-notchedOutline": {
                                                                border: "none", // Remove the default outline
                                                            },
                                                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                                border: "none", // Remove outline on focus
                                                            },
                                                            "& .MuiSelect-select": {
                                                                padding: "0 24px 0 8px", // Add padding to create space for the icon
                                                                lineHeight: 1, // Align with font size
                                                                minHeight: "unset", // Ensure no extra height is enforced
                                                                display: "flex", // Proper alignment
                                                                alignItems: "center",
                                                            },
                                                            "& .MuiSelect-icon": {
                                                                right: "4px", // Adjust the position of the icon
                                                                top: "50%", // Center the icon vertically
                                                                transform: "translateY(-50%)", // Ensure vertical alignment
                                                            },
                                                        }}
                                                        MenuProps={{
                                                            PaperProps: {
                                                                style: {
                                                                    maxHeight: "30vh", // Limit dropdown height
                                                                    overflow: "auto", // Enable scrolling in dropdown
                                                                    scrollbarWidth: "none",
                                                                    // borderRadius: "10px"
                                                                },
                                                            },
                                                        }}
                                                    >
                                                        {
                                                            stagesList.map((item, index) => {
                                                                return (
                                                                    <MenuItem
                                                                        value={item.stageTitle}
                                                                        key={index}
                                                                    >
                                                                        <button
                                                                            className='outline-none border-none'
                                                                            onClick={() => {updateLeadStage(item)}}
                                                                        >
                                                                            {item.stageTitle}
                                                                        </button>
                                                                    </MenuItem>
                                                                )
                                                            }
                                                            )
                                                        }
                                                    </Select>
                                                </FormControl>
                                            </div>
                                        </div>

                                        <div className='flex flex-row items--center w-full justify-between mt-4'>
                                            <div className='flex flex-row items-center gap-2'>
                                                <Image src={"/assets/manIcn.png"} height={16} width={16} alt='man' />
                                                <div style={styles.subHeading}>
                                                    Assigne
                                                </div>
                                            </div>
                                            <div className="text-end" style={styles.paragraph}>
                                                <Image src={"/assets/manIcon.png"} height={40} width={40} alt='man' />
                                            </div>
                                        </div>

                                        {/* Code for custom variables */}

                                        <div className='mt-2'>
                                            <button
                                                onClick={() => {
                                                    setShowCustomVariables(!showCustomVariables);
                                                }}
                                                className='flex flex-row items-center w-full justify-between border rounded-xl h-[40px] px-2 outline-none'
                                            >
                                                <div className='flex flex-row items-center gap-3'>
                                                    <Image
                                                        src={"/assets/customsIcon.svg"} alt='*'
                                                        height={16} width={16}
                                                    />
                                                    <div
                                                        style={{
                                                            fontWeight: "600", fontsize: 15,
                                                            color: "#15151560"
                                                        }}
                                                    >
                                                        Custom fields
                                                    </div>
                                                    {
                                                        showCustomVariables ? (
                                                            <CaretUp size={16} weight='bold' color='#15151570' />
                                                        ) : (
                                                            <CaretDown size={16} weight='bold' color='#15151570' />
                                                        )
                                                    }
                                                </div>
                                                <div>
                                                    {
                                                        leadColumns.length > 0 && (
                                                            <div
                                                                className='text-purple underline'
                                                                style={{ fontsize: 15, fontWeight: "500" }}
                                                            >
                                                                +{columnsLength?.length - 4}
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </button>
                                        </div>

                                        {
                                            showCustomVariables && (
                                                <div className='flex flex-col gap-4 mt-4'>
                                                    {

                                                        leadColumns.map((column, index) => {
                                                            if (column.title == "Name" || column.title == "Phone" || column.title == "address" || column.title == "More" || column.title == 0 || column.title == "Stage") {
                                                                return (
                                                                    // <div key={index}></div>
                                                                    ""
                                                                )
                                                            }
                                                            return (
                                                                <div key={index} className='flex flex-row w-full justify-between'>
                                                                    <div className='flex flex-row items-center gap-4'>
                                                                        {/* <Image src={"/"} */}
                                                                        <div>
                                                                            -
                                                                        </div>
                                                                        <div style={styles.subHeading}>
                                                                            {column.title}
                                                                        </div>
                                                                    </div>
                                                                    <div style={styles.paragraph}>
                                                                        {getDetailsColumnData(column, selectedLeadsDetails)}
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                </div>
                                            )
                                        }

                                    </div>

                                    <div className='flex flex-row items-center gap-4 mt-2'
                                        style={{
                                            ...styles.paragraph,
                                            paddingInline: 30
                                        }}>
                                        <button className='outline-none'
                                            onClick={() => {
                                                setShowKycDetails(true);
                                                setShowNotesDetails(false);
                                                setShowAcitivityDetails(false);
                                            }}
                                            style={{
                                                borderBottom: showKYCDetails ? "2px solid #7902DF" : ""
                                            }}
                                        >
                                            KYC
                                        </button>
                                        <button className='outline-none'
                                            onClick={() => {
                                                setShowKycDetails(false);
                                                setShowNotesDetails(true);
                                                setShowAcitivityDetails(false);
                                            }}
                                            style={{
                                                borderBottom: showNotesDetails ? "2px solid #7902DF" : ""
                                            }}
                                        >
                                            Notes
                                        </button>
                                        <button className='outline-none'
                                            onClick={() => {
                                                setShowKycDetails(false);
                                                setShowNotesDetails(false);
                                                setShowAcitivityDetails(true);
                                            }}
                                            style={{
                                                borderBottom: showAcitivityDetails ? "2px solid #7902DF" : ""
                                            }}
                                        >
                                            Activity
                                        </button>
                                    </div>
                                    <div className='w-full' style={{ height: "1px", backgroundColor: "#15151530" }} />

                                    <div style={{ paddingInline: 30 }}>

                                        {
                                            showKYCDetails && (
                                                <div>
                                                    {
                                                        selectedLeadsDetails?.kycs.length < 1 ? (
                                                            <div className='flex flex-col items-center justify-center h-[20vh] w-full' style={{ fontWeight: "500", fontsize: 15 }}>
                                                                <div className='h-[52px] w-[52px] rounded-full bg-[#00000020] flex flex-row items-center justify-center'>
                                                                    <Image src={"/assets/FAQ.png"} height={24} width={24} alt='*' />
                                                                </div>
                                                                <div className='mt-4'>
                                                                    <i style={{ fontWeight: "500", fontsize: 15 }}>
                                                                        KYC Data collected from calls will be shown here
                                                                    </i>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className='w-full mt-4 pb-12'>
                                                                <div style={{ fontWeight: "600", fontSize: 16.8 }}>
                                                                    Know Your Customer
                                                                </div>
                                                                {
                                                                    selectedLeadsDetails?.kycs.map((item, index) => {
                                                                        return (
                                                                            <div className='w-full flex flex-row gap-2 mt-2' key={index}>
                                                                                <div className='h-full' style={{ width: "2px", backgroundColor: "red" }}>
                                                                                </div>
                                                                                <div className='h-full w-full'>
                                                                                    {/* <div className='mt-4' style={{ fontWeight: "600", fontSize: 15 }}>
                                            Outcome | <span style={{ fontWeight: "600", fontSize: 12 }} className='text-purple'>
                                                {selectedLeadsDetails?.firstName} {selectedLeadsDetails?.lastName}
                                            </span>
                                        </div> */}
                                                                                    <div className='mt-4'
                                                                                        style={{
                                                                                            // border: "1px solid #00000020", padding: 10, borderRadius: 15
                                                                                        }}>
                                                                                        <div style={{ fontWeight: "500", fontSize: 13, color: "#00000060" }}>
                                                                                            {item.question}
                                                                                        </div>
                                                                                        <div className='mt-1' style={{ fontWeight: "500", fontSize: 15, }}>
                                                                                            {item.answer}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div>

                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            )
                                        }


                                        {
                                            showNotesDetails && (
                                                <div>
                                                    {
                                                        selectedLeadsDetails?.notes.length < 1 ? (
                                                            <div className='flex flex-col items-center justify-center h-[100%] w-full' style={{ fontWeight: "500", fontsize: 15 }}>
                                                                <div className='h-[52px] w-[52px] rounded-full bg-[#00000020] flex flex-row items-center justify-center'>
                                                                    <Image src={"/assets/notes.png"} height={24} width={24} alt='*' />
                                                                </div>
                                                                <div className='mt-4'>
                                                                    <i style={{ fontWeight: "500", fontsize: 15 }}>
                                                                        You can add and manage your notes here
                                                                    </i>
                                                                </div>
                                                                <button
                                                                    className='flex flex-row items-center gap-1 mt-2'
                                                                    onClick={() => { setShowAddNotes(true) }}
                                                                >
                                                                    <Plus size={17} color='#7902DF' weight='bold' />
                                                                    <div className='text-purple'>
                                                                        Add Notes
                                                                    </div>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className=''>
                                                                <div className='' style={{ scrollbarWidth: "none" }}>
                                                                    {
                                                                        noteDetails.map((item, index) => {
                                                                            return (
                                                                                <div key={index} className='border rounded-xl p-4 mb-4 mt-4' style={{ border: "1px solid #00000020" }}>
                                                                                    <div style={{ fontWeight: "500", color: "#15151560", fontsize: 12 }}>
                                                                                        {moment(item.createdAt).format("MMM DD, YYYY")}
                                                                                    </div>
                                                                                    <div
                                                                                        className='mt-4'
                                                                                        style={{ fontWeight: "500", color: "#151515", fontsize: 15 }}
                                                                                    >
                                                                                        {item.note}
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        })
                                                                    }
                                                                </div>
                                                                <div className='flex flex-col items-start justify-start w-full pb-6' style={{ fontWeight: "500", fontsize: 15 }}>
                                                                    <button
                                                                        className='flex flex-row items-center gap-1 mt-2'
                                                                        onClick={() => { setShowAddNotes(true) }}
                                                                    >
                                                                        <Plus size={17} color='#7902DF' weight='bold' />
                                                                        <div className='text-purple'>
                                                                            Add Notes
                                                                        </div>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            )
                                        }


                                        {
                                            showAcitivityDetails && (
                                                <div>
                                                    {
                                                        selectedLeadsDetails?.callActivity.length < 1 ? (
                                                            <div className='flex flex-col items-center justify-center h-[20vh] w-full' style={{ fontWeight: "500", fontsize: 15 }}>
                                                                <div className='h-[52px] w-[52px] rounded-full bg-[#00000020] flex flex-row items-center justify-center'>
                                                                    <Image src={"/assets/activityClock.png"} height={24} width={24} alt='*' />
                                                                </div>
                                                                <div className='mt-4'>
                                                                    <i style={{ fontWeight: "500", fontsize: 15 }}>
                                                                        All activities related to this lead will be shown here
                                                                    </i>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                {
                                                                    selectedLeadsDetails?.callActivity.map((item, index) => {
                                                                        const initialTextLength = Math.ceil(item.transcript?.length * 0.1); // 40% of the text
                                                                        const initialText = item.transcript?.slice(0, initialTextLength);
                                                                        return (
                                                                            <div key={index} className='mt-4'>
                                                                                <div className='-ms-4' style={{ fontsize: 15, fontWeight: "500", color: "#15151560" }}>
                                                                                    {moment(item.createdAt).format("MM/DD/YYYY hh:mm")}
                                                                                </div>
                                                                                <div className='w-full flex flex-row items-center gap-2 h-full'>
                                                                                    <div className='pb-4 pt-6 ps-4 w-full' style={{ borderLeft: "1px solid #00000020" }}>
                                                                                        <div className='h-full w-full'>
                                                                                            <div className='flex flex-row items-center justify-between'>
                                                                                                <div className='flex flex-row items-center gap-1'>
                                                                                                    <div
                                                                                                        style={{
                                                                                                            fontWeight: "600",
                                                                                                            fontsize: 15
                                                                                                        }}>
                                                                                                        Outcome |
                                                                                                    </div>
                                                                                                    <div className='text-purple' style={{ fontWeight: "600", fontsize: 12 }}>
                                                                                                        {selectedLeadsDetails?.firstName} {selectedLeadsDetails?.lastName}
                                                                                                    </div>
                                                                                                </div>
                                                                                                <button
                                                                                                    className="text-end flex flex-row items-center gap-1"
                                                                                                    style={styles.paragraph}
                                                                                                    onClick={() => {
                                                                                                        handleShowMoreActivityData(item);
                                                                                                    }}
                                                                                                >
                                                                                                    <div className='h-[10px] w-[10px] rounded-full' style={{ backgroundColor: selectedLeadsDetails?.stage?.defaultColor }}>
                                                                                                    </div>
                                                                                                    {/* {selectedLeadsDetails?.stage?.stageTitle || "-"} */}
                                                                                                    {checkCallStatus(item)}
                                                                                                    <div>
                                                                                                        {
                                                                                                            isExpandedActivity.includes(item.id) ? (
                                                                                                                <div>
                                                                                                                    <CaretUp size={17} weight='bold' />
                                                                                                                </div>
                                                                                                            ) : (
                                                                                                                <div>
                                                                                                                    <CaretDown size={17} weight='bold' />
                                                                                                                </div>
                                                                                                            )
                                                                                                        }
                                                                                                    </div>
                                                                                                </button>
                                                                                            </div>
                                                                                            {
                                                                                                isExpandedActivity.includes(item.id) && (
                                                                                                    <div className='mt-6' style={{ border: "1px solid #00000020", borderRadius: "10px", padding: 10, paddingInline: 15 }}>
                                                                                                        <div className='mt-4' style={{ fontWeight: "500", fontSize: 12, color: "#00000070" }}>
                                                                                                            Transcript
                                                                                                        </div>
                                                                                                        <div className='flex flex-row items-center justify-between mt-4'>
                                                                                                            <div style={{ fontWeight: "500", fontSize: 15 }}>
                                                                                                                {item.duration} mins
                                                                                                            </div>
                                                                                                            <button onClick={() => {
                                                                                                                if (item?.recordingUrl) {
                                                                                                                    setShowAudioPlay(item?.recordingUrl)
                                                                                                                } else {
                                                                                                                    setShowNoAudioPlay(true)
                                                                                                                }
                                                                                                                // window.open(item.recordingUrl, "_blank")
                                                                                                            }}>
                                                                                                                <Image src={"/assets/play.png"} height={35} width={35} alt='*' />
                                                                                                            </button>
                                                                                                        </div>
                                                                                                        {
                                                                                                            item.transcript ? (
                                                                                                                <div className='w-full'>
                                                                                                                    <div className='mt-4' style={{ fontWeight: "600", fontSize: 15 }}>
                                                                                                                        {/* {item.transcript} */}
                                                                                                                        {isExpanded.includes(item.id) ? `${item.transcript}` : `${initialText}...`}
                                                                                                                    </div>
                                                                                                                    <button
                                                                                                                        style={{ fontWeight: "600", fontSize: 15 }}
                                                                                                                        onClick={() => { handleReadMoreToggle(item) }}
                                                                                                                        className="mt-2 text-black underline"
                                                                                                                    >
                                                                                                                        {
                                                                                                                            isExpanded.includes(item.id) ? (
                                                                                                                                "Read Less"
                                                                                                                            ) : (
                                                                                                                                "Read more"
                                                                                                                            )
                                                                                                                        }
                                                                                                                    </button>
                                                                                                                </div>
                                                                                                            ) : (
                                                                                                                <div style={{ fontWeight: "600", fontSize: 15 }}>
                                                                                                                    No transcript
                                                                                                                </div>
                                                                                                            )
                                                                                                        }
                                                                                                    </div>
                                                                                                )
                                                                                            }
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            )
                                        }


                                    </div>

                                </div>
                            }
                        </div>
                    </div>
                </Box>
            </Modal>

            {/* Modal to add notes */}

            <Modal
                open={showAddNotes}
                onClose={() => setShowAddNotes(false)}
                closeAfterTransition
                BackdropProps={{
                    timeout: 1000,
                    sx: {
                        backgroundColor: "#00000020",
                    },
                }}
            >
                <Box className="sm:w-5/12 lg:w-5/12 xl:w-4/12 w-8/12 max-h-[70vh]" sx={{ ...styles.modalsStyle, scrollbarWidth: "none" }}>
                    <div className="flex flex-row justify-center w-full h-[50vh]">
                        <div
                            className="w-full"
                            style={{
                                backgroundColor: "#ffffff",
                                padding: 20,
                                paddingInline: 30,
                                borderRadius: "13px",
                                // paddingBottom: 10,
                                // paddingTop: 10,
                                height: "100%"
                            }}
                        >
                            <div style={{ fontWeight: "700", fontsize: 22 }}>
                                Add your notes
                            </div>
                            <div className='mt-4'
                                style={{
                                    height: "70%",
                                    overflow: "auto"
                                }}
                            >
                                <TextareaAutosize
                                    maxRows={12}
                                    className='outline-none focus:outline-none focus:ring-0 w-full'
                                    style={{
                                        fontsize: 15,
                                        fontWeight: "500",
                                        height: "250px",
                                        border: "1px solid #00000020",
                                        resize: "none",
                                        borderRadius: "13px"
                                    }}
                                    placeholder='Add notes'
                                    value={addNotesValue}
                                    onChange={(event) => { setddNotesValue(event.target.value) }}
                                />
                            </div>
                            <div className='w-full mt-4 h-[20%] flex flex-row justify-center'>
                                {
                                    addLeadNoteLoader ?
                                        <CircularProgress size={25} /> :
                                        <button className="bg-purple h-[50px] rounded-xl text-white rounded-xl w-6/12"
                                            style={{
                                                fontWeight: "600",
                                                fontsize: 16
                                            }}
                                            onClick={() => { handleAddLeadNotes() }}
                                        >
                                            Add & Close
                                        </button>
                                }
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>

            {/* Warning Modal for no voice */}
            <Modal
                open={showNoAudioPlay}
                onClose={() => setShowNoAudioPlay(false)}
                closeAfterTransition
                BackdropProps={{
                    sx: {
                        backgroundColor: "#00000020",
                        // //backdropFilter: "blur(5px)",
                    },
                }}
            >
                <Box className="lg:w-3/12 sm:w-5/12 w-8/12" sx={styles.modalsStyle}>
                    <div className="flex flex-row justify-center w-full">
                        <div
                            className="w-full flex flex-col items-center"
                            style={{
                                backgroundColor: "#ffffff",
                                padding: 20,
                                borderRadius: "13px",
                            }}
                        >

                            <audio controls>
                                <source src={showAudioPlay} type="audio/mpeg" />
                                Your browser does not support the audio element.
                            </audio>
                            <button
                                className='text-white w-full h-[50px] rounded-lg bg-purple mt-4'
                                onClick={() => { setShowNoAudioPlay(false) }}
                                style={{ fontWeight: "600", fontSize: 15 }}
                            >
                                Close
                            </button>

                            {/* Can be use full to add shadow
                            <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                        </div>
                    </div>
                </Box>
            </Modal>

            {/* Modal for audio play */}
            <Modal
                open={showAudioPlay}
                onClose={() => setShowAudioPlay(null)}
                closeAfterTransition
                BackdropProps={{
                    sx: {
                        backgroundColor: "#00000020",
                        // //backdropFilter: "blur(5px)",
                    },
                }}
            >
                <Box className="lg:w-3/12 sm:w-5/12 w-8/12" sx={styles.modalsStyle}>
                    <div className="flex flex-row justify-center w-full">
                        <div
                            className="w-full flex flex-col items-center"
                            style={{
                                backgroundColor: "#ffffff",
                                padding: 20,
                                borderRadius: "13px",
                            }}
                        >

                            <audio controls>
                                <source src={showAudioPlay} type="audio/mpeg" />
                                Your browser does not support the audio element.
                            </audio>
                            <button
                                className='text-white w-full h-[50px] rounded-lg bg-purple mt-4'
                                onClick={() => { setShowAudioPlay(null) }}
                                style={{ fontWeight: "600", fontSize: 15 }}
                            >
                                Close
                            </button>

                            {/* Can be use full to add shadow
                            <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                        </div>
                    </div>
                </Box>
            </Modal>

            {/* Success snack bar */}
            <div>
                <Snackbar
                    open={showSuccessSnack}
                    autoHideDuration={3000}
                    onClose={() => {
                        setShowSuccessSnack(null);
                    }}
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "center",
                    }}
                    TransitionComponent={Fade}
                    TransitionProps={{
                        direction: "center",
                    }}
                >
                    <Alert
                        onClose={() => {
                            setShowSuccessSnack(null);
                        }}
                        severity="success"
                        // className='bg-purple rounded-lg text-white'
                        sx={{
                            width: "auto",
                            fontWeight: "700",
                            fontFamily: "inter",
                            fontSize: "22",
                        }}
                    >
                        {showSuccessSnack}
                    </Alert>
                </Snackbar>
            </div>

            {/* Error snack bar message */}
            <div>
                <Snackbar
                    open={showErrorSnack}
                    autoHideDuration={3000}
                    onClose={() => {
                        setShowErrorSnack(null);
                    }}
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "center",
                    }}
                    TransitionComponent={Fade}
                    TransitionProps={{
                        direction: "center",
                    }}
                >
                    <Alert
                        onClose={() => {
                            setShowErrorSnack(null);
                        }}
                        severity="error"
                        // className='bg-purple rounded-lg text-white'
                        sx={{
                            width: "auto",
                            fontWeight: "700",
                            fontFamily: "inter",
                            fontSize: "22",
                        }}
                    >
                        {showErrorSnack}
                    </Alert>
                </Snackbar>
            </div>

        </div>
    )
}

export default LeadDetails