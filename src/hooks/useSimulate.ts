"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { Address, Hex } from "viem";
import { CONTRACTS } from "@/config/contracts";

interface Action {
    target: Address;
    value: bigint;
    data: Hex;
}

export function useSimulate(tokenId: string, action: Action | null) {
    const publicClient = usePublicClient();
    const [result, setResult] = useState<{ success: boolean; data: Hex } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const simulate = async () => {
        if (!publicClient || !action || !tokenId) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            // Simulate by calling the `execute` function via staticCall (read)
            // Note: This simulates the AgentNFA executing the action.
            // Ideally, we interpret the return bytes to see if the inner call succeeded.

            const { result } = await publicClient.simulateContract({
                address: CONTRACTS.AgentNFA.address,
                abi: CONTRACTS.AgentNFA.abi,
                functionName: "execute",
                args: [BigInt(tokenId), action],
                account: "0x0000000000000000000000000000000000000000" as Address, // Simulate as zero address or user
            });

            setResult({ success: true, data: result });
        } catch (err: any) {
            console.error("Simulation failed:", err);
            // Try to extract revert reason
            setError(err?.shortMessage || err?.message || "Simulation failed");
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
