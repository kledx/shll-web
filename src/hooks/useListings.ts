import { useState, useEffect } from "react";
import { usePublicClient, useReadContracts } from "wagmi";
import { parseAbiItem, formatEther, Address } from "viem";
import { CONTRACTS } from "../config/contracts";
import { AgentListing } from "@/components/business/agent-card";

export function useListings() {
    const publicClient = usePublicClient();
    const [listings, setListings] = useState<AgentListing[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Fetch Logs to find all created listings
    const [logIds, setLogIds] = useState<any[]>([]);

    useEffect(() => {
        if (!publicClient) return;

        const fetchLogs = async () => {
            const logs = await publicClient.getLogs({
                address: CONTRACTS.ListingManager.address,
                event: parseAbiItem('event ListingCreated(bytes32 indexed listingId, address indexed nfa, uint256 indexed tokenId, uint96 pricePerDay, uint32 minDays)'),
                fromBlock: 'earliest'
            });
            // Reverse to show newest first
            const reversed = [...logs].reverse();
            setLogIds(reversed.map(l => ({
                listingId: l.args.listingId!,
                nfa: l.args.nfa!,
                tokenId: l.args.tokenId!,
                price: l.args.pricePerDay!,
                minDays: l.args.minDays!
            })));
        };

        fetchLogs();
    }, [publicClient]);

    // 2. Fetch current status for all found listings
    const { data: reads } = useReadContracts({
        contracts: logIds.flatMap(l => [
            {
                address: CONTRACTS.ListingManager.address,
                abi: CONTRACTS.ListingManager.abi,
                functionName: 'listings',
                args: [l.listingId]
            },
            {
                address: CONTRACTS.AgentNFA.address,
                abi: CONTRACTS.AgentNFA.abi,
                functionName: 'userOf',
                args: [l.tokenId]
            },
            {
                address: CONTRACTS.AgentNFA.address,
                abi: CONTRACTS.AgentNFA.abi,
                functionName: 'getAgentMetadata',
                args: [l.tokenId]
            }
        ]),
        query: {
            enabled: logIds.length > 0
        }
    });

    useEffect(() => {
        if (!reads || logIds.length === 0) {
            if (logIds.length === 0) setIsLoading(false);
            return;
        }

        const validListings: AgentListing[] = [];

        for (let i = 0; i < logIds.length; i++) {
            const log = logIds[i];
            const listingData = reads[i * 3]?.result as any;
            const userOf = reads[i * 3 + 1]?.result as Address;
            const metadata = reads[i * 3 + 2]?.result as any;

            // Check if listing is active AND agent is not currently rented
            // listingData: [nfa, tokenId, owner, price, minDays, active]
            if (listingData && listingData[5] === true) {
                // Check if rented (userOf should be 0x0...0)
                if (userOf === "0x0000000000000000000000000000000000000000") {
                    let name = "Unknown Agent";
                    try {
                        if (metadata && metadata.persona) {
                            const p = JSON.parse(metadata.persona);
                            name = p.name || p.role || "Agent";
                        }
                    } catch { }

                    validListings.push({
                        tokenId: log.tokenId.toString(),
                        nfaAddress: log.nfa,
                        listingId: log.listingId,
                        owner: listingData[2],
                        pricePerDay: formatEther(listingData[3]) + " BNB",
                        minDays: Number(listingData[4]),
                        active: true,
                        capabilities: ["swap"], // TODO: derive from policy?
                        metadata: { name }
                    });
                }
            }
        }

        setListings(validListings);
        setIsLoading(false);
    }, [reads, logIds]);

    return { data: listings, isLoading, error: null };
}
