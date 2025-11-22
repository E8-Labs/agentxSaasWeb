Validate that the component/page at `$ARGUMENTS` matches its Figma design perfectly.

Parse arguments to extract:

- Implementation location (route path or component name)
- Figma URL (if provided, otherwise prompt for it)

Follow these steps:

## SETUP

1. Parse `$ARGUMENTS` to identify:
   - Implementation path (e.g., `/dashboard`, `components/Header.tsx`)
   - Figma URL (if included)
2. If Figma URL not provided, ask: "Please provide the Figma URL for this design"
3. Ensure dev server is running: `npm run dev`
4. Confirm implementation exists and loads without errors

## EXTRACT FIGMA SPECIFICATIONS

1. Use Figma MCP server to extract from the Figma URL:
   - Frame dimensions (width, height)
   - Colors used in the design
   - Typography specifications
   - Spacing values
   - Component structure
   - Interactive states defined
2. Document extracted values:
   ```
   Figma Specifications:
   - Dimensions: [width]x[height]
   - Primary colors: [list]
   - Font sizes: [list]
   - Key spacing: [list]
   ```

## CAPTURE IMPLEMENTATION SCREENSHOTS

Using Playwright MCP, capture the implementation:

1. **Set viewport to match Figma frame**:

   ```javascript
   await page.setViewportSize({
     width: [figmaWidth],
     height: [figmaHeight],
   })
   await page.goto('http://localhost:3000/[route]')
   ```

2. **Capture default state**:

   ```javascript
   await page.screenshot({
     path: 'validation/implementation-default.png',
     fullPage: true,
   })
   ```

3. **Capture dark mode**:

   ```javascript
   await page.emulateMedia({ colorScheme: 'dark' })
   await page.screenshot({
     path: 'validation/implementation-dark.png',
   })
   ```

4. **Capture interactive states**:
   - Hover states for all buttons/links
   - Focus states for all inputs
   - Active/pressed states
   - Open states for dropdowns/modals

5. **Capture responsive versions**:

   ```javascript
   const breakpoints = [
     { name: 'mobile', width: 375, height: 812 },
     { name: 'tablet', width: 768, height: 1024 },
     { name: 'desktop', width: 1440, height: 900 },
   ]

   for (const bp of breakpoints) {
     await page.setViewportSize(bp)
     await page.screenshot({
       path: `validation/implementation-${bp.name}.png`,
     })
   }
   ```

## STRUCTURAL VALIDATION

Analyze the DOM structure and component hierarchy:

1. **Extract DOM structure from implementation**:

   ```javascript
   const structure = await page.evaluate(() => {
     function getStructure(element, depth = 0) {
       const children = Array.from(element.children)
       return {
         tag: element.tagName,
         className: element.className,
         childCount: children.length,
         textContent: element.textContent?.substring(0, 50),
         children: children.map((child) => getStructure(child, depth + 1)),
       }
     }
     return getStructure(document.querySelector('[data-testid="main"]'))
   })
   ```

2. **Compare component hierarchy**:
   - Verify parent-child relationships match Figma
   - Check nesting levels are correct
   - Ensure components are in the right containers
   - Validate layout direction (row vs column)

3. **Validate relative positioning**:

   ```javascript
   const positions = await page.evaluate(() => {
     const elements = document.querySelectorAll('[data-testid]')
     return Array.from(elements).map((el) => {
       const rect = el.getBoundingClientRect()
       return {
         id: el.dataset.testid,
         top: rect.top,
         left: rect.left,
         width: rect.width,
         height: rect.height,
         // Check relative positions
         parent: el.parentElement?.dataset?.testid,
       }
     })
   })
   ```

4. **Visual difference detection**:
   - Load both Figma export and implementation screenshot
   - Check major layout patterns:
     - [ ] Are cards in the same arrangement?
     - [ ] Is content grouped the same way?
     - [ ] Are elements in the same visual hierarchy?
     - [ ] Do flex directions match (row vs column)?

## AI-POWERED VISUAL COMPARISON

**IMPORTANT**: Use the captured screenshots for visual comparison:

1. **Analyze both screenshots** (Figma export and implementation):

   ```
   Compare the overall composition:
   - Card arrangements and groupings
   - Visual hierarchy and information flow
   - Relative sizes and proportions
   - Spacing between major sections
   ```

2. **Document structural differences**:

   ```markdown
   ## Structural Differences Found

   ### Card Layout

   - Figma: Banner image inside Usage card
   - Implementation: Banner as separate element
   - Action: Nest banner within Usage card container

   ### Component Positioning

   - Figma: Mins Balance at bottom of Usage card
   - Implementation: Mins Balance in separate card on right
   - Action: Move Mins Balance into Usage card

   ### Layout Direction

   - Figma: Vertical stacked layout
   - Implementation: Horizontal layout with sidebar
   - Action: Change to flex-col from flex-row
   ```

3. **Generate fixing instructions**:
   For each structural difference, provide specific code changes:

   ```tsx
   // ❌ Current structure
   <div className="flex flex-row">
     <Card>Usage content</Card>
     <Card>Mins Balance</Card>
   </div>

   // ✅ Correct structure (matching Figma)
   <Card>
     <div>Usage content</div>
     <Image>Banner</Image>
     <div>Mins Balance</div>
   </Card>
   ```

## ANALYZE IMPLEMENTATION CODE

1. Locate the implementation file(s)
2. Scan for style violations:
   ```bash
   # Check for arbitrary Tailwind values
   grep -n "w-\[" "text-\[" "p-\[" "m-\[" [file]
   ```
3. Verify semantic color usage:
   - All colors should reference CSS variables
   - No hardcoded hex/rgb values
4. Check spacing compliance:
   - All spacing uses Tailwind scale
   - Document any custom spacing found

## MEASURE ACTUAL VALUES

Using Playwright MCP, measure implemented values:

```javascript
const measurements = await page.evaluate(() => {
  const element = document.querySelector('[data-testid="main"]')
  const styles = window.getComputedStyle(element)

  return {
    // Dimensions
    width: element.offsetWidth,
    height: element.offsetHeight,

    // Colors
    backgroundColor: styles.backgroundColor,
    color: styles.color,

    // Typography
    fontSize: styles.fontSize,
    fontFamily: styles.fontFamily,
    lineHeight: styles.lineHeight,

    // Spacing
    padding: styles.padding,
    margin: styles.margin,
    gap: styles.gap,
  }
})
```

## COMPARE DESIGN VS IMPLEMENTATION

### Visual Comparison

1. Open Figma design and implementation screenshots side-by-side
2. Check each element:
   - [ ] Layout structure matches
   - [ ] Element positions correct
   - [ ] Proportions maintained
   - [ ] Visual hierarchy preserved

### Quantitative Comparison

Create comparison table:

```markdown
| Property      | Figma        | Implementation   | Match | Notes               |
| ------------- | ------------ | ---------------- | ----- | ------------------- |
| Width         | 1440px       | 1440px           | ✅    |                     |
| Primary Color | #3B82F6      | --brand-primary  | ✅    | Semantic variable   |
| Font Size     | 16px         | text-base (16px) | ✅    |                     |
| Padding       | 24px         | p-6 (24px)       | ✅    |                     |
| Custom Shadow | 0 4px 6px... | shadow-md        | ⚠️    | Rounded to Tailwind |
```

### Color Mapping Verification

Verify all colors map to semantic variables:

```markdown
| Figma Color | Used For   | Implementation   | Variable Name   |
| ----------- | ---------- | ---------------- | --------------- |
| #3B82F6     | Buttons    | bg-brand-primary | --brand-primary |
| #F3F4F6     | Background | bg-surface       | --surface       |
| #111827     | Text       | text-foreground  | --foreground    |
```

## VALIDATE RESPONSIVE BEHAVIOR

1. Compare responsive screenshots against Figma breakpoints (if defined)
2. Verify layout adjustments:
   - [ ] Mobile: Stacked layout
   - [ ] Tablet: Adjusted spacing
   - [ ] Desktop: Full layout
3. Check that all breakpoints use Tailwind prefixes (sm:, md:, lg:)

## VALIDATE INTERACTIONS

Test all interactive elements:

1. **Buttons**:
   - Hover state matches Figma
   - Active state implemented
   - Disabled state styled correctly
2. **Inputs**:
   - Focus state visible
   - Error states styled
   - Placeholder text matches
3. **Animations**:
   - Transitions smooth
   - Duration appropriate

## GENERATE VALIDATION REPORT

```markdown
# Figma Design Validation Report

## Summary

- **Figma URL**: [link]
- **Implementation**: [path/route]
- **Date Validated**: [date]
- **Overall Match**: [percentage]%

## Visual Fidelity ✅/❌

- Layout Structure: ✅
- Colors (via semantic variables): ✅
- Typography (Tailwind scale): ✅
- Spacing (Tailwind scale): ✅
- Interactive States: ✅

## Code Compliance

- No arbitrary values: ✅
- Semantic colors only: ✅
- Tailwind spacing only: ✅
- Responsive prefixes used: ✅

## Deviations from Design

1. Shadow: Rounded to `shadow-md` (closest Tailwind match)
2. Font size 15px: Mapped to `text-sm` (14px)
   - Reason: No 15px in Tailwind scale

## Screenshots

- Default: `validation/implementation-default.png`
- Dark Mode: `validation/implementation-dark.png`
- Mobile: `validation/implementation-mobile.png`
- Tablet: `validation/implementation-tablet.png`
- Desktop: `validation/implementation-desktop.png`

## Recommendations

1. [Any fixes needed]
2. [Improvements suggested]

## Validation Passed: YES/NO
```

## GENERATE FIX PLAN

If validation is less than 100%, \*\*ALWAYS create an actionable fix plan in `plan/retries/<some_file_name>.md`:

````markdown
# Figma Implementation Fix Plan

Generated: [date]
Figma URL: [link]
Implementation: [path]

## CRITICAL STRUCTURAL FIXES

### Issue 1: Card Separation Error

**Problem**: Usage card contents are split into multiple components
**Current Structure**:

```jsx
<Card>Usage Stats</Card>
<Card>Mins Balance</Card>  // ❌ Should be inside Usage card
```
````

**Required Fix**:

```jsx
<Card data-testid="usage-card">
  <div>Usage Stats</div>
  <Image src="/banner.jpg" />
  <div>Mins Balance</div> // ✅ Inside same card
</Card>
```

**Action Steps**:

1. Open `apps/web/components/UsageCard.tsx`
2. Move Mins Balance div inside the Card component
3. Remove separate Card wrapper from Mins Balance
4. Update data-structure attributes

### Issue 2: Layout Direction Error

**Problem**: Using horizontal layout instead of vertical
**Current Code**:

```jsx
<div className="flex flex-row gap-4">
```

**Required Fix**:

```jsx
<div className="flex flex-col gap-4">
```

**Action Steps**:

1. Change flex-row to flex-col in main container
2. Adjust child element widths from w-1/2 to w-full

## STYLE FIXES

### Issue 3: Arbitrary Values Found

**Location**: `apps/web/components/Header.tsx:34`
**Current Code**:

```jsx
<div className="w-[123px] p-[18px]">
```

**Required Fix**:

```jsx
<div className="w-32 p-5">  // Rounded to nearest Tailwind values
```

### Issue 4: Hardcoded Colors

**Location**: `apps/web/components/Button.tsx:12`
**Current Code**:

```jsx
<button className="bg-[#3B82F6] text-white">
```

**Required Fix**:

1. Add to `packages/ui/src/styles/globals.css`:

```css
:root {
  --button-primary: #3b82f6;
}
.dark {
  --button-primary: #60a5fa;
}
```

2. Update component:

```jsx
<button className="bg-button-primary text-white">
```

### Issue 5: Non-Standard Spacing

**Location**: `apps/web/app/dashboard/page.tsx:45`
**Current Code**:

```jsx
<div className="p-[15px] m-[23px]">
```

**Required Fix**:

```jsx
<div className="p-4 m-6">  // 15px→16px, 23px→24px
```

## COMPONENT HIERARCHY FIXES

### Issue 6: Missing Nesting

**Problem**: Elements not properly nested per Figma
**Fix Required**:

```jsx
// Move these elements inside their parent container:
- Banner image → Inside Usage Card
- Stats section → Inside Usage Card body
- Time selector → Inside Card header
```

## RESPONSIVE FIXES

### Issue 7: Missing Mobile Breakpoints

**Add responsive classes**:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

## IMPLEMENTATION CHECKLIST

### Immediate Actions (Blocking)

- [ ] Fix card separation - merge split components
- [ ] Correct layout directions (flex-row → flex-col)
- [ ] Remove ALL arbitrary Tailwind values
- [ ] Convert hardcoded colors to semantic variables

### Secondary Actions (Non-blocking)

- [ ] Add missing responsive breakpoints
- [ ] Update data-testid attributes
- [ ] Add data-structure markers
- [ ] Optimize image formats

### Testing After Fixes

- [ ] Run `npm run dev` and verify visually
- [ ] Re-run Playwright validation
- [ ] Test dark mode
- [ ] Check all breakpoints
- [ ] Verify build: `npm run build`

## COMMANDS TO RUN

```bash
# After making fixes:
npm run dev

# Re-validate with Playwright
# [Include specific Playwright commands]

# Build check
npm run build
```

## FILES TO MODIFY

1. `components/ui/UsageCard.tsx` - Structural fixes
2. `components/ui/Dashboard.tsx` - Layout direction
3. `app/globals.css` - Add semantic colors
4. `app/dashboard/page.tsx` - Remove arbitrary values

## ESTIMATED TIME: 30-45 minutes

---

**Note**: Fix structural issues FIRST, then style issues. Test after each major change.

````

## SAVE FIX PLAN
1. Create directory if it doesn't exist:
   ```bash
   mkdir -p plan/retries
````

2. Save the fix plan to `planning/retries/figma-implementation-fixes.md`
3. Also save a quick summary to `planning/retries/quick-fixes.md`:

   ````markdown
   # Quick Fix Summary

   ## TOP PRIORITY (Fix First)

   1. Merge separated card components
   2. Fix layout directions
   3. Remove arbitrary values

   ## Run these commands:

   ```bash
   # Open the main file with issues
   code components/ui/UsageCard.tsx

   # After fixes, validate
   npm run dev
   ```
   ````

   ```

   ```

## PROVIDE FIXES IF NEEDED

After generating the fix plan, either:

### Option A: Auto-fix Simple Issues

For straightforward fixes, directly modify the files:

```bash
# Example: Fix arbitrary values
sed -i 's/w-\[123px\]/w-32/g' components/ui/*.jsx
sed -i 's/p-\[18px\]/p-5/g' components/ui/*.jsx
```

### Option B: Interactive Fix Process

Prompt for each fix:

```
Found: Card separation issue in UsageCard.jsx
Should I:
1. Auto-fix by merging components
2. Show you the required changes
3. Skip and document in fix plan only

Choose option (1/2/3):
```

---

Output:

1. Validation report saved as `validation-report.md`
2. **Actionable fix plan saved as `plan/retries/figma-implementation-fixes.md`**
3. Quick fix summary saved as `plan/retries/quick-fixes.md`
4. All screenshots in `validation/` folder
5. Specific fixes applied or ready to apply
