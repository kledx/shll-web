"use client";

import Link from "next/link";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, ShieldCheck, Wallet, Clock } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export interface AgentListing {
    tokenId: string;
    nfaAddress: string;
    listingId: string;
    owner: string;
    pricePerDay: string;
    minDays: number;
    active: boolean;
    rented: boolean;
    renter?: string;
    isTemplate?: boolean;
    agentType?: string;
    capabilities: ("swap" | "repay")[];
    metrics?: {
        successRate: number;
        totalExecutions: number;
    };
    metadata?: {
        name?: string;
        image?: string;
        description?: string;
    };
}

export function AgentCard({ listing }: { listing: AgentListing }) {
    const { t } = useTranslation();
    const isValidOwner = /^0x[a-fA-F0-9]{40}$/.test(listing.owner);
    const ownerDisplay = isValidOwner
        ? `${listing.owner.slice(0, 6)}...${listing.owner.slice(-4)}`
        : "-";
    const isValidDetailRoute = /^0x[a-fA-F0-9]{40}$/.test(listing.nfaAddress)
        && listing.nfaAddress !== "0x0000000000000000000000000000000000000000"
        && /^\d+$/.test(listing.tokenId);

    // Determine status color and label
    const isRented = listing.rented && !listing.isTemplate;
    const statusColor = listing.isTemplate
        ? "bg-violet-500/10 text-violet-600 border-violet-200 dark:border-violet-800 dark:text-violet-400"
        : isRented
            ? "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800 dark:text-amber-400"
            : "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800 dark:text-emerald-400";

    const statusLabel = listing.isTemplate
        ? (t.agent.card.template || "Template")
        : isRented
            ? (t.agent.card.rented || "Rented")
            : (t.marketplace?.filterAvailable || "Available");
    const actionLabel = listing.isTemplate
        ? t.agent.card.mintInstance
        : isRented
            ? t.agent.card.viewDetails
            : t.agent.card.rentNow;

    // Format agent type display
    const agentTypeDisplay = listing.agentType
        ? listing.agentType.toUpperCase().replace(/_/g, " ")
        : "AI AGENT";

    return (
        <Card className="group relative flex flex-col overflow-hidden border-[var(--color-border)] bg-[var(--color-paper)] transition-all duration-300 hover:shadow-xl hover:border-[var(--color-primary)]/50 hover:-translate-y-0.5">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[var(--color-primary)]/[0.03] opacity-0 transition-opacity group-hover:opacity-100" />

            {/* Header: Status + Agent Type */}
            <CardHeader className="relative pb-3">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${statusColor}`}>
                            {statusLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-600 dark:border-sky-800 dark:text-sky-400">
                            <Bot className="h-3 w-3" />
                            {agentTypeDisplay}
                        </span>
                    </div>
                    <span className="shrink-0 rounded-md bg-[var(--color-muted)]/50 px-2 py-1 text-xs font-mono text-[var(--color-muted-foreground)]">
                        #{listing.tokenId}
                    </span>
                </div>

                <CardTitle className="text-xl font-bold leading-tight">
                    {listing.metadata?.name || `Agent ${listing.tokenId}`}
                </CardTitle>

                {/* Description */}
                <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)] line-clamp-2 leading-relaxed">
                    {listing.metadata?.description || "Autonomous AI agent with on-chain policy enforcement. Rent to deploy your own instance."}
                </p>
            </CardHeader>

            {/* Content: Security highlights + Info */}
            <CardContent className="relative flex-1 space-y-4 pb-4">
                {/* Security highlights */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-2.5 text-center">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-medium leading-tight text-[var(--color-muted-foreground)]">
                            5-Layer Policy
                        </span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-2.5 text-center">
                        <Wallet className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-medium leading-tight text-[var(--color-muted-foreground)]">
                            Isolated Vault
                        </span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-2.5 text-center">
                        <Clock className="h-4 w-4 text-violet-500" />
                        <span className="text-xs font-medium leading-tight text-[var(--color-muted-foreground)]">
                            Auto-Expire
                        </span>
                    </div>
                </div>

                {/* Capabilities + Owner */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                        {listing.capabilities.map((cap) => (
                            <span
                                key={cap}
                                className="inline-flex items-center rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-0.5 text-xs font-medium text-[var(--color-secondary-foreground)]"
                            >
                                {cap}
                            </span>
                        ))}
                    </div>
                    <span className="shrink-0 text-xs font-mono text-[var(--color-muted-foreground)]" title={listing.owner}>
                        {ownerDisplay}
                    </span>
                </div>
            </CardContent>

            {/* Footer: Pricing + Action */}
            <CardFooter className="relative flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface)]/50 px-6 py-4">
                <div className="flex flex-col">
                    <span className="text-[11px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
                        {t.agent.card.day?.replace("/ ", "") || "Per Day"}
                    </span>
                    <span className="font-mono text-base font-bold text-[var(--color-primary)]">
                        {listing.pricePerDay}
                    </span>
                    <span className="text-[11px] text-[var(--color-muted-foreground)]">
                        {t.agent.card.minDays?.replace("{days}", String(listing.minDays)) || `min ${listing.minDays}d`}
                    </span>
                </div>

                {isValidDetailRoute ? (
                    <Link href={`/agent/${listing.nfaAddress}/${listing.tokenId}`}>
                        <Button
                            size="sm"
                            variant={isRented ? "outline" : "default"}
                            className="h-9 px-4 text-sm font-semibold"
                        >
                            {actionLabel}
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                    </Link>
                ) : (
                    <Button size="sm" variant="ghost" disabled className="h-9 text-sm">
                        {t.agent.detail.loading}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
