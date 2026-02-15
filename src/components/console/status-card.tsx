"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { ShieldCheck } from "lucide-react";
import { ConsoleCopy } from "@/lib/console/console-copy";

export type LeaseStatus = "NOT_RENTED" | "RENTED_ACTIVE" | "RENTED_EXPIRED";
export type PackStatus = "PACK_NONE" | "PACK_LOADING" | "PACK_VALID" | "PACK_INVALID";
export type RunnerMode = "manual" | "managed" | "external";

interface StatusCardProps {
    tokenId: string;
    leaseStatus: LeaseStatus;
    leaseExpires?: number;
    packStatus: PackStatus;
    vaultURI?: string;
    vaultHash?: string;
    runnerMode: RunnerMode;
    policySummary?: {
        maxDeadlineWindow: number;
        maxPathLength: number;
        allowedTokens: number;
        allowedSpenders: number;
    };
    ui: ConsoleCopy["status"];
}

export function StatusCard({
    tokenId,
    leaseStatus,
    leaseExpires,
    packStatus,
    vaultURI,
    vaultHash,
    runnerMode,
    policySummary,
    ui,
}: StatusCardProps) {
    const leaseLabel = ui.leaseLabels[leaseStatus];
    const packLabel = ui.packLabels[packStatus];
    const modeLabel = ui.modeLabels[runnerMode];
    const leaseExpiresText = leaseExpires && leaseExpires > 0
        ? new Date(leaseExpires * 1000).toLocaleString()
        : "-";
    const shortHash = vaultHash
        ? `${vaultHash.slice(0, 10)}...${vaultHash.slice(-8)}`
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
                        <Chip variant={packStatus === "PACK_VALID" ? "burgundy" : packStatus === "PACK_INVALID" ? "destructive" : "outline"}>
                            {packLabel}
                        </Chip>
                        <Chip variant="secondary">{modeLabel}</Chip>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/35 p-3">
                        <div className="text-xs text-[var(--color-muted-foreground)]">{ui.token}</div>
                        <div className="font-semibold">#{tokenId}</div>
                    </div>
                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/35 p-3">
                        <div className="text-xs text-[var(--color-muted-foreground)]">{ui.leaseExpires}</div>
                        <div className="font-semibold">{leaseExpiresText}</div>
                    </div>
                </div>

                <div className="space-y-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/35 p-3">
                    <div className="text-xs text-[var(--color-muted-foreground)]">{ui.vaultUri}</div>
                    <div className="font-mono text-xs break-all">{vaultURI || "-"}</div>
                    <div className="pt-1 text-xs text-[var(--color-muted-foreground)]">{ui.vaultHash}</div>
                    <div className="font-mono text-xs">{shortHash}</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/35 p-3">
                        <div className="text-xs text-[var(--color-muted-foreground)]">{ui.maxDeadline}</div>
                        <div className="font-semibold">{policySummary?.maxDeadlineWindow ?? 0}s</div>
                    </div>
                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/35 p-3">
                        <div className="text-xs text-[var(--color-muted-foreground)]">{ui.maxPath}</div>
                        <div className="font-semibold">{policySummary?.maxPathLength ?? 0}</div>
                    </div>
                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/35 p-3">
                        <div className="text-xs text-[var(--color-muted-foreground)]">{ui.allowedTokens}</div>
                        <div className="font-semibold">{policySummary?.allowedTokens ?? 0}</div>
                    </div>
                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/35 p-3">
                        <div className="text-xs text-[var(--color-muted-foreground)]">{ui.allowedSpenders}</div>
                        <div className="font-semibold">{policySummary?.allowedSpenders ?? 0}</div>
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
