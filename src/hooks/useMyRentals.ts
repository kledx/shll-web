import { useMemo } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { CONTRACTS } from "../config/contracts";
import { Address } from "viem";

// Generous upper bound. Non-existent token IDs are safely skipped.
const MAX_TOKEN_ID = 20;

export interface RentalItem {
    nfa: Address;
    tokenId: bigint;
    agentAccount: Address;
    owner: Address;
    expires: bigint;
    isActive: boolean;
    isOwner: boolean;
    isRenter: boolean;
    isInstance: boolean;
    templateId?: bigint;
}

export function useMyRentals() {
    const { address } = useAccount();
    const nfaAddress = CONTRACTS.AgentNFA.address;

    // Token IDs to check (0..MAX-1)
    const tokenIds = useMemo(
        () => Array.from({ length: MAX_TOKEN_ID }, (_, i) => BigInt(i)),
        []
    );

    // Batch read: ownerOf, userOf, userExpires, accountOf, templateOf for each token
    const contracts = useMemo(() => tokenIds.flatMap(id => [
        {
            address: nfaAddress,
            abi: CONTRACTS.AgentNFA.abi,
            functionName: 'ownerOf' as const,
            args: [id]
        },
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
        },
        {
            address: nfaAddress,
            abi: CONTRACTS.AgentNFA.abi,
            functionName: 'templateOf' as const,
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

    // Filter tokens where current user is either the owner or the renter
    const rentals = useMemo(() => {
        if (!reads || !address) return [];

        const items: RentalItem[] = [];

        const FIELDS_PER_TOKEN = 5;
        for (let i = 0; i < tokenIds.length; i++) {
            const base = i * FIELDS_PER_TOKEN;
            const ownerResult = reads[base];
            const userResult = reads[base + 1];
            const expiresResult = reads[base + 2];
            const accountResult = reads[base + 3];
            const templateResult = reads[base + 4];

            if (ownerResult?.status !== 'success' || userResult?.status !== 'success') continue;

            const agentOwner = ownerResult.result as Address;
            const currentUser = userResult.result as Address;
            const expires = (expiresResult?.result as bigint) || BigInt(0);
            const account = (accountResult?.result as Address) || ("0x0000000000000000000000000000000000000000" as Address);

            // templateOf returns 0 for non-instances
            const templateId = templateResult?.status === 'success'
                ? (templateResult.result as bigint)
                : BigInt(0);
            const isInstance = templateId > BigInt(0);

            const isOwner = !!address && agentOwner.toLowerCase() === address.toLowerCase();
            const isRenter = !!address && currentUser.toLowerCase() === address.toLowerCase();

            // Include if either owner or renter
            if (isOwner || isRenter) {
                items.push({
                    nfa: nfaAddress,
                    tokenId: tokenIds[i],
                    agentAccount: account,
                    owner: agentOwner,
                    expires: expires,
                    isActive: isRenter && expires > BigInt(Math.floor(Date.now() / 1000)),
                    isOwner,
                    isRenter,
                    isInstance,
                    templateId: isInstance ? templateId : undefined,
                });
            }
        }

        return items;
    }, [reads, address, tokenIds, nfaAddress]);

    return { rentals, isLoading };
}
