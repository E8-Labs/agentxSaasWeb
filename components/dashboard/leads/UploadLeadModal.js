import React, { useState } from 'react';
import { Box, CircularProgress, Modal, Switch } from '@mui/material';
import { styles } from '@/components/globalsstyles/Stles';

const UploadLeadModal = ({
    ShowUploadLeadModal,
    setShowUploadLeadModal,
    sheetName,
    processedData,
    NewColumnsObtained
}) => {

    const [isEnrichToggle, setIsEnrichToggle] = useState(false);
    


    return (
        <Modal
            open={ShowUploadLeadModal}
            onClose={() => setShowUploadLeadModal(false)}
            closeAfterTransition
            BackdropProps={{
                timeout: 1000,
                sx: {
                    backgroundColor: "#00000020",
                    // //backdropFilter: "blur(20px)",
                },
            }}
        >
            <Box className="lg:w-7/12 sm:w-10/12 w-10/12" sx={styles.modalsStyle}>
                <div className="flex flex-row justify-center w-full">
                    <div
                        className="w-full h-[90svh]"
                        style={{
                            backgroundColor: "#ffffff",
                            padding: 20,
                            borderRadius: "13px",
                        }}
                    >
                        <div className="flex flex-row justify-end">
                            <button
                                onClick={() => {
                                    setShowUploadLeadModal(false);
                                }}
                            >
                                <Image
                                    src={"/assets/cross.png"}
                                    height={14}
                                    width={14}
                                    alt="*"
                                />
                            </button>
                        </div>
                        <div className="mt-2" style={styles.subHeadingStyle}>
                            Leads
                        </div>

                        <div className="flex flex-row items-center justify-between gap-2 mt-8">
                            <span style={styles.subHeadingStyle}>List Name</span>{" "}
                            <div className="flex flex-row items-center gap-2 ">
                                <Switch
                                    checked={isEnrichToggle}
                                    // color="#7902DF"
                                    // exclusive
                                    onChange={(event) => {
                                        //console.log;
                                        if (isEnrichToggle === true) {
                                            setIsEnrichToggle(false)
                                        } else {
                                            setIsEnrichToggle(true);
                                            setShowenrichModal(true);
                                        }
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


                                <Tooltip
                                    title="Our AI will search the web to pull all current data on your leads."
                                    arrow
                                    componentsProps={{
                                        tooltip: {
                                            sx: {
                                                backgroundColor: "#ffffff", // Ensure white background
                                                color: "#333", // Dark text color
                                                fontSize: "16px",
                                                fontWeight: "500",
                                                padding: "10px 15px",
                                                borderRadius: "8px",
                                                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow
                                            },
                                        },
                                        arrow: {
                                            sx: {
                                                color: "#ffffff", // Match tooltip background
                                            },
                                        },
                                    }}
                                >
                                    <div className="flex flex-row items-center gap-2">
                                        <div style={{ fontSize: 14, fontWeight: '500' }}>
                                            Enrich Leads
                                        </div>
                                        <Image
                                            src={"/svgIcons/infoIcon.svg"}
                                            height={16}
                                            width={16}
                                            alt="*"
                                        />
                                    </div>
                                </Tooltip>
                            </div>
                        </div>

                        <div className="w-full mt-4" style={styles.subHeadingStyle}>
                            <input
                                className="outline-none rounded-lg p-2 w-full"
                                style={{
                                    borderColor: "#00000020",
                                }}
                                value={sheetName} // Only show the base name in the input.split(".")[0]
                                // onChange={handleSheetNameChange}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    ////////console.log;
                                    setSheetName(value);
                                }}
                                placeholder="Enter sheet name"
                            />
                        </div>

                        <div style={{ fontWeight: "500", fontSize: 15, marginTop: 20 }}>
                            Create a tag for leads
                        </div>

                        <div className="mt-4">
                            <TagsInput setTags={setTagsValue} />
                        </div>

                        <div className="mt-4" style={styles.paragraph}>
                            Match columns in your file to column fields
                        </div>

                        <div
                            className="flex flex-row items-center mt-4"
                            style={{ ...styles.paragraph, color: "#00000070" }}
                        >
                            <div className="w-2/12">Matched</div>
                            <div className="w-3/12">Column Header from File</div>
                            <div className="w-3/12">Preview Info</div>
                            <div className="w-3/12">Column Fields</div>
                            <div className="w-1/12">Action</div>
                        </div>

                        <div
                            className="overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple pb-[55px]"
                            style={{ height: "calc(100vh - 500px)" }}
                        >
                            {NewColumnsObtained.map((item, index) => {
                                return (
                                    <div
                                        key={index}
                                        className="flex flex-row items-center mt-4"
                                        style={{ ...styles.paragraph }}
                                    >
                                        <div className="w-2/12">
                                            {item.UserFacingName || item.matchedColumn ? (
                                                <Image
                                                    className="ms-4"
                                                    src={"/assets/checkDone.png"}
                                                    alt="*"
                                                    height={24}
                                                    width={24}
                                                />
                                            ) : (
                                                <Image
                                                    className="ms-4"
                                                    src={"/assets/warning.png"}
                                                    alt="*"
                                                    height={24}
                                                    width={24}
                                                />
                                            )}
                                            {/* <Image className='ms-4' src={"/assets/checkDone.png"} alt='*' height={24} width={24} /> */}
                                        </div>
                                        <div className="w-3/12">{item.ColumnNameInSheet}</div>
                                        <div className="w-3/12 truncate">
                                            {processedData[0][item.ColumnNameInSheet]}
                                        </div>
                                        <div className="w-3/12 border rounded p-2">
                                            <button
                                                className="flex flex-row items-center justify-between w-full outline-none"
                                                onClick={(event) => {
                                                    if (columnAnchorEl) {
                                                        handleColumnPopoverClose();
                                                    } else {
                                                        setSelectedItem(index);
                                                        setUpdateColumnValue(
                                                            item.columnNameTransformed
                                                        );
                                                        handleColumnPopoverClick(event);
                                                        setUpdateHeader(item);
                                                        // }
                                                    }
                                                }}
                                            >
                                                <p className="truncate">
                                                    {item.matchedColumn
                                                        ? item.matchedColumn.UserFacingName
                                                        : item.UserFacingName}
                                                </p>
                                                {selectedItem === index ? (
                                                    <CaretUp size={20} weight="bold" />
                                                ) : (
                                                    <CaretDown size={20} weight="bold" />
                                                )}
                                            </button>
                                        </div>

                                        {item.matchedColumn || item.UserFacingName ? (
                                            <button
                                                className="underline text-purple w-1/12 outline-none ps-4"
                                                onClick={() => {
                                                    setUpdateHeader(item);
                                                    setShowDelCol(true);
                                                    // setUpdateHeader(item)
                                                    // ChangeColumnName(null)
                                                }}
                                            >
                                                <Image
                                                    src={"/assets/blackBgCross.png"}
                                                    height={15}
                                                    width={15}
                                                    alt="*"
                                                />
                                            </button>
                                        ) : (
                                            <div></div>
                                        )}

                                    </div>
                                );
                            })}
                        </div>

                        <div
                            className=""
                            style={{
                                position: "absolute",
                                bottom: 10,
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            {Loader ? (
                                <CircularProgress size={27} />
                            ) : (
                                <button
                                    className="bg-purple text-white rounded-lg h-[50px] w-4/12"
                                    onClick={() => {
                                        // validateColumns();
                                        let validated = validateColumns();

                                        console.log("Validated", validated);
                                        // return;
                                        if (validated) {
                                            console.log("Show enrich");
                                            handleAddLead()
                                        }
                                    }}
                                >
                                    Continue
                                </button>
                            )}
                        </div>

                        {/* Can be use full to add shadow */}
                        {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                    </div>
                </div>
            </Box>
        </Modal>
    )
}

export default UploadLeadModal
