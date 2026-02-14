"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { getConsoleCopy } from "@/lib/console/console-copy";

interface ActivityItem {
    id: string;
    origin: "indexer" | "runner";
    actionType: string;
    success: boolean;
    txHash: string | null;
    target: string | null;
    selector: string | null;
    error: string | null;
    blockNumber: string | null;
    timestamp: string;
}

interface ActivityResponse {
    ok: boolean;
    source: "indexer" | "runner-fallback";
    degraded: boolean;
    reason?: string;
    items: ActivityItem[];
}

export function TransactionHistory({
    tokenId,
    nfaAddress,
    refreshKey = 0,
}: {
    tokenId: string;
    nfaAddress?: string;
    refreshKey?: number;
}) {
    const { t, language } = useTranslation();
    const ui = getConsoleCopy(language).history;
    const [items, setItems] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [degraded, setDegraded] = useState(false);
    const [degradedReason, setDegradedReason] = useState<string | null>(null);
    const txExplorerBaseUrl = (process.env.NEXT_PUBLIC_EXPLORER_TX_BASE_URL || "https://testnet.bscscan.com/tx").replace(/\/$/, "");

    const formatTime = (ts: string) => {
        const value = Number(ts);
        if (!Number.isFinite(value) || value <= 0) return "-";
        return new Date(value * 1000).toLocaleString();
    };

    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();

        const fetchLogs = async (silent = false) => {
            try {
                if (!silent) setIsLoading(true);
                const query = new URLSearchParams({
                    tokenId,
                    limit: "10",
                });
                if (nfaAddress) {
                    query.set("nfa", nfaAddress);
                }
                const res = await fetch(`/api/activity?${query.toString()}`, {
                    cache: "no-store",
                    signal: controller.signal,
                });
                if (!res.ok) {
                    throw new Error(`Activity API failed: ${res.status}`);
                }
                const data = (await res.json()) as ActivityResponse;
                if (cancelled) return;
                const normalized = [...(data.items || [])].sort(
                    (a, b) => Number(b.timestamp) - Number(a.timestamp)
                );
                setItems(normalized);
                setDegraded(Boolean(data.degraded));
                setDegradedReason(data.reason || null);
            } catch (err: unknown) {
                if (!cancelled) {
                    console.warn("TransactionHistory: Unexpected error", err);
                    setItems([]);
                    setDegraded(true);
                    setDegradedReason(err instanceof Error ? err.message : "Activity unavailable");
                }
            } finally {
                if (!cancelled && !silent) setIsLoading(false);
            }
        };

        void fetchLogs();
        const interval = setInterval(() => {
            void fetchLogs(true);
        }, 15000);

        return () => {
            cancelled = true;
            controller.abort();
            clearInterval(interval);
        };
    }, [tokenId, nfaAddress, refreshKey]);

    if (isLoading) {
        return (
            <Card className="border-[var(--color-burgundy)]/10">
                <CardHeader>
                    <CardTitle className="text-lg">{t.agent.console.history.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {ui.loading}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (items.length === 0) {
        return (
            <Card className="border-[var(--color-burgundy)]/10">
                <CardHeader>
                    <CardTitle className="text-lg">{t.agent.console.history.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    {degraded && (
                        <p className="mb-2 text-xs text-amber-700">
                            {ui.degradedPrefix} {degradedReason || ui.degradedDefault}
                        </p>
                    )}
                    <p className="text-sm text-muted-foreground">{t.agent.console.history.empty}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-[var(--color-burgundy)]/10">
            <CardHeader>
                <CardTitle className="text-lg">{t.agent.console.history.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {degraded && (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        {ui.degradedPrefix} {degradedReason || ui.degradedDefault}
                    </div>
                )}
                {items.map((log) => (
                    <div
                        key={log.id}
                        className="flex flex-col gap-2 p-3 bg-[var(--color-paper)]/50 rounded-lg border sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex items-center gap-3">
                            {log.success ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <div>
                                <div className="text-sm font-bold font-mono">
                                    {log.actionType}
                                    {log.target ? ` -> ${log.target}` : ""}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {formatTime(log.timestamp)}
                                    {log.blockNumber ? ` | ${t.agent.console.history.block} ${log.blockNumber}` : ""}
                                    {` | ${log.origin === "indexer" ? ui.sourceIndexer : ui.sourceRunner}`}
                                </div>
                                {log.error && (
                                    <div className="text-xs text-red-600 break-all max-w-[22rem]">{log.error}</div>
                                )}
                            </div>
                        </div>
                        <div className="text-left sm:text-right">
                            {log.txHash ? (
                                <a
                                    href={`${txExplorerBaseUrl}/${log.txHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-[var(--color-sky)] hover:underline"
                                >
                                    {log.txHash.slice(0, 10)}...
                                </a>
                            ) : (
                                <span className="text-xs text-muted-foreground">{ui.txUnavailable}</span>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
