import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import { formatEther, Address } from "viem";
import { CONTRACTS } from "../config/contracts";
import { AgentListing } from "@/components/business/agent-card";

// Generous upper bound. Non-existent token IDs are safely skipped in Phase 1/2.
const MAX_TOKEN_ID = 20;

export function useListings() {
    const nfaAddress = CONTRACTS.AgentNFA.address;
    const listingManagerAddress = CONTRACTS.ListingManager.address;

    // Phase 1: Get listing IDs for all possible token IDs (0..MAX-1)
    const tokenIds = useMemo(
        () => Array.from({ length: MAX_TOKEN_ID }, (_, i) => BigInt(i)),
        []
    );

    const phase1Contracts = useMemo(() => tokenIds.map(id => ({
        address: listingManagerAddress,
        abi: CONTRACTS.ListingManager.abi,
        functionName: 'getListingId' as const,
        args: [nfaAddress, id]
    })), [nfaAddress, listingManagerAddress, tokenIds]);

    const { data: listingIdReads, isLoading: isPhase1Loading } = useReadContracts({
        contracts: phase1Contracts,
        query: {
            staleTime: 30_000, // Cache for 30s to reduce RPC calls
        }
    });

    // Phase 2: For each valid listing ID, batch read listing + metadata + userOf
    const phase2Contracts = useMemo(() => {
        if (!listingIdReads) return [];

        const contracts: any[] = [];
        for (let i = 0; i < tokenIds.length; i++) {
            const result = listingIdReads[i];
            if (result?.status !== 'success' || !result.result) continue;

            const listingId = result.result as `0x${string}`;
            const tokenId = tokenIds[i];

            // 3 reads per token: listings, getAgentMetadata, userOf
            contracts.push(
                {
                    address: listingManagerAddress,
                    abi: CONTRACTS.ListingManager.abi,
                    functionName: 'listings',
                    args: [listingId]
                },
                {
                    address: nfaAddress,
                    abi: CONTRACTS.AgentNFA.abi,
                    functionName: 'getAgentMetadata',
                    args: [tokenId]
                },
                {
                    address: nfaAddress,
                    abi: CONTRACTS.AgentNFA.abi,
                    functionName: 'userOf',
                    args: [tokenId]
                }
            );
        }
        return contracts;
    }, [listingIdReads, tokenIds, nfaAddress, listingManagerAddress]);

    const { data: phase2Reads, isLoading: isPhase2Loading } = useReadContracts({
        contracts: phase2Contracts,
        query: {
            enabled: phase2Contracts.length > 0,
            staleTime: 30_000,
        }
    });

    // Build listings from results
    const listings = useMemo(() => {
        if (!listingIdReads || !phase2Reads) return [];

        const validListings: AgentListing[] = [];
        let readIndex = 0;

        for (let i = 0; i < tokenIds.length; i++) {
            const idResult = listingIdReads[i];
            if (idResult?.status !== 'success' || !idResult.result) continue;

            const listingId = idResult.result as `0x${string}`;
            const tokenId = tokenIds[i];

            // Read 3 results for this token
            const listingResult = phase2Reads[readIndex];
            const metadataResult = phase2Reads[readIndex + 1];
            const userResult = phase2Reads[readIndex + 2];
            readIndex += 3;

            if (listingResult?.status !== 'success') continue;

            const listingData = listingResult.result as any;
            // listingData: [nfa, tokenId, owner, pricePerDay, minDays, active]
            if (!listingData || listingData[5] !== true) continue;

            // Parse agent name from metadata
            let name = "Unknown Agent";
            try {
                const metadata = metadataResult?.result as any;
                if (metadata?.persona) {
                    const p = JSON.parse(metadata.persona);
                    name = p.name || p.role || "Agent";
                }
            } catch { }

            // Determine rental status
            const userOf = userResult?.result as string || "0x0000000000000000000000000000000000000000";
            const isZeroAddr = userOf === "0x0000000000000000000000000000000000000000";
            const isRented = !isZeroAddr;

            validListings.push({
                tokenId: tokenId.toString(),
                nfaAddress: nfaAddress,
                listingId: listingId,
                owner: listingData[2],
                pricePerDay: formatEther(listingData[3]) + " BNB",
                minDays: Number(listingData[4]),
                active: true,
                rented: isRented,
                renter: isRented ? userOf : undefined,
                capabilities: ["swap"],
                metadata: { name }
            });
        }

        return validListings;
    }, [listingIdReads, phase2Reads, tokenIds, nfaAddress]);

    const isLoading = isPhase1Loading || (phase2Contracts.length > 0 && isPhase2Loading);

    return { data: listings, isLoading, error: null };
}
