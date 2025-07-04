import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { PersistanceKeys } from "@/constants/Constants";
// import { VapiWidget } from "../askSky/vapi-widget";

const DashboardSlider = ({
    onTop = false,
    needHelp = true,
    closeHelp,
    autoFocus = true
}) => {
    const [visible, setVisible] = useState(false);
    const [showIcon, setShowIcon] = useState(false);
    //stores local data
    const [userDetails, setUserDetails] = useState(null);
    const [hoverIndex, setHoverIndex] = useState(null);


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
    }, [])

    useEffect(() => {
        if (needHelp) {
            setVisible(true)
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
            const style = { position: "fixed", top: 50, right: 30, zIndex: 999 }
            return style;
        } else {
            const style = { position: "fixed", bottom: 30, right: 30, zIndex: 999 }
            return style;
        }
    }

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
            url: "",
        },
        {
            id: 4,
            label: "Give Feedback",
            image: "/otherAssets/feedBackIcon.png",
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

    const handleOnClick = () => {
        // if (item.id === 3) {
        //     <VapiWidget />
        // }
        if (typeof window !== "undefined") {
            window.open(item.url, "_blank");
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
                            className="bg-white shadow-lg text-black"
                            style={{
                                // backgroundColor: "#333",
                                // color: "#fff",
                                padding: "16px 24px",
                                borderRadius: "8px",
                                // boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                                // display: "flex",
                                // alignItems: "center",
                                // gap: "12px",
                                // minWidth: "400px",
                                maxWidth: "430px",
                            }}
                        >
                            <div
                                style={{ flex: 1 }}
                                className="w-full">
                                <div className="w-full">
                                    <div className="flex flex-row items-center justify-between">
                                        <div
                                            className="outline-none border-none flex flex-row items-center gap-2">
                                            <Image
                                                src={"/agencyIcons/questionMark.jpg"}
                                                alt="*"
                                                height={20}
                                                width={20}
                                                style={{ borderRadius: "50%" }}
                                            />
                                            <div style={{ fontWeight: "600", fontSize: 16 }}>Get Help</div>
                                        </div>
                                        <button
                                            className="border-none outline-none"
                                            onClick={handleClose}>
                                            <Image
                                                src={"/assets/cross.png"}
                                                alt="*"
                                                width={15}
                                                height={15}
                                            />
                                        </button>
                                    </div>
                                    <div
                                        className="mt-2"
                                        style={{ fontWeight: "600", fontSize: 16 }}>
                                        Need Help Setting Up Your AI Agent?
                                    </div>
                                    <div
                                        className="flex flex-row items-start gap-2 mt-4">
                                        <Image
                                            src={"/agencyIcons/suportPlaceholder.png"}
                                            alt="*"
                                            height={64}
                                            width={64}
                                        />
                                        <div
                                            style={{ fontWeight: "500", fontSize: 13 }}>
                                            {`If you're unsure where to start or want expert guidance, we're here to help. You can join our weekly support webinar to get answers to your questions—or let our team handle it and build out your AI for you.`}
                                        </div>
                                    </div>
                                    <div className="w-full flex flex-row items-center gap-4">
                                        <button
                                            className="mt-4 p-2 border rounded-lg hover:bg-purple hover:text-white w-[187px] h-[39px] whitespace-nowrap"
                                            style={{ fontSize: 15, fontWeight: "500" }}
                                            onClick={() => {
                                                if (typeof window !== "undefined") {
                                                    let url = PersistanceKeys.ResourceHubUrl;
                                                    //console.log
                                                    window.open(url, "_blank");
                                                }
                                            }}>
                                            Resource Hub
                                        </button>
                                        <button
                                            className="mt-4 p-2 border rounded-lg hover:bg-purple hover:text-white w-[187px] h-[39px] whitespace-nowrap"
                                            style={{ fontSize: 15, fontWeight: "500" }}
                                            onClick={() => {
                                                if (typeof window !== "undefined") {
                                                    let url = PersistanceKeys.SupportWebinarUrl;
                                                    //console.log
                                                    window.open(url, "_blank");
                                                }
                                            }}>
                                            Support Webinar
                                        </button>
                                        <button
                                            className="mt-4 p-2 border rounded-lg hover:bg-purple hover:text-white w-[187px] h-[39px] whitespace-nowrap"
                                            style={{ fontSize: 15, fontWeight: "500" }}
                                            onClick={() => {
                                                let url = PersistanceKeys.GlobalConsultationUrl;
                                                if (typeof window !== "undefined") {
                                                    window.open(url, "_blank");
                                                }
                                            }}>
                                            Hire AI Team
                                        </button>
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
                            backgroundColor: "#fff",
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
                            onClick={handleReopen}>
                            <Image
                                src={"/svgIcons/getHelpIcon.svg"}
                                alt="*"
                                height={20}
                                width={20}
                            // style={{ borderRadius: "50%" }}
                            />
                            <div style={{ fontWeight: "500", fontSize: 15 }}>Get Help</div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

        </div >
    );
};

export default DashboardSlider;
{/*<div
                                style={{ flex: 1 }}
                                className="w-full ">
                                <button style={{
                                    position: "absolute",
                                    top: 12,
                                    right: 12,

                                    border: "none",
                                    padding: 0,
                                    cursor: "pointer",
                                }}
                                    onClick={handleClose}
                                >
                                    <Image src={'/svgIcons/cross.svg'}
                                        width={24} height={24} alt="*"
                                    />
                                </button>
                                <div className="w-full mt-5">

                                    <div className="w-full flex flex-col items-center gap-4">
                                        {
                                            buttons.map((item, index) =>
                                                <button key={index}
                                                    onMouseEnter={() => setHoverIndex(index)}
                                                    onMouseLeave={() => setHoverIndex(null)}

                                                    className="w-full flex flex-row items-center gap-2"
                                                    onClick={() => {
                                                        handleOnClick(item)
                                                    }}>
                                                    <Image src={index === hoverIndex ? item.image2 : item.image}
                                                        width={24} height={24} alt="*"
                                                    />
                                                    <div className="text-black hover:text-purple" style={{
                                                        fontSize: 15, fontWeight: '500'
                                                    }}>
                                                        {item.label}
                                                    </div>
                                                </button>
                                            )
                                        }
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
                            </button>*/}