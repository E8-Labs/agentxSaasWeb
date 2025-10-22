"use client";
import React from "react";
import { Modal, Box } from "@mui/material";
import Image from "next/image";

const AddScoringModalBase = ({
  open,
  onClose,
  title = "Add Scoring",
  children,
  className = "",
  ...props
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropProps={{
        sx: {
          backgroundColor: "#00000020",
        },
      }}
      {...props}
    >
      <Box
        className={`lg:w-4/12 sm:w-7/12 w-8/12 bg-white py-6 px-6 max-h-[80vh] overflow-auto rounded-3xl ${className}`}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: 3,
          border: "none",
          outline: "none",
          scrollbarWidth: "none",
          backgroundColor: "white",
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        <div className="w-full flex flex-col h-full">
          {/* Header */}
          <div className="flex flex-row items-center justify-between w-full mb-6">
            <div className="text-lg font-semibold text-gray-900">
              {title}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Image
                src="/assets/cross.png"
                height={15}
                width={15}
                alt="Close"
              />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default AddScoringModalBase;