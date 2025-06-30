import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { PersistanceKeys } from "@/constants/Constants";

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
                                maxWidth: "480px",
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
                                    <div className="w-full flex flex-row items-center gap-2">
                                        <button
                                            className="mt-4 p-2 border rounded-lg hover:bg-purple hover:text-white w-[170px] h-[39px] whitespace-nowrap"
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
                                            className="mt-4 p-2 border rounded-lg hover:bg-purple hover:text-white w-[170px] h-[39px] whitespace-nowrap"
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
                                            className="mt-4 p-2 border rounded-lg hover:bg-purple hover:text-white w-[170px] h-[39px] whitespace-nowrap"
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
                            padding: "6px 14px",
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
                                src={"/agencyIcons/questionMark.jpg"}
                                alt="*"
                                height={20}
                                width={20}
                                style={{ borderRadius: "50%" }}
                            />
                            <div style={{ fontWeight: "600", fontSize: 16 }}>Get Help</div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default DashboardSlider;
