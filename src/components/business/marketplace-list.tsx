"use client";

import { AgentCard } from "./agent-card";
import { useListings } from "@/hooks/useListings";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export function MarketplaceList() {
    const { data: listings, isLoading } = useListings();
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-burgundy)]" />
            </div>
        );
    }

    if (!listings || listings.length === 0) {
        return (
            <div className="text-center p-12 text-muted-foreground">
                {t.marketplace.noAgents}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
                <AgentCard
                    key={`${listing.nfaAddress}-${listing.tokenId}`}
                    listing={listing}
                />
            ))}
        </div>
    );
}
