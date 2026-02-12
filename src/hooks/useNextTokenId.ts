import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import { CONTRACTS } from "@/config/contracts";

// Standard ERC721 ownerOf ABI fragment
const OWNER_OF_ABI = [
    {
        type: "function",
        name: "ownerOf",
        inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view",
    },
] as const;

// Probe up to this many token IDs
const PROBE_LIMIT = 50;

// Safe fallback when probe is loading or fails — scan at least this many
const DEFAULT_FALLBACK = 20;

/**
 * Dynamically determines the next token ID by probing ownerOf on AgentNFA.
 * Returns the count of existing tokens (i.e., the first ID that doesn't exist).
 * While loading or on error, returns DEFAULT_FALLBACK to avoid empty marketplace.
 */
export function useNextTokenId() {
    const nfaAddress = CONTRACTS.AgentNFA.address;

    const probeIds = useMemo(
        () => Array.from({ length: PROBE_LIMIT }, (_, i) => BigInt(i)),
        []
    );

    const contracts = useMemo(
        () =>
            probeIds.map((id) => ({
                address: nfaAddress,
                abi: OWNER_OF_ABI,
                functionName: "ownerOf" as const,
                args: [id],
            })),
        [nfaAddress, probeIds]
    );

    const { data: results, isLoading, isError } = useReadContracts({
        contracts,
        query: {
            staleTime: 60_000,
        },
    });

    const nextTokenId = useMemo(() => {
        // While loading or on error, return safe fallback so marketplace stays populated
        if (!results || isError) return DEFAULT_FALLBACK;

        // Find the first token ID where ownerOf reverts (status !== "success")
        for (let i = 0; i < results.length; i++) {
            if (results[i]?.status !== "success") {
                // Return at least DEFAULT_FALLBACK to handle partial RPC failures
                return Math.max(i, DEFAULT_FALLBACK);
            }
        }
        return PROBE_LIMIT;
    }, [results, isError]);

    return { nextTokenId, isLoading };
}

