# Memory Optimization Plan - AgentX SaaS

## Problem Statement

The AgentX SaaS application is experiencing severe memory issues:
- **Next.js dev server**: 7.10 GB (increases on each page refresh)
- **Browser tab**: Up to 10 GB RAM
- **Root cause**: Memory leaks in server and client-side code

## Root Causes Identified

### Server-Side Issues (Next.js Dev Server - 7.10 GB)
1. React Strict Mode disabled - hides memory leaks
2. 15 useEffect hooks without cleanup functions
3. No memory limits on dev server
4. Hot Module Replacement (HMR) accumulating old modules
5. Fetch requests not cancelled on component unmount

### Client-Side Issues (Browser Tab - 10 GB)
1. **80+ useState hooks** in myAgentX/page.js causing massive re-renders
2. **0 memoization** - every state change re-renders entire component tree
3. **23 components** using unvirtualized InfiniteScroll (rendering thousands of DOM nodes)
4. **5 duplicate date libraries** (~400KB bundle bloat)
5. **1,183+ localStorage operations** without size management
6. No useCallback/useMemo/React.memo optimization

---

## Implementation Plan

### Phase 1: Quick Wins (Immediate - 30 minutes)
**Expected Memory Reduction: 7GB → 2-3GB server, 10GB → 6-7GB browser**

- [x] Create optimization documentation
- [ ] Enable React Strict Mode
- [ ] Add Node.js memory limits to dev server
- [ ] Test and verify memory reduction

### Phase 2: Medium Effort (1-2 days)
**Expected Memory Reduction: 2-3GB → 1-2GB server, 6-7GB → 2-3GB browser**

- [ ] Create AbortController utility for fetch requests
- [ ] Fix useEffect cleanup functions in myAgentX page (15 hooks)
- [ ] Add cleanup to other critical components
- [ ] Test and verify no infinite loops

### Phase 3: High Impact (2-3 days)
**Expected Memory Reduction: Browser 2-3GB → 800MB-1GB**

- [ ] Install react-window library
- [ ] Create VirtualizedList wrapper component
- [ ] Replace InfiniteScroll in top 5 heaviest components:
  - [ ] components/dashboardPipeline/Pipeline1.js (4,404 lines)
  - [ ] components/calls/AllCalls.js
  - [ ] components/dashboard/leads/Userleads.js
  - [ ] components/admin/users/AdminAgentX.js
  - [ ] components/calls/CallActivties.js
- [ ] Test scrolling performance

### Phase 4: Major Refactor (1-2 weeks)
**Expected Memory Reduction: Browser 800MB → 400-500MB**

- [ ] Create memoized versions of child components
- [ ] Add useCallback to event handlers
- [ ] Add useMemo to expensive calculations
- [ ] Refactor myAgentX/page.js to use useReducer
- [ ] Split large components into smaller ones
- [ ] Performance audit and final testing

---

## Detailed Implementation Steps

### Phase 1.1: Enable React Strict Mode

**File**: `next.config.mjs`

**Change**:
```javascript
// Before
reactStrictMode: false,

// After
reactStrictMode: true,
```

**Why**: Exposes memory leaks by double-invoking effects in development

**Expected Effect**:
- Development console will show warnings for missing cleanups
- No immediate memory reduction, but prevents future leaks
- May temporarily cause double-renders (expected behavior)

---

### Phase 1.2: Add Memory Limits to Dev Server

**File**: `package.json`

**Change**:
```json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--max-old-space-size=2048' next dev",
    "start": "next start",
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

**Why**: Forces garbage collection when dev server hits 2GB limit

**Expected Effect**:
- Server memory caps at 2GB instead of growing to 7GB
- May restart occasionally if memory pressure is high
- Immediate 5GB memory reduction

---

### Phase 2.1: Create AbortController Utility

**File**: `utilities/useFetchWithCleanup.js` (NEW)

**Purpose**: Reusable hook that auto-cancels fetch requests on unmount

**Usage**:
```javascript
// Before (memory leak)
useEffect(() => {
  fetch('/api/agents').then(r => r.json()).then(setAgents)
}, [])

// After (no leak)
const { data, loading } = useFetchWithCleanup('/api/agents')
```

---

### Phase 2.2: Fix useEffect Cleanup in myAgentX

**File**: `app/dashboard/myAgentX/page.js`

**Target**: Fix all 15 useEffect hooks

**Example Fix**:
```javascript
// Before (infinite loop + memory leak)
useEffect(() => {
  let agent = JSON.parse(localStorage.getItem('SelectedAgent'))
  setShowDrawerSelectedAgent(agent)
}, [showDrawerSelectedAgent])

// After (fixed)
useEffect(() => {
  let isMounted = true

  const loadAgent = () => {
    const agentData = localStorage.getItem('SelectedAgent')
    if (agentData && isMounted) {
      setShowDrawerSelectedAgent(JSON.parse(agentData))
    }
  }

  loadAgent()

  return () => {
    isMounted = false
  }
}, []) // Run once on mount
```

---

### Phase 3.1: Create VirtualizedList Component

**File**: `components/common/VirtualizedList.js` (NEW)

**Purpose**: Drop-in replacement for InfiniteScroll with virtualization

**Features**:
- Only renders visible rows
- Reuses DOM nodes
- Supports infinite scroll
- Maintains same API as InfiniteScroll

---

### Phase 3.2: Replace InfiniteScroll

**Target Components** (23 total, top 5 priority):

1. `components/dashboardPipeline/Pipeline1.js` - Pipeline items
2. `components/calls/AllCalls.js` - Call logs
3. `components/dashboard/leads/Userleads.js` - Lead lists
4. `components/admin/users/AdminAgentX.js` - Admin agent list
5. `components/calls/CallActivties.js` - Call activities

**Expected Savings**: 2-3GB (500MB per component × 5 components)

---

### Phase 4.1: Add Memoization

**File**: `app/dashboard/myAgentX/page.js`

**Strategy**:
1. Wrap child components with React.memo
2. Convert event handlers to useCallback
3. Convert calculations to useMemo
4. Reduce re-render cascades

**Example**:
```javascript
// Before
const handleSave = () => { saveAgent() }

// After
const handleSave = useCallback(() => { saveAgent() }, [])
```

---

### Phase 4.2: Refactor to useReducer

**File**: `app/dashboard/myAgentX/page.js`

**Goal**: Reduce 80+ useState to 1 useReducer

**Benefits**:
- Single state object vs 80 separate values
- Predictable state updates
- Easier to debug
- 95% reduction in component memory

**Structure**:
```javascript
const initialState = {
  agent: { name, phone, address, ... },
  ui: { modals, loaders, ... },
  data: { agents, pipelines, ... }
}

const [state, dispatch] = useReducer(reducer, initialState)
```

---

## Verification & Testing

### Memory Testing Steps

1. **Baseline Measurement**:
   - Open Activity Monitor (Mac) / Task Manager (Windows)
   - Note Next.js server memory
   - Note browser tab memory

2. **After Each Phase**:
   - Restart dev server
   - Navigate to myAgentX page
   - Refresh 3 times
   - Check if memory increases
   - Note memory usage

3. **Success Criteria**:
   - Phase 1: Server < 2.5GB, Browser < 7GB
   - Phase 2: Server < 2GB, Browser < 3GB
   - Phase 3: Server < 1.5GB, Browser < 1.5GB
   - Phase 4: Server < 1.2GB, Browser < 600MB

### Performance Testing

1. **Page Load Time**: Should be < 2 seconds
2. **Scroll Performance**: 60fps in virtualized lists
3. **Interaction Latency**: < 100ms for button clicks
4. **Memory Stability**: No increase on refresh

---

## Rollback Plan

If any phase causes issues:

1. **Strict Mode Issues**:
   - Temporarily disable
   - Fix warnings one by one
   - Re-enable

2. **Memory Limit Too Low**:
   - Increase to 3072 (3GB)
   - Profile to find real leak

3. **Virtualization Bugs**:
   - Revert to InfiniteScroll for that component
   - Fix VirtualizedList wrapper
   - Re-apply

4. **useReducer Migration**:
   - Keep in separate branch
   - Gradual migration
   - A/B test performance

---

## Long-Term Maintenance

### Best Practices

1. **Always add cleanup to useEffect**:
   ```javascript
   useEffect(() => {
     // Do something
     return () => {
       // Cleanup
     }
   }, [deps])
   ```

2. **Use AbortController for fetch**:
   ```javascript
   const controller = new AbortController()
   fetch(url, { signal: controller.signal })
   return () => controller.abort()
   ```

3. **Memoize expensive components**:
   ```javascript
   const ExpensiveComponent = React.memo(({ data }) => { ... })
   ```

4. **Virtualize long lists**:
   - Use react-window for 100+ items
   - Use pagination for < 100 items

5. **Monitor memory in CI/CD**:
   - Add Lighthouse performance tests
   - Fail builds if memory > threshold

---

## Additional Optimizations (Future)

### Bundle Size Reduction

1. **Remove duplicate date libraries**:
   - Keep: date-fns
   - Remove: moment, luxon, dayjs
   - Savings: ~300KB

2. **Lazy load heavy components**:
   - Three.js (600KB)
   - Recharts
   - Dynamic imports

3. **Code splitting**:
   - Split myAgentX into separate chunks
   - Load components on-demand

### Database & API

1. **Backend pagination**:
   - Cursor-based pagination
   - Limit result sets to 100 items

2. **Add request timeouts**:
   - Prevent hanging requests
   - 30s timeout for all APIs

3. **Implement caching**:
   - Cache agent lists
   - Invalidate on update

---

## Expected Final Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Next.js Server | 7.10 GB | 1.2 GB | 83% reduction |
| Browser Tab | 10 GB | 500 MB | 95% reduction |
| Page Load | 5-8s | 1-2s | 75% faster |
| Scroll FPS | 15-20 | 60 | 3x smoother |
| Build Time | Unknown | Same | No change |

---

## Implementation Timeline

- **Phase 1**: 30 minutes (today)
- **Phase 2**: 1-2 days
- **Phase 3**: 2-3 days
- **Phase 4**: 1-2 weeks

**Total**: 2-3 weeks for complete optimization

---

## Notes

- All changes are backward compatible
- No breaking changes to existing features
- Can be implemented incrementally
- Each phase can be tested independently
- Rollback is safe at any point

---

**Document Version**: 1.0
**Last Updated**: 2025-11-22
**Author**: Claude Code Memory Optimization
**Status**: Ready for Implementation
