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

  // Use backend-provided flags for capability checks
  const hasToolsAccess = useMemo(() => {
    const planCapabilities = reduxUser?.planCapabilities || {}
    return planCapabilities.allowToolsAndActions === true
  }, [reduxUser?.planCapabilities])

  const hasLeadScoringAccess = useMemo(() => {
    const planCapabilities = reduxUser?.planCapabilities || {}
    // If allowLeadScoring is undefined/null, default to true (backward compatibility)
    if (planCapabilities.allowLeadScoring === undefined || 
        planCapabilities.allowLeadScoring === null) {
      return true
    }
    return planCapabilities.allowLeadScoring === true
  }, [reduxUser?.planCapabilities])

  // Get upgrade/request feature flags from backend
  const shouldShowCalendarUpgrade = useMemo(() => {
    const planCapabilities = reduxUser?.planCapabilities || {}
    return planCapabilities.shouldShowAllowCalendarUpgrade === true ||
           planCapabilities.shouldShowCalendarRequestFeature === true
  }, [reduxUser?.planCapabilities])

  const shouldShowToolsUpgrade = useMemo(() => {
    const planCapabilities = reduxUser?.planCapabilities || {}
    return planCapabilities.shouldShowAllowToolsUpgrade === true ||
           planCapabilities.shouldShowToolsRequestFeature === true
  }, [reduxUser?.planCapabilities])

  const shouldShowLeadScoringUpgrade = useMemo(() => {
    const planCapabilities = reduxUser?.planCapabilities || {}
    return planCapabilities.shouldShowAllowLeadScoringUpgrade === true ||
           planCapabilities.shouldShowLeadScoringRequestFeature === true
  }, [reduxUser?.planCapabilities])

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
        shouldShowCalendarUpgrade ? (
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
