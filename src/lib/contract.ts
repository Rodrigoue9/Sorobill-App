/**
 * Shared Soroban helpers: account lookup and signed invoke plumbing.
 */

import {
  Contract,
  TransactionBuilder,
  Account,
  Address,
  nativeToScVal,
  BASE_FEE,
  rpc,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";
import { signTransaction, isAllowed, setAllowed, requestAccess } from "@stellar/freighter-api";
import { env } from "@/lib/env";
import { NETWORK_PASSPHRASE, sorobanServer } from "@/lib/stellar";
import type { BillingInterval, CreatePlanInput } from "@/types";

function freighterErrorMessage(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const err = (value as { error?: unknown }).error;
  if (!err) return null;
  if (typeof err === "string") return err;
  if (typeof err === "object" && err && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
}

async function ensureFreighterAllowed(): Promise<void> {
  const allowed = await isAllowed();
  const isOk =
    typeof allowed === "object" && allowed
      ? Boolean((allowed as { isAllowed?: boolean }).isAllowed)
      : Boolean(allowed);
  if (isOk) return;
  const access = await setAllowed().catch(async () => requestAccess());
  const err = freighterErrorMessage(access);
  if (err) throw new Error(err);
}

export function toI128Amount(amount: string, decimals = 7): xdr.ScVal {
  const [whole = "0", fraction = ""] = amount.split(".");
  const padded = (fraction + "0".repeat(decimals)).slice(0, decimals);
  const raw = BigInt(whole + padded);
  return nativeToScVal(raw, { type: "i128" });
}

/** Encode contract BillingInterval unit variants for Soroban. */
export function billingIntervalToScVal(interval: BillingInterval): xdr.ScVal {
  const tag =
    interval === "daily"
      ? "Daily"
      : interval === "weekly"
        ? "Weekly"
        : interval === "yearly"
          ? "Yearly"
          : "Monthly";
  return xdr.ScVal.scvVec([xdr.ScVal.scvSymbol(tag)]);
}

export async function getSourceAccount(publicKey: string) {
  const account = await sorobanServer.getAccount(publicKey);
  return new Account(account.accountId(), account.sequenceNumber());
}

export async function prepareSignAndSend(
  publicKey: string,
  contractId: string,
  buildOp: (contract: Contract) => xdr.Operation
): Promise<{ hash: string; signedXdr: string; result: unknown }> {
  if (!contractId) {
    throw new Error(
      "Soroban contract ID is not configured. Set NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ID (or the token contract id) in .env.local."
    );
  }

  const source = await getSourceAccount(publicKey);
  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(buildOp(contract))
    .setTimeout(180)
    .build();

  const simulated = await sorobanServer.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulated)) {
    throw new Error(
      simulated.error ??
        "Soroban simulation failed. Check Freighter network (Testnet), account funds, and contract IDs."
    );
  }

  const prepared = await sorobanServer.prepareTransaction(tx);
  await ensureFreighterAllowed();
  const signResult = await signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: publicKey,
  });

  const signErr = freighterErrorMessage(signResult);
  if (signErr) {
    throw new Error(signErr);
  }

  const signedXdr =
    typeof signResult === "string"
      ? signResult
      : (signResult as { signedTxXdr?: string }).signedTxXdr;

  if (!signedXdr) {
    throw new Error(
      "Freighter did not return signed XDR. Unlock the wallet, allow this site, and approve the prompt."
    );
  }

  const sent = await sorobanServer.sendTransaction(
    TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE)
  );

  if (sent.status === "ERROR") {
    throw new Error(
      `Soroban rejected the transaction${sent.errorResult ? `: ${sent.errorResult}` : ""}.`
    );
  }

  let status = await sorobanServer.getTransaction(sent.hash);
  const started = Date.now();
  while (status.status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
    if (Date.now() - started > 60_000) {
      throw new Error(
        `Timed out waiting for transaction ${sent.hash}. Check Stellar Expert or retry shortly.`
      );
    }
    await new Promise((r) => setTimeout(r, 1500));
    status = await sorobanServer.getTransaction(sent.hash);
  }

  if (status.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error(`Soroban transaction failed: ${sent.hash}`);
  }

  let result: unknown = null;
  try {
    result =
      status.returnValue !== undefined ? scValToNative(status.returnValue) : null;
  } catch {
    result = null;
  }

  return { hash: sent.hash, signedXdr, result };
}

export function requireSubscriptionContractId(): string {
  const id = env.contracts.subscription;
  if (!id) {
    throw new Error(
      "NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ID is not configured. Copy it from Sorobill-Contract DEPLOYMENTS.md."
    );
  }
  return id;
}

export function requireTokenContractId(): string {
  const id = env.contracts.token;
  if (!id) {
    throw new Error(
      "NEXT_PUBLIC_TOKEN_CONTRACT_ID is not configured. Set the SAC/token contract id for approve + pay."
    );
  }
  return id;
}

/**
 * Invoke subscription contract `create_plan` via Freighter.
 * Matches contract 0.3: (merchant, name, description, price, interval, token).
 */
export async function invokeCreatePlan(
  merchantPublicKey: string,
  input: CreatePlanInput,
  tokenContractId = requireTokenContractId()
): Promise<{ hash: string; contractPlanId: number }> {
  const contractId = requireSubscriptionContractId();
  const { hash, result } = await prepareSignAndSend(merchantPublicKey, contractId, (contract) =>
    contract.call(
      "create_plan",
      Address.fromString(merchantPublicKey).toScVal(),
      nativeToScVal(input.name, { type: "string" }),
      nativeToScVal(input.description ?? "", { type: "string" }),
      toI128Amount(input.price),
      billingIntervalToScVal(input.interval),
      Address.fromString(tokenContractId).toScVal()
    )
  );

  const contractPlanId = Number(result);
  if (!Number.isFinite(contractPlanId) || contractPlanId < 0) {
    throw new Error(
      "create_plan did not return a valid on-chain plan id. Confirm the contract version matches this app."
    );
  }

  return { hash, contractPlanId };
}

/**
 * Invoke subscription contract `subscribe` via Freighter.
 * planId must be the on-chain u64 plan id (contractPlanId), not the API UUID.
 */
export async function invokeSubscribe(
  subscriberPublicKey: string,
  contractPlanId: number | string
): Promise<{ hash: string }> {
  const planId = typeof contractPlanId === "string" ? Number(contractPlanId) : contractPlanId;
  if (!Number.isFinite(planId) || planId < 0) {
    throw new Error(
      "Invalid on-chain plan id for subscribe. This API plan may be missing contractPlanId."
    );
  }

  const contractId = requireSubscriptionContractId();
  const { hash } = await prepareSignAndSend(subscriberPublicKey, contractId, (contract) =>
    contract.call(
      "subscribe",
      Address.fromString(subscriberPublicKey).toScVal(),
      nativeToScVal(BigInt(planId), { type: "u64" })
    )
  );
  return { hash };
}

/** Approve the subscription contract to spend token balance. */
export async function invokeApproveToken(
  ownerPublicKey: string,
  amount: string,
  decimals = 7
): Promise<{ hash: string }> {
  const tokenId = requireTokenContractId();
  const spender = requireSubscriptionContractId();
  // SAC approve requires expiration_ledger > current ledger
  const latest = await sorobanServer.getLatestLedger();
  const expirationLedger = latest.sequence + 200_000;

  const { hash } = await prepareSignAndSend(ownerPublicKey, tokenId, (token) =>
    token.call(
      "approve",
      Address.fromString(ownerPublicKey).toScVal(),
      Address.fromString(spender).toScVal(),
      toI128Amount(amount, decimals),
      nativeToScVal(expirationLedger, { type: "u32" })
    )
  );
  return { hash };
}
