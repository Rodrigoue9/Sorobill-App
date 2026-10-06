# Contributing to Sorobill

Thank you for your interest in contributing! This document covers everything you need to get started.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Quick Start (< 5 Minutes)](#quick-start--5-minutes)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Project Structure](#project-structure)
- [Adding a New Feature](#adding-a-new-feature)
- [Reporting Bugs](#reporting-bugs)

---

## Code of Conduct

Be respectful. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Harassment, discrimination, or hostile behaviour will not be tolerated.

---

## Quick Start (< 5 Minutes)

Go from clone to a fully interactive local UI in under 5 minutes:

```bash
# 1. Clone your fork
git clone https://github.com/<your-username>/Sorobill-App.git
cd Sorobill-App

# 2. Configure environment
cp .env.example .env.local   # or .env.production

# 3. Clean install and launch dev server
npm ci
npm run dev
```

### Mock Mode & Live Demo

- **Default Mock Behavior**: By default, mock mode is active (`NEXT_PUBLIC_USE_MOCK=true` or automatically inferred when contract IDs are omitted in `.env.local`). This allows developers to test onboarding, create plans, explore `/plans`, and walk through `/pay/[planId]` checkout at [http://localhost:3000](http://localhost:3000) without requiring a Freighter wallet or live chain connectivity.
- **Hosted Production Demo**: Compare local behaviour with the live production deployment at [https://sorobill-app.vercel.app](https://sorobill-app.vercel.app).

### Pre-PR Verification Gate

Before submitting any Pull Request, ensure that tests and production builds pass cleanly:

```bash
# Run unit test suite
npm test

# Verify type safety and Next.js production build
npm run build
# or run full gate: npm run verify
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- Git

---

## Development Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/my-feature
   # or
   git checkout -b fix/issue-123
   ```

2. **Make your changes.** Keep commits small and focused.

3. **Type-check and lint** before pushing:
   ```bash
   npm run type-check
   npm run lint
   ```

4. **Push and open a PR** against `main`.

---

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code change that isn't a fix or feature |
| `test` | Adding or updating tests |
| `chore` | Build process, dependency updates |

**Examples:**
```
feat(plans): add trial period field to CreatePlanDialog
fix(wallet): handle Freighter not installed error gracefully
docs(architecture): add Soroban integration pattern
```

---

## Pull Request Process

1. Fill in the PR template completely.
2. Link any related issues (`Closes #123`).
3. Ensure `npm run type-check` and `npm run lint` pass.
4. Keep PRs focused — one feature or fix per PR.
5. Add or update tests if applicable.
6. A maintainer will review within 3 business days.
7. Address review comments, then request re-review.
8. PRs are merged with **squash merge** to keep history clean.

### PR title format

Follow the same Conventional Commits format:
```
feat(dashboard): add subscriber export to CSV
```

---

## Code Style

- **TypeScript strict mode** is enabled — no `any` without justification.
- **Prettier** handles formatting. Run `npm run format` before committing.
- **ESLint** enforces Next.js best practices. Run `npm run lint`.
- Prefer named exports over default exports for components (except pages).
- Co-locate types with the code that uses them; shared types go in `src/types/index.ts`.
- Use `cn()` from `src/lib/utils` for conditional class names.

### Component conventions

```tsx
// ✅ Good
export function PlanCard({ plan, onSubscribe }: PlanCardProps) { ... }

// ❌ Avoid
export default function PlanCard(props: any) { ... }
```

### Avoid prop drilling

Use Zustand stores for state that needs to be shared across distant components. Use React Query for server/contract state.

---

## Project Structure

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full breakdown. Key rules:

- **Pages** live in `src/app/` — keep them thin, delegate to components and hooks.
- **Reusable components** live in `src/components/`.
- **shadcn/ui primitives** live in `src/components/ui/` — don't modify these unless necessary.
- **Data fetching** goes through `src/lib/api.ts` and `src/hooks/use-sorobill.ts`.
- **No direct `process.env` access** outside `src/lib/env.ts`.

---

## Adding a New Feature

### New page

1. Create `src/app/<route>/page.tsx`.
2. Add a layout if needed (`layout.tsx`).
3. Add a nav link in `src/components/navbar.tsx` if it should be globally accessible.

### New component

1. Create `src/components/<name>.tsx`.
2. Export it as a named export.
3. If it needs server data, create a corresponding hook in `src/hooks/use-sorobill.ts`.

### New API endpoint / contract call

1. Add the function to `src/lib/api.ts` with a mock implementation.
2. Add a React Query hook in `src/hooks/use-sorobill.ts`.
3. Document the production contract call pattern in a comment.

### New type

Add it to `src/types/index.ts` with a JSDoc comment explaining its purpose.

---

## Reporting Bugs

Open a [GitHub Issue](https://github.com/Sorobill/Sorobill-App/issues/new?template=bug_report.md) with:

- A clear title
- Steps to reproduce
- Expected vs actual behaviour
- Browser and OS
- Console errors (if any)

For security vulnerabilities, see [SECURITY.md](SECURITY.md) — **do not open a public issue**.

## Live demo

Deployed frontend: https://sorobill-app.vercel.app

Share links in production must use `NEXT_PUBLIC_APP_URL=https://sorobill-app.vercel.app`.
See [DEMO.md](../DEMO.md) and [DEMO_SCRIPT.md](./DEMO_SCRIPT.md).
