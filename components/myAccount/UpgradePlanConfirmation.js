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
import Image from "next/image";
import { getMonthlyPrice, getTotalPrice } from "../userPlans/UserPlanServices";

export default function UpgradePlanConfirmation({
    plan,
    open,
    onClose,
    onConfirm,
    currentFullPlan,
    currentPlanOrder
}) {

    console.log('plan', plan)


    //get plan id for confirmation popup


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
                Are you sure?
            </DialogTitle>

            {/* Modal Content */}
            <DialogContent>

                <Typography sx={{ color: "#000", fontSize: "16px", fontWeight: 500 }}>
                    {`The ${plan.name} plans only allows for x ai agents and x teams and x amount of contacts.
                    You’ll be billed separately for each extra agent and team seat. You’ll also lose access to the following features: `}
                </Typography>
                <div className="flex flex-col items-start mt-4 gap-1">
                    {
                        plan?.features?.map((item) => (
                            <div key={item.text} className="flex flex-row items-start gap-3 w-full">
                                <Image src="/svgIcons/greenTick.svg" height={14} width={14} alt="✓" className="mt-1 flex-shrink-0" />
                                <Typography sx={{ color: "#000", fontSize: "14px" }}>
                                    {item.text}
                                </Typography>
                            </div>
                        ))
                    }
                </div>
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
                    {`${currentPlanOrder <= plan?.displayOrder ? "Upgrade" : "Downgrade"} `}

                </div>
            </DialogActions>
        </Dialog>
    );
}
