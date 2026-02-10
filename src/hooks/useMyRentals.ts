import { useState, useEffect } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { Address } from "viem";

export interface RentalItem {
    nfa: Address;
    tokenId: bigint;
    agentAccount: Address;
    expires: bigint;
    isActive: boolean;
}

export function useMyRentals() {
    const { address } = useAccount();
    const [rentals, setRentals] = useState<RentalItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Mock implementation because we don't have an indexer yet.
    // In a real app, this would fetch from a Subgraph or indexer API.
    useEffect(() => {
        const fetchRentals = async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (!address) {
                setRentals([]);
                setIsLoading(false);
                return;
            }

            // Mock Data
            setRentals([
                {
                    nfa: CONTRACTS.AgentNFA.address,
                    tokenId: BigInt(1),
                    agentAccount: "0x0000000000000000000000000000000000000001",
                    expires: BigInt(Math.floor(Date.now() / 1000) + 86400 * 5), // 5 days from now
                    isActive: true
                },
                {
                    nfa: CONTRACTS.AgentNFA.address,
                    tokenId: BigInt(2),
                    agentAccount: "0x0000000000000000000000000000000000000002",
                    expires: BigInt(Math.floor(Date.now() / 1000) - 86400), // Expired 1 day ago
                    isActive: false
                }
            ]);
            setIsLoading(false);
        };

        fetchRentals();
    }, [address]);

    return { rentals, isLoading };
}
