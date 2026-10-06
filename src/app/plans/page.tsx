"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PlanCard } from "@/components/plan-card";
import { BrandMark } from "@/components/brand-mark";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { SiteFooter } from "@/components/site-footer";
import { env } from "@/lib/env";
import { mapApiPlan, type ApiPlan } from "@/lib/plan-mapper";

async function fetchPublicPlans(): Promise<ApiPlan[]> {
  if (env.app.useMock) {
    return [
      {
        id: "plan_1",
        name: "Starter",
        description: "For indie merchants shipping their first paid product.",
        amount: "9.99",
        assetCode: "XLM",
        interval: "MONTHLY",
        isActive: true,
        // Live Testnet plan id (must match pay/[planId] fixture)
        contractPlanId: 3,
        createdAt: new Date().toISOString(),
      },
      {
        id: "plan_2",
        name: "Pro",
        description: "Higher volume with priority settlement tooling.",
        amount: "29.99",
        assetCode: "XLM",
        interval: "MONTHLY",
        isActive: true,
        contractPlanId: 2,
        createdAt: new Date().toISOString(),
      },
      {
        id: "plan_3",
        name: "Enterprise",
        description: "Custom intervals and dedicated webhook SLAs.",
        amount: "99.99",
        assetCode: "XLM",
        interval: "MONTHLY",
        isActive: true,
        contractPlanId: 1,
        createdAt: new Date().toISOString(),
      },
    ];
  }
  const res = await fetch(`${env.app.apiUrl.replace(/\/$/, "")}/plans`);
  if (!res.ok) throw new Error("Failed to load plans");
  return res.json();
}

export default function PlansMarketplacePage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["public-plans"],
    queryFn: fetchPublicPlans,
  });

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-8 sm:py-10">
        <header className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <BrandMark className="mb-6" />
            <h1 className="text-3xl font-semibold sm:text-4xl">Explore plans</h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Public subscription offerings settling on Stellar. Pick a plan to open checkout.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm text-sea hover:underline">
            Merchant console →
          </Link>
        </header>

        {isLoading && <LoadingState label="Loading plans…" />}
        {error && (
          <ErrorState
            title="Could not load plans"
            message={error instanceof Error ? error.message : "Unknown error"}
            onRetry={() => refetch()}
          />
        )}
        {data && data.length === 0 && (
          <EmptyState title="No plans yet" description="Merchants have not published plans." />
        )}
        {data && data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((raw) => {
              const plan = mapApiPlan(raw);
              return <PlanCard key={plan.id} plan={plan} href={`/pay/${plan.id}`} />;
            })}
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
