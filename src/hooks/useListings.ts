import { useQuery } from "@tanstack/react-query";
import { formatEther } from "viem";
import { AgentListing } from "@/components/business/agent-card";

const LISTINGS_QUERY = `
  query GetListings {
    listings(where: { active: true }, orderBy: "createdAt", orderDirection: "desc") {
      items {
        id
        nfa
        tokenId
        pricePerDay
        minDays
        renter
        expires
        agentName
        owner
      }
    }
  }
`;

export function useListings() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["listings"],
        queryFn: async () => {
            const res = await fetch("/api/indexer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: LISTINGS_QUERY }),
            });
            if (!res.ok) throw new Error("Failed to fetch listings");
            const json = await res.json();
            return json.data?.listings?.items || [];
        },
        refetchInterval: 5000,
    });

    const listings: AgentListing[] = (data || []).map((item: any) => {
        const isRented = item.renter && item.renter !== "0x0000000000000000000000000000000000000000";
        // Check if lease is expired? Ponder doesn't auto-expire, but we can check visual logic if needed.
        // For now, trust the 'renter' field from event logic.

        return {
            tokenId: item.tokenId.toString(),
            nfaAddress: item.nfa,
            listingId: item.id,
            owner: item.owner,
            pricePerDay: formatEther(BigInt(item.pricePerDay)) + " BNB",
            minDays: Number(item.minDays),
            active: true,
            rented: isRented,
            renter: isRented ? item.renter : undefined,
            capabilities: ["swap"], // Hardcoded for now
            metadata: { name: item.agentName },
        };
    });

    return { data: listings, isLoading, error };
}
