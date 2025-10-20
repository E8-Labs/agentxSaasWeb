# Planning Documentation Guidelines for Codex Agents

This document provides instructions for Codex agents on how to create and maintain planning documents in this directory.

## Overview

Planning documents in this directory serve as the architectural and implementation blueprint for the AssignX web application. These documents must be modular, testable, and designed to support iterative development with clear feedback loops.

## Core Principles for Codex Agents

### 1. Modularity First
- Break down complex plans into small, independent, testable phases
- Each planning document should focus on a single architectural concern
- Design for composability - components should work independently and together

### 2. Iterate, Don't Overplan
- Start with a minimal viable plan rather than exhaustive upfront design
- Use the read → edit → test → refine loop
- Validate assumptions early through code examples and prototypes
- Adjust plans based on implementation feedback

### 3. Fast Feedback Loops
- Include validation commands after each implementation step
- Specify linting, formatting, and testing requirements explicitly
- Use pre-commit hooks and CI checks as guardrails
- Make plans verifiable through automated checks

### 4. Clear Success Criteria
- Every phase must have measurable completion criteria
- Define what "done" looks like before implementation begins
- Include troubleshooting guides for common failure modes

---

## Required Document Structure

### Document Header (Required)

Every planning document MUST begin with this YAML header:

```markdown
---
Document: [Descriptive Title]
Version: [Major.Minor - e.g., 1.0]
Status: [Status - see below]
Last Updated: [YYYY-MM-DD]
Author: [Author/Team Name]
---
```

**Status Values:**
- `Documentation` - Reference documentation and patterns
- `Ready for Implementation` - Actionable implementation plans
- `Updated - [Reason]` - Revised documents (specify what changed)
- `Fixed [Issue]` - Corrections to previous plans
- `In Progress` - Currently being implemented
- `Completed` - Implementation finished and validated

**Versioning:**
- **Minor bump** (1.0 → 1.1): Clarifications, examples, minor corrections
- **Major bump** (1.x → 2.0): Architectural changes, new requirements, policy changes

### Standard Document Sections

1. **Title (H1)**: Matches document title from header
2. **Navigation**: `[← Back to Index](./index.md)`
3. **Overview**: 2-3 paragraphs explaining purpose and scope
4. **Diagrammatic Overview**: Mermaid diagram showing component relationships
5. **Main Content**: Organized with clear H2/H3 sections
6. **Code Examples**: TypeScript/JavaScript with full imports and types
7. **Validation Steps**: Commands to verify implementation
8. **Success Criteria**: Measurable completion checklist
9. **Cross-References**: Links to related planning documents

## Pre-Planning Research

Before creating planning documents:

1. **Search for Best Practices**: Use `search-specialist` agent to research:
   - Similar patterns in modern web applications
   - Testing strategies for the component type
   - Accessibility requirements
   - Performance optimization techniques

2. **Consolidate Findings**: Create a "Research Notes" section summarizing:
   - Key patterns discovered
   - Tradeoffs between approaches
   - Recommended libraries/tools
   - Links to authoritative sources

3. **Generate Diagrams**: Use `mermaid-expert` agent to create:
   - Architecture diagrams showing component relationships
   - Data flow diagrams
   - State machine diagrams for complex interactions
   - Sequence diagrams for multi-step processes

## Architecture Documents

Architecture documents establish design patterns and system structure.

### Required Sections:

- **Design Principles**: Core decisions and their rationale
- **Component Breakdown**: List of components with responsibilities
- **Data Flow**: How information moves through the system
- **State Management**: Where and how state is stored/updated
- **Integration Points**: External dependencies and APIs
- **Testing Strategy**: How components will be tested
- **Key Benefits**: Advantages of this architectural approach
- **Tradeoffs**: Known limitations or complexity costs
- **Next Steps**: Link to implementation plan

### Code Examples Must Include:

```typescript
// ✅ GOOD: Full imports, types, realistic usage
import { useState, useCallback } from 'react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

interface ExampleProps {
  onSubmit: (value: string) => Promise<void>;
  className?: string;
}

export function Example({ onSubmit, className }: ExampleProps) {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(async () => {
    await onSubmit(value);
    setValue(''); // Reset after submission
  }, [value, onSubmit]);

  return (
    <div className={cn('space-y-4', className)}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full"
      />
      <Button onClick={handleSubmit}>
        Submit
      </Button>
    </div>
  );
}
```

```typescript
// ❌ BAD: Vague, incomplete, no types
function Example() {
  // ... implementation
  return <div>...</div>
}
```

## Implementation Plans

Implementation plans break architecture into executable phases.

### Structure for Each Phase:

```markdown
## Phase N: [Phase Name]

### Context
Why this phase matters and what problem it solves.

### Prerequisites
- [ ] Previous phase completed and validated
- [ ] Dependencies installed: `npm install <package>`
- [ ] Environment configured: `<specific setup>`

### What to Implement
Detailed checklist of deliverables:
- [ ] Create `src/components/foo.tsx`
- [ ] Add unit tests in `src/components/foo.test.tsx`
- [ ] Update `src/types/index.ts` with new types
- [ ] Export from `src/index.ts`

### Implementation Steps

1. **Create component scaffold**
   ```bash
   # Create file
   touch src/components/foo.tsx
   ```

   ```typescript
   // src/components/foo.tsx
   import { forwardRef } from 'react';

   export interface FooProps {
     // ... type definitions
   }

   export const Foo = forwardRef<HTMLDivElement, FooProps>((props, ref) => {
     // ... implementation
   });

   Foo.displayName = 'Foo';
   ```

2. **Add tests**
   ```bash
   # Create test file
   touch src/components/foo.test.tsx
   ```

   ```typescript
   // src/components/foo.test.tsx
   import { describe, it, expect } from 'vitest';
   import { render, screen } from '@testing-library/react';
   import { Foo } from './foo';

   describe('Foo', () => {
     it('renders correctly', () => {
       render(<Foo />);
       expect(screen.getByRole('...')).toBeInTheDocument();
     });
   });
   ```

3. **Validate implementation**
   ```bash
   # Type check
   npm run type-check

   # Run tests
   npm run test -- foo.test.tsx

   # Lint
   npm run lint

   # Build
   npm run build
   ```

### Success Criteria
- [ ] All tests passing
- [ ] No TypeScript errors (strict mode)
- [ ] No linting errors
- [ ] Build succeeds
- [ ] Component documented with JSDoc
- [ ] Accessibility verified with Chrome DevTools MCP

### Troubleshooting

**Issue**: Type errors in test file
**Solution**: Ensure `@testing-library/react` types are installed: `npm install -D @types/testing-library__react`

**Issue**: Build fails
**Solution**: Check that all imports use correct paths and exports are defined
```

## Current State Documentation

When modifying existing architecture, ALWAYS include a "Current State" section:

```markdown
## Current State (Pre-Implementation)

### Existing Architecture
Brief description of how the system currently works.

### Files Affected
- `src/components/existing.tsx` - Will be refactored to use new pattern
- `src/hooks/use-old.ts` - Will be deprecated in favor of new hook
- `src/types/legacy.ts` - Types will be migrated to new structure

### Migration Path
1. Implement new components alongside existing ones
2. Gradually migrate usage from old to new
3. Deprecate old components with console warnings
4. Remove deprecated code after migration complete

### Backwards Compatibility
- API remains compatible for 2 minor versions
- Migration guide will be provided
- Codemods will be offered for automatic migration
```

## Code Block Guidelines

### Import Statements
Always show full imports, never use abbreviated or assumed imports:

```typescript
// ✅ GOOD
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import type { User } from '@/types/user';

// ❌ BAD
import { useState } from 'react';
// ... other imports assumed
```

### Type Annotations
All functions, parameters, and variables should have explicit types:

```typescript
// ✅ GOOD
interface UserCardProps {
  user: User;
  onEdit: (userId: string) => Promise<void>;
  className?: string;
}

export function UserCard({ user, onEdit, className }: UserCardProps): JSX.Element {
  // ...
}

// ❌ BAD
export function UserCard({ user, onEdit }) {
  // ...
}
```

### Realistic Examples
Show complete, working examples that could be copy-pasted:

```typescript
// ✅ GOOD: Complete, realistic example
import { create } from 'zustand';
import type { User } from '@/types/user';

interface UserStore {
  users: User[];
  addUser: (user: User) => void;
  removeUser: (id: string) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  addUser: (user) => set((state) => ({
    users: [...state.users, user]
  })),
  removeUser: (id) => set((state) => ({
    users: state.users.filter(u => u.id !== id)
  })),
}));

// Usage example:
function UserList() {
  const { users, addUser } = useUserStore();
  // ... component implementation
}

// ❌ BAD: Incomplete, vague example
const store = create((set) => ({
  // ... some state
  // ... some actions
}));
```

### Comment Complex Logic
Explain non-obvious decisions and algorithms:

```typescript
// ✅ GOOD
export function calculateDiscount(price: number, tier: string): number {
  // Apply tiered discount based on customer segment
  // Bronze: 5%, Silver: 10%, Gold: 15%, Platinum: 20%
  const discountRates: Record<string, number> = {
    bronze: 0.05,
    silver: 0.10,
    gold: 0.15,
    platinum: 0.20,
  };

  const rate = discountRates[tier.toLowerCase()] ?? 0;
  return price * (1 - rate);
}

// ❌ BAD
export function calculateDiscount(price: number, tier: string): number {
  const rates = { bronze: 0.05, silver: 0.10, gold: 0.15, platinum: 0.20 };
  return price * (1 - (rates[tier.toLowerCase()] ?? 0));
}
```

### Omitted Code
Use `// ...` to indicate intentionally omitted code:

```typescript
export function ComplexComponent({ data }: Props) {
  // ... state declarations

  useEffect(() => {
    // Fetch data when component mounts
    fetchData();
  }, []);

  // ... other hooks and logic

  return (
    <div>
      {/* ... render logic */}
    </div>
  );
}
```

## Project-Specific Requirements

### UI/Styling Rules

All UI components MUST follow these patterns:

1. **Use ShadCN components from `@workspace/ui`**
   ```typescript
   import { Button } from '@workspace/ui/components/button';
   import { Card } from '@workspace/ui/components/card';
   ```

2. **Semantic color tokens only** (never hardcoded colors)
   ```typescript
   // ✅ GOOD
   className="bg-primary text-primary-foreground"
   className="bg-success-light text-success-dark"

   // ❌ BAD
   className="bg-blue-500 text-white"
   className="bg-green-100 text-green-900"
   ```

3. **HSL CSS variables with light/dark mode**
   ```css
   /* styles.css */
   :root {
     --primary: 220 70% 50%;
     --primary-foreground: 0 0% 100%;
   }

   .dark {
     --primary: 220 70% 60%;
     --primary-foreground: 0 0% 10%;
   }
   ```

4. **Use `cn()` utility for dynamic classes**
   ```typescript
   import { cn } from '@workspace/ui/lib/utils';

   export function Component({ className, isActive }: Props) {
     return (
       <div className={cn(
         'base-class',
         isActive && 'active-class',
         className
       )}>
         {/* content */}
       </div>
     );
   }
   ```

5. **Class Variance Authority (CVA) for variants**
   ```typescript
   import { cva, type VariantProps } from 'class-variance-authority';

   const buttonVariants = cva(
     'inline-flex items-center justify-center rounded-md',
     {
       variants: {
         variant: {
           default: 'bg-primary text-primary-foreground',
           outline: 'border border-input bg-background',
         },
         size: {
           default: 'h-10 px-4 py-2',
           sm: 'h-9 px-3',
           lg: 'h-11 px-8',
         },
       },
       defaultVariants: {
         variant: 'default',
         size: 'default',
       },
     }
   );

   export interface ButtonProps
     extends React.ButtonHTMLAttributes<HTMLButtonElement>,
       VariantProps<typeof buttonVariants> {}
   ```

6. **Use Radix Slot (`asChild`) for polymorphic components**
   ```typescript
   import { Slot } from '@radix-ui/react-slot';

   export function Button({ asChild, ...props }: ButtonProps) {
     const Comp = asChild ? Slot : 'button';
     return <Comp {...props} />;
   }
   ```

7. **Interactive components: `forwardRef` + `className`**
   ```typescript
   import { forwardRef } from 'react';

   export const Input = forwardRef<HTMLInputElement, InputProps>(
     ({ className, ...props }, ref) => {
       return (
         <input
           ref={ref}
           className={cn('base-input-styles', className)}
           {...props}
         />
       );
     }
   );

   Input.displayName = 'Input';
   ```

8. **Accessibility: Focus states + ARIA attributes**
   ```typescript
   <button
     aria-label="Close dialog"
     className="focus:outline-none focus:ring-2 focus:ring-primary"
     onClick={onClose}
   >
     <X aria-hidden="true" />
   </button>
   ```

9. **Desktop-first responsive design**
   ```typescript
   className="grid grid-cols-4 gap-4 md:grid-cols-2 sm:grid-cols-1"
   // Desktop: 4 columns
   // Tablet: 2 columns
   // Mobile: 1 column
   ```

10. **Validate UI changes with Chrome DevTools MCP**
    ```markdown
    ### UI Validation Steps
    1. Use `mcp__chrome-devtools__take_snapshot` to capture accessibility tree
    2. Verify focus states with `mcp__chrome-devtools__hover` and keyboard navigation
    3. Test responsive layouts by resizing with `mcp__chrome-devtools__resize_page`
    4. Check color contrast and ARIA attributes
    ```

### White-Labeling Requirements

All UI must support customization:

```typescript
// config/branding.ts
export interface BrandConfig {
  logo: {
    light: string;
    dark: string;
    alt: string;
  };
  favicon: string;
  primaryColor: string; // HSL format
  seo: {
    title: string;
    description: string;
    ogImage: string;
  };
}

// Example usage
import { brandConfig } from '@/config/branding';

export function Logo() {
  return (
    <img
      src={brandConfig.logo.light}
      alt={brandConfig.logo.alt}
      className="dark:hidden"
    />
  );
}
```

### Testing Requirements

1. **Use Vitest exclusively**
   ```typescript
   import { describe, it, expect, vi, beforeEach } from 'vitest';
   import { render, screen, waitFor } from '@testing-library/react';
   import userEvent from '@testing-library/user-event';
   ```

2. **Write tests for new/changed behavior**
   - Unit tests for pure functions and hooks
   - Component tests for UI interactions
   - Integration tests for data flow

3. **TypeScript strict mode, no `any`**
   ```typescript
   // ✅ GOOD
   function process(data: unknown): Result {
     if (typeof data === 'string') {
       return processString(data);
     }
     throw new Error('Invalid data type');
   }

   // ❌ BAD
   function process(data: any): any {
     return processString(data);
   }
   ```

4. **All tests must pass before committing**
   ```bash
   npm run test        # Run all tests
   npm run test:watch  # Watch mode during development
   npm run test:coverage  # Generate coverage report
   ```

## File Organization

```
planning/
├── AGENTS.md                    # This file
├── CLAUDE.md                    # Guidelines for Claude agents
├── index.md                     # Central navigation hub
│
├── assignx/                     # Main planning directory
│   ├── index.md                 # AssignX project navigation
│   ├── high-level.md            # High-level overview for stakeholders
│   ├── ARCHITECTURE.md          # System architecture document
│   ├── IMPLEMENTATION-PLAN.md   # Detailed implementation roadmap
│   ├── implementation-status.md # Progress tracking
│   │
│   ├── todo/                    # Phase-specific implementation guides
│   │   ├── phase-1-setup.md
│   │   ├── phase-2-core.md
│   │   └── phase-3-polish.md
│   │
│   ├── impl/                    # Component-specific guides
│   │   ├── auth-implementation.md
│   │   ├── ui-component-guide.md
│   │   └── api-integration.md
│   │
│   └── patterns/                # Reusable pattern documentation
│       ├── state-management-pattern.md
│       ├── form-handling-pattern.md
│       └── error-handling-pattern.md
```

## Pull Request Checklist

When implementing from planning documents, verify:

```markdown
- [ ] Planning document exists and is up-to-date
- [ ] All prerequisites met and verified
- [ ] Code follows modular, testable design
- [ ] TypeScript strict mode (no `any` types)
- [ ] Tests written and passing (Vitest)
- [ ] UI uses ShadCN components via `@workspace/ui`
- [ ] Semantic color tokens (no hardcoded colors)
- [ ] HSL CSS variables with light/dark mode
- [ ] `cn()` utility for dynamic classes
- [ ] CVA for component variants
- [ ] Interactive components use `forwardRef` + `className`
- [ ] Focus states + ARIA attributes present
- [ ] Desktop-first responsive spacing
- [ ] White-labeling hooks respected (logo, colors, SEO)
- [ ] UI validated with Chrome DevTools MCP server
- [ ] Linting passes: `npm run lint`
- [ ] Type checking passes: `npm run type-check`
- [ ] Build succeeds: `npm run build`
- [ ] Implementation matches planning document
- [ ] Planning document updated if implementation diverged
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | TBD | Initial version with Codex-specific guidelines |

## Cross-References

- [CLAUDE.md](./CLAUDE.md) - Guidelines for Claude Code agents
- [planning/assignx/index.md](./assignx/index.md) - AssignX project planning hub
- [Root CLAUDE.md](/CLAUDE.md) - Project-wide development guidelines
