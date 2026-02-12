"use client";

import { AppShell } from "@/components/ui/app-shell";

import { MarketplaceList } from "@/components/business/marketplace-list";
import { useTranslation } from "@/hooks/useTranslation";

export default function Home() {
  const { t } = useTranslation();

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-serif font-bold text-[var(--color-burgundy)]">
            {t.marketplace.title}
          </h1>
          <p className="text-muted-foreground">
            {t.marketplace.subtitle}
          </p>
        </div>

        <MarketplaceList />
      </div>
    </AppShell>
  );
}
