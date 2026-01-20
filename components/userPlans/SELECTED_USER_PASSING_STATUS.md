# SelectedUser Prop Passing Status

## ✅ Components That Correctly Pass `selectedUser`

### 1. `AdminAgentX.js` ✅ FIXED
- **Status**: ✅ Fixed - All 3 instances of `UpgradeTagWithModal` now pass `selectedUser={selectedUser}`
- **Lines**: 4210, 5021, 5028

### 2. `AdminLeadDetails.js` ✅ FIXED
- **Status**: ✅ Fixed - Both `UpgradeTagWithModal` and `UpgradePlan` pass `selectedUser={selectedUser}`
- **Lines**: 1214, 2642

### 3. `AdminBilling.js` ✅
- **Status**: ✅ Already correct - Passes `selectedUser={selectedUser}` to `UpgradePlan`
- **Line**: 1823

### 4. `LeadDetails.js` ✅
- **Status**: ✅ Already correct - Passes `selectedUser={memoizedSelectedUserForUpgrade}` to `UpgradePlan`
- **Line**: 2742
- **Note**: Also passes `selectedUser` to `UpgradeTagWithModal` instances (lines 1805, 1816, 1828)

### 5. `Messages.js` ✅
- **Status**: ✅ Already correct - Passes `selectedUser={selectedUser}` to `UpgradePlan`
- **Lines**: 2337, 2368

### 6. `SubAccountPlansAndPayments.js` ✅
- **Status**: ✅ Already correct - Passes `selectedUser={selectedUser}` to both `UpgradePlanForUserFromAdminAgency` and `UpgradePlan`
- **Lines**: 1482, 1505

---

## ❌ Components That Need Fixing

### 1. `AgencyPlansPayments.js` ❌ NEEDS FIX
- **File**: `agentxSaasWeb/components/agency/myAccount/AgencyPlansPayments.js`
- **Issue**: Receives `selectedAgency` prop but doesn't pass it to `UpgradePlan` as `selectedUser`
- **Line**: 1662
- **Context**: Used when admin views an agency's account page. When `selectedAgency` is provided, it means admin is viewing another agency's plans.
- **Fix Required**: 
  ```javascript
  <UpgradePlan
    // ... existing props
    selectedUser={selectedAgency} // Add this
    from={'agency'}
  />
  ```

---

## ✅ Components That Don't Need `selectedUser` (Correct Behavior)

### 1. `Teams.js` ✅ CORRECT
- **File**: `agentxSaasWeb/components/dashboard/teams/Teams.js`
- **Reason**: Used for logged-in user viewing their own teams, not for admin/agency viewing other users
- **Note**: When admin views agency teams, it uses `AdminTeams` component (not `Teams`), which correctly receives `selectedUser`

### 2. `ProfileNav.js` ✅ CORRECT
- **File**: `agentxSaasWeb/components/dashboard/Navbar/ProfileNav.js`
- **Reason**: Navbar component for logged-in user's own profile, not for viewing other users

### 3. `PlanConfiguration.js` ✅ CORRECT
- **File**: `agentxSaasWeb/components/agency/plan/PlanConfiguration.js`
- **Status**: Already passes `selectedUser={selectedAgency}` (line 1335)
- **Note**: This is correct - it's for agency viewing their own plans or admin viewing agency plans

---

## Summary

### Total Components Checked: 10
- ✅ **Correctly Passing**: 7 components
- ❌ **Needs Fix**: 1 component (`AgencyPlansPayments.js`)
- ✅ **Correctly Not Passing** (self-service): 2 components

### Action Required

**Fix `AgencyPlansPayments.js`:**
- Add `selectedUser={selectedAgency}` prop to `UpgradePlan` component
- This ensures when admin views an agency's account, the correct agency's plans are shown

---

## Testing Checklist After Fix

- [ ] Admin viewing agency's account → Opens upgrade modal → Shows agency's plans (not admin's plans)
- [ ] Agency viewing their own account → Opens upgrade modal → Shows agency's plans
- [ ] Admin viewing subaccount → Opens upgrade modal → Shows subaccount's plans
- [ ] Agency viewing subaccount → Opens upgrade modal → Shows subaccount's plans
- [ ] Regular user viewing their own account → Opens upgrade modal → Shows user's plans
