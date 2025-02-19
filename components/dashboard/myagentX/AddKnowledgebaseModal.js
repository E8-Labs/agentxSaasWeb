import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import { Close, InsertDriveFile, Link, TextFields } from "@mui/icons-material";

const AddKnowledgeBaseModal = ({ open, onClose }) => {
  const [selectedType, setSelectedType] = useState("Text"); // Url, Document

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  function GetUiForOption() {
    if (selectedType == "Text") {
      return GetUiForText();
    } else if (selectedType == "Link") {
      return GetUiForUrl();
    }
    return GetUiForDocument();
  }

  function GetUiForText() {
    if (selectedType == "Text") {
      return (
        <div className="flex flex-col w-full gap-4">
          <input
            value={title}
            // value = {showRenameAgentPopup?.name}
            onChange={(e) => {}}
            placeholder={"Title"}
            className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px]"
            style={{ border: "1px solid #00000020" }}
          />
          <textarea
            value={title}
            // value = {showRenameAgentPopup?.name}
            onChange={(e) => {}}
            placeholder={"Type here"}
            className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[25vh]"
            style={{ border: "1px solid #00000020" }}
          />
        </div>
      );
    }
  }

  function GetUiForUrl() {
    return (
      <div className="flex flex-col w-full gap-4">
        <input
          value={title}
          // value = {showRenameAgentPopup?.name}
          onChange={(e) => {}}
          placeholder={"Url"}
          className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px]"
          style={{ border: "1px solid #00000020" }}
        />
      </div>
    );
  }
  function GetUiForDocument() {
    return (
      <div className="flex flex-col w-full gap-4">
        <input
          value={title}
          // value = {showRenameAgentPopup?.name}
          onChange={(e) => {}}
          placeholder={"Title"}
          className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px]"
          style={{ border: "1px solid #00000020" }}
        />
      </div>
    );
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        className={"w-[30%]"}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          height: "60vh",
          transform: "translate(-50%, -50%)",
          //   width: 400,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Knowledge Base
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Select Type
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<InsertDriveFile />}
            onClick={() => handleTypeSelect("Document")}
            sx={{
              borderColor: selectedType === "Document" ? "#7902DF" : "#ccc",
              color: selectedType === "Document" ? "#7902DF" : "black",
              borderWidth: selectedType === "Document" ? 2 : 1,
              //   borderRadius: 2,
              paddingX: 5,
              paddingY: 1,
              width: "30%",
            }}
          >
            File
          </Button>

          <Button
            variant="outlined"
            startIcon={<TextFields />}
            onClick={() => handleTypeSelect("Text")}
            sx={{
              borderColor: selectedType === "Text" ? "#7902DF" : "#ccc",
              color: selectedType === "Text" ? "#7902DF" : "black",
              borderWidth: selectedType === "Text" ? 2 : 1,
              paddingX: 5,
              paddingY: 1,
              width: "30%",
            }}
          >
            Text
          </Button>

          <Button
            variant="outlined"
            startIcon={<Link />}
            onClick={() => handleTypeSelect("Link")}
            sx={{
              borderColor: selectedType === "Link" ? "#7902DF" : "#ccc",
              color: selectedType === "Link" ? "#7902DF" : "black",
              borderWidth: selectedType === "Link" ? 2 : 1,
              paddingX: 5,
              paddingY: 1,
              width: "30%",
            }}
          >
            Link
          </Button>
        </Box>

        {GetUiForOption()}

        <Button
          variant="contained"
          fullWidth
          sx={{
            bgcolor: "#7902DF",
            color: "white",
            borderRadius: 2,
            paddingY: 1.5,
          }}
        >
          Add
        </Button>
      </Box>
    </Modal>
  );
};

export default AddKnowledgeBaseModal;
