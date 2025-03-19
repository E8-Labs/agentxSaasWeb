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

export default function DncConfirmationPopup({
  open,
  onClose,
  onCancel,
  onConfirm,
  leadsCount,
}) {
  console.log("Total Leads ", leadsCount);
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
        Confirm DNC charges
      </DialogTitle>

      {/* Modal Content */}
      <DialogContent>
        <Typography sx={{ color: "#000", fontSize: "16px" }}>
          {`DNC Checklist is $0.03 per number. If less than 34 leads it's $1.`}
        </Typography>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", mb: 1, color: "transparent" }}
        >
          Hello
        </Typography>

        <Typography sx={{ color: "#000", fontSize: "16px" }}>
          Total leads = {leadsCount}
        </Typography>
        <Typography sx={{ color: "#000", fontSize: "16px" }}>
          Total cost to check ={" "}
          {leadsCount < 34 ? "$1" : `$${leadsCount * 0.03}`}
        </Typography>
      </DialogContent>

      {/* Buttons */}
      <DialogActions sx={{ justifyContent: "center", gap: 2, mt: 2 }}>
        <div
          className="cursor-pointer w-[45%] flex justify-center items-center border border-[#ddd] font-bold rounded-lg text-black text-center py-3"
          onClick={onCancel}
          style={{
            borderColor: "#ddd",
            color: "#000",
            fontWeight: "bold",
            textTransform: "none",
            // padding: "0.8rem",
            borderRadius: "10px",
            width: "45%",
          }}
        >
          Cancel
        </div>

        <div
          className="cursor-pointer w-[45%] justify-center bg-[#7902DF] font-bold rounded text-white text-center py-3"
          onClick={onConfirm}
          // variant="contained"
          style={{
            backgroundColor: "#7902DF",
            fontWeight: "bold",
            textTransform: "none",
            borderRadius: "10px",
            width: "45%",
            // paddingY: "0.8rem",
            "&:hover": { backgroundColor: "#6901C3" },
            color: "white !important", // Force white text
          }}
        >
          Confirm
        </div>
      </DialogActions>
    </Dialog>
  );
}
