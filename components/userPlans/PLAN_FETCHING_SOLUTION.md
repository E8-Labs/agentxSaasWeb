# Plan Fetching Solution - Effective User Approach

## Overview

This document explains the new effective user approach for fetching plans, which ensures the correct plans are loaded based on the viewing context.

## Problem Statement

Previously, plan fetching logic was scattered and relied on:
- Multiple conditional checks with unclear priorities
- `from` prop that could be inconsistent
- `selectedUser` prop that wasn't always passed correctly
- Complex nested conditionals that were hard to maintain

This led to bugs where:
- Agency viewing subaccounts would see agency plans instead of subaccount plans
- Admin viewing users would see incorrect plans
- Plans would change based on where the modal was opened from

## Solution: Effective User Approach

### Core Principle

**Always determine WHO's plans we're fetching, then fetch those plans.**

The effective user is determined by:
1. **If `selectedUser` is provided** → Use `selectedUser` (admin viewing another user OR agency viewing subaccount)
2. **Otherwise** → Use logged-in user (user viewing their own plans)

### Implementation

#### 1. `getEffectiveUser(selectedUser, loggedInUser)`

Determines which user's plans should be fetched.

```javascript
// Returns:
{
  id: userId,
  userRole: 'AgencySubAccount' | 'Agency' | 'User' | 'Admin',
  isSelectedUser: true/false,
  source: 'selectedUser' | 'loggedInUser'
}
```

**Rules:**
- If `selectedUser` is provided → effective user is `selectedUser`
- Otherwise → effective user is `loggedInUser`

#### 2. `getPlanEndpoint(effectiveUser, loggedInUser, from)`

Determines the correct API endpoint based on effective user's role.

**Priority Order:**
1. Effective user is `AgencySubAccount` → `/api/agency/getPlansForSubaccount`
2. Effective user is `Agency` → `/api/agency/getPlanListForAgency`
3. Logged-in user is team member (agency) → `/api/agency/getPlanListForAgency`
4. Logged-in user is team member (subaccount) → `/api/agency/getPlansForSubaccount`
5. Legacy `from` prop support → Respect `from` prop for backward compatibility
6. Default → `/api/plans` (regular user plans)

#### 3. `getUserPlans(from, selectedUser)`

Main function that orchestrates plan fetching.

**Flow:**
1. Get logged-in user from localStorage
2. Determine effective user using `getEffectiveUser()`
3. Determine API endpoint using `getPlanEndpoint()`
4. Build API path with `userId` query param if needed
5. Make API call with proper logging
6. Return plans data (with subaccount-specific formatting if needed)

## Usage Examples

### Scenario 1: User viewing their own plans
```javascript
// selectedUser = null
const plans = await getUserPlans(null, null)
// Effective user: logged-in user
// Endpoint: Based on logged-in user's role
```

### Scenario 2: Admin viewing another user
```javascript
// selectedUser = { id: 123, userRole: 'User' }
const plans = await getUserPlans('admin', selectedUser)
// Effective user: selectedUser (id: 123)
// Endpoint: /api/plans?userId=123
```

### Scenario 3: Agency viewing subaccount
```javascript
// selectedUser = { id: 456, userRole: 'AgencySubAccount' }
const plans = await getUserPlans('agency', selectedUser)
// Effective user: selectedUser (id: 456, role: AgencySubAccount)
// Endpoint: /api/agency/getPlansForSubaccount?userId=456
```

### Scenario 4: Agency viewing their own plans
```javascript
// selectedUser = null
// loggedInUser = { userRole: 'Agency' }
const plans = await getUserPlans(null, null)
// Effective user: logged-in user (Agency)
// Endpoint: /api/agency/getPlanListForAgency
```

## Logging

Structured logging is implemented using `planLogger` utility:

- **User Context Logging**: Logs when effective user is determined
- **API Call Logging**: Logs API endpoint, userId, and userRole
- **Success Logging**: Logs successful plan fetches with plan count
- **Error Logging**: Logs errors with context

All logs follow format: `[LEVEL][CATEGORY] message {metadata}`

## Benefits

1. **Single Source of Truth**: Effective user is determined once, used everywhere
2. **Clear Logic Flow**: Easy to understand and maintain
3. **Consistent Behavior**: Same logic everywhere, regardless of where modal opens
4. **Proper Logging**: Structured logs make debugging easier
5. **Backward Compatible**: Still supports legacy `from` prop
6. **Type Safe**: Clear function signatures and return types

## Migration Guide

### For Components Using `getUserPlans`

**Before:**
```javascript
const plans = await getUserPlans(from, selectedUser)
```

**After:**
```javascript
// Same API - no changes needed!
const plans = await getUserPlans(from, selectedUser)
```

The function signature remains the same, but internal logic is improved.

### For Components Rendering `UpgradePlan`

**Ensure `selectedUser` is passed:**
```javascript
<UpgradePlan
  open={showModal}
  handleClose={handleClose}
  selectedUser={selectedUser} // ✅ Always pass this when viewing another user
  from={from} // Optional, for backward compatibility
/>
```

## Testing Checklist

- [ ] User viewing their own plans → Shows correct plans
- [ ] Admin viewing regular user → Shows user's plans
- [ ] Admin viewing agency → Shows agency's plans
- [ ] Admin viewing subaccount → Shows subaccount's plans
- [ ] Agency viewing their own plans → Shows agency's plans
- [ ] Agency viewing subaccount → Shows subaccount's plans
- [ ] Agency team member viewing subaccount → Shows subaccount's plans
- [ ] Subaccount viewing their own plans → Shows subaccount's plans
- [ ] Modal opens from account page → Shows correct plans
- [ ] Modal opens from agent details → Shows correct plans
- [ ] Modal opens from lead details → Shows correct plans

## Files Modified

1. `agentxSaasWeb/components/userPlans/UserPlanServices.js`
   - Added `getEffectiveUser()` function
   - Added `getPlanEndpoint()` function
   - Refactored `getUserPlans()` to use effective user approach
   - Added structured logging

2. `agentxSaasWeb/utils/planLogger.js` (NEW)
   - Created structured logging utility
   - Provides consistent log format
   - Can be easily disabled/enabled

3. `agentxSaasWeb/components/userPlans/UpgradePlan.js`
   - Removed console.log statements
   - Uses new `getUserPlans()` function (no changes needed)

4. `agentxSaasWeb/components/admin/users/AdminAgentX.js`
   - Added `selectedUser` prop to `UpgradeTagWithModal` components

5. `agentxSaasWeb/components/admin/users/AdminLeadDetails.js`
   - Added `selectedUser` prop to `UpgradeTagWithModal` and `UpgradePlan` components

## Future Improvements

1. Remove `from` prop dependency entirely (after full migration)
2. Add TypeScript types for better type safety
3. Add unit tests for `getEffectiveUser()` and `getPlanEndpoint()`
4. Consider React Context for user context management
