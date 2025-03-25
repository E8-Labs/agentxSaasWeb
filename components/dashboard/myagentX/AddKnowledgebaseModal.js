import React, { useState, useRef } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import JSZip from "jszip";
import { Close, InsertDriveFile, Link, TextFields } from "@mui/icons-material";
import { User } from "lucide-react";

import { isValidUrl, isValidYoutubeUrl } from "@/constants/Constants";
import Apis from "@/components/apis/Apis";

const AddKnowledgeBaseModal = ({ user, open, onClose, agent }) => {
  const [selectedType, setSelectedType] = useState("Text"); // Url, Document

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [youtube, setYoutube] = useState("");

  const [isUrlValid, setIsUrlValid] = useState(-1); // -1 no text,  0 = invalid, 1 valid

  const [fileName, setFileName] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const fileInputRef = useRef(null);

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  //General App Logic Functions

  //code to select document

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    console.log("File change event");
    if (file) {
      setFileName(file.name);
      setSelectedFileName(file.name);
      // setSelectedDocument(file);
      // compressDocument(file);
      try {
        // Compress the selected document
        const compressedFile = await compressDocument(file);

        // Set the compressed document
        setSelectedDocument(compressedFile);

        console.log("Original file:", file);
        console.log("Compressed file:", compressedFile);
      } catch (error) {
        console.error("Error compressing the document:", error);
      }
    } else {
      console.log("File not selected");
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    // setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      setSelectedFileName(file.name);
      // setSelectedDocument(file);
      // compressDocument(file);
      try {
        // Compress the selected document
        const compressedFile = await compressDocument(file);

        // Set the compressed document
        setSelectedDocument(compressedFile);

        console.log("Original file:", file);
        console.log("Compressed file:", compressedFile);
      } catch (error) {
        console.error("Error compressing the document:", error);
      }
    }
  };
  const handleDragOver = (event) => {
    event.preventDefault();
    // setIsDragging(true);
  };

  const handleDragLeave = () => {
    // setIsDragging(false);
  };

  const handleButtonClick = (event) => {
    event.preventDefault(); // Prevent unintended behavior
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Programmatically open file dialog
    }
  };

  const handleDeselect = () => {
    setFileName("");
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  //code to compress document
  const compressDocument = async (file) => {
    return file;
    // setSelectedDocument(file);
    const zip = new JSZip();
    zip.file(file.name, file);

    try {
      const compressedBlob = await zip.generateAsync({ type: "blob" });

      return new File(
        [compressedBlob],
        file.name.replace(/\.[^/.]+$/, ".zip"),
        {
          type: "application/zip",
        }
      );
    } catch (error) {
      console.error("Compression error:", error);
      return null;
    }
  };

  async function addKnowledgebaseEntry() {
    const formData = new FormData();
    const kbs = [];
  
    // Text KB
    if (text.trim() && title.trim() && selectedType === "Text") {
      kbs.push({
        agentId: agent.id,
        mainAgentId: agent.mainAgentId,
        title:title,
        type: "Text",
        originalContent: text,
      });
    }
  
    // URL KB
    if (url.trim() && isValidUrl(url)) {
      kbs.push({
        agentId: agent.id,
        mainAgentId: agent.mainAgentId,
        title: "Link", // or allow a title field for URLs
        type: "Url",
        originalContent: url,
      });
    }
  
    // YouTube KB
    if (youtube.trim() && isValidYoutubeUrl(youtube)) {
      kbs.push({
        agentId: agent.id,
        mainAgentId: agent.mainAgentId,
        title: "Youtube Video",
        type: "Youtube",
        originalContent: youtube,
      });
    }
  
    // Document KB
    if (selectedDocument && selectedFileName && docTitle.trim()) {
      kbs.push({
        agentId: agent.id,
        mainAgentId: agent.mainAgentId,
        title: docTitle,
        type: "Document",
        documentName: selectedFileName,
      });
  
      formData.append("media", selectedDocument); // Attach only if a document is present
    }
  
    // Don’t proceed if no KBs are filled
    if (kbs.length === 0) {
      console.log("Nothing to submit");
      return;
    }

    let finalKbs  = JSON.stringify(kbs)
    console.log('finalKbs', finalKbs)
  
    formData.append("kbs",finalKbs ); // One list inside another
  
    setLoading(true);
    try {
      const response = await axios.post(Apis.AddKnowledgebase, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
  
      setLoading(false);
      onClose();
  
      // Reset fields
      setTitle("");
      setText("");
      setUrl("");
      setYoutube("");
      setDocTitle("");
      setSelectedDocument(null);
      setSelectedFileName("");
      setFileName("");
  
      console.log("Success:", response.data);
    } catch (error) {
      setLoading(false);
      console.error("Error submitting KB:", error.response?.data || error.message);
    }
  }
  

  function handleSubmit(event) {
    event.preventDefault();
    // const type = selectedType;
    // const title = title;
    // const originalContent = event.target.originalContent.value;
    // const media = selectedDocument;

    addKnowledgebaseEntry()
      .then((data) => {
        if (data) {
          onClose();
        }
      })
      .catch((err) => console.error("Failed:", err));
  }

  //Api Calls

  //UI Related Functions

  function GetUiForOption() {
    if (selectedType == "Text") {
      return GetUiForText();
    } else if (selectedType == "Url") {
      return GetUiForUrl();
    } else if (selectedType == "Youtube") {
      return GetUiForYoutube();
    }
    return GetUiForDocument();
  }

  function GetUiForText() {
    // if (selectedType == "Text") {
    return (
      <div className="flex flex-col w-full gap-4">
        <input
          value={title}
          // value = {showRenameAgentPopup?.name}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          placeholder={"Title"}
          className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px]"
          style={{ border: "1px solid #00000020" }}
        />
        <textarea
          value={text}
          // value = {showRenameAgentPopup?.name}
          onChange={(e) => {
            setText(e.target.value);
          }}
          placeholder={"Type here"}
          className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[15vh]"
          style={{ border: "1px solid #00000020", resize: "none" }}
        />
      </div>
    );
    // }
  }

  function canShowContinue() {
    if (selectedType == "Text") {
      if (title.length > 0 && text.length > 0) {
        return true;
      }
      return false;
    }
    if (selectedType == "Document") {
      if (title.length > 0 && selectedDocument) return true;
      return false;
    }
    if (selectedType == "Url") {
      if (isUrlValid == 1) {
        return true;
      }
      return false;
    }
    if (selectedType == "Youtube") {
      if (isUrlValid == 1) {
        return true;
      }
      return false;
    }
    return false;
  }

  // import { useState } from "react";

  function GetUiForUrl() {
    return (
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-row justify-between">
          <div></div>
        </div>

        <input
          value={url}
          onChange={(e) => {
            const inputValue = e.target.value.trim();
            setUrl(inputValue);

            if (inputValue === "") {
              setIsUrlValid(-1);
            } else {
              const isValid = isValidUrl(inputValue);
              console.log("URL is valid:", isValid);
              setIsUrlValid(isValid ? 1 : 0);
            }

            setTitle(""); // Ensure this is correctly handled in your state
          }}
          placeholder="Enter URL"
          className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px]"
          style={{ border: "1px solid #00000020" }}
        />

        {isUrlValid === 0 && (
          <div className="text-red text-sm">Invalid URL</div>
        )}
      </div>
    );
  }

  function GetUiForYoutube() {
    return (
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-row justify-between">
          <div></div>
        </div>

        <input
          value={youtube}
          onChange={(e) => {
            const inputValue = e.target.value.trim();
            setYoutube(inputValue);

            if (inputValue === "") {
              setIsUrlValid(-1);
            } else {
              const isValid = isValidYoutubeUrl(inputValue);
              console.log("URL is valid:", isValid);
              setIsUrlValid(isValid ? 1 : 0);
            }

            setTitle(""); // Ensure this is correctly handled in your state
          }}
          placeholder="Enter URL"
          className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px]"
          style={{ border: "1px solid #00000020" }}
        />

        {isUrlValid === 0 && (
          <div className="text-red text-sm">Invalid URL</div>
        )}
      </div>
    );
  }

  function GetUiForDocument() {
    return (
      <div className="flex flex-col w-full gap-4">
        <input
          value={docTitle}
          // value = {showRenameAgentPopup?.name}
          onChange={(e) => {
            setDocTitle(e.target.value);
          }}
          placeholder={"Title"}
          className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px]"
          style={{ border: "1px solid #00000020" }}
        />
        <div className="flex flex-row items-center gap-6">
          <input
            type="file"
            id="fileInput"
            ref={fileInputRef} // Use ref instead of ID
            accept=".pdf,.doc,.docx,.txt,.csv"
            className="hidden"
            onChange={handleFileChange}
          />
          {fileName ? (
            <div
              className="flex items-center text-gray-700 p-4 rounded gap-2"
              style={{
                // backgroundColor: "#EDEDED80",
                fontSize: 13,
                fontFamily: "inter",
                // marginTop: 40,
                border: "1px dashed #7902DF",
                borderRadius: "10px",
                // borderColor: '#7902DF',
                boxShadow: "0px 0px 10px 10px rgba(64, 47, 255, 0.05)",
                backgroundColor: "#FBFCFF",
              }}
            >
              <span>{fileName}</span>
              <IconButton onClick={handleDeselect}>
                <Close />
              </IconButton>
            </div>
          ) : (
            <div
              className="flex flex-row w-full justify-center rounded items-center"
              style={{
                height: "100px",
                // border: "2px dashed #0000001006",
                // backgroundColor: "#EDEDED80",
                border: "1px dashed #7902DF",
                borderRadius: "10px",
                // borderColor: '#7902DF',
                boxShadow: "0px 0px 10px 10px rgba(64, 47, 255, 0.05)",
                backgroundColor: "#FBFCFF",
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <button
                onClick={handleButtonClick}
                className="px-4 py-2 h-full"
                style={{ fontWeight: "500", fontSize: 16, fontFamily: "inter" }}
              >
                Drop file or <br /> <span className="text-purple"> Browse</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  function GetButtonUI() {
    if (!loading) {
      return (
        <button
          className={`w-full rounded-lg font-medium h-[50px] ${
            canShowContinue() ? "bg-purple text-white" : "bg-btngray text-black"
          } `}
          // variant="contained"
          // fullWidth
          disabled={!canShowContinue()}
          // sx={{
          //   bgcolor: canShowContinue() ? "#7902DF" : "#E0E0E0",
          //   color: canShowContinue() ? "white" : "black",
          //   borderRadius: 2,
          //   paddingY: 1.5,
          // }}
          onClick={(e) => {
            // e.preventDefault()
            handleSubmit(e);
          }}
        >
          Add
        </button>
      );
    } else {
      return <CircularProgress />;
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        className={"lg:w-[500px] w-[500px]"}
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
        <div className="flex flex-col h-full">
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
            <IconButton
              onClick={() => {
                setTitle("");
                setUrl("");
                setSelectedDocument(null);
                setSelectedFileName("");
                setFileName("");
                if (fileInputRef && fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
                // setSelectedType("Text");
                setText("");
                onClose();
              }}
            >
              <Close />
            </IconButton>
          </Box>

          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Select Type
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 2, overflowX: "auto" }}>
            <Button
              variant="outlined"
              startIcon={<InsertDriveFile />}
              onClick={() => handleTypeSelect("Document")}
              sx={{
                borderColor: selectedType === "Document" ? "#7902DF" : "#ccc",
                color: selectedType === "Document" ? "#7902DF" : "black",
                borderWidth: selectedType === "Document" ? 2 : 1,
                borderRadius: 2,
                paddingX: 2,
                paddingY: 1,
                // width: "30%",
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
                borderRadius: 2,
                paddingX: 2,
                paddingY: 1,
                // width: "30%",
              }}
            >
              Text
            </Button>

            <Button
              variant="outlined"
              startIcon={<Link />}
              onClick={() => handleTypeSelect("Url")}
              sx={{
                borderColor: selectedType === "Url" ? "#7902DF" : "#ccc",
                color: selectedType === "Url" ? "#7902DF" : "black",
                borderWidth: selectedType === "Url" ? 2 : 1,
                borderRadius: 2,
                paddingX: 2,
                paddingY: 1,
                // width: "30%",
              }}
            >
              Link
            </Button>

            <Button
              variant="outlined"
              startIcon={<Link />}
              onClick={() => handleTypeSelect("Youtube")}
              sx={{
                borderColor: selectedType === "Youtube" ? "#7902DF" : "#ccc",
                color: selectedType === "Youtube" ? "#7902DF" : "black",
                borderWidth: selectedType === "Youtube" ? 2 : 1,
                borderRadius: 2,
                paddingX: 2,
                paddingY: 1,
                // width: "30%",
              }}
            >
              Youtube
            </Button>
          </Box>

          {GetUiForOption()}
        </div>

        {GetButtonUI()}
      </Box>
    </Modal>
  );
};

export default AddKnowledgeBaseModal;
