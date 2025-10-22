import React from "react";
import Image from "next/image";
import { Modal, Box, CircularProgress } from "@mui/material";

const IntroVideoModal = ({ open, onClose, videoTitle, videoUrl, videoDescription, showLoader = false }) => {
  const modalStyles = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    outline: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        if (videoTitle === "Welcome to AgentX") {
          console.log("Donot close")
        } else {
          onClose()
        }
      }}
      closeAfterTransition
      BackdropProps={{
        timeout: 1000,
        sx: {
          backgroundColor: "#00000020",
        },
      }}
    >
      <Box className="lg:w-5/12 sm:w-full w-8/12" sx={modalStyles}>
        <div
          className="sm:w-full w-full"
          style={{
            backgroundColor: "#ffffff",
            padding: 20,
            borderRadius: "13px",
          }}
        >
          {/* Close Button */}
          <div className="flex flex-row justify-end">
            <button onClick={onClose}>
              <Image
                src="/assets/crossIcon.png"
                height={40}
                width={40}
                alt="Close"
              />
            </button>
          </div>

          {/* Title */}
          <div
            className="text-center"
            style={{ fontWeight: "700", fontSize: 25 }}
          >
            {videoTitle || "Learn more about assigning leads"}
          </div>

          <div
            className="text-center"
            style={{ fontWeight: "600", fontSize: 18 }}
          >
            {videoDescription || ""}
          </div>

          {/* Video Section */}
          <div className="mt-6">
            {/* <iframe
              src={`${videoUrl}?autoplay=1&mute=1`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube video"
              style={{
                width: "100%",
                height: "50vh",
                borderRadius: 15,
              }}
            /> */}
            {
              showLoader ? (
                <div className="w-full flex flex-row items-center justify-center mt-4">
                  <CircularProgress />
                </div>
              ) : (
                <video
                  controls
                  autoPlay
                  muted={false}
                  style={{
                    width: "100%",
                    height: "50vh",
                    borderRadius: 15,
                  }}
                >
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )
            }
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default IntroVideoModal;
