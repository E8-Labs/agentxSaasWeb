# AssignX AI Agents Web App

## Project Overview

This repo contains the code for the AssignX (formerly AgentX) NextJS web application that allows users to test, configure and deploy their AI agents via a cutting edge UI.

## Architecture

This repo leverages the latest tech for both frontend and backend development, utilizing [npm](https://www.npmjs.com/), [Javascript](https://www.typescriptlang.org/), [NextJS](https://nextjs.org/), [React](https://react.dev/), [Tailwind](https://tailwindcss.com/) and [ShadCN](https://ui.shadcn.com/).

## Development Commands

```bash
# Install dependencies
npm install

# Development
npm run dev                    # Run all in dev mode

# Build
npm run build                 # Build all packages

# Testing
npm run test                 # Run all tests (Currently unconfigured)
```

## Development Guidelines

**NOTE:** Before commencing any task, check the agents you have available to see if there are any that you can use to assist you in your task. If there are, ALWAYS use them unless the user explicitly requests otherwise.

#### System Requirements

- Node.js >= 22.14.0
- npm >= 11.5.2

#### Important Patterns and Philosophies

1. **Task Automation**: Taskfile.yaml provides consistent commands
2. **Shared Code**: Any code that can be or is likely to be shared between apps should be inside either one of the existing packages or a new package should be created.
3. **UI and styles**: All UI elements and styles should be built from ShadCN components and shared from the `@workspace/ui` package.
4. **White Labelling**: We need to build from a white-labeling centric perspective that will allow for customizable logos, favicons, primary colors, and SEO metadata.
5. **Test-Driven Development (TDD)**: Write tests before writing code to ensure high quality and maintainability.
6. **Continuous Integration (CI)**: Automate testing and deployment processes using GitHub Actions.

#### Planning

All plans should be written inside `planning`. Consult the `CLAUDE.md` file there for the specifics about how plans should be written.

#### Debugging

When debugging/troubleshooting, please run the `debugger` agent first, followed by the `error-detective` agent.

#### Memories

- **Always use strict mode** - no `any` types
- **File naming**: Use kebab-case (`foo-bar.ts`)
- Write tests for new functions and components when necessary
- **ALWAYS** use Vitest for test writing
- **Do not use `any` in TypeScript**
- **Use semantic color variables only** - text-primary, bg-success-light (never green-500, blue-300)
- **Always use cn() utility** for dynamic class combinations and style overrides
- Interactive components should use React.forwardRef and accept className for overrides
- **Follow compound component pattern** - build complex UIs from simple, composable parts
- **Use Class Variance Authority (CVA)** for consistent variant systems
- **Implement `asChild` pattern** via Radix UI's Slot for polymorphic components
- **CSS color variables must use HSL format** with light/dark mode variants
- **File naming:** kebab-case files, PascalCase components, camelCase utilities
- **Include focus states and ARIA attributes** for accessibility
- **Desktop-first responsive design** with proper spacing scale
