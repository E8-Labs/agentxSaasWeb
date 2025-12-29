# Upgrade Plan Components Documentation

## Overview

This document explains the two upgrade plan components used in the AgentX SaaS application for managing user subscriptions. These components handle plan selection, payment method management, and subscription processing.

## Components

### 1. `UpgradePlan.js`
**Purpose**: For regular users (including subaccounts viewing their own plans) to manage their subscriptions.

### 2. `UpgradePlanForUserFromAdminAgency.js`
**Purpose**: For agency users or admins managing subscriptions for their subaccounts.

---

## Component Comparison

| Feature | UpgradePlan | UpgradePlanForUserFromAdminAgency |
|---------|-------------|-----------------------------------|
| **Use Case** | Self-service plan management | Agency/Admin managing subaccount |
| **Current Plan Source** | localStorage (getUserLocalData) | API (AdminGetProfileDetails) |
| **Plans API** | getUserPlans() - dynamic endpoint | Apis.getSubAccountPlans?userId=X |
| **Payment Methods** | Logged-in user's cards | Subaccount's cards (?userId=X) |
| **SetupIntent** | For logged-in user | For subaccount (?userId=X) |
| **Subscription** | For logged-in user | For subaccount (userId in body) |
| **selectedUser Required** | No (optional) | Yes (required) |

---

## When to Use Each Component

### Use `UpgradePlan` when:
- ✅ A regular user is managing their own subscription
- ✅ A subaccount is viewing their own plans screen (`selectedUser` is null/undefined)
- ✅ Self-service subscription management is needed
- ✅ Current plan data can be read from localStorage

### Use `UpgradePlanForUserFromAdminAgency` when:
- ✅ An agency user is managing a subaccount's subscription
- ✅ An admin is managing a subaccount's subscription
- ✅ `selectedUser` prop is provided (subaccount object)
- ✅ All operations must target the subaccount, not the agency admin
- ✅ Current plan must be fetched from API (not localStorage)

---

## Props Reference

### Common Props (Both Components)

#### `open` (boolean, required)
- Controls modal visibility
- `true` = modal displayed
- `false` = modal hidden

#### `handleClose` (Function, required)
- Callback when modal closes
- Signature: `(upgradeResult: boolean) => void`
- `upgradeResult = true` indicates successful subscription
- Parent should refresh profile/state when `upgradeResult === true`

#### `plan` (Object, optional)
- Legacy prop for currently selected plan
- **Deprecated**: Use `selectedPlan` instead
- May be removed in future versions

#### `currentFullPlan` (Object, optional)
- User's current active plan details from database
- Used for comparison to determine upgrade/downgrade/same
- Structure:
  ```javascript
  {
    id: number,
    name: string,
    price: number,
    billingCycle: 'monthly' | 'quarterly' | 'yearly',
    // ... other plan properties
  }
  ```

#### `selectedPlan` (Object | null, optional)
- Pre-selected plan from previous screen
- If provided, automatically selected when modal opens
- Default: `null`
- Structure:
  ```javascript
  {
    id: number,
    name: string,
    billingCycle: 'monthly' | 'quarterly' | 'yearly',
    discountPrice: number,
    // ... other plan properties
  }
  ```

#### `setSelectedPlan` (Function | null, optional)
- Callback to update selected plan in parent component
- Default: `null`
- Signature: `(plan: Object) => void`

#### `from` (string, optional)
- Context identifier for component usage
- Values: `'User'`, `'SubAccount'`, `'agency'`
- Used to determine API endpoints
- Default: `'User'`

#### `selectedUser` (Object | null)
- **UpgradePlan**: Optional. When provided, some operations may target this user
- **UpgradePlanForUserFromAdminAgency**: **REQUIRED**. The subaccount being managed
- Structure:
  ```javascript
  {
    id: number,        // REQUIRED - used in all API calls
    name: string,
    email: string,
    // ... other user properties
  }
  ```

---

## Usage Examples

### Example 1: Subaccount Viewing Own Plans

```javascript
// In SubAccountPlansAndPayments.js
// When selectedUser is NOT provided (subaccount viewing own plans)

<UpgradePlan
  open={showUpgradeModal}
  handleClose={async (upgradeResult) => {
    setShowUpgradeModal(false)
    if (upgradeResult) {
      // Refresh profile after successful upgrade
      getProfile()
    }
  }}
  from="SubAccount"
  selectedPlan={selectedPlan}
  currentFullPlan={currentPlanDetails}
  // selectedUser is NOT provided - component operates for logged-in user
/>
```

### Example 2: Agency Managing Subaccount

```javascript
// In SubAccountPlansAndPayments.js
// When selectedUser IS provided (agency viewing subaccount)

<UpgradePlanForUserFromAdminAgency
  open={showUpgradeModal}
  handleClose={async (upgradeResult) => {
    setShowUpgradeModal(false)
    if (upgradeResult) {
      // Refresh subaccount profile after successful upgrade
      await AdminGetProfileDetails(selectedUser.id)
      getProfile() // Refresh parent component state
    }
  }}
  from="SubAccount"
  selectedUser={selectedUser} // REQUIRED - subaccount object
  selectedPlan={selectedPlan}
  currentFullPlan={currentPlanDetails}
/>
```

### Example 3: Conditional Rendering

```javascript
// In SubAccountPlansAndPayments.js
// Conditionally render based on selectedUser

{selectedUser ? (
  // Agency viewing subaccount - use specialized component
  <UpgradePlanForUserFromAdminAgency
    open={showUpgradeModal}
    handleClose={handleClose}
    from="SubAccount"
    selectedUser={selectedUser}
    selectedPlan={selectedPlan}
    currentFullPlan={currentPlanDetails}
  />
) : (
  // Subaccount viewing own plans - use regular component
  <Elements stripe={stripePromise}>
    <UpgradePlan
      open={showUpgradeModal}
      handleClose={handleClose}
      from="SubAccount"
      selectedPlan={selectedPlan}
      currentFullPlan={currentPlanDetails}
    />
  </Elements>
)}
```

---

## Data Flow

### UpgradePlan Flow

```
1. Component Opens
   ↓
2. initializePlans() called
   ↓
3. getPlans() → getUserPlans(from, selectedUser)
   - Determines API endpoint based on 'from' and user role
   - May use: getPlans, getSubAccountPlans, getPlansForAgency
   ↓
4. getCurrentUserPlan() → getUserLocalData()
   - Reads from localStorage
   - Gets current plan from user object
   ↓
5. getCardsList()
   - Fetches payment methods
   - Adds ?userId if selectedUser provided
   ↓
6. User Selects Plan & Payment Method
   ↓
7. handleSubscribePlan()
   - Processes subscription
   - Uses selected plan and payment method
   ↓
8. handleClose(true) called on success
   - Parent refreshes profile/state
```

### UpgradePlanForUserFromAdminAgency Flow

```
1. Component Opens
   ↓
2. initializePlans() called
   ↓
3. getPlans() → Apis.getSubAccountPlans?userId={selectedUser.id}
   - ALWAYS uses subaccount plans endpoint
   - Always includes userId parameter
   ↓
4. getCurrentUserPlan() → AdminGetProfileDetails(selectedUser.id)
   - Fetches from API (not localStorage)
   - Gets subaccount's current plan
   ↓
5. getCardsList() → Apis.getCardsList?userId={selectedUser.id}
   - Fetches subaccount's payment methods
   - Always includes userId parameter
   ↓
6. User Selects Plan & Payment Method
   ↓
7. handleAddCard() (if adding new payment method)
   - Creates SetupIntent: Apis.createSetupIntent?userId={selectedUser.id}
   - Adds card: Apis.addCard (with userId in body)
   - Payment method attached to subaccount's Stripe customer
   ↓
8. handleSubscribePlan()
   - Apis.subAgencyAndSubAccountPlans
   - Request body includes: { planId, paymentMethodId, userId }
   - Subscribes the subaccount, not the agency
   ↓
9. handleClose(true) called on success
   - Parent should refresh subaccount profile
   - Parent should update UI state
```

---

## API Endpoints

### UpgradePlan Uses (Dynamic)

| Operation | Endpoint | Notes |
|-----------|----------|-------|
| Get Plans | `getUserPlans()` helper determines endpoint | Based on `from` prop and user role |
| Get Current Plan | localStorage | `getUserLocalData()` |
| Get Payment Methods | `Apis.getCardsList` | Optional `?userId=X` if selectedUser provided |
| Create SetupIntent | `Apis.createSetupIntent` | Optional `?userId=X` if selectedUser provided |
| Add Payment Method | `Apis.addCard` | Optional `userId` in body if selectedUser provided |
| Subscribe | `Apis.subscribePlan` or `Apis.subAgencyAndSubAccountPlans` | Based on user role and `from` prop |

### UpgradePlanForUserFromAdminAgency Uses (Fixed)

| Operation | Endpoint | Notes |
|-----------|----------|-------|
| Get Plans | `Apis.getSubAccountPlans?userId={selectedUser.id}` | Always includes userId |
| Get Current Plan | `AdminGetProfileDetails(selectedUser.id)` | API call, not localStorage |
| Get Payment Methods | `Apis.getCardsList?userId={selectedUser.id}` | Always includes userId |
| Create SetupIntent | `Apis.createSetupIntent?userId={selectedUser.id}` | Always includes userId |
| Add Payment Method | `Apis.addCard` with `userId` in body | Always includes userId |
| Subscribe | `Apis.subAgencyAndSubAccountPlans` with `userId` in body | Always includes userId |

---

## Key Functions

### getPlans()

**UpgradePlan:**
- Uses `getUserPlans(from, selectedUser)` helper
- Helper determines endpoint based on context
- May return different plan structures

**UpgradePlanForUserFromAdminAgency:**
- Directly calls `Apis.getSubAccountPlans?userId={selectedUser.id}`
- Always fetches plans for the subaccount
- Returns plans available to that specific subaccount

### getCurrentUserPlan()

**UpgradePlan:**
- Reads from localStorage: `getUserLocalData()`
- Gets plan from `userData.user?.plan`
- Synchronous operation

**UpgradePlanForUserFromAdminAgency:**
- Async API call: `AdminGetProfileDetails(selectedUser.id)`
- Fetches subaccount's profile from server
- Returns subaccount's current plan

### handleAddCard()

**UpgradePlan:**
- Creates SetupIntent: `Apis.createSetupIntent` (may include `?userId=X`)
- Adds card: `Apis.addCard` (may include `userId` in body)
- Payment method attached to logged-in user's Stripe customer

**UpgradePlanForUserFromAdminAgency:**
- Creates SetupIntent: `Apis.createSetupIntent?userId={selectedUser.id}`
- Adds card: `Apis.addCard` with `userId: selectedUser.id` in body
- Payment method attached to subaccount's Stripe customer

### handleSubscribePlan()

**UpgradePlan:**
- Determines API endpoint based on user role and `from` prop
- May use `Apis.subscribePlan` or `Apis.subAgencyAndSubAccountPlans`
- May include `userId` in body if `selectedUser` provided

**UpgradePlanForUserFromAdminAgency:**
- Always uses `Apis.subAgencyAndSubAccountPlans`
- Always includes `userId: selectedUser.id` in request body
- Subscribes the subaccount to the selected plan

### getButtonText()

Both components use similar logic:
- Returns `'Select a Plan'` if no plan selected
- Returns `'Subscribe'` if no current plan or plan is cancelled
- Returns `'Cancel Subscription'` if selected plan is current plan
- Returns `'Upgrade'` if selected plan is higher tier/price than current
- Returns `'Downgrade'` if selected plan is lower tier/price than current

---

## State Management

### Key State Variables

| Variable | Purpose | Source |
|----------|---------|--------|
| `monthlyPlans` | Array of monthly billing plans | From `getPlans()` |
| `quaterlyPlans` | Array of quarterly billing plans | From `getPlans()` |
| `yearlyPlans` | Array of yearly billing plans | From `getPlans()` |
| `currentUserPlan` | User's current active plan | localStorage (UpgradePlan) or API (UpgradePlanForUserFromAdminAgency) |
| `currentSelectedPlan` | Currently selected plan in UI | User selection |
| `cards` | Array of payment methods | From `getCardsList()` |
| `selectedCard` | Currently selected payment method | User selection |
| `selectedDuration` | Selected billing duration (Monthly/Quarterly/Yearly) | User selection |
| `loading` | Loading state for plans | Internal state |
| `subscribeLoader` | Loading state for subscription | Internal state |

---

## Error Handling

Both components handle errors similarly:

1. **API Errors**: Displayed via `AgentSelectSnackMessage` component
2. **Stripe Errors**: Shown in card form area
3. **Validation Errors**: Prevent form submission, show inline messages
4. **Network Errors**: Caught in try-catch blocks, logged to console

---

## Testing Considerations

### UpgradePlan
- Test with different `from` values ('User', 'SubAccount', 'agency')
- Test with and without `selectedUser` prop
- Verify localStorage is used for current plan
- Verify correct API endpoints are called based on context

### UpgradePlanForUserFromAdminAgency
- Test with valid `selectedUser` object (must have `id`)
- Verify all API calls include `userId` parameter
- Verify current plan is fetched from API, not localStorage
- Verify payment methods are fetched for subaccount
- Verify subscription targets subaccount, not agency

---

## Common Issues & Solutions

### Issue: Plans not loading for subaccount
**Solution**: Ensure `selectedUser` prop is provided and has valid `id` property

### Issue: Payment method added to wrong user
**Solution**: Use `UpgradePlanForUserFromAdminAgency` when managing subaccounts, ensure `userId` is included in all requests

### Issue: Current plan shows incorrectly
**Solution**: 
- For `UpgradePlan`: Check localStorage has valid user data
- For `UpgradePlanForUserFromAdminAgency`: Verify `AdminGetProfileDetails` API returns correct data

### Issue: Subscription fails
**Solution**: 
- Verify correct API endpoint is being used
- Check that `userId` is included in request body when needed
- Verify payment method is attached to correct Stripe customer

---

## Migration Guide

### Migrating from UpgradePlan to UpgradePlanForUserFromAdminAgency

If you're currently using `UpgradePlan` with `selectedUser` prop for agency/subaccount management:

1. Replace component import:
   ```javascript
   // Old
   import UpgradePlan from '@/components/userPlans/UpgradePlan'
   
   // New
   import UpgradePlanForUserFromAdminAgency from '@/components/userPlans/UpgradePlanForUserFromAdminAgency'
   ```

2. Ensure `selectedUser` is always provided (required prop)

3. Update `handleClose` to refresh subaccount profile:
   ```javascript
   handleClose={async (upgradeResult) => {
     if (upgradeResult && selectedUser) {
       await AdminGetProfileDetails(selectedUser.id)
       // Refresh UI state
     }
   }}
   ```

4. Remove `Elements` wrapper (component handles it internally)

---

## Future Improvements

- [ ] Consolidate common logic into shared hooks
- [ ] Add TypeScript types for better type safety
- [ ] Improve error messages and user feedback
- [ ] Add unit tests for both components
- [ ] Optimize API calls (caching, batching)
- [ ] Add loading states for better UX

---

## Related Files

- `SubAccountPlansAndPayments.js` - Main component using both upgrade plan components
- `UserPlanServices.js` - Helper functions for plan operations
- `AdminGetProfileDetails.js` - API function for fetching user profiles
- `Apis.js` - API endpoint definitions

---

## Support

For questions or issues related to these components, please:
1. Check this documentation first
2. Review component comments in source code
3. Check related API documentation
4. Contact the development team

