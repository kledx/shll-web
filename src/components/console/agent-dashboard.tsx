"use client";

import { useAgentDashboard } from "@/hooks/useAgentDashboard";
import { useAgentSummary } from "@/hooks/useAgentSummary";
import { Activity, CheckCircle, XCircle, Clock, TrendingUp, Loader2, BarChart3 } from "lucide-react";

interface AgentDashboardProps {
    tokenId: string;
    refreshKey?: number;
    language?: "en" | "zh";
}

const copy = {
    en: {
        title: "Agent Dashboard",
        totalRuns: "Total Runs",
        successRuns: "Successful",
        failedRuns: "Failed",
        latestRun: "Latest Run",
        strategy: "Active Strategy",
        noStrategy: "No strategy configured",
        strategyType: "Type",
        interval: "Interval",
        enabled: "Enabled",
        disabled: "Disabled",

        loading: "Loading dashboard...",
        error: "Failed to load dashboard",
        never: "Never",
        reason: "Reason",
        onChain: "On-Chain Stats",
        onChainExecs: "On-Chain Execs",
        successRate: "Success Rate",
        agentType: "Agent Type",
        nextCheck: "Next Check",
        taskDone: "Task Done",
        currentGoal: "Current Goal",
        standby: "Standby — no active instruction",
    },
    zh: {
        title: "Agent 仪表盘",
        totalRuns: "总执行",
        successRuns: "成功",
        failedRuns: "失败",
        latestRun: "最近执行",
        strategy: "当前策略",
        noStrategy: "未配置策略",
        strategyType: "类型",
        interval: "间隔",
        enabled: "已启用",
        disabled: "已停用",

        loading: "加载仪表盘中...",
        error: "加载仪表盘失败",
        never: "从未",
        reason: "原因",
        onChain: "链上统计",
        onChainExecs: "链上执行",
        successRate: "成功率",
        agentType: "Agent 类型",
        nextCheck: "下次检查",
        taskDone: "任务完成",
        currentGoal: "当前指令",
        standby: "待命 — 无活跃指令",
    },
};

function formatInterval(ms: number): string {
    if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
    if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
    return `${(ms / 3_600_000).toFixed(1)}h`;
}

function formatTimeAgo(iso: string, lang: "en" | "zh"): string {
    const diff = Date.now() - new Date(iso).getTime();
    if (isNaN(diff)) return "N/A";
    if (diff < 60_000) return lang === "en" ? "just now" : "刚刚";
    if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)}h ago`;
    return `${Math.round(diff / 86_400_000)}d ago`;
}

function formatTimeUntil(iso: string, lang: "en" | "zh"): string {
    const diff = new Date(iso).getTime() - Date.now();
    if (diff <= 0) return lang === "en" ? "now" : "现在";
    if (diff < 60_000) return `${Math.round(diff / 1000)}s`;
    if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m`;
    if (diff < 86_400_000) return `${(diff / 3_600_000).toFixed(1)}h`;
    return `${Math.round(diff / 86_400_000)}d`;
}



export function AgentDashboard({ tokenId, refreshKey = 0, language = "en" }: AgentDashboardProps) {
    const { data, error, isLoading } = useAgentDashboard(tokenId, refreshKey);
    const { data: summary } = useAgentSummary(tokenId);
    const t = copy[language];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-[var(--color-muted-foreground)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.loading}
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {t.error}: {error?.message || "No data"}
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                    icon={<Activity className="h-4 w-4" />}
                    label={t.totalRuns}
                    value={data.stats.totalRuns.toLocaleString()}
                    color="text-[var(--color-primary)]"
                />
                <StatCard
                    icon={<CheckCircle className="h-4 w-4" />}
                    label={t.successRuns}
                    value={data.stats.successRuns.toLocaleString()}
                    color="text-emerald-600"
                />
                <StatCard
                    icon={<XCircle className="h-4 w-4" />}
                    label={t.failedRuns}
                    value={data.stats.failedRuns.toLocaleString()}
                    color="text-red-500"
                />
                <StatCard
                    icon={<Clock className="h-4 w-4" />}
                    label={t.latestRun}
                    value={data.stats.latestRunAt ? formatTimeAgo(data.stats.latestRunAt, language) : t.never}
                    color="text-[var(--color-muted-foreground)]"
                />
            </div>

            {/* On-Chain Stats hidden — most LLM decisions never go on-chain (P-2026-018) */}


            {/* Strategy Card */}
            <div className="rounded-xl border border-[var(--color-border)] bg-white/60 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-foreground)]">
                    <TrendingUp className="h-4 w-4 text-[var(--color-primary)]" />
                    {t.strategy}
                </div>
                {data.strategy ? (
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="text-[var(--color-muted-foreground)]">{t.strategyType}</div>
                        <div className="font-medium">{data.strategy.strategyType === "llm_trader" ? "LLM Trader" : data.strategy.strategyType === "llm_defi" ? "LLM DeFi" : data.strategy.strategyType}</div>
                        <div className="text-[var(--color-muted-foreground)]">Status</div>
                        <div>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${data.strategy.enabled
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                                }`}>
                                {data.strategy.enabled ? t.enabled : t.disabled}
                            </span>
                        </div>
                        {data.strategy.enabled && data.strategy.nextCheckAt && (
                            <>
                                <div className="text-[var(--color-muted-foreground)]">{t.nextCheck}</div>
                                <div className="font-medium">
                                    {formatTimeUntil(data.strategy.nextCheckAt, language)}
                                </div>
                            </>
                        )}
                        {/* Current Goal */}
                        <div className="col-span-2 mt-1 pt-2 border-t border-[var(--color-border)]">
                            <div className="text-xs text-[var(--color-muted-foreground)] mb-1">{t.currentGoal}</div>
                            {(data.strategy.strategyParams?.tradingGoal as string) ? (
                                <div className="text-sm font-medium text-violet-700 bg-violet-50 rounded-lg px-3 py-1.5 line-clamp-2">
                                    {data.strategy.strategyParams.tradingGoal as string}
                                </div>
                            ) : (
                                <div className="text-sm text-[var(--color-muted-foreground)] italic">{t.standby}</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{t.noStrategy}</p>
                )}
            </div>

        </div>
    );
}

function StatCard({
    icon, label, value, color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
}) {
    return (
        <div className="rounded-xl border border-[var(--color-border)] bg-white/60 p-3">
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
                <span className={color}>{icon}</span>
                {label}
            </div>
            <div className={`mt-1 text-lg font-bold ${color}`}>{value}</div>
        </div>
    );
}
