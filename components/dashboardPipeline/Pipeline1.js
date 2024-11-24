import { Popover, Typography } from '@mui/material';
import { CaretDown, DotsThree } from '@phosphor-icons/react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Apis from '../apis/Apis';
import axios from 'axios';

const Pipeline1 = () => {



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

    const handleShowStagePopover = (event) => {
        setStageAnchorel(event.currentTarget);
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
        }
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
                                                    <button onClick={() => { handleSelectOtherPipeline(item) }}>
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
                                    Deg=fault pipeline
                                </div>
                            </Popover>
                        </div>
                        <div className='flex fex-row items-center gap-6'>
                            <div className='flex flex-row items-center justify-between w-[25vw] border h-[50px] px-4 gap-8' style={{ borderRadius: "50px" }}>
                                <input
                                    className='outline-none bg-transparent w-full'
                                    placeholder='Search by name, phone email'
                                />
                                <butotn>
                                    <Image src={"/assets/searchIcon.png"} height={24} width={24} alt='*' />
                                </butotn>
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

                    <div className="flex flex-row items-center gap-4">
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
                                            {stage.id}
                                        </div>
                                    </div>

                                    <button aria-describedby={stageId} variant="contained" onClick={handleShowStagePopover}>
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

                                {/* Display leads matching this stage */}
                                <div className="flex flex-col gap-4 mt-4 max-h-[78vh] overflow-auto" style={{ scrollbarWidth: "none" }}>
                                    {LeadsList.filter((lead) => lead.stage === stage.id).map((lead, leadIndex) => (
                                        <div className="border rounded-xl p-3 h-full" style={{ width: "300px" }} key={leadIndex}>
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




        </div>
    )
}

export default Pipeline1