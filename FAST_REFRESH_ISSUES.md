# Fast Refresh Issues Found

This document lists all components that violate Next.js Fast Refresh rules, which can cause full page reloads instead of hot module replacement.

## Issues Found

### 1. Components with camelCase Names (Should be PascalCase)

#### ❌ `components/admin/users/SelectedUser/page.js`

- **Issue**: Component function is named `page` (lowercase) instead of `Page` (PascalCase)
- **Current Code**:

```4:10:agentxSaasWeb/components/admin/users/SelectedUser/page.js
function page() {
  return (
    <div>
       hello
    </div>
  )
}

export default page
```

- **Fix**: Rename function to `Page` (PascalCase)

---

### 2. Files Exporting Both Components AND Other Exports

Fast Refresh requires that files exporting React components should ONLY export React components. If you need to export other things (constants, utilities, etc.), move them to a separate file.

#### ❌ `components/dashboard/leads/AgentSelectSnackMessage.js`

- **Issue**: Exports both a default React component AND a named constant `SnackbarTypes`
- **Current Code**:

```6:14:agentxSaasWeb/components/dashboard/leads/AgentSelectSnackMessage.js
export const SnackbarTypes = {
  Error: "Error",
  Warning: "Warning",
  Success: "Success",
  Loading: "Loading"
};

const DefaultMessage = null;
export default function AgentSelectSnackMessage({
```

- **Fix**: Move `SnackbarTypes` to a separate constants file (e.g., `constants/SnackbarTypes.js`)

#### ❌ `components/constants/constants.js`

- **Issue**: Exports both React components (`UpgradeTag`, `UpgradeTagWithModal`) AND constants/utility functions
- **Current Code**: This file exports:
  - Constants: `KycCategory`, `SnackMessageTitles`, `BatchStatus`, `stagesDropdown`
  - Utility functions: `checkCurrentUserRole`, `copyAgencyOnboardingLink`, `getUserLocalData`
  - React components: `UpgradeTag`, `UpgradeTagWithModal`
- **Fix**:
  - Move React components to separate files (e.g., `components/upgrade/UpgradeTag.js`)
  - Keep constants and utilities in this file, but don't export React components from it

---

## Summary

| File                                                    | Issue Type                                         | Severity |
| ------------------------------------------------------- | -------------------------------------------------- | -------- |
| `components/admin/users/SelectedUser/page.js`           | camelCase component name                           | High     |
| `components/dashboard/leads/AgentSelectSnackMessage.js` | Mixed exports (component + constants)              | Medium   |
| `components/constants/constants.js`                     | Mixed exports (components + constants + utilities) | High     |

## Recommended Actions

1. **Rename `page` to `Page`** in `components/admin/users/SelectedUser/page.js`
2. **Extract `SnackbarTypes`** from `AgentSelectSnackMessage.js` to a separate constants file
3. **Extract React components** from `constants.js` to separate component files

These changes will ensure Fast Refresh works properly and you'll get instant updates without full page reloads.
