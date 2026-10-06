"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PayHero } from "@/components/pay-hero";
import { WalletButton } from "@/components/wallet-button";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { canLiveCheckout, env } from "@/lib/env";
import { mapApiPlan, type ApiPlan } from "@/lib/plan-mapper";
import { validateApiPlan } from "@/lib/validate-api-plan";
import { formatAssetAmount, formatInterval } from "@/lib/format";
import { invokeApproveToken, invokeSubscribe } from "@/lib/contract";
import { useWalletStore } from "@/stores/wallet-store";
import { SUBSCRIBE_COPY } from "@/lib/subscribe-copy";
import { networkHint } from "@/lib/network-label";
import { announce } from "@/lib/a11y";
import { getExplorerUrl } from "@/lib/stellar";
import { contractUserMessage } from "@/lib/contract-errors";

async function fetchPlan(id: string): Promise<ApiPlan> {
  if (env.app.useMock) {
    // Keep in sync with /plans mock list — plan_1 is the Loom Starter demo
    const catalog: Record<string, Pick<ApiPlan, "name" | "amount" | "contractPlanId">> = {
      plan_1: { name: "Starter", amount: "9.99", contractPlanId: 3 },
      plan_2: { name: "Pro", amount: "29.99", contractPlanId: 2 },
      plan_3: { name: "Enterprise", amount: "99.99", contractPlanId: 1 },
    };
    const row = catalog[id] ?? catalog.plan_1;
    return {
      id,
      name: row.name,
      description: "Recurring payment settled on Stellar Soroban.",
      amount: row.amount,
      assetCode: "XLM",
      interval: "MONTHLY",
      isActive: true,
      merchantAddress: "GALOSD22UK656K2CP4VP4I45I3GSAZQXSEBFSO6CPZTCLU2QBJXZSZFI",
      contractPlanId: row.contractPlanId,
      createdAt: new Date().toISOString(),
    };
  }
  const res = await fetch(`${env.app.apiUrl.replace(/\/$/, "")}/plans/${id}`);
  if (!res.ok) throw new Error("Plan not found. Check the share link or ask the merchant for a new one.");
  const json: unknown = await res.json();
  return validateApiPlan(json);
}

export default function PayPlanPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = use(params);
  const address = useWalletStore((s) => s.address);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [txUrl, setTxUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["pay-plan", planId],
    queryFn: () => fetchPlan(planId),
  });

  async function handleSubscribe() {
    if (!address || !data) return;
    const onChainId = data.contractPlanId;
    if (onChainId == null) {
      setErrorMsg(SUBSCRIBE_COPY.missingContractPlan);
      return;
    }

    setBusy(true);
    setErrorMsg(null);
    setStatus(null);
    setTxUrl(null);
    try {
      // Fixture plans can still drive real Freighter when contract IDs are configured
      if (env.app.useMock && !canLiveCheckout()) {
        setStatus(SUBSCRIBE_COPY.mockSuccess);
        announce(SUBSCRIBE_COPY.mockSuccess);
        return;
      }
      const approveAmount = String(Number(data.amount) * 12);
      setStatus(`Approving allowance for on-chain plan ${onChainId}…`);
      announce("Approving token allowance");
      const approve = await invokeApproveToken(address, approveAmount);
      setStatus(`Allowance set · ${approve.hash.slice(0, 10)}… Signing subscribe…`);
      announce("Signing subscribe transaction");
      const { hash } = await invokeSubscribe(address, onChainId);
      const url = getExplorerUrl(hash);
      setTxUrl(url);
      const ok = `Subscribed on Testnet (plan ${onChainId}) · ${hash.slice(0, 10)}…`;
      setStatus(ok);
      announce(ok);
    } catch (err) {
      setErrorMsg(contractUserMessage(err));
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return <LoadingState label="Loading plan…" />;
  if (error) {
    return (
      <ErrorState
        title="Could not load plan"
        message={error instanceof Error ? error.message : "Unknown error"}
        onRetry={() => refetch()}
      />
    );
  }
  if (!data) {
    return (
      <EmptyState title="Plan not found" description="Check the share link and try again." />
    );
  }

  const plan = mapApiPlan(data);

  return (
    <main className="checkout-rail min-h-screen">
      <div className="mx-auto max-w-lg px-6 py-8 sm:py-12">
        <header className="mb-10 flex items-center justify-between">
          <BrandMark />
          <WalletButton />
        </header>

        <PayHero
          planName={plan.name}
          priceLabel={formatAssetAmount(plan.price, plan.asset)}
          intervalLabel={formatInterval(plan.interval)}
        />

        <section id="subscribe" className="mt-8 space-y-5">
          <h2 className="text-lg font-semibold">Subscribe</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {plan.description || "Recurring payment settled on Stellar Soroban."}
          </p>

          <div className="space-y-3 border border-border bg-background p-5">
            {!address ? (
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {SUBSCRIBE_COPY.ctaDisconnected}. {networkHint()}.
              </p>
            ) : (
              <Button
                className="w-full"
                size="lg"
                aria-label={`Subscribe to ${plan.name}`}
                disabled={busy}
                onClick={() => void handleSubscribe()}
              >
                {busy ? SUBSCRIBE_COPY.freighterBusy : SUBSCRIBE_COPY.ctaConnected}
              </Button>
            )}
            {status && (
              <p className="text-sm text-sea">
                {status}
                {txUrl && (
                  <>
                    {" "}
                    <a
                      href={txUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2"
                    >
                      View on Stellar Expert
                    </a>
                  </>
                )}
              </p>
            )}
            {errorMsg && (
              <p className="text-sm text-destructive" role="alert">
                {errorMsg}
              </p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Merchant{" "}
            <span className="font-mono">{plan.merchantId || "—"}</span>
            {" · "}
            <Link href="/plans" className="text-sea hover:underline">
              All plans
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
