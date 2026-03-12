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
    const agencyCapabilities = reduxUser?.agencyCapabilities || {}
    const isSubaccount = reduxUser?.userRole === 'AgencySubAccount'
    const planHasLeadScoring = planCapabilities.allowLeadScoring === true
    const agencyHasLeadScoring = agencyCapabilities.allowLeadScoring === true
    // Must have plan access; for subaccounts, agency must also have the feature
    if (!planHasLeadScoring) return false
    if (isSubaccount && !agencyHasLeadScoring) return false
    return true
  }, [reduxUser?.planCapabilities, reduxUser?.agencyCapabilities, reduxUser?.userRole])

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
          className="flex flex-row items-center mt-4 rounded-xl p-1 gap-0 min-w-[400px] max-w-[400px] mx-auto h-10 mb-4"
          style={{
            backgroundColor: '#F2F2F2',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
          role="tablist"
          aria-label="Calendars, Tools, Lead Scoring"
        >
          {actionsTab.map((item) => {
            const isSelected = selectedActionTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className="flex-1 min-w-0 h-full rounded-lg font-medium text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 transition-all"
                style={{
                  backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                  color: isSelected ? '#333333' : '#828282',
                  boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                }}
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
            selectedUser={selectedUser}
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
        (!hasToolsAccess ? // UpgardView automatically handles both cases:
        // - If agencyCapabilities.allowToolsAndActions === false → Shows "Request Feature" button
        // - If planCapabilities.allowToolsAndActions === false → Shows "Upgrade Plan" button
        (<UpgardView
          setShowSnackMsg={setShowSnackMsg}
          title={'Unlock Actions'}
          subTitle={'Upgrade to enable tools and actions for your agents.'}
          selectedUser={selectedUser}
        />) : // User has access - show tools
        (<UserCalender
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
        />))
      ) : selectedActionTab === 3 ? (
        // Lead Scoring Tab
        (!hasLeadScoringAccess ? // UpgardView automatically handles both cases:
        // - If agencyCapabilities.allowLeadScoring === false → Shows "Request Feature" button
        // - If planCapabilities.allowLeadScoring === false → Shows "Upgrade Plan" button
        (<UpgardView
          setShowSnackMsg={setShowSnackMsg}
          title={'Unlock Lead Scoring'}
          subTitle={'Upgrade to enable lead scoring for your agents.'}
          selectedUser={selectedUser}
        />) : // User has access - show lead scoring
        (<LeadScoring
          activeTab={activeTab}
          showDrawerSelectedAgent={showDrawerSelectedAgent}
          setShowAddScoringModal={setShowAddScoringModal}
          setShowDrawerSelectedAgent={setShowDrawerSelectedAgent}
          setUserDetails={setUserDetails}
          selectedUser={selectedUser}
        />))
      ) : null}
    </div>
  );
}

export default ActionsTab
