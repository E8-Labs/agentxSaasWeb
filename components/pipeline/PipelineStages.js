import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Image from "next/image";
import { Minus } from "@phosphor-icons/react";
import { Box, FormControl, MenuItem, Select } from "@mui/material";

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
}) => {
    const [pipelineStages, setPipelineStages] = useState(stages);

    useEffect(() => {
        setPipelineStages(stages);
    }, [stages]);

    const handleOnDragEnd = (result) => {
        const { source, destination } = result;

        if (!destination) return;

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
                            overflowY: "auto",
                            borderRadius: "8px",
                            // padding: "10px",
                            border: "none",
                            scrollbarWidth: "none",
                            marginTop: 20
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
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                        }}
                                        className="flex flex-row items-start"
                                    >
                                        <div className="w-[5%]">
                                            <button className="outline-none mt-8">
                                                <Image src={"/assets/list.png"} height={6} width={16} alt="*" />
                                            </button>
                                        </div>
                                        <div className="border w-[95%] rounded-xl p-3 px-4">
                                            <div className="flex flex-row items-center justify-between">
                                                <div style={styles.inputStyle}>{item.stageTitle}</div>
                                                {assignedLeads[index] ? (
                                                    <button
                                                        className="bg-[#00000020] flex flex-row items-center justify-center gap-1"
                                                        style={{
                                                            ...styles.inputStyle,
                                                            borderRadius: "55px",
                                                            height: "44px",
                                                            width: "104px",
                                                        }}
                                                        onClick={() => handleUnAssignNewStage(index)}
                                                    >
                                                        <Minus size={18} weight='regular' />
                                                        <div>
                                                            Unassign
                                                        </div>
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="bg-purple text-white flex flex-row items-center justify-center gap-2"
                                                        style={{
                                                            ...styles.inputStyle,
                                                            borderRadius: "55px",
                                                            height: "44px",
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
                                        </div>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default PipelineStages;