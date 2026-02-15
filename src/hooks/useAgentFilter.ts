import { useState, useMemo } from "react";
import { AgentListing } from "@/components/business/agent-card";

export type SortOption = "newest" | "oldest" | "price_asc" | "price_desc";

export interface FilterState {
    status: "all" | "available" | "rented";
    search: string;
    sort: SortOption;
    minDays?: number;
    // Future: minPrice, maxPrice
}

export function useAgentFilter(listings: AgentListing[]) {
    const [filters, setFilters] = useState<FilterState>({
        status: "all",
        search: "",
        sort: "newest",
    });

    const filteredListings = useMemo(() => {
        if (!listings) return [];

        const result = listings.filter((listing) => {
            // Status filter
            if (filters.status === "available" && listing.rented) return false;
            if (filters.status === "rented" && !listing.rented) return false;

            // Search filter
            if (filters.search.trim()) {
                const q = filters.search.toLowerCase().trim();
                const name = (listing.metadata?.name || "").toLowerCase();
                const id = listing.tokenId.toLowerCase();
                const owner = listing.owner.toLowerCase();

                // Allow searching by exact capability (future proofing)
                const hasCapability = listing.capabilities?.some(c => c.toLowerCase().includes(q));

                if (!name.includes(q) && !id.includes(q) && !owner.includes(q) && !hasCapability) {
                    return false;
                }
            }

            // Min Days filter
            if (filters.minDays && listing.minDays < filters.minDays) {
                return false;
            }

            return true;
        });

        // Sort
        result.sort((a, b) => {
            switch (filters.sort) {
                case "newest":
                    // Assuming higher tokenId is newer
                    return Number(BigInt(b.tokenId) - BigInt(a.tokenId));
                case "oldest":
                    return Number(BigInt(a.tokenId) - BigInt(b.tokenId));
                case "price_asc":
                    return parseFloat(a.pricePerDay) - parseFloat(b.pricePerDay);
                case "price_desc":
                    return parseFloat(b.pricePerDay) - parseFloat(a.pricePerDay);
                default:
                    return 0;
            }
        });

        return result;
    }, [listings, filters]);

    const setStatus = (status: FilterState["status"]) =>
        setFilters(prev => ({ ...prev, status }));

    const setSearch = (search: string) =>
        setFilters(prev => ({ ...prev, search }));

    const setSort = (sort: SortOption) =>
        setFilters(prev => ({ ...prev, sort }));

    const clearFilters = () =>
        setFilters({ status: "all", search: "", sort: "newest" });

    // Computed stats for filters
    const stats = useMemo(() => {
        return {
            total: listings.length,
            available: listings.filter(l => !l.rented).length,
            rented: listings.filter(l => l.rented).length,
        };
    }, [listings]);

    return {
        filters,
        filteredListings,
        setStatus,
        setSearch,
        setSort,
        clearFilters,
        stats
    };
}
