import { useMemo } from "react";
import { useConnection, useReadContracts } from "wagmi";
import { CONTRACTS } from "../config/contracts";
import { Address } from "viem";
import { useNextTokenId } from "./useNextTokenId";

export interface RentalItem {
    nfa: Address;
    tokenId: bigint;
    agentAccount: Address;
    expires: bigint;
    isActive: boolean;
}

export function useMyRentals() {
    const { address } = useConnection();
    const nfaAddress = CONTRACTS.AgentNFA.address;
    const { nextTokenId } = useNextTokenId();

    // Token IDs to check (0..nextTokenId-1)
    const tokenIds = useMemo(
        () => Array.from({ length: nextTokenId }, (_, i) => BigInt(i)),
        [nextTokenId]
    );

    // Batch read: userOf, userExpires, accountOf for each token
    const contracts = useMemo(() => tokenIds.flatMap(id => [
        {
            address: nfaAddress,
            abi: CONTRACTS.AgentNFA.abi,
            functionName: 'userOf' as const,
            args: [id]
        },
        {
            address: nfaAddress,
            abi: CONTRACTS.AgentNFA.abi,
            functionName: 'userExpires' as const,
            args: [id]
        },
        {
            address: nfaAddress,
            abi: CONTRACTS.AgentNFA.abi,
            functionName: 'accountOf' as const,
            args: [id]
        }
    ]), [nfaAddress, tokenIds]);

    const { data: reads, isLoading } = useReadContracts({
        contracts,
        query: {
            enabled: !!address,
            staleTime: 15_000, // Cache for 15s
        }
    });

    // Filter tokens where current user is the renter
    const rentals = useMemo(() => {
        if (!reads || !address) return [];

        const activeRentals: RentalItem[] = [];

        for (let i = 0; i < tokenIds.length; i++) {
            const userResult = reads[i * 3];
            const expiresResult = reads[i * 3 + 1];
            const accountResult = reads[i * 3 + 2];

            if (userResult?.status !== 'success') continue;

            const currentUser = userResult.result as Address;
            const expires = (expiresResult?.result as bigint) || BigInt(0);
            const account = (accountResult?.result as Address) || ("0x0000000000000000000000000000000000000000" as Address);

            // Check if I am the current renter
            if (currentUser && currentUser.toLowerCase() === address.toLowerCase()) {
                activeRentals.push({
                    nfa: nfaAddress,
                    tokenId: tokenIds[i],
                    agentAccount: account,
                    expires: expires,
                    isActive: true
                });
            }
        }

        return activeRentals;
    }, [reads, address, tokenIds, nfaAddress]);

    return { rentals, isLoading };
}
