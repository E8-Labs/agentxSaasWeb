import React, { useMemo, useState } from 'react'

import UpgardView from '@/constants/UpgardView'
import { useUser } from '@/hooks/redux-hooks'

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
  setShowDrawerSelectedAgent,
  setShowSnackMsg,
  selectedUser,
}) => {
  const { user: reduxUser } = useUser()

  const [selectedActionTab, setSelectedActionTab] = useState(1)

  // Check if user has access to Tools
  const hasToolsAccess = useMemo(() => {
    // For agency subaccounts, check agency capabilities
    if (reduxUser?.userRole === 'AgencySubAccount') {
      return reduxUser?.agencyCapabilities?.allowToolsAndActions === true
    }
    // For normal users, check plan capabilities
    return reduxUser?.planCapabilities?.allowToolsAndActions === true
  }, [reduxUser])

  // Check if user has access to Lead Scoring
  const hasLeadScoringAccess = useMemo(() => {
    // For agency subaccounts
    if (reduxUser?.userRole === 'AgencySubAccount') {
      // If agencyCapabilities.allowLeadScoring === false, show "Request Feature" button
      if (reduxUser?.agencyCapabilities?.allowLeadScoring === false) {
        return false // Will show UpgardView with "Request Feature" button
      }
      // If agencyCapabilities.allowLeadScoring === true, check planCapabilities
      if (reduxUser?.agencyCapabilities?.allowLeadScoring === true) {
        // If planCapabilities.allowLeadScoring === true, show lead scoring UI
        // Else show upgrade UI
        return reduxUser?.planCapabilities?.allowLeadScoring === true
      }
      // If agencyCapabilities.allowLeadScoring is undefined/null, default to false
      return false
    }
    // For normal users
    // If planCapabilities doesn't have allowLeadScoring, return true
    if (reduxUser?.planCapabilities?.allowLeadScoring === undefined || 
        reduxUser?.planCapabilities?.allowLeadScoring === null) {
      return true
    }
    // Else return the actual value
    return reduxUser?.planCapabilities?.allowLeadScoring === true
  }, [reduxUser])

  // Always show all tabs
  const actionsTab = [
    {
      id: 1,
      title: 'Calendars',
    },
    {
      id: 2,
      title: 'Tools',
    },
    {
      id: 3,
      title: 'Lead Scoring',
    },
  ]

  return (
    <div className="w-full overflow-x-hidden">
      <div className="w-full flex flex-row items-center justify-center px-2 sm:px-0">
        <div
          className="border bg-neutral-100 px-1 sm:px-2 flex flex-row items-center gap-[2px] sm:gap-[8px] rounded-full py-1.5 mb-4 flex-wrap justify-center"
          style={{ width: 'fit-content', maxWidth: '100%' }}
        >
          {actionsTab.map((item) => {
            return (
              <button
                key={item.id}
                className={`px-2 sm:px-4 py-1 text-xs sm:text-sm md:text-base whitespace-nowrap min-w-fit ${selectedActionTab === item.id ? 'text-white bg-brand-primary shadow-md shadow-brand-primary rounded-full' : 'text-black'} border-none outline-none`}
                style={{ minWidth: 'fit-content' }}
                onClick={() => setSelectedActionTab(item.id)}
              >
                {item.title}
              </button>
            )
          })}
        </div>
      </div>

      {selectedActionTab === 1 ? (
        reduxUser?.userRole === 'AgencySubAccount' &&
        reduxUser?.agencyCapabilities?.allowCalendarIntegration === false ? (
          <UpgardView
            setShowSnackMsg={setShowSnackMsg}
            title={'Unlock Calendar Integration'}
            subTitle={'Upgrade to enable calendar integration for your agents.'}
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
            title={'Unlock Actions'}
            subTitle={'Upgrade to enable tools and actions for your agents.'}
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
            title={'Unlock Lead Scoring'}
            subTitle={'Upgrade to enable lead scoring for your agents.'}
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
      ) : null}
    </div>
  )
}

export default ActionsTab
