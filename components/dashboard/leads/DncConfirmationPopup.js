import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function DncConfirmationPopup({
  open,
  onClose,
  onCancel,
  onConfirm,
  leadsCount,
}) {
  //console.log;
  const totalCost = leadsCount < 34 ? 1 : leadsCount * 0.03;

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        onClick={onClose}
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
        Confirm DNC Charges
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
            {`DNC Checklist is $0.03/number.`}
          </Typography>
        </Box>
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
          <InfoOutlinedIcon sx={{ color: "transparent", fontSize: 20 }} />
          <Typography sx={{ fontSize: "14px", color: "#000" }}>
            {`If less than 34 leads, it's $1.`}
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
            {leadsCount}
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
            $0.03
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
            ${totalCost.toFixed(2)}
          </Typography>
        </Box>
      </DialogContent>

      {/* Buttons */}
      <DialogActions sx={{ justifyContent: "space-between", mt: 3 }}>
        <div
          onClick={oncancel}
          className=" flex w-[45%] text-black font-bold text-[16px]  hover:[#7902DF]-black py-3 rounded-lg
                     items-center justify-center"
          style={{ textTransform: "none", cursor: 'pointer' }}
        >
          Cancel
        </div>

        {/* <Button
          onClick={onConfirm}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
            fontSize: "16px",
            backgroundColor: "#7902DF",
            color: "white",
            borderRadius: "8px",
            padding: "10px 20px",
            "&:hover": { backgroundColor: "#6901C3" },
          }}
        >
          Confirm & Pay
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
          Confirm & Pay
        </div>
      </DialogActions>
    </Dialog>
  );
}
