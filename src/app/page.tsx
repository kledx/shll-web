"use client";

import { AppShell } from "@/components/ui/app-shell";

import { MarketplaceList } from "@/components/business/marketplace-list";
import { useTranslation } from "@/hooks/useTranslation";

export default function Home() {
  const { t } = useTranslation();

  return (
    <AppShell>
      <div className="space-y-8">
        <section className="rounded-2xl border border-[var(--color-border)] bg-white/72 p-6 shadow-[var(--shadow-soft)] md:p-8">
          <h1 className="page-title">
            {t.marketplace.title}
          </h1>
          <p className="page-subtitle mt-3 text-base md:text-lg">
            {t.marketplace.subtitle}
          </p>
        </section>

        <MarketplaceList />
      </div>
    </AppShell>
  );
}
