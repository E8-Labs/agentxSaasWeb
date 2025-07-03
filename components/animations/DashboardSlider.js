import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { PersistanceKeys } from "@/constants/Constants";
import { VapiWidget } from "../asksky/vapi-widget";
import { Box, Modal } from "@mui/material";

const DashboardSlider = ({
  onTop = false,
  needHelp = true,
  closeHelp,
  autoFocus = true,
}) => {
  const [visible, setVisible] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  //stores local data
  const [userDetails, setUserDetails] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  const [showAskSkyModal, setShowAskSkyModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [shouldStartCall, setShouldStartCall] = useState(false);

  //fetch local details
  useEffect(() => {
    const localData = localStorage.getItem("User");
    let AuthToken = null;
    if (localData) {
      const UserDetails = JSON.parse(localData);
      // //console.log;
      setUserDetails(UserDetails.user);
      AuthToken = UserDetails.token;
    }
  }, []);

  useEffect(() => {
    if (needHelp) {
      setVisible(true);
    } else {
      setVisible(false);
      setShowIcon(true);
    }
  }, [needHelp]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      if (onTop) {
        closeHelp();
      }
    }, 300);
    setTimeout(() => {
      if (!onTop) {
        setShowIcon(true);
      }
    }, 1000); // show icon after 1 sec
  };

  const handleReopen = () => {
    setShowIcon(false);
    setVisible(true);
  };

  const snackbarVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  };

  //get position bassed on the components
  const getPosition = () => {
    if (onTop) {
      const style = { position: "fixed", top: 50, right: 30, zIndex: 999 };
      return style;
    } else {
      const style = { position: "fixed", bottom: 30, right: 30, zIndex: 999 };
      return style;
    }
  };

  const buttons = [
    {
      id: 1,
      label: "Resource Hub",
      image: "/otherAssets/resourceHubBlack.jpg",
      image2: "/otherAssets/resourceHubBlue.jpg",
      url: PersistanceKeys.ResourceHubUrl,
    },
    {
      id: 2,
      label: "Support Webinar",
      image: "/otherAssets/supportBlack.jpg",
      image2: "/otherAssets/supportBlue.jpg",
      url: PersistanceKeys.SupportWebinarUrl,
    },
    {
      id: 3,
      label: "Ask Sky for Help",
      image: "/otherAssets/askSkyBlack.jpg",
      image2: "/otherAssets/askSkyBlue.jpg",
      url: PersistanceKeys.SupportWebinarUrl,
    },
    {
      id: 4,
      label: "Give Feedback",
      image: "/otherAssets/feedBackIcon.jpg",
      image2: "/otherAssets/feedBackIconBlue.jpg",
      url: PersistanceKeys.FeedbackFormUrl,
    },
    {
      id: 5,
      label: "Hire the Team (Done For You)",
      image: "/otherAssets/hireTeamBlack.jpg",
      image2: "/otherAssets/hireTeamBlue.jpg",
      url: PersistanceKeys.HireTeamUrl,
    },
  ];

  const handleOnClick = (item, index) => {
    if (item.id === 3) {
      setShowAskSkyModal(true);
      setShouldStartCall(true);
    } else {
      if (typeof window !== "undefined") {
        window.open(item.url, "_blank");
      }
    }
  };

  return (
    <div>
      {/* Snackbar */}
      <div style={getPosition()}>
        <AnimatePresence>
          {visible && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={snackbarVariants}
              transition={{ type: "tween", duration: 0.4 }}
              className="bg-white shadow-lg text-black"
              drag="x"
              dragConstraints={{ left: 0, right: 100 }} // limit drag range
              onDragEnd={(event, info) => {
                if (info.offset.x > 100) {
                  handleClose(); // close only if dragged right enough
                }
              }}
              style={{
                padding: "16px 24px",
                borderRadius: "20px",
                width: "350px",
                touchAction: "pan-y", // allow horizontal pan
              }}
            >

              <div style={{ flex: 1 }} className="w-full ">
                <button
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,

                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                  onClick={handleClose}
                >
                  <Image
                    src={"/svgIcons/cross.svg"}
                    width={24}
                    height={24}
                    alt="*"
                  />
                </button>
                <div className="w-full mt-5">
                  <div className="w-full flex flex-col items-start gap-4">
                    {buttons.map((item, index) => (
                      <div
                        key={index}
                        style={{ cursor: "pointer" }}
                        onMouseEnter={() => setHoverIndex(index)}
                        onMouseLeave={() => setHoverIndex(null)}
                      >
                        <button
                          className="w-full flex flex-row items-center gap-2"
                          onClick={() => handleOnClick(item, index)}
                        >
                          <Image
                            src={
                              index === hoverIndex ? item.image2 : item.image
                            }
                            width={24}
                            height={24}
                            alt="*"
                          />
                          <div
                            className="text-black hover:text-purple"
                            style={{ fontSize: 15, fontWeight: "500" }}
                          >
                            {item.label}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                style={{
                  background: "transparent",
                  color: "#fff",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Icon Button (bottom-left) */}
      <AnimatePresence>
        {showIcon && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.4 }}
            className="shadow-lg flex flex-row items-center gap-2"
            style={{
              position: "fixed",
              bottom: 30,
              right: 10,
              zIndex: 999,
              backgroundColor: "#7902DF",
              border: "none",
              borderRadius: "9999px",
              padding: "12px 20px",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              outline: "none",
            }}
          >
            <button
              className="outline-none border-none flex flex-row items-center gap-2"
              onClick={handleReopen}
            >
              <Image
                src={"/svgIcons/getHelpIcon.svg"}
                alt="*"
                height={20}
                width={20}
                style={{ borderRadius: "50%", filter: "invert(1)", }}
              />
              <div style={{ fontWeight: "500", fontSize: 15, color: "white" }}>Get Help</div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        open={showAskSkyModal}
        onClose={() => {
          setShowAskSkyModal(false);
          setShouldStartCall(false);
        }}
        hideBackdrop
        sx={{ pointerEvents: "none" }} // allows VapiWidget to handle its own clicks
      >
        <div style={{ pointerEvents: "auto" }}>
          <VapiWidget
            user={userDetails}
            shouldStart={shouldStartCall}
            setShowAskSkyModal={setShowAskSkyModal}
            setShouldStartCall={setShouldStartCall}
            loadingChanged={(loading) => {
              console.log(`Loading state changed`, loading);
              if (loading) {
                // TODO: Hamza show the loader here
              } else {
                // TODO: Hamza hide the loader here
              }
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default DashboardSlider;

const styles = {
  modalsStyle: {
    height: "auto",
    bgcolor: "transparent",
    p: 2,
    mx: "auto",
    my: "50vh",
    transform: "translateY(-50%)",
    borderRadius: 2,
    border: "none",
    outline: "none",
  },
  headingStyle: {
    fontSize: 16,
    fontWeight: "700",
  },
};
