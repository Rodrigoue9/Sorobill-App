export const env = {
  stellar: {
    network: (process.env.NEXT_PUBLIC_STELLAR_NETWORK as "testnet" | "mainnet") || "testnet",
    rpcUrl: process.env.NEXT_PUBLIC_STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org",
    horizonUrl:
      process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL ?? "https://horizon-testnet.stellar.org",
    passphrase:
      process.env.NEXT_PUBLIC_STELLAR_PASSPHRASE ?? "Test SDF Network ; September 2015",
  },
  contracts: {
    subscription:
      process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ID ||
      "CDENNEELMOUKIJGCSQUQ535FP53KRKNYA2PO7TOCI6O6IZVWZBYFML4W",
    billing: process.env.NEXT_PUBLIC_BILLING_CONTRACT_ID ?? "",
    // Native XLM SAC on Testnet — used by the public Freighter checkout demo
    token:
      process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ID ||
      "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    name: process.env.NEXT_PUBLIC_APP_NAME ?? "Sorobill",
    apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1",
    // Default mock on for easy demos; set NEXT_PUBLIC_USE_MOCK=false for live API
    useMock: process.env.NEXT_PUBLIC_USE_MOCK !== "false",
  },
  webhookSecret: process.env.NEXT_PUBLIC_WEBHOOK_SECRET ?? "",
} as const;

/** True when Testnet contract IDs are set — Freighter approve/subscribe can run. */
export function canLiveCheckout(): boolean {
  return Boolean(env.contracts.subscription && env.contracts.token);
}
