# 90-Second Testnet Demo Walkthrough

A fast, repeatable end-to-end verification walkthrough designed for **GrantFox reviewers**, evaluators, and contributors testing the live hosted deployment of Sorobill.

> **Target Time:** ~90 seconds  
> **Prerequisites:** A web browser with the [Freighter Wallet](https://www.freighter.app/) extension installed, set to **Testnet**, and funded with testnet XLM.  
> **Zero Local Setup:** 100% hosted flow on Vercel — no Docker, local backend, or CLI tools required.

---

## Step-by-Step Walkthrough

```text
[0:00 - 0:15] Open Hosted App (https://sorobill-app.vercel.app)
      │
[0:15 - 0:30] Connect Freighter Wallet on Stellar Testnet
      │
[0:30 - 0:50] Browse Plans (/plans) & Open Checkout (/pay/[planId])
      │
[0:50 - 1:15] Approve SEP-41 Token Allowance & Confirm Subscribe
      │
[1:15 - 1:30] Verify Subscription & Inspect Transaction on Stellar Expert
```

### Step 1: Launch Hosted App (`0:00 - 0:15` | ~15s)
1. Navigate directly to the live production deployment: **https://sorobill-app.vercel.app**.
2. Observe the brand hero highlighting recurring Soroban subscriptions on Stellar.
3. Verify the network status badge displays **Testnet** in the top navigation bar.

### Step 2: Connect Freighter Wallet (`0:15 - 0:30` | ~15s)
1. Click the **Connect Wallet** button (`WalletButton`) located in the header.
2. Approve the connection prompt in Freighter.
3. The header now reflects your connected Stellar public key (`G...`) with quick access to the account details on Stellar Expert.

### Step 3: Browse Plans & Open Checkout (`0:30 - 0:50` | ~20s)
1. Click **Plans** in the navigation bar to visit `/plans`.
2. Browse active plans loaded on-chain or via live API defaults (e.g. *Pro Plan*, *Starter Plan*).
3. Click the checkout button on any plan card or open its direct public link `/pay/[planId]`.
4. The checkout page loads the `PayHero` component displaying:
   - Plan Name & Description
   - Recurring Price & Interval (e.g., `10 XLM / Monthly`)
   - Designated SEP-41 asset code (`XLM`)

### Step 4: Token Allowance Approval & Subscribe Action (`0:50 - 1:15` | ~25s)
1. On the checkout page (`/pay/[planId]`), review the subscription breakdown.
2. Click **Subscribe with Freighter**.
3. **Allowance Approval (SEP-41)**:
   - Freighter prompts to sign a token allowance transaction granting the Sorobill smart contract permission to pull recurring payments up to the specified plan limit.
   - Click **Approve** in Freighter.
4. **On-Chain Subscription**:
   - Immediately following allowance confirmation, Freighter prompts the contract invocation to execute `subscribe(subscriber, plan_id)` against the Sorobill core contract.
   - Click **Sign Transaction**.

### Step 5: On-Chain Confirmation & Stellar Expert Verification (`1:15 - 1:30` | ~15s)
1. The UI displays an active confirmation state upon block inclusion.
2. A success badge appears showing:
   - Subscription Status: **Active**
   - Next Billing Date
   - Shortened Transaction Hash link (e.g., `4f7a3bc5…`) powered by `TxExplorerLink`.
3. Click the transaction link to open the verified ledger record on **Stellar Expert Testnet** (`https://stellar.expert/explorer/testnet/tx/...`), proving true decentralized Soroban settlement.

---

## Sister Repositories & Architecture

Sorobill operates as a coordinated 3-tier architecture:

| Component | Repository | Role |
| :--- | :--- | :--- |
| **Contracts** | [Sorobill-Contract](https://github.com/Sorobill/Sorobill-Contract) | Core Soroban smart contract managing plans, subscriptions, and periodic billing execution. |
| **Backend** | [Sorobill-Backend](https://github.com/Sorobill/Sorobill-Backend) | Fastify REST API, Soroban RPC event poller, indexer, and automated billing runner. |
| **Frontend** | [Sorobill-App](https://github.com/Sorobill/Sorobill-App) | Next.js 15 merchant dashboard, subscriber portal, and public checkout interface. |

For detailed documentation on the checkout state machine and error handling, consult:
- [`docs/PAY_FLOW.md`](./PAY_FLOW.md)
- [`docs/FREIGHTER.md`](./FREIGHTER.md)
- [`docs/SISTER_REPOS.md`](./SISTER_REPOS.md)
