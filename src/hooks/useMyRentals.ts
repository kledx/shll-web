import { useState, useEffect } from "react";
import { useAccount, usePublicClient, useReadContracts } from "wagmi";
import { CONTRACTS } from "../config/contracts";
import { Address, parseAbiItem } from "viem";

export interface RentalItem {
    nfa: Address;
    tokenId: bigint;
    agentAccount: Address;
    expires: bigint;
    isActive: boolean;
}

export function useMyRentals() {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const [rentals, setRentals] = useState<RentalItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Fetch Logs for LeaseSet(tokenId, user=me)
    const [candidateTokenIds, setCandidateTokenIds] = useState<bigint[]>([]);

    useEffect(() => {
        if (!publicClient || !address) {
            setRentals([]);
            setIsLoading(false);
            return;
        }

        const fetchLogs = async () => {
            setIsLoading(true);
            try {
                const logs = await publicClient.getLogs({
                    address: CONTRACTS.AgentNFA.address,
                    event: parseAbiItem('event LeaseSet(uint256 indexed tokenId, address indexed user, uint64 expires)'),
                    args: {
                        user: address
                    },
                    fromBlock: 'earliest'
                });

                // Extract unique tokenIds
                const ids = Array.from(new Set(logs.map(l => l.args.tokenId!)));
                setCandidateTokenIds(ids);
            } catch (e) {
                console.error("Failed to fetch rental logs", e);
                setRentals([]);
            } finally {
                if (candidateTokenIds.length === 0) setIsLoading(false);
            }
        };

        fetchLogs();
    }, [publicClient, address]);

    // 2. Verify current status
    const { data: reads } = useReadContracts({
        contracts: candidateTokenIds.flatMap(id => [
            {
                address: CONTRACTS.AgentNFA.address,
                abi: CONTRACTS.AgentNFA.abi,
                functionName: 'userOf',
                args: [id]
            },
            {
                address: CONTRACTS.AgentNFA.address,
                abi: CONTRACTS.AgentNFA.abi,
                functionName: 'userExpires',
                args: [id]
            },
            {
                address: CONTRACTS.AgentNFA.address,
                abi: CONTRACTS.AgentNFA.abi,
                functionName: 'accountOf',
                args: [id]
            }
        ]),
        query: {
            enabled: candidateTokenIds.length > 0
        }
    });

    useEffect(() => {
        if (!reads || candidateTokenIds.length === 0) {
            if (candidateTokenIds.length === 0 && !isLoading) setIsLoading(false); // Only if logs fetched and empty
            return;
        }

        const activeRentals: RentalItem[] = [];
        const now = Math.floor(Date.now() / 1000);

        for (let i = 0; i < candidateTokenIds.length; i++) {
            const tokenId = candidateTokenIds[i];
            const currentUser = reads[i * 3]?.result as Address;
            const expires = reads[i * 3 + 1]?.result as unknown as bigint;
            const account = reads[i * 3 + 2]?.result as Address;

            // Check if I am still the user
            if (currentUser && currentUser.toLowerCase() === address!.toLowerCase()) {
                const expiresNum = Number(expires);
                const isActive = expiresNum > now; // Though userOf check implicitly confirms active rental usually (unless expired but not cleaned up?) 
                // ERC4907 userOf often checks expiry internally? 
                // AgentNFA inherits ERC4907. userOf returns address(0) if expired.
                // So if currentUser matches me, it IS active.

                activeRentals.push({
                    nfa: CONTRACTS.AgentNFA.address,
                    tokenId,
                    agentAccount: account,
                    expires: expires,
                    isActive: true // Since userOf returned me
                });
            }
        }

        setRentals(activeRentals);
        setIsLoading(false);
    }, [reads, candidateTokenIds, address]);

    return { rentals, isLoading };
}
