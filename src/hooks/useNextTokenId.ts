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

// Probe up to this many token IDs. Keep generous but bounded.
const PROBE_LIMIT = 100;

/**
 * Dynamically determines the next token ID by probing ownerOf on AgentNFA.
 * Returns the count of existing tokens (i.e., the first ID that doesn't exist).
 * Token IDs start from 0 in the contract (_nextTokenId++ pattern).
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

    const { data: results, isLoading } = useReadContracts({
        contracts,
        query: {
            staleTime: 60_000, // Cache for 1 minute, token minting is rare
        },
    });

    const nextTokenId = useMemo(() => {
        if (!results) return 0;

        // Find the first token ID where ownerOf reverts (status !== "success")
        for (let i = 0; i < results.length; i++) {
            if (results[i]?.status !== "success") {
                return i;
            }
        }
        // All probed IDs exist - return PROBE_LIMIT (unlikely in practice)
        return PROBE_LIMIT;
    }, [results]);

    return { nextTokenId, isLoading };
}
