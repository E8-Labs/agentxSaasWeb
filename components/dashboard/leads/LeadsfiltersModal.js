import React, { useRef } from 'react';
import { CalendarDots } from '@phosphor-icons/react';
import Calendar from "react-calendar";
import { Box, CircularProgress, FormControl, MenuItem, Modal, Select } from '@mui/material';
import Image from 'next/image';

const LeadsfiltersModal = ({
    showFilterModal,
    setShowFilterModal,
    setShowFromDatePicker,
    selectedFromDate,
    showFromDatePicker,
    handleFromDateChange,
    setShowToDatePicker,
    selectedToDate,
    showToDatePicker,
    handleToDateChange,
    selectedPipeline,
    handleChange,
    pipelinesList,
    setSelectedStage,
    stagesLoader,
    stagesList,
    isStageSelected,
    handleSelectStage,
    setNoStageSelected,
    noStageSelected,
    setFiltersSelected,
    sheetsLoader,
    setFiltersFromSelection
}) => {

    const fromCalendarRef = useRef(null);
    const toCalendarRef = useRef(null);

    const styles = {
        heading: {
            fontWeight: "700",
            fontSize: 17,
        },
        paragraph: {
            fontWeight: "500",
            fontSize: 15,
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
        subHeading: {
            fontWeight: "500",
            fontSize: 12,
            color: "#00000060",
        },
        heading2: {
            fontWeight: "500",
            fontSize: 15,
            color: "#00000080",
        },
    };

    return (
        <Modal
            open={showFilterModal}
            closeAfterTransition
            BackdropProps={{
                sx: {
                    backgroundColor: "#00000020",
                    maxHeight: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    // //backdropFilter: "blur(5px)",
                },
            }}
        >
            <Box
                className="flex flex-row justify-center items-start lg:w-4/12 sm:w-7/12 w-8/12 py-2 px-6 bg-white max-h-[75svh]  overflow-auto md:overflow-auto"
                sx={{
                    ...styles.modalsStyle,
                    scrollbarWidth: "none",
                    backgroundColor: "white",
                }}
            >
                <div className="w-full flex flex-col items-center justify-start ">
                    <div className="flex flex-row items-center justify-between w-full">
                        <div>Filter</div>
                        <button
                            onClick={() => {
                                setShowFilterModal(false);
                            }}
                        >
                            <Image
                                src={"/assets/cross.png"}
                                height={17}
                                width={17}
                                alt="*"
                            />
                        </button>
                    </div>
                    <div className="mt-2 w-full overflow-auto h-[85%]">
                        <div className="flex flex-row items-start gap-4">
                            <div className="w-1/2 h-full">
                                <div
                                    className="h-full"
                                    style={{
                                        fontWeight: "500",
                                        fontSize: 12,
                                        color: "#00000060",
                                        marginTop: 10,
                                    }}
                                >
                                    From
                                </div>
                                <div>
                                    <button
                                        style={{ border: "1px solid #00000020" }}
                                        className="flex flex-row items-center justify-between p-2 rounded-lg mt-2 w-full justify-between"
                                        onClick={() => {
                                            setShowFromDatePicker(true);
                                        }}
                                    >
                                        <p>
                                            {selectedFromDate
                                                ? selectedFromDate.toDateString()
                                                : "Select Date"}
                                        </p>
                                        <CalendarDots weight="regular" size={25} />
                                    </button>

                                    <div>
                                        {showFromDatePicker && (
                                            <div ref={fromCalendarRef}>
                                                <Calendar
                                                    onChange={handleFromDateChange}
                                                    value={selectedFromDate}
                                                    locale="en-US"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="w-1/2 h-full">
                                <div
                                    style={{
                                        fontWeight: "500",
                                        fontSize: 12,
                                        color: "#00000060",
                                        marginTop: 10,
                                    }}
                                >
                                    To
                                </div>
                                <div>
                                    <button
                                        style={{ border: "1px solid #00000020" }}
                                        className="flex flex-row items-center justify-between p-2 rounded-lg mt-2 w-full justify-between"
                                        onClick={() => {
                                            setShowToDatePicker(true);
                                        }}
                                    >
                                        <p>
                                            {selectedToDate
                                                ? selectedToDate.toDateString()
                                                : "Select Date"}
                                        </p>
                                        <CalendarDots weight="regular" size={25} />
                                    </button>
                                    <div>
                                        {showToDatePicker && (
                                            <div
                                                className="w-full border"
                                                ref={toCalendarRef}
                                            >
                                                <Calendar
                                                    onChange={handleToDateChange}
                                                    value={selectedToDate}
                                                    locale="en-US"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            className="mt-6"
                            style={{
                                fontWeight: "500",
                                fontSize: 14,
                                color: "#00000060",
                                marginTop: 10,
                            }}
                        >
                            Select Pipeline
                        </div>

                        <div className="mt-2">
                            <FormControl fullWidth>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={selectedPipeline}
                                    label="Age"
                                    onChange={handleChange}
                                    displayEmpty // Enables placeholder
                                    renderValue={(selected) => {
                                        if (!selected) {
                                            return (
                                                <div style={{ color: "#aaa" }}>Select</div>
                                            ); // Placeholder style
                                        }
                                        return selected;
                                    }}
                                    sx={{
                                        border: "1px solid #00000020", // Default border
                                        "&:hover": {
                                            border: "1px solid #00000020", // Same border on hover
                                        },
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            border: "none", // Remove the default outline
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                        {
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
                                    {pipelinesList.map((item, index) => {
                                        return (
                                            <MenuItem key={index} value={item.title}>
                                                <button
                                                    onClick={() => {
                                                        //////console.log;
                                                        setSelectedStage([]);
                                                        // getStagesList(item);
                                                    }}
                                                >
                                                    {item.title}
                                                </button>
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </div>

                        <div
                            className="mt-6"
                            style={{
                                fontWeight: "500",
                                fontSize: 14,
                                color: "#00000060",
                                marginTop: 10,
                            }}
                        >
                            Stage
                        </div>

                        {stagesLoader ? (
                            <div className="w-full flex flex-row justify-center mt-8">
                                <CircularProgress
                                    size={25}
                                    sx={{ color: "#7902DF" }}
                                />
                            </div>
                        ) : (
                            <div className="w-full flex flex-wrap gap-4">
                                {stagesList?.map((item, index) => {
                                    let found = isStageSelected(item);
                                    return (
                                        <div
                                            key={index}
                                            className="flex flex-row items-center mt-2 justify-start"
                                            style={{ fontSize: 15, fontWeight: "500" }}
                                        >
                                            <button
                                                onClick={() => {
                                                    console.log("Select other stages ro clicked", item);
                                                    handleSelectStage(item);
                                                }}
                                                className={`p-2 border border-[#00000020] ${found >= 0 ? `bg-purple` : "bg-transparent"
                                                    } px-6
                              ${found >= 0 ? `text-white` : "text-black"
                                                    } rounded-2xl`}
                                            >
                                                {item.stageTitle}
                                            </button>
                                        </div>
                                    );
                                })}

                                {/* Add "No Stage" button after the list */}
                                <div className="flex flex-row items-center mt-2 justify-start">
                                    <button
                                        onClick={() => {
                                            setNoStageSelected((prev) => !prev);
                                        }}

                                        className={`p-2 border border-[#00000020] ${noStageSelected
                                            ? `bg-purple text-white`
                                            : "bg-transparent text-black"
                                            } px-6 rounded-2xl`}
                                    >
                                        No Stage
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-row items-center w-full justify-between mt-4 pb-8">
                        <button
                            className="outline-none w-[105px]"
                            style={{ fontSize: 16.8, fontWeight: "600" }}
                            onClick={() => {
                                // setSelectedFromDate(null);
                                // setSelectedToDate(null);
                                // setSelectedStage(null);
                                // getLeads()
                                //   window.location.reload();
                                setFiltersSelected([]);
                            }}
                        >
                            Reset
                        </button>
                        {sheetsLoader ? (
                            <CircularProgress size={25} sx={{ color: "#7902DF" }} />
                        ) : (
                            <button
                                className="bg-purple h-[45px] w-[140px] bg-purple text-white rounded-xl outline-none"
                                style={{
                                    fontSize: 16.8,
                                    fontWeight: "600",
                                    // backgroundColor: selectedFromDate && selectedToDate && selectedStage.length > 0 ? "" : "#00000050"
                                }}
                                onClick={() => {
                                    //////console.log;
                                    // setLeadsList([]);
                                    // setFilterLeads([]);
                                    setShowFilterModal(false);
                                    setFiltersFromSelection();
                                }}
                            >
                                Apply Filter
                            </button>
                        )}
                    </div>
                </div>
            </Box>
        </Modal>
    )
}

export default LeadsfiltersModal
