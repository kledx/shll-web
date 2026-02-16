"use client";

import { useCallback, useEffect, useState } from "react";

export interface RunnerAutopilotStatus {
    tokenId: string;
    runnerOperator?: string;
    onchainOperator?: string;
    operatorExpires?: string;
    renter?: string;
    renterExpires?: string;
    autopilot?: {
        enabled?: boolean;
        operator?: string;
        permitExpires?: string;
        lastReason?: string;
        updatedAt?: string;
    };
    // V1.4.1 fields
    paramsHash?: string;
    strategyId?: string;
    runs?: Array<{
        id: string;
        actionType?: string;
        simulateOk?: boolean;
        txHash?: string;
        error?: string;
        createdAt?: string;
        // V1.4.1 enhanced fields
        paramsHash?: string;
        strategyExplain?: string;
        failureCategory?: string;
    }>;
}

export function useAutopilotStatus(tokenId: string, nfaAddress?: string, refreshKey = 0) {
    const [data, setData] = useState<RunnerAutopilotStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = useCallback(async (silent = false) => {
        if (!tokenId || !/^\d+$/.test(tokenId)) return;
        try {
            if (!silent) setIsLoading(true);
            setError(null);
            const params = new URLSearchParams({
                tokenId,
                runsLimit: "10",
            });
            if (nfaAddress) {
                params.set("nfaAddress", nfaAddress);
            }
            const res = await fetch(`/api/autopilot/status?${params.toString()}`, {
                cache: "no-store",
            });
            if (!res.ok) {
                throw new Error(`status ${res.status}`);
            }
            const body = (await res.json()) as RunnerAutopilotStatus;
            setData(body);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load autopilot status");
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, [tokenId, nfaAddress]);

    useEffect(() => {
        let cancelled = false;

        const initial = async () => {
            await fetchStatus(false);
            if (cancelled) return;
        };
        void initial();

        const timer = setInterval(() => {
            if (cancelled) return;
            void fetchStatus(true);
        }, 15000);

        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, [fetchStatus, refreshKey]);

    return {
        data,
        isLoading,
        error,
        refresh: () => fetchStatus(false),
    };
}
