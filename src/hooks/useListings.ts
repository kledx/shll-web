import { useQuery } from "@tanstack/react-query";
import { Address, formatEther, zeroAddress } from "viem";
import { useReadContracts } from "wagmi";
import { AgentListing } from "@/components/business/agent-card";
import { CONTRACTS } from "@/config/contracts";

interface IndexerListingItem {
  id?: unknown;
  nfa?: unknown;
  tokenId?: unknown;
  pricePerDay?: unknown;
  minDays?: unknown;
  renter?: unknown;
  expires?: unknown;
  agentName?: unknown;
  owner?: unknown;
  isTemplate?: unknown;
  agentType?: unknown;
}

interface MetadataResult {
  persona?: string;
}

interface ReadTarget {
  sourceIndex: number;
  address: Address;
  tokenId: bigint;
}

function toAddress(value: unknown): Address | undefined {
  if (typeof value !== "string") return undefined;
  if (!/^0x[a-fA-F0-9]{40}$/i.test(value)) return undefined;
  return (`0x${value.slice(2)}` as Address);
}

function toUint(value: unknown): bigint | undefined {
  try {
    if (typeof value === "bigint") return value >= BigInt(0) ? value : undefined;
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      return BigInt(Math.trunc(value));
    }
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = BigInt(value.trim());
      return parsed >= BigInt(0) ? parsed : undefined;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function toInt(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.trunc(value));
  if (typeof value === "bigint") return Number(value >= BigInt(0) ? value : BigInt(0));
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return 0;
}

export function useListings() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const res = await fetch("/api/listings");
      if (!res.ok) throw new Error("Failed to fetch listings");
      const json = await res.json();
      return (Array.isArray(json?.items) ? json.items : []) as IndexerListingItem[];
    },
    refetchInterval: 5000,
  });

  const items = data || [];
  const templateItems = items.filter((item) => Boolean(item.isTemplate));

  const readTargets: ReadTarget[] = templateItems
    .map((item, sourceIndex) => {
      const address = toAddress(item.nfa);
      const tokenId = toUint(item.tokenId);
      if (!address || tokenId === undefined) return null;
      return { sourceIndex, address, tokenId };
    })
    .filter((value): value is ReadTarget => value !== null);

  const readIndexBySource = new Map<number, number>();
  readTargets.forEach((target, index) => {
    readIndexBySource.set(target.sourceIndex, index);
  });

  // Batch-read on-chain metadata for valid entries
  const metadataContracts = readTargets.map((item) => ({
    address: item.address,
    abi: CONTRACTS.AgentNFA.abi,
    functionName: "getAgentMetadata" as const,
    args: [item.tokenId] as const,
  }));

  const { data: metadataResults } = useReadContracts({
    contracts: metadataContracts,
    query: { enabled: readTargets.length > 0 },
  });

  // On-chain renter status (source of truth), avoids indexer lag after rent tx
  const renterContracts = readTargets.map((item) => ({
    address: item.address,
    abi: CONTRACTS.AgentNFA.abi,
    functionName: "userOf" as const,
    args: [item.tokenId] as const,
  }));

  const { data: renterResults } = useReadContracts({
    contracts: renterContracts,
    query: { enabled: readTargets.length > 0 },
  });

  const listings: AgentListing[] = templateItems.map((item, sourceIndex) => {
    const readIndex = readIndexBySource.get(sourceIndex);
    const tokenId = (toUint(item.tokenId) ?? BigInt(0)).toString();
    const nfaAddress = toAddress(item.nfa) ?? zeroAddress;
    const owner = toAddress(item.owner) ?? zeroAddress;
    const indexerRenter = toAddress(item.renter) ?? zeroAddress;
    const pricePerDayRaw = toUint(item.pricePerDay) ?? BigInt(0);
    const minDays = toInt(item.minDays);

    const chainRenterResult = readIndex !== undefined ? renterResults?.[readIndex] : undefined;
    const chainRenter =
      chainRenterResult?.status === "success" && typeof chainRenterResult.result === "string"
        ? (toAddress(chainRenterResult.result) ?? undefined)
        : undefined;
    const effectiveRenter = chainRenter ?? indexerRenter;
    const isRented = effectiveRenter !== zeroAddress;

    let agentName = typeof item.agentName === "string" && item.agentName.trim() ? item.agentName : `Agent #${tokenId}`;
    try {
      if (readIndex !== undefined) {
        const metadata = metadataResults?.[readIndex]?.result as MetadataResult | undefined;
        if (metadata?.persona) {
          const parsed = JSON.parse(metadata.persona) as { name?: string };
          if (parsed.name) agentName = parsed.name;
        }
      }
    } catch {
      // Fallback to indexer name on parse failure
    }

    return {
      tokenId,
      nfaAddress,
      listingId: typeof item.id === "string" ? item.id : "",
      owner,
      pricePerDay: formatEther(pricePerDayRaw) + " BNB",
      minDays,
      active: true,
      rented: isRented,
      renter: isRented ? effectiveRenter : undefined,
      isTemplate: Boolean(item.isTemplate),
      agentType: typeof item.agentType === "string" ? item.agentType : undefined,
      capabilities: ["swap"], // Hardcoded for now
      metadata: { name: agentName },
    };
  });

  return { data: listings, isLoading, error };
}
