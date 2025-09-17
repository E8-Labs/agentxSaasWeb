import SubAccountPlan from "@/components/agency/subaccount/SubAccountPlan.js";
import ErrorBoundary from "@/components/ErrorBoundary.js";
import BackgroundVideo from "@/components/general/BackgroundVideo.js";
import { PersistanceKeys } from "@/constants/Constants.js";
import { User } from "lucide-react";
import dynamic from "next/dynamic.js";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UnlockAgentModal from "@/constants/UnlockAgentModal";
import { useUser } from "@/hooks/redux-hooks";
import { usePlanCapabilities } from "@/hooks/use-plan-capabilities";


const CreateAgent1 = dynamic(() =>
    import("../createagent/CreateAgent1.js")
    // import("../")
);
const CreateAgent2 = dynamic(() =>
    import("../createagent/CreateAgent1.js")
);
const CreatAgent3 = dynamic(() =>
    import("../createagent/CreatAgent3.js")
);
const UserPlans = dynamic(() =>
    import("../userPlans/UserPlans.js")
);
const CreateAgent4 = dynamic(() =>
    import("../createagent/CreateAgent4.js")
);
const CreateAgentVoice = dynamic(() =>
    import("../createagent/CreateAgentVoice.js")
);

const BuildAgentName = dynamic(() =>
    import("../createagent/mobileCreateAgent/BuildAgentName.js")
);
const BuildAgentObjective = dynamic(() =>
    import(
        "../createagent/mobileCreateAgent/BuildAgentObjective.js"
    )
);
const BuildAgentTask = dynamic(() =>
    import("../createagent/mobileCreateAgent/BuildAgentTask.js")
);

function EmptyPage() {
    return <div></div>;
}

const TemFix = () => {
    // //console.log;

    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Redux hooks
    const { user: reduxUser, isAuthenticated } = useUser();
    const { 
        canCreateAgent, 
        isFreePlan, 
        currentAgents, 
        maxAgents, 
        getUpgradeMessage 
    } = usePlanCapabilities();

    const stepFromUrl = parseInt(searchParams.get("step") || "1", 10);
    const [index, setIndex] = useState(stepFromUrl);

    const [user, setUser] = useState(null);
    const [components, setComponents] = useState([
        EmptyPage,
        // CreateAgent1,
        // CreatAgent3,
        // CreateAgent4,
        // CreateAgentVoice,
    ]);

    const [windowSize, setWindowSize] = useState(null);
    const [subAccount, setSubaccount] = useState(null);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [modalDesc, setModalDesc] = useState(null);

    let CurrentComp = components[index - 1] || EmptyPage;
    useEffect(() => {
        const currentStep = searchParams.get("step");
        if (currentStep !== index.toString()) {
            router.replace(`?step=${index}`);
        }
    }, [index, router, searchParams]);

    // console.log("Rendering step:", index, components[index]);



    useEffect(() => {
        let size = null;
        if (typeof window !== "undefined") {
            size = window.innerWidth;
            setWindowSize(size);
        } else {
            // //console.log;
        }
        let user = localStorage.getItem(PersistanceKeys.LocalStorageUser);
        if (user) {
            let parsed = JSON.parse(user);
            setUser(parsed);
        }
        // //console.log;
    }, []);

    useEffect(() => {
        // //console.log;
        const localData = localStorage.getItem("User");

        if (localData) {
            const Data = JSON.parse(localData);
            // //console.log;
            // //console.log;

            let d = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency);
            let fromAdmin = ""
            if (d) {
                fromAdmin = JSON.parse(d);
            }
            console.log("data form admin is", fromAdmin)
            if (!fromAdmin) {
                // Use Redux user data instead of localStorage
                const userHasPlan = reduxUser?.plan;
                
                if (userHasPlan && canCreateAgent) {
                    if (windowSize < 640) {
                        //console.log;
                        setComponents([
                            BuildAgentName,
                            BuildAgentTask,
                            BuildAgentObjective,

                            // CreatAgent3,
                            // CreateAgent4,
                            // CreateAgentVoice,
                        ]);
                    } else {
                        setComponents([
                            CreateAgent1,
                            // CreatAgent3,
                            // UserPlans,
                            CreateAgent4,
                            CreateAgentVoice,
                        ]);
                        // setIndex(1)
                    }
                } else {
                    if (windowSize < 640) {
                        if (subAccount) {
                            setComponents([
                                BuildAgentName,
                                BuildAgentTask,
                                BuildAgentObjective,
                                SubAccountPlan,
                                // CreateAgent4,
                                // CreateAgentVoice,
                            ]);
                        } else {

                            setComponents([
                                BuildAgentName,
                                BuildAgentTask,
                                BuildAgentObjective,
                                UserPlans,
                                // CreateAgent4,
                                // CreateAgentVoice,
                            ]);
                        }
                        // setIndex(3)
                    } else {
                        if (subAccount) {
                            setComponents([
                                CreateAgent1,
                                SubAccountPlan,
                                CreateAgent4,
                                CreateAgentVoice,
                                // setIndex(3)
                            ]);
                        }
                        else {
                            setComponents([
                                CreateAgent1,
                                UserPlans,
                                CreateAgent4,
                                CreateAgentVoice,
                                // setIndex(3)
                            ]);
                        }
                    }
                }
            } else {
                setComponents([
                    CreateAgent1,
                    // CreatAgent3,
                    CreateAgent4,
                    CreateAgentVoice,
                ]);
                console.log('This is admin')
            }
        }

    }, [windowSize, reduxUser, canCreateAgent, subAccount]);


    useEffect(() => {
        checkIsFromOnboarding()
    }, [])

    // Check if user should see upgrade popup using Redux
    useEffect(() => {
        console.log('🎯 [TEMPFIX] Plan check triggered:', {
            hasReduxUser: !!reduxUser,
            canCreateAgent,
            isFreePlan,
            currentAgents,
            maxAgents,
            planType: reduxUser?.plan?.type
        });

        if (reduxUser && !canCreateAgent) {
            if (isFreePlan && currentAgents >= 1) {
                console.log('🚫 [TEMPFIX] Free plan limit reached - showing unlock modal');
                setModalDesc("The free plan only allows for 1 AI Agent.");
                setShowUnlockModal(true);
            } else if (currentAgents >= maxAgents) {
                console.log('🚫 [TEMPFIX] Plan limit reached - showing unlock modal');
                setModalDesc(getUpgradeMessage('agents'));
                setShowUnlockModal(true);
            }
        } else if (reduxUser && canCreateAgent) {
            console.log('✅ [TEMPFIX] User can create agents - no modal needed');
        }
    }, [reduxUser, canCreateAgent, isFreePlan, currentAgents, maxAgents, getUpgradeMessage]);

    const checkIsFromOnboarding = () => {
        let data = localStorage.getItem(PersistanceKeys.SubaccoutDetails)
        if (data) {
            let subAcc = JSON.parse(data)
            setSubaccount(subAcc)
        }
    }

    // Function to proceed to the next step
    const handleContinue = () => setIndex((prev) => prev + 1);
    const handleBack = () => setIndex((prev) => Math.max(prev - 1, 0));
    const handleSkipAddPayment = () => setIndex((prev) => prev + 2);


    //function to get the agent Details
    const [AgentDetails, setAgentDetails] = useState({
        name: "",
        agentRole: "",
        agentType: "",
    });

    const getAgentDetails = (agentName, agentRole, agentType) => {
        // //console.log;
        // console.log(
        //   `"Agent Name is": ${agentName} ----- "Agent Role is" ${agentRole} ------ "Agent Type is" ${agentType}`
        // );
        setAgentDetails({
            name: agentName,
            agentRole: agentRole,
            agentType: agentType,
        });
    };

    const backgroundImage = {
        // backgroundImage: 'url("/assets/background.png")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        width: "100%",
        height: "100svh",
        overflow: "hidden",
    };

    return (
        <ErrorBoundary>
            <div
                style={backgroundImage}
                className="overflow-y-none flex flex-row justify-center items-center"
            >
                {windowSize > 640 && (
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            zIndex: -1, // Ensure the video stays behind content
                        }}
                    >
                        <BackgroundVideo />
                    </div>
                )}
                <CurrentComp
                    handleContinue={handleContinue}
                    handleBack={handleBack}
                    handleSkipAddPayment={handleSkipAddPayment}
                    getAgentDetails={getAgentDetails}
                    AgentDetails={AgentDetails}
                    user={user}
                    screenWidth={windowSize}
                />
                
                {/* Upgrade Modal for Free Plan Users */}
                {/* {showUnlockModal && (
                    <UnlockAgentModal
                        open={showUnlockModal}
                        handleClose={() => {
                            setShowUnlockModal(false);
                            // Redirect back to dashboard when modal is closed
                            router.push('/dashboard/myAgentX');
                        }}
                        desc={modalDesc}
                    />
                )} */}
            </div>
        </ErrorBoundary>
    );
};

export default TemFix;
