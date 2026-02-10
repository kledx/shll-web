"use client";

import { AppShell } from "@/components/ui/app-shell";
import { ChainBar } from "@/components/business/chain-bar";
import { MarketplaceList } from "@/components/business/marketplace-list";

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-serif font-bold text-[var(--color-burgundy)]">
            Marketplace
          </h1>
          <p className="text-muted-foreground">
            Rent autonomous AI agents safely secured by on-chain policies.
          </p>
        </div>

        <ChainBar />

        <MarketplaceList />
      </div>
    </AppShell>
  );
}
