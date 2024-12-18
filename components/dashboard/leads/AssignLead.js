import Apis from '@/components/apis/Apis';
import { Box, CircularProgress, Modal } from '@mui/material';
import { CalendarDots, CaretLeft } from '@phosphor-icons/react';
import axios from 'axios';
import moment from 'moment';
import Image from 'next/image';
import React, { use, useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


const AssignLead = ({ leadIs, handleCloseAssignLeadModal }) => {

    const [initialLoader, setInitialLoader] = useState(false);
    const [agentsList, setAgentsList] = useState([]);
    const [stages, setStages] = useState([]);
    const [SelectedAgents, setSelectedAgents] = useState([]);
    const [CannotAssignLeadModal, setCannotAssignLeadModal] = useState(false);
    const [loader, setLoader] = useState(false);
    const [lastStepModal, setLastStepModal] = useState(false);
    const [ShouldContinue, setShouldContinue] = useState(false);
    const [NoOfLeadsToSend, setNoOfLeadsToSend] = useState("");
    const [customLeadsToSend, setCustomLeadsToSend] = useState("");
    const [selectedFromDate, setSelectedFromDate] = useState(null);
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [selectedDateTime, setSelectedDateTime] = useState(new Date());
    const [CallNow, setCallNow] = useState("");
    const [CallLater, setCallLater] = useState(false);

    useEffect(() => {
        if (ShouldContinue === true) {
            console.log(
                "hit"
            )
            setShouldContinue(false);
        } else {
            setShouldContinue(true);
        }
    }, [SelectedAgents])

    useEffect(() => {
        console.log("Leads asigned are :", leadIs);
        getAgents();
    }, []);

    useEffect(() => {
        console.log("Assigned agent is", SelectedAgents)
    }, [SelectedAgents]);

    //get agents api
    const getAgents = async () => {
        try {
            setInitialLoader(true);
            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const UserDetails = JSON.parse(localData);
                AuthToken = UserDetails.token;
                console.log("USer details are :", UserDetails);
            }

            console.log("Auth token is :--", AuthToken);

            const ApiPath = Apis.getAgents;
            // return
            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of get agents api is:", response.data);
                setAgentsList(response.data.data);
                setStages(response.data.data.stages);
            }

        } catch (error) {
            console.error("ERrror occured in agents api is :", error);
        } finally {
            setInitialLoader(false);
            console.log("Api call completed")
        }
    }

    //can assign stage or not
    const canAssignStage = (item) => {
        console.log("Id selected is:", item);
        //0 unselected
        //1 selected
        //2 can not assign
        // Check if the item is already selected
        const isAlreadySelected = SelectedAgents.some((selectedItem) => selectedItem.id === item.id);

        if (isAlreadySelected) {
            // Remove the item if it's already selected
            console.log("Cheak 1")
            return 1
            // return prevSelectedItems.filter((selectedItem) => selectedItem.id !== item.id);
        } else {
            let allSelectedAgentStages = [];
            // item.stages.map((agent) => {
            //     allSelectedAgentStages.push(agent)
            // })

            SelectedAgents.map((agent) => {
                allSelectedAgentStages = [...allSelectedAgentStages, ...agent.stages]
                // allSelectedAgentStages.push(agent.stages)
            })

            let canAssignStage = 0
            // Check if the pipeline.id matches with any previously selected item's pipeline.id
            if (item) {
                SelectedAgents.map((agent) => {
                    if (agent.pipeline.id != item.pipeline.id) {
                        canAssignStage = 2;
                    }
                })
            }

            if (canAssignStage == 0) {
                console.log("Pipeline matches");
            } else {
                console.log("Pipeline does not match");
                return 2;
            }

            console.log("Previously selected items are :", SelectedAgents);

            // Check if any of the selected items have a matching stageTitle

            console.log("All agents stages are :", allSelectedAgentStages);
            console.log("Item.stages ==..", item.stages);

            if (item.stages) {
                item.stages.map((stage) => {
                    allSelectedAgentStages.map((selectedStage) => {
                        // console.log(`Matchin stage ${stage.id} with ${JSON.stringify(selectedStage)}`)
                        if (stage.id == selectedStage.id) {
                            console.log("Agents in same stage so can not assign")
                            canAssignStage = 2;

                        }
                    })
                })
            }

            // item.stages.forEach((stage) => {
            //     allSelectedAgentStages.forEach((selectedStage) => {
            //         if (stage.id === selectedStage.id) {
            //             console.log("Agents in the same stage, so cannot assign");
            //             canAssignStage = 2; // Update the flag
            //         }
            //     });
            // });


            return canAssignStage
        }
        // });
    };


    const handleAssigLead = async () => {

        try {
            setLoader(true);

            let timer = null;
            let batchSize = null;

            if (customLeadsToSend) {
                batchSize = customLeadsToSend
            } else if (NoOfLeadsToSend) {
                batchSize = NoOfLeadsToSend
            }

            if (CallNow) {
                timer = 0
            } else if (CallLater) {
                const currentDateTime = new Date();
                const currentDate = currentDateTime.toLocaleString();
                const futureDate = selectedDateTime.toLocaleString();

                const differenceInMilliseconds = selectedDateTime.getTime() - currentDateTime.getTime();
                const minutes = differenceInMilliseconds / (1000 * 60);
                timer = minutes.toFixed(0)
            }

            const Apidata = {
                pipelineId: SelectedAgents[0].pipeline.id,
                mainAgentIds: SelectedAgents.map((item) => (item.id)),
                leadIds: leadIs,
                startTimeDifFromNow: timer,
                batchSize: batchSize
            }

            console.log("Data sending in api is:", Apidata);
            // return
            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const UserDetails = JSON.parse(localData);
                AuthToken = UserDetails.token;
            }

            console.log("Auth token is :--", AuthToken);

            const ApiPath = Apis.assignLeadToPipeLine;

            console.log("Data sending in api is :", Apidata);
            // return
            const response = await axios.post(ApiPath, Apidata, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of api is:", response);
                if (response.data.status === true) {
                    handleCloseAssignLeadModal(false);
                    setLastStepModal(false);
                    window.location.reload();
                }
            }

        }
        catch (error) {
            console.error("Error occured in api is", error);
        }
        finally {
            setLoader(false);
        }
    }

    //code for date picker

    const handleDateChange = (date) => {
        setSelectedDateTime(date);
    };

    const handleFromDateChange = (date) => {
        setSelectedFromDate(date); // Set the selected date
        setShowFromDatePicker(false);
    };

    const styles = {
        heading: {
            fontWeight: "600",
            fontSize: 17
        },
        paragraph: {
            fontWeight: "500",
            fontSize: 12
        },
        paragraph2: {
            fontWeight: "500",
            fontSize: 12
        },
        title: {
            fontWeight: "500",
            fontSize: 15
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
        <div className='w-full'>
            <div className='flex flex-row items-center justify-between mt-4'>
                <div style={{ fontSize: 24, fontWeight: "700" }}>
                    Select your Agent
                </div>
                <div className='text-purple' style={styles.paragraph}>
                    {leadIs.length} Contacts Selected
                </div>
            </div>
            <div className='mt-2' style={styles.paragraph2} onClick={() => { setLastStepModal(true) }}>
                Only outbound models can be selected to make calls
            </div>

            {
                initialLoader ?
                    <div className='w-full flex flex-row justify-center mt-4'>
                        <CircularProgress size={30} />
                    </div> :
                    <div className='max-h-[50vh] overflow-auto' style={{ scrollbarWidth: "none" }}>
                        {
                            agentsList.map((item, index) => (
                                <button key={index} className='rounded-xl p-2 mt-4 w-full outline-none'
                                    style={{
                                        border: SelectedAgents.includes(item) ? "2px solid #7902DF" : "1px solid #00000020",
                                        backgroundColor: SelectedAgents.includes(item) ? "#402FFF05" : ""
                                    }}
                                    onClick={() => {
                                        let canAssign = canAssignStage(item);
                                        if (canAssign == 0) {
                                            //push to the array
                                            console.log("Cheak 1 at 0")
                                            setSelectedAgents([...SelectedAgents, item]);
                                            // setLastStepModal(true);//loader
                                        }
                                        else if (canAssign == 1) {
                                            //remove from the array
                                            console.log("Cheak 2")
                                            let agents = SelectedAgents.filter((selectedItem) => selectedItem.id !== item.id);
                                            setSelectedAgents(agents);
                                        }
                                        else if (canAssign == 2) {
                                            //can not assign. Show popup
                                            setCannotAssignLeadModal(true);
                                        }
                                    }}>
                                    <div className='flex flex-row items-center justify-between pt-2'>
                                        <div className='flex flex-row items-center gap-2'>
                                            <div className='h-[60px] w-[60px] bg-gray-100 rounded-full flex flex-row items-center justify-center'>
                                                <Image src={"/assets/avatar1.png"} height={42} width={42} alt='*' />
                                            </div>
                                            <span style={styles.heading}>
                                                {item.name.slice(0, 1).toUpperCase()}{item.name.slice(1)}
                                            </span>
                                        </div>
                                        <div>
                                            {item.agents[0]?.agentRole}
                                        </div>
                                    </div>

                                    <div className='flex flex-row items-center gap-2 mt-6 pb-2'>
                                        <div className='flex flex-row items-center gap-1' style={styles.paragraph}>
                                            <span className='text-purple'>Active in |   </span> {item.pipeline?.title}
                                        </div>

                                        <div className='flex flex-row gap-2 overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple' style={{ scrollbarWidth: "none" }}>
                                            {
                                                item.stages.map((item, index) => (
                                                    <div className='px-3 py-1 rounded-3xl border' style={styles.paragraph} key={index}>
                                                        {item.stageTitle}
                                                    </div>
                                                ))
                                            }
                                        </div>

                                        {/* <div className='px-3 py-1 rounded-3xl border' style={styles.paragraph}>
                                    New Lead
                                </div> */}
                                    </div>
                                </button>
                            ))
                        }
                    </div>
            }


            <div>
                <button className='rounded-lg mt-4 w-full h-[50px]'
                    style={{
                        ...styles.heading,
                        backgroundColor: ShouldContinue ? "#00000020" : "#7902DF",
                        color: ShouldContinue ? "#00000080" : "white"
                    }} //onClick={handleAssigLead}
                    disabled={ShouldContinue}
                    onClick={() => { setLastStepModal(true) }}
                >
                    Continue
                </button>
            </div>



            {/* code for warning modal */}
            <Modal
                open={CannotAssignLeadModal}
                onClose={() => setCannotAssignLeadModal(false)}
                closeAfterTransition
                BackdropProps={{
                    sx: {
                        backgroundColor: "#00000020",
                        backdropFilter: "blur(5px)",
                    },
                }}
            >
                <Box className="lg:w-3/12 sm:w-5/12 w-8/12" sx={styles.modalsStyle}>
                    <div className="flex flex-row justify-center w-full">
                        <div
                            className="w-full"
                            style={{
                                backgroundColor: "#ffffff",
                                padding: 20,
                                borderRadius: "13px",
                            }}
                        >

                            <div style={{ fontWeight: "600", fontSize: 16 }}>
                                Unselect the selected agent to select new agent !
                            </div>
                            <button
                                className='text-white w-full h-[50px] rounded-lg bg-purple mt-4'
                                onClick={() => { setCannotAssignLeadModal(false) }}
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

            {/* last step modal */}
            <Modal
                open={lastStepModal}
                onClose={() => setLastStepModal(false)}
                closeAfterTransition
                BackdropProps={{
                    timeout: 1000,
                    sx: {
                        backgroundColor: "#00000020",
                        backdropFilter: "blur(20px)",
                    },
                }}
            >
                <Box className="lg:w-4/12 sm:w-7/12 w-8/12" sx={styles.modalsStyle}>
                    <div className="flex flex-row justify-center w-full">
                        <div
                            className="w-full"
                            style={{
                                backgroundColor: "#ffffff",
                                padding: 20,
                                borderRadius: "13px",
                            }}
                        >
                            <div className='flex flex-row justify-between'>
                                <button className='flex flex-row items-center justify-center gap-2 bg-[#15151515] h-[34px] w-[92px] rounded-2xl pe-2'>
                                    <CaretLeft size={20} weight='bold' />
                                    <span style={styles.title} onClick={() => { setLastStepModal(false) }}>
                                        Back
                                    </span>
                                </button>
                                <button onClick={() => { setLastStepModal(false) }}>
                                    <Image src={"/assets/cross.png"} height={14} width={14} alt='*' />
                                </button>
                            </div>

                            <div className='flex flex-row items-center justify-between mt-6'>
                                <div style={{
                                    fontWeight: "700",
                                    fontSize: 24
                                }}>
                                    One last thing
                                </div>
                                <div className='text-purple' style={{ fontSize: 12, fontWeight: "600" }}>
                                    {leadIs.length} Contacts Selected
                                </div>
                            </div>

                            <div className='mt-4' style={styles.heading}>
                                Drip calls per day
                            </div>

                            <div className='flex flex-row items-center gap-8 mt-4'>
                                {/* <button className='w-1/2 flex flex-row items-center p-4 rounded-2xl' style={{ border: "1px solid #00000040", height: "50px" }}>
                                    
                                </button> */}
                                <input
                                    className='w-1/2 flex flex-row items-center p-4 rounded-2xl otline-none focus:ring-0'
                                    style={{
                                        border: "1px solid #00000040", height: "50px"
                                    }}
                                    value={customLeadsToSend}
                                    onFocus={() => { setNoOfLeadsToSend("") }}
                                    onChange={(e) => {
                                        let value = e.target.value;
                                        if (!/[0-9]/.test(value) && value !== '') return;
                                        setCustomLeadsToSend(e.target.value);
                                    }}
                                    placeholder='Ex: 100'
                                />
                                <button
                                    className='w-1/2 flex flex-row items-center p-4 rounded-2xl'
                                    style={{ border: NoOfLeadsToSend ? "2px solid #7902DF" : "1px solid #00000040", height: "50px" }}
                                    onClick={() => {
                                        setNoOfLeadsToSend(leadIs.length);
                                        setCustomLeadsToSend("");
                                    }}
                                >
                                    All {leadIs.length}
                                </button>
                            </div>


                            <div className='mt-4' style={styles.heading}>
                                When to start calling?
                            </div>

                            <div className='flex flex-row items-center gap-8 mt-4'>
                                <button className='w-1/2 flex flex-col justify-between p-4 rounded-2xl'
                                    style={{
                                        border: CallNow ? "2px solid #7902DF" : "1px solid #00000040", height: "119px"
                                    }}
                                    onClick={() => {
                                        const currentDateTime = new Date();
                                        console.log("Current data is:", currentDateTime.toLocaleString());
                                        setCallNow(currentDateTime);
                                        setCallLater(false);
                                        // handleDateTimerDifference();
                                    }}
                                >
                                    <Image src={"/assets/callBtn.png"} height={24} width={24} alt='*' />
                                    <div style={styles.title}>
                                        Call Now
                                    </div>
                                </button>
                                <div className='w-1/2'>
                                    <button className='w-full flex flex-col justify-between p-4 rounded-2xl'
                                        style={{ border: CallLater ? "2px solid #7902DF" : "1px solid #00000040", height: "119px" }}
                                        onClick={() => {
                                            setShowFromDatePicker(true);
                                            setCallNow("");
                                            setCallLater(true);
                                        }}
                                    >
                                        <CalendarDots size={32} weight='bold' />
                                        <div style={styles.title}>
                                            Shedule Call
                                        </div>
                                    </button>
                                    {/* <div>
                                        {
                                            showFromDatePicker && (
                                                <div>
                                                    <Calendar
                                                        onChange={handleFromDateChange}
                                                        value={selectedFromDate}
                                                        locale="en-US"
                                                        onClose={() => { setShowFromDatePicker(false) }}
                                                    />
                                                </div>
                                            )
                                        }
                                    </div> */}

                                    <Modal
                                        open={showFromDatePicker}
                                        onClose={() => setShowFromDatePicker(false)}
                                        closeAfterTransition
                                        BackdropProps={{
                                            timeout: 1000,
                                            sx: {
                                                backgroundColor: "#00000020",
                                                backdropFilter: "blur(5px)",
                                            },
                                        }}
                                    >
                                        <Box className="lg:w-4/12 sm:w-7/12 w-8/12" sx={styles.modalsStyle}>
                                            <div className="flex flex-row justify-center w-full">
                                                <div
                                                    className="w-full flex flex-row justify-center"
                                                    style={{
                                                        backgroundColor: "#ffffff",
                                                        padding: 20,
                                                        borderRadius: "13px",
                                                    }}
                                                >
                                                    <div>
                                                        {/* <Calendar
                                                            onChange={handleFromDateChange}
                                                            value={selectedFromDate}
                                                            locale="en-US"
                                                            onClose={() => { setShowFromDatePicker(false) }}
                                                        /> */}
                                                        <div className='text-center text-xl font-bold'>
                                                            Select date and time to shedule call
                                                        </div>
                                                        <div className='w-full mt-4 flex flex-row justify-center'>
                                                            <DatePicker
                                                                selected={selectedDateTime}
                                                                onChange={handleDateChange}
                                                                showTimeSelect
                                                                dateFormat="Pp" // Date and time format
                                                                className="border p-2 rounded"
                                                                placeholderText="Select date and time"
                                                            />
                                                        </div>
                                                        <div className='w-full flex flex-row justify-center mt-6'>
                                                            <button
                                                                className='w-7/12 h-[50px] bg-purple rounded-xl text-white font-bold'
                                                                onClick={() => { setShowFromDatePicker(false) }}
                                                            >
                                                                Select & close
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Box>
                                    </Modal>

                                    {/*  */}
                                </div>
                            </div>

                            {
                                loader ?
                                    <div className='mt-4 w-full flex flex-row items-center justify-center'>
                                        <CircularProgress size={30} />
                                    </div> :
                                    <div className='w-full'>
                                        {
                                            (NoOfLeadsToSend || customLeadsToSend) && (CallNow || CallLater) ? (
                                                <button className='text-white w-full h-[50px] rounded-lg bg-purple mt-4' onClick={() => {
                                                    handleAssigLead()
                                                    // handleAssigLead()
                                                }}>
                                                    Continue
                                                </button>
                                            ) : (
                                                <button className='text-white w-full h-[50px] rounded-lg bg-[#00000060] mt-4'
                                                    disabled={true}>
                                                    Continue
                                                </button>
                                            )
                                        }
                                    </div>
                            }

                            {/* <div className='mt-4 w-full'>
                                <button className="text-white bg-purple rounded-xl w-full h-[50px]" style={styles.heading} onClick={() => { setLastStepModal(false) }}>
                                    Continue
                                </button>
                            </div> */}


                            {/* Can be use full to add shadow */}
                            {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                        </div>
                    </div>
                </Box>
            </Modal>


        </div>
    )
}

export default AssignLead