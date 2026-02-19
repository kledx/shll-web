"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { ShieldCheck } from "lucide-react";

export type LeaseStatus = "NOT_RENTED" | "RENTED_ACTIVE" | "RENTED_EXPIRED";

interface StatusCardProps {
    tokenId: string;
    leaseStatus: LeaseStatus;
    leaseExpires?: number;
    agentType?: string;
    language?: "en" | "zh";
}

const copy = {
    en: {
        title: "Status Overview",
        leaseLabels: {
            NOT_RENTED: "Not Rented",
            RENTED_ACTIVE: "Lease Active",
            RENTED_EXPIRED: "Lease Expired",
        },
        tokenLabel: "Token ID",
        leaseExpiresLabel: "Lease Expires",
        agentTypeLabel: "Agent Type",
        safetyTags: {
            noPrivateKeys: "No private keys",
            noWithdrawByRunner: "No withdrawals by runner",
            policyEnforced: "Policy enforced",
        },
    },
    zh: {
        title: "状态概览",
        leaseLabels: {
            NOT_RENTED: "未租用",
            RENTED_ACTIVE: "租期生效中",
            RENTED_EXPIRED: "租期已过期",
        },
        tokenLabel: "Token ID",
        leaseExpiresLabel: "租期到期",
        agentTypeLabel: "Agent 类型",
        safetyTags: {
            noPrivateKeys: "无私钥暴露",
            noWithdrawByRunner: "Runner 不可提现",
            policyEnforced: "策略强约束",
        },
    },
};

export function StatusCard({
    tokenId,
    leaseStatus,
    leaseExpires,
    agentType,
    language = "en",
}: StatusCardProps) {
    const ui = copy[language];
    const leaseLabel = ui.leaseLabels[leaseStatus];
    const leaseExpiresText = leaseExpires && leaseExpires > 0
        ? new Date(leaseExpires * 1000).toLocaleString()
        : "-";

    return (
        <Card className="border-[var(--color-border)] bg-white/72">
            <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <ShieldCheck className="h-5 w-5 text-[var(--color-primary)]" />
                        {ui.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                        <Chip variant={leaseStatus === "RENTED_ACTIVE" ? "sky" : "secondary"}>{leaseLabel}</Chip>
                        {agentType && (
                            <Chip variant="burgundy">{agentType}</Chip>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/35 p-3">
                        <div className="text-sm text-[var(--color-muted-foreground)]">{ui.tokenLabel}</div>
                        <div className="font-semibold">#{tokenId}</div>
                    </div>
                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/35 p-3">
                        <div className="text-sm text-[var(--color-muted-foreground)]">{ui.leaseExpiresLabel}</div>
                        <div className="font-semibold">{leaseExpiresText}</div>
                    </div>
                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/35 p-3">
                        <div className="text-sm text-[var(--color-muted-foreground)]">{ui.agentTypeLabel}</div>
                        <div className="font-semibold">{agentType || "-"}</div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                    <Chip variant="secondary">{ui.safetyTags.noPrivateKeys}</Chip>
                    <Chip variant="secondary">{ui.safetyTags.noWithdrawByRunner}</Chip>
                    <Chip variant="secondary">{ui.safetyTags.policyEnforced}</Chip>
                </div>
            </CardContent>
        </Card>
    );
}
