import {
    Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogTitle, IconButton, Typography
}
    from "@mui/material";
import Image from "next/image";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";



export default function EnrichConfirmModal({
    showenrichConfirmModal,
    setShowenrichConfirmModal,
    handleAddLead,
    processedData,
    Loader
}) {
    let totalCost = processedData?.length * 0.10
    return (
        <Dialog
            open={showenrichConfirmModal}
            onClose={() => setShowenrichConfirmModal(true)}
            PaperProps={{
                sx: {
                    borderRadius: "16px",
                    padding: "24px",
                    width: "500px",
                    maxWidth: "90%",
                },
            }}
        >
            {/* Close Button */}
            <IconButton
                onClick={() => setShowenrichConfirmModal(false)}
                sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    color: "#000",
                }}
            >
                <CloseIcon />
            </IconButton>

            {/* Modal Title */}
            <DialogTitle sx={{ fontWeight: "bold", fontSize: "20px", mt: 1 }}>
                Confirm
            </DialogTitle>

            {/* Info Box */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                    // gap: 1.5,
                    backgroundColor: "#F6F0FF",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    mb: 1,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 1.5,
                        // backgroundColor: "#F6F0FF",
                        // padding: "12px 16px",
                        borderRadius: "8px",
                        mb: 0,
                    }}
                >
                    <InfoOutlinedIcon sx={{ color: "#7902DF", fontSize: 20 }} />
                    <Typography sx={{ fontSize: "14px", color: "#000" }}>
                        {`Enrichment is $0.10 / lead `}
                    </Typography>
                </Box>

            </Box>


            {/* Modal Content */}
            <DialogContent>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 3,
                    }}
                >
                    <Typography sx={{ color: "#000", fontSize: "16px" }}>
                        Total Leads
                    </Typography>
                    <Typography sx={{ fontWeight: "medium", fontSize: "16px" }}>
                        {processedData?.length}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                    }}
                >
                    <Typography sx={{ color: "#000", fontSize: "16px" }}>
                        Cost Per Lead
                    </Typography>
                    <Typography sx={{ fontWeight: "medium", fontSize: "16px" }}>
                        $0.10
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 2,
                        pt: 1,
                        borderTop: "1px solid #ddd",
                    }}
                >
                    <Typography sx={{ color: "#000", fontSize: "16px" }}>
                        Total Cost
                    </Typography>
                    <Typography sx={{ fontWeight: "medium", fontSize: "16px" }}>
                        ${processedData?.length <= 20 ? "1" : totalCost.toFixed(2)}
                    </Typography>
                </Box>
            </DialogContent>

            {/* Buttons */}
            <DialogActions sx={{ justifyContent: "space-between", mt: 3 }}>
                <Button
                    onClick={() => setShowenrichConfirmModal(false)}
                    sx={{
                        textTransform: "none",
                        fontWeight: "bold",
                        color: "#7902DF",
                        fontSize: "16px",
                        width: "45%",
                    }}
                >
                    Cancel
                </Button>
                {Loader ? (
                    <CircularProgress size={27} />
                ) : (
                    <div
                        className="cursor-pointer w-[45%] flex justify-center items-center bg-purple font-bold rounded-lg text-white text-center py-3"
                        onClick={() => {
                            handleAddLead(true)
                        }}
                        style={{
                            borderColor: "#ddd",
                            color: "#fff",
                            fontWeight: "bold",
                            textTransform: "none",
                            padding: "0.8rem",
                            borderRadius: "10px",
                            width: "45%",
                        }}
                    >
                        Confirm & Pay
                    </div>
                )}
                {/* <div
            className="cursor-pointer w-[45%] flex justify-center items-center bg-purple font-bold rounded-lg text-white text-center py-3"
            onClick={onConfirm}
            style={{
              borderColor: "#ddd",
              color: "#fff",
              fontWeight: "bold",
              textTransform: "none",
              padding: "0.8rem",
              borderRadius: "10px",
              width: "45%",
            }}
          >
            Confirm
          </div> */}
            </DialogActions>
        </Dialog>
    )
}