# Migration Roadmap: AgentSelectSnackMessage → customToast

## Context

The project currently uses `AgentSelectSnackMessage` component for displaying snackbar/toast notifications across the entire codebase. We want to migrate to using the new `customToast` utility from `@/lib/custom-toast` which provides a simpler API and better user experience via Sonner toasts.

## Current State Analysis

### Files Using AgentSelectSnackMessage: **142 files**
- Components throughout the app (dashboard, agency, admin, onboarding, etc.)
- Import pattern: `import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage'`
- Usage pattern requires state management:
  ```javascript
  const [snackMsg, setSnackMsg] = useState("")
  const [snackType, setSnackType] = useState(null)
  
  // Then render:
  <AgentSelectSnackMessage
    isVisible={snackMsg}
    hide={() => setSnackMsg("")}
    message={snackMsg}
    type={snackType}
  />
  ```

### New customToast API
- Import pattern: `import { customToast as toast } from "@/lib/custom-toast"`
- Direct method calls: `toast.success(message)`, `toast.error(message)`, `toast.warning(message)`, `toast.info(message)`
- No state management required
- Automatic dismiss after 4 seconds

## Objectives & Success Criteria

### Primary Goals
1. **Consistency**: All notification messages use the new `customToast` API
2. **Code Reduction**: Remove unnecessary state management code (~800-1000 lines total)
3. **Better UX**: Toast notifications via Sonner (better positioning, animations, stacking)
4. **Maintainability**: Single source of truth for notifications
5. **Zero Breaking Changes**: All functionality preserved

### Success Metrics
- ✅ All 142 files migrated
- ✅ Zero usages of AgentSelectSnackMessage remaining
- ✅ All test cases passing
- ✅ No linter errors
- ✅ Improved code readability (simpler calls)

## Migration Strategy

### Phase 1: Preparation & Assessment (Week 1)

#### 1.1 Audit Current Usage
- [ ] Generate complete list of 142 files using AgentSelectSnackMessage
- [ ] Categorize usage patterns:
  - Simple success/error messages (90% of cases)
  - Complex state management (setSnackMsg, hide callbacks)
  - SnackbarTypes.Success, SnackbarTypes.Error, SnackbarTypes.Warning, SnackbarTypes.Loading
- [ ] Identify edge cases requiring special attention

#### 1.2 Update customToast (if needed)
Review current implementation in `lib/custom-toast.js`:
- [ ] Ensure all 4 types supported: success, error, warning, info
- [ ] Verify icons match project requirements
- [ ] Confirm duration (4000ms) is acceptable
- [ ] Add `loading` type if SnackbarTypes.Loading is used significantly

#### 1.3 Create Migration Utilities
Create helper scripts for bulk operations:
- [ ] Script to identify state variables: `snackMsg`, `setSnackMsg`, `snackType`, `setSnackType`, `showSnack`, `errorMsg`, etc.
- [ ] Script to identify AgentSelectSnackMessage render patterns
- [ ] Script to generate migration candidates (files with simple usage)

### Phase 2: Incremental Migration (Weeks 2-3)

#### 2.1 Create Migration Branches
- [ ] Create feature branches by module:
  - `migration/toast-dashboard`
  - `migration/toast-agency`
  - `migration/toast-admin`
  - `migration/toast-onboarding`
  - `migration/toast-components`
  - `migration/toast-twiliohub`

#### 2.2 Migrate by Category

**Category 1: Simple Success Messages (~50 files)**
Files with pattern:
```javascript
setSnackMsg("Success message")
setSnackType(SnackbarTypes.Success)
```
Replace with: `toast.success("Success message")`

**Category 2: Simple Error Messages (~40 files)**
Files with pattern:
```javascript
setSnackMsg(errorMessage)
setSnackType(SnackbarTypes.Error)
```
Replace with: `toast.error(errorMessage)`

**Category 3: Simple Warning Messages (~20 files)**
Files with pattern:
```javascript
setSnackMsg("Warning message")
setSnackType(SnackbarTypes.Warning)
```
Replace with: `toast.warning("Warning message")`

**Category 4: Complex State Management (~30 files)**
Files requiring full refactor:
- Remove useState declarations
- Remove hide callback functions
- Update event handlers to call toast methods directly
- Remove JSX component rendering

#### 2.3 Migration Template for Each File

**Before:**
```javascript
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage'

// State declaration
const [snackMsg, setSnackMsg] = useState("")
const [errType, setErrType] = useState(null)

// In function/event handler
setSnackMsg("Card added successfully")
setErrType(SnackbarTypes.Success)

// In JSX
<AgentSelectSnackMessage
  isVisible={snackMsg}
  hide={() => setSnackMsg("")}
  message={snackMsg}
  type={errType}
/>
```

**After:**
```javascript
import { customToast as toast } from "@/lib/custom-toast"

// State removed (no longer needed)

// In function/event handler
toast.success("Card added successfully")

// JSX removed (no component rendering)
```

### Phase 3: Specific Module Migrations

#### 3.1 Dashboard Components (35 files)
Priority: HIGH - Core user experience
- `components/dashboard/leads/` (6 files)
- `components/dashboard/myagentX/` (12 files)
- `components/dashboard/subaccount/` (5 files)
- `components/dashboard/teams/` (1 file)
- `components/dashboard/Navbar/` (3 files)

#### 3.2 Agency Components (40 files)
Priority: HIGH - Business critical
- `components/agency/subaccount/` (8 files)
- `components/agency/plan/` (3 files)
- `components/agency/myAccount/` (5 files)
- `components/agency/integrations/` (4 files)
- `components/agency/dashboard/` (1 file)
- Plus related files

#### 3.3 Admin Components (15 files)
Priority: MEDIUM - Administrative tools
- `components/admin/users/` (15 files)
- Various admin views

#### 3.4 Onboarding Flow (30 files)
Priority: HIGH - User acquisition
- `components/onboarding/` (multiple subdirectories)
- Agent signup flows
- Mobile/desktop variants

#### 3.5 TwilioHub Components (12 files)
Priority: MEDIUM - Integration specific
- `components/twiliohub/` (various subdirectories)

#### 3.6 Other Components (10 files)
Priority: VARIES
- Payment/user plans
- Pipeline configuration
- Auth components

### Phase 4: Testing & Validation (Week 4)

#### 4.1 Unit Testing
- [ ] Test each migrated component manually
- [ ] Verify toast displays correctly
- [ ] Verify toast auto-dismisses after 4 seconds
- [ ] Verify correct icon displays (success/error/warning/info)

#### 4.2 Integration Testing
- [ ] Test critical user flows:
  - User registration/onboarding
  - Plan selection and payment
  - Dashboard operations
  - Agency operations
  - Admin operations

#### 4.3 Linter & Type Check
- [ ] Run `npm run lint`
- [ ] Fix all lint errors
- [ ] Ensure TypeScript strictness maintained
- [ ] No `any` types introduced

#### 4.4 Chrome DevTools Validation
- [ ] Validate UI changes with Chrome DevTools MCP server
- [ ] Verify toast positioning
- [ ] Verify accessibility (ARIA attributes)

### Phase 5: Cleanup & Deployment (Week 5)

#### 5.1 Remove Unused Code
- [ ] Delete `AgentSelectSnackMessage.js` file
- [ ] Remove `SnackbarTypes` export from everywhere
- [ ] Clean up unused state variables (auto via linter)
- [ ] Verify no circular dependencies

#### 5.2 Documentation
- [ ] Update contributing guidelines
- [ ] Document customToast API usage
- [ ] Add migration guide for future contributors
- [ ] Update AGENTS.md with new pattern

#### 5.3 Final Validation
- [ ] Full build: `npm run build`
- [ ] Full test suite: `npm run test`
- [ ] Production-ready check
- [ ] Performance check (no regressions)

## Implementation Details

### Mapping SnackbarTypes to customToast

| Old Pattern | New Pattern |
|-------------|-------------|
| `SnackbarTypes.Success` | `toast.success(message)` |
| `SnackbarTypes.Error` | `toast.error(message)` |
| `SnackbarTypes.Warning` | `toast.warning(message)` |
| `SnackbarTypes.Loading` | `toast.info(message)` or implement loading toast if needed |

### Common State Variables to Remove

Look for and remove these patterns:
- `const [snackMsg, setSnackMsg] = useState("")`
- `const [snackType, setSnackType] = useState(null)`
- `const [showSnack, setShowSnack] = useState({ type, message, isVisible })`
- `const [errorMsg, setErrorMsg] = useState("")`
- `const [credentialsErr, setCredentialsErr] = useState(false)`
- `const [addCardFailure, setAddCardFailure] = useState(false)`
- `const [addCardSuccess, setAddCardSuccess] = useState(false)`

### JSX to Remove

Find and remove all instances of:
```jsx
<AgentSelectSnackMessage
  isVisible={...}
  hide={() => ...}
  message={...}
  type={...}
/>
```

## Risks & Mitigations

### Risk 1: Multiple Simultaneous Migrations
**Impact**: Merge conflicts
**Mitigation**: Migrate by module, one branch at a time, merge frequently

### Risk 2: Complex State Dependencies
**Impact**: Some files may have interconnected state
**Mitigation**: Thorough code review, test each file individually before moving to next

### Risk 3: Different Message Types
**Impact**: loading type not available in customToast
**Mitigation**: Add loading toast support to customToast.js if needed

### Risk 4: Toast Positioning Conflicts
**Impact**: z-index or positioning issues
**Mitigation**: Test thoroughly with Chrome DevTools MCP server, adjust Sonner configuration if needed

### Risk 5: Regression in User Experience
**Impact**: Users may notice different toast behavior
**Mitigation**: 
- Sonner toasts are actually better UX (stacking, smooth animations)
- Ensure message content and timing remain consistent

## Rollout Plan

### Week 1: Assessment
- Complete audit
- Update customToast if needed
- Create migration scripts

### Week 2: Pilot Migration (10 files)
- Start with dashboard/myagentX (highest usage)
- Validate approach
- Get team feedback

### Week 3: Continue Migration
- Dashboard components complete
- Agency components start

### Week 4: Complete & Test
- All modules migrated
- Comprehensive testing

### Week 5: Cleanup & Deploy
- Remove old code
- Documentation
- Production deployment

## Success Checklist

### Before Migration
- [x] `customToast` implementation complete
- [ ] All usage identified
- [ ] Migration strategy documented

### During Migration
- [ ] Each file migrated individually
- [ ] Each file tested after migration
- [ ] No breaking changes introduced

### After Migration
- [ ] All 142 files migrated
- [ ] AgentSelectSnackMessage.js deleted
- [ ] All tests passing
- [ ] Build successful
- [ ] No lint errors
- [ ] Documentation updated

## Notes

- Estimated total lines of code to remove: ~2000-3000 lines (state declarations + JSX)
- Estimated total lines of code to add: ~500 lines (import statements + toast calls)
- Net code reduction: ~1500-2500 lines
- Migration complexity: Medium (well-defined patterns, mostly mechanical)
- Time estimate: 4-5 weeks for safe, thorough migration
