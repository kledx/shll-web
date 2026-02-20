"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Activity } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { getConsoleCopy } from "@/lib/console/console-copy";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { IS_MAINNET } from "@/config/wagmi";

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

// ═══════════════════════════════════════════════════════
//            Human-readable error simplifier
// ═══════════════════════════════════════════════════════

function humanizeError(raw: string | null): string | null {
    if (!raw) return null;

    // Pattern: "Simulation reverted: The contract function "X" reverted..."
    if (raw.includes("Simulation reverted")) {
        const fnMatch = raw.match(/function\s+"(\w+)"/);
        const fnName = fnMatch?.[1] ?? "contract";
        return `Simulation failed: ${fnName}() call was rejected by the policy contract. The transaction was not submitted on-chain.`;
    }

    // Pattern: "execution reverted" (generic)
    if (/execution reverted/i.test(raw) && !raw.includes("Simulation")) {
        return "Transaction reverted on-chain. The operation was rejected by the contract.";
    }

    // Pattern: gas related
    if (/insufficient funds|gas/i.test(raw)) {
        return "Insufficient gas or funds. The runner operator needs more BNB to execute.";
    }

    // Pattern: nonce
    if (/nonce/i.test(raw)) {
        return "Transaction nonce conflict. A previous transaction may still be pending.";
    }

    // Pattern: timeout
    if (/timeout|timed out|ETIMEDOUT/i.test(raw)) {
        return "RPC request timed out. The network may be congested.";
    }

    // Pattern: rate limit
    if (/429|rate.?limit/i.test(raw)) {
        return "RPC rate limit reached. Too many requests to the blockchain node.";
    }

    // If still long (>120 chars), truncate sensibly
    if (raw.length > 120) {
        return `${raw.slice(0, 117)}...`;
    }

    return raw;
}

// Humanize action type display
function humanizeAction(actionType: string, target: string | null, lang = "en"): string {
    const actionMap: Record<string, Record<string, string>> = {
        auto: { en: "Autopilot", zh: "自动执行" },
        manual: { en: "Manual", zh: "手动" },
        execute: { en: "Execute", zh: "执行" },
        swap: { en: "Swap", zh: "兑换" },
        approve: { en: "Approve", zh: "授权" },
        wrap: { en: "Wrap", zh: "包装" },
        transfer: { en: "Transfer", zh: "转账" },
        deposit: { en: "Deposit", zh: "存入" },
        withdraw: { en: "Withdraw", zh: "提取" },
    };
    const entry = actionMap[actionType];
    const label = entry ? (entry[lang] || entry.en) : actionType;
    if (target) {
        const shortAddr = `${target.slice(0, 6)}...${target.slice(-4)}`;
        return `${label} → ${shortAddr}`;
    }
    return label;
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
    const txExplorerBaseUrl = getRuntimeEnv("NEXT_PUBLIC_EXPLORER_TX_BASE_URL", IS_MAINNET ? "https://bscscan.com/tx" : "https://testnet.bscscan.com/tx").replace(/\/$/, "");

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
                    limit: "5",
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

    const title = language === "zh" ? "链上交易" : "On-chain Transactions";

    if (isLoading) {
        return (
            <Card className="border-[var(--color-burgundy)]/10">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        {title}
                    </CardTitle>
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
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {degraded && (
                        <p className="mb-2 text-sm text-amber-700">
                            {ui.degradedPrefix} {degradedReason || ui.degradedDefault}
                        </p>
                    )}
                    <p className="text-sm text-muted-foreground">{t.agent.console.history.empty}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-[var(--color-burgundy)]/10 overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
                {degraded && (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        {ui.degradedPrefix} {degradedReason || ui.degradedDefault}
                    </div>
                )}
                {items.map((log) => {
                    const friendlyError = humanizeError(log.error);
                    return (
                        <div
                            key={log.id}
                            className="flex flex-col gap-2 p-3 bg-[var(--color-paper)]/50 rounded-lg border sm:flex-row sm:items-center sm:justify-between overflow-hidden"
                        >
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                                {log.success ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                                )}
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold">
                                        {humanizeAction(log.actionType, log.target, language)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {formatTime(log.timestamp)}
                                        {log.blockNumber ? ` | ${t.agent.console.history.block} ${log.blockNumber}` : ""}
                                        {` | ${log.origin === "indexer" ? ui.sourceIndexer : ui.sourceRunner}`}
                                    </div>
                                    {friendlyError && (
                                        <div className="mt-1 text-sm text-red-600 leading-relaxed break-words">
                                            {friendlyError}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-left sm:text-right shrink-0">
                                {log.txHash ? (
                                    <a
                                        href={`${txExplorerBaseUrl}/${log.txHash}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm text-[var(--color-sky)] hover:underline font-mono"
                                    >
                                        {log.txHash.slice(0, 10)}...
                                    </a>
                                ) : (
                                    <span className="text-sm text-muted-foreground">{ui.txUnavailable}</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
