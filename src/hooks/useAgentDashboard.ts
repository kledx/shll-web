"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface DashboardStats {
    totalRuns: number;
    successRuns: number;
    failedRuns: number;
    latestRunAt: string | null;
}

interface RunRecord {
    id: string;
    tokenId: string;
    actionType: string;
    actionHash: string;
    simulateOk: boolean;
    txHash?: string;
    error?: string;
    brainType?: string;
    intentType?: string;
    decisionReason?: string;
    strategyExplain?: string;
    createdAt: string;
}

interface StrategyRecord {
    tokenId: string;
    strategyType: string;
    enabled: boolean;
    failureCount: number;
    maxFailures: number;
    minIntervalMs: number;
    lastRunAt?: string;
    lastError?: string;
    nextCheckAt?: string;
    updatedAt?: string;
    strategyParams: Record<string, unknown>;
}

interface AutopilotRecord {
    tokenId: string;
    enabled: boolean;
    lastReason?: string;
}

export interface DashboardData {
    autopilot: AutopilotRecord | null;
    strategy: StrategyRecord | null;
    stats: DashboardStats;
    recentRuns: RunRecord[];
}

export function useAgentDashboard(tokenId: string | undefined, refreshKey = 0) {
    const [data, setData] = useState<DashboardData | undefined>();
    const [error, setError] = useState<Error | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchDashboard = useCallback(async () => {
        if (!tokenId) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/agent/dashboard?tokenId=${tokenId}`, { cache: "no-store" });
            if (!res.ok) throw new Error(`Dashboard fetch failed: ${res.status}`);
            const json = await res.json();
            if (!json.ok) throw new Error(json.error || "Unknown error");
            setData({
                autopilot: json.autopilot,
                strategy: json.strategy,
                stats: json.stats,
                recentRuns: json.recentRuns,
            });
            setError(undefined);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setIsLoading(false);
        }
    }, [tokenId]);

    // Fetch on mount and when tokenId or refreshKey changes
    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard, refreshKey]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        intervalRef.current = setInterval(fetchDashboard, 30_000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchDashboard]);

    const mutate = useCallback(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return { data, error, isLoading, mutate };
}
