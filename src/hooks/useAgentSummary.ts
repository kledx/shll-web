"use client";

import { useCallback, useEffect, useState } from "react";

export interface AgentSummary {
    tokenId: string;
    totalExecutions: number;
    successRate: number;
    successCount: number;
    failCount: number;
    lastExecution: string | null;
}

/**
 * Fetch aggregated execution stats from the Indexer API.
 * Endpoint: Indexer /api/agents/:tokenId/summary (proxied via Next.js API)
 */
export function useAgentSummary(tokenId: string | undefined) {
    const [data, setData] = useState<AgentSummary | undefined>();
    const [error, setError] = useState<Error | undefined>();
    const [isLoading, setIsLoading] = useState(false);

    const fetchSummary = useCallback(async () => {
        if (!tokenId) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/agent-summary?tokenId=${tokenId}`, { cache: "no-store" });
            if (!res.ok) throw new Error(`Summary fetch failed: ${res.status}`);
            const json = await res.json();
            setData(json);
            setError(undefined);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setIsLoading(false);
        }
    }, [tokenId]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    return { data, error, isLoading, mutate: fetchSummary };
}
