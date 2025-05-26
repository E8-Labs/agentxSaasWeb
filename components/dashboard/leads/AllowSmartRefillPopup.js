import { Box, CircularProgress, Modal } from "@mui/material";
import Image from "next/image";
import React from "react";

const AllowSmartRefillPopup = ({
  showSmartRefillPopUp,
  handleCloseReillPopup,
  smartRefillLoader,
  smartRefillLoaderLater,
  handleSmartRefillLater,
  handleSmartRefill,
}) => {
  return (
    <div>
      {/*<Modal
        open={true}
        // onClose={() => setShowSmartRefillPopUp(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(5px)",
          },
        }}
      >
        <Box className="lg:w-4/12 sm:w-7/12 w-8/12" sx={styles.modalsStyle}>
        </Box>
      </Modal>*/}
      <div className="bg-[#ffffff] px-8 py-6 rounded-xl">
        <div className="flex flex-row items-center justify-between">
          <div
            style={{
              fontSize: "17px",
              fontWeight: "600",
            }}
          >
            Smart Refill
          </div>
          <button
            className="text-xl font-semibold"
            onClick={() => {
              handleCloseReillPopup();
            }}
          >
            <Image
              src={"/assets/cross.png"}
              alt="*"
              height={10}
              width={10}
            />
          </button>
        </div>
        <div
          className="mt-8"
          style={{
            fontSize: "22px",
            fontWeight: "600",
          }}
        >
          Turn on Smart Refill
        </div>
        <div
          className="mt-6"
          style={{
            fontSize: "15px",
            fontWeight: "500",
          }}
        >
          {`To avoid interruptions when you're making calls, turn it back on and ensure your AI always has minutes to work with.`}
        </div>
        <div className="w-full flex flex-row items-center mt-6 outline-none border-none">
          {smartRefillLoaderLater ? (
            <div className="w-1/2 flex flex-row items-center justify-center">
              <CircularProgress size={35} />
            </div>
          ) : (
            <button
              className="w-1/2 outline-none border-none"
              onClick={() => {
                handleSmartRefillLater();
              }}
            >
              Maybe later
            </button>
          )}

          {smartRefillLoader ? (
            <div className="w-1/2 flex flex-row items-center justify-center">
              <CircularProgress size={35} />
            </div>
          ) : (
            <button
              className="w-1/2 outline-none border-none bg-purple rounded-md h-[50px] text-white"
              onClick={() => {
                handleSmartRefill();
              }}
            >
              Turn On
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllowSmartRefillPopup;

const styles = {
  heading: {
    fontWeight: "600",
    fontSize: 17,
  },
  paragraph: {
    fontWeight: "500",
    fontSize: 12,
  },
  paragraph2: {
    fontWeight: "500",
    fontSize: 12,
  },
  title: {
    fontWeight: "500",
    fontSize: 15,
  },
  modalsStyle: {
    height: "auto",
    bgcolor: "transparent",
    // p: 2,
    mx: "auto",
    my: "50vh",
    transform: "translateY(-55%)",
    borderRadius: 2,
    border: "none",
    outline: "none",
  },
};
