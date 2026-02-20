"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Loader2,
    CheckCircle2,
    XCircle,
    PauseCircle,
    Brain,
    ShieldAlert,
    Target,
    Clock,
} from "lucide-react";
import { IS_MAINNET } from "@/config/wagmi";

const explorerTxBase = IS_MAINNET
    ? "https://bscscan.com/tx"
    : "https://testnet.bscscan.com/tx";

// ═══════════════════════════════════════════════════════
//                      Types
// ═══════════════════════════════════════════════════════

interface ActivityRecord {
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
    decisionMessage?: string;
    createdAt: string;
}

interface ActivityResponse {
    ok: boolean;
    tokenId: string;
    total: number;
    items: ActivityRecord[];
}

// ═══════════════════════════════════════════════════════
//                  Intent Helpers
// ═══════════════════════════════════════════════════════

type DecisionKind = "wait" | "action" | "blocked" | "error";

function classifyDecision(item: ActivityRecord): DecisionKind {
    if (item.error) return item.intentType === "error" ? "error" : "blocked";
    if (item.intentType === "wait") return "wait";
    if (item.txHash) return "action";
    if (!item.simulateOk) return "blocked";
    return "wait";
}

function decisionIcon(kind: DecisionKind) {
    switch (kind) {
        case "action":
            return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
        case "wait":
            return <PauseCircle className="w-4 h-4 text-slate-400 shrink-0" />;
        case "blocked":
            return <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />;
        case "error":
            return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
    }
}

function decisionLabel(kind: DecisionKind, lang: "en" | "zh") {
    const labels: Record<DecisionKind, { en: string; zh: string }> = {
        action: { en: "Executed", zh: "已执行" },
        wait: { en: "Wait", zh: "等待" },
        blocked: { en: "Blocked", zh: "已阻止" },
        error: { en: "Error", zh: "错误" },
    };
    return labels[kind][lang];
}

function intentLabel(intent: string | undefined) {
    if (!intent) return "";
    const map: Record<string, string> = {
        swap: "Swap",
        approve: "Approve",
        wait: "Wait",
        wrap: "Wrap",
        analytics: "Analytics",
        portfolio: "Portfolio",
        error: "Error",
    };
    return map[intent] || intent;
}

// ═══════════════════════════════════════════════════════
//                    Time Formatter
// ═══════════════════════════════════════════════════════

function formatRelativeTime(isoOrTs: string) {
    const d = new Date(isoOrTs);
    if (Number.isNaN(d.getTime())) return isoOrTs;
    const diffS = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
    if (diffS < 60) return `${diffS}s ago`;
    if (diffS < 3600) return `${Math.floor(diffS / 60)}m ago`;
    if (diffS < 86400) return `${Math.floor(diffS / 3600)}h ago`;
    return d.toLocaleDateString();
}

// ═══════════════════════════════════════════════════════
//                    Component
// ═══════════════════════════════════════════════════════

export function AgentActivityFeed({
    tokenId,
    refreshKey = 0,
    language = "en",
}: {
    tokenId: string;
    refreshKey?: number;
    language?: "en" | "zh";
}) {
    const [items, setItems] = useState<ActivityRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fetchActivity = useCallback(
        async (silent = false) => {
            try {
                if (!silent) setIsLoading(true);
                const params = new URLSearchParams({ tokenId, limit: "20" });
                const res = await fetch(`/api/agent/activity?${params.toString()}`, {
                    cache: "no-store",
                });
                if (!res.ok) throw new Error(`API ${res.status}`);
                const data = (await res.json()) as ActivityResponse;
                setItems(data.items ?? []);
                setTotal(data.total ?? 0);
                setErrorMsg(null);
            } catch (err: unknown) {
                if (!silent) {
                    setErrorMsg(err instanceof Error ? err.message : "Unknown error");
                    setItems([]);
                }
            } finally {
                if (!silent) setIsLoading(false);
            }
        },
        [tokenId],
    );

    useEffect(() => {
        let cancelled = false;
        const run = async (silent: boolean) => {
            if (cancelled) return;
            await fetchActivity(silent);
        };

        void run(false);
        const timer = setInterval(() => void run(true), 15_000);

        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, [fetchActivity, refreshKey]);

    const title = language === "zh" ? "AI 思考日志" : "AI Reasoning Log";
    const emptyText = language === "zh" ? "暂无推理记录。" : "No reasoning records yet.";
    const totalLabel = language === "zh" ? "条推理记录" : "decisions total";

    // Loading state
    if (isLoading) {
        return (
            <Card className="border-[var(--color-burgundy)]/10">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {language === "zh" ? "加载中..." : "Loading..."}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Error state
    if (errorMsg) {
        return (
            <Card className="border-[var(--color-burgundy)]/10">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-red-600">{errorMsg}</p>
                </CardContent>
            </Card>
        );
    }

    // Empty state
    if (items.length === 0) {
        return (
            <Card className="border-[var(--color-burgundy)]/10">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{emptyText}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-[var(--color-burgundy)]/10">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        {title}
                    </CardTitle>
                    <span className="text-sm text-muted-foreground tabular-nums">
                        {total} {totalLabel}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-0">
                {/* Timeline — show latest 5 */}
                <div className="relative pl-6 max-h-[420px] overflow-y-auto">
                    {/* Vertical line */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--color-border)]" />

                    {items.slice(0, 5).map((item, idx) => {
                        const kind = classifyDecision(item);
                        const isLast = idx === items.length - 1;
                        return (
                            <div
                                key={item.id}
                                className={`relative flex gap-3 ${isLast ? "pb-0" : "pb-4"}`}
                            >
                                {/* Timeline dot */}
                                <div className="absolute -left-6 top-0.5 flex items-center justify-center w-[15px]">
                                    {decisionIcon(kind)}
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {/* Decision badge */}
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium ${kind === "action"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : kind === "wait"
                                                    ? "bg-slate-100 text-slate-600"
                                                    : kind === "blocked"
                                                        ? "bg-amber-50 text-amber-700"
                                                        : "bg-red-50 text-red-700"
                                                }`}
                                        >
                                            {decisionLabel(kind, language)}
                                        </span>

                                        {/* Intent type */}
                                        {item.intentType && item.intentType !== "wait" && (
                                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                                <Target className="w-3 h-3" />
                                                {intentLabel(item.intentType)}
                                            </span>
                                        )}

                                        {/* Brain type */}
                                        {item.brainType && (
                                            <span className="text-sm text-muted-foreground/60 font-mono">
                                                [{item.brainType}]
                                            </span>
                                        )}

                                        {/* Timestamp */}
                                        <span className="ml-auto text-sm text-muted-foreground flex items-center gap-1 shrink-0">
                                            <Clock className="w-3 h-3" />
                                            {formatRelativeTime(item.createdAt)}
                                        </span>
                                    </div>

                                    {/* Reasoning */}
                                    {(item.decisionMessage || item.decisionReason) && (
                                        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                                            {item.decisionMessage || item.decisionReason}
                                        </p>
                                    )}

                                    {/* Error detail */}
                                    {item.error && kind !== "wait" && (
                                        <p className="mt-1 text-sm text-red-600 break-all line-clamp-2">
                                            {item.error}
                                        </p>
                                    )}

                                    {/* TX hash */}
                                    {item.txHash && (
                                        <a
                                            href={`${explorerTxBase}/${item.txHash}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-1 inline-block text-sm text-[var(--color-sky)] hover:underline font-mono"
                                        >
                                            tx: {item.txHash.slice(0, 10)}...
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
