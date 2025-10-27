# CustomToast Migration Roadmap

## Executive Summary

This document outlines the complete migration from `AgentSelectSnackMessage` component to the new `customToast` utility across the entire AssignX project.

**Scope**: 142 files across all modules  
**Timeline**: 4-5 weeks  
**Complexity**: Medium (well-defined patterns)  
**Risk Level**: Low-Medium (mechanical changes, extensive testing needed)

---

## Current State Analysis

### Files Using AgentSelectSnackMessage: **142 files**

#### Distribution by Module:

| Module | File Count | Priority | Complexity |
|--------|-----------|----------|-----------|
| Dashboard | 35 | HIGH | Medium |
| Agency | 40 | HIGH | Medium |
| Admin | 15 | MEDIUM | Low |
| Onboarding | 30 | HIGH | High |
| TwilioHub | 12 | MEDIUM | Medium |
| Other | 10 | LOW | Low |

### Current Usage Patterns

#### Pattern 1: Simple Success (40% of files)
```javascript
// State
const [snackMsg, setSnackMsg] = useState("")

// Set message
setSnackMsg("Card added successfully")

// Render
<AgentSelectSnackMessage
  isVisible={snackMsg}
  hide={() => setSnackMsg("")}
  message={snackMsg}
  type={SnackbarTypes.Success}
/>
```

#### Pattern 2: Error Handling (35% of files)
```javascript
// State
const [snackMsg, setSnackMsg] = useState("")
const [errType, setErrType] = useState(null)

// Set error
setSnackMsg(error.message)
setErrType(SnackbarTypes.Error)

// Render
<AgentSelectSnackMessage
  isVisible={snackMsg}
  hide={() => setSnackMsg("")}
  message={snackMsg}
  type={errType}
/>
```

#### Pattern 3: Complex State Object (20% of files)
```javascript
// State
const [showSnack, setShowSnack] = useState({
  type: SnackbarTypes.Success,
  message: "",
  isVisible: false
})

// Set snack
setShowSnack({
  type: SnackbarTypes.Error,
  message: "Operation failed",
  isVisible: true
})

// Render
<AgentSelectSnackMessage
  isVisible={showSnack.isVisible}
  hide={() => setShowSnack({ ...showSnack, isVisible: false })}
  message={showSnack.message}
  type={showSnack.type}
/>
```

#### Pattern 4: Multiple Separate States (5% of files)
```javascript
// Multiple states
const [credentialsErr, setCredentialsErr] = useState(false)
const [addCardFailure, setAddCardFailure] = useState(false)
const [addCardSuccess, setAddCardSuccess] = useState(false)

// Separate renders for each
<AgentSelectSnackMessage isVisible={credentialsErr} hide={() => setCredentialsErr(false)} message="..." />
<AgentSelectSnackMessage isVisible={addCardFailure} hide={() => setAddCardFailure(false)} message="..." />
<AgentSelectSnackMessage isVisible={addCardSuccess} hide={() => setAddCardSuccess(false)} type={SnackbarTypes.Success} message="..." />
```

---

## Migration Strategy

### Phase 1: Preparation (Week 1)

#### Task 1.1: Complete File Audit
Create comprehensive list with classification:

```bash
# Generate list
grep -r "import.*AgentSelectSnackMessage" . > migration-files.txt

# Categorize by usage pattern
# 1. Simple state (setSnackMsg)
# 2. Complex state (showSnack object)
# 3. Multiple states
```

#### Task 1.2: Verify customToast Implementation
Check `lib/custom-toast.js`:
- ✅ Has success(), error(), warning(), info() methods
- ✅ Matches duration (4000ms)
- ✅ Uses correct icons
- ⚠️ No loading() method yet (if needed, add it)

#### Task 1.3: Create Migration Scripts
Optional automation for pattern replacement:
```bash
# Script to find common patterns
find_snack_state.sh  # Find useState declarations
find_snack_jsx.sh    # Find JSX usage
```

---

### Phase 2: Incremental Migration by Module (Weeks 2-4)

#### Module 1: Dashboard/myagentX (15 files)
**Priority**: HIGH - Core user functionality

**Files to migrate:**
```
components/dashboard/myagentX/WebAgentModal.js
components/dashboard/myagentX/VoiceMailTab.js
components/dashboard/myagentX/UserCallender.js
components/dashboard/myagentX/PiepelineAdnStage.js
components/dashboard/myagentX/NoAgent.js
components/dashboard/myagentX/NewSmartListModal.js
components/dashboard/myagentX/Knowledgebase.js
components/dashboard/myagentX/EmbedSmartListModal.js
components/dashboard/myagentX/EmbedModal.js
components/dashboard/myagentX/EditVoicemailModal.js
components/dashboard/myagentX/ClaimNumber.js
components/dashboard/myagentX/CalenderModal.js
components/dashboard/myagentX/AllSetModal.js
components/dashboard/myagentX/AddVoiceMail.js
components/dashboard/myagentX/mcp/MCPView.js
```

**Migration Example** (`webAgentModal.js`):
```diff
- import AgentSelectSnackMessage, { SnackbarTypes } from '../leads/AgentSelectSnackMessage'
+ import { customToast as toast } from "@/lib/custom-toast"

- const [snackMsg, setSnackMsg] = useState("")
- const [snackType, setSnackType] = useState(null)

  // In function:
- setSnackMsg("Agent saved successfully")
- setSnackType(SnackbarTypes.Success)
+ toast.success("Agent saved successfully")

  // In JSX (REMOVE):
- <AgentSelectSnackMessage
-   isVisible={snackMsg}
-   hide={() => setSnackMsg("")}
-   message={snackMsg}
-   type={snackType}
- />
```

#### Module 2: Dashboard/leads (6 files)
**Priority**: HIGH

```
components/dashboard/leads/Leads1.js
components/dashboard/leads/AssignLead.js
components/dashboard/leads/Userleads.js
components/dashboard/leads/extras/LeadDetails.js
components/dashboard/leads/assignLeadSlideAnimation/AssignLead.js
components/dashboard/leads/assignLeadSlideAnimation/LastStep.js
```

#### Module 3: Dashboard/subaccount (5 files)
**Priority**: MEDIUM

```
components/dashboard/subaccount/myAccount/SubAccountBilling.js
components/dashboard/subaccount/myAccount/SubAccountBarServices.js
components/dashboard/subaccount/myAccount/SubAccountInviteAgentX.js
components/dashboard/subaccount/myAccount/SubAccountMyPhoneNumber.js
components/dashboard/subaccount/myAccount/SubAccountPlansAndPayments.js
```

#### Module 4: Agency Components (40 files)
**Priority**: HIGH

Break down into submodules:
- `agency/subaccount/` (8 files)
- `agency/plan/` (3 files)
- `agency/myAccount/` (5 files)
- `agency/integrations/` (4 files)
- etc.

#### Module 5: Onboarding (30 files)
**Priority**: HIGH - User acquisition

Complex due to multiple agent signup flows:
- General agents
- Specialized agents (real estate, insurance, etc.)
- Mobile/desktop variants

#### Module 6: Other Components
**Priority**: Varies
- Payment/user plans
- Auth components
- Pipeline configuration

---

### Phase 3: Testing (Week 4)

#### 3.1 Per-File Testing
For each migrated file:
```javascript
// Test checklist
☐ Import statement updated
☐ State variables removed
☐ Toast methods called with correct type
☐ JSX component removed
☐ No console errors
☐ Toast displays correctly
☐ Toast auto-dismisses
☐ Correct icon shown
```

#### 3.2 Integration Testing
Critical user flows:
1. **User Registration/Onboarding**
   - Create account
   - Select plan
   - Add payment method
   - Verify toasts at each step

2. **Dashboard Operations**
   - Create agent
   - Configure agent
   - Add integrations
   - Manage leads

3. **Agency Operations**
   - Create subaccount
   - Configure pricing
   - Manage teams
   - View reports

4. **Admin Operations**
   - View users
   - Manage pipelines
   - Review integrations

#### 3.3 Linting & Type Checking
```bash
npm run lint        # Fix all errors
npm run type-check  # Ensure no TypeScript errors
```

#### 3.4 Chrome DevTools Validation
```bash
# Validate UI changes
# Check toast positioning
# Verify accessibility
```

---

### Phase 4: Cleanup & Deployment (Week 5)

#### 4.1 Remove Unused Code
```bash
# Delete old component
rm components/dashboard/leads/AgentSelectSnackMessage.js

# Verify no imports remain
grep -r "AgentSelectSnackMessage" .
```

#### 4.2 Final Build & Test
```bash
npm run build      # Must succeed
npm run test       # All tests pass
```

#### 4.3 Documentation
Update:
- `AGENTS.md` - Add customToast usage examples
- `planning/TOAST_MIGRATION_ROADMAP.md` - Mark complete
- Create `docs/toast-usage.md` - New developer guide

---

## Detailed File-by-File Checklist

### Template for Each File Migration

```markdown
## components/[module]/[file].js

### Current State
- [ ] Import statement found
- [ ] State variables identified
- [ ] Usage pattern identified
- [ ] JSX component found

### Migration Steps
1. [ ] Replace import
2. [ ] Remove state declarations
3. [ ] Replace state setters with toast calls
4. [ ] Remove JSX component
5. [ ] Test locally
6. [ ] Commit migration

### Testing
- [ ] Toast displays correctly
- [ ] Correct type/icon
- [ ] Auto-dismisses
- [ ] No errors in console
```

---

## Common Patterns to Replace

### Pattern A: Simple Message
**Before:**
```javascript
const [msg, setMsg] = useState("")

setMsg("Success!")
setMsgType(SnackbarTypes.Success)

<AgentSelectSnackMessage isVisible={msg} hide={() => setMsg("")} message={msg} type={msgType} />
```

**After:**
```javascript
// State removed

toast.success("Success!")

// JSX removed
```

### Pattern B: Error Handling
**Before:**
```javascript
const [error, setError] = useState("")
const [errorType, setErrorType] = useState(null)

try {
  // ...
} catch (e) {
  setError(e.message)
  setErrorType(SnackbarTypes.Error)
}

<AgentSelectSnackMessage isVisible={error} hide={() => setError("")} message={error} type={errorType} />
```

**After:**
```javascript
// State removed

try {
  // ...
} catch (e) {
  toast.error(e.message)
}

// JSX removed
```

### Pattern C: Success After Async
**Before:**
```javascript
const [success, setSuccess] = useState(false)

const handleSubmit = async () => {
  const response = await api.post(...)
  if (response.success) {
    setSuccess(true)
  }
}

{success && (
  <AgentSelectSnackMessage isVisible={success} hide={() => setSuccess(false)} message="Done!" type={SnackbarTypes.Success} />
)}
```

**After:**
```javascript
const handleSubmit = async () => {
  const response = await api.post(...)
  if (response.success) {
    toast.success("Done!")
  }
}

// JSX removed
```

### Pattern D: Multiple States
**Before:**
```javascript
const [addCardFailure, setAddCardFailure] = useState(false)
const [addCardSuccess, setAddCardSuccess] = useState(false)

setAddCardSuccess(true)  // After success
setAddCardFailure(true) // After failure

<AgentSelectSnackMessage isVisible={addCardSuccess} hide={() => setAddCardSuccess(false)} type={SnackbarTypes.Success} message="Card added" />
<AgentSelectSnackMessage isVisible={addCardFailure} hide={() => setAddCardFailure(false)} message="Failed to add card" />
```

**After:**
```javascript
// All state removed

toast.success("Card added")  // After success
toast.error("Failed to add card")  // After failure

// Both JSX components removed
```

---

## Risk Mitigation

### Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Merge conflicts | Medium | Medium | Migrate by module, small PRs |
| Lost toast messages | Low | High | Thorough testing, backup old code |
| Complex state bugs | Low | Medium | Review complex files individually |
| Performance issues | Low | Low | Sonner is lightweight |
| User confusion | Very Low | Low | Toast behavior is standard |

---

## Success Metrics

### Quantitative
- ✅ 142 files migrated
- ✅ Zero AgentSelectSnackMessage imports remaining
- ✅ ~2500 lines of code removed (state + JSX)
- ✅ ~500 lines of code added (imports + calls)
- ✅ Net reduction: ~2000 lines
- ✅ Build time improvement (fewer components)

### Qualitative
- ✅ Simpler, cleaner code
- ✅ Better UX (stacking toasts, animations)
- ✅ Easier maintenance
- ✅ Single source of truth
- ✅ No functionality lost

---

## Timeline Summary

| Week | Focus | Deliverables |
|------|-------|-------------|
| 1 | Preparation | Audit complete, scripts ready, customToast verified |
| 2 | Dashboard modules | 30 files migrated, tested |
| 3 | Agency & Admin | 40 files migrated, tested |
| 4 | Onboarding & Others | 40 files migrated, final testing |
| 5 | Cleanup & Deploy | Old code removed, docs updated, deployed |

---

## Rollback Plan

If critical issues arise:

1. **Immediate Rollback**: Revert PR, keep old code
2. **Partial Rollback**: Revert specific module only
3. **Quick Fix**: Fix critical files without full revert

**Code Retention**: Keep `AgentSelectSnackMessage.js` in a backup branch for 2 months before deleting.

---

## Next Steps

1. ✅ Review and approve this roadmap
2. ⏳ Begin Phase 1: File audit
3. ⏳ Start Phase 2: Begin with dashboard module
4. ⏳ Track progress in project management tool
5. ⏳ Weekly sync meetings to review progress

---

## Questions?

- Should we add `toast.loading()` for long-running operations?
- Any specific modules we should prioritize or avoid?
- Timeline adjustments needed?

---

**Status**: ROADMAP READY FOR IMPLEMENTATION  
**Last Updated**: [Current Date]  
**Owner**: Development Team  
**Reviewers**: Tech Lead, Product Manager

