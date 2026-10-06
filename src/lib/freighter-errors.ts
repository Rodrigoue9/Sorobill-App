/** Map Freighter / wallet failures to actionable copy. */
export function freighterUserMessage(err: unknown): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "Failed to connect wallet";
  const lower = raw.toLowerCase();
  if (lower.includes("not found") || lower.includes("not installed")) {
    return "Freighter wallet not found. Install the Freighter browser extension, then refresh this page.";
  }
  if (lower.includes("rejected") || lower.includes("denied") || lower.includes("user")) {
    return "Wallet request was rejected. Unlock Freighter and approve access to continue.";
  }
  if (lower.includes("network")) {
    return `${raw} Switch Freighter to Testnet for demos.`;
  }
  if (lower.includes("bad union switch") || lower.includes("union switch")) {
    return "Wallet/SDK protocol mismatch. Refresh the page, reconnect Freighter on Testnet, and try again.";
  }
  if (lower.includes("not currently connected") || lower.includes("not allowed")) {
    return "Allow sorobill-app.vercel.app in Freighter, then reconnect and try again.";
  }
  return raw;
}
