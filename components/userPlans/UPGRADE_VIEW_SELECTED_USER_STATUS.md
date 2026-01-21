# UpgardView SelectedUser Prop Passing Status

## Summary

This document tracks all usages of `UpgardView` component and whether `selectedUser` prop is being passed correctly for admin/agency viewing contexts.

## ✅ Fixed Components (Admin/Agency Viewing Contexts)

### 1. `AdminAgentX.js` ✅ FIXED
- **Line**: 5124
- **Status**: ✅ Fixed - Passes `selectedUser={selectedUser}`
- **Context**: Admin/agency viewing another user's agents → Actions tab

### 2. `Knowledgebase.js` ✅ FIXED
- **Line**: 80
- **Status**: ✅ Fixed - Passes `selectedUser={user}` (where `user` is `selectedUser` in admin context)
- **Context**: Used in `AdminAgentX` when viewing Knowledge tab

### 3. `ActionsTab.js` ✅ FIXED
- **Lines**: 103, 128, 150
- **Status**: ✅ Fixed - All 3 instances now pass `selectedUser={selectedUser}`
- **Context**: Used in `AdminAgentX` when viewing Actions tab
- **Features**: Calendar Integration, Tools/Actions, Lead Scoring

### 4. `VoiceMailTab.js` ✅ FIXED
- **Line**: 306
- **Status**: ✅ Fixed - Passes `selectedUser={selectedUser}`
- **Context**: Used in `AdminAgentX` when viewing Voicemail tab

---

## ✅ Correctly Not Passing (Self-Service Contexts)

These components are used for logged-in users viewing their own features, so they don't need `selectedUser`:

### 1. `app/dashboard/myAgentX/page.js`
- **Lines**: 6169, 6234, 6242, 6260, 6268
- **Status**: ✅ Correct - Self-service context (logged-in user viewing own agents)
- **Reason**: User is viewing their own agents, not admin/agency viewing another user

### 2. `CreateAgent4.js`
- **Lines**: 999, 1113
- **Status**: ✅ Correct - Agent creation context
- **Reason**: Used when creating new agents, not viewing another user

### 3. `NewMessageModal.js`
- **Line**: 1447
- **Status**: ✅ Correct - Messaging context
- **Reason**: Used in messaging interface, not admin/agency viewing context

### 4. `MessageComposer.js`
- **Line**: 1257
- **Status**: ✅ Correct - Messaging context
- **Reason**: Used in messaging interface, not admin/agency viewing context

### 5. `MCPView.js`
- **Status**: ✅ Correct - Imports `UpgardView` but doesn't use it
- **Note**: Component imports `UpgardView` but uses `UpgradePlanView` instead

---

## Component Usage Flow

### Admin/Agency Viewing Flow:
```
SelectedUserDetails (receives selectedUser)
  ↓
AdminAgentX (receives selectedUser, passes to child components)
  ↓
  ├─ ActionsTab (receives selectedUser, passes to UpgardView) ✅
  ├─ Knowledgebase (receives user=selectedUser, passes to UpgardView) ✅
  ├─ VoiceMailTab (receives selectedUser, passes to UpgardView) ✅
  └─ UpgardView (direct usage, receives selectedUser) ✅
```

### Self-Service Flow:
```
app/dashboard/myAgentX/page.js (logged-in user)
  ↓
  ├─ ActionsTab (no selectedUser needed) ✅
  ├─ Knowledgebase (no selectedUser needed) ✅
  ├─ VoiceMailTab (no selectedUser needed) ✅
  └─ UpgardView (direct usage, no selectedUser needed) ✅
```

---

## Testing Checklist

- [ ] Admin viewing subaccount → Actions tab → Calendar Integration upgrade → Shows subaccount plans
- [ ] Admin viewing subaccount → Actions tab → Tools upgrade → Shows subaccount plans
- [ ] Admin viewing subaccount → Actions tab → Lead Scoring upgrade → Shows subaccount plans
- [ ] Admin viewing subaccount → Knowledge tab → Upgrade → Shows subaccount plans
- [ ] Admin viewing subaccount → Voicemail tab → Upgrade → Shows subaccount plans
- [ ] Agency viewing subaccount → All tabs → Upgrade → Shows subaccount plans
- [ ] Regular user viewing own agents → All tabs → Upgrade → Shows own plans (no selectedUser)

---

## Files Modified

1. `agentxSaasWeb/constants/UpgardView.js`
   - Added `selectedUser` prop
   - Passes `selectedUser` to `UpgradePlan`
   - Determines `from` prop based on `selectedUser`'s role

2. `agentxSaasWeb/components/dashboard/myagentX/Knowledgebase.js`
   - Passes `selectedUser={user}` to `UpgardView`

3. `agentxSaasWeb/components/admin/users/AdminAgentX.js`
   - Passes `selectedUser={selectedUser}` to `UpgardView` (Actions tab)

4. `agentxSaasWeb/components/dashboard/myagentX/ActionsTab.js`
   - Passes `selectedUser={selectedUser}` to all 3 `UpgardView` instances

5. `agentxSaasWeb/components/dashboard/myagentX/VoiceMailTab.js`
   - Passes `selectedUser={selectedUser}` to `UpgardView`

---

## Notes

- `UpgardView` is a wrapper component that displays upgrade prompts and opens `UpgradePlan` modal
- When `selectedUser` is provided, it ensures the correct plans are shown (subaccount plans when viewing subaccounts, agency plans when viewing agencies)
- When `selectedUser` is `null` (self-service), it uses logged-in user's plans (correct behavior)
