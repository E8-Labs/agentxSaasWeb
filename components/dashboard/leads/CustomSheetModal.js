import React, { useEffect, useRef } from 'react';
import { Box, CircularProgress, Modal, Switch } from '@mui/material';
import { styles } from '@/components/globalsstyles/Stles';
import Image from 'next/image';

const CustomSheetModal = ({
    showAddNewSheetModal,
    setShowAddNewSheetModal,
    setNewSheetName,
    setInputs,
    isInbound,
    setIsInbound,
    inputs,
    handleInputChange,
    handleDelete,
    handleAddInput,
    showaddCreateListLoader,
    newSheetName,
    handleAddSheetNewList,
}) => {

    const bottomRef = useRef(null);

    //function to scroll to the bottom when add new column
    useEffect(() => {
        // Scroll to the bottom when inputs change
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [inputs]);

    return (
        <div>
            <Modal
                open={showAddNewSheetModal}
                closeAfterTransition
                BackdropProps={{
                    sx: {
                        backgroundColor: "#00000020",
                        // //backdropFilter: "blur(5px)",
                    },
                }}
            >
                <Box
                    className="lg:w-4/12 sm:w-7/12 w-8/12 bg-white py-2 px-6 h-[60vh] overflow-auto rounded-3xl h-[70vh]"
                    sx={{
                        ...styles.modalsStyle,
                        scrollbarWidth: "none",
                        backgroundColor: "white",
                    }}
                >
                    <div
                        className="w-full flex flex-col items-center h-full justify-between"
                        style={{ backgroundColor: "white" }}
                    >
                        <div className="w-full">
                            <div className="flex flex-row items-center justify-between w-full mt-4 px-2">
                                <div style={{ fontWeight: "500", fontSize: 15 }}>
                                    New SmartList
                                </div>
                                <button
                                    onClick={() => {
                                        setShowAddNewSheetModal(false);
                                        setNewSheetName("");
                                        setInputs([
                                            { id: 1, value: "First Name" },
                                            { id: 2, value: "Last Name" },
                                            { id: 3, value: "Phone Number" },
                                            { id: 4, value: "" },
                                            { id: 5, value: "" },
                                            { id: 6, value: "" },
                                        ]);
                                    }}
                                >
                                    <Image
                                        src={"/assets/crossIcon.png"}
                                        height={40}
                                        width={40}
                                        alt="*"
                                    />
                                </button>
                            </div>

                            <div className="px-4 w-full">
                                <div className="flex flex-row items-end justify-between mt-6 gap-2">
                                    <span style={styles.paragraph}>List Name</span>

                                    <div className="flex flex-col items-end ">
                                        <div className="">
                                            <span>Inbound?</span>
                                            <Switch
                                                checked={isInbound}
                                                // color="#7902DF"
                                                // exclusive
                                                onChange={(event) => {
                                                    //console.log;
                                                    setIsInbound(event.target.checked);
                                                }}
                                                sx={{
                                                    "& .MuiSwitch-switchBase.Mui-checked": {
                                                        color: "#7902DF",
                                                    },
                                                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                                    {
                                                        backgroundColor: "#7902DF",
                                                    },
                                                }}
                                            />
                                        </div>

                                    </div>
                                </div>
                                <div className="mt-4">
                                    <input
                                        value={newSheetName}
                                        onChange={(e) => {
                                            setNewSheetName(e.target.value);
                                        }}
                                        placeholder="Enter list name"
                                        className="outline-none focus:outline-none focus:ring-0 border w-full rounded-xl h-[53px]"
                                        style={{
                                            ...styles.paragraph,
                                            border: "1px solid #00000020",
                                        }}
                                    />
                                </div>
                                <div className="mt-8" style={styles.paragraph}>
                                    Create Columns
                                </div>
                                <div
                                    className="max-h-[30vh] overflow-auto mt-2" //scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
                                    style={{ scrollbarWidth: "none" }}
                                >
                                    {inputs.map((input, index) => (
                                        <div
                                            key={input.id}
                                            className="w-full flex flex-row items-center gap-4 mt-4"
                                        >
                                            <input
                                                className="border p-2 rounded-lg px-3 outline-none focus:outline-none focus:ring-0 h-[53px]"
                                                style={{
                                                    ...styles.paragraph,
                                                    width: "95%",
                                                    borderColor: "#00000020",
                                                }}
                                                placeholder={`Column Name`}
                                                value={input.value}
                                                readOnly={index < 3}
                                                disabled={index < 3}
                                                onChange={(e) => {
                                                    if (index > 2) {
                                                        handleInputChange(input.id, e.target.value);
                                                    }
                                                }}
                                            />
                                            <div style={{ width: "5%" }}>
                                                {index > 2 && (
                                                    <button
                                                        className="outline-none border-none"
                                                        onClick={() => handleDelete(input.id)}
                                                    >
                                                        <Image
                                                            src={"/assets/blackBgCross.png"}
                                                            height={20}
                                                            width={20}
                                                            alt="*"
                                                        />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {/* Dummy element for scrolling */}
                                    <div ref={bottomRef}></div>
                                </div>
                                <div style={{ height: "50px" }}>
                                    <button
                                        onClick={handleAddInput}
                                        className="mt-4 p-2 outline-none border-none text-purple rounded-lg underline"
                                        style={styles.paragraph}
                                    >
                                        New Column
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="w-full pb-8">
                            {showaddCreateListLoader ? (
                                <div className="flex flex-row items-center justify-center w-full h-[50px]">
                                    <CircularProgress size={25} />
                                </div>
                            ) : (
                                <button
                                    className={`h-[50px] rounded-xl w-full ${newSheetName && newSheetName.length > 0
                                        ? "bg-purple text-white"
                                        : "bg-btngray text-gray-600 cursor-not-allowed" // Disabled state styling
                                        }`}
                                    style={{
                                        fontWeight: "600",
                                        fontSize: 16.8,
                                    }}
                                    onClick={handleAddSheetNewList}
                                    disabled={newSheetName == null || newSheetName === ""}
                                >
                                    Create List
                                </button>
                            )}
                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    )
}

export default CustomSheetModal
