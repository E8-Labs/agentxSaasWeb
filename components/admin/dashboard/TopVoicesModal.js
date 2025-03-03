import React from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
} from "@mui/material";
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
          width: "400px",
          height: "90vh",
          maxWidth: "90%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "none", // ✅ Removed the shadow
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

        {/* List of Voices */}
        <List sx={{ width: "100%", mt: 2, overflow: "scroll" }}>
          {topVoices.map((voice, index) => (
            <ListItem key={voice.voiceId}>
              {/* Avatar */}
              <ListItemAvatar>
                <Avatar src={getAvatarUrl(voice.voiceId)} alt={voice.voiceId} />
              </ListItemAvatar>

              {/* Voice Details */}
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: "bold" }}>
                    {getVoiceName(voice.voiceId)}
                  </Typography>
                }
                secondary={
                  <Typography sx={{ color: "#666", fontSize: "14px" }}>
                    Users: {voice.count} | {voice.percentage}%
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>

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
