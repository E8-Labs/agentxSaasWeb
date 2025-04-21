import React, { useRef } from "react";
import {
  ThumbUpOutlined,
  ThumbDownOutlined,
  ChatBubbleOutlineOutlined,
  ChatBubble,
} from "@mui/icons-material";

export function TranscriptBubble({
  message,
  sender,
  index,
  onCommentClick,
  comment,
}) {
  const isBot = sender === "bot";
  const commentBtnRef = useRef(null);

  const bubbleClasses = isBot
    ? "rounded-br-2xl rounded-tr-2xl rounded-bl-2xl"
    : "rounded-bl-2xl rounded-tl-2xl rounded-br-2xl";

  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"} mb-2`}>
      <div>
        <div
          className={`max-w-xs px-4 py-2 shadow text-sm ${bubbleClasses} ${
            isBot ? "text-black" : "text-white"
          }`}
          style={{
            backgroundColor: isBot ? "#F6F7F9" : "#7902DF",
          }}
        >
          {message}
        </div>
        {isBot && (
          <div className="flex gap-2 mt-1 pl-2">
            <button className="text-gray-500 hover:text-black">
              <ThumbUpOutlined fontSize="small" />
            </button>
            <button className="text-gray-500 hover:text-black">
              <ThumbDownOutlined fontSize="small" />
            </button>
            <button
              ref={commentBtnRef}
              className="text-gray-500 hover:text-black border-none outline-none"
              onClick={() => onCommentClick(index, commentBtnRef)}
            >
              {comment ? (
                <div className="flex flex-row items-center gap-2">
                  {/* <ChatBubble fontSize="small" sx={{ color: "#7902DF" }} /> */}
                  <i>
                    <div
                      className="text-purple"
                      style={{
                        fontSize: "13px",
                        fontWeight: "500",
                      }}
                    >
                      {comment}
                    </div>
                  </i>
                </div>
              ) : (
                // <ChatBubbleOutlineOutlined fontSize="small" />
                <div></div>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { parseTranscript } from "@/utilities/parseTranscript";
// import { TranscriptBubble } from "./TranscriptBubble";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

export function TranscriptViewer({ transcript }) {
  console.log("Received transcript is ", transcript);
  const [messages, setMessages] = useState(transcript); //parseTranscript(transcript || "")
  const [activeIndex, setActiveIndex] = useState(null);
  const [popoverPos, setPopoverPos] = useState(null); // null = closed
  const [comment, setComment] = useState("");

  const handleCommentClick = (index, buttonRef) => {
    if (buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPopoverPos({
        top: rect.bottom + window.scrollY - 40,
        left: rect.right + window.scrollX,
      });
      setActiveIndex(index);
    }
  };

  const handleAddComment = () => {
    if (activeIndex !== null) {
      const updatedMessages = [...messages];
      updatedMessages[activeIndex].comment = comment;
      setMessages(updatedMessages);
      setPopoverPos(null);
      setComment("");
    }
  };

  return (
    <div className="p-4 space-y-1 overflow-y-auto max-h-[80vh] bg-white rounded-lg border relative">
      {messages.map((msg, index) => (
        <TranscriptBubble
          key={index}
          message={msg.message}
          sender={msg.sender}
          comment={msg.comment}
          index={index}
          onCommentClick={handleCommentClick}
        />
      ))}

      <Popover
        open={Boolean(popoverPos)}
        anchorReference="anchorPosition"
        anchorPosition={popoverPos || { top: 0, left: 0 }}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        onClose={() => setPopoverPos(null)}
      >
        <div className="p-4 w-80">
          <div style={{ fontWeight: "500", fontSize: "15px" }}>Add Comment</div>
          <TextField
            placeholder="Tell the AI how you really feel.."
            variant="outlined"
            size="small"
            fullWidth
            multiline
            minRows={4}
            maxRows={6}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontWeight: 500,
                fontSize: "15px",
                marginTop: 1,

                "& fieldset": {
                  borderColor: "#ccc", // default border
                },
                "&:hover fieldset": {
                  borderColor: "#aaa", // hover effect
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#ccc", // no blue border
                },

                // Remove focus ring entirely
                "&.Mui-focused": {
                  boxShadow: "none",
                },
              },

              // This ensures no extra blue ring around the input
              "& .MuiOutlinedInput-inputMultiline": {
                outline: "none !important",
              },
            }}
          />

          <div className="flex justify-end gap-2 mt-2">
            {/*<Button size="small" onClick={() => setPopoverPos(null)}>
              Cancel
          </Button>*/}
            <button
              className="bg-purple p-2 text-white rounded-md"
              onClick={handleAddComment}
            >
              Comment
            </button>
          </div>
        </div>
      </Popover>
    </div>
  );
}
