import { Alert, Box, CircularProgress, Fade, Modal, Popover, Snackbar, Typography } from '@mui/material';
import { CaretDown, CaretUp, DotsThree, Plus } from '@phosphor-icons/react'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import Apis from '../apis/Apis';
import axios from 'axios';
import ColorPicker from './ColorPicker';

const Pipeline1 = () => {

    const bottomRef = useRef();

    const [pipelinePopoverAnchorel, setPipelinePopoverAnchorel] = useState(null);
    const open = Boolean(pipelinePopoverAnchorel);
    const id = pipelinePopoverAnchorel ? 'simple-popover' : undefined;

    const [otherPipelinePopoverAnchorel, setOtherPipelinePopoverAnchorel] = useState(null);
    const openOtherPipelines = Boolean(otherPipelinePopoverAnchorel);
    const OtherPipelineId = otherPipelinePopoverAnchorel ? 'simple-popover' : undefined;

    const [StageAnchorel, setStageAnchorel] = useState(null);
    const openStage = Boolean(StageAnchorel);
    const stageId = StageAnchorel ? 'stageAnchor' : undefined;

    const [SelectedPipeline, setSelectedPipeline] = useState(null);
    const [PipeLines, setPipeLines] = useState([]);
    const [StagesList, setStagesList] = useState([]);
    const [LeadsList, setLeadsList] = useState([]);
    const [leadCounts, setLeadCounts] = useState(null);
    //code to add new stage
    const [addNewStageModal, setAddNewStageModal] = useState(false);
    const [newStageTitle, setNewStageTitle] = useState("");
    const [stageColor, setStageColor] = useState("#FF4E4E");
    const [addStageLoader, setAddStageLoader] = useState(false);
    //code for advance setting modal inside new stages
    const [showAdvanceSettings, setShowAdvanceSettings] = useState(false);
    //code for input arrays
    const [inputs, setInputs] = useState([{ id: 1, value: '', placeholder: `Sure, i’d be interested in knowing what my home is worth` }, { id: 2, value: '', placeholder: "Yeah, how much is my home worth today?" }]);
    const [action, setAction] = useState("");
    //code for popover
    const [actionInfoEl, setActionInfoEl] = React.useState(null);
    const openaction = Boolean(actionInfoEl);

    const handlePopoverOpen = (event) => {
        setActionInfoEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setActionInfoEl(null);
    };
    //dele stage loader
    const [selectedStage, setSelectedStage] = useState(null);
    const [delStageLoader, setDelStageLoader] = useState(false);
    const [SuccessSnack, setSuccessSnack] = useState(null);

    useEffect(() => {
        getPipelines()
    }, [])

    //code for get pipeline

    const getPipelines = async () => {
        try {
            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const UserDetails = JSON.parse(localData);
                AuthToken = UserDetails.token;
                console.log("Local details are :", UserDetails);
            }

            console.log("Auth token is :--", AuthToken);
            const ApiPath = Apis.getPipelines;
            console.log("Api path is :", ApiPath);

            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of getpipeline api is :", response.data.data);
                setPipeLines(response.data.data);
                setSelectedPipeline(response.data.data[0]);
                setStagesList(response.data.data[0].stages);
                setLeadsList(response.data.data[0].leads);
                console.log("Leads lis is :", response.data.data[0].leads);
                setLeadCounts(response.data.data[0].leadsCountInStage);
            }

        } catch (error) {
            console.error("Error occured in api is:", error);
        } finally {
            console.log("Api call completed")
        }
    }

    //code for poovers

    const handleShowPipelinePopover = (event) => {
        setPipelinePopoverAnchorel(event.currentTarget);
    };

    const handlePipelineClosePopover = () => {
        setPipelinePopoverAnchorel(null);
    };

    const handleShowStagePopover = (event, stage) => {
        setStageAnchorel(event.currentTarget);
        setSelectedStage(stage);

    };

    const handleCloseStagePopover = () => {
        setStageAnchorel(null);
    };

    const handleShowOtherPipeline = (event) => {
        setOtherPipelinePopoverAnchorel(event.currentTarget);
    };

    const handleCloseOtherPipeline = () => {
        setOtherPipelinePopoverAnchorel(null);
    };


    //code to seect other pipeline
    const handleSelectOtherPipeline = (item) => {
        console.log("Other pipeline selected is :", item);
    }

    //code for adding new custom stage
    const handleAddNewStageTitle = async () => {
        try {
            setAddStageLoader(true);
            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const UserDetails = JSON.parse(localData);
                AuthToken = UserDetails.token;
                console.log("Local details are :", UserDetails);
            }

            console.log("Auth token is :--", AuthToken);

            const ApiPath = Apis.addCustomStage;
            console.log("Api path is:", ApiPath);

            const ApiData = {
                stageTitle: newStageTitle,
                color: stageColor,
                pipelineId: SelectedPipeline.id,
                action: action,
                examples: inputs
            }

            console.log("Data sending in api is:", ApiData);

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of add stage title :", response);
                if (response.data.status === true) {
                    setStagesList(response.data.data.stages);
                    setAddNewStageModal(false);
                    setNewStageTitle("");
                    setStageColor("");
                }
            }

        } catch (error) {
            console.error("Error occured inn adding new stage title api is", error);
        } finally {
            setAddStageLoader(false);
        }
    }

    //code ford deleting the stage
    const handleDeleteStage = async () => {
        try {
            setDelStageLoader(true);
            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const UserDetails = JSON.parse(localData);
                AuthToken = UserDetails.token;
                // console.log("Local details are :", UserDetails);
            }

            console.log("Auth token is :--", AuthToken);

            const ApiData = {
                pipelineId: SelectedPipeline.id,
                stageId: selectedStage.id
            }

            console.log("Api dta is:", ApiData);

            const ApiPath = Apis.deleteStage;
            console.log("Apipath is:", ApiPath);

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("response of del stage api is:", response.data);
                if (response.data.status === true) {
                    setStagesList(response.data.data.stages);
                    setSuccessSnack(response.data.message);
                    setStageAnchorel(null);
                }
            }

        } catch (error) {
            console.error("Error occured in delstage api is:", error);
        } finally {
            setDelStageLoader(false);
        }
    }

    //code for arrayinput fields of settings modal
    const handleInputChange = (id, value) => {
        setInputs(inputs.map(input => (input.id === id ? { ...input, value } : input)));
    };

    // Handle deletion of input field
    const handleDelete = (id) => {
        setInputs(inputs.filter(input => input.id !== id));
    };

    // Handle adding a new input field
    const handleAddInput = () => {
        const newId = inputs.length ? inputs[inputs.length - 1].id + 1 : 1;
        setInputs([...inputs, { id: newId, value: '', placeholder: "Add sample answer" }]);
    };

    //code to add new sheet list
    const handleAddSheetNewList = async () => {
        try {
            setShowaddCreateListLoader(true);

            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const UserDetails = JSON.parse(localData);
                AuthToken = UserDetails.token;
            }

            console.log("Auth token is :--", AuthToken);

            const ApiData = {
                sheetName: newSheetName,
                columns: inputs.map((columns) => (columns.value))
            }
            console.log("Data to send in api is:", ApiData);

            const ApiPath = Apis.addSmartList;
            console.log("Api Path is", ApiPath);

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of add new smart list api is :", response);
                if (response.data.status) {
                    setShowAddNewSheetModal(false);
                }
            }

        } catch (error) {
            console.error("Error occured in adding new list api is:", error);
        } finally {
            setShowaddCreateListLoader(false);
        }
    }


    const styles = {
        heading: {
            fontWeight: "700",
            fontSize: 17
        },
        paragraph: {
            fontWeight: "500",
            fontSize: 15
        },
        agentName: {
            fontWeight: "600",
            fontSize: 12
        },
        modalsStyle: {
            height: "auto",
            bgcolor: "transparent",
            p: 2,
            mx: "auto",
            my: "50vh",
            transform: "translateY(-55%)",
            borderRadius: 2,
            border: "none",
            outline: "none",
        },
    }

    return (
        <div className='w-full flex flex-col items-start h-screen'>
            <div className='w-full flex flex-row justify-center' style={{ borderBottom: "1px solid #15151510" }}>
                <div className='w-[95%]'>
                    <div className='flex flex-row items-center justify-between pe-12 mt-4 mb-4'>
                        <div className='flex flex-row items-center gap-2'>
                            <span style={{ fontWeight: "700", fontSize: 25 }}>
                                {SelectedPipeline?.title}
                            </span>
                            <div>
                                {
                                    PipeLines.length > 1 && (
                                        <button
                                            className='outline-none'
                                            aria-describedby={OtherPipelineId} variant="contained" onClick={handleShowOtherPipeline}>
                                            <CaretDown size={22} weight='bold' />
                                        </button>
                                    )
                                }
                                <Popover
                                    id={OtherPipelineId}
                                    open={openOtherPipelines}
                                    anchorEl={otherPipelinePopoverAnchorel}
                                    onClose={handleCloseOtherPipeline}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                // PaperProps={{
                                //     elevation: 0, // This will remove the shadow
                                //     style: {
                                //         boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.08)',
                                //     },
                                // }}
                                >
                                    <div className='p-2'>
                                        {
                                            PipeLines.map((item, index) => (
                                                <div key={index}>
                                                    <button className='outline-none' onClick={() => { handleSelectOtherPipeline(item) }}>
                                                        {item.title}
                                                    </button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </Popover>
                            </div>
                            <button aria-describedby={id} variant="contained" onClick={handleShowPipelinePopover}
                                className='outline-none'>
                                <DotsThree size={27} weight='bold' />
                            </button>
                            <Popover
                                id={id}
                                open={open}
                                anchorEl={pipelinePopoverAnchorel}
                                onClose={handlePipelineClosePopover}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                            // PaperProps={{
                            //     elevation: 0, // This will remove the shadow
                            //     style: {
                            //         boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.08)',
                            //     },
                            // }}
                            >
                                <div className='p-2'>
                                    <button className='flex flex-row items-center gap-1'>
                                        <Plus size={17} weight='bold' /> <span style={{ fontWeight: "500", fontSize: 15 }}>New Pipeline</span>
                                    </button>
                                </div>
                            </Popover>
                        </div>
                        <div className='flex fex-row items-center gap-6'>
                            <div className='flex flex-row items-center justify-between w-[25vw] border h-[50px] px-4 gap-8' style={{ borderRadius: "50px" }}>
                                <input
                                    style={{ MozOutline: "none" }}
                                    className='outline-none bg-transparent w-full mx-2 border-none focus:outline-none focus:ring-0'
                                    placeholder='Search by name, phone email'
                                />
                                <button className='outline-none'>
                                    <Image src={"/assets/searchIcon.png"} height={24} width={24} alt='*' />
                                </button>
                            </div>
                            <button className='outline-none'>
                                <Image src={"/assets/notification.png"} height={24} width={24} alt='n*' />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* <div className='w-full flex flex-row justify-center overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple'>
                <div className='w-[95%] flex flex-row items-center gap-2'>
                    <div style={{width: "400px"}} className='flex flex-row items-center border-2 justify-between'>
                        <div
                            className='h-[36px] flex flex-row items-center justify-center gap-8 bg-[#15151510] rounded px-4'
                            style={styles.heading}>
                            <span>New leads</span>
                            <div className='h-[20px] w-[23px] rounded-full bg-white flex flex-row items-center justify-center' style={{ ...styles.paragraph, fontSize: 14 }}>
                                2
                            </div>
                        </div>
                        <button>
                            <DotsThree size={25} weight='bold' />
                        </button>
                    </div>
                    <div className='w-[20vw] flex flex-row items-center overflowX-auto mt-8 justify-between'>
                        <div
                            className='h-[36px] flex flex-row items-center justify-center gap-8 bg-[#FF6600] rounded px-4'
                            style={styles.heading}>
                            <span>Follow Up</span>
                            <div className='h-[20px] w-[23px] rounded-full bg-white flex flex-row items-center justify-center' style={{ ...styles.paragraph, fontSize: 14 }}>
                                2
                            </div>
                        </div>
                        <button>
                            <DotsThree size={25} weight='bold' />
                        </button>
                    </div>
                    <div className='w-[20vw] flex flex-row items-center overflowX-auto mt-8 justify-between'>
                        <div
                            className='h-[36px] flex flex-row items-center justify-center gap-8 bg-[#E53935] rounded px-4'
                            style={styles.heading}>
                            <span>Hot Leads</span>
                            <div className='h-[20px] w-[23px] rounded-full bg-white flex flex-row items-center justify-center' style={{ ...styles.paragraph, fontSize: 14 }}>
                                2
                            </div>
                        </div>
                        <button>
                            <DotsThree size={25} weight='bold' />
                        </button>
                    </div>
                    <div className='w-[20vw] flex flex-row items-center overflowX-auto mt-8 justify-between'>
                        <div
                            className='h-[36px] flex flex-row items-center justify-center gap-8 bg-[#00D335] rounded px-4'
                            style={styles.heading}>
                            <span>Booked</span>
                            <div className='h-[20px] w-[23px] rounded-full bg-white flex flex-row items-center justify-center' style={{ ...styles.paragraph, fontSize: 14 }}>
                                2
                            </div>
                        </div>
                        <button>
                            <DotsThree size={25} weight='bold' />
                        </button>
                    </div>
                    <div className='w-[20vw] flex flex-row items-center overflowX-auto mt-8 justify-between'>
                        <div
                            className='h-[36px] flex flex-row items-center justify-center gap-8 bg-[#8E24AA] rounded px-4'
                            style={styles.heading}>
                            <span>Un Responsive</span>
                            <div className='h-[20px] w-[23px] rounded-full bg-white flex flex-row items-center justify-center' style={{ ...styles.paragraph, fontSize: 14 }}>
                                2
                            </div>
                        </div>
                        <button>
                            <DotsThree size={25} weight='bold' />
                        </button>
                    </div>
                    <div className='w-[20vw] flex flex-row items-center overflowX-auto mt-8 justify-between'>
                        <div
                            className='h-[36px] flex flex-row items-center justify-center gap-8 bg-[#F27C7C] rounded px-4'
                            style={styles.heading}>
                            <span>Not Interested</span>
                            <div className='h-[20px] w-[23px] rounded-full bg-white flex flex-row items-center justify-center' style={{ ...styles.paragraph, fontSize: 14 }}>
                                2
                            </div>
                        </div>
                        <button>
                            <DotsThree size={25} weight='bold' />
                        </button>
                    </div>
                </div>
            </div> */}

            <div className='flex flex-col items-center w-full'>
                <div className="w-[95%] flex flex-col items-start overflow-x-auto mt-8" style={{ scrollbarWidth: "none" }}>
                    <div className="flex flex-row items-center gap-4">

                        {/* {StagesList.map((item, index) => (
                            <div key={index} style={{ width: "300px" }} className="flex flex-row items-center justify-between">
                                <div
                                    className="h-[36px] flex flex-row items-center justify-center gap-8 rounded px-4"
                                    style={{ ...styles.heading, backgroundColor: item.defaultColor }}
                                >
                                    <span>{item.stageTitle}</span>
                                    <div
                                        className="h-[20px] w-[23px] rounded-full bg-white flex flex-row items-center justify-center"
                                        style={{ ...styles.paragraph, fontSize: 14 }}
                                    >
                                        2
                                    </div>
                                </div>
                                <button aria-describedby={stageId} variant="contained" onClick={handleShowStagePopover}>
                                    <DotsThree size={27} weight='bold' />
                                </button>
                                <Popover
                                    id={stageId}
                                    open={openStage}
                                    anchorEl={StageAnchorel}
                                    onClose={handleCloseStagePopover}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                    PaperProps={{
                                        elevation: 0, // This will remove the shadow
                                        style: {
                                            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.08)',
                                        },
                                    }}
                                >
                                    <Typography sx={{ p: 2 }}>The content of the Popover.</Typography>
                                </Popover>
                            </div>
                        ))} */}

                        {/* </div>
                    <div className="flex flex-row items-center gap-4 mt-4"> */}

                        {/* {
                            LeadsList.map((item, index) => (
                                <div className='border rounded-xl p-3 h-full' style={{ width: "300px" }} key={index}>
                                    <div className='border rounded-xl px-4 py-2 h-full'>
                                        <div className='flex flex-row items-center gap-3'>
                                            <div className='bg-black text-white rounded-full flex flex-row item-center justify-center' style={{ height: "27px", width: "27px" }}>
                                                {item.lead.firstName.slice(0, 1)}
                                            </div>
                                            <div style={styles.paragraph}>
                                                {item.lead.firstName}
                                            </div>
                                        </div>
                                        <div className='flex flex-row items-center justify-between w-full mt-2'>
                                            <div className='text-[#00000060]' style={styles.agentName}>
                                                Email
                                            </div>
                                            <div className='flex flex-row items-center gap-4'>
                                                <Image src={"/assets/colorCircle.png"} height={24} width={24} alt='*' />
                                                <div className='text-purple underline' style={styles.agentName}>
                                                    {item.agent.name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className='w-full flex flex-row items-center justify-between mt-12'>
                                            <Image src={"/assets/manIcon.png"} height={32} width={32} alt='*' />
                                            <div className='flex flex-row items-center gap-3'>
                                                <div className='text-purple bg-[#1C55FF10] px-4 py-2 rounded-3xl rounded-lg'>
                                                    Tag
                                                </div>
                                                <div className='text-purple bg-[#1C55FF10] px-4 py-2 rounded-3xl rounded-lg'>
                                                    Tag
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        } */}

                    </div>

                    <div className='flex flex-row items-start gap-2'>
                        <div className="flex flex-row items-start gap-4">
                            {StagesList.map((stage, index) => (
                                <div key={index} style={{ width: "300px" }} className="flex flex-col items-start h-full">
                                    {/* Display the stage */}
                                    <div className='flex flex-row items-center w-full justify-between'>
                                        <div
                                            className="h-[36px] flex flex-row items-center justify-center gap-8 rounded-xl px-4 text-white"
                                            style={{ ...styles.heading, backgroundColor: stage.defaultColor }}
                                        >
                                            <span>{stage.stageTitle}</span>
                                            <div
                                                className="h-[23px] w-[23px] rounded-full bg-white flex flex-row items-center justify-center text-black"
                                                style={{ ...styles.paragraph, fontSize: 14 }}
                                            >
                                                {leadCounts[stage.id] ?
                                                    <div>
                                                        {leadCounts[stage.id]}
                                                    </div> : "0"}

                                                {/* {leadCounts.map((item) => {

                                            })} */}
                                            </div>
                                        </div>

                                        <button aria-describedby={stageId} variant="contained" onClick={(evetn) => { handleShowStagePopover(evetn, stage) }} className='outline-none'>
                                            <DotsThree size={27} weight="bold" />
                                        </button>
                                    </div>
                                    <Popover
                                        id={stageId}
                                        open={openStage}
                                        anchorEl={StageAnchorel}
                                        onClose={handleCloseStagePopover}
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
                                                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.08)',
                                            },
                                        }}
                                    >
                                        <div className='p-2 w-[100px]'>
                                            <div className='w-full flex flex-row justify-center'>
                                                {
                                                    delStageLoader ?
                                                        <CircularProgress size={20} /> :
                                                        <button className='text-red flex flex-row items-center gap-2 me-2 outline-none' style={styles.paragraph} onClick={handleDeleteStage}>
                                                            <Image src={"/assets/delIcon.png"} height={18} width={18} alt='*' />
                                                            Delete
                                                        </button>
                                                }
                                            </div>
                                        </div>
                                    </Popover>

                                    {/* Display leads matching this stage */}
                                    <div className="flex flex-col gap-4 mt-4 max-h-[78vh] overflow-auto border rounded-xl" style={{ scrollbarWidth: "none" }}>
                                        {LeadsList.filter((lead) => lead.stage === stage.id).map((lead, leadIndex) => (
                                            <div className="p-3 h-full" style={{ width: "300px" }} key={leadIndex}>
                                                <div className="border rounded-xl px-4 py-2 h-full">
                                                    <div className="flex flex-row items-center gap-3">
                                                        <div
                                                            className="bg-black text-white rounded-full flex flex-row item-center justify-center"
                                                            style={{ height: "27px", width: "27px" }}
                                                        >
                                                            {lead.lead.firstName.slice(0, 1)}
                                                        </div>
                                                        <div style={styles.paragraph}>{lead.lead.firstName}</div>
                                                    </div>
                                                    <div className="flex flex-row items-center justify-between w-full mt-2">
                                                        <div className="text-[#00000060]" style={styles.agentName}>
                                                            Email
                                                        </div>
                                                        <div className="flex flex-row items-center gap-4">
                                                            <Image
                                                                src={"/assets/colorCircle.png"}
                                                                height={24}
                                                                width={24}
                                                                alt="*"
                                                            />
                                                            <div className="text-purple underline" style={styles.agentName}>
                                                                {lead.agent.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="w-full flex flex-row items-center justify-between mt-12">
                                                        <Image
                                                            src={"/assets/manIcon.png"}
                                                            height={32}
                                                            width={32}
                                                            alt="*"
                                                        />
                                                        <div className="flex flex-row items-center gap-3">
                                                            <div className="text-purple bg-[#1C55FF10] px-4 py-2 rounded-3xl rounded-lg">
                                                                Tag
                                                            </div>
                                                            <div className="text-purple bg-[#1C55FF10] px-4 py-2 rounded-3xl rounded-lg">
                                                                Tag
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className='h-[36px] flex flex-row items-start justify-center'>
                            <button className='h-[23px] text-purple outline-none mt-2'
                                style={{
                                    width: "200px",
                                    fontSize: "16.8",
                                    fontWeight: "700"
                                }}
                                onClick={() => { setAddNewStageModal(true) }}
                            >
                                Add Stage
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* <div className='flex flex-row justify-center w-full'>
                <div className="w-[95%] flex flex-row justify-start overflow-x-auto mt-8" style={{ scrollbarWidth: "none" }}>
                    <div className="flex flex-row items-center gap-4">

                        <div className='border rounded-xl p-3 h-full'>
                            <div className='border rounded-xl px-4 py-2 h-full' style={{ width: "450px" }}>
                                <div className='flex flex-row items-center gap-3'>
                                    <div className='bg-black text-white rounded-full flex flex-row item-center justify-center' style={{ height: "27px", width: "27px" }}>A</div>
                                    <div style={styles.paragraph}>Name</div>
                                </div>
                                <div className='flex flex-row items-center justify-between w-full mt-2'>
                                    <div className='text-[#00000060]' style={styles.agentName}>
                                        Email
                                    </div>
                                    <div className='flex flex-row items-center gap-4'>
                                        <Image src={"/assets/colorCircle.png"} height={24} width={24} alt='*' />
                                        <div className='text-purple underline' style={styles.agentName}>
                                            Ai Name
                                        </div>
                                    </div>
                                </div>
                                <div className='w-full flex flex-row items-center justify-between mt-12'>
                                    <Image src={"/assets/manIcon.png"} height={32} width={32} alt='*' />
                                    <div className='flex flex-row items-center gap-3'>
                                        <div className='text-purple bg-[#1C55FF10] px-4 py-2 rounded-3xl rounded-lg'>
                                            Tag
                                        </div>
                                        <div className='text-purple bg-[#1C55FF10] px-4 py-2 rounded-3xl rounded-lg'>
                                            Tag
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='border rounded-xl p-3 h-full'>
                            <div className='border rounded-xl px-4 py-2 h-full' style={{ width: "450px" }}>
                                <div className='flex flex-row items-center gap-3'>
                                    <div className='bg-black text-white rounded-full flex flex-row item-center justify-center' style={{ height: "27px", width: "27px" }}>A</div>
                                    <div style={styles.paragraph}>Name</div>
                                </div>
                                <div className='flex flex-row items-center justify-between w-full mt-2'>
                                    <div className='text-[#00000060]' style={styles.agentName}>
                                        Email
                                    </div>
                                    <div className='flex flex-row items-center gap-4'>
                                        <Image src={"/assets/colorCircle.png"} height={24} width={24} alt='*' />
                                        <div className='text-purple underline' style={styles.agentName}>
                                            Ai Name
                                        </div>
                                    </div>
                                </div>
                                <div className='w-full flex flex-row items-center justify-between mt-12'>
                                    <Image src={"/assets/manIcon.png"} height={32} width={32} alt='*' />
                                    <div className='flex flex-row items-center gap-3'>
                                        <div className='text-purple bg-[#1C55FF10] px-4 py-2 rounded-3xl rounded-lg'>
                                            Tag
                                        </div>
                                        <div className='text-purple bg-[#1C55FF10] px-4 py-2 rounded-3xl rounded-lg'>
                                            Tag
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='border rounded-xl p-3 h-full'>
                            <div className='border rounded-xl px-4 py-2 h-full' style={{ width: "450px" }}>
                                <div className='flex flex-row items-center gap-3'>
                                    <div className='bg-black text-white rounded-full flex flex-row item-center justify-center' style={{ height: "27px", width: "27px" }}>A</div>
                                    <div style={styles.paragraph}>Name</div>
                                </div>
                                <div className='flex flex-row items-center justify-between w-full mt-2'>
                                    <div className='text-[#00000060]' style={styles.agentName}>
                                        Email
                                    </div>
                                    <div className='flex flex-row items-center gap-4'>
                                        <Image src={"/assets/colorCircle.png"} height={24} width={24} alt='*' />
                                        <div className='text-purple underline' style={styles.agentName}>
                                            Ai Name
                                        </div>
                                    </div>
                                </div>
                                <div className='w-full flex flex-row items-center justify-between mt-12'>
                                    <Image src={"/assets/manIcon.png"} height={32} width={32} alt='*' />
                                    <div className='flex flex-row items-center gap-3'>
                                        <div className='text-purple bg-[#1C55FF10] px-4 py-2 rounded-3xl rounded-lg'>
                                            Tag
                                        </div>
                                        <div className='text-purple bg-[#1C55FF10] px-4 py-2 rounded-3xl rounded-lg'>
                                            Tag
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='border rounded-xl p-3 h-full'>
                            <div className='border rounded-xl px-4 py-2 h-full' style={{ width: "450px" }}>
                                <div className='flex flex-row items-center gap-3'>
                                    <div className='bg-black text-white rounded-full flex flex-row item-center justify-center' style={{ height: "27px", width: "27px" }}>A</div>
                                    <div style={styles.paragraph}>Name</div>
                                </div>
                                <div className='flex flex-row items-center justify-between w-full mt-2'>
                                    <div className='text-[#00000060]' style={styles.agentName}>
                                        Email
                                    </div>
                                    <div className='flex flex-row items-center gap-4'>
                                        <Image src={"/assets/colorCircle.png"} height={24} width={24} alt='*' />
                                        <div className='text-purple underline' style={styles.agentName}>
                                            Ai Name
                                        </div>
                                    </div>
                                </div>
                                <div className='w-full flex flex-row items-center justify-between mt-12'>
                                    <Image src={"/assets/manIcon.png"} height={32} width={32} alt='*' />
                                    <div className='flex flex-row items-center gap-3'>
                                        <div className='text-purple bg-[#1C55FF10] px-4 py-2 rounded-3xl rounded-lg'>
                                            Tag
                                        </div>
                                        <div className='text-purple bg-[#1C55FF10] px-4 py-2 rounded-3xl rounded-lg'>
                                            Tag
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='border rounded-xl p-3 h-full'>
                            <div className='border rounded-xl px-4 py-2 h-full' style={{ width: "450px" }}>
                                <div className='flex flex-row items-center gap-3'>
                                    <div className='bg-black text-white rounded-full flex flex-row item-center justify-center' style={{ height: "27px", width: "27px" }}>A</div>
                                    <div style={styles.paragraph}>Name</div>
                                </div>
                                <div className='flex flex-row items-center justify-between w-full mt-2'>
                                    <div className='text-[#00000060]' style={styles.agentName}>
                                        Email
                                    </div>
                                    <div className='flex flex-row items-center gap-4'>
                                        <Image src={"/assets/colorCircle.png"} height={24} width={24} alt='*' />
                                        <div className='text-purple underline' style={styles.agentName}>
                                            Ai Name
                                        </div>
                                    </div>
                                </div>
                                <div className='w-full flex flex-row items-center justify-between mt-12'>
                                    <Image src={"/assets/manIcon.png"} height={32} width={32} alt='*' />
                                    <div className='flex flex-row items-center gap-3'>
                                        <div className='text-purple bg-[#1C55FF10] px-4 py-2 rounded-3xl rounded-lg'>
                                            Tag
                                        </div>
                                        <div className='text-purple bg-[#1C55FF10] px-4 py-2 rounded-3xl rounded-lg'>
                                            Tag
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='border rounded-xl p-3 h-full'>
                            <div className='border rounded-xl px-4 py-2 h-full' style={{ width: "450px" }}>
                                <div className='flex flex-row items-center gap-3'>
                                    <div className='bg-black text-white rounded-full flex flex-row item-center justify-center' style={{ height: "27px", width: "27px" }}>A</div>
                                    <div style={styles.paragraph}>Name</div>
                                </div>
                                <div className='flex flex-row items-center justify-between w-full mt-2'>
                                    <div className='text-[#00000060]' style={styles.agentName}>
                                        Email
                                    </div>
                                    <div className='flex flex-row items-center gap-4'>
                                        <Image src={"/assets/colorCircle.png"} height={24} width={24} alt='*' />
                                        <div className='text-purple underline' style={styles.agentName}>
                                            Ai Name
                                        </div>
                                    </div>
                                </div>
                                <div className='w-full flex flex-row items-center justify-between mt-12'>
                                    <Image src={"/assets/manIcon.png"} height={32} width={32} alt='*' />
                                    <div className='flex flex-row items-center gap-3'>
                                        <div className='text-purple bg-[#1C55FF10] px-4 py-2 rounded-3xl rounded-lg'>
                                            Tag
                                        </div>
                                        <div className='text-purple bg-[#1C55FF10] px-4 py-2 rounded-3xl rounded-lg'>
                                            Tag
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}



            {/* Code for add stage modal */}
            <Modal
                open={addNewStageModal}
                onClose={() => { setAddNewStageModal(false) }}
            >
                <Box className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12" sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}>
                    <div style={{ width: "100%", }}>

                        <div className='max-h-[60vh] overflow-auto' style={{ scrollbarWidth: "none" }}>
                            <div style={{ width: "100%", direction: "row", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                {/* <div style={{ width: "20%" }} /> */}
                                <div style={{ fontWeight: "700", fontSize: 22 }}>
                                    Add New Stage
                                </div>
                                <div style={{ direction: "row", display: "flex", justifyContent: "end" }}>
                                    <button onClick={() => { setAddNewStageModal(false) }} className='outline-none'>
                                        <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <div className='mt-4' style={{ fontWeight: "600", fontSize: 12, paddingBottom: 5 }}>
                                    Stage Title*
                                </div>
                                <input
                                    value={newStageTitle}
                                    onChange={(e) => { setNewStageTitle(e.target.value) }}
                                    placeholder='Enter stage title'
                                    className='outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px]'
                                    style={{ border: "1px solid #00000020" }}
                                />
                                <div style={{ marginTop: 20, fontWeight: "600", fontSize: 12, paddingBottom: 5 }}>
                                    Color*
                                </div>
                                <ColorPicker setStageColor={setStageColor} />
                            </div>

                            <div className='text-purple flex flex-row items-center gap-2 mt-4'>
                                <div style={{ fontWeight: "600", fontSize: 15 }}>
                                    Advanced Settings
                                </div>
                                <button onClick={() => { setShowAdvanceSettings(!showAdvanceSettings) }} className='outline-none'>
                                    {
                                        showAdvanceSettings ?
                                            <CaretUp size={15} weight='bold' /> :
                                            <CaretDown size={15} weight='bold' />
                                    }
                                </button>
                            </div>

                            {
                                showAdvanceSettings && (
                                    <div>
                                        <div className='flex flex-row items-center gap-2 mt-4'>
                                            <p style={{ fontWeight: "600", fontSize: 15 }}>Action</p>
                                            {/* <Image src={"/assets/infoIcon.png"} height={20} width={20} alt='*' /> */}
                                            <Image
                                                src="/assets/infoIcon.png"
                                                height={20}
                                                width={20}
                                                alt="*"
                                                style={{
                                                    filter: 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)',
                                                    // filter: isRed
                                                    //     ? 'invert(17%) sepia(96%) saturate(7493%) hue-rotate(-5deg) brightness(102%) contrast(115%)' // Red
                                                    //     : 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)',
                                                }}
                                                aria-owns={open ? 'mouse-over-popover' : undefined}
                                                aria-haspopup="true"
                                                onMouseEnter={handlePopoverOpen}
                                                onMouseLeave={handlePopoverClose}
                                            />

                                            <Popover
                                                id="mouse-over-popover"
                                                sx={{
                                                    pointerEvents: 'none'
                                                }}
                                                open={openaction}
                                                anchorEl={actionInfoEl}
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'center',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'left',
                                                }}
                                                PaperProps={{
                                                    elevation: 1, // This will remove the shadow
                                                    style: {
                                                        boxShadow: "0px 10px 10px rgba(0, 0, 0, 0.1)",
                                                    },
                                                }}
                                                onClose={handlePopoverClose}
                                                disableRestoreFocus
                                            >
                                                <div className="p-2">
                                                    <div className="flex flex-row items-center gap-1">
                                                        <Image src={"/assets/infoIcon.png"} height={24} width={24} alt="*" />
                                                        <p style={{ fontWeight: "500", fontSize: 12 }}>
                                                            Tip: Tell your AI when to move the leads to this stage.
                                                        </p>
                                                    </div>
                                                </div>
                                            </Popover>


                                        </div>
                                        <input
                                            className='h-[50px] px-2 outline-none focus:ring-0 w-full mt-1 rounded-lg'
                                            placeholder='Ex: Does the human express interest getting a CMA '
                                            style={{
                                                border: "1px solid #00000020", fontWeight: "500", fontSize: 15
                                            }}
                                            value={action}
                                            onChange={(e) => { setAction(e.target.value) }}
                                        />

                                        <p className='mt-4' style={{ fontWeight: "600", fontSize: 15 }}>
                                            Sample Answers
                                        </p>

                                        <p className='mt-2' style={{ fontWeight: "500", fontSize: 12 }}>
                                            What are possible answers leads will give to this question?
                                        </p>

                                        <div className='max-h-[30vh] overflow-auto mt-2' //scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
                                            style={{ scrollbarWidth: "none" }}
                                        >
                                            {inputs.map((input, index) => (
                                                <div key={input.id} className='w-full flex flex-row items-center gap-4 mt-4'>
                                                    <input
                                                        className='border p-2 rounded-lg px-3 outline-none focus:outline-none focus:ring-0 h-[53px]'
                                                        style={{
                                                            ...styles.paragraph,
                                                            width: "95%", borderColor: "#00000020",
                                                        }}
                                                        placeholder={input.placeholder}
                                                        // placeholder={`
                                                        //     ${index === 0 ? "Sure, i would be interested in knowing what my home is worth" : 
                                                        //         index === 1 ? "Yeah, how much is my home worth today?" : 
                                                        //         `Add sample answer ${index + 1}`
                                                        //     }`}
                                                        value={input.value}
                                                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                                                    />
                                                    <button className='outline-none border-none' style={{ width: "5%" }} onClick={() => handleDelete(input.id)}>
                                                        <Image src={"/assets/blackBgCross.png"} height={20} width={20} alt='*' />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ height: "50px" }}>
                                            {
                                                inputs.length < 3 && (
                                                    <button onClick={handleAddInput} className='mt-4 p-2 outline-none border-none text-purple rounded-lg underline' style={{
                                                        fontSize: 15,
                                                        fontWeight: "700"
                                                    }}>
                                                        Add New
                                                    </button>
                                                )
                                            }
                                        </div>

                                        <div className='flex flex-row items-center gap-2 mt-4'>
                                            <p style={{ fontWeight: "600", fontSize: 15 }}>Assign to </p>
                                            {/* <Image src={"/assets/infoIcon.png"} height={20} width={20} alt='*' /> */}
                                            <Image
                                                src="/assets/infoIcon.png"
                                                height={20}
                                                width={20}
                                                alt="*"
                                                style={{
                                                    filter: 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)',
                                                    // filter: isRed
                                                    //     ? 'invert(17%) sepia(96%) saturate(7493%) hue-rotate(-5deg) brightness(102%) contrast(115%)' // Red
                                                    //     : 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)',
                                                }}
                                                aria-owns={open ? 'mouse-over-popover' : undefined}
                                                aria-haspopup="true"
                                                onMouseEnter={handlePopoverOpen}
                                                onMouseLeave={handlePopoverClose}
                                            />
                                        </div>

                                        <button className='flex flex-row items-center w-full justify-between rounded-lg h-[50px] px-2 mt-1 outline-none'
                                            style={{ border: "1px solid #00000020" }}>
                                            <div>
                                                Select team member
                                            </div>
                                            <div>
                                                <CaretDown size={20} weight='bold' />
                                            </div>
                                        </button>

                                        <p style={{ fontWeight: "500", fontSize: 15 }}>
                                            Tags
                                        </p>

                                        <div className='h-[45px] p-2 rounded-lg flex flex-row items-center gap-2' style={{ border: "1px solid #00000030" }}>
                                            <div className='flex flex-row gap-2 bg-[#00000030] h-full px-4 rounded items-center' style={{ width: "fit-content" }}>
                                                <p style={{ fontWeight: "500", fontSize: 15 }}>
                                                    Tag value
                                                </p>
                                                <button className='outline-none'>
                                                    <Image src={"/assets/cross.png"} height={10} width={10} alt='*' />
                                                </button>
                                            </div>
                                            <div className='flex flex-row gap-2 bg-[#00000030] h-full px-4 rounded items-center' style={{ width: "fit-content" }}>
                                                <p style={{ fontWeight: "500", fontSize: 15 }}>
                                                    Tag value
                                                </p>
                                                <button className='outline-none'>
                                                    <Image src={"/assets/cross.png"} height={10} width={10} alt='*' />
                                                </button>
                                            </div>
                                            <div className='flex flex-row gap-2 bg-[#00000030] h-full px-4 rounded items-center' style={{ width: "fit-content" }}>
                                                <p style={{ fontWeight: "500", fontSize: 15 }}>
                                                    Tag value
                                                </p>
                                                <button className='outline-none'>
                                                    <Image src={"/assets/cross.png"} height={10} width={10} alt='*' />
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                )
                            }

                        </div>

                        {
                            addStageLoader ?
                                <div className='flex flex-row iems-center justify-center w-full mt-4'>
                                    <CircularProgress size={25} />
                                </div> :
                                <button
                                    className='mt-4 outline-none'
                                    style={{
                                        backgroundColor: "#402FFF", color: "white",
                                        height: "50px", borderRadius: "10px", width: "100%",
                                        fontWeight: 600, fontSize: '20'
                                    }}
                                    onClick={handleAddNewStageTitle}
                                >
                                    Add & Close
                                </button>
                        }


                    </div>
                </Box>
            </Modal>

            {/* code for showing snack bar */}
            <div>
                <Snackbar
                    open={SuccessSnack}
                    autoHideDuration={3000}
                    onClose={() => {
                        setSuccessSnack(null);
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
                            setSuccessSnack(null);
                        }}
                        // severity="success"
                        // className='bg-purple rounded-lg text-white'
                        sx={{
                            width: "auto",
                            fontWeight: "700",
                            fontFamily: "inter",
                            fontSize: "22",
                        }}
                    >
                        {SuccessSnack}
                    </Alert>
                </Snackbar>
            </div>





        </div>
    )
}

export default Pipeline1