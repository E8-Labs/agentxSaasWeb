import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Image from "next/image";
import { CaretDown, CaretUp, Minus } from "@phosphor-icons/react";
import { Alert, Box, CircularProgress, Fade, FormControl, MenuItem, Modal, Popover, Select, Snackbar } from "@mui/material";
import Apis from "../apis/Apis";
import axios from "axios";
import ColorPicker from "../dashboardPipeline/ColorPicker";

const PipelineStages = ({
    stages,
    onUpdateOrder,
    assignedLeads,
    handleUnAssignNewStage,
    assignNewStage,
    handleInputChange,
    rowsByIndex,
    removeRow,
    addRow,
    nextStage,
    handleSelectNextChange,
    selectedPipelineStages,
    selectedPipelineItem
}) => {
    const [pipelineStages, setPipelineStages] = useState(stages);
    const [delStageLoader, setDelStageLoader] = useState(false);
    const [successSnack, setSuccessSnack] = useState(null);
    const [showDelStagePopup, setShowDelStagePopup] = useState(null);
    const [actionInfoEl, setActionInfoEl] = React.useState(null);

    const handlePopoverOpen = (event) => {
        setActionInfoEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setActionInfoEl(null);
    };

    const open = Boolean(actionInfoEl);

    useEffect(() => {
        console.log("Stagesrecieved are :", stages);
        setPipelineStages(stages);
    }, [stages]);


    //code for drag and drop stages
    const handleOnDragEnd = (result) => {
        const { source, destination } = result;

        // if (!destination) return;
        if (!destination || source.index === 0 || destination.index === 0) {
            return;
        }

        const items = Array.from(pipelineStages);
        const [reorderedItem] = items.splice(source.index, 1);
        items.splice(destination.index, 0, reorderedItem);

        const updatedStages = items.map((stage, index) => ({
            ...stage,
            order: index + 1,
        }));

        setPipelineStages(updatedStages);
        onUpdateOrder(updatedStages);
    };

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

    //code to delete stage
    const handleDeleteStage = async () => {
        try {
            setDelStageLoader(true);
            console.log("Selected pipeline is:", selectedPipelineItem);
            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const UserDetails = JSON.parse(localData);
                AuthToken = UserDetails.token;
                // console.log("Local details are :", UserDetails);
            }

            console.log("Auth token is :--", AuthToken);

            const ApiData = {
                pipelineId: selectedPipelineItem.id,
                stageId: showDelStagePopup.id
            }

            console.log("Api dta is:", ApiData);
            // return
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
                    setPipelineStages(response.data.data.stages);
                    setSuccessSnack(response.data.message);
                    setShowDelStagePopup(null);
                    // setStageAnchorel(null);
                }
            }

        } catch (error) {
            console.error("Error occured in delstage api is:", error);
        } finally {
            setDelStageLoader(false);
        }
    }

    //code for add stage input fields
    const handleAddStageInputsChanges = (id, value) => {
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
                pipelineId: selectedPipelineItem.id,
                action: action,
                examples: inputs
            }

            console.log("Data sending in api is:", ApiData);
            // return
            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of add stage title :", response);
                if (response.data.status === true) {
                    setPipelineStages(response.data.data.stages);
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

    const styles = {
        headingStyle: {
            fontSize: 16,
            fontWeight: "700",
        },
        inputStyle: {
            fontSize: 15,
            fontWeight: "500",
        },
        dropdownMenu: {
            fontSize: 15,
            fontWeight: "500",
            color: "#00000070",
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
        labelStyle: {
            backgroundColor: "white",
            fontWeight: "400",
            fontSize: 10,
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
    };

    return (
        <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="pipelineStages">
                {(provided) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                            maxHeight: "100vh",
                            // overflowY: "auto",
                            // borderRadius: "8px",
                            // padding: "10px",
                            border: "none",
                            scrollbarWidth: "none",
                            marginTop: 20,
                        }}
                    >
                        {pipelineStages.map((item, index) => (
                            <Draggable
                                key={item.id}
                                draggableId={item.id.toString()}
                                index={index}
                            >
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                            ...provided.draggableProps.style,
                                            // border: "1px solid red",
                                            borderRadius: "10px",
                                            // padding: "15px",
                                            marginBottom: "10px",
                                            backgroundColor: "#fff",
                                            // boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                        }}
                                        className="flex flex-row items-start"
                                    >
                                        <div className="w-[5%]">
                                            <div className="outline-none mt-2">
                                                <Image src={"/assets/list.png"} height={6} width={16} alt="*" />
                                            </div>
                                        </div>
                                        <div className="border w-[95%] rounded-xl p-3 px-4">
                                            <div className="flex flex-row items-center justify-between">
                                                <div>
                                                    <div style={styles.inputStyle}>{item.stageTitle}</div>
                                                    <div style={styles.inputStyle}>{item.description}</div>
                                                </div>
                                                <div>
                                                    {assignedLeads[index] ? (
                                                        <div>
                                                            <button
                                                                className="bg-[#00000020] flex flex-row items-center justify-center gap-1"
                                                                style={{
                                                                    ...styles.inputStyle,
                                                                    borderRadius: "55px",
                                                                    height: "40px",
                                                                    width: "104px",
                                                                }}
                                                                onClick={() => handleUnAssignNewStage(index)}
                                                            >
                                                                <Minus size={18} weight='regular' />
                                                                <div>
                                                                    Unassign
                                                                </div>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className="bg-purple text-white flex flex-row items-center justify-center gap-2"
                                                            style={{
                                                                ...styles.inputStyle,
                                                                borderRadius: "55px",
                                                                height: "38px",
                                                                width: "104px",
                                                            }}
                                                            onClick={() => assignNewStage(index)}
                                                        >
                                                            <Image
                                                                src={"/assets/addIcon.png"}
                                                                height={16}
                                                                width={16}
                                                                alt="*"
                                                            />
                                                            <div>
                                                                Assign
                                                            </div>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                {assignedLeads[index] && (
                                                    <div>
                                                        <div
                                                            className="mt-4"
                                                            style={{ fontWeight: "500", fontSize: 12 }}
                                                        >
                                                            Calling leads a second time within 3 mins boosts
                                                            answer rates by 80%.
                                                        </div>
                                                        <div className="border rounded-xl py-4 px-4 mt-4">
                                                            <div>
                                                                {(rowsByIndex[index] || []).map(
                                                                    (row, rowIndex) => (
                                                                        <div
                                                                            key={row.id}
                                                                            className="flex flex-row items-center mb-2"
                                                                        >
                                                                            <div style={styles.headingStyle}>
                                                                                Wait
                                                                            </div>
                                                                            <div className="ms-6 flex flex-row items-center">
                                                                                <div>
                                                                                    <label
                                                                                        className="ms-1 px-2"
                                                                                        style={styles.labelStyle}
                                                                                    >
                                                                                        Days
                                                                                    </label>
                                                                                    <input
                                                                                        className="flex flex-row items-center justify-center text-center outline-none"
                                                                                        style={{
                                                                                            ...styles.inputStyle,
                                                                                            height: "42px",
                                                                                            width: "80px",
                                                                                            border: "1px solid #00000020",
                                                                                            borderTopLeftRadius: "10px",
                                                                                            borderBottomLeftRadius: "10px",
                                                                                        }}
                                                                                        placeholder="Days"
                                                                                        value={row.waitTimeDays}
                                                                                        onChange={(e) =>
                                                                                            handleInputChange(
                                                                                                index,
                                                                                                row.id,
                                                                                                "waitTimeDays",
                                                                                                e.target.value.replace(
                                                                                                    /[^0-9]/g,
                                                                                                    ""
                                                                                                )
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <label
                                                                                        className="ms-1 px-2"
                                                                                        style={styles.labelStyle}
                                                                                    >
                                                                                        Hours
                                                                                    </label>
                                                                                    <input
                                                                                        className="flex flex-row items-center justify-center text-center outline-none"
                                                                                        style={{
                                                                                            ...styles.inputStyle,
                                                                                            height: "42px",
                                                                                            width: "80px",
                                                                                            border: "1px solid #00000020",
                                                                                            borderRight: "none",
                                                                                            borderLeft: "none",
                                                                                        }}
                                                                                        placeholder="Hours"
                                                                                        value={row.waitTimeHours}
                                                                                        onChange={(e) =>
                                                                                            handleInputChange(
                                                                                                index,
                                                                                                row.id,
                                                                                                "waitTimeHours",
                                                                                                e.target.value.replace(
                                                                                                    /[^0-9]/g,
                                                                                                    ""
                                                                                                )
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <label
                                                                                        className="ms-1 px-2"
                                                                                        style={styles.labelStyle}
                                                                                    >
                                                                                        Mins
                                                                                    </label>
                                                                                    <input
                                                                                        className="flex flex-row items-center justify-center text-center outline-none"
                                                                                        style={{
                                                                                            ...styles.inputStyle,
                                                                                            height: "42px",
                                                                                            width: "80px",
                                                                                            border: "1px solid #00000020",
                                                                                            borderTopRightRadius: "10px",
                                                                                            borderBottomRightRadius: "10px",
                                                                                        }}
                                                                                        placeholder="Minutes"
                                                                                        value={row.waitTimeMinutes}
                                                                                        onChange={(e) =>
                                                                                            handleInputChange(
                                                                                                index,
                                                                                                row.id,
                                                                                                "waitTimeMinutes",
                                                                                                e.target.value.replace(
                                                                                                    /[^0-9]/g,
                                                                                                    ""
                                                                                                )
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                                <div
                                                                                    className="ms-4 mt-2"
                                                                                    style={styles.inputStyle}
                                                                                >
                                                                                    , then{" "}
                                                                                    <span style={{ fontWeight: "600" }}>
                                                                                        Make Call
                                                                                    </span>
                                                                                </div>

                                                                                {rowIndex > 0 && (
                                                                                    <button
                                                                                        className="ms-2 mt-2"
                                                                                        onClick={() =>
                                                                                            removeRow(index, row.id)
                                                                                        }
                                                                                    >
                                                                                        Remove
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                )}
                                                                <button
                                                                    onClick={() => addRow(index)}
                                                                    style={styles.inputStyle}
                                                                    className="text-purple mt-4"
                                                                >
                                                                    + Add Call
                                                                </button>
                                                            </div>
                                                            <div className="flex flex-row items-center gap-2 mt-4">
                                                                <div style={styles.inputStyle}>
                                                                    Then move to
                                                                </div>
                                                                {/* <div>
                                                                    {selectedPipelineStages.map(
                                                                        (dropDownStateItem) => (
                                                                            <option
                                                                                disabled={
                                                                                    dropDownStateItem.id <= item.id
                                                                                }
                                                                                key={dropDownStateItem.id}
                                                                                value={dropDownStateItem.stageTitle}
                                                                            >
                                                                                {dropDownStateItem.stageTitle}
                                                                            </option>
                                                                        )
                                                                    )}
                                                                </div> */}
                                                                <Box
                                                                    className="flex flex-row item-center justify-center"
                                                                    sx={{ width: "141px", py: 0, m: 0 }}
                                                                >
                                                                    <FormControl
                                                                        fullWidth
                                                                        sx={{ py: 0, my: 0, minHeight: 0 }}
                                                                    >
                                                                        <Select
                                                                            displayEmpty
                                                                            value={nextStage[index] || ""}
                                                                            onChange={(event) =>
                                                                                handleSelectNextChange(
                                                                                    index,
                                                                                    event
                                                                                )
                                                                            }
                                                                            renderValue={(selected) => {
                                                                                if (selected === "") {
                                                                                    return (
                                                                                        <div
                                                                                            style={
                                                                                                styles.dropdownMenu
                                                                                            }
                                                                                        >
                                                                                            Select Stage
                                                                                        </div>
                                                                                    );
                                                                                }
                                                                                return selected;
                                                                            }}
                                                                            sx={{
                                                                                ...styles.dropdownMenu,
                                                                                backgroundColor:
                                                                                    "transparent",
                                                                                color: "#000000",
                                                                                border: "1px solid #00000020",
                                                                                py: 0,
                                                                                my: 0,
                                                                                minHeight: 0,
                                                                                height: "32px",
                                                                                "& .MuiOutlinedInput-root":
                                                                                {
                                                                                    py: 0,
                                                                                    my: 0,
                                                                                    minHeight: 0,
                                                                                },
                                                                                "& .MuiSelect-select": {
                                                                                    py: 0,
                                                                                    my: 0,
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                },
                                                                                "& .MuiOutlinedInput-notchedOutline":
                                                                                {
                                                                                    border: "none",
                                                                                },
                                                                            }}
                                                                        >

                                                                            {selectedPipelineStages.map(
                                                                                (dropDownStateItem) => (
                                                                                    <MenuItem
                                                                                        disabled={dropDownStateItem.id <= item.id}
                                                                                        key={dropDownStateItem.id}
                                                                                        value={
                                                                                            dropDownStateItem.stageTitle
                                                                                        }
                                                                                        sx={{
                                                                                            py: 0,
                                                                                            my: 0,
                                                                                            minHeight:
                                                                                                "32px",
                                                                                        }}
                                                                                    >
                                                                                        {dropDownStateItem.stageTitle}
                                                                                    </MenuItem>
                                                                                )
                                                                            )}
                                                                        </Select>
                                                                    </FormControl>
                                                                </Box>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="w-full flex flex-row items-center justify-end mt-2">
                                                <button className="flex flex-row items-center gap-1" onClick={() => { setShowDelStagePopup(item) }}>
                                                    <Image src={"/assets/delIcon.png"} height={20} width={18} alt="*"
                                                        style={{
                                                            filter: 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)',
                                                            opacity: 0.5,
                                                        }}
                                                    />
                                                    <p className="text-[#15151580]" style={{ fontWeight: "500", fontSize: 14 }}>
                                                        Delete
                                                    </p>
                                                </button>
                                            </div>
                                            <Modal
                                                open={showDelStagePopup}
                                                onClose={() => setShowDelStagePopup(null)}
                                                closeAfterTransition
                                                BackdropProps={{
                                                    timeout: 1000,
                                                    sx: {
                                                        backgroundColor: "#00000010",
                                                        backdropFilter: "blur(5px)",
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
                                                            <div className='flex flex-row justify-between items-center'>

                                                                <div className='text-center font-16' style={{ fontWeight: "700" }}>
                                                                    Delets stage
                                                                </div>

                                                                <button onClick={() => { setShowDelStagePopup(null) }}>
                                                                    <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                                                                </button>

                                                            </div>

                                                            <div className='text-start mt-4 font-15' style={{ fontWeight: "500" }}>
                                                                Confirm you want to delete this stage. This action is irreversible
                                                            </div>

                                                            <div className="w-full flex flex-row items-center gap-4 mt-8">
                                                                <button
                                                                    className="w-6/12 h-[50px] outline-none"
                                                                    style={{
                                                                        fontWeight: "700",
                                                                        fontSize: 17,
                                                                        border: "1px solid #00000020",
                                                                        borderRadius: 10
                                                                    }} onClick={() => { setShowDelStagePopup(null) }}>
                                                                    Cancel
                                                                </button>
                                                                {
                                                                    delStageLoader ?
                                                                        <div className="w-6/12 flex flex-row items-center justify-center h-[50px]">
                                                                            <CircularProgress size={30} />
                                                                        </div> :
                                                                        <button
                                                                            className="w-6/12 h-[50px] outline-none bg-red text-white"
                                                                            style={{
                                                                                fontWeight: "700",
                                                                                fontSize: 17,
                                                                                border: "0px solid #00000020",
                                                                                borderRadius: 10
                                                                            }}
                                                                            onClick={() => { handleDeleteStage() }}
                                                                        >
                                                                            Yes! Delete
                                                                        </button>
                                                                }
                                                            </div>

                                                        </div>
                                                    </div>
                                                </Box>
                                            </Modal>
                                        </div>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}

                        <button
                            className="outline-none w-full flex flex-row items-center justify-center h-[50px] mt-4 rounded-lg"
                            style={{
                                border: "2px dashed #7902DF"
                            }}
                            onClick={() => { setAddNewStageModal(true) }}
                        >
                            <div className="gap-1 flex flex-row items-center">
                                <Image src={"/assets/addIcon.png"} height={15} width={15} alt="*"
                                    style={{
                                        // filter: 'invert(23%) sepia(50%) saturate(7999%) hue-rotate(259deg) brightness(100%) contrast(140%)',
                                        filter: 'invert(59%) sepia(84%) saturate(7500%) hue-rotate(260deg) brightness(90%) contrast(110%)',
                                    }}
                                />
                                <p className="text-purple" style={{ fontSize: 16, fontWeight: "600" }}>
                                    Add New Stage
                                </p>
                            </div>
                        </button>

                        {/* Code for add stage modal */}
                        <Modal
                            open={addNewStageModal}
                            onClose={() => { setAddNewStageModal(false) }}
                        >
                            <Box className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12" sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}>
                                <div style={{ width: "100%", }}>

                                    <div style={{ scrollbarWidth: "none" }} //className='max-h-[60vh] overflow-auto'
                                    >
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
                                                            open={open}
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

                                                    <div className=' mt-2' //scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple max-h-[30vh] overflow-auto
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
                                                                    onChange={(e) => handleAddStageInputsChanges(input.id, e.target.value)}
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
                                                        <Popover
                                                            id="mouse-over-popover"
                                                            sx={{
                                                                pointerEvents: 'none'
                                                            }}
                                                            open={open}
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

                        <div>
                            <Snackbar
                                open={successSnack}
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
                                    severity="success"
                                    // className='bg-purple rounded-lg text-white'
                                    sx={{
                                        width: "auto",
                                        fontWeight: "700",
                                        fontFamily: "inter",
                                        fontSize: "22",
                                    }}
                                >
                                    {successSnack}
                                </Alert>
                            </Snackbar>
                        </div>
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default PipelineStages;