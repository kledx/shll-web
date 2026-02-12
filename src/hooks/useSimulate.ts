"use client";

import { useEffect, useState } from "react";
import { usePublicClient, useAccount } from "wagmi";
import { Address, Hex } from "viem";
import { CONTRACTS } from "@/config/contracts";

interface Action {
    target: Address;
    value: bigint;
    data: Hex;
}

export function useSimulate(tokenId: string, action: Action | null) {
    const publicClient = usePublicClient();
    const { address: userAddress } = useAccount();
    const [result, setResult] = useState<{ success: boolean; data: Hex } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const simulate = async () => {
        if (!publicClient || !action || !tokenId) return;

        if (!userAddress) {
            setError("Connect wallet to simulate");
            setResult({ success: false, data: "0x" });
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            // Simulate by calling `execute` as the connected user
            // so the contract's permission checks (owner/renter) pass correctly.
            const { result } = await publicClient.simulateContract({
                address: CONTRACTS.AgentNFA.address,
                abi: CONTRACTS.AgentNFA.abi,
                functionName: "execute",
                args: [BigInt(tokenId), action],
                account: userAddress,
            });

            setResult({ success: true, data: result });
        } catch (err: any) {
            console.error("Simulation failed:", err);
            // Try to extract revert reason
            const reason = err?.shortMessage || err?.message || "Simulation failed";
            setError(reason);
            setResult({ success: false, data: "0x" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setResult(null);
        setError(null);
    }, [action, tokenId]);

    return { simulate, result, error, isLoading };
}

