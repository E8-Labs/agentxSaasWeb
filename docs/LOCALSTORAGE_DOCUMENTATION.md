# LocalStorage Variables Documentation

This document explains the purpose and function of all localStorage variables used in the Admin AgentX, Pipeline Stages, and Pipeline and Stage components.

---

## Table of Contents

1. [AdminAgentX.js](#adminagentxjs)
2. [PipelineStages.js](#pipelinestagesjs)
3. [PiepelineAdnStage.js](#piepelineadnstagejs)

---

## AdminAgentX.js

### Overview
The `AdminAgentX.js` component manages agent administration for admin/agency users. It uses localStorage extensively to:
- Persist agent data across page refreshes
- Maintain state when navigating between admin and agent creation flows
- Store test credentials and user context
- Cache agent lists for performance

---

### 1. `User` (PersistanceKeys.LocalStorageUser)
**Key:** `'User'`  
**Purpose:** Stores the authenticated user's data including token, user details, and permissions.

**Usage:**
- **Read:** Retrieved throughout the component to get authentication token for API calls
- **Write:** Not written in this component (managed by auth system)
- **Structure:** Contains `{ token, user: { id, userType, userRole, ... } }`

**Example:**
```javascript
const userData = localStorage.getItem('User')
const AuthToken = userData.token
```

**Why it's needed:**
- Required for all authenticated API requests
- Determines user permissions (Admin, Agency, SubAccount)
- Used to check if user can perform certain actions

---

### 2. `localAgentDetails` (PersistanceKeys.LocalStoredAgentsListMain)
**Key:** `'localAgentDetails'`  
**Purpose:** Caches the complete list of agents with their nested structure (main agents containing sub-agents).

**Usage:**
- **Read:** Loaded on component mount to display agents without API call
- **Write:** Updated whenever agents are created, updated, deleted, or modified
- **Structure:** Array of main agents, each containing an `agents` array of sub-agents

**Example:**
```javascript
const localAgentsList = localStorage.getItem(PersistanceKeys.LocalStoredAgentsListMain)
const agentsList = JSON.parse(localAgentsList)
```

**Why it's needed:**
- **Performance:** Avoids unnecessary API calls when data hasn't changed
- **State persistence:** Maintains agent list when navigating away and back
- **Optimistic updates:** Allows immediate UI updates before API confirmation
- **Offline capability:** Provides fallback data if API fails

**When it's updated:**
- After fetching agents from API
- After creating a new agent
- After updating agent details (name, voice, phone number, etc.)
- After deleting an agent
- After duplicating an agent
- After assigning/reassigning phone numbers

---

### 3. `isFromAdminOrAgency` (PersistanceKeys.isFromAdminOrAgency)
**Key:** `'isFromAdminOrAgency'`  
**Purpose:** Tracks navigation context when admin/agency users create or edit agents for sub-accounts.

**Usage:**
- **Read:** Checked to determine if user is coming from admin/agency context
- **Write:** Set when navigating to agent creation/editing from admin panel
- **Structure:** `{ subAccountData: {...}, isFromAgency: boolean, restoreState?: { selectedAgentId?: number } }`

**Example:**
```javascript
const d = {
  subAccountData: selectedUser,
  isFromAgency: from,
}
localStorage.setItem(PersistanceKeys.isFromAdminOrAgency, JSON.stringify(d))
```

**Why it's needed:**
- **Context preservation:** Maintains which sub-account the agent belongs to
- **State restoration:** Restores selected agent drawer when returning from agent creation
- **Navigation flow:** Allows proper routing back to admin panel after agent operations

**Special feature - State Restoration:**
The component stores `restoreState.selectedAgentId` to automatically reopen the agent drawer when returning from agent creation:
```javascript
stateObject.restoreState.selectedAgentId = agent.id
```

---

### 4. `returnUrlAfterAgentCreation` (PersistanceKeys.returnUrlAfterAgentCreation)
**Key:** `'returnUrlAfterAgentCreation'`  
**Purpose:** Stores the current page URL before navigating to agent creation, allowing users to return to the exact page.

**Usage:**
- **Read:** Used after agent creation to redirect back
- **Write:** Set before navigating to `/createagent`
- **Structure:** String URL

**Example:**
```javascript
const currentUrl = window.location.href
localStorage.setItem(PersistanceKeys.returnUrlAfterAgentCreation, currentUrl)
```

**Why it's needed:**
- **User experience:** Seamless navigation flow
- **Context preservation:** Returns admin to the same sub-account view
- **Workflow continuity:** Maintains user's place in multi-step processes

---

### 5. `TestAiCredentials` (PersistanceKeys.TestAiCredentials)
**Key:** `'TestAiCredentials'`  
**Purpose:** Saves test call credentials (name, phone, extra columns) to pre-fill the test AI modal on subsequent opens.

**Usage:**
- **Read:** Loaded when test AI modal opens to populate form fields
- **Write:** Saved after successful test call or when form is submitted
- **Structure:** `{ name: string, phone: string, extraColumns: Array<Object>, userId: number, agentId: number }`

**Example:**
```javascript
localStorage.setItem(
  PersistanceKeys.TestAiCredentials,
  JSON.stringify(ApiData)
)
```

**Why it's needed:**
- **User convenience:** Avoids re-entering test data repeatedly
- **Testing efficiency:** Speeds up agent testing workflow
- **Form persistence:** Maintains input values across modal opens/closes

---

### 6. `fromDashboard` (Direct string)
**Key:** `'fromDashboard'`  
**Purpose:** Flag indicating that agent creation was initiated from the dashboard.

**Usage:**
- **Read:** Checked in agent creation flow to customize behavior
- **Write:** Set to `{ status: true }` when clicking "Add New Agent"
- **Structure:** `{ status: boolean }`

**Why it's needed:**
- **Flow customization:** Different behavior for dashboard vs. other entry points
- **UI context:** May show different onboarding or help content

---

### 7. `AddAgentByPayingPerMonth` (Direct string)
**Key:** `'AddAgentByPayingPerMonth'`  
**Purpose:** Temporary flag indicating user wants to add agent via monthly payment plan.

**Usage:**
- **Read:** Checked in agent creation flow
- **Write:** Set when user chooses to add agent via payment
- **Auto-removed:** Automatically removed after 2 minutes

**Example:**
```javascript
localStorage.setItem('AddAgentByPayingPerMonth', JSON.stringify({ status: true }))
setTimeout(() => {
  localStorage.removeItem('AddAgentByPayingPerMonth')
}, 2 * 60 * 1000)
```

**Why it's needed:**
- **Temporary state:** Short-lived flag for payment flow
- **Auto-cleanup:** Prevents stale data from affecting future sessions

---

### 8. `agentDetails` (PersistanceKeys.LocalSavedAgentDetails)
**Key:** `'agentDetails'`  
**Purpose:** Stores minimal agent information (typically just `id`) for quick reference.

**Usage:**
- **Read:** Used in some API calls that require agent context
- **Write:** Not frequently written in this component
- **Structure:** `{ id: number }`

**Why it's needed:**
- **Quick reference:** Fast access to current agent ID
- **API context:** Some endpoints require agent ID in context

---

### 9. `purchasedNumberDetails` (Direct string)
**Key:** `'purchasedNumberDetails'`  
**Purpose:** Stores details of a newly purchased phone number.

**Usage:**
- **Read:** Used to display purchase success modal
- **Write:** Set after successful phone number purchase
- **Structure:** Phone number purchase response data

**Why it's needed:**
- **Purchase confirmation:** Shows success state after purchase
- **Number assignment:** Provides data for immediate number assignment

---

### 10. `ObjectionsList` & `GuadrailsList` (Direct strings)
**Keys:** `'ObjectionsList'`, `'GuadrailsList'`  
**Purpose:** Temporary storage for objections and guardrails data during script editing.

**Usage:**
- **Read:** Loaded when editing advanced script settings
- **Write:** Set during script editing process
- **Removed:** Cleared when script modal closes

**Example:**
```javascript
localStorage.removeItem('ObjectionsList')
localStorage.removeItem('GuadrailsList')
```

**Why it's needed:**
- **Form state:** Maintains user input during editing
- **Data persistence:** Prevents data loss if modal accidentally closes
- **Cleanup:** Removed on close to prevent stale data

---

## PipelineStages.js

### Overview
The `PipelineStages.js` component manages pipeline stage configuration, including stage ordering, actions, and cadence settings. It uses localStorage to maintain context when accessed from admin/agency views.

---

### 1. `isFromAdminOrAgency` (PersistanceKeys.isFromAdminOrAgency)
**Key:** `'isFromAdminOrAgency'`  
**Purpose:** Determines if the pipeline is being edited from an admin/agency context for a sub-account.

**Usage:**
- **Read:** Checked to determine target user (admin's selected user vs. logged-in user)
- **Write:** Not written in this component (set by parent component)
- **Structure:** `{ subAccountData: {...}, isFromAgency: boolean }`

**Example:**
```javascript
let data = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
const getTargetUser = () => {
  if (data) {
    const parsed = JSON.parse(data)
    return parsed.subAccountData // Use sub-account user
  }
  return null // Use logged-in user
}
```

**Why it's needed:**
- **Context switching:** Allows admin to edit pipelines for sub-accounts
- **API targeting:** Ensures API calls target the correct user
- **Permission handling:** Different permissions for admin vs. regular user

---

### 2. `isDefaultCadenceEditing` (PersistanceKeys.isDefaultCadenceEditing)
**Key:** `'isDefaultCadenceEditing'`  
**Purpose:** Flag indicating that the default cadence is being edited (vs. stage-specific cadence).

**Usage:**
- **Read:** Checked to determine cadence editing mode
- **Write:** Set/removed when entering/exiting default cadence edit mode
- **Removed:** Cleared when adding new stage to reset cadence context

**Example:**
```javascript
localStorage.removeItem(PersistanceKeys.isDefaultCadenceEditing)
```

**Why it's needed:**
- **Edit mode:** Distinguishes between default and stage-specific cadence editing
- **State management:** Prevents confusion about which cadence is being edited
- **UI behavior:** May show different UI based on edit mode

---

### 3. `selectedUser` (PersistanceKeys.selectedUser)
**Key:** `'selectedUser'`  
**Purpose:** Stores the currently selected user when in admin/agency context.

**Usage:**
- **Read:** Used as fallback if `isFromAdminOrAgency` is not available`
- **Write:** Not written in this component (set by parent)
- **Structure:** User object

**Why it's needed:**
- **Fallback mechanism:** Secondary method to get target user
- **Data consistency:** Ensures user context is always available

---

### 4. `User` (PersistanceKeys.LocalStorageUser)
**Key:** `'User'`  
**Purpose:** Authenticated user data for API authentication.

**Usage:**
- **Read:** Retrieved for API authentication tokens
- **Write:** Not written in this component
- **Structure:** `{ token, user: {...} }`

**Why it's needed:**
- **API authentication:** Required for all API calls
- **User identification:** Identifies the logged-in user

---

### 5. `agentDetails` (PersistanceKeys.LocalSavedAgentDetails)
**Key:** `'agentDetails'`  
**Purpose:** Current agent context for pipeline operations.

**Usage:**
- **Read:** Used to get agent ID for pipeline-related API calls
- **Write:** Not written in this component
- **Structure:** `{ id: number }`

**Why it's needed:**
- **Agent context:** Links pipeline stages to specific agent
- **API requirements:** Some endpoints require agent ID

---

### 6. `pipelinesList` (Direct string)
**Key:** `'pipelinesList'`  
**Purpose:** Caches the list of pipelines for quick access.

**Usage:**
- **Read:** Loaded to check existing pipelines before creating new one
- **Write:** Updated after pipeline operations
- **Structure:** Array of pipeline objects

**Example:**
```javascript
let p = localStorage.getItem('pipelinesList')
if (p) {
  const pipelines = JSON.parse(p)
  // Use cached data
}
```

**Why it's needed:**
- **Performance:** Avoids API call to check existing pipelines
- **Validation:** Used to prevent duplicate pipeline creation
- **Quick access:** Fast lookup for pipeline operations

---

## PiepelineAdnStage.js

### Overview
The `PiepelineAdnStage.js` component displays and manages pipeline stages and cadence settings. It uses localStorage to maintain user context and cadence editing state.

---

### 1. `User` (PersistanceKeys.LocalStorageUser)
**Key:** `'User'`  
**Purpose:** Authenticated user data for API calls.

**Usage:**
- **Read:** Retrieved for authentication tokens
- **Write:** Not written in this component
- **Structure:** `{ token, user: {...} }`

**Why it's needed:**
- **API authentication:** Required for all authenticated requests
- **User context:** Identifies the logged-in user

---

### 2. `agentDetails` (PersistanceKeys.LocalSavedAgentDetails)
**Key:** `'agentDetails'`  
**Purpose:** Current agent context for cadence and pipeline operations.

**Usage:**
- **Read:** Used to get agent ID and main agent ID
- **Write:** Set when component loads with agent data
- **Structure:** `{ id: number }` (sub-agent ID) or full agent object

**Example:**
```javascript
const agentDataLocal = localStorage.getItem('agentDetails')
if (agentDataLocal) {
  const agentData = JSON.parse(agentDataLocal)
  // Use agent ID
}
```

**Why it's needed:**
- **Agent context:** Links cadence settings to specific agent
- **API requirements:** Required for cadence-related API calls
- **State management:** Maintains agent context across component lifecycle

---

### 3. `selectedUser` (Direct string)
**Key:** `'selectedUser'`  
**Purpose:** Stores the currently selected user when in admin/agency context.

**Usage:**
- **Read:** Used to determine target user for API calls
- **Write:** Set when component receives selectedUser prop
- **Structure:** User object

**Example:**
```javascript
localStorage.setItem('selectedUser', JSON.stringify(selectedUser))
```

**Why it's needed:**
- **Admin context:** Allows admin to view/manage cadence for sub-accounts
- **User targeting:** Ensures API calls target correct user
- **State persistence:** Maintains selected user across component updates

---

### 4. `AddCadenceDetails` (Direct string)
**Key:** `'AddCadenceDetails'`  
**Purpose:** Temporary storage for cadence data during creation/editing.

**Usage:**
- **Read:** Loaded when resuming cadence creation/editing
- **Write:** Set when starting cadence creation
- **Removed:** Cleared after successful cadence save

**Example:**
```javascript
localStorage.setItem('AddCadenceDetails', JSON.stringify(cadenceData))
// ... after save
localStorage.removeItem('AddCadenceDetails')
```

**Why it's needed:**
- **Form persistence:** Saves cadence data if user navigates away
- **Resume capability:** Allows user to resume cadence creation
- **Data recovery:** Prevents data loss during editing

---

### 5. `isFromAdminOrAgency` (PersistanceKeys.isFromAdminOrAgency)
**Key:** `'isFromAdminOrAgency'`  
**Purpose:** Indicates if component is being used in admin/agency context.

**Usage:**
- **Read:** Checked to determine if admin is managing sub-account cadence
- **Write:** Not written in this component (set by parent)
- **Structure:** `{ subAccountData: {...}, isFromAgency: boolean }`

**Example:**
```javascript
const storedData = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
if (storedData) {
  const parsed = JSON.parse(storedData)
  // Admin/agency context detected
}
```

**Why it's needed:**
- **Context awareness:** Different behavior for admin vs. regular user
- **Permission handling:** May show/hide features based on context
- **API targeting:** Ensures correct user is targeted in API calls

---

## Summary of Patterns

### Common Patterns

1. **State Persistence:** Most localStorage variables are used to maintain state across page refreshes or navigation
2. **Performance Optimization:** Caching agent lists and pipeline data reduces API calls
3. **Context Preservation:** Admin/agency context is maintained to allow proper user targeting
4. **Temporary Storage:** Some variables are short-lived and auto-cleaned (e.g., `AddAgentByPayingPerMonth`)
5. **Form State:** Test credentials and cadence details are saved to improve UX

### Best Practices Observed

1. **Key Constants:** Using `PersistanceKeys` object prevents typos and centralizes key management
2. **Auto-cleanup:** Temporary flags are removed after use or timeout
3. **JSON Serialization:** Complex objects are stringified before storage
4. **Error Handling:** Try-catch blocks around localStorage operations prevent crashes
5. **State Restoration:** Agent drawer state is restored when returning from agent creation

### Potential Improvements

1. **Type Safety:** Consider using TypeScript interfaces for stored data structures
2. **Versioning:** Add version numbers to stored data for migration support
3. **Expiration:** Implement TTL (time-to-live) for cached data
4. **Encryption:** Consider encrypting sensitive data like tokens
5. **Size Limits:** Monitor localStorage size to prevent quota exceeded errors

---

## Related Files

- `constants/Constants.js` - Contains `PersistanceKeys` definitions
- `components/dashboard/myagentX/page.js` - Regular user agent management (similar patterns)
- `app/createagent/page.js` - Agent creation flow (uses some of these keys)

---

**Last Updated:** 2025-01-XX  
**Maintained By:** Development Team

