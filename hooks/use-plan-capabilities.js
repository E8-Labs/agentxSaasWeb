import { useSelector } from 'react-redux';
import {
  selectUserPlan,
  selectPlanCapabilities,
  selectCurrentUsage,
  selectMaxAgents,
  selectCurrentAgents,
  selectAllowVoicemail,
  selectAllowToolsAndActions,
  selectAllowKnowledgeBases,
  selectIsTrial
} from '../store/slices/userSlice';

export const usePlanCapabilities = () => {
  const plan = useSelector(selectUserPlan);
  const planCapabilities = useSelector(selectPlanCapabilities);
  const currentUsage = useSelector(selectCurrentUsage);
  const maxAgents = useSelector(selectMaxAgents);
  const currentAgents = useSelector(selectCurrentAgents);
  const allowVoicemail = useSelector(selectAllowVoicemail);
  const allowToolsAndActions = useSelector(selectAllowToolsAndActions);
  const allowKnowledgeBases = useSelector(selectAllowKnowledgeBases);
  const isTrial = useSelector(selectIsTrial);

  // Log plan capabilities when they change
  console.log('🔍 [PLAN-CAPABILITIES] Current plan state:', {
    planType: plan?.type || 'undefined',
    planPrice: plan?.price || 'undefined',
    maxAgents: maxAgents || 0,
    currentAgents: currentAgents || 0,
    canCreateAgent: (currentAgents || 0) < (maxAgents || 0),
    allowVoicemail: allowVoicemail || false,
    allowToolsAndActions: allowToolsAndActions || false,
    allowKnowledgeBases: allowKnowledgeBases || false,
    isTrial: isTrial || false,
    hasUser: !!plan,
    hasPlanCapabilities: !!planCapabilities
  });
  
  // Additional debugging
  console.log('🔍 [PLAN-CAPABILITIES] Raw data check:', {
    planCapabilitiesObject: planCapabilities,
    maxAgentsFromCapabilities: planCapabilities?.maxAgents,
    currentUsageObject: currentUsage,
    currentAgentsFromUsage: currentUsage?.maxAgents
  });

  // Check if user has reached agent limit
  const canCreateAgent = () => {
    if (!plan) return false; // No plan, cannot create agents
    if (plan.price === 0 && currentAgents >= 1) return false; // Free plan limit
    return currentAgents < maxAgents;
  };

  // Check if user can create inbound agents
  const canCreateInboundAgent = () => {
    return canCreateAgent(); // Same logic for now
  };

  // Check if user can create outbound agents
  const canCreateOutboundAgent = () => {
    return canCreateAgent(); // Same logic for now
  };

  // Check if feature is allowed by plan
  const isFeatureAllowed = (featureName) => {
    if (!planCapabilities) return false;
    return planCapabilities[featureName] || false;
  };

  // Get remaining agent slots
  const getRemainingAgents = () => {
    return Math.max(0, maxAgents - currentAgents);
  };

  // Check if user is on free plan
  const isFreePlan = () => {
    return !plan || plan.price === 0;
  };

  // Get upgrade message for features
  const getUpgradeMessage = (featureName) => {
    const featureMessages = {
      voicemail: "Voicemail feature is available in paid plans. Upgrade to unlock this feature.",
      toolsAndActions: "Tools & Actions are available in paid plans. Upgrade to unlock this feature.",
      knowledgeBases: "Knowledge Bases are available in paid plans. Upgrade to unlock this feature.",
      agents: `You've reached your plan limit of ${maxAgents} agents. Upgrade to create more agents.`,
    };
    return featureMessages[featureName] || "This feature requires a plan upgrade.";
  };

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
  };
};