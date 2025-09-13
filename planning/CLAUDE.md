## Planning Documents Guidelines

When creating architectural planning documents in this directory:

### Document Header Format

Every planning document must begin with a YAML-style header:

```markdown
---
Document: [Document Title]
Version: [Version Number]
Status: [Status]
Last Updated: [YYYY-MM-DD]
Author: [Author/Team Name]
---
```

Status values include:

- `Documentation` - Explanatory docs/patterns
- `Ready for Implementation` - Implementation phase docs
- `Updated - [Reason]` - For revised architecture docs
- `Fixed [Issue]` - For corrected documents

### Background research

Before planning please complete any necessary research using the `search-specialist` agent and consolidate your findings first.

### Document Structure

1. **Title**: H1 heading matching the document title in header
2. **Navigation**: Include back link to index: `[← Back to Index](./index.md)`
3. **Diagrammatic Overview:** Call on the `mermaid-expert` agent to generate a mermaid diagram that provides an overarching view of the key pieces of functionality in the plan and how they fit together.
4. **Overview**: Brief summary of the document's purpose
5. **Main Content**: Organized with clear H2/H3 sections
6. **Code Examples**: Use language-specific markdown blocks with proper highlighting
7. **Cross-References**: Link to related documents at the bottom

### Architecture Documents

Architecture docs should include:

- **Design Principles**: Key decisions and rationale
- **Component Diagrams**: Where applicable (mermaid or descriptions)
- **Implementation Patterns**: Clear code examples
- **Key Benefits**: Summarized advantages of the approach
- **Next Steps**: Links to implementation plans

### Implementation Phase Documents

Phase documents (in `todo/` directory) must include:

- **Context**: Why this phase matters
- **Prerequisites**: Checklist format
- **References**: Links to related architecture docs
- **What to Implement**: Detailed checklist
- **Implementation Steps**: Numbered with validation commands
- **Success Criteria**: Clear completion checklist
- **Troubleshooting**: Common issues and solutions

**NOTES:**

- If the user is modifying existing architecture/componentry phase documents must also include a document called **Current State**, which provides an overview of the state of the architecture prior to the plan's implementation.
- DO NOT add time estimates for phases/steps. Only outline what is required for each step and the order in which they should be implemented.

### Code Block Guidelines

- Use full import statements in examples
- Include type annotations
- Show realistic usage patterns
- Comment complex logic
- Use `// ...` for omitted code

### Version Management

- Increment minor version for small updates (1.0 → 1.1)
- Increment major version for significant changes (1.x → 2.0)
- Always update Last Updated date
- Document what changed in Status field

### File Organization

```
planning/
├── assignx/           # Main planning directory
│   ├── index.md            # Central navigation
│   ├── high-level.md       # High-level overview of the steps in the plan, explained simply
│   ├── ARCHITECTURE.md     # High-level architecture
│   ├── IMPLEMENTATION-PLAN.md  # Detailed implementation
│   ├── *.md               # Numbered phase documents
│   ├── *-pattern.md       # Pattern documentation
│   ├── implementation-status.md  # Progress tracking
│   ├── todo/              # Implementation phase docs
│   └── impl/              # Component-specific guides
```
