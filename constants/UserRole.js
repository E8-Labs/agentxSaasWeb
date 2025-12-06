/**
 * UserRole Enum
 * 
 * Defines the different user roles in the system.
 * This enum matches the backend UserRole enum in agentxapis/models/user/userModel.js
 * 
 * @enum {string}
 */
export const UserRole = {
  /** Main AgentX account user */
  AgentX: 'AgentX',
  
  /** Agency account (parent account for subaccounts) */
  Agency: 'Agency',
  
  /** Agency subaccount (child account under an agency) */
  AgencySubAccount: 'AgencySubAccount',
  
  /** Invited user (not yet fully registered) */
  Invitee: 'Invitee',
  
  /** Admin user (system administrator) */
  Admin: 'Admin',
}

/**
 * Type guard to check if a value is a valid UserRole
 * @param {string} value - The value to check
 * @returns {boolean} True if the value is a valid UserRole
 */
export function isValidUserRole(value) {
  return Object.values(UserRole).includes(value)
}

/**
 * Get user role display name
 * @param {string} role - The user role
 * @returns {string} Display name for the role
 */
export function getUserRoleDisplayName(role) {
  const displayNames = {
    [UserRole.AgentX]: 'AgentX',
    [UserRole.Agency]: 'Agency',
    [UserRole.AgencySubAccount]: 'Sub Account',
    [UserRole.Invitee]: 'Invitee',
    [UserRole.Admin]: 'Admin',
  }
  return displayNames[role] || role
}

