import { useQuery } from "@tanstack/react-query";
import { formatEther } from "viem";
import { useReadContracts } from "wagmi";
import { AgentListing } from "@/components/business/agent-card";
import { CONTRACTS } from "@/config/contracts";

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

  // Batch-read on-chain metadata for all listed agents to get real names
  const metadataContracts = (data || []).map((item: any) => ({
    address: CONTRACTS.AgentNFA.address,
    abi: CONTRACTS.AgentNFA.abi,
    functionName: "getAgentMetadata",
    args: [BigInt(item.tokenId)],
  }));

  const { data: metadataResults } = useReadContracts({
    contracts: metadataContracts,
    query: { enabled: (data || []).length > 0 },
  });

  const listings: AgentListing[] = (data || []).map((item: any, index: number) => {
    const isRented = item.renter && item.renter !== "0x0000000000000000000000000000000000000000";

    // Try to parse real name from on-chain persona JSON
    let agentName = item.agentName;
    try {
      const metadata = metadataResults?.[index]?.result as any;
      if (metadata?.persona) {
        const parsed = JSON.parse(metadata.persona);
        if (parsed.name) agentName = parsed.name;
      }
    } catch {
      // Fallback to Ponder name on parse failure
    }

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
      metadata: { name: agentName },
    };
  });

  return { data: listings, isLoading, error };
}
