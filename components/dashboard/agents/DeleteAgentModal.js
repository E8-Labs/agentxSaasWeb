import React from "react";
import { Box, Modal, CircularProgress } from "@mui/material";
import Image from "next/image";

const DeleteAgentModal = ({
  delAgentModal,
  setDelAgentModal,
  DelLoader,
  handleDeleteAgent
}) => {
  return (
    <Modal
      open={delAgentModal}
      onClose={() => setDelAgentModal(false)}
      BackdropProps={{
        sx: { backgroundColor: "#00000020" }
      }}
    >
      <Box className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 p-8 rounded-[15px] bg-white mx-auto my-[50vh] transform -translate-y-1/2">
        <div className="w-full">
          <div className="max-h-[60vh] overflow-auto">
            <div className="flex justify-between items-center">
              <div className="text-lg font-medium">Delete Agent</div>
              <button onClick={() => setDelAgentModal(false)}>
                <Image src="/assets/crossIcon.png" height={40} width={40} alt="close" />
              </button>
            </div>

            <div className="mt-6 text-2xl font-bold">
              This is irreversible. Are you sure?
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <button 
              className="w-1/2 h-[50px] rounded-lg font-semibold"
              onClick={() => setDelAgentModal(false)}
            >
              Cancel
            </button>
            
            {DelLoader ? (
              <div className="w-1/2 flex justify-center">
                <CircularProgress size={25} />
              </div>
            ) : (
              <button
                className="w-1/2 h-[50px] bg-red-500 text-white rounded-lg font-semibold"
                onClick={handleDeleteAgent}
              >
                Yes! Delete
              </button>
            )}
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default DeleteAgentModal;