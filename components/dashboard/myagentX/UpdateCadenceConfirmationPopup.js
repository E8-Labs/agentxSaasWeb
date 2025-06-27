import { Box, Modal } from "@mui/material";
import Image from "next/image";

export const UpdateCadenceConfirmationPopup = ({
    showConfirmationPopuup,
    setShowConfirmationPopup,
    onContinue

}) => {
    return (
        <div>
            <Modal
                open={showConfirmationPopuup} //showConfirmationPopuup
                onClose={() => {
                    setShowConfirmationPopup(false);
                }}
                BackdropProps={{
                    timeout: 100,
                    sx: {
                        backgroundColor: "#00000020",
                        // //backdropFilter: "blur(20px)",
                    },
                }}
            >
                <Box
                    className="w-10/12 sm:w-7/12 md:w-6/12 lg:w-5/12 p-8 rounded-[15px]"
                    sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
                >
                    <div style={{ width: "100%" }}>
                        <div
                            className="max-h-[60vh] overflow-auto"
                            style={{ scrollbarWidth: "none" }}
                        >




                            <p
                                className="text-black"
                                style={{
                                    fontSize: 16,
                                    fontWeight: "600",
                                }}
                            >
                                Are you sure?
                            </p>

                            <p
                                className="text-black mt-4"
                                style={{
                                    fontSize: 13,
                                    fontWeight: "500",

                                }}
                            >
                                By updating the pipeline and stages, you'll pause all active ongoing calls assigned to this agent.
                            </p>
                        </div>
                        <div className="flex flex-row items-center justify-between gap-4 mt-6">
                            <button
                                className="w-6/12 border rounded h-[50px]"
                                onClick={() => {
                                    setShowConfirmationPopup(false);
                                }}
                            >
                                Cancel
                            </button>
                            <div className="w-6/12">
                                {/* {PauseLoader ? (
                                    <div className="flex flex-row iems-center justify-center w-full mt-4">
                                        <CircularProgress size={25} />
                                    </div>
                                ) : ( */}
                                <button
                                    className={`outline-none bg-purple`}
                                    style={{
                                        color: "white",
                                        height: "50px",
                                        borderRadius: "10px",
                                        width: "100%",
                                        fontWeight: 600,
                                        fontSize: "20",
                                    }}
                                    onClick={() => {
                                        onContinue()
                                    }}
                                >
                                    Continue
                                </button>
                                {/* )} */}
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};


const styles = {
    text: {
        fontSize: 15,
        color: "#00000090",
        fontWeight: "500",
    },
    text2: {
        textAlignLast: "left",
        fontSize: 15,
        // color: '#000000',
        fontWeight: "500",
        whiteSpace: "nowrap", // Prevent text from wrapping
        overflow: "hidden", // Hide overflow text
        textOverflow: "ellipsis", // Add ellipsis for overflow text
    },
    modalsStyle: {
        // height: "auto",
        // height: "90svh",
        bgcolor: "transparent",
        // p: 2,
        mx: "auto",
        my: "50vh",
        transform: "translateY(-55%)",
        borderRadius: 2,
        border: "none",
        outline: "none",
    },
};
