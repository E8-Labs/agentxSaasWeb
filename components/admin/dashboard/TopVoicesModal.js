import React from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
} from "@mui/material";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import CloseIcon from "@mui/icons-material/Close";
import { FindVoice } from "@/components/createagent/Voices";

// Function to get voice avatar & name
const getAvatarUrl = (voiceId) => FindVoice(voiceId)?.img || "";
const getVoiceName = (voiceId) => FindVoice(voiceId)?.name || "Unknown Voice";

export default function TopVoicesModal({ open, onClose, topVoices }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      BackdropProps={{
        sx: { backgroundColor: "rgba(0, 0, 0, 0.05)" }, // 10% black opacity
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          width: "500px",
          height: "80vh",
          maxWidth: "90%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflow: "hidden",
          boxShadow: "none",
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 10, right: 10 }}
        >
          <CloseIcon />
        </IconButton>

        {/* Modal Title */}
        <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
          Top Voices
        </Typography>

        {/* Scrollable Container */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            width: "100%",
            maxHeight: "65vh",
            paddingRight: "10px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* 2-Column Grid Layout */}
          <div className="flex justify-center items-center w-full">
            <Grid container spacing={2} justifyContent="center">
              {topVoices.map((voice, index) => (
                <Grid item xs={12} sm={6} key={voice.voiceId}>
                  <VoiceCard voice={voice} index={index} />
                </Grid>
              ))}
            </Grid>
          </div>
        </Box>

        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            mt: 2,
            backgroundColor: "#7902DF",
            fontWeight: "bold",
            textTransform: "none",
            borderRadius: "10px",
            width: "120px",
            "&:hover": { backgroundColor: "#6901C3" },
          }}
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
}

function getBackgroundColor(index) {
  if (index === 1) return "bg-purple-500/80";
  if (index === 2) return "bg-pink-500/80";
  return "bg-green-500/80";
}

function VoiceCard({ voice, index }) {
  const color = getBackgroundColor(index);
  let foundVoice = FindVoice(voice.voiceId);
  //console.log;
  //console.log;
  return (
    <Card className="cursor-pointer w-full max-w-[200px] h-[160px] border-white relative border border-white shadow-[0px_4px_31.5px_0px_rgba(121,2,223,0.04)] rounded-2xl p-6 flex flex-col items-center text-center bg-white/60 overflow-hidden">
      {/* Blurred Background */}
      <div
        className={`cursor-pointer absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-20 ${color} rounded-full blur-2xl`}
      />

      {/* Avatar Container */}
      <div className="cursor-pointer relative w-16 h-16 mb-4">
        <div className="cursor-pointer -top-[15px] absolute left-1/2 transform -translate-x-1/2 inset-0 bg-white/40 w-12 h-12 rounded-full backdrop-blur-md" />
        <Avatar className="cursor-pointer w-9 h-9 absolute left-1/2 transform -translate-x-1/2 top-1/3 -translate-y-1/3">
          <AvatarImage src={getAvatarUrl(voice.voiceId)} alt={voice.name} />
        </Avatar>
      </div>

      {/* Voice Name */}
      <h2 className="cursor-pointer mt-4 text-black text-2xl font-medium leading-snug">
        {FindVoice(voice.voiceId).name}
      </h2>

      {/* Voice Users Count */}
      <p className="cursor-pointer mt-4 text-black opacity-60 text-md font-medium leading-tight">
        {voice.count} users
      </p>
    </Card>
  );
}
