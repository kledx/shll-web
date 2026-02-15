"use client";

import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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

    return (
        <Card className="group relative flex flex-col overflow-hidden border-[var(--color-border)] bg-[var(--color-paper)] transition-all duration-300 hover:shadow-lg hover:border-[var(--color-primary)]/50">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[var(--color-surface)] opacity-0 transition-opacity group-hover:opacity-100" />

            <CardHeader className="relative pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${statusColor}`}>
                            {statusLabel}
                        </span>
                        <span className="text-xs text-[var(--color-muted-foreground)]">#{listing.tokenId}</span>
                    </div>
                </div>
                <CardTitle className="line-clamp-1 text-lg font-bold">
                    {listing.metadata?.name || `Agent ${listing.tokenId}`}
                </CardTitle>
                <CardDescription className="line-clamp-1 flex items-center gap-1 text-xs font-mono">
                    <span className="text-[var(--color-muted-foreground)]">Owner:</span>
                    <span className="text-[var(--color-foreground)]">{ownerDisplay}</span>
                </CardDescription>
            </CardHeader>

            <CardContent className="relative flex-1 space-y-4 pb-2">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-[var(--color-surface)] p-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-[var(--color-muted-foreground)]">Success Rate</span>
                        <span className="font-mono text-sm font-medium">
                            {listing.metrics?.successRate ? `${listing.metrics.successRate}%` : "100%"}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-[var(--color-muted-foreground)]">Executions</span>
                        <span className="font-mono text-sm font-medium">
                            {listing.metrics?.totalExecutions ? `${listing.metrics.totalExecutions}` : "0"}
                        </span>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                    {listing.capabilities.map((cap) => (
                        <div
                            key={cap}
                            className="inline-flex items-center rounded-sm border border-[var(--color-border)] bg-[var(--color-background)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-secondary-foreground)]"
                        >
                            {cap}
                        </div>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="relative flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface)]/50 px-6 py-3">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-[var(--color-muted-foreground)]">Price / Day</span>
                    <span className="font-mono text-sm font-bold text-[var(--color-primary)]">
                        {listing.pricePerDay}
                    </span>
                </div>

                {isValidDetailRoute ? (
                    <Link href={`/agent/${listing.nfaAddress}/${listing.tokenId}`}>
                        <Button size="sm" variant={isRented ? "outline" : "default"} className="h-8 text-xs">
                            {listing.isTemplate ? "Mint" : isRented ? "View" : "Rent"}
                            <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                    </Link>
                ) : (
                    <Button size="sm" variant="ghost" disabled className="h-8 text-xs">
                        Syncing...
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
