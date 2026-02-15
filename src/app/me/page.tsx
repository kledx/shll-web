"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { MyRentalsList } from "@/components/dashboard/my-rentals-list";
import { useTranslation } from "@/hooks/useTranslation";

export default function MePage() {
    const { t } = useTranslation();

    return (
        <AppShell fullWidth contentClassName="mx-auto max-w-5xl">
            <div className="space-y-8">
                <PageHeader title={t.dashboard.page.title} subtitle={t.dashboard.page.subtitle} />

                <MyRentalsList />
            </div>
        </AppShell>
    );
}
