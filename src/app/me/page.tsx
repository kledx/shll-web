"use client";

import { AppShell } from "@/components/ui/app-shell";
import { MyRentalsList } from "@/components/dashboard/my-rentals-list";

export default function MePage() {
    return (
        <AppShell>
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-[var(--color-burgundy)]">My Dashboard</h1>
                    <p className="text-muted-foreground mt-2">Manage your rented agents and view your history.</p>
                </div>

                <MyRentalsList />
            </div>
        </AppShell>
    );
}
