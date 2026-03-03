import { useSelector } from 'react-redux'

import {
  selectAllowKnowledgeBases,
  selectAllowToolsAndActions,
  selectAllowVoicemail,
  selectCurrentAgents,
  selectCurrentUsage,
  selectIsTrial,
  selectMaxAgents,
  selectPlanCapabilities,
  selectUser,
  selectUserPlan,
} from '../store/slices/userSlice'

export const usePlanCapabilities = (selectedUser) => {
  const localData = localStorage.getItem('User')
  let agencyCapabilities = null
  if (localData) {
    const localUserData = JSON.parse(localData)
    agencyCapabilities = localUserData?.user?.agencyCapabilities
  }
  const reduxUser = useSelector(selectUser)
  const plan = useSelector(selectUserPlan)
  const planCapabilities = useSelector(selectPlanCapabilities)
  const currentUsage = useSelector(selectCurrentUsage)
  const maxAgents = useSelector(selectMaxAgents)
  const currentAgents = useSelector(selectCurrentAgents)
  const allowVoicemail = useSelector(selectAllowVoicemail) //agencyCapabilities?.allowVoicemail || useSelector(selectAllowVoicemail);
  const allowToolsAndActions = useSelector(selectAllowToolsAndActions) //agencyCapabilities?.allowToolsAndActions || useSelector(selectAllowToolsAndActions);
  const allowKnowledgeBases = useSelector(selectAllowKnowledgeBases) //agencyCapabilities?.allowKnowledgeBases || useSelector(selectAllowKnowledgeBases);
  const isTrial = useSelector(selectIsTrial)

  // Minimal logging to prevent memory leaks
  // console.log('🔍 [PLAN-CAPABILITIES] maxAgents:', maxAgents, 'currentAgents:', currentAgents);

  // Check if user has reached agent limit
  const canCreateAgent = () => {
    if (!plan) return false // No plan, cannot create agents
    if (plan.price === 0 && currentAgents >= 1) return false // Free plan limit
    return currentAgents < maxAgents
  }

  // Check if user can create inbound agents
  const canCreateInboundAgent = () => {
    return canCreateAgent() // Same logic for now
  }

  // Check if user can create outbound agents
  const canCreateOutboundAgent = () => {
    return canCreateAgent() // Same logic for now
  }

  // Check if feature is allowed by plan
  const isFeatureAllowed = (featureName) => {
    if (!planCapabilities) return false
    return planCapabilities[featureName] || false
  }

  // Get remaining agent slots
  const getRemainingAgents = () => {
    return Math.max(0, maxAgents - currentAgents)
  }

  // Check if user is on free plan
  const isFreePlan = () => {
    if (!plan) return true

    // More comprehensive free plan detection
    // Check plan type first, then capabilities, then price as fallback
    const planType = plan?.type?.toLowerCase()
    if (planType?.includes('free')) return true

    // If user has more than 1 agent capability, it's likely not free
    if (planCapabilities?.maxAgents > 1) return false

    // Fallback to price check
    return plan.price === 0
  }

  // Get upgrade message for features
  const getUpgradeMessage = (featureName) => {
    const featureMessages = {
      voicemail:
        'Voicemail feature is available in paid plans. Upgrade to unlock this feature.',
      toolsAndActions:
        'Tools & Actions are available in paid plans. Upgrade to unlock this feature.',
      knowledgeBases:
        'Knowledge Bases are available in paid plans. Upgrade to unlock this feature.',
      agents: `You've reached your plan limit of ${maxAgents} agents. Upgrade to create more agents.`,
    }
    return (
      featureMessages[featureName] || 'This feature requires a plan upgrade.'
    )
  }

  return {
    // Plan info
    plan,
    planCapabilities,
    currentUsage,
    isTrial,
    isFreePlan: isFreePlan(),

    // Agent limits
    maxAgents,
    currentAgents,
    remainingAgents: getRemainingAgents(),

    // Agent creation permissions
    canCreateAgent: canCreateAgent(),
    canCreateInboundAgent: canCreateInboundAgent(),
    canCreateOutboundAgent: canCreateOutboundAgent(),

    // Feature permissions
    allowVoicemail,
    allowToolsAndActions,
    allowKnowledgeBases,
    isFeatureAllowed,

    // Helper functions
    getUpgradeMessage,
  }
}
