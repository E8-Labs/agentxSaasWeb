import React, { useState, useEffect } from 'react'
import AddMcpPopup from './AddMcpPopup';
import EditMcpPopup from './EditMcpPopup';
import { addMcpTool, attachMcpTool, deleteMcpTool, editMcpTool, getMcpTools, removeMcpTool, selectMcpTool } from '../services/McpServices';
import { FormControl, Select, MenuItem, InputBase, CircularProgress } from '@mui/material';
import Image from 'next/image';
import AgentSelectSnackMessage, { SnackbarTypes } from '../../leads/AgentSelectSnackMessage';
import { CaretDown, CaretUp } from '@phosphor-icons/react';
import { Plus } from 'lucide-react';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { MenuItemHoverStyles } from '@/components/globalExtras/MenuItemHoverStyles';
import IntroVideoModal from '@/components/createagent/IntroVideoModal';
import { HowtoVideos } from '@/constants/Constants';



function MCPView({
    selectedAgent,
    setType,
    setMessage,
    setIsVisible,
    selectedUser
}) {

    const [mcpTools, setMcpTools] = useState([]);
    const [open, setOpen] = useState(false);
    const [showMcpLoader, setShowMcpLoader] = useState(false);

    const [showAddMcpPopup, setShowAddMcpPopup] = useState(false);
    const [showEditMcpPopup, setShowEditMcpPopup] = useState(false);

    const [addMcpLoader, setAddMcpLoader] = useState(false);
    const [editMcpLoader, setEditMcpLoader] = useState(false);
    const [deleteMcpLoader, setDeleteMcpLoader] = useState(false);

    const [mcpName, setMcpName] = useState("");
    const [mcpUrl, setMcpUrl] = useState("");
    const [mcpDescription, setMcpDescription] = useState("");

    const [selectedMcpTool, setSelectedMcpTool] = useState([]);

    const [selectedMcpIds, setSelectedMcpIds] = useState([]);

    //attach mcp loader
    const [attachMcpLoader, setAttachMcpLoader] = useState("");

    //how to video
    const [introVideoModal2, setIntroVideoModal2] = useState(false);

    //snackbar
    const [showSnack, setShowSnack] = useState({
        type: SnackbarTypes.Success,
        message: "",
        isVisible: false
    });

    useEffect(() => {
        getMcps();
    }, []);

    // Get MCPs
    const getMcps = async (loader = true) => {
        try {
            if (loader) {
                setShowMcpLoader(true);
            }
            const mcpTools = await getMcpTools(selectedAgent.id, selectedUser);
            if (mcpTools) {
                setMcpTools(mcpTools);
                setShowMcpLoader(false);
                // setIsMcpAssciated(mcpTools.filter(item => item.agentId === selectedAgent.id));
                if (!Array.isArray(mcpTools)) {
                    throw new Error("Unexpected data: mcpTools is not an array");
                }

                // Filter parent tools whose associated array includes a matching id
                // const filteredTools = mcpTools.filter(tool =>
                //     Array.isArray(tool.associatedAgents) &&
                //     tool.associatedAgents.some(assoc => assoc.agentId === selectedAgent.id)
                // );

                const filteredTools = mcpTools.filter(tool =>
                    Array.isArray(tool.associatedAgents) &&
                    tool.associatedAgents.some(
                        assoc =>
                            assoc.agentId === selectedAgent.id &&
                            assoc.isActive === true
                    )
                );

                console.log("Filtered Tools are", filteredTools);
                setSelectedMcpIds(filteredTools.map(item => item.id));
            }
        } catch (error) {
            setShowMcpLoader(false);
        }

    }

    // Add MCP
    const addMcp = async () => {
        setAddMcpLoader(true);
        let data = null;

        if (selectedUser) {
            data = {
                name: mcpName,
                url: mcpUrl,
                description: mcpDescription,
                agentId: selectedAgent.id,
                userId: selectedUser?.id
            }
        } else {
            data = {
                name: mcpName,
                url: mcpUrl,
                description: mcpDescription,
                agentId: selectedAgent.id,
            }
        }

        console.log("Data to be sent is", data);
        const mcpTool = await addMcpTool(data);
        if (mcpTool) {
            if (mcpTool.status === true) {
                setMcpTools(prev => [mcpTool.data, ...prev]);

                setShowAddMcpPopup(false);
                setIsVisible(true);
                setMessage(mcpTool.message);
                setType(SnackbarTypes.Success);
                getMcps(false);
            } else {
                setIsVisible(true);
                setMessage(mcpTool.message);
                setType(SnackbarTypes.Error);
            }
        }
        setMcpName("");
        setMcpUrl("");
        setMcpDescription("");
        setAddMcpLoader(false);
    }

    // Edit MCP
    const editMcp = async () => {
        setEditMcpLoader(true);
        let data = null;
        if (selectedUser) {
            data = {
                name: mcpName,
                url: mcpUrl,
                description: mcpDescription,
                id: selectedMcpTool.id,
                userId: selectedUser?.id
            }
        } else {
            data = {
                name: mcpName,
                url: mcpUrl,
                description: mcpDescription,
                id: selectedMcpTool.id
            }
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

    // Delete MCP
    const deleteMcp = async () => {
        setDeleteMcpLoader(true);
        let data = null;
        if (selectedUser) {
            data = {
                id: selectedMcpTool.id,
                userId: selectedUser?.id
            }
        } else {
            data = {
                id: selectedMcpTool.id
            }
        }
        console.log("data to del mcp tool is", data);
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

    // Select MCP
    const selectMcp = async (item) => {
        let data = null;
        if (selectedUser) {
            data = {
                toolId: item.id,
                agentId: selectedAgent.id,
                userId: selectedUser?.id
            }
        } else {
            data = {
                toolId: item.id,
                agentId: selectedAgent.id
            }
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


    //select the multiple mcps
    const handleSelectChange = (event) => {
        // const ids = event.target.value;
        // setSelectedMcpIds(ids);
        // const selectedItems = mcpTools.filter((tool) => ids.includes(tool.id));
        // selectMcp(selectedItems); // update handler as needed

        const newIds = event.target.value;
        const oldIds = selectedMcpIds;

        setSelectedMcpIds(newIds);

        // Identify the single changed ID:
        let changedId;
        let action;
        if (newIds.length > oldIds.length) {
            changedId = newIds.find(id => !oldIds.includes(id));
            action = "added";
        } else if (newIds.length < oldIds.length) {
            changedId = oldIds.find(id => !newIds.includes(id));
            action = "removed";
        }

        if (changedId) {
            const changedItem = mcpTools.find(item => item.id === changedId);
            console.log(`${action === "added" ? "🎉 Selected:" : "❌ Unselected:"}`, changedItem);
            // attachMcp(changedItem);

            if (action === "removed") {
                detachMcp(changedItem);
            } else if (action === "added") {
                attachMcp(changedItem);
            }
        }


    };

    //remove the mcp from the selected list
    const handleRemoveMcp = (id) => {
        const updated = selectedMcpIds.filter((val) => val !== id);
        setSelectedMcpIds(updated);
        const selectedItems = mcpTools.filter((tool) => updated.includes(tool.id));
        // selectMcp(selectedItems);
    };

    //attach the mcp to the agent
    const attachMcp = async (item) => {
        let data = null;
        if (selectedUser) {
            data = {
                agentId: selectedAgent.id,
                toolId: item.id,
                userId: selectedUser?.id
            }
        } else {
            data = {
                agentId: selectedAgent.id,
                toolId: item.id
            }
        }
        console.log("Data to be sent is", data);
        // return
        setAttachMcpLoader(item.id);
        const mcpTool = await attachMcpTool(data);
        if (mcpTool) {
            if (mcpTool.status === true) {
                setShowSnack({
                    type: SnackbarTypes.Success,
                    message: mcpTool.message,
                    isVisible: true,
                });
                getMcps(false);
                setAttachMcpLoader("");
                setOpen(false);
            } else {
                setOpen(false);
                setShowSnack({
                    type: SnackbarTypes.Error,
                    message: mcpTool.message,
                    isVisible: true,
                });
                setAttachMcpLoader("");
            }
        }
        setAttachMcpLoader("");
    }

    //detach from the agnet
    const detachMcp = async (item) => {
        try {
            const data = {
                agentId: selectedAgent.id,
                toolId: item.id
            }
            setAttachMcpLoader(item.id);
            console.log("Data to be sent is", data)
            const detachResponse = await removeMcpTool(data);
            console.log("Detach Response is", detachResponse);
            if (detachResponse) {
                if (detachResponse.status === true) {
                    setShowSnack({
                        type: SnackbarTypes.Success,
                        message: detachResponse.message,
                        isVisible: true,
                    });
                    getMcps(false);
                    setOpen(false);
                    setAttachMcpLoader("");
                } else {
                    setShowSnack({
                        type: SnackbarTypes.Error,
                        message: detachResponse.message,
                        isVisible: true,
                    });
                    setAttachMcpLoader("");
                }
            }
        } catch (error) {
            console.log("Error in detachMcp", error);
            setAttachMcpLoader("");
        }
    }

    const mcpView = () => {
        return (
            <div className="flex flex-col w-full gap-3">
                <AgentSelectSnackMessage
                    type={showSnack.type}
                    message={showSnack.message}
                    isVisible={showSnack.isVisible}
                    hide={() => {
                        setShowSnack({
                            message: "",
                            isVisible: false,
                            type: SnackbarTypes.Success,
                        });
                    }}
                />
                <div className="flex mt-6 flex-row items-center justify-between w-[97%]">
                    <div className="flex flex-row items-center gap-2">
                        <div className="text-[15px] font-[600] ">
                            Tools
                        </div>

                        {
                            mcpTools.length > 0 && (
                                <div className="flex flex-row items-center gap-2">
                                    <button className="border-none outline-none text-[13px] font-[500] text-purple underline cursor-pointer flex flex-row items-center gap-2"
                                        onClick={() => setIntroVideoModal2(true)}
                                    >
                                        Learn how to add Tools
                                        <Image src="/otherAssets/playIcon.jpg" alt="info" width={10} height={10} className="cursor-pointer"
                                        // onClick={() => setIntroVideoModal2(true)}
                                        />
                                    </button>



                                </div>
                            )
                        }
                    </div>
                    {
                        mcpTools.length > 0 && (
                            <button className="text-[13px] font-[500] text-purple" onClick={() => setShowAddMcpPopup(true)}>
                                + Add Tool
                            </button>
                        )
                    }

                </div>

                {
                    showAddMcpPopup && (
                        <AddMcpPopup open={showAddMcpPopup} handleClose={() => {
                            setShowAddMcpPopup(false)
                            setMcpName("")
                            setMcpUrl("")
                            setMcpDescription("")
                        }}
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

                {/* Intro modal */}
                <IntroVideoModal
                    open={introVideoModal2}
                    onClose={() => setIntroVideoModal2(false)}
                    videoTitle="Learn how to add Tools"
                    videoUrl={HowtoVideos.Tools}
                />

                {
                    showMcpLoader ? (
                        <div className="flex flex-col items-center justify-center w-full">
                            <CircularProgress size={25} />
                        </div>
                    ) : (
                        <div className='w-full'>
                            {
                                mcpTools.length > 0 ? (


                                    <FormControl sx={{ m: 1 }} className="w-[97%]">
                                        <button
                                            className="flex items-center justify-between border rounded px-2 py-1 cursor-pointer outline-none"
                                            style={{
                                                border: "1px solid #00000020",
                                                minHeight: "57px",
                                            }}
                                            onClick={() => setOpen((prev) => !prev)}
                                        >
                                            <div className="flex flex-wrap gap-2">
                                                {selectedMcpIds.length === 0 ? (
                                                    <div
                                                        className="border-none outline-none bg-transparent w-full"
                                                        style={{ color: "#aaa" }}
                                                    // onClick={() => setOpen((prev) => !prev)}
                                                    >
                                                        Select
                                                    </div>
                                                ) : (
                                                    <span className="text-[15px] font-[500] cursor-pointer">

                                                        <div className='flex flex-wrap gap-2 py-2'>
                                                            {mcpTools
                                                                .filter((item) => selectedMcpIds.includes(item.id))
                                                                .map((item, index) => (
                                                                    <div
                                                                        key={index}
                                                                        className="flex items-center gap-2 bg-purple text-white rounded-[15px] px-2 py-1" //bg-btngray
                                                                    >
                                                                        <span className="text-[15px] font-[500]">{item.name}</span>

                                                                    </div>
                                                                ))

                                                            }
                                                        </div>
                                                    </span>

                                                )}
                                            </div>

                                            <div
                                                // onClick={() => setOpen((prev) => !prev)}
                                                className="ml-2"
                                            >
                                                {
                                                    open ? <ArrowDropUpIcon size={16} sx={{ color: '#00000080' }} /> : <ArrowDropDownIcon size={16} sx={{ color: '#00000080' }} />
                                                }
                                            </div>
                                        </button>

                                        <Select
                                            multiple
                                            open={open}
                                            onClose={() => setOpen(false)}
                                            onOpen={() => setOpen(true)}
                                            value={selectedMcpIds}
                                            onChange={handleSelectChange}
                                            displayEmpty
                                            IconComponent={() => null}
                                            input={<InputBase sx={{ height: 0 }} />}
                                            renderValue={() => null}
                                            MenuProps={{
                                                PaperProps: {
                                                    style: {
                                                        maxHeight: "30vh",
                                                        overflow: "auto",
                                                        scrollbarWidth: "none",
                                                    },
                                                },
                                            }}
                                        >
                                            {mcpTools.map((item) => (
                                                <MenuItem
                                                    value={item.id}
                                                    key={item.id}
                                                    disabled={attachMcpLoader}
                                                    sx={MenuItemHoverStyles}
                                                >
                                                    {
                                                        attachMcpLoader === item.id ? (
                                                            <CircularProgress size={24} />
                                                        ) : (
                                                            <div className="flex flex-row items-center justify-between w-full">
                                                                <div className="flex flex-row items-center gap-3">
                                                                    {selectedMcpIds.includes(item.id) ? (
                                                                        <div
                                                                            className="bg-purple flex flex-row items-center justify-center rounded"
                                                                            style={{ height: "24px", width: "24px" }}
                                                                        >
                                                                            <Image
                                                                                src={"/assets/whiteTick.png"}
                                                                                height={8}
                                                                                width={10}
                                                                                alt="*"
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <div
                                                                            className="bg-none border-2 rounded"
                                                                            style={{ height: "24px", width: "24px" }}
                                                                        ></div>
                                                                    )}
                                                                    <div className="text-[15px] font-[500]">{item.name}</div>
                                                                </div>
                                                                <button
                                                                    className="text-[16px] font-[500] text-black underline"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        e.preventDefault();
                                                                        setShowEditMcpPopup(true);
                                                                        setSelectedMcpTool(item);
                                                                    }}
                                                                >
                                                                    Edit
                                                                </button>
                                                            </div>
                                                        )
                                                    }
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                ) : (
                                    noMcpView({
                                        setShowAddMcpPopup
                                    })
                                )
                            }
                        </div>
                    )
                }

                {
                    showEditMcpPopup && (
                        <EditMcpPopup open={showEditMcpPopup} handleClose={() => {
                            setShowEditMcpPopup(false)
                            setMcpName("")
                            setMcpUrl("")
                            setMcpDescription("")
                        }}
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
        )
    }

    const noMcpView = ({
        setShowAddMcpPopup
    }) => {
        return (

            <div className="flex flex-col w-full h-[170px] items-center justify-center bg-[#fafafa] mt-4">

                <button className="border-none outline-none" onClick={() => { setIntroVideoModal2(true) }}>
                    <div className="relative flex-shrink-0">
                        <Image
                            src="/assets/youtubeplay.png"
                            alt="Video thumbnail"
                            width={parseInt(80, 10)}
                            height={parseInt(150, 10)}
                            priority
                            className="rounded-lg object-cover"
                        />
                    </div>
                </button>

                <button
                    className='text-[15px] font-[500] text-black mt-2 outline-none border-none cursor-pointer'
                    onClick={() => { setIntroVideoModal2(true) }}
                >
                    Learn more about Tools
                </button>

                <button
                    className='text-[13px] font-[500] mt-2 text-purple flex flex-row items-center gap-1  cursor-pointer'
                    onClick={() => setShowAddMcpPopup(true)}
                >
                    <Plus size={16} /> <span className='underline'>
                        Add New Tool
                    </span>
                </button>
            </div>
        )
    }



    return (
        <div className='w-full flex'>
            {mcpView()}
        </div>
    )
}

export default MCPView