# AssignX AI Agents Web App

> A practical guide for working **agent‑first** in this Next.js project.

## 1) Purpose

This document explains how to **use, debug, and build with AI agents** in the AssignX (formerly AgentX) web app. It consolidates the working norms scattered across the project and turns them into a day‑to‑day playbook for contributors.

## 2) Project Overview

The AssignX Next.js application lets users **test, configure, and deploy AI agents** via a cutting‑edge UI.

### Architecture

* **Stack:** npm · JavaScript · Next.js · React · Tailwind CSS · shadcn/ui
* **Philosophy:** modern, modular, and share‑first across workspaces/packages.

## 3) Agent‑First Workflow

Before starting *any* task:

1. **Scan available agents** and decide whether one can accelerate or validate your work.
2. **Use the agent** for research, planning, scaffolding, or validation **unless the user explicitly asks you not to**.
3. Keep outputs reproducible (commit prompts/configs when relevant).

> **Tip:** When in doubt, run a quick agent pass for planning or sanity checks (e.g., edge cases, accessibility, test scaffolds).

## 4) Getting Started

### System Requirements

* **Node.js** ≥ **22.14.0**
* **npm** ≥ **11.5.2**

### Development Commands

```bash
# Install dependencies
npm install

# Development (app & packages in dev mode)
npm run dev

# Build all packages
npm run build

# Run tests (Vitest; configure as needed)
npm run test
```

> The repository uses a **Taskfile.yaml** for consistent commands. Prefer the Taskfile where provided to keep the workflow uniform.

## 5) Planning & Specs

* All plans live in the **`/planning`** directory.
* Follow the conventions in `planning/CLAUDE.md` for **how plans should be written** (structure, acceptance criteria, assumptions, risks).
* Plans should reference which **agents** will be used (and why) for each sub‑task.

**Plan template (suggested):**

```md
# Title

## Context
- Problem / opportunity
- Constraints / assumptions

## Objectives & Success Criteria
- …

## Agent Usage
- Agents to run: <names>
- Purpose of each agent: <why>
- Inputs / prompts / configs

## Implementation Outline
- Steps / components / data flows

## Testing & Validation
- Unit & component tests (Vitest)
- Agent‑assisted checks (what to run)

## Risks & Mitigations
- …
```

## 6) Debugging With Agents

When troubleshooting:

1. **Run the `debugger` agent first** to localize the issue and propose fixes.
2. **Run the `error-detective` agent next** to cross‑check logs, configs, and environment assumptions.
3. Apply fixes, add/adjust tests, and re‑run the agents to validate.

> Record the agent prompts/configs you used in the PR description for traceability.

## 7) Development Guidelines (Agent‑aware)

### Core Patterns & Philosophies

1. **Task Automation:** Prefer `Taskfile.yaml` commands for common tasks.
2. **Shared Code:** Put reusable code into existing workspace packages or create a new package.
3. **UI & Styles:** Build from **shadcn/ui** components and export via `@workspace/ui`.
4. **White‑Labeling:** Design for configurable **logos, favicons, primary colors, and SEO metadata** from day one.
5. **TDD:** Write tests **before** implementation where practical.
6. **CI:** Use GitHub Actions to automate **build, test, and checks**.

### Testing

* **Always use Vitest** for unit and component tests.
* Write tests for new functions and components where necessary.
* Keep tests deterministic; add agent‑assisted property‑based or scenario checks only when stable.

### TypeScript & Strictness

* **Always use strict mode**; **never** use `any` (build with proper types or generics).
* File names: **kebab‑case** (`foo-bar.ts`)
* Components: **PascalCase**; utilities: **camelCase**

### Styling & Theming

* Use **semantic color variables only** (e.g., `text-primary`, `bg-success-light`), **not** literal tokens like `green-500`.
* **CSS color variables must use HSL** with **light/dark variants**.
* Always use the **`cn()`** utility for dynamic class name composition.
* Prefer **compound component** patterns and **CVA** (Class Variance Authority) for variants.
* Implement the **`asChild`** pattern via Radix UI’s `Slot` for polymorphic components.
* Interactive components **must** use `React.forwardRef` and accept `className` overrides.

### Accessibility & Responsiveness

* Include **focus states** and **ARIA attributes**.
* Adopt **desktop‑first** responsive design with a consistent spacing scale.

### Validation

* **Always validate UI changes with the Chrome DevTools MCP server** before merging.

## 8) White‑Labeling Checklist

* [ ] Brand assets configurable (logo, favicon) via environment/config.
* [ ] Primary color & theme tokens injected at runtime/build.
* [ ] Route metadata (title/description/OG tags) driven by config.
* [ ] Email/SMS templates (if present) parameterized by brand.

## 9) Agent Usage Examples (Conceptual)

> Exact commands and UI flows depend on the local setup. Use this section as guidance.

* **Planning support:**

  * Prompt an agent with the feature spec; ask for edge cases, acceptance criteria, and test plan skeletons.
* **UI review:**

  * Provide component JSX and Tailwind classes; request accessibility and theming checks.
* **Debugging:**

  * Paste logs, env diffs, and repro steps to `debugger`; follow with `error-detective` for cross‑validation.
* **Refactors:**

  * Ask an agent to propose module boundaries and shared‑package candidates; verify with maintainers.

Commit relevant **prompts/configs** (minus secrets) alongside code to improve reproducibility.

## 10) Pull Request Checklist

**Before requesting review:**

* [ ] Plan updated in `/planning` with agent usage and acceptance criteria.
* [ ] Agents run for planning/validation (record prompts/configs in PR).
* [ ] Tests added/updated (Vitest) and passing locally.
* [ ] UI validated with Chrome DevTools MCP server.
* [ ] Accessibility (focus states, ARIA) and theming (semantic tokens, HSL vars) confirmed.
* [ ] No `any` types; TypeScript strictness satisfied.
* [ ] Components follow **forwardRef**, **`className`** override, and **CVA** where applicable.
* [ ] White‑labeling requirements satisfied for new UI/routes.

## 11) CI & Branch Hygiene

* CI must run **build + tests + lint + type‑check**.
* Block merge on failures; fix or update tests.
* Keep branches focused; prefer small, frequent PRs with clear agent logs.

## 12) Notes & Reminders ("Memories")

* **Strict TypeScript**; **never** `any`.
* **kebab‑case** files; **PascalCase** components; **camelCase** utilities.
* **Vitest** only for tests.
* **Semantic color variables**; **HSL** color vars; **light/dark** modes.
* **`cn()`** utility for classes; **CVA** for variants; **`asChild`** pattern via Radix `Slot`.
* Interactive components: **`forwardRef`** + `className` prop.
* **Focus states & ARIA** are required.
* **Desktop‑first** responsive design.
* **Validate UI** with the **Chrome DevTools MCP server**.

## 13) Glossary

* **Agent‑first:** Start tasks by checking whether an AI agent can help.
* **CVA:** Class Variance Authority—utility for variant‑based styling API.
* **White‑labeling:** Building for multi‑brand customization from the start.

## 14) Questions?

If something is unclear or you need an agent wired into your workflow, open a discussion or add a `planning` note proposing the change, including which agent will help and how you’ll validate its output.
