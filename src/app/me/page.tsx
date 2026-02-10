"use client";

import { AppShell } from "@/components/ui/app-shell";

export default function MePage() {
    return (
        <AppShell>
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-serif font-bold text-[var(--color-burgundy)]">
                        My Rentals
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your active agent leases and vault balances.
                    </p>
                </div>

                <div className="p-12 text-center border-2 border-dashed border-[var(--color-burgundy)]/20 rounded-xl bg-[var(--color-paper)]/50">
                    <p className="text-muted-foreground">Coming in Milestone 5...</p>
                </div>
            </div>
        </AppShell>
    );
}
