import React, { useState, useEffect } from 'react'
import AddMcpPopup from './AddMcpPopup';
import EditMcpPopup from './EditMcpPopup';
import { addMcpTool, deleteMcpTool, editMcpTool, getMcpTools, selectMcpTool } from '../services/McpServices';
import { FormControl, Select, MenuItem } from '@mui/material';
import Image from 'next/image';
import { SnackbarTypes } from '../../leads/AgentSelectSnackMessage';

function MCPView({
    selectedAgent,
    setType,
    setMessage,
    setIsVisible,

}) {

    const [mcpTools, setMcpTools] = useState([]);


    const [showAddMcpPopup, setShowAddMcpPopup] = useState(false);
    const [showEditMcpPopup, setShowEditMcpPopup] = useState(false);

    const [addMcpLoader, setAddMcpLoader] = useState(false);
    const [editMcpLoader, setEditMcpLoader] = useState(false);
    const [deleteMcpLoader, setDeleteMcpLoader] = useState(false);

    const [mcpName, setMcpName] = useState("");
    const [mcpUrl, setMcpUrl] = useState("");
    const [mcpDescription, setMcpDescription] = useState("");

    const [selectedMcpTool, setSelectedMcpTool] = useState(null);

    useEffect(() => {
        getMcps();
    }, []);

    const getMcps = async () => {
        const mcpTools = await getMcpTools();
        if (mcpTools) {
            setMcpTools(mcpTools);
        }
    }


    const addMcp = async () => {
        setAddMcpLoader(true);
        let data = {
            name: mcpName,
            url: mcpUrl,
            description: mcpDescription,
            agentId: selectedAgent.id
        }

        console.log("Data to be sent is", data);
        const mcpTool = await addMcpTool(data);
        if (mcpTool) {
            if (mcpTool.status === true) {
                setMcpTools(prev => [mcpTool.data, ...prev]);

                setShowAddMcpPopup(false);
                setMcpName("");
                setMcpUrl("");
                setMcpDescription("");
                setIsVisible(true);
                setMessage(mcpTool.message);
                setType(SnackbarTypes.Success);
            } else {
                setIsVisible(true);
                setMessage(mcpTool.message);
                setType(SnackbarTypes.Error);
            }
        }
        setAddMcpLoader(false);
    }

    const editMcp = async () => {
        setEditMcpLoader(true);
        let data = {
            name: mcpName,
            url: mcpUrl,
            description: mcpDescription,
            id: selectedMcpTool.id
        }
        console.log("Data to be sent is", data);
        const mcpTool = await editMcpTool(data);
        if (mcpTool) {
            if (mcpTool.status === true) {
                setMcpTools(prev => prev.map(item => item.id === selectedMcpTool.id ? mcpTool.data : item));
                setShowEditMcpPopup(false);
                setIsVisible(true);
                setMessage(mcpTool.message);
                setType(SnackbarTypes.Success);
            } else {
                setIsVisible(true);
                setMessage(mcpTool.message);
                setType(SnackbarTypes.Error);
            }
        }
        setEditMcpLoader(false);
    }

    const deleteMcp = async () => {
        setDeleteMcpLoader(true);
        let data = {
            id: selectedMcpTool.id
        }
        const mcpTool = await deleteMcpTool(data);
        if (mcpTool) {
            if (mcpTool.status === true) {
                setMcpTools(prev => prev.filter(item => item.id !== selectedMcpTool.id));
                setShowEditMcpPopup(false);
                setIsVisible(true);
                setMessage(mcpTool.message);
                setType(SnackbarTypes.Success);
            } else {
                setIsVisible(true);
                setMessage(mcpTool.message);
                setType(SnackbarTypes.Error);
            }
        }
        setDeleteMcpLoader(false);
    }

    const selectMcp = async (item) => {
        let data = {
            toolId: item.id,
            agentId: selectedAgent.id
        }
        const mcpTool = await selectMcpTool(data);
        if (mcpTool) {
            if (mcpTool.status === true) {
                setSelectedMcpTool(item);
                setIsVisible(true);
                setMessage(mcpTool.message);
                setType(SnackbarTypes.Success);
                // getMcps();
            }
        }
        else {
            setIsVisible(true);
            setMessage(mcpTool.message);
            setType(SnackbarTypes.Error);
        }
    }

    return (
        <div className='w-full flex'>
            <div className="flex flex-col w-full gap-3">
                <div className="flex flex-row items-center justify-between w-full">
                    <div className="text-[15px] font-[500] ">
                        MCP
                    </div>

                    <button className="text-[15px] font-[500] text-purple" onClick={() => setShowAddMcpPopup(true)}>
                        + Add MCP
                    </button>
                </div>

                {
                    showAddMcpPopup && (
                        <AddMcpPopup open={showAddMcpPopup} handleClose={() => setShowAddMcpPopup(false)}
                            handleAddMcp={addMcp}
                            addMcpLoader={addMcpLoader}
                            setMcpName={setMcpName}
                            setMcpUrl={setMcpUrl}
                            setMcpDescription={setMcpDescription}
                            mcpName={mcpName}
                            mcpUrl={mcpUrl}
                            mcpDescription={mcpDescription}

                        />
                    )
                }


                <FormControl sx={{ m: 1 }} className="w-[96%]">

                    <Select
                        labelId="demo-select-small-label"
                        id="demo-select-small"
                        value={selectedMcpTool}
                        // label="Age"
                        // onChange={handleChange}
                        displayEmpty // Enables placeholder
                        renderValue={(selected) => {
                            console.log("Selected Render ", selected);
                            if (!selected) {
                                return <div style={{ color: "#aaa" }}>Select</div>; // Placeholder style
                            }

                            return selected.name || "";
                        }}
                        sx={{
                            border: "1px solid #00000020", // Default border
                            "&:hover": {
                                border: "1px solid #00000020", // Same border on hover
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                                border: "none", // Remove the default outline
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                border: "none", // Remove outline on focus
                            },
                            "&.MuiSelect-select": {
                                py: 0, // Optional padding adjustments
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
                            mcpTools.map((item) => (
                                <MenuItem value={item} key={item.id}
                                    onClick={() => {
                                        setSelectedMcpTool(item)
                                        // selectMcp(item)
                                    }}
                                >
                                    <div className="flex flex-row items-center justify-between w-full">
                                        <div className="flex flex-row items-center gap-2">
                                            <Image src="/otherAssets/mcpCheckIcon.png" alt="calendar" width={24} height={24} />
                                            <div className="text-[15px] font-[500] ">
                                                {item.name}
                                            </div>
                                        </div>
                                        <button className="text-[16px] font-[500] text-gray-500 underline"
                                            onClick={(e) => {
                                                e.stopPropagation(); // <-- Prevent the Select from closing
                                                e.preventDefault();  // <-- Prevent default behavior
                                                setShowEditMcpPopup(true)
                                                setSelectedMcpTool(item)
                                            }}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </MenuItem>

                            ))
                        }



                    </Select>
                </FormControl>
                {
                    showEditMcpPopup && (
                        <EditMcpPopup open={showEditMcpPopup} handleClose={() => setShowEditMcpPopup(false)}
                            selectedMcpTool={selectedMcpTool}
                            setSelectedMcpTool={setSelectedMcpTool}
                            mcpTools={mcpTools}
                            setMcpTools={setMcpTools}
                            setShowEditMcpPopup={setShowEditMcpPopup}
                            setShowAddMcpPopup={setShowAddMcpPopup}
                            setMcpName={setMcpName}
                            setMcpUrl={setMcpUrl}
                            setMcpDescription={setMcpDescription}
                            mcpName={mcpName}
                            mcpUrl={mcpUrl}
                            mcpDescription={mcpDescription}
                            editMcpLoader={editMcpLoader}
                            handleEditMcp={editMcp}
                            handleDeleteMcp={deleteMcp}
                            deleteMcpLoader={deleteMcpLoader}
                        />
                    )
                }
            </div>
        </div>
    )
}

export default MCPView