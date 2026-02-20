"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { MyRentalsList } from "@/components/dashboard/my-rentals-list";
import { useTranslation } from "@/hooks/useTranslation";
import { useAccount } from "wagmi";
import { Wallet } from "lucide-react";

export default function MePage() {
    const { t, language } = useTranslation();
    const { isConnected } = useAccount();

    return (
        <AppShell fullWidth contentClassName="mx-auto max-w-5xl">
            <div className="space-y-8">
                <PageHeader title={t.dashboard.page.title} subtitle={t.dashboard.page.subtitle} />

                {isConnected ? (
                    <MyRentalsList />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl">
                        <Wallet className="h-12 w-12 text-[var(--color-muted-foreground)] opacity-40 mb-4" />
                        <p className="text-lg font-medium text-[var(--color-foreground)] mb-1">
                            {language === "zh" ? "请先连接钱包" : "Connect your wallet"}
                        </p>
                        <p className="text-sm text-[var(--color-muted-foreground)] mb-5">
                            {language === "zh" ? "连接钱包后即可查看您的 Agent" : "Connect to view your agents and rentals"}
                        </p>
                        <appkit-button />
                    </div>
                )}
            </div>
        </AppShell>
    );
}
