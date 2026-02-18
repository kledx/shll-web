"use client";

import { useState, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════
//                   Types
// ═══════════════════════════════════════════════════════

export interface SafetyConfig {
    tokenId: string;
    allowedTokens: string[];
    blockedTokens: string[];
    maxTradeAmount: string;
    maxDailyAmount: string;
    maxSlippageBps: number;
    cooldownSeconds: number;
    maxRunsPerDay: number;
    allowedDexes: string[];
}

export interface SafetyConfigState {
    config: SafetyConfig | null;
    isLoading: boolean;
    isDefault: boolean;
    isSaving: boolean;
    error: string | null;
    saveError: string | null;
    save: (updates: Partial<SafetyConfig>) => Promise<boolean>;
    reset: () => Promise<boolean>;
    refetch: () => void;
}

// ═══════════════════════════════════════════════════════
//                   Hook
// ═══════════════════════════════════════════════════════

export function useSafetyConfig(tokenId: string): SafetyConfigState {
    const [config, setConfig] = useState<SafetyConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDefault, setIsDefault] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [fetchTrigger, setFetchTrigger] = useState(0);

    // ── Fetch config ──
    useEffect(() => {
        if (!tokenId) return;

        let cancelled = false;
        setIsLoading(true);
        setError(null);

        fetch(`/api/safety-config?tokenId=${tokenId}`)
            .then(async (res) => {
                if (cancelled) return;
                const data = await res.json();
                if (!res.ok) throw new Error(data.error ?? "Failed to load");
                setConfig(data.config);
                setIsDefault(data.isDefault ?? false);
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err.message);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => { cancelled = true; };
    }, [tokenId, fetchTrigger]);

    // ── Save config ──
    const save = useCallback(async (updates: Partial<SafetyConfig>): Promise<boolean> => {
        setIsSaving(true);
        setSaveError(null);

        try {
            const res = await fetch(`/api/safety-config?tokenId=${tokenId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            const data = await res.json();

            if (!res.ok) {
                setSaveError(data.error ?? "Failed to save");
                return false;
            }

            // Refresh after save
            setConfig(data.config);
            setIsDefault(false);
            return true;
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Network error");
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [tokenId]);

    // ── Reset config ──
    const reset = useCallback(async (): Promise<boolean> => {
        setIsSaving(true);
        setSaveError(null);

        try {
            const res = await fetch(`/api/safety-config?tokenId=${tokenId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const data = await res.json();
                setSaveError(data.error ?? "Failed to reset");
                return false;
            }

            // Refresh after reset
            setFetchTrigger((n) => n + 1);
            return true;
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Network error");
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [tokenId]);

    const refetch = useCallback(() => setFetchTrigger((n) => n + 1), []);

    return { config, isLoading, isDefault, isSaving, error, saveError, save, reset, refetch };
}
