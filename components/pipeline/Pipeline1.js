import Body from '@/components/onboarding/Body';
import Header from '@/components/onboarding/Header';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Footer from '@/components/onboarding/Footer';
import { Box, FormControl, MenuItem, Modal, Select } from '@mui/material';

const Pipeline1 = ({ handleContinue }) => {

    const router = useRouter();
    const [toggleClick, setToggleClick] = useState(false);
    const [selectPipleLine, setSelectPipleLine] = useState("");
    const [introVideoModal, setIntroVideoModal] = useState(false);

    //code for new Lead calls
    const [rows, setRows] = useState([]);
    const [assignedNewLEad, setAssignedNewLead] = useState(false);

    //function for new lead
    const addRow = () => {
        setRows([...rows, { id: rows.length + 1, days: '', hours: '', minutes: '' }]);
    };

    const removeRow = (id) => {
        setRows(rows.filter(row => row.id !== id));
    };

    const handleInputChange = (id, field, value) => {
        setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const assignNewLead = () => {
        setAssignedNewLead(true);
        setRows([...rows, { id: rows.length + 1, days: '', hours: '', minutes: '' }]);
    }

    const handleUnAssignNewLead = () => {
        setAssignedNewLead(false);
        setRows([]);
    }

    //functions for 

    const handleToggleClick = (id) => {
        setToggleClick(prevId => (prevId === id ? null : id))
    }

    const handleSelectPipleLine = (event) => {
        setSelectPipleLine(event.target.value);
    }

    const pipelines = [
        {
            id: 1,
            title: "Test 1"
        }
    ]

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
        AddNewKYCQuestionModal: {
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
                            Pipeline and Stages
                        </div>
                        <div className='mt-8 w-6/12 gap-4 flex flex-col max-h-[50vh] overflow-auto'>
                            <div style={styles.headingStyle}>
                                Select a pipeline
                            </div>
                            <div className='border rounded-lg'>
                                <Box className="w-full">
                                    <FormControl className="w-full">
                                        <Select
                                            className='border-none rounded-lg outline-none'
                                            displayEmpty
                                            value={selectPipleLine}
                                            onChange={handleSelectPipleLine}
                                            renderValue={(selected) => {
                                                if (selected === '') {
                                                    return <div>Select Pipeline</div>;
                                                }
                                                return selected;
                                            }}
                                            sx={{
                                                ...styles.dropdownMenu,
                                                backgroundColor: '#FFFFFF',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    border: 'none',
                                                },
                                                color: "#000000"
                                            }}
                                        >
                                            <MenuItem value="">
                                                <div style={styles.dropdownMenu}>None</div>
                                            </MenuItem>
                                            {
                                                pipelines.map((item, index) => (
                                                    <MenuItem key={item.id} style={styles.dropdownMenu} value={item.title}>{item.title}</MenuItem>
                                                ))
                                            }
                                            {/* <MenuItem value={20}>03058191079</MenuItem>
                                        <MenuItem value={30}>03281575712</MenuItem> */}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </div>
                            <div className="mt-4" style={styles.headingStyle}>
                                Assign this agent to a stage
                            </div>

                            <div>
                                <button className='flex flex-row items-center gap-4' onClick={() => { setIntroVideoModal(true) }}>
                                    <Image src={"/assets/youtubeplay.png"} height={32} width={32} alt='*' style={{ borderRadius: "7px" }} />
                                    <div style={styles.inputStyle} className='underline'>
                                        Watch to learn more on assigning agents
                                    </div>
                                </button>
                            </div>

                            <Modal
                                open={introVideoModal}
                                onClose={() => setIntroVideoModal(false)}
                                closeAfterTransition
                                BackdropProps={{
                                    timeout: 1000,
                                    sx: {
                                        backgroundColor: "#00000020",
                                        // backdropFilter: "blur(20px)",
                                    },
                                }}
                            >
                                <Box className="lg:w-7/12 sm:w-full w-8/12" sx={styles.AddNewKYCQuestionModal}>
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
                                                <button onClick={() => { setIntroVideoModal(false) }}>
                                                    <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                                                </button>
                                            </div>

                                            <div className='text-center sm:font-24 font-16' style={{ fontWeight: "700" }}>
                                                Learn more about assigning agents
                                            </div>

                                            <div className='mt-6'>
                                                <iframe
                                                    src="https://www.youtube.com/embed/Dy9DM5u_GVg?autoplay=1&mute=1" //?autoplay=1&mute=1 to make it autoplay
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    title="YouTube video"
                                                    // className='w-20vh h-40vh'
                                                    style={{
                                                        width: "100%",
                                                        height: "50vh",
                                                        borderRadius: 15,
                                                    }}
                                                />
                                            </div>

                                            {/* Can be use full to add shadow */}
                                            {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                                        </div>
                                    </div>
                                </Box>
                            </Modal>

                            <div className='mt-4' style={styles.inputStyle}>
                                This agent will call leads when they're added to the selected stage.
                            </div>

                            {
                                !assignedNewLEad && (
                                    <div className='border rounded-xl p-2 px-4'>
                                        <div className='flex flex-row items-center justify-between'>
                                            <div style={styles.inputStyle}>
                                                New Lead
                                            </div>
                                            <button className='bg-purple text-white flex flex-row items-center justify-center flex flex-row items-center gap-2'
                                                style={{
                                                    ...styles.inputStyle, borderRadius: "55px",
                                                    height: "44px", width: "104px"
                                                }}
                                                onClick={assignNewLead}
                                            >
                                                <Image src={"/assets/addIcon.png"} height={16} width={16} alt='*' /> Assign
                                            </button>
                                        </div>
                                    </div>
                                )
                            }

                            {
                                assignedNewLEad && (
                                    <div className='border rounded-xl p-2 px-4'>
                                        <div className='flex flex-row items-center justify-between'>
                                            <div style={styles.inputStyle}>
                                                New Lead
                                            </div>
                                            <button className='bg-[#00000020] flex flex-row items-center justify-center'
                                                style={{
                                                    ...styles.inputStyle, borderRadius: "55px",
                                                    height: "44px", width: "104px"
                                                }}
                                                onClick={handleUnAssignNewLead}
                                            >
                                                Unassign
                                            </button>
                                        </div>
                                        <div className='mt-4' style={{ fontWeight: "500", fontSize: 12 }}>
                                            Calling leads a second time within 3 mins boosts answer rates by 80%.
                                        </div>
                                        <div className='border rounded-xl py-4 px-4 mt-4'>

                                            <div>
                                                {rows.map(row => (
                                                    <div key={row.id} className='flex flex-row items-center'>
                                                        <div style={styles.headingStyle}>
                                                            Wait
                                                        </div>
                                                        <div className='ms-6 flex flex-row items-center'>
                                                            <input
                                                                className='flex flex-row items-center justify-center text-center outline-none'
                                                                style={{
                                                                    ...styles.inputStyle,
                                                                    height: "42px", width: "80px", border: "1px solid #00000020",
                                                                    borderTopLeftRadius: "10px", borderBottomLeftRadius: "10px"
                                                                }}
                                                                placeholder='Days'
                                                                value={row.days}
                                                                onChange={(e) => handleInputChange(row.id, 'days', e.target.value)}
                                                            />
                                                            <input
                                                                className='flex flex-row items-center justify-center text-center outline-none'
                                                                style={{
                                                                    ...styles.inputStyle,
                                                                    height: "42px", width: "80px", border: "1px solid #00000020",
                                                                    borderRight: "none", borderLeft: "none"
                                                                }}
                                                                placeholder='Hours'
                                                                value={row.hours}
                                                                onChange={(e) => handleInputChange(row.id, 'hours', e.target.value)}
                                                            />
                                                            <input
                                                                className='flex flex-row items-center justify-center text-center outline-none'
                                                                style={{
                                                                    ...styles.inputStyle,
                                                                    height: "42px", width: "80px", border: "1px solid #00000020",
                                                                    borderTopRightRadius: "10px", borderBottomRightRadius: "10px"
                                                                }}
                                                                placeholder='Minutes'
                                                                value={row.minutes}
                                                                onChange={(e) => handleInputChange(row.id, 'minutes', e.target.value)}
                                                            />
                                                            <div className='ms-4' style={styles.inputStyle}>
                                                                , then Make Call
                                                            </div>
                                                            <button className='ms-2' onClick={() => removeRow(row.id)}>
                                                                <Image src={"/assets/crossIcon.png"} height={20} width={20} alt='*' />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button onClick={addRow} style={styles.inputStyle} className='text-purple mt-4'>
                                                    + Add Call
                                                </button>
                                            </div>

                                            <div className='flex flex-row items-center gap-2 mt-4'>
                                                <button style={styles.inputStyle} onClick={() => {
                                                    rows.forEach(row => {
                                                        console.log(`Row ID: ${row.id}, Days: ${row.days}, Hours: ${row.hours}, Minutes: ${row.minutes}`);
                                                    });
                                                }}>
                                                    Then move to
                                                </button>
                                                <div>
                                                    <Box className="flex flex-row item-center justify-center" sx={{ width: "141px", py: 0, m: 0 }}>
                                                        <FormControl fullWidth sx={{ py: 0, my: 0, minHeight: 0 }}>
                                                            <Select
                                                                displayEmpty
                                                                value={selectPipleLine}
                                                                onChange={handleSelectPipleLine}
                                                                renderValue={(selected) => {
                                                                    if (selected === '') {
                                                                        return <div style={styles.dropdownMenu}>Select Stage</div>;
                                                                    }
                                                                    return selected;
                                                                }}
                                                                sx={{
                                                                    ...styles.dropdownMenu,
                                                                    backgroundColor: 'transparent',
                                                                    color: "#000000",
                                                                    border: "1px solid #00000020",
                                                                    py: 0,
                                                                    my: 0,
                                                                    minHeight: 0,
                                                                    height: "32px", // Set a specific height if needed to control total height
                                                                    '& .MuiOutlinedInput-root': {
                                                                        py: 0,
                                                                        my: 0,
                                                                        minHeight: 0,
                                                                    },
                                                                    '& .MuiSelect-select': {
                                                                        py: 0,
                                                                        my: 0,
                                                                        display: "flex",
                                                                        alignItems: "center", // Center text vertically
                                                                    },
                                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                                        border: 'none',
                                                                    },
                                                                }}
                                                            >
                                                                <MenuItem value="" sx={{ py: 0, my: 0, minHeight: "32px" }}>
                                                                    <div style={{ ...styles.dropdownMenu }}>None</div>
                                                                </MenuItem>
                                                                {pipelines.map((item) => (
                                                                    <MenuItem
                                                                        key={item.id}
                                                                        value={item.title}
                                                                        sx={{ py: 0, my: 0, minHeight: "32px" }} // Adjust minHeight if needed
                                                                    >
                                                                        {item.title}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Box>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                        </div>
                    </div>
                </div>
                <div>
                    <div>
                        <ProgressBar value={33} />
                    </div>

                    <Footer handleContinue={handleContinue} donotShowBack={true} />
                </div>
            </div>
        </div>
    )
}

export default Pipeline1