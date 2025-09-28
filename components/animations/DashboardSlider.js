import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { PersistanceKeys } from "@/constants/Constants";
import { SupportWidget } from "../askSky/support-widget";
import { Box, Modal } from "@mui/material";
import VapiChatWidget from "../askSky/VapiChatWidget";
import UpgradeModal from "@/constants/UpgradeModal";
import CloseBtn from "@/components/globalExtras/CloseBtn";

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
  const [shouldStartCall, setShouldStartCall] = useState(false);

  const [showAskSkyConfirmation, setShowAskSkyConfirmation] = useState(false);
  const [showVapiChatWidget, setShowVapiChatWidget] = useState(false);
  const [openUpgradePlan, setOpenUpgradePlan] = useState(false)

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
      setShowIcon(false);
      setVisible(true);
    } else {
      setVisible(false);
      setShowIcon(true);
    }
  }, [needHelp]);

  //check if the call was initated then keep the slider and vapi-widget open
  useEffect(() => {
    const vapiValue = localStorage.getItem(PersistanceKeys.showVapiModal);
    if (vapiValue) {
      const d = JSON.parse(vapiValue);
      console.log("Vapi-value is", d);
    }
  }, [])

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
      const style = { position: "fixed", top: 50, right: 8, zIndex: 999 };
      return style;
    } else {
      const style = { position: "fixed", bottom: 20, right: 8, zIndex: 999 };
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
    // {
    //   id: 4,
    //   label: "Chat Sky for Help",
    //   image: "/otherAssets/askSkyBlack.jpg",
    //   image2: "/otherAssets/askSkyBlue.jpg",
    //   url: PersistanceKeys.SupportWebinarUrl,
    // },
    {
      id: 4,
      label: "Give Feedback",
      image: "/otherAssets/feedBackIcon.jpg",
      image2: "/otherAssets/feedBackIconBlue.jpg",
      url: PersistanceKeys.FeedbackFormUrl,
    },
    {
      id: 5,
      label: "Hire the Team",
      image: "/otherAssets/hireTeamBlack.jpg",
      image2: "/otherAssets/hireTeamBlue.jpg",
      url: PersistanceKeys.HireTeamUrl,
    },
    {
      id: 6,
      label: "Billing Support",
      image: "/otherAssets/billingIcon.jpg",
      image2: "/otherAssets/billingIconBlue.png",
      url: PersistanceKeys.BillingSupportUrl,
    },
  ];

  console.log('openUpgradePlan', openUpgradePlan)

  const handleOnClick = (item) => {
    if (item.id === 3) {

      setShowAskSkyModal(true);
      setShouldStartCall(true);
    } else if (item.id == 2) {

      if (!userDetails?.plan?.price) {
        console.log('open')
        setOpenUpgradePlan(true)
      } else {
        if (typeof window !== "undefined" && item.url) {
          window.open(item.url, "_blank");
        }
      }
    } else {
      if (typeof window !== "undefined" && item.url) {
        window.open(item.url, "_blank");
      }
    }
  }

  const handleCloseUpgrade = ()=>{
    setOpenUpgradePlan(false)
  }



  const renderViews = () => {
    if (showAskSkyModal) {
      return (
        <SupportWidget
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
      )
    } else if (showVapiChatWidget) {
      return (
        <VapiChatWidget
          setShowVapiChatWidget={setShowVapiChatWidget}
        />
      )
    } else {
      return (
        <div className="flex flex-col items-end justify-end w-full gap-3">
          <div className="w-full mt-5 bg-white shadow-lg text-black w-full"
            style={{
              borderRadius: "8px", padding: "16px 24px",
            }}
          >
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
                      className="text-black hover:text-purple whitespace-nowrap"
                      style={{ fontSize: 15, fontWeight: "500" }}
                    >
                      {item.label}
                    </div>
                    {
                      item.id === 3 && (

                        <div className="px-3 py-1 rounded-lg bg-purple text-white text-[12px] font-[300] ml-5">
                          Beta
                        </div>
                      )}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <CloseBtn 
            onClick={handleClose}
            showWhiteCross={false}
          />
        </div>
      )
    }
  }

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
              drag="x"
              dragConstraints={{ left: 0, right: 100 }} // limit drag range
              onDragEnd={(event, info) => {
                if (info.offset.x > 100) {
                  handleClose(); // close only if dragged right enough
                }
              }}
              className="flex"
              style={{
                width: "300px",
                touchAction: "pan-y", // allow horizontal pan
              }}
            >
              <div
                className="flex flex-col items-end justify-end w-full gap-3"
                style={{ flex: 1, }}>
                {renderViews()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Icon Button (bottom-left) */}
      <AnimatePresence>
        {showIcon && !showAskSkyModal && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.4 }}
            // className="shadow-lg flex flex-row items-center gap-2"
            style={{
              position: "fixed",
              bottom: 30,
              right: 10,
              zIndex: 999,

              border: "none",

              fontSize: "16px",
              cursor: "pointer",

              outline: "none",
            }}
          >
            <GetHelpBtn handleReopen={handleReopen} />

          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        open={false}
        onClose={() => {
          setShowVapiChatWidget(false);
        }}
        hideBackdrop
      >
        <VapiChatWidget
          setShowVapiChatWidget={setShowVapiChatWidget}
        />

      </Modal>

      <UpgradeModal
        title={"Unlock Live Support Webinar"}
        subTitle={"Upgrade to join live support webinars and get pro tips from our team"}
        buttonTitle={"No Thanks. Continue on free plan"}
        open={openUpgradePlan}
        handleClose={handleCloseUpgrade}
      />



      <Modal
        open={false}
        onClose={() => {
          setShowAskSkyModal(false);
          setShouldStartCall(false);
        }}
        hideBackdrop
        sx={{ pointerEvents: "none", backgroundColor: "transparent" }} // allows VapiWidget to handle its own clicks
      >
        <div style={{ pointerEvents: "auto", backgroundColor: "transparent", height: "100%", width: "100%" }}>
          <SupportWidget
            isEmbed={false}
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


export const GetHelpBtn = ({
  text = "Get Help",
  avatar = null,
  handleReopen
}) => {
  return (
    <button className="flex flex-row bg-white items-center pe-4 ps-4 py-2 rounded-full shadow-md relative overflow-hidden"
      onClick={handleReopen}
    >
      {/* Stars */}
      <Image
        src="/otherAssets/getHelpStars.png"
        height={20}
        width={20}
        alt="Stars"
        className="absolute top-0 left-12 z-10 bg-transparent"
      />

      {/* Orb */}
      <div className="relative z-0 bg-white shadow-lg rounded-full w-[46px] h-[46px] overflow-hidden flex-shrink-0">
        <Image
          src={avatar || "/agentXOrb.gif"}
          fill
          alt="Orb"
          className="object-cover"
        />
      </div>

      {/* Text */}
      <p className="text-[16px] font-bold text-purple cursor-pointer ms-2">
        {text}
      </p>
    </button>
  )
}

