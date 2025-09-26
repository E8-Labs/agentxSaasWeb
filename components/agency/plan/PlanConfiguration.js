import { Modal, Box, Switch, CircularProgress, Tooltip } from "@mui/material";
import { useRef, useState } from "react";
import { AuthToken } from "./AuthDetails";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import AgentSelectSnackMessage, {
    SnackbarTypes,
} from "@/components/dashboard/leads/AgentSelectSnackMessage";
import { useEffect } from "react";
import Image from "next/image";
import { formatDecimalValue, handlePricePerMinInputValue } from "../agencyServices/CheckAgencyData";
import SubDuration, { LanguagesSelection } from "./SubDuration";
import SideUI from "./SideUI";
import PlanFeatures from "./PlanFeatures";
import ConfigureSideUI from "./ConfigureSideUI";
import AgencyPlans from "@/components/plan/AgencyPlans";
import getProfileDetails from "@/components/apis/GetProfile";
import CloseBtn from "@/components/globalExtras/CloseBtn";

// import { AiOutlineInfoCircle } from 'react-icons/ai';

export default function PlanConfiguration({
    handleClose,
    onPlanCreated,
    canAddPlan,
    agencyPlanCost,
    isEditPlan,
    selectedPlan,
    selectedAgency,
    handleContinue,
    //new props
    open,
    handleBack,
    basicsData,
    configurationData,
    setConfigurationData
}) {

    //auto scroll to bottom
    const scrollContainerRef = useRef(null);


    //bannar and loaders
    const [showTrailWarning, setShowTrailWarning] = useState(false);
    const [createPlanLoader, setCreatePlanLoader] = useState(false);
    const [snackMsg, setSnackMsg] = useState(null);
    const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Error);
    const [snackBannerMsg, setSnackBannerMsg] = useState(null);
    const [snackBannerMsgType, setSnackBannerMsgType] = useState(SnackbarTypes.Error);


    //new variables
    const [noOfAgents, setNoOfAgents] = useState("");
    const [costPerAdditionalAgent, setCostPerAdditionalAgent] = useState("");
    const [noOfContacts, setNoOfContacts] = useState("");
    const [noOfSeats, setNoOfSeats] = useState("");
    const [costPerAdditionalSeat, setCostPerAdditionalSeat] = useState("");
    const [language, setLanguage] = useState("");
    const [languageTitle, setLanguageTitle] = useState("");
    const [trialValidForDays, setTrialValidForDays] = useState("");
    //upgrade Plan popup variable
    const [showUpgradePlanPopup, setShowUpgradePlanPopup] = useState(false);
    //custom features
    const [customFeatures, setCustomFeatures] = useState([]);
    const [allowedFeatures, setAllowedFeatures] = useState([]);

    const [features, setFeatures] = useState({
        toolsActions: false,
        calendars: false,
        liveTransfer: false,
        ragKnowledgeBase: false,
        embedBrowserWebhookAgent: false,
        apiKey: false,
        voicemail: false,
        twilio: false,
        allowTrial: false,
        allowTeamSeats: false,
    });
    const [agencyAllowedFeatures, setAgencyAllowedFeatures] = useState({
        toolsActions: false,
        calendars: false,
        liveTransfer: false,
        ragKnowledgeBase: false,
        embedBrowserWebhookAgent: false,
        apiKey: false,
        voicemail: false,
        twilio: false,
        allowTrial: true,
        allowTeamSeats: false,
    });

    //features list
    const featuresList = [
        {
            label: "Tools & Actions",
            tooltip: "Bring your AI to work in apps like hubspot, slack, apollo and 10k+ options.",// "Maximize revenue by selling seats per month to any org.",
            stateKey: "toolsActions",
        },
        {
            label: "Calendars",
            tooltip: "Sync calendars for bookings and scheduling.",
            stateKey: "calendars",
        },
        {
            label: "Live Transfer",
            tooltip: " Allow agents to make live transfers.", //"Enable live call transfers between agents.",
            stateKey: "liveTransfer",
        },
        {
            label: "RAG Knowledge Base",
            tooltip: "Allow users to train agents on their own custom data. Add Youtube videos, website links, documents and more.", //"Use knowledge base for better responses.",
            stateKey: "ragKnowledgeBase",
        },
        {
            label: "Embed / Browser / Webhook Agent",
            tooltip: "Allow AI agent on websites to engage with leads and customers.", //"Embed the agent into sites, browsers, or trigger webhooks.",
            stateKey: "embedBrowserWebhookAgent",
        },
        {
            label: "API Key",
            tooltip: "",//Enable API access for integrations.
            stateKey: "apiKey",
        },
        {
            label: "Voicemail",
            tooltip: "Allow agents to leave voicemails",//Enable voicemail recording.
            stateKey: "voicemail",
        },
        {
            label: "Twilio",
            tooltip: "Import your Twilio phone numbers and access all Trust Hub features to increase answer rate.", //"Integrate with Twilio for calls & SMS.",
            stateKey: "twilio",
        },
        {
            label: "Allow Team Seats",
            tooltip: "Allow sub accounts to add and invite teams.",
            stateKey: "allowTeamSeats",
        },
        {
            label: "Allow Trial",
            tooltip: "",//Allow trial access for users.
            stateKey: "allowTrial",
        },
    ];

    //check for seats features
    useEffect(() => {
        if (costPerAdditionalSeat?.length > 0 && costPerAdditionalSeat > 0) {
            setFeatures({
                ...features,
                allowTeamSeats: true
            })
        }
    }, [costPerAdditionalSeat]);

    useEffect(() => {

        console.log("features are", features)
        console.log("Custom features are", customFeatures)

        if (!features.allowTeamSeats) {
            setNoOfSeats("");
            setCostPerAdditionalSeat("");
        }

        // const coreFeatures = featuresList
        //     .filter(item => features[item.stateKey])
        //     .map(item => ({
        //         id: item.stateKey,      // stable id
        //         text: item.label,
        //     }));

        const coreFeatures = featuresList
            .filter(item => item.stateKey !== "allowTrial") // exclude Allow Trial
            .filter(item => features[item.stateKey])
            .map(item => ({
                id: item.stateKey,
                text: item.label,
            }));


        const extraFeatures = [];

        if (noOfAgents) {
            extraFeatures.push({
                id: "agents",
                text: `${noOfAgents} AI Agent${noOfAgents > 1 ? "s" : ""}`,
            });
        }

        if (noOfContacts) {
            extraFeatures.push({
                id: "contacts",
                text: `${noOfContacts} Contact${noOfContacts > 1 ? "s" : ""}`,
            });
        }

        if (language) {
            extraFeatures.push({
                id: "language",
                text: `${languageTitle}`,
            });
        }

        // Add custom features to the allowed features
        const customFeaturesList = customFeatures
            .filter(feature => feature.trim() !== "") // Filter out empty features
            .map((feature, index) => ({
                id: `custom_${index}`,
                text: feature,
            }));

        setAllowedFeatures([...extraFeatures, ...coreFeatures, ...customFeaturesList]);
    }, [features, language, noOfAgents, noOfContacts, customFeatures]);



    //auto remove show trial warning
    useEffect(() => {
        if (showTrailWarning) {
            const timer = setTimeout(() => {
                setShowTrailWarning(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [showTrailWarning]);

    // scroll when new custom feature is added
    useEffect(() => {
        if (customFeatures.length > 0) {
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({
                        top: scrollContainerRef.current.scrollHeight,
                        behavior: "smooth",
                    });
                }
            }, 100); // small delay ensures input is rendered
        }
    }, [customFeatures]);

    //set the values of selected plan to edit plan
    // useEffect(() => {
    //     if (selectedPlan) {
    //         console.log("Selected plan data passed is", selectedPlan);
    //         const dynamicFeatures = selectedPlan?.dynamicFeatures;
    //         setNoOfAgents(dynamicFeatures?.maxAgents);
    //         setNoOfContacts(dynamicFeatures?.maxLeads);
    //         setFeatures({
    //             toolsActions: dynamicFeatures?.allowToolsAndActions || false,
    //             calendars: dynamicFeatures?.allowCalendars || false,
    //             liveTransfer: dynamicFeatures?.allowLiveTransfer || false,
    //             ragKnowledgeBase: dynamicFeatures?.allowRAGKnowledgeBase || false,
    //             embedBrowserWebhookAgent: dynamicFeatures?.allowEmbedBrowserWebhookAgent || false,
    //             apiKey: dynamicFeatures?.allowAPIKey || false,
    //             voicemail: dynamicFeatures?.allowVoicemail || false,
    //             twilio: dynamicFeatures?.allowTwilio || false,
    //             allowTrial: dynamicFeatures?.allowTrial || false,
    //         });
    //         setTrialValidForDays(selectedPlan?.trialValidForDays);
    //     }
    // }, [selectedPlan])

    //set the values of configuration data


    useEffect(() => {
        fetchAgencyAllowedFeatures();
        if (configurationData) {
            // console.log("Selected configurationData data passed is", configurationData);
            const dynamicFeatures = configurationData?.features;
            console.log("dynamic features are", dynamicFeatures)
            setNoOfAgents(configurationData?.maxAgents);
            setNoOfContacts(configurationData?.maxLeads);
            setCostPerAdditionalAgent(configurationData?.costPerAdditionalAgent);
            setCostPerAdditionalSeat(configurationData?.costPerAdditionalSeat);
            setFeatures({
                toolsActions: dynamicFeatures?.toolsActions || dynamicFeatures?.allowToolsAndActions || false,
                calendars: dynamicFeatures?.calendars || dynamicFeatures?.allowCalendars || false,
                liveTransfer: dynamicFeatures?.liveTransfer || dynamicFeatures?.allowLiveTransfer || false,
                ragKnowledgeBase: dynamicFeatures?.ragKnowledgeBase || dynamicFeatures?.allowRAGKnowledgeBase || false,
                embedBrowserWebhookAgent: dynamicFeatures?.embedBrowserWebhookAgent || dynamicFeatures?.allowEmbedBrowserWebhookAgent || false,
                apiKey: dynamicFeatures?.apiKey || dynamicFeatures?.allowAPIKey || false,
                voicemail: dynamicFeatures?.voicemail || dynamicFeatures?.allowVoicemail || false,
                twilio: dynamicFeatures?.twilio || dynamicFeatures?.allowTwilio || false,
                allowTrial: dynamicFeatures?.allowTrial || dynamicFeatures?.allowTrial || false,
            });
            setTrialValidForDays(configurationData?.trialValidForDays);
        }
    }, [configurationData])

    //reset values after plan added
    const handleResetValues = () => {
        setNoOfAgents("");
        setNoOfContacts("");
        setCostPerAdditionalAgent("");
        setCostPerAdditionalSeat("");
        setLanguage("");
        setLanguageTitle("");
        setTrialValidForDays("");
        setFeatures({
            toolsActions: false,
            calendars: false,
            liveTransfer: false,
            ragKnowledgeBase: false,
            embedBrowserWebhookAgent: false,
            apiKey: false,
            voicemail: false,
            twilio: false,
            allowTrial: false,
            allowTeamSeats: false,
        });
        setCustomFeatures([]);
        setAllowedFeatures([]);
        setShowUpgradePlanPopup(false);
        setShowTrailWarning(false);
        setCreatePlanLoader(false);
    }

    //function giving api data
    const apiFormData = () => {
        const formData = new FormData();
        formData.append("title", basicsData?.title);
        formData.append("planDescription", basicsData?.planDescription);
        formData.append("originalPrice", basicsData?.originalPrice);//replaced
        formData.append("pricePerCredit", basicsData?.discountedPrice);
        if (selectedAgency) {
            formData.append("userId", selectedAgency.id);
        }
        if (basicsData?.originalPrice > 0) {
            const disCountPercentag = ((basicsData?.originalPrice - (basicsData?.discountedPrice * basicsData?.minutes)) / basicsData?.originalPrice * //replaced
                100).toFixed(2);
            formData.append("percentageDiscount", disCountPercentag);
        } else {
            formData.append(
                "percentageDiscount",
                0
            );
        }
        // formData.append("hasTrial", allowTrial);
        formData.append("isDefault", basicsData?.isDefault);
        // formData.append("trialValidForDays", trialValidForDays);
        // formData.append("trialMinutes", "23");
        formData.append("tag", basicsData?.tag);
        formData.append("subscriptionDuration", basicsData?.planDuration);
        formData.append("credits", basicsData?.minutes);

        formData.append("numberOfAgents", noOfAgents);
        formData.append("numberOfContacts", noOfContacts);
        formData.append("language", language);
        formData.append("teamSeatCount", noOfSeats);
        formData.append("costPerAdditionalAgent", costPerAdditionalAgent);
        formData.append("costPerAdditionalTeamSeat", costPerAdditionalSeat);
        if (features.allowTrial) {
            formData.append("durationOfTrial", trialValidForDays);
        }
        formData.append("allowToolsAndActions", features.toolsActions);
        formData.append("allowCalendars", features.calendars);
        formData.append("allowLiveTransfer", features.liveTransfer);
        formData.append("allowRAGKnowledgeBase", features.ragKnowledgeBase);
        formData.append("allowEmbedBrowserWebhookAgent", features.embedBrowserWebhookAgent);
        formData.append("allowAPIKey", features.apiKey);
        formData.append("allowVoicemail", features.voicemail);
        formData.append("allowTwilio", features.twilio);
        formData.append("allowTrial", features.allowTrial);

        return formData;
    }

    //code to create plan
    const handleCreatePlan = async () => {
        try {
            setCreatePlanLoader(true);

            console.log("Working");

            const Token = AuthToken();
            const ApiPath = Apis.addMonthlyPlan;
            console.log("Api path is", ApiPath);

            const formData = apiFormData();

            for (let [key, value] of formData.entries()) {
                console.log(`${key} = ${value}`);
            }
            // return

            const response = await axios.post(ApiPath, formData, {
                headers: {
                    Authorization: "Bearer " + Token,
                },
            });

            if (response) {
                console.log("Response of Add plan is", response.data);
                setCreatePlanLoader(false);
                onPlanCreated(response);
                if (response.data.status === true) {
                    //update the monthlyplans state on localstorage to update checklist
                    const localData = localStorage.getItem("User");
                    if (localData) {
                        let D = JSON.parse(localData);
                        D.user.checkList.checkList.plansAdded = true;
                        localStorage.setItem("User", JSON.stringify(D));
                    }
                    window.dispatchEvent(new CustomEvent("UpdateAgencyCheckList", { detail: { update: true } }));

                    setSnackMsg(response.data.message);
                    setSnackMsgType(SnackbarTypes.Success);
                    handleResetValues();
                    handleClose(response.data.message);
                } else if (response.data.status === false) {
                    setSnackMsg(response.data.message);
                    setSnackMsgType(SnackbarTypes.Error);
                }
            }
        } catch (error) {
            console.error("Error occured is", error);
            setCreatePlanLoader(false);
        }
    };

    const handleUpdatePlan = async () => {
        try {
            setCreatePlanLoader(true);

            console.log("Working");

            const Token = AuthToken();
            // console.log("Selected plans passed is", planPassed);
            // const ApiPath = Apis.updateAgencyPlan;

            const url = `${Apis.updateAgencyPlan}/${selectedPlan.id}`;
            // const method = "put";

            console.log("Api path is", url);
            const formData = apiFormData();

            for (let [key, value] of formData.entries()) {
                console.log(`${key} = ${value}`);
            }
            // return

            const response = await axios.put(url, formData, {
                headers: {
                    Authorization: "Bearer " + Token,
                },
            });
            // const response = await axios({
            //   url,
            //   method,
            //   data: formData,
            //   headers: { Authorization: `Bearer ${Token}` },
            //   // ...extra, // uncomment if using query param style
            // });

            if (response) {
                console.log("Response of Add plan is", response.data);
                setCreatePlanLoader(false);
                onPlanCreated(response);
                if (response.data.status === true) {
                    //update the monthlyplans state on localstorage to update checklist
                    const localData = localStorage.getItem("User");
                    if (localData) {
                        let D = JSON.parse(localData);
                        D.user.checkList.checkList.plansAdded = true;
                        localStorage.setItem("User", JSON.stringify(D));
                    }
                    window.dispatchEvent(new CustomEvent("UpdateAgencyCheckList", { detail: { update: true } }));

                    setSnackMsg(response.data.message);
                    setSnackMsgType(SnackbarTypes.Success);
                    handleResetValues();
                    handleClose(response.data.message);
                } else if (response.data.status === false) {
                    setSnackMsg(response.data.message);
                    setSnackMsgType(SnackbarTypes.Error);
                }
            }
        } catch (error) {
            console.error("Error occured is", error);
            setCreatePlanLoader(false);
        }
    };


    // Keep only up to 2 fractional digits; always render as "0.xx"


    const formatFractional2 = (raw) => {
        const s = raw ?? "";
        // If there's already a dot, take only what's after the first dot.
        const afterDot = s.includes(".") ? s.split(".")[1] : s;
        const digits = afterDot.replace(/\D/g, "").slice(0, 2);
        return digits ? `0.${digits}` : "";
    };

    const isFormValid = () => {
        const agentsStr = noOfAgents?.toString().trim();
        const contactsStr = noOfContacts?.toString().trim();

        const requiredFieldsFilled = agentsStr && contactsStr && language;
        const trialValid = features.allowTrial ? trialValidForDays : true;

        return requiredFieldsFilled && trialValid;
    };


    //add custom features
    const handleAddCustomFeature = () => {
        setCustomFeatures((prev) => [...prev, ""]); // add empty field
    };

    //handle custom field change
    const handleChangeCustomFeature = (index, value, e) => {
        setCustomFeatures((prev) =>
            prev.map((f, i) => (i === index ? value : f))
        );
    };

    //remove custom field
    const handleRemoveCustomFeature = (index) => {
        console.log("Index passed to remove the custom field", index)
        setCustomFeatures((prev) => prev.filter((_, i) => i !== index));
    };

    //handle back function click with storing the current data
    const handleBackClick = () => {
        setConfigurationData({
            maxAgents: noOfAgents,
            maxLeads: noOfAgents,
            costPerAdditionalAgent: costPerAdditionalAgent,
            costPerAdditionalSeat: costPerAdditionalSeat,
            language: language,
            features: features,
            trialValidForDays: trialValidForDays
        });
        handleBack();
    }

    //fetch agencyallwoed features
    const fetchAgencyAllowedFeatures = () => {
        const localData = localStorage.getItem("User");
        if (localData) {
            const LD = JSON.parse(localData);
            const dynamicFeatures = LD?.user?.planCapabilities;
            setAgencyAllowedFeatures({
                toolsActions: dynamicFeatures?.allowToolsAndActions,
                calendars: dynamicFeatures?.allowCalendarIntegration,
                liveTransfer: dynamicFeatures?.allowLiveCallTransfer,
                ragKnowledgeBase: dynamicFeatures?.allowKnowledgeBases,
                embedBrowserWebhookAgent: dynamicFeatures?.allowEmbedAndWebAgents,
                apiKey: dynamicFeatures?.allowAPIAccess,
                voicemail: dynamicFeatures?.allowVoicemail,
                twilio: dynamicFeatures?.allowTwilioIntegration,
                allowTeamSeats: dynamicFeatures?.allowTeamCollaboration,
                allowTrial: false,
            });
        }
    }

    //open upgrade plan popup
    const handleUpgradePlanModalClick = () => {
        setShowUpgradePlanPopup(true);
    }

    //code for close modal
    const handleCloseModal = async (d) => {
        if (d) {
            await getProfileDetails();
            setShowUpgradePlanPopup(false);
            fetchAgencyAllowedFeatures()
        } else {
            setShowUpgradePlanPopup(false);
        }
    }
    //switch btns for plan features
    const handleToggle = (key) => {
        setFeatures((prev) => {
            const newState = { ...prev, [key]: !prev[key] };

            // if allowTeamSeats just got enabled, scroll down
            if (key === "allowTeamSeats" || key === "allowTrial" && !prev.allowTeamSeats && newState.allowTeamSeats) {
                setTimeout(() => {
                    if (scrollContainerRef.current) {
                        scrollContainerRef.current.scrollBy({ top: 40, behavior: "smooth" });
                    }
                }, 100);
            }

            return newState;
        });
    };

    return (
        <Modal
            open={open}
        // onClose={() => {
        //   handleResetValues();
        //   handleClose("");
        // }}
        >
            {/*<Box className="bg-white rounded-xl p-6 max-w-md w-[95%] mx-auto mt-20 shadow-lg">*/}
            <Box className="bg-white rounded-xl max-w-[80%] w-[95%] h-[90vh] border-none outline-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <AgentSelectSnackMessage
                    isVisible={snackMsg !== null}
                    message={snackMsg}
                    hide={() => {
                        setSnackMsg(null);
                    }}
                    type={snackMsgType}
                />
                <AgentSelectSnackMessage
                    isVisible={snackBannerMsg !== null}
                    message={snackBannerMsg}
                    hide={() => {
                        // setSnackMsg(null);
                    }}
                    type={snackBannerMsgType}
                />
                <div className="w-full flex flex-row h-[100%] items-start">
                    {showTrailWarning && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-10">
                            <Image
                                className="rounded-md"
                                src={"/agencyIcons/trialPlans.jpg"}
                                height={40}
                                width={356}
                                alt="*"
                            />
                        </div>
                    )}
                    <div className="w-6/12 h-[100%] p-6">
                        <div
                            ref={scrollContainerRef}
                            className="overflow-y-auto w-full h-[80%] scrollbar-hide"
                            style={{
                                scrollbarWidth: "none",
                                msOverflowStyle: "none",
                            }}
                        >
                            <div className="mb-4" style={{ fontWeight: "600", fontSize: 18 }}>
                                {isEditPlan ? "Edit Plan > Configure" : "New Plan > Configure"}
                            </div>

                            <div className="w-full flex flex-row items-center justify-center gap-2">
                                {/* Plan Name */}
                                <div className="w-1/2">
                                    <label style={styles.labels}>Number of Agents</label>
                                    <input
                                        style={styles.inputs}
                                        className="w-full border border-gray-200 rounded p-2 mb-4 mt-1 outline-none focus:outline-none focus:ring-0 focus:border-gray-200"
                                        placeholder="0"
                                        value={noOfAgents}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Allow only digits and one optional period
                                            const sanitized = value.replace(/[^0-9.]/g, '');

                                            // Prevent multiple periods
                                            const valid = sanitized.split('.')?.length > 2
                                                ? sanitized.substring(0, sanitized.lastIndexOf('.'))
                                                : sanitized;
                                            // setOriginalPrice(valid);
                                            setNoOfAgents(valid ? Number(valid) : 0);
                                        }}
                                    />
                                </div>

                                {/* Tag Option */}
                                <div className="w-1/2">
                                    <label style={styles.labels}>Price Additional Agents</label>
                                    <div className="border border-gray-200 rounded px-2 py-0 mb-4 mt-1 flex flex-row items-center w-full">
                                        <div className="" style={styles.inputs}>
                                            $
                                        </div>
                                        <input
                                            style={styles.inputs}
                                            type="text"
                                            className={`w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none`}
                                            placeholder="00"
                                            value={costPerAdditionalAgent}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Allow only digits and one optional period
                                                const sanitized = value.replace(/[^0-9.]/g, '');

                                                // Prevent multiple periods
                                                const valid = sanitized.split('.')?.length > 2
                                                    ? sanitized.substring(0, sanitized.lastIndexOf('.'))
                                                    : sanitized;
                                                // setOriginalPrice(valid);
                                                setCostPerAdditionalAgent(valid ? Number(valid) : 0);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/*
                                <div className="w-full flex flex-row items-center justify-center gap-2">
                                    <div className="w-1/2">
                                        <label style={styles.labels}>Number of Seats</label>
                                        <input
                                            style={styles.inputs}
                                            className="w-full border border-gray-200 rounded p-2 mb-4 mt-1 outline-none focus:outline-none focus:ring-0 focus:border-gray-200"
                                            placeholder="0"
                                            value={noOfSeats}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Allow only digits and one optional period
                                                const sanitized = value.replace(/[^0-9.]/g, '');
    
                                                // Prevent multiple periods
                                                const valid = sanitized.split('.')?.length > 2
                                                    ? sanitized.substring(0, sanitized.lastIndexOf('.'))
                                                    : sanitized;
                                                // setOriginalPrice(valid);
                                                setNoOfSeats(valid ? Number(valid) : 0);
                                            }}
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <label style={styles.labels}>Price Additional Seats</label>
                                        <div className="border border-gray-200 rounded px-2 py-0 mb-4 mt-1 flex flex-row items-center w-full">
                                            <div className="" style={styles.inputs}>
                                                $
                                            </div>
                                            <input
                                                style={styles.inputs}
                                                type="text"
                                                className={`w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none`}
                                                placeholder="00"
                                                value={costPerAdditionalSeat}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    // Allow only digits and one optional period
                                                    const sanitized = value.replace(/[^0-9.]/g, '');
    
                                                    // Prevent multiple periods
                                                    const valid = sanitized.split('.')?.length > 2
                                                        ? sanitized.substring(0, sanitized.lastIndexOf('.'))
                                                        : sanitized;
                                                    // setOriginalPrice(valid);
                                                    setCostPerAdditionalSeat(valid ? Number(valid) : 0);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            */}
                            <div className="w-full">
                                <label style={styles.labels}>Number of Contacts</label>
                                <input
                                    style={styles.inputs}
                                    className="w-full border border-gray-200 outline-none focus:outline-none focus:ring-0 focus:border-gray-200 rounded p-2 mb-4 mt-1"
                                    placeholder="0"
                                    value={noOfContacts}
                                    onChange={(e) => {
                                        setNoOfContacts(e.target.value);
                                    }}
                                />
                            </div>
                            <LanguagesSelection
                                language={language}
                                languageTitle={languageTitle}
                                setLanguage={setLanguage}
                                setLanguageTitle={setLanguageTitle}
                                selectedLanguage={selectedPlan?.dynamicFeatures?.allowLanguageSelection}
                            />


                            <PlanFeatures
                                featuresList={featuresList}
                                features={features}
                                agencyAllowedFeatures={agencyAllowedFeatures}
                                setFeatures={setFeatures}
                                customFeatures={customFeatures}
                                handleChangeCustomFeature={handleChangeCustomFeature}
                                handleRemoveCustomFeature={handleRemoveCustomFeature}
                                trialValidForDays={trialValidForDays}
                                setTrialValidForDays={setTrialValidForDays}
                                upgradePlanClickModal={handleUpgradePlanModalClick}
                                noOfSeats={noOfSeats}
                                setNoOfSeats={setNoOfSeats}
                                costPerAdditionalSeat={costPerAdditionalSeat}
                                setCostPerAdditionalSeat={setCostPerAdditionalSeat}
                                handleToggle={handleToggle}
                            />

                        </div>
                        {/* Action Buttons */}
                        <div className="w-full pt-1">
                            <div className="w-full flex flex-row items-center justify-between pt-2" style={{ borderTop: "2px solid #15151510", }}>
                                <div styles={{ fontSize: "15px", fontWeight: "700" }}>Custom Features</div>
                                <button
                                    styles={{ fontSize: "15px", fontWeight: "700" }}
                                    className="underline text-purple outline-none border-none"
                                    onClick={() => { handleAddCustomFeature() }}
                                >
                                    + Add
                                </button>
                            </div>
                            <div className="flex justify-between mt-10">
                                <button
                                    disabled={createPlanLoader}
                                    onClick={() => {
                                        handleBackClick();
                                    }}
                                    className="text-purple-600 font-semibold border rounded-lg w-[12vw]"
                                >
                                    Back
                                </button>
                                {createPlanLoader ? (
                                    <CircularProgress size={30} />
                                ) : (
                                    <button
                                        className={` ${isFormValid() ? "bg-purple" : "bg-[#00000020]"} w-[12vw] ${isFormValid() ? "text-white" : "text-black"} font-semibold py-2 px-4 rounded-lg`}
                                        onClick={() => {
                                            if (isEditPlan) {
                                                handleUpdatePlan();
                                            } else {
                                                handleCreatePlan();
                                            }
                                        }}
                                        disabled={!isFormValid()}
                                    >
                                        {isEditPlan ? "Update" : "Create Plan"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div
                        className="w-6/12 h-full rounded-tr-xl rounded-br-xl"
                    >
                        <ConfigureSideUI
                            handleClose={handleClose}
                            handleResetValues={handleResetValues}
                            allowedFeatures={allowedFeatures}
                            noOfAgents={noOfAgents}
                            noOfContacts={noOfAgents}
                            basicsData={basicsData}
                            features={features}
                            allowTrial={features.allowTrial}
                            trialValidForDays={trialValidForDays}
                        />
                    </div>

                    {/*Upgrade agency plan*/}
                    <Modal
                        open={showUpgradePlanPopup}
                        onClose={() => {
                            setShowUpgradePlanPopup(false);
                        }}
                    >
                        <Box className="bg-white rounded-xl max-w-[80%] w-[95%] h-[90vh] border-none outline-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="w-full flex flex-row items-center justify-end px-4 pt-4 h-[5%]">
                                <CloseBtn
                                    onClick={() => {
                                        setShowUpgradePlanPopup(false);
                                    }}
                                />
                            </div>
                            <div className="w-full h-[95%]">
                                <AgencyPlans
                                    isFrom={"addPlan"}
                                    handleCloseModal={(d) => {
                                        handleCloseModal(d)
                                    }}
                                />
                            </div>
                        </Box>
                    </Modal>

                </div>
            </Box>
        </Modal>
    );
}

const styles = {
    labels: {
        fontSize: "15px",
        fontWeight: "500",
        color: "#00000050",
    },
    inputs: {
        fontSize: "15px",
        fontWeight: "500",
        color: "#000000",
    },
    text: {
        fontSize: "15px",
        fontWeight: "500",
    },
    text2: {
        textAlignLast: "left",
        fontSize: 15,
        color: "#000000",
        fontWeight: 500,
        whiteSpace: "nowrap", // Prevent text from wrapping
        overflow: "hidden", // Hide overflow text
        textOverflow: "ellipsis", // Add ellipsis for overflow text
    },
    headingStyle: {
        fontSize: 16,
        fontWeight: "700",
    },
    gitTextStyle: {
        fontSize: 15,
        fontWeight: "700",
    },

    //style for plans
    cardStyles: {
        fontSize: "14",
        fontWeight: "500",
        border: "1px solid #00000020",
    },
    triangleLabel: {
        position: "absolute",
        top: "0",
        right: "0",
        width: "0",
        height: "0",
        borderTop: "50px solid #7902DF", // Increased height again for more padding
        borderLeft: "50px solid transparent",
    },
    labelText: {
        position: "absolute",
        top: "10px", // Adjusted to keep the text centered within the larger triangle
        right: "5px",
        color: "white",
        fontSize: "10px",
        fontWeight: "bold",
        transform: "rotate(45deg)",
    },
    content: {
        textAlign: "left",
        paddingTop: "10px",
    },
    originalPrice: {
        // textDecoration: "line-through",
        color: "#7902DF",
        fontSize: 18,
        fontWeight: "600",
    },
    discountedPrice: {
        color: "#000000",
        fontWeight: "700",
        fontSize: 22,
        // marginLeft: "10px",
    },
};

