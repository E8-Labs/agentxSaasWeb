export const TeamType = Object.freeze({
  AGENCY: 'Agency',
  AGENTX: 'AgentX',
  SUBACCOUNT: 'Subaccount',
  NONE: null,
})

export const isTeamMember = (user) => {
  return user?.teamFor !== null && user?.teamFor !== undefined
}

// Helper function to check specific team type
export const isAgencyTeamMember = (user) => {
  return user?.teamFor === TeamType.AGENCY
}

export const isAgentXTeamMember = (user) => {
  return user?.teamFor === TeamType.AGENTX
}

export const isSubaccountTeamMember = (user) => {
  return user?.teamFor === TeamType.SUBACCOUNT
}
