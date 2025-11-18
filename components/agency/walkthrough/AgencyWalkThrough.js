import { Box, Modal, CircularProgress } from '@mui/material'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getStripeLink } from '@/components/onboarding/services/apisServices/ApiService'

const AgencyWalkThrough = ({ open, onClose }) => {
    const router = useRouter();
    const [checklist, setChecklist] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [loader, setLoader] = useState(false);
    const [videoLoading, setVideoLoading] = useState(false);
    const [playedVideos, setPlayedVideos] = useState(new Set());

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

    useEffect(() => {
        getChecklistData();
    }, []);

    const getChecklistData = () => {
        setChecklist([
            {
                id: 1,
                label: 'Platform Walkthrough',
                videoUrl: '/videos/Platformwalkthrough.mp4',
                route: null,
            },
            {
                id: 2,
                label: 'Connecting Stripe',
                videoUrl: '/videos/stripVideo.mp4',
                route: null,
            },
            {
                id: 3,
                label: 'Connecting Twilio',
                videoUrl: '/videos/twilioVideo.mp4',
                route: "/agency/dashboard/integration",
            },
            {
                id: 4,
                label: 'Join us on Skool',
                videoUrl: null,
                route: "https://www.skool.com/agentx",
            },
        ]);
    };


    const handleItemClick = (item, index) => {
        setCurrentStep(index);
    };

    const handleJoinCommunity = (skoolUrl) => {
        window.open(skoolUrl, "_blank");
        setPlayedVideos(prev => new Set([...prev, 4]));
    };

    const handleVideoPlay = () => {
        const currentItem = checklist[currentStep];
        if (currentItem && currentItem.id) {
            setPlayedVideos(prev => prev.add(currentItem.id));
        }
    };

    const handleNext = async () => {
        const currentItem = checklist[currentStep];

        if (currentItem.id === 1) {
            // Platform Walkthrough - move to next step
            if (currentStep < checklist.length - 1) {
                setCurrentStep(currentStep + 1);
            }
        } else if (currentItem.id === 2) {
            // Connecting Stripe - move to next step
            if (currentStep < checklist.length - 1) {
                setCurrentStep(currentStep + 1);
            }
        } else if (currentItem.id === 3) {
            // Connecting Twilio - move to next step (Skool)
            if (currentStep < checklist.length - 1) {
                setCurrentStep(currentStep + 1);
            }
        } else if (currentItem.id === 4) {
            // Join us on Skool - mark walkthrough as shown and close
            localStorage.setItem('agencyWalkthroughShown', 'true');
            onClose();
        }
    };

    const handleClose = () => {
        // Mark walkthrough as shown when user closes it
        localStorage.setItem('agencyWalkthroughShown', 'true');
        onClose();
    };

    const currentVideoUrl = checklist[currentStep]?.videoUrl;
    const skoolItem = checklist.find(item => item.id === 4);
    const isSkoolStep = checklist[currentStep]?.id === 4;

    return (
        <>
        {/* Main Walkthrough Modal */}
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            BackdropProps={{
                timeout: 100,
                sx: {
                    backgroundColor: "#00000040",
                    backdropFilter: "blur(10px)",
                },
            }}
        >
            <Box className="w-7/12" sx={modalStyles}>
                <div
                    className="sm:w-full w-full"
                    style={{
                        backgroundColor: "#ffffff",
                        padding: 24,
                        borderRadius: "13px",
                        maxHeight: "90vh",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Close Button */}
                    <div className="flex flex-row justify-between items-start mb-4">
                        <div className="flex flex-col gap-2">
                            {/* Title */}
                            <div
                                style={{ fontWeight: "700", fontSize: 22 }}
                            >
                                {"Lets get started in 3 quick steps!"}
                            </div>

                            {/* Description */}
                            <div
                                className="text-gray-600"
                                style={{ fontWeight: "400", fontSize: 16 }}
                            >
                                Watch these short video tutorials to properly setup your agency.{" "}
                                <span
                                    className="text-purple cursor-pointer hover:underline"
                                    onClick={()=>{
                                        const skoolIndex = checklist.findIndex(item => item.id === 4);
                                        if (skoolIndex !== -1) {
                                            setCurrentStep(skoolIndex);
                                        }
                                    }}
                                >
                                    Join us on Skool for more tutorials
                                </span>
                            </div>
                        </div>
                        <button onClick={handleClose} className="outline-none border-none">
                            <Image
                                src="/assets/crossIcon.png"
                                height={40}
                                width={40}
                                alt="Close"
                            />
                        </button>
                    </div>

                    {/* Two Column Layout */}
                    <div className="flex flex-row gap-6 flex-1 overflow-hidden">
                        {/* Left Column - Checklist */}
                        <div className="flex flex-col w-2/5 min-w-[300px]">

                            {/* Checklist */}
                            <div className="relative flex flex-col gap-6 flex-1 overflow-y-auto pr-4">
                                {/* Vertical connecting line */}
                                {checklist.length > 1 && (
                                    <div
                                        className="absolute left-2.5 top-6 h-[16vh] w-0.5 z-0"
                                        style={{ backgroundColor: '#7902DF' }}
                                    />
                                )}

                                {checklist.map((item, index) => {
                                    const isActive = currentStep === index;
                                    const isPlayed = playedVideos.has(item.id);

                                    return (
                                        <button
                                            key={item.id}
                                            className="relative flex flex-row items-center gap-4 outline-none border-none w-full group cursor-pointer"
                                            onClick={() => handleItemClick(item, index)}
                                        >
                                            {/* Circular icon container */}
                                            <div className="relative flex-shrink-0 border-3 z-10">
                                                {/* Checkmark or empty state */}
                                                <div className="rounded-full">
                                                    <Image src={isPlayed ? "/otherAssets/checked.png" : "/otherAssets/unChecked.jpg"} alt="Completed"
                                                        height={24} width={24}
                                                        className="object-contain"
                                                        
                                                        style={{
                                                            border: "5px solid #fff",
                                                            borderRadius: "50%",
                                                        }}
                                                        />
                                                </div>
                                            </div>

                                            {/* Label */}
                                            <div className="flex-1 text-left">
                                                <div
                                                    className={`font-regular text-[16px] ${isActive
                                                        ? 'text-purple'
                                                        : 'text-gray-700'
                                                        } transition-colors`}
                                                >
                                                    {item.label}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Next Button */}
                            { (
                                <button
                                    onClick={handleNext}
                                    disabled={loader}
                                    className="w-full bg-purple text-white rounded-lg py-3 px-4 font-semibold text-base mt-4 hover:bg-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loader ? (
                                        <>
                                            <CircularProgress size={20} style={{ color: 'white' }} />
                                            <span>Loading...</span>
                                        </>
                                    ) : (
                                        currentStep === checklist.length - 1 || currentStep === checklist.length - 1 ? "Done" : "Next"
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Right Column - Video Player or Skool UI */}
                        <div className="flex flex-col w-3/5 flex-1 min-h-0">
                            {isSkoolStep ? (
                                <div 
                                    className="w-full h-full flex items-center justify-center rounded-lg min-h-[300px]"
                                    style={{
                                        backgroundColor: "#F2F9FF",
                                        padding: 48,
                                        borderRadius: "16px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 24,
                                    }}
                                >
                                    {/* Skool Logo */}
                                    <div className="flex items-center justify-center">
                                        <Image
                                            src="/otherAssets/skool-logo.svg"
                                            alt="Skool"
                                            height={80}
                                            width={200}
                                            className="object-contain"
                                        />
                                    </div>

                                    {/* Join Community Button */}
                                    <button
                                        onClick={() => handleJoinCommunity(skoolItem?.route)}
                                        className="w-full bg-purple text-white rounded-lg py-4 px-6 font-semibold text-lg hover:bg-purple/90 transition-colors"
                                        style={{
                                            backgroundColor: '#7902DF',
                                            maxWidth: '400px',
                                        }}
                                    >
                                        Join Community
                                    </button>
                                </div>
                            ) : currentVideoUrl ? (
                                <div className="relative w-full h-[40vh] flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">

                                    <video
                                        key={currentVideoUrl}
                                        controls
                                        autoPlay
                                        muted={false}
                                        onLoadStart={() => setVideoLoading(true)}
                                        onLoadedData={() => setVideoLoading(false)}
                                        onPlay={handleVideoPlay}
                                        className="w-full h-[40vh]"
                                        style={{
                                            maxHeight: "70vh",
                                            borderRadius: 15,
                                        }}
                                    >
                                        <source src={currentVideoUrl} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg min-h-[400px]">
                                    <div className="text-center text-gray-500">
                                        <p className="text-lg font-semibold mb-2">No video available</p>
                                        <p className="text-sm">Select a step to view the tutorial</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Box>
        </Modal>
        </>
    );
};

export default AgencyWalkThrough;