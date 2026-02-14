"use client";

import { AppShell } from "@/components/ui/app-shell";
import { MyRentalsList } from "@/components/dashboard/my-rentals-list";
import { useTranslation } from "@/hooks/useTranslation";

export default function MePage() {
    const { t } = useTranslation();

    return (
        <AppShell>
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-[var(--color-burgundy)]">
                        {t.dashboard.page.title}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {t.dashboard.page.subtitle}
                    </p>
                </div>

                <MyRentalsList />
            </div>
        </AppShell>
    );
}
