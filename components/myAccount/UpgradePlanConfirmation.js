import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function UpgradePlanConfirmation({
    plan,
    open,
    onClose,
    onConfirm,
}) {


    //get plan id for confirmation popup
    const getPlanFromId = () => {
        let planType = "";
        if (plan === 1) {
            planType = "30";
        } else if (plan === 2) {
            planType = "120";
        } else if (plan === 3) {
            planType = "360";
        } else if (plan === 4) {
            planType = "720";
        }
        return planType;
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: "20px",
                    padding: "20px",
                    width: "500px",
                    maxWidth: "90%",
                    //   textAlign: "center",
                },
            }}
        >
            {/* Close Button */}
            <IconButton
                onClick={onClose}
                sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                }}
            >
                <CloseIcon />
            </IconButton>

            {/* Modal Title */}
            <DialogTitle sx={{ fontWeight: "bold", fontSize: "18px", mt: 1 }}>
                Billing
            </DialogTitle>

            {/* Modal Content */}
            <DialogContent>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    Confirm <span style={{ color: "black" }}>{`${getPlanFromId()}`} Mins</span>
                </Typography>
                <Typography sx={{ color: "#000", fontSize: "16px" }}>
                    {` Please confirm you’d like to proceed with the plan you’ve
          selected.`}
                </Typography>
            </DialogContent>

            {/* Buttons */}
            <DialogActions sx={{ justifyContent: "center", gap: 2, mt: 2 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderColor: "#ddd",
                        color: "#000",
                        fontWeight: "bold",
                        textTransform: "none",
                        paddingY: "0.8rem",
                        borderRadius: "10px",
                        width: "45%",
                    }}
                >
                    Cancel
                </Button>

                {/* <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            backgroundColor: "#7902DF",
            fontWeight: "bold",
            textTransform: "none",
            borderRadius: "10px",
            width: "45%",
            paddingY: "0.8rem",
            "&:hover": { backgroundColor: "#6901C3" },
          }}
        >
          Continue
        </Button> */}

                <div
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
                    Continue
                </div>
            </DialogActions>
        </Dialog>
    );
}
