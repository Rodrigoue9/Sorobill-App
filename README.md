# ⬡ Sorobill

> **Stripe for recurring global payments — powered by Stellar Soroban.**

Sorobill is an open-source, production-ready frontend for a cross-border subscription billing platform. It lets merchants create on-chain subscription plans and collect recurring payments in USDC, EURC, XLM, or any Stellar asset — without banks, borders, or intermediaries.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Stellar](https://img.shields.io/badge/Stellar-Soroban-7B2FBE)](https://stellar.org)

**Live demo:** [https://sorobill-app.vercel.app](https://sorobill-app.vercel.app)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

Sorobill provides two interfaces in one app:

| Role | What they do |
|------|-------------|
| **Merchant** | Create subscription plans, view subscribers, track revenue, manage webhooks |
| **Subscriber** | Connect wallet, browse plans, approve/cancel subscriptions, view billing history |

All billing logic is executed on **Stellar Soroban** smart contracts. The frontend is a pure UI layer — it reads contract state and submits signed transactions via the user's Freighter wallet.

---

## Features

### Merchant Dashboard
- Create subscription plans (name, price, asset, interval, trial days)
- View active subscribers with next-billing dates
- Revenue analytics with 12-month area chart
- Payment history with Stellar Explorer links

### Subscriber Interface
- Connect Freighter wallet
- Browse and subscribe to plans
- Cancel subscriptions on-chain
- View upcoming charges and full billing history

### Billing UI
- Upcoming charge timeline
- Transaction status (pending / success / failed)
- Multi-currency display (USDC, EURC, XLM, custom tokens)

### Notifications
- In-app notification bell with unread count
- Payment success / failure alerts
- New subscriber events

### Webhook Simulator
- Fire any event type against a real endpoint
- Inspect request payload and HTTP response
- Full event log with click-to-inspect

### Bonus
- 🌙 Dark mode (system / light / dark)
- 🚀 Merchant onboarding flow (4-step wizard)
- 🔗 Stellar Explorer deep links for every transaction

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- [Freighter wallet](https://freighter.app) browser extension
- A Stellar testnet account (get one at [Stellar Laboratory](https://laboratory.stellar.org))

### Installation

```bash
# Clone the repo
git clone https://github.com/Sorobill/Sorobill-App.git
cd Sorobill-App

# Install dependencies
npm install

# Copy environment config
cp .env.example .env.local

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you.ll land on the Sorobill home page.

### First-time merchant setup

1. Navigate to `/onboarding`
2. Connect your Freighter wallet
3. Fill in your business profile
4. Create your first subscription plan
5. Share your plan with subscribers

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` or `mainnet` | `testnet` |
| `NEXT_PUBLIC_STELLAR_RPC_URL` | Soroban RPC endpoint | Testnet RPC |
| `NEXT_PUBLIC_STELLAR_HORIZON_URL` | Horizon API endpoint | Testnet Horizon |
| `NEXT_PUBLIC_STELLAR_PASSPHRASE` | Network passphrase | Testnet passphrase |
| `NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ID` | Deployed subscription contract | — |
| `NEXT_PUBLIC_BILLING_CONTRACT_ID` | Deployed billing contract | — |
| `NEXT_PUBLIC_TOKEN_CONTRACT_ID` | Token contract (USDC etc.) | — |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | `https://sorobill-app.vercel.app` |
| `NEXT_PUBLIC_WEBHOOK_SECRET` | HMAC secret for webhook signing | — |

> **Note:** The app runs fully on mock data without contract IDs. Set them to connect to real Soroban contracts.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Merchant dashboard
│   │   ├── page.tsx        # Overview + stats
│   │   ├── plans/          # Plan management
│   │   ├── subscribers/    # Subscriber list
│   │   └── analytics/      # Revenue charts
│   ├── subscriptions/      # User subscription pages
│   │   ├── page.tsx        # Active subscriptions
│   │   └── billing/        # Billing schedule + history
│   ├── onboarding/         # Merchant onboarding wizard
│   ├── webhooks/           # Webhook simulator
│   ├── layout.tsx          # Root layout + providers
│   └── globals.css         # Tailwind + CSS variables
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── plan-card.tsx       # Subscription plan card
│   ├── billing-table.tsx   # Transaction history table
│   ├── wallet-button.tsx   # Connect/disconnect wallet
│   ├── status-badge.tsx    # Tx/subscription status
│   ├── stats-card.tsx      # KPI metric card
│   ├── revenue-chart.tsx   # Recharts area chart
│   ├── notification-bell.tsx
│   ├── create-plan-dialog.tsx
│   ├── navbar.tsx
│   └── states.tsx          # Loading / error / empty states
├── hooks/
│   ├── use-freighter.ts    # Freighter wallet integration
│   └── use-sorobill.ts    # React Query data hooks
├── stores/
│   ├── wallet-store.ts     # Zustand wallet state
│   ├── notification-store.ts
│   └── onboarding-store.ts
├── lib/
│   ├── api.ts              # API abstraction layer
│   ├── stellar.ts          # Soroban client setup
│   ├── mock-data.ts        # Development mock data
│   ├── env.ts              # Typed environment config
│   └── utils.ts            # Shared utilities
└── types/
    └── index.ts            # All TypeScript types
```

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for a deeper dive into design decisions.

---

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data flow, contract integration |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | How to contribute, PR process, code style |
| [SECURITY.md](docs/SECURITY.md) | Security policy and responsible disclosure |
| [CHANGELOG.md](docs/CHANGELOG.md) | Version history |

---

## Roadmap

- [x] Real Soroban contract integration (subscription + billing contracts)
- [ ] Freighter Wallet Kit multi-wallet support (xBull, Lobstr, etc.)
- [x] Subscriber interface + plan share links
- [ ] Email notifications via Resend
- [ ] Stripe-style hosted payment pages
- [ ] Mobile-responsive PWA
- [ ] Multi-merchant support with team roles
- [ ] CSV export for billing history

---

## Sister repositories

| Repo | Role |
|------|------|
| [Sorobill-Contract](https://github.com/Sorobill/Sorobill-Contract) | Soroban subscription protocol |
| [Sorobill-Backend](https://github.com/Sorobill/Sorobill-Backend) | Billing API, scheduler, webhooks |
| [Sorobill-App](https://github.com/Sorobill/Sorobill-App) | Merchant + subscriber UI (this repo) |

---

## Contributing

We welcome contributions of all kinds — bug fixes, features, docs, and tests.

- **5-Minute Quick Start**: Jump in right away with mock mode via the [Quick Start Guide in CONTRIBUTING.md](docs/CONTRIBUTING.md#quick-start--5-minutes).
- **Pre-PR Quality Gate**: Always ensure `npm test` and `npm run build` (or `npm run verify`) pass cleanly before opening a pull request.
- Read the full [CONTRIBUTING.md](docs/CONTRIBUTING.md) guide for details on development workflow, code conventions, and architecture.

---

## License

[MIT](LICENSE) © Sorobill Contributors

## Checkout

- Public plans: `/plans`
- Pay link: `/pay/[planId]`
- Demo: `docs/DEMO_SCRIPT.md`
