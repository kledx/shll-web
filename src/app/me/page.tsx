"use client";

import { AppShell } from "@/components/ui/app-shell";
import { MyRentalsList } from "@/components/dashboard/my-rentals-list";
import { useTranslation } from "@/hooks/useTranslation";

export default function MePage() {
    const { t } = useTranslation();

    return (
        <AppShell>
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="rounded-2xl border border-[var(--color-border)] bg-white/72 p-6 shadow-[var(--shadow-soft)] md:p-8">
                    <h1 className="page-title">
                        {t.dashboard.page.title}
                    </h1>
                    <p className="page-subtitle mt-3 text-base md:text-lg">
                        {t.dashboard.page.subtitle}
                    </p>
                </div>

                <MyRentalsList />
            </div>
        </AppShell>
    );
}
