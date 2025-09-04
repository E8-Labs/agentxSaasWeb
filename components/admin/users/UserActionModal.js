"use client";
import React from "react";
import { Box, Modal } from '@mui/material';

function UserActionModal({ open, onClose, selectedUser, onViewDetail, onViewLogs }) {
  if (!selectedUser) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      BackdropProps={{
        timeout: 200,
        sx: {
          backgroundColor: "#00000020",
          zIndex: 1200,
        },
      }}
      sx={{
        zIndex: 1300,
      }}
    >
      <Box
        className="w-96 p-6 rounded-[15px]"
        sx={{
          height: "auto",
          bgcolor: "transparent",
          p: 2,
          mx: "auto",
          my: "50vh",
          transform: "translateY(-50%)",
          borderRadius: 2,
          border: "none",
          outline: "none",
          backgroundColor: "white",
          position: "relative",
          zIndex: 1301,
        }}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Select Action for {selectedUser.name}
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                onViewDetail();
                onClose();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>View Detail</span>
            </button>
            
            <button
              onClick={() => {
                onViewLogs();
                onClose();
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>View Logs</span>
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  );
}

export default UserActionModal;
