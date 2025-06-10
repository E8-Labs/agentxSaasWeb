import { Box, CircularProgress, Modal, Tooltip } from "@mui/material";
import Image from "next/image";
import CloseIcon from "@mui/icons-material/Close";

export default function EnrichModal({
    showenrichModal,
    setShowenrichModal,
    setShowenrichConfirmModal,
    handleAddLead,
    Loader,
    setIsEnrichToggle
}) {

    const handleEnrichFalse = () => {
        setIsEnrichToggle(false);
        setShowenrichModal(false);
    }

    return (
        <Modal open={showenrichModal}
            // onClose={() => setShowAddLeadModal(false)}
            closeAfterTransition
            BackdropProps={{
                timeout: 1000,
                sx: {
                    backgroundColor: "#00000020",
                    // //backdropFilter: "blur(20px)",
                },
            }}
        >
            <Box
                className="lg:w-6/12 sm:w-9/12 w-10/12 "
                sx={{
                    height: "auto",
                    bgcolor: "transparent",
                    // p: 2,
                    mx: "auto",
                    my: "50vh",
                    transform: "translateY(-50%)",
                    borderRadius: 2,
                    border: "none",
                    outline: "none",
                }}
            >
                <div className="flex flex-row justify-center w-full ">
                    <div
                        className="w-full"
                        style={{
                            backgroundColor: "#ffffff",
                            padding: 20,
                            borderRadius: "13px",
                            height: "60vh"
                        }}
                    >
                        <div className="flex flex-row justify-between w-full">

                            <div style={{ fontSize: 18, fontWeight: '700' }}>
                                Lead Insight
                            </div>
                            <button
                                onClick={() => {
                                    handleEnrichFalse();
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

                        <div className="w-full flex flex-col items-center justify-center mt-[90px] gap-4">

                            <Image src={'/svgIcons/sparkles.svg'}
                                height={37} width={37} alt="*"
                            />

                            <div style={{ fontSize: 18, fontWeight: '700' }}>
                                Enrich Lead
                            </div>
                            <div className="flex flex-row gap-2 items-center">

                                <div style={{ fontSize: 13, fontWeight: '500', color: '#00000060', }}>
                                    credit cost ($0.05/lead)
                                </div>

                                <Tooltip
                                    title="This is the cost for us to run the api call with perplexity"
                                    arrow
                                    componentsProps={{
                                        tooltip: {
                                            sx: {
                                                backgroundColor: "#ffffff", // Ensure white background
                                                color: "#333", // Dark text color
                                                fontSize: "16px",
                                                fontWeight: '500',
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
                                    <Image src={"/svgIcons/infoIcon.svg"}
                                        height={16} width={16} alt="*"
                                    />
                                </Tooltip>
                            </div>

                            <div style={{ fontSize: 15, fontWeight: '500', width: '30vw', textAlign: 'center' }}>
                                {`By enriching this lead, you're giving your AI valuable context — pulling in public data to better understand who this person is and how to engage with them.`}
                            </div>



                            <div className="flex flex-row items-center justify-between w-[60%]">

                                {Loader ? (
                                    <CircularProgress size={27} />
                                ) : (
                                    <button className="h-[53px] flex w-[45%] text-[#000000]  text-[16px] hover:text-[#7902DF] py-3 rounded-lg
                     items-center justify-center"
                                        style={{}}
                                        onClick={() => {
                                            // handleAddLead(false)
                                            handleEnrichFalse();
                                        }}
                                    >
                                        Not Interested
                                    </button>
                                )}

                                <button className="h-[53px] text-[16px] w-[143px] rounded-lg bg-purple items-center justify-center text-white"
                                    onClick={() => {
                                        setShowenrichConfirmModal(true)
                                    }}
                                >
                                    Enrich Lead
                                </button>

                            </div>

                        </div>

                    </div>
                </div>
            </Box>
        </Modal>

    )
}