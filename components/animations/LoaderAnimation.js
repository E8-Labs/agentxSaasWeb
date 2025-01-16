import { Box, CircularProgress, Modal } from "@mui/material";
import Image from "next/image";
import React from "react";

const LoaderAnimation = ({
  loaderModal,
  title = "Your agent is building..",
}) => {
  const styles = {
    headingStyle: {
      fontSize: 16,
      fontWeight: "600",
    },
    inputStyle: {
      fontSize: 15,
      fontWeight: "500",
      borderRadius: "7px",
    },
    errmsg: {
      fontSize: 12,
      fontWeight: "500",
      borderRadius: "7px",
    },
    modalsStyle: {
      height: "auto",
      // bgcolor: "transparent",
      // p: 2,
      mx: "auto",
      my: "50vh",
      transform: "translateY(-55%)",
      border: "none",
      outline: "none",
    },
  };

  return (
    <div>
      <Modal
        open={loaderModal}
        // onClose={() => loaderModal(false)}
        closeAfterTransition
        BackdropProps={{
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(5px)",
          },
        }}
      >
        <Box
          className="lg:w-4/12 sm:w-7/12 w-8/12 rounded-3xl bg-white"
          sx={styles.modalsStyle}
        >
          <div className="flex flex-row justify-center w-full">
            <div
              className="w-full"
              style={{
                backgroundColor: "transparent",
                padding: 20,
                borderRadius: "13px",
              }}
            >
              <div className="flex flex-row items-start mt-12 justify-center">
                {/* <CircularProgress size={200} thickness={1} /> */}
                <Image
                  className=""
                  src="/agentXOrb.gif"
                  style={{ height: "142px", width: "152px", resize: "contain" }}
                  height={142}
                  width={142}
                  alt="*"
                />
              </div>

              <div
                className="text-center mt-8"
                style={{ fontWeight: "600", fontSize: 16 }}
              >
                {title}
              </div>

              {/* <div className='text-center mt-6 pb-8' style={{ fontWeight: "400", fontSize: 15 }}>
                                Loading ...
                            </div> */}

              {/* Can be use full to add shadow
                            <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default LoaderAnimation;
