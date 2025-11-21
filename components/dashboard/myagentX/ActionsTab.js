import React, { useState, useMemo } from 'react'
import UserCalender from './UserCallender'
import LeadScoring from './leadScoring/LeadScoring'
import { useUser } from '@/hooks/redux-hooks';
import UpgardView from '@/constants/UpgardView';

const ActionsTab = ({
    calendarDetails,
    setUserDetails,
    selectedAgent,
    setSelectedAgent,
    mainAgentId,
    previousCalenders,
    updateVariableData,
    setShowUpgradeModal,
    activeTab,
    showDrawerSelectedAgent,
    setShowAddScoringModal,
    setShowDrawerSelectedAgent,
    setShowSnackMsg,
    selectedUser,
}) => {

    const { user: reduxUser } = useUser();

    const [selectedActionTab, setSelectedActionTab] = useState(1);

    // Check if user has access to Tools
    const hasToolsAccess = useMemo(() => {
        // Check agency capabilities first (for subaccounts)
        // If undefined/null/false, no access
        if (reduxUser?.agencyCapabilities?.allowToolsAndActions !== true) {
            return false;
        }
        // Check plan capabilities (for regular users)
        // If undefined/null/false, no access
        if (reduxUser?.planCapabilities?.allowToolsAndActions !== true) {
            return false;
        }
        return true;
    }, [reduxUser]);

    // Check if user has access to Lead Scoring
    const hasLeadScoringAccess = useMemo(() => {
        // Check agency capabilities first (for subaccounts)
        // If undefined/null/false, no access
        if (reduxUser?.agencyCapabilities?.allowLeadScoring !== true) {
            return false;
        }
        // Check plan capabilities (for regular users)
        // If undefined/null/false, no access
        if (reduxUser?.planCapabilities?.allowLeadScoring !== true) {
            return false;
        }
        return true;
    }, [reduxUser]);

    // Always show all tabs
    const actionsTab = [
        {
            id: 1,
            title: "Calendars"
        },
        {
            id: 2,
            title: "Tools"
        },
        {
            id: 3,
            title: "Lead Scoring"
        },
    ];

    return (
        <div>

            <div className="w-full flex flex-row items-center justify-center">
                <div
                    className='border bg-neutral-100 px-2 flex flex-row items-center gap-[8px] rounded-full py-1.5 mb-4'
                    style={{ width: "fit-content" }}
                >
                    {actionsTab.map((item) => {
                        return (
                            <button
                                key={item.id}
                                className={`px-4 py-1 ${selectedActionTab === item.id ? "text-white bg-purple shadow-md shadow-purple rounded-full" : "text-black"} border-none outline-none`}
                                onClick={() => setSelectedActionTab(item.id)}
                            >
                                {item.title}
                            </button>
                        )
                    })}
                </div>
            </div>

            {
                selectedActionTab === 1 ? (
                    reduxUser?.userRole === "AgencySubAccount" && reduxUser?.agencyCapabilities?.allowCalendarIntegration === false ? (
                        <UpgardView
                            setShowSnackMsg={setShowSnackMsg}
                            title={"Unlock Calendar Integration"}
                            subTitle={"Upgrade to enable calendar integration for your agents."}
                        />
                    ) : (
                        <UserCalender
                            calendarDetails={calendarDetails}
                            setUserDetails={setUserDetails}
                            selectedAgent={selectedAgent}
                            setSelectedAgent={setSelectedAgent}
                            mainAgentId={mainAgentId}
                            previousCalenders={previousCalenders}
                            updateVariableData={updateVariableData}
                            setShowUpgradeModal={setShowUpgradeModal}
                            showTools={false}
                            selectedUser={selectedUser}
                            selectedActionTab={selectedActionTab}
                        />
                    )
                ) : selectedActionTab === 2 ? (
                    // Tools Tab
                    !hasToolsAccess ? (
                        // UpgardView automatically handles both cases:
                        // - If agencyCapabilities.allowToolsAndActions === false → Shows "Request Feature" button
                        // - If planCapabilities.allowToolsAndActions === false → Shows "Upgrade Plan" button
                        <UpgardView
                            setShowSnackMsg={setShowSnackMsg}
                            title={"Unlock Actions"}
                            subTitle={"Upgrade to enable tools and actions for your agents."}
                        />
                    ) : (
                        // User has access - show tools
                        <UserCalender
                            calendarDetails={calendarDetails}
                            setUserDetails={setUserDetails}
                            selectedAgent={selectedAgent}
                            setSelectedAgent={setSelectedAgent}
                            mainAgentId={mainAgentId}
                            previousCalenders={previousCalenders}
                            updateVariableData={updateVariableData}
                            setShowUpgradeModal={setShowUpgradeModal}
                            showTools={true}
                            selectedUser={selectedUser}
                        />
                    )
                ) : selectedActionTab === 3 ? (
                    // Lead Scoring Tab
                    !hasLeadScoringAccess ? (
                        // UpgardView automatically handles both cases:
                        // - If agencyCapabilities.allowLeadScoring === false → Shows "Request Feature" button
                        // - If planCapabilities.allowLeadScoring === false → Shows "Upgrade Plan" button
                        <UpgardView
                            setShowSnackMsg={setShowSnackMsg}
                            title={"Unlock Lead Scoring"}
                            subTitle={"Upgrade to enable lead scoring for your agents."}
                        />
                    ) : (
                        // User has access - show lead scoring
                        <LeadScoring
                            activeTab={activeTab}
                            showDrawerSelectedAgent={showDrawerSelectedAgent}
                            setShowAddScoringModal={setShowAddScoringModal}
                            setShowDrawerSelectedAgent={setShowDrawerSelectedAgent}
                            setUserDetails={setUserDetails}
                            selectedUser={selectedUser}
                        />
                    )
                ) : null
            }

        </div>
    )
}

export default ActionsTab
