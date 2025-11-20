import React, { useState } from 'react'
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
    ]

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
                        />
                    )
                ) : selectedActionTab === 2 ? (
                    reduxUser?.userRole === "AgencySubAccount" && reduxUser?.agencyCapabilities?.allowToolsAndActions === false ? (
                        <UpgardView
                            setShowSnackMsg={setShowSnackMsg}
                            title={"Unlock Actions"}
                            subTitle={"Upgrade to enable tools and actions for your agents."}
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
                            showTools={true}
                            selectedUser={selectedUser}
                        />
                    )
                ) : selectedActionTab === 3 ? (
                    reduxUser?.userRole === "AgencySubAccount" && reduxUser?.agencyCapabilities?.allowLeadScoring === false ? (
                        <UpgardView
                            setShowSnackMsg={setShowSnackMsg}
                            title={"Unlock Lead Scoring"}
                            subTitle={"Upgrade to enable lead scoring for your agents."}
                        />
                    ) : (
                        <LeadScoring
                            activeTab={activeTab}
                            showDrawerSelectedAgent={showDrawerSelectedAgent}
                            setShowAddScoringModal={setShowAddScoringModal}
                            setShowDrawerSelectedAgent={setShowDrawerSelectedAgent}
                            setUserDetails={setUserDetails}
                            selectedUser = {selectedUser}
                        />
                    )
                ) : null
            }

        </div>
    )
}

export default ActionsTab
