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

## Notes

- Always read the full annotation before making changes
- If multiple annotations relate to the same component, batch the changes
- Preserve existing functionality while implementing the requested changes
- The dev server must be running for annotations to sync to the file
- **NEVER use chrome-devtools or browser MCP tools unless the user explicitly requests it**
