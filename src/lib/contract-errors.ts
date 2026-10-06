/** Map Soroban / Sorobill HostError messages to short UI copy. */
export function contractUserMessage(err: unknown): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "Transaction failed";

  // SorobillError u32 codes from docs/ERROR_CATALOG.md
  const codeMatch = raw.match(/Error\(Contract,\s*#(\d+)\)/i) || raw.match(/Contract.*?(\d+)/);
  const code = codeMatch ? Number(codeMatch[1]) : NaN;

  switch (code) {
    case 2:
      return "Plan not found on-chain. The demo plan may need to be recreated.";
    case 3:
      return "This plan is inactive. Ask the merchant to reactivate it.";
    case 4:
      return "You're already subscribed to this plan on Testnet. Open Stellar Expert or try /pay/plan_2.";
    case 5:
      return "No subscription found for this wallet and plan.";
    case 8:
      return "Insufficient balance. Fund your Freighter Testnet wallet with XLM (Friendbot).";
    default:
      break;
  }

  if (/already.?subscribed/i.test(raw)) {
    return "You're already subscribed to this plan on Testnet. Try /pay/plan_2 with a fresh plan.";
  }
  if (/bad union switch/i.test(raw)) {
    return "Wallet/SDK protocol mismatch. Hard refresh, reconnect Freighter on Testnet, try again.";
  }
  if (/User declined|rejected|denied/i.test(raw)) {
    return "Freighter request was rejected. Unlock the wallet and confirm both prompts.";
  }

  // Keep HostError dumps out of the UI when we can
  if (raw.includes("HostError") || raw.includes("Diagnostic Event")) {
    return "On-chain subscribe failed. If you already subscribed once, try /pay/plan_2 or another Freighter account.";
  }

  return raw.length > 220 ? `${raw.slice(0, 220)}…` : raw;
}
