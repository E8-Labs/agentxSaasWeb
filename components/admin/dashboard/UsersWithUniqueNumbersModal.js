import React, { useEffect, useState } from "react";
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

export default function UsersWithUniqueNumbers({ open, onClose, user }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = user.token; // Extract JWT token

      const response = await fetch("/api/admin/stats/usersWithUniqueNumbers", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Admin users:", data.stats.data);
        setUsers(data.stats.data);
      } else {
        console.error("Failed to fetch admin users:", data.error);
      }
    } catch (error) {
      console.error("Error fetching admin users:", error);
    }
  };

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
          Users with unique numbers
        </Typography>

        {/* List of Voices */}
        <List sx={{ width: "100%", mt: 2, overflow: "scroll" }}>
          {users.map((user, index) => (
            <ListItem key={user.id}>
              {/* Avatar */}
              <ListItemAvatar>
                <Avatar src={user.thumb_profile_image} alt={user.name} />
              </ListItemAvatar>

              {/* Voice Details */}
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: "bold" }}>
                    {user.name}
                  </Typography>
                }
                secondary={
                  <Typography sx={{ color: "#666", fontSize: "14px" }}>
                    Phone Numbers: {user.phoneCount}
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
