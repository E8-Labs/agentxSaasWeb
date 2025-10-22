import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import Image from "next/image";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import axios from "axios";
import Apis from "@/components/apis/Apis";
import { useState } from "react";
import CloseBtn from "@/components/globalExtras/CloseBtn";

export default function ConfirmPerplexityModal({
  showConfirmPerplexity,
  setshowConfirmPerplexity,
  handleEnrichLead,
  loading,
  creditCost,
}) {
  return (
    <Dialog
      open={showConfirmPerplexity}
      onClose={() => setshowConfirmPerplexity(false)}
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
      <div className="flex w-full justify-end">
        <CloseBtn
          onClick={() => setshowConfirmPerplexity(false)}
        />
      </div>
      {/* Modal Title */}
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "20px", mt: 1 }}>
        Get 100 Enrichments
      </DialogTitle>
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
            {`Each enrichment is ${creditCost?.pricePerLead}.`}
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
            Total Credits
          </Typography>
          <Typography sx={{ fontWeight: "medium", fontSize: "16px" }}>
            {creditCost?.leadCount}
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
            Cost Per Credit
          </Typography>
          <Typography sx={{ fontWeight: "medium", fontSize: "16px" }}>
            ${creditCost?.pricePerLead}
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
            ${creditCost?.pricePerLead * creditCost?.leadCount}
          </Typography>
        </Box>
      </DialogContent>

      {/* Buttons */}
      <DialogActions sx={{ justifyContent: "space-between", mt: 3 }}>
        <div
          onClick={() => setshowConfirmPerplexity(false)}
          className=" flex w-[45%] text-[#6b7280] font-bold text-[16px] py-3 rounded-lg
                     items-center justify-center"
          style={{ textTransform: "none", cursor: "pointer" }}
        >
          Cancel
        </div>

        {loading ? (
          <CircularProgress size={27} />
        ) : (
          <div
            className="cursor-pointer w-[45%] flex justify-center items-center bg-purple font-bold rounded-lg text-white text-center py-3"
            onClick={() => {
              handleEnrichLead();
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
      </DialogActions>
    </Dialog>
  );
}
