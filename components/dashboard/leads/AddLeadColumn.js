import { styles } from '@/components/globalsstyles/Stles';
import { Box, Modal } from '@mui/material';
import Image from 'next/image';
import React from 'react'

const AddLeadColumn = ({
    showPopUp,
    setShowPopUp,
    addColRef,
    updateColumnValue,
    setUpdateColumnValue,
    NewColumnsObtained,
    setWarningModal,
    ChangeColumnName
}) => {
    return (
        <div>
            <Modal
                open={showPopUp}
                onClose={() => setShowPopUp(false)}
                closeAfterTransition
                BackdropProps={{
                    timeout: 1000,
                    sx: {
                        backgroundColor: "#00000020",
                        // //backdropFilter: "blur(5px)",
                    },
                }}
            >
                <Box className="lg:w-4/12 sm:w-6/12 w-10/12" sx={styles.modalsStyle}>
                    <div className="flex flex-row justify-center w-full">
                        <div
                            className="w-full"
                            style={{
                                backgroundColor: "#ffffff",
                                padding: 20,
                                borderRadius: "13px",
                            }}
                        >
                            <div className="flex flex-row justify-end">
                                <button
                                    onClick={() => {
                                        setShowPopUp(false);
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
                            <div
                                className="w-full text-center mt-2"
                                style={{ fontSize: 22, fontWeight: "600" }}
                            >
                                Add Column
                            </div>
                            <div className="mt-2" style={styles.subHeadingStyle}>
                                Column Name
                            </div>

                            <input
                                ref={addColRef}
                                type="text"
                                className="border outline-none rounded p-2 mt-2 w-full focus:ring-0"
                                value={updateColumnValue}
                                // onChange={(e) => { setUpdateColumnValue(e.target.value) }}
                                onChange={(e) => {
                                    const regex = /^[a-zA-Z0-9_ ]*$/; // Allow only alphabets
                                    if (regex.test(e.target.value)) {
                                        setUpdateColumnValue(e.target.value);
                                    }
                                }}
                                placeholder="Type here..."
                                style={{ border: "1px solid #00000020" }}
                            />

                            <button
                                className="w-full h-[50px] rounded-xl bg-purple text-white mt-8"
                                style={{
                                    ...styles.subHeadingStyle,
                                    backgroundColor: !updateColumnValue ? "#00000020" : "",
                                    color: !updateColumnValue ? "black" : "",
                                }}
                                disabled={!updateColumnValue}
                                onClick={() => {
                                    if (
                                        NewColumnsObtained?.some(
                                            (item) =>
                                                item?.UserFacingName?.toLowerCase() ===
                                                updateColumnValue?.toLowerCase()
                                        )
                                    ) {
                                        // //console.log;
                                        // return
                                        setWarningModal(true);
                                    } else {
                                        // //console.log;
                                        ChangeColumnName(updateColumnValue);
                                    }
                                }}
                            >
                                Add
                            </button>

                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    )
}

export default AddLeadColumn
