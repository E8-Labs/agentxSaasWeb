import React, { useState } from 'react'
import UserCalender from './UserCallender'
import LeadScoring from './leadScoring/LeadScoring'

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
}) => {

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
            title: "Leads Scoring"
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
                    />
                ) : selectedActionTab === 2 ?
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
                    />
                    :
                    <LeadScoring
                        activeTab={activeTab}
                        showDrawerSelectedAgent={showDrawerSelectedAgent}
                        setShowAddScoringModal={setShowAddScoringModal}
                    />
            }

        </div>
    )
}

export default ActionsTab
