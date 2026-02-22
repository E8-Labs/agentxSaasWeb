---
name: process-agentation
description: Process UI feedback from Agentation annotations
---

# Process Agentation Notes

Process UI feedback captured via the Agentation toolbar and make the requested changes.

## Workflow

1. **Read the notes file**
   - Read `AGENTATION_NOTES.md` from the project root
   - If the file doesn't exist or is empty, inform the user there are no annotations to process

2. **Parse and display annotations**
   - Show the user a summary of all annotations found
   - Each annotation includes: element type, selector, DOM path, position, and user notes

3. **Find the relevant code**
   - Use the selectors and DOM paths to search the codebase
   - Look for components/files that render the annotated elements
   - Common patterns to search:
     - CSS class names from selectors
     - Component names that match element types
     - Text content that appears in the annotation

4. **Process the feedback**
   - For each annotation with a note, understand what change is requested
   - If the note is unclear, ask the user for clarification
   - Make the requested changes to the code

5. **Clear the notes file**
   - After successfully processing all annotations, clear the file by calling:
     ```bash
     curl -X DELETE http://localhost:3000/api/agentation -H "Content-Type: application/json" -d '{"action":"clear"}'
     ```
   - Or simply delete/truncate the `AGENTATION_NOTES.md` file

6. **Report changes**
   - Report back to the user what was changed
   - Do NOT use browser/chrome tools to verify unless the user explicitly requests it

## Example Annotation Format

```markdown
## Annotation: abc123
**Element:** Button
**Selector:** `.sidebar > button.primary`
**Path:** `body > div.app > aside.sidebar > button`
**Position:** x=150, y=320
**Note:** Make this button larger and use the brand primary color
```

## Tips for Finding Code

- Search for class names: `grep -r "primary" --include="*.jsx" --include="*.tsx"`
- Search for component patterns: Look for JSX that matches the element type
- Check for CSS/Tailwind classes that match the selector
- The DOM path helps identify the component hierarchy

## Limitations: Popups and Modals

When a popup or modal is open, the Agentation toolbar’s annotation field is often **disabled** (focus is trapped in the overlay, or the tool doesn’t target portaled content). The app is configured so the annotation field **can** receive focus when a modal is open (MUI `disableEnforceFocus`, Radix `trapFocus={false}`). You can add annotations inside modals by clicking the annotation field and typing.

**If a modal still traps focus — manual workaround:**

1. Close the modal/popup if needed, then add an entry to `AGENTATION_NOTES.md` in this format:

```markdown
## Annotation: manual-modal
**Element:** [describe the element, e.g. "Filter modal header"]
**Path:** [optional, e.g. "Pipeline page > Filter modal"]
**Note:** [describe the change you want, e.g. "Header height 60px, Apply button use brand primary"]
```

2. Run `/process-agentation` (or ask the assistant to process agentation). The assistant will find the modal/popup component and apply the change from the **Note** field.

The assistant can also accept the same feedback in chat (e.g. “In the pipeline filter modal, make the title 18px and the Apply button primary”) and apply it without a manual note file entry.

## Notes

- Always read the full annotation before making changes
- If multiple annotations relate to the same component, batch the changes
- Preserve existing functionality while implementing the requested changes
- The dev server must be running for annotations to sync to the file
- **NEVER use chrome-devtools or browser MCP tools unless the user explicitly requests it**
- **"Medium elevation"** (when requested for a container/popover/paper): apply border `1px solid #eaeaea`, boxShadow `0 4px 30px rgba(0, 0, 0, 0.15)`, borderRadius `12px`. In Pipeline1.js use `styles.mediumElevation`; elsewhere define or reuse the same values.

## User-defined modal shortcuts

When the user says **"modal cleanup"** (or "apply modal cleanup"), apply the Add Pipeline modal’s layout and styling to the modal in focus:
- Container: `w-[400px] flex flex-col gap-3 p-0 overflow-hidden`
- Style: `backgroundColor: '#ffffff'`, medium elevation with `boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)'`, `border: '1px solid #eaeaea'`, `borderRadius: 12`

When the user says **"animate modal"** (or "apply animate modal"), apply the Add Pipeline modal’s animation and backdrop to the modal in focus:
- Backdrop: `backgroundColor: '#00000099'` (60% opacity), `timeout: 250`
- Content entry: scale 0.95→1, opacity 0→1 over 0.25s with `cubic-bezier(0.34, 1.56, 0.64, 1)`

When the user says **"entry animation"** (or "apply entry animation"), apply the same entry animation as the ThreadsList filter popover (w-[230px] dropdown) to the element in focus. This includes sliding into final position, easing, and transition:
- Tailwind: `animate-in slide-in-from-bottom-2 duration-200 ease-out` (add or merge into the element's className)
- Effect: element slides in from the bottom into its final position with a 200ms ease-out transition

When the user says **"page header"** (or "apply page header"), style the selected element with the same sizing and style as the Messages page header bar:
- Container: `w-full p-4 border-b flex flex-row items-center justify-between h-[66px]`

When the user says **"filter button"** (or "apply filter button"), style the selected button to match the filter button in the page header:
- Button: `mb-1 w-auto h-10 px-3 py-3 rounded-lg bg-black/[0.02] hover:opacity-70 transition-opacity outline-none relative flex-shrink-0 flex items-center justify-center`

When the user says **"filter icon"** (or "apply filter icon"), style the icon to match the filter icon inside that button (same size and style as the 20×20 SVG in the filter button).
