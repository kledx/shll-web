"use client";

import { useCallback, useEffect, useState } from "react";

export interface InstanceConfigData {
    found: boolean;
    tokenId: string;
    policyId?: number;
    version?: number;
    paramsHash?: string;
    paramsPacked?: string;
    slippageBps?: number;
    tradeLimit?: string;
    dailyLimit?: string;
    tokenGroupId?: number;
    dexGroupId?: number;
    riskTier?: number;
    updatedAt?: string;
}

/**
 * Fetch instance configuration from the Indexer API.
 * Returns decoded on-chain params (policyRef, slippage, limits, groups, riskTier).
 */
export function useInstanceConfig(
    tokenId: string | undefined,
    indexerBaseUrl?: string,
) {
    const [data, setData] = useState<InstanceConfigData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const baseUrl = indexerBaseUrl || process.env.NEXT_PUBLIC_INDEXER_URL || "";

    const fetchConfig = useCallback(async () => {
        if (!tokenId || !/^\d+$/.test(tokenId)) return;
        try {
            setIsLoading(true);
            setError(null);
            const res = await fetch(
                `${baseUrl}/api/instance-config/${tokenId}`,
                { cache: "no-store" },
            );
            if (!res.ok) {
                throw new Error(`status ${res.status}`);
            }
            const body = (await res.json()) as InstanceConfigData;
            setData(body);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load instance config",
            );
        } finally {
            setIsLoading(false);
        }
    }, [tokenId, baseUrl]);

    useEffect(() => {
        void fetchConfig();
    }, [fetchConfig]);

    return {
        data,
        isLoading,
        error,
        refresh: fetchConfig,
    };
}
