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
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, ShieldCheck, Copy } from "lucide-react";
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
    metadata?: {
        name?: string;
        image?: string;
    };
}

export function AgentCard({ listing }: { listing: AgentListing }) {
    const { t } = useTranslation();

    return (
        <Card className={`group relative overflow-hidden border-[var(--color-border)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] ${listing.rented && !listing.isTemplate ? "opacity-80" : ""}`}>
            <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[var(--color-sky)]/8 blur-3xl transition-colors group-hover:bg-[var(--color-sky)]/16" />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-20 w-20 rounded-full bg-[var(--color-primary)]/10 blur-2xl" />

            <CardHeader>
                <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <Chip variant="sticker">#{listing.tokenId}</Chip>
                        {listing.isTemplate && (
                            <span className="flex items-center gap-1 rounded-full border border-violet-300 bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800">
                                <Copy className="h-3 w-3" />
                                {t.agent.card.template ?? "Template"}
                            </span>
                        )}
                        {listing.rented && !listing.isTemplate && (
                            <span className="flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                                <ShieldCheck className="h-3 w-3" />
                                {t.agent.card.rented}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono text-[var(--color-muted-foreground)]">
                        <Clock className="h-3 w-3" />
                        <span>{t.agent.card.minDays.replace("{days}", listing.minDays.toString())}</span>
                    </div>
                </div>
                <CardTitle className="truncate">
                    {listing.metadata?.name || `Agent ${listing.tokenId}`}
                </CardTitle>
                <CardDescription className="truncate font-mono text-xs">
                    by {listing.owner.slice(0, 6)}...{listing.owner.slice(-4)}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {listing.capabilities.map((cap) => (
                        <Chip
                            key={cap}
                            variant={cap === "swap" ? "sky" : "burgundy"}
                            className="border"
                        >
                            {cap === "swap" ? t.agent.card.swapPack : t.agent.card.repayPack}
                        </Chip>
                    ))}
                </div>

                <div className="flex items-baseline gap-1">
                    <span className="font-serif text-2xl font-bold text-[var(--color-primary)]">
                        {listing.pricePerDay}
                    </span>
                    <span className="text-sm text-[var(--color-muted-foreground)]">{t.agent.card.day}</span>
                </div>
            </CardContent>

            <CardFooter>
                <Link href={`/agent/${listing.nfaAddress}/${listing.tokenId}`} className="w-full">
                    <Button
                        className="w-full justify-between"
                        variant={listing.rented && !listing.isTemplate ? "outline" : "default"}
                    >
                        {listing.isTemplate
                            ? (t.agent.card.mintInstance ?? "Mint Instance")
                            : listing.rented
                                ? t.agent.card.viewDetails
                                : t.agent.card.rentNow
                        } <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
