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
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-amber-300 bg-amber-50/80 p-12 text-center shadow-[var(--shadow-soft)]">
                <AlertTriangle className="h-10 w-10 text-amber-600" />
                <p className="max-w-md text-sm text-amber-900">
                    {t.marketplace.wrongChain}
                </p>
                <p className="text-sm text-amber-700/80">
                    Current: <strong>{chain.name}</strong> → Required: <strong>BSC Testnet</strong>
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center rounded-2xl border border-[var(--color-border)] bg-white/70 p-12 shadow-[var(--shadow-soft)]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    if (!listings || listings.length === 0) {
        return (
            <div className="rounded-2xl border border-[var(--color-border)] bg-white/70 p-12 text-center text-[var(--color-muted-foreground)] shadow-[var(--shadow-soft)]">
                {t.marketplace.noAgents}
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <MarketplaceSearch
                onSearchChange={setSearchQuery}
                onStatusChange={setStatusFilter}
                status={statusFilter}
            />

            {filteredListings.length === 0 ? (
                <div className="rounded-2xl border border-[var(--color-border)] bg-white/70 p-12 text-center text-[var(--color-muted-foreground)] shadow-[var(--shadow-soft)]">
                    {t.marketplace.noResults}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
