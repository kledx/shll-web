"use client";

import { useState, useMemo } from "react";
import { AgentCard } from "./agent-card";
import { MarketplaceSearch, StatusFilter } from "./marketplace-search";
import { useListings } from "@/hooks/useListings";
import { Loader2, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAccount } from "wagmi";
import { bscTestnet } from "viem/chains";

// Chain ID where contracts are deployed
const SUPPORTED_CHAIN_ID = bscTestnet.id; // 97

export function MarketplaceList() {
    const { data: listings, isLoading } = useListings();
    const { t } = useTranslation();
    const { chain, isConnected } = useAccount();

    // Search & filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    const filteredListings = useMemo(() => {
        if (!listings) return [];
        return listings.filter((listing) => {
            // Status filter
            if (statusFilter === "available" && listing.rented) return false;
            if (statusFilter === "rented" && !listing.rented) return false;

            // Search filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const name = (listing.metadata?.name || "").toLowerCase();
                const id = listing.tokenId.toLowerCase();
                const owner = listing.owner.toLowerCase();
                if (!name.includes(q) && !id.includes(q) && !owner.includes(q)) {
                    return false;
                }
            }
            return true;
        });
    }, [listings, searchQuery, statusFilter]);

    // Show chain warning if connected to wrong network
    const isWrongChain = isConnected && chain && chain.id !== SUPPORTED_CHAIN_ID;

    if (isWrongChain) {
        return (
            <div className="flex flex-col items-center gap-4 p-12 rounded-xl border border-yellow-500/30 bg-yellow-500/5">
                <AlertTriangle className="w-10 h-10 text-yellow-500" />
                <p className="text-center text-muted-foreground text-sm max-w-md">
                    {t.marketplace.wrongChain}
                </p>
                <p className="text-xs text-muted-foreground/60">
                    Current: <strong>{chain.name}</strong> → Required: <strong>BSC Testnet</strong>
                </p>
            </div>
        );
    }

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
        <div className="space-y-6">
            <MarketplaceSearch
                onSearchChange={setSearchQuery}
                onStatusChange={setStatusFilter}
                status={statusFilter}
            />

            {filteredListings.length === 0 ? (
                <div className="text-center p-12 text-muted-foreground">
                    {t.marketplace.noResults}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredListings.map((listing) => (
                        <AgentCard
                            key={`${listing.nfaAddress}-${listing.tokenId}`}
                            listing={listing}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
